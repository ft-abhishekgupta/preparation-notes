const e=`---\r
title: Heaps and Priority Queues\r
description: Binary heap internals, why build-heap is linear time, and the top-K and two-heap patterns that appear across dozens of interview problems\r
difficulty: Core\r
tags: [heap, priority-queue, top-k, patterns]\r
---\r
\r
A heap answers one question fast, repeatedly: "what's the current min (or max)?" That single capability — \`O(log n)\` insert, \`O(1)\` peek, \`O(log n)\` remove-extreme — powers scheduling, top-K problems, heap sort, graph algorithms (Dijkstra's, Prim's), and merging sorted data. Interviewers expect you to reach for \`PriorityQueue\` the moment a problem mentions "kth", "top", "smallest/largest k", or "merge sorted".\r
\r
## Binary heap as an array\r
\r
A binary heap is a **complete binary tree** (every level full except possibly the last, filled left to right) stored directly in an array — no explicit pointers needed, because a node's children and parent are computable from its index.\r
\r
![A binary max-heap and its underlying array layout](notes/DSA/HeapsAndPriorityQueues/image-5.png)\r
\r
\`\`\`mermaid\r
flowchart TD\r
    A["1<br/>idx 0"] --> B["3<br/>idx 1"]\r
    A --> C["5<br/>idx 2"]\r
    B --> D["7<br/>idx 3"]\r
    B --> E["9<br/>idx 4"]\r
\`\`\`\r
\r
| Node at index \`i\` | Formula |\r
|---|---|\r
| Left child | \`2i + 1\` |\r
| Right child | \`2i + 2\` |\r
| Parent | \`(i - 1) / 2\` |\r
\r
A **min-heap** keeps every parent ≤ its children (root is the minimum); a **max-heap** flips the inequality. This is a weaker ordering than a BST — siblings have no defined order relative to each other — which is exactly why heap operations are cheaper than BST ones for "give me the extreme value" but can't do full sorted traversal or arbitrary search in \`O(log n)\`.\r
\r
> [!KEY]\r
> A heap is not sorted — it only guarantees the root is the min (or max). That relaxed invariant is what makes insert and remove-extreme \`O(log n)\` instead of \`O(n)\`.\r
\r
## Sift-up and sift-down\r
\r
Insert appends to the end of the array, then **sifts up**: swap with the parent while the heap property is violated. Remove-min swaps the root with the last element, shrinks the array, then **sifts down**: swap with the smaller child while violated.\r
\r
\`\`\`csharp\r
// Sift up after appending — O(log n)\r
void SiftUp(List<int> heap, int i) {\r
    while (i > 0) {\r
        int parent = (i - 1) / 2;\r
        if (heap[parent] <= heap[i]) break;\r
        (heap[parent], heap[i]) = (heap[i], heap[parent]);\r
        i = parent;\r
    }\r
}\r
\r
// Sift down from index i — O(log n)\r
void SiftDown(List<int> heap, int i) {\r
    int n = heap.Count;\r
    while (true) {\r
        int left = 2 * i + 1, right = 2 * i + 2, smallest = i;\r
        if (left < n && heap[left] < heap[smallest]) smallest = left;\r
        if (right < n && heap[right] < heap[smallest]) smallest = right;\r
        if (smallest == i) break;\r
        (heap[i], heap[smallest]) = (heap[smallest], heap[i]);\r
        i = smallest;\r
    }\r
}\r
\`\`\`\r
\r
Both operations move along a single root-to-leaf path, so both are \`O(log n)\` — bounded by the tree's height.\r
\r
### Deleting an arbitrary element, not just the root\r
\r
Removing the min/max is the common case, but a heap can also delete any known element: find its index (an accompanying hash map from value to index makes this \`O(1)\` instead of an \`O(n)\` scan), overwrite it with the last element in the array, shrink the array, then sift that replacement in whichever direction restores the heap property — it may need to sift up (if it's now smaller than its new parent, in a min-heap) or sift down (if it's larger than a new child).\r
\r
\`\`\`csharp\r
// Delete a known element by index — O(log n) once the index is known\r
void DeleteAt(List<int> heap, int index) {\r
    heap[index] = heap[^1];\r
    heap.RemoveAt(heap.Count - 1);\r
    if (index < heap.Count) {\r
        SiftDown(heap, index);\r
        SiftUp(heap, index);   // only one of these actually moves anything; harmless to call both\r
    }\r
}\r
\`\`\`\r
\r
This is the operation behind "cancel a scheduled job" or "remove a specific vertex's stale distance entry" — situations where you need to remove something other than the current extreme.\r
\r
## Build-heap is O(n), not O(n log n)\r
\r
Inserting \`n\` elements one at a time costs \`O(n log n)\`. But **heapify** — the standard build-from-array procedure — calls \`SiftDown\` on every non-leaf node, starting from the last non-leaf up to the root, and is \`O(n)\` overall.\r
\r
The reason: most nodes live near the bottom of the tree and have very little distance left to sift. Roughly half the nodes are leaves (0 sift work), a quarter are one level up (at most 1 swap), an eighth two levels up, and so on — the sum \`Σ (n / 2^(h+1)) * h\` converges to a constant multiple of \`n\`, not \`n log n\`.\r
\r
> [!TIP]\r
> Say this explicitly when it's relevant: *"Building the heap from the input array up front is O(n), so the overall algorithm is O(n + k log n) rather than O(n log n)"* — it's a precise, senior-sounding detail that most candidates get wrong.\r
\r
## PriorityQueue in .NET\r
\r
.NET's \`PriorityQueue<TElement, TPriority>\` is a **min-heap** by priority; pass a custom comparer for max-heap behaviour.\r
\r
\`\`\`csharp\r
var pq = new PriorityQueue<string, int>();\r
pq.Enqueue("task-a", 5);\r
pq.Enqueue("task-b", 1);          // lower priority value dequeues first\r
pq.Dequeue();                      // "task-b"\r
\r
// Max-heap: reverse the comparer\r
var maxPq = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));\r
\`\`\`\r
\r
| Operation | Complexity |\r
|---|---|\r
| \`Enqueue\` | \`O(log n)\` |\r
| \`Dequeue\` | \`O(log n)\` |\r
| \`Peek\` | \`O(1)\` |\r
| Construct from \`n\` items via constructor overload | \`O(n)\` (heapify) |\r
\r
## Top-K pattern: min-heap of size k\r
\r
To find the k **largest** elements in a stream, counter-intuitively use a **min-heap** capped at size k: push every element, and whenever the heap exceeds size k, pop the minimum. What survives at the end is the k largest, and the root is always the **kth largest** — a useful side effect.\r
\r
\`\`\`csharp\r
// k largest elements, O(n log k) time, O(k) space\r
public int[] KLargest(int[] nums, int k) {\r
    var pq = new PriorityQueue<int, int>();\r
    foreach (int x in nums) {\r
        pq.Enqueue(x, x);\r
        if (pq.Count > k) pq.Dequeue();     // evict the current smallest\r
    }\r
    var result = new int[pq.Count];\r
    for (int i = 0; i < result.Length; i++) result[i] = pq.Dequeue();\r
    return result;\r
}\r
\`\`\`\r
\r
\`O(n log k)\` beats sorting the whole array (\`O(n log n)\`) whenever \`k\` is small relative to \`n\` — a detail worth naming explicitly.\r
\r
> [!WARNING]\r
> The inversion trips people up: min-heap for **largest** k, max-heap for **smallest** k. The heap holds the "k best so far", and you evict the *worst of the best* — which is the minimum when you're hunting for the largest values.\r
\r
## Merge k sorted lists\r
\r
Push the first element of each list (or its index) into a min-heap keyed by value. Repeatedly pop the minimum, emit it, and push the next element from the same source list.\r
\r
\`\`\`csharp\r
// O(N log k) time, O(k) space — N total elements across k lists\r
public int[] MergeKSortedArrays(int[][] lists) {\r
    var pq = new PriorityQueue<(int val, int listIdx, int elemIdx), int>();\r
    for (int i = 0; i < lists.Length; i++)\r
        if (lists[i].Length > 0) pq.Enqueue((lists[i][0], i, 0), lists[i][0]);\r
\r
    var result = new List<int>();\r
    while (pq.Count > 0) {\r
        var (val, li, ei) = pq.Dequeue();\r
        result.Add(val);\r
        if (ei + 1 < lists[li].Length)\r
            pq.Enqueue((lists[li][ei + 1], li, ei + 1), lists[li][ei + 1]);\r
    }\r
    return result.ToArray();\r
}\r
\`\`\`\r
\r
## Median from a data stream: two heaps\r
\r
Maintain a max-heap for the **lower** half of numbers seen and a min-heap for the **upper** half, kept balanced in size (within 1 of each other). The median is then either the max-heap's root, or the average of both roots.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    L["max-heap<br/>(lower half)"] -->|"root = largest of the small"| M["median"]\r
    R["min-heap<br/>(upper half)"] -->|"root = smallest of the large"| M\r
\`\`\`\r
\r
\`\`\`csharp\r
public class MedianFinder {\r
    private readonly PriorityQueue<int, int> _lo = new(Comparer<int>.Create((a, b) => b.CompareTo(a))); // max-heap\r
    private readonly PriorityQueue<int, int> _hi = new();  // min-heap\r
\r
    public void AddNum(int num) {\r
        _lo.Enqueue(num, num);\r
        _hi.Enqueue(_lo.Dequeue(), _lo.Peek());   // shuffle the max of lo into hi\r
        if (_hi.Count > _lo.Count) _lo.Enqueue(_hi.Dequeue(), -_hi.Peek());\r
    }\r
\r
    public double FindMedian() =>\r
        _lo.Count > _hi.Count ? _lo.Peek() : (_lo.Peek() + _hi.Peek()) / 2.0;\r
}\r
\`\`\`\r
\r
Each insert is \`O(log n)\`; \`FindMedian\` is \`O(1)\` — a huge improvement over re-sorting on every insert.\r
\r
## Heap vs sorted list vs BST\r
\r
| Need | Heap | Sorted array/list | Balanced BST |\r
|---|---|---|---|\r
| Find min/max | \`O(1)\` peek | \`O(1)\` if you know which end | \`O(log n)\` |\r
| Insert | \`O(log n)\` | \`O(n)\` (shift to keep sorted) | \`O(log n)\` |\r
| Remove min/max | \`O(log n)\` | \`O(1)\` / \`O(n)\` depending on end | \`O(log n)\` |\r
| Search arbitrary value | \`O(n)\` | \`O(log n)\` (binary search) | \`O(log n)\` |\r
| Iterate in sorted order | \`O(n log n)\` (repeated pop) | \`O(n)\` | \`O(n)\` |\r
| Build from n items | \`O(n)\` | \`O(n log n)\` sort | \`O(n log n)\` insert one at a time |\r
\r
> [!NOTE]\r
> Pick a heap when you only ever need the current extreme value repeatedly. Pick a sorted structure or BST when you need arbitrary search, range queries, or full sorted order — a heap can't do those efficiently.\r
\r
## Cheat sheet\r
\r
- A heap is a complete binary tree stored in an array; parent/child indices are pure arithmetic (\`2i+1\`, \`2i+2\`, \`(i-1)/2\`).\r
- Sift-up on insert, sift-down on remove — both \`O(log n)\`, bounded by tree height.\r
- Deleting a specific known element (not just the root): swap it with the last array element, shrink, then sift in whichever direction restores order — \`O(log n)\` given its index.\r
- Building a heap from a full array (\`heapify\`) is \`O(n)\`, not \`O(n log n)\` — most nodes are near the bottom with little sifting to do.\r
- \`PriorityQueue<TElement,TPriority>\` in .NET is a min-heap by default; flip with a custom \`Comparer\`.\r
- Top-k **largest** → min-heap capped at size k. Top-k **smallest** → max-heap capped at size k.\r
- Merge k sorted sequences: min-heap of "current head of each sequence", \`O(N log k)\`.\r
- Median of a stream: max-heap for the lower half + min-heap for the upper half, kept balanced in size.\r
- A heap can't binary-search or iterate in sorted order cheaply — use a BST or sorted structure for that.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Using a max-heap for "k largest" | Use a min-heap capped at size k, evicting the smallest |\r
| Assuming build-heap is \`O(n log n)\` | It's \`O(n)\` via bottom-up heapify |\r
| Expecting a heap to support fast arbitrary search | Heaps only guarantee the root; search is \`O(n)\` |\r
| Forgetting \`PriorityQueue.Dequeue\` is \`O(log n)\`, not \`O(1)\` | Only \`Peek\` is \`O(1)\` |\r
| Rebuilding the whole heap on every insert during a stream | Insert incrementally with sift-up, \`O(log n)\` per element |\r
| Using one heap to track a running median | You need two heaps, kept balanced in size |\r
\r
## Summary\r
\r
A heap trades full ordering for speed: it guarantees only that the root is the current extreme, which is exactly enough to make insert and remove-extreme \`O(log n)\` and peek \`O(1)\`. That trade-off underlies the top-k pattern (bound a heap to size k and evict the worst), merging sorted sequences (a heap of "current heads"), and streaming statistics like a running median (two balanced heaps). Know that heapify is \`O(n)\`, know the min-heap-for-largest inversion cold, and reach for \`PriorityQueue\` the moment a problem says "kth" or "top".\r
\r
## Top Interview Questions\r
\r
### Q1. What invariant does a binary heap maintain, and how does that differ from a binary search tree?\r
\r
A min-heap guarantees only that every parent's value is less than or equal to both of its children's values — the root is therefore always the minimum — but there is no ordering guarantee between siblings or across subtrees otherwise. A BST guarantees a much stronger global invariant: every node in a left subtree is less than the node, and every node in the right subtree is greater, which holds recursively at every level. That extra structure is what lets a BST support \`O(log n)\` arbitrary search and in-order sorted traversal, capabilities a heap does not have (heap search is \`O(n)\`) — in exchange, a heap's weaker invariant makes insert and remove-extreme cheaper to maintain and lets it be stored compactly in an array with no pointers.\r
\r
### Q2. Why is building a heap from an array O(n) rather than O(n log n)?\r
\r
If you inserted \`n\` elements one at a time, each insert would cost up to \`O(log n)\` (sifting up from a leaf to the root), giving \`O(n log n)\` total. But the standard \`heapify\` procedure instead calls sift-down starting from the last non-leaf node up to the root. Because a heap is a complete binary tree, roughly half the nodes are leaves needing zero sift work, a quarter need at most one swap, an eighth need at most two, and so on — the total work sums to a series that converges to \`O(n)\`. The key insight is that sift-down's cost depends on a node's *height* (distance to the farthest leaf below it), and most nodes have small height, whereas sift-up's cost depends on *depth*, and most nodes have large depth — that asymmetry is exactly why building bottom-up beats inserting one at a time.\r
\r
### Q3. How would you find the kth largest element in an unsorted array, and what are the complexity trade-offs?\r
\r
Three approaches, in increasing order of efficiency: (1) sort the array and index from the end, \`O(n log n)\` time, \`O(1)\` extra space if sorting in place; (2) maintain a min-heap of size k, pushing every element and popping whenever the heap exceeds size k — the root ends up being the kth largest, \`O(n log k)\` time, \`O(k)\` space, which wins when \`k\` is much smaller than \`n\`; (3) Quickselect, a partition-based approach similar to quicksort that only recurses into the side containing the target index, giving \`O(n)\` average time (though \`O(n²)\` worst case) and \`O(1)\` extra space if done in place. I'd lead with the heap approach as the clean general answer and mention Quickselect as the optimal-average-case alternative if pressed for more.\r
\r
### Q4. Design a data structure that returns the median of a growing stream of numbers efficiently.\r
\r
Maintain two heaps: a max-heap holding the smaller half of the numbers seen so far, and a min-heap holding the larger half, keeping their sizes equal or differing by at most one. On each insertion, add the new number to one heap and then rebalance by moving the extreme element across if the size invariant is violated — this keeps both heaps balanced in \`O(log n)\` per insertion. The median is then \`O(1)\` to retrieve: if the heaps are equal in size, it's the average of both roots; if one has one more element, it's that heap's root. This beats re-sorting the whole dataset on every insertion (\`O(n log n)\` per number) by a huge margin.\r
\r
### Q5. Explain how a priority queue is used in Dijkstra's shortest path algorithm.\r
\r
Dijkstra repeatedly needs to select the unvisited vertex with the current smallest known distance from the source — exactly the operation a min-heap is built for. You push the source with distance 0, then repeatedly pop the minimum-distance vertex, relax (update) the distances of its neighbours, and push any improved distances back into the heap. Because the heap can contain stale entries (a vertex pushed multiple times with different distances before being finalized), you either skip an entry if it's already been finalized with a better distance, or use a decrease-key operation if the heap implementation supports it. With a binary heap, this gives \`O((V + E) log V)\` overall — the heap is what turns the naive \`O(V²)\` array-scan version of Dijkstra into something efficient on sparse graphs.\r
\r
### Q6. What's the difference between a min-heap capped at size k for "k largest" versus "k smallest" problems, and why does the inversion trip people up?\r
\r
For k **largest**, you use a **min-heap**: push every element, and whenever the heap exceeds size k, pop (evict) the current minimum — because the minimum in the heap is the "weakest" candidate among your current top-k contenders, and you want to discard the weakest, not the strongest. For k **smallest**, you invert it: a **max-heap**, evicting the current maximum whenever the heap exceeds size k. The confusion comes from an intuitive but wrong instinct to use "a max-heap for the biggest things" — but the heap here isn't storing "the answer type", it's storing "the current best k candidates", and you always want to be able to cheaply find and discard the *worst* of those candidates, which is the opposite extreme from what you're ultimately looking for.\r
\r
### Q7. Your service needs to process jobs by priority, and priorities can change after a job is enqueued (a "decrease-key" scenario). How would you handle this with a heap-based priority queue?\r
\r
Standard binary heaps don't support an efficient direct decrease-key operation — you'd have to scan to find the item first, which is \`O(n)\`. A common practical workaround is "lazy deletion": when a job's priority changes, simply push a new entry with the updated priority and mark the old entry as stale (e.g., via a version number or a "cancelled" flag in an accompanying map); when popping, skip and discard any stale entries you encounter. This keeps every heap operation at \`O(log n)\` at the cost of some extra memory for stale entries and slightly more complex bookkeeping. If decrease-key needs to be truly first-class and frequent, a specialized structure like a Fibonacci heap (used in some theoretical Dijkstra implementations) supports \`O(1)\` amortised decrease-key, though it's rarely used in practice due to high constant factors and implementation complexity.\r
\r
### Q8. How would you merge k sorted linked lists or arrays efficiently?\r
\r
Push the first element (or head node) of each of the k sequences into a min-heap, tagged with which sequence it came from. Repeatedly pop the current minimum, append it to the result, and if the sequence it came from has more elements, push that sequence's next element into the heap. Every element across all sequences is pushed and popped exactly once, and each heap operation is \`O(log k)\` since the heap never holds more than k elements at a time, giving \`O(N log k)\` total time where N is the combined length of all sequences — a clear improvement over merging the lists two at a time sequentially, which would cost \`O(N * k)\` in the worst case.\r
\r
### Q9. Why can't a heap efficiently answer "does value X exist in this collection?"\r
\r
A heap only maintains the parent-child ordering invariant (parent ≤ children for a min-heap); it says nothing about the relative order of sibling subtrees, so there's no way to eliminate half the tree the way binary search does in a sorted array or BST. To check whether X exists, you'd have to potentially inspect every node — \`O(n)\` in the worst case — because a value could legally be located almost anywhere in the tree as long as it's ≥ its ancestors. If frequent membership checks are needed alongside priority operations, you'd pair the heap with a separate hash set (or hash map from value to heap position, for more advanced "find and update" scenarios) to get \`O(1)\` average membership checks on top of the heap's ordering guarantees.\r
\r
### Q10. When would you choose a heap over simply keeping a sorted list?\r
\r
Choose a heap when you mostly need to repeatedly insert and extract the current min/max and don't need full sorted order or arbitrary search — insert and remove-extreme are \`O(log n)\` on a heap versus \`O(n)\` on a sorted array/list (because inserting into a sorted array requires shifting elements to keep it sorted). Choose a sorted structure (sorted array, \`SortedSet\`, \`SortedDictionary\`) when you need to binary-search for arbitrary values, do range queries, or iterate the full collection in order frequently — those are \`O(log n)\` or \`O(n)\` respectively on a sorted structure but effectively \`O(n)\`/\`O(n log n)\` on a heap. In short: heap for "give me the extreme, repeatedly, cheaply"; sorted structure for "give me arbitrary order-based queries".\r
\r
### Q11. How do you delete an arbitrary, known element from a heap — not just the root?\r
\r
Locate the element's index (an auxiliary hash map from value to index turns this into \`O(1)\` instead of an \`O(n)\` scan), overwrite that slot with the last element in the underlying array, shrink the array by one, and then restore the heap property from that index — sift it down if it's now larger than one of its new children (min-heap), or sift it up if it's now smaller than its new parent. Only one direction will actually move the element, so it's safe to attempt both. This is \`O(log n)\` once the index is known, and it's the operation behind features like cancelling a specific scheduled job or evicting a specific stale entry, as opposed to \`Dequeue\`, which only ever removes the current extreme.\r
`;export{e as default};
