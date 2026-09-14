const e=`---\r
title: Design an LRU and LFU Cache\r
description: Build an O(1) LRU cache with a hash map and doubly linked list, then extend the same skeleton to LFU with frequency buckets and thread safety\r
difficulty: Core\r
tags: [caching, lru, lfu, data-structures, concurrency]\r
---\r
\r
An LRU cache is the single most common data-structure design question because it forces you to combine two structures to beat the O(n) cost of either one alone. LFU is the natural follow-up that tests whether you can generalise the same skeleton to a different eviction rule.\r
\r
## Requirements\r
\r
### Functional\r
\r
- \`Get(key)\` returns the value or a miss signal, and counts as a "use" of that key.\r
- \`Put(key, value)\` inserts or updates; if the cache is full, evict according to policy before inserting.\r
- Both operations must be O(1) average time.\r
- LRU evicts the **least recently used** key; LFU evicts the **least frequently used** key, breaking ties by recency.\r
\r
### Non-functional and assumptions\r
\r
- Fixed capacity, set at construction, does not grow dynamically.\r
- Single process, in-memory — no persistence, no cross-node replication in the base design.\r
- Reads and writes may come from multiple threads; correctness under concurrency is a first-class requirement, not an afterthought.\r
- Values are reasonably small; we are bounding by **entry count** first, with memory-size bounding as a named extension.\r
\r
### Clarifying questions to ask\r
\r
> [!TIP]\r
> Asking these up front is what separates a candidate who "knows LRU" from one who can design a cache. It also lets you scope the 30 minutes you have.\r
\r
- Is the eviction policy fixed, or should it be swappable (LRU vs LFU vs TTL) without rewriting the cache?\r
- Do entries need to expire on a timer (TTL) independent of eviction?\r
- Is thread safety required, and what is the concurrency level — light contention or a hot path from hundreds of threads?\r
- Should capacity be counted in **number of entries** or **bytes of memory**?\r
- Is this cache local to one process, or does it need to behave consistently across a fleet of nodes?\r
\r
## Core objects\r
\r
| Class | Responsibility | Key fields/methods |\r
|---|---|---|\r
| \`ICache<TKey,TValue>\` | Public contract, independent of eviction policy | \`Get(key)\`, \`Put(key, value)\` |\r
| \`LruCache<TKey,TValue>\` | O(1) LRU via hash map + doubly linked list | \`_map\`, \`_order\` (linked list), \`Get\`, \`Put\` |\r
| \`LfuCache<TKey,TValue>\` | O(1) LFU via frequency buckets | \`_map\`, \`_freqBuckets\`, \`_minFreq\`, \`Get\`, \`Put\` |\r
| \`CacheNode<TKey,TValue>\` | One entry; carries key, value, frequency | \`Key\`, \`Value\`, \`Frequency\` |\r
| \`ExpiringCacheDecorator\` | Adds TTL on top of any \`ICache\` | \`_ttl\`, \`_expiryMap\`, wraps \`Get\`/\`Put\` |\r
| \`ShardedCache<TKey,TValue>\` | Thread-safe variant, striped locking | \`_shards[]\`, \`HashToShard(key)\` |\r
\r
## Class design\r
\r
\`\`\`mermaid\r
classDiagram\r
    class ICache~TKey, TValue~ {\r
        <<interface>>\r
        +Get(key) TValue\r
        +Put(key, value) void\r
    }\r
    class LruCache~TKey, TValue~ {\r
        -Dictionary map\r
        -LinkedList order\r
        -int capacity\r
        +Get(key) TValue\r
        +Put(key, value) void\r
        -Evict() void\r
    }\r
    class LfuCache~TKey, TValue~ {\r
        -Dictionary map\r
        -Dictionary freqBuckets\r
        -int minFreq\r
        +Get(key) TValue\r
        +Put(key, value) void\r
        -IncreaseFrequency(node) void\r
    }\r
    class CacheNode~TKey, TValue~ {\r
        +TKey Key\r
        +TValue Value\r
        +int Frequency\r
    }\r
    class ShardedCache~TKey, TValue~ {\r
        -ICache[] shards\r
        +Get(key) TValue\r
        +Put(key, value) void\r
    }\r
    ICache <|.. LruCache\r
    ICache <|.. LfuCache\r
    ICache <|.. ShardedCache\r
    LruCache "1" --> "many" CacheNode\r
    LfuCache "1" --> "many" CacheNode\r
    ShardedCache "1" --> "many" ICache : owns shards\r
\`\`\`\r
\r
## Eviction policies compared\r
\r
| Policy | Evicts | Data structure | Get/Put | Good for |\r
|---|---|---|---|---|\r
| LRU | Least recently used | Hash map + doubly linked list | O(1) | Recency-biased access (web sessions, recently viewed) |\r
| LFU | Least frequently used | Hash map + frequency buckets | O(1) | Stable "hot set" that repeats often (popular product pages) |\r
| FIFO | Oldest inserted | Hash map + queue | O(1) | Simplicity, when access pattern is uniform |\r
| Random | Any entry | Hash map + array | O(1) | Cheap approximation at very large scale (Redis default) |\r
\r
> [!KEY]\r
> Both LRU and LFU solve the same underlying problem: a hash map gives O(1) lookup but no ordering, and a list/queue gives ordering but O(n) lookup. The trick in every eviction policy is to store a **pointer from the map directly into the ordered structure** so both operations stay O(1).\r
\r
LFU's extra trick is the **frequency bucket list**: instead of a heap (O(log n) per update), keep one doubly linked list per frequency count, plus a \`minFrequency\` pointer. Incrementing a key's frequency is an O(1) unlink-from-bucket-N / link-into-bucket-N+1, and eviction always pops from the bucket at \`minFrequency\`.\r
\r
## Key design decisions\r
\r
### Strategy pattern for eviction policy, not an \`if/else\` on a policy enum\r
\r
\`ICache<TKey,TValue>\` is the strategy interface; \`LruCache\` and \`LfuCache\` are interchangeable implementations. The rejected alternative is a single \`Cache\` class with an \`EvictionPolicy\` enum and branching logic in \`Put\` — that couples unrelated eviction algorithms into one class and makes adding TTL-based eviction a merge conflict waiting to happen.\r
\r
### Sentinel head/tail nodes instead of null-checked links\r
\r
The linked list uses dummy head and tail nodes so \`AddFirst\`/\`RemoveLast\` never check for null neighbours. The alternative — a real head/tail with null checks scattered through every insert/remove — is where most LRU cache bugs during interviews come from (off-by-one on the last remaining node).\r
\r
### Frequency buckets instead of a heap for LFU\r
\r
| Approach | Update on access | Evict | Notes |\r
|---|---|---|---|\r
| Min-heap keyed by frequency | O(log n) | O(log n) | Simple to reason about, still passes most interviews |\r
| Frequency-bucket lists (chosen) | O(1) | O(1) | Needs the \`minFrequency\` invariant maintained carefully |\r
\r
The bucket approach is the "hard mode" answer that shows mastery; leading with the heap and mentioning the O(1) upgrade is a perfectly good sequence to narrate live.\r
\r
### Striped (sharded) locking instead of one global lock\r
\r
A single \`lock\` around \`Get\`/\`Put\` is correct but serialises every request through one mutex. Splitting the key space into N shards, each with its own cache and lock, lets unrelated keys proceed in parallel. The rejected alternative — a single \`ConcurrentDictionary\` — does not work by itself because moving a node to the front of the LRU list is not an atomic operation the collection understands.\r
\r
## Implementation\r
\r
\`\`\`csharp\r
public interface ICache<TKey, TValue>\r
{\r
    bool TryGet(TKey key, out TValue value);\r
    void Put(TKey key, TValue value);\r
}\r
\r
public class LruCache<TKey, TValue> : ICache<TKey, TValue>\r
{\r
    private class Node { public TKey Key; public TValue Value; public Node Prev, Next; }\r
\r
    private readonly int _capacity;\r
    private readonly Dictionary<TKey, Node> _map = new();\r
    private readonly Node _head = new(), _tail = new(); // sentinels\r
\r
    public LruCache(int capacity)\r
    {\r
        _capacity = capacity;\r
        _head.Next = _tail;\r
        _tail.Prev = _head;\r
    }\r
\r
    public bool TryGet(TKey key, out TValue value)\r
    {\r
        if (!_map.TryGetValue(key, out var node)) { value = default!; return false; }\r
        MoveToFront(node);\r
        value = node.Value;\r
        return true;\r
    }\r
\r
    public void Put(TKey key, TValue value)\r
    {\r
        if (_map.TryGetValue(key, out var existing))\r
        {\r
            existing.Value = value;\r
            MoveToFront(existing);\r
            return;\r
        }\r
\r
        if (_map.Count >= _capacity)\r
        {\r
            var lru = _tail.Prev!;\r
            Unlink(lru);\r
            _map.Remove(lru.Key);\r
        }\r
\r
        var node = new Node { Key = key, Value = value };\r
        _map[key] = node;\r
        AddFirst(node);\r
    }\r
\r
    private void MoveToFront(Node node) { Unlink(node); AddFirst(node); }\r
\r
    private void AddFirst(Node node)\r
    {\r
        node.Next = _head.Next; node.Prev = _head;\r
        _head.Next!.Prev = node; _head.Next = node;\r
    }\r
\r
    private void Unlink(Node node)\r
    {\r
        node.Prev!.Next = node.Next;\r
        node.Next!.Prev = node.Prev;\r
    }\r
}\r
\`\`\`\r
\r
The LFU cache reuses \`_map\` for O(1) lookup but replaces the single linked list with \`Dictionary<int, LinkedList<Node>>\` keyed by frequency, plus a \`_minFrequency\` field: \`Get\` moves a node from bucket \`f\` to bucket \`f+1\`, bumping \`_minFrequency\` only when bucket \`f\` becomes empty **and** \`f == _minFrequency\`. Eviction always pops the tail of \`_freqBuckets[_minFrequency]\` — never a scan. \`LFUCache\`'s frequency bucket also reuses the same \`LinkedListNode<Node>\` wrapper across buckets — a node removed from bucket \`f\`'s list is re-inserted into bucket \`f+1\`'s list without allocating a new wrapper, which keeps \`Put\`/\`Get\` allocation-free on the hot path.\r
\r
> [!TIP]\r
> Both caches can skip the hand-rolled \`Node\`/pointer-surgery class shown above and use .NET's built-in \`LinkedList<T>\` directly: store \`Dictionary<TKey, LinkedListNode<(TKey Key, TValue Value)>>\` and call the list's own \`AddFirst\`, \`Remove\` and \`RemoveLast\`, all O(1). It is a faster way to produce working code in an interview, at the cost of not demonstrating that you understand the pointer manipulation the built-in type is doing for you — narrate both and pick based on how much time is left.\r
\r
## Concurrency and thread safety\r
\r
> [!WARNING]\r
> \`ConcurrentDictionary<TKey, Node>\` alone does **not** make an LRU cache thread-safe. Lookup is thread-safe, but "move this node to the front of the list" touches shared list pointers that need their own synchronization — a torn linked list under concurrent \`MoveToFront\` calls is a classic interview trap.\r
\r
The simplest correct approach is one \`lock\` around the whole \`Get\`/\`Put\` body, guarding both the map and the list together. For higher throughput, shard by key hash:\r
\r
\`\`\`csharp\r
public class ShardedCache<TKey, TValue> : ICache<TKey, TValue>\r
{\r
    private readonly ICache<TKey, TValue>[] _shards;\r
    private readonly int _shardCount;\r
\r
    public ShardedCache(int shardCount, Func<int, ICache<TKey, TValue>> factory)\r
    {\r
        _shardCount = shardCount;\r
        _shards = new ICache<TKey, TValue>[shardCount];\r
        for (int i = 0; i < shardCount; i++) _shards[i] = factory(i);\r
    }\r
\r
    private ICache<TKey, TValue> ShardFor(TKey key)\r
        => _shards[(key!.GetHashCode() & 0x7fffffff) % _shardCount];\r
\r
    public bool TryGet(TKey key, out TValue value) => ShardFor(key).TryGet(key, out value);\r
    public void Put(TKey key, TValue value) => ShardFor(key).Put(key, value);\r
}\r
\`\`\`\r
\r
Each shard has its own capacity (\`totalCapacity / shardCount\`) and its own lock, so two threads touching keys that hash to different shards never contend. The trade-off: global "least recently used across the whole cache" is only approximate — a shard can evict its own LRU entry while a globally colder entry sits untouched in another shard. That is an acceptable, well-known trade-off and worth naming out loud.\r
\r
## Extending the design\r
\r
| New requirement | Where it plugs in | Why the design allows it |\r
|---|---|---|\r
| TTL expiry | Wrap any \`ICache\` in an \`ExpiringCacheDecorator\` that checks an expiry map before delegating \`TryGet\` | Decorator composes over the \`ICache\` interface without touching eviction logic |\r
| Capacity by memory, not count | Replace the \`int capacity\` check with a running byte-size counter updated on \`Put\`/evict | Eviction trigger is already isolated to one comparison; only the counter changes |\r
| New eviction policy (e.g. MRU, ARC) | Add a class implementing \`ICache<TKey,TValue>\` | Strategy pattern means the rest of the system only depends on the interface |\r
| Distributed cache | Replace \`ShardedCache\`'s in-process shards with client stubs to remote nodes (consistent hashing to pick the node) | The shard-routing logic (\`ShardFor\`) already isolates "which owner" from "how eviction works" |\r
| Write-through to a database | Add a \`WriteThroughCache\` decorator that calls the DB inside \`Put\` before delegating | Same decorator seam as TTL |\r
\r
> [!NOTE]\r
> This is exactly how Redis and Memcached scale in practice: a single node runs approximate LRU (sampling, not a perfect global list) for speed, and the cluster layer routes keys to nodes by consistent hashing — the same shard-then-approximate trade-off as \`ShardedCache\` above, just across machines instead of across in-process partitions.\r
\r
## Cheat sheet\r
\r
- LRU = hash map (O(1) lookup) + doubly linked list (O(1) reorder) with sentinel head/tail nodes.\r
- LFU = hash map + one linked list **per frequency count**, plus a \`minFrequency\` pointer — O(1), not a heap's O(log n).\r
- Always ask: bound by count or by memory? Fixed policy or swappable? Single-process or distributed?\r
- \`ConcurrentDictionary\` does not give you a thread-safe LRU by itself — the list mutation needs its own lock.\r
- Striped/sharded locking trades a small accuracy loss (per-shard LRU, not global) for much higher concurrency.\r
- TTL and write-through are best added as decorators over \`ICache\`, not baked into the eviction class.\r
- State Big-O for both \`Get\` and \`Put\`, and say "amortised" only if it truly is (list operations here are worst-case O(1), not amortised).\r
- Real caches (Redis) approximate LRU by sampling — perfect global recency ordering is rarely worth the cost at scale.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Using \`List<T>\` for the order structure | Removal from the middle is O(n); use a doubly linked list |\r
| Forgetting to move a node to front on \`Get\` | LRU means *reads* also count as "used"; a miss on this is a common bug |\r
| Off-by-one at list boundaries | Use sentinel head/tail nodes to avoid null checks entirely |\r
| Evicting before checking if the key already exists | An update to an existing key should never trigger eviction |\r
| Assuming \`ConcurrentDictionary\` alone is enough for thread safety | Wrap both map and list mutation in one lock, or shard |\r
| Building LFU with a heap and calling it O(1) | A heap is O(log n); only bucketed frequency lists are O(1) |\r
\r
## Summary\r
\r
Both LRU and LFU come down to pairing a hash map with the right ordered structure so both \`Get\` and \`Put\` stay O(1): a doubly linked list for recency, a set of frequency buckets for frequency. The eviction rule itself is best expressed as a Strategy behind a common \`ICache\` interface, which is what makes TTL, write-through, sharding and distribution all pluggable as decorators or alternate implementations rather than rewrites. Thread safety is the part interviewers probe hardest — know exactly why a \`ConcurrentDictionary\` is not sufficient on its own, and be ready to trade a little global accuracy for sharded throughput.\r
\r
## Top Interview Questions\r
\r
### Q1. Why do you need both a hash map and a linked list for an O(1) LRU cache?\r
\r
A hash map alone gives O(1) lookup by key but no notion of order, so finding the least recently used entry would require an O(n) scan. A linked list alone gives O(1) reordering (move a node to the front) but O(n) lookup by key. Combining them — map values point directly to list nodes — gives O(1) lookup **and** O(1) reordering: \`Get\` uses the map to jump straight to the node, then the list to move it to the front in constant time with no scanning.\r
\r
### Q2. Why use sentinel (dummy) head and tail nodes instead of tracking head/tail references directly?\r
\r
Without sentinels, every insert/remove has to special-case "is this the first node" or "is this the last node", which is where most bugs creep in — forgetting to update \`head\` when removing the only node, for example. Sentinel nodes are permanent, non-data nodes that always exist, so \`AddFirst\` always has a real \`_head.Next\` to link before, and \`RemoveLast\` always has a real \`_tail.Prev\` to unlink. Every operation becomes unconditional pointer surgery with no null checks.\r
\r
### Q3. How does LFU achieve O(1) get and put, and why is a heap not good enough?\r
\r
A min-heap keyed by frequency gives O(log n) update and eviction, which is correct but not optimal. The O(1) approach keeps a \`Dictionary<int, LinkedList<Node>>\` mapping each frequency value to a doubly linked list of nodes with that frequency, plus a \`minFrequency\` counter. Accessing a key removes its node from bucket \`f\` and appends it to bucket \`f+1\` — both O(1) list operations — and updates \`minFrequency\` only in the rare case the vacated bucket was the minimum and is now empty. Eviction always pops from \`buckets[minFrequency]\`, so there is never a scan.\r
\r
### Q4. What happens to \`minFrequency\` when the bucket at that frequency becomes empty?\r
\r
You increment \`minFrequency\` by exactly 1, never search for the new minimum. This works because every access increases a key's frequency by exactly one step, so if the current minimum bucket empties out, the next-lowest possible frequency any surviving key can have is \`minFrequency + 1\` — there is no smaller value to search for. This invariant is what keeps the operation O(1) instead of O(number of distinct frequencies).\r
\r
### Q5. Is \`ConcurrentDictionary<TKey, Node>\` enough to make an LRU cache thread-safe?\r
\r
No. \`ConcurrentDictionary\` makes individual map operations atomic, but an LRU cache's core behaviour — unlinking a node and re-linking it at the front on every access — touches shared \`Prev\`/\`Next\` pointers on the doubly linked list, which \`ConcurrentDictionary\` knows nothing about. Two threads calling \`Get\` concurrently can interleave their pointer updates and corrupt the list (a node pointing to itself, or a node reachable from two places at once). You need an explicit lock around the combined map-and-list mutation, or a design that avoids shared mutable list state altogether (e.g. sharding).\r
\r
### Q6. How would you make an LRU cache scale to many concurrent threads without one global lock?\r
\r
Shard the key space: split the cache into N independent \`LruCache\` instances, each with \`capacity / N\` and its own lock, and route each key to a shard by \`hash(key) % N\`. Two threads operating on keys in different shards never contend. The cost is that eviction becomes "least recently used within this shard" rather than globally — a shard can evict an entry that is actually more recently used than one sitting untouched in another shard. This is the same trade-off caches like Redis Cluster make at the network level, just applied in-process.\r
\r
### Q7. How would you add TTL (time-to-live) expiry without rewriting the eviction logic?\r
\r
Wrap the existing cache in a decorator that implements the same \`ICache\` interface: \`ExpiringCacheDecorator\` keeps a separate \`Dictionary<TKey, DateTime>\` of expiry times, checks it before delegating \`TryGet\` to the inner cache (treating an expired key as a miss and evicting it lazily), and records a fresh expiry time on every \`Put\`. This keeps TTL orthogonal to whether the inner cache is LRU or LFU — you get expiry "for free" on both without touching either eviction algorithm.\r
\r
### Q8. How would you support bounding the cache by memory size instead of entry count?\r
\r
Replace the \`_map.Count >= _capacity\` check with a running total of estimated byte size, updated whenever an entry is added (\`+= EstimateSize(value)\`) or evicted (\`-= EstimateSize(evicted.Value)\`). The eviction loop then becomes "keep evicting the LRU/LFU tail while \`currentBytes > maxBytes\`" instead of a single-entry check, because one large \`Put\` might need to evict several small entries to fit. The ordering data structures do not change at all — only the trigger condition for eviction does.\r
\r
### Q9. Design walkthrough: a client calls \`Get\` on a key that does not exist, then \`Put\`s a new value when the cache is full. Walk through both paths.\r
\r
\`Get("x")\`: hash to the map, miss, return "not found" — no mutation happens, so no reordering either. \`Put("y", v)\` when full: check the map first (not present, so this is a true insert, not an update); since \`_map.Count >= capacity\`, take \`_tail.Prev\` (the sentinel-adjacent real LRU node), unlink it from the list, remove its key from the map; then create the new node, insert it into the map, and \`AddFirst\` it into the list. Both branches are O(1) because every step is a direct pointer operation or map lookup, never a scan.\r
\r
### Q10. In production, would you build your own LRU cache or use a library, and why?\r
\r
For anything beyond a coding exercise, use a battle-tested library (\`Microsoft.Extensions.Caching.Memory\`, or an external cache like Redis for shared state) rather than hand-rolling one — they handle memory pressure callbacks, thread safety, and expiry correctly, and have been fuzz-tested for the edge cases that are easy to get subtly wrong (like the sentinel-node bugs above). The interview exercise exists to test whether you understand the underlying mechanics well enough to reason about performance and correctness trade-offs, not because production code should reimplement it.\r
\r
### Q11. Why is FIFO sometimes preferred over LRU despite being a "worse" heuristic on paper?\r
\r
FIFO needs no reordering on \`Get\` at all — only insertion order matters — so reads never touch the ordering structure, which removes an entire class of write contention on the hot read path. For access patterns that are closer to uniform (no strong recency bias), the extra bookkeeping of LRU buys little accuracy for a real cost in lock contention and cache-line writes on every read. This is why some CDN and OS page-cache implementations default to FIFO or CLOCK (an approximation) at very high throughput.\r
\r
### Q12. What is the CLOCK algorithm and why do real systems use it instead of exact LRU?\r
\r
CLOCK approximates LRU without maintaining an exact ordered list: entries sit in a circular buffer, each with a single "recently used" bit set on access. A clock hand sweeps the buffer looking for a victim; if the current entry's bit is set, it clears the bit and moves on (giving it a "second chance"), and evicts the first entry it finds with the bit unset. This needs only a single bit per entry and no pointer rewiring on every read, trading a little eviction precision for far less synchronization overhead — the same reason operating system page replacement algorithms almost always use CLOCK-family approximations rather than exact LRU.\r
`;export{e as default};
