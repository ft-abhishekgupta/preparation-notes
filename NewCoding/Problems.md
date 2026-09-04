## Dynamic Programming

### Palindromic Substrings

```
dp[i][j] = s[i...j] is a palindrome
dp[i][j] = s[i] == s[j] and dp[i+1][j-1] is true
```

```cs
// First loop runs in reverse order here
for(int i = len-1; i >= 0; i--)
    for(int j = 0; j < len; j++)
        if(s[i] == s[j])
            if(j-i <= 2 || dp[i+1][j-1])
                dp[i][j] = true;
```