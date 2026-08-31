# Stacks and Queues — Problems

| # | Problem | LeetCode | Pattern | Difficulty |
| - | ------- | -------- | ------- | ---------- |
| 1 | Valid Parentheses | 20 | Bracket Matching | Easy |
| 2 | Longest Valid Parentheses | 32 | Bracket Matching | Hard |
| 3 | Simplify Path | 71 | Stack | Medium |
| 4 | Largest Rectangle in Histogram | 84 | Monotonic Stack | Hard |
| 5 | Maximal Rectangle | 85 | Monotonic Stack | Hard |
| 6 | Evaluate Reverse Polish Notation | 150 | Stack Simulation | Medium |
| 7 | Min Stack | 155 | Design | Medium |
| 8 | Basic Calculator | 224 | Expression Evaluation | Hard |
| 9 | Basic Calculator II | 227 | Expression Evaluation | Medium |
| 10 | Implement Stack using Queues | 225 | Design | Easy |
| 11 | Implement Queue using Stacks | 232 | Design | Easy |
| 12 | Sliding Window Maximum | 239 | Monotonic Deque | Hard |
| 13 | Decode String | 394 | Stack | Medium |
| 14 | Remove K Digits | 402 | Monotonic Stack | Medium |
| 15 | Next Greater Element I | 496 | Monotonic Stack | Easy |
| 16 | Next Greater Element II | 503 | Monotonic Stack | Medium |
| 17 | Design Circular Queue | 622 | Design | Medium |
| 18 | Asteroid Collision | 735 | Stack Simulation | Medium |
| 19 | Daily Temperatures | 739 | Monotonic Stack | Medium |
| 20 | Online Stock Span | 901 | Monotonic Stack | Medium |
| 21 | Sum of Subarray Minimums | 907 | Monotonic Stack | Medium |
| 22 | Car Fleet | 853 | Stack | Medium |
| 23 | Calculator (with parens + all ops) | 224/227 | Expression Evaluation | Hard |

---

## Bracket Matching

### Valid Parentheses — LeetCode 20

Given a string containing only `(`, `)`, `{`, `}`, `[`, `]`, determine whether the brackets are balanced.

**Example:** `s = "()[]{}"` → `true`; `s = "([)]"` → `false`

```text
BRUTE FORCE | O(n²) | O(n)

Repeatedly replace "()", "[]", "{}" with "" until no change; empty string = valid.

------------------------------------------------------------------------------

OPTIMAL — STACK | O(n) | O(n)

For each char:
    if opening bracket → push
    else if stack empty or top doesn't match → return false
return stack.Count == 0
```

```csharp
public bool IsValid(string s)
{
    var stack = new Stack<char>();
    foreach (char c in s)
    {
        if (c is '(' or '[' or '{') { stack.Push(c); continue; }
        if (stack.Count == 0) return false;
        char top = stack.Pop();
        if (c == ')' && top != '(') return false;
        if (c == ']' && top != '[') return false;
        if (c == '}' && top != '{') return false;
    }
    return stack.Count == 0;
}
```

> **Key insight:** a stack naturally tracks the expected closing bracket without scanning ahead.

---

### Longest Valid Parentheses — LeetCode 32

Given a string of `(` and `)`, return the length of the longest valid (well-formed) parentheses substring.

**Example:** `s = ")()())"` → `4`

```text
BRUTE FORCE | O(n³) | O(n)

Check every substring for validity.

------------------------------------------------------------------------------

DYNAMIC PROGRAMMING | O(n) | O(n)

dp[i] = length of longest valid substring ending at i.
If s[i] == '(':  dp[i] = 0
If s[i] == ')':
    if s[i-1] == '(': dp[i] = dp[i-2] + 2
    if s[i-1] == ')' and s[i - dp[i-1] - 1] == '(':
        dp[i] = dp[i-1] + 2 + dp[i - dp[i-1] - 2]

------------------------------------------------------------------------------

OPTIMAL — STACK | O(n) | O(n)

Push -1 as base sentinel.
For each i:
    if '(' → push i
    else:
        pop
        if stack empty → push i as new base
        else update max = max(max, i - stack.Peek())
```

```csharp
public int LongestValidParentheses(string s)
{
    var stack = new Stack<int>();
    stack.Push(-1); // base sentinel
    int max = 0;
    for (int i = 0; i < s.Length; i++)
    {
        if (s[i] == '(')
        {
            stack.Push(i);
        }
        else
        {
            stack.Pop();
            if (stack.Count == 0) stack.Push(i); // new base
            else max = Math.Max(max, i - stack.Peek());
        }
    }
    return max;
}
```

> **Key insight:** the stack always keeps the index of the last unmatched `)` as a base; the valid length is `i − base`.

---

## Design

### Min Stack — LeetCode 155

Design a stack supporting `push`, `pop`, `top`, `getMin` all in O(1).

**Example:** `push(-2), push(0), push(-3), getMin()` → `-3`; `pop(), top()` → `0`, `getMin()` → `-2`

```text
NAIVE — SCAN ON getMin | O(n) getMin | O(n)

Scan entire stack on every getMin call.

------------------------------------------------------------------------------

OPTIMAL — TWO STACKS | O(1) all ops | O(n)

Maintain a parallel _min stack.
_min[i] = min of all elements from bottom up to position i.
Push: _min.Push(min(val, _min.Peek()))
Pop: both stacks pop together
GetMin: _min.Peek()
```

```csharp
public class MinStack
{
    private Stack<int> _s   = new();
    private Stack<int> _min = new();

    public void Push(int val)
    {
        _s.Push(val);
        _min.Push(_min.Count == 0 ? val : Math.Min(val, _min.Peek()));
    }
    public void Pop()    { _s.Pop(); _min.Pop(); }
    public int  Top()    => _s.Peek();
    public int  GetMin() => _min.Peek();
}
```

> **Key insight:** shadow the main stack with a min-so-far stack so each position records the minimum at that depth.

---

### Implement Queue using Stacks — LeetCode 232

Implement a FIFO queue using only two stacks, supporting `push`, `pop`, `peek`, `empty`.

**Example:** `push(1), push(2), peek()` → `1`; `pop()` → `1`; `empty()` → `false`

```text
OPTIMAL — TWO STACKS (LAZY TRANSFER) | O(1) amortised pop | O(n)

_in stack receives all pushes.
On pop/peek, if _out is empty, drain _in → _out (reverses order = FIFO).
Each element crosses from _in to _out at most once.
```

```csharp
public class MyQueue
{
    private Stack<int> _in = new(), _out = new();

    public void Push(int x) => _in.Push(x);

    private void Transfer() { while (_in.Count > 0) _out.Push(_in.Pop()); }

    public int Pop()    { if (_out.Count == 0) Transfer(); return _out.Pop(); }
    public int Peek()   { if (_out.Count == 0) Transfer(); return _out.Peek(); }
    public bool Empty() => _in.Count == 0 && _out.Count == 0;
}
```

> **Key insight:** reversing a stack into another stack yields FIFO order; transferring only when `_out` is empty gives O(1) amortised cost.

---

### Implement Stack using Queues — LeetCode 225

Implement a LIFO stack using only one queue.

**Example:** `push(1), push(2), top()` → `2`; `pop()` → `2`; `empty()` → `false`

```text
OPTIMAL — ONE QUEUE + ROTATION | O(n) push, O(1) pop | O(n)

On push(x): enqueue x, then rotate all preceding elements to the back.
The newly pushed element is now at the front → pop/peek are O(1).
```

```csharp
public class MyStack
{
    private Queue<int> _q = new();

    public void Push(int x)
    {
        _q.Enqueue(x);
        for (int i = 0; i < _q.Count - 1; i++)
            _q.Enqueue(_q.Dequeue()); // new element ends up at front
    }
    public int  Pop()   => _q.Dequeue();
    public int  Top()   => _q.Peek();
    public bool Empty() => _q.Count == 0;
}
```

> **Key insight:** rotating the queue after each push keeps the newest element at the front, simulating LIFO with O(n) push cost.

---

### Design Circular Queue — LeetCode 622

Design a circular FIFO queue with fixed capacity k; all operations O(1).

**Example:** `MyCircularQueue(3), enQueue(1), enQueue(2), enQueue(3), enQueue(4)` → `false` (full)

```text
OPTIMAL — RING BUFFER | O(1) all ops | O(k)

Use an array of size k with _head, _tail, and _size.
EnQueue: write at _tail, advance _tail = (_tail+1) % k, _size++
DeQueue: advance _head = (_head+1) % k, _size--
IsFull: _size == k; IsEmpty: _size == 0
```

```csharp
public class MyCircularQueue
{
    private int[] _buf;
    private int _head, _tail, _size, _cap;

    public MyCircularQueue(int k) { _buf = new int[k]; _cap = k; }

    public bool EnQueue(int val)
    {
        if (IsFull()) return false;
        _buf[_tail] = val;
        _tail = (_tail + 1) % _cap;
        _size++;
        return true;
    }
    public bool DeQueue()
    {
        if (IsEmpty()) return false;
        _head = (_head + 1) % _cap;
        _size--;
        return true;
    }
    public int  Front()   => IsEmpty() ? -1 : _buf[_head];
    public int  Rear()    => IsEmpty() ? -1 : _buf[(_tail - 1 + _cap) % _cap];
    public bool IsEmpty() => _size == 0;
    public bool IsFull()  => _size == _cap;
}
```

> **Key insight:** modulo arithmetic wraps head and tail around the fixed array without shifting elements.

---

## Monotonic Stack

### Daily Temperatures — LeetCode 739

For each day, return how many days until a warmer temperature; 0 if none.

**Example:** `temperatures = [73,74,75,71,69,72,76,73]` → `[1,1,4,2,1,1,0,0]`

```text
BRUTE FORCE | O(n²) | O(1)

For each day scan forward to find next warmer day.

------------------------------------------------------------------------------

OPTIMAL — MONOTONIC STACK | O(n) | O(n)

Maintain a stack of unresolved indices (decreasing temperature order).
When temperatures[i] > temperatures[stack.Peek()]:
    answer[stack.Pop()] = i - popped_index
Push i.
```

```csharp
public int[] DailyTemperatures(int[] temperatures)
{
    int n = temperatures.Length;
    int[] ans = new int[n];
    var stack = new Stack<int>();

    for (int i = 0; i < n; i++)
    {
        while (stack.Count > 0 && temperatures[stack.Peek()] < temperatures[i])
        {
            int prev = stack.Pop();
            ans[prev] = i - prev;
        }
        stack.Push(i);
    }
    return ans;
}
```

> **Key insight:** the stack holds indices of days waiting for a warmer future day; each index is pushed and popped at most once → O(n).

---

### Next Greater Element I — LeetCode 496

`nums1` is a subset of `nums2`. For each element in `nums1`, find its next greater element in `nums2`; return −1 if none.

**Example:** `nums1=[4,1,2], nums2=[1,3,4,2]` → `[-1,3,-1]`

```text
BRUTE FORCE | O(n·m) | O(1)

For each element in nums1, find it in nums2, then scan right for next greater.

------------------------------------------------------------------------------

OPTIMAL — MONOTONIC STACK + HASH MAP | O(n+m) | O(n)

Process nums2 with monotonic stack.
When a larger element pops a smaller one, record nextGreater[smaller] = larger.
Remaining stack elements → nextGreater[x] = -1.
Answer nums1 by lookup.
```

```csharp
public int[] NextGreaterElement(int[] nums1, int[] nums2)
{
    var nextGreater = new Dictionary<int, int>();
    var stack = new Stack<int>(); // values, decreasing

    foreach (int x in nums2)
    {
        while (stack.Count > 0 && stack.Peek() < x)
            nextGreater[stack.Pop()] = x;
        stack.Push(x);
    }
    while (stack.Count > 0)
        nextGreater[stack.Pop()] = -1;

    return nums1.Select(x => nextGreater[x]).ToArray();
}
```

> **Key insight:** pre-compute all next-greater answers for `nums2` in one O(n) pass; then answer `nums1` queries in O(1) each via hashmap.

---

### Next Greater Element II — LeetCode 503

Circular array — for each element find the next greater element wrapping around.

**Example:** `nums = [1,2,1]` → `[2,-1,2]`

```text
BRUTE FORCE | O(n²) | O(1)

For each element scan the circular array.

------------------------------------------------------------------------------

OPTIMAL — MONOTONIC STACK × 2 passes | O(n) | O(n)

Iterate i = 0 to 2n-1, using index i % n.
Second pass resolves elements that wrap around.
Only push actual indices (i < n) to avoid re-recording answers.
```

```csharp
public int[] NextGreaterElements(int[] nums)
{
    int n = nums.Length;
    int[] res = new int[n]; Array.Fill(res, -1);
    var stack = new Stack<int>(); // indices

    for (int i = 0; i < 2 * n; i++)
    {
        while (stack.Count > 0 && nums[stack.Peek()] < nums[i % n])
            res[stack.Pop()] = nums[i % n];
        if (i < n) stack.Push(i);
    }
    return res;
}
```

> **Key insight:** simulate circularity by iterating twice (`i % n`); don't push indices in the second pass to avoid overwriting resolved answers.

---

### Largest Rectangle in Histogram — LeetCode 84

Given histogram bar heights (width 1 each), find the area of the largest rectangle.

**Example:** `heights = [2,1,5,6,2,3]` → `10`

```text
BRUTE FORCE | O(n²) | O(1)

For each bar expand left/right until a shorter bar is found.

------------------------------------------------------------------------------

TWO-PASS (left/right smaller arrays) | O(n) | O(n)

Precompute leftSmaller[i] and rightSmaller[i] with two separate monotonic stacks.
area[i] = heights[i] * (rightSmaller[i] - leftSmaller[i] - 1)

------------------------------------------------------------------------------

OPTIMAL — SINGLE PASS MONOTONIC STACK + SENTINEL | O(n) | O(n)

Append sentinel height 0 to flush all bars at end.
When bar i is shorter than stack top, pop and compute:
    height = heights[popped]
    width  = stack empty ? i : i - stack.Peek() - 1
```

```csharp
public int LargestRectangleArea(int[] heights)
{
    int n = heights.Length, max = 0;
    var stack = new Stack<int>(); // increasing heights — indices

    for (int i = 0; i <= n; i++)
    {
        int h = i < n ? heights[i] : 0; // sentinel
        while (stack.Count > 0 && heights[stack.Peek()] > h)
        {
            int height = heights[stack.Pop()];
            int width  = stack.Count == 0 ? i : i - stack.Peek() - 1;
            max = Math.Max(max, height * width);
        }
        stack.Push(i);
    }
    return max;
}
```

> **Key insight:** when a bar is popped, the current bar is its right boundary and `stack.Peek()+1` is its left boundary — this is the widest rectangle with that bar as the shortest.

---

### Maximal Rectangle — LeetCode 85

Given a binary matrix, find the largest rectangle containing only `1`s.

**Example:** `matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]` → `6`

```text
BRUTE FORCE | O(m²·n²) | O(1)

Try every top-left / bottom-right pair.

------------------------------------------------------------------------------

OPTIMAL — ROW-BY-ROW HISTOGRAM | O(m·n) | O(n)

Build a heights[] array: heights[j] = number of consecutive 1s above row i in column j.
Apply LargestRectangleArea to each row's heights.
```

```csharp
public int MaximalRectangle(char[][] matrix)
{
    if (matrix.Length == 0) return 0;
    int m = matrix.Length, n = matrix[0].Length, max = 0;
    int[] heights = new int[n];

    for (int i = 0; i < m; i++)
    {
        for (int j = 0; j < n; j++)
            heights[j] = matrix[i][j] == '1' ? heights[j] + 1 : 0;
        max = Math.Max(max, LargestRectangleArea(heights));
    }
    return max;

    static int LargestRectangleArea(int[] h)
    {
        int len = h.Length, res = 0;
        var st = new Stack<int>();
        for (int i = 0; i <= len; i++)
        {
            int cur = i < len ? h[i] : 0;
            while (st.Count > 0 && h[st.Peek()] > cur)
            {
                int height = h[st.Pop()];
                int width  = st.Count == 0 ? i : i - st.Peek() - 1;
                res = Math.Max(res, height * width);
            }
            st.Push(i);
        }
        return res;
    }
}
```

> **Key insight:** each row defines a histogram of consecutive `1`s above it; the problem reduces to LeetCode 84 applied m times.

---

### Remove K Digits — LeetCode 402

Remove exactly k digits from numeric string `num` to produce the smallest possible number.

**Example:** `num = "1432219", k = 3` → `"1219"`

```text
BRUTE FORCE | O(C(n,k)·n) | O(1)

Generate all combinations; pick the minimum.

------------------------------------------------------------------------------

OPTIMAL — MONOTONIC INCREASING STACK | O(n) | O(n)

Greedily remove a digit when the next digit is smaller (it can only help).
Use stack to maintain increasing sequence of kept digits.
After loop, if k > 0 still, remove from the top (largest tail digits).
Strip leading zeros.
```

```csharp
public string RemoveKdigits(string num, int k)
{
    var stack = new Stack<char>();
    foreach (char d in num)
    {
        while (k > 0 && stack.Count > 0 && stack.Peek() > d)
        {
            stack.Pop();
            k--;
        }
        stack.Push(d);
    }
    while (k-- > 0) stack.Pop(); // remove largest tail digits

    // Stack is top→bottom = last→first digit; reverse to get the number
    var arr = stack.ToArray(); // top-to-bottom order
    Array.Reverse(arr);        // now bottom-to-top = correct digit order

    // Strip leading zeros
    int start = 0;
    while (start < arr.Length - 1 && arr[start] == '0') start++;
    return new string(arr, start, arr.Length - start);
}
```

> **Key insight:** a digit should be removed when the digit after it is smaller — this is exactly when it breaks the monotonic increasing property of the kept sequence.

---

### Sum of Subarray Minimums — LeetCode 907

Return the sum of `min(subarray)` for every subarray of `arr`, modulo 10⁹+7.

**Example:** `arr = [3,1,2,4]` → `17` (subarrays: [3]=3, [1]=1, [2]=2, [4]=4, [3,1]=1, [1,2]=1, [2,4]=2, [3,1,2]=1, [1,2,4]=1, [3,1,2,4]=1 → sum=17)

```text
BRUTE FORCE | O(n²) | O(1)

Enumerate all subarrays; track running minimum.

------------------------------------------------------------------------------

OPTIMAL — MONOTONIC STACK + CONTRIBUTION | O(n) | O(n)

For each arr[i], count how many subarrays have arr[i] as their minimum:
    left[i]  = # subarrays ending at i where arr[i] is min (look left until smaller)
    right[i] = # subarrays starting at i where arr[i] is min (look right until ≤)
    contribution = arr[i] * left[i] * right[i]

Use non-strict (>=) on left and strict (>) on right to avoid double-counting equal elements.
```

```csharp
public int SumSubarrayMins(int[] arr)
{
    const int MOD = 1_000_000_007;
    int n = arr.Length;
    int[] left = new int[n], right = new int[n];
    var stack = new Stack<int>();

    for (int i = 0; i < n; i++)
    {
        while (stack.Count > 0 && arr[stack.Peek()] >= arr[i]) stack.Pop();
        left[i] = stack.Count == 0 ? i + 1 : i - stack.Peek();
        stack.Push(i);
    }
    stack.Clear();
    for (int i = n - 1; i >= 0; i--)
    {
        while (stack.Count > 0 && arr[stack.Peek()] > arr[i]) stack.Pop();
        right[i] = stack.Count == 0 ? n - i : stack.Peek() - i;
        stack.Push(i);
    }

    long ans = 0;
    for (int i = 0; i < n; i++)
        ans = (ans + (long)arr[i] * left[i] * right[i]) % MOD;
    return (int)ans;
}
```

> **Key insight:** each element's contribution = value × (# subarrays where it is the minimum) = value × left_count × right_count; monotonic stacks find the boundaries in O(n).

---

### Online Stock Span — LeetCode 901

For a stream of daily stock prices, return the span (number of consecutive days ≤ today's price, including today).

**Example:** prices `[100,80,60,70,60,75,85]` → spans `[1,1,1,2,1,4,6]`

```text
BRUTE FORCE | O(n²) | O(1)

For each price scan backwards until a higher price is found.

------------------------------------------------------------------------------

OPTIMAL — MONOTONIC STACK (store price + span pairs) | O(n) amortised | O(n)

Stack holds (price, span) pairs in decreasing price order.
When a new price p arrives:
    span = 1
    while stack top price ≤ p: span += stack.Pop().span
    push (p, span)
    return span
```

```csharp
public class StockSpanner
{
    private Stack<(int price, int span)> _stack = new();

    public int Next(int price)
    {
        int span = 1;
        while (_stack.Count > 0 && _stack.Peek().price <= price)
            span += _stack.Pop().span;
        _stack.Push((price, span));
        return span;
    }
}
```

> **Key insight:** by storing the accumulated span with each stack entry, we skip over already-collapsed ranges in O(1) amortised — each price is pushed and popped at most once total.

---

### Asteroid Collision — LeetCode 735

Asteroids move right (positive) or left (negative). On collision the smaller is destroyed; equal-size both destroyed. Return the final state.

**Example:** `asteroids = [5,10,-5]` → `[5,10]`; `[8,-8]` → `[]`

```text
BRUTE FORCE | O(n²) | O(1)

Simulate collisions repeatedly until stable.

------------------------------------------------------------------------------

OPTIMAL — STACK | O(n) | O(n)

Push asteroids onto a stack.
Collision only when top > 0 (rightward) and current < 0 (leftward):
    top < |cur|  → pop (top destroyed), loop
    top == |cur| → pop, mark cur dead, stop
    top > |cur|  → cur destroyed, stop
If cur still alive → push.
```

```csharp
public int[] AsteroidCollision(int[] asteroids)
{
    var stack = new Stack<int>();
    foreach (int a in asteroids)
    {
        bool alive = true;
        while (alive && a < 0 && stack.Count > 0 && stack.Peek() > 0)
        {
            int top = stack.Peek();
            if (top < -a)       { stack.Pop(); }          // top destroyed
            else if (top == -a) { stack.Pop(); alive = false; } // both destroyed
            else                { alive = false; }               // a destroyed
        }
        if (alive) stack.Push(a);
    }
    var res = stack.ToArray();
    Array.Reverse(res);
    return res;
}
```

> **Key insight:** collision only happens between a positive (rightward) top and a negative (leftward) incoming; same-direction asteroids never meet.

---

### Car Fleet — LeetCode 853

Cars drive toward a target. A faster car that catches a slower one joins its fleet. Return the number of fleets reaching the target.

**Example:** `target=12, position=[10,8,0,5,3], speed=[2,4,1,1,3]` → `3`

```text
BRUTE FORCE | O(n³) | O(1)

Simulate all cars; O(n³) complex.

------------------------------------------------------------------------------

OPTIMAL — SORT + STACK (time-to-target) | O(n log n) | O(n)

Sort cars by position descending (closest to target first).
For each car compute time = (target - pos) / speed.
If time > stack top (arrives later) → new fleet (push).
Otherwise it merges with the fleet ahead (don't push).
```

```csharp
public int CarFleet(int target, int[] position, int[] speed)
{
    int n = position.Length;
    var cars = position.Zip(speed, (p, s) => (p, s))
                       .OrderByDescending(c => c.p)
                       .ToArray();
    var stack = new Stack<double>(); // arrival times

    foreach (var (p, s) in cars)
    {
        double time = (double)(target - p) / s;
        if (stack.Count == 0 || time > stack.Peek())
            stack.Push(time);
        // else: merges with fleet ahead, same arrival time
    }
    return stack.Count;
}
```

> **Key insight:** a car forms a new fleet only if it arrives later than the car ahead; otherwise it catches up and merges.

---

## Monotonic Deque

### Sliding Window Maximum — LeetCode 239

Return the maximum value in each sliding window of size k.

**Example:** `nums=[1,3,-1,-3,5,3,6,7], k=3` → `[3,3,5,5,6,7]`

```text
BRUTE FORCE | O(n·k) | O(1)

For each window position scan k elements for the max.

------------------------------------------------------------------------------

HEAP (max-heap with lazy deletion) | O(n log k) | O(k)

Push (value, index) into max-heap.
On each step, pop stale top entries (index out of window) before recording max.

------------------------------------------------------------------------------

OPTIMAL — MONOTONIC DEQUE | O(n) | O(k)

Deque stores indices in decreasing value order.
Front = index of current window maximum.
Two conditions:
  1. Front expired (index < i-k+1) → RemoveFirst
  2. Back dominated (value ≤ nums[i]) → RemoveLast  (maintains decreasing invariant)
Add i to back; record answer when i ≥ k-1.
```

```csharp
public int[] MaxSlidingWindow(int[] nums, int k)
{
    int n = nums.Length;
    int[] res = new int[n - k + 1];
    var dq = new LinkedList<int>(); // indices; decreasing value order

    for (int i = 0; i < n; i++)
    {
        // 1. Expire front if out of window
        if (dq.Count > 0 && dq.First.Value < i - k + 1)
            dq.RemoveFirst();

        // 2. Remove dominated indices from back
        while (dq.Count > 0 && nums[dq.Last.Value] <= nums[i])
            dq.RemoveLast();

        dq.AddLast(i);

        if (i >= k - 1)
            res[i - k + 1] = nums[dq.First.Value];
    }
    return res;
}
```

> **Key insight:** the deque front is always the window maximum because we never let a smaller-valued index survive behind a larger one; O(n) since each index enters and leaves the deque at most once.

---

## Expression Evaluation

### Evaluate Reverse Polish Notation — LeetCode 150

Evaluate an expression in Reverse Polish Notation (postfix).

**Example:** `tokens = ["2","1","+","3","*"]` → `9`

```text
BRUTE FORCE | O(n²) | O(n)

Repeatedly scan for operators and collapse.

------------------------------------------------------------------------------

OPTIMAL — STACK | O(n) | O(n)

Push numbers; on operator pop two operands, apply, push result.
```

```csharp
public int EvalRPN(string[] tokens)
{
    var stack = new Stack<int>();
    foreach (var t in tokens)
    {
        if (int.TryParse(t, out int num)) { stack.Push(num); continue; }
        int b = stack.Pop(), a = stack.Pop();
        stack.Push(t switch { "+" => a + b, "-" => a - b, "*" => a * b, _ => a / b });
    }
    return stack.Pop();
}
```

> **Key insight:** postfix notation eliminates operator precedence and parentheses; a stack makes evaluation a single left-to-right pass.

---

### Basic Calculator — LeetCode 224

Evaluate a string expression containing digits, `+`, `−`, `(`, `)`, spaces.

**Example:** `s = "1 + (2 - (3 + 4))"` → `-4`

```text
OPTIMAL — SIGN STACK | O(n) | O(n)

Track (result, sign) before each '('; reset on '(', restore on ')'.
```

```csharp
public int Calculate(string s)
{
    var stack = new Stack<int>(); // stores alternating (result, sign) pairs
    int result = 0, num = 0, sign = 1;
    foreach (char c in s)
    {
        if (char.IsDigit(c))  { num = num * 10 + (c - '0'); }
        else if (c == '+')    { result += sign * num; num = 0; sign =  1; }
        else if (c == '-')    { result += sign * num; num = 0; sign = -1; }
        else if (c == '(')    { stack.Push(result); stack.Push(sign); result = 0; sign = 1; }
        else if (c == ')')
        {
            result += sign * num; num = 0;
            result = result * stack.Pop() + stack.Pop(); // sign_before_( * inner + outer_result
        }
    }
    return result + sign * num; // flush last number
}
```

> **Key insight:** on `(` save the outer (result, sign) onto the stack and reset; on `)` multiply the inner result by the saved sign and add the saved outer result.

---

### Basic Calculator II — LeetCode 227

Evaluate a string with digits, `+`, `−`, `*`, `/`, spaces (no parentheses); truncate division toward zero.

**Example:** `s = " 3+5 / 2 "` → `5`

```text
OPTIMAL — PREVIOUS-NUMBER STACK | O(n) | O(n)

+/-: push ±num (defer addition to the end)
*//: pop, apply immediately, push result
Final answer = sum of stack.
```

```csharp
public int Calculate(string s)
{
    var stack = new Stack<int>();
    int num = 0;
    char op = '+'; // virtual leading '+'
    for (int i = 0; i <= s.Length; i++)
    {
        char c = i < s.Length ? s[i] : '+'; // trailing '+' flushes last num
        if (char.IsDigit(c))
        {
            num = num * 10 + (c - '0');
        }
        else if (c != ' ')
        {
            if      (op == '+') stack.Push(num);
            else if (op == '-') stack.Push(-num);
            else if (op == '*') stack.Push(stack.Pop() * num);
            else                stack.Push((int)((long)stack.Pop() / num));
            op = c; num = 0;
        }
    }
    return stack.Sum();
}
```

> **Key insight:** `+` and `−` push the signed number (resolved at the end by summing); `*` and `/` are resolved immediately against the top of the stack, implementing precedence without explicit brackets.

---

## Stack Simulation

### Decode String — LeetCode 394

Given an encoded string like `"3[a2[c]]"`, decode it to `"accaccacc"`.

**Example:** `s = "2[abc]3[cd]ef"` → `"abcabccdcdcdef"`

```text
BRUTE FORCE | O(n · max_k) | O(n)

Repeatedly find innermost bracket and expand.

------------------------------------------------------------------------------

OPTIMAL — STACK | O(n) | O(n)

On digit: accumulate k.
On '[': push (currentString, k) onto stack; reset.
On ']': pop (prevString, k); currentString = prevString + currentString * k.
On letter: append to currentString.
```

```csharp
public string DecodeString(string s)
{
    var strStack = new Stack<string>();
    var numStack = new Stack<int>();
    var cur = new System.Text.StringBuilder();
    int k = 0;

    foreach (char c in s)
    {
        if (char.IsDigit(c))
        {
            k = k * 10 + (c - '0');
        }
        else if (c == '[')
        {
            numStack.Push(k); k = 0;
            strStack.Push(cur.ToString()); cur.Clear();
        }
        else if (c == ']')
        {
            int repeat = numStack.Pop();
            string inner = cur.ToString();
            cur.Clear();
            cur.Append(strStack.Pop());
            for (int i = 0; i < repeat; i++) cur.Append(inner);
        }
        else
        {
            cur.Append(c);
        }
    }
    return cur.ToString();
}
```

> **Key insight:** treat `[` like `(` in a calculator — push current context, reset for the inner scope, restore on `]`.

---

### Simplify Path — LeetCode 71

Simplify a Unix file path (resolve `.`, `..`, multiple `/`).

**Example:** `path = "/home//foo/../bar"` → `"/home/bar"`

```text
OPTIMAL — STACK | O(n) | O(n)

Split on '/'. For each token:
    ".."  → pop (if non-empty)
    "." or "" → skip
    else  → push component
Result = "/" + string.Join("/", stack reversed)
```

```csharp
public string SimplifyPath(string path)
{
    var stack = new Stack<string>();
    foreach (var part in path.Split('/'))
    {
        if (part == "..")   { if (stack.Count > 0) stack.Pop(); }
        else if (part != "" && part != ".") stack.Push(part);
    }
    var parts = stack.ToArray();
    Array.Reverse(parts); // Stack enumerates top→bottom; we need root→leaf
    return "/" + string.Join("/", parts);
}
```

> **Key insight:** a stack naturally handles `..` (go up = pop) while building the canonical path component by component.

