## Rotate a 2D Square Matrix 90 Degree Clockwise

1. Flip by diagonal : swap m[i][j], m[j],[i]
2. Reverse each row

```cs
public void Rotate(int[][] m) {
        int len = m.Length;
        for(int i = 0; i < len; i++){
            for(int j = i; j < len; j++){
                var temp = m[i][j];
                m[i][j] = m[j][i];
                m[j][i] = temp;
            }
        }
        for(int i = 0; i < len; i++)
            Array.Reverse(m[i]);
    }
```

## Max Product Subarray

1. Prefix Product and Suffix Product. Reset on 0. Update max

```cs
public int MaxProduct(int[] nums) {
    int n = nums.Length;
    int res = nums[0];
    int prefix = 0, suffix = 0;
    for (int i = 0; i < n; i++) {
        prefix = nums[i] * (prefix == 0 ? 1 : prefix);
        suffix = nums[n - 1 - i] * (suffix == 0 ? 1 : suffix);
        res = Math.Max(res, Math.Max(prefix, suffix));
    }
    return res;
}
```
