# Dynamic Programming

> **Scope** — Recognising and solving optimisation/counting problems with optimal substructure and overlapping subproblems: the state-design recipe, all major DP categories (linear, grid, two-sequence, knapsack, interval, palindromic, bitmask, tree, state-machine, digit), and how to reason about space optimisation.

**Contents**
- [1. Core Concepts](#1-core-concepts)
- [2. Complexity Reference](#2-complexity-reference)
- [3. C# Toolbox](#3-c-toolbox)
- [4. Core Patterns](#4-core-patterns)
- [5. Classic Problems & Solutions](#5-classic-problems--solutions)
- [6. Pattern Recognition](#6-pattern-recognition)
- [7. Interview Focus](#7-interview-focus)
- [8. Common Traps & Edge Cases](#8-common-traps--edge-cases)
- [9. Related LeetCode Problems](#9-related-leetcode-problems)
- [10. Cheat Sheet](#10-cheat-sheet)
- [See Also](#see-also)

---

## 1. Core Concepts

DP turns exponential recursion into "solve each distinct state once". Use it only when both are true:

- **Optimal substructure** - the answer can be composed from optimal answers to smaller states.
- **Overlapping subproblems** - the same state is reached from multiple paths; otherwise it is plain divide-and-conquer.

For Fibonacci, `fib(3)` and `fib(2)` recur many times in the naive tree; memoization collapses `O(2^n)` work to `O(n)` distinct states.

### Memoization (top-down) vs Tabulation (bottom-up)

| Dimension | Memoization | Tabulation |
| --- | --- | --- |
| Derivation | Mirrors brute-force recursion | Requires dependency-safe order first |
| Runtime constants | Hash lookups + calls | Fast array indexing |
| Stack | Recursion-depth risk | No recursion |
| Space optimisation | Hard; memo stays live | Natural once dependencies are known |
| Reachability | Computes only reachable states | Fills the table, even unused cells |

> **Interview Tip** - derive top-down first if needed; convert to bottom-up/rolling space as the optimisation follow-up.

### The 5-Step DP Recipe

1. **Define the state in words**: include every variable/mode needed to make future decisions independent of history.
2. **Write the recurrence/transition** from smaller or earlier states.
3. **Identify base cases**: empty prefix, single interval, zero capacity, null node, etc.
4. **Choose iteration order** so every dependency is ready before it is read.
5. **Space-optimise** only after correctness is clear; keep parent pointers/full tables if reconstruction is required.

| # | Interview question | Coin Change example |
| --- | --- | --- |
| 1 | What does the state mean? | `dp[a]` = min coins for amount `a` |
| 2 | What choices exist? | Try each coin `c` |
| 3 | What recurrence combines them? | `dp[a] = min(dp[a], 1 + dp[a-c])` |
| 4 | What are the base cases? | `dp[0] = 0` |
| 5 | What fill order is valid? | Ascending `a`, because `a-c < a` |
| 6 | Which cell is returned? | `dp[amount]`, unless unreachable |

## 2. Complexity Reference

| Pattern | Time | Space (table) | Space (optimised) | Why |
| --- | --- | --- | --- | --- |
| Linear / 1-D DP | `O(n)` | `O(n)` | `O(1)` | Fixed lookback window (1–2 previous states) |
| Kadane / running max | `O(n)` | `O(1)` | `O(1)` | Already a single running value |
| LIS (DP) | `O(n^2)` | `O(n)` | — | Nested scan over all earlier indices |
| LIS (patience sort) | `O(n log n)` | `O(n)` | — | Binary search replaces the linear scan |
| Grid / 2-D DP | `O(m*n)` | `O(m*n)` | `O(n)` | Row `i` only needs row `i-1` |
| Two-sequence DP (LCS, edit distance) | `O(m*n)` | `O(m*n)` | `O(min(m,n))` | Same row-dependency argument |
| 0/1 Knapsack | `O(n*W)` | `O(n*W)` | `O(W)` | Only the previous item row is needed |
| Unbounded Knapsack (coins) | `O(n*W)` | `O(W)` | `O(W)` | Already 1-D by construction |
| Interval DP (MCM, balloons) | `O(n^3)` | `O(n^2)` | — | Every smaller interval length is needed later |
| Palindromic DP | `O(n^2)` | `O(n^2)` | `O(n)` | LPS subsequence only needs row `i+1` |
| Bitmask DP (TSP) | `O(n^2 * 2^n)` | `O(n * 2^n)` | — | State = (visited set, last city) |
| Tree DP | `O(n)` | `O(h)` recursion stack | — | One post-order pass, `h` = tree height |
| State-machine DP (stock) | `O(n)` or `O(n*k)` | `O(1)` or `O(k)` | `O(1)` / `O(k)` | Fixed number of named states per day |
| Digit DP | `O(digits * states)` | `O(digits * states)` | — | Memoised on `(position, tight, extra)` |

---

## 3. C# Toolbox

| Tool | Use for | Gotcha |
| --- | --- | --- |
| `int[,]` (rectangular array) | 2-D tabulation (`dp[i, j]`) | Slightly faster and more cache-friendly than jagged `int[][]`; defaults to `0` automatically |
| `int[][]` (jagged array) | 2-D DP when rows have different lengths (e.g. triangular interval tables) | Must initialise each inner array explicitly — no auto-zeroing of the outer array |
| `Dictionary<(int, int), T>` | Memoization keyed by composite state (`ValueTuple` as key) | `ValueTuple` has structural equality out of the box — no custom `IEqualityComparer` needed |
| `Array.Fill(arr, value)` | Seeding a 1-D array or jagged row with a sentinel (e.g. `amount + 1` for "unreachable") before filling | Does **not** fill rectangular `T[,]`; use nested loops for multidimensional arrays |
| `List<int>` + manual binary search | `O(n log n)` LIS "tails" array | `List<T>.BinarySearch` returns a negative bitwise-complement index on miss — write your own lower-bound loop for clarity |
| `Span<int>` / `stackalloc` | Avoiding heap allocation for a single rolling row in hot loops | Only safe for small, stack-sized rows; cannot escape the enclosing method |
| `checked` / `long` | Counting DP (number of ways) that can overflow `int` | LeetCode problems often ask for the answer `% (10^9 + 7)` — apply the modulo inside the loop, not only at the end |
| `BitOperations.PopCount(uint)` | Counting set bits in a bitmask DP state | Needs `System.Numerics` |
| Tuple deconstruction / swap `(a, b) = (b, a)` | Rolling two rows/variables (`prev`/`curr`) each iteration | Cheap for scalars; for arrays it swaps references, not contents — still correct and allocation-free |

> **Quick Note** — Snippets assume `using System;`, `using System.Collections.Generic;`, and `using System.Linq;` in an enclosing class. Nullable annotations (`?`) are used where a method deliberately accepts `null`.

> **Common Trap** — A `Dictionary` memo with a default `(int, int)` key silently returns `(0, 0) -> default(TValue)` if you check `ContainsKey` and `this[key]` separately without `TryGetValue`; prefer `TryGetValue` to avoid double lookups and race-y bugs.

---

## 4. Core Patterns

### 4.1 Linear / 1-D DP

**When to use** — the answer at position `i` depends only on a constant number of previous positions (no adjacency/skip constraint beyond 1–2 steps back).

**State** — `dp[i]` = best answer considering the first `i` elements (or "ending at index `i-1`").

**Recurrence** (House Robber; can't rob two adjacent houses):

```text
dp[i] = max(dp[i-1], dp[i-2] + nums[i-1])
```

**Base cases** — `dp[0] = 0` (no houses); for non-empty input, `dp[1] = nums[0]`. Answer = `dp[n]`.

**Iteration order** — strictly increasing `i`, since `dp[i]` needs `dp[i-1]` and `dp[i-2]`.

**Why correct** — for the first `i` houses, the optimum either skips house `i-1` and keeps `dp[i-1]`, or robs it and must combine it with `dp[i-2]`.

```csharp
public static int Rob(int[] nums)
{
    int n = nums.Length;
    if (n == 0) return 0;

    var dp = new int[n + 1];
    dp[0] = 0;
    dp[1] = nums[0];
    for (int i = 2; i <= n; i++)
        dp[i] = Math.Max(dp[i - 1], dp[i - 2] + nums[i - 1]);
    return dp[n];
}
```

**Complexity** — `O(n)` time, `O(n)` space.

**Space-optimised** — only the last two values ever matter:

```csharp
public static int RobOptimized(int[] nums)
{
    int prev2 = 0, prev1 = 0;
    foreach (var num in nums)
    {
        var curr = Math.Max(prev1, prev2 + num);
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

`O(n)` time, `O(1)` space.

**Related recurrences** — Fibonacci `dp[i] = dp[i-1] + dp[i-2]`; Climbing Stairs (same shape, `dp[0]=1, dp[1]=1`); Decode Ways `dp[i] = dp[i-1]·[s[i-1] valid] + dp[i-2]·[s[i-2..i-1] valid two-digit code]`.

**Representative problems** — Climbing Stairs, House Robber, Decode Ways, Fibonacci Number.

---

### 4.2 Kadane / Running-Max DP

**When to use** — "best contiguous subarray" problems; the state is "best answer ending exactly here", reset when carrying forward becomes harmful.

**State** — `dp[i]` = best sum/product of a contiguous subarray ending at index `i`.

**Recurrence** (max subarray sum):

```text
dp[i] = max(nums[i], dp[i-1] + nums[i])
```

**Base case** — `dp[0] = nums[0]`.

```csharp
public static int MaxSubArray(int[] nums)
{
    if (nums.Length == 0) return 0;

    int best = nums[0], curr = nums[0];
    for (int i = 1; i < nums.Length; i++)
    {
        curr = Math.Max(nums[i], curr + nums[i]);
        best = Math.Max(best, curr);
    }
    return best;
}
```

**Complexity** — `O(n)` time, `O(1)` space (already optimal — no table exists).

**Product variant** — a negative number can flip the best-max into the best-min and vice versa, so both running extremes must be tracked:

```csharp
public static int MaxProduct(int[] nums)
{
    if (nums.Length == 0) return 0;

    int best = nums[0], curMax = nums[0], curMin = nums[0];
    for (int i = 1; i < nums.Length; i++)
    {
        int n = nums[i];
        if (n < 0) (curMax, curMin) = (curMin, curMax);
        curMax = Math.Max(n, curMax * n);
        curMin = Math.Min(n, curMin * n);
        best = Math.Max(best, curMax);
    }
    return best;
}
```

**Representative problems** — Maximum Subarray, Maximum Product Subarray, Maximum Sum Circular Subarray.

---

### 4.3 Longest Increasing Subsequence (LIS)

**When to use** — longest/shortest chain under a strict ordering constraint between chosen elements (not necessarily contiguous).

**State** — `dp[i]` = length of the LIS ending at index `i`.

**Recurrence**:

```text
dp[i] = 1 + max(dp[j])   for all j < i with nums[j] < nums[i]
```

**Base case** — `dp[i] = 1` for every `i` (each element is a subsequence of length 1 by itself). Answer = `max(dp[i])`.

```csharp
public static int LengthOfLIS(int[] nums)
{
    if (nums.Length == 0) return 0;

    var dp = new int[nums.Length];
    Array.Fill(dp, 1);
    var best = 1;
    for (int i = 1; i < nums.Length; i++)
    {
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i])
                dp[i] = Math.Max(dp[i], dp[j] + 1);
        best = Math.Max(best, dp[i]);
    }
    return best;
}
```

**Complexity** — `O(n^2)` time, `O(n)` space.

**Optimisation: patience-sort / binary-search method.** Maintain `tails[k]` = smallest possible tail value of an increasing subsequence of length `k+1`. Each new number either extends the longest list or replaces the smallest tail it can legally replace — found via binary search.

For a **strictly** increasing LIS, use `lower_bound` (first tail `>= num`), as below. For a non-decreasing subsequence, use `upper_bound` (first tail `> num`) by changing the comparison to `tails[mid] <= num`.

```csharp
public static int LengthOfLISFast(int[] nums)
{
    var tails = new List<int>();
    foreach (var num in nums)
    {
        int lo = 0, hi = tails.Count;
        while (lo < hi)
        {
            int mid = lo + (hi - lo) / 2;
            if (tails[mid] < num) lo = mid + 1;
            else hi = mid;
        }
        if (lo == tails.Count) tails.Add(num);
        else tails[lo] = num;
    }
    return tails.Count; // NOTE: tails no longer holds a *valid* subsequence, only its length
}
```

**Complexity** — `O(n log n)` time, `O(n)` space. The binary search converts the inner `O(n)` scan for "best predecessor" into an `O(log n)` lookup because `tails` is kept sorted by construction.

> **Common Trap** — `tails` is **not** the actual LIS after replacements happen; it only tracks the correct *length*. Reconstructing the real subsequence needs parent pointers recorded alongside it.

**Representative problems** — Longest Increasing Subsequence, Number of LIS, Russian Doll Envelopes, Longest Chain of Pairs.

---

### 4.4 Grid / 2-D DP

**Use when** moving through a matrix/DAG with local predecessor cells.

**State** - `dp[i,j]` = best count/cost/value to reach cell `(i,j)`.

```text
dp[i,j] = grid[i,j] + min(dp[i-1,j], dp[i,j-1])
```

**Base/order** - seed first row/column; fill row-major left-to-right, top-to-bottom. Reverse direction when the recurrence depends on future cells (Dungeon Game). Keep parents/full table to print the path.

```csharp
public static int MinPathSum(int[,] grid)
{
    int m = grid.GetLength(0), n = grid.GetLength(1);
    if (m == 0 || n == 0) return 0;
    var row = new int[n];
    row[0] = grid[0, 0];
    for (int j = 1; j < n; j++) row[j] = row[j - 1] + grid[0, j];
    for (int i = 1; i < m; i++)
    {
        row[0] += grid[i, 0];
        for (int j = 1; j < n; j++)
            row[j] = grid[i, j] + Math.Min(row[j], row[j - 1]);
    }
    return row[n - 1];
}
```

| Variant | Delta |
| --- | --- |
| Unique Paths I | `dp[i,j] = up + left`; first row/column = `1` |
| Unique Paths II | obstacle cells force `dp[i,j] = 0` before propagation |
| Minimum Path Sum | add `grid[i,j]` to `min(up,left)` |
| Maximal Square | `1 + min(up,left,diag)` for cell `1`, else `0` |
| Triangle | bottom-up one row: `dp[c] = tri[r][c] + min(dp[c], dp[c+1])` |
| Dungeon Game | fill backward from destination with required health |

**Complexity** - `O(m*n)` time, `O(n)` rolling space or `O(m*n)` for reconstruction.

---
### 4.5 Two-Sequence DP

**When to use** — comparing two strings/arrays index by index, deciding match/skip at every pair of positions.

**State** — `dp[i, j]` = answer for `s1[0..i)` versus `s2[0..j)` (prefixes of length `i` and `j`).

**Recurrence** (Longest Common Subsequence):

```text
dp[i, j] = dp[i-1, j-1] + 1                      if s1[i-1] == s2[j-1]
         = max(dp[i-1, j], dp[i, j-1])            otherwise
```

**Base cases** — `dp[0, j] = dp[i, 0] = 0` (empty prefix has no common subsequence).

```csharp
public static int LongestCommonSubsequence(string a, string b)
{
    int m = a.Length, n = b.Length;
    var dp = new int[m + 1, n + 1];
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i, j] = a[i - 1] == b[j - 1]
                ? dp[i - 1, j - 1] + 1
                : Math.Max(dp[i - 1, j], dp[i, j - 1]);
    return dp[m, n];
}
```

**Complexity** — `O(m*n)` time, `O(m*n)` space.

**Space-optimised** — row `i` only needs row `i-1`, so roll two 1-D arrays:

```csharp
public static int LongestCommonSubsequenceOptimized(string a, string b)
{
    if (b.Length > a.Length) (a, b) = (b, a); // keep the row dimension minimal

    int m = a.Length, n = b.Length;
    var prev = new int[n + 1];
    var curr = new int[n + 1];
    for (int i = 1; i <= m; i++)
    {
        for (int j = 1; j <= n; j++)
            curr[j] = a[i - 1] == b[j - 1] ? prev[j - 1] + 1 : Math.Max(prev[j], curr[j - 1]);
        (prev, curr) = (curr, prev);
    }
    return prev[n];
}
```

`O(m*n)` time, `O(min(m,n))` space (the code swaps strings so the row is the shorter dimension).

**Edit Distance** — same grid shape, different recurrence and base cases (base = the cost of turning a prefix into empty, i.e. all deletions/insertions):

```csharp
public static int MinDistance(string word1, string word2)
{
    int m = word1.Length, n = word2.Length;
    var dp = new int[m + 1, n + 1];
    for (int i = 0; i <= m; i++) dp[i, 0] = i;
    for (int j = 0; j <= n; j++) dp[0, j] = j;
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i, j] = word1[i - 1] == word2[j - 1]
                ? dp[i - 1, j - 1]
                : 1 + Math.Min(dp[i - 1, j - 1], Math.Min(dp[i - 1, j], dp[i, j - 1]));
    return dp[m, n];
}
```

> **Remember** — Almost every two-string DP reads the same three neighbours: **diagonal** (consume both), **up** (consume the first), and **left** (consume the second). Only the combine rule changes.

| Problem | Rule at `dp[i, j]` |
| --- | --- |
| LCS | match → `diag + 1`, else `max(up, left)` |
| Edit distance | match → `diag`, else `1 + min(diag, up, left)` |
| Distinct subsequences | match → `diag + up`, else `up` |
| Longest common substring | match → `diag + 1`, else `0`; answer is the global maximum |
| Interleaving string | `(up && s1 matches) \|\| (left && s2 matches)` |
| Regex / wildcard matching | Branch on `*`, `?`, or `.` semantics |

**Regex / wildcard matching** — a third dimension of choice appears: `*` can match zero-or-more of the preceding element (regex) or any sequence (wildcard). Wildcard's recurrence:

```text
dp[i, j] = dp[i-1, j] || dp[i, j-1]                         if p[j-1] == '*'   (use it, or skip it)
         = dp[i-1, j-1] && (p[j-1] == '?' || s[i-1] == p[j-1])   otherwise
```

```csharp
public static bool IsMatchWildcard(string s, string p)
{
    int m = s.Length, n = p.Length;
    var dp = new bool[m + 1, n + 1];
    dp[0, 0] = true;
    for (int j = 1; j <= n; j++)
        dp[0, j] = p[j - 1] == '*' && dp[0, j - 1];

    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i, j] = p[j - 1] == '*'
                ? dp[i - 1, j] || dp[i, j - 1]
                : (p[j - 1] == '?' || s[i - 1] == p[j - 1]) && dp[i - 1, j - 1];

    return dp[m, n];
}
```

Regex matching (`.` and `*`, where `*` refers to the *preceding* character) is usually clearest top-down: `Match(i, j)` means `s[i..]` matches `p[j..]`.

```text
Match(i, j) = (i == s.Length)                                           if j == p.Length
            = Match(i, j+2) || (firstMatch && Match(i+1, j))            if j+1 < p.Length && p[j+1] == '*'
            = firstMatch && Match(i+1, j+1)                             otherwise
```

Here `firstMatch = i < s.Length && (p[j] == s[i] || p[j] == '.')`.

```csharp
public static bool IsMatchRegex(string s, string p)
{
    var memo = new Dictionary<(int, int), bool>();
    bool Dfs(int i, int j)
    {
        if (j == p.Length) return i == s.Length;
        if (memo.TryGetValue((i, j), out bool cached)) return cached;
        bool first = i < s.Length && (p[j] == s[i] || p[j] == '.');
        bool ans = j + 1 < p.Length && p[j + 1] == '*'
            ? Dfs(i, j + 2) || (first && Dfs(i + 1, j))
            : first && Dfs(i + 1, j + 1);
        return memo[(i, j)] = ans;
    }
    return Dfs(0, 0);
}
```

**Representative problems** — Longest Common Subsequence, Edit Distance, Regular Expression Matching, Wildcard Matching, Distinct Subsequences.

---

### 4.6 Knapsack Family

**When to use** — choosing a subset (or multiset) of items under a capacity/sum constraint to optimise value, count ways, or test feasibility.

#### 0/1 Knapsack (each item used at most once)

**State** — `dp[i, w]` = best value using the first `i` items with capacity `w`.

**Recurrence**:

```text
dp[i, w] = dp[i-1, w]                                          if weight[i-1] > w
         = max(dp[i-1, w], value[i-1] + dp[i-1, w - weight[i-1]])   otherwise
```

**Base cases** — `dp[0, w] = 0` (no items), `dp[i, 0] = 0` (no capacity). Fill items `i` increasing; answer = `dp[n, capacity]`.

```csharp
public static int Knapsack01(int[] weights, int[] values, int capacity)
{
    int n = weights.Length;
    var dp = new int[n + 1, capacity + 1];
    for (int i = 1; i <= n; i++)
        for (int w = 0; w <= capacity; w++)
            dp[i, w] = weights[i - 1] > w
                ? dp[i - 1, w]
                : Math.Max(dp[i - 1, w], values[i - 1] + dp[i - 1, w - weights[i - 1]]);
    return dp[n, capacity];
}
```

**Complexity** — `O(n*W)` time, `O(n*W)` space.

**Space-optimised (1-D, capacity DESCENDING):**

```csharp
public static int Knapsack01Optimized(int[] weights, int[] values, int capacity)
{
    var dp = new int[capacity + 1];
    for (int i = 0; i < weights.Length; i++)
        for (int w = capacity; w >= weights[i]; w--)
            dp[w] = Math.Max(dp[w], values[i] + dp[w - weights[i]]);
    return dp[capacity];
}
```

> **Important** — the capacity loop **must** run descending for 0/1 knapsack. `dp[w - weight]` must still hold the *previous item's* row value; scanning `w` ascending would let `dp[w - weight]` already include the current item, effectively reusing it (turning 0/1 into unbounded).

> **Interview Tip** — To reconstruct chosen items, keep the full `dp[i, w]` table (or parent pointers) and walk backward: if `dp[i, w] != dp[i-1, w]`, item `i-1` was taken and `w -= weight[i-1]`. The 1-D version intentionally loses that history.

| Variant | Capacity / amount loop | Outer loop | Meaning |
| --- | --- | --- | --- |
| 0/1 knapsack | **Descending** | Item | Each item is used at most once |
| Unbounded optimisation | **Ascending** | Item or amount | Reusing the same item is allowed |
| Combination count | Ascending | **Item/coin** | Order does not matter; count multisets once |
| Permutation count | Target ascending | **Amount/target** | Order matters; count sequences |

**Subset Sum / Partition Equal Subset Sum** — same shape with a boolean OR instead of max:

```csharp
public static bool CanPartition(int[] nums)
{
    int sum = nums.Sum();
    if (sum % 2 != 0) return false;
    int target = sum / 2;
    var dp = new bool[target + 1];
    dp[0] = true;
    foreach (var num in nums)
        for (int w = target; w >= num; w--)
            dp[w] = dp[w] || dp[w - num];
    return dp[target];
}
```

**Target Sum** (assign `+`/`-` to each number to hit a target) reduces to a subset-count problem: if `P` is the sum of positively-signed numbers and `N` the rest, `P - N = target` and `P + N = sum`, so `P = (sum + target) / 2`. Then count subsets summing to `P`:

```csharp
public static long FindTargetSumWays(int[] nums, int target)
{
    long sum = nums.Sum(x => (long)x);
    if (Math.Abs((long)target) > sum || (sum + target) % 2 != 0) return 0;

    int s = (int)((sum + target) / 2);
    var dp = new long[s + 1];
    dp[0] = 1;
    foreach (var num in nums)
        for (int w = s; w >= num; w--)
            dp[w] += dp[w - num];
    return dp[s];
}
```

#### Unbounded Knapsack (unlimited reuse per item)

**Coin Change — minimum coins** — `dp[a]` = minimum coins needed to form amount `a`; base `dp[0] = 0`; unreachable states start at `amount + 1`; answer is `dp[amount]` unless it stays unreachable. For this optimisation variant, coin/amount loop nesting does not change the minimum, but the amount direction must be ascending so a coin can be reused.

```csharp
public static int CoinChangeMinCoins(int[] coins, int amount)
{
    var dp = new int[amount + 1];
    Array.Fill(dp, amount + 1); // sentinel: "unreachable"
    dp[0] = 0;
    for (int a = 1; a <= amount; a++)
        foreach (var c in coins)
            if (c <= a)
                dp[a] = Math.Min(dp[a], 1 + dp[a - c]);
    return dp[amount] > amount ? -1 : dp[amount];
}
```

`O(n*amount)` time, `O(amount)` space.

**Coin Change 2 — count combinations** (order of coins does NOT matter — `{1,2}` and `{2,1}` are the same combination): iterate the **coin loop outer**, **amount loop inner ascending**.

```csharp
public static long CoinChangeCountWays(int[] coins, int amount)
{
    var dp = new long[amount + 1];
    dp[0] = 1;
    foreach (var c in coins)
        for (int a = c; a <= amount; a++)
            dp[a] += dp[a - c];
    return dp[amount];
}
```

**Combination Sum IV — count permutations** (order DOES matter — `[1,2]` and `[2,1]` are different sequences): swap the loop nesting — **amount loop outer**, **coin loop inner**.

```csharp
public static long CombinationSum4Permutations(int[] nums, int target)
{
    var dp = new long[target + 1];
    dp[0] = 1;
    for (int a = 1; a <= target; a++)
        foreach (var num in nums)
            if (num <= a)
                dp[a] += dp[a - num];
    return dp[target];
}
```

> **Interview Tip** — this loop-order distinction is a classic senior follow-up. Fixing the coin in the *outer* loop commits to "how many of coin `c` do we use before considering the next coin type", which counts each multiset of coins exactly once — a **combination**. Making `amount` the outer loop recomputes `dp[a]` from scratch over *all* coins at every amount, so the same multiset reached via different insertion orders is counted separately — a **permutation**.

> **Common Trap** — counting variants can exceed `int` quickly; use `long`, or apply the requested modulo inside the transition.

**Complexity (unbounded)** — `O(n*amount)` time, `O(amount)` space — already minimal; no further "space optimisation" step exists since it was never 2-D.

**Representative problems** — 0/1 Knapsack, Partition Equal Subset Sum, Target Sum, Coin Change, Coin Change II, Combination Sum IV.

---

### 4.7 Interval / Range DP

**Use when** a range `[i,j]` is solved by trying every split/last choice `k` inside it.

**State** - `dp[i,j]` = best answer for interval `i..j`.

**Canonical recurrence** (Matrix Chain Multiplication; matrix `i` has shape `dims[i-1] x dims[i]`):

```text
dp[i,j] = min over k in [i,j) of dp[i,k] + dp[k+1,j] + dims[i-1]*dims[k]*dims[j]
```

**Base/order** - `dp[i,i]=0`; iterate increasing interval length, then start `i`, then split `k`. All shorter intervals remain live, so space optimisation is usually not useful.

```csharp
public static long MatrixChainOrder(int[] dims)
{
    int n = dims.Length - 1;
    if (n <= 1) return 0;
    const long Inf = long.MaxValue / 4;
    var dp = new long[n + 1, n + 1];
    for (int len = 2; len <= n; len++)
        for (int i = 1; i + len - 1 <= n; i++)
        {
            int j = i + len - 1;
            dp[i, j] = Inf;
            for (int k = i; k < j; k++)
                dp[i, j] = Math.Min(dp[i, j], dp[i, k] + dp[k + 1, j] + (long)dims[i - 1] * dims[k] * dims[j]);
        }
    return dp[1, n];
}
```

**Complexity** - `O(n^3)` time, `O(n^2)` space; MCM is canonical because the split creates independent left/right subchains plus a boundary cost.

| Archetype | Choice / recurrence cue |
| --- | --- |
| Burst Balloons | choose the **last** balloon `k`: `dp[l,r]=max(dp[l,k-1]+dp[k+1,r]+a[l-1]*a[k]*a[r+1])` |
| Minimum Cost to Cut a Stick | choose a cut inside segment; add segment length |
| Stone Game / Predict the Winner | choose an endpoint; store score difference |
| Palindrome Partitioning II | precompute `isPal[i,j]`, then 1-D min cuts |

> **Trap** - for Burst Balloons, choosing the first burst leaves future-dependent neighbours; choosing the last fixes both boundaries.

---
### 4.8 Palindromic DP

**When to use** — questions about substrings/subsequences that read the same forwards and backwards.

**State** — `dp[i, j]` = is `s[i..j]` a palindrome? (substring variant) or the length of the longest palindromic subsequence within `s[i..j]` (subsequence variant).

**Recurrence (longest palindromic subsequence)**:

```text
dp[i, j] = dp[i+1, j-1] + 2         if s[i] == s[j]
         = max(dp[i+1, j], dp[i, j-1])   otherwise
```

**Base cases** — empty interval length is `0` by default; `dp[i, i] = 1` for a single character. Fill `i` descending and `j` ascending so `dp[i+1, *]` and `dp[i, j-1]` are ready. Answer = `dp[0, n-1]` (or `0` for an empty string).

```csharp
public static int LongestPalindromeSubseq(string s)
{
    int n = s.Length;
    if (n == 0) return 0;

    var dp = new int[n, n];
    for (int i = n - 1; i >= 0; i--)
    {
        dp[i, i] = 1;
        for (int j = i + 1; j < n; j++)
            dp[i, j] = s[i] == s[j]
                ? dp[i + 1, j - 1] + 2
                : Math.Max(dp[i + 1, j], dp[i, j - 1]);
    }
    return dp[0, n - 1];
}
```

**Complexity** — `O(n^2)` time, `O(n^2)` space. **Space-optimised** to `O(n)`: row `i` only reads row `i+1`, the current row's `j-1`, and the saved diagonal `dp[i+1, j-1]`, so two rows (or one row plus `prevDiag`) suffice.

**Longest Palindromic Substring** uses the boolean substring variant instead, tracking the longest `true` span:

```csharp
public static string LongestPalindrome(string s)
{
    int n = s.Length;
    if (n == 0) return string.Empty;

    var dp = new bool[n, n];
    int start = 0, maxLen = 1;
    for (int i = 0; i < n; i++) dp[i, i] = true;

    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++)
        {
            int j = i + len - 1;
            if (s[i] == s[j] && (len == 2 || dp[i + 1, j - 1]))
            {
                dp[i, j] = true;
                if (len > maxLen) { start = i; maxLen = len; }
            }
        }
    return s.Substring(start, maxLen);
}
```

`O(n^2)` time, `O(n^2)` space. The **expand-around-center** technique solves the same problem in `O(n^2)` time but `O(1)` space (it isn't a rolling-array optimisation of this DP — it's a different algorithm entirely, worth knowing as the practical alternative).

**Representative problems** — Longest Palindromic Substring, Longest Palindromic Subsequence, Palindromic Substrings (count), Minimum Insertions to Make a Palindrome (`= n - LPS`).

---

### 4.9 Bitmask DP

**Use when** `n` is small (`n <= 20`) and the state must remember exactly which elements are used.

**TSP state** - `dp[mask,last]` = min cost to visit exactly `mask` and end at `last`.

```text
dp[mask,last] = min over prev in mask, prev != last of dp[mask without last,prev] + dist[prev,last]
```

**Base/order** - `dp[1<<start,start]=0`; iterate masks increasing, then last, then next. Answer returns to start from the full mask.

```csharp
public static long Tsp(int[,] dist)
{
    int n = dist.GetLength(0), full = 1 << n;
    if (n <= 1) return 0;
    const long Inf = long.MaxValue / 4;
    var dp = new long[full, n];
    for (int m = 0; m < full; m++) for (int i = 0; i < n; i++) dp[m, i] = Inf;
    dp[1, 0] = 0;
    for (int mask = 1; mask < full; mask++)
        for (int last = 0; last < n; last++)
        {
            if ((mask & (1 << last)) == 0 || dp[mask, last] >= Inf / 2) continue;
            for (int next = 0; next < n; next++)
                if ((mask & (1 << next)) == 0)
                    dp[mask | (1 << next), next] = Math.Min(dp[mask | (1 << next), next], dp[mask, last] + dist[last, next]);
        }
    long best = Inf;
    for (int last = 1; last < n; last++) best = Math.Min(best, dp[full - 1, last] + dist[last, 0]);
    return best;
}
```

**Complexity** - `O(n^2 * 2^n)` time, `O(n * 2^n)` space; beyond `n ~= 20`, use pruning, meet-in-the-middle, or a different model.

---
### 4.10 DP on Trees

**Use when** each node returns values its parent combines after processing children.

**House Robber III state** - return `(take, skip)` for each node.

```text
take(node) = node.Val + skip(left) + skip(right)
skip(node) = max(take(left),skip(left)) + max(take(right),skip(right))
```

**Base/order** - null returns `(0,0)`; post-order traversal; answer `max(take(root), skip(root))`.

```csharp
public class TreeNode
{
    public int Val;
    public TreeNode? Left;
    public TreeNode? Right;
}

public static int RobTree(TreeNode? root)
{
    var ans = Dfs(root);
    return Math.Max(ans.Take, ans.Skip);
}

private static (int Take, int Skip) Dfs(TreeNode? node)
{
    if (node is null) return (0, 0);
    var l = Dfs(node.Left);
    var r = Dfs(node.Right);
    return (node.Val + l.Skip + r.Skip, Math.Max(l.Take, l.Skip) + Math.Max(r.Take, r.Skip));
}
```

**Complexity** - `O(n)` time, `O(h)` stack. Same tuple-return pattern covers diameter, max path sum, cameras, and rerooting (with an extra pass).

---
### 4.11 State-Machine DP

**Use when** each index has a small set of modes (holding stock, cash, cooldown, used transaction, etc.). Update every mode from previous-step values.

**Cooldown recurrence**:

```text
hold[i] = max(hold[i-1], rest[i-1] - price[i])
sold[i] = hold[i-1] + price[i]
rest[i] = max(rest[i-1], sold[i-1])
```

**Base/order** - `hold=-price[0]`, `sold=0`, `rest=0`; scan prices left-to-right; cache overwritten states.

```csharp
public static int MaxProfitWithCooldown(int[] prices)
{
    if (prices.Length == 0) return 0;
    int hold = -prices[0], sold = 0, rest = 0;
    for (int i = 1; i < prices.Length; i++)
    {
        int oldHold = hold, oldSold = sold, oldRest = rest;
        hold = Math.Max(oldHold, oldRest - prices[i]);
        sold = oldHold + prices[i];
        rest = Math.Max(oldRest, oldSold);
    }
    return Math.Max(sold, rest);
}
```

**At most `k` transactions** - add transaction dimension; if `k >= n/2`, greedy positive-delta sum is enough.

```csharp
public static int MaxProfitK(int k, int[] prices)
{
    if (k <= 0 || prices.Length == 0) return 0;
    if (k >= prices.Length / 2) return prices.Zip(prices.Skip(1), (a, b) => Math.Max(0, b - a)).Sum();
    var hold = new int[k + 1];
    var cash = new int[k + 1];
    Array.Fill(hold, int.MinValue / 2);
    foreach (int p in prices)
        for (int t = 1; t <= k; t++)
        {
            hold[t] = Math.Max(hold[t], cash[t - 1] - p);
            cash[t] = Math.Max(cash[t], hold[t] + p);
        }
    return cash[k];
}
```

| Variant | Delta |
| --- | --- |
| Stock I | one transaction: track `minPrice`, `best` |
| Stock II | unlimited: greedy positive deltas or `cash/hold` |
| Stock III | `k=2` transaction states |
| Stock IV | `cash[t]/hold[t]` for `t=1..k` |
| Cooldown | add `sold/rest/hold`; buy only from rest |
| Fee | two states; `cash=max(cash, hold + price - fee)` |

**Complexity** - `O(n)`/`O(1)` for fixed states; `O(n*k)` time and `O(k)` space for Stock IV.

---
### 4.12 Digit DP

**Use when** counting/summing numbers in `[L,R]` with digit-level constraints and huge bounds (`10^18`, etc.).

**State** - `(pos, tight, started, extra)` where `extra` may be digit sum, remainder, used-digit mask, or digit count.

**Transition/base** - choose digit `d` from `0..limit`, update `tight && d == limit`, `started || d != 0`, and `extra`; at `pos == digits.Length`, validate the property. Memoise only non-tight states and include every extra dimension that changes future choices.

**Complexity** - `O(digits * product(extra ranges) * 10)` time, same memo space. Common asks: unique digits, repeated digits, digit-sum/range queries, divisibility by remainder.

---
### 4.13 Space Optimisation Ladder

Start with the clearest full table, prove the recurrence, then shrink only the dimensions that are no longer needed.

| Stage | Use when | Typical implementation |
| --- | --- | --- |
| Full 2-D table | Deriving the recurrence or reconstructing a path/choice list | `dp[i, j]` plus optional parent pointers |
| Two rows | Current row depends on the previous row | `prev` and `curr`, then swap references |
| One row | Current row can safely overwrite previous-row values in a known direction | Single array plus left-to-right or right-to-left scan |
| Rolling variables | Fixed lookback window like `i-1` and `i-2` | `prev1`, `prev2`, `current` |

| Dependency pattern | Safe reduction | Required iteration detail |
| --- | --- | --- |
| `dp[i]` reads only `dp[i-1]` | One variable | Carry the previous value before overwriting |
| `dp[i]` reads `dp[i-1]` and `dp[i-2]` | Two variables | Rotate after computing `current` |
| Grid reads `up` and `left` | One row | Left-to-right: `dp[c]` is up, `dp[c-1]` is left |
| LCS-style reads `diag`, `up`, `left` | Two rows, or one row plus saved `prevDiag` | Preserve diagonal before overwriting `dp[j]` |
| 0/1 knapsack reads previous item row | One row | Scan capacity **descending** |
| Unbounded knapsack reads current item row | One row | Scan capacity **ascending** |
| Interval DP reads many shorter ranges | Usually cannot shrink | All shorter intervals remain live |

> **Optimization** — Space optimisation is usually the first follow-up. Say the dependency you are discarding: *"the recurrence only reads the previous row, so I can keep one row"*.

> **Common Trap** — Reverse iteration is required when a 1-D cell must read the **previous row's** value, not the value just written in the current row. That's why 0/1 knapsack scans right-to-left, while unbounded knapsack scans left-to-right.

---

## 5. Classic Problems & Solutions

### 5.1 Fibonacci Number - recipe walkthrough

**Problem** - `f(0)=0`, `f(1)=1`, `f(n)=f(n-1)+f(n-2)`.

| Recipe step | Answer |
| --- | --- |
| State | `f(i)` = `i`-th Fibonacci number |
| Recurrence | `f(i)=f(i-1)+f(i-2)` |
| Base | `f(0)=0`, `f(1)=1` |
| Order | increasing `i` |
| Space | two variables; full table only if asked to show all values |

**Complexity** - brute recursion `O(2^n)`; memo/tabulation `O(n)` time; rolling space `O(1)`. `int` overflows after `n=46`.

---

### 5.2 Decode Ways

**Problem** - count decodings where `1..26` map to letters.

**Family** - §4.1 linear DP over suffix/prefix indexes. `dp[i]` = ways to decode `s[i..]`.

```text
dp[i] = 0 if s[i] == '0'
      = dp[i+1] + dp[i+2] if s[i..i+1] is 10..26
      = dp[i+1] otherwise
```

**Base/order** - `dp[n]=1`; scan `i` descending; only `dp[i+1]` and `dp[i+2]` are needed. Complexity `O(n)` time, `O(1)` rolling space. Watch zeros: `06` invalid, `10`/`20` valid only as pairs.

---

### 5.3 Word Break

**Problem** - decide whether `s` can be segmented into dictionary words.

**Family** - suffix DP / memoized recursion. `dp[i]` = `s[i..]` is segmentable.

```text
dp[i] = any word w where s starts with w at i and dp[i + len(w)]
```

**Base/order** - `dp[n]=true`; fill `i` descending or memoize `Dfs(i)`. Complexity with allocation-free span/trie checks is `O(n*d*L)` time and `O(n)` space (`d` words, max length `L`); naive `Substring` split loops can degrade to `O(n^3)` in .NET. Rolling to `O(1)` is not valid because all suffix states may be queried.

## 6. Pattern Recognition

**DP cues**

| Cue | Likely family |
| --- | --- |
| count ways / form amount / target sum | counting DP, knapsack, decode ways |
| min/max cost to reach, complete, partition | grid, linear, interval |
| can reach/partition/form `X` | boolean subset/knapsack |
| longest subsequence/chain | LIS or two-sequence DP |
| two strings/arrays compared | LCS/edit/regex-style `(i,j)` DP |
| contiguous best segment | Kadane |
| no adjacent, cooldown, fee, at most `k` | linear or state-machine DP |
| matrix/grid moves | grid DP |
| split an interval/range | interval DP |
| small `n` and visited subset | bitmask DP |
| parent/child take-skip | tree DP |

**Constraint cues**

| Constraint | Likely complexity | Pattern |
| --- | --- | --- |
| `n <= 20` | `O(2^n)` / `O(n*2^n)` | bitmask DP |
| `n <= 500` | `O(n^3)` | interval DP |
| `n <= 5,000` | `O(n^2)` | LIS DP, LCS, edit distance |
| `n <= 10^6` | `O(n)` / `O(n log n)` | linear, Kadane, LIS binary search |
| `sum/target <= 10^4..10^5` | `O(n*target)` | knapsack |

### DP vs Greedy vs Backtracking

| Aspect | DP | Greedy | Backtracking |
| --- | --- | --- | --- |
| Explores | all relevant states once | one provably safe local choice | all possibilities with pruning |
| Needs | optimal substructure + overlap | greedy-choice/exchange proof | only validity/pruning rules |
| Typical cost | `O(n)` to `O(n^3)` | `O(n)`/`O(n log n)` | exponential |
| Example | arbitrary Coin Change | interval scheduling, canonical coins | N-Queens, Sudoku |

> If a greedy exchange proof exists, prefer it. If states do not overlap, use divide-and-conquer/backtracking instead of forcing DP.

## 7. Interview Focus

**What DP interviews probe** - precise state design, recurrence proof, base cases, dependency order, complexity trade-offs, and iterative optimisation from brute force to memo/table/rolling space.

**Narrate these trade-offs**

- Top-down: fastest to derive, computes sparse reachable states, but has recursion/stack and hash overhead.
- Bottom-up: faster and stack-safe, but requires correct fill order.
- Full table: easiest correctness/reconstruction; rolling array: lower memory but loses choices unless you keep parents or recompute.

**Common follow-ups**

- Print the path/sequence/items -> keep full table or parent pointers.
- Reduce space -> name the dependency that lets you discard rows.
- Bounded item count -> add a count dimension or split items with binary decomposition.
- Count optimal solutions -> carry value DP plus count DP, handling ties carefully.

**When DP is wrong**

- A greedy exchange proof exists (interval scheduling, Huffman, fractional knapsack).
- Subproblems are disjoint (merge sort, quickselect).
- State space is too large (`n > 40` bitmask, huge target) -> use meet-in-the-middle, pruning, bitsets, approximation, or a different model.

**Scale-up signals** - sparse states favor memo dictionaries; boolean subset can use bitset shifts; huge 2-D tables need rolling rows/cache-aware traversal; anti-diagonal parallelism is valid only when dependencies allow it.

## 8. Common Traps & Edge Cases

| Trap | Why it happens | Fix |
| --- | --- | --- |
| Vague state definition | `dp[i]` is described as "the answer around `i`", so the recurrence smuggles in missing history | State it in one sentence, including prefix/suffix/range boundaries and any mode flags |
| Wrong iteration order | Computing `dp[i]` before a dependency `dp[i+1]` or `dp[j]` (`j > i`) is ready | Re-derive iteration order from the recurrence's dependency direction (§ recipe step 4) before coding |
| Incorrect/missing base cases | Off-by-one on empty prefixes, single-element intervals, or `dp[0]` | Explicitly enumerate every "smallest" state and hand-verify its value before writing the loop |
| Off-by-one between "first `i` items" and "index `i`" | Mixing prefix-length states (`i` items) with zero-based array indexes (`i`) | Pick one convention and write array access as `items[i-1]` for first-`i` states |
| Integer overflow in counting DP | Counting problems (`Number of Ways`, `Combination Sum IV`) can exceed `int.MaxValue` quickly | Use `long`, or apply `% (10^9 + 7)` inside the loop, not only at the return statement |
| Sentinel overflow | `int.MaxValue + 1` wraps negative in min-cost DP | Use `amount + 1`, `int.MaxValue / 2`, or guard before adding |
| Forgetting to reset per-test-case state | Reusing a `static`/shared memo dictionary or array across multiple independent calls | Scope the memo/table to the call, or explicitly clear it at the start |
| Memoizing on an incomplete state key | Two calls with the same cached key but different actual behaviour (missing a dimension like `tight` in digit DP, or a "used" flag) | The state must be the *minimal but complete* set of variables that determines all future outcomes — test by asking "can two different call histories reach this key with different correct answers?" |
| Memo key collisions | Serialising composite keys without separators can make `(1, 23)` and `(12, 3)` collide | Use `Dictionary<(int, int), T>` / `Dictionary<(int, int, int), T>` instead of ad-hoc strings |
| 0/1 knapsack capacity loop ascending instead of descending | Copy-pasting the unbounded-knapsack loop shape | Capacity must iterate **descending** for 0/1 so `dp[w-weight]` still reflects the previous item |
| Combinations vs permutations loop nesting | Swapping coin/amount loops changes whether order is counted | Coin/item outer counts combinations; amount/target outer counts permutations |
| Returning the wrong cell | Some states mean "ending exactly here" or "best over a range", so `dp[n]` is not necessarily the answer | Revisit the state definition and take `max(dp)`, `dp[0,n-1]`, or another aggregate when required |
| Using DP where greedy is provably optimal (or vice versa) | Defaulting to the "safe", more general tool without checking for an exchange argument | Attempt a greedy proof first on small counterexamples; only fall back to DP once greedy fails |
| Ignoring negative numbers in Kadane/product variants | Assuming "extend if positive" is always correct | Track both running max and running min — a negative can flip them |

---

## 9. Related LeetCode Problems

> The full tiered problem set lives in [Practice Roadmap](../DSAPatterns/Practice-Roadmap.md). The list below is the minimum set for this topic.

| # | Problem | Difficulty | Pattern |
| --- | --- | --- | --- |
| 70 | Climbing Stairs | Easy | Linear / 1-D DP |
| 198 / 213 | House Robber I/II | Medium | Linear DP; circular split |
| 53 / 152 | Maximum Subarray / Product | Medium | Kadane |
| 300 | Longest Increasing Subsequence | Medium | LIS `O(n^2)` + `O(n log n)` |
| 62 / 63 | Unique Paths I/II | Medium | Grid DP |
| 1143 | Longest Common Subsequence | Medium | Two-sequence DP |
| 72 | Edit Distance | Hard | Two-sequence DP |
| 10 / 44 | Regex / Wildcard Matching | Hard | Pattern matching DP |
| 416 | Partition Equal Subset Sum | Medium | 0/1 Knapsack |
| 322 / 518 | Coin Change I/II | Medium | Unbounded knapsack; min vs combinations |
| 494 | Target Sum | Medium | 0/1 subset-count transform |
| 312 | Burst Balloons | Hard | Interval DP |
| 132 | Palindrome Partitioning II | Hard | Palindromic + interval/cuts DP |
| 5 / 516 | Longest Palindromic Substring/Subsequence | Medium | Palindromic DP |
| 698 | Partition to K Equal Sum Subsets | Medium | Bitmask / subset DP |
| 337 | House Robber III | Medium | Tree DP |
| 121 / 122 / 123 / 188 / 309 / 714 | Stock family | Easy-Hard | State-machine DP |
| 691 | Stickers to Spell Word | Hard | Bitmask / memo DP |

## 10. Cheat Sheet

- **Recipe** - state in words -> recurrence -> base cases -> dependency-safe order -> space optimise.
- **Workflow** - brute-force recursion -> memoize changing parameters -> tabulate -> roll space if reconstruction is not needed.
- **0/1 knapsack** - capacity **descending**; **unbounded** - capacity **ascending**.
- **Coin counts** - coin outer counts combinations; amount outer counts permutations.
- **Reconstruction** - rolling arrays lose paths/items; keep parents/full tables or recompute choices.
- **Sentinels** - use `amount + 1`, `long.MaxValue / 4`, or guards; never add to raw max value.
- **Counting** - use `long` or modulo inside each transition.

**Core recurrences**

| Pattern | Recall trigger |
| --- | --- |
| Linear / House Robber | `dp[i]=max(dp[i-1], dp[i-2]+x)` |
| Kadane | `curr=max(x,curr+x)`; product also tracks min |
| LIS `O(n^2)` | `dp[i]=1+max(dp[j])` for valid predecessors |
| LIS `O(n log n)` | lower_bound replace for strict; upper_bound for non-decreasing |
| Grid | `cell + min(up,left)` or `up+left` for counts |
| Maximal Square | `1 + min(up,left,diag)` on `1` |
| LCS | match -> `diag+1`, else `max(up,left)` |
| Edit distance | match -> `diag`, else `1+min(replace,delete,insert)` |
| Distinct subsequences | match -> `diag+up`, else `up` |
| Wildcard | `*` -> `up \|\| left`; `?`/match -> `diag` |
| 0/1 knapsack | `max(skip, val + previousRow[w-wt])` |
| Coin change min | `dp[a]=min(dp[a], 1+dp[a-c])` |
| Coin change count | `dp[a]+=dp[a-c]`; loop order defines semantics |
| Interval / MCM | increasing length; try every split `k` |
| Pal subsequence | match -> inner `+2`, else `max(drop left, drop right)` |
| Pal substring | endpoints match and inner is palindrome |
| Bitmask TSP | state `(mask,last)`; extend to unvisited `next` |
| Tree DP | post-order returns tuple states parent needs |
| Stock DP | one variable per mode; update from previous values |
| Digit DP | `(pos,tight,started,extra)`; memo non-tight states |

**Constraint hints** - `n <= 20` bitmask; `n <= 500` interval `O(n^3)`; `n <= 5k` quadratic DP; `n <= 1e6` linear/`n log n`; `target <= 1e5` knapsack.

**Edge cases** - empty input, single item, all-negative Kadane, zeros in Decode Ways, obstacle start/end, impossible amount, overflow, answer cell vs global max.

**60-second checklist** - define state; list choices; write recurrence/base; prove fill order; choose 0/1 vs unbounded direction; choose combination vs permutation nesting; state time/space and reconstruction plan.

**Related notes:** [DSA Patterns](../DSAPatterns/DSAPatterns.md) - [Backtracking](../Backtracking/Backtracking.md) - [Greedy](../Greedy/Greedy.md) - [Bit Manipulation](../Bit%20Manipulation/Bit%20Manipulation.md) - [Trees](../Trees/Trees.md)

## See Also

- [Backtracking](../Backtracking/Backtracking.md) — Write the brute-force recursion first, then memoise it.
- [Greedy](../Greedy/Greedy.md) — The decision procedure for when a local choice is provably enough.
- [Graphs](../Graphs/Graphs.md) — DAG shortest paths and topological-order DP.
- [Bit Manipulation](../Bit%20Manipulation/Bit%20Manipulation.md) — Bitmask DP encodes subset state in an integer.
- [Trees](../Trees/Trees.md) — Tree DP is DP over the recursion tree.
- [DSA Patterns](../DSAPatterns/DSAPatterns.md) — master index: pattern selection flowchart and complexity-from-constraints.
- [Practice Roadmap](../DSAPatterns/Practice-Roadmap.md) — the tiered problem set to drill this topic.
