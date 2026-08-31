# Arrays and Strings

## Prefix Sum (1D)

```csharp
// Build
int[] A = { 1, 2, 3, 4, 5 };
int n = A.Length;
int[] P = new int[n + 1];          // P[0] = 0
for (int i = 0; i < n; i++)
    P[i + 1] = P[i] + A[i];

// Range sum [l, r] inclusive
int RangeSum(int l, int r) => P[r + 1] - P[l];
```

---

## Difference Array (range update in O(1))

```csharp
// Add val to A[l..r] inclusive, O(1) per update
int[] diff = new int[n + 1];
void RangeAdd(int l, int r, int val)
{
    diff[l] += val;
    diff[r + 1] -= val;
}
// Reconstruct A by prefix-summing diff
int running = 0;
for (int i = 0; i < n; i++) { running += diff[i]; A[i] += running; }
```

---

## 2D Prefix Sum

```csharp
// P[i][j] = sum of rectangle (0,0) to (i-1,j-1)
int[,] P = new int[rows + 1, cols + 1];
for (int i = 1; i <= rows; i++)
    for (int j = 1; j <= cols; j++)
        P[i, j] = grid[i-1][j-1] + P[i-1, j] + P[i, j-1] - P[i-1, j-1];

// Sum of sub-rectangle (r1,c1) to (r2,c2) — all 1-indexed
int SubRect(int r1, int c1, int r2, int c2)
    => P[r2,c2] - P[r1-1,c2] - P[r2,c1-1] + P[r1-1,c1-1];
```

---

## Kadane's Algorithm — Maximum Subarray

```csharp
int MaxSubarray(int[] A)
{
    int best = A[0], cur = A[0];
    for (int i = 1; i < A.Length; i++)
    {
        cur = Math.Max(A[i], cur + A[i]);  // extend or restart
        best = Math.Max(best, cur);
    }
    return best;
}
// O(n) time, O(1) space.  Handles all-negative arrays.
```

---

## Dutch National Flag (3-way partition)

```csharp
void DutchFlag(int[] A)   // 0s, 1s, 2s
{
    int lo = 0, mid = 0, hi = A.Length - 1;
    while (mid <= hi)
    {
        if (A[mid] == 0)      { Swap(A, lo++, mid++); }
        else if (A[mid] == 1) { mid++; }
        else                  { Swap(A, mid, hi--); }
    }
}
```

---

## Array Rotation

```csharp
// Rotate right by k: reverse whole, reverse [0..k-1], reverse [k..n-1]
void Rotate(int[] A, int k)
{
    k %= A.Length;
    Reverse(A, 0, A.Length - 1);
    Reverse(A, 0, k - 1);
    Reverse(A, k, A.Length - 1);
}
```

---

## Matrix Operations

### Spiral Traversal

```csharp
IList<int> SpiralOrder(int[][] M)
{
    var res = new List<int>();
    int top = 0, bottom = M.Length - 1, left = 0, right = M[0].Length - 1;
    while (top <= bottom && left <= right)
    {
        for (int c = left;  c <= right;  c++) res.Add(M[top][c]);   top++;
        for (int r = top;   r <= bottom; r++) res.Add(M[r][right]); right--;
        if (top <= bottom)
            for (int c = right; c >= left; c--) res.Add(M[bottom][c]); bottom--;
        if (left <= right)
            for (int r = bottom; r >= top; r--) res.Add(M[r][left]);  left++;
    }
    return res;
}
```

### Rotate 90° In-Place (transpose + reverse rows)

```csharp
void Rotate90(int[][] M)
{
    int n = M.Length;
    // Transpose
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            (M[i][j], M[j][i]) = (M[j][i], M[i][j]);
    // Reverse each row
    foreach (var row in M)
        Array.Reverse(row);
}
```

# Strings

## Anagram / Palindrome / Compression Patterns

```csharp
// Anagram check: sort or frequency count
bool IsAnagram(string s, string t)
{
    if (s.Length != t.Length) return false;
    int[] freq = new int[26];
    foreach (char c in s) freq[c - 'a']++;
    foreach (char c in t) freq[c - 'a']--;
    return freq.All(x => x == 0);
}

// Palindrome check (two-pointer, ignoring non-alphanumeric)
bool IsPalindrome(string s)
{
    int lo = 0, hi = s.Length - 1;
    while (lo < hi)
    {
        while (lo < hi && !char.IsLetterOrDigit(s[lo])) lo++;
        while (lo < hi && !char.IsLetterOrDigit(s[hi])) hi--;
        if (char.ToLower(s[lo]) != char.ToLower(s[hi])) return false;
        lo++; hi--;
    }
    return true;
}

// Run-length encoding
string Compress(string s)
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
