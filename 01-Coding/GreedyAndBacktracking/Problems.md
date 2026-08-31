# Greedy and Backtracking — Problems

| # | Problem | LeetCode | Pattern | Difficulty |
| - | ------- | -------- | ------- | ---------- |
| 1 | Meeting Rooms | 252 | Intervals | Easy |
| 2 | Merge Intervals | 56 | Intervals | Medium |
| 3 | Insert Interval | 57 | Intervals | Medium |
| 4 | Non-overlapping Intervals | 435 | Intervals | Medium |
| 5 | Minimum Arrows to Burst Balloons | 452 | Intervals | Medium |
| 6 | Meeting Rooms II | 253 | Intervals | Medium |
| 7 | Car Pooling | 1094 | Intervals | Medium |
| 8 | Jump Game | 55 | Classic Greedy | Medium |
| 9 | Jump Game II | 45 | Classic Greedy | Medium |
| 10 | Gas Station | 134 | Classic Greedy | Medium |
| 11 | Assign Cookies | 455 | Classic Greedy | Easy |
| 12 | Best Time to Buy and Sell Stock II | 122 | Classic Greedy | Medium |
| 13 | Candy | 135 | Classic Greedy | Hard |
| 14 | Partition Labels | 763 | Classic Greedy | Medium |
| 15 | Hand of Straights | 846 | Classic Greedy | Medium |
| 16 | Boats to Save People | 881 | Classic Greedy | Medium |
| 17 | Majority Element | 169 | Classic Greedy | Easy |
| 18 | Task Scheduler | 621 | Classic Greedy | Medium |
| 19 | Subsets | 78 | Subsets and Combinations | Medium |
| 20 | Subsets II | 90 | Subsets and Combinations | Medium |
| 21 | Combinations | 77 | Subsets and Combinations | Medium |
| 22 | Combination Sum | 39 | Subsets and Combinations | Medium |
| 23 | Combination Sum II | 40 | Subsets and Combinations | Medium |
| 24 | Combination Sum III | 216 | Subsets and Combinations | Medium |
| 25 | Permutations | 46 | Permutations | Medium |
| 26 | Permutations II | 47 | Permutations | Medium |
| 27 | Letter Combinations of a Phone Number | 17 | Permutations | Medium |
| 28 | Generate Parentheses | 22 | Constraint Satisfaction | Medium |
| 29 | Palindrome Partitioning | 131 | Constraint Satisfaction | Medium |
| 30 | Restore IP Addresses | 93 | Constraint Satisfaction | Medium |
| 31 | Word Search | 79 | Grid and Board Search | Medium |
| 32 | N-Queens | 51 | Grid and Board Search | Hard |
| 33 | N-Queens II | 52 | Grid and Board Search | Hard |
| 34 | Sudoku Solver | 37 | Grid and Board Search | Hard |
| 35 | Unique Paths III | 980 | Grid and Board Search | Hard |
| 36 | Kth Largest Element | 215 | Divide and Conquer | Medium |

---

## Intervals

### Meeting Rooms — LeetCode 252

Given meeting intervals `[start, end]`, determine whether one person can attend all meetings without any overlap.

**Example:** `[[0,30],[5,10],[15,20]]` → `false`

```text
BRUTE FORCE | O(n²) | O(1)

Compare every pair of intervals; return false on the first overlap found.

------------------------------------------------------------------------------

OPTIMAL — SORT BY START | O(n log n) | O(1)

After sorting by start time, only adjacent intervals can possibly overlap.

sort by start
for i = 1 to n-1:
    if intervals[i][0] < intervals[i-1][1]: return false
return true
```

```csharp
public bool CanAttendMeetings(int[][] intervals)
{
    Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
    for (int i = 1; i < intervals.Length; i++)
        if (intervals[i][0] < intervals[i - 1][1]) return false;
    return true;
}
```

> **Key insight:** touching intervals `[1,5]` and `[5,8]` do not conflict — the overlap check must be strict `<`.

---

### Merge Intervals — LeetCode 56

Given an array of intervals, merge all overlapping intervals and return the non-overlapping result.

**Example:** `[[1,3],[2,6],[8,10],[15,18]]` → `[[1,6],[8,10],[15,18]]`

```text
BRUTE FORCE | O(n²) | O(n)

Repeatedly scan for any overlapping pair and merge them until none remain.

------------------------------------------------------------------------------

OPTIMAL — SORT BY START | O(n log n) | O(n)

Sort by start. Walk through: if the next interval's start <= last result end, extend;
otherwise emit the last and continue.

sort by start
result = [intervals[0]]
for each iv from index 1:
    last = result.last
    if iv[0] <= last[1]: last[1] = max(last[1], iv[1])
    else: result.add(iv)
return result
```

```csharp
public int[][] Merge(int[][] intervals)
{
    Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
    var res = new List<int[]> { intervals[0] };
    for (int i = 1; i < intervals.Length; i++)
    {
        var last = res[^1];
        if (intervals[i][0] <= last[1])
            last[1] = Math.Max(last[1], intervals[i][1]);
        else
            res.Add(intervals[i]);
    }
    return res.ToArray();
}
```

> **Key insight:** after sorting by start, only the last interval in the result can ever overlap the next candidate — no inner loop needed.

---

### Insert Interval — LeetCode 57

Given sorted non-overlapping intervals and a new interval, insert it and merge any overlaps. The input is already sorted — no re-sort needed.

**Example:** `[[1,3],[6,9]], newInterval=[2,5]` → `[[1,5],[6,9]]`

```text
OPTIMAL — SINGLE PASS | O(n) | O(n)

Three phases:
  1. Add all intervals ending before the new interval starts.
  2. Merge all intervals overlapping the new interval.
  3. Add remaining intervals unchanged.

i = 0
while intervals[i][1] < newI[0]: result.add(intervals[i++])
while intervals[i][0] <= newI[1]:
    newI[0] = min(newI[0], intervals[i][0])
    newI[1] = max(newI[1], intervals[i][1])
    i++
result.add(newI)
while i < n: result.add(intervals[i++])
```

```csharp
public int[][] Insert(int[][] intervals, int[] newI)
{
    var res = new List<int[]>();
    int i = 0, n = intervals.Length;
    while (i < n && intervals[i][1] < newI[0])
        res.Add(intervals[i++]);
    while (i < n && intervals[i][0] <= newI[1])
    {
        newI[0] = Math.Min(newI[0], intervals[i][0]);
        newI[1] = Math.Max(newI[1], intervals[i][1]);
        i++;
    }
    res.Add(newI);
    while (i < n) res.Add(intervals[i++]);
    return res.ToArray();
}
```

> **Key insight:** three clean while-loops (before / overlap / after) handle all edge cases without conditional branching.

---

### Non-overlapping Intervals — LeetCode 435

Return the minimum number of intervals to remove so the remaining intervals are non-overlapping.

**Example:** `[[1,2],[2,3],[3,4],[1,3]]` → `1` (remove `[1,3]`)

```text
BRUTE FORCE | O(2ⁿ) | O(1)

Try every subset; return the minimum removals that yield a non-overlapping set.

------------------------------------------------------------------------------

OPTIMAL — GREEDY SORT BY END | O(n log n) | O(1)

Equivalent to maximising the count of kept intervals (activity selection).
Sort by end; greedily keep each interval that starts >= last kept end.
Every skipped interval counts as a removal.

sort by end
lastEnd = INT_MIN, removed = 0
for each [s, e]:
    if s >= lastEnd: lastEnd = e      // keep
    else: removed++                   // remove (discard the one with larger end)
return removed
```

```csharp
public int EraseOverlapIntervals(int[][] intervals)
{
    Array.Sort(intervals, (a, b) => a[1].CompareTo(b[1]));
    int removed = 0, lastEnd = int.MinValue;
    foreach (var iv in intervals)
    {
        if (iv[0] >= lastEnd) lastEnd = iv[1];
        else removed++;
    }
    return removed;
}
```

> **Key insight:** minimum removals = n − maximum non-overlapping count; sort by end and greedily keep intervals to maximise what stays.

---

### Minimum Arrows to Burst Balloons — LeetCode 452

Each balloon spans `[xstart, xend]`. An arrow at x bursts all balloons with `xstart <= x <= xend`. Return the minimum arrows needed.

**Example:** `[[10,16],[2,8],[1,6],[7,12]]` → `2`

```text
BRUTE FORCE | O(n²) | O(1)

Repeatedly find overlapping groups and count them.

------------------------------------------------------------------------------

OPTIMAL — GREEDY SORT BY END | O(n log n) | O(1)

Sort by end. Shoot at the end of the first balloon; any balloon with start <= that
position is also burst. Advance to the next unbursted balloon and repeat.

sort by end
arrows = 0, arrowPos = LONG_MIN
for each [start, end]:
    if start > arrowPos: arrows++; arrowPos = end
return arrows
```

```csharp
public int FindMinArrowShots(int[][] points)
{
    Array.Sort(points, (a, b) => a[1].CompareTo(b[1]));
    int arrows = 0;
    long arrowPos = long.MinValue;
    foreach (var p in points)
    {
        if (p[0] > arrowPos) { arrows++; arrowPos = p[1]; }
    }
    return arrows;
}
```

> **Key insight:** touching balloons `[1,6]` and `[6,8]` share x=6 and ARE burst by the same arrow — use strict `>` to detect "not reached".

---

### Meeting Rooms II — LeetCode 253

Find the minimum number of conference rooms required so all meetings can run simultaneously.

This problem is owned by **[Heaps and Priority Queues](../HeapsAndPriorityQueues/Problems.md)**. Use a min-heap of end times: sort meetings by start; pop the heap when the earliest-ending room is free; push the current meeting's end time.

> **Key insight:** minimum rooms = maximum number of meetings active at any instant.

---

### Car Pooling — LeetCode 1094

A car has `capacity` seats. Given trips `[numPassengers, from, to]`, return whether all passengers can be served without exceeding capacity.

**Example:** `[[2,1,5],[3,3,7]], capacity=4` → `false`

```text
BRUTE FORCE | O(n · maxStop) | O(maxStop)

For each mile marker, compute passengers currently in the car.

------------------------------------------------------------------------------

SWEEP LINE | O(n log n) | O(n)

Emit +passengers at pickup, -passengers at dropoff. Sort events; track running sum.

------------------------------------------------------------------------------

OPTIMAL — DIFFERENCE ARRAY | O(n + maxStop) | O(maxStop)

Stops are bounded [0, 1000]. Use a difference array for O(1) updates, O(maxStop) scan.

diff[from] += numPassengers
diff[to]   -= numPassengers
prefix-sum the array; if any prefix sum > capacity: return false
```

```csharp
public bool CarPooling(int[][] trips, int capacity)
{
    int[] diff = new int[1001];
    foreach (var t in trips)
    {
        diff[t[1]] += t[0];
        diff[t[2]] -= t[0];
    }
    int curr = 0;
    for (int i = 0; i <= 1000; i++)
    {
        curr += diff[i];
        if (curr > capacity) return false;
    }
    return true;
}
```

> **Key insight:** bounded stop range [0, 1000] makes a difference array simpler and faster than sorting events.

---

## Classic Greedy

### Jump Game — LeetCode 55

Given `nums[i]` = max jump length from index `i`, determine if you can reach the last index starting from index 0.

**Example:** `[2,3,1,1,4]` → `true`; `[3,2,1,0,4]` → `false`

```text
DFS | O(2ⁿ) | O(n)

Explore every possible jump path; memoisation reduces to O(n²).

------------------------------------------------------------------------------

DP | O(n²) | O(n)

dp[i] = can we reach the end from index i? Work backwards from n-1.

dp[n-1] = true
for i = n-2 down to 0:
    for j = i+1 to min(i+nums[i], n-1):
        if dp[j]: dp[i] = true; break
return dp[0]

------------------------------------------------------------------------------

OPTIMAL — GREEDY | O(n) | O(1)

Track farthest reachable index. If current index ever exceeds it, we are stuck.

reach = 0
for i = 0 to n-1:
    if i > reach: return false
    reach = max(reach, i + nums[i])
return true
```

```csharp
public bool CanJump(int[] nums)
{
    int reach = 0;
    for (int i = 0; i < nums.Length; i++)
    {
        if (i > reach) return false;
        reach = Math.Max(reach, i + nums[i]);
    }
    return true;
}
```

> **Key insight:** once we know the farthest index reachable from positions 0..i, we never need to revisit earlier indices.

---

### Jump Game II — LeetCode 45

Return the minimum number of jumps to reach the last index (always reachable).

**Example:** `[2,3,1,1,4]` → `2`

```text
DFS | O(2ⁿ) | O(n)

Explore all jump paths; return minimum.

------------------------------------------------------------------------------

DP | O(n²) | O(n)

dp[i] = minimum jumps to reach index i from 0.

------------------------------------------------------------------------------

OPTIMAL — GREEDY (implicit BFS levels) | O(n) | O(1)

currentEnd = right boundary of the current jump level.
farthest   = best right boundary reachable in the next jump.
When i reaches currentEnd, take a jump and advance the boundary.

jumps = 0, currentEnd = 0, farthest = 0
for i = 0 to n-2:
    farthest = max(farthest, i + nums[i])
    if i == currentEnd: jumps++; currentEnd = farthest
return jumps
```

```csharp
public int Jump(int[] nums)
{
    int jumps = 0, currentEnd = 0, farthest = 0;
    for (int i = 0; i < nums.Length - 1; i++)
    {
        farthest = Math.Max(farthest, i + nums[i]);
        if (i == currentEnd) { jumps++; currentEnd = farthest; }
    }
    return jumps;
}
```

> **Key insight:** think BFS levels — `currentEnd` is the boundary of the current level; crossing it costs exactly one jump.

---

### Gas Station — LeetCode 134

N stations in a circle. `gas[i]` available, `cost[i]` to reach next. Find the starting index to complete the circuit, or −1.

**Example:** `gas=[1,2,3,4,5], cost=[3,4,5,1,2]` → `3`

```text
BRUTE FORCE | O(n²) | O(1)

Try starting from each station and simulate the full circuit.

------------------------------------------------------------------------------

OPTIMAL — GREEDY | O(n) | O(1)

Key observations:
1. If total gas >= total cost, a valid start always exists (exactly one).
2. If running tank < 0 at station i, no station between start and i can be
   the valid start — reset candidate to i+1.

totalTank = 0, currentTank = 0, start = 0
for i = 0 to n-1:
    gain = gas[i] - cost[i]
    totalTank += gain; currentTank += gain
    if currentTank < 0: start = i+1; currentTank = 0
return totalTank >= 0 ? start : -1
```

```csharp
public int CanCompleteCircuit(int[] gas, int[] cost)
{
    int total = 0, tank = 0, start = 0;
    for (int i = 0; i < gas.Length; i++)
    {
        int gain = gas[i] - cost[i];
        total += gain;
        tank += gain;
        if (tank < 0) { start = i + 1; tank = 0; }
    }
    return total >= 0 ? start : -1;
}
```

> **Key insight:** the last reset point is guaranteed to be the answer if a solution exists — no second pass needed.

---

### Assign Cookies — LeetCode 455

Each child has greed factor `g[i]`; each cookie has size `s[j]`. Cookie satisfies child if `s[j] >= g[i]`. Maximise the number of content children.

**Example:** `g=[1,2,3], s=[1,1]` → `1`

```text
OPTIMAL — GREEDY TWO POINTERS | O(n log n) | O(1)

Sort both. Satisfy the least greedy child first with the smallest sufficient cookie.
If the smallest cookie fits, advance both pointers; otherwise discard the cookie.

sort g, sort s
i = 0, j = 0
while i < g.length and j < s.length:
    if s[j] >= g[i]: i++
    j++
return i
```

```csharp
public int FindContentChildren(int[] g, int[] s)
{
    Array.Sort(g);
    Array.Sort(s);
    int i = 0, j = 0;
    while (i < g.Length && j < s.Length)
    {
        if (s[j] >= g[i]) i++;
        j++;
    }
    return i;
}
```

> **Key insight:** always satisfy the least greedy child first — this wastes the fewest cookie sizes and leaves larger cookies for greedier children.

---

### Best Time to Buy and Sell Stock II — LeetCode 122

Make unlimited buy/sell transactions (cannot hold two stocks simultaneously). Maximise total profit.

**Example:** `[7,1,5,3,6,4]` → `7`

```text
OPTIMAL — GREEDY | O(n) | O(1)

Capture every upward day-to-day price difference.
This equals the sum of profits from all optimal non-overlapping transactions.

profit = 0
for i = 1 to n-1:
    if prices[i] > prices[i-1]: profit += prices[i] - prices[i-1]
return profit
```

```csharp
public int MaxProfit(int[] prices)
{
    int profit = 0;
    for (int i = 1; i < prices.Length; i++)
        if (prices[i] > prices[i - 1]) profit += prices[i] - prices[i - 1];
    return profit;
}
```

> **Key insight:** every positive day-to-day delta is a profitable micro-transaction; summing them equals the optimal buy-low-sell-high strategy.

---

### Candy — LeetCode 135

Give each child at least 1 candy. A child with a higher rating than a neighbour must get strictly more candies. Minimise total candies.

**Example:** `[1,0,2]` → `5` (candies: `[2,1,2]`)

```text
BRUTE FORCE | O(n²) | O(n)

Repeatedly scan and adjust until all constraints are satisfied.

------------------------------------------------------------------------------

OPTIMAL — TWO-PASS GREEDY | O(n) | O(n)

Left pass enforces the left-neighbour constraint.
Right pass enforces the right-neighbour constraint.
Taking max of both passes satisfies both directions simultaneously.

candies = [1, 1, ..., 1]
left → right: if ratings[i] > ratings[i-1]: candies[i] = candies[i-1] + 1
right → left: if ratings[i] > ratings[i+1]: candies[i] = max(candies[i], candies[i+1]+1)
return sum(candies)
```

```csharp
public int Candy(int[] ratings)
{
    int n = ratings.Length;
    int[] c = new int[n];
    Array.Fill(c, 1);
    for (int i = 1; i < n; i++)
        if (ratings[i] > ratings[i - 1]) c[i] = c[i - 1] + 1;
    for (int i = n - 2; i >= 0; i--)
        if (ratings[i] > ratings[i + 1]) c[i] = Math.Max(c[i], c[i + 1] + 1);
    return c.Sum();
}
```

> **Key insight:** two independent directional passes are sufficient — each only looks one way, and taking the max of both results satisfies both constraints.

---

### Partition Labels — LeetCode 763

Partition string `s` into as many parts as possible so each character appears in at most one part. Return part sizes.

**Example:** `"ababcbacadefegdehijhklij"` → `[9,7,8]`

```text
OPTIMAL — GREEDY | O(n) | O(1)

Pre-compute last[c] = last index of character c.
Scan left to right extending current partition end to last[s[i]].
When i reaches end, emit the partition size and start a new one.

last[c] = last occurrence index of c
start = 0, end = 0
for i = 0 to n-1:
    end = max(end, last[s[i]])
    if i == end: result.add(i - start + 1); start = i + 1
return result
```

```csharp
public IList<int> PartitionLabels(string s)
{
    int[] last = new int[26];
    for (int i = 0; i < s.Length; i++) last[s[i] - 'a'] = i;
    var res = new List<int>();
    int start = 0, end = 0;
    for (int i = 0; i < s.Length; i++)
    {
        end = Math.Max(end, last[s[i] - 'a']);
        if (i == end) { res.Add(end - start + 1); start = i + 1; }
    }
    return res;
}
```

> **Key insight:** a partition can close at index `i` only when every character seen so far has its last occurrence at or before `i`.

---

### Hand of Straights — LeetCode 846

Given a hand of cards and `groupSize`, determine if all cards can be arranged into groups of `groupSize` consecutive values.

**Example:** `hand=[1,2,3,6,2,3,4,7,8], groupSize=3` → `true`

```text
OPTIMAL — GREEDY + SORTED FREQUENCY MAP | O(n log n) | O(n)

Always fill groups starting from the smallest available card.
If the smallest card appears k times, we must start exactly k groups from it.

if hand.length % groupSize != 0: return false
freq = sorted frequency map of hand
for each (card, count) in ascending order:
    if count == 0: continue
    for j = 0 to groupSize-1:
        if freq[card+j] < count: return false
        freq[card+j] -= count
return true
```

```csharp
public bool IsNStraightHand(int[] hand, int groupSize)
{
    if (hand.Length % groupSize != 0) return false;
    var freq = new SortedDictionary<int, int>();
    foreach (int c in hand)
        freq[c] = freq.GetValueOrDefault(c) + 1;
    foreach (var (card, count) in freq)
    {
        if (count == 0) continue;
        for (int j = 0; j < groupSize; j++)
        {
            if (!freq.TryGetValue(card + j, out int f) || f < count)
                return false;
            freq[card + j] = f - count;
        }
    }
    return true;
}
```

> **Key insight:** always start filling from the smallest unprocessed card — any other starting point leaves an ungroupable gap.

---

### Boats to Save People — LeetCode 881

Each boat holds at most 2 people with total weight <= `limit`. Return the minimum number of boats needed.

**Example:** `people=[3,2,2,1], limit=3` → `3`

```text
OPTIMAL — GREEDY TWO POINTERS | O(n log n) | O(1)

Sort. Pair the heaviest with the lightest if they fit together;
otherwise the heaviest goes alone. Either way, one boat is used per iteration.

sort people
lo = 0, hi = n-1, boats = 0
while lo <= hi:
    if people[lo] + people[hi] <= limit: lo++
    hi--; boats++
return boats
```

```csharp
public int NumRescueBoats(int[] people, int limit)
{
    Array.Sort(people);
    int lo = 0, hi = people.Length - 1, boats = 0;
    while (lo <= hi)
    {
        if (people[lo] + people[hi] <= limit) lo++;
        hi--;
        boats++;
    }
    return boats;
}
```

> **Key insight:** the heaviest person either pairs with the lightest (if possible) or goes alone — no other pairing can do better.

---

### Majority Element — LeetCode 169

Find the element appearing more than n/2 times in an array (guaranteed to exist).

Full analysis in [Arrays and Strings](../ArraysAndStrings/Problems.md). Boyer-Moore Voting (greedy): maintain a candidate and counter. On mismatch decrement; when counter hits 0 reset to current element. The majority element always survives. O(n) time, O(1) space.

> **Key insight:** majority element votes cancel all minority votes and still have surplus.

---

### Task Scheduler — LeetCode 621

Schedule CPU tasks with cooldown `n` between identical tasks. Return minimum intervals needed.

Full solution in [Heaps and Priority Queues](../HeapsAndPriorityQueues/Problems.md). Greedy formula: `max(tasks.Length, (maxFreq - 1) * (n + 1) + countOfMaxFreq)`.

> **Key insight:** idle slots are entirely determined by the frequency of the most common task.

---

## Subsets and Combinations

### Subsets — LeetCode 78

Return all subsets of an array of unique integers (the power set).

**Example:** `[1,2,3]` → `[[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]`

```text
OPTIMAL — BACKTRACKING | O(n · 2ⁿ) | O(n)

Record the current path at every node (not just leaves) to capture all subsets.
Recurse forward from index start to avoid generating duplicates by ordering.

backtrack(start):
    result.add(copy(cur))
    for i = start to n-1:
        cur.add(nums[i])
        backtrack(i + 1)
        cur.removeLast()
```

```csharp
public IList<IList<int>> Subsets(int[] nums)
{
    var res = new List<IList<int>>();
    void Bt(int start, List<int> cur)
    {
        res.Add(new List<int>(cur));
        for (int i = start; i < nums.Length; i++)
        {
            cur.Add(nums[i]);
            Bt(i + 1, cur);
            cur.RemoveAt(cur.Count - 1);
        }
    }
    Bt(0, new List<int>());
    return res;
}
```

> **Key insight:** add to results at every node (before the loop), not only at leaves — this captures the empty set and all partial subsets.

---

### Subsets II — LeetCode 90

Return all unique subsets when the input may contain duplicates.

**Example:** `[1,2,2]` → `[[],[1],[1,2],[1,2,2],[2],[2,2]]`

```text
OPTIMAL — BACKTRACKING + DEDUP | O(n · 2ⁿ) | O(n)

Sort first. Skip nums[i] when it equals nums[i-1] AND i > start.
i > start (not i > 0) limits the skip to siblings at the same recursion depth.

Trace for sorted [1,2,2]:
  Bt(0): add []
    i=0 (1): add [1] → Bt(1): add [1]
      i=1 (2): add [1,2] → Bt(2): add [1,2]
        i=2 (2): add [1,2,2] → Bt(3): add [1,2,2] ✓
      i=2 (2): i(2) > start(1) AND nums[2]==nums[1] → SKIP
    i=1 (2): add [2] → Bt(2): add [2]
      i=2 (2): add [2,2] → Bt(3): add [2,2] ✓
    i=2 (2): i(2) > start(0) AND nums[2]==nums[1] → SKIP
Result: [[],[1],[1,2],[1,2,2],[2],[2,2]] ✓

sort(nums)
backtrack(start):
    result.add(copy(cur))
    for i = start to n-1:
        if i > start AND nums[i] == nums[i-1]: continue
        cur.add(nums[i])
        backtrack(i + 1)
        cur.removeLast()
```

```csharp
public IList<IList<int>> SubsetsWithDup(int[] nums)
{
    Array.Sort(nums);
    var res = new List<IList<int>>();
    void Bt(int start, List<int> cur)
    {
        res.Add(new List<int>(cur));
        for (int i = start; i < nums.Length; i++)
        {
            if (i > start && nums[i] == nums[i - 1]) continue;
            cur.Add(nums[i]);
            Bt(i + 1, cur);
            cur.RemoveAt(cur.Count - 1);
        }
    }
    Bt(0, new List<int>());
    return res;
}
```

> **Key insight:** `i > start` (not `i > 0`) restricts the duplicate skip to siblings at the **same recursion depth** — the same value is still allowed as the first pick at a deeper level.

---

### Combinations — LeetCode 77

Return all combinations of `k` numbers chosen from `[1, n]`.

**Example:** `n=4, k=2` → `[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]`

```text
OPTIMAL — BACKTRACKING WITH PRUNING | O(k · C(n,k)) | O(k)

Standard subsets shape with a size constraint.
Upper-bound pruning: if fewer candidates remain than slots needed, stop.

backtrack(start):
    if cur.size == k: result.add(copy(cur)); return
    need = k - cur.size
    for i = start to n - need + 1:
        cur.add(i)
        backtrack(i + 1)
        cur.removeLast()
```

```csharp
public IList<IList<int>> Combine(int n, int k)
{
    var res = new List<IList<int>>();
    void Bt(int start, List<int> cur)
    {
        if (cur.Count == k) { res.Add(new List<int>(cur)); return; }
        int need = k - cur.Count;
        for (int i = start; i <= n - need + 1; i++)
        {
            cur.Add(i);
            Bt(i + 1, cur);
            cur.RemoveAt(cur.Count - 1);
        }
    }
    Bt(1, new List<int>());
    return res;
}
```

> **Key insight:** the upper bound `n - (k - cur.Count) + 1` prunes branches that cannot fill the remaining slots.

---

### Combination Sum — LeetCode 39

Find all combinations from distinct `candidates` summing to `target`. Each candidate may be used unlimited times.

**Example:** `candidates=[2,3,6,7], target=7` → `[[2,2,3],[7]]`

```text
OPTIMAL — BACKTRACKING | O(n^(T/m)) | O(T/m)

T = target, m = minimum candidate value.
Reuse allowed: pass i (not i+1) when recursing.
Sort and break early when candidate > remaining.

sort(candidates)
backtrack(start, remaining):
    if remaining == 0: result.add(copy(cur)); return
    for i = start to n-1:
        if candidates[i] > remaining: break
        cur.add(candidates[i])
        backtrack(i, remaining - candidates[i])   // i, not i+1
        cur.removeLast()
```

```csharp
public IList<IList<int>> CombinationSum(int[] candidates, int target)
{
    Array.Sort(candidates);
    var res = new List<IList<int>>();
    void Bt(int start, int rem, List<int> cur)
    {
        if (rem == 0) { res.Add(new List<int>(cur)); return; }
        for (int i = start; i < candidates.Length; i++)
        {
            if (candidates[i] > rem) break;
            cur.Add(candidates[i]);
            Bt(i, rem - candidates[i], cur);
            cur.RemoveAt(cur.Count - 1);
        }
    }
    Bt(0, target, new List<int>());
    return res;
}
```

> **Key insight:** passing `i` (not `i+1`) allows reusing the same candidate; sorting enables the early `break` to prune impossible branches.

---

### Combination Sum II — LeetCode 40

Find all unique combinations from `candidates` (may contain duplicates) summing to `target`. Each element used at most once.

**Example:** `[10,1,2,7,6,1,5], target=8` → `[[1,1,6],[1,2,5],[1,7],[2,6]]`

```text
OPTIMAL — BACKTRACKING + DEDUP | O(n · 2ⁿ) | O(n)

Sort. Skip duplicates at the same recursion level: i > start AND candidates[i] == candidates[i-1].
Pass i+1 (no reuse). Break when candidate > remaining.

sort(candidates)
backtrack(start, remaining):
    if remaining == 0: result.add(copy(cur)); return
    for i = start to n-1:
        if i > start AND candidates[i] == candidates[i-1]: continue
        if candidates[i] > remaining: break
        cur.add(candidates[i])
        backtrack(i + 1, remaining - candidates[i])
        cur.removeLast()
```

```csharp
public IList<IList<int>> CombinationSum2(int[] candidates, int target)
{
    Array.Sort(candidates);
    var res = new List<IList<int>>();
    void Bt(int start, int rem, List<int> cur)
    {
        if (rem == 0) { res.Add(new List<int>(cur)); return; }
        for (int i = start; i < candidates.Length; i++)
        {
            if (i > start && candidates[i] == candidates[i - 1]) continue;
            if (candidates[i] > rem) break;
            cur.Add(candidates[i]);
            Bt(i + 1, rem - candidates[i], cur);
            cur.RemoveAt(cur.Count - 1);
        }
    }
    Bt(0, target, new List<int>());
    return res;
}
```

> **Key insight:** `i > start` restricts the duplicate skip to sibling choices at the same depth — the same value can still be the first pick at a deeper level.

---

### Combination Sum III — LeetCode 216

Find all combinations of exactly `k` numbers from 1–9 that sum to `n`. Each number used at most once.

**Example:** `k=3, n=7` → `[[1,2,4]]`

```text
OPTIMAL — BACKTRACKING | O(k · C(9,k)) | O(k)

Digits 1–9, no duplicates. Two termination conditions: cur.size == k AND remaining == 0.

backtrack(start, remaining):
    if cur.size == k AND remaining == 0: result.add(copy(cur)); return
    if cur.size == k OR remaining <= 0: return
    for i = start to 9:
        cur.add(i)
        backtrack(i + 1, remaining - i)
        cur.removeLast()
```

```csharp
public IList<IList<int>> CombinationSum3(int k, int n)
{
    var res = new List<IList<int>>();
    void Bt(int start, int rem, List<int> cur)
    {
        if (cur.Count == k && rem == 0) { res.Add(new List<int>(cur)); return; }
        if (cur.Count == k || rem <= 0) return;
        for (int i = start; i <= 9; i++)
        {
            cur.Add(i);
            Bt(i + 1, rem - i, cur);
            cur.RemoveAt(cur.Count - 1);
        }
    }
    Bt(1, n, new List<int>());
    return res;
}
```

> **Key insight:** the fixed 1–9 domain bounds the search space tightly; two termination conditions (count and sum) provide clean early exits.

---

## Permutations

### Permutations — LeetCode 46

Return all permutations of an array of unique integers.

**Example:** `[1,2,3]` → `[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]`

```text
OPTIMAL — BACKTRACKING + used[] | O(n · n!) | O(n)

For each position, try every unused element.
Unlike subsets there is no start index — every unused element is a candidate at every position.

used = boolean array of false
backtrack():
    if cur.size == n: result.add(copy(cur)); return
    for i = 0 to n-1:
        if used[i]: continue
        used[i] = true; cur.add(nums[i])
        backtrack()
        used[i] = false; cur.removeLast()
```

```csharp
public IList<IList<int>> Permute(int[] nums)
{
    var res = new List<IList<int>>();
    bool[] used = new bool[nums.Length];
    void Bt(List<int> cur)
    {
        if (cur.Count == nums.Length) { res.Add(new List<int>(cur)); return; }
        for (int i = 0; i < nums.Length; i++)
        {
            if (used[i]) continue;
            used[i] = true;
            cur.Add(nums[i]);
            Bt(cur);
            used[i] = false;
            cur.RemoveAt(cur.Count - 1);
        }
    }
    Bt(new List<int>());
    return res;
}
```

> **Key insight:** the `used[]` array (not a `start` index) is the right structure for permutations — any unused element can go at any position.

---

### Permutations II — LeetCode 47

Return all unique permutations when the input may contain duplicates.

**Example:** `[1,1,2]` → `[[1,1,2],[1,2,1],[2,1,1]]`

```text
OPTIMAL — BACKTRACKING + used[] + DEDUP | O(n · n!) | O(n)

Sort first. The dedup condition is:
    i > 0 AND nums[i] == nums[i-1] AND !used[i-1]

Why !used[i-1]?
  Case A — used[i-1] is TRUE:
    nums[i-1] was placed earlier on the CURRENT PATH.
    Placing nums[i] now gives a DIFFERENT ordering (nums[i-1] precedes nums[i]
    somewhere earlier in the permutation). → ALLOW IT.

  Case B — used[i-1] is FALSE:
    nums[i-1] has NOT been placed yet at this recursion level.
    We would be placing the later duplicate (nums[i]) BEFORE the earlier one (nums[i-1])
    at this level, creating a permutation identical to one where nums[i-1] is placed first.
    → SKIP IT.

Trace for sorted [1a, 1b, 2]:
  Bt(): try i=0 (1a): used[0]=true
    try i=1 (1b): used[1]=true
      try i=2 (2): → [1a,1b,2] ✓
    try i=2 (2): used[2]=true
      try i=1 (1b): → [1a,2,1b] ✓
  try i=1 (1b): i>0, nums[1]==nums[0], !used[0]=true → SKIP (avoids [1b,1a,2])
  try i=2 (2): used[2]=true
    try i=0 (1a): used[0]=true
      try i=1 (1b): → [2,1a,1b] ✓
    try i=1 (1b): i>0, nums[1]==nums[0], !used[0]=true → SKIP
Final: [[1,1,2],[1,2,1],[2,1,1]] ✓

sort(nums)
backtrack():
    if cur.size == n: result.add(copy(cur)); return
    for i = 0 to n-1:
        if used[i]: continue
        if i > 0 AND nums[i] == nums[i-1] AND !used[i-1]: continue
        used[i] = true; cur.add(nums[i])
        backtrack()
        used[i] = false; cur.removeLast()
```

```csharp
public IList<IList<int>> PermuteUnique(int[] nums)
{
    Array.Sort(nums);
    var res = new List<IList<int>>();
    bool[] used = new bool[nums.Length];
    void Bt(List<int> cur)
    {
        if (cur.Count == nums.Length) { res.Add(new List<int>(cur)); return; }
        for (int i = 0; i < nums.Length; i++)
        {
            if (used[i]) continue;
            if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;
            used[i] = true;
            cur.Add(nums[i]);
            Bt(cur);
            used[i] = false;
            cur.RemoveAt(cur.Count - 1);
        }
    }
    Bt(new List<int>());
    return res;
}
```

> **Key insight:** `!used[i-1]` skips placing `nums[i]` before its identical predecessor at the same recursion level — enforcing a canonical left-to-right ordering for equal elements eliminates all duplicate permutations.

---

### Letter Combinations of a Phone Number — LeetCode 17

Given a digit string (`2`–`9`), return all letter combinations it could represent on a phone keypad.

**Example:** `"23"` → `["ad","ae","af","bd","be","bf","cd","ce","cf"]`

```text
OPTIMAL — BACKTRACKING | O(4ⁿ) | O(n)

Map each digit to its letters. At position idx, try each letter for digits[idx].
Writing into a fixed-size char array indexed by position makes explicit undo unnecessary.

mapping = ["","","abc","def","ghi","jkl","mno","pqrs","tuv","wxyz"]
backtrack(idx):
    if idx == digits.length: result.add(new string(buf)); return
    for each letter in mapping[digits[idx]]:
        buf[idx] = letter
        backtrack(idx + 1)
```

```csharp
public IList<string> LetterCombinations(string digits)
{
    if (digits.Length == 0) return new List<string>();
    string[] map = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"];
    var res = new List<string>();
    void Bt(int idx, char[] buf)
    {
        if (idx == digits.Length) { res.Add(new string(buf)); return; }
        foreach (char c in map[digits[idx] - '0'])
        {
            buf[idx] = c;
            Bt(idx + 1, buf);
        }
    }
    Bt(0, new char[digits.Length]);
    return res;
}
```

> **Key insight:** writing into a fixed-size buffer indexed by position eliminates the explicit undo step — overwriting the slot is its own "undo" on the next sibling iteration.

---

## Constraint Satisfaction

### Generate Parentheses — LeetCode 22

Given `n` pairs of parentheses, generate all valid combinations.

**Example:** `n=3` → `["((()))","(()())","(())()","()(())","()()()"]`

```text
OPTIMAL — BACKTRACKING | O(4ⁿ / sqrt(n)) | O(n)

The count equals the nth Catalan number; each string has length 2n.
Two constraints: open < n allows another '('; close < open allows another ')'.
Writing into a fixed-size buffer eliminates explicit undo.

backtrack(open, close, idx):
    if idx == 2n: result.add(new string(buf)); return
    if open < n:    buf[idx]='('; backtrack(open+1, close, idx+1)
    if close < open: buf[idx]=')'; backtrack(open, close+1, idx+1)
```

```csharp
public IList<string> GenerateParenthesis(int n)
{
    var res = new List<string>();
    char[] buf = new char[2 * n];
    void Bt(int open, int close, int idx)
    {
        if (idx == 2 * n) { res.Add(new string(buf)); return; }
        if (open < n) { buf[idx] = '('; Bt(open + 1, close, idx + 1); }
        if (close < open) { buf[idx] = ')'; Bt(open, close + 1, idx + 1); }
    }
    Bt(0, 0, 0);
    return res;
}
```

> **Key insight:** the two numeric constraints (`open < n`, `close < open`) replace all explicit validity checks and implicitly prune every invalid branch.

---

### Palindrome Partitioning — LeetCode 131

Partition string `s` so every substring is a palindrome. Return all such partitions.

**Example:** `"aab"` → `[["a","a","b"],["aa","b"]]`

```text
BACKTRACKING | O(n · 2ⁿ) | O(n)

Try every cut; recurse if s[start..end] is a palindrome. O(n) check per substring.

------------------------------------------------------------------------------

OPTIMAL — BACKTRACKING + DP PRECOMPUTE | O(n · 2ⁿ) | O(n²)

Precompute isPalin[i][j] in O(n²) so each palindrome check is O(1).

isPalin[i][j] = (s[i] == s[j]) AND (j-i < 2 OR isPalin[i+1][j-1])

for length = 1 to n:
    for i = 0 to n-length:
        j = i+length-1
        isPalin[i][j] = s[i]==s[j] AND (length < 3 OR isPalin[i+1][j-1])

backtrack(start):
    if start == n: result.add(copy(cur)); return
    for end = start to n-1:
        if isPalin[start][end]:
            cur.add(s[start..end+1])
            backtrack(end + 1)
            cur.removeLast()
```

```csharp
public IList<IList<string>> Partition(string s)
{
    int n = s.Length;
    bool[,] p = new bool[n, n];
    for (int len = 1; len <= n; len++)
        for (int i = 0; i <= n - len; i++)
        {
            int j = i + len - 1;
            p[i, j] = s[i] == s[j] && (len < 3 || p[i + 1, j - 1]);
        }
    var res = new List<IList<string>>();
    void Bt(int start, List<string> cur)
    {
        if (start == n) { res.Add(new List<string>(cur)); return; }
        for (int end = start; end < n; end++)
        {
            if (!p[start, end]) continue;
            cur.Add(s[start..(end + 1)]);
            Bt(end + 1, cur);
            cur.RemoveAt(cur.Count - 1);
        }
    }
    Bt(0, new List<string>());
    return res;
}
```

> **Key insight:** DP precomputation turns O(n) palindrome checks into O(1), reducing the constant factor significantly for dense inputs.

---

### Restore IP Addresses — LeetCode 93

Given a string of digits, return all valid IPv4 addresses formable by inserting exactly 3 dots.

**Example:** `"25525511135"` → `["255.255.11.135","255.255.111.35"]`

```text
OPTIMAL — BACKTRACKING | O(1) | O(1)

Exactly 4 segments, each 1–3 digits, value 0–255, no leading zeros.
At most 3^3 = 27 distinct splits regardless of input length — effectively constant.

backtrack(start, parts):
    if parts.size == 4 AND start == n:
        result.add(join(parts, '.')); return
    if parts.size == 4 OR start == n: return
    for len = 1 to 3:
        if start+len > n: break
        seg = s[start..start+len-1]
        if len > 1 AND seg[0] == '0': break    // leading zero
        if int(seg) > 255: break
        parts.add(seg); backtrack(start+len, parts); parts.removeLast()
```

```csharp
public IList<string> RestoreIpAddresses(string s)
{
    var res = new List<string>();
    void Bt(int start, List<string> parts)
    {
        if (parts.Count == 4 && start == s.Length)
        {
            res.Add(string.Join('.', parts));
            return;
        }
        if (parts.Count == 4 || start == s.Length) return;
        for (int len = 1; len <= 3 && start + len <= s.Length; len++)
        {
            string seg = s.Substring(start, len);
            if (len > 1 && seg[0] == '0') break;
            if (int.Parse(seg) > 255) break;
            parts.Add(seg);
            Bt(start + len, parts);
            parts.RemoveAt(parts.Count - 1);
        }
    }
    Bt(0, new List<string>());
    return res;
}
```

> **Key insight:** the search space is O(1) regardless of input length — at most 3 choices per segment across 3 cut points gives 27 paths total.

---

## Grid and Board Search

### Word Search — LeetCode 79

Given an m x n character grid, return `true` if `word` exists as a path of adjacent (horizontal/vertical) cells, each used at most once.

**Example:** `board=[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word="ABCCED"` → `true`

```text
BACKTRACKING (visited matrix) | O(m · n · 4^L) | O(m · n)

Mark cells in a separate boolean matrix on entry; unmark on return.

------------------------------------------------------------------------------

OPTIMAL — BACKTRACKING (in-place sentinel) | O(m · n · 4^L) | O(L)

Temporarily replace board[r][c] with '#' to mark it visited.
Restore on backtrack. Space drops from O(m·n) to O(L) (stack depth only).

dfs(r, c, idx):
    if idx == word.length: return true
    if out of bounds OR board[r][c] != word[idx]: return false
    tmp = board[r][c]; board[r][c] = '#'
    found = dfs(r+1,c,idx+1) || dfs(r-1,c,idx+1)
          || dfs(r,c+1,idx+1) || dfs(r,c-1,idx+1)
    board[r][c] = tmp
    return found
```

```csharp
public bool Exist(char[][] board, string word)
{
    int rows = board.Length, cols = board[0].Length;
    bool Dfs(int r, int c, int idx)
    {
        if (idx == word.Length) return true;
        if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] != word[idx])
            return false;
        char tmp = board[r][c];
        board[r][c] = '#';
        bool found = Dfs(r + 1, c, idx + 1) || Dfs(r - 1, c, idx + 1)
                  || Dfs(r, c + 1, idx + 1) || Dfs(r, c - 1, idx + 1);
        board[r][c] = tmp;
        return found;
    }
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (Dfs(r, c, 0)) return true;
    return false;
}
```

> **Key insight:** the in-place `'#'` sentinel eliminates the O(m·n) visited array — space drops to O(L) for the recursion stack alone.

---

### N-Queens — LeetCode 51

Place `n` queens on an n x n board so no two queens share a row, column, or diagonal. Return all solutions as boards.

**Example:** `n=4` → `[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]`

```text
BRUTE FORCE | O(nⁿ) | O(n)

Try every column for every row; validate the full board at the end.

------------------------------------------------------------------------------

OPTIMAL — BACKTRACKING + CONSTRAINT SETS | O(n!) | O(n)

Place one queen per row. Track occupied columns, main diagonals (row-col),
and anti-diagonals (row+col) for O(1) conflict checks.

col[], d1[row-col+n], d2[row+col] — boolean arrays
backtrack(row):
    if row == n: record board; return
    for c = 0 to n-1:
        if col[c] OR d1[row-c+n] OR d2[row+c]: continue
        mark; board[row][c]='Q'; backtrack(row+1); unmark; board[row][c]='.'
```

```csharp
public IList<IList<string>> SolveNQueens(int n)
{
    var res = new List<IList<string>>();
    bool[] col = new bool[n], d1 = new bool[2 * n], d2 = new bool[2 * n];
    char[][] board = Enumerable.Range(0, n)
        .Select(_ => Enumerable.Repeat('.', n).ToArray()).ToArray();
    void Bt(int row)
    {
        if (row == n) { res.Add(board.Select(r => new string(r)).ToList()); return; }
        for (int c = 0; c < n; c++)
        {
            if (col[c] || d1[row - c + n] || d2[row + c]) continue;
            col[c] = d1[row - c + n] = d2[row + c] = true;
            board[row][c] = 'Q';
            Bt(row + 1);
            col[c] = d1[row - c + n] = d2[row + c] = false;
            board[row][c] = '.';
        }
    }
    Bt(0);
    return res;
}
```

> **Key insight:** three boolean arrays give O(1) conflict checks; one queen per row means the search tree has at most n! leaves before pruning.

---

### N-Queens II — LeetCode 52

Count the number of distinct N-Queens solutions (no board materialisation needed).

```text
OPTIMAL — BACKTRACKING + CONSTRAINT SETS | O(n!) | O(n)

Identical to N-Queens but increment a counter instead of recording the board.
A bitmask variant encodes the three sets as integers and uses bitwise ops for speed.
```

```csharp
public int TotalNQueens(int n)
{
    int count = 0;
    bool[] col = new bool[n], d1 = new bool[2 * n], d2 = new bool[2 * n];
    void Bt(int row)
    {
        if (row == n) { count++; return; }
        for (int c = 0; c < n; c++)
        {
            if (col[c] || d1[row - c + n] || d2[row + c]) continue;
            col[c] = d1[row - c + n] = d2[row + c] = true;
            Bt(row + 1);
            col[c] = d1[row - c + n] = d2[row + c] = false;
        }
    }
    Bt(0);
    return count;
}
```

> **Key insight:** omitting board construction reduces the constant factor; a bitmask version using `~(cols|diag|anti) & available` is fastest for large n.

---

### Sudoku Solver — LeetCode 37

Fill a 9x9 Sudoku board in-place: each digit 1–9 appears exactly once per row, column, and 3x3 box.

**Example:** standard Sudoku input with some cells pre-filled → completed board.

```text
OPTIMAL — BACKTRACKING + CONSTRAINT ARRAYS | O(9^m) | O(1)

m = number of empty cells. Pre-fill constraint arrays from the given cells.
For each empty cell, try digits 1–9; place if valid, recurse, undo on failure.

fill row[r*9+d], col[c*9+d], box[b*9+d] from given cells  (b = r/3*3 + c/3)
for each empty cell at pos (0..80):
    r = pos/9, c = pos%9, b = r/3*3 + c/3
    for d = 0 to 8:
        if not used in row, col, box:
            place; if solve(pos+1): return true; remove
return false
```

```csharp
public void SolveSudoku(char[][] board)
{
    bool[] row = new bool[81], col = new bool[81], box = new bool[81];
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++)
            if (board[r][c] != '.')
            {
                int d = board[r][c] - '1';
                row[r * 9 + d] = col[c * 9 + d] = box[(r / 3 * 3 + c / 3) * 9 + d] = true;
            }
    Solve(board, row, col, box, 0);
}

bool Solve(char[][] board, bool[] row, bool[] col, bool[] box, int pos)
{
    while (pos < 81 && board[pos / 9][pos % 9] != '.') pos++;
    if (pos == 81) return true;
    int r = pos / 9, c = pos % 9, b = r / 3 * 3 + c / 3;
    for (int d = 0; d < 9; d++)
    {
        if (row[r * 9 + d] || col[c * 9 + d] || box[b * 9 + d]) continue;
        row[r * 9 + d] = col[c * 9 + d] = box[b * 9 + d] = true;
        board[r][c] = (char)('1' + d);
        if (Solve(board, row, col, box, pos + 1)) return true;
        row[r * 9 + d] = col[c * 9 + d] = box[b * 9 + d] = false;
        board[r][c] = '.';
    }
    return false;
}
```

> **Key insight:** flat boolean arrays indexed by `[unit * 9 + digit]` give O(1) conflict checks; advancing `pos` past filled cells avoids redundant recursion.

---

### Unique Paths III — LeetCode 980

On a grid: start at `1`, end at `2`, obstacles are `-1`. Count paths from start to end that visit every non-obstacle cell exactly once.

**Example:** `[[1,0,0,0],[0,0,0,0],[0,0,2,-1]]` → `2`

```text
OPTIMAL — BACKTRACKING | O(4^(m·n)) | O(m·n)

Count total non-obstacle cells (= target). DFS marking cells -1 on entry, restoring on exit.
A path is valid only when it reaches cell 2 with exactly 0 unvisited cells remaining.

count empty cells → target
dfs(r, c, remaining):
    if grid[r][c] == 2: if remaining == 0: count++; return
    tmp = grid[r][c]; grid[r][c] = -1
    for each direction (nr, nc):
        if in bounds AND grid[nr][nc] != -1: dfs(nr, nc, remaining-1)
    grid[r][c] = tmp
```

```csharp
public int UniquePathsIII(int[][] grid)
{
    int rows = grid.Length, cols = grid[0].Length;
    int sr = 0, sc = 0, total = 0, count = 0;
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
        {
            if (grid[r][c] != -1) total++;
            if (grid[r][c] == 1) { sr = r; sc = c; }
        }
    int[] dr = [-1, 1, 0, 0], dc = [0, 0, -1, 1];
    void Dfs(int r, int c, int rem)
    {
        if (grid[r][c] == 2) { if (rem == 0) count++; return; }
        int tmp = grid[r][c];
        grid[r][c] = -1;
        for (int d = 0; d < 4; d++)
        {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] != -1)
                Dfs(nr, nc, rem - 1);
        }
        grid[r][c] = tmp;
    }
    Dfs(sr, sc, total - 1);
    return count;
}
```

> **Key insight:** track remaining-to-visit count alongside position — arrival at the end cell is only valid when exactly 0 unvisited cells remain.

---

## Divide and Conquer

### Kth Largest Element — LeetCode 215

Find the kth largest element in an unsorted array without fully sorting it.

**Example:** `[3,2,1,5,6,4], k=2` → `5`

The optimal Quickselect algorithm is detailed in [Searching and Sorting](../SearchingAndSorting/SearchingAndSorting.md).

```text
SORT | O(n log n) | O(1)

Sort descending; return nums[k-1].

------------------------------------------------------------------------------

MIN-HEAP SIZE k | O(n log k) | O(k)

Maintain a min-heap of the k largest seen. Top element is the answer.

------------------------------------------------------------------------------

OPTIMAL — QUICKSELECT | O(n) average, O(n²) worst | O(1)

Target rank = n - k (0-indexed from smallest).
Partition around pivot p.
If p == target: done.
If p > target: recurse left. Else recurse right.
```

```csharp
public int FindKthLargest(int[] nums, int k)
{
    return QuickSelect(nums, 0, nums.Length - 1, nums.Length - k);
}

int QuickSelect(int[] nums, int lo, int hi, int target)
{
    if (lo == hi) return nums[lo];
    int p = Partition(nums, lo, hi);
    if (p == target) return nums[p];
    return p > target ? QuickSelect(nums, lo, p - 1, target)
                      : QuickSelect(nums, p + 1, hi, target);
}

int Partition(int[] nums, int lo, int hi)
{
    int pivot = nums[hi], i = lo;
    for (int j = lo; j < hi; j++)
        if (nums[j] <= pivot) { (nums[i], nums[j]) = (nums[j], nums[i]); i++; }
    (nums[i], nums[hi]) = (nums[hi], nums[i]);
    return i;
}
```

> **Key insight:** Quickselect avoids a full sort — once the pivot lands at rank `n-k` we are done; see [Searching and Sorting](../SearchingAndSorting/SearchingAndSorting.md) for Lomuto vs Hoare and median-of-3 pivot strategies.
