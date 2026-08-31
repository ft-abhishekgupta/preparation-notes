# Graphs — Problems

| # | Problem | LeetCode | Pattern | Difficulty |
| - | ------- | -------- | ------- | ---------- |
| 1 | Number of Islands | 200 | Grid Traversal | Medium |
| 2 | Max Area of Island | 695 | Grid Traversal | Medium |
| 3 | Flood Fill | 733 | Grid Traversal | Easy |
| 4 | Surrounded Regions | 130 | Grid Traversal | Medium |
| 5 | Pacific Atlantic Water Flow | 417 | Grid Traversal | Medium |
| 6 | Longest Increasing Path in a Matrix | 329 | Grid DFS + Memo | Hard |
| 7 | Rotting Oranges | 994 | Multi-Source BFS | Medium |
| 8 | 01 Matrix | 542 | Multi-Source BFS | Medium |
| 9 | Walls and Gates | 286 | Multi-Source BFS | Medium |
| 10 | Word Ladder | 127 | BFS / Bidirectional BFS | Hard |
| 11 | Clone Graph | 133 | DFS + HashMap | Medium |
| 12 | Course Schedule | 207 | Topological Sort | Medium |
| 13 | Course Schedule II | 210 | Topological Sort | Medium |
| 14 | Alien Dictionary | 269 | Topological Sort | Hard |
| 15 | Number of Provinces | 547 | Union-Find | Medium |
| 16 | Graph Valid Tree | 261 | Union-Find | Medium |
| 17 | Redundant Connection | 684 | Union-Find | Medium |
| 18 | Accounts Merge | 721 | Union-Find | Medium |
| 19 | Network Delay Time | 743 | Shortest Path | Medium |
| 20 | Cheapest Flights Within K Stops | 787 | Shortest Path | Medium |
| 21 | Path with Minimum Effort | 1631 | Shortest Path | Medium |
| 22 | Swim in Rising Water | 778 | Shortest Path | Hard |
| 23 | Find City With Smallest Neighbours <= Threshold | 1334 | Floyd-Warshall | Medium |
| 24 | Min Cost to Connect All Points | 1584 | MST | Medium |
| 25 | Is Graph Bipartite | 785 | Bipartite | Medium |
| 26 | Critical Connections in a Network | 1192 | Bridges (Tarjan) | Hard |
| 27 | Reconstruct Itinerary | 332 | Eulerian Path | Hard |
| 28 | Word Search II | 212 | see Tries | Hard |

---

## Grid Traversal (Flood Fill)

### Number of Islands — LeetCode 200

Count islands in a binary grid ('1' = land, '0' = water). An island is a group of '1's connected horizontally/vertically.

**Example:** `grid = [["1","1","0"],["1","0","0"],["0","0","1"]]` -> `2`

```text
OPTIMAL — DFS IN-PLACE MARK | O(M*N) | O(M*N)

For each unvisited '1': increment count, DFS to sink the island (mark '0').
```

```csharp
public int NumIslands(char[][] grid)
{
    int rows = grid.Length, cols = grid[0].Length, islands = 0;
    void Dfs(int r, int c)
    {
        if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] != '1') return;
        grid[r][c] = '0';
        Dfs(r + 1, c); Dfs(r - 1, c); Dfs(r, c + 1); Dfs(r, c - 1);
    }
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (grid[r][c] == '1') { islands++; Dfs(r, c); }
    return islands;
}
```

> **Key insight:** Sink each island ('1'->'0') during DFS so no separate `visited` array is needed.

---

### Max Area of Island — LeetCode 695

Find the largest island (maximum count of connected '1's).

**Example:** `grid = [[0,0,1,0],[0,1,1,0],[0,1,0,0]]` -> `4`

```text
OPTIMAL — DFS RETURNING SIZE | O(M*N) | O(M*N)

DFS returns the cell count; accumulate with 1+ at each level.
```

```csharp
public int MaxAreaOfIsland(int[][] grid)
{
    int rows = grid.Length, cols = grid[0].Length, best = 0;
    int Dfs(int r, int c)
    {
        if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] != 1) return 0;
        grid[r][c] = 0;
        return 1 + Dfs(r + 1, c) + Dfs(r - 1, c) + Dfs(r, c + 1) + Dfs(r, c - 1);
    }
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            best = Math.Max(best, Dfs(r, c));
    return best;
}
```

> **Key insight:** DFS returns subtree size — accumulate with `1 +` at each level.

---

### Flood Fill — LeetCode 733

From `(sr, sc)`, replace all cells of the original colour with `newColor` (4-directional).

**Example:** `image=[[1,1,1],[1,1,0],[1,0,1]], sr=1, sc=1, color=2` -> `[[2,2,2],[2,2,0],[2,0,1]]`

```text
OPTIMAL — DFS | O(M*N) | O(M*N)

Guard: if start cell already equals newColor, return immediately — prevents infinite loop.
```

```csharp
public int[][] FloodFill(int[][] image, int sr, int sc, int color)
{
    int orig = image[sr][sc];
    if (orig == color) return image;
    int rows = image.Length, cols = image[0].Length;
    void Dfs(int r, int c)
    {
        if (r < 0 || r >= rows || c < 0 || c >= cols || image[r][c] != orig) return;
        image[r][c] = color;
        Dfs(r + 1, c); Dfs(r - 1, c); Dfs(r, c + 1); Dfs(r, c - 1);
    }
    Dfs(sr, sc);
    return image;
}
```

> **Key insight:** Guard `orig == color` at the start — otherwise the recursion never terminates.

---

### Surrounded Regions — LeetCode 130

Capture all 'O' regions not connected to any border cell by replacing them with 'X'.

**Example:** Board with 'O's — border-connected 'O's stay; interior 'O's become 'X'.

```text
BRUTE FORCE | O((M*N)^2) | O(M*N)

For each 'O', BFS to border — redundant work.

------------------------------------------------------------------------------

OPTIMAL — REVERSE FLOOD FILL FROM BORDERS | O(M*N) | O(M*N)

1. DFS from every border 'O', mark reachable cells 'S' (safe).
2. Scan: 'O' -> 'X' (captured), 'S' -> 'O' (restore).
```

```csharp
public void Solve(char[][] board)
{
    int rows = board.Length, cols = board[0].Length;
    void Dfs(int r, int c)
    {
        if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] != 'O') return;
        board[r][c] = 'S';
        Dfs(r + 1, c); Dfs(r - 1, c); Dfs(r, c + 1); Dfs(r, c - 1);
    }
    for (int r = 0; r < rows; r++) { Dfs(r, 0); Dfs(r, cols - 1); }
    for (int c = 0; c < cols; c++) { Dfs(0, c); Dfs(rows - 1, c); }
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            board[r][c] = board[r][c] == 'S' ? 'O' : (board[r][c] == 'O' ? 'X' : board[r][c]);
}
```

> **Key insight:** Mark border-connected cells safe first, then capture everything else in a single scan.

---

### Pacific Atlantic Water Flow — LeetCode 417

Return cells from which water can flow to both the Pacific (top/left) and Atlantic (bottom/right) oceans.

**Example:** `heights=[[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]` -> `[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]`

```text
BRUTE FORCE | O((M*N)^2) | O(M*N)

DFS from every cell toward both oceans — redundant exploration.

------------------------------------------------------------------------------

OPTIMAL — REVERSE BFS FROM BOTH OCEAN BORDERS | O(M*N) | O(M*N)

BFS inward (to equal-or-higher neighbours) from Pacific seeds and Atlantic seeds.
Intersection = cells that can reach both.
```

```csharp
public IList<IList<int>> PacificAtlantic(int[][] h)
{
    int R = h.Length, C = h[0].Length;
    bool[,] pac = new bool[R, C], atl = new bool[R, C];
    int[] dr = { -1, 1, 0, 0 }, dc = { 0, 0, -1, 1 };
    void Bfs(bool[,] vis, Queue<(int r, int c)> q)
    {
        while (q.Count > 0)
        {
            var (r, c) = q.Dequeue();
            for (int d = 0; d < 4; d++)
            {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr >= 0 && nr < R && nc >= 0 && nc < C && !vis[nr, nc] && h[nr][nc] >= h[r][c])
                { vis[nr, nc] = true; q.Enqueue((nr, nc)); }
            }
        }
    }
    var pq = new Queue<(int, int)>(); var aq = new Queue<(int, int)>();
    for (int r = 0; r < R; r++) { pac[r, 0] = true; pq.Enqueue((r, 0)); atl[r, C - 1] = true; aq.Enqueue((r, C - 1)); }
    for (int c = 0; c < C; c++) { pac[0, c] = true; pq.Enqueue((0, c)); atl[R - 1, c] = true; aq.Enqueue((R - 1, c)); }
    Bfs(pac, pq); Bfs(atl, aq);
    var res = new List<IList<int>>();
    for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) if (pac[r, c] && atl[r, c]) res.Add(new[] { r, c });
    return res;
}
```

> **Key insight:** Reverse the flow — BFS uphill from ocean borders avoids per-cell DFS.

---

### Longest Increasing Path in a Matrix — LeetCode 329

Longest strictly increasing path in a matrix (4 directions, no wrapping).

**Example:** `matrix=[[9,9,4],[6,6,8],[2,1,1]]` -> `4` (1->2->6->9)

```text
BRUTE FORCE DFS | O(4^(M*N)) | O(M*N)

DFS from every cell without memoisation.

------------------------------------------------------------------------------

OPTIMAL — DFS + MEMOISATION | O(M*N) | O(M*N)

Strict increase = implicit DAG (no cycles). No visited set needed.
memo[r][c] = length of the longest increasing path starting at (r,c).
```

```csharp
public int LongestIncreasingPath(int[][] matrix)
{
    int rows = matrix.Length, cols = matrix[0].Length;
    int[,] memo = new int[rows, cols];
    int[] dr = { -1, 1, 0, 0 }, dc = { 0, 0, -1, 1 };
    int Dfs(int r, int c)
    {
        if (memo[r, c] != 0) return memo[r, c];
        int best = 1;
        for (int d = 0; d < 4; d++)
        {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c])
                best = Math.Max(best, 1 + Dfs(nr, nc));
        }
        return memo[r, c] = best;
    }
    int ans = 0;
    for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) ans = Math.Max(ans, Dfs(r, c));
    return ans;
}
```

> **Key insight:** Strict increase creates an implicit DAG — DFS+memo is safe without a visited set.

---

## Multi-Source BFS

### Rotting Oranges — LeetCode 994

Each minute, fresh oranges adjacent to rotten ones become rotten. Return minutes until all fresh are rotten, or -1.

**Example:** `grid=[[2,1,1],[1,1,0],[0,1,1]]` -> `4`

```text
BRUTE FORCE SIMULATION | O(M*N*minutes) | O(M*N)

Repeatedly scan grid until no change.

------------------------------------------------------------------------------

OPTIMAL — MULTI-SOURCE BFS | O(M*N) | O(M*N)

Seed all rotten cells at time 0. Level-by-level BFS = 1 minute per level.
```

```csharp
public int OrangesRotting(int[][] grid)
{
    int rows = grid.Length, cols = grid[0].Length, fresh = 0, minutes = 0;
    var q = new Queue<(int r, int c)>();
    for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++)
    { if (grid[r][c] == 2) q.Enqueue((r, c)); else if (grid[r][c] == 1) fresh++; }
    int[] dr = { -1, 1, 0, 0 }, dc = { 0, 0, -1, 1 };
    while (q.Count > 0 && fresh > 0)
    {
        int size = q.Count; minutes++;
        for (int i = 0; i < size; i++)
        {
            var (r, c) = q.Dequeue();
            for (int d = 0; d < 4; d++)
            {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1)
                { grid[nr][nc] = 2; fresh--; q.Enqueue((nr, nc)); }
            }
        }
    }
    return fresh == 0 ? minutes : -1;
}
```

> **Key insight:** Multi-source BFS with all rotten cells simultaneously gives exact per-minute distances in one pass.

---

### 01 Matrix — LeetCode 542

For each cell, find the distance to the nearest `0`.

**Example:** `mat=[[0,0,0],[0,1,0],[1,1,1]]` -> `[[0,0,0],[0,1,0],[1,2,1]]`

```text
BRUTE FORCE BFS FROM EACH 1 | O((M*N)^2) | O(M*N)

BFS from every '1' independently.

------------------------------------------------------------------------------

OPTIMAL — MULTI-SOURCE BFS FROM ALL 0s | O(M*N) | O(M*N)

Seed all 0s (distance 0). BFS outward fills each '1' with nearest-0 distance.
```

```csharp
public int[][] UpdateMatrix(int[][] mat)
{
    int rows = mat.Length, cols = mat[0].Length;
    int[][] dist = new int[rows][]; for (int i = 0; i < rows; i++) dist[i] = new int[cols];
    var q = new Queue<(int r, int c)>();
    for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++)
    { if (mat[r][c] == 0) q.Enqueue((r, c)); else dist[r][c] = int.MaxValue; }
    int[] dr = { -1, 1, 0, 0 }, dc = { 0, 0, -1, 1 };
    while (q.Count > 0)
    {
        var (r, c) = q.Dequeue();
        for (int d = 0; d < 4; d++)
        {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && dist[nr][nc] > dist[r][c] + 1)
            { dist[nr][nc] = dist[r][c] + 1; q.Enqueue((nr, nc)); }
        }
    }
    return dist;
}
```

> **Key insight:** BFS from all zeros simultaneously is O(M·N); BFS from each '1' separately is O((M·N)²).

---

### Walls and Gates — LeetCode 286

Fill each empty room (INF) with the distance to its nearest gate (0). Walls are -1.

**Example:** Grid of INF/0/-1 -> each INF filled with shortest gate distance.

```text
OPTIMAL — MULTI-SOURCE BFS FROM ALL GATES | O(M*N) | O(M*N)

Seed all gates; BFS outward assigns distances. Same pattern as 01 Matrix.
```

```csharp
public void WallsAndGates(int[][] rooms)
{
    int rows = rooms.Length, cols = rooms[0].Length;
    var q = new Queue<(int r, int c)>();
    for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) if (rooms[r][c] == 0) q.Enqueue((r, c));
    int[] dr = { -1, 1, 0, 0 }, dc = { 0, 0, -1, 1 };
    while (q.Count > 0)
    {
        var (r, c) = q.Dequeue();
        for (int d = 0; d < 4; d++)
        {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && rooms[nr][nc] == int.MaxValue)
            { rooms[nr][nc] = rooms[r][c] + 1; q.Enqueue((nr, nc)); }
        }
    }
}
```

> **Key insight:** Multi-source BFS from all gates fills the entire grid in a single O(M·N) pass.

---

### Word Ladder — LeetCode 127

Shortest transformation chain from `beginWord` to `endWord`, changing one letter at a time through dictionary words.

**Example:** `beginWord="hit", endWord="cog", wordList=["hot","dot","dog","lot","log","cog"]` -> `5`

```text
BFS | O(N*M^2) | O(N*M)

N = word count, M = word length. Generate M*26 neighbours per dequeued word.

------------------------------------------------------------------------------

OPTIMAL — BIDIRECTIONAL BFS | O(N*M^2) | O(N*M)

Search from both ends; always expand the smaller frontier.
Stops when a generated neighbour is in the opposite frontier.
Reduces search space from O(b^d) to O(b^(d/2)).
```

```csharp
public int LadderLength(string beginWord, string endWord, IList<string> wordList)
{
    var dict = new HashSet<string>(wordList);
    if (!dict.Contains(endWord)) return 0;
    var front = new HashSet<string> { beginWord };
    var back  = new HashSet<string> { endWord };
    int dist = 1;
    while (front.Count > 0 && back.Count > 0)
    {
        if (front.Count > back.Count) (front, back) = (back, front);
        var next = new HashSet<string>();
        foreach (var word in front)
        {
            char[] arr = word.ToCharArray();
            for (int i = 0; i < arr.Length; i++)
            {
                char orig = arr[i];
                for (char c = 'a'; c <= 'z'; c++)
                {
                    if (c == orig) continue;
                    arr[i] = c; var nb = new string(arr);
                    if (back.Contains(nb)) return dist + 1;
                    if (dict.Contains(nb)) { next.Add(nb); dict.Remove(nb); }
                    arr[i] = orig;
                }
            }
        }
        front = next; dist++;
    }
    return 0;
}
```

> **Key insight:** Bidirectional BFS dramatically shrinks the search space — always expand the smaller frontier.

---

## Clone

### Clone Graph — LeetCode 133

Deep copy a connected undirected graph (each node has `val` and `neighbors`).

**Example:** `adjList=[[2,4],[1,3],[2,4],[1,3]]` -> identical independent clone.

```text
OPTIMAL — DFS + HASHMAP | O(V+E) | O(V)

Map original -> clone before recursing into neighbours to handle cycles.
```

```csharp
public Node CloneGraph(Node node)
{
    if (node == null) return null;
    var map = new Dictionary<Node, Node>();
    Node Dfs(Node n)
    {
        if (map.ContainsKey(n)) return map[n];
        var clone = new Node(n.val);
        map[n] = clone; // store BEFORE recursing — handles cycles
        foreach (var nb in n.neighbors) clone.neighbors.Add(Dfs(nb));
        return clone;
    }
    return Dfs(node);
}
```

> **Key insight:** Store the clone before recursing — prevents infinite loops on cycles.

---

## Topological Sort

### Course Schedule — LeetCode 207

Can all courses be finished given prerequisite constraints?

**Example:** `numCourses=2, prerequisites=[[1,0]]` -> `true`

```text
DFS 3-COLOUR | O(V+E) | O(V)

States: 0=unvisited, 1=in-stack, 2=done. Back edge to state-1 = cycle.

------------------------------------------------------------------------------

OPTIMAL — KAHN'S TOPOLOGICAL SORT | O(V+E) | O(V)

If processed count < numCourses, a cycle blocked full processing.
```

```csharp
public bool CanFinish(int numCourses, int[][] prerequisites)
{
    var g = new List<int>[numCourses];
    for (int i = 0; i < numCourses; i++) g[i] = new();
    int[] indeg = new int[numCourses];
    foreach (var p in prerequisites) { g[p[1]].Add(p[0]); indeg[p[0]]++; }
    var q = new Queue<int>();
    for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q.Enqueue(i);
    int done = 0;
    while (q.Count > 0)
    {
        int u = q.Dequeue(); done++;
        foreach (int v in g[u]) if (--indeg[v] == 0) q.Enqueue(v);
    }
    return done == numCourses;
}
```

> **Key insight:** Kahn's: nodes with indegree 0 are safe to process; a remaining cycle prevents count reaching V.

---

### Course Schedule II — LeetCode 210

Return a valid topological course order, or empty array if impossible.

**Example:** `numCourses=4, prerequisites=[[1,0],[2,0],[3,1],[3,2]]` -> `[0,1,2,3]`

```text
DFS POST-ORDER | O(V+E) | O(V+E)

Post-order DFS; reverse gives topo order.

------------------------------------------------------------------------------

OPTIMAL — KAHN'S BFS | O(V+E) | O(V+E)

Dequeue order is directly the topological order.
```

```csharp
public int[] FindOrder(int numCourses, int[][] prerequisites)
{
    var g = new List<int>[numCourses];
    for (int i = 0; i < numCourses; i++) g[i] = new();
    int[] indeg = new int[numCourses];
    foreach (var p in prerequisites) { g[p[1]].Add(p[0]); indeg[p[0]]++; }
    var q = new Queue<int>();
    for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q.Enqueue(i);
    var res = new List<int>();
    while (q.Count > 0)
    {
        int u = q.Dequeue(); res.Add(u);
        foreach (int v in g[u]) if (--indeg[v] == 0) q.Enqueue(v);
    }
    return res.Count == numCourses ? res.ToArray() : Array.Empty<int>();
}
```

> **Key insight:** Kahn's dequeue order is a valid topo order; empty result signals a cycle.

---

### Alien Dictionary — LeetCode 269

Derive character ordering of an alien language from a sorted word list.

**Example:** `words=["wrt","wrf","er","ett","rftt"]` -> `"wertf"`

```text
TOPOLOGICAL SORT | O(C + U + E) | O(U + E)
C = total characters, U = unique chars, E = ordering edges.

Compare adjacent word pairs -> first differing char gives a directed edge.
Topo sort on characters; return "" on cycle or invalid prefix.
```

```csharp
public string AlienOrder(string[] words)
{
    var indeg = new Dictionary<char, int>();
    var g = new Dictionary<char, List<char>>();
    foreach (var w in words) foreach (char c in w) { indeg.TryAdd(c, 0); g.TryAdd(c, new()); }
    for (int i = 0; i < words.Length - 1; i++)
    {
        string a = words[i], b = words[i + 1];
        if (a.Length > b.Length && a.StartsWith(b)) return "";
        for (int j = 0; j < Math.Min(a.Length, b.Length); j++)
            if (a[j] != b[j]) { g[a[j]].Add(b[j]); indeg[b[j]]++; break; }
    }
    var q = new Queue<char>();
    foreach (var kv in indeg) if (kv.Value == 0) q.Enqueue(kv.Key);
    var sb = new System.Text.StringBuilder();
    while (q.Count > 0)
    {
        char c = q.Dequeue(); sb.Append(c);
        foreach (char nb in g[c]) if (--indeg[nb] == 0) q.Enqueue(nb);
    }
    return sb.Length == indeg.Count ? sb.ToString() : "";
}
```

> **Key insight:** First differing char in adjacent word pairs gives a directed ordering edge; topo sort resolves the alphabet.

---

## Union-Find

### Number of Provinces — LeetCode 547

Count connected components from an n*n adjacency matrix.

**Example:** `isConnected=[[1,1,0],[1,1,0],[0,0,1]]` -> `2`

```text
DFS COMPONENT COUNT | O(V^2) | O(V)

DFS/BFS from each unvisited node.

------------------------------------------------------------------------------

OPTIMAL — UNION-FIND | O(V^2 * alpha(V)) | O(V)

Union all connected pairs; count remaining components.
```

```csharp
public int FindCircleNum(int[][] isConnected)
{
    int n = isConnected.Length;
    int[] parent = Enumerable.Range(0, n).ToArray(), rank = new int[n]; int comp = n;
    int Find(int x) => parent[x] == x ? x : parent[x] = Find(parent[x]);
    void Union(int a, int b)
    {
        int ra = Find(a), rb = Find(b);
        if (ra == rb) return;
        if (rank[ra] < rank[rb]) (ra, rb) = (rb, ra);
        parent[rb] = ra;
        if (rank[ra] == rank[rb]) rank[ra]++;
        comp--;
    }
    for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) if (isConnected[i][j] == 1) Union(i, j);
    return comp;
}
```

> **Key insight:** Province = connected component; DSU counts them with near-constant-time operations.

---

### Graph Valid Tree — LeetCode 261

Given `n` nodes and `edges`, check if they form a valid tree (connected + acyclic).

**Example:** `n=5, edges=[[0,1],[0,2],[0,3],[1,4]]` -> `true`

```text
DFS | O(V+E) | O(V+E)

Check connected and cycle-free.

------------------------------------------------------------------------------

OPTIMAL — UNION-FIND | O(E*alpha(V)) | O(V)

Tree iff exactly n-1 edges AND no Union fails (no cycle).
```

```csharp
public bool ValidTree(int n, int[][] edges)
{
    if (edges.Length != n - 1) return false;
    int[] parent = Enumerable.Range(0, n).ToArray(), rank = new int[n];
    int Find(int x) => parent[x] == x ? x : parent[x] = Find(parent[x]);
    bool Union(int a, int b)
    {
        int ra = Find(a), rb = Find(b);
        if (ra == rb) return false;
        if (rank[ra] < rank[rb]) (ra, rb) = (rb, ra);
        parent[rb] = ra;
        if (rank[ra] == rank[rb]) rank[ra]++;
        return true;
    }
    foreach (var e in edges) if (!Union(e[0], e[1])) return false;
    return true;
}
```

> **Key insight:** Exactly n-1 edges and no cycle are necessary and sufficient for a tree.

---

### Redundant Connection — LeetCode 684

A tree plus one extra edge; return the redundant edge.

**Example:** `edges=[[1,2],[1,3],[2,3]]` -> `[2,3]`

```text
BRUTE FORCE | O(N^2) | O(N)

Remove each edge; check connectivity.

------------------------------------------------------------------------------

OPTIMAL — UNION-FIND | O(E*alpha(V)) | O(V)

Process edges in order; first failed Union = redundant edge.
```

```csharp
public int[] FindRedundantConnection(int[][] edges)
{
    int n = edges.Length;
    int[] parent = Enumerable.Range(0, n + 1).ToArray(), rank = new int[n + 1];
    int Find(int x) => parent[x] == x ? x : parent[x] = Find(parent[x]);
    bool Union(int a, int b)
    {
        int ra = Find(a), rb = Find(b);
        if (ra == rb) return false;
        if (rank[ra] < rank[rb]) (ra, rb) = (rb, ra);
        parent[rb] = ra;
        if (rank[ra] == rank[rb]) rank[ra]++;
        return true;
    }
    foreach (var e in edges) if (!Union(e[0], e[1])) return e;
    return Array.Empty<int>();
}
```

> **Key insight:** First failed Union (both endpoints already connected) identifies the edge that closes the cycle.

---

### Accounts Merge — LeetCode 721

Merge accounts sharing an email. Each account is `[name, email1, ...]`.

**Example:** Two John accounts sharing "b@m" get merged.

```text
DFS ON EMAIL GRAPH | O(N*K*log(N*K)) | O(N*K)

Build email graph; find components.

------------------------------------------------------------------------------

OPTIMAL — UNION-FIND ON EMAILS | O(N*K*alpha(N*K)) | O(N*K)

Index each email. Union all emails in the same account. Group by root.
```

```csharp
public IList<IList<string>> AccountsMerge(IList<IList<string>> accounts)
{
    var emailId = new Dictionary<string, int>();
    var emailOwner = new Dictionary<string, string>();
    int id = 0;
    foreach (var acc in accounts)
        for (int i = 1; i < acc.Count; i++) { emailId.TryAdd(acc[i], id++); emailOwner.TryAdd(acc[i], acc[0]); }
    int[] parent = Enumerable.Range(0, id).ToArray(), rank = new int[id];
    int Find(int x) => parent[x] == x ? x : parent[x] = Find(parent[x]);
    void Union(int a, int b)
    {
        int ra = Find(a), rb = Find(b);
        if (ra == rb) return;
        if (rank[ra] < rank[rb]) (ra, rb) = (rb, ra);
        parent[rb] = ra;
        if (rank[ra] == rank[rb]) rank[ra]++;
    }
    foreach (var acc in accounts)
        for (int i = 2; i < acc.Count; i++) Union(emailId[acc[1]], emailId[acc[i]]);
    var groups = new Dictionary<int, SortedSet<string>>();
    foreach (var (email, eid) in emailId)
    {
        int root = Find(eid);
        if (!groups.ContainsKey(root)) groups[root] = new();
        groups[root].Add(email);
    }
    var res = new List<IList<string>>();
    foreach (var (root, emails) in groups)
    {
        var list = new List<string> { emailOwner[emails.First()] };
        list.AddRange(emails);
        res.Add(list);
    }
    return res;
}
```

> **Key insight:** Union-Find naturally groups emails across accounts; SortedSet provides sorted output.

---

## Shortest Path

### Network Delay Time — LeetCode 743

Signal from `k`; return time for all `n` nodes to receive it, or -1.

**Example:** `times=[[2,1,1],[2,3,1],[3,4,1]], n=4, k=2` -> `2`

```text
BELLMAN-FORD | O(V*E) | O(V)

Relax all edges V-1 times.

------------------------------------------------------------------------------

OPTIMAL — DIJKSTRA | O((V+E) log V) | O(V+E)

SSSP from k; answer = max dist (unreachable = -1).
```

```csharp
public int NetworkDelayTime(int[][] times, int n, int k)
{
    var g = new List<(int v, int w)>[n + 1]; for (int i = 0; i <= n; i++) g[i] = new();
    foreach (var t in times) g[t[0]].Add((t[1], t[2]));
    int[] dist = new int[n + 1]; Array.Fill(dist, int.MaxValue); dist[k] = 0;
    var pq = new PriorityQueue<int, int>(); pq.Enqueue(k, 0);
    while (pq.TryDequeue(out int u, out int d))
    {
        if (d > dist[u]) continue;
        foreach (var (v, w) in g[u]) if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; pq.Enqueue(v, dist[v]); }
    }
    int ans = 0;
    for (int i = 1; i <= n; i++) { if (dist[i] == int.MaxValue) return -1; ans = Math.Max(ans, dist[i]); }
    return ans;
}
```

> **Key insight:** SSSP + max distance — the last node reached is the signal bottleneck.

---

### Cheapest Flights Within K Stops — LeetCode 787

Cheapest price from `src` to `dst` using at most `k` stops.

**Example:** `n=4, flights=[[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src=0, dst=3, k=1` -> `700`

```text
PLAIN DIJKSTRA | WRONG

Minimises cost only; can discard a costlier path with fewer hops that reaches dst cheaper.

------------------------------------------------------------------------------

BELLMAN-FORD K+1 ROUNDS WITH SNAPSHOT | O(K*E) | O(V)

Relax all edges k+1 times. Snapshot prev=dist.Clone() before each round
prevents chaining multiple hops within one round (at-most-K-edges invariant).

------------------------------------------------------------------------------

OPTIMAL — BELLMAN-FORD WITH SNAPSHOT | O(K*E) | O(V)
```

```csharp
public int FindCheapestPrice(int n, int[][] flights, int src, int dst, int k)
{
    const int INF = 1_000_000_000;
    int[] dist = new int[n]; Array.Fill(dist, INF); dist[src] = 0;
    for (int i = 0; i <= k; i++)
    {
        int[] prev = (int[])dist.Clone(); // snapshot: prevents same-round chaining
        foreach (var f in flights)
            if (prev[f[0]] < INF) dist[f[1]] = Math.Min(dist[f[1]], prev[f[0]] + f[2]);
    }
    return dist[dst] == INF ? -1 : dist[dst];
}
```

> **Key insight:** Per-round snapshot enforces at-most K+1 edges — without it one round chains unlimited hops.

---

### Path with Minimum Effort — LeetCode 1631

Path from (0,0) to (rows-1,cols-1) minimising the maximum absolute height difference.

**Example:** `heights=[[1,2,2],[3,8,2],[5,3,5]]` -> `2`

```text
BINARY SEARCH + BFS | O(M*N*log(maxVal)) | O(M*N)

Binary search on effort; BFS feasibility check.

------------------------------------------------------------------------------

OPTIMAL — DIJKSTRA (MIN-MAX PATH) | O(M*N*log(M*N)) | O(M*N)

Treat height diff as edge weight. Dijkstra finds min-max path (cost = max edge, not sum).
```

```csharp
public int MinimumEffortPath(int[][] heights)
{
    int rows = heights.Length, cols = heights[0].Length;
    int[,] eff = new int[rows, cols];
    for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) eff[r, c] = int.MaxValue;
    eff[0, 0] = 0;
    var pq = new PriorityQueue<(int r, int c), int>(); pq.Enqueue((0, 0), 0);
    int[] dr = { -1, 1, 0, 0 }, dc = { 0, 0, -1, 1 };
    while (pq.TryDequeue(out var cur, out int e))
    {
        var (r, c) = cur; if (e > eff[r, c]) continue;
        if (r == rows - 1 && c == cols - 1) return e;
        for (int d = 0; d < 4; d++)
        {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            int ne = Math.Max(e, Math.Abs(heights[nr][nc] - heights[r][c]));
            if (ne < eff[nr, nc]) { eff[nr, nc] = ne; pq.Enqueue((nr, nc), ne); }
        }
    }
    return 0;
}
```

> **Key insight:** Redefine cost as max(edge weights) — Dijkstra still works because this cost is monotonically non-decreasing.

---

### Swim in Rising Water — LeetCode 778

Find the earliest time to swim from (0,0) to (n-1,n-1) when water rises to `t` at time `t`.

**Example:** `grid=[[0,2],[1,3]]` -> `3`

```text
BINARY SEARCH + BFS | O(N^2 log N) | O(N^2)

Binary search on t; BFS with cells <= t.

------------------------------------------------------------------------------

OPTIMAL — DIJKSTRA (MIN-MAX PATH) | O(N^2 log N) | O(N^2)

dist[r][c] = min over all paths of max cell value along the path.
```

```csharp
public int SwimInWater(int[][] grid)
{
    int n = grid.Length; int[,] dist = new int[n, n];
    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) dist[r, c] = int.MaxValue;
    dist[0, 0] = grid[0][0];
    var pq = new PriorityQueue<(int r, int c), int>(); pq.Enqueue((0, 0), grid[0][0]);
    int[] dr = { -1, 1, 0, 0 }, dc = { 0, 0, -1, 1 };
    while (pq.TryDequeue(out var cur, out int t))
    {
        var (r, c) = cur; if (t > dist[r, c]) continue;
        if (r == n - 1 && c == n - 1) return t;
        for (int d = 0; d < 4; d++)
        {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
            int nt = Math.Max(t, grid[nr][nc]);
            if (nt < dist[nr, nc]) { dist[nr, nc] = nt; pq.Enqueue((nr, nc), nt); }
        }
    }
    return -1;
}
```

> **Key insight:** Minimum time = min over all paths of max cell value — a min-max path solved by Dijkstra.

---

### Find the City With the Smallest Number of Neighbours at a Threshold Distance — LeetCode 1334

Return the city with the fewest cities reachable within `distanceThreshold`; largest index on ties.

**Example:** `n=4, edges=[[0,1,3],[1,2,1],[1,3,4],[2,3,1]], distanceThreshold=4` -> `3`

```text
DIJKSTRA FROM EACH CITY | O(V*(V+E) log V) | O(V^2)

Run SSSP from every city.

------------------------------------------------------------------------------

OPTIMAL — FLOYD-WARSHALL | O(V^3) | O(V^2)

All-pairs in one triple loop; then count reachable per city.
```

```csharp
public int FindTheCity(int n, int[][] edges, int distanceThreshold)
{
    int[,] dist = new int[n, n];
    for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) dist[i, j] = i == j ? 0 : int.MaxValue / 2;
    foreach (var e in edges) { dist[e[0], e[1]] = e[2]; dist[e[1], e[0]] = e[2]; }
    for (int k = 0; k < n; k++) for (int i = 0; i < n; i++) for (int j = 0; j < n; j++)
        dist[i, j] = Math.Min(dist[i, j], dist[i, k] + dist[k, j]);
    int ans = -1, minCount = n + 1;
    for (int i = 0; i < n; i++)
    {
        int cnt = 0; for (int j = 0; j < n; j++) if (i != j && dist[i, j] <= distanceThreshold) cnt++;
        if (cnt <= minCount) { minCount = cnt; ans = i; } // iterating up keeps largest index on ties
    }
    return ans;
}
```

> **Key insight:** Floyd-Warshall gives all-pairs in O(V^3); iterating cities upward keeps the largest index on ties.

---

## Minimum Spanning Tree

### Min Cost to Connect All Points — LeetCode 1584

Connect all 2D points with minimum total Manhattan distance.

**Example:** `points=[[0,0],[2,2],[3,10],[5,2],[7,0]]` -> `20`

```text
KRUSKAL | O(V^2 log V) | O(V^2)

Generate all V^2 edges, sort, then DSU.

------------------------------------------------------------------------------

OPTIMAL — PRIM'S O(V^2) | O(V^2) | O(V)

Dense (complete) graph: scan all unvisited nodes each step.
O(V^2) scan beats O(V^2 log V) Kruskal for complete graphs.
```

```csharp
public int MinCostConnectPoints(int[][] points)
{
    int n = points.Length; int[] minCost = new int[n]; Array.Fill(minCost, int.MaxValue); minCost[0] = 0;
    bool[] inMST = new bool[n]; int total = 0;
    for (int iter = 0; iter < n; iter++)
    {
        int u = -1;
        for (int i = 0; i < n; i++) if (!inMST[i] && (u == -1 || minCost[i] < minCost[u])) u = i;
        inMST[u] = true; total += minCost[u];
        for (int v = 0; v < n; v++) if (!inMST[v])
        {
            int d = Math.Abs(points[u][0] - points[v][0]) + Math.Abs(points[u][1] - points[v][1]);
            if (d < minCost[v]) minCost[v] = d;
        }
    }
    return total;
}
```

> **Key insight:** On a complete graph, Prim's linear scan per iteration is optimal — no need to sort all edges.

---

## Bipartite

### Is Graph Bipartite — LeetCode 785

Can the graph be split into two groups such that every edge connects nodes from different groups?

**Example:** `graph=[[1,3],[0,2],[1,3],[0,2]]` -> `true`

```text
OPTIMAL — BFS 2-COLOURING | O(V+E) | O(V)

Alternate colours via BFS; same-colour adjacent nodes = not bipartite.
```

```csharp
public bool IsBipartite(int[][] graph)
{
    int n = graph.Length; int[] col = new int[n]; Array.Fill(col, -1);
    for (int i = 0; i < n; i++)
    {
        if (col[i] != -1) continue;
        var q = new Queue<int>(); q.Enqueue(i); col[i] = 0;
        while (q.Count > 0)
        {
            int u = q.Dequeue();
            foreach (int v in graph[u])
            {
                if (col[v] == -1) { col[v] = 1 - col[u]; q.Enqueue(v); }
                else if (col[v] == col[u]) return false;
            }
        }
    }
    return true;
}
```

> **Key insight:** A graph is bipartite iff it has no odd-length cycle — BFS 2-colouring detects this implicitly.

---

## Advanced (SCC, Bridges, Euler)

### Critical Connections in a Network — LeetCode 1192

Find all bridges in an undirected connected graph.

**Example:** `n=4, connections=[[0,1],[1,2],[2,0],[1,3]]` -> `[[1,3]]`

```text
BRUTE FORCE | O(E*(V+E)) | O(V+E)

Remove each edge; check connectivity.

------------------------------------------------------------------------------

OPTIMAL — TARJAN'S BRIDGE ALGORITHM | O(V+E) | O(V+E)

disc[u] = discovery time. low[u] = earliest disc reachable from subtree via one back edge.
Edge (u,v) is a bridge iff low[v] > disc[u].
```

```csharp
public IList<IList<int>> CriticalConnections(int n, IList<IList<int>> connections)
{
    var g = new List<int>[n]; for (int i = 0; i < n; i++) g[i] = new();
    foreach (var e in connections) { g[e[0]].Add(e[1]); g[e[1]].Add(e[0]); }
    int[] disc = new int[n], low = new int[n]; Array.Fill(disc, -1); int timer = 0;
    var res = new List<IList<int>>();
    void Dfs(int u, int par)
    {
        disc[u] = low[u] = timer++;
        foreach (int v in g[u])
        {
            if (v == par) continue;
            if (disc[v] == -1) { Dfs(v, u); low[u] = Math.Min(low[u], low[v]);
                if (low[v] > disc[u]) res.Add(new[] { u, v }); }
            else low[u] = Math.Min(low[u], disc[v]);
        }
    }
    for (int i = 0; i < n; i++) if (disc[i] == -1) Dfs(i, -1);
    return res;
}
```

> **Key insight:** `low[v] > disc[u]` means v cannot reach u without this edge — its removal disconnects the graph.

---

### Reconstruct Itinerary — LeetCode 332

Flight itinerary from "JFK" using all tickets exactly once; lexicographically smallest if multiple valid.

**Example:** `tickets=[["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]` -> `["JFK","MUC","LHR","SFO","SJC"]`

```text
BACKTRACKING | O(E!) | O(E)

Try unused tickets in lex order; undo on dead-end.

------------------------------------------------------------------------------

OPTIMAL — HIERHOLZER'S EULERIAN PATH | O(E log E) | O(E)

Post-order DFS over sorted adjacency lists.
Dead-end nodes prepended to result; reverse = itinerary.
```

```csharp
public IList<string> FindItinerary(IList<IList<string>> tickets)
{
    var g = new Dictionary<string, SortedList<int, string>>(); int idx = 0;
    foreach (var t in tickets) { if (!g.ContainsKey(t[0])) g[t[0]] = new(); g[t[0]].Add(idx++, t[1]); }
    var route = new LinkedList<string>();
    void Dfs(string u)
    {
        while (g.TryGetValue(u, out var nb) && nb.Count > 0)
        { var f = nb.First!; nb.RemoveAt(0); Dfs(f.Value); }
        route.AddFirst(u);
    }
    Dfs("JFK");
    return route.ToList();
}
```

> **Key insight:** Post-order prepending (Hierholzer) handles dead-ends — a stuck node is the last in its sub-path, so prepending places it correctly.

---

*Word Search II (LeetCode 212) — Trie-based multi-word search; see [Tries and String Matching](../TriesAndStringMatching/Problems.md).*
