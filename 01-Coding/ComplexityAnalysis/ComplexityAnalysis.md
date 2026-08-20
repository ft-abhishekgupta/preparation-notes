# Complexity Analysis

## Time and Space Complexity

Complexity is a measure of the amount of resources (time and space) that an algorithm uses as a function of the size of the input.
It is measured to evaluate efficiency, compare algorithms, and predict performance on scale.

### Best, Average, and Worst Case Complexity

- Best Case: Ω(n) - Minimum Time
- Average Case: Θ(n) - Average Time
- Worst Case: O(n) - Maximum Time

**Big O Notation: O(f(n))**
= There exists a constant c > 0 and n0 > 0 such that T(n) ≤ c \* f(n) for all n ≥ n0.
![alt text](image.png)

> Big O Notation = Upper Bound of the algorithm's running time = USUALLY CONSIDERED AS TIME COMPLEXITY

### Space Complexity

Space complexity is the amount of memory space required by an algorithm in its life cycle

- Input Space: The space required to store the input data.
- Auxiliary Space: The space required by the algorithm to perform its operations, excluding the input space.
- Output Space: The space required to store the output data.

> Auxiliary Space = Total Space - Input Space - Output Space = USUALLY CONSIDERED AS SPACE COMPLEXITY

### Time Complexity

```cs
// Linear Loops
for (int i = 0; i < n; i++) { ... } // O(n)
// Nested Loops
for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) { ... } // O(n^2)
}
// Logarithmic Loops
for (int i = 1; i < n; i *= 2) { ... } // O(log n)
// Recursive Calls
void RecursiveFunction(int n) {
    if (n <= 1) return;
    RecursiveFunction(n - 1); // O(n)
    RecursiveFunction(n / x); // O(log n base x)
    RecursiveFunction(n / 2); for (int i = 0; i < n; i++) { ... } // O(n Log n)
    RecursiveFunction(n - 1); RecursiveFunction(n - 1); // O(2^n)
}
```

#### Calculating Time Complexity

1. Ignore constant factors and lower order terms.
2. Focus on the dominant term that grows the fastest as n increases.
3. If Else statements: Take the maximum time complexity of the branches.
4. Loops: Multiply the time complexity of the loop body by the number of iterations.
5. Recursion: Use recurrence relations or the Master Theorem to analyze recursive algorithms.

| Complexity | Name         | Example                                     |
| ---------- | ------------ | ------------------------------------------- |
| O(1)       | Constant     | Accessing an array element by index         |
| O(log n)   | Logarithmic  | Binary Search                               |
| O(n)       | Linear       | Traversing an array or linked list          |
| O(n log n) | Linearithmic | Merge Sort, Quick Sort                      |
| O(n^2)     | Quadratic    | Bubble Sort, Insertion Sort, Selection Sort |
| O(2^n)     | Exponential  | Recursive Fibonacci, Subset generation      |
| O(n!)      | Factorial    | Traveling Salesman Problem (TSP)            |
