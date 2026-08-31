# Stacks and Queues

---

## Core Concepts

- **Stack** — LIFO; `push`/`pop`/`peek` all O(1). C#: `Stack<T>`.
- **Queue** — FIFO; `enqueue`/`dequeue` O(1). C#: `Queue<T>`.
- **Deque (double-ended queue)** — O(1) push/pop at both ends. C#: `LinkedList<T>` or `ArrayDeque` workaround with `LinkedList`.
- **Monotonic stack** — stack maintained in strictly increasing or decreasing order of elements. Elements are popped when a "better" element arrives.
- **Monotonic deque** — deque maintained so front is always the current window maximum/minimum. Used in sliding-window max.

---

## Queue with 2 Stacks

```csharp
public class MyQueue
{
    private Stack<int> _in = new(), _out = new();

    public void Enqueue(int x) => _in.Push(x);

    public int Dequeue()
    {
        if (_out.Count == 0)
            while (_in.Count > 0) _out.Push(_in.Pop()); // lazy transfer
        return _out.Pop();
    }

    public int Peek()
    {
        if (_out.Count == 0)
            while (_in.Count > 0) _out.Push(_in.Pop());
        return _out.Peek();
    }
}
// Each element moved at most once: Dequeue O(1) amortized.
```

---

## Stack with 1 Queue (LIFO via rotation)

```csharp
public class MyStack
{
    private Queue<int> _q = new();

    public void Push(int x)
    {
        _q.Enqueue(x);
        for (int i = 0; i < _q.Count - 1; i++) _q.Enqueue(_q.Dequeue()); // rotate
    }
    public int Pop()  => _q.Dequeue();
    public int Top()  => _q.Peek();
}
// Push O(n); pop/top O(1). Used only to satisfy "implement stack using queue" puzzles.
```

---

## Min-Stack in O(1)

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
    public void Pop()       { _s.Pop(); _min.Pop(); }
    public int  Top()       => _s.Peek();
    public int  GetMin()    => _min.Peek();
}
// _min tracks running minimum in sync with _s. All ops O(1).
```

---

## Monotonic Stack Patterns

### Next Greater Element

```csharp
int[] NextGreater(int[] A)
{
    int n = A.Length;
    int[] res = Enumerable.Repeat(-1, n).ToArray();
    var stack = new Stack<int>(); // indices, decreasing value order
    for (int i = 0; i < n; i++)
    {
        while (stack.Count > 0 && A[stack.Peek()] < A[i])
            res[stack.Pop()] = A[i];
        stack.Push(i);
    }
    return res;
}
// O(n) — each index pushed and popped at most once.
```

**Canonical problems:**

- LeetCode 496 — Next Greater Element I
- LeetCode 503 — Next Greater Element II (circular: iterate twice, index `% n`)
- LeetCode 901 — Online Stock Span: accumulate span counts while popping

### Largest Rectangle in Histogram (LeetCode 84)

```csharp
int LargestRectangle(int[] heights)
{
    var stack = new Stack<int>(); // increasing heights (indices)
    int max = 0;
    int n = heights.Length;
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
// O(n) time, O(n) space.
```

### Trapping Rain Water (LeetCode 42)

```csharp
// Two-pointer O(n) O(1) — alternative to monotonic stack
int Trap(int[] height)
{
    int lo = 0, hi = height.Length - 1, maxL = 0, maxR = 0, water = 0;
    while (lo < hi)
    {
        if (height[lo] < height[hi])
        {
            maxL = Math.Max(maxL, height[lo]);
            water += maxL - height[lo++];
        }
        else
        {
            maxR = Math.Max(maxR, height[hi]);
            water += maxR - height[hi--];
        }
    }
    return water;
}
```

---

## Sliding Window Maximum with Deque (LeetCode 239)

```csharp
int[] MaxSlidingWindow(int[] A, int k)
{
    int n = A.Length;
    int[] res = new int[n - k + 1];
    var dq = new LinkedList<int>(); // indices; front = max of current window

    for (int i = 0; i < n; i++)
    {
        // Remove indices out of window
        while (dq.Count > 0 && dq.First.Value < i - k + 1)
            dq.RemoveFirst();
        // Maintain decreasing order — remove smaller elements from back
        while (dq.Count > 0 && A[dq.Last.Value] < A[i])
            dq.RemoveLast();
        dq.AddLast(i);
        if (i >= k - 1) res[i - k + 1] = A[dq.First.Value];
    }
    return res;
}
// O(n) — each element enqueued/dequeued at most once.
```

---

## Valid Parentheses

```csharp
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
```

---

## Infix → Postfix (Shunting-Yard) & Evaluation

```csharp
// Evaluate postfix (RPN) — LeetCode 150
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

// Basic calculator (infix with +, -, parentheses) — LeetCode 224
int Calculate(string s)
{
    var stack = new Stack<int>();
    int result = 0, num = 0, sign = 1;
    foreach (char c in s)
    {
        if (char.IsDigit(c)) { num = num * 10 + (c - '0'); }
        else if (c == '+') { result += sign * num; num = 0; sign = 1; }
        else if (c == '-') { result += sign * num; num = 0; sign = -1; }
        else if (c == '(') { stack.Push(result); stack.Push(sign); result = 0; sign = 1; }
        else if (c == ')') { result += sign * num; num = 0; result *= stack.Pop(); result += stack.Pop(); }
    }
    return result + sign * num;
}
```

---

## Circular Queue (Ring Buffer)

```csharp
public class CircularQueue
{
    private int[] _buf;
    private int _head, _tail, _size, _cap;

    public CircularQueue(int k) { _buf = new int[k]; _cap = k; }

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
    public int Front() => IsEmpty() ? -1 : _buf[_head];
    public int Rear()  => IsEmpty() ? -1 : _buf[(_tail - 1 + _cap) % _cap];
    public bool IsEmpty() => _size == 0;
    public bool IsFull()  => _size == _cap;
}
```

---
