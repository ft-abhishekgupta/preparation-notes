# Bit Manipulation and Math

> **Core idea:** Bit tricks give O(1) operations; XOR self-cancels pairs; bitmasks represent sets in a single integer; modular arithmetic + fast exponentiation power all counting problems.
> **Recognise it when:** "without using + or ×", "count set bits", "find the single element", "n choose k mod p", "check power of two", "generate all subsets".
> **Costs:** bit idioms O(1); sieve O(n log log n); fast-power O(log n); nCr with precomputed tables O(1) per query after O(n) build.

---

## Mental Model

Binary representation: bit k has value `2^k`, 0-indexed from LSB.
**Two's complement:** `-x = ~x + 1`. Why? Flip all bits (adds `2ⁿ - 1 - x`), add 1 → `2ⁿ - x`. In 32-bit signed arithmetic that is `-x`.
**Why `x & -x` isolates the lowest set bit:** `-x` flips all bits above the lowest 1 and flips the lowest 1 itself via +1 carry — so only the lowest bit position has both original and negated bit set.

**Signed vs unsigned in C#:**

- `int` is signed 32-bit (`-2,147,483,648` to `2,147,483,647`).
- `uint` is unsigned 32-bit (0 to `4,294,967,295`).
- **Arithmetic vs logical right shift (classic gotcha):** `>>` on a signed `int` is **arithmetic** (sign-extends — copies the sign bit). `>>` on `uint` is **logical** (fills with 0). C# 11 added `>>>` for an explicit **logical** right shift on signed types. Before C# 11: cast to `uint` first.

```csharp
int x = -1;            // all 1s
int y = x >> 1;        // -1  (arithmetic shift — sign extended)
int z = (int)((uint)x >> 1);   // int.MaxValue (logical shift, pre-C# 11)
int w = x >>> 1;       // int.MaxValue (logical shift, C# 11+)
```

---

## Complexity Reference

| Operation | Time | Space | Notes |
| --------- | ---- | ----- | ----- |
| Bit idiom (set/clear/toggle) | O(1) | O(1) | |
| Popcount (hardware) | O(1) | O(1) | `BitOperations.PopCount` |
| Popcount (loop) | O(log n) | O(1) | `x &= x-1` loop |
| Reverse 32 bits | O(32) | O(1) | Fixed loop |
| Fast exponentiation | O(log e) | O(1) | e = exponent |
| GCD (Euclid) | O(log min(a,b)) | O(1) | |
| Sieve of Eratosthenes | O(n log log n) | O(n) | |
| Segmented sieve | O(√R + (R−L)) | O(√R) | primes in [L,R] |
| Primality (trial division) | O(√n) | O(1) | |
| Enumerate all subsets | O(2ⁿ · n) | O(n) | n ≤ 20 feasible |
| Enumerate submasks of mask | O(3ⁿ) total | O(1) | sum over all masks |
| nCr precompute | O(n) build, O(1) query | O(n) | with inverse factorials |

---

## Templates

### Bit Operation Table

| Operation | Expression | Example (`x = 0b1010 = 10`) |
| --------- | ---------- | --------------------------- |
| Set bit k | `x \| (1<<k)` | Set bit 0 → `11` |
| Clear bit k | `x & ~(1<<k)` | Clear bit 3 → `2` |
| Toggle bit k | `x ^ (1<<k)` | Toggle bit 1 → `8` |
| Check bit k | `(x >> k) & 1` | Bit 1 → `1` (set) |
| Lowest set bit | `x & -x` | → `2` |
| Clear lowest set bit | `x & (x-1)` | → `8` |
| Is power of two | `x > 0 && (x & (x-1)) == 0` | `8` ✅ `10` ❌ |
| Count set bits | `BitOperations.PopCount((uint)x)` | → `2` |
| Sign of integer | `x >> 31` | Negative: `-1`; non-neg: `0` |
| Swap without temp | `a^=b; b^=a; a^=b` | Swaps `a` and `b` |

### Core Bit Idioms

```csharp
// x & (x-1): clears lowest set bit — count set bits, check power of 2
int Popcount(int x) { int c = 0; while (x != 0) { x &= x - 1; c++; } return c; }

// x & -x: isolates lowest set bit — Fenwick tree, split on differing bit
int lowestBit = x & -x;

// Check if power of 2  (x=0 is NOT a power of 2)
bool IsPow2(int x) => x > 0 && (x & (x - 1)) == 0;

// Next power of 2 >= n  — integer bit-twiddling (float-precise, no Math.Pow)
// Use BitOperations.RoundUpToPowerOf2 (.NET 6+) — preferred:
uint NextPow2(uint n) => BitOperations.RoundUpToPowerOf2(n);
// Manual equivalent for 32-bit:
int NextPow2Manual(int n)
{
    if (n <= 1) return 1;
    n--;
    n |= n >> 1; n |= n >> 2; n |= n >> 4; n |= n >> 8; n |= n >> 16;
    return n + 1;
}

// Reverse 32 bits  — O(32)
uint ReverseBits(uint n)
{
    uint result = 0;
    for (int i = 0; i < 32; i++) { result = (result << 1) | (n & 1); n >>= 1; }
    return result;
}
```

> **Why `Math.Pow`/`Math.Log2` version is wrong:** floating-point rounding makes `Math.Log2(1 << 29)` return `28.999...` on some runtimes → `Ceiling` gives wrong answer. Always use the integer bit-twiddling version.

### XOR Family

**Three properties:** self-inverse (`a ^ a = 0`), identity (`a ^ 0 = a`), commutative + associative.

```csharp
// Single Number I — XOR all; pairs cancel  O(n) / O(1)
int SingleNumber(int[] nums) => nums.Aggregate(0, (acc, x) => acc ^ x);

// Missing Number — XOR indices 0..n with all values  O(n) / O(1)
int MissingNumber(int[] nums)
{
    int xor = nums.Length;
    for (int i = 0; i < nums.Length; i++) xor ^= i ^ nums[i];
    return xor;
}

// Single Number II — every element appears 3× except one  O(n) / O(1)
// Track bits mod 3 with two bitmasks (ones, twos)
int SingleNumberII(int[] nums)
{
    int ones = 0, twos = 0;
    foreach (int x in nums)
    {
        ones = (ones ^ x) & ~twos;
        twos = (twos ^ x) & ~ones;
    }
    return ones;
}

// Single Number III — two unique numbers  O(n) / O(1)
int[] SingleNumberIII(int[] nums)
{
    int diff = nums.Aggregate(0, (acc, x) => acc ^ x); // diff = a ^ b
    int bit = diff & -diff;                              // any set bit that differs
    int a = 0;
    foreach (int x in nums)
        if ((x & bit) != 0) a ^= x;
    return new[] { a, diff ^ a };
}
```

**XOR prefix trick** — `xorRange(l, r) = pre[r] ^ pre[l-1]` where `pre[i] = nums[0] ^ ... ^ nums[i]`. Powers range-XOR queries in O(1) after O(n) build.

**XOR of 1..n closed form** (mod-4 pattern):

```text
n % 4 == 0  →  n
n % 4 == 1  →  1
n % 4 == 2  →  n + 1
n % 4 == 3  →  0
```

```csharp
int XorUpTo(int n) => (n % 4) switch { 0 => n, 1 => 1, 2 => n + 1, _ => 0 };
int XorRange(int l, int r) => XorUpTo(r) ^ XorUpTo(l - 1);
```

### Bitmask as a Set

```csharp
// Enumerate all 2ⁿ subsets  O(2ⁿ · n)  (n ≤ 20)
for (int mask = 0; mask < (1 << n); mask++)
{
    for (int i = 0; i < n; i++)
        if ((mask & (1 << i)) != 0) { /* element i is in this subset */ }
}

// Iterate only the set bits of a mask  O(popcount)
for (int m = mask; m != 0; m &= m - 1)
{
    int bit = m & -m;           // lowest set bit
    int idx = BitOperations.TrailingZeroCount((uint)bit);
}

// Enumerate ALL submasks of a given mask  O(2^popcount)
// Over all masks this is O(3ⁿ) total — the standard bitmask-DP loop
for (int sub = mask; sub > 0; sub = (sub - 1) & mask)
{
    // process sub (a subset of mask's set bits)
}
// Note: the loop stops before processing sub == 0; add explicit check if needed.

// Popcount-based grouping — group elements by number of set bits
var groups = new List<int>[n + 1];
for (int mask = 0; mask < (1 << n); mask++)
    groups[BitOperations.PopCount((uint)mask)].Add(mask);
```

> **Bitmask DP** (e.g., TSP, shortest Hamiltonian path) is owned by [Dynamic Programming](../DynamicProgramming/DynamicProgramming.md). The subset enumeration above is the iteration primitive that powers it.

### .NET `BitOperations` and `BitArray`

```csharp
using System.Numerics;

int setBits   = BitOperations.PopCount((uint)x);           // hardware popcount
int trailing  = BitOperations.TrailingZeroCount((uint)x);  // index of lowest set bit
int leading   = BitOperations.LeadingZeroCount((uint)x);   // 31 - floor(log2(x))
int log2      = BitOperations.Log2((uint)x);               // floor(log2(x)), x > 0
uint next2    = BitOperations.RoundUpToPowerOf2((uint)x);  // .NET 6+

// Convert to binary string for debugging
string bin = Convert.ToString(x, 2).PadLeft(32, '0');

// BitArray — large bit vectors, set operations
var ba = new BitArray(1000);
ba[42] = true;
var ba2 = new BitArray(1000);
ba.And(ba2);  ba.Or(ba2);  ba.Xor(ba2);  ba.Not();
```

---

## Modular Arithmetic

**Why mod?** Results explode; the problem asks for "mod 10⁹+7". Take mod at each step — after every multiplication.
**Subtraction trap:** `(a - b) % MOD` can be negative in C#. Always write `(a - b + MOD) % MOD`.

```csharp
const long MOD = 1_000_000_007;

// Fast exponentiation: bVal^exp mod m  — O(log exp)
long Power(long bVal, long exp, long mod)
{
    long result = 1;
    bVal %= mod;
    while (exp > 0)
    {
        if ((exp & 1) == 1) result = result * bVal % mod;
        bVal = bVal * bVal % mod;
        exp >>= 1;
    }
    return result;
}

// Modular inverse via Fermat's little theorem  (mod must be prime)
long ModInverse(long a, long mod) => Power(a, mod - 2, mod);

// Extended Euclidean — works for any mod (not just prime)
// Returns (gcd, x, y) such that a*x + b*y = gcd
(long gcd, long x, long y) ExtGcd(long a, long b)
{
    if (b == 0) return (a, 1, 0);
    var (g, x1, y1) = ExtGcd(b, a % b);
    return (g, y1, x1 - (a / b) * y1);
}
long ModInverseExt(long a, long mod)
{
    var (g, x, _) = ExtGcd(a % mod, mod);
    if (g != 1) throw new Exception("No inverse — gcd != 1");
    return (x % mod + mod) % mod;
}
```

### Precomputed nCr (preferred for many queries)

```csharp
// Precompute factorials and inverse factorials mod p  — O(n) build, O(1) query
long[] fact, inv;
void PrepareCombinatorics(int n, long mod)
{
    fact = new long[n + 1];
    inv  = new long[n + 1];
    fact[0] = 1;
    for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % mod;
    inv[n] = Power(fact[n], mod - 2, mod);
    for (int i = n - 1; i >= 0; i--) inv[i] = inv[i + 1] * (i + 1) % mod;
}
long NCR(int n, int r) => (r < 0 || r > n) ? 0 : fact[n] * inv[r] % MOD * inv[n - r] % MOD;

// Ad-hoc nCr (no precompute needed for single call)
long NCRSingle(int n, int r, long mod)
{
    if (r > n) return 0;
    long num = 1, den = 1;
    for (int i = 0; i < r; i++)
    {
        num = num * (n - i) % mod;
        den = den * (i + 1) % mod;
    }
    return num * ModInverse(den, mod) % mod;
}
```

---

## Number Theory

### GCD / LCM

```csharp
// Iterative Euclid  — O(log min(a,b))
int GCD(int a, int b) { while (b != 0) { (a, b) = (b, a % b); } return a; }
long GCD(long a, long b) { while (b != 0) { (a, b) = (b, a % b); } return a; }

// LCM — divide first to avoid overflow; use long overload
long LCM(long a, long b) => a / GCD(a, b) * b;
```

> **Overflow trap:** `long LCM(long a, long b) => a / GCD((int)a, (int)b) * b` casts `long` → `int` and truncates silently. Always use the `long` GCD overload.

### Sieve of Eratosthenes

```csharp
// All primes up to limit  — O(n log log n) / O(n)
bool[] Sieve(int limit)
{
    var isPrime = new bool[limit + 1];
    Array.Fill(isPrime, true);
    isPrime[0] = isPrime[1] = false;
    for (int i = 2; (long)i * i <= limit; i++)
        if (isPrime[i])
            for (int j = i * i; j <= limit; j += i)
                isPrime[j] = false;
    return isPrime;
}
```

**Segmented sieve** — primes in `[L, R]` when R is huge but `R − L` is small:
Sieve up to `√R`, then mark multiples of each prime p in the segment `[L, R]`. Memory: O(√R + (R−L)).

**Linear sieve** — O(n) with `smallestPrimeFactor` array; enables O(log n) factorisation of any number.

### Primality and Factorisation

```csharp
// Trial division to √n  — O(√n)
bool IsPrime(long n)
{
    if (n < 2) return false;
    for (long d = 2; d * d <= n; d++)
        if (n % d == 0) return false;
    return true;
}

// Prime factorisation  — O(√n)
List<(long prime, int exp)> Factorise(long n)
{
    var factors = new List<(long, int)>();
    for (long d = 2; d * d <= n; d++)
    {
        if (n % d != 0) continue;
        int exp = 0;
        while (n % d == 0) { n /= d; exp++; }
        factors.Add((d, exp));
    }
    if (n > 1) factors.Add((n, 1));
    return factors;
}

// Number of divisors from factorisation: ∏(eᵢ + 1)
int DivisorCount(long n)
{
    int count = 1;
    foreach (var (_, e) in Factorise(n)) count *= e + 1;
    return count;
}
```

**Euler's totient φ(n)** — count of integers in `[1, n]` coprime to n.
`φ(n) = n · ∏(1 − 1/p)` for each prime p dividing n. Used in Fermat's little theorem proof.

**Miller-Rabin** — probabilistic primality test, O(k log² n). Required when n up to 10¹⁸. Deterministic for ≤ 3.2 × 10¹⁸ using bases `{2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}`.

---

## Combinatorics

### Pascal's Triangle

```csharp
// C[i][j] = C[i-1][j-1] + C[i-1][j]  — O(n²) build
int[][] Pascal(int n)
{
    int[][] C = new int[n + 1][];
    for (int i = 0; i <= n; i++)
    {
        C[i] = new int[i + 1];
        C[i][0] = C[i][i] = 1;
        for (int j = 1; j < i; j++) C[i][j] = C[i - 1][j - 1] + C[i - 1][j];
    }
    return C;
}
```

### Catalan Numbers

`Cₙ = C(2n, n) / (n + 1)`. Sequence: 1, 1, 2, 5, 14, 42, 132 …

**What Catalan numbers count:**

- Valid bracket sequences of length 2n
- BSTs with n nodes
- Triangulations of a convex (n+2)-gon
- Monotonic lattice paths from (0,0) to (n,n) that don't cross the diagonal
- Full binary trees with n+1 leaves

### Stars and Bars

Ways to put k indistinguishable balls into n distinct bins: `C(n+k-1, k)`.

### Inclusion-Exclusion

`|A ∪ B ∪ C| = |A| + |B| + |C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C|`.
General: alternate signs over all non-empty subsets.

### Pigeonhole Principle

If n+1 items fit into n bins, some bin has ≥ 2 items. Often used to prove existence of duplicates or repeated states.

---

## Overflow Handling

| Scenario | Safe pattern | Danger |
| -------- | ------------ | ------ |
| `int` product | `(long)a * b` | Silent overflow if both `int` |
| Binary-search mid | `lo + (hi - lo) / 2` | `(lo + hi) / 2` wraps |
| `int.MinValue` negation | Widen to `long` first | `-int.MinValue` overflows (same value) |
| `Math.Abs(int.MinValue)` | Use `Math.Abs((long)x)` | Throws `OverflowException` |
| Checked block | `checked { ... }` | Throws on overflow — use in tests |
| `long` product of two `long` | Use `Math.BigMul` or mod before multiply | No 128-bit native int |

```csharp
// Classic mid trap
int mid = lo + (hi - lo) / 2;  // ✅
// int mid = (lo + hi) / 2;    // ❌ overflows when lo+hi > int.MaxValue

// int.MinValue trap
int n = int.MinValue;
long safe = -(long)n;   // ✅  → 2147483648
// int bad = -n;        // ❌  → int.MinValue (overflow, same bit pattern)

// Two long multiply
long product = (long)a * b % MOD;   // ✅  — cast before multiply
```

---

## Numeric Conversions and Digit Manipulation

```csharp
// Digit extraction
int digitSum = 0;
int tmp = Math.Abs(n);
while (tmp > 0) { digitSum += tmp % 10; tmp /= 10; }

// Reverse integer with overflow detection
int ReverseInt(int x)
{
    long rev = 0;
    while (x != 0) { rev = rev * 10 + x % 10; x /= 10; }
    return (rev < int.MinValue || rev > int.MaxValue) ? 0 : (int)rev;
}

// Base conversion: decimal → base b
string ToBase(int n, int b)
{
    if (n == 0) return "0";
    var sb = new System.Text.StringBuilder();
    bool neg = n < 0; n = Math.Abs(n);
    while (n > 0) { sb.Append("0123456789ABCDEF"[n % b]); n /= b; }
    if (neg) sb.Append('-');
    return new string(sb.ToString().Reverse().ToArray());
}

// Binary string for debugging
string bin = Convert.ToString(x, 2).PadLeft(32, '0');
```

---

## Geometry Basics (Interview Level)

```csharp
// Cross product of vectors (b-a) and (c-a)
// > 0: c is to the LEFT of a→b
// < 0: c is to the RIGHT
// = 0: collinear
long Cross(long ax, long ay, long bx, long by, long cx, long cy)
    => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);

// Area of polygon via shoelace formula  — O(n)
double PolygonArea(int[] xs, int[] ys)
{
    int n = xs.Length;
    long area = 0;
    for (int i = 0, j = n - 1; i < n; j = i++)
        area += (long)xs[j] * ys[i] - (long)xs[i] * ys[j];
    return Math.Abs(area) / 2.0;
}

// Compare distances without sqrt — use squared distances
bool Closer(int ax, int ay, int bx, int by, int cx, int cy)
{
    long da = (long)(ax - cx) * (ax - cx) + (long)(ay - cy) * (ay - cy);
    long db = (long)(bx - cx) * (bx - cx) + (long)(by - cy) * (by - cy);
    return da < db;  // a is closer to c than b is
}
```

**Orientation table:**

| Cross product sign | Meaning |
| ------------------ | ------- |
| > 0 | Counter-clockwise (left turn) |
| < 0 | Clockwise (right turn) |
| 0 | Collinear |

**Line intersection:** compute cross products of each segment's endpoints vs the other segment; segments intersect iff signs differ on each side (handle collinear as special case).

---

## Randomised Algorithms

### Reservoir Sampling

Select k items uniformly at random from a stream of unknown length n.

```csharp
// O(n) time, O(k) space
int[] ReservoirSample(IEnumerable<int> stream, int k, Random rng)
{
    int[] res = new int[k];
    int i = 0;
    foreach (int item in stream)
    {
        if (i < k) { res[i] = item; }
        else
        {
            int j = rng.Next(i + 1);   // uniform in [0, i]
            if (j < k) res[j] = item;
        }
        i++;
    }
    return res;
}
```

> **Why it works:** by induction — after seeing i+1 items, each item has been in the reservoir with probability k/(i+1). When item i+1 arrives, it is chosen with prob k/(i+1); each existing item is displaced with prob (k/(i+1)) · (1/k) = 1/(i+1), surviving with prob i/(i+1). So each item ends up with probability k/(i+1) · (i+1)/n = k/n. ✓

### Weighted Random and Fisher-Yates

```csharp
// Weighted random pick  — O(n) build, O(log n) pick
int WeightedPick(int[] weights, Random rng)
{
    int[] prefix = new int[weights.Length + 1];
    for (int i = 0; i < weights.Length; i++) prefix[i + 1] = prefix[i] + weights[i];
    int target = rng.Next(1, prefix[^1] + 1);
    int lo = 1, hi = prefix.Length - 1;
    while (lo < hi) { int mid = lo + (hi - lo) / 2; if (prefix[mid] < target) lo = mid + 1; else hi = mid; }
    return lo - 1;
}

// Fisher-Yates shuffle  — O(n), unbiased
void Shuffle(int[] arr, Random rng)
{
    for (int i = arr.Length - 1; i > 0; i--)
    {
        int j = rng.Next(i + 1);  // ← range MUST be [0, i], not [0, n-1]
        (arr[i], arr[j]) = (arr[j], arr[i]);
    }
}
// WRONG shuffle: j = rng.Next(arr.Length) — creates 3ⁿ equally likely outcomes for n!
// permutations, so most permutations are never generated or generated more often.
```

---

## Bit Operations vs Arithmetic

| Task | Bit operation | Arithmetic | Notes |
| ---- | ------------- | ---------- | ----- |
| Multiply by 2^k | `x << k` | `x * (1<<k)` | Equivalent; compiler optimises anyway |
| Divide by 2^k | `x >> k` (unsigned) | `x / (1<<k)` | **Arithmetic shift sign-extends** for negative — use `>>>` or cast to `uint` |
| Modulo power of 2 | `x & (m-1)` | `x % m` | Only valid when m is a power of 2 |
| Check even/odd | `(x & 1) == 0` | `x % 2 == 0` | Equivalent in practice |
| Absolute value | `Math.Abs(x)` | `Math.Abs(x)` | Bit version `(x^(x>>31))-(x>>31)` is a curiosity; **use `Math.Abs`** |
| **Popcount** | `BitOperations.PopCount` | Loop + `&= x-1` | **Hardware O(1)** vs O(log n) loop |

---

## Pattern Recognition

| Problem says… | Reach for | Complexity |
| ------------- | --------- | ---------- |
| "without + or ×" | XOR + carry loop (`Sum of Two Integers`) | O(1) |
| "find the single/missing element" | XOR all elements | O(n) / O(1) |
| "every element appears k× except one" | Bit counters mod k (`ones/twos`) | O(n) / O(1) |
| "check/count subsets of size n≤20" | Bitmask enumeration | O(2ⁿ·n) |
| "number of ways mod p" | Precomputed factorials + mod inverse | O(n) build |
| "repeated squaring / fast power" | Binary exponentiation | O(log n) |
| "count primes up to n" | Sieve of Eratosthenes | O(n log log n) |
| "XOR over a range [l,r]" | XOR prefix array or closed-form XorUpTo | O(1) |
| "maximum XOR of two numbers" | Binary trie → see [Tries and String Matching](../TriesAndStringMatching/TriesAndStringMatching.md) | O(n·32) |
| "enumerate all sub-states" (DP) | Submask loop `s=(s-1)&mask` → see [Dynamic Programming](../DynamicProgramming/DynamicProgramming.md) | O(3ⁿ) |
| "k-th permutation / nCr mod p" | Precomputed factorials, Lucas' theorem | O(n) |
| "geometric orientation / area" | Cross product / shoelace | O(n) |
| "random pick from stream" | Reservoir sampling | O(n) / O(k) |

---

## Variants and Differences

| Technique | When to use | Gotcha |
| --------- | ----------- | ------ |
| XOR swap | Curiosity / interview trick | Fails when `a` and `b` alias the same memory location |
| Arithmetic right shift (`>>`) | Signed divide by 2^k | **Sign-extends** — wrong for logical shift |
| Logical right shift (`>>>`) | Unsigned divide, bit patterns | C# 11+ only; before that cast to `uint` |
| `x & (x-1)` | Remove lowest set bit, count bits | Breaks at `x = 0` (avoid calling when x=0) |
| `x & -x` | Isolate lowest set bit | Relies on two's complement — works for `int` and `long` in C# |
| Fermat inverse | Single modular inverse, prime mod | **Fails when mod is not prime** — use extended Euclid |
| Extended Euclid | Any coprime (a, mod) | Slightly more complex but universally correct |

---

## Pitfalls

- **`base` is a C# reserved keyword** — never name a parameter `base`. Use `bVal`, `b`, or `baseVal`.
- **`long LCM` with `int` GCD cast** — `a / GCD((int)a, (int)b)` truncates `long` → `int` silently. Use `long GCD(long, long)`.
- **`Math.Pow`/`Math.Log2` for `NextPow2`** — float rounding gives wrong answer for large n. Use `BitOperations.RoundUpToPowerOf2` or the integer bit-twiddling version.
- **Arithmetic right shift on signed int** — `n >> k` sign-extends; use `n >>> k` (C# 11+) or `(int)((uint)n >> k)` for logical shift.
- **`(a - b) % MOD` is negative in C#** — always write `(a - b + MOD) % MOD`.
- **`-int.MinValue` overflows** — `-int.MinValue == int.MinValue`. Widen to `long` before negating.
- **`Math.Abs(int.MinValue)` throws** — use `Math.Abs((long)int.MinValue)` or check first.
- **`mid = (lo + hi) / 2` overflow** — use `lo + (hi - lo) / 2`.
- **Submask loop termination** — `for (int s = mask; s > 0; s = (s-1) & mask)` never processes `s = 0`. Add explicit `s = 0` case if the empty subset matters.
- **`IsPow2(0)` returns false** — correct, but `x > 0` guard is essential (without it, `0 & -1 == 0` passes).
- **XOR swap with same variable** — `a ^= b; b ^= a; a ^= b` zeroes both when `a` and `b` are the same reference.

---

## Practice

→ See [Problems.md](Problems.md) for full worked solutions.

| LeetCode | Problem | Pattern |
| -------- | ------- | ------- |
| 136 | Single Number | XOR |
| 137 | Single Number II | Bit counters mod k |
| 260 | Single Number III | XOR + split on bit |
| 268 | Missing Number | XOR / math |
| 191 | Number of 1 Bits | Popcount |
| 338 | Counting Bits | DP + bit |
| 190 | Reverse Bits | Bit loop |
| 231 | Power of Two | `x & (x-1)` |
| 371 | Sum of Two Integers | XOR + carry |
| 29 | Divide Two Integers | Bit shift |
| 201 | Bitwise AND of Numbers Range | Common prefix |
| 78 | Subsets | Bitmask enumeration |
| 421 | Maximum XOR | Binary trie |
| 50 | Pow(x, n) | Fast exponentiation |
| 69 | Sqrt(x) | Binary search |
| 204 | Count Primes | Sieve |
| 172 | Factorial Trailing Zeroes | Factor of 5 |
| 7 | Reverse Integer | Overflow detection |
| 528 | Random Pick with Weight | Prefix sum + binary search |
| 384 | Shuffle an Array | Fisher-Yates |
| 382 | Linked List Random Node | Reservoir sampling |
