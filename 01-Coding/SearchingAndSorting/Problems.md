# Searching and Sorting — Problems

## Binary Search

Given a sorted array of integers and a target value, return the index of the target if it exists in the array. Otherwise, return -1.

**Example:** `nums = [-1, 0, 3, 5, 9, 12], target = 9` → `4`

```text
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

> Pattern for exact, min valid, max valid, and first/last occurrence problems.

## Search in 2D Matrix

You are given an m × n matrix with these properties:

- Each row is sorted in ascending order.
- The first element of each row is greater than the last element of the previous row.

Determine whether a given target exists in the matrix.

**Example:** `matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3` → `true`

```text
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

## Search in Rotated Sorted Array

You are given an integer array nums sorted in ascending order, and an integer target. The array is rotated at an unknown pivot index. Determine if the target exists in the array.

**Example:** `nums = [4, 5, 6, 7, 0, 1, 2], target = 0` → `4`

```text
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

## Find Minimum in Rotated Sorted Array

Given an array of unique integers sorted in ascending order and rotated at an unknown pivot, find the minimum element.

**Example:** `nums = [3, 4, 5, 1, 2]` → `1`

```text
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

## Find Peak Element

A peak element is an element that is strictly greater than its neighbors. Given an integer array nums, find any peak element and return its index. You may assume that nums[-1] = nums[n] = -∞.

**Example:** `nums = [1, 2, 3, 1]` → `2`

```text
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

## Koko Eating Bananas

Koko has n piles of bananas. piles[i] is the number of bananas in pile i. She has exactly h hours to eat all the bananas.
Each hour:

- Koko chooses one pile.
- She eats at most k bananas from that pile.
- If fewer than k bananas remain, she eats the remaining bananas.
- She cannot eat from another pile during that same hour.

Find the minimum integer eating speed k that allows Koko to finish all bananas within h hours.

**Example:** `piles = [3, 6, 7, 11], h = 8` → `4`

```text
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

## Median of Two Sorted Arrays

Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

**Example:** `nums1 = [1, 3], nums2 = [2]` → `2.0`

```text
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

## Split Array Largest Sum

Given an array of non-negative integers nums and an integer m, split the array into m non-empty continuous subarrays. Minimize the largest sum among these m subarrays.

**Example:** `nums = [7, 2, 5, 10, 8], m = 2` → `18`

```text
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

## Sort an Array

Given an integer array `nums`, sort it in ascending order without using any built-in sort function.

**Example:** `nums = [5, 2, 3, 1]` → `[1, 2, 3, 5]`

```text
MERGE SORT | O(N log N) | O(N)

// Stable and worst-case O(N log N)
// Preferred for linked lists (no random access needed) and external sorting

SORT(left, right):
    if left >= right:
        return
    mid = left + (right - left) / 2
    SORT(left, mid)
    SORT(mid + 1, right)
    MERGE(left, mid, right)

MERGE(left, mid, right):
    copy nums[left..mid] and nums[mid+1..right] into buffers
    walk both buffers with two pointers, writing the smaller value back
    copy whatever remains in the non-empty buffer

-----------------------------------------------------------------------------

QUICK SORT | O(N log N) average, O(N^2) worst | O(log N)

// In-place but unstable
// Randomise the pivot, otherwise sorted input degrades to O(N^2)

SORT(left, right):
    if left >= right:
        return
    p = PARTITION(left, right)
    SORT(left, p - 1)
    SORT(p + 1, right)

PARTITION(left, right):          // Lomuto
    pivot = nums[right]
    i = left
    for j = left to right - 1:
        if nums[j] < pivot:
            swap(nums[i], nums[j])
            i++
    swap(nums[i], nums[right])
    return i

-----------------------------------------------------------------------------

HEAP SORT | O(N log N) | O(1)

Build a max heap in O(N), then repeatedly swap the root with the last element,
shrink the heap, and sift the new root down

-----------------------------------------------------------------------------

COUNTING / RADIX SORT | O(N + K) | O(N + K)

Only applicable to bounded integer keys; radix sort processes one digit per pass
```

> - Use a three-way partition (Dutch National Flag) when the array has many duplicate keys.
> - Quickselect is the same partition step applied to only one side, giving O(N) average selection.

## Count of Smaller Numbers After Self

Given an integer array `nums`, return an array `counts` where `counts[i]` is the number of elements to the right of `nums[i]` that are smaller than it. The same technique counts inversions.

**Example:** `nums = [5, 2, 6, 1]` → `[2, 1, 1, 0]`

```text
BRUTE FORCE | O(N^2) | O(1)

For each element, scan everything to its right and count the smaller values

-----------------------------------------------------------------------------

MERGE SORT | O(N log N) | O(N)

// While merging, taking an element from the right half means it is smaller than
// every element still remaining in the left half

sort indices instead of values so each count can be attributed to its original position
rightWritten = number of right-half elements merged so far

when a left-half element is written:
    counts[itsIndex] += rightWritten
when a right-half element is written:
    rightWritten++

-----------------------------------------------------------------------------

FENWICK TREE (BINARY INDEXED TREE) | O(N log N) | O(N)

// Coordinate compress the values, scan right to left, and ask
// "how many values smaller than this one have I already seen?"

for i = n - 1 down to 0:
    counts[i] = QUERY(rank(nums[i]) - 1)
    UPDATE(rank(nums[i]), 1)

UPDATE(i, delta):
    while i <= n:
        tree[i] += delta
        i += i & (-i)          // Move to the next node covering i

QUERY(i):                      // Prefix sum over [1 ... i]
    sum = 0
    while i > 0:
        sum += tree[i]
        i -= i & (-i)          // Strip the lowest set bit
    return sum
```

> A Fenwick tree is 1-indexed; index 0 would loop forever because `0 & -0 == 0`.
