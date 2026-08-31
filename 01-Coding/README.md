# Coding — Data Structures and Algorithms

Interview-preparation notes for coding rounds. Every topic folder contains a **theory file** (mental models, templates, pattern recognition, pitfalls) and a **`Problems.md`** (worked problems, approaches ordered worst → best, with one optimal C# implementation each).

Code is **C#**. See the [C# Cheat Sheet](CSharp/CSharp.md) for the language and BCL reference.

---

## Start Here

| If you… | Go to |
| ------- | ----- |
| are stuck on a problem and need to identify the pattern | [Patterns and Tricks → Problem Smell table](PatternAndTricks/PatternAndTricks.md#problem-smell--pattern) |
| keep confusing two similar techniques | [Patterns and Tricks → Lookalikes](PatternAndTricks/PatternAndTricks.md#lookalikes-choosing-between-similar-patterns) |
| need to know what complexity is expected from the constraints | [Complexity Analysis → Constraint budget](ComplexityAnalysis/ComplexityAnalysis.md#complexity-reference) |
| forgot a C# API | [C# Cheat Sheet](CSharp/CSharp.md) |
| are revising the day before | [Patterns and Tricks → Day Before](PatternAndTricks/PatternAndTricks.md#day-before) |
| want a study plan | [Patterns and Tricks → Revision Plans](PatternAndTricks/PatternAndTricks.md#revision-plans) |

---

## Contents

Study in this order. Later topics assume the earlier ones.

| # | Topic | Theory | Problems | Covers |
| - | ----- | ------ | -------- | ------ |
| 0 | Complexity Analysis | [Notes](ComplexityAnalysis/ComplexityAnalysis.md) | — | Big-O vs Θ vs Ω, master theorem, amortised analysis, constraint → algorithm budget |
| 1 | Arrays and Strings | [Notes](ArraysAndStrings/ArraysAndStrings.md) | [Problems](ArraysAndStrings/Problems.md) | Prefix sum, difference array, Kadane, Dutch flag, in-place index marking, matrix ops, string basics |
| 2 | Two Pointers and Sliding Window | [Notes](TwoPointers/TwoPointers.md) | [Problems](TwoPointers/Problems.md) | Converging pointers, fast/slow, fixed and variable windows, at-most-K trick |
| 3 | Hashing | [Notes](Hashing/Hashing.md) | [Problems](Hashing/Problems.md) | Hash internals, `GetHashCode` contract, frequency maps, complements, prefix sum + map |
| 4 | Searching and Sorting | [Notes](SearchingAndSorting/SearchingAndSorting.md) | [Problems](SearchingAndSorting/Problems.md) | Binary search templates, binary search on the answer, all sorts, quickselect, cyclic sort |
| 5 | Linked Lists | [Notes](LinkedLists/LinkedLists.md) | [Problems](LinkedLists/Problems.md) | Sentinels, reversal, Floyd's cycle detection, merging, LRU and LFU caches |
| 6 | Stacks and Queues | [Notes](StacksAndQueues/StacksAndQueues.md) | [Problems](StacksAndQueues/Problems.md) | Monotonic stack and deque, bracket matching, expression evaluation, ring buffer |
| 7 | Trees | [Notes](Trees/Trees.md) | [Problems](Trees/Problems.md) | Traversals incl. Morris, BST, LCA, tree DP, serialisation, AVL / Red-Black / B-Tree |
| 8 | Heaps and Priority Queues | [Notes](HeapsAndPriorityQueues/HeapsAndPriorityQueues.md) | [Problems](HeapsAndPriorityQueues/Problems.md) | Heap internals, `PriorityQueue<E,P>`, top-K, two heaps, k-way merge |
| 9 | Graphs | [Notes](Graphs/Graphs.md) | [Problems](Graphs/Problems.md) | BFS/DFS, grids, topological sort, Dijkstra, Bellman-Ford, MST, union-find, SCC |
| 10 | Dynamic Programming | [Notes](DynamicProgramming/DynamicProgramming.md) | [Problems](DynamicProgramming/Problems.md) | State design, knapsack, LIS/LCS, grid, interval, bitmask, tree and state-machine DP |
| 11 | Greedy and Backtracking | [Notes](GreedyAndBacktracking/GreedyAndBacktracking.md) | [Problems](GreedyAndBacktracking/Problems.md) | Exchange arguments, interval sorting, backtracking shapes, divide and conquer |
| 12 | Tries and String Matching | [Notes](TriesAndStringMatching/TriesAndStringMatching.md) | [Problems](TriesAndStringMatching/Problems.md) | Trie, binary trie, KMP, Z-algorithm, Rabin-Karp, Manacher, palindromes |
| 13 | Bit Manipulation and Maths | [Notes](BitAndMaths/BitAndMaths.md) | [Problems](BitAndMaths/Problems.md) | Bit idioms, XOR family, bitmask sets, modular arithmetic, sieve, combinatorics |
| 14 | Advanced Patterns | [Notes](AdvancedPatterns/AdvancedPatterns.md) | [Problems](AdvancedPatterns/Problems.md) | Segment tree, Fenwick, sparse table, sweep line, coordinate compression |
| — | **Patterns and Tricks** | [Hub](PatternAndTricks/PatternAndTricks.md) | — | Pattern recognition, lookalike disambiguation, Core 40, revision plans |
| — | **C# Cheat Sheet** | [Reference](CSharp/CSharp.md) | — | Collections, LINQ, strings, comparers, modern syntax, gotchas |

---

## How the Notes Are Organised

Every theory file follows the same shape, so you always know where to look:

| Section | What it gives you |
| ------- | ----------------- |
| Header callout | Core idea, recognition triggers, headline complexity |
| **Mental Model** | The invariant — enough to re-derive the code instead of memorising it |
| **Complexity Reference** | Every operation's cost in one table |
| **Templates** | The code skeletons you would actually type in an interview |
| **Pattern Recognition** | "Problem says X → reach for Y" |
| **Variants and Differences** | Tables that disambiguate lookalike techniques |
| **Pitfalls** | Specific bugs, not general advice |
| **Practice** | Link into that topic's `Problems.md` |

Every `Problems.md` follows the same shape:

- An index table (problem, LeetCode number, pattern, difficulty)
- Problems grouped under `###` pattern headings
- Per problem: statement → example → approaches ordered **worst → best** with `NAME | O(time) | O(space)` → one optimal C# implementation → a `> **Key insight:**` takeaway

Each concept has exactly **one owner file**. Other files link to it rather than repeating it, so there is a single source of truth to revise from.

---

## Core Vocabulary

**Data structure** — a way of organising data so it can be accessed and modified efficiently.

- *Linear:* array, linked list, stack, queue
- *Non-linear:* tree, graph, heap, trie

**Abstract data type (ADT)** — a model defined by its *behaviour*, independent of implementation. List, Stack, Queue, Deque, Priority Queue, Map, Set. A `Stack` is an ADT; an array-backed `Stack<T>` is one implementation of it.

**Algorithm** — a finite sequence of well-defined steps. Required properties: input, output, definiteness, finiteness, effectiveness.

---

## Data Structure Reference

Average-case costs. `*` = when balanced. `†` = given a reference to the node. Full C# API details and the .NET-specific complexity table are in the [C# Cheat Sheet](CSharp/CSharp.md).

| Data Structure | Type | Access | Search | Insert | Delete | Ordered? | Duplicates? | Typical Use |
| -------------- | ---- | ------ | ------ | ------ | ------ | -------- | ----------- | ----------- |
| **Array `T[]`** | Linear | **O(1)** | O(n) | — | — | Index order | ✅ | Fixed-size data, fast indexing |
| **List `List<T>`** | Linear | **O(1)** | O(n) | **O(1)** amortised at end | O(n) | Insertion order | ✅ | General-purpose collection |
| **Linked List** | Linear | O(n) | O(n) | **O(1)**† | **O(1)**† | Node order | ✅ | O(1) splice; LRU cache |
| **Stack `Stack<T>`** | Linear | **O(1)** top | O(n) | **O(1)** | **O(1)** | LIFO | ✅ | DFS, undo, monotonic stack |
| **Queue `Queue<T>`** | Linear | **O(1)** front | O(n) | **O(1)** | **O(1)** | FIFO | ✅ | BFS, scheduling |
| **Deque** | Linear | **O(1)** ends | O(n) | **O(1)** | **O(1)** | Both ends | ✅ | Sliding window maximum |
| **`HashSet<T>`** | Hash | — | **O(1)** | **O(1)** | **O(1)** | ❌ | **❌** | Membership, dedup |
| **`Dictionary<K,V>`** | Hash | **O(1)** | **O(1)** | **O(1)** | **O(1)** | ❌ | Keys ❌ | Key-value lookup, frequency maps |
| **`SortedSet<T>`** | Tree | O(log n) | **O(log n)** | **O(log n)** | **O(log n)** | **✅ sorted** | **❌** | Ordered set, range views |
| **`SortedDictionary<K,V>`** | Tree | O(log n) | **O(log n)** | **O(log n)** | **O(log n)** | **✅ by key** | Keys ❌ | Ordered map |
| **Binary Tree** | Hierarchical | O(n) | O(n) | O(n) | O(n) | — | Depends | Hierarchical data |
| **BST** | Tree | O(log n)\* | O(log n)\* | O(log n)\* | O(log n)\* | **✅ inorder** | Usually ❌ | Ordered search |
| **Heap / `PriorityQueue`** | Tree | **O(1)** min/max | O(n) | **O(log n)** | **O(log n)** | Partially | ✅ | Top-K, scheduling |
| **Graph** | Non-linear | — | O(V+E) | O(1) | O(E) | ❌ | — | Networks, dependencies |
| **Trie** | Tree | O(L) | **O(L)** | **O(L)** | O(L) | Lexicographic | Depends | Prefix search, autocomplete |
| **Fenwick / Segment Tree** | Tree | — | **O(log n)** | **O(log n)** | — | Index order | ✅ | Range queries with updates |
| **Union-Find** | Forest | — | **O(α(n))** | **O(α(n))** | — | ❌ | — | Incremental connectivity |
