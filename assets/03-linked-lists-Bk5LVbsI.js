const e=`---\r
title: Linked Lists\r
description: Node anatomy, pointer manipulation tricks and the fast/slow pointer techniques that turn linked list interview problems from fiddly to mechanical\r
difficulty: Foundational\r
tags: [linked-list, pointers, patterns]\r
---\r
\r
Linked lists rarely appear in production code paths you'd write today, but they remain a staple interview topic because they test something specific: can you manipulate pointers correctly under pressure without an off-by-one or a lost reference. The good news is that almost every linked-list question is one of five reusable techniques.\r
\r
## Node anatomy and list shapes\r
\r
A linked list is a chain of nodes, each holding a value and a reference to the next node (and, for doubly linked lists, the previous one too).\r
\r
\`\`\`csharp\r
class ListNode {\r
    public int Val;\r
    public ListNode? Next;\r
    public ListNode(int val) { Val = val; }\r
}\r
\r
class DListNode {\r
    public int Val;\r
    public DListNode? Next;\r
    public DListNode? Prev;\r
}\r
\`\`\`\r
\r
\`\`\`mermaid\r
flowchart LR\r
    H["head"] --> N1["3"] --> N2["7"] --> N3["1"] --> Nil["null"]\r
\`\`\`\r
\r
| Variant | Structure | Notes |\r
|---|---|---|\r
| Singly linked | Each node points to next only | Simplest; no backward traversal |\r
| Doubly linked | Each node points to next and previous | O(1) removal given a node reference; \`LinkedList<T>\` in C# |\r
| Circular | Last node points back to head (or first) | Used for round-robin buffers, \`next\` never null |\r
\r
> [!KEY]\r
> Almost every linked-list bug is a **pointer ordering** bug: reassigning \`next\` before you've saved the reference you needed. Always capture what you need into a local variable *before* mutating pointers.\r
\r
## Insert and delete complexity\r
\r
| Operation | Array | Singly linked list |\r
|---|---|---|\r
| Insert/delete at front | \`O(n)\` shift | \`O(1)\` |\r
| Insert/delete at back (with tail pointer) | \`O(1)\` amortised | \`O(1)\` with tail, else \`O(n)\` |\r
| Insert/delete at arbitrary position | \`O(n)\` shift | \`O(n)\` to find + \`O(1)\` to splice |\r
| Access by index | \`O(1)\` | \`O(n)\` |\r
\r
The headline trade: linked lists win at the **front**, arrays win at **random access**. Everywhere else they're comparable once you count the \`O(n)\` search needed to reach an arbitrary linked-list position.\r
\r
## The dummy head technique\r
\r
Inserting or deleting at the **head** of a list requires special-casing, because the head has no predecessor to update — unless you invent one. A **dummy (sentinel) node** placed before the real head removes every special case: every real node now has a predecessor, including the original head.\r
\r
\`\`\`csharp\r
// Remove all nodes with a given value — dummy head avoids a special case for removing the head itself\r
public ListNode? RemoveElements(ListNode? head, int val) {\r
    var dummy = new ListNode(0) { Next = head };\r
    var cur = dummy;\r
    while (cur.Next != null) {\r
        if (cur.Next.Val == val) cur.Next = cur.Next.Next;\r
        else cur = cur.Next;\r
    }\r
    return dummy.Next;\r
}\r
\`\`\`\r
\r
> [!TIP]\r
> Whenever a linked-list problem says "the head might need to change" (delete node, insert before head, merge lists), reach for a dummy node immediately. It's a small trick that eliminates an entire class of edge-case bugs.\r
\r
## Fast and slow pointers\r
\r
Two pointers moving at different speeds through a list solve a surprising number of problems without extra space.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    A["1"] --> B["2"] --> C["3"] --> D["4"] --> E["5"] --> Nil["null"]\r
\`\`\`\r
\r
| Goal | Technique | Why it works |\r
|---|---|---|\r
| Find the middle | Slow moves 1 step, fast moves 2 | When fast reaches the end, slow is at the midpoint |\r
| Detect a cycle | Slow moves 1, fast moves 2 | If there's a cycle, fast eventually laps slow inside it |\r
| Find cycle entry point | After meeting, reset one pointer to head, move both 1 step at a time | Meeting point math guarantees they meet at the cycle start |\r
| Find nth-from-end | Advance fast n steps first, then move both together | Fast finishes exactly n steps ahead of slow |\r
\r
\`\`\`csharp\r
// Cycle detection (Floyd's algorithm) + finding the entry point\r
public ListNode? DetectCycle(ListNode head) {\r
    var slow = head, fast = head;\r
    while (fast?.Next != null) {\r
        slow = slow.Next!;\r
        fast = fast.Next.Next;\r
        if (slow == fast) {\r
            var ptr = head;\r
            while (ptr != slow) { ptr = ptr.Next!; slow = slow.Next!; }\r
            return ptr;             // start of the cycle\r
        }\r
    }\r
    return null;                    // no cycle\r
}\r
\`\`\`\r
\r
> [!WARNING]\r
> Always guard with \`fast?.Next != null\`, not just \`fast != null\`. Forgetting the \`.Next\` check dereferences a null pointer the moment the list has an even length.\r
\r
## Reversal: iterative and recursive\r
\r
\`\`\`csharp\r
// Iterative: O(n) time, O(1) space — the standard answer\r
public ListNode? Reverse(ListNode? head) {\r
    ListNode? prev = null, cur = head;\r
    while (cur != null) {\r
        var next = cur.Next;   // save before overwriting\r
        cur.Next = prev;\r
        prev = cur;\r
        cur = next;\r
    }\r
    return prev;\r
}\r
\r
// Recursive: O(n) time, O(n) space (call stack) — elegant but not free\r
public ListNode? ReverseRec(ListNode? head) {\r
    if (head?.Next == null) return head;\r
    var newHead = ReverseRec(head.Next);\r
    head.Next.Next = head;\r
    head.Next = null;\r
    return newHead;\r
}\r
\`\`\`\r
\r
Always mention both, and note the space trade-off — the recursive version isn't "free", it just moves the cost to the call stack, and will stack-overflow on a very long list where the iterative version won't.\r
\r
## Merging sorted lists\r
\r
Merging two sorted linked lists is the same idea as the merge step of merge sort, done with pointers instead of array indices — a dummy head keeps the splicing code clean.\r
\r
\`\`\`csharp\r
public ListNode? MergeTwoLists(ListNode? a, ListNode? b) {\r
    var dummy = new ListNode(0);\r
    var tail = dummy;\r
    while (a != null && b != null) {\r
        if (a.Val <= b.Val) { tail.Next = a; a = a.Next; }\r
        else { tail.Next = b; b = b.Next; }\r
        tail = tail.Next;\r
    }\r
    tail.Next = a ?? b;   // attach whichever list has leftovers\r
    return dummy.Next;\r
}\r
\`\`\`\r
\r
\`O(n + m)\` time, \`O(1)\` extra space (we relink existing nodes rather than allocating new ones). Merging **k** sorted lists extends this with a min-heap keyed by current node value, giving \`O(N log k)\` where \`N\` is the total number of nodes.\r
\r
## When does a linked list actually beat an array?\r
\r
Rarely, and it's worth saying so out loud in an interview rather than reflexively defaulting to a linked list.\r
\r
| Scenario | Better choice | Why |\r
|---|---|---|\r
| Frequent insert/delete at both ends, no random access needed | Linked list (or \`Deque\`) | O(1) at the ends, no shifting |\r
| Need random access by index | Array / \`List<T>\` | O(1) vs O(n) |\r
| Cache-sensitive, tight loops | Array | Contiguous memory, cache-friendly |\r
| Splicing large sublists between structures (e.g., LRU cache) | Doubly linked list | O(1) node removal/insertion given the node |\r
| General-purpose "list of things" | Array / \`List<T>\` | Better constants almost always win |\r
\r
> [!NOTE]\r
> The realistic production use case for a linked list is an **LRU cache**: a doubly linked list gives O(1) move-to-front and O(1) removal of an arbitrary node (given its reference), paired with a hash map for O(1) lookup of that node. That combination is the actual reason \`LinkedList<T>\` exists in .NET's collection library.\r
\r
## Cheat sheet\r
\r
- Save \`next\` into a local variable *before* you overwrite a \`Next\` pointer — the #1 source of linked-list bugs.\r
- Use a dummy head whenever the head itself might change (delete head, merge, insert-before-head).\r
- Fast/slow pointers solve: middle-of-list, cycle detection, cycle entry point, nth-from-end — all \`O(n)\` time, \`O(1)\` space.\r
- Reversal: iterative is \`O(1)\` space; recursive is \`O(n)\` space via the call stack — know both, prefer iterative for long lists.\r
- Merging k sorted lists: min-heap of the k current heads, \`O(N log k)\`.\r
- Linked lists win at insert/delete near the head or given a node reference; arrays win almost everywhere else, especially at random access.\r
- Doubly linked list + hash map is the real-world combo behind an LRU cache.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Overwriting \`Next\` before saving the old value | Always capture \`next = cur.Next\` first |\r
| Checking \`fast != null\` but not \`fast?.Next != null\` | Both checks are required before \`fast.Next.Next\` |\r
| Special-casing head insert/delete inline | Use a dummy head node instead |\r
| Forgetting to null-terminate after reversal | The old head's \`Next\` must become \`null\` |\r
| Assuming recursive reversal is "free" | It costs \`O(n)\` stack space and can overflow on long lists |\r
| Losing the rest of the list when splicing | Save \`tail.Next\` (or the next node) before reassigning |\r
\r
## Summary\r
\r
Linked list problems are pointer bookkeeping exercises: save what you need before you mutate, use a dummy head to erase head-of-list special cases, and reach for fast/slow pointers whenever the problem smells like "middle", "cycle", or "nth from end". Arrays beat linked lists in almost every practical dimension except O(1) insert/delete near the head or at a known node — which is precisely the shape of an LRU cache, the one place linked lists show up in real systems.\r
\r
## Top Interview Questions\r
\r
### Q1. What's the difference between a singly and doubly linked list, and what does each cost you?\r
\r
A singly linked list stores only a \`Next\` reference per node — it's smaller and simpler, but you can only traverse forward, and deleting a node requires a reference to its predecessor, which means an \`O(n)\` scan to find it unless you already have that predecessor in hand. A doubly linked list adds a \`Prev\` reference per node, doubling the pointer overhead per node, but in exchange you can traverse backward and delete a node in \`O(1)\` given only a reference to that node itself, since you can reach its predecessor directly. This is exactly why \`LinkedList<T>\` in .NET, and LRU cache implementations generally, use doubly linked lists.\r
\r
### Q2. How do fast and slow pointers detect a cycle in a linked list, and how do you find where the cycle begins?\r
\r
Advance \`slow\` one node and \`fast\` two nodes per step. If there's no cycle, \`fast\` reaches the end (\`null\`) first. If there is a cycle, \`fast\` enters it and, moving twice as fast as \`slow\`, eventually "laps" \`slow\` from behind — they meet inside the cycle. To find the cycle's entry point, reset one pointer to the head and leave the other at the meeting point, then advance both one step at a time; the mathematics of the distances involved guarantees they meet exactly at the first node of the cycle. This is Floyd's cycle-detection algorithm, and it runs in \`O(n)\` time with \`O(1)\` extra space.\r
\r
### Q3. Why does the dummy head technique simplify linked-list code?\r
\r
Without a dummy node, the head of the list has no predecessor, so any operation that might delete or insert before the head needs a separate branch of code just for that case (e.g., \`if (node == head) head = head.Next; else prev.Next = node.Next;\`). A dummy node placed just before the real head means every real node — including the original head — now has a predecessor, so the exact same splicing logic handles the head and every other position uniformly. You return \`dummy.Next\` at the end instead of tracking a possibly-changed \`head\` variable. It's a small trick that removes an entire category of edge-case bugs, especially in merge and delete operations.\r
\r
### Q4. Reverse a singly linked list iteratively. Then explain the recursive version and its trade-off.\r
\r
Iteratively: maintain \`prev\` (initially null) and \`cur\` (initially head); in a loop, save \`cur.Next\` into a temporary, point \`cur.Next\` at \`prev\`, then advance both \`prev\` and \`cur\` by one. This is \`O(n)\` time and \`O(1)\` space. Recursively: reverse the rest of the list first (\`ReverseRec(head.Next)\`), then fix up the link so \`head.Next.Next = head\`, and set \`head.Next = null\`. This is elegant to write but costs \`O(n)\` auxiliary space on the call stack — for a list with hundreds of thousands of nodes, that can stack-overflow, whereas the iterative version has constant space and no such risk. In an interview, I'd lead with iterative and mention the recursive version's trade-off proactively.\r
\r
### Q5. How would you merge two sorted linked lists, and how does that extend to merging k sorted lists?\r
\r
For two lists, use a dummy head and a tail pointer; repeatedly compare the current heads of both lists, splice the smaller one onto the result's tail, and advance that list's pointer; when one list runs out, attach whatever remains of the other directly. This is \`O(n + m)\` time and \`O(1)\` extra space, since nodes are relinked rather than copied. For k lists, put the current head of each list into a min-heap keyed by value; repeatedly pop the minimum, append it to the result, and push that node's \`Next\` (if any) back into the heap. This is \`O(N log k)\` time where \`N\` is the total node count across all lists — better than merging lists two at a time sequentially for large k.\r
\r
### Q6. Given only a reference to a node in the middle of a singly linked list (not the head), how would you delete it?\r
\r
You can't easily find the predecessor without the head, so the standard trick is: copy the *next* node's value into the current node, then skip over the next node by setting \`cur.Next = cur.Next.Next\`. Effectively, you're deleting the *next* node but making it look like you deleted the current one. This only works if the node is not the last node in the list (since there'd be no "next" value to copy) — if it might be the tail, you need the actual predecessor, which requires a full traversal from the head, \`O(n)\`.\r
\r
### Q7. How do you find the middle of a linked list in one pass?\r
\r
Use fast and slow pointers, both starting at the head: on each step, \`slow\` advances one node and \`fast\` advances two. When \`fast\` reaches the end of the list (or \`fast.Next\` is null for an even-length list), \`slow\` is sitting at the middle. This is \`O(n)\` time, \`O(1)\` space, and avoids a two-pass approach (count the length, then walk \`length/2\` steps), which is also \`O(n)\` but touches the list twice and needs to handle the length calculation separately.\r
\r
### Q8. You suspect a linked list-based queue in production is leaking memory even though items are being dequeued. What would you check?\r
\r
I'd first check whether dequeue actually nulls out the removed node's \`Next\` (and \`Prev\`, if doubly linked) reference before dropping it, or whether it just moves the head pointer forward and leaves the old head's outgoing pointer intact — in a language with a tracing garbage collector this specific case usually isn't fatal since nothing still references the old node, but it's worth verifying nothing else (like a debug/history list) is holding a reference to old nodes. I'd also check for an accidental cycle introduced by a buggy insert (e.g., a node's \`Next\` pointing back into the middle of the list), which would keep an entire chain of "removed" nodes reachable and unable to be collected. Finally, I'd check if raw nodes are exposed to external code that might retain long-lived references to them.\r
\r
### Q9. When would you genuinely prefer a linked list over an array/List\\<T\\> in real code?\r
\r
Rarely, and I'd say so directly rather than defaulting to a linked list. The one strong case is when you need O(1) insertion and removal at both ends *and* O(1) removal of an arbitrary element given a direct reference to it — the canonical example is an LRU cache, where a doubly linked list tracks recency order and a hash map gives O(1) lookup of the node to move or evict. Outside of that kind of combined structure, arrays win on cache locality, random access, and lower memory overhead per element, even when both are asymptotically "O(n)" for some operation — the constant factors from pointer-chasing and cache misses are real.\r
\r
### Q10. What's the difference between a circular linked list and a regular one, and where is it used?\r
\r
In a circular linked list, the last node's \`Next\` points back to the head instead of to \`null\`, so traversal never naturally terminates — you must track a count or stop when you return to a known starting node. It's used for round-robin scheduling (e.g., cycling through processes or players in a game), circular buffers, and implementing structures like the Josephus problem elegantly. The main implementation gotcha is that any traversal loop written with the "until null" idiom will infinite-loop on a circular list, so you need an explicit termination condition, usually a count or "stop when we're back at the start" check.\r
`;export{e as default};
