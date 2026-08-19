# Linked List

> **Scope** — Singly, doubly, and circular linked lists: memory model, core manipulation patterns (reversal, two-pointer, merging, cycle detection), and the classic interview problems built on top of them, all in C#.

**Contents**
- [1. Core Concepts](#1-core-concepts)
- [2. Complexity Reference](#2-complexity-reference)
- [3. C# Toolbox](#3-c-toolbox)
- [4. Core Patterns / Techniques](#4-core-patterns--techniques)
- [5. Classic Problems & Solutions](#5-classic-problems--solutions)
- [6. Pattern Recognition](#6-pattern-recognition)
- [7. Interview Focus](#7-interview-focus)
- [8. Common Traps & Edge Cases](#8-common-traps--edge-cases)
- [9. Related LeetCode Problems](#9-related-leetcode-problems)
- [10. Cheat Sheet](#10-cheat-sheet)
- [See Also](#see-also)

---

## 1. Core Concepts

A linked list is a chain of heap nodes. Each node stores a value plus links (`next`, and optionally `prev`); pointer wiring, not physical memory order, defines the structure.

### List variants: trade-offs

| Type | Extra pointer | Strength | Cost / interview warning |
|---|---|---|---|
| Singly linked list | none | Minimal memory; easiest reverse/merge templates | Cannot walk backward; deleting a known node still needs its predecessor |
| Doubly linked list | `prev` | O(1) detach/splice given the node; ideal for LRU/LFU recency lists | Every mutation must update both neighbors or the list corrupts |
| Circular linked list | optional `prev` | Natural queue/round-robin model; any node can act as the start | `while (node != null)` never terminates; traverse with a sentinel/start check |

### Reusable node definitions

```csharp
public class ListNode
{
    public int val;
    public ListNode next;
    public ListNode(int val = 0, ListNode next = null)
    {
        this.val = val;
        this.next = next;
    }
}

public class DoublyListNode
{
    public int val;
    public DoublyListNode prev;
    public DoublyListNode next;
    public DoublyListNode(int val = 0, DoublyListNode prev = null, DoublyListNode next = null)
    {
        this.val = val;
        this.prev = prev;
        this.next = next;
    }
}

public class RandomListNode
{
    public int val;
    public RandomListNode next;
    public RandomListNode random;
    public RandomListNode(int val) { this.val = val; }
}
```

> **Remember** — Snippets use LeetCode-style lowercase fields (`val`, `next`, `prev`, `random`) consistently; do not mix them with `Val`/`Next`.

### Memory model vs. arrays

- **No contiguity / no random access** — reaching node `i` means walking `i` links; there is no `arr[i]`.
- **Poor cache locality** — each `next` dereference can miss cache; arrays/`List<T>` prefetch well.
- **Per-node overhead** — object header/alignment plus one pointer (singly) or two (doubly) is large for tiny payloads.
- **Allocation / GC pressure** — one object per node means many allocations and many references to trace; long-lived caches can promote stale nodes to gen 2.
- **O(1) structural edits once positioned** — insert/remove is pointer rewiring, no shifting.

> **Use a linked list only when** you need frequent insert/delete/splice at already-located positions and do not need indexed/binary-searchable access: node-handle caches, intrusive/free lists, eviction queues, or stream concatenation.

### The head-pointer mutation problem

`ListNode head` is a local C# reference; reassigning it inside a helper does not change the caller's variable. Use one of two idioms:

1. **Return the new head** — `head = ReverseList(head);`
2. **Dummy / sentinel node** — place a throwaway node before the real head so insert/delete-at-head is not special; return `dummy.next`.

### Comparison: Array vs. Singly LL vs. Doubly LL vs. Circular LL

| Operation | Array | Singly LL | Doubly LL | Circular LL |
|---|---|---|---|---|
| Access by index | O(1) | O(n) | O(n) | O(n) |
| Search by value | O(n) | O(n) | O(n) | O(n) |
| Insert at head | O(n) shift | O(1) | O(1) | O(1) |
| Insert at tail | O(1) amortized | O(n)* | O(1)** | O(1)** |
| Delete given node reference | O(n) shift | O(n)*** | O(1) | O(1) |
| Memory overhead | none | 1 pointer/node | 2 pointers/node | 1-2 pointers/node |
| Cache behaviour | excellent, contiguous | poor, scattered | poor, scattered | poor, scattered |
| Growth / resizing | fixed or amortized reallocation | one-node-at-a-time growth | one-node-at-a-time growth | one-node-at-a-time growth |

`*` O(1) only if a tail pointer is maintained. `**` Same caveat. `***` Singly LL cannot walk backward, so it needs the predecessor by O(n) scan unless the prompt allows the value-copy trick, which fails for the true tail node.

---

## 2. Complexity Reference

| Operation | Time | Space | Notes |
|---|---|---|---|
| Traverse / find length | O(n) | O(1) | no length field unless you track a counter separately |
| Insert at head | O(1) | O(1) | repoint head only |
| Insert at tail | O(1) with tail pointer, else O(n) | O(1) | without a tail pointer you must walk to the end first |
| Insert after a known node | O(1) | O(1) | pure pointer rewire |
| Delete at head | O(1) | O(1) | `head = head.next` |
| Delete given node, singly LL, need predecessor | O(n) to find predecessor | O(1) | no backward pointer to walk |
| Delete given node, doubly LL | O(1) | O(1) | `prev` and `next` both already known |
| Reverse, iterative | O(n) | O(1) | single pass, three pointers |
| Reverse, recursive | O(n) | O(n) | call stack depth equals list length |
| Detect cycle, Floyd's | O(n) | O(1) | fast pointer laps slow within n steps if a cycle exists |
| Merge two sorted lists | O(n + m) | O(1) | splice existing nodes via a dummy tail, no new allocation |
| Merge k sorted lists, heap | O(N log k) | O(k) | N = total nodes across all lists, heap holds ≤ k head candidates |
| Reverse sublist / k-group | O(n) | O(1) | bounded pointer rewiring with a dummy predecessor |
| Sort a list, merge sort | O(n log n) | O(log n) top-down recursion; O(1) bottom-up | quicksort needs random-access partitioning; merge sort doesn't, so it is the natural list sort |
| LRU cache get/put | O(1) average | O(capacity) | dictionary lookup + `LinkedList<T>` node handles |
| LFU cache get/put | O(1) average | O(capacity) | key map + frequency buckets, each bucket ordered by recency |

---

## 3. C# Toolbox

| Type | What it gives you | Gotchas |
|---|---|---|
| Hand-rolled `ListNode` | Full control over pointer manipulation — required by nearly every interview problem, which explicitly asks you to rewire `next`/`prev` in place | You own all null-checking and traversal; no bounds safety net |
| `System.Collections.Generic.LinkedList<T>` | BCL doubly linked list; O(1) `AddFirst`, `AddLast`, `Remove(node)`, and `RemoveLast`; `.First`/`.Last` expose node handles | `Remove(value)` is O(n); `.First`/`.Last` can be `null`; rarely accepted as *the* interview answer since the exercise is pointer logic |
| `LinkedListNode<T>` | Exposes `.Value`, `.Next`, `.Previous` — the node handle backing `LinkedList<T>` | `Remove(node)` is O(1) only when you already hold that node; after removal its `.List` is `null`, so keep a `Dictionary<TKey, LinkedListNode<T>>` for lookup |
| `Dictionary<TKey, LinkedListNode<T>>` + `LinkedList<T>` | Combo gives O(1) get/put with O(1) recency reordering | Must keep dictionary and list perfectly in sync on every mutation — this pairing *is* the LRU cache implementation |

> **Interview Tip** — Interviewers still expect a hand-rolled `ListNode` even though `LinkedList<T>` exists in the BCL, because the point of the exercise is manipulating raw `next`/`prev` pointers, not exercising a library API.

> **Quick Note** — Method snippets assume a LeetCode-style `Solution` class with `System` and `System.Collections.Generic` in scope.

> **Remember** — An unlinked node with no live reference becomes garbage immediately; the CLR's generational GC reclaims short-lived list nodes cheaply. Long-lived partial lists that survive into gen 2 (e.g. a cache holding onto stale nodes) are the realistic production concern to raise if asked about scaling an LRU cache.

---

## 4. Core Patterns / Techniques

Most senior linked-list answers are compositions of a few pointer routines. Know the invariant before writing code.

| Routine | Core invariant | Commonly unlocks |
|---|---|---|
| Reverse | Save `next` before overwriting `curr.next`; `prev` is the reversed prefix | LC 206, palindrome, reorder, k-group |
| Find middle | Slow moves 1, fast moves 2; choose first vs. second middle deliberately | Palindrome, reorder, merge sort |
| Detect cycle | Floyd meeting proves a loop; reset one pointer to `head` to locate entry | LC 141/142, duplicate-as-cycle |
| Merge two sorted lists | Dummy + moving `tail`; attach leftover suffix once | LC 21, sort list, merge k |
| Dummy / sentinel head | Stable predecessor before the real head | Remove head, partition, dedup-all, nth from end |

> **Rewiring rule** — save the original successor, write the new pointer, then advance. If you overwrite `curr.next` before saving it, the rest of the list is lost.

### Dummy / Sentinel Head

Use when the head can be inserted before, removed, or replaced. The dummy gives a permanent predecessor and avoids separate `head` branches.

```csharp
public ListNode RemoveElements(ListNode head, int target)
{
    var dummy = new ListNode(0, head);
    var prev = dummy;

    while (prev.next != null)
    {
        if (prev.next.val == target) prev.next = prev.next.next;
        else prev = prev.next;
    }
    return dummy.next;
}
```

**Complexity / traps** — O(n) time for the traversal, O(1) extra node; return `dummy.next`, never `dummy`.

### Fast & Slow Pointers

Use for relative offsets without precomputing length: cycle detection, middle, nth-from-end.

```csharp
public bool HasCycle(ListNode head)
{
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null)
    {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}
```

**Complexity / traps** — O(n) time, O(1) space; guard both `fast` and `fast.next` before `fast.next.next`.

### Cycle Detection + Cycle Start (Floyd's)

Use for "has a cycle" and "return the entry node"; compare references, not values.

```csharp
public ListNode DetectCycleStart(ListNode head)
{
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null)
    {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast)
        {
            var ptr = head;
            while (ptr != slow)
            {
                ptr = ptr.next;
                slow = slow.next;
            }
            return ptr;
        }
    }
    return null;
}
```

**Why start reset works** — let `a` be head-to-entry, `b` entry-to-meeting, `c` meeting-to-entry, `L=b+c`. At meeting, `2(a+b+qL)=a+b+qL+kL`, so `a=(k-q-1)L+c`. Thus walking one pointer from `head` and one from the meeting point reaches the cycle start together. **Complexity:** O(n) time, O(1) space.

### Find Middle

```csharp
public ListNode MiddleNode(ListNode head)
{
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null)
    {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow; // second middle for even length
}

public ListNode FirstMiddle(ListNode head)
{
    if (head == null) return null;
    ListNode slow = head, fast = head;
    while (fast.next != null && fast.next.next != null)
    {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow; // first middle for even length
}
```

| Loop shape | Even-length result | Use when |
|---|---|---|
| `fast = head; while (fast != null && fast.next != null)` | Second middle | LC 876-style middle node |
| `fast = head; while (fast.next != null && fast.next.next != null)` | First middle | Split before reversing/weaving |
| `fast = head.next; while (fast != null && fast.next != null)` | First middle | Merge-sort split; avoids 2-node infinite recursion |

**Complexity** — O(n) time, O(1) space.

### Nth From End

```csharp
public ListNode RemoveNthFromEnd(ListNode head, int n)
{
    if (n <= 0) return head;

    var dummy = new ListNode(0, head);
    ListNode lead = dummy, trail = dummy;

    for (int i = 0; i < n; i++)
    {
        if (lead.next == null) return head;
        lead = lead.next;
    }

    while (lead.next != null)
    {
        lead = lead.next;
        trail = trail.next;
    }

    trail.next = trail.next.next;
    return dummy.next;
}
```

**Complexity / traps** — O(n) time, O(1) space; the dummy handles deleting the original head, and the lead pointer advances exactly `n` steps.

### Reverse (Iterative + Recursive)

Invariant: `prev` heads the reversed prefix, `curr` is the first unreversed node, and `next` must be saved before `curr.next` is overwritten.

```csharp
public ListNode ReverseList(ListNode head)
{
    ListNode prev = null, curr = head;
    while (curr != null)
    {
        var next = curr.next; // save before overwriting
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}
```

```csharp
public ListNode ReverseListRecursive(ListNode head)
{
    if (head == null || head.next == null) return head;
    var newHead = ReverseListRecursive(head.next);
    head.next.next = head;
    head.next = null;
    return newHead;
}
```

**Complexity / traps** — iterative: O(n) time, O(1) space. Recursive: O(n) time, O(n) call-stack space; forgetting `head.next = null` creates a 2-node cycle.

### Reverse in K-Groups

Reverse every full group of `k`; leave a trailing partial group unchanged.

```csharp
public ListNode ReverseKGroup(ListNode head, int k)
{
    if (head == null || k <= 1) return head;

    var dummy = new ListNode(0, head);
    var groupPrev = dummy;

    while (true)
    {
        var kth = GetKth(groupPrev, k);
        if (kth == null) break;

        var groupNext = kth.next;
        var prev = groupNext;
        var curr = groupPrev.next;

        while (curr != groupNext)
        {
            var next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }

        var newGroupPrev = groupPrev.next;
        groupPrev.next = kth;
        groupPrev = newGroupPrev;
    }
    return dummy.next;
}

private ListNode GetKth(ListNode curr, int k)
{
    while (curr != null && k > 0)
    {
        curr = curr.next;
        k--;
    }
    return curr;
}
```

**Complexity / traps** — O(n) time, O(1) space; locate the kth node before rewiring, and seed `prev = groupNext` to reconnect the reversed block.

### Merge Two Sorted Lists

```csharp
public ListNode MergeTwoLists(ListNode l1, ListNode l2)
{
    var dummy = new ListNode();
    var tail = dummy;
    while (l1 != null && l2 != null)
    {
        if (l1.val <= l2.val) { tail.next = l1; l1 = l1.next; }
        else                  { tail.next = l2; l2 = l2.next; }
        tail = tail.next;
    }
    tail.next = l1 ?? l2;
    return dummy.next;
}
```

**Complexity / traps** — O(n + m) time, O(1) space; `<=` preserves stability and the leftover suffix must be attached once.

### Merge K Sorted Lists

```csharp
public ListNode MergeKLists(ListNode[] lists)
{
    if (lists == null) return null;

    var pq = new PriorityQueue<ListNode, int>();
    foreach (var node in lists)
        if (node != null) pq.Enqueue(node, node.val);

    var dummy = new ListNode();
    var tail = dummy;
    while (pq.Count > 0)
    {
        var node = pq.Dequeue();
        var next = node.next;
        if (next != null) pq.Enqueue(next, next.val);

        node.next = null;
        tail.next = node;
        tail = node;
    }
    return dummy.next;
}
```

```csharp
public ListNode MergeKListsPairwise(ListNode[] lists)
{
    if (lists == null || lists.Length == 0) return null;

    for (int interval = 1; interval < lists.Length; interval *= 2)
        for (int i = 0; i + interval < lists.Length; i += interval * 2)
            lists[i] = MergeTwoLists(lists[i], lists[i + interval]);

    return lists[0];
}
```

| Approach | Time | Space | Notes |
|---|---|---|---|
| Min-heap of heads | O(N log k) | O(k) | Best streaming answer; heap holds at most one node per list |
| Pairwise divide-and-conquer | O(N log k) | O(1) iterative or O(log k) recursion | Good when `PriorityQueue` is unavailable |

### Sort List

Linked lists sort naturally with merge sort: split by first middle, recursively sort, merge. **Do not split on the second middle**; a 2-node list can infinite-recurse because the left half never shrinks.

```csharp
public ListNode SortList(ListNode head)
{
    if (head == null || head.next == null) return head;

    ListNode slow = head, fast = head.next;
    while (fast != null && fast.next != null)
    {
        slow = slow.next;
        fast = fast.next.next;
    }

    var rightHead = slow.next;
    slow.next = null;

    var left = SortList(head);
    var right = SortList(rightHead);
    return MergeTwoLists(left, right);
}
```

| Approach | Time | Space | Notes |
|---|---|---|---|
| Array sort + rewrite | O(n log n) | O(n) | Simple, not list-native |
| Insertion sort | O(n^2) | O(1) | Only for tiny/near-sorted lists |
| Merge sort | O(n log n) | O(log n) recursion; O(1) bottom-up | No random access required |

### Palindrome Check

Find the first middle, reverse the detached second half, compare, then restore if callers expect the input unchanged.

```csharp
public bool IsPalindrome(ListNode head)
{
    if (head == null || head.next == null) return true;

    ListNode firstHalfEnd = head, fast = head;
    while (fast.next != null && fast.next.next != null)
    {
        firstHalfEnd = firstHalfEnd.next;
        fast = fast.next.next;
    }

    var secondHalfStart = ReverseList(firstHalfEnd.next);
    firstHalfEnd.next = null;

    var p1 = head;
    var p2 = secondHalfStart;
    var ok = true;
    while (p2 != null)
    {
        if (p1.val != p2.val) { ok = false; break; }
        p1 = p1.next;
        p2 = p2.next;
    }

    firstHalfEnd.next = ReverseList(secondHalfStart);
    return ok;
}
```

**Complexity / traps** — O(n) time, O(1) space; leave the odd middle unpaired and restore the second half when side effects matter.

### Intersection of Two Lists

```csharp
public ListNode GetIntersectionNode(ListNode headA, ListNode headB)
{
    var a = headA;
    var b = headB;
    while (a != b)
    {
        a = a == null ? headB : a.next;
        b = b == null ? headA : b.next;
    }
    return a;
}
```

**Complexity / traps** — O(n + m) time, O(1) space; switching heads equalizes distance, so compare references and return the shared node or `null`.

### Copy List with Random Pointer

```csharp
public RandomListNode CopyRandomList(RandomListNode head)
{
    if (head == null) return null;
    var map = new Dictionary<RandomListNode, RandomListNode>();

    for (var node = head; node != null; node = node.next)
        map[node] = new RandomListNode(node.val);

    for (var node = head; node != null; node = node.next)
    {
        map[node].next = node.next != null ? map[node.next] : null;
        map[node].random = node.random != null ? map[node.random] : null;
    }
    return map[head];
}
```

```csharp
public RandomListNode CopyRandomListInPlace(RandomListNode head)
{
    if (head == null) return null;

    for (var node = head; node != null; node = node.next.next)
    {
        var copy = new RandomListNode(node.val) { next = node.next };
        node.next = copy;
    }

    for (var node = head; node != null; node = node.next.next)
        node.next.random = node.random?.next;

    var dummy = new RandomListNode(0);
    var tail = dummy;
    for (var node = head; node != null; )
    {
        var copy = node.next;
        var nextOriginal = copy.next;
        node.next = nextOriginal;
        tail.next = copy;
        tail = copy;
        node = nextOriginal;
    }

    tail.next = null;
    return dummy.next;
}
```

| Approach | Time | Space | Notes |
|---|---|---|---|
| `Dictionary<old, new>` | O(n) | O(n) | Easiest to explain |
| Interleave copies | O(n) | O(1) extra | Temporarily mutates; must unweave and restore |

### Reorder List (L0 -> Ln -> L1 -> Ln-1 -> ...)

```csharp
public void ReorderList(ListNode head)
{
    if (head == null || head.next == null) return;

    ListNode slow = head, fast = head;
    while (fast.next != null && fast.next.next != null)
    {
        slow = slow.next;
        fast = fast.next.next;
    }

    var secondHalf = ReverseList(slow.next);
    slow.next = null;

    var first = head;
    var second = secondHalf;
    while (second != null)
    {
        var tmp1 = first.next;
        var tmp2 = second.next;
        first.next = second;
        second.next = tmp1;
        first = tmp1;
        second = tmp2;
    }
}
```

**Complexity / traps** — O(n) time, O(1) space; split at first middle, reverse second half, and save both upcoming nodes before weaving.

### Rotate List

Compute length, reduce `k`, circularize once, then cut at the new tail.

```csharp
public ListNode RotateRight(ListNode head, int k)
{
    if (head == null || head.next == null || k == 0) return head;

    int length = 1;
    var tail = head;
    while (tail.next != null)
    {
        tail = tail.next;
        length++;
    }

    k %= length;
    if (k == 0) return head;

    tail.next = head;
    var newTail = head;
    for (int i = 1; i < length - k; i++)
        newTail = newTail.next;

    var newHead = newTail.next;
    newTail.next = null;
    return newHead;
}
```

**Complexity / traps** — O(n) time, O(1) space; forgetting `k %= length` cuts at the wrong node.

### LRU Cache (Doubly Linked List + Dictionary)

Keep LRU fully worked: dictionary gives O(1) lookup; linked-list node handles give O(1) recency moves and eviction.

```csharp
public class LRUCache
{
    private readonly int _capacity;
    private readonly Dictionary<int, LinkedListNode<(int key, int value)>> _map = new();
    private readonly LinkedList<(int key, int value)> _order = new(); // front = most recent

    public LRUCache(int capacity) => _capacity = Math.Max(0, capacity);

    public int Get(int key)
    {
        if (!_map.TryGetValue(key, out var node)) return -1;
        MoveToFront(node);
        return node.Value.value;
    }

    public void Put(int key, int value)
    {
        if (_capacity == 0) return;

        if (_map.TryGetValue(key, out var existing))
        {
            existing.Value = (key, value);
            MoveToFront(existing);
            return;
        }

        if (_map.Count == _capacity)
        {
            var lru = _order.Last;
            if (lru != null)
            {
                _map.Remove(lru.Value.key);
                _order.RemoveLast();
            }
        }

        var node = _order.AddFirst((key, value));
        _map[key] = node;
    }

    private void MoveToFront(LinkedListNode<(int key, int value)> node)
    {
        _order.Remove(node);
        _order.AddFirst(node);
    }
}
```

**Complexity / traps** — O(1) average `Get`/`Put`, O(capacity) space; every read updates recency, dictionary and list mutate together, and capacity `0` is a no-op.

### LFU Cache (Short Note)

LFU is the rarer follow-up: keep key -> `(value, freq)`, key -> bucket node, freq -> recency-ordered bucket, plus `minFreq`. On `Get`/update, remove from old bucket, bump freq, add to the new bucket head, and increment `minFreq` only if the old min bucket emptied. Evict the tail of bucket `minFreq`; new keys start at freq `1` and reset `minFreq = 1`. **Complexity:** O(1) average get/put, O(capacity) space.

Manual DLL fallback when BCL `LinkedList<T>` is disallowed: use head/tail sentinels; each detach/insert updates exactly four neighbor links, then the dictionary node handle must be synced.

---

## 5. Classic Problems & Solutions

Keep full code only where the problem adds a routine not already captured in §4; the rest is a one-line delta.

### Add Two Numbers (LC 2)

Simulate grade-school addition with a carry; the dummy head hides output-head creation.

```csharp
public ListNode AddTwoNumbers(ListNode l1, ListNode l2)
{
    var dummy = new ListNode();
    var curr = dummy;
    int carry = 0;

    while (l1 != null || l2 != null || carry != 0)
    {
        int sum = (l1?.val ?? 0) + (l2?.val ?? 0) + carry;
        carry = sum / 10;
        curr.next = new ListNode(sum % 10);
        curr = curr.next;
        l1 = l1?.next;
        l2 = l2?.next;
    }
    return dummy.next;
}
```

**Complexity** — O(max(n, m)) time, O(max(n, m)) output space; do not convert to a fixed-width integer.

### Reverse Linked List II (LC 92)

Bounded reversal: keep `before` fixed, repeatedly move `curr.next` to the front of the window.

```csharp
public ListNode ReverseBetween(ListNode head, int left, int right)
{
    if (head == null || left < 1 || left >= right) return head;

    var dummy = new ListNode(0, head);
    var before = dummy;
    for (int i = 1; i < left && before.next != null; i++)
        before = before.next;

    var curr = before.next;
    if (curr == null) return dummy.next;

    for (int i = 0; i < right - left && curr.next != null; i++)
    {
        var move = curr.next;
        curr.next = move.next;
        move.next = before.next;
        before.next = move;
    }
    return dummy.next;
}
```

**Complexity / trap** — O(n) time, O(1) space; `before` must not advance during reversal.

### Odd Even Linked List (LC 328)

Index parity, not value parity: maintain odd/even tails and reconnect the saved even head.

```csharp
public ListNode OddEvenList(ListNode head)
{
    if (head == null) return null;

    var odd = head;
    var even = head.next;
    var evenHead = even;

    while (even != null && even.next != null)
    {
        odd.next = even.next;
        odd = odd.next;
        even.next = odd.next;
        even = even.next;
    }

    odd.next = evenHead;
    return head;
}
```

**Complexity** — O(n) time, O(1) space.

### Remove Zero-Sum Consecutive Nodes (LC 1171)

Repeated prefix sums bracket a zero-sum run; keep the last node for each sum so the widest run is skipped.

```csharp
public ListNode RemoveZeroSumSublists(ListNode head)
{
    var dummy = new ListNode(0, head);
    var prefixToNode = new Dictionary<long, ListNode>();
    long sum = 0;

    for (var node = dummy; node != null; node = node.next)
    {
        sum += node.val;
        prefixToNode[sum] = node;
    }

    sum = 0;
    for (var node = dummy; node != null; node = node.next)
    {
        sum += node.val;
        node.next = prefixToNode[sum].next;
    }
    return dummy.next;
}
```

**Complexity** — O(n) time, O(n) space; brute re-scan is O(n^2) worst case.

### Compressed Variants / Reapplications

| Problem family | Use this routine | Twist | Complexity |
|---|---|---|---|
| Remove Duplicates from Sorted List I/II (LC 83/82) | Dummy + sorted-run walk | I keeps one by skipping equal `next`; II uses dummy predecessor and skips the entire duplicate run, including head | O(n) time, O(1) space |
| Reverse Linked List I/II (LC 206/92) | §4 reverse; bounded reversal above | LC 92 keeps stable `before` and moves `curr.next` to the sublist front | O(n) time, O(1) space |
| Linked List Cycle I/II (LC 141/142) | §4 Floyd | I returns bool; II resets one pointer to `head` after meeting to locate entry | O(n) time, O(1) space |
| Palindrome / Reorder / Twin Sum (LC 234/143/2130) | First middle -> reverse second half -> walk | Compare, weave, or sum pairs; restore if mutation is not allowed | O(n) time, O(1) space |
| Sort List (LC 148) | §4 merge sort | First-middle split is mandatory; second-middle split can infinite-recurse on 2 nodes | O(n log n) time, O(log n) stack |
| Rotate List (LC 61) | §4 rotate | Length, `k %= length`, circularize once, cut new tail | O(n) time, O(1) space |
| Partition List (LC 86) | Two dummy sublists | Detach/null each moved node, append `< x` then `>= x` to preserve order | O(n) time, O(1) space |
| Merge k / Swap pairs (LC 23/24) | §4 merge-k / k-group | LC 24 is k-group reversal with `k = 2` | O(N log k) or O(n) |
| Copy Random Pointer (LC 138) | §4 map or interleave | Interleaving is O(1) extra but must unweave and restore originals | O(n) time |
| Flatten Multilevel DLL (LC 430) | DFS stack + DLL splice | Push `next` before `child` so child is processed first; clear `child` links | O(n) time, O(depth)-O(n) stack |
| BST to Sorted Circular DLL (LC 426) | In-order threading | Visit sorted order, link tail to current, then close `head.prev = last` and `last.next = head` | O(n) time, O(h) stack |
| LFU Cache (LC 460) | Key map + frequency buckets + `minFreq` | Evict tail within min-frequency bucket; update `minFreq` only when old min bucket empties | O(1) average get/put |

---

## 6. Pattern Recognition

Recognition cues only:

- **Head may be removed/inserted before** -> dummy/sentinel predecessor.
- **"nth from end", "middle", "one pass"** -> fast/slow or lead/trail gap.
- **"cycle", "loop", "entry"** -> Floyd; reset one pointer to `head` for entry.
- **"reverse", "in-place", "O(1) extra"** -> save `next`, rewire, advance.
- **"reverse every k" / "between positions"** -> dummy-backed bounded reversal.
- **"merge sorted" / "k lists"** -> dummy merge; heap or pairwise for k-way.
- **"palindrome", "reorder", "twin sum"** -> first middle -> reverse second half -> compare/weave/sum.
- **"random pointer", "deep copy"** -> old-to-new map or interleave copies.
- **"intersection"** -> two-pointer head switch; compare references.
- **"rotate by k"** -> length, `k %= length`, circularize, cut.
- **"cache eviction"** -> hash map + doubly linked recency list; LFU adds frequency buckets.
- **"multilevel child" / "BST to DLL"** -> DFS/in-order pointer threading, not a new list primitive.

---

## 7. Interview Focus

- What is probed: pointer discipline, null/base cases, off-by-one control, and whether you can explain why the invariant is safe.
- O(1)-space follow-ups usually expect fast/slow pointers or in-place reversal instead of arrays, stacks, or hash sets.
- Clarify cycles/circularity up front; most prompts assume acyclic lists unless stated.
- Be explicit about side effects: palindrome/copy/random variants may need the original list restored.
- Should this even be a linked list? Avoid it for indexed access, binary search, or read-heavy workloads; arrays/`List<T>` win on cache locality and O(1) access.
- Real production fits: O(1) splice with held node handles, intrusive/free lists, eviction queues, and stream concatenation.
- Scaling signals: per-node allocation/object-header overhead, GC graph traversal, stale long-lived cache nodes, concurrency/lock-free CAS hazards, skip-list follow-ups, and unrolled lists for better locality.

---

## 8. Common Traps & Edge Cases

| Trap | Why it bites | Fix |
|---|---|---|
| Losing the `next` reference before rewiring | Overwriting `curr.next` before saving it strands the rest of the list | Cache `var next = curr.next;` before mutating `curr.next` |
| Off-by-one on nth-from-end | Advancing the lead pointer the wrong number of steps lands on the wrong node | Use a dummy head, advance lead exactly `n` steps before the joint walk |
| Not handling an empty list | `head == null` crashes naive traversal | Guard every entry point with an explicit null check |
| Not handling a single-node list | Fast/slow and reversal logic need `head.next == null` handled too | Add explicit base cases alongside the null check |
| Forgetting to null-terminate the tail | Partition/split leaves a stale pointer into the old structure | Explicitly set the new tail's `.next = null` after every split |
| Infinite loops in circular lists | `while (ptr != null)` never terminates on a true circular list | Traverse with `do { ... } while (ptr != head);` instead |
| Comparing node values instead of references | Distinct nodes can share `val`, breaking cycle/intersection detection | Compare node references (`==`), not `.val` |
| Deep recursion on long lists | Recursive reversal/sort can overflow the call stack even when asymptotic space is understood | Prefer iterative reversal; state recursion-stack cost explicitly |
| Forgetting `k % length` on rotation | Rotating by more than the length re-walks or cuts at the wrong node | Compute length once, use `k %= length`, then re-cut |
| Reversing an incomplete k-group | LC 25 leaves a trailing group of size `< k` unchanged | Locate the kth node before rewiring the group |
| Splitting sort with the second middle | A 2-node list can recurse into the same left half forever | Use the first-middle split (`fast = head.next` or the first-middle guard) |
| Temporary mutation not restored | Palindrome/copy/random-pointer variants can surprise callers by changing input shape | Restore links unless the problem statement explicitly allows mutation |
| Cache capacity zero | LRU/LFU eviction code may dereference `.Last` on an empty list | Treat capacity `0` as a no-op |
| Dummy node leaking into the result | Returning `dummy` instead of `dummy.next` | Always return `dummy.next` |

---

## 9. Related LeetCode Problems

> The full tiered problem set lives in [Practice Roadmap](../DSAPatterns/Practice-Roadmap.md). The list below is the minimum set for this topic.

| # | Problem | Difficulty | Pattern |
|---|---|---|---|
| 206 | Reverse Linked List | Easy | Iterative/recursive reversal |
| 21 | Merge Two Sorted Lists | Easy | Dummy-node merge |
| 19 | Remove Nth Node From End of List | Medium | Lead/trail n-gap |
| 141 | Linked List Cycle | Easy | Fast/slow detection |
| 142 | Linked List Cycle II | Medium | Floyd cycle-start math |
| 160 | Intersection of Two Linked Lists | Easy | Two-pointer head switch |
| 2 | Add Two Numbers | Medium | Digit-wise carry with dummy output |
| 92 | Reverse Linked List II | Medium | Bounded sublist reversal |
| 25 | Reverse Nodes in k-Group | Hard | Full-group reversal with dummy head |
| 23 | Merge k Sorted Lists | Hard | Heap or pairwise merge |
| 143 | Reorder List | Medium | First middle -> reverse -> weave |
| 234 | Palindrome Linked List | Easy | First middle -> reverse -> compare -> restore |
| 138 | Copy List with Random Pointer | Medium | Map or interleaving copy |
| 146 | LRU Cache | Medium | Doubly linked list + dictionary |
| 148 | Sort List | Medium | Merge sort with first-middle split |

---

## 10. Cheat Sheet

- **Dummy node** whenever the head might change: `var dummy = new ListNode(0, head); ... return dummy.next;`
- **Fast/slow**: `fast = fast.next.next; slow = slow.next;` while `fast != null && fast.next != null`.
- **Middle choice**: standard guard returns the second middle; first-middle splits use `fast.next != null && fast.next.next != null`.
- **Cycle start math**: distance head → cycle start equals distance meeting-point → cycle start (mod cycle length) ⇒ walk two pointers one step at a time from `head` and from the meeting point.
- **Reversal core**: save `next` before overwriting `curr.next`; three pointers `prev, curr, next`.
- **Nth from end**: advance lead pointer `n` steps first, then move both until `lead.next == null`.
- **Merge two lists**: dummy + `tail`; use `<=` for stability and `tail.next = a ?? b` for the leftover suffix.
- **Merge k lists**: `PriorityQueue<ListNode, int>` keyed by `node.val`, or pairwise merge halving the list count each round for O(N log k).
- **K-group reversal**: find the kth node before rewiring; set `prev = groupNext` so the reversed group reconnects cleanly.
- **Reorder list**: split at first middle → reverse second half → weave until the second half is exhausted.
- **Palindrome in O(1) space**: find the first middle → reverse the second half after it → compare → restore.
- **Intersection**: `a = a == null ? headB : a.next; b = b == null ? headA : b.next;` until references match.
- **Copy random pointer**: map old→new for clarity, or interleave `A -> A' -> B -> B'`, wire `random`, then unweave for O(1) extra space.
- **Reverse between positions**: keep `before` fixed, repeatedly move `curr.next` to the sublist front, return `dummy.next`.
- **Sort list**: merge sort is the native linked-list sort; split with the first middle so both halves shrink.
- **LRU**: `Dictionary<TKey, LinkedListNode<T>>` + `LinkedList<T>` (front = most recent); every `Get`/`Put` touches both structures.
- **LFU**: key map + frequency buckets; update `minFreq` only when the old min bucket empties; evict the tail within that bucket.
- **Manual DLL splice**: sentinel `head`/`tail`; detach and insert update four neighbor links, then sync the dictionary.
- **Rotate by k**: compute length, `k %= length`, circularize once, then cut the new tail.
- **Odd-even / flatten**: preserve relative order by saving group heads or stack-pushing `next` before `child`.
- **Always ask**: empty list? single node? cycle possible? need to restore input? indexed access needed — should this even be a list?

---

## See Also

- [Stack and Queue](../Stack%20and%20Queue/Stack%20and%20Queue.md) — Both are commonly implemented on top of linked nodes.
- [Hashing](../Hashing/Hashing.md) — LRU/LFU caches combine a hash map with a doubly linked list.
- [Arrays and Strings](../Arrays%20and%20Strings/Arrays%20and%20Strings.md) — The contiguous-memory counterpart; the array-vs-list trade-off is a standard follow-up.
- [Trees](../Trees/Trees.md) — Same pointer-rewiring discipline, one dimension up.
- [DSA Patterns](../DSAPatterns/DSAPatterns.md) — master index: pattern selection flowchart and complexity-from-constraints.
- [Practice Roadmap](../DSAPatterns/Practice-Roadmap.md) — the tiered problem set to drill this topic.
