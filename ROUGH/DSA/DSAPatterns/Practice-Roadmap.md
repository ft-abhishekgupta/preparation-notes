# Practice Roadmap

> **Scope** — A curated, pattern-grouped problem set for the coding round, tiered by priority. Each section links back to the topic note that teaches the underlying technique. Use this as the *drilling* companion to the pattern notes; use [DSAPatterns](DSAPatterns.md) to decide *which* technique a new problem needs.

---

## 1. How to Use This

**Tiers** — work strictly outward. Do not start a tier until the previous one is solid.

| Tier | Count | Meaning | When to stop |
| --- | --- | --- | --- |
| **Core** | 75 | The canonical minimum set. Every one is a distinct, high-frequency pattern. | You can re-derive the optimal approach from scratch in under 5 minutes. |
| Extended | 75 | Second pass over the same patterns with harder variants and edge cases. | You recognise the pattern from the problem statement alone. |

> **Interview Tip** — For a senior loop, coverage of the **Core** tier plus fluency at *explaining trade-offs* beats volume. Interviewers probe your reasoning about alternatives and complexity far more than the number of problems you have seen. This set is deliberately capped: breadth past this point has sharply diminishing returns versus mock interviews and system design.

### Practising for a senior signal

For each problem, do not stop at a passing solution. Complete this loop:

1. **Restate + clarify** — input ranges, duplicates, empty input, mutability of the input, expected output on no-answer.
2. **Narrate brute force** — state it, estimate cost, and name exactly why it breaks at the input limits.
3. **Name the bottleneck** — "the inner scan is O(n); a hash map makes it O(1)". Tie every optimisation to this bottleneck.
4. **Defend the optimal** — code cleanly, state the invariant, and explain why no cheaper asymptotic path exists.
5. **Dry-run the edge cases** — empty, single element, all-duplicates, overflow, already-sorted.
6. **State final complexity** — time and space, amortised vs worst case, and the memory growth that matters at scale.
7. **Anticipate scale-up** — stream input, out-of-memory data, concurrent callers, distributed ownership, hot keys.

> **Remember** — Step 7 is where senior candidates separate. Standard follow-ups: streams → heaps/reservoir sampling; too-large-for-memory → external sort/sharding by hash; concurrent/distributed → snapshots, partitioned locks, idempotency, hot-key mitigation.

### Spacing

- **First pass** — solve with notes open. Goal is pattern acquisition, not recall.
- **Second pass (+3 days)** — solve without notes. Anything you cannot start within 5 minutes goes back to the pattern note.
- **Third pass (+2 weeks)** — explain the solution out loud without writing code. If you cannot narrate it, you do not own it.

---

## 2. Problem Set by Pattern

Legend: **Core** = the 75-problem canonical set · Extended = harder variants of the same patterns. Total: 150 problems.

### 2.1 Arrays & Hashing

**Study first:** [Arrays and Strings](../Arrays%20and%20Strings/Arrays%20and%20Strings.md) · [Hashing](../Hashing/Hashing.md)
**Tests:** Hashable state, frequency maps, prefix aggregates, and when O(n) memory beats sorting.

*9 problems — 8 Core, 1 Extended.*

| ✓ | Difficulty | Problem | Tier |
| --- | --- | --- | --- |
| [ ] | Easy | Contains Duplicate | **Core** |
| [ ] | Easy | Valid Anagram | **Core** |
| [ ] | Easy | Two Sum | **Core** |
| [ ] | Medium | Group Anagrams | **Core** |
| [ ] | Medium | Top K Frequent Elements | **Core** |
| [ ] | Medium | Product of Array Except Self | **Core** |
| [ ] | Medium | Encode and Decode Strings | **Core** |
| [ ] | Medium | Longest Consecutive Sequence | **Core** |
| [ ] | Medium | Valid Sudoku | Extended |

### 2.2 Two Pointers

**Study first:** [Arrays and Strings](../Arrays%20and%20Strings/Arrays%20and%20Strings.md)
**Tests:** Maintaining ordered endpoints/invariants while proving you never skip a valid answer.

*5 problems — 3 Core, 2 Extended.*

| ✓ | Difficulty | Problem | Tier |
| --- | --- | --- | --- |
| [ ] | Easy | Valid Palindrome | **Core** |
| [ ] | Medium | 3Sum | **Core** |
| [ ] | Medium | Container With Most Water | **Core** |
| [ ] | Medium | Two Sum II - Input Array Is Sorted | Extended |
| [ ] | Hard | Trapping Rain Water | Extended |

### 2.3 Sliding Window

**Study first:** [Arrays and Strings](../Arrays%20and%20Strings/Arrays%20and%20Strings.md)
**Tests:** Updating a local window invariant incrementally instead of rescanning.

*6 problems — 4 Core, 2 Extended.*

| ✓ | Difficulty | Problem | Tier |
| --- | --- | --- | --- |
| [ ] | Easy | Best Time to Buy and Sell Stock | **Core** |
| [ ] | Medium | Longest Substring Without Repeating Characters | **Core** |
| [ ] | Medium | Longest Repeating Character Replacement | **Core** |
| [ ] | Hard | Minimum Window Substring | **Core** |
| [ ] | Medium | Permutation in String | Extended |
| [ ] | Hard | Sliding Window Maximum | Extended |

### 2.4 Stack

**Study first:** [Stack and Queue](../Stack%20and%20Queue/Stack%20and%20Queue.md)
**Tests:** Recognising LIFO state, monotonic structure, and delayed resolution of earlier elements.

*6 problems — 1 Core, 5 Extended.*

| ✓ | Difficulty | Problem | Tier |
| --- | --- | --- | --- |
| [ ] | Easy | Valid Parentheses | **Core** |
| [ ] | Medium | Min Stack | Extended |
| [ ] | Medium | Evaluate Reverse Polish Notation | Extended |
| [ ] | Medium | Daily Temperatures | Extended |
| [ ] | Medium | Car Fleet | Extended |
| [ ] | Hard | Largest Rectangle in Histogram | Extended |

### 2.5 Binary Search

**Study first:** [Binary Search](../Binary%20Search/Binary%20Search.md)
**Tests:** Turning monotonic predicates and sorted structure into exact boundary decisions.

*7 problems — 2 Core, 5 Extended.*

| ✓ | Difficulty | Problem | Tier |
| --- | --- | --- | --- |
| [ ] | Medium | Find Minimum in Rotated Sorted Array | **Core** |
| [ ] | Medium | Search in Rotated Sorted Array | **Core** |
| [ ] | Easy | Binary Search | Extended |
| [ ] | Medium | Search a 2D Matrix | Extended |
| [ ] | Medium | Koko Eating Bananas | Extended |
| [ ] | Medium | Time Based Key-Value Store | Extended |
| [ ] | Hard | Median of Two Sorted Arrays | Extended |

### 2.6 Linked List

**Study first:** [Linked List](../Linked%20List/Linked%20List.md)
**Tests:** Pointer ownership, mutation order, dummy nodes, and cycle invariants.

*11 problems — 6 Core, 5 Extended.*

| ✓ | Difficulty | Problem | Tier |
| --- | --- | --- | --- |
| [ ] | Easy | Reverse Linked List | **Core** |
| [ ] | Easy | Merge Two Sorted Lists | **Core** |
| [ ] | Easy | Linked List Cycle | **Core** |
| [ ] | Medium | Reorder List | **Core** |
| [ ] | Medium | Remove Nth Node From End of List | **Core** |
| [ ] | Hard | Merge k Sorted Lists | **Core** |
| [ ] | Medium | Copy List with Random Pointer | Extended |
| [ ] | Medium | Add Two Numbers | Extended |
| [ ] | Medium | Find the Duplicate Number | Extended |
| [ ] | Medium | LRU Cache | Extended |
| [ ] | Hard | Reverse Nodes in k-Group | Extended |

### 2.7 Trees

**Study first:** [Trees](../Trees/Trees.md)
**Tests:** Choosing traversal order, carrying state through recursion, and defining subtree returns.

*15 problems — 11 Core, 4 Extended.*

| ✓ | Difficulty | Problem | Tier |
| --- | --- | --- | --- |
| [ ] | Easy | Invert Binary Tree | **Core** |
| [ ] | Easy | Maximum Depth of Binary Tree | **Core** |
| [ ] | Easy | Same Tree | **Core** |
| [ ] | Easy | Subtree of Another Tree | **Core** |
| [ ] | Medium | Lowest Common Ancestor of a Binary Search Tree | **Core** |
| [ ] | Medium | Binary Tree Level Order Traversal | **Core** |
| [ ] | Medium | Validate Binary Search Tree | **Core** |
| [ ] | Medium | Kth Smallest Element in a BST | **Core** |
| [ ] | Medium | Construct Binary Tree from Preorder and Inorder Traversal | **Core** |
| [ ] | Hard | Binary Tree Maximum Path Sum | **Core** |
| [ ] | Hard | Serialize and Deserialize Binary Tree | **Core** |
| [ ] | Easy | Diameter of Binary Tree | Extended |
| [ ] | Easy | Balanced Binary Tree | Extended |
| [ ] | Medium | Binary Tree Right Side View | Extended |
| [ ] | Medium | Count Good Nodes in Binary Tree | Extended |

### 2.8 Tries

**Study first:** [Trees](../Trees/Trees.md) (§ Tries)
**Tests:** Compressing shared prefixes and trading memory for fast prefix search.

*3 problems — 3 Core.*

| ✓ | Difficulty | Problem | Tier |
| --- | --- | --- | --- |
| [ ] | Medium | Implement Trie (Prefix Tree) | **Core** |
| [ ] | Medium | Design Add and Search Words Data Structure | **Core** |
| [ ] | Hard | Word Search II | **Core** |

### 2.9 Heap / Priority Queue

**Study first:** [Heaps](../Heaps/Heaps.md)
**Tests:** Keeping only the next best candidate and defending O(log n) updates.

*7 problems — 1 Core, 6 Extended.*

| ✓ | Difficulty | Problem | Tier |
| --- | --- | --- | --- |
| [ ] | Hard | Find Median from Data Stream | **Core** |
| [ ] | Easy | Kth Largest Element in a Stream | Extended |
| [ ] | Easy | Last Stone Weight | Extended |
| [ ] | Medium | K Closest Points to Origin | Extended |
| [ ] | Medium | Kth Largest Element in an Array | Extended |
| [ ] | Medium | Task Scheduler | Extended |
| [ ] | Medium | Design Twitter | Extended |

### 2.10 Backtracking

**Study first:** [Backtracking](../Backtracking/Backtracking.md)
**Tests:** Pruning a search tree without losing completeness.

*10 problems — 2 Core, 8 Extended.*

| ✓ | Difficulty | Problem | Tier |
| --- | --- | --- | --- |
| [ ] | Medium | Combination Sum | **Core** |
| [ ] | Medium | Word Search | **Core** |
| [ ] | Medium | Generate Parentheses | Extended |
| [ ] | Medium | Subsets | Extended |
| [ ] | Medium | Permutations | Extended |
| [ ] | Medium | Subsets II | Extended |
| [ ] | Medium | Combination Sum II | Extended |
| [ ] | Medium | Palindrome Partitioning | Extended |
| [ ] | Medium | Letter Combinations of a Phone Number | Extended |
| [ ] | Hard | N-Queens | Extended |

### 2.11 Graphs

**Study first:** [Graphs](../Graphs/Graphs.md)
**Tests:** Modeling adjacency, visited state, and BFS/DFS/topological invariants.

*13 problems — 6 Core, 7 Extended.*

| ✓ | Difficulty | Problem | Tier |
| --- | --- | --- | --- |
| [ ] | Medium | Number of Islands | **Core** |
| [ ] | Medium | Clone Graph | **Core** |
| [ ] | Medium | Pacific Atlantic Water Flow | **Core** |
| [ ] | Medium | Course Schedule | **Core** |
| [ ] | Medium | Number of Connected Components in an Undirected Graph | **Core** |
| [ ] | Medium | Graph Valid Tree | **Core** |
| [ ] | Medium | Max Area of Island | Extended |
| [ ] | Medium | Surrounded Regions | Extended |
| [ ] | Medium | Rotting Oranges | Extended |
| [ ] | Medium | Walls and Gates | Extended |
| [ ] | Medium | Course Schedule II | Extended |
| [ ] | Medium | Redundant Connection | Extended |
| [ ] | Hard | Word Ladder | Extended |

### 2.12 Advanced Graphs

**Study first:** [Graphs](../Graphs/Graphs.md)
**Tests:** Selecting shortest path, MST, union-find, or topo based on edge semantics.

*6 problems — 1 Core, 5 Extended.*

| ✓ | Difficulty | Problem | Tier |
| --- | --- | --- | --- |
| [ ] | Hard | Alien Dictionary | **Core** |
| [ ] | Medium | Min Cost to Connect All Points | Extended |
| [ ] | Medium | Network Delay Time | Extended |
| [ ] | Medium | Cheapest Flights Within K Stops | Extended |
| [ ] | Hard | Reconstruct Itinerary | Extended |
| [ ] | Hard | Swim in Rising Water | Extended |

### 2.13 1-D Dynamic Programming

**Study first:** [Dynamic Programming](../Dynamic%20Programming/Dynamic%20Programming.md)
**Tests:** Defining the state transition and proving the previous states are sufficient.

*12 problems — 10 Core, 2 Extended.*

| ✓ | Difficulty | Problem | Tier |
| --- | --- | --- | --- |
| [ ] | Easy | Climbing Stairs | **Core** |
| [ ] | Medium | House Robber | **Core** |
| [ ] | Medium | House Robber II | **Core** |
| [ ] | Medium | Longest Palindromic Substring | **Core** |
| [ ] | Medium | Palindromic Substrings | **Core** |
| [ ] | Medium | Decode Ways | **Core** |
| [ ] | Medium | Coin Change | **Core** |
| [ ] | Medium | Maximum Product Subarray | **Core** |
| [ ] | Medium | Word Break | **Core** |
| [ ] | Medium | Longest Increasing Subsequence | **Core** |
| [ ] | Easy | Min Cost Climbing Stairs | Extended |
| [ ] | Medium | Partition Equal Subset Sum | Extended |

### 2.14 2-D Dynamic Programming

**Study first:** [Dynamic Programming](../Dynamic%20Programming/Dynamic%20Programming.md)
**Tests:** Managing two-axis state, ordering transitions, and compressing space safely.

*11 problems — 2 Core, 9 Extended.*

| ✓ | Difficulty | Problem | Tier |
| --- | --- | --- | --- |
| [ ] | Medium | Unique Paths | **Core** |
| [ ] | Medium | Longest Common Subsequence | **Core** |
| [ ] | Medium | Best Time to Buy and Sell Stock with Cooldown | Extended |
| [ ] | Medium | Coin Change II | Extended |
| [ ] | Medium | Target Sum | Extended |
| [ ] | Medium | Interleaving String | Extended |
| [ ] | Medium | Edit Distance | Extended |
| [ ] | Hard | Longest Increasing Path in a Matrix | Extended |
| [ ] | Hard | Distinct Subsequences | Extended |
| [ ] | Hard | Burst Balloons | Extended |
| [ ] | Hard | Regular Expression Matching | Extended |

### 2.15 Greedy

**Study first:** [Greedy](../Greedy/Greedy.md)
**Tests:** Proving the local choice is exchange-safe, not just intuitive.

*8 problems — 2 Core, 6 Extended.*

| ✓ | Difficulty | Problem | Tier |
| --- | --- | --- | --- |
| [ ] | Medium | Maximum Subarray | **Core** |
| [ ] | Medium | Jump Game | **Core** |
| [ ] | Medium | Jump Game II | Extended |
| [ ] | Medium | Gas Station | Extended |
| [ ] | Medium | Hand of Straights | Extended |
| [ ] | Medium | Merge Triplets to Form Target Triplet | Extended |
| [ ] | Medium | Partition Labels | Extended |
| [ ] | Medium | Valid Parenthesis String | Extended |

### 2.16 Intervals

**Study first:** [Greedy](../Greedy/Greedy.md) · [Arrays and Strings](../Arrays%20and%20Strings/Arrays%20and%20Strings.md)
**Tests:** Sorting events/endpoints and preserving overlap/coverage invariants.

*6 problems — 5 Core, 1 Extended.*

| ✓ | Difficulty | Problem | Tier |
| --- | --- | --- | --- |
| [ ] | Easy | Meeting Rooms | **Core** |
| [ ] | Medium | Insert Interval | **Core** |
| [ ] | Medium | Merge Intervals | **Core** |
| [ ] | Medium | Non-overlapping Intervals | **Core** |
| [ ] | Medium | Meeting Rooms II | **Core** |
| [ ] | Hard | Minimum Interval to Include Each Query | Extended |

### 2.17 Math & Geometry

**Study first:** [Arrays and Strings](../Arrays%20and%20Strings/Arrays%20and%20Strings.md) · [Bit Manipulation](../Bit%20Manipulation/Bit%20Manipulation.md)
**Tests:** Reducing implementation traps to formulas, coordinates, and simulation invariants.

*9 problems — 3 Core, 6 Extended.*

| ✓ | Difficulty | Problem | Tier |
| --- | --- | --- | --- |
| [ ] | Medium | Rotate Image | **Core** |
| [ ] | Medium | Spiral Matrix | **Core** |
| [ ] | Medium | Set Matrix Zeroes | **Core** |
| [ ] | Easy | Happy Number | Extended |
| [ ] | Easy | Plus One | Extended |
| [ ] | Medium | Reverse Integer | Extended |
| [ ] | Medium | Pow(x, n) | Extended |
| [ ] | Medium | Multiply Strings | Extended |
| [ ] | Medium | Detect Squares | Extended |

### 2.18 Bit Manipulation

**Study first:** [Bit Manipulation](../Bit%20Manipulation/Bit%20Manipulation.md)
**Tests:** Using bit identities, masks, and representation limits deliberately.

*6 problems — 5 Core, 1 Extended.*

| ✓ | Difficulty | Problem | Tier |
| --- | --- | --- | --- |
| [ ] | Easy | Number of 1 Bits | **Core** |
| [ ] | Easy | Counting Bits | **Core** |
| [ ] | Easy | Reverse Bits | **Core** |
| [ ] | Easy | Missing Number | **Core** |
| [ ] | Medium | Sum of Two Integers | **Core** |
| [ ] | Easy | Single Number | Extended |

---

## 3. Coverage Summary

| Pattern | Total | Core | Extended |
| --- | --- | --- | --- |
| Arrays & Hashing | 9 | 8 | 1 |
| Two Pointers | 5 | 3 | 2 |
| Sliding Window | 6 | 4 | 2 |
| Stack | 6 | 1 | 5 |
| Binary Search | 7 | 2 | 5 |
| Linked List | 11 | 6 | 5 |
| Trees | 15 | 11 | 4 |
| Tries | 3 | 3 | 0 |
| Heap / Priority Queue | 7 | 1 | 6 |
| Backtracking | 10 | 2 | 8 |
| Graphs | 13 | 6 | 7 |
| Advanced Graphs | 6 | 1 | 5 |
| 1-D Dynamic Programming | 12 | 10 | 2 |
| 2-D Dynamic Programming | 11 | 2 | 9 |
| Greedy | 8 | 2 | 6 |
| Intervals | 6 | 5 | 1 |
| Math & Geometry | 9 | 3 | 6 |
| Bit Manipulation | 6 | 5 | 1 |
| **Total** | **150** | **75** | **75** |

> **Quick Note** — The distribution is itself a signal: Trees, Graphs, DP and Arrays & Hashing dominate the set. If time is short, weight practice by these counts rather than spreading evenly.

---

**Related notes:** [DSA Patterns](DSAPatterns.md) · [Arrays and Strings](../Arrays%20and%20Strings/Arrays%20and%20Strings.md) · [Hashing](../Hashing/Hashing.md) · [Trees](../Trees/Trees.md) · [Graphs](../Graphs/Graphs.md) · [Dynamic Programming](../Dynamic%20Programming/Dynamic%20Programming.md)
