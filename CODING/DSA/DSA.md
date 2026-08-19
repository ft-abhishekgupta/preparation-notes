# Data Structures and Algorithms (DSA)

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
