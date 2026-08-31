# Bit Manipulation and Math — Problems

| # | Problem | LeetCode | Pattern | Difficulty |
| - | ------- | -------- | ------- | ---------- |
| 1 | Single Number | 136 | XOR | Easy |
| 2 | Single Number II | 137 | Bit counters mod k | Medium |
| 3 | Single Number III | 260 | XOR + split on bit | Medium |
| 4 | Missing Number | 268 | XOR / math | Easy |
| 5 | Number of 1 Bits | 191 | Popcount | Easy |
| 6 | Counting Bits | 338 | DP + bit | Easy |
| 7 | Reverse Bits | 190 | Bit loop | Easy |
| 8 | Power of Two | 231 | `x & (x-1)` | Easy |
| 9 | Power of Four | 342 | Bit pattern | Easy |
| 10 | Sum of Two Integers | 371 | XOR + carry | Medium |
| 11 | Divide Two Integers | 29 | Bit shift | Medium |
| 12 | Bitwise AND of Numbers Range | 201 | Common prefix | Medium |
| 13 | Subsets | 78 | Bitmask enumeration | Medium |
| 14 | Maximum XOR of Two Numbers in an Array | 421 | Binary trie | Medium |
| 15 | Pow(x, n) | 50 | Fast exponentiation | Medium |
| 16 | Sqrt(x) | 69 | Binary search | Easy |
| 17 | Excel Sheet Column Number | 171 | Base-26 decode | Easy |
| 18 | Excel Sheet Column Title | 168 | Base-26 encode | Easy |
| 19 | Happy Number | 202 | Floyd cycle on digits | Easy |
| 20 | Count Primes | 204 | Sieve | Medium |
| 21 | Factorial Trailing Zeroes | 172 | Factor of 5 | Medium |
| 22 | Ugly Number | 263 | Trial division | Easy |
| 23 | Reverse Integer | 7 | Overflow detection | Medium |
| 24 | Add Binary | 67 | Carry simulation | Easy |
| 25 | Plus One | 66 | Carry propagation | Easy |
| 26 | GCD and LCM | — | Euclid | Reference |
| 27 | Random Pick with Weight | 528 | Prefix sum + binary search | Medium |
| 28 | Shuffle an Array | 384 | Fisher-Yates | Medium |
| 29 | Linked List Random Node | 382 | Reservoir sampling | Medium |

---

## XOR Tricks

### Single Number — LeetCode 136

Every element appears exactly twice except for one. Find that single one.

**Example:** `nums = [4, 1, 2, 1, 2]` → `4`

```text
BRUTE FORCE | O(n²) | O(1)

For each element, count its occurrences and return the one with count 1.

------------------------------------------------------------------------------

HASH MAP | O(n) | O(n)

Count frequency of each element; return the one with frequency 1.

------------------------------------------------------------------------------

OPTIMAL — XOR ALL | O(n) | O(1)

XOR of a number with itself is 0; XOR with 0 is the number itself.
XOR all elements → all duplicates cancel → result is the unique element.
```

```csharp
public int SingleNumber(int[] nums) => nums.Aggregate(0, (acc, x) => acc ^ x);
```

> **Key insight:** XOR is self-inverse — pairs cancel, leaving only the unique element.

---

### Single Number II — LeetCode 137

Every element appears exactly three times except for one. Find the single one.

**Example:** `nums = [2, 2, 3, 2]` → `3`

```text
BRUTE FORCE | O(n) | O(n)

Count frequency with a hash map; return the element with count not divisible by 3.

------------------------------------------------------------------------------

OPTIMAL — BIT COUNTERS MOD 3 | O(n) | O(1)

Track how many times each bit has been set, modulo 3.
Use two bitmasks: ones (bits seen 1× mod 3) and twos (bits seen 2× mod 3).
Update rule ensures a bit present 3× drops out of both masks.
```

```csharp
public int SingleNumber(int[] nums)
{
    int ones = 0, twos = 0;
    foreach (int x in nums)
    {
        ones = (ones ^ x) & ~twos;
        twos = (twos ^ x) & ~ones;
    }
    return ones;
}
```

> **Key insight:** Generalise XOR (mod 2) to mod-k bit counters; for k=3 two bitmasks suffice.

---

### Single Number III — LeetCode 260

Every element appears exactly twice except for two elements. Return those two unique numbers.

**Example:** `nums = [1, 2, 1, 3, 2, 5]` → `[3, 5]`

```text
BRUTE FORCE | O(n) | O(n)

Hash map counting; return elements with count 1.

------------------------------------------------------------------------------

OPTIMAL — XOR + SPLIT ON SET BIT | O(n) | O(1)

1. XOR all → diff = a ^ b (since a ≠ b, diff ≠ 0).
2. Isolate any set bit of diff: bit = diff & -diff.
3. Partition nums into two groups by whether (x & bit) != 0.
4. XOR each group separately → recovers a and b.
```

```csharp
public int[] SingleNumber(int[] nums)
{
    int diff = nums.Aggregate(0, (acc, x) => acc ^ x);
    int bit = diff & -diff;
    int a = 0;
    foreach (int x in nums)
        if ((x & bit) != 0) a ^= x;
    return new[] { a, diff ^ a };
}
```

> **Key insight:** Split on any bit that differs between a and b to isolate them into separate XOR streams.

---

### Missing Number — LeetCode 268

Given n distinct numbers in `[0, n]`, find the one missing.

**Example:** `nums = [3, 0, 1]` → `2`

```text
SORT | O(n log n) | O(1)

Sort and scan for the gap.

------------------------------------------------------------------------------

MATH | O(n) | O(1)

Expected sum = n*(n+1)/2. Subtract actual sum.

------------------------------------------------------------------------------

OPTIMAL — XOR | O(n) | O(1)

XOR indices 0..n with all values; everything pairs up except the missing index.
```

```csharp
public int MissingNumber(int[] nums)
{
    int xor = nums.Length;
    for (int i = 0; i < nums.Length; i++) xor ^= i ^ nums[i];
    return xor;
}
```

> **Key insight:** XOR of a complete set of indices 0..n with all array values — matched pairs cancel.

---

### Bitwise AND of Numbers Range — LeetCode 201

Return the bitwise AND of all numbers in `[left, right]`.

**Example:** `left = 5, right = 7` → `4`

```text
BRUTE FORCE | O(n) | O(1)

AND every number in the range.

------------------------------------------------------------------------------

OPTIMAL — COMMON PREFIX | O(log n) | O(1)

Any range [left, right] where left < right contains both an even and odd number,
so the LSB is 0. Keep right-shifting both until equal; that shared prefix is the answer.
```

```csharp
public int RangeBitwiseAnd(int left, int right)
{
    int shift = 0;
    while (left != right) { left >>= 1; right >>= 1; shift++; }
    return left << shift;
}
```

> **Key insight:** The bitwise AND of a range equals the common bit-prefix of left and right.

---

### Subsets — LeetCode 78

Return all subsets of a distinct integer array.

**Example:** `nums = [1, 2, 3]` → `[[], [1], [2], [1,2], [3], [1,3], [2,3], [1,2,3]]`

```text
OPTIMAL — BITMASK ENUMERATION | O(2ⁿ · n) | O(2ⁿ · n)

Each integer mask from 0 to 2ⁿ-1 encodes one subset via its set bits.
```

```csharp
public IList<IList<int>> Subsets(int[] nums)
{
    int n = nums.Length;
    var result = new List<IList<int>>();
    for (int mask = 0; mask < (1 << n); mask++)
    {
        var sub = new List<int>();
        for (int i = 0; i < n; i++)
            if ((mask & (1 << i)) != 0) sub.Add(nums[i]);
        result.Add(sub);
    }
    return result;
}
```

> **Key insight:** A bitmask is a set membership vector — bit i is 1 iff element i is in the subset.

→ For the backtracking approach see [Greedy and Backtracking](../GreedyAndBacktracking/Problems.md).

---

### Maximum XOR of Two Numbers in an Array — LeetCode 421

Find the maximum XOR of any two numbers in the array.

**Example:** `nums = [3, 10, 5, 25, 2, 8]` → `28`

```text
BRUTE FORCE | O(n²) | O(1)

Try all pairs.

------------------------------------------------------------------------------

OPTIMAL — BINARY TRIE | O(n · 32) | O(n · 32)

Build a binary trie of all numbers. For each number, greedily choose the
opposite bit at each level to maximise XOR.
```

```csharp
// See full Trie implementation in Tries and String Matching
// → ../TriesAndStringMatching/Problems.md
public int FindMaximumXOR(int[] nums)
{
    int max = 0, mask = 0;
    for (int i = 31; i >= 0; i--)
    {
        mask |= 1 << i;
        var prefixes = new HashSet<int>();
        foreach (int n in nums) prefixes.Add(n & mask);
        int candidate = max | (1 << i);
        foreach (int prefix in prefixes)
            if (prefixes.Contains(prefix ^ candidate)) { max = candidate; break; }
    }
    return max;
}
```

> **Key insight:** Build max XOR bit by bit from MSB; use a prefix set to check if the desired bit is achievable.

→ Full binary trie approach: [Tries and String Matching](../TriesAndStringMatching/Problems.md).

---

## Bit Counting and Masks

### Number of 1 Bits — LeetCode 191

Return the number of set bits (Hamming weight) in a 32-bit unsigned integer.

**Example:** `n = 11` (binary `1011`) → `3`

```text
BRUTE FORCE | O(32) | O(1)

Check each bit with (n & 1), shift right 32 times.

------------------------------------------------------------------------------

BETTER — x & (x-1) LOOP | O(popcount) | O(1)

Each iteration removes the lowest set bit; count iterations.

------------------------------------------------------------------------------

OPTIMAL — HARDWARE POPCOUNT | O(1) | O(1)

BitOperations.PopCount uses a single hardware instruction.
```

```csharp
public int HammingWeight(uint n) => (int)System.Numerics.BitOperations.PopCount(n);
```

> **Key insight:** `x & (x-1)` removes the lowest set bit in O(1); hardware popcount beats even that.

---

### Counting Bits — LeetCode 338

For each `i` in `[0, n]`, return the number of set bits in its binary representation.

**Example:** `n = 5` → `[0, 1, 1, 2, 1, 2]`

```text
BRUTE FORCE | O(n log n) | O(n)

For each i, count bits with x & (x-1) loop.

------------------------------------------------------------------------------

OPTIMAL — DP | O(n) | O(n)

ans[i] = ans[i >> 1] + (i & 1)
The popcount of i equals the popcount of (i with LSB dropped) plus the LSB.
```

```csharp
public int[] CountBits(int n)
{
    int[] ans = new int[n + 1];
    for (int i = 1; i <= n; i++) ans[i] = ans[i >> 1] + (i & 1);
    return ans;
}
```

> **Key insight:** `ans[i] = ans[i & (i-1)] + 1` works too — DP recurrence on removing the lowest set bit.

---

### Reverse Bits — LeetCode 190

Reverse the bits of a 32-bit unsigned integer.

**Example:** `n = 43261596` → `964176192`

```text
OPTIMAL — BIT LOOP | O(32) | O(1)

Shift result left and OR in the LSB of n, then shift n right, 32 times.
```

```csharp
public uint reverseBits(uint n)
{
    uint result = 0;
    for (int i = 0; i < 32; i++) { result = (result << 1) | (n & 1); n >>= 1; }
    return result;
}
```

> **Key insight:** Build the result from LSB to MSB by extracting each bit of n in order.

---

### Power of Two — LeetCode 231

Determine if n is a power of two.

**Example:** `n = 16` → `true`; `n = 3` → `false`

```text
OPTIMAL — BIT TRICK | O(1) | O(1)

A power of two has exactly one set bit.
x & (x-1) removes that bit; result is 0 iff exactly one bit was set.
```

```csharp
public bool IsPowerOfTwo(int n) => n > 0 && (n & (n - 1)) == 0;
```

> **Key insight:** Powers of two in binary are `1000...0`; `n-1` is `0111...1`; AND is 0.

---

### Power of Four — LeetCode 342

Determine if n is a power of four.

**Example:** `n = 16` → `true`; `n = 8` → `false`

```text
OPTIMAL — BIT TRICK | O(1) | O(1)

Power of four iff:
1. n > 0
2. n is a power of two: (n & (n-1)) == 0
3. The single set bit is at an even position: (n & 0xAAAAAAAA) == 0
   (0xAAAAAAAA = bits at odd positions; if AND is 0, the set bit is at an even position)
```

```csharp
public bool IsPowerOfFour(int n) => n > 0 && (n & (n - 1)) == 0 && (n & 0xAAAAAAAA) == 0;
```

> **Key insight:** Powers of four are powers of two whose set bit sits at an even-indexed position.

---

## Arithmetic Without Operators

### Sum of Two Integers — LeetCode 371

Add two integers without using `+` or `-`.

**Example:** `a = 2, b = 3` → `5`

```text
OPTIMAL — XOR + CARRY LOOP | O(1) | O(1)

sum-without-carry = a ^ b
carry             = (a & b) << 1
Repeat until carry is 0.
In C#, loop on int (32-bit) naturally terminates within 32 iterations.
```

```csharp
public int GetSum(int a, int b)
{
    while (b != 0)
    {
        int carry = (a & b) << 1;
        a ^= b;
        b = carry;
    }
    return a;
}
```

> **Key insight:** XOR gives the sum without carry; AND-shift gives the carry; iterate until carry is zero.

---

### Divide Two Integers — LeetCode 29

Divide two integers without using `*`, `/`, or `%`. Clamp to `[−2³¹, 2³¹−1]`.

**Example:** `dividend = 10, divisor = 3` → `3`

```text
BRUTE FORCE | O(dividend/divisor) | O(1)

Subtract divisor from dividend repeatedly; count subtractions.

------------------------------------------------------------------------------

OPTIMAL — BIT SHIFT (EXPONENTIAL SEARCH) | O(log² n) | O(1)

Double the divisor (shift left) as far as possible without exceeding dividend,
subtract that chunk, add the corresponding power-of-two to the quotient, repeat.

Special case: int.MinValue / -1 = 2³¹ which overflows int — clamp to int.MaxValue.
Widen both inputs to long to avoid all intermediate overflow.
```

```csharp
public int Divide(int dividend, int divisor)
{
    if (dividend == int.MinValue && divisor == -1) return int.MaxValue;
    long a = Math.Abs((long)dividend);
    long b = Math.Abs((long)divisor);
    bool negative = (dividend < 0) ^ (divisor < 0);
    long result = 0;
    while (a >= b)
    {
        long temp = b, multiple = 1;
        while (a >= (temp << 1)) { temp <<= 1; multiple <<= 1; }
        a -= temp;
        result += multiple;
    }
    long ans = negative ? -result : result;
    return (int)Math.Clamp(ans, int.MinValue, int.MaxValue);
}
```

> **Key insight:** Doubles the subtracted chunk each step for O(log² n); the `int.MinValue / -1` overflow trap is the hardest edge case.

---

## Number Theory

### GCD and LCM

Euclidean algorithm for greatest common divisor and least common multiple.

**Example:** `GCD(12, 8)` → `4`; `LCM(4, 6)` → `12`

```text
EUCLIDEAN ALGORITHM | O(log min(a,b)) | O(1)

while b != 0: (a, b) = (b, a % b)
LCM: divide first — a / GCD(a,b) * b — to avoid overflow.
```

```csharp
long GCD(long a, long b) { while (b != 0) { (a, b) = (b, a % b); } return a; }
long LCM(long a, long b) => a / GCD(a, b) * b;
```

> **Key insight:** Euclid terminates in O(log n) steps; divide before multiply in LCM to stay within `long`.

---

### Pow(x, n) — LeetCode 50

Implement `pow(x, n)` — x raised to the power n.

**Example:** `x = 2.0, n = 10` → `1024.0`; `x = 2.0, n = -2` → `0.25`

```text
BRUTE FORCE | O(n) | O(1)

Multiply x by itself |n| times.

------------------------------------------------------------------------------

RECURSION | O(log n) | O(log n)

x^n = x^(n/2) * x^(n/2) [* x if n is odd]

------------------------------------------------------------------------------

OPTIMAL — BINARY EXPONENTIATION | O(log n) | O(1)

For each set bit in |n|, accumulate the squared base into the result.
n = int.MinValue: -n overflows int — widen to long before negating.
```

```csharp
public double MyPow(double x, int n)
{
    long exp = n;           // widen BEFORE negating to avoid int.MinValue trap
    if (exp < 0) { x = 1.0 / x; exp = -exp; }
    double result = 1.0;
    while (exp > 0)
    {
        if ((exp & 1) == 1) result *= x;
        x *= x;
        exp >>= 1;
    }
    return result;
}
```

> **Key insight:** Binary exponentiation: process each bit of the exponent, squaring the base each step; widen `n` to `long` to handle `int.MinValue`.

---

### Sqrt(x) — LeetCode 69

Return the integer part of `√x` without using `Math.Sqrt`.

**Example:** `x = 8` → `2`

```text
BRUTE FORCE | O(√x) | O(1)

Increment from 0 until i*i > x.

------------------------------------------------------------------------------

OPTIMAL — BINARY SEARCH | O(log x) | O(1)

Binary search on answer in [0, x]. Find largest k such that k*k <= x.
```

```csharp
public int MySqrt(int x)
{
    if (x < 2) return x;
    int lo = 1, hi = x / 2;
    while (lo < hi)
    {
        int mid = lo + (hi - lo + 1) / 2;   // upper-mid to avoid infinite loop
        if ((long)mid * mid <= x) lo = mid;
        else hi = mid - 1;
    }
    return lo;
}
```

> **Key insight:** Binary search on the answer; cast to `long` before squaring to avoid overflow when mid² > `int.MaxValue`.

---

### Count Primes — LeetCode 204

Count the number of primes strictly less than n.

**Example:** `n = 10` → `4` (primes: 2, 3, 5, 7)

```text
BRUTE FORCE | O(n √n) | O(1)

Test each number up to n with trial division.

------------------------------------------------------------------------------

OPTIMAL — SIEVE OF ERATOSTHENES | O(n log log n) | O(n)

For each prime p found, mark all multiples starting at p² as composite.
```

```csharp
public int CountPrimes(int n)
{
    if (n < 2) return 0;
    var isPrime = new bool[n];
    Array.Fill(isPrime, true);
    isPrime[0] = isPrime[1] = false;
    for (int i = 2; (long)i * i < n; i++)
        if (isPrime[i])
            for (int j = i * i; j < n; j += i)
                isPrime[j] = false;
    int count = 0;
    foreach (bool p in isPrime) if (p) count++;
    return count;
}
```

> **Key insight:** Start marking at `i²` because all smaller multiples already have a smaller prime factor.

---

### Factorial Trailing Zeroes — LeetCode 172

Count the trailing zeroes in `n!`.

**Example:** `n = 5` → `1` (120 has one trailing zero)

```text
BRUTE FORCE | O(n log n) | O(1)

Compute n! and count trailing zeros — infeasible for large n.

------------------------------------------------------------------------------

OPTIMAL — COUNT FACTORS OF 5 | O(log n) | O(1)

Trailing zeros come from 10 = 2 × 5. There are always more factors of 2 than 5.
Count factors of 5: n/5 + n/25 + n/125 + ...
```

```csharp
public int TrailingZeroes(int n)
{
    int count = 0;
    while (n >= 5) { n /= 5; count += n; }
    return count;
}
```

> **Key insight:** Every multiple of 5 contributes a factor of 5; every multiple of 25 contributes a second one, etc.

---

### Ugly Number — LeetCode 263

Determine if n is an ugly number (positive integer whose only prime factors are 2, 3, 5).

**Example:** `n = 6` → `true`; `n = 14` → `false`

```text
OPTIMAL — TRIAL DIVISION | O(log n) | O(1)

Divide out all factors of 2, 3, and 5. Result must be 1.
```

```csharp
public bool IsUgly(int n)
{
    if (n <= 0) return false;
    foreach (int f in new[] { 2, 3, 5 })
        while (n % f == 0) n /= f;
    return n == 1;
}
```

> **Key insight:** Repeatedly divide by the allowed prime factors; if anything remains, it's an illegal factor.

---

## Combinatorics and Probability

### Happy Number — LeetCode 202

Determine if a number is "happy": repeatedly replace n with the sum of squares of its digits; happy if it reaches 1.

**Example:** `n = 19` → `true` (19 → 82 → 68 → 100 → 1)

```text
HASH SET | O(log n) | O(log n)

Store seen numbers; if we revisit one, it's a cycle (unhappy).

------------------------------------------------------------------------------

OPTIMAL — FLOYD CYCLE DETECTION | O(log n) | O(1)

Slow pointer advances one step; fast pointer advances two steps.
They meet iff there is a cycle. If fast reaches 1, the number is happy.
```

```csharp
public bool IsHappy(int n)
{
    int slow = n, fast = DigitSquareSum(n);
    while (fast != 1 && slow != fast)
    {
        slow = DigitSquareSum(slow);
        fast = DigitSquareSum(DigitSquareSum(fast));
    }
    return fast == 1;

    int DigitSquareSum(int x)
    {
        int s = 0;
        while (x > 0) { int d = x % 10; s += d * d; x /= 10; }
        return s;
    }
}
```

> **Key insight:** Any unhappy number's sequence enters the cycle `4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4`; Floyd's algorithm detects cycles in O(1) space.

---

### Random Pick with Weight — LeetCode 528

Given weights, pick an index at random with probability proportional to its weight.

**Example:** `weights = [1, 3]` → index 1 picked ~75% of the time

```text
OPTIMAL — PREFIX SUM + BINARY SEARCH | O(n) build, O(log n) pick | O(n)

Build prefix sum array. On each pick, generate random in [1, total],
then binary-search for the leftmost prefix sum >= that target.
```

```csharp
public class Solution
{
    private int[] _prefix;
    private Random _rng = new Random();

    public Solution(int[] w)
    {
        _prefix = new int[w.Length + 1];
        for (int i = 0; i < w.Length; i++) _prefix[i + 1] = _prefix[i] + w[i];
    }

    public int PickIndex()
    {
        int target = _rng.Next(1, _prefix[^1] + 1);
        int lo = 1, hi = _prefix.Length - 1;
        while (lo < hi)
        {
            int mid = lo + (hi - lo) / 2;
            if (_prefix[mid] < target) lo = mid + 1;
            else hi = mid;
        }
        return lo - 1;
    }
}
```

> **Key insight:** Map each index to a contiguous range of size equal to its weight; a uniform random number lands in each range proportionally.

---

### Shuffle an Array — LeetCode 384

Implement `reset()` (return original order) and `shuffle()` (uniform random permutation).

```text
OPTIMAL — FISHER-YATES | O(n) shuffle, O(n) reset | O(n)

For i from n-1 down to 1: swap arr[i] with arr[j] where j ∈ [0, i].
WRONG: j ∈ [0, n-1] — creates 3ⁿ equally likely outcomes for n! permutations → biased.
```

```csharp
public class Solution
{
    private int[] _original;
    private int[] _arr;
    private Random _rng = new Random();

    public Solution(int[] nums)
    {
        _original = (int[])nums.Clone();
        _arr = (int[])nums.Clone();
    }

    public int[] Reset() { _arr = (int[])_original.Clone(); return _arr; }

    public int[] Shuffle()
    {
        for (int i = _arr.Length - 1; i > 0; i--)
        {
            int j = _rng.Next(i + 1);   // [0, i] — range MUST shrink
            (_arr[i], _arr[j]) = (_arr[j], _arr[i]);
        }
        return _arr;
    }
}
```

> **Key insight:** Fisher-Yates is unbiased because at step i, the element placed at position i is chosen from exactly i+1 remaining candidates with equal probability.

---

### Linked List Random Node — LeetCode 382

Return a random node value from a linked list of unknown length, with equal probability.

```text
OPTIMAL — RESERVOIR SAMPLING (k=1) | O(n) | O(1)

Visit each node i (1-indexed). With probability 1/i, replace the stored result with node i's value.
No need to know the list length in advance.
```

```csharp
public class Solution
{
    private ListNode _head;
    private Random _rng = new Random();

    public Solution(ListNode head) => _head = head;

    public int GetRandom()
    {
        int result = 0, i = 1;
        for (var node = _head; node != null; node = node.next, i++)
            if (_rng.Next(i) == 0) result = node.val;   // prob 1/i
        return result;
    }
}
```

> **Key insight:** Reservoir sampling with k=1 — each node gets an equal 1/n chance of being selected without knowing n upfront.

---

## Digit Manipulation

### Reverse Integer — LeetCode 7

Reverse the digits of a 32-bit signed integer. Return 0 if the result overflows.

**Example:** `x = 123` → `321`; `x = -123` → `-321`; `x = 120` → `21`

```text
OPTIMAL — DIGIT EXTRACTION WITH OVERFLOW GUARD | O(log x) | O(1)

Build reversed number digit-by-digit in a long; check against int range at the end.
```

```csharp
public int Reverse(int x)
{
    long rev = 0;
    while (x != 0) { rev = rev * 10 + x % 10; x /= 10; }
    return (rev < int.MinValue || rev > int.MaxValue) ? 0 : (int)rev;
}
```

> **Key insight:** Accumulate in `long` to detect overflow — casting to `int` at the end after the range check.

---

### Add Binary — LeetCode 67

Add two binary strings and return the result as a binary string.

**Example:** `a = "11"`, `b = "1"` → `"100"`

```text
OPTIMAL — SIMULATE ADDITION WITH CARRY | O(max(m,n)) | O(max(m,n))

Walk both strings from right to left, add corresponding bits plus carry.
```

```csharp
public string AddBinary(string a, string b)
{
    var sb = new System.Text.StringBuilder();
    int i = a.Length - 1, j = b.Length - 1, carry = 0;
    while (i >= 0 || j >= 0 || carry > 0)
    {
        int sum = carry;
        if (i >= 0) sum += a[i--] - '0';
        if (j >= 0) sum += b[j--] - '0';
        sb.Append(sum % 2);
        carry = sum / 2;
    }
    return new string(sb.ToString().Reverse().ToArray());
}
```

> **Key insight:** Carry simulation works identically for any base — process from LSB to MSB and handle the final carry.

---

### Plus One — LeetCode 66

Add one to an integer represented as an array of digits.

**Example:** `digits = [1, 2, 3]` → `[1, 2, 4]`; `digits = [9, 9]` → `[1, 0, 0]`

```text
OPTIMAL — CARRY PROPAGATION | O(n) | O(n)

Walk from the last digit; if digit < 9, increment and return.
If digit == 9, set to 0 and carry; if all are 9, prepend a 1.
```

```csharp
public int[] PlusOne(int[] digits)
{
    for (int i = digits.Length - 1; i >= 0; i--)
    {
        if (digits[i] < 9) { digits[i]++; return digits; }
        digits[i] = 0;
    }
    var result = new int[digits.Length + 1];
    result[0] = 1;
    return result;
}
```

> **Key insight:** Only carry propagates past a `9`; if no early return triggers, all digits were 9 and the result gains a leading 1.

---

### Excel Sheet Column Number — LeetCode 171

Convert a column title (e.g., `"AB"`) to its column number.

**Example:** `columnTitle = "AB"` → `28`

```text
OPTIMAL — BASE-26 DECODE | O(n) | O(1)

Treat each character as a base-26 digit (A=1, B=2, ..., Z=26).
result = result * 26 + (ch - 'A' + 1)
```

```csharp
public int TitleToNumber(string columnTitle)
{
    int result = 0;
    foreach (char c in columnTitle) result = result * 26 + (c - 'A' + 1);
    return result;
}
```

> **Key insight:** Standard base conversion — but digits run 1–26 (not 0–25), so add 1 after subtracting `'A'`.

---

### Excel Sheet Column Title — LeetCode 168

Convert a column number to its Excel title (e.g., `28` → `"AB"`).

**Example:** `columnNumber = 28` → `"AB"`

```text
OPTIMAL — BASE-26 ENCODE | O(log n) | O(log n)

Repeatedly take (n-1) % 26 as the next digit (1-indexed), then set n = (n-1) / 26.
The -1 adjustment shifts the range from [1,26] to [0,25] before taking mod.
```

```csharp
public string ConvertToTitle(int columnNumber)
{
    var sb = new System.Text.StringBuilder();
    while (columnNumber > 0)
    {
        columnNumber--;                           // shift to 0-indexed
        sb.Append((char)('A' + columnNumber % 26));
        columnNumber /= 26;
    }
    return new string(sb.ToString().Reverse().ToArray());
}
```

> **Key insight:** The `columnNumber--` before taking mod handles the 1-indexed nature of Excel columns (no "zero" column).

---

### String to Integer (atoi) — LeetCode 8

→ This problem lives in [Arrays and Strings](../ArraysAndStrings/Problems.md) (string parsing is the core topic).

> **Key insight:** clamp before the overflow happens — check `result > (int.MaxValue - digit) / 10` *before* multiplying, rather than detecting overflow afterwards.
