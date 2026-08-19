# Coding Problem Templates

Reusable pseudocode patterns for coding-round preparation, grouped by topic. Each
template lists the pattern and the common problems it solves.

## Table of Contents

- [Arrays](#arrays)
- [Binary Search](#binary-search)
- [Hashing](#hashing)
- [Two Pointers](#two-pointers)
- [Sliding Window](#sliding-window)
- [Strings](#strings)
- [Linked List](#linked-list)
- [Heaps](#heaps)
- [Greedy and Intervals](#greedy-and-intervals)
- [Bit Manipulation](#bit-manipulation)
- [Backtracking](#backtracking)
- [Trees](#trees)
- [Graphs](#graphs)
- [Dynamic Programming](#dynamic-programming)

---

## Arrays

> Binary search and sliding window on arrays have dedicated sections below.

### 1. Basic Traversal

```text
for i = 0 to n - 1:
    process nums[i]
```

**Problems:** Find Maximum / Minimum, Find Second Largest, Linear Search,
Best Time to Buy and Sell Stock, Maximum Subarray.

### 2. In-Place Modification

```text
for i = 0 to n - 1:
    if condition:
        modify nums[i]
```

**Problems:** Move Zeroes, Remove Element, Remove Duplicates from Sorted Array,
Sort Colors, Rotate Array.

### 3. Prefix Sum

```text
prefix[0] = 0
for i = 0 to n - 1:
    prefix[i + 1] = prefix[i] + nums[i]

# Range sum:
sum(l, r) = prefix[r + 1] - prefix[l]
```

**Problems:** Range Sum Query, Subarray Sum Equals K, Find Pivot Index,
Running Sum of 1d Array.

### 4. Kadane's Algorithm (Maximum Subarray Sum)

```text
current = nums[0]
best = nums[0]

for i = 1 to n - 1:
    current = max(nums[i], current + nums[i])
    best = max(best, current)

return best
```

**Problems:** Maximum Subarray, Maximum Sum Circular Subarray,
Maximum Product Subarray (modified).

### 5. Prefix + Suffix Products

```text
prefix = 1
for i = 0 to n - 1:
    answer[i] *= prefix
    prefix *= nums[i]

suffix = 1
for i = n - 1 down to 0:
    answer[i] *= suffix
    suffix *= nums[i]
```

**Problems:** Product of Array Except Self, Trapping Rain Water,
prefix/suffix maximum problems.

### 6. Sorting + Scan

```text
sort(nums)
for i = 0 to n - 1:
    process nums[i]
    compare with previous / next elements
```

**Problems:** Merge Intervals, Non-overlapping Intervals, 3Sum, 4Sum,
Longest Consecutive Sequence, Meeting Rooms.

### 7. Difference Array (Range Updates)

```text
diff[l] += value
diff[r + 1] -= value

# Reconstruct:
current = 0
for i = 0 to n - 1:
    current += diff[i]
    answer[i] = current
```

**Problems:** Range Addition, Corporate Flight Bookings, Car Pooling.

### 8. Cyclic Sort / Index Placement

Use when values lie in the range `1..N`.

```text
i = 0
while i < n:
    correctIndex = nums[i] - 1
    if nums[i] != nums[correctIndex]:
        swap(nums[i], nums[correctIndex])
    else:
        i++
```

**Problems:** Missing Number, Find All Numbers Disappeared in an Array,
Find the Duplicate Number, First Missing Positive, Set Mismatch.

### 9. Monotonic Stack

Maintain a stack of indices/values in monotonic order.

```text
stack = empty
for i = 0 to n - 1:
    while stack not empty AND current violates monotonic order:
        previous = pop stack
        calculate answer using previous
    push i
```

**Problems:** Daily Temperatures, Next Greater Element (I & II),
Largest Rectangle in Histogram, Trapping Rain Water.

---

## Binary Search

### 1. Exact Match

```text
left = 0
right = n - 1

while left <= right:
    mid = left + (right - left) / 2
    if nums[mid] == target:
        return mid
    if nums[mid] < target:
        left = mid + 1
    else:
        right = mid - 1

return -1
```

**Problems:** Binary Search, Search Insert Position, Search a 2D Matrix.

### 2. Lower Bound (first `>= target`)

```text
left = 0
right = n

while left < right:
    mid = left + (right - left) / 2
    if nums[mid] >= target:
        right = mid
    else:
        left = mid + 1

return left
```

**Problems:** Search Insert Position, First Bad Version,
count numbers `< x` / `>= x`.

### 3. Upper Bound (first `> target`)

```text
left = 0
right = n

while left < right:
    mid = left + (right - left) / 2
    if nums[mid] > target:
        right = mid
    else:
        left = mid + 1

return left
```

**Problems:** insertion position after duplicates, count elements `<= target`,
count occurrences of a value.

### 4. First Occurrence

```text
left = 0
right = n - 1
answer = -1

while left <= right:
    mid = left + (right - left) / 2
    if nums[mid] == target:
        answer = mid
        right = mid - 1
    else if nums[mid] < target:
        left = mid + 1
    else:
        right = mid - 1

return answer
```

**Problems:** Find First and Last Position of Element.

### 5. Last Occurrence

```text
left = 0
right = n - 1
answer = -1

while left <= right:
    mid = left + (right - left) / 2
    if nums[mid] == target:
        answer = mid
        left = mid + 1
    else if nums[mid] < target:
        left = mid + 1
    else:
        right = mid - 1

return answer
```

**Problems:** Find First and Last Position of Element.

### 6. Binary Search on Answer — Minimum Feasible

Use when the answer is in a numeric range and you can test a candidate.

```text
left = minimumPossibleAnswer
right = maximumPossibleAnswer

while left < right:
    mid = left + (right - left) / 2
    if can(mid):
        right = mid
    else:
        left = mid + 1

return left
```

**Problems:** Koko Eating Bananas, Capacity to Ship Packages Within D Days,
Minimum Days to Make M Bouquets, Split Array Largest Sum, Allocate Books,
Aggressive Cows / Magnetic Force Between Two Balls.

### 7. Binary Search on Answer — Maximum Feasible

The `+ 1` in `mid` avoids an infinite loop when searching for the maximum.

```text
left = minimumPossibleAnswer
right = maximumPossibleAnswer

while left < right:
    mid = left + (right - left + 1) / 2
    if can(mid):
        left = mid
    else:
        right = mid - 1

return left
```

**Problems:** maximum minimum distance, maximum possible minimum value,
capacity / allocation optimization.

### 8. Rotated Sorted Array

```text
left = 0
right = n - 1

while left <= right:
    mid = left + (right - left) / 2
    if nums[mid] == target:
        return mid

    if left half is sorted:
        if nums[left] <= target < nums[mid]:
            right = mid - 1
        else:
            left = mid + 1
    else:  # right half is sorted
        if nums[mid] < target <= nums[right]:
            left = mid + 1
        else:
            right = mid - 1

return -1
```

**Problems:** Search in Rotated Sorted Array (I & II).

### 9. Find Minimum in Rotated Sorted Array

```text
left = 0
right = n - 1

while left < right:
    mid = left + (right - left) / 2
    if nums[mid] > nums[right]:
        left = mid + 1
    else:
        right = mid

return nums[left]
```

**Problems:** Find Minimum in Rotated Sorted Array (duplicates require a tweak).

---

## Hashing

### 1. Frequency Map

```text
freq = empty hashmap
for x in array:
    freq[x]++
# use freq to check the required condition
```

**Problems:** Valid Anagram, Group Anagrams, Top K Frequent Elements,
Majority Element, Ransom Note, First Unique Character,
Find All Anagrams in a String.

### 2. HashSet — Existence / Duplicate Detection

```text
seen = empty hashset
for x in array:
    if x in seen:
        duplicate found
    add x to seen
```

**Problems:** Contains Duplicate, Longest Consecutive Sequence, Happy Number,
Intersection of Two Arrays.

### 3. HashMap — Value → Index

```text
map = empty hashmap
for i = 0 to n - 1:
    if requiredValue exists in map:
        return map[requiredValue], i
    map[array[i]] = i
```

**Problems:** Two Sum, Contains Duplicate II, Isomorphic Strings, Word Pattern.

### 4. HashMap — Complement Lookup

```text
map = empty hashmap
for x in array:
    complement = target - x
    if complement exists in map:
        found answer
    map[x] = ...
```

**Problems:** Two Sum, 3Sum / 4Sum (hashing variants), Two Sum IV — BST.

### 5. Prefix Sum + HashMap

```text
map = {0 : 1}
prefixSum = 0

for x in array:
    prefixSum += x
    required = prefixSum - target
    if required exists in map:
        use map[required]
    map[prefixSum]++
```

**Problems:** Subarray Sum Equals K, Subarray Sums Divisible by K,
Continuous Subarray Sum, Binary Subarrays With Sum.

### 6. Prefix Sum + HashSet

```text
seen = {0}
prefixSum = 0

for x in array:
    prefixSum += x
    if required prefix exists in seen:
        found subarray
    add prefixSum to seen
```

**Problems:** Longest Subarray With Sum 0, Longest Well-Performing Interval.

### 7. Grouping by Key

```text
groups = hashmap
for item in items:
    key = generateGroupingKey(item)
    groups[key].add(item)
return groups.values
```

**Problems:** Group Anagrams, Group Shifted Strings, Isomorphic Strings.

---

## Two Pointers

### 1. Opposite Ends

```text
left = 0
right = n - 1

while left < right:
    process nums[left], nums[right]
    move left and/or right based on condition
```

**Problems:** Valid Palindrome, Two Sum II (sorted), Container With Most Water,
Reverse String, Reverse Vowels of a String, 3Sum, 4Sum.

### 2. Fast & Slow

```text
slow = start
fast = start

while fast valid AND fast.next valid:
    slow = slow.next
    fast = fast.next.next
```

**Problems:** Linked List Cycle, Middle of the Linked List,
Find the Duplicate Number, Happy Number.

### 3. Same Direction (Read / Write)

Keep a write pointer for the result while a read pointer scans.

```text
write = 0
for read = 0 to n - 1:
    if nums[read] should be kept:
        nums[write] = nums[read]
        write++
return write
```

**Problems:** Move Zeroes, Remove Element, Remove Duplicates from Sorted Array,
Sort Colors.

### 4. Merge Two Sequences

```text
i = 0
j = 0
while i < n AND j < m:
    if a[i] <= b[j]:
        take a[i]; i++
    else:
        take b[j]; j++
# append remaining elements
```

**Problems:** Merge Sorted Array, Merge Two Sorted Lists,
Intersection of Two Arrays.

---

## Sliding Window

### 1. Fixed-Size Window

```text
windowSum = 0
left = 0

for right = 0 to n - 1:
    windowSum += nums[right]
    if window size > k:
        windowSum -= nums[left]
        left++
    if window size == k:
        update answer
```

**Problems:** Maximum Sum Subarray of Size K, Maximum Average Subarray I,
Find All Anagrams in a String, Permutation in String,
Maximum Number of Vowels in a Substring of Given Length.

### 2. Variable Window — Longest Valid

```text
left = 0
for right = 0 to n - 1:
    add nums[right] to window
    while window is invalid:
        remove nums[left] from window
        left++
    answer = max(answer, right - left + 1)
```

**Problems:** Longest Substring Without Repeating Characters,
Longest Substring with At Most K Distinct Characters,
Longest Repeating Character Replacement, Max Consecutive Ones III,
Fruit Into Baskets.

### 3. Variable Window — Shortest Valid

```text
left = 0
answer = infinity

for right = 0 to n - 1:
    add nums[right] to window
    while window is valid:
        answer = min(answer, right - left + 1)
        remove nums[left] from window
        left++

return answer
```

**Problems:** Minimum Size Subarray Sum, Minimum Window Substring.

### 4. Window + Frequency Map

```text
left = 0
freq = empty hashmap

for right = 0 to n - 1:
    freq[nums[right]]++
    while window is invalid:
        freq[nums[left]]--
        left++
    update answer
```

**Problems:** Longest Substring with At Most K Distinct Characters,
Minimum Window Substring, Permutation in String,
Find All Anagrams in a String.

### 5. Window + Violation Count

Track a counter (zeros, distinct, bad chars) instead of the full condition.

```text
left = 0
badCount = 0

for right = 0 to n - 1:
    if nums[right] violates condition:
        badCount++
    while badCount > allowed:
        if nums[left] violates condition:
            badCount--
        left++
    update answer
```

**Problems:** Max Consecutive Ones III, Longest Repeating Character Replacement,
Fruit Into Baskets.

### 6. Window + Monotonic Deque

For max / min inside every window.

```text
deque = empty
for right = 0 to n - 1:
    while deque not empty AND deque.front < left:
        remove front
    while deque not empty AND nums[deque.back] <= nums[right]:
        remove back
    add right to deque
    if window size == k:
        answer = nums[deque.front]
        left++
```

**Problems:** Sliding Window Maximum, Sliding Window Minimum,
Constrained Subsequence Sum.

---

## Strings

> Character frequency uses the [Frequency Map](#1-frequency-map);
> two-pointer palindrome checks use [Two Pointers](#two-pointers);
> substring search windows use [Sliding Window](#sliding-window).

### 1. String Building / Transformation

```text
result = empty
for c in s:
    if c satisfies condition:
        append c to result
return result
```

**Problems:** Reverse Words in a String, String Compression,
Remove All Adjacent Duplicates, Add Strings.

### 2. String Parsing

```text
i = 0
while i < n:
    skip spaces / delimiters
    identify current token
    process token
    move i to next token
```

**Problems:** String to Integer (atoi), Simplify Path,
Compare Version Numbers, Basic Calculator, Decode String.

### 3. Stack-Based Processing

```text
stack = empty
for c in s:
    if c opens / starts something:
        push c
    else:
        while stack not empty AND top can be resolved:
            pop / process
        push / process c
```

**Problems:** Valid Parentheses, Remove All Adjacent Duplicates,
Backspace String Compare, Decode String, Basic Calculator.

### 4. KMP — Prefix Function + Search

```text
# Build longest-prefix-suffix (lps) array
length = 0
for i = 1 to pattern.length - 1:
    while length > 0 AND pattern[i] != pattern[length]:
        length = lps[length - 1]
    if pattern[i] == pattern[length]:
        length++
    lps[i] = length

# Search
i = 0
j = 0
while i < text.length:
    if text[i] == pattern[j]:
        i++; j++
        if j == pattern.length:
            pattern found
            j = lps[j - 1]
    else if j > 0:
        j = lps[j - 1]
    else:
        i++
```

**Problems:** Find the Index of the First Occurrence in a String,
Repeated Substring Pattern.

### 5. Palindrome Expansion

Expand around every center (odd and even length).

```text
for each index i:
    expandAroundCenter(i, i)       # odd length
    expandAroundCenter(i, i + 1)   # even length

# expandAroundCenter(left, right):
while left >= 0 AND right < n AND s[left] == s[right]:
    update answer
    left--
    right++
```

**Problems:** Longest Palindromic Substring, Palindromic Substrings.

### 6. String DP

See the [Dynamic Programming](#dynamic-programming) section for
Word Break, Edit Distance, Longest Common Subsequence, and
Longest Palindromic Subsequence.

---

## Linked List

### 1. Traversal

```text
current = head
while current != null:
    process current
    current = current.next
```

**Problems:** Reverse Linked List, length, search, Merge Two Sorted Lists.

### 2. Reverse (Iterative)

```text
prev = null
current = head

while current != null:
    next = current.next
    current.next = prev
    prev = current
    current = next

return prev
```

**Problems:** Reverse Linked List, Reverse Linked List II,
Reverse Nodes in k-Group, Reorder List.

### 3. Fast & Slow Pointers

```text
slow = head
fast = head

while fast != null AND fast.next != null:
    slow = slow.next
    fast = fast.next.next
```

**Problems:** Middle of the Linked List, Linked List Cycle,
Palindrome Linked List.

### 4. Cycle Detection & Entry

```text
slow = head
fast = head

while fast != null AND fast.next != null:
    slow = slow.next
    fast = fast.next.next
    if slow == fast:                # cycle exists
        slow = head
        while slow != fast:         # find entry
            slow = slow.next
            fast = fast.next
        return slow

return null
```

**Problems:** Linked List Cycle (I & II).

### 5. Dummy Node

Use when the head may change or the first node is modified repeatedly.

```text
dummy = new Node()
dummy.next = head
prev = dummy

while condition:
    modify prev.next

return dummy.next
```

**Problems:** Remove Nth Node From End, Merge Two Sorted Lists,
Remove Duplicates from Sorted List, Partition List, Merge k Sorted Lists.

### 6. Remove Node

```text
dummy = Node(0)
dummy.next = head
prev = dummy
current = head

while current != null:
    if current should be removed:
        prev.next = current.next
    else:
        prev = current
    current = current.next

return dummy.next
```

**Problems:** Remove Linked List Elements, Remove Duplicates from Sorted List.

### 7. Remove Nth Node From End

```text
dummy = Node(0)
dummy.next = head
slow = dummy
fast = dummy

repeat n times:
    fast = fast.next

while fast.next != null:
    slow = slow.next
    fast = fast.next

slow.next = slow.next.next
return dummy.next
```

**Problems:** Remove Nth Node From End of List.

### 8. Merge Two Sorted Lists

```text
dummy = Node(0)
tail = dummy

while list1 != null AND list2 != null:
    if list1.value <= list2.value:
        tail.next = list1; list1 = list1.next
    else:
        tail.next = list2; list2 = list2.next
    tail = tail.next

tail.next = (list1 != null) ? list1 : list2
return dummy.next
```

**Problems:** Merge Two Sorted Lists, Merge k Sorted Lists, Sort List.

### 9. Find Intersection

Align both lists by switching heads.

```text
p = headA
q = headB

while p != q:
    p = (p == null) ? headB : p.next
    q = (q == null) ? headA : q.next

return p
```

**Problems:** Intersection of Two Linked Lists.

### 10. Palindrome Linked List

```text
# 1. find middle (fast & slow)
# 2. reverse second half
# 3. compare both halves
```

**Problems:** Palindrome Linked List, Reorder List.

### 11. Reorder List

Transform `1 → 2 → 3 → 4 → 5` into `1 → 5 → 2 → 4 → 3`.

```text
# 1. find middle
# 2. reverse second half
# 3. merge first half and reversed second half
```

**Problems:** Reorder List.

### 12. Reverse a Sublist

```text
dummy.next = head
find node before left
repeat (right - left + 1) times:
    detach next node
    insert it immediately after prev
return dummy.next
```

**Problems:** Reverse Linked List II, Reverse Nodes in k-Group.

### 13. Merge K Sorted Lists (Divide & Conquer)

```text
while number of lists > 1:
    merge lists in pairs
    replace them with merged lists
return remaining list
```

**Problems:** Merge k Sorted Lists, Smallest Range Covering Elements from K Lists.

---

## Heaps

### 1. Min Heap / Max Heap

```text
heap = empty heap        # min or max
for x in elements:
    heap.push(x)
while heap not empty:
    x = heap.pop()
    process x
```

**Problems:** Kth Smallest / Largest Element, Last Stone Weight,
Maximum Product of Two Elements.

### 2. Top K — Bounded Heap of Size K

For K largest, keep a **min** heap of size K (for K smallest, use a max heap).

```text
heap = empty minHeap
for x in nums:
    heap.push(x)
    if heap.size > k:
        heap.pop()
return heap
```

**Problems:** Kth Largest Element in an Array, Top K Frequent Elements,
K Closest Points to Origin, Kth Largest Element in a Stream.

### 3. Two Heaps — Median

Keep `maxHeap` (smaller half) and `minHeap` (larger half) balanced.

```text
add(x):
    if maxHeap empty OR x <= maxHeap.top:
        maxHeap.push(x)
    else:
        minHeap.push(x)
    balance()

balance():
    if maxHeap.size > minHeap.size + 1:
        move maxHeap.top -> minHeap
    if minHeap.size > maxHeap.size:
        move minHeap.top -> maxHeap

median:
    if sizes equal: (maxHeap.top + minHeap.top) / 2
    else:           maxHeap.top
```

**Problems:** Find Median from Data Stream, Sliding Window Median, IPO.

### 4. Merge K Sorted Sequences

```text
heap = empty minHeap
for each list:
    if list not empty:
        push (value, listIndex, elementIndex)

while heap not empty:
    (value, list, index) = pop heap
    add value to result
    if next element exists:
        push next element
```

**Problems:** Merge k Sorted Lists, Kth Smallest Element in a Sorted Matrix,
Smallest Range Covering Elements from K Lists.

### 5. Heap + Greedy

Repeatedly pick the best currently available option.

```text
heap = empty
add all currently available candidates
while work remains:
    best = heap.pop()
    use best
    add newly available candidates to heap
```

**Problems:** Task Scheduler, Reorganize String, Course Schedule III, IPO,
Maximum Performance of a Team.

### 6. Heap + Intervals / Scheduling

Sort events by start time, use a min heap of end times.

```text
sort intervals by start time
heap = empty minHeap
for interval in intervals:
    while heap not empty AND heap.top <= interval.start:
        heap.pop()
    heap.push(interval.end)
    answer = max(answer, heap.size)
```

**Problems:** Meeting Rooms II, Minimum Number of Platforms,
Employee Free Time, Divide Intervals Into Minimum Number of Groups.

---

## Greedy and Intervals

### 1. Sort by Start Time — Process

```text
sort intervals by start
for each interval:
    process current interval
    compare with previous / current state
```

**Problems:** Merge Intervals, Insert Interval, Meeting Rooms,
Interval List Intersections, Employee Free Time.

### 2. Merge Overlapping Intervals

```text
sort intervals by start
result = []

for interval in intervals:
    if result empty OR interval.start > result.last.end:
        add interval to result
    else:
        result.last.end = max(result.last.end, interval.end)

return result
```

**Problems:** Merge Intervals, Insert Interval, Interval List Intersections.

### 3. Sort by Earliest Finish (Max Non-Overlapping)

```text
sort intervals by end time
lastEnd = -infinity
count = 0

for interval in intervals:
    if interval.start >= lastEnd:
        select interval
        count++
        lastEnd = interval.end
```

**Problems:** Non-overlapping Intervals, Activity Selection,
Maximum Number of Events That Can Be Attended,
Minimum Number of Arrows to Burst Balloons.

### 4. Sweep Line

Count how many intervals are active at each point.

```text
events = []
for interval in intervals:
    events.add(start, +1)
    events.add(end, -1)
sort events

active = 0
answer = 0
for event in events:
    active += event.change
    answer = max(answer, active)
```

**Problems:** Meeting Rooms II, Maximum Number of Overlapping Intervals,
Car Pooling, Minimum Number of Platforms.

### 5. Insert Interval

```text
result = []
i = 0

while i < n AND intervals[i].end < newInterval.start:
    add intervals[i]; i++

while i < n AND intervals[i].start <= newInterval.end:
    newInterval.start = min(newInterval.start, intervals[i].start)
    newInterval.end   = max(newInterval.end, intervals[i].end)
    i++

add newInterval

while i < n:
    add intervals[i]; i++

return result
```

**Problems:** Insert Interval, calendar / booking problems.

### 6. Greedy — Two Pointers

```text
sort items
left = 0
right = n - 1

while left <= right:
    if smallest + largest can work:
        use both; left++; right--
    else:
        use largest; right--
```

**Problems:** Boats to Save People, Assign Cookies.

### 7. Greedy — Farthest Reach

```text
# Reachability
farthest = 0
for i = 0 to n - 1:
    if i > farthest:
        return false
    farthest = max(farthest, i + nums[i])
return true

# Minimum jumps
farthest = 0
currentEnd = 0
jumps = 0
for i = 0 to n - 2:
    farthest = max(farthest, i + nums[i])
    if i == currentEnd:
        jumps++
        currentEnd = farthest
return jumps
```

**Problems:** Jump Game, Jump Game II.

### 8. Greedy — Best Previous State

```text
best = initial value
for each item:
    best = best choice using current item + previous best
return best
```

**Problems:** Best Time to Buy and Sell Stock, Gas Station,
Maximum Subarray, Partition Labels.

---

## Bit Manipulation

### 1. Check / Set / Clear / Toggle a Bit

```text
mask = 1 << i
check:  (num & mask) != 0
set:    num = num | mask
clear:  num = num & ~mask
toggle: num = num ^ mask
```

**Problems:** Number of 1 Bits, Counting Bits, Power of Two.

### 2. Odd / Even

```text
if (num & 1) == 1: odd
else:              even
```

### 3. Power of Two

A positive power of two has exactly one set bit.

```text
if num > 0 AND (num & (num - 1)) == 0: true
else:                                  false
```

**Problems:** Power of Two, Power of Four.

### 4. Count Set Bits (Brian Kernighan)

`num & (num - 1)` removes the lowest set bit.

```text
count = 0
while num != 0:
    num = num & (num - 1)
    count++
```

**Problems:** Number of 1 Bits, Counting Bits,
Sort Integers by The Number of 1 Bits.

### 5. XOR — Single Number

`x ^ x = 0` and `x ^ 0 = x`, so duplicates cancel.

```text
result = 0
for x in nums:
    result = result ^ x
return result
```

**Problems:** Single Number, Missing Number, Find the Difference.

### 6. XOR — Two Unique Numbers

```text
xor = a ^ b
diffBit = xor & (-xor)          # a bit where a and b differ

a = 0; b = 0
for x in nums:
    if (x & diffBit) != 0:
        a = a ^ x
    else:
        b = b ^ x
return [a, b]
```

**Problems:** Single Number III.

### 7. Missing Number via XOR

```text
result = n
for i = 0 to n - 1:
    result = result ^ i ^ nums[i]
return result
```

**Problems:** Missing Number.

### 8. Prefix XOR

```text
prefix[0] = 0
for i = 0 to n - 1:
    prefix[i + 1] = prefix[i] ^ nums[i]

# XOR(l, r) = prefix[r + 1] ^ prefix[l]
```

**Problems:** XOR Queries of a Subarray, range XOR queries.

### 9. Build Number Bit-by-Bit

```text
result = 0
for each bit:
    result = (result << 1) | bit
```

**Problems:** Reverse Bits, Add Binary.

### 10. Reverse Bits

```text
result = 0
repeat 32 times:
    result = (result << 1) | (num & 1)
    num = num >> 1
return result
```

**Problems:** Reverse Bits.

### 11. Generate Subsets via Bitmask

Each bit of `mask` marks whether an element is selected (`2^n` subsets).

```text
for mask = 0 to (1 << n) - 1:
    subset = []
    for i = 0 to n - 1:
        if (mask & (1 << i)) != 0:
            add nums[i] to subset
```

**Problems:** Subsets, Subsets II, Maximum XOR subset.

### 12. Bitmask DP

Track which items are used with a bitmask.

```text
dp[mask] = best answer for the set of items in mask

for mask:
    for each unused item i:
        newMask = mask | (1 << i)
        dp[newMask] = best(dp[newMask], transition(dp[mask], i))
```

**Problems:** Traveling Salesman Problem, Partition to K Equal Sum Subsets,
Shortest Path Visiting All Nodes, Maximum Students Taking Exam.

---

## Backtracking

### 1. General Template — Choose / Explore / Undo

```text
backtrack(state):
    if state is a complete solution:
        record solution
        return
    for each choice:
        make choice
        backtrack(new state)
        undo choice
```

**Problems:** Subsets, Permutations, Combination Sum,
Generate Parentheses, Letter Combinations of a Phone Number.

### 2. Subsets — Loop Template

```text
backtrack(start):
    add current to result
    for i = start to n - 1:
        current.add(nums[i])
        backtrack(i + 1)
        current.removeLast()
```

**Problems:** Subsets, Combinations, Combination Sum.

### 3. Permutations

```text
backtrack():
    if current.size == n:
        add copy of current
        return
    for i = 0 to n - 1:
        if used[i]: continue
        used[i] = true
        current.add(nums[i])
        backtrack()
        current.removeLast()
        used[i] = false
```

**Problems:** Permutations, Permutations II, Letter Tile Possibilities.

### 4. Combination Sum — Reuse Allowed

Recurse with `i` (not `i + 1`) to reuse the same number.

```text
backtrack(start, remaining):
    if remaining == 0:
        record solution; return
    if remaining < 0:
        return
    for i = start to n - 1:
        current.add(nums[i])
        backtrack(i, remaining - nums[i])
        current.removeLast()
```

**Problems:** Combination Sum.

### 5. Combination Sum — No Reuse + Duplicates

```text
sort(nums)
backtrack(start, remaining):
    if remaining == 0:
        record solution; return
    for i = start to n - 1:
        if i > start AND nums[i] == nums[i - 1]: continue
        if nums[i] > remaining: break
        current.add(nums[i])
        backtrack(i + 1, remaining - nums[i])
        current.removeLast()
```

**Problems:** Combination Sum II, 3Sum, 4Sum.

### 6. Generate Parentheses

Key pruning rule: never close more than you have opened (`close < open`).

```text
backtrack(open, close):
    if open == n AND close == n:
        add current; return
    if open < n:
        add "("; backtrack(open + 1, close); remove last
    if close < open:
        add ")"; backtrack(open, close + 1); remove last
```

**Problems:** Generate Parentheses.

### 7. Palindrome Partitioning

```text
backtrack(start):
    if start == n:
        add current partition; return
    for end = start to n - 1:
        if s[start..end] is not palindrome: continue
        add s[start..end] to current
        backtrack(end + 1)
        remove last
```

**Problems:** Palindrome Partitioning, Restore IP Addresses,
Letter Combinations of a Phone Number.

### 8. Word Search / Grid Backtracking

```text
dfs(row, col, index):
    if index == word.length:
        return true
    if position invalid OR board[row][col] != word[index]:
        return false
    mark cell visited
    for each of 4 directions:
        if dfs(nextRow, nextCol, index + 1):
            return true
    restore cell
    return false
```

**Problems:** Word Search, Word Search II (with a Trie),
Path With Maximum Gold.

### 9. Constraint Backtracking (N-Queens)

Track occupied columns and both diagonals.

```text
backtrack(row):
    if row == n:
        record board; return
    for col = 0 to n - 1:
        if col OR (row - col) diagonal OR (row + col) diagonal occupied:
            continue
        place queen; mark column and diagonals
        backtrack(row + 1)
        remove queen; unmark column and diagonals
```

**Problems:** N-Queens (I & II), Sudoku Solver, Graph Coloring.

---

## Trees

### 1. DFS — Preorder (Top-Down)

```text
dfs(node):
    if node == null: return
    process node
    dfs(node.left)
    dfs(node.right)
```

**Problems:** Preorder Traversal, Maximum Depth, Same Tree,
Invert Binary Tree, Path Sum.

### 2. DFS — Inorder

For a BST, inorder yields sorted order.

```text
dfs(node):
    if node == null: return
    dfs(node.left)
    process node
    dfs(node.right)
```

**Problems:** Inorder Traversal, Kth Smallest Element in BST,
Validate BST, BST Iterator, Convert BST to Greater Tree.

### 3. DFS — Postorder (Bottom-Up)

```text
dfs(node):
    if node == null:
        return baseValue
    left = dfs(node.left)
    right = dfs(node.right)
    return combine(left, right, node)
```

**Problems:** Diameter of Binary Tree, Balanced Binary Tree,
Maximum Depth, Subtree of Another Tree.

### 4. Level Order — BFS

```text
queue = [root]
while queue not empty:
    levelSize = queue.size
    repeat levelSize times:
        node = queue.dequeue()
        process node
        enqueue node.left, node.right (if present)
```

**Problems:** Level Order Traversal, Right Side View,
Zigzag Level Order, Average of Levels, Minimum Depth.

### 5. Top-Down — Pass Information Down

```text
dfs(node, state):
    if node == null: return
    update state using node
    dfs(node.left, updatedState)
    dfs(node.right, updatedState)
```

**Problems:** Path Sum, Binary Tree Paths, Sum Root to Leaf Numbers,
Validate BST.

### 6. BST Search

```text
current = root
while current != null:
    if current.value == target: return current
    if target < current.value:
        current = current.left
    else:
        current = current.right
return null
```

**Problems:** Search in a BST, Insert into a BST, Delete Node in a BST.

### 7. Validate BST — Range

```text
valid(node, min, max):
    if node == null: return true
    if node.value <= min OR node.value >= max: return false
    return valid(node.left, min, node.value)
       AND valid(node.right, node.value, max)
```

**Problems:** Validate Binary Search Tree, Recover Binary Search Tree.

### 8. Lowest Common Ancestor — General Binary Tree

```text
lca(node, p, q):
    if node == null OR node == p OR node == q:
        return node
    left = lca(node.left, p, q)
    right = lca(node.right, p, q)
    if left != null AND right != null:
        return node
    return (left != null) ? left : right
```

**Problems:** Lowest Common Ancestor of a Binary Tree,
LCA of Deepest Leaves.

### 9. Lowest Common Ancestor — BST

```text
current = root
while current != null:
    if p.value < current.value AND q.value < current.value:
        current = current.left
    else if p.value > current.value AND q.value > current.value:
        current = current.right
    else:
        return current
```

**Problems:** Lowest Common Ancestor of a BST.

### 10. Root-to-Leaf Path

```text
dfs(node, path):
    if node == null: return
    add node to path
    if node is leaf:
        process path
    dfs(node.left, path)
    dfs(node.right, path)
    remove node from path
```

**Problems:** Binary Tree Paths, Path Sum II, Sum Root to Leaf Numbers.

### 11. Tree DP — Multiple States

```text
dfs(node):
    if node == null: return baseState
    left = dfs(node.left)
    right = dfs(node.right)
    return combine(left, right, node)
```

**Problems:** House Robber III, Binary Tree Maximum Path Sum,
Diameter of Binary Tree, Binary Tree Cameras,
Distribute Coins in Binary Tree.

### 12. Construction (Preorder + Inorder)

```text
root = preorder[nextRoot]
find root position in inorder
left subtree  = elements before root in inorder
right subtree = elements after root in inorder
recursively build both
```

**Problems:** Construct Binary Tree from Preorder and Inorder,
Construct Binary Tree from Inorder and Postorder.

### 13. Serialize / Deserialize

```text
serialize(node):
    if node == null: return "#"
    return node.value + serialize(left) + serialize(right)

deserialize():
    token = next token
    if token == "#": return null
    node = new Node(token)
    node.left = deserialize()
    node.right = deserialize()
    return node
```

**Problems:** Serialize and Deserialize Binary Tree / BST.

---

## Graphs

### 1. DFS

```text
dfs(node):
    if node visited: return
    mark node visited
    for neighbor in graph[node]:
        dfs(neighbor)
```

**Problems:** Number of Connected Components, Clone Graph, Flood Fill,
Number of Islands, Max Area of Island.

### 2. BFS

```text
queue = [start]
mark start visited
while queue not empty:
    node = dequeue
    for neighbor in graph[node]:
        if neighbor not visited:
            mark neighbor visited
            enqueue neighbor
```

**Problems:** Number of Islands, Clone Graph, Rotting Oranges, Word Ladder.

### 3. Connected Components

```text
for node = 0 to n - 1:
    if node not visited:
        dfs(node)
        components++
```

**Problems:** Number of Connected Components, Number of Provinces,
Accounts Merge.

### 4. Grid as Graph

Treat each cell as a node; directions = up, down, left, right.

```text
dfs(r, c):
    if outside grid OR cell invalid OR visited: return
    mark cell visited
    for each direction:
        dfs(r + dr, c + dc)
```

**Problems:** Number of Islands, Flood Fill, Max Area of Island,
Surrounded Regions, Pacific Atlantic Water Flow.

### 5. Undirected Cycle Detection (DFS)

```text
dfs(node, parent):
    mark node visited
    for neighbor in graph[node]:
        if neighbor not visited:
            if dfs(neighbor, node): return true
        else if neighbor != parent:
            return true
    return false
```

**Problems:** Graph Valid Tree, Detect Cycle in Undirected Graph,
Redundant Connection.

### 6. Union-Find (Disjoint Set)

```text
find(x):
    if parent[x] != x:
        parent[x] = find(parent[x])     # path compression
    return parent[x]

union(a, b):
    rootA = find(a); rootB = find(b)
    if rootA == rootB: cycle detected
    attach smaller tree to larger tree
```

**Problems:** Graph Valid Tree, Redundant Connection,
Number of Connected Components, Accounts Merge,
Most Stones Removed with Same Row or Column.

### 7. Directed Cycle Detection (3 Colors)

States: `0 = unvisited`, `1 = visiting`, `2 = done`.

```text
dfs(node):
    if state[node] == 1: cycle detected
    if state[node] == 2: return false
    state[node] = 1
    for neighbor in graph[node]:
        if dfs(neighbor): return true
    state[node] = 2
    return false
```

**Problems:** Course Schedule, Detect Cycle in Directed Graph.

### 8. Topological Sort — Kahn (BFS)

```text
compute indegree of every node
queue = all nodes with indegree 0

while queue not empty:
    node = dequeue
    add node to result
    for neighbor of node:
        indegree[neighbor]--
        if indegree[neighbor] == 0:
            enqueue neighbor

if result.size != numberOfNodes: cycle exists
```

**Problems:** Course Schedule (I & II), Alien Dictionary,
Parallel Courses, Minimum Height Trees.

### 9. Topological Sort — DFS

```text
dfs(node):
    mark node visiting
    for neighbor:
        if neighbor visiting: cycle
        if neighbor unvisited: dfs(neighbor)
    mark node completed
    push node onto stack
# reverse the stack for topological order
```

**Problems:** Course Schedule II, Alien Dictionary,
Build a Matrix With Conditions.

### 10. BFS Shortest Path (Unweighted)

```text
distance[start] = 0
queue = [start]
while queue not empty:
    node = dequeue
    for neighbor:
        if neighbor not visited:
            distance[neighbor] = distance[node] + 1
            enqueue neighbor
```

**Problems:** Shortest Path in Binary Matrix, Word Ladder,
Minimum Genetic Mutation, Open the Lock, Rotting Oranges.

### 11. Dijkstra (Non-Negative Weights)

```text
distance[start] = 0; all others = infinity
minHeap = [(0, start)]

while minHeap not empty:
    (currentDistance, node) = pop minimum
    if currentDistance != distance[node]: continue
    for (neighbor, weight):
        newDistance = currentDistance + weight
        if newDistance < distance[neighbor]:
            distance[neighbor] = newDistance
            push (newDistance, neighbor)
```

**Problems:** Network Delay Time, Path With Minimum Effort,
Swim in Rising Water, Cheapest Flights Within K Stops (modified).

### 12. Bellman-Ford (Handles Negative Edges)

```text
distance[start] = 0; others = infinity
repeat V - 1 times:
    for each edge (u, v, weight):
        if distance[u] + weight < distance[v]:
            distance[v] = distance[u] + weight
# one more pass detects a negative cycle
```

**Problems:** Cheapest Flights Within K Stops,
graphs with negative edge weights.

### 13. 0-1 BFS (Edge Weights 0 or 1)

```text
distance[start] = 0
deque = [start]
while deque not empty:
    node = remove front
    for (neighbor, weight):
        newDistance = distance[node] + weight
        if newDistance < distance[neighbor]:
            distance[neighbor] = newDistance
            if weight == 0: add neighbor to front
            else:           add neighbor to back
```

**Problems:** 0-1 Matrix, Minimum Cost to Make at Least One Valid Path in a Grid.

### 14. Bipartite Coloring

```text
color = all uncolored
for each node:
    if node uncolored:
        color[node] = 0
        queue = [node]
        while queue not empty:
            current = dequeue
            for neighbor:
                if neighbor uncolored:
                    color[neighbor] = 1 - color[current]
                    enqueue neighbor
                else if color[neighbor] == color[current]:
                    return false
return true
```

**Problems:** Is Graph Bipartite?, Possible Bipartition.

### 15. Kruskal's MST

Sort edges by weight and use Union-Find.

```text
sort edges by weight
for edge (u, v, weight):
    if find(u) != find(v):
        union(u, v)
        add weight to answer
```

**Problems:** Min Cost to Connect All Points,
Connecting Cities With Minimum Cost.

### 16. Prim's MST

Grow the tree from one starting node.

```text
visited = empty
minHeap = [(0, start)]
answer = 0

while minHeap not empty:
    (weight, node) = pop minimum
    if node visited: continue
    mark node visited
    answer += weight
    for (neighbor, edgeWeight):
        if neighbor not visited:
            push (edgeWeight, neighbor)
```

**Problems:** Min Cost to Connect All Points,
Connecting Cities With Minimum Cost.

---

## Dynamic Programming

### 1. 1D — Linear Recurrence

```text
dp[0] = base case
dp[1] = base case
for i = 2 to n:
    dp[i] = transition(dp[i - 1], dp[i - 2], ...)
```

**Problems:** Climbing Stairs, Fibonacci Number, Decode Ways,
Min Cost Climbing Stairs.

### 2. 1D — Take / Skip

```text
dp[0] = ...
for i = 1 to n:
    take = value if taking current
    skip = dp[i - 1]
    dp[i] = max(take, skip)
```

**Problems:** House Robber, Delete and Earn,
Best Time to Buy and Sell Stock variants.

### 3. 0/1 Knapsack

Each item used at most once — iterate capacity **downward**.

```text
for each item:
    for capacity = maxCapacity down to item.weight:
        dp[capacity] = max(dp[capacity],
                           dp[capacity - item.weight] + item.value)
```

**Problems:** 0/1 Knapsack, Partition Equal Subset Sum, Target Sum,
Last Stone Weight II.

### 4. Unbounded Knapsack

Each item reusable — iterate capacity **upward**.

```text
for each item:
    for capacity = item.weight to maxCapacity:
        dp[capacity] = max(dp[capacity],
                           dp[capacity - item.weight] + item.value)
```

**Problems:** Coin Change, Coin Change II, Rod Cutting, Perfect Squares.

### 5. Subset Sum (Boolean)

```text
dp[0] = true
for each num:
    for sum = target down to num:
        dp[sum] = dp[sum] OR dp[sum - num]
```

**Problems:** Partition Equal Subset Sum, Subset Sum, Target Sum.

### 6. Coin Change — Minimum

```text
dp[0] = 0; all others = infinity
for amount = 1 to target:
    for coin in coins:
        if coin <= amount:
            dp[amount] = min(dp[amount], dp[amount - coin] + 1)
return dp[target]
```

**Problems:** Coin Change, Perfect Squares.

### 7. Coin Change — Number of Ways

```text
dp[0] = 1
for coin in coins:
    for amount = coin to target:
        dp[amount] += dp[amount - coin]
```

**Problems:** Coin Change II, Combination Sum IV (iteration order differs
when order matters).

### 8. Grid DP

```text
dp[0][0] = grid[0][0]
for each cell:
    dp[r][c] = best(dp[r - 1][c], dp[r][c - 1]) + grid[r][c]
# handle first row / column separately
```

**Problems:** Unique Paths (I & II), Minimum Path Sum, Triangle, Dungeon Game.

### 9. Two-String DP

```text
dp[i][j] = answer using first i chars of s1 and first j chars of s2
for i:
    for j:
        if characters match:
            dp[i][j] = transition from dp[i-1][j-1]
        else:
            dp[i][j] = best transition
```

**Problems:** Longest Common Subsequence, Edit Distance,
Distinct Subsequences, Interleaving String.

### 10. Longest Common Subsequence

```text
if s1[i - 1] == s2[j - 1]:
    dp[i][j] = dp[i - 1][j - 1] + 1
else:
    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
```

**Problems:** Longest Common Subsequence, Uncrossed Lines,
Shortest Common Supersequence.

### 11. Edit Distance

```text
if s1[i - 1] == s2[j - 1]:
    dp[i][j] = dp[i - 1][j - 1]
else:
    dp[i][j] = 1 + min(dp[i - 1][j],       # delete
                       dp[i][j - 1],       # insert
                       dp[i - 1][j - 1])   # replace
```

**Problems:** Edit Distance, Minimum ASCII Delete Sum for Two Strings.

### 12. Longest Increasing Subsequence

```text
# O(n^2)
dp[i] = 1
for i = 0 to n - 1:
    for j = 0 to i - 1:
        if nums[j] < nums[i]:
            dp[i] = max(dp[i], dp[j] + 1)
return max(dp)

# O(n log n): keep smallest tail per length
tails = []
for x in nums:
    position = lower_bound(tails, x)
    if position == tails.size: append x
    else:                      tails[position] = x
return tails.size
```

**Problems:** Longest Increasing Subsequence,
Number of Longest Increasing Subsequence, Maximum Length of Pair Chain.

### 13. Interval DP

```text
dp[left][right] = best answer for interval [left, right]
for length = 2 to n:
    for left:
        right = left + length - 1
        for split = left to right - 1:
            dp[left][right] = best(dp[left][split]
                                 + dp[split + 1][right] + cost)
```

**Problems:** Burst Balloons, Matrix Chain Multiplication,
Palindrome Partitioning II, Minimum Cost to Cut a Stick, Strange Printer.

### 14. Palindrome DP

```text
dp[l][r] = true if s[l..r] is a palindrome
for length = 1 to n:
    for l:
        r = l + length - 1
        if s[l] == s[r] AND (length <= 2 OR dp[l + 1][r - 1]):
            dp[l][r] = true
```

**Problems:** Longest Palindromic Substring, Palindromic Substrings,
Longest Palindromic Subsequence.

### 15. State Machine DP

Example: stock trading with two states.

```text
hold = max(previousHold, previousCash - price)
cash = max(previousCash, previousHold + price)
```

**Problems:** Best Time to Buy and Sell Stock (I–IV),
with Cooldown, with Transaction Fee.

### 16. Tree DP

```text
dfs(node):
    leftState = dfs(node.left)
    rightState = dfs(node.right)
    return combine(leftState, rightState, node)
```

**Problems:** House Robber III, Binary Tree Maximum Path Sum,
Diameter of Binary Tree, Distribute Coins in Binary Tree.

### 17. DP on DAG

Process nodes in topological order.

```text
topologicalOrder = topologicalSort(graph)
for node in topologicalOrder:
    for neighbor:
        dp[neighbor] = best(dp[neighbor], dp[node] + edgeValue)
```

**Problems:** Longest Path in DAG, Parallel Courses III,
Cheapest Flights Within K Stops.
