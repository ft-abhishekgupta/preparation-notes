const e=`---\r
title: Graphs and Traversal\r
description: Directed versus undirected graphs, adjacency representations, BFS versus DFS trade-offs, and the traversal patterns behind most graph interview questions\r
difficulty: Core\r
tags: [graphs, bfs, dfs, traversal]\r
---\r
\r
Almost every graph interview question is a traversal in disguise — connected components, cycle detection, bipartite checks and multi-source shortest paths are all BFS or DFS with one extra bookkeeping trick layered on top. Get comfortable with the representation choices and the BFS/DFS trade-off first; everything else follows.\r
\r
## Terminology\r
\r
Formally, a graph is a pair \`G = (V, E)\`, where \`V\` is the set of vertices (nodes) and \`E\` is the set of edges connecting them.\r
\r
| Term | Meaning |\r
|---|---|\r
| Vertex | A single node in the graph |\r
| Edge | A connection between two vertices |\r
| Degree | The number of edges touching a vertex |\r
| In-degree / out-degree | In a directed graph, the number of edges entering / leaving a vertex |\r
| Weight | A cost, distance, or capacity value attached to an edge |\r
| Path | A sequence of edges connecting a sequence of vertices |\r
| Cycle | A path that starts and ends at the same vertex |\r
\r
![Examples of different graph types](notes/DSA/Graphs/image-6.png)\r
\r
## Directed, undirected, weighted\r
\r
| Type | Edge meaning | Example |\r
|---|---|---|\r
| Undirected | Connection goes both ways | Friendship graph, road network (two-way street) |\r
| Directed | Connection has a direction | Follows on social media, task dependencies, one-way streets |\r
| Weighted | Edge carries a cost/distance/capacity | Road network with distances, network with bandwidth |\r
| Unweighted | Every edge costs the same (implicitly 1) | Most traversal-only problems |\r
\r
\`\`\`mermaid\r
flowchart LR\r
    A["A"] --> B["B"]\r
    B --> C["C"]\r
    A --- D["D"]\r
\`\`\`\r
\r
Directed edges (\`A --> B\`) mean "A points to B, not necessarily the reverse". An undirected edge (\`A --- D\`) is equivalent to two directed edges, one each way — that equivalence is exactly how you'd implement an undirected graph on top of a directed representation.\r
\r
> [!KEY]\r
> "Graph problem" almost always decomposes into: pick a representation, pick BFS or DFS, and add one piece of state (visited set, distance array, color array, union-find). The traversal skeleton barely changes between problems.\r
\r
## Representation: adjacency list vs matrix vs edge list\r
\r
![Adjacency matrix and adjacency list representations](notes/DSA/Graphs/image-7.png)\r
\r
| Representation | Structure | Edge lookup | Iterate neighbors | Space | Best for |\r
|---|---|---|---|---|---|\r
| Adjacency list | Array/map of lists, one per vertex | \`O(degree)\` | \`O(degree)\` | \`O(V + E)\` | Sparse graphs — the default choice |\r
| Adjacency matrix | \`V × V\` 2-D array | \`O(1)\` | \`O(V)\` | \`O(V²)\` | Dense graphs, frequent "is there an edge?" queries |\r
| Edge list | Flat list of \`(u, v, weight)\` tuples | \`O(E)\` | \`O(E)\` | \`O(E)\` | Algorithms that just need to process every edge once (Kruskal's, Bellman-Ford) |\r
\r
\`\`\`csharp\r
// Adjacency list — the default for almost every interview problem\r
List<int>[] adj = new List<int>[n];\r
for (int i = 0; i < n; i++) adj[i] = new List<int>();\r
adj[u].Add(v);\r
adj[v].Add(u);   // omit this line for a directed graph\r
\r
// Weighted adjacency list\r
List<(int to, int weight)>[] wadj = new List<(int, int)>[n];\r
\r
// Adjacency matrix\r
int[,] matrix = new int[n, n];\r
matrix[u, v] = 1;\r
\`\`\`\r
\r
> [!TIP]\r
> Default to an adjacency list unless the problem explicitly needs fast edge-existence checks or the graph is dense (\`E\` close to \`V²\`). Most interview graphs — grids, sparse relationship graphs — are adjacency-list territory.\r
\r
## BFS vs DFS\r
\r
Both visit every reachable vertex and edge in \`O(V + E)\` time and \`O(V)\` space — the difference is entirely about **order** and what that order is useful for.\r
\r
\`\`\`mermaid\r
flowchart TD\r
    Q["Queue-based:<br/>BFS"] --> L["Explores level by level"]\r
    L --> SP["Shortest path (unweighted)"]\r
    S["Stack/recursion-based:<br/>DFS"] --> D["Explores depth-first"]\r
    D --> TS["Topological sort, cycle detection, backtracking"]\r
\`\`\`\r
\r
| Aspect | BFS | DFS |\r
|---|---|---|\r
| Structure | Queue | Stack (explicit or recursion) |\r
| Visits | Level by level, nearest first | As deep as possible, then backtrack |\r
| Shortest path (unweighted) | Yes — first time you reach a node is via a shortest path | No — may find a longer path first |\r
| Cycle detection / topological sort | Possible (Kahn's algorithm) but less natural | Natural — color/state tracking during recursion |\r
| Memory pattern | Can hold an entire "frontier" (wide graphs cost more) | Holds one path at a time (deep graphs cost more) |\r
| Typical use | Shortest path, level-order, "minimum steps" | Connectivity, cycle detection, topological order, exhaustive search |\r
\r
\`\`\`csharp\r
// BFS — shortest path in an unweighted graph\r
int Bfs(List<int>[] adj, int start, int target) {\r
    var visited = new bool[adj.Length];\r
    var queue = new Queue<(int node, int dist)>();\r
    queue.Enqueue((start, 0));\r
    visited[start] = true;\r
    while (queue.Count > 0) {\r
        var (node, dist) = queue.Dequeue();\r
        if (node == target) return dist;\r
        foreach (int next in adj[node])\r
            if (!visited[next]) { visited[next] = true; queue.Enqueue((next, dist + 1)); }\r
    }\r
    return -1;\r
}\r
\r
// DFS — recursive, connectivity/exploration\r
void Dfs(List<int>[] adj, int node, bool[] visited) {\r
    visited[node] = true;\r
    foreach (int next in adj[node])\r
        if (!visited[next]) Dfs(adj, next, visited);\r
}\r
\`\`\`\r
\r
> [!WARNING]\r
> Mark a node visited **when you enqueue/push it**, not when you dequeue/pop it. Marking too late lets the same node get added to the queue multiple times through different paths, wasting work and — in BFS shortest-path problems — occasionally corrupting the distance count.\r
\r
## Connected components\r
\r
Run an unvisited-driven loop over all vertices, launching a fresh BFS/DFS from each vertex not yet visited — each launch discovers exactly one connected component.\r
\r
\`\`\`csharp\r
int CountComponents(List<int>[] adj, int n) {\r
    var visited = new bool[n];\r
    int count = 0;\r
    for (int i = 0; i < n; i++) {\r
        if (visited[i]) continue;\r
        count++;\r
        Dfs(adj, i, visited);   // marks the whole component visited\r
    }\r
    return count;\r
}\r
\`\`\`\r
\r
\`O(V + E)\` total — every vertex and edge is still visited exactly once overall, just possibly split across multiple traversal launches.\r
\r
## Grid as graph\r
\r
A 2-D grid is a graph where each cell is a vertex and edges connect it to its (usually 4, sometimes 8) neighbors — "number of islands", "rotting oranges", and shortest-path-on-a-grid problems are all standard BFS/DFS with grid-specific bounds checking instead of an adjacency list.\r
\r
\`\`\`csharp\r
int[] dr = { 0, 0, 1, -1 };\r
int[] dc = { 1, -1, 0, 0 };\r
bool InBounds(int r, int c, int rows, int cols) => r >= 0 && r < rows && c >= 0 && c < cols;\r
\r
// Neighbor iteration replaces adj[node] from the list-based version\r
for (int d = 0; d < 4; d++) {\r
    int nr = r + dr[d], nc = c + dc[d];\r
    if (InBounds(nr, nc, rows, cols) && grid[nr, nc] == '1' && !visited[nr, nc]) { /* ... */ }\r
}\r
\`\`\`\r
\r
## Cycle detection: directed vs undirected\r
\r
This is the single biggest source of confusion in graph interviews — the two cases genuinely need different techniques.\r
\r
| Graph type | Technique | Why |\r
|---|---|---|\r
| Undirected | DFS tracking the parent; a visited neighbor that isn't the parent means a cycle | An edge back to the immediate parent is not a cycle — it's the same edge traversed backward |\r
| Directed | DFS with **three states** (unvisited, in-progress, done); a visited node still in-progress ("on the current recursion stack") means a cycle | A back edge to any *finished* node is fine; only an edge into the *current path* is a cycle |\r
\r
\`\`\`csharp\r
// Directed cycle detection — three-color DFS\r
// 0 = unvisited, 1 = in progress (on current DFS path), 2 = done\r
bool HasCycleDirected(List<int>[] adj, int node, int[] state) {\r
    state[node] = 1;\r
    foreach (int next in adj[node]) {\r
        if (state[next] == 1) return true;              // back edge into current path = cycle\r
        if (state[next] == 0 && HasCycleDirected(adj, next, state)) return true;\r
    }\r
    state[node] = 2;\r
    return false;\r
}\r
\`\`\`\r
\r
> [!DANGER]\r
> Using the undirected "just check visited" rule on a directed graph gives false positives — a directed graph can have two separate paths converging on the same already-finished node, which is completely legal (it's a DAG), not a cycle. You need the three-state (unvisited/in-progress/done) version for directed graphs.\r
\r
## Bipartite check\r
\r
A graph is bipartite if its vertices can be split into two groups such that every edge connects vertices from *different* groups — equivalently, it can be properly 2-colored. BFS or DFS both work: color the starting node, then force every neighbor to the opposite color, failing if a neighbor is already colored the *same*.\r
\r
\`\`\`csharp\r
bool IsBipartite(List<int>[] adj, int n) {\r
    var color = new int[n];   // 0 = uncolored, 1 or -1 = the two groups\r
    for (int start = 0; start < n; start++) {\r
        if (color[start] != 0) continue;\r
        color[start] = 1;\r
        var queue = new Queue<int>(); queue.Enqueue(start);\r
        while (queue.Count > 0) {\r
            int node = queue.Dequeue();\r
            foreach (int next in adj[node]) {\r
                if (color[next] == 0) { color[next] = -color[node]; queue.Enqueue(next); }\r
                else if (color[next] == color[node]) return false;   // same color on both ends of an edge\r
            }\r
        }\r
    }\r
    return true;\r
}\r
\`\`\`\r
\r
\`O(V + E)\`. A graph with an odd-length cycle is never bipartite — that's the underlying reason this check is equivalent to "no odd cycles".\r
\r
## Multi-source BFS\r
\r
Instead of a single starting node, push **all** starting nodes into the queue before the first step — this computes "distance to the nearest of several sources" in a single \`O(V + E)\` pass, rather than running BFS once per source (\`O(k * (V + E))\`).\r
\r
\`\`\`csharp\r
// e.g., "rotting oranges" — distance from ANY initially-rotten orange\r
var queue = new Queue<(int r, int c)>();\r
foreach (var (r, c) in initialSources) queue.Enqueue((r, c));   // seed with ALL sources at once\r
int minutes = 0;\r
while (queue.Count > 0) {\r
    int size = queue.Count;\r
    bool advanced = false;\r
    for (int i = 0; i < size; i++) {\r
        var (r, c) = queue.Dequeue();\r
        // visit neighbors, enqueue newly-reached ones, mark advanced = true if any were added\r
    }\r
    if (advanced) minutes++;\r
}\r
\`\`\`\r
\r
Any time a problem says "distance from the nearest of several starting points", think multi-source BFS immediately — seeding the queue with every source before starting is the entire trick, the rest of the BFS is unchanged.\r
\r
## Complexity summary\r
\r
| Algorithm | Time | Space | Notes |\r
|---|---|---|---|\r
| BFS / DFS | \`O(V + E)\` | \`O(V)\` | Visited set + queue/stack/recursion |\r
| Connected components | \`O(V + E)\` | \`O(V)\` | One BFS/DFS launch per unvisited vertex |\r
| Cycle detection (undirected) | \`O(V + E)\` | \`O(V)\` | DFS + parent tracking, or Union-Find |\r
| Cycle detection (directed) | \`O(V + E)\` | \`O(V)\` | Three-state DFS |\r
| Bipartite check | \`O(V + E)\` | \`O(V)\` | 2-coloring via BFS/DFS |\r
| Multi-source BFS | \`O(V + E)\` | \`O(V)\` | Same bound as single-source — sources just share the initial frontier |\r
\r
## Choosing the right algorithm\r
\r
Plain BFS/DFS solve traversal, components, cycles and bipartiteness, but a graph question that mentions weights, "shortest", or "minimum cost to connect everything" needs a different tool entirely. Route the decision through the question's actual goal before writing any code:\r
\r
\`\`\`mermaid\r
flowchart TD\r
  G["Graph problem"] --> T{"Goal?"}\r
\r
  T -- "Traversal" --> TR["DFS or BFS"]\r
  T -- "Shortest path" --> P{"Single-source or all-pairs?"}\r
  T -- "Cycle / DAG" --> C{"Directed?"}\r
\r
  P -- "All-pairs" --> F["Floyd-Warshall"]\r
  P -- "Single-source" --> W{"Edge weights?"}\r
  W -- "Unweighted" --> U["BFS"]\r
  W -- "0 or 1" --> Z["0-1 BFS"]\r
  W -- "Non-negative" --> D["Dijkstra"]\r
  W -- "Negative allowed" --> B["Bellman-Ford"]\r
  B --> N["Detects negative cycles"]\r
\r
  C -- "Yes" --> CD["Topological sort or 3-color DFS"]\r
  C -- "No" --> CU["Union-Find or DFS"]\r
\`\`\`\r
\r
The one-line version of each branch: unweighted single-source shortest path is BFS (this page); weights of only 0 or 1 upgrade to 0-1 BFS (a deque instead of a queue); non-negative weights call for Dijkstra; any negative weight needs Bellman-Ford, which as a side effect can also report a negative cycle; and all-pairs shortest paths use Floyd-Warshall. Directed cycle/ordering questions want topological sort (or the three-state DFS from earlier); undirected connectivity/cycle questions are equally well served by Union-Find as by DFS. Each of these gets its own full treatment — this page is the traversal foundation they all sit on top of.\r
\r
## Cheat sheet\r
\r
- Default representation: adjacency list, \`O(V + E)\` space. Use a matrix only for dense graphs or frequent O(1) edge checks.\r
- BFS = queue = level order = shortest path in unweighted graphs. DFS = stack/recursion = depth-first = natural for cycle detection and topological sort.\r
- Mark visited at enqueue/push time, not at dequeue/pop time.\r
- Undirected cycle detection: track the parent, ignore the edge straight back to it. Directed cycle detection: three-state DFS (unvisited/in-progress/done).\r
- A grid is a graph — reuse the exact same BFS/DFS skeleton with bounds-checked neighbor generation instead of an adjacency list.\r
- Bipartite check = 2-coloring via BFS/DFS; fails exactly when an odd-length cycle exists.\r
- Multi-source BFS: seed the queue with every source before the first step, one pass instead of one-BFS-per-source.\r
- Connected components = loop over all vertices, launch a fresh traversal from every still-unvisited one.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Marking visited on dequeue instead of enqueue | Mark at enqueue/push time to avoid duplicate queue entries |\r
| Using undirected cycle-detection logic on a directed graph | Directed graphs need three-state DFS, not simple "seen before" |\r
| Rejecting an edge back to the immediate parent as a cycle (undirected) | That's the same edge traversed backward — only a *different* visited neighbor is a real cycle |\r
| Running BFS once per source when multiple sources share a query | Seed the queue with all sources at once — multi-source BFS |\r
| Choosing an adjacency matrix for a huge sparse graph | That's \`O(V²)\` space for a graph that might only need \`O(V + E)\` |\r
| Forgetting to loop over all vertices for components/cycle checks | A single BFS/DFS only covers one connected component |\r
\r
## Summary\r
\r
Graph traversal is a small skeleton — pick a representation (default: adjacency list), pick BFS or DFS based on whether you need shortest-path/level order or depth-first/backtracking behaviour, and mark visited at the moment you discover a node. Everything else — connected components, cycle detection, bipartite checks, multi-source BFS — is that same skeleton with one additional piece of state layered on top. The two traps worth memorising cold: mark-visited timing, and the fact that directed and undirected cycle detection are genuinely different algorithms.\r
\r
## Top Interview Questions\r
\r
### Q1. Compare adjacency list, adjacency matrix, and edge list representations. When would you choose each?\r
\r
An adjacency list stores, for each vertex, a list of its neighbors — \`O(V + E)\` space, \`O(degree)\` to iterate a vertex's neighbors, and it's the right default for sparse graphs, which is most interview graphs. An adjacency matrix is a \`V × V\` grid where \`matrix[u][v]\` indicates an edge — \`O(V²)\` space regardless of edge count, but \`O(1)\` edge-existence checks, making it worthwhile for dense graphs or algorithms that repeatedly ask "is there an edge between u and v?". An edge list is just a flat list of \`(u, v, weight)\` tuples — minimal structure, \`O(E)\` space, and it's the natural input format for algorithms like Kruskal's minimum spanning tree or Bellman-Ford that process every edge as a unit rather than needing to look up a specific vertex's neighbors.\r
\r
### Q2. When would you use BFS over DFS, and vice versa?\r
\r
Use BFS when you need the shortest path in an unweighted graph, or when you need to process nodes in strict order of distance from a source (level-order processing) — BFS guarantees the first time you reach any node is via a shortest path, because it exhausts all nodes at distance \`d\` before considering any at distance \`d+1\`. Use DFS when you need to explore full paths before backtracking — natural for cycle detection, topological sorting, connectivity checks, and exhaustive search/backtracking problems where you need to fully commit to one path before abandoning it. Both run in \`O(V + E)\` time and \`O(V)\` space, so the choice is about which traversal order matches the problem's actual requirement, not about efficiency.\r
\r
### Q3. Why does BFS guarantee the shortest path in an unweighted graph, but DFS does not?\r
\r
BFS processes nodes in increasing order of distance from the source because it explores the entire "frontier" at distance \`d\` (everything currently in the queue) before any node at distance \`d+1\` gets added — this means the very first time any node is dequeued/discovered, it's necessarily via the shortest possible path, since no longer path could have reached it earlier in this strictly expanding-frontier order. DFS commits to one path as deep as possible before backtracking, so it can easily reach a target node via a long, winding path long before it would have found a shorter one through a different branch — there's no guarantee about which path arrives first, only that some path is eventually found.\r
\r
### Q4. How do you detect a cycle in a directed graph, and why doesn't the undirected approach work here?\r
\r
Use DFS with three states per node: unvisited, in-progress (currently on the active recursion path), and done (fully explored, including all its descendants). A cycle exists if, during DFS, you encounter an edge to a node that is currently in-progress — meaning it's an ancestor on the current path, so this edge closes a loop back to it. The undirected approach — simply checking "have I seen this neighbor before, ignoring the direct parent" — fails on directed graphs because a directed graph can perfectly legally have two separate paths converge on the same already-*finished* node (a classic DAG shape, like a diamond), which the undirected check would incorrectly flag as a cycle since it doesn't distinguish "finished and not on my current path" from "currently being explored".\r
\r
### Q5. Explain why marking a node visited at enqueue time versus dequeue time matters for BFS correctness.\r
\r
If you mark a node visited only when it's dequeued, multiple different paths reaching that same node before it's dequeued will each independently enqueue it — the same node can end up in the queue several times, wasting work, and in shortest-path BFS this can also cause the *distance* recorded for that node to potentially come from whichever queue entry happens to get processed, rather than guaranteeing the first (shortest) one is used consistently throughout downstream processing. Marking visited immediately at enqueue time ensures each node is added to the queue exactly once, guaranteeing both efficiency (no duplicate processing) and correctness (the distance associated with a node's first — and only — enqueue is definitively its shortest-path distance).\r
\r
### Q6. How would you check whether a graph is bipartite?\r
\r
Attempt to 2-color the graph via BFS or DFS: assign the starting vertex one color, then for every edge, force the neighbor to the opposite color; if you ever encounter an edge where both endpoints are already colored the *same*, the graph is not bipartite. You need to restart this process from every connected component separately, since components are independent for this check. This runs in \`O(V + E)\` time and is exactly equivalent to checking whether the graph contains any odd-length cycle — any odd cycle makes proper 2-coloring impossible, since you'd eventually be forced to color two adjacent vertices identically when the cycle closes.\r
\r
### Q7. What is multi-source BFS, and how does it improve on running BFS separately from each source?\r
\r
Multi-source BFS seeds the initial queue with *all* starting nodes at once (each at distance 0) before running the standard BFS loop, rather than running a full separate BFS from each source and taking a minimum afterward. Because BFS naturally expands in order of distance regardless of how many nodes are in the initial frontier, this single pass correctly computes, for every node, its distance to the *nearest* of the sources — in \`O(V + E)\` total, the same asymptotic cost as a single-source BFS. Running BFS once per source instead would cost \`O(k * (V + E))\` for \`k\` sources, a real difference when there are many sources, such as multiple simultaneously-rotting oranges in a grid or multiple fire origins spreading through a map.\r
\r
### Q8. How do you find the number of connected components in an undirected graph?\r
\r
Maintain a visited array over all vertices, and loop through every vertex from 0 to n-1: whenever you encounter an unvisited vertex, increment a component counter and launch a full BFS or DFS from it, which will mark every vertex reachable from it (i.e., the entire component) as visited. Once that traversal finishes, continue the outer loop to find the next unvisited vertex, if any, and repeat. Each vertex and edge is still touched exactly once across the whole process even though the traversal is "restarted" multiple times, so total time remains \`O(V + E)\`. An alternative is Union-Find: union the endpoints of every edge, then count the number of distinct root parents remaining — also effectively \`O(V + E)\` with near-constant-time union/find operations.\r
\r
### Q9. You're modeling a road network with one-way streets and need to find whether every intersection is reachable from a central hub, and whether the hub is reachable from every intersection. How would you approach this?\r
\r
This is two separate directed-graph reachability questions on the same graph. For "is every intersection reachable from the hub", run a single BFS or DFS starting at the hub on the graph as given, and check whether every vertex was visited. For "is the hub reachable from every intersection", conceptually reverse every edge (or maintain a second, reverse adjacency list built alongside the forward one) and run BFS/DFS from the hub on that *reversed* graph — a vertex reachable from the hub in the reversed graph means the hub is reachable from that vertex in the original graph. Both traversals are \`O(V + E)\`, and building the reverse adjacency list up front is also \`O(V + E)\`, so the whole check remains linear in graph size — this reverse-graph trick is a common technique whenever a directed reachability question is asked "backwards".\r
\r
### Q10. In a production system processing a large, sparse dependency graph (e.g., build targets or package dependencies), what representation and traversal would you choose, and why?\r
\r
I'd use an adjacency list — dependency graphs are typically sparse (most nodes depend on only a handful of others, not a large fraction of all nodes), so an adjacency matrix's \`O(V²)\` memory would be wasteful and likely infeasible at scale. For actually processing dependencies in valid order (build target A before anything depending on it), I'd use a topological sort, which is naturally built on DFS (post-order gives a valid reverse topological order) or Kahn's algorithm (BFS-based, repeatedly removing nodes with zero remaining in-degree) — and I'd run a directed cycle check first, since a cycle in a dependency graph means the build is genuinely unsatisfiable and should fail fast with a clear error rather than deadlocking or looping. Kahn's algorithm is often preferred in production because it naturally reports exactly which nodes are involved in a cycle (whatever remains un-removed at the end), which is more actionable for debugging than a DFS-based cycle flag alone.\r
`;export{e as default};
