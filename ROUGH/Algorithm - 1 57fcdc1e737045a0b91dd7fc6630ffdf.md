# Algorithm - 1

# Data Structure

---

- Trie
- Binary Index Tree
- Segment Tree : Range Sum , Range Min

## Trie

```cpp
struct TrieNode{
    struct TrieNode *children[ALPHABET_SIZE];
    bool isEndOfWord;
};
struct TrieNode *getNode(void){
    struct TrieNode *pNode =  new TrieNode;
    pNode->isEndOfWord = false;
    for (int i = 0; i < ALPHABET_SIZE; i++)
        pNode->children[i] = NULL;
    return pNode;
}
void insert(struct TrieNode *root, string key){
    struct TrieNode *ptr = root;
    for (int i = 0; i < key.length(); i++){
        int index = key[i] - 'a';
        if (!ptr->children[index])
            ptr->children[index] = getNode();
        ptr = ptr->children[index];
    }
    ptr->isEndOfWord = true;
}
bool search(struct TrieNode* root, string key) {
    struct TrieNode* pCrawl = root;
    for (int i = 0; i < key.length(); i++) {
        int index = key[i] - 'a';
        if (!pCrawl->children[index])
            return false;
        pCrawl = pCrawl->children[index];
    }
    return (pCrawl != NULL && pCrawl->isEndOfWord);
}
TrieNode* remove(TrieNode* root, string key, int depth = 0){
    if (!root)
        return NULL;
    if (depth == key.size()) {
        if (root->isEndOfWord)
            root->isEndOfWord = false;
        if (isEmpty(root)) {
            delete (root);
            root = NULL;
        }
        return root;
    }
    int index = key[depth] - 'a';
    root->children[index] =
          remove(root->children[index], key, depth + 1);
    if (isEmpty(root) && root->isEndOfWord == false) {
        delete (root);
        root = NULL;
    }
    return root;
}

```

## Binary Index Tree

O(LogN) time range sum, update a[i] Requires less memory space and coding than segment tree Size = #elements in array+1

getSum returns prefix sum 0 to i Sum(i,j) = getSum(j) - getSum(i-1)

```cpp
int getSum(int BITree[], int index){
    int sum = 0;
    index++;
    while (index>0){
        sum += BITree[index];
        index -= index & (-index);
    }
    return sum;
}
void updateBIT(int BITree[], int n, int index, int val){
    index++;
    while (index <= n){
        BITree[index] += val;
        index += index & (-index);
    }
}
int *constructBITree(int arr[], int n){
    int *BITree = new int[n+1];
    for (int i=0; i<n; i++)
        updateBIT(BITree, n, i, arr[i]);
    return BITree;
}

```

## Segment Tree

For Range Queries in O(LogN) time query and value update

### RANGE SUM

```cpp
buildST(int a[],int start, int end, int *st, int current){
    if(start == end){
        st[current] = a[start];
        return a[start];
    }
    int mid = start + (end - start)/2;
    st[current] = buildST(a,start,mid,st,2*current+1) + buildST(a,mid+1,end,st,2*current+2);
    return st[current];
}
getSumRec(int *st,int start, int end, int l, int r, int curr){
    if(l<=start && r>=end)
        return st[curr];
    if (start < l || end > r)
        return 0;
    int mid = start + (end - start)/2;
    return getSumRec(st,start,mid,l,r,2*curr+1) + getSumRec(st,mid+1,end,l,r,2*curr+2);
}
getSum(int *st,int l,int r){
    getSumRec(st,0,n-1,l,r,0)
}
updateRec(int *st,int start, int end, int index, int diff, int curr){
    if(index < start || index > end)
        return;
    st[curr] += diff
    if(start != end){
        int mid = start + (end - start)/2;
        updateRec(st,start,mid,index,diff,2*curr+1)
        updateRec(st,mid+1,end,index,diff,2*curr+2)
    }
}
update(int a[], int *st, int new, int index){
    diff = new - a[index]
    a[index] = new
    updateRec(st,0,n-1,index,diff,0)
}
updateRangeRec(int *st,int start, int end, int l, int r, int curr,int diff){
    if(start > end || start > r || end < l)
        return
    if(start == end){
        st[curr] += diff
        return
    }
    int mid = start + (end - start)/2
    updateRangeRec(st,start,mid,l,r,curr*2+1,diff)
    updateRangeRec(st,mid+1,end,l,r,curr*2+2,diff)
    st[curr] = st[curr*2+1] + st[curr*2+2]
}

```

### RANGE MIN

```cpp
buildSTRec(int a[],int start, int end, int *st, int current){
    if(start == end){
        st[current] = a[start];
        return a[start];
    }
    int mid = start + (end - start)/2;
    st[current] = min(buildSTRec(a,start,mid,st,2*current+1) , buildSTRec(a,mid+1,end,st,2*current+2));
    return st[current];
}
buildST(int a[],int n){
    height = ceil(log2(n));
    size = 2*(int)pow(2, x) - 1;
    int *st = new int[size];
    buildSTRec(a,0,n-1,st,0);
}
getMinRec(int *st,int start, int end, int l, int r, int curr){
    if(l<=start && r>=end)
        return st[curr];
    if (start < l || end > r)
        return INF;
    int mid = start + (end - start)/2;
    return min(getMinRec(st,start,mid,l,r,2*curr+1) , getMinRec(st,mid+1,end,l,r,2*curr+2));
}
getMin(int *st,int l,int r){
    getMinRec(st,0,n-1,l,r,0)
}

```

# Maths

---

- General Maths Important
- Primes Till N EASY
- All Factors of Number inorder EASY
- Rearrange array so that A[i] becomes A[A[i]] MEDIUM
- Generate Gray Code Sequence of N bits MEDIUM
- Generate kth permutation of 1toN HARD
- Rank of string without repeat MEDIUM
- Rank of string with repeat MEDIUM
- Number of numbers less than N from given digit set MEDIUM
- Number of ways to visit all cities from x visited cities HARD
- Which number remains in circle if every kth deleted MEDIUM
- Flip x random 0s one by one EASY

## General Maths Important

```
a^p-1 mod p = 1

a/b % m = (a * pow(b,(m-2))) % m

pow(a,pow(b,c)) % m = pow(a,(pow(b,c))%(m-1)) % m

gcd(A,B)
    if(A%B = 0) return B
    else return gcd(B, A%B)

nCr(n,r)
    if r > n-r
        r = n-r
    ans = 1
    Loop i = 1 to r
        ans *= n-i-1
        ans /= i

nPr(n,r)
    ans = 1
    Loop i = 1 to r
        ans *= n-i-1

Catlan Number = 2nCn / n+1
    # Distinct BST with n keys
    # Ways to parenthesise matrix multiplication
    2 * #Valid Parenthesis with length n

pow(a,b,p)
    if a=0 return 0
    if b=0 return 1
    if b=1 return a
    if b odd return a * pow(a*a % p,b/2) % p
    else return pow(a*a % p,b/2)

nthFib(n)
    {[(√5 + 1)/2] ^ n} / √5             // O(1)

    OR

    If n is even                        // O(Log N)
        k = n/2:
        F(n) = [2*F(k-1) + F(k)]*F(k)
    If n is odd
        k = (n + 1)/2
        F(n) = F(k)*F(k) + F(k-1)*F(k-1)

    OR

    F(0) = a = 1                        // // O(n)
    F(1) = b = 1
    Loop i : 2 to n
        c = a+b
        a = b
        b = c

PrimeFactorization(n)
    i = 2
    while n > 1 and i < sqrt(n)
        if n%i = 0
            print i
            n /= i
        else
            i++

AverageInStream
    PREV
        new avg = ( n * prev avg + x ) / n+1
    STATIC
        new avg = sum + x / n + 1

Select k items in stream
    Select first k items, place it in array
    For new item at position p
        x = rand(0,p)
        if x in 1 to k, arr[x] = new item

Shuffle Number 1 to n
    size
    arr[] = 1 to n
    while size > 1
        x = rand % size
        swap a[x] a[size-1]
        size--

Area of Triangle = |[ x1(y2-y3) + x2(y3-y2) + x3(y1-y2) ] / 2

Number appears in 2^(n-1) subset

- LCM(a,b) = a*b / gcd(a,b)
- LCM(a,b,c) = LCM(a,LCM(b,c))

Min sum of distance of elements is from median

Sequence of Gray Code
    Loop i
        ans.push i ^ i/2

Number power of x
    If largest power of x % number == 0

Array to store number of 1s in binary rep of index
    f[i] = f[i / 2] + i % 2

Measure z from x,y size jug
    Possible if z % gcd(x,y) = 0

Number of rats required to find poison, if total x minutes, b bottles, y minute for reaction
    ceil (log b / log ((x/y) + 1))

```

## Primes Till N

| O(NLogLogN) | O(LogN) |
| --- | --- |

```
Seive Algorithm = Delete multiples of primes till N

PrimeTillN(n)
    p[n+1] = true
    p[0] = p[1] = false
    Loop i : 2 to sqrt(N)
        if p[i]
            Loop j : 2 to N/i
                p[i*j] = 0

```

## All Factors of Number inorder EASY

| O(sqrtN) | O(N) |
| --- | --- |

```
a divides n => n/a = b also divides n : Both Cofactors (a > sqrt(n) then b < sqrt(n))

Loop i: sqrt N to 1
    if N % i = 0
        if i = sqrt N
            push(i)
        else
            insert(i)
            push(A/i)

```

## Rearrange array so that A[i] becomes A[A[i]] MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Store new and old value at same place
Base Converted to Len

Loop
    A[i] = A[i] + (A[A[i]]%n)*n
Loop
    A[i] = A[i]/n;

```

## Generate Gray Code Sequence of N bits MEDIUM

| O(2^N) | O(1) |
| --- | --- |

```
Backtracking
G(n+1) = 0G(n) + 1Rev(G(n))

res = {0}
Loop i : 0 to n-1
    size = res.size
    Loop j : size-1 to 0
        res.push(res[j]+(1<<i))

```

## Generate kth permutation of 1toN HARD

| O(N^2) | O(N) |
| --- | --- |

```
Find Index Sequence of K : X[]
    We divide K by 1!,2!,3!... till it becomes 0, and push remainders in X
    Remainders we get are from right to left

X[n] = 0
i = 1
while k > 0
    X.push k % i
    i++
    k = k/i
reverse X
A[n] = 1 to n
Loop i : 0 to N
    ans.push A[X[i]]
    erase A[X[i]]

```

## Rank of string without repeat MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Put chars in ordered set
Iterate over string
    ans += rank of char in set * factorial of (length of set - 1)
    remove char from set
ans++

```

Code 51

## Rank of string with repeat MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Put chars in ordered multiset
iterate over string
    remove char from multiset
    ans += rank of char in multiset * (factorial of lenght of multiset / product of factorials of counts)

```

Code 52

## Number of numbers less than N from given digit set

| O(LogN) | O(1) |
| --- | --- |

```
d = digit set size
n = number length = Log10(N) + 1
NS = to_string N

// Number of numbers of length 1 to n
Loop i : 1 to n-1
    ans += pow(d,i)

// Number of numbers of length n
Loop i : 0 to d-1
    hasSameNum = false
    Loop c : digits set
        if c < NS[i]
            ans += pow(d,n-i-1)
        else if c = NS[i]
            hasSameNum = true
    if (!hasSameNum) break
}
return rtn+1;

```

## Number of ways to visit all cities from x visited cities HARD

| O(N) | O(1) |
| --- | --- |

```
Can move in either direction from visited cities
00001 or 10000 : all have 1 choice
100001 : has 2 choices for each time #0s-1 times
a1b1c1d1e

Ans = 2^(b+c+d) * (a+b+c+d+e)! / (a!b!c!d!e!)

x = 2^(b+c+d)
y = (a+b+c+d+e)!
z = (a!b!c!d!e!)

ans = x%m * y%m * (z^(m-1))%m

```

## Which number remains in circle if every kth deleted MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Starting point adjusted as recursive call considers the original position k%n + 1 as position 1

solve(1, k) = 1
solve(n, k) = (solve(n - 1, k) + k-1) % n + 1

```

## Flip x random 0s one by one

```
map m
while x--
    index = rand % total
    total--
    actual = m[index] ? m[index] : index
    m[index] = total
    ans.push actual

```

# Bit Manipulation

---

- General Bit Manipulation Important
- Every number repeated twice except 1, find it EASY
- Every number repeated thrice except 1, find it
- Every number repeated twice except 2, find it
- Max AND of 4 numbers in array MEDIUM
- Max XOR of any subsequence in array MEDIUM
- All unique Bitwise XOR of subarrays MEDIUM
- Count #1s 1 to N MEDIUM

## General Bit Manipulation Important

```
2^n = 1<<n

IsSignDiff x^y < 0

RIGHTMOST 1
    Position    : log2(n & -n) + 1
    Unset       : n = n & (n-1)

KTH BIT
    isSet       : n & (1 << (k-1))
    Unset       : (n & ~(1 << (k - 1)))

2s              : -A
Toggle bits     : ~A

Adjacent Numbers give min XOR

Next Number with same #1s
    Shift righmost 1s consecutive to extreme right, except 1 which is shifted to left  : Like 101110 -> 110011

AND of all numbers x to y
    Take common prefix
    while x < y
        x &= x-1

```

## Every number repeated twice except 1, find it EASY

| O(N) | O(1) |
| --- | --- |

```
A XOR A = 0
Xor all numbers, result is the required number

```

Code 56

## Every number repeated thrice except 1, find it MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Check at each position : #1s = 3x + 0 or 3x + 1
ith bit of ans = (ith count1 % 3)

ith count1 :
for each number x
    count += (x & pow(2,i)) >> i

```

Code 57

## Every number repeated twice except 2, find it MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Xor of all gives = A^B
if a bit is set in Xor then 1 occurs in A/B in that position
Divide All numbers into 2 sets on the basis of set bits of A^B are also set in number or not
Again Xor of numbers in each set, gives both A,B

```

## Max AND of 4 numbers in array MEDIUM

| O(LogN) | O(1) |
| --- | --- |

```
Start from msb to lsb bit, count those bit position that has more than 4 elements with 1

x = 1<<30
Loop i : 0 to 31
    count numbers with 1 at position i from right
    if(count >= 4)
        ans+=x
        Make other elements 0, that do not have 1 at position i
    x >>= 1
return ans

```

Code 243

## Max XOR of any subsequence in array MEDIUM

| O(LogN) | O(1) |
| --- | --- |

```
x = 1<<30
Loop i : 0 to 31
    find max number with 1 at position i from right (after index)
    swap max with A[index++]
    Make other numbers with 1 at position i from right = XOR with curr max
    x >>= 1
return XOR of all elements

```

## All unique Bitwise XOR of subarrays MEDIUM

```cpp
set result, curr
for auto i:A
    set next{i}
    for auto j:curr
        next.push i|j
    curr = move(next)
    for auto j:curr
        result.push j

```

## Count #1s 1 to N MEDIUM

| O(LogN) | O(1) |
| --- | --- |

```
Total 1s in b bit number = b*2^(b-1)
Recursively call function using 1st set bit as numbers with less bits all present
Count(n)
    find 1st set bit at position m
    #1 at position m = x = n - 2^m +1
    n = remove rightmost 1
    #1 for other positions = y = (m-1)*2^(m-2)
    return x + y + Count(n)

```

|NLogN|O(1)|

```
For each bit position Calculate how many times 0 changing to 1
01010101...
00110011...

```

# Arrays

---

- General Array
- SEARCHING SORTING
- Sort Lexographically 1-n
- Find all duplicate in range EASY
- Find first missing number in range EASY
- Integer Array of N 1 range 1 N, One Missing EASY
- Integer Array of N, One Missing One Duplicate EASY
- Max Continuous Sum Array Sum MEDIUM
- Max sum in circular array
- Max sum of 2 non overlapping subarray of length L,M
- Max A[i]+A[j]+i-j
- Max of sum i*a[i] with rotation of array allowed
- Max length bitonic subarray
- Max subarray with unsorted contiguous number in distinct array EASY
- Minimum increment to make array element distict
- Minimum decrement to make array zigzag
- Number of subarray with max between L,R
- Handle Multiple Queries of Range Increment on Empty Array, Return Array MEDIUM
- Find Kth Min MEDIUM
- Max Unsorted Subarray MEDIUM
- Minimum Swaps to Sort Array MEDIUM
- Remove min coins/coin piles from piles (max-min) <= K MEDIUM
- Add or Remove k from each pile (max-min) is min MEDIUM
- Find max gap of consecutive elements in sorted array in O(n) HARD
- Max of abs[i-j]+abs[A[i]-A[j]] MEDIUM
- Max (j-i) such that A[i]<=A[j] MEDIUM
- Next permutation Implementation MEDIUM
- Number occuring > n/3 times in linear time MEDIUM
- Find queue using Number of taller people in front data EASY
- Find if reachable to last with jump size EASY
- Stock Buy and Sell for max profit EASY
- Stock Buy and Sell for max profit 1 transaction EASY
- Stock Buy and Sell for max profit 2 transaction MEDIUM

## General Array

```
We have {element,count} array : We need to find element at position x in sorted expanded array
    Sort given array according to element
    Replace count with prefix sum of count
    Find lowerbound of x in prefix sum, it gives index of element

```

## SEARCHING - SORTING

**LINEAR SEARCHING**

| O(N) | O(1) |
| --- | --- |

```
Loop i 0 to len
    if A[i] = x
        return true

```

JUMP SEARCH

| O(sqrtN) | O(1) |
| --- | --- |

```
Array must be sorted
Check every sqrtN th element
Linear search from Nearest

```

**BINARY SEARCHING**

| O(LogN) | O(1) |
| --- | --- |

```
Array must be sorted
while l<=h
    m = l+h / 2
    if x > A[m]
        l = m+1
    else if x < A[m]
        h = m-1
    else
        return m

```

**INTERPOLATION SEARCHING**

| O(LogLogN) | O(1) |
| --- | --- |

```
Array must be sorted and elements uniformly distributed
while l<=h
    m = l + (x-A[l])*(h-l)/(A[h]-A[l])
    if x > A[m]
        l = m+1
    else if x < A[m]
        h = m-1
    else
        return m

```

**SELECTION SORT**

| O(N^2) | O(1) |
| --- | --- |

```
Select min each time and place it correcty
Loop i: 0 to len-1
    min = i
    Loop j:i+1 to len-1
        min = A[min] > A[j] ? j : min
    swap(A[i],A[min])

```

**BUBBLE SORT**

| O(N^2) | O(1) |
| --- | --- |

```
Swap every adjacent element [Every Inversion removed one by one]
Loop i: 0 to len-2
    Loop j:0 to len-i-2
        if A[j] > A[j+1]
            swap
        Break outer loop if no swap

```

**INSERTION SORT**

| O(N^2) | O(1) |
| --- | --- |
| Used for small array or when array almost sorted |  |

```
Two halfs, left one sorted
Loop i : 1 to len-1
    key = A[i]
    j = i-1
    while j >= 0 AND A[j] > key
        A[j+1] = A[j]
        j--
    A[j+1] = key

```

**SHELL SORT**

| O(N^2) | O(1) |
| --- | --- |

```
Variation of Insertion Sort with less swaps
gap = n/2
Sort every gap th element array
Decrease gap and repeat till gap becomes 1

COMB SORT : New Gap = Gap/1.3

```

**MERGE SORT**

| O(NLogN) | O(N) |
| --- | --- |
| Used for merging LL |  |

```
Merge(A,l,m,h)
    B = A[l,m]
    C = A[m+1,h]
    A = B and C merge
MergeSort(A,l,h)
    if l >= h return
    m = l+h / 2
    MergeSort(A,l,m)
    MergeSort(A,m+1,h)
    Merge(A,l,m,h)

```

**RANDOM QUICK SORT**

| O(NLogN) | O(1) |
| --- | --- |
| Used mostly |  |

```
Randomly select an element, and place it in correct position, then sort iteratively
Partition(A,l,h)
    x = A[h]
    i = l-1
    Loop j : 0 to h-1
        if(A[j] <= x)
            i++
            swap(A[i],A[j])
    swap(A[i+1],A[h])
    return i
QSort(A,l,h)
    p = random(l,h)
    swap(A[p],A[h])
    q = Partition(A,l,h)
    QSort(A,l,q-1)
    QSort(A,q+1,h)

```

**COUNTING SORT**

| O(N+K) | O(1) |
| --- | --- |
| Used for sorting in range 1 to n in O(n) time |  |

```
count[n]
Loop i: 0 to len-1
    count[A[i]]++
Loop i: 1 to len-1
    count[i] += count[i-1]
Loop i: len-1 to 0
    ans[count[A[i]]-1] = A[i]
    count[A[i]]--

PIGEONHOLE SORT : Put elements in count list instead of count

```

**RADIX SORT**

| O(D(N+Base)) | O(1) |
| --- | --- |
| D : Max number of digits |  |
| Used for sorting in range 1 to n^2 in O(n) time => Call radixSort(A,n,n) : CountSort called 2 times |  |

```
Compare and sort digit wise from lsb to msb

countSort(A,n,exp)
    count[n]
    Loop i: 0 to len-1
        count[ (A[i]/exp) % n ]++
    Loop i: 1 to len-1
        count[i] += count[i-1]
    Loop i: len-1 to 0
        ans[ count[(A[i]/exp)%n] - 1 ] = A[i]
        count[(A[i]/exp)%n]--
radixSort(A,n,base)
    maxDigit = Log max / Log base
    Loop i: 0 to maxDigit
        countSort(A,n,base^i)

```

**BUCKET SORT**

| O(N) | O(N) |
| --- | --- |
| To sort elements uniformly distributed in range |  |

```
Create N Buckets
Insert A[i] to correct bucket
Sort each bucket
Concat buckets

```

**CYCLE SORT**

| O(D(N^2)) | O(1) |
| --- | --- |
| Minimum swap and memory writes |  |

```
Count elements in each loop - 1

i = -1
c[n] = 0
while ++i < arr.size
    if c[i] == 1  continue;
    j = i;
    while arr[j] != j+1
        c[arr[j]-1] = 1
        swap(arr[j],arr[arr[j]-1])
    c[j] = 1

```

## Sort Lexographically 1-n

```cpp
vector<int> res(n);
int cur = 1;
for (int i = 0; i < n; i++) {
    res[i] = cur;
    if (cur * 10 <= n) {
        cur *= 10;
    } else {
        if (cur >= n)
            cur /= 10;
        cur += 1;
        while (cur % 10 == 0)
            cur /= 10;
    }
}

```

## Find all duplicate in range EASY

| O(N) | O(1) |
| --- | --- |

```
* Traverse array, change sign of A[A[i]]
* If already -ve then that element duplicate

```

## Find first missing number in range EASY

| O(N) | O(1) |
| --- | --- |

```
Make -ve numbers n+1
Loop i : 0 to n
    A[abs(A[i])] = -ve of itself
Loop and find 1st positive value

```

| O(N) | O(N) |
| --- | --- |

```
Check count, return 1st with 0 count

```

Code 11

## Integer Array of N 1 range 1 N, One Missing EASY

| O(N) | O(1) |
| --- | --- |

```
NUMBER = Sum 1-N - Sum of Array
Do 1 by 1 so no overflow
ans = 1
Loop i: 0 to N-2
    ans = ans + i + 2 - A[i]

OR

NUMBER = XOR(1 to N) XOR XOR(Array Elements)

```

## Integer Array of N, One Missing One Duplicate EASY

| O(N) | O(1) |
| --- | --- |

```
m = Missing, d = Duplicate
SumN = ArraySum - d + m
SumN^2 = ArraySquareSum - d^2 + m^2
m-d = SumN - ArraySum
(m-d)*(m+d) = SumN^2 - ArraySquareSum

```

Code 12

## Max Continuous Sum Array Sum MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Kandane Algorithm : Any Prefix Sum cannot be negative of Required Sub-Array
curSum : 0, MaxSum : -INF
Iterate Array
    curSum += A[i]
    MaxSum = max(curSum, maxSum)
    if (curSum < 0) curSum = 0

```

Code 16

## Max sum in circular array

```
for (const auto& a : A) {
    cur_max = max(cur_max + a, a);
    max_sum = max(max_sum, cur_max);
    cur_min = min(cur_min + a, a);
    min_sum = min(min_sum, cur_min);
    total += a;
}
return max_sum >= 0 ? max(max_sum, total - min_sum) : max_sum;

```

## Max sum of 2 non overlapping subarray of length L,M

```
A[] = prefix sum array
int result = A[L + M - 1], L_max = A[L - 1], M_max = A[M - 1];
for (int i = L + M; i < A.size(); ++i) {
    L_max = max(L_max, A[i - M] - A[i - L - M]);
    M_max = max(M_max, A[i - L] - A[i - L - M]);
    result = max(result, max(L_max + A[i] - A[i - M], M_max + A[i] - A[i - L]));
}
return result;

```

## Max A[i]+A[j]+i-j

```
Loop i:0 to len-1
    ans = max ans, mx + A[i] - i
    mx = max mx, A[i]+i

```

## Max of sum i*a[i] with rotation of array allowed

```
sum = sum of array element
x = i*a[i] sum
ans = x
Loop i : 1 to len
    x += sum - len*a[len-i]
    ans = max(ans,x)

```

## Max length bitonic subarray

|O(n)|O(1)|

```
for (int i = 1; i < A.size(); ++i) {
    if ((down_len && A[i - 1] < A[i]) ||
        A[i - 1] == A[i]) {
        up_len = down_len = 0;
    }
    up_len += A[i - 1] < A[i];
    down_len += A[i - 1] > A[i];
    if (up_len && down_len) {
        result = max(result, up_len + down_len + 1);
    }
}

```

## Max subarray with unsorted contiguous number in distinct array EASY

| O(N) | O(1) |
| --- | --- |

```
Max-Min = Size of subarray - 1
Loop i : 0 to len-1
    mx = mn = A[i]
    Loop j : i+1 to len-1
        mx = max(mx,A[j])
        mn = min(mn,A[j])
        if mx-mx == j-i-1
            ans = max(ans,j-i)

```

## Minimum increment to make array element distict

```
sort
prev = -1
for (int& n : A) {
    if (n <= prev) {
        int diff = prev - n + 1;
        moves += diff;
        prev = n + diff;
    } else {
        prev = n;
    }
}
return moves;

```

## Minimum decrement to make array zigzag

```cpp
int movesToMakeZigzag(vector<int>& nums) {
	return min(numMoves(nums, false), numMoves(nums, true));
}
int numMoves(vector<int>& nums, bool oddIndex) {
	int num = 0, n = nums.size(), left, right;
	for (int i = oddIndex; i < n; i += 2) {
		left = i > 0 ? nums[i-1] : 1001;
		right = i + 1 < n ? nums[i+1] : 1001;
		num += max(0, nums[i]-min(left, right) + 1);
	}
	return num;
}

```

## Number of subarray with max between L,R

```
count(R) - count(L-1)

count(n)
    ans = curr = 0
    for auto i:A[]
        curr = i<=n ? curr+1 : 0
        ans += curr
    return ans

```

## Handle Multiple Queries of Range Increment on Empty Array, Return Array MEDIUM

| O(N) | O(1) |
| --- | --- |
| a b c : Increment c in array from a to b |  |

```
Iterate query
    increment A[a] by c
    decrement A[b+1] by c
Iterate array
    Take prefix sum => A[i]

```

Code 165

Can also be used to solve hotel booking question without sorting (c = 1) Otherwise : Sort pair (arrival,1),(departure,-1), then traverse

## Find Kth Min MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Random Quick Sort Partitioning

kth(A,l,h,k)
    swap (A[random],A[h])
    i = l, j = h-1
    while(i <= j){          // <= Important
        if A[i]<A[h]    i++
        else            swap(A[i],A[j]) j--
    swap(A[i],A[h])
    if(i == k)
        return A[i];
    else if(i < k)
        return findkth(A,i+1,h,k)
    else
        return findkth(A,l,i-1,k)

```

Code 175

| O(NLogN) | O(N) |
| --- | --- |

```
Sort and return

Make max/min heap , then delete elements

```

## Max Unsorted Subarray MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Assume that Al, …, Ar is the minimum-unsorted-subarray which is to be sorted.Then
* min(Al, …, Ar) >= max(A0, …, Al-1)
* max(Al, …, Ar) <= min(Ar+1, …, AN-1)

Find Left position of conflict, find min in right
Find right position of conflict, find max in left
Find their correct position

```

Code 31

## Minimum Swaps to Sort Array MEDIUM

| O(N^2) | O(1) |
| --- | --- |

```
CYCLE SORT
Count elements in each loop - 1

i = -1
c[n] = 0
while ++i < arr.size
    if c[i] == 1  continue;
    j = i;
    while arr[j] != j+1
        c[arr[j]-1] = 1
        swap(arr[j],arr[arr[j]-1])
        ans++
    }
    c[j] = 1
}
return ans

```

Code 166

## Remove min coins/coin piles from piles (max-min) <= K MEDIUM

| O(NLogN) | O(1) |
| --- | --- |

```
GREEDY
Sort Piles
We take a window where max-min = k
So ans for that window = prefix sum before start, suffix sum of extra coins

sort
ans = INF
Loop i:0 to len-1
    x = prefix sum 0 to i-1
    Loop j:i+1 to len-1
        if A[j]-A[i] > k
            x += A[j]-A[i]+k
    ans = min(ans,x)

```

## Add or Remove k from each pile (max-min) is min MEDIUM

| O(NLogN) | O(1) |
| --- | --- |

```
GREEDY
Sort and check for each pile if adding or removing k is making difference , then change limits

sort(A.begin(), A.end());
int n = A.size(), mx = A[n - 1], mn = A[0], res = mx - mn;
for (int i = 0; i < n - 1; ++i) {
    mx = max(mx, A[i] + 2 * K);
    mn = min(A[i + 1], A[0] + 2 * K);
    res = min(res, mx - mn);
}
return res;

if (n == 1)
    return 0;
sort
ans = max-min
small = arr[0] + k
big = arr[n-1] - k
if (small > big)
    swap(small, big)
Loop i: 1 to len-2
    subtract = arr[i] - k
    add = arr[i] + k
    if (subtract >= small || add <= big)
        continue
    if (big - subtract <= add - small)
        small = subtract
    else
        big = add
    return min(ans, big - small)

```

Min abs max-min after -k <= x <= k, A[i] += x max(0, mx - mn - 2 * K)

## Find max gap of consecutive elements in sorted array in O(n) HARD

| O(N) | O(N) |
| --- | --- |

```
Bucket sorting : keep track of max/min in each bucket
mine , maxe = min and max element of array
minb[N], maxb[N] = store min and max of each bucket (init INT_MAX, INT_MIN)
Loop Array : i
    if mine || maxe
        continue
    index = (i - min)/max
    minb[index] = min(i,minb[index])
    maxb[index] = max(i,maxb[index])
prev = mine
maxdiff = 0
Loop i : 0 to Len-1
    if(minb[i]==INT_MAX) continue
    maxdiff = max(maxdiff,minb[i]-prev)
    prev = maxb[i]
maxdiff = max(maxdiff,maxe-prev)

```

Code 23

## Max of abs[i-j]+abs[A[i]-A[j]] MEDIUM

| O(N) | O(1) |
| --- | --- |

```
* |i-j| + |A[i]-A[j]| expanded to :
    * i-j+A[i]-A[j]
    * i-j-A[i]+A[j]
    * -i+j+A[i]-A[j]
    * -i+j-A[i]+A[j]
* Becomes 2 Cases if Absolute Value Considered
    * ( A[i]-i ) - ( A[j]-j )
    * ( A[i]+i ) - ( A[j]+j )
Calculate Max/Min of A[i]-i and A[i]+i
return max(abs(max2-min2),abs(max1-min1))

```

Code 24

---

## Max (j-i) such that A[i]<=A[j] MEDIUM

| O(NLogN) | O(1) |
| --- | --- |

```
Sort (arrayelement,index) pair
maxIndex = a[len - 1].second
ans = 0
Loop i : Len-2 to 0
    ans = max(ans, maxIndex - a[i].second)
    maxIndex = max(maxIndex, a[i].second)
return ans

```

## Next permutation Implementation MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Find largest i such that A[i]<A[i+1]
If not found reverse whole and return
Find Largest j after i such that A[i]<A[j]
Swap(A[i],A[j])
Reverse(A[i+1],A[end])

```

Code 27

## Number occuring > n/3 times in linear time MEDIUM

| O(N) | O(1) |
| --- | --- |
| Property : On removing 3 different element, property of n/3 repeating element do not change |  |

```
Consider 2 element and its count
iterate
    1: if less than 2 element then insert
    2: if same as any increment count
    3: if not same decrement count of both

```

Code 30

Similar for n/2

## Find queue using Number of taller people in front data EASY

| O(N^2) | O(N) |
| --- | --- |

```
Sort according to height
Traverse LTR
    insert height at (# Person Taller)th empty position

```

Code 199

| O(NLogN) | O(N) |
| --- | --- |

```
Binary Index Tree to store empty position location

```

## Find if reachable to last with jump size EASY

| O(N) | O(1) |
| --- | --- |

```
Traverse and update max reachable, at last check it with n

mx = A[0]
i = 1
while i <= mx
    mx = max(mx, i+A[i])
    i++
    break if mx >= len
if mx >= len-1 return true
else return false

```

Code 215

## Stock Buy and Sell for max profit EASY

| O(N) | O(1) |
| --- | --- |

```
Buy at Local Minima (Not at Last element), Sell at Local Maxima

```

Code 177

## Stock Buy and Sell for max profit 1 transaction EASY

| O(N) | O(1) |
| --- | --- |

```
Traverse and Store prefix min, calculate max of current-prefixmin

```

## Stock Buy and Sell for max profit 2 transaction MEDIUM

| O(N) | O(N) |
| --- | --- |

```
Dynaminc Programming
V[n] = 0
// V[i] stores max profit using 1 transaction from i to end
Loop i : len-1 to 0
    max = max(A[i],max)
    V[i] = max(V[i+1],max-A[i])
// V[i] stores max profit using 2 transactions
Loop i : 0 to len-1
    min = min(min,A[i])
    v[i] = max(v[i-1],v[i+1]+A[i]-min)
return v[len-1]

```

Code 274

# String

---

- General String
- Multiply 2 numbers in string MEDIUM
- Inplace replace space with $$$ EASY
- Find Longest palindromic substring MEDIUM
- Nearest Palindrome Number
- Palindrome Prime more than N
- Implement strstr KMP MEDIUM
- Min Char to insert at begin to make string palindrome
- Find common time at which all strings become same again 1 2 3 .. MEDIUM
- Roman to numberber MEDIUM
- Number to roman MEDIUM

## General String

```
rotation = strstr(s2+s2,s1)

Characters to change to make string palindrome
    count str[i]!=str[n-1-i]

Number of binary string of length n without consecutive 1s
    Ans = (n+2)th Fib Number

Sum-of-pairwise-hamming-distance
    Traverse each bit position
    sum += 2*(#1)*(#0) at position i

```

## Multiply 2 numbers in string MEDIUM

| O(N^2) | O(1) |
| --- | --- |

```
Loop i : B length to 0
    add A B[i] times and add 0s at last
    add this to ans

```

Code 89

## Inplace replace space with $$$ EASY

| O(N) | O(1) |
| --- | --- |

```
Insert 2*numberofspace places at end
2 Pointer, one at array end, one at original end
Start from RTL, Copy if not space, else write $$$

```

## Find Longest palindromic substring MEDIUM

| O(N^2) | O(1) |
| --- | --- |
| Keep Track |  |

```
Consider length of odd/even length palindrome, by expanding from center

Loop i = 0 to n-1
    ODD
    l = i-1, h = i+1
    expand if s[l]=s[h]
        l--, h++

    EVEN if s[i] = s[i+1]
    l = i-1, h = i+2
    expand if s[l]=s[h]
        l--, h++

```

## Nearest Palindrome Number

```
Make() : Copies 1st half to 2nd half in reverse
part = 10^(len/2)
one = make(s)
two = make(s/part * part - 1)
three = make(((s/part)+1)*part)
Return nearest of the three

```

## Palindrome Prime more than N

```
Even length palindrome is divisible by 11 except 11

if (8 <= N && N <= 11) return 11;
for (int x = 1; x < 100000; ++x) {
    string s = to_string(x), r(s.rbegin(), s.rend());
    int y = stoi(s + r.substr(1));
    if (y >= N && isPrime(y)) return y;
}
return -1;

```

## Implement strstr KMP MEDIUM

| O(N+M) | O(N) |
| --- | --- |
| KMP Algorithm |  |

```
Pattern Processing
ap[i] = Length of prefix same as suffix from i
j = 0, i = 1
Loop till i = p length
    if p[i] = p[j]
        ap[i] = j+1
        i++, j++
    else if j!=0
        j = ap[j-1]
    else
        ap[i] = j
        i++

Checking
j = 0
Loop i : 0 to text length
    if t[i] = p[j]
        j++
    else if j!=0
        j = ap[j-1]
        i--
    if j = ap.size
        return i-p.len+1
return -1

```

Code 100

## Min Char to insert at begin to make string palindrome MEDIUM

| O(N) | O(N) |
| --- | --- |

```
n = s + "#" + rev(s)
Calculate LPS of n (KMP Algorithm)
Ans = s.length - LPS[last index]

```

| O(N^2) | O(N) |
| --- | --- |

```
Smart Brute Force O(n^2)
Check Longest Palindrome from start
return left out length

```

Code 101

## Find common time at which all strings become same again 1 2 3 .. MEDIUM

| O(N^2) | O(N) |
| --- | --- |

```
Find period of all strings
    p = strstr(s+s+1,s)
Find N such that N*(N+1)/2 divisible by period : Time of each string -> p[]
LCM all N in p[]
lcm = 1
loop i : 0 to p.size
    loop j : i+1 to p.size
        p[j] /= gcd(p[i],p[j])
    lcm *= p[i]

```

Code 102

## Roman to number MEDIUM

| O(LogN) | O(1) |
| --- | --- |

```
If next character is bigger
    subtract current
else
    add current

```

Code 103

## Number to roman MEDIUM

| O(LogN) | O(N) |
| --- | --- |

```
Use table for each place
Unit Place : '', 'I', ... 'IX'
Tens Place : '', 'X', ... 'XC'
Hundereds Place : '', 'C', ... 'CM'

```

Code 104

# Stack and Queue

---

- General Stack Queue
- Stack using Queue EASY
- Queue using Stack EASY
- Longest Valid Parenthesis EASY
- Reverse Stack using Recursion MEDIUM
- Sort Stack using Recursion MEDIUM
- Number of Flips to make parenthesis Balanced EASY
- RNG LNG index EASY
- Get min from stack in O(1) MEDIUM
- Find max in sliding window MEDIUM
- Generate Binary Numbers 1 to N EASY
- First unique char in stream MEDIUM

## General Stack Queue

```
NEAREST GREATER/SMALLER APPLICATION
    Number of subarrays an element will be max = distance lng * distance rng
    Number of subarrays an element will be min = distance lns * distance rns
    Max Rectange in Histogram = max of height * distance (lns, rns)

Infix to Postfix
    Operators in stack :: Higher can come over Lower only (Not even equal)

Postfix Evaluation
    If operator - Push( Pop2 oprator Pop1)

```

## Stack using Queue EASY

| O(N) | O(N) |
| --- | --- |

```
COSTLY DELETE
q1,q2, only one active at a time
insert in active one
while delete, pop all but one from active to non active, then delete, active q changes

COSTLY INSERT
pop from active only
To insert , insert to active, pop all to inactive, change active

```

## Queue using Stack EASY

| O(N) | O(N) |
| --- | --- |

```
COSTLY DELETE
s1,s2
insert to s1 only
pop from s2 only , if empty pop all from s1 to s2 then delete

COSTLY INSERT
pop from s1 only
to insert , pop all to s2, insert in s1, pop s2 back to s1

```

## Longest Valid Parenthesis EASY

| O(N) | O(N) |
| --- | --- |

```
stack = {char,index}
while poping valid bracket, check for max difference

s = {),-1}
Loop i : 0 to len-1
    if A[i] = )
        if s.top().first = (
            s.pop()
            mx = max(mx,i-s.top())
        else
            Empty the stack
            s.push({A[i],i})
    else
        s.push({A[i],i})

```

## Reverse Stack using Recursion MEDIUM

| O(N) | O(1) |
| --- | --- |

```
rev(s)
    x = s.top
    s.pop
    rev(s)
    insertatbottom(x)

insertatbottom(x)
    if s empty
        s.push(x)
        return
    y = s.top
    s.pop
    insertatbottom(x)
    s.push(y)

```

## Sort Stack using Recursion MEDIUM

| O(N^2) | O(1) |
| --- | --- |

```
sort(s)
    x = s.top
    s.pop
    sort(s)
    insertatp(x)

insertatp(x)
    if s empty or s.top < x
        s.push(x)
        return
    y = s.top
    s.pop
    insertatp(x)
    s.push(y)

```

## Number of Flips to make parenthesis Balanced EASY

| O(N) | O(N) |
| --- | --- |

```
* For odd length return false
* Push (,Pop ) if top is (, else push it also
* Ans = ceil(#"("/2) + ceil(#")"/2) in stack (making half of each to match other half)

```

## RNG LNG index EASY

| O(N) | O(N) |
| --- | --- |

```
Nearest Greater
Use Stack
Traverse LTR (LNG) , RTL (RNG)
    Pop until top < X
    Assign top to X
    Push X
Nearest Smaller (Change Sign)

```

Code 61

## Get min from stack in O(1) MEDIUM

| O(1) | O(1) |
| --- | --- |

```
PUSH
if(x<min) push 2*x-min, min = X
POP
if(top<min) min = min*2-top, top = min

```

Code 64

## Find max in sliding window MEDIUM

| O(N) | O(N) |
| --- | --- |

```
Find RNG, if in window move to that else current is max

Loop i : 0 to ans size
    k = rng[i]
    curr = i
    Loop if k != -1 AND k < i+W AND rng[k] < i+W
        curr = k
        k = rng[k]
    if k = -1 OR k >= i+B
        ans[i] = curr
    else
        ans[i] = A[k]

```

Code 65

| O(N) | O(K) |
| --- | --- |

```
Create a dequeue to store element index (Decreasing Order)
1st Element gives max
When Sliding delete 1st element if outside window
While checking, delete elements from end if back < x

```

## Generate Binary Numbers 1 to N EASY

| O(N) | O(N) |
| --- | --- |

```
Use Queue
q = 1
Loop
    x = pop queue
    push x0
    push x1

```

## First unique char in stream MEDIUM

| O(1) | O(1) |
| --- | --- |

```
map m : Store freq
queue q
Loop char c
    Update map
    if m[c] = 1
        q.push(c)
    else
        while q non empty and m[q.front] > 1
            q.pop
    if q empty
        print -1
    else
        print q.front

```

Code 192

# Link List

---

- Reverse Link List EASY
- Reverse Link List Recursion EASY
- Make List L0 LN L1 Ln 1... EASY
- Merge 2 sorted LL EASY
- Find position of starting of cycle start MEDIUM
- Partition List in 2 half (Less than x rest) MEDIUM
- Merge Sort EASY
- Copy List with Random Pointers MEDIUM
- Recursively remove 0 sum contiguous link list

## Reverse Link List EASY

| O(N) | O(1) |
| --- | --- |

```
Take 3 pointers - prev, next, ptr
Travese
    next = ptr -> next
    ptr-> next = prev
    prev = ptr
    ptr = next

```

Code 71

## Reverse Link List Recursion EASY

| O(N) | O(1) |
| --- | --- |

```
head = nullptr
rev(prev,curr)
    if curr->next = nullptr
        head = curr
    else
        rev(curr,curr->next)
    curr->next = prev
main
    rev(nullptr,A)
    return head

```

Code 167

## Make List L0 LN L1 Ln 1... EASY

| O(N) | O(1) |
| --- | --- |

```
Reverse last half
Insert last half nodes in between 1st half nodes
ptr1 = head1, ptr2 = head2, ptr2n
Loop if ptr1 AND ptr2
    ptr2n = ptr2->next
    ptr2->next = ptr1->next
    ptr1->next = ptr2
    ptr2 = ptr2n
    ptr1 = ptr1->next->next
ptr1->next = nullptr;

```

Code 75

## Merge 2 sorted LL EASY

| O(N) | O(1) |
| --- | --- |

```
Take 2 pointers on each list
Take a new pointer
Assign its next to smaller one and increment
Traverse till one ends
Link other to end

```

Code 78

RECURSIVE

```
merge(a,b)
    if !a return b
    if !b return a
    a < b
        a->next = merge(a->next,b)
        return a
    else
        b->next = merge(a,b->next)
        return b

```

This method can be used to flatten LL, by merging one by one

## Find position of starting of cycle start MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Find if loop exist : Fast and slow pointer becomes same
Count length of loop = L ( If ptr from slow reaches it back)
Take a ptr, advance it by L
Take new pointer front = ptr, back = head
Advance both simultaneously untill front->next = back
Back is start of loop

```

Code 80

## Partition List in 2 half (Less than x rest) MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Take 2 pointer : ptr1 = nullptr, ptr2 = head
Till ptr2 reaches end
    If next of ptr2 less than x,
        Advance ptr2
    else
        make next as next of ptr1
        advance ptr1

```

Code 81

## Merge Sort EASY

| O(NLogN) | O(1) |
| --- | --- |

```
Base : if length = 2, swap if not in order, return new head
Calculate mid, break link
Call recursive sort on head and mid => New Heads
Call mergesortedlist on both new heads

```

Code 83

## Copy List with Random Pointers MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Take hash = <old address, new address>
Copy list with next pointers, store addresses in hash
Traverse List again
    new node random = hash(old address)

```

Code 84

## Recursively remove 0 sum contiguous link list nodes

```
remove(head)
    if(!head) return NULL
    if(!head->val) return remove(head->next)
    if(!head->next) return head
    ListNode *deltill = head, *ptr = head
    long long int sum = 0
    while(ptr)
        sum += ptr->val
        ptr = ptr->next
        if(sum == 0) deltill = ptr
    ListNode *newhead = deltill
    if(newhead)
        newhead->next = remove(newhead->next)
    return newhead

```

# Tree Data Structure

---

- Find max Depth EASY
- Find Diameter MEDIUM
- Find ancestors EASY
- Max abs difference with ancestor
- Find LCA MEDIUM
- Find LCA in BST EASY
- Check Tree Symmetric MEDIUM
- Make tree its mirror image EASY
- Flatten Tree MEDIUM
- Connect same level nodes MEDIUM
- Tree from inorder and preorder MEDIUM
- Tree from inorder and postorder MEDIUM
- Level order Traversal EASY
- Level order Traversal ZigZag MEDIUM
- Inorder Traversal without Recursion MEDIUM
- Preorder Traversal without Recursion MEDIUM
- Postorder Traversal without Recursion MEDIUM
- Vertical Traversal MEDIUM
- BT to DLL Inplace Inorder MEDIUM
- DLL to Balanced BST Inplace MEDIUM
- Inorder Successor of BST Node EASY
- Number of Heap from distinct Keys MEDIUM
- Find all Root to Leaf Path Sum is B EASY

## Find max Depth EASY

| O(N) | O(1) |
| --- | --- |

```
depth(A)
    if A->left = A->right = null
        return 1
    return 1 + max(depth( A->left ),depth( A->right ))

```

Code 186

## Find Diameter MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Diameter = max path from one leaf to other
         = max(lh+rh+1, dia(node->left), dia(node->right))

dia(r,*h)
    lh = rh = 0
    if !r
        h = 0
        return 0
    dial = dia(r->left,&lh)
    diar = dia(r->right,&rh)
    h = max(lh,rh)+1
    return max(lh+rh+1,dial,diar)

```

| O(n) | O(n) |
| --- | --- |

```
N-Ary Tree
dia(A)
    create undirected graph from tree : Adj List 2D vector
    Call bfs on root, get farthest node
    Now call bfs on the farthest node to find max distance
    Use same bfs to return height and node index

```

Code 280

## Find ancestors EASY

| O(N) | O(1) |
| --- | --- |

```
find(r,x)
    if r->data = x
        return true
    if find(r->left,x) || find(r->right,x)
        print r->data
        return true
    return false

Or pass vector for order root to leaf

```

## Max abs difference with ancestor

```
public int maxAncestorDiff(TreeNode root) {
    return dfs(root, root.val, root.val);
}
public int dfs(TreeNode root, int mn, int mx) {
    if (root == null) return mx - mn;
    mx = Math.max(mx, root.val);
    mn = Math.min(mn, root.val);
    return Math.max(dfs(root.left, mn, mx), dfs(root.right, mn, mx));
}

```

## Find LCA MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Find a node that has x in one half, y in other half

lca(A,x,y)
    if !A return -1
    if !find(A,x) OR !find(A,y) return -1
    if A->val = B||C return A->val
    if find(A->left,x) && find(A->left,y)
        return lca(A->left,x,y)
    if find(A->right,x) && find(A->right,y)
        return lca(A->right,x,y)
    return A->val

```

## Find LCA in BST EASY

| O(N) | O(1) |
| --- | --- |

```
If both exists, we need to find node in between both

while root
    if root > x,y
        root = root->right
    elif root < x,y
        root = root->left
    else return root

```

## Check Tree Symmetric MEDIUM

| O(N) | O(1) |
| --- | --- |

```
check(A,B)
    if A==B==NULL
        return 1
    if A->val != B->val || A==NULL!=B || B==NULL!=A
        return 0
    return check(A->left,B->right) && check(A->right,B->left)
main(A)
    if !A return 1
    return check(A->left,A->right)

```

Code 201

## Make tree its mirror image EASY

| O(N) | O(1) |
| --- | --- |

```
invert(A)
    if !A return NULL
    swap(A->left,A->right)
    invert(A->left)
    invert(A->right)
    return A

```

Code 205

## Flatten Tree MEDIUM

| O(N) | O(1) |
| --- | --- |

```
flatten left and then attach it to right, then go right

flatten(A)
    if(!A) return NULL
    if(A->left)
        flatten(A->left)
        if(A->right)
            ptr = A->left
            while(ptr->right)
                ptr = ptr->right
            ptr->right = A->right
        A->right = A->left
        A->left = NULL
    flatten(A->right)
    return A

```

Code 208

## Connect same level nodes MEDIUM

| O(n) | O(1) |
| --- | --- |

```
TreeLinkNode* nextStart = NULL;     // Start of next level
TreeLinkNode* prev = NULL;          // Leading node of next level
TreeLinkNode* curr = A;             // Current Node
while(curr){
    while(curr){
        if(curr->left){
            if(prev)
                prev->next = curr->left;
            else
                nextStart = curr->left;
            prev = curr->left;
        }
        if(curr->right){
            if(prev)
                prev->next = curr->right;
            else
                nextStart = curr->right;
            prev = curr->right;
        }
        curr = curr->next;
    }
    curr = nextStart;
    prev = NULL;
    nextStart = NULL;
}

```

| O(N) | O(N) |
| --- | --- |

```
Level Order traversal, join Adjacent nodes at same level

```

## Tree from inorder and preorder MEDIUM

| O(N) | O(1) |
| --- | --- |

```
A = Preorder
B = Inorder
make(A,B,l,h,index)
    if l>h or index > size
        return NULL
    node = new Node(A[index])
    if l==h
        return node
    find A[index] in B = i index [Use Hashing for efficient search]
    node->left = make on left half of B , index+1
    node->right = make on right half of B , index+1+i-l
    return node
main
    make(A,B,0,len-1,0)

```

Code 206

## Tree from inorder and postorder MEDIUM

| O(N) | O(1) |
| --- | --- |

```
A = Postorder
B = Inorder
make(A,B,l,h,index)
    if l>h or index > size
        return NULL
    node = new Node(A[index])
    if l==h
        return node
    find A[index] in B = i index
    node->left = make on left half of B , index-1-h+i
    node->right = make on right half of B , index-1
    return node
main
    make(A,B,0,len-1,len-1)

```

Code 206

## Level order Traversal EASY

| O(N) | O(W) |
| --- | --- |

```
BFS(r)
    q = r
    while q not empty
        visit x = q.pop
        push x->left, x->right

Or
Recursively call Print kth level from k 0 to max depth

```

## Level order Traversal ZigZag MEDIUM

| O(N) | O(W) |
| --- | --- |

```
stack s1,s2
s1 = root
while s1 not empty
    while s1 not empty
        visit s1 top and pop
            if f
                insert left,right child in s2
            else
                insert right,left child in s2
    swap s1,s2
    f = 1-f

```

Code 234

## Inorder Traversal without Recursion MEDIUM

| O(N) | O(Height) |
| --- | --- |
| Reverse Inorder : Interchange left, right |  |

```
ptr = root
while stack not empty OR ptr
    if ptr
        s.push(ptr)
        ptr = p->left
    else
        pp = s.top
        v.push(pp->val)
        s.pop
        ptr = pp->right

```

Code 181

WITHOUT STACK ALSO

| O(N) | O(1) |
| --- | --- |

```
Morris Traversal = Create link between inorder successor

if !r return
curr = root
while curr
    if !curr->left
        visit curr
        curr = crr->right
    else
        // Find Inorder Predecessor
        pre = curr->left
        while pre->right && pre->right != curr
            pre = pre->right
        // Make curr right of predecessor
        if !pre->right
            pre->right = curr
            curr = curr->left
        // Revert Change
        else
            pre->right = NULL
            visit curr
            curr = curr->right

```

## Preorder Traversal without Recursion MEDIUM

| O(N) | O(Height) |
| --- | --- |

```
ptr = root
while stack not empty OR ptr
    if ptr
        s.push(ptr)
        v.push(ptr->val)
        ptr = p->left
    else
        pp = s.top
        s.pop
        ptr = pp->right

```

Code 183

## Postorder Traversal without Recursion MEDIUM

| O(N) | O(Height) |
| --- | --- |

```
Postorder = reverse of recursive inorder with right subtree travelled before left subtree : rev(Root,Right,Left)

ptr = root
while stack not empty OR ptr
    if ptr
        s.push(ptr)
        v.push(ptr->val)
        ptr = p->right
    else
        pp = s.top
        s.pop
        ptr = pp->left
reverse v

```

Code 265

## Vertical Traversal MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Order of vertical line maintained : Level Order Traversal
q = {root,0}
while q not empty
    p = q.front
    q.pop
    m[p.second].push(p.first->val)
    q.push({p.first->left,p.second-1})
    q.push({p.first->right,p.second+1})

```

Code 196

## BT to DLL Inplace Inorder MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Do Inorder traversal, pass prev, increment prev and change links when visit

bToDLL(root,head)
    if !root return
    static prev = NULL
    bToDLL(root->left,head)
    if(*head==NULL)
        prev=NULL
        *head=root
    else
        root->left=prev
        prev->right=root
    prev=root
    bToDLL(root->right,head)

```

Code 242

## DLL to Balanced BST Inplace MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Nodes inserted in same order as DLL - Inorder
Recursively construct left subtree
insert root
Recursively construct right subtree

make(&head,n)
    if n <= 0
        return null
    left = make(head,n/2)
    root = head
    root->prev = left
    head = head->next
    root->next = make(head,n - 1 - n/2)

```

| O(NLogN) | O(1) |
| --- | --- |

```
make(first,last)
    find mid
    mid->left = make(first,mid)
    mid->right = make(mid+1,last)

```

## Inorder Successor of BST Node EASY

| O(N) | O(1) |
| --- | --- |

```
Find the node
If node has right child
    Go to right child and travel left till end
else
    while seaching latest parent at which left treversal done

ptr = root, par = null
while ptr!=x
    if ptr > B
        par = ptr
        ptr = ptr->left
    else
        ptr = ptr->right
if ptr->right
    ptr = ptr->right
    while ptr->left
        ptr = ptr->left
    return ptr
else
    return par

```

Code 180

## Number of Heap from distinct Keys MEDIUM

| O(N^2) | O(N^2) |
| --- | --- |

```
Use Memoization for Efficiency
Structure Fixed , min or max at top
T(1) = T(2) = 1
T(3) = 2
T(N) = (N-1)C(K) * T(K) * T(N-1-K)
K = # Leaf in Left Subtree => Calculate Manually

```

Code 179

## Find all Root to Leaf Path Sum is B EASY

| O(N) | O(N) |
| --- | --- |

```
allPath(ans,t[],A,B)
    if !A
        return
    t.push_back(A->val)
    if A leaf and B = A.val
        v.push_back(t)
        return
    if(A->left)
        allPath(v,t,A->left,B-A->val)
    if(A && A->right)
        allPath(v,t,A->right,B-A->val)

```

Code 263

# Graph Data Structure

---

- General Graph
- BFS on Graph EASY
- Level Order of Tree EASY
- DFS on Graph EASY
- Check if 2 nodes in same path from root to leaf EASY
- Detect cycle in undirected Graph EASY
- Detect cycle in directed Graph EASY
- Union Find to detect Cycle
- Number of disjoint set if 2 words belong to same set if they differ in only 2 location
- Check Graph Strongly Connected EASY
- Find all Strongly Connected Components MEDIUM
- Topological Sort DAG EASY
- Shortest Path Source to all DAG MEDIUM
- Min K numbers from powers of 3 prime numbers MEDIUM
- MST MEDIUM
- Shortest Path Source to all MEDIUM
- Shortest Path all to all MEDIUM
- Clone undirected graph MEDIUM

## General Graph

```
Number of triangle in undirected graph
    Trace(A^3) / 6

```

## BFS on Graph EASY

| O(V+E) | O(N) |
| --- | --- |

```
Boolean Visited Array needed as cycle may be present

visited[start] = true
q = start
while q not empty
    s = q.pop
    print s
    for all i adj of s
        if !visited[i]
            visited[i] = true
            q.push(i)

```

Check number of connected components : #BFS called

## Level Order of Tree EASY

| O(V+E) | O(N) |
| --- | --- |

```
q.push root
q.push NULL
while(q not empty)
    t = q.pop
    if t = NULL
        print newline
        q.push(NULL)
    else
        print t.val
        q.push q.left,right if exists

```

Code 255

## DFS on Graph EASY

| O(V+E) | O(N) |
| --- | --- |

```
Boolean Visited Array needed as cycle may be present

dfsreachable(start)
    visited[start] = true
    print start
    for all i adj of s
        if not visited[i]
            dfsreachable(i)
dfs()
    for all vertex v
        if not visited[v]
            dfsreachable(v)

```

Number of times dfsreachable called = Number of connected Components

## Check if 2 nodes in same path from root to leaf EASY

| O(V+E) | O(N) |
| --- | --- |

```
* DFS, calculate intime and outtime of u,v
* True if in[u]<in[v] & out[u]>out[v] or in[u]>in[v] & out[u]<out[v]
* This representats direct ancestor relationship

```

## Detect cycle in undirected Graph EASY

| O(E+V) | O(N) |
| --- | --- |

```
DFS / BFS
If any adjacent is already visited that is not a parent then graph has cycle

```

```
DFS
hascycle(start,parent)
    visited[start] = true
    print start
    for all i adj of s
        if not visited[i]
            if hascycle(i,s)
                return true
        else if i not equal parent
            return true
    return false
dfs()
    for all vertex v
        if not visited[v]
            hascycle(v,-1)

```

```
BFS
bfs(start)
    visited[start] = true
    q = start
    p[start] = -1
    while q not empty
        s = q.pop
        print s
        for all i adj of s
            if !visited[i]
                visited[i] = true
                q.push(i)
                parent[i] = s
            else if i not equal s
                return true
    return false

```

## Detect cycle in directed Graph EASY

| O(V+E) | O(N) |
| --- | --- |

```
If back edge present in dfs
Back Edge = Edge to node itself to any ancestor of dfs traversal

Apply DFS, also keep track of vertex in recursion stack using boolean array
If a node is reached that is already in stack then cycle present

hascycle(start)
    if not visited[start]
        visited[start] = true
        stack[start] = true
        print start
        for all i adj of s
            if not visited[i] and hascycle(i) is true
                return true
            else if stack[i]
                return true
    stack[start] = false
    return false

```

| O(V+E) | O(N) |
| --- | --- |

```
Create adjacency list
Call bfs for all unvisited virtices
In bfs function create local visited array to check if any vertex adjacent to already visited vertex in current bfs call
Also update in the global visited array

```

Code 281

## Union Find to detect Cycle

```
Used to form disjoint sets

If vertex of a edge belong to same subset then cycle exists
p[i] = -1 (No parent) or j (j is the parent of i)
Find : Find subset of x
Union : Joins two subset

find(x)
    if p[x] = -1
        return x
    return find(p[x])

Union(x,y)
    px = find(x)
    py = find(y)
    if px !- py
        p[px] = py

hascycle()
    Loop edge i,j
        if find(i)==find(j)
            return true
        union(x,y)
    return 0

```

If graph connected, undirected and acyclic : its a tree

## Number of disjoint set if 2 words belong to same set if they differ in only 2 location

```
isSimilar() : Returns true if word belong to same set

par[i] = i

root(i,par[])
    while i != par[i]
        par[i] = par[par[i]]
        i = par[i]
    return i

Loop i : 0 to len-2
    Loop j : i+1 to len-1
        pi = root(i,par)
        pj = root(j,par)
        if isSimilar and pi != pj
            par[pi] = pj

bool visited[i] = false
Loop i: 0 to len-1
    if !visited(root(i,par))
        visited(root(i,par)) = 1
        count++

```

## Check Graph Strongly Connected EASY

| O(V+E) | O(N) |
| --- | --- |

```
Strongly Connected = Every Vertex can reach every other vertex

Do DFS from v, If any vertex not visited return false
Reverse Edges
Do DFS from same v, If any vertex not visited return false
Return true

```

## Find all Strongly Connected Components MEDIUM

| O(V+E) | O(N) |
| --- | --- |

```
1) Create an empty stack ‘S’ and do DFS traversal of a graph. In DFS traversal, after calling recursive DFS for adjacent vertices of a vertex, push the vertex to stack. In the above graph, if we start DFS from vertex 0, we get vertices in stack as 1, 2, 4, 3, 0.
2) Reverse directions of all arcs to obtain the transpose graph.
3) One by one pop a vertex from S while S is not empty. Let the popped vertex be ‘v’. Take v as source and do DFS (call DFSUtil(v)). The DFS starting from v prints strongly connected component of v. In the above example, we process vertices in order 0, 3, 4, 2, 1 (One by one popped from stack).

```

## Topological Sort DAG EASY

| O(V+E) | O(N) |
| --- | --- |

```
Edge (u,v) = u must come before v in topological sort

```

```
DFS Method : Print when dfs on all its adjacent done : In order of departure time

stack s
topo(start)
    visited[start] = true
    print start
    for all i adj of s
        if not visited[i]
            topo(i)
    s.push(s)

print stack top to bottom

```

```
Kahn Method : Always take vertex with indegree 0 and then remove it

for all edge u,v
    indeg[v]++
for all i with indeg[] = 0
    q.push(i)
c = 0
while q not empty
    c++
    s = q.pop
    print s
    loop i = adj q
        indeg[i]--
        if !indeg[i]
            q.push(i)
if c != V
    cycle in DAG

```

## Shortest Path Source to all DAG MEDIUM

| O(V+E) | O(V) |
| --- | --- |

```
dist[V] = INF
dist[s] = 0
Do Topolocal Sorting of Vertices
Loop u = Topolocal Sort
    for all v = adj of u
        if (dist[v] > dist[u] + weight(u, v))
            dist[v] = dist[u] + weight(u, v)

```

## Min K numbers from powers of 3 prime numbers MEDIUM

| O(N) | O(N) |
| --- | --- |

```
BFS - Insert adjacent nodes in set, Take min of them to traverse
s = p1,p2,p3
while k printed
    a = s[0]
    s.erase(begin)
    print(a)
    s.insert a*p1, a*p2, a*p3

```

Code 213

## MST MEDIUM

PRIMS Adj Matrix = O(V^2) Adj List = O(ELogV) Select min edge connecting the existing mst

```
set s
priority queue pq
pq[v] = INF
pq[s] = 0
while s.size != V-1
    select u : min from pq and not in s
        All v adj to u not in s
            if pq[v] > edge(u,v)
                pq[v] = edge(u,v)
    insert u to s

```

Code 282

KRUSKAL Select any min edge not forming cycle with existing mst

```
Sort edges
Take min that does not forms cycle
Repeat till V-1 edges selected

```

## Shortest Path Source to all MEDIUM

DIJKSTRA Similar to prims Adj Matrix = O(V^2) Adj List = O(ELogV) Fib Heap and Adj List = O(VLogV)

```
set s
priority queue pq
pq[v] = INF
pq[s] = 0
while s.size != V-1
    select u : min from pq and not in s
        All v adj to u
            if pq[v] > pq[u] + edge(u,v)
                pq[v] = pq[u] + edge(u,v)
    insert u to s

```

BELLMAN FORD

| O(VE) | O(V) |
| --- | --- |
| Works on -ve weights |  |
| DP Approach |  |

```
pq[v] = INF
pq[s] = 0
Loop V-1 times
    Loop each edge u,v
        if pq[v] > pq[u] + edge(u,v)
            pq[v] = pq[u] + edge(u,v)
Loop each edge u,v
    if pq[v] > pq[u] + edge(u,v)
        Graph has -ve weight cycle

```

## Shortest Path all to all MEDIUM

FLOYD WARSHALL

| O(V^3) | O(V^2) |
| --- | --- |
| DP Approach |  |

```
Intermediate Nodes are part of shortest path

dist[][] = AdjMatrix
Loop k : 0 to V-1
    Loop i : 0 to V-1
        Loop j : 0 to V-1
            if (dist[i][k] + dist[k][j] < dist[i][j])
                    dist[i][j] = dist[i][k] + dist[k][j];

```

Can also be used to form Transitive closure to find existence of path Just use boolean matrix reach[i][j] = reach[i][j] || (reach[i][k] && reach[k][j])

## Clone undirected graph MEDIUM

| O(N) | O(N) |
| --- | --- |

```
Given a node of graph, each node has val and vector of its neighbors
Travese graph and create map of old and new
Traverse map and insert corresponding neighbors

map[old] = new
q.push(node)
while q not empty
    t = q.pop
    if t not in map
        n = node(t.val)
        m[t] = n
        push all neighbors of t not in map to queue
loop i : m
    loop j : i.first.neighbors
        i.second->neighbors.push_back(m[j])
return m[node]

```

Code 262

# Two Pointers

---

- Find all 2 element sum is B in sorted array MEDIUM
- Find if pair with difference k exist in sorted
- Sum of pair from 2 sorted array closest to X EASY
- Intersections of 2 interval lists
- Remove Given Element EASY
- Smallest Subarray with sum>=S MEDIUM
- Number of subarrays with sum in range B,C MEDIUM
- Count of triplets i,j,k with sum s
- Find min(max(a,b,c)-min(a,b,c)) in 3 array HARD
- Number of triangles with given lenghts of sides
- Area of max water trapped between two containers
- Area of total water trapped between containers

## Find all 2 element sum is B in sorted array MEDIUM

| O(N) | O(1) |
| --- | --- |

```
l = 0, h = len-1
while l<h
    if B = A[l]+A[h]
        print
    if B < A[l]+A[h]    //Important No else if
        h--
    else
        l++

```

For 3,4 element sum, Fix 1st,2nd apply above on rest

## Find if pair with difference k exist in sorted array MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Loop i : 0 to len-1
    j = max(j,i+1)
    while j < len AND a[j]-a[i] < k
        j++
    if j < len and a[j]-a[i] = k
        return true
return false

```

Code 138

| O(NLogN) | O(1) |
| --- | --- |

```
Iterate Array, binary search for a[i]+k

```

Code 139

## Sum of pair from 2 sorted array closest to X EASY

| O(N) | O(1) |
| --- | --- |

```
A,B
l = 0
r = B.len-1
diff = INF
ans = diff
Loop till boundary crossed
    if abs(A[l] + B[r] - X) < diff
        update diff and result
    else if(ar1[l] + ar2[r] <  sum )
        l++
    else
        r--

```

## Intersections of 2 interval lists

```
for (int i=0, j=0; i<A.size() && j<B.size(); ) {
    int af=A[i].front(), ab=A[i].back();
    int bf=B[j].front(), bb=B[j].back();
    if (!(af > bb || ab < bf))
        res.push_back({max(af, bf), min(ab, bb)});
    if (ab <= bb) i++;
    if (ab >= bb) j++;
}
return res;

```

## Remove Given Element EASY

| O(N) | O(1) |
| --- | --- |

```
Take 2 pointers
Loop j : 0 to len
    if A[j] != x
        A[i] = A[j]
        i++
    j++

```

Code 130

# Subarrays with sum S EASY

| O(N) | O(1) |
| --- | --- |

```
Two pointers from start, increment each to make sum close to s

i = j = 0
sum = a[0]
while i < len
    if i > j
        i = j = j+1
        sum = a[i]
    if sum = S
        return i,j
    elif sum > B
        sum -= a[i]
        i--
    else
        if j = n-1
            break
        j++
        sum += a[j]
return false

```

Code 155

## Smallest Subarray with sum>=S MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Loop i : 0 to len-1
    sum += a[i]
    while sum >= s
        check and update min
        sum -= a[start]

Use 2 pointers, also check min length and adjust sum
i = j = 0
Loop till j < Len
    if(j<i) j = i
    if(sum = B)
        i++ j++
    elif(sum<B)
        j++
    else
        i++

```

Code 18

## Number of subarrays with sum in range B,C MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Take 2 Pointers, i = j = 0
sum = A[0]
while i < A.size
    if sum > C OR j = A.size
        i++
        sum = A[i]
        j = i
    else
        if sum >= B AND sum <= C
            ans++
        j++
        sum += A[j]

```

Code 133

## Count of triplets i,j,k with sum s

```
store count in map m
for auto i:m
    for auto j:m
        k = m[s-i-j]
        if i = j = k
            ans += m[i] * (m[i]-1) * (m[i]-2) / 6
        elif i = j
            ans += m[i] * (m[i]-1) * m[k] / 2
        elif i < j < k
            ans += m[i] * m[j] * m[k]

```

## Find min(max(a,b,c)-min(a,b,c)) in 3 array HARD

| O(N) | O(1) |
| --- | --- |

```
Start from max of all 3 array, calc diff
Always decrement pointer of max element as to decrease the diif

```

Code 137

## Number of triangles with given lenghts of sides MEDIUM

| O(NLogN) | O(1) |
| --- | --- |

```
Sort lengths
Take 2 pointers start, end
Find upperbound of difference, add number of elements in between upperbound and end ptr to sum

i = 0, j = n-1
while j-i > 1
    k = upperbound A[j]-A[i] in A[i+1] to A[j-1]
    sum += A.begin + j - k
    if A[i] != A[j] AND j-i > 2
        i++
    else
        i = 0
        j--

```

Code 134

## Area of max water trapped between two containers MEDIUM

| O(N) | O(1) |
| --- | --- |

```
2 pointers, start end, increment min

```

Code 142

## Area of total water trapped between containers with solid area MEDIUM

| O(N) | O(N) |
| --- | --- |

```
water = min(prefixmax,suffixmax) - own-area

```

Code 143

# Hashing

---

- Check any pair sum is B EASY
- Max subarray with sum 0 EASY
- Check Subarray sum % k = 0
- Number of a+b+c+d = 0, 4 arrays
- Count of a[i] & a[j] & a[k] = 0, can repeat
- Longest substring with more 1s than 0s
- Result after Swap B times, ith swap is swap :
- Find employees under managers EASY
- Check any subsequence repeat MEDIUM
- Number of subarray with k distict numbers
- Longest substring with no repeats MEDIUM
- Longest consecutive unordered number subsequence
- Check array partitioning into pair with sum
- Max number of colinear points MEDIUM
- String pairs that are palindrome when concat

## Check any pair sum is B EASY

| O(N) | O(N) |
| --- | --- |

```
Loop over array
    find B-A[i] in map
    if found return values
    else insert A[i],i in map

```

Code 114

## Max subarray with sum 0 EASY

| O(N) | O(N) |
| --- | --- |

```
Put prefix sum with 1st index in Hash
m[0] = -1               // Important
Loop over array
    Find prefix sum in hash
    if found
        check for max length
    else
        insert sum,i in map

```

Code 116

All Array Store index in map vector Take all combination for given sum Count Array Store count in map Take sum of NC2

## Check Subarray sum % k = 0

```
Store prefix sum remainder index in map
For k = 0, store prefix sum

```

## Number of a+b+c+d = 0, 4 arrays

```cpp
unordered_map<int, int> AB;
for (int a : A)
    for (int b : B)
        AB[a + b]++;
for (int c : C)
    for (int d : D)
        res += AB[-c - d];
return res;

```

## Count of a[i] & a[j] & a[k] = 0, can repeat

```
unordered_map<int, int> tuples;
for (auto a : A)
    for (auto b : A) ++tuples[a & b];
for (auto a : A)
    for (auto t : tuples)
        if ((t.first & a) == 0) cnt += t.second;
return cnt;

```

## Longest substring with more 1s than 0s

```
unordered_map<int, int> seen;
for (int i = 0; i < n; ++i) {
    score += a[i] ? 1 : -1;
    if (score > 0) {
        res = i + 1;
    } else {    // Stores -ve scores
        if (seen.find(score) == seen.end())
            seen[score] = i;
        if (seen.find(score - 1) != seen.end())
            res = max(res, i - seen[score - 1]);
    }
}

```

## Result after Swap B times, ith swap is swap : imodN,(i+C)modN th char of string HARD

| O(N) | O(N) |
| --- | --- |

```
Create integer array of N size, with values 0,1,2...
Swap it N times
This represents index of char after n swaps

Swap string B/N times using this map
Swap string B%N times normally

```

Code 246

## Find employees under managers EASY

| O(N) | O(N) |
| --- | --- |
| Mapping Employee-Direct Manager given |  |

```
Create reverse map[Manager] = vector[Direct Employee]
Iterate over map recursively find sum of numbers of juniors
If not present in rev map then it is 0

OR
Iterate given map = i
    Iterate i till m[i] = i
        ans[m[i]]++;
        next i = m[i]

```

## Check any subsequence repeat MEDIUM

| O(N) | O(N) |
| --- | --- |

```
If subsequence repeats then 2 length subsequene also repeats

Count of any char is >= 3,
    Return true
str = ""
Traverse string and add char to str if count is 2
CHECK PALINDROME
2 pointer at start,end
    if str[start] != str[end]
        return true
    else
        start++, end--

```

## Number of subarray with k distict numbers

VERY IMPORTANT CONCEPT Can Solve

- Longest substring with no repeated char (count = end-start)
- Longest substring with atmost k distict char (count = k)
- Min length substring with all char of pattern (Use count map)

```
exactyK(a[],k)
    atmostK(a[],k) - atmostK(a[],k-1)

atmostK(a[],k)
    map m
    start = end = count = ans = 0
    while end < len-1
        m[a[end]]++
        if m[a[end]] == 1
            count++
        end++
        while start < end AND count > k
            m[a[start]]--
            if m[a[start]] == 0
                count--
            start++
        ans += end - start
    return ans

```

count represents count of distict numbers in window

## Longest substring with no repeats MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Take start as 0, and vector to save index (initially -1)
if(char index in v >= start) start = that index in v + 1

```

Code 123

## Longest consecutive unordered number subsequence in array MEDIUM

| O(N) | O(1) |
| --- | --- |

```
Put elements in unordered set
Loop till set empty
    it = s.begin
    v = it.value
    c = 1
    loop until v+1 not found
        delete v from set
        v = v+1
        c++
    v = it.value
    loop until v-1 not found
        delete v from set
        v = v-1
        c++
    delete it
    max = max(c,max)

```

## Check array partitioning into pair with sum divisible by k possible MEDIUM

| O(N) | O(N) |
| --- | --- |

```
Create array of size k = C
Traverse array
    C[A[i]%k]++
Now Check C Palindrome, also if odd lenght, mid should be even

```

## Max number of colinear points MEDIUM

| O(N^2) | O(N) |
| --- | --- |

```
2 Loops, create map for each point with (slope,count) - calculate max count
- slope = ( Bj-Bi / gcd ) / ( Aj-Ai / gcd ) gives unique fraction

Loop i : 0 to A.size
    Loop j : i to A.size
        if A[i] = A[j] AND B[i] = B[j]
            curr ++
        elif A[i] = A[j]
            m[inf]++
        elif B[i] = B[j]
            m[0]++
        else
            gcd = gcd( |B[j]-B[i]| , |A[j]-A[i]|)
            x = ( Bj-Bi / gcd ) / ( Aj-Ai / gcd )
            if x found in map
                m[x]++
            else
                m[x] = 1
    Loop Map
        max = max(max,curr+m[i])
    Clear map

```

Code 122

## String pairs that are palindrome when concat

```
map : stores reverse of words
Add "" string with all palindromes
For each string s
    Partition s into 2 part left, right
    if left in map other that current word, right is palindrome
        push to answer
    if right in map other that current word, left is palindrome
        push to answer

```

# Heap and Maps

---

- Get k smallest/largest elements EASY
- LRU MEDIUM
- Median in Stream
- Sort Array where element atmost k position far

## Get k smallest/largest elements EASY

| O(NLogK) | O(N) |
| --- | --- |

```
For Smallest Elements use Max Heap
For Largest Elements use Min Heap

SMALLEST
Insert first k elements in heap
Traverse remaining array
    if A[i] < heap root
        delete root and insert A[i]

Heap Root gives Kth smallest element

LARGEST
Insert first k elements in heap
Traverse remaining array
    if A[i] > heap root
        delete root and insert A[i]

Heap Root gives Kth largest element

```

## LRU MEDIUM

| O(N) | O(N) |
| --- | --- |

```
Map 1 = Index, Key
Map 2 = Key, index
Delete lowest index from map 1 if capacity reached
Insert new index as max index + 1

```

Code 147

## Median in Stream

```cpp
priority_queue<long> small,large
insert(x)
    large.push(-x)
    if(small.size > large.size)
        small.push(x)
        large.pop
median()
    return small.size > large.size ? small.top : small.top - large.top / 2

```

## Sort Array where element atmost k position far from correct MEDIUM

| O(NLogK) | O(N) |
| --- | --- |

```
Build min heap with first k+1 elements in O(k) time
Repeat
    Extract min, place it at 1st position in O(LogK)
    Insert next element in O(LogK)

```

# Backtracking

---

- General Backtracking
- Tower of Hanoi EASY
- Generate all combinations EASY
- Generate all subsets repeats allowed EASY
- Generate all permutation EASY
- Generate all permutation of string EASY
- Number of different words from char multi set
- N Queen Problem EASY
- Sudoku Solver MEDIUM

## General Backtracking

```
Global ans
In main initialise variables
Do backtracking in separate function
    if final value reached
        ans = temp
        return true
    For all possible values
        add value to temp
        if call function return true
        remove value from temp
    return false

For Knight Problem : Traverse adjacent cells in clockwise direction

```

## Tower of Hanoi EASY

| O(2^N) | O(N) |
| --- | --- |

```
toh(n,from,aux,to)
    if n = 1
        cout 1 from to
    else
        toh(n,from,to,aux)
        cout a from to
        toh(n,aux,from,to)

```

## Generate all combinations EASY

| O(NCK) | O(N^2) |
| --- | --- |

```
S = {}
solve(S,N,K,i)
    if S.size = K
        push S
    if i == A+1
        return
    solve(S,N,K,i+1)
    S.push(i)
    solve(S,N,K,i+1)

```

Code 151

## Generate all subsets repeats allowed EASY

| O(2^N) | O(N^2) |
| --- | --- |

```
S = {}
subset(S,A)
    if A empty
        push S
    Dont Take 1st element : t = A[0], erase A[0]
    subset(S,A)
    Take 1st element : insert t in S
    subset(S,A)
Unique the result at last

```

Code 150

| O(2^N) | O(N^2) |
| --- | --- |

```
X = 2^A.size - 1
Add scaler product of Binary X and A to answer : 0000.. to 111..
Unique the result at last

```

## Generate all permutation EASY

| O(N^2.N!) | O(N^2) |
| --- | --- |

```
S = {}
per(S,A)
    if A empty
        push S to ans
    Iterate over A
        cut ith element from A to S
        per(S,A)
        paste it back to A

```

Code 154

## Generate all permutation of string EASY

| O(2^N) | O(N^2) |
| --- | --- |

```
permute(s,l,h)
    if l == h
        print s
    else
        for i : l to h
            swap(A[l],A[i])
            permute(s,l+1,h)
            swap(A[l],A[i])

```

## Number of different words from char multi set

```
arr has count of chars

int dfs(int[] arr) {
    int sum = 0;
    for (int i = 0; i < 26; i++) {
        if (arr[i] == 0) continue;
        sum++;
        arr[i]--;
        sum += dfs(arr);
        arr[i]++;
    }
    return sum;
}

```

## N Queen Problem EASY

| O(N^2) | O(N^2) |
| --- | --- |

```
nq(B[][],r)
    if r = n
        append B
    Loop i : 0 to n-1
        if check B[r][i] True
            add [r][i]
            nq(B,r+1)
            remove [r][i]

```

Code 149

## Sudoku Solver MEDIUM

| O(N^2) | O(N^2) |
| --- | --- |

```
Make r[9][9], c[9][9]. b[9][9] to store presence of number

solve(r,c,b,S,A,index)
    if index = 81
        A = S
        return true
    rr = index/9, cc = index%9, bb = (rr/3)*3 + cc/3
    if A[rr][cc] = .
        return solve(r,c,b,S,A,index+1)
    Loop i : 1 to 9
        if r[rr][i] = c[cc][i] = b[bb][i] = 0
            r[rr][i] = c[cc][i] = b[bb][i] = 1
            S[rr][cc] = i
            if solve(r,c,b,S,A,index+1) = true
                return true
            else
                r[rr][i] = c[cc][i] = b[bb][i] = 0
                 S[rr][cc] = .
    return false

```

Code 174

# Binary Search

---

- Rank of element in array EASY
- Count Occurrence EASY
- Find min in rotated sorted array MEDIUM
- Find Element in rotated array MEDIUM
- Search Kth number in row col sorted matrix
- Median of row wise sorted matrix MEDIUM
- Median of two sorted array MEDIUM
- Kth min of two sorted array MEDIUM
- Allocate Contiguous Books to K students with min

## Rank of element in array EASY

| O(LogN) | O(1) |
| --- | --- |

```
bs(l,h)
    if x < A[l]
        return l
    if x > A[h]
        return h+1
    m = (l+h)/2
    if A[m] < x
        return bs(m+1,h)
    else if A[m] > x
        return bs(l,m-1)
    else
        return m

```

Code 106

## Count Occurrence EASY

| O(LogN) | O(1) |
| --- | --- |

```
Find First and Last Occurrence and give difference

bsf(l,h,x)
    if l>h OR l==h AND A[l]!=x return -1
    if l==h AND A[l]==x return l
    m = (l+h)/2;
    if A[m] < x
        return bsf(m+1,h,x)
    else
        return bsf(l,m,x)

bsl(l,h,x)
    if l>h OR l==h AND A[l]!=x return -1
    if l==h AND A[l]==x return l
    m = 1+(l+h)/2;                      // Biased
    if A[m] > x
        return bsf(l,m-1,x)
    else
        return bsf(m,h,x)

```

Code 108

## Find min in rotated sorted array MEDIUM

| O(LogN) | O(1) |
| --- | --- |

```
Pivot Exist in only one half of the array subpart
while(l<=h)
    m = l+h / 2
    if A[l] < A[h]
        return A[l]
    else if A[m] < both neighbours : A[(m+1)%n], A[(m+n-1)%n]
        return A[m]
    else if A[m] <= A[h]
        h = m-1
    else if A[m] >= A[l]
        l = m+1

```

Code 111

## Find Element in rotated array MEDIUM

| O(LogN) | O(1) |
| --- | --- |

```
One half always sorted
while(l<=h)
    m = l+h / 2
    if Right Sorted : A[m] <= A[h]
        if A[m] < B
            if B <= A[h] l = m+1
            else h = m-1
        else if A[m] > B
            h = m-1
        else
            return m
    else if Left Sorted : A[l] <= A[m]
        ...

```

Code 112

## Search Kth number in row col sorted matrix

```
l = m[0][0]
h = m[n-1][n-1]
while(l < h)
    m = l+h / 2
    for i : 0 to row-1
        x += upperbound m in row i of m[][]
    x < k
        l = m+1
    x > k
        h = m

```

## Median of row wise sorted matrix MEDIUM

| O(LogN) | O(1) |
| --- | --- |

```
Count number of elements greater than estimated median
l = min of all
h = max of all
req = (r*c+1) / 2
while l < h
    m = l+h / 2
    Loop all rows of array
        place += rank of m in row
    if place < req
        l = m+1
    else
        h = m
return l

```

Code 113

## Median of two sorted array MEDIUM

DIFFERENT SIZES

| O(Log(N+M)) | O(1) |
| --- | --- |

```
We have to find a partition position x in A, y in B
A0,A1,...AX|AX+1,...
B0,B1,...BY|BY+1,...
Such that X+1+Y+1 = M-X-1+N-Y-1 or different by 1
Also AX <= BY+1 and BY <= AX+1
Median :
    Even = Avg( Max(AX,BY), Min(AX+1,BY+1))
    Odd = Max(AX,BY)

X is smaller array
Partition Array such that PartX + PartY = (X+Y+1) / 2
Found
    maxLeft X <= minRight Y
    maxLeft Y <= minRight X
else if maxLeft X > minRight Y
    Move left in X
else
    Mode right in X

findMedian(A,B)
    if A > B
        swap
    x = A.size, y = B.size
    l = 0, h = x
    while l <= h
        partX = l+h / 2
        partY = (x+y+1)/2 - partX
        maxLeftX  = partX=0 ? -INF : A[partX-1]
        minRightX  = partX=x ? INF : A[partX]
        maxLeftY  = partY=0 ? -INF : B[partY-1]
        minRightY  = partY=y ? INF : B[partY]
        if maxLeftX <= minRightY && maxLeftY <= minRightX
            if x+y % 2 = 0
                return avg(max(maxLeftX,maxLeftY),min(minRightX,minRightY))
            else
                return max(maxLeftX,maxLeftY)
        else if maxLeftX > minRightY
            h = partX - 1
        else
            l = partX + 1

```

Code 258

## Kth min of two sorted array MEDIUM

| O(LogN) | O(1) |
| --- | --- |

```
By comparing mid, we can eleminate one half of one array
kth(l1,l2,h1,h2,k)
    if l1 = h1
        return B[k]
    if l2 = h2
        return A[k]
    m1 = h1-l1 / 2
    m2 = h2-l2 / 2
    if m1 + m2 < k
        if A[m1] > B[m2]
            return kth(l1, l2 + m2 + 1, h1, h2, k - m2 - 1)
        else
            return kth(l1 + m1 + 1, l2, h1, h2, k - m1 - 1)
    else
        if A[m1] > B[m2]
            return kth(l1, l2, A + m1, h2, k)
        else
            return kth(l1, l2, h1, B + m2, k)

```

## Allocate Contiguous Books to K students with min max num of pages sum HARD

| O(N) | O(N) |
| --- | --- |

```
function to find number of students required with max x pages per book
f(prefix sum array v, max)
    while i < v.size()
        i = distance(v.begin(),lower_bound(v.begin(),v.end(),x))
        if i<v.size() && v[i]==x
            x = mx + v[i]
            i++
        else
            x = mx + v[i-1]
        c++
    return c

main()
    l = max of all element
    h = prefix sum max
    m = l+h / 2
    while(l<h)
        if f(v,m) < B
            l = m+1
        else
            h = m
        m = l+h / 2
    return m

```

Code 256

VARIATION Paiters and Boards of different sizes given, find max time to paint all the boards when allocation is contiguous Code 257

# Greedy

---

- Max Profit Job Sequencing : 1 unit Jobs with
- Max tasks Scheduled on 1 CPU EASY
- 0 1 Unbounded Knapsack with lex min index MEDIUM
- Min jump to end with max jump at each position
- Min Station to start that can travel all stations
- Min gas station stops to reach destination, with
- Distribute Min Candy acc to relative neighbour
- Min Jump of seats to make them together

## Max Profit Job Sequencing : 1 unit Jobs with profit and deadlines EASY

| O(NLogN) | O(N) |
| --- | --- |

```
Sort in decreasing order of profit
Take one by one and put it in first location from deadline to 0 <- where no other job is scheduled

```

## Max tasks Scheduled on 1 CPU EASY

| O(LogN) | O(N) |
| --- | --- |

```
Non Preemptive tasks
Sort According to End Time
Traverse and take the 1st possible ones

A[end,start,index]
sort(A)
x = -1
Loop i:A
    if x < i.start
        x = i.end
        print i.index

```

Code 193

## 0 1 Unbounded Knapsack with lex min index MEDIUM

| O(N) | O(N) |
| --- | --- |

```
We need lex min indices of items as ans , items can repeat

Cal ans length = Total Weight / min
Now iterate and replace min with current if it does not changes the ans len

len = total / min
left = total - min*len
while ans size < len
    if a[i]-min <= left
        ans.push(i)
        left -= a[i]-min
    else
        i++

```

Code 222

## Min jump to end with max jump at each position given MEDIUM

| O(N) | O(1) |
| --- | --- |

```
LTR
Select next position that can reach to max distance

Loop i : 0 to len-1
    if not A[i] break
    ans++
    if i+A[i] >= len-1
        return ans
    nextpos = i+1
    Loop j : i+1 to i+A[i]
        if nextpos + A[nextpos] < j + A[j]
            nextpos = j
    i = nextpos

```

## Min Station to start that can travel all stations in circle MEDIUM

| O(N) | O(N) |
| --- | --- |

```
Loop i : 0 to n-1
    start = i
    Travel
        i++ // Can skip mid stations as it can be reached from prev one
        if gas left becomes < 0 then break
        if reached back to start return ans

```

## Min gas station stops to reach destination, with location and gas amount givien

```
GREEDY : Select station with max gas in range

range = startfuel
pq : max heap
while range < target
    insert gas amount of stations in range to pq
    if pq empty return -1
    range += pq.top
    pq.pop
    ans++

```

## Distribute Min Candy acc to relative neighbour rating, at least 1 candy per student

| O(n) | O(n) |
| --- | --- |

```
Distribute 1 candy to all
Scan LTR : give 1 more than prev if more rating
Scan RTL : give 1 more than next if more rating

v[n] = 1
loop i : 1 to len-1
    v[i] = A[i]>A[i-1] ? v[i-1]+1 : v[i]
loop i : len-2
    v[i] = A[i]>A[i+1] ? max(v[i],v[i+1]+1) : v[i]
ans = sum v

```

Code 271

## Min Jump of seats to make them together

| O(n) | O(n) |
| --- | --- |

```
Making all seats together at begining
    To Make 1st seat at x to index 0 : x-0 Jumps
    To Make 2nd seat at y to index 1 : y-1 Jumps
    To Make 3rd seat at z to index 2 : z-2 Jumps
    ...

All seats will be at min distance from median
So move all seats near median

v[]
Loop i : 0 to len
    if seat at i
        v.push i-v.size
median = median of v
Loop i : 0 to v.size
    sum += abs(v[i] - median)

```

Code 270

# Dynamic Programming

---

- Largest Square Submatrix with all 1s in binary
- Max rectangle in 2d matrix
- Max Sum with non adjacent elements MEDIUM
- Max 2D Sub Array Sum Sorted Rows Column EASY
- Is Substring Palindrome EASY
- Min palindrome partitioning MEDIUM
- Multiple Queries to tell min char to change in
- Matrix Chain Multiplication MEDIUM
- Check subset sum x present EASY
- Number of ways select coins from unlimited to make
- Min coins from unlimited to make sum x MEDIUM
- Min path sum from 0,0 to m,n EASY
- Min health from 0,0 to m,n with health always more
- LCS EASY
- Longest Palindromic Subsequence EASY
- Min insert/delete/replace to convert A to B MEDIUM
- Number of subsequence of A equal to B MEDIUM
- 0/1 Knapsack Problem EASY
- Egg Dropping Problem n:Eggs, k:floors (min attempt
- Weighted Job Scheduling MEDIUM
- Max profix by Cutting rods given price of each
- Min length string including subsequence A,B EASY
- LIS EASY
- Max size bitonic subarray EASY
- Longest Bitonic Sequence EASY
- Max sum increasing subsequence MEDIUM
- Longest AP MEDIUM
- Max chain of pairs (a,b) a < b where 2nd element
- Longest Fibonacci like subsequence
- Max coins 1st player can collect if chosen from

## Largest Square Submatrix with all 1s in binary array EASY

| O(N^2) | O(N^2) |
| --- | --- |

```
* Create new 2d array, copy 1st row, 1st column
* Traverse LTR TTB : if M[i][j] is 1 then S[i][j] = min(m[i-1][j],m[i-1][j-1],m[i][j-1])+1 else 0
* Find max

```

## Max rectangle in 2d matrix

```
count[col] = 0
for i : 0 to row-1
    for j : 0 to col-1
        if a[i][j] count[j]++
        else count[j] = 0
        min = count[j]
        for k : j to 0
            if !count[j] break
            min = min(min,count[k])
            ans = max(ans, j-k+1 * min)

```

## Max Sum with non adjacent elements MEDIUM

| O(N) | O(1) |
| --- | --- |

```
inc = max sum including current element = a[0]
exc = max sum excluding current element = 0
Loop array elements 1 to n-1
    t = max(exc,inc)
    inc = element + exc
    exc = t
return max(inc,exc)

```

## Max 2D Sub Array Sum Sorted Rows Column EASY

| O(N^2) | O(N^2) |
| --- | --- |

```
Do BTT RTL to fill submatrix sum
Make Last row and column stores suffix sum
Loop i : row-2 to 0
    Loop j : col-2 to 0
        A[i][j] += A[i+1][j] + A[i][j+1] - A[i+1][j+1]
Find max

```

## Is Substring Palindrome EASY

| O(N^2) | O(N^2) |
| --- | --- |

```
isP[n][n]
Loop j : 0 to n-1
    Loop i : 0 to j
        if i==j
            isP[i][j] = 1
        else if(j == i+1)
            isP[i][j] = (A[i] == A[j]) ? 1 : 0
        else
            isP[i][j] = (A[i] == A[j] && isP[i+1][j-1] == 1) ? 1 : 0

```

## Min palindrome partitioning MEDIUM

| O(N^2) | O(N^2) |
| --- | --- |

```
Calculate isP

result[n+1]
result[0] = -1
Loop i: 0 to n-1
    result[i+1] = i // Maximum n cuts for length n+1
    Loop j : 0 to i
        if isP[j][i]
            result[i+1] = min(result[i+1], 1+result[j])
return result[n]

```

Code 241

## Multiple Queries to tell min char to change in substring to make palindrome

```
Min Char = Count of odd freq char / 2
Use bits of integer to store char count is odd or even
Store it as prefix sum p[i] = 0 to i
    v[s.size] = 0
    v[0] = 1<<(s[0]-'a')
    loop i : 1 to s.size-1
        v[i] = 1<<(s[i]-'a') ^ v[i-1]
MinCount[i to j] = p[j] ^ p[i-1]
    bitset<32> b(v[j] ^ v[i-1])
    ans = b.count()/2

```

Code 283

## Matrix Chain Multiplication MEDIUM

| O(N^3) | O(N^2) |
| --- | --- |

```
p,q,r = [p,q][q,r] = pqr multiplications
k from i to j =>
    ans = min mcm(A,i,k) + mcm(A,k+1,j) + A[i-1] * A[k] * A[j]

m[i][i] = 0, others INF
loop l : 2 to n-1
    loop i : 1 to n-l
        j = i+l-1
        loop k : i to j-1
            x = m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j]
            if (q < m[i][j])
                m[i][j] = q

```

## Check subset sum x present EASY

| O(N^2) | O(N^2) |
| --- | --- |

```
dp[n+1][x+1]
dp[i][0] = T
dp[0][x] = F
loop i : 1 to n
    loop j : 1 to x
        if j<A[i]                   // Important
            dp[i][j] = dp[i][j-1]
        else
            dp[i][j] = dp[i-1][j-A[i]] or dp[i-1][j]

```

## Number of ways select coins from unlimited to make sum x MEDIUM

| O(NK) | O(N) |
| --- | --- |

```
Do bottom up approach

v[0] = 1
Loop i: 0 to len-1
    Loop j: 1 to X
        if A[i] <= j
            v[j] += v[j-A[i]]
return v[X]

```

## Min coins from unlimited to make sum x MEDIUM

| O(NK) | O(N) |
| --- | --- |

```
F(N,X)
    Select Min of F(N,X-A[i]) i from 0 to N-1

OR
Sort Coins
F(N,K)
    if K = 0 return 0
    if K < A[0] return INF
    return min (1+F(N,K-A[N]), F(N-1,K))

```

Variations

- Min number of squares to sum to x

## Min path sum from 0,0 to m,n EASY

| O(N^2) | O(N^2) |
| --- | --- |
| Can move only left or down, positive weights in array |  |

```
Init Add for border cells
B[i][j] = A[i][j] + min(B[i-1][j], B[i][j-1])
return last

```

Code 216

## Min health from 0,0 to m,n with health always more than 1 MEDIUM

| O(N^2) | O(N^2) |
| --- | --- |

```
min[i][j] = min health needed from here to end
At each point select min of left and down
Do BTT RTL

hp[row][col - 1] = 1;
hp[row - 1][col] = 1;
Loop i : row-1 to 0
    Loop j : col-1 to 0
        need = min(hp[i + 1][j], hp[i][j + 1]) - A[i][j];
        hp[i][j] = need <= 0 ? 1 : need
return hp[0][0]

```

## LCS EASY

| O(N^2) | O(N^2) |
| --- | --- |

```
Create 2D array of length m*n
iterate LTR-TTB
    if char same
        v(i,j) = v(i-1,j-1)+1
    else
        v(i,j) = max(v(i,j-1),v(i-1,j))
return v(m,n)

```

Code 161

## Longest Palindromic Subsequence EASY

| O(N^2) | O(N^2) |
| --- | --- |

```
LCS on s and rev(s)

Min Number of characters to insert to make string palindrome = Len - LCS(s,rev(s))

```

## Min insert/delete/replace to convert A to B MEDIUM

| O(N^2) | O(N) |
| --- | --- |

```
Remove Common Prefix
Create 2D Matrix M (m+1)*(n+1), s1 in row, s2 in column
Fill first row,column with 0,1,2,3...
Loop
    s1[i-1] = s2[j-1]   -> M[i][j] = M[i-1][j-1]
    s1[i-1] != s2[j-1]  -> M[i][j] = 1 + min(M[i-1][j],M[i][j-1],M[i-1][j-1])
Ans = M[m][n]

```

Code 237

OR

```
Calculate LCS
Traverse both string searching for next char of LCS, add max of distance between 2 characters matching in subsequence to ans

```

## Number of subsequence of A equal to B MEDIUM

| O(N^2) | O(N^2) |
| --- | --- |

```
Consider last char of both, if same then we have 2 choice
either to include it or not, if different exclude it

A[n], B[m]
v[n+1][m+1] = 0
v[0] = 1
loop i : 1 to m
    loop j : 1 to n
        if A[j-1] = B[i-1]
            v[i][j] = v[i-1][j-1] + v[i][j-1]
        else
            v[i][j] = v[i][j-1]
return v[n][m]

```

Code 253

## 0/1 Knapsack Problem EASY

| O(N^2) | O(N^2) |
| --- | --- |

```
Consider nth item, either to take it or to leave it, if wt more then definitely leave it.
if w[n] > maxwt, return func(maxwt,n-1)
else return max(val[n]+func(maxwt-w[n],n-1),func(maxwt,n-1))

loop i : 0 to n
    loop w : 0 to W
        if i=0 | w=0
            K[i][w] = 0
        else if (wt[i-1] <= w)
            K[i][w] = max(val[i-1] + K[i-1][w-wt[i-1]],  K[i-1][w]);
        else
            K[i][w] = K[i-1][w];

```

## Egg Dropping Problem n:Eggs, k:floors (min attempt to find critical floor) MEDIUM

| O(N^2) | O(N^2) |
| --- | --- |

```
Egg breaks -> All lower floors are candidate, #eggs decreases : eggDrop(n-1,k-1)
Egg not breaks -> All upper floors are candidate : eggDrop(n,k-x)
eggDrop(n,k) = 1 + min{max(eggDrop(n-1,k-1),eggDrop(n,k-x)) : x in 1..k}
DP : Table n*k
    1st row : 1,2,3... 1st column : 1,1,1,1...
    Apply formula, Traverse LTR TTB

dp[i][0] = 0
dp[i][1] = 1
dp[1][i] = i
loop i : 2 to n
    loop j : 2 to k
        dp[i][j] = INF
        loop x : 1 to j
            dp[i][j] = min(dp[i][j], 1+max(dp[i-1][x-1],dp[i][j-x]))
return dp[n][k]

```

## Weighted Job Scheduling MEDIUM

| O(N^2) | O(N) |
| --- | --- |

```
Jobs with start,end,profit given, Scheduled on 1 cpu with max profit

Sort jobs in increasing order of finish time
A(index,start) = max( profit(index) + A(index+x, end(index)), A(index+1,start) )
x = index of next non conflicting job

```

## Max profix by Cutting rods given price of each length EASY

| O(N^2) | O(N) |
| --- | --- |

```
Bottom Up Approach
dp[i] stores max profit from length i

dp[0] = 0
dp[1] = p[1]
Loop i : 2 to len
    Loop j : 0 to i-1
        dp[i] = max(dp[i], p[j] + dp[i-j-1])

```

## Min length string including subsequence A,B EASY

| O(N^2) | O(N^2) |
| --- | --- |

```
Find LCS of A,B and then insert the missing characters

Take 3 pointers each on A,B,LCS
    If all 3 char same include and increment all 3
    Include the different one in A,B and increment that pointer

```

## LIS EASY

| O(N^2) | O(N) |
| --- | --- |

```
Initialize LIS[n] = 1 all
LIS[i] stores length if A[i] is last element of that sequence
Loop i: 1 to n-1
    Loop j: 0 to i-1
        if( A[i]>A[j] & LIS[j]+1 > LIS[i] )
            LIS[i] = LIS[j] + 1
Find Max

```

Code 238 For lds do RTL

| O(NLogN) | O(N) |
| --- | --- |

```
Consider elements one by one, maintain lists of active lis
We Maintain : End element of smaller list is smaller than end elements of larger lists
1. If A[i] is smallest of all ends create new list with A[i]
2. If A[i] is largest of all ends, Copy longest list and append A[i]
3. If A[i] is in between, clone upperbound end list and append A[i]
Discard old lists of same length : Thus only one active list for a given length

tail[i] : last element of list of size i
length = 1 : points to empty location in tail
tail[0] = v[0]
loop i: 1 to len-1
    if v[i] < tail[0]
        tail[0] = v[i].
    else if (v[i] > tail[length - 1])
        tail[length++] = v[i]
    else
        tail[upperbound of v[i] index] = v[i]
return length

```

VARIATIONS

```
Box inside box
    check all 3 : length height width

Max bridge between cities along rivers with no crossover
    find lis of one side of rivers with relative ordering acc to other side cities number

Max box stacking height with rotation allowed
    Create array with all 3 rotation possible
    Sort it acc to base area
    Find lis so that same box not considered twice

```

## Max size bitonic subarray EASY

| O(N) | O(N) |
| --- | --- |

```
* 2 Auxillary array
    * 1st : LTR , A1[i] store max length of non decreasing subarray before A[i]
    * 2nd : RTL , A2[i] store max length of non decreasing subarray till A[i] from right
* Ans = max(A1[i]+A2[i]-1)

My Method - Time : O(n)
* Flags , 1 : Increasing , 2 : Decreasing , count len
* If after 2, again increasing comes then update max, Initialize len to #duplicates in left

```

## Longest Bitonic Sequence EASY

| O(N^2) | O(N) |
| --- | --- |

```
Sequence first increasing then decreasing
Find Longest Increasing Subsequence, Longest Decreasing Subsequence using RTL lis
return max (LIS[i]+LDS[i]-1)

```

Code 219

## Max sum increasing subsequence MEDIUM

| O(N^2) | O(N) |
| --- | --- |

```
Same as lis, lis stores sum and compare with lis[j]+A[i]

```

## Longest AP MEDIUM

| O(N^2) | O(N) |
| --- | --- |

```
Variation of LIS, store length in map corresponding to difference
v[n] = map (init m[0] = 1)

Loop i: 1 to n-1
    Loop j: 0 to i-1
        d = A[i]-A[j];
        if d not in lis[j]
            lis[j][d] = 1
        if d not in lis[i]
            lis[i][d] = 1+lis[j][d]
        else if 1+lis[j][d] > lis[i][d]
            lis[i][d] = 1+lis[j][d];
Find max

```

## Max chain of pairs (a,b) a < b where 2nd element of 1st pair is less than 1st element of 2nd pair MEDIUM

| O(N^2) | O(N) |
| --- | --- |

```
* All pairs in increasing order of numbers
* Similar to LIS
* Two Pointers, i : 1 to n, j : 1 to i-1
* if(A[i].first>A[j].second & LIS[i] < LIS[j]+1) LIS[i] = LIS[j] +1
* Find Max

```

## Longest Fibonacci like subsequence

Greedy

```
Store elements in set
Consider all 2 element pair and keep on finding next in set

```

DP

```
dp[i][j] : stores max len if a[i],a[j] as last element
dp[a][b] = (dp[b - a][a] + 1 ) or 2

for (int j = 0; j < N; ++j)
    m[A[j]] = j;
    for (int i = 0; i < j; ++i)
        int k = m.find(A[j] - A[i]) == m.end() ? -1 : m[A[j] - A[i]];
        dp[i][j] = (A[j] - A[i] < A[i] && k >= 0) ? dp[k][i] + 1 : 2;
        res = max(res, dp[i][j]);

```

## Max coins 1st player can collect if chosen from either end of coins series MEDIUM

| O(N^2) | O(N^2) |
| --- | --- |

```
p(i,j) = max( A[i] + min(p(i+2,j), p(i+1,j-1)), A[j] + min(p(i+1,j-1), p(i,j-2)) )

OR

P(i,j,sum) = max( sum - p(i+1,j,sum-A[i]), sum - p(i,j-1,sum-A[j]) )

Base
i = j : A[i]
i = j-1 : max(A[i],A[j])

```