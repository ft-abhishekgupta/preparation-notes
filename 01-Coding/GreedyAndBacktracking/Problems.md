# Greedy, Intervals and Backtracking — Problems

## Minimum Meeting Rooms Required

Given an array of meeting intervals `intervals[i] = [start, end]`, return the minimum number of conference rooms required so that all meetings can take place without conflicts.

**Example:** `intervals = [[0,30],[5,10],[15,20]]` → `2`

1. Associate start time with +1, end time with -1
2. Put everything in an array and sort
3. Iterate and calculate running max

```text
SWEEP LINE | O(N log N) | O(N)

// Start +1, End -1. Create list of events sort and calculate running sum to find max overlap

starts = all meeting start times
ends = all meeting end times
sort starts
sort ends
i = 0
j = 0
rooms = 0
maxRooms = 0
while i < N
    if starts[i] < ends[j]
        rooms++
        maxRooms = max(maxRooms, rooms)
        i++
    else
        rooms--
        j++

return maxRooms

-------------------------------------------------------------------------------------

HEAP | O(N log N) | O(N)

// Min Heap tracks the end time of meetings, to reuse that room. The size of the heap is the number of rooms needed.

sort meetings by start time
create minHeap
maxRooms = 0
for each meeting [start, end]
    if minHeap is not empty
       and minHeap.minimum <= start
        remove minimum from minHeap
    add end to minHeap
    maxRooms = max(maxRooms, size of minHeap)

return maxRooms
```

> - Use a min heap when the intervals arrive as a stream, and use sorted arrays when the whole set is known upfront.
> - HEAP: which resource becomes available next. SORTED ARRAYS: how many resources are in use at a given time.

```cs
public int MinMeetingRooms(List<Interval> intervals) {
    int max = 0, len = intervals.Count, curr = 0;
    var arr = new(int x, int y)[len * 2];
    for (int i = 0; i < len; i++) {
        arr[i] = (intervals[i].start, 1);
        arr[i + len] = (intervals[i].end, -1);
    }
    Array.Sort(arr, (a, b) =>
        a.x != b.x ? a.x.CompareTo(b.x) : a.y.CompareTo(b.y));
    for (int i = 0; i < len * 2; i++) {
        curr += arr[i].y;
        max = Math.Max(max, curr);
    }
    return max;
}
```

## Merge A New Interval

Given an array of non-overlapping intervals sorted by start time and a new interval, insert the new interval and merge any overlaps.

**Example:** `intervals = [[1,3],[6,9]], newInterval = [2,5]` → `[[1,5],[6,9]]`

1. Tackle case by case. Interval before, overlapping, after

```text
MERGE INTERVALS | O(N) | O(N)

Insert the new interval in sorted order, then apply the Merge Intervals algorithm

------------------------------------------------------------------------------------

SINGLE PASS | O(N) | O(1)

result = []
i = 0

// Add intervals that end before newInterval starts
while i < n AND intervals[i].end < newInterval.start:
    add intervals[i] to result
    i++

// Merge intervals that overlap newInterval
while i < n AND intervals[i].start <= newInterval.end:
    newInterval.start = min(newInterval.start, intervals[i].start)
    newInterval.end = max(newInterval.end, intervals[i].end)
    i++

// Add the merged interval
add newInterval to result

// Add intervals that start after newInterval ends
while i < n:
    add intervals[i] to result
    i++

return result
```

```cs
public int[][] Insert(int[][] intervals, int[] newI) {
        int len = intervals.Length;
        int start = newI[0];
        int end = newI[1];
        var ans = new List<int[]>();
        int i = 0;
        while(i < len && intervals[i][1] < newI[0])
            ans.Add(intervals[i++]);
        while(i < len && intervals[i][0] <= newI[1]){
            start = Math.Min(intervals[i][0],start);
            end = Math.Max(intervals[i][1],end);
            i++;
        }
        ans.Add([start,end]);
        while(i < len)
            ans.Add(intervals[i++]);
        return ans.ToArray();
    }
```

## Merge Intervals

Given an array of intervals where `intervals[i] = [start, end]`, merge all overlapping intervals and return the resulting non-overlapping intervals.

**Example:** `intervals = [[1,3],[2,6],[8,10],[15,18]]` → `[[1,6],[8,10],[15,18]]`

```text
BRUTE FORCE | O(N^2) | O(1)

Repeatedly compare intervals and merge every overlapping pair

------------------------------------------------------------------------------------

SORTING | O(N log N) | O(1)

sort intervals by start
result = []
current = first interval

for each next interval:
    if next.start <= current.end:
        current.end = max(current.end, next.end)
    else:
        add current to result
        current = next
add current to result
return result
```

## Non-overlapping Intervals

Given an array of intervals: intervals[i] = [start, end]
Return the minimum number of intervals that must be removed so that the remaining intervals are non-overlapping.

**Example:** `intervals = [[1,2],[2,3],[3,4],[1,3]]` → `1`

```text
BRUTE FORCE | O(2^N) | O(1)

Explore every combination of intervals and return the minimum number of removed intervals that results in a non-overlapping set

------------------------------------------------------------------------------------

GREEDY | O(N log N) | O(1)

// Remove the interval with the larger end time to maximize the number of non-overlapping intervals

sort intervals by end
lastEnd = -infinity
removed = 0

for each interval:
    if interval.start >= lastEnd:
        keep interval
        lastEnd = interval.end
    else:
        remove interval
        removed++

return removed

GREEDY WITH START TIME SORTING | O(N log N) | O(1)

sort by start
lastEnd = intervals[0].end
removed = 0

for each next interval:
    if next.start < lastEnd:
        removed++
        lastEnd = min(lastEnd, next.end)
    else:
        lastEnd = next.end

return removed
```

## Meeting Rooms

Given an array of meeting intervals `intervals[i] = [start, end]`, determine whether one person could attend all of the meetings.

**Example:** `intervals = [[0,30],[5,10],[15,20]]` → `false`

```text
BRUTE FORCE | O(N^2) | O(1)

Compare every pair of intervals and return false on the first overlap

------------------------------------------------------------------------------------

SORTING | O(N log N) | O(1)

// After sorting by start time, only adjacent intervals can overlap

sort intervals by start

for i = 1 to n - 1:
    if intervals[i].start < intervals[i - 1].end:
        return false

return true
```

> Touching intervals such as `[1,5]` and `[5,8]` do not conflict, so the comparison must be strict.

## Minimum Number of Arrows to Burst Balloons

Given an array of points where points[i] = [xstart, xend] represents a balloon whose horizontal diameter stretches between xstart and xend. Return the minimum number of arrows that must be shot to burst all balloons

**Example:** `points = [[10,16],[2,8],[1,6],[7,12]]` → `2`

```text
BRUTE FORCE | O(N^2) | O(1)

Repeatedly find overlapping balloons and burst them with one arrow until all balloons are burst.

-----------------------------------------------------------------------------

SORTING | O(N log N) | O(1)

// Sort the balloons by their end points and shoot arrows at the end of each balloon, skipping any balloons that overlap with the last shot arrow.

sort balloons by end coordinate
arrows = 0
arrowPosition = -infinity
for each balloon [start, end]:
    if start > arrowPosition:
        // Current arrow cannot burst this balloon
        arrows++
        // Shoot at the balloon's end
        arrowPosition = end
return arrows
```

## Jump Game

You are given an integer array nums. nums[i] tells you the maximum number of positions you can jump forward from index i.You start at index 0. Determine whether you can reach the last index.

**Example:** `nums = [2, 3, 1, 1, 4]` → `true`

```text
DFS | O(2^N) | O(N)
Use depth-first search to explore all possible jumps from the current index. If you reach the last index, return true.

-----------------------------------------------------------------------------

DP | O(N^2) | O(N)
// dp[i] = whether we can reach the end from index i

function canJump(nums):
    n = length(nums)
    dp[n - 1] = true
    for i from n - 2 down to 0:
        maxReach = min(i + nums[i], n - 1)
        for j from i + 1 to maxReach:
            if dp[j] == true:
                dp[i] = true
                break
    return dp[0]

-----------------------------------------------------------------------------

GREEDY | O(N) | O(1)
// Keep track of the farthest index we can reach while iterating through the array.

function canJump(nums):
    farthest = 0
    for i from 0 to n - 1:
        if i > farthest:
            return false
        farthest = max(
            farthest,
            i + nums[i]
        )
        if farthest >= n - 1:
            return true
    return true
```

## Jump Game II

You are given an integer array nums. nums[i] represents the maximum number of positions you can jump forward from index i. You start at index 0. Return the minimum number of jumps required to reach the last index. You can assume that the last index is always reachable.

**Example:** `nums = [2, 3, 1, 1, 4]` → `2`

```text
DFS | O(2^N) | O(N)
Use depth-first search to explore all possible jumps from the current index. Keep track of the minimum number of jumps needed to reach the last index.

-----------------------------------------------------------------------------

DP | O(N^2) | O(N)

// dp[i] = minimum number of jumps to reach the end from index i

function minJumps(nums):
    n = length(nums)
    dp = array of size n
    fill dp with infinity
    dp[0] = 0
    for i from 0 to n - 1:
        for j from 1 to nums[i]:
            next = i + j
            if next >= n:
                break
            dp[next] = min(
                dp[next],
                dp[i] + 1
            )
    return dp[n - 1]

-----------------------------------------------------------------------------
GREEDY | O(N) | O(1)

// Keep track of the current range of reachable indices and the farthest index reachable in the next jump.

function jump(nums):
    jumps = 0                   // Number of jumps made so far
    currentEnd = 0              // The farthest index reachable with the current number of jumps
    farthest = 0                // The farthest index reachable with one more jump
    n = length(nums)
    for i from 0 to n - 2:
        farthest = max(
            farthest,
            i + nums[i]
        )
        if i == currentEnd:
            jumps++
            currentEnd = farthest
    return jumps
```

## Gas Station

You are given two arrays: gas[i], cost[i]. There are N gas stations arranged in a circular route.

- gas[i] = amount of gas available at station i
- cost[i] = gas required to travel from station i to station (i + 1)

You start with an empty tank. Return the index of the gas station from which you can start and complete the entire circular route exactly once. If no solution exists, return -1.

**Example:** `gas = [1,2,3,4,5], cost = [3,4,5,1,2]` → `3`

```text
BRUTE FORCE | O(N^2) | O(1)

For each gas station, simulate the journey around the circuit. If you can complete the circuit starting from that station, return its index. If no station allows a complete circuit, return -1.

// If total gas < total cost, then no solution exists.

-----------------------------------------------------------------------------

GREEDY | O(N) | O(1)

// If starting at start causes the tank to become negative at station i, then none of the stations between start and i can be a valid starting point either.

function gasStation(gas, cost):
    totalTank = 0                       // Tracks the total gas surplus across the entire route
    currentTank = 0                     // Tracks the current gas surplus from the starting station
    start = 0                           // Current candidate starting station.
    n = length(gas)
    for i from 0 to n - 1:
        gain = gas[i] - cost[i]
        totalTank += gain
        currentTank += gain
        if currentTank < 0:
            start = i + 1
            currentTank = 0
    if totalTank >= 0:
        return start
    return -1
```

## Partition Labels

You are given a string s. You need to partition the string into as many parts as possible such that: Each character appears in at most one partition. After partitioning, return the sizes of all partitions.
Example - s = "ababcbacadefegdehijhklij" > "ababcbaca" | "defegde" | "hijhklij" > [9, 7, 8]

**Example:** `s = "ababcbacadefegdehijhklij"` → `[9, 7, 8]`

```text
BRUTE FORCE | O(N^2) | O(1)

Search for the last occurrence of each character in the string and create partitions accordingly.

-----------------------------------------------------------------------------

GREEDY | O(N) | O(1)

// Pre calculate the last occurrence of each character, then iterate through the string to create partitions based on the last occurrences. If all characters in the current partition have their last occurrence within the partition, we can finalize the partition.

function partitionLabels(s):
    last = array/map
    // Find last occurrence of every character
    n = length(s)
    for i from 0 to n - 1:
        last[s[i]] = i
    result = []
    start = 0
    end = 0
    for i from 0 to n - 1:
        end = max(end, last[s[i]])
        if i == end:
            result.add(i - start + 1)
            start = i + 1
    return result
```

## Backtracking Template

Subsets, Permutations, Combinations

CHECK > MARK > EXPLORE > UNMARK

## Subsets

Given an integer array nums of unique elements, return all possible subsets (the power set).

**Example:** `nums = [1, 2, 3]` → `[[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]`

```text
BACKTRACKING | O(N * 2^N) | O(N)

At each element, choose to include it in the current subset or not. Recursively build all subsets.

function subsets(nums):
    result = []
    current = []
    backtrack(index):
        if index == length(nums):
            result.add(copy(current))
            return
        // Choice 1: include nums[index]
        current.add(nums[index])
        backtrack(index + 1)
        current.removeLast()
        // Choice 2: don't include nums[index]
        backtrack(index + 1)
    backtrack(0)
    return result
```

## Subsets II

Given an integer array nums that may contain duplicates, return all possible subsets (the power set) without duplicate subsets.

**Example:** `nums = [1, 2, 2]` → `[[],[1],[2],[1,2],[2,2],[1,2,2]]`

```text
BACKTRACKING | O(N * 2^N) | O(N)

Sort the array to handle duplicates. At each element, choose to include it in the current subset or not, skipping duplicates.

function subsetsWithDup(nums):
    sort(nums)
    result = []
    current = []
    backtrack(start):
        result.add(copy(current))
        for i from start to n - 1:
            // Skip duplicate choices
            // at the same recursion level.
            if i > start AND nums[i] == nums[i - 1]:
                continue
            // Choose
            current.add(nums[i])
            // Explore
            backtrack(i + 1)
            // Undo
            current.removeLast()
    backtrack(0)
    return result
```

## Permutations

Given an integer array nums of unique elements, return all possible permutations.

**Example:** `nums = [1, 2, 3]` → `[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]`

```text
BACKTRACKING | O(N * N!) | O(N)

For each position in the permutation, choose an unused number from nums and recursively build the permutation.

function permutations(nums):
    result = []
    current = []
    used = array of false
    backtrack():
        if current.size == nums.length:
            result.add(copy(current))
            return
        for i from 0 to nums.length - 1:
            if used[i]:
                continue
            // Choose
            used[i] = true
            current.add(nums[i])
            // Explore
            backtrack()
            // Undo
            current.removeLast()
            used[i] = false
    backtrack()
    return result


-----------------------------------------------------------------------------

SWAP | O(N * N!) | O(N)

// At each recursion level, swap the current index with each of the remaining indices to generate permutations.

function permutations(nums):
    result = []
    backtrack(start):
        if start == nums.length:
            result.add(copy(nums))
            return
        for i from start to nums.length - 1:
            swap(nums[start], nums[i])
            backtrack(start + 1)
            swap(nums[start], nums[i])  // undo
    backtrack(0)
    return result
```

## Combination Sum

Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. You may return the combinations in any order. The same number may be chosen from candidates an unlimited number of times.

**Example:** `candidates = [2, 3, 6, 7], target = 7` → `[[2,2,3],[7]]`

```text
BACKTRACKING | O(N^(T/m)) | O(T/m)
Where T is the target and m is the minimum value in candidates. The maximum depth of the recursion tree is T/m, and at each level, we have N choices (the number of candidates).

function combinationSum(candidates, target):
    sort(candidates)
    result = []
    current = []
    backtrack(start, remaining):
        if remaining == 0:
            result.add(copy(current))
            return
        for i from start to n - 1:
            if candidates[i] > remaining:
                break
            current.add(candidates[i])
            // i, not i+1
            backtrack(i, remaining - candidates[i])
            current.removeLast()
    backtrack(0, target)
    return result
```

## Combination Sum II

Given a collection of candidate numbers (candidates) and a target number (target), find all unique combinations in candidates where the candidate numbers sum to target. Each number in candidates may only be used once in the combination. Input may contain duplicates.

**Example:** `candidates = [10,1,2,7,6,1,5], target = 8` → `[[1,1,6],[1,2,5],[1,7],[2,6]]`

```text
BACKTRACKING | O(N * 2^N) | O(N)
Every element is either taken or skipped, and copying each valid combination costs O(N).

// Sort the candidates
// Do not reuse the same element in the same recursion level
// Skip duplicates in the same recursion level

function combinationSum2(candidates, target):
    sort(candidates)
    result = []
    current = []
    backtrack(start, remaining):
        if remaining == 0:
            result.add(copy(current))
            return
        for i from start to n - 1:
            // Skip duplicate choices
            // at the same recursion level.
            if i > start AND
               candidates[i] == candidates[i - 1]:
                continue
            // Since sorted, nothing after this can fit.
            if candidates[i] > remaining:
                break
            // Choose
            current.add(candidates[i])
            // Cannot reuse this element.
            backtrack(i + 1, remaining - candidates[i])
            // Undo
            current.removeLast()
    backtrack(0, target)
    return result
```

## Letter Combinations of a Phone Number

Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. Return the answer in any order. A mapping of digit to letters (just like on the telephone buttons) is given below. Note that 1 does not map to any letters.

**Example:** `digits = "23"` → `["ad","ae","af","bd","be","bf","cd","ce","cf"]`

```text
BACKTRACKING | O(4^N) | O(N)
Where N is the length of the input digits. Each digit can map to at most 4 letters, leading to a maximum of 4^N combinations.

function letterCombinations(digits):
    mapping = ["","","abc","def","ghi","jkl","mno","pqrs","tuv","wxyz"]
    if digits is empty:
        return []
    result = []
    current = ""
    backtrack(index):
        if index == length(digits):
            result.add(current)
            return
        letters = mapping[digits[index]]
        for letter in letters:
            current += letter
            backtrack(index + 1)
            current remove last character
    backtrack(0)
    return result
```

## Generate Parentheses

Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.

**Example:** `n = 3` → `["((()))","(()())","(())()","()(())","()()()"]`

```text
BACKTRACKING | O(4^N / sqrt(N)) | O(N)
The number of valid sequences is the Nth Catalan number, and each one costs O(N) to build.

function generateParenthesis(n):
    result = []
    current = ""
    backtrack(open, close):
        if length(current) == 2 * n:
            result.add(current)
            return
        if open < n:
            current += "("
            backtrack(open + 1, close)
            current remove last character
        if close < open:
            current += ")"
            backtrack(open, close + 1)
            current remove last character
    backtrack(0, 0)
    return result
```

## Word Search

Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.

**Example:** `board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"` → `true`

```text
BACKTRACKING | O(M * N * 4^L) | O(M * N)
Where M is the number of rows, N is the number of columns, and L is the length of the word. Each cell can lead to 4 possible directions (up, down, left, right) for each character in the word.

function exist(board, word):
    rows = number of rows
    cols = number of columns
    visited = false matrix
    for row from 0 to rows - 1:
        for col from 0 to cols - 1:
            if backtrack(row, col, 0):
                return true
    return false

function backtrack(row, col, index):
    if index == word.length:
        return true
    if outside grid:
        return false
    if visited[row][col]:
        return false
    if board[row][col] != word[index]:
        return false
    // Choose
    visited[row][col] = true
    // Explore
    found =
        backtrack(row + 1, col, index + 1)
        OR
        backtrack(row - 1, col, index + 1)
        OR
        backtrack(row, col + 1, index + 1)
        OR
        backtrack(row, col - 1, index + 1)
    // Undo
    visited[row][col] = false
    return found

-----------------------------------------------------------------------------

OPTIMIZED BACKTRACKING | O(M * N * 4^L) | O(L)

// Instead of using a visited matrix, temporarily mark the cell as visited by changing its value. Restore it after exploring.

function backtrack(row, col, index):
    if index == word.length:
        return true
    if invalid position:
        return false
    if board[row][col] != word[index]:
        return false
    original = board[row][col]
    // Mark visited
    board[row][col] = '#'
    found =
        backtrack(down)
        OR
        backtrack(up)
        OR
        backtrack(right)
        OR
        backtrack(left)
    // Undo
    board[row][col] = original
    return found
```

## Palindrome Partitioning

Given a string s, partition it such that every substring of the partition is a palindrome. Return all possible partitions.

**Example:** `s = "aab"` → `[["a","a","b"],["aa","b"]]`

```text
BACKTRACKING | O(N * 2^N) | O(N)

// Every position is either a cut point or not, so there are 2^(N-1) partitions

function partition(s):
    result = []
    current = []
    backtrack(start):
        if start == length(s):
            result.add(copy(current))
            return
        for end from start to n - 1:
            if s[start...end] is not a palindrome:
                continue
            // Choose
            current.add(s[start...end])
            // Explore
            backtrack(end + 1)
            // Undo
            current.removeLast()
    backtrack(0)
    return result

-----------------------------------------------------------------------------

BACKTRACKING + DP PRECOMPUTE | O(N * 2^N) | O(N^2)

// Precompute isPalindrome[i][j] so each check is O(1) instead of O(N)
// isPalindrome[i][j] = s[i] == s[j] AND (j - i < 2 OR isPalindrome[i + 1][j - 1])

for length = 1 to n:
    for i = 0 to n - length:
        j = i + length - 1
        isPalindrome[i][j] =
            s[i] == s[j]
            AND (length < 3 OR isPalindrome[i + 1][j - 1])
```

> Minimum-cuts variant is pure DP: `cuts[i] = min(cuts[j - 1] + 1)` for every `j` where `s[j..i]` is a palindrome.

## N-Queens

Place n queens on an n × n chessboard so that no two queens attack each other. Return all distinct solutions.

**Example:** `n = 4` → `[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]`

```text
BRUTE FORCE | O(N^N) | O(N)

Try every column for every row and validate the full board at the end

-----------------------------------------------------------------------------

BACKTRACKING + CONFLICT SETS | O(N!) | O(N)

// Place one queen per row, so only columns and the two diagonals can conflict
// Anti-diagonal is constant along row + col
// Main diagonal is constant along row - col

function solveNQueens(n):
    result = []
    columns = empty set
    diagonal = empty set          // row - col
    antiDiagonal = empty set      // row + col
    position = array of size n
    backtrack(row):
        if row == n:
            result.add(board built from position)
            return
        for col from 0 to n - 1:
            if col in columns
               OR (row - col) in diagonal
               OR (row + col) in antiDiagonal:
                continue
            // Choose
            add col, row - col, row + col to the sets
            position[row] = col
            // Explore
            backtrack(row + 1)
            // Undo
            remove col, row - col, row + col from the sets
    backtrack(0)
    return result
```

> - N-Queens II only needs the count, so the board never has to be materialised.
> - Bitmask version stores the three sets in integers and uses `available = ~(cols | diag | anti)`.
