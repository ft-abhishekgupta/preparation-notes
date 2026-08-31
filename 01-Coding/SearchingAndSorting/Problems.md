# Searching and Sorting — Problems

| # | Problem | LeetCode | Pattern | Difficulty |
|---|---------|----------|---------|------------|
| 1 | Binary Search | [704](https://leetcode.com/problems/binary-search/) | Classic binary search | Easy |
| 2 | Search Insert Position | [35](https://leetcode.com/problems/search-insert-position/) | Lower bound | Easy |
| 3 | Find First and Last Position | [34](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/) | Lower + upper bound | Medium |
| 4 | Search in Rotated Sorted Array | [33](https://leetcode.com/problems/search-in-rotated-sorted-array/) | Rotated | Medium |
| 5 | Search in Rotated Sorted Array II | [81](https://leetcode.com/problems/search-in-rotated-sorted-array-ii/) | Rotated + duplicates | Medium |
| 6 | Find Minimum in Rotated Sorted Array | [153](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/) | Rotated | Medium |
| 7 | Single Element in a Sorted Array | [540](https://leetcode.com/problems/single-element-in-a-sorted-array/) | Binary search (parity) | Medium |
| 8 | Find Peak Element | [162](https://leetcode.com/problems/find-peak-element/) | Peak finding | Medium |
| 9 | Search a 2D Matrix | [74](https://leetcode.com/problems/search-a-2d-matrix/) | 2D flatten | Medium |
| 10 | Search a 2D Matrix II | [240](https://leetcode.com/problems/search-a-2d-matrix-ii/) | Staircase | Medium |
| 11 | Koko Eating Bananas | [875](https://leetcode.com/problems/koko-eating-bananas/) | Binary search on answer | Medium |
| 12 | Capacity to Ship in D Days | [1011](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/) | Binary search on answer | Medium |
| 13 | Split Array Largest Sum | [410](https://leetcode.com/problems/split-array-largest-sum/) | Binary search on answer | Hard |
| 14 | Min Days to Make m Bouquets | [1482](https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/) | Binary search on answer | Medium |
| 15 | Median of Two Sorted Arrays | [4](https://leetcode.com/problems/median-of-two-sorted-arrays/) | Binary search on partition | Hard |
| 16 | Merge Intervals | [56](https://leetcode.com/problems/merge-intervals/) | Sort + merge | Medium |
| 17 | Largest Number | [179](https://leetcode.com/problems/largest-number/) | Custom comparator | Medium |
| 18 | H-Index | [274](https://leetcode.com/problems/h-index/) | Sort + scan | Medium |
| 19 | Count of Smaller Numbers After Self | [315](https://leetcode.com/problems/count-of-smaller-numbers-after-self/) | Merge sort augmentation | Hard |
| 20 | Kth Largest Element in an Array | [215](https://leetcode.com/problems/kth-largest-element-in-an-array/) | Quickselect | Medium |
| 21 | Find K Closest Elements | [658](https://leetcode.com/problems/find-k-closest-elements/) | Binary search on window | Medium |
| 22 | Search in Unknown-Size Array | [702](https://leetcode.com/problems/search-in-a-sorted-array-of-unknown-size/) | Exponential search | Medium |

---

## Classic Binary Search

### Binary Search — LeetCode 704

Given a sorted integer array `nums` and a `target`, return the index of target or `-1` if not found.

**Example:** `nums=[-1,0,3,5,9,12], target=9` → `4`

```text
BRUTE FORCE | O(n) | O(1)

Linear scan: return i when nums[i] == target.

------------------------------------------------------------------------------

OPTIMAL — BINARY SEARCH | O(log n) | O(1)

Maintain invariant: target is in nums[lo..hi] or absent.
Halve the search space at each step using mid comparison.
```

```csharp
public int Search(int[] nums, int target)
{
    int lo = 0, hi = nums.Length - 1;
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target)  lo = mid + 1;
        else                     hi = mid - 1;
    }
    return -1;
}
```

> **Key insight:** `lo + (hi-lo)/2` prevents integer overflow; `lo <= hi` means both pointers can meet at the answer.

---

### Search Insert Position — LeetCode 35

Given a sorted array of distinct integers and a `target`, return its index or the index where it would be inserted.

**Example:** `nums=[1,3,5,6], target=2` → `1`

```text
BRUTE FORCE | O(n) | O(1)

Linear scan: return i when nums[i] >= target.

------------------------------------------------------------------------------

OPTIMAL — LOWER BOUND | O(log n) | O(1)

Half-open template: hi=n, answer is always lo.
LowerBound finds first index >= target, which is also the insertion point.
```

```csharp
public int SearchInsert(int[] nums, int target)
{
    int lo = 0, hi = nums.Length; // hi = n: insertion past end is valid
    while (lo < hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < target) lo = mid + 1;
        else                    hi = mid;
    }
    return lo;
}
```

> **Key insight:** lower bound with `hi=n` naturally handles the "insert at end" case without a special check.

---

### Search in a Sorted Array of Unknown Size — LeetCode 702

Given an `ArrayReader` interface where `reader.Get(i)` returns `2³¹-1` for out-of-bounds, find index of `target`. It always exists.

**Example:** `secret=[-1,0,3,5,9,12], target=9` → `4`

```text
LINEAR | O(n) | O(1)

Probe index 0, 1, 2, ... until found. Wasteful.

------------------------------------------------------------------------------

OPTIMAL — EXPONENTIAL + BINARY SEARCH | O(log n) | O(1)

Double hi until reader.Get(hi) >= target, establishing a valid [lo, hi].
Then run standard binary search within that window.
```

```csharp
public int Search(ArrayReader reader, int target)
{
    int lo = 0, hi = 1;
    while (reader.Get(hi) < target) { lo = hi; hi *= 2; }
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2;
        int val = reader.Get(mid);
        if (val == target) return mid;
        if (val < target)  lo = mid + 1;
        else               hi = mid - 1;
    }
    return -1;
}
```

> **Key insight:** exponential expansion reaches the target range in O(log n) steps, then binary search narrows in another O(log n).

---

## Bounds and Counting

### Find First and Last Position of Element in Sorted Array — LeetCode 34

Given a sorted array, return `[first, last]` index of `target`. Return `[-1,-1]` if absent.

**Example:** `nums=[5,7,7,8,8,10], target=8` → `[3,4]`

```text
BRUTE FORCE | O(n) | O(1)

Linear scan for first and last occurrence.

------------------------------------------------------------------------------

OPTIMAL — LOWER BOUND + UPPER BOUND | O(log n) | O(1)

First = LowerBound(target)   → first index where nums[i] >= target
Last  = UpperBound(target)-1 → last  index where nums[i] == target
Count = UpperBound - LowerBound
```

```csharp
public int[] SearchRange(int[] nums, int target)
{
    int first = LowerBound(nums, target);
    if (first == nums.Length || nums[first] != target) return new[] { -1, -1 };
    int last = UpperBound(nums, target) - 1;
    return new[] { first, last };
}

int LowerBound(int[] nums, int target)
{
    int lo = 0, hi = nums.Length;
    while (lo < hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < target) lo = mid + 1;
        else                    hi = mid;
    }
    return lo;
}

int UpperBound(int[] nums, int target)
{
    int lo = 0, hi = nums.Length;
    while (lo < hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] <= target) lo = mid + 1;
        else                     hi = mid;
    }
    return lo;
}
```

> **Key insight:** lower bound gives the first ≥ target; upper bound gives the first > target. Their difference is the count of target.

---

## Rotated and Modified Arrays

### Search in Rotated Sorted Array — LeetCode 33

Sorted array rotated at unknown pivot, no duplicates. Return index of `target` or `-1`.

**Example:** `nums=[4,5,6,7,0,1,2], target=0` → `4`

```text
BRUTE FORCE | O(n) | O(1)

Linear scan.

------------------------------------------------------------------------------

OPTIMAL — BINARY SEARCH | O(log n) | O(1)

At each mid, exactly one of [lo..mid] or [mid..hi] is sorted.
Check which half is sorted, then decide if target falls in it.
```

```csharp
public int Search(int[] nums, int target)
{
    int lo = 0, hi = nums.Length - 1;
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[lo] <= nums[mid])              // left half [lo..mid] is sorted
        {
            if (nums[lo] <= target && target < nums[mid])
                hi = mid - 1;                   // target in sorted left half
            else
                lo = mid + 1;
        }
        else                                    // right half [mid..hi] is sorted
        {
            if (nums[mid] < target && target <= nums[hi])
                lo = mid + 1;                   // target in sorted right half
            else
                hi = mid - 1;
        }
    }
    return -1;
}
```

> **Key insight:** `nums[lo] <= nums[mid]` (not strict `<`) correctly handles the edge case where `lo == mid`.

---

### Search in Rotated Sorted Array II — LeetCode 81

Same as LeetCode 33 but the array may contain duplicates. Return `true`/`false`.

**Example:** `nums=[2,5,6,0,0,1,2], target=0` → `true`

```text
BRUTE FORCE | O(n) | O(1)

Linear scan.

------------------------------------------------------------------------------

OPTIMAL — BINARY SEARCH WITH DEGENERATE CASE | O(log n) avg / O(n) worst | O(1)

When nums[lo] == nums[mid] == nums[hi], can't determine sorted half.
Shrink both ends: lo++; hi--. Worst case O(n) for all-same arrays.
```

```csharp
public bool Search(int[] nums, int target)
{
    int lo = 0, hi = nums.Length - 1;
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return true;
        if (nums[lo] == nums[mid] && nums[mid] == nums[hi]) { lo++; hi--; }
        else if (nums[lo] <= nums[mid])
        {
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        }
        else
        {
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return false;
}
```

> **Key insight:** duplicates can make both halves look sorted; the `lo++; hi--` fallback recovers correctness at the cost of O(n) worst case.

---

### Find Minimum in Rotated Sorted Array — LeetCode 153

Sorted array rotated at unknown pivot, all unique. Find the minimum element.

**Example:** `nums=[3,4,5,1,2]` → `1`

```text
BRUTE FORCE | O(n) | O(1)

Linear scan for minimum.

------------------------------------------------------------------------------

OPTIMAL — BINARY SEARCH | O(log n) | O(1)

Compare nums[mid] to nums[hi].
If nums[mid] > nums[hi], the minimum is strictly in the right half.
Otherwise mid could be the minimum → hi = mid.
```

```csharp
public int FindMin(int[] nums)
{
    int lo = 0, hi = nums.Length - 1;
    while (lo < hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] > nums[hi]) lo = mid + 1;
        else                      hi = mid;
    }
    return nums[lo];
}
```

> **Key insight:** compare mid to `nums[hi]` (not `nums[lo]`); if `nums[mid] > nums[hi]`, the rotation point (minimum) is to the right.

---

### Single Element in a Sorted Array — LeetCode 540

Sorted array where every element appears exactly twice except one. Find the single element in O(log n) / O(1).

**Example:** `nums=[1,1,2,3,3,4,4,8,8]` → `2`

```text
BRUTE FORCE | O(n) | O(1)

XOR all elements: duplicates cancel, single remains.

------------------------------------------------------------------------------

OPTIMAL — BINARY SEARCH | O(log n) | O(1)

Before the single element, pairs occupy (even, odd) index positions.
After, pairs occupy (odd, even) positions.
Bias mid to even; if nums[mid] == nums[mid+1], pair is intact → single is to the right.
```

```csharp
public int SingleNonDuplicate(int[] nums)
{
    int lo = 0, hi = nums.Length - 1;
    while (lo < hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (mid % 2 == 1) mid--;           // bias to even index
        if (nums[mid] == nums[mid + 1])
            lo = mid + 2;                  // pair intact: single is right
        else
            hi = mid;                      // pair broken: single at mid or left
    }
    return nums[lo];
}
```

> **Key insight:** parity of index tells you which side of the single element you are on; bias mid to even to compare with its intended pair partner.

---

## Peak Finding

### Find Peak Element — LeetCode 162

Find any index `i` where `nums[i]` is strictly greater than its neighbours. Assume `nums[-1] = nums[n] = -∞`.

**Example:** `nums=[1,2,3,1]` → `2`

```text
BRUTE FORCE | O(n) | O(1)

Linear scan: return i when nums[i] > nums[i-1] and nums[i] > nums[i+1].

------------------------------------------------------------------------------

OPTIMAL — BINARY SEARCH | O(log n) | O(1)

If nums[mid] < nums[mid+1], the slope is ascending → a peak exists to the right.
Otherwise nums[mid] >= nums[mid+1] → mid could be a peak or peak is to the left.
```

```csharp
public int FindPeakElement(int[] nums)
{
    int lo = 0, hi = nums.Length - 1;
    while (lo < hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < nums[mid + 1])
            lo = mid + 1;    // ascending: peak strictly to the right
        else
            hi = mid;        // descending: peak at mid or to the left
    }
    return lo;
}
```

> **Key insight:** we never need to find "the" peak — any local maximum suffices. The binary search always converges to one.

---

## 2D Search

### Search a 2D Matrix — LeetCode 74

m×n matrix: each row sorted, and `row[i][0] > row[i-1][n-1]`. Does `target` exist?

**Example:** `matrix=[[1,3,5,7],[10,11,16,20],[23,30,34,60]], target=3` → `true`

```text
BRUTE FORCE | O(m·n) | O(1)

Scan every cell.

------------------------------------------------------------------------------

BINARY SEARCH EACH ROW | O(m log n) | O(1)

Apply binary search to each row.

------------------------------------------------------------------------------

OPTIMAL — FLATTEN TO 1D | O(log(m·n)) | O(1)

Treat matrix as a virtual sorted array of size m*n.
Map virtual index mid → matrix[mid/n][mid%n].
```

```csharp
public bool SearchMatrix(int[][] matrix, int target)
{
    int m = matrix.Length, n = matrix[0].Length;
    int lo = 0, hi = m * n - 1;
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2;
        int val = matrix[mid / n][mid % n];
        if (val == target) return true;
        if (val < target)  lo = mid + 1;
        else               hi = mid - 1;
    }
    return false;
}
```

> **Key insight:** the row-then-column property makes the matrix equivalent to one sorted array; integer division and modulo map the virtual index to the 2D position.

---

### Search a 2D Matrix II — LeetCode 240

m×n matrix where each row and column is sorted independently. Does `target` exist?

**Example:** `matrix=[[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17]], target=5` → `true`

```text
BRUTE FORCE | O(m·n) | O(1)

Scan every cell.

------------------------------------------------------------------------------

BINARY SEARCH EACH ROW | O(m log n) | O(1)

Apply binary search to each row independently.

------------------------------------------------------------------------------

OPTIMAL — STAIRCASE FROM TOP-RIGHT | O(m+n) | O(1)

Top-right element is max of its row, min of its column.
val > target → move left (col--), eliminating the current column.
val < target → move down (row++), eliminating the current row.
```

```csharp
public bool SearchMatrix(int[][] matrix, int target)
{
    int row = 0, col = matrix[0].Length - 1;
    while (row < matrix.Length && col >= 0)
    {
        int val = matrix[row][col];
        if (val == target) return true;
        if (val > target) col--;    // eliminate column
        else              row++;    // eliminate row
    }
    return false;
}
```

> **Key insight:** the top-right corner is uniquely positioned as the max of its row and min of its column; each comparison eliminates an entire row or column.

---

## Binary Search on the Answer

### Koko Eating Bananas — LeetCode 875

Koko has piles of bananas and `h` hours. Each hour she eats at most `k` bananas from one pile. Find the minimum integer `k` to finish in `h` hours.

**Example:** `piles=[3,6,7,11], h=8` → `4`

```text
BRUTE FORCE | O(n·max(piles)) | O(1)

Try every speed from 1 to max(piles).

------------------------------------------------------------------------------

OPTIMAL — BINARY SEARCH ON ANSWER | O(n log max(piles)) | O(1)

IsFeasible(k): sum of ceil(piles[i]/k) <= h.
Monotonic in k (faster → fewer hours).
Binary search for minimum k where IsFeasible(k) is true.
```

```csharp
public int MinEatingSpeed(int[] piles, int h)
{
    int lo = 1, hi = piles.Max();
    while (lo < hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (CanFinish(piles, h, mid)) hi = mid;
        else                          lo = mid + 1;
    }
    return lo;
}

bool CanFinish(int[] piles, int h, int speed)
{
    long hours = 0;
    foreach (int p in piles) hours += (p + speed - 1) / speed; // ceil division
    return hours <= h;
}
```

> **Key insight:** `ceil(p/k) = (p + k - 1) / k` in integer arithmetic; the feasibility check is O(n), and binary search over [1, max] makes total complexity O(n log max).

---

### Capacity to Ship Packages Within D Days — LeetCode 1011

Ship packages in order. Each day, load up to `capacity` weight consecutively. Find minimum capacity to ship all in `D` days.

**Example:** `weights=[1,2,3,4,5,6,7,8,9,10], days=5` → `15`

```text
BRUTE FORCE | O(sum(weights)·n) | O(1)

Try every capacity from max(weights) to sum(weights).

------------------------------------------------------------------------------

OPTIMAL — BINARY SEARCH ON ANSWER | O(n log sum(weights)) | O(1)

lo = max(weights) [must fit the heaviest package]
hi = sum(weights) [ship all in one day]
IsFeasible(cap): greedy count — number of days needed <= D.
```

```csharp
public int ShipWithinDays(int[] weights, int days)
{
    int lo = weights.Max(), hi = weights.Sum();
    while (lo < hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (CanShip(weights, days, mid)) hi = mid;
        else                             lo = mid + 1;
    }
    return lo;
}

bool CanShip(int[] weights, int days, int cap)
{
    int d = 1, cur = 0;
    foreach (int x in weights)
    {
        if (cur + x > cap) { d++; cur = 0; }
        cur += x;
    }
    return d <= days;
}
```

> **Key insight:** packages must stay in order, so the greedy "fill each day without exceeding cap" check gives the minimum number of days for a given capacity.

---

### Split Array Largest Sum — LeetCode 410

Split `nums` into exactly `k` non-empty subarrays. Minimise the largest subarray sum.

**Example:** `nums=[7,2,5,10,8], k=2` → `18`

```text
BRUTE FORCE | O(n^k) | O(1)

Enumerate all split points recursively.

------------------------------------------------------------------------------

DP | O(n²·k) | O(n·k)

dp[i][j] = min largest sum splitting first i elements into j parts.

------------------------------------------------------------------------------

OPTIMAL — BINARY SEARCH ON ANSWER | O(n log sum(nums)) | O(1)

lo = max(nums), hi = sum(nums).
IsFeasible(x): greedy count of parts with sum <= x is <= k.
```

```csharp
public int SplitArray(int[] nums, int k)
{
    int lo = nums.Max(), hi = nums.Sum();
    while (lo < hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (CanSplit(nums, k, mid)) hi = mid;
        else                        lo = mid + 1;
    }
    return lo;
}

bool CanSplit(int[] nums, int k, int maxSum)
{
    int parts = 1, cur = 0;
    foreach (int x in nums)
    {
        if (cur + x > maxSum) { parts++; cur = 0; }
        cur += x;
    }
    return parts <= k;
}
```

> **Key insight:** binary search on the answer space [max, sum]; the greedy feasibility check runs in O(n), making the overall solution O(n log sum).

---

### Minimum Number of Days to Make m Bouquets — LeetCode 1482

`bloomDay[i]` = day flower `i` blooms. Make `m` bouquets, each using `k` adjacent bloomed flowers. Return min days, or `-1` if impossible.

**Example:** `bloomDay=[1,10,3,10,2], m=3, k=1` → `3`

```text
BRUTE FORCE | O(max(bloomDay)·n) | O(1)

Simulate each day from 1 to max(bloomDay).

------------------------------------------------------------------------------

OPTIMAL — BINARY SEARCH ON ANSWER | O(n log max(bloomDay)) | O(1)

IsFeasible(day): count consecutive bloomed sequences of length >= k.
Total bouquets possible >= m → feasible.
```

```csharp
public int MinDays(int[] bloomDay, int m, int k)
{
    if ((long)m * k > bloomDay.Length) return -1;
    int lo = 1, hi = bloomDay.Max();
    while (lo < hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (CanMake(bloomDay, m, k, mid)) hi = mid;
        else                              lo = mid + 1;
    }
    return lo;
}

bool CanMake(int[] bloomDay, int m, int k, int day)
{
    int bouquets = 0, consecutive = 0;
    foreach (int d in bloomDay)
    {
        consecutive = d <= day ? consecutive + 1 : 0;
        if (consecutive == k) { bouquets++; consecutive = 0; }
    }
    return bouquets >= m;
}
```

> **Key insight:** early-exit check `m * k > n` avoids the search when it's impossible. The greedy counter resets on any unbloomed flower.

---

### Median of Two Sorted Arrays — LeetCode 4

Two sorted arrays of sizes m and n. Return the median of the combined array. Required: O(log(min(m,n))).

**Example:** `nums1=[1,3], nums2=[2]` → `2.0`

```text
BRUTE FORCE — MERGE AND SORT | O((m+n) log(m+n)) | O(m+n)

Merge both arrays, sort, return middle element(s).

------------------------------------------------------------------------------

TWO POINTERS | O(m+n) | O(1)

Advance two pointers to reach the median position without full merge.

------------------------------------------------------------------------------

OPTIMAL — BINARY SEARCH ON PARTITION | O(log(min(m,n))) | O(1)

Binary search on partition index i of the smaller array.
j = (m+n+1)/2 - i is the corresponding partition in the larger array.
Find i such that: max(left1, left2) <= min(right1, right2).
```

```csharp
public double FindMedianSortedArrays(int[] nums1, int[] nums2)
{
    if (nums1.Length > nums2.Length) return FindMedianSortedArrays(nums2, nums1);
    int m = nums1.Length, n = nums2.Length;
    int lo = 0, hi = m, halfLen = (m + n + 1) / 2;
    while (lo <= hi)
    {
        int i = lo + (hi - lo) / 2;    // partition of nums1: i elements in left half
        int j = halfLen - i;            // partition of nums2: j elements in left half
        int maxLeft1  = i == 0 ? int.MinValue : nums1[i - 1];
        int minRight1 = i == m ? int.MaxValue : nums1[i];
        int maxLeft2  = j == 0 ? int.MinValue : nums2[j - 1];
        int minRight2 = j == n ? int.MaxValue : nums2[j];
        if (maxLeft1 <= minRight2 && maxLeft2 <= minRight1)
        {
            int leftMax  = Math.Max(maxLeft1, maxLeft2);
            int rightMin = Math.Min(minRight1, minRight2);
            return (m + n) % 2 == 1
                ? leftMax
                : (leftMax + rightMin) / 2.0;
        }
        else if (maxLeft1 > minRight2)
            hi = i - 1;    // i too large: move partition left
        else
            lo = i + 1;    // i too small: move partition right
    }
    return 0;
}
```

> **Key insight:** binary search on how many elements of `nums1` belong to the "left half" of the merged array; `int.MinValue`/`int.MaxValue` sentinels handle edge partitions cleanly.

---

## Sorting-Based

### Sort Colors — LeetCode 75

> **Key insight:** Dutch National Flag three-pointer technique — see [Arrays and Strings — Problems](../ArraysAndStrings/Problems.md) for the full solution. In-place O(n) time / O(1) space three-way partition with `lo`, `mid`, `hi` pointers.

---

### Merge Intervals — LeetCode 56

Given an array of intervals, merge all overlapping intervals and return the non-overlapping result.

**Example:** `intervals=[[1,3],[2,6],[8,10],[15,18]]` → `[[1,6],[8,10],[15,18]]`

```text
BRUTE FORCE | O(n²) | O(n)

For each interval, check all others for overlap and merge repeatedly.

------------------------------------------------------------------------------

OPTIMAL — SORT + LINEAR MERGE | O(n log n) | O(n)

Sort by start time.
For each interval: if it overlaps the last merged (start <= last.end),
extend; otherwise append.
```

```csharp
public int[][] Merge(int[][] intervals)
{
    Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0])); // sort by start
    var result = new List<int[]> { intervals[0] };
    for (int i = 1; i < intervals.Length; i++)
    {
        int[] last = result[^1];
        if (intervals[i][0] <= last[1])
            last[1] = Math.Max(last[1], intervals[i][1]); // extend
        else
            result.Add(intervals[i]);                      // no overlap: new interval
    }
    return result.ToArray();
}
```

> **Key insight:** after sorting by start, two intervals overlap iff `next.start <= last.end`; extending the end to `max(last.end, next.end)` handles fully contained intervals.

---

### Largest Number — LeetCode 179

Given non-negative integers, arrange them to form the largest possible number.

**Example:** `nums=[3,30,34,5,9]` → `"9534330"`

```text
GREEDY — SORT BY VALUE | O(n log n) | O(n)

Sorting numerically is wrong: 30 > 3 numerically, but "330" > "303".

------------------------------------------------------------------------------

OPTIMAL — CUSTOM STRING COMPARATOR | O(n log n) | O(n)

Compare a and b as: which concatenation "ab" or "ba" is lexicographically larger?
If "ab" > "ba", put a before b.
Edge case: if largest string is "0", all are zero → return "0".
```

```csharp
public string LargestNumber(int[] nums)
{
    string[] strs = Array.ConvertAll(nums, x => x.ToString());
    Array.Sort(strs, (a, b) => string.Compare(b + a, a + b, StringComparison.Ordinal));
    if (strs[0] == "0") return "0";
    return string.Concat(strs);
}
```

> **Key insight:** the comparator `b+a vs a+b` is transitive and defines a valid total order; `StringComparison.Ordinal` ensures deterministic digit comparison.

---

### H-Index — LeetCode 274

Given a `citations` array, return the largest `h` such that `h` papers each have ≥ `h` citations.

**Example:** `citations=[3,0,6,1,5]` → `3`

```text
BRUTE FORCE | O(n²) | O(1)

For each h from n to 0, count papers with >= h citations.

------------------------------------------------------------------------------

OPTIMAL — SORT DESCENDING + LINEAR SCAN | O(n log n) | O(1)

Sort descending. Scan: while citations[i] >= i+1, increment h.
The first i where citations[i] < i+1 breaks the condition.
```

```csharp
public int HIndex(int[] citations)
{
    Array.Sort(citations, (a, b) => b.CompareTo(a)); // descending
    int h = 0;
    while (h < citations.Length && citations[h] >= h + 1)
        h++;
    return h;
}
```

> **Key insight:** after descending sort, `citations[h] >= h+1` means at least `h+1` papers have ≥ `h+1` citations; scan until the condition fails.

---

### Count of Smaller Numbers After Self — LeetCode 315

For each element, count how many elements to its right are strictly smaller.

**Example:** `nums=[5,2,6,1]` → `[2,1,1,0]`

```text
BRUTE FORCE | O(n²) | O(1)

For each element, scan everything to its right.

------------------------------------------------------------------------------

MERGE SORT | O(n log n) | O(n)

Sort index array alongside values.
During merge: when picking from right half, it beats all remaining left half
elements → increment rightUsed. When picking from left half, add rightUsed to
that element's count.

------------------------------------------------------------------------------

OPTIMAL — FENWICK TREE (BINARY INDEXED TREE) | O(n log n) | O(n)

Coordinate compress. Scan right-to-left.
For each element: query(rank-1) = count of smaller seen so far; then update(rank).
```

```csharp
public IList<int> CountSmaller(int[] nums)
{
    int n = nums.Length;
    int[] counts = new int[n];
    int[] indices = Enumerable.Range(0, n).ToArray();
    MergeCount(nums, indices, counts, 0, n - 1);
    return counts;
}

void MergeCount(int[] nums, int[] idx, int[] counts, int lo, int hi)
{
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    MergeCount(nums, idx, counts, lo, mid);
    MergeCount(nums, idx, counts, mid + 1, hi);
    int[] tmp = new int[hi - lo + 1];
    int i = lo, j = mid + 1, k = 0, rightUsed = 0;
    while (i <= mid && j <= hi)
    {
        if (nums[idx[i]] <= nums[idx[j]])
        {
            counts[idx[i]] += rightUsed; // all rightUsed right elements are smaller
            tmp[k++] = idx[i++];
        }
        else
        {
            rightUsed++;
            tmp[k++] = idx[j++];
        }
    }
    while (i <= mid) { counts[idx[i]] += rightUsed; tmp[k++] = idx[i++]; }
    while (j <= hi)  tmp[k++] = idx[j++];
    Array.Copy(tmp, 0, idx, lo, tmp.Length);
}
```

> **Key insight:** sort index array (not values) so counts map back to original positions; `rightUsed` accumulates as right-half elements are consumed before a left-half element.

---

## Selection (Quickselect)

### Kth Largest Element in an Array — LeetCode 215

Find the kth largest element (not kth distinct) in an unsorted array.

**Example:** `nums=[3,2,1,5,6,4], k=2` → `5`

```text
SORT | O(n log n) | O(1)

Sort descending, return nums[k-1].

------------------------------------------------------------------------------

MIN-HEAP (size k) | O(n log k) | O(k)

Maintain a min-heap of size k. The root is always the kth largest.
See HeapsAndPriorityQueues/HeapsAndPriorityQueues.md for heap-based solution.

------------------------------------------------------------------------------

OPTIMAL — QUICKSELECT | O(n) avg / O(n²) worst | O(log n)

Equivalent to finding (n-k)th smallest (0-indexed).
Random pivot → one-sided recursion → O(n) average.
```

```csharp
public int FindKthLargest(int[] nums, int k)
    => QuickSelect(nums, 0, nums.Length - 1, nums.Length - k);

int QuickSelect(int[] nums, int lo, int hi, int k)
{
    if (lo == hi) return nums[lo];
    int pivotIdx = new Random().Next(lo, hi + 1);
    (nums[pivotIdx], nums[hi]) = (nums[hi], nums[pivotIdx]);
    int pivot = nums[hi], p = lo;
    for (int i = lo; i < hi; i++)
        if (nums[i] <= pivot) { (nums[i], nums[p]) = (nums[p], nums[i]); p++; }
    (nums[p], nums[hi]) = (nums[hi], nums[p]);
    if (p == k) return nums[p];
    return p > k ? QuickSelect(nums, lo, p - 1, k) : QuickSelect(nums, p + 1, hi, k);
}
```

> **Key insight:** after partitioning, the pivot is at its sorted position; only recurse on the one side that contains index k. See [Heaps and Priority Queues](../HeapsAndPriorityQueues/HeapsAndPriorityQueues.md) for heap-based top-K (better for streaming).

---

### Find K Closest Elements — LeetCode 658

Given a sorted array `arr`, integers `k` and `x`, return the `k` elements closest to `x`, sorted.

**Example:** `arr=[1,2,3,4,5], k=4, x=3` → `[1,2,3,4]`

```text
SORT BY DISTANCE | O(n log n) | O(n)

Sort all elements by |arr[i]-x|, take first k, sort result.

------------------------------------------------------------------------------

TWO POINTERS — SHRINK WINDOW | O(n) | O(1)

Start with full window [0, n-1], shrink from the farther end k times.

------------------------------------------------------------------------------

OPTIMAL — BINARY SEARCH ON WINDOW START | O(log(n-k) + k) | O(1)

Binary search for the left boundary lo of the window of size k.
Compare x - arr[mid] vs arr[mid+k] - x to move window left or right.
```

```csharp
public IList<int> FindClosestElements(int[] arr, int k, int x)
{
    int lo = 0, hi = arr.Length - k;
    while (lo < hi)
    {
        int mid = lo + (hi - lo) / 2;
        // Is left candidate arr[mid] or right candidate arr[mid+k] farther from x?
        if (x - arr[mid] > arr[mid + k] - x)
            lo = mid + 1;   // left end is farther: move window right
        else
            hi = mid;       // right end is farther or equal: include mid
    }
    return arr[lo..(lo + k)];
}
```

> **Key insight:** compare `x - arr[mid]` vs `arr[mid+k] - x` — if left is farther, shift window right; if right is farther (or equal), keep left. C# range `arr[lo..(lo+k)]` copies the slice.

---

End of file.
