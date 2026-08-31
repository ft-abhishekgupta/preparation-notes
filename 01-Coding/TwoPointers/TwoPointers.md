# Two Pointers and Sliding Window

> **Core idea:** maintain one or two indices that only ever move forward, reducing what would be an O(n²) nested scan to O(n) by proving you can safely discard whole regions.
> **Recognise it when:** "find a pair/triplet summing to target in sorted array", "longest/shortest subarray satisfying a condition", "subarray/substring with exactly K distinct", "move all X to one end in-place".
> **Costs:** O(n) time (each pointer moves forward at most n steps), O(1) or O(k) space depending on the window state.

---

## Mental Model

The invariant differs by pattern but the shared idea is: **at every step you know enough to rule out a whole region without examining it**.

- **Opposite-ends:** array is sorted → if the current pair's sum is too large, decreasing `hi` is the only move that can reduce it; every pair `(lo, hi-1), (lo, hi-2), …` would be even larger → skip them all.
- **Fast/slow write-pointer:** `slow` is the "clean" boundary; everything before `slow` satisfies the filter. `fast` scans candidates.
- **Sliding window:** the window state (sum, frequency map, …) is maintained *incrementally*. Shrinking from the left is O(1) amortised because `lo` never rewinds.

**Why expand/shrink is O(n), not O(n²):**
Each of `lo` and `hi` moves monotonically in one direction. The total number of increments across the entire run is at most 2n. Even though the inner `while` shrink loop can run many iterations on a single outer step, those iterations are "paid for" by prior expansions that each cost 1. Classic amortised argument.

---

## Complexity Reference

| Pattern | Time | Space | Pre-condition |
| ------- | ---- | ----- | ------------- |
| Opposite-ends | O(n) | O(1) | Array **sorted** (or value-monotonic) |
| Fast/slow write | O(n) | O(1) | None |
| Fixed sliding window | O(n) | O(1) or O(k) | None |
| Variable sliding window | O(n) | O(k) | Window state computable incrementally |
| Three-pointer (3Sum) | O(n²) | O(1)† | Array sorted |
| Merge from end | O(m+n) | O(1) | Both arrays sorted; target has extra space |

†Space for result list excluded.

---

## Templates

### 1. Opposite-Ends (Converging) Two Pointers

**Use when:** sorted array, looking for a pair (or triplet) satisfying a target condition.

```csharp
// Time O(n) | Space O(1)
// Pre-condition: A is sorted
int lo = 0, hi = A.Length - 1;
while (lo < hi)
{
    int sum = A[lo] + A[hi];
    if (sum == target)      { /* record result */ lo++; hi--; }
    else if (sum < target)  { lo++; }
    else                    { hi--; }
}
```

> **Why it works:** When `sum < target`, every pair `(lo, hi), (lo, hi-1), …, (lo, lo+1)` with the current `lo` is also too small (the array is sorted, so `A[hi-1] ≤ A[hi]`). We can discard the entire column by advancing `lo`. Symmetrically for `sum > target`.

**Container With Most Water variant** — move the *shorter* side:
The area is `(hi - lo) × min(A[lo], A[hi])`. If `A[lo] < A[hi]`, moving `hi` inward can never increase `min(…)` beyond `A[lo]` (which is the bottleneck) and definitely reduces the width. So no pair `(lo, hi'), hi' < hi` can beat the current area while `lo` stays fixed. Move `lo` instead.

---

### 2. Same-Direction: Write-Pointer (Fast / Slow)

**Use when:** in-place compaction — keep elements satisfying a predicate, or remove duplicates.

```csharp
// Time O(n) | Space O(1)
// Idiom: slow = next write position; fast = read scanner
int slow = 0;
for (int fast = 0; fast < nums.Length; fast++)
{
    if (/* keep nums[fast] */)
    {
        nums[slow++] = nums[fast];
    }
}
// nums[0..slow-1] is the compacted result; return slow
return slow;
```

Variants:
- **Remove Duplicates (sorted):** condition is `fast == 0 || nums[fast] != nums[slow - 1]`.
- **Move Zeroes:** condition is `nums[fast] != 0`; after the loop, fill `nums[slow..]` with 0.
- **Keep at most K duplicates:** condition is `slow < k || nums[fast] != nums[slow - k]`.

---

### 3. Fixed-Size Sliding Window

**Use when:** problem asks for aggregate (max/min/sum/count) over every contiguous subarray of **exactly** size k.

```csharp
// Time O(n) | Space O(1) for numeric; O(k) if using a frequency map
// Seed the first window
int windowVal = 0;
for (int i = 0; i < k; i++) windowVal += A[i];
int best = windowVal;

for (int i = k; i < A.Length; i++)
{
    windowVal += A[i] - A[i - k];   // add incoming, drop outgoing
    best = Math.Max(best, windowVal);
}
return best;
```

---

### 4. Variable-Size Sliding Window — Longest Valid

**Use when:** find the *longest* subarray/substring satisfying a constraint (e.g. at most K distinct chars, sum ≤ target).

```csharp
// Time O(n) | Space O(k) for the window state
// Template: expand → shrink while invalid → record
var freq = new Dictionary<char, int>();
int lo = 0, best = 0;

for (int hi = 0; hi < s.Length; hi++)
{
    // 1. Expand — add s[hi] to window
    freq[s[hi]] = freq.GetValueOrDefault(s[hi]) + 1;

    // 2. Shrink while INVALID (restore validity)
    while (/* window is invalid */)
    {
        freq[s[lo]]--;
        if (freq[s[lo]] == 0) freq.Remove(s[lo]);  // ← pitfall: remove zero-count keys
        lo++;
    }

    // 3. Record — window [lo..hi] is always valid here
    best = Math.Max(best, hi - lo + 1);
}
return best;
```

---

### 5. Variable-Size Sliding Window — Shortest Valid

**Use when:** find the *shortest* subarray/substring satisfying a constraint (e.g. sum ≥ target, contains all required chars).

```csharp
// Time O(n) | Space O(k)
// Key difference: shrink while VALID (not while invalid)
int lo = 0, best = int.MaxValue;

for (int hi = 0; hi < A.Length; hi++)
{
    // 1. Expand
    windowSum += A[hi];

    // 2. Shrink while VALID (try to minimise length)
    while (/* window is valid */)
    {
        best = Math.Min(best, hi - lo + 1);
        windowSum -= A[lo++];
    }
}
return best == int.MaxValue ? 0 : best;
```

> **Trap:** the `while` vs `if` distinction is critical. For **longest**, use `while` (shrink until invalid). For **shortest**, use `while` (shrink while valid, recording inside the loop). Using `if` for either silently truncates the search.

---

### 6. Counting Valid Windows / Subarrays

**Use when:** count *how many* subarrays satisfy a constraint.

**Key insight — contribution of a valid window:** when `[lo..hi]` is valid, every sub-window ending at `hi` that starts at or after `lo` is also valid. That is `hi - lo + 1` new subarrays. Accumulate this instead of enumerating them.

```csharp
// Time O(n) | Space O(k)
int lo = 0, count = 0;

for (int hi = 0; hi < A.Length; hi++)
{
    // Expand
    // ... update window state with A[hi]

    // Shrink while INVALID
    while (/* window is invalid */)
    {
        // ... remove A[lo] from window state
        lo++;
    }

    // Every starting index in [lo..hi] yields a valid subarray ending at hi
    count += hi - lo + 1;
}
return count;
```

---

### 7. The At-Most-K Trick

**Use when:** count subarrays with **exactly K** of something (distinct values, odd numbers, …).

```text
count(exactly K) = count(atMost K) - count(atMost K-1)
```

**Why this works:** the `atMost K` function counts all subarrays with 0, 1, 2, … K occurrences. Subtracting `atMost(K-1)` cancels every count with 0 … K-1 occurrences, leaving exactly K.

```csharp
// Time O(n) | Space O(k)
int CountExactlyK(int[] A, int k) =>
    CountAtMost(A, k) - CountAtMost(A, k - 1);

int CountAtMost(int[] A, int k)
{
    var freq = new Dictionary<int, int>();
    int lo = 0, count = 0, distinct = 0;

    for (int hi = 0; hi < A.Length; hi++)
    {
        if (freq.GetValueOrDefault(A[hi]) == 0) distinct++;
        freq[A[hi]] = freq.GetValueOrDefault(A[hi]) + 1;

        while (distinct > k)
        {
            freq[A[lo]]--;
            if (freq[A[lo]] == 0) { freq.Remove(A[lo]); distinct--; }
            lo++;
        }

        count += hi - lo + 1;   // all subarrays ending at hi, starting >= lo
    }
    return count;
}
```

---

### 8. Three-Pointer (Fix-One, Two-Pointer Inner Loop)

**Use when:** 3Sum, 4Sum, or any k-sum where you sort first then recurse/reduce.

```csharp
// 3Sum — Time O(n²) | Space O(1) excluding output
Array.Sort(nums);
var result = new List<IList<int>>();

for (int i = 0; i < nums.Length - 2; i++)
{
    if (i > 0 && nums[i] == nums[i - 1]) continue;  // skip outer duplicates

    int lo = i + 1, hi = nums.Length - 1;
    while (lo < hi)
    {
        int sum = nums[i] + nums[lo] + nums[hi];
        if (sum == 0)
        {
            result.Add(new List<int> { nums[i], nums[lo], nums[hi] });
            while (lo < hi && nums[lo] == nums[lo + 1]) lo++;  // skip inner dupes
            while (lo < hi && nums[hi] == nums[hi - 1]) hi--;
            lo++; hi--;
        }
        else if (sum < 0) lo++;
        else hi--;
    }
}
return result;
```

**4Sum:** add an outer loop over index `j`, then run 3Sum logic from `j+1`. Skip `j` duplicates just like `i`. Time O(n³).

**Duplicate-skipping rules:**
- Skip the **outer** pointer duplicate before entering the inner loop (before calling `lo`/`hi`).
- Skip the **inner** pointer duplicates only *after* recording a valid triplet.
- Always check bounds (`lo < hi`) in the skip-while conditions.

---

### 9. Merge from the End (Backwards Two-Pointer Fill)

**Use when:** merge two sorted sequences into one that already has enough trailing space (e.g. LeetCode 88 — Merge Sorted Array).

```csharp
// Time O(m+n) | Space O(1)
int i = m - 1, j = n - 1, k = m + n - 1;
while (i >= 0 && j >= 0)
    nums1[k--] = (nums1[i] >= nums2[j]) ? nums1[i--] : nums2[j--];
while (j >= 0)
    nums1[k--] = nums2[j--];   // remaining nums2 (nums1 tail already in place)
```

---

## Window Shape Comparison

The three most-confused sliding-window shapes side by side:

| Goal | Shrink condition | Record position | Template shape |
| ---- | ---------------- | --------------- | -------------- |
| **Longest** valid window | `while invalid` | After shrink loop | `shrink-while-invalid; record` |
| **Shortest** valid window | `while valid` | Inside shrink loop | `record; shrink-while-valid` |
| **Count** valid windows | `while invalid` | After shrink loop | `count += hi - lo + 1` |

---

## Decision Table — Which Tool to Use

| Situation | Best tool | Why |
| --------- | --------- | --- |
| Sorted array, find pair/triplet summing to target | **Opposite-ends two pointers** | O(1) space; sorted order lets you discard regions |
| Unsorted array, find pair summing to target | **Hash map** → see [Hashing](../Hashing/Hashing.md) | Can't discard regions without sortedness |
| Longest/shortest subarray with bounded aggregate (sum, count) | **Variable sliding window** | Aggregate updates in O(1); no hashmap needed |
| Subarray sum equals K (can be negative) | **Prefix sum + hashmap** → see [Hashing](../Hashing/Hashing.md) | Negatives prevent shrinking from being monotone |
| Subarray sum equals K (all non-negative) | **Variable sliding window** | Non-negative guarantees monotone shrink |
| Subarray with exactly K distinct | **At-most-K trick** (two sliding windows) | Exact-K not directly addressable with one window |
| Count subarrays/substrings with a condition | **Sliding window + `hi - lo + 1` count** | Avoids enumerating all O(n²) subarrays |
| Maximum in every window of size k | **Monotonic deque** → see [StacksAndQueues](../StacksAndQueues/StacksAndQueues.md) | O(1) max query per step; two-pointer can't do this |
| Detect cycle in linked list | **Floyd's slow/fast** → see [LinkedLists](../LinkedLists/LinkedLists.md) | Two pointers on a list, not an array |
| Find element in sorted array | **Binary search** → see [SearchingAndSorting](../SearchingAndSorting/SearchingAndSorting.md) | O(log n); two-pointer finds pairs, not single elements |

---

## Pattern Recognition

| Problem says… | Template | Complexity |
| ------------- | -------- | ---------- |
| "Two numbers sum to target" + sorted | Opposite-ends | O(n) |
| "Unique triplets summing to 0" | Fix-one + opposite-ends | O(n²) |
| "In-place remove / move / compact" | Write-pointer fast/slow | O(n) |
| "Max/min sum of subarray of size k" | Fixed sliding window | O(n) |
| "Longest substring/subarray with at most K …" | Variable window, longest | O(n) |
| "Minimum length subarray with sum ≥ target" | Variable window, shortest | O(n) |
| "Number of subarrays with at most K …" | Sliding window + count | O(n) |
| "Number of subarrays with exactly K …" | At-most-K trick | O(n) |
| "Permutation / anagram exists in string" | Fixed window + freq array | O(n) |
| "Minimum window containing all chars of t" | Variable window, shortest | O(n) |
| "Trap rain water / max area between lines" | Opposite-ends (converging) | O(n) |
| "3Sum / 4Sum / k-Sum" | Sort + fix outer + opposite-ends | O(nᵏ⁻¹) |
| "Merge two sorted arrays in-place" | Backwards two-pointer fill | O(m+n) |
| "Max of every window of size k" | Monotonic deque (not here) → [StacksAndQueues](../StacksAndQueues/StacksAndQueues.md) | O(n) |

---

## Variants and Differences

### Sorting requirement

| Pattern | Needs sorted input? | Why |
| ------- | ------------------- | --- |
| Opposite-ends | **Yes** | Discard argument relies on monotone ordering |
| Fast/slow write | No | Only reads each element once |
| Sliding window | No | Window state is maintained independently of order |
| 3Sum / 4Sum | Yes (sort first) | Reduces to opposite-ends sub-problem |

### `while` vs `if` in shrink step

- Use **`while`** when multiple elements may need removing to restore validity (e.g. frequency-map window).
- Use **`if`** only when at most one element can invalidate the window in one step (rare; almost always use `while`).

---

## Pitfalls

- **Forgetting sortedness:** opposite-ends two pointers silently give wrong answers on unsorted input. Sort first, or reconsider the pattern.
- **Off-by-one in window size:** window length is `hi - lo + 1`, not `hi - lo`. A common source of fencepost bugs.
- **Stale window state after shrink:** always update the answer *after* the shrink loop, not before. The window is only guaranteed valid after shrinking completes.
- **Not removing zero-count keys:** leaving `freq[c] = 0` in the map causes `freq.Count` to over-count distinct keys → wrong shrink trigger. Always `Remove` when count hits 0.
- **`while` vs `if` in shrink:** using `if` instead of `while` only removes one element per outer step → O(n²) behaviour and incorrect results.
- **Inner-loop duplicate skipping in k-Sum:** must check bounds (`lo < hi`) inside the skip-while; otherwise you can advance past the other pointer.
- **Overflow in sum:** `A[lo] + A[hi]` can overflow `int` if values are large. Use `long` or rearrange the comparison: `A[lo] == target - A[hi]`.
- **Shrink-while-valid (shortest window) records inside the loop:** a common mistake is to record *after* the shrink loop — you'll miss cases where the last shrink step produces the optimal window.

---

## Not Owned Here (links out)

| Topic | Owner |
| ----- | ----- |
| Monotonic deque / Sliding Window Maximum | [StacksAndQueues](../StacksAndQueues/StacksAndQueues.md) |
| Prefix sum + hashmap (Subarray Sum = K) | [Hashing](../Hashing/Hashing.md) |
| Floyd's cycle detection on linked lists | [LinkedLists](../LinkedLists/LinkedLists.md) |
| Binary search | [SearchingAndSorting](../SearchingAndSorting/SearchingAndSorting.md) |
| Dutch flag / partition (3-way) | [ArraysAndStrings](../ArraysAndStrings/ArraysAndStrings.md) |

---

## Practice

→ [Problems.md](./Problems.md)

| # | Problem | LeetCode | Pattern |
| - | ------- | -------- | ------- |
| 1 | Valid Palindrome | 125 | Opposite-ends |
| 2 | Two Sum II | 167 | Opposite-ends |
| 3 | Container With Most Water | 11 | Opposite-ends |
| 4 | Trapping Rain Water | 42 | Opposite-ends / prefix max |
| 5 | 3Sum | 15 | Fix-one + opposite-ends |
| 6 | 4Sum | 18 | Fix-two + opposite-ends |
| 7 | Remove Duplicates from Sorted Array | 26 | Fast/slow write-pointer |
| 8 | Move Zeroes | 283 | Fast/slow write-pointer |
| 9 | Minimum Size Subarray Sum | 209 | Variable window, shortest |
| 10 | Longest Substring Without Repeating Chars | 3 | Variable window, longest |
| 11 | Longest Repeating Character Replacement | 424 | Variable window, longest |
| 12 | Fruit Into Baskets | 904 | Variable window, at-most-K |
| 13 | Permutation in String | 567 | Fixed window + freq |
| 14 | Minimum Window Substring | 76 | Variable window, shortest |
| 15 | Subarrays with K Different Integers | 992 | At-most-K trick |
| 16 | Sliding Window Maximum | 239 | Fixed window + monotonic deque |
