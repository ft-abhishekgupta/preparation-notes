# Advanced Patterns — Problems

| # | Problem | LeetCode | Pattern | Difficulty |
| - | ------- | -------- | ------- | ---------- |
| 1 | Range Sum Query — Immutable | 303 | Prefix sum | Easy |
| 2 | Range Sum Query 2D — Immutable | 304 | 2D prefix sum | Medium |
| 3 | Range Sum Query — Mutable | 307 | Fenwick / Segment tree | Medium |
| 4 | Car Pooling | 1094 | Difference array / sweep line | Medium |
| 5 | Corporate Flight Bookings | 1109 | Difference array | Medium |
| 6 | Meeting Rooms II | 253 | Sweep line | Medium |
| 7 | My Calendar I | 729 | Binary search / interval tree | Medium |
| 8 | My Calendar II | 731 | Sweep line / difference array | Medium |
| 9 | My Calendar III | 732 | Lazy segment tree | Hard |
| 10 | Count of Smaller Numbers After Self | 315 | Fenwick + coord compression | Hard |
| 11 | Longest Increasing Subsequence (Fenwick) | 300 | Fenwick + coord compression | Medium |
| 12 | Count of Range Sum | 327 | Fenwick + coord compression | Hard |
| 13 | The Skyline Problem | 218 | Sweep line + heap | Hard |
| 14 | Rectangle Area II | 850 | Sweep line + coord compression | Hard |
| 15 | LRU Cache | 146 | → [Linked Lists](../LinkedLists/Problems.md) | Medium |

---

## Prefix Sum and Difference Array

### Range Sum Query — Immutable (LeetCode 303)

Preprocess an integer array so repeated range sum queries `sumRange(left, right)` run in O(1).

**Example:** `nums = [-2, 0, 3, -5, 2, -1]`; `sumRange(0, 2)` → `1`; `sumRange(2, 5)` → `-1`

```text
BRUTE FORCE | O(n) per query | O(1)

Sum elements from left to right on each call.

------------------------------------------------------------------------------

OPTIMAL — PREFIX SUM | O(n) build, O(1) query | O(n)

prefix[i] = nums[0] + nums[1] + ... + nums[i-1]   (1-indexed; prefix[0] = 0)
sumRange(l, r) = prefix[r+1] - prefix[l]
```

```csharp
public class NumArray
{
    private readonly long[] _prefix;

    public NumArray(int[] nums)
    {
        _prefix = new long[nums.Length + 1];
        for (int i = 0; i < nums.Length; i++)
            _prefix[i + 1] = _prefix[i] + nums[i];
    }

    public long SumRange(int left, int right) => _prefix[right + 1] - _prefix[left];
}
```

> **Key insight:** shift the prefix array by one (`prefix[0] = 0`) to avoid a left-boundary special case; range sum is always a two-element subtraction.

---

### Range Sum Query 2D — Immutable (LeetCode 304)

Preprocess a 2D matrix to answer rectangle sum queries `sumRegion(r1, c1, r2, c2)` in O(1).

**Example:** `matrix[0][0..2] = [3,0,1]`; `sumRegion(2,1,4,3)` → `8`

```text
BRUTE FORCE | O(mn) per query | O(1)

Double loop over the rectangle each time.

------------------------------------------------------------------------------

OPTIMAL — 2D PREFIX SUM | O(mn) build, O(1) query | O(mn)

prefix[i][j] = sum of rectangle [0,0] to [i-1,j-1]  (1-indexed)
sumRegion(r1,c1,r2,c2) = prefix[r2+1][c2+1]
                        - prefix[r1][c2+1]
                        - prefix[r2+1][c1]
                        + prefix[r1][c1]   (inclusion-exclusion)
```

```csharp
public class NumMatrix
{
    private readonly long[,] _prefix;

    public NumMatrix(int[][] matrix)
    {
        int m = matrix.Length, n = matrix[0].Length;
        _prefix = new long[m + 1, n + 1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                _prefix[i, j] = matrix[i - 1][j - 1]
                               + _prefix[i - 1, j]
                               + _prefix[i, j - 1]
                               - _prefix[i - 1, j - 1];
    }

    public long SumRegion(int r1, int c1, int r2, int c2) =>
        _prefix[r2 + 1, c2 + 1]
      - _prefix[r1, c2 + 1]
      - _prefix[r2 + 1, c1]
      + _prefix[r1, c1];
}
```

> **Key insight:** 2D inclusion-exclusion — add the full bottom-right rectangle, subtract the two overlapping strips, add back the double-subtracted top-left corner.

---

### Car Pooling (LeetCode 1094)

Given trips `[passengers, from, to]` and a capacity, return whether all trips can be completed without exceeding capacity. Passengers board at `from` and alight at `to` (half-open interval).

**Example:** `trips = [[2,1,5],[3,3,7]], capacity = 4` → `false`

```text
BRUTE FORCE | O(n * range) | O(range)

For each trip, increment every stop in [from, to).

------------------------------------------------------------------------------

DIFFERENCE ARRAY | O(n + range) | O(range)

diff[from] += passengers; diff[to] -= passengers
Prefix-sum diff to get occupancy at each stop.

------------------------------------------------------------------------------

OPTIMAL — SWEEP LINE | O(n log n) | O(n)

Create events (pos, delta). Sort by pos, then close before open for tie-break.
Scan events; track running total. O(n log n) but works for any coordinate range.
```

```csharp
public bool CarPooling(int[][] trips, int capacity)
{
    // Difference array — coordinates ≤ 1000 so range is bounded
    int[] diff = new int[1001];
    foreach (var t in trips)
    {
        diff[t[1]] += t[0];
        diff[t[2]] -= t[0];   // passengers leave at t[2] (half-open)
    }
    int cur = 0;
    foreach (int d in diff)
    {
        cur += d;
        if (cur > capacity) return false;
    }
    return true;
}
```

> **Key insight:** difference array converts a range-update problem into O(1) updates + a single prefix-sum scan; use sweep-line events when coordinates are unbounded.

---

### Corporate Flight Bookings (LeetCode 1109)

`n` flights numbered `1..n`; bookings `[first, last, seats]` reserve `seats` on each flight from `first` to `last` (inclusive). Return the total seats booked on each flight.

**Example:** `bookings = [[1,2,10],[2,3,20],[2,5,25]], n = 5` → `[10,55,45,25,25]`

```text
BRUTE FORCE | O(n * bookings) | O(n)

For each booking, add seats to every flight in range.

------------------------------------------------------------------------------

OPTIMAL — DIFFERENCE ARRAY | O(n + bookings) | O(n)

diff[first-1] += seats; diff[last] -= seats  (0-indexed diff array of size n+1)
Prefix-sum gives the answer array.
```

```csharp
public int[] CorpFlightBookings(int[][] bookings, int n)
{
    int[] diff = new int[n + 1];
    foreach (var b in bookings)
    {
        diff[b[0] - 1] += b[2];
        diff[b[1]]     -= b[2];   // b[1] is inclusive, so subtract at b[1] (0-indexed)
    }
    int[] ans = new int[n];
    int cur = 0;
    for (int i = 0; i < n; i++)
    {
        cur += diff[i];
        ans[i] = cur;
    }
    return ans;
}
```

> **Key insight:** difference array is the go-to for "add a constant to a range, then read all values once" — O(1) per booking, O(n) final scan.

---

### Meeting Rooms II (LeetCode 253)

Given intervals `[start, end]`, find the minimum number of meeting rooms required (= maximum number of simultaneously overlapping intervals).

**Example:** `[[0,30],[5,10],[15,20]]` → `2`

- Heap framing (greedy, O(n log n)) → see [Heaps and Priority Queues](../HeapsAndPriorityQueues/Problems.md).

```text
BRUTE FORCE | O(n²) | O(1)

For each interval, count how many others overlap with it.

------------------------------------------------------------------------------

OPTIMAL — SWEEP LINE | O(n log n) | O(n)

Create +1 event at start and -1 event at end.
Sort by time; ties: end (-1) before start (+1) for half-open intervals.
Track running count; record maximum.
```

```csharp
public int MinMeetingRooms(int[][] intervals)
{
    var events = new List<(int time, int delta)>();
    foreach (var iv in intervals)
    {
        events.Add((iv[0], +1));
        events.Add((iv[1], -1));
    }
    // Sort: by time; on tie, end (-1) before start (+1)
    events.Sort((a, b) => a.time != b.time ? a.time.CompareTo(b.time) : a.delta.CompareTo(b.delta));

    int cur = 0, max = 0;
    foreach (var (_, delta) in events)
    {
        cur += delta;
        max = Math.Max(max, cur);
    }
    return max;
}
```

> **Key insight:** sweep line reduces "overlapping intervals at time t" to a running sum; the peak of that sum is the answer.

---

## Fenwick Tree

### Range Sum Query — Mutable (LeetCode 307)

Design a structure over an integer array supporting `Update(index, value)` (point set) and `SumRange(left, right)` (range sum).

**Example:** `nums = [1,3,5]`; `SumRange(0,2)` → `9`; `Update(1,2)`; `SumRange(0,2)` → `8`

```text
ARRAY | O(1) update, O(n) query | O(1)
PREFIX SUM | O(n) update, O(1) query | O(n)

Both are too slow when updates and queries are interleaved.

------------------------------------------------------------------------------

FENWICK TREE | O(log n) update, O(log n) query | O(n)

1-indexed BIT. Update walks up (i += i & -i). Query walks down (i -= i & -i).
SumRange(l, r) = Query(r+1) - Query(l)

------------------------------------------------------------------------------

OPTIMAL — SEGMENT TREE | O(log n) update, O(log n) query | O(4n)

Generalises to min, max, GCD — not just sum.
```

```csharp
public class NumArray
{
    private readonly long[] _bit;
    private readonly int _n;

    public NumArray(int[] nums)
    {
        _n = nums.Length;
        _bit = new long[_n + 1];
        for (int i = 0; i < _n; i++) Add(i + 1, nums[i]);
    }

    private void Add(int i, long delta)          // 1-indexed
    {
        for (; i <= _n; i += i & -i) _bit[i] += delta;
    }

    private long Prefix(int i)                   // 1-indexed prefix sum [1..i]
    {
        long s = 0;
        for (; i > 0; i -= i & -i) s += _bit[i];
        return s;
    }

    public void Update(int index, int val)
    {
        // Convert point-set to point-add by subtracting old value
        long old = Prefix(index + 1) - Prefix(index);
        Add(index + 1, val - old);
    }

    public long SumRange(int left, int right) => Prefix(right + 1) - Prefix(left);
}
```

> **Key insight:** Fenwick tree is the sweet spot between prefix sum (O(1) query) and naïve array (O(1) update) — both ops at O(log n). Always 1-indexed internally.

---

### Count of Smaller Numbers After Self (LeetCode 315)

For each element `nums[i]`, count how many elements to its right are strictly smaller.

**Example:** `[5,2,6,1]` → `[2,1,1,0]`

- Merge sort approach (divide & conquer) → see [Searching and Sorting](../SearchingAndSorting/Problems.md).

```text
BRUTE FORCE | O(n²) | O(1)

For each i, scan j > i and count nums[j] < nums[i].

------------------------------------------------------------------------------

OPTIMAL — FENWICK + COORDINATE COMPRESSION | O(n log n) | O(n)

Compress values to [1..n]. Scan right to left.
For each element (compressed rank r):
    answer[i] = Query(r - 1)   // count of elements already inserted with rank < r
    Update(r, +1)              // insert this element
```

```csharp
public IList<int> CountSmaller(int[] nums)
{
    int n = nums.Length;
    // Coordinate compression
    int[] sorted = nums.Distinct().OrderBy(x => x).ToArray();
    int Rank(int v) => Array.BinarySearch(sorted, v) + 1; // 1-indexed

    long[] bit = new long[sorted.Length + 1];
    void Add(int i) { for (; i <= sorted.Length; i += i & -i) bit[i]++; }
    long Query(int i) { long s = 0; for (; i > 0; i -= i & -i) s += bit[i]; return s; }

    int[] ans = new int[n];
    for (int i = n - 1; i >= 0; i--)
    {
        int r = Rank(nums[i]);
        ans[i] = (int)Query(r - 1);
        Add(r);
    }
    return ans;
}
```

> **Key insight:** scanning right-to-left turns "count smaller to the right" into "count smaller already inserted" — a Fenwick prefix query after coordinate compression.

---

### Longest Increasing Subsequence via Fenwick (LeetCode 300)

Find the length of the longest strictly increasing subsequence (LIS).

- Classical O(n log n) patience-sort / binary search approach → see [Dynamic Programming](../DynamicProgramming/Problems.md).

```text
DP | O(n²) | O(n)

dp[i] = 1 + max(dp[j]) for all j < i where nums[j] < nums[i].

------------------------------------------------------------------------------

OPTIMAL — FENWICK + COORDINATE COMPRESSION | O(n log n) | O(n)

Compress values. Scan left to right.
dp[i] = 1 + Query(rank(nums[i]) - 1)   // longest ending at a smaller value
Update(rank(nums[i]), dp[i])            // record best length at this value
```

```csharp
public int LengthOfLIS(int[] nums)
{
    int n = nums.Length;
    int[] sorted = nums.Distinct().OrderBy(x => x).ToArray();
    int Rank(int v) => Array.BinarySearch(sorted, v) + 1;

    int[] bit = new int[sorted.Length + 1];
    void Update(int i, int val) { for (; i <= sorted.Length; i += i & -i) bit[i] = Math.Max(bit[i], val); }
    int Query(int i) { int m = 0; for (; i > 0; i -= i & -i) m = Math.Max(m, bit[i]); return m; }

    int ans = 0;
    foreach (int x in nums)
    {
        int r = Rank(x);
        int len = Query(r - 1) + 1;
        Update(r, len);
        ans = Math.Max(ans, len);
    }
    return ans;
}
```

> **Key insight:** replace the Fenwick's sum with a max — `Update` stores the best LIS length ending at each compressed value; `Query(r-1)` retrieves the best LIS over all smaller values.

---

### Count of Range Sum (LeetCode 327)

Count the number of range sums `sum(i, j)` (i ≤ j) that lie within `[lower, upper]`.

**Example:** `nums = [-2,5,-1], lower = -2, upper = 2` → `3`

```text
BRUTE FORCE | O(n²) | O(n)

Compute all prefix sums; check every pair.

------------------------------------------------------------------------------

MERGE SORT | O(n log n) | O(n)

During merge, count pairs (left[i], right[j]) where lower ≤ right[j] - left[i] ≤ upper.

------------------------------------------------------------------------------

OPTIMAL — FENWICK + COORDINATE COMPRESSION | O(n log n) | O(n)

Build prefix sums. For each prefix[i], count prefix[j] in [prefix[i]-upper, prefix[i]-lower]
where j < i. Compress all prefix values and query a range on the BIT.
```

```csharp
public int CountRangeSum(int[] nums, int lower, int upper)
{
    int n = nums.Length;
    long[] prefix = new long[n + 1];
    for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];

    // Collect all values that will be queried
    var vals = new SortedSet<long>(prefix);
    foreach (long p in prefix) { vals.Add(p - lower); vals.Add(p - upper); }
    var sorted = vals.ToArray();
    int Rank(long v) => Array.BinarySearch(sorted, v) + 1;

    int[] bit = new int[sorted.Length + 1];
    void Add(int i) { for (; i <= sorted.Length; i += i & -i) bit[i]++; }
    int Query(int i) { int s = 0; for (; i > 0; i -= i & -i) s += bit[i]; return s; }
    int RangeQ(int l, int r) => l > r ? 0 : Query(r) - Query(l - 1);

    int ans = 0;
    Add(Rank(0)); // prefix[0] = 0 is already "seen"
    for (int i = 1; i <= n; i++)
    {
        // Count j < i where prefix[i] - prefix[j] in [lower, upper]
        // i.e., prefix[j] in [prefix[i]-upper, prefix[i]-lower]
        ans += RangeQ(Rank(prefix[i] - upper), Rank(prefix[i] - lower));
        Add(Rank(prefix[i]));
    }
    return ans;
}
```

> **Key insight:** transform "count pairs with range sum in [lower, upper]" into "count already-seen prefix values in a window" — a BIT range query after coordinate compression.

---

## Segment Tree

### My Calendar III (LeetCode 732)

Support `Book(start, end)` calls; after each, return the maximum number of overlapping bookings.

**Example:** `Book(10,20)` → `1`; `Book(50,60)` → `1`; `Book(10,40)` → `2`; `Book(5,15)` → `3`

```text
BRUTE FORCE | O(n²) | O(n)

Count overlaps naïvely after each booking.

------------------------------------------------------------------------------

DIFFERENCE ARRAY + SCAN | O(n²) | O(n)

Maintain events list; rescan on each booking.

------------------------------------------------------------------------------

OPTIMAL — LAZY SEGMENT TREE ON COMPRESSED COORDS | O(n log n) | O(n)

Coordinate-compress all endpoints. Build a lazy segment tree for range-max.
Each Book(s,e): range-add +1 to [s, e-1]; query global max (root value).
```

```csharp
public class MyCalendarThree
{
    // Dynamic segment tree (node-based) to avoid pre-allocating for 10^9 range
    private readonly Dictionary<int, int> _tree = new(), _lazy = new();

    private void Push(int node)
    {
        if (!_lazy.TryGetValue(node, out int lz) || lz == 0) return;
        foreach (int child in new[] { 2 * node, 2 * node + 1 })
        {
            _tree[child] = _tree.GetValueOrDefault(child) + lz;
            _lazy[child] = _lazy.GetValueOrDefault(child) + lz;
        }
        _lazy[node] = 0;
    }

    private void Update(int node, int start, int end, int l, int r, int val)
    {
        if (r < start || end < l) return;
        if (l <= start && end <= r)
        {
            _tree[node] = _tree.GetValueOrDefault(node) + val;
            _lazy[node] = _lazy.GetValueOrDefault(node) + val;
            return;
        }
        Push(node);
        int mid = (start + end) / 2;
        Update(2 * node, start, mid, l, r, val);
        Update(2 * node + 1, mid + 1, end, l, r, val);
        _tree[node] = Math.Max(
            _tree.GetValueOrDefault(2 * node),
            _tree.GetValueOrDefault(2 * node + 1));
    }

    public int Book(int start, int end)
    {
        Update(1, 0, 1_000_000_000, start, end - 1, 1);
        return _tree.GetValueOrDefault(1);
    }
}
```

> **Key insight:** a dynamic (sparse) lazy segment tree over the full coordinate range avoids pre-allocating; range-add tracks bookings, root max gives the answer after each call.

---

## Sweep Line

### The Skyline Problem (LeetCode 218)

Given buildings `[left, right, height]`, output the skyline as a list of `[x, height]` key points where the profile changes.

**Example:** `[[2,9,10],[3,7,15],[5,12,12],[15,20,10],[19,24,8]]` → `[[2,10],[3,15],[7,12],[12,0],[15,10],[20,8],[24,0]]`

```text
BRUTE FORCE | O(n * range) | O(range)

For each x, compute max height of all buildings covering x.

------------------------------------------------------------------------------

OPTIMAL — SWEEP LINE + SORTED MULTISET | O(n log n) | O(n)

Encode each building as two events:
    (left,  -height)  // entry: negative so entries sort before exits at same x
    (right, +height)  // exit:  positive height marks removal

Sort events. Maintain a sorted multiset of active heights (add on entry, remove on exit).
At each x, if the current max height != previous max height, emit [x, newMax].
```

```csharp
public IList<IList<int>> GetSkyline(int[][] buildings)
{
    var events = new List<(int x, int h)>();
    foreach (var b in buildings)
    {
        events.Add((b[0], -b[2])); // entry: negative height
        events.Add((b[1],  b[2])); // exit:  positive height
    }
    // Sort by x; on tie: entries (negative) before exits (positive)
    events.Sort((a, b) => a.x != b.x ? a.x.CompareTo(b.x) : a.h.CompareTo(b.h));

    var result = new List<IList<int>>();
    // SortedDictionary as multiset: height → count
    var active = new SortedDictionary<int, int> { [0] = 1 }; // ground level sentinel
    int prevMax = 0;

    foreach (var (x, h) in events)
    {
        if (h < 0)
        {
            // Entry: add building height
            int height = -h;
            active[height] = active.GetValueOrDefault(height) + 1;
        }
        else
        {
            // Exit: remove building height
            active[h]--;
            if (active[h] == 0) active.Remove(h);
        }
        int curMax = active.Keys.Max();
        if (curMax != prevMax)
        {
            result.Add(new List<int> { x, curMax });
            prevMax = curMax;
        }
    }
    return result;
}
```

> **Key insight:** by encoding entries as negative heights, the sort automatically processes entry events before exit events at the same x-coordinate — the critical tie-break for correct skyline transitions.

---

### Rectangle Area II (LeetCode 850)

Given axis-aligned rectangles `[x1, y1, x2, y2]`, return the total area covered by at least one rectangle (mod 10⁹ + 7).

**Example:** `[[0,0,2,2],[1,0,2,3],[1,0,3,1]]` → `6`

```text
BRUTE FORCE | O(range²) | O(range²)

Mark every unit square in a grid.

------------------------------------------------------------------------------

OPTIMAL — SWEEP LINE + COORDINATE COMPRESSION | O(n² log n) | O(n)

Compress y-coordinates. Sweep a vertical line across sorted unique x-values.
At each x-slab, compute the total y-length covered by active rectangles.
Multiply y-length by slab width (dx) to accumulate area.
```

```csharp
public int RectangleArea(int[][] rectangles)
{
    const int MOD = 1_000_000_007;
    // Collect and sort unique x-coordinates
    var xs = rectangles.SelectMany(r => new[] { r[0], r[2] })
                       .Distinct().OrderBy(x => x).ToList();
    var ys = rectangles.SelectMany(r => new[] { r[1], r[3] })
                       .Distinct().OrderBy(y => y).ToList();

    long ans = 0;
    for (int xi = 0; xi + 1 < xs.Count; xi++)
    {
        int x1 = xs[xi], x2 = xs[xi + 1];
        // Find y-length covered in this x-slab
        var covered = new List<(int y1, int y2)>();
        foreach (var r in rectangles)
            if (r[0] <= x1 && x2 <= r[2])
                covered.Add((r[1], r[3]));
        covered.Sort();

        long yLen = 0;
        int curY = 0;
        foreach (var (y1, y2) in covered)
        {
            curY = Math.Max(curY, y1);
            if (y2 > curY) { yLen += y2 - curY; curY = y2; }
        }
        ans = (ans + (long)(x2 - x1) % MOD * yLen) % MOD;
    }
    return (int)ans;
}
```

> **Key insight:** coordinate-compress x; for each x-slab check which rectangles are active, then merge their y-intervals (sort + scan) to compute covered y-length in O(n log n) per slab.

---

## Design

### My Calendar I (LeetCode 729)

Book intervals `[start, end)` — reject any booking that overlaps an existing one.

**Example:** `Book(10,20)` → `true`; `Book(15,25)` → `false`; `Book(20,30)` → `true`

```text
BRUTE FORCE | O(n) per booking | O(n)

Check every stored interval for overlap.

------------------------------------------------------------------------------

OPTIMAL — SORTED MAP (BINARY SEARCH) | O(log n) per booking | O(n)

Store bookings in a SortedDictionary keyed by start.
For new [s,e): find the largest start ≤ s; check it doesn't extend into s.
              find the smallest start ≥ s; check s < it (not e > it).
```

```csharp
public class MyCalendar
{
    // key = start, value = end
    private readonly SortedDictionary<int, int> _books = new();

    public bool Book(int start, int end)
    {
        // Check right neighbour: start of next booking must be >= end
        var right = _books.GetViewBetween(start, int.MaxValue);
        if (right.Count > 0 && right.Min.Key < end) return false;

        // Check left neighbour: its end must be <= start
        var left = _books.GetViewBetween(int.MinValue, start);
        if (left.Count > 0 && left.Max.Value > start) return false;

        _books[start] = end;
        return true;
    }
}
```

> **Key insight:** a sorted map reduces overlap detection to two binary-search neighbours — O(log n) per booking.

---

### My Calendar II (LeetCode 731)

Book intervals; allow at most double-booking (reject if a triple overlap would occur).

**Example:** `Book(10,20)` → `true`; `Book(50,60)` → `true`; `Book(10,40)` → `true`; `Book(5,15)` → `false`

```text
BRUTE FORCE | O(n²) | O(n)

Track all double-booked intervals; check each new booking against them.

------------------------------------------------------------------------------

OPTIMAL — DIFFERENCE ARRAY (LAZY) | O(n log n) | O(n)

Maintain events list. On each Book: insert +1 at start and -1 at end.
Scan all events (sorted); if running sum reaches 3, reject and rollback.
```

```csharp
public class MyCalendarTwo
{
    private readonly SortedDictionary<int, int> _delta = new();

    public bool Book(int start, int end)
    {
        _delta[start] = _delta.GetValueOrDefault(start) + 1;
        _delta[end]   = _delta.GetValueOrDefault(end)   - 1;

        int cur = 0;
        foreach (var (_, d) in _delta)
        {
            cur += d;
            if (cur >= 3)
            {
                // Rollback
                _delta[start]--;
                if (_delta[start] == 0) _delta.Remove(start);
                _delta[end]++;
                if (_delta[end] == 0) _delta.Remove(end);
                return false;
            }
        }
        return true;
    }
}
```

> **Key insight:** difference array over a sorted map is a clean O(n) scan per booking; rollback on rejection keeps the structure consistent.

---

### LRU Cache — LeetCode 146

See [Linked Lists — Problems](../LinkedLists/Problems.md) — LRU and LFU implementations live there (HashMap + doubly-linked list, O(1) all ops).

> **Key insight:** a hash map gives O(1) lookup, a doubly linked list gives O(1) reordering and eviction — combine them rather than reaching for a range structure.
