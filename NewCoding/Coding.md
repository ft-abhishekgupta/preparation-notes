# Coding Patterns

## 1. Arrays + HashMap/HashSet

### Prefix Sum
Running sum of values - For range sum - For subset sum max
```cs
// preSum[i] = Sum of values till num[i-1]
var preSum = new int[len+1];
for (int i = 1; i <= len; i++)
    preSum[i] = num[i-1] + preSum[i-1];

// Sum of subset [i...j]
sum = preSum[j+1] - preSum[i];
```

### Difference Array
```cs
// Range update [l..r] += val in O(1); build final array with prefix sum
var diff = new int[len + 1];
foreach (var (l, r, val) in updates)
{
    diff[l] += val;
    diff[r + 1] -= val;   // cancel after r
}
// Accumulate to get final values
var res = new int[len];
int running = 0;
for (int i = 0; i < len; i++)
{
    running += diff[i];
    res[i] = running;
}
return res;
```
### HashMap - count / index lookup
```cs
// Frequency count
var freq = new Dictionary<int, int>();
foreach (int x in num)
    freq[x] = freq.GetValueOrDefault(x) + 1;

// Two Sum - value -> index
var seen = new Dictionary<int, int>();
for (int i = 0; i < num.Length; i++)
{
    if (seen.TryGetValue(target - num[i], out int j))
        return new[] { j, i };
    seen[num[i]] = i;
}
```

### HashSet - membership / dedupe
```cs
var set = new HashSet<int>();
foreach (int x in num)
{
    if (!set.Add(x))
    {
        /* <duplicate found> */
    }
}
```

### Kadane - max subarray sum
```cs
int best = num[0], cur = num[0];
for (int i = 1; i < num.Length; i++)
{
    cur = Math.Max(num[i], cur + num[i]); // extend or restart
    best = Math.Max(best, cur);
}
return best;
```

## 2. Two Pointers
```cs
// Same Direction
int slow = 0;
for (int fast = 0; fast < num.Length; fast++)
{
    if (/* <condition to keep num[fast]> */)
        num[slow++] = num[fast];
}
return slow;

// Opposite Direction
int left = 0, right = num.Length - 1;
while (left < right)
{
    if (/* <condition> */)
        left++;
    else
        right--;
    // <update answer>
}
```

## 3. Sliding Window
```cs 
// Fixed Size k
int sum = 0;
for (int i = 0; i < num.Length; i++)
{
    sum += num[i];
    if (i >= k)
        sum -= num[i - k];
    if (i >= k - 1)
    {
        /* <update answer> */
    }
}

// Variable Size - Minimum
int left = 0, best = int.MaxValue;
for (int right = 0; right < num.Length; right++)
{
    // <add num[right]>
    while (/* <condition met> */)
    {
        best = Math.Min(best, right - left + 1);
        // <remove num[left]>
        left++;
    }
}
return best == int.MaxValue ? 0 : best;

// Variable Size - Maximum
int left = 0, best = 0;
for (int right = 0; right < num.Length; right++)
{
    // <add num[right]>
    while (/* <condition broken> */)
    {
        // <remove num[left]>
        left++;
    }
    best = Math.Max(best, right - left + 1);
}
return best;
```

### Monotonic Deque - sliding window maximum
```cs
var dq = new LinkedList<int>(); // stores indices, values decreasing
var res = new List<int>();
for (int i = 0; i < num.Length; i++)
{
    if (dq.Count > 0 && dq.First.Value <= i - k)
        dq.RemoveFirst(); // out of window
    while (dq.Count > 0 && num[dq.Last.Value] <= num[i])
        dq.RemoveLast();
    dq.AddLast(i);
    if (i >= k - 1)
        res.Add(num[dq.First.Value]); // front = window max
}
return res.ToArray();
```

## 4. Stack + Monotonic Stack
```cs
// Monotonic Stack - next greater element
var stack = new Stack<int>();
var res = new int[num.Length];
Array.Fill(res, -1);
for (int i = 0; i < num.Length; i++)
{
    while (stack.Count > 0 && num[stack.Peek()] < num[i]) // <condition>
        res[stack.Pop()] = num[i];
    stack.Push(i);
}
return res;
```

## 5. Binary Search
```cs
// Exact Value
int lo = 0, hi = num.Length - 1;
while (lo <= hi)
{
    int mid = lo + (hi - lo) / 2;
    if (num[mid] == target)
        return mid;
    if (num[mid] < target)
        lo = mid + 1;
    else
        hi = mid - 1;
}
return -1;

// Binary Search on Answer
int lo = minAns, hi = maxAns;
while (lo < hi)
{
    int mid = lo + (hi - lo) / 2;
    if (Feasible(mid))   // <feasibility check>
        hi = mid;
    else
        lo = mid + 1;
}
return lo;

// Lower Bound - first i where num[i] >= target
int lo = 0, hi = num.Length;
while (lo < hi)
{
    int mid = lo + (hi - lo) / 2;
    if (num[mid] < target)
        lo = mid + 1;
    else
        hi = mid;
}
return lo;

// Upper Bound - first i where num[i] > target
int lo = 0, hi = num.Length;
while (lo < hi)
{
    int mid = lo + (hi - lo) / 2;
    if (num[mid] <= target)
        lo = mid + 1;
    else
        hi = mid;
}
return lo;
```

## 6. Linked Lists
```cs
// Reverse
ListNode prev = null, cur = head;
while (cur != null)
{
    ListNode next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
}
return prev;

// Fast & Slow - cycle detection
ListNode slow = head, fast = head;
while (fast != null && fast.next != null)
{
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast)
        return true;
}
return false;

// Middle node (slow ends at middle)
ListNode slow = head, fast = head;
while (fast != null && fast.next != null)
{
    slow = slow.next;
    fast = fast.next.next;
}
return slow;

// Dummy head - simplifies insert/delete at front
var dummy = new ListNode(0) { next = head };
ListNode cur = dummy;
// ... rewire via cur.next ...
return dummy.next;
```

## 7. Trees + DFS/BFS
```cs
// BFS - level order
var res = new List<IList<int>>();
if (root == null)
    return res;
var queue = new Queue<TreeNode>();
queue.Enqueue(root);
while (queue.Count > 0)
{
    int size = queue.Count;
    var level = new List<int>();
    for (int i = 0; i < size; i++)
    {
        var node = queue.Dequeue();
        level.Add(node.val);
        if (node.left != null)
            queue.Enqueue(node.left);
        if (node.right != null)
            queue.Enqueue(node.right);
    }
    res.Add(level);
}
return res;

// DFS - pre / in / post by placement
void Dfs(TreeNode node)
{
    if (node == null)
        return;
    // <preorder>
    Dfs(node.left);
    // <inorder>
    Dfs(node.right);
    // <postorder>
}
Dfs(root);
```

Height / Diameter
```cs
// Returns height; tracks longest path (edges) through any node
int diameter = 0;
int Height(TreeNode node)
{
    if (node == null)
        return 0;
    int l = Height(node.left), r = Height(node.right);
    diameter = Math.Max(diameter, l + r);
    return 1 + Math.Max(l, r);
}
```

Validate BST
```cs
bool Valid(TreeNode node, long min, long max)
{
    if (node == null)
        return true;
    if (node.val <= min || node.val >= max)
        return false;
    return Valid(node.left, min, node.val) && Valid(node.right, node.val, max);
}
return Valid(root, long.MinValue, long.MaxValue);
```

Lowest Common Ancestor
```cs
TreeNode Lca(TreeNode node, TreeNode p, TreeNode q)
{
    if (node == null || node == p || node == q)
        return node;
    var l = Lca(node.left, p, q);
    var r = Lca(node.right, p, q);
    if (l != null && r != null)
        return node; // split point
    return l ?? r;
}
```

## 8. Heap / PriorityQueue
```cs
// Kth Largest - min-heap of size k
var pq = new PriorityQueue<int, int>();
foreach (int x in num)
{
    pq.Enqueue(x, x);
    if (pq.Count > k)
        pq.Dequeue(); // keep k largest
}
return pq.Peek();

// K Closest / Top K by key - max-heap of size k (negate priority)
var pq = new PriorityQueue<int, int>();
foreach (int x in num)
{
    int key = /* <distance/frequency> */;
    pq.Enqueue(x, -key);
    if (pq.Count > k)
        pq.Dequeue();
}
```

### Two Heaps - median from stream
```cs
var lo = new PriorityQueue<int, int>(); // max-heap (negate), lower half
var hi = new PriorityQueue<int, int>(); // min-heap, upper half
void Add(int x)
{
    lo.Enqueue(x, -x);
    hi.Enqueue(lo.Dequeue(), 0);          // balance value across
    if (hi.Count > lo.Count)
    {
        int t = hi.Dequeue();
        lo.Enqueue(t, -t);
    }
}
double Median() => lo.Count > hi.Count
    ? lo.Peek()
    : (lo.Peek() + hi.Peek()) / 2.0;
```

## 9. Intervals + Greedy
```cs
// Merge Overlapping
Array.Sort(intervals, (a, b) => a[0] - b[0]);
var res = new List<int[]>();
foreach (var it in intervals)
{
    if (res.Count > 0 && it[0] <= res[^1][1])
        res[^1][1] = Math.Max(res[^1][1], it[1]); // overlap -> extend
    else
        res.Add(it);
}
return res.ToArray();

// Sweep Line - min rooms / max overlap
var starts = intervals.Select(i => i[0]).OrderBy(x => x).ToArray();
var ends = intervals.Select(i => i[1]).OrderBy(x => x).ToArray();
int rooms = 0, best = 0, e = 0;
for (int s = 0; s < starts.Length; s++)
{
    while (e < ends.Length && ends[e] <= starts[s]) { rooms--; e++; }
    rooms++;
    best = Math.Max(best, rooms);
}
return best;

// Interval Scheduling - max non-overlapping (sort by end)
Array.Sort(intervals, (a, b) => a[1] - b[1]);
int count = 0, end = int.MinValue;
foreach (var it in intervals)
    if (it[0] >= end) // take if no overlap
    {
        count++;
        end = it[1];
    }
return count;
```

## 10. Backtracking
```cs
// Recursion - choose / explore / un-choose
var results = new List<IList<int>>();
void Backtrack(int start, List<int> path)
{
    if (/* <goal reached> */)
    {
        results.Add(new List<int>(path));
        return;
    }
    for (int i = start; i < num.Length; i++)
    {
        if (/* <skip invalid/duplicate> */)
            continue;
        path.Add(num[i]);
        Backtrack(i + 1, path);
        path.RemoveAt(path.Count - 1);
    }
}
Backtrack(0, new List<int>());
return results;
```

Subsets - include / exclude each element
```cs
var results = new List<IList<int>>();
void Build(int i, List<int> path)
{
    if (i == num.Length)
    {
        results.Add(new List<int>(path));
        return;
    }
    Build(i + 1, path);              // exclude num[i]
    path.Add(num[i]);
    Build(i + 1, path);              // include num[i]
    path.RemoveAt(path.Count - 1);
}
Build(0, new List<int>());
```

Permutations - swap in place
```cs
var results = new List<IList<int>>();
void Permute(int start)
{
    if (start == num.Length)
    {
        results.Add(new List<int>(num));
        return;
    }
    for (int i = start; i < num.Length; i++)
    {
        (num[start], num[i]) = (num[i], num[start]);
        Permute(start + 1);
        (num[start], num[i]) = (num[i], num[start]);
    }
}
Permute(0);
```

## 11. Graphs
```cs
// BFS
var queue = new Queue<int>();
var visited = new bool[n];
queue.Enqueue(start);
visited[start] = true;
while (queue.Count > 0)
{
    int node = queue.Dequeue();
    // <process node>
    foreach (int next in adj[node])
    {
        if (visited[next])
            continue;
        visited[next] = true;
        queue.Enqueue(next);
    }
}

// DFS
var visited = new bool[n];
void Dfs(int node)
{
    visited[node] = true;
    // <process node>
    foreach (int next in adj[node])
        if (!visited[next])
            Dfs(next);
}
Dfs(start);
```

## 12. Union Find
```cs
// Path compression + union by rank
var parent = new int[n];
var rank = new int[n];
for (int i = 0; i < n; i++) parent[i] = i;

int Find(int x) => parent[x] == x ? x : parent[x] = Find(parent[x]);

bool Union(int a, int b)
{
    int ra = Find(a), rb = Find(b);
    if (ra == rb)
        return false;
    if (rank[ra] < rank[rb])
        (ra, rb) = (rb, ra);
    parent[rb] = ra;
    if (rank[ra] == rank[rb])
        rank[ra]++;
    return true;
}
```

## 13. Topological Sort
```cs
// Kahn's - BFS on indegree
var indeg = new int[n];
foreach (var e in edges) indeg[e[1]]++;
var queue = new Queue<int>();
for (int i = 0; i < n; i++)
    if (indeg[i] == 0)
        queue.Enqueue(i);
var order = new List<int>();
while (queue.Count > 0)
{
    int node = queue.Dequeue();
    order.Add(node);
    foreach (int next in adj[node])
        if (--indeg[next] == 0)
            queue.Enqueue(next);
}
return order.Count == n ? order : new List<int>(); // empty = cycle
```

## 14. Shortest Path
```cs
// BFS - unweighted
var dist = new int[n];
Array.Fill(dist, -1);
var queue = new Queue<int>();
queue.Enqueue(start); dist[start] = 0;
while (queue.Count > 0)
{
    int node = queue.Dequeue();
    foreach (int next in adj[node])
        if (dist[next] == -1)
        {
            dist[next] = dist[node] + 1;
            queue.Enqueue(next);
        }
}

// Dijkstra - non-negative weights
var dist = new int[n];
Array.Fill(dist, int.MaxValue);
dist[start] = 0;
var pq = new PriorityQueue<int, int>(); // <node, distance>
pq.Enqueue(start, 0);
while (pq.Count > 0)
{
    pq.TryDequeue(out int node, out int d);
    if (d > dist[node])
        continue;
    foreach (var (next, w) in adj[node])
        if (dist[node] + w < dist[next])
        {
            dist[next] = dist[node] + w;
            pq.Enqueue(next, dist[next]);
        }
}

// Bellman Ford - negative edges + cycle detection
var dist = new int[n];
Array.Fill(dist, int.MaxValue);
dist[start] = 0;
for (int i = 0; i < n - 1; i++)          // relax n-1 times
    foreach (var e in edges)              // e = (u, v, w)
        if (dist[e[0]] != int.MaxValue && dist[e[0]] + e[2] < dist[e[1]])
            dist[e[1]] = dist[e[0]] + e[2];
foreach (var e in edges)                  // extra pass => negative cycle
    if (dist[e[0]] != int.MaxValue && dist[e[0]] + e[2] < dist[e[1]])
        return null;

// MST - Kruskals (uses Find/Union above)
Array.Sort(edges, (a, b) => a[2] - b[2]);
int total = 0, used = 0;
foreach (var e in edges) // e = (u, v, w)
    if (Union(e[0], e[1]))
    {
        total += e[2];
        if (++used == n - 1)
            break;
    }
return total;

// MST - Prims (grow tree via min-heap)
var inMst = new bool[n];
var pq = new PriorityQueue<int, int>(); // <node, weight>
pq.Enqueue(start, 0);
int total = 0;
while (pq.Count > 0)
{
    pq.TryDequeue(out int node, out int w);
    if (inMst[node])
        continue;
    inMst[node] = true;
    total += w;
    foreach (var (next, weight) in adj[node])
        if (!inMst[next])
            pq.Enqueue(next, weight);
}
return total;
```

## 15. Dynamic Programming
```cs
// 1D - Fibonacci style (climb stairs, house robber)
var dp = new int[n + 1];
dp[0] = /* base */; dp[1] = /* base */;
for (int i = 2; i <= n; i++)
    dp[i] = /* <transition from dp[i-1], dp[i-2]> */;
return dp[n];

// 2D Grid - unique paths / min path sum
var dp = new int[m][];
for (int i = 0; i < m; i++) dp[i] = new int[n];
for (int i = 0; i < m; i++)
    for (int j = 0; j < n; j++)
        dp[i][j] = /* <combine dp[i-1][j], dp[i][j-1]> */;
return dp[m - 1][n - 1];

// 0/1 Knapsack - iterate weights backward
var dp = new int[capacity + 1];
for (int i = 0; i < items.Length; i++)
    for (int w = capacity; w >= weight[i]; w--)
        dp[w] = Math.Max(dp[w], dp[w - weight[i]] + value[i]);
return dp[capacity];

// LIS - O(n log n) patience sorting
var tails = new List<int>();
foreach (int x in num)
{
    int i = tails.BinarySearch(x);
    if (i < 0)
        i = ~i;
    if (i == tails.Count)
        tails.Add(x);
    else
        tails[i] = x;
}
return tails.Count;
```

```cs
// Unbounded Knapsack - coin change (min coins for amount)
var dp = new int[amount + 1];
Array.Fill(dp, amount + 1);
dp[0] = 0;
foreach (int c in coins)
    for (int a = c; a <= amount; a++)     // forward => reuse allowed
        dp[a] = Math.Min(dp[a], dp[a - c] + 1);
return dp[amount] > amount ? -1 : dp[amount];

// LCS - longest common subsequence of s, t
var dp = new int[s.Length + 1, t.Length + 1];
for (int i = 1; i <= s.Length; i++)
    for (int j = 1; j <= t.Length; j++)
        dp[i, j] = s[i - 1] == t[j - 1]
            ? dp[i - 1, j - 1] + 1
            : Math.Max(dp[i - 1, j], dp[i, j - 1]);
return dp[s.Length, t.Length];

// Edit Distance - min ops to convert s -> t
var dp = new int[s.Length + 1, t.Length + 1];
for (int i = 0; i <= s.Length; i++) dp[i, 0] = i;
for (int j = 0; j <= t.Length; j++) dp[0, j] = j;
for (int i = 1; i <= s.Length; i++)
    for (int j = 1; j <= t.Length; j++)
        dp[i, j] = s[i - 1] == t[j - 1]
            ? dp[i - 1, j - 1]
            : 1 + Math.Min(dp[i - 1, j - 1], Math.Min(dp[i - 1, j], dp[i, j - 1]));
return dp[s.Length, t.Length];
```

## 16. Trie
```cs
class TrieNode
{
    public TrieNode[] Children = new TrieNode[26];
    public bool IsWord;
}

void Insert(TrieNode root, string word)
{
    var node = root;
    foreach (char c in word)
    {
        int i = c - 'a';
        node.Children[i] ??= new TrieNode();
        node = node.Children[i];
    }
    node.IsWord = true;
}

bool Search(TrieNode root, string word)
{
    var node = root;
    foreach (char c in word)
    {
        node = node.Children[c - 'a'];
        if (node == null)
            return false;
    }
    return node.IsWord;
}
```

## 17. Advanced Patterns

### Bit Manipulation
```cs
x & 1              // is odd
x >> 1             // divide by 2
x & (x - 1)        // drop lowest set bit
x & (-x)           // isolate lowest set bit
x ^ y              // differ; a^a=0, a^0=a
(mask >> i) & 1    // read i-th bit
mask |= (1 << i)   // set i-th bit
mask &= ~(1 << i)  // clear i-th bit

// Count set bits
int count = 0;
while (x != 0) { x &= x - 1; count++; }

// Single number (all others appear twice)
int res = 0;
foreach (int v in num) res ^= v;
return res;
```

### Matrix
```cs
// 4-directional neighbors
int[][] dirs = { new[]{0,1}, new[]{0,-1}, new[]{1,0}, new[]{-1,0} };
foreach (var d in dirs)
{
    int r = row + d[0], c = col + d[1];
    if (r < 0 || r >= m || c < 0 || c >= n)
        continue; // bounds
    // <insert logic>
}

// Flood Fill / Island DFS
void Dfs(int r, int c)
{
    if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] != target)
        return;
    grid[r][c] = mark; // mark visited
    Dfs(r + 1, c); Dfs(r - 1, c); Dfs(r, c + 1); Dfs(r, c - 1);
}
```

### Cyclic Sort
```cs
// Numbers in range [1..n] -> place num at index num-1; find missing/dup
int i = 0;
while (i < num.Length)
{
    int correct = num[i] - 1;
    if (num[i] != num[correct])
        (num[i], num[correct]) = (num[correct], num[i]);
    else
        i++;
}
```

### Strings
```cs
// Anagram check - fixed alphabet count
if (s.Length != t.Length)
    return false;
var cnt = new int[26];
foreach (char c in s) cnt[c - 'a']++;
foreach (char c in t)
    if (--cnt[c - 'a'] < 0)
        return false;
return true;

// Palindrome check - two pointers, skip non-alphanumeric
int l = 0, r = s.Length - 1;
while (l < r)
{
    while (l < r && !char.IsLetterOrDigit(s[l])) l++;
    while (l < r && !char.IsLetterOrDigit(s[r])) r--;
    if (char.ToLower(s[l]) != char.ToLower(s[r]))
        return false;
    l++; r--;
}
return true;

// Expand around center - count/find palindromic substrings
int Expand(int l, int r)
{
    while (l >= 0 && r < s.Length && s[l] == s[r]) { l--; r++; }
    return r - l - 1; // length of palindrome
}
```

### Quickselect - kth smallest, avg O(n)
```cs
int Select(int lo, int hi, int k) // k is target index in sorted order
{
    int pivot = num[hi], i = lo;
    for (int j = lo; j < hi; j++)
        if (num[j] < pivot)
            (num[i], num[j]) = (num[j], num[i++]);
    (num[i], num[hi]) = (num[hi], num[i]);
    if (i == k)
        return num[i];
    return i < k ? Select(i + 1, hi, k) : Select(lo, i - 1, k);
}
```

### Math
```cs
// GCD / LCM
int Gcd(int a, int b) => b == 0 ? a : Gcd(b, a % b);
long Lcm(int a, int b) => (long)a / Gcd(a, b) * b;

// Fast power - a^b mod m, O(log b)
long Pow(long a, long b, long mod)
{
    long res = 1; a %= mod;
    while (b > 0)
    {
        if ((b & 1) == 1)
            res = res * a % mod;
        a = a * a % mod;
        b >>= 1;
    }
    return res;
}

// Sieve of Eratosthenes - primes up to n
var isPrime = new bool[n + 1];
Array.Fill(isPrime, true);
isPrime[0] = isPrime[1] = false;
for (int p = 2; (long)p * p <= n; p++)
    if (isPrime[p])
        for (int m = p * p; m <= n; m += p) isPrime[m] = false;
```

### Math Formulas & Concepts

Sums & Series
- Sum `1..n` = `n(n+1)/2`
- Sum of squares `1²..n²` = `n(n+1)(2n+1)/6`
- Sum of first `n` odds = `n²`; first `n` evens = `n(n+1)`
- Arithmetic series = `count * (first + last) / 2`
- Geometric series `a + ar + ... + ar^(n-1)` = `a(rⁿ - 1)/(r - 1)`
- Powers of 2: `1 + 2 + 4 + ... + 2^(n-1) = 2ⁿ - 1`

Combinatorics
- Permutations `nPr` = `n! / (n-r)!`
- Combinations `nCr` = `n! / (r!(n-r)!)`; `nCr = nC(n-r)`
- Pascal: `nCr = (n-1)C(r-1) + (n-1)Cr`
- Subsets of `n` items = `2ⁿ`; with `k` chosen = `nCk`
- Catalan `Cₙ` = `(2n)! / ((n+1)! n!)` — valid parens, BST shapes, triangulations
- Sum of all `nCr` for r=0..n = `2ⁿ`

Divisibility & Modular
- `(a + b) % m = ((a%m) + (b%m)) % m` (same for `*`)
- `(a - b) % m = ((a%m) - (b%m) + m) % m`
- Use `1_000_000_007` (prime) as common mod
- Modular inverse (m prime): `a⁻¹ = a^(m-2) % m` (Fermat)
- Divisors come in pairs around `√n` → check up to `√n`
- `n` is prime if no divisor in `2..√n`

Number Properties
- `gcd(a,b) * lcm(a,b) = a * b`
- Digit count of `n` (base 10) = `floor(log10(n)) + 1`
- Reverse digits: `rev = rev*10 + n%10; n /= 10`
- Even/odd via `n & 1`; multiply/divide by 2 via shifts

Powers of Two / Bits
- Check power of two: `n > 0 && (n & (n-1)) == 0`
- `2ⁿ` values: 2^10 ≈ 10³, 2^20 ≈ 10⁶, 2^30 ≈ 10⁹
- Max `int` ≈ 2.1×10⁹ (2³¹−1); use `long` past that

Geometry
- Manhattan distance = `|x1-x2| + |y1-y2|`
- Euclidean distance² = `(x1-x2)² + (y1-y2)²` (compare squares, skip sqrt)
- Triangle area (shoelace) = `½ |x1(y2-y3) + x2(y3-y1) + x3(y1-y2)|`

Probability & Expectation
- `E[X] = Σ (value * probability)`
- Linearity: `E[X + Y] = E[X] + E[Y]`

Complexity Cheatsheet (n that fits in ~1s, ~10⁸ ops)
- `O(n!)` → n ≤ 11 · `O(2ⁿ)` → n ≤ 22
- `O(n³)` → n ≤ 500 · `O(n²)` → n ≤ 5,000
- `O(n log n)` → n ≤ 10⁶ · `O(n)` → n ≤ 10⁸
- `O(log n)` / `O(1)` → effectively unbounded
