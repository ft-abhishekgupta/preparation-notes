# Two Pointers and Sliding Window

## Opposite-Ends Two Pointers Template

```csharp
// Pre-condition: array sorted or monotonic structure
int lo = 0, hi = A.Length - 1;
while (lo < hi)
{
    int sum = A[lo] + A[hi];
    if (sum == target)      { /* record; move both */ lo++; hi--; }
    else if (sum < target)  { lo++; }
    else                    { hi--; }
}
```

## Fixed Sliding Window Template

```csharp
// Sum of every window of size k
int windowSum = 0;
for (int i = 0; i < k; i++) windowSum += A[i];
int maxSum = windowSum;
for (int i = k; i < A.Length; i++)
{
    windowSum += A[i] - A[i - k];   // add new, drop old
    maxSum = Math.Max(maxSum, windowSum);
}
```

## Variable Sliding Window Template

```csharp
// Longest subarray satisfying a condition
var window = new Dictionary<char, int>();
int slow = 0, best = 0;
for (int fast = 0; fast < s.Length; fast++)
{
    // 1. Expand: add s[fast] to window
    window[s[fast]] = window.GetValueOrDefault(s[fast]) + 1;

    // 2. Shrink: while window violates constraint, advance slow
    while (/* window invalid */)
    {
        window[s[slow]]--;
        if (window[s[slow]] == 0) window.Remove(s[slow]);
        slow++;
    }

    // 3. Update answer (window is always valid here)
    best = Math.Max(best, fast - slow + 1);
}
return best;
```

> `count(exactly K) = count(at most K) - count(at most K-1)`
