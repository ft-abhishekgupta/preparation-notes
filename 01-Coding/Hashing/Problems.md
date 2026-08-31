# Hashing — Problems

## Two Sum

Given an integer array `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.

**Example:** `nums = [2, 7, 11, 15], target = 9` → `[0, 1]`

```text
BRUTE FORCE | O(N^2) | O(1)

Check every pair of elements and return the pair whose sum equals target

------------------------------------------------------------------------------------

SORTING + TWO POINTERS | O(N log N) | O(N)

Sort (value, originalIndex) pairs and close in from both ends
The original indices must be carried along because sorting destroys them

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

## Contains Duplicate

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

## Valid Anagram

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

## Group Anagrams

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

## Top K Frequent Elements

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

## Longest Consecutive Sequence

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

## Subarray Sum Equals K

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
