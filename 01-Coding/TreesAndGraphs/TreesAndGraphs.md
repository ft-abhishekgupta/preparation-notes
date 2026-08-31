# Trees

Tree is a hierarchical data structure that consists of nodes connected by edges.
It has a root node and zero or more child nodes, forming a parent-child relationship.

![alt text](image-1.png)

**Terminology:**

- _Root_: The topmost node in a tree.
- _Parent_: A node that has child nodes.
- _Child_: A node that has a parent node.
- _Sibling_: Nodes that share the same parent.
- _Leaf_: A node that has no children.
- _Internal Node_: A node that has at least one child.
- _Level_: The depth of a node in the tree, starting from the root at level 0.
- _Depth_: The length of the path from the root to a node.
- _Height_: The length of the longest path from a node to a leaf.
- _Subtree_: A tree formed by a node and all its descendants.
- _Degree_: The number of children a node has.

**Usage of Trees:**

- Represent hierarchical data (e.g., file systems, organizational structures)
- Facilitate efficient searching and sorting (e.g., binary search trees)
- Enable efficient data storage and retrieval (e.g., heaps, tries)

### Binary Tree

Tree in which each node has at most two children, referred to as the left child and the right child.

![alt text](image-2.png)

```cs
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}
```

### Traversal of Binary Tree

```text
        1
       / \
      2   3
     / \
    4   5
```

| Traversal Type | Order of Nodes Visited | Example       | Type | Time Complexity | Space Complexity |
| -------------- | ---------------------- | ------------- | ---- | --------------- | ---------------- |
| Preorder       | Root → Left → Right    | 1, 2, 4, 5, 3 | DFS  | O(n)            | O(h)             |
| Inorder        | Left → Root → Right    | 4, 2, 5, 1, 3 | DFS  | O(n)            | O(h)             |
| Postorder      | Left → Right → Root    | 4, 5, 2, 3, 1 | DFS  | O(n)            | O(h)             |
| Level Order    | Level by Level         | 1, 2, 3, 4, 5 | BFS  | O(n)            | O(w)             |

- n = number of nodes, h = height of the tree, w = maximum width of the tree

```cs
PREORDER_TRAVERSAL(node):
    if node == null:
        return
    visit(node)
    PRE_ORDER_TRAVERSAL(node.left)
    PRE_ORDER_TRAVERSAL(node.right)

INORDER_TRAVERSAL(node):
    if node == null:
        return
    IN_ORDER_TRAVERSAL(node.left)
    visit(node)
    IN_ORDER_TRAVERSAL(node.right)

POSTORDER_TRAVERSAL(node):
    if node == null:
        return
    POST_ORDER_TRAVERSAL(node.left)
    POST_ORDER_TRAVERSAL(node.right)
    visit(node)

LEVEL_ORDER_TRAVERSAL(root):
    if root == null:
        return
    queue = new Queue()
    queue.enqueue(root)
    while not queue.isEmpty():
        node = queue.dequeue()
        visit(node)
        if node.left != null:
            queue.enqueue(node.left)
        if node.right != null:
            queue.enqueue(node.right)
```

### Binary Search Tree (BST)

- Values in left subtree < Node < Values in right subtree
- No duplicates allowed
- Inorder traversal of BST gives sorted order of elements
- Time Complexity:
  - Average Case: O(log n)
  - Worst Case: O(n) (when the tree is skewed)

![alt text](image-3.png)

```cs
SEARCH(root, key):
    if root == null:
        return null
    if key == root.value:
        return root
    if key < root.value:
        return SEARCH(root.left, key)
    return SEARCH(root.right, key)

INSERT(root, key):
    if root == null:
        return new Node(key)
    if key < root.value:
        root.left = INSERT(root.left, key)
    else if key > root.value:
        root.right = INSERT(root.right, key)
    return root

DELETE...
```

---

## LCA — Lowest Common Ancestor

```csharp
// Binary Tree (LeetCode 236) — O(n)
TreeNode LCA(TreeNode root, TreeNode p, TreeNode q)
{
    if (root == null || root == p || root == q) return root;
    var left  = LCA(root.Left,  p, q);
    var right = LCA(root.Right, p, q);
    if (left != null && right != null) return root; // p and q in different subtrees
    return left ?? right;
}

// BST LCA (LeetCode 235) — O(h) — exploit ordering
TreeNode LCABST(TreeNode root, TreeNode p, TreeNode q)
{
    while (root != null)
    {
        if (p.Val < root.Val && q.Val < root.Val) root = root.Left;
        else if (p.Val > root.Val && q.Val > root.Val) root = root.Right;
        else return root; // split point = LCA
    }
    return null;
}
```

---

## Path Sum Family

```csharp
// All root-to-leaf paths summing to target — LeetCode 113
void PathSumDFS(TreeNode node, int remain, List<int> path, IList<IList<int>> res)
{
    if (node == null) return;
    path.Add(node.Val);
    if (node.Left == null && node.Right == null && remain == node.Val)
        res.Add(new List<int>(path));
    PathSumDFS(node.Left,  remain - node.Val, path, res);
    PathSumDFS(node.Right, remain - node.Val, path, res);
    path.RemoveAt(path.Count - 1); // backtrack
}

// Max path sum through any nodes — LeetCode 124 — tree DP
int _maxPath = int.MinValue;
int MaxGain(TreeNode node)
{
    if (node == null) return 0;
    int l = Math.Max(0, MaxGain(node.Left));   // ignore negative branches
    int r = Math.Max(0, MaxGain(node.Right));
    _maxPath = Math.Max(_maxPath, node.Val + l + r);
    return node.Val + Math.Max(l, r);           // return single-branch gain
}
```

---

## Serialize / Deserialize Binary Tree (LeetCode 297)

```csharp
string Serialize(TreeNode root)
{
    var sb = new StringBuilder();
    void Dfs(TreeNode n) {
        if (n == null) { sb.Append("null,"); return; }
        sb.Append(n.Val).Append(',');
        Dfs(n.Left); Dfs(n.Right);
    }
    Dfs(root);
    return sb.ToString();
}

TreeNode Deserialize(string data)
{
    var q = new Queue<string>(data.Split(','));
    TreeNode Build() {
        var val = q.Dequeue();
        if (val == "null") return null;
        return new TreeNode(int.Parse(val), Build(), Build());
    }
    return Build();
}
// Preorder serialization uniquely encodes a binary tree (null markers included).
```

---

## Validate BST

```csharp
bool IsValidBST(TreeNode root, long min = long.MinValue, long max = long.MaxValue)
{
    if (root == null) return true;
    if (root.Val <= min || root.Val >= max) return false;
    return IsValidBST(root.Left, min, root.Val)
        && IsValidBST(root.Right, root.Val, max);
}
// Pass min/max bounds down recursion; use long to handle int.MinValue/MaxValue edge cases.
```

### AVL Tree - Self-Balancing Binary Search Tree

- Balance factor of each node = height(left subtree) - height(right subtree)
- Balance factor ∈ {-1, 0, 1} for all nodes i.e Height of left and right subtrees differ by at most 1
- Rotations (LL, RR, LR, RL) are used to maintain balance
- Height of AVL tree = O(log n)
  ![alt text](image-4.png)
- Applications: Databases, File Systems, Memory Management

```cs
HEIGHT(node):
    if node == null:
        return 0
    return max(HEIGHT(node.left), HEIGHT(node.right)) + 1

BALANCE_FACTOR(node):
    if node == null:
        return 0
    return HEIGHT(node.left) - HEIGHT(node.right)

RIGHT_ROTATE(y):
    x = y.left
    T = x.right
    x.right = y
    y.left = T

    y.height = 1 + MAX(HEIGHT(y.left), HEIGHT(y.right))
    x.height = 1 + MAX(HEIGHT(x.left), HEIGHT(x.right))

    return x

LEFT_ROTATE(x):
    y = x.right
    T = y.left
    y.left = x
    x.right = T

    x.height = 1 + MAX(HEIGHT(x.left), HEIGHT(x.right))
    y.height = 1 + MAX(HEIGHT(y.left), HEIGHT(y.right))

    return y

INSERT(root, key):
    // Normal BST insertion
    if root == null:
        return new Node(key)

    if key < root.value:
        root.left = INSERT(root.left, key)
    else if key > root.value:
        root.right = INSERT(root.right, key)
    else:
        return root              // duplicate

    // Update height
    root.height = 1 + MAX(
        HEIGHT(root.left),
        HEIGHT(root.right)
    )

    balance = BALANCE_FACTOR(root)

    // LL Case
    if balance > 1 and key < root.left.value:
        return RIGHT_ROTATE(root)

    // RR Case
    if balance < -1 and key > root.right.value:
        return LEFT_ROTATE(root)

    // LR Case
    if balance > 1 and key > root.left.value:
        root.left = LEFT_ROTATE(root.left)
        return RIGHT_ROTATE(root)

    // RL Case
    if balance < -1 and key < root.right.value:
        root.right = RIGHT_ROTATE(root.right)
        return LEFT_ROTATE(root)

    return root
```

### B-Tree

- Nodes can have multiple children
- All leaf nodes at same level
- Each node can have m/2 to m keys
- Keys within nodes are sorted

## AVL vs Red-Black vs B-Tree

| Aspect                  | AVL                      | Red-Black                            | B-Tree                     |
| ----------------------- | ------------------------ | ------------------------------------ | -------------------------- |
| Balance condition       | Height diff ≤ 1          | Approx height ≤ 2×min                | All leaves same depth      |
| Lookup                  | O(log n)                 | O(log n)                             | O(log_t n)                 |
| Insert/delete rotations | More (strictly balanced) | Fewer (2-3 rotations max)            | Split/merge nodes          |
| Read-heavy              | Better (lower height)    | OK                                   | Excellent (high fanout)    |
| Write-heavy             | OK                       | Better                               | Excellent (sequential I/O) |
| Disk/block storage      | Poor (small nodes)       | Poor                                 | Designed for it            |
| Use case                | In-memory sorted maps    | JVM `TreeMap`, Linux scheduler (CFS) | DB indexes, file systems   |

### Heap
