# Two Pointers and Sliding Window — Problems

## Valid Palindrome

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

## Remove Duplicates from Sorted Array

Given a sorted integer array nums, remove the duplicates in-place such that each unique element appears only once.

**Example:** `nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]` → `5` (nums = [0, 1, 2, 3, 4])

```text
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

## Move Zeroes

Given an integer array nums, move all 0s to the end of the array while maintaining the relative order of all non-zero elements

**Example:** `nums = [0, 1, 0, 3, 12]` → `[1, 3, 12, 0, 0]`

```text
BRUTE FORCE | O(N) | O(N)

Create a new array and copy non-zero elements to it, then fill the rest with zeros

SHIFTING IN PLACE | O(N^2) | O(1)

For every zero, shift the following elements one position left and write the zero at the end

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

## Two Sum II — Input Array Is Sorted

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

## 3Sum

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

## Container With Most Water

Given an array `height` of non-negative integers where `height[i]` represents the height of a vertical line at position `i`, find two lines that together with the x-axis form a container, such that the container contains the most water.

**Example:** `height = [1, 8, 6, 2, 5, 4, 8, 3, 7]` → `49`

```text
BRUTE FORCE | O(N^2) | O(1)

Check every pair of lines and calculate the area of water they can contain

-----------------------------------------------------------------------------

TWO POINTERS | O(N) | O(1)

// The shorter line caps the area, so moving the taller one can never improve it

left = 0
right = n - 1
maxArea = 0
while left < right:
    width = right - left
    shorter = min(height[left], height[right])
    maxArea = max(maxArea, width * shorter)
    if height[left] < height[right]:
        left++
    else:
        right--
return maxArea
```

## Trapping Rain Water

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

## Longest Substring Without Repeating Characters

Given a string s, find the length of the longest substring without repeating characters.

**Example:** `s = "abcabcbb"` → `3` ("abc")

```text
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

## Longest Repeating Character Replacement

You are given a string s containing uppercase English letters and an integer k.
You can replace at most k characters with any other uppercase letter.
Return the length of the longest substring that can be transformed into a string containing only the same character.

**Example:** `s = "AABABBA", k = 1` → `4`

```text
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

## Permutation in String

Given two strings s1 and s2, determine whether s2 contains a permutation of s1 as a substring.

**Example:** `s1 = "ab", s2 = "eidbaooo"` → `true` ("ba")

```text
BRUTE FORCE | O(M! * N) | O(K)

Generate all permutations of s1 and check whether any of them is a substring of s2

OPTIMIZED BRUTE FORCE | O(M * N) | O(1)

Check every substring of s2 with length equal to s1 and see if it is a permutation of s1

--------------------------------------------------------------------------------

SORTING | O(N * M log M) | O(K)

Sort s1 and every substring of s2 with length equal to s1 and check whether they are equal

--------------------------------------------------------------------------------

SLIDING WINDOW + FREQ ARRAY | O(N) | O(K)

// Check the frequency map at each step

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

## Minimum Window Substring

Given two strings s and t, return the minimum window in s which will contain all the characters in t. If there is no such window, return the empty string "".

**Example:** `s = "ADOBECODEBANC", t = "ABC"` → `"BANC"`

```text
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

## Sliding Window Maximum

Given an integer array nums and an integer k, there is a sliding window of size k.
The window moves from left to right one position at a time.
Return the maximum value in every window.

**Example:** `nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3` → `[3, 3, 5, 5, 6, 7]`

```text
BRUTE FORCE | O(N * K) | O(1)

For each window, scan the k elements to find the maximum

--------------------------------------------------------------------------------

MAX HEAP + LAZY DELETION | O(N log N) | O(N)

// Only the maximum can be inspected, so out-of-window entries are discarded lazily when they reach the top
// The heap can hold every element, hence O(N) space

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
