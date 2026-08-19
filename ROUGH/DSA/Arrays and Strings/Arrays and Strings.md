# Arrays and Strings

> **Scope** — Contiguous-memory sequences (arrays, matrices, strings) and the technique families built on top of them: two pointers, sliding window, prefix sum, in-place manipulation, cyclic sort, Kadane's algorithm, interval basics, matrix traversal, and string algorithms (palindromes, anagrams, KMP/Z, Manacher).

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

An **array** is fixed-layout, homogeneous, contiguous storage:

`address(arr[i]) = base_address + i * sizeof(element)`

That formula gives O(1) random access and cache-friendly scans. The trade-off is middle mutation: insert/delete at index `i` shifts all following elements, so it is O(n) except at the tail with spare capacity.

- **1D array:** linear index -> address.
- **Matrix:** row-major conceptual grid. C# `int[][]` is jagged (array of row references); `int[,]` is rectangular and contiguous, with `matrix[r, c]` at `base + (r * cols + c) * size`.
- **String:** immutable UTF-16 `char` sequence. Array techniques transfer directly, but mutations allocate; bounded alphabets often turn hash maps into fixed `int[26]` / `int[128]` counters.

**Sequence taxonomy matters for brute-force bounds:**

| Term | Contiguous? | Order preserved? | Count for `n` elements |
|---|---|---|---|
| Subarray / substring | Yes | Yes | `n(n+1)/2` |
| Subsequence | No | Yes | `2^n` |
| Subset | No | No | `2^n` |
| Permutation | Uses all elements | Reordered | `n!` |

> **Quick Note** — Row-major row-by-row traversal is cache-friendly; column-by-column jumps by `cols` elements and can be slower on large matrices.

---

## 2. Complexity Reference

| Operation | Time | Space | Notes |
|---|---|---|---|
| Access `arr[i]` | O(1) | O(1) | Direct address computation |
| Search (unsorted) | O(n) | O(1) | Linear scan |
| Search (sorted) | O(log n) | O(1) | Binary search — see [Binary Search](../Binary%20Search/Binary%20Search.md) |
| Insert / delete at end | O(1) amortized | O(1) | `List<T>` doubles capacity on growth |
| Insert / delete at index `i` | O(n) | O(1) | Shift `n - i` elements |
| Slice / copy range (`arr[a..b]`, `Substring`) | O(k) | O(k) | Materializes `k` elements/chars; use indices or spans inside loops |
| Two pointers (opposite/same dir) | O(n) | O(1) | Each pointer moves ≤ n steps total |
| Sliding window | O(n) | O(1)–O(k) | Each element enters/leaves window once |
| Prefix sum build | O(n) | O(n) | One pass; O(1) range-sum queries after |
| Difference array update | O(1) after O(n) diff allocation | O(n) | Defers all range updates to one final prefix-sum pass |
| Kadane's algorithm | O(n) | O(1) | Single pass, running max |
| Matrix transpose + reverse (rotate) | O(n²) | O(1) | In-place for square matrix |
| Spiral traversal | O(rows × cols) | O(1) extra | Visits every cell once |
| Naive substring search | O(n·m) | O(1) | `n` = text, `m` = pattern |
| KMP substring search | O(n + m) | O(m) | Failure function avoids re-scanning text |
| Z-algorithm | O(n + m) | O(n + m) | Same asymptotics as KMP, different bookkeeping |
| Expand-around-center palindrome | O(n²) | O(1) | n centers × O(n) expansion |
| Manacher's algorithm | O(n) | O(n) | Longest palindromic substring in linear time |
| Naive string concatenation in a loop | O(n²) | O(n) peak, O(n²) allocation churn | Each `+=` allocates and copies everything built so far — see §3 |
| `StringBuilder` append × n | O(n) amortized | O(n) | Backed by growable chunks/buffer; convert once at the end |

**Why prefix sum turns range-sum into O(1)**: `sum(l, r) = prefix[r+1] - prefix[l]`. The O(n) cost of summing a range is paid *once* up front instead of on every query.

**Why sliding window is O(n) and not O(n·k)**: the right pointer advances n times total, and the left pointer *also* advances at most n times total (it never resets backward) — so total pointer movement is bounded by 2n, not n·(window size).

---

## 3. C# Toolbox

| API | Use for | Gotcha |
|---|---|---|
| `Array.Sort(arr)` | In-place sort, O(n log n) | `Array.Sort(keys, items)` sorts parallel arrays together |
| `Array.Reverse(arr)` / `Array.Reverse(arr, index, length)` | Whole/partial reverse | Core of rotate-by-reversal |
| `Array.BinarySearch(arr, x)` | Sorted lookup | Missing value returns bitwise complement of insertion point: `~result` |
| `List<T>` | Dynamic array | Middle `Insert`/`RemoveAt` still shifts O(n) elements |
| `Span<T>` / `ReadOnlySpan<char>` | Zero-allocation slicing | Stack-only `ref struct`: cannot be boxed, captured, stored in fields, or cross `await`/`yield` |
| `string.AsSpan(start, length)` | Substring view | Prefer over `Substring` inside hot loops |
| `StringBuilder` | Repeated appends | Convert once at the end with `.ToString()` |
| `string.Create<TState>` | Fill exactly one string via `Span<char>` | Best when final length is known |
| `string.Split` / `string.Join` | Tokenize / build delimited output | `Split` allocates substrings and an array |
| `char.IsLetterOrDigit`, `char.IsWhiteSpace`, `char.ToLowerInvariant` | Character classification | Use invariant/ordinal rules unless locale behavior is required |
| `PriorityQueue<TElement, TPriority>` | Top-K / merge-style array problems | Min-heap by default; negate priority for max-heap behavior |
| `Dictionary<char,int>` vs `int[128]` | Frequency counting | Fixed arrays are faster only when alphabet bounds are guaranteed |

> LeetCode snippets often assume non-null inputs; production APIs should add `ArgumentNullException.ThrowIfNull(...)` before indexing reference-typed inputs.

| | Mutability | Allocation pattern | Best for |
|---|---|---|---|
| `string` | Immutable | New allocation per modification | Final result, dictionary keys, comparisons |
| `StringBuilder` | Mutable buffer | Amortized O(1) append | Incremental construction |
| `Span<char>` / `char[]` | Mutable view/buffer | Zero-copy or one final allocation | Parsing, in-place character work, fixed-size output |

> **Common Trap** — `result += c` in a loop is O(n²) time and O(n²) allocation churn. Use `StringBuilder`, `char[]`, `Span<char>`, or `string.Create`.

---

## 4. Core Patterns / Techniques

### 4.1 Two Pointers — Opposite Direction

**When to use** — sorted array, need a pair/triple hitting a target, or comparing from both ends (palindrome check, container area, trapping rain water).

**Template:**

```csharp
bool HasPairWithSum(int[] arr, int target)
{
    int lo = 0, hi = arr.Length - 1;
    while (lo < hi)
    {
        long sum = (long)arr[lo] + arr[hi];
        if (sum == target) return true;
        if (sum < target) lo++;   // need a bigger sum
        else hi--;                // need a smaller sum
    }
    return false;
}
```

**Complexity:** O(n) time — `lo` and `hi` collectively traverse the array once; O(1) space.

**Correctness proof sketch:** on a sorted array, if `arr[lo] + arr[hi] < target`, every pair using `lo` with any index `≤ hi` is too small, so `lo` is safely discarded; the `> target` case symmetrically discards `hi`. Each move removes only impossible answers.

**Pitfalls**
- Requires the array to be sorted (or sortable without losing needed information).
- `sum < target` vs `sum > target` branch must move the *correct* pointer — moving `lo` when the sum is too big does nothing useful.
- For duplicate handling (e.g. 3Sum), skip repeated values *after* recording a match, not before.

### 4.2 Two Pointers — Same Direction (Fast/Slow on Arrays)

**When to use** — in-place compaction: remove duplicates, remove a value, partition around a pivot, move zeroes.

**Template (write pointer / read pointer):**

```csharp
int Compact<T>(T[] arr, Predicate<T> keep)
{
    int write = 0;
    for (int read = 0; read < arr.Length; read++)
    {
        if (keep(arr[read]))
        {
            arr[write] = arr[read];
            write++;
        }
    }
    return write; // arr[0..write) is the compacted result
}
```

**Complexity:** O(n) time, O(1) space — `read` visits every element once; `write` only ever advances, never overtakes `read`.

**Pitfalls**
- Confusing "remove" semantics (compact valid elements to the front) with "erase and shift" (much more expensive, O(n) per removal).
- Off-by-one when the array is sorted and you need to keep *up to k* duplicates (Remove Duplicates II): compare `arr[write - k]` instead of `arr[write - 1]`.

### 4.3 Fast & Slow Pointers (Floyd's Cycle Style)

**When to use** — find the middle of a sequence in one pass, or detect a cycle in an implicit "next index" graph built from array values (e.g. `nums[i]` used as a pointer to the next index).

**Template:**

```csharp
int FindCycleMeetingIndex(int start, Func<int, int> next)
{
    int slow = start, fast = start;
    do
    {
        slow = next(slow);          // 1 step
        fast = next(next(fast));    // 2 steps
    } while (slow != fast);
    return slow;
}
```

**Complexity:** O(n) time, O(1) space — if a cycle exists, fast gains on slow by one step per iteration, so they meet within one cycle length.

**Pitfalls**
- On arrays, `Next(i) = arr[i]` must be a valid index (values used as pointers) — bounds-check first.
- Distinguish "detect cycle" (do slow/fast meet) from "find cycle start" (reset one pointer to `start`, advance both by 1 until they meet again).

### 4.4 Sliding Window — Fixed Size

**When to use** — "subarray/substring of exactly size k" problems (max sum of size-k window, sliding window maximum).

**Template:**

```csharp
long MaxFixedWindowSum(int[] arr, int k)
{
    if (k <= 0 || k > arr.Length) throw new ArgumentOutOfRangeException(nameof(k));

    long windowSum = 0;
    for (int i = 0; i < k; i++) windowSum += arr[i];
    long best = windowSum;

    for (int right = k; right < arr.Length; right++)
    {
        windowSum += (long)arr[right] - arr[right - k]; // add new, drop oldest
        best = Math.Max(best, windowSum);
    }
    return best;
}
```

**Complexity:** O(n) time, O(1) space (O(k) if a monotonic deque is needed for min/max — see [DSA Patterns](../DSAPatterns/DSAPatterns.md)).

### 4.5 Sliding Window — Variable Size

**When to use** — longest/shortest contiguous range satisfying a monotonic invariant: after adding `right`, moving `left` can restore validity.

```csharp
int LongestAtMostKDistinct(string s, int k)
{
    if (k < 0) throw new ArgumentOutOfRangeException(nameof(k));

    var count = new Dictionary<char, int>();
    int left = 0, best = 0;
    for (int right = 0; right < s.Length; right++)
    {
        char c = s[right];
        count[c] = count.GetValueOrDefault(c) + 1;

        while (count.Count > k)
        {
            char drop = s[left++];
            if (--count[drop] == 0) count.Remove(drop);
        }
        best = Math.Max(best, right - left + 1);
    }
    return best;
}
```

**Complexity:** O(n) time — each endpoint moves at most n times; O(alphabet) space. **Traps:** shrink with `while`; update only after the window has the required validity; negative numbers break variable-size sum windows; exact-K is usually `AtMost(K) - AtMost(K - 1)`.

### 4.6 Prefix Sum / Difference Array

**When to use** — many range-sum queries on a static array, or many range-*update* operations followed by a final read.

**Prefix sum (range sum queries):**

```csharp
long[] BuildPrefixSums(int[] nums)
{
    var prefix = new long[nums.Length + 1];
    for (int i = 0; i < nums.Length; i++)
        prefix[i + 1] = prefix[i] + nums[i];
    return prefix;
}

long RangeSum(long[] prefix, int l, int r)
{
    if (l < 0 || r < l || r >= prefix.Length - 1) throw new ArgumentOutOfRangeException();
    return prefix[r + 1] - prefix[l]; // inclusive [l, r]
}
```

**Difference array (range increment updates, read once at the end):**

```csharp
long[] ApplyRangeAdds(int[] nums, (int L, int R, long Delta)[] updates)
{
    var diff = new long[nums.Length + 1];
    foreach (var (l, r, delta) in updates)
    {
        if (l < 0 || r < l || r >= nums.Length) throw new ArgumentOutOfRangeException(nameof(updates));
        diff[l] += delta;
        diff[r + 1] -= delta;
    }

    var result = new long[nums.Length];
    long running = 0;
    for (int i = 0; i < nums.Length; i++)
    {
        running += diff[i];
        result[i] = nums[i] + running;
    }
    return result;
}
```

**Complexity:** build O(n), query O(1) for prefix sum; each range update O(1), final materialization O(n) for difference array.

**Pitfalls**
- Off-by-one: decide once whether prefix array is 0-indexed shifted by 1 (recommended — avoids `l == 0` special-casing) and stay consistent.
- Difference array only helps when updates are batched before reads; interleaving updates and point-queries needs a Fenwick/BIT instead — see [DSA Patterns](../DSAPatterns/DSAPatterns.md).

### 4.7 In-Place Manipulation: Rotation & Dutch National Flag

**Array rotation by k (reverse-thrice trick):**

```csharp
void Rotate(int[] nums, int k)
{
    if (nums.Length == 0) return;
    int n = nums.Length;
    k %= n;
    if (k < 0) k += n;

    Array.Reverse(nums);
    Array.Reverse(nums, 0, k);
    Array.Reverse(nums, k, n - k);
}
```
Reversing the whole array then reversing each half independently is equivalent to a rotation — O(n) time, O(1) space, no extra buffer.

**Dutch National Flag (3-way partition, e.g. Sort Colors — 0/1/2):**

```csharp
void SortColors(int[] nums)
{
    int low = 0, mid = 0, high = nums.Length - 1;
    while (mid <= high)
    {
        switch (nums[mid])
        {
            case 0: (nums[low], nums[mid]) = (nums[mid], nums[low]); low++; mid++; break;
            case 1: mid++; break;
            case 2: (nums[mid], nums[high]) = (nums[high], nums[mid]); high--; break;
            default: throw new ArgumentOutOfRangeException(nameof(nums), "Values must be 0, 1, or 2.");
        }
    }
}
```

**Complexity:** O(n) time (single pass, `mid` visits each index once — `high` swaps don't re-visit already-processed indices left of `low`), O(1) space.

**Pitfalls**
- After swapping with `high`, do **not** increment `mid` — the swapped-in value from the high side is unexamined and must be re-checked.
- After swapping with `low`, it *is* safe to increment `mid` because the value that moved from `low` to `mid` was already known to be `1` (invariant: everything strictly between `low` and `mid` is `1`).

### 4.8 Cyclic Sort / Index-as-Hash

**When to use** — array contains `n` (or `n-1`) numbers drawn from a known contiguous range like `1..n` — place each value at its "home" index without extra space.

**Template:**

```csharp
void PlaceValuesAtHomeIndex(int[] nums)
{
    int i = 0;
    while (i < nums.Length)
    {
        int value = nums[i];
        if (value >= 1 && value <= nums.Length)
        {
            int correct = value - 1; // home index for value
            if (nums[correct] != value)
            {
                (nums[i], nums[correct]) = (nums[correct], nums[i]);
                continue;
            }
        }
        i++;
    }
}
// second pass: nums[i] != i + 1 reveals missing/duplicate at index i
```

**Complexity:** O(n) time — each swap places at least one value in its home slot permanently, so total swaps ≤ n; O(1) space.

**Sign-marking variant (values in `1..n`):** use the sign at index `value - 1` as the visited bit when you only need detection, not full placement.

```csharp
IList<int> FindDuplicates(int[] nums)
{
    var duplicates = new List<int>();

    for (int i = 0; i < nums.Length; i++)
    {
        int raw = nums[i];
        if (raw == int.MinValue) throw new ArgumentOutOfRangeException(nameof(nums));
        int value = Math.Abs(raw);
        if (value < 1 || value > nums.Length) throw new ArgumentOutOfRangeException(nameof(nums), "Values must be in 1..n.");

        int index = value - 1;
        if (nums[index] < 0) duplicates.Add(value);
        else nums[index] = -nums[index];
    }

    return duplicates;
}
```

> **Common Trap** — Sign-marking mutates the input; restore signs before returning if the caller expects the array unchanged.

**Pitfalls**
- Infinite loop if the "already correct or already occupied" guard condition is wrong — always check `nums[correct] != nums[i]` before swapping to avoid swapping a value with itself.
- Only applies when values are (mostly) within `[1, n]`; sparse or unbounded ranges need a hash set instead.

### 4.9 Kadane's Algorithm

**When to use** — maximum (or minimum) sum contiguous subarray.

**Template:**

```csharp
long MaxSubArray(int[] nums)
{
    if (nums.Length == 0) throw new ArgumentException("Array must not be empty.", nameof(nums));

    long curSum = nums[0], maxSum = nums[0];
    for (int i = 1; i < nums.Length; i++)
    {
        int x = nums[i];
        curSum = Math.Max(x, curSum + x); // start fresh at x, or extend
        maxSum = Math.Max(maxSum, curSum);
    }
    return maxSum;
}
```

**Why it works:** a prefix of the running sum is only worth carrying forward if it is positive — a negative running sum can only drag down any future subarray, so it is discarded (`curSum = x`, i.e. restart).

**Complexity:** O(n) time, O(1) space.

**Variants**
- **Circular max subarray:** `max(Kadane(nums), total - Kadane(minVersion(nums)))`, guarding against the all-negative case (where the min-subarray equals the whole array).
- **Max product subarray:** track both running max *and* running min (a negative number can flip min → max), since products (unlike sums) are not monotonic under a single running extremum.

```csharp
long MaxProduct(int[] nums)
{
    if (nums.Length == 0) throw new ArgumentException("Array must not be empty.", nameof(nums));

    long best = nums[0], maxHere = nums[0], minHere = nums[0];

    for (int i = 1; i < nums.Length; i++)
    {
        int x = nums[i];
        if (x < 0) (maxHere, minHere) = (minHere, maxHere);

        maxHere = Math.Max((long)x, maxHere * x);
        minHere = Math.Min((long)x, minHere * x);
        best = Math.Max(best, maxHere);
    }

    return best;
}
```

### 4.10 Interval Basics

**When to use** — merge overlapping ranges, insert an interval, count meeting rooms needed.

**Merge intervals template:**

```csharp
int[][] Merge(int[][] intervals)
{
    Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0])); // sort by start
    var result = new List<int[]>();
    foreach (var iv in intervals)
    {
        if (result.Count == 0 || result[^1][1] < iv[0])
            result.Add(iv);
        else
            result[^1][1] = Math.Max(result[^1][1], iv[1]); // extend overlap
    }
    return result.ToArray();
}
```

**Complexity:** O(n log n) for the sort dominates; the merge pass itself is O(n). Space O(n) for the result (or O(log n)–O(n) for the sort). This sample sorts the input array and reuses interval arrays; clone first if callers require original order/objects unchanged.

> **Interview Tip** — Sorting by start is the near-universal first step for interval problems; sorting by end matters specifically for greedy "max non-overlapping intervals" (activity selection) — see [Greedy](../Greedy/Greedy.md).

| Task | Sort / state | Rule |
|---|---|---|
| Merge intervals | Sort by start | Overlap when `cur.Start <= last.End`; extend the end |
| Insert interval | Already sorted by start | Append before, merge overlaps, append after |
| Non-overlapping intervals | Sort by end | Keep earliest finisher; remove intervals that start before current end |
| Meeting rooms | Sort starts + min-heap of ends | Reuse a room while earliest end `<= cur.Start` |

> **Important** — Clarify interval semantics: `[1,2]` and `[2,3]` overlap for closed intervals, but not for half-open intervals `[start,end)`. That choice flips `<` vs `<=` in the merge condition.

### 4.11 2D Matrix Traversal — Spiral & Rotation

**Spiral order (shrinking boundary):**

```csharp
List<int> SpiralOrder(int[][] matrix)
{
    var result = new List<int>();
    if (matrix.Length == 0 || matrix[0].Length == 0) return result;

    int top = 0, left = 0, bottom = matrix.Length - 1, right = matrix[0].Length - 1;
    while (top <= bottom && left <= right)
    {
        for (int c = left; c <= right; c++) result.Add(matrix[top][c]);
        top++;
        for (int r = top; r <= bottom; r++) result.Add(matrix[r][right]);
        right--;
        if (top <= bottom)
        {
            for (int c = right; c >= left; c--) result.Add(matrix[bottom][c]);
            bottom--;
        }
        if (left <= right)
        {
            for (int r = bottom; r >= top; r--) result.Add(matrix[r][left]);
            left++;
        }
    }
    return result;
}
```

**Rotate square matrix 90° clockwise (transpose + reverse rows):**

```csharp
void Rotate(int[][] matrix)
{
    int n = matrix.Length;
    for (int r = 0; r < n; r++)
        if (matrix[r].Length != n) throw new ArgumentException("Matrix must be square.", nameof(matrix));

    for (int r = 0; r < n; r++)              // transpose in place
        for (int c = r + 1; c < n; c++)
            (matrix[r][c], matrix[c][r]) = (matrix[c][r], matrix[r][c]);

    foreach (var row in matrix)
        Array.Reverse(row);                  // reverse each row
}
```

**Why transpose + reverse = rotation:** transposing flips the matrix across its main diagonal (`matrix[r][c] → matrix[c][r]`); reversing each row then flips it horizontally. The composition of "flip across diagonal" then "flip horizontally" is exactly a 90° clockwise rotation — avoids allocating a second n×n buffer.

**Complexity:** spiral traversal is O(rows × cols) time and O(1) extra space excluding output; square rotation is O(n²) time and O(1) extra space.

**Set Matrix Zeroes (first row/column as markers):**

```csharp
void SetZeroes(int[][] matrix)
{
    if (matrix.Length == 0 || matrix[0].Length == 0) return;

    int rows = matrix.Length, cols = matrix[0].Length;
    bool firstRowZero = false, firstColZero = false;

    for (int c = 0; c < cols; c++) firstRowZero |= matrix[0][c] == 0;
    for (int r = 0; r < rows; r++) firstColZero |= matrix[r][0] == 0;

    for (int r = 1; r < rows; r++)
        for (int c = 1; c < cols; c++)
            if (matrix[r][c] == 0)
            {
                matrix[r][0] = 0;
                matrix[0][c] = 0;
            }

    for (int r = 1; r < rows; r++)
        for (int c = 1; c < cols; c++)
            if (matrix[r][0] == 0 || matrix[0][c] == 0)
                matrix[r][c] = 0;

    if (firstRowZero) Array.Fill(matrix[0], 0);
    if (firstColZero)
        for (int r = 0; r < rows; r++) matrix[r][0] = 0;
}
```

**Complexity:** O(rows × cols) time, O(1) extra space; the two booleans preserve the original first-row/first-column zero state.

> **Quick Note** — A fully sorted matrix can often be treated as one sorted array: binary-search `idx` and map back with `row = idx / cols`, `col = idx % cols`.

### 4.12 Palindromes — Expand Around Center & Manacher's Algorithm

**Expand around center (every char is an odd center; every gap is an even center):**

```csharp
string LongestPalindrome(string s)
{
    int start = 0, maxLen = 0;
    int ExpandLen(int l, int r)
    {
        while (l >= 0 && r < s.Length && s[l] == s[r]) { l--; r++; }
        return r - l - 1;
    }

    for (int i = 0; i < s.Length; i++)
    {
        int len = Math.Max(ExpandLen(i, i), ExpandLen(i, i + 1));
        if (len > maxLen) { maxLen = len; start = i - (len - 1) / 2; }
    }
    return s.Substring(start, maxLen);
}
```

**Complexity:** O(n²) time, O(1) space; this is the expected interview answer. **Manacher:** O(n) longest palindromic substring by inserting separators and reusing mirrored radii around the rightmost-reaching center. Mention it for a linear-time follow-up; do not lead with it unless requested.

### 4.13 Anagrams

**When to use** — compare character multisets, find permutations, or group words by letter composition.

```csharp
bool IsAnagram(string s, string t)
{
    if (s.Length != t.Length) return false;
    Span<int> counts = stackalloc int[26]; // lowercase 'a'..'z'
    for (int i = 0; i < s.Length; i++)
    {
        int si = s[i] - 'a', ti = t[i] - 'a';
        if ((uint)si >= 26 || (uint)ti >= 26) return false;
        counts[si]++;
        counts[ti]--;
    }
    foreach (int c in counts) if (c != 0) return false;
    return true;
}
```

| Approach | Time | Space | Notes |
|---|---|---|---|
| Sort key | O(n log n) per word | O(n) | Simplest grouping key |
| Frequency signature | O(n) per word for fixed alphabet | O(1) alphabet | Faster for long words; e.g. `string.Join("#", counts)` |
| Prime product | O(n) | O(1) only with fixed-width arithmetic | Avoid: overflow causes collisions |

Use dictionaries/Rune-aware logic for Unicode beyond simple UTF-16 `char` counting. Avoid `stackalloc` inside large loops; stack allocations live until the method returns.

### 4.14 KMP & Z-Algorithm — Pattern Matching

**When to use** — find all occurrences of pattern `p` (length m) in text `s` (length n) in O(n + m), avoiding naive O(n*m) rescans.

```csharp
int[] BuildLps(string pattern)
{
    int[] lps = new int[pattern.Length];
    int len = 0, i = 1;
    while (i < pattern.Length)
    {
        if (pattern[i] == pattern[len]) lps[i++] = ++len;
        else if (len != 0) len = lps[len - 1];
        else lps[i++] = 0;
    }
    return lps;
}

IList<int> Search(string text, string pattern)
{
    if (pattern.Length == 0)
    {
        var allPositions = new List<int>(text.Length + 1);
        for (int pos = 0; pos <= text.Length; pos++) allPositions.Add(pos);
        return allPositions;
    }

    var lps = BuildLps(pattern);
    var matches = new List<int>();
    int i = 0, j = 0;
    while (i < text.Length)
    {
        if (text[i] == pattern[j]) { i++; j++; }
        if (j == pattern.Length) { matches.Add(i - j); j = lps[j - 1]; }
        else if (i < text.Length && text[i] != pattern[j])
        {
            if (j != 0) j = lps[j - 1];
            else i++;
        }
    }
    return matches;
}
```

**Why it is O(n + m):** `lps` tells how far the pattern can fall back after mismatch; the text pointer never backtracks. Empty-pattern convention varies; this sample returns all `n + 1` boundaries.

**Z-algorithm note:** `z[k]` is the longest common prefix between the combined sequence and suffix `k`, usually over `pattern + separator + text`. Same O(n + m) time as KMP; often convenient for prefix/repetition problems. Ensure the separator cannot collide with input. Keep KMP as the default interview implementation.

### 4.15 String Building Costs

> **Optimization** — Building a string of length n via repeated `+=` in C# is O(n²): each concatenation allocates a new backing array and copies everything so far. Use `StringBuilder` (amortized O(n)) or, for a known final length, a `char[]`/`Span<char>` filled directly and converted once via `new string(...)` or `string.Create`.

```csharp
// Precise, allocation-minimal construction when the final length is known up front
string BuildFixed(int length, Func<int, char> generator) =>
    string.Create(length, generator, (span, gen) =>
    {
        for (int i = 0; i < span.Length; i++) span[i] = gen(i);
    });
```

### 4.16 Encode / Decode Strings

**When to use** — serialize a list of arbitrary strings without relying on a delimiter that may also appear in the payload.

```csharp
string Encode(IList<string> values)
{
    if (values is null) throw new ArgumentNullException(nameof(values));

    var sb = new StringBuilder();
    foreach (string value in values)
    {
        if (value is null) throw new ArgumentException("Null strings are not supported.", nameof(values));
        sb.Append(value.Length).Append('#').Append(value);
    }
    return sb.ToString();
}

IList<string> Decode(string encoded)
{
    if (encoded is null) throw new ArgumentNullException(nameof(encoded));

    var result = new List<string>();
    int i = 0;

    while (i < encoded.Length)
    {
        int delimiter = encoded.IndexOf('#', i);
        if (delimiter < 0) throw new FormatException("Missing length delimiter.");
        if (!int.TryParse(encoded.AsSpan(i, delimiter - i), out int length) || length < 0)
            throw new FormatException("Invalid length prefix.");

        int start = delimiter + 1;
        if (length > encoded.Length - start) throw new FormatException("Length exceeds remaining payload.");
        result.Add(encoded.Substring(start, length));
        i = start + length;
    }

    return result;
}
```

> **Interview Tip** — A delimiter-only encoding breaks as soon as a string contains that delimiter. Length-prefixing is delimiter-safe and handles empty strings naturally (`0#`).

---

## 5. Classic Problems & Solutions

### 5.1 Two Sum (unsorted array, indices required)

- **Pattern:** hash map complement lookup; sorting would lose original indices unless you carry them.
- **Twist:** compute complement as `long` (`(long)target - nums[i]`) to avoid overflow; duplicates are handled by checking before inserting current index.
- **Complexity:** brute force O(n²)/O(1); hash map O(n) expected time, O(n) space.

### 5.2 Container With Most Water

- **Pattern:** §4.1 opposite two pointers.
- **Twist:** move the shorter line; width only shrinks, so only raising the limiting height can improve area.
- **Complexity:** brute force O(n²); two pointers O(n)/O(1).

### 5.3 3Sum

- **Pattern:** sort, fix one anchor, two-pointer the suffix.
- **Twist:** duplicate handling is the interview signal: skip duplicate anchors before scanning and duplicate pairs after recording a triplet.
- **Complexity:** O(n²) time, O(1) extra space excluding sort/output; brute force is O(n³).

### 5.4 Maximum Subarray / Product Variants

- **Max sum:** §4.9 Kadane; initialize from `nums[0]`, not 0, so all-negative arrays work. O(n)/O(1).
- **Circular max:** `max(Kadane, total - minKadane)`, but return normal Kadane for all-negative input.
- **Max product:** track both `maxHere` and `minHere`; negatives swap roles. O(n)/O(1).

### 5.5 Product of Array Except Self

- **Pattern:** prefix products written into output, then multiply by a suffix product while scanning backward.
- **Twist:** no division means zeros are handled naturally; output array is excluded from extra-space accounting.
- **Complexity:** O(n) time, O(1) extra space; use `long` if products can exceed `int`.

### 5.6 Longest Substring Without Repeating Characters

- **Pattern:** variable sliding window.
- **Twist:** last-seen index map lets `left` jump to `prev + 1` instead of shrinking one char at a time; only jump when `prev >= left`.
- **Complexity:** O(n) expected time, O(min(n, alphabet)) space; `int[128]` only when ASCII is guaranteed.

### 5.7 Minimum Window Substring

- **Pattern:** shortest valid variable window.
- **Twist:** track `have` = number of distinct required chars whose counts are satisfied, so window validity is O(1); record while valid before shrinking.
- **Complexity:** O(n + m) expected time, O(alphabet) space; brute force substring checking is O(n²*m).

### 5.8 Trapping Rain Water

- **Pattern:** two pointers with running `leftMax`/`rightMax`.
- **Twist:** advance the side with the smaller current height; that side already has a sufficient opposite wall, so its own running max caps the water.
- **Complexity:** prefix/suffix arrays O(n)/O(n); two pointers O(n)/O(1).

### 5.9 Matrix Family: Spiral, Rotate Image, Set Matrix Zeroes

- **Spiral:** §4.11 shrinking boundaries; avoid a visited grid unless movement rules are irregular. O(rows*cols), O(1) extra excluding output.
- **Rotate Image:** transpose then reverse each row; only in-place for square matrices. O(n²)/O(1).
- **Set Matrix Zeroes:** first row/column as markers plus two booleans for their original zero state. O(rows*cols)/O(1).

### 5.10 Longest Palindromic Substring

- **Pattern:** §4.12 expand around every char and gap.
- **Twist:** return start is `center - (len - 1) / 2`, which handles odd/even lengths uniformly.
- **Complexity:** brute force O(n³), expand-around-center O(n²)/O(1), Manacher O(n)/O(n) only for explicit linear-time follow-up.

---

## 6. Pattern Recognition

| Signal in the problem statement | Likely pattern |
|---|---|
| "sorted", "pair/triplet target", "palindrome" | Opposite two pointers |
| "remove/compact/partition in place", "stable front" | Same-direction two pointers |
| "cycle", "duplicate as next index" | Floyd fast/slow |
| "substring/subarray of size k" | Fixed sliding window |
| "longest/shortest/minimum contiguous range satisfying X" | Variable sliding window |
| "exactly K distinct" | `AtMost(K) - AtMost(K - 1)` |
| "range sum queries", "static array many queries" | Prefix sum |
| "range updates then final values" | Difference array |
| "values in 1..n", "missing/duplicate", "O(1) space" | Cyclic sort / index-as-hash |
| "maximum sum/product contiguous subarray" | Kadane / max-min product variant |
| "merge/insert/overlap intervals", "meeting rooms" | Sort intervals + sweep/heap |
| "spiral", "rotate matrix", "set row/col zero" | Boundary traversal / transpose / first-row markers |
| "anagram", "permutation in string", "frequency" | Fixed counts / sliding window counts |
| "find all pattern occurrences", "avoid O(n*m)" | KMP; mention Z for prefix/repetition variants |
| "next greater/smaller", "sliding max/min" | Monotonic stack/deque (see Stack and Queue) |

---

## 7. Interview Focus

- **What is being tested:** replacing O(n²) scans with O(n) pointer/window/prefix invariants, then explaining why boundaries move safely.
- **Trade-offs to say aloud:** two pointers need sortedness/monotonic discard; sliding windows need contiguity plus monotonic "shrink until valid"; prefix sums trade O(n) preprocessing/space for O(1) queries; in-place tricks mutate shared input.
- **Follow-ups:** no extra space -> output-array prefix/suffix or index-as-hash; huge text -> KMP with O(m) state; streaming -> keep only window state/checkpoints; parallel -> counts/prefix/Kadane summaries compose, while windows need boundary reconciliation.
- **When NOT to use:** no cyclic sort outside `1..n`; no sliding window for subsequences or non-monotonic validity; no Manacher unless linear palindrome search is explicitly requested.

---

## 8. Common Traps & Edge Cases

| Trap | Why it bites |
|---|---|
| Empty array / empty string | Loop bounds, `arr[0]` access, or `Substring` on length 0 |
| Single-element array | Two pointers with `lo == hi` should not enter the loop, or should be handled explicitly |
| All elements identical | Sliding window / cyclic sort logic that assumes distinctness can loop incorrectly |
| Duplicate handling in sorted two-pointer problems | 3Sum-style answers need duplicate anchors skipped before the scan and duplicate hits skipped after recording |
| Negative numbers in "max subarray"-style problems | Kadane's must initialize from the first element (or -∞), not 0 |
| Negative numbers in variable-size sum windows | Sum validity is no longer monotonic; use prefix sums/hashing or a monotonic deque instead |
| Integer overflow on sum/product accumulation | Use `long` for large-range prefix sums or products |
| Off-by-one in prefix sum indexing | Decide 0-indexed vs 1-indexed prefix array once, stay consistent |
| Interval endpoint convention | Closed vs half-open intervals decide whether touching endpoints overlap (`<=` vs `<`) |
| Sliding window shrinking with `if` instead of `while` | A single expansion can require multiple shrinks |
| String immutability assumed mutable | `s[i] = c` does not compile in C# — must build a new string or use `char[]`/`Span<char>` |
| `Substring` / range slices inside loops | They allocate and copy; repeated slicing can turn O(n) scans into O(n²) behavior |
| Culture-sensitive string comparison/casing | Use `StringComparison.Ordinal` and `ToLowerInvariant` unless locale rules are wanted |
| UTF-16 `char` treated as a user-perceived character | Surrogate pairs and combining marks break simple `s[i]` logic if the interviewer means grapheme clusters |
| Modifying a collection while iterating it | C# enumerators usually throw; collect changes separately or iterate by index where safe |
| Jagged (`int[][]`) vs rectangular (`int[,]`) matrix mixed up | Different indexing syntax (`arr[i][j]` vs `arr[i, j]`) and different memory layout |
| Rotating a non-square matrix in place | Transpose+reverse only works for square matrices — non-square rotation needs a new array |
| KMP `lps` array built incorrectly | A single indexing mistake silently produces wrong fallback and misses matches |
| Separator/sentinel collisions in Z or Manacher transforms | Arbitrary C# strings can contain delimiter-looking chars; use out-of-alphabet tokens or explicit bounds |
| ASCII-sized frequency arrays on Unicode input | `char` values can exceed 127; use `Dictionary<char,int>` or `Rune`/grapheme-aware logic when required |

---

## 9. Related LeetCode Problems

> The full tiered problem set lives in [Practice Roadmap](../DSAPatterns/Practice-Roadmap.md). The list below is the minimum set for this topic.

| # | Problem | Pattern |
|---|---|---|
| 1 | Two Sum | Hash map complement lookup |
| 3 | Longest Substring Without Repeating Characters | Variable sliding window + last-seen jump |
| 5 | Longest Palindromic Substring | Expand around center |
| 11 | Container With Most Water | Opposite two pointers |
| 15 | 3Sum | Sort + two pointers + duplicate skipping |
| 41 | First Missing Positive | Cyclic sort / index-as-hash |
| 42 | Trapping Rain Water | Two pointers with running maxima |
| 48 | Rotate Image | Transpose + reverse rows |
| 49 | Group Anagrams | Frequency signature hashing |
| 53 | Maximum Subarray | Kadane's algorithm |
| 56 | Merge Intervals | Sort by start + scan |
| 73 | Set Matrix Zeroes | First row/column markers |
| 76 | Minimum Window Substring | Variable sliding window with have/need |
| 238 | Product of Array Except Self | Prefix/suffix product in output |
| 560 | Subarray Sum Equals K | Prefix sum + hash map |

---

## 10. Cheat Sheet

- **Counts:** subarrays/substrings `n(n+1)/2`, subsequences/subsets `2^n`, permutations `n!`.
- **Prefix sum:** `RangeSum(l, r) = prefix[r+1] - prefix[l]`, with `prefix[0] = 0`.
- **Difference array:** range add with `diff[l] += v`, `diff[r+1] -= v`, then one prefix pass.
- **Two pointers:** sorted sum -> `sum < target` means `lo++`; `sum > target` means `hi--`; DNF partitions `[0,low)`, `[low,mid)`, `[mid,high]`, `(high,n)`.
- **Window selector:** fixed width -> exact `k`; longest valid -> shrink while invalid; shortest valid -> shrink while valid and record inside.
- **Exactly K distinct:** `AtMost(K) - AtMost(K - 1)`.
- **Kadane:** `cur = max(x, cur + x)`; max product also tracks `minHere` and swaps on negative `x`.
- **Product except self:** left products into output, then multiply by right suffix while scanning backward; no division.
- **Cyclic sort/sign marking:** values in `1..n` can be swapped to `value - 1` or mark `nums[Math.Abs(x)-1]` negative.
- **Rotate array:** reverse all, reverse first `k`, reverse remaining `n-k`; normalize `k` first.
- **2D mapping:** `row = i / cols`, `col = i % cols`; rotate square matrix = transpose + reverse each row.
- **Palindrome:** two pointers for check; expand around every char/gap for longest substring; Manacher only for O(n) follow-up.
- **Anagram:** fixed lowercase -> `int[26]`; arbitrary text -> dictionary/Rune-aware counts.
- **Pattern matching:** KMP/Z avoid text backtracking and run O(n + m); KMP is the default implementation.
- **String building:** never `+=` in a loop; use `StringBuilder`, `char[]`, or `string.Create`.
- **O(1) space hints:** two pointers, output-array prefix/suffix, in-place swap, index-as-hash, first row/column markers.

---

## See Also

- [Hashing](../Hashing/Hashing.md) — Turns the inner scan of a two-pointer or subarray problem into an O(1) lookup.
- [Binary Search](../Binary%20Search/Binary%20Search.md) — The next step once the array is sorted, plus binary search on the answer.
- [Stack and Queue](../Stack%20and%20Queue/Stack%20and%20Queue.md) — Monotonic stack and deque solve the 'nearest greater' and window-extremum scans.
- [DSA Patterns](../DSAPatterns/DSAPatterns.md) — master index: pattern selection flowchart and complexity-from-constraints.
- [Practice Roadmap](../DSAPatterns/Practice-Roadmap.md) — the tiered problem set to drill this topic.
