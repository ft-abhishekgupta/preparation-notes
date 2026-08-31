# Stacks and Queues — Problems

## Valid Parentheses

Given a string s containing only: ( ) { } [ ]. Determine whether the brackets are valid.

**Example:** `s = "()[]{}"` → `true`

```text
STACK | O(N) | O(N)

stack = empty
for each character c:
    if c is opening bracket:
        push c closing
    else:
        if stack is empty:
            return false
        top = pop stack
        if top doesn't match c:
            return false
return stack is empty
```

## Min Stack

Design a stack that supports the following operations in O(1) time:
push(x) — add an element
pop() — remove the top element
top() — return the top element
getMin() — return the minimum element currently in the stack

**Example:** `push(-2), push(0), push(-3), getMin()` → `-3`; then `pop(), top()` → `0`, `getMin()` → `-2`

```text
STACK | O(1) | O(N)

// Maintain 2 stacks, one for the actual stack and another for the minimums. The minStack always has the current minimum at the top.

create stack
create minStack
push(x)
    stack.push(x)
    if minStack is empty
        minStack.push(x)
    else
        currentMin = minStack.top()
        minStack.push(min(x, currentMin))
pop()
    minStack.pop()
    stack.pop()
top()
    return stack.top()
getMin()
    return minStack.top()
```

## Evaluate Reverse Polish Notation

You are given an array of tokens representing an arithmetic expression in Reverse Polish Notation (RPN).
Evaluate the expression and return the integer result.

**Example:** `tokens = ["2","1","+","3","*"]` → `9`

```text
BRUTE FORCE | O(N^2) | O(N)

Repeatedly scan the array for operators and apply them to the two preceding numbers, replacing them with the result

-----------------------------------------------------------------------------

RECURSION | O(N) | O(N)

evaluateFromRight()
    token = read previous token
    if token is number
        return token
    right = evaluateFromRight()
    left = evaluateFromRight()
    return apply token to left and right

-----------------------------------------------------------------------------

STACK | O(N) | O(N)

// Push numbers into stack, and pop two numbers when an operator is encountered

create empty stack
for each token in tokens
    if token is a number
        push token onto stack
    else
        right = pop stack
        left = pop stack
        if token == "+"
            result = left + right
        else if token == "-"
            result = left - right
        else if token == "*"
            result = left * right
        else if token == "/"
            result = left / right
            truncate toward zero
        push result
return stack.top
```

## Daily Temperatures

Given an array temperatures, where: temperatures[i] represents the temperature on day i, return an array where: answer[i] is the number of days you have to wait until a warmer temperature.

**Example:** `temperatures = [73, 74, 75, 71, 69, 72, 76, 73]` → `[1, 1, 4, 2, 1, 1, 0, 0]`

```text
BRUTE FORCE | O(N^2) | O(1)

For each day, scan the following days to find the next warmer temperature

-----------------------------------------------------------------------------

MONOTONIC STACK | O(N) | O(N)

// Monotonic Stack : Stores indices of values in decreasing order.

create answer array of size n
create empty stack
for i = n - 1 down to 0
    while stack is not empty AND temperatures[stack.top()] <= temperatures[i]
        stack.pop()
    if stack is not empty
        answer[i] = stack.top() - i
    else
        answer[i] = 0
    stack.push(i)
return answer

// LEFT TO RIGHT

create answer array initialized to 0
create empty stack
for i = 0 to n - 1
    while stack is not empty AND temperatures[i] > temperatures[stack.top()]
        previous = stack.pop()
        answer[previous] = i - previous
    stack.push(i)
return answer
```

|                | Right → Left      | Left → Right                  |
| -------------- | ----------------- | ----------------------------- |
| Stack contains | Future candidates | Unresolved previous days      |
| Main question  | Next warmer       | Which days does this resolve? |

## Next Greater Element I

You are given two arrays with unique elements: nums1 and nums2. nums1 is a subset of nums2.
For every element in nums1, find the first greater element to its right in nums2.
If no greater element exists, return -1.

**Example:** `nums1 = [4, 1, 2], nums2 = [1, 3, 4, 2]` → `[-1, 3, -1]`

```text
BRUTE FORCE | O(N * M) | O(1)

For each element in nums1, scan nums2 to find the next greater element

-----------------------------------------------------------------------------

MONOTONIC STACK + HASH MAP | O(N + M) | O(N)

create empty stack
create empty hash map nextGreater
for each value x in nums2
    while stack is not empty AND x > stack.top()
        smaller = stack.pop()
        nextGreater[smaller] = x
    stack.push(x)

// Anything still on the stack has no greater element
while stack is not empty
    nextGreater[stack.pop()] = -1

for each value in nums1
    result.add(nextGreater[value])
return result

// RIGHT TO LEFT

create empty stack
create empty map

for i = n - 1 down to 0
    x = nums2[i]
    while stack is not empty AND stack.top() <= x
        stack.pop()
    if stack is empty
        nextGreater[x] = -1
    else
        nextGreater[x] = stack.top()
    stack.push(x)
```

## Next Greater Element II

You are given a circular array nums. For each element in nums, find the next greater element

**Example:** `nums = [1, 2, 1]` → `[2, -1, 2]`

```text
BRUTE FORCE | O(N^2) | O(1)

For each element, scan the array circularly to find the next greater element

-----------------------------------------------------------------------------

MONOTONIC STACK | O(N) | O(N)

// Process the array twice to simulate circularity, using a monotonic stack to keep track of the next greater elements
// Either explicitly duplicate the array or use modulo to wrap around

create answer array filled with -1
create empty stack

for i = 2*n - 1 down to 0
    current = nums[i % n]
    while stack is not empty
          and stack.top() <= current
        stack.pop()
    if i < n
        if stack is not empty
            answer[i] = stack.top()
    stack.push(current)
return answer

// LEFT TO RIGHT

create answer array filled with -1
create empty stack

for i = 0 to 2*n - 1
    currentIndex = i % n
    while stack is not empty
          and nums[currentIndex] > nums[stack.top()]
        previous = stack.pop()
        answer[previous] = nums[currentIndex]
    if i < n
        stack.push(currentIndex)
return answer
```

## Largest Rectangle in Histogram

Given an array of integers heights, where each element represents the height of a histogram bar and every bar has width 1, find the area of the largest rectangle that can be formed

**Example:** `heights = [2, 1, 5, 6, 2, 3]` → `10`

```text
BRUTE FORCE | O(N^2) | O(1)

For each bar, expand left and right to find the maximum width for which the height is at least the height of the current bar, and calculate the area

-----------------------------------------------------------------------------

TWO STACKS | O(N) | O(N)

// area = heights[i] × (rightSmaller - leftSmaller - 1)

Create 2 stacks, leftSmaller and rightSmaller, to store the index of the next smaller element to the left and right of each bar

maxArea = 0
for i = 0 to n - 1
    width = rightSmaller[i] - leftSmaller[i] - 1
    area = heights[i] × width
    maxArea = max(maxArea, area)
return maxArea

------------------------------------------------------------------------------

MONOTONIC INCREASING STACK | O(N) | O(N)

// When a bar is popped from the stack, it means we have found the next smaller element to the right. The previous smaller element is the new top of the stack after popping.
// Add 0 at the end of the heights array to ensure all bars are popped from the stack by the end of the iteration.

create empty stack
maxArea = 0

for i = 0 to n
    if i == n
        currentHeight = 0
    else
        currentHeight = heights[i]

    while stack is not empty
          and currentHeight < heights[stack.top()]
        heightIndex = stack.pop()
        height = heights[heightIndex]
        if stack is empty
            width = i
        else
            width = i - stack.top() - 1
        area = height × width
        maxArea = max(maxArea, area)
    stack.push(i)
return maxArea
```

## Remove K Digits

Given a non-negative integer represented as a string num and an integer k, remove exactly k digits from num so that the resulting number is the smallest possible number.

Return the result as a string.

**Example:** `num = "1432219", k = 3` → `"1219"`

```text
BRUTE FORCE | O(C(n,k) × n) | O(1)
Generate all combinations of removing k digits and find the minimum

-----------------------------------------------------------------------------

MONOTONIC STACK | O(N) | O(N)

// Whenever the current digit is smaller than the previous kept digit, remove the previous larger digit.
// Use a stack to keep track of the digits of the resulting number.

create empty stack

for each digit d in num
    while k > 0
          and stack is not empty
          and stack.top() > d
        stack.pop()
        k--
    stack.push(d)
while k > 0
    stack.pop()
    k--
remove leading zeros
if stack is empty
    return "0"
return stack as string

// Alternate questions - Lexicographically Smallest Subsequence
```

## Asteroid Collision

You are given an array asteroids. Each asteroid has:

- Absolute value = size
- Sign = direction
- positive → moving right
- negative → moving left

All asteroids move at the same speed. When two asteroids collide:

- Smaller asteroid is destroyed.
- Larger asteroid survives.
- If both have the same size, both are destroyed.
- Asteroids moving in the same direction never collide.

Return the state of the asteroids after all collisions.

**Example:** `asteroids = [5, 10, -5]` → `[5, 10]`

```text
BRUTE FORCE | O(N^2) | O(1)
Repeatedly scan the array for collisions and resolve them until no more collisions occur

-----------------------------------------------------------------------------

STACK | O(N) | O(N)

// Use a stack to keep track of asteroids moving to the right. When a left-moving asteroid is encountered, resolve collisions with the stack.

create empty stack
for each asteroid x
    alive = true
    while alive
          and x < 0
          and stack is not empty
          and stack.top() > 0
        top = stack.top()
        if top < abs(x)
            stack.pop()
        else if top == abs(x)
            stack.pop()
            alive = false
        else
            alive = false
    if alive
        stack.push(x)
return stack
```

## Car Fleet

There are n cars traveling toward the same destination. You are given:
target — destination position
position[i] — starting position of car i
speed[i] — speed of car i

All cars:
Move in the same direction.
Start at different positions.
Cannot pass another car.
If a faster car catches a slower car, it slows down and becomes part of the same car fleet.

Return the number of car fleets that will arrive at the destination.

**Example:** `target = 12, position = [10, 8, 0, 5, 3], speed = [2, 4, 1, 1, 3]` → `3`

```text
BRUTE FORCE | O(N^3) | O(1)

For each car, simulate its movement and check for collisions with other cars to determine fleets. Complex and inefficient for large n.

-----------------------------------------------------------------------------

STACK | O(N log N) | O(N)

// Pair each car's position with its time to reach the target, sort by position from closest to farthest from target, and use a stack to determine fleets based on arrival times.

create list of cars
for each i: car = (position[i], speed[i])
sort cars by position descending
create empty stack of arrival times

for each car in sorted order
    time = (target - car.position) / car.speed

    if stack is empty or time > stack.top()
        stack.push(time)

return stack.count

-----------------------------------------------------------------------------
WITHOUT STACK | O(N log N) | O(1)

sort cars by position descending
fleetCount = 0
lastFleetTime = 0
for each car
    time = (target - position) / speed

    if fleetCount == 0 or time > lastFleetTime
        fleetCount++
        lastFleetTime = time

return fleetCount
```

## Calculator

Given a string representing a mathematical expression, evaluate it and return its integer result.
The expression can contain: digits, +, -, (, ), spaces. Example - `1 + (2 - (3 + 4))`

**Example:** `s = "1 + (2 - (3 + 4))"` → `-4`

```text
BRUTE FORCE | O(N^2) | O(1)
Repeatedly scan the string for parentheses and evaluate the innermost expressions first, replacing them with their results until no parentheses remain.

-----------------------------------------------------------------------------

STACK | O(N) | O(N)

// Use a stack to keep track of the current result and sign. When encountering '(', push the current result and sign onto the stack, and reset them. When encountering ')', pop from the stack and combine with the current result.

result = 0
sign = +1
create empty stack
i = 0

while i < length(expression)
    if expression[i] is space
        i++
    else if expression[i] is digit
        number = 0
        while i < length
              and expression[i] is digit
            number =  number × 10 + digit value
            i++
        result += sign × number
        continue
    else if expression[i] == '+'
        sign = +1
    else if expression[i] == '-'
        sign = -1
    else if expression[i] == '('
        stack.push(result)
        stack.push(sign)
        result = 0
        sign = +1
    else if expression[i] == ')'
        previousSign = stack.pop()
        previousResult = stack.pop()
        result = previousResult + previousSign × result
    i++
return result
```

## Implement Queue using Stacks

Implement a FIFO queue using only two stacks, supporting `push`, `pop`, `peek`, and `empty`.

**Example:** `push(1), push(2), peek(), pop(), empty()` → `1`, `1`, `false`

```text
TWO STACKS | O(1) amortized | O(N)

// Reversing a stack into another stack yields FIFO order
// Each element is moved between the stacks at most once

PUSH(x):
    inStack.push(x)

TRANSFER():
    if outStack is empty:
        while inStack is not empty:
            outStack.push(inStack.pop())

POP():
    TRANSFER()
    return outStack.pop()

PEEK():
    TRANSFER()
    return outStack.top()

EMPTY():
    return inStack is empty AND outStack is empty
```

> Never transfer while `outStack` is non-empty, otherwise the ordering breaks.
