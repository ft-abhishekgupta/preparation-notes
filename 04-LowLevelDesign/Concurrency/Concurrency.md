## Concurrency and Thread Safety

<!-- Race conditions
Deadlocks
Thread safety
Atomic operations
Critical sections
Producer-consumer
Thread-safe singleton -->

Concurrency occurs when 2 or more process/thread tries to change same resource

**Process** - An isolated container with its own address space and resources, to run a set of instructions.
**Thread** - Independent execution path inside a process

- Has its own program counter, registers, and stack
- But shares the heap, globals, and open resources with other threads in the same process

> Operation from different thread can interleave (Both in multiprocessor/single processor system)

## Atomics

Thread safe operation on single variable without locks

```cs
using System.Threading;

int counter = 0;
Interlocked.Increment(ref counter);  // Thread-safe increment
```

## Locks (Mutexes)

Provides mutual exclusion. Only one thread can execute until lock is held

```cs
private readonly object _lock = new object();

lock (_lock)
{
    // Only one thread can be here at a time
    balance += amount;
}
```

## Semaphores

Counting locks, N permits.

```cs
using System.Threading;

var permits = new SemaphoreSlim(5);  // Allow 5 concurrent operations
await permits.WaitAsync();  // Block if no permits available
try
{
    DoWork();
}
finally
{
    permits.Release();  // Always release, even on exception
}
```

## Condition Variables

Thread wait efficiently for a condition to become true, release lock and sleeps otherwise.

```cs
using System.Threading;

private readonly object _lock = new object();

lock (_lock)
{
    while (!condition)
    {
        Monitor.Wait(_lock);  // Release lock and sleep
    }
    // Condition is now true
}
```

## Blocking Queues

Thread safe producer consumer handoff.

```cs
using System.Collections.Concurrent;

var queue = new BlockingCollection<Task>(boundedCapacity: 100);
queue.Add(task);     // Blocks if queue is full
var t = queue.Take();  // Blocks if queue is empty
```

---

## Problem Types

| Problem Type     | What Breaks                          | Solutions                            | Common Problems                                          |
| ---------------- | ------------------------------------ | ------------------------------------ | -------------------------------------------------------- |
| **Correctness**  | Shared state is updated concurrently | Locks, atomics, thread confinement   | Check-then-act, read-modify-write                        |
| **Coordination** | Threads need ordering or handoff     | Blocking queues, actors, event loops | Async request processing, bursty traffic                 |
| **Scarcity**     | Resources are limited                | Semaphores, resource pools           | Concurrent op limits, resource consumption, object reuse |

## Correctness

Prevent data corruption when multiple thread access shared state.

**Solutions:**

1. _Coarse-grained locking_ protects all related state with one lock
2. _Fine-grained locking_ allows concurrent access to independent resources while protecting related ones
3. _Atomic variables_ work for single variables but fail for multi-field invariants
4. _Thread confinement_ eliminates concurrency entirely for related data

### Coarse-grained locking [Default in Interviews]

Using one lock to block all operation. Creates a critical section where only one thread can execute at a time

- Both check and update should happen in this block
- Use same lock object for set of operations that needs to happen atomically
- CONS - Throughput becomes less as everything is blocked, even if non interfering

Example - Ticket Booking

```cs
using System.Collections.Generic;

public class TicketBooking
{
    private readonly object _bookingLock = new object();
    private Dictionary<string, string> _seatOwners = new Dictionary<string, string>();

    public bool BookSeat(string seatId, string visitorId)
    {
        lock (_bookingLock)
        {
            if (_seatOwners.ContainsKey(seatId))
            {
                return false;
            }
            _seatOwners[seatId] = visitorId;
            return true;
        }
    }
}
```

C# Lock automatically releases lock on block end / exception

**Read-Write Lock / Shared-exclusive lock**
For read heavy data store, like cache/config

- 2 Modes: Read / Shared and Write / Exclusive
- Multiple readers can hold read lock simultaneously
- For write, once all read lock releaseed then block and writes

```cs
using System.Collections.Generic;
using System.Threading;

public class Cache
{
    private readonly ReaderWriterLockSlim _rwLock = new();
    private readonly Dictionary<string, string> _data = new();

    public string Get(string key)
    {
        _rwLock.EnterReadLock();
        try
        {
            return _data.TryGetValue(key, out var value) ? value : null;
        }
        finally
        {
            _rwLock.ExitReadLock();
        }
    }

    public void Put(string key, string value)
    {
        _rwLock.EnterWriteLock();
        try
        {
            _data[key] = value;
        }
        finally
        {
            _rwLock.ExitWriteLock();
        }
    }
}
```

### Fine Grain Locking

Multiple locks, each lock protects smaller piece of data

- This method used for traffic at scale
- CONS - Causes complexities, deadlocks, Overhead of many locks

Example - Ticket Booking - Lock per seat

```cs
using System.Collections.Concurrent;

public class TicketBookingFineGrained
{
    private readonly ConcurrentDictionary<string, object> _seatLocks =
        new ConcurrentDictionary<string, object>();
    private readonly ConcurrentDictionary<string, string> _seatOwners =
        new ConcurrentDictionary<string, string>();

    private object GetLock(string seatId)
    {
        return _seatLocks.GetOrAdd(seatId, _ => new object());
    }

    public bool BookSeat(string seatId, string visitorId)
    {
        lock (GetLock(seatId))
        {
            if (_seatOwners.ContainsKey(seatId))
            {
                return false;
            }
            _seatOwners[seatId] = visitorId;
            return true;
        }
    }
}
```

### Atomic Values

Uses CPU instruction to read-modify-write variable in single uninterruptible step

- Works only for single variable
- like counters, flags, or statistics

```cs
using System.Threading;

public class BookingStats
{
    private int _bookedCount = 0;

    public void OnSeatBooked()
    {
        Interlocked.Increment(ref _bookedCount);
    }

    public int GetBookedCount()
    {
        return Interlocked.CompareExchange(ref _bookedCount, 0, 0);
    }
}
```

- C# : Decrement(), Add(), Exchange(), and CompareExchange()
- Works on int, long, reference type

**Complex Updates**

- CAS Loop used.
- Optimistically assume no one else will interfere, do your work, and only retry if that assumption was wrong

```cs
using System.Threading;

public class ConcurrencyTracker
{
    private int _maxConcurrent = 0;

    public void UpdateMaxConcurrent(int current)
    {
        int observed;
        do
        {
            observed = _maxConcurrent;
            if (current <= observed)
            {
                return;
            }
        } while (Interlocked.CompareExchange(ref _maxConcurrent, current, observed) != observed);
    }
}
```

- Interlocked.CompareExchange(ref location, newValue, expected) returns the original value.

### Thread confinement (Shared Nothing)

Partition the data so each thread owns its slice

- CONS - Load Imbalance, Cross Partition Data Query Issues

## Bugs Pattern

### Check-Then-Act

Check a value, Act on it : Another thread work updates the condition in between
SOLUTION - Make Check and Act Atomic - Coarse Grain Locking

Examples

- Checking connection pool
- Checking cache size
- File downloading
- Parking lot

### Read-Modify-Write

Read a value, Process, Write : Another thread modifies
SOLUTION - Atomic Variable for single variable, Lock for multiple

Example

- Hit counter
- Bank Account
- Metrics
- Inventory System

![alt text](image.png)

---

## Coordination
