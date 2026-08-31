# Patterns and Tricks

> **Core idea:** Interviews test pattern recognition, not memorisation. Almost every problem is one of ~25 patterns wearing a costume.
> **Use this file:** as the entry point when you are stuck, and as the final-week revision index.

## Contents

- [The 60-Second Triage](#the-60-second-triage)
- [Problem Smell → Pattern](#problem-smell--pattern)
- [Lookalikes: Choosing Between Similar Patterns](#lookalikes-choosing-between-similar-patterns)
- [Data Structure Selection](#data-structure-selection)
- [Optimisation Ladders](#optimisation-ladders)
- [Universal Tricks](#universal-tricks)
- [Curated Problem Set](#curated-problem-set)
- [Interview Execution Checklist](#interview-execution-checklist)
- [Revision Plans](#revision-plans)

---

## The 60-Second Triage

Run this before writing any code. It converts a vague problem into a shortlist of two or three techniques.

| Step | Question | What the answer tells you |
| ---- | -------- | ------------------------- |
| 1 | **What are the constraints?** | `n ≤ 20` → exponential is fine. `n ≤ 10⁵` → you need O(n log n). `n ≤ 10⁹` → the answer is math or binary search, not iteration. |
| 2 | **Is the input sorted, or can I sort it?** | Sorted → binary search or opposite-ends two pointers. Sorting costs O(n log n), which is free if the target is already O(n log n). |
| 3 | **Am I asked for *the* answer or *all* answers?** | One optimal value → greedy or DP. Every arrangement → backtracking. A count → DP or combinatorics. |
| 4 | **Contiguous or not?** | Contiguous (subarray/substring) → sliding window, prefix sum, Kadane. Non-contiguous (subsequence/subset) → DP or backtracking. |
| 5 | **Is there an ordering or dependency?** | Dependencies → topological sort. Hierarchy → tree. Connections → graph or union-find. |
| 6 | **Do I need extremes repeatedly?** | Running min/max → heap or monotonic structure. One-shot min/max → single scan. |
| 7 | **Does a brute force exist?** | Always state it. Then ask "what work am I repeating?" — the repeated work names the fix (see [Optimisation Ladders](#optimisation-ladders)). |

> **Key insight:** The constraint size is the single strongest hint. See the full budget table in [Complexity Analysis](../ComplexityAnalysis/ComplexityAnalysis.md).

---

## Problem Smell → Pattern

| Problem "smell" | Reach for | Typical complexity | Topic |
| --------------- | --------- | ------------------ | ----- |
| Subarray/substring with a constraint (sum, length, distinct count) | Sliding window | O(n) | [Two Pointers](../TwoPointers/TwoPointers.md) |
| Subarray sum equals / divisible by K | Prefix sum + hash map | O(n) | [Hashing](../Hashing/Hashing.md) |
| Range sum queries on a static array | Prefix sum | O(1) per query | [Arrays and Strings](../ArraysAndStrings/ArraysAndStrings.md) |
| Many range updates, read at the end | Difference array | O(1) per update | [Arrays and Strings](../ArraysAndStrings/ArraysAndStrings.md) |
| Range query **with** updates | Fenwick tree / segment tree | O(log n) | [Advanced Patterns](../AdvancedPatterns/AdvancedPatterns.md) |
| Pair summing to a target in a sorted array | Opposite-ends two pointers | O(n) | [Two Pointers](../TwoPointers/TwoPointers.md) |
| Pair summing to a target, unsorted | Complement hash map | O(n) | [Hashing](../Hashing/Hashing.md) |
| Maximum sum contiguous subarray | Kadane | O(n) | [Arrays and Strings](../ArraysAndStrings/ArraysAndStrings.md) |
| Search in a sorted array | Binary search | O(log n) | [Searching and Sorting](../SearchingAndSorting/SearchingAndSorting.md) |
| "Minimise the maximum" / "maximise the minimum" / "smallest capacity such that…" | Binary search on the answer | O(n log range) | [Searching and Sorting](../SearchingAndSorting/SearchingAndSorting.md) |
| Kth largest / smallest, top K | Heap of size K, or quickselect | O(n log K) / O(n) avg | [Heaps](../HeapsAndPriorityQueues/HeapsAndPriorityQueues.md) |
| Running median of a stream | Two heaps | O(log n) per insert | [Heaps](../HeapsAndPriorityQueues/HeapsAndPriorityQueues.md) |
| Merge K sorted sequences | Min-heap k-way merge | O(N log K) | [Heaps](../HeapsAndPriorityQueues/HeapsAndPriorityQueues.md) |
| Next/previous greater or smaller element | Monotonic stack | O(n) | [Stacks and Queues](../StacksAndQueues/StacksAndQueues.md) |
| Max/min of every sliding window | Monotonic deque | O(n) | [Stacks and Queues](../StacksAndQueues/StacksAndQueues.md) |
| Nested/balanced structure, undo, "most recent" | Stack | O(n) | [Stacks and Queues](../StacksAndQueues/StacksAndQueues.md) |
| Shortest path, unweighted | BFS | O(V+E) | [Graphs](../Graphs/Graphs.md) |
| Shortest path, non-negative weights | Dijkstra | O((V+E) log V) | [Graphs](../Graphs/Graphs.md) |
| Shortest path, negative weights or "at most K edges" | Bellman-Ford | O(V·E) | [Graphs](../Graphs/Graphs.md) |
| All-pairs shortest path, small V | Floyd-Warshall | O(V³) | [Graphs](../Graphs/Graphs.md) |
| Edge weights are only 0 or 1 | 0-1 BFS with a deque | O(V+E) | [Graphs](../Graphs/Graphs.md) |
| Spread from several starting points at once | Multi-source BFS | O(V+E) | [Graphs](../Graphs/Graphs.md) |
| Prerequisites, build order, "can this be finished?" | Topological sort | O(V+E) | [Graphs](../Graphs/Graphs.md) |
| Grouping, connectivity, "are these two connected?", redundant edge | Union-Find (DSU) | O(α(n)) per op | [Graphs](../Graphs/Graphs.md) |
| Connect everything at minimum cost | MST (Kruskal / Prim) | O(E log E) | [Graphs](../Graphs/Graphs.md) |
| Count ways / min cost / max value built from subproblems | Dynamic programming | varies | [Dynamic Programming](../DynamicProgramming/DynamicProgramming.md) |
| Pick or skip each item, capacity limit | 0/1 knapsack DP | O(nW) | [Dynamic Programming](../DynamicProgramming/DynamicProgramming.md) |
| Unlimited reuse of items, reach a target | Unbounded knapsack DP | O(n·target) | [Dynamic Programming](../DynamicProgramming/DynamicProgramming.md) |
| Two strings compared position by position | 2D DP (LCS / edit distance) | O(mn) | [Dynamic Programming](../DynamicProgramming/DynamicProgramming.md) |
| Buy/sell with states and transitions | State-machine DP | O(n·k) | [Dynamic Programming](../DynamicProgramming/DynamicProgramming.md) |
| Optimal split of an interval | Interval DP | O(n³) | [Dynamic Programming](../DynamicProgramming/DynamicProgramming.md) |
| `n ≤ 20` and subsets matter | Bitmask DP | O(2ⁿ·n) | [Dynamic Programming](../DynamicProgramming/DynamicProgramming.md) |
| Enumerate every subset / permutation / arrangement | Backtracking | O(2ⁿ) / O(n!) | [Greedy and Backtracking](../GreedyAndBacktracking/GreedyAndBacktracking.md) |
| Place items under constraints (N-Queens, Sudoku) | Backtracking + pruning | exponential | [Greedy and Backtracking](../GreedyAndBacktracking/GreedyAndBacktracking.md) |
| Maximum non-overlapping intervals | Greedy, sort by **end** | O(n log n) | [Greedy and Backtracking](../GreedyAndBacktracking/GreedyAndBacktracking.md) |
| Merge or insert intervals | Sort by **start** | O(n log n) | [Greedy and Backtracking](../GreedyAndBacktracking/GreedyAndBacktracking.md) |
| Minimum rooms / max concurrent events | Sweep line, or sort + min-heap of ends | O(n log n) | [Advanced Patterns](../AdvancedPatterns/AdvancedPatterns.md) |
| Prefix queries on words, autocomplete | Trie | O(L) | [Tries](../TriesAndStringMatching/TriesAndStringMatching.md) |
| Find a pattern inside a text | KMP / Z-algorithm | O(n+m) | [Tries](../TriesAndStringMatching/TriesAndStringMatching.md) |
| Repeated / duplicate substrings | Rabin-Karp rolling hash | O(n) avg | [Tries](../TriesAndStringMatching/TriesAndStringMatching.md) |
| Palindromic substrings | Expand around centre / Manacher | O(n²) / O(n) | [Tries](../TriesAndStringMatching/TriesAndStringMatching.md) |
| Maximum XOR pair | Binary trie | O(32n) | [Tries](../TriesAndStringMatching/TriesAndStringMatching.md) |
| "Every element appears twice except one" | XOR | O(n) | [Bit and Maths](../BitAndMaths/BitAndMaths.md) |
| Huge exponent, modular result | Fast exponentiation | O(log n) | [Bit and Maths](../BitAndMaths/BitAndMaths.md) |
| All primes up to n | Sieve of Eratosthenes | O(n log log n) | [Bit and Maths](../BitAndMaths/BitAndMaths.md) |
| Cycle in a linked list or in a functional graph | Floyd's tortoise and hare | O(n), O(1) space | [Linked Lists](../LinkedLists/LinkedLists.md) |
| Values are a permutation of `1..n` | Cyclic sort / index-as-hash | O(n), O(1) space | [Arrays and Strings](../ArraysAndStrings/ArraysAndStrings.md) |
| O(1) get **and** O(1) eviction | Hash map + doubly linked list | O(1) | [Linked Lists](../LinkedLists/LinkedLists.md) |
| Hierarchical data, "for each node consider its children" | Tree DFS (postorder) | O(n) | [Trees](../Trees/Trees.md) |
| "Level by level", shortest depth | Tree/graph BFS | O(n) | [Trees](../Trees/Trees.md) |
| Sorted output from a BST | Inorder traversal | O(n) | [Trees](../Trees/Trees.md) |

---

## Lookalikes: Choosing Between Similar Patterns

The hardest part of pattern recognition is telling near-identical patterns apart. These are the confusions that cost interviews.

### Sliding Window vs Two Pointers vs Prefix Sum vs Hash Map

| | Use when | Requires | Fails when |
| - | -------- | -------- | ---------- |
| **Sliding window** | Contiguous range, and the constraint is *monotonic* (extending the window can only make it "more invalid") | Non-negative contributions, usually | Negative numbers break monotonicity |
| **Opposite-ends two pointers** | Sorted input, and moving one end lets you discard a whole side | Sortedness or monotonicity | Unsorted input where order matters |
| **Prefix sum + hash map** | Contiguous range, arbitrary values including negatives, counting or existence | Nothing | You need the *longest*, and values allow many equal prefixes (still fine — store the *first* index) |
| **Hash map alone** | Order does not matter; you need membership, frequency, or complements | Nothing | You need contiguity or ordering |

> **Trap:** "Longest subarray summing to K" with **negative numbers** is not a sliding-window problem — it is prefix sum + hash map. Sliding window needs the invariant "growing the window increases the sum".

### Greedy vs Dynamic Programming

| | Greedy | DP |
| - | ------ | -- |
| Decision | Commit to the local best, never revisit | Explore all choices, keep the best |
| Correctness | Needs an exchange argument or proof | Correct if the recurrence is correct |
| Cost | Usually O(n log n) | Usually O(n²) or worse |
| Tell-tale | "Maximum number of non-overlapping…", "minimum number of…" with a clear ordering | "Number of ways", "minimum cost" where choices interact |
| Quick test | Try to build a counter-example in 30 seconds. If you cannot, and the ordering is obvious, greedy is likely right | If a counter-example exists, switch to DP |

### DP vs Backtracking vs Memoised Recursion

| | Use when |
| - | -------- |
| **Backtracking** | You must *output* every solution (all subsets, all permutations, all board configurations) |
| **Memoised recursion** | You need one optimal value, the state space is sparse or irregular, and recursion is natural |
| **Tabulation** | You need one optimal value, all states are reachable, and you want to space-optimise |

> **Key insight:** Backtracking that returns a *count* or a *best value* rather than the list of solutions is almost always secretly DP. Look for repeated states.

### BFS vs DFS

| | BFS | DFS |
| - | --- | --- |
| Finds | Shortest path in an **unweighted** graph | Any path; used for structure |
| Structure | Queue | Recursion or stack |
| Memory | O(width) — can be huge on wide graphs | O(depth) — can stack-overflow on deep graphs |
| Natural for | Levels, minimum steps, multi-source spread | Cycles, topological order, connected components, backtracking, tree aggregation |

### Heap vs Sorting vs Quickselect (for "top K")

| | Complexity | Use when |
| - | ---------- | -------- |
| **Sort then take K** | O(n log n) | K is close to n, or you need the K items in sorted order anyway |
| **Heap of size K** | O(n log K) | Streaming data, K ≪ n, or n is unknown |
| **Quickselect** | O(n) average, O(n²) worst | Offline array, only the Kth element (or an unordered top-K) is needed |

> **Trap:** For the K **largest** elements, use a **min**-heap of size K (you evict the smallest). For the K **smallest**, use a max-heap. Getting this backwards is the most common heap bug.

### Monotonic Stack vs Heap

| | Monotonic stack | Heap |
| - | --------------- | ---- |
| Answers | "Next/previous greater or smaller" — a *positional* relationship | "Current min/max of a set" — an *order-statistic* |
| Cost | O(n) total | O(n log n) total |
| Tell-tale | Each element's answer is a nearby element | You repeatedly extract extremes and insert new items |

### Union-Find vs BFS/DFS for Connectivity

| | Use when |
| - | -------- |
| **BFS/DFS** | The graph is fixed, and you traverse once (count components, flood fill) |
| **Union-Find** | Edges arrive incrementally, you answer "connected?" queries online, or you need MST via Kruskal |

### Recursion on Trees: Top-Down vs Bottom-Up

| | Top-down | Bottom-up |
| - | -------- | --------- |
| Direction | Pass state **down** as parameters | Return state **up** as return values |
| Shape | `void Dfs(node, accumulated)` | `T Dfs(node) { var l = Dfs(left); ... }` |
| Use for | Path-from-root problems, bounds checking (validate BST), path sums | Height, diameter, subtree aggregates, tree DP |

---

## Data Structure Selection

| You need | Use | Why |
| -------- | --- | --- |
| O(1) lookup by key | `Dictionary<K,V>` | Hash table |
| O(1) membership | `HashSet<T>` | Hash table |
| Sorted iteration + O(log n) ops | `SortedSet<T>` / `SortedDictionary<K,V>` | Red-black tree |
| Predecessor/successor query | `SortedSet<T>.GetViewBetween` | C# has no `floorKey`/`ceilingKey` |
| Repeated min/max extraction | `PriorityQueue<E,P>` | Binary heap |
| LIFO / nesting | `Stack<T>` | |
| FIFO / level order | `Queue<T>` | |
| Both ends O(1) | `LinkedList<T>` | .NET has no `Deque<T>` |
| Prefix/word queries | Trie | |
| Range aggregate, static | Prefix sum / sparse table | |
| Range aggregate, dynamic | Fenwick / segment tree | |
| Incremental connectivity | Union-Find | |
| O(1) get + O(1) evict | Hash map + doubly linked list | |

Full complexity table and C# API details: [C# Cheat Sheet](../CSharp/CSharp.md).

---

## Optimisation Ladders

When you have a brute force and need to improve it, the repeated work tells you the fix.

| Brute force | Repeated work | Fix | Result |
| ----------- | ------------- | --- | ------ |
| O(n²) all pairs | Re-scanning for a complement | Hash map of seen values | O(n) |
| O(n²) all pairs on sorted data | Re-scanning a side you could discard | Opposite-ends two pointers | O(n) |
| O(n²) all subarrays | Recomputing sums | Prefix sum / rolling sum | O(n) |
| O(n·k) all windows | Recomputing the window | Sliding window (add new, drop old) | O(n) |
| O(n²) "next greater" for each element | Re-scanning forward | Monotonic stack | O(n) |
| O(n log n) full sort for K items | Sorting things you throw away | Heap of size K / quickselect | O(n log K) / O(n) |
| Exponential recursion | Recomputing identical subproblems | Memoisation → tabulation | Polynomial |
| O(n) linear scan on sorted data | Checking elements you could skip | Binary search | O(log n) |
| Testing every candidate answer | Answers are monotonic in feasibility | Binary search on the answer | O(n log range) |
| O(n) per query, many queries | Rebuilding the aggregate | Precompute prefix / segment tree | O(1) / O(log n) |
| O(n) extra space | Storing what the input could encode | In-place marking (sign, swap, index-as-hash) | O(1) space |

---

## Universal Tricks

| Trick | Statement | Where it appears |
| ----- | --------- | ---------------- |
| **At-most-K** | `exactly(K) = atMost(K) − atMost(K−1)` | Subarrays with K distinct integers |
| **Count windows** | A valid window `[lo..hi]` contributes `hi − lo + 1` subarrays ending at `hi` | Counting subarray problems |
| **Sentinel node** | A dummy head removes every "is this the first node?" branch | Linked lists |
| **Sentinel value** | Append a `0` height / `∞` element to force the final flush | Monotonic stack, histogram |
| **Sort by the right key** | End time → max non-overlap. Start time → merge. | Intervals |
| **Reverse the problem** | Min cost to remove = total − max cost to keep | Many optimisation problems |
| **Search the answer, not the input** | Binary search over the answer range with a feasibility predicate | Koko, Split Array, ship capacity |
| **Two passes** | Left-to-right, then right-to-left, combine | Product Except Self, Trapping Rain Water, Candy |
| **Index as hash** | Values in `1..n` mean index `i` should hold `i+1` | Missing/duplicate number problems |
| **Sign as a flag** | Negate `nums[abs(x)-1]` to mark "seen" without extra space | Find All Duplicates |
| **XOR cancellation** | `a ^ a = 0`, so pairs vanish | Single Number family |
| **Prefix XOR** | `xor(l..r) = pre[r] ^ pre[l−1]` | Subarray XOR problems |
| **Complement** | Store what you *need*, not what you *have* | Two Sum |
| **Canonical key** | Map each item to a normal form and group | Group Anagrams |
| **Meet in the middle** | Split `2ⁿ` into two `2^(n/2)` halves | Subset sum, `n ≤ 40` |
| **Coordinate compression** | Replace huge values by their sorted rank | Fenwick on sparse values, sweep line |
| **Lazy deletion** | Push duplicates, skip stale entries on pop | Dijkstra with `PriorityQueue` (no decrease-key) |
| **Difference array** | `d[l] += v; d[r+1] -= v;` then prefix-sum | Many range updates, one read |
| **Binary lifting** | Precompute `2^k`-th ancestors | LCA in O(log n) |
| **Monotonic invariant** | Maintain the stack/deque so the answer is always at one end | Monotonic stack/deque |

---

## Curated Problem Set

Each topic folder has a `Problems.md` with full worked solutions. This table is the study order and the coverage map.

| Order | Topic | Theory | Problems | Focus |
| ----- | ----- | ------ | -------- | ----- |
| 0 | Complexity Analysis | [Notes](../ComplexityAnalysis/ComplexityAnalysis.md) | — | Budgeting, master theorem, amortised |
| 1 | Arrays and Strings | [Notes](../ArraysAndStrings/ArraysAndStrings.md) | [Problems](../ArraysAndStrings/Problems.md) | Prefix sum, Kadane, in-place tricks, matrix |
| 2 | Two Pointers and Sliding Window | [Notes](../TwoPointers/TwoPointers.md) | [Problems](../TwoPointers/Problems.md) | Converging pointers, window templates |
| 3 | Hashing | [Notes](../Hashing/Hashing.md) | [Problems](../Hashing/Problems.md) | Frequency maps, complements, prefix+map |
| 4 | Searching and Sorting | [Notes](../SearchingAndSorting/SearchingAndSorting.md) | [Problems](../SearchingAndSorting/Problems.md) | Binary search on the answer, quickselect |
| 5 | Linked Lists | [Notes](../LinkedLists/LinkedLists.md) | [Problems](../LinkedLists/Problems.md) | Reversal, fast/slow, LRU |
| 6 | Stacks and Queues | [Notes](../StacksAndQueues/StacksAndQueues.md) | [Problems](../StacksAndQueues/Problems.md) | Monotonic stack and deque |
| 7 | Trees | [Notes](../Trees/Trees.md) | [Problems](../Trees/Problems.md) | Traversals, BST, tree DP |
| 8 | Heaps and Priority Queues | [Notes](../HeapsAndPriorityQueues/HeapsAndPriorityQueues.md) | [Problems](../HeapsAndPriorityQueues/Problems.md) | Top-K, two heaps, k-way merge |
| 9 | Graphs | [Notes](../Graphs/Graphs.md) | [Problems](../Graphs/Problems.md) | BFS/DFS, topo sort, Dijkstra, DSU |
| 10 | Dynamic Programming | [Notes](../DynamicProgramming/DynamicProgramming.md) | [Problems](../DynamicProgramming/Problems.md) | State design, all families |
| 11 | Greedy and Backtracking | [Notes](../GreedyAndBacktracking/GreedyAndBacktracking.md) | [Problems](../GreedyAndBacktracking/Problems.md) | Intervals, exhaustive search |
| 12 | Tries and String Matching | [Notes](../TriesAndStringMatching/TriesAndStringMatching.md) | [Problems](../TriesAndStringMatching/Problems.md) | Trie, KMP, palindromes |
| 13 | Bit and Maths | [Notes](../BitAndMaths/BitAndMaths.md) | [Problems](../BitAndMaths/Problems.md) | XOR, modular arithmetic, sieve |
| 14 | Advanced Patterns | [Notes](../AdvancedPatterns/AdvancedPatterns.md) | [Problems](../AdvancedPatterns/Problems.md) | Fenwick, segment tree, sweep line |

### The Core 40

If you only have time for forty problems, do these. They cover every pattern in the smell table at least once.

| # | Problem | LC | Pattern |
| - | ------- | -- | ------- |
| 1 | Two Sum | 1 | Complement hash map |
| 2 | Best Time to Buy and Sell Stock | 121 | Running min |
| 3 | Product of Array Except Self | 238 | Prefix + suffix passes |
| 4 | Maximum Subarray | 53 | Kadane |
| 5 | Merge Intervals | 56 | Sort by start |
| 6 | Non-overlapping Intervals | 435 | Sort by end (greedy) |
| 7 | Longest Substring Without Repeating Characters | 3 | Variable window |
| 8 | Minimum Window Substring | 76 | Shortest valid window |
| 9 | Trapping Rain Water | 42 | Two pointers / two passes |
| 10 | 3Sum | 15 | Sort + fix one + two pointers |
| 11 | Group Anagrams | 49 | Canonical key |
| 12 | Longest Consecutive Sequence | 128 | Hash set |
| 13 | Subarray Sum Equals K | 560 | Prefix sum + hash map |
| 14 | Binary Search | 704 | Template |
| 15 | Search in Rotated Sorted Array | 33 | Identify the sorted half |
| 16 | Koko Eating Bananas | 875 | Binary search on the answer |
| 17 | Median of Two Sorted Arrays | 4 | Binary search on partition |
| 18 | Reverse Linked List | 206 | Pointer reversal |
| 19 | Linked List Cycle II | 142 | Floyd's algorithm |
| 20 | LRU Cache | 146 | Hash map + doubly linked list |
| 21 | Valid Parentheses | 20 | Stack |
| 22 | Daily Temperatures | 739 | Monotonic stack |
| 23 | Largest Rectangle in Histogram | 84 | Monotonic stack + sentinel |
| 24 | Sliding Window Maximum | 239 | Monotonic deque |
| 25 | Binary Tree Level Order Traversal | 102 | BFS with level snapshot |
| 26 | Lowest Common Ancestor of a Binary Tree | 236 | Bottom-up recursion |
| 27 | Validate Binary Search Tree | 98 | Top-down bounds |
| 28 | Binary Tree Maximum Path Sum | 124 | Through-node vs returned-up |
| 29 | Serialize and Deserialize Binary Tree | 297 | Preorder with null markers |
| 30 | Kth Largest Element in an Array | 215 | Heap vs quickselect |
| 31 | Find Median from Data Stream | 295 | Two heaps |
| 32 | Merge k Sorted Lists | 23 | K-way merge |
| 33 | Number of Islands | 200 | Grid flood fill |
| 34 | Course Schedule | 207 | Topological sort |
| 35 | Network Delay Time | 743 | Dijkstra |
| 36 | Accounts Merge | 721 | Union-Find |
| 37 | Coin Change | 322 | Unbounded knapsack |
| 38 | Longest Increasing Subsequence | 300 | Patience sorting |
| 39 | Edit Distance | 72 | 2D string DP |
| 40 | Word Search II | 212 | Trie + grid DFS |

---

## Interview Execution Checklist

The pattern is only half the score. This is the other half.

| Phase | Do | Say |
| ----- | -- | --- |
| **1. Clarify** (2 min) | Restate the problem. Ask about input size, value ranges, duplicates, empty input, sortedness, and what to return on failure. | "Can the array be empty? Can values be negative? Is it sorted?" |
| **2. Example** (2 min) | Write a small concrete example and the expected output. Add one edge case. | "Let me work through `[3,1,4,1,5]` with target 6." |
| **3. Brute force** (2 min) | State it and its complexity. Never skip this — it anchors the conversation. | "The naive approach checks all pairs: O(n²) time, O(1) space." |
| **4. Optimise** (5 min) | Name the repeated work, then the pattern that removes it. Get agreement before coding. | "I'm recomputing the sum for each window. A rolling sum makes it O(n)." |
| **5. Code** (10 min) | Clean names, handle edge cases first, keep helpers small. Talk while you type. | "I'll guard the empty case, then run the main loop." |
| **6. Test** (5 min) | Dry-run your own code on the example, then the edge cases: empty, single element, all equal, all negative, max size. | "Tracing `[1,2]`: lo=0, hi=1, sum=3…" |
| **7. Complexity** (1 min) | State time and space, including recursion stack. Offer the trade-off. | "O(n log K) time, O(K) space. I could do O(n) average with quickselect but it mutates the input." |

**Before you say "done", check:**

- Empty / null input
- Single element
- All elements identical
- Already sorted, and reverse sorted
- Negative numbers and zero
- Integer overflow — use `long` when values are multiplied or summed at scale
- `int.MinValue` / `int.MaxValue` boundaries
- Recursion depth for n = 10⁵
- Did you actually return the value, or just compute it?

---

## Revision Plans

### 7-Day Sprint

| Day | Topics | Anchor problems |
| --- | ------ | --------------- |
| 1 | Arrays, Strings, Two Pointers, Sliding Window | 53, 238, 3, 76, 42, 15 |
| 2 | Hashing, Searching, Sorting, Binary Search on Answer | 49, 128, 560, 33, 875, 4 |
| 3 | Linked Lists, Stacks, Queues, Monotonic Structures | 206, 142, 146, 20, 739, 84, 239 |
| 4 | Trees and BST | 102, 236, 98, 124, 297, 230 |
| 5 | Graphs: traversal, topo sort, shortest path, DSU | 200, 207, 743, 721, 994, 127 |
| 6 | Dynamic Programming, all families | 322, 300, 72, 416, 312, 121–714 |
| 7 | Greedy, Backtracking, Tries, Bit Manipulation | 435, 55, 78, 46, 51, 208, 136 |

### 30-Day Plan

| Week | Focus | Goal |
| ---- | ----- | ---- |
| 1 | Topics 1–4 (arrays, two pointers, hashing, searching) | Fluent with windows, prefix sums, and binary search on the answer |
| 2 | Topics 5–9 (lists, stacks, trees, heaps, graphs) | Write BFS/DFS/Dijkstra/DSU from memory |
| 3 | Topics 10–11 (DP, greedy, backtracking) | Derive a DP state unaided; prove or disprove a greedy in under a minute |
| 4 | Topics 12–14 + full mock interviews | Timed 45-minute mocks, out loud, from the Core 40 |

### Day Before

Read only these, in order:

1. [The 60-Second Triage](#the-60-second-triage)
2. [Problem Smell → Pattern](#problem-smell--pattern)
3. [Lookalikes](#lookalikes-choosing-between-similar-patterns)
4. [Universal Tricks](#universal-tricks)
5. [Interview Execution Checklist](#interview-execution-checklist)
6. [C# Cheat Sheet](../CSharp/CSharp.md) — reference tables at the end
