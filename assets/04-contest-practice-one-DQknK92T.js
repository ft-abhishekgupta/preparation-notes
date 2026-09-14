const e=`---\r
title: Contest Practice One\r
description: Problem by problem write ups from a timed contest covering the approach the solution and the lesson learned from each\r
difficulty: Advanced\r
tags: [contest, problem-solving, practice]\r
---\r
\r
A timed contest is a different skill from an untimed interview: four problems, a ticking clock, and partial credit for whatever you finish. This page is a set of write-ups from one such round, kept in the format that's actually useful to revisit later — what the problem asked, what approach got picked and why, the working solution, and the one thing worth remembering next time a similar shape shows up.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    A["Skim all problems first"] --> B["Solve the easiest correctly"]\r
    B --> C["Bank the points early"]\r
    C --> D["Re-read constraints for the next one"]\r
    D --> E["Let n's bound suggest the technique"]\r
    E --> F["Implement, test on the given examples"]\r
    F --> G["Move on or optimize with time left"]\r
\`\`\`\r
\r
> [!TIP]\r
> In a scored contest, a correct \`O(n²)\` solution submitted in five minutes almost always beats a correct \`O(n)\` solution submitted in twenty. Optimize only after the naive version is banked, unless the constraints make \`O(n²)\` outright impossible.\r
\r
| Problem | Difficulty | Technique | Complexity |\r
|---|---|---|---|\r
| Count Rotations With Exactly K Equal Adjacent Pairs | Easy | Circular equal-pair count, adjust for the one boundary that changes | \`O(n)\` |\r
| Count Good Cyclic Rotations | Medium | Fixed-size sliding window over the doubled array | \`O(n)\` |\r
| Count Robot Groups | Medium | Interval merge, then a monotonic stack over speed | \`O(n log n)\` |\r
| Minimum Cost Path With At Most K Turns | Hard | Dijkstra over an expanded \`(row, col, direction, turns)\` state | \`O(V log V)\` on the expanded graph |\r
\r
## Count Rotations With Exactly K Equal Adjacent Pairs\r
\r
**Problem.** Given a string \`s\` of length \`n\` and an integer \`k\`, a cyclic rotation moves some prefix of \`s\` to the end. Each rotation has a score: the number of adjacent index pairs \`(i, i+1)\` where the characters are equal. Count how many of the \`n\` cyclic rotations have a score of exactly \`k\`.\r
\r
**Approach.** Rotating the string never changes which characters are adjacent to each other *around the circle* — it only changes which single pair sits at the "seam" (the join between the old end and the old start). So instead of scoring all \`n\` rotations from scratch, count the equal adjacent pairs in the circular string once. Removing one specific rotation's seam pair either subtracts one equal pair (if that pair happened to be equal) or leaves the count unchanged (if it wasn't). That means every rotation's score is either \`circularEqualCount\` or \`circularEqualCount - 1\`, and counting how many rotations land in each bucket is just counting how many of the \`n\` circular adjacent pairs are equal versus not.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public int CountRotations(string s, int k)\r
    {\r
        int n = s.Length;\r
        int equal = 0;\r
\r
        // Count equal adjacent pairs in the circular string\r
        for (int i = 0; i < n; i++)\r
            if (s[i] == s[(i + 1) % n])\r
                equal++;\r
\r
        int ans = 0;\r
        if (k == equal - 1) ans += equal;       // the removed seam pair was equal\r
        if (k == equal) ans += n - equal;       // the removed seam pair was not equal\r
        return ans;\r
    }\r
}\r
\`\`\`\r
\r
**What I learned.** Whenever a problem asks you to score every rotation of something, check whether rotating actually changes most of the structure — often only a single boundary element changes per rotation, and the rest of the circular structure is invariant. That turns an apparent \`O(n²)\` "regenerate and rescore every rotation" problem into an \`O(n)\` "count once, then bucket by what the seam contributes" problem.\r
\r
## Count Good Cyclic Rotations\r
\r
**Problem.** Given an integer array \`nums\` of even length \`n\`, a cyclic rotation is good if the sum of its first \`n/2\` elements is strictly greater than the sum of its last \`n/2\` elements. Count how many of the \`n\` cyclic rotations are good.\r
\r
**Approach.** Line the array up against itself (conceptually \`nums + nums\`) and notice that the "first half" of each successive rotation is a fixed-size window of length \`n/2\` sliding one position at a time across that doubled array. Maintain the running window sum incrementally — add the element entering the window, subtract the element leaving it — and compare it against half the total sum on every step, which turns \`n\` separate \`O(n)\` recomputations into one \`O(n)\` sliding pass.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public int CountGoodRotations(int[] nums)\r
    {\r
        int len = nums.Length;\r
        long total = 0;\r
        foreach (int x in nums) total += x;\r
\r
        long windowSum = 0;\r
        for (int i = 0; i < len / 2; i++) windowSum += nums[i];\r
\r
        int good = 0;\r
        for (int i = len / 2; i < len + len / 2; i++)\r
        {\r
            if (windowSum > total / 2) good++;\r
            windowSum += nums[i % len];\r
            windowSum -= nums[(i - len / 2 + len) % len];\r
        }\r
        return good;\r
    }\r
}\r
\`\`\`\r
\r
**What I learned.** \`windowSum > total / 2\` using integer division is safe here even though \`total\` can be odd — comparing an integer window sum against \`floor(total / 2)\` gives the same true/false answer as comparing \`2 * windowSum > total\` would, so there's no need to special-case parity or switch to floating point.\r
\r
> [!TIP]\r
> "Every rotation shares a fixed-size prefix/suffix split" is a strong hint to think of the array doubled against itself, with the target window sliding one step per rotation — it converts an \`O(n)\`-per-rotation recomputation into one \`O(n)\` pass overall.\r
\r
## Count Robot Groups\r
\r
**Problem.** Robots start at strictly increasing positions, each with a constant speed, and merge whenever the gap between two adjacent groups drops to at most \`distance\`. Merged groups adopt the position and speed of the rightmost member and never split again. Return the number of groups remaining after all possible merges, across all time.\r
\r
**Approach.** Split the problem into two passes. First, merge whatever is already touching at \`t = 0\` — scan left to right and collapse any adjacent pair whose gap is already at most \`distance\` into one group (taking the rightmost robot's position and speed). Second, account for merges that happen later as faster groups catch up to slower ones ahead: a group survives on its own forever only if there is no group anywhere ahead of it with a strictly smaller speed, because a strictly faster or equal-speed neighbor is either catching up to close the gap eventually or is falling equally behind and will never actually be caught. That "is there something slower ahead" question is exactly what a next-smaller-element scan with a monotonic stack answers in one linear pass.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public int CountGroups(int[] pos, int[] speed, int distance)\r
    {\r
        var groups = new List<(int pos, int speed)>();\r
        int n = pos.Length;\r
\r
        // Pass 1: merge anything already touching at t = 0\r
        for (int i = 0; i < n; i++)\r
        {\r
            if (groups.Count > 0 && pos[i] - groups[^1].pos <= distance)\r
                groups[^1] = (pos[i], speed[i]);\r
            else\r
                groups.Add((pos[i], speed[i]));\r
        }\r
\r
        // Pass 2: a group survives independently only if nothing slower lies ahead of it\r
        int m = groups.Count;\r
        var nextSlower = new int[m];\r
        Array.Fill(nextSlower, -1);\r
        var stack = new Stack<int>();\r
        for (int i = 0; i < m; i++)\r
        {\r
            while (stack.Count > 0 && groups[stack.Peek()].speed > groups[i].speed)\r
                nextSlower[stack.Pop()] = i;\r
            stack.Push(i);\r
        }\r
\r
        int finalGroups = 0;\r
        for (int i = 0; i < m;)\r
        {\r
            if (nextSlower[i] == -1) { finalGroups++; i++; }\r
            else i = nextSlower[i];\r
        }\r
        return finalGroups;\r
    }\r
}\r
\`\`\`\r
\r
**What I learned.** Simulating time directly is a trap here — with speeds and positions this general, "when does group A catch group B" is a continuous calculation you'd have to redo for every pair. The actual question is an ordering question ("is there ever something slower ahead of me"), not a timing question, and ordering questions over an array are almost always a monotonic-stack scan away from \`O(n)\`.\r
\r
## Minimum Cost Path With At Most K Turns\r
\r
**Problem.** Given an \`m x n\` grid of cell costs, find the minimum total cost of a path from \`(0, 0)\` to \`(m-1, n-1)\`, moving in the four cardinal directions, using at most \`k\` turns (a turn is a direction change between two consecutive moves).\r
\r
**Approach.** A plain shortest-path search over \`(row, col)\` can't answer this, because the cheapest way to reach a cell might use more turns than the cheapest way to reach it with fewer turns — the two are genuinely different states with different future costs. The fix is to expand the state Dijkstra operates on: instead of \`(row, col)\`, track \`(row, col, direction, turnsUsedSoFar)\`, so the algorithm never conflates "cheapest but turn-heavy" with "slightly pricier but turn-light" paths that might still be the only way to finish inside the turn budget.\r
\r
\`\`\`csharp\r
public class Solution\r
{\r
    public int MinimumCost(int[][] grid, int k)\r
    {\r
        int m = grid.Length, n = grid[0].Length;\r
        if (m == 1 && n == 1) return grid[0][0];\r
\r
        int[] dr = { 0, 1, 0, -1 };\r
        int[] dc = { 1, 0, -1, 0 };\r
\r
        var dist = new int[m, n, 4, k + 1];\r
        for (int i = 0; i < m; i++)\r
            for (int j = 0; j < n; j++)\r
                for (int d = 0; d < 4; d++)\r
                    for (int t = 0; t <= k; t++)\r
                        dist[i, j, d, t] = int.MaxValue;\r
\r
        var pq = new PriorityQueue<(int r, int c, int d, int t), int>();\r
\r
        for (int d = 0; d < 4; d++)\r
        {\r
            int nr = dr[d], nc = dc[d];\r
            if (nr >= 0 && nr < m && nc >= 0 && nc < n)\r
            {\r
                int cost = grid[0][0] + grid[nr][nc];\r
                dist[nr, nc, d, 0] = cost;\r
                pq.Enqueue((nr, nc, d, 0), cost);\r
            }\r
        }\r
\r
        while (pq.Count > 0)\r
        {\r
            pq.TryDequeue(out var state, out int cost);\r
            var (r, c, d, t) = state;\r
            if (cost > dist[r, c, d, t]) continue;          // stale entry, skip\r
            if (r == m - 1 && c == n - 1) return cost;\r
\r
            for (int nd = 0; nd < 4; nd++)\r
            {\r
                int nt = t + (nd != d ? 1 : 0);\r
                if (nt > k) continue;\r
\r
                int nr = r + dr[nd], nc = c + dc[nd];\r
                if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;\r
\r
                int ncost = cost + grid[nr][nc];\r
                if (ncost < dist[nr, nc, nd, nt])\r
                {\r
                    dist[nr, nc, nd, nt] = ncost;\r
                    pq.Enqueue((nr, nc, nd, nt), ncost);\r
                }\r
            }\r
        }\r
        return -1;\r
    }\r
}\r
\`\`\`\r
\r
**What I learned.** Whenever a shortest-path problem has an extra hard constraint (a budget, a count, a limit), the constraint has to become part of the graph's state, not a filter bolted on afterward — otherwise Dijkstra's core assumption (first visit to a state is optimal) silently breaks, because "first visit to a cell" and "first visit to a cell within budget" are not the same guarantee.\r
\r
> [!WARNING]\r
> Plain Dijkstra over \`(row, col)\` alone would wrongly assume the cheapest way to reach a cell is always the best starting point for everything after it. Once turns are budgeted, a pricier path with turns to spare can beat a cheaper path that's already out of budget — the state must carry the budget, not just position.\r
\r
## Cheat sheet\r
\r
- Circular rotation-scoring problems: check whether rotating only changes one boundary element; if so, count the invariant structure once and bucket by the boundary.\r
- "Score of every rotation" where the score is a fixed-size sum: that's a sliding window over the doubled array, not \`n\` independent recomputations.\r
- Merging problems phrased with continuous-time catch-up: look for whether the answer only depends on relative *order* (monotonic stack), not on simulating actual time.\r
- Shortest path with an extra hard constraint (turns, stops, budget): fold the constraint into the search state, don't check it separately.\r
- In a scored contest: bank the easy problem correctly before optimizing anything.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Regenerating and rescoring every rotation from scratch | Check what actually changes per rotation — usually just one boundary pair or window edge |\r
| Comparing \`windowSum > total / 2\` with floating-point division out of caution about odd totals | Integer division already gives the correct strict-inequality answer here; no special-casing needed |\r
| Trying to simulate exact catch-up times between robots | If only the eventual merge/no-merge outcome matters, reduce it to a monotonic-stack ordering question |\r
| Running plain Dijkstra on \`(row, col)\` when a turn/stop budget is part of the problem | Expand the state to include the budget dimension, e.g. \`(row, col, direction, turnsUsed)\` |\r
| Treating a stale priority-queue entry as valid | Always recheck \`cost > dist[state]\` on dequeue and skip if it's outdated |\r
\r
## Summary\r
\r
These four problems share a theme even though they look unrelated: each one has an \`O(n²)\`-or-worse brute force that's obvious to state, and a much cheaper solution that appears the moment you ask "what actually changes here, and what stays invariant." Rotation scoring stays invariant except at one seam; the good-rotation sum is a sliding window in disguise; robot merging is an ordering question, not a timing one; and the turn-limited shortest path just needs a bigger state, not a different algorithm. The contest habit worth keeping is asking that "what's invariant, what's the real state" question before writing any code, rather than reaching for whichever technique the problem superficially resembles.\r
\r
## Top Interview Questions\r
\r
### Q1. When a problem asks you to evaluate every rotation or every window of an array, what's the first optimization you should look for?\r
\r
Look for what actually changes between one rotation/window and the next, rather than assuming you need to recompute everything from scratch each time. Very often, moving from one rotation to the next only changes a single boundary element or pair — the rest of the circular or windowed structure is identical — which means you can maintain a running value incrementally (add what enters, remove what leaves) instead of rescoring the whole thing. This turns an apparent \`O(n²)\` "regenerate everything n times" problem into an \`O(n)\` single pass, and it's one of the highest-value patterns to recognize quickly in a timed contest, since these problems often look deceptively expensive at first glance.\r
\r
### Q2. How do you decide whether a "things merge over time" simulation problem actually needs to simulate time?\r
\r
Check whether the final answer only depends on the relative order or ranking of some property, not on the actual numeric time values. If group A only ever catches group B because A's speed is greater than B's, and once caught they move together permanently, then the exact moment of catching is irrelevant to the final grouping — only the fact that it eventually happens matters. That's a strong signal to look for an ordering-based technique like a monotonic stack ("is there anything slower ahead of me") instead of computing catch-up times, distances, or explicit event simulation, which would be far more complex and error-prone to get right under time pressure.\r
\r
### Q3. Why does adding an extra constraint like "at most k turns" or "at most k stops" to a shortest-path problem require changing the search state, not just filtering results afterward?\r
\r
Because Dijkstra's correctness relies on the invariant that once you've found the shortest cost to reach a given state, no other path to that exact state can beat it, so it never needs to be revisited. If the search state is just \`(row, col)\`, that invariant becomes false the moment turns or stops matter, because a cheaper path to a cell might have used up more of the budget than an alternative, slightly costlier path — and only one of those might actually be able to finish within the limit. Filtering afterward can't fix this, because the algorithm may have already discarded the higher-budget-remaining option as "already visited, no need to revisit." The state itself has to include the constrained resource.\r
\r
### Q4. In a timed contest, how should you prioritize between finishing the easy problems correctly versus attempting a partial solution on a hard one?\r
\r
Prioritize banking correct solutions on the problems you're confident about first, since contests typically score by problems fully solved, not partial credit for elegant-but-incomplete hard solutions. A correct, even inelegant, solution to an easy or medium problem is worth more than a half-working attempt at a hard one, especially early in the round when time pressure is lower and mistakes on "should be easy" problems are more costly relative to their point value. Once the problems you're confident about are solved and verified against the given examples, then it's reasonable to spend remaining time on the harder problem, ideally after skimming it early so you've had background time to think about it.\r
\r
### Q5. What's a fast way to test whether integer division is "safe" to use in place of a floating-point comparison, like \`windowSum > total / 2\`?\r
\r
Rewrite the comparison algebraically without division and check whether it still matches: \`windowSum > total / 2\` (integer division) is asking the same true/false question as \`2 * windowSum > total\` for all integers, regardless of whether \`total\` is even or odd, as long as \`windowSum\` is itself an integer. You can verify this by testing both odd and even values of \`total\` by hand — for \`total = 5\`, \`total / 2 = 2\`, so \`windowSum > 2\` matches \`2 * windowSum > 5\` for every integer \`windowSum\`. This kind of quick algebraic sanity check is faster and safer under time pressure than second-guessing yourself into an unnecessary floating-point rewrite, which introduces its own precision risks.\r
\r
### Q6. How do you recognize when a monotonic stack is the right tool in a problem that doesn't obviously mention "next greater/smaller element"?\r
\r
Look past the surface framing for an underlying "is there anything ahead of me that changes my fate" question. Robot merging is framed as a physics/time problem, but the actual computational question — "does a slower group exist anywhere ahead of this one" — is structurally identical to "find the next smaller element to the right." Whenever a problem asks about the *existence* of some dominating or subordinate element later in a sequence, and that answer only needs to be computed once per element without revisiting, a monotonic stack is very likely to reduce an apparent quadratic scan to a linear one.\r
\r
### Q7. What's the advantage of keeping the priority-queue "stale entry" check (\`if (cost > dist[state]) continue;\`) in a Dijkstra-style solution instead of removing outdated entries from the queue directly?\r
\r
C#'s built-in \`PriorityQueue<TElement, TPriority>\` has no efficient way to decrease a specific entry's priority or remove an arbitrary entry once it's enqueued, so the standard workaround is "lazy deletion": simply enqueue a new, better entry for the same state without removing the old, worse one, and when the old one is eventually dequeued, check whether it's still the best known distance for that state before processing it. This keeps the implementation simple and avoids needing an indexed heap, at the cost of the queue occasionally holding a few extra stale entries — a small overhead that's almost always worth the simplicity in a contest setting.\r
\r
### Q8. When expanding a search state to include an extra dimension like direction and turns-used, how do you reason about the resulting time and space complexity?\r
\r
Multiply the original state space by the size of each new dimension you add: if the base grid has \`m * n\` cells, and you add 4 possible directions and \`k + 1\` possible turn counts, the state space becomes \`m * n * 4 * (k + 1)\`. Each state can be enqueued and processed roughly \`O(log(state count))\` times in a heap-based search, so the overall complexity becomes \`O(m * n * k * log(m * n * k))\` in the worst case. It's important to say this complexity out loud in an interview or contest explanation, since it shows you understand that the expanded state isn't "free" — it directly multiplies both the memory footprint and the number of heap operations.\r
\r
### Q9. What's a general strategy for spotting the "invariant vs. changing part" of a problem quickly, especially under contest time pressure?\r
\r
Start by mentally simulating the brute-force version for two or three consecutive cases (two adjacent rotations, two adjacent windows, two time steps) and explicitly compare what's different between them. In almost every "evaluate every X" problem, the difference between consecutive cases is much smaller than the full recomputation would suggest — often a single element entering and one leaving. Once you can name that specific difference, ask whether it can be tracked incrementally with a running variable, a window, or a monotonic structure, rather than trying to jump straight to "the" clever trick. This habit of comparing adjacent cases explicitly, rather than staring at the full problem, is one of the fastest ways to find the optimization under time pressure.\r
\r
### Q10. How should you validate a contest solution against the given examples before submitting, given there's no interviewer to catch a subtle bug for you?\r
\r
Trace through every provided example by hand against your actual code logic, not just against your mental model of the algorithm, since the two can diverge in small but fatal ways (off-by-one loop bounds, wrong comparison direction, an unhandled edge case like \`n = 1\`). Pay particular attention to boundary-sized examples explicitly given in the problem (smallest valid \`n\`, all-equal inputs, single-element cases), since contest problem setters usually include at least one example designed to catch a specific common mistake. If your code produces the expected output for every given example after an honest, line-by-line trace — not just "it looks right" — that's the strongest signal you have before submitting, given there's no one else to review it first.\r
`;export{e as default};
