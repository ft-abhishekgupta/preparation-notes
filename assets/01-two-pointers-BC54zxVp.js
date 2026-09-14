const e=`---\r
title: Two Pointers\r
description: Two indices scan an array or string together, turning many brute-force quadratic checks into a single linear pass with constant extra space\r
difficulty: Foundational\r
tags: [arrays, two-pointers, patterns]\r
---\r
\r
Two pointers is the simplest pattern that consistently turns an \`O(n²)\` nested-loop brute force into \`O(n)\`. The trick is not the code — it is recognising *when* moving two indices together is valid, which depends on the array being sorted or the condition being monotonic.\r
\r
## Two families\r
\r
There are two distinct shapes, and interviewers expect you to name which one you are using.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    subgraph "Opposite ends"\r
    L1["left → "] --- M1["..."] --- R1[" ← right"]\r
    end\r
    subgraph "Same direction"\r
    S1["slow"] --> F1["fast →"]\r
    end\r
\`\`\`\r
\r
| Variant | Movement | Typical use | Requires sorted input? |\r
|---|---|---|---|\r
| Opposite ends | \`left\` starts at 0, \`right\` at end, they close inward | Pair sum, container with most water, palindrome check | Usually yes |\r
| Same direction (slow/fast) | Both start at 0, \`fast\` scans ahead, \`slow\` marks a write position | In-place removal, partitioning, cycle detection | No |\r
\r
> [!KEY]\r
> Two pointers work only when moving one pointer **provably cannot miss the answer**. On a sorted array, moving \`left\` right when the pair-sum is too small is safe because every pair involving the old \`left\` and anything smaller than the current \`right\` was already too small. That argument, not the code, is what you should say out loud.\r
\r
## Sorted-array pair sum\r
\r
Given a sorted array, find two numbers that sum to a target.\r
\r
\`\`\`csharp\r
// O(n) time, O(1) space — array must be sorted\r
public int[] TwoSumSorted(int[] nums, int target)\r
{\r
    int left = 0, right = nums.Length - 1;\r
    while (left < right)\r
    {\r
        int sum = nums[left] + nums[right];\r
        if (sum == target) return new[] { left, right };\r
        if (sum < target) left++;   // need a bigger sum\r
        else right--;               // need a smaller sum\r
    }\r
    return new[] { -1, -1 };\r
}\r
\`\`\`\r
\r
This is \`O(n)\` versus \`O(n²)\` brute force, or \`O(n)\` time / \`O(n)\` space with a hash set if the array is **unsorted** and you cannot sort it (sorting destroys original indices).\r
\r
## Three-sum with de-duplication\r
\r
Fix one element, then two-pointer the rest. Sorting first makes both the search and the de-duplication trivial.\r
\r
\`\`\`csharp\r
// O(n^2) time, O(1) extra space (excluding output), input sorted first\r
public IList<IList<int>> ThreeSum(int[] nums)\r
{\r
    Array.Sort(nums);\r
    var result = new List<IList<int>>();\r
    for (int i = 0; i < nums.Length - 2; i++)\r
    {\r
        if (i > 0 && nums[i] == nums[i - 1]) continue;   // skip duplicate anchors\r
        int left = i + 1, right = nums.Length - 1;\r
        while (left < right)\r
        {\r
            int sum = nums[i] + nums[left] + nums[right];\r
            if (sum == 0)\r
            {\r
                result.Add(new[] { nums[i], nums[left], nums[right] });\r
                while (left < right && nums[left] == nums[left + 1]) left++;   // skip dup\r
                while (left < right && nums[right] == nums[right - 1]) right--; // skip dup\r
                left++; right--;\r
            }\r
            else if (sum < 0) left++;\r
            else right--;\r
        }\r
    }\r
    return result;\r
}\r
\`\`\`\r
\r
> [!TIP]\r
> The de-duplication trick is always the same: after recording a match, skip past every equal neighbour before moving on. Say this explicitly — it is the detail that separates a working solution from one with duplicate triplets.\r
\r
## Container with most water\r
\r
Opposite-ends pointers, but the movement rule is different from pair-sum: always move the **shorter** wall inward, because the taller one can never be the bottleneck again while paired with anything further in.\r
\r
\`\`\`csharp\r
// O(n) time, O(1) space\r
public int MaxArea(int[] height)\r
{\r
    int left = 0, right = height.Length - 1, best = 0;\r
    while (left < right)\r
    {\r
        int h = Math.Min(height[left], height[right]);\r
        best = Math.Max(best, h * (right - left));\r
        if (height[left] < height[right]) left++;\r
        else right--;\r
    }\r
    return best;\r
}\r
\`\`\`\r
\r
## In-place removal and partitioning (slow/fast)\r
\r
The same-direction variant does not need sorted input. \`slow\` marks the next write position; \`fast\` scans for elements that should be kept.\r
\r
\`\`\`csharp\r
// O(n) time, O(1) space — remove all instances of val in place\r
public int RemoveElement(int[] nums, int val)\r
{\r
    int slow = 0;\r
    for (int fast = 0; fast < nums.Length; fast++)\r
        if (nums[fast] != val)\r
            nums[slow++] = nums[fast];\r
    return slow;   // new logical length\r
}\r
\`\`\`\r
\r
The Dutch National Flag (3-way partition, e.g. \`Sort Colors\`) is the same idea with three pointers: \`low\`, \`mid\`, \`high\`, partitioning into three regions in one pass.\r
\r
## Palindrome checks\r
\r
Opposite ends collapsing inward, comparing as they go — the most direct application of the pattern.\r
\r
\`\`\`csharp\r
// O(n) time, O(1) space\r
public bool IsPalindrome(string s)\r
{\r
    int left = 0, right = s.Length - 1;\r
    while (left < right)\r
    {\r
        if (!char.IsLetterOrDigit(s[left])) { left++; continue; }\r
        if (!char.IsLetterOrDigit(s[right])) { right--; continue; }\r
        if (char.ToLower(s[left]) != char.ToLower(s[right])) return false;\r
        left++; right--;\r
    }\r
    return true;\r
}\r
\`\`\`\r
\r
## Merging two sorted arrays\r
\r
Same-direction, but from the **back** when merging in place (to avoid overwriting unread elements), or from the front when producing a new array.\r
\r
| Merge direction | Use case |\r
|---|---|\r
| Front-to-back into a new array | Merging two separate sorted lists |\r
| Back-to-front in place | \`nums1\` has trailing free space (classic "Merge Sorted Array") — avoids shifting |\r
\r
## Trapping rain water\r
\r
A two-pointer variant of a prefix-max problem: water trapped at index \`i\` is \`min(maxLeft, maxRight) - height[i]\`. Instead of precomputing both prefix-max arrays (\`O(n)\` space), track running maxima from both ends and always advance the side with the smaller max — that side's water level is already determined.\r
\r
\`\`\`csharp\r
// O(n) time, O(1) space\r
public int Trap(int[] height)\r
{\r
    int left = 0, right = height.Length - 1;\r
    int leftMax = 0, rightMax = 0, water = 0;\r
    while (left < right)\r
    {\r
        if (height[left] < height[right])\r
        {\r
            leftMax = Math.Max(leftMax, height[left]);\r
            water += leftMax - height[left];\r
            left++;\r
        }\r
        else\r
        {\r
            rightMax = Math.Max(rightMax, height[right]);\r
            water += rightMax - height[right];\r
            right--;   // advance right inward\r
        }\r
    }\r
    return water;\r
}\r
\`\`\`\r
\r
> [!WARNING]\r
> The correctness argument here is subtle and worth stating: when \`height[left] < height[right]\`, we know \`rightMax >= height[right] > height[left]\`, so the water above \`left\` is bounded by \`leftMax\` regardless of what lies further right. That is why it is safe to resolve \`left\` using only \`leftMax\`.\r
\r
## Recognising when the pattern applies\r
\r
| Signal in the problem | Likely pattern |\r
|---|---|\r
| "sorted array", find a pair/triplet with a target sum | Opposite-ends two pointers |\r
| "in place", "without extra space", remove/move elements | Same-direction slow/fast |\r
| "palindrome", "reverse", compare from both sides | Opposite-ends two pointers |\r
| "merge two sorted", "k sorted lists" | Same-direction (often with a heap for k > 2) |\r
| Answer depends on \`min\`/\`max\` of two boundary values | Opposite-ends, move the limiting side |\r
| Need every subarray or substring meeting a condition | Usually sliding window, not plain two pointers |\r
\r
> [!DANGER]\r
> Two pointers on an **unsorted** array for a sum problem is a classic trap — the greedy "move left if sum too small" argument only holds because the array is sorted. On unsorted data, use a hash set instead, or sort first if indices don't matter.\r
\r
## Cheat sheet\r
\r
- Opposite-ends: \`left\`/\`right\` close inward — sorted-array sums, palindromes, container/rain water.\r
- Same-direction: \`slow\`/\`fast\` — in-place removal, partitioning, cycle detection on linked lists.\r
- Always state the invariant that justifies moving a pointer — that is the actual interview signal.\r
- Container with most water: always move the **shorter** wall.\r
- Trapping rain water: always advance the side with the **smaller running max**.\r
- Three-sum: sort first, fix one index, two-pointer the rest, skip duplicates on both anchor and inner pointers.\r
- Merging in place: work from the **back** to avoid overwriting unread data.\r
- Two pointers need a monotonic/sorted property; without one, prefer a hash set or prefix sum.\r
- Complexity is almost always \`O(n)\` or \`O(n log n)\` (if a sort is required first), \`O(1)\` extra space.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Using two pointers on an unsorted array expecting sorted-array logic | Sort first (if order doesn't matter) or use a hash set |\r
| Forgetting to skip duplicates in three-sum, producing repeated triplets | Advance past equal neighbours after recording each match |\r
| Moving the taller wall in "container with most water" | Always move the **shorter** wall inward |\r
| Merging sorted arrays from the front when one has trailing free space | Merge from the back to avoid overwriting unread elements |\r
| Off-by-one on the \`while (left < right)\` vs \`left <= right\` condition | Use \`<\` when pointers must not cross/overlap the same element twice |\r
| Treating slow/fast (in-place partition) as needing sorted input | It never does — it only needs a per-element keep/discard test |\r
\r
## Summary\r
\r
Two pointers replaces nested loops with a single pass by exploiting a monotonic property: sortedness for opposite-ends problems, or a simple keep/discard test for same-direction problems. The pattern is recognisable from the problem statement — sorted arrays, pair/triplet sums, palindromes, and in-place array surgery are the classic signals. The part that actually earns interview credit is the one-sentence proof of why moving a given pointer cannot skip the optimal answer, not the four lines of code that implement it.\r
\r
## Top Interview Questions\r
\r
### Q1. What are the two main variants of the two-pointers pattern, and how do they differ?\r
\r
The **opposite-ends** variant starts one pointer at index 0 and another at the last index, moving them toward each other; it is used for sorted-array pair sums, palindrome checks, and container-style problems, and generally requires the input to be sorted or otherwise have a monotonic property. The **same-direction (slow/fast)** variant starts both pointers at 0, with \`fast\` scanning ahead and \`slow\` marking a write or boundary position; it is used for in-place removal, partitioning, and detecting cycles in linked lists, and does not require sorted input — only a per-element test of whether to keep, skip, or swap.\r
\r
### Q2. Why does the two-pointer approach work for finding a pair with a target sum in a sorted array?\r
\r
Because the array is sorted, if \`nums[left] + nums[right] > target\`, then pairing \`right\` with anything to its left (which is \`<= nums[right]\`) other than positions already checked would still be \`>= \` the current sum only if larger, so decreasing \`right\` is the only way to reduce the sum — we can safely discard \`right\` because it cannot form a valid pair with anything currently between \`left\` and \`right\` either (all give a larger or equal sum than checked so far). Symmetrically, if the sum is too small, increasing \`left\` is safe because \`left\` paired with anything smaller than the current \`right\` was already the largest possible pairing for that \`left\`. This monotonic argument is why sortedness is required.\r
\r
### Q3. How do you avoid duplicate triplets in the classic "Three Sum" problem?\r
\r
Sort the array first. Iterate an anchor index \`i\`, skipping it if it equals the previous anchor (\`nums[i] == nums[i-1]\`) to avoid repeating the same first element. For the inner two-pointer scan (\`left\`, \`right\`), after recording a valid triplet, advance \`left\` past any run of equal values and retreat \`right\` past any run of equal values before continuing. Both de-duplication steps are necessary: skipping only the anchor prevents duplicate first elements, but without also skipping duplicate \`left\`/\`right\` values you can still emit the same triplet multiple times from a single anchor.\r
\r
### Q4. In "Container With Most Water", why do you always move the pointer at the shorter wall?\r
\r
The area for a given pair is \`min(height[left], height[right]) * (right - left)\`. If you move the taller wall inward instead, the width strictly decreases and the height is still capped by the shorter wall (unchanged), so the area cannot improve — that move is provably useless. Moving the shorter wall is the only move that has a chance of increasing the bounding height for a still-decreasing width, so it is the only move that can possibly find a better answer. This is a good example of a two-pointer move being justified by elimination, not by a greedy guess.\r
\r
### Q5. How does "Trapping Rain Water" use two pointers instead of precomputed prefix-max arrays?\r
\r
The naive approach precomputes a left-max and right-max array in \`O(n)\` space, then for each index takes \`min(leftMax[i], rightMax[i]) - height[i]\`. The two-pointer version tracks running \`leftMax\` and \`rightMax\` on the fly and advances whichever side currently has the smaller running max, computing that side's trapped water immediately. It is safe because the side with the smaller max is guaranteed to be bounded by its own running max regardless of what the far side's exact max is (which we haven't fully computed yet) — this reduces the problem to \`O(1)\` extra space instead of \`O(n)\`.\r
\r
### Q6. When would you use two pointers versus a hash set for a pair-sum problem?\r
\r
Use two pointers when the array is already sorted, or when you are allowed to sort it and don't need to preserve original indices — it costs \`O(n log n)\` for the sort (or \`O(n)\` if already sorted) and \`O(1)\` extra space. Use a hash set when the array is unsorted and you must preserve original order or indices, or sorting is undesirable for another reason — it costs \`O(n)\` time and \`O(n)\` extra space. In an interview, state both and pick based on the constraint the interviewer cares about (usually whether extra space is a concern).\r
\r
### Q7. How would you remove duplicates from a sorted array in place, and what does the function return?\r
\r
Use the slow/fast pattern: \`slow\` tracks the position of the last unique element written; \`fast\` scans forward. When \`nums[fast] != nums[slow]\`, increment \`slow\` and copy \`nums[fast]\` into \`nums[slow]\`. This runs in \`O(n)\` time and \`O(1)\` extra space, and by convention the function returns the new logical length \`slow + 1\`, leaving the rest of the array's contents undefined (the caller is expected to only read the first \`slow + 1\` elements). This exact template generalises to "keep at most k duplicates" by comparing against \`nums[slow - k]\` instead.\r
\r
### Q8. Debugging scenario: your two-pointer palindrome check returns wrong answers on strings with punctuation and mixed case. What's likely wrong and how do you fix it?\r
\r
Most likely the pointers are comparing raw characters without skipping non-alphanumeric characters or normalising case. The fix is to advance \`left\` past any non-alphanumeric character and \`right\` similarly before each comparison, and compare using a case-insensitive form (\`char.ToLower\`) rather than raw equality. A second common bug is off-by-one in the loop condition — using \`<=\` instead of \`<\` for \`left < right\` can cause a false negative on odd-length strings by comparing the middle character to itself incorrectly, or an index-out-of-range if not guarded.\r
\r
### Q9. How would you merge two sorted arrays in place when one has extra trailing capacity, without using O(n) extra space?\r
\r
Start pointers at the **end** of both arrays' valid data (not the end of the buffer) and a third pointer at the very end of the combined buffer. Compare the two current end elements, copy the larger one to the write position, and decrement that source pointer and the write pointer. Working backward avoids overwriting elements in the first array that haven't been read yet — merging forward would require shifting elements repeatedly, degrading to \`O(n²)\` or requiring \`O(n)\` auxiliary space. This runs in \`O(n + m)\` time and \`O(1)\` extra space.\r
\r
### Q10. What's a production consideration when applying two pointers to very large or streamed arrays that don't fit in memory?\r
\r
Two pointers assume random access to both ends of the data, which does not hold for a stream or an external (disk-backed) dataset — you cannot cheaply seek to "the last element" without first knowing where it is, and reverse iteration over a stream is often impossible. For streamed data, you would instead need either a two-pass approach (first pass to find the length/end marker, buffering only what's needed), an external sort plus a merge pass that reads sequentially from both sides using file seeks, or reformulating the problem with a sliding window that only looks forward. State this trade-off explicitly if asked about scaling beyond in-memory arrays.\r
\r
### Q11. How do you generalise the two-pointer three-sum solution to four-sum, and what's the complexity?\r
\r
Fix two anchor indices with nested loops (skipping duplicates at each level the same way as three-sum), then run the standard two-pointer scan on the remaining two indices for each pair of anchors. This gives \`O(n^3)\` time (two nested anchor loops times a linear two-pointer scan) and \`O(1)\` extra space excluding output. The general pattern extends to "k-sum" by recursing: reduce k-sum to (k-1)-sum with one fixed anchor, bottoming out at two-sum via two pointers once k reaches 2 — giving \`O(n^(k-1))\` overall.\r
\r
### Q12. Why is two pointers not the right tool for "find the longest substring satisfying some property", and what should you use instead?\r
\r
That phrasing needs the window's **length** to be tracked while expanding and shrinking based on a running condition (like a character-frequency count), not just two indices closing toward each other — that is the sliding window pattern, a specialised same-direction two-pointer technique with an explicit expand/contract loop and auxiliary window state (a frequency map, a distinct-count, or a running sum). Plain two pointers moves each pointer at most once per direction with a simple test; sliding window pointers can each move multiple times as the window grows and shrinks in response to violations of the window's invariant.\r
`;export{e as default};
