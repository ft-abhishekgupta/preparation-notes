# 14. Bit Manipulation and Math

> **TL;DR:** Bit tricks give O(1) operations that look magical in interviews. Know the 10 core idioms, XOR patterns, modular arithmetic, and sieve — they cover 95% of what's tested.

**Interview weight:** P1 — bit manipulation appears in ~20% of coding rounds; modular arithmetic and combinatorics are required for any counting/probability problem.

---

## Core Concepts

- **Bit position** — 0-indexed from LSB (rightmost). Bit k has value `2^k`.
- **Two's complement** — `-x = ~x + 1`. Explains why `x & -x` isolates lowest set bit.
- **Overflow** — C# `int` is 32-bit signed; use `long` or `checked` keyword to catch overflow.
- **Modular arithmetic** — all operations can overflow; take mod at each step.
- **`BitOperations`** — `System.Numerics.BitOperations` in .NET 3.0+; hardware-accelerated popcount, leading/trailing zeros.

---

## Bit Operations Table

| Operation                 | Expression                        | Example (x=0b1010=10)    |
| ------------------------- | --------------------------------- | ------------------------ |
| Set bit k                 | `x \| (1<<k)`                     | Set bit 0 → 0b1011=11    |
| Clear bit k               | `x & ~(1<<k)`                     | Clear bit 3 → 0b0010=2   |
| Toggle bit k              | `x ^ (1<<k)`                      | Toggle bit 1 → 0b1000=8  |
| Check bit k               | `(x >> k) & 1`                    | Check bit 1 → 1 (set)    |
| Lowest set bit            | `x & -x`                          | → 0b0010=2               |
| Clear lowest set bit      | `x & (x-1)`                       | → 0b1000=8               |
| Is power of two           | `x > 0 && (x & (x-1)) == 0`       | 8: yes; 10: no           |
| Count set bits (popcount) | `BitOperations.PopCount((uint)x)` | 10 → 2                   |
| Sign of integer           | `x >> 31`                         | Negative: -1; non-neg: 0 |
| Swap without temp         | `a^=b; b^=a; a^=b`                | Swaps a and b            |

---

## Core Idioms

```csharp
// x & (x-1): removes lowest set bit — count set bits, check power of 2
int Popcount(int x) { int c = 0; while (x != 0) { x &= x-1; c++; } return c; }

// x & -x: isolates lowest set bit — used in Fenwick tree
int lowestBit = x & -x;

// Check if power of 2
bool IsPow2(int x) => x > 0 && (x & (x-1)) == 0;

// Next power of 2 >= n
int NextPow2(int n) => (int)Math.Pow(2, Math.Ceiling(Math.Log2(n)));
// Or: BitOperations.RoundUpToPowerOf2((uint)n)  (.NET 6+)

// Reverse bits
uint ReverseBits(uint n)
{
    uint result = 0;
    for (int i = 0; i < 32; i++) { result = (result << 1) | (n & 1); n >>= 1; }
    return result;
}
```

---

## XOR Tricks

XOR is its own inverse: `a ^ a = 0`, `a ^ 0 = a`.

```csharp
// Single Number I (LeetCode 136): XOR all — pairs cancel
int SingleNumber(int[] nums) => nums.Aggregate(0, (acc, x) => acc ^ x);

// Missing Number (LeetCode 268): XOR indices 0..n with all nums
int MissingNumber(int[] nums)
{
    int xor = nums.Length;
    for (int i = 0; i < nums.Length; i++) xor ^= i ^ nums[i];
    return xor;
}
```

**Single Number II (LeetCode 137) — appears 3× except one:**
Use `ones` and `twos` counters tracking bits mod 3.

**Single Number III (LeetCode 260) — two unique numbers:**
XOR all → `diff = a^b`. Find any set bit in `diff`. Partition nums into two groups by that bit; XOR each group → get `a` and `b`.

---

## Subset Generation via Bitmask

```csharp
// All subsets of nums
for (int mask = 0; mask < (1 << nums.Length); mask++)
{
    var subset = new List<int>();
    for (int i = 0; i < nums.Length; i++)
        if ((mask & (1 << i)) != 0) subset.Add(nums[i]);
    // process subset
}
// O(2^n * n). Feasible for n <= 20.
```

---

## .NET `BitArray` and `BitOperations`

```csharp
using System.Numerics;

// Hardware popcount (much faster than manual loop)
int setBits = BitOperations.PopCount((uint)x);

// Trailing zeros (isolate LSB position)
int trailingZeros = BitOperations.TrailingZeroCount((uint)x);

// Leading zeros
int leadingZeros = BitOperations.LeadingZeroCount((uint)x);

// BitArray for large bit vectors
var ba = new BitArray(1000);
ba[42] = true;
bool isSet = ba[42];
```

---

## Modular Arithmetic

```csharp
const int MOD = 1_000_000_007;

// Fast exponentiation: a^b mod m in O(log b)
long Power(long base, long exp, long mod)
{
    long result = 1; base %= mod;
    while (exp > 0)
    {
        if ((exp & 1) == 1) result = result * base % mod;
        base = base * base % mod;
        exp >>= 1;
    }
    return result;
}

// Modular inverse (Fermat's little theorem; mod must be prime)
long ModInverse(long a, long mod) => Power(a, mod - 2, mod);

// nCr mod p
long NCR(int n, int r, long mod)
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

## GCD / LCM / Euclid

```csharp
int GCD(int a, int b) => b == 0 ? a : GCD(b, a % b);
long LCM(long a, long b) => a / GCD((int)a, (int)b) * b; // divide first to avoid overflow
```

Iterative Euclid: `while(b != 0) { (a, b) = (b, a % b); }`. O(log(min(a,b))).

---

## Sieve of Eratosthenes

```csharp
bool[] SieveOfEratosthenes(int limit)
{
    var isPrime = new bool[limit + 1]; Array.Fill(isPrime, true);
    isPrime[0] = isPrime[1] = false;
    for (int i = 2; i * i <= limit; i++)
        if (isPrime[i])
            for (int j = i * i; j <= limit; j += i)
                isPrime[j] = false;
    return isPrime;
}
```

Time: O(n log log n). Space: O(n). Finds all primes up to n.

**Segmented sieve** — for primes in `[L, R]` where R is huge but R-L is small: sieve up to √R, then mark multiples in `[L, R]` segment. Reduces memory to O(√R + (R-L)).

### Primality Test (single number)

Trial division up to √n: O(√n). For very large numbers use Miller-Rabin probabilistic test.

---

## Combinatorics

- **nCr mod p**: precompute factorials and inverse factorials mod p.
- **Pascal's triangle**: `C[i][j] = C[i-1][j-1] + C[i-1][j]`. O(n²) precompute.
- **Catalan number**: `C_n = C(2n,n)/(n+1)`. Counts valid bracket sequences, BSTs with n nodes, paths in grid not crossing diagonal.

---

## Probability Basics

- **Reservoir sampling** — select k items uniformly from a stream of unknown size n. Keep first k; for item i (i > k), with probability k/i, replace a random element. O(n) time, O(k) space.
- **Random with weights** — prefix sum of weights + binary search into it. For n categories: O(n) build, O(log n) sample.
- **Expected value of XOR** — linearity of expectation; compute per-bit probability independently.

---

## Overflow Handling

```csharp
// Use long for intermediate products
long result = (long)a * b; // a,b are int; product may exceed int.MaxValue

// Checked arithmetic (throws OverflowException)
checked { int x = int.MaxValue + 1; } // throws

// Avoid in binary search
int mid = lo + (hi - lo) / 2; // NOT (lo + hi) / 2
```

---

## Geometry Basics (Interview Level)

- **Cross product** `(b-a) × (c-a)`: positive = c left of a→b, negative = right, 0 = collinear.
- **Point in rectangle**: `x1 <= px <= x2 && y1 <= py <= y2`.
- **Distance squared**: avoid `Math.Sqrt` for comparisons — use `dx*dx + dy*dy`.
- **GCD for reducing fractions** (LeetCode 149: Max Points on a Line).

---

## Comparison: Bit Operations vs Equivalent Arithmetic

| Task              | Bit operation             | Arithmetic    | Notes                                                        |
| ----------------- | ------------------------- | ------------- | ------------------------------------------------------------ |
| Multiply by 2^k   | `x << k`                  | `x * (1<<k)`  | Equivalent; compiler does it anyway                          |
| Divide by 2^k     | `x >> k`                  | `x / (1<<k)`  | Works only for non-negative; sign-extends for negative in C# |
| Modulo power of 2 | `x & (m-1)`               | `x % m`       | Only when m is power of 2                                    |
| Check even/odd    | `(x & 1) == 0`            | `x % 2 == 0`  | Equivalent in practice                                       |
| Absolute value    | `(x ^ (x>>31)) - (x>>31)` | `Math.Abs(x)` | Use `Math.Abs`; bit version is a curiosity                   |
| Popcount          | `BitOperations.PopCount`  | Loop + mod    | Hardware is O(1), loop is O(log n)                           |

---
