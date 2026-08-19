# Heaps

> **Scope** - Binary heap mechanics, .NET `PriorityQueue`, fixed-size top-K, k-closest, kth element, k-way merge, two-heaps median, lazy deletion, heap-greedy scheduling, heapsort, and heap-vs-alternative decisions.

**Contents**
- [1. Core Concepts](#1-core-concepts)
- [2. Complexity Reference](#2-complexity-reference)
- [3. C# Toolbox](#3-c-toolbox)
- [4. Core Patterns / Techniques](#4-core-patterns--techniques)
- [5. Classic Problems & Solutions](#5-classic-problems--solutions)
- [6. Pattern Recognition](#6-pattern-recognition)
- [7. Interview Focus](#7-interview-focus)
- [8. Common Traps & Edge Cases](#8-common-traps--edge-cases)
- [9. Related LeetCode Problems](#9-related-leetcode-problems)
- [10. Cheat Sheet](#10-cheat-sheet)
- [See Also](#see-also)

---

## 1. Core Concepts

A **heap** is a **complete binary tree** plus a **heap-order property**.

| Property | Meaning |
| --- | --- |
| Shape | All levels full except maybe the last, which fills left to right with no gaps. |
| Order | **Min-heap:** parent <= children, root is global min. **Max-heap:** parent >= children, root is global max. |

Heap order says nothing about sibling order. That weaker invariant is why heaps support cheap root access and O(n) heapify, but cannot binary-search, range-query, or emit sorted order without draining/sorting.

### 1.1 Implicit array encoding (0-based)

Completeness gives pointer-free level-order storage:

```text
parent(i) = (i - 1) / 2      // only for i > 0
left(i)   = 2 * i + 1
right(i)  = 2 * i + 2
lastInternal = n / 2 - 1     // none when n < 2
```

Root is index `0`; children of index `i` are always computed by arithmetic. Example min-heap array: `[1, 3, 6, 5, 9, 8, 15]`.

### 1.2 Why array beats pointer-based tree

- **Cache locality:** contiguous array beats pointer chasing.
- **No pointer fields:** index arithmetic replaces `left`/`right`/`parent` references.
- **In-place operations:** enables O(1)-extra-space heapsort.
- **Trade-off:** arbitrary lookup/delete still needs O(n) unless you maintain a value-to-index map.

### 1.3 `MinHeap` from scratch

```csharp
public sealed class MinHeap<T> where T : IComparable<T>
{
    private readonly List<T> a = new();
    public int Count => a.Count;
    public T Peek() => a.Count == 0 ? throw new InvalidOperationException("empty") : a[0];

    public void Push(T x) { a.Add(x); Up(a.Count - 1); }

    public T Pop()
    {
        if (a.Count == 0) throw new InvalidOperationException("empty");
        T root = a[0], last = a[^1];
        a.RemoveAt(a.Count - 1);
        if (a.Count > 0) { a[0] = last; Down(0); }
        return root;
    }

    public void BuildHeap(IEnumerable<T> items)
    {
        a.Clear();
        a.AddRange(items);
        for (int i = a.Count / 2 - 1; i >= 0; i--) Down(i);
    }

    private void Up(int i)
    {
        while (i > 0)
        {
            int p = (i - 1) / 2;
            if (a[i].CompareTo(a[p]) >= 0) break;
            (a[i], a[p]) = (a[p], a[i]);
            i = p;
        }
    }

    private void Down(int i)
    {
        for (int n = a.Count; ; )
        {
            int l = 2 * i + 1, r = l + 1, s = i;
            if (l < n && a[l].CompareTo(a[s]) < 0) s = l;
            if (r < n && a[r].CompareTo(a[s]) < 0) s = r;
            if (s == i) break;
            (a[i], a[s]) = (a[s], a[i]);
            i = s;
        }
    }
}
```

Heap operations reduce to two primitives: append + **sift-up** after insert, and root-replace + **sift-down** after pop. Each walks one root-to-leaf path, so O(log n).

### 1.4 Why `BuildHeap` is O(n), not O(n log n)

Bottom-up heapify calls `SiftDown` only on internal nodes. Naively bounding every call by O(log n) is loose because most internal nodes are near the leaves.

```text
nodes at height h <= ceil(n / 2^(h+1))
work at height h  <= O(h)
T(n) <= c * sum_h ceil(n / 2^(h+1)) * h
     = O(n) * sum_h h / 2^(h+1)
     = O(n)                    // the series converges to 1
```

**Contrast:** n successive `Push` calls cost `sum_{k=1..n} log k = log(n!) = O(n log n)`. If all data is known upfront, prefer `BuildHeap`, `EnqueueRange`, or the bulk constructor.

### 1.5 Heap vs Balanced BST - why the array form wins for pure priority-queue use

- Heap and BST both give O(1)/O(log n) min access if the BST maintains a min pointer, but the heap is smaller, more cache-friendly, and bulk-builds in O(n).
- BST wins for arbitrary search, predecessor/successor, range queries, and ordered traversal.
- Rule: repeated min/max extraction -> heap; rank/range/full order -> balanced BST or sorted array.

---

## 2. Complexity Reference

| Operation | Time | Space | Why |
| --- | --- | --- | --- |
| Peek / find-min | O(1) | O(1) | Root is index 0. |
| Push / insert | O(log n) | O(1) | Sift-up by height. |
| Pop / extract-min | O(log n) | O(1) | Sift-down by height. |
| BuildHeap / heapify array | O(n) | O(1) | Bottom-heavy summation in §1.4. |
| Search arbitrary value | O(n) | O(1) | Siblings/subtrees are unordered. |
| Delete arbitrary element | O(log n) with index map, else O(n) | O(n) for map | Need to locate before sifting. |
| Decrease/increase key with handle/index | O(log n) | O(1) | One sift-up or sift-down. |
| Heapsort | O(n log n) | O(1) | Build heap, repeatedly extract root; not stable. |

---

## 3. C# Toolbox

`.NET 6+` provides `System.Collections.Generic.PriorityQueue<TElement, TPriority>`.

```csharp
var pq = new PriorityQueue<string, int>();
pq.Enqueue("task", 5);
string next = pq.Dequeue();                 // lowest priority first
pq.Enqueue("retry", 2);
pq.TryPeek(out var e, out var p);
pq.TryDequeue(out e, out p);

int[] values = { 5, 1, 9 };
var seeded = new PriorityQueue<int, int>(
    values.Select(v => (Element: v, Priority: v))); // O(n) heapify

pq.Enqueue("old", 10);
string rejected = pq.EnqueueDequeue("candidate", 3); // candidate may be returned/rejected
string oldRoot = pq.DequeueEnqueue("forced", 7);     // old root removed, candidate stays
```

| Feature | Detail |
| --- | --- |
| Default order | **Min-heap**: lowest `TPriority` dequeues first. |
| Max-heap | Prefer reversed comparer: `Comparer<int>.Create((a, b) => b.CompareTo(a))`. Negating priority can overflow; `-int.MinValue` breaks. |
| Stability | **Not stable**; equal priorities dequeue in unspecified order. Add a sequence number to the priority if ties need FIFO. |
| Empty-safe APIs | `TryPeek` / `TryDequeue` return `false`; `Peek` / `Dequeue` throw. |
| Bulk load | Constructor or `EnqueueRange` heapifies in O(n) when starting empty. |
| `EnqueueDequeue(e, p)` | Enqueue candidate, then dequeue root; candidate may be immediately returned/rejected. Good for bounded top-K. |
| `DequeueEnqueue(e, p)` | Dequeue old root first, then enqueue candidate; queue must be non-empty and candidate always remains. |
| `UnorderedItems` | O(n) view of backing heap, **not sorted**; sort/drain if order matters. |
| Decrease-key | **Not supported**; push a new entry and skip stale entries on pop. |

Common priority shapes:

```csharp
var max = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));

long seq = 0;
var stable = new PriorityQueue<string, (int Priority, long Seq)>();
stable.Enqueue("job", (5, seq++)); // tuple comparer breaks ties by insertion order
```

Lazy deletion pattern: keep authoritative state in a dictionary (`bestDistance`, `delayedCounts`, latest priority). On pop, validate the entry; if stale, discard and pop again.

```csharp
while (frontier.TryDequeue(out int node, out int d))
{
    if (d != best[node]) continue; // stale entry from an older priority
    Process(node, d);
}
```

This is the standard .NET answer for Dijkstra, A*, sliding-window median pruning, and any "decrease-key" prompt.

---

## 4. Core Patterns / Techniques

### Top-K (largest or smallest of a stream)

Use when `k << n`, data is streaming, or sorted output is unnecessary.

> **Direction rule:** reason from what you would **evict**. For **k largest**, the weakest kept item is the smallest -> use a **size-k MIN-heap** and evict its root. For **k smallest**, the weakest kept item is the largest -> use a **size-k MAX-heap**. A max-heap of all n elements is O(n log n) and defeats top-K.

```csharp
public static int[] TopKLargest(int[] nums, int k)
{
    if (k <= 0) return Array.Empty<int>();
    var h = new PriorityQueue<int, int>();
    foreach (int x in nums)
    {
        if (h.Count < k) h.Enqueue(x, x);
        else h.EnqueueDequeue(x, x); // rejects x when x is below the current top-k boundary
    }
    return h.UnorderedItems.Select(x => x.Element).ToArray();
}
```

Complexity: O(n log k) time, O(k) space. Output is unordered; drain/sort only if required.

### K Closest Points / Elements

Keep the best k by a score (distance, absolute difference, rank). Evict the worst kept item, so closest k uses a **size-k max-heap** by distance.

```csharp
public static int[][] KClosest(int[][] points, int k)
{
    var farthestFirst = Comparer<long>.Create((a, b) => b.CompareTo(a));
    var h = new PriorityQueue<int[], long>(farthestFirst);
    foreach (int[] p in points)
    {
        long d = (long)p[0] * p[0] + (long)p[1] * p[1];
        h.Enqueue(p, d);
        if (h.Count > k) h.Dequeue();
    }
    return h.UnorderedItems.Select(x => x.Element).ToArray();
}
```

Use squared distance; `Math.Sqrt` is unnecessary and can add precision noise. Complexity: O(n log k), O(k).

### Kth Largest / Smallest Element

Same bounded-heap idea, but return the boundary root. For kth largest, keep k largest in a min-heap; root is kth largest. For kth smallest, keep k smallest in a max-heap. LC 703 persists this heap across `Add` calls: O(log k) per update, O(k) space.

```csharp
public sealed class KthLargest
{
    private readonly int k;
    private readonly PriorityQueue<int, int> h = new();

    public KthLargest(int k, int[] nums)
    {
        this.k = k;
        foreach (int x in nums) Add(x);
    }

    public int Add(int x)
    {
        h.Enqueue(x, x);
        if (h.Count > k) h.Dequeue();
        return h.Peek();
    }
}
```

For a single mutable static array, QuickSelect averages O(n); see the table below.

### Merge K Sorted Lists / Arrays

Push one current head per source; pop the smallest head and push that source's successor.

```csharp
public ListNode MergeKLists(ListNode[] lists)
{
    var pq = new PriorityQueue<ListNode, int>();
    foreach (var node in lists)
        if (node != null) pq.Enqueue(node, node.val);

    var dummy = new ListNode();
    var tail = dummy;
    while (pq.Count > 0)
    {
        var node = pq.Dequeue();
        tail.next = node;
        tail = node;
        if (node.next != null) pq.Enqueue(node.next, node.next.val);
    }
    return dummy.next;
}
```

Complexity: O(N log k) time, O(k) heap space. Ties are not stable unless you add a source/index tiebreaker.

The same **frontier heap** handles generated sorted states: LC 373 seeds `(i, 0)` pairs and pushes the next pair from the same row; LC 378 seeds matrix frontier cells and pushes right/down neighbors with a `visited` guard. Stop after k pops when only the kth item is needed. Complexity is usually O(k log frontier) rather than materializing all candidates.

### Two Heaps - Running Median

Invariant: max-heap `low` stores the smaller half, min-heap `high` stores the larger half; `low.Count == high.Count` or `low.Count == high.Count + 1`, and every `low` value <= every `high` value.

```csharp
public sealed class MedianFinder
{
    private readonly PriorityQueue<int, int> low = new(Comparer<int>.Create((a, b) => b.CompareTo(a)));
    private readonly PriorityQueue<int, int> high = new();

    public void AddNum(int x)
    {
        if (low.Count == 0 || x <= low.Peek()) low.Enqueue(x, x);
        else high.Enqueue(x, x);
        if (low.Count > high.Count + 1) { int y = low.Dequeue(); high.Enqueue(y, y); }
        if (high.Count > low.Count) { int y = high.Dequeue(); low.Enqueue(y, y); }
    }

    public double FindMedian() => low.Count == high.Count
        ? ((long)low.Peek() + high.Peek()) / 2.0
        : low.Peek();
}
```

Insert: O(log n); median: O(1). Cast before averaging to avoid overflow.

### Sliding Window Median vs Sliding Window Maximum

| Problem | Best structure | Time | Key point |
| --- | --- | --- | --- |
| Sliding-window median | Two heaps + lazy deletion map | O(n log k) | Need a middle value while outgoing elements may be buried. |
| Sliding-window max/min | Monotonic deque | O(n) | Dominated candidates can be discarded forever. |
| Heap for max/min window | Heap + stale indices | O(n log k) | Correct but usually not optimal. |

LC 480 details: keep logical sizes for `low`/`high` because physical heap counts include stale values; increment `delayed[value]` when an element leaves; before reading/moving a heap root, pop roots whose delayed count is positive.

Implementation checklist:
1. `Insert(x)`: route to `low` or `high`, adjust logical size, rebalance.
2. `Erase(x)`: increment `delayed[x]`; decrement the logical size of the side where `x` belongs by comparing to `low.Peek()`.
3. `Prune(heap)`: while root is delayed, decrement/remove the delayed count and pop.
4. `Rebalance()`: move roots until sizes are valid, pruning after each move.
5. Median reads only after both roots have been pruned.
6. Duplicates require counts, not a `HashSet`.

### Scheduling / Interval by Earliest End

Sort by start; min-heap active resources by next free/end time. The root answers whether the earliest room/resource can be reused.

```csharp
public int MinMeetingRooms(int[][] intervals)
{
    Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
    var ends = new PriorityQueue<int, int>();
    foreach (int[] iv in intervals)
    {
        if (ends.Count > 0 && ends.Peek() <= iv[0]) ends.Dequeue();
        ends.Enqueue(iv[1], iv[1]);
    }
    return ends.Count;
}
```

Complexity: O(n log n) time for sort + heap ops, O(n) space.

### Graph Best-First Search (Dijkstra / Prim)

Use a min-heap for the next cheapest frontier state. Because .NET has no decrease-key, enqueue improved distances/keys and skip stale pops.

```csharp
var pq = new PriorityQueue<int, int>();
dist[source] = 0;
pq.Enqueue(source, 0);
while (pq.TryDequeue(out int u, out int d))
{
    if (d != dist[u]) continue;
    foreach (var (v, w) in graph[u])
        if (d + w < dist[v])
        {
            dist[v] = d + w;
            pq.Enqueue(v, dist[v]);
        }
}
```

Dijkstra needs non-negative weights; Prim uses the same idea with edge weights and a visited set. Complexity with a binary heap is O(E log V).

### Repeated Min-Combine (Ropes / Huffman)

When combining two smallest items creates a new item and adds cost, use a min-heap: pop two smallest, add their sum to the answer, push the sum back. This is the greedy proof behind connect-ropes and Huffman coding. Complexity: O(n log n), O(n).

### Heap + HashMap for Frequency Problems

Count first, then either bounded heap for top-K or max-heap for repeated most-frequent choice.

```csharp
public int[] TopKFrequent(int[] nums, int k)
{
    var freq = new Dictionary<int, int>();
    foreach (int x in nums) freq[x] = freq.GetValueOrDefault(x) + 1;

    var h = new PriorityQueue<int, int>();
    foreach (var (value, count) in freq)
    {
        h.Enqueue(value, count);
        if (h.Count > k) h.Dequeue();
    }
    return h.UnorderedItems.Select(x => x.Element).ToArray();
}
```

Complexity: O(n + u log min(k, u)) time, O(u + k) space. If counts are bounded by n or alphabet is tiny, bucket/counting can beat the heap.

### Task Scheduler / Reorganize String

Repeatedly choose the highest remaining count, then temporarily block what was just used.

```csharp
public int LeastInterval(char[] tasks, int cooldown)
{
    int[] cnt = new int[26];
    foreach (char t in tasks) cnt[t - 'A']++;

    var max = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));
    foreach (int c in cnt) if (c > 0) max.Enqueue(c, c);
    var wait = new Queue<(int Remaining, int ReadyAt)>();

    for (int time = 0; ; )
    {
        if (max.Count == 0 && wait.Count == 0) return time;
        time++;
        while (wait.Count > 0 && wait.Peek().ReadyAt <= time)
        {
            var item = wait.Dequeue();
            max.Enqueue(item.Remaining, item.Remaining);
        }
        if (max.TryDequeue(out int left, out _) && --left > 0)
            wait.Enqueue((left, time + cooldown + 1));
    }
}
```

Complexity: O(n log u), O(u). `Reorganize String` uses the same max-heap but blocks only the previous character. LC 621 also has the formula `max(n, (maxCount - 1) * (cooldown + 1) + tiesAtMax)`.

### Heapsort (in-place)

Properties: in-place, O(n log n) best/avg/worst, O(1) extra space, **not stable**. For ascending output, build a max-heap and move the current max into the shrinking suffix.

```csharp
for (int i = n / 2 - 1; i >= 0; i--) SiftDownMax(a, n, i); // O(n) heapify
for (int end = n - 1; end > 0; end--)
{
    (a[0], a[end]) = (a[end], a[0]);
    SiftDownMax(a, end, 0); // restore heap on prefix [0, end)
}
```

Rarely hand-written in senior loops; know the invariants and trade-offs versus introsort/quicksort/mergesort.

### Selection Problem: Heap vs BST vs Sorted Array vs QuickSelect

| Approach | Setup | Query / update | Best when |
| --- | --- | --- | --- |
| Sorted array | O(n log n) | O(1) kth by index | Static data, many queries, full order useful. |
| Balanced BST / order-stat tree | O(n log n) | O(log n) updates/rank | Dynamic data plus rank/predecessor/successor. |
| Fixed-size heap | O(n log k) pass | O(1) boundary peek | Stream/top-K, `k << n`, no full order needed. |
| QuickSelect | In-place partition | O(n) average, O(n^2) worst | Single kth query on mutable static array. |

Heap wins on streams and repeated online maintenance; QuickSelect wins for one-shot in-memory selection.

<details>
<summary>Advanced: binomial and Fibonacci heaps</summary>

Binomial heaps are forests with at most one binomial tree per order; union is binary addition on tree ranks, giving efficient meld. Fibonacci heaps keep loose trees in a root list with a min pointer and delay consolidation until delete-min.

| Operation | Binary heap | Binomial heap | Fibonacci heap |
| --- | --- | --- | --- |
| Find-min | O(1) | O(1) with cached min, else O(log n) | O(1) |
| Insert | O(log n) | O(1) amortized / O(log n) worst | O(1) amortized |
| Delete-min | O(log n) | O(log n) | O(log n) amortized |
| Decrease-key | O(log n) | O(log n) | O(1) amortized |
| Meld / union | O(n) | O(log n) | O(1) amortized |

They improve Dijkstra from binary-heap O(E log V) to O(E + V log V) asymptotically, but constants, allocation, and pointer chasing usually lose in production.

</details>

---

## 5. Classic Problems & Solutions

Most classics are direct applications of §4; state the pattern, heap contents, priority, and complexity.

| Problem | Pattern / heap | Complexity | Notes |
| --- | --- | --- | --- |
| Kth Largest in Array (LC 215) / Stream (LC 703) | Size-k min-heap of values, priority value | Array O(n log k), stream O(log k)/add | One-shot static array: QuickSelect O(n) average. |
| Find Median from Data Stream (LC 295) | Max-heap lower half + min-heap upper half | O(log n)/add, O(1)/median | Rebalance sizes after routing new value. |
| Sliding Window Median (LC 480) | Same two heaps + delayed-delete counts | O(n log k), O(k) | Track logical sizes; prune stale roots. |
| Merge K Sorted Lists (LC 23) | Min-heap of current list heads by node value | O(N log k), O(k) | Push successor from the popped list. |
| Top K Frequent (LC 347) / Sort Characters by Frequency (LC 451) | Frequency map, then size-k min-heap or max-heap/bucket | O(n + u log k) | Bucket sort is O(n) when frequency range is bounded. |
| K Closest Points (LC 973) / K Closest Elements (LC 658) | Size-k max-heap by distance/difference | O(n log k), O(k) | LC 658 sorted-array version often prefers binary search + window. |
| Task Scheduler (LC 621) / Reorganize String (LC 767) | Max-heap by remaining count, plus cooldown/previous block | O(n log u), O(u) | For LC 621 derive formula as follow-up. |
| Meeting Rooms II (LC 253) / Car Pooling (LC 1094) | Min-heap of active end times or sweep line | O(n log n), O(n) | Earliest end decides reuse; sweep can be simpler. |
| Network Delay Time (LC 743) | Dijkstra min-heap of `(distance, node)` | O(E log V) | No decrease-key in .NET: push duplicates, skip stale distances. |
| Connect Ropes / Huffman Coding | Min-heap of weights, repeatedly combine two smallest | O(n log n), O(n) | Greedy exchange argument: smallest depths should be deepest. |
| IPO (LC 502) | Min-heap by capital gate, max-heap by profit | O(n log n + k log n) | Move affordable projects, pick best profit. |
| Maximum Subsequence Score (LC 2542) / Team Performance (LC 1383) | Sort by one dimension, size-k heap on chosen values | O(n log k) after sort | Heap maintains best k under a moving bottleneck. |

---

## 6. Pattern Recognition

| Signal | Reach for |
| --- | --- |
| "top k", "kth", "k closest" and output need not be fully sorted | Fixed-size heap; direction determined by eviction. |
| Multiple sorted lists/runs/frontiers | K-way merge min-heap. |
| Stream asks for current median | Two heaps. |
| Sliding-window median | Two heaps + lazy deletion. |
| Sliding-window max/min | Monotonic deque, not heap. |
| Repeatedly pick most frequent/most constrained eligible item | Max-heap + cooldown/blocked queue. |
| Earliest finishing resource controls reuse | Min-heap of end/available times. |
| Non-negative shortest path or MST frontier | Dijkstra/Prim with min-heap and stale-skip. |
| Need full order/range/predecessor/successor | Sorted array/BST, not heap. |
| Tiny alphabet or count bounded by n | Bucket/counting may beat heap log factors. |

Constraint hints: `k << n` favors O(n log k); online data rules out sorting/QuickSelect; repeated changing min/max favors a priority queue over re-sorting.

---

## 7. Interview Focus

- Core signal: repeated priority extraction while data changes; avoid "sort every time."
- Explain heap invariants, 0-based index math, and sift-up/sift-down cleanly.
- Senior follow-up: prove `BuildHeap` is O(n) and contrast with n inserts O(n log n).
- Know .NET specifics: min-heap default, no decrease-key, not stable, `UnorderedItems` not sorted, `EnqueueDequeue` vs `DequeueEnqueue`, `int.MinValue` negation overflow.
- For greedy heaps, state the invariant: pick the best currently eligible item, then update/block/reinsert.
- Production uses: priority schedulers, event simulation, timer queues/wheels, Dijkstra/Prim, LSM/log-compaction merges, external merge sort, rate-limit expirations.
- Scale follow-ups: streaming top-K uses bounded heap; distributed top-K does local top-K per shard then merges candidates; strict bounded-memory heavy hitters need Space-Saving/Count-Min Sketch plus heap.
- **When NOT to use a heap:** full sorted order repeatedly (sort once), rank/predecessor/successor (BST/order-stat tree), single static kth query (QuickSelect), sliding-window max/min (deque), tiny n (scan is simpler).

---

## 8. Common Traps & Edge Cases

| Trap | Why it bites | Fix |
| --- | --- | --- |
| Empty heap operations | `Peek`/`Dequeue` throw | Check `Count` or use `TryPeek`/`TryDequeue`. |
| Invalid `k` | `k <= 0`, `k > n`, empty input alter semantics | Validate early and state convention. |
| Assuming heap array is sorted | Only root is guaranteed | Drain/sort for ordered output; `UnorderedItems` is not sorted. |
| Min/max direction flipped | "k largest" using max-heap of all n is wasteful | Reason from what to evict: k largest -> size-k min-heap. |
| Negating priority for max-heap | `-int.MinValue` overflows | Use reversed comparer. |
| Expecting arbitrary delete in O(log n) | Heap cannot locate arbitrary value | Maintain index map or use lazy deletion. |
| Stale entries after lazy update | Old priorities remain in heap | Validate popped entry against dictionary/best state; discard stale. |
| Sliding-window median deletion | Outgoing value may be buried | Mark delayed, adjust logical size, prune when it reaches root. |
| Median average overflow | `a + b` can overflow | Cast to `long`/`double` before adding. |
| Assuming stability | Equal priorities have unspecified order | Add sequence number tiebreaker. |
| 0-based formula off-by-one | Mixing 1-based and 0-based formulas | Use `parent=(i-1)/2`, `left=2i+1`, `right=2i+2`. |
| Repeated `Enqueue` for known input | Misses O(n) heapify | Use `BuildHeap`, `EnqueueRange`, or bulk constructor. |
| Heap for sliding max/min | Correct but suboptimal | Use monotonic deque for O(n). |

---

## 9. Related LeetCode Problems

> The full tiered problem set lives in [Practice Roadmap](../DSAPatterns/Practice-Roadmap.md). The list below is the minimum set for this topic.

| # | Problem | Difficulty | Pattern |
| --- | --- | --- | --- |
| 23 | Merge K Sorted Lists | Hard | K-way merge min-heap. |
| 215 | Kth Largest Element in an Array | Medium | Size-k min-heap / QuickSelect. |
| 253 | Meeting Rooms II | Medium | Min-heap of end times. |
| 295 | Find Median from Data Stream | Hard | Two heaps. |
| 347 | Top K Frequent Elements | Medium | Frequency map + bounded heap / bucket. |
| 373 | Find K Pairs with Smallest Sums | Medium | Frontier min-heap. |
| 378 | Kth Smallest Element in a Sorted Matrix | Medium | Matrix frontier heap / binary search. |
| 480 | Sliding Window Median | Hard | Two heaps + lazy deletion. |
| 502 | IPO | Hard | Capital min-heap + profit max-heap. |
| 621 | Task Scheduler | Medium | Max-heap + cooldown / formula. |
| 703 | Kth Largest Element in a Stream | Easy | Persistent size-k min-heap. |
| 743 | Network Delay Time | Medium | Dijkstra min-heap + stale-skip. |
| 767 | Reorganize String | Medium | Greedy max-heap with blocked previous char. |
| 973 | K Closest Points to Origin | Medium | Size-k max-heap / QuickSelect. |

---

## 10. Cheat Sheet

- **Indexing:** `parent=(i-1)/2`, `left=2i+1`, `right=2i+2`, last internal `n/2 - 1`.
- **BuildHeap O(n)** bottom-up; **n inserts O(n log n)**. Bulk-load when possible.
- **Primitives:** insert = append + sift-up; pop = replace root with last + sift-down.
- **Direction:** k largest -> size-k **min**-heap; k smallest -> size-k **max**-heap. Think "what do I evict?"
- **Top-K:** O(n log k), O(k), unordered output.
- **K closest:** size-k max-heap by squared distance/difference; avoid `Math.Sqrt`, use `long` for products.
- **Kth:** root of the bounded heap is the boundary; QuickSelect is the one-shot static-array alternative.
- **K-way merge:** heap holds current heads; pop then push successor -> O(N log k), O(k).
- **Median stream:** max-heap low + min-heap high; sizes differ by at most 1; cast before averaging.
- **Sliding median:** two heaps + delayed-delete map + logical sizes; prune stale roots before reading.
- **Sliding max/min:** deque beats heap.
- **Scheduling:** sort by start; min-heap active end/available times; root decides reuse.
- **Frequency/cooldown:** count map + max-heap by remaining count; block recently used item if needed.
- **.NET PQ:** min-heap, no decrease-key, not stable, `UnorderedItems` unsorted, prefer comparer over negating `int` priorities.
- **`EnqueueDequeue` vs `DequeueEnqueue`:** first may reject candidate; second always keeps candidate after removing old root.
- **Lazy deletion:** push new entry, validate on pop, skip stale (`if (d > best[node]) continue`).
- **Heapsort:** max-heap for ascending output; O(n log n), O(1), not stable.
- **Advanced heaps:** Fibonacci decrease-key is O(1) amortized and improves Dijkstra asymptotics, but binary heaps usually win in practice.

---

## See Also

- [Greedy](../Greedy/Greedy.md) - Most heap problems are greedy choices that need a moving best element.
- [Graphs](../Graphs/Graphs.md) - Dijkstra and Prim are heap-driven graph algorithms.
- [Trees](../Trees/Trees.md) - A heap is a complete binary tree; a BST is the ordered alternative.
- [Stack and Queue](../Stack%20and%20Queue/Stack%20and%20Queue.md) - A deque, not a heap, is the O(n) answer for sliding-window max.
- [DSA Patterns](../DSAPatterns/DSAPatterns.md) - master index: pattern selection flowchart and complexity-from-constraints.
- [Practice Roadmap](../DSAPatterns/Practice-Roadmap.md) - the tiered problem set to drill this topic.
