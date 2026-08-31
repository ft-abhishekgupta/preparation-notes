# Trees — Problems

| # | Problem | LeetCode | Pattern | Difficulty |
| - | ------- | -------- | ------- | ---------- |
| 1 | Binary Tree Inorder Traversal | 94 | Traversals | Easy |
| 2 | Binary Tree Preorder Traversal | 144 | Traversals | Easy |
| 3 | Binary Tree Postorder Traversal | 145 | Traversals | Easy |
| 4 | Invert Binary Tree | 226 | Traversals | Easy |
| 5 | Symmetric Tree | 101 | Traversals | Easy |
| 6 | Same Tree | 100 | Traversals | Easy |
| 7 | Maximum Depth of Binary Tree | 104 | Depth and Structure | Easy |
| 8 | Minimum Depth of Binary Tree | 111 | Depth and Structure | Easy |
| 9 | Balanced Binary Tree | 110 | Depth and Structure | Easy |
| 10 | Diameter of Binary Tree | 543 | Depth and Structure | Easy |
| 11 | Count Good Nodes in Binary Tree | 1448 | Depth and Structure | Medium |
| 12 | Subtree of Another Tree | 572 | Depth and Structure | Easy |
| 13 | Binary Tree Level Order Traversal | 102 | Level Order (BFS) | Medium |
| 14 | Binary Tree Zigzag Level Order | 103 | Level Order (BFS) | Medium |
| 15 | Binary Tree Right Side View | 199 | Level Order (BFS) | Medium |
| 16 | Populating Next Right Pointers | 116 | Level Order (BFS) | Medium |
| 17 | Validate Binary Search Tree | 98 | BST | Medium |
| 18 | Kth Smallest Element in a BST | 230 | BST | Medium |
| 19 | Convert Sorted Array to BST | 108 | BST | Easy |
| 20 | Flatten Binary Tree to Linked List | 114 | BST | Medium |
| 21 | Path Sum | 112 | Paths | Easy |
| 22 | Path Sum II | 113 | Paths | Medium |
| 23 | Path Sum III | 437 | Paths | Medium |
| 24 | Binary Tree Maximum Path Sum | 124 | Paths | Hard |
| 25 | Lowest Common Ancestor of a BST | 235 | Ancestors | Medium |
| 26 | Lowest Common Ancestor of a Binary Tree | 236 | Ancestors | Medium |
| 27 | Construct Binary Tree from Preorder and Inorder | 105 | Construction and Serialisation | Medium |
| 28 | Construct Binary Tree from Inorder and Postorder | 106 | Construction and Serialisation | Medium |
| 29 | Serialize and Deserialize Binary Tree | 297 | Construction and Serialisation | Hard |
| 30 | House Robber III | 337 | Paths | Medium |

---

## Traversals

### Binary Tree Inorder Traversal — LeetCode 94

Return the inorder (left → root → right) traversal of a binary tree's node values.

**Example:** `root = [1,null,2,3]` → `[1,3,2]`

```text
RECURSIVE | O(n) | O(h)

Visit left subtree, then root, then right subtree.

------------------------------------------------------------------------------

ITERATIVE | O(n) | O(h)

Use a stack; push all left children, then pop and visit, then go right.

------------------------------------------------------------------------------

OPTIMAL — MORRIS TRAVERSAL | O(n) | O(1)

Thread the inorder predecessor's right pointer back to current node.
On second visit (thread exists), remove thread and visit node.
```

```csharp
// Optimal: Morris Inorder — O(n) time, O(1) space
public IList<int> InorderTraversal(TreeNode root)
{
    var res = new List<int>();
    var cur = root;
    while (cur != null)
    {
        if (cur.Left == null)
        {
            res.Add(cur.Val);
            cur = cur.Right;
        }
        else
        {
            var pre = cur.Left;
            while (pre.Right != null && pre.Right != cur) pre = pre.Right;
            if (pre.Right == null)
            {
                pre.Right = cur;
                cur = cur.Left;
            }
            else
            {
                pre.Right = null;
                res.Add(cur.Val);
                cur = cur.Right;
            }
        }
    }
    return res;
}
```

> **Key insight:** Morris traversal threads the inorder predecessor's right pointer to avoid a stack, achieving O(1) space while visiting every node exactly twice.

---

### Binary Tree Preorder Traversal — LeetCode 144

Return the preorder (root → left → right) traversal of a binary tree's node values.

**Example:** `root = [1,null,2,3]` → `[1,2,3]`

```text
RECURSIVE | O(n) | O(h)

Visit root, then recurse left, then right.

------------------------------------------------------------------------------

OPTIMAL — ITERATIVE STACK | O(n) | O(h)

Push root; pop and visit; push right child then left child (left popped first).
```

```csharp
public IList<int> PreorderTraversal(TreeNode root)
{
    var res = new List<int>();
    if (root == null) return res;
    var stack = new Stack<TreeNode>();
    stack.Push(root);
    while (stack.Count > 0)
    {
        var node = stack.Pop();
        res.Add(node.Val);
        if (node.Right != null) stack.Push(node.Right);
        if (node.Left  != null) stack.Push(node.Left);
    }
    return res;
}
```

> **Key insight:** push right before left so the left child is popped (visited) first.

---

### Binary Tree Postorder Traversal — LeetCode 145

Return the postorder (left → right → root) traversal of a binary tree's node values.

**Example:** `root = [1,null,2,3]` → `[3,2,1]`

```text
RECURSIVE | O(n) | O(h)

Recurse left, recurse right, then visit root.

------------------------------------------------------------------------------

OPTIMAL — REVERSE PREORDER | O(n) | O(n)

Collect in "root, right, left" order (mirror of preorder), then reverse.
```

```csharp
public IList<int> PostorderTraversal(TreeNode root)
{
    var res = new List<int>();
    if (root == null) return res;
    var stack = new Stack<TreeNode>();
    stack.Push(root);
    while (stack.Count > 0)
    {
        var node = stack.Pop();
        res.Add(node.Val);
        if (node.Left  != null) stack.Push(node.Left);
        if (node.Right != null) stack.Push(node.Right);
    }
    res.Reverse();
    return res;
}
```

> **Key insight:** postorder = reverse of "root, right, left" preorder variant — avoids the complex two-stack iterative approach.

---

### Invert Binary Tree — LeetCode 226

Invert (mirror) a binary tree and return its root.

**Example:** `root = [4,2,7,1,3,6,9]` → `[4,7,2,9,6,3,1]`

```text
OPTIMAL — DFS RECURSIVE | O(n) | O(h)

Swap left and right children at every node (postorder or preorder both work).
```

```csharp
public TreeNode InvertTree(TreeNode root)
{
    if (root == null) return null;
    (root.Left, root.Right) = (root.Right, root.Left);
    InvertTree(root.Left);
    InvertTree(root.Right);
    return root;
}
```

> **Key insight:** swap children at every node — order doesn't matter since we process both subtrees.

---

### Symmetric Tree — LeetCode 101

Determine whether a binary tree is symmetric (a mirror of itself).

**Example:** `root = [1,2,2,3,4,4,3]` → `true`

```text
OPTIMAL — RECURSIVE PAIR COMPARISON | O(n) | O(h)

Compare the tree with its mirror: left's left vs right's right, left's right vs right's left.
```

```csharp
public bool IsSymmetric(TreeNode root)
{
    bool Mirror(TreeNode a, TreeNode b)
    {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.Val == b.Val
            && Mirror(a.Left,  b.Right)
            && Mirror(a.Right, b.Left);
    }
    return Mirror(root?.Left, root?.Right);
}
```

> **Key insight:** symmetry is equivalent to checking that the left subtree mirrors the right subtree — compare outer pairs and inner pairs recursively.

---

### Same Tree — LeetCode 100

Determine if two binary trees are structurally identical with the same node values.

**Example:** `p = [1,2,3], q = [1,2,3]` → `true`

```text
OPTIMAL — RECURSIVE | O(n) | O(h)

Both null → true; one null → false; values differ → false; recurse both sides.
```

```csharp
public bool IsSameTree(TreeNode p, TreeNode q)
{
    if (p == null && q == null) return true;
    if (p == null || q == null) return false;
    return p.Val == q.Val
        && IsSameTree(p.Left,  q.Left)
        && IsSameTree(p.Right, q.Right);
}
```

> **Key insight:** structural equality decomposes perfectly into recursive sub-problems — base cases handle all null combinations.

---

## Depth and Structure

### Maximum Depth of Binary Tree — LeetCode 104

Return the maximum depth (number of nodes along the longest root-to-leaf path) of a binary tree.

**Example:** `root = [3,9,20,null,null,15,7]` → `3`

```text
OPTIMAL — DFS BOTTOM-UP | O(n) | O(h)

max_depth(node) = 1 + max(max_depth(left), max_depth(right)), base 0 for null.
```

```csharp
public int MaxDepth(TreeNode root)
{
    if (root == null) return 0;
    return 1 + Math.Max(MaxDepth(root.Left), MaxDepth(root.Right));
}
```

> **Key insight:** maximum depth = 1 + max of children's depths — classic bottom-up recursion with a trivial base case.

---

### Minimum Depth of Binary Tree — LeetCode 111

Return the minimum depth: the number of nodes along the shortest root-to-leaf path.

**Example:** `root = [2,null,3,null,4,null,5,null,6]` → `5`

```text
BRUTE FORCE — DFS | O(n) | O(h)

Recurse left and right; return 1 + min of children. BUG: a node with one null child
is not a leaf — must handle the case where one subtree is null.

------------------------------------------------------------------------------

OPTIMAL — DFS WITH ONE-NULL FIX | O(n) | O(h)

If left is null, only descend right (and vice versa).
BFS also works and stops as soon as the first leaf is found.
```

```csharp
public int MinDepth(TreeNode root)
{
    if (root == null) return 0;
    if (root.Left  == null) return 1 + MinDepth(root.Right);
    if (root.Right == null) return 1 + MinDepth(root.Left);
    return 1 + Math.Min(MinDepth(root.Left), MinDepth(root.Right));
}
```

> **Key insight:** a node with one null child is NOT a leaf — if you apply `min` naively you'll return the null side's depth of 0, giving wrong results.

---

### Balanced Binary Tree — LeetCode 110

Determine whether a binary tree is height-balanced (every node's subtree heights differ by at most 1).

**Example:** `root = [3,9,20,null,null,15,7]` → `true`

```text
BRUTE FORCE — TOP-DOWN | O(n²) | O(h)

For each node compute height of both subtrees. Repeated height calls are wasteful.

------------------------------------------------------------------------------

OPTIMAL — BOTTOM-UP WITH SENTINEL | O(n) | O(h)

Return -1 as sentinel for "already unbalanced" so subtrees short-circuit.
```

```csharp
public bool IsBalanced(TreeNode root)
{
    int Check(TreeNode node)
    {
        if (node == null) return 0;
        int l = Check(node.Left);  if (l == -1) return -1;
        int r = Check(node.Right); if (r == -1) return -1;
        if (Math.Abs(l - r) > 1) return -1;
        return 1 + Math.Max(l, r);
    }
    return Check(root) != -1;
}
```

> **Key insight:** return −1 as a sentinel for "subtree is unbalanced" to short-circuit and avoid O(n²) repeated height calls.

---

### Diameter of Binary Tree — LeetCode 543

Return the length (in edges) of the longest path between any two nodes in a binary tree.

**Example:** `root = [1,2,3,4,5]` → `3`

```text
BRUTE FORCE | O(n²) | O(n)

diameter(node) = height(left) + height(right); compute for every node and take max.

------------------------------------------------------------------------------

OPTIMAL — SINGLE POSTORDER PASS | O(n) | O(h)

Compute height bottom-up; update global diameter as l + r at each node.
```

```csharp
public int DiameterOfBinaryTree(TreeNode root)
{
    int diameter = 0;
    int Dfs(TreeNode node)
    {
        if (node == null) return 0;
        int l = Dfs(node.Left);
        int r = Dfs(node.Right);
        diameter = Math.Max(diameter, l + r);
        return 1 + Math.Max(l, r);
    }
    Dfs(root);
    return diameter;
}
```

> **Key insight:** the diameter through a node = left height + right height; combine height computation and diameter tracking in one pass to avoid O(n²).

---

### Count Good Nodes in Binary Tree — LeetCode 1448

Count nodes where no node on the path from root to that node has a value greater than the node's value.

**Example:** `root = [3,1,4,3,null,1,5]` → `4`

```text
OPTIMAL — DFS TOP-DOWN | O(n) | O(h)

Pass the max value seen on the path from root; a node is good if its value ≥ max.
```

```csharp
public int GoodNodes(TreeNode root)
{
    int Dfs(TreeNode node, int maxSoFar)
    {
        if (node == null) return 0;
        int good = node.Val >= maxSoFar ? 1 : 0;
        int newMax = Math.Max(maxSoFar, node.Val);
        return good + Dfs(node.Left, newMax) + Dfs(node.Right, newMax);
    }
    return Dfs(root, int.MinValue);
}
```

> **Key insight:** top-down DFS carrying the running maximum — a node is good iff its value is ≥ max on path from root.

---

### Subtree of Another Tree — LeetCode 572

Given trees `root` and `subRoot`, return true if there is a node in `root` whose subtree is identical to `subRoot`.

**Example:** `root = [3,4,5,1,2], subRoot = [4,1,2]` → `true`

```text
BRUTE FORCE — O(n·m) | O(h)

At each node of root, check if the subtrees are the same (IsSameTree).

------------------------------------------------------------------------------

OPTIMAL — SERIALIZE + STRING SEARCH | O(n + m) | O(n + m)

Serialize both trees with explicit null markers and delimiters.
Check if serialized subRoot is a substring (use KMP for O(n+m)).
```

```csharp
public bool IsSubtree(TreeNode root, TreeNode subRoot)
{
    bool IsSame(TreeNode a, TreeNode b)
    {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.Val == b.Val && IsSame(a.Left, b.Left) && IsSame(a.Right, b.Right);
    }
    if (root == null) return subRoot == null;
    if (IsSame(root, subRoot)) return true;
    return IsSubtree(root.Left, subRoot) || IsSubtree(root.Right, subRoot);
}
```

> **Key insight:** check identity at each node; the serialize+KMP variant achieves O(n+m) if needed. See [Tries and String Matching](../TriesAndStringMatching/TriesAndStringMatching.md) for KMP.

---

## Level Order (BFS)

### Binary Tree Level Order Traversal — LeetCode 102

Return the level-order traversal of a binary tree's node values (left to right, level by level).

**Example:** `root = [3,9,20,null,null,15,7]` → `[[3],[9,20],[15,7]]`

```text
OPTIMAL — BFS WITH SIZE SNAPSHOT | O(n) | O(w)

Snapshot q.Count before the inner loop; that many nodes belong to the current level.
```

```csharp
public IList<IList<int>> LevelOrder(TreeNode root)
{
    var res = new List<IList<int>>();
    if (root == null) return res;
    var q = new Queue<TreeNode>();
    q.Enqueue(root);
    while (q.Count > 0)
    {
        int size = q.Count;
        var level = new List<int>();
        for (int i = 0; i < size; i++)
        {
            var node = q.Dequeue();
            level.Add(node.Val);
            if (node.Left  != null) q.Enqueue(node.Left);
            if (node.Right != null) q.Enqueue(node.Right);
        }
        res.Add(level);
    }
    return res;
}
```

> **Key insight:** snapshot `int size = q.Count` before the inner loop — children enqueued during the loop belong to the next level, not the current one.

---

### Binary Tree Zigzag Level Order Traversal — LeetCode 103

Return the level-order traversal alternating left-to-right and right-to-left.

**Example:** `root = [3,9,20,null,null,15,7]` → `[[3],[20,9],[15,7]]`

```text
OPTIMAL — BFS WITH DIRECTION FLAG | O(n) | O(w)

Use level-order BFS; reverse each alternate level's list before adding to result.
```

```csharp
public IList<IList<int>> ZigzagLevelOrder(TreeNode root)
{
    var res = new List<IList<int>>();
    if (root == null) return res;
    var q = new Queue<TreeNode>();
    q.Enqueue(root);
    bool leftToRight = true;
    while (q.Count > 0)
    {
        int size = q.Count;
        var level = new List<int>();
        for (int i = 0; i < size; i++)
        {
            var node = q.Dequeue();
            level.Add(node.Val);
            if (node.Left  != null) q.Enqueue(node.Left);
            if (node.Right != null) q.Enqueue(node.Right);
        }
        if (!leftToRight) level.Reverse();
        res.Add(level);
        leftToRight = !leftToRight;
    }
    return res;
}
```

> **Key insight:** standard BFS + a boolean direction flag; reverse the list for right-to-left levels (or use a `LinkedList<int>` and `AddFirst`/`AddLast`).

---

### Binary Tree Right Side View — LeetCode 199

Return the values of the rightmost node at each level (as seen from the right side).

**Example:** `root = [1,2,3,null,5,null,4]` → `[1,3,4]`

```text
BFS | O(n) | O(w)

Level-order BFS; the last node dequeued in each level is the rightmost.

------------------------------------------------------------------------------

OPTIMAL — DFS (right child first) | O(n) | O(h)

DFS visiting right child first; the first node at each depth is the rightmost.
```

```csharp
public IList<int> RightSideView(TreeNode root)
{
    var res = new List<int>();
    void Dfs(TreeNode node, int depth)
    {
        if (node == null) return;
        if (depth == res.Count) res.Add(node.Val); // first visit at this depth
        Dfs(node.Right, depth + 1);
        Dfs(node.Left,  depth + 1);
    }
    Dfs(root, 0);
    return res;
}
```

> **Key insight:** DFS visiting right child first means the first time we reach a new depth, it's the rightmost node at that level.

---

### Populating Next Right Pointers in Each Node — LeetCode 116

Connect each node's `next` pointer to its next right neighbour (perfect binary tree).

**Example:** `root = [1,2,3,4,5,6,7]` → each node points to its level-neighbour.

```text
BFS | O(n) | O(n)

Level-order; link consecutive nodes within each level.

------------------------------------------------------------------------------

OPTIMAL — O(1) SPACE USING EXISTING NEXT POINTERS | O(n) | O(1)

Use the already-connected parent level to wire the child level.
```

```csharp
public Node Connect(Node root)
{
    var leftmost = root;
    while (leftmost?.Left != null)
    {
        var cur = leftmost;
        while (cur != null)
        {
            cur.Left.Next  = cur.Right;
            if (cur.Next != null) cur.Right.Next = cur.Next.Left;
            cur = cur.Next;
        }
        leftmost = leftmost.Left;
    }
    return root;
}
```

> **Key insight:** use the previous level's `next` pointers to traverse and wire the next level — O(1) space because no queue is needed.

---

## BST

### Validate Binary Search Tree — LeetCode 98

Determine if a binary tree is a valid BST.

**Example:** `root = [2,1,3]` → `true`

```text
BRUTE FORCE | O(n²) | O(n)

For every node check all left/right descendants. Inefficient.

------------------------------------------------------------------------------

OPTIMAL — TOP-DOWN BOUNDS | O(n) | O(h)

Pass (min, max) bounds down; use long to handle int.MinValue/MaxValue edge cases.
```

```csharp
public bool IsValidBST(TreeNode root, long min = long.MinValue, long max = long.MaxValue)
{
    if (root == null) return true;
    if (root.Val <= min || root.Val >= max) return false;
    return IsValidBST(root.Left,  min,       root.Val)
        && IsValidBST(root.Right, root.Val,  max);
}
```

> **Key insight:** pass tightening (min, max) bounds down — use `long` because node values can be `int.MinValue`/`int.MaxValue` and a strict inequality is required.

---

### Kth Smallest Element in a BST — LeetCode 230

Return the kth smallest value (1-indexed) in a BST.

**Example:** `root = [3,1,4,null,2], k = 1` → `1`

```text
BRUTE FORCE | O(n) | O(n)

Collect all values via inorder into a list; return list[k-1].

------------------------------------------------------------------------------

OPTIMAL — ITERATIVE INORDER (EARLY EXIT) | O(h + k) | O(h)

Stop inorder traversal as soon as the kth node is visited.
```

```csharp
public int KthSmallest(TreeNode root, int k)
{
    var stack = new Stack<TreeNode>();
    var cur = root;
    while (cur != null || stack.Count > 0)
    {
        while (cur != null) { stack.Push(cur); cur = cur.Left; }
        cur = stack.Pop();
        if (--k == 0) return cur.Val;
        cur = cur.Right;
    }
    return -1;
}
```

> **Key insight:** inorder traversal of a BST yields sorted order — stop after exactly k pops for O(h+k) without materialising the full sorted list.

---

### Convert Sorted Array to BST — LeetCode 108

Given a sorted array, convert it to a height-balanced BST.

**Example:** `nums = [-10,-3,0,5,9]` → `[0,-3,9,-10,null,5]`

```text
OPTIMAL — RECURSIVE MID | O(n) | O(log n)

Pick the middle element as root; recurse left half for left subtree, right half for right subtree.
```

```csharp
public TreeNode SortedArrayToBST(int[] nums)
{
    TreeNode Build(int lo, int hi)
    {
        if (lo > hi) return null;
        int mid = lo + (hi - lo) / 2;
        return new TreeNode(nums[mid], Build(lo, mid - 1), Build(mid + 1, hi));
    }
    return Build(0, nums.Length - 1);
}
```

> **Key insight:** always pick the middle index as root — guarantees the height difference between left and right subtrees is at most 1.

---

### Flatten Binary Tree to Linked List — LeetCode 114

Flatten a binary tree into a linked list in-place (using right pointers, preorder order).

**Example:** `root = [1,2,5,3,4,null,6]` → `[1,null,2,null,3,null,4,null,5,null,6]`

```text
RECURSIVE POSTORDER | O(n) | O(h)

Process right, then left, then link: set right = flattened-left, set right-tail → original-right.

------------------------------------------------------------------------------

OPTIMAL — MORRIS-LIKE ITERATIVE | O(n) | O(1)

While node has a left child, find rightmost of left subtree, link it to node.right,
move left subtree to right, set left = null, advance.
```

```csharp
public void Flatten(TreeNode root)
{
    var cur = root;
    while (cur != null)
    {
        if (cur.Left != null)
        {
            var rightmost = cur.Left;
            while (rightmost.Right != null) rightmost = rightmost.Right;
            rightmost.Right = cur.Right;
            cur.Right = cur.Left;
            cur.Left  = null;
        }
        cur = cur.Right;
    }
}
```

> **Key insight:** Morris-style threading — find the rightmost node of the left subtree, attach the original right subtree there, then move the left subtree to become the right child.

---

## Paths

### Path Sum — LeetCode 112

Determine if the tree has a root-to-leaf path that sums to `targetSum`.

**Example:** `root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22` → `true`

```text
OPTIMAL — DFS | O(n) | O(h)

Subtract node value from target; return true if leaf and remaining == 0.
```

```csharp
public bool HasPathSum(TreeNode root, int targetSum)
{
    if (root == null) return false;
    if (root.Left == null && root.Right == null) return root.Val == targetSum;
    return HasPathSum(root.Left,  targetSum - root.Val)
        || HasPathSum(root.Right, targetSum - root.Val);
}
```

> **Key insight:** at a leaf, check if the remaining sum equals the leaf's value; the null check must come before the leaf check.

---

### Path Sum II — LeetCode 113

Return all root-to-leaf paths that sum to `targetSum`.

**Example:** `root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22` → `[[5,4,11,2],[5,8,4,5]]`

```text
OPTIMAL — DFS WITH BACKTRACKING | O(n) | O(h)

Add to path on the way down; snapshot the path at a matching leaf; remove on the way back up.
```

```csharp
public IList<IList<int>> PathSum(TreeNode root, int targetSum)
{
    var res = new List<IList<int>>();
    void Dfs(TreeNode node, int remain, List<int> path)
    {
        if (node == null) return;
        path.Add(node.Val);
        if (node.Left == null && node.Right == null && remain == node.Val)
            res.Add(new List<int>(path));
        Dfs(node.Left,  remain - node.Val, path);
        Dfs(node.Right, remain - node.Val, path);
        path.RemoveAt(path.Count - 1);  // backtrack
    }
    Dfs(root, targetSum, new List<int>());
    return res;
}
```

> **Key insight:** `path.RemoveAt(path.Count - 1)` must run on ALL exit paths (both leaf match and non-leaf) — mutation without backtrack corrupts sibling branches.

---

### Path Sum III — LeetCode 437

Count downward paths (not necessarily root-to-leaf) whose node values sum to `targetSum`.

**Example:** `root = [10,5,-3,3,2,null,11,3,-2,null,1], targetSum = 8` → `3`

```text
BRUTE FORCE | O(n²) | O(h)

For every node, walk all downward paths from that node and count matches.

------------------------------------------------------------------------------

OPTIMAL — PREFIX SUM + HASHMAP | O(n) | O(n)

Same trick as Subarray Sum Equals K: track prefix sums on the root-to-node path.
Decrement count on backtrack so sibling branches are unaffected.
```

```csharp
public int PathSumIII(TreeNode root, int targetSum)
{
    var prefixCount = new Dictionary<long, int> { [0L] = 1 };
    int count = 0;
    void Dfs(TreeNode node, long runSum)
    {
        if (node == null) return;
        runSum += node.Val;
        count += prefixCount.GetValueOrDefault(runSum - targetSum);
        prefixCount[runSum] = prefixCount.GetValueOrDefault(runSum) + 1;
        Dfs(node.Left,  runSum);
        Dfs(node.Right, runSum);
        prefixCount[runSum]--;  // backtrack
    }
    Dfs(root, 0L);
    return count;
}
```

> **Key insight:** prefix-sum + hashmap turns an O(n²) brute force into O(n) — decrement the prefix count on backtrack so left/right sibling paths don't share state.

---

### Binary Tree Maximum Path Sum — LeetCode 124

Find the maximum sum of any path in a binary tree (path = any sequence of nodes along edges).

**Example:** `root = [-10,9,20,null,null,15,7]` → `42`

```text
BRUTE FORCE | O(n²) | O(n)

For every node, compute best path through it. Redundant height calls.

------------------------------------------------------------------------------

OPTIMAL — BOTTOM-UP TREE DP | O(n) | O(h)

At each node: update global answer with (left_gain + node.val + right_gain).
Return to parent: node.val + max(left_gain, right_gain)  [single branch only].
Clip negative subtree gains to 0.
```

```csharp
public int MaxPathSum(TreeNode root)
{
    int ans = int.MinValue;
    int Gain(TreeNode node)
    {
        if (node == null) return 0;
        int l = Math.Max(0, Gain(node.Left));
        int r = Math.Max(0, Gain(node.Right));
        ans = Math.Max(ans, node.Val + l + r);   // path through this node
        return node.Val + Math.Max(l, r);         // returned upward (single branch)
    }
    Gain(root);
    return ans;
}
```

> **Key insight:** two roles for each node — the "answer through node" (l + val + r, updates global) and "value returned upward" (val + max(l,r), single branch). These are different.

---

### House Robber III — LeetCode 337

Rob houses arranged in a binary tree; adjacent nodes cannot both be robbed. Return maximum stolen amount.

**Example:** `root = [3,2,3,null,3,null,1]` → `7`

```text
BRUTE FORCE | O(2ⁿ) | O(h)

Try rob/skip at every node.

------------------------------------------------------------------------------

OPTIMAL — TREE DP (POSTORDER) | O(n) | O(h)

Return (rob, skip) pair per node. See Dynamic Programming notes for state design.
```

```csharp
// For DP state framing see: Dynamic Programming (../DynamicProgramming/DynamicProgramming.md)
public int Rob(TreeNode root)
{
    (int rob, int skip) Dfs(TreeNode node)
    {
        if (node == null) return (0, 0);
        var (lr, ls) = Dfs(node.Left);
        var (rr, rs) = Dfs(node.Right);
        int rob  = node.Val + ls + rs;
        int skip = Math.Max(lr, ls) + Math.Max(rr, rs);
        return (rob, skip);
    }
    var (r, s) = Dfs(root);
    return Math.Max(r, s);
}
```

> **Key insight:** return a (rob, skip) pair from each subtree — avoids redundant recomputation and naturally expresses the adjacency constraint.

---

## Construction and Serialisation

### Construct Binary Tree from Preorder and Inorder Traversal — LeetCode 105

Build a binary tree given its preorder and inorder traversal arrays.

**Example:** `preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]` → `[3,9,20,null,null,15,7]`

```text
BRUTE FORCE | O(n²) | O(n)

For each preorder root, linear-scan inorder to find its position.

------------------------------------------------------------------------------

OPTIMAL — HASHMAP FOR O(1) INORDER LOOKUP | O(n) | O(n)

Store inorder index in a hashmap; use a preorder pointer that advances left before right.
```

```csharp
public TreeNode BuildTree(int[] preorder, int[] inorder)
{
    var inIdx = new Dictionary<int, int>();
    for (int i = 0; i < inorder.Length; i++) inIdx[inorder[i]] = i;
    int pre = 0;
    TreeNode Build(int lo, int hi)
    {
        if (lo > hi) return null;
        int rootVal = preorder[pre++];
        int mid = inIdx[rootVal];
        return new TreeNode(rootVal, Build(lo, mid - 1), Build(mid + 1, hi));
    }
    return Build(0, inorder.Length - 1);
}
```

> **Key insight:** preorder gives root first; inorder index splits left/right subtree sizes. Hashmap gives O(1) lookups; left subtree must be built before right (preorder pointer advances in order).

---

### Construct Binary Tree from Inorder and Postorder Traversal — LeetCode 106

Build a binary tree given its inorder and postorder traversal arrays.

**Example:** `inorder = [9,3,15,20,7], postorder = [9,15,7,20,3]` → `[3,9,20,null,null,15,7]`

```text
OPTIMAL — HASHMAP, READ POSTORDER FROM END | O(n) | O(n)

Postorder root is at the END; read right-to-left (root → right → left).
Build right subtree before left because we consume postorder from the end.
```

```csharp
public TreeNode BuildTreePost(int[] inorder, int[] postorder)
{
    var inIdx = new Dictionary<int, int>();
    for (int i = 0; i < inorder.Length; i++) inIdx[inorder[i]] = i;
    int post = postorder.Length - 1;
    TreeNode Build(int lo, int hi)
    {
        if (lo > hi) return null;
        int rootVal = postorder[post--];
        int mid = inIdx[rootVal];
        var right = Build(mid + 1, hi);    // right FIRST — post decrements rightward
        var left  = Build(lo,      mid - 1);
        return new TreeNode(rootVal, left, right);
    }
    return Build(0, inorder.Length - 1);
}
```

> **Key insight:** postorder root is the last element; consume right-to-left, so build the right subtree before the left — the opposite of the preorder case.

---

### Serialize and Deserialize Binary Tree — LeetCode 297

Design an algorithm to serialise a binary tree to a string and deserialise it back.

**Example:** `root = [1,2,3,null,null,4,5]` → serialise → deserialise → same tree.

```text
OPTIMAL — PREORDER WITH NULL MARKERS | O(n) | O(n)

Use preorder DFS; write "null," for null nodes.
Deserialise by consuming tokens left-to-right and reconstructing top-down.
```

```csharp
public string Serialize(TreeNode root)
{
    var sb = new StringBuilder();
    void Dfs(TreeNode n)
    {
        if (n == null) { sb.Append("null,"); return; }
        sb.Append(n.Val).Append(',');
        Dfs(n.Left);
        Dfs(n.Right);
    }
    Dfs(root);
    return sb.ToString();
}

public TreeNode Deserialize(string data)
{
    var q = new Queue<string>(data.Split(','));
    TreeNode Build()
    {
        string val = q.Dequeue();
        if (val == "null") return null;
        return new TreeNode(int.Parse(val), Build(), Build());
    }
    return Build();
}
```

> **Key insight:** explicit null markers in preorder serialisation uniquely encode any binary tree — no inorder array is needed because the structure is embedded in the null markers.

---

## Ancestors

### Lowest Common Ancestor of a BST — LeetCode 235

Find the LCA of two nodes in a BST (no need to traverse full tree).

**Example:** `root = [6,2,8,0,4,7,9], p = 2, q = 8` → `6`

```text
OPTIMAL — BST PROPERTY WALK | O(h) | O(1)

If both p,q < root → go left. If both > root → go right. Otherwise root is the split = LCA.
```

```csharp
public TreeNode LowestCommonAncestorBST(TreeNode root, TreeNode p, TreeNode q)
{
    while (root != null)
    {
        if      (p.Val < root.Val && q.Val < root.Val) root = root.Left;
        else if (p.Val > root.Val && q.Val > root.Val) root = root.Right;
        else return root;
    }
    return null;
}
```

> **Key insight:** exploit BST ordering — the LCA is the first node where p and q "split" (one goes left, the other goes right, or one equals the node).

---

### Lowest Common Ancestor of a Binary Tree — LeetCode 236

Find the LCA of two nodes in a general binary tree.

**Example:** `root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1` → `3`

```text
PATH-BASED | O(n) | O(n)

Find paths to both nodes; compare paths for the last common node. Uses O(n) space.

------------------------------------------------------------------------------

OPTIMAL — POSTORDER RECURSION | O(n) | O(h)

Search both subtrees; if both return non-null, current node is LCA.
If only one side finds a target, bubble it up.
```

```csharp
public TreeNode LowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q)
{
    if (root == null || root == p || root == q) return root;
    var left  = LowestCommonAncestor(root.Left,  p, q);
    var right = LowestCommonAncestor(root.Right, p, q);
    if (left != null && right != null) return root;
    return left ?? right;
}
```

> **Key insight:** if both subtrees return non-null results, the current node is the LCA; otherwise bubble up the non-null side — works because both p and q are guaranteed to exist in the tree.
