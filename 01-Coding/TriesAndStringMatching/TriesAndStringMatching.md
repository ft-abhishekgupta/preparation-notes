# Tries and String Matching

> **Core idea:** tries turn prefix queries into O(L) tree walks; string-matching algorithms (KMP, Z, Rabin-Karp) avoid naive O(nm) by pre-processing structure once.
> **Recognise it when:** "autocomplete / prefix search", "find pattern in text without backtracking", "longest palindromic substring", "repeated/duplicate substring", "multi-pattern search".
> **Costs:** Trie insert/search O(L); KMP/Z O(n + m); Rabin-Karp O(n) avg; Manacher O(n).

---

## Mental Model

### Trie

Each root-to-node path spells a prefix. The invariant: **every node is the unique endpoint for exactly one prefix of the inserted strings**. Walking `k` characters down always takes O(k) time regardless of how many words are stored.

### KMP / Z / Rabin-Karp

All three avoid re-scanning text characters by building a *pre-processed structure* over the pattern (or both strings):

- **KMP:** the LPS array encodes "if mismatch at position j, the largest prefix of pattern[0..j-1] that could still match is lps[j-1] characters long — jump there, not back to 0".
- **Z-array:** `Z[i]` = how many characters starting at `i` match the pattern's prefix — build once, read off matches in one pass.
- **Rabin-Karp:** maintain a rolling polynomial hash so each window shift is O(1); verify the actual strings only on a hash collision.

---

## Complexity Reference

| Operation | Time | Space | Notes |
| --------- | ---- | ----- | ----- |
| Trie insert / search / startsWith | O(L) | O(L) per word | L = word length |
| Trie total space (26-array) | — | O(26 × nodes) | 26 children even if sparse |
| Trie total space (Dictionary) | — | O(nodes) | better for large/unknown alphabet |
| KMP build LPS | O(m) | O(m) | m = pattern length |
| KMP search | O(n) | O(1) | n = text length |
| Z-array construction | O(n + m) | O(n + m) | on concatenated string |
| Rabin-Karp avg / worst | O(n) / O(nm) | O(1) | verify on hash match! |
| Manacher | O(n) | O(n) | after #-transform |
| Aho-Corasick build | O(Σ\|pᵢ\| · α) | O(Σ\|pᵢ\| · α) | α = alphabet size |
| Aho-Corasick search | O(n + matches) | O(1) extra | |

---

## Templates

### 1 — Trie: fixed-array children (lowercase a-z only)

```csharp
// Use when: alphabet is known and small (26 letters).
// Time: O(L) per op. Space: O(26 × nodes) — can be large if many short words.
class TrieNode
{
    public TrieNode?[] Children = new TrieNode[26];
    public bool IsEnd;
    public int PrefixCount; // optional: count words with this prefix
}

class Trie
{
    private readonly TrieNode _root = new();

    public void Insert(string word)
    {
        var cur = _root;
        foreach (var c in word)
        {
            int i = c - 'a';
            cur.Children[i] ??= new TrieNode();
            cur = cur.Children[i]!;
            cur.PrefixCount++;
        }
        cur.IsEnd = true;
    }

    public bool Search(string word)    => Walk(word)?.IsEnd == true;
    public bool StartsWith(string pre) => Walk(pre) != null;
    public int  CountPrefix(string pre) => Walk(pre)?.PrefixCount ?? 0;

    private TrieNode? Walk(string s)
    {
        var cur = _root;
        foreach (var c in s)
        {
            cur = cur.Children[c - 'a'];
            if (cur == null) return null;
        }
        return cur;
    }
}
```

### 2 — Trie: Dictionary children (arbitrary alphabet / Unicode)

```csharp
// Use when: alphabet is large, unknown, or contains non-ASCII characters.
// Time: O(L) per op. Space: O(nodes) — no wasted 26-slots.
class TrieNode
{
    public Dictionary<char, TrieNode> Children = new();
    public bool IsEnd;
}
```

**Fixed-array vs Dictionary trade-off:**

| | Fixed `TrieNode[26]` | `Dictionary<char, TrieNode>` |
| --- | --- | --- |
| Access time | **O(1)** | O(1) avg |
| Memory per node | **Always 26 × 8 = 208 B** | O(actual children) |
| Works for Unicode | ❌ | **✅** |
| Cache-friendly | **✅** | ❌ |
| Prefer when | a-z only, dense | large/variable alphabet |

### 3 — Binary Trie (Maximum XOR)

Insert 32-bit integers bit-by-bit from MSB. To maximise XOR with a query, greedily take the **opposite** bit at each level.

```csharp
// Use when: "maximum XOR of two numbers" (LeetCode 421).
// Time: O(32 × n) build + O(32) query. Space: O(32 × n).
class BitTrieNode { public BitTrieNode?[] C = new BitTrieNode[2]; }

class BitTrie
{
    private readonly BitTrieNode _root = new();

    public void Insert(int num)
    {
        var cur = _root;
        for (int b = 31; b >= 0; b--)
        {
            int bit = (num >> b) & 1;
            cur.C[bit] ??= new BitTrieNode();
            cur = cur.C[bit]!;
        }
    }

    // Returns the maximum XOR of num with any previously inserted number.
    public int MaxXor(int num)
    {
        var cur = _root;
        int result = 0;
        for (int b = 31; b >= 0; b--)
        {
            int bit = (num >> b) & 1;
            int want = 1 - bit;          // greedy: prefer opposite bit
            if (cur.C[want] != null) { result |= (1 << b); cur = cur.C[want]!; }
            else if (cur.C[bit]  != null) { cur = cur.C[bit]!; }
            else break;
        }
        return result;
    }
}
```

> **Why it works:** XOR is 1 only when bits differ. At each level we greedily choose the child whose bit *differs* from `num`'s bit, maximising the contribution of each position.

### 4 — KMP: LPS construction + search

**What `lps[i]` means:** the length of the longest *proper* prefix of `pattern[0..i]` that is also a suffix of `pattern[0..i]`. "Proper" = not the whole string.

**LPS trace for `"ababd"`:**

```text
i=0: 'a'  lps[0]=0   (base case)
i=1: 'b'  p[1]≠p[0]  → lps[1]=0
i=2: 'a'  p[2]=p[0]  → lps[2]=1
i=3: 'b'  p[3]=p[1]  → lps[3]=2
i=4: 'd'  p[4]≠p[2]  → fall back: len=lps[1]=0; p[4]≠p[0] → lps[4]=0
Result: [0,0,1,2,0]
```

**Why the fallback `len = lps[len-1]` is correct:** if `pattern[i] ≠ pattern[len]` we cannot extend the current match, but the longest *shorter* border is `lps[len-1]` — the largest prefix of `pattern[0..len-1]` that could still be a suffix. We retry with that length without advancing `i`.

```csharp
// Time: O(m) build, O(n) search. Space: O(m).
int[] BuildLPS(string p)
{
    int m = p.Length;
    var lps = new int[m];
    int len = 0, i = 1;
    while (i < m)
    {
        if (p[i] == p[len])     { lps[i++] = ++len; }
        else if (len > 0)       { len = lps[len - 1]; } // fall back, don't advance i
        else                    { lps[i++] = 0; }
    }
    return lps;
}

// Standard two-pointer KMP search — returns all start indices.
List<int> KMPSearch(string text, string pattern)
{
    if (pattern.Length == 0) return new List<int> { 0 };
    int[] lps = BuildLPS(pattern);
    var result = new List<int>();
    int i = 0, j = 0;                   // i = text pointer, j = pattern pointer
    while (i < text.Length)
    {
        if (text[i] == pattern[j])
        {
            i++; j++;
            if (j == pattern.Length)    // full match
            {
                result.Add(i - j);
                j = lps[j - 1];         // look for overlapping matches
            }
        }
        else if (j > 0)  { j = lps[j - 1]; } // mismatch after some match
        else             { i++; }             // mismatch at j=0: advance text
    }
    return result;
}
```

**KMP search trace on `text="ababcabcabababd"`, `pattern="ababd"` (lps=[0,0,1,2,0]):**

```text
i=0,j=0: a=a  i=1,j=1
i=1,j=1: b=b  i=2,j=2
i=2,j=2: a=a  i=3,j=3
i=3,j=3: b=b  i=4,j=4
i=4,j=4: c≠d  j→lps[3]=2
i=4,j=2: c≠a  j→lps[1]=0
i=4,j=0: c≠a  i=5
i=5,j=0: a=a  i=6,j=1
i=6,j=1: b=b  i=7,j=2
i=7,j=2: c≠a  j→lps[1]=0
i=7,j=0: c≠a  i=8
i=8,j=0: a=a  i=9,j=1
i=9,j=1: b=b  i=10,j=2
i=10,j=2: a=a  i=11,j=3
i=11,j=3: b=b  i=12,j=4
i=12,j=4: a≠d  j→lps[3]=2
i=12,j=2: a=a  i=13,j=3
i=13,j=3: b=b  i=14,j=4
i=14,j=4: d=d  match at index 10! j→lps[4]=0
Result: [10]
```

### 5 — Z-Algorithm

`Z[i]` = length of the longest substring starting at `i` that matches a prefix of `s`.

```csharp
// Time: O(n). Space: O(n).
// Pattern search: s = pattern + '$' + text; any Z[i] == pattern.Length is a match at text[i - m - 1].
int[] ZArray(string s)
{
    int n = s.Length;
    var z = new int[n];
    int l = 0, r = 0;
    for (int i = 1; i < n; i++)
    {
        if (i < r) z[i] = Math.Min(r - i, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    return z;
}
```

**Z-array trace for `s = "aab$aab"` (pattern `"aab"`, sentinel `'$'`, text `"aab"`):**

```text
Index: 0  1  2  3  4  5  6
Char:  a  a  b  $  a  a  b
Z:     -  1  0  0  3  1  0
Z[4]=3 = pattern.Length → match at text position 4 - 3 - 1 = 0 ✓
```

### 6 — Rabin-Karp Rolling Hash

**Hash recurrence:** `hash(s[i..i+m-1]) = (hash(s[i-1..i+m-2]) - s[i-1]·BASE^(m-1)) · BASE + s[i+m-1]` (all mod `MOD`).

```csharp
// Time: O(n+m) average, O(nm) worst. Space: O(1).
// Always verify text.Substring on a hash match — hashes can collide.
bool RabinKarp(string text, string pattern)
{
    const long Base = 31, Mod = 1_000_000_007;
    int m = pattern.Length, n = text.Length;
    if (m > n) return false;

    long ph = 0, th = 0, power = 1;
    for (int i = 0; i < m - 1; i++) power = power * Base % Mod;

    for (int i = 0; i < m; i++)
    {
        ph = (ph * Base + (pattern[i] - 'a' + 1)) % Mod;
        th = (th * Base + (text[i]    - 'a' + 1)) % Mod;
    }

    for (int i = 0; i <= n - m; i++)
    {
        if (ph == th && text.Substring(i, m) == pattern) return true;
        if (i < n - m)
        {
            // Remove leading character, add trailing character
            th = (th - (text[i] - 'a' + 1) * power % Mod + Mod) % Mod;
            th = (th * Base + (text[i + m] - 'a' + 1)) % Mod;
        }
    }
    return false;
}
```

> **Trap:** the original code had `th = (th - text[i] * power % Mod + Mod) * Base % Mod + text[i + m]; th %= Mod;` — this is wrong because `text[i]` is a `char` (raw Unicode value, not 1-based offset), and the `+ text[i+m]` before `%=` can overflow or miss the mod. The corrected version above uses `(c - 'a' + 1)` consistently and applies `% Mod` after each addition.

**Double hashing** (two independent `(Base, Mod)` pairs) reduces collision probability to ~1/10¹⁸ — use it for Longest Duplicate Substring (LeetCode 1044).

### 7 — Manacher's Algorithm

Finds the longest palindromic substring (and all palindrome radii) in O(n).

**Transform:** insert `#` between every character and add sentinels: `"abc"` → `"^#a#b#c#$"`. This handles odd/even lengths uniformly — every palindrome in the transformed string is centred on a `#` or a real character.

```csharp
// Time: O(n). Space: O(n). Expand-around-centre O(n²) is usually fine in interviews.
int LongestPalindrome_Manacher(string s)
{
    // Build transformed string: ^ # a # b # a # $
    var t = new System.Text.StringBuilder("^");
    foreach (char c in s) { t.Append('#'); t.Append(c); }
    t.Append("#$");
    string T = t.ToString();

    int n = T.Length;
    int[] P = new int[n];   // P[i] = palindrome radius at T[i] (in transformed coords)
    int C = 0, R = 0;       // C = centre of rightmost palindrome, R = its right boundary

    for (int i = 1; i < n - 1; i++)
    {
        int mirror = 2 * C - i;
        if (i < R) P[i] = Math.Min(R - i, P[mirror]);

        // Attempt to expand
        while (T[i + P[i] + 1] == T[i - P[i] - 1]) P[i]++;

        // Update rightmost palindrome
        if (i + P[i] > R) { C = i; R = i + P[i]; }
    }

    // Find the maximum radius and convert back to original string indices
    int maxLen = 0, centre = 0;
    for (int i = 1; i < n - 1; i++)
        if (P[i] > maxLen) { maxLen = P[i]; centre = i; }

    // centre in T corresponds to original index: (centre - 1) / 2
    // length in original string = maxLen
    int start = (centre - 1 - maxLen) / 2;
    return maxLen; // or return s.Substring(start, maxLen);
}
```

**Mirror trick:** if `i` lies inside the rightmost palindrome `[C-R, C+R]`, its mirror `mirror = 2C - i` has already been computed. `P[i] ≥ min(R - i, P[mirror])` — the smaller of the two avoids going outside the known boundary. We then try to extend.

**Index conversion:** a position `i` in `T` corresponds to original index `(i - 1) / 2`. The palindrome of radius `P[i]` in `T` has length `P[i]` in the original string. Start index = `(i - 1 - P[i]) / 2`.

### 8 — Expand-Around-Centre (interview default for palindromes)

```csharp
// Time: O(n²). Space: O(1). Use this unless O(n) is explicitly required.
(int start, int len) Expand(string s, int lo, int hi)
{
    while (lo >= 0 && hi < s.Length && s[lo] == s[hi]) { lo--; hi++; }
    return (lo + 1, hi - lo - 1);
}

string LongestPalindromicSubstring(string s)
{
    int start = 0, maxLen = 1;
    for (int i = 0; i < s.Length; i++)
    {
        var (s1, l1) = Expand(s, i, i);     // odd length
        var (s2, l2) = Expand(s, i, i + 1); // even length
        if (l1 > maxLen) { start = s1; maxLen = l1; }
        if (l2 > maxLen) { start = s2; maxLen = l2; }
    }
    return s.Substring(start, maxLen);
}
```

---

## Palindrome Techniques — Comparison

| Technique | Time | Space | Best for |
| --------- | ---- | ----- | -------- |
| Expand-around-centre | O(n²) | **O(1)** | Longest/count palindromes; interview default |
| DP table `isPalin[i][j]` | O(n²) | O(n²) | Precompute all palindromes for partitioning |
| Manacher | **O(n)** | O(n) | When O(n) explicitly required |
| KMP on `s+'#'+rev(s)` | O(n) | O(n) | **Shortest palindrome** by prepending |

---

## Trie Applications

### Autocomplete / Search Suggestions (LeetCode 1268)

Trie + DFS from prefix node. Collect words lexicographically:
- **Top-K:** store a max-heap of size K at each node during insert, or DFS and stop early (words already sorted).
- **All words:** DFS collecting `IsEnd` nodes, return first 3.

### Wildcard Search (`.` matches any character) — LeetCode 211

At a `.` in the query, recurse into **every non-null child**. Worst case O(26^L) but pruned heavily in practice.

```csharp
bool Search(string word, int idx, TrieNode node)
{
    if (idx == word.Length) return node.IsEnd;
    char c = word[idx];
    if (c != '.')
        return node.Children[c - 'a'] != null && Search(word, idx + 1, node.Children[c - 'a']!);
    foreach (var child in node.Children)
        if (child != null && Search(word, idx + 1, child)) return true;
    return false;
}
```

### Word Break (trie-accelerated) — LeetCode 139

Build trie from dictionary. For each DP position `i`, walk the trie from `s[i]` forward; every `IsEnd` hit at `i + len` triggers `dp[i + len] = true`. Avoids re-hashing. Full DP explanation: [Dynamic Programming](../DynamicProgramming/DynamicProgramming.md).

### Maximum XOR — Binary Trie

See **Template 3** above. LeetCode 421.

### IP Routing / Longest Prefix Match

Trie of binary IP prefixes. Walk bit-by-bit; the deepest matching node gives the most-specific route.

### Compressed Trie / Radix Tree

Merge chains of single-child nodes into one edge labelled with a substring. Reduces node count from O(total characters) to O(number of words). Used in routing tables and some lock-free data structures (`ConcurrentDictionary` internals).

---

## KMP — LPS-Only Applications

Beyond substring search, the LPS array alone solves several problems:

| Problem | Key observation |
| ------- | --------------- |
| **Shortest palindrome** (LC 214) | Concatenate `s + '#' + rev(s)`; LPS of the whole string = longest palindromic prefix of `s`; prepend the rest of `rev(s)`. |
| **Repeated substring pattern** (LC 459) | `s` has a repeated period iff `s.Length % (s.Length - lps[m-1]) == 0`. |
| **Longest prefix that is also a suffix** | Directly `lps[m-1]`. |

---

## Aho-Corasick (Conceptual)

**Structure:** trie of all patterns + **failure links** (like KMP's lps, but cross-pattern). Each node's failure link points to the longest proper suffix of the current prefix that is also a prefix of some pattern.

**Search:** walk the text character by character through the trie, following failure links on mismatch. One pass, O(n + matches).

**Use case:** multi-pattern search where patterns are fixed (spam filtering, intrusion detection, DNA motif search). O(Σ|pᵢ| · α) build; O(n + matches) search.

No full implementation needed in an interview — describe the structure and state the complexity.

---

## String Matching Algorithm Comparison

| Algorithm | Preprocessing | Search | Space | **Best for** |
| --------- | ------------- | ------ | ----- | ------------ |
| Naive | O(1) | O(nm) | O(1) | Short text/pattern |
| **KMP** | O(m) | **O(n)** | O(m) | Single pattern, overlapping matches |
| **Z-algorithm** | O(n+m) | O(n+m) | O(n+m) | Prefix-based queries, palindrome tricks |
| **Rabin-Karp** | O(m) | O(n) avg | O(1) | Multi-pattern, duplicate substring |
| **Aho-Corasick** | O(Σ\|pᵢ\|·α) | O(n+matches) | O(Σ\|pᵢ\|·α) | Many patterns simultaneously |
| Boyer-Moore | O(m+α) | O(n/m) best | O(m+α) | Large alphabets, long patterns (rarely needed in interviews) |

---

## Suffix Array + LCP Array (Conceptual)

**Suffix array SA:** sorted array of all suffix start indices of string `s`.
**LCP array:** `LCP[i]` = length of longest common prefix between `SA[i-1]` and `SA[i]` (adjacent sorted suffixes).

**Build:** O(n log n) with prefix-doubling; O(n) with DC3/SA-IS (out of interview scope).

**Use cases:**

| Query | Answer via SA+LCP |
| ----- | ----------------- |
| Longest repeated substring | `max(LCP)` |
| Number of distinct substrings | `n(n+1)/2 - sum(LCP)` |
| Longest common substring of two strings | Concatenate with sentinel; find max LCP spanning both |

> Suffix automaton / suffix tree achieve the same in O(n) time and O(n) space but are significantly more complex to implement — out of scope for most coding interviews. Use suffix array + LCP in contest/interview settings.

---

## Pattern Recognition

| Problem says… | Reach for | Complexity |
| ------------- | --------- | ---------- |
| "autocomplete", "words with prefix" | Trie | O(L) per query |
| "wildcard search with `.`" | Trie + DFS | O(26^L) worst, pruned |
| "find all words from list on board" | Trie + grid DFS | O(M·N·4^L) |
| "maximum XOR of two numbers" | Binary trie | O(32n) |
| "first occurrence of pattern in text" | KMP | O(n + m) |
| "does string have a repeated period" | KMP LPS | O(n) |
| "shortest palindrome by prepending" | KMP on `s+'#'+rev` | O(n) |
| "any of K patterns in text" | Aho-Corasick | O(Σ\|pᵢ\| + n) |
| "duplicate/repeated substring of length L" | Rabin-Karp + binary search | O(n log n) |
| "repeated DNA sequence" | Rolling hash or bitmask | O(n) |
| "longest palindromic substring" | Expand-around-centre | O(n²) / O(1) |
| "count palindromic substrings" | Expand-around-centre | O(n²) / O(1) |
| "longest palindromic subsequence" | DP — see [Dynamic Programming](../DynamicProgramming/DynamicProgramming.md) | O(n²) |
| "palindrome partitioning" | DP `isPalin[i][j]` + backtrack — see [Greedy and Backtracking](../GreedyAndBacktracking/GreedyAndBacktracking.md) | O(n²) |

---

## Pitfalls

- **Assuming lowercase-only alphabet** — using a fixed `TrieNode[26]` array with uppercase, digits, or Unicode causes wrong index or `IndexOutOfRange`. Use `Dictionary<char, TrieNode>` for anything beyond a-z.
- **Forgetting `IsEnd` vs "node exists"** — `Search("app")` must check `IsEnd`; `StartsWith("app")` checks only node ≠ null. Mixing them up is the most common trie bug.
- **Trie memory blow-up with 26-arrays** — 10 000 words of average length 10 = 100 000 nodes × 26 × 8 bytes ≈ 20 MB. Switch to Dictionary children for large inputs.
- **Off-by-one in LPS** — the fallback is `len = lps[len - 1]`, not `len = lps[len]` or `len--`. When `len == 0` and there is a mismatch, set `lps[i] = 0` and advance `i`; do not access `lps[-1]`.
- **Forgetting to verify on a Rabin-Karp hash match** — hash collisions are rare but real. Always confirm with `text.Substring(i, m) == pattern`.
- **`int` overflow in rolling hash** — intermediate products like `hash * Base` can exceed `int.MaxValue`. Declare `hash`, `power`, `Base`, `Mod` as `long`; use `% Mod` after every multiplication.
- **Manacher index conversion** — after finding max radius at position `i` in transformed string `T`, original start = `(i - 1 - P[i]) / 2`, length = `P[i]`. Skipping the `(i - 1)` shift is a common off-by-one.
- **`string.Substring` is O(k) in C#** — in an "O(n)" rolling-hash loop, calling `Substring` on every iteration silently makes it O(n·m). Only call it on hash matches (which should be rare).
- **Not pruning exhausted trie branches in Word Search II** — without setting the word to `null` and removing leaf nodes, you revisit dead branches and TLE on large grids.

---

## Practice

→ See [Problems.md](Problems.md) for full worked solutions.

| # | Problem | Pattern |
| - | ------- | ------- |
| 208 | Implement Trie | Trie construction |
| 211 | Design Add and Search Words | Trie + wildcard DFS |
| 212 | Word Search II | Trie + grid DFS |
| 421 | Maximum XOR of Two Numbers | Binary trie |
| 648 | Replace Words | Trie prefix match |
| 720 | Longest Word in Dictionary | Trie BFS/DFS |
| 1268 | Search Suggestions System | Trie + sorted DFS |
| 28  | Find the Index of the First Occurrence | KMP |
| 459 | Repeated Substring Pattern | KMP LPS |
| 214 | Shortest Palindrome | KMP on `s+'#'+rev` |
| 187 | Repeated DNA Sequences | Rolling hash / bitmask |
| 1044 | Longest Duplicate Substring | Binary search + rolling hash |
| 5   | Longest Palindromic Substring | Expand-around-centre / Manacher |
| 647 | Palindromic Substrings | Expand-around-centre |
