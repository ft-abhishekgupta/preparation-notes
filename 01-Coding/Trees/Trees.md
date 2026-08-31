# Trees

> **Core idea:** Trees are recursively defined — every subtree is itself a tree. Almost every tree algorithm is either "pass state down" (top-down) or "return state up" (bottom-up / postorder).
> **Recognise it when:** "hierarchy", "root/parent/child", "subtree", "binary search", "level", "ancestor/descendant".
> **Costs:** traversal `O(n) time, O(h) space` (h = height; `O(log n)` balanced, `O(n)` skewed).

---

## Mental Model

![Tree structure showing root, internal nodes, and leaves](image-1.png)

A tree is a **connected acyclic graph**. Every node except the root has exactly one parent; the root has none. Every algorithm reduces to one question: *do I need information from my children before I can answer for myself (bottom-up), or can I pass the answer down from the parent (top-down)?*

**Invariant:** at every node, `left subtree values < node.Val < right subtree values` (BST only).

---

## Terminology

| Term | Definition |
| ---- | ---------- |
| **Root** | Topmost node; no parent |
| **Parent / Child** | Direct edge relationship |
| **Sibling** | Nodes sharing the same parent |
| **Leaf** | Node with no children (degree = 0) |
| **Internal node** | Node with at least one child |
| **Degree** | Number of children a node has |
| **Level** | Root is level 0; each edge down adds 1 |
| **Depth of node** | Number of edges from root to that node (= level) |
| **Height of node** | Number of edges on longest path from node to a leaf |
| **Height of tree** | Height of root |
| **Subtree** | A node and all its descendants |

> **Convention used throughout this file:** height of a **leaf = 0** (edge count to leaf). Some sources define leaf height = 1 (node count). The `null` node returns −1 in the sentinel trick and 0 in normal height — be explicit in interviews.

---

## TreeNode Definition

```csharp
public class TreeNode
{
    public int Val;
    public TreeNode Left, Right;
    public TreeNode(int val = 0, TreeNode left = null, TreeNode right = null)
    { Val = val; Left = left; Right = right; }
}
```

---

## Binary Tree Shapes

| Shape | Definition | Node count (height h) | Notes |
| ----- | ---------- | --------------------- | ----- |
| **Full** | Every node has 0 or 2 children | 2h+1 ≤ n ≤ 2^(h+1)−1 | — |
| **Complete** | All levels full except last; last level filled left-to-right | 2^h ≤ n ≤ 2^(h+1)−1 | Heap shape |
| **Perfect** | All internal nodes have 2 children, all leaves same level | n = 2^(h+1)−1 | Rarest |
| **Balanced** | \|height(left) − height(right)\| ≤ 1 for every node | h = O(log n) | AVL guarantee |
| **Degenerate** | Each node has at most one child (linked-list shape) | n = h+1 | Worst BST case |

![Binary tree showing left child and right child structure](image-2.png)

---

## Complexity Reference

| Operation | Balanced tree | Skewed tree | Notes |
| --------- | ------------- | ----------- | ----- |
| Search (BST) | O(log n) | O(n) | Compare & go left/right |
| Insert (BST) | O(log n) | O(n) | Like search, add leaf |
| Delete (BST) | O(log n) | O(n) | Successor swap |
| Any traversal | O(n) | O(n) | Visit every node |
| Height/diameter | O(n) | O(n) | Postorder |
| LCA | O(log n) BST / O(n) BT | O(n) | — |
| Build from traversals | O(n) | O(n) | With hashmap |
| AVL insert/delete | O(log n) | O(log n) | Rotations O(1) |
| Morris traversal | O(n) | O(n) | **O(1) space** |

---

## Templates

### 1. TreeNode class (use above)

### 2. Recursive traversals — use when: any DFS on a tree

**Time O(n) | Space O(h)**

```csharp
// Preorder: Root → Left → Right  — use for: serialise, clone, build-from-preorder
void Preorder(TreeNode node, List<int> res)
{
    if (node == null) return;
    res.Add(node.Val);
    Preorder(node.Left, res);
    Preorder(node.Right, res);
}

// Inorder: Left → Root → Right  — use for: BST sorted order, validate BST, kth smallest
void Inorder(TreeNode node, List<int> res)
{
    if (node == null) return;
    Inorder(node.Left, res);
    res.Add(node.Val);
    Inorder(node.Right, res);
}

// Postorder: Left → Right → Root  — use for: delete tree, height, diameter, tree DP
void Postorder(TreeNode node, List<int> res)
{
    if (node == null) return;
    Postorder(node.Left, res);
    Postorder(node.Right, res);
    res.Add(node.Val);
}
```

### 3. Iterative traversals — use when: explicit stack required or recursion depth is a concern

```csharp
// Iterative inorder  — O(n) time, O(h) space
IList<int> InorderIterative(TreeNode root)
{
    var res = new List<int>();
    var stack = new Stack<TreeNode>();
    var cur = root;
    while (cur != null || stack.Count > 0)
    {
        while (cur != null) { stack.Push(cur); cur = cur.Left; }
        cur = stack.Pop();
        res.Add(cur.Val);
        cur = cur.Right;
    }
    return res;
}

// Iterative preorder  — O(n) time, O(h) space
IList<int> PreorderIterative(TreeNode root)
{
    var res = new List<int>();
    if (root == null) return res;
    var stack = new Stack<TreeNode>();
    stack.Push(root);
    while (stack.Count > 0)
    {
        var node = stack.Pop();
        res.Add(node.Val);
        if (node.Right != null) stack.Push(node.Right); // right first so left is popped first
        if (node.Left  != null) stack.Push(node.Left);
    }
    return res;
}

// Iterative postorder — reverse of "root, right, left"  — O(n) time, O(n) space
IList<int> PostorderIterative(TreeNode root)
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
    res.Reverse(); // root-right-left reversed = left-right-root
    return res;
}
```

### 4. Level-order (BFS) — use when: level-by-level, min depth, right-side view, zigzag

**Time O(n) | Space O(w)** (w = max width ≈ n/2 for perfect tree)

```csharp
IList<IList<int>> LevelOrder(TreeNode root)
{
    var res = new List<IList<int>>();
    if (root == null) return res;
    var q = new Queue<TreeNode>();
    q.Enqueue(root);
    while (q.Count > 0)
    {
        int size = q.Count; // snapshot BEFORE inner loop
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

### 5. Morris Inorder Traversal — use when: O(1) extra space required

**Time O(n) | Space O(1)** — temporarily threads the tree, unthreads on exit

```csharp
IList<int> MorrisInorder(TreeNode root)
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
            // find inorder predecessor (rightmost in left subtree)
            var pre = cur.Left;
            while (pre.Right != null && pre.Right != cur)
                pre = pre.Right;

            if (pre.Right == null)
            {
                pre.Right = cur;   // create thread
                cur = cur.Left;
            }
            else
            {
                pre.Right = null;  // remove thread
                res.Add(cur.Val);
                cur = cur.Right;
            }
        }
    }
    return res;
}
```

> **Why it works:** The thread gives a return path from the left subtree back to `cur`, eliminating the stack. The predecessor is visited exactly twice: once to set the thread, once to remove it.

### 6. Top-down vs Bottom-up recursion — the most important mental model

```csharp
// TOP-DOWN: pass state as parameters, answer lives in an accumulator
// Use when: you need ancestor info at a node (path to root, depth, running sum)
void TopDown(TreeNode node, int depth, ref int maxDepth)
{
    if (node == null) return;
    maxDepth = Math.Max(maxDepth, depth);
    TopDown(node.Left,  depth + 1, ref maxDepth);
    TopDown(node.Right, depth + 1, ref maxDepth);
}

// BOTTOM-UP: return state from children, combine at current node
// Use when: you need subtree info (height, diameter, path sum through node)
int BottomUp(TreeNode node, ref int diameter)
{
    if (node == null) return 0;
    int l = BottomUp(node.Left,  ref diameter);
    int r = BottomUp(node.Right, ref diameter);
    diameter = Math.Max(diameter, l + r); // answer through this node
    return 1 + Math.Max(l, r);            // value returned upward
}
```

> **Key insight:** bottom-up often needs *two values*: the answer *through* this node (update global max) and the value *returned upward* to the parent (single-branch contribution). These are different.

---

## Which Traversal to Use

| Job | Traversal | Reason |
| --- | --------- | ------ |
| BST sorted order | Inorder | Left < Root < Right in BST |
| Validate BST | Inorder (prev-node) or top-down bounds | See BST section |
| Kth smallest in BST | Inorder | Elements in sorted order |
| Serialise / clone / build-from-preorder | Preorder | Root first → reconstruct top-down |
| Delete tree / compute height / tree DP | Postorder | Children must be processed before parent |
| Level problems, right-side view, min depth, zigzag | Level-order (BFS) | Natural level grouping |
| Path sum root-to-leaf | Preorder DFS with backtrack | Accumulate on way down |
| Any-to-any path (diameter, max path sum) | Postorder | Need subtree values first |
| O(1) space traversal | Morris inorder | Thread predecessor |

---

## BST: Search, Insert, Delete

![BST showing ordered structure with left < root < right](image-3.png)

**Property:** for every node, all left descendants < node.Val < all right descendants. Inorder traversal yields sorted order.

```csharp
// Search  — O(h)
TreeNode Search(TreeNode root, int key)
{
    while (root != null)
    {
        if      (key == root.Val) return root;
        else if (key <  root.Val) root = root.Left;
        else                      root = root.Right;
    }
    return null;
}

// Insert  — O(h)
TreeNode Insert(TreeNode root, int key)
{
    if (root == null) return new TreeNode(key);
    if      (key < root.Val) root.Left  = Insert(root.Left,  key);
    else if (key > root.Val) root.Right = Insert(root.Right, key);
    // key == root.Val: duplicate, ignore
    return root;
}

// Delete  — O(h)
// Cases: (1) leaf → remove; (2) one child → splice out; (3) two children → replace with inorder successor
TreeNode Delete(TreeNode root, int key)
{
    if (root == null) return null;
    if (key < root.Val)
    {
        root.Left  = Delete(root.Left,  key);
    }
    else if (key > root.Val)
    {
        root.Right = Delete(root.Right, key);
    }
    else // found
    {
        if (root.Left  == null) return root.Right; // case 1 & 2
        if (root.Right == null) return root.Left;  // case 2
        // case 3: find inorder successor (min of right subtree)
        var succ = root.Right;
        while (succ.Left != null) succ = succ.Left;
        root.Val   = succ.Val;                     // copy successor value
        root.Right = Delete(root.Right, succ.Val); // delete successor
    }
    return root;
}

// Inorder successor (next larger node)  — O(h)
TreeNode InorderSuccessor(TreeNode root, TreeNode p)
{
    TreeNode succ = null;
    while (root != null)
    {
        if (p.Val < root.Val) { succ = root; root = root.Left; }
        else                  { root = root.Right; }
    }
    return succ;
}

// Kth smallest via iterative inorder  — O(h + k)
int KthSmallest(TreeNode root, int k)
{
    var stack = new Stack<TreeNode>();
    var cur   = root;
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

### Validate BST

```csharp
// Bounds approach — O(n) time, O(h) space
// Use long to avoid int.MinValue/MaxValue edge cases (node.Val could equal int.MinValue)
bool IsValidBST(TreeNode root, long min = long.MinValue, long max = long.MaxValue)
{
    if (root == null) return true;
    if (root.Val <= min || root.Val >= max) return false;
    return IsValidBST(root.Left,  min,       root.Val)
        && IsValidBST(root.Right, root.Val,  max);
}

// Inorder prev-node approach — avoids long, same complexity
TreeNode _prev = null;
bool IsValidBSTInorder(TreeNode root)
{
    if (root == null) return true;
    if (!IsValidBSTInorder(root.Left)) return false;
    if (_prev != null && root.Val <= _prev.Val) return false;
    _prev = root;
    return IsValidBSTInorder(root.Right);
}
```

### BST ↔ Sorted Array

```csharp
// Convert sorted array to balanced BST — O(n)
TreeNode SortedArrayToBST(int[] nums, int lo, int hi)
{
    if (lo > hi) return null;
    int mid = lo + (hi - lo) / 2;
    return new TreeNode(nums[mid],
        SortedArrayToBST(nums, lo,    mid - 1),
        SortedArrayToBST(nums, mid + 1, hi));
}
```

---

## Height, Depth, Diameter, Balanced

```csharp
// Height of tree (0 for leaf, -1 for null)
int Height(TreeNode node)
{
    if (node == null) return -1;
    return 1 + Math.Max(Height(node.Left), Height(node.Right));
}

// Diameter and height in one postorder pass — O(n)
int DiameterOfBinaryTree(TreeNode root)
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

// Balanced check with sentinel (-1 = unbalanced)  — O(n)
bool IsBalanced(TreeNode root)
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

> **Trick:** use a single postorder pass that returns height but propagates −1 as a "already unbalanced" sentinel. Avoids O(n²) repeated height calls.

---

## LCA — Lowest Common Ancestor

```csharp
// Binary Tree LCA (LeetCode 236)  — O(n) time, O(h) space
TreeNode LCA(TreeNode root, TreeNode p, TreeNode q)
{
    if (root == null || root == p || root == q) return root;
    var left  = LCA(root.Left,  p, q);
    var right = LCA(root.Right, p, q);
    if (left != null && right != null) return root; // p and q in different subtrees
    return left ?? right;
}

// BST LCA (LeetCode 235)  — O(h) — exploit BST ordering
TreeNode LcaBst(TreeNode root, TreeNode p, TreeNode q)
{
    while (root != null)
    {
        if      (p.Val < root.Val && q.Val < root.Val) root = root.Left;
        else if (p.Val > root.Val && q.Val > root.Val) root = root.Right;
        else return root; // split point is the LCA
    }
    return null;
}

// LCA with parent pointers — treat as "intersection of two linked lists"
// Walk both nodes to root, compare depths, advance deeper one, then walk together.
```

---

## Path Problems

```csharp
// Root-to-leaf path sum (LeetCode 113 — all paths)  — O(n) time, O(h) space
void PathSumDfs(TreeNode node, int remain, List<int> path, IList<IList<int>> res)
{
    if (node == null) return;
    path.Add(node.Val);
    if (node.Left == null && node.Right == null && remain == node.Val)
        res.Add(new List<int>(path));        // snapshot
    PathSumDfs(node.Left,  remain - node.Val, path, res);
    PathSumDfs(node.Right, remain - node.Val, path, res);
    path.RemoveAt(path.Count - 1);           // backtrack
}

// Max path sum through any nodes (LeetCode 124)  — tree DP bottom-up
// Two values: answer THROUGH this node (update global), value returned UPWARD (single branch)
int MaxPathSum(TreeNode root)
{
    int ans = int.MinValue;
    int Gain(TreeNode node)
    {
        if (node == null) return 0;
        int l = Math.Max(0, Gain(node.Left));    // clip negatives
        int r = Math.Max(0, Gain(node.Right));
        ans = Math.Max(ans, node.Val + l + r);   // path through this node
        return node.Val + Math.Max(l, r);        // single-branch returned upward
    }
    Gain(root);
    return ans;
}
```

---

## Construction from Traversals

**Rule:** you need inorder + one of {preorder, postorder} to uniquely reconstruct a binary tree. Preorder+postorder is **ambiguous** for non-full trees (can't distinguish which child is left vs right when a node has only one child).

```csharp
// Build from preorder + inorder (LeetCode 105)  — O(n)
TreeNode BuildTree(int[] preorder, int[] inorder)
{
    var inIdx = new Dictionary<int, int>();
    for (int i = 0; i < inorder.Length; i++) inIdx[inorder[i]] = i;
    int pre = 0;
    TreeNode Build(int lo, int hi)
    {
        if (lo > hi) return null;
        int rootVal = preorder[pre++];
        int mid = inIdx[rootVal];
        return new TreeNode(rootVal,
            Build(lo, mid - 1),
            Build(mid + 1, hi));
    }
    return Build(0, inorder.Length - 1);
}

// Build from inorder + postorder (LeetCode 106)  — O(n)
TreeNode BuildTreePost(int[] inorder, int[] postorder)
{
    var inIdx = new Dictionary<int, int>();
    for (int i = 0; i < inorder.Length; i++) inIdx[inorder[i]] = i;
    int post = postorder.Length - 1;
    TreeNode Build(int lo, int hi)
    {
        if (lo > hi) return null;
        int rootVal = postorder[post--];
        int mid = inIdx[rootVal];
        // Build RIGHT first because postorder root is at end
        var right = Build(mid + 1, hi);
        var left  = Build(lo,      mid - 1);
        return new TreeNode(rootVal, left, right);
    }
    return Build(0, inorder.Length - 1);
}
```

---

## Serialize / Deserialize

```csharp
// Preorder DFS with null markers (LeetCode 297)  — O(n) time, O(n) space
string Serialize(TreeNode root)
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

TreeNode Deserialize(string data)
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
// Preorder + explicit null markers uniquely encodes any binary tree.
```

---

## Self-Balancing Trees

### AVL Tree

- **Balance factor** = height(left) − height(right) ∈ {−1, 0, 1} at every node.
- Any violation triggers a rotation. Height = O(log n) guaranteed.

![AVL tree rotations diagram showing LL, RR, LR, RL cases](image-4.png)

**Rotation decision table:**

| Balance factor | Inserted side | Case | Fix |
| -------------- | ------------- | ---- | --- |
| > 1 (left-heavy) | Left child | LL | Right-rotate root |
| > 1 (left-heavy) | Right child | LR | Left-rotate left child, then right-rotate root |
| < −1 (right-heavy) | Right child | RR | Left-rotate root |
| < −1 (right-heavy) | Left child | RL | Right-rotate right child, then left-rotate root |

```text
RIGHT_ROTATE(y):
    x = y.left;  T = x.right
    x.right = y;  y.left = T
    y.height = 1 + max(height(y.left), height(y.right))
    x.height = 1 + max(height(x.left), height(x.right))
    return x

LEFT_ROTATE(x):
    y = x.right;  T = y.left
    y.left = x;  x.right = T
    x.height = 1 + max(height(x.left), height(x.right))
    y.height = 1 + max(height(y.left), height(y.right))
    return y

AVL_INSERT(root, key):
    // 1. BST insert
    if root == null: return new Node(key)
    if key < root.val: root.left = AVL_INSERT(root.left, key)
    elif key > root.val: root.right = AVL_INSERT(root.right, key)
    else: return root  // duplicate
    // 2. Update height
    root.height = 1 + max(height(root.left), height(root.right))
    // 3. Rebalance
    bf = balance_factor(root)
    if bf > 1  and key < root.left.val:  return RIGHT_ROTATE(root)          // LL
    if bf > 1  and key > root.left.val:                                      // LR
        root.left = LEFT_ROTATE(root.left); return RIGHT_ROTATE(root)
    if bf < -1 and key > root.right.val: return LEFT_ROTATE(root)           // RR
    if bf < -1 and key < root.right.val:                                     // RL
        root.right = RIGHT_ROTATE(root.right); return LEFT_ROTATE(root)
    return root
```

### Red-Black Tree

- Each node is **Red** or **Black**.
- Properties: root = black; no two consecutive red nodes; every path from node to null has same black-height.
- Insert/delete require at most **2–3 rotations** (vs more for AVL) → better for write-heavy workloads.
- Used in: C# `SortedSet<T>` / `SortedDictionary<T>`, Java `TreeMap`, Linux CFS scheduler.

### B-Tree / B+Tree

- Each node holds **t−1 to 2t−1 keys** (order t); one disk page per node.
- High fanout (large t) → very shallow tree → few disk reads.
- **B+Tree:** only leaves store values; internal nodes store routing keys only; leaves linked for range scans.
- Used in: database indexes (InnoDB, PostgreSQL), file systems (NTFS, ext4).

### AVL vs Red-Black vs B-Tree

| Aspect | AVL | Red-Black | B-Tree |
| ------ | --- | --------- | ------ |
| Balance condition | Height diff ≤ 1 | Approx height ≤ 2×min | All leaves same depth |
| Lookup | O(log n) | O(log n) | O(log_t n) |
| Insert/delete rotations | **More** (strictly balanced) | Fewer (≤ 3) | Split/merge nodes |
| Read-heavy | **Better** (lower height) | OK | Excellent (high fanout) |
| Write-heavy | OK | **Better** | Excellent (sequential I/O) |
| Disk/block storage | Poor (small nodes) | Poor | **Designed for it** |
| Use case | In-memory sorted maps | C# `SortedSet`, Linux CFS | DB indexes, file systems |

---

## N-ary Trees and the Graph Bridge

An N-ary tree is simply a tree where each node has an arbitrary number of children. Algorithms generalise directly: replace `node.Left` / `node.Right` with `foreach (var child in node.Children)`.

**Bridge to graphs:** a tree is a **connected undirected acyclic graph** with n nodes and n−1 edges. BFS/DFS on trees is a special case of graph traversal (no visited set needed because no cycles). See [Graphs](../Graphs/Graphs.md) for BFS/DFS on general graphs.

---

## Pattern Recognition

| Problem says… | Reach for | Complexity |
| ------------- | --------- | ---------- |
| BST "sorted order" / "kth smallest" | Inorder traversal | O(n) / O(h+k) |
| "Height" / "depth" / "balanced" | Postorder bottom-up | O(n) |
| "Diameter" / "longest path" | Postorder, track global max | O(n) |
| "Level by level" / "right side view" / "zigzag" | BFS level-order | O(n) |
| "Path sum root-to-leaf" | DFS + backtrack | O(n) |
| "Any-to-any path sum" (LeetCode 124) | Postorder tree DP | O(n) |
| "Lowest common ancestor" binary tree | Postorder LCA | O(n) |
| "LCA" BST | Iterative BST walk | O(h) |
| Reconstruct from two traversals | Preorder+Inorder hashmap | O(n) |
| "Validate BST" | Bounds top-down or inorder | O(n) |
| "Mirror" / "symmetric" | Recursive pair comparison | O(n) |
| "O(1) space traversal" | Morris | O(n) O(1) |
| Tree + DP state design | Postorder + pair return | O(n) |

---

## Pitfalls

- **`int` overflow in Validate BST:** node.Val can equal `int.MinValue`/`int.MaxValue`; always use `long` bounds, or use the inorder prev-node technique.
- **Recursion depth on skewed tree:** n = 10⁵ nodes → stack depth 10⁵ → `StackOverflowException`. Use iterative traversal or increase stack size for production code.
- **Confusing depth and height:** depth is distance *from root* (top-down); height is distance *to farthest leaf* (bottom-up). Null returns −1 in height, 0 in depth-of-null-node.
- **Forgetting null check:** `node.Left.Val` crashes if `node.Left == null`. Always gate on `node.Left != null` before accessing children's properties.
- **Level-order: forgetting size snapshot:** do `int size = q.Count` *before* the inner loop. If you use `q.Count` in the loop condition, newly enqueued children inflate the count mid-level.
- **Path backtracking:** `path.Add(node.Val)` without a matching `path.RemoveAt(path.Count - 1)` in all exit branches corrupts the shared list across sibling subtrees.
- **Construct from postorder: build right before left.** Postorder root is the *last* element, so `post--` picks root; right subtree must be built before left (reverse of preorder).

---

## Heaps

A heap is a **complete binary tree** stored in an array (parent at index `i`, children at `2i+1` and `2i+2`). Heap insert and delete are `O(log n)`; building a heap from n elements is `O(n)`.

See → [Heaps and Priority Queues](../HeapsAndPriorityQueues/HeapsAndPriorityQueues.md) for full coverage (heap internals, `PriorityQueue<T,P>`, top-K, two-heaps median, merge-K-sorted-lists).

---

## Practice

See [Problems.md](./Problems.md) for worked solutions.

| LeetCode | Problem | Pattern |
| -------- | ------- | ------- |
| 94 / 144 / 145 | Inorder / Preorder / Postorder Traversal | Traversals |
| 102 / 103 / 199 | Level Order / Zigzag / Right Side View | BFS |
| 104 / 111 / 543 | Max Depth / Min Depth / Diameter | Height |
| 110 / 100 / 101 | Balanced / Same Tree / Symmetric | Structure |
| 572 / 226 | Subtree / Invert | Structure |
| 112 / 113 / 437 / 124 | Path Sum family | Paths |
| 98 / 230 / 235 / 236 | Validate BST / Kth / LCA | BST |
| 105 / 106 / 297 | Construct / Serialize | Construction |
| 108 / 114 / 116 | Sorted→BST / Flatten / Next Pointer | BST / Structure |
| 1448 / 337 | Count Good Nodes / House Robber III | DP |
