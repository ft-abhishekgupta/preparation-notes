# C# Cheat Sheet

Quick syntax reference for coding interviews and competitive programming.

**Contents**

|                                                                     |                                               |
| ------------------------------------------------------------------- | --------------------------------------------- |
| [Basic Template](#basic-template)                                   | [Strings](#strings)                           |
| [Primitives](#primitives)                                           | [Collections](#collections)                   |
| [Casting & Parsing](#casting--parsing)                              | [Math](#math)                                 |
| [Conditions, Loops & Control Flow](#conditions-loops--control-flow) | [LINQ](#linq)                                 |
| [Tuples & Lambdas](#tuples--lambdas)                                | [Graph Representation](#graph-representation) |
| [Classes & Structs](#classes--structs)                              | [Reference Tables](#reference-tables)         |
| [Arrays](#arrays)                                                   |                                               |

---

## Basic Template

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

class Solution {
    static void Main() {
        // One value on a line
        int n = int.Parse(Console.ReadLine());

        // Several space-separated values on one line
        int[] nums = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();

        Console.WriteLine(n);
    }
}
```

---

## Primitives

### Declaration

```csharp
int    i = 0;              // 32-bit signed    ±2.1e9
long   l = 0L;             // 64-bit signed    ±9.2e18
uint   u = 0u;             // 32-bit unsigned  0 .. 4.29e9
ulong  ul = 0uL;           // 64-bit unsigned  0 .. 1.8e19
double d = 0.0;            // 64-bit float, ~15 significant digits
char   c = 'a';            // 16-bit UTF-16 code unit
bool   b = true;
var    x = 5;              // type inferred from the initializer (still statically typed)
```

### Limits

```csharp
int.MinValue, int.MaxValue;        // -2,147,483,648 .. 2,147,483,647
long.MinValue, long.MaxValue;      // ±9.22e18
double.MinValue, double.MaxValue;
uint.MaxValue, ulong.MaxValue;     // the minimum is always 0 for unsigned types
```

> Overflow is silent, not an error. If a sum or product can pass ~2e9, use `long`.

---

## Casting & Parsing

```csharp
int  x = (int)3.9;                 // 3 — casting to int truncates toward zero
long y = (long)i * i;              // cast BEFORE multiplying, or it overflows as int
int  n = int.Parse("42");          // throws FormatException on bad input
bool ok = int.TryParse(s, out int v);  // preferred: returns false instead of throwing
string s = n.ToString();
int  digit = c - '0';              // char digit -> int   ('7' -> 7)
char back  = (char)(digit + '0');  // int -> char digit   (7 -> '7')
```

---

## Conditions, Loops & Control Flow

### Branching

```csharp
if (cond) { }
if (cond) { } else { }
var x = cond ? a : b;              // ternary: picks one of two values

switch (x) {                       // statement form — every case needs break
    case 1: ...; break;
    default: ...; break;
}

var r = x switch {                 // expression form — evaluates to a value
    1 => "a",
    2 => "b",
    _ => "c"                       // _ is the catch-all
};
```

### Looping

```csharp
for (int i = 0; i < n; i++) { }        // forward
for (int i = n - 1; i >= 0; i--) { }   // backward
foreach (var x in list) { }            // read-only: never add/remove while iterating
while (cond) { }                       // may run zero times
do { } while (cond);                   // always runs at least once

break;                                 // leave the innermost loop
continue;                              // jump to the next iteration
```

---

## Tuples & Lambdas

### Tuples

```csharp
(int, int) p = (2, 5);
Console.WriteLine(p.Item1);        // unnamed elements are Item1, Item2, ...

var t = (x: 5, y: 10);             // named elements read much better
Console.WriteLine(t.x);

var (mn, mx) = MinMax(arr);        // deconstruct into separate variables
(a, b) = (b, a);                   // swap without a temp variable
```

### Methods & Lambdas

```csharp
static int Add(int a, int b) => a + b;                      // expression-bodied method
static void Swap(ref int a, ref int b) { (a, b) = (b, a); } // ref: caller's variable changes
static bool Try(out int r) { r = 5; return true; }          // out: must be set before returning
static (int, int) MinMax(int[] a) => (a.Min(), a.Max());    // return several values as a tuple

Func<int, int> square = x => x * x;                 // lambda held in a variable
Comparison<int> desc = (x, y) => y.CompareTo(x);    // reusable comparison

// Call by reference
methodName(ref variableName);

void methodName(ref int variableName);
```

---

## Classes & Structs

```csharp
class Node {                       // reference type — assignment copies the reference
    public int Val;
    public Node Next;
    public Node(int v) { Val = v; }
}

struct Point {                     // value type — assignment copies the whole value
    public int X, Y;
    public Point(int x, int y) { X = x; Y = y; }
}
```

---

## Arrays

### Create & Access

```csharp
int[] a = new int[n];              // every element defaults to 0
int[] b = { 1, 2, 3 };
int[] c = new int[]{ 1, 2, 3 };
var   x = new int[n];

int len = a.Length;                // arrays use Length, collections use Count
a[0] = 5;

return [1, 2];                     // collection expression (C# 12+)
```

### Common Operations

```csharp
Array.Sort(a);                     // in place, ascending
Array.Sort(a, (x, y) => y.CompareTo(x));  // descending; CompareTo avoids `y - x` overflow
Array.Reverse(a);                  // in place
Array.Fill(a, -1);                 // set every element
int idx = Array.IndexOf(a, 5);     // -1 if not found
int bs = Array.BinarySearch(a, 5); // array MUST be sorted; if bs < 0 then ~bs = insertion point

int[] copy = new int[a.Length];
Array.Copy(a, copy, a.Length);     // into an existing array
int[] clone = (int[])a.Clone();    // into a brand new array
```

### Ranges & Index-from-End

```csharp
int   last   = a[^1];              // ^1 is the last element, ^2 the one before it
int[] firstN = a[..3];             // indices 0, 1, 2
int[] tail   = a[2..];             // index 2 through the end
int[] slice  = a[1..4];            // [1, 4) — the end is exclusive; this copies
```

### 2D & Jagged

```csharp
// 2D (rectangular) — every row has the same length
int[,] grid = new int[r, c];
grid[i, j] = 1;
int rows = grid.GetLength(0), cols = grid.GetLength(1);

// Jagged (array of arrays) — rows may differ in length, and LINQ works on each row
int[][] jag = new int[n][];
for (int i = 0; i < n; i++) jag[i] = new int[m];   // each row must be created
m.Length          // number of rows
m[i].Length       // number of columns in row i
```

---

## Strings

### Create & Access

```csharp
string s = "hello";
string t = new string(arr);        // build from a char[]
int len = s.Length;
char c = s[0];                     // read-only: `s[0] = 'x'` does not compile
```

> Strings are immutable — every operation returns a **new** string. Concatenating in a loop is O(n²); use `StringBuilder` instead.

### Operations

```csharp
string sub = s.Substring(1, 3);    // (startIndex, length) -> "ell"
bool has = s.Contains("ell");
int idx = s.IndexOf('l');          // first match, -1 if not found
int last = s.LastIndexOf('l');     // last match
bool sw = s.StartsWith("he"), ew = s.EndsWith("lo");
string rep = s.Replace("l", "L");
string up = s.ToUpper(), lo = s.ToLower();
string trimmed = s.Trim();         // strips leading/trailing whitespace
string[] parts = s.Split(',');     // add StringSplitOptions.RemoveEmptyEntries to drop blanks
string joined = string.Join(",", parts);
string rev = new string(s.Reverse().ToArray());
```

### Comparison

```csharp
bool eq  = s.Equals(t);            // `s == t` also compares contents, not references
bool eqi = string.Equals(s1, s2, StringComparison.OrdinalIgnoreCase);
int  lex = string.Compare(s1, s2); // <0 s1 sorts first, 0 equal, >0 s2 sorts first
```

### Characters

```csharp
char[] arr = s.ToCharArray();      // mutable copy of the string
bool isDigit  = char.IsDigit(c);
bool isLetter = char.IsLetter(c);
bool isAlnum  = char.IsLetterOrDigit(c);
char up2 = char.ToUpper(c);
int  pos = c - 'a';                // 0..25 bucket index for lowercase letters
```

### StringBuilder (mutable string)

```csharp
var sb = new StringBuilder();
sb.Append("a"); sb.Append(5);      // Append accepts any type; O(1) amortized
sb.AppendLine();
sb.Insert(0, "x");
sb.Remove(2, 3);                   // (startIndex, count)
sb[0] = 'y';                       // individual characters are mutable
sb.Length = 0;                     // clear and reuse
string result = sb.ToString();
```

---

## Collections

### List — dynamic array, O(1) index

```csharp
var list = new List<int>();
var list = new List<int> { 1, 2, 3 };
var list = new List<int>(source);  // copy from any array or IEnumerable
int[] arr = list.ToArray();

// Insert
list.Add(1);                       // O(1) amortized, at the end
list.AddRange(new[]{ 2, 3 });
list.Insert(0, 9);                 // O(n) — shifts everything right
list[0] = 5;
int v = list[0];

// Remove
list.RemoveAt(0);                  // O(n) — by index
list.Remove(5);                    // O(n) — removes the first matching value
list.Clear();

// Query
int cnt = list.Count;              // collections use Count, arrays use Length
bool has = list.Contains(5);       // O(n)
int idx = list.IndexOf(5);         // -1 if not found

// Sort
list.Sort();                       // in place, ascending
list.Sort((x, y) => y.CompareTo(x));   // Desc order (CompareTo avoids overflow, return negative on correct order)
list.Reverse();                    // in place
```

### Stack — LIFO

```csharp
var st = new Stack<int>();
st.Push(1);                        // add on top
int top = st.Peek();               // look without removing — throws if empty
int p = st.Pop();                  // remove and return the top
int cnt = st.Count;
bool ok = st.TryPop(out int x);    // returns false instead of throwing when empty
```

### Queue — FIFO

```csharp
var q = new Queue<int>();
q.Enqueue(1);                      // add at the back
int front = q.Peek();              // look at the front — throws if empty
int d = q.Dequeue();               // remove and return the front
int qcnt = q.Count;
bool qok = q.TryDequeue(out int y);    // returns false instead of throwing when empty
```

### LinkedList — deque

```csharp
var dq = new LinkedList<int>();    // O(1) at both ends, but no index access
dq.AddFirst(1);
dq.AddLast(2);
int f = dq.First.Value, l = dq.Last.Value;   // First/Last are null when empty
dq.RemoveFirst();
dq.RemoveLast();
```

### HashSet — unordered, O(1) average

```csharp
var set = new HashSet<int>();
set.Add(1);                        // returns false if the value is already present
bool has = set.Contains(1);
set.Remove(1);
int cnt = set.Count;
set.UnionWith(other); set.IntersectWith(other); set.ExceptWith(other);
```

> Elements are matched with `Equals` / `GetHashCode`. Reference types such as `List<T>` use _reference_ equality, so a `HashSet<List<int>>` will not catch duplicate contents — key it by a string or tuple instead.

### SortedSet — ordered, O(log n)

```csharp
var ss = new SortedSet<int>();     // kept ascending, duplicates ignored
int min = ss.Min, max = ss.Max;
var desc = new SortedSet<int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));
var window = ss.GetViewBetween(lo, hi);      // all elements in a range
```

### Dictionary — unordered, O(1) average

```csharp
var map = new Dictionary<string, int>();
map["a"] = 1;                      // adds, or overwrites if the key exists
map.Add("b", 2);                   // throws if the key already exists
int v = map["a"];                  // throws KeyNotFoundException if missing
bool hasKey = map.ContainsKey("a");
bool hasVal = map.ContainsValue(2);            // O(n) — scans every value
map.Remove("a");
bool ok = map.TryGetValue("a", out int val);   // safest way to read
map[key] = map.GetValueOrDefault(key, 0) + 1;  // frequency-counting pattern

// Iterate (order is not guaranteed)
foreach (var kv in map) { var k = kv.Key; var vv = kv.Value; }
foreach (var (k, vv) in map) { }               // same thing, deconstructed
foreach (var k in map.Keys) { }
foreach (var vv in map.Values) { }

// Convert
List<int> values = map.Values.ToList();
List<string> keys = map.Keys.ToList();
KeyValuePair<string, int>[] arr = map.ToArray();
```

### SortedDictionary — ordered by key, O(log n)

```csharp
var sd = new SortedDictionary<int, int>();     // iterates in ascending key order
```

### PriorityQueue — min-heap by default

```csharp
var pq = new PriorityQueue<int, int>();  // (element, priority) — lowest priority leaves first
pq.Enqueue(1, 3);
pq.Enqueue(2, -2);                       // -2 is dequeued before 3

// Max-heap: negate the priority, or pass a reversed comparer
var maxPq = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));
PriorityQueue<Node, int> nodePq = new();     // the element can be any type

int top = pq.Peek();                     // smallest priority, left in the queue
int d = pq.Dequeue();                    // O(log n)
int cnt = pq.Count;
pq.TryDequeue(out int el, out int prio); // returns false instead of throwing when empty
```

---

## Math

```csharp
Math.Max(a, b); Math.Min(a, b);
Math.Abs(x); Math.Sqrt(x);
Math.Pow(2, 10);                       // returns double — cast back with (int) / (long)
Math.Floor(x); Math.Ceiling(x); Math.Round(x);
Math.Log2(x); Math.Log10(x);           // bit length / digit count

int q = a / b;                         // integer division truncates toward zero
int r = a % b;                         // sign follows the dividend: -7 % 3 == -1
int ceilDiv = (a + b - 1) / b;         // ceiling division for positive a and b

static long Gcd(long a, long b) => b == 0 ? a : Gcd(b, a % b);
static long Lcm(long a, long b) => a / Gcd(a, b) * b;   // divide first to avoid overflow
```

---

## LINQ

> LINQ queries are lazy: nothing runs until you enumerate them or call `ToList()` / `ToArray()`. They never modify the source — they return a new sequence.

### Aggregate

```csharp
a.Sum(); a.Max(); a.Min(); a.Average(); a.Count();
a.Count(x => x > 0);                   // count only the matches
a.Aggregate((acc, x) => acc + x);      // fold left — throws on an empty sequence
a.Aggregate(0, (acc, x) => acc + x);   // with a seed — safe when empty
```

### Filter, Project & Order

```csharp
a.Where(x => x % 2 == 0).ToArray();    // keep the matches
a.Select(x => x * x).ToList();         // transform each element
a.OrderBy(x => x % 3).ThenByDescending(x => x);   // sort by 2 keys (source is untouched)
a.OrderByDescending(x => x);
a.Distinct();                          // drop duplicates
a.Reverse();                           // returns a new sequence;
                                       // List<T>.Reverse() instead reverses in place
a.Take(3); a.Skip(2);
```

### Element, Quantify & Group

```csharp
a.First();                             // throws if the sequence is empty
a.FirstOrDefault();                    // default(T) if the sequence is empty
a.Any(x => x > 5);                     // true if at least one matches
a.All(x => x > 0);                     // true if all match (also true when empty)
a.GroupBy(x => x % 2);                 // each group exposes .Key and its items
a.ToDictionary(x => x, x => x * x);    // throws on duplicate keys
```

---

## Graph Representation

### Adjacency List

```csharp
// Best for sparse graphs — O(V + E) space
List<int>[] g = new List<int>[n];
for (int i = 0; i < n; i++) g[i] = new List<int>();   // every row must be created first
g[u].Add(v); g[v].Add(u);          // add both directions for an undirected edge
```

### Weighted Adjacency List

```csharp
List<(int to, int w)>[] wg = new List<(int, int)>[n];
for (int i = 0; i < n; i++) wg[i] = new List<(int, int)>();
wg[u].Add((v, w));
foreach (var (to, w) in wg[u]) { }     // named tuple fields keep traversals readable
```

### Adjacency Matrix

```csharp
// Best for dense graphs — O(1) edge lookup, O(V²) space
int[,] mat = new int[n, n];            // already filled with 0
mat[u, v] = 1;
```

---

## Reference Tables

### Build & Read

| Structure                 | Create                        | Add / Insert                 | Access / Peek                | Iterate                                               |
| ------------------------- | ----------------------------- | ---------------------------- | ---------------------------- | ----------------------------------------------------- |
| **Array** `T[]`           | `new T[n]` / `{1,2,3}`        | fixed size (—)               | `a[i]`                       | `foreach (var x in a)` / `for (i=0..Length)`          |
| **string**                | `"abc"` / `new string(arr)`   | — immutable (`+` → new)      | `s[i]`                       | `foreach (char c in s)` / `for (i=0..Length)`         |
| **StringBuilder**         | `new StringBuilder()`         | `Append(x)` / `Insert(i,x)`  | `sb[i]`                      | `for (i=0..Length) sb[i]` (no `foreach`)              |
| **List** `<T>`            | `new List<T>()`               | `Add(x)` / `Insert(i,x)`     | `list[i]`                    | `foreach (var x in list)` / `for (i=0..Count)`        |
| **Stack** `<T>`           | `new Stack<T>()`              | `Push(x)`                    | `Peek()` (top)               | `foreach (var x in st)` (top → bottom)                |
| **Queue** `<T>`           | `new Queue<T>()`              | `Enqueue(x)`                 | `Peek()` (front)             | `foreach (var x in q)` (front → back)                 |
| **LinkedList** `<T>`      | `new LinkedList<T>()`         | `AddFirst(x)` / `AddLast(x)` | `First.Value` / `Last.Value` | `foreach (var x in dq)` (first → last)                |
| **HashSet** `<T>`         | `new HashSet<T>()`            | `Add(x)`                     | — (no index)                 | `foreach (var x in set)` (no order)                   |
| **SortedSet** `<T>`       | `new SortedSet<T>()`          | `Add(x)`                     | `Min` / `Max`                | `foreach (var x in ss)` (ascending)                   |
| **Dictionary** `<K,V>`    | `new Dictionary<K,V>()`       | `map[k]=v` / `Add(k,v)`      | `map[k]` / `TryGetValue`     | `foreach (var kv in map)` → `kv.Key` / `kv.Value`     |
| **SortedDictionary**      | `new SortedDictionary<K,V>()` | `sd[k]=v` / `Add(k,v)`       | `sd[k]`                      | `foreach (var kv in sd)` (by key)                     |
| **PriorityQueue** `<E,P>` | `new PriorityQueue<E,P>()`    | `Enqueue(e,p)`               | `Peek()` (min)               | `foreach (var (e,p) in pq.UnorderedItems)` (no order) |

### Modify & Query

| Structure                 | Remove / Delete                   | Search / Contains                     | Count / Length | Sort                                    |
| ------------------------- | --------------------------------- | ------------------------------------- | -------------- | --------------------------------------- |
| **Array** `T[]`           | — (shift manually)                | `Array.IndexOf(a,x)` / `BinarySearch` | `a.Length`     | `Array.Sort(a)` / `Array.Reverse(a)`    |
| **string**                | `s.Remove(i,len)` (→ new)         | `Contains` / `IndexOf` / `StartsWith` | `s.Length`     | `new string(s.OrderBy(c=>c).ToArray())` |
| **StringBuilder**         | `sb.Remove(i,len)`                | — (`ToString()` first)                | `sb.Length`    | —                                       |
| **List** `<T>`            | `RemoveAt(i)` / `Remove(x)`       | `Contains(x)` / `IndexOf(x)`          | `.Count`       | `list.Sort()` / `list.Reverse()`        |
| **Stack** `<T>`           | `Pop()` / `TryPop(out x)`         | `Contains(x)`                         | `.Count`       | —                                       |
| **Queue** `<T>`           | `Dequeue()` / `TryDequeue(out x)` | `Contains(x)`                         | `.Count`       | —                                       |
| **LinkedList** `<T>`      | `RemoveFirst()` / `RemoveLast()`  | `Contains(x)`                         | `.Count`       | —                                       |
| **HashSet** `<T>`         | `Remove(x)`                       | `Contains(x)`                         | `.Count`       | — (unordered)                           |
| **SortedSet** `<T>`       | `Remove(x)`                       | `Contains(x)`                         | `.Count`       | auto-sorted (asc)                       |
| **Dictionary** `<K,V>`    | `Remove(k)`                       | `ContainsKey(k)` / `ContainsValue(v)` | `.Count`       | LINQ `OrderBy(kv=>kv.Key)`              |
| **SortedDictionary**      | `Remove(k)`                       | `ContainsKey(k)`                      | `.Count`       | auto by key                             |
| **PriorityQueue** `<E,P>` | `Dequeue()` / `TryDequeue(...)`   | — (no efficient search)               | `.Count`       | heap-ordered by priority                |

### Conversions

> **`IEnumerable<T>` sources** (all work with `foreach` and LINQ): array, `string`, `List<T>`, `HashSet<T>`, `Dictionary.Keys` / `.Values`, `Stack<T>`, `Queue<T>`, `LinkedList<T>`, `SortedSet<T>`, `SortedDictionary<K,V>`, `PriorityQueue.UnorderedItems`, LINQ queries.

```text
IEnumerable<T>
     ├──→ source.ToList()
     ├──→ source.ToArray()
     ├──→ new HashSet<T>(source)
     ├──→ new Stack<T>(source)
     └──→ new Queue<T>(source)

string     → char[]     : source.ToCharArray()
char[]     → string     : new string(source)

Dictionary → keys       : dict.Keys
Dictionary → values     : dict.Values
Dictionary → KVP list   : dict.ToList()

Anything   → Dictionary : ToDictionary(keySelector, valueSelector)
```
