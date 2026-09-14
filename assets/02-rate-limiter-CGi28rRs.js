const e=`---\r
title: Design a Rate Limiter Class\r
description: Design an in-process rate limiter as a Strategy over token bucket, leaky bucket, fixed window and sliding window algorithms with thread safety\r
difficulty: Core\r
tags: [rate-limiting, concurrency, system-design, strategy-pattern]\r
---\r
\r
A rate limiter question is really two questions in one interview: can you name and implement the classic throttling algorithms, and can you design a class around them that stays clean when a sixth algorithm shows up next sprint.\r
\r
## Requirements\r
\r
### Functional\r
\r
- \`TryAcquire(key)\` returns whether a request for \`key\` (e.g. a client ID or API key) is allowed right now.\r
- Support at least token bucket, leaky bucket, fixed window and sliding window algorithms, selectable per endpoint.\r
- Return enough information to build a \`429\` response: allowed/denied, remaining quota, and a retry-after hint.\r
- Each key (client, endpoint, or client+endpoint pair) is limited independently.\r
- Configuration (which algorithm and its parameters, per endpoint) is loaded once at startup; an endpoint with no explicit entry falls back to a default limiter rather than being rejected outright.\r
\r
### Non-functional and assumptions\r
\r
- Single process, in-memory state, loaded from configuration at startup — no external coordination service in the base design.\r
- Must be thread-safe: many request-handling threads call \`TryAcquire\` concurrently.\r
- Memory must not grow unbounded as new client keys appear; idle keys need to be reclaimed.\r
- Must be testable without real wall-clock sleeps, which means the clock is a dependency, not a static call.\r
\r
### Clarifying questions to ask\r
\r
> [!TIP]\r
> A senior answer starts here, not with code: rate limiting has at least four well-known algorithms with different trade-offs, and picking one before understanding the burst tolerance requirement is a mistake worth avoiding out loud.\r
\r
- Is bursty traffic acceptable (token bucket) or must the rate be perfectly smooth (leaky bucket)?\r
- Is the limit per client, per endpoint, or the combination of both?\r
- What should happen for a key with no explicit configuration — reject, or fall back to a default?\r
- Is this single-process, or does it eventually need to hold across a fleet of servers?\r
- Is exact precision required, or is "approximately N per second" acceptable in exchange for O(1) memory (fixed window vs sliding log)?\r
\r
## Core objects\r
\r
| Class | Responsibility | Key fields/methods |\r
|---|---|---|\r
| \`IRateLimiter\` | Strategy contract every algorithm implements | \`TryAcquire(key) -> RateLimitResult\` |\r
| \`RateLimitResult\` | Structured outcome for the caller | \`Allowed\`, \`Remaining\`, \`RetryAfter\` |\r
| \`TokenBucketLimiter\` | Allows bursts up to capacity, refills over time | \`_buckets\`, \`capacity\`, \`refillPerSecond\` |\r
| \`SlidingWindowLogLimiter\` | Exact count of requests in the trailing window | \`_logs\`, \`maxRequests\`, \`windowSize\` |\r
| \`FixedWindowLimiter\` | Cheapest approximation, resets on window boundary | \`_counters\`, \`windowStart\` |\r
| \`LeakyBucketLimiter\` | Smooths bursts into a constant output rate | \`_queues\`, \`leakRatePerSecond\` |\r
| \`IClock\` | Injectable time source | \`UtcNow\` |\r
| \`RateLimiterFactory\` | Builds a limiter from configuration | \`Create(config) -> IRateLimiter\` |\r
| \`IdleKeyReaper\` | Background sweep evicting stale per-key state | \`Sweep()\`, \`idleThreshold\` |\r
\r
Deriving these responsibilities directly from the requirements is a useful habit to narrate out loud in an interview — each functional requirement maps to something a concrete class must own:\r
\r
![alt text](notes/LLD/Problems/RateLimitter/image.png)\r
\r
![alt text](notes/LLD/Problems/RateLimitter/image-1.png)\r
\r
## Class design\r
\r
\`\`\`mermaid\r
classDiagram\r
    class IRateLimiter {\r
        <<interface>>\r
        +TryAcquire(key) RateLimitResult\r
    }\r
    class RateLimitResult {\r
        +bool Allowed\r
        +int Remaining\r
        +TimeSpan? RetryAfter\r
    }\r
    class TokenBucketLimiter {\r
        -ConcurrentDictionary buckets\r
        -int capacity\r
        -double refillPerSecond\r
        -IClock clock\r
        +TryAcquire(key) RateLimitResult\r
    }\r
    class SlidingWindowLogLimiter {\r
        -ConcurrentDictionary logs\r
        -int maxRequests\r
        -TimeSpan window\r
        -IClock clock\r
        +TryAcquire(key) RateLimitResult\r
    }\r
    class IClock {\r
        <<interface>>\r
        +UtcNow DateTime\r
    }\r
    class RateLimiterFactory {\r
        +Create(config) IRateLimiter\r
    }\r
    IRateLimiter <|.. TokenBucketLimiter\r
    IRateLimiter <|.. SlidingWindowLogLimiter\r
    IRateLimiter <|.. FixedWindowLimiter\r
    IRateLimiter <|.. LeakyBucketLimiter\r
    TokenBucketLimiter --> IClock\r
    SlidingWindowLogLimiter --> IClock\r
    RateLimiterFactory ..> IRateLimiter : creates\r
\`\`\`\r
\r
## Key design decisions\r
\r
### Strategy pattern over the four algorithms, not a switch statement\r
\r
\`IRateLimiter\` is the single method every algorithm implements, and \`RateLimiterFactory\` picks a concrete class from configuration. The rejected alternative is one \`RateLimiter\` class with an \`algorithm\` enum and branching inside \`TryAcquire\` — every new algorithm would touch a shared method, and unit-testing one algorithm in isolation becomes harder because its state is tangled with the others'.\r
\r
| Approach | New algorithm cost | Testability | Chosen |\r
|---|---|---|---|\r
| Strategy + Factory | Add one class, one factory branch | Each algorithm tested alone | ✅ |\r
| Single class with enum + branches | Edit a shared method, risk regressions | Must exercise the whole class | ❌ |\r
\r
### Injected clock instead of \`DateTime.UtcNow\` calls scattered in the algorithm\r
\r
Every limiter takes an \`IClock\` in its constructor. The rejected alternative — calling \`DateTime.UtcNow\` directly — makes token-refill and window-expiry logic untestable without real sleeps; a test verifying "10 tokens refill after 1 second" would need an actual second to elapse or become flaky.\r
\r
### Per-key locks instead of one global lock across all clients\r
\r
Token and window state lives in a \`ConcurrentDictionary<string, TState>\`, and the read-modify-write inside each bucket is protected by locking the bucket object itself, not a shared lock. The rejected alternative — a single \`lock\` around all of \`TryAcquire\` — serialises every client through one mutex, defeating the purpose of an API gateway meant to handle thousands of concurrent clients.\r
\r
### Background reaper instead of per-request cleanup\r
\r
An \`IdleKeyReaper\` runs on a timer and removes entries whose \`lastSeen\` exceeds an idle threshold. The rejected alternative — checking for staleness inline on every \`TryAcquire\` — adds a branch to the hot path for a concern (memory growth) that only matters occasionally; a periodic sweep keeps the hot path lean.\r
\r
## Implementation\r
\r
\`\`\`csharp\r
public interface IRateLimiter\r
{\r
    RateLimitResult TryAcquire(string key);\r
}\r
\r
public record RateLimitResult(bool Allowed, int Remaining, TimeSpan? RetryAfter);\r
\r
public interface IClock { DateTime UtcNow { get; } }\r
\r
public class SystemClock : IClock { public DateTime UtcNow => DateTime.UtcNow; }\r
\r
public class TokenBucketLimiter : IRateLimiter\r
{\r
    private class Bucket { public double Tokens; public DateTime LastRefill; }\r
\r
    private readonly int _capacity;\r
    private readonly double _refillPerSecond;\r
    private readonly IClock _clock;\r
    private readonly ConcurrentDictionary<string, Bucket> _buckets = new();\r
\r
    public TokenBucketLimiter(int capacity, double refillPerSecond, IClock clock)\r
    {\r
        _capacity = capacity; _refillPerSecond = refillPerSecond; _clock = clock;\r
    }\r
\r
    public RateLimitResult TryAcquire(string key)\r
    {\r
        var bucket = _buckets.GetOrAdd(key, _ => new Bucket { Tokens = _capacity, LastRefill = _clock.UtcNow });\r
\r
        lock (bucket)\r
        {\r
            var now = _clock.UtcNow;\r
            var elapsed = (now - bucket.LastRefill).TotalSeconds;\r
            bucket.Tokens = Math.Min(_capacity, bucket.Tokens + elapsed * _refillPerSecond);\r
            bucket.LastRefill = now;\r
\r
            if (bucket.Tokens >= 1)\r
            {\r
                bucket.Tokens -= 1;\r
                return new RateLimitResult(true, (int)bucket.Tokens, null);\r
            }\r
\r
            var retryAfter = TimeSpan.FromSeconds((1 - bucket.Tokens) / _refillPerSecond);\r
            return new RateLimitResult(false, 0, retryAfter);\r
        }\r
    }\r
}\r
\r
public class SlidingWindowLogLimiter : IRateLimiter\r
{\r
    private readonly int _maxRequests;\r
    private readonly TimeSpan _window;\r
    private readonly IClock _clock;\r
    private readonly ConcurrentDictionary<string, Queue<DateTime>> _logs = new();\r
\r
    public SlidingWindowLogLimiter(int maxRequests, TimeSpan window, IClock clock)\r
    {\r
        _maxRequests = maxRequests; _window = window; _clock = clock;\r
    }\r
\r
    public RateLimitResult TryAcquire(string key)\r
    {\r
        var log = _logs.GetOrAdd(key, _ => new Queue<DateTime>());\r
\r
        lock (log)\r
        {\r
            var now = _clock.UtcNow;\r
            var cutoff = now - _window;\r
            while (log.Count > 0 && log.Peek() < cutoff) log.Dequeue();\r
\r
            if (log.Count < _maxRequests)\r
            {\r
                log.Enqueue(now);\r
                return new RateLimitResult(true, _maxRequests - log.Count, null);\r
            }\r
\r
            return new RateLimitResult(false, 0, log.Peek() + _window - now);\r
        }\r
    }\r
}\r
\`\`\`\r
\r
Fixed window is the same shape as the sliding log but stores only a counter plus a window-start timestamp — O(1) memory per key instead of O(requests-in-window), at the cost of allowing up to 2x the limit across a window boundary. Leaky bucket stores a queue (or a virtual "water level" double, refilled negatively at a fixed leak rate) and rejects new requests when the queue is full, producing a perfectly smooth output rate rather than token bucket's bursty one.\r
\r
![alt text](notes/LLD/Problems/RateLimitter/image-2.png)\r
\r
## Concurrency and thread safety\r
\r
> [!WARNING]\r
> \`ConcurrentDictionary.GetOrAdd\` guarantees the dictionary itself is not corrupted, but it does **not** make the read-modify-write inside the bucket atomic. Two threads can both read the same \`Tokens\` value before either writes it back, double-spending a token. The lock must wrap the refill-and-decrement sequence, not just the dictionary lookup.\r
\r
Two viable locking strategies, in order of preference for this problem:\r
\r
| Strategy | Mechanism | Trade-off |\r
|---|---|---|\r
| Lock per key (chosen) | \`lock (bucket)\` around refill + decrement | Only contention between requests for the *same* key |\r
| \`Interlocked\` on a packed value | Pack tokens + timestamp into a single \`long\`, CAS-loop to update | Lock-free, faster under extreme contention, harder to get right and to extend |\r
| Single global lock | One \`lock\` around all of \`TryAcquire\` | Simple, but serialises unrelated clients — avoid at gateway scale |\r
\r
A \`ConcurrentDictionary<string, Bucket>\` combined with locking each \`Bucket\` object individually gives the best balance: uncontended dictionary reads, and lock scope limited to one client's state, so client A never waits on client B.\r
\r
## Extending the design\r
\r
| New requirement | Where it plugs in | Why the design allows it |\r
|---|---|---|\r
| A fifth algorithm (e.g. GCRA) | New class implementing \`IRateLimiter\`, one branch in \`RateLimiterFactory\` | Strategy interface is the only contract callers depend on |\r
| Composite limits (per-client **and** per-endpoint) | Wrap two \`IRateLimiter\`s in a \`CompositeLimiter\` that requires both to allow | \`IRateLimiter\` composes naturally since it takes only a key and returns a result |\r
| Distributed rate limiting across servers | Swap the in-memory \`ConcurrentDictionary\` for a Redis-backed store using \`INCR\`/Lua scripts for atomicity | The algorithm math (refill, window math) is identical; only where the counter lives changes |\r
| Dynamic configuration reload | \`RateLimiterFactory\` rebuilds limiters and the orchestrator swaps a reference atomically | Immutable snapshot swap needs no lock on the read path |\r
| Per-tier limits (free vs paid) | Route the key as \`$"{tier}:{clientId}"\` before calling \`TryAcquire\` | Key composition is external to the limiter; no algorithm change needed |\r
\r
> [!NOTE]\r
> The distributed extension is the most commonly asked follow-up. The honest answer is that token bucket and sliding window log both translate to Redis directly — a Lua script does the refill-and-decrement (or log-trim-and-count) atomically server-side, which is exactly the same critical section as the in-process lock, just moved into the data store.\r
\r
## Cheat sheet\r
\r
- \`IRateLimiter.TryAcquire(key)\` is the entire public contract — everything else is an implementation detail behind it.\r
- Token bucket allows bursts up to capacity; leaky bucket smooths to a constant rate; fixed window is cheap but allows edge bursts; sliding window log is exact but O(requests) memory per key.\r
- Inject \`IClock\` — never call \`DateTime.UtcNow\` inside limiter logic directly, or you cannot unit test refill timing.\r
- Lock scope must cover the refill/decrement together, not just the dictionary lookup — \`ConcurrentDictionary\` alone is not enough.\r
- Reap idle keys on a background timer, not inline on every request.\r
- Distributed rate limiting is the same math with the counter moved to Redis via an atomic Lua script.\r
- State which algorithm you'd default to and why: token bucket is the most common real-world default because APIs want to tolerate bursts.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Branching on algorithm inside one big class | Extract each algorithm behind \`IRateLimiter\`, use a factory |\r
| Calling \`DateTime.UtcNow\` directly in limiter code | Inject \`IClock\` so tests control time deterministically |\r
| Locking only the dictionary access, not the bucket update | Lock (or CAS) the whole refill-and-decrement sequence |\r
| Never evicting per-key state | Add a background reaper keyed on last-seen time |\r
| Assuming fixed window is "good enough" without saying why | Name the edge-burst weakness (2x limit at window boundary) explicitly |\r
| Forgetting to return \`RetryAfter\` | Callers need it to set the \`Retry-After\` HTTP header |\r
\r
## Summary\r
\r
A rate limiter is best modelled as a Strategy: one \`IRateLimiter\` interface, four interchangeable algorithms with different burst/smoothness/memory trade-offs, and a factory that builds the right one from configuration. The engineering rigor is in the details — an injected clock for testability, lock scope that covers the full read-modify-write, and a background reaper so idle clients do not leak memory forever. The distributed extension reuses the exact same algorithm logic, moved behind an atomic Redis script instead of an in-process lock.\r
\r
## Top Interview Questions\r
\r
### Q1. Compare token bucket, leaky bucket, fixed window and sliding window log.\r
\r
Token bucket refills tokens at a fixed rate up to a capacity and allows bursts up to that capacity — good when occasional spikes are fine as long as the average rate holds. Leaky bucket processes requests (or "drips") at a strictly constant rate regardless of how bursty the input is, smoothing traffic at the cost of adding latency to bursts. Fixed window counts requests in discrete time buckets (e.g. per-minute) — O(1) memory, but a client can send 2x the limit by timing requests around a window boundary. Sliding window log keeps an exact timestamp per request in the trailing window — perfectly precise, but memory grows with request volume within the window. Sliding window *counter* (a weighted average of the current and previous fixed window) is the practical middle ground used by most production gateways.\r
\r
### Q2. Why is a lock around only \`ConcurrentDictionary.GetOrAdd\` not sufficient for thread safety?\r
\r
\`GetOrAdd\` guarantees the dictionary's internal structure is not corrupted and that only one bucket object is created per key, but it says nothing about what happens after you get the bucket back. Refilling tokens and decrementing by one is a read-modify-write on the bucket's fields; if two threads both read \`Tokens = 1.0\` before either writes back \`Tokens = 0.0\`, both will believe they successfully acquired a token, oversubscribing the limit. The lock (or an \`Interlocked\`/CAS loop) must wrap the entire refill-then-decrement sequence, using the bucket object itself as the lock target so unrelated keys are never contended.\r
\r
### Q3. Why inject an \`IClock\` instead of calling \`DateTime.UtcNow\` directly?\r
\r
Token refill and window expiry are entirely time-driven, so tests need to simulate "1 second passed" without an actual \`Thread.Sleep(1000)\`, which would make the suite slow and occasionally flaky under CI load. Injecting \`IClock\` lets a test use a \`FakeClock\` whose \`UtcNow\` is advanced manually, making refill and expiry assertions instant and deterministic. This is a general pattern for any time-dependent logic, not specific to rate limiting — it is the same reason schedulers and caches with TTL also take a clock dependency.\r
\r
### Q4. How would you extend this design to limit per client AND per endpoint simultaneously?\r
\r
Compose two independent \`IRateLimiter\` instances — one keyed by \`clientId\`, one keyed by \`endpoint\` — inside a \`CompositeLimiter\` that calls \`TryAcquire\` on both and only allows the request if both return allowed. If either denies, return the more restrictive \`RetryAfter\`. This works because \`IRateLimiter\` only depends on an opaque string key, so "what the key represents" (client, endpoint, or a compound key like \`client:endpoint\`) is a decision made by the caller, not the algorithm.\r
\r
### Q5. How would you extend a single-process rate limiter to work across a fleet of API gateway instances?\r
\r
Move the shared counter state out of process, typically to Redis, and make the refill-and-decrement (or window-trim-and-count) an atomic Lua script executed server-side — this preserves the same critical section semantics as the in-process lock but makes it visible to every gateway instance. The algorithm's math does not change at all; only where the mutable state lives does. The trade-off is added latency per check (a network round trip instead of an in-memory lock) and a new failure mode: what to do if Redis is briefly unreachable (fail-open vs fail-closed is a decision to state explicitly).\r
\r
### Q6. A client complains their requests are throttled even though they are "well under the limit" — how do you debug it?\r
\r
First check which algorithm is in play: fixed window can throttle a client that sent, say, 60 requests just before a minute boundary and another 60 just after — 120 requests in a rolling minute, but each half-window individually under a 100/minute cap, yet the *client* perceives being throttled unfairly at the boundary. Second, check for key collisions — if the limiter keys by IP behind a shared NAT or load balancer, multiple distinct clients can be sharing one bucket. Third, verify the clock source and refill math with a unit test using a fake clock to rule out a refill-rate miscalculation.\r
\r
### Q7. Why prefer per-key locking over a single global lock, and when would a global lock actually be fine?\r
\r
Per-key locking means client A's request never waits on client B's lock, which matters at gateway scale where thousands of distinct clients are calling concurrently — a global lock would serialise all of them through one critical section regardless of how unrelated their keys are. A global lock is acceptable only when the total request volume is low enough that lock contention is not actually a bottleneck, or during an early prototype where correctness and simplicity matter more than throughput; it should be treated as a stepping stone, not the final design.\r
\r
### Q8. How do you prevent unbounded memory growth from tracking every client that has ever made a request?\r
\r
Run a background reaper on a timer (e.g. every minute) that walks the per-key state store and removes entries whose "last seen" timestamp is older than an idle threshold (say, 10x the window size). This is deliberately kept off the hot request path — checking staleness inline on every \`TryAcquire\` would add a branch and a clock read to every single request for a concern that only matters periodically. An alternative for very high cardinality keys is an LRU-bounded map that caps the number of tracked keys outright and evicts the coldest.\r
\r
### Q9. What should \`TryAcquire\` return, and why not just a boolean?\r
\r
A boolean tells the caller whether to proceed, but a production HTTP layer also needs to build a proper \`429 Too Many Requests\` response: how many requests remain in the current window (for a \`X-RateLimit-Remaining\` header) and how long to wait before retrying (for \`Retry-After\`). Returning a structured \`RateLimitResult\` with \`Allowed\`, \`Remaining\`, and \`RetryAfter\` lets the calling layer construct a helpful response without the limiter needing to know anything about HTTP.\r
\r
### Q10. How would you unit test the token bucket limiter's refill behaviour without flaky timing?\r
\r
Inject a \`FakeClock\` that starts at a fixed \`UtcNow\` and exposes an \`Advance(TimeSpan)\` method. Construct the limiter with capacity 10 and a refill rate of 5/second, consume all 10 tokens, assert the 11th call is denied, then call \`clock.Advance(TimeSpan.FromSeconds(1))\` and assert exactly 5 more tokens are now available. Because the limiter never calls \`DateTime.UtcNow\` directly, the entire test runs in microseconds with no real waiting and no flakiness from scheduler jitter.\r
\r
### Q11. What is the "thundering herd at the window boundary" problem in fixed window limiters, and how does sliding window counter fix it?\r
\r
In a fixed window, all counters reset simultaneously at the boundary (e.g. the top of every minute), so if a limiter is under heavy load, many clients that were throttled can all succeed again at the exact same instant, causing a burst at the downstream service. Sliding window counter avoids this by computing an estimated count as a weighted average of the current window's count and the previous window's count, weighted by how far into the current window we are — this smooths the transition so there is no hard reset instant, at the cost of being an approximation rather than an exact count.\r
\r
### Q12. In production, would you fail open or fail closed if the rate limiter's backing store (e.g. Redis) is unreachable?\r
\r
It depends on what is being protected: for a public API gateway protecting against abuse or DDoS, fail closed (deny requests) is usually safer because the downstream system may not survive an unthrottled flood. For an internal service where the rate limiter protects a non-critical resource and availability matters more than strict enforcement, fail open (allow requests, log the failure) avoids an outage caused by the limiter itself. The senior answer names this explicitly as a business decision, backed by a circuit breaker around the store call so a persistent outage does not add latency to every single request while it decides.\r
`;export{e as default};
