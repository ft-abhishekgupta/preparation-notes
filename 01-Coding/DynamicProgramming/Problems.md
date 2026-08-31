# Dynamic Programming — Problems

| # | Problem | LeetCode | Pattern / Family | Difficulty |
| - | ------- | -------- | ---------------- | ---------- |
| 1 | Climbing Stairs | 70 | Linear / Fibonacci | Easy |
| 2 | Min Cost Climbing Stairs | 746 | Linear | Easy |
| 3 | House Robber | 198 | Linear | Medium |
| 4 | House Robber II | 213 | Linear | Medium |
| 5 | Decode Ways | 91 | Linear | Medium |
| 6 | Coin Change | 322 | Unbounded Knapsack | Medium |
| 7 | Coin Change II | 518 | Unbounded Knapsack | Medium |
| 8 | Perfect Squares | 279 | Unbounded Knapsack | Medium |
| 9 | Combination Sum IV | 377 | Unbounded Knapsack | Medium |
| 10 | Partition Equal Subset Sum | 416 | 0-1 Knapsack | Medium |
| 11 | Target Sum | 494 | 0-1 Knapsack | Medium |
| 12 | Last Stone Weight II | 1049 | 0-1 Knapsack | Medium |
| 13 | Longest Increasing Subsequence | 300 | LIS | Medium |
| 14 | Russian Doll Envelopes | 354 | LIS | Hard |
| 15 | Number of LIS | 673 | LIS | Medium |
| 16 | Longest Arithmetic Subsequence | 1027 | LIS-style | Medium |
| 17 | Longest Common Subsequence | 1143 | LCS | Medium |
| 18 | Edit Distance | 72 | String DP | Hard |
| 19 | Distinct Subsequences | 115 | String DP | Hard |
| 20 | Interleaving String | 97 | String DP | Medium |
| 21 | Regular Expression Matching | 10 | String DP | Hard |
| 22 | Wildcard Matching | 44 | String DP | Hard |
| 23 | Word Break | 139 | String DP | Medium |
| 24 | Unique Paths | 62 | Grid DP | Medium |
| 25 | Unique Paths II | 63 | Grid DP | Medium |
| 26 | Minimum Path Sum | 64 | Grid DP | Medium |
| 27 | Triangle | 120 | Grid DP | Medium |
| 28 | Maximal Square | 221 | Grid DP | Medium |
| 29 | Dungeon Game | 174 | Grid DP | Hard |
| 30 | Longest Palindromic Subsequence | 516 | Palindrome | Medium |
| 31 | Palindrome Partitioning II | 132 | Palindrome | Hard |
| 32 | Burst Balloons | 312 | Interval DP | Hard |
| 33 | Predict the Winner | 486 | Game Theory / Interval | Medium |
| 34 | Stone Game | 877 | Game Theory | Medium |
| 35 | Shortest Path Visiting All Nodes | 847 | Bitmask DP | Hard |
| 36 | Partition to K Equal Sum Subsets | 698 | Bitmask DP | Medium |
| 37 | House Robber III | 337 | Tree DP | Medium |
| 38 | Best Time to Buy/Sell Stock I | 121 | State Machine | Easy |
| 39 | Best Time to Buy/Sell Stock II | 122 | State Machine | Medium |
| 40 | Best Time to Buy/Sell Stock III | 123 | State Machine | Hard |
| 41 | Best Time to Buy/Sell Stock IV | 188 | State Machine | Hard |
| 42 | Stock with Cooldown | 309 | State Machine | Medium |
| 43 | Stock with Transaction Fee | 714 | State Machine | Medium |
| 44 | Maximum Subarray | 53 | Kadane (Linear DP) | Medium |
| 45 | Maximum Profit in Job Scheduling | 1235 | DP + Binary Search | Hard |

---

## Linear / Fibonacci-Style

---

### Climbing Stairs — LeetCode 70

Count distinct ways to climb `n` steps taking 1 or 2 steps at a time.

**Example:** `n = 4` → `5` (1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2)

```text
BRUTE FORCE — RECURSION | O(2^n) | O(n)

ways(n) = ways(n-1) + ways(n-2)

------------------------------------------------------------------------------

MEMOISATION | O(n) | O(n)

Add memo array; same recursion.

------------------------------------------------------------------------------

TABULATION | O(n) | O(n)

dp[i] = dp[i-1] + dp[i-2]; dp[1]=1, dp[2]=2

------------------------------------------------------------------------------

OPTIMAL — SPACE-OPTIMISED DP | O(n) | O(1)

Keep only two variables (a, b).
```

```csharp
public int ClimbStairs(int n)
{
    if (n <= 2) return n;
    int a = 1, b = 2;
    for (int i = 3; i <= n; i++) (a, b) = (b, a + b);
    return b;
}
```

> **Key insight:** identical to Fibonacci — each step's count is the sum of the two preceding counts.

---

### Min Cost Climbing Stairs — LeetCode 746

Pay `cost[i]` to step from stair `i`; can jump 1 or 2 steps. Minimum cost to reach the top.

**Example:** `cost = [10,15,20]` → `15`

```text
OPTIMAL — SPACE-OPTIMISED DP | O(n) | O(1)

dp[i] = cost[i] + min(dp[i-1], dp[i-2]); answer = min(dp[n-1], dp[n-2])
```

```csharp
public int MinCostClimbingStairs(int[] cost)
{
    int n = cost.Length;
    int a = cost[0], b = cost[1];
    for (int i = 2; i < n; i++)
    {
        int c = cost[i] + Math.Min(a, b);
        a = b;
        b = c;
    }
    return Math.Min(a, b);
}
```

> **Key insight:** `dp[i] = cost[i] + min(dp[i-1], dp[i-2])`; the top is past the last stair so answer is `min` of the last two.

---

### House Robber — LeetCode 198

Rob houses in a line; cannot rob two adjacent. Maximise total.

**Example:** `nums = [2,7,9,3,1]` → `12` (rob 2+9+1)

```text
BRUTE FORCE — RECURSION | O(2^n) | O(n)

rob(i) = max(nums[i] + rob(i+2), rob(i+1))

------------------------------------------------------------------------------

MEMOISATION | O(n) | O(n)

Add memo[i].

------------------------------------------------------------------------------

TABULATION | O(n) | O(n)

dp[i] = max(dp[i-1], nums[i] + dp[i-2])

------------------------------------------------------------------------------

OPTIMAL — SPACE-OPTIMISED | O(n) | O(1)

Two variables rolling forward.
```

```csharp
public int Rob(int[] nums)
{
    if (nums.Length == 1) return nums[0];
    int prev2 = nums[0], prev1 = Math.Max(nums[0], nums[1]);
    for (int i = 2; i < nums.Length; i++)
    {
        int cur = Math.Max(prev1, nums[i] + prev2);
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}
```

> **Key insight:** at each house, take the better of "rob this + best two back" vs "skip and keep best so far".

---

### House Robber II — LeetCode 213

Houses in a circle; first and last are adjacent.

**Example:** `nums = [2,3,2]` → `3`

```text
OPTIMAL — TWO-PASS DP | O(n) | O(1)

Run Rob on [0..n-2] and [1..n-1]; return max of the two.
```

```csharp
public int Rob(int[] nums)
{
    int n = nums.Length;
    if (n == 1) return nums[0];
    return Math.Max(RobRange(nums, 0, n - 2), RobRange(nums, 1, n - 1));
}

private int RobRange(int[] nums, int lo, int hi)
{
    int prev2 = 0, prev1 = 0;
    for (int i = lo; i <= hi; i++)
    {
        int cur = Math.Max(prev1, nums[i] + prev2);
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}
```

> **Key insight:** split into two linear problems — include first (exclude last) and include last (exclude first).

---

### Decode Ways — LeetCode 91

Count ways to decode a digit string ('A'→1 … 'Z'→26).

**Example:** `s = "226"` → `3` ("BZ", "VF", "BBF")

```text
BRUTE FORCE — RECURSION | O(2^n) | O(n)

decode(i) = valid_one_digit * decode(i+1) + valid_two_digit * decode(i+2)

------------------------------------------------------------------------------

MEMOISATION | O(n) | O(n)

------------------------------------------------------------------------------

OPTIMAL — TABULATION (space-optimised) | O(n) | O(1)

dp[0]=1, dp[1]= s[0]!='0' ? 1 : 0
for i=2..n: accumulate from one-digit and two-digit lookbacks
```

```csharp
public int NumDecodings(string s)
{
    int n = s.Length;
    int prev2 = 1, prev1 = s[0] != '0' ? 1 : 0;
    for (int i = 2; i <= n; i++)
    {
        int cur = 0;
        int one = s[i - 1] - '0';
        int two = (s[i - 2] - '0') * 10 + one;
        if (one >= 1) cur += prev1;
        if (two >= 10 && two <= 26) cur += prev2;
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}
```

> **Key insight:** `dp[i]` = ways to decode first `i` chars; gated by whether 1-char or 2-char suffix is a valid code.

---

## 0-1 Knapsack

---

### Partition Equal Subset Sum — LeetCode 416

Split array into two subsets of equal sum?

**Example:** `nums = [1,5,11,5]` → `true`

```text
BRUTE FORCE — RECURSION | O(2^n) | O(n)

Try all subsets; check any sums to total/2.

------------------------------------------------------------------------------

MEMOISATION | O(n * target) | O(n * target)

------------------------------------------------------------------------------

OPTIMAL — 0-1 KNAPSACK BOOLEAN DP | O(n * target) | O(target)

dp[0]=true; for each num: for s=target downto num: dp[s] |= dp[s-num]
```

```csharp
public bool CanPartition(int[] nums)
{
    int total = 0;
    foreach (int n in nums) total += n;
    if (total % 2 != 0) return false;
    int target = total / 2;
    var dp = new bool[target + 1];
    dp[0] = true;
    foreach (int num in nums)
        for (int s = target; s >= num; s--)
            dp[s] |= dp[s - num];
    return dp[target];
}
```

> **Key insight:** reverse inner loop ensures each element used at most once; boolean OR accumulates reachability.

---

### Target Sum — LeetCode 494

Assign +/- to each element; count assignments reaching `target`.

**Example:** `nums = [1,1,1,1,1], target = 3` → `5`

```text
OPTIMAL — 0-1 KNAPSACK COUNTING DP | O(n * sum) | O(sum)

Reduction: positive subset P satisfies P = (total + target) / 2.
Count subsets summing to P.
dp[0]=1; for each num: for s=P downto num: dp[s] += dp[s-num]
```

```csharp
public int FindTargetSumWays(int[] nums, int target)
{
    int total = 0;
    foreach (int n in nums) total += n;
    int sum = total + target;
    if (sum < 0 || sum % 2 != 0) return 0;
    int t = sum / 2;
    var dp = new int[t + 1];
    dp[0] = 1;
    foreach (int num in nums)
        for (int s = t; s >= num; s--)
            dp[s] += dp[s - num];
    return dp[t];
}
```

> **Key insight:** transform to counting subsets summing to `(total + target) / 2` — standard 0/1 knapsack counting pattern.

---

### Last Stone Weight II — LeetCode 1049

Split stones into two groups; minimise `|sum(A) - sum(B)|`.

**Example:** `stones = [2,7,4,1,8,1]` → `1`

```text
OPTIMAL — 0-1 KNAPSACK | O(n * sum) | O(sum)

Find largest subset sum <= total/2; answer = total - 2 * best.
```

```csharp
public int LastStoneWeightII(int[] stones)
{
    int total = 0;
    foreach (int s in stones) total += s;
    int half = total / 2;
    var dp = new bool[half + 1];
    dp[0] = true;
    foreach (int stone in stones)
        for (int s = half; s >= stone; s--)
            dp[s] |= dp[s - stone];
    for (int s = half; s >= 0; s--)
        if (dp[s]) return total - 2 * s;
    return total;
}
```

> **Key insight:** minimising `|A - B|` is equivalent to maximising the smaller group's sum subject to <= total/2.

---

## Unbounded Knapsack

---

### Coin Change — LeetCode 322

Minimum coins to make `amount`; coins reusable.

**Example:** `coins = [1,2,5], amount = 11` → `3`

```text
BRUTE FORCE — RECURSION | O(amount^|coins|) | O(amount)

Try all coins at each remaining amount.

------------------------------------------------------------------------------

MEMOISATION | O(amount * |coins|) | O(amount)

------------------------------------------------------------------------------

OPTIMAL — TABULATION | O(amount * |coins|) | O(amount)

dp[0]=0; dp[a]=INF for a>0
for a=1..amount: for c in coins: dp[a] = min(dp[a], dp[a-c]+1)
```

```csharp
public int CoinChange(int[] coins, int amount)
{
    int INF = amount + 1;
    var dp = new int[amount + 1];
    Array.Fill(dp, INF);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++)
        foreach (int c in coins)
            if (c <= a && dp[a - c] + 1 < dp[a])
                dp[a] = dp[a - c] + 1;
    return dp[amount] == INF ? -1 : dp[amount];
}
```

> **Key insight:** use `amount + 1` as safe infinity; forward inner loop allows unlimited coin reuse.

---

### Coin Change II — LeetCode 518

Count distinct combinations (not permutations) summing to `amount`.

**Example:** `coins = [1,2,5], amount = 5` → `4`

```text
OPTIMAL — UNBOUNDED KNAPSACK COUNTING DP | O(amount * |coins|) | O(amount)

Coins in outer loop prevents counting permutations.
dp[0]=1; for c in coins: for a=c..amount: dp[a] += dp[a-c]
```

```csharp
public int Change(int amount, int[] coins)
{
    var dp = new int[amount + 1];
    dp[0] = 1;
    foreach (int c in coins)
        for (int a = c; a <= amount; a++)
            dp[a] += dp[a - c];
    return dp[amount];
}
```

> **Key insight:** coins-outer loop counts combinations; swapping to amount-outer counts ordered permutations (Combination Sum IV).

---

### Perfect Squares — LeetCode 279

Minimum perfect squares summing to `n`.

**Example:** `n = 12` → `3` (4+4+4)

```text
OPTIMAL — UNBOUNDED KNAPSACK | O(n * sqrt(n)) | O(n)

Squares are the coins; forward inner loop.
```

```csharp
public int NumSquares(int n)
{
    var dp = new int[n + 1];
    Array.Fill(dp, n + 1);
    dp[0] = 0;
    for (int i = 1; i <= n; i++)
        for (int s = 1; s * s <= i; s++)
            dp[i] = Math.Min(dp[i], dp[i - s * s] + 1);
    return dp[n];
}
```

> **Key insight:** perfect squares are an unbounded denomination set; standard unbounded knapsack with forward iteration.

---

### Combination Sum IV — LeetCode 377

Count ordered sequences (permutations) of `nums` summing to `target`.

**Example:** `nums = [1,2,3], target = 4` → `7`

```text
OPTIMAL — COUNTING DP (amount-outer) | O(target * |nums|) | O(target)

Amount-outer loop counts ordered sequences.
dp[0]=1; for a=1..target: for num in nums: dp[a] += dp[a-num]
```

```csharp
public int CombinationSum4(int[] nums, int target)
{
    var dp = new int[target + 1];
    dp[0] = 1;
    for (int a = 1; a <= target; a++)
        foreach (int num in nums)
            if (num <= a)
                dp[a] += dp[a - num];
    return dp[target];
}
```

> **Key insight:** amount-outer = permutations; coins-outer = combinations. Swap the loops to switch between the two.

---

## Subsequences (LIS / LCS)

---

### Longest Increasing Subsequence — LeetCode 300

Length of the longest strictly increasing subsequence.

**Example:** `nums = [10,9,2,5,3,7,101,18]` → `4` ([2,3,7,101])

```text
BRUTE FORCE — RECURSION | O(2^n) | O(n)

------------------------------------------------------------------------------

DP O(n^2) | O(n^2) | O(n)

dp[i] = LIS length ending at i; answer = max(dp).

------------------------------------------------------------------------------

OPTIMAL — PATIENCE SORTING | O(n log n) | O(n)

tails[k] = smallest tail of IS of length k+1.
Binary-search insertion point; replace or append.
```

```csharp
public int LengthOfLIS(int[] nums)
{
    var tails = new List<int>();
    foreach (int x in nums)
    {
        int pos = tails.BinarySearch(x);
        if (pos < 0) pos = ~pos;
        if (pos == tails.Count) tails.Add(x);
        else tails[pos] = x;
    }
    return tails.Count;
}
```

> **Key insight:** `tails[i]` is the smallest possible tail of any IS of length `i+1`; its count gives the LIS length.

---

### Russian Doll Envelopes — LeetCode 354

Maximum nesting depth of envelopes where both dimensions must be strictly smaller.

**Example:** `[[5,4],[6,4],[6,7],[2,3]]` → `3`

```text
OPTIMAL — SORT + LIS ON HEIGHTS | O(n log n) | O(n)

Sort by width ASC, height DESC for ties (prevents two same-width picks).
LIS on heights only.
```

```csharp
public int MaxEnvelopes(int[][] envelopes)
{
    Array.Sort(envelopes, (a, b) => a[0] != b[0] ? a[0] - b[0] : b[1] - a[1]);
    int[] heights = Array.ConvertAll(envelopes, e => e[1]);
    var tails = new List<int>();
    foreach (int h in heights)
    {
        int pos = tails.BinarySearch(h);
        if (pos < 0) pos = ~pos;
        if (pos == tails.Count) tails.Add(h);
        else tails[pos] = h;
    }
    return tails.Count;
}
```

> **Key insight:** descending-height sort for equal widths collapses 2-D nesting to 1-D LIS on heights.

---

### Number of LIS — LeetCode 673

Count the number of longest increasing subsequences.

**Example:** `nums = [1,3,5,4,7]` → `2`

```text
OPTIMAL — DP O(n^2) | O(n^2) | O(n)

Maintain len[i] and cnt[i] per index.
When a new max length found: reset cnt; when tied: accumulate cnt.
```

```csharp
public int FindNumberOfLIS(int[] nums)
{
    int n = nums.Length;
    var len = new int[n];
    var cnt = new int[n];
    Array.Fill(len, 1);
    Array.Fill(cnt, 1);
    int maxLen = 1;
    for (int i = 1; i < n; i++)
    {
        for (int j = 0; j < i; j++)
        {
            if (nums[j] >= nums[i]) continue;
            if (len[j] + 1 > len[i]) { len[i] = len[j] + 1; cnt[i] = cnt[j]; }
            else if (len[j] + 1 == len[i]) cnt[i] += cnt[j];
        }
        maxLen = Math.Max(maxLen, len[i]);
    }
    int ans = 0;
    for (int i = 0; i < n; i++)
        if (len[i] == maxLen) ans += cnt[i];
    return ans;
}
```

> **Key insight:** track both length and count per endpoint; sum counts of all endpoints matching the global maximum length.

---

### Longest Arithmetic Subsequence — LeetCode 1027

Longest subsequence with constant difference between consecutive elements.

**Example:** `nums = [3,6,9,12]` → `4`

```text
OPTIMAL — DP WITH DICTIONARY | O(n^2) | O(n^2)

dp[i][diff] = longest AS ending at i with that difference.
```

```csharp
public int LongestArithSeqLength(int[] nums)
{
    int n = nums.Length, ans = 2;
    var dp = new Dictionary<int, int>[n];
    for (int i = 0; i < n; i++) dp[i] = new Dictionary<int, int>();
    for (int i = 1; i < n; i++)
        for (int j = 0; j < i; j++)
        {
            int diff = nums[i] - nums[j];
            int prev = dp[j].TryGetValue(diff, out int v) ? v : 1;
            dp[i][diff] = prev + 1;
            ans = Math.Max(ans, dp[i][diff]);
        }
    return ans;
}
```

> **Key insight:** dictionary keyed by common difference extends LIS-style DP to arithmetic subsequences.

---

## Strings and Edit Distance

---

### Longest Common Subsequence — LeetCode 1143

Length of the longest common subsequence.

**Example:** `text1 = "abcde", text2 = "ace"` → `3`

```text
BRUTE FORCE — RECURSION | O(2^(m+n)) | O(m+n)

------------------------------------------------------------------------------

MEMOISATION | O(mn) | O(mn)

------------------------------------------------------------------------------

OPTIMAL — 2-D TABULATION | O(mn) | O(mn)   [O(n) with rolling row]

dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1]
if match: dp[i-1][j-1]+1   else: max(dp[i-1][j], dp[i][j-1])
```

```csharp
public int LongestCommonSubsequence(string text1, string text2)
{
    int m = text1.Length, n = text2.Length;
    var dp = new int[m + 1, n + 1];
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i, j] = text1[i - 1] == text2[j - 1]
                ? dp[i - 1, j - 1] + 1
                : Math.Max(dp[i - 1, j], dp[i, j - 1]);
    return dp[m, n];
}
```

> **Key insight:** matching chars extend the diagonal; mismatches take the best of omitting one side.

---

### Edit Distance — LeetCode 72

Minimum insert/delete/replace operations to convert `word1` to `word2`.

**Example:** `word1 = "horse", word2 = "ros"` → `3`

```text
BRUTE FORCE — RECURSION | O(3^(m+n)) | O(m+n)

------------------------------------------------------------------------------

OPTIMAL — 2-D DP | O(mn) | O(mn)

dp[i][0]=i, dp[0][j]=j (base cases)
if match: dp[i-1][j-1]
else: 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])
         replace       delete       insert
```

```csharp
public int MinDistance(string word1, string word2)
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

> **Key insight:** three operations map to three table neighbours: diagonal (replace), up (delete from word1), left (insert into word1).

---

### Distinct Subsequences — LeetCode 115

Count distinct ways to form `t` as a subsequence of `s`.

**Example:** `s = "rabbbit", t = "rabbit"` → `3`

```text
OPTIMAL — 2-D DP | O(mn) | O(mn)

dp[i][0]=1; dp[0][j]=0 for j>0
if s[i-1]==t[j-1]: dp[i][j] = dp[i-1][j-1] + dp[i-1][j]   (use or skip s[i-1])
else:              dp[i][j] = dp[i-1][j]
```

```csharp
public int NumDistinct(string s, string t)
{
    int m = s.Length, n = t.Length;
    var dp = new long[m + 1, n + 1];
    for (int i = 0; i <= m; i++) dp[i, 0] = 1;
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i, j] = s[i - 1] == t[j - 1]
                ? dp[i - 1, j - 1] + dp[i - 1, j]
                : dp[i - 1, j];
    return (int)dp[m, n];
}
```

> **Key insight:** matching characters offer a choice — use this s-character or skip it; summing both paths counts distinct subsequences.

---

### Interleaving String — LeetCode 97

Is `s3` formed by interleaving `s1` and `s2`?

**Example:** `s1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"` → `true`

```text
OPTIMAL — 2-D BOOLEAN DP | O(mn) | O(mn)

dp[i][j] = can s3[0..i+j-1] be formed from s1[0..i-1] and s2[0..j-1]
dp[i][j] = (dp[i-1][j] && s1[i-1]==s3[i+j-1])
          || (dp[i][j-1] && s2[j-1]==s3[i+j-1])
```

```csharp
public bool IsInterleave(string s1, string s2, string s3)
{
    int m = s1.Length, n = s2.Length;
    if (m + n != s3.Length) return false;
    var dp = new bool[m + 1, n + 1];
    dp[0, 0] = true;
    for (int i = 1; i <= m; i++) dp[i, 0] = dp[i - 1, 0] && s1[i - 1] == s3[i - 1];
    for (int j = 1; j <= n; j++) dp[0, j] = dp[0, j - 1] && s2[j - 1] == s3[j - 1];
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i, j] = (dp[i - 1, j] && s1[i - 1] == s3[i + j - 1])
                     || (dp[i, j - 1] && s2[j - 1] == s3[i + j - 1]);
    return dp[m, n];
}
```

> **Key insight:** `dp[i][j]` tracks whether the first `i+j` chars of `s3` can be assembled from `s1[0..i-1]` and `s2[0..j-1]`.

---

### Regular Expression Matching — LeetCode 10

Match string `s` against pattern `p` with `.` (any char) and `*` (zero or more of preceding).

**Example:** `s = "aab", p = "c*a*b"` → `true`

```text
BRUTE FORCE — RECURSION | O(2^(m+n)) | O(m+n)

------------------------------------------------------------------------------

OPTIMAL — 2-D DP | O(mn) | O(mn)

dp[0][0]=true; dp[0][j] = (p[j-1]=='*') && dp[0][j-2]
if p[j-1]=='*': dp[i][j] = dp[i][j-2]                         // zero occurrences
                if p[j-2] matches s[i-1]: dp[i][j] |= dp[i-1][j]  // extend
else if p[j-1] matches s[i-1]: dp[i][j] = dp[i-1][j-1]
```

```csharp
public bool IsMatch(string s, string p)
{
    int m = s.Length, n = p.Length;
    var dp = new bool[m + 1, n + 1];
    dp[0, 0] = true;
    for (int j = 2; j <= n; j++)
        if (p[j - 1] == '*') dp[0, j] = dp[0, j - 2];
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
        {
            if (p[j - 1] == '*')
            {
                dp[i, j] = dp[i, j - 2];
                if (p[j - 2] == '.' || p[j - 2] == s[i - 1])
                    dp[i, j] |= dp[i - 1, j];
            }
            else if (p[j - 1] == '.' || p[j - 1] == s[i - 1])
                dp[i, j] = dp[i - 1, j - 1];
        }
    return dp[m, n];
}
```

> **Key insight:** `*` has two cases — zero occurrences (`dp[i][j-2]`) or extend one more (`dp[i-1][j]` when preceding pattern matches).

---

### Wildcard Matching — LeetCode 44

Match with `?` (any single char) and `*` (any sequence including empty).

**Example:** `s = "adceb", p = "*a*b"` → `true`

```text
OPTIMAL — 2-D DP | O(mn) | O(mn)

if p[j-1]=='*': dp[i][j] = dp[i-1][j] || dp[i][j-1]
                             consume one s-char | skip '*'
```

```csharp
public bool IsMatch(string s, string p)
{
    int m = s.Length, n = p.Length;
    var dp = new bool[m + 1, n + 1];
    dp[0, 0] = true;
    for (int j = 1; j <= n; j++)
        if (p[j - 1] == '*') dp[0, j] = dp[0, j - 1];
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
        {
            if (p[j - 1] == '*')
                dp[i, j] = dp[i - 1, j] || dp[i, j - 1];
            else
                dp[i, j] = (p[j - 1] == '?' || p[j - 1] == s[i - 1]) && dp[i - 1, j - 1];
        }
    return dp[m, n];
}
```

> **Key insight:** `*` in wildcard greedily absorbs characters (`dp[i-1][j]`) or matches empty (`dp[i][j-1]`) — simpler than regex `*`.

---

### Word Break — LeetCode 139

Can `s` be segmented into dictionary words?

**Example:** `s = "leetcode", wordDict = ["leet","code"]` → `true`

```text
BRUTE FORCE — RECURSION | O(2^n) | O(n)

------------------------------------------------------------------------------

MEMOISATION | O(n^2) | O(n)

------------------------------------------------------------------------------

OPTIMAL — TABULATION | O(n^2) | O(n)

dp[0]=true; for i=1..n: for j=0..i-1: if dp[j] && s[j..i) in dict: dp[i]=true
```

```csharp
public bool WordBreak(string s, IList<string> wordDict)
{
    var wordSet = new HashSet<string>(wordDict);
    int n = s.Length;
    var dp = new bool[n + 1];
    dp[0] = true;
    for (int i = 1; i <= n; i++)
        for (int j = 0; j < i; j++)
            if (dp[j] && wordSet.Contains(s.Substring(j, i - j)))
            {
                dp[i] = true;
                break;
            }
    return dp[n];
}
```

> **Key insight:** `dp[i]` = "can the first `i` chars be segmented"; scan all valid start points `j` where `dp[j]` is true.

---

## Grid DP

---

### Unique Paths — LeetCode 62

Count paths from top-left to bottom-right, moving only right or down.

**Example:** `m = 3, n = 7` → `28`

```text
BRUTE FORCE | O(2^(m+n)) | O(m+n)

------------------------------------------------------------------------------

OPTIMAL — ROLLING-ROW DP | O(mn) | O(n)

dp[j] += dp[j-1]; first row initialised to 1.
```

```csharp
public int UniquePaths(int m, int n)
{
    var dp = new int[n];
    Array.Fill(dp, 1);
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            dp[j] += dp[j - 1];
    return dp[n - 1];
}
```

> **Key insight:** `dp[j]` accumulates paths from above + left; rolling row reduces space to O(n).

---

### Unique Paths II — LeetCode 63

Same but cells with value 1 are blocked.

**Example:** `obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]` → `2`

```text
OPTIMAL — IN-PLACE GRID DP | O(mn) | O(1)

Overwrite the grid; blocked cells set to 0.
```

```csharp
public int UniquePathsWithObstacles(int[][] grid)
{
    int m = grid.Length, n = grid[0].Length;
    if (grid[0][0] == 1) return 0;
    grid[0][0] = 1;
    for (int j = 1; j < n; j++) grid[0][j] = grid[0][j] == 1 ? 0 : grid[0][j - 1];
    for (int i = 1; i < m; i++) grid[i][0] = grid[i][0] == 1 ? 0 : grid[i - 1][0];
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            grid[i][j] = grid[i][j] == 1 ? 0 : grid[i - 1][j] + grid[i][j - 1];
    return grid[m - 1][n - 1];
}
```

> **Key insight:** blocked cell contributes 0 paths; handle leading obstacles in the first row and column separately.

---

### Minimum Path Sum — LeetCode 64

Minimum cost path from top-left to bottom-right (right or down only).

**Example:** `grid = [[1,3,1],[1,5,1],[4,2,1]]` → `7`

```text
OPTIMAL — IN-PLACE GRID DP | O(mn) | O(1)

grid[i][j] += min(grid[i-1][j], grid[i][j-1])
```

```csharp
public int MinPathSum(int[][] grid)
{
    int m = grid.Length, n = grid[0].Length;
    for (int j = 1; j < n; j++) grid[0][j] += grid[0][j - 1];
    for (int i = 1; i < m; i++) grid[i][0] += grid[i - 1][0];
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            grid[i][j] += Math.Min(grid[i - 1][j], grid[i][j - 1]);
    return grid[m - 1][n - 1];
}
```

> **Key insight:** minimum cost at each cell is its value plus the cheaper of the cell above and the cell to its left.

---

### Triangle — LeetCode 120

Minimum path sum from top to bottom of triangle array.

**Example:** `triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]` → `11`

```text
OPTIMAL — BOTTOM-UP DP | O(n^2) | O(n)

Work bottom-up: dp[j] = triangle[i][j] + min(dp[j], dp[j+1])
```

```csharp
public int MinimumTotal(IList<IList<int>> triangle)
{
    int n = triangle.Count;
    var dp = new int[triangle[n - 1].Count];
    for (int j = 0; j < dp.Length; j++) dp[j] = triangle[n - 1][j];
    for (int i = n - 2; i >= 0; i--)
        for (int j = 0; j <= i; j++)
            dp[j] = triangle[i][j] + Math.Min(dp[j], dp[j + 1]);
    return dp[0];
}
```

> **Key insight:** filling bottom-up makes each cell naturally select the minimum of its two children already computed.

---

### Maximal Square — LeetCode 221

Largest square of 1s in a binary matrix; return its area.

**Example:** `matrix[4][4]` with central 2x2 block of 1s → `4`

```text
OPTIMAL — DP | O(mn) | O(n)

dp[i][j] = side of largest square with bottom-right at (i,j)
= min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1   when matrix[i][j]=='1'
```

```csharp
public int MaximalSquare(char[][] matrix)
{
    int m = matrix.Length, n = matrix[0].Length, maxSide = 0;
    var dp = new int[m + 1, n + 1];
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            if (matrix[i - 1][j - 1] == '1')
            {
                dp[i, j] = Math.Min(dp[i - 1, j], Math.Min(dp[i, j - 1], dp[i - 1, j - 1])) + 1;
                maxSide = Math.Max(maxSide, dp[i, j]);
            }
    return maxSide * maxSide;
}
```

> **Key insight:** the square size is bounded by the minimum of three neighbours (above, left, diagonal); min-of-three + 1.

---

### Dungeon Game — LeetCode 174

Minimum initial health for knight to reach bottom-right with health always > 0.

**Example:** `dungeon = [[-2,-3,3],[-5,-10,1],[10,30,-5]]` → `7`

```text
OPTIMAL — REVERSE GRID DP | O(mn) | O(mn)

Fill from bottom-right to top-left.
dp[i][j] = min health needed entering (i,j).
dp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) - dungeon[i][j])
```

```csharp
public int CalculateMinimumHP(int[][] dungeon)
{
    int m = dungeon.Length, n = dungeon[0].Length;
    var dp = new int[m + 1, n + 1];
    for (int i = 0; i <= m; i++)
        for (int j = 0; j <= n; j++)
            dp[i, j] = int.MaxValue;
    dp[m, n - 1] = dp[m - 1, n] = 1;
    for (int i = m - 1; i >= 0; i--)
        for (int j = n - 1; j >= 0; j--)
        {
            int need = Math.Min(dp[i + 1, j], dp[i, j + 1]) - dungeon[i][j];
            dp[i, j] = Math.Max(1, need);
        }
    return dp[0, 0];
}
```

> **Key insight:** work backwards — health needed to enter a cell depends on what you need after it, not before.

---

## Interval DP

---

### Burst Balloons — LeetCode 312

Burst balloons to maximise coins; `nums[left] * nums[i] * nums[right]` per burst.

**Example:** `nums = [3,1,5,8]` → `167`

```text
OPTIMAL — INTERVAL DP | O(n^3) | O(n^2)

Pad with 1s. dp[i][j] = max coins in open interval (i,j).
Choose k as the LAST balloon burst: dp[i][j] = max over k of dp[i][k]+dp[k][j]+a[i]*a[k]*a[j]
Fill by increasing interval length.
```

```csharp
public int MaxCoins(int[] nums)
{
    int n = nums.Length;
    var a = new int[n + 2];
    a[0] = a[n + 1] = 1;
    for (int i = 0; i < n; i++) a[i + 1] = nums[i];
    int N = n + 2;
    var dp = new int[N, N];
    for (int len = 2; len < N; len++)
        for (int i = 0; i + len < N; i++)
        {
            int j = i + len;
            for (int k = i + 1; k < j; k++)
                dp[i, j] = Math.Max(dp[i, j], dp[i, k] + dp[k, j] + a[i] * a[k] * a[j]);
        }
    return dp[0, N - 1];
}
```

> **Key insight:** choose `k` as the *last* burst — its neighbours are then the fixed boundary balloons, making subproblems independent.

---

## Game Theory / Minimax DP

---

### Predict the Winner — LeetCode 486

Can player 1 guarantee a win picking from either end of `nums`?

**Example:** `nums = [1,5,2]` → `false`

```text
OPTIMAL — INTERVAL DP (score difference) | O(n^2) | O(n^2)

dp[i][j] = max score advantage current player secures from nums[i..j].
dp[i][i] = nums[i]
dp[i][j] = max(nums[i] - dp[i+1][j], nums[j] - dp[i][j-1])
Answer: dp[0][n-1] >= 0
```

```csharp
public bool PredictTheWinner(int[] nums)
{
    int n = nums.Length;
    var dp = new int[n, n];
    for (int i = 0; i < n; i++) dp[i, i] = nums[i];
    for (int len = 2; len <= n; len++)
        for (int i = 0; i <= n - len; i++)
        {
            int j = i + len - 1;
            dp[i, j] = Math.Max(nums[i] - dp[i + 1, j], nums[j] - dp[i, j - 1]);
        }
    return dp[0, n - 1] >= 0;
}
```

> **Key insight:** track score *difference* (current player − opponent); non-negative means current player wins.

---

### Stone Game — LeetCode 877

Same minimax structure; with even pile count player 1 always wins.

**Example:** `piles = [5,3,4,5]` → `true`

```csharp
// Mathematical: player 1 always wins with even number of piles.
// Full DP proof identical to PredictTheWinner above.
public bool StoneGame(int[] piles) => true;
```

> **Key insight:** even pile count lets player 1 pre-commit to all even-indexed or all odd-indexed piles, guaranteeing the larger sum.

---

## Bitmask DP

---

### Shortest Path Visiting All Nodes — LeetCode 847

Shortest path visiting every node; revisits allowed.

**Example:** `graph = [[1,2,3],[0],[0],[0]]` → `4`

```text
OPTIMAL — BFS + BITMASK | O(2^n * n) | O(2^n * n)

State: (node, visited_mask). BFS from all nodes simultaneously.
Stop when mask == (1<<n)-1.
```

```csharp
public int ShortestPathLength(int[][] graph)
{
    int n = graph.Length, full = (1 << n) - 1;
    var visited = new bool[1 << n, n];
    var queue = new Queue<(int node, int mask, int dist)>();
    for (int i = 0; i < n; i++)
    {
        queue.Enqueue((i, 1 << i, 0));
        visited[1 << i, i] = true;
    }
    while (queue.Count > 0)
    {
        var (node, mask, dist) = queue.Dequeue();
        if (mask == full) return dist;
        foreach (int nb in graph[node])
        {
            int nm = mask | (1 << nb);
            if (!visited[nm, nb])
            {
                visited[nm, nb] = true;
                queue.Enqueue((nb, nm, dist + 1));
            }
        }
    }
    return -1;
}
```

> **Key insight:** include both node and visited-mask in the BFS state; revisits are fine as long as the (mask, node) pair is new.

---

### Partition to K Equal Sum Subsets — LeetCode 698

Split array into `k` subsets of equal sum?

**Example:** `nums = [4,3,2,3,5,2,1], k = 4` → `true`

```text
BACKTRACKING + PRUNING | O(k * 2^n) | O(n)

Sort descending; skip duplicate bucket remainders.

------------------------------------------------------------------------------

OPTIMAL — BITMASK DP | O(2^n * n) | O(2^n)

remainder[mask] = fill of current partial bucket.
Try adding element i not in mask; modulo target resets bucket.
```

```csharp
public bool CanPartitionKSubsets(int[] nums, int k)
{
    int total = nums.Sum();
    if (total % k != 0) return false;
    int target = total / k;
    if (nums.Any(x => x > target)) return false;
    int n = nums.Length;
    var dp = new bool[1 << n];
    var rem = new int[1 << n];
    dp[0] = true;
    for (int mask = 0; mask < (1 << n); mask++)
    {
        if (!dp[mask]) continue;
        for (int i = 0; i < n; i++)
        {
            if ((mask & (1 << i)) != 0) continue;
            int next = mask | (1 << i);
            if (rem[mask] + nums[i] <= target)
            {
                dp[next] = true;
                rem[next] = (rem[mask] + nums[i]) % target;
            }
        }
    }
    return dp[(1 << n) - 1];
}
```

> **Key insight:** `remainder[mask]` tracks current bucket fill; modulo `target` resets at each bucket completion.

---

## Tree DP

---

### House Robber III — LeetCode 337

Houses on a binary tree; cannot rob two directly linked nodes.

**Example:** `root = [3,2,3,null,3,null,1]` → `7`

```text
OPTIMAL — POST-ORDER TREE DP | O(n) | O(h)

Return (rob, skip) pair per node.
rob  = node.val + skip(left) + skip(right)
skip = max(rob(left),skip(left)) + max(rob(right),skip(right))
```

```csharp
public int Rob(TreeNode root)
{
    var (r, s) = Dp(root);
    return Math.Max(r, s);
}

private (int rob, int skip) Dp(TreeNode? node)
{
    if (node == null) return (0, 0);
    var (lr, ls) = Dp(node.left);
    var (rr, rs) = Dp(node.right);
    int rob  = node.val + ls + rs;
    int skip = Math.Max(lr, ls) + Math.Max(rr, rs);
    return (rob, skip);
}
```

> **Key insight:** return both choices (include/exclude) from each subtree so the parent can pick the best combination.

---

## State Machine (Stocks)

> **State machine framing:** each day has states (hold, sold, rest). Transitions are the DP recurrences. Derive all six stock variants from this single template.

---

### Best Time to Buy and Sell Stock — LeetCode 121

At most one transaction.

**Example:** `prices = [7,1,5,3,6,4]` → `5`

```text
OPTIMAL — ONE-PASS DP | O(n) | O(1)

Track running minimum; update max profit each day.
```

```csharp
public int MaxProfit(int[] prices)
{
    int minBuy = int.MaxValue, maxProfit = 0;
    foreach (int p in prices)
    {
        minBuy    = Math.Min(minBuy, p);
        maxProfit = Math.Max(maxProfit, p - minBuy);
    }
    return maxProfit;
}
```

> **Key insight:** buy at the running minimum; profit today = `today - minSoFar`.

---

### Best Time to Buy and Sell Stock II — LeetCode 122

Unlimited transactions.

**Example:** `prices = [7,1,5,3,6,4]` → `7`

```text
OPTIMAL — GREEDY | O(n) | O(1)

Sum all positive daily differences.
```

```csharp
public int MaxProfit(int[] prices)
{
    int profit = 0;
    for (int i = 1; i < prices.Length; i++)
        profit += Math.Max(0, prices[i] - prices[i - 1]);
    return profit;
}
```

> **Key insight:** every price increase can be captured; equivalent to buying at every local min and selling at every local max.

---

### Best Time to Buy and Sell Stock III — LeetCode 123

At most 2 transactions.

**Example:** `prices = [3,3,5,0,0,3,1,4]` → `6`

```text
OPTIMAL — STATE MACHINE DP | O(n) | O(1)

4 states: buy1, sell1, buy2, sell2.
```

```csharp
public int MaxProfit(int[] prices)
{
    int buy1 = int.MinValue, sell1 = 0, buy2 = int.MinValue, sell2 = 0;
    foreach (int p in prices)
    {
        buy1  = Math.Max(buy1,  -p);
        sell1 = Math.Max(sell1, buy1  + p);
        buy2  = Math.Max(buy2,  sell1 - p);
        sell2 = Math.Max(sell2, buy2  + p);
    }
    return sell2;
}
```

> **Key insight:** chain two buy/sell state pairs; the profit from the first sell funds the second buy.

---

### Best Time to Buy and Sell Stock IV — LeetCode 188

At most `k` transactions.

**Example:** `k = 2, prices = [3,2,6,5,0,3]` → `7`

```text
OPTIMAL — GENERALISED STATE MACHINE DP | O(nk) | O(k)

buy[j]/sell[j] arrays; update j from k down to 1 each day.
```

```csharp
public int MaxProfit(int k, int[] prices)
{
    int n = prices.Length;
    if (k >= n / 2)
    {
        int p = 0;
        for (int i = 1; i < n; i++) p += Math.Max(0, prices[i] - prices[i - 1]);
        return p;
    }
    var buy  = new int[k + 1];
    var sell = new int[k + 1];
    Array.Fill(buy, int.MinValue);
    for (int i = 0; i < n; i++)
        for (int j = k; j >= 1; j--)
        {
            buy[j]  = Math.Max(buy[j],  sell[j - 1] - prices[i]);
            sell[j] = Math.Max(sell[j], buy[j]       + prices[i]);
        }
    return sell[k];
}
```

> **Key insight:** when `k >= n/2` the constraint is inactive; otherwise chain k buy/sell pairs.

---

### Best Time to Buy and Sell Stock with Cooldown — LeetCode 309

Unlimited transactions; must rest one day after selling.

**Example:** `prices = [1,2,3,0,2]` → `3`

```text
OPTIMAL — STATE MACHINE DP | O(n) | O(1)

States: hold, sold, rest.
hold = max(hold, rest-price)   [can only buy from rest state]
sold = hold_prev + price
rest = max(rest, sold_prev)
```

```csharp
public int MaxProfit(int[] prices)
{
    int hold = int.MinValue, sold = 0, rest = 0;
    foreach (int p in prices)
    {
        int prevHold = hold, prevSold = sold;
        hold = Math.Max(hold,     rest - p);
        sold = prevHold + p;
        rest = Math.Max(rest,     prevSold);
    }
    return Math.Max(sold, rest);
}
```

> **Key insight:** cooldown forces `hold` to transition only from `rest`, not `sold` — one idle day is baked into the state machine.

---

### Best Time to Buy and Sell Stock with Transaction Fee — LeetCode 714

Unlimited transactions; each sell costs `fee`.

**Example:** `prices = [1,3,2,8,4,9], fee = 2` → `8`

```text
OPTIMAL — STATE MACHINE DP | O(n) | O(1)

hold = max(hold, free-price)
free = max(free, hold+price-fee)
```

```csharp
public int MaxProfit(int[] prices, int fee)
{
    int hold = int.MinValue, free = 0;
    foreach (int p in prices)
    {
        int prevHold = hold;
        hold = Math.Max(hold, free - p);
        free = Math.Max(free, prevHold + p - fee);
    }
    return free;
}
```

> **Key insight:** subtract fee at sell time; no cooldown so `hold` transitions directly from `free`.

---

## Partition and Palindrome

---

### Longest Palindromic Subsequence — LeetCode 516

Length of the longest palindromic subsequence.

**Example:** `s = "bbbab"` → `4` ("bbbb")

```text
OPTIMAL — INTERVAL DP | O(n^2) | O(n^2)

dp[i][i]=1
if s[i]==s[j]: dp[i][j] = dp[i+1][j-1]+2  (2 if len==2)
else:          dp[i][j] = max(dp[i+1][j], dp[i][j-1])
Fill by increasing length.
```

```csharp
public int LongestPalindromeSubseq(string s)
{
    int n = s.Length;
    var dp = new int[n, n];
    for (int i = 0; i < n; i++) dp[i, i] = 1;
    for (int len = 2; len <= n; len++)
        for (int i = 0; i <= n - len; i++)
        {
            int j = i + len - 1;
            dp[i, j] = s[i] == s[j]
                ? (len == 2 ? 2 : dp[i + 1, j - 1] + 2)
                : Math.Max(dp[i + 1, j], dp[i, j - 1]);
        }
    return dp[0, n - 1];
}
```

> **Key insight:** matching end characters add 2 to the inner palindrome; mismatches take the best of shrinking from either end.

---

### Palindrome Partitioning II — LeetCode 132

Minimum cuts to partition `s` so every part is a palindrome.

**Example:** `s = "aab"` → `1` ("aa" | "b")

```text
OPTIMAL — DP + PALINDROME PRECOMPUTE | O(n^2) | O(n^2)

1. Build isPalin[i][j] in O(n^2).
2. cuts[i] = min cuts for s[0..i].
   If isPalin[0][i]: cuts[i]=0
   Else: min over j where isPalin[j][i]: cuts[j-1]+1
```

```csharp
public int MinCut(string s)
{
    int n = s.Length;
    var isPalin = new bool[n, n];
    for (int i = n - 1; i >= 0; i--)
        for (int j = i; j < n; j++)
            isPalin[i, j] = s[i] == s[j] && (j - i <= 2 || isPalin[i + 1, j - 1]);

    var cuts = new int[n];
    for (int i = 0; i < n; i++)
    {
        if (isPalin[0, i]) { cuts[i] = 0; continue; }
        cuts[i] = i;
        for (int j = 1; j <= i; j++)
            if (isPalin[j, i])
                cuts[i] = Math.Min(cuts[i], cuts[j - 1] + 1);
    }
    return cuts[n - 1];
}
```

> **Key insight:** precompute the palindrome table; then `cuts[i]` finds the cheapest split by scanning all palindrome-ending positions.

---

## DP + Binary Search

---

### Maximum Profit in Job Scheduling — LeetCode 1235

Non-overlapping weighted intervals; maximise total profit.

**Example:** `startTime=[1,2,3,3], endTime=[3,4,5,6], profit=[50,10,40,70]` → `120`

```text
OPTIMAL — DP + BINARY SEARCH | O(n log n) | O(n)

Sort by end time.
dp[i] = max profit from first i jobs (1-indexed).
For job i: binary-search latest job j with end <= start[i].
dp[i] = max(dp[i-1], profit[i] + dp[j])
```

```csharp
public int JobScheduling(int[] startTime, int[] endTime, int[] profit)
{
    int n = startTime.Length;
    var jobs = Enumerable.Range(0, n)
        .Select(i => (end: endTime[i], start: startTime[i], p: profit[i]))
        .OrderBy(j => j.end)
        .ToArray();
    var dp = new int[n + 1];
    for (int i = 1; i <= n; i++)
    {
        var (end, start, p) = jobs[i - 1];
        int lo = 0, hi = i - 1;
        while (lo < hi)
        {
            int mid = (lo + hi + 1) / 2;
            if (jobs[mid - 1].end <= start) lo = mid; else hi = mid - 1;
        }
        dp[i] = Math.Max(dp[i - 1], dp[lo] + p);
    }
    return dp[n];
}
```

> **Key insight:** sort by end time then binary-search for the latest compatible job; reduces O(n²) scan to O(n log n).

---

## Kadane

---

### Maximum Subarray — LeetCode 53

Maximum sum contiguous subarray.

**Example:** `nums = [-2,1,-3,4,-1,2,1,-5,4]` → `6`

> Kadane's algorithm is a 1-D DP and is fully documented in [Arrays and Strings](../ArraysAndStrings/ArraysAndStrings.md).

```csharp
public int MaxSubArray(int[] nums)
{
    int cur = nums[0], best = nums[0];
    for (int i = 1; i < nums.Length; i++)
    {
        cur  = Math.Max(nums[i], cur + nums[i]);
        best = Math.Max(best, cur);
    }
    return best;
}
```

> **Key insight:** `dp[i] = max(nums[i], dp[i-1] + nums[i])` — start fresh or extend; scan all `dp[i]` for the answer.
