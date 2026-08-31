# Arrays and Strings — Problems

| # | Problem | LeetCode | Pattern | Difficulty |
| - | ------- | -------- | ------- | ---------- |
| 1 | Maximum Subarray | 53 | Kadane | Easy |
| 2 | Max Product Subarray | 152 | Kadane (min/max) | Medium |
| 3 | Product of Array Except Self | 238 | Prefix/suffix product | Medium |
| 4 | Majority Element | 169 | Boyer-Moore voting | Easy |
| 5 | Missing Number | 268 | XOR / sum | Easy |
| 6 | Find All Duplicates in an Array | 442 | In-place negation | Medium |
| 7 | Find the Duplicate Number | 287 | Floyd cycle / binary search | Medium |
| 8 | Sort Colors | 75 | Dutch national flag | Medium |
| 9 | Next Permutation | 31 | Rightmost ascent | Medium |
| 10 | Spiral Matrix | 54 | Boundary shrinking | Medium |
| 11 | Rotate Image | 48 | Transpose + reverse | Medium |
| 12 | Set Matrix Zeroes | 73 | In-place markers | Medium |
| 13 | Palindromic Substrings | 647 | Expand-around-centre | Medium |
| 14 | Longest Palindromic Substring | 5 | Expand-around-centre | Medium |
| 15 | Encode and Decode Strings | 271 | Length-prefix encoding | Medium |
| 16 | Longest Common Prefix | 14 | Vertical scan | Easy |
| 17 | String to Integer (atoi) | 8 | Digit-by-digit parse | Medium |
| 18 | Multiply Strings | 43 | Grade-school multiplication | Medium |

---

## Kadane and Subarrays

### Maximum Subarray — LeetCode 53

Given an integer array `nums`, find the contiguous subarray with the largest sum and return that sum.

**Example:** `nums = [-2,1,-3,4,-1,2,1,-5,4]` → `6` (subarray `[4,-1,2,1]`)

```text
BRUTE FORCE | O(n²) | O(1)

Calculate the sum of every subarray and keep the maximum.

------------------------------------------------------------------------------

PREFIX SUM | O(n) | O(1)

// Best subarray ending at i = prefix[i] − minimum prefix seen before i
prefix = 0, minPrefix = 0, best = -∞
for each num:
    prefix += num
    best = max(best, prefix − minPrefix)
    minPrefix = min(minPrefix, prefix)

------------------------------------------------------------------------------

OPTIMAL — KADANE'S ALGORITHM | O(n) | O(1)

// At each element: either extend the running subarray or start fresh
current = nums[0], best = nums[0]
for i from 1 to n-1:
    current = max(nums[i], current + nums[i])
    best = max(best, current)

------------------------------------------------------------------------------

DIVIDE AND CONQUER | O(n log n) | O(log n)

Best subarray lies entirely in left half, right half, or crosses the midpoint.
```

```csharp
public int MaxSubArray(int[] nums)
{
    int best = nums[0], cur = nums[0];
    for (int i = 1; i < nums.Length; i++)
    {
        cur  = Math.Max(nums[i], cur + nums[i]);
        best = Math.Max(best, cur);
    }
    return best;
}
```

> **Key insight:** `cur` is the best subarray sum ending exactly at the current index; restart when the running sum goes negative.

---

### Max Product Subarray — LeetCode 152

Given an integer array `nums`, find the contiguous subarray with the largest product and return that product.

**Example:** `nums = [2,3,-2,4]` → `6` (subarray `[2,3]`)

```text
BRUTE FORCE | O(n²) | O(1)

Calculate the product of every subarray and keep the maximum.

------------------------------------------------------------------------------

OPTIMAL — TRACK MIN AND MAX | O(n) | O(1)

// A negative number flips the smallest product to the largest.
// Reset on zero by restarting from the current element.

maxP = nums[0], minP = nums[0], best = nums[0]
for i from 1 to n-1:
    x = nums[i]
    if x < 0: swap(maxP, minP)
    maxP = max(x, maxP * x)
    minP = min(x, minP * x)
    best = max(best, maxP)
```

```csharp
public int MaxProduct(int[] nums)
{
    int best = nums[0], maxP = nums[0], minP = nums[0];
    for (int i = 1; i < nums.Length; i++)
    {
        if (nums[i] < 0) (maxP, minP) = (minP, maxP);
        maxP = Math.Max(nums[i], maxP * nums[i]);
        minP = Math.Min(nums[i], minP * nums[i]);
        best = Math.Max(best, maxP);
    }
    return best;
}
```

> **Key insight:** track both the running maximum and minimum — a negative value can turn the current minimum into the next maximum.

---

## Prefix / Suffix Products

### Product of Array Except Self — LeetCode 238

Given an integer array `nums`, return an array `answer` where `answer[i]` is the product of all elements except `nums[i]`. Solve without division in O(n).

**Example:** `nums = [1,2,3,4]` → `[24,12,8,6]`

```text
BRUTE FORCE | O(n²) | O(1)

For each index, multiply every other element.

------------------------------------------------------------------------------

PREFIX + SUFFIX ARRAYS | O(n) | O(n)

Build prefix[i] = product of nums[0..i-1] and suffix[i] = product of nums[i+1..n-1].
answer[i] = prefix[i] * suffix[i].

------------------------------------------------------------------------------

OPTIMAL — PREFIX + SUFFIX IN OUTPUT ARRAY | O(n) | O(1)

// Pass 1: answer[i] = product of all elements to the left of i
// Pass 2: multiply in the running right product

answer[i] = 1 for all i
prefix = 1
for i from 0 to n-1:
    answer[i] = prefix
    prefix *= nums[i]

suffix = 1
for i from n-1 down to 0:
    answer[i] *= suffix
    suffix *= nums[i]
```

```csharp
public int[] ProductExceptSelf(int[] nums)
{
    int n = nums.Length;
    int[] answer = new int[n];
    answer[0] = 1;
    for (int i = 1; i < n; i++)
        answer[i] = answer[i - 1] * nums[i - 1];

    int suffix = 1;
    for (int i = n - 1; i >= 0; i--)
    {
        answer[i] *= suffix;
        suffix *= nums[i];
    }
    return answer;
}
```

> **Key insight:** the output array is not counted as auxiliary space; use it to accumulate left products, then multiply in right products with a single suffix variable.

---

## In-Place Index Marking

### Majority Element — LeetCode 169

Given an array of size `n`, return the element that appears more than `n/2` times (guaranteed to exist).

**Example:** `nums = [2,2,1,1,1,2,2]` → `2`

```text
BRUTE FORCE | O(n²) | O(1)

For each element count its frequency.

------------------------------------------------------------------------------

SORTING | O(n log n) | O(1)

The majority element always occupies the middle index after sorting.

------------------------------------------------------------------------------

HASH MAP | O(n) | O(n)

Count frequencies; return element with count > n/2.

------------------------------------------------------------------------------

OPTIMAL — BOYER-MOORE VOTING | O(n) | O(1)

candidate = null, count = 0
for each num:
    if count == 0: candidate = num
    count += (num == candidate) ? 1 : -1
return candidate
```

```csharp
public int MajorityElement(int[] nums)
{
    int candidate = nums[0], count = 1;
    for (int i = 1; i < nums.Length; i++)
    {
        if (count == 0) candidate = nums[i];
        count += nums[i] == candidate ? 1 : -1;
    }
    return candidate;
}
```

> **Key insight:** the majority element survives all pairwise cancellations because it appears more than all others combined.

---

### Missing Number — LeetCode 268

Given an array `nums` with `n` distinct numbers from `[0, n]`, return the missing number.

**Example:** `nums = [3,0,1]` → `2`

```text
BRUTE FORCE | O(n²) | O(1)

For each number 0..n, scan the array.

------------------------------------------------------------------------------

HASH SET | O(n) | O(n)

Add all elements; scan 0..n for the absent one.

------------------------------------------------------------------------------

SUM FORMULA | O(n) | O(1)

missing = n*(n+1)/2 − sum(nums)
⚠ Use long for large n to avoid overflow.

------------------------------------------------------------------------------

OPTIMAL — XOR | O(n) | O(1)

// x ^ x = 0, x ^ 0 = x → XOR all indices 0..n with all values cancels pairs
xor = 0
for i from 0 to n: xor ^= i
for each num: xor ^= num
return xor
```

```csharp
public int MissingNumber(int[] nums)
{
    int xor = nums.Length;
    for (int i = 0; i < nums.Length; i++)
        xor ^= i ^ nums[i];
    return xor;
}
```

> **Key insight:** XOR-ing every index with every value leaves only the unpaired index (the missing number).

---

### Find All Duplicates in an Array — LeetCode 442

Given `nums` of length `n` with values in `[1, n]`, return all elements that appear twice.

**Example:** `nums = [4,3,2,7,8,2,3,1]` → `[2,3]`

```text
BRUTE FORCE | O(n²) | O(1)

For each element scan the rest for a duplicate.

------------------------------------------------------------------------------

HASH SET | O(n) | O(n)

Add each element; collect those already present.

------------------------------------------------------------------------------

OPTIMAL — IN-PLACE NEGATION | O(n) | O(1)

// Value v maps to index v-1. Negate nums[v-1] to mark v as seen.
// If nums[v-1] is already negative, v is a duplicate.

result = []
for each num in nums:
    idx = abs(num) - 1
    if nums[idx] < 0: add abs(num) to result
    else: nums[idx] = -nums[idx]
return result
```

```csharp
public IList<int> FindDuplicates(int[] nums)
{
    var result = new List<int>();
    foreach (int num in nums)
    {
        int idx = Math.Abs(num) - 1;
        if (nums[idx] < 0)
            result.Add(Math.Abs(num));
        else
            nums[idx] = -nums[idx];
    }
    return result;
}
```

> **Key insight:** use the sign of `nums[v-1]` as a visited flag — values in `[1..n]` let every value index into the array directly.

---

### Find the Duplicate Number — LeetCode 287

Given `nums` of length `n+1` with values in `[1, n]`, return the one repeated number. Must not modify the array and use O(1) space.

**Example:** `nums = [1,3,4,2,2]` → `2`

```text
BRUTE FORCE | O(n²) | O(1)

For each element scan the rest.

------------------------------------------------------------------------------

SORTING | O(n log n) | O(1)

Sort; return value shared by adjacent elements.

------------------------------------------------------------------------------

BINARY SEARCH ON VALUE | O(n log n) | O(1)

// Count elements ≤ mid; if count > mid then duplicate is in [1..mid]
left = 1, right = n
while left < right:
    mid = left + (right - left) / 2
    count = |{x in nums : x ≤ mid}|
    if count > mid: right = mid
    else: left = mid + 1

------------------------------------------------------------------------------

OPTIMAL — FLOYD'S CYCLE DETECTION | O(n) | O(1)

// Treat index as a node, nums[index] as the next pointer.
// A duplicate creates a cycle; Floyd finds the cycle entrance.

slow = fast = nums[0]
repeat:
    slow = nums[slow]; fast = nums[nums[fast]]
until slow == fast

slow = nums[0]
while slow != fast:
    slow = nums[slow]; fast = nums[fast]
return slow
```

```csharp
public int FindDuplicate(int[] nums)
{
    int slow = nums[0], fast = nums[0];
    do
    {
        slow = nums[slow];
        fast = nums[nums[fast]];
    } while (slow != fast);

    slow = nums[0];
    while (slow != fast)
    {
        slow = nums[slow];
        fast = nums[fast];
    }
    return slow;
}
```

> **Key insight:** duplicate values make two indices point to the same next node, forming a cycle; Floyd's algorithm finds the cycle entrance which equals the duplicate.

---

## Matrix

### Sort Colors — LeetCode 75

Given `nums` with values `0`, `1`, `2`, sort in-place in one pass.

**Example:** `nums = [2,0,2,1,1,0]` → `[0,0,1,1,2,2]`

```text
COUNTING SORT | O(n) | O(1)

Count 0s, 1s, 2s; overwrite in two passes.

------------------------------------------------------------------------------

OPTIMAL — DUTCH NATIONAL FLAG | O(n) | O(1)

// Invariant: [0..lo) = 0, [lo..mid) = 1, (hi..n) = 2
lo = 0, mid = 0, hi = n-1
while mid <= hi:
    if nums[mid] == 0: swap(lo, mid); lo++; mid++
    elif nums[mid] == 1: mid++
    else: swap(mid, hi); hi--   // do NOT advance mid
```

```csharp
public void SortColors(int[] nums)
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
        }
    }
}
```

> **Key insight:** do not advance `mid` after swapping with `hi` — the swapped-in value has not been examined yet.

---

### Spiral Matrix — LeetCode 54

Given an `m × n` matrix, return all elements in spiral order.

**Example:** `matrix = [[1,2,3],[4,5,6],[7,8,9]]` → `[1,2,3,6,9,8,7,4,5]`

```text
OPTIMAL — BOUNDARY SHRINKING | O(m·n) | O(1)

top=0, bottom=rows-1, left=0, right=cols-1
while top ≤ bottom AND left ≤ right:
    traverse top row left→right; top++
    traverse right col top→bottom; right--
    if top ≤ bottom: traverse bottom row right→left; bottom--
    if left ≤ right: traverse left col bottom→top; left++
```

```csharp
public IList<int> SpiralOrder(int[][] matrix)
{
    var res = new List<int>();
    int top = 0, bottom = matrix.Length - 1;
    int left = 0, right = matrix[0].Length - 1;

    while (top <= bottom && left <= right)
    {
        for (int c = left; c <= right; c++)
            res.Add(matrix[top][c]);
        top++;

        for (int r = top; r <= bottom; r++)
            res.Add(matrix[r][right]);
        right--;

        if (top <= bottom)
        {
            for (int c = right; c >= left; c--)
                res.Add(matrix[bottom][c]);
            bottom--;
        }

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

> **Key insight:** the inner guards (`if top ≤ bottom` / `if left ≤ right`) prevent double-counting when the spiral collapses to a single row or column.

---

### Rotate Image — LeetCode 48

Given an `n × n` matrix, rotate it 90° clockwise in-place.

**Example:** `matrix = [[1,2,3],[4,5,6],[7,8,9]]` → `[[7,4,1],[8,5,2],[9,6,3]]`

```text
EXTRA MATRIX | O(n²) | O(n²)

result[c][n-1-r] = matrix[r][c]

------------------------------------------------------------------------------

OPTIMAL — TRANSPOSE + REVERSE ROWS | O(n²) | O(1)

// Clockwise 90° = transpose, then reverse each row
// Counter-clockwise 90° = transpose, then reverse the row order

for r = 0 to n-1:
    for c = r+1 to n-1:
        swap(matrix[r][c], matrix[c][r])
for r = 0 to n-1:
    reverse matrix[r]
```

```csharp
public void Rotate(int[][] matrix)
{
    int n = matrix.Length;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            (matrix[i][j], matrix[j][i]) = (matrix[j][i], matrix[i][j]);

    foreach (var row in matrix)
        Array.Reverse(row);
}
```

> **Key insight:** clockwise rotation maps `(r, c) → (c, n-1-r)`; transpose gets the row/column swap right, then reversing each row handles the negation.

---

### Set Matrix Zeroes — LeetCode 73

If any element of an `m × n` matrix is `0`, set its entire row and column to `0` in-place.

**Example:** `matrix = [[1,1,1],[1,0,1],[1,1,1]]` → `[[1,0,1],[0,0,0],[1,0,1]]`

```text
BRUTE FORCE | O((m·n)·(m+n)) | O(1)

Use a sentinel value; replace in a second pass.

------------------------------------------------------------------------------

MARKER ARRAYS | O(m·n) | O(m+n)

Record which rows and columns contain a zero; zero them in a second pass.

------------------------------------------------------------------------------

OPTIMAL — FIRST ROW AND COLUMN AS MARKERS | O(m·n) | O(1)

// Use matrix[0][c] and matrix[r][0] as flags (save their own zero status first)

firstRowZero = any matrix[0][c] == 0
firstColZero = any matrix[r][0] == 0

for r=1..rows-1, c=1..cols-1:
    if matrix[r][c] == 0: matrix[r][0]=0; matrix[0][c]=0

for r=1..rows-1, c=1..cols-1:
    if matrix[r][0]==0 OR matrix[0][c]==0: matrix[r][c]=0

if firstRowZero: zero row 0
if firstColZero: zero col 0
```

```csharp
public void SetZeroes(int[][] matrix)
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

> **Key insight:** the first row and column can serve as marker arrays themselves — but save whether they originally contain zeroes before using them as markers.

---

## String Manipulation

### Next Permutation — LeetCode 31

Rearrange `nums` into the lexicographically next greater permutation in-place. If none exists, produce the smallest permutation.

**Example:** `[1,2,3]` → `[1,3,2]`; `[3,2,1]` → `[1,2,3]`

```text
BRUTE FORCE | O(n! · n) | O(n!)

Generate all permutations, sort, return the successor.

------------------------------------------------------------------------------

OPTIMAL — PIVOT AND REVERSE | O(n) | O(1)

// The suffix after the pivot is non-increasing; reversing it gives the smallest suffix.

1. Find rightmost i where nums[i] < nums[i+1]  (the "pivot")
2. If found: find rightmost j where nums[j] > nums[i]; swap i,j
3. Reverse nums[i+1 .. n-1]
```

```csharp
public void NextPermutation(int[] nums)
{
    int n = nums.Length, i = n - 2;
    while (i >= 0 && nums[i] >= nums[i + 1]) i--;

    if (i >= 0)
    {
        int j = n - 1;
        while (nums[j] <= nums[i]) j--;
        (nums[i], nums[j]) = (nums[j], nums[i]);
    }

    int lo = i + 1, hi = n - 1;
    while (lo < hi) { (nums[lo], nums[hi]) = (nums[hi], nums[lo]); lo++; hi--; }
}
```

> **Key insight:** the suffix to the right of the pivot is always non-increasing; swapping the pivot with the next-larger element and reversing the suffix produces the minimal valid increment.

---

### Palindromic Substrings — LeetCode 647

Count all palindromic substrings in `s`.

**Example:** `s = "aaa"` → `6` (`"a","a","a","aa","aa","aaa"`)

```text
BRUTE FORCE | O(n³) | O(1)

Check every substring for palindromicity.

------------------------------------------------------------------------------

DP | O(n²) | O(n²)

dp[i][j] = true if s[i..j] is a palindrome (s[i]==s[j] AND dp[i+1][j-1]).

------------------------------------------------------------------------------

OPTIMAL — EXPAND AROUND CENTRE | O(n²) | O(1)

For each of the 2n-1 centres (characters and gaps):
    expand while s[left] == s[right]; count++
```

```csharp
public int CountSubstrings(string s)
{
    int count = 0;
    for (int center = 0; center < s.Length; center++)
    {
        // Odd-length
        for (int l = center, r = center; l >= 0 && r < s.Length && s[l] == s[r]; l--, r++)
            count++;
        // Even-length
        for (int l = center, r = center + 1; l >= 0 && r < s.Length && s[l] == s[r]; l--, r++)
            count++;
    }
    return count;
}
```

> **Key insight:** see [expand-around-centre](../TriesAndStringMatching/TriesAndStringMatching.md) for the full technique; O(n) is achievable with Manacher's algorithm.

---

### Longest Palindromic Substring — LeetCode 5

Return the longest palindromic substring of `s`.

**Example:** `s = "babad"` → `"bab"` (or `"aba"`)

```text
BRUTE FORCE | O(n³) | O(1)

Check every substring.

------------------------------------------------------------------------------

DP | O(n²) | O(n²)

Same dp[i][j] table; track longest true entry.

------------------------------------------------------------------------------

OPTIMAL — EXPAND AROUND CENTRE | O(n²) | O(1)

For each of the 2n-1 centres expand outward; track best start and length.

------------------------------------------------------------------------------

MANACHER'S ALGORITHM | O(n) | O(n)

Reuses computed palindrome radii; handles even/odd uniformly via transformed string.
```

```csharp
public string LongestPalindrome(string s)
{
    int start = 0, maxLen = 1;

    void Expand(int l, int r)
    {
        while (l >= 0 && r < s.Length && s[l] == s[r]) { l--; r++; }
        int len = r - l - 1;
        if (len > maxLen) { maxLen = len; start = l + 1; }
    }

    for (int i = 0; i < s.Length; i++)
    {
        Expand(i, i);       // odd
        Expand(i, i + 1);   // even
    }
    return s.Substring(start, maxLen);
}
```

> **Key insight:** see [expand-around-centre](../TriesAndStringMatching/TriesAndStringMatching.md) for the full derivation; the O(n) Manacher algorithm is only needed in interviews explicitly asking for linear time.

---

### Encode and Decode Strings — LeetCode 271

Design encode/decode so a list of strings survives a round-trip through a single string. Each string may contain any character.

**Example:** `["neet","code","love","you"]` → encode → decode → `["neet","code","love","you"]`

```text
OPTIMAL — LENGTH PREFIX | O(n) encode, O(n) decode | O(n)

Encode each string as: <length>#<string>
Decoder reads the length, skips '#', reads exactly that many characters.
```

```csharp
public string Encode(IList<string> strs)
{
    var sb = new StringBuilder();
    foreach (var s in strs)
        sb.Append(s.Length).Append('#').Append(s);
    return sb.ToString();
}

public IList<string> Decode(string s)
{
    var result = new List<string>();
    int i = 0;
    while (i < s.Length)
    {
        int j = s.IndexOf('#', i);
        int len = int.Parse(s.Substring(i, j - i));
        result.Add(s.Substring(j + 1, len));
        i = j + 1 + len;
    }
    return result;
}
```

> **Key insight:** length-prefix encoding handles any character including delimiters — no escaping needed.

---

### Longest Common Prefix — LeetCode 14

Find the longest string that is a prefix of all strings in `strs`.

**Example:** `strs = ["flower","flow","flight"]` → `"fl"`

```text
BRUTE FORCE | O(n·m²) | O(1)

Generate all prefixes of the shortest string and check all others.

------------------------------------------------------------------------------

HORIZONTAL SCANNING | O(n·m) | O(1)

Take strs[0] as the prefix; compare with each successive string, trimming until it matches.

------------------------------------------------------------------------------

OPTIMAL — VERTICAL SCANNING | O(n·m) | O(1)

// Stop at the first column where any string differs or is exhausted
for i = 0 to len(strs[0])-1:
    c = strs[0][i]
    for j = 1 to n-1:
        if i >= len(strs[j]) OR strs[j][i] != c:
            return strs[0][0..i-1]
return strs[0]
```

```csharp
public string LongestCommonPrefix(string[] strs)
{
    if (strs.Length == 0) return "";
    for (int i = 0; i < strs[0].Length; i++)
    {
        char c = strs[0][i];
        for (int j = 1; j < strs.Length; j++)
            if (i >= strs[j].Length || strs[j][i] != c)
                return strs[0].Substring(0, i);
    }
    return strs[0];
}
```

> **Key insight:** vertical scanning short-circuits as soon as a mismatch is found, without building any intermediate strings.

---

### String to Integer (atoi) — LeetCode 8

Convert a string to a 32-bit signed integer, ignoring leading whitespace, handling optional sign, stopping at non-digit characters, and clamping to `[INT_MIN, INT_MAX]`.

**Example:** `s = "   -42"` → `-42`; `s = "4193 with words"` → `4193`

```text
OPTIMAL — READ DIGITS WITH OVERFLOW GUARD | O(n) | O(1)

skip leading spaces
read optional '+'/'-'; record sign
while current char is a digit:
    digit = s[i] - '0'
    if result > INT_MAX/10 OR (result == INT_MAX/10 AND digit > INT_MAX%10):
        return sign > 0 ? INT_MAX : INT_MIN
    result = result * 10 + digit
return sign * result
```

```csharp
public int MyAtoi(string s)
{
    int i = 0, n = s.Length;
    while (i < n && s[i] == ' ') i++;
    if (i == n) return 0;

    int sign = 1;
    if (s[i] == '+' || s[i] == '-')
    {
        if (s[i] == '-') sign = -1;
        i++;
    }

    int result = 0;
    while (i < n && char.IsDigit(s[i]))
    {
        int digit = s[i] - '0';
        if (result > (int.MaxValue - digit) / 10)
            return sign == 1 ? int.MaxValue : int.MinValue;
        result = result * 10 + digit;
        i++;
    }
    return sign * result;
}
```

> **Key insight:** check overflow **before** multiplying — `result > (INT_MAX - digit) / 10` avoids the overflow itself.

---

### Multiply Strings — LeetCode 43

Given two non-negative integers as strings `num1` and `num2`, return their product as a string. Do not use built-in big-integer libraries.

**Example:** `num1 = "123", num2 = "456"` → `"56088"`

```text
REPEATED ADDITION | O(value(num2) · n) | O(n)

Exponential in digit count — impractical.

------------------------------------------------------------------------------

OPTIMAL — GRADE-SCHOOL MULTIPLICATION | O(n·m) | O(n+m)

// Product has at most n+m digits.
// nums1[i] * nums2[j] contributes to positions i+j (high) and i+j+1 (low).

result[n+m] = all zeros
for i = n-1 down to 0:
    for j = m-1 down to 0:
        product = digit(num1[i]) * digit(num2[j])
        posLow  = i + j + 1
        posHigh = i + j
        sum = result[posLow] + product
        result[posLow]  = sum % 10
        result[posHigh] += sum / 10
skip leading zeros; build string
```

```csharp
public string Multiply(string num1, string num2)
{
    if (num1 == "0" || num2 == "0") return "0";
    int n = num1.Length, m = num2.Length;
    int[] pos = new int[n + m];

    for (int i = n - 1; i >= 0; i--)
    {
        for (int j = m - 1; j >= 0; j--)
        {
            int product = (num1[i] - '0') * (num2[j] - '0');
            int posLow  = i + j + 1;
            int posHigh = i + j;
            int sum = pos[posLow] + product;
            pos[posLow]  = sum % 10;
            pos[posHigh] += sum / 10;
        }
    }

    var sb = new StringBuilder();
    foreach (int d in pos)
        if (!(sb.Length == 0 && d == 0)) sb.Append(d);
    return sb.ToString();
}
```

> **Key insight:** store partial products in a positional array indexed by `i+j` and `i+j+1`; carry propagates naturally because each position is processed from right to left.
