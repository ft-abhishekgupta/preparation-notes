# Bit Manipulation and Math — Problems

- Get the last bit : i & 1
- Remove the last bit : i >> 1
- Remove the lowest set bit : i & (i - 1)
- Count set bits while (i != 0) { i &= i - 1; count++; }

## Single Number

Every element appears twice except for one. Find that single one.

**Example:** `nums = [4, 1, 2, 1, 2]` → `4`

```text
BRUTE FORCE | O(N^2) | O(1)
Check each element against all others to find the unique one.

-----------------------------------------------------------------------------
HASH MAP | O(N) | O(N)

Check the frequency of each element using a hash map and return the one with a frequency of 1.

-----------------------------------------------------------------------------
BIT MANIPULATION | O(N) | O(1)
Use XOR operation to find the unique element. XOR of a number with itself is 0 and XOR of a number with 0 is the number itself.

function singleNumber(nums):
    result = 0
    for num in nums:
        result = result XOR num
    return result
```

## Number of 1 Bits

Given an unsigned integer, return the number of '1' bits it has (also known as the Hamming weight).

**Example:** `n = 11` (binary `1011`) → `3`

```text
BRUTE FORCE | O(Log N) | O(1)

Divide the number by 2 repeatedly and count the number of times the remainder is 1.

-----------------------------------------------------------------------------

BIT MANIPULATION | O(32) | O(1)

// Bitwise AND the number with 1 and right shift the number until it becomes 0, counting the number of times the result is 1.

count = 0
while n != 0:
    if (n & 1) == 1:
        count++
    n = n >> 1
return count

------------------------------------------------------------------------------

OPTIMIZED BIT MANIPULATION | O(number of set bits) | O(1)

// Use n & (n - 1) to turn off the rightmost 1-bit and count how many times this operation can be performed until n becomes 0.

count = 0
while n != 0:
    n = n & (n - 1)
    count++
return count
```

## Counting Bits

Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1's in the binary representation of i.

**Example:** `n = 5` → `[0, 1, 1, 2, 1, 2]`

```text
BRUTE FORCE | O(N log N) | O(N)
For each number from 0 to n, count the number of 1 bits using the method from the "Number of 1 Bits" problem.

-----------------------------------------------------------------------------
DP | O(N) | O(N)

// number of 1s in i = number of 1s in (i >> 1) + last bit of i
// ans[i] = ans[i >> 1] + (i & 1)

ans = array of size n + 1
ans[0] = 0
for i from 1 to n:
    ans[i] = ans[i >> 1] + (i & 1)
return ans

// Also ans[i] = ans[i & (i - 1)] + 1
```

## Reverse Bits

Given a 32-bit unsigned integer, reverse its bits.

**Example:** `n = 43261596` (`00000010100101000001111010011100`) → `964176192` (`00111001011110000010100101000000`)

```text
BIT MANIPULATION | O(32) | O(1)

result = 0
repeat 32 times:
    bit = n & 1
    result = result << 1
    result = result | bit
    n = n >> 1
return result
```

## Sum of Two Integers

Given two integers a and b, return the sum of the two integers without using the operators + and -.

**Example:** `a = 2, b = 3` → `5`

```text
BIT MANIPULATION | O(1) | O(1)

// sum without carry = a ^ b
// carry = (a & b) << 1

while b != 0:
    carry = (a AND b) << 1
    a = a XOR b
    b = carry
return a
```

## Power of Two

Given an integer n, return true if it is a power of two. Otherwise, return false.

**Example:** `n = 16` → `true`

```text
n > 0 && (n & (n - 1)) == 0
```

## Pow(x, n)

Implement pow(x, n), which calculates x raised to the power n (i.e., x^n).

**Example:** `x = 2.0, n = 10` → `1024.0`

```text
BRUTE FORCE | O(N) | O(1)

Repeated multiplication of x, n times. If n is negative, compute 1 / (x^(-n)).

-----------------------------------------------------------------------------

RECURSION | O(log N) | O(log N)

// X^N = X^(N/2) * X^(N/2) if N is even
// X^N = X^(N/2) * X^(N/2) * X if N is odd

function power(x, n):
    if n == 0:
        return 1
    half = power(x, n / 2)
    if n is even:
        return half * half
    else:
        return x * half * half

------------------------------------------------------------------------------

BINARY EXPONENTIATION | O(log N) | O(1)

// Use the binary representation of n to compute x^n efficiently. For each bit in n, square the current result and multiply by x if the bit is set.

if n == 0:
    return 1
if n < 0:
    x = 1 / x
    n = -n
result = 1
while n > 0:
    if n is odd:
        result = result * x
    x = x * x
    n = n / 2
return result
```

> Negating `n` overflows when `n` is the minimum 32-bit integer, so widen it to a 64-bit value before flipping the sign.

## GCD and LCM

```text
EUCLIDEAN ALGORITHM | O(log(min(a, b))) | O(1)

GCD(a, b):
    while b != 0:
        temp = b
        b = a % b
        a = temp
    return a

LCM(a, b):
    return a / GCD(a, b) * b     // Divide first to avoid overflow
```

## Sieve of Eratosthenes

Find all prime numbers up to n.

**Example:** `n = 10` → `[2, 3, 5, 7]`

```text
SIEVE | O(N log log N) | O(N)

// Start marking at i * i because smaller multiples already have a smaller prime factor

isPrime = array of size n + 1 filled with true
isPrime[0] = false
isPrime[1] = false

for i = 2 while i * i <= n:
    if isPrime[i]:
        for multiple = i * i to n step i:
            isPrime[multiple] = false

return all i where isPrime[i]
```

> Trial division on a single number is `O(sqrt(N))`: test divisors up to `sqrt(N)` only.

## Fisher-Yates Shuffle

Produce a uniformly random permutation of an array in-place.

```text
FISHER-YATES | O(N) | O(1)

// Naive "swap with any random index" is biased, the range must shrink

for i = n - 1 down to 1:
    j = random integer in [0, i]
    swap(nums[i], nums[j])
```

## Reservoir Sampling

Pick k items uniformly at random from a stream of unknown length.

```text
RESERVOIR SAMPLING | O(N) | O(K)

keep the first k items as the reservoir
for i = k to n - 1:
    j = random integer in [0, i]
    if j < k:
        reservoir[j] = item i
```

> For `k = 1`, replace the stored item with probability `1 / (i + 1)`; this solves random-pick problems on linked lists in O(1) space.
