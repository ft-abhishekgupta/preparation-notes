const n=`---
title: Standard Problems
description: A worked coding interview reference grouping canonical problems by pattern and showing complete C# solutions for the standard approaches
difficulty: Core
tags: [problem-solving, worked-examples, patterns, csharp]
---

This page is the problem-library companion to the pattern pages. Instead of teaching a technique in isolation, it shows the canonical interview problem where that technique earns its keep, with complete C# implementations you can compare against your own. The fastest way to use it is to read a prompt, name the pattern family first, then jump to the matching section and check whether your invariant, state, and complexity story line up with the worked version here.

\`\`\`mermaid
flowchart LR
    A["Read the prompt"] --> B["Name the dominant constraint"]
    B --> C["Contiguous range or window?"]
    B --> D["Sorted order or monotonicity?"]
    B --> E["Repeated choose and undo?"]
    B --> F["Reachability or shortest path?"]
    B --> G["Best total over many choices?"]
    C --> H["Sliding Window or Prefix Sum"]
    D --> I["Two Pointers or Binary Search"]
    E --> J["Backtracking"]
    F --> K["Graph BFS DFS"]
    G --> L["Dynamic Programming or Greedy"]
\`\`\`

> [!KEY]
> In interviews, say the wasted work before you say the trick. Once you can name the bottleneck as repeated scanning, repeated branching, or repeated re-sorting, the right pattern usually becomes obvious.

> [!TIP]
> Use this page after you can already state a brute-force solution. Interviewers usually score the transition from correct-but-slow to optimal almost as highly as the final code.

**Arrays, Strings and Hashing**

| Problem | Pattern | Technique | Complexity |
|---|---|---|---|
| Maximum Subarray | Arrays | Kadane running sum | \`O(n)/O(1)\` |
| Best Time to Buy and Sell Stock | Arrays | Reverse scan with suffix max | \`O(n)/O(1)\` |
| Majority Element | Arrays | Boyer-Moore vote | \`O(n)/O(1)\` |
| Product of Array Except Self | Arrays | Prefix and suffix products | \`O(n)/O(n)\` |
| Maximum Product Subarray | Arrays | Prefix and suffix products with zero reset | \`O(n)/O(1)\` |
| Find All Duplicates in an Array | Arrays | Index marking by negation | \`O(n)/O(1)\` |
| Find the Duplicate Number | Arrays | Floyd cycle detection | \`O(n)/O(1)\` |
| Sort Colors | Arrays | Dutch national flag partition | \`O(n)/O(1)\` |
| Rotate Array | Arrays | Triple reverse | \`O(n)/O(1)\` |
| Next Permutation | Arrays | Pivot swap and suffix reverse | \`O(n)/O(1)\` |
| Spiral Matrix | Arrays | Boundary simulation | \`O(rows * cols)/O(1)\` |
| Set Matrix Zeroes | Arrays | First row and first column markers | \`O(rows * cols)/O(1)\` |
| Rotate Image | Arrays | Transpose then reverse rows | \`O(n^2)/O(1)\` |
| Longest Common Prefix | Strings | Vertical scan | \`O(C)/O(1)\` |
| Encode and Decode Strings | Strings | Length-prefix encoding | \`O(C)/O(C)\` |
| Contains Duplicate | Hashing | HashSet membership | \`O(n)/O(n)\` |
| Valid Anagram | Hashing | Frequency map | \`O(n + m)/O(k)\` |
| Two Sum | Hashing | Complement lookup map | \`O(n)/O(n)\` |
| Group Anagrams | Hashing | Sorted-string key | \`O(n * k log k)/O(n * k)\` |
| Subarray Sum Equals K | Hashing | Prefix sum counts | \`O(n)/O(n)\` |
| Longest Consecutive Sequence | Hashing | Start-of-sequence HashSet scan | \`O(n)/O(n)\` |
| 3Sum | Hashing | Fix one and run hash-based Two Sum | \`O(n^2)/O(n)\` |

**Pointers, Windows, Stacks, Linked Lists and Search**

| Problem | Pattern | Technique | Complexity |
|---|---|---|---|
| Valid Palindrome | 2 Pointers | Skip non-alphanumerics from both ends | \`O(n)/O(1)\` |
| Remove Duplicates from Sorted Array | 2 Pointers | Slow and fast overwrite | \`O(n)/O(1)\` |
| Two Sum II | 2 Pointers | Opposite ends on sorted array | \`O(n)/O(1)\` |
| Container With Most Water | 2 Pointers | Move the shorter wall | \`O(n)/O(1)\` |
| Trapping Rain Water | 2 Pointers | Two pointers or prefix-suffix maxima | \`O(n)/O(1); O(n)/O(n)\` |
| Palindromic Substrings | 2 Pointers | Expand centers or palindrome DP | \`O(n^2)/O(1); O(n^2)/O(n^2)\` |
| Longest Substring Without Repeating Characters | Sliding Window | HashSet window or last-seen index | \`O(n)/O(k)\` |
| Longest Repeating Character Replacement | Sliding Window | Valid while \`window - maxFreq <= k\` | \`O(n)/O(k)\` |
| Minimum Window Substring | Sliding Window | Need and window counts with formed targets | \`O(|s| + |t|)/O(k)\` |
| Subarray Product Less Than K | Sliding Window | Shrink while product is too large | \`O(n)/O(1)\` |
| Valid Parentheses | Stack | Push expected closing bracket | \`O(n)/O(n)\` |
| Evaluate Reverse Polish Notation | Stack | Push operands and pop two on operator | \`O(n)/O(n)\` |
| Min Stack | Stack design | Value stack plus running-min stack | \`O(1) per op/O(n)\` |
| Implement Queue Using Stacks | Queue design | In-stack and out-stack amortization | \`Push O(1), Pop O(1) amortized/O(n)\` |
| Implement Stack Using Queue | Stack design | Rotate queue after each push | \`Push O(n), Pop O(1)/O(n)\` |
| Sliding Window Maximum | Monotonic deque | Decreasing deque or max-heap | \`O(n)/O(k); O(n log n)/O(n)\` |
| Next Greater Element II | Monotonic stack | Scan the circular array twice | \`O(n)/O(n)\` |
| Remove K Digits | Monotonic stack | Pop larger left digits greedily | \`O(n)/O(n)\` |
| Largest Rectangle in Histogram | Monotonic stack | Previous and next smaller arrays | \`O(n)/O(n)\` |
| Merge Two Sorted Lists | Linked List | Dummy head merge | \`O(n + m)/O(1)\` |
| Remove Nth Node From End | Linked List | Length pass then delete | \`O(n)/O(1)\` |
| Palindrome Linked List | Linked List | Middle, reverse second half, compare | \`O(n)/O(1)\` |
| Reorder List | Linked List | Middle, reverse second half, weave | \`O(n)/O(1)\` |
| Copy List with Random Pointer | Linked List | Hash map or interleaving copy | \`O(n)/O(n); O(n)/O(1)\` |
| Merge K Sorted Lists | Linked List | Min-heap of list heads | \`O(N log k)/O(k)\` |
| LRU Cache | Design | Hash map plus doubly linked list | \`O(1) avg/O(capacity)\` |
| Find Minimum in Rotated Sorted Array | Binary Search | Compare mid with right | \`O(log n)/O(1)\` |
| Search in Rotated Sorted Array | Binary Search | Identify the sorted half | \`O(log n)/O(1)\` |
| Koko Eating Bananas | Binary Search | Brute force or search on answer | \`O(N * maxPile)/O(1); O(N log maxPile)/O(1)\` |

**Heaps, Trees and Graphs**

| Problem | Pattern | Technique | Complexity |
|---|---|---|---|
| Top K Frequent Elements | Heap | Min-heap of size k or bucket sort | \`O(n log k)/O(n); O(n)/O(n)\` |
| Find Median from Data Stream | Heap | Two heaps with rebalancing | \`Add O(log n), Median O(1)/O(n)\` |
| Task Scheduler | Heap | Cooldown simulation or counting formula | \`O(T log k)/O(k); O(T + k)/O(k)\` |
| Same Tree | Tree | Recursive structural comparison | \`O(n)/O(h)\` |
| Invert Binary Tree | Tree | Swap children on DFS | \`O(n)/O(h)\` |
| Path Sum | Tree | Subtract target down root-to-leaf path | \`O(n)/O(h)\` |
| Validate Binary Search Tree | Tree | Min and max bounds | \`O(n)/O(h)\` |
| Kth Smallest Element in a BST | Tree | Inorder traversal stops at k | \`O(h + k)/O(h)\` |
| Lowest Common Ancestor of a BST | Tree | Divide by BST ordering | \`O(h)/O(1)\` iterative |
| Lowest Common Ancestor of a Binary Tree | Tree | Return the split point from subtrees | \`O(n)/O(h)\` |
| Subtree of Another Tree | Tree | Same-tree check at every node | \`O(N * M)/O(H + h)\` |
| Construct Binary Tree from Preorder and Inorder | Tree | Preorder root plus inorder index map | \`O(n)/O(n)\` |
| Serialize and Deserialize Binary Tree | Tree | Preorder with null markers | \`O(n)/O(n)\` |
| Binary Tree Maximum Path Sum | Tree | Postorder max-gain DP | \`O(n)/O(h)\` |
| Number of Islands | Graph | Flood-fill connected components | \`O(rows * cols)/O(rows * cols)\` |
| Clone Graph | Graph | DFS with original-to-copy map | \`O(V + E)/O(V)\` |
| Rotting Oranges | Graph | Multi-source BFS by minute | \`O(rows * cols)/O(rows * cols)\` |
| Is Graph Bipartite | Graph | 0-1 coloring by component | \`O(V + E)/O(V)\` |
| Graph Valid Tree | Graph | \`n - 1\` edges plus connectivity check | \`O(V + E)/O(V)\` |
| Redundant Connection | Graph | Union-Find first failed union | \`O(E * alpha(V))/O(V)\` |
| Pacific Atlantic Water Flow | Graph | Reverse DFS from both oceans | \`O(rows * cols)/O(rows * cols)\` |
| Word Ladder | Graph | Pattern buckets for one-letter neighbors | \`O(N * L^2)/O(N * L)\` |
| Network Delay Time | Graph | Dijkstra shortest paths | \`O((V + E) log V)/O(V + E)\` |
| Alien Dictionary | Graph | Topological sort over precedence edges | \`O(C + V + E)/O(V + E)\` |

**Backtracking, Greedy, DP and Bit**

| Problem | Pattern | Technique | Complexity |
|---|---|---|---|
| Subsets | Backtracking | Include or exclude each element | \`O(N * 2^N)/O(N)\` |
| Subsets II | Backtracking | Sort and skip duplicate siblings | \`O(N * 2^N)/O(N)\` |
| Permutations | Backtracking | Used-array build or in-place swapping | \`O(N * N!)/O(N)\` |
| Combination Sum | Backtracking | Reuse the same index while shrinking target | \`O(N^(T/m))/O(T/m)\` |
| Combination Sum II | Backtracking | Choose once and skip duplicate siblings | \`O(N * 2^N)/O(N)\` |
| Word Search | Backtracking | DFS with mark and unmark | \`O(rows * cols * 3^L)/O(L)\` |
| Generate Parentheses | Backtracking | Open and close count pruning | \`O(4^N / sqrt(N))/O(N)\` |
| N-Queens | Backtracking | Brute force or conflict sets | \`O(N^N)/O(N); O(N!)/O(N)\` |
| Meeting Rooms I | Greedy and Intervals | Sort by start and compare neighbors | \`O(n log n)/O(log n)\` |
| Merge Intervals | Greedy and Intervals | Max-heap descending by end | \`O(n log n)/O(n)\` |
| Insert Interval | Greedy and Intervals | Before, merge, after scan | \`O(n)/O(n)\` |
| Maximum Number of Non-Overlapping Intervals | Greedy and Intervals | Sort by end and take earliest finish | \`O(n log n)/O(log n)\` |
| Erase Overlap Intervals | Greedy and Intervals | Keep earliest end and remove conflicts | \`O(n log n)/O(log n)\` |
| Meeting Rooms II | Greedy and Intervals | Sweep line with start and end events | \`O(n log n)/O(n)\` |
| Minimum Number of Arrows to Burst Balloons | Greedy and Intervals | Sort by end and shoot at end | \`O(n log n)/O(log n)\` |
| Jump Game | Greedy and Intervals | Track the farthest reachable index | \`O(n)/O(1)\` |
| Jump Game II | Greedy and Intervals | Expand one reachable frontier at a time | \`O(n)/O(1)\` |
| Gas Station | Greedy and Intervals | Total surplus plus reset on negative prefix | \`O(n)/O(1)\` |
| Climbing Stairs | DP | Fibonacci table | \`O(n)/O(n)\` |
| Unique Paths | DP | Grid path-count recurrence | \`O(rows * cols)/O(rows * cols)\` |
| Minimum Path Sum | DP | Grid cost accumulation | \`O(rows * cols)/O(rows * cols)\` |
| House Robber | DP | Max of rob and skip per house | \`O(n)/O(n)\` |
| House Robber II | DP | Two linear DPs for the circle | \`O(n)/O(n)\` |
| House Robber III | DP | Return rob and skip totals per node | \`O(N)/O(H)\` |
| Decode Ways | DP | One-digit and two-digit transitions | \`O(n)/O(n)\` |
| Word Break | DP | \`dp[i]\` over split points | \`O(n^2)/O(n)\` |
| Partition Equal Subset Sum | DP | 0/1 knapsack to \`total / 2\` | \`O(n * target)/O(target)\` |
| Edit Distance | DP | Insert, delete, replace recurrence | \`O(m * n)/O(m * n)\` |
| Best Time to Buy and Sell Stock with Cooldown | DP | Hold, sold, rest state machine | \`O(n)/O(1)\` |
| Longest Increasing Path in a Matrix | DP | Memoized DFS from each cell | \`O(rows * cols)/O(rows * cols)\` |
| Single Number | Bit | XOR cancellation | \`O(n)/O(1)\` |
| Missing Number from 1 to n | Bit | XOR all expected and seen values | \`O(n)/O(1)\` |
| Number of 1 Bits | Bit | Strip the lowest set bit each step | \`O(p)/O(1)\` |
| Sum of Two Integers | Bit | XOR for sum and AND-shift for carry | \`O(w)/O(1)\` |

> [!NOTE]
> If two problems share nearly the same invariant, practice them back to back. \`Two Sum\` to \`3Sum\`, \`House Robber\` to \`House Robber II\`, and \`LCA of BST\` to \`LCA of Binary Tree\` are all really variant drills more than fresh patterns.

## Arrays

### Maximum Subarray

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int MaxSubArray(int[] nums)
    {
        int best = nums[0];
        int running = nums[0];

        for (int i = 1; i < nums.Length; i++)
        {
            running = Math.Max(nums[i], running + nums[i]);
            best = Math.Max(best, running);
        }

        return best;
    }
}
\`\`\`

### Best Time to Buy and Sell Stock

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int MaxProfit(int[] prices)
    {
        if (prices.Length == 0)
            return 0;

        int maxSell = prices[^1];
        int best = 0;

        for (int i = prices.Length - 2; i >= 0; i--)
        {
            best = Math.Max(best, maxSell - prices[i]);
            maxSell = Math.Max(maxSell, prices[i]);
        }

        return best;
    }
}
\`\`\`

### Majority Element

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int MajorityElement(int[] nums)
    {
        int candidate = 0;
        int count = 0;

        foreach (int num in nums)
        {
            if (count == 0)
                candidate = num;

            count += num == candidate ? 1 : -1;
        }

        return candidate;
    }
}
\`\`\`

### Product of Array Except Self

**Time:** \`O(n)\` | **Space:** \`O(n)\` for the prefix and suffix arrays

\`\`\`csharp
public class Solution
{
    public int[] ProductExceptSelf(int[] nums)
    {
        int n = nums.Length;
        int[] prefix = new int[n];
        int[] suffix = new int[n];
        int[] result = new int[n];

        prefix[0] = 1;
        for (int i = 1; i < n; i++)
            prefix[i] = prefix[i - 1] * nums[i - 1];

        suffix[n - 1] = 1;
        for (int i = n - 2; i >= 0; i--)
            suffix[i] = suffix[i + 1] * nums[i + 1];

        for (int i = 0; i < n; i++)
            result[i] = prefix[i] * suffix[i];

        return result;
    }
}
\`\`\`

### Maximum Product Subarray

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int MaxProduct(int[] nums)
    {
        int best = int.MinValue;
        int prefix = 1;
        int suffix = 1;
        int n = nums.Length;

        for (int i = 0; i < n; i++)
        {
            prefix = (prefix == 0 ? 1 : prefix) * nums[i];
            suffix = (suffix == 0 ? 1 : suffix) * nums[n - 1 - i];
            best = Math.Max(best, Math.Max(prefix, suffix));
        }

        return best;
    }
}
\`\`\`

### Find All Duplicates in an Array

**Time:** \`O(n)\` | **Space:** \`O(1)\` excluding the result

\`\`\`csharp
public class Solution
{
    public IList<int> FindDuplicates(int[] nums)
    {
        var result = new List<int>();

        for (int i = 0; i < nums.Length; i++)
        {
            int index = Math.Abs(nums[i]) - 1;
            if (nums[index] < 0)
                result.Add(index + 1);
            else
                nums[index] = -nums[index];
        }

        return result;
    }
}
\`\`\`

### Find the Duplicate Number

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int FindDuplicate(int[] nums)
    {
        int slow = nums[0];
        int fast = nums[0];

        do
        {
            slow = nums[slow];
            fast = nums[nums[fast]];
        }
        while (slow != fast);

        slow = nums[0];
        while (slow != fast)
        {
            slow = nums[slow];
            fast = nums[fast];
        }

        return slow;
    }
}
\`\`\`

### Sort Colors

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public void SortColors(int[] nums)
    {
        int low = 0;
        int mid = 0;
        int high = nums.Length - 1;

        while (mid <= high)
        {
            if (nums[mid] == 0)
            {
                Swap(nums, low++, mid++);
            }
            else if (nums[mid] == 1)
            {
                mid++;
            }
            else
            {
                Swap(nums, mid, high--);
            }
        }
    }

    private static void Swap(int[] nums, int i, int j)
    {
        (nums[i], nums[j]) = (nums[j], nums[i]);
    }
}
\`\`\`

### Rotate Array

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public void Rotate(int[] nums, int k)
    {
        if (nums.Length == 0)
            return;

        int n = nums.Length;
        k %= n;

        Reverse(nums, 0, n - 1);
        Reverse(nums, 0, k - 1);
        Reverse(nums, k, n - 1);
    }

    private static void Reverse(int[] nums, int left, int right)
    {
        while (left < right)
        {
            (nums[left], nums[right]) = (nums[right], nums[left]);
            left++;
            right--;
        }
    }
}
\`\`\`

### Next Permutation

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public void NextPermutation(int[] nums)
    {
        int pivot = nums.Length - 2;
        while (pivot >= 0 && nums[pivot] >= nums[pivot + 1])
            pivot--;

        if (pivot >= 0)
        {
            int successor = nums.Length - 1;
            while (nums[successor] <= nums[pivot])
                successor--;

            (nums[pivot], nums[successor]) = (nums[successor], nums[pivot]);
        }

        Reverse(nums, pivot + 1, nums.Length - 1);
    }

    private static void Reverse(int[] nums, int left, int right)
    {
        while (left < right)
        {
            (nums[left], nums[right]) = (nums[right], nums[left]);
            left++;
            right--;
        }
    }
}
\`\`\`

### Spiral Matrix

**Time:** \`O(rows * cols)\` | **Space:** \`O(1)\` excluding the result

\`\`\`csharp
public class Solution
{
    public IList<int> SpiralOrder(int[][] matrix)
    {
        var result = new List<int>();
        int top = 0;
        int bottom = matrix.Length - 1;
        int left = 0;
        int right = matrix[0].Length - 1;

        while (top <= bottom && left <= right)
        {
            for (int col = left; col <= right; col++)
                result.Add(matrix[top][col]);
            top++;

            for (int row = top; row <= bottom; row++)
                result.Add(matrix[row][right]);
            right--;

            if (top <= bottom)
            {
                for (int col = right; col >= left; col--)
                    result.Add(matrix[bottom][col]);
                bottom--;
            }

            if (left <= right)
            {
                for (int row = bottom; row >= top; row--)
                    result.Add(matrix[row][left]);
                left++;
            }
        }

        return result;
    }
}
\`\`\`

### Set Matrix Zeroes

**Time:** \`O(rows * cols)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public void SetZeroes(int[][] matrix)
    {
        int rows = matrix.Length;
        int cols = matrix[0].Length;
        bool zeroFirstRow = false;
        bool zeroFirstCol = false;

        for (int r = 0; r < rows; r++)
        {
            if (matrix[r][0] == 0)
                zeroFirstCol = true;
        }

        for (int c = 0; c < cols; c++)
        {
            if (matrix[0][c] == 0)
                zeroFirstRow = true;
        }

        for (int r = 1; r < rows; r++)
        {
            for (int c = 1; c < cols; c++)
            {
                if (matrix[r][c] == 0)
                {
                    matrix[r][0] = 0;
                    matrix[0][c] = 0;
                }
            }
        }

        for (int r = 1; r < rows; r++)
        {
            for (int c = 1; c < cols; c++)
            {
                if (matrix[r][0] == 0 || matrix[0][c] == 0)
                    matrix[r][c] = 0;
            }
        }

        if (zeroFirstRow)
        {
            for (int c = 0; c < cols; c++)
                matrix[0][c] = 0;
        }

        if (zeroFirstCol)
        {
            for (int r = 0; r < rows; r++)
                matrix[r][0] = 0;
        }
    }
}
\`\`\`

### Rotate Image

**Time:** \`O(n^2)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public void Rotate(int[][] matrix)
    {
        int n = matrix.Length;

        for (int r = 0; r < n; r++)
        {
            for (int c = r; c < n; c++)
                (matrix[r][c], matrix[c][r]) = (matrix[c][r], matrix[r][c]);
        }

        for (int r = 0; r < n; r++)
            Array.Reverse(matrix[r]);
    }
}
\`\`\`

## Strings

### Longest Common Prefix

**Time:** \`O(C)\` | **Space:** \`O(1)\` excluding the result, where \`C\` is the total number of characters examined

\`\`\`csharp
public class Solution
{
    public string LongestCommonPrefix(string[] strs)
    {
        if (strs.Length == 0)
            return string.Empty;

        for (int i = 0; i < strs[0].Length; i++)
        {
            char ch = strs[0][i];
            for (int j = 1; j < strs.Length; j++)
            {
                if (i == strs[j].Length || strs[j][i] != ch)
                    return strs[0].Substring(0, i);
            }
        }

        return strs[0];
    }
}
\`\`\`

### Encode and Decode Strings

**Time:** \`O(C)\` | **Space:** \`O(C)\` for the encoded or decoded result, where \`C\` is the total character count

\`\`\`csharp
public class Codec
{
    public string Encode(IList<string> strs)
    {
        var builder = new StringBuilder();

        foreach (string s in strs)
        {
            builder.Append(s.Length);
            builder.Append('#');
            builder.Append(s);
        }

        return builder.ToString();
    }

    public IList<string> Decode(string s)
    {
        var result = new List<string>();
        int i = 0;

        while (i < s.Length)
        {
            int hash = i;
            while (s[hash] != '#')
                hash++;

            int length = int.Parse(s.Substring(i, hash - i));
            int start = hash + 1;
            result.Add(s.Substring(start, length));
            i = start + length;
        }

        return result;
    }
}
\`\`\`

## Hashing

### Contains Duplicate

**Time:** \`O(n)\` average | **Space:** \`O(n)\`

\`\`\`csharp
public class Solution
{
    public bool ContainsDuplicate(int[] nums)
    {
        var seen = new HashSet<int>();

        foreach (int num in nums)
        {
            if (!seen.Add(num))
                return true;
        }

        return false;
    }
}
\`\`\`

### Valid Anagram

**Time:** \`O(n + m)\` | **Space:** \`O(k)\`, where \`k\` is the character-set size

\`\`\`csharp
public class Solution
{
    public bool IsAnagram(string s, string t)
    {
        if (s.Length != t.Length)
            return false;

        var count = new Dictionary<char, int>();
        foreach (char ch in s)
            count[ch] = count.GetValueOrDefault(ch) + 1;

        foreach (char ch in t)
        {
            if (!count.TryGetValue(ch, out int value))
                return false;

            if (value == 1)
                count.Remove(ch);
            else
                count[ch] = value - 1;
        }

        return count.Count == 0;
    }
}
\`\`\`

### Two Sum

**Time:** \`O(n)\` average | **Space:** \`O(n)\`

\`\`\`csharp
public class Solution
{
    public int[] TwoSum(int[] nums, int target)
    {
        var indexByValue = new Dictionary<int, int>();

        for (int i = 0; i < nums.Length; i++)
        {
            int need = target - nums[i];
            if (indexByValue.TryGetValue(need, out int j))
                return new[] { j, i };

            indexByValue[nums[i]] = i;
        }

        return Array.Empty<int>();
    }
}
\`\`\`

### Group Anagrams

**Time:** \`O(n * k log k)\` | **Space:** \`O(n * k)\`, where \`k\` is the maximum string length

\`\`\`csharp
public class Solution
{
    public IList<IList<string>> GroupAnagrams(string[] strs)
    {
        var groups = new Dictionary<string, List<string>>();

        foreach (string word in strs)
        {
            char[] chars = word.ToCharArray();
            Array.Sort(chars);
            string key = new string(chars);

            if (!groups.ContainsKey(key))
                groups[key] = new List<string>();

            groups[key].Add(word);
        }

        return groups.Values.Select(group => (IList<string>)group).ToList();
    }
}
\`\`\`

### Subarray Sum Equals K

**Time:** \`O(n)\` average | **Space:** \`O(n)\`

\`\`\`csharp
public class Solution
{
    public int SubarraySum(int[] nums, int k)
    {
        var prefixCount = new Dictionary<int, int> { [0] = 1 };
        int sum = 0;
        int count = 0;

        foreach (int num in nums)
        {
            sum += num;
            if (prefixCount.TryGetValue(sum - k, out int matches))
                count += matches;

            prefixCount[sum] = prefixCount.GetValueOrDefault(sum) + 1;
        }

        return count;
    }
}
\`\`\`

### Longest Consecutive Sequence

**Time:** \`O(n)\` average | **Space:** \`O(n)\`

\`\`\`csharp
public class Solution
{
    public int LongestConsecutive(int[] nums)
    {
        var values = new HashSet<int>(nums);
        int best = 0;

        foreach (int num in values)
        {
            if (values.Contains(num - 1))
                continue;

            int length = 1;
            while (values.Contains(num + length))
                length++;

            best = Math.Max(best, length);
        }

        return best;
    }
}
\`\`\`

### 3Sum

**Time:** \`O(n^2)\` | **Space:** \`O(n)\` with a hash-based Two Sum, excluding the result

\`\`\`csharp
public class Solution
{
    public IList<IList<int>> ThreeSum(int[] nums)
    {
        Array.Sort(nums);
        var result = new List<IList<int>>();

        for (int i = 0; i < nums.Length - 2; i++)
        {
            if (i > 0 && nums[i] == nums[i - 1])
                continue;

            var seen = new HashSet<int>();
            for (int j = i + 1; j < nums.Length; j++)
            {
                int need = -nums[i] - nums[j];
                if (seen.Contains(need))
                {
                    result.Add(new List<int> { nums[i], need, nums[j] });
                    while (j + 1 < nums.Length && nums[j] == nums[j + 1])
                        j++;
                }
                else
                {
                    seen.Add(nums[j]);
                }
            }
        }

        return result;
    }
}
\`\`\`\r

## 2 Pointers

### Valid Palindrome

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public bool IsPalindrome(string s)
    {
        int left = 0;
        int right = s.Length - 1;

        while (left < right)
        {
            while (left < right && !char.IsLetterOrDigit(s[left]))
                left++;
            while (left < right && !char.IsLetterOrDigit(s[right]))
                right--;

            if (char.ToLowerInvariant(s[left]) != char.ToLowerInvariant(s[right]))
                return false;

            left++;
            right--;
        }

        return true;
    }
}
\`\`\`

### Remove Duplicates from Sorted Array

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int RemoveDuplicates(int[] nums)
    {
        if (nums.Length == 0)
            return 0;

        int slow = 1;
        for (int fast = 1; fast < nums.Length; fast++)
        {
            if (nums[fast] != nums[fast - 1])
                nums[slow++] = nums[fast];
        }

        return slow;
    }
}
\`\`\`

### Two Sum II on a Sorted Array

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int[] TwoSum(int[] numbers, int target)
    {
        int left = 0;
        int right = numbers.Length - 1;

        while (left < right)
        {
            int sum = numbers[left] + numbers[right];
            if (sum == target)
                return new[] { left + 1, right + 1 };

            if (sum < target)
                left++;
            else
                right--;
        }

        return Array.Empty<int>();
    }
}
\`\`\`

### Container With Most Water

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int MaxArea(int[] height)
    {
        int left = 0;
        int right = height.Length - 1;
        int best = 0;

        while (left < right)
        {
            int width = right - left;
            int area = width * Math.Min(height[left], height[right]);
            best = Math.Max(best, area);

            if (height[left] < height[right])
                left++;
            else
                right--;
        }

        return best;
    }
}
\`\`\`

### Trapping Rain Water

**Two pointers:** Time \`O(n)\`, Space \`O(1)\` | **Prefix/suffix arrays:** Time \`O(n)\`, Space \`O(n)\`

**Two pointers**

\`\`\`csharp
public class Solution
{
    public int Trap(int[] height)
    {
        int left = 0;
        int right = height.Length - 1;
        int maxLeft = 0;
        int maxRight = 0;
        int water = 0;

        while (left < right)
        {
            if (height[left] < height[right])
            {
                maxLeft = Math.Max(maxLeft, height[left]);
                water += maxLeft - height[left];
                left++;
            }
            else
            {
                maxRight = Math.Max(maxRight, height[right]);
                water += maxRight - height[right];
                right--;
            }
        }

        return water;
    }
}
\`\`\`

**Prefix and suffix maxima**

\`\`\`csharp
public class Solution
{
    public int Trap(int[] height)
    {
        if (height.Length == 0)
            return 0;

        int n = height.Length;
        int[] prefixMax = new int[n];
        int[] suffixMax = new int[n];

        prefixMax[0] = height[0];
        for (int i = 1; i < n; i++)
            prefixMax[i] = Math.Max(prefixMax[i - 1], height[i]);

        suffixMax[n - 1] = height[n - 1];
        for (int i = n - 2; i >= 0; i--)
            suffixMax[i] = Math.Max(suffixMax[i + 1], height[i]);

        int water = 0;
        for (int i = 0; i < n; i++)
            water += Math.Min(prefixMax[i], suffixMax[i]) - height[i];

        return water;
    }
}
\`\`\`

> [!WARNING]
> In the two-pointer version, update \`maxLeft\` or \`maxRight\` before adding trapped water. Doing the subtraction first is the classic bug that creates negative water on the first few bars.

### Palindromic Substrings

**Expand centers:** Time \`O(n^2)\`, Space \`O(1)\` | **DP:** Time \`O(n^2)\`, Space \`O(n^2)\`

**Expand around every center**

\`\`\`csharp
public class Solution
{
    public int CountSubstrings(string s)
    {
        int count = 0;

        for (int center = 0; center < s.Length; center++)
        {
            count += Expand(s, center, center);
            count += Expand(s, center, center + 1);
        }

        return count;
    }

    private static int Expand(string s, int left, int right)
    {
        int count = 0;
        while (left >= 0 && right < s.Length && s[left] == s[right])
        {
            count++;
            left--;
            right++;
        }

        return count;
    }
}
\`\`\`

**DP table**

\`\`\`csharp
public class Solution
{
    public int CountSubstrings(string s)
    {
        int n = s.Length;
        bool[,] dp = new bool[n, n];
        int count = 0;

        for (int length = 1; length <= n; length++)
        {
            for (int left = 0; left + length - 1 < n; left++)
            {
                int right = left + length - 1;
                if (s[left] == s[right] && (length <= 2 || dp[left + 1, right - 1]))
                {
                    dp[left, right] = true;
                    count++;
                }
            }
        }

        return count;
    }
}
\`\`\`

## Sliding Window

### Longest Substring Without Repeating Characters

**Time:** \`O(n)\` | **Space:** \`O(k)\`, where \`k\` is the character-set size

**HashSet window**

\`\`\`csharp
public class Solution
{
    public int LengthOfLongestSubstring(string s)
    {
        var window = new HashSet<char>();
        int left = 0;
        int best = 0;

        for (int right = 0; right < s.Length; right++)
        {
            while (!window.Add(s[right]))
                window.Remove(s[left++]);

            best = Math.Max(best, right - left + 1);
        }

        return best;
    }
}
\`\`\`

**Last-seen index optimization**

\`\`\`csharp
public class Solution
{
    public int LengthOfLongestSubstring(string s)
    {
        var lastSeen = new Dictionary<char, int>();
        int left = 0;
        int best = 0;

        for (int right = 0; right < s.Length; right++)
        {
            if (lastSeen.TryGetValue(s[right], out int previous))
                left = Math.Max(left, previous + 1);

            lastSeen[s[right]] = right;
            best = Math.Max(best, right - left + 1);
        }

        return best;
    }
}
\`\`\`

### Longest Repeating Character Replacement

**Time:** \`O(n)\` | **Space:** \`O(k)\`, where \`k\` is the character-set size

\`\`\`csharp
public class Solution
{
    public int CharacterReplacement(string s, int k)
    {
        int[] frequency = new int[26];
        int left = 0;
        int maxFrequency = 0;
        int best = 0;

        for (int right = 0; right < s.Length; right++)
        {
            maxFrequency = Math.Max(maxFrequency, ++frequency[s[right] - 'A']);

            while (right - left + 1 - maxFrequency > k)
            {
                frequency[s[left] - 'A']--;
                left++;
            }

            best = Math.Max(best, right - left + 1);
        }

        return best;
    }
}
\`\`\`

### Minimum Window Substring

**Time:** \`O(|s| + |t|)\` | **Space:** \`O(k)\`, where \`k\` is the character-set size

\`\`\`csharp
public class Solution
{
    public string MinWindow(string s, string t)
    {
        if (s.Length < t.Length)
            return string.Empty;

        var need = new Dictionary<char, int>();
        foreach (char ch in t)
            need[ch] = need.GetValueOrDefault(ch) + 1;

        var window = new Dictionary<char, int>();
        int required = need.Count;
        int formed = 0;
        int left = 0;
        int bestStart = 0;
        int bestLength = int.MaxValue;

        for (int right = 0; right < s.Length; right++)
        {
            char ch = s[right];
            window[ch] = window.GetValueOrDefault(ch) + 1;

            if (need.TryGetValue(ch, out int needCount) && window[ch] == needCount)
                formed++;

            while (formed == required)
            {
                if (right - left + 1 < bestLength)
                {
                    bestLength = right - left + 1;
                    bestStart = left;
                }

                char leftChar = s[left++];
                window[leftChar]--;
                if (need.TryGetValue(leftChar, out int targetCount) && window[leftChar] < targetCount)
                    formed--;
            }
        }

        return bestLength == int.MaxValue ? string.Empty : s.Substring(bestStart, bestLength);
    }
}
\`\`\`

### Subarray Product Less Than K

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int NumSubarrayProductLessThanK(int[] nums, int k)
    {
        if (k <= 1)
            return 0;

        int left = 0;
        long product = 1;
        int count = 0;

        for (int right = 0; right < nums.Length; right++)
        {
            product *= nums[right];
            while (product >= k)
                product /= nums[left++];

            count += right - left + 1;
        }

        return count;
    }
}
\`\`\`

## Stack and Queue

### Valid Parentheses

**Time:** \`O(n)\` | **Space:** \`O(n)\`

\`\`\`csharp
public class Solution
{
    public bool IsValid(string s)
    {
        var stack = new Stack<char>();

        foreach (char ch in s)
        {
            if (ch == '(')
                stack.Push(')');
            else if (ch == '[')
                stack.Push(']');
            else if (ch == '{')
                stack.Push('}');
            else if (stack.Count == 0 || stack.Pop() != ch)
                return false;
        }

        return stack.Count == 0;
    }
}
\`\`\`

### Evaluate Reverse Polish Notation

**Time:** \`O(n)\` | **Space:** \`O(n)\`

\`\`\`csharp
public class Solution
{
    public int EvalRPN(string[] tokens)
    {
        var stack = new Stack<int>();

        foreach (string token in tokens)
        {
            switch (token)
            {
                case "+":
                {
                    int b = stack.Pop();
                    int a = stack.Pop();
                    stack.Push(a + b);
                    break;
                }
                case "-":
                {
                    int b = stack.Pop();
                    int a = stack.Pop();
                    stack.Push(a - b);
                    break;
                }
                case "*":
                {
                    int b = stack.Pop();
                    int a = stack.Pop();
                    stack.Push(a * b);
                    break;
                }
                case "/":
                {
                    int b = stack.Pop();
                    int a = stack.Pop();
                    stack.Push(a / b);
                    break;
                }
                default:
                    stack.Push(int.Parse(token));
                    break;
            }
        }

        return stack.Peek();
    }
}
\`\`\`

### Min Stack

**Time:** \`O(1)\` per operation | **Space:** \`O(n)\`

\`\`\`csharp
public class MinStack
{
    private readonly Stack<int> values = new();
    private readonly Stack<int> minimums = new();

    public void Push(int val)
    {
        values.Push(val);
        if (minimums.Count == 0)
            minimums.Push(val);
        else
            minimums.Push(Math.Min(val, minimums.Peek()));
    }

    public void Pop()
    {
        values.Pop();
        minimums.Pop();
    }

    public int Top() => values.Peek();

    public int GetMin() => minimums.Peek();
}
\`\`\`

### Implement Queue Using Two Stacks

**Time:** Enqueue \`O(1)\`, dequeue \`O(1)\` amortized | **Space:** \`O(n)\`

\`\`\`csharp
public class MyQueue
{
    private readonly Stack<int> input = new();
    private readonly Stack<int> output = new();

    public void Push(int x) => input.Push(x);

    public int Pop()
    {
        MoveIfNeeded();
        return output.Pop();
    }

    public int Peek()
    {
        MoveIfNeeded();
        return output.Peek();
    }

    public bool Empty() => input.Count == 0 && output.Count == 0;

    private void MoveIfNeeded()
    {
        if (output.Count > 0)
            return;

        while (input.Count > 0)
            output.Push(input.Pop());
    }
}
\`\`\`

### Implement Stack Using One Queue

**Time:** Push \`O(n)\`, pop and peek \`O(1)\` | **Space:** \`O(n)\`

\`\`\`csharp
public class MyStack
{
    private readonly Queue<int> queue = new();

    public void Push(int x)
    {
        queue.Enqueue(x);
        int rotations = queue.Count - 1;
        for (int i = 0; i < rotations; i++)
            queue.Enqueue(queue.Dequeue());
    }

    public int Pop() => queue.Dequeue();

    public int Top() => queue.Peek();

    public bool Empty() => queue.Count == 0;
}
\`\`\`

### Sliding Window Maximum

**Deque:** Time \`O(n)\`, Space \`O(k)\` | **Max heap:** Time \`O(n log n)\`, Space \`O(n)\`

**Monotonic deque**

\`\`\`csharp
public class Solution
{
    public int[] MaxSlidingWindow(int[] nums, int k)
    {
        if (nums.Length == 0 || k == 0)
            return Array.Empty<int>();

        var deque = new LinkedList<int>();
        var result = new List<int>();

        for (int i = 0; i < nums.Length; i++)
        {
            while (deque.Count > 0 && deque.First!.Value <= i - k)
                deque.RemoveFirst();

            while (deque.Count > 0 && nums[deque.Last!.Value] <= nums[i])
                deque.RemoveLast();

            deque.AddLast(i);
            if (i >= k - 1)
                result.Add(nums[deque.First!.Value]);
        }

        return result.ToArray();
    }
}
\`\`\`

**Max heap**

\`\`\`csharp
public class Solution
{
    public int[] MaxSlidingWindow(int[] nums, int k)
    {
        if (nums.Length == 0 || k == 0)
            return Array.Empty<int>();

        var heap = new PriorityQueue<(int value, int index), int>();
        int[] result = new int[nums.Length - k + 1];

        for (int i = 0; i < nums.Length; i++)
        {
            heap.Enqueue((nums[i], i), -nums[i]);

            while (heap.Peek().index <= i - k)
                heap.Dequeue();

            if (i >= k - 1)
                result[i - k + 1] = heap.Peek().value;
        }

        return result;
    }
}
\`\`\`

### Next Greater Element II

**Time:** \`O(n)\` | **Space:** \`O(n)\`

\`\`\`csharp
public class Solution
{
    public int[] NextGreaterElements(int[] nums)
    {
        int n = nums.Length;
        int[] result = Enumerable.Repeat(-1, n).ToArray();
        var stack = new Stack<int>();

        for (int i = 0; i < 2 * n; i++)
        {
            int index = i % n;
            while (stack.Count > 0 && nums[stack.Peek()] < nums[index])
                result[stack.Pop()] = nums[index];

            if (i < n)
                stack.Push(index);
        }

        return result;
    }
}
\`\`\`

### Remove K Digits

**Time:** \`O(n)\` | **Space:** \`O(n)\`

\`\`\`csharp
public class Solution
{
    public string RemoveKdigits(string num, int k)
    {
        var stack = new Stack<char>();

        foreach (char digit in num)
        {
            while (k > 0 && stack.Count > 0 && stack.Peek() > digit)
            {
                stack.Pop();
                k--;
            }

            stack.Push(digit);
        }

        while (k > 0 && stack.Count > 0)
        {
            stack.Pop();
            k--;
        }

        char[] chars = stack.Reverse().ToArray();
        int start = 0;
        while (start < chars.Length && chars[start] == '0')
            start++;

        string result = new string(chars, start, chars.Length - start);
        return result.Length == 0 ? "0" : result;
    }
}
\`\`\`

### Largest Rectangle in Histogram

**Time:** \`O(n)\` | **Space:** \`O(n)\`

\`\`\`csharp
public class Solution
{
    public int LargestRectangleArea(int[] heights)
    {
        int n = heights.Length;
        int[] leftSmaller = new int[n];
        int[] rightSmaller = new int[n];
        var stack = new Stack<int>();

        for (int i = 0; i < n; i++)
        {
            while (stack.Count > 0 && heights[stack.Peek()] >= heights[i])
                stack.Pop();

            leftSmaller[i] = stack.Count == 0 ? -1 : stack.Peek();
            stack.Push(i);
        }

        stack.Clear();

        for (int i = n - 1; i >= 0; i--)
        {
            while (stack.Count > 0 && heights[stack.Peek()] >= heights[i])
                stack.Pop();

            rightSmaller[i] = stack.Count == 0 ? n : stack.Peek();
            stack.Push(i);
        }

        int best = 0;
        for (int i = 0; i < n; i++)
        {
            int width = rightSmaller[i] - leftSmaller[i] - 1;
            best = Math.Max(best, heights[i] * width);
        }

        return best;
    }
}
\`\`\`

## Linked List

### Merge Two Sorted Lists

**Time:** \`O(n + m)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public ListNode MergeTwoLists(ListNode list1, ListNode list2)
    {
        var dummy = new ListNode();
        ListNode tail = dummy;

        while (list1 != null && list2 != null)
        {
            if (list1.val <= list2.val)
            {
                tail.next = list1;
                list1 = list1.next;
            }
            else
            {
                tail.next = list2;
                list2 = list2.next;
            }

            tail = tail.next;
        }

        tail.next = list1 ?? list2;
        return dummy.next;
    }
}
\`\`\`

### Remove Nth Node From End of List

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public ListNode RemoveNthFromEnd(ListNode head, int n)
    {
        int length = 0;
        for (ListNode node = head; node != null; node = node.next)
            length++;

        var dummy = new ListNode(0, head);
        ListNode current = dummy;

        for (int i = 0; i < length - n; i++)
            current = current.next;

        current.next = current.next.next;
        return dummy.next;
    }
}
\`\`\`

### Palindrome Linked List

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public bool IsPalindrome(ListNode head)
    {
        if (head == null || head.next == null)
            return true;

        ListNode slow = head;
        ListNode fast = head;
        while (fast != null && fast.next != null)
        {
            slow = slow.next;
            fast = fast.next.next;
        }

        if (fast != null)
            slow = slow.next;

        ListNode secondHalf = Reverse(slow);
        ListNode firstHalf = head;

        while (secondHalf != null)
        {
            if (firstHalf.val != secondHalf.val)
                return false;

            firstHalf = firstHalf.next;
            secondHalf = secondHalf.next;
        }

        return true;
    }

    private static ListNode Reverse(ListNode head)
    {
        ListNode prev = null;
        while (head != null)
        {
            ListNode next = head.next;
            head.next = prev;
            prev = head;
            head = next;
        }

        return prev;
    }
}
\`\`\`

### Reorder List

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public void ReorderList(ListNode head)
    {
        if (head == null || head.next == null)
            return;

        ListNode slow = head;
        ListNode fast = head;
        while (fast.next != null && fast.next.next != null)
        {
            slow = slow.next;
            fast = fast.next.next;
        }

        ListNode second = Reverse(slow.next);
        slow.next = null;
        ListNode first = head;

        while (second != null)
        {
            ListNode firstNext = first.next;
            ListNode secondNext = second.next;

            first.next = second;
            second.next = firstNext;

            first = firstNext;
            second = secondNext;
        }
    }

    private static ListNode Reverse(ListNode head)
    {
        ListNode prev = null;
        while (head != null)
        {
            ListNode next = head.next;
            head.next = prev;
            prev = head;
            head = next;
        }

        return prev;
    }
}
\`\`\`

### Copy List with Random Pointer

**Dictionary:** Time \`O(n)\`, Space \`O(n)\` | **Interleaving:** Time \`O(n)\`, Space \`O(1)\`

**Dictionary copy**

\`\`\`csharp
public class Solution
{
    public Node CopyRandomList(Node head)
    {
        if (head == null)
            return null;

        var copies = new Dictionary<Node, Node>();
        for (Node node = head; node != null; node = node.next)
            copies[node] = new Node(node.val);

        for (Node node = head; node != null; node = node.next)
        {
            copies[node].next = node.next == null ? null : copies[node.next];
            copies[node].random = node.random == null ? null : copies[node.random];
        }

        return copies[head];
    }
}
\`\`\`

**Interleaving nodes in place**

\`\`\`csharp
public class Solution
{
    public Node CopyRandomList(Node head)
    {
        if (head == null)
            return null;

        for (Node node = head; node != null; node = node.next.next)
        {
            Node copy = new Node(node.val);
            copy.next = node.next;
            node.next = copy;
        }

        for (Node node = head; node != null; node = node.next.next)
        {
            if (node.random != null)
                node.next.random = node.random.next;
        }

        Node dummy = new Node(0);
        Node copyTail = dummy;
        Node current = head;

        while (current != null)
        {
            Node copy = current.next;
            current.next = copy.next;
            copyTail.next = copy;
            copyTail = copy;
            current = current.next;
        }

        return dummy.next;
    }
}
\`\`\`

### Merge K Sorted Lists

**Time:** \`O(N log k)\` | **Space:** \`O(k)\`, where \`N\` is the total node count

\`\`\`csharp
public class Solution
{
    public ListNode MergeKLists(ListNode[] lists)
    {
        var heap = new PriorityQueue<ListNode, int>();
        foreach (ListNode node in lists)
        {
            if (node != null)
                heap.Enqueue(node, node.val);
        }

        var dummy = new ListNode();
        ListNode tail = dummy;

        while (heap.Count > 0)
        {
            ListNode node = heap.Dequeue();
            tail.next = node;
            tail = tail.next;

            if (node.next != null)
                heap.Enqueue(node.next, node.next.val);
        }

        return dummy.next;
    }
}
\`\`\`

### LRU Cache

**Time:** \`O(1)\` average for \`Get\` and \`Put\` | **Space:** \`O(capacity)\`

\`\`\`csharp
public class LRUCache
{
    private sealed class DllNode
    {
        public int Key;
        public int Value;
        public DllNode Prev;
        public DllNode Next;

        public DllNode(int key = 0, int value = 0)
        {
            Key = key;
            Value = value;
        }
    }

    private readonly int capacity;
    private readonly Dictionary<int, DllNode> map = new();
    private readonly DllNode head = new();
    private readonly DllNode tail = new();

    public LRUCache(int capacity)
    {
        this.capacity = capacity;
        head.Next = tail;
        tail.Prev = head;
    }

    public int Get(int key)
    {
        if (!map.TryGetValue(key, out DllNode node))
            return -1;

        MoveToFront(node);
        return node.Value;
    }

    public void Put(int key, int value)
    {
        if (map.TryGetValue(key, out DllNode node))
        {
            node.Value = value;
            MoveToFront(node);
            return;
        }

        DllNode fresh = new(key, value);
        map[key] = fresh;
        AddAfterHead(fresh);

        if (map.Count > capacity)
        {
            DllNode lru = tail.Prev;
            Remove(lru);
            map.Remove(lru.Key);
        }
    }

    private void MoveToFront(DllNode node)
    {
        Remove(node);
        AddAfterHead(node);
    }

    private void AddAfterHead(DllNode node)
    {
        node.Next = head.Next;
        node.Prev = head;
        head.Next.Prev = node;
        head.Next = node;
    }

    private void Remove(DllNode node)
    {
        node.Prev.Next = node.Next;
        node.Next.Prev = node.Prev;
    }
}
\`\`\`

## Binary Search

### Find Minimum in Rotated Sorted Array

**Time:** \`O(log n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int FindMin(int[] nums)
    {
        int left = 0;
        int right = nums.Length - 1;

        while (left < right)
        {
            int mid = left + (right - left) / 2;
            if (nums[mid] > nums[right])
                left = mid + 1;
            else
                right = mid;
        }

        return nums[right];
    }
}
\`\`\`

### Search in Rotated Sorted Array

**Time:** \`O(log n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int Search(int[] nums, int target)
    {
        int left = 0;
        int right = nums.Length - 1;

        while (left <= right)
        {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target)
                return mid;

            if (nums[left] <= nums[mid])
            {
                if (nums[left] <= target && target < nums[mid])
                    right = mid - 1;
                else
                    left = mid + 1;
            }
            else
            {
                if (nums[mid] < target && target <= nums[right])
                    left = mid + 1;
                else
                    right = mid - 1;
            }
        }

        return -1;
    }
}
\`\`\`

### Koko Eating Bananas

**Brute force:** Time \`O(N * max(piles))\`, Space \`O(1)\` | **Binary search on answer:** Time \`O(N log(max(piles)))\`, Space \`O(1)\`

**Example:** \`piles = [3, 6, 7, 11], h = 8\` → \`4\`

**Brute force**

\`\`\`csharp
public class Solution
{
    public int MinEatingSpeedBruteForce(int[] piles, int h)
    {
        int maxPile = piles.Max();

        for (int speed = 1; speed <= maxPile; speed++)
        {
            if (HoursNeeded(piles, speed) <= h)
                return speed;
        }

        return maxPile;
    }

    private static long HoursNeeded(int[] piles, int speed)
    {
        long hours = 0;
        foreach (int pile in piles)
            hours += (pile + speed - 1) / speed;

        return hours;
    }
}
\`\`\`

**Binary search on the answer**

\`\`\`csharp
public class Solution
{
    public int MinEatingSpeed(int[] piles, int h)
    {
        int left = 1;
        int right = piles.Max();

        while (left <= right)
        {
            int speed = left + (right - left) / 2;
            long hours = HoursNeeded(piles, speed);

            if (hours <= h)
                right = speed - 1;
            else
                left = speed + 1;
        }

        return left;
    }

    private static long HoursNeeded(int[] piles, int speed)
    {
        long hours = 0;
        foreach (int pile in piles)
            hours += (pile + speed - 1) / speed;

        return hours;
    }
}
\`\`\`\r

## Heap

### Top K Frequent Elements

**Min heap:** Time \`O(n log k)\`, Space \`O(n)\` | **Buckets:** Time \`O(n)\`, Space \`O(n)\`

**Min-heap of size \`k\`**

\`\`\`csharp
public class Solution
{
    public int[] TopKFrequent(int[] nums, int k)
    {
        var frequency = new Dictionary<int, int>();
        foreach (int num in nums)
            frequency[num] = frequency.GetValueOrDefault(num) + 1;

        var heap = new PriorityQueue<int, int>();
        foreach (var entry in frequency)
        {
            heap.Enqueue(entry.Key, entry.Value);
            if (heap.Count > k)
                heap.Dequeue();
        }

        int[] result = new int[k];
        for (int i = k - 1; i >= 0; i--)
            result[i] = heap.Dequeue();

        return result;
    }
}
\`\`\`

**Bucket sort by frequency**

\`\`\`csharp
public class Solution
{
    public int[] TopKFrequent(int[] nums, int k)
    {
        var frequency = new Dictionary<int, int>();
        foreach (int num in nums)
            frequency[num] = frequency.GetValueOrDefault(num) + 1;

        var buckets = new List<int>[nums.Length + 1];
        foreach (var entry in frequency)
        {
            buckets[entry.Value] ??= new List<int>();
            buckets[entry.Value].Add(entry.Key);
        }

        var result = new List<int>();
        for (int freq = buckets.Length - 1; freq >= 0 && result.Count < k; freq--)
        {
            if (buckets[freq] == null)
                continue;

            foreach (int num in buckets[freq])
            {
                result.Add(num);
                if (result.Count == k)
                    break;
            }
        }

        return result.ToArray();
    }
}
\`\`\`

### Find Median from Data Stream

**Time:** \`O(log n)\` per insertion and \`O(1)\` per median lookup | **Space:** \`O(n)\`

\`\`\`csharp
public class MedianFinder
{
    private readonly PriorityQueue<int, int> lower = new();
    private readonly PriorityQueue<int, int> upper = new();

    public void AddNum(int num)
    {
        if (lower.Count == 0 || num <= lower.Peek())
            lower.Enqueue(num, -num);
        else
            upper.Enqueue(num, num);

        if (lower.Count > upper.Count + 1)
        {
            int moved = lower.Dequeue();
            upper.Enqueue(moved, moved);
        }
        else if (upper.Count > lower.Count)
        {
            int moved = upper.Dequeue();
            lower.Enqueue(moved, -moved);
        }
    }

    public double FindMedian()
    {
        if (lower.Count == upper.Count)
            return (lower.Peek() + upper.Peek()) / 2.0;

        return lower.Peek();
    }
}
\`\`\`

### Task Scheduler

**Heap simulation:** Time \`O(T log k)\`, Space \`O(k)\` | **Counting formula:** Time \`O(T + k)\`, Space \`O(k)\`

**Heap simulation with a cooldown queue**

\`\`\`csharp
public class Solution
{
    public int LeastIntervalSimulated(char[] tasks, int cooldown)
    {
        var counts = new Dictionary<char, int>();
        foreach (char task in tasks)
            counts[task] = counts.GetValueOrDefault(task) + 1;

        var heap = new PriorityQueue<int, int>();
        foreach (int count in counts.Values)
            heap.Enqueue(count, -count);

        var cooling = new Queue<(int remaining, int availableAt)>();
        int time = 0;

        while (heap.Count > 0 || cooling.Count > 0)
        {
            time++;

            while (cooling.Count > 0 && cooling.Peek().availableAt <= time)
            {
                var ready = cooling.Dequeue();
                heap.Enqueue(ready.remaining, -ready.remaining);
            }

            if (heap.Count == 0)
                continue;

            int remaining = heap.Dequeue() - 1;
            if (remaining > 0)
                cooling.Enqueue((remaining, time + cooldown + 1));
        }

        return time;
    }
}
\`\`\`

**Counting formula**

\`\`\`csharp
public class Solution
{
    public int LeastInterval(char[] tasks, int cooldown)
    {
        int[] frequency = new int[26];
        foreach (char task in tasks)
            frequency[task - 'A']++;

        int maxFrequency = frequency.Max();
        int countMax = frequency.Count(count => count == maxFrequency);

        return Math.Max(tasks.Length, (maxFrequency - 1) * (cooldown + 1) + countMax);
    }
}
\`\`\`

## Tree

### Same Tree

**Time:** \`O(n)\` | **Space:** \`O(h)\` recursion stack, where \`n\` is the number of compared nodes

\`\`\`csharp
public class Solution
{
    public bool IsSameTree(TreeNode p, TreeNode q)
    {
        if (p == null || q == null)
            return p == q;

        return p.val == q.val
            && IsSameTree(p.left, q.left)
            && IsSameTree(p.right, q.right);
    }
}
\`\`\`

### Invert Binary Tree

**Time:** \`O(n)\` | **Space:** \`O(h)\` recursion stack

\`\`\`csharp
public class Solution
{
    public TreeNode InvertTree(TreeNode root)
    {
        if (root == null)
            return null;

        (root.left, root.right) = (root.right, root.left);
        InvertTree(root.left);
        InvertTree(root.right);
        return root;
    }
}
\`\`\`

### Path Sum

**Time:** \`O(n)\` | **Space:** \`O(h)\` recursion stack

\`\`\`csharp
public class Solution
{
    public bool HasPathSum(TreeNode root, int targetSum)
    {
        if (root == null)
            return false;

        if (root.left == null && root.right == null)
            return targetSum == root.val;

        int remaining = targetSum - root.val;
        return HasPathSum(root.left, remaining) || HasPathSum(root.right, remaining);
    }
}
\`\`\`

### Validate Binary Search Tree

**Time:** \`O(n)\` | **Space:** \`O(h)\` recursion stack

\`\`\`csharp
public class Solution
{
    public bool IsValidBST(TreeNode root)
    {
        return IsValidRange(root, long.MinValue, long.MaxValue);
    }

    private static bool IsValidRange(TreeNode node, long min, long max)
    {
        if (node == null)
            return true;
        if (node.val <= min || node.val >= max)
            return false;

        return IsValidRange(node.left, min, node.val)
            && IsValidRange(node.right, node.val, max);
    }
}
\`\`\`

### Kth Smallest Element in a BST

**Time:** \`O(h + k)\` | **Space:** \`O(h)\`

\`\`\`csharp
public class Solution
{
    public int KthSmallest(TreeNode root, int k)
    {
        var stack = new Stack<TreeNode>();
        TreeNode current = root;

        while (current != null || stack.Count > 0)
        {
            while (current != null)
            {
                stack.Push(current);
                current = current.left;
            }

            current = stack.Pop();
            if (--k == 0)
                return current.val;

            current = current.right;
        }

        throw new InvalidOperationException("k is out of range.");
    }
}
\`\`\`

### Lowest Common Ancestor of a BST

**Time:** \`O(h)\` | **Space:** \`O(h)\` recursive or \`O(1)\` iterative

**Iterative**

\`\`\`csharp
public class Solution
{
    public TreeNode LowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q)
    {
        TreeNode current = root;

        while (current != null)
        {
            if (p.val < current.val && q.val < current.val)
                current = current.left;
            else if (p.val > current.val && q.val > current.val)
                current = current.right;
            else
                return current;
        }

        return null;
    }
}
\`\`\`

**Recursive**

\`\`\`csharp
public class Solution
{
    public TreeNode LowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q)
    {
        if (root == null)
            return null;
        if (p.val < root.val && q.val < root.val)
            return LowestCommonAncestor(root.left, p, q);
        if (p.val > root.val && q.val > root.val)
            return LowestCommonAncestor(root.right, p, q);
        return root;
    }
}
\`\`\`

### Lowest Common Ancestor of a Binary Tree

**Time:** \`O(n)\` | **Space:** \`O(h)\` recursion stack

\`\`\`csharp
public class Solution
{
    public TreeNode LowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q)
    {
        if (root == null || root == p || root == q)
            return root;

        TreeNode left = LowestCommonAncestor(root.left, p, q);
        TreeNode right = LowestCommonAncestor(root.right, p, q);

        if (left != null && right != null)
            return root;

        return left ?? right;
    }
}
\`\`\`

### Subtree of Another Tree

**Time:** \`O(N * M)\` worst case | **Space:** \`O(H + h)\` recursion stack

\`\`\`csharp
public class Solution
{
    public bool IsSubtree(TreeNode root, TreeNode subRoot)
    {
        if (subRoot == null)
            return true;
        if (root == null)
            return false;

        return IsSame(root, subRoot)
            || IsSubtree(root.left, subRoot)
            || IsSubtree(root.right, subRoot);
    }

    private static bool IsSame(TreeNode a, TreeNode b)
    {
        if (a == null || b == null)
            return a == b;

        return a.val == b.val
            && IsSame(a.left, b.left)
            && IsSame(a.right, b.right);
    }
}
\`\`\`

### Construct Binary Tree from Preorder and Inorder Traversal

**Time:** \`O(n)\` | **Space:** \`O(n)\` for the index map and recursion stack

\`\`\`csharp
public class Solution
{
    private int preorderIndex;
    private Dictionary<int, int> inorderIndex;

    public TreeNode BuildTree(int[] preorder, int[] inorder)
    {
        inorderIndex = new Dictionary<int, int>();
        for (int i = 0; i < inorder.Length; i++)
            inorderIndex[inorder[i]] = i;

        preorderIndex = 0;
        return Build(preorder, 0, inorder.Length - 1);
    }

    private TreeNode Build(int[] preorder, int left, int right)
    {
        if (left > right)
            return null;

        int rootValue = preorder[preorderIndex++];
        TreeNode root = new(rootValue);
        int mid = inorderIndex[rootValue];

        root.left = Build(preorder, left, mid - 1);
        root.right = Build(preorder, mid + 1, right);
        return root;
    }
}
\`\`\`

### Serialize and Deserialize Binary Tree

**Time:** \`O(n)\` | **Space:** \`O(n)\` for serialized data and deserialization tokens, plus \`O(h)\` recursion stack

\`\`\`csharp
public class Codec
{
    public string Serialize(TreeNode root)
    {
        var values = new List<string>();
        Dfs(root, values);
        return string.Join(",", values);
    }

    public TreeNode Deserialize(string data)
    {
        var queue = new Queue<string>(data.Split(','));
        return Build(queue);
    }

    private static void Dfs(TreeNode node, IList<string> values)
    {
        if (node == null)
        {
            values.Add("null");
            return;
        }

        values.Add(node.val.ToString());
        Dfs(node.left, values);
        Dfs(node.right, values);
    }

    private static TreeNode Build(Queue<string> queue)
    {
        string value = queue.Dequeue();
        if (value == "null")
            return null;

        TreeNode node = new(int.Parse(value));
        node.left = Build(queue);
        node.right = Build(queue);
        return node;
    }
}
\`\`\`

### Binary Tree Maximum Path Sum

**Time:** \`O(n)\` | **Space:** \`O(h)\` recursion stack

\`\`\`csharp
public class Solution
{
    private int maxPath = int.MinValue;

    public int MaxPathSum(TreeNode root)
    {
        MaxGain(root);
        return maxPath;
    }

    private int MaxGain(TreeNode node)
    {
        if (node == null)
            return 0;

        int left = Math.Max(0, MaxGain(node.left));
        int right = Math.Max(0, MaxGain(node.right));

        maxPath = Math.Max(maxPath, node.val + left + right);
        return node.val + Math.Max(left, right);
    }
}
\`\`\`

## Graph

### Number of Islands

**Time:** \`O(rows * cols)\` | **Space:** \`O(rows * cols)\` worst case

\`\`\`csharp
public class Solution
{
    private static readonly int[] Dr = { 1, -1, 0, 0 };
    private static readonly int[] Dc = { 0, 0, 1, -1 };

    public int NumIslands(char[][] grid)
    {
        int rows = grid.Length;
        int cols = grid[0].Length;
        int count = 0;

        for (int r = 0; r < rows; r++)
        {
            for (int c = 0; c < cols; c++)
            {
                if (grid[r][c] != '1')
                    continue;

                count++;
                Dfs(grid, r, c);
            }
        }

        return count;
    }

    private static void Dfs(char[][] grid, int r, int c)
    {
        if (r < 0 || c < 0 || r == grid.Length || c == grid[0].Length || grid[r][c] != '1')
            return;

        grid[r][c] = '0';
        for (int i = 0; i < 4; i++)
            Dfs(grid, r + Dr[i], c + Dc[i]);
    }
}
\`\`\`

### Clone Graph

**Time:** \`O(V + E)\` | **Space:** \`O(V)\` excluding the cloned graph

\`\`\`csharp
public class Solution
{
    private readonly Dictionary<Node, Node> copies = new();

    public Node CloneGraph(Node node)
    {
        if (node == null)
            return null;
        if (copies.TryGetValue(node, out Node clone))
            return clone;

        clone = new Node(node.val);
        copies[node] = clone;

        foreach (Node neighbor in node.neighbors)
            clone.neighbors.Add(CloneGraph(neighbor));

        return clone;
    }
}
\`\`\`

### Rotting Oranges

**Time:** \`O(rows * cols)\` | **Space:** \`O(rows * cols)\` worst case

\`\`\`csharp
public class Solution
{
    private static readonly int[] Dr = { 1, -1, 0, 0 };
    private static readonly int[] Dc = { 0, 0, 1, -1 };

    public int OrangesRotting(int[][] grid)
    {
        var queue = new Queue<(int row, int col)>();
        int fresh = 0;

        for (int r = 0; r < grid.Length; r++)
        {
            for (int c = 0; c < grid[0].Length; c++)
            {
                if (grid[r][c] == 2)
                    queue.Enqueue((r, c));
                else if (grid[r][c] == 1)
                    fresh++;
            }
        }

        int minutes = 0;
        while (queue.Count > 0 && fresh > 0)
        {
            int size = queue.Count;
            minutes++;

            for (int i = 0; i < size; i++)
            {
                var (r, c) = queue.Dequeue();
                for (int d = 0; d < 4; d++)
                {
                    int nr = r + Dr[d];
                    int nc = c + Dc[d];
                    if (nr < 0 || nc < 0 || nr == grid.Length || nc == grid[0].Length || grid[nr][nc] != 1)
                        continue;

                    grid[nr][nc] = 2;
                    fresh--;
                    queue.Enqueue((nr, nc));
                }
            }
        }

        return fresh == 0 ? minutes : -1;
    }
}
\`\`\`

### Is Graph Bipartite

**Time:** \`O(V + E)\` | **Space:** \`O(V)\`

\`\`\`csharp
public class Solution
{
    public bool IsBipartite(int[][] graph)
    {
        int n = graph.Length;
        int[] color = Enumerable.Repeat(-1, n).ToArray();

        for (int start = 0; start < n; start++)
        {
            if (color[start] != -1)
                continue;

            var queue = new Queue<int>();
            queue.Enqueue(start);
            color[start] = 0;

            while (queue.Count > 0)
            {
                int node = queue.Dequeue();
                foreach (int neighbor in graph[node])
                {
                    if (color[neighbor] == -1)
                    {
                        color[neighbor] = 1 - color[node];
                        queue.Enqueue(neighbor);
                    }
                    else if (color[neighbor] == color[node])
                    {
                        return false;
                    }
                }
            }
        }

        return true;
    }
}
\`\`\`

### Graph Valid Tree

**Time:** \`O(V + E)\` | **Space:** \`O(V)\`

\`\`\`csharp
public class Solution
{
    public bool ValidTree(int n, int[][] edges)
    {
        if (edges.Length != n - 1)
            return false;

        var graph = new List<int>[n];
        for (int i = 0; i < n; i++)
            graph[i] = new List<int>();

        foreach (int[] edge in edges)
        {
            graph[edge[0]].Add(edge[1]);
            graph[edge[1]].Add(edge[0]);
        }

        var seen = new HashSet<int>();
        var stack = new Stack<int>();
        stack.Push(0);

        while (stack.Count > 0)
        {
            int node = stack.Pop();
            if (!seen.Add(node))
                continue;

            foreach (int neighbor in graph[node])
            {
                if (!seen.Contains(neighbor))
                    stack.Push(neighbor);
            }
        }

        return seen.Count == n;
    }
}
\`\`\`

### Redundant Connection

**Time:** \`O(E * alpha(V))\` | **Space:** \`O(V)\` for Union-Find

\`\`\`csharp
public class Solution
{
    public int[] FindRedundantConnection(int[][] edges)
    {
        var dsu = new DisjointSetUnion(edges.Length + 1);

        foreach (int[] edge in edges)
        {
            if (!dsu.Union(edge[0], edge[1]))
                return edge;
        }

        return Array.Empty<int>();
    }

    private sealed class DisjointSetUnion
    {
        private readonly int[] parent;
        private readonly int[] rank;

        public DisjointSetUnion(int size)
        {
            parent = new int[size];
            rank = new int[size];
            for (int i = 0; i < size; i++)
                parent[i] = i;
        }

        public int Find(int x)
        {
            if (parent[x] != x)
                parent[x] = Find(parent[x]);
            return parent[x];
        }

        public bool Union(int a, int b)
        {
            int rootA = Find(a);
            int rootB = Find(b);
            if (rootA == rootB)
                return false;

            if (rank[rootA] < rank[rootB])
                (rootA, rootB) = (rootB, rootA);

            parent[rootB] = rootA;
            if (rank[rootA] == rank[rootB])
                rank[rootA]++;

            return true;
        }
    }
}
\`\`\`

### Pacific Atlantic Water Flow

**Time:** \`O(rows * cols)\` | **Space:** \`O(rows * cols)\`

\`\`\`csharp
public class Solution
{
    private static readonly int[] Dr = { 1, -1, 0, 0 };
    private static readonly int[] Dc = { 0, 0, 1, -1 };

    public IList<IList<int>> PacificAtlantic(int[][] heights)
    {
        int rows = heights.Length;
        int cols = heights[0].Length;
        bool[,] pacific = new bool[rows, cols];
        bool[,] atlantic = new bool[rows, cols];

        for (int r = 0; r < rows; r++)
        {
            Dfs(heights, r, 0, int.MinValue, pacific);
            Dfs(heights, r, cols - 1, int.MinValue, atlantic);
        }

        for (int c = 0; c < cols; c++)
        {
            Dfs(heights, 0, c, int.MinValue, pacific);
            Dfs(heights, rows - 1, c, int.MinValue, atlantic);
        }

        var result = new List<IList<int>>();
        for (int r = 0; r < rows; r++)
        {
            for (int c = 0; c < cols; c++)
            {
                if (pacific[r, c] && atlantic[r, c])
                    result.Add(new List<int> { r, c });
            }
        }

        return result;
    }

    private static void Dfs(int[][] heights, int r, int c, int previousHeight, bool[,] seen)
    {
        if (r < 0 || c < 0 || r == heights.Length || c == heights[0].Length)
            return;
        if (seen[r, c] || heights[r][c] < previousHeight)
            return;

        seen[r, c] = true;
        for (int i = 0; i < 4; i++)
            Dfs(heights, r + Dr[i], c + Dc[i], heights[r][c], seen);
    }
}
\`\`\`

### Word Ladder

**Time:** \`O(N * L^2)\` | **Space:** \`O(N * L)\`, where \`N\` is the word count and \`L\` is the word length

\`\`\`csharp
public class Solution
{
    public int LadderLength(string beginWord, string endWord, IList<string> wordList)
    {
        var words = new HashSet<string>(wordList);
        if (!words.Contains(endWord))
            return 0;

        words.Add(beginWord);
        var patterns = new Dictionary<string, List<string>>();

        foreach (string word in words)
        {
            for (int i = 0; i < word.Length; i++)
            {
                string pattern = word.Substring(0, i) + "*" + word.Substring(i + 1);
                if (!patterns.ContainsKey(pattern))
                    patterns[pattern] = new List<string>();
                patterns[pattern].Add(word);
            }
        }

        var queue = new Queue<(string word, int steps)>();
        var seen = new HashSet<string> { beginWord };
        queue.Enqueue((beginWord, 1));

        while (queue.Count > 0)
        {
            var (word, steps) = queue.Dequeue();
            if (word == endWord)
                return steps;

            for (int i = 0; i < word.Length; i++)
            {
                string pattern = word.Substring(0, i) + "*" + word.Substring(i + 1);
                if (!patterns.TryGetValue(pattern, out List<string> neighbors))
                    continue;

                foreach (string next in neighbors)
                {
                    if (seen.Add(next))
                        queue.Enqueue((next, steps + 1));
                }

                patterns.Remove(pattern);
            }
        }

        return 0;
    }
}
\`\`\`

### Network Delay Time

**Dijkstra:** Time \`O((V + E) log V)\` | **Space:** \`O(V + E)\`

\`\`\`csharp
public class Solution
{
    public int NetworkDelayTime(int[][] times, int n, int k)
    {
        var graph = new List<(int to, int weight)>[n + 1];
        for (int i = 0; i <= n; i++)
            graph[i] = new List<(int to, int weight)>();

        foreach (int[] edge in times)
            graph[edge[0]].Add((edge[1], edge[2]));

        int[] distance = Enumerable.Repeat(int.MaxValue, n + 1).ToArray();
        distance[k] = 0;

        var heap = new PriorityQueue<int, int>();
        heap.Enqueue(k, 0);

        while (heap.TryDequeue(out int node, out int currentDistance))
        {
            if (currentDistance > distance[node])
                continue;

            foreach (var (to, weight) in graph[node])
            {
                int nextDistance = currentDistance + weight;
                if (nextDistance >= distance[to])
                    continue;

                distance[to] = nextDistance;
                heap.Enqueue(to, nextDistance);
            }
        }

        int answer = 0;
        for (int node = 1; node <= n; node++)
        {
            if (distance[node] == int.MaxValue)
                return -1;

            answer = Math.Max(answer, distance[node]);
        }

        return answer;
    }
}
\`\`\`

### Alien Dictionary

**Time:** \`O(C + V + E)\` | **Space:** \`O(V + E)\`, where \`C\` is the total input character count

\`\`\`csharp
public class Solution
{
    public string AlienOrder(string[] words)
    {
        var graph = new Dictionary<char, HashSet<char>>();
        var indegree = new Dictionary<char, int>();

        foreach (string word in words)
        {
            foreach (char ch in word)
            {
                graph.TryAdd(ch, new HashSet<char>());
                indegree.TryAdd(ch, 0);
            }
        }

        for (int i = 0; i < words.Length - 1; i++)
        {
            string first = words[i];
            string second = words[i + 1];

            if (first.Length > second.Length && first.StartsWith(second, StringComparison.Ordinal))
                return string.Empty;

            int limit = Math.Min(first.Length, second.Length);
            for (int j = 0; j < limit; j++)
            {
                if (first[j] == second[j])
                    continue;

                if (graph[first[j]].Add(second[j]))
                    indegree[second[j]]++;

                break;
            }
        }

        var queue = new Queue<char>(indegree.Where(entry => entry.Value == 0).Select(entry => entry.Key));
        var order = new StringBuilder();

        while (queue.Count > 0)
        {
            char ch = queue.Dequeue();
            order.Append(ch);

            foreach (char next in graph[ch])
            {
                indegree[next]--;
                if (indegree[next] == 0)
                    queue.Enqueue(next);
            }
        }

        return order.Length == indegree.Count ? order.ToString() : string.Empty;
    }
}
\`\`\`\r

## Backtracking

### Subsets

**Time:** \`O(N * 2^N)\` | **Space:** \`O(N)\`

**Example:** \`nums = [1, 2, 3]\` → \`[[], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]]\`

\`\`\`csharp
public class Solution
{
    public IList<IList<int>> Subsets(int[] nums)
    {
        var result = new List<IList<int>>();
        var current = new List<int>();

        void Backtrack(int index)
        {
            if (index == nums.Length)
            {
                result.Add(new List<int>(current));
                return;
            }

            current.Add(nums[index]);
            Backtrack(index + 1);
            current.RemoveAt(current.Count - 1);

            Backtrack(index + 1);
        }

        Backtrack(0);
        return result;
    }
}
\`\`\`

### Subsets II

**Time:** \`O(N * 2^N)\` | **Space:** \`O(N)\`

**Example:** \`nums = [1, 2, 2]\` → \`[[], [1], [2], [1,2], [2,2], [1,2,2]]\`

\`\`\`csharp
public class Solution
{
    public IList<IList<int>> SubsetsWithDup(int[] nums)
    {
        Array.Sort(nums);
        var result = new List<IList<int>>();
        var current = new List<int>();

        void Backtrack(int start)
        {
            result.Add(new List<int>(current));

            for (int i = start; i < nums.Length; i++)
            {
                if (i > start && nums[i] == nums[i - 1])
                    continue;

                current.Add(nums[i]);
                Backtrack(i + 1);
                current.RemoveAt(current.Count - 1);
            }
        }

        Backtrack(0);
        return result;
    }
}
\`\`\`

### Permutations

**Time:** \`O(N * N!)\` | **Space:** \`O(N)\`

**Example:** \`nums = [1, 2, 3]\` → \`[[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]\`

**Backtracking with a used array**

\`\`\`csharp
public class Solution
{
    public IList<IList<int>> Permute(int[] nums)
    {
        var result = new List<IList<int>>();
        var current = new List<int>();
        bool[] used = new bool[nums.Length];

        void Backtrack()
        {
            if (current.Count == nums.Length)
            {
                result.Add(new List<int>(current));
                return;
            }

            for (int i = 0; i < nums.Length; i++)
            {
                if (used[i])
                    continue;

                used[i] = true;
                current.Add(nums[i]);
                Backtrack();
                current.RemoveAt(current.Count - 1);
                used[i] = false;
            }
        }

        Backtrack();
        return result;
    }
}
\`\`\`

**In-place swapping**

\`\`\`csharp
public class Solution
{
    public IList<IList<int>> Permute(int[] nums)
    {
        var result = new List<IList<int>>();

        void Backtrack(int start)
        {
            if (start == nums.Length)
            {
                result.Add(nums.ToArray());
                return;
            }

            for (int i = start; i < nums.Length; i++)
            {
                (nums[start], nums[i]) = (nums[i], nums[start]);
                Backtrack(start + 1);
                (nums[start], nums[i]) = (nums[i], nums[start]);
            }
        }

        Backtrack(0);
        return result;
    }
}
\`\`\`

### Combination Sum

**Time:** \`O(N^(T/m))\` | **Space:** \`O(T/m)\`

**Example:** \`candidates = [2, 3, 6, 7], target = 7\` → \`[[2,2,3], [7]]\`

\`\`\`csharp
public class Solution
{
    public IList<IList<int>> CombinationSum(int[] candidates, int target)
    {
        Array.Sort(candidates);
        var result = new List<IList<int>>();
        var current = new List<int>();

        void Backtrack(int start, int remaining)
        {
            if (remaining == 0)
            {
                result.Add(new List<int>(current));
                return;
            }

            for (int i = start; i < candidates.Length; i++)
            {
                if (candidates[i] > remaining)
                    break;

                current.Add(candidates[i]);
                Backtrack(i, remaining - candidates[i]);
                current.RemoveAt(current.Count - 1);
            }
        }

        Backtrack(0, target);
        return result;
    }
}
\`\`\`

### Combination Sum II

**Time:** \`O(N * 2^N)\` | **Space:** \`O(N)\`

**Example:** \`candidates = [10,1,2,7,6,1,5], target = 8\` → \`[[1,1,6], [1,2,5], [1,7], [2,6]]\`

\`\`\`csharp
public class Solution
{
    public IList<IList<int>> CombinationSum2(int[] candidates, int target)
    {
        Array.Sort(candidates);
        var result = new List<IList<int>>();
        var current = new List<int>();

        void Backtrack(int start, int remaining)
        {
            if (remaining == 0)
            {
                result.Add(new List<int>(current));
                return;
            }

            for (int i = start; i < candidates.Length; i++)
            {
                if (i > start && candidates[i] == candidates[i - 1])
                    continue;
                if (candidates[i] > remaining)
                    break;

                current.Add(candidates[i]);
                Backtrack(i + 1, remaining - candidates[i]);
                current.RemoveAt(current.Count - 1);
            }
        }

        Backtrack(0, target);
        return result;
    }
}
\`\`\`

### Word Search in a 2D Grid

**Time:** \`O(rows * cols * 3^L)\` worst case | **Space:** \`O(L)\` recursion stack

\`\`\`csharp
public class Solution
{
    private static readonly int[] Dr = { 1, -1, 0, 0 };
    private static readonly int[] Dc = { 0, 0, 1, -1 };

    public bool Exist(char[][] board, string word)
    {
        for (int r = 0; r < board.Length; r++)
        {
            for (int c = 0; c < board[0].Length; c++)
            {
                if (Backtrack(board, r, c, word, 0))
                    return true;
            }
        }

        return false;
    }

    private static bool Backtrack(char[][] board, int r, int c, string word, int index)
    {
        if (index == word.Length)
            return true;
        if (r < 0 || c < 0 || r == board.Length || c == board[0].Length || board[r][c] != word[index])
            return false;

        char saved = board[r][c];
        board[r][c] = '#';

        for (int i = 0; i < 4; i++)
        {
            if (Backtrack(board, r + Dr[i], c + Dc[i], word, index + 1))
            {
                board[r][c] = saved;
                return true;
            }
        }

        board[r][c] = saved;
        return false;
    }
}
\`\`\`

### Generate Parentheses

**Time:** \`O(4^N / sqrt(N))\` | **Space:** \`O(N)\`

**Example:** \`n = 3\` → \`["((()))", "(()())", "(())()", "()(())", "()()()"]\`

\`\`\`csharp
public class Solution
{
    public IList<string> GenerateParenthesis(int n)
    {
        var result = new List<string>();
        var current = new StringBuilder();

        void Backtrack(int open, int close)
        {
            if (current.Length == 2 * n)
            {
                result.Add(current.ToString());
                return;
            }

            if (open < n)
            {
                current.Append('(');
                Backtrack(open + 1, close);
                current.Length--;
            }

            if (close < open)
            {
                current.Append(')');
                Backtrack(open, close + 1);
                current.Length--;
            }
        }

        Backtrack(0, 0);
        return result;
    }
}
\`\`\`

### N-Queens

**Brute force:** Time \`O(N^N)\`, Space \`O(N)\` | **Backtracking + conflict sets:** Time \`O(N!)\`, Space \`O(N)\`

**Example:** \`n = 4\` → \`[[".Q..", "...Q", "Q...", "..Q."], ["..Q.", "Q...", "...Q", ".Q.."]]\`

**Brute force**

\`\`\`csharp
public class Solution
{
    public IList<IList<string>> SolveNQueensBruteForce(int n)
    {
        var result = new List<IList<string>>();
        int[] position = new int[n];

        void Place(int row)
        {
            if (row == n)
            {
                if (IsValid(position))
                    result.Add(BuildBoard(position));
                return;
            }

            for (int col = 0; col < n; col++)
            {
                position[row] = col;
                Place(row + 1);
            }
        }

        Place(0);
        return result;
    }

    private static bool IsValid(int[] position)
    {
        for (int i = 0; i < position.Length; i++)
        {
            for (int j = i + 1; j < position.Length; j++)
            {
                if (position[i] == position[j] || Math.Abs(position[i] - position[j]) == Math.Abs(i - j))
                    return false;
            }
        }

        return true;
    }

    private static IList<string> BuildBoard(int[] position)
    {
        var board = new List<string>(position.Length);
        for (int row = 0; row < position.Length; row++)
        {
            char[] line = Enumerable.Repeat('.', position.Length).ToArray();
            line[position[row]] = 'Q';
            board.Add(new string(line));
        }

        return board;
    }
}
\`\`\`

**Conflict sets**

\`\`\`csharp
public class Solution
{
    public IList<IList<string>> SolveNQueens(int n)
    {
        var result = new List<IList<string>>();
        var columns = new HashSet<int>();
        var diagonal = new HashSet<int>();
        var antiDiagonal = new HashSet<int>();
        int[] position = new int[n];

        void Backtrack(int row)
        {
            if (row == n)
            {
                result.Add(BuildBoard(position));
                return;
            }

            for (int col = 0; col < n; col++)
            {
                if (columns.Contains(col) || diagonal.Contains(row - col) || antiDiagonal.Contains(row + col))
                    continue;

                columns.Add(col);
                diagonal.Add(row - col);
                antiDiagonal.Add(row + col);
                position[row] = col;

                Backtrack(row + 1);

                columns.Remove(col);
                diagonal.Remove(row - col);
                antiDiagonal.Remove(row + col);
            }
        }

        Backtrack(0);
        return result;
    }

    private static IList<string> BuildBoard(int[] position)
    {
        var board = new List<string>(position.Length);
        for (int row = 0; row < position.Length; row++)
        {
            char[] line = Enumerable.Repeat('.', position.Length).ToArray();
            line[position[row]] = 'Q';
            board.Add(new string(line));
        }

        return board;
    }
}
\`\`\`

If you only need the count for N-Queens II, keep an integer answer and skip board materialisation. The same three conflict sets can also be compressed into bitmasks when you want the fastest constant factors.

## Greedy and Intervals

### Meeting Rooms I

**Time:** \`O(n log n)\` | **Space:** \`O(log n)\` for the in-place sort stack

\`\`\`csharp
public class Solution
{
    public bool CanAttendMeetings(int[][] intervals)
    {
        Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));

        for (int i = 1; i < intervals.Length; i++)
        {
            if (intervals[i][0] < intervals[i - 1][1])
                return false;
        }

        return true;
    }
}
\`\`\`

### Merge Intervals

**Time:** \`O(n log n)\` | **Space:** \`O(n)\` for the heap and result

\`\`\`csharp
public class Solution
{
    public int[][] Merge(int[][] intervals)
    {
        if (intervals.Length == 0)
            return Array.Empty<int[]>();

        var heap = new PriorityQueue<int[], int>();
        foreach (int[] interval in intervals)
            heap.Enqueue(new[] { interval[0], interval[1] }, -interval[1]);

        var mergedDescending = new List<int[]>();
        int[] current = heap.Dequeue();

        while (heap.Count > 0)
        {
            int[] next = heap.Dequeue();
            if (next[1] >= current[0])
            {
                current[0] = Math.Min(current[0], next[0]);
            }
            else
            {
                mergedDescending.Add(current);
                current = next;
            }
        }

        mergedDescending.Add(current);
        mergedDescending.Reverse();
        return mergedDescending.ToArray();
    }
}
\`\`\`

### Insert Interval

**Time:** \`O(n)\` | **Space:** \`O(n)\` for the result

\`\`\`csharp
public class Solution
{
    public int[][] Insert(int[][] intervals, int[] newInterval)
    {
        var result = new List<int[]>();
        int i = 0;

        while (i < intervals.Length && intervals[i][1] < newInterval[0])
            result.Add(intervals[i++]);

        while (i < intervals.Length && intervals[i][0] <= newInterval[1])
        {
            newInterval[0] = Math.Min(newInterval[0], intervals[i][0]);
            newInterval[1] = Math.Max(newInterval[1], intervals[i][1]);
            i++;
        }

        result.Add(new[] { newInterval[0], newInterval[1] });

        while (i < intervals.Length)
            result.Add(intervals[i++]);

        return result.ToArray();
    }
}
\`\`\`

### Maximum Number of Non-Overlapping Intervals

**Time:** \`O(n log n)\` | **Space:** \`O(log n)\` for the in-place sort stack

\`\`\`csharp
public class Solution
{
    public int MaxNonOverlapping(int[][] intervals)
    {
        Array.Sort(intervals, (a, b) => a[1].CompareTo(b[1]));

        int count = 0;
        int currentEnd = int.MinValue;

        foreach (int[] interval in intervals)
        {
            if (interval[0] >= currentEnd)
            {
                count++;
                currentEnd = interval[1];
            }
        }

        return count;
    }
}
\`\`\`

### Erase Overlap Intervals

**Time:** \`O(n log n)\` | **Space:** \`O(log n)\` for the in-place sort stack

\`\`\`csharp
public class Solution
{
    public int EraseOverlapIntervals(int[][] intervals)
    {
        if (intervals.Length == 0)
            return 0;

        Array.Sort(intervals, (a, b) => a[1].CompareTo(b[1]));

        int removed = 0;
        int currentEnd = intervals[0][1];

        for (int i = 1; i < intervals.Length; i++)
        {
            if (intervals[i][0] < currentEnd)
            {
                removed++;
            }
            else
            {
                currentEnd = intervals[i][1];
            }
        }

        return removed;
    }
}
\`\`\`

### Meeting Rooms II

**Time:** \`O(n log n)\` | **Space:** \`O(n)\`

\`\`\`csharp
public class Solution
{
    public int MinMeetingRooms(int[][] intervals)
    {
        if (intervals.Length == 0)
            return 0;

        var events = new List<(int time, int delta)>(intervals.Length * 2);
        foreach (int[] interval in intervals)
        {
            events.Add((interval[0], 1));
            events.Add((interval[1], -1));
        }

        events.Sort((a, b) =>
        {
            int compareTime = a.time.CompareTo(b.time);
            return compareTime != 0 ? compareTime : a.delta.CompareTo(b.delta);
        });

        int rooms = 0;
        int best = 0;
        foreach (var (_, delta) in events)
        {
            rooms += delta;
            best = Math.Max(best, rooms);
        }

        return best;
    }
}
\`\`\`

### Minimum Number of Arrows to Burst Balloons

**Time:** \`O(n log n)\` | **Space:** \`O(log n)\` for the in-place sort stack

\`\`\`csharp
public class Solution
{
    public int FindMinArrowShots(int[][] points)
    {
        if (points.Length == 0)
            return 0;

        Array.Sort(points, (a, b) => a[1].CompareTo(b[1]));

        int arrows = 0;
        long shotAt = long.MinValue;

        foreach (int[] balloon in points)
        {
            if (balloon[0] > shotAt)
            {
                arrows++;
                shotAt = balloon[1];
            }
        }

        return arrows;
    }
}
\`\`\`

### Jump Game

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public bool CanJump(int[] nums)
    {
        int maxReach = 0;

        for (int i = 0; i < nums.Length; i++)
        {
            if (i > maxReach)
                return false;

            maxReach = Math.Max(maxReach, i + nums[i]);
        }

        return true;
    }
}
\`\`\`

### Jump Game II

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int Jump(int[] nums)
    {
        int jumps = 0;
        int currentEnd = 0;
        int farthest = 0;

        for (int i = 0; i < nums.Length - 1; i++)
        {
            farthest = Math.Max(farthest, i + nums[i]);
            if (i == currentEnd)
            {
                jumps++;
                currentEnd = farthest;
            }
        }

        return jumps;
    }
}
\`\`\`

### Gas Station

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int CanCompleteCircuit(int[] gas, int[] cost)
    {
        int total = 0;
        int tank = 0;
        int start = 0;

        for (int i = 0; i < gas.Length; i++)
        {
            int diff = gas[i] - cost[i];
            total += diff;
            tank += diff;

            if (tank < 0)
            {
                tank = 0;
                start = i + 1;
            }
        }

        return total >= 0 ? start : -1;
    }
}
\`\`\`\r

## DP

### Climbing Stairs

**Time:** \`O(n)\` | **Space:** \`O(n)\`, reducible to \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int ClimbStairs(int n)
    {
        if (n <= 2)
            return n;

        int[] dp = new int[n + 1];
        dp[0] = 0;
        dp[1] = 1;
        dp[2] = 2;

        for (int i = 3; i <= n; i++)
            dp[i] = dp[i - 1] + dp[i - 2];

        return dp[n];
    }
}
\`\`\`

### Unique Paths

**Time:** \`O(rows * cols)\` | **Space:** \`O(rows * cols)\`, reducible to \`O(cols)\`

\`\`\`csharp
public class Solution
{
    public int UniquePaths(int m, int n)
    {
        int[,] dp = new int[m, n];

        for (int r = 0; r < m; r++)
            dp[r, 0] = 1;
        for (int c = 0; c < n; c++)
            dp[0, c] = 1;

        for (int r = 1; r < m; r++)
        {
            for (int c = 1; c < n; c++)
                dp[r, c] = dp[r - 1, c] + dp[r, c - 1];
        }

        return dp[m - 1, n - 1];
    }
}
\`\`\`

### Minimum Path Sum

**Time:** \`O(rows * cols)\` | **Space:** \`O(rows * cols)\`, reducible to \`O(cols)\`

\`\`\`csharp
public class Solution
{
    public int MinPathSum(int[][] grid)
    {
        int rows = grid.Length;
        int cols = grid[0].Length;
        int[,] dp = new int[rows, cols];

        dp[0, 0] = grid[0][0];

        for (int r = 1; r < rows; r++)
            dp[r, 0] = dp[r - 1, 0] + grid[r][0];
        for (int c = 1; c < cols; c++)
            dp[0, c] = dp[0, c - 1] + grid[0][c];

        for (int r = 1; r < rows; r++)
        {
            for (int c = 1; c < cols; c++)
                dp[r, c] = grid[r][c] + Math.Min(dp[r - 1, c], dp[r, c - 1]);
        }

        return dp[rows - 1, cols - 1];
    }
}
\`\`\`

### House Robber

**Time:** \`O(n)\` | **Space:** \`O(n)\`, reducible to \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int Rob(int[] nums)
    {
        if (nums.Length == 0)
            return 0;
        if (nums.Length == 1)
            return nums[0];

        int[] dp = new int[nums.Length];
        dp[0] = nums[0];
        dp[1] = Math.Max(nums[0], nums[1]);

        for (int i = 2; i < nums.Length; i++)
            dp[i] = Math.Max(nums[i] + dp[i - 2], dp[i - 1]);

        return dp[^1];
    }
}
\`\`\`

### House Robber II

**Time:** \`O(n)\` | **Space:** \`O(n)\` as shown, reducible to \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int Rob(int[] nums)
    {
        int n = nums.Length;
        if (n == 0)
            return 0;
        if (n == 1)
            return nums[0];
        if (n == 2)
            return Math.Max(nums[0], nums[1]);

        int[] takeFirst = new int[n];
        int[] skipFirst = new int[n];

        takeFirst[0] = nums[0];
        takeFirst[1] = Math.Max(nums[0], nums[1]);
        skipFirst[0] = 0;
        skipFirst[1] = nums[1];

        for (int i = 2; i < n; i++)
        {
            takeFirst[i] = Math.Max(nums[i] + takeFirst[i - 2], takeFirst[i - 1]);
            skipFirst[i] = Math.Max(nums[i] + skipFirst[i - 2], skipFirst[i - 1]);
        }

        return Math.Max(takeFirst[n - 2], skipFirst[n - 1]);
    }
}
\`\`\`

### House Robber III

**Time:** \`O(N)\` | **Space:** \`O(H)\`

\`\`\`csharp
public class Solution
{
    public int Rob(TreeNode root)
    {
        var (rob, notRob) = Dfs(root);
        return Math.Max(rob, notRob);
    }

    private static (int rob, int notRob) Dfs(TreeNode node)
    {
        if (node == null)
            return (0, 0);

        var left = Dfs(node.left);
        var right = Dfs(node.right);

        int rob = node.val + left.notRob + right.notRob;
        int notRob = Math.Max(left.rob, left.notRob) + Math.Max(right.rob, right.notRob);
        return (rob, notRob);
    }
}
\`\`\`

### Decode Ways

**Time:** \`O(n)\` | **Space:** \`O(n)\`, reducible to \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int NumDecodings(string s)
    {
        if (s.Length == 0 || s[0] == '0')
            return 0;

        int[] dp = new int[s.Length + 1];
        dp[0] = 1;
        dp[1] = 1;

        for (int i = 2; i <= s.Length; i++)
        {
            if (s[i - 1] != '0')
                dp[i] += dp[i - 1];

            int value = (s[i - 2] - '0') * 10 + (s[i - 1] - '0');
            if (value >= 10 && value <= 26)
                dp[i] += dp[i - 2];
        }

        return dp[s.Length];
    }
}
\`\`\`

### Word Break

**Time:** \`O(n^2)\` dictionary checks | **Space:** \`O(n)\` DP, excluding substring copies

\`\`\`csharp
public class Solution
{
    public bool WordBreak(string s, IList<string> wordDict)
    {
        var words = new HashSet<string>(wordDict);
        bool[] dp = new bool[s.Length + 1];
        dp[0] = true;

        for (int i = 1; i <= s.Length; i++)
        {
            for (int j = 0; j < i; j++)
            {
                if (dp[j] && words.Contains(s.Substring(j, i - j)))
                {
                    dp[i] = true;
                    break;
                }
            }
        }

        return dp[s.Length];
    }
}
\`\`\`

### Partition Equal Subset Sum

**Time:** \`O(n * target)\` | **Space:** \`O(target)\`, where \`target = total / 2\`

\`\`\`csharp
public class Solution
{
    public bool CanPartition(int[] nums)
    {
        int total = nums.Sum();
        if ((total & 1) == 1)
            return false;

        int target = total / 2;
        bool[] dp = new bool[target + 1];
        dp[0] = true;

        foreach (int num in nums)
        {
            for (int sum = target; sum >= num; sum--)
                dp[sum] |= dp[sum - num];
        }

        return dp[target];
    }
}
\`\`\`

### Edit Distance

**Time:** \`O(m * n)\` | **Space:** \`O(m * n)\`, reducible to \`O(min(m, n))\`

\`\`\`csharp
public class Solution
{
    public int MinDistance(string word1, string word2)
    {
        int m = word1.Length;
        int n = word2.Length;
        int[,] dp = new int[m + 1, n + 1];

        for (int i = 0; i <= m; i++)
            dp[i, 0] = i;
        for (int j = 0; j <= n; j++)
            dp[0, j] = j;

        for (int i = 1; i <= m; i++)
        {
            for (int j = 1; j <= n; j++)
            {
                if (word1[i - 1] == word2[j - 1])
                {
                    dp[i, j] = dp[i - 1, j - 1];
                }
                else
                {
                    dp[i, j] = 1 + Math.Min(
                        dp[i - 1, j],
                        Math.Min(dp[i, j - 1], dp[i - 1, j - 1]));
                }
            }
        }

        return dp[m, n];
    }
}
\`\`\`

### Best Time to Buy and Sell Stock with Cooldown

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int MaxProfit(int[] prices)
    {
        int hold = int.MinValue / 2;
        int sold = 0;
        int rest = 0;

        foreach (int price in prices)
        {
            int previousHold = hold;
            int previousSold = sold;
            int previousRest = rest;

            hold = Math.Max(previousHold, previousRest - price);
            sold = previousHold + price;
            rest = Math.Max(previousRest, previousSold);
        }

        return Math.Max(sold, rest);
    }
}
\`\`\`

### Longest Increasing Path in a Matrix

**Time:** \`O(rows * cols)\` | **Space:** \`O(rows * cols)\` for memoization and recursion

\`\`\`csharp
public class Solution
{
    private static readonly int[] Dr = { 1, -1, 0, 0 };
    private static readonly int[] Dc = { 0, 0, 1, -1 };

    public int LongestIncreasingPath(int[][] matrix)
    {
        int rows = matrix.Length;
        int cols = matrix[0].Length;
        int[,] memo = new int[rows, cols];
        int best = 0;

        for (int r = 0; r < rows; r++)
        {
            for (int c = 0; c < cols; c++)
                best = Math.Max(best, Dfs(matrix, r, c, memo));
        }

        return best;
    }

    private static int Dfs(int[][] matrix, int r, int c, int[,] memo)
    {
        if (memo[r, c] != 0)
            return memo[r, c];

        int best = 1;
        for (int i = 0; i < 4; i++)
        {
            int nr = r + Dr[i];
            int nc = c + Dc[i];
            if (nr < 0 || nc < 0 || nr == matrix.Length || nc == matrix[0].Length || matrix[nr][nc] <= matrix[r][c])
                continue;

            best = Math.Max(best, 1 + Dfs(matrix, nr, nc, memo));
        }

        memo[r, c] = best;
        return best;
    }
}
\`\`\`

## Bit

### Single Number

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int SingleNumber(int[] nums)
    {
        int answer = 0;
        foreach (int num in nums)
            answer ^= num;

        return answer;
    }
}
\`\`\`

### Missing Number from 1 to n

**Time:** \`O(n)\` | **Space:** \`O(1)\`

\`\`\`csharp
public class Solution
{
    public int MissingNumber(int[] nums)
    {
        int n = nums.Length + 1;
        int answer = 0;

        for (int value = 1; value <= n; value++)
            answer ^= value;
        foreach (int num in nums)
            answer ^= num;

        return answer;
    }
}
\`\`\`

### Number of 1 Bits

**Time:** \`O(p)\` | **Space:** \`O(1)\`, where \`p\` is the number of set bits

\`\`\`csharp
public class Solution
{
    public int HammingWeight(uint n)
    {
        int count = 0;
        while (n != 0)
        {
            n &= n - 1;
            count++;
        }

        return count;
    }
}
\`\`\`

### Sum of Two Integers

**Time:** \`O(w)\` | **Space:** \`O(1)\`, where \`w\` is the integer bit width

\`\`\`csharp
public class Solution
{
    public int GetSum(int a, int b)
    {
        while (b != 0)
        {
            int carry = (a & b) << 1;
            a ^= b;
            b = carry;
        }

        return a;
    }
}
\`\`\`

## Cheat sheet

- **Arrays:** Carry the smallest state that preserves the answer so far — running sum, suffix max, or a few partition pointers often beats extra storage.
- **Strings:** When raw delimiters are unsafe, prefix the length and parsing becomes deterministic.
- **Hashing:** Use a hash map when the bottleneck is repeated lookup, and a hash set when the question is really existence or uniqueness.
- **2 Pointers:** Move the pointer that cannot participate in a better future answer, usually the smaller value or the out-of-place side.
- **Sliding Window:** A window is the right tool when you can repair validity incrementally instead of recomputing a whole range from scratch.
- **Stack and Queue:** Monotonic structures shine when each element wants the next greater, next smaller, or still-valid candidate.
- **Linked List:** Most linked-list questions reduce to splitting, reversing, or weaving one segment at a time.
- **Binary Search:** Think in terms of a monotone predicate — once feasibility flips, search the boundary.
- **Heap:** Reach for a heap when you need the current best candidate repeatedly but do not need the whole collection fully sorted.
- **Tree:** Say what your DFS returns from a node before you code it; the recurrence usually falls out immediately.
- **Graph:** BFS for minimum unweighted steps, DFS for reachability and components, Dijkstra once edge weights matter.
- **Backtracking:** Model each level as a choice, then prune with the smallest rule that proves a branch cannot recover.
- **Greedy and Intervals:** Sort by the dimension your local choice protects, usually earliest end time or farthest reach.
- **DP:** Define the subproblem and transition first; implementation details are usually mechanical after that.
- **Bit:** XOR cancels pairs, \`n & (n - 1)\` removes one set bit, and carry simulation turns arithmetic into iteration.

## Common mistakes

| Mistake | Fix |
|---|---|
| Forgetting to seed the prefix-sum map with \`0 -> 1\` in \`Subarray Sum Equals K\` | Seed the empty prefix so subarrays starting at index 0 are counted |
| Updating trapped water before refreshing \`maxLeft\` or \`maxRight\` | Update the running boundary first, then add \`boundary - height\` |
| Using a sliding window on a metric that is not monotone | Check whether expanding and shrinking the window behaves predictably; if not, prefer prefix sums or hashing |
| Storing values instead of indices in \`Sliding Window Maximum\` | Store indices so you can evict expired elements as the window moves |
| Swapping the pivot in \`Next Permutation\` but forgetting to reverse the suffix | Reverse the suffix because it was decreasing and must become the smallest possible tail |
| Reusing row 0 and column 0 as markers in \`Set Matrix Zeroes\` without separate flags | Record first-row and first-column zeros before marking the matrix in place |
| Unlinking the LRU node from the list but forgetting to remove it from the dictionary | Treat list removal and map removal as one atomic eviction step |
| Letting \`House Robber II\` consider both the first and last house | Split the circle into two linear cases and compare those answers only |
| Starting BFS from one rotten orange instead of all rotten oranges | Multi-source BFS must enqueue every initial source before minute 0 |
| Missing the invalid prefix case in \`Alien Dictionary\` | If a longer word appears before its exact prefix, return an empty order immediately |
| Reusing the same element in \`Combination Sum II\` or failing to skip duplicate siblings | Sort first, advance to \`i + 1\`, and skip duplicates at the same recursion depth |
| Sorting \`Meeting Rooms II\` events without processing end events before start events at the same time | Tie-break on delta so \`-1\` ends are applied before \`+1\` starts |

## Summary

Pattern recognition is what turns a giant problem list into a small set of reusable interview moves. Across these 109 canonical questions, the same themes recur: remove repeated lookup with hashing, exploit order with two pointers or binary search, preserve a frontier with BFS, cache overlapping work with DP, and prune impossible branches with backtracking. If you can name the invariant before you type, most of these implementations become short, mechanical translations of that idea rather than separate solutions to memorize.

## Top Interview Questions

### Q1. How do you recognize the right problem family in the first minute of reading a prompt?

Start by translating the wording into constraints and repeated work, not into a memorized LeetCode title. If the input is sorted, monotone, or asks for a boundary, think two pointers or binary search. If it asks about a contiguous region that can be repaired incrementally, think sliding window. If it asks for reachability, minimum number of steps, or "all nodes at distance k," think graph traversal. If it asks for the best answer across many overlapping choices, think DP or greedy. The fastest practical habit is to say the brute-force scan out loud first, then ask what exact work it repeats. That repeated work is usually the cleanest clue to the pattern family.

### Q2. When should you prefer hashing over sorting as the main optimization?

Prefer hashing when you need exact lookup, counting, or deduplication and the original relative order either matters or is irrelevant. \`Two Sum\`, \`Group Anagrams\`, and \`Subarray Sum Equals K\` all become fast because a hash structure answers "have I seen this complement, signature, or prefix?" immediately. Prefer sorting when the gain comes from global order: merging intervals, using two pointers, or greedily keeping the earliest finishing interval. Sorting often unlocks a simpler invariant, but it costs \`O(n log n)\` and may destroy original indices unless you carry them along. A good interview explanation is: hashing removes repeated search; sorting creates structure that makes one linear pass possible afterward.

### Q3. How do you decide between a sliding window and a prefix-sum approach?

Ask whether the property you care about can be updated locally when the window expands or shrinks. Sliding window works when validity changes predictably, such as character frequencies, product thresholds with all values at least one, or at-most-k replacements. Prefix sums are better when the question is about exact totals over many candidate ranges, especially when negative numbers break monotonicity. That is why \`Subarray Product Less Than K\` fits a window, but \`Subarray Sum Equals K\` needs prefix sums and a hash map. In interviews, a strong explanation is that windows depend on a repairable invariant, while prefix sums depend on subtracting two cumulative states to isolate a range.

### Q4. What are the strongest signals that a monotonic stack or deque is the right tool?

Look for language like next greater, next smaller, nearest larger to the left, first smaller after this point, or maximum of every moving window. Those prompts all ask you to keep only candidates that are still useful after later elements arrive. A monotonic stack handles one-shot nearest-element questions because once a better candidate appears, dominated elements can never matter again. A monotonic deque extends the idea to windows by also expiring indices that fall out of range. The interview-friendly way to describe it is: I want a structure that stays ordered by usefulness, so every element is added once and removed once, giving me linear time instead of repeated rescans.

### Q5. How would you explain binary search on the answer to an interviewer who has not seen your final code yet?

Frame it as a monotone feasibility problem. Instead of searching directly for the answer value, define a predicate like "can Koko finish all piles at speed s within h hours?" or "can I ship these packages with capacity c in d days?" The important property is that once a candidate becomes feasible, every larger candidate stays feasible, or vice versa. That creates a sorted true/false boundary even if the original data is unsorted. Then the code is just a boundary search over the candidate range. This explanation signals deeper understanding than saying "I just binary searched it," because it makes clear why binary search is valid in the first place.

### Q6. How do you choose between BFS and DFS on graph-style interview problems?

Choose BFS when the level number matters: shortest path in an unweighted graph, minimum transformations, minutes until spread, or all nodes exactly k edges away. BFS explores in concentric layers, so the first time you reach a node is automatically the shortest step count. Choose DFS when the task is reachability, counting components, validating a property recursively, or exploring every branch in a search tree. DFS also adapts naturally to backtracking because the call stack mirrors the current path. In interviews, say the reason explicitly: I need minimum steps, so I want a level-order traversal; or I only need connectivity, so DFS keeps the code smaller without changing complexity.

### Q7. When is a greedy solution justified, and when should you switch to dynamic programming?

Greedy is justified when a local choice can be shown not to hurt the global optimum. Interval scheduling works because keeping the earliest finishing interval leaves the most room for everything after it. Jump Game works because only the farthest reachable boundary matters, not the exact path taken to get there. Switch to DP when the future value of a choice depends on more than a single locally optimal summary, or when overlapping subproblems keep reappearing. House Robber, Decode Ways, and Edit Distance all need stored subproblem answers because the best decision now depends on several earlier states. In interview language: greedy compresses the past into one safe summary; DP remembers multiple states because one summary is not enough.

### Q8. What is the best way to handle design-style data structure questions like LRU Cache?

State the operations and target complexity before writing any code. For LRU Cache, say you need \`Get\` and \`Put\` in \`O(1)\`, plus eviction of the least recently used key, which immediately rules out plain arrays or linked lists alone. Then name the paired structures and the invariant: a dictionary maps keys to nodes, and a doubly linked list keeps usage order with the head as most recent and the tail as least recent. Only after that should you code the four primitive operations — remove, insert after head, move to front, and evict tail. Interviewers like this because it shows you are designing around invariants and complexity requirements, not just reproducing a memorized class skeleton.

### Q9. What debugging routine works best for pointer-heavy problems on linked lists and trees?

Use the smallest example that exercises the rewiring once, then narrate pointer ownership line by line. For linked lists, draw the nodes, mark \`prev\`, \`curr\`, \`next\`, and check after each assignment which references are still intact. For fast/slow problems, verify where each pointer lands on even and odd lengths separately. For tree recursion, state exactly what the helper returns for a node and test that return value on a three-node tree before trusting it on the full case. The key habit is not "read the code harder" but "simulate the mutation in a controlled example." Pointer bugs almost always come from losing access to the rest of the structure one assignment too early.

### Q10. How should you practice a page this large without falling into rote memorization?

Study by family, not by file order, and force yourself to say the invariant before you look at code. Do \`Two Sum\`, \`3Sum\`, and \`Subarray Sum Equals K\` together to isolate what hashing is really doing. Pair \`House Robber\` with \`House Robber II\`, then \`LCA of BST\` with \`LCA of Binary Tree\`, so you learn the variant delta rather than two separate answers. Re-solve from memory a few days later without opening your old code, and only compare afterward. The goal is not to remember 109 implementations line for line; it is to reduce them to maybe fifteen reusable stories about state, ordering, search, and pruning that you can re-derive under pressure.\r
`;export{n as default};
