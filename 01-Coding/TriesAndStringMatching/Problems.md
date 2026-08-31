# Tries and String Matching — Problems

## Implement Trie (Prefix Tree)

Implement a trie supporting `insert(word)`, `search(word)`, and `startsWith(prefix)`.

**Example:** `insert("apple"), search("apple")` → `true`; `search("app")` → `false`; `startsWith("app")` → `true`

```text
TRIE | O(L) per operation | O(total characters)

Node:
    children = map or array of size 26
    isEndOfWord = false

INSERT(word):
    node = root
    for each character c in word:
        if node.children[c] does not exist:
            node.children[c] = new Node()
        node = node.children[c]
    node.isEndOfWord = true

FIND(prefix):
    node = root
    for each character c in prefix:
        if node.children[c] does not exist:
            return null
        node = node.children[c]
    return node

SEARCH(word):
    node = FIND(word)
    return node is not null AND node.isEndOfWord

STARTS_WITH(prefix):
    return FIND(prefix) is not null
```

> - Wildcard search (`.` matches any character) branches into every child at that position.
> - A trie also solves longest common prefix, autocomplete, and maximum XOR pair (using a binary trie of bits).

## Word Search II

Given an m × n board of characters and a list of words, return all words from the list that can be constructed from sequentially adjacent cells, where each cell may be used at most once per word.

**Example:** `board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]` → `["oath","eat"]`

```text
REPEATED WORD SEARCH | O(W * M * N * 4^L) | O(L)

Run the Word Search backtracking once per word

------------------------------------------------------------------------------

TRIE + BACKTRACKING | O(M * N * 4^L) | O(total characters)

// Build a trie of all words and walk the board and the trie together
// A branch is abandoned as soon as the prefix is not in the trie

FIND_WORDS(board, words):
    build trie from words
    store the full word on the node where it ends
    result = []
    for every cell (r, c):
        BACKTRACK(r, c, root)
    return result

BACKTRACK(r, c, node):
    if outside grid:
        return
    letter = board[r][c]
    if letter == '#' OR node.children[letter] does not exist:
        return
    next = node.children[letter]
    if next.word is not null:
        result.add(next.word)
        next.word = null          // Avoid duplicates
    board[r][c] = '#'             // Mark visited
    BACKTRACK(r + 1, c, next)
    BACKTRACK(r - 1, c, next)
    BACKTRACK(r, c + 1, next)
    BACKTRACK(r, c - 1, next)
    board[r][c] = letter          // Undo
    if next has no children:
        remove next from node      // Prune exhausted branches
```

## First occurrence in a string

Given two strings `haystack` and `needle`, return the index of the first occurrence of `needle` in `haystack`, or -1 if `needle` is not part of `haystack`.

**Example:** `haystack = "sadbutsad", needle = "sad"` → `0`

```text
BRUTE FORCE | O(N * M) | O(1)

Check every substring of haystack with length equal to needle and see if it matches needle

-----------------------------------------------------------------------------

RABIN-KARP | O(N + M) Average O(N * M) Worst Case | O(1)

// Calculate hash of needle and every substring of haystack with length equal to needle, and compare hashes. If hashes match, compare the actual strings to avoid false positives.

if needle is empty
    return 0
m = length(needle)
n = length(haystack)
calculate hash of needle
calculate hash of first m characters of haystack
for i = 0 to n - m
    if windowHash == needleHash
        verify characters directly
        if equal
            return i
    roll hash to next window
return -1

-----------------------------------------------------------------------------

KMP | O(N + M) | O(M)

// Preprocess needle to create a longest prefix-suffix (LPS) array, then use it to skip characters in haystack when a mismatch occurs
// LPS : Longest Prefix Suffix array, where lps[i] is the length of the longest proper prefix which is also a suffix for needle[0..i]
// Example: For needle = "ABABC", lps = [0, 0, 1, 2, 0]
// Haystack pointer moves forward by 1 on mismatch, but needle pointer moves back to lps[needlePointer - 1] instead of 0

buildLPS(pattern)    // O(M)
    create lps[m]
    lps[0] = 0
    length = 0
    i = 1
    while i < m
        if pattern[i] == pattern[length]
            length++
            lps[i] = length
            i++
        else
            if length != 0
                length = lps[length - 1]
            else
                lps[i] = 0
                i++
    return lps

search(haystack, needle)    // O(N)
    if needle is empty
        return 0
    if length(needle) > length(haystack)
        return -1
    lps = buildLPS(needle)
    i = 0
    j = 0
    while i < length(haystack)
        if haystack[i] == needle[j]
            i++
            j++
            if j == length(needle)
                return i - j
        else
            if j != 0
                j = lps[j - 1]
            else
                i++
    return -1

-----------------------------------------------------------------------------

Z ALGORITHM | O(N + M) | O(N + M)

// Preprocess the concatenated string "needle$haystack" to create a Z-array, which indicates the length of the longest substring starting from each position that matches the prefix of the concatenated string. If any value in the Z-array equals the length of needle, it indicates a match.

-----------------------------------------------------------------------------

BOYER-MOORE | O(N + M) Average O(N * M) Worst Case | O(M)

// Preprocess needle to create bad character and good suffix tables, then use them to skip sections of haystack when a mismatch occurs. This is efficient for large alphabets and long patterns.
```
