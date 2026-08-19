# Trees

> **Scope** - Binary trees and BSTs (traversal, invariants, construction), balanced-tree trade-offs, Tries, Segment Trees, and Fenwick trees, with C# templates for the patterns senior interviews actually test.

**Contents**
- [1. Core Concepts](#1-core-concepts)
- [2. Complexity Reference](#2-complexity-reference)
- [3. C# Toolbox](#3-c-toolbox)
- [4. Core Patterns / Techniques](#4-core-patterns--techniques)
- [5. Classic Problems & Solutions](#5-classic-problems--solutions)
- [6. Pattern Recognition](#6-pattern-recognition)
- [7. Interview Focus](#7-interview-focus)
- [8. Common Traps & Edge Cases](#8-common-traps--edge-cases)
- [9. Related LeetCode Problems](#9-related-leetcode-problems)
- [10. Cheat Sheet](#10-cheat-sheet)
- [See Also](#see-also)

---

## 1. Core Concepts

A **tree** is connected and acyclic: one root, every non-root node has exactly one parent, and zero or more children. A **binary tree** has at most two children, conventionally `Left` and `Right`.

```csharp
public class TreeNode
{
    public int Val;
    public TreeNode? Left;
    public TreeNode? Right;

    public TreeNode(int val = 0, TreeNode? left = null, TreeNode? right = null)
    {
        Val = val;
        Left = left;
        Right = right;
    }
}
```

> **BST invariant** - For every node, all values in `Left` are smaller and all values in `Right` are larger (strict BST). Therefore inorder traversal yields strictly sorted values.

### 1.1 Terminology

| Term | Meaning |
| --- | --- |
| Height of a node | Edges on the longest downward path to a leaf; a leaf has height 0. |
| Depth of a node | Edges from root to that node; root depth is 0. |
| Height of a tree | Height of the root; drives O(h) search/stack bounds. |
| Level | Depth + 1 under the common root = level 1 convention. |
| Full / strict binary tree | Every node has 0 or 2 children. |
| Complete binary tree | All levels filled except possibly the last, filled left to right with no gaps. |
| Perfect binary tree | All internal nodes have 2 children and all leaves are at the same level. |
| Degenerate / skewed tree | Every node has one child; behaves like a linked list. |
| Balanced binary tree | Height is O(log n), or stricter: every node's child heights differ by at most 1. |

### 1.2 Formulas and reasoning

| Formula | Expression |
| --- | --- |
| Nodes at level *i* (root = level 1) | 2^(i-1) |
| Max nodes at height *h* (level-count convention, root height = 1) | 2^h - 1 |
| Max nodes at height *h* (edge-count convention, root height = 0) | 2^(h+1) - 1 |
| Min possible levels for *n* nodes | ⌈log₂(n+1)⌉ |
| Min possible height for *n* nodes (edge-count convention) | ⌈log₂(n+1)⌉ - 1 |
| Leaves in a full binary tree | (nodes with exactly 2 children) + 1 |
| Distinct BSTs with *n* unique keys | Catalan(n) = C(2n, n) / (n+1) |
| Distinct unlabeled binary-tree shapes with *n* nodes | Also Catalan(n); sorted inorder then forces one key assignment for each BST shape. |

Balanced height turns O(h) into O(log n); skewed height makes the same code O(n). Prefer `Dictionary` for unordered average O(1) lookup; use BSTs when sorted iteration, range queries, floor/ceiling, or kth-order behavior matters. Threaded binary trees and Morris traversal reuse null child links as inorder predecessor/successor links for O(1)-space traversal; Huffman trees are built greedily by repeatedly merging the two least frequent nodes (min-heap O(n log n), or two queues in O(n) if frequencies are already sorted).

---

## 2. Complexity Reference

| Operation | Time | Space | Notes |
| --- | --- | --- | --- |
| DFS traversal (pre/in/post), recursive | O(n) | O(h) | Call stack depth = tree height; O(n) worst case on a skewed tree |
| DFS traversal, iterative (stack) | O(n) | O(h) | Same bound as recursive, but stack is on the heap and avoids C# recursion-depth limits |
| Morris inorder traversal | O(n) | O(1) | Each edge is threaded/un-threaded at most once; temporarily mutates the tree |
| Level-order (BFS) | O(n) | O(w) | `w` = max width; up to ⌈n/2⌉ for a perfect tree's last level |
| BST search / insert / delete, balanced | O(log n) | O(1) iterative, O(h) recursive | Height bounded by O(log n) |
| BST search / insert / delete, skewed | O(n) | O(n) worst | Degenerates to a linked list; sorted inserts without balancing cause this |
| AVL / Red-Black search / insert / delete | O(log n) guaranteed | O(1) iterative; O(log n) recursive | Self-balancing bounds height regardless of insertion order |
| Kth smallest, plain inorder | O(n) | O(n) | Materializes the whole sequence |
| Kth smallest, early-stop inorder | O(h + k) | O(h) | Stops once kth element is popped |
| Kth smallest, size-augmented BST | O(log n) balanced | O(1) | Subtree sizes skip whole subtrees |
| Trie insert / search / startsWith | O(m) | O(m) new nodes worst case | `m` = key length, independent of stored key count |
| Trie delete | O(m) | O(m) recursion stack | Prunes dead nodes on unwind |
| Segment tree build | O(n) | O(n) (4n array is safe) | |
| Segment tree point update / range query | O(log n) | O(log n) recursion | |
| Segment tree range update (lazy propagation) | O(log n) amortized | O(n) lazy array + O(log n) recursion | Without laziness, range update is O(n) |
| BIT (Fenwick) update / prefix query | O(log n) | O(1) | Array is `n+1`, 1-indexed internally |

> **Remember** - Every `O(h)` recursion/stack bound is `O(log n)` only for balanced trees and `O(n)` for skewed trees.

---

## 3. C# Toolbox

| Type / API | Use for | Gotcha |
| --- | --- | --- |
| `SortedDictionary<TKey,TValue>` / `SortedSet<T>` | Ordered map/set implemented as a red-black tree | No kth API; use `GetViewBetween` for range views |
| `Dictionary<TKey,TValue>` | Trie children, memo caches, value-to-index maps for reconstruction | O(1) average, unordered |
| `PriorityQueue<TElement,TPriority>` | Huffman construction, k-way merges | Min-heap; no decrease-key or remove-by-value |
| `Queue<T>` | BFS / level order | Snapshot `Count` before processing a level |
| `Stack<T>` | Iterative DFS and controlled inorder | Push right before left for preorder |
| `int[]` / `Span<T>` | Segment tree and BIT backing storage | Cache-friendly; avoid per-node allocation |
| Nullable references (`TreeNode?`) | Explicit absent children | Null checks prevent the common tree NRE |

---

## 4. Core Patterns / Techniques

### 4.1 DFS Traversals - Recursive (Pre / In / Post)

**Use when** a subtree result composes directly into the parent. **Contract:** a null subtree appends nothing; the helper appends the traversal of `node`'s subtree.

```csharp
public void Preorder(TreeNode? node, List<int> output)
{
    if (node == null) return;
    output.Add(node.Val);        // Node
    Preorder(node.Left, output); // Left
    Preorder(node.Right, output);// Right
}

public void Inorder(TreeNode? node, List<int> output)
{
    if (node == null) return;
    Inorder(node.Left, output);
    output.Add(node.Val);
    Inorder(node.Right, output);
}

public void Postorder(TreeNode? node, List<int> output)
{
    if (node == null) return;
    Postorder(node.Left, output);
    Postorder(node.Right, output);
    output.Add(node.Val);
}
```

Orders: preorder = N,L,R; inorder = L,N,R; postorder = L,R,N. Complexity O(n) time, O(h) stack; use iterative on adversarial 10^4+ node skewed inputs to avoid stack overflow.

### 4.2 DFS Traversals - Iterative (Stack-Based)

**Use when** recursion depth is risky or the follow-up says "without recursion".

```csharp
public IList<int> PreorderIterative(TreeNode? root)
{
    var result = new List<int>();
    if (root == null) return result;
    var stack = new Stack<TreeNode>();
    stack.Push(root);
    while (stack.Count > 0)
    {
        var node = stack.Pop();
        result.Add(node.Val);
        if (node.Right != null) stack.Push(node.Right);
        if (node.Left != null) stack.Push(node.Left);
    }
    return result;
}

public IList<int> InorderIterative(TreeNode? root)
{
    var result = new List<int>();
    var stack = new Stack<TreeNode>();
    var curr = root;
    while (curr != null || stack.Count > 0)
    {
        while (curr != null) { stack.Push(curr); curr = curr.Left; }
        var node = stack.Pop();
        result.Add(node.Val);
        curr = node.Right;
    }
    return result;
}

public IList<int> PostorderIterative(TreeNode? root)
{
    var result = new List<int>();
    if (root == null) return result;
    var stack = new Stack<TreeNode>();
    stack.Push(root);
    while (stack.Count > 0)
    {
        var node = stack.Pop();
        result.Add(node.Val); // N,R,L
        if (node.Left != null) stack.Push(node.Left);
        if (node.Right != null) stack.Push(node.Right);
    }
    result.Reverse(); // L,R,N
    return result;
}
```

O(n) time, O(h) stack plus output. Avoid `Insert(0, ...)` for postorder; it makes the traversal O(n^2).

### 4.3 Morris Traversal (O(1) Space)

Idea: for a node with a left subtree, find its inorder predecessor. If `predecessor.Right` is null, set it to the current node and go left; if it already points back, clear it, visit current, and go right.

```csharp
public IList<int> MorrisInorder(TreeNode? root)
{
    var result = new List<int>();
    var curr = root;
    while (curr != null)
    {
        if (curr.Left == null)
        {
            result.Add(curr.Val);
            curr = curr.Right;
            continue;
        }

        var pred = curr.Left;
        while (pred!.Right != null && pred.Right != curr) pred = pred.Right;
        if (pred.Right == null)
        {
            pred.Right = curr;
            curr = curr.Left;
        }
        else
        {
            pred.Right = null;
            result.Add(curr.Val);
            curr = curr.Right;
        }
    }
    return result;
}
```

O(n) time, O(1) extra space. It temporarily mutates the tree, so it is unsafe with concurrent readers and every thread must be restored even on early exit.

### 4.4 Level-Order / BFS by Level

**Use for** per-level grouping, zigzag, right-side view, level averages, minimum depth, and shortest distance in an unweighted tree.

```csharp
public IList<IList<int>> LevelOrder(TreeNode? root)
{
    var result = new List<IList<int>>();
    if (root == null) return result;
    var queue = new Queue<TreeNode>();
    queue.Enqueue(root);
    while (queue.Count > 0)
    {
        int levelSize = queue.Count;
        var level = new List<int>(levelSize);
        for (int i = 0; i < levelSize; i++)
        {
            var node = queue.Dequeue();
            level.Add(node.Val);
            if (node.Left != null) queue.Enqueue(node.Left);
            if (node.Right != null) queue.Enqueue(node.Right);
        }
        result.Add(level);
    }
    return result;
}
```

| Variant | Trick | Space |
| --- | --- | --- |
| Zigzag | Reverse odd levels or fill a deque from alternating ends | O(w) |
| Right side view | Last node per BFS level, or DFS right-first first value per depth | O(w) BFS / O(h) DFS |
| Vertical traversal | Carry `(row, col)`, group by column, sort ties when required | O(n) |
| Minimum depth | BFS returns at the first leaf | O(w) |

O(n) time, O(w) space. Snapshot `queue.Count`; otherwise levels bleed together.

### 4.5 DFS Top-Down vs Bottom-Up

Top-down carries ancestor state into children; bottom-up returns child summaries to the parent.

```csharp
void TopDown(TreeNode? node, int pathSum, IList<int> results)
{
    if (node == null) return;
    pathSum += node.Val;
    if (node.Left == null && node.Right == null) results.Add(pathSum);
    TopDown(node.Left, pathSum, results);
    TopDown(node.Right, pathSum, results);
}

int BottomUpHeight(TreeNode? node) // node-count height; use null = -1 for edge-count height
{
    if (node == null) return 0;
    return 1 + Math.Max(BottomUpHeight(node.Left), BottomUpHeight(node.Right));
}
```

Top-down examples: running sum, max-so-far, path. Bottom-up examples: height, count, diameter, balance. Both are O(n) time and O(h) stack.

### 4.6 Tree DP (Diameter, Max Path Sum, House Robber III)

Pattern: compute child states first; return only what the parent can extend, while committing any answer that uses both children at the current node.

```csharp
public int DiameterOfBinaryTree(TreeNode? root)
{
    int diameter = 0;
    Height(root);
    return diameter;

    int Height(TreeNode? node) // node-count height; left + right is edge-count diameter through node
    {
        if (node == null) return 0;
        int left = Height(node.Left);
        int right = Height(node.Right);
        diameter = Math.Max(diameter, left + right);
        return 1 + Math.Max(left, right);
    }
}

public int MaxPathSum(TreeNode root)
{
    int best = int.MinValue;
    Gain(root);
    return best;

    int Gain(TreeNode? node) // best one-arm gain extendable by the parent
    {
        if (node == null) return 0;
        int left = Math.Max(Gain(node.Left), 0);
        int right = Math.Max(Gain(node.Right), 0);
        best = Math.Max(best, node.Val + left + right);
        return node.Val + Math.Max(left, right);
    }
}

public int Rob(TreeNode? root)
{
    var (take, skip) = Dfs(root);
    return Math.Max(take, skip);

    (int take, int skip) Dfs(TreeNode? node)
    {
        if (node == null) return (0, 0);
        var left = Dfs(node.Left);
        var right = Dfs(node.Right);
        return (node.Val + left.skip + right.skip,
                Math.Max(left.take, left.skip) + Math.Max(right.take, right.skip));
    }
}
```

O(n) time, O(h) stack. Max-path-sum must clamp negative arms to 0 and initialize `best` to `int.MinValue`.
### 4.7 BST Search / Insert / Delete

**Use when** you need an ordered dynamic set/map and can reason in terms of height `h`.

```csharp
public TreeNode? Search(TreeNode? root, int key)
{
    while (root != null && root.Val != key)
        root = key < root.Val ? root.Left : root.Right;
    return root;
}

public TreeNode Insert(TreeNode? root, int key)
{
    if (root == null) return new TreeNode(key);
    if (key < root.Val) root.Left = Insert(root.Left, key);
    else if (key > root.Val) root.Right = Insert(root.Right, key);
    return root; // duplicate keys ignored; define a convention if duplicates are allowed
}

public TreeNode? Delete(TreeNode? root, int key)
{
    if (root == null) return null;
    if (key < root.Val) { root.Left = Delete(root.Left, key); return root; }
    if (key > root.Val) { root.Right = Delete(root.Right, key); return root; }

    // Case 1: leaf, or case 2: one child.
    if (root.Left == null) return root.Right;
    if (root.Right == null) return root.Left;

    // Case 3: two children - copy inorder successor, then delete that successor.
    var successor = root.Right;
    while (successor!.Left != null) successor = successor.Left;
    root.Val = successor.Val;
    root.Right = Delete(root.Right, successor.Val);
    return root;
}
```

O(h) time; O(1) iterative search space, O(h) recursive insert/delete stack. The two-child delete must remove the copied successor from the right subtree or a duplicate remains.

### 4.8 BST Validation

```csharp
public bool IsValidBST(TreeNode? root) => Validate(root, long.MinValue, long.MaxValue);

private bool Validate(TreeNode? node, long min, long max)
{
    if (node == null) return true;
    if (node.Val <= min || node.Val >= max) return false;
    return Validate(node.Left, min, node.Val)
        && Validate(node.Right, node.Val, max);
}
```

O(n) time, O(h) stack. Local parent-child checks are insufficient; every node must satisfy all ancestor bounds. Example failure: `10` has right child `15`, whose left child is `6`; `6 < 15` locally, but `6` violates the inherited lower bound `> 10`.

### 4.9 Kth Smallest / Floor / Ceiling / Successor

```csharp
public int KthSmallest(TreeNode? root, int k)
{
    if (k <= 0) throw new ArgumentOutOfRangeException(nameof(k));
    var stack = new Stack<TreeNode>();
    var curr = root;
    while (curr != null || stack.Count > 0)
    {
        while (curr != null) { stack.Push(curr); curr = curr.Left; }
        var node = stack.Pop();
        if (--k == 0) return node.Val;
        curr = node.Right;
    }
    throw new ArgumentOutOfRangeException(nameof(k));
}

public int? Floor(TreeNode? root, int key) // largest value <= key
{
    int? ans = null;
    while (root != null)
    {
        if (root.Val == key) return root.Val;
        if (root.Val < key) { ans = root.Val; root = root.Right; }
        else root = root.Left;
    }
    return ans;
}

public int? Ceiling(TreeNode? root, int key) // smallest value >= key
{
    int? ans = null;
    while (root != null)
    {
        if (root.Val == key) return root.Val;
        if (root.Val > key) { ans = root.Val; root = root.Left; }
        else root = root.Right;
    }
    return ans;
}

public TreeNode? InorderSuccessor(TreeNode? root, TreeNode p)
{
    TreeNode? successor = null;
    while (root != null)
    {
        if (p.Val < root.Val) { successor = root; root = root.Left; }
        else root = root.Right;
    }
    return successor;
}
```

Early-stop kth = O(h + k) time, O(h) space. Floor/ceiling/successor = O(h), O(1). For many rank queries, maintain subtree sizes and choose left/current/right by `leftSize` for O(log n) on a balanced tree; update sizes on every insert/delete.

### 4.10 LCA - BST vs General Binary Tree

```csharp
public TreeNode? LowestCommonAncestorBST(TreeNode? root, TreeNode p, TreeNode q)
{
    while (root != null)
    {
        if (p.Val < root.Val && q.Val < root.Val) root = root.Left;
        else if (p.Val > root.Val && q.Val > root.Val) root = root.Right;
        else return root;
    }
    return null;
}

public TreeNode? LowestCommonAncestor(TreeNode? root, TreeNode p, TreeNode q)
{
    if (root == null || root == p || root == q) return root;
    var left = LowestCommonAncestor(root.Left, p, q);
    var right = LowestCommonAncestor(root.Right, p, q);
    return left != null && right != null ? root : left ?? right;
}

public class ParentTreeNode
{
    public int Val;
    public ParentTreeNode? Left;
    public ParentTreeNode? Right;
    public ParentTreeNode? Parent;
}

public ParentTreeNode? LowestCommonAncestorWithParentPointers(ParentTreeNode? p, ParentTreeNode? q)
{
    int pd = Depth(p), qd = Depth(q);
    while (pd > qd && p != null) { p = p.Parent; pd--; }
    while (qd > pd && q != null) { q = q.Parent; qd--; }
    while (p != q) { p = p?.Parent; q = q?.Parent; }
    return p;
}

private int Depth(ParentTreeNode? node)
{
    int depth = 0;
    while (node?.Parent != null) { depth++; node = node.Parent; }
    return depth;
}
```

BST LCA is O(h), O(1). General-tree LCA is O(n), O(h). Parent-pointer LCA is O(h), O(1). If `p` or `q` may be absent, verify existence first; the generic recursive version otherwise returns the one found node.

### 4.11 Balanced Trees - AVL vs Red-Black

Unbalanced BSTs make ordered operations O(n); self-balancing trees keep height O(log n). Interviewers usually want properties and trade-offs, not a red-black insertion implementation.

| Structure | Invariant / height | Production fit |
| --- | --- | --- |
| AVL | `abs(height(left) - height(right)) <= 1`; height ≤ ~1.44 log₂(n+2) | Shorter tree, faster lookups, more rebalancing; good for read-heavy in-memory indexes |
| Red-Black | No two consecutive red nodes; equal black-node count on root-to-null paths; height ≤ 2 log₂(n+1) | Looser balance, cheaper writes; .NET `SortedDictionary`/`SortedSet`, Java `TreeMap`, C++ `std::map` |
| B / B+ tree | High fan-out nodes sized for pages/cache lines | Databases/filesystems; B+ keeps records in leaves and linked leaves support range scans |

AVL insert needs at most one single/double rotation; AVL delete can cascade upward. Red-black insert uses at most 2 rotations plus recolors; delete uses at most 3 rotations. Use library ordered maps unless explicitly asked to implement balancing.

### 4.12 Tries

**Use for** repeated prefix operations: autocomplete, `startsWith`, dictionary validation, longest-prefix routing, and word-search pruning.

```csharp
public class TrieNode
{
    public Dictionary<char, TrieNode> Children { get; } = new();
    public bool IsEndOfWord { get; set; }
}

public class Trie
{
    private readonly TrieNode _root = new();

    public void Insert(string word)
    {
        var node = _root;
        foreach (char c in word)
        {
            if (!node.Children.TryGetValue(c, out var next))
                node.Children[c] = next = new TrieNode();
            node = next;
        }
        node.IsEndOfWord = true;
    }

    public bool Search(string word) => Find(word)?.IsEndOfWord == true;
    public bool StartsWith(string prefix) => Find(prefix) != null;
    public bool Delete(string word) => DeleteRec(_root, word, 0).deleted;

    private TrieNode? Find(string s)
    {
        var node = _root;
        foreach (char c in s)
        {
            if (!node.Children.TryGetValue(c, out var next)) return null;
            node = next;
        }
        return node;
    }

    private (bool deleted, bool prune) DeleteRec(TrieNode node, string word, int depth)
    {
        if (depth == word.Length)
        {
            if (!node.IsEndOfWord) return (false, false);
            node.IsEndOfWord = false;
            return (true, node.Children.Count == 0);
        }

        char c = word[depth];
        if (!node.Children.TryGetValue(c, out var child)) return (false, false);
        var (deleted, pruneChild) = DeleteRec(child, word, depth + 1);
        if (!deleted) return (false, false);
        if (pruneChild) node.Children.Remove(c);
        return (true, node.Children.Count == 0 && !node.IsEndOfWord);
    }
}
```

O(m) per operation, where `m` is key length. Worst-case space is proportional to total characters inserted, but shared prefixes reduce it; `Dictionary` children avoid fixed alphabet arrays for sparse nodes.

### 4.13 Segment Tree

Use for many range queries over a mutable array when the operation is associative: sum, min, max, gcd, xor. Prefer an array-backed tree with `4n` slots for recursive implementations.

| Operation | Complexity | Key detail |
| --- | --- | --- |
| Build | O(n) | Each node stores the aggregate for an interval. |
| Range query | O(log n) | Return identity on no overlap, stored value on total overlap, otherwise combine children. |
| Point update | O(log n) | Update leaf, recompute ancestors. |
| Range update | O(log n) amortized with lazy propagation | Store pending deltas in `lazy[]` and push only when descending. |

Segment tree beats BIT when the aggregate is not invertible (min/max/gcd) or true range updates are required. For static arrays, prefix sums or sparse tables are often simpler.

### 4.14 Binary Indexed Tree (Fenwick)

Use for mutable prefix/range sums with less code and memory than a segment tree. Internally store an `n+1` 1-indexed array.

| Idea | Detail |
| --- | --- |
| `i & -i` | Isolates the lowest set bit: the size of the range owned by index `i`. |
| Update | Convert 0-based index to `i = index + 1`; add delta while `i <= n`, then `i += i & -i`. |
| Prefix query | Accumulate while `i > 0`, then `i -= i & -i`. |
| Range sum | `Prefix(r) - Prefix(l - 1)`. |

Build via n updates is O(n log n), or O(n) with the linear Fenwick build trick. Update/query are O(log n), space O(n). BIT requires an invertible associative operation; segment trees handle more operations and lazy range updates.

### 4.15 Serialize / Deserialize

Preorder plus explicit null markers uniquely reconstructs any binary tree; preorder alone or inorder alone does not.

```csharp
public class Codec
{
    public string Serialize(TreeNode? root)
    {
        var sb = new StringBuilder();
        Build(root);
        return sb.ToString();

        void Build(TreeNode? node)
        {
            if (node == null) { sb.Append("#,"); return; }
            sb.Append(node.Val).Append(',');
            Build(node.Left);
            Build(node.Right);
        }
    }

    public TreeNode? Deserialize(string data)
    {
        var tokens = new Queue<string>(data.Split(',', StringSplitOptions.RemoveEmptyEntries));
        return Build();

        TreeNode? Build()
        {
            if (tokens.Count == 0) throw new FormatException("Missing null marker.");
            string token = tokens.Dequeue();
            if (token == "#") return null;
            var node = new TreeNode(int.Parse(token));
            node.Left = Build();
            node.Right = Build();
            return node;
        }
    }
}
```

O(n) time, O(n) serialized data/queue, O(h) recursion stack.

### 4.16 Construct Binary Tree from Traversals

Use a value-to-inorder-index map so each split is O(1). These templates assume unique values; duplicates need occurrence-aware indexing.

```csharp
public TreeNode? BuildTree(int[] preorder, int[] inorder)
{
    if (preorder.Length != inorder.Length) throw new ArgumentException("Traversal lengths must match.");
    var index = new Dictionary<int, int>();
    for (int i = 0; i < inorder.Length; i++) index[inorder[i]] = i;

    int pre = 0;
    return Build(0, inorder.Length - 1);

    TreeNode? Build(int inLo, int inHi)
    {
        if (inLo > inHi) return null;
        int rootVal = preorder[pre++];
        var root = new TreeNode(rootVal);
        int mid = index[rootVal];
        root.Left = Build(inLo, mid - 1);  // preorder is N,L,R
        root.Right = Build(mid + 1, inHi);
        return root;
    }
}

public TreeNode? BuildTreeFromPostorder(int[] inorder, int[] postorder)
{
    if (inorder.Length != postorder.Length) throw new ArgumentException("Traversal lengths must match.");
    var index = new Dictionary<int, int>();
    for (int i = 0; i < inorder.Length; i++) index[inorder[i]] = i;

    int post = postorder.Length - 1;
    return Build(0, inorder.Length - 1);

    TreeNode? Build(int inLo, int inHi)
    {
        if (inLo > inHi) return null;
        int rootVal = postorder[post--];
        var root = new TreeNode(rootVal);
        int mid = index[rootVal];
        root.Right = Build(mid + 1, inHi); // backward postorder is N,R,L
        root.Left = Build(inLo, mid - 1);
        return root;
    }
}
```

O(n) time, O(n) map plus O(h) stack. Pre+in builds left before right; post+in consumed backward builds right before left.

### 4.17 Path Sum with Backtracking

Use when the path itself is part of the answer. Mutate one path list, copy on success, undo on unwind.

```csharp
public IList<IList<int>> PathSum(TreeNode? root, int targetSum)
{
    var results = new List<IList<int>>();
    var path = new List<int>();
    Dfs(root, targetSum);
    return results;

    void Dfs(TreeNode? node, long remaining)
    {
        if (node == null) return;
        path.Add(node.Val);
        remaining -= node.Val;
        if (node.Left == null && node.Right == null && remaining == 0)
            results.Add(new List<int>(path));
        Dfs(node.Left, remaining);
        Dfs(node.Right, remaining);
        path.RemoveAt(path.Count - 1);
    }
}
```

O(n + output size) time; copying paths can make output O(n^2) worst case. Auxiliary O(h) path/stack.

### 4.18 Post-Order Aggregation Template

Post-order is the default when a node needs both completed child answers first.

| At each node | Meaning |
| --- | --- |
| Return upward | One value the parent can use: height, one-arm gain, include/exclude tuple. |
| Update locally | Best answer that bends or ends here: diameter, max path sum, balanced sentinel. |
| Combine children | Compute left, compute right, then decide this node's return. |

```csharp
public bool IsBalanced(TreeNode? root) => HeightOrUnbalanced(root) != -1;

private int HeightOrUnbalanced(TreeNode? node)
{
    if (node == null) return 0;
    int left = HeightOrUnbalanced(node.Left);
    if (left == -1) return -1;
    int right = HeightOrUnbalanced(node.Right);
    if (right == -1) return -1;
    return Math.Abs(left - right) > 1 ? -1 : 1 + Math.Max(left, right);
}
```

O(n) time, O(h) stack; `-1` short-circuits once any subtree is unbalanced.

### 4.19 Path Sum III - Prefix Sum on Root-to-Node Paths

Count downward paths with target sum, where paths may start anywhere but must follow parent-to-child links. Same idea as subarray-sum equals k, with a path-local prefix map.

```csharp
public int PathSumAnyStart(TreeNode? root, int targetSum)
{
    var prefixCount = new Dictionary<long, int> { [0] = 1 };
    return Dfs(root, 0);

    int Dfs(TreeNode? node, long sum)
    {
        if (node == null) return 0;
        sum += node.Val;
        int total = prefixCount.GetValueOrDefault(sum - targetSum);
        prefixCount[sum] = prefixCount.GetValueOrDefault(sum) + 1;
        total += Dfs(node.Left, sum) + Dfs(node.Right, sum);
        prefixCount[sum]--;
        if (prefixCount[sum] == 0) prefixCount.Remove(sum);
        return total;
    }
}
```

O(n) expected time, O(h) prefix entries plus stack. Increment before children and decrement after; otherwise sibling paths leak into each other.

### 4.20 Tree ↔ Other Structures

| Conversion | Core idea | Use case |
| --- | --- | --- |
| BST to sorted doubly linked list | Inorder; link previous/current; optionally close circularly | Ordered iteration without extra array |
| Sorted array to balanced BST | Pick middle as root recursively | O(n), balanced height |
| Sorted linked list to balanced BST | Inorder simulation with moving list pointer | O(n); slow/fast middle split is O(n log n) |
| Binary tree to flattened linked list | Preorder right spine; null all left pointers | LC 114 |
| Tree to graph | Build child-to-parent map; BFS left/right/parent with visited set | distance-k, burn/infection time |

```csharp
public TreeNode? SortedArrayToBst(int[] nums)
{
    return Build(0, nums.Length - 1);

    TreeNode? Build(int lo, int hi)
    {
        if (lo > hi) return null;
        int mid = lo + (hi - lo) / 2;
        return new TreeNode(nums[mid])
        {
            Left = Build(lo, mid - 1),
            Right = Build(mid + 1, hi)
        };
    }
}

public void Flatten(TreeNode? root)
{
    TreeNode? previous = null;
    void Dfs(TreeNode? node)
    {
        if (node == null) return;
        Dfs(node.Right);
        Dfs(node.Left);
        node.Right = previous;
        node.Left = null;
        previous = node;
    }
    Dfs(root);
}
```

For sorted linked lists, avoid O(n log n) repeated middle scans by simulating inorder consumption of the list:

```csharp
public TreeNode? SortedListToBst(ListNode? head)
{
    int n = 0;
    for (var p = head; p != null; p = p.next) n++;

    var current = head;
    return Build(n);

    TreeNode? Build(int count)
    {
        if (count == 0) return null;
        var left = Build(count / 2);
        var root = new TreeNode(current!.val) { Left = left };
        current = current.next;
        root.Right = Build(count - count / 2 - 1);
        return root;
    }
}
```

Parent-map BFS for distance-k treats the tree as an undirected graph; use reference identity for nodes:

```csharp
public IList<int> DistanceK(TreeNode root, TreeNode target, int k)
{
    var parent = new Dictionary<TreeNode, TreeNode?>();
    BuildParent(root, null);

    var result = new List<int>();
    var seen = new HashSet<TreeNode> { target };
    var queue = new Queue<TreeNode>();
    queue.Enqueue(target);

    for (int distance = 0; queue.Count > 0; distance++)
    {
        int size = queue.Count;
        if (distance == k)
        {
            while (queue.Count > 0) result.Add(queue.Dequeue().Val);
            return result;
        }

        for (int i = 0; i < size; i++)
        {
            var node = queue.Dequeue();
            Add(node.Left);
            Add(node.Right);
            Add(parent[node]);
        }
    }
    return result;

    void Add(TreeNode? node)
    {
        if (node != null && seen.Add(node)) queue.Enqueue(node);
    }

    void BuildParent(TreeNode? node, TreeNode? par)
    {
        if (node == null) return;
        parent[node] = par;
        BuildParent(node.Left, node);
        BuildParent(node.Right, node);
    }
}
```

These conversions usually mutate pointers; call that out when other code may hold node references.

### 4.21 Structural Recursion - Same / Mirror / Subtree Checks

Use when both exact shape and values matter.

```csharp
public bool IsSameTree(TreeNode? a, TreeNode? b)
{
    if (a == null || b == null) return a == b;
    return a.Val == b.Val
        && IsSameTree(a.Left, b.Left)
        && IsSameTree(a.Right, b.Right);
}

public bool IsSymmetric(TreeNode? root) => root == null || IsMirror(root.Left, root.Right);

private bool IsMirror(TreeNode? a, TreeNode? b)
{
    if (a == null || b == null) return a == b;
    return a.Val == b.Val
        && IsMirror(a.Left, b.Right)
        && IsMirror(a.Right, b.Left);
}

public bool IsSubtree(TreeNode? root, TreeNode? subRoot)
{
    if (subRoot == null) return true;
    if (root == null) return false;
    return IsSameTree(root, subRoot)
        || IsSubtree(root.Left, subRoot)
        || IsSubtree(root.Right, subRoot);
}
```

Same/symmetric are O(n). Naive subtree is O(n * m); for repeated/large checks, serialize with null markers plus KMP, or use subtree hashes with collision awareness.

---

## 5. Classic Problems & Solutions

Use §4 templates; only remember the twist that changes the base pattern.

| Problem family | Pattern | Twist / senior signal | Time | Space |
| --- | --- | --- | --- | --- |
| Validate BST | Min/max bounds recursion (§4.8) | Bounds come from all ancestors; strict duplicates policy matters | O(n) | O(h) |
| Diameter / max depth / balanced | Post-order aggregation (§4.6/§4.18) | Return height upward; update diameter or `-1` sentinel locally | O(n) | O(h) |
| Max path sum / House Robber III | Tree DP (§4.6) | Return one-arm gain or take/skip tuple; update global best at node | O(n) | O(h) |
| Reconstruct from traversals | Hashmap + index arithmetic (§4.16) | Pre+in builds left first; post+in backward builds right first; unique values | O(n) | O(n) |
| Kth / predecessor / successor in BST | Controlled inorder or BST walk (§4.9) | Stop early; use subtree sizes if repeated rank queries | O(h+k) or O(h) | O(h) or O(1) |
| LCA variants | BST split, general DFS, or parent-depth alignment (§4.10) | Generic DFS assumes both nodes exist unless checked | O(h) or O(n) | O(1) or O(h) |
| Path Sum I/II | Top-down DFS/backtracking (§4.5/§4.17) | Copy a found path and undo mutation on unwind | O(n + output) | O(h) |
| Path Sum III | Prefix map on root-to-node path (§4.19) | Seed `0 -> 1`; decrement prefix counts after children | O(n) expected | O(h) |
| Right side / zigzag / vertical / min depth | Level-order variants (§4.4) | Snapshot level size; vertical traversal needs row/column tie rules | O(n log n) worst for sorted vertical ties, else O(n) | O(n) |
| Flatten / sorted input to BST / distance K | Tree conversion (§4.20) | Pointer mutation, inorder simulation for linked lists, parent map for graph view | O(n) | O(h) to O(n) |
| Same / symmetric / subtree | Structural recursion (§4.21) | Subtree needs null markers or hashes for faster exact matching | O(n * m) naive | O(h + m) |
| Word Search II | Trie + board backtracking (§4.12) | Shared prefixes prune DFS immediately | Roughly O(mn * 4^L) | Trie + path |

**Word Search II code worth keeping:** it combines Trie prefix pruning with in-place board backtracking and de-duplicates by clearing the terminal word.

```csharp
private class WordTrieNode
{
    public Dictionary<char, WordTrieNode> Children { get; } = new();
    public string? Word;
}

public IList<string> FindWords(char[][] board, string[] words)
{
    var root = BuildTrie(words);
    var found = new List<string>();
    int rows = board.Length, cols = board[0].Length;

    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            Dfs(r, c, root);
    return found;

    void Dfs(int r, int c, WordTrieNode node)
    {
        if (r < 0 || r == rows || c < 0 || c == cols || board[r][c] == '#') return;
        char ch = board[r][c];
        if (!node.Children.TryGetValue(ch, out var next)) return;

        if (next.Word != null)
        {
            found.Add(next.Word);
            next.Word = null;
        }

        board[r][c] = '#';
        Dfs(r + 1, c, next);
        Dfs(r - 1, c, next);
        Dfs(r, c + 1, next);
        Dfs(r, c - 1, next);
        board[r][c] = ch;
    }
}

private WordTrieNode BuildTrie(IEnumerable<string> words)
{
    var root = new WordTrieNode();
    foreach (string word in words)
    {
        var node = root;
        foreach (char ch in word)
        {
            if (!node.Children.TryGetValue(ch, out var next))
                node.Children[ch] = next = new WordTrieNode();
            node = next;
        }
        node.Word = word;
    }
    return root;
}
```

---

## 6. Pattern Recognition

- **"root", "left/right", "ancestor", "subtree"** -> generic DFS/BFS.
- **"BST", "sorted", "inorder", "range", "closest"** -> exploit ordering: inorder, bounds, floor/ceiling.
- **"kth", "rank", many order-stat queries** -> early-stop inorder or size-augmented BST.
- **"diameter", "longest path", "max path", "can't choose adjacent"** -> tree DP/post-order.
- **"level", "zigzag", "right side", "minimum depth"** -> BFS by level.
- **"path sum can start anywhere", "downward target paths"** -> prefix sums on current root-to-node path.
- **"same", "mirror", "symmetric", "subtree"** -> structural recursion.
- **"serialize", "clone", "duplicate subtree"** -> traversal encoding with null markers.
- **"preorder+inorder", "inorder+postorder"** -> reconstruction; preorder+postorder is ambiguous unless extra constraints exist.
- **"autocomplete", "prefix", "word list board"** -> Trie.
- **"mutable range queries"** -> Segment Tree or BIT; static arrays usually need only prefix sums/binary search.
- **"O(1) traversal space"** -> Morris traversal.

---

## 7. Interview Focus

- **What is being tested:** recursion contracts, invariant maintenance, stack-space awareness, and translating recursion to explicit stacks/queues.
- **Trade-offs to say aloud:** recursive clean vs stack-overflow risk; iterative safe but verbose; BST ordered O(log n) only if balanced; hash table O(1) average but unordered; segment tree flexible vs BIT compact.
- **Senior follow-ups:** unbalanced/adversarial input, duplicates in BSTs, size augmentation, Morris O(1) space, lazy propagation, persistent trees via path-copying O(h), and concurrent traversal/mutation safety.
- **Production framing:** .NET ordered maps are red-black trees; databases/filesystems prefer B+ trees for high fan-out and range scans; for read-only sorted data, arrays plus binary search are often faster than pointer trees.
- **When not to use trees:** static prefix/range questions can use prefix sums; tiny fixed dictionaries do not need Tries; static sorted arrays do not need BSTs; mutable range min/max needs a segment tree, not a BIT.

---
## 8. Common Traps & Edge Cases

| Trap | Why it bites |
| --- | --- |
| Recursion depth / stack overflow | A skewed tree with 10^4-10^5 nodes can overflow the call stack; use explicit `Stack<T>` for untrusted shape. |
| BST validation via local comparison only | Parent-child checks miss grandparent violations; thread min/max bounds down the entire path (§4.8). |
| Mutating shared DFS state without undo | Path lists, visited sets, and prefix maps leak into siblings unless popped/decremented on unwind (§4.17/§4.19). |
| Negative node values in DP/path problems | `MaxPathSum` needs `best = int.MinValue`; clamp only extendable gains, not the global answer. |
| Duplicate values in BST problems | Clarify strict BST vs multiset convention before insert/validate/search. |
| Confusing height with depth | Height measures node-to-leaf; depth measures root-to-node. |
| Segment tree array under-sizing | Recursive array trees need safe `4n` capacity unless computing the exact power-of-two bound. |
| Forgetting BIT is 1-indexed | `i & -i` does not progress from 0; store internally at `index + 1`. |
| Comparing `TreeNode` by value in LCA | LCA targets are node references; duplicate values make value equality wrong. |
| Wrong reconstruction order | Pre+in consumes N,L,R so build left first; backward post+in is N,R,L so build right first (§4.16). |
| Subtree serialization without null markers | Different shapes can share the same value string; encode nulls and delimiters. |
| Empty / single / two-node inputs | Validate base cases for height, diameter, LCA, delete, and serialization before optimizing. |

---

## 9. Related LeetCode Problems

> The full tiered problem set lives in [Practice Roadmap](../DSAPatterns/Practice-Roadmap.md). The list below is the minimum set for this topic.

| # | Problem | Difficulty | Pattern |
| --- | --- | --- | --- |
| 98 | Validate Binary Search Tree | Medium | Bounds recursion (§4.8) |
| 102 | Binary Tree Level Order Traversal | Medium | BFS by level (§4.4) |
| 105/106 | Build Tree from traversal pairs | Medium | Hashmap + index arithmetic (§4.16) |
| 110 | Balanced Binary Tree | Easy | Post-order sentinel (§4.18) |
| 114 | Flatten Binary Tree to Linked List | Medium | Reverse postorder pointer rewiring (§4.20) |
| 124 | Binary Tree Maximum Path Sum | Hard | Tree DP with clamped one-arm gain (§4.6) |
| 199 | Binary Tree Right Side View | Medium | BFS last-per-level or DFS right-first (§4.4) |
| 208 | Implement Trie | Medium | Trie insert/search/startsWith (§4.12) |
| 212 | Word Search II | Hard | Trie + backtracking (§4.12/§5) |
| 230 | Kth Smallest Element in a BST | Medium | Early-stop inorder (§4.9) |
| 236 | Lowest Common Ancestor of a Binary Tree | Medium | General recursive LCA (§4.10) |
| 297 | Serialize and Deserialize Binary Tree | Hard | Preorder with null markers (§4.15) |
| 437 | Path Sum III | Medium | Prefix-sum map on current path (§4.19) |
| 450 | Delete Node in a BST | Medium | Three-case BST delete (§4.7) |
| 543 | Diameter of Binary Tree | Easy | Tree DP/post-order height (§4.6) |

---

## 10. Cheat Sheet

- **BST inorder = sorted.** Validation, kth, successor/predecessor, and range scans start here.
- **Height drives cost:** O(h) is O(log n) balanced and O(n) skewed; recursive stack has the same risk.
- **Formulas:** level *i* nodes = 2^(i-1); max nodes = 2^h - 1 (level height) or 2^(h+1) - 1 (edge height); min levels = ⌈log₂(n+1)⌉; full-tree leaves = two-child nodes + 1; BST counts = Catalan(n).
- **Recursive DFS:** preorder N,L,R; inorder L,N,R; postorder L,R,N. Say the helper contract before coding.
- **Iterative DFS:** preorder pushes right then left; inorder uses `curr` plus stack; postorder can build N,R,L then reverse.
- **BFS levels:** snapshot `queue.Count`; right view = last node per level; zigzag = alternate direction; min depth returns at first leaf.
- **Morris:** O(1) space by threading predecessor right links; always unthread and avoid concurrent mutation.
- **BST delete:** leaf -> null, one child -> return child, two children -> copy successor then delete successor.
- **Validate BST:** carry strict `(min, max)` bounds; parent-only checks are wrong.
- **LCA:** BST split point; general tree returns found target/LCA; parent pointers align depths then climb.
- **Tree DP:** return what parent may extend, update answers using both children locally; clamp max-path negative gains.
- **Balanced check:** return height or `-1` sentinel to stop early.
- **Backtracking paths:** add, recurse, remove; copy paths before storing results.
- **Path Sum III:** seed `prefixCount[0] = 1`; add before children, decrement after.
- **Reconstruction:** pre+in builds left first; post+in backward builds right first; duplicates need richer indexing.
- **Serialization:** preorder plus `#` null markers uniquely preserves shape.
- **Trie:** O(m) per op regardless of key count; wins when prefixes are shared or used for pruning.
- **Segment Tree vs BIT:** segment tree handles arbitrary associative ops and lazy range updates; BIT is smaller for invertible prefix sums.
- **AVL / Red-Black / B+ trees:** AVL = stricter reads; red-black = cheaper writes and .NET ordered collections; B+ = disk/cache-friendly indexes and range scans.
- **Production concerns:** recursion depth, memory locality, path-copy persistence, locks/snapshots for concurrent mutation, and whether an array/hash table is simpler.
- **Edge cases:** null root, single node, skewed tree, duplicates, negative values, malformed serialized data.

---

## See Also

- [Graphs](../Graphs/Graphs.md) - A tree is a connected acyclic graph; DFS/BFS carry straight over.
- [Binary Search](../Binary%20Search/Binary%20Search.md) - The BST invariant is search-space halving in tree form.
- [Heaps](../Heaps/Heaps.md) - A binary heap is a complete binary tree stored in an array.
- [Backtracking](../Backtracking/Backtracking.md) - Tree recursion and backtracking share the same recursion contract.
- [Dynamic Programming](../Dynamic%20Programming/Dynamic%20Programming.md) - Tree DP returns per-subtree state upward.
- [DSA Patterns](../DSAPatterns/DSAPatterns.md) - master index: pattern selection flowchart and complexity-from-constraints.
- [Practice Roadmap](../DSAPatterns/Practice-Roadmap.md) - the tiered problem set to drill this topic.
