# Coding Patterns

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



## 17. Advanced Patterns

### Bit Manipulation
```cs


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


