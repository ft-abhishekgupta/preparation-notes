# Trees — Problems

## Binary Tree InOrder Traversal

Given the root of a binary tree, return the inorder traversal of its nodes' values.

**Example:** `root = [1, null, 2, 3]` → `[1, 3, 2]`

```text
RECURSION | O(N) | O(H)

INORDER(root):
    if root is null:
        return
    INORDER(root.left)
    add root.value to result
    INORDER(root.right)

------------------------------------------------------------------------------

ITERATIVE | O(N) | O(N)

INORDER(root):
    stack = empty stack
    current = root
    result = []
    while current is not null OR stack is not empty:
        while current is not null:
            push current onto stack
            current = current.left
        current = pop stack
        add current.value to result
        current = current.right
    return result

------------------------------------------------------------------------------

MORRIS TRAVERSAL | O(N) | O(1)

// Temporarily link the rightmost node of the left subtree back to the current node,
// so the traversal can return without a stack, and unlink it on the way back

current = root
while current is not null:
    if current.left is null:
        visit current
        current = current.right
    else:
        predecessor = rightmost node of current.left
                      that does not already point to current
        if predecessor.right is null:
            predecessor.right = current      // Create the thread
            current = current.left
        else:
            predecessor.right = null         // Remove the thread
            visit current
            current = current.right
```

> Preorder and postorder use the same stack pattern; postorder can also be done as reversed "root, right, left".

## Maximum Depth of Binary Tree

Given the root of a binary tree, return its maximum depth.

**Example:** `root = [3, 9, 20, null, null, 15, 7]` → `3`

```text
DFS | O(N) | O(H)

MAX_DEPTH(root):
    if root is null:
        return 0
    leftDepth = MAX_DEPTH(root.left)
    rightDepth = MAX_DEPTH(root.right)
    return 1 + max(leftDepth, rightDepth)

------------------------------------------------------------------------------
BFS | O(N) | O(N)

MAX_DEPTH(root):
    if root is null:
        return 0
    queue = [root]
    depth = 0
    while queue is not empty:
        numberOfNodes = size(queue)
        repeat numberOfNodes times:
            node = dequeue(queue)
            if node.left exists:
                enqueue node.left
            if node.right exists:
                enqueue node.right
        depth++
    return depth
```

## Binary Tree Level Order Traversal

Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).

**Example:** `root = [3, 9, 20, null, null, 15, 7]` → `[[3],[9,20],[15,7]]`

```text
LEVEL_ORDER(root):
    if root is null:
        return []
    queue = [root]
    result = []
    while queue is not empty:
        level = []
        levelSize = size(queue)
        repeat levelSize times:
            node = dequeue(queue)
            add node.value to level
            if node.left exists:
                enqueue node.left
            if node.right exists:
                enqueue node.right
        add level to result
    return result
```

## Validate Binary Search Tree

Given the root of a binary tree, determine if it is a valid binary search tree (BST).

**Example:** `root = [2, 1, 3]` → `true`

```text
BRUTE FORCE | O(N^2) | O(N)

For every node, check if all nodes in the left subtree are less than the node's value and all nodes in the right subtree are greater than the node's value.

-----------------------------------------------------------------------------
RECURSION | O(N) | O(H)

IS_BST(root):
    return VALID(root, -infinity, +infinity)

VALID(node, minValue, maxValue):
    if node is null:
        return true
    if node.value <= minValue OR node.value >= maxValue:
        return false
    return VALID(node.left, minValue, node.value)
           AND
           VALID(node.right, node.value, maxValue)
```

## Kth Smallest Element in a BST

Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.

**Example:** `root = [3, 1, 4, null, 2], k = 1` → `1`

```text
// Use in-order traversal to get the elements in sorted order and return the kth element.

ITERATIVE | O(H + k) | O(H)

KTH_SMALLEST(root, k):
    stack = []
    current = root
    while true:
        while current is not null:
            push current
            current = current.left
        current = pop stack
        k--
        if k == 0:
            return current.value
        current = current.right
```

```cs
int index = 0;
public int KthSmallest(TreeNode root, int k) {
    return InOrder(root, k).val;
}
public TreeNode InOrder(TreeNode root, int k){
    if(root==null) return null;
    TreeNode result = InOrder(root.left, k);
    if(result != null) return result;
    index++;
    if(index == k)
        return root;
    return InOrder(root.right, k);
}
```

## Lowest Common Ancestor of a Binary Tree

Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.
LCA is the lowest node that has both nodes as descendants (where we allow a node to be a descendant of itself).

**Example:** `root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1` → `3`

```text
PATH BASED | O(N) | O(N)

Find path to each node, then compare the paths to find the last common node.

-----------------------------------------------------------------------------

RECURSION | O(N) | O(H)

// Search left and right subtrees for the two nodes. If both nodes are found in different subtrees, the current node is the LCA.

LCA(root, p, q):
    if root is null:
        return null
    if root == p OR root == q:
        return root
    left = LCA(root.left, p, q)
    right = LCA(root.right, p, q)
    if left is not null AND right is not null:
        return root
    if left is not null:
        return left
    return right
```

## Diameter of Binary Tree

Given the root of a binary tree, return the length of the diameter of the tree. The diameter of a binary tree is the length of the longest path between any two nodes in a tree. This path may or may not pass through the root.

**Example:** `root = [1, 2, 3, 4, 5]` → `3`

```text
BRUTE FORCE | O(N^2) | O(N)

diameter through node = height(left) + height(right)
Calculate the diameter for each node and return the maximum.

-----------------------------------------------------------------------------

DFS (BOTTOM-UP) | O(N) | O(H)

Calculate the height of each subtree while keeping track of the maximum diameter found so far.

DIAMETER(root):
    answer = 0
    HEIGHT(node):
        if node is null:
            return 0
        leftHeight = HEIGHT(node.left)
        rightHeight = HEIGHT(node.right)
        answer = max(answer, leftHeight + rightHeight)
        return 1 + max(leftHeight, rightHeight)
    HEIGHT(root)
    return answer
```

## Binary Tree Maximum Path Sum

Given a non-empty binary tree of integers, find the maximum path sum. A path is defined as any sequence of nodes from some starting node to any node in the tree along the parent-child connections. The path must contain at least one node and does not need to go through the root.

**Example:** `root = [-10, 9, 20, null, null, 15, 7]` → `42`

```text
BRUTE FORCE | O(N^2) | O(N)

Calculate the maximum path sum for each node by considering all possible paths through that node.

-----------------------------------------------------------------------------

BOTTOM-UP DP | O(N) | O(H)

For a node, either include the left child, right child, or neither in the path. Keep track of the maximum path sum found so far.

MAX_PATH_SUM(root):
    answer = -infinity
    GAIN(node):
        if node is null:
            return 0
        leftGain = GAIN(node.left)
        rightGain = GAIN(node.right)
        leftGain = max(0, leftGain)
        rightGain = max(0, rightGain)
        pathThroughNode = leftGain + node.value + rightGain
        answer = max(answer, pathThroughNode)
        return node.value + max(leftGain, rightGain)
    GAIN(root)
    return answer
```

## Binary Tree Right Side View

Given the root of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.

**Example:** `root = [1, 2, 3, null, 5, null, 4]` → `[1, 3, 4]`

```text
BFS | O(N) | O(N)

// Do level order traversal and add the last node of each level to the result.

RIGHT_SIDE_VIEW(root):
    if root is null:
        return []
    queue = [root]
    result = []
    while queue is not empty:
        levelSize = size(queue)
        repeat levelSize times:
            node = dequeue(queue)
            if node.left exists:
                enqueue node.left
            if node.right exists:
                enqueue node.right
            if this is the last node of current level:
                add node.value to result
    return result

-----------------------------------------------------------------------------

DFS | O(N) | O(H)

// Do a depth-first traversal, prioritizing the right child then left. Keep track of the depth and add the first node encountered at each depth to the result.

RIGHT_SIDE_VIEW(root):
    result = []
    DFS(node, depth):
        if node is null:
            return
        if depth == size(result):
            add node.value to result
        DFS(node.right, depth + 1)
        DFS(node.left, depth + 1)
    DFS(root, 0)
    return result
```

## Construct Binary Tree from Preorder and Inorder Traversal

Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree.

**Example:** `preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]` → `[3,9,20,null,null,15,7]`

```text
BRUTE FORCE | O(N^2) | O(N)

For each node in the preorder array, find its index in the inorder array to determine the left and right subtrees. Recursively build the tree.

-----------------------------------------------------------------------------

HASHMAP | O(N) | O(N)

// Use a hashmap to store the indices of the inorder values for O(1) lookups. Recursively build the tree using the preorder array to determine the root nodes.

BUILD(preorder, inorder):
    inorderIndex = hashmap()
    for i from 0 to inorder.length - 1:
        inorderIndex[inorder[i]] = i
    preorderIndex = 0
    BUILD_TREE(left, right):
        if left > right:
            return null
        rootValue = preorder[preorderIndex]
        preorderIndex++
        root = new Node(rootValue)
        mid = inorderIndex[rootValue]
        root.left = BUILD_TREE(left, mid - 1)
        root.right = BUILD_TREE(mid + 1, right)
        return root
    return BUILD_TREE(0, inorder.length - 1)
```

## Serialize and Deserialize Binary Tree

Design an algorithm to serialize and deserialize a binary tree.

**Example:** `root = [1,2,3,null,null,4,5]` → serialize → deserialize → `[1,2,3,null,null,4,5]`

```text
PREORDER TRAVERSAL | O(N) | O(N)

// Consider the tree as a string representation using pre-order traversal. Use a special character to denote null nodes.

SERIALIZE(node):
    if node is null:
        return "#"
    return node.value + ","
           + SERIALIZE(node.left) + ","
           + SERIALIZE(node.right)

DESERIALIZE():
    token = next token
    if token == "#":
        return null
    node = new Node(token)
    node.left = DESERIALIZE()
    node.right = DESERIALIZE()
    return node
```

## House Robber III

Given the root of a binary tree, return the maximum amount of money the thief can rob without alerting the police. The thief cannot rob two directly-linked houses.

**Example:** `root = [3, 2, 3, null, 3, null, 1]` → `7`

```text
BRUTE FORCE | O(2^N) | O(H)

For each node, decide whether to rob it or not. If you rob it, you cannot rob its children. If you don't rob it, you can rob its children. Recursively calculate the maximum amount for each choice.

-----------------------------------------------------------------------------

DP | O(N) | O(H)

// For each node calculate rob[node] and notRob[node].
// rob = node.value + left.notRob + right.notRob
// notRob = max(left.rob, left.notRob) + max(right.rob, right.notRob)

HOUSE_ROBBER(root):
    DFS(node):
        if node is null:
            return (0, 0)
        left = DFS(node.left)
        right = DFS(node.right)
        rob = node.value + left.notRob + right.notRob
        notRob = max(left.rob, left.notRob) + max(right.rob, right.notRob)
        return (rob, notRob)
    result = DFS(root)
    return max(result.rob, result.notRob)
```

## Invert Binary Tree

Given the root of a binary tree, invert it (mirror it) and return its root.

**Example:** `root = [4,2,7,1,3,6,9]` → `[4,7,2,9,6,3,1]`

```text
RECURSION | O(N) | O(H)

INVERT(node):
    if node is null:
        return null
    swap(node.left, node.right)
    INVERT(node.left)
    INVERT(node.right)
    return node

------------------------------------------------------------------------------

ITERATIVE BFS | O(N) | O(N)

INVERT(root):
    if root is null:
        return null
    queue = [root]
    while queue is not empty:
        node = dequeue(queue)
        swap(node.left, node.right)
        if node.left exists:
            enqueue node.left
        if node.right exists:
            enqueue node.right
    return root
```

## Same Tree and Subtree of Another Tree

Given the roots of two binary trees, determine whether they are identical, and whether one tree contains a subtree identical to the other.

**Example:** `root = [3,4,5,1,2], subRoot = [4,1,2]` → `true`

```text
RECURSION | O(N * M) | O(H)

IS_SAME(a, b):
    if a is null AND b is null:
        return true
    if a is null OR b is null:
        return false
    if a.value != b.value:
        return false
    return IS_SAME(a.left, b.left)
           AND
           IS_SAME(a.right, b.right)

IS_SUBTREE(root, subRoot):
    if subRoot is null:
        return true
    if root is null:
        return false
    if IS_SAME(root, subRoot):
        return true
    return IS_SUBTREE(root.left, subRoot)
           OR
           IS_SUBTREE(root.right, subRoot)

------------------------------------------------------------------------------

SERIALIZE + STRING SEARCH | O(N + M) | O(N + M)

// Serialize both trees with explicit null markers and delimiters, then run KMP
// Markers are required, otherwise "12" would falsely match inside "212"

return serialize(subRoot) is a substring of serialize(root)
```

> Symmetric Tree is the same comparison applied to `root.left` and a mirrored `root.right`.

## Balanced Binary Tree

Given a binary tree, determine whether it is height-balanced: the depths of the two subtrees of every node differ by at most one.

**Example:** `root = [3, 9, 20, null, null, 15, 7]` → `true`

```text
TOP-DOWN | O(N^2) | O(H)

Compute the height of both subtrees at every node and compare them

------------------------------------------------------------------------------

BOTTOM-UP WITH SENTINEL | O(N) | O(H)

// Return -1 as soon as any subtree is unbalanced so the rest is skipped

HEIGHT(node):
    if node is null:
        return 0
    leftHeight = HEIGHT(node.left)
    if leftHeight == -1:
        return -1
    rightHeight = HEIGHT(node.right)
    if rightHeight == -1:
        return -1
    if abs(leftHeight - rightHeight) > 1:
        return -1
    return 1 + max(leftHeight, rightHeight)

IS_BALANCED(root):
    return HEIGHT(root) != -1
```

## Path Sum III

Given the root of a binary tree and an integer targetSum, return the number of downward paths (not necessarily starting at the root or ending at a leaf) whose values sum to targetSum.

**Example:** `root = [10,5,-3,3,2,null,11,3,-2,null,1], targetSum = 8` → `3`

```text
BRUTE FORCE | O(N^2) | O(H)

For every node, walk down all paths starting at that node and count matches

------------------------------------------------------------------------------

PREFIX SUM + HASH MAP | O(N) | O(H)

// Same idea as Subarray Sum Equals K, applied along the root-to-node path
// Remove the current prefix on the way back up so sibling branches are unaffected

PATH_SUM(root, targetSum):
    prefixCount = empty map
    prefixCount[0] = 1
    count = 0
    DFS(node, currentSum):
        if node is null:
            return
        currentSum += node.value
        count += prefixCount[currentSum - targetSum]
        prefixCount[currentSum]++
        DFS(node.left, currentSum)
        DFS(node.right, currentSum)
        prefixCount[currentSum]--     // Backtrack
    DFS(root, 0)
    return count
```
