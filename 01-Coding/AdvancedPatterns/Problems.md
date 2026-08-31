# Advanced Patterns — Problems

## Range Sum Query - Mutable

Design a structure over an integer array supporting `update(index, value)` and `sumRange(left, right)`.

**Example:** `nums = [1, 3, 5]; sumRange(0, 2)` → `9`; `update(1, 2), sumRange(0, 2)` → `8`

```text
PLAIN ARRAY | O(1) update, O(N) query | O(1)
PREFIX SUM   | O(N) update, O(1) query | O(N)

Use a prefix-sum array only when the data is immutable

-----------------------------------------------------------------------------

FENWICK TREE | O(log N) update, O(log N) query | O(N)

sumRange(left, right) = QUERY(right + 1) - QUERY(left)
Simplest to write, but only supports invertible operations such as sum and xor

-----------------------------------------------------------------------------

SEGMENT TREE | O(log N) update, O(log N) query | O(4N)

// Each node stores the aggregate of a range; children split the range in half
// Change the merge operation for min, max, gcd, or count queries

BUILD(node, left, right):
    if left == right:
        tree[node] = nums[left]
        return
    mid = left + (right - left) / 2
    BUILD(2 * node, left, mid)
    BUILD(2 * node + 1, mid + 1, right)
    tree[node] = tree[2 * node] + tree[2 * node + 1]

UPDATE(node, left, right, index, value):
    if left == right:
        tree[node] = value
        return
    mid = left + (right - left) / 2
    if index <= mid:
        UPDATE(2 * node, left, mid, index, value)
    else:
        UPDATE(2 * node + 1, mid + 1, right, index, value)
    tree[node] = tree[2 * node] + tree[2 * node + 1]

QUERY(node, left, right, queryLeft, queryRight):
    if queryRight < left OR right < queryLeft:
        return 0                       // No overlap
    if queryLeft <= left AND right <= queryRight:
        return tree[node]              // Total overlap
    mid = left + (right - left) / 2
    return QUERY(2 * node, left, mid, queryLeft, queryRight)
           + QUERY(2 * node + 1, mid + 1, right, queryLeft, queryRight)
```

> Range updates (add a value to every element in a range) need lazy propagation: store the pending delta on the node and push it down only when that subtree is visited.

## Car Pooling

Given trips `[passengers, start, end]` and a vehicle capacity, determine whether all trips can be completed without exceeding the capacity.

**Example:** `trips = [[2,1,5],[3,3,7]], capacity = 4` → `false`

```text
BRUTE FORCE | O(N * range) | O(range)

For every trip, add its passengers to each stop in [start, end)

-----------------------------------------------------------------------------

DIFFERENCE ARRAY | O(N + range) | O(range)

// Mark only the boundaries, then a prefix sum reconstructs every value
// Turns range updates into O(1) each

for each [passengers, start, end]:
    diff[start] += passengers
    diff[end] -= passengers

current = 0
for location = 0 to range - 1:
    current += diff[location]
    if current > capacity:
        return false
return true

-----------------------------------------------------------------------------

SWEEP LINE | O(N log N) | O(N)

Sort the boundary events and scan them; use this when coordinates are large or unbounded
Process drop-offs before pick-ups at the same coordinate
```

## LRU Cache

Design a cache with a fixed capacity that supports `get(key)` and `put(key, value)` in O(1) average time. When the capacity is exceeded, evict the least recently used key.

**Example:** `capacity = 2; put(1,1), put(2,2), get(1), put(3,3), get(2)` → `1`, then `-1` (key 2 was evicted)

```text
HASH MAP + DOUBLY LINKED LIST | O(1) | O(capacity)

// The map gives O(1) lookup, the list gives O(1) reordering and eviction
// A doubly linked list is required so a node can be unlinked without traversal
// head = most recently used, tail = least recently used (both are dummy sentinels)

GET(key):
    if key not in map:
        return -1
    node = map[key]
    move node to the front
    return node.value

PUT(key, value):
    if key in map:
        node = map[key]
        node.value = value
        move node to the front
        return
    if map.size == capacity:
        victim = tail.previous
        unlink victim
        remove victim.key from map
    node = new Node(key, value)
    insert node at the front
    map[key] = node
```

> - Nodes must store the key as well as the value, otherwise the evicted entry cannot be removed from the map.
> - LFU cache: keep a frequency map plus one doubly linked list per frequency, and track the current minimum frequency.
