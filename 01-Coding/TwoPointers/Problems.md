# Two Pointers and Sliding Window — Problems

| # | Problem | LeetCode | Pattern | Difficulty |
| - | ------- | -------- | ------- | ---------- |
| 1 | Valid Palindrome | 125 | Opposite-Ends | Easy |
| 2 | Two Sum II — Input Array Is Sorted | 167 | Opposite-Ends | Medium |
| 3 | Container With Most Water | 11 | Opposite-Ends | Medium |
| 4 | Trapping Rain Water | 42 | Opposite-Ends / Prefix Max | Hard |
| 5 | 3Sum | 15 | Fix-One + Opposite-Ends | Medium |
| 6 | 4Sum | 18 | Fix-Two + Opposite-Ends | Medium |
| 7 | Remove Duplicates from Sorted Array | 26 | Fast/Slow Write-Pointer | Easy |
| 8 | Move Zeroes | 283 | Fast/Slow Write-Pointer | Easy |
| 9 | Minimum Size Subarray Sum | 209 | Variable Window — Shortest | Medium |
| 10 | Longest Substring Without Repeating Characters | 3 | Variable Window — Longest | Medium |
| 11 | Longest Repeating Character Replacement | 424 | Variable Window — Longest | Medium |
| 12 | Fruit Into Baskets | 904 | Variable Window — At-Most-K | Medium |
| 13 | Permutation in String | 567 | Fixed Window + Freq | Medium |
| 14 | Minimum Window Substring | 76 | Variable Window — Shortest | Hard |
| 15 | Subarrays with K Different Integers | 992 | At-Most-K Trick | Hard |
| 16 | Sliding Window Maximum | 239 | Fixed Window + Monotonic Deque | Hard |

---

## Opposite-Ends Two Pointers

### Valid Palindrome — LeetCode 125

Determine whether a string is a palindrome, ignoring non-alphanumeric characters and case.

**Example:** `"A man, a plan, a canal: Panama"` → `true`

```text
BRUTE FORCE | O(n) | O(n)

Build a cleaned string (alphanumeric, lowercase), then compare it to its reverse.

------------------------------------------------------------------------------

TWO POINTERS | O(n) | O(1)

lo = 0, hi = len - 1
while lo < hi:
    skip non-alphanumeric from lo (advance lo)
    skip non-alphanumeric from hi (retreat hi)
    if tolower(s[lo]) != tolower(s[hi]) → return false
    lo++, hi--
return true
```

```csharp
// Optimal implementation
public bool IsPalindrome(string s)
{
    int lo = 0, hi = s.Length - 1;
    while (lo < hi)
    {
        while (lo < hi && !char.IsLetterOrDigit(s[lo])) lo++;
        while (lo < hi && !char.IsLetterOrDigit(s[hi])) hi--;
        if (char.ToLower(s[lo]) != char.ToLower(s[hi])) return false;
        lo++; hi--;
    }
    return true;
}
```

> **Key insight:** converging pointers skip noise at both ends simultaneously; no extra allocation needed.

---

### Two Sum II — Input Array Is Sorted — LeetCode 167

Given a sorted array `numbers` and a `target`, return the 1-based indices of the two numbers that add up to `target`.

**Example:** `numbers = [2, 7, 11, 15], target = 9` → `[1, 2]`

```text
BRUTE FORCE | O(n²) | O(1)

Check every pair.

------------------------------------------------------------------------------

BINARY SEARCH | O(n log n) | O(1)

For each index i, binary-search for target - numbers[i] in i+1..n-1.

------------------------------------------------------------------------------

OPTIMAL — TWO POINTERS | O(n) | O(1)

lo = 0, hi = n - 1
while lo < hi:
    sum = numbers[lo] + numbers[hi]
    if sum == target → return [lo+1, hi+1]
    if sum < target  → lo++
    else             → hi--
```

```csharp
// Optimal implementation
public int[] TwoSum(int[] numbers, int target)
{
    int lo = 0, hi = numbers.Length - 1;
    while (lo < hi)
    {
        int sum = numbers[lo] + numbers[hi];
        if (sum == target) return new[] { lo + 1, hi + 1 };
        if (sum < target)  lo++;
        else               hi--;
    }
    return Array.Empty<int>();
}
```

> **Key insight:** sorted order means a sum too small → advance `lo`; too large → retreat `hi`; no pair is skipped.

---

### Container With Most Water — LeetCode 11

Given heights of n vertical lines, find two lines that form a container holding the most water.

**Example:** `height = [1,8,6,2,5,4,8,3,7]` → `49`

```text
BRUTE FORCE | O(n²) | O(1)

Check every pair of lines and track the maximum area.

------------------------------------------------------------------------------

OPTIMAL — TWO POINTERS | O(n) | O(1)

lo = 0, hi = n - 1, best = 0
while lo < hi:
    area = (hi - lo) * min(height[lo], height[hi])
    best = max(best, area)
    if height[lo] < height[hi]: lo++
    else: hi--
return best
```

```csharp
// Optimal implementation
public int MaxArea(int[] height)
{
    int lo = 0, hi = height.Length - 1, best = 0;
    while (lo < hi)
    {
        best = Math.Max(best, (hi - lo) * Math.Min(height[lo], height[hi]));
        if (height[lo] < height[hi]) lo++;
        else hi--;
    }
    return best;
}
```

> **Key insight:** the shorter line caps the area; moving it inward is the only way to possibly improve the answer — moving the taller line can only reduce or maintain the cap while shrinking the width.

---

### Trapping Rain Water — LeetCode 42

Given `height` array, compute total water trapped after rain.

**Example:** `height = [0,1,0,2,1,0,1,3,2,1,2,1]` → `6`

Water at position `i` = `min(leftMax[i], rightMax[i]) − height[i]`.

```text
BRUTE FORCE | O(n²) | O(1)

For each index, scan left for leftMax and right for rightMax.

------------------------------------------------------------------------------

PREFIX/SUFFIX MAX ARRAYS | O(n) | O(n)

Build leftMax[] (running max left→right) and rightMax[] (right→left).
For each i: water += min(leftMax[i], rightMax[i]) - height[i].

------------------------------------------------------------------------------

OPTIMAL — TWO POINTERS | O(n) | O(1)

lo=0, hi=n-1, leftMax=0, rightMax=0, total=0
while lo < hi:
    if height[lo] <= height[hi]:
        if height[lo] >= leftMax: leftMax = height[lo]
        else: total += leftMax - height[lo]
        lo++
    else:
        if height[right] >= rightMax: rightMax = height[hi]
        else: total += rightMax - height[hi]
        hi--
return total
```

**Why two-pointer works:** when `height[lo] ≤ height[hi]`, we know `rightMax ≥ height[hi] ≥ height[lo]`, so the water at `lo` is determined purely by `leftMax`. We can process `lo` without knowing the exact `rightMax`.

For the monotonic-stack horizontal-layer approach, see [monotonic stack](../StacksAndQueues/StacksAndQueues.md).

```csharp
// Optimal implementation
public int Trap(int[] height)
{
    int lo = 0, hi = height.Length - 1;
    int leftMax = 0, rightMax = 0, total = 0;
    while (lo < hi)
    {
        if (height[lo] <= height[hi])
        {
            if (height[lo] >= leftMax) leftMax = height[lo];
            else total += leftMax - height[lo];
            lo++;
        }
        else
        {
            if (height[hi] >= rightMax) rightMax = height[hi];
            else total += rightMax - height[hi];
            hi--;
        }
    }
    return total;
}
```

> **Key insight:** whichever side has the smaller height, its water level is fully determined by its own running max — process that side and advance the pointer.

---

### 3Sum — LeetCode 15

Find all unique triplets in `nums` that sum to zero.

**Example:** `nums = [-1,0,1,2,-1,-4]` → `[[-1,-1,2],[-1,0,1]]`

```text
BRUTE FORCE | O(n³) | O(1)

Check every triple.

------------------------------------------------------------------------------

HASH SET | O(n²) | O(n)

Fix one element; use a hash set to find the complementary pair. Deduplicate with a normalised key.

------------------------------------------------------------------------------

OPTIMAL — SORT + TWO POINTERS | O(n²) | O(1) excluding output

sort nums
for i = 0 to n-3:
    skip i if nums[i] == nums[i-1] (i > 0)
    lo = i+1, hi = n-1
    while lo < hi:
        sum = nums[i] + nums[lo] + nums[hi]
        if sum == 0:
            record; skip lo/hi duplicates; lo++, hi--
        else if sum < 0: lo++
        else: hi--
```

```csharp
// Optimal implementation
public IList<IList<int>> ThreeSum(int[] nums)
{
    Array.Sort(nums);
    var result = new List<IList<int>>();
    for (int i = 0; i < nums.Length - 2; i++)
    {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        int lo = i + 1, hi = nums.Length - 1;
        while (lo < hi)
        {
            int sum = nums[i] + nums[lo] + nums[hi];
            if (sum == 0)
            {
                result.Add(new List<int> { nums[i], nums[lo], nums[hi] });
                while (lo < hi && nums[lo] == nums[lo + 1]) lo++;
                while (lo < hi && nums[hi] == nums[hi - 1]) hi--;
                lo++; hi--;
            }
            else if (sum < 0) lo++;
            else hi--;
        }
    }
    return result;
}
```

> **Key insight:** sort first so the inner two-pointer scan is O(n); skip duplicates at the outer index *before* the inner loop, and at inner indices *after* recording a hit.

---

### 4Sum — LeetCode 18

Find all unique quadruplets in `nums` that sum to `target`.

**Example:** `nums = [1,0,-1,0,-2,2], target = 0` → `[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]`

```text
BRUTE FORCE | O(n⁴) | O(1)

Check every quadruple.

------------------------------------------------------------------------------

OPTIMAL — SORT + FIX TWO + TWO POINTERS | O(n³) | O(1) excluding output

sort nums
for i = 0 to n-4:
    skip outer duplicates
    for j = i+1 to n-3:
        skip inner duplicates
        lo = j+1, hi = n-1
        two-pointer scan for target - nums[i] - nums[j]
```

```csharp
// Optimal implementation
public IList<IList<int>> FourSum(int[] nums, int target)
{
    Array.Sort(nums);
    var result = new List<IList<int>>();
    int n = nums.Length;
    for (int i = 0; i < n - 3; i++)
    {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        for (int j = i + 1; j < n - 2; j++)
        {
            if (j > i + 1 && nums[j] == nums[j - 1]) continue;
            int lo = j + 1, hi = n - 1;
            while (lo < hi)
            {
                long sum = (long)nums[i] + nums[j] + nums[lo] + nums[hi];
                if (sum == target)
                {
                    result.Add(new List<int> { nums[i], nums[j], nums[lo], nums[hi] });
                    while (lo < hi && nums[lo] == nums[lo + 1]) lo++;
                    while (lo < hi && nums[hi] == nums[hi - 1]) hi--;
                    lo++; hi--;
                }
                else if (sum < target) lo++;
                else hi--;
            }
        }
    }
    return result;
}
```

> **Key insight:** cast to `long` before summing to avoid overflow; the fix-two + two-pointer structure generalises k-Sum to O(nᵏ⁻¹).

---

## Same-Direction (Fast/Slow) Pointers

### Remove Duplicates from Sorted Array — LeetCode 26

Given a sorted array, remove duplicates in-place; return the count of unique elements.

**Example:** `nums = [0,0,1,1,1,2,2,3,3,4]` → `5`, `nums = [0,1,2,3,4,…]`

```text
BRUTE FORCE | O(n) | O(n)

Copy unique elements to a new array.

------------------------------------------------------------------------------

HASHING | O(n) | O(n)

Use a LinkedHashSet to preserve order, then copy back.

------------------------------------------------------------------------------

OPTIMAL — TWO POINTERS (WRITE-POINTER) | O(n) | O(1)

slow = 0
for fast = 1 to n-1:
    if nums[fast] != nums[slow]:
        slow++
        nums[slow] = nums[fast]
return slow + 1
```

```csharp
// Optimal implementation
public int RemoveDuplicates(int[] nums)
{
    if (nums.Length == 0) return 0;
    int slow = 0;
    for (int fast = 1; fast < nums.Length; fast++)
    {
        if (nums[fast] != nums[slow])
            nums[++slow] = nums[fast];
    }
    return slow + 1;
}
```

> **Key insight:** `slow` is the write cursor; copy only when a new unique value is encountered — sorted order guarantees duplicates are adjacent.

---

### Move Zeroes — LeetCode 283

Move all zeroes to the end while preserving the relative order of non-zero elements, in-place.

**Example:** `nums = [0,1,0,3,12]` → `[1,3,12,0,0]`

```text
BRUTE FORCE | O(n) | O(n)

Copy non-zero elements to a new array, fill remainder with zeros.

------------------------------------------------------------------------------

SHIFTING IN-PLACE | O(n²) | O(1)

For each zero, shift subsequent elements left and write 0 at the end.

------------------------------------------------------------------------------

OPTIMAL — WRITE-POINTER | O(n) | O(1)

slow = 0
for fast = 0 to n-1:
    if nums[fast] != 0:
        nums[slow++] = nums[fast]
fill nums[slow..n-1] with 0
```

```csharp
// Optimal implementation
public void MoveZeroes(int[] nums)
{
    int slow = 0;
    for (int fast = 0; fast < nums.Length; fast++)
        if (nums[fast] != 0) nums[slow++] = nums[fast];
    while (slow < nums.Length) nums[slow++] = 0;
}
```

> **Key insight:** write-pointer compacts non-zeros to the front in one pass; a second pass fills the tail with zeros.

---

## Variable-Size Sliding Window

### Minimum Size Subarray Sum — LeetCode 209

Find the minimum length contiguous subarray with sum ≥ `target`. Return 0 if none exists.

**Example:** `target = 7, nums = [2,3,1,2,4,3]` → `2` (subarray `[4,3]`)

```text
BRUTE FORCE | O(n²) | O(1)

Check every subarray, track the minimum length with sum >= target.

------------------------------------------------------------------------------

PREFIX SUM + BINARY SEARCH | O(n log n) | O(n)

Build prefix sums; for each right endpoint binary-search for the leftmost index
where prefix[right] - prefix[left] >= target.

------------------------------------------------------------------------------

OPTIMAL — VARIABLE SLIDING WINDOW (SHORTEST) | O(n) | O(1)

lo = 0, windowSum = 0, best = ∞
for hi = 0 to n-1:
    windowSum += nums[hi]
    while windowSum >= target:          ← shrink while VALID
        best = min(best, hi - lo + 1)  ← record INSIDE loop
        windowSum -= nums[lo++]
return best == ∞ ? 0 : best
```

```csharp
// Optimal implementation
public int MinSubArrayLen(int target, int[] nums)
{
    int lo = 0, windowSum = 0, best = int.MaxValue;
    for (int hi = 0; hi < nums.Length; hi++)
    {
        windowSum += nums[hi];
        while (windowSum >= target)
        {
            best = Math.Min(best, hi - lo + 1);
            windowSum -= nums[lo++];
        }
    }
    return best == int.MaxValue ? 0 : best;
}
```

> **Key insight:** for the *shortest* window, record inside the shrink loop (while the window is still valid), then keep shrinking — the classic inversion from the longest-window template.

---

### Longest Substring Without Repeating Characters — LeetCode 3

Find the length of the longest substring with all unique characters.

**Example:** `s = "abcabcbb"` → `3` (`"abc"`)

```text
BRUTE FORCE | O(n³) | O(k)

Check every substring for uniqueness.

------------------------------------------------------------------------------

HASH SET SLIDING WINDOW | O(n²) | O(k)

Expand right; when duplicate found, shrink left one at a time until removed.

------------------------------------------------------------------------------

OPTIMAL — SLIDING WINDOW + LAST-SEEN MAP | O(n) | O(k)

lastSeen = {}; lo = 0; best = 0
for hi = 0 to n-1:
    if s[hi] in lastSeen:
        lo = max(lo, lastSeen[s[hi]] + 1)   // jump lo past the duplicate
    lastSeen[s[hi]] = hi
    best = max(best, hi - lo + 1)
return best
```

```csharp
// Optimal implementation
public int LengthOfLongestSubstring(string s)
{
    var lastSeen = new Dictionary<char, int>();
    int lo = 0, best = 0;
    for (int hi = 0; hi < s.Length; hi++)
    {
        if (lastSeen.TryGetValue(s[hi], out int prev) && prev >= lo)
            lo = prev + 1;
        lastSeen[s[hi]] = hi;
        best = Math.Max(best, hi - lo + 1);
    }
    return best;
}
```

> **Key insight:** store last-seen index and jump `lo` directly past the duplicate instead of shrinking one-by-one — same O(n) complexity but cleaner.

---

### Longest Repeating Character Replacement — LeetCode 424

Given string `s` of uppercase letters and integer `k`, return the longest substring you can make into a single repeated character by replacing at most `k` characters.

**Example:** `s = "AABABBA", k = 1` → `4`

```text
OPTIMAL — SLIDING WINDOW + MAX FREQUENCY | O(n) | O(1)

freq = {}, lo = 0, maxFreq = 0, best = 0
for hi = 0 to n-1:
    freq[s[hi]]++
    maxFreq = max(maxFreq, freq[s[hi]])
    // window length - maxFreq = replacements needed
    if (hi - lo + 1) - maxFreq > k:
        freq[s[lo]]--
        lo++
    best = max(best, hi - lo + 1)
return best
```

> `maxFreq` can be stale (it may not reflect the current window after shrinking), but the window only grows when a genuinely better `maxFreq` is found — so the answer is never under-counted.

```csharp
// Optimal implementation
public int CharacterReplacement(string s, int k)
{
    var freq = new int[26];
    int lo = 0, maxFreq = 0, best = 0;
    for (int hi = 0; hi < s.Length; hi++)
    {
        maxFreq = Math.Max(maxFreq, ++freq[s[hi] - 'A']);
        if ((hi - lo + 1) - maxFreq > k)
            freq[s[lo++] - 'A']--;
        best = Math.Max(best, hi - lo + 1);
    }
    return best;
}
```

> **Key insight:** the window is valid when `(length − maxFrequency) ≤ k`; `maxFreq` is monotonically non-decreasing so the window only ever grows by 1 per step.

---

### Fruit Into Baskets — LeetCode 904

You have two baskets. From a row of fruit trees, pick the maximum number of consecutive fruits such that you use at most 2 distinct fruit types.

**Example:** `fruits = [1,2,1,2,3]` → `4` (pick indices 0–3: types 1 and 2)

This is equivalent to: *longest subarray with at most 2 distinct values*.

```text
OPTIMAL — VARIABLE SLIDING WINDOW (AT-MOST-K, K=2) | O(n) | O(1)

freq = {}, lo = 0, best = 0
for hi = 0 to n-1:
    freq[fruits[hi]]++
    while freq.size > 2:        // more than 2 distinct → invalid
        freq[fruits[lo]]--
        if freq[fruits[lo]] == 0: remove key
        lo++
    best = max(best, hi - lo + 1)
return best
```

```csharp
// Optimal implementation
public int TotalFruit(int[] fruits)
{
    var freq = new Dictionary<int, int>();
    int lo = 0, best = 0;
    for (int hi = 0; hi < fruits.Length; hi++)
    {
        freq[fruits[hi]] = freq.GetValueOrDefault(fruits[hi]) + 1;
        while (freq.Count > 2)
        {
            freq[fruits[lo]]--;
            if (freq[fruits[lo]] == 0) freq.Remove(fruits[lo]);
            lo++;
        }
        best = Math.Max(best, hi - lo + 1);
    }
    return best;
}
```

> **Key insight:** "at most K distinct" is the direct sliding-window template; generalise K to solve similar problems (e.g. K=2 here, K=26 for no-repeat substring).

---

### Permutation in String — LeetCode 567

Determine whether `s2` contains any permutation of `s1` as a substring.

**Example:** `s1 = "ab", s2 = "eidbaooo"` → `true` (`"ba"` at index 3)

```text
BRUTE FORCE | O(m! × n) | O(k)

Generate all permutations of s1 and search for each in s2.

------------------------------------------------------------------------------

SORTING | O(n × m log m) | O(k)

Sort s1; for each window of length m in s2, sort and compare.

------------------------------------------------------------------------------

OPTIMAL — FIXED SLIDING WINDOW + FREQ ARRAY | O(n) | O(1)

Build freq1[26] for s1; build freqW[26] for the first window of s2.
Compare; if equal → found.
Slide: increment freqW[entering], decrement freqW[leaving], compare.
```

```csharp
// Optimal implementation
public bool CheckInclusion(string s1, string s2)
{
    if (s1.Length > s2.Length) return false;
    int[] freq1 = new int[26], freqW = new int[26];
    int m = s1.Length;
    for (int i = 0; i < m; i++) { freq1[s1[i] - 'a']++; freqW[s2[i] - 'a']++; }
    if (freq1.SequenceEqual(freqW)) return true;
    for (int i = m; i < s2.Length; i++)
    {
        freqW[s2[i] - 'a']++;
        freqW[s2[i - m] - 'a']--;
        if (freq1.SequenceEqual(freqW)) return true;
    }
    return false;
}
```

> **Key insight:** permutation check = frequency equality; a fixed-size window slides in O(1) per step by adding the incoming character and removing the outgoing one.

---

### Minimum Window Substring — LeetCode 76

Find the shortest substring of `s` containing all characters of `t` (including duplicates).

**Example:** `s = "ADOBECODEBANC", t = "ABC"` → `"BANC"`

```text
BRUTE FORCE | O(n³) | O(k)

Check every substring; test if it contains all chars of t.

------------------------------------------------------------------------------

SLIDING WINDOW — FORMED COUNT | O(n + m) | O(k)

need = freq map of t; required = |distinct chars in t|; formed = 0
lo = 0; best = (∞, 0, 0)
for hi:
    add s[hi] to window; if window[s[hi]] == need[s[hi]]: formed++
    while formed == required:
        update best
        remove s[lo] from window; if window[s[lo]] < need[s[lo]]: formed--
        lo++

------------------------------------------------------------------------------

OPTIMAL — MISSING-COUNT | O(n + m) | O(k)

missing = |t|; need = freq(t); lo = 0
for hi:
    if s[hi] needed AND window[s[hi]] < need[s[hi]]: missing--
    window[s[hi]]++
    while missing == 0:
        update best (hi - lo + 1)
        window[s[lo]]--
        if s[lo] needed AND window[s[lo]] < need[s[lo]]: missing++
        lo++
```

```csharp
// Optimal implementation
public string MinWindow(string s, string t)
{
    var need = new Dictionary<char, int>();
    foreach (char c in t) need[c] = need.GetValueOrDefault(c) + 1;

    int missing = t.Length, lo = 0, bestLen = int.MaxValue, bestStart = 0;
    var window = new Dictionary<char, int>();

    for (int hi = 0; hi < s.Length; hi++)
    {
        char r = s[hi];
        window[r] = window.GetValueOrDefault(r) + 1;
        if (need.ContainsKey(r) && window[r] <= need[r]) missing--;

        while (missing == 0)
        {
            if (hi - lo + 1 < bestLen) { bestLen = hi - lo + 1; bestStart = lo; }
            char l = s[lo];
            window[l]--;
            if (need.ContainsKey(l) && window[l] < need[l]) missing++;
            lo++;
        }
    }
    return bestLen == int.MaxValue ? "" : s.Substring(bestStart, bestLen);
}
```

> **Key insight:** track `missing` (number of characters still needed) so the shrink condition is a single integer check; shrinking while `missing == 0` minimises the window length.

---

## Fixed-Size Sliding Window

### Subarrays with K Different Integers — LeetCode 992

Count subarrays with **exactly** K distinct integers.

**Example:** `nums = [1,2,1,3,4], k = 3` → `3`

```text
BRUTE FORCE | O(n²) | O(k)

Check every subarray; count those with exactly k distinct values.

------------------------------------------------------------------------------

OPTIMAL — AT-MOST-K TRICK | O(n) | O(k)

count(exactly K) = count(atMost K) - count(atMost K-1)

atMost(K): standard sliding window — shrink while distinct > K,
           add (hi - lo + 1) to count after each step.
```

```csharp
// Optimal implementation
public int SubarraysWithKDistinct(int[] nums, int k) =>
    CountAtMost(nums, k) - CountAtMost(nums, k - 1);

private int CountAtMost(int[] nums, int k)
{
    var freq = new Dictionary<int, int>();
    int lo = 0, count = 0;
    for (int hi = 0; hi < nums.Length; hi++)
    {
        freq[nums[hi]] = freq.GetValueOrDefault(nums[hi]) + 1;
        while (freq.Count > k)
        {
            freq[nums[lo]]--;
            if (freq[nums[lo]] == 0) freq.Remove(nums[lo]);
            lo++;
        }
        count += hi - lo + 1;
    }
    return count;
}
```

> **Key insight:** exact-K windows aren't directly shrinkable; the at-most-K trick decomposes the problem into two monotone windows, each solvable with standard sliding-window counting.

---

### Sliding Window Maximum — LeetCode 239

Given array `nums` and window size `k`, return the maximum of each window as it slides across.

**Example:** `nums = [1,3,-1,-3,5,3,6,7], k = 3` → `[3,3,5,5,6,7]`

The efficient solution uses a **monotonic deque** — template and full rationale live in [StacksAndQueues](../StacksAndQueues/StacksAndQueues.md). Summary:

```text
BRUTE FORCE | O(n × k) | O(1)

Scan each window of size k for its maximum.

------------------------------------------------------------------------------

MAX HEAP + LAZY DELETION | O(n log n) | O(n)

Maintain a max-heap; lazily discard out-of-window indices from the top.

------------------------------------------------------------------------------

OPTIMAL — MONOTONIC DEQUE | O(n) | O(k)

Deque stores indices in decreasing order of value (front = current max).
For each i:
  remove front if out of window (index < i - k + 1)
  pop back while nums[back] <= nums[i]  (they can never be a future max)
  push i to back
  if i >= k-1: emit nums[deque.front]
```

```csharp
// Optimal implementation — see StacksAndQueues for template rationale
public int[] MaxSlidingWindow(int[] nums, int k)
{
    var dq = new LinkedList<int>(); // stores indices
    var result = new int[nums.Length - k + 1];
    for (int i = 0; i < nums.Length; i++)
    {
        if (dq.Count > 0 && dq.First.Value < i - k + 1) dq.RemoveFirst();
        while (dq.Count > 0 && nums[dq.Last.Value] <= nums[i]) dq.RemoveLast();
        dq.AddLast(i);
        if (i >= k - 1) result[i - k + 1] = nums[dq.First.Value];
    }
    return result;
}
```

> **Key insight:** a monotonic deque removes elements that can never be a future window maximum, giving O(1) amortised max per step; see [monotonic deque](../StacksAndQueues/StacksAndQueues.md) for the full explanation.

