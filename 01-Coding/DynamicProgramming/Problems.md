## Longest Common Subsequence

1. 2D matrix of size l1 x l2 and iterate

```
dp[i][j] = Max(dp[i-1][j], dp[i][j-1], if s1[i] = s2[j] ? dp[i-1][j-1]+1)
```

1. Return value in last cell

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

1. To reach a cell, it can come from up or left. Add both to get paths to this cell.
2. `dp[i][j] = dp[i-1][j] + dp[i][j-1]` and 1 for 1st row and col

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

1. dp[i] = Length of LIS ending at i.
2. So for each i, check any previous element can be added for max length

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

```
dp[coinIndex][target] = Minimum coins at current index to achive target
dp[coinI][target] = Min of 3 values
1. Take Coin and repeat = 1 + dp[coinI][target - coinIValue]
2. Take Coin and move = 1 + dp[coinI-1][target - coinIValue]
3. Dont take coin = dp[coinI-1][target]
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
