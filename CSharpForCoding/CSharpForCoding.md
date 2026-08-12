# C# For Coding Round

Concise syntax reference for DSA interview coding rounds.

**Contents**

- **Part 1 — Language Basics:** 1 Setup & I/O · 2 Primitives & Casting · 3 Loops & Control · 4 Methods & Tuples · 5 Classes & Structs
- **Part 2 — Strings & Arrays:** 6 Strings & StringBuilder · 7 Arrays
- **Part 3 — Collections:** 8 List · 9 Stack / Queue / LinkedList · 10 Sets · 11 Maps · 12 PriorityQueue · 13 Graphs
- **Part 4 — Utilities:** 14 LINQ · 15 Math
- **Part 5 — Reference Tables:** 16 Operations · 17 Complexity · 18 Conversion
- **Part 6 — Tips & Tricks:** 19 Tips

---

# Part 1 — Language Basics

## 1. Setup & I/O

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

class Solution {
    static void Main() {
        // code
    }
}
```

Read input:

```csharp
int n = int.Parse(Console.ReadLine());
int[] a = Console.ReadLine().Split().Select(int.Parse).ToArray();
string line = Console.ReadLine();
Console.WriteLine(result);
Console.WriteLine($"{x} and {y}");    // interpolation
```

Multiple test cases:

```csharp
int t = int.Parse(Console.ReadLine());
while (t-- > 0) Solve();
```

---

## 2. Primitives, Casting & Parsing

```csharp
int    i = 0;              // 32-bit signed,   ±2.1e9    (int.MaxValue / MinValue)
long   l = 0L;             // 64-bit signed,   ±9.2e18   (long.MaxValue / MinValue)
uint   u = 0u;             // 32-bit unsigned, 0..4.29e9 (uint.MaxValue, uint.MinValue = 0)
ulong  ul = 0uL;           // 64-bit unsigned, 0..1.8e19 (ulong.MaxValue, ulong.MinValue = 0)
double d = 0.0;
char   c = 'a';
bool   b = true;
var    x = 5;              // inferred type

int.MaxValue, int.MinValue, long.MaxValue, double.MaxValue;
uint.MaxValue, ulong.MaxValue;    // unsigned min is always 0
```

Unsigned integers (`uint` / `ulong`) hold no negatives, so they double the positive range:

```csharp
uint  u = uint.Parse("4000000000");    // beyond int range but fits uint
ulong big = 18_000_000_000_000_000_000uL;
uint  cast = (uint)(-1);               // wraps to 4294967295 (all bits set)
int   back = (int)u;                   // may become negative if high bit set
uint  diff = a - b;                    // WARNING: underflows to huge value if b > a
int setBits = System.Numerics.BitOperations.PopCount((uint)x);   // bit ops prefer unsigned
uint shifted = (uint)x >> 1;           // logical shift (fills 0); int >> is arithmetic
```

- No unsigned literal suffix is needed for small values: `uint u = 5;` works; use `u` / `uL` for large or explicit literals.
- Unsigned subtraction never goes negative — it wraps around, a common bug source. Cast to `long`/`int` before subtracting when a negative result is possible.
- Right-shift `>>` on `int` is arithmetic (sign-extends); on `uint`/`ulong` it is logical (fills with 0) — cast to unsigned for zero-fill shifts.

Casting & parsing:

```csharp
int  x = (int)3.9;                 // 3 (truncates)
long y = (long)i * i;              // avoid overflow
int  n = int.Parse("42");
bool ok = int.TryParse(s, out int v);
double dd = double.Parse("3.14");
string s = n.ToString();
int digit = c - '0';               // char -> int
char ch = (char)('a' + 1);         // 'b'
```

---

## 3. Loops & Control Flow

```csharp
for (int i = 0; i < n; i++) { }
for (int i = n - 1; i >= 0; i--) { }
foreach (var x in list) { }
while (cond) { }
do { } while (cond);

break; continue;

// switch
switch (x) {
    case 1: ...; break;
    default: ...; break;
}
var r = x switch { 1 => "a", 2 => "b", _ => "c" };  // expression
```

---

## 4. Methods & Tuples

```csharp
static int Add(int a, int b) => a + b;

static void Swap(ref int a, ref int b) { (a, b) = (b, a); }
static bool Try(out int r) { r = 5; return true; }

// tuple return
static (int, int) MinMax(int[] a) => (a.Min(), a.Max());
var (mn, mx) = MinMax(arr);
var t = (x: 1, y: 2); int xx = t.x;
```

---

## 5. Classes & Structs

```csharp
class Node {
    public int Val;
    public Node Next;
    public Node(int v) { Val = v; }
}
```

---

# Part 2 — Strings & Arrays

## 6. Strings & StringBuilder

```csharp
string s = "hello";
int len = s.Length;
char c = s[0];
string sub = s.Substring(1, 3);    // start, length
bool has = s.Contains("ell");
int idx = s.IndexOf('l');          // -1 if not found
int last = s.LastIndexOf('l');
bool sw = s.StartsWith("he"), ew = s.EndsWith("lo");
string rep = s.Replace("l", "L");
string up = s.ToUpper(), lo = s.ToLower();
string t = s.Trim();
string[] parts = s.Split(',');
string j = string.Join(",", parts);
bool eq = s.Equals(t);             // s == t also works
char[] arr = s.ToCharArray();
string r = new string(arr);
string rev = new string(s.Reverse().ToArray());
bool isDigit = char.IsDigit(c);
bool isLetter = char.IsLetter(c);
bool isAlnum = char.IsLetterOrDigit(c);
char up2 = char.ToUpper(c);
```

Strings are immutable — use `StringBuilder` for concatenation in loops:

```csharp
var sb = new StringBuilder();
sb.Append("a"); sb.Append(5);
sb.Insert(0, "x");
sb.Remove(2, 3);                   // start, count
sb[0] = 'y';
sb.Length = 0;                     // clear
string result = sb.ToString();
```

---

## 7. Arrays (1D / 2D / Jagged)

```csharp
int[] a = new int[n];              // default 0
int[] b = { 1, 2, 3 };
int[] c = new int[]{ 1, 2, 3 };
int len = a.Length;
a[0] = 5;

Array.Sort(a);                     // ascending
Array.Sort(a, (x, y) => y - x);    // descending (comparator)
Array.Reverse(a);
Array.Fill(a, -1);
int idx = Array.IndexOf(a, 5);
int bs = Array.BinarySearch(a, 5); // sorted array; <0 if not found, ~bs = insertion point
int[] copy = (int[])a.Clone();
Array.Copy(a, copy, a.Length);

// Index-from-end & ranges
int last = a[^1];                  // last element
int[] firstN = a[..3];             // first 3
int[] tail = a[2..];               // index 2 to end
int[] slice = a[1..4];             // [1,4)

// 2D
int[,] grid = new int[r, c];
grid[i, j] = 1;
int rows = grid.GetLength(0), cols = grid.GetLength(1);

// Jagged (array of arrays)
int[][] jag = new int[n][];
jag[0] = new int[]{ 1, 2 };
```

---

# Part 3 — Collections

## 8. List (dynamic array)

```csharp
var list = new List<int>();
list.Add(1);
list.AddRange(new[]{ 2, 3 });
list.Insert(0, 9);                 // at index
list[0] = 5;
int v = list[0];
list.RemoveAt(0);                  // by index
list.Remove(5);                    // first matching value
int cnt = list.Count;
bool has = list.Contains(5);
int idx = list.IndexOf(5);
list.Sort();
list.Sort((x, y) => y - x);        // custom
list.Reverse();
list.Clear();
int[] arr = list.ToArray();
var l2 = new List<int>(arr);       // from array
```

---

## 9. Stack / Queue / LinkedList

**Stack (LIFO):**

```csharp
var st = new Stack<int>();
st.Push(1);
int top = st.Peek();
int p = st.Pop();
int cnt = st.Count;
bool ok = st.TryPop(out int x);
```

**Queue (FIFO):**

```csharp
var q = new Queue<int>();
q.Enqueue(1);
int front = q.Peek();
int d = q.Dequeue();
int cnt = q.Count;
bool ok = q.TryDequeue(out int x);
```

**LinkedList (doubly-linked deque):**

```csharp
var dq = new LinkedList<int>();
dq.AddFirst(1);
dq.AddLast(2);
int f = dq.First.Value, l = dq.Last.Value;
dq.RemoveFirst();
dq.RemoveLast();
```

---

## 10. HashSet & SortedSet

```csharp
var set = new HashSet<int>();
set.Add(1);                        // returns false if exists
bool has = set.Contains(1);
set.Remove(1);
int cnt = set.Count;

var ss = new SortedSet<int>();     // ordered, O(log n)
int min = ss.Min, max = ss.Max;
var desc = new SortedSet<int>(Comparer<int>.Create((a, b) => b - a));
```

---

## 11. Dictionary & SortedDictionary

```csharp
var map = new Dictionary<string, int>();
map["a"] = 1;
map.Add("b", 2);                   // throws if exists
int v = map["a"];                  // throws if missing
bool has = map.ContainsKey("a");
map.Remove("a");
bool ok = map.TryGetValue("a", out int val);

// frequency count pattern
map[key] = map.GetValueOrDefault(key, 0) + 1;

foreach (var kv in map) { var k = kv.Key; var vv = kv.Value; }
foreach (var k in map.Keys) { }
foreach (var vv in map.Values) { }

var sd = new SortedDictionary<int, int>();   // sorted by key
```

---

## 12. PriorityQueue (min-heap by default)

```csharp
var pq = new PriorityQueue<string, int>();   // (element, priority)
pq.Enqueue("task", 3);                        // lower priority dequeues first
string top = pq.Peek();
string d = pq.Dequeue();
int cnt = pq.Count;
pq.TryDequeue(out string el, out int prio);

// Max-heap: negate priority
var maxpq = new PriorityQueue<int, int>();
maxpq.Enqueue(val, -val);

// Custom comparer
var cpq = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b - a));
```

---

## 13. Graph Representations

```csharp
// Adjacency list
List<int>[] g = new List<int>[n];
for (int i = 0; i < n; i++) g[i] = new List<int>();
g[u].Add(v); g[v].Add(u);          // undirected

// Weighted graph
List<(int to, int w)>[] wg = new List<(int, int)>[n];
for (int i = 0; i < n; i++) wg[i] = new List<(int, int)>();
wg[u].Add((v, w));
```

---

# Part 4 — Utilities

## 14. LINQ (handy one-liners)

```csharp
a.Sum(); a.Max(); a.Min(); a.Average(); a.Count();
a.Count(x => x > 0);
a.Where(x => x % 2 == 0).ToArray();
a.Select(x => x * x).ToList();
a.OrderBy(x => x % 3).ThenByDescending(x => x);   // by 2 keys
a.OrderByDescending(x => x);
a.Distinct();
a.Reverse();
a.Take(3); a.Skip(2);
a.First(); a.FirstOrDefault();
a.Any(x => x > 5); a.All(x => x > 0);
a.GroupBy(x => x % 2);
a.ToDictionary(x => x, x => x * x);
a.Aggregate((acc, x) => acc + x);
Enumerable.Range(0, n).ToArray();      // [0..n-1]
Enumerable.Repeat(0, n).ToArray();     // n zeros
```

---

## 15. Math

```csharp
Math.Max(a, b); Math.Min(a, b);
Math.Abs(x); Math.Pow(2, 10); Math.Sqrt(x);
Math.Floor(x); Math.Ceiling(x); Math.Round(x);
Math.Log2(x); Math.Log10(x);           // bit-length / digit-count tricks
int q = a / b, r = a % b;              // integer div/mod
// GCD
static long Gcd(long a, long b) => b == 0 ? a : Gcd(b, a % b);
```

---

# Part 5 — Reference Tables

## 16. Operations Cheat Sheet (syntax in one place)

**A. Build & Read** — create, add, access, iterate

| Structure                 | Create                        | Add / Insert                 | Access / Peek                | Iterate                                               |
| ------------------------- | ----------------------------- | ---------------------------- | ---------------------------- | ----------------------------------------------------- |
| **Array** `T[]`           | `new T[n]` / `{1,2,3}`        | fixed size (—)               | `a[i]`                       | `foreach (var x in a)` / `for (i=0..Length)`          |
| **List** `<T>`            | `new List<T>()`               | `Add(x)` / `Insert(i,x)`     | `list[i]`                    | `foreach (var x in list)` / `for (i=0..Count)`        |
| **Stack** `<T>`           | `new Stack<T>()`              | `Push(x)`                    | `Peek()` (top)               | `foreach (var x in st)` (top → bottom)                |
| **Queue** `<T>`           | `new Queue<T>()`              | `Enqueue(x)`                 | `Peek()` (front)             | `foreach (var x in q)` (front → back)                 |
| **LinkedList** `<T>`      | `new LinkedList<T>()`         | `AddFirst(x)` / `AddLast(x)` | `First.Value` / `Last.Value` | `foreach (var x in dq)` (first → last)                |
| **HashSet** `<T>`         | `new HashSet<T>()`            | `Add(x)`                     | — (no index)                 | `foreach (var x in set)` (no order)                   |
| **SortedSet** `<T>`       | `new SortedSet<T>()`          | `Add(x)`                     | `Min` / `Max`                | `foreach (var x in ss)` (ascending)                   |
| **Dictionary** `<K,V>`    | `new Dictionary<K,V>()`       | `map[k]=v` / `Add(k,v)`      | `map[k]` / `TryGetValue`     | `foreach (var kv in map)` → `kv.Key` / `kv.Value`     |
| **SortedDictionary**      | `new SortedDictionary<K,V>()` | `sd[k]=v` / `Add(k,v)`       | `sd[k]`                      | `foreach (var kv in sd)` (by key)                     |
| **PriorityQueue** `<E,P>` | `new PriorityQueue<E,P>()`    | `Enqueue(e,p)`               | `Peek()` (min)               | `foreach (var (e,p) in pq.UnorderedItems)` (no order) |
| **string**                | `"abc"` / `new string(arr)`   | — immutable (`+` → new)      | `s[i]`                       | `foreach (char c in s)` / `for (i=0..Length)`         |
| **StringBuilder**         | `new StringBuilder()`         | `Append(x)` / `Insert(i,x)`  | `sb[i]`                      | `for (i=0..Length) sb[i]` (no `foreach`)              |

**B. Modify & Query** — remove, search, size, sort

| Structure                 | Remove / Delete                   | Search / Contains                     | Count / Length | Sort                                    |
| ------------------------- | --------------------------------- | ------------------------------------- | -------------- | --------------------------------------- |
| **Array** `T[]`           | — (shift manually)                | `Array.IndexOf(a,x)` / `BinarySearch` | `a.Length`     | `Array.Sort(a)` / `Array.Reverse(a)`    |
| **List** `<T>`            | `RemoveAt(i)` / `Remove(x)`       | `Contains(x)` / `IndexOf(x)`          | `.Count`       | `list.Sort()` / `list.Reverse()`        |
| **Stack** `<T>`           | `Pop()` / `TryPop(out x)`         | `Contains(x)`                         | `.Count`       | —                                       |
| **Queue** `<T>`           | `Dequeue()` / `TryDequeue(out x)` | `Contains(x)`                         | `.Count`       | —                                       |
| **LinkedList** `<T>`      | `RemoveFirst()` / `RemoveLast()`  | `Contains(x)`                         | `.Count`       | —                                       |
| **HashSet** `<T>`         | `Remove(x)`                       | `Contains(x)`                         | `.Count`       | — (unordered)                           |
| **SortedSet** `<T>`       | `Remove(x)`                       | `Contains(x)`                         | `.Count`       | auto-sorted (asc)                       |
| **Dictionary** `<K,V>`    | `Remove(k)`                       | `ContainsKey(k)` / `ContainsValue(v)` | `.Count`       | LINQ `OrderBy(kv=>kv.Key)`              |
| **SortedDictionary**      | `Remove(k)`                       | `ContainsKey(k)`                      | `.Count`       | auto by key                             |
| **PriorityQueue** `<E,P>` | `Dequeue()` / `TryDequeue(...)`   | — (no efficient search)               | `.Count`       | heap-ordered by priority                |
| **string**                | `s.Remove(i,len)` (→ new)         | `Contains` / `IndexOf` / `StartsWith` | `s.Length`     | `new string(s.OrderBy(c=>c).ToArray())` |
| **StringBuilder**         | `sb.Remove(i,len)`                | — (`ToString()` first)                | `sb.Length`    | —                                       |

**Notes**

- Most collections implement `IEnumerable`, so `foreach` works directly; use an index `for` loop only for `Array`, `List`, `string`, and `StringBuilder`.
- `Clear()` empties `List`, `HashSet`, `Dictionary`, `Stack`, `Queue`; for arrays use `Array.Clear(a, 0, a.Length)`; for `StringBuilder` set `sb.Length = 0`.
- Custom order: pass `Comparer<T>.Create((a,b)=>…)` to `Sort`, `SortedSet`, `SortedDictionary`, or `PriorityQueue`.

---

## 17. Complexity Cheat Sheet

| Data Structure   | Insert   | Delete   | Search    |
| ---------------- | -------- | -------- | --------- |
| Array            | O(1)     | O(n)     | O(1) idx  |
| List             | O(1)\*   | O(n)     | O(n)      |
| Dictionary       | O(1)     | O(1)     | O(1)      |
| HashSet          | O(1)     | O(1)     | O(1)      |
| Stack / Queue    | O(1)     | O(1)     | —         |
| PriorityQueue    | O(log n) | O(log n) | O(1) peek |
| SortedSet        | O(log n) | O(log n) | O(log n)  |
| SortedDictionary | O(log n) | O(log n) | O(log n)  |

\* amortized; O(n) on resize. `PriorityQueue<TElement,TPriority>` is a min-heap (.NET 6+).

---

## 18. Data Structure Conversion Table

| From \ To       | Array `T[]`                                   | List                  | HashSet                    | Dictionary                   | Stack/Queue          | string                                      |
| --------------- | --------------------------------------------- | --------------------- | -------------------------- | ---------------------------- | -------------------- | ------------------------------------------- |
| **Array** `T[]` | `(T[])a.Clone()`                              | `a.ToList()`          | `new HashSet<T>(a)`        | `a.ToDictionary(k=>k, v=>v)` | `new Stack<T>(a)`    | `new string(charArr)` / `string.Join("",a)` |
| **List**        | `list.ToArray()`                              | `new List<T>(list)`   | `new HashSet<T>(list)`     | `list.ToDictionary(...)`     | `new Stack<T>(list)` | `string.Join("",list)`                      |
| **HashSet**     | `set.ToArray()`                               | `set.ToList()`        | `new HashSet<T>(set)`      | `set.ToDictionary(...)`      | `new Queue<T>(set)`  | `string.Join(",",set)`                      |
| **Dictionary**  | `map.Keys.ToArray()` / `map.Values.ToArray()` | `map.ToList()` (KVPs) | `new HashSet<K>(map.Keys)` | `new Dictionary<K,V>(map)`   | —                    | —                                           |
| **Stack/Queue** | `st.ToArray()`                                | `st.ToList()`         | `new HashSet<T>(st)`       | —                            | `new Queue<T>(st)`   | `string.Join("",st)`                        |
| **string**      | `s.ToCharArray()`                             | `s.ToList()` (chars)  | `new HashSet<char>(s)`     | —                            | `new Stack<char>(s)` | `s`                                         |

**Notes**

- `new Stack<T>(collection)` pushes items in enumeration order → last element ends on top.
- `Split()` gives `string[]`; combine with `.Select(int.Parse).ToArray()` for `int[]`.
- Dictionary → sorted: `new SortedDictionary<K,V>(map)` or `map.OrderBy(kv => kv.Key)`.
- Array/List → frequency map: `a.GroupBy(x => x).ToDictionary(g => g.Key, g => g.Count())`.

---

# Part 6 — Tips & Tricks

## 19. Tips & Tricks

### Overflow & Limits

```csharp
long sum = (long)a + b;                 // cast BEFORE multiply/add to avoid int overflow
const int INF = int.MaxValue / 2;       // avoids overflow when adding two INFs (Dijkstra/DP)
long mod = 1_000_000_007;               // common modulus; use long for products
long prod = (a % mod) * (b % mod) % mod;
```

### Frequency / Counting

```csharp
var freq = new int[26];
freq[c - 'a']++;                                 // lowercase letter buckets
var counts = s.GroupBy(c => c).ToDictionary(g => g.Key, g => g.Count());
```

### Char / Digit Math

```csharp
int pos = c - 'a';                      // 0..25 letter index
bool vowel = "aeiou".Contains(c);
```

### Ternary & Null Handling

```csharp
int max = a > b ? a : b;
x ??= 5;                                // assign if null
int val = dict.TryGetValue(k, out var v) ? v : -1;
int len = str?.Length ?? 0;             // null-safe
```

### Grid / Matrix Traversal

```csharp
int[] dr = { -1, 1, 0, 0 };             // 4-directional
int[] dc = { 0, 0, -1, 1 };
for (int k = 0; k < 4; k++) {
    int nr = r + dr[k], nc = c + dc[k];
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
}
// 8 directions: add diagonals {-1,-1,1,1} / {-1,1,-1,1}
```

### Fast Init

```csharp
var dp = new int[n];
Array.Fill(dp, -1);                     // memo init
var seen = new bool[n];                 // defaults to false
var grid = new int[r][];
for (int i = 0; i < r; i++) grid[i] = new int[c];   // jagged 2D
```

### Sorting Shortcuts

```csharp
Array.Sort(a); Array.Reverse(a);                    // descending
var byLen = words.OrderBy(w => w.Length).ThenBy(w => w).ToArray();
points.Sort((p, q) => p[0] != q[0] ? p[0] - q[0] : p[1] - q[1]);  // by 2 keys
Array.Sort(keys, values);                           // sort values by keys (parallel arrays)
var sortedChars = new string(s.OrderBy(c => c).ToArray());  // sort chars in string
```

### Binary Search (built-in on sorted data)

```csharp
int i = Array.BinarySearch(a, target);   // >=0 index, else ~i = insertion point
int ins = i < 0 ? ~i : i;                 // lower-bound style position
```

### Two Pointers / Sliding Window

```csharp
int l = 0;
for (int rr = 0; rr < n; rr++) {
    // expand window with a[rr]
    while (/* invalid */) { /* shrink with a[l++] */ }
    // update answer with window [l, rr]
}
```

### Handy One-Liners

```csharp
Enumerable.Range(1, n).Sum();                       // 1+2+...+n
arr.Select((x, i) => (x, i));                        // value with index
arr.Zip(brr, (x, y) => x + y);                       // pairwise combine
int[] prefix = new int[n + 1];
for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + a[i];   // prefix sums
bool anyDup = arr.Length != arr.Distinct().Count();  // has duplicates?
bool pal = s.SequenceEqual(s.Reverse());             // palindrome check
```

### Bit Tricks

```csharp
bool isEven = (x & 1) == 0;
int times2 = x << 1, half = x >> 1;
int setBits = System.Numerics.BitOperations.PopCount((uint)x);
bool kthSet = (x & (1 << k)) != 0;
x |= (1 << k);                          // set bit k
x &= ~(1 << k);                         // clear bit k
x ^= (1 << k);                          // toggle bit k
int lowBit = x & (-x);                  // lowest set bit
```

### Common Pitfalls

- `int / int` is integer division — cast to `double` for real division: `(double)a / b`.
- `Console.ReadLine().Split()` on multiple spaces: use `Split(' ', StringSplitOptions.RemoveEmptyEntries)`.
- `Dictionary[key]` throws if key absent — use `TryGetValue` / `GetValueOrDefault`.
- Comparator `(a, b) => a - b` can overflow — prefer `a.CompareTo(b)`.
- `List` modification inside `foreach` throws — iterate a copy or use an index loop.
- Strings are immutable — repeated `+=` is O(n²); use `StringBuilder`.
