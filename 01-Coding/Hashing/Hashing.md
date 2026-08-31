# Hashing

> **Core idea:** trade O(n) space for O(1) average-time lookup by mapping keys to array indices via a hash function.
> **Recognise it when:** "find if X exists", "count occurrences", "group by property", "two elements sum to target", "number of subarrays with property P".
> **Costs:** `O(n) time, O(n) space` for a single pass; O(1) average per operation.

## Mental Model

A hash table is an array indexed by `hash(key) % capacity`. The key invariant: **every lookup and insert touches at most O(1+α) entries on average**, where α = load factor. When α exceeds a threshold the table resizes, paying O(n) amortised once.

The higher-level pattern: **convert a linear scan into a constant-time question** by recording what you have seen so far in a dictionary/set.

---

## Complexity Reference

| Operation | `Dictionary<K,V>` avg | `Dictionary<K,V>` worst | Notes |
| --------- | --------------------- | ----------------------- | ----- |
| `Add` / `[]` | O(1) | O(n) | worst = all keys collide |
| `TryGetValue` / `ContainsKey` | O(1) | O(n) | |
| `Remove` | O(1) | O(n) | |
| Iterate | O(n) | O(n) | order is not insertion order |
| `int[26]` char-freq array | **O(1)** | O(1) | fastest for a-z problems |

---

## Hash Function Properties

- **Uniform distribution** — spreads keys evenly across buckets.
- **Deterministic** — same key always yields same hash.
- **Avalanche effect** — one-bit key change flips ~half the hash bits.
- **Fast to compute** — ideally O(key length).
- **Collision** — two distinct keys → same bucket. Unavoidable by pigeonhole; must be resolved.
- **Load factor α** = `count / capacity`. C# `Dictionary` resizes when α ≈ 0.72 (prime bucket sizes keep distribution uniform).

---

## Collision Resolution Strategies

| Strategy | Lookup avg | Lookup worst | Cache | Delete |
| -------- | ---------- | ------------ | ----- | ------ |
| Chaining | O(1+α) | O(n) | Poor (pointer chase) | Easy |
| Linear probing | O(1/(1−α)) | O(n) | **Excellent** (sequential) | Needs tombstone |
| Quadratic probing | O(1/(1−α)) | O(n) | Medium | Needs tombstone |
| **Robin Hood** | O(1) avg | O(log n) expected | Good | Complex (backward shift) |
| Double hashing | O(1/(1−α)) | O(n) | Medium | Needs tombstone |

**Robin Hood** — on collision, steal the slot from the entry with the smaller probe distance ("richer") and give it to the entry probing longer ("poorer"). Evens probe sequences; used in Rust's `HashMap`.

---

## C# `Dictionary<K,V>` Internals

`Dictionary<K,V>` uses **chaining implemented over struct arrays** (no heap-allocated linked-list nodes):

- `int[] _buckets` — length = prime ≥ requested capacity; stores index (1-based) into `_entries` for the chain head.
- `Entry[] _entries` — struct array; each entry = `{ hashCode, next (chain index), key, value }`.
- **Add:** hash = `key.GetHashCode()`, bucket = `(uint)hash % _buckets.Length`; walk chain to detect duplicate; prepend new entry.
- **Resize:** when α exceeds threshold, grow to next prime, rehash all entries into new arrays.
- `GetHashCode` called **once** per operation; `Equals` called for each chain node with matching `hashCode`.

`HashSet<T>` is internally identical to `Dictionary<T,_>` without the value field. Same O(1) average for `Add`, `Remove`, `Contains`, plus set algebra: `UnionWith`, `IntersectWith`, `ExceptWith`.

---

## `GetHashCode` / `Equals` Contract

**Two rules — break either and `Dictionary` silently loses entries:**

1. `a.Equals(b)` ⟹ `a.GetHashCode() == b.GetHashCode()`
2. `GetHashCode()` must be **stable** for the object's lifetime as a key — never hash mutable fields.

**Why mutable keys break dictionaries:** after mutation the key's hash changes, so lookup probes a different bucket than the one the entry was stored in — the entry is effectively lost.

```csharp
public sealed class Point
{
    public int X { get; }
    public int Y { get; }
    public Point(int x, int y) { X = x; Y = y; }
    public override bool Equals(object obj) => obj is Point p && p.X == X && p.Y == Y;
    public override int  GetHashCode() => HashCode.Combine(X, Y);
}
```

---

## Designing a Good `GetHashCode`

```csharp
// Preferred: HashCode.Combine — SipHash-based mixing, handles ordering
public override int GetHashCode() => HashCode.Combine(Field1, Field2, Field3);

// For sequence keys (e.g. char[] canonical form):
public override int GetHashCode()
{
    var h = new HashCode();
    foreach (var item in _items) h.Add(item);
    return h.ToHashCode();
}
```

- **Never** use XOR alone — commutative, so `{1,2}` and `{2,1}` collide.
- **Never** hash mutable fields.
- C# string `GetHashCode` is **randomised per process** (DOTNET_SYSTEM_GLOBALIZATION_HASH_ALGORITHM) — never persist or compare across processes.

---

## Templates

### Frequency Map

**Use when:** count occurrences, detect duplicates, find most/least frequent.

```csharp
// O(n) time, O(k) space where k = distinct values
var freq = new Dictionary<int, int>();
foreach (int x in nums)
    freq[x] = freq.GetValueOrDefault(x) + 1;

// For lowercase-only strings — faster: O(1) space
var freq = new int[26];
foreach (char c in s) freq[c - 'a']++;
```

### Complement Lookup (Two-Sum Family)

**Use when:** find two (or more) elements satisfying a sum/difference constraint.

```csharp
// O(n) time, O(n) space
var seen = new Dictionary<int, int>(); // value → index
for (int i = 0; i < nums.Length; i++)
{
    int complement = target - nums[i];
    if (seen.TryGetValue(complement, out int j)) return [j, i];
    seen[nums[i]] = i;
}
```

### Canonical-Key Grouping

**Use when:** group strings/sequences that are "equivalent" under some transform.

```csharp
// Group anagrams — sorted key O(n·k·log k); frequency-string key O(n·k)
var groups = new Dictionary<string, List<string>>();
foreach (var s in strs)
{
    string key = string.Concat(s.OrderBy(c => c));   // or: freq-array key below
    if (!groups.TryGetValue(key, out var list))
        groups[key] = list = new List<string>();
    list.Add(s);
}

// O(n·k) frequency-string key for a-z
static string FreqKey(string s)
{
    var cnt = new int[26];
    foreach (char c in s) cnt[c - 'a']++;
    return string.Join(",", cnt);
}
```

### Prefix Sum + HashMap

**Use when:** count subarrays satisfying a sum/modular constraint.

**General principle:** "number of subarrays ending at index `j` with property P" → "how many earlier prefix values satisfy the matching condition". Seed `prefixCount[identity] = 1` before the loop.

```csharp
// Template — O(n) time, O(n) space
var prefixCount = new Dictionary<int, int> { [0] = 1 };
int prefix = 0, result = 0;
foreach (int x in nums)
{
    prefix = Transform(prefix, x);          // e.g. prefix += x, or prefix = (prefix + x) % k
    int need = MatchingValue(prefix);       // e.g. prefix - k, or prefix (for balance problems)
    result += prefixCount.GetValueOrDefault(need);
    prefixCount[prefix] = prefixCount.GetValueOrDefault(prefix) + 1;
}
```

**Three instantiations:**

| Problem | `prefix` | `need` | Seed |
| ------- | -------- | ------ | ---- |
| Subarray Sum = K (560) | `prefix += x` | `prefix - k` | `[0]=1` |
| Contiguous Array (525) | `+1` for 1, `-1` for 0 | `prefix` (seen before → equal 0s and 1s between) | `[0]=1` |
| Divisible by K (974) | `(prefix + x % k + k) % k` | `prefix` (same remainder → difference divisible) | `[0]=1` |

### HashSet Membership / Dedup

**Use when:** O(1) "have I seen this?", remove duplicates, detect cycle.

```csharp
var seen = new HashSet<int>();
foreach (int x in nums)
{
    if (!seen.Add(x)) return true; // duplicate found
}
return false;
```

---

## Top-K Frequent Elements (LeetCode 347)

Build the frequency map here; the heap phase belongs to [Heaps and Priority Queues](../HeapsAndPriorityQueues/HeapsAndPriorityQueues.md).

```csharp
// Step 1 (hashing): build frequency map — O(n)
var freq = new Dictionary<int, int>();
foreach (int x in nums) freq[x] = freq.GetValueOrDefault(x) + 1;

// Step 2a (heap): maintain min-heap of size k — O(n log k) — see HeapsAndPriorityQueues.md
// Step 2b (bucket sort): O(n) alternative — hashing-flavoured
var buckets = new List<int>[nums.Length + 1];
foreach (var (val, cnt) in freq)
{
    buckets[cnt] ??= new List<int>();
    buckets[cnt].Add(val);
}
var result = new List<int>();
for (int i = buckets.Length - 1; i >= 1 && result.Count < k; i--)
    if (buckets[i] != null) result.AddRange(buckets[i]);
return result.ToArray();
```

> **Why bucket sort works:** frequency is bounded by `n`, so an array of `n+1` buckets indexed by frequency lets us scan from high to low in O(n).

---

## Pattern Recognition

| Problem says… | Reach for | Complexity |
| ------------- | --------- | ---------- |
| "Two numbers sum to target" | Complement lookup dict | O(n) |
| "Count subarrays summing to k" | Prefix sum + dict | O(n) |
| "Group by equivalent form" | Canonical-key dict | O(n·k) |
| "Contains duplicate" / "have I seen X" | HashSet | O(n) |
| "Longest consecutive sequence" | HashSet + start-of-run check | O(n) |
| "Top k frequent" | Freq map + heap or bucket sort | O(n log k) / O(n) |
| "Character frequency equal?" | `int[26]` array | O(n), O(1) space |
| "At most k distinct" / sliding window | TwoPointers + dict | O(n) |
| "kth largest / smallest" | Heap (not hash) | O(n log k) |
| "Prefix-based search / autocomplete" | Trie (not hash) | O(m) |
| "Ordered iteration by key" | `SortedDictionary` | O(log n) per op |
| "Range sum queries after updates" | Fenwick / segment tree | O(log n) |

---

## Variants and Differences

### When Hashmap is the Wrong Tool

| Need | Better Structure | Why |
| ---- | ---------------- | --- |
| Ordered iteration by key | `SortedDictionary<K,V>` | HashMap order is undefined |
| Top-K / median / kth element | `PriorityQueue` / heap | HashMap can't compare magnitudes |
| Prefix-match / autocomplete | Trie | HashMap can't share prefixes |
| Range sum / point update | Fenwick tree / segment tree | HashMap has no positional concept |
| Range max / min queries | Sparse table / segment tree | Same |
| Windowed frequency with eviction | Dict + deque (monotonic) | Pure dict misses the eviction invariant |

### `Dictionary` vs `SortedDictionary` vs `int[]`

| Criterion | `Dictionary<K,V>` | `SortedDictionary<K,V>` | `int[26]` |
| --------- | ----------------- | ----------------------- | --------- |
| Lookup | **O(1) avg** | O(log n) | **O(1)** |
| Ordered iteration | ❌ | ✅ | ✅ (by index) |
| Arbitrary key type | ✅ | ✅ | ❌ (only small ints) |
| Memory per entry | ~40 B | ~80 B (tree node) | **4 B** |
| Best for | General purpose | Need min/max/range | a-z char counts |

---

## Pitfalls

- **Mutable keys** — mutating a key after insertion makes it unreachable. Always use immutable keys.
- **`KeyNotFoundException` from indexer** — `dict[key]` throws if missing. Prefer `TryGetValue` or `GetValueOrDefault`.
- **Forgetting `prefixCount[0] = 1`** — without it, subarrays starting at index 0 are not counted in prefix-sum problems.
- **`int[26]` vs `Dictionary` for a-z** — the array is ~10× faster, allocates no heap objects, and has O(1) guaranteed (no hash collisions). Use it whenever the key set is small and contiguous.
- **Hash order ≠ insertion order** — never rely on `Dictionary` iteration order. Use `List` or `LinkedList` if order matters.
- **`null` keys** — `Dictionary<K,V>` throws `ArgumentNullException` on null reference-type keys. Guard explicitly.
- **Value-type boxing** — `Dictionary<object, V>` or `HashSet<object>` boxes value types on every operation. Use typed generics.
- **`string.GetHashCode` is not stable across processes** — C# randomises it per-process by default. Never persist, serialise, or compare `string.GetHashCode()` across processes or app restarts.
- **`GetValueOrDefault` vs `TryGetValue`** — both are safe (no throw), but `TryGetValue` is marginally faster (one lookup) when you also need the value. `GetValueOrDefault` is cleaner for one-liners.

---

## Consistent Hashing (Interview Topic)

Consistent hashing distributes keys across nodes on a virtual hash ring so that adding/removing a node remaps only `n/k` keys (not all `n`). Each physical node owns multiple virtual nodes (vnodes) for even load. Used in distributed caches (Memcached, Redis Cluster) and databases (Cassandra, DynamoDB).

Key property: `O(log n)` lookup via binary search on the sorted ring. Adding a node only steals keys from the adjacent neighbour, not a full rehash.

> No broken link — the full system-design treatment is outside this coding-interview repo scope.

---

## Rolling Hash (Pointer)

Rolling hash computes `hash(window)` in O(1) by sliding: subtract the outgoing character's contribution and add the incoming one. Used in Rabin-Karp substring search. See [Tries and String Matching](../TriesAndStringMatching/TriesAndStringMatching.md) for the full implementation and collision-handling discussion.

---

## Practice

See [Problems.md](Problems.md) for worked solutions.

| # | Problem | Pattern |
| - | ------- | ------- |
| 1 | Two Sum | Complement lookup |
| 49 | Group Anagrams | Canonical-key grouping |
| 128 | Longest Consecutive Sequence | HashSet membership |
| 205 | Isomorphic Strings | Bijection map |
| 217 | Contains Duplicate | HashSet dedup |
| 242 | Valid Anagram | Frequency map |
| 290 | Word Pattern | Bijection map |
| 347 | Top K Frequent Elements | Freq map + bucket sort / heap |
| 380 | Insert Delete GetRandom O(1) | Dict + list |
| 383 | Ransom Note | Frequency map |
| 387 | First Unique Character | Frequency map |
| 454 | 4Sum II | Complement lookup |
| 525 | Contiguous Array | Prefix sum + HashMap |
| 560 | Subarray Sum Equals K | Prefix sum + HashMap |
| 974 | Subarray Sums Divisible by K | Prefix sum + HashMap |
