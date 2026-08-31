# Heaps and Priority Queues — Problems

## Last Stone Weight

You are given an array of positive integers representing stone weights.

Repeatedly:

Pick the two heaviest stones.
Smash them together.
If they have equal weight, both are destroyed.
If their weights differ, the heavier stone remains with weight equal to the difference.

Continue until at most one stone remains.

Return the weight of the remaining stone, or 0 if none remains.

**Example:** `stones = [2, 7, 4, 1, 8, 1]` → `1`

```text
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

## Kth Largest Element in an Array

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

## K Closest Points to Origin

Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane and an integer k, return the k closest points to the origin (0, 0) in any order

**Example:** `points = [[1, 3], [-2, 2]], k = 1` → `[[-2, 2]]`

```text
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

## Task Scheduler

Given a characters array tasks, representing the tasks a CPU needs to do, where each letter represents a different task. Tasks could be done in any order. Each task takes 1 unit of time to complete. For each unit of time, the CPU could complete either one task or just be idle.
There is a non-negative integer n that represents the cooldown period between two same tasks. Return the least number of units of times that the CPU will take to finish all the given tasks.

**Example:** `tasks = ["A","A","A","B","B","B"], n = 2` → `8` (A B idle A B idle A B)

```text
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

## Top K Frequent Words

Given an array of strings words and an integer k, return the k most frequent words.

The ordering rules are:
Higher frequency comes first.
If two words have the same frequency, the lexicographically smaller word comes first.

**Example:** `words = ["i","love","leetcode","i","love","coding"], k = 2` → `["i","love"]`

```text
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

## Find Median from Data Stream

Design a data structure that supports adding a number to a stream and returning the median of everything seen so far.

**Example:** `addNum(1), addNum(2), findMedian()` → `1.5`; then `addNum(3), findMedian()` → `2`

```text
BRUTE FORCE | O(N log N) per query | O(N)

Store every number in a list and sort it whenever the median is requested

-----------------------------------------------------------------------------

SORTED LIST | O(N) for add, O(1) for find median | O(N)

Binary search finds the insertion point in O(log N), but shifting the elements still costs O(N)

-----------------------------------------------------------------------------

TWO HEAPS | O(log N) for add, O(1) for find median | O(N)

// lower = max heap holding the smaller half, upper = min heap holding the larger half
// Keeping the sizes within one of each other leaves the median at the tops

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

-----------------------------------------------------------------------------

BALANCED BST | O(log N) for add, O(1) for find median | O(N)

Store the numbers in an order-statistic tree and keep a pointer to the median node
```

> If the values come from a small bounded range, a counting array gives O(1) add and O(range) median.

## Meeting Rooms III

You are given: n meeting rooms numbered 0 to n - 1 and a list of meetings [start, end]

Rules:

A meeting should use the unused room with the smallest room number.
If no room is available when a meeting starts, the meeting is delayed until a room becomes available.
When delayed, the meeting keeps the same duration.
Among rooms that become free at the same time, choose the smallest room number.
Return the room that hosted the most meetings.
If multiple rooms have the same count, return the smallest room number.

**Example:** `n = 2, meetings = [[0,10],[1,5],[2,7],[3,4]]` → `0`

```text
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
