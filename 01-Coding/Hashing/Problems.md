# Hashing — Problems

| # | Problem | LeetCode | Pattern | Difficulty |
| - | ------- | -------- | ------- | ---------- |
| 1 | Two Sum | [1](https://leetcode.com/problems/two-sum/) | Complement Lookup | Easy |
| 2 | Contains Duplicate | [217](https://leetcode.com/problems/contains-duplicate/) | Set Membership | Easy |
| 3 | Valid Anagram | [242](https://leetcode.com/problems/valid-anagram/) | Frequency Counting | Easy |
| 4 | First Unique Character in a String | [387](https://leetcode.com/problems/first-unique-character-in-a-string/) | Frequency Counting | Easy |
| 5 | Ransom Note | [383](https://leetcode.com/problems/ransom-note/) | Frequency Counting | Easy |
| 6 | Isomorphic Strings | [205](https://leetcode.com/problems/isomorphic-strings/) | Frequency Counting | Easy |
| 7 | Word Pattern | [290](https://leetcode.com/problems/word-pattern/) | Frequency Counting | Easy |
| 8 | Group Anagrams | [49](https://leetcode.com/problems/group-anagrams/) | Canonical-Key Grouping | Medium |
| 9 | Top K Frequent Elements | [347](https://leetcode.com/problems/top-k-frequent-elements/) | Frequency Counting | Medium |
| 10 | 4Sum II | [454](https://leetcode.com/problems/4sum-ii/) | Complement Lookup | Medium |
| 11 | Longest Consecutive Sequence | [128](https://leetcode.com/problems/longest-consecutive-sequence/) | Set Membership | Medium |
| 12 | Insert Delete GetRandom O(1) | [380](https://leetcode.com/problems/insert-delete-getrandom-o1/) | Set Membership | Medium |
| 13 | Subarray Sum Equals K | [560](https://leetcode.com/problems/subarray-sum-equals-k/) | Prefix Sum + HashMap | Medium |
| 14 | Contiguous Array | [525](https://leetcode.com/problems/contiguous-array/) | Prefix Sum + HashMap | Medium |
| 15 | Subarray Sums Divisible by K | [974](https://leetcode.com/problems/subarray-sums-divisible-by-k/) | Prefix Sum + HashMap | Medium |

---

## Frequency Counting

### Two Sum — LeetCode 1

Given an integer array `nums` and `target`, return the indices of the two numbers that add up to `target`. Exactly one solution exists.

**Example:** `nums = [2,7,11,15], target = 9` → `[0,1]` (2+7=9)

```text
BRUTE FORCE | O(n²) | O(1)

Check every pair (i,j) with i < j; return when nums[i]+nums[j]==target.

------------------------------------------------------------------------------

SORTING + TWO POINTERS | O(n log n) | O(n)

Pair each value with its original index, sort by value, use opposite-ends
two pointers. Must carry original indices because sort destroys them.

------------------------------------------------------------------------------

OPTIMAL — COMPLEMENT LOOKUP | O(n) | O(n)

For each nums[i], check whether (target - nums[i]) is already in the map.
If yes, return [map[complement], i]. Otherwise record nums[i]→i.
```

```csharp
public int[] TwoSum(int[] nums, int target)
{
    var seen = new Dictionary<int, int>(); // value → index
    for (int i = 0; i < nums.Length; i++)
    {
        int complement = target - nums[i];
        if (seen.TryGetValue(complement, out int j))
            return [j, i];
        seen[nums[i]] = i;
    }
    return [];
}
```

> **Key insight:** store what you need (the complement's index), not what you have — one pass is enough.

---

### Contains Duplicate — LeetCode 217

Return `true` if any value appears at least twice in `nums`.

**Example:** `nums = [1,2,3,1]` → `true`

```text
BRUTE FORCE | O(n²) | O(1)

For each element, scan the rest of the array for a match.

------------------------------------------------------------------------------

SORTING | O(n log n) | O(1)

Sort; any duplicate will be adjacent.

------------------------------------------------------------------------------

OPTIMAL — HASH SET | O(n) | O(n)

Add each element to a set; return true immediately on duplicate.
Equivalent one-liner: return nums.Length != new HashSet<int>(nums).Count
```

```csharp
public bool ContainsDuplicate(int[] nums)
{
    var seen = new HashSet<int>();
    foreach (int x in nums)
        if (!seen.Add(x)) return true;
    return false;
}
```

> **Key insight:** `HashSet.Add` returns `false` on duplicate — no need for a separate `Contains` check.

---

### Valid Anagram — LeetCode 242

Return `true` if `t` is an anagram of `s` (same characters, same frequencies, any order).

**Example:** `s = "anagram", t = "nagaram"` → `true`

```text
SORTING | O(n log n) | O(1)

Sort both strings; they must be equal.

------------------------------------------------------------------------------

HASHING | O(n) | O(k)

Build a frequency map from s, decrement for t.
Any nonzero count → not an anagram.

------------------------------------------------------------------------------

OPTIMAL — FIXED ARRAY | O(n) | O(1)

Use int[26] (or int[128] for full ASCII).
Increment for s, decrement for t; any nonzero entry → false.
```

```csharp
public bool IsAnagram(string s, string t)
{
    if (s.Length != t.Length) return false;
    var cnt = new int[26];
    for (int i = 0; i < s.Length; i++)
    {
        cnt[s[i] - 'a']++;
        cnt[t[i] - 'a']--;
    }
    return cnt.All(x => x == 0);
}
```

> **Key insight:** `int[26]` beats a dictionary here — O(1) guaranteed, no heap allocation.

---

### First Unique Character in a String — LeetCode 387

Return the index of the first non-repeating character in `s`, or `-1` if none.

**Example:** `s = "leetcode"` → `0` (`'l'` appears once)

```text
BRUTE FORCE | O(n²) | O(1)

For each character, scan the whole string to check uniqueness.

------------------------------------------------------------------------------

OPTIMAL — FREQUENCY ARRAY | O(n) | O(1)

Pass 1: build int[26] frequency counts.
Pass 2: return the first index whose character has count == 1.
```

```csharp
public int FirstUniqChar(string s)
{
    var cnt = new int[26];
    foreach (char c in s) cnt[c - 'a']++;
    for (int i = 0; i < s.Length; i++)
        if (cnt[s[i] - 'a'] == 1) return i;
    return -1;
}
```

> **Key insight:** two passes over the string with O(1) space is better than a single pass with an ordered dictionary.

---

### Ransom Note — LeetCode 383

Return `true` if `ransomNote` can be constructed using the letters from `magazine` (each letter used at most once).

**Example:** `ransomNote = "aa", magazine = "aab"` → `true`

```text
BRUTE FORCE | O(n·m) | O(1)

For each character in ransomNote, scan magazine for a match and mark used.

------------------------------------------------------------------------------

OPTIMAL — FREQUENCY ARRAY | O(n + m) | O(1)

Count letters in magazine (int[26]).
Decrement for each letter in ransomNote; any count going negative → false.
```

```csharp
public bool CanConstruct(string ransomNote, string magazine)
{
    var cnt = new int[26];
    foreach (char c in magazine) cnt[c - 'a']++;
    foreach (char c in ransomNote)
    {
        if (--cnt[c - 'a'] < 0) return false;
    }
    return true;
}
```

> **Key insight:** check availability greedily as you consume — fail fast on the first shortage.

---

### Isomorphic Strings — LeetCode 205

Two strings are isomorphic if each character in `s` can be mapped to a character in `t` with a bijection (one-to-one, both ways).

**Example:** `s = "egg", t = "add"` → `true` (e→a, g→d); `s = "foo", t = "bar"` → `false`

```text
BRUTE FORCE | O(n²) | O(1)

For each pair of positions, verify the pattern is consistent.

------------------------------------------------------------------------------

OPTIMAL — TWO MAPS | O(n) | O(1)

Maintain s→t and t→s maps.
At each position check both directions; any conflict → false.
```

```csharp
public bool IsIsomorphic(string s, string t)
{
    var sToT = new int[128];
    var tToS = new int[128];
    for (int i = 0; i < s.Length; i++)
    {
        int cs = s[i], ct = t[i];
        if (sToT[cs] != 0 && sToT[cs] != ct) return false;
        if (tToS[ct] != 0 && tToS[ct] != cs) return false;
        sToT[cs] = ct;
        tToS[ct] = cs;
    }
    return true;
}
```

> **Key insight:** bijection requires checking both directions — s→t and t→s.

---

### Word Pattern — LeetCode 290

Return `true` if `s` (space-separated words) follows `pattern` exactly (same bijection as Isomorphic Strings but between chars and words).

**Example:** `pattern = "abba", s = "dog cat cat dog"` → `true`

```text
OPTIMAL — TWO MAPS | O(n) | O(n)

Split s into words. Map pattern[i]→word[i] and word[i]→pattern[i].
Any inconsistency → false. Also verify lengths match.
```

```csharp
public bool WordPattern(string pattern, string s)
{
    string[] words = s.Split(' ');
    if (pattern.Length != words.Length) return false;
    var charToWord = new Dictionary<char, string>();
    var wordToChar = new Dictionary<string, char>();
    for (int i = 0; i < pattern.Length; i++)
    {
        char c = pattern[i]; string w = words[i];
        if (charToWord.TryGetValue(c, out string? mapped) && mapped != w) return false;
        if (wordToChar.TryGetValue(w, out char mc) && mc != c) return false;
        charToWord[c] = w;
        wordToChar[w] = c;
    }
    return true;
}
```

> **Key insight:** same bijection logic as Isomorphic Strings — always enforce both directions.

---

### Top K Frequent Elements — LeetCode 347

Return the `k` most frequent elements from `nums`. Any order is acceptable.

**Example:** `nums = [1,1,1,2,2,3], k = 2` → `[1,2]`

```text
HASHING + SORTING | O(n + m log m) | O(m)

Build frequency map; sort entries by count descending; take first k.

------------------------------------------------------------------------------

HASHING + MIN HEAP | O(n + m log k) | O(m + k)

Build frequency map; maintain a min-heap of size k.
See HeapsAndPriorityQueues/HeapsAndPriorityQueues.md for the heap phase.

------------------------------------------------------------------------------

OPTIMAL — HASHING + BUCKET SORT | O(n) | O(n)

Build frequency map; place each value into buckets[frequency].
Scan buckets from high to low; collect until k results gathered.
```

```csharp
public int[] TopKFrequent(int[] nums, int k)
{
    var freq = new Dictionary<int, int>();
    foreach (int x in nums) freq[x] = freq.GetValueOrDefault(x) + 1;

    var buckets = new List<int>[nums.Length + 1];
    foreach (var (val, cnt) in freq)
    {
        buckets[cnt] ??= new List<int>();
        buckets[cnt].Add(val);
    }

    var result = new List<int>();
    for (int i = buckets.Length - 1; i >= 1 && result.Count < k; i--)
        if (buckets[i] != null) result.AddRange(buckets[i]);
    return result.ToArray();
}
```

> **Key insight:** frequency is bounded by `n`, so bucket sort by frequency achieves O(n). For the heap-based O(n log k) approach, see [Heaps and Priority Queues](../HeapsAndPriorityQueues/HeapsAndPriorityQueues.md).

---

## Canonical-Key Grouping

### Group Anagrams — LeetCode 49

Given an array of strings, group all anagrams together.

**Example:** `["eat","tea","tan","ate","nat","bat"]` → `[["bat"],["nat","tan"],["ate","eat","tea"]]`

```text
SORTING + HASHING | O(n·k log k) | O(n·k)

Sort each string; use the sorted form as the map key.

------------------------------------------------------------------------------

OPTIMAL — FREQUENCY ARRAY KEY | O(n·k) | O(n·k)

Build a 26-element count array per string; serialise it as the key.
No sorting required — O(k) per string instead of O(k log k).
```

```csharp
public IList<IList<string>> GroupAnagrams(string[] strs)
{
    var map = new Dictionary<string, List<string>>();
    foreach (string s in strs)
    {
        var cnt = new int[26];
        foreach (char c in s) cnt[c - 'a']++;
        string key = string.Join(",", cnt);
        if (!map.TryGetValue(key, out var list))
            map[key] = list = new List<string>();
        list.Add(s);
    }
    return new List<IList<string>>(map.Values);
}
```

> **Key insight:** two strings are anagrams iff they have the same character-frequency vector — that vector is the canonical key.

---

## Complement Lookup

### 4Sum II — LeetCode 454

Given four integer arrays `A`, `B`, `C`, `D` each of length `n`, count tuples `(i,j,k,l)` such that `A[i]+B[j]+C[k]+D[l] == 0`.

**Example:** `A=[1,-2], B=[-2,1], C=[-1,2], D=[0,2]` → `2`

```text
BRUTE FORCE | O(n⁴) | O(1)

Four nested loops checking every tuple.

------------------------------------------------------------------------------

OPTIMAL — SPLIT + COMPLEMENT MAP | O(n²) | O(n²)

Store all A[i]+B[j] sums in a frequency map.
For each C[k]+D[l], look up -(C[k]+D[l]) in the map and add its count.
```

```csharp
public int FourSumCount(int[] nums1, int[] nums2, int[] nums3, int[] nums4)
{
    var map = new Dictionary<int, int>();
    foreach (int a in nums1)
        foreach (int b in nums2)
            map[a + b] = map.GetValueOrDefault(a + b) + 1;

    int count = 0;
    foreach (int c in nums3)
        foreach (int d in nums4)
            count += map.GetValueOrDefault(-(c + d));
    return count;
}
```

> **Key insight:** split 4 arrays into two pairs; O(n²) map of pair sums reduces the 4-way problem to a 2-way complement lookup.

---

## Set Membership

### Longest Consecutive Sequence — LeetCode 128

Find the length of the longest sequence of consecutive integers in `nums`. Must run in O(n).

**Example:** `nums = [100,4,200,1,3,2]` → `4` (sequence 1,2,3,4)

```text
SORTING | O(n log n) | O(1)

Sort, then scan for the longest run, skipping duplicates.

------------------------------------------------------------------------------

OPTIMAL — HASH SET | O(n) | O(n)

Put all numbers in a set.
For each n where (n-1) is NOT in the set (sequence start), extend while (n+len) is in the set.
Each element is visited at most twice across all runs → O(n).
```

```csharp
public int LongestConsecutive(int[] nums)
{
    var set = new HashSet<int>(nums);
    int best = 0;
    foreach (int n in set)
    {
        if (set.Contains(n - 1)) continue; // not a sequence start
        int len = 1;
        while (set.Contains(n + len)) len++;
        best = Math.Max(best, len);
    }
    return best;
}
```

> **Key insight:** only start counting from a sequence beginning (n−1 absent) so each element is processed at most once.

---

### Insert Delete GetRandom O(1) — LeetCode 380

Design a data structure supporting `Insert`, `Remove`, and `GetRandom` all in average O(1) time, where `GetRandom` returns a uniformly random element.

**Example:** Insert 1, Insert 2, Remove 1, GetRandom → must return 2.

```text
NAIVE — SORTED SET | O(log n) insert/remove | O(n) getRandom

SortedSet or TreeSet; getRandom requires ElementAt(rand) → O(n).

------------------------------------------------------------------------------

OPTIMAL — DICT + LIST | O(1) avg | O(n)

Keep a List<int> for O(1) random access by index.
Keep a Dictionary<int,int> mapping value→list index for O(1) lookup.
Remove: swap the target with the last element, update the map, pop the list.
```

```csharp
public class RandomizedSet
{
    private readonly List<int> _vals = new();
    private readonly Dictionary<int, int> _idx = new(); // value → list index

    public bool Insert(int val)
    {
        if (_idx.ContainsKey(val)) return false;
        _idx[val] = _vals.Count;
        _vals.Add(val);
        return true;
    }

    public bool Remove(int val)
    {
        if (!_idx.TryGetValue(val, out int i)) return false;
        int last = _vals[^1];
        _vals[i] = last;
        _idx[last] = i;
        _vals.RemoveAt(_vals.Count - 1);
        _idx.Remove(val);
        return true;
    }

    public int GetRandom() => _vals[Random.Shared.Next(_vals.Count)];
}
```

> **Key insight:** swap-with-last on remove keeps the list dense so `GetRandom` via index is always O(1) — no gaps.

---

## Prefix Sum + HashMap

### Subarray Sum Equals K — LeetCode 560

Count contiguous subarrays of `nums` whose sum equals `k`.

**Example:** `nums = [1,2,3], k = 3` → `2` (subarrays [1,2] and [3])

```text
BRUTE FORCE | O(n²) | O(1)

Two nested loops computing every subarray sum.

------------------------------------------------------------------------------

OPTIMAL — PREFIX SUM + HASHMAP | O(n) | O(n)

prefix[j] - prefix[i] = k  ⟺  prefix[i] = prefix[j] - k
Count how many earlier prefixes equal (currentPrefix - k).
Seed prefixCount[0]=1 to handle subarrays starting at index 0.
```

```csharp
public int SubarraySum(int[] nums, int k)
{
    var prefixCount = new Dictionary<int, int> { [0] = 1 };
    int sum = 0, count = 0;
    foreach (int x in nums)
    {
        sum += x;
        count += prefixCount.GetValueOrDefault(sum - k);
        prefixCount[sum] = prefixCount.GetValueOrDefault(sum) + 1;
    }
    return count;
}
```

> **Key insight:** `prefixCount[0] = 1` is mandatory — it counts subarrays that begin at index 0 and sum to exactly `k`.

---

### Contiguous Array — LeetCode 525

Find the maximum length subarray with an equal number of 0s and 1s.

**Example:** `nums = [0,1,0,1,1,0,0]` → `6`

```text
BRUTE FORCE | O(n²) | O(1)

Check every subarray.

------------------------------------------------------------------------------

OPTIMAL — PREFIX BALANCE + HASHMAP | O(n) | O(n)

Treat 0 as -1. Track running balance (sum of ±1 values).
balance[j] - balance[i] = 0  ⟺  equal 0s and 1s in [i+1..j]
⟺  balance[i] == balance[j] was seen before.
Record the first index where each balance occurs; use last−first as length.
Seed balance 0 at index -1.
```

```csharp
public int FindMaxLength(int[] nums)
{
    var firstSeen = new Dictionary<int, int> { [0] = -1 };
    int balance = 0, best = 0;
    for (int i = 0; i < nums.Length; i++)
    {
        balance += nums[i] == 1 ? 1 : -1;
        if (firstSeen.TryGetValue(balance, out int prev))
            best = Math.Max(best, i - prev);
        else
            firstSeen[balance] = i;
    }
    return best;
}
```

> **Key insight:** equal 0s and 1s ⟺ balance unchanged ⟺ same prefix balance seen twice — store the *first* occurrence to maximise length.

---

### Subarray Sums Divisible by K — LeetCode 974

Count subarrays whose sum is divisible by `k`.

**Example:** `nums = [4,5,0,-2,-3,1], k = 5` → `7`

```text
BRUTE FORCE | O(n²) | O(1)

Sum every subarray and check divisibility.

------------------------------------------------------------------------------

OPTIMAL — PREFIX MOD + HASHMAP | O(n) | O(k)

(prefix[j] - prefix[i]) % k == 0  ⟺  prefix[j] % k == prefix[i] % k
Count pairs of equal remainders seen so far.
Use (rem % k + k) % k to keep remainder non-negative.
```

```csharp
public int SubarraysDivByK(int[] nums, int k)
{
    var remCount = new Dictionary<int, int> { [0] = 1 };
    int prefix = 0, count = 0;
    foreach (int x in nums)
    {
        prefix = ((prefix + x) % k + k) % k;
        count += remCount.GetValueOrDefault(prefix);
        remCount[prefix] = remCount.GetValueOrDefault(prefix) + 1;
    }
    return count;
}
```

> **Key insight:** two prefix sums with the same remainder mod `k` always enclose a subarray divisible by `k`. The `+k)%k` guard handles negative numbers in C#.

