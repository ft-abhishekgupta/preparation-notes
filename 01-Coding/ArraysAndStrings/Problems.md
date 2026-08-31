# Arrays and Strings — Problems

## Rotate a 2D Square Matrix 90 Degree Clockwise

Given an `n x n` matrix, rotate it by 90 degrees clockwise in-place.

**Example:** `matrix = [[1,2,3],[4,5,6],[7,8,9]]` → `[[7,4,1],[8,5,2],[9,6,3]]`

1. Flip by diagonal : swap `m[i][j], m[j][i]`
2. Reverse each row

```text
EXTRA MATRIX | O(N^2) | O(N^2)

result[c][n - 1 - r] = matrix[r][c]

------------------------------------------------------------------------------------

TRANSPOSE AND REVERSE | O(N^2) | O(1)

// Clockwise = transpose, then reverse every row
// Counter-clockwise = transpose, then reverse the order of the rows

for r = 0 to n - 1:
    for c = r + 1 to n - 1:
        swap(matrix[r][c], matrix[c][r])

for r = 0 to n - 1:
    reverse matrix[r]

------------------------------------------------------------------------------------

FOUR-WAY LAYER SWAP | O(N^2) | O(1)

For each ring, rotate four elements at a time:
top-left -> top-right -> bottom-right -> bottom-left -> top-left
```

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

Given an integer array `nums`, find the contiguous subarray with the largest product and return that product.

**Example:** `nums = [2, 3, -2, 4]` → `6` (`[2, 3]`)

1. Prefix Product and Suffix Product. Reset on 0. Update max

```text
BRUTE FORCE | O(N^2) | O(1)

Calculate the product of every subarray and keep the maximum

------------------------------------------------------------------------------------

TRACK MIN AND MAX | O(N) | O(1)

// A negative number turns the smallest product into the largest one
// A zero resets both running products

maxEnding = nums[0]
minEnding = nums[0]
best = nums[0]

for i = 1 to n - 1:
    x = nums[i]
    if x < 0:
        swap(maxEnding, minEnding)
    maxEnding = max(x, maxEnding * x)
    minEnding = min(x, minEnding * x)
    best = max(best, maxEnding)

return best

------------------------------------------------------------------------------------

PREFIX AND SUFFIX PRODUCTS | O(N) | O(1)

Scan left to right and right to left, resetting the running product to 1 after every zero
The answer is the maximum running product seen in either scan
```

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

## Product of Array Except Self

Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.

**Example:** `nums = [1, 2, 3, 4]` → `[24, 12, 8, 6]`

```text
BRUTE FORCE | O(N^2) | O(1)

For each index, multiply every element except the element at that index

------------------------------------------------------------------------------------

DIVISION | O(N) | O(1)

Calculate the total product, then divide it by each element
This approach requires special handling when nums contains zero

------------------------------------------------------------------------------------

PREFIX AND SUFFIX ARRAYS | O(N) | O(N)

create prefix[n]
create suffix[n]
create answer[n]

prefix[0] = 1

for i from 1 to n - 1:
    prefix[i] = prefix[i - 1] * nums[i - 1]

suffix[n - 1] = 1

for i from n - 2 down to 0:
    suffix[i] = suffix[i + 1] * nums[i + 1]

for i from 0 to n - 1:
    answer[i] = prefix[i] * suffix[i]

return answer

------------------------------------------------------------------------------------

PREFIX AND SUFFIX IN OUTPUT ARRAY | O(N) | O(1)

create answer[n]
prefix = 1
suffix = 1

for i from 0 to n - 1:
    answer[i] = prefix
    prefix *= nums[i]

for i from n - 1 down to 0:
    answer[i] *= suffix
    suffix *= nums[i]

return answer
```

> - Initialize the products to `1`, the multiplicative identity.
> - The required output array does not count toward auxiliary space.

## Majority Element

Given an integer array `nums` of size `n`, return the majority element. The majority element appears more than `n / 2` times.

**Example:** `nums = [2, 2, 1, 1, 1, 2, 2]` → `2`

```text
BRUTE FORCE | O(N^2) | O(1)

For each element, count its frequency and check whether it is greater than n / 2

------------------------------------------------------------------------------------

SORTING | O(N log N) | O(1)

After sorting, the majority element will be at the middle index

------------------------------------------------------------------------------------

HASH MAP | O(N) | O(N)

Count each element in a hash map and return the element whose frequency exceeds n / 2

------------------------------------------------------------------------------------

BOYER-MOORE VOTING ALGORITHM | O(N) | O(1)

// The problem guarantees that a majority element exists

candidate = null
count = 0

for each num:
    if count == 0:
        candidate = num

    if num == candidate:
        count++
    else:
        count--

return candidate
```

> - The majority element survives pairwise cancellation because it appears more often than all other elements combined.
> - For a threshold of `n / 3`, track two candidates and verify their frequencies in a second pass.

## Missing Number

Given an array `nums` containing `n` distinct numbers from the range `[0, n]`, return the only missing number.

**Example:** `nums = [3, 0, 1]` → `2`

```text
BRUTE FORCE | O(N^2) | O(1)

For each number from 0 through n, scan the array to check whether it is present

------------------------------------------------------------------------------------

SUM | O(N) | O(1)

expectedSum = n * (n + 1) / 2
actualSum = sum(nums)
missingNumber = expectedSum - actualSum

return missingNumber

------------------------------------------------------------------------------------

HASHING | O(N) | O(N)

Add all elements to a hash set
Return the number from 0 through n that is not in the set

------------------------------------------------------------------------------------

XOR | O(N) | O(1)

// x ^ x = 0
// x ^ 0 = x

xor = 0
for i from 0 to n:
    xor ^= i

for each num in nums:
    xor ^= num

return xor
```

> The sum formula can overflow for large values of `n`.

## Find All Duplicates in an Array

Given an integer array `nums` of length `n`, where every value is in the range `[1, n]`, return all elements that appear twice.

**Example:** `nums = [4, 3, 2, 7, 8, 2, 3, 1]` → `[2, 3]`

```text
BRUTE FORCE | O(N^2) | O(1)

For each element, scan the remaining array for another occurrence

------------------------------------------------------------------------------------

SORTING | O(N log N) | O(1)

Sort the array and collect equal adjacent elements

------------------------------------------------------------------------------------

HASHING | O(N) | O(N)

Add each element to a hash set
If the element already exists in the set, add it to the result

------------------------------------------------------------------------------------

NEGATIVE MARKING | O(N) | O(1)

result = []

for each num in nums:
    index = abs(num) - 1
    if nums[index] < 0:
        add abs(num) to result
    else:
        nums[index] = -nums[index]

return result
```

> This negative marking can also be used to find the first missing positive integer in an array.

## Find the Duplicate Number

Given an integer array `nums` containing `n + 1` integers in the range `[1, n]`, return the only repeated number. The repeated number may appear more than twice.

**Example:** `nums = [1, 3, 4, 2, 2]` → `2`

```text
BRUTE FORCE | O(N^2) | O(1)

For each element, scan the remaining array for another occurrence

------------------------------------------------------------------------------------

SORTING | O(N log N) | O(1)

Sort the array and return the value shared by two adjacent elements

------------------------------------------------------------------------------------

HASHING | O(N) | O(N)

Add each element to a hash set
Return the first element that already exists in the set

------------------------------------------------------------------------------------

FLOYD'S CYCLE DETECTION | O(N) | O(1)

// Treat each index as a node and nums[index] as its next pointer

slow = nums[0]
fast = nums[0]

while true:
    slow = nums[slow]
    fast = nums[nums[fast]]
    if slow == fast:
        break

slow = nums[0]
while slow != fast:
    slow = nums[slow]
    fast = nums[fast]

return slow

------------------------------------------------------------------------------------

BINARY SEARCH | O(N log N) | O(1)

left = 1
right = n

while left < right:
    mid = left + (right - left) / 2
    count = number of elements <= mid
    if count > mid:
        right = mid
    else:
        left = mid + 1

return left
```

## Maximum Subarray

Given an integer array `nums`, find the contiguous subarray with the largest sum and return that sum.

**Example:** `nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]` → `6` (`[4, -1, 2, 1]`)

```text
BRUTE FORCE | O(N^2) | O(1)

Calculate the sum of every subarray and keep the maximum

------------------------------------------------------------------------------------

PREFIX SUM | O(N) | O(1)

// Best subarray ending at i = prefix[i] - minimum prefix seen before i

prefix = 0
minPrefix = 0
best = -infinity

for each num:
    prefix += num
    best = max(best, prefix - minPrefix)
    minPrefix = min(minPrefix, prefix)

return best

------------------------------------------------------------------------------------

KADANE'S ALGORITHM | O(N) | O(1)

// At each element, either extend the previous subarray or start a new one

current = nums[0]
best = nums[0]

for i from 1 to n - 1:
    current = max(nums[i], current + nums[i])
    best = max(best, current)

return best

------------------------------------------------------------------------------------

DIVIDE AND CONQUER | O(N log N) | O(log N)

The best subarray lies in the left half, the right half, or crosses the middle
```

> - Record the start index whenever `current` restarts to return the subarray itself.
> - Circular version: `max(kadaneMax, totalSum - kadaneMin)`, unless every element is negative.

## Sort Colors

Given an array `nums` with values `0`, `1`, and `2` representing colors, sort them in-place in a single pass.

**Example:** `nums = [2, 0, 2, 1, 1, 0]` → `[0, 0, 1, 1, 2, 2]`

```text
COUNTING SORT | O(N) | O(1)

Count the occurrences of 0, 1, and 2, then overwrite the array (requires two passes)

------------------------------------------------------------------------------------

DUTCH NATIONAL FLAG | O(N) | O(1)

// [0 ... low - 1] = 0, [low ... mid - 1] = 1, [high + 1 ... n - 1] = 2

low = 0
mid = 0
high = n - 1

while mid <= high:
    if nums[mid] == 0:
        swap(nums[low], nums[mid])
        low++
        mid++
    else if nums[mid] == 1:
        mid++
    else:
        swap(nums[mid], nums[high])
        high--
        // Do not advance mid, the swapped-in value is unexamined
```

> The same three-way partition is used by quicksort on arrays with many duplicate keys.

## Next Permutation

Rearrange `nums` into the lexicographically next greater permutation. If no such permutation exists, rearrange it into the smallest (sorted) order.

**Example:** `nums = [1, 2, 3]` → `[1, 3, 2]`; `nums = [3, 2, 1]` → `[1, 2, 3]`

```text
BRUTE FORCE | O(N! * N) | O(N!)

Generate all permutations, sort them, and return the one after nums

------------------------------------------------------------------------------------

PIVOT AND REVERSE | O(N) | O(1)

// The suffix after the pivot is non-increasing, so reversing it makes it the smallest suffix

// Find the rightmost ascent
i = n - 2
while i >= 0 AND nums[i] >= nums[i + 1]:
    i--

if i >= 0:
    // Find the rightmost value greater than the pivot
    j = n - 1
    while nums[j] <= nums[i]:
        j--
    swap(nums[i], nums[j])

reverse nums from i + 1 to n - 1
```

> Previous permutation: mirror the logic by searching for the rightmost descent.

## Spiral Matrix

Given an `m x n` matrix, return all its elements in spiral order.

**Example:** `matrix = [[1,2,3],[4,5,6],[7,8,9]]` → `[1,2,3,6,9,8,7,4,5]`

```text
BOUNDARY SHRINKING | O(M * N) | O(1)

top = 0
bottom = rows - 1
left = 0
right = cols - 1
result = []

while top <= bottom AND left <= right:
    for c = left to right:
        add matrix[top][c]
    top++

    for r = top to bottom:
        add matrix[r][right]
    right--

    if top <= bottom:
        for c = right down to left:
            add matrix[bottom][c]
        bottom--

    if left <= right:
        for r = bottom down to top:
            add matrix[r][left]
        left++

return result
```

> The two inner guards are required for single-row and single-column strips, otherwise elements are added twice.

## Set Matrix Zeroes

If an element in an `m x n` matrix is `0`, set its entire row and column to `0`, in-place.

**Example:** `matrix = [[1,1,1],[1,0,1],[1,1,1]]` → `[[1,0,1],[0,0,0],[1,0,1]]`

```text
BRUTE FORCE | O((M * N) * (M + N)) | O(1)

Mark rows and columns with a sentinel value while scanning, then replace sentinels with 0

------------------------------------------------------------------------------------

MARKER ARRAYS | O(M * N) | O(M + N)

Record which rows and columns contain a zero, then zero them in a second pass

------------------------------------------------------------------------------------

FIRST ROW AND COLUMN AS MARKERS | O(M * N) | O(1)

firstRowHasZero = row 0 contains a zero
firstColHasZero = column 0 contains a zero

for r = 1 to rows - 1:
    for c = 1 to cols - 1:
        if matrix[r][c] == 0:
            matrix[r][0] = 0
            matrix[0][c] = 0

for r = 1 to rows - 1:
    for c = 1 to cols - 1:
        if matrix[r][0] == 0 OR matrix[0][c] == 0:
            matrix[r][c] = 0

if firstRowHasZero:
    zero out row 0
if firstColHasZero:
    zero out column 0
```

## Palindromic Substrings

Given a string s, return the number of palindromic substrings in it.

**Example:** `s = "aaa"` → `6`

```text
BRUTE FORCE | O(N^3) | O(1)

Check all substrings and see if they are palindromes

-----------------------------------------------------------------------------

BRUTE FORCE + DP | O(N^2) | O(N^2)

// A substring s[i..j] is a palindrome if s[i] == s[j] and s[i+1..j-1] is a palindrome
// dp[i][j] = s[i] == s[j] AND dp[i+1][j-1]

create dp[n][n]
count = 0
for i = 0 to n - 1
    dp[i][i] = true
    count++
for length = 2 to n
    for i = 0 to n - length
        j = i + length - 1
        if s[i] == s[j]
            if length == 2
                dp[i][j] = true
            else
                dp[i][j] = dp[i+1][j-1]
        if dp[i][j]
            count++
return count

-----------------------------------------------------------------------------

EXPAND AROUND CENTER | O(N^2) | O(1)

// Consider each character and each pair of characters as a potential center of a palindrome and expand outwards

count = 0
for center = 0 to n - 1
    # Odd-length palindromes
    left = center
    right = center
    while left >= 0
          and right < n
          and s[left] == s[right]
        count++
        left--
        right++
    # Even-length palindromes
    left = center
    right = center + 1
    while left >= 0
          and right < n
          and s[left] == s[right]
        count++
        left--
        right++
return count
```

## Longest Palindromic Substring

Given a string s, return the longest palindromic substring in s.

**Example:** `s = "babad"` → `"bab"` ("aba" also valid)

```text
BRUTE FORCE | O(N^3) | O(1)

Check every substring and see if it is a palindrome, find maximum length

-----------------------------------------------------------------------------

BRUTE FORCE + DP | O(N^2) | O(N^2)

// Same as above, but keep track of the longest palindrome found

-----------------------------------------------------------------------------

EXPAND AROUND CENTER | O(N^2) | O(1)

// Same as above, but keep track of the longest palindrome found

bestStart = 0
bestLength = 0
for i = 0 to n - 1
    # Odd-length palindrome
    length1 = expandAroundCenter(i, i)
    if length1 > bestLength
        update bestStart
        update bestLength
    # Even-length palindrome
    length2 = expandAroundCenter(i, i + 1)
    if length2 > bestLength
        update bestStart
        update bestLength
return substring(bestStart, bestLength)

expandAroundCenter(left, right)
    while left >= 0
          and right < n
          and s[left] == s[right]
        left--
        right++
    return:
        start = left + 1
        length = right - left - 1

------------------------------------------------------------------------------

MANACHER'S ALGORITHM | O(N) | O(N)

// Reuses previously computed palindromic substrings to avoid redundant checks. Implementation is complex and requires transforming the string to handle even-length palindromes uniformly.
```

## Encode and Decode Strings

Design an algorithm to encode a list of strings into a single string and then decode that string back into the original list.

**Example:** `["neet","code","love","you"]` → encode → decode → `["neet","code","love","you"]`

```text
LENGTH PREFIX | O(N) | O(N)
Encode each string as: length + delimiter + string
```

## Longest common prefix

Given an array of strings, find the longest common prefix shared by all strings.

**Example:** `strs = ["flower","flow","flight"]` → `"fl"`

```text
BRUTE FORCE | O(N * M * M) N: Number of Strings, M: Length of the Shortest String | O(1)

Generate all prefixes of the shortest string and check whether they are prefixes of all other strings

-----------------------------------------------------------------------------

SORTING | O(M * N log N) | O(1)

Sort all the strings and compare the first and last strings in the sorted order to find the common prefix

-----------------------------------------------------------------------------

HORIZONTAL SCANNING | O(N * M) | O(1)

// Take the first string as the initial prefix and compare it with each subsequent string, updating the prefix

if strings is empty
    return ""
prefix = strings[0]
for i = 1 to numberOfStrings - 1
    prefix = commonPrefix(prefix, strings[i])
    if prefix is empty
        return ""
return prefix

-----------------------------------------------------------------------------

VERTICAL SCANNING | O(N * M) | O(1)

// Compare characters of all strings at each index until a mismatch is found

if strings is empty
    return ""
for i = 0 to length(strings[0]) - 1
    c = strings[0][i]
    for j = 1 to numberOfStrings - 1
        if i >= length(strings[j])
           or strings[j][i] != c
            return strings[0][0...i-1]
return strings[0]

-----------------------------------------------------------------------------

DIVIDE AND CONQUER | O(N * M) | O(log N)

LCP(strings, left, right)
    if left == right
        return strings[left]
    mid = (left + right) / 2
    leftPrefix = LCP(strings, left, mid)
    rightPrefix = LCP(strings, mid + 1, right)
    return commonPrefix(leftPrefix, rightPrefix)
```

> This problem can also be solved using a Trie data structure and Binary Search, but it is not as efficient as the above methods.

## String to integer (atoi)

Implement a function that converts a string into a 32-bit signed integer. Ignore non digit characters and handle overflow.

**Example:** `s = "   -42"` → `-42`

```text
BRUTE FORCE | O(N) | O(1)

remove leading whitespace
if next character is '+' or '-'
    record sign
    move forward
read consecutive digits
if no digits were found
    return 0
convert digit sequence to integer
if value exceeds INT_MAX
    return INT_MAX
if negative value exceeds INT_MIN
    return INT_MIN
return signed value

// But this method does not handle overflow correctly during conversion, so it is better to check for overflow while reading digits.

------------------------------------------------------------------------------

READ DIGITS | O(N) | O(1)

skip leading whitespace
determine sign
if sign is positive
    limit = 2147483647
else
    limit = 2147483648
result = 0
while current character is a digit
    digit = current digit
    if result > limit / 10     // Overflow check
        return sign * limit
    if result == limit / 10 AND digit > limit % 10
        return sign * limit
    result = result * 10 + digit
    move to next character
return sign * result
```

## Multiply Strings

Given two non-negative long integers represented as strings, return their product, also represented as a string.

**Example:** `num1 = "123", num2 = "456"` → `"56088"`

```text
REPEATED ADDITION | O(value(num2) * N) | O(N)

Add num1 to itself num2 times. The cost grows with the value, not the number of digits, so it is exponential in the input length.

------------------------------------------------------------------------------

SCHOOL METHOD | O(N * M) | O(N + M)

// Result has max n+m digits.

if num1 == "0" or num2 == "0"
    return "0"
n = length(num1)
m = length(num2)
create result array of size n + m
initialized to 0
for i = n - 1 down to 0
    for j = m - 1 down to 0
        digit1 = numeric value of num1[i]
        digit2 = numeric value of num2[j]
        product = digit1 * digit2
        positionLow = i + j + 1
        positionHigh = i + j
        sum = result[positionLow] + product
        result[positionLow] = sum % 10
        result[positionHigh] += sum / 10

skip leading zeros in result
return result as a string

// The carry is added into positionHigh, which is processed later, so it can never be lost

------------------------------------------------------------------------------

KARATSUBA | O(N^log2(3)) | O(N)

// Split the numbers into halves and recursively compute products of the halves, combining them to get the final product. This is more efficient for very large numbers.

------------------------------------------------------------------------------

FFT | O(N log N) | O(N)

// Use Fast Fourier Transform to multiply polynomials represented by the digit sequences of the numbers. This is efficient for extremely large numbers.
```
