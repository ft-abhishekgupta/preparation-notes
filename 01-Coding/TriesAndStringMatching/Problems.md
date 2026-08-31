# Tries and String Matching — Problems

| # | Problem | LeetCode | Pattern | Difficulty |
| - | ------- | -------- | ------- | ---------- |
| 1 | Implement Trie (Prefix Tree) | 208 | Trie construction | Medium |
| 2 | Design Add and Search Words | 211 | Trie + wildcard DFS | Medium |
| 3 | Word Search II | 212 | Trie + grid DFS | Hard |
| 4 | Replace Words | 648 | Trie prefix match | Medium |
| 5 | Longest Word in Dictionary | 720 | Trie BFS/DFS | Medium |
| 6 | Search Suggestions System | 1268 | Trie + sorted DFS | Medium |
| 7 | Maximum XOR of Two Numbers in an Array | 421 | Binary trie | Medium |
| 8 | Find the Index of the First Occurrence in a String | 28 | KMP | Easy |
| 9 | Repeated Substring Pattern | 459 | KMP LPS trick | Easy |
| 10 | Shortest Palindrome | 214 | KMP on `s+'#'+rev` | Hard |
| 11 | Repeated DNA Sequences | 187 | Rolling hash / bitmask | Medium |
| 12 | Longest Duplicate Substring | 1044 | Binary search + rolling hash | Hard |
| 13 | Longest Palindromic Substring | 5 | Expand-around-centre | Medium |
| 14 | Palindromic Substrings | 647 | Expand-around-centre | Medium |
| 15 | Longest Palindromic Subsequence | 516 | DP (cross-ref) | Medium |
| 16 | Valid Palindrome | 125 | Two pointers (cross-ref) | Easy |
| 17 | Palindrome Partitioning | 131 | DP + backtrack (cross-ref) | Medium |
| 18 | Word Break | 139 | Trie-accelerated DP | Medium |

---

## Trie Construction and Search

### Implement Trie (Prefix Tree) — LeetCode 208

Implement a trie supporting `Insert(word)`, `Search(word)`, and `StartsWith(prefix)`.

**Example:** `Insert("apple")`, `Search("apple")` → `true`; `Search("app")` → `false`; `StartsWith("app")` → `true`

```text
BRUTE FORCE — SORTED LIST | O(n) search | O(n) space

Linear scan all inserted words for Search; scan prefixes for StartsWith.

------------------------------------------------------------------------------

OPTIMAL — TRIE (FIXED-ARRAY CHILDREN) | O(L) per op | O(26 × nodes)

For each character c in the word, index into children[c-'a'].
Create the node if absent. Set IsEnd on last character.
Search: walk + check IsEnd. StartsWith: walk + check node ≠ null.
```

```csharp
public class Trie
{
    private class TrieNode
    {
        public TrieNode?[] Children = new TrieNode[26];
        public bool IsEnd;
    }

    private readonly TrieNode _root = new();

    public void Insert(string word)
    {
        var cur = _root;
        foreach (char c in word)
        {
            int i = c - 'a';
            cur.Children[i] ??= new TrieNode();
            cur = cur.Children[i]!;
        }
        cur.IsEnd = true;
    }

    public bool Search(string word)    => Walk(word)?.IsEnd == true;
    public bool StartsWith(string pre) => Walk(pre) != null;

    private TrieNode? Walk(string s)
    {
        var cur = _root;
        foreach (char c in s)
        {
            cur = cur.Children[c - 'a'];
            if (cur == null) return null;
        }
        return cur;
    }
}
```

> **Key insight:** every trie operation is O(L) regardless of how many words are stored — the depth equals the word length, not the dictionary size.

---

### Design Add and Search Words Data Structure — LeetCode 211

Support `AddWord(word)` and `Search(word)` where `.` in the query matches any single letter.

**Example:** `AddWord("bad")`, `Search(".ad")` → `true`; `Search("b..")` → `true`

```text
BRUTE FORCE — REGEX ON LIST | O(n · L) | O(n · L)

Store all words; regex-match each one. Correct but slow.

------------------------------------------------------------------------------

OPTIMAL — TRIE + DFS ON DOT | O(26^d · L) worst | O(nodes)

Normal trie insert. On search, recurse into ALL non-null children at each '.' position.
Prune immediately when the required child is absent (non-dot mismatch).
```

```csharp
public class WordDictionary
{
    private class TrieNode
    {
        public TrieNode?[] Children = new TrieNode[26];
        public bool IsEnd;
    }

    private readonly TrieNode _root = new();

    public void AddWord(string word)
    {
        var cur = _root;
        foreach (char c in word)
        {
            int i = c - 'a';
            cur.Children[i] ??= new TrieNode();
            cur = cur.Children[i]!;
        }
        cur.IsEnd = true;
    }

    public bool Search(string word) => Dfs(word, 0, _root);

    private bool Dfs(string word, int idx, TrieNode node)
    {
        if (idx == word.Length) return node.IsEnd;
        char c = word[idx];
        if (c != '.')
        {
            var child = node.Children[c - 'a'];
            return child != null && Dfs(word, idx + 1, child);
        }
        foreach (var child in node.Children)
            if (child != null && Dfs(word, idx + 1, child)) return true;
        return false;
    }
}
```

> **Key insight:** a `.` wildcard fans out into all 26 children; the trie prunes dead branches early — far faster than scanning every stored word.

---

## Trie + DFS

### Word Search II — LeetCode 212

Given an m × n character board and a list of words, return all words that can be formed by a path of adjacent cells (no cell reused per word).

**Example:** `board=[["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]]`, `words=["oath","pea","eat","rain"]` → `["oath","eat"]`

```text
BRUTE FORCE — WORD SEARCH PER WORD | O(W · M · N · 4^L) | O(L)

Run DFS backtracking once for every word. Redundant prefix scanning.

------------------------------------------------------------------------------

OPTIMAL — TRIE + SINGLE DFS PASS | O(M · N · 4^L) | O(total chars + M·N)

Build trie from all words, storing the full word at its terminal node.
For every board cell, DFS simultaneously through the board and the trie.
- If the current trie child is null, prune immediately.
- If node.Word != null, record the word and clear it to prevent duplicates.
- Mark board[r][c]='#' before recursing; restore after.
- After collecting a word, prune leaf trie nodes bottom-up to avoid re-visiting.
```

```csharp
public IList<string> FindWords(char[][] board, string[] words)
{
    TrieNode root = BuildTrie(words);
    var result = new List<string>();
    int rows = board.Length, cols = board[0].Length;
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            Dfs(board, r, c, root, result);
    return result;
}

private void Dfs(char[][] board, int r, int c, TrieNode node, List<string> result)
{
    if (r < 0 || r >= board.Length || c < 0 || c >= board[0].Length) return;
    char ch = board[r][c];
    if (ch == '#') return;                          // already visited
    int idx = ch - 'a';
    TrieNode? next = node.Children[idx];
    if (next == null) return;                       // no word with this prefix

    if (next.Word != null) { result.Add(next.Word); next.Word = null; } // collect & dedup

    board[r][c] = '#';
    Dfs(board, r + 1, c, next, result);
    Dfs(board, r - 1, c, next, result);
    Dfs(board, r, c + 1, next, result);
    Dfs(board, r, c - 1, next, result);
    board[r][c] = ch;

    // Prune exhausted leaf nodes to avoid re-traversal
    if (next.IsLeaf()) node.Children[idx] = null;
}

private TrieNode BuildTrie(string[] words)
{
    var root = new TrieNode();
    foreach (string w in words)
    {
        var cur = root;
        foreach (char c in w)
        {
            int i = c - 'a';
            cur.Children[i] ??= new TrieNode();
            cur = cur.Children[i]!;
        }
        cur.Word = w;
    }
    return root;
}

private class TrieNode
{
    public TrieNode?[] Children = new TrieNode[26];
    public string? Word;
    public bool IsLeaf() { foreach (var c in Children) if (c != null) return false; return true; }
}
```

> **Key insight:** building one trie and DFS-ing the board once amortises the prefix matching across all words — pruning kills dead branches before they're explored per word.

---

### Replace Words — LeetCode 648

Given a dictionary of roots and a sentence, replace each word in the sentence with the shortest matching root; if multiple roots match, use the shortest.

**Example:** `dictionary=["cat","bat","rat"]`, `sentence="the cattle was rattled by the battery"` → `"the cat was rat by the bat"`

```text
BRUTE FORCE — SORT + STRING.STARTSWITH | O(W · R · L) | O(W · L)

Sort roots by length. For each word, check all roots.

------------------------------------------------------------------------------

OPTIMAL — TRIE SHORTEST PREFIX | O(total chars in dict + sentence) | O(dict chars)

Insert all roots into a trie.
For each word in the sentence, walk the trie and stop at the first IsEnd node
(shortest root match). Return that prefix; otherwise return the original word.
```

```csharp
public string ReplaceWords(IList<string> dictionary, string sentence)
{
    var root = new TrieNode();
    foreach (string r in dictionary) Insert(root, r);

    string[] words = sentence.Split(' ');
    for (int i = 0; i < words.Length; i++)
        words[i] = ShortestRoot(root, words[i]);
    return string.Join(' ', words);
}

private void Insert(TrieNode root, string word)
{
    var cur = root;
    foreach (char c in word)
    {
        int i = c - 'a';
        cur.Children[i] ??= new TrieNode();
        cur = cur.Children[i]!;
    }
    cur.IsEnd = true;
}

private string ShortestRoot(TrieNode root, string word)
{
    var cur = root;
    for (int i = 0; i < word.Length; i++)
    {
        var next = cur.Children[word[i] - 'a'];
        if (next == null) return word;
        if (next.IsEnd) return word[..(i + 1)];
        cur = next;
    }
    return word;
}

private class TrieNode { public TrieNode?[] Children = new TrieNode[26]; public bool IsEnd; }
```

> **Key insight:** trie naturally finds the *shortest* root — the first `IsEnd` encountered as you walk deeper is guaranteed to be the minimum-length match.

---

### Longest Word in Dictionary — LeetCode 720

Given an array of strings, find the longest word that can be built one character at a time by other words in the array. Tie-break: lexicographically smallest.

**Example:** `words=["w","wo","wor","worl","world"]` → `"world"`

```text
BRUTE FORCE — SORT + SET | O(n · L · log n) | O(n · L)

Sort words by length then lex. Track a set of "buildable" words; a word is buildable
iff its prefix (word[0..L-2]) is already in the set.

------------------------------------------------------------------------------

OPTIMAL — TRIE BFS/DFS | O(n · L) | O(n · L)

Insert all words. BFS/DFS from root: a node is reachable only if its parent IsEnd.
The deepest reachable node gives the answer; track lex order.
```

```csharp
public string LongestWord(string[] words)
{
    var root = new TrieNode();
    foreach (string w in words)
    {
        var cur = root;
        foreach (char c in w)
        {
            int i = c - 'a';
            cur.Children[i] ??= new TrieNode();
            cur = cur.Children[i]!;
        }
        cur.Word = w;
    }

    string result = "";
    // DFS — only descend into a node if it marks a complete word
    var stack = new Stack<(TrieNode node, string path)>();
    for (int i = 0; i < 26; i++)
        if (root.Children[i]?.Word != null)
            stack.Push((root.Children[i]!, root.Children[i]!.Word!));

    while (stack.Count > 0)
    {
        var (node, path) = stack.Pop();
        if (path.Length > result.Length ||
            (path.Length == result.Length && string.Compare(path, result) < 0))
            result = path;
        for (int i = 0; i < 26; i++)
            if (node.Children[i]?.Word != null)
                stack.Push((node.Children[i]!, node.Children[i]!.Word!));
    }
    return result;
}

private class TrieNode { public TrieNode?[] Children = new TrieNode[26]; public string? Word; }
```

> **Key insight:** only descend through nodes that have `IsEnd` set — this enforces that every prefix of the candidate word also exists in the dictionary.

---

### Search Suggestions System — LeetCode 1268

Given a list of products and a search word typed one character at a time, return the top 3 lexicographically smallest products with each prefix.

**Example:** `products=["mobile","mouse","moneypot","monitor","mousepad"]`, `searchWord="mouse"` → `[["mobile","moneypot","monitor"],["mobile","moneypot","monitor"],["mouse","mousepad"],["mouse","mousepad"],["mouse","mousepad"]]`

```text
BRUTE FORCE | O(n · L · W) | O(1)

For each prefix, scan all products and filter+sort.

------------------------------------------------------------------------------

BINARY SEARCH ON SORTED ARRAY | O(n log n + L · log n) | O(1)

Sort products. For each prefix, binary-search the lower bound, then take at most 3
consecutive products that still start with the prefix.

------------------------------------------------------------------------------

OPTIMAL — TRIE + SORTED INSERT | O(n · L) build + O(L) per query | O(n · L)

Insert products in sorted order. At each node, maintain a list of up to 3 words
(trimmed during insert). Query: walk trie for each prefix character; return node's list.
```

```csharp
public IList<IList<string>> SuggestedProducts(string[] products, string searchWord)
{
    Array.Sort(products, StringComparer.Ordinal);
    var root = new SNode();
    foreach (string p in products) Insert(root, p);

    var result = new List<IList<string>>();
    var cur = root;
    foreach (char c in searchWord)
    {
        int i = c - 'a';
        cur = cur?.Children[i]!;    // null if no match
        result.Add(cur?.Suggestions ?? new List<string>());
    }
    return result;
}

private void Insert(SNode root, string word)
{
    var cur = root;
    foreach (char c in word)
    {
        int i = c - 'a';
        cur.Children[i] ??= new SNode();
        cur = cur.Children[i]!;
        if (cur.Suggestions.Count < 3) cur.Suggestions.Add(word);
    }
}

private class SNode
{
    public SNode?[] Children = new SNode[26];
    public List<string> Suggestions = new();
}
```

> **Key insight:** inserting products in sorted order means the per-node suggestion list is naturally the top-3 lexicographically — no heap or post-sort needed.

---

## Binary Trie (XOR)

### Maximum XOR of Two Numbers in an Array — LeetCode 421

Given an integer array, find the maximum XOR of any two elements.

**Example:** `nums=[3,10,5,25,2,8]` → `28` (5 XOR 25)

```text
BRUTE FORCE | O(n²) | O(1)

Try all pairs; track max XOR.

------------------------------------------------------------------------------

OPTIMAL — BINARY TRIE | O(32 · n) | O(32 · n)

Insert all numbers bit-by-bit from MSB (bit 31) into a trie where each node has
children[0] and children[1].
For each number x, query the trie: greedily choose the child whose bit DIFFERS
from x's current bit (maximising that bit's XOR contribution).
```

```csharp
public int FindMaximumXOR(int[] nums)
{
    var root = new BitNode();
    foreach (int n in nums) Insert(root, n);

    int max = 0;
    foreach (int n in nums) max = Math.Max(max, Query(root, n));
    return max;
}

private void Insert(BitNode root, int num)
{
    var cur = root;
    for (int b = 31; b >= 0; b--)
    {
        int bit = (num >> b) & 1;
        cur.C[bit] ??= new BitNode();
        cur = cur.C[bit]!;
    }
}

private int Query(BitNode root, int num)
{
    var cur = root;
    int result = 0;
    for (int b = 31; b >= 0; b--)
    {
        int bit = (num >> b) & 1;
        int want = 1 - bit;
        if (cur.C[want] != null) { result |= (1 << b); cur = cur.C[want]!; }
        else if (cur.C[bit] != null) { cur = cur.C[bit]!; }
        else break;
    }
    return result;
}

private class BitNode { public BitNode?[] C = new BitNode[2]; }
```

> **Key insight:** XOR is maximised bit-by-bit from the MSB — a binary trie lets you greedily choose the opposite bit at each level in O(32) per query.

---

## Pattern Matching (KMP / Z)

### Find the Index of the First Occurrence in a String — LeetCode 28

Given `haystack` and `needle`, return the index of the first occurrence of `needle` in `haystack`, or -1.

**Example:** `haystack="sadbutsad"`, `needle="sad"` → `0`

```text
BRUTE FORCE | O(n · m) | O(1)

Slide a window of length m across haystack; compare character by character.

------------------------------------------------------------------------------

RABIN-KARP | O(n + m) avg, O(nm) worst | O(1)

Rolling hash; verify on collision.

------------------------------------------------------------------------------

OPTIMAL — KMP | O(n + m) | O(m)

Build LPS array of needle. Two pointers i (haystack), j (needle).
On match advance both. On full match record i-j, fall back j=lps[j-1].
On mismatch fall back j=lps[j-1]; if j=0 advance i.
```

```csharp
public int StrStr(string haystack, string needle)
{
    if (needle.Length == 0) return 0;
    int[] lps = BuildLPS(needle);
    int i = 0, j = 0;
    while (i < haystack.Length)
    {
        if (haystack[i] == needle[j]) { i++; j++; }
        if (j == needle.Length) return i - j;
        else if (i < haystack.Length && haystack[i] != needle[j])
        {
            if (j > 0) j = lps[j - 1];
            else i++;
        }
    }
    return -1;
}

private int[] BuildLPS(string p)
{
    int m = p.Length;
    var lps = new int[m];
    int len = 0, i = 1;
    while (i < m)
    {
        if (p[i] == p[len])     { lps[i++] = ++len; }
        else if (len > 0)       { len = lps[len - 1]; }
        else                    { lps[i++] = 0; }
    }
    return lps;
}
```

> **Key insight:** KMP never moves `i` backward — the LPS array encodes all possible "restart positions" so each character is visited at most twice total.

---

### Repeated Substring Pattern — LeetCode 459

Determine if a string can be constructed by repeating a substring of itself.

**Example:** `s="abcabc"` → `true` (period `"abc"`); `s="aba"` → `false`

```text
BRUTE FORCE | O(n²) | O(n)

Try every divisor d of n as period length; check if s[0..d-1] repeated n/d times equals s.

------------------------------------------------------------------------------

CONCATENATION TRICK | O(n) | O(n)

s has a repeated period iff s appears in (s+s)[1..2n-2].
Equivalent to the KMP LPS trick below but uses built-in search.

------------------------------------------------------------------------------

OPTIMAL — KMP LPS | O(n) | O(n)

Build LPS of s. The period length = n - lps[n-1].
s has a repeated pattern iff lps[n-1] > 0 AND n % (n - lps[n-1]) == 0.
```

```csharp
public bool RepeatedSubstringPattern(string s)
{
    int n = s.Length;
    int[] lps = BuildLPS(s);
    int period = n - lps[n - 1];
    return lps[n - 1] > 0 && n % period == 0;
}

private int[] BuildLPS(string p)
{
    int m = p.Length;
    var lps = new int[m];
    int len = 0, i = 1;
    while (i < m)
    {
        if (p[i] == p[len])     { lps[i++] = ++len; }
        else if (len > 0)       { len = lps[len - 1]; }
        else                    { lps[i++] = 0; }
    }
    return lps;
}
```

> **Key insight:** `lps[n-1]` tells you the length of the longest prefix that is also a suffix; if the remainder `n - lps[n-1]` divides `n` evenly, that remainder is the minimal period.

---

### Shortest Palindrome — LeetCode 214

Given string `s`, add the minimum number of characters to the *front* to make it a palindrome.

**Example:** `s="aacecaaa"` → `"aaacecaaa"`; `s="abcd"` → `"dcbabcd"`

```text
BRUTE FORCE | O(n²) | O(n)

Try every suffix of reverse(s) as a prefix to prepend; check each.

------------------------------------------------------------------------------

OPTIMAL — KMP ON s+'#'+rev(s) | O(n) | O(n)

The longest palindromic prefix of s has length = lps[2n] of the combined string.
Characters beyond that prefix in rev(s) must be prepended to s.

Concatenate t = s + '#' + reverse(s). Build LPS of t.
lps[t.Length - 1] = length of the longest palindromic prefix of s.
Answer: reverse(s[lps..]) + s.
```

```csharp
public string ShortestPalindrome(string s)
{
    string rev = new string(s.Reverse().ToArray());
    string t = s + '#' + rev;
    int[] lps = BuildLPS(t);
    int palindromicPrefixLen = lps[^1];
    return rev[..( s.Length - palindromicPrefixLen)] + s;
}

private int[] BuildLPS(string p)
{
    int m = p.Length;
    var lps = new int[m];
    int len = 0, i = 1;
    while (i < m)
    {
        if (p[i] == p[len])     { lps[i++] = ++len; }
        else if (len > 0)       { len = lps[len - 1]; }
        else                    { lps[i++] = 0; }
    }
    return lps;
}
```

> **Key insight:** `s + '#' + rev(s)` encodes the answer in one LPS query — the `#` sentinel prevents a match from spanning the two halves, ensuring the prefix found is entirely within `s`.

---

## Rolling Hash

### Repeated DNA Sequences — LeetCode 187

Find all 10-letter substrings of a DNA string that appear more than once.

**Example:** `s="AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT"` → `["AAAAACCCCC","CCCCCAAAAA"]`

```text
BRUTE FORCE | O(n · L) | O(n · L)

HashSet of every 10-char substring (string hashing implicit).

------------------------------------------------------------------------------

BIT ENCODING | O(n) | O(n)

Encode each base as 2 bits (A=0,C=1,G=2,T=3). Maintain a 20-bit rolling integer
for the window. Use a HashSet<int> for seen windows and a HashSet<int> for duplicates.

------------------------------------------------------------------------------

OPTIMAL — ROLLING HASH | O(n) | O(n)

Same idea but explicit: base-4 rolling hash of width 10, collect duplicates.
Bit encoding is cleaner and avoids mod — use that in an interview.
```

```csharp
public IList<string> FindRepeatedDnaSequences(string s)
{
    if (s.Length <= 10) return new List<string>();
    var map = new Dictionary<char, int> { ['A'] = 0, ['C'] = 1, ['G'] = 2, ['T'] = 3 };
    var seen   = new HashSet<int>();
    var result = new HashSet<string>();
    int window = 0, mask = (1 << 20) - 1;

    for (int i = 0; i < s.Length; i++)
    {
        window = ((window << 2) | map[s[i]]) & mask;
        if (i < 9) continue;
        if (!seen.Add(window)) result.Add(s.Substring(i - 9, 10));
    }
    return result.ToList();
}
```

> **Key insight:** encoding 4 bases as 2 bits packs a 10-mer into 20 bits — an `int` — so the "hash" is collision-free and the entire approach is O(n) with O(1) per step.

---

### Longest Duplicate Substring — LeetCode 1044

Find the longest substring that appears at least twice (substrings can overlap). Return `""` if none.

**Example:** `s="banana"` → `"ana"`

```text
BRUTE FORCE | O(n²) | O(n²)

Build suffix array or check all pairs of substrings.

------------------------------------------------------------------------------

OPTIMAL — BINARY SEARCH + ROLLING HASH | O(n log n) | O(n)

Binary search on the length L of the duplicate substring (range [1, n-1]).
For a given L, use Rabin-Karp to check if any length-L window hash repeats.
Use double hashing to virtually eliminate false positives.
```

```csharp
public string LongestDupSubstring(string s)
{
    int lo = 1, hi = s.Length - 1, start = -1, bestLen = 0;
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2;
        int idx = Search(s, mid);
        if (idx >= 0) { start = idx; bestLen = mid; lo = mid + 1; }
        else          { hi = mid - 1; }
    }
    return start < 0 ? "" : s.Substring(start, bestLen);
}

private int Search(string s, int len)
{
    const long Base = 31, Mod = 1_000_000_007;
    long power = 1;
    for (int i = 0; i < len - 1; i++) power = power * Base % Mod;

    long h = 0;
    for (int i = 0; i < len; i++) h = (h * Base + (s[i] - 'a' + 1)) % Mod;

    var seen = new Dictionary<long, List<int>>();
    seen[h] = new List<int> { 0 };

    for (int i = 1; i <= s.Length - len; i++)
    {
        h = (h - (s[i - 1] - 'a' + 1) * power % Mod + Mod) % Mod;
        h = (h * Base + (s[i + len - 1] - 'a' + 1)) % Mod;
        if (seen.TryGetValue(h, out var starts))
        {
            // Verify to avoid hash collisions
            foreach (int prev in starts)
                if (s.AsSpan(prev, len).SequenceEqual(s.AsSpan(i, len))) return i;
        }
        if (!seen.ContainsKey(h)) seen[h] = new List<int>();
        seen[h].Add(i);
    }
    return -1;
}
```

> **Key insight:** binary search on length reduces the problem to O(log n) hash checks, each O(n) — the rolling hash makes each check O(n) instead of O(n²).

---

## Palindromes

### Longest Palindromic Substring — LeetCode 5

Find the longest substring of `s` that is a palindrome.

**Example:** `s="babad"` → `"bab"` (or `"aba"`); `s="cbbd"` → `"bb"`

```text
BRUTE FORCE | O(n³) | O(1)

Check every O(n²) substring for palindrome in O(n).

------------------------------------------------------------------------------

DP TABLE | O(n²) | O(n²)

isPalin[i][j] = (s[i]==s[j]) && isPalin[i+1][j-1].
Fill diagonally. Track max length.

------------------------------------------------------------------------------

EXPAND-AROUND-CENTRE | O(n²) | O(1)

For each centre (n odd centres + n-1 even centres), expand outward while characters match.
Standard interview approach — no extra space, very simple to code.

------------------------------------------------------------------------------

OPTIMAL — MANACHER | O(n) | O(n)

Transform s to T = "^#a#b#…#$". Maintain rightmost palindrome boundary [C, R].
For each i: P[i] ≥ min(R-i, P[mirror]) then expand. Return longest.
Use expand-around-centre in an interview unless O(n) is required.
```

```csharp
// Expand-around-centre — standard interview solution
public string LongestPalindrome(string s)
{
    int start = 0, maxLen = 1;
    for (int i = 0; i < s.Length; i++)
    {
        int l1 = ExpandLen(s, i, i);       // odd
        int l2 = ExpandLen(s, i, i + 1);   // even
        int best = Math.Max(l1, l2);
        if (best > maxLen)
        {
            maxLen = best;
            start  = i - (best - 1) / 2;
        }
    }
    return s.Substring(start, maxLen);
}

private int ExpandLen(string s, int lo, int hi)
{
    while (lo >= 0 && hi < s.Length && s[lo] == s[hi]) { lo--; hi++; }
    return hi - lo - 1;
}
```

> **Key insight:** every palindrome has a centre — iterating over all O(n) centres and expanding gives O(n²) with O(1) space, which is almost always fast enough.

_Cross-reference: palindrome techniques comparison table → [TriesAndStringMatching.md](TriesAndStringMatching.md)_

---

### Palindromic Substrings — LeetCode 647

Count all palindromic substrings of `s`.

**Example:** `s="abc"` → `3` (a, b, c); `s="aaa"` → `6`

```text
BRUTE FORCE | O(n³) | O(1)

Check all O(n²) substrings.

------------------------------------------------------------------------------

OPTIMAL — EXPAND-AROUND-CENTRE | O(n²) | O(1)

For each centre (odd and even), count expansions while s[lo]==s[hi].
Each successful expansion is one palindrome.
```

```csharp
public int CountSubstrings(string s)
{
    int count = 0;
    for (int i = 0; i < s.Length; i++)
    {
        count += CountExpansions(s, i, i);       // odd
        count += CountExpansions(s, i, i + 1);   // even
    }
    return count;
}

private int CountExpansions(string s, int lo, int hi)
{
    int count = 0;
    while (lo >= 0 && hi < s.Length && s[lo--] == s[hi++]) count++;
    return count;
}
```

> **Key insight:** expanding from each centre is the simplest O(n²) palindrome algorithm — each expansion step either succeeds (increment count) or fails (stop).

---

### Longest Palindromic Subsequence — LeetCode 516

Find the length of the longest palindromic subsequence in `s`.

**Example:** `s="bbbab"` → `4` (`"bbbb"`)

This is a DP problem (interval DP). Full treatment: [Dynamic Programming](../DynamicProgramming/Problems.md).

> **Key insight:** `dp[i][j] = dp[i+1][j-1] + 2` if `s[i]==s[j]`, else `max(dp[i+1][j], dp[i][j-1])`.

---

### Valid Palindrome — LeetCode 125

Check if a string is a palindrome considering only alphanumeric characters.

Full treatment (two-pointer idiom): [Two Pointers](../TwoPointers/Problems.md).

> **Key insight:** use `char.IsLetterOrDigit` to skip non-alphanumeric, then compare `char.ToLower` from both ends.

---

### Palindrome Partitioning — LeetCode 131

Partition `s` so that every substring is a palindrome. Return all partitions.

Full treatment (backtracking + `isPalin[i][j]` DP precompute): [Greedy and Backtracking](../GreedyAndBacktracking/Problems.md).

> **Key insight:** precompute `isPalin[i][j]` in O(n²); then each backtracking cut is O(1) instead of O(n).

---

### Word Break — LeetCode 139

Given a string `s` and a dictionary, determine if `s` can be segmented into dictionary words.

Full DP treatment: [Dynamic Programming](../DynamicProgramming/Problems.md).

**Trie-accelerated variant:** build a trie from the dictionary. For each DP state `i`, walk the trie forward from `s[i]`; each `IsEnd` hit at `i + len` sets `dp[i + len] = true`. Avoids re-hashing dictionary words on every query.

```csharp
public bool WordBreak(string s, IList<string> wordDict)
{
    // Build trie
    var root = new TrieNode();
    foreach (string w in wordDict)
    {
        var cur = root;
        foreach (char c in w) { int i = c - 'a'; cur.Children[i] ??= new TrieNode(); cur = cur.Children[i]!; }
        cur.IsEnd = true;
    }

    int n = s.Length;
    bool[] dp = new bool[n + 1];
    dp[0] = true;
    for (int i = 0; i < n; i++)
    {
        if (!dp[i]) continue;
        var cur = root;
        for (int j = i; j < n; j++)
        {
            cur = cur.Children[s[j] - 'a'];
            if (cur == null) break;
            if (cur.IsEnd) dp[j + 1] = true;
        }
    }
    return dp[n];
}

private class TrieNode { public TrieNode?[] Children = new TrieNode[26]; public bool IsEnd; }
```

> **Key insight:** the trie walk from each DP position replaces a hash-lookup-per-word inner loop and naturally prunes when no dictionary word shares the current prefix.
