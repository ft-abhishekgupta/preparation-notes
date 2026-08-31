# Searching and Sorting

> **Core idea:** binary search turns O(n) search into O(log n) by halving a search space at each step; sorting algorithms impose order so that binary search, two-pointer, and greedy strategies become applicable.
> **Recognise it when:** "sorted array + find/count", "minimum feasible X / maximum possible Y", "Kth element", "find duplicate or missing in [1..n]".
> **Costs:** binary search O(log n) / O(1); comparison sort Ω(n log n) lower bound; counting/radix O(n) when key range is small.

---

## Mental Model

### Binary Search Invariant

At every step, the answer (if it exists) lies in the range `[lo, hi]` (classic) or `[lo, hi)` (half-open).
The loop shrinks this range by at least 1 each iteration → guaranteed termination.

**The one thing to internalise:** binary search is not just for "find a value in a sorted array". Any time you can write a **monotonic predicate** — a yes/no question whose answer flips exactly once over a range — you can binary search for the flip point.

### Sorting Mental Model

Every comparison-based sort is a permutation network. The Ω(n log n) lower bound comes from the decision tree argument: to distinguish n! orderings, you need ≥ log₂(n!) ≈ n log n comparisons. Linear sorts (counting, radix, bucket) escape this by using key arithmetic rather than comparisons.

**Invariant to remember per sort:**
- Merge sort: at each merge step, two sorted halves → one sorted array. Stability comes from `left ≤ right` preference.
- Quicksort: after partition, pivot is in its final position; everything left < pivot ≤ everything right.
- Heap sort: `nums[0..k-1]` is a max-heap; `nums[k..n-1]` is the sorted suffix.
- Cyclic sort: `nums[i] == i+1` for all correctly placed elements; wrong ones get cycled to their home.

---

## Complexity Reference

### Sorting Algorithms

| Algorithm | Best | Average | Worst | Space | Stable | In-place | When to use |
|-----------|------|---------|-------|-------|--------|----------|-------------|
| Bubble | O(n) | O(n²) | O(n²) | O(1) | ✅ | ✅ | Never in prod; educational |
| Selection | O(n²) | O(n²) | O(n²) | O(1) | ❌ | ✅ | Minimal writes (flash memory) |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | ✅ | ✅ | Small n, nearly-sorted, base case |
| **Merge** | O(n log n) | **O(n log n)** | **O(n log n)** | O(n) | ✅ | ❌ | Stable sort, linked lists, external sort |
| **Quick** | O(n log n) | **O(n log n)** | O(n²) | O(log n) | ❌ | ✅ | **General purpose** (best cache locality) |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ | ✅ | Guaranteed O(n log n) in-place |
| Counting | O(n+k) | O(n+k) | O(n+k) | O(k) | ✅ | ❌ | Small integer range (k small) |
| Radix (LSD) | O(nd) | O(nd) | O(nd) | O(n+k) | ✅ | ❌ | Fixed-length integers/strings |
| Bucket | O(n+k) | O(n+k) | O(n²) | O(n+k) | ✅ | ❌ | Uniform distribution floats |
| **Quickselect** | O(n) | **O(n)** | O(n²) | O(log n) | — | ✅ | **Kth element** (single selection) |

### Binary Search

| Operation | Time | Space |
|-----------|------|-------|
| Exact match | O(log n) | O(1) |
| Lower / upper bound | O(log n) | O(1) |
| Search on answer (answer range R) | O(log R · cost of predicate) | O(1) |
| 2D matrix flatten | O(log(m·n)) | O(1) |
| 2D staircase (matrix II) | O(m+n) | O(1) |

---

## Templates

### 1. Classic Binary Search — exact match

Use when: you need the index of an exact value, return `-1` on miss.
Time: O(log n), Space: O(1)

```csharp
// Invariant: target is in nums[lo..hi] or not present
int BinarySearch(int[] nums, int target)
{
    int lo = 0, hi = nums.Length - 1;
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2; // avoids (lo+hi) overflow
        if (nums[mid] == target) return mid;
        if (nums[mid] < target)  lo = mid + 1;
        else                     hi = mid - 1;
    }
    return -1;
}
```

### 2. Half-Open Template — lower / upper bound (PREFERRED)

Use when: finding first/last occurrence, insertion point, or any monotonic-predicate boundary.
The answer is **always `lo`** when the loop exits.
Time: O(log n), Space: O(1)

```csharp
// Lower bound: first index where nums[i] >= target (== n if target > all elements)
int LowerBound(int[] nums, int target)
{
    int lo = 0, hi = nums.Length; // hi = n (exclusive upper bound)
    while (lo < hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < target) lo = mid + 1;
        else                    hi = mid;   // mid might be the answer
    }
    return lo;
}

// Upper bound: first index where nums[i] > target (== n if target >= all elements)
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

// Count occurrences of target in sorted array — O(log n)
int CountOccurrences(int[] nums, int target)
    => UpperBound(nums, target) - LowerBound(nums, target);
```

**Template selection table:**

| Goal | `hi` init | Loop | On `isFeasible(mid)` | Answer |
|------|-----------|------|----------------------|--------|
| Exact index, -1 on miss | `n-1` | `lo<=hi` | `return mid` | `mid` |
| First index ≥ target | `n` | `lo<hi` | `hi=mid` | `lo` |
| First index > target | `n` | `lo<hi` | `lo=mid+1` | `lo` |
| Min feasible answer | `hi_val+1` | `lo<hi` | `hi=mid` | `lo` |
| Max feasible answer | `lo_val-1` | `lo<hi` | `lo=mid` (use high-biased mid!) | `lo` |

> **Trap:** when you assign `lo = mid`, use `mid = lo + (hi-lo+1)/2` (high-biased) to avoid infinite loop when `hi = lo + 1`.

### 3. Binary Search on the Answer

Use when: the problem asks for "minimum/maximum X such that condition Y holds" and you can write a O(1) or O(n) check.
Framing: define `IsFeasible(x)` — a monotonic predicate (false…false…true…true). Binary search for the leftmost `true`.

```csharp
// Template: minimum x in [lo, hi] such that IsFeasible(x) is true
// Time: O(log(hi-lo) * cost_of_IsFeasible), Space: O(1)
int BinarySearchOnAnswer(int lo, int hi, Func<int, bool> isFeasible)
{
    while (lo < hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (isFeasible(mid))
            hi = mid;      // mid could be the answer; try smaller
        else
            lo = mid + 1;  // mid too small; answer is strictly larger
    }
    return lo; // minimum feasible value
}
```

**Predicate table — canonical "binary search on answer" problems:**

| Problem | lo | hi | `IsFeasible(x)` predicate |
|---------|----|----|--------------------------|
| Koko Eating Bananas (875) | 1 | max(piles) | `∑ ceil(piles[i]/x) ≤ h` |
| Capacity to Ship in D Days (1011) | max(weights) | sum(weights) | can ship all in ≤ D days with capacity x |
| Split Array Largest Sum (410) | max(nums) | sum(nums) | can split into ≤ k parts each ≤ x |
| Min Days to Make m Bouquets (1482) | 1 | max(bloomDay) | can make m bouquets by day x |
| Find Kth Smallest Pair Distance (719) | 0 | max-min | at least k pairs with distance ≤ x |
| Minimum Time to Complete Trips (2187) | 1 | min(time)*totalTrips | total trips achievable in time x ≥ totalTrips |
| Minimize Max Distance to Gas Station (774) | 0 | max-gap | can add k stations so all gaps ≤ x |

### 4. Rotated Sorted Array

```csharp
// Search in Rotated Sorted Array — no duplicates (LeetCode 33)
// Key: one half is always sorted. Determine which, then check if target is in it.
// Time: O(log n), Space: O(1)
int SearchRotated(int[] nums, int target)
{
    int lo = 0, hi = nums.Length - 1;
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;

        if (nums[lo] <= nums[mid])             // left half [lo..mid] is sorted
        {
            if (nums[lo] <= target && target < nums[mid])
                hi = mid - 1;                  // target in sorted left half
            else
                lo = mid + 1;
        }
        else                                   // right half [mid..hi] is sorted
        {
            if (nums[mid] < target && target <= nums[hi])
                lo = mid + 1;                  // target in sorted right half
            else
                hi = mid - 1;
        }
    }
    return -1;
}

// Find Minimum in Rotated Sorted Array (LeetCode 153)
// Key: compare mid to hi. If nums[mid] > nums[hi], minimum must be in right half.
// Time: O(log n), Space: O(1)
int FindMinRotated(int[] nums)
{
    int lo = 0, hi = nums.Length - 1;
    while (lo < hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] > nums[hi])
            lo = mid + 1;    // min is strictly in right half
        else
            hi = mid;        // min is at mid or to the left
    }
    return nums[lo];
}
```

> **Trap:** with duplicates (LeetCode 81), when `nums[lo] == nums[mid] == nums[hi]` you cannot determine which half is sorted → shrink both ends: `lo++; hi--;`. Worst case degrades to O(n).

### 5. Peak Element

```csharp
// Find Peak Element (LeetCode 162)
// Key: if nums[mid] < nums[mid+1], the right half contains a peak (slope is ascending).
// If nums[mid] > nums[mid+1], the left half (including mid) contains a peak.
// Time: O(log n), Space: O(1)
int FindPeakElement(int[] nums)
{
    int lo = 0, hi = nums.Length - 1;
    while (lo < hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < nums[mid + 1])
            lo = mid + 1;    // ascending: peak is to the right
        else
            hi = mid;        // descending: mid could be the peak
    }
    return lo;
}
```

### 6. 2D Matrix Binary Search

```csharp
// Search a 2D Matrix (LeetCode 74) — strictly sorted, row[i+1][0] > row[i][n-1]
// Flatten to virtual 1D sorted array.
// Time: O(log(m·n)), Space: O(1)
bool SearchMatrix74(int[][] matrix, int target)
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

// Search a 2D Matrix II (LeetCode 240) — each row and each column independently sorted
// Staircase from top-right: top-right is max of its row AND min of its column.
//   val > target → move left (col--): eliminates column
//   val < target → move down (row++): eliminates row
// Time: O(m+n), Space: O(1)
bool SearchMatrixII(int[][] matrix, int target)
{
    int row = 0, col = matrix[0].Length - 1;
    while (row < matrix.Length && col >= 0)
    {
        int val = matrix[row][col];
        if (val == target) return true;
        if (val > target)  col--;    // too large: eliminate this column
        else               row++;    // too small: eliminate this row
    }
    return false;
}
```

> **Why it works (staircase):** at any position, moving left guarantees we see smaller values in the same row; moving down guarantees larger values in the same column. Every step eliminates a full row or column.

### 7. Quickselect — Kth Element in O(n) Average

Use when: you need exactly one Kth element and the array may be mutated.
Compare to heap: heap top-K = O(n log k) and non-destructive; quickselect = O(n) avg, in-place destructive.

```csharp
// Quickselect: find element that would be at index k if array were sorted (0-indexed)
// Average O(n), Worst O(n²) — use random pivot to avoid worst case
// Time: O(n) avg / O(n²) worst, Space: O(log n) stack
int QuickSelect(int[] nums, int lo, int hi, int k)
{
    if (lo == hi) return nums[lo];
    // Random pivot to avoid O(n²) on sorted/adversarial input
    int pivotIdx = new Random().Next(lo, hi + 1);
    (nums[pivotIdx], nums[hi]) = (nums[hi], nums[pivotIdx]);
    // Lomuto partition
    int pivot = nums[hi], p = lo;
    for (int i = lo; i < hi; i++)
        if (nums[i] <= pivot) { (nums[i], nums[p]) = (nums[p], nums[i]); p++; }
    (nums[p], nums[hi]) = (nums[hi], nums[p]);
    // Only recurse on the side containing k
    if (p == k) return nums[p];
    return p > k
        ? QuickSelect(nums, lo, p - 1, k)
        : QuickSelect(nums, p + 1, hi, k);
}

// Public entry point — find Kth largest (1-indexed)
int FindKthLargest(int[] nums, int k)
    => QuickSelect(nums, 0, nums.Length - 1, nums.Length - k);
```

> **Why O(n) average:** each call partitions ~half the remaining elements. T(n) = T(n/2) + O(n) → O(n) by master theorem (case 3). See also [Heaps and Priority Queues](../HeapsAndPriorityQueues/HeapsAndPriorityQueues.md) for the heap-based O(n log k) alternative.

### 8. Cyclic Sort — Missing / Duplicate in [1..n]

Use when: values are a permutation of `[1..n]` (or `[0..n-1]`), O(n) time O(1) space required.

```csharp
// Cyclic Sort: place nums[i] at index nums[i]-1
// Time: O(n), Space: O(1)
void CyclicSort(int[] nums)
{
    int i = 0;
    while (i < nums.Length)
    {
        int correct = nums[i] - 1; // nums[i] belongs at index (nums[i]-1)
        if (nums[i] > 0 && nums[i] <= nums.Length && nums[i] != nums[correct])
            (nums[i], nums[correct]) = (nums[correct], nums[i]);
        else
            i++;
    }
}
// After cyclic sort: scan for i where nums[i] != i+1 → that index reveals missing/duplicate.
// Powers: Missing Number (268), Find the Duplicate (287), First Missing Positive (41),
//         Find All Duplicates (442)
```

### 9. Merge Sort with Augmentation

Use when: counting inversions, or "count of smaller numbers after self" (LeetCode 315).

```csharp
// Count Inversions via Merge Sort — O(n log n) time, O(n) space
// Inversion: i < j but nums[i] > nums[j]
// Key: when merging, taking from the right half means it beat all remaining left elements.
int CountInversions(int[] nums)
{
    int[] indices = Enumerable.Range(0, nums.Length).ToArray();
    int[] counts = new int[nums.Length];
    int total = 0;
    MergeSortCount(nums, indices, counts, ref total, 0, nums.Length - 1);
    return total;
}

void MergeSortCount(int[] nums, int[] idx, int[] counts, ref int total, int lo, int hi)
{
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    MergeSortCount(nums, idx, counts, ref total, lo, mid);
    MergeSortCount(nums, idx, counts, ref total, mid + 1, hi);
    int[] tmp = new int[hi - lo + 1];
    int i = lo, j = mid + 1, k = 0, rightUsed = 0;
    while (i <= mid && j <= hi)
    {
        if (nums[idx[i]] <= nums[idx[j]])
        {
            counts[idx[i]] += rightUsed; // rightUsed elements from right are smaller
            tmp[k++] = idx[i++];
        }
        else
        {
            rightUsed++;
            tmp[k++] = idx[j++];
        }
    }
    while (i <= mid) { counts[idx[i]] += rightUsed; tmp[k++] = idx[i++]; }
    while (j <= hi)  { tmp[k++] = idx[j++]; }
    Array.Copy(tmp, 0, idx, lo, tmp.Length);
}
```

### 10. Sorting — Real C# Implementations

#### Merge Sort

Time: O(n log n), Space: O(n), Stable: ✅, In-place: ❌

```csharp
void MergeSort(int[] nums, int lo, int hi)
{
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    MergeSort(nums, lo, mid);
    MergeSort(nums, mid + 1, hi);
    Merge(nums, lo, mid, hi);
}

void Merge(int[] nums, int lo, int mid, int hi)
{
    int[] tmp = new int[hi - lo + 1];
    int i = lo, j = mid + 1, k = 0;
    while (i <= mid && j <= hi)
        tmp[k++] = nums[i] <= nums[j] ? nums[i++] : nums[j++]; // <= preserves stability
    while (i <= mid) tmp[k++] = nums[i++];
    while (j <= hi)  tmp[k++] = nums[j++];
    Array.Copy(tmp, 0, nums, lo, tmp.Length);
}
```

#### Quicksort (Lomuto + Hoare)

Time: O(n log n) avg / O(n²) worst, Space: O(log n), Stable: ❌, In-place: ✅

```csharp
private static readonly Random _rng = new();

void QuickSort(int[] nums, int lo, int hi)
{
    if (lo >= hi) return;
    int p = LomutoPartition(nums, lo, hi);
    QuickSort(nums, lo, p - 1);
    QuickSort(nums, p + 1, hi);
}

// Lomuto: swap random pivot to end, walk i/j from left
int LomutoPartition(int[] nums, int lo, int hi)
{
    int pivotIdx = _rng.Next(lo, hi + 1);
    (nums[pivotIdx], nums[hi]) = (nums[hi], nums[pivotIdx]);
    int pivot = nums[hi], i = lo;
    for (int j = lo; j < hi; j++)
        if (nums[j] <= pivot) { (nums[i], nums[j]) = (nums[j], nums[i]); i++; }
    (nums[i], nums[hi]) = (nums[hi], nums[i]);
    return i; // pivot is now at final position i
}

// Hoare: fewer swaps on average; pivot is NOT at its final index after partition
int HoarePartition(int[] nums, int lo, int hi)
{
    int pivot = nums[lo + (hi - lo) / 2];
    int i = lo - 1, j = hi + 1;
    while (true)
    {
        do i++; while (nums[i] < pivot);
        do j--; while (nums[j] > pivot);
        if (i >= j) return j;
        (nums[i], nums[j]) = (nums[j], nums[i]);
    }
}
// With Hoare: recurse on [lo, p] and [p+1, hi] — NOT [lo, p-1]
```

> **Why quicksort beats mergesort in practice:** same O(n log n) asymptotics, but quicksort is in-place (no O(n) allocation), accesses memory sequentially within each partition (cache-friendly), and has smaller constant factors. Merge sort wins for stable sort, linked lists, and external sort (data > RAM).

#### Heap Sort

Time: O(n log n), Space: O(1), Stable: ❌, In-place: ✅
See heap internals and O(n) heapify proof in [Heaps and Priority Queues](../HeapsAndPriorityQueues/HeapsAndPriorityQueues.md).

```csharp
void HeapSort(int[] nums)
{
    int n = nums.Length;
    // Build max-heap in O(n): start from last non-leaf, sift each down
    for (int i = n / 2 - 1; i >= 0; i--)
        SiftDown(nums, n, i);
    // Extract max n-1 times: swap root↔last, shrink heap, restore heap property
    for (int end = n - 1; end > 0; end--)
    {
        (nums[0], nums[end]) = (nums[end], nums[0]);
        SiftDown(nums, end, 0);
    }
}

void SiftDown(int[] nums, int n, int i)
{
    while (true)
    {
        int largest = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && nums[l] > nums[largest]) largest = l;
        if (r < n && nums[r] > nums[largest]) largest = r;
        if (largest == i) break;
        (nums[i], nums[largest]) = (nums[largest], nums[i]);
        i = largest;
    }
}
```

#### Counting Sort

Time: O(n+k), Space: O(k), Stable: ✅, In-place: ❌

```csharp
int[] CountingSort(int[] nums)
{
    if (nums.Length == 0) return nums;
    int max = nums.Max();
    int[] count = new int[max + 1];
    foreach (int x in nums) count[x]++;
    for (int i = 1; i <= max; i++) count[i] += count[i - 1]; // prefix sums
    int[] output = new int[nums.Length];
    for (int i = nums.Length - 1; i >= 0; i--) // right-to-left for stability
        output[--count[nums[i]]] = nums[i];
    return output;
}
```

#### Radix Sort (LSD)

Time: O(n·d) where d = number of digits, Space: O(n+10), Stable: ✅

```csharp
void RadixSort(int[] nums)
{
    int max = nums.Max();
    for (int exp = 1; max / exp > 0; exp *= 10)
        CountingSortByDigit(nums, exp);
}

void CountingSortByDigit(int[] nums, int exp)
{
    int n = nums.Length;
    int[] output = new int[n], count = new int[10];
    foreach (int x in nums) count[(x / exp) % 10]++;
    for (int i = 1; i < 10; i++) count[i] += count[i - 1];
    for (int i = n - 1; i >= 0; i--)          // right-to-left preserves stability
    {
        int d = (nums[i] / exp) % 10;
        output[--count[d]] = nums[i];
    }
    Array.Copy(output, nums, n);
}
```

#### Simple Sorts (prose — no real C# needed)

```text
Bubble Sort    O(n²)/O(1) — adjacent swaps; each pass bubbles the max to the end.
               Adaptive: O(n) if already sorted (add early-exit flag).

Selection Sort O(n²)/O(1) — find min of unsorted suffix, place at front. Minimal writes —
               good for write-expensive storage (flash, EEPROM).

Insertion Sort O(n²)/O(1) worst, O(n) best — shift elements right one by one.
               O(n) on nearly-sorted input. Used as base case in Timsort/introsort (n ≤ 16).

Bucket Sort    O(n+k) avg — distribute into k equally-spaced buckets, insertion-sort each,
               concatenate. Best for uniformly distributed floats in [0,1). Degrades to
               O(n²) if all elements land in one bucket.
```

### 11. C# Sort API

```csharp
// Array.Sort — introsort (quicksort + heapsort fallback). NOT stable. O(n log n).
int[] arr = { 3, 1, 4, 1, 5 };
Array.Sort(arr);                          // ascending
Array.Sort(arr, (a, b) => b.CompareTo(a));        // descending via Comparison<T>

// Sort int[][] by end time (column 1), then start time (column 0)
int[][] intervals = { new[]{1,3}, new[]{2,4} };
Array.Sort(intervals, (a, b) => a[1] != b[1] ? a[1] - b[1] : a[0] - b[0]);

// Array.Sort with parallel keys+items (sorts keys, rearranges items to match)
int[] keys = { 3, 1, 2 };
string[] items = { "c", "a", "b" };
Array.Sort(keys, items); // keys→{1,2,3}, items→{"a","b","c"}

// List<T>.Sort — same as Array.Sort, NOT stable
var list = new List<int> { 3, 1, 2 };
list.Sort();
list.Sort(Comparer<int>.Create((a, b) => b.CompareTo(a))); // descending

// LINQ OrderBy — TimSort, STABLE. Returns IOrderedEnumerable (lazy).
var sorted = arr.OrderBy(x => x).ToArray();
var multiKey = arr.OrderBy(x => x % 2).ThenBy(x => x).ToArray(); // even first, then ascending

// String sorting — GOTCHA
string[] words = { "banana", "apple", "Cherry" };
Array.Sort(words, StringComparer.Ordinal);         // byte-order: uppercase before lowercase
Array.Sort(words, StringComparer.OrdinalIgnoreCase); // case-insensitive, deterministic
Array.Sort(words, StringComparer.CurrentCulture); // locale-aware: "ä" order varies by culture
```

> **Trap:** `StringComparer.CurrentCulture` can give different sort orders on different machines/locales. Always use `StringComparer.Ordinal` for algorithmic sorts (LeetCode-style).

#### Stability — What It Is and Why It Matters

**Stable sort:** equal elements appear in the same relative order as the input after sorting.

**Worked example:** sort `[(3,"a"), (1,"b"), (3,"c")]` by number.
- Stable → `[(1,"b"), (3,"a"), (3,"c")]` — original order of the two 3s preserved.
- Unstable → could give `[(1,"b"), (3,"c"), (3,"a")]`.

**When it matters:** multi-key sort. To sort employees first by department (primary), then by name (secondary) using two separate sort passes: sort by name first (stable), then by department. If the second sort is stable, name-order within each department is preserved.

| API | Stable? | Use for |
|-----|---------|---------|
| `Array.Sort` | ❌ | Primitives, single-key, performance-critical |
| `List<T>.Sort` | ❌ | Same as above |
| `OrderBy` | ✅ | **Multi-key sort, when order of equals matters** |

---

## Pattern Recognition

| Problem signals | Technique | Complexity | Example |
|----------------|-----------|-----------|---------|
| Sorted array, find target index | Classic binary search | O(log n) | 704, 35 |
| First/last occurrence, count of target | Lower + upper bound | O(log n) | 34 |
| "Minimum feasible X" or "maximum possible Y" | Binary search on answer | O(log R · n) | 875, 1011, 410 |
| Rotated sorted array | "Which half sorted?" decision | O(log n) | 33, 81, 153 |
| Local max in mountain array | Peak-finding binary search | O(log n) | 162 |
| Values in [1..n], find missing/duplicate O(n)/O(1) | Cyclic sort | O(n) | 268, 287, 41 |
| Kth element, array may be mutated | Quickselect | O(n) avg | 215 |
| Top-K elements, streaming, O(n log k) | Min-heap of size K | O(n log k) | 215, 347 |
| Count inversions / smaller after self | Merge sort augmentation | O(n log n) | 315 |
| Sort by custom multi-char key | Custom comparator | O(n log n) | 179, 274 |
| Strictly sorted matrix | Flatten to 1D binary search | O(log(mn)) | 74 |
| Row+column sorted matrix | Staircase from top-right | O(m+n) | 240 |
| Unknown size sorted array | Exponential search + binary search | O(log n) | 702 |

---

## Variants and Differences

### Binary Search Template Selection

| Scenario | `lo` | `hi` | Loop | Mid formula | Assignment | Return |
|----------|------|------|------|-------------|------------|--------|
| Exact match, -1 on miss | 0 | n-1 | `lo<=hi` | `lo+(hi-lo)/2` | both +1/-1 | `mid` or `-1` |
| Lower bound (first ≥ target) | 0 | n | `lo<hi` | `lo+(hi-lo)/2` | `hi=mid` or `lo=mid+1` | `lo` |
| Upper bound (first > target) | 0 | n | `lo<hi` | `lo+(hi-lo)/2` | `hi=mid` or `lo=mid+1` | `lo` |
| Min feasible answer | val_lo | val_hi+1 | `lo<hi` | `lo+(hi-lo)/2` | `hi=mid` or `lo=mid+1` | `lo` |
| Max feasible answer (`lo=mid` case) | val_lo | val_hi | `lo<hi` | **`lo+(hi-lo+1)/2`** | `lo=mid` or `hi=mid-1` | `lo` |
| Rotated array min | 0 | n-1 | `lo<hi` | `lo+(hi-lo)/2` | `lo=mid+1` or `hi=mid` | `nums[lo]` |
| Peak element | 0 | n-1 | `lo<hi` | `lo+(hi-lo)/2` | `lo=mid+1` or `hi=mid` | `lo` |

### Quickselect vs Heap for Kth Element

| | Quickselect | Min-Heap (size K) |
|-|-------------|-------------------|
| Time average | **O(n)** | O(n log k) |
| Time worst | O(n²) | O(n log k) |
| Space | O(log n) stack | O(k) |
| Mutates input? | ✅ Yes | ❌ No |
| Streaming data? | ❌ No | **✅ Yes** |
| K elements at once? | ❌ (one at a time) | **✅ Yes** |
| Use when | Single Kth, can mutate | Top-K needed, streaming |

---

## Pitfalls

- **`(lo+hi)/2` overflow** — always use `lo + (hi-lo)/2`. C# `int` max ≈ 2.1B; test constraints can trigger overflow.
- **Infinite loop with `lo = mid`** — if you assign `lo = mid` in a `lo < hi` loop, you MUST use `mid = lo + (hi-lo+1)/2` (high-biased). Otherwise when `hi = lo+1`, `mid = lo` → no progress → infinite loop.
- **Wrong half in rotated search** — use `nums[lo] <= nums[mid]` (not strict `<`) to correctly handle `lo == mid`.
- **Non-monotonic predicate** — binary search on answer requires the predicate to be strictly false…false…true…true (or the reverse). A predicate that flips back and forth will give wrong answers silently.
- **`hi = n` vs `hi = n-1`** — use `hi = n` when the answer could be "past the end" (insertion point); use `n-1` when you need an actual element index.
- **`Array.BinarySearch` returns `~insertionPoint` on miss** — not -1. Use `~result` to get where the element would be inserted.
- **`Array.Sort` is not stable** — use `OrderBy` if equal elements must maintain relative order.
- **`StringComparer.CurrentCulture` is locale-dependent** — use `StringComparer.Ordinal` for deterministic algorithmic sorting.
- **Quicksort on sorted input without random pivot** — degrades to O(n²). Always randomise the pivot.
- **Cyclic sort index off-by-one** — for 1-indexed values `[1..n]`, the correct position for `nums[i]` is index `nums[i]-1`. For 0-indexed `[0..n-1]` it's index `nums[i]`.

---

## Practice

See [Problems.md](./Problems.md) for worked solutions.

### Quick Reference — Canonical Problems

| # | Problem | LeetCode | Pattern |
|---|---------|----------|---------|
| 1 | Binary Search | 704 | Classic binary search |
| 2 | Search Insert Position | 35 | Lower bound |
| 3 | Find First and Last Position | 34 | Lower + upper bound |
| 4 | Search in Rotated Sorted Array | 33 | Rotated |
| 5 | Search in Rotated Sorted Array II | 81 | Rotated + duplicates |
| 6 | Find Minimum in Rotated Sorted Array | 153 | Rotated |
| 7 | Find Peak Element | 162 | Peak finding |
| 8 | Search a 2D Matrix | 74 | 2D flatten |
| 9 | Search a 2D Matrix II | 240 | Staircase |
| 10 | Koko Eating Bananas | 875 | Binary search on answer |
| 11 | Capacity to Ship in D Days | 1011 | Binary search on answer |
| 12 | Split Array Largest Sum | 410 | Binary search on answer |
| 13 | Min Days to Make m Bouquets | 1482 | Binary search on answer |
| 14 | Median of Two Sorted Arrays | 4 | Binary search on partition |
| 15 | Kth Largest Element | 215 | Quickselect / heap |
| 16 | Count of Smaller Numbers After Self | 315 | Merge sort augmentation |
| 17 | Largest Number | 179 | Custom comparator |
| 18 | H-Index | 274 | Sorting + binary search |
| 19 | Missing Number | 268 | Cyclic sort |
| 20 | Find the Duplicate Number | 287 | Cyclic sort |
| 21 | First Missing Positive | 41 | Cyclic sort |
| 22 | Single Element in Sorted Array | 540 | Binary search |
| 23 | Find K Closest Elements | 658 | Binary search |
| 24 | Search in Unknown-Size Array | 702 | Exponential search |