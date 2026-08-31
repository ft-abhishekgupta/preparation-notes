# Dynamic Programming — Problems

## Longest Common Subsequence

Given 2 strings s1 and s2, return the length of their longest common subsequence. A subsequence of a string is a new string generated from the original string with some characters(can be none) deleted without changing the relative order of the remaining characters.

**Example:** `text1 = "abcde", text2 = "ace"` → `3` ("ace")

1. 2D matrix of size l1 x l2 and iterate

```text
dp[i][j] = Max(dp[i-1][j], dp[i][j-1], if s1[i] = s2[j] ? dp[i-1][j-1]+1)
```

1. Return value in last cell

```text
BRUTE FORCE | O(2^N) | O(N)

For each character in s1, decide whether to include it in the subsequence or not.

------------------------------------------------------------------------------

2D DP | O(M * N) | O(M * N)

// dp[i][j] = LCS of first i characters of s1 and first j characters of s2
// if s1[i - 1] == s2[j - 1]:
//     dp[i][j] = dp[i - 1][j - 1] + 1
// else:
//     dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

LCS(s1, s2):
    m = s1.length
    n = s2.length
    dp = 2D array (m + 1) × (n + 1)
    for i = 1 to m:
        for j = 1 to n:
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]
```

```cs
public int LongestCommonSubsequence(string t1, string t2) {
    int l1 = t1.Length, l2 = t2.Length;
    var arr = new int[l1][];
    for(int i = 0; i < l1; i++){
        arr[i] = new int[l2];
        for(int j = 0; j < l2; j++){
            if(t1[i] == t2[j])
                arr[i][j] = i > 0 && j > 0 ? 1 + arr[i-1][j-1] : 1;
            arr[i][j] = Math.Max(arr[i][j],
                Math.Max(i > 0 ? arr[i-1][j]: 0, j > 0 ? arr[i][j-1] : 0));
        }
    }
    return arr[l1-1][l2-1];
}
```

## Unique path to last cell, If only move down and right

Starting from the top-left corner of a m x n grid, you can only move either down or right at any point in time. Find the number of unique paths to reach the bottom-right corner of the grid.

**Example:** `m = 3, n = 7` → `28`

1. To reach a cell, it can come from up or left. Add both to get paths to this cell.
2. `dp[i][j] = dp[i-1][j] + dp[i][j-1]` and 1 for 1st row and col

```text
BRUTE FORCE | O(2^(M + N)) | O(M + N)

For each cell, decide whether to move down or right.

------------------------------------------------------------------------------

DP | O(M * N) | O(M * N)

// dp[r][c] = number of ways to reach cell (r,c)
// dp[r][c] = dp[r-1][c] + dp[r][c-1]

UNIQUE_PATHS(rows, cols):
    dp = 2D array
    for r = 0 to rows - 1:
        dp[r][0] = 1
    for c = 0 to cols - 1:
        dp[0][c] = 1
    for r = 1 to rows - 1:
        for c = 1 to cols - 1:
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp[rows - 1][cols - 1]
```

```cs
public int UniquePaths(int m, int n) {
    var dp = new int[m][];
    for(int i = 0; i < m; i++){
        dp[i] = new int[n];
        dp[0][0] = 1;
        for(int j = 0; j < n; j++){
            if(i==0 || j == 0)
                dp[i][j] = 1;
            else
                dp[i][j] = dp[i-1][j] + dp[i][j-1];
        }
    }
    return dp[m-1][n-1];
}
```

## Longest Increasing Subsequence

Given an integer array nums, return the length of the longest strictly increasing subsequence.

**Example:** `nums = [10, 9, 2, 5, 3, 7, 101, 18]` → `4` ([2, 3, 7, 101])

1. dp[i] = Length of LIS ending at i.
2. So for each i, check any previous element can be added for max length

```text
BINARY SEARCH | O(N log N) | O(N)

// tails[i] = the smallest possible ending value of an increasing subsequence of length i + 1.
// For a new number x, use binary search to find the first index in tails where tails[index] >= x. If such an index is found, replace tails[index] with x. If no such index is found, append x to tails.

LIS(nums):
    tails = empty list
    FOR each x IN nums:
        index = LowerBound(tails, x)
        IF index == length(tails):
            append x to tails
        ELSE:
            tails[index] = x
    RETURN length(tails)

LowerBound(arr, target):
    left = 0
    right = length(arr)
    WHILE left < right:
        mid = left + (right - left) / 2
        IF arr[mid] < target:
            left = mid + 1
        ELSE:
            right = mid
    RETURN left
```

```cs
public int LengthOfLIS(int[] nums) {
    int len = nums.Length;
    var dp = new int[len];
    int ans = 0;
    Array.Fill(dp, 1);
    for(int i = 0; i < len; i++){
        for(int j = 0; j < i; j++){ // THIS LOOP RUNS TILL i
            if(nums[j] < nums[i])
                dp[i] = Math.Max(dp[i], 1 + dp[j]);
        }
        ans = Math.Max(ans, dp[i]);
    }
    return ans;
}
```

## Coin Change - Repeatition of Coins Allowed

Given coins of different denominations and a total amount of money, find the fewest number of coins that you need to make up that amount. If that amount cannot be made up by any combination of the coins, return -1.

**Example:** `coins = [1, 2, 5], amount = 11` → `3` (5 + 5 + 1)

```text
dp[coinIndex][target] = Minimum coins at current index to achive target
dp[coinI][target] = Min of 3 values
1. Take Coin and repeat = 1 + dp[coinI][target - coinIValue]
2. Take Coin and move = 1 + dp[coinI-1][target - coinIValue]
3. Dont take coin = dp[coinI-1][target]
```

```text
BRUTE FORCE | O(S^N) | O(N)

// Try all combinations of coins to make up the amount.

COINS(amount):
    if amount == 0:
        return 0
    answer = infinity
    for coin in coins:
        if coin <= amount:
            result = COINS(amount - coin)
            if result != infinity:
                answer = min(answer, result + 1)
    return answer

------------------------------------------------------------------------------

MEMOIZATION | O(S * N) | O(S + N)

COINS(amount):
    if amount == 0:
        return 0
    if amount < 0:
        return infinity
    if memo[amount] exists:
        return memo[amount]
    answer = infinity
    for coin in coins:
        result = COINS(amount - coin)
        if result != infinity:
            answer = min(answer, result + 1)
    memo[amount] = answer
    return answer

------------------------------------------------------------------------------

BOTTOM-UP DP | O(S * N) | O(S)

// dp[x] = minimum coins needed to make x

COIN_CHANGE(coins, amount):
    dp = array of amount + 1
    fill dp with infinity
    dp[0] = 0
    for currentAmount = 1 to amount:
        for coin in coins:
            if coin <= currentAmount:
                dp[currentAmount] = min(dp[currentAmount], dp[currentAmount - coin] + 1)
    if dp[amount] == infinity:
        return -1
    return dp[amount]
```

```cs
public int CoinChange(int[] coins, int amount) {
    int len = coins.Length;
    var dp = new int[len][];
    for(int i = 0; i < len; i++){
        dp[i] = new int[amount+1];
        dp[i][0] = 0;
        for(int j = 1; j <= amount; j++){
            var v1 = j - coins[i] >= 0 && dp[i][j - coins[i]] != int.MaxValue
                ? 1 + dp[i][j - coins[i]] : int.MaxValue;
            var v2 = i > 0 && j - coins[i] >= 0 && dp[i-1][j - coins[i]] != int.MaxValue
                ? 1 + dp[i-1][j - coins[i]] : int.MaxValue;
            var v3 = i > 0
                ? dp[i-1][j] : int.MaxValue;
            dp[i][j] = Math.Min(v1, Math.Min(v2, v3));
        }
    }
    return dp[len-1][amount] == int.MaxValue ? -1 : dp[len-1][amount];
}
```

## Climbing Stairs

You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

**Example:** `n = 3` → `3`

```text
RECURSION | O(2^N) | O(N)

A(n) = A(n - 1) + A(n - 2)

WAYS(n):
    if n == 0:
        return 1
    if n < 0:
        return 0
    return WAYS(n - 1) + WAYS(n - 2)

------------------------------------------------------------------------------

DP | O(N) | O(N)

Memoize the results of subproblems to avoid redundant calculations.

WAYS(n):
    if n == 0:
        return 1
    if n < 0:
        return 0
    if memo[n] exists:
        return memo[n]
    memo[n] = WAYS(n - 1) + WAYS(n - 2)
    return memo[n]

------------------------------------------------------------------------------

BOTTOM-UP DP | O(N) | O(N)

CLIMBING_STAIRS(n):
    if n <= 2:
        return n
    dp = array of size n + 1
    dp[1] = 1
    dp[2] = 2
    for i = 3 to n:
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

------------------------------------------------------------------------------

SPACE OPTIMIZED DP | O(N) | O(1)

CLIMBING_STAIRS(n):
    if n <= 2:
        return n
    prev2 = 1
    prev1 = 2
    for i = 3 to n:
        current = prev1 + prev2
        prev2 = prev1
        prev1 = current
    return prev1
```

## House Robber

You have houses: [2, 7, 9, 3, 1] You cannot rob two adjacent houses. Find maximum money.

**Example:** `nums = [2, 7, 9, 3, 1]` → `12` (rob 2 + 9 + 1)

```text
BRUTE FORCE | O(2^N) | O(N)

// For each house, decide whether to rob it or not.

ROB(i):
    if i >= n:
        return 0
    robCurrent = nums[i] + ROB(i + 2)
    skipCurrent = ROB(i + 1)
    return max(robCurrent, skipCurrent)

------------------------------------------------------------------------------

MEMOIZATION | O(N) | O(N)

ROB(i):
    if i >= n:
        return 0
    if memo[i] exists:
        return memo[i]
    memo[i] = max(nums[i] + ROB(i + 2), ROB(i + 1))
    return memo[i]

------------------------------------------------------------------------------

BOTTOM-UP DP | O(N) | O(N)

HOUSE_ROBBER(nums):
    n = nums.length
    if n == 0:
        return 0
    if n == 1:
        return nums[0]
    prev2 = nums[0]
    prev1 = max(nums[0], nums[1])
    for i = 2 to n - 1:
        current = max(prev1, nums[i] + prev2)
        prev2 = prev1
        prev1 = current
    return prev1
```

> If houses are arranged in a circle
> Calculate 2 DPs, 1st one 0 to n-2, 2nd one 0 to n-1. Return max

## Partition Equal Subset Sum

Given a non-empty array nums containing only positive integers, find if the array can be partitioned into two subsets such that the sum of elements in both subsets is equal.

**Example:** `nums = [1, 5, 11, 5]` → `true` ([1, 5, 5] and [11])

```text
BRUTE FORCE | O(2^N) | O(N)

For each number, decide whether to include it in the first subset or not.

------------------------------------------------------------------------------

MEMOIZATION | O(N * Target) | O(N * Target)

CAN_PARTITION(i, remaining):
    if remaining == 0:
        return true
    if i == n OR remaining < 0:
        return false
    if memo[i][remaining] exists:
        return memo[i][remaining]
    take = CAN_PARTITION(i + 1, remaining - nums[i])
    skip = CAN_PARTITION(i + 1, remaining)
    memo[i][remaining] = take OR skip
    return memo[i][remaining]

------------------------------------------------------------------------------

KNAPSACK | O(N * Target) | O(Target)

PARTITION_EQUAL_SUBSET(nums):
    total = sum(nums)
    if total % 2 != 0:
        return false
    target = total / 2
    dp = array of target + 1
    dp[0] = true
    for num in nums:
        for sum = target down to num:
            dp[sum] = dp[sum] OR dp[sum - num]
    return dp[target]
```

## Edit Distance

Convert one string to another using the minimum number of operations. You have the following 3 operations permitted on a word:

1. Insert a character
2. Delete a character
3. Replace a character

**Example:** `word1 = "horse", word2 = "ros"` → `3`

```text
BRUTE FORCE | O(3^N) | O(N)

For each character in s1, decide whether to insert, delete, or replace it to match s2.

------------------------------------------------------------------------------

2D DP | O(M * N) | O(M * N)

// dp[i][j] = minimum edit distance between first i characters of s1 and first j characters of s2

EDIT_DISTANCE(word1, word2):
    m = word1.length
    n = word2.length
    dp = 2D array (m + 1) × (n + 1)
    for i = 0 to m:
        dp[i][0] = i
    for j = 0 to n:
        dp[0][j] = j
    for i = 1 to m:
        for j = 1 to n:
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]  // No operation needed
            else:
                dp[i][j] = 1 + min(
                        dp[i - 1][j],     // delete
                        dp[i][j - 1],     // insert
                        dp[i - 1][j - 1])  // replace
    return dp[m][n]
```

## Word Break

Given a string s and a dictionary of words wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.

**Example:** `s = "leetcode", wordDict = ["leet","code"]` → `true`

```text
BRUTE FORCE | O(2^N) | O(N)

Generate all possible segmentations of the string and check if each segment is in the dictionary.

------------------------------------------------------------------------------

MEMOIZATION | O(N^2) | O(N)

index = Can the suffix starting at index be segmented?

CAN_BREAK(index):
    if index == n:
        return true
    if memo[index] exists:
        return memo[index]
    for end = index + 1 to n:
        word = s[index...end]
        if word in dictionary AND CAN_BREAK(end):
            memo[index] = true
            return true
    memo[index] = false
    return false

------------------------------------------------------------------------------

BOTTOM-UP DP | O(N^2) | O(N)

dp[i] = whether first i characters can be segmented

WORD_BREAK(s, dictionary):
    n = s.length
    dp = array of n + 1 filled with false
    dp[0] = true
    for i = 1 to n:
        for j = 0 to i - 1:
            if dp[j] == true:
                word = s[j...i]
                if word in dictionary:
                    dp[i] = true
                    break
    return dp[n]
```

## Minimum Path Sum

Given a m x n grid filled with non-negative numbers, find a path from top left to bottom right which minimizes the sum of all numbers along its path. You can only move either down or right at any point in time.

**Example:** `grid = [[1,3,1],[1,5,1],[4,2,1]]` → `7` (1→3→1→1→1)

```text
DP | O(M * N) | O(M * N)

// dp[r][c] = minimum cost to reach (r,c)
// dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])

MIN_PATH_SUM(grid):
    rows = grid.rows
    cols = grid.cols
    dp = 2D array
    dp[0][0] = grid[0][0]
    for r = 1 to rows - 1:
        dp[r][0] = dp[r - 1][0] + grid[r][0]
    for c = 1 to cols - 1:
        dp[0][c] = dp[0][c - 1] + grid[0][c]
    for r = 1 to rows - 1:
        for c = 1 to cols - 1:
            dp[r][c] = grid[r][c] + min(dp[r - 1][c], dp[r][c - 1])
    return dp[rows - 1][cols - 1]
```

## Decode Ways

Given a string s containing only digits, return the number of ways to decode it. The mapping is 'A' -> 1, 'B' -> 2, ..., 'Z' -> 26. A leading zero is invalid.

**Example:** `s = "226"` → `3` ("BZ", "VF", "BBF")

```text
DP | O(N) | O(N)

// dp[i] = number of ways to decode first i characters
// if One Digit: dp[i] += dp[i - 1]
// if Two Digits: dp[i] += dp[i - 2]

DECODE_WAYS(s):
    n = s.length
    if n == 0:
        return 0
    dp = array of n + 1
    dp[0] = 1
    if s[0] != '0':
        dp[1] = 1
    else:
        dp[1] = 0
    for i = 2 to n:
        oneDigit = integer(s[i - 1])
        if oneDigit >= 1:
            dp[i] += dp[i - 1]
        twoDigit = integer(s[i - 2...i])
        if twoDigit >= 10 AND twoDigit <= 26:
            dp[i] += dp[i - 2]
    return dp[n]
```

## Best Time to Buy and Sell Stock with Cooldown

Given array of prices for stocks. You can: Buy, Sell, Wait. But after selling, you must wait one day before buying again. Calculate the maximum profit you can achieve.

**Example:** `prices = [1, 2, 3, 0, 2]` → `3` (buy, sell, cooldown, buy, sell)

```text
STATE MACHINE DP | O(N) | O(1)

// Each day, we can be in one of three states. We track the maximum profit for each state.
// hold = max profit if we are holding a stock
// sold = max profit if we just sold a stock
// rest = max profit if we are in cooldown or just waiting

STOCK_WITH_COOLDOWN(prices):
    hold = -infinity
    sold = 0
    rest = 0
    for price in prices:
        previousHold = hold
        previousSold = sold
        previousRest = rest
        hold = max(previousHold, previousRest - price)
        sold = previousHold + price
        rest = max(previousRest, previousSold)
    return max(sold, rest)
```

## Burst Balloons

You are given n balloons, indexed from 0 to n - 1. Each balloon is painted with a number on it represented by an array nums. You are asked to burst all the balloons. If you burst balloon i you will get nums[left] _nums[i]_ nums[right] coins. Here left and right are adjacent indices of i. After the burst, the left and right then become adjacent. Find maximum coins you can collect by bursting the balloons wisely. You may imagine nums[-1] = nums[n] = 1. They are not real therefore you cannot burst them.

**Example:** `nums = [3, 1, 5, 8]` → `167`

```text
INTERVAL DP | O(N^3) | O(N^2)

// dp[left][right] = max coins from bursting every balloon in [left, right]
// Pick i as the LAST balloon burst in the range, so its neighbours are then nums[left - 1] and nums[right + 1] (1 outside the array)
// dp[left][right] = max over i in [left, right] of
//     dp[left][i - 1] + dp[i + 1][right] + nums[left - 1] × nums[i] × nums[right + 1]
// Choosing the last burst (not the first) is what makes the subproblems independent

BURST_BALLOONS(nums):
    n = nums.length
    dp = 2D array of n x n
    for length = 1 to n:
        for left = 0 to n - length:
            right = left + length - 1
            for i = left to right:
                coins = nums[i]
                if left > 0:
                    coins *= nums[left - 1]
                if right < n - 1:
                    coins *= nums[right + 1]
                if i > left:
                    coins += dp[left][i - 1]
                if i < right:
                    coins += dp[i + 1][right]
                dp[left][right] = max(dp[left][right], coins)
    return dp[0][n - 1]
```

## Regular Expression Matching

Given an input string s and a pattern p supporting `.` (any single character) and `*` (zero or more of the preceding element), determine whether the pattern matches the entire string.

**Example:** `s = "aab", p = "c*a*b"` → `true`

```text
RECURSION | O(2^(M + N)) | O(M + N)

MATCH(i, j):
    if j == p.length:
        return i == s.length
    firstMatches = i < s.length
                   AND (p[j] == s[i] OR p[j] == '.')
    if j + 1 < p.length AND p[j + 1] == '*':
        // Zero occurrences, or consume one character and stay on the same pattern
        return MATCH(i, j + 2)
               OR (firstMatches AND MATCH(i + 1, j))
    return firstMatches AND MATCH(i + 1, j + 1)

------------------------------------------------------------------------------

2D DP | O(M * N) | O(M * N)

// dp[i][j] = does the first i characters of s match the first j characters of p

dp[0][0] = true
for j = 1 to n:
    if p[j - 1] == '*':
        dp[0][j] = dp[0][j - 2]      // "x*" matches the empty string

for i = 1 to m:
    for j = 1 to n:
        if p[j - 1] == '*':
            dp[i][j] = dp[i][j - 2]                       // Zero occurrences
            if p[j - 2] == s[i - 1] OR p[j - 2] == '.':
                dp[i][j] = dp[i][j] OR dp[i - 1][j]        // One more occurrence
        else if p[j - 1] == s[i - 1] OR p[j - 1] == '.':
            dp[i][j] = dp[i - 1][j - 1]
        else:
            dp[i][j] = false

return dp[m][n]
```

> Wildcard matching (`?` and `*` where `*` matches any sequence) uses the same table with `dp[i][j] = dp[i - 1][j] OR dp[i][j - 1]` for `*`.

## Partition to K Equal Sum Subsets

Given an integer array `nums` and an integer `k`, determine whether it is possible to divide the array into `k` non-empty subsets with equal sums.

**Example:** `nums = [4, 3, 2, 3, 5, 2, 1], k = 4` → `true` (`[5], [1,4], [2,3], [2,3]`)

```text
BACKTRACKING WITH PRUNING | O(K * 2^N) | O(N)

sort descending and place large numbers first
skip a bucket that already failed with the same remaining capacity
fail fast when total % k != 0 or max(nums) > target

-----------------------------------------------------------------------------

BITMASK DP | O(2^N * N) | O(2^N)

// mask = which elements have been used
// Because elements are always placed in order, sum(mask) determines both the number
// of completed buckets and how full the current bucket is
// remainder[mask] = space already used in the current bucket

target = total / k
reachable[0] = true
remainder[0] = 0

for mask = 0 to 2^n - 1:
    if not reachable[mask]:
        continue
    for i = 0 to n - 1:
        if i is already in mask:
            continue
        if remainder[mask] + nums[i] > target:
            continue
        next = mask | (1 << i)
        reachable[next] = true
        remainder[next] = (remainder[mask] + nums[i]) % target

return reachable[(1 << n) - 1]
```

> Travelling Salesman uses the same shape with an extra dimension: `dp[mask][last]` = cheapest route visiting `mask` and ending at `last`, in `O(2^N * N^2)`.
