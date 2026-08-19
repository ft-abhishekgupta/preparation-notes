# C# For Coding Round

## 2. Primitives, Casting & Parsing

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

# Part 4 — Utilities

## 14. LINQ (handy one-liners)

```csharp

Enumerable.Range(0, n).ToArray();      // [0..n-1]
Enumerable.Repeat(0, n).ToArray();     // n zeros
```

---

# Part 5 —

## 16. Operations Cheat Sheet (syntax in one place)

**Notes**

- Most collections implement `IEnumerable`, so `foreach` works directly; use an index `for` loop only for `Array`, `List`, `string`, and `StringBuilder`.
- `Clear()` empties `List`, `HashSet`, `Dictionary`, `Stack`, `Queue`; for arrays use `Array.Clear(a, 0, a.Length)`; for `StringBuilder` set `sb.Length = 0`.
- Custom order: pass `Comparer<T>.Create((a,b)=>…)` to `Sort`, `SortedSet`, `SortedDictionary`, or `PriorityQueue`.
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
