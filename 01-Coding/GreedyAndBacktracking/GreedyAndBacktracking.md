# Greedy and Backtracking

> **Core idea:** Greedy commits to the locally best choice at each step; backtracking explores every branch of a decision tree and undoes choices that fail.
> **Recognise it when:** "minimum/maximum number of …", "all possible subsets/permutations/combinations", "place N queens", "partition such that …", "can you reach …"
> **Costs:** Greedy `O(n log n)`; Backtracking `O(n · 2ⁿ)` subsets, `O(n · n!)` permutations, `O(n²)` N-Queens with pruning.

---

## Mental Model

**Greedy invariant:** after processing the first `k` elements, the partial solution is extendable to a global optimum.
Verify with an **exchange argument** — if you cannot construct one, switch to DP.

**Backtracking invariant:** the call stack encodes *exactly* the choices made on the current path; every choice is undone before the next branch is tried.

```
decision tree
root → pick choice₁ → pick choice₂ → … → leaf (solution or dead-end)
                   ↖ undo, try choice₂
```

---

## Greedy Proof: Exchange Argument

**How to run one (worked example — Interval Scheduling / LeetCode 435):**

*Claim:* Sort by end time; always pick the interval with the earliest end that does not conflict → maximum non-overlapping count.

1. **Let OPT** be any optimal solution. Let **G** be the greedy solution. Suppose they first differ at position `k`: greedy picks interval `gₖ`, OPT picks `oₖ`, where `end(gₖ) ≤ end(oₖ)` (by greedy's sort).
2. **Swap** `oₖ` for `gₖ` in OPT. Does the swap break anything?
   - `gₖ` starts after the previous kept interval (same constraint OPT already satisfied).
   - `end(gₖ) ≤ end(oₖ)` so the interval at position `k+1` in OPT still starts after `end(gₖ)`.
3. The swapped OPT is still valid and has the **same count** → greedy is at least as good as OPT → greedy is optimal. ∎

> **Why it works:** end-time sorting ensures the earliest-finishing interval leaves the most room for future intervals. Any deviation from greedy cannot do better.

**Matroid note:** interval scheduling forms a matroid (independent sets = conflict-free subsets), which algebraically guarantees greedy optimality. Kruskal's MST relies on the same structure — see [Graphs](../Graphs/Graphs.md).

---

## Greedy vs DP Decision Table

| Aspect | Greedy | Dynamic Programming |
| ------ | ------ | ------------------- |
| Subproblems | Independent after choice | **Overlapping** |
| Choice | Local optimum (commit once) | All possibilities explored |
| Correctness proof | Exchange argument required | Always correct if recurrence right |
| Complexity | Usually `O(n log n)` or `O(n)` | `O(n²)` to `O(n³)` or higher |
| Quick test | Try a counter-example with 3–4 elements | — |
| Examples | Interval scheduling, Huffman, Jump Game | Knapsack, LCS, TSP |

**Quick way to falsify a greedy hypothesis:** construct a 3-element input where greedy's first choice locks you out of the global optimum. If you can't in 2 minutes → likely correct.

---

## Intervals — Decision Table

This is a major interview family. The sort key is the whole trick.

| Asked for | Sort key | Data structure | LeetCode |
| --------- | -------- | -------------- | -------- |
| Maximum non-overlapping count | **End time** ↑ | Counter + last-end variable | 435, 452 |
| Merge / flatten intervals | **Start time** ↑ | Result list, extend last | 56, 57 |
| Minimum rooms / resources | **Start time** ↑ | Min-heap of end times | 253 |
| Maximum concurrent / events | Event sweep (+1/−1) | Sorted events array or diff array | 1094, My Calendar |

### Sort by end → maximum non-overlapping (Activity Selection)

```csharp
// O(n log n) time, O(1) space
int MaxNonOverlapping(int[][] intervals)
{
    Array.Sort(intervals, (a, b) => a[1].CompareTo(b[1]));  // CompareTo — never subtract (overflow!)
    int count = 1, end = intervals[0][1];
    for (int i = 1; i < intervals.Length; i++)
        if (intervals[i][0] >= end) { count++; end = intervals[i][1]; }
    return count;
}
```

### Sort by start → merge intervals

```csharp
// O(n log n) time, O(n) space
int[][] Merge(int[][] intervals)
{
    Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
    var res = new List<int[]> { intervals[0] };
    foreach (var iv in intervals.Skip(1))
    {
        var last = res[^1];
        if (iv[0] <= last[1]) last[1] = Math.Max(last[1], iv[1]);
        else res.Add(iv);
    }
    return res.ToArray();
}
```

### Sort by start + min-heap of ends → minimum rooms (LeetCode 253)

See full solution in [Heaps and Priority Queues](../HeapsAndPriorityQueues/Problems.md).

### Sweep line → max concurrent (Car Pooling, My Calendar)

Emit `+capacity` at pickup, `−capacity` at dropoff; sort events; track running sum.
See difference-array technique in [Arrays and Strings](../ArraysAndStrings/ArraysAndStrings.md).

---

## Classic Greedy

### Jump Game (LeetCode 55)

Track the farthest reachable index. If `i > reach` → impossible.

```csharp
bool CanJump(int[] nums)
{
    int reach = 0;
    for (int i = 0; i < nums.Length; i++)
    {
        if (i > reach) return false;
        reach = Math.Max(reach, i + nums[i]);
    }
    return true;
}
```

### Jump Game II (LeetCode 45)

Think BFS levels: `currentEnd` = boundary of this jump, `farthest` = best next boundary.

```csharp
int Jump(int[] nums)
{
    int jumps = 0, currentEnd = 0, farthest = 0;
    for (int i = 0; i < nums.Length - 1; i++)
    {
        farthest = Math.Max(farthest, i + nums[i]);
        if (i == currentEnd) { jumps++; currentEnd = farthest; }
    }
    return jumps;
}
```

### Gas Station (LeetCode 134)

If total gas ≥ total cost a solution exists. Reset `start` whenever running sum goes negative.

```csharp
int CanCompleteCircuit(int[] gas, int[] cost)
{
    int total = 0, tank = 0, start = 0;
    for (int i = 0; i < gas.Length; i++)
    {
        int gain = gas[i] - cost[i];
        total += gain; tank += gain;
        if (tank < 0) { start = i + 1; tank = 0; }
    }
    return total >= 0 ? start : -1;
}
```

### Partition Labels (LeetCode 763)

Pre-compute last occurrence of every character; extend partition end as you go.

```csharp
IList<int> PartitionLabels(string s)
{
    int[] last = new int[26];
    for (int i = 0; i < s.Length; i++) last[s[i] - 'a'] = i;
    var res = new List<int>();
    int start = 0, end = 0;
    for (int i = 0; i < s.Length; i++)
    {
        end = Math.Max(end, last[s[i] - 'a']);
        if (i == end) { res.Add(end - start + 1); start = i + 1; }
    }
    return res;
}
```

### Huffman Coding (Greedy + Min-Heap)

Build a min-heap of character frequencies. Extract the two minimum nodes, combine into a parent with sum frequency, reinsert. O(n log n). Produces an optimal prefix-free code. Uses [PriorityQueue](../HeapsAndPriorityQueues/HeapsAndPriorityQueues.md).

### Other Canonical Greedy

| Problem | LeetCode | Key greedy insight |
| ------- | -------- | ------------------ |
| Assign Cookies | 455 | Sort both arrays; greedily assign smallest sufficient cookie |
| Candy | 135 | Two passes: left→right (ascending), right→left (descending); take max |
| Best Time to Buy/Sell II | 122 | Add every positive day-to-day difference |
| Hand of Straights | 846 | Use sorted frequency map; always fill from smallest available card |
| Boats to Save People | 881 | Two pointers; pair heaviest with lightest if they fit |
| Reorganise String | 767 | Always place most-frequent remaining char (needs max-heap — see [Heaps](../HeapsAndPriorityQueues/HeapsAndPriorityQueues.md)) |
| Task Scheduler | 621 | Frequency-based idle slots (see [Heaps](../HeapsAndPriorityQueues/Problems.md)) |
| Meeting Rooms II | 253 | Min-heap of end times (see [Heaps](../HeapsAndPriorityQueues/Problems.md)) |

---

## When Greedy Fails → Use DP

| Problem | Why greedy fails | Use |
| ------- | ---------------- | --- |
| 0/1 Knapsack | Can't take partial items; local best ≠ global | DP |
| Coin Change | Largest coin first misses smaller combos | DP |
| LCS | Locally matching chars skip globally better alignment | DP |
| Matrix chain mult | Greedy bracket order ≠ minimum ops | Interval DP |
| Shortest path, negative edges | Local minimum edge ≠ global shortest | Bellman-Ford |
| Edit Distance | Local cheapest edit doesn't minimise total | DP |

---

## Backtracking

### Universal Template

```csharp
// CHECK → MARK → EXPLORE → UNMARK
void Backtrack(List<int> cur, /* params */)
{
    if (IsSolution(cur))
    {
        result.Add(new List<int>(cur));  // copy — never add the reference!
        return;
    }
    foreach (var choice in GetChoices(cur))
    {
        if (!IsValid(cur, choice)) continue;  // prune
        cur.Add(choice);                       // mark
        Backtrack(cur, /* updated */);         // explore
        cur.RemoveAt(cur.Count - 1);           // unmark (undo)
    }
}
```

### Three Canonical Shapes

#### 1. Subsets / Combinations — `for i = start..n`, recurse with `i+1`

```csharp
// Use when: "all subsets", "all combinations of size k", no reuse
void Subsets(int[] nums, int start, List<int> cur, List<List<int>> res)
{
    res.Add(new List<int>(cur));
    for (int i = start; i < nums.Length; i++)
    {
        cur.Add(nums[i]);
        Subsets(nums, i + 1, cur, res);
        cur.RemoveAt(cur.Count - 1);
    }
}
```

**Reuse allowed (Combination Sum):** pass `i` instead of `i + 1`.

**Duplicate elements (Subsets II / Comb Sum II):**

```csharp
Array.Sort(nums);  // must sort first
for (int i = start; i < nums.Length; i++)
{
    if (i > start && nums[i] == nums[i - 1]) continue;  // skip same value at same depth
    // ...
}
```

> **Why `i > start` not `i > 0`?** At depth `d`, `start` is the first index allowed at this level. `i > start` means "same value as the *previous sibling at this level*". Using `i > 0` would wrongly skip `nums[1]` even when it is the first element tried at a deeper level.

#### 2. Permutations — `for i = 0..n`, `used[]` array

```csharp
// Use when: "all permutations", order matters
void Permute(int[] nums, bool[] used, List<int> cur, List<List<int>> res)
{
    if (cur.Count == nums.Length) { res.Add(new List<int>(cur)); return; }
    for (int i = 0; i < nums.Length; i++)
    {
        if (used[i]) continue;
        used[i] = true;
        cur.Add(nums[i]);
        Permute(nums, used, cur, res);
        used[i] = false;
        cur.RemoveAt(cur.Count - 1);
    }
}
```

**Duplicate elements (Permutations II):**

```csharp
Array.Sort(nums);
for (int i = 0; i < nums.Length; i++)
{
    if (used[i]) continue;
    if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;  // key condition
    // ...
}
```

> **Why `!used[i-1]`?** We want to allow `nums[i-1]` before `nums[i]` but *not* `nums[i]` before `nums[i-1]` (since they are equal). If `used[i-1]` is `true`, `nums[i-1]` was picked earlier on this path — both orderings are distinct paths and we should continue. If `used[i-1]` is `false`, `nums[i-1]` was *not* picked yet at this recursion level, meaning we would be picking `nums[i]` first — that is the duplicate ordering we want to skip.

#### 3. Grid / Board Search — mark in place, unmark on return

```csharp
// Use when: Word Search, flood fill, Sudoku, Rat-in-a-Maze
bool Dfs(char[][] board, string word, int r, int c, int idx)
{
    if (idx == word.Length) return true;
    if (r < 0 || r >= board.Length || c < 0 || c >= board[0].Length) return false;
    if (board[r][c] != word[idx]) return false;

    char tmp = board[r][c];
    board[r][c] = '#';  // mark visited in place
    bool found = Dfs(board, word, r + 1, c, idx + 1)
              || Dfs(board, word, r - 1, c, idx + 1)
              || Dfs(board, word, r, c + 1, idx + 1)
              || Dfs(board, word, r, c - 1, idx + 1);
    board[r][c] = tmp;  // restore
    return found;
}
```

---

## Pruning Techniques

| Technique | When to apply | Example |
| --------- | ------------- | ------- |
| Sort + early break | Remaining candidates sorted; sum already exceeds target | Combination Sum |
| Feasibility bound | `remaining < candidates[i]` after sort → break inner loop | Combination Sum II |
| Constraint propagation | Maintain separate sets for forbidden values | N-Queens, Sudoku |
| Visited state cache | Grid DFS with repeated states | Unique Paths III |
| Symmetry pruning | First queen in top half only | N-Queens II count |

---

## Complexity of Backtracking

State the complexity as: **number of nodes in decision tree × work per node**.

| Problem shape | Decision-tree nodes | Work per node | Total |
| ------------- | ------------------- | ------------- | ----- |
| Subsets (n unique) | 2ⁿ leaves, 2ⁿ⁺¹ nodes | O(n) copy | **O(n · 2ⁿ)** |
| Permutations (n unique) | n! leaves | O(n) copy | **O(n · n!)** |
| Combinations k-of-n | C(n,k) leaves | O(k) copy | **O(k · C(n,k))** |
| N-Queens | ≤ n! pruned heavily | O(n) board build | **O(n!)** |
| Sudoku | ≤ 9^81 but pruning → ~O(9^m) | O(1) | Empirically fast |

---

## Divide & Conquer

**Pattern:** `solve(lo, hi) = combine(solve(lo, mid), solve(mid+1, hi))`

- If subproblems **overlap** → DP instead.
- If **order of choices matters** → backtracking instead.

### Merge Sort / Quickselect

Code lives in [Searching and Sorting](../SearchingAndSorting/SearchingAndSorting.md).
- Merge sort augmented for inversions: LeetCode 315.
- Quickselect average O(n) for Kth largest: LeetCode 215.

### Closest Pair of Points

1. Sort by x. Split at median.
2. Recurse on both halves → `d = min(dLeft, dRight)`.
3. Check strip of width `2d` around the midline; at most 8 points per strip cell.

Time O(n log n), Space O(n).

### Meet-in-the-Middle

Split input in half; enumerate all 2^(n/2) subsets of each half; combine with binary search or sort-and-two-pointer.
Reduces O(2ⁿ) → O(2^(n/2) · n). Use when n ≤ 40.
LeetCode 805 — Split Array Same Average.

---

## Pattern Recognition

| Problem says… | Reach for | Complexity |
| ------------- | --------- | ---------- |
| Minimum intervals removed / maximum non-overlapping | Greedy — sort by end | `O(n log n)` |
| Merge / flatten overlapping intervals | Greedy — sort by start | `O(n log n)` |
| Minimum rooms / resources for intervals | Sort by start + min-heap | `O(n log n)` |
| Max overlap / concurrent events | Sweep line / diff array | `O(n log n)` |
| Can you reach the end? / minimum jumps | Greedy — track farthest | `O(n)` |
| All subsets / power set | Backtracking — subsets shape | `O(n · 2ⁿ)` |
| All permutations | Backtracking — used[] array | `O(n · n!)` |
| Combinations summing to target | Backtracking — combinations shape | `O(n^(T/m))` |
| Partition string into palindromes | Backtracking + DP precompute | `O(n · 2ⁿ)` |
| Place N queens / solve Sudoku | Backtracking — grid + constraint sets | `O(n!)` |
| Kth largest element | Quickselect (see SearchingAndSorting) | `O(n)` avg |
| n ≤ 40, subset sum / partition | Meet-in-the-middle | `O(2^(n/2) · n)` |

---

## Variants and Differences

### Greedy vs Backtracking

| | Greedy | Backtracking |
| - | ------ | ------------ |
| Explores | One path | All paths |
| Undoes choices | Never | Always |
| Complexity | Polynomial | Exponential |
| Needs proof | Yes (exchange arg) | No — correct by exhaustion |
| When correct | Matroid / exchange-arg | Always (with valid pruning) |

### Subsets vs Combinations vs Permutations

| | Subsets | Combinations k-of-n | Permutations |
| - | ------- | ------------------- | ------------ |
| Order matters | ❌ | ❌ | ✅ |
| Size fixed | ❌ | ✅ | ✅ (= n) |
| Loop index | `start..n` | `start..n` | `0..n` |
| Tracking | `start` param | `start` param + size check | `used[]` |

---

## Recursion → Iteration

| Recursive pattern | Iterative equivalent |
| ----------------- | -------------------- |
| DFS on tree | `Stack<TreeNode>` |
| Merge sort | Bottom-up merge passes |
| Backtracking | Explicit `Stack<State>` + undo log |
| Fibonacci DP | Loop with `prev`/`curr` |
| Tail recursion | Direct loop |

---

## Pitfalls

- **Forgetting to copy the list** when recording a solution: `result.Add(cur)` adds a reference that gets mutated → use `result.Add(new List<int>(cur))`.
- **Forgetting to undo the choice**: `cur.Add(x)` without a matching `cur.RemoveAt(...)` corrupts all subsequent branches.
- **Modifying the board without restoring**: grid DFS marks `'#'` but a missed restore corrupts future calls.
- **Skipping before sorting**: duplicate-skip rules require the array to be sorted first — `if (nums[i] == nums[i-1]) continue` is wrong on unsorted input.
- **Wrong permutation duplicate condition**: using `i > 0 && nums[i] == nums[i-1] && used[i-1]` (missing `!`) — this *keeps* duplicates instead of removing them.
- **Subtraction comparator overflow**: `(a, b) => a[1] - b[1]` overflows for `int.MinValue`/`int.MaxValue` inputs. **Always use** `a[1].CompareTo(b[1])`.
- **Greedy without proof**: assuming greedy is correct because it works on the examples — find a 3-element counter-example first.
- **Wrong sort key for intervals**: sorting by start for activity selection (should be end), or by end for merge intervals (should be start).

---

## Practice

→ [Problems.md](./Problems.md)

| LeetCode | Problem | Pattern |
| -------- | ------- | ------- |
| 56 | Merge Intervals | Intervals — sort by start |
| 57 | Insert Interval | Intervals — single pass |
| 252 | Meeting Rooms | Intervals — sort by start |
| 253 | Meeting Rooms II | Intervals — min-heap |
| 435 | Non-overlapping Intervals | Intervals — sort by end |
| 452 | Minimum Arrows | Intervals — sort by end |
| 1094 | Car Pooling | Intervals — sweep line |
| 55 | Jump Game | Classic Greedy |
| 45 | Jump Game II | Classic Greedy |
| 134 | Gas Station | Classic Greedy |
| 135 | Candy | Classic Greedy |
| 763 | Partition Labels | Classic Greedy |
| 455 | Assign Cookies | Classic Greedy |
| 78 | Subsets | Backtracking — subsets |
| 90 | Subsets II | Backtracking — subsets + dedup |
| 46 | Permutations | Backtracking — permutations |
| 47 | Permutations II | Backtracking — permutations + dedup |
| 39 | Combination Sum | Backtracking — combinations |
| 40 | Combination Sum II | Backtracking — combinations + dedup |
| 77 | Combinations | Backtracking — combinations |
| 216 | Combination Sum III | Backtracking — combinations |
| 17 | Letter Combinations | Backtracking — combinations |
| 22 | Generate Parentheses | Backtracking — constraint |
| 131 | Palindrome Partitioning | Backtracking + DP |
| 79 | Word Search | Backtracking — grid |
| 51 | N-Queens | Backtracking — grid + constraints |
| 52 | N-Queens II | Backtracking — grid + constraints |
| 37 | Sudoku Solver | Backtracking — constraint propagation |
| 980 | Unique Paths III | Backtracking — grid |
| 215 | Kth Largest Element | Quickselect (→ SearchingAndSorting) |
