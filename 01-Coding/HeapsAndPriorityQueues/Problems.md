# Heaps and Priority Queues — Problems

| # | Problem | LeetCode | Pattern | Difficulty |
| - | ------- | -------- | ------- | ---------- |
| 1 | Last Stone Weight | 1046 | Top K / Max-heap | Easy |
| 2 | Kth Largest Element in a Stream | 703 | Top K | Easy |
| 3 | Kth Largest Element in an Array | 215 | Top K | Medium |
| 4 | K Closest Points to Origin | 973 | Top K | Medium |
| 5 | Top K Frequent Elements | 347 | Top K + Frequency | Medium |
| 6 | Top K Frequent Words | 692 | Top K + Tie-break | Medium |
| 7 | Ugly Number II | 264 | Min-heap dedup | Medium |
| 8 | Find Median from Data Stream | 295 | Two Heaps | Hard |
| 9 | Sliding Window Median | 480 | Two Heaps + Lazy | Hard |
| 10 | Merge k Sorted Lists | 23 | K-Way Merge | Hard |
| 11 | Kth Smallest Element in a Sorted Matrix | 378 | K-Way Merge | Medium |
| 12 | Smallest Range Covering Elements from K Lists | 632 | K-Way Merge | Hard |
| 13 | Task Scheduler | 621 | Scheduling + Heap | Medium |
| 14 | Meeting Rooms II | 253 | Scheduling + Heap | Medium |
| 15 | Meeting Rooms III | 2402 | Scheduling + Dual Heap | Hard |
| 16 | Reorganize String | 767 | Greedy + Heap | Medium |
| 17 | Minimum Cost to Connect Sticks | 1167 | Greedy + Heap | Medium |
| 18 | IPO | 502 | Greedy + Heap | Hard |
| 19 | Design Twitter | 355 | K-Way Merge Design | Medium |

---

## Top K

### Last Stone Weight — LeetCode 1046

Repeatedly smash the two heaviest stones. If equal, both destroy; if not, the heavier one survives with weight = difference. Return the last stone weight or 0.

**Example:** `stones = [2,7,4,1,8,1]` → `1`

```text
BRUTE FORCE | O(n²) | O(1)
Scan for two heaviest on every iteration.

------------------------------------------------------------------------------

OPTIMAL — MAX-HEAP | O(n log n) | O(n)
Push all stones. Repeatedly extract two maxima, push the difference if non-zero.
```

```csharp
public int LastStoneWeight(int[] stones)
{
    // max-heap via negated priority
    var heap = new PriorityQueue<int, int>();
    foreach (int s in stones) heap.Enqueue(s, -s);
    while (heap.Count > 1)
    {
        int a = heap.Dequeue(); // heaviest
        int b = heap.Dequeue(); // second heaviest
        if (a != b) heap.Enqueue(a - b, -(a - b));
    }
    return heap.Count == 0 ? 0 : heap.Peek();
}
```

> **Key insight:** A max-heap makes "always pick the current maximum" a single O(log n) operation.

---

### Kth Largest Element in a Stream — LeetCode 703

Design a class that, on every `add(val)`, returns the Kth largest element seen so far.

**Example:** k=3, init=[4,5,8,2]; add(3)→4, add(5)→5, add(10)→5, add(9)→8, add(4)→8

```text
BRUTE FORCE | O(n log n) per add | O(n)
Re-sort on every add; return index k-1.

------------------------------------------------------------------------------

OPTIMAL — MIN-HEAP SIZE K | O(log k) per add | O(k)
Maintain a min-heap of the K largest elements seen. The heap minimum is the answer.
```

```csharp
public class KthLargest
{
    private readonly PriorityQueue<int, int> _heap = new();
    private readonly int _k;

    public KthLargest(int k, int[] nums)
    {
        _k = k;
        foreach (int n in nums) Add(n);
    }

    public int Add(int val)
    {
        _heap.Enqueue(val, val);
        if (_heap.Count > _k) _heap.Dequeue();
        return _heap.Peek(); // kth largest = min of top-k
    }
}
```

> **Key insight:** A min-heap of size K always holds the K largest elements; its minimum is the Kth largest.

---

### Kth Largest Element in an Array — LeetCode 215

Return the Kth largest element (not Kth distinct). Duplicates counted separately.

**Example:** `nums=[3,2,1,5,6,4], k=2` → `5`

```text
FULL SORT | O(n log n) | O(1)
Sort descending; return nums[k-1].

------------------------------------------------------------------------------

MIN-HEAP SIZE K | O(n log k) | O(k)
Stream through nums; maintain a min-heap of size k.
Return heap minimum.

------------------------------------------------------------------------------

OPTIMAL — QUICKSELECT | O(n) average, O(n²) worst | O(1)
Partition around a pivot; recurse only into the relevant half.
See full implementation → SearchingAndSorting: Quickselect
```

```csharp
// Heap solution — O(n log k) — use when k ≪ n or data is streaming
public int FindKthLargest(int[] nums, int k)
{
    var minHeap = new PriorityQueue<int, int>();
    foreach (int num in nums)
    {
        minHeap.Enqueue(num, num);
        if (minHeap.Count > k) minHeap.Dequeue();
    }
    return minHeap.Peek();
}
```

> **Key insight:** Min-heap of size K is O(n log k); for a one-shot array, quickselect is O(n) average — see [Searching and Sorting](../SearchingAndSorting/SearchingAndSorting.md) for the quickselect implementation.

---

### K Closest Points to Origin — LeetCode 973

Return the K points closest to (0,0). Any order.

**Example:** `points=[[1,3],[-2,2]], k=1` → `[[-2,2]]`

```text
FULL SORT | O(n log n) | O(1)
Sort by squared distance; return first k.

------------------------------------------------------------------------------

OPTIMAL — MAX-HEAP SIZE K | O(n log k) | O(k)
Keep a max-heap of size K keyed by squared distance.
Evict the farthest point when size exceeds K.
```

```csharp
public int[][] KClosest(int[][] points, int k)
{
    // max-heap on distance (negate to use PriorityQueue as max-heap)
    var heap = new PriorityQueue<int[], int>();
    foreach (int[] p in points)
    {
        int dist = p[0] * p[0] + p[1] * p[1];
        heap.Enqueue(p, -dist); // negate = max-heap
        if (heap.Count > k) heap.Dequeue();
    }
    return heap.UnorderedItems.Select(x => x.Element).ToArray();
}
```

> **Key insight:** Max-heap of size K evicts the *farthest* point on overflow, ensuring only the K closest remain.

---

### Top K Frequent Elements — LeetCode 347

Return the K most frequent elements. Result can be in any order.

**Example:** `nums=[1,1,1,2,2,3], k=2` → `[1,2]`

```text
SORT BY FREQUENCY | O(n log n) | O(n)
Build frequency map; sort by value descending; return first k keys.

------------------------------------------------------------------------------

MIN-HEAP | O(n log k) | O(n)
Build frequency map; use min-heap of size k keyed by frequency.

------------------------------------------------------------------------------

OPTIMAL — BUCKET SORT | O(n) | O(n)
Frequency is at most n; create n+1 buckets indexed by frequency; collect from top.
```

```csharp
public int[] TopKFrequent(int[] nums, int k)
{
    var freq = new Dictionary<int, int>();
    foreach (int n in nums)
        freq[n] = freq.GetValueOrDefault(n) + 1;

    // bucket[i] = list of numbers that appear exactly i times
    var bucket = new List<int>[nums.Length + 1];
    foreach (var (num, cnt) in freq)
    {
        bucket[cnt] ??= new List<int>();
        bucket[cnt].Add(num);
    }

    var result = new List<int>();
    for (int i = bucket.Length - 1; i >= 1 && result.Count < k; i--)
        if (bucket[i] != null) result.AddRange(bucket[i]);

    return result.Take(k).ToArray();
}
```

> **Key insight:** Bucket sort on frequency achieves O(n) when you know the frequency range is bounded by n.

---

### Top K Frequent Words — LeetCode 692

Return K most frequent words. Tie-break: lexicographically smaller word ranks higher.

**Example:** `words=["i","love","leetcode","i","love","coding"], k=2` → `["i","love"]`

```text
HASH MAP + SORT | O(n + m log m) | O(n)
Count frequencies; sort with custom comparator (desc freq, asc lex); return first k.

------------------------------------------------------------------------------

OPTIMAL — MIN-HEAP | O(n + m log k) | O(n + k)
Count frequencies; keep min-heap of size k with "worst candidate first" ordering
(lower freq first, then lexicographically larger first as the worst).
```

```csharp
public IList<string> TopKFrequent(string[] words, int k)
{
    var freq = new Dictionary<string, int>();
    foreach (string w in words)
        freq[w] = freq.GetValueOrDefault(w) + 1;

    // min-heap: worst candidate at top (lowest freq; if tied, lex-largest)
    var heap = new PriorityQueue<string, (int negFreq, string word)>();
    foreach (var (word, cnt) in freq)
    {
        heap.Enqueue(word, (-cnt, word)); // (-cnt, word) lex comparison evicts worst
        if (heap.Count > k) heap.Dequeue();
    }

    var result = new List<string>();
    while (heap.Count > 0) result.Add(heap.Dequeue());
    result.Reverse();
    return result;
}
```

> **Key insight:** Tuple priority `(-frequency, word)` lets the min-heap naturally evict the word with lowest frequency (or highest lex if tied), leaving the K best candidates.

---

### Ugly Number II — LeetCode 264

An ugly number has only prime factors 2, 3, 5. Return the nth ugly number.

**Example:** `n=10` → `12` (sequence: 1,2,3,4,5,6,8,9,10,12)

```text
BRUTE FORCE | O(n · ugly(n)) | O(1)
For every integer, check if all prime factors are in {2,3,5}.

------------------------------------------------------------------------------

OPTIMAL — MIN-HEAP DEDUP | O(n log n) | O(n)
Start with 1. Repeatedly extract min, push min×2, min×3, min×5.
Use a HashSet to skip duplicates.
```

```csharp
public int NthUglyNumber(int n)
{
    var heap = new PriorityQueue<long, long>();
    var seen = new HashSet<long> { 1L };
    heap.Enqueue(1L, 1L);
    int[] factors = { 2, 3, 5 };
    long curr = 1;
    for (int i = 0; i < n; i++)
    {
        curr = heap.Dequeue();
        foreach (int f in factors)
        {
            long next = curr * f;
            if (seen.Add(next)) heap.Enqueue(next, next);
        }
    }
    return (int)curr;
}
```

> **Key insight:** A min-heap always surfaces the next ugly number; a HashSet prevents duplicates from multiplying exponentially.

---

## Two Heaps

### Find Median from Data Stream — LeetCode 295

Design a data structure supporting `addNum(int)` and `findMedian() → double`.

**Example:** add(1), add(2), findMedian()→1.5; add(3), findMedian()→2

```text
SORT ON EACH QUERY | O(n log n) per query | O(n)

------------------------------------------------------------------------------

SORTED INSERTION | O(n) add, O(1) find | O(n)
Binary search for position O(log n) but shifting is O(n).

------------------------------------------------------------------------------

OPTIMAL — TWO HEAPS | O(log n) add, O(1) find | O(n)
lower = max-heap (smaller half), upper = min-heap (larger half).
Invariant: lower.Count == upper.Count or lower.Count == upper.Count + 1.
Cross-invariant: max(lower) ≤ min(upper).
```

```csharp
public class MedianFinder
{
    private readonly PriorityQueue<int, int> _lower = new(); // max-heap via negated priority
    private readonly PriorityQueue<int, int> _upper = new(); // min-heap

    public void AddNum(int num)
    {
        _lower.Enqueue(num, -num);

        // enforce cross-invariant: every element in lower ≤ every element in upper
        _lower.TryPeek(out int loMax, out _);
        if (_upper.Count > 0)
        {
            _upper.TryPeek(out int upMin, out _);
            if (loMax > upMin)
            {
                _lower.Dequeue();
                _upper.Enqueue(loMax, loMax);
            }
        }

        // enforce size invariant
        if (_lower.Count > _upper.Count + 1)
        {
            int v = _lower.Dequeue();
            _upper.Enqueue(v, v);
        }
        else if (_upper.Count > _lower.Count)
        {
            int v = _upper.Dequeue();
            _lower.Enqueue(v, -v);
        }
    }

    public double FindMedian()
    {
        if (_lower.Count > _upper.Count)
        {
            _lower.TryPeek(out int m, out _);
            return m;
        }
        _lower.TryPeek(out int a, out _);
        _upper.TryPeek(out int b, out _);
        return (a + b) / 2.0;
    }
}
```

> **Key insight:** Two heaps partition the stream into halves; the median is always at one or both tops — O(1) to read.

---

### Sliding Window Median — LeetCode 480

Given `nums` and window size `k`, return the median of each window of size k.

**Example:** `nums=[1,3,-1,-3,5,3,6,7], k=3` → `[1,-1,-1,3,5,6]`

```text
BRUTE FORCE | O(n · k log k) | O(k)
Sort each window independently.

------------------------------------------------------------------------------

OPTIMAL — TWO HEAPS + LAZY DELETION | O(n log k) | O(k)
Same two-heap invariant as MedianFinder.
On each slide: add new element, mark outgoing element as "stale", lazy-delete
from heap tops before reading median.
```

```csharp
public double[] MedianSlidingWindow(int[] nums, int k)
{
    // max-heap lower (negate), min-heap upper
    var lower = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));
    var upper = new PriorityQueue<int, int>();
    var lazy = new Dictionary<int, int>(); // val → count of pending removals
    var result = new double[nums.Length - k + 1];

    void Add(int v)
    {
        lower.Enqueue(v, v); // max-heap: use natural ordering with custom comparer
        int lo = lower.Dequeue();
        upper.Enqueue(lo, lo);
        if (upper.Count > lower.Count)
        {
            int up = upper.Dequeue();
            lower.Enqueue(up, up);
        }
    }

    void Remove(int v)
    {
        lazy[v] = lazy.GetValueOrDefault(v) + 1;
        // adjust size balance eagerly by peeking and deciding which heap owns v
        if (v <= GetLowerTop()) { /* v is in lower side — it will be cleaned there */ }
        if (lower.Count > upper.Count + 1)
        {
            int top = lower.Dequeue();
            upper.Enqueue(top, top);
        }
        else if (upper.Count > lower.Count)
        {
            int top = upper.Dequeue();
            lower.Enqueue(top, top);
        }
    }

    int GetLowerTop()
    {
        while (lower.Count > 0 && lazy.GetValueOrDefault(lower.Peek()) > 0)
        {
            lazy[lower.Peek()]--;
            lower.Dequeue();
        }
        return lower.Count > 0 ? lower.Peek() : int.MaxValue;
    }

    int GetUpperTop()
    {
        while (upper.Count > 0 && lazy.GetValueOrDefault(upper.Peek()) > 0)
        {
            lazy[upper.Peek()]--;
            upper.Dequeue();
        }
        return upper.Count > 0 ? upper.Peek() : int.MinValue;
    }

    // initialise window
    for (int i = 0; i < k; i++) Add(nums[i]);

    for (int i = 0; i < nums.Length - k + 1; i++)
    {
        int lTop = GetLowerTop();
        int uTop = GetUpperTop();
        result[i] = k % 2 == 1
            ? lTop
            : (lTop + (double)uTop) / 2.0;

        if (i + k < nums.Length)
        {
            Add(nums[i + k]);
            Remove(nums[i]);
        }
    }
    return result;
}
```

> **Key insight:** Lazy deletion defers the cost of removing arbitrary elements; stale entries are discarded when they bubble up to the heap top.

---

## K-Way Merge

### Merge k Sorted Lists — LeetCode 23

Merge K sorted linked lists into one sorted list.

**Example:** `lists=[[1,4,5],[1,3,4],[2,6]]` → `[1,1,2,3,4,4,5,6]`

```text
BRUTE FORCE | O(N log N) | O(N)
Collect all values, sort, rebuild list.

------------------------------------------------------------------------------

PAIR-WISE MERGE | O(N log K) | O(1)
Merge lists two at a time, halving the number each round — K rounds total.

------------------------------------------------------------------------------

OPTIMAL — MIN-HEAP ON LIST HEADS | O(N log K) | O(K)
N = total nodes, K = number of lists.
Push each list's head. Extract min, append to result, push that node's next.
Same asymptotic as pair-wise but constant factor is better and simpler code.
```

```csharp
public ListNode MergeKLists(ListNode[] lists)
{
    // (value, tiebreak index) to handle equal values stably
    var heap = new PriorityQueue<ListNode, (int val, int idx)>();
    for (int i = 0; i < lists.Length; i++)
        if (lists[i] != null) heap.Enqueue(lists[i], (lists[i].val, i));

    var dummy = new ListNode(0);
    var cur = dummy;
    int seq = 0;
    while (heap.TryDequeue(out ListNode? node, out var pri))
    {
        cur.next = node;
        cur = cur.next;
        if (node.next != null)
            heap.Enqueue(node.next, (node.next.val, seq++));
    }
    return dummy.next;
}
```

> **Key insight:** A min-heap over K list heads merges K sorted sequences in O(N log K) — the canonical k-way merge pattern.

---

### Kth Smallest Element in a Sorted Matrix — LeetCode 378

n×n matrix where each row and column is sorted. Find the Kth smallest element.

**Example:** `matrix=[[1,5,9],[10,11,13],[12,13,15]], k=8` → `13`

```text
FULL FLATTEN + SORT | O(n² log n²) | O(n²)

------------------------------------------------------------------------------

BINARY SEARCH ON VALUE | O(n log(max-min)) | O(1)
Binary search on the answer; count elements ≤ mid using staircase scan.

------------------------------------------------------------------------------

OPTIMAL — MIN-HEAP K-WAY MERGE | O(k log n) | O(n)
Push first element of each row. Extract min k times;
when extracting (r,c) push (r, c+1) if in bounds.
```

```csharp
public int KthSmallest(int[][] matrix, int k)
{
    int n = matrix.Length;
    // heap item: (value, row, col)
    var heap = new PriorityQueue<(int r, int c), int>();
    for (int r = 0; r < n; r++)
        heap.Enqueue((r, 0), matrix[r][0]);

    int result = 0;
    for (int i = 0; i < k; i++)
    {
        heap.TryDequeue(out var pos, out _);
        result = matrix[pos.r][pos.c];
        if (pos.c + 1 < n)
            heap.Enqueue((pos.r, pos.c + 1), matrix[pos.r][pos.c + 1]);
    }
    return result;
}
```

> **Key insight:** Treating each matrix row as a sorted list reduces this to k-way merge; extracting K times gives the Kth smallest in O(k log n).

---

### Smallest Range Covering Elements from K Lists — LeetCode 632

Given K sorted lists, find the smallest range [a,b] such that at least one element from each list falls within it.

**Example:** `nums=[[4,10,15,24,26],[0,9,12,20],[5,18,22,30]]` → `[20,24]`

```text
BRUTE FORCE | O(n^K) | O(K)
Try all combinations of one element per list.

------------------------------------------------------------------------------

OPTIMAL — MIN-HEAP SLIDING WINDOW | O(N log K) | O(K)
Maintain a min-heap with one element per list (the current "left pointer" per list).
Track the running maximum across all K current elements.
The current range is [heap.min, runningMax].
Advance the list that contributed the minimum (shrinks range from left).
Stop when any list is exhausted.
```

```csharp
public int[] SmallestRange(IList<IList<int>> nums)
{
    int k = nums.Count;
    // heap: (value, listIndex, posInList)
    var heap = new PriorityQueue<(int val, int li, int pi), int>();
    int curMax = int.MinValue;

    for (int i = 0; i < k; i++)
    {
        heap.Enqueue((nums[i][0], i, 0), nums[i][0]);
        curMax = Math.Max(curMax, nums[i][0]);
    }

    int[] best = { 0, int.MaxValue };

    while (heap.Count == k) // all lists still represented
    {
        heap.TryDequeue(out var item, out int curMin);
        if (curMax - curMin < best[1] - best[0])
            best = new[] { curMin, curMax };

        int next = item.pi + 1;
        if (next >= nums[item.li].Count) break; // list exhausted
        int nv = nums[item.li][next];
        heap.Enqueue((nv, item.li, next), nv);
        curMax = Math.Max(curMax, nv);
    }
    return best;
}
```

> **Key insight:** The min-heap always shows the smallest value across all K lists; advancing that list's pointer is the only way to reduce the range width.

---

## Scheduling and Intervals

### Task Scheduler — LeetCode 621

CPU tasks with cooldown n. Find minimum time to execute all tasks.

**Example:** `tasks=["A","A","A","B","B","B"], n=2` → `8`

```text
BRUTE FORCE | O(n · m) | O(n)
Simulate every tick; scan for an available task.

------------------------------------------------------------------------------

MAX-HEAP + COOLDOWN QUEUE | O(n log n) | O(n)
Max-heap on frequency. Cooldown queue stores (remainingFreq, availableTime).
Each tick: release expired tasks, execute highest-frequency available task.

------------------------------------------------------------------------------

OPTIMAL — MATH FORMULA | O(n) | O(1)
(maxFreq - 1) * (n + 1) + countOfMaxFreq  vs  tasks.Length — take the max.
```

```csharp
// Simulation — O(n log n)
public int LeastInterval(char[] tasks, int n)
{
    var freq = new int[26];
    foreach (char t in tasks) freq[t - 'A']++;

    var maxHeap = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));
    foreach (int f in freq)
        if (f > 0) maxHeap.Enqueue(f, f);

    int time = 0;
    var cooldown = new Queue<(int freq, int available)>();

    while (maxHeap.Count > 0 || cooldown.Count > 0)
    {
        time++;
        // release tasks whose cooldown has expired
        if (cooldown.Count > 0 && cooldown.Peek().available == time)
        {
            var (f, _) = cooldown.Dequeue();
            maxHeap.Enqueue(f, f);
        }
        // execute most-frequent available task
        if (maxHeap.Count > 0)
        {
            int f = maxHeap.Dequeue();
            if (f - 1 > 0) cooldown.Enqueue((f - 1, time + n + 1));
        }
        // else: idle tick
    }
    return time;
}

// Math formula — O(n)
public int LeastIntervalMath(char[] tasks, int n)
{
    var freq = new int[26];
    foreach (char t in tasks) freq[t - 'A']++;
    int maxFreq = freq.Max();
    int countMax = freq.Count(f => f == maxFreq);
    return Math.Max(tasks.Length, (maxFreq - 1) * (n + 1) + countMax);
}
```

> **Key insight:** The formula frames tasks in `(n+1)`-wide slots anchored on the most-frequent task; idle time only appears when no other task can fill the cooldown gaps.

---

### Meeting Rooms II — LeetCode 253

Given meeting intervals, find the minimum number of conference rooms required.

**Example:** `intervals=[[0,30],[5,10],[15,20]]` → `2`

```text
BRUTE FORCE | O(n²) | O(n)
For each meeting, check how many previous meetings overlap.

------------------------------------------------------------------------------

OPTIMAL — SORT + MIN-HEAP ON END TIMES | O(n log n) | O(n)
Sort by start time. Use min-heap of end times of ongoing meetings.
For each new meeting: if heap.min ≤ start, reuse that room (pop); else add a room.
```

```csharp
public int MinMeetingRooms(int[][] intervals)
{
    Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
    var endTimes = new PriorityQueue<int, int>(); // min-heap of end times

    foreach (int[] iv in intervals)
    {
        if (endTimes.Count > 0 && endTimes.Peek() <= iv[0])
            endTimes.Dequeue(); // room freed up
        endTimes.Enqueue(iv[1], iv[1]);
    }
    return endTimes.Count;
}
```

> **Key insight:** The heap tracks the earliest-ending ongoing meeting; if it ends before the new one starts, we reuse that room — room count = heap size.

---

### Meeting Rooms III — LeetCode 2402

n rooms (0-indexed). Each meeting uses the lowest-numbered available room. If none available, delay until the earliest-ending room frees up (same duration). Return the room with the most meetings.

**Example:** `n=2, meetings=[[0,10],[1,5],[2,7],[3,4]]` → `0`

```text
OPTIMAL — DUAL MIN-HEAP | O(m log n) | O(n + m)
availableRooms: min-heap by room number.
busyRooms: min-heap by (endTime, roomNumber).
Process meetings sorted by start time; free expired rooms; assign or delay.
```

```csharp
public int MostBooked(int n, int[][] meetings)
{
    Array.Sort(meetings, (a, b) => a[0].CompareTo(b[0]));
    var available = new PriorityQueue<int, int>();         // (room, room)
    var busy = new PriorityQueue<int, (long end, int room)>(); // room keyed by (end, room)
    for (int i = 0; i < n; i++) available.Enqueue(i, i);

    var count = new int[n];

    foreach (int[] m in meetings)
    {
        long start = m[0], end = m[1];
        // free rooms that ended by start
        while (busy.Count > 0 && busy.Peek() <= start - 1) // peek gives room; need (end,room)
        {
            // Note: PriorityQueue keyed by (long,int) tuple — use a proper approach
            break; // placeholder — see below
        }
        // Using a proper dual-heap with long tuple key:
    }

    // Clean implementation with correct tuple key:
    var avail2 = new PriorityQueue<int, int>();
    var busy2 = new PriorityQueue<int, (long, int)>();
    for (int i = 0; i < n; i++) avail2.Enqueue(i, i);
    var cnt2 = new int[n];

    foreach (int[] m in meetings)
    {
        long s = m[0], e = m[1], dur = e - s;

        // free expired rooms
        while (busy2.Count > 0)
        {
            busy2.TryPeek(out _, out var key);
            if (key.Item1 <= s) { busy2.Dequeue(); avail2.Enqueue(key.Item2, key.Item2); }
            else break;
        }

        int room;
        long finish;
        if (avail2.Count > 0)
        {
            room = avail2.Dequeue();
            finish = e;
        }
        else
        {
            busy2.TryDequeue(out _, out var earliest);
            room = earliest.Item2;
            finish = earliest.Item1 + dur;
        }
        cnt2[room]++;
        busy2.Enqueue(room, (finish, room));
    }

    int best = 0;
    for (int i = 1; i < n; i++)
        if (cnt2[i] > cnt2[best]) best = i;
    return best;
}
```

> **Key insight:** Two heaps separate "available" from "busy"; freeing rooms as their end times expire is O(log n) per meeting.

---

## Greedy with a Heap

### Reorganize String — LeetCode 767

Rearrange characters so no two adjacent characters are the same. Return "" if impossible.

**Example:** `s="aab"` → `"aba"`

```text
BRUTE FORCE | O(n! / freq!) | O(n)
Try all permutations.

------------------------------------------------------------------------------

OPTIMAL — GREEDY MAX-HEAP | O(n log 26) = O(n) | O(26) = O(1)
At each position, pick the highest-frequency character that differs from the previous.
Max-heap gives the highest-frequency character in O(log 26).
```

```csharp
public string ReorganizeString(string s)
{
    var freq = new int[26];
    foreach (char c in s) freq[c - 'a']++;

    // max-heap on frequency
    var heap = new PriorityQueue<char, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));
    for (int i = 0; i < 26; i++)
        if (freq[i] > 0) heap.Enqueue((char)('a' + i), freq[i]);

    var sb = new System.Text.StringBuilder();
    while (heap.Count > 0)
    {
        // take the most frequent character
        heap.TryDequeue(out char first, out int f1);
        sb.Append(first);

        if (heap.Count == 0)
        {
            if (f1 > 1) return ""; // can't place remaining copies
            break;
        }

        // take the second most frequent to avoid adjacency
        heap.TryDequeue(out char second, out int f2);
        sb.Append(second);

        if (f1 > 1) heap.Enqueue(first, f1 - 1);
        if (f2 > 1) heap.Enqueue(second, f2 - 1);
    }
    return sb.ToString();
}
```

> **Key insight:** Greedily placing the two most-frequent characters each round prevents any character from being forced adjacent to itself.

---

### Minimum Cost to Connect Sticks — LeetCode 1167

Combine sticks one pair at a time; cost = sum of their lengths. Minimise total cost.

**Example:** `sticks=[2,4,3]` → `14` (2+3=5, 5+4=9, total=14)

```text
BRUTE FORCE | O(n² log n) | O(n)
Always scan for the two shortest sticks.

------------------------------------------------------------------------------

OPTIMAL — MIN-HEAP GREEDY | O(n log n) | O(n)
Huffman-encoding insight: always merge the two cheapest items.
Min-heap gives the two smallest in O(log n); push their sum back.
```

```csharp
public long ConnectSticks(int[] sticks)
{
    var heap = new PriorityQueue<long, long>();
    foreach (int s in sticks) heap.Enqueue(s, s);

    long totalCost = 0;
    while (heap.Count > 1)
    {
        long a = heap.Dequeue();
        long b = heap.Dequeue();
        long cost = a + b;
        totalCost += cost;
        heap.Enqueue(cost, cost);
    }
    return totalCost;
}
```

> **Key insight:** This is Huffman encoding — the exchange argument proves that merging the two smallest first minimises total cost.

---

### IPO — LeetCode 502

Start with capital `w`. You can complete at most `k` projects. Each project has a `profit` and a `capital` requirement. Maximise final capital.

**Example:** `k=2, w=0, profits=[1,2,3], capital=[0,1,1]` → `4`

```text
BRUTE FORCE | O(k · n) | O(1)
Each round, scan all projects for the best affordable one.

------------------------------------------------------------------------------

OPTIMAL — MIN-HEAP + MAX-HEAP | O(n log n + k log n) | O(n)
1. Sort projects by capital requirement (or use a min-heap).
2. For each of k rounds: unlock all projects with capital ≤ w into a max-heap on profit.
3. Pick the highest-profit unlocked project; add its profit to w.
```

```csharp
public int FindMaximisedCapital(int k, int w, int[] profits, int[] capital)
{
    int n = profits.Length;
    // min-heap on capital requirement to unlock projects efficiently
    var locked = new PriorityQueue<int, int>(); // (profitIndex, capitalNeeded)
    for (int i = 0; i < n; i++) locked.Enqueue(i, capital[i]);

    // max-heap on profit for unlocked projects
    var unlocked = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));

    for (int round = 0; round < k; round++)
    {
        // unlock all affordable projects
        while (locked.Count > 0 && locked.Peek() <= w)
        {
            locked.TryDequeue(out int idx, out _);
            unlocked.Enqueue(profits[idx], profits[idx]);
        }
        if (unlocked.Count == 0) break; // no affordable project
        w += unlocked.Dequeue();
    }
    return w;
}
```

> **Key insight:** Two heaps act as a gate: the min-heap on capital unlocks projects as your wealth grows; the max-heap on profit greedily selects the best available project each round.

---

## Design

### Design Twitter — LeetCode 355

Design Twitter: `postTweet(userId, tweetId)`, `getNewsFeed(userId)` (10 most recent from self + followees), `follow`, `unfollow`.

**Example:** user 1 posts tweet 5; user 1 follows user 2; user 2 posts tweet 6; user 1's feed → [6,5]

```text
BRUTE FORCE | O(n) per post, O(n log n) per feed | O(n)
Store all tweets; on getNewsFeed, filter + sort.

------------------------------------------------------------------------------

OPTIMAL — K-WAY MERGE ON PER-USER TWEET LISTS | O(10 log F) per feed | O(F)
F = number of followees + self.
Each user keeps a list of their own tweets (most-recent-first).
getNewsFeed = merge up to F lists, extract top 10 — exactly the k-way merge pattern.
```

```csharp
public class Twitter
{
    private int _tick = 0;
    private readonly Dictionary<int, List<(int time, int tweetId)>> _tweets = new();
    private readonly Dictionary<int, HashSet<int>> _following = new();

    public void PostTweet(int userId, int tweetId)
    {
        if (!_tweets.ContainsKey(userId)) _tweets[userId] = new();
        _tweets[userId].Add((_tick++, tweetId));
    }

    public IList<int> GetNewsFeed(int userId)
    {
        // collect all users to include (self + followees)
        var sources = new List<int> { userId };
        if (_following.TryGetValue(userId, out var follows))
            sources.AddRange(follows);

        // min-heap: (negTime, tweetId, sourceUserId, indexInList)
        // negTime so smallest = most recent = highest time
        var heap = new PriorityQueue<(int idx, int uid), int>();
        foreach (int uid in sources)
        {
            if (_tweets.TryGetValue(uid, out var list) && list.Count > 0)
            {
                int i = list.Count - 1; // most recent
                heap.Enqueue((i, uid), -list[i].time); // negate for max (most recent first)
            }
        }

        var feed = new List<int>();
        while (heap.Count > 0 && feed.Count < 10)
        {
            heap.TryDequeue(out var item, out _);
            var (idx, uid) = item;
            feed.Add(_tweets[uid][idx].tweetId);
            if (idx > 0)
                heap.Enqueue((idx - 1, uid), -_tweets[uid][idx - 1].time);
        }
        return feed;
    }

    public void Follow(int followerId, int followeeId)
    {
        if (!_following.ContainsKey(followerId)) _following[followerId] = new();
        _following[followerId].Add(followeeId);
    }

    public void Unfollow(int followerId, int followeeId)
    {
        _following.GetValueOrDefault(followerId)?.Remove(followeeId);
    }
}
```

> **Key insight:** Per-user tweet lists are already sorted by time; `getNewsFeed` is just a k-way merge of F sorted lists — extract 10 in O(10 log F).
