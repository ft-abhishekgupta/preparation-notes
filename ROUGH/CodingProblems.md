# Coding Problems

## Arrays

### 1. Product of Array Except Self

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

### 2. Majority Element

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

### 3. Missing Number

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

### 4. Find All Duplicates in an Array

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

### 5. Find the Duplicate Number

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

## Binary Search

Pattern for exact, min valid, max valid, and first/last occurrence problems.

### 1. Binary Search

Given a sorted array of integers and a target value, return the index of the target if it exists in the array. Otherwise, return -1.

**Example:** `nums = [-1, 0, 3, 5, 9, 12], target = 9` → `4`

```
BRUTE FORCE | O(N) | O(1)

Linearly search through the array to find the target value.

-----------------------------------------------------------------------------

BINARY SEARCH | O(log N) | O(1)

left = 0
right = length(nums) - 1
while left <= right:
    mid = left + (right - left) / 2
    if nums[mid] == target:
        return mid
    else if nums[mid] < target:
        left = mid + 1
    else:
        right = mid - 1
return -1

-----------------------------------------------------------------------------

RECURSIVE BINARY SEARCH | O(log N) | O(log N)

function search(nums, target, left, right):
    if left > right:
        return -1
    mid = left + (right - left) / 2
    if nums[mid] == target:
        return mid
    if nums[mid] < target:
        return search(nums, target, mid + 1, right)
    return search(nums, target, left, mid - 1)
```

### 2. Search in 2D Matrix

You are given an m × n matrix with these properties:

- Each row is sorted in ascending order.
- The first element of each row is greater than the last element of the previous row.
  Determine whether a given target exists in the matrix.

**Example:** `matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3` → `true`

```
BRUTE FORCE | O(M * N) | O(1)
Iterate through each element of the matrix to find the target.

-----------------------------------------------------------------------------

BINARY SEARCH EACH ROW | O(M log(N)) | O(1)

Apply binary search on each row of the matrix to find the target.

-----------------------------------------------------------------------------

BINARY SEARCH | O(log(M * N)) | O(1)

// Consider the matrix as a flattened sorted array and apply binary search.

rows = number of rows
cols = number of columns
left = 0
right = rows * cols - 1
while left <= right:
    mid = left + (right - left) / 2
    row = mid / cols
    col = mid % cols
    value = matrix[row][col]
    if value == target:
        return true
    if value < target:
        left = mid + 1
    else:
        right = mid - 1
return false
```

### 3. Search in Rotated Sorted Array

You are given an integer array nums sorted in ascending order, and an integer target. The array is rotated at an unknown pivot index. Determine if the target exists in the array.

**Example:** `nums = [4, 5, 6, 7, 0, 1, 2], target = 0` → `4`

```
BRUTE FORCE | O(N) | O(1)

Iterate through the array to find the target.

-----------------------------------------------------------------------------

BINARY SEARCH | O(log N) | O(1)

// Determine which side of the array is sorted and adjust the search range accordingly.

left = 0
right = n - 1
while left <= right:
    mid = left + (right - left) / 2
    if nums[mid] == target:
        return mid
    // Left half is sorted
    if nums[left] <= nums[mid]:
        if nums[left] <= target
           AND target < nums[mid]:
            right = mid - 1
        else:
            left = mid + 1
    // Right half is sorted
    else:
        if nums[mid] < target
           AND target <= nums[right]:
            left = mid + 1
        else:
            right = mid - 1
return -1
```

### 4. Find Minimum in Rotated Sorted Array

Given an array of unique integers sorted in ascending order and rotated at an unknown pivot, find the minimum element.

**Example:** `nums = [3, 4, 5, 1, 2]` → `1`

```
BRUTE FORCE | O(N) | O(1)
Iterate through the array to find the minimum element.

-----------------------------------------------------------------------------
BINARY SEARCH | O(log N) | O(1)

// Use binary search to find the point of rotation, which is the minimum element.

left = 0
right = n - 1
while left < right:
    mid = left + (right - left) / 2
    if nums[mid] > nums[right]:
        // Minimum is to the right
        left = mid + 1
    else:
        // Minimum is at mid or to the left
        right = mid
return nums[left]
```

### 5. Find Peak Element

A peak element is an element that is strictly greater than its neighbors. Given an integer array nums, find any peak element and return its index. You may assume that nums[-1] = nums[n] = -∞.

**Example:** `nums = [1, 2, 3, 1]` → `2`

```
BRUTE FORCE | O(N) | O(1)
Iterate through the array and check each element to see if it is greater than its neighbors.

-----------------------------------------------------------------------------
BINARY SEARCH | O(log N) | O(1)

// Compare the middle element with its neighbors to determine which half of the array contains a peak.

left = 0
right = n - 1
while left < right:
    mid = left + (right - left) / 2
    if nums[mid] < nums[mid + 1]:
        // Going uphill
        left = mid + 1
    else:
        // Going downhill
        right = mid
return left
```

### 6. Koko Eating Bananas

Koko has n piles of bananas. piles[i] is the number of bananas in pile i. She has exactly h hours to eat all the bananas.
Each hour:

- Koko chooses one pile.
- She eats at most k bananas from that pile.
- If fewer than k bananas remain, she eats the remaining bananas.
- She cannot eat from another pile during that same hour.

Find the minimum integer eating speed k that allows Koko to finish all bananas within h hours.

**Example:** `piles = [3, 6, 7, 11], h = 8` → `4`

```
BRUTE FORCE | O(N * max(piles)) | O(1)

Iterate through all possible eating speeds from 1 to max(piles) and check if Koko can finish all bananas within h hours for each speed.

-----------------------------------------------------------------------------

BINARY SEARCH ON ANSWER | O(N log(max(piles))) | O(1)

// h >= sum(ceil(piles[i] / k)) for all piles. Use binary search to find the minimum k that satisfies this condition.
// Return minimum valid answer

left = 1
right = max(piles)
while left <= right:
    mid = left + (right - left) / 2
    hours = 0
    for pile in piles:
        hours += ceil(pile / mid)
    if hours <= h:
        // mid works, but try slower
        right = mid - 1
    else:
        // mid is too slow
        left = mid + 1
return left
```

### 7. Median of Two Sorted Arrays

Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

**Example:** `nums1 = [1, 3], nums2 = [2]` → `2.0`

```
BRUTE FORCE | O((m+n) log(m+n)) | O(m+n)
Merge the two arrays and sort them, then find the median of the merged array.

-----------------------------------------------------------------------------

TWO POINTERS | O(m+n) | O(1)

Use two pointers to merge the two arrays until reaching the median position, then return the median value.

total = m + n
target = total / 2
i = 0
j = 0
previous = 0
current = 0
for count from 0 to target:
    previous = current
    if i < m AND
       (j >= n OR nums1[i] <= nums2[j]):
        current = nums1[i]
        i++
    else:
        current = nums2[j]
        j++
if total is odd:
    return current
return (previous + current) / 2

-----------------------------------------------------------------------------
BINARY SEARCH | O(log(min(m,n))) | O(1)

// Use binary search on the smaller array to find the correct partition that divides the combined array into two halves with equal length (or off by one).
// Divide the arrays into left and right halves such that all elements in the left halves are less than or equal to all elements in the right halves. The median is then calculated based on the maximum of the left halves and the minimum of the right halves.

      LEFT        |       RIGHT

nums1: A A A A    |    B B B
nums2: C C C      |    D D D D

Need:
A <= D
C <= B


if length(nums1) > length(nums2):
    swap(nums1, nums2)
m = length(nums1)
n = length(nums2)
left = 0
right = m
leftSize = (m + n + 1) / 2
while left <= right:
    i = left + (right - left) / 2
    j = leftSize - i
    nums1Left  = value at i - 1, or -infinity
    nums1Right = value at i,     or +infinity
    nums2Left  = value at j - 1, or -infinity
    nums2Right = value at j,     or +infinity
    if nums1Left <= nums2Right
       AND nums2Left <= nums1Right:
        if total length is odd:
            return max(nums1Left, nums2Left)
        else:
            leftMax = max(nums1Left, nums2Left)
            rightMin = min(nums1Right, nums2Right)
            return (leftMax + rightMin) / 2
    else if nums1Left > nums2Right:
        right = i - 1
    else:
        left = i + 1
```

### 8. Split Array Largest Sum

Given an array of non-negative integers nums and an integer m, split the array into m non-empty continuous subarrays. Minimize the largest sum among these m subarrays.

**Example:** `nums = [7, 2, 5, 10, 8], m = 2` → `18`

```
BRUTE FORCE | O(N^m) | O(1)
Use recursion to explore all possible ways to split the array into m subarrays and calculate the largest sum for each split. Return the minimum of these largest sums.

-----------------------------------------------------------------------------

DP | O(N^2 * m) | O(N * m)

// dp[i][j] = minimum largest sum for splitting first i elements into j subarrays
// dp[i][j] = min over p < i max(dp[p][j-1],prefixSum[i] - prefixSum[p])

-----------------------------------------------------------------------------

BINARY SEARCH ON ANSWER | O(N log(sum(nums))) | O(1)

// Min = max(nums), Max = sum(nums)
// Check if we can split the array into at most m subarrays with largest sum <= mid

function splitArray(nums, k):
    left = max(nums)
    right = sum(nums)
    while left <= right:
        maxSum = left + (right - left) / 2
        groups = countGroups(nums, maxSum)
        if groups <= k:
            // maxSum works.
            // Try a smaller maximum.
            right = maxSum - 1
        else:
            // Need too many groups.
            // Maximum allowed sum is too small.
            left = maxSum + 1
    return left

function countGroups(nums, maxSum):
    groups = 1
    currentSum = 0
    for num in nums:
        if currentSum + num > maxSum:
            groups++
            currentSum = 0
        currentSum += num
    return groups
```

## Hashing

### 1. Two Sum

Given an integer array `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.

**Example:** `nums = [2, 7, 11, 15], target = 9` → `[0, 1]`

```text
BRUTE FORCE | O(N^2) | O(1)

Check every pair of elements and return the pair whose sum equals target

------------------------------------------------------------------------------------

SORTING | O(N log N) | O(1)

Check every pair of elements and return the pair whose sum equals target

------------------------------------------------------------------------------------

HASH MAP | O(N) | O(N)

// Put element with index in hash map and check

create an empty hash map
for i from 0 to n - 1:
    complement = target - nums[i]

    if complement exists in the hash map:
        return [hashMap[complement], i]

    hashMap[nums[i]] = i

return no solution
```

### 2. Contains Duplicate

Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.

**Example:** `nums = [1, 2, 3, 1]` → `true`

```text
BRUTE FORCE | O(N^2) | O(1)

For each element, scan the remaining array for a duplicate

------------------------------------------------------------------------------------

SORTING | O(N log N) | O(1)

Sort the array and check whether any adjacent elements are equal

------------------------------------------------------------------------------------

HASH SET | O(N) | O(N)

create an empty hash set

for i from 0 to n - 1:
    if nums[i] exists in the hash set:
        return true
    add nums[i] to the hash set

return false

------------------------------------------------------------------------------------

SET LENGTH | O(N) | O(N)

Create a set from nums and compare its size with nums.length
```

### 3. Valid Anagram

Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.

> An anagram contains the same characters with the same frequencies, but possibly in a different order.

**Example:** `s = "anagram", t = "nagaram"` → `true`

```text
SORTING | O(N log N) | O(1)

Sort both strings and check whether they are equal

------------------------------------------------------------------------------------

HASHING | O(N) | O(K)

if length(s) != length(t):
    return false

create an empty frequency map

for each character c in s:
    frequency[c]++
for each character c in t:
    frequency[c]--

for each count in the frequency map:
    if count != 0:
        return false

return true

------------------------------------------------------------------------------------

FIXED CHARACTER SET | O(N) | O(1)

create a frequency array of size K
process both strings and check whether every frequency is zero
```

### 4. Group Anagrams

Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.

**Example:** `strs = ["eat","tea","tan","ate","nat","bat"]` → `[["eat","tea","ate"],["tan","nat"],["bat"]]`

```text
SORTING + HASHING | O(N * K log K) | O(N * K)

Sort each string and use the sorted string as a hash-map key
Add strings with the same key to the same group

------------------------------------------------------------------------------------

FREQUENCY ARRAY + HASHING | O(N * K) | O(N * K)

create an empty hash map

for each string s:
    create frequency[26] initialized to 0

    for each character c in s:
        frequency[c - 'a']++

    key = serialize frequency

    if key does not exist in the map:
        create an empty group for key

    add s to the group for key

return all groups in the map
```

### 5. Top K Frequent Elements

Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in any order.

**Example:** `nums = [1, 1, 1, 2, 2, 3], k = 2` → `[1, 2]`

```text
HASHING + SORTING | O(N + M log M) | O(M)

Count each number's frequency
Sort the distinct numbers by frequency and return the first k

------------------------------------------------------------------------------------

HASHING + MIN HEAP | O(N + M log K) | O(M + K)

frequencyMap = count the frequency of each number
create an empty minHeap

for each (number, frequency) in frequencyMap:
    add (number, frequency) to heap
    if minHeap.size > k:
        remove the minimum-frequency element

return the numbers remaining in minHeap

------------------------------------------------------------------------------------

BUCKET SORT | O(N) | O(N)

frequencyMap = count the frequency of each number
create buckets[0 ... n], where each bucket is a list
result = []

for each (number, frequency) in frequencyMap:
    buckets[frequency].add(number)

for frequency from n down to 1:
    for each number in buckets[frequency]:
        add number to result
        if result.length == k:
            return result
```

> - A min heap stores only the top `k` elements instead of all distinct elements.
> - For an infinite stream, prefer a min heap because bucket sort requires a known, finite input size.

### 6. Subarray Sum Equals K

Given an integer array nums and an integer k, return the total number of continuous subarrays whose sum equals k.

**Example:** `nums = [1, 1, 1], k = 2` → `2`

```
BRUTE FORCE | O(N^2) | O(1)

Calculate the sum of every subarray and check whether it equals k

-----------------------------------------------------------------------------

PREFIX SUM + HASH MAP | O(N) | O(N)

count = 0
currentSum = 0
frequency = empty map
frequency[0] = 1

for num in nums:
    currentSum += num
    requiredPrefix = currentSum - k
    if requiredPrefix exists:
        count += frequency[requiredPrefix]
    frequency[currentSum]++
return count
```

### 7. Longest Consecutive Sequence

Given an integer array `nums`, return the length of its longest sequence of consecutive integers. The elements may appear in any order.

**Example:** `nums = [100, 4, 200, 1, 3, 2]` → `4`

```text
BRUTE FORCE | O(N^2) | O(1)

Starting from each element, repeatedly search for the next consecutive value

------------------------------------------------------------------------------------

SORTING | O(N log N) | O(1)

Sort the array and scan it for the longest consecutive sequence
Ignore duplicate values while counting the sequence length

------------------------------------------------------------------------------------

HASH SET | O(N) | O(N)

create a hash set containing all numbers
longest = 0
for each number in the hash set:
    if number - 1 does not exist in the hash set:
        current = number
        length = 1
        while current + 1 exists in the hash set:
            current++
            length++
        longest = max(longest, length)

return longest
```

> A number starts a sequence only when `number - 1` is not in the hash set.

### 8. Subarray Sum Equals K

Given an integer array `nums` and an integer `k`, return the number of contiguous subarrays whose sum equals `k`.

**Example:** `nums = [1, 2, 3], k = 3` → `2`

```text
BRUTE FORCE | O(N^2) | O(1)

Calculate the sum of every subarray and check whether it equals k
OR
Create a prefix-sum array and use it to calculate each subarray sum

------------------------------------------------------------------------------------

PREFIX SUM + HASHING | O(N) | O(N)

// prefixSum[i] = sum of all elements from index 0 through i
// Subarray sum = current prefix sum - earlier prefix sum

create an empty prefixCount map
prefixCount[0] = 1
prefixSum = 0
count = 0

for each num:
    prefixSum += num
    required = prefixSum - k
    if required exists in prefixCount:
        count += prefixCount[required]
    prefixCount[prefixSum]++

return count
```

> Initialize `prefixCount[0] = 1` to count subarrays that start at index `0`.

## Two Pointers

### 1. Valid Palindrome

Given a string s, determine whether it is a palindrome. Case Insensitive and ignore non-alphanumeric characters.

**Example:** `s = "A man, a plan, a canal: Panama"` → `true`

```text
BRUTE FORCE | O(N) | O(N)
Create a new string with only alphanumeric characters and check whether it is equal to its reverse

-----------------------------------------------------------------------------

TWO POINTERS | O(N) | O(1)

left = 0
right = length(s) - 1

while left < right
    while left < right and s[left] is not alphanumeric
        left++
    while left < right and s[right] is not alphanumeric
        right--
    if lowercase(s[left]) != lowercase(s[right])
        return false
    left++
    right--
return true

-----------------------------------------------------------------------------

RECURSION | O(N) | O(N)
function isPalindrome(left, right)
    skip invalid characters from left
    skip invalid characters from right
    if left >= right
        return true
    if lowercase(s[left]) != lowercase(s[right])
        return false
    return isPalindrome(left + 1, right - 1)
```

### 2. Two Sum II — Input Array Is Sorted

Given sorted array of integers `numbers` and an integer `target`, return the indices of the two numbers such that they add up to `target`. The returned indices are 1-based.

**Example:** `numbers = [2, 7, 11, 15], target = 9` → `[1, 2]`

```text
BRUTE FORCE | O(N^2) | O(1)

Check every pair of elements and return the pair whose sum equals target

-----------------------------------------------------------------------------

BINARY SEARCH | O(N log N) | O(1)

for i = 0 to n - 1
    required = target - numbers[i]
    binary search for required
        in range i + 1 ... n - 1
    if found
        return [i + 1, foundIndex + 1]

-----------------------------------------------------------------------------

HASHING | O(N) | O(N)

create empty hash map
for i = 0 to n - 1
    required = target - numbers[i]
    if required exists in map
        return [map[required] + 1, i + 1]
    map[numbers[i]] = i

-----------------------------------------------------------------------------

TWO POINTERS | O(N) | O(1)

left = 0
right = n - 1

while left < right
    sum = numbers[left] + numbers[right]
    if sum == target
        return [left + 1, right + 1]
    else if sum < target
        left++
    else
        right--
```

### 3. 3Sum

Given an integer array `nums`, return all unique triplets `[nums[i], nums[j], nums[k]]` such that `nums[i] + nums[j] + nums[k] == 0`.

**Example:** `nums = [-1, 0, 1, 2, -1, -4]` → `[[-1, -1, 2], [-1, 0, 1]]`

```text
BRUTE FORCE | O(N^3) | O(1)

Check every triplet of elements and return the triplets whose sum equals 0

-----------------------------------------------------------------------------

HASH SET | O(N^2) | O(N)

Fix one element and use a hash set to find pairs that sum to the negative of the fixed element

create empty result set
for i = 0 to n - 1
    create empty hash set
    target = -nums[i]
    for j = i + 1 to n - 1
        required = target - nums[j]
        if required exists in hash set
            triplet = [nums[i], required, nums[j]]
            add normalized triplet to result set
        add nums[j] to hash set
return result

------------------------------------------------------------------------------

SORTING + TWO POINTERS | O(N^2) | O(1)

sort nums
create empty result
for i = 0 to n - 3
    if i > 0 and nums[i] == nums[i - 1]
        continue
    left = i + 1
    right = n - 1
    while left < right
        sum = nums[i] + nums[left] + nums[right]
        if sum == 0
            add [nums[i], nums[left], nums[right]] to result
            left++
            right--
            // Skip duplicates
            while left < right and nums[left] == nums[left - 1]
                left++
            while left < right and nums[right] == nums[right + 1]
                right--
        else if sum < 0
            left++
        else
            right--

return result
```

### 4. Container With Most Water

Given an array `height` of non-negative integers where `height[i]` represents the height of a vertical line at position `i`, find two lines that together with the x-axis form a container, such that the container contains the most water.

**Example:** `height = [1, 8, 6, 2, 5, 4, 8, 3, 7]` → `49`

```text
BRUTE FORCE | O(N^2) | O(1)

Check every pair of lines and calculate the area of water they can contain

-----------------------------------------------------------------------------

TWO POINTERS | O(N) | O(1)

left = 0
right = n - 1
max_area = 0
while left < right:
    width = right - left
    height = min(height[left], height[right])
    max_area = max(max_area, width * height)
    if height[left] < height[right]:
        left++
    else:
        right--
return max_area
```

### 5. Trapping Rain Water

Given an array `height` of non-negative integers where `height[i]` represents the height of a vertical line at position `i`, compute how much water it can trap after raining.

**Example:** `height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]` → `6`

```text
water[i] =  min(leftMax[i], rightMax[i]) - height[i]

BRUTE FORCE | O(N^2) | O(1)

Calculate the water trapped at each index by finding the maximum height to the left and right of that index

-----------------------------------------------------------------------------

PREFIX AND SUFFIX MAX | O(N) | O(N)

leftMax[0] = height[0]
for i = 1 to n - 1
    leftMax[i] = max(leftMax[i - 1], height[i])

rightMax[n - 1] = height[n - 1]
for i = n - 2 to 0
    rightMax[i] = max(rightMax[i + 1], height[i])

totalWater = 0
for i = 0 to n - 1
    waterLevel = min(leftMax[i], rightMax[i])
    water = waterLevel - height[i]
    totalWater += water

------------------------------------------------------------------------------

TWO POINTERS | O(N) | O(1)

left = 0
right = n - 1
leftMax = 0
rightMax = 0
totalWater = 0

while left < right
    if height[left] <= height[right]
        if height[left] >= leftMax
            leftMax = height[left]
        else
            totalWater += leftMax - height[left]
        left++
    else
        if height[right] >= rightMax
            rightMax = height[right]
        else
            totalWater += rightMax - height[right]
        right--
return totalWater

------------------------------------------------------------------------------

MONOTONIC STACK | O(N) | O(N)

create empty stack of indices
totalWater = 0

for right = 0 to n - 1
    while stack is not empty
          and height[right] > height[stack.top]
        bottom = stack.pop()
        if stack is empty
            break
        left = stack.top
        width = right - left - 1
        boundedHeight = min(height[left], height[right]) - height[bottom]
        totalWater += width × boundedHeight
    push right onto stack
return totalWater
```

### 6. Remove Duplicates from Sorted Array

Given a sorted integer array nums, remove the duplicates in-place such that each unique element appears only once.

**Example:** `nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]` → `5` (nums = [0, 1, 2, 3, 4])

```
BRUTE FORCE | O(N) | O(N)

Create a new array and copy unique elements to it

------------------------------------------------------------------------------

HASHING | O(N) | O(N)

Create a hash set and add each element to it, then copy the unique elements back to the original array

------------------------------------------------------------------------------

TWO POINTERS | O(N) | O(1)

if nums is empty
    return 0
slow = 0
for fast = 1 to n - 1
    if nums[fast] != nums[slow]
        slow++
        nums[slow] = nums[fast]
return slow + 1
```

### 7. Move Zeroes

Given an integer array nums, move all 0s to the end of the array while maintaining the relative order of all non-zero elements

**Example:** `nums = [0, 1, 0, 3, 12]` → `[1, 3, 12, 0, 0]`

```
BRUTE FORCE | O(N^2) | O(N)

Create a new array and copy non-zero elements to it, then fill the rest with zeros

OPTIMIZED BRUTE FORCE | O(N) | O(1)

Find zeroes and shift them to the end

------------------------------------------------------------------------------

TWO POINTERS | O(N) | O(1)

slow = 0
for fast = 0 to n - 1
    if nums[fast] != 0
        nums[slow] = nums[fast]
        slow++
for i = slow to n - 1
    nums[i] = 0
```

## Sliding Window

### 1. Longest Substring Without Repeating Characters

Given a string s, find the length of the longest substring without repeating characters.

**Example:** `s = "abcabcbb"` → `3` ("abc")

```
BRUTE FORCE | O(N^3) | O(N)

Check every substring and see if it has all unique characters

--------------------------------------------------------------------------------

HASH SET | O(N^2) | O(K)

Add characters to a hash set until a duplicate is found, then remove characters from the start of the substring until the duplicate is removed

--------------------------------------------------------------------------------

SLIDING WINDOW + HASH SET | O(N) | O(K)

left = 0
maxLength = 0
set = empty

for right = 0 to n-1:
    while s[right] is in set:
        remove s[left]
        left++
    add s[right]
    maxLength = max(maxLength, right - left + 1)

return maxLength

--------------------------------------------------------------------------------

OPTIMIZED SLIDING WINDOW + HASH MAP FOR LAST SEEN| O(N) | O(K)

lastSeen = empty map
left = 0
maxLength = 0

for right from 0 to n-1:

    if s[right] exists in lastSeen:
        left = max(left, lastSeen[s[right]] + 1)

    lastSeen[s[right]] = right

    maxLength = max(maxLength, right-left+1)

return maxLength

--------------------------------------------------------------------------------

FIXED CHARACTER SET | O(N) | O(K)

Use array of size K to store last seen index of each character instead of a hash map
```

### 2. Longest Repeating Character Replacement

You are given a string s containing uppercase English letters and an integer k.
You can replace at most k characters with any other uppercase letter.
Return the length of the longest substring that can be transformed into a string containing only the same character.

**Example:** `s = "AABABBA", k = 1` → `4`

```
SLIDING WINDOW + HASH MAP | O(N) | O(K)

left = 0
maxFrequency = 0
answer = 0
frequency = empty map

for right from 0 to n-1:
    frequency[s[right]]++
    maxFrequency = max(maxFrequency, frequency[s[right]])
    windowLength = right - left + 1
    replacements = windowLength - maxFrequency

    while replacements > k:
        frequency[s[left]]--
        left++
        windowLength = right - left + 1

    answer =  max(answer, right - left + 1)
return answer
```

> Max Frequency is stale but it does not matter because the window will shrink until the condition is satisfied again.

### 3. Permutation in String

Given two strings s1 and s2, determine whether s2 contains a permutation of s1 as a substring.

**Example:** `s1 = "ab", s2 = "eidbaooo"` → `true` ("ba")

```
BRUTE FORCE | O(M! * N) | O(K)

Generate all permutations of s1 and check whether any of them is a substring of s2

OPTIMIZED BRUTE FORCE | O(M * N) | O(1)

Check every substring of s2 with length equal to s1 and see if it is a permutation of s1

--------------------------------------------------------------------------------

SORTING | O(N * M log M) | O(K)

Sort s1 and every substring of s2 with length equal to s1 and check whether they are equal

--------------------------------------------------------------------------------

SLIDING WINDOW + FREQ ARRAY | O(N) | O(K)

// Check freqeuncy map at each step

m = length(s1)
if m > length(s2)
    return false
create freq1
create freqWindow
for i = 0 to m - 1
    freq1[s1[i]]++
    freqWindow[s2[i]]++
if freq1 == freqWindow
    return true
for right = m to length(s2) - 1
    entering = s2[right]
    leaving = s2[right - m]
    freqWindow[entering]++
    freqWindow[leaving]--
    if freq1 == freqWindow
        return true
return false

// Alternatively, maintain a difference count and check whether it is zero at each step
```

> Use hash map instead of frequency array for a larger character set.

### 4. Minimum Window Substring

Given two strings s and t, return the minimum window in s which will contain all the characters in t. If there is no such window, return the empty string "".

**Example:** `s = "ADOBECODEBANC", t = "ABC"` → `"BANC"`

```
BRUTE FORCE | O(N^3) | O(K)

Find every substring of s and check whether it contains all characters of t

--------------------------------------------------------------------------------

SLIDING WINDOW + HASH MAP | O(N + M) | O(K)

need = frequency map of t
window = empty map
required = number of distinct characters in t
formed = 0   // Number of distinct characters in the current window that match the required frequency
left = 0
bestLength = infinity
bestStart = 0

for right from 0 to s.length - 1:
    current = s[right]
    add current to window

    if current exists in need AND window[current] == need[current]:
        formed++

    while formed == required:
        update best answer
        leftChar = s[left]
        remove leftChar from window

        if leftChar exists in need AND window[leftChar] < need[leftChar]:
            formed--
        left++

return best substring

--------------------------------------------------------------------------------

MISSING COUNT | O(N + M) | O(K)

// Tracks duplicates and missing characters instead of distinct characters

need = frequency(t)
missing = t.length
left = 0

for right:
    c = s[right]
    if c is required:
        if window[c] < need[c]:
            missing--
        window[c]++

    while missing == 0:
        update answer
        c = s[left]

        if c is required:
            window[c]--
            if window[c] < need[c]:
                missing++
        left++
```

### 5. Sliding Window Maximum

Given an integer array nums and an integer k, there is a sliding window of size k.
The window moves from left to right one position at a time.
Return the maximum value in every window.

**Example:** `nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3` → `[3, 3, 5, 5, 6, 7]`

```
BRUTE FORCE | O(N * K) | O(1)

For each window, scan the k elements to find the maximum

--------------------------------------------------------------------------------

MAX HEAP + LAZY DELETION | O(N log K) | O(K)\

// Remove elements from the heap that are outside the current window

heap = max heap of (value, index)

for i = 0 to n-1:
    add nums[i]
    while heap.max.index <= i-k:
        remove max
    if i >= k-1:
        result.add(heap.max.value)

--------------------------------------------------------------------------------

MONOTONIC DEQUE | O(N) | O(K)

// Deque stores indices of elements in decreasing order of their values. Front is the maximum
// Any new maximum will remove all smaller elements from the back of the deque

deque = empty

for i from 0 to n-1:
    // Remove elements outside window
    while deque not empty AND deque.front < i-k+1:
        remove front

    // Remove elements smaller than current
    while deque not empty AND nums[deque.back] <= nums[i]:
        remove back

    add i to back

    if i >= k-1:
        result.add(nums[deque.front])
```

## Strings

### 1. Palindromic Substrings

Given a string s, return the number of palindromic substrings in it.

**Example:** `s = "aaa"` → `6`

```
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

### 2. Longest Palindromic Substring

Given a string s, return the longest palindromic substring in s.

**Example:** `s = "babad"` → `"bab"` ("aba" also valid)

```
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
    originalLeft = left
    originalRight = right
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

### 3. Valid Parentheses

Given a string s containing only: ( ) { } [ ]. Determine whether the brackets are valid.

**Example:** `s = "()[]{}"` → `true`

```
STACK | O(N) | O(N)

stack = empty
for each character c:
    if c is opening bracket:
        push c
    else:
        if stack is empty:
            return false
        top = pop stack
        if top doesn't match c:
            return false
return stack is empty
```

### 4. Encode and Decode Strings

Design an algorithm to encode a list of strings into a single string and then decode that string back into the original list.

**Example:** `["neet","code","love","you"]` → encode → decode → `["neet","code","love","you"]`

```
LENGTH PREFIX | O(N) | O(N)
Encode each string as: length + delimiter + string
```

### 5. Longest common prefix

Given an array of strings, find the longest common prefix shared by all strings.

**Example:** `strs = ["flower","flow","flight"]` → `"fl"`

```
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

### 6. String to integer (atoi)

Implement a function that converts a string into a 32-bit signed integer. Ignore non digit characters and handle overflow.

**Example:** `s = "   -42"` → `-42`

```
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

### 7. Multiply Strings

Given two non-negative long integers represented as strings, return their product, also represented as a string.

**Example:** `num1 = "123", num2 = "456"` → `"56088"`

```
REPEATED ADDITION | O(N * M) | O(1)

Add num1 to itself num2 times, where num1 and num2 are the integer values of the strings. This is inefficient for large numbers.

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

------------------------------------------------------------------------------

KARATSUBA | O(N^log2(3)) | O(N)

// Split the numbers into halves and recursively compute products of the halves, combining them to get the final product. This is more efficient for very large numbers.

------------------------------------------------------------------------------

FFT | O(N log N) | O(N)

// Use Fast Fourier Transform to multiply polynomials represented by the digit sequences of the numbers. This is efficient for extremely large numbers.
```

### 8. First occurrence in a string

Given two strings `haystack` and `needle`, return the index of the first occurrence of `needle` in `haystack`, or -1 if `needle` is not part of `haystack`.

**Example:** `haystack = "sadbutsad", needle = "sad"` → `0`

```
BRUTE FORCE | O(N * M) | O(1)

Check every substring of haystack with length equal to needle and see if it matches needle

-----------------------------------------------------------------------------

RABIN-KARP | O(N + M) Average O(N * M) Worst Case | O(1)

// Calculate hash of needle and every substring of haystack with length equal to needle, and compare hashes. If hashes match, compare the actual strings to avoid false positives.

if needle is empty
    return 0
m = length(needle)
n = length(haystack)
calculate hash of needle
calculate hash of first m characters of haystack
for i = 0 to n - m
    if windowHash == needleHash
        verify characters directly
        if equal
            return i
    roll hash to next window
return -1

-----------------------------------------------------------------------------

KMP | O(N + M) | O(M)

// Preprocess needle to create a longest prefix-suffix (LPS) array, then use it to skip characters in haystack when a mismatch occurs
// LPS : Longest Prefix Suffix array, where lps[i] is the length of the longest proper prefix which is also a suffix for needle[0..i]
// Example: For needle = "ABABC", lps = [0, 0, 1, 2, 0]
// Haystack pointer moves forward by 1 on mismatch, but needle pointer moves back to lps[needlePointer - 1] instead of 0

buildLPS(pattern)    // O(M)
    create lps[m]
    lps[0] = 0
    length = 0
    i = 1
    while i < m
        if pattern[i] == pattern[length]
            length++
            lps[i] = length
            i++
        else
            if length != 0
                length = lps[length - 1]
            else
                lps[i] = 0
                i++
    return lps

search(haystack, needle)    // O(N)
    lps = buildLPS(needle)
    if needle is empty
        return 0
    if length(needle) > length(haystack)
        return -1
    lps = buildLPS(needle)
    i = 0
    j = 0
    while i < length(haystack)
        if haystack[i] == needle[j]
            i++
            j++
            if j == length(needle)
                return i - j
        else
            if j != 0
                j = lps[j - 1]
            else
                i++
    return -1

-----------------------------------------------------------------------------

Z ALGORITHM | O(N + M) | O(N + M)

// Preprocess the concatenated string "needle$haystack" to create a Z-array, which indicates the length of the longest substring starting from each position that matches the prefix of the concatenated string. If any value in the Z-array equals the length of needle, it indicates a match.

-----------------------------------------------------------------------------

BOYER-MOORE | O(N + M) Average O(N * M) Worst Case | O(M)

// Preprocess needle to create bad character and good suffix tables, then use them to skip sections of haystack when a mismatch occurs. This is efficient for large alphabets and long patterns.

```

### 9. Min Stack

Design a stack that supports the following operations in O(1) time:
push(x) — add an element
pop() — remove the top element
top() — return the top element
getMin() — return the minimum element currently in the stack

**Example:** `push(-2), push(0), push(-3), getMin()` → `-3`; then `pop(), top()` → `0`, `getMin()` → `-2`

```
STACK | O(1) | O(N)

// Maintain 2 stacks, one for the actual stack and another for the minimums. The minStack always has the current minimum at the top.

create stack
create minStack
push(x)
    stack.push(x)
    if minStack is empty
        minStack.push(x)
    else
        currentMin = minStack.top()
        minStack.push(min(x, currentMin))
pop()
    minStack.pop()
    stack.pop()
top()
    return stack.top()
getMin()
    return minStack.top()
```

### 10. Evaluate Reverse Polish Notation

You are given an array of tokens representing an arithmetic expression in Reverse Polish Notation (RPN).
Evaluate the expression and return the integer result.

**Example:** `tokens = ["2","1","+","3","*"]` → `9`

```
BRUTE FORCE | O(N^2) | O(N)

Repeatedly scan the array for operators and apply them to the two preceding numbers, replacing them with the result

-----------------------------------------------------------------------------

RECURSION | O(N) | O(N)

evaluateFromRight()
    token = read previous token
    if token is number
        return token
    right = evaluateFromRight()
    left = evaluateFromRight()
    return apply token to left and right

-----------------------------------------------------------------------------

STACK | O(N) | O(N)

// Push numbers into stack, and pop two numbers when an operator is encountered

create empty stack
for each token in tokens
    if token is a number
        push token onto stack
    else
        right = pop stack
        left = pop stack
        if token == "+"
            result = left + right
        else if token == "-"
            result = left - right
        else if token == "*"
            result = left * right
        else if token == "/"
            result = left / right
            truncate toward zero
        push result
return stack.top
```

### 11. Daily Temperatures

Given an array temperatures, where: temperatures[i] represents the temperature on day i, return an array where: answer[i] is the number of days you have to wait until a warmer temperature.

**Example:** `temperatures = [73, 74, 75, 71, 69, 72, 76, 73]` → `[1, 1, 4, 2, 1, 1, 0, 0]`

```
BRUTE FORCE | O(N^2) | O(1)

For each day, scan the following days to find the next warmer temperature

-----------------------------------------------------------------------------

MONOTONIC STACK | O(N) | O(N)

// Monotonic Stack : Stores indices of values in decreasing order.

create answer array of size n
create empty stack
for i = n - 1 down to 0
    while stack is not empty AND temperatures[stack.top()] <= temperatures[i]
        stack.pop()
    if stack is not empty
        answer[i] = stack.top() - i
    else
        answer[i] = 0
    stack.push(i)
return answer

// LEFT TO RIGHT

create answer array initialized to 0
create empty stack
for i = 0 to n - 1
    while stack is not empty AND temperatures[i] > temperatures[stack.top()]
        previous = stack.pop()
        answer[previous] = i - previous
    stack.push(i)
return answer

|                | Right → Left      | Left → Right                  |
| -------------- | ----------------- | ----------------------------- |
| Stack contains | Future candidates | Unresolved previous days      |
| Main question  | Next warmer       | Which days does this resolve? |
```

### 12. Next Greater Element I

You are given two arrays with unique elements: nums1 and nums2. nums1 is a subset of nums2.
For every element in nums1, find the first greater element to its right in nums2.
If no greater element exists, return -1.

**Example:** `nums1 = [4, 1, 2], nums2 = [1, 3, 4, 2]` → `[-1, 3, -1]`

```
BRUTE FORCE | O(N * M) | O(1)

For each element in nums1, scan nums2 to find the next greater element

-----------------------------------------------------------------------------

MONOTONIC STACK + HASH MAP | O(N + M) | O(N)

create empty stack
create empty hash map nextGreater
for each value x in nums2
    while stack is not empty AND x > stack.top()
        smaller = stack.pop()
        nextGreater[smaller] = x
    stack.push(x)

while stack is not empty
    nextGreater[stack.pop()] = -1

// RIGHT TO LEFT

create empty stack
create empty map

for i = n - 1 down to 0
    x = nums2[i]
    while stack is not empty AND stack.top() <= x
        stack.pop()
    if stack is empty
        nextGreater[x] = -1
    else
        nextGreater[x] = stack.top()
    stack.push(x)
```

### 13. Next Greater Element II

You are given a circular array nums. For each element in nums, find the next greater element

**Example:** `nums = [1, 2, 1]` → `[2, -1, 2]`

```
BRUTE FORCE | O(N^2) | O(1)

For each element, scan the array circularly to find the next greater element

-----------------------------------------------------------------------------

MONOTONIC STACK | O(N) | O(N)

// Process the array twice to simulate circularity, using a monotonic stack to keep track of the next greater elements
// Either explicitly duplicate the array or use modulo to wrap around

create answer array filled with -1
create empty stack

for i = 2*n - 1 down to 0
    current = nums[i % n]
    while stack is not empty
          and stack.top() <= current
        stack.pop()
    if i < n
        if stack is not empty
            answer[i] = stack.top()
    stack.push(current)
return answer

// LEFT TO RIGHT

create answer array filled with -1
create empty stack

for i = 0 to 2*n - 1
    currentIndex = i % n
    while stack is not empty
          and nums[currentIndex] > nums[stack.top()]
        previous = stack.pop()
        answer[previous] = nums[currentIndex]
    if i < n
        stack.push(currentIndex)
return answer
```

### 14. Largest Rectangle in Histogram

Given an array of integers heights, where each element represents the height of a histogram bar and every bar has width 1, find the area of the largest rectangle that can be formed

**Example:** `heights = [2, 1, 5, 6, 2, 3]` → `10`

```
BRUTE FORCE | O(N^2) | O(1)

For each bar, expand left and right to find the maximum width for which the height is at least the height of the current bar, and calculate the area

-----------------------------------------------------------------------------

TWO STACKS | O(N) | O(N)

// area = heights[i] × (rightSmaller - leftSmaller - 1)

Create 2 stacks, leftSmaller and rightSmaller, to store the index of the next smaller element to the left and right of each bar

maxArea = 0
for i = 0 to n - 1
    width = rightSmaller[i] - leftSmaller[i] - 1
    area = heights[i] × width
    maxArea = max(maxArea, area)
return maxArea

------------------------------------------------------------------------------

MONOTONIC INCREASING STACK | O(N) | O(N)

// When a bar is popped from the stack, it means we have found the next smaller element to the right. The previous smaller element is the new top of the stack after popping.
// Add 0 at the end of the heights array to ensure all bars are popped from the stack by the end of the iteration.

create empty stack
maxArea = 0

for i = 0 to n
    if i == n
        currentHeight = 0
    else
        currentHeight = heights[i]

    while stack is not empty
          and currentHeight < heights[stack.top()]
        heightIndex = stack.pop()
        height = heights[heightIndex]
        if stack is empty
            width = i
        else
            width = i - stack.top() - 1
        area = height × width
        maxArea = max(maxArea, area)
    stack.push(i)
return maxArea
```

### 15. Astroid Collision

You are given an array asteroids. Each asteroid has:

- Absolute value = size
- Sign = direction
- positive → moving right
- negative → moving left

All asteroids move at the same speed. When two asteroids collide:

- Smaller asteroid is destroyed.
- Larger asteroid survives.
- If both have the same size, both are destroyed.
- Asteroids moving in the same direction never collide.

Return the state of the asteroids after all collisions.

**Example:** `asteroids = [5, 10, -5]` → `[5, 10]`

```
BRUTE FORCE | O(N^2) | O(1)
Repeatedly scan the array for collisions and resolve them until no more collisions occur

-----------------------------------------------------------------------------

STACK | O(N) | O(N)

// Use a stack to keep track of asteroids moving to the right. When a left-moving asteroid is encountered, resolve collisions with the stack.

create empty stack
for each asteroid x
    alive = true
    while alive
          and x < 0
          and stack is not empty
          and stack.top() > 0
        top = stack.top()
        if top < abs(x)
            stack.pop()
        else if top == abs(x)
            stack.pop()
            alive = false
        else
            alive = false
    if alive
        stack.push(x)
return stack
```

### 16. Car Fleet

There are n cars traveling toward the same destination. You are given:
target — destination position
position[i] — starting position of car i
speed[i] — speed of car i

All cars:
Move in the same direction.
Start at different positions.
Cannot pass another car.
If a faster car catches a slower car, it slows down and becomes part of the same car fleet.

Return the number of car fleets that will arrive at the destination.

**Example:** `target = 12, position = [10, 8, 0, 5, 3], speed = [2, 4, 1, 1, 3]` → `3`

```
BRUTE FORCE | O(N^3) | O(1)

For each car, simulate its movement and check for collisions with other cars to determine fleets. Complex and inefficient for large n.

-----------------------------------------------------------------------------

STACK | O(N log N) | O(N)

// Pair each car's position with its time to reach the target, sort by position from closest to farthest from target, and use a stack to determine fleets based on arrival times.

create list of cars
for each i: car = (position[i], speed[i])
sort cars by position descending
create empty stack of arrival times

for each car in sorted order
    time = (target - car.position) / car.speed

    if stack is empty or time > stack.top()
        stack.push(time)

return stack.count

-----------------------------------------------------------------------------
WITHOUT STACK | O(N log N) | O(1)

sort cars by position descending
fleetCount = 0
lastFleetTime = 0
for each car
    time = (target - position) / speed

    if fleetCount == 0 or time > lastFleetTime
        fleetCount++
        lastFleetTime = time

return fleetCount
```

### 17. Remove K Digits

Given a non-negative integer represented as a string num and an integer k, remove exactly k digits from num so that the resulting number is the smallest possible number.

Return the result as a string.

**Example:** `num = "1432219", k = 3` → `"1219"`

```
BRUTE FORCE | O(C(n,k) × n) | O(1)
Generate all combinations of removing k digits and find the minimum

-----------------------------------------------------------------------------

MONOTONIC STACK | O(N) | O(N)

// Whenever the current digit is smaller than the previous kept digit, remove the previous larger digit.
// Use a stack to keep track of the digits of the resulting number.

create empty stack

for each digit d in num
    while k > 0
          and stack is not empty
          and stack.top() > d
        stack.pop()
        k--
    stack.push(d)
while k > 0
    stack.pop()
    k--
remove leading zeros
if stack is empty
    return "0"
return stack as string

// Alterneate Questions - Lexicographically Smallest Subsequence
```

### 18. Calculator

Given a string representing a mathematical expression, evaluate it and return its integer result.
The expression can contain: digits, +, -, (, ), spaces. Example - `1 + (2 - (3 + 4))`

**Example:** `s = "1 + (2 - (3 + 4))"` → `-4`

```
BRUTE FORCE | O(N^2) | O(1)
Repeatedly scan the string for parentheses and evaluate the innermost expressions first, replacing them with their results until no parentheses remain.

-----------------------------------------------------------------------------

STACK | O(N) | O(N)

// Use a stack to keep track of the current result and sign. When encountering '(', push the current result and sign onto the stack, and reset them. When encountering ')', pop from the stack and combine with the current result.

result = 0
sign = +1
create empty stack
i = 0

while i < length(expression)
    if expression[i] is space
        i++
    else if expression[i] is digit
        number = 0
        while i < length
              and expression[i] is digit
            number =  number × 10 + digit value
            i++
        result += sign × number
        continue
    else if expression[i] == '+'
        sign = +1
    else if expression[i] == '-'
        sign = -1
    else if expression[i] == '('
        stack.push(result)
        stack.push(sign)
        result = 0
        sign = +1
    else if expression[i] == ')'
        previousSign = stack.pop()
        previousResult = stack.pop()
        result = previousResult + previousSign × result
    i++
return result
```

## Linked List

### 1. Reverse Linked List

Given the head of a singly linked list, reverse the list and return its head.

**Example:** `1 → 2 → 3 → 4 → 5` → `5 → 4 → 3 → 2 → 1`

```
BRUTE FORCE | O(N) | O(N)

Copy the values of the nodes into an array, reverse the array, and create a new linked list from the reversed array.

-----------------------------------------------------------------------------

RECURSION | O(N) | O(N)

function reverse(node)
    if node is null
       or node.next is null
        return node
    newHead = reverse(node.next)
    node.next.next = node
    node.next = null
    return newHead

-----------------------------------------------------------------------------

ITERATIVE | O(N) | O(1)

previous = null
current = head
while current is not null
    next = current.next
    current.next = previous
    previous = current
    current = next
return previous
```

### 2. Merge 2 Sorted Lists

Given the heads of two sorted linked lists, merge them into one sorted linked list and return its head.

**Example:** `1 → 2 → 4` and `1 → 3 → 4` → `1 → 1 → 2 → 3 → 4 → 4`

```
BRUTE FORCE | O((N + M) Log(N + M)) | O(N + M)

Copy the values of both lists into an array, sort the array, and create a new linked list from the sorted array.

-----------------------------------------------------------------------------

OPTIMIZED BRUTE FORCE | O(N + M) | O(N + M)

Copy into separate arrays, merge the arrays via 2 pointers, and create a new linked list from the merged array.

-----------------------------------------------------------------------------

ITERATIVE | O(N + M) | O(1)

// Maintain a dummy node to simplify the merging process. Use two pointers to traverse both lists and attach the smaller node to the merged list.

create dummy node
tail = dummy
while list1 is not null
      and list2 is not null
    if list1.value <= list2.value
        tail.next = list1
        list1 = list1.next
    else
        tail.next = list2
        list2 = list2.next
    tail = tail.next
if list1 is not null
    tail.next = list1
else
    tail.next = list2
return dummy.next
```

### 3. Linked List Cycle

Given the head of a linked list, determine if the linked list has a cycle in it.

**Example:** `3 → 2 → 0 → -4` with the tail linking back to node `2` → `true`

```
BRUTE FORCE | O(N) | O(N)

Use a hash set to store visited nodes. If a node is revisited, there is a cycle.

-----------------------------------------------------------------------------

FLOYD'S CYCLE DETECTION | O(N) | O(1)

slow = head
fast = head
while fast is not null
      and fast.next is not null
    slow = slow.next
    fast = fast.next.next
    if slow == fast
        return true
return false

// Finding Length of Cycle
Once slow == fast
cycleLength = 1
current = slow.next
while current != slow
    current = current.next
    cycleLength++
return cycleLength
```

### 4. Linked List Cycle II

Find the node where the cycle begins in a linked list. If there is no cycle, return null.

**Example:** `3 → 2 → 0 → -4` with the tail linking back to node `2` → node `2`

```
ITERATIVE | O(N) | O(1)

// The distance from the head to the cycle entry is equivalent to the distance from the meeting point to the cycle entry, modulo the cycle length.

slow = head
fast = head

while fast is not null
      and fast.next is not null
    slow = slow.next
    fast = fast.next.next
    if slow == fast
        slow = head
        while slow != fast
            slow = slow.next
            fast = fast.next
        return slow
return null
```

### 5. Middle of the Linked List

Given the head of a singly linked list, return the middle node. If there are two middle nodes, return the second middle node.

**Example:** `1 → 2 → 3 → 4 → 5 → 6` → `4`

```
BRUTE FORCE | O(N) | O(1)

Count the number of nodes in the list, then traverse again to the middle node.

-----------------------------------------------------------------------------

TWO POINTERS | O(N) | O(1)

slow = head
fast = head

while fast is not null
      and fast.next is not null
    slow = slow.next
    fast = fast.next.next

return slow
```

### 6. Remove Nth Node From End of List

Given the head of a linked list, remove the n-th node from the end of the list

**Example:** `1 → 2 → 3 → 4 → 5, n = 2` → `1 → 2 → 3 → 5`

```
BRUTE FORCE | O(N) | O(1)

Count the number of nodes in the list, then traverse again to the (length - n)-th node and remove the next node.

-----------------------------------------------------------------------------

TWO POINTERS | O(N) | O(1)

// Use two pointers, with the first pointer advanced n steps ahead. Then move both pointers until the first pointer reaches the end. The second pointer will be at the node before the one to remove.

create dummy node
dummy.next = head
first = dummy
second = dummy

move first forward n + 1 steps
while first is not null
    first = first.next
    second = second.next
second.next = second.next.next
return dummy.next
```

### 7. Reorder List

Given the head of a singly linked list, reorder the list to follow the pattern: L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …

**Example:** `1 → 2 → 3 → 4` → `1 → 4 → 2 → 3`

```
BRUTE FORCE | O(N) | O(N)

Copy the values of the nodes into an array, reorder the array, and create a new linked list from the reordered array.

-----------------------------------------------------------------------------

ITERATIVE | O(N) | O(1)

// Find the middle of the list, reverse the second half, and merge the two halves.

if head is null
   or head.next is null
    return

// Step 1: Find middle

slow = head
fast = head
while fast.next is not null
      and fast.next.next is not null
    slow = slow.next
    fast = fast.next.next

// Step 2: Split

second = slow.next
slow.next = null

// Step 3: Reverse second half

previous = null
current = second
while current is not null
    next = current.next
    current.next = previous
    previous = current
    current = next
second = previous

// Step 4: Merge

first = head
while second is not null
    firstNext = first.next
    secondNext = second.next
    first.next = second
    second.next = firstNext
    first = firstNext
    second = secondNext
```

### 8. Add Two Numbers

You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each node contains a single digit. Add the two numbers and return the sum as a linked list.

**Example:** `(2 → 4 → 3) + (5 → 6 → 4)` → `7 → 0 → 8` (342 + 465 = 807)

```
BRUTE FORCE | O(N + M) | O(N + M)

Convert the linked lists to integers, add them, and convert the sum back to a linked list. But can overflow for large numbers.

-----------------------------------------------------------------------------

LINKED LIST | O(N + M) | O(1)

create dummy node
tail = dummy
carry = 0
while first is not null
      or second is not null
      or carry != 0
    digit1 = 0
    digit2 = 0
    if first is not null
        digit1 = first.value
        first = first.next
    if second is not null
        digit2 = second.value
        second = second.next
    sum = digit1 + digit2 + carry
    digit = sum % 10
    carry = sum / 10
    create node with digit
    tail.next = node
    tail = node
return dummy.next
```

### 9. Copy List with Random Pointer

Given a linked list where each node contains an additional random pointer that could point to any node in the list or null, return a deep copy of the list.

Example

Original: A → B → C
Suppose:
A.random = C
B.random = A
C.random = B

The copied list must have completely new nodes: A' → B' → C' with:

A'.random = C'
B'.random = A'
C'.random = B'

The copied nodes must not point back to the original nodes.

**Example:** `[[7,null],[13,0],[11,4],[10,2],[1,0]]` → an identical, fully independent deep copy

```
HASH MAP | O(N) | O(N)

if head is null
    return null
create empty map

// Pass 1: create all nodes
current = head
while current is not null
    map[current] = new node(current.value)
    current = current.next

// Pass 2: connect pointers
current = head
while current is not null
    copy = map[current]
    if current.next is not null
        copy.next = map[current.next]
    if current.random is not null
        copy.random = map[current.random]
    current = current.next

return map[head]

------------------------------------------------------------------------------

INTERLEAVING | O(N) | O(1)

// Create new nodes and interleave them with the original nodes, then separate the two lists.

if head is null
    return null

// Step 1: Interleave copied nodes
current = head
while current is not null
    copy = new node(current.value)
    copy.next = current.next
    current.next = copy
    current = copy.next

// Step 2: Set random pointers
current = head
while current is not null
    copy = current.next
    if current.random is not null
        copy.random = current.random.next
    current = copy.next

// Step 3: Separate original and copied lists
current = head
copyHead = head.next
while current is not null
    copy = current.next
    current.next = copy.next
    if copy.next is not null
        copy.next = copy.next.next
    current = current.next
return copyHead
```

### 10. Merge K Sorted Lists

Given an array of k linked-lists lists, each linked-list is sorted in ascending order, merge all the linked-lists into one sorted linked-list and return it.

**Example:** `[[1,4,5],[1,3,4],[2,6]]` → `1 → 1 → 2 → 3 → 4 → 4 → 5 → 6`

```
MERGE 2 AT A TIME | O(N * K) | O(1)

Merge lists two at a time, until only one list remains

--------------------------------------------------------------------------------------

DIVIDE AND CONQUER | O(N log K) | O(1)

while number of lists > 1:
    merge pairs of lists
    if odd number of lists:
        last list remains unchanged
return remaining list

--------------------------------------------------------------------------------------

MIN HEAP | O(N log K) | O(K)

// Add Head of each list to a min heap, then repeatedly remove the minimum and add its next node to the heap
// Better when streaming of data as it is not necessary to have all the data at once

create minHeap

for each linked list:
    if list is not empty:
        add list.head to minHeap

dummy = new node
tail = dummy
while heap is not empty:
    node = remove minimum
    tail.next = node
    tail = tail.next
    if node.next exists:
        add node.next to heap

return dummy.next
```

## Heaps

### 1. Kth Largest Element in an Array

Given an integer array nums and an integer k, return the kth largest element in the array. Array not distinct. Duplicates are counted separately.

**Example:** `nums = [3, 2, 1, 5, 6, 4], k = 2` → `5`

```text
SORTING | O(N log N) | O(1)

Sort the array in descending order and return the element at index k-1

-------------------------------------------------------------------------------------

MAX HEAP | O(N + k log N) | O(N)

Create a max heap of all elements
for i in 1 to k:
    remove max
return max

-------------------------------------------------------------------------------------

MIN HEAP | O(N log k) | O(k)

Create a min heap of size k
for each element in nums:
    if heap.size < k:
        add element to heap
    else if element > heap.min:
        remove min
        add element
return heap.min

// Use Max Heap when K is Large

-------------------------------------------------------------------------------------

QUICKSELECT | O(N) on average | O(1)

// Use partitioning technique from quicksort to find the kth largest element
// Elements < pivot go left, elements > pivot go right
// Gives Kth but not all K largest elements

target = n - k
left = 0
right = n - 1

while left <= right:
    pivotIndex = partition(left, right)
    if pivotIndex == target:
        return nums[pivotIndex]
    else if pivotIndex < target:
        left = pivotIndex + 1
    else:
        right = pivotIndex - 1
```

### 2. K Closest Points to Origin

Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane and an integer k, return the k closest points to the origin (0, 0) in any order

**Example:** `points = [[1, 3], [-2, 2]], k = 1` → `[[-2, 2]]`

```
BRUTE FORCE | O(N log N) | O(1)

Sort the points by their distance to the origin and return the first k

-------------------------------------------------------------------------------------

MAX HEAP | O(N log K) | O(K)

maxHeap = empty

for each point:
    distance = x² + y²
    if heap.size < k:
        add point with distance
    else if distance < heap.max.distance:
        remove maximum
        add point

return all points in heap

--------------------------------------------------------------------------------------

QUICKSELECT | O(N) on average | O(1)

left = 0
right = n - 1

while left <= right:
    pivotIndex = partition(points)
    if pivotIndex == k - 1:
        return first k points
    if pivotIndex > k - 1:
        right = pivotIndex - 1
    else:
        left = pivotIndex + 1
```

### 3. Find Median from Data Stream

Design a data structure that supports:
Adding a number to a stream.
Finding the median of all numbers seen so far

**Example:** `addNum(1), addNum(2), findMedian()` → `1.5`; then `addNum(3), findMedian()` → `2`

```
BRUTE FORCE | O(N * N log N) | O(N)

Store all numbers in a list and sort it when finding the median

-----------------------------------------------------------------------------

HEAP | O(log N) for add, O(1) for find median | O(N)

// Use two heaps (max-heap for the lower half, min-heap for the upper half) to keep track of the median efficiently

create maxHeap lower
create minHeap upper


function addNumber(x)
    if lower is empty
       or x <= maximum of lower
        push x into lower
    else
        push x into upper

    // Rebalance
    if size(lower) > size(upper) + 1
        value = remove maximum from lower
        push value into upper
    else if size(upper) > size(lower)
        value = remove minimum from upper
        push value into lower
function findMedian()
    if size(lower) > size(upper)
        return maximum of lower
    else
        return (maximum of lower + minimum of upper) / 2
```

> If range is bounded, use a counting array instead of heaps to achieve O(1) for both add and find median.

### 4. Task Scheduler

Given a characters array tasks, representing the tasks a CPU needs to do, where each letter represents a different task. Tasks could be done in any order. Each task takes 1 unit of time to complete. For each unit of time, the CPU could complete either one task or just be idle.
There is a non-negative integer n that represents the cooldown period between two same tasks. Return the least number of units of times that the CPU will take to finish all the given tasks.

**Example:** `tasks = ["A","A","A","B","B","B"], n = 2` → `8` (A B idle A B idle A B)

```
BRUTE FORCE | O(N M) | O(N)

// Complex Implementation: Simulate the scheduling of tasks, keeping track of the cooldown period for each task and the time taken to complete all tasks.

-----------------------------------------------------------------------------

MAX HEAP + QUEUE | O(N log N) | O(N)

// Greedy - Always execute the task with the highest remaining count, and use a queue to keep track of tasks that are in their cooldown period.
// Heap - (remainingFrequency, task) - Available Tasks
// Queue - (task, remainingFrequency, availableTime) - UnAvailable Tasks

count frequency of every task

create maxHeap
create cooldownQueue

for every task type
    push (frequency, task) into maxHeap
time = 0
while maxHeap is not empty
      or cooldownQueue is not empty
    time++
    // Move tasks whose cooldown expired
    // back into the heap
    while cooldownQueue is not empty
          and cooldownQueue.front.availableTime <= time
        entry = remove front of cooldownQueue
        if entry.remainingFrequency > 0
            push entry back into maxHeap
    if maxHeap is not empty
        entry = remove maximum frequency task
        entry.remainingFrequency--
        if entry.remainingFrequency > 0
            entry.availableTime = time + n + 1
            add entry to cooldownQueue
    else
        // CPU remains idle

-----------------------------------------------------------------------------

MATH | O(N + M) | O(1)

// Count the frequency of each task and use the formula to calculate the minimum time required based on the most frequent tasks and their cooldowns.

count frequency of every task
maxFreq = maximum frequency
countMax = number of tasks whose frequency == maxFreq

candidate = (maxFreq - 1) * (n + 1) + countMax

return maximum(number of tasks, candidate)
```

### 5. Last Stone Weight

You are given an array of positive integers representing stone weights.

Repeatedly:

Pick the two heaviest stones.
Smash them together.
If they have equal weight, both are destroyed.
If their weights differ, the heavier stone remains with weight equal to the difference.

Continue until at most one stone remains.

Return the weight of the remaining stone, or 0 if none remains.

**Example:** `stones = [2, 7, 4, 1, 8, 1]` → `1`

```
BRUTE FORCE | O(N^2) | O(1)
Repeatedly find the two heaviest stones, smash them, and update the array until one or none remains.

-----------------------------------------------------------------------------

MAX HEAP | O(N log N) | O(N)
Create a max heap of the stone weights. Repeatedly remove the two largest stones, smash them, and add the remaining stone back to the heap until one or none remains.

create maxHeap
for each stone
    push stone into maxHeap
while size(maxHeap) > 1
    first = remove maximum
    second = remove maximum
    if first != second
        push first - second into maxHeap
if maxHeap is empty
    return 0
else
    return maximum element
```

### 6. Top K Frequent Elements

Given an array of strings words and an integer k, return the k most frequent words.

The ordering rules are:
Higher frequency comes first.
If two words have the same frequency, the lexicographically smaller word comes first.

**Example:** `words = ["i","love","leetcode","i","love","coding"], k = 2` → `["i","love"]`

```
BRUTE FORCE | O(N + M * K) | O(N)

Repeatedly find the most frequent word, remove it from the list, and add it to the result until k words are found.

-----------------------------------------------------------------------------

HASH MAP + SORT | O(N + M log M) | O(N)

Count the frequency of each word using a hash map, then sort the words by frequency and lexicographical order, and return the first k words.

count frequency of every word
create list of unique words
sort words using:
    if frequency(word1) != frequency(word2)
        higher frequency first
    else
        lexicographically smaller word first
return first k words

-----------------------------------------------------------------------------

MIN HEAP | O(N + M log K + K log K) M: Unique words | O(M + K)

count frequencies
create minHeap using "worst candidate" comparator
for each unique word
    push word
    if heap size > k
        pop worst word

extract all words from heap
sort those k words using:
    higher frequency first
    if equal frequency
        lexicographically smaller first
return sorted result

-----------------------------------------------------------------------------

BUCKET SORT | O(N * M Log M) | O(N + M)

count frequency of every word
create buckets indexed by frequency
for each unique word
    add word to bucket[frequency(word)]

result = empty
for frequency from N down to 1
    sort bucket[frequency] lexicographically
    for each word in bucket[frequency]
        add word to result
        if result size == K
            return result
```

### 7. Meeting Rooms III

You are given: n meeting rooms numbered 0 to n - 1 and a list of meetings [start, end]

Rules:

A meeting should use the unused room with the smallest room number.
If no room is available when a meeting starts, the meeting is delayed until a room becomes available.
When delayed, the meeting keeps the same duration.
Among rooms that become free at the same time, choose the smallest room number.
Return the room that hosted the most meetings.
If multiple rooms have the same count, return the smallest room number.

**Example:** `n = 2, meetings = [[0,10],[1,5],[2,7],[3,4]]` → `0`

```
HEAP | O(N log N) | O(N)

// Maintain 2 heaps: one for available rooms (min-heap by room number) and one for occupied rooms (min-heap by end time and Room Number). Process meetings in order of start time, assigning rooms according to the rules.

sort meetings by start time
create minHeap availableRooms
create minHeap busyRooms

for room = 0 to n - 1
    push room into availableRooms

create count[n] initialized to 0

for each [start, end] in meetings
    duration = end - start

    while busyRooms is not empty
          and busyRooms.min.endTime <= start
        busy = remove minimum from busyRooms
        push busy.roomNumber
        into availableRooms
    if availableRooms is not empty
        room = remove minimum from availableRooms
        finishTime = end
    else
        busy = remove minimum from busyRooms
        room = busy.roomNumber
        finishTime =
            busy.endTime + duration
    count[room]++
    push (finishTime, room)
    into busyRooms
bestRoom = 0
for room = 1 to n - 1
    if count[room] > count[bestRoom]
        bestRoom = room

return bestRoom
```

### 8. Find Median from Data Stream

Design a data structure that supports adding numbers and finding the median of the added numbers.

**Example:** `addNum(1), addNum(2), findMedian()` → `1.5`; then `addNum(3), findMedian()` → `2`

```
BRUTE FORCE | O(N log N) | O(N)

Add numbers to a list and sort it when finding the median

--------------------------------------------------------------------------------------

SORTED LIST | O(N) for add, O(1) for find median | O(N)

Maintain a sorted list and insert new numbers in the correct position. Find position using binary search and insert in O(N) time. Finding median is O(1).

--------------------------------------------------------------------------------------

HEAP | O(log N) for add, O(1) for find median | O(N)

// Use two heaps (max-heap for the lower half, min-heap for the upper half) to keep track of the median efficiently

left  = Max Heap
right = Min Heap

AddNum(num):
    if left is empty OR num <= left.max:
        add num to left
    else:
        add num to right

    if left has more than one extra:
        move max(left) → right

    if right has more:
        move min(right) → left

FindMedian():
    if left.size > right.size:
        return left.max
    return (left.max + right.min) / 2

--------------------------------------------------------------------------------------

BALANCED BST | O(log N) for add, O(1) for find median | O(N)

Create a balanced BST to store the numbers and maintain a pointer to the median. Insertion is O(log N) and finding the median is O(1).

```

### 9. Top K Frequent Elements

Given an integer array nums and an integer k, return the k most frequent elements.

**Example:** `nums = [1, 1, 1, 2, 2, 3], k = 2` → `[1, 2]`

```
HASHING + SORTING | O(N + M log M) | O(M)

Count each number's frequency
Sort the distinct numbers by frequency and return the first k

-------------------------------------------------------------------------------------

HASHING + MIN HEAP | O(N + M log K) | O(M + K)

frequency = count frequencies
minHeap = empty

for each (element, freq):
    if heap.size < k:
        add (element, freq)
    else if freq > heap.minimum.frequency:
        remove minimum
        add (element, freq)

return all elements in heap

-------------------------------------------------------------------------------------

BUCKET SORT | O(N) | O(N)

// Frequency at most n, so bucket sort is possible

frequency = count frequencies
buckets = array of n + 1 lists
for each (num, freq):
    buckets[freq].add(num)
result = []
for freq from n down to 1:
    for each num in buckets[freq]:
        add num to result
        if result.size == k:
            return result
```

## Greedy and Intervals

### 1. Merge Intervals

Given an array of intervals where `intervals[i] = [start, end]`, merge all overlapping intervals and return the resulting non-overlapping intervals.

**Example:** `intervals = [[1,3],[2,6],[8,10],[15,18]]` → `[[1,6],[8,10],[15,18]]`

```text
BRUTE FORCE | O(N^2) | O(1)

Repeatedly compare intervals and merge every overlapping pair

------------------------------------------------------------------------------------

SORTING | O(N log N) | O(1)

sort intervals by start
result = []
current = first interval

for each next interval:
    if next.start <= current.end:
        current.end = max(current.end, next.end)
    else:
        add current to result
        current = next
add current to result
return result
```

### 2. Insert Interval

Given an array of non-overlapping intervals sorted by start time and a new interval, insert the new interval and merge any overlaps.

**Example:** `intervals = [[1,3],[6,9]], newInterval = [2,5]` → `[[1,5],[6,9]]`

```text
MERGE INTERVALS | O(N) | O(N)

Insert the new interval in sorted order, then apply the Merge Intervals algorithm

------------------------------------------------------------------------------------

SINGLE PASS | O(N) | O(1)

result = []
i = 0

// Add intervals that end before newInterval starts
while i < n AND intervals[i].end < newInterval.start:
    add intervals[i] to result
    i++

// Merge intervals that overlap newInterval
while i < n AND intervals[i].start <= newInterval.end:
    newInterval.start = min(newInterval.start, intervals[i].start)
    newInterval.end = max(newInterval.end, intervals[i].end)
    i++

// Add the merged interval
add newInterval to result

// Add intervals that start after newInterval ends
while i < n:
    add intervals[i] to result
    i++

return result
```

### 3. Non-overlapping Intervals

Given an array of intervals: intervals[i] = [start, end]
Return the minimum number of intervals that must be removed so that the remaining intervals are non-overlapping.

**Example:** `intervals = [[1,2],[2,3],[3,4],[1,3]]` → `1`

```text
BRUTE FORCE | O(2^N) | O(1)

Explore every combination of intervals and return the minimum number of removed intervals that results in a non-overlapping set

------------------------------------------------------------------------------------

GREEDY | O(N log N) | O(1)

// Remove the interval with the larger end time to maximize the number of non-overlapping intervals

sort intervals by end
lastEnd = -infinity
removed = 0

for each interval:
    if interval.start >= lastEnd:
        keep interval
        lastEnd = interval.end
    else:
        remove interval
        removed++

return removed

GREEDY WITH START TIME SORTING | O(N log N) | O(1)

sort by start
lastEnd = intervals[0].end
removed = 0

for each next interval:
    if next.start < lastEnd:
        removed++
        lastEnd = min(lastEnd, next.end)
    else:
        lastEnd = next.end

return removed
```

### 4. Meeting Rooms

Given an array of meeting intervals: intervals[i] = [start, end]
Return the minimum number of conference rooms required so that all meetings can take place without conflicts.

**Example:** `intervals = [[0,30],[5,10],[15,20]]` → `2`

```text
BRUTE FORCE | O(N^2) | O(1)

Check every pair of intervals for overlap and return the maximum number of overlapping intervals

-------------------------------------------------------------------------------------

MIN HEAP | O(N log N) | O(N)

// Using min heap to track the end time of meetings, to reuse that room

sort intervals by start
minHeap = empty
for each interval:
    if minHeap is not empty AND minHeap.min <= interval.start:
        remove minimum end time
    add interval.end to minHeap

return size or max size of minHeap

-------------------------------------------------------------------------------------

SORTED ARRAYS | O(N log N) | O(N)

// Separate start and end times, sort them, and use two pointers to track the number of overlapping meetings

starts = all start times
ends = all end times
sort starts
sort ends
i = 0
j = 0
rooms = 0
maxRooms = 0

while i < n:
    if starts[i] < ends[j]:
        rooms++
        i++
        maxRooms = max(maxRooms, rooms)
    else:
        rooms--
        j++

return maxRooms
```

> - Use a min heap when the input is a stream of intervals, and use sorted arrays when the input is a fixed set of intervals.
> - HEAP: Which resource available next. SORTED ARRAYS: How many resources are in use at a given time.

### 5. Meeting Rooms II

Given an array of meeting intervals: intervals[i] = [start, end]
Return the minimum number of conference rooms required so that all meetings can take place without conflicts.

**Example:** `intervals = [[0,30],[5,10],[15,20]]` → `2`

```
SWEEP LINE | O(N log N) | O(N)

// Start +1, End -1. Create list of events sort and calculate running sum to find max overlap

starts = all meeting start times
ends = all meeting end times
sort starts
sort ends
i = 0
j = 0
rooms = 0
maxRooms = 0
while i < N
    if starts[i] < ends[j]
        rooms++
        maxRooms = max(maxRooms, rooms)
        i++
    else
        rooms--
        j++

return maxRooms

-------------------------------------------------------------------------------------

HEAP | O(N log N) | O(N)

// Min Heap tracks the end time of meetings, to reuse that room. The size of the heap is the number of rooms needed.

sort meetings by start time
create minHeap
maxRooms = 0
for each meeting [start, end]
    if minHeap is not empty
       and minHeap.minimum <= start
        remove minimum from minHeap
    add end to minHeap
    maxRooms = max(maxRooms, size of minHeap)

return maxRooms
```

### 6. Minimum Number of Arrows to Burst Balloons

Given an array of points where points[i] = [xstart, xend] represents a balloon whose horizontal diameter stretches between xstart and xend. Return the minimum number of arrows that must be shot to burst all balloons

**Example:** `points = [[10,16],[2,8],[1,6],[7,12]]` → `2`

```
BRUTE FORCE | O(N^2) | O(1)

Repeatedly find overlapping balloons and burst them with one arrow until all balloons are burst.

-----------------------------------------------------------------------------

SORTING | O(N log N) | O(1)

// Sort the balloons by their end points and shoot arrows at the end of each balloon, skipping any balloons that overlap with the last shot arrow.

sort balloons by end coordinate
arrows = 0
arrowPosition = -infinity
for each balloon [start, end]:
    if start > arrowPosition:
        // Current arrow cannot burst this balloon
        arrows++
        // Shoot at the balloon's end
        arrowPosition = end
return arrows
```

### 7. Jump Game

You are given an integer array nums. nums[i] tells you the maximum number of positions you can jump forward from index i.You start at index 0. Determine whether you can reach the last index.

**Example:** `nums = [2, 3, 1, 1, 4]` → `true`

```
DFS | O(2^N) | O(N)
Use depth-first search to explore all possible jumps from the current index. If you reach the last index, return true.

-----------------------------------------------------------------------------

DP | O(N^2) | O(N)
// dp[i] = whether we can reach the end from index i

function canJump(nums):
    n = length(nums)
    dp[n - 1] = true
    for i from n - 2 down to 0:
        maxReach = min(i + nums[i], n - 1)
        for j from i + 1 to maxReach:
            if dp[j] == true:
                dp[i] = true
                break
    return dp[0]

-----------------------------------------------------------------------------

GREEDY | O(N) | O(1)
// Keep track of the farthest index we can reach while iterating through the array.

function canJump(nums):
    farthest = 0
    for i from 0 to n - 1:
        if i > farthest:
            return false
        farthest = max(
            farthest,
            i + nums[i]
        )
        if farthest >= n - 1:
            return true
    return true
```

### 8. Jump Game II

You are given an integer array nums. nums[i] represents the maximum number of positions you can jump forward from index i. You start at index 0. Return the minimum number of jumps required to reach the last index. You can assume that the last index is always reachable.

**Example:** `nums = [2, 3, 1, 1, 4]` → `2`

```
DFS | O(2^N) | O(N)
Use depth-first search to explore all possible jumps from the current index. Keep track of the minimum number of jumps needed to reach the last index.

-----------------------------------------------------------------------------

DP | O(N^2) | O(N)

// dp[i] = minimum number of jumps to reach the end from index i

function minJumps(nums):
    n = length(nums)
    dp = array of size n
    fill dp with infinity
    dp[0] = 0
    for i from 0 to n - 1:
        for j from 1 to nums[i]:
            next = i + j
            if next >= n:
                break
            dp[next] = min(
                dp[next],
                dp[i] + 1
            )
    return dp[n - 1]

-----------------------------------------------------------------------------
GREEDY | O(N) | O(1)

// Keep track of the current range of reachable indices and the farthest index reachable in the next jump.

function jump(nums):
    jumps = 0                   // Number of jumps made so far
    currentEnd = 0              // The farthest index reachable with the current number of jumps
    farthest = 0                // The farthest index reachable with one more jump
    n = length(nums)
    for i from 0 to n - 2:
        farthest = max(
            farthest,
            i + nums[i]
        )
        if i == currentEnd:
            jumps++
            currentEnd = farthest
    return jumps
```

### 9. Gas Station

You are given two arrays: gas[i], cost[i]. There are N gas stations arranged in a circular route.

- gas[i] = amount of gas available at station i
- cost[i] = gas required to travel from station i to station (i + 1)

You start with an empty tank. Return the index of the gas station from which you can start and complete the entire circular route exactly once. If no solution exists, return -1.

**Example:** `gas = [1,2,3,4,5], cost = [3,4,5,1,2]` → `3`

```
BRUTE FORCE | O(N^2) | O(1)

For each gas station, simulate the journey around the circuit. If you can complete the circuit starting from that station, return its index. If no station allows a complete circuit, return -1.

// If total gas < total cost, then no solution exists.

-----------------------------------------------------------------------------

GREEDY | O(N) | O(1)

// If starting at start causes the tank to become negative at station i, then none of the stations between start and i can be a valid starting point either.

function gasStation(gas, cost):
    totalTank = 0                       // Tracks the total gas surplus across the entire route
    currentTank = 0                     // Tracks the current gas surplus from the starting station
    start = 0                           // Current candidate starting station.
    n = length(gas)
    for i from 0 to n - 1:
        gain = gas[i] - cost[i]
        totalTank += gain
        currentTank += gain
        if currentTank < 0:
            start = i + 1
            currentTank = 0
    if totalTank >= 0:
        return start
    return -1
```

### 10. Partition Labels

You are given a string s. You need to partition the string into as many parts as possible such that: Each character appears in at most one partition. After partitioning, return the sizes of all partitions.
Example - s = "ababcbacadefegdehijhklij" > "ababcbaca" | "defegde" | "hijhklij" > [9, 7, 8]

**Example:** `s = "ababcbacadefegdehijhklij"` → `[9, 7, 8]`

```
BRUTE FORCE | O(N^2) | O(1)

Search for the last occurrence of each character in the string and create partitions accordingly.

-----------------------------------------------------------------------------

GREEDY | O(N) | O(1)

// Pre calculate the last occurrence of each character, then iterate through the string to create partitions based on the last occurrences. If all characters in the current partition have their last occurrence within the partition, we can finalize the partition.

function partitionLabels(s):
    last = array/map
    // Find last occurrence of every character
    n = length(s)
    for i from 0 to n - 1:
        last[s[i]] = i
    result = []
    start = 0
    end = 0
    for i from 0 to n - 1:
        end = max(end, last[s[i]])
        if i == end:
            result.add(i - start + 1)
            start = i + 1
    return result
```

## Bit Manipulation

- Get the last bit : i & 1
- Remove the last bit : i >> 1
- Remove the lowest set bit : i & (i - 1)
- Count set bits while (i != 0) { i &= i - 1; count++; }

### 1. Single Number

Every element appears twice except for one. Find that single one.

**Example:** `nums = [4, 1, 2, 1, 2]` → `4`

```
BRUTE FORCE | O(N^2) | O(1)
Check each element against all others to find the unique one.

-----------------------------------------------------------------------------
HASH MAP | O(N) | O(N)

Check the frequency of each element using a hash map and return the one with a frequency of 1.

-----------------------------------------------------------------------------
BIT MANIPULATION | O(N) | O(1)
Use XOR operation to find the unique element. XOR of a number with itself is 0 and XOR of a number with 0 is the number itself.

function singleNumber(nums):
    result = 0
    for num in nums:
        result = result XOR num
    return result
```

### 2. Number of 1 Bits

Given an unsigned integer, return the number of '1' bits it has (also known as the Hamming weight).

**Example:** `n = 11` (binary `1011`) → `3`

```
BRUTE FORCE | O(Log N) | O(1)

Divide the number by 2 repeatedly and count the number of times the remainder is 1.

-----------------------------------------------------------------------------

BIT MANIPULATION | O(32) | O(1)

// Bitwise AND the number with 1 and right shift the number until it becomes 0, counting the number of times the result is 1.

count = 0
while n != 0:
    if (n & 1) == 1:
        count++
    n = n >> 1
return count

------------------------------------------------------------------------------

OPTIMIZED BIT MANIPULATION | O(1) | O(1)

// Use n & (n - 1) to turn off the rightmost 1-bit and count how many times this operation can be performed until n becomes 0.

count = 0
while n != 0:
    n = n & (n - 1)
    count++
return count
```

### 3. Counting Bits

Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1's in the binary representation of i.

**Example:** `n = 5` → `[0, 1, 1, 2, 1, 2]`

```
BRUTE FORCE | O(N log N) | O(N)
For each number from 0 to n, count the number of 1 bits using the method from the "Number of 1 Bits" problem.

-----------------------------------------------------------------------------
DP | O(N) | O(N)

// number of 1s in i = number of 1s in (i >> 1) + last bit of i
// ans[i] = ans[i >> 1] + (i & 1)

ans = array of size n + 1
ans[0] = 0
for i from 1 to n:
    ans[i] = ans[i >> 1] + (i & 1)
return ans

// Also ans[i] = ans[i & (i - 1)] + 1
```

### 4. Reverse Bits

Given a 32-bit unsigned integer, reverse its bits.

**Example:** `n = 43261596` (`00000010100101000001111010011100`) → `964176192` (`00111001011110000010100101000000`)

```
BIT MANIPULATION | O(32) | O(1)

result = 0
repeat 32 times:
    bit = n & 1
    result = result << 1
    result = result | bit
    n = n >> 1
return result
```

### 5. Sum of Two Integers

Given two integers a and b, return the sum of the two integers without using the operators + and -.

**Example:** `a = 2, b = 3` → `5`

```
BIT MANIPULATION | O(1) | O(1)

// sum without carry = a ^ b
// carry = (a & b) << 1

while b != 0:
    carry = (a AND b) << 1
    a = a XOR b
    b = carry
return a
```

### 6. Power of Two

Given an integer n, return true if it is a power of two. Otherwise, return false.

**Example:** `n = 16` → `true`

```
n > 0 && (n & (n - 1)) == 0
```

### 7. Pow(x, n)

Implement pow(x, n), which calculates x raised to the power n (i.e., x^n).

**Example:** `x = 2.0, n = 10` → `1024.0`

```
BRUTE FORCE | O(N) | O(1)

Repeated multiplication of x, n times. If n is negative, compute 1 / (x^(-n)).

-----------------------------------------------------------------------------

RECURSION | O(log N) | O(log N)

// X^N = X^(N/2) * X^(N/2) if N is even
// X^N = X^(N/2) * X^(N/2) * X if N is odd

function power(x, n):
    if n == 0:
        return 1
    half = power(x, n / 2)
    if n is even:
        return half * half
    else:
        return x * half * half

------------------------------------------------------------------------------

BINARY EXPONENTIATION | O(log N) | O(1)

// Use the binary representation of n to compute x^n efficiently. For each bit in n, square the current result and multiply by x if the bit is set.

if n == 0:
    return 1
if n < 0:
    x = 1 / x
    n = -n
result = 1
while n > 0:
    if n is odd:
        result = result * x
    x = x * x
    n = n / 2
return result
```

## Backtracking

Template - Subsets, Permutations, Combinations

CHECK > MARK > EXPLORE > UNMARK

### 1. Subssets

Given an integer array nums of unique elements, return all possible subsets (the power set).

**Example:** `nums = [1, 2, 3]` → `[[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]`

```
BACKTRACKING | O(N * 2^N) | O(N)

At each element, choose to include it in the current subset or not. Recursively build all subsets.

function subsets(nums):
    result = []
    current = []
    backtrack(index):
        if index == length(nums):
            result.add(copy(current))
            return
        // Choice 1: include nums[index]
        current.add(nums[index])
        backtrack(index + 1)
        current.removeLast()
        // Choice 2: don't include nums[index]
        backtrack(index + 1)
    backtrack(0)
    return result
```

### 2. Subsets II

Given an integer array nums that may contain duplicates, return all possible subsets (the power set) without duplicate subsets.

**Example:** `nums = [1, 2, 2]` → `[[],[1],[2],[1,2],[2,2],[1,2,2]]`

```
BACKTRACKING | O(N * 2^N) | O(N)

Sort the array to handle duplicates. At each element, choose to include it in the current subset or not, skipping duplicates.

function subsetsWithDup(nums):
    sort(nums)
    result = []
    current = []
    backtrack(start):
        result.add(copy(current))
        for i from start to n - 1:
            // Skip duplicate choices
            // at the same recursion level.
            if i > start AND nums[i] == nums[i - 1]:
                continue
            // Choose
            current.add(nums[i])
            // Explore
            backtrack(i + 1)
            // Undo
            current.removeLast()
    backtrack(0)
    return result
```

### 3. Permutations

Given an integer array nums of unique elements, return all possible permutations.

**Example:** `nums = [1, 2, 3]` → `[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]`

```
BACKTRACKING | O(N * N!) | O(N)

For each position in the permutation, choose an unused number from nums and recursively build the permutation.

function permutations(nums):
    result = []
    current = []
    used = array of false
    backtrack():
        if current.size == nums.length:
            result.add(copy(current))
            return
        for i from 0 to nums.length - 1:
            if used[i]:
                continue
            // Choose
            used[i] = true
            current.add(nums[i])
            // Explore
            backtrack()
            // Undo
            current.removeLast()
            used[i] = false
    backtrack()
    return result


-----------------------------------------------------------------------------

SWAP | O(N * N!) | O(N)

// At each recursion level, swap the current index with each of the remaining indices to generate permutations.

function permutations(nums):
    result = []
    backtrack(start):
        if start == nums.length:
            result.add(copy(nums))
            return
        for i from start to nums.length - 1:
            swap(nums[start], nums[i])
            backtrack(start + 1)
            swap(nums[start], nums[i])  // undo
    backtrack(0)
    return result
```

### 4. Combination Sum

Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. You may return the combinations in any order. The same number may be chosen from candidates an unlimited number of times.

**Example:** `candidates = [2, 3, 6, 7], target = 7` → `[[2,2,3],[7]]`

```
BACKTRACKING | O(N^(T/m)) | O(T/m)
Where T is the target and m is the minimum value in candidates. The maximum depth of the recursion tree is T/m, and at each level, we have N choices (the number of candidates).

function combinationSum(candidates, target):
    sort(candidates)
    result = []
    current = []
    backtrack(start, remaining):
        if remaining == 0:
            result.add(copy(current))
            return
        for i from start to n - 1:
            if candidates[i] > remaining:
                break
            current.add(candidates[i])
            // i, not i+1
            backtrack(i, remaining - candidates[i])
            current.removeLast()
    backtrack(0, target)
    return result

```

### 5. Combination Sum II

Given a collection of candidate numbers (candidates) and a target number (target), find all unique combinations in candidates where the candidate numbers sum to target. Each number in candidates may only be used once in the combination. Input may contain duplicates.

**Example:** `candidates = [10,1,2,7,6,1,5], target = 8` → `[[1,1,6],[1,2,5],[1,7],[2,6]]`

```
BACKTRACKING | O(N * 2^N) | O(N)
Where T is the target and m is the minimum value in candidates. The maximum depth of the recursion tree is T/m, and at each level, we have N choices (the number of candidates).

// Sort the candidates
// Dont reuse the same element in the same recursion level
// Skip duplicates in the same recursion level

function combinationSum2(candidates, target):
    sort(candidates)
    result = []
    current = []
    backtrack(start, remaining):
        if remaining == 0:
            result.add(copy(current))
            return
        for i from start to n - 1:
            // Skip duplicate choices
            // at the same recursion level.
            if i > start AND
               candidates[i] == candidates[i - 1]:
                continue
            // Since sorted, nothing after this can fit.
            if candidates[i] > remaining:
                break
            // Choose
            current.add(candidates[i])
            // Cannot reuse this element.
            backtrack(i + 1, remaining - candidates[i])
            // Undo
            current.removeLast()
    backtrack(0, target)
    return result
```

### 6. Letter Combinations of a Phone Number

Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. Return the answer in any order. A mapping of digit to letters (just like on the telephone buttons) is given below. Note that 1 does not map to any letters.

**Example:** `digits = "23"` → `["ad","ae","af","bd","be","bf","cd","ce","cf"]`

```
BACKTRACKING | O(4^N) | O(N)
Where N is the length of the input digits. Each digit can map to at most 4 letters, leading to a maximum of 4^N combinations.

function letterCombinations(digits):
    mapping = ["","","abc","def","ghi","jkl","mno","pqrs","tuv","wxyz"]
    if digits is empty:
        return []
    result = []
    current = ""
    backtrack(index):
        if index == length(digits):
            result.add(current)
            return
        letters = mapping[digits[index]]
        for letter in letters:
            current += letter
            backtrack(index + 1)
            current remove last character
    backtrack(0)
    return result
```

### 7. Generate Parentheses

Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.

**Example:** `n = 3` → `["((()))","(()())","(())()","()(())","()()()"]`

```

BACKTRACKING | O(4^N) | O(N)
Where N is the number of pairs of parentheses.

function generateParenthesis(n):
    result = []
    current = ""
    backtrack(open, close):
        if length(current) == 2 * n:
            result.add(current)
            return
        if open < n:
            current += "("
            backtrack(open + 1, close)
            current remove last character
        if close < open:
            current += ")"
            backtrack(open, close + 1)
            current remove last character
    backtrack(0, 0)
    return result
```

### 8. Word Search

Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.

**Example:** `board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"` → `true`

```
BACKTRACKING | O(M * N * 4^L) | O(M * N)
Where M is the number of rows, N is the number of columns, and L is the length of the word. Each cell can lead to 4 possible directions (up, down, left, right) for each character in the word.

function exist(board, word):
    rows = number of rows
    cols = number of columns
    visited = false matrix
    for row from 0 to rows - 1:
        for col from 0 to cols - 1:
            if backtrack(row, col, 0):
                return true
    return false

function backtrack(row, col, index):
    if index == word.length:
        return true
    if outside grid:
        return false
    if visited[row][col]:
        return false
    if board[row][col] != word[index]:
        return false
    // Choose
    visited[row][col] = true
    // Explore
    found =
        backtrack(row + 1, col, index + 1)
        OR
        backtrack(row - 1, col, index + 1)
        OR
        backtrack(row, col + 1, index + 1)
        OR
        backtrack(row, col - 1, index + 1)
    // Undo
    visited[row][col] = false
    return found

-----------------------------------------------------------------------------

OPTIMIZED BACKTRACKING | O(M * N * 4^L) | O(L)

// Instead of using a visited matrix, temporarily mark the cell as visited by changing its value. Restore it after exploring.

function backtrack(row, col, index):
    if index == word.length:
        return true
    if invalid position:
        return false
    if board[row][col] != word[index]:
        return false
    original = board[row][col]
    // Mark visited
    board[row][col] = '#'
    found =
        backtrack(down)
        OR
        backtrack(up)
        OR
        backtrack(right)
        OR
        backtrack(left)
    // Undo
    board[row][col] = original
    return found
```

## Trees

### 1. Binary Tree InOrder Traversal

Given the root of a binary tree, return the inorder traversal of its nodes' values.

**Example:** `root = [1, null, 2, 3]` → `[1, 3, 2]`

```
RECURSION | O(N) | O(N)

INORDER(root):
    if root is null:
        return
    INORDER(root.left)
    add root.value to result
    INORDER(root.right)

------------------------------------------------------------------------------

ITERATIVE | O(N) | O(N)

INORDER(root):
    stack = empty stack
    current = root
    result = []
    while current is not null OR stack is not empty:
        while current is not null:
            push current onto stack
            current = current.left
        current = pop stack
        add current.value to result
        current = current.right
    return result
```

### 2. Maximum Depth of Binary Tree

Given the root of a binary tree, return its maximum depth.

**Example:** `root = [3, 9, 20, null, null, 15, 7]` → `3`

```
DFS | O(N) | O(H)

MAX_DEPTH(root):
    if root is null:
        return 0
    leftDepth = MAX_DEPTH(root.left)
    rightDepth = MAX_DEPTH(root.right)
    return 1 + max(leftDepth, rightDepth)

------------------------------------------------------------------------------
BFS | O(N) | O(N)

MAX_DEPTH(root):
    if root is null:
        return 0
    queue = [root]
    depth = 0
    while queue is not empty:
        numberOfNodes = size(queue)
        repeat numberOfNodes times:
            node = dequeue(queue)
            if node.left exists:
                enqueue node.left
            if node.right exists:
                enqueue node.right
        depth++
    return depth
```

### 3. Binary Tree Level Order Traversal

Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).

**Example:** `root = [3, 9, 20, null, null, 15, 7]` → `[[3],[9,20],[15,7]]`

```
LEVEL_ORDER(root):
    if root is null:
        return []
    queue = [root]
    result = []
    while queue is not empty:
        level = []
        levelSize = size(queue)
        repeat levelSize times:
            node = dequeue(queue)
            add node.value to level
            if node.left exists:
                enqueue node.left
            if node.right exists:
                enqueue node.right
        add level to result
    return result
```

### 4. Validate Binary Search Tree

Given the root of a binary tree, determine if it is a valid binary search tree (BST).

**Example:** `root = [2, 1, 3]` → `true`

```
BRUTE FORCE | O(N^2) | O(N)

For every node, check if all nodes in the left subtree are less than the node's value and all nodes in the right subtree are greater than the node's value.

-----------------------------------------------------------------------------
RECURSION | O(N) | O(H)

IS_BST(root):
    return VALID(root, -infinity, +infinity)

VALID(node, minValue, maxValue):
    if node is null:
        return true
    if node.value <= minValue OR node.value >= maxValue:
        return false
    return VALID(node.left, minValue, node.value)
           AND
           VALID(node.right, node.value, maxValue)
```

### 5. Kth Smallest Element in a BST

Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.

**Example:** `root = [3, 1, 4, null, 2], k = 1` → `1`

```
// Use in-order traversal to get the elements in sorted order and return the kth element.

ITERATIVE | O(H + k) | O(H)

KTH_SMALLEST(root, k):
    stack = []
    current = root
    while true:
        while current is not null:
            push current
            current = current.left
        current = pop stack
        k--
        if k == 0:
            return current.value
        current = current.right
```

### 6. Lowest Common Ancestor of a Binary Tree

Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.
LCA is the lowest node that has both nodes as descendants (where we allow a node to be a descendant of itself).

**Example:** `root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1` → `3`

```
PATH BASED | O(N) | O(N)

Find path to each node, then compare the paths to find the last common node.

-----------------------------------------------------------------------------

RECURSION | O(N) | O(H)

// Search left and right subtrees for the two nodes. If both nodes are found in different subtrees, the current node is the LCA.

LCA(root, p, q):
    if root is null:
        return null
    if root == p OR root == q:
        return root
    left = LCA(root.left, p, q)
    right = LCA(root.right, p, q)
    if left is not null AND right is not null:
        return root
    if left is not null:
        return left
    return right
```

### 7. Diameter of Binary Tree

Given the root of a binary tree, return the length of the diameter of the tree. The diameter of a binary tree is the length of the longest path between any two nodes in a tree. This path may or may not pass through the root.

**Example:** `root = [1, 2, 3, 4, 5]` → `3`

```
BRUTE FORCE | O(N^2) | O(N)

diameter through node = height(left) + height(right)
Calculate the diameter for each node and return the maximum.

-----------------------------------------------------------------------------

ITERATIVE | O(N) | O(H)

Caclulate the height of each subtree while keeping track of the maximum diameter found so far.

DIAMETER(root):
    answer = 0
    HEIGHT(node):
        if node is null:
            return 0
        leftHeight = HEIGHT(node.left)
        rightHeight = HEIGHT(node.right)
        answer = max(answer, leftHeight + rightHeight)
        return 1 + max(leftHeight, rightHeight)
    HEIGHT(root)
    return answer
```

### 8. Binary Tree Maximum Path Sum

Given a non-empty binary tree of integers, find the maximum path sum. A path is defined as any sequence of nodes from some starting node to any node in the tree along the parent-child connections. The path must contain at least one node and does not need to go through the root.

**Example:** `root = [-10, 9, 20, null, null, 15, 7]` → `42`

```
BRUTE FORCE | O(N^2) | O(N)

Calculate the maximum path sum for each node by considering all possible paths through that node.

-----------------------------------------------------------------------------

BOTTOM-UP DP | O(N) | O(H)

For a node, either include the left child, right child, or neither in the path. Keep track of the maximum path sum found so far.

MAX_PATH_SUM(root):
    answer = -infinity
    GAIN(node):
        if node is null:
            return 0
        leftGain = GAIN(node.left)
        rightGain = GAIN(node.right)
        leftGain = max(0, leftGain)
        rightGain = max(0, rightGain)
        pathThroughNode = leftGain + node.value + rightGain
        answer = max(answer, pathThroughNode)
        return node.value + max(leftGain, rightGain)
    GAIN(root)
    return answer
```

### 9. Binary Tree Right Side View

Given the root of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.

**Example:** `root = [1, 2, 3, null, 5, null, 4]` → `[1, 3, 4]`

```
BFS | O(N) | O(N)

// Do level order traversal and add the last node of each level to the result.

RIGHT_SIDE_VIEW(root):
    if root is null:
        return []
    queue = [root]
    result = []
    while queue is not empty:
        levelSize = size(queue)
        repeat levelSize times:
            node = dequeue(queue)
            if node.left exists:
                enqueue node.left
            if node.right exists:
                enqueue node.right
            if this is the last node of current level:
                add node.value to result
    return result

-----------------------------------------------------------------------------

DFS | O(N) | O(H)

// Do a depth-first traversal, prioritizing the right child then left. Keep track of the depth and add the first node encountered at each depth to the result.

RIGHT_SIDE_VIEW(root):
    result = []
    DFS(node, depth):
        if node is null:
            return
        if depth == size(result):
            add node.value to result
        DFS(node.right, depth + 1)
        DFS(node.left, depth + 1)
    DFS(root, 0)
    return result
```

### 10. Construct Binary Tree from Preorder and Inorder Traversal

Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree.

**Example:** `preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]` → `[3,9,20,null,null,15,7]`

```
BRUTE FORCE | O(N^2) | O(N)

For each node in the preorder array, find its index in the inorder array to determine the left and right subtrees. Recursively build the tree.

-----------------------------------------------------------------------------

HASHMAP | O(N) | O(N)

// Use a hashmap to store the indices of the inorder values for O(1) lookups. Recursively build the tree using the preorder array to determine the root nodes.

BUILD(preorder, inorder):
    inorderIndex = hashmap()
    for i from 0 to inorder.length - 1:
        inorderIndex[inorder[i]] = i
    preorderIndex = 0
    BUILD_TREE(left, right):
        if left > right:
            return null
        rootValue = preorder[preorderIndex]
        preorderIndex++
        root = new Node(rootValue)
        mid = inorderIndex[rootValue]
        root.left = BUILD_TREE(left, mid - 1)
        root.right = BUILD_TREE(mid + 1, right)
        return root
    return BUILD_TREE(0, inorder.length - 1)
```

### 11. Serialize and Deserialize Binary Tree

Design an algorithm to serialize and deserialize a binary tree.

**Example:** `root = [1,2,3,null,null,4,5]` → serialize → deserialize → `[1,2,3,null,null,4,5]`

```
PREORDER TRAVERSAL | O(N) | O(N)

// Consider the tree as a string representation using pre-order traversal. Use a special character to denote null nodes.

SERIALIZE(node):
    if node is null:
        return "#"
    return node.value + ","
           + SERIALIZE(node.left) + ","
           + SERIALIZE(node.right)

DESERIALIZE():
    token = next token
    if token == "#":
        return null
    node = new Node(token)
    node.left = DESERIALIZE()
    node.right = DESERIALIZE()
    return node
```

### 12. House Robber III

Given the root of a binary tree, return the maximum amount of money the thief can rob without alerting the police. The thief cannot rob two directly-linked houses.

**Example:** `root = [3, 2, 3, null, 3, null, 1]` → `7`

```
BRUTE FORCE | O(2^N) | O(H)

For each node, decide whether to rob it or not. If you rob it, you cannot rob its children. If you don't rob it, you can rob its children. Recursively calculate the maximum amount for each choice.

-----------------------------------------------------------------------------

DP | O(N) | O(H)

// For each node calculate rob[node] and notRob[node].
// rob = node.value + left.notRob + right.notRob
// notRob = max(left.rob, left.notRob) + max(right.rob, right.notRob)

HOUSE_ROBBER(root):
    DFS(node):
        if node is null:
            return (0, 0)
        left = DFS(node.left)
        right = DFS(node.right)
        rob = node.value + left.notRob + right.notRob
        notRob = max(left.rob, left.notRob) + max(right.rob, right.notRob)
        return (rob, notRob)
    result = DFS(root)
    return max(result.rob, result.notRob)
```

## Graphs

### 1. Number of Islands

Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

**Example:** `grid = [["1","1","0"],["1","0","0"],["0","0","1"]]` → `2`

```
DFS | O(M * N) | O(M * N)

NUMBER_OF_ISLANDS(grid):
    rows = grid.rows
    cols = grid.cols
    islands = 0
    for r = 0 to rows - 1:
        for c = 0 to cols - 1:
            if grid[r][c] == '1':
                islands++
                DFS(r, c)
    return islands

DFS(r, c):
    if r < 0 OR r >= rows OR
       c < 0 OR c >= cols:
        return
    if grid[r][c] != '1':
        return
    grid[r][c] = '0'
    DFS(r + 1, c)
    DFS(r - 1, c)
    DFS(r, c + 1)
    DFS(r, c - 1)
```

### 2. Clone Graph

Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node in the graph contains a value (int) and a list (List[Node]) of its neighbors.

**Example:** `adjList = [[2,4],[1,3],[2,4],[1,3]]` → an identical, fully independent deep copy

```
DFS + HASHMAP | O(V + E) | O(V)

// Need hashmap to keep track of visited nodes and their corresponding cloned nodes.

CLONE_GRAPH(node):
    if node == null:
        return null
    visited = empty hashmap
    return DFS(node)

DFS(node):
    if node exists in visited:
        return visited[node]
    clone = new Node(node.value)
    visited[node] = clone
    for neighbor in node.neighbors:
        clonedNeighbor = DFS(neighbor)
        clone.neighbors.add(clonedNeighbor)
    return clone
```

### 3. Pacific Atlantic Water Flow

Given an m x n matrix of non-negative integers representing the height of each unit cell in a continent, the "Pacific ocean" touches the left and top edges of the matrix and the "Atlantic ocean" touches the right and bottom edges. Water can only flow in four directions (up, down, left, or right) from a cell to another one with height equal or lower. Find the list of grid coordinates where water can flow to both the Pacific and Atlantic ocean.

**Example:** `heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]` → `[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]`

```
BRUTE FORCE DFS | O((R * C)^2) | O(R * C)

From every cell, perform DFS to check if it can reach both oceans.

------------------------------------------------------------------------------

REVERSAL DFS | O(R * C) | O(R * C)

// Start from edge cells adjacent to the Pacific and Atlantic oceans and perform DFS to mark all cells that can reach each ocean. The intersection of these two sets gives the result.

PACIFIC_ATLANTIC(heights):
    pacific = empty set
    atlantic = empty set
    for every cell touching Pacific:
        DFS(cell, pacific)
    for every cell touching Atlantic:
        DFS(cell, atlantic)
    result = intersection(pacific, atlantic)
    return result

DFS(r, c, reachable):
    if cell already in reachable:
        return
    add (r, c) to reachable
    for each direction:
        nr = r + dr
        nc = c + dc
        if outside grid:
            continue
        if heights[nr][nc] < heights[r][c]:
            continue
        DFS(nr, nc, reachable)
```

### 4. Course Schedule

There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses. Otherwise, return false.

Does the directed graph contain a cycle?

**Example:** `numCourses = 2, prerequisites = [[1,0]]` → `true`

```
DFS CYCLE DETECTION | O(V + E) | O(V)

// 0 = unvisited, 1 = currently visiting, 2 = completely processed

CAN_FINISH(numCourses, prerequisites):
    graph = build adjacency list
    state = array filled with 0
    for course = 0 to numCourses - 1:
        if state[course] == 0:
            if DFS(course):
                return false
    return true

DFS(course):
    if state[course] == 1:
        return true       // cycle
    if state[course] == 2:
        return false      // already processed
    state[course] = 1    // visiting
    for next in graph[course]:
        if DFS(next):
            return true
    state[course] = 2    // completed
    return false

------------------------------------------------------------------------------

TOPOLOGICAL SORT | O(V + E) | O(V)

// If we can remove all nodes with indegree 0, there is no cycle
// Indegree = number of incoming edges

indegree = calculate indegrees
queue = all nodes with indegree 0
processed = 0
while queue not empty:
    course = dequeue
    processed++
    for next in graph[course]:
        indegree[next]--
        if indegree[next] == 0:
            enqueue(next)
return processed == numCourses
```

### 5. Course Schedule II

Same as Course Schedule, but return the order of courses to finish all courses. If there are multiple valid orders, return any of them. If it is impossible to finish all courses, return an empty array.

**Example:** `numCourses = 2, prerequisites = [[1,0]]` → `[0, 1]`

```
DFS TOPOLOGICAL SORT | O(V + E) | O(V + E)

state = 0 for all nodes
result = []

DFS(course):
    if state[course] == 1:
        cycle
        return false
    if state[course] == 2:
        return true
    state[course] = 1
    for next in graph[course]:
        if DFS(next) == false:
            return false
    state[course] = 2
    add course to result
    return true

reverse(result)

------------------------------------------------------------------------------

KAHN'S ALGORITHM | O(V + E) | O(V + E)

COURSE_ORDER(numCourses, prerequisites):
    graph = adjacency list
    indegree = array
    for each prerequisite:
        graph[prerequisite] add course
        indegree[course]++
    queue = all courses with indegree == 0
    result = []
    while queue not empty:
        course = dequeue
        result.add(course)
        for next in graph[course]:
            indegree[next]--
            if indegree[next] == 0:
                enqueue(next)
    if result.size != numCourses:
        return []
    return result
```

### 6. Rotten Oranges

You are given an m x n grid where each cell can have one of three values:

- 0 representing an empty cell,
- 1 representing a fresh orange, or
- 2 representing a rotten orange.
  Every minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten.
  Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.

**Example:** `grid = [[2,1,1],[1,1,0],[0,1,1]]` → `4`

```
BRUTE FORCE | O(M * N * Minutes) | O(M * N)

Simulate the rotting process minute by minute, updating the grid until no fresh oranges remain or no more can rot.

------------------------------------------------------------------------------

MULTI-SOURCE BFS | O(M * N) | O(M * N)

ROTTING_ORANGES(grid):
    queue = empty
    fresh = 0
    for every cell:
        if cell == 2:
            queue.enqueue(cell)
        if cell == 1:
            fresh++
    minutes = 0
    while queue not empty AND fresh > 0:
        levelSize = queue.size
        repeat levelSize times:
            cell = queue.dequeue()
            for each direction:
                neighbor = adjacent cell
                if neighbor is fresh:
                    make neighbor rotten
                    fresh--
                    queue.enqueue(neighbor)
        minutes++
    if fresh > 0:
        return -1
    return minutes
```

### 7. Word Ladder

Given two words (beginWord and endWord), and a dictionary's word list, find the length of the shortest transformation sequence from beginWord to endWord, such that:

1. Only one letter can be changed at a time.
2. Each transformed word must exist in the word list. Note that beginWord is not a transformed word.

**Example:** `beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]` → `5`

```
BFS | O(N * M) | O(N * M)
Where N is the number of words in the word list and M is the length of each word.

// Unweighted shortest path problem

WORD_LADDER(beginWord, endWord, wordList):
    dictionary = HashSet(wordList)
    if endWord not in dictionary:
        return 0
    queue = [(beginWord, 1)]
    visited = {beginWord}
    while queue not empty:
        (word, distance) = dequeue
        if word == endWord:
            return distance
        for i = 0 to word.length - 1:
            original = word[i]
            for c = 'a' to 'z':
                word[i] = c
                if word in dictionary
                   AND word not in visited:
                    visited.add(word)
                    enqueue(word, distance + 1)
            word[i] = original
    return 0

-------------------------------------------------------------------------------

BIDIRECTIONAL BFS | O(N * M) | O(N * M)
Where N is the number of words in the word list and M is the length of each word.

// Search from both the beginWord and endWord simultaneously to reduce the search space.

front = {beginWord}
back = {endWord}
visited = {beginWord, endWord}
distance = 1
while front not empty AND back not empty:
    always expand smaller frontier
    nextFront = empty set
    for word in front:
        generate all one-character neighbors
        for neighbor:
            if neighbor in back:
                return distance + 1
            if neighbor not visited:
                visited.add(neighbor)
                nextFront.add(neighbor)
    front = nextFront
    distance++
return 0
```

### 8. Graph Valid Tree

Given n nodes labeled from 0 to n - 1 and a list of undirected edges (each edge is a pair of nodes), write a function to check whether these edges make up a valid tree.

A valid tree must satisfy two conditions:

1. It must be fully connected (there is a path between any two nodes). Number of edges must be n - 1.
2. It must not contain any cycles.

**Example:** `n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]` → `true`

```
DFS | O(V + E) | O(V + E)

VALID_TREE(n, edges):
    if edges.length != n - 1:
        return false
    graph = build adjacency list
    visited = empty set
    DFS(0, -1)
    return visited.size == n

DFS(node, parent):
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor == parent:
            continue
        if neighbor in visited:
            return false
        if DFS(neighbor, node) == false:
            return false
    return true

------------------------------------------------------------------------------

UNION-FIND | O(V + E) | O(V)

// n nodes must have n - 1 edges to be a tree. Use union-find to detect cycles.

VALID_TREE(n, edges):
    if edges.length != n - 1:
        return false
    DSU = initialize(n)
    for (u, v) in edges:
        if FIND(u) == FIND(v):
            return false
        UNION(u, v)
    return true
```

### 9 Redundant Connection

Given a connected undirected graph of n nodes labeled from 1 to n, and an array edges where edges[i] = [ui, vi] indicates that there is an edge between ui and vi in the graph. The graph is a tree plus one additional edge. Return an edge that can be removed so that the resulting graph is a tree of n nodes. If there are multiple answers, return the answer that occurs last in the input.

**Example:** `edges = [[1,2],[1,3],[2,3]]` → `[2, 3]`

```
BRUTE FORCE | O(N^2) | O(N)

For each edge, remove it and check if the graph is still connected and acyclic.

------------------------------------------------------------------------------

UNION-FIND | O(E * α(V)) | O(V)
Where α(N) is the inverse Ackermann function, which grows very slowly and is practically constant for reasonable values of N.

// Process edge one by one. If both endpoints of an edge are already connected, then this edge is redundant.

findRedundantConnection(edges):
    n = number of nodes
    parent = array of size n + 1
    rank = array of size n + 1 initialized to 0
    FOR i = 1 TO n:
        parent[i] = i
    FOR each edge (u, v) in edges:
        IF union(u, v) == FALSE:
            RETURN (u, v)       // This edge creates a cycle
    RETURN NONE

find(x):
    IF parent[x] != x:
        parent[x] = find(parent[x])    // Path compression
    RETURN parent[x]

union(x, y):
    rootX = find(x)
    rootY = find(y)
    IF rootX == rootY:
        RETURN FALSE                    // Already connected → cycle
    IF rank[rootX] < rank[rootY]:
        parent[rootX] = rootY
    ELSE IF rank[rootX] > rank[rootY]:
        parent[rootY] = rootX
    ELSE:
        parent[rootY] = rootX
        rank[rootX] = rank[rootX] + 1
    RETURN TRUE
```

### 10. Network Delay Time

Given a network of n nodes, labeled from 1 to n, and a list of travel times as directed edges times[i] = (ui, vi, wi), where ui is the source node, vi is the target node, and wi is the time it takes for a signal to travel from source to target. We send a signal from a certain node k. Return the time it takes for all the n nodes to receive the signal. If it is impossible for all the n nodes to receive the signal, return -1.

**Example:** `times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2` → `2`

```
BELLMAN-FORD | O(V * E) | O(V)
// Relax all edges V - 1 times. If we can still relax an edge, then there is a negative cycle.

distance[K] = 0
others = infinity

repeat V - 1 times:
    for each (u, v, weight):
        distance[v] = min(distance[v], distance[u] + weight)

------------------------------------------------------------------------------

DIJKSTRA | O((V+E) * log(V)) | O(V + E)

NETWORK_DELAY(times, n, k):
    graph = adjacency list
    distance = array filled with infinity
    distance[k] = 0
    minHeap = empty
    push (0, k) into minHeap
    while minHeap not empty:
        (currentDistance, node) = pop minimum
        if currentDistance > distance[node]:
            continue
        for (neighbor, weight) in graph[node]:
            newDistance = currentDistance + weight
            if newDistance < distance[neighbor]:
                distance[neighbor] = newDistance
                push (newDistance, neighbor)
    answer = maximum distance
    if any distance == infinity:
        return -1
    return answer
```

### 11. Min cost to connect all points

You are given an array points representing integer coordinates of some points on a 2D-plane, where points[i] = [xi, yi]. The cost of connecting two points [xi, yi] and [xj, yj] is the manhattan distance between them: |xi - xj| + |yi - yj|, where |val| denotes the absolute value of val.
Return the minimum cost to make all points connected. All points are connected if there is exactly one simple path between any two points.

// Minimum Spanning Tree problem.

**Example:** `points = [[0,0],[2,2],[3,10],[5,2],[7,0]]` → `20`

```
KRUSKAL'S ALGORITHM | O(V ^ 2 Log V) | O(V^2)
Where E is the number of edges and V is the number of vertices.

// Sort all edges by weight and add them to the MST if they don't create a cycle (using union-find).
// Kruskal = Generate edges → Sort by weight → Union-Find → Take edge if components differ → Stop at V−1 edges.

FUNCTION minCostConnectPoints(points):
    n = number of points
    edges = empty list
    // Create all possible edges
    FOR i = 0 TO n - 1:
        FOR j = i + 1 TO n - 1:
            distance =
                ABS(points[i].x - points[j].x)
                + ABS(points[i].y - points[j].y)
            edges.ADD((distance, i, j))
    // Kruskal: process cheapest edges first
    SORT edges BY distance ASCENDING
    // Initialize Union-Find
    parent = array of size n
    rank = array of size n
    FOR i = 0 TO n - 1:
        parent[i] = i
        rank[i] = 0
    totalCost = 0
    edgesUsed = 0
    FOR each (cost, u, v) in edges:
        rootU = FIND(u)
        rootV = FIND(v)
        // If different components, connect them
        IF rootU != rootV:
            UNION(rootU, rootV)
            totalCost = totalCost + cost
            edgesUsed = edgesUsed + 1
            // MST has n - 1 edges
            IF edgesUsed == n - 1:
                BREAK
    RETURN totalCost

FUNCTION FIND(x):
    IF parent[x] != x:
        parent[x] = FIND(parent[x])
    RETURN parent[x]

FUNCTION UNION(x, y):
    rootX = FIND(x)
    rootY = FIND(y)
    IF rootX == rootY:
        RETURN
    IF rank[rootX] < rank[rootY]:
        parent[rootX] = rootY
    ELSE IF rank[rootX] > rank[rootY]:
        parent[rootY] = rootX
    ELSE:
        parent[rootY] = rootX
        rank[rootX] = rank[rootX] + 1

------------------------------------------------------------------------------

PRIM'S ALGORITHM | O(V^2) | O(V)

// At every step, select the unvisited point with the cheapest connection to the current MST

MIN_COST_CONNECT(points):
    n = points.length
    minCost = array filled with infinity
    visited = array filled with false
    minCost[0] = 0
    answer = 0
    repeat n times:
        u = unvisited node with smallest minCost[u]
        visited[u] = true
        answer += minCost[u]
        for v = 0 to n - 1:
            if visited[v]:
                continue
            cost = ManhattanDistance(points[u], points[v])
            minCost[v] = min(minCost[v], cost)
    return answer
```

### 12. Aliens Dictionary

Given a list of words from the dictionary, where words are sorted lexicographically by the rules of this new language, derive the order of letters in this language.

**Example:** `words = ["wrt","wrf","er","ett","rftt"]` → `"wertf"`

```
TOPOLOGICAL SORT | O(C + V + E) | O(V + E)
C: Total number of characters in all words
V: Number of unique characters
E: Number of edges in the graph

ALIEN_ORDER(words):
    graph = empty adjacency list
    indegree = hashmap
    add every character to graph
    add every character to indegree with 0
    for i = 0 to words.length - 2:
        a = words[i]
        b = words[i + 1]
        if a is invalid prefix of b:
            return ""
        for j = 0 to min(a.length, b.length) - 1:
            if a[j] != b[j]:
                u = a[j]
                v = b[j]
                if v not already in graph[u]:
                    graph[u].add(v)
                    indegree[v]++
                break
    queue = all characters with indegree 0
    result = ""
    while queue not empty:
        c = dequeue
        result += c
        for next in graph[c]:
            indegree[next]--
            if indegree[next] == 0:
                enqueue(next)
    if result.length != numberOfUniqueCharacters:
        return ""
    return result
```

## Dynamic Programming

### 1. Climbing Stairs

You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

**Example:** `n = 3` → `3`

```
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

### 2. House Robber

You have houses: [2, 7, 9, 3, 1] You cannot rob two adjacent houses. Find maximum money.

**Example:** `nums = [2, 7, 9, 3, 1]` → `12` (rob 2 + 9 + 1)

```
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

### 3. Coin Change

Given coins of different denominations and a total amount of money, find the fewest number of coins that you need to make up that amount. If that amount cannot be made up by any combination of the coins, return -1.

**Example:** `coins = [1, 2, 5], amount = 11` → `3` (5 + 5 + 1)

```
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

### 4. Partition Equal Subset Sum

Given a non-empty array nums containing only positive integers, find if the array can be partitioned into two subsets such that the sum of elements in both subsets is equal.

**Example:** `nums = [1, 5, 11, 5]` → `true` ([1, 5, 5] and [11])

```
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

### 5. Longest Increasing Subsequence

Given an integer array nums, return the length of the longest strictly increasing subsequence.

**Example:** `nums = [10, 9, 2, 5, 3, 7, 101, 18]` → `4` ([2, 3, 7, 101])

```
BRUTE FORCE | O(2^N) | O(N)

For each number, decide whether to include it in the subsequence or not.

------------------------------------------------------------------------------

DP | O(N^2) | O(N)

dp[i] = length of the longest increasing subsequence ending at index i
if nums[i] > nums[j]:
    dp[i] = max(dp[i], dp[j] + 1)

LIS(nums):
    n = nums.length
    dp = array filled with 1
    answer = 1
    for i = 0 to n - 1:
        for j = 0 to i - 1:
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
        answer = max(answer, dp[i])
    return answer

------------------------------------------------------------------------------

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

### 6. Longest Common Subsequence

Given 2 strings s1 and s2, return the length of their longest common subsequence. A subsequence of a string is a new string generated from the original string with some characters(can be none) deleted without changing the relative order of the remaining characters.

**Example:** `text1 = "abcde", text2 = "ace"` → `3` ("ace")

```
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

### 7. Edit Distance

Convert one string to another using the minimum number of operations. You have the following 3 operations permitted on a word:

1. Insert a character
2. Delete a character
3. Replace a character

**Example:** `word1 = "horse", word2 = "ros"` → `3`

```
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

### 8. Word Break

Given a string s and a dictionary of words wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.

**Example:** `s = "leetcode", wordDict = ["leet","code"]` → `true`

```
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

### 9. Unique Paths

Starting from the top-left corner of a m x n grid, you can only move either down or right at any point in time. Find the number of unique paths to reach the bottom-right corner of the grid.

**Example:** `m = 3, n = 7` → `28`

```
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

### 10. Minimum Path Sum

Given a m x n grid filled with non-negative numbers, find a path from top left to bottom right which minimizes the sum of all numbers along its path. You can only move either down or right at any point in time.

**Example:** `grid = [[1,3,1],[1,5,1],[4,2,1]]` → `7` (1→3→1→1→1)

```
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

### 11. Decode Ways

Given a string s containing only digits, return the number of ways to decode it. The mapping is 'A' -> 1, 'B' -> 2, ..., 'Z' -> 26. A leading zero is invalid.

**Example:** `s = "226"` → `3` ("BZ", "VF", "BBF")

```
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

### 12. Best Time to Buy and Sell Stock with Cooldown

Given array of prices for stocks. You can: Buy, Sell, Wait. But after selling, you must wait one day before buying again. Calculate the maximum profit you can achieve.

**Example:** `prices = [1, 2, 3, 0, 2]` → `3` (buy, sell, cooldown, buy, sell)

```
STATE MACHINE DP | O(N) | O(N)

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

### 13. Burst Balloons

You are given n balloons, indexed from 0 to n - 1. Each balloon is painted with a number on it represented by an array nums. You are asked to burst all the balloons. If you burst balloon i you will get nums[left] _nums[i]_ nums[right] coins. Here left and right are adjacent indices of i. After the burst, the left and right then become adjacent. Find maximum coins you can collect by bursting the balloons wisely. You may imagine nums[-1] = nums[n] = 1. They are not real therefore you cannot burst them.

**Example:** `nums = [3, 1, 5, 8]` → `167`

```
INTERVAL DP | O(N^3) | O(N^2)

// dp[left][right] = max coins from bursting all balloons between left and right
// Choose k as the last balloon burst: L ... k .. R : So on bursting k, we get nums[left] * nums[k] * nums[right] coins. The total coins is the sum of coins from left to k and k to right plus the coins from bursting k.
// dp[left][right] = max(dp[left][right], dp[left][k] + dp[k][right] + nums[left] × nums[k] × nums[right])

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
