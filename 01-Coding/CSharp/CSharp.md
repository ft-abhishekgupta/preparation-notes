# C# Interview Cheat Sheet

> Language reference — answers "how do I write X in C#?" in under 5 seconds.
> For algorithms see the linked topic files. This file **owns** the C# collection complexity table.

## Table of Contents

| Section | Section |
| ------- | ------- |
| [Boilerplate & Templates](#boilerplate--templates) | [Collections — Detail](#collections--detail) |
| [Primitives & Numeric Traps](#primitives--numeric-traps) | [LINQ](#linq) |
| [Casting & Parsing](#casting--parsing) | [Modern C# Syntax](#modern-c-syntax) |
| [Control Flow](#control-flow) | [Custom Comparers & Sorting](#custom-comparers--sorting) |
| [Tuples & Lambdas](#tuples--lambdas) | [Graph Representation](#graph-representation) |
| [Classes & Structs](#classes--structs) | [C# vs Java / Python](#c-vs-java--python) |
| [Arrays](#arrays) | [Reference Tables](#reference-tables) |
| [Strings & StringBuilder](#strings--stringbuilder) | [Collection Complexity Table](#collection-complexity-table) |

---

## Boilerplate & Templates

### Standard competitive-programming imports

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
```

### LeetCode — method-only (most common)

```csharp
public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        var map = new Dictionary<int, int>();
        for (int i = 0; i < nums.Length; i++) {
            int need = target - nums[i];
            if (map.TryGetValue(need, out int j)) return [i, j];
            map[nums[i]] = i;
        }
        return [];
    }

    // DFS helper as a local function — captures outer variables, no extra class field needed
    void Dfs(int node, bool[] visited, List<int>[] graph) {
        visited[node] = true;
        foreach (int nei in graph[node])
            if (!visited[nei]) Dfs(nei, visited, graph);
    }
}
```

### Non-LeetCode judge — fast console I/O

```csharp
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

class Program {
    static void Main() {
        // Fast I/O — essential for large input on Codeforces / AtCoder
        var cin  = new StreamReader(Console.OpenStandardInput());
        var cout = new StreamWriter(Console.OpenStandardOutput()) { AutoFlush = false };
        Console.SetIn(cin); Console.SetOut(cout);

        int n = int.Parse(Console.ReadLine()!);
        int[] a = Console.ReadLine()!.Split(' ').Select(int.Parse).ToArray();
        Console.WriteLine(a.Sum());
        cout.Flush();
    }
}
```

---

## Primitives & Numeric Traps

```csharp
int    i = 0;       // 32-bit   -2,147,483,648 .. 2,147,483,647  (~2.1e9)
long   l = 0L;      // 64-bit   ±9,223,372,036,854,775,807        (~9.2e18)
double d = 0.0;     // 64-bit IEEE 754, ~15–17 significant digits
decimal m = 0m;     // 128-bit, exact for base-10 fractions (slow — avoid in hot loops)
char   c = 'a';     // 16-bit UTF-16
bool   b = true;
var    x = 5;       // inferred at compile-time — still statically typed
```

### Limits

```csharp
int.MinValue   // -2_147_483_648
int.MaxValue   //  2_147_483_647
long.MinValue  // -9_223_372_036_854_775_808
long.MaxValue  //  9_223_372_036_854_775_807
```

### Numeric traps

```csharp
// 1. Silent overflow — use long when products/sums can exceed ~2e9
long bad  = 100_000 * 100_000;           // overflows: int * int = int (-1794967296)
long good = 100_000L * 100_000;          // cast one operand first

// 2. Integer division truncates toward zero
int q = 7 / 2;    // 3, not 3.5
int r = -7 % 3;   // -1 in C# (sign follows dividend) — DIFFERENT from Python (+2)
// Fix for always-positive modulo:
int pos = ((a % n) + n) % n;

// 3. Math.Abs(int.MinValue) throws OverflowException — it has no positive counterpart
// 4. Ceiling division for positive a, b:
int ceil = (a + b - 1) / b;
// 5. checked{} turns silent overflow into an exception (useful for debugging)
checked { int x2 = int.MaxValue + 1; }   // throws OverflowException
```

---

## Casting & Parsing

```csharp
int    x = (int)3.9;                    // 3 — truncates toward zero
long   y = (long)i * i;                 // cast BEFORE multiplying to avoid int overflow
int    n = int.Parse("42");             // throws FormatException on bad input
bool  ok = int.TryParse(s, out int v);  // preferred: returns false, never throws
string s = n.ToString();
double d = double.Parse("3.14");

int  digit = c - '0';                   // '7' → 7
char back  = (char)(digit + '0');       // 7 → '7'
int  idx   = c - 'a';                   // 'c' → 2  (lowercase letter → 0-based index)
```

---

## Control Flow

```csharp
if (cond) { } else if (cond2) { } else { }
var x = cond ? a : b;                   // ternary

// Switch statement
switch (x) { case 1: ...; break; default: ...; break; }

// Switch expression (returns a value)
var label = x switch {
    1     => "one",
    2     => "two",
    < 0   => "negative",            // relational pattern
    _     => "other"
};

// Pattern matching
if (obj is int n && n > 0) { }          // type + condition in one expression
if (obj is { Length: > 0 } str) { }    // property pattern
if (n is > 0 and < 100) { }            // and / or combinators (C# 9+)

for (int i = 0; i < n; i++) { }
for (int i = n - 1; i >= 0; i--) { }
foreach (var x2 in list) { }           // never add/remove during iteration
while (cond) { }
do { } while (cond);
break; continue;
```

---

## Tuples & Lambdas

```csharp
(int, int) p = (2, 5);
p.Item1;                                // unnamed access

var t = (x: 5, y: 10);                  // named fields — preferred
t.x;

var (mn, mx) = MinMax(arr);             // deconstruct to separate vars
(a, b) = (b, a);                        // swap — no temp variable needed

// Methods
static int    Add(int a, int b) => a + b;                       // expression-bodied
static void   Swap(ref int a, ref int b) { (a, b) = (b, a); }  // ref: mutates caller
static bool   Try(out int r) { r = 5; return true; }           // out: must set before return
static (int, int) MinMax(int[] a) => (a.Min(), a.Max());        // tuple return

// Lambdas
Func<int, int>      square = x => x * x;
Comparison<int>     desc   = (x, y) => y.CompareTo(x);
Action<string>      print  = s => Console.WriteLine(s);
Predicate<int>      pos    = n => n > 0;
```

---

## Classes & Structs

```csharp
class Node {                    // reference type — assignment copies the reference
    public int Val;
    public Node? Next;
    public Node(int v) { Val = v; }
}

struct Point {                  // value type — assignment copies the whole struct
    public int X, Y;
    public Point(int x, int y) { X = x; Y = y; }
}

record Point2(int X, int Y);   // immutable, value-equality by default (C# 9+)
```

---

## Arrays

### Create & initialise

```csharp
int[] a = new int[n];               // all zeros
int[] b = { 1, 2, 3 };
int[] c = [1, 2, 3];                // collection expression (C# 12+)
int[] d = new int[n];
Array.Fill(d, -1);                  // fill with a value
int[] e = Enumerable.Repeat(-1, n).ToArray();   // alternative

int len = a.Length;                 // arrays → Length; collections → Count
```

### Common operations

```csharp
Array.Sort(a);                                      // in-place ascending (IntroSort)
Array.Sort(a, (x, y) => y.CompareTo(x));            // descending — CompareTo avoids `y-x` overflow
Array.Sort(keys, values);                           // sort two arrays together by keys
Array.Reverse(a);
Array.Fill(a, -1);
int idx = Array.IndexOf(a, 5);                      // linear scan, -1 if not found
int bs  = Array.BinarySearch(a, 5);                 // MUST be sorted; bs < 0 → ~bs = insertion point

int[] copy = new int[a.Length];
Array.Copy(a, copy, a.Length);                      // copy into existing array
int[] clone = (int[])a.Clone();                     // new shallow-copy array
```

### Ranges & index-from-end

```csharp
int last  = a[^1];          // last element
int[] tail   = a[2..];      // index 2 to end (copies)
int[] head3  = a[..3];      // indices 0, 1, 2
int[] middle = a[1..^1];    // drop first and last
```

### 2D: rectangular vs jagged

```csharp
// Rectangular int[,] — single allocation, O(1) access, but LINQ won't work on rows
int[,] grid = new int[rows, cols];
grid[i, j] = 1;
int r = grid.GetLength(0), c2 = grid.GetLength(1);

// Jagged int[][] — rows are independent arrays; LINQ works, rows can be sorted/reversed
int[][] jag = new int[rows][];
for (int i = 0; i < rows; i++) jag[i] = new int[cols];   // each row needs its own allocation
jag[i][j] = 1;
int nRows = jag.Length, nCols = jag[0].Length;

Array.Sort(jag[i]);                    // sort one row
Array.Reverse(jag[i]);                 // reverse one row
```

> **Prefer jagged `int[][]` in interviews.** LINQ works on each row, and you can sort/reverse individual rows independently. Use `int[,]` only when the judge or problem explicitly passes a rectangular matrix.

---

## Strings & StringBuilder

### Immutability trap

```csharp
// BAD — O(n²): each += allocates a new string
string s = "";
for (int i = 0; i < n; i++) s += arr[i];   // avoid

// GOOD — O(n) amortised
var sb = new StringBuilder();
for (int i = 0; i < n; i++) sb.Append(arr[i]);
string result = sb.ToString();
```

### String operations

```csharp
string s = "hello";
int len = s.Length;
char c = s[0];                              // read-only index — s[0]='x' won't compile
string sub = s.Substring(1, 3);            // (startIndex, length) → "ell"  O(k)
bool has = s.Contains("ell");
int  idx = s.IndexOf('l');                  // first match; -1 if not found
int  last = s.LastIndexOf('l');
bool sw = s.StartsWith("he"), ew = s.EndsWith("lo");
string rep = s.Replace("l", "L");
string up = s.ToUpper(), lo2 = s.ToLower();
string trimmed = s.Trim();
string[] parts = s.Split(',');
string[] parts2 = s.Split(',', StringSplitOptions.RemoveEmptyEntries);  // drop blanks
string joined = string.Join(",", parts);
string cat = string.Concat("a", "b", "c");
string rev2 = new string(s.Reverse().ToArray());    // LINQ Reverse on IEnumerable<char>
char[] arr2 = s.ToCharArray();              // mutable copy
string fromArr = new string(arr2);

// Comparison
bool eq  = s == t;                          // value equality — NOT reference (unlike Java!)
bool eqi = string.Equals(s, t, StringComparison.OrdinalIgnoreCase);
int  lex = string.Compare(s, t, StringComparison.Ordinal);   // <0, 0, >0
```

> **Trap:** `string.Compare` is culture-sensitive by default — sort order can surprise you with accented characters. Always pass `StringComparison.Ordinal` for consistent byte-level ordering in interviews.

> **Java/Python note:** in C#, `s == t` compares contents (value equality), not references. You never need `.Equals()` just for equality — but `Equals` with `StringComparison` is needed for case-insensitive checks.

### Characters

```csharp
bool isDigit  = char.IsDigit(c);
bool isLetter = char.IsLetter(c);
bool isAlnum  = char.IsLetterOrDigit(c);
bool isLower  = char.IsLower(c);
char upCh     = char.ToUpperInvariant(c);  // culture-safe uppercase
char loCh     = char.ToLowerInvariant(c);  // culture-safe lowercase
int  bucket   = c - 'a';                   // 0–25 index for lowercase letters
```

### StringBuilder

```csharp
var sb = new StringBuilder();
var sb2 = new StringBuilder(capacity: 256);   // pre-allocate to avoid resizes
sb.Append("hello");                 // O(1) amortised; overloads for int, char, etc.
sb.Append(42);
sb.AppendLine("world");
sb.Insert(0, "prefix");             // O(n) shift
sb.Remove(2, 3);                    // (startIndex, count) removes 3 chars
sb.Replace("l", "L");
char ch = sb[0];                    // index access
sb[0] = 'H';                        // mutable
int slen = sb.Length;
sb.Length = 0;                      // fast clear — reuses the buffer
string r2 = sb.ToString();
```

---

## Collections — Detail

### List\<T\> — dynamic array, O(1) amortised append

```csharp
var list = new List<int>();
var list2 = new List<int>(capacity: 1000);      // pre-allocate
var list3 = new List<int> { 1, 2, 3 };
var list4 = new List<int>(sourceArray);         // copy from array or IEnumerable

list.Add(1);                                    // O(1) amortised, at end
list.AddRange(new[] { 2, 3, 4 });              // bulk append
list.Insert(0, 9);                              // O(n) — shifts right
list.InsertRange(0, new[] { 7, 8 });

list[0] = 5;                                    // O(1) set
int v2 = list[0];                               // O(1) get

list.RemoveAt(0);                               // O(n) — by index
list.Remove(5);                                 // O(n) — removes first match
list.RemoveAll(x => x < 0);                    // O(n) — remove all matching

int cnt = list.Count;
bool hasx = list.Contains(5);                  // O(n)
int idxl = list.IndexOf(5);                    // O(n), -1 if not found

list.Sort();                                    // in-place IntroSort
list.Sort((x, y) => y.CompareTo(x));           // descending
list.Reverse();                                 // in-place
List<int> sub2 = list.GetRange(1, 3);          // (index, count) — new list

int bsResult = list.BinarySearch(5);           // MUST be sorted; <0 → ~result = insertion point
// Usage: if (bs < 0) list.Insert(~bs, 5);    // insert at sorted position

int[] toArr = list.ToArray();
```

### Stack\<T\> — LIFO

```csharp
var st = new Stack<int>();
var st2 = new Stack<int>(source);       // initialise from IEnumerable (reversed order!)
st.Push(1);                             // O(1)
int top2 = st.Peek();                   // throws if empty
int popped = st.Pop();                  // O(1), throws if empty
bool ok2 = st.TryPop(out int xp);      // safe — returns false when empty
bool ok3 = st.TryPeek(out int xk);
int stCnt = st.Count;
foreach (var xi in st) { }             // enumerates top → bottom (surprising!)
```

> **Trap:** `foreach` on a `Stack<T>` goes **top → bottom**, not bottom → top.

### Queue\<T\> — FIFO

```csharp
var q = new Queue<int>();
q.Enqueue(1);                           // add at back, O(1)
int front2 = q.Peek();                  // throws if empty
int d2 = q.Dequeue();                   // remove from front, O(1), throws if empty
bool qok2 = q.TryDequeue(out int yq);   // safe
bool qok3 = q.TryPeek(out int yk);
int qCnt = q.Count;
```

### LinkedList\<T\> — doubly linked, O(1) at both ends

```csharp
var ll = new LinkedList<int>();         // use as a deque when you need O(1) both ends
ll.AddFirst(1);                         // O(1)
ll.AddLast(2);                          // O(1)
int firstV = ll.First!.Value;
int lastV  = ll.Last!.Value;
ll.RemoveFirst();                       // O(1)
ll.RemoveLast();                        // O(1)
int llCnt = ll.Count;
foreach (var xi2 in ll) { }            // first → last
```

> **No `Deque<T>` in .NET.** Use `LinkedList<T>` for O(1) both-ends access, or two `Stack<T>`s, or `List<T>` with a head index for amortised O(1).

### HashSet\<T\> — unordered, O(1) average

```csharp
var set = new HashSet<int>();
var set2 = new HashSet<int>(sourceArray);       // construct from array — deduplicates
var set3 = new HashSet<int>(capacity: 1000);

bool added = set.Add(1);                        // returns false if already present — dedupe idiom
bool has2 = set.Contains(1);                   // O(1) average
set.Remove(1);
int setCnt = set.Count;

set.UnionWith(other);                           // set |= other (modifies in place)
set.IntersectWith(other);                       // set &= other
set.ExceptWith(other);                          // set -= other
bool isSuper = set.IsSupersetOf(other);

// Deduplicate-in-one-line idiom:
if (!seen.Add(val)) continue;                  // skip if already seen
```

> For `HashSet<List<int>>`, `Add` uses reference equality — two different list objects with the same contents are NOT equal. Key by a string or tuple instead.

### SortedSet\<T\> — sorted, no duplicates, O(log n)

```csharp
var ss = new SortedSet<int>();
var ssDesc = new SortedSet<int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));

ss.Add(5); ss.Remove(5);
int ssMin = ss.Min; int ssMax = ss.Max;         // O(log n)
bool ssCont = ss.Contains(3);

// GetViewBetween — C#'s closest equivalent to Java TreeMap.floorKey/ceilingKey
SortedSet<int> range = ss.GetViewBetween(lo, hi);   // elements with lo ≤ x ≤ hi
int? ceil2 = ss.GetViewBetween(target, int.MaxValue).Min;   // ceiling of target
int? floor2 = ss.GetViewBetween(int.MinValue, target).Max;  // floor of target
```

> **C# has no `lower_bound`/`upper_bound`.** Use `GetViewBetween` + `.Min`/`.Max` as the workaround. See [Searching and Sorting](../SearchingAndSorting/SearchingAndSorting.md) for binary search templates.

### Dictionary\<K,V\> — unordered, O(1) average

```csharp
var map = new Dictionary<string, int>();
var map2 = new Dictionary<string, int>(capacity: 100);
var map3 = new Dictionary<(int, int), string>();        // tuple key — works out of the box

map["a"] = 1;                                           // add or overwrite
map.Add("b", 2);                                        // throws if key exists
int mv = map["a"];                                      // throws KeyNotFoundException if missing
bool hasK = map.ContainsKey("a");
map.Remove("a");

// Safe reads — prefer these
bool got = map.TryGetValue("a", out int val2);          // safest; no double-lookup
int gvd = map.GetValueOrDefault("a", 0);               // returns default if missing

// Frequency-counting idiom
map[key] = map.GetValueOrDefault(key) + 1;

bool added2 = map.TryAdd("c", 3);                       // adds only if key absent; returns bool

// Iterate (insertion order not guaranteed)
foreach (var kv in map) { _ = kv.Key; _ = kv.Value; }
foreach (var (k, v3) in map) { }                        // deconstruct KeyValuePair
foreach (string k2 in map.Keys) { }
foreach (int v4 in map.Values) { }

// Convert
List<int>    vals  = map.Values.ToList();
List<string> keys2 = map.Keys.ToList();
```

### SortedDictionary\<K,V\> — sorted by key, O(log n)

```csharp
var sd = new SortedDictionary<int, int>();              // iterates in ascending key order
sd[1] = 10; sd[2] = 20;
int sdFirst = sd.Keys.First();                          // smallest key
int sdLast  = sd.Keys.Last();                           // largest key
// No direct floor/ceiling — use SortedSet<K> of the keys + dict lookup if needed
```

### SortedList\<K,V\> — sorted array-backed, O(log n) lookup, O(n) insert

```csharp
var sl = new SortedList<int, int>();    // like SortedDictionary but random access by index
int valAtIdx = sl.Values[0];           // O(1) by position index (SortedDictionary can't do this)
int keyAtIdx = sl.Keys[0];
// Prefer SortedDictionary for frequent inserts; SortedList when you need positional access
```

### PriorityQueue\<E,P\> — min-heap (.NET 6+)

```csharp
var pq = new PriorityQueue<int, int>();                 // (element, priority), min-priority leaves first
var maxPq = new PriorityQueue<int, int>(
    Comparer<int>.Create((a, b) => b.CompareTo(a)));    // max-heap

pq.Enqueue(1, 3);                   // element=1, priority=3
pq.Enqueue(2, -2);                  // -2 dequeues before 3
int topE = pq.Peek();               // look at element with lowest priority; throws if empty
int deqE = pq.Dequeue();            // O(log n)
bool deqOk = pq.TryDequeue(out int el, out int pri);   // safe
bool peekOk = pq.TryPeek(out int el2, out int pri2);
int pqCnt = pq.Count;

// Tuple priorities for tie-breaking — compare (priority, insertionOrder) to break ties
pq.Enqueue(node, (distance, insertOrder));

// UnorderedItems — read all without removing (no guaranteed order)
foreach (var (elem, p2) in pq.UnorderedItems) { }

// EnqueueDequeue — push then immediately pop (more efficient than two operations)
int result2 = pq.EnqueueDequeue(elem, pri);
```

> **No decrease-key.** To simulate it, use lazy deletion: push a new entry and skip stale ones when dequeuing. See [Heaps and Priority Queues](../HeapsAndPriorityQueues/HeapsAndPriorityQueues.md).

---

## LINQ

> Queries are **lazy** — nothing runs until enumerated or materialised with `ToList()`/`ToArray()`.
> Never modify the source — LINQ returns new sequences.

```csharp
int[] a = { 3, 1, 4, 1, 5, 9, 2, 6 };

// Aggregation
a.Sum();  a.Max();  a.Min();  a.Average();  a.Count();
a.Count(x => x > 3);
a.MaxBy(x => -x);                           // element with max -x value (.NET 6+)
a.MinBy(x => x % 3);                        // element with min key (.NET 6+)
a.Aggregate((acc, x) => acc + x);           // fold left; throws on empty
a.Aggregate(0, (acc, x) => acc + x);        // with seed — safe on empty

// Filter & transform
a.Where(x => x % 2 == 0).ToArray();
a.Select(x => x * x).ToList();
a.SelectMany(sub => sub);                   // flatten IEnumerable<IEnumerable<T>>

// Ordering
a.OrderBy(x => x).ThenByDescending(x => -x);
a.OrderByDescending(x => x);

// Set / dedup
a.Distinct();
a.Distinct(EqualityComparer<int>.Default);

// Take / skip
a.Take(3);  a.Skip(2);
a.TakeWhile(x => x < 5);  a.SkipWhile(x => x < 5);
a.Chunk(3);                                 // split into sub-arrays of size 3 (.NET 6+)

// Element access
a.First();  a.FirstOrDefault();
a.Single(); a.SingleOrDefault();            // throws if more than one match

// Quantifiers
a.Any(x => x > 5);
a.All(x => x > 0);
a.Contains(4);

// Grouping & dictionary
a.GroupBy(x => x % 2);                     // each group: .Key + items
a.ToDictionary(x => x, x => x * x);        // throws on duplicate keys
a.ToLookup(x => x % 2);                    // like GroupBy but indexable; allows duplicate keys

// Zip & combine
int[] b2 = { 1, 2, 3 };
a.Zip(b2, (x, y) => x + y);               // combine element-by-element

// Generate sequences
Enumerable.Range(0, n);                    // 0, 1, ..., n-1
Enumerable.Repeat(0, n);                   // 0, 0, ..., 0 (n times)
```

> **When NOT to use LINQ:** LINQ has allocation overhead (closures, enumerators) and a real constant factor. In tight inner loops with large n (≥ 10⁶), an explicit `for` loop is often 3–5× faster. If an interviewer asks "can you optimise?" switching from LINQ to a loop is a quick win.

---

## Modern C# Syntax

```csharp
// Target-typed new — infer type from context
List<int> list5 = new();
Dictionary<string, int> map4 = new(capacity: 100);

// Collection expressions (C# 12 / .NET 8)
int[] arr3 = [1, 2, 3];
int[] combined = [..arr3, 4, 5];       // spread operator

// var
var s2 = "hello";                      // still statically typed

// Tuple deconstruct & swap
var (a2, b2) = (1, 2);
(a2, b2) = (b2, a2);                   // swap

// Switch expression & pattern matching (C# 8+)
string msg = score switch {
    >= 90 => "A",
    >= 80 => "B",
    _     => "F"
};

// is pattern
if (obj is string str2 && str2.Length > 0) { }
if (n is > 0 and < 100) { }            // C# 9+ conjunctive pattern

// Range & Index
int l2 = arr3[^1];
int[] mid = arr3[1..^1];

// Null-conditional & null-coalescing
int? maybeNull = null;
int safe = maybeNull ?? 0;             // default if null
int len2 = str2?.Length ?? 0;         // null-safe member access
maybeNull ??= 42;                      // assign only if null

// Local functions — ideal for DFS/BFS helpers inside a LeetCode method
public int CountNodes(TreeNode? root) {
    return Dfs2(root);

    int Dfs2(TreeNode? node) {          // captures outer vars without extra class fields
        if (node == null) return 0;
        return 1 + Dfs2(node.Left) + Dfs2(node.Right);
    }
}

// Static local function — cannot capture outer vars (prevents accidental closure)
static int Square(int x3) => x3 * x3;

// Expression-bodied members
public int Doubled => Val * 2;

// Raw string literals (C# 11) — no escaping needed
string json = """{"key": "value"}""";

// nameof
throw new ArgumentNullException(nameof(root));
```

---

## Custom Comparers & Sorting

```csharp
// Inline comparison lambda — most common in interviews
list.Sort((x, y) => x.CompareTo(y));                       // ascending
list.Sort((x, y) => y.CompareTo(x));                       // descending
```

> **Subtraction comparator overflow bug:** `(a, b) => a - b` silently overflows for large values (e.g. `int.MinValue - 1`). Always use `a.CompareTo(b)`.

```csharp
// Sort int[][] by column[1] descending, then column[0] ascending
int[][] intervals = [[1,4],[2,3],[3,5]];
Array.Sort(intervals, (x, y) => x[1] != y[1] ? y[1].CompareTo(x[1]) : x[0].CompareTo(y[0]));

// Comparer<T>.Create — reusable comparer object
IComparer<int> desc2 = Comparer<int>.Create((a, b) => b.CompareTo(a));
var pq2 = new PriorityQueue<int, int>(desc2);   // max-heap

// IComparer<T> implementation — for complex custom ordering
class IntervalComparer : IComparer<int[]> {
    public int Compare(int[]? x, int[]? y) => x![0].CompareTo(y![0]);
}
Array.Sort(intervals, new IntervalComparer());

// Custom struct as dictionary key — must override Equals + GetHashCode
// See Hashing contract details in ../Hashing/Hashing.md
struct Pair : IEquatable<Pair> {
    public int A, B;
    public bool Equals(Pair other) => A == other.A && B == other.B;
    public override bool Equals(object? obj) => obj is Pair p && Equals(p);
    public override int GetHashCode() => HashCode.Combine(A, B);
}

// Alternatively, use a value tuple — (int, int) has built-in structural equality
var map5 = new Dictionary<(int, int), int>();
map5[(1, 2)] = 42;
```

---

## Graph Representation

> See [Graphs](../Graphs/Graphs.md) for BFS, DFS, Dijkstra, topological sort, and DSU.

```csharp
// Adjacency list — sparse graphs, O(V + E) space
List<int>[] g = new List<int>[n];
for (int i = 0; i < n; i++) g[i] = new List<int>();
g[u].Add(v); g[v].Add(u);          // undirected

// Weighted adjacency list
List<(int to, int w)>[] wg = new List<(int, int)>[n];
for (int i = 0; i < n; i++) wg[i] = new List<(int, int)>();
wg[u].Add((v, w));
foreach (var (to, w2) in wg[u]) { }

// Adjacency matrix — dense graphs, O(1) edge lookup, O(V²) space
int[,] mat = new int[n, n];
mat[u, v] = 1;
```

---

## C# vs Java / Python

| Concept | Java | Python | **C#** |
| ------- | ---- | ------ | ------ |
| Dynamic array | `ArrayList` / `List<T>` | `list` | `List<T>` |
| Hash map | `HashMap<K,V>` | `dict` | `Dictionary<K,V>` |
| Hash set | `HashSet<T>` | `set` | `HashSet<T>` |
| Ordered map | `TreeMap<K,V>` | `SortedDict` | `SortedDictionary<K,V>` |
| Priority queue | `PriorityQueue<T>` (min) | `heapq` (min) | `PriorityQueue<E,P>` (min) |
| String builder | `StringBuilder` | `"".join(list)` | `StringBuilder` |
| Array length | `arr.length` | `len(arr)` | `arr.Length` |
| Collection size | `list.size()` | `len(list)` | `list.Count` |
| Default map get | `map.getOrDefault(k,0)` | `d.get(k,0)` | `map.GetValueOrDefault(k,0)` |
| String equality | `.equals(s)` | `==` | `==` (value equality) |
| Integer division | `/` (truncates to 0) | `//` (floor) | `/` (truncates to 0) |
| Modulo sign | sign of dividend | sign of divisor | sign of dividend |
| `%` with negatives | `-7 % 3 == -1` | `-7 % 3 == 2` | `-7 % 3 == -1` |
| Sorted set range | `TreeMap.subMap` | `sortedcontainers.SortedList` | `SortedSet.GetViewBetween` |
| Deque | `ArrayDeque` | `collections.deque` | `LinkedList<T>` (workaround) |
| Pair/tuple | `new int[]{a,b}` or record | `(a, b)` | `(a, b)` value tuple |
| `null` check | `obj != null` | `obj is not None` | `obj is not null` |
| Max int | `Integer.MAX_VALUE` | `float('inf')` | `int.MaxValue` |

---

## Reference Tables

### Collection Complexity Table

| Collection | Access | Search | Insert | Delete | Ordered? | Duplicates? | Notes |
| ---------- | ------ | ------ | ------ | ------ | -------- | ----------- | ----- |
| `T[]` | O(1) | O(n) | — (fixed) | — (fixed) | ❌ | ✅ | Use `Array.BinarySearch` on sorted array |
| `List<T>` | O(1) | O(n) | O(1)† / O(n) | O(n) | ❌ | ✅ | †amortised at end; O(n) mid-insert |
| `LinkedList<T>` | O(n) | O(n) | O(1) ends | O(1) ends | ❌ | ✅ | Use as deque; no index access |
| `Stack<T>` | Peek O(1) | O(n) | Push O(1) | Pop O(1) | ❌ | ✅ | LIFO; enumerates top→bottom |
| `Queue<T>` | Peek O(1) | O(n) | Enqueue O(1) | Dequeue O(1) | ❌ | ✅ | FIFO |
| `HashSet<T>` | — | O(1)† | O(1)† | O(1)† | ❌ | ❌ | †average; worst O(n) |
| `Dictionary<K,V>` | O(1)† | O(1)† | O(1)† | O(1)† | ❌ | keys ❌ | †average; worst O(n) |
| `SortedSet<T>` | — | O(log n) | O(log n) | O(log n) | ✅ asc | ❌ | Red-black tree; `GetViewBetween` |
| `SortedDictionary<K,V>` | O(log n) | O(log n) | O(log n) | O(log n) | ✅ by key | keys ❌ | Red-black tree |
| `SortedList<K,V>` | O(log n) | O(log n) | O(n) | O(n) | ✅ by key | keys ❌ | Array-backed; O(1) positional access |
| `PriorityQueue<E,P>` | Peek O(1) | — | Enqueue O(log n) | Dequeue O(log n) | ✅ priority | ✅ | Binary min-heap (.NET 6+); no decrease-key |
| `StringBuilder` | O(1) | — | Append O(1)† | Remove O(n) | — | — | †amortised; `Length=0` to reuse buffer |

### Build & Read

| Structure | Create | Add / Insert | Access / Peek | Iterate |
| --------- | ------ | ------------ | ------------- | ------- |
| **Array** `T[]` | `new T[n]` / `{1,2,3}` / `[1,2,3]` | fixed size | `a[i]` | `foreach` / `for i` |
| **string** | `"abc"` / `new string(arr)` | — immutable | `s[i]` | `foreach (char c in s)` |
| **StringBuilder** | `new StringBuilder()` | `Append(x)` / `Insert(i,x)` | `sb[i]` | `for (i=0..Length) sb[i]` |
| **List** `<T>` | `new List<T>()` | `Add(x)` / `AddRange` | `list[i]` | `foreach` / `for i` |
| **Stack** `<T>` | `new Stack<T>()` | `Push(x)` | `Peek()` (top) | `foreach` (top→bottom) |
| **Queue** `<T>` | `new Queue<T>()` | `Enqueue(x)` | `Peek()` (front) | `foreach` (front→back) |
| **LinkedList** `<T>` | `new LinkedList<T>()` | `AddFirst(x)` / `AddLast(x)` | `First.Value` / `Last.Value` | `foreach` (first→last) |
| **HashSet** `<T>` | `new HashSet<T>()` | `Add(x)` → bool | — (no index) | `foreach` (no order) |
| **SortedSet** `<T>` | `new SortedSet<T>()` | `Add(x)` | `Min` / `Max` | `foreach` (ascending) |
| **Dictionary** `<K,V>` | `new Dictionary<K,V>()` | `map[k]=v` / `TryAdd` | `map[k]` / `TryGetValue` | `foreach (var (k,v) in map)` |
| **SortedDictionary** | `new SortedDictionary<K,V>()` | `sd[k]=v` | `sd[k]` | `foreach` (by key asc) |
| **PriorityQueue** `<E,P>` | `new PriorityQueue<E,P>()` | `Enqueue(e,p)` | `Peek()` (min) | `foreach (var (e,p) in pq.UnorderedItems)` |

### Modify & Query

| Structure | Remove / Delete | Search / Contains | Count / Length | Sort |
| --------- | --------------- | ----------------- | -------------- | ---- |
| **Array** `T[]` | — shift manually | `Array.IndexOf` / `BinarySearch` | `a.Length` | `Array.Sort(a)` |
| **string** | `s.Remove(i,len)` (new) | `Contains` / `IndexOf` | `s.Length` | LINQ `OrderBy` |
| **StringBuilder** | `sb.Remove(i,len)` | — | `sb.Length` | — |
| **List** `<T>` | `RemoveAt(i)` / `RemoveAll(pred)` | `Contains` / `IndexOf` | `.Count` | `list.Sort()` |
| **Stack** `<T>` | `Pop()` / `TryPop` | `Contains` | `.Count` | — |
| **Queue** `<T>` | `Dequeue()` / `TryDequeue` | `Contains` | `.Count` | — |
| **LinkedList** `<T>` | `RemoveFirst()` / `RemoveLast()` | `Contains` | `.Count` | — |
| **HashSet** `<T>` | `Remove(x)` | `Contains(x)` | `.Count` | — |
| **SortedSet** `<T>` | `Remove(x)` | `Contains(x)` | `.Count` | auto asc |
| **Dictionary** `<K,V>` | `Remove(k)` | `ContainsKey(k)` | `.Count` | LINQ `OrderBy` |
| **SortedDictionary** | `Remove(k)` | `ContainsKey(k)` | `.Count` | auto by key |
| **PriorityQueue** `<E,P>` | `Dequeue()` / `TryDequeue` | — (no efficient search) | `.Count` | heap order |

### Conversions

```text
IEnumerable<T>
     ├──→ .ToList()
     ├──→ .ToArray()
     ├──→ new HashSet<T>(source)
     ├──→ new Stack<T>(source)     // reversed!
     └──→ new Queue<T>(source)

string   → char[]       : s.ToCharArray()
char[]   → string       : new string(arr)
int[]    → List<int>    : arr.ToList()
List<T>  → T[]          : list.ToArray()

Dictionary → keys       : dict.Keys          (ICollection<K>)
Dictionary → values     : dict.Values        (ICollection<V>)
Dictionary → KVP list   : dict.ToList()

Anything → Dictionary   : source.ToDictionary(keySelector, valueSelector)
Anything → Lookup       : source.ToLookup(keySelector)   // allows duplicate keys
```

### Math quick-reference

```csharp
Math.Max(a, b); Math.Min(a, b);
Math.Abs(x);                            // Math.Abs(int.MinValue) throws — use long
Math.Sqrt(x); Math.Pow(2, 10);          // returns double; cast back: (int)Math.Pow(2,10)
Math.Floor(x); Math.Ceiling(x); Math.Round(x);
Math.Log2(x); Math.Log10(x);

static long Gcd(long a, long b) => b == 0 ? a : Gcd(b, a % b);
static long Lcm(long a, long b) => a / Gcd(a, b) * b;   // divide first to prevent overflow
```