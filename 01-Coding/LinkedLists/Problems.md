# Linked Lists — Problems

## Reverse Linked List

Given the head of a singly linked list, reverse the list and return its head.

**Example:** `1 → 2 → 3 → 4 → 5` → `5 → 4 → 3 → 2 → 1`

```text
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

## Merge 2 Sorted Lists

Given the heads of two sorted linked lists, merge them into one sorted linked list and return its head.

**Example:** `1 → 2 → 4` and `1 → 3 → 4` → `1 → 1 → 2 → 3 → 4 → 4`

```text
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

## Linked List Cycle

Given the head of a linked list, determine if the linked list has a cycle in it.

**Example:** `3 → 2 → 0 → -4` with the tail linking back to node `2` → `true`

```text
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

## Linked List Cycle II

Find the node where the cycle begins in a linked list. If there is no cycle, return null.

**Example:** `3 → 2 → 0 → -4` with the tail linking back to node `2` → node `2`

```text
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

## Middle of the Linked List

Given the head of a singly linked list, return the middle node. If there are two middle nodes, return the second middle node.

**Example:** `1 → 2 → 3 → 4 → 5 → 6` → `4`

```text
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

## Remove Nth Node From End of List

Given the head of a linked list, remove the n-th node from the end of the list

**Example:** `1 → 2 → 3 → 4 → 5, n = 2` → `1 → 2 → 3 → 5`

```text
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

## Reorder List

Given the head of a singly linked list, reorder the list to follow the pattern: L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …

**Example:** `1 → 2 → 3 → 4` → `1 → 4 → 2 → 3`

```text
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

## Add Two Numbers

You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each node contains a single digit. Add the two numbers and return the sum as a linked list.

**Example:** `(2 → 4 → 3) + (5 → 6 → 4)` → `7 → 0 → 8` (342 + 465 = 807)

```text
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

## Copy List with Random Pointer

Given a linked list where each node contains an additional random pointer that could point to any node in the list or null, return a deep copy of the list.

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

```text
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

## Merge K Sorted Lists

Given an array of k linked-lists lists, each linked-list is sorted in ascending order, merge all the linked-lists into one sorted linked-list and return it.

**Example:** `[[1,4,5],[1,3,4],[2,6]]` → `1 → 1 → 2 → 3 → 4 → 4 → 5 → 6`

```text
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
