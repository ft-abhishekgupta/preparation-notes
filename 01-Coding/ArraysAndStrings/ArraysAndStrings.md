# Arrays and Strings

> **Core idea:** arrays are contiguous memory — exploit cache locality and index arithmetic to solve range, matrix, and string problems in O(n) with O(1) extra space.
> **Recognise it when:** "subarray sum / product", "rotate / spiral matrix", "missing / duplicate in [1..n]", "next permutation", "run-length encode".
> **Costs:** prefix sum O(n) build → O(1) query; Kadane O(n)/O(1); matrix ops O(m·n)/O(1).

---

## Mental Model

### Array memory model

- Elements stored **contiguously** → sequential access hits CPU cache lines perfectly (cache line ≈ 64 bytes = 16 `int`s).
- Random access O(1): `base + i * sizeof(T)`.
- **Dynamic array (List\<T\>):** doubles capacity on overflow → amortised O(1) append. Individual worst-case append is O(n) (copy), but spread over n appends gives O(1) each.

### Invariant families

| Technique | What is always true |
| --------- | ------------------- |
| Prefix sum | `P[i] = A[0]+…+A[i-1]`; range sum = `P[r+1]−P[l]` |
| Difference array | `diff[l]+=v; diff[r+1]-=v` → prefix-sum of diff gives updated A |
| Kadane | `cur` = best subarray sum **ending exactly at i** |
| Dutch flag | `[0..lo)=0`, `[lo..mid)=1`, `[mid..hi]=unprocessed`, `(hi..n)=2` |
| In-place marking | numbers in `[1..n]` → index `i` should hold `i+1`; negate `A[abs(v)-1]` to mark visited |

---

## Complexity Reference

| Operation | Time | Space | Notes |
| --------- | ---- | ----- | ----- |
| Prefix sum build | O(n) | O(n) | one pass |
| Range sum query | O(1) | O(1) | after build |
| Difference array update | O(1) | O(n) | reconstruct in O(n) |
| 2D prefix sum build | O(m·n) | O(m·n) | |
| 2D rectangle query | O(1) | O(1) | after build |
| Kadane (max subarray) | O(n) | O(1) | |
| Dutch flag | O(n) | O(1) | single pass |
| Array rotation (reversal) | O(n) | O(1) | three reverses |
| Spiral / rotate matrix | O(m·n) | O(1) | |
| In-place marking (negate) | O(n) | O(1) | mutates input |
| Next permutation | O(n) | O(1) | |

---

## Templates

### 1 — Prefix Sum (1D)

**Use when:** multiple range-sum queries on a static array.

```csharp
// Build — O(n) time, O(n) space
int[] A = { 1, 2, 3, 4, 5 };
int n = A.Length;
int[] P = new int[n + 1];   // P[0] = 0
for (int i = 0; i < n; i++)
    P[i + 1] = P[i] + A[i];

// Query — O(1)
int RangeSum(int l, int r) => P[r + 1] - P[l];   // inclusive [l, r]
```

> **Why it works:** `P[r+1] = A[0]+…+A[r]`; `P[l] = A[0]+…+A[l-1]`; subtraction cancels the shared prefix.
> Off-by-one: `P[r+1] − P[l]`, **not** `P[r] − P[l]`.

---

### 2 — Difference Array (range update in O(1))

**Use when:** many range-increment operations, answer only needed after all updates.

```csharp
int[] diff = new int[n + 1];

// Add val to A[l..r] inclusive — O(1)
void RangeAdd(int l, int r, int val)
{
    diff[l]     += val;
    diff[r + 1] -= val;
}

// Reconstruct — O(n)
int running = 0;
for (int i = 0; i < n; i++)
{
    running += diff[i];
    A[i] += running;
}
```

> **Why it works:** the +val at `l` propagates forward through the prefix-sum reconstruction; the −val at `r+1` cancels it. Every index outside `[l,r]` sees net zero change.

---

### 3 — 2D Prefix Sum

**Use when:** rectangle sum queries on a grid.

```csharp
// Build — P[i][j] = sum of rectangle (0,0)→(i-1,j-1)
int[,] P = new int[rows + 1, cols + 1];
for (int i = 1; i <= rows; i++)
    for (int j = 1; j <= cols; j++)
        P[i, j] = grid[i-1][j-1] + P[i-1, j] + P[i, j-1] - P[i-1, j-1];

// Query rectangle (r1,c1)→(r2,c2) — 0-indexed input, 1-indexed P
int SubRect(int r1, int c1, int r2, int c2)
    => P[r2+1, c2+1] - P[r1, c2+1] - P[r2+1, c1] + P[r1, c1];
```

---

### 4 — Kadane's Algorithm (max subarray)

**Use when:** maximum (or minimum) contiguous subarray sum/product.

```csharp
// O(n) time, O(1) space. Handles all-negative arrays correctly.
int MaxSubarray(int[] nums)
{
    int best = nums[0], cur = nums[0];
    for (int i = 1; i < nums.Length; i++)
    {
        cur  = Math.Max(nums[i], cur + nums[i]);  // restart or extend
        best = Math.Max(best, cur);
    }
    return best;
}
```

> **Why it works:** `cur + A[i]` extends the best subarray ending at `i-1`; `A[i]` alone starts fresh. We always keep whichever is larger — so `cur` is provably the best subarray ending at `i`.

**Max-product variant:** track both `maxProd` and `minProd` (a negative × negative becomes positive).

```csharp
int MaxProduct(int[] nums)
{
    int best = nums[0], maxP = nums[0], minP = nums[0];
    for (int i = 1; i < nums.Length; i++)
    {
        if (nums[i] < 0) (maxP, minP) = (minP, maxP);   // swap on negative
        maxP = Math.Max(nums[i], maxP * nums[i]);
        minP = Math.Min(nums[i], minP * nums[i]);
        best = Math.Max(best, maxP);
    }
    return best;
}
```

---

### 5 — Dutch National Flag (3-way partition)

**Use when:** sort array of three distinct values in one pass, or quicksort with many duplicates.

```csharp
// Invariant: [0..lo) = 0, [lo..mid) = 1, (hi..n) = 2, [mid..hi] = unprocessed
void DutchFlag(int[] nums)
{
    int lo = 0, mid = 0, hi = nums.Length - 1;
    while (mid <= hi)
    {
        if (nums[mid] == 0)
        {
            (nums[lo], nums[mid]) = (nums[mid], nums[lo]);
            lo++; mid++;
        }
        else if (nums[mid] == 1)
        {
            mid++;
        }
        else
        {
            (nums[mid], nums[hi]) = (nums[hi], nums[mid]);
            hi--;
            // Do NOT advance mid — swapped-in value is unexamined
        }
    }
}
```

---

### 6 — Array Rotation (reversal trick)

**Use when:** rotate array right by k positions in O(1) space.

```csharp
void Rotate(int[] nums, int k)
{
    k %= nums.Length;
    if (k == 0) return;
    Reverse(nums, 0, nums.Length - 1);
    Reverse(nums, 0, k - 1);
    Reverse(nums, k, nums.Length - 1);
}

static void Reverse(int[] a, int lo, int hi)
{
    while (lo < hi) { (a[lo], a[hi]) = (a[hi], a[lo]); lo++; hi--; }
}
```

> **Why it works:** rotating right by k is equivalent to moving the last k elements to the front.
> Reversing the whole array puts those k elements at the start but in reverse order;
> reversing each half separately corrects both halves' order.
> Alternative: **cyclic replacement** — place each element directly at its final position, following the cycle. Same O(n)/O(1) but trickier to implement.

---

### 7 — In-Place Index Marking (numbers in [1..n])

**Use when:** array values are in `[1..n]` and you need O(1) space to find duplicates/missing.
The key invariant: **index `i` should hold value `i+1`**; use sign of `A[abs(v)-1]` as a visited flag.

```csharp
// Find all duplicates (values that appear twice) — O(n) time, O(1) extra space
IList<int> FindDuplicates(int[] nums)
{
    var result = new List<int>();
    foreach (int num in nums)
    {
        int idx = Math.Abs(num) - 1;        // value 1 maps to index 0
        if (nums[idx] < 0)
            result.Add(Math.Abs(num));      // already negated → duplicate
        else
            nums[idx] = -nums[idx];         // mark as visited
    }
    return result;
}

// First Missing Positive — O(n) time, O(1) space (cyclic sort variant)
int FirstMissingPositive(int[] nums)
{
    int n = nums.Length;
    // Place each number at its correct index (nums[i] == i+1)
    for (int i = 0; i < n; i++)
        while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] != nums[i])
            (nums[i], nums[nums[i] - 1]) = (nums[nums[i] - 1], nums[i]);

    for (int i = 0; i < n; i++)
        if (nums[i] != i + 1) return i + 1;

    return n + 1;
}
```

> **Why it works:** values outside `[1..n]` are irrelevant; after cyclic sort every correct value sits at its home index. The first index where `nums[i] ≠ i+1` is the answer.

---

### 8 — Matrix: Spiral Traversal

```csharp
// O(m·n) time, O(1) extra space
IList<int> SpiralOrder(int[][] matrix)
{
    var res = new List<int>();
    int top = 0, bottom = matrix.Length - 1;
    int left = 0, right = matrix[0].Length - 1;

    while (top <= bottom && left <= right)
    {
        // → traverse top row
        for (int c = left; c <= right; c++)
            res.Add(matrix[top][c]);
        top++;

        // ↓ traverse right column
        for (int r = top; r <= bottom; r++)
            res.Add(matrix[r][right]);
        right--;

        // ← traverse bottom row (guard: still a distinct row)
        if (top <= bottom)
        {
            for (int c = right; c >= left; c--)
                res.Add(matrix[bottom][c]);
            bottom--;
        }

        // ↑ traverse left column (guard: still a distinct column)
        if (left <= right)
        {
            for (int r = bottom; r >= top; r--)
                res.Add(matrix[r][left]);
            left++;
        }
    }
    return res;
}
```

> **Trace** `[[1,2,3],[4,5,6],[7,8,9]]`: top row → `1,2,3` (top=1); right col → `6,9` (right=1); bottom row (top≤bottom: 1≤1 ✅) → `8,7` (bottom=1); left col (left≤right: 0≤1 ✅) → `4` (left=1); now top(2)>bottom(1) → stop. Result: `[1,2,3,6,9,8,7,4,5]` ✅

---

### 9 — Matrix: Rotate 90° Clockwise In-Place

```csharp
// Transpose + reverse each row — O(n²) time, O(1) space
void Rotate90(int[][] matrix)
{
    int n = matrix.Length;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            (matrix[i][j], matrix[j][i]) = (matrix[j][i], matrix[i][j]);

    foreach (var row in matrix)
        Array.Reverse(row);
}
```

---

### 10 — Matrix: Set Zeroes (O(1) marker trick)

```csharp
// Use first row and first column as marker arrays — O(m·n) time, O(1) space
void SetZeroes(int[][] matrix)
{
    int rows = matrix.Length, cols = matrix[0].Length;
    bool firstRowZero = false, firstColZero = false;

    for (int c = 0; c < cols; c++) if (matrix[0][c] == 0) firstRowZero = true;
    for (int r = 0; r < rows; r++) if (matrix[r][0] == 0) firstColZero = true;

    for (int r = 1; r < rows; r++)
        for (int c = 1; c < cols; c++)
            if (matrix[r][c] == 0) { matrix[r][0] = 0; matrix[0][c] = 0; }

    for (int r = 1; r < rows; r++)
        for (int c = 1; c < cols; c++)
            if (matrix[r][0] == 0 || matrix[0][c] == 0) matrix[r][c] = 0;

    if (firstRowZero) for (int c = 0; c < cols; c++) matrix[0][c] = 0;
    if (firstColZero) for (int r = 0; r < rows; r++) matrix[r][0] = 0;
}
```

---

### 11 — Next Permutation

```csharp
// O(n) time, O(1) space
void NextPermutation(int[] nums)
{
    int n = nums.Length, i = n - 2;

    // Step 1: find rightmost ascent (pivot)
    while (i >= 0 && nums[i] >= nums[i + 1]) i--;

    if (i >= 0)
    {
        // Step 2: find rightmost element > pivot
        int j = n - 1;
        while (nums[j] <= nums[i]) j--;
        (nums[i], nums[j]) = (nums[j], nums[i]);
    }

    // Step 3: reverse suffix (it's non-increasing → reverse makes it smallest)
    int lo = i + 1, hi = n - 1;
    while (lo < hi) { (nums[lo], nums[hi]) = (nums[hi], nums[lo]); lo++; hi--; }
}
```

---

### 12 — String Fundamentals (C#)

```csharp
// C# string is immutable — naive concatenation in a loop is O(n²). Use StringBuilder.
var sb = new StringBuilder();
sb.Append(c);
sb.Insert(0, c);   // prepend
string result = sb.ToString();

// Frequency array for lowercase letters
int[] freq = new int[26];
foreach (char c in s) freq[c - 'a']++;

// Anagram check
bool IsAnagram(string s, string t)
{
    if (s.Length != t.Length) return false;
    int[] freq = new int[26];
    foreach (char c in s) freq[c - 'a']++;
    foreach (char c in t) if (--freq[c - 'a'] < 0) return false;
    return true;
}

// Run-length encoding
string RunLengthEncode(string s)
{
    var sb = new StringBuilder();
    int i = 0;
    while (i < s.Length)
    {
        char c = s[i]; int count = 0;
        while (i < s.Length && s[i] == c) { i++; count++; }
        sb.Append(c);
        if (count > 1) sb.Append(count);
    }
    return sb.Length < s.Length ? sb.ToString() : s;
}
```

---

## Pattern Recognition

| Problem says… | Reach for | Complexity |
| ------------- | --------- | ---------- |
| "Sum of subarray [l..r]" / multiple range queries | Prefix sum | O(n) build, O(1) query |
| "Add v to all elements in [l..r]" many times | Difference array | O(1) update, O(n) reconstruct |
| "Max/min subarray sum" | Kadane | O(n)/O(1) |
| "Max product subarray" | Kadane with min/max tracking | O(n)/O(1) |
| "Sort 0/1/2 in one pass" | Dutch national flag | O(n)/O(1) |
| "Rotate array by k" | Reversal trick | O(n)/O(1) |
| "All values in [1..n], find duplicate/missing" | In-place negation or cyclic sort | O(n)/O(1) |
| "Spiral / rotate matrix" | Boundary shrinking / transpose+reverse | O(m·n)/O(1) |
| "Next / previous permutation" | Rightmost ascent + reverse suffix | O(n)/O(1) |
| "Anagram / frequency check" | Frequency array `int[26]` | O(n)/O(1) |
| "Longest palindromic substring" | → [expand-around-centre](../TriesAndStringMatching/TriesAndStringMatching.md) | O(n²)/O(1) |
| "Subarray sum equals K" | → [prefix sum + hashmap](../Hashing/Hashing.md) | O(n)/O(n) |
| "Sliding window / two-pointer" | → [TwoPointers](../TwoPointers/TwoPointers.md) | varies |

---

## Variants and Differences

| Technique | Updates | Queries | When to use |
| --------- | ------- | ------- | ----------- |
| **Prefix sum** | None (static) | Range sum O(1) | Many queries, array unchanged |
| **Difference array** | Range add O(1) | Point value O(n) reconstruct | Many range updates, one final read |
| **Sliding window** | Window slides | Running aggregate | Fixed or variable window, no random access needed |
| **Two pointers** | Pointer advances | Condition on pair/triplet | Sorted array or monotone invariant |
| Kadane | — | Max subarray ending at i | Contiguous max/min sum/product |
| 2D prefix sum | None | Rectangle sum O(1) | Grid range queries |

---

## Pitfalls

- **Integer overflow in prefix sums:** use `long` when values can be large (`int` overflows at ~2×10⁹).
- **`int.MinValue` initialisation for max:** `int best = int.MinValue` works only if the answer may be negative; initialise from `A[0]` if safe (Kadane).
- **Off-by-one in prefix index:** the query is `P[r+1] - P[l]` — easy to write `P[r] - P[l-1]` by mistake.
- **Modifying array while iterating:** in-place negation tricks rely on a single forward pass; iterating a second time without restoring values corrupts results.
- **C# `string` immutability:** `s += c` in a loop allocates a new string each iteration → O(n²) total. Always use `StringBuilder` for building strings.
- **`bottom--` / `right--` outside `if` block:** spiral traversal must put the boundary update **inside** the `if` block's braces, not as a trailing statement on the same line.
- **Cyclic sort infinite loop:** the swap condition must be `nums[nums[i]-1] != nums[i]`; omitting this causes an infinite loop when a duplicate maps back to the same slot.
- **Difference array size:** use `n+1` elements so `diff[r+1]` is always in bounds when `r = n-1`.

---

## Practice

See [Problems.md](./Problems.md) for worked examples.

| LeetCode | Problem | Pattern |
| -------- | ------- | ------- |
| 53 | Maximum Subarray | Kadane |
| 152 | Max Product Subarray | Kadane (min/max) |
| 238 | Product of Array Except Self | Prefix/suffix product |
| 169 | Majority Element | Boyer-Moore voting |
| 268 | Missing Number | XOR / sum |
| 442 | Find All Duplicates | In-place negation |
| 287 | Find the Duplicate Number | Floyd cycle / binary search |
| 75 | Sort Colors | Dutch national flag |
| 31 | Next Permutation | Rightmost ascent |
| 54 | Spiral Matrix | Boundary shrinking |
| 73 | Set Matrix Zeroes | In-place markers |
| 48 | Rotate Image | Transpose + reverse |
| 647 | Palindromic Substrings | → TriesAndStringMatching |
| 5 | Longest Palindromic Substring | → TriesAndStringMatching |
| 271 | Encode and Decode Strings | Length-prefix encoding |
| 14 | Longest Common Prefix | Vertical/horizontal scan |
| 8 | String to Integer (atoi) | Digit-by-digit parse |
| 43 | Multiply Strings | Grade-school multiplication |
