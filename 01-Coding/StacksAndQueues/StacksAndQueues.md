# Stacks and Queues

> **Core idea:** a monotonic stack resolves "next greater/smaller" queries in O(n) by keeping only elements whose answer is still unknown.
> **Recognise it when:** "next greater / smaller element", "previous greater / smaller", "histogram rectangle area", "sliding window max/min", "remove digits to minimise", "asteroid collision".
> **Costs:** O(n) time (each index pushed and popped at most once), O(n) space.

---

## Mental Model

**Stack invariant:** the stack always holds indices (almost always indices, not values) whose answer is still unknown, arranged in monotonic order of their values.

When a new element arrives:
- If it breaks the monotonic order → pop everything it dominates and **resolve their answers**.
- Push the new index.
- Elements that survive to the end of the loop have no answer → default value (usually −1 or 0).

**Why O(n)?** Each index is pushed exactly once and popped at most once → total work ≤ 2n regardless of inner loop iterations.

**Deque extension:** for a sliding window, the same invariant holds at the back; additionally, expire stale indices off the front when they leave the window.

---

## C# Types

| Need | C# type | Notes |
| ---- | ------- | ----- |
| Stack (LIFO) | `Stack<T>` | `Push`, `Pop`, `Peek`, `Count` |
| Queue (FIFO) | `Queue<T>` | `Enqueue`, `Dequeue`, `Peek`, `Count` |
| Deque | `LinkedList<T>` | `AddFirst/Last`, `RemoveFirst/Last`, `First/Last.Value` |
| Deque (array-backed) | Two `Stack<T>` | O(1) amortised; or `List<T>` as ring buffer |

> **Trap:** .NET has no built-in `Deque<T>`. `LinkedList<T>` is the standard substitute — each node carries prev/next pointers (higher constant). For interview-scale input this is fine.

> **Trap:** `Stack<T>` **enumerates top → bottom** (counter-intuitive). Never rely on enumeration order for correctness; use `ToArray()` if you need bottom-to-top.

---

## Complexity Reference

| Operation | Stack\<T\> | Queue\<T\> | LinkedList\<T\> (deque) |
| --------- | ---------- | ---------- | ----------------------- |
| Push / Enqueue front or back | O(1) | O(1) | O(1) |
| Pop / Dequeue front or back | O(1) | O(1) | O(1) |
| Peek | O(1) | O(1) | O(1) |
| Search / index | O(n) | O(n) | O(n) |

For full C# collections complexity table see [`CSharp/CSharp.md`](../CSharp/CSharp.md).

---

## Templates

### Monotonic Stack — Four Variants

**The single loop skeleton** (always iterate left → right unless the variant says otherwise):

```csharp
// use when: "for each element, find the NEXT GREATER element to its right"
int[] NextGreater(int[] nums)
{
    int n = nums.Length;
    int[] res = new int[n]; Array.Fill(res, -1);
    var stack = new Stack<int>(); // stores INDICES, not values

    for (int i = 0; i < n; i++)
    {
        // pop anything dominated by nums[i]
        while (stack.Count > 0 && nums[stack.Peek()] < nums[i])
            res[stack.Pop()] = nums[i];
        stack.Push(i);
    }
    return res; // remaining indices on stack → no greater element → stay -1
}
// O(n) time, O(n) space
```

**Four-variant table** — change the comparison and/or iteration direction:

| Variant | Stack order | Comparison to pop | Iterate | Default |
| ------- | ----------- | ----------------- | ------- | ------- |
| Next Greater | Decreasing | `nums[top] < nums[i]` | L→R | −1 |
| Next Smaller | Increasing | `nums[top] > nums[i]` | L→R | −1 |
| Previous Greater | Decreasing | `nums[top] <= nums[i]` | L→R, answer = `nums[stack.Peek()]` after pop | −1 |
| Previous Smaller | Increasing | `nums[top] >= nums[i]` | L→R, answer = `nums[stack.Peek()]` after pop | −1 |

> **Strict vs non-strict:** use `<` (strict) to get the *first* strictly greater element. Use `<=` to skip duplicates and find the *last* occurrence — important when the same value appears multiple times and you want the contribution-counting trick to avoid double-counting (see Sum of Subarray Minimums).

> **Why it works:** each time we pop index `j` while processing index `i`, index `i` is literally the first element to the right of `j` that satisfies the condition. The stack maintains all unresolved indices in the correct order.

---

### Histogram / Rectangle Family

```csharp
// use when: "largest area rectangle in histogram" (LeetCode 84)
// Sentinel: append height 0 to flush all remaining bars at the end.
int LargestRectangleArea(int[] heights)
{
    int n = heights.Length, max = 0;
    var stack = new Stack<int>(); // increasing heights — indices

    for (int i = 0; i <= n; i++)
    {
        int h = i < n ? heights[i] : 0; // sentinel forces full flush
        while (stack.Count > 0 && heights[stack.Peek()] > h)
        {
            int height = heights[stack.Pop()];
            // width: from (new top + 1) to (i - 1)
            int width = stack.Count == 0 ? i : i - stack.Peek() - 1;
            max = Math.Max(max, height * width);
        }
        stack.Push(i);
    }
    return max;
}
// O(n) time, O(n) space
```

> **Key invariant:** when bar `j` is popped because bar `i` is shorter, `heights[j]` can extend from `stack.Peek()+1` to `i-1` as the minimum height — that's the widest it can go.
>
> **Off-by-one:** width = `i - stack.Peek() - 1`. The `−1` is because `stack.Peek()` is the first bar to the LEFT that is strictly shorter, so it is excluded. Miss this and you get width one too large.

---

### Sum of Subarray Minimums — Contribution Counting

```csharp
// use when: sum over all subarrays of their minimum (LeetCode 907)
// Each element contributes to exactly (left_count * right_count) subarrays as the min.
// Use non-strict on one side to avoid double-counting equal elements.
int SumSubarrayMins(int[] arr)
{
    const int MOD = 1_000_000_007;
    int n = arr.Length;
    int[] left  = new int[n]; // # subarrays where arr[i] is the min going left (incl. self)
    int[] right = new int[n]; // # subarrays where arr[i] is the min going right (incl. self)

    var stack = new Stack<int>();
    for (int i = 0; i < n; i++)
    {
        while (stack.Count > 0 && arr[stack.Peek()] >= arr[i]) stack.Pop(); // non-strict left
        left[i] = stack.Count == 0 ? i + 1 : i - stack.Peek();
        stack.Push(i);
    }
    stack.Clear();
    for (int i = n - 1; i >= 0; i--)
    {
        while (stack.Count > 0 && arr[stack.Peek()] > arr[i]) stack.Pop(); // strict right
        right[i] = stack.Count == 0 ? n - i : stack.Peek() - i;
        stack.Push(i);
    }

    long ans = 0;
    for (int i = 0; i < n; i++)
        ans = (ans + (long)arr[i] * left[i] * right[i]) % MOD;
    return (int)ans;
}
// O(n) time, O(n) space
```

> **Why non-strict on one side:** for equal adjacent elements `[3, 3]`, if both sides are strict, both elements claim the subarray containing both → double-count. Make left non-strict (`>=`) and right strict (`>`) to assign ownership to the leftmost equal element.

---

### Monotonic Deque — Sliding Window Maximum

```csharp
// use when: maximum (or minimum) over every window of size k (LeetCode 239)
int[] MaxSlidingWindow(int[] nums, int k)
{
    int n = nums.Length;
    int[] res = new int[n - k + 1];
    var dq = new LinkedList<int>(); // stores INDICES; front = index of window max

    for (int i = 0; i < n; i++)
    {
        // 1. Expire: front index is outside the window
        if (dq.Count > 0 && dq.First.Value < i - k + 1)
            dq.RemoveFirst();

        // 2. Dominate: remove from back anything ≤ nums[i] (they can never be the max)
        while (dq.Count > 0 && nums[dq.Last.Value] <= nums[i])
            dq.RemoveLast();

        dq.AddLast(i);

        // 3. Record answer once window is full
        if (i >= k - 1)
            res[i - k + 1] = nums[dq.First.Value];
    }
    return res;
}
// O(n) time (each index added/removed at most once), O(k) space
```

**Why the front is always the answer:** we never add an index smaller than any existing back element, so the deque is monotonically decreasing. The front is the largest index among the largest values → it is the window maximum.

**Two shrink conditions:**

| Condition | Where | Why |
| --------- | ----- | --- |
| `dq.First.Value < i - k + 1` | Front | Index has left the window; expired |
| `nums[dq.Last.Value] <= nums[i]` | Back | Old value dominated; can never be a future window max |

---

### Min-Stack (O(1) GetMin)

**Two-stack variant** — the standard answer. Keep a second stack whose top is always the minimum of everything currently in the main stack:

```csharp
// Invariant: _min[i] = min of all elements from the bottom up to position i
_s.Push(val);
_min.Push(_min.Count == 0 ? val : Math.Min(val, _min.Peek()));
// Pop both together; GetMin() => _min.Peek(). All ops O(1), O(n) extra space.
```

Full implementation: [Min Stack — LeetCode 155](Problems.md).

**Single-stack encoded-delta variant** — O(1) extra space, stores the *difference* from the current minimum instead of a parallel stack:

```csharp
public class MinStackDelta
{
    private Stack<long> _s = new();
    private long _min;

    public void Push(int val)
    {
        if (_s.Count == 0) { _s.Push(0L); _min = val; return; }
        long diff = (long)val - _min;
        _s.Push(diff);
        if (diff < 0) _min = val; // this push set a new global min
    }
    public void Pop()
    {
        long top = _s.Pop();
        if (top < 0) _min -= top; // restore previous min: _min - diff = old min
    }
    public int  Top()    => _s.Count > 0 && _s.Peek() < 0 ? (int)_min : (int)(_min + _s.Peek());
    public int  GetMin() => (int)_min;
}
```

> **Why it works:** a negative stored delta is the marker that *this* push lowered the minimum, so popping it must undo the change. `long` is required because `val - _min` can exceed `int` range.

---

### Queue from Two Stacks (Amortised O(1) Dequeue)

```csharp
// use when: "implement queue using stacks" (LeetCode 232)
public class MyQueue
{
    private Stack<int> _in = new(), _out = new();

    public void Push(int x) => _in.Push(x);

    private void Transfer() { while (_in.Count > 0) _out.Push(_in.Pop()); }

    public int Pop()
    {
        if (_out.Count == 0) Transfer();
        return _out.Pop();
    }
    public int Peek()
    {
        if (_out.Count == 0) Transfer();
        return _out.Peek();
    }
    public bool Empty() => _in.Count == 0 && _out.Count == 0;
}
// Amortised O(1): each element crosses from _in to _out exactly once.
```

> **Key:** only transfer when `_out` is empty. Transferring while `_out` is non-empty breaks FIFO order.

---

### Stack from One Queue

```csharp
// use when: "implement stack using queues" (LeetCode 225)
public class MyStack
{
    private Queue<int> _q = new();

    public void Push(int x)
    {
        _q.Enqueue(x);
        for (int i = 0; i < _q.Count - 1; i++)
            _q.Enqueue(_q.Dequeue()); // rotate: new element ends up at front
    }
    public int Pop()  => _q.Dequeue();
    public int Top()  => _q.Peek();
    public bool Empty() => _q.Count == 0;
}
// Push O(n); Pop/Top O(1). Only used to satisfy the puzzle constraint.
```

---

### Circular Queue (Ring Buffer)

A fixed-capacity FIFO backed by an array, where `_head` and `_tail` wrap with modulo arithmetic instead of shifting elements. All operations are O(1) and memory never grows.

| Field | Meaning |
| ----- | ------- |
| `_head` | index of the front element |
| `_tail` | index where the next element will be written |
| `_size` | element count — needed to distinguish "full" from "empty", since `_head == _tail` in both cases |

```csharp
// Index arithmetic — the whole trick
_tail = (_tail + 1) % _cap;              // advance on enqueue
_head = (_head + 1) % _cap;              // advance on dequeue
int rear = _buf[(_tail - 1 + _cap) % _cap];  // +_cap guards against -1
```

> **Trap:** `_head == _tail` means both empty *and* full. Track `_size` explicitly (or deliberately waste one slot) — otherwise the two states are indistinguishable.

Full implementation: [Design Circular Queue — LeetCode 622](Problems.md).

---

### Bracket Matching

```csharp
// use when: "valid parentheses", "check balanced brackets"
bool IsValid(string s)
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
// O(n) time, O(n) space
```

---

### Expression Evaluation

```csharp
// RPN / Postfix evaluation — LeetCode 150
int EvalRPN(string[] tokens)
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
// O(n) time, O(n) space

// Basic Calculator I — LeetCode 224 (+, -, parentheses only)
int Calculate224(string s)
{
    var stack = new Stack<int>(); // saves (result, sign) pairs at '('
    int result = 0, num = 0, sign = 1;
    foreach (char c in s)
    {
        if (char.IsDigit(c))       { num = num * 10 + (c - '0'); }
        else if (c == '+')         { result += sign * num; num = 0; sign = 1; }
        else if (c == '-')         { result += sign * num; num = 0; sign = -1; }
        else if (c == '(')         { stack.Push(result); stack.Push(sign); result = 0; sign = 1; }
        else if (c == ')')
        {
            result += sign * num; num = 0;
            result = result * stack.Pop() + stack.Pop(); // sign_before_( * inner + result_before_(
        }
    }
    return result + sign * num;
}
// O(n) time, O(n) space

// Basic Calculator II — LeetCode 227 (+, -, *, / — no parentheses)
// Technique: push "previous number" adjusted for operator before it;
// * and / are resolved immediately; + and - are deferred to final sum.
int Calculate227(string s)
{
    var stack = new Stack<int>();
    int num = 0;
    char op = '+'; // pretend a leading '+' before the first number
    for (int i = 0; i <= s.Length; i++)
    {
        char c = i < s.Length ? s[i] : '+'; // trailing '+' flushes last number
        if (char.IsDigit(c))
        {
            num = num * 10 + (c - '0');
        }
        else if (c != ' ')
        {
            if (op == '+')      stack.Push(num);
            else if (op == '-') stack.Push(-num);
            else if (op == '*') stack.Push(stack.Pop() * num);
            else                stack.Push((int)((long)stack.Pop() / num)); // truncate toward zero
            op = c; num = 0;
        }
    }
    return stack.Sum();
}
// O(n) time, O(n) space
```

> **Key difference 224 vs 227:** 224 uses a sign variable toggled by `(` / `)`; 227 uses operator precedence by resolving `*`/`/` immediately on the stack and summing `+`/`−` at the end.

---

### Recursion → Explicit Stack Conversion

Converting a recursive DFS/tree traversal to an iterative explicit stack:

```text
RECIPE:
1. Create a stack; push the initial call's arguments.
2. While stack not empty:
   a. Pop the "frame" (args + local state needed to resume).
   b. If it represents a base case → record result, continue.
   c. Otherwise → push a "continuation frame" (the work after the recursive call)
      THEN push the next recursive call's frame.
3. Result is on the stack or in an accumulator when the loop ends.

KEY: push children in REVERSE order so the leftmost is processed first.
```

```csharp
// Example: inorder traversal without recursion (Trees.md owns tree traversals;
// this shows the general conversion pattern)
IList<int> InorderIterative(TreeNode root)
{
    var res = new List<int>();
    var stack = new Stack<TreeNode>();
    var cur = root;
    while (cur != null || stack.Count > 0)
    {
        while (cur != null) { stack.Push(cur); cur = cur.left; }
        cur = stack.Pop();
        res.Add(cur.val);
        cur = cur.right;
    }
    return res;
}
```

See [Trees](../Trees/Trees.md) for all iterative tree traversal templates.

---

## Pattern Recognition

| Problem says… | Reach for | Complexity |
| ------------- | --------- | ---------- |
| "next greater / smaller element" | Monotonic stack (NGE template) | O(n) |
| "previous greater / smaller" | Monotonic stack (iterate L→R, peek after pop) | O(n) |
| "remove k digits to minimise" | Monotonic stack (increasing) | O(n) |
| "histogram largest rectangle" | Monotonic stack + sentinel | O(n) |
| "maximal rectangle in matrix" | Row-by-row histogram | O(m·n) |
| "sum of subarray minimums/maximums" | Monotonic stack + contribution | O(n) |
| "asteroid / domino collision" | Stack (process left to right, resolve on collision) | O(n) |
| "sliding window max/min over fixed k" | Monotonic deque | O(n) |
| "valid/balanced parentheses" | Stack | O(n) |
| "evaluate expression / calculator" | Stack (RPN or sign-stack) | O(n) |
| "decode string" / "nested structure" | Stack to save outer state at `(` / `[` | O(n) |
| "O(1) min/max from a stack" | Min-stack (two stacks or encoded delta) | O(n) amortised |
| "implement queue with stacks" | Two-stack queue | O(1) amortised dequeue |
| "simplify / normalise path" | Stack (split on `/`, handle `..`) | O(n) |

---

## Variants and Differences

### Monotonic Stack vs Heap vs Sorting

| Need | Use | Why not the other |
| ---- | --- | ----------------- |
| Next greater for **every** element | **Monotonic stack** O(n) | Heap O(n log n); sort loses positions |
| K-th largest overall | **Heap** O(n log k) | Monotonic stack doesn't give global rank |
| Median of stream | **Two heaps** O(log n) per insert | Stack can't split at median |
| Sliding window max (fixed k) | **Monotonic deque** O(n) | **Heap** O(n log k) — valid but slower |
| Sort + binary search for NGE | Sort O(n log n) | Monotonic stack is strictly better |

### Trapping Rain Water — Monotonic Stack Alternative

This problem is **owned by [TwoPointers](../TwoPointers/Problems.md)** (two-pointer O(n) O(1) solution).

Monotonic stack approach (also O(n) time, O(n) space): maintain a stack of indices in decreasing height order. When a taller bar is found at `i`, pop the stack and compute the water trapped between the popped bar (the valley) and `min(heights[stack.Peek()], heights[i])` multiplied by the horizontal distance. Continue popping while the stack bar is still shorter than `heights[i]`.

See full treatment: [Trapping Rain Water](../TwoPointers/Problems.md).

---

## Pitfalls

- **Popping an empty stack** — always guard with `stack.Count > 0` before `Pop()` or `Peek()`. `Stack<T>.Pop()` throws `InvalidOperationException` on empty.
- **`Peek()` vs `Pop()`** — `Peek()` reads without removing; `Pop()` removes. Using `Pop()` when you only need to look at the top corrupts the stack state.
- **`Stack<T>` enumerates top → bottom** — `foreach` over a `Stack<T>` goes from most-recently-pushed to oldest. If you need bottom → top order, call `stack.ToArray()` (returns top-to-bottom) and reverse, or use a `List<T>` directly.
- **Store INDEX, not value** — almost all monotonic stack problems need the index to compute widths/distances. Storing the value loses position information. The rare exception is when values are unique and you only need the value.
- **Off-by-one in histogram width** — `width = i - stack.Peek() - 1`. The `−1` excludes the bar at `stack.Peek()` itself (it is shorter, so it bounds the rectangle). Forgetting it gives width one too large.
- **Sentinel in histogram** — append a virtual bar of height 0 (or iterate to `i <= n`) to flush all remaining bars. Without it, bars that are never shorter than any later bar are never popped and their areas are missed.
- **Using `Queue<T>` where a deque is needed** — `Queue<T>` supports only `Enqueue`/`Dequeue` (FIFO). If you need to remove from the back, use `LinkedList<T>` as a deque.
- **Strict vs non-strict in contribution counting** — use non-strict on one side (left `>=`, right `>`) to avoid double-counting subarrays with equal minimum values.
- **Forgetting to flush the last number in calculator** — the `Calculate` loop processes operators but the last number has no following operator to trigger a push. Always add `result += sign * num` after the loop (or synthesise a trailing operator in the loop condition).

---

## Practice

→ [`Problems.md`](Problems.md)

| LeetCode | Problem | Pattern |
| -------- | ------- | ------- |
| 20 | Valid Parentheses | Bracket matching |
| 32 | Longest Valid Parentheses | Stack + DP |
| 71 | Simplify Path | Stack |
| 84 | Largest Rectangle in Histogram | Monotonic stack |
| 85 | Maximal Rectangle | Row histogram |
| 150 | Evaluate RPN | Stack |
| 155 | Min Stack | Design |
| 224 | Basic Calculator | Stack + sign |
| 227 | Basic Calculator II | Stack + precedence |
| 225 | Implement Stack using Queues | Design |
| 232 | Implement Queue using Stacks | Design |
| 239 | Sliding Window Maximum | Monotonic deque |
| 394 | Decode String | Stack |
| 402 | Remove K Digits | Monotonic stack |
| 496 | Next Greater Element I | Monotonic stack |
| 503 | Next Greater Element II | Monotonic stack circular |
| 622 | Design Circular Queue | Ring buffer |
| 735 | Asteroid Collision | Stack |
| 739 | Daily Temperatures | Monotonic stack |
| 901 | Online Stock Span | Monotonic stack |
| 907 | Sum of Subarray Minimums | Monotonic stack + contribution |
