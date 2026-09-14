const e=`---\r
title: Design a Task Scheduler\r
description: Design an in-process job scheduler with one-off and recurring triggers, a delay queue, a worker pool, retry with backoff and safe cancellation\r
difficulty: Advanced\r
tags: [scheduling, concurrency, system-design, command-pattern]\r
---\r
\r
A task scheduler question tests whether you can build a correct producer-consumer system around time itself — jobs are not "ready" until a clock says so, and the queue has to wake workers at exactly the right moment without busy-spinning.\r
\r
## Requirements\r
\r
### Functional\r
\r
- \`ScheduleOnce(job, delay)\`, \`ScheduleAtFixedRate(job, interval)\`, \`ScheduleWithFixedDelay(job, interval)\`, and cron-style recurring schedules.\r
- A fixed worker pool executes jobs at or after their due time — never early.\r
- \`Cancel(jobId)\` prevents future runs; a run already in flight is allowed to finish.\r
- A job that throws is logged and does not kill its worker or its future schedule.\r
\r
### Non-functional and assumptions\r
\r
- Single process, in-memory — persistence and distributed coordination are named extensions, not core requirements.\r
- Thread-safe under concurrent \`Schedule\`/\`Cancel\` calls from many callers while workers are executing jobs.\r
- The same job instance must never run concurrently with itself, even if one execution overruns its next scheduled time.\r
- \`shutdown()\` stops accepting new jobs and drains in-flight work cleanly.\r
\r
### Clarifying questions to ask\r
\r
> [!TIP]\r
> Ask about self-overlap early — "if a recurring job takes longer than its interval, does the next run wait, skip, or run in parallel?" — because the answer changes whether you need a per-job "is running" flag at all.\r
\r
- How many schedule types are needed: one-time delay, fixed rate, fixed delay, full cron expressions?\r
- What is the worker pool size, and is it fixed or does it need to scale with load?\r
- What is the "missed run" policy if the scheduler was busy or paused — fire immediately, skip to the next slot, or fire once and catch up?\r
- Does cancellation need to interrupt a running job, or only prevent future runs?\r
- Is exactly-once execution required, or is at-least-once (with idempotent jobs) acceptable?\r
\r
## Core objects\r
\r
| Class | Responsibility | Key fields/methods |\r
|---|---|---|\r
| \`IJob\` | Command pattern payload — the work itself | \`Execute()\` |\r
| \`Job\` | Scheduling wrapper around an \`IJob\` | \`Id\`, \`Trigger\`, \`NextRunTime\`, \`Status\`, \`Cancel()\` |\r
| \`ITrigger\` | Strategy computing the next run time | \`NextRunTime(scheduled, finished) -> DateTime?\` |\r
| \`OneTimeTrigger\` / \`FixedRateTrigger\` / \`FixedDelayTrigger\` / \`CronTrigger\` | Concrete schedule types | \`NextRunTime(...)\` |\r
| \`DelayQueue\` | Thread-safe min-heap ordered by next-run time, blocks until due | \`Add(job)\`, \`TakeDue() -> Job\` |\r
| \`WorkerPool\` | Fixed threads pulling due jobs and executing them | \`_workers\`, \`WorkerLoop()\` |\r
| \`RetryPolicy\` | Strategy for retrying a failed job | \`ShouldRetry(attempt)\`, \`NextDelay(attempt)\` |\r
| \`JobScheduler\` | Public API, orchestrates queue + workers + registry | \`Schedule(...)\`, \`Cancel(id)\`, \`Shutdown()\` |\r
\r
## Class design\r
\r
\`\`\`mermaid\r
classDiagram\r
    class IJob {\r
        <<interface>>\r
        +Execute() void\r
    }\r
    class Job {\r
        +string Id\r
        +IJob Task\r
        +ITrigger Trigger\r
        +DateTime NextRunTime\r
        +JobStatus Status\r
        +bool IsCancelled\r
        +Cancel() void\r
    }\r
    class ITrigger {\r
        <<interface>>\r
        +NextRunTime(scheduled, finished) DateTime?\r
    }\r
    class DelayQueue {\r
        -List heap\r
        -object lockObj\r
        +Add(job) void\r
        +TakeDue() Job\r
        +Shutdown() void\r
    }\r
    class RetryPolicy {\r
        <<interface>>\r
        +ShouldRetry(attempt) bool\r
        +NextDelay(attempt) TimeSpan\r
    }\r
    class JobScheduler {\r
        -DelayQueue queue\r
        -ConcurrentDictionary jobs\r
        -Thread[] workers\r
        +Schedule(job, trigger) void\r
        +Cancel(jobId) bool\r
        +Shutdown() void\r
    }\r
    Job --> IJob\r
    Job --> ITrigger\r
    ITrigger <|.. OneTimeTrigger\r
    ITrigger <|.. FixedRateTrigger\r
    ITrigger <|.. FixedDelayTrigger\r
    ITrigger <|.. CronTrigger\r
    JobScheduler --> DelayQueue\r
    JobScheduler --> RetryPolicy\r
    DelayQueue "1" --> "many" Job\r
\`\`\`\r
\r
## Key design decisions\r
\r
### Command pattern for job payloads, not a bag of parameters\r
\r
\`IJob.Execute()\` is the only thing the scheduler knows about a job's actual work — whatever closure, service call, or batch operation it wraps is opaque to the scheduling machinery. The rejected alternative is passing a delegate plus loosely-typed parameters directly into \`Schedule()\`; wrapping the work as a Command object instead lets a job carry its own state, be logged/serialized by identity, and be retried by simply calling \`Execute()\` again without re-marshalling arguments.\r
\r
### Strategy for trigger types, not a schedule-type enum with branches\r
\r
\`ITrigger.NextRunTime(scheduled, finished)\` is one method four different classes implement (one-time, fixed rate, fixed delay, cron). The rejected alternative — a \`ScheduleType\` enum and a \`switch\` inside the scheduler computing the next run — means every new schedule type (say, "run every weekday at 9am") requires editing shared scheduler code instead of adding one class.\r
\r
| Trigger | Anchors next run on | Behaviour under a slow execution |\r
|---|---|---|\r
| Fixed rate | The *previous scheduled* time + interval | Catches up to "now" if it drifted, does not pile up missed runs |\r
| Fixed delay | The *previous finish* time + interval | Always a constant gap after the last run ends |\r
| Cron | The next matching wall-clock instant | Skips to the next valid slot if one was missed |\r
\r
### Min-heap delay queue with a timed monitor wait, not polling\r
\r
\`DelayQueue.TakeDue()\` sleeps via \`Monitor.Wait(delay)\` for exactly as long as the head-of-heap job needs, waking early only if a new job is inserted ahead of it (\`PulseAll\` on insert). The rejected alternative — a worker loop that polls every N milliseconds — either wastes CPU (small N) or adds up to N milliseconds of needless delay to every job (large N); a timed wait gives exact wake-ups with zero idle spinning.\r
\r
> [!TIP]\r
> A sorted \`List<Job>\` insert is O(n), which is fine for a few thousand jobs but worth naming as a known limit: swap it for a binary min-heap or \`PriorityQueue<Job, DateTime>\` to get O(log n) insert/pop with the identical locking protocol, and at very large scale (millions of coarse-grained timers) consider a hashed timing wheel, which gives O(1) insert by bucketing jobs into fixed time slots rather than keeping a fully ordered structure.\r
\r
### Re-add to the queue only after the run finishes, preventing self-overlap by construction\r
\r
A recurring \`Job\` is popped out of the \`DelayQueue\` before \`Execute()\` runs and is only re-added, with its next run time recomputed, inside a \`finally\` block after the run completes. The rejected alternative — leaving the job "in" the queue with a mutable next-run-time while workers pull by time — risks a second worker picking up the same job while the first execution is still running, since nothing removes it from eligibility during execution.\r
\r
## Implementation\r
\r
\`\`\`csharp\r
public interface IJob { void Execute(); }\r
\r
public enum JobStatus { Scheduled, Running, Cancelled, Completed }\r
\r
public interface ITrigger { DateTime? NextRunTime(DateTime scheduled, DateTime finished); }\r
\r
public class FixedRateTrigger : ITrigger\r
{\r
    private readonly TimeSpan _interval;\r
    public FixedRateTrigger(TimeSpan interval) => _interval = interval;\r
\r
    public DateTime? NextRunTime(DateTime scheduled, DateTime finished)\r
    {\r
        var next = scheduled + _interval;\r
        return next <= DateTime.UtcNow ? DateTime.UtcNow : next; // don't pile up missed slots\r
    }\r
}\r
\r
public class Job\r
{\r
    public string Id { get; }\r
    public IJob Task { get; }\r
    public ITrigger Trigger { get; }\r
    public DateTime NextRunTime { get; set; }\r
    public JobStatus Status { get; set; } = JobStatus.Scheduled;\r
    private volatile bool _cancelled;\r
    public bool IsCancelled => _cancelled;\r
\r
    public Job(string id, IJob task, ITrigger trigger, DateTime firstRun)\r
    {\r
        Id = id; Task = task; Trigger = trigger; NextRunTime = firstRun;\r
    }\r
\r
    public void Cancel() { _cancelled = true; Status = JobStatus.Cancelled; }\r
}\r
\r
public class DelayQueue\r
{\r
    private readonly List<Job> _heap = new(); // kept sorted by NextRunTime\r
    private readonly object _lock = new();\r
    private bool _running = true;\r
\r
    public void Add(Job job)\r
    {\r
        lock (_lock)\r
        {\r
            if (!_running) return;\r
            var index = _heap.FindIndex(j => j.NextRunTime > job.NextRunTime);\r
            if (index < 0) _heap.Add(job); else _heap.Insert(index, job);\r
            Monitor.PulseAll(_lock);\r
        }\r
    }\r
\r
    public Job? TakeDue()\r
    {\r
        lock (_lock)\r
        {\r
            while (_running)\r
            {\r
                if (_heap.Count == 0) { Monitor.Wait(_lock); continue; }\r
\r
                var head = _heap[0];\r
                var delayMs = (head.NextRunTime - DateTime.UtcNow).TotalMilliseconds;\r
\r
                if (delayMs <= 0)\r
                {\r
                    _heap.RemoveAt(0);\r
                    if (head.IsCancelled) continue; // lazily drop cancelled jobs\r
                    return head;\r
                }\r
                Monitor.Wait(_lock, (int)Math.Min(delayMs, int.MaxValue));\r
            }\r
            return null;\r
        }\r
    }\r
\r
    public void Shutdown() { lock (_lock) { _running = false; Monitor.PulseAll(_lock); } }\r
}\r
\r
public class JobScheduler\r
{\r
    private readonly DelayQueue _queue = new();\r
    private readonly ConcurrentDictionary<string, Job> _jobs = new();\r
    private readonly IRetryPolicy _retryPolicy;\r
    private volatile bool _running = true;\r
\r
    public JobScheduler(int poolSize, IRetryPolicy retryPolicy)\r
    {\r
        _retryPolicy = retryPolicy;\r
        for (int i = 0; i < poolSize; i++)\r
            new Thread(WorkerLoop) { IsBackground = true }.Start();\r
    }\r
\r
    public void Schedule(string jobId, IJob task, ITrigger trigger, TimeSpan delay)\r
    {\r
        var job = new Job(jobId, task, trigger, DateTime.UtcNow + delay);\r
        _jobs[jobId] = job;\r
        _queue.Add(job);\r
    }\r
\r
    public bool Cancel(string jobId)\r
    {\r
        if (!_jobs.TryRemove(jobId, out var job)) return false;\r
        job.Cancel();\r
        return true;\r
    }\r
\r
    private void WorkerLoop()\r
    {\r
        while (_running)\r
        {\r
            var job = _queue.TakeDue();\r
            if (job == null) break;\r
\r
            var scheduledTime = job.NextRunTime;\r
            try { job.Status = JobStatus.Running; RunWithRetry(job); }\r
            finally { Reschedule(job, scheduledTime); }\r
        }\r
    }\r
\r
    private void RunWithRetry(Job job)\r
    {\r
        for (int attempt = 1; ; attempt++)\r
        {\r
            try { job.Task.Execute(); return; }\r
            catch (Exception ex) when (_retryPolicy.ShouldRetry(attempt))\r
            {\r
                Console.WriteLine($"[{job.Id}] attempt {attempt} failed: {ex.Message}, retrying");\r
                Thread.Sleep(_retryPolicy.NextDelay(attempt));\r
            }\r
            catch (Exception ex) { Console.WriteLine($"[{job.Id}] failed permanently: {ex.Message}"); return; }\r
        }\r
    }\r
\r
    private void Reschedule(Job job, DateTime scheduledTime)\r
    {\r
        var next = job.Trigger.NextRunTime(scheduledTime, DateTime.UtcNow);\r
        if (next.HasValue && !job.IsCancelled && _running)\r
        {\r
            job.NextRunTime = next.Value; job.Status = JobStatus.Scheduled; _queue.Add(job);\r
        }\r
        else { job.Status = JobStatus.Completed; _jobs.TryRemove(job.Id, out _); }\r
    }\r
}\r
\`\`\`\r
\r
## Concurrency and thread safety\r
\r
\`\`\`mermaid\r
flowchart LR\r
    C1["Caller: Schedule()"] --> Lock["DelayQueue lock"]\r
    C2["Caller: Cancel()"] --> Reg["ConcurrentDictionary of jobs"]\r
    Lock --> Heap["Min-heap by NextRunTime"]\r
    Heap --> W1["Worker 1"]\r
    Heap --> W2["Worker 2"]\r
    Heap --> W3["Worker N"]\r
    W1 --> Exec["job.Execute()"]\r
    Exec --> Lock\r
\`\`\`\r
\r
Every arrow into the heap goes through the same lock; workers only ever touch the heap to take a due job or to re-add it after \`finally\`, never while \`Execute()\` itself is running.\r
\r
> [!WARNING]\r
> Self-overlap is the trap interviewers probe hardest: a naive design that leaves a recurring job's entry "in" the queue while it executes can let a second worker pick it up mid-run. The fix shown above is structural, not a lock — the job is physically absent from the heap during execution and is only re-inserted, with a freshly computed next-run-time, inside \`finally\` after the run completes.\r
\r
| Shared state | Protection |\r
|---|---|\r
| The heap of pending jobs | Single \`lock\` inside \`DelayQueue\`, held only for heap mutation, never during job execution |\r
| Worker wake-ups | \`Monitor.Wait(timeout)\` + \`PulseAll\` on every insert/shutdown — no busy polling |\r
| Job registry (for cancellation lookups) | \`ConcurrentDictionary<string, Job>\` |\r
| Cancellation flag | \`volatile bool\`, checked on pop from the heap and again before rescheduling |\r
| Self-overlap | Prevented structurally — job is out of the queue for the full duration of \`Execute()\` |\r
\r
A deliberately rejected option is a lock per job in addition to the queue lock — nested locking invites deadlock for no real benefit here, since the queue lock is only ever held for O(log n) heap operations, never while a job's \`Execute()\` runs.\r
\r
## Extending the design\r
\r
| New requirement | Where it plugs in | Why the design allows it |\r
|---|---|---|\r
| Cron expressions | New \`CronTrigger : ITrigger\` parsing an expression and returning the next matching instant | \`ITrigger\` is already the sole seam for "what is the next run time" |\r
| Cooperative cancellation of a running job | Pass a \`CancellationToken\` into \`IJob.Execute(CancellationToken)\`; \`Cancel()\` also signals the token | \`IJob\` already isolates the work from the scheduling machinery |\r
| Missed-run policy (fire-now vs skip) | A configurable flag on \`FixedRateTrigger\`/\`CronTrigger\` controlling whether a stale next-run collapses to "now" or the next future slot | The clamp logic already lives in one place per trigger |\r
| Observability (metrics, tracing) | Wrap \`IJob.Execute()\` in a decorator that records duration/success before delegating | Command pattern means jobs are already objects that can be wrapped |\r
| Distributed scheduling across nodes | Move the heap to a shared store (DB row or Redis sorted set); nodes atomically claim a due job with a lease and heartbeat | The single-node contract (\`TakeDue\` returns one job, exactly one worker executes it) is exactly what a distributed claim-with-lease must also guarantee |\r
| One slow job starving the whole pool | Wrap \`Execute()\` with a timeout that logs an overrun, or split workers into separate fast/slow pools by job class | \`IJob\` is already opaque to the scheduler, so isolating one class of job to its own pool needs no change to \`DelayQueue\` or the scheduling loop |\r
\r
> [!NOTE]\r
> Going distributed is the standard closing question. The key insight to state: the in-process \`DelayQueue\` lock and the distributed "claim a due row with \`UPDATE ... WHERE status='SCHEDULED'\`" pattern solve the *same* problem — ensuring exactly one consumer wins a due job — just moved from an in-memory mutex to a database's row-level locking or an atomic \`ZPOPMIN\` in Redis.\r
\r
## Cheat sheet\r
\r
- Command pattern (\`IJob.Execute()\`) keeps the scheduler ignorant of what work actually does — enables retry, logging and decoration for free.\r
- Strategy pattern (\`ITrigger\`) keeps schedule types (one-time, fixed rate, fixed delay, cron) independent and addable without touching the scheduler.\r
- A recurring job must be **out of the queue** for its entire execution — that is what prevents self-overlap, not a per-job lock.\r
- Use \`Monitor.Wait(timeout)\` + \`PulseAll\`, never polling, to wake a worker at exactly the right time.\r
- Fixed rate anchors on scheduled time (catches up, but clamps to avoid a pile-up of missed runs); fixed delay anchors on finish time (constant gap).\r
- A job that throws must be caught inside the worker loop — never let an exception escape and kill a worker thread or the schedule.\r
- \`Cancel()\` sets a flag and removes from the registry; an in-flight run is allowed to finish, future runs are suppressed.\r
- Distributed scheduling is the same "exactly one consumer claims a due item" problem, moved to a shared store with leases instead of an in-memory lock.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Letting a recurring job stay logically "in the queue" during execution | Pop before running, re-add only in \`finally\` after it finishes |\r
| Busy-polling the queue every N ms | Use a timed \`Monitor.Wait\` that wakes exactly when the head job is due |\r
| An unhandled exception in a job killing its worker thread | Wrap \`Execute()\` in try/catch inside the worker loop |\r
| Confusing fixed rate with fixed delay | State explicitly which time each anchors on — scheduled vs finish |\r
| No missed-run policy after a pause | Decide and document fire-now-once vs skip-to-next-slot |\r
| A single lock guarding both the queue *and* job execution | Lock only heap mutation; never hold the queue lock while a job runs |\r
\r
## Summary\r
\r
A task scheduler is a delay-aware producer-consumer system: a min-heap \`DelayQueue\` orders jobs by next-run time and wakes workers with a timed wait rather than polling, a fixed worker pool drains due jobs, and Command (\`IJob\`) plus Strategy (\`ITrigger\`) keep "what runs" and "when it runs next" both pluggable and independent of the scheduling machinery. Self-overlap is prevented structurally by removing a job from the queue for the full duration of its execution, retries and missed-run policy are handled per trigger/job rather than in the core loop, and the same "exactly one consumer claims a due item" contract is what a distributed version must replicate over a shared store with leases.\r
\r
## Top Interview Questions\r
\r
### Q1. How do you wake a worker at exactly the right time without polling?\r
\r
Use a monitor (lock + condition variable): \`TakeDue()\` computes the delay until the head-of-heap job is due and calls \`Monitor.Wait(delay)\`, which sleeps the thread efficiently until either that timeout elapses or another thread calls \`Monitor.Pulse\`/\`PulseAll\`. Every \`Add()\` call pulses after inserting, so if a newly scheduled job is now earlier than what the worker was waiting for, the worker wakes immediately and recomputes the correct (shorter) wait instead of oversleeping. This gives exact, zero-idle-CPU wake-ups, unlike a polling loop that either wastes CPU checking too often or adds latency by checking too rarely.\r
\r
### Q2. How do you guarantee a recurring job never runs concurrently with itself?\r
\r
Structure the queue so a job is physically removed from the heap the moment a worker takes it, and only re-inserted — with a freshly computed next-run-time — inside a \`finally\` block after \`Execute()\` completes. Because the job simply is not present in the "due" structure while it runs, no other worker can ever pull it out a second time; this is a structural guarantee rather than a lock you have to remember to take, which is more robust because there is no code path where it can be forgotten.\r
\r
### Q3. What's the difference between fixed-rate and fixed-delay scheduling, and why does it matter which one you pick?\r
\r
Fixed-rate anchors the next run on the *previous scheduled* time plus the interval, aiming for a steady cadence (e.g. exactly every 60 seconds) — if one execution runs long, the next run is computed to catch up towards "now" rather than drifting forever, though a sane implementation clamps this so a very slow run does not trigger a burst of catch-up executions. Fixed-delay anchors on the *previous finish* time plus the interval, guaranteeing a constant gap between the end of one run and the start of the next, which is right for tasks like "wait 60 seconds after this poll finishes before polling again" where overlapping or back-to-back polls would be wasteful or harmful.\r
\r
### Q4. Why use the Command pattern (\`IJob.Execute()\`) instead of just passing a \`Action\`/lambda directly into \`Schedule()\`?\r
\r
A lambda works for the simplest case, but wrapping the work as a Command object (\`IJob\`) gives you a stable place to attach identity, logging, retry state, and decorators — you can wrap an \`IJob\` in a \`LoggingJob\` or \`MetricsJob\` decorator that records timing and success/failure before delegating to \`Execute()\`, without the scheduler's core loop needing to know any of that happened. It also makes serialization and distributed scheduling feasible later, since a Command object with well-defined state is far easier to persist and reconstruct than a captured closure.\r
\r
### Q5. A job throws an exception every time it runs — what should the scheduler do, and why?\r
\r
The scheduler must catch the exception inside the worker loop (never let it propagate out of \`WorkerLoop\`), log it, and apply the configured retry policy for that individual failure. Critically, the *schedule itself* must survive: after logging or exhausting retries for this run, the job must still be rescheduled for its next trigger time as normal — a job that fails repeatedly should not silently stop running forever, and a worker thread must never die because of one bad job, since that would silently reduce the pool's capacity for every other job too.\r
\r
### Q6. How would you support cooperative cancellation of a job that is already executing?\r
\r
You cannot safely force-kill a running thread in most managed runtimes without risking corrupted shared state, so cancellation of in-flight work must be cooperative: pass a \`CancellationToken\` into \`IJob.Execute(CancellationToken)\`, have long-running jobs poll \`token.IsCancellationRequested\` (or pass it down into cancellable I/O calls like HTTP requests), and have \`Cancel()\` both mark the job as cancelled for future scheduling *and* signal the token so an already-running execution can notice and exit early. The scheduler's contract stays "future runs are suppressed"; whether the current run stops early depends on that job's own code honoring the token.\r
\r
### Q7. What is a "missed run" and what policies can handle it?\r
\r
A missed run happens when the scheduler was paused, overloaded, or the process was down, and a job's scheduled time has already passed by the time it is next considered. Two common policies: "fire now" (\`FIRE_NOW\`), where the job runs immediately to catch up, and "skip" (\`SKIP_MISSED\`), where the scheduler jumps straight to the next valid future slot and treats the missed one as lost. Fixed-rate scheduling additionally needs a clamp to avoid a related but distinct problem — firing a burst of *many* missed intervals back-to-back after a long pause — by capping the catch-up to at most one immediate run before resuming the normal cadence.\r
\r
### Q8. How would this design change to become a distributed scheduler across multiple nodes?\r
\r
Move the shared queue out of process into a store all nodes can see — a database table with a \`nextRunTime\` column and an atomic claim query (\`UPDATE jobs SET owner = :node, status = 'CLAIMED' WHERE id = :id AND status = 'SCHEDULED'\`), or a Redis sorted set popped with \`ZPOPMIN\`. Each node runs its own worker pool pulling from this shared store instead of an in-memory heap, and holds a lease with a periodic heartbeat on any job it is executing so that if the node crashes mid-run, another node can detect the expired lease and reclaim the job. The single-node contract — exactly one worker executes a given due job at a time — is preserved, just enforced by the store's atomicity instead of an in-process lock.\r
\r
### Q9. Why avoid a lock per individual job in addition to the queue's lock?\r
\r
Introducing a second lock scope (per-job) alongside the queue's lock creates the classic conditions for deadlock — if code ever needs to acquire both locks in different orders across different call paths, two threads can each hold one lock and wait for the other. Since the queue lock in this design is only ever held briefly for heap mutation (insert/remove), and never while a job's \`Execute()\` is running, there is no actual contention window that a second, finer-grained lock would meaningfully shrink — it would only add complexity and deadlock risk for no throughput benefit.\r
\r
### Q10. How would you test that a \`FixedRateTrigger\` correctly catches up after a slow execution without piling up runs?\r
\r
Inject a fake/controllable clock (the same pattern used for rate limiters and caches) so the test can simulate "this execution took much longer than the interval" deterministically. Assert that \`NextRunTime(scheduled, finished)\` returns "now" (catching up to a single immediate run) rather than a time in the past, and separately assert that calling it again immediately afterward returns a time properly spaced by the interval from that catch-up point — proving the trigger clamps to prevent an unbounded burst of back-to-back "missed" runs firing all at once.\r
\r
### Q11. How would you add observability (success/failure counts, run duration) without modifying \`JobScheduler\` or \`IJob\` implementations?\r
\r
Introduce a decorator, \`InstrumentedJob : IJob\`, that wraps any existing \`IJob\`, records a start timestamp, calls the inner job's \`Execute()\`, and records duration and success/failure (via try/catch) to a metrics sink afterward, then have \`Schedule()\` accept jobs already wrapped this way (or wrap them internally before enqueuing). Because \`IJob\` is just an interface with one method, any implementation can be transparently wrapped without either the scheduler's core loop or the original job's logic needing any awareness that instrumentation is happening.\r
\r
### Q12. Why does the design prefer catching exceptions per-attempt inside \`RunWithRetry\` rather than retrying by simply re-enqueuing the job into the \`DelayQueue\`?\r
\r
Retrying inline (looping with a short sleep inside the same worker) keeps the retry attempts as part of the same logical execution — the job is never re-exposed to \`TakeDue()\` as a fresh eligible entry mid-retry, which avoids a subtle self-overlap risk where re-enqueuing on failure could race with the job's own next legitimate scheduled run if the retry window is shorter than the recurring interval. The trade-off is that a worker thread is occupied for the full duration of all retry attempts of one job; for retries with long backoff delays, re-enqueuing with a \`nextRunTime\` in the future (freeing the worker in the meantime) is a reasonable alternative, as long as the job's cancelled/cancelled-during-retry state is still checked before each attempt.\r
`;export{e as default};
