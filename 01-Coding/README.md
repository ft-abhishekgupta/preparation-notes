# Coding — Data Structures and Algorithms

## Contents

| # | Topic | Notes |
| - | ----- | ----- |
| 1 | [Complexity Analysis](ComplexityAnalysis/ComplexityAnalysis.md) | Big O, best/average/worst case, time and space complexity |
| 2 | [Arrays and Strings](ArraysAndStrings/ArraysAndStrings.md) | Traversal, two pointers, sliding window, prefix sums |
| 3 | [Hashing](Hashing/Hashing.md) | Hash tables, sets, frequency maps, collision handling |
| 4 | [Linked Lists](LinkedLists/LinkedLists.md) | Singly, doubly and circular lists |
| 5 | [Stacks and Queues](StacksAndQueues/StacksAndQueues.md) | LIFO, FIFO, deques, monotonic structures |
| 6 | [Trees and Graphs](TreesAndGraphs/TreesAndGraphs.md) | Binary trees, BST, AVL, heaps, traversals, graph algorithms |
| 7 | [Searching and Sorting](SearchingAndSorting/SearchingAndSorting.md) | Binary search and the classic sorting algorithms |
| 8 | [Dynamic Programming](DynamicProgramming/DynamicProgramming.md) | Memoisation, tabulation, classic DP patterns |
| 9 | [Greedy and Backtracking](GreedyAndBacktracking/GreedyAndBacktracking.md) | Greedy choice, exhaustive search with pruning |
| 10 | [Advanced Patterns](AdvancedPatterns/AdvancedPatterns.md) | Tries, union find, bit manipulation, intervals |
| 11 | [Problems](Problems/Problems.md) | Worked interview problems |
| — | [C# Cheat Sheet](CSharp/CSharp.md) | Language reference for coding rounds |

## Overview

**Data Structure** is a way of organizing and storing data in a computer so that it can be accessed and modified efficiently.

Types of Data Structures:

- Linear Data Structures: Arrays, Linked Lists, Stacks, Queues
- Non-linear Data Structures: Trees, Graphs, Heaps

**Abstract Data Types (ADT)**: is a mathematical model for certain data structures that defines the behavior of the data structure independently of its implementation.
Examples of ADTs: List, Stack, Queue, Deque, Priority Queue, Map, Set

**Algorithms** are finite sequences of well-defined steps for solving problems.

Properties of Algorithms:

- Input
- Output
- Finiteness
- Definiteness

## Data Structure Reference

| Data Structure                   | Type         | Size    | Access           | Search       | Insert        | Delete       | Ordered?               | Duplicates? | Typical Use                     |
| -------------------------------- | ------------ | ------- | ---------------- | ------------ | ------------- | ------------ | ---------------------- | ----------- | ------------------------------- |
| **Array `T[]`**                  | Linear       | Fixed   | **O(1)**         | O(n)         | O(n)          | O(n)         | Index order            | ✅          | Fixed-size data, fast indexing  |
| **List `List<T>`**               | Linear       | Dynamic | **O(1)**         | O(n)         | O(1)\* / O(n) | O(n)         | Insertion order        | ✅          | General-purpose collection      |
| **Linked List**                  | Linear       | Dynamic | O(n)             | O(n)         | **O(1)**†     | **O(1)**†    | Node order             | ✅          | Frequent insertion/deletion     |
| **Stack `Stack<T>`**             | Linear       | Dynamic | **O(1)** top     | O(n)         | **O(1)**      | **O(1)**     | LIFO                   | ✅          | DFS, undo, recursion            |
| **Queue `Queue<T>`**             | Linear       | Dynamic | **O(1)** ends    | O(n)         | **O(1)**      | **O(1)**     | FIFO                   | ✅          | BFS, scheduling                 |
| **Deque**                        | Linear       | Dynamic | O(1) ends        | O(n)         | **O(1)**      | **O(1)**     | Both ends              | ✅          | Sliding window, monotonic queue |
| **HashSet `HashSet<T>`**         | Hash         | Dynamic | —                | **O(1)** avg | **O(1)** avg  | **O(1)** avg | ❌                     | **❌**      | Unique elements, membership     |
| **Dictionary `Dictionary<K,V>`** | Hash         | Dynamic | **O(1)** avg     | **O(1)** avg | **O(1)** avg  | **O(1)** avg | ❌                     | Keys ❌     | Key-value lookup                |
| **SortedSet**                    | Tree         | Dynamic | O(log n)         | **O(log n)** | **O(log n)**  | **O(log n)** | **✅ Sorted**          | **❌**      | Unique sorted values            |
| **SortedDictionary**             | Tree         | Dynamic | O(log n)         | **O(log n)** | **O(log n)**  | **O(log n)** | **✅ Sorted by key**   | Keys ❌     | Sorted key-value data           |
| **Binary Tree**                  | Hierarchical | Dynamic | O(n)             | O(n)         | Depends       | Depends      | —                      | Depends     | Hierarchical data               |
| **BST**                          | Tree         | Dynamic | O(log n)\*       | O(log n)\*   | O(log n)\*    | O(log n)\*   | **✅ In-order sorted** | Depends     | Ordered searching               |
| **Heap / Priority Queue**        | Tree         | Dynamic | **O(1) min/max** | O(n)         | **O(log n)**  | **O(log n)** | Partially              | Depends     | Priority scheduling, top K      |
| **Graph**                        | Non-linear   | Dynamic | —                | O(V+E)       | Depends       | Depends      | ❌                     | —           | Networks, paths, dependencies   |
| **Trie**                         | Tree         | Dynamic | O(L)             | **O(L)**     | **O(L)**      | O(L)         | Lexicographic\*        | Depends     | Prefix/string search            |
