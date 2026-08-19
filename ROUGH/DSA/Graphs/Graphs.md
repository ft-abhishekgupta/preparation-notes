# Graphs

> **Scope** — Graph representations, BFS/DFS traversal, cycle detection, topological sort, shortest-path algorithms (BFS, 0-1 BFS, Dijkstra, Bellman-Ford, Floyd-Warshall, A*), MST (Kruskal, Prim), Union-Find/DSU, grid-as-graph and implicit/state-space patterns, and advanced topics (SCC, bridges/articulation points, bipartiteness, Euler paths).

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

A graph `G = (V, E)` has vertices and edges. Edges can be directed/undirected, weighted/unweighted; a graph can be connected/disconnected and cyclic/acyclic. Degree = incident edge count; directed graphs split it into in-degree and out-degree.

> **Quick Note** - A tree is a connected, undirected, acyclic graph with exactly `V - 1` edges. Tree traversal/DP is graph traversal/DP with stronger guarantees; see [Trees](../Trees/Trees.md).

### Representations

| Representation | Space | Edge lookup | Iterate neighbours | Use when |
|---|---|---|---|---|
| Adjacency list | O(V + E) | O(deg(u)) | O(deg(u)) | Default; sparse graphs, traversals, Dijkstra/Prim |
| Adjacency matrix | O(V^2) | O(1) | O(V) | Small/dense graphs, all-pairs DP, frequent edge tests |
| Edge list | O(E) | O(E) | O(E) | Kruskal, Bellman-Ford, streamed one-pass edge processing |

```csharp
int n = 5, u = 0, v = 1;

List<int>[] adj = new List<int>[n];
for (int i = 0; i < n; i++) adj[i] = new List<int>();
adj[u].Add(v);
adj[v].Add(u);                       // undirected: add both directions

List<(int to, int weight)>[] wadj = new List<(int to, int weight)>[n];
for (int i = 0; i < n; i++) wadj[i] = new List<(int to, int weight)>();

Dictionary<int, List<int>> sparseIds = new();   // ids are not 0..n-1
bool[,] matrix = new bool[n, n];                 // dense / O(1) edge tests
var edges = new List<(int u, int v, int w)>();   // Kruskal / Bellman-Ford
```

> **Scale Note** - An adjacency matrix at `100_000` vertices needs `10^10` cells before storing a single edge. Prefer adjacency lists, CSR/compressed arrays, or streamed edge lists unless `V` is small or the graph is truly dense.

> **Matrix Note** - `(A^k)[i][j]` counts walks of length exactly `k`; triangles in an undirected simple graph = `trace(A^3) / 6`. Matrix powers are useful only for small/dense graphs.

### Traversal uses at a glance

- **BFS**: unweighted shortest path, levels, multi-source spread, broadcast simulations.
- **DFS**: reachability, components, cycle detection, topological sort, SCC/low-link, backtracking.

---

## 2. Complexity Reference

| Algorithm | Time | Space | Notes |
|---|---|---|---|
| BFS / DFS traversal | O(V + E) | O(V) | Every vertex and edge visited once |
| Bidirectional BFS | O(b^(d/2)) typical | O(b^(d/2)) | Unweighted shortest path when both start and target are known and reverse moves are available |
| Cycle detection (undirected) | O(V + E) | O(V) | Parent-tracking DFS or Union-Find |
| Cycle detection (directed) | O(V + E) | O(V) | Three-colour / recursion-stack DFS |
| Topological sort (Kahn's or DFS) | O(V + E) | O(V) | Kahn detects cycles by processed count; DFS needs three-colour state |
| Union-Find (path compression + union by rank/size) | ~O(α(V)) per op | O(V) | α = inverse Ackermann, effectively constant |
| BFS shortest path (unweighted) | O(V + E) | O(V) | One hop = one edge weight |
| 0-1 BFS (deque) | O(V + E) | O(V + E) | Weights restricted to {0, 1}; lazy duplicates may sit in the deque |
| DAG shortest path | O(V + E) | O(V) | Topological order + one relaxation pass; handles negative edges because there are no cycles |
| Dijkstra (binary heap) | O((V + E) log V) | O(V + E) | Requires non-negative weights |
| Bellman-Ford | O(V · E) | O(V) | Handles negative edges, detects negative cycles reachable from source |
| Floyd-Warshall | O(V³) | O(V²) | All-pairs shortest paths, DP over intermediate vertex |
| A* (admissible heuristic) | O((V + E) log V) worst case with a consistent heuristic | O(V + E) | Practically much faster with a good lower bound; lazy PQ can hold duplicates |
| Kruskal's MST | O(E log E) | O(V) | Sort-dominated; DSU near O(1) per op |
| Prim's MST (heap + adj list) | O(E log V) | O(V + E) | Heap can hold many candidate edges; O(V²) matrix/array form is better for dense graphs |
| Tarjan's SCC / bridges / articulation points | O(V + E) | O(V) | Single DFS pass, low-link values |
| Kosaraju's SCC | O(V + E) | O(V) | Two DFS passes + transpose graph |
| Bipartite check (2-colouring) | O(V + E) | O(V) | BFS or DFS |

> **Representation Note** — Unless stated otherwise, graph complexities here assume adjacency lists/edge lists. With an adjacency matrix, scanning all neighbours across all vertices is O(V²) even if the actual `E` is much smaller.

**Why Union-Find is near-constant**: path compression flattens the tree on every `Find`, and union by rank/size keeps trees shallow — combined, the amortized cost per operation is the inverse Ackermann function `α(V)`, which is ≤ 4 for any `V` that fits in the observable universe.

---

## 3. C# Toolbox

| API | Use for | Gotcha |
|---|---|---|
| `List<int>[]` | Adjacency list, dense contiguous vertex ids `0..n-1` | Must pre-initialize every slot with `new List<int>()` |
| `List<(int to, int weight)>[]` | Weighted adjacency list | Tuple field names (`to`, `weight`) aid readability at call sites |
| `Dictionary<int, List<int>>` | Adjacency list for sparse/non-contiguous ids | Slightly slower than array indexing; use when `n` is unknown upfront |
| `bool[,]` / `int[,]` | Adjacency matrix | O(V²) memory even for sparse graphs — avoid for large V |
| `Queue<T>` | BFS frontier | Mark visited **on enqueue**, not on dequeue (see §8) |
| `Stack<T>` | Iterative DFS | For simple traversal, mark when pushing or skip duplicates when popping; for cycle/topo use explicit state, not one visited bit |
| `LinkedList<T>` | 0-1 BFS deque (`AddFirst`/`AddLast`/`RemoveFirst` all O(1)) | C# has no dedicated `Deque<T>`; `LinkedList<T>` is the idiomatic stand-in |
| `PriorityQueue<TElement, TPriority>` | Dijkstra, Prim, any "closest/cheapest next" greedy expansion | No `DecreaseKey` — use the lazy-deletion pattern: push a fresh duplicate, skip stale pops |
| `HashSet<int>` | Visited set when vertex ids are not small contiguous ints | O(1) average lookup, but slower constant factor than a `bool[]` |
| `HashSet<string>` / `Dictionary<string, int>` | Visited/distances for implicit state graphs | Serialize mutable states (boards, locks, words) into immutable keys before storing |
| `int[26]` / `int[128]` | Alien-dictionary-style character graphs | Fixed-size array beats a dictionary keyed by `char` when alphabet is bounded |
| Tuple delta arrays `int[] dr, dc` | Grid-as-graph neighbour generation | Combine with a single bounds + visited check to avoid 4 near-duplicate `if` blocks |

---

## 4. Core Patterns / Techniques

### 4.1 BFS Traversal

Use when edges have equal cost and you need levels/minimum hops. Mark visited **before enqueue**; each queue layer is one more edge from the source.

```csharp
int[] BfsDistances(List<int>[] adj, int source, int n)
{
    var dist = new int[n];
    Array.Fill(dist, -1);
    dist[source] = 0;

    var queue = new Queue<int>();
    queue.Enqueue(source);

    while (queue.Count > 0)
    {
        int u = queue.Dequeue();
        foreach (int v in adj[u])
        {
            if (dist[v] != -1) continue;
            dist[v] = dist[u] + 1;               // visited mark at enqueue time
            queue.Enqueue(v);
        }
    }
    return dist;
}
```

**Complexity** - O(V + E) time, O(V) space. For weighted edges use 0-1 BFS, Dijkstra, Bellman-Ford, or DAG relaxation instead.

### 4.2 DFS Traversal + Connected Components

```csharp
void Dfs(int u, List<int>[] adj, bool[] visited, List<int> order)
{
    visited[u] = true;
    order.Add(u);
    foreach (int v in adj[u])
        if (!visited[v]) Dfs(v, adj, visited, order);
}
```

```csharp
List<int> DfsIterative(int start, List<int>[] adj)
{
    var visited = new bool[adj.Length];
    var order = new List<int>();
    var stack = new Stack<int>();

    visited[start] = true;
    stack.Push(start);

    while (stack.Count > 0)
    {
        int u = stack.Pop();
        order.Add(u);
        for (int i = adj[u].Count - 1; i >= 0; i--)
        {
            int v = adj[u][i];
            if (visited[v]) continue;
            visited[v] = true;
            stack.Push(v);
        }
    }
    return order;
}
```

**BFS vs DFS**: BFS guarantees unweighted shortest paths; DFS does not. DFS recursion can stack-overflow on deep graphs, so use an explicit stack when depth can approach `10^5`.

**Connected components** - loop over every vertex; each traversal from an unvisited vertex discovers one component.

```csharp
int CountComponents(List<int>[] adj)
{
    var visited = new bool[adj.Length];
    int components = 0;

    for (int start = 0; start < adj.Length; start++)
    {
        if (visited[start]) continue;
        components++;

        visited[start] = true;
        var queue = new Queue<int>();
        queue.Enqueue(start);

        while (queue.Count > 0)
        {
            int u = queue.Dequeue();
            foreach (int v in adj[u])
            {
                if (visited[v]) continue;
                visited[v] = true;
                queue.Enqueue(v);
            }
        }
    }
    return components;
}
```

### 4.3 Cycle Detection - Undirected vs Directed

Undirected cycle detection skips only the edge back to the parent; directed cycle detection needs three states because cross edges to completed nodes are not cycles.

```csharp
bool HasCycleUndirected(List<int>[] adj, int n)
{
    var visited = new bool[n];

    bool Dfs(int u, int parent)
    {
        visited[u] = true;
        foreach (int v in adj[u])
        {
            if (!visited[v])
            {
                if (Dfs(v, u)) return true;
            }
            else if (v != parent)
            {
                return true;                    // visited non-parent => cycle
            }
        }
        return false;
    }

    for (int i = 0; i < n; i++)
        if (!visited[i] && Dfs(i, -1)) return true;
    return false;
}
```

```csharp
bool HasCycleDirected(List<int>[] adj, int n)
{
    var state = new int[n];                     // 0 = unvisited, 1 = in progress, 2 = done

    bool Dfs(int u)
    {
        state[u] = 1;
        foreach (int v in adj[u])
        {
            if (state[v] == 1) return true;      // back edge into active recursion stack
            if (state[v] == 0 && Dfs(v)) return true;
        }
        state[u] = 2;
        return false;
    }

    for (int i = 0; i < n; i++)
        if (state[i] == 0 && Dfs(i)) return true;
    return false;
}
```

**Complexity** - O(V + E) time, O(V) space. In multigraph bridge/cycle logic, track parent edge id; vertex-parent skipping hides parallel edges. A self-loop is a cycle unless excluded.

### 4.4 Topological Sort

Only for DAGs. Kahn's queue contains all vertices whose current in-degree is 0; DFS emits vertices after all successors are done.

```csharp
List<int> TopoSortKahn(List<int>[] adj, int n)
{
    var indegree = new int[n];
    foreach (var list in adj)
        foreach (int v in list) indegree[v]++;

    var queue = new Queue<int>();
    for (int i = 0; i < n; i++)
        if (indegree[i] == 0) queue.Enqueue(i);

    var order = new List<int>();
    while (queue.Count > 0)
    {
        int u = queue.Dequeue();
        order.Add(u);
        foreach (int v in adj[u])
            if (--indegree[v] == 0) queue.Enqueue(v);
    }
    return order.Count == n ? order : new List<int>();
}
```

```csharp
List<int> TopoSortDfs(List<int>[] adj, int n)
{
    var state = new int[n];                     // 0 = unvisited, 1 = in progress, 2 = done
    var order = new List<int>();

    bool Dfs(int u)
    {
        state[u] = 1;
        foreach (int v in adj[u])
        {
            if (state[v] == 1) return false;
            if (state[v] == 0 && !Dfs(v)) return false;
        }
        state[u] = 2;
        order.Add(u);                           // post-order
        return true;
    }

    for (int i = 0; i < n; i++)
        if (state[i] == 0 && !Dfs(i)) return new List<int>();

    order.Reverse();
    return order;
}
```

**Complexity** - O(V + E) time, O(V) space. Kahn detects a cycle by `order.Count < n`; DFS detects a back edge to `in progress`. Topological order is unique iff Kahn's queue has exactly one candidate at every step.

### 4.5 Union-Find / Disjoint Set Union (DSU)

Use for dynamic connectivity, undirected cycle detection, Kruskal, and equivalence-class grouping. The interview answer should name both optimizations: path compression and union by rank/size.

```csharp
public class DisjointSet
{
    private readonly int[] parent;
    private readonly int[] rank;
    public int Components { get; private set; }

    public DisjointSet(int n)
    {
        parent = new int[n];
        rank = new int[n];
        Components = n;
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    public int Find(int x)
    {
        while (parent[x] != x)
        {
            parent[x] = parent[parent[x]];      // path compression by halving
            x = parent[x];
        }
        return x;
    }

    public bool Union(int a, int b)
    {
        int ra = Find(a), rb = Find(b);
        if (ra == rb) return false;

        if (rank[ra] < rank[rb]) (ra, rb) = (rb, ra);
        parent[rb] = ra;
        if (rank[ra] == rank[rb]) rank[ra]++;
        Components--;
        return true;
    }
}
```

**Complexity** - O(alpha(V)) amortized per operation, effectively constant; O(V) space. Union by size is interchangeable with rank.

### 4.6 Grid-as-Graph + Multi-source BFS

A cell is a vertex; 4/8-direction moves are implicit edges. Mutating the grid can be the visited mark when the input may be changed.

```csharp
int[] dr4 = { -1, 1, 0, 0 };
int[] dc4 = { 0, 0, -1, 1 };
int[] dr8 = { -1, -1, -1, 0, 0, 1, 1, 1 };
int[] dc8 = { -1, 0, 1, -1, 1, -1, 0, 1 };
```

```csharp
void FloodFill(char[][] grid, int r, int c)
{
    if (grid.Length == 0) return;
    int rows = grid.Length, cols = grid[0].Length;
    int[] dr = { -1, 1, 0, 0 };
    int[] dc = { 0, 0, -1, 1 };

    void Dfs(int cr, int cc)
    {
        if (cr < 0 || cr >= rows || cc < 0 || cc >= cols || grid[cr][cc] != '1') return;
        grid[cr][cc] = '#';
        for (int d = 0; d < 4; d++) Dfs(cr + dr[d], cc + dc[d]);
    }

    Dfs(r, c);
}
```

```csharp
int MultiSourceBfs(int[][] grid)
{
    if (grid.Length == 0 || grid[0].Length == 0) return 0;
    int rows = grid.Length, cols = grid[0].Length, fresh = 0, minutes = 0;
    int[] dr = { -1, 1, 0, 0 };
    int[] dc = { 0, 0, -1, 1 };
    var queue = new Queue<(int r, int c)>();

    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
        {
            if (grid[r][c] == 2) queue.Enqueue((r, c));
            else if (grid[r][c] == 1) fresh++;
        }

    while (queue.Count > 0 && fresh > 0)
    {
        int size = queue.Count;
        for (int i = 0; i < size; i++)
        {
            var (r, c) = queue.Dequeue();
            for (int d = 0; d < 4; d++)
            {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] != 1) continue;
                grid[nr][nc] = 2;
                fresh--;
                queue.Enqueue((nr, nc));
            }
        }
        minutes++;
    }
    return fresh == 0 ? minutes : -1;
}
```

**Complexity** - O(rows * cols) time and space. Multi-source BFS seeds every source before the first pop; running one BFS per source is usually too slow and can give wrong elapsed-time modeling.

### 4.7 Shortest Paths

| Algorithm | Handles | Time | Use when |
|---|---|---|---|
| BFS | Unweighted | O(V + E) | Every edge costs 1 |
| 0-1 BFS | Weights 0 or 1 | O(V + E) | Binary-cost edges |
| DAG relaxation | Acyclic directed graph; negative weights OK | O(V + E) | Topological order is available |
| Dijkstra | Non-negative weights | O((V + E) log V) | Weighted graph, no negative edges |
| Bellman-Ford | Negative edges | O(V * E) | Need negative edges or negative-cycle detection |
| Floyd-Warshall | All pairs | O(V^3) | Small `V`, every pair distance |
| A* | Non-negative weights plus admissible heuristic | Worst-case Dijkstra | One target and a good lower bound |

```csharp
int[] ZeroOneBfs(List<(int to, int weight)>[] adj, int source, int n)
{
    var dist = new int[n];
    Array.Fill(dist, int.MaxValue);
    dist[source] = 0;

    var deque = new LinkedList<(int node, int distance)>();
    deque.AddFirst((source, 0));

    while (deque.Count > 0)
    {
        var (u, d) = deque.First!.Value;
        deque.RemoveFirst();
        if (d != dist[u]) continue;

        foreach (var (v, w) in adj[u])
        {
            if (w != 0 && w != 1) throw new ArgumentException("0-1 BFS requires edge weights 0 or 1.");
            int nd = d + w;
            if (nd >= dist[v]) continue;
            dist[v] = nd;
            if (w == 0) deque.AddFirst((v, nd));
            else deque.AddLast((v, nd));
        }
    }
    return dist;
}
```

```csharp
int[] Dijkstra(List<(int to, int weight)>[] adj, int source, int n)
{
    var dist = new int[n];
    Array.Fill(dist, int.MaxValue);
    dist[source] = 0;

    var pq = new PriorityQueue<int, int>();
    pq.Enqueue(source, 0);

    while (pq.TryDequeue(out int u, out int d))
    {
        if (d > dist[u]) continue;              // stale entry: a shorter path already won
        foreach (var (v, w) in adj[u])
        {
            if (w < 0) throw new ArgumentException("Dijkstra requires non-negative weights.");
            int nd = d + w;
            if (nd < dist[v])
            {
                dist[v] = nd;
                pq.Enqueue(v, nd);              // no DecreaseKey; insert duplicate
            }
        }
    }
    return dist;
}
```

Dijkstra's greedy finalization requires non-negative weights. If weights can be negative, use Bellman-Ford; if totals can overflow `int`, use `long` distances/priorities.

```csharp
(int[] dist, bool hasNegativeCycle) BellmanFord(int n, int source, List<(int u, int v, int w)> edges)
{
    var dist = new int[n];
    Array.Fill(dist, int.MaxValue);
    dist[source] = 0;

    for (int i = 0; i < n - 1; i++)
    {
        bool changed = false;
        foreach (var (u, v, w) in edges)
        {
            if (dist[u] == int.MaxValue || dist[u] + w >= dist[v]) continue;
            dist[v] = dist[u] + w;
            changed = true;
        }
        if (!changed) break;
    }

    bool hasNegativeCycle = false;
    foreach (var (u, v, w) in edges)
        if (dist[u] != int.MaxValue && dist[u] + w < dist[v]) hasNegativeCycle = true;

    return (dist, hasNegativeCycle);
}
```

`V - 1` rounds suffice because a simple shortest path has at most `V - 1` edges; an improving `V`th round proves a reachable negative cycle. For "at most K stops", run only `K + 1` rounds from a snapshot each round.

```csharp
int[,] FloydWarshall(int[,] adjMatrix, int n)
{
    var dist = (int[,])adjMatrix.Clone();

    for (int k = 0; k < n; k++)                 // k must be outermost
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (dist[i, k] != int.MaxValue && dist[k, j] != int.MaxValue &&
                    dist[i, k] + dist[k, j] < dist[i, j])
                    dist[i, j] = dist[i, k] + dist[k, j];

    return dist;
}
```

Floyd-Warshall initializes diagonal to 0 and missing edges to INF; after the run, `dist[i, i] < 0` indicates a negative cycle. The boolean version computes transitive closure.

```csharp
int[] DagShortestPath(List<(int to, int weight)>[] adj, List<int> topoOrder, int source, int n)
{
    var dist = new int[n];
    Array.Fill(dist, int.MaxValue);
    dist[source] = 0;

    foreach (int u in topoOrder)
    {
        if (dist[u] == int.MaxValue) continue;
        foreach (var (v, w) in adj[u])
            if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
    return dist;
}
```

**A\*** - Dijkstra prioritized by `g(node) + h(node)`. With admissible `h` (never overestimates) it stays optimal; with `h = 0` it is Dijkstra. Used in routing/game/grid pathfinding to one target.

### 4.8 Minimum Spanning Tree

Kruskal sorts all undirected weighted edges and adds the cheapest safe edge; Prim grows one tree from the cheapest outgoing edge.

```csharp
long KruskalMst(int n, List<(int u, int v, int w)> edges)
{
    edges.Sort((a, b) => a.w.CompareTo(b.w));
    var dsu = new DisjointSet(n);
    long total = 0;
    int used = 0;

    foreach (var (u, v, w) in edges)
    {
        if (!dsu.Union(u, v)) continue;
        total += w;
        if (++used == n - 1) break;
    }
    return used == n - 1 ? total : -1;
}
```

```csharp
long PrimMst(List<(int to, int weight)>[] adj, int n)
{
    var visited = new bool[n];
    var pq = new PriorityQueue<int, int>();
    pq.Enqueue(0, 0);
    long total = 0;
    int used = 0;

    while (pq.TryDequeue(out int u, out int w) && used < n)
    {
        if (visited[u]) continue;
        visited[u] = true;
        total += w;
        used++;
        foreach (var (v, weight) in adj[u])
            if (!visited[v]) pq.Enqueue(v, weight);
    }
    return used == n ? total : -1;
}
```

**Complexity** - Kruskal O(E log E) plus DSU, O(V) extra. Heap-Prim O(E log V), O(V + E). Array/matrix Prim O(V^2), O(V), often best for dense/complete implicit graphs. MST has exactly `n - 1` edges when connected.

### 4.9 Implicit / State-Space Graphs

When no adjacency list is given, define a canonical state key and generate legal moves lazily.

| Problem shape | State key | Neighbour generation | Usual algorithm |
|---|---|---|---|
| Word Ladder | Word string | One-character mutations in dictionary | BFS / bidirectional BFS |
| Open the Lock | 4-digit string | Rotate one wheel, skip deadends | BFS / bidirectional BFS |
| Sliding Puzzle | Serialized board | Swap `0` with adjacent positions | BFS |
| Grid with eliminations/keys | `(r, c, budget/mask)` | Move and update resource bitmask | BFS over expanded state |
| Visit all nodes | `(node, mask)` | Traverse edge, set bit | BFS over bitmask state |

```csharp
int ShortestStateBfs(string start, string target, Func<string, IEnumerable<string>> nextStates)
{
    if (start == target) return 0;

    var dist = new Dictionary<string, int> { [start] = 0 };
    var queue = new Queue<string>();
    queue.Enqueue(start);

    while (queue.Count > 0)
    {
        string state = queue.Dequeue();
        foreach (string next in nextStates(state))
        {
            if (dist.ContainsKey(next)) continue;
            dist[next] = dist[state] + 1;
            if (next == target) return dist[next];
            queue.Enqueue(next);
        }
    }
    return -1;
}
```

For Word Ladder, generate `25 * L` mutations instead of comparing every word. Bidirectional BFS expands the smaller frontier from both endpoints and reduces depth from roughly `b^d` to `b^(d/2)` when moves are reversible. Always store immutable keys (`"123450"`, `"0202"`, `(node, mask)`), not mutable arrays.

### 4.10 Advanced: SCC, bridges/articulation points, bipartiteness, Euler paths, DAG shortest paths

**Strongly connected components (SCC)** - maximal directed components where every vertex reaches every other. Kosaraju is easiest to explain: finish order on original graph, reverse edges, DFS reversed graph in decreasing finish order.

```csharp
List<List<int>> KosarajuScc(List<int>[] adj, int n)
{
    var seen = new bool[n];
    var order = new List<int>();

    void Dfs1(int u)
    {
        seen[u] = true;
        foreach (int v in adj[u]) if (!seen[v]) Dfs1(v);
        order.Add(u);
    }

    var rev = new List<int>[n];
    for (int i = 0; i < n; i++) rev[i] = new List<int>();
    for (int u = 0; u < n; u++)
        foreach (int v in adj[u]) rev[v].Add(u);

    for (int i = 0; i < n; i++) if (!seen[i]) Dfs1(i);
    Array.Fill(seen, false);

    var comps = new List<List<int>>();
    void Dfs2(int u, List<int> comp)
    {
        seen[u] = true;
        comp.Add(u);
        foreach (int v in rev[u]) if (!seen[v]) Dfs2(v, comp);
    }

    for (int i = order.Count - 1; i >= 0; i--)
    {
        int u = order[i];
        if (seen[u]) continue;
        var comp = new List<int>();
        Dfs2(u, comp);
        comps.Add(comp);
    }
    return comps;
}
```

Tarjan SCC does the same in one DFS with `disc/low` and a stack; prefer it when memory/passes matter, but Kosaraju is usually easier to derive at a whiteboard.

**Bridges & articulation points** - Tarjan low-link: edge `(u, v)` is a bridge if `low[v] > disc[u]`; vertex `u` is articulation if root with at least 2 DFS children, or non-root with a child `v` where `low[v] >= disc[u]`. Track parent edge ids in multigraphs.

**Bipartite check (2-colouring)** - alternate colours across every edge; a same-colour edge proves an odd cycle.

```csharp
bool IsBipartite(List<int>[] adj, int n)
{
    var color = new int[n];                     // 0 = uncoloured, 1/2 = colours
    for (int i = 0; i < n; i++)
    {
        if (color[i] != 0) continue;
        color[i] = 1;
        var queue = new Queue<int>();
        queue.Enqueue(i);

        while (queue.Count > 0)
        {
            int u = queue.Dequeue();
            foreach (int v in adj[u])
            {
                if (color[v] == 0)
                {
                    color[v] = 3 - color[u];
                    queue.Enqueue(v);
                }
                else if (color[v] == color[u]) return false;
            }
        }
    }
    return true;
}
```

**Euler path/circuit** - use Hierholzer when every edge must be used exactly once. Undirected path: exactly 0 or 2 odd-degree vertices; circuit: all even. Directed path: one `out - in = 1`, one `in - out = 1`, others balanced; circuit: all balanced. Non-isolated vertices must be connected in the relevant sense. O(V + E).

---

## 5. Classic Problems & Solutions

Most interview graph problems are direct applications of the templates in §4; keep only the modeling twist unless the code adds a new one.

### Worked examples that add a twist

**Clone Graph (LC 133)** - the traversal is ordinary; the key is the old-to-new map that both deduplicates clones and breaks cycles.

```csharp
public Node CloneGraph(Node node)
{
    if (node == null) return null;
    var map = new Dictionary<Node, Node>();

    Node Dfs(Node cur)
    {
        if (map.TryGetValue(cur, out var existing)) return existing;
        var copy = new Node(cur.val);
        map[cur] = copy;
        foreach (var next in cur.neighbors)
            copy.neighbors.Add(Dfs(next));
        return copy;
    }

    return Dfs(node);
}
```

**Grid DFS family (Number of Islands / Max Area / Flood Fill / Surrounded Regions)** - one flood-fill template; change the scan/start condition and what the DFS returns/mutates.

```csharp
int NumIslands(char[][] grid)
{
    int rows = grid.Length, cols = rows == 0 ? 0 : grid[0].Length, count = 0;
    int[] dr = { -1, 1, 0, 0 };
    int[] dc = { 0, 0, -1, 1 };

    void Dfs(int r, int c)
    {
        if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] != '1') return;
        grid[r][c] = '#';
        for (int d = 0; d < 4; d++) Dfs(r + dr[d], c + dc[d]);
    }

    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (grid[r][c] == '1')
            {
                count++;
                Dfs(r, c);
            }
    return count;
}
```

Deltas: **Max Area** returns a component size and takes max; **Flood Fill** starts from one cell and mutates matching colour; **Surrounded Regions** flood-fills border-connected `O`s as safe, then flips the rest.

### Other classics

| Problem | Use §4 algorithm | Twist | Complexity |
|---|---|---|---|
| Course Schedule I/II (LC 207/210) | Kahn or DFS topo | Build edge `prereq -> course`; processed count detects cycle; order is the answer for II | O(V + E) |
| Rotting Oranges / 01 Matrix / Walls and Gates | Multi-source BFS | Seed all sources before first pop; BFS level is minute/distance | O(rows * cols) |
| Network Delay Time (LC 743) | Dijkstra | Directed non-negative edges; answer is max shortest distance or `-1` if unreachable | O((V + E) log V) |
| Redundant Connection / Provinces | DSU | First failed union closes a cycle; `Components` gives groups | O(E * alpha(V)) |
| Min Cost to Connect All Points (LC 1584) | Prim/Kruskal MST | Complete implicit Manhattan graph is dense, so O(V^2) array-Prim avoids sorting O(V^2) edges | O(V^2) |
| Cheapest Flights Within K Stops (LC 787) | Bounded Bellman-Ford | Run `K + 1` snapshot rounds so one round cannot use multiple new edges | O(K * E) |
| Alien Dictionary (LC 269) | Topological sort | First differing char between adjacent words creates the only useful ordering edge; prefix invalid case matters | O(total chars) |
| Word Ladder / Open Lock / Sliding Puzzle | State-space BFS | Serialize state, generate neighbours lazily; bidirectional BFS if endpoints known and moves reversible | State count * branching |
| Is Graph Bipartite? (LC 785) | 2-colour BFS/DFS | Disconnected graph means restart colouring from every uncoloured vertex | O(V + E) |
| Critical Connections (LC 1192) | Tarjan low-link | Bridge iff child subtree cannot reach an ancestor: `low[v] > disc[u]` | O(V + E) |

---

## 6. Pattern Recognition

| Signal in the problem | Likely technique |
|---|---|
| Roads/cables/accounts/emails connect entities | Build graph; BFS/DFS for paths/components, DSU for grouping/connectivity |
| Prerequisites, build order, "must happen before" | Directed graph + topological sort / cycle detection |
| Grid, image, maze, regions, rooms, rotten spread | Grid is an implicit graph; flood fill or multi-source BFS |
| Minimum moves/steps in unweighted states | BFS; serialize state and mark visited on enqueue |
| Start and target known, moves reversible, high branching | Bidirectional BFS |
| Edge costs are only 0 or 1 | 0-1 BFS with deque |
| Cheapest/shortest weighted path | Dijkstra if non-negative; Bellman-Ford if negative or hop-limited |
| Weighted DAG | Topological order then relax each edge once |
| Every-pair distance, small `V` | Floyd-Warshall |
| Connect all nodes with minimum total cost | MST: Kruskal for edge list/sparse, Prim for adjacency/dense |
| Transitive equivalence relation | Union-Find |
| Split into two enemy/rival groups | Bipartite 2-colouring |
| Clone/copy cyclic references | BFS/DFS + old-to-new map |
| Graph too large to materialize | Compress IDs, stream edges, lazy-neighbour generation, CSR/chunked adjacency |

---

## 7. Interview Focus

- **Model first**: name vertices, edges, state key, neighbour generator, and visited semantics before picking an algorithm.
- **Algorithm choice sound bite**: unweighted -> BFS; 0/1 weights -> deque BFS; non-negative weights -> Dijkstra/A*; negative weights -> Bellman-Ford; DAG -> topo relax; all-pairs small `V` -> Floyd-Warshall; connectivity-only online -> DSU.
- **DFS vs BFS**: DFS is for structure (components/cycles/topo/backtracking); BFS is for minimum hops. DFS still needs O(V) visited and may overflow the call stack.
- **Shortest-path trap**: ask whether weights can be negative before using Dijkstra; in C# use lazy PQ duplicates and stale skips.
- **Disconnected graph follow-up**: restart traversal/colouring/topo setup across all vertices unless the input promises connectedness.
- **Scale-up playbook**: avoid matrices for sparse large graphs; compress sparse IDs; stream edge lists for DSU/Kruskal/Bellman-Ford; generate implicit neighbours lazily; use bidirectional BFS to shrink frontiers; use CSR/partitioned frontier expansion at very large scale.
- **Real-world mapping**: build/dependency systems use topo; routing uses Dijkstra/A*; social/network reachability uses BFS/components; reliability uses bridges/articulation; clustering/equivalence uses DSU.

---

## 8. Common Traps & Edge Cases

| Trap | Consequence | Fix |
|---|---|---|
| Forgetting a `visited` set/array | Infinite loop on any cycle, or exponential blow-up on DAGs with shared descendants | Always track visited state; size it to the actual vertex-id range |
| Marking visited at **dequeue** instead of **enqueue** in BFS | Same vertex enqueued multiple times, wrong distances, TLE | Mark visited immediately before/at enqueue time |
| Using DFS for shortest path in an unweighted graph | Returns an arbitrary path, not necessarily the minimum number of edges | Use BFS level order |
| Using Dijkstra with negative edge weights | Silently wrong shortest distances (no exception thrown) | Detect negative weights, switch to Bellman-Ford |
| Disconnected graph, only running traversal from one start vertex | Some components never visited, undercounts or misses answers | Loop the traversal over every unvisited vertex `0..n-1` |
| Deep recursive DFS on a 10⁵-node graph | Stack overflow despite O(V + E) algorithmic complexity | Use iterative DFS/BFS when depth can be large |
| Grid bounds checked after array access | Runtime exception on border cells | Check `0 <= r < rows` and `0 <= c < cols` before reading `grid[r][c]` |
| Summing path weights in `int` without guarding infinity | Overflow wraps negative and corrupts shortest paths | Use `long` for large weights and always skip `dist[u] == INF` before addition |
| Self-loops and parallel edges | A self-loop is a cycle if the problem allows it; parallel edges may be distinct edges or may need a minimum-weight merge | Clarify semantics up front; skip self-loops only when the problem says they are irrelevant |
| Treating a 0-indexed vs 1-indexed vertex list inconsistently | Off-by-one array bounds, silent wrong answers | Normalize indices once at input parsing |
| Applying undirected cycle logic to a directed graph (or vice versa) | False positives/negatives on valid DAGs or valid undirected graphs | Use parent-tracking DFS/Union-Find for undirected; three-colour DFS for directed (§4.3) |
| Assuming parent-skip DFS handles parallel edges | Misses 2-edge cycles or falsely reports a parallel edge as a bridge | Track parent edge id, or clarify that the graph is simple |
| Directed cycle detection with only a `visited` set | Cross edges to fully processed nodes look like false cycles, or real back edges are missed | Track three states: unvisited, in-progress, done |
| Returning Kahn's partial order without checking length | Cyclic prerequisite graph looks schedulable | Verify processed count/order length is exactly V |
| Applying 0-1 BFS to weights outside `{0, 1}` | Deque ordering invariant breaks; distances can be wrong | Use Dijkstra for non-negative weights or Bellman-Ford if negatives exist |
| Putting Floyd-Warshall's `k` loop inside `i`/`j` | Uses intermediate states from the wrong DP stage, corrupting all-pairs distances | Keep `k` as the outermost loop |
| Mutable arrays/lists used directly as state keys | `visited` compares object references, so duplicate board states slip through | Serialize states to strings/tuples/bitmasks before storing |

---

## 9. Related LeetCode Problems

> The full tiered problem set lives in [Practice Roadmap](../DSAPatterns/Practice-Roadmap.md). The list below is the minimum set for this topic.

| # | Problem | Difficulty | Pattern |
|---|---|---|---|
| 133 | Clone Graph | Medium | BFS/DFS + old-to-new map |
| 200 | Number of Islands | Medium | Grid flood fill |
| 207 | Course Schedule | Medium | Directed cycle detection / topo |
| 210 | Course Schedule II | Medium | Topological order |
| 542 | 01 Matrix | Medium | Multi-source BFS |
| 684 | Redundant Connection | Medium | Union-Find cycle detection |
| 721 | Accounts Merge | Medium | Union-Find / components |
| 743 | Network Delay Time | Medium | Dijkstra |
| 785 | Is Graph Bipartite? | Medium | 2-colouring |
| 787 | Cheapest Flights Within K Stops | Medium | Bounded Bellman-Ford snapshot |
| 994 | Rotting Oranges | Medium | Multi-source BFS |
| 127 | Word Ladder | Hard | Bidirectional BFS over words |
| 269 | Alien Dictionary | Hard | Constraint graph + topo |
| 847 | Shortest Path Visiting All Nodes | Hard | BFS over `(node, mask)` |
| 1584 | Min Cost to Connect All Points | Medium | MST / dense Prim |

---

## 10. Cheat Sheet

- **Representation**: sparse -> adjacency list; dense/small -> matrix; Kruskal/Bellman-Ford/streamed input -> edge list.
- **Matrix recall**: `(A^k)[i][j]` counts length-`k` walks; undirected triangles = `trace(A^3) / 6`.
- **BFS**: queue, mark visited at enqueue, shortest path only when every edge cost is equal.
- **DFS**: stack/recursion; structure not shortest paths; directed cycle/topo needs `unvisited/in-progress/done`.
- **Components**: loop over all vertices; one BFS/DFS per unvisited vertex.
- **Cycles**: undirected visited non-parent => cycle; directed edge to `in-progress` => cycle; parallel edges require parent edge id.
- **Topological sort**: Kahn in-degree queue or DFS postorder reverse; verify `order.Count == V`; unique iff one zero-in-degree choice at every step.
- **DSU**: path compression + union by rank/size => O(alpha(V)); failed union means already connected/cycle.
- **Shortest paths**: unweighted -> BFS; 0/1 -> 0-1 BFS; non-negative -> Dijkstra/A*; negative -> Bellman-Ford; DAG -> topo relax; all-pairs small -> Floyd-Warshall.
- **Dijkstra C#**: no `DecreaseKey`; push duplicates and skip stale pops (`if (d > dist[u]) continue;`). Never use with negative edges.
- **Bellman-Ford**: `V - 1` rounds; an improving `V`th round proves reachable negative cycle; snapshots for at-most-K-stops.
- **Floyd-Warshall**: diagonal 0, missing edges INF, `k` outermost, guard INF before addition.
- **MST**: Kruskal = sort + DSU; heap-Prim = adjacency list; O(V^2) Prim = dense/complete graph; connected MST has `n - 1` edges.
- **Bipartite**: BFS/DFS 2-colour; same-colour edge means odd cycle.
- **Grid**: bounds before access, delta arrays, mutate or visited array, seed all sources for multi-source BFS.
- **Implicit states**: state = node, move = edge; serialize immutable keys; generate neighbours lazily; bidirectional BFS only for unweighted reversible moves.
- **Weights**: use `long` for large totals and skip `INF` before adding.

**Related notes:** [Trees](../Trees/Trees.md) · [Heaps](../Heaps/Heaps.md) · [Backtracking](../Backtracking/Backtracking.md) · [Dynamic Programming](../Dynamic%20Programming/Dynamic%20Programming.md) · [DSA Patterns](../DSAPatterns/DSAPatterns.md)

---

## See Also

- [Trees](../Trees/Trees.md) — Trees are the acyclic special case; start here for traversal intuition.
- [Heaps](../Heaps/Heaps.md) — Priority queues drive Dijkstra and Prim.
- [Stack and Queue](../Stack%20and%20Queue/Stack%20and%20Queue.md) — The container choice is what separates BFS from DFS.
- [Dynamic Programming](../Dynamic%20Programming/Dynamic%20Programming.md) — Shortest paths on a DAG are DP over a topological order.
- [Hashing](../Hashing/Hashing.md) — Visited sets, adjacency maps and node-id interning.
- [DSA Patterns](../DSAPatterns/DSAPatterns.md) — master index: pattern selection flowchart and complexity-from-constraints.
- [Practice Roadmap](../DSAPatterns/Practice-Roadmap.md) — the tiered problem set to drill this topic.
