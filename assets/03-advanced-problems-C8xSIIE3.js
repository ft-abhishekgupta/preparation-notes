const n=`---\r
title: Advanced Problems\r
description: Worked interview problems where the real skill is spotting the state invariant or ordering trick that unlocks the optimal solution\r
difficulty: Advanced\r
tags: [problem-solving, advanced, worked-examples, csharp]\r
---\r
\r
This page is the harder tier of the problem library. These are the questions where a correct brute-force solution is usually easy to say out loud, but the interview signal comes from finding the one state definition, ordering trick, or data-structure invariant that makes the optimal version click. Use it as a walkthrough reference: read the prompt, name the family, then check whether your recurrence, sweep, heap, or stack invariant matches the worked solution here.\r
\r
| Problem | Pattern | Technique | Time | Space |\r
|---|---|---|---|---|\r
| Car Pooling | Arrays | Difference array for bounded coordinates | \`O(n + range)\` | \`O(range)\` |\r
| Burst Balloons | Dynamic Programming | Interval DP with last-burst framing | \`O(n^3)\` | \`O(n^2)\` |\r
| Regular Expression Matching | Dynamic Programming | 2D DP over string and pattern prefixes | \`O(m * n)\` | \`O(m * n)\` |\r
| Partition to K Equal Sum Subsets | Dynamic Programming | Bitmask DP over used elements | \`O(2^n * n)\` | \`O(2^n)\` |\r
| Cheapest Flights Within K Stops | Graphs | Bellman-Ford over \`k + 1\` edge relaxations | \`O(k * E)\` | \`O(V)\` |\r
| Critical Connections in a Network | Graphs | Tarjan low-link bridge detection | \`O(V + E)\` | \`O(V + E)\` |\r
| Reconstruct Itinerary | Graphs | Hierholzer Eulerian path traversal | \`O(E log E)\` | \`O(E)\` |\r
| Partition Labels | Greedy | Last-occurrence greedy partitioning | \`O(n)\` | \`O(1)\` |\r
| Letter Combinations of a Phone Number | Backtracking | Choose one letter per digit | \`O(4^n)\` | \`O(n)\` |\r
| Palindrome Partitioning | Backtracking | Backtracking with palindrome DP precompute | \`O(n * 2^n)\` | \`O(n^2)\` |\r
| Meeting Rooms III | Heap | Available-room heap plus busy-room heap | \`O(n log n)\` | \`O(n)\` |\r
| LFU Cache Design | Linked List | Hash maps plus frequency buckets of doubly linked lists | \`O(1)\` average per op | \`O(capacity)\` |\r
| Median of Two Sorted Arrays | Binary Search | Partition binary search on the smaller array | \`O(log(min(m, n)))\` | \`O(1)\` |\r
| Split Array Largest Sum | Binary Search | Binary search on the answer | \`O(n log(sum(nums)))\` | \`O(1)\` |\r
| Count of Smaller Numbers After Self | Binary Search | Merge-sort counting or Fenwick tree | \`O(n log n)\` | \`O(n)\` |\r
| Path Sum III | Tree | Prefix sums on the root-to-node path | \`O(n)\` | \`O(h)\` |\r
| Asteroid Collision | Stack | Resolve only active right-moving collisions | \`O(n)\` | \`O(n)\` |\r
| Car Fleet | Stack | Sort by position and collapse arrival times | \`O(n log n)\` | \`O(n)\` |\r
| Calculator | Stack | Push result and sign at each parenthesis | \`O(n)\` | \`O(n)\` |\r
\r
\`\`\`mermaid\r
flowchart LR\r
    CP1["Car Pooling brute force"] --> CP2["Difference array for bounded stops"]\r
    CP2 --> CP3["Sweep line for sparse coordinates"]\r
    BB1["Burst Balloons naive thinking"] --> BB2["Pick the last balloon burst"]\r
    BB2 --> BB3["Independent interval subproblems"]\r
\`\`\`\r
\r
## Arrays\r
\r
### Car Pooling\r
\r
**Problem.** You are given trips of the form \`[passengers, start, end]\` and a vehicle capacity. Determine whether all trips can be completed without the number of passengers in the car ever exceeding the capacity.\r
\r
**Worked example.** \`trips = [[2,1,5],[3,3,7]], capacity = 4\` returns \`false\` because the intervals overlap on stops \`3\` and \`4\`, so the car would need to carry \`5\` passengers there.\r
\r
**Approach 1 — Brute force**\r
\r
**Time:** \`O(n * range)\` | **Space:** \`O(range)\`\r
\r
Mark every stop covered by every trip and keep a running passenger count per location. It is correct, but it wastes work when a trip spans a long range.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public bool CarPoolingBruteForce(int[][] trips, int capacity)\r
    {\r
        int furthestStop = 0;\r
        foreach (int[] trip in trips)\r
            furthestStop = Math.Max(furthestStop, trip[2]);\r
\r
        int[] load = new int[furthestStop + 1];\r
\r
        foreach (int[] trip in trips)\r
        {\r
            int passengers = trip[0];\r
            int start = trip[1];\r
            int end = trip[2];\r
\r
            for (int stop = start; stop < end; stop++)\r
            {\r
                load[stop] += passengers;\r
                if (load[stop] > capacity)\r
                    return false;\r
            }\r
        }\r
\r
        return true;\r
    }\r
}\r
\`\`\`\r
\r
**Approach 2 — Difference array**\r
\r
**Time:** \`O(n + range)\` | **Space:** \`O(range)\`\r
\r
Instead of updating every stop in \`[start, end)\`, record only the boundary changes: pick-up adds passengers at \`start\`, drop-off removes them at \`end\`. A prefix sum reconstructs the load at each stop.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public bool CarPoolingDifferenceArray(int[][] trips, int capacity)\r
    {\r
        int furthestStop = 0;\r
        foreach (int[] trip in trips)\r
            furthestStop = Math.Max(furthestStop, trip[2]);\r
\r
        int[] diff = new int[furthestStop + 1];\r
\r
        foreach (int[] trip in trips)\r
        {\r
            int passengers = trip[0];\r
            int start = trip[1];\r
            int end = trip[2];\r
\r
            diff[start] += passengers;\r
            diff[end] -= passengers;\r
        }\r
\r
        int current = 0;\r
        for (int stop = 0; stop <= furthestStop; stop++)\r
        {\r
            current += diff[stop];\r
            if (current > capacity)\r
                return false;\r
        }\r
\r
        return true;\r
    }\r
}\r
\`\`\`\r
\r
**Approach 3 — Sweep line**\r
\r
**Time:** \`O(n log n)\` | **Space:** \`O(n)\`\r
\r
When coordinates are sparse or unbounded, keep only the boundary events, sort them, and scan from left to right. The critical tie-break is that drop-offs must happen before pick-ups at the same location.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public bool CarPooling(int[][] trips, int capacity)\r
    {\r
        var events = new List<(int Position, int Delta)>();\r
\r
        foreach (int[] trip in trips)\r
        {\r
            events.Add((trip[1], trip[0]));\r
            events.Add((trip[2], -trip[0]));\r
        }\r
\r
        events.Sort((a, b) =>\r
        {\r
            int byPosition = a.Position.CompareTo(b.Position);\r
            if (byPosition != 0)\r
                return byPosition;\r
            return a.Delta.CompareTo(b.Delta);\r
        });\r
\r
        int passengersOnBoard = 0;\r
        foreach (var currentEvent in events)\r
        {\r
            passengersOnBoard += currentEvent.Delta;\r
            if (passengersOnBoard > capacity)\r
                return false;\r
        }\r
\r
        return true;\r
    }\r
}\r
\`\`\`\r
\r
## Dynamic Programming\r
\r
### Burst Balloons\r
\r
**Problem.** Given an array \`nums\`, bursting balloon \`i\` earns \`nums[left] * nums[i] * nums[right]\`, where \`left\` and \`right\` are the current adjacent balloons after earlier bursts. Return the maximum coins obtainable by bursting all balloons. Virtual balloons with value \`1\` exist outside both ends.\r
\r
**Worked example.** \`nums = [3, 1, 5, 8]\` returns \`167\`.\r
\r
> [!KEY]\r
> The hard part is choosing the **last** balloon burst inside an interval, not the first. Once \`k\` is the last burst between two fixed boundaries, its neighbors are known, so the left and right subproblems become independent.\r
\r
**Approach 1 — Interval DP**\r
\r
**Time:** \`O(n^3)\` | **Space:** \`O(n^2)\`\r
\r
Pad the array with \`1\` at both ends and define \`dp[left, right]\` as the best answer for the open interval \`(left, right)\`. Then try every balloon \`last\` inside that interval as the final burst.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public int MaxCoins(int[] nums)\r
    {\r
        int n = nums.Length;\r
        int[] values = new int[n + 2];\r
        values[0] = 1;\r
        values[n + 1] = 1;\r
\r
        for (int i = 0; i < n; i++)\r
            values[i + 1] = nums[i];\r
\r
        int[,] dp = new int[n + 2, n + 2];\r
\r
        for (int length = 2; length < n + 2; length++)\r
        {\r
            for (int left = 0; left + length < n + 2; left++)\r
            {\r
                int right = left + length;\r
\r
                for (int last = left + 1; last < right; last++)\r
                {\r
                    int coins =\r
                        dp[left, last] +\r
                        dp[last, right] +\r
                        values[left] * values[last] * values[right];\r
\r
                    dp[left, right] = Math.Max(dp[left, right], coins);\r
                }\r
            }\r
        }\r
\r
        return dp[0, n + 1];\r
    }\r
}\r
\`\`\`\r
\r
### Regular Expression Matching\r
\r
**Problem.** Given a string \`s\` and a pattern \`p\` that supports \`.\` for any single character and \`*\` for zero or more occurrences of the previous character, determine whether \`p\` matches the entire string.\r
\r
**Worked example.** \`s = "aab", p = "c*a*b"\` returns \`true\`.\r
\r
**Approach 1 — Plain recursion**\r
\r
**Time:** \`O(2^(m + n))\` | **Space:** \`O(m + n)\`\r
\r
At each \`*\`, branch into two possibilities: use zero copies of the previous character, or consume one character from \`s\` and stay on the same pattern index.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public bool IsMatchRecursive(string s, string p)\r
    {\r
        return Match(0, 0);\r
\r
        bool Match(int i, int j)\r
        {\r
            if (j == p.Length)\r
                return i == s.Length;\r
\r
            bool firstMatches =\r
                i < s.Length &&\r
                (p[j] == s[i] || p[j] == '.');\r
\r
            if (j + 1 < p.Length && p[j + 1] == '*')\r
            {\r
                return Match(i, j + 2) ||\r
                       (firstMatches && Match(i + 1, j));\r
            }\r
\r
            return firstMatches && Match(i + 1, j + 1);\r
        }\r
    }\r
}\r
\`\`\`\r
\r
**Approach 2 — 2D DP**\r
\r
**Time:** \`O(m * n)\` | **Space:** \`O(m * n)\`\r
\r
Let \`dp[i, j]\` mean whether the first \`i\` characters of \`s\` match the first \`j\` characters of \`p\`. The \`*\` case either erases the previous token (\`x*\` used zero times) or consumes one matching character and stays in the same pattern column.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public bool IsMatch(string s, string p)\r
    {\r
        int m = s.Length;\r
        int n = p.Length;\r
        bool[,] dp = new bool[m + 1, n + 1];\r
        dp[0, 0] = true;\r
\r
        for (int j = 2; j <= n; j++)\r
        {\r
            if (p[j - 1] == '*')\r
                dp[0, j] = dp[0, j - 2];\r
        }\r
\r
        for (int i = 1; i <= m; i++)\r
        {\r
            for (int j = 1; j <= n; j++)\r
            {\r
                if (p[j - 1] != '*')\r
                {\r
                    if (p[j - 1] == s[i - 1] || p[j - 1] == '.')\r
                        dp[i, j] = dp[i - 1, j - 1];\r
                }\r
                else\r
                {\r
                    dp[i, j] = dp[i, j - 2];\r
\r
                    if (p[j - 2] == s[i - 1] || p[j - 2] == '.')\r
                        dp[i, j] = dp[i, j] || dp[i - 1, j];\r
                }\r
            }\r
        }\r
\r
        return dp[m, n];\r
    }\r
}\r
\`\`\`\r
\r
> [!NOTE]\r
> Wildcard matching with \`?\` and \`*\` uses the same grid idea, but its \`*\` means “any sequence”, so the transition becomes \`dp[i, j] = dp[i - 1, j] || dp[i, j - 1]\`.\r
\r
### Partition to K Equal Sum Subsets\r
\r
**Problem.** Given \`nums\` and an integer \`k\`, determine whether the array can be partitioned into \`k\` non-empty subsets whose sums are all equal.\r
\r
**Worked example.** \`nums = [4, 3, 2, 3, 5, 2, 1], k = 4\` returns \`true\` because the subsets can be \`[5], [1,4], [2,3], [2,3]\`.\r
\r
**Approach 1 — Backtracking with pruning**\r
\r
**Time:** \`O(k * 2^n)\` | **Space:** \`O(n)\`\r
\r
Sort in descending order so large numbers fail fast, fill one bucket at a time, and prune equivalent bucket states. If two buckets currently have the same load, trying the current number in both is redundant.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public bool CanPartitionKSubsetsBacktracking(int[] nums, int k)\r
    {\r
        int total = 0;\r
        foreach (int num in nums)\r
            total += num;\r
\r
        if (total % k != 0)\r
            return false;\r
\r
        int target = total / k;\r
        Array.Sort(nums);\r
        Array.Reverse(nums);\r
\r
        if (nums.Length == 0 || nums[0] > target)\r
            return false;\r
\r
        int[] buckets = new int[k];\r
        return Place(0);\r
\r
        bool Place(int index)\r
        {\r
            if (index == nums.Length)\r
                return true;\r
\r
            int value = nums[index];\r
            var seenLoads = new HashSet<int>();\r
\r
            for (int bucket = 0; bucket < k; bucket++)\r
            {\r
                if (buckets[bucket] + value > target)\r
                    continue;\r
\r
                if (!seenLoads.Add(buckets[bucket]))\r
                    continue;\r
\r
                buckets[bucket] += value;\r
                if (Place(index + 1))\r
                    return true;\r
                buckets[bucket] -= value;\r
\r
                if (buckets[bucket] == 0)\r
                    break;\r
            }\r
\r
            return false;\r
        }\r
    }\r
}\r
\`\`\`\r
\r
**Approach 2 — Bitmask DP**\r
\r
**Time:** \`O(2^n * n)\` | **Space:** \`O(2^n)\`\r
\r
Treat a subset of used elements as a bitmask. The remainder of the used sum modulo \`target\` tells you how full the current bucket is; once it returns to \`0\`, you just completed a bucket.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public bool CanPartitionKSubsets(int[] nums, int k)\r
    {\r
        int total = 0;\r
        foreach (int num in nums)\r
            total += num;\r
\r
        if (total % k != 0)\r
            return false;\r
\r
        int target = total / k;\r
        int n = nums.Length;\r
        int allMasks = 1 << n;\r
        bool[] reachable = new bool[allMasks];\r
        int[] remainder = new int[allMasks];\r
        reachable[0] = true;\r
\r
        for (int mask = 0; mask < allMasks; mask++)\r
        {\r
            if (!reachable[mask])\r
                continue;\r
\r
            for (int i = 0; i < n; i++)\r
            {\r
                if ((mask & (1 << i)) != 0)\r
                    continue;\r
\r
                if (remainder[mask] + nums[i] > target)\r
                    continue;\r
\r
                int nextMask = mask | (1 << i);\r
                reachable[nextMask] = true;\r
                remainder[nextMask] = (remainder[mask] + nums[i]) % target;\r
            }\r
        }\r
\r
        return reachable[allMasks - 1];\r
    }\r
}\r
\`\`\`\r
\r
This is the same subset-state shape that powers small-\`n\` Traveling Salesman, except TSP adds one more dimension such as \`dp[mask][last]\` to remember where the route ends.\r
\r
## Graphs\r
\r
### Cheapest Flights Within K Stops\r
\r
**Problem.** Given \`n\` cities, a list of directed flights \`[from, to, price]\`, a source \`src\`, a destination \`dst\`, and a limit \`k\`, return the cheapest price from \`src\` to \`dst\` using at most \`k\` stops. Return \`-1\` if no such route exists.\r
\r
**Worked example.** \`n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1\` returns \`700\`.\r
\r
**Tempting but wrong — Plain Dijkstra**\r
\r
**Time:** \`O(E log V)\` | **Space:** \`O(V)\` | **Status:** incorrect for this problem\r
\r
Cost-only Dijkstra loses information. A path that is slightly more expensive so far but uses fewer stops can still be the only valid way to stay within the stop budget later, so the state must include the number of edges or stops used.\r
\r
**Approach 1 — Bellman-Ford for \`k + 1\` rounds**\r
\r
**Time:** \`O(k * E)\` | **Space:** \`O(V)\`\r
\r
After \`i\` full edge-relaxation rounds, you know the cheapest price using at most \`i\` edges. The copy of the previous round is essential so one round cannot chain newly relaxed edges together.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public int FindCheapestPriceBellmanFord(int n, int[][] flights, int src, int dst, int k)\r
    {\r
        const int Infinity = int.MaxValue / 4;\r
        int[] distance = new int[n];\r
        Array.Fill(distance, Infinity);\r
        distance[src] = 0;\r
\r
        for (int round = 0; round <= k; round++)\r
        {\r
            int[] previous = (int[])distance.Clone();\r
\r
            foreach (int[] flight in flights)\r
            {\r
                int from = flight[0];\r
                int to = flight[1];\r
                int price = flight[2];\r
\r
                if (previous[from] == Infinity)\r
                    continue;\r
\r
                distance[to] = Math.Min(distance[to], previous[from] + price);\r
            }\r
        }\r
\r
        return distance[dst] == Infinity ? -1 : distance[dst];\r
    }\r
}\r
\`\`\`\r
\r
**Approach 2 — Dijkstra on \`(city, edgesUsed)\`**\r
\r
**Time:** \`O(E * k * log(E * k))\` | **Space:** \`O(V * k)\`\r
\r
This is the heap-based version of the same idea: the state is not just the city, but the city plus how many edges you spent to get there.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public int FindCheapestPrice(int n, int[][] flights, int src, int dst, int k)\r
    {\r
        var graph = new List<(int To, int Price)>[n];\r
        for (int i = 0; i < n; i++)\r
            graph[i] = new List<(int To, int Price)>();\r
\r
        foreach (int[] flight in flights)\r
            graph[flight[0]].Add((flight[1], flight[2]));\r
\r
        int maxEdges = k + 1;\r
        int[,] best = new int[n, maxEdges + 1];\r
        const int Infinity = int.MaxValue / 4;\r
\r
        for (int city = 0; city < n; city++)\r
        {\r
            for (int edges = 0; edges <= maxEdges; edges++)\r
                best[city, edges] = Infinity;\r
        }\r
\r
        var pq = new PriorityQueue<(int City, int EdgesUsed, int Cost), int>();\r
        best[src, 0] = 0;\r
        pq.Enqueue((src, 0, 0), 0);\r
\r
        while (pq.Count > 0)\r
        {\r
            var state = pq.Dequeue();\r
            int city = state.City;\r
            int edgesUsed = state.EdgesUsed;\r
            int cost = state.Cost;\r
\r
            if (cost != best[city, edgesUsed])\r
                continue;\r
\r
            if (city == dst)\r
                return cost;\r
\r
            if (edgesUsed == maxEdges)\r
                continue;\r
\r
            foreach (var edge in graph[city])\r
            {\r
                int nextEdges = edgesUsed + 1;\r
                int nextCost = cost + edge.Price;\r
\r
                if (nextCost < best[edge.To, nextEdges])\r
                {\r
                    best[edge.To, nextEdges] = nextCost;\r
                    pq.Enqueue((edge.To, nextEdges, nextCost), nextCost);\r
                }\r
            }\r
        }\r
\r
        return -1;\r
    }\r
}\r
\`\`\`\r
\r
### Critical Connections in a Network\r
\r
**Problem.** Given a connected undirected graph, return all bridges: edges whose removal disconnects the graph.\r
\r
**Worked example.** \`n = 4, connections = [[0,1],[1,2],[2,0],[1,3]]\` returns \`[[1,3]]\`.\r
\r
**Approach 1 — Brute force**\r
\r
**Time:** \`O(E * (V + E))\` | **Space:** \`O(V + E)\`\r
\r
Remove each edge in turn and run a DFS. If the graph is no longer fully reachable, that edge was a bridge.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public IList<IList<int>> CriticalConnectionsBruteForce(int n, IList<IList<int>> connections)\r
    {\r
        var graph = new List<(int To, int Id)>[n];\r
        for (int i = 0; i < n; i++)\r
            graph[i] = new List<(int To, int Id)>();\r
\r
        for (int id = 0; id < connections.Count; id++)\r
        {\r
            int u = connections[id][0];\r
            int v = connections[id][1];\r
            graph[u].Add((v, id));\r
            graph[v].Add((u, id));\r
        }\r
\r
        var bridges = new List<IList<int>>();\r
\r
        for (int blockedEdge = 0; blockedEdge < connections.Count; blockedEdge++)\r
        {\r
            bool[] visited = new bool[n];\r
            int seen = 0;\r
\r
            void Dfs(int node)\r
            {\r
                visited[node] = true;\r
                seen++;\r
\r
                foreach (var edge in graph[node])\r
                {\r
                    if (edge.Id == blockedEdge || visited[edge.To])\r
                        continue;\r
\r
                    Dfs(edge.To);\r
                }\r
            }\r
\r
            Dfs(0);\r
\r
            if (seen != n)\r
            {\r
                bridges.Add(new List<int>\r
                {\r
                    connections[blockedEdge][0],\r
                    connections[blockedEdge][1]\r
                });\r
            }\r
        }\r
\r
        return bridges;\r
    }\r
}\r
\`\`\`\r
\r
**Approach 2 — Tarjan low-link algorithm**\r
\r
**Time:** \`O(V + E)\` | **Space:** \`O(V + E)\`\r
\r
Let \`discovery[node]\` be the DFS discovery time and \`low[node]\` be the earliest discovery time reachable from that subtree using at most one back edge. If \`low[child] > discovery[node]\`, the edge to that child is a bridge.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public IList<IList<int>> CriticalConnections(int n, IList<IList<int>> connections)\r
    {\r
        var graph = new List<(int To, int Id)>[n];\r
        for (int i = 0; i < n; i++)\r
            graph[i] = new List<(int To, int Id)>();\r
\r
        for (int id = 0; id < connections.Count; id++)\r
        {\r
            int u = connections[id][0];\r
            int v = connections[id][1];\r
            graph[u].Add((v, id));\r
            graph[v].Add((u, id));\r
        }\r
\r
        int[] discovery = new int[n];\r
        int[] low = new int[n];\r
        Array.Fill(discovery, -1);\r
        int timer = 0;\r
        var bridges = new List<IList<int>>();\r
\r
        void Dfs(int node, int parentEdge)\r
        {\r
            discovery[node] = low[node] = timer++;\r
\r
            foreach (var edge in graph[node])\r
            {\r
                if (edge.Id == parentEdge)\r
                    continue;\r
\r
                if (discovery[edge.To] != -1)\r
                {\r
                    low[node] = Math.Min(low[node], discovery[edge.To]);\r
                }\r
                else\r
                {\r
                    Dfs(edge.To, edge.Id);\r
                    low[node] = Math.Min(low[node], low[edge.To]);\r
\r
                    if (low[edge.To] > discovery[node])\r
                        bridges.Add(new List<int> { node, edge.To });\r
                }\r
            }\r
        }\r
\r
        for (int node = 0; node < n; node++)\r
        {\r
            if (discovery[node] == -1)\r
                Dfs(node, -1);\r
        }\r
\r
        return bridges;\r
    }\r
}\r
\`\`\`\r
\r
Related low-link rules are worth remembering: articulation points use \`low[child] >= discovery[node]\`, and directed strongly connected components use Tarjan or Kosaraju rather than the bridge test above.\r
\r
### Reconstruct Itinerary\r
\r
**Problem.** Given airline tickets \`[from, to]\`, reconstruct the itinerary that starts at \`"JFK"\` and uses every ticket exactly once. If multiple valid itineraries exist, return the lexicographically smallest one.\r
\r
**Worked example.** \`tickets = [["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]\` returns \`["JFK","MUC","LHR","SFO","SJC"]\`.\r
\r
**Approach 1 — Backtracking**\r
\r
**Time:** \`O(E!)\` | **Space:** \`O(E)\`\r
\r
Try every unused outgoing ticket in lexicographic order and backtrack on failure. It is conceptually simple and a good first explanation in an interview.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public IList<string> FindItineraryBacktracking(IList<IList<string>> tickets)\r
    {\r
        var sortedTickets = new List<(string From, string To)>();\r
        foreach (IList<string> ticket in tickets)\r
            sortedTickets.Add((ticket[0], ticket[1]));\r
\r
        sortedTickets.Sort((a, b) =>\r
        {\r
            int byFrom = string.CompareOrdinal(a.From, b.From);\r
            if (byFrom != 0)\r
                return byFrom;\r
            return string.CompareOrdinal(a.To, b.To);\r
        });\r
\r
        bool[] used = new bool[sortedTickets.Count];\r
        var route = new List<string> { "JFK" };\r
\r
        bool Backtrack(string airport, int usedCount)\r
        {\r
            if (usedCount == sortedTickets.Count)\r
                return true;\r
\r
            for (int i = 0; i < sortedTickets.Count; i++)\r
            {\r
                var ticket = sortedTickets[i];\r
                if (used[i] || ticket.From != airport)\r
                    continue;\r
\r
                used[i] = true;\r
                route.Add(ticket.To);\r
\r
                if (Backtrack(ticket.To, usedCount + 1))\r
                    return true;\r
\r
                route.RemoveAt(route.Count - 1);\r
                used[i] = false;\r
            }\r
\r
            return false;\r
        }\r
\r
        Backtrack("JFK", 0);\r
        return route;\r
    }\r
}\r
\`\`\`\r
\r
**Approach 2 — Hierholzer's algorithm**\r
\r
**Time:** \`O(E log E)\` | **Space:** \`O(E)\`\r
\r
This is an Eulerian-path problem. Always consume the smallest outgoing edge first, but append airports to the answer in post-order, after their outgoing edges have been exhausted.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public IList<string> FindItinerary(IList<IList<string>> tickets)\r
    {\r
        var graph = new Dictionary<string, PriorityQueue<string, string>>(StringComparer.Ordinal);\r
\r
        foreach (IList<string> ticket in tickets)\r
        {\r
            string from = ticket[0];\r
            string to = ticket[1];\r
\r
            if (!graph.TryGetValue(from, out PriorityQueue<string, string> heap))\r
            {\r
                heap = new PriorityQueue<string, string>();\r
                graph[from] = heap;\r
            }\r
\r
            heap.Enqueue(to, to);\r
        }\r
\r
        var route = new List<string>();\r
\r
        void Dfs(string airport)\r
        {\r
            if (graph.TryGetValue(airport, out PriorityQueue<string, string> heap))\r
            {\r
                while (heap.Count > 0)\r
                {\r
                    string next = heap.Dequeue();\r
                    Dfs(next);\r
                }\r
            }\r
\r
            route.Add(airport);\r
        }\r
\r
        Dfs("JFK");\r
        route.Reverse();\r
        return route;\r
    }\r
}\r
\`\`\`\r
\r
An Eulerian path exists when the graph is connected and at most one node has \`outdegree - indegree = 1\` and at most one has \`indegree - outdegree = 1\`. This problem guarantees a valid answer, so the real trick is recognizing the traversal shape.\r
\r
## Greedy\r
\r
### Partition Labels\r
\r
**Problem.** Partition a string into as many parts as possible so that each character appears in at most one part, then return the partition sizes.\r
\r
**Worked example.** \`s = "ababcbacadefegdehijhklij"\` returns \`[9, 7, 8]\`.\r
\r
**Approach 1 — Brute force**\r
\r
**Time:** \`O(n^2)\` | **Space:** \`O(1)\`\r
\r
Build each partition by repeatedly scanning the rest of the string to find the last occurrence of every character currently inside the partition.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public IList<int> PartitionLabelsBruteForce(string s)\r
    {\r
        var result = new List<int>();\r
        int start = 0;\r
\r
        while (start < s.Length)\r
        {\r
            int end = FindLastIndex(s, s[start]);\r
            int i = start;\r
\r
            while (i < end)\r
            {\r
                end = Math.Max(end, FindLastIndex(s, s[i]));\r
                i++;\r
            }\r
\r
            result.Add(end - start + 1);\r
            start = end + 1;\r
        }\r
\r
        return result;\r
    }\r
\r
    private static int FindLastIndex(string s, char target)\r
    {\r
        for (int i = s.Length - 1; i >= 0; i--)\r
        {\r
            if (s[i] == target)\r
                return i;\r
        }\r
\r
        return -1;\r
    }\r
}\r
\`\`\`\r
\r
**Approach 2 — Greedy**\r
\r
**Time:** \`O(n)\` | **Space:** \`O(1)\`\r
\r
Precompute the last index of each character. As you scan the string, keep extending the current partition's right boundary to the farthest last occurrence seen so far. When your index reaches that boundary, the partition is complete.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public IList<int> PartitionLabels(string s)\r
    {\r
        int[] last = new int[26];\r
\r
        for (int i = 0; i < s.Length; i++)\r
            last[s[i] - 'a'] = i;\r
\r
        var result = new List<int>();\r
        int start = 0;\r
        int end = 0;\r
\r
        for (int i = 0; i < s.Length; i++)\r
        {\r
            end = Math.Max(end, last[s[i] - 'a']);\r
\r
            if (i == end)\r
            {\r
                result.Add(end - start + 1);\r
                start = i + 1;\r
            }\r
        }\r
\r
        return result;\r
    }\r
}\r
\`\`\`\r
\r
## Backtracking\r
\r
### Letter Combinations of a Phone Number\r
\r
**Problem.** Given a string of digits from \`2\` to \`9\`, return all possible letter combinations from the classic telephone keypad mapping.\r
\r
**Worked example.** \`digits = "23"\` returns \`["ad","ae","af","bd","be","bf","cd","ce","cf"]\`.\r
\r
**Approach 1 — Backtracking**\r
\r
**Time:** \`O(4^n)\` | **Space:** \`O(n)\`\r
\r
Pick one character for each digit, recurse to the next digit, and undo nothing except the current position in the temporary output buffer.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public IList<string> LetterCombinations(string digits)\r
    {\r
        if (string.IsNullOrEmpty(digits))\r
            return new List<string>();\r
\r
        string[] mapping =\r
        {\r
            "",\r
            "",\r
            "abc",\r
            "def",\r
            "ghi",\r
            "jkl",\r
            "mno",\r
            "pqrs",\r
            "tuv",\r
            "wxyz"\r
        };\r
\r
        var result = new List<string>();\r
        char[] current = new char[digits.Length];\r
\r
        void Backtrack(int index)\r
        {\r
            if (index == digits.Length)\r
            {\r
                result.Add(new string(current));\r
                return;\r
            }\r
\r
            string letters = mapping[digits[index] - '0'];\r
            foreach (char letter in letters)\r
            {\r
                current[index] = letter;\r
                Backtrack(index + 1);\r
            }\r
        }\r
\r
        Backtrack(0);\r
        return result;\r
    }\r
}\r
\`\`\`\r
\r
### Palindrome Partitioning\r
\r
**Problem.** Partition a string so every piece is a palindrome, and return all valid partitions.\r
\r
**Worked example.** \`s = "aab"\` returns \`[["a","a","b"],["aa","b"]]\`.\r
\r
**Approach 1 — Backtracking**\r
\r
**Time:** \`O(n * 2^n)\` | **Space:** \`O(n)\`\r
\r
At each start index, try every possible end index, keep only palindromic substrings, recurse, and then remove the last chosen substring.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public IList<IList<string>> PartitionBruteForce(string s)\r
    {\r
        var result = new List<IList<string>>();\r
        var current = new List<string>();\r
\r
        void Backtrack(int start)\r
        {\r
            if (start == s.Length)\r
            {\r
                result.Add(new List<string>(current));\r
                return;\r
            }\r
\r
            for (int end = start; end < s.Length; end++)\r
            {\r
                if (!IsPalindrome(s, start, end))\r
                    continue;\r
\r
                current.Add(s.Substring(start, end - start + 1));\r
                Backtrack(end + 1);\r
                current.RemoveAt(current.Count - 1);\r
            }\r
        }\r
\r
        Backtrack(0);\r
        return result;\r
    }\r
\r
    private static bool IsPalindrome(string s, int left, int right)\r
    {\r
        while (left < right)\r
        {\r
            if (s[left] != s[right])\r
                return false;\r
\r
            left++;\r
            right--;\r
        }\r
\r
        return true;\r
    }\r
}\r
\`\`\`\r
\r
**Approach 2 — Backtracking plus palindrome DP precompute**\r
\r
**Time:** \`O(n * 2^n)\` | **Space:** \`O(n^2)\`\r
\r
The search tree is the same, but now each palindrome check is \`O(1)\` because \`isPalindrome[left, right]\` is prefilled by increasing substring length.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public IList<IList<string>> Partition(string s)\r
    {\r
        int n = s.Length;\r
        bool[,] isPalindrome = new bool[n, n];\r
\r
        for (int length = 1; length <= n; length++)\r
        {\r
            for (int left = 0; left + length - 1 < n; left++)\r
            {\r
                int right = left + length - 1;\r
\r
                if (s[left] == s[right] &&\r
                    (length < 3 || isPalindrome[left + 1, right - 1]))\r
                {\r
                    isPalindrome[left, right] = true;\r
                }\r
            }\r
        }\r
\r
        var result = new List<IList<string>>();\r
        var current = new List<string>();\r
\r
        void Backtrack(int start)\r
        {\r
            if (start == n)\r
            {\r
                result.Add(new List<string>(current));\r
                return;\r
            }\r
\r
            for (int end = start; end < n; end++)\r
            {\r
                if (!isPalindrome[start, end])\r
                    continue;\r
\r
                current.Add(s.Substring(start, end - start + 1));\r
                Backtrack(end + 1);\r
                current.RemoveAt(current.Count - 1);\r
            }\r
        }\r
\r
        Backtrack(0);\r
        return result;\r
    }\r
}\r
\`\`\`\r
\r
The minimum-cuts variant flips this into pure DP: once you have the palindrome table, \`cuts[i]\` becomes the minimum cuts needed for the prefix ending at \`i\`.\r
\r
## Heap\r
\r
### Meeting Rooms III\r
\r
**Problem.** You are given \`n\` rooms and a list of meetings \`[start, end]\`. A meeting takes the lowest-numbered free room; if none is free, it waits until one becomes available while keeping the same duration. Return the room that hosts the most meetings, breaking ties toward the smaller room number.\r
\r
**Worked example.** \`n = 2, meetings = [[0,10],[1,5],[2,7],[3,4]]\` returns \`0\`.\r
\r
**Approach 1 — Two heaps**\r
\r
**Time:** \`O(n log n)\` | **Space:** \`O(n)\`\r
\r
Maintain one min-heap of available room numbers and one min-heap of busy rooms ordered by \`(endTime, roomNumber)\`. Free any rooms whose meeting ended before the next start time, then either assign directly or delay the meeting onto the earliest room that frees up.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public int MostBooked(int n, int[][] meetings)\r
    {\r
        Array.Sort(meetings, (a, b) => a[0].CompareTo(b[0]));\r
\r
        var availableRooms = new PriorityQueue<int, int>();\r
        for (int room = 0; room < n; room++)\r
            availableRooms.Enqueue(room, room);\r
\r
        var busyRooms =\r
            new PriorityQueue<(long EndTime, int RoomNumber), (long EndTime, int RoomNumber)>();\r
\r
        long[] count = new long[n];\r
\r
        foreach (int[] meeting in meetings)\r
        {\r
            long start = meeting[0];\r
            long end = meeting[1];\r
            long duration = end - start;\r
\r
            while (busyRooms.Count > 0 && busyRooms.Peek().EndTime <= start)\r
            {\r
                var freed = busyRooms.Dequeue();\r
                availableRooms.Enqueue(freed.RoomNumber, freed.RoomNumber);\r
            }\r
\r
            int roomNumber;\r
            long finishTime;\r
\r
            if (availableRooms.Count > 0)\r
            {\r
                roomNumber = availableRooms.Dequeue();\r
                finishTime = end;\r
            }\r
            else\r
            {\r
                var nextFree = busyRooms.Dequeue();\r
                roomNumber = nextFree.RoomNumber;\r
                finishTime = nextFree.EndTime + duration;\r
            }\r
\r
            count[roomNumber]++;\r
            busyRooms.Enqueue((finishTime, roomNumber), (finishTime, roomNumber));\r
        }\r
\r
        int bestRoom = 0;\r
        for (int room = 1; room < n; room++)\r
        {\r
            if (count[room] > count[bestRoom])\r
                bestRoom = room;\r
        }\r
\r
        return bestRoom;\r
    }\r
}\r
\`\`\`\r
\r
## Linked List\r
\r
### LFU Cache Design\r
\r
**Problem.** Design a cache with \`Get\` and \`Put\` in \`O(1)\` average time. On eviction, remove the least frequently used key; if multiple keys share that frequency, evict the least recently used among them.\r
\r
**Worked example.** After \`Put(1, 1), Put(2, 2), Get(1), Put(3, 3)\` in a capacity-\`2\` cache, key \`2\` is evicted because keys \`1\` and \`2\` were tied at first, then \`Get(1)\` raised key \`1\`'s frequency.\r
\r
**Approach 1 — Hash maps plus frequency buckets**\r
\r
**Time:** \`O(1)\` average for \`Get\` and \`Put\` | **Space:** \`O(capacity)\`\r
\r
Map each key to a node, and map each frequency to a doubly linked list of nodes ordered by recency. \`minFrequency\` always points at the current eviction bucket.\r
\r
\`\`\`csharp\r
public class LFUCache\r
{\r
    private sealed class Node\r
    {\r
        public int Key;\r
        public int Value;\r
        public int Frequency;\r
        public Node Prev;\r
        public Node Next;\r
\r
        public Node(int key, int value)\r
        {\r
            Key = key;\r
            Value = value;\r
            Frequency = 1;\r
        }\r
    }\r
\r
    private sealed class DoublyLinkedList\r
    {\r
        private readonly Node head;\r
        private readonly Node tail;\r
\r
        public int Count { get; private set; }\r
\r
        public DoublyLinkedList()\r
        {\r
            head = new Node(-1, -1);\r
            tail = new Node(-1, -1);\r
            head.Next = tail;\r
            tail.Prev = head;\r
        }\r
\r
        public void AddFirst(Node node)\r
        {\r
            node.Next = head.Next;\r
            node.Prev = head;\r
            head.Next.Prev = node;\r
            head.Next = node;\r
            Count++;\r
        }\r
\r
        public void Remove(Node node)\r
        {\r
            node.Prev.Next = node.Next;\r
            node.Next.Prev = node.Prev;\r
            Count--;\r
        }\r
\r
        public Node RemoveLast()\r
        {\r
            Node node = tail.Prev;\r
            Remove(node);\r
            return node;\r
        }\r
    }\r
\r
    private readonly int capacity;\r
    private int minFrequency;\r
    private readonly Dictionary<int, Node> nodesByKey;\r
    private readonly Dictionary<int, DoublyLinkedList> listsByFrequency;\r
\r
    public LFUCache(int capacity)\r
    {\r
        this.capacity = capacity;\r
        minFrequency = 0;\r
        nodesByKey = new Dictionary<int, Node>();\r
        listsByFrequency = new Dictionary<int, DoublyLinkedList>();\r
    }\r
\r
    public int Get(int key)\r
    {\r
        if (!nodesByKey.TryGetValue(key, out Node node))\r
            return -1;\r
\r
        Touch(node);\r
        return node.Value;\r
    }\r
\r
    public void Put(int key, int value)\r
    {\r
        if (capacity == 0)\r
            return;\r
\r
        if (nodesByKey.TryGetValue(key, out Node existing))\r
        {\r
            existing.Value = value;\r
            Touch(existing);\r
            return;\r
        }\r
\r
        if (nodesByKey.Count == capacity)\r
        {\r
            DoublyLinkedList leastUsed = listsByFrequency[minFrequency];\r
            Node evicted = leastUsed.RemoveLast();\r
            nodesByKey.Remove(evicted.Key);\r
\r
            if (leastUsed.Count == 0)\r
                listsByFrequency.Remove(minFrequency);\r
        }\r
\r
        Node node = new Node(key, value);\r
        nodesByKey[key] = node;\r
\r
        if (!listsByFrequency.TryGetValue(1, out DoublyLinkedList list))\r
        {\r
            list = new DoublyLinkedList();\r
            listsByFrequency[1] = list;\r
        }\r
\r
        list.AddFirst(node);\r
        minFrequency = 1;\r
    }\r
\r
    private void Touch(Node node)\r
    {\r
        int oldFrequency = node.Frequency;\r
        DoublyLinkedList oldList = listsByFrequency[oldFrequency];\r
        oldList.Remove(node);\r
\r
        if (oldList.Count == 0)\r
        {\r
            listsByFrequency.Remove(oldFrequency);\r
            if (minFrequency == oldFrequency)\r
                minFrequency++;\r
        }\r
\r
        node.Frequency++;\r
\r
        if (!listsByFrequency.TryGetValue(node.Frequency, out DoublyLinkedList newList))\r
        {\r
            newList = new DoublyLinkedList();\r
            listsByFrequency[node.Frequency] = newList;\r
        }\r
\r
        newList.AddFirst(node);\r
    }\r
}\r
\`\`\`\r
\r
The LRU tie-break works because every frequency bucket is itself ordered by recency: touches move a node to the front of the next frequency list, and eviction removes from the tail of the minimum-frequency list.\r
\r
## Binary Search\r
\r
### Median of Two Sorted Arrays\r
\r
**Problem.** Given two sorted arrays \`nums1\` and \`nums2\`, return the median of the combined sorted order.\r
\r
**Worked example.** \`nums1 = [1, 3], nums2 = [2]\` returns \`2.0\`.\r
\r
**Approach 1 — Merge and sort**\r
\r
**Time:** \`O((m + n) log(m + n))\` | **Space:** \`O(m + n)\`\r
\r
This is the straightforward baseline: concatenate, sort, and take the middle element or average of the two middle elements.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public double FindMedianSortedArraysBruteForce(int[] nums1, int[] nums2)\r
    {\r
        int[] merged = new int[nums1.Length + nums2.Length];\r
        Array.Copy(nums1, 0, merged, 0, nums1.Length);\r
        Array.Copy(nums2, 0, merged, nums1.Length, nums2.Length);\r
        Array.Sort(merged);\r
\r
        int n = merged.Length;\r
        if ((n & 1) == 1)\r
            return merged[n / 2];\r
\r
        return (merged[n / 2 - 1] + merged[n / 2]) / 2.0;\r
    }\r
}\r
\`\`\`\r
\r
**Approach 2 — Two pointers**\r
\r
**Time:** \`O(m + n)\` | **Space:** \`O(1)\`\r
\r
You do not need the whole merged array. Advance two pointers just far enough to reach the median position, remembering the previous and current selected values.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public double FindMedianSortedArraysTwoPointers(int[] nums1, int[] nums2)\r
    {\r
        int total = nums1.Length + nums2.Length;\r
        int target = total / 2;\r
        int i = 0;\r
        int j = 0;\r
        int previous = 0;\r
        int current = 0;\r
\r
        for (int count = 0; count <= target; count++)\r
        {\r
            previous = current;\r
\r
            if (i < nums1.Length &&\r
                (j >= nums2.Length || nums1[i] <= nums2[j]))\r
            {\r
                current = nums1[i];\r
                i++;\r
            }\r
            else\r
            {\r
                current = nums2[j];\r
                j++;\r
            }\r
        }\r
\r
        if ((total & 1) == 1)\r
            return current;\r
\r
        return (previous + current) / 2.0;\r
    }\r
}\r
\`\`\`\r
\r
**Approach 3 — Binary search partition**\r
\r
**Time:** \`O(log(min(m, n)))\` | **Space:** \`O(1)\`\r
\r
Binary-search the cut position in the smaller array. The correct partition is the one where every value on the left side is \`<=\` every value on the right side.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public double FindMedianSortedArrays(int[] nums1, int[] nums2)\r
    {\r
        if (nums1.Length > nums2.Length)\r
            return FindMedianSortedArrays(nums2, nums1);\r
\r
        int m = nums1.Length;\r
        int n = nums2.Length;\r
        int left = 0;\r
        int right = m;\r
        int leftSize = (m + n + 1) / 2;\r
\r
        while (left <= right)\r
        {\r
            int i = left + (right - left) / 2;\r
            int j = leftSize - i;\r
\r
            int nums1Left = i == 0 ? int.MinValue : nums1[i - 1];\r
            int nums1Right = i == m ? int.MaxValue : nums1[i];\r
            int nums2Left = j == 0 ? int.MinValue : nums2[j - 1];\r
            int nums2Right = j == n ? int.MaxValue : nums2[j];\r
\r
            if (nums1Left <= nums2Right && nums2Left <= nums1Right)\r
            {\r
                if (((m + n) & 1) == 1)\r
                    return Math.Max(nums1Left, nums2Left);\r
\r
                int leftMax = Math.Max(nums1Left, nums2Left);\r
                int rightMin = Math.Min(nums1Right, nums2Right);\r
                return (leftMax + (double)rightMin) / 2.0;\r
            }\r
\r
            if (nums1Left > nums2Right)\r
                right = i - 1;\r
            else\r
                left = i + 1;\r
        }\r
\r
        throw new InvalidOperationException("Input arrays must be sorted.");\r
    }\r
}\r
\`\`\`\r
\r
### Split Array Largest Sum\r
\r
**Problem.** Given a non-negative array \`nums\` and an integer \`m\`, split the array into \`m\` non-empty contiguous subarrays while minimizing the largest subarray sum.\r
\r
**Worked example.** \`nums = [7, 2, 5, 10, 8], m = 2\` returns \`18\`, produced by splitting as \`[7,2,5]\` and \`[10,8]\`.\r
\r
**Approach 1 — Brute force**\r
\r
**Time:** \`O(n^m)\` | **Space:** \`O(1)\` ignoring recursion stack\r
\r
Try every set of split points, compute the largest piece sum for that split, and keep the minimum over all valid choices.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public int SplitArrayBruteForce(int[] nums, int m)\r
    {\r
        long[] prefix = new long[nums.Length + 1];\r
        for (int i = 0; i < nums.Length; i++)\r
            prefix[i + 1] = prefix[i] + nums[i];\r
\r
        return (int)Search(0, m);\r
\r
        long Search(int start, int groupsRemaining)\r
        {\r
            if (groupsRemaining == 1)\r
                return prefix[nums.Length] - prefix[start];\r
\r
            long best = long.MaxValue;\r
\r
            for (int end = start; end <= nums.Length - groupsRemaining; end++)\r
            {\r
                long leftSum = prefix[end + 1] - prefix[start];\r
                long rightBest = Search(end + 1, groupsRemaining - 1);\r
                long candidate = Math.Max(leftSum, rightBest);\r
                best = Math.Min(best, candidate);\r
            }\r
\r
            return best;\r
        }\r
    }\r
}\r
\`\`\`\r
\r
**Approach 2 — DP over prefix length and group count**\r
\r
**Time:** \`O(n^2 * m)\` | **Space:** \`O(n * m)\`\r
\r
Let \`dp[i, groups]\` be the minimum possible largest subarray sum when splitting the first \`i\` numbers into \`groups\` pieces. The last split point tries every \`split < i\`.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public int SplitArrayDp(int[] nums, int m)\r
    {\r
        int n = nums.Length;\r
        long[] prefix = new long[n + 1];\r
        for (int i = 0; i < n; i++)\r
            prefix[i + 1] = prefix[i] + nums[i];\r
\r
        long[,] dp = new long[n + 1, m + 1];\r
        long infinity = long.MaxValue / 4;\r
\r
        for (int i = 0; i <= n; i++)\r
        {\r
            for (int groups = 0; groups <= m; groups++)\r
                dp[i, groups] = infinity;\r
        }\r
\r
        dp[0, 0] = 0;\r
\r
        for (int i = 1; i <= n; i++)\r
        {\r
            for (int groups = 1; groups <= Math.Min(i, m); groups++)\r
            {\r
                for (int split = 0; split < i; split++)\r
                {\r
                    if (dp[split, groups - 1] == infinity)\r
                        continue;\r
\r
                    long largest =\r
                        Math.Max(dp[split, groups - 1], prefix[i] - prefix[split]);\r
\r
                    dp[i, groups] = Math.Min(dp[i, groups], largest);\r
                }\r
            }\r
        }\r
\r
        return (int)dp[n, m];\r
    }\r
}\r
\`\`\`\r
\r
> [!WARNING]\r
> In binary-search-on-answer problems, search the answer range from \`max(nums)\` to \`sum(nums)\`. Starting lower than the largest element makes the predicate meaningless, and returning \`right\` after a lower-bound search is the classic off-by-one mistake.\r
\r
**Approach 3 — Binary search on the answer**\r
\r
**Time:** \`O(n log(sum(nums)))\` | **Space:** \`O(1)\`\r
\r
If you guess a maximum allowed subarray sum \`mid\`, you can greedily count how many groups are required. That count is monotonic: larger \`mid\` never needs more groups, so binary search applies.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public int SplitArray(int[] nums, int m)\r
    {\r
        long left = 0;\r
        long right = 0;\r
\r
        foreach (int num in nums)\r
        {\r
            left = Math.Max(left, num);\r
            right += num;\r
        }\r
\r
        while (left < right)\r
        {\r
            long mid = left + (right - left) / 2;\r
\r
            if (CountGroups(nums, mid) <= m)\r
                right = mid;\r
            else\r
                left = mid + 1;\r
        }\r
\r
        return (int)left;\r
    }\r
\r
    private static int CountGroups(int[] nums, long maxAllowed)\r
    {\r
        int groups = 1;\r
        long currentSum = 0;\r
\r
        foreach (int num in nums)\r
        {\r
            if (currentSum + num > maxAllowed)\r
            {\r
                groups++;\r
                currentSum = 0;\r
            }\r
\r
            currentSum += num;\r
        }\r
\r
        return groups;\r
    }\r
}\r
\`\`\`\r
\r
### Count of Smaller Numbers After Self\r
\r
**Problem.** Given \`nums\`, return an array \`counts\` where \`counts[i]\` is the number of elements to the right of \`nums[i]\` that are smaller than it.\r
\r
**Worked example.** \`nums = [5, 2, 6, 1]\` returns \`[2, 1, 1, 0]\`.\r
\r
**Approach 1 — Brute force**\r
\r
**Time:** \`O(n^2)\` | **Space:** \`O(1)\`\r
\r
For each index, scan every later value and count how many are smaller.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public IList<int> CountSmallerBruteForce(int[] nums)\r
    {\r
        int n = nums.Length;\r
        int[] counts = new int[n];\r
\r
        for (int i = 0; i < n; i++)\r
        {\r
            for (int j = i + 1; j < n; j++)\r
            {\r
                if (nums[j] < nums[i])\r
                    counts[i]++;\r
            }\r
        }\r
\r
        return counts;\r
    }\r
}\r
\`\`\`\r
\r
**Approach 2 — Merge sort counting**\r
\r
**Time:** \`O(n log n)\` | **Space:** \`O(n)\`\r
\r
Sort indices rather than values. Every time a right-half element is written before a left-half element during merge, it contributes one smaller element to every unmerged left index.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public IList<int> CountSmaller(int[] nums)\r
    {\r
        int n = nums.Length;\r
        int[] counts = new int[n];\r
        int[] indices = new int[n];\r
        int[] temp = new int[n];\r
\r
        for (int i = 0; i < n; i++)\r
            indices[i] = i;\r
\r
        MergeSort(0, n - 1);\r
        return counts;\r
\r
        void MergeSort(int left, int right)\r
        {\r
            if (left >= right)\r
                return;\r
\r
            int mid = left + (right - left) / 2;\r
            MergeSort(left, mid);\r
            MergeSort(mid + 1, right);\r
            Merge(left, mid, right);\r
        }\r
\r
        void Merge(int left, int mid, int right)\r
        {\r
            int i = left;\r
            int j = mid + 1;\r
            int write = left;\r
            int rightTaken = 0;\r
\r
            while (i <= mid && j <= right)\r
            {\r
                if (nums[indices[j]] < nums[indices[i]])\r
                {\r
                    temp[write++] = indices[j++];\r
                    rightTaken++;\r
                }\r
                else\r
                {\r
                    counts[indices[i]] += rightTaken;\r
                    temp[write++] = indices[i++];\r
                }\r
            }\r
\r
            while (i <= mid)\r
            {\r
                counts[indices[i]] += rightTaken;\r
                temp[write++] = indices[i++];\r
            }\r
\r
            while (j <= right)\r
                temp[write++] = indices[j++];\r
\r
            for (int k = left; k <= right; k++)\r
                indices[k] = temp[k];\r
        }\r
    }\r
}\r
\`\`\`\r
\r
> [!NOTE]\r
> Fenwick trees are 1-indexed. After coordinate compression, rank the smallest value as \`1\`, not \`0\`; otherwise \`index += index & -index\` never advances from \`0\`.\r
\r
**Approach 3 — Fenwick tree**\r
\r
**Time:** \`O(n log n)\` | **Space:** \`O(n)\`\r
\r
Coordinate-compress the values, scan from right to left, query how many smaller ranks have already been seen, then update the current rank.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public IList<int> CountSmallerFenwick(int[] nums)\r
    {\r
        int[] sorted = (int[])nums.Clone();\r
        Array.Sort(sorted);\r
\r
        var rank = new Dictionary<int, int>();\r
        int nextRank = 1;\r
\r
        foreach (int value in sorted)\r
        {\r
            if (!rank.ContainsKey(value))\r
                rank[value] = nextRank++;\r
        }\r
\r
        var bit = new BinaryIndexedTree(nextRank);\r
        int[] counts = new int[nums.Length];\r
\r
        for (int i = nums.Length - 1; i >= 0; i--)\r
        {\r
            int compressed = rank[nums[i]];\r
            counts[i] = bit.Query(compressed - 1);\r
            bit.Update(compressed, 1);\r
        }\r
\r
        return counts;\r
    }\r
\r
    private sealed class BinaryIndexedTree\r
    {\r
        private readonly int[] tree;\r
\r
        public BinaryIndexedTree(int size)\r
        {\r
            tree = new int[size + 1];\r
        }\r
\r
        public void Update(int index, int delta)\r
        {\r
            while (index < tree.Length)\r
            {\r
                tree[index] += delta;\r
                index += index & -index;\r
            }\r
        }\r
\r
        public int Query(int index)\r
        {\r
            int sum = 0;\r
\r
            while (index > 0)\r
            {\r
                sum += tree[index];\r
                index -= index & -index;\r
            }\r
\r
            return sum;\r
        }\r
    }\r
}\r
\`\`\`\r
\r
## Tree\r
\r
### Path Sum III\r
\r
**Problem.** Given a binary tree and a target sum, count all downward paths whose values add up to that target. A path may start at any node and end at any descendant.\r
\r
**Worked example.** \`root = [10,5,-3,3,2,null,11,3,-2,null,1], targetSum = 8\` returns \`3\`.\r
\r
**Approach 1 — Brute force**\r
\r
**Time:** \`O(n^2)\` | **Space:** \`O(h)\`\r
\r
For every node, count all matching downward paths that start there, then recurse into both children as potential starting points.\r
\r
\`\`\`csharp\r
public class TreeNode\r
{\r
    public int val;\r
    public TreeNode left;\r
    public TreeNode right;\r
\r
    public TreeNode(int val = 0, TreeNode left = null, TreeNode right = null)\r
    {\r
        this.val = val;\r
        this.left = left;\r
        this.right = right;\r
    }\r
}\r
\r
public class Solution\r
{\r
    public int PathSumBruteForce(TreeNode root, int targetSum)\r
    {\r
        if (root == null)\r
            return 0;\r
\r
        return CountFrom(root, targetSum) +\r
               PathSumBruteForce(root.left, targetSum) +\r
               PathSumBruteForce(root.right, targetSum);\r
    }\r
\r
    private int CountFrom(TreeNode node, long remaining)\r
    {\r
        if (node == null)\r
            return 0;\r
\r
        int count = node.val == remaining ? 1 : 0;\r
        count += CountFrom(node.left, remaining - node.val);\r
        count += CountFrom(node.right, remaining - node.val);\r
        return count;\r
    }\r
}\r
\`\`\`\r
\r
**Approach 2 — Prefix sum plus hash map**\r
\r
**Time:** \`O(n)\` | **Space:** \`O(h)\`\r
\r
Treat the root-to-current-node path like an array prefix sum. If the current prefix is \`sum\`, then any earlier prefix \`sum - target\` marks the start of a valid path ending here.\r
\r
\`\`\`csharp\r
public class TreeNode\r
{\r
    public int val;\r
    public TreeNode left;\r
    public TreeNode right;\r
\r
    public TreeNode(int val = 0, TreeNode left = null, TreeNode right = null)\r
    {\r
        this.val = val;\r
        this.left = left;\r
        this.right = right;\r
    }\r
}\r
\r
public class Solution\r
{\r
    public int PathSum(TreeNode root, int targetSum)\r
    {\r
        var prefixCount = new Dictionary<long, int>\r
        {\r
            [0] = 1\r
        };\r
\r
        return Dfs(root, 0);\r
\r
        int Dfs(TreeNode node, long currentSum)\r
        {\r
            if (node == null)\r
                return 0;\r
\r
            currentSum += node.val;\r
\r
            int count = 0;\r
            if (prefixCount.TryGetValue(currentSum - targetSum, out int matches))\r
                count += matches;\r
\r
            if (!prefixCount.ContainsKey(currentSum))\r
                prefixCount[currentSum] = 0;\r
\r
            prefixCount[currentSum]++;\r
            count += Dfs(node.left, currentSum);\r
            count += Dfs(node.right, currentSum);\r
            prefixCount[currentSum]--;\r
\r
            if (prefixCount[currentSum] == 0)\r
                prefixCount.Remove(currentSum);\r
\r
            return count;\r
        }\r
    }\r
}\r
\`\`\`\r
\r
## Stack\r
\r
### Asteroid Collision\r
\r
**Problem.** Given signed asteroid sizes where positive moves right and negative moves left, return the state after all collisions. Only a right-moving asteroid followed later by a left-moving asteroid can collide.\r
\r
**Worked example.** \`asteroids = [5, 10, -5]\` returns \`[5, 10]\`.\r
\r
**Approach 1 — Brute force**\r
\r
**Time:** \`O(n^2)\` | **Space:** \`O(1)\` ignoring the mutable output container\r
\r
Repeatedly scan for an adjacent positive-negative collision, resolve it, and restart until the list stabilizes.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public int[] AsteroidCollisionBruteForce(int[] asteroids)\r
    {\r
        var current = new List<int>(asteroids);\r
        bool changed = true;\r
\r
        while (changed)\r
        {\r
            changed = false;\r
\r
            for (int i = 0; i < current.Count - 1; i++)\r
            {\r
                if (current[i] <= 0 || current[i + 1] >= 0)\r
                    continue;\r
\r
                int left = current[i];\r
                int right = current[i + 1];\r
\r
                if (Math.Abs(left) > Math.Abs(right))\r
                {\r
                    current.RemoveAt(i + 1);\r
                }\r
                else if (Math.Abs(left) < Math.Abs(right))\r
                {\r
                    current.RemoveAt(i);\r
                }\r
                else\r
                {\r
                    current.RemoveAt(i + 1);\r
                    current.RemoveAt(i);\r
                }\r
\r
                changed = true;\r
                break;\r
            }\r
        }\r
\r
        return current.ToArray();\r
    }\r
}\r
\`\`\`\r
\r
**Approach 2 — Stack**\r
\r
**Time:** \`O(n)\` | **Space:** \`O(n)\`\r
\r
Only a new left-moving asteroid can collide with existing right-moving asteroids, so a stack of survivors is enough. Resolve repeated collisions until the new asteroid dies or becomes safe to push.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public int[] AsteroidCollision(int[] asteroids)\r
    {\r
        var stack = new List<int>();\r
\r
        foreach (int asteroid in asteroids)\r
        {\r
            int current = asteroid;\r
            bool alive = true;\r
\r
            while (alive &&\r
                   current < 0 &&\r
                   stack.Count > 0 &&\r
                   stack[^1] > 0)\r
            {\r
                int top = stack[^1];\r
\r
                if (top < -current)\r
                {\r
                    stack.RemoveAt(stack.Count - 1);\r
                    continue;\r
                }\r
\r
                if (top == -current)\r
                    stack.RemoveAt(stack.Count - 1);\r
\r
                alive = false;\r
            }\r
\r
            if (alive)\r
                stack.Add(current);\r
        }\r
\r
        return stack.ToArray();\r
    }\r
}\r
\`\`\`\r
\r
### Car Fleet\r
\r
**Problem.** Cars move toward the same target, cannot pass each other, and merge into fleets when a faster car catches a slower one. Return the number of fleets that arrive at the destination.\r
\r
**Worked example.** \`target = 12, position = [10, 8, 0, 5, 3], speed = [2, 4, 1, 1, 3]\` returns \`3\`.\r
\r
**Approach 1 — Repeated merging**\r
\r
**Time:** \`O(n^3)\` | **Space:** \`O(1)\` conceptually\r
\r
Sort cars by position from nearest to farthest, compute their solo arrival times, and keep rescanning for adjacent pairs that must merge. This is educational, but far from optimal.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public int CarFleetBruteForce(int target, int[] position, int[] speed)\r
    {\r
        var fleets = new List<(int Position, double Time)>();\r
\r
        for (int i = 0; i < position.Length; i++)\r
        {\r
            double time = (double)(target - position[i]) / speed[i];\r
            fleets.Add((position[i], time));\r
        }\r
\r
        fleets.Sort((a, b) => b.Position.CompareTo(a.Position));\r
\r
        bool merged = true;\r
        while (merged)\r
        {\r
            merged = false;\r
\r
            for (int i = 1; i < fleets.Count; i++)\r
            {\r
                if (fleets[i].Time <= fleets[i - 1].Time)\r
                {\r
                    fleets.RemoveAt(i);\r
                    merged = true;\r
                    break;\r
                }\r
            }\r
        }\r
\r
        return fleets.Count;\r
    }\r
}\r
\`\`\`\r
\r
**Approach 2 — Stack**\r
\r
**Time:** \`O(n log n)\` | **Space:** \`O(n)\`\r
\r
Sort by position descending, compute arrival times, and push a new fleet only when the current car arrives later than the fleet directly ahead of it.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public int CarFleetStack(int target, int[] position, int[] speed)\r
    {\r
        Array.Sort(position, speed);\r
        Array.Reverse(position);\r
        Array.Reverse(speed);\r
\r
        var stack = new List<double>();\r
\r
        for (int i = 0; i < position.Length; i++)\r
        {\r
            double time = (double)(target - position[i]) / speed[i];\r
\r
            if (stack.Count == 0 || time > stack[^1])\r
                stack.Add(time);\r
        }\r
\r
        return stack.Count;\r
    }\r
}\r
\`\`\`\r
\r
**Approach 3 — Without an explicit stack**\r
\r
**Time:** \`O(n log n)\` | **Space:** \`O(1)\` beyond sorting the cars\r
\r
The stack only ever needs its latest arrival time, so collapse it into one variable: if the current arrival time is greater than the last fleet time, it starts a new fleet; otherwise it merges into the fleet ahead.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public int CarFleet(int target, int[] position, int[] speed)\r
    {\r
        Array.Sort(position, speed);\r
        Array.Reverse(position);\r
        Array.Reverse(speed);\r
\r
        int fleetCount = 0;\r
        double lastFleetTime = 0;\r
\r
        for (int i = 0; i < position.Length; i++)\r
        {\r
            double time = (double)(target - position[i]) / speed[i];\r
\r
            if (fleetCount == 0 || time > lastFleetTime)\r
            {\r
                fleetCount++;\r
                lastFleetTime = time;\r
            }\r
        }\r
\r
        return fleetCount;\r
    }\r
}\r
\`\`\`\r
\r
### Calculator\r
\r
**Problem.** Evaluate an expression containing digits, spaces, \`+\`, \`-\`, \`(\`, and \`)\`.\r
\r
**Worked example.** \`s = "1 + (2 - (3 + 4))"\` returns \`-4\`.\r
\r
**Approach 1 — Brute force**\r
\r
**Time:** \`O(n^2)\` | **Space:** \`O(1)\` ignoring string rebuilding\r
\r
Repeatedly evaluate the innermost parenthesized expression, replace it with its integer result, and continue until no parentheses remain.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public int CalculateBruteForce(string s)\r
    {\r
        string expression = s;\r
\r
        while (true)\r
        {\r
            int open = expression.LastIndexOf('(');\r
            if (open == -1)\r
                break;\r
\r
            int close = expression.IndexOf(')', open);\r
            int value = EvaluateFlat(expression.Substring(open + 1, close - open - 1));\r
\r
            expression =\r
                expression.Substring(0, open) +\r
                value.ToString() +\r
                expression.Substring(close + 1);\r
        }\r
\r
        return EvaluateFlat(expression);\r
    }\r
\r
    private static int EvaluateFlat(string expression)\r
    {\r
        int result = 0;\r
        int sign = 1;\r
        int i = 0;\r
\r
        while (i < expression.Length)\r
        {\r
            char ch = expression[i];\r
\r
            if (ch == ' ')\r
            {\r
                i++;\r
            }\r
            else if (ch == '+' || ch == '-')\r
            {\r
                int combinedSign = 1;\r
\r
                while (i < expression.Length &&\r
                       (expression[i] == '+' || expression[i] == '-' || expression[i] == ' '))\r
                {\r
                    if (expression[i] == '-')\r
                        combinedSign *= -1;\r
\r
                    i++;\r
                }\r
\r
                sign = combinedSign;\r
            }\r
            else\r
            {\r
                int number = 0;\r
                while (i < expression.Length && char.IsDigit(expression[i]))\r
                {\r
                    number = number * 10 + (expression[i] - '0');\r
                    i++;\r
                }\r
\r
                result += sign * number;\r
            }\r
        }\r
\r
        return result;\r
    }\r
}\r
\`\`\`\r
\r
**Approach 2 — Stack**\r
\r
**Time:** \`O(n)\` | **Space:** \`O(n)\`\r
\r
When you see \`(\`, push the current accumulated result and sign, then reset for the inner expression. When you see \`)\`, pop and fold the finished inner result back into the outer expression.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public int Calculate(string s)\r
    {\r
        int result = 0;\r
        int sign = 1;\r
        var stack = new Stack<int>();\r
        int i = 0;\r
\r
        while (i < s.Length)\r
        {\r
            char ch = s[i];\r
\r
            if (ch == ' ')\r
            {\r
                i++;\r
                continue;\r
            }\r
\r
            if (char.IsDigit(ch))\r
            {\r
                int number = 0;\r
\r
                while (i < s.Length && char.IsDigit(s[i]))\r
                {\r
                    number = number * 10 + (s[i] - '0');\r
                    i++;\r
                }\r
\r
                result += sign * number;\r
                continue;\r
            }\r
\r
            if (ch == '+')\r
            {\r
                sign = 1;\r
            }\r
            else if (ch == '-')\r
            {\r
                sign = -1;\r
            }\r
            else if (ch == '(')\r
            {\r
                stack.Push(result);\r
                stack.Push(sign);\r
                result = 0;\r
                sign = 1;\r
            }\r
            else if (ch == ')')\r
            {\r
                int previousSign = stack.Pop();\r
                int previousResult = stack.Pop();\r
                result = previousResult + previousSign * result;\r
            }\r
\r
            i++;\r
        }\r
\r
        return result;\r
    }\r
}\r
\`\`\`\r
\r
## Cheat sheet\r
\r
- **Car Pooling:** bounded coordinate range means difference array; sparse coordinate range means sweep line; same-stop ordering must drop off before picking up.\r
- **Burst Balloons:** define the subproblem by the balloon burst **last** in an interval, not first.\r
- **Regular Expression Matching:** \`*\` either deletes the previous token from consideration or consumes one character while staying on the same pattern index.\r
- **Partition to K Equal Sum Subsets:** descending sort plus equivalent-bucket pruning is the difference between tractable backtracking and pointless repetition.\r
- **Cheapest Flights Within K Stops:** when a path budget matters, state must include the budget used so far.\r
- **Critical Connections:** \`low[child] > disc[parent]\` is the exact bridge test.\r
- **Reconstruct Itinerary:** Eulerian-path problems often want post-order output, then a final reverse.\r
- **Partition Labels:** the active partition ends at the farthest last occurrence of any character seen so far.\r
- **Letter Combinations:** the branching factor is the keypad size, not the number of digits already used.\r
- **Palindrome Partitioning:** precompute palindrome truth first if repeated substring checks dominate.\r
- **Meeting Rooms III:** one heap says which room is free; the other says when the next room becomes free.\r
- **LFU Cache Design:** frequency decides the bucket; recency decides the eviction within the bucket.\r
- **Median of Two Sorted Arrays:** the binary-search partition is valid only when left-side maxima are \`<=\` right-side minima.\r
- **Split Array Largest Sum:** binary search works because “can I split with max sum \`x\`?” is monotonic.\r
- **Count of Smaller Numbers After Self:** merge-sort counting and Fenwick trees are both order-statistics tools.\r
- **Path Sum III:** prefix-sum maps must be backtracked on the way up the recursion.\r
- **Asteroid Collision:** only a negative asteroid entering a stack of positive asteroids can trigger work.\r
- **Car Fleet:** once you process cars from front to back, fleet times become monotone non-decreasing.\r
- **Calculator:** pushing both prior result and prior sign is the clean way to handle nested parentheses.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Processing Car Pooling pick-ups before drop-offs at the same stop | Sort same-position events so negative deltas come first |\r
| Framing Burst Balloons by the first balloon burst | Choose the last balloon burst so interval boundaries stay fixed |\r
| Treating regex \`*\` as “match anything” | \`*\` only repeats the preceding token; \`.\` is the wildcard for one character |\r
| Forgetting early impossibility checks in partition-to-\`k\` | Return false immediately if \`sum % k != 0\` or the largest number exceeds the target bucket sum |\r
| Using cost-only Dijkstra for Cheapest Flights | Include stops or edges used in the state, or use Bellman-Ford rounds |\r
| Skipping parent-edge handling in Tarjan DFS | Track the incoming edge id, not just the parent node, to avoid bad low-link updates |\r
| Appending itinerary nodes in pre-order | Append after exhausting outgoing edges, then reverse the route |\r
| Recomputing partition-label last occurrences on every character | Precompute the last index of each character once |\r
| Rechecking palindrome substrings character by character inside every branch | Precompute \`isPalindrome[left, right]\` by increasing substring length |\r
| Evicting the oldest key globally in LFU | Evict from the minimum-frequency bucket, and within that bucket use LRU order |\r
| Returning \`right\` after lower-bound binary search in Split Array | Maintain the invariant and return \`left\` when the loop ends |\r
| Updating a Fenwick tree at index \`0\` | Coordinate-compress to ranks starting at \`1\` |\r
| Forgetting to remove the current prefix sum when backtracking Path Sum III | Decrement the prefix frequency after both child DFS calls |\r
| Handling only one asteroid collision and then moving on | Keep resolving while the current asteroid can still collide with the new stack top |\r
| Thinking a faster car behind always forms a new fleet | If its arrival time is not later than the fleet ahead, it merges into that fleet |\r
| Pushing only the sign or only the result for Calculator parentheses | Push both so you can restore the full outer context on \`)\` |\r
\r
## Summary\r
\r
Advanced interview problems are rarely about more syntax or more memorization; they are about spotting the one representation that untangles the problem. Sometimes that representation is a better state (\`city + stops\`, \`mask + remainder\`, prefix sums on a tree path), sometimes it is a better ordering (\`last balloon burst\`, post-order Eulerian traversal, sort by position descending), and sometimes it is a better data structure invariant (frequency buckets for LFU, monotone fleet times, active right-movers on a stack). The practical interview move is always the same: say the brute-force version first, name exactly what wasted work it repeats, then explain the state or invariant that removes that waste.\r
\r
## Top Interview Questions\r
\r
### Q1. Why is choosing the last balloon burst the key idea in Burst Balloons, and why does choosing the first balloon not work as cleanly?\r
\r
Choosing the last balloon burst inside an interval freezes its neighbors, which is exactly what makes the subproblem independent. If balloon \`k\` is the last one burst between boundaries \`left\` and \`right\`, then its gain is always \`values[left] * values[k] * values[right]\`, regardless of the order used inside the left and right subintervals. That gives a clean recurrence: best left subproblem plus best right subproblem plus the final burst gain. If you try to choose the first balloon instead, its eventual neighbors depend on what gets removed later, so the same state no longer determines the score. That is the recurring interval-DP lesson: define the decision at the moment when the boundary conditions are stable, not while they are still changing.\r
\r
### Q2. In Cheapest Flights Within K Stops, why is plain Dijkstra not enough, and what does the correct state look like?\r
\r
Plain Dijkstra assumes that once you reach a node with the cheapest cost so far, any more expensive path to that same node can be discarded. That assumption breaks here because the stop budget matters just as much as the cost. A path that reaches city \`A\` cheaply but already used too many stops can be worse than a slightly more expensive path that reaches \`A\` with budget left. The right state is therefore something like \`(city, edgesUsed)\` or \`(city, stopsUsed)\`, not just \`city\`. Once you carry that extra state, both Bellman-Ford and heap-based search become correct again: Bellman-Ford because each round limits path length, and Dijkstra because it now compares full states rather than merging incompatible situations together.\r
\r
### Q3. How do you explain the progression from brute force to difference array to sweep line in Car Pooling?\r
\r
The brute-force solution updates every stop covered by every trip, which is correct but obviously wasteful when trips span long ranges. The observation behind the difference array is that range updates only matter at their boundaries: \`+passengers\` at the start and \`-passengers\` at the end. A prefix sum then reconstructs the active load at every stop in linear time. The sweep-line version is the same boundary idea, but it drops the assumption that the coordinate range is small and dense. Instead of keeping an array indexed by stop number, it sorts just the pick-up and drop-off events. In an interview, that narration is strong because it names the exact waste removed at each step: first repeated range updates, then dependence on a dense coordinate domain.\r
\r
### Q4. Why does binary search on the answer work for Split Array Largest Sum, and what monotonic property are you using?\r
\r
You are not binary-searching an index; you are binary-searching the maximum allowed subarray sum. For any guess \`x\`, you can greedily scan the array and count how many groups are required if no group is allowed to exceed \`x\`. That predicate is monotonic: if a particular \`x\` is feasible, then any larger \`x\` is also feasible, because relaxing the cap cannot require more groups. Conversely, if \`x\` is too small, every smaller value is also too small. Once you see that monotonicity, lower-bound binary search is natural. The two classic mistakes are setting the low bound below \`max(nums)\` and returning the wrong pointer at the end. A good answer explicitly states the invariant and the feasible predicate before writing code.\r
\r
### Q5. Count of Smaller Numbers After Self has both a merge-sort solution and a Fenwick-tree solution. How do you decide which explanation to give first?\r
\r
I would usually explain merge-sort counting first because it shows the counting logic directly: when a right-half value is merged ahead of a left-half value, it is smaller than every still-unmerged left value, so it contributes to those counts. That makes the invariant very visual and interview-friendly. The Fenwick-tree solution is often the better follow-up when you want to show another order-statistics tool: scan from right to left, coordinate-compress the values, query how many smaller ranks have already been seen, then update the current rank. If the interviewer likes divide-and-conquer reasoning, lead with merge sort; if they like indexed frequency structures or ask for an online-style explanation, bring up Fenwick. Both are really solving the same ranked-prefix question in different clothes.\r
\r
### Q6. What is the data-structure invariant that makes LFU Cache support O(1) average Get and Put?\r
\r
The invariant is that every key lives in exactly one frequency bucket, and every bucket is a doubly linked list ordered by recency within that frequency. A hash map gives O(1) access from key to node, another map gives O(1) access from frequency to its list, and \`minFrequency\` tells you which bucket to evict from. On \`Get\`, you remove the node from frequency \`f\`, increment it to \`f + 1\`, and insert it at the front of the new list. On \`Put\`, if you need to evict, you remove from the tail of the \`minFrequency\` list, which is the least recently used key among the least frequently used ones. That tie-break is the part candidates often forget to encode explicitly.\r
\r
### Q7. How do low-link values identify a bridge in Critical Connections in a Network?\r
\r
During DFS, \`discovery[node]\` records when a node was first seen, while \`low[node]\` records the earliest discovery time reachable from that node's subtree using zero or more tree edges and at most one back edge. After you DFS into a child, if \`low[child] > discovery[node]\`, it means the child's entire subtree cannot reach \`node\` or any ancestor of \`node\` without using the edge between them. So removing that edge disconnects the graph, which is exactly the definition of a bridge. The logic is more important than the formula: low-link values summarize whether a subtree has an escape route back upward. If it does not, the parent edge is structurally critical.\r
\r
### Q8. Why does Hierholzer's algorithm for Reconstruct Itinerary append airports in post-order instead of pre-order?\r
\r
Because greedy forward walking alone can trap you in a dead end before all edges are used. Hierholzer's insight is that a node should only be committed to the route after every outgoing edge from that node has already been consumed. That is why the DFS appends in post-order: you keep drilling down through unused edges until you get stuck, append that terminal node, then unwind. The unwind order naturally stitches together smaller Eulerian trails into the final route, and a final reverse gives the usable itinerary. In this problem, lexicographic order is layered on top by always consuming the smallest available destination first. The combination sounds subtle, but the mental model is simple: spend edges greedily, record airports only when there are no edges left to spend from there.\r
\r
### Q9. Why does the prefix-sum hash-map trick work for Path Sum III even though paths can start anywhere in the tree?\r
\r
Because every downward path ending at the current node is a suffix of the root-to-current path. If the running prefix sum at the current node is \`sum\`, then any earlier prefix equal to \`sum - target\` marks a starting point whose suffix to the current node totals exactly \`target\`. That is the same algebra behind Subarray Sum Equals K, just applied along a DFS path instead of a linear array. The detail that makes it correct on a tree is backtracking: once you return from a node, you decrement its prefix sum count so sibling branches do not see prefixes from the wrong path. Without that undo step, you would accidentally count paths that jump across the tree instead of staying on one downward chain.\r
\r
### Q10. If an interviewer gives you one of these advanced problems, how should you narrate your way from the obvious solution to the optimal one?\r
\r
Start with the correct but slow solution and be explicit about what repeated work it does. Then say the one observation that kills that waste. For Car Pooling, the waste is updating every stop, so you keep only boundary changes. For Burst Balloons, the problem is that “first burst” keeps changing neighbors, so you reframe around the last burst. For Cheapest Flights, the issue is that node-only state loses the stop budget, so you add stops to the state. For Split Array, the waste is enumerating split layouts, so you search the answer space with a monotone feasibility check. That pattern of narration is what interviewers want to hear: baseline, bottleneck, new invariant or state, and new complexity. It shows reasoning, not just memorized code.\r
`;export{n as default};
