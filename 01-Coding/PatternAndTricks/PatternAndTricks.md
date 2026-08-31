## Problem Smell → Pattern → Complexity Decision Table

| Problem "smell"                                                | Pattern to reach for              | Typical complexity |
| -------------------------------------------------------------- | --------------------------------- | ------------------ |
| "Subarray / substring with constraint (sum, length, distinct)" | Sliding window or prefix sum      | O(n)               |
| "Sorted array / search without sort"                           | Binary search                     | O(log n)           |
| "Minimize maximum / maximize minimum"                          | Binary search on answer           | O(n log(range))    |
| "Top K / Kth largest / smallest"                               | Min-heap size K                   | O(n log K)         |
| "Running median"                                               | Two heaps                         | O(n log n)         |
| "Merge K sorted things"                                        | K-way heap merge                  | O(N log K)         |
| "Shortest path, unweighted"                                    | BFS                               | O(V+E)             |
| "Shortest path, weighted non-negative"                         | Dijkstra                          | O((V+E) log V)     |
| "Detect cycle in directed graph / can finish courses"          | Topo sort (Kahn's) or 3-color DFS | O(V+E)             |
| "Group connected nodes / MST / redundant edge"                 | Union-Find (DSU)                  | O(α·E)             |
| "Prefix queries on strings / autocomplete"                     | Trie                              | O(L)               |
| "Pattern matching in string"                                   | KMP / Z-algorithm                 | O(n+m)             |
| "Duplicate substrings / rolling window hash"                   | Rabin-Karp                        | O(n) avg           |
| "Count / min ways / max value with subproblems"                | Dynamic programming               | Varies             |
| "0/1 item inclusion, weight limit"                             | 0/1 knapsack DP                   | O(nW)              |
| "Item reuse, target sum"                                       | Unbounded knapsack                | O(n·target)        |
| "All subsets / enumerate bit patterns"                         | Bitmask / backtracking            | O(2^n)             |
| "Permutations / combinations"                                  | Backtracking                      | O(n!) / O(C(n,k))  |
| "Interval scheduling / max non-overlap"                        | Greedy sort by end time           | O(n log n)         |
| "Split into parts to minimize max"                             | Greedy + binary search on answer  | O(n log sum)       |
| "Range aggregate with point updates"                           | Fenwick tree / Segment tree       | O(log n)           |
| "Multiple queries on subarrays, static"                        | Prefix sum or sparse table        | O(1) query         |
| "XOR / find the odd one out"                                   | XOR trick                         | O(n)               |
| "Count elements in range [l,r]"                                | Sorted list + binary search       | O(log n)           |
| "Nearest / farthest / bracket balance"                         | Monotonic stack                   | O(n)               |
| "Sliding window maximum"                                       | Monotonic deque                   | O(n)               |
| "String palindromes"                                           | Expand around center / DP         | O(n) / O(n²)       |
| "LIS / longest increasing subsequence"                         | Patience sort + binary search     | O(n log n)         |
| "N-Queens / Sudoku / constraint CSP"                           | Backtracking + pruning            | Exponential        |
| "Closest pair, divide problem by median"                       | Divide & conquer                  | O(n log n)         |
| "Graph edge weights 0 or 1"                                    | 0-1 BFS (deque)                   | O(V+E)             |
| "All-pairs shortest path (small V)"                            | Floyd-Warshall                    | O(V³)              |

---

## Complexity Cheat Table — C# Collections

| Collection                  | Access    | Search   | Insert (end) | Insert (mid) | Delete       | Notes                             |
| --------------------------- | --------- | -------- | ------------ | ------------ | ------------ | --------------------------------- |
| `T[]` array                 | O(1)      | O(n)     | N/A (fixed)  | N/A          | N/A          | Fixed size                        |
| `List<T>`                   | O(1)      | O(n)     | O(1) amort.  | O(n)         | O(n)         | Dynamic array; `RemoveAt` is O(n) |
| `LinkedList<T>`             | O(n)      | O(n)     | O(1)         | O(1) w/ node | O(1) w/ node | Rarely used; no index access      |
| `Dictionary<K,V>`           | O(1) avg  | O(1) avg | O(1) avg     | —            | O(1) avg     | O(n) worst (hash collision)       |
| `HashSet<T>`                | —         | O(1) avg | O(1) avg     | —            | O(1) avg     | Same as Dictionary                |
| `SortedDictionary<K,V>`     | O(log n)  | O(log n) | O(log n)     | O(log n)     | O(log n)     | Red-Black tree; ordered           |
| `SortedSet<T>`              | O(log n)  | O(log n) | O(log n)     | —            | O(log n)     | Ordered; no duplicates            |
| `Queue<T>`                  | O(1)      | O(n)     | O(1) amort.  | —            | O(1)         | Dequeue from front                |
| `Stack<T>`                  | O(1)      | O(n)     | O(1) amort.  | —            | O(1)         | LIFO                              |
| `PriorityQueue<E,P>`        | O(1) peek | —        | O(log n)     | —            | O(log n)     | Min by default; no decrease-key   |
| `ConcurrentDictionary<K,V>` | O(1) avg  | O(1) avg | O(1) avg     | —            | O(1) avg     | Thread-safe; higher constant      |

---

## 100 Curated Problems by Pattern

### Two Pointers / Sliding Window (10)

| Problem                               | LeetCode | Difficulty | Key idea                               |
| ------------------------------------- | -------- | ---------- | -------------------------------------- |
| Two Sum II                            | 167      | Easy       | Converging pointers on sorted array    |
| Container With Most Water             | 11       | Medium     | Maximize width × min-height            |
| 3Sum                                  | 15       | Medium     | Fix one, two-pointer inner loop        |
| Longest Substring Without Repeating   | 3        | Medium     | Sliding window + char frequency map    |
| Minimum Window Substring              | 76       | Hard       | Expand right; contract left when valid |
| Longest Subarray of 1s after Deletion | 1493     | Medium     | Window with at most one 0              |
| Find All Anagrams in a String         | 438      | Medium     | Fixed-size window + freq array         |
| Subarray Sum Equals K                 | 560      | Medium     | Prefix sum + hash map                  |
| Sliding Window Maximum                | 239      | Hard       | Monotonic deque                        |
| Trapping Rain Water                   | 42       | Hard       | Two pointers: max left + max right     |

### Binary Search (8)

| Problem                        | LeetCode | Difficulty | Key idea                                |
| ------------------------------ | -------- | ---------- | --------------------------------------- |
| Binary Search                  | 704      | Easy       | Template: lo<=hi                        |
| Find First and Last Position   | 34       | Medium     | Two binary searches (lower/upper bound) |
| Search in Rotated Sorted Array | 33       | Medium     | Identify sorted half                    |
| Koko Eating Bananas            | 875      | Medium     | BS on answer: speed                     |
| Split Array Largest Sum        | 410      | Hard       | BS on answer: max sum                   |
| Median of Two Sorted Arrays    | 4        | Hard       | BS on partition of smaller array        |
| Find Minimum in Rotated Array  | 153      | Medium     | Minimum in unsorted half                |
| Capacity to Ship Packages      | 1011     | Medium     | BS on answer: weight                    |

### Heaps / Priority Queues (6)

| Problem                      | LeetCode | Difficulty | Key idea                  |
| ---------------------------- | -------- | ---------- | ------------------------- |
| Kth Largest Element in Array | 215      | Medium     | Min-heap size K           |
| Top K Frequent Elements      | 347      | Medium     | Freq map + min-heap       |
| Find Median from Data Stream | 295      | Hard       | Two heaps                 |
| Merge K Sorted Lists         | 23       | Hard       | Min-heap of K heads       |
| Task Scheduler               | 621      | Medium     | Max-heap + cooldown queue |
| K Closest Points to Origin   | 973      | Medium     | Max-heap on distance      |

### Graphs (12)

| Problem                         | LeetCode | Difficulty | Key idea                         |
| ------------------------------- | -------- | ---------- | -------------------------------- |
| Number of Islands               | 200      | Medium     | DFS/BFS flood fill               |
| Clone Graph                     | 133      | Medium     | BFS + hash map old→new           |
| Course Schedule                 | 207      | Medium     | Kahn's topological sort          |
| Course Schedule II              | 210      | Medium     | Kahn's; return order             |
| Network Delay Time              | 743      | Medium     | Dijkstra SSSP                    |
| Cheapest Flights Within K Stops | 787      | Medium     | Bellman-Ford K+1 iterations      |
| Word Ladder                     | 127      | Hard       | BFS; each word = node            |
| Accounts Merge                  | 721      | Medium     | Union-Find on emails             |
| Redundant Connection            | 684      | Medium     | DSU; first false union           |
| Pacific Atlantic Water Flow     | 417      | Medium     | Multi-source BFS from coasts     |
| Rotting Oranges                 | 994      | Medium     | Multi-source BFS from all rotten |
| Reconstruct Itinerary           | 332      | Hard       | Eulerian path via DFS            |

### Dynamic Programming (20)

| Problem                          | LeetCode | Difficulty | Key idea                     |
| -------------------------------- | -------- | ---------- | ---------------------------- |
| Climbing Stairs                  | 70       | Easy       | Fibonacci DP                 |
| House Robber                     | 198      | Medium     | max(dp[i-2]+num, dp[i-1])    |
| House Robber II                  | 213      | Medium     | Run twice on circular array  |
| Coin Change                      | 322      | Medium     | Unbounded knapsack           |
| Longest Increasing Subsequence   | 300      | Medium     | O(n log n) patience sort     |
| Edit Distance                    | 72       | Hard       | 2D DP; 3 transitions         |
| Unique Paths                     | 62       | Medium     | Grid DP                      |
| Minimum Path Sum                 | 64       | Medium     | Grid DP + in-place           |
| Partition Equal Subset Sum       | 416      | Medium     | 0/1 knapsack bool DP         |
| Target Sum                       | 494      | Medium     | Subset sum or knapsack       |
| Longest Common Subsequence       | 1143     | Medium     | 2D LCS table                 |
| Word Break                       | 139      | Medium     | dp[i] = any split valid      |
| Decode Ways                      | 91       | Medium     | 1-2 digit DP with edge cases |
| Burst Balloons                   | 312      | Hard       | Interval DP, last burst      |
| Palindrome Partitioning II       | 132      | Hard       | isPalin precompute + 1D DP   |
| Russian Doll Envelopes           | 354      | Hard       | 2D LIS                       |
| Maximum Profit in Job Scheduling | 1235     | Hard       | Sort by end + BS + DP        |
| Shortest Path Visiting All Nodes | 847      | Hard       | Bitmask DP + BFS             |
| Interleaving String              | 97       | Hard       | 2D DP boolean table          |
| Distinct Subsequences            | 115      | Hard       | 2D DP counting               |

### Backtracking (8)

| Problem         | LeetCode | Difficulty | Key idea                             |
| --------------- | -------- | ---------- | ------------------------------------ |
| Subsets         | 78       | Medium     | DFS from each index                  |
| Subsets II      | 90       | Medium     | Sort + skip duplicate branches       |
| Permutations    | 46       | Medium     | `used[]` boolean array               |
| Permutations II | 47       | Medium     | Sort + skip same value at same depth |
| Combination Sum | 39       | Medium     | Reuse allowed: same i                |
| N-Queens        | 51       | Hard       | col + diag1 + diag2 tracking         |
| Sudoku Solver   | 37       | Hard       | Row/col/box validity, prune early    |
| Word Search     | 79       | Medium     | DFS + in-place marking               |

### Greedy (6)

| Problem                   | LeetCode | Difficulty | Key idea                           |
| ------------------------- | -------- | ---------- | ---------------------------------- |
| Jump Game                 | 55       | Medium     | Track farthest reachable           |
| Jump Game II              | 45       | Medium     | BFS level-max reach                |
| Non-overlapping Intervals | 435      | Medium     | Sort by end; greedy select         |
| Minimum Number of Arrows  | 452      | Medium     | Sort by end; one arrow per overlap |
| Partition Labels          | 763      | Medium     | Extend to last occurrence          |
| Gas Station               | 134      | Medium     | Total gas check + reset start      |

### Tries / String (6)

| Problem                     | LeetCode | Difficulty | Key idea                    |
| --------------------------- | -------- | ---------- | --------------------------- |
| Implement Trie              | 208      | Medium     | Standard trie with IsEnd    |
| Word Search II              | 212      | Hard       | Trie + grid DFS             |
| Design Add and Search Words | 211      | Medium     | Trie with wildcard DFS      |
| Longest Duplicate Substring | 1044     | Hard       | BS on length + rolling hash |
| Shortest Palindrome         | 214      | Hard       | KMP on s + '#' + rev(s)     |
| Palindromic Substrings      | 647      | Medium     | Expand around center        |

### Bit Manipulation / Math (8)

| Problem           | LeetCode | Difficulty | Key idea                       |
| ----------------- | -------- | ---------- | ------------------------------ |
| Single Number     | 136      | Easy       | XOR all                        |
| Single Number II  | 137      | Medium     | Bits mod 3                     |
| Single Number III | 260      | Medium     | XOR split by differing bit     |
| Missing Number    | 268      | Easy       | XOR or sum                     |
| Reverse Bits      | 190      | Easy       | Loop 32 times                  |
| Number of 1 Bits  | 191      | Easy       | `x &= x-1` loop                |
| Power of Two      | 231      | Easy       | `x & (x-1) == 0`               |
| Counting Bits     | 338      | Easy       | DP: `dp[i] = dp[i>>1] + (i&1)` |

### Divide & Conquer (4)

| Problem                             | LeetCode | Difficulty | Key idea                      |
| ----------------------------------- | -------- | ---------- | ----------------------------- |
| Kth Largest Element (Quickselect)   | 215      | Medium     | Partial partition             |
| Count of Smaller Numbers After Self | 315      | Hard       | Merge sort + count inversions |
| Median of Two Sorted Arrays         | 4        | Hard       | Binary search partition       |
| Maximum Subarray                    | 53       | Medium     | Kadane's or D&C O(n log n)    |

### Advanced Structures (4)

| Problem                   | LeetCode | Difficulty | Key idea                              |
| ------------------------- | -------- | ---------- | ------------------------------------- |
| Range Sum Query - Mutable | 307      | Medium     | Fenwick tree or segment tree          |
| Count of Range Sum        | 327      | Hard       | Merge sort / Fenwick + coord compress |
| The Skyline Problem       | 218      | Hard       | Sweep line + max-heap                 |
| LRU Cache                 | 146      | Medium     | Dict + doubly linked list             |

---

## 7-Day DSA Revision Plan

| Day | Topics                                        | Key problems                    |
| --- | --------------------------------------------- | ------------------------------- |
| 1   | Arrays, Strings, Two Pointers, Sliding Window | 3, 11, 15, 42, 76, 239          |
| 2   | Binary Search, Heaps, Sorting                 | 34, 33, 215, 295, 23, 875       |
| 3   | Linked Lists, Stack, Queue, Monotonic Stack   | 206, 146, 84, 739, 232          |
| 4   | Trees (BT traversals, BST, LCA)               | 102, 104, 236, 230, 543         |
| 5   | Graphs: BFS/DFS, Topo Sort, Dijkstra, DSU     | 200, 207, 743, 721, 994         |
| 6   | Dynamic Programming (all families)            | 70, 198, 322, 300, 72, 416, 312 |
| 7   | Backtracking, Greedy, Tries, Bit Manipulation | 78, 46, 51, 55, 208, 136        |
