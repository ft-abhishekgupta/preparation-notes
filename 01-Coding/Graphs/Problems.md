# Graphs — Problems

## Number of Islands

Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

**Example:** `grid = [["1","1","0"],["1","0","0"],["0","0","1"]]` → `2`

```text
DFS | O(M * N) | O(M * N)

NUMBER_OF_ISLANDS(grid):
    rows = grid.rows
    cols = grid.cols
    islands = 0
    for r = 0 to rows - 1:
        for c = 0 to cols - 1:
            if grid[r][c] == '1':
                islands++
                DFS(r, c)
    return islands

DFS(r, c):
    if r < 0 OR r >= rows OR
       c < 0 OR c >= cols:
        return
    if grid[r][c] != '1':
        return
    grid[r][c] = '0'
    DFS(r + 1, c)
    DFS(r - 1, c)
    DFS(r, c + 1)
    DFS(r, c - 1)
```

## Clone Graph

Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node in the graph contains a value (int) and a list (List[Node]) of its neighbors.

**Example:** `adjList = [[2,4],[1,3],[2,4],[1,3]]` → an identical, fully independent deep copy

```text
DFS + HASHMAP | O(V + E) | O(V)

// Need hashmap to keep track of visited nodes and their corresponding cloned nodes.

CLONE_GRAPH(node):
    if node == null:
        return null
    visited = empty hashmap
    return DFS(node)

DFS(node):
    if node exists in visited:
        return visited[node]
    clone = new Node(node.value)
    visited[node] = clone
    for neighbor in node.neighbors:
        clonedNeighbor = DFS(neighbor)
        clone.neighbors.add(clonedNeighbor)
    return clone
```

## Pacific Atlantic Water Flow

Given an m x n matrix of non-negative integers representing the height of each unit cell in a continent, the "Pacific ocean" touches the left and top edges of the matrix and the "Atlantic ocean" touches the right and bottom edges. Water can only flow in four directions (up, down, left, or right) from a cell to another one with height equal or lower. Find the list of grid coordinates where water can flow to both the Pacific and Atlantic ocean.

**Example:** `heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]` → `[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]`

```text
BRUTE FORCE DFS | O((R * C)^2) | O(R * C)

From every cell, perform DFS to check if it can reach both oceans.

------------------------------------------------------------------------------

REVERSAL DFS | O(R * C) | O(R * C)

// Start from edge cells adjacent to the Pacific and Atlantic oceans and perform DFS to mark all cells that can reach each ocean. The intersection of these two sets gives the result.

PACIFIC_ATLANTIC(heights):
    pacific = empty set
    atlantic = empty set
    for every cell touching Pacific:
        DFS(cell, pacific)
    for every cell touching Atlantic:
        DFS(cell, atlantic)
    result = intersection(pacific, atlantic)
    return result

DFS(r, c, reachable):
    if cell already in reachable:
        return
    add (r, c) to reachable
    for each direction:
        nr = r + dr
        nc = c + dc
        if outside grid:
            continue
        if heights[nr][nc] < heights[r][c]:
            continue
        DFS(nr, nc, reachable)
```

## Course Schedule

There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses. Otherwise, return false.

Does the directed graph contain a cycle?

**Example:** `numCourses = 2, prerequisites = [[1,0]]` → `true`

```text
DFS CYCLE DETECTION | O(V + E) | O(V)

// 0 = unvisited, 1 = currently visiting, 2 = completely processed

CAN_FINISH(numCourses, prerequisites):
    graph = build adjacency list
    state = array filled with 0
    for course = 0 to numCourses - 1:
        if state[course] == 0:
            if DFS(course):
                return false
    return true

DFS(course):
    if state[course] == 1:
        return true       // cycle
    if state[course] == 2:
        return false      // already processed
    state[course] = 1    // visiting
    for next in graph[course]:
        if DFS(next):
            return true
    state[course] = 2    // completed
    return false

------------------------------------------------------------------------------

TOPOLOGICAL SORT | O(V + E) | O(V)

// If we can remove all nodes with indegree 0, there is no cycle
// Indegree = number of incoming edges

indegree = calculate indegrees
queue = all nodes with indegree 0
processed = 0
while queue not empty:
    course = dequeue
    processed++
    for next in graph[course]:
        indegree[next]--
        if indegree[next] == 0:
            enqueue(next)
return processed == numCourses
```

## Course Schedule II

Same as Course Schedule, but return the order of courses to finish all courses. If there are multiple valid orders, return any of them. If it is impossible to finish all courses, return an empty array.

**Example:** `numCourses = 2, prerequisites = [[1,0]]` → `[0, 1]`

```text
DFS TOPOLOGICAL SORT | O(V + E) | O(V + E)

state = 0 for all nodes
result = []

DFS(course):
    if state[course] == 1:
        cycle
        return false
    if state[course] == 2:
        return true
    state[course] = 1
    for next in graph[course]:
        if DFS(next) == false:
            return false
    state[course] = 2
    add course to result
    return true

reverse(result)

------------------------------------------------------------------------------

KAHN'S ALGORITHM | O(V + E) | O(V + E)

COURSE_ORDER(numCourses, prerequisites):
    graph = adjacency list
    indegree = array
    for each prerequisite:
        graph[prerequisite] add course
        indegree[course]++
    queue = all courses with indegree == 0
    result = []
    while queue not empty:
        course = dequeue
        result.add(course)
        for next in graph[course]:
            indegree[next]--
            if indegree[next] == 0:
                enqueue(next)
    if result.size != numCourses:
        return []
    return result
```

## Rotten Oranges

You are given an m x n grid where each cell can have one of three values:

- 0 representing an empty cell,
- 1 representing a fresh orange, or
- 2 representing a rotten orange.

Every minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten.
Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.

**Example:** `grid = [[2,1,1],[1,1,0],[0,1,1]]` → `4`

```text
BRUTE FORCE | O(M * N * Minutes) | O(M * N)

Simulate the rotting process minute by minute, updating the grid until no fresh oranges remain or no more can rot.

------------------------------------------------------------------------------

MULTI-SOURCE BFS | O(M * N) | O(M * N)

ROTTING_ORANGES(grid):
    queue = empty
    fresh = 0
    for every cell:
        if cell == 2:
            queue.enqueue(cell)
        if cell == 1:
            fresh++
    minutes = 0
    while queue not empty AND fresh > 0:
        levelSize = queue.size
        repeat levelSize times:
            cell = queue.dequeue()
            for each direction:
                neighbor = adjacent cell
                if neighbor is fresh:
                    make neighbor rotten
                    fresh--
                    queue.enqueue(neighbor)
        minutes++
    if fresh > 0:
        return -1
    return minutes
```

## Word Ladder

Given two words (beginWord and endWord), and a dictionary's word list, find the length of the shortest transformation sequence from beginWord to endWord, such that:

1. Only one letter can be changed at a time.
2. Each transformed word must exist in the word list. Note that beginWord is not a transformed word.

**Example:** `beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]` → `5`

```text
BFS | O(N * M^2) | O(N * M)
Where N is the number of words in the word list and M is the length of each word.

// Unweighted shortest path problem

WORD_LADDER(beginWord, endWord, wordList):
    dictionary = HashSet(wordList)
    if endWord not in dictionary:
        return 0
    queue = [(beginWord, 1)]
    visited = {beginWord}
    while queue not empty:
        (word, distance) = dequeue
        if word == endWord:
            return distance
        for i = 0 to word.length - 1:
            original = word[i]
            for c = 'a' to 'z':
                word[i] = c
                if word in dictionary
                   AND word not in visited:
                    visited.add(word)
                    enqueue(word, distance + 1)
            word[i] = original
    return 0

-------------------------------------------------------------------------------

BIDIRECTIONAL BFS | O(N * M^2) | O(N * M)
Where N is the number of words in the word list and M is the length of each word.

// Search from both the beginWord and endWord simultaneously to reduce the search space.

front = {beginWord}
back = {endWord}
visited = {beginWord, endWord}
distance = 1
while front not empty AND back not empty:
    always expand smaller frontier
    nextFront = empty set
    for word in front:
        generate all one-character neighbors
        for neighbor:
            if neighbor in back:
                return distance + 1
            if neighbor not visited:
                visited.add(neighbor)
                nextFront.add(neighbor)
    front = nextFront
    distance++
return 0
```

## Graph Valid Tree

Given n nodes labeled from 0 to n - 1 and a list of undirected edges (each edge is a pair of nodes), write a function to check whether these edges make up a valid tree.

A valid tree must satisfy two conditions:

1. It must be fully connected (there is a path between any two nodes). Number of edges must be n - 1.
2. It must not contain any cycles.

**Example:** `n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]` → `true`

```text
DFS | O(V + E) | O(V + E)

VALID_TREE(n, edges):
    if edges.length != n - 1:
        return false
    graph = build adjacency list
    visited = empty set
    if DFS(0, -1) == false:
        return false
    return visited.size == n

DFS(node, parent):
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor == parent:
            continue
        if neighbor in visited:
            return false
        if DFS(neighbor, node) == false:
            return false
    return true

------------------------------------------------------------------------------

UNION-FIND | O(V + E) | O(V)

// n nodes must have n - 1 edges to be a tree. Use union-find to detect cycles.

VALID_TREE(n, edges):
    if edges.length != n - 1:
        return false
    DSU = initialize(n)
    for (u, v) in edges:
        if FIND(u) == FIND(v):
            return false
        UNION(u, v)
    return true
```

## Redundant Connection

Given a connected undirected graph of n nodes labeled from 1 to n, and an array edges where edges[i] = [ui, vi] indicates that there is an edge between ui and vi in the graph. The graph is a tree plus one additional edge. Return an edge that can be removed so that the resulting graph is a tree of n nodes. If there are multiple answers, return the answer that occurs last in the input.

**Example:** `edges = [[1,2],[1,3],[2,3]]` → `[2, 3]`

```text
BRUTE FORCE | O(N^2) | O(N)

For each edge, remove it and check if the graph is still connected and acyclic.

------------------------------------------------------------------------------

UNION-FIND | O(E * α(V)) | O(V)
Where α(N) is the inverse Ackermann function, which grows very slowly and is practically constant for reasonable values of N.

// Process edge one by one. If both endpoints of an edge are already connected, then this edge is redundant.

findRedundantConnection(edges):
    n = number of nodes
    parent = array of size n + 1
    rank = array of size n + 1 initialized to 0
    FOR i = 1 TO n:
        parent[i] = i
    FOR each edge (u, v) in edges:
        IF union(u, v) == FALSE:
            RETURN (u, v)       // This edge creates a cycle
    RETURN NONE

find(x):
    IF parent[x] != x:
        parent[x] = find(parent[x])    // Path compression
    RETURN parent[x]

union(x, y):
    rootX = find(x)
    rootY = find(y)
    IF rootX == rootY:
        RETURN FALSE                    // Already connected → cycle
    IF rank[rootX] < rank[rootY]:
        parent[rootX] = rootY
    ELSE IF rank[rootX] > rank[rootY]:
        parent[rootY] = rootX
    ELSE:
        parent[rootY] = rootX
        rank[rootX] = rank[rootX] + 1
    RETURN TRUE
```

## Network Delay Time

Given a network of n nodes, labeled from 1 to n, and a list of travel times as directed edges times[i] = (ui, vi, wi), where ui is the source node, vi is the target node, and wi is the time it takes for a signal to travel from source to target. We send a signal from a certain node k. Return the time it takes for all the n nodes to receive the signal. If it is impossible for all the n nodes to receive the signal, return -1.

**Example:** `times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2` → `2`

```text
BELLMAN-FORD | O(V * E) | O(V)
// Relax all edges V - 1 times. If we can still relax an edge, then there is a negative cycle.

distance[K] = 0
others = infinity

repeat V - 1 times:
    for each (u, v, weight):
        distance[v] = min(distance[v], distance[u] + weight)

------------------------------------------------------------------------------

DIJKSTRA | O((V+E) * log(V)) | O(V + E)

NETWORK_DELAY(times, n, k):
    graph = adjacency list
    distance = array filled with infinity
    distance[k] = 0
    minHeap = empty
    push (0, k) into minHeap
    while minHeap not empty:
        (currentDistance, node) = pop minimum
        if currentDistance > distance[node]:
            continue
        for (neighbor, weight) in graph[node]:
            newDistance = currentDistance + weight
            if newDistance < distance[neighbor]:
                distance[neighbor] = newDistance
                push (newDistance, neighbor)
    answer = maximum distance
    if any distance == infinity:
        return -1
    return answer
```

## Min cost to connect all points

You are given an array points representing integer coordinates of some points on a 2D-plane, where points[i] = [xi, yi]. The cost of connecting two points [xi, yi] and [xj, yj] is the manhattan distance between them: |xi - xj| + |yi - yj|, where |val| denotes the absolute value of val.
Return the minimum cost to make all points connected. All points are connected if there is exactly one simple path between any two points.

Minimum Spanning Tree problem.

**Example:** `points = [[0,0],[2,2],[3,10],[5,2],[7,0]]` → `20`

```text
KRUSKAL'S ALGORITHM | O(V ^ 2 Log V) | O(V^2)
Where E is the number of edges and V is the number of vertices.

// Sort all edges by weight and add them to the MST if they don't create a cycle (using union-find).
// Kruskal = Generate edges → Sort by weight → Union-Find → Take edge if components differ → Stop at V−1 edges.

FUNCTION minCostConnectPoints(points):
    n = number of points
    edges = empty list
    // Create all possible edges
    FOR i = 0 TO n - 1:
        FOR j = i + 1 TO n - 1:
            distance =
                ABS(points[i].x - points[j].x)
                + ABS(points[i].y - points[j].y)
            edges.ADD((distance, i, j))
    // Kruskal: process cheapest edges first
    SORT edges BY distance ASCENDING
    // Initialize Union-Find
    parent = array of size n
    rank = array of size n
    FOR i = 0 TO n - 1:
        parent[i] = i
        rank[i] = 0
    totalCost = 0
    edgesUsed = 0
    FOR each (cost, u, v) in edges:
        rootU = FIND(u)
        rootV = FIND(v)
        // If different components, connect them
        IF rootU != rootV:
            UNION(rootU, rootV)
            totalCost = totalCost + cost
            edgesUsed = edgesUsed + 1
            // MST has n - 1 edges
            IF edgesUsed == n - 1:
                BREAK
    RETURN totalCost

FUNCTION FIND(x):
    IF parent[x] != x:
        parent[x] = FIND(parent[x])
    RETURN parent[x]

FUNCTION UNION(x, y):
    rootX = FIND(x)
    rootY = FIND(y)
    IF rootX == rootY:
        RETURN
    IF rank[rootX] < rank[rootY]:
        parent[rootX] = rootY
    ELSE IF rank[rootX] > rank[rootY]:
        parent[rootY] = rootX
    ELSE:
        parent[rootY] = rootX
        rank[rootX] = rank[rootX] + 1

------------------------------------------------------------------------------

PRIM'S ALGORITHM | O(V^2) | O(V)

// At every step, select the unvisited point with the cheapest connection to the current MST

MIN_COST_CONNECT(points):
    n = points.length
    minCost = array filled with infinity
    visited = array filled with false
    minCost[0] = 0
    answer = 0
    repeat n times:
        u = unvisited node with smallest minCost[u]
        visited[u] = true
        answer += minCost[u]
        for v = 0 to n - 1:
            if visited[v]:
                continue
            cost = ManhattanDistance(points[u], points[v])
            minCost[v] = min(minCost[v], cost)
    return answer
```

## Aliens Dictionary

Given a list of words from the dictionary, where words are sorted lexicographically by the rules of this new language, derive the order of letters in this language.

**Example:** `words = ["wrt","wrf","er","ett","rftt"]` → `"wertf"`

```text
TOPOLOGICAL SORT | O(C + V + E) | O(V + E)
C: Total number of characters in all words
V: Number of unique characters
E: Number of edges in the graph

ALIEN_ORDER(words):
    graph = empty adjacency list
    indegree = hashmap
    add every character to graph
    add every character to indegree with 0
    for i = 0 to words.length - 2:
        a = words[i]
        b = words[i + 1]
        if a is invalid prefix of b:
            return ""
        for j = 0 to min(a.length, b.length) - 1:
            if a[j] != b[j]:
                u = a[j]
                v = b[j]
                if v not already in graph[u]:
                    graph[u].add(v)
                    indegree[v]++
                break
    queue = all characters with indegree 0
    result = ""
    while queue not empty:
        c = dequeue
        result += c
        for next in graph[c]:
            indegree[next]--
            if indegree[next] == 0:
                enqueue(next)
    if result.length != numberOfUniqueCharacters:
        return ""
    return result
```

## Longest Increasing Path in a Matrix

Given an m × n integer matrix, return the length of the longest strictly increasing path. Moves are allowed in four directions and cannot wrap around or move diagonally.

**Example:** `matrix = [[9,9,4],[6,6,8],[2,1,1]]` → `4` (1 → 2 → 6 → 9)

```text
BRUTE FORCE DFS | O(4^(M * N)) | O(M * N)

Run a DFS from every cell and keep the longest path found

------------------------------------------------------------------------------

DFS + MEMOIZATION | O(M * N) | O(M * N)

// The strictly increasing constraint makes the graph a DAG, so no visited set is needed
// memo[r][c] = length of the longest increasing path starting at (r, c)

LONGEST_PATH(matrix):
    memo = 2D array filled with 0
    answer = 0
    for every cell (r, c):
        answer = max(answer, DFS(r, c))
    return answer

DFS(r, c):
    if memo[r][c] != 0:
        return memo[r][c]
    best = 1
    for each direction:
        nr = r + dr
        nc = c + dc
        if outside grid:
            continue
        if matrix[nr][nc] <= matrix[r][c]:
            continue
        best = max(best, 1 + DFS(nr, nc))
    memo[r][c] = best
    return best

------------------------------------------------------------------------------

TOPOLOGICAL SORT (PEELING) | O(M * N) | O(M * N)

Compute the outdegree of every cell towards larger neighbours
Repeatedly remove all cells with outdegree 0; the number of rounds is the answer
```

## Cheapest Flights Within K Stops

Given n cities and flights `[from, to, price]`, return the cheapest price from src to dst using at most k stops. If there is no such route, return -1.

**Example:** `n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1` → `700`

```text
PLAIN DIJKSTRA | INCORRECT

Dijkstra minimises cost only, so it can discard a costlier path that uses fewer stops
The state must include the number of stops used

------------------------------------------------------------------------------

BELLMAN-FORD (K + 1 ROUNDS) | O(K * E) | O(V)

// Relaxing all edges i times finds the cheapest path using at most i edges
// The snapshot is required so that one round cannot use edges relaxed in the same round

distance = array filled with infinity
distance[src] = 0

repeat k + 1 times:
    previous = copy of distance
    for each (from, to, price) in flights:
        if previous[from] == infinity:
            continue
        distance[to] = min(distance[to], previous[from] + price)

if distance[dst] == infinity:
    return -1
return distance[dst]

------------------------------------------------------------------------------

BFS / DIJKSTRA ON (CITY, STOPS) | O(E * K log(E * K)) | O(V * K)

Push (cost, city, stopsUsed) into a min heap
Skip a state when stopsUsed > k or when the city was already reached with fewer stops and lower cost
```

## All-Pairs Shortest Path

Given a weighted directed graph, compute the shortest distance between every pair of vertices.

**Example:** `n = 3, edges = [[0,1,4],[1,2,3],[0,2,10]]` → `distance[0][2] = 7`

```text
DIJKSTRA FROM EVERY NODE | O(V * (V + E) log V) | O(V^2)

Better for large sparse graphs, but does not support negative edges

------------------------------------------------------------------------------

FLOYD-WARSHALL | O(V^3) | O(V^2)

// distance[i][j] using only the first k vertices as intermediates
// k MUST be the outermost loop, otherwise the recurrence is wrong

initialise distance[i][i] = 0
initialise distance[u][v] = weight(u, v), otherwise infinity

for k = 0 to n - 1:
    for i = 0 to n - 1:
        for j = 0 to n - 1:
            if distance[i][k] + distance[k][j] < distance[i][j]:
                distance[i][j] = distance[i][k] + distance[k][j]
```

> - Negative edges are allowed; `distance[i][i] < 0` means a negative cycle exists.
> - Replacing `min`/`+` with `OR`/`AND` gives the transitive closure (reachability).

## Critical Connections in a Network

Given an undirected connected graph, return all bridges: edges whose removal disconnects the graph.

**Example:** `n = 4, connections = [[0,1],[1,2],[2,0],[1,3]]` → `[[1,3]]`

```text
BRUTE FORCE | O(E * (V + E)) | O(V + E)

Remove each edge and check whether the graph is still connected

------------------------------------------------------------------------------

TARJAN'S BRIDGE ALGORITHM | O(V + E) | O(V + E)

// discovery[node] = when the node was first visited
// low[node] = earliest discovery time reachable from the node's subtree using at most one back edge
// If a child cannot reach the current node or higher, the connecting edge is a bridge

timer = 0

DFS(node, parent):
    discovery[node] = low[node] = timer++
    for neighbor in graph[node]:
        if neighbor == parent:
            continue                     // Skip only one occurrence for parallel edges
        if neighbor is visited:
            low[node] = min(low[node], discovery[neighbor])
        else:
            DFS(neighbor, node)
            low[node] = min(low[node], low[neighbor])
            if low[neighbor] > discovery[node]:
                add (node, neighbor) to bridges
```

> - Articulation point: `low[child] >= discovery[node]`; the DFS root is one only when it has two or more children.
> - Strongly connected components in a directed graph use Tarjan (one DFS with a stack) or Kosaraju (two DFS passes on the graph and its reverse).

## Reconstruct Itinerary

Given a list of airline tickets `[from, to]`, reconstruct the itinerary that starts at `"JFK"` and uses every ticket exactly once. If several are valid, return the lexicographically smallest one.

**Example:** `tickets = [["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]` → `["JFK","MUC","LHR","SFO","SJC"]`

```text
BACKTRACKING | O(E!) | O(E)

Try every unused ticket in lexicographic order and undo on failure

------------------------------------------------------------------------------

HIERHOLZER'S ALGORITHM (EULERIAN PATH) | O(E log E) | O(E)

// Greedily walking forward can get stuck at a dead end before all edges are used
// Post-order emission fixes this: a stuck node is appended first and ends up last

build adjacency lists and sort each one (or use a min heap per node)
route = empty list

DFS(node):
    while graph[node] is not empty:
        next = remove the smallest destination from graph[node]
        DFS(next)
    route.add(node)              // Post-order

DFS("JFK")
reverse route
```

> An Eulerian path exists when the graph is connected and at most one vertex has `outdegree - indegree == 1` (the start) and at most one has `indegree - outdegree == 1` (the end).
