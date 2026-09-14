const e=`---\r
title: Thread Safety in Design\r
description: How to spot shared mutable state in a class diagram, choose lock granularity, and defend a design when an interviewer asks if it is thread-safe\r
difficulty: Advanced\r
tags: [concurrency, thread-safety, locking, lld]\r
---\r
\r
Thread safety questions in LLD rounds are rarely "implement a mutex" — they're "look at this class diagram and tell me where it breaks under concurrent access." Every concurrency problem in a design round reduces to one of three shapes: state getting **corrupted** under concurrent access, work needing **coordination** between producers and consumers, or demand exceeding a **scarce** resource. This page covers all three, spending the most time on correctness since it's what interviewers probe deepest, using a booking system as the running example.\r
\r
## Three shapes of concurrency problems\r
\r
| Shape | What breaks | Default fix | Typical examples |\r
|---|---|---|---|\r
| Correctness | Shared state is read and written concurrently, corrupting an invariant | Lock the critical section, or make the state immutable | Seat booking, bank balances, inventory counts |\r
| Coordination | Threads need ordering, handoff, or to wait on each other | A bounded queue between producer and consumer | Background jobs, bursty request handling, async email/notifications |\r
| Scarcity | Demand exceeds a limited resource (connections, memory, external API quota) | A semaphore (permits) or a resource pool (reusable objects) | Connection pools, rate-limited API clients, worker capacity |\r
\r
> [!KEY]\r
> When an interviewer describes a system, classify the problem first: is state being corrupted, is work waiting on other work, or is a resource running out? That single question narrows the entire toolbox to one row of this table.\r
\r
## Shared mutable state is the root cause\r
\r
Every concurrency bug traces back to one thing: two or more threads reading and writing the **same mutable memory** without coordination. If data is either not shared (each thread has its own copy) or not mutable (it never changes after construction), there is no race to have.\r
\r
\`\`\`mermaid\r
sequenceDiagram\r
    participant T1 as "Thread A"\r
    participant T2 as "Thread B"\r
    participant S as "Shared seatOwners dict"\r
    T1->>S: Contains(seat101)? false\r
    T2->>S: Contains(seat101)? false\r
    Note over T1,T2: Both read "free" before either writes\r
    T1->>S: seatOwners[seat101] = Alice\r
    T2->>S: seatOwners[seat101] = Bob\r
    Note over S: Bob silently overwrites Alice — double booking, no error\r
\`\`\`\r
\r
This is the **check-then-act** race: check a condition, then act on it, with another thread's write landing in between. It is the single most common bug pattern in LLD concurrency questions — inventory checks, seat booking, connection pool limits, and balance checks all reduce to this shape.\r
\r
![alt text](notes/LLD/Concurrency/image.png)\r
\r
> [!KEY]\r
> Before an interviewer even asks, scan your own design for any method that reads shared state and then writes based on what it read. That gap between read and write is where every race lives.\r
\r
## Identifying critical sections in a design\r
\r
A critical section is the smallest span of code that must run as if no other thread exists, because it reads and writes an invariant that spans more than one memory location (e.g. "this seat is unbooked AND now belongs to Alice" — one check, one write, together).\r
\r
| Signal in a design | Likely critical section |\r
|---|---|\r
| \`if (available) { available = false; }\` | Classic check-then-act |\r
| A total/balance updated based on its own current value | Read-modify-write |\r
| Two related fields that must stay consistent (\`count\` and \`list.Count\`) | Multi-field invariant |\r
| A singleton's lazy-init \`if (instance == null) instance = new X();\` | Double-checked construction race |\r
| An external call inside a lock | Not itself a race, but a deadlock/throughput risk |\r
\r
## Immutability as the first answer\r
\r
Before reaching for a lock, ask whether the object needs to be mutable at all. An immutable object — all fields set at construction, never changed after — cannot participate in a race, because there's nothing to write.\r
\r
\`\`\`csharp\r
// Immutable: safe to share across threads with zero synchronisation\r
public sealed class Money\r
{\r
    public decimal Amount { get; }\r
    public string Currency { get; }\r
    public Money(decimal amount, string currency)\r
    {\r
        Amount = amount;\r
        Currency = currency;\r
    }\r
    public Money Add(Money other) => new(Amount + other.Amount, Currency); // returns new instance\r
}\r
\`\`\`\r
\r
> [!TIP]\r
> "Make it immutable" is the strongest possible answer to "is this thread-safe?" — it's not just synchronised, it has *no race to synchronise against*. Say this before reaching for \`lock\`; it signals you don't treat locking as the default tool.\r
\r
## Lock granularity\r
\r
\`\`\`mermaid\r
flowchart TD\r
    A["Can this state be immutable?"] -->|Yes| B["No lock needed"]\r
    A -->|No| C["Is it a single variable?"]\r
    C -->|Yes| D["Use an atomic operation"]\r
    C -->|No, spans multiple fields| E["Is contention expected to be low?"]\r
    E -->|Yes| F["Optimistic concurrency<br/>version check + retry"]\r
    E -->|No| G["Lock the critical section"]\r
    G --> H["One lock per related entity,<br/>not one global lock"]\r
\`\`\`\r
\r
| Granularity | What it protects | Throughput | Risk |\r
|---|---|---|---|\r
| Coarse (one global lock) | Everything behind a single \`lock\` object | Low under contention — only one thread proceeds at a time | Simple, obviously correct, easiest default |\r
| Per-entity (one lock per row/seat/account) | Each entity's own invariant | High — unrelated entities proceed concurrently | More locks to manage, must avoid inconsistent lock ordering |\r
| Striped (a fixed pool of N locks, hashed by key) | Groups of entities sharing a lock slot | Middle ground — bounded lock count | Two unrelated entities can still contend if they hash to the same stripe |\r
\r
\`\`\`csharp\r
// Coarse-grained: correct by default, but every booking blocks every other booking\r
private readonly object _lock = new();\r
public bool BookSeat(string seatId, string userId)\r
{\r
    lock (_lock)\r
    {\r
        if (_owners.ContainsKey(seatId)) return false;\r
        _owners[seatId] = userId;\r
        return true;\r
    }\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
// Per-entity: only bookings for the SAME seat contend with each other\r
private readonly ConcurrentDictionary<string, object> _seatLocks = new();\r
private object LockFor(string seatId) => _seatLocks.GetOrAdd(seatId, _ => new object());\r
\r
public bool BookSeat(string seatId, string userId)\r
{\r
    lock (LockFor(seatId))\r
    {\r
        if (_owners.ContainsKey(seatId)) return false;\r
        _owners[seatId] = userId;\r
        return true;\r
    }\r
}\r
\`\`\`\r
\r
Striped locking sits between the two: hash the key to one of \`N\` lock objects (\`locks[key.GetHashCode() % N]\`), bounding the number of lock objects you allocate while still letting unrelated keys proceed concurrently most of the time — useful when there could be millions of entities and per-entity locks would mean millions of lock objects.\r
\r
## Lock ordering to avoid deadlock\r
\r
Deadlock happens when two threads each hold a lock the other needs, and each waits forever. The classic case: transferring between two accounts, locking "from" then "to" — if thread A transfers X→Y while thread B transfers Y→X at the same time, A holds X waiting for Y while B holds Y waiting for X.\r
\r
\`\`\`csharp\r
// WRONG: lock order depends on argument order — can deadlock\r
public void Transfer(Account from, Account to, decimal amount)\r
{\r
    lock (from) { lock (to) { /* move money */ } }\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
// RIGHT: always lock in a fixed, global order (e.g. by account ID) regardless of argument order\r
public void Transfer(Account from, Account to, decimal amount)\r
{\r
    var (first, second) = from.Id.CompareTo(to.Id) < 0 ? (from, to) : (to, from);\r
    lock (first) { lock (second) { /* move money */ } }\r
}\r
\`\`\`\r
\r
> [!WARNING]\r
> "Always acquire locks in the same global order" is the single fix interviewers want to hear for deadlock. Locking by a stable, comparable key (ID, hash) rather than by argument position is what makes the order consistent across every call site.\r
\r
## Optimistic concurrency with version numbers\r
\r
Locking blocks other threads even when conflicts are rare. Optimistic concurrency instead lets everyone read and compute freely, and only checks for conflict at write time using a version number (or timestamp) — if the version changed since you read it, someone else won, and you retry.\r
\r
\`\`\`csharp\r
public class Inventory\r
{\r
    public int Stock { get; private set; }\r
    public int Version { get; private set; }\r
\r
    public bool TryReserve(int quantity, int expectedVersion)\r
    {\r
        if (Version != expectedVersion) return false; // someone else updated first — retry\r
        if (Stock < quantity) return false;\r
        Stock -= quantity;\r
        Version++;\r
        return true;\r
    }\r
}\r
\`\`\`\r
\r
This is the same idea as an EF Core \`[Timestamp]\`/\`RowVersion\` column causing \`DbUpdateConcurrencyException\` on a stale write, or a database \`WHERE version = @expectedVersion\` update that affects zero rows when the version moved. It trades a possible retry loop for much higher throughput when conflicts are rare — the opposite bet from locking, which pays a cost on every access to avoid a conflict that might never happen.\r
\r
## Atomic operations, thread-safe singletons and concurrent collections\r
\r
For a single counter or flag, a full lock is overkill — \`Interlocked.Increment\`, \`Interlocked.CompareExchange\` use CPU-level atomic instructions and are cheaper than a lock for single-variable read-modify-write.\r
\r
\`\`\`csharp\r
private int _activeBookings;\r
public void OnBooked() => Interlocked.Increment(ref _activeBookings); // no lock needed\r
\`\`\`\r
\r
Lazy singleton initialisation is a classic double-checked-locking interview question — the naive version is a check-then-act race on \`instance == null\`:\r
\r
\`\`\`csharp\r
// Thread-safe and lazy without manual double-checked locking\r
public sealed class ConfigService\r
{\r
    private static readonly Lazy<ConfigService> _instance = new(() => new ConfigService());\r
    public static ConfigService Instance => _instance.Value; // Lazy<T> handles the locking internally\r
    private ConfigService() { }\r
}\r
\`\`\`\r
\r
For collections shared across threads, reach for \`ConcurrentDictionary<TKey,TValue>\`, \`ConcurrentQueue<T>\`, \`BlockingCollection<T>\` instead of wrapping a plain \`Dictionary\`/\`List\` in your own lock — they use finer-grained internal synchronisation (or lock-free algorithms) and are both correct and usually faster than a hand-rolled coarse lock.\r
\r
## Worked problem: double booking in a booking system\r
\r
**The bug:** two users both call \`IsAvailable(seatId)\` (returns true for both), then both call \`Book(seatId)\` — both succeed, one seat, two owners.\r
\r
| Solution | How it works | Correctness | Throughput | Complexity |\r
|---|---|---|---|---|\r
| Coarse lock around check-and-book | One lock wraps the read and write together as one atomic operation | ✅ Always correct | Low — every booking anywhere serialises | Low |\r
| Per-seat lock | Lock only the specific seat being booked | ✅ Correct | High — unrelated seats book concurrently | Medium — must manage lock lifetime/cleanup |\r
| Optimistic concurrency (version check) | Read seat + version, write only \`if (version unchanged)\`, else retry | ✅ Correct, assuming retry loop | High when contention is low, degrades under hot contention (many retries on one seat) | Medium — needs a retry loop and idempotent retry logic |\r
\r
\`\`\`csharp\r
// Correct: check and act are inside the SAME lock, so no other thread can interleave\r
public bool Book(string seatId, string userId)\r
{\r
    lock (LockFor(seatId))\r
    {\r
        if (_owners.ContainsKey(seatId)) return false; // check\r
        _owners[seatId] = userId;                       // act\r
        return true;\r
    }\r
}\r
\`\`\`\r
\r
The senior answer names all three, then picks one with a reason: *"For a single popular event, seats contend heavily, so per-seat locking or optimistic concurrency both work well since contention is spread across many seats. If this were a single limited resource everyone wants — say, the last ticket — I'd expect high contention on one lock regardless of strategy, and I'd lean toward a coarse lock for simplicity since the fine-grained version buys little."*\r
\r
## Coordination: handoff, backpressure, and shutdown\r
\r
![alt text](notes/LLD/Concurrency/image-1.png)\r
\r
Coordination problems don't corrupt state — they show up as wasted CPU or unbounded memory growth because two sides of a workflow run at different speeds. A naive producer/consumer loop either busy-waits (burning CPU checking an empty queue) or sleep-polls (adding latency before work starts); the default fix is a **bounded queue** between them, letting a consumer block efficiently when idle and a producer feel backpressure when the consumer falls behind.\r
\r
\`\`\`mermaid\r
flowchart TD\r
    A["API request arrives"] --> B["Fast: persist + enqueue"]\r
    B --> C{"Queue has capacity?"}\r
    C -->|Yes| D["Return immediately"]\r
    C -->|No| E["Apply backpressure policy"]\r
    D --> F["Worker pool drains queue at its own pace"]\r
\`\`\`\r
\r
Bounding the queue is what forces a decision the moment the producer outruns the consumer, instead of deferring the crash to a later out-of-memory error. Three honest answers to "what happens when the queue is full":\r
\r
| Backpressure policy | Behaviour | Good for |\r
|---|---|---|\r
| Block the producer | Caller waits until space frees up | Internal pipelines where slowing the caller is safe |\r
| Timeout and reject | Caller gets a "try again" error after a short wait | User-facing APIs — a fast, honest failure beats an unbounded wait |\r
| Drop and log | Newest (or oldest) item is discarded, logged for visibility | Best-effort telemetry/metrics where losing a sample is acceptable |\r
\r
Shutting a worker down cleanly is the other coordination detail interviewers probe: a worker blocked in "take next item" needs a way to notice it should stop. The standard techniques: interrupt the blocked thread so it wakes and exits, poll with a timeout and check a shutdown flag between attempts, or submit a **poison pill** — a sentinel item the worker recognises as "no more work is coming."\r
\r
For many independent, stateful entities that occasionally message each other — a game server's players, a trading engine's order books, a chat system's rooms — a single shared queue starts to strain. The **actor model** is the design-level alternative: each entity owns a private mailbox and processes its own messages one at a time, so there's no shared state to protect — the per-actor queue replaces the lock. It's a bigger commitment than a shared blocking queue, so reach for it only when many independent entities message each other, not as the default for one producer/consumer pipeline.\r
\r
![alt text](notes/LLD/Concurrency/image-2.png)\r
\r
## Scarcity: bounding limited resources\r
\r
Scarcity problems are different again: nothing is corrupted, but demand for a limited resource — connections, memory, third-party API quota — exceeds supply. Two tools cover almost every case, and the choice comes down to whether the resource is stateless permission or a stateful object that must be reused.\r
\r
| Tool | Grants | Use when |\r
|---|---|---|\r
| Semaphore (N permits) | Permission to proceed — no object handed back | Limiting concurrent operations (at most 5 in-flight downloads) or bounding aggregate consumption (a 100 MB in-flight buffer budget) |\r
| Resource pool (bounded queue of real objects) | An actual reusable object (a connection, a buffer) | The resource is expensive to create and must be handed out, used, and returned |\r
\r
A pool built from a bounded queue has three practical wrinkles worth naming unprompted: pre-build every object upfront (simpler and the right interview default, even though lazy-init starts faster); validate on checkout, since a returned object might be broken; and acquire with a **timeout** rather than an unbounded wait, so one slow caller can't starve everyone else.\r
\r
\`\`\`csharp\r
public Connection Acquire(TimeSpan timeout)\r
{\r
    if (_pool.TryTake(out var conn, timeout)) return conn;\r
    throw new TimeoutException("No connection available within the deadline");\r
}\r
\`\`\`\r
\r
When the bottleneck is poor utilization rather than the limit itself — some tasks are fast, some slow, workers sit idle — three techniques help without raising the limit: work stealing (idle workers pull from a busy worker's queue), batching (trade latency for throughput on small operations), and adaptive sizing (grow/shrink capacity with measured demand instead of a fixed constant).\r
\r
![alt text](notes/LLD/Concurrency/image-3.png)\r
\r
## What to say when asked "is this thread-safe?"\r
\r
1. **Name the shared mutable state** — which fields, which objects, are touched by more than one thread.\r
2. **Name the invariant** that must hold across a read and a write (e.g. "a seat has at most one owner").\r
3. **Name the race shape** — check-then-act or read-modify-write.\r
4. **Propose the smallest fix that restores the invariant** — lock, atomic, or immutability — and say why you didn't pick a bigger hammer.\r
5. **Name the throughput trade-off** of your fix, unprompted.\r
\r
> [!DANGER]\r
> A common failure: locking only the *write*, not the *read-then-write* as one unit — \`if (!IsBooked(seatId)) { lock (l) { Book(seatId); } }\`. The check happens outside the lock, so two threads can both pass the check before either takes the lock. The check and the act must be inside the **same** critical section.\r
\r
## Cheat sheet\r
\r
- Classify first: correctness (state corruption), coordination (ordering/handoff), or scarcity (limited resource) — each has a different default fix.\r
- Every race reduces to shared **mutable** state — remove either the sharing or the mutability and the race disappears.\r
- Check-then-act and read-modify-write are the two race shapes that cover almost every LLD concurrency question; the check and the act must be inside the *same* critical section.\r
- Immutability beats locking: no shared writable state means nothing to synchronise.\r
- Coarse lock = correct by default, low throughput. Per-entity/striped lock = higher throughput, more to manage.\r
- Deadlock's fix is a fixed global lock-acquisition order, usually by a stable ID, not by argument position.\r
- Optimistic concurrency (version/timestamp check) trades occasional retries for much higher throughput under low contention.\r
- \`Interlocked\` for single variables, \`lock\`/\`ConcurrentDictionary\` for anything spanning more than one field; \`Lazy<T>\` for a correct lazy singleton.\r
- Coordination default: a bounded queue with an explicit backpressure policy (block, timeout-reject, drop-log) and shutdown mechanism (interrupt, poll timeout, poison pill).\r
- Scarcity default: a semaphore for stateless permits, a resource pool when the scarce thing is a reusable object.\r
- Always name the throughput trade-off of your fix — "correct but serialises everything" is an honest, useful answer.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Locking the write but checking outside the lock | Put the check and the act inside the same critical section |\r
| Reaching for a lock before considering immutability | Ask "does this need to be mutable at all?" first |\r
| Locking \`from\` then \`to\` in argument order for a transfer | Lock in a fixed order derived from a stable key (ID), not argument position |\r
| Treating \`Dictionary<K,V>\` as thread-safe because "it's just reads" | Any concurrent write (or write during enumeration) is unsafe; use \`ConcurrentDictionary\` |\r
| Hand-rolling double-checked locking for a singleton | Use \`Lazy<T>\` — it already does this correctly |\r
| Assuming optimistic concurrency has no downside | Under high contention on one row, it can retry far more than a lock would block |\r
| Saying "we'd add some locks" with no specifics | Name the exact shared field, the race shape, and the lock's scope |\r
| Using an unbounded queue between producer and consumer, or leaving a worker with no shutdown path | Bound the queue and pick a backpressure policy; support interruption, a polling timeout, or a poison pill for shutdown |\r
\r
## Summary\r
\r
Thread safety in a design starts with classifying the problem — correctness, coordination, or scarcity — then finding the exact shared mutable state, invariant, or bottleneck before an interviewer does, and picking a fix whose trade-off you can defend. For correctness: immutability first, then lock granularity, atomics, or optimistic concurrency under low contention — double-booking is the canonical worked example. For coordination: a bounded queue with an explicit backpressure and shutdown policy, or the actor model for many independent entities. For scarcity: a semaphore for permits, or a resource pool for objects that must be reused. When asked "is this thread-safe", answer in the shape: state, invariant, race, fix, trade-off.\r
\r
## Top Interview Questions\r
\r
### Q1. What is the root cause of almost every concurrency bug, and how do you spot it in a design before writing code?\r
\r
Almost every concurrency bug traces back to **shared mutable state** — two or more threads reading and writing the same memory without coordination. You spot it in a design by scanning for fields that more than one thread can reach (instance fields on a singleton or a long-lived service, static fields, anything passed to multiple worker threads) and asking whether any method reads that state and then writes based on what it read. If either the sharing or the mutability is removed — the data is thread-local, or it's immutable after construction — there's no race possible, regardless of how many threads touch it. This is why "make it immutable" is often a stronger answer than "add a lock."\r
\r
### Q2. Explain the check-then-act race with a concrete example, and how you fix it.\r
\r
Check-then-act is when a thread reads a condition (check) and then performs an action based on that read (act), with a gap in between where another thread can interleave. Classic example: \`if (!seatOwners.ContainsKey(seatId)) { seatOwners[seatId] = userId; }\` — two threads can both evaluate the \`if\` as true (seat looks free to both) before either writes, so both proceed to "book" the same seat. The fix is to make the check and the act a single atomic/critical section: wrap both inside the same \`lock\`, so no other thread can observe the "free" state between your check and your write. A common mistake is locking only the write and leaving the check outside the lock, which doesn't fix anything.\r
\r
### Q3. What's the difference between check-then-act and read-modify-write races?\r
\r
Check-then-act reads a *boolean condition* and acts on it (is this seat free? is this connection pool below its limit?) — the bug is two threads seeing the same "yes" before either commits. Read-modify-write reads a *value*, computes a new value from it, and writes it back (a balance, a counter, a running total) — the bug is two threads both reading the same old value, so one thread's update is silently lost when the second write overwrites the first. Both are races caused by a gap between reading shared state and writing based on it; check-then-act is fixed the same way as read-modify-write for multi-field cases (lock the whole read+write), but single-variable read-modify-write can often be fixed more cheaply with an atomic operation like \`Interlocked.Increment\`.\r
\r
### Q4. When would you choose immutability over locking, and when does it stop being enough on its own?\r
\r
Choose immutability whenever an object's fields are fully known at construction and never need to change afterward — value objects like \`Money\`, \`TimeSlot\`, or a configuration snapshot are ideal candidates, and making them immutable means they can be shared across any number of threads with zero synchronisation, no lock, no atomic, nothing. It stops being sufficient on its own when the *system* still needs to track something that changes over time — a seat's occupied/free status, an account balance — because that changing state has to live somewhere mutable. The usual pattern is: keep as much as possible immutable (the \`Seat\` ID, the \`Money\` amount type), and isolate the genuinely mutable, shared parts (an \`occupied\` flag, a \`balance\`) behind a lock, atomic, or optimistic-concurrency check.\r
\r
### Q5. What's the trade-off between coarse-grained and fine-grained (per-entity) locking?\r
\r
A coarse-grained lock — one lock object guarding an entire data structure or subsystem — is trivially easy to reason about and prove correct, but it serialises *all* operations through one gate, even ones touching completely unrelated entities, which kills throughput under load. A fine-grained, per-entity lock (one lock per seat, per account, per row) lets unrelated entities proceed fully concurrently, dramatically improving throughput, but introduces real complexity: you now have to manage potentially many lock objects, decide when to create/dispose them, and — critically — avoid acquiring multiple locks in an order that can deadlock. The senior answer names both and picks based on expected contention: low contention or a simple system → coarse lock is fine; high concurrent traffic on independent entities → fine-grained pays for its complexity.\r
\r
### Q6. How does deadlock happen with per-entity locking, and what's the standard fix?\r
\r
Deadlock happens when two threads each hold a lock the other is waiting for, so neither can proceed. The classic case is a funds transfer: thread A calls \`Transfer(accountX, accountY)\` and locks X then waits for Y, while thread B simultaneously calls \`Transfer(accountY, accountX)\` and locks Y then waits for X — each holds what the other needs. The standard fix is a **consistent global lock ordering**: always acquire locks in the same order regardless of the order they're passed in, typically by sorting on a stable, comparable key like account ID (\`lock the lower ID first\`). As long as every code path acquiring more than one lock follows the same ordering rule, a circular wait — the necessary condition for deadlock — cannot form.\r
\r
### Q7. What is optimistic concurrency control, and when is it preferable to locking?\r
\r
Optimistic concurrency assumes conflicts are rare: instead of taking a lock before reading, you read the data along with a version number (or timestamp), do your work without holding any lock, and only check at write time whether the version is still what you expected. If it changed, someone else wrote first, so you discard your work and retry (or fail back to the caller). It's preferable to locking when contention is genuinely low — most reads never actually collide with a concurrent write — because it avoids paying the cost of locking on every single access. It gets worse than locking when contention is high on the same row, since many threads will retry repeatedly instead of simply queuing behind a lock; in that case a lock (or per-entity lock) is usually the better bet.\r
\r
### Q8. Walk through the double-booking problem in a seat reservation system and the trade-offs of your fix.\r
\r
The bug: \`IsAvailable(seatId)\` returns true for two concurrent callers before either has booked, so both proceed to \`Book(seatId)\` and both "succeed" — one seat, two owners, and no exception raised to reveal the problem. The minimal correct fix is a lock scoped around both the availability check and the booking write together, so they execute as one atomic unit — a coarse lock (one lock for the whole booking system) is trivially correct but serialises every booking anywhere; a per-seat lock lets unrelated seats book fully concurrently at the cost of managing a lock per seat ID; an optimistic version check on the seat avoids locking entirely but requires a retry loop and behaves worse if one specific seat is extremely popular. I'd pick per-seat locking or optimistic concurrency for a large multi-event system with spread-out contention, and a coarse lock for a small system where simplicity matters more than raw throughput.\r
\r
### Q9. Why is naive double-checked locking for a singleton broken in some languages, and how do you avoid the problem in C#?\r
\r
The naive pattern — \`if (instance == null) { lock (l) { if (instance == null) instance = new X(); } }\` — exists to avoid taking a lock on every access after the singleton is created, but on some platforms/memory models a thread can observe a **partially constructed** object: the reference gets assigned before the constructor has fully initialised all fields, due to instruction reordering, so a second thread reading \`instance\` outside the lock can see a non-null but not-fully-built object. In C#, you sidestep having to reason about this entirely by using \`Lazy<T>\`, which handles the necessary memory barriers and locking internally and guarantees the value is only constructed once, fully, before any caller observes it — \`private static readonly Lazy<T> _instance = new(() => new T());\`.\r
\r
### Q10. In production, you notice occasional lost updates to a shared in-memory counter under load, but no exceptions are thrown. How would you diagnose and fix this?\r
\r
Silent lost updates with no exception is the signature of a read-modify-write race: two threads read the same counter value, each computes \`value + 1\` independently, and the second write simply overwrites the first, discarding one increment — nothing throws because both writes are individually valid, just wrong given what actually happened concurrently. I'd confirm this by checking whether the counter is a plain \`int++\`/\`counter = counter + 1\` on a field touched from multiple threads (a request-handling method, a background job) rather than behind synchronisation. The fix is either \`Interlocked.Increment(ref counter)\` for a bare counter, or a lock around the read-modify-write if the update also depends on other shared fields that need to stay consistent together — I'd add a load test afterward that hammers the counter concurrently and asserts the final count matches the number of increments issued, to prove the fix actually holds under contention.\r
\r
### Q11. Are \`ConcurrentDictionary\` and similar concurrent collections a complete answer to thread safety, or do they have limits?\r
\r
They solve thread safety for **individual operations** on the collection itself — a concurrent \`Add\`, \`TryGetValue\`, or \`TryRemove\` call won't corrupt the dictionary's internal structure, and you don't need your own lock just to use it safely. They do **not** make multi-step operations atomic: \`if (!dict.ContainsKey(key)) dict[key] = value;\` is still a check-then-act race even on a \`ConcurrentDictionary\`, because the check and the write are two separate calls. For that, you use the collection's own compound methods — \`GetOrAdd\`, \`AddOrUpdate\`, \`TryUpdate\` with an expected-value comparison — which perform the check-and-act atomically inside the collection's own implementation. The lesson: concurrent collections protect their own internal state, not the business invariant you're trying to enforce across multiple calls.\r
\r
### Q12. An interviewer asks "is this thread-safe?" about a class you just designed. What's the structure of a strong answer?\r
\r
I answer in five parts, explicitly: first, name exactly which fields are shared mutable state and which threads could touch them concurrently; second, name the invariant that must hold across a read and a write together (e.g. "at most one owner per seat"); third, name the race shape — check-then-act or read-modify-write; fourth, propose the smallest fix that restores the invariant, defaulting to immutability, then a lock scoped around the whole check-and-act, or an atomic for a single variable; and fifth, state the throughput trade-off of that fix without being asked, and whether a cheaper or more scalable alternative exists if contention turns out to be higher or lower than expected. That structure shows I'm reasoning from the actual state and invariant, not reciting "add a lock" as a reflex.\r
\r
### Q13. A producer is adding work faster than a consumer can process it. What are your options, and how do you pick one?\r
\r
The first decision is whether the queue between them is bounded — an unbounded queue just postpones the failure to an eventual out-of-memory crash once the producer has outrun the consumer for long enough, so a bounded queue is the non-negotiable first step. Once it's bounded, you need an explicit policy for what happens when it's full: block the producer (fine for internal pipelines where a slower caller is acceptable), time out and reject with a "try again" error (the right default for user-facing APIs, since a fast honest failure beats an unbounded wait), or drop the newest/oldest item and log it (acceptable for best-effort telemetry where losing a sample doesn't matter). I'd pick based on who's calling and what a stall costs them — a checkout API should reject fast, a metrics pipeline can drop samples.\r
\r
### Q14. What's the difference between using a semaphore and using a resource pool to handle a scarce resource, and when would you pick each?\r
\r
A semaphore hands out **permission**, not an object — it's a counter of permits that lets you cap how many operations run concurrently (at most 5 simultaneous downloads) or how much of a budget is consumed at once (a 100 MB in-flight buffer, acquiring a variable number of permits per request), but the caller still creates or owns whatever it's doing with that permission. A resource pool hands out the **actual object** — a real database connection, a real buffer — because the object itself is expensive to construct and needs to be reused rather than recreated on every call; the pool is typically backed by a bounded queue of pre-built objects, acquired with a timeout and returned when done. Use a semaphore when the scarcity is about a *count* or *budget*; use a pool when the scarcity is about a *specific expensive-to-create object* that must be handed back for someone else to reuse.\r
`;export{e as default};
