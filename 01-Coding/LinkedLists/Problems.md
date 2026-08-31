# Linked Lists — Problems

| # | Problem | LeetCode | Pattern | Difficulty |
| - | ------- | -------- | ------- | ---------- |
| 1 | Reverse Linked List | 206 | Reversal | Easy |
| 2 | Reverse Linked List II | 92 | Reversal | Medium |
| 3 | Reverse Nodes in k-Group | 25 | Reversal | Hard |
| 4 | Middle of the Linked List | 876 | Fast/Slow | Easy |
| 5 | Linked List Cycle | 141 | Fast/Slow | Easy |
| 6 | Linked List Cycle II | 142 | Fast/Slow | Medium |
| 7 | Remove Nth Node From End | 19 | Fast/Slow | Medium |
| 8 | Palindrome Linked List | 234 | Fast/Slow + Reversal | Easy |
| 9 | Merge Two Sorted Lists | 21 | Merging | Easy |
| 10 | Sort List | 148 | Merging | Medium |
| 11 | Merge k Sorted Lists | 23 | Merging | Hard |
| 12 | Reorder List | 143 | Restructuring | Medium |
| 13 | Odd Even Linked List | 328 | Restructuring | Medium |
| 14 | Remove Duplicates from Sorted List II | 82 | Restructuring | Medium |
| 15 | Add Two Numbers | 2 | Restructuring | Medium |
| 16 | Intersection of Two Linked Lists | 160 | Two Pointers | Easy |
| 17 | Copy List with Random Pointer | 138 | Hashmap / Interleave | Medium |
| 18 | LRU Cache | 146 | Design | Medium |
| 19 | LFU Cache | 460 | Design | Hard |

---

## Reversal

### Reverse Linked List — LeetCode 206

Given the head of a singly linked list, reverse the list and return its new head.

**Example:** `1 → 2 → 3 → 4 → 5` → `5 → 4 → 3 → 2 → 1`

```text
BRUTE FORCE | O(n) | O(n)

Copy all values into an array, create a new list in reverse order.

------------------------------------------------------------------------------

RECURSIVE | O(n) | O(n)

ReverseRec(node):
  if node is null or node.Next is null → return node
  newHead = ReverseRec(node.Next)
  node.Next.Next = node
  node.Next = null
  return newHead

------------------------------------------------------------------------------

OPTIMAL — ITERATIVE | O(n) | O(1)

prev = null, cur = head
while cur != null:
  next = cur.Next        // save first!
  cur.Next = prev
  prev = cur
  cur = next
return prev
```

```csharp
public ListNode ReverseList(ListNode head)
{
    ListNode prev = null, cur = head;
    while (cur != null)
    {
        var next = cur.Next;
        cur.Next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}
```

> **Key insight:** the three-variable dance — always save `next` before overwriting `cur.Next`, or the rest of the list is lost.

---

### Reverse Linked List II — LeetCode 92

Reverse only the nodes from position `left` to `right` (1-indexed) in a single pass.

**Example:** `1 → 2 → 3 → 4 → 5`, left=2, right=4 → `1 → 4 → 3 → 2 → 5`

```text
BRUTE FORCE | O(n) | O(n)

Collect all values, reverse the subarray, rebuild nodes.

------------------------------------------------------------------------------

OPTIMAL — FRONT-INSERT | O(n) | O(1)

Use a dummy head. Walk to node just before 'left' (call it pre).
Repeatedly yank cur.Next and insert it right after pre:
  next = cur.Next
  cur.Next = next.Next
  next.Next = pre.Next
  pre.Next = next
Repeat (right - left) times.
```

```csharp
public ListNode ReverseBetween(ListNode head, int left, int right)
{
    var dummy = new ListNode(0, head);
    var pre = dummy;
    for (int i = 1; i < left; i++) pre = pre.Next;
    var cur = pre.Next;
    for (int i = 0; i < right - left; i++)
    {
        var next = cur.Next;
        cur.Next = next.Next;
        next.Next = pre.Next;
        pre.Next = next;
    }
    return dummy.Next;
}
```

> **Key insight:** front-insert into the sublist prefix inserts each successive node at the front without a second pass.

---

### Reverse Nodes in k-Group — LeetCode 25

Reverse every consecutive group of k nodes. Leave a tail of fewer than k nodes as-is.

**Example:** `1 → 2 → 3 → 4 → 5`, k=2 → `2 → 1 → 4 → 3 → 5`

```text
BRUTE FORCE | O(n) | O(n)

Collect nodes in groups of k, reverse each group, reconnect.

------------------------------------------------------------------------------

OPTIMAL — IN-PLACE GROUP REVERSAL | O(n) | O(1)

groupPrev = dummy
loop:
  kth = GetKth(groupPrev, k)   // returns null if fewer than k nodes remain
  if kth == null: break
  groupNext = kth.Next
  // reverse the group [groupPrev.Next .. kth] with tail=groupNext
  prev = groupNext, cur = groupPrev.Next
  while cur != groupNext:
    next = cur.Next; cur.Next = prev; prev = cur; cur = next
  tmp = groupPrev.Next        // old head = new tail of group
  groupPrev.Next = kth        // connect to new group head
  groupPrev = tmp             // advance for next iteration
```

```csharp
public ListNode ReverseKGroup(ListNode head, int k)
{
    var dummy = new ListNode(0, head);
    var groupPrev = dummy;
    while (true)
    {
        var kth = GetKth(groupPrev, k);
        if (kth == null) break;
        var groupNext = kth.Next;
        ListNode prev = groupNext, cur = groupPrev.Next;
        while (cur != groupNext)
        {
            var next = cur.Next;
            cur.Next = prev;
            prev = cur;
            cur = next;
        }
        var tmp = groupPrev.Next;
        groupPrev.Next = kth;
        groupPrev = tmp;
    }
    return dummy.Next;
}

private ListNode GetKth(ListNode cur, int k)
{
    while (cur != null && k > 0) { cur = cur.Next; k--; }
    return cur;
}
```

> **Key insight:** treat each group as a mini-reversal; `groupPrev` and `groupNext` act as the sentinels for that group.

---

## Fast and Slow Pointers

### Middle of the Linked List — LeetCode 876

Return the middle node. For even-length lists return the **second** middle node.

**Example:** `1 → 2 → 3 → 4 → 5 → 6` → node `4`

```text
BRUTE FORCE | O(n) | O(1)

Count nodes, traverse again to index n/2.

------------------------------------------------------------------------------

OPTIMAL — FAST/SLOW POINTERS | O(n) | O(1)

slow = head, fast = head
while fast != null and fast.Next != null:
  slow = slow.Next
  fast = fast.Next.Next
return slow
```

```csharp
public ListNode MiddleNode(ListNode head)
{
    var slow = head; var fast = head;
    while (fast != null && fast.Next != null)
    {
        slow = slow.Next;
        fast = fast.Next.Next;
    }
    return slow;
}
```

> **Key insight:** fast moves at 2× speed so when fast exhausts the list, slow is at the midpoint.

---

### Linked List Cycle — LeetCode 141

Determine if a linked list has a cycle.

**Example:** `3 → 2 → 0 → -4 → (back to 2)` → `true`

```text
BRUTE FORCE | O(n) | O(n)

Store visited nodes in a HashSet; if any node is seen twice, there is a cycle.

------------------------------------------------------------------------------

OPTIMAL — FLOYD'S CYCLE DETECTION | O(n) | O(1)

slow = head, fast = head
while fast != null and fast.Next != null:
  slow = slow.Next
  fast = fast.Next.Next
  if slow == fast: return true
return false
```

```csharp
public bool HasCycle(ListNode head)
{
    var slow = head; var fast = head;
    while (fast?.Next != null)
    {
        slow = slow.Next;
        fast = fast.Next.Next;
        if (slow == fast) return true;
    }
    return false;
}
```

> **Key insight:** fast eventually laps slow inside the cycle — their meeting is guaranteed in O(n).

---

### Linked List Cycle II — LeetCode 142

Find the node where the cycle begins. Return `null` if no cycle.

**Example:** `3 → 2 → 0 → -4 → (back to 2)` → node `2`

```text
BRUTE FORCE | O(n) | O(n)

HashSet of visited nodes; first repeated node is the entry.

------------------------------------------------------------------------------

OPTIMAL — FLOYD'S TWO-PHASE | O(n) | O(1)

Phase 1: detect meeting point (slow/fast).
Phase 2: reset slow to head, advance both 1 step at a time.
  They meet at the cycle entry.

Proof: F = head→entry, a = meeting-point offset from entry.
  F = nC - a  →  slow needs F steps from head,
  fast needs F steps from meeting point to reach entry.
```

```csharp
public ListNode DetectCycle(ListNode head)
{
    var slow = head; var fast = head;
    while (fast?.Next != null)
    {
        slow = slow.Next;
        fast = fast.Next.Next;
        if (slow == fast)
        {
            slow = head;
            while (slow != fast) { slow = slow.Next; fast = fast.Next; }
            return slow;
        }
    }
    return null;
}
```

> **Key insight:** after detection, resetting one pointer to head and walking both at speed 1 leverages F = nC − a to land both at the entry simultaneously.

---

### Remove Nth Node From End of List — LeetCode 19

Remove the nth node from the end of the list and return the head.

**Example:** `1 → 2 → 3 → 4 → 5`, n=2 → `1 → 2 → 3 → 5`

```text
BRUTE FORCE | O(n) | O(1)

Count length, traverse to position (length - n), remove next node.

------------------------------------------------------------------------------

OPTIMAL — TWO POINTERS (ONE PASS) | O(n) | O(1)

dummy → head
fast = dummy, slow = dummy
advance fast n+1 steps
while fast != null: fast = fast.Next, slow = slow.Next
slow.Next = slow.Next.Next
return dummy.Next
```

```csharp
public ListNode RemoveNthFromEnd(ListNode head, int n)
{
    var dummy = new ListNode(0, head);
    var fast = dummy; var slow = dummy;
    for (int i = 0; i <= n; i++) fast = fast.Next;
    while (fast != null) { fast = fast.Next; slow = slow.Next; }
    slow.Next = slow.Next.Next;
    return dummy.Next;
}
```

> **Key insight:** the n+1 step gap between fast and slow ensures slow stops at the predecessor of the node to remove.

---

### Palindrome Linked List — LeetCode 234

Check if a singly linked list is a palindrome. O(n) time, O(1) space.

**Example:** `1 → 2 → 2 → 1` → `true`

```text
BRUTE FORCE | O(n) | O(n)

Copy values to an array, use two-pointer palindrome check.

------------------------------------------------------------------------------

OPTIMAL — REVERSE SECOND HALF IN-PLACE | O(n) | O(1)

1. Find the left-middle with slow/fast (Convention B: stop when fast.Next == null or fast.Next.Next == null).
2. Reverse from slow.Next onward.
3. Compare first half and reversed second half.
4. (Optional) restore original list.
```

```csharp
public bool IsPalindrome(ListNode head)
{
    // Find left middle (Convention B)
    var slow = head; var fast = head;
    while (fast.Next != null && fast.Next.Next != null)
    {
        slow = slow.Next;
        fast = fast.Next.Next;
    }
    // Reverse second half
    ListNode prev = null, cur = slow.Next;
    while (cur != null) { var next = cur.Next; cur.Next = prev; prev = cur; cur = next; }
    // Compare
    var left = head; var right = prev;
    while (right != null)
    {
        if (left.Val != right.Val) return false;
        left = left.Next; right = right.Next;
    }
    return true;
}
```

> **Key insight:** reverse only the second half in-place — you never need more than O(1) extra space for a palindrome check on a list.

---

## Merging and Sorting

### Merge Two Sorted Lists — LeetCode 21

Merge two sorted linked lists into one sorted list.

**Example:** `1 → 2 → 4` and `1 → 3 → 4` → `1 → 1 → 2 → 3 → 4 → 4`

```text
BRUTE FORCE | O((m+n) log(m+n)) | O(m+n)

Copy both lists to an array, sort it, build a new list.

------------------------------------------------------------------------------

COPY-THEN-MERGE | O(m+n) | O(m+n)

Copy values to arrays, merge with two pointers, build new list.

------------------------------------------------------------------------------

OPTIMAL — IN-PLACE DUMMY HEAD | O(m+n) | O(1)

dummy → cur
while l1 and l2:
  attach smaller node to cur, advance that list
advance cur
attach remaining non-null tail
return dummy.Next
```

```csharp
public ListNode MergeTwoLists(ListNode l1, ListNode l2)
{
    var dummy = new ListNode();
    var cur = dummy;
    while (l1 != null && l2 != null)
    {
        if (l1.Val <= l2.Val) { cur.Next = l1; l1 = l1.Next; }
        else                  { cur.Next = l2; l2 = l2.Next; }
        cur = cur.Next;
    }
    cur.Next = l1 ?? l2;
    return dummy.Next;
}
```

> **Key insight:** the dummy head eliminates the special case of inserting the very first node.

---

### Sort List — LeetCode 148

Sort a linked list in O(n log n) time. O(1) space bonus: bottom-up merge sort avoids recursion stack.

**Example:** `4 → 2 → 1 → 3` → `1 → 2 → 3 → 4`

```text
BRUTE FORCE | O(n log n) | O(n)

Copy values to array, sort, rebuild list.

------------------------------------------------------------------------------

TOP-DOWN MERGE SORT | O(n log n) | O(log n)

Find middle, split, recursively sort both halves, merge.
Space is O(log n) recursion stack.

------------------------------------------------------------------------------

OPTIMAL — BOTTOM-UP MERGE SORT | O(n log n) | O(1)

size = 1
while size < length:
  for each pair of sub-lists of length 'size':
    merge them
  size *= 2
No recursion stack needed.
```

```csharp
public ListNode SortList(ListNode head)
{
    if (head?.Next == null) return head;
    // Count length
    int len = 0; for (var n = head; n != null; n = n.Next) len++;
    var dummy = new ListNode(0, head);
    for (int size = 1; size < len; size <<= 1)
    {
        var cur = dummy.Next; var tail = dummy;
        while (cur != null)
        {
            var left = cur;
            var right = Split(left, size);
            cur = Split(right, size);
            var (merged, end) = MergeWithTail(left, right);
            tail.Next = merged; tail = end;
        }
        tail.Next = null;
    }
    return dummy.Next;
}

private ListNode Split(ListNode head, int size)
{
    for (int i = 1; head != null && i < size; i++) head = head.Next;
    if (head == null) return null;
    var rest = head.Next; head.Next = null; return rest;
}

private (ListNode head, ListNode tail) MergeWithTail(ListNode l1, ListNode l2)
{
    var dummy = new ListNode(); var cur = dummy;
    while (l1 != null && l2 != null)
    {
        if (l1.Val <= l2.Val) { cur.Next = l1; l1 = l1.Next; }
        else                  { cur.Next = l2; l2 = l2.Next; }
        cur = cur.Next;
    }
    cur.Next = l1 ?? l2;
    while (cur.Next != null) cur = cur.Next;
    return (dummy.Next, cur);
}
```

> **Key insight:** bottom-up merge sort achieves O(1) space by iterating over doubling sub-list sizes rather than recursing.

---

### Merge k Sorted Lists — LeetCode 23

Merge k sorted linked lists into one sorted list.

**Example:** `[[1,4,5],[1,3,4],[2,6]]` → `1 → 1 → 2 → 3 → 4 → 4 → 5 → 6`

```text
BRUTE FORCE — MERGE 2 AT A TIME | O(nk) | O(1)

Merge lists one by one left to right. Each merge is O(n·i) for the ith merge.
Total: O(nk²).

------------------------------------------------------------------------------

OPTIMAL — DIVIDE AND CONQUER MERGE PAIRS | O(n log k) | O(1)

while number of lists > 1:
  merge adjacent pairs of lists
  if odd number: carry last list to next round
→ log k rounds, each O(n) total work
```

```csharp
// Divide and conquer — pure linked-list technique, O(n log k) time, O(1) space
public ListNode MergeKLists(ListNode[] lists)
{
    if (lists.Length == 0) return null;
    int n = lists.Length;
    while (n > 1)
    {
        for (int i = 0; i < n / 2; i++)
            lists[i] = MergeTwoLists(lists[i], lists[n - 1 - i]);
        n = (n + 1) / 2;
    }
    return lists[0];
}

private ListNode MergeTwoLists(ListNode l1, ListNode l2)
{
    var dummy = new ListNode(); var cur = dummy;
    while (l1 != null && l2 != null)
    {
        if (l1.Val <= l2.Val) { cur.Next = l1; l1 = l1.Next; }
        else                  { cur.Next = l2; l2 = l2.Next; }
        cur = cur.Next;
    }
    cur.Next = l1 ?? l2;
    return dummy.Next;
}
```

> **Key insight:** divide-and-conquer pairs is the pure linked-list O(n log k) approach; for the min-heap O(n log k) approach see [Heaps and Priority Queues](../HeapsAndPriorityQueues/HeapsAndPriorityQueues.md).

---

## Restructuring

### Reorder List — LeetCode 143

Reorder `L0 → L1 → … → Ln` to `L0 → Ln → L1 → Ln-1 → …` in-place.

**Example:** `1 → 2 → 3 → 4` → `1 → 4 → 2 → 3`

```text
BRUTE FORCE | O(n) | O(n)

Copy nodes to array, use two pointers to build reordered list.

------------------------------------------------------------------------------

OPTIMAL — FIND MIDDLE / REVERSE / INTERLEAVE | O(n) | O(1)

1. Find left-middle with slow/fast (Convention B).
2. Reverse from slow.Next onward; set slow.Next = null to split.
3. Interleave: take 1 from first, 1 from second, repeat.
```

```csharp
public void ReorderList(ListNode head)
{
    if (head?.Next == null) return;
    // Step 1: find left middle
    var slow = head; var fast = head;
    while (fast.Next != null && fast.Next.Next != null)
    { slow = slow.Next; fast = fast.Next.Next; }
    // Step 2: reverse second half
    var second = slow.Next; slow.Next = null;
    ListNode prev = null, cur = second;
    while (cur != null) { var next = cur.Next; cur.Next = prev; prev = cur; cur = next; }
    second = prev;
    // Step 3: interleave
    var first = head;
    while (second != null)
    {
        var fn = first.Next; var sn = second.Next;
        first.Next = second; second.Next = fn;
        first = fn; second = sn;
    }
}
```

> **Key insight:** the three-phase pattern (find middle → reverse half → interleave) solves any "zigzag between two halves" restructuring problem.

---

### Odd Even Linked List — LeetCode 328

Group all nodes at odd indices before nodes at even indices (1-indexed, relative order preserved).

**Example:** `1 → 2 → 3 → 4 → 5` → `1 → 3 → 5 → 2 → 4`

```text
BRUTE FORCE | O(n) | O(n)

Collect odd-index and even-index values separately, build new list.

------------------------------------------------------------------------------

OPTIMAL — TWO CHAINS | O(n) | O(1)

oddHead = head, evenHead = head.Next
odd = oddHead, even = evenHead
while even != null and even.Next != null:
  odd.Next = even.Next
  odd = odd.Next
  even.Next = odd.Next
  even = even.Next
odd.Next = evenHead
return oddHead
```

```csharp
public ListNode OddEvenList(ListNode head)
{
    if (head == null) return null;
    var odd = head; var even = head.Next; var evenHead = even;
    while (even?.Next != null)
    {
        odd.Next = even.Next; odd = odd.Next;
        even.Next = odd.Next; even = even.Next;
    }
    odd.Next = evenHead;
    return head;
}
```

> **Key insight:** maintain two separate chains simultaneously; link the even chain onto the odd chain at the end.

---

### Remove Duplicates from Sorted List II — LeetCode 82

Remove all nodes whose value appears more than once, leaving only distinct values.

**Example:** `1 → 2 → 3 → 3 → 4 → 4 → 5` → `1 → 2 → 5`

```text
BRUTE FORCE | O(n) | O(n)

Collect value counts, rebuild list keeping only count-1 values.

------------------------------------------------------------------------------

OPTIMAL — DUMMY HEAD + SKIP DUPLICATES | O(n) | O(1)

dummy → head
pre = dummy
while cur != null:
  if cur.Next != null and cur.Val == cur.Next.Val:
    val = cur.Val
    while cur != null and cur.Val == val: cur = cur.Next
    pre.Next = cur
  else:
    pre = pre.Next; cur = cur.Next
return dummy.Next
```

```csharp
public ListNode DeleteDuplicates(ListNode head)
{
    var dummy = new ListNode(0, head);
    var pre = dummy; var cur = head;
    while (cur != null)
    {
        if (cur.Next != null && cur.Val == cur.Next.Val)
        {
            int val = cur.Val;
            while (cur != null && cur.Val == val) cur = cur.Next;
            pre.Next = cur;
        }
        else { pre = cur; cur = cur.Next; }
    }
    return dummy.Next;
}
```

> **Key insight:** the dummy head lets `pre` always have a valid predecessor, so you can skip entire duplicate runs by setting `pre.Next = cur`.

---

### Add Two Numbers — LeetCode 2

Two non-empty lists store digits of non-negative integers in reverse order. Return their sum as a list.

**Example:** `(2 → 4 → 3) + (5 → 6 → 4)` → `7 → 0 → 8` (342 + 465 = 807)

```text
BRUTE FORCE | O(m+n) | O(m+n)

Convert lists to integers, add, convert back. Overflows for large inputs.

------------------------------------------------------------------------------

OPTIMAL — DIGIT-BY-DIGIT WITH CARRY | O(max(m,n)) | O(1)

dummy → tail, carry = 0
while l1 or l2 or carry:
  sum = (l1?.Val ?? 0) + (l2?.Val ?? 0) + carry
  carry = sum / 10
  tail.Next = new node(sum % 10)
  advance tail, l1, l2
return dummy.Next
```

```csharp
public ListNode AddTwoNumbers(ListNode l1, ListNode l2)
{
    var dummy = new ListNode(); var tail = dummy;
    int carry = 0;
    while (l1 != null || l2 != null || carry != 0)
    {
        int sum = (l1?.Val ?? 0) + (l2?.Val ?? 0) + carry;
        carry = sum / 10;
        tail.Next = new ListNode(sum % 10);
        tail = tail.Next;
        if (l1 != null) l1 = l1.Next;
        if (l2 != null) l2 = l2.Next;
    }
    return dummy.Next;
}
```

> **Key insight:** handle the carry in the loop condition (`|| carry != 0`) so a final carry creates the correct extra node automatically.

---

### Intersection of Two Linked Lists — LeetCode 160

Find the node at which two singly linked lists intersect. Return `null` if no intersection.

**Example:** `A: a1→a2→c1→c2→c3`, `B: b1→b2→b3→c1→c2→c3` → node `c1`

```text
BRUTE FORCE | O(mn) | O(1)

For each node in A, scan all of B for equality.

------------------------------------------------------------------------------

HASH SET | O(m+n) | O(m)

Store all nodes of A in a set, scan B for first hit.

------------------------------------------------------------------------------

OPTIMAL — TWO-POINTER LENGTH EQUALISATION | O(m+n) | O(1)

pA = headA, pB = headB
while pA != pB:
  pA = pA != null ? pA.Next : headB
  pB = pB != null ? pB.Next : headA
return pA
When each pointer exhausts its list, redirect to the other's head.
Both traverse m+n nodes total → meet at intersection (or both null).
```

```csharp
public ListNode GetIntersectionNode(ListNode headA, ListNode headB)
{
    var pA = headA; var pB = headB;
    while (pA != pB)
    {
        pA = pA != null ? pA.Next : headB;
        pB = pB != null ? pB.Next : headA;
    }
    return pA;
}
```

> **Key insight:** redirecting each pointer to the other list's head equalises the total distance travelled so both pointers meet at the intersection node.

---

## Copy and Design

### Copy List with Random Pointer — LeetCode 138

Deep-copy a list where each node has `Next` and `Random` (pointing to any node or null).

**Example:** `[[7,null],[13,0],[11,4],[10,2],[1,0]]` → identical independent deep copy

```text
BRUTE FORCE (HASH MAP) | O(n) | O(n)

Pass 1: create copy of each node, store in map[original → copy].
Pass 2: set copy.Next = map[original.Next], copy.Random = map[original.Random].

------------------------------------------------------------------------------

OPTIMAL — O(1) SPACE INTERLEAVING | O(n) | O(1)

Step 1 (Weave): for each node, insert copy right after: A → A' → B → B' → ...
Step 2 (Random): copy.Random = original.Random.Next (because copy is always at original.Random.Next)
Step 3 (Separate): restore original list; extract copy list.
```

```csharp
public class Node { public int Val; public Node Next, Random; public Node(int v) { Val = v; } }

public Node CopyRandomList(Node head)
{
    if (head == null) return null;
    // Step 1: weave
    for (var cur = head; cur != null; cur = cur.Next.Next)
    {
        var copy = new Node(cur.Val) { Next = cur.Next };
        cur.Next = copy;
    }
    // Step 2: set random pointers
    for (var cur = head; cur != null; cur = cur.Next.Next)
        if (cur.Random != null) cur.Next.Random = cur.Random.Next;
    // Step 3: separate
    var copyHead = head.Next;
    for (var cur = head; cur != null; cur = cur.Next)
    {
        var copy = cur.Next;
        cur.Next = copy.Next;
        if (copy.Next != null) copy.Next = copy.Next.Next;
    }
    return copyHead;
}
```

> **Key insight:** weaving copies into the original list gives each copy O(1)-accessible access to its random target's copy via `original.Random.Next`.

---

### LRU Cache — LeetCode 146

Design a data structure that supports `Get(key)` and `Put(key, value)` both in O(1), evicting the **least recently used** key when at capacity.

```text
NAIVE | O(n) | O(n)

Array or list of (key, value, timestamp); scan for LRU on eviction.

------------------------------------------------------------------------------

OPTIMAL — HASH MAP + DOUBLY LINKED LIST | O(1) | O(capacity)

HashMap: key → DLL node (O(1) lookup).
DLL: MRU at head, LRU at tail; two sentinels eliminate boundary checks.
Get: find node via map, move to front, return value.
Put: if exists, update + move to front.
     If new and at capacity: evict tail.Prev (remove from DLL and from map).
     Insert new node at front, add to map.
```

```csharp
public class LRUCache
{
    private class Node { public int Key, Val; public Node Prev, Next; public Node(int k=0,int v=0){Key=k;Val=v;} }
    private readonly int _cap;
    private readonly Dictionary<int, Node> _map;
    private readonly Node _head, _tail;

    public LRUCache(int capacity)
    {
        _cap = capacity;
        _map = new Dictionary<int, Node>(capacity);
        _head = new Node(); _tail = new Node();
        _head.Next = _tail; _tail.Prev = _head;
    }

    public int Get(int key)
    {
        if (!_map.TryGetValue(key, out var node)) return -1;
        MoveToFront(node); return node.Val;
    }

    public void Put(int key, int value)
    {
        if (_map.TryGetValue(key, out var node)) { node.Val = value; MoveToFront(node); return; }
        if (_map.Count == _cap) { var lru = _tail.Prev; Remove(lru); _map.Remove(lru.Key); }
        var fresh = new Node(key, value);
        InsertFront(fresh); _map[key] = fresh;
    }

    private void Remove(Node n) { n.Prev.Next = n.Next; n.Next.Prev = n.Prev; }
    private void InsertFront(Node n) { n.Next = _head.Next; n.Prev = _head; _head.Next.Prev = n; _head.Next = n; }
    private void MoveToFront(Node n) { Remove(n); InsertFront(n); }
}
```

> **Key insight:** the doubly linked list gives O(1) removal of any node (no scan needed); sentinel nodes eliminate every null-check edge case.

---

### LFU Cache — LeetCode 460

Design a data structure that supports `Get(key)` and `Put(key, value)` both in O(1), evicting the **least frequently used** key (breaking ties by LRU) when at capacity.

```text
NAIVE | O(n) | O(n)

Scan all keys for minimum frequency on eviction.

------------------------------------------------------------------------------

OPTIMAL — FREQ-BUCKET DLL | O(1) | O(capacity)

_keyMap:  key → (value, freq)
_freqMap: freq → LinkedList<int> of keys (front=MRU within that freq)
_nodeMap: key → LinkedListNode<int> for O(1) removal from _freqMap
_minFreq: current minimum frequency

Get(key): look up value, call Increment(key), return value.
Put(key, val):
  if exists: update value + Increment(key)
  if new: if at capacity, evict _freqMap[_minFreq].Last (remove from all maps)
          add to _freqMap[1], _keyMap, _nodeMap; _minFreq = 1
Increment(key):
  remove key from _freqMap[freq]
  if _freqMap[freq] empty and _minFreq == freq: _minFreq++
  add key to front of _freqMap[freq+1]
  update _keyMap[key].freq++
  update _nodeMap[key] to new LinkedListNode
```

```csharp
public class LFUCache
{
    private readonly int _cap;
    private int _minFreq;
    private readonly Dictionary<int, (int val, int freq)> _keyMap;
    private readonly Dictionary<int, LinkedList<int>> _freqMap;
    private readonly Dictionary<int, LinkedListNode<int>> _nodeMap;

    public LFUCache(int capacity)
    {
        _cap = capacity;
        _keyMap = new(); _freqMap = new(); _nodeMap = new();
    }

    public int Get(int key)
    {
        if (!_keyMap.TryGetValue(key, out var kv)) return -1;
        Increment(key, kv.val, kv.freq);
        return kv.val;
    }

    public void Put(int key, int value)
    {
        if (_cap == 0) return;
        if (_keyMap.TryGetValue(key, out var kv)) { Increment(key, value, kv.freq); return; }
        if (_keyMap.Count == _cap)
        {
            var evict = _freqMap[_minFreq].Last!.Value;
            _freqMap[_minFreq].RemoveLast();
            _keyMap.Remove(evict); _nodeMap.Remove(evict);
        }
        _keyMap[key] = (value, 1);
        if (!_freqMap.ContainsKey(1)) _freqMap[1] = new LinkedList<int>();
        _freqMap[1].AddFirst(key);
        _nodeMap[key] = _freqMap[1].First!;
        _minFreq = 1;
    }

    private void Increment(int key, int value, int freq)
    {
        _freqMap[freq].Remove(_nodeMap[key]);
        if (_freqMap[freq].Count == 0 && _minFreq == freq) _minFreq++;
        int nf = freq + 1;
        if (!_freqMap.ContainsKey(nf)) _freqMap[nf] = new LinkedList<int>();
        _freqMap[nf].AddFirst(key);
        _keyMap[key] = (value, nf);
        _nodeMap[key] = _freqMap[nf].First!;
    }
}
```

> **Key insight:** per-frequency doubly linked lists give O(1) LRU eviction within a frequency bucket; `_minFreq` only ever increments by 1 on a new insertion (reset to 1), keeping tracking O(1).

