const e=`---\r
title: Design a Logging Framework\r
description: Design a pluggable logging framework with sinks, formatters, async buffered writes, structured properties, scopes and sampling\r
difficulty: Core\r
tags: [logging, observability, system-design, concurrency]\r
---\r
\r
Every backend engineer has used a logging framework, which makes this LLD question deceptively easy to start and easy to get shallow on — the interesting parts are async delivery, backpressure, and what happens when a sink goes down.\r
\r
## Requirements\r
\r
### Functional\r
\r
- \`Logger.Log(level, message, properties)\` records a structured entry with a timestamp, level, message and key-value properties.\r
- Multiple output sinks simultaneously: console, file, network (e.g. shipping to a log aggregator).\r
- A configurable minimum level per logger or per sink (e.g. console at \`Info\`, file at \`Debug\`).\r
- Structured logging: attach arbitrary properties, plus ambient context (correlation ID, request scope) that flows automatically without being repeated at every call site.\r
\r
### Non-functional and assumptions\r
\r
- Logging must never block the calling thread on I/O — the hot path is \`Log()\` returning immediately.\r
- Thread-safe: many application threads log concurrently.\r
- Bounded memory: a burst of log volume must not grow the process's memory without limit.\r
- Must degrade gracefully if a sink is slow or unavailable — one broken sink must not stop others or crash the app.\r
- Extensible to new sinks and formats without changing the core \`Logger\` class.\r
\r
### Clarifying questions to ask\r
\r
> [!TIP]\r
> Naming the producer-consumer shape early — "logging is a producer-consumer problem, the app thread produces, a background thread consumes and writes" — signals you already know where this design is going.\r
\r
- Should sinks share one minimum level, or can each sink have its own threshold?\r
- Is exactly-once delivery required, or is "best effort, may drop under extreme load" acceptable?\r
- Do we need structured properties (key-value) or is a plain message string enough?\r
- Should logs from a single request be correlated (trace/correlation ID) across services?\r
- What should happen when the internal queue is full — block the caller, drop the oldest, or drop the newest?\r
\r
## Core objects\r
\r
| Class | Responsibility | Key fields/methods |\r
|---|---|---|\r
| \`LogLevel\` | Ordered severity enum | \`Debug < Info < Warning < Error < Fatal\` |\r
| \`LogRecord\` | One structured log entry | \`Timestamp\`, \`Level\`, \`Message\`, \`Properties\`, \`CorrelationId\` |\r
| \`Logger\` | Public API, applies filtering, enqueues records | \`Log(level, message, props)\`, \`BeginScope(props)\` |\r
| \`ILogSink\` | Strategy for "where logs go" | \`Write(record)\` |\r
| \`ConsoleSink\` / \`FileSink\` / \`NetworkSink\` | Concrete destinations | \`Write(record)\` |\r
| \`ILogFormatter\` | Strategy for "how a record renders" | \`Format(record) -> string\` |\r
| \`LevelFilter\` | Chain of Responsibility link, drops below-threshold records | \`MinLevel\`, \`Next\` |\r
| \`AsyncLogPipeline\` | Bounded queue + background flusher | \`_queue\`, \`_worker\`, \`Enqueue(record)\` |\r
| \`LogScope\` | Disposable ambient context (correlation ID, request fields) | \`Properties\`, \`Dispose()\` |\r
\r
## Class design\r
\r
\`\`\`mermaid\r
classDiagram\r
    class Logger {\r
        -AsyncLogPipeline pipeline\r
        -LogLevel minLevel\r
        +Log(level, message, props) void\r
        +BeginScope(props) LogScope\r
    }\r
    class LogRecord {\r
        +DateTime Timestamp\r
        +LogLevel Level\r
        +string Message\r
        +Dictionary Properties\r
        +string CorrelationId\r
    }\r
    class AsyncLogPipeline {\r
        -BlockingCollection queue\r
        -ILogSink[] sinks\r
        +Enqueue(record) void\r
        -RunWorker() void\r
    }\r
    class ILogSink {\r
        <<interface>>\r
        +Write(record) void\r
    }\r
    class ILogFormatter {\r
        <<interface>>\r
        +Format(record) string\r
    }\r
    class LevelFilter {\r
        -LogLevel MinLevel\r
        -ILogSink Next\r
        +Write(record) void\r
    }\r
    class LogScope {\r
        +Dictionary Properties\r
        +Dispose() void\r
    }\r
    Logger --> AsyncLogPipeline\r
    Logger --> LogScope : ambient context\r
    AsyncLogPipeline --> ILogSink : fans out to\r
    ILogSink <|.. LevelFilter\r
    ILogSink <|.. ConsoleSink\r
    ILogSink <|.. FileSink\r
    ILogSink <|.. NetworkSink\r
    LevelFilter --> ILogSink : wraps\r
    ConsoleSink --> ILogFormatter\r
    FileSink --> ILogFormatter\r
\`\`\`\r
\r
### The pipeline as producer-consumer\r
\r
\`\`\`mermaid\r
flowchart LR\r
    A["Application thread"] -->|"Log(level, msg)"| L["Logger"]\r
    L -->|"Enqueue(record)"| Q["Bounded queue"]\r
    Q -->|"Take()"| W["Worker task(s)"]\r
    W --> S1["ConsoleSink"]\r
    W --> S2["FileSink"]\r
    W --> S3["NetworkSink"]\r
\`\`\`\r
\r
The application thread only ever touches the left two boxes — \`Logger.Log\` validates the level and enqueues, then returns immediately. Everything to the right of the queue runs on one or more background worker tasks, so a slow \`NetworkSink\` only ever delays other queued records, never the caller.\r
\r
## Key design decisions\r
\r
### Chain of Responsibility for level filtering, not an \`if\` at every sink\r
\r
\`LevelFilter\` wraps any \`ILogSink\` and drops records below its threshold before delegating to the wrapped sink — so console can filter at \`Info\` while file filters at \`Debug\`, by wrapping each differently. The rejected alternative is an \`if (record.Level >= MinLevel)\` check duplicated inside every sink's \`Write\` method, which means adding a sink means re-adding the filtering logic and risking it diverging.\r
\r
### Strategy for sinks and formatters, kept as two separate interfaces\r
\r
\`ILogSink\` (where) and \`ILogFormatter\` (how it renders) are separate so a \`FileSink\` can use a plain-text formatter while a \`NetworkSink\` uses a JSON formatter, without either sink knowing about the other's format. The rejected alternative — baking formatting into each sink's \`Write\` — means a new format (say, adding OpenTelemetry-compatible JSON) requires editing every sink class instead of writing one new formatter class.\r
\r
### Bounded queue with a background flusher, not synchronous writes on the caller's thread\r
\r
\`AsyncLogPipeline\` decouples "recording a log" from "writing it out": \`Log()\` just enqueues and returns; a background worker (or small pool) dequeues and calls each sink. The rejected alternative — writing synchronously inside \`Log()\` — means a slow disk or network sink adds I/O latency to every request thread that logs, which defeats the purpose of logging being cheap.\r
\r
| Approach | Caller latency | Risk |\r
|---|---|---|\r
| Synchronous write | Full I/O latency on every log call | Simple, but couples app latency to sink health |\r
| Bounded async queue (chosen) | O(1) enqueue | Needs a backpressure policy for a full queue |\r
\r
### Ambient scope via \`IDisposable\`, not manual parameter threading\r
\r
\`BeginScope(props)\` returns an \`IDisposable\` \`LogScope\` that pushes properties onto an ambient (\`AsyncLocal\`) stack for the duration of a \`using\` block, so every log call inside that block automatically carries the correlation ID without the call site repeating it. The rejected alternative — passing a \`correlationId\` parameter through every method signature down the call chain — is invasive and easy to forget at one layer, silently breaking trace correlation.\r
\r
## Implementation\r
\r
\`\`\`csharp\r
public enum LogLevel { Debug, Info, Warning, Error, Fatal }\r
\r
public record LogRecord(DateTime Timestamp, LogLevel Level, string Message,\r
                         IReadOnlyDictionary<string, object> Properties, string? CorrelationId);\r
\r
public interface ILogSink { void Write(LogRecord record); }\r
\r
public class LevelFilter : ILogSink\r
{\r
    private readonly LogLevel _minLevel;\r
    private readonly ILogSink _next;\r
\r
    public LevelFilter(LogLevel minLevel, ILogSink next) { _minLevel = minLevel; _next = next; }\r
\r
    public void Write(LogRecord record)\r
    {\r
        if (record.Level >= _minLevel) _next.Write(record);\r
    }\r
}\r
\r
public class AsyncLogPipeline : IDisposable\r
{\r
    private readonly BlockingCollection<LogRecord> _queue;\r
    private readonly List<ILogSink> _sinks;\r
    private readonly Task _worker;\r
\r
    public AsyncLogPipeline(IEnumerable<ILogSink> sinks, int capacity = 10_000)\r
    {\r
        _sinks = sinks.ToList();\r
        _queue = new BlockingCollection<LogRecord>(capacity);\r
        _worker = Task.Run(RunWorker);\r
    }\r
\r
    public bool Enqueue(LogRecord record) => _queue.TryAdd(record); // drop when full; never blocks caller\r
\r
    private void RunWorker()\r
    {\r
        foreach (var record in _queue.GetConsumingEnumerable())\r
        {\r
            foreach (var sink in _sinks)\r
            {\r
                try { sink.Write(record); }\r
                catch (Exception ex) { Console.Error.WriteLine($"sink failed: {ex.Message}"); }\r
            }\r
        }\r
    }\r
\r
    public void Dispose() { _queue.CompleteAdding(); _worker.Wait(); }\r
}\r
\r
public class Logger\r
{\r
    private static readonly AsyncLocal<ImmutableDictionary<string, object>> Ambient = new();\r
    private readonly AsyncLogPipeline _pipeline;\r
    private readonly LogLevel _minLevel;\r
\r
    public Logger(AsyncLogPipeline pipeline, LogLevel minLevel)\r
    {\r
        _pipeline = pipeline; _minLevel = minLevel;\r
    }\r
\r
    public void Log(LogLevel level, string message, IReadOnlyDictionary<string, object>? props = null)\r
    {\r
        if (level < _minLevel) return; // cheap pre-filter before touching the queue\r
\r
        var merged = (Ambient.Value ?? ImmutableDictionary<string, object>.Empty);\r
        if (props != null) foreach (var kv in props) merged = merged.SetItem(kv.Key, kv.Value);\r
\r
        _pipeline.Enqueue(new LogRecord(DateTime.UtcNow, level, message, merged,\r
            merged.TryGetValue("correlationId", out var id) ? id.ToString() : null));\r
    }\r
\r
    public IDisposable BeginScope(IReadOnlyDictionary<string, object> props)\r
    {\r
        var previous = Ambient.Value ?? ImmutableDictionary<string, object>.Empty;\r
        var next = previous;\r
        foreach (var kv in props) next = next.SetItem(kv.Key, kv.Value);\r
        Ambient.Value = next;\r
        return new ScopeHandle(() => Ambient.Value = previous);\r
    }\r
\r
    private class ScopeHandle : IDisposable\r
    {\r
        private readonly Action _onDispose;\r
        public ScopeHandle(Action onDispose) => _onDispose = onDispose;\r
        public void Dispose() => _onDispose();\r
    }\r
}\r
\`\`\`\r
\r
## Concurrency and thread safety\r
\r
> [!WARNING]\r
> Choosing what happens when the queue is full is a decision, not an accident. \`BlockingCollection.TryAdd\` used above **drops** the log record rather than blocking the application thread — the right default for logging, where losing a log line under extreme load is far better than an app thread stalling on I/O it did not ask for.\r
\r
- \`BlockingCollection<LogRecord>\` is already thread-safe for concurrent producers (many app threads) and a single consumer (the worker task), so no extra locking is needed around \`Enqueue\`.\r
- \`AsyncLocal<T>\` is the correct primitive for ambient scope data because it flows correctly across \`async\`/\`await\` continuations and is isolated per logical call chain — a plain \`ThreadStatic\` field would leak or lose context across thread-pool hops.\r
- The worker's \`foreach (var record in _queue.GetConsumingEnumerable())\` loop wraps each sink call in its own try/catch so one failing sink (e.g. a \`NetworkSink\` whose remote endpoint is down) never stops the loop or takes down other sinks.\r
- For higher throughput, scale to multiple consumer tasks (e.g. a small fixed pool, four is a typical default) reading from the same \`BlockingCollection\`, accepting that log ordering across sinks is then best-effort rather than strictly chronological.\r
\r
## Extending the design\r
\r
| New requirement | Where it plugs in | Why the design allows it |\r
|---|---|---|\r
| Sampling (log only 1% of \`Debug\` records) | A \`SamplingFilter : ILogSink\` wrapping the next sink, using a probabilistic or counter-based check | Same Chain-of-Responsibility seam as \`LevelFilter\` |\r
| New sink (e.g. shipping to a cloud log service) | Implement \`ILogSink\`, register in the sink list | Sinks are only known through the interface; \`Logger\` never changes |\r
| New wire format (OpenTelemetry JSON) | Implement \`ILogFormatter\`, plug into any sink's constructor | Formatting is decoupled from delivery |\r
| Retry when a sink is down | Wrap the sink in a \`RetryingSink\` decorator with backoff, falling back to a local buffer file | The try/catch boundary around each sink already isolates failures per sink |\r
| Correlation across services | \`LogScope\` properties include a trace ID propagated via HTTP headers into the next service's first scope | Ambient scope mechanism already threads arbitrary properties automatically |\r
\r
> [!NOTE]\r
> "What happens when a sink is down" is the single most productive follow-up question here. The answer worth giving: isolate failures per sink (already shown above), consider a small in-memory or on-disk buffer for retry, and expose a metric/counter for dropped or failed writes so the failure is observable rather than silent.\r
\r
## Cheat sheet\r
\r
- \`Logger.Log()\` must be near-free on the caller's thread — enqueue and return, never block on I/O.\r
- Chain of Responsibility for level filtering: wrap any sink in a \`LevelFilter\` instead of duplicating the check.\r
- Separate "where" (\`ILogSink\`) from "how it renders" (\`ILogFormatter\`) — two independent axes of extension.\r
- \`AsyncLocal<T>\`, not \`ThreadStatic\`, for ambient scope/correlation ID so it survives \`async\`/\`await\`.\r
- Decide explicitly what happens when the queue is full: drop-newest, drop-oldest, or block — and say why.\r
- Wrap every sink's write in its own try/catch so one broken sink cannot break the others or crash the worker.\r
- Sampling and retry both slot in as additional \`ILogSink\` decorators — no core class changes needed.\r
- A bounded queue is what makes "async logging" safe; unbounded queues just move an OOM risk from disk I/O to memory.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Writing to sinks synchronously inside \`Log()\` | Enqueue to a background pipeline; never do I/O on the caller's thread |\r
| Unbounded in-memory queue | Bound it, and pick an explicit overflow policy (drop, or block with a timeout) |\r
| \`ThreadStatic\` for correlation ID | Use \`AsyncLocal<T>\` so context survives \`await\` boundaries |\r
| One sink's exception stopping all sinks | Wrap each sink call in its own try/catch inside the worker loop |\r
| Baking format into each sink | Extract \`ILogFormatter\` as its own interface |\r
| No way to filter per sink independently | Wrap each sink in its own \`LevelFilter\` instance |\r
\r
## Summary\r
\r
A logging framework is a producer-consumer pipeline wearing a thin façade: \`Logger.Log()\` is the cheap producer side, an \`AsyncLogPipeline\` with a bounded queue and background worker is the consumer, and \`ILogSink\`/\`ILogFormatter\` are the two independent extension points for "where" and "how". Chain of Responsibility handles per-sink level filtering and sampling without duplicating checks, \`AsyncLocal\` carries correlation IDs safely across async boundaries, and isolating each sink's failure inside its own try/catch is what keeps one broken destination from taking down observability entirely.\r
\r
## Top Interview Questions\r
\r
### Q1. Why must \`Logger.Log()\` never perform synchronous I/O?\r
\r
If \`Log()\` writes directly to a file or a network socket, every application thread that logs inherits the latency and failure modes of that I/O — a slow disk or a stalled network connection to a log aggregator would add unpredictable delay to unrelated request-handling code, and a sink outage could even block the whole application. Decoupling via a bounded queue and background worker means the caller's cost is O(1) (an enqueue), and I/O latency or sink failures are contained to the background pipeline, never surfacing on the hot path.\r
\r
### Q2. What should happen when the internal log queue is full?\r
\r
There are three options: block the caller until space frees up, drop the newest record (reject the incoming log), or drop the oldest record (evict from the front to make room). For logging, dropping the newest (or oldest) is almost always preferred over blocking, because blocking the caller reintroduces the exact problem async logging was meant to solve — an overloaded logging pipeline now stalls application threads. The choice between drop-newest and drop-oldest is a judgment call: drop-newest is simpler and is what \`BlockingCollection.TryAdd\` gives you for free; drop-oldest better preserves the most recent (often most relevant) context during a burst, at the cost of slightly more bookkeeping.\r
\r
### Q3. How does Chain of Responsibility apply to log level filtering?\r
\r
Each \`LevelFilter\` wraps another \`ILogSink\` and only forwards a record if it meets its own minimum level threshold, otherwise it silently drops it — so filtering is a decorator layer, not logic embedded in the sink. This lets each sink have an independently configured threshold (console at \`Info\`, file at \`Debug\`) by wrapping each sink in a different \`LevelFilter\` instance, and lets you insert other filters (sampling, PII redaction) in the same chain without touching the sink implementations at all.\r
\r
### Q4. Why use \`AsyncLocal<T>\` instead of \`ThreadStatic\` for correlation IDs and scopes?\r
\r
\`ThreadStatic\` fields are tied to the physical OS thread, but modern async code frequently hops between thread-pool threads across \`await\` boundaries — a \`ThreadStatic\` correlation ID set before an \`await\` can be gone (or worse, wrong, belonging to a different logical operation) after it, because a different thread may resume the continuation. \`AsyncLocal<T>\` flows with the logical call context instead of the physical thread, so it correctly follows an operation through \`await\`s, \`Task.Run\`, and nested async calls, which is exactly what correlating logs across an asynchronous request needs.\r
\r
### Q5. How do you prevent one failing sink (e.g. a network sink whose endpoint is down) from breaking the entire logging pipeline?\r
\r
Wrap each individual sink's \`Write\` call in its own try/catch inside the worker loop that drains the queue, so an exception from one sink is caught, logged to a fallback (like stderr) or counted in a metric, and the loop continues to the next sink and the next record. Without this isolation, an unhandled exception from one sink would propagate up and kill the background worker task entirely, silently stopping *all* logging, including to sinks that were working fine.\r
\r
### Q6. How would you add sampling so that verbose \`Debug\` logs are only kept 1% of the time?\r
\r
Add a \`SamplingFilter : ILogSink\` that wraps the next sink and, for records at or below a configured level, only forwards them with some probability (or every Nth record via a counter for determinism), while always forwarding \`Warning\` and above unconditionally. This slots into the same decorator chain as \`LevelFilter\` — you can stack \`new LevelFilter(Debug, new SamplingFilter(0.01, fileSink))\` without either component knowing the other exists, which is the payoff of keeping sinks composable rather than monolithic.\r
\r
### Q7. What is the trade-off between a single background worker and a pool of workers consuming the log queue?\r
\r
A single worker guarantees logs are written to each sink in the exact order they were enqueued, which is valuable for readability and correlating a sequence of events. A pool of workers increases throughput under heavy load by parallelizing sink writes, but different records can then be written out of order relative to each other, especially across different sinks, since each worker races independently. Production systems usually keep one dequeuing consumer but allow it to fan out writes to multiple sinks concurrently (parallel writes per record, sequential across records), which preserves per-record ordering guarantees while still overlapping I/O across sinks.\r
\r
### Q8. How would you make correlation IDs flow automatically across service boundaries in a microservice architecture?\r
\r
Inside \`BeginScope\`, include the correlation ID in the ambient properties as usual, but also propagate it outward: any outgoing HTTP client call reads the current ambient correlation ID and attaches it as a request header (e.g. \`X-Correlation-Id\`); the receiving service's middleware reads that header and calls \`BeginScope\` with it as the very first thing it does when handling the request. This way, every log line across every service touched by one user request carries the same correlation ID, letting you filter a distributed trace's logs by that single value in your log aggregator.\r
\r
### Q9. Design scenario: under a traffic spike, the log queue is consistently full and dropping records. How do you diagnose and respond?\r
\r
First, check whether a specific sink is the bottleneck — instrument each sink's write latency and see if, say, the network sink to a remote aggregator is slow or timing out, causing the single consumer to fall behind the producers. If one sink is the culprit, either give it its own dedicated queue/worker so it cannot starve the others, or add a circuit breaker that stops calling a persistently failing/slow sink for a cooldown period. If the bottleneck is genuine overall volume, consider increasing the queue capacity as a stopgap, adding more consumer workers for throughput, or introducing sampling on lower-severity levels so volume drops without losing errors and warnings.\r
\r
### Q10. Why keep \`ILogFormatter\` separate from \`ILogSink\` instead of having each sink format its own output?\r
\r
Formatting (how a record becomes text/JSON/binary) and delivery (where that output goes) are genuinely independent concerns — the same JSON formatter might be reused by both a file sink and a network sink, while a plain-text formatter might be used only by the console sink. Keeping them separate means adding a new wire format (say, for a new log aggregator that expects a specific JSON schema) requires writing one new \`ILogFormatter\` implementation and wiring it into existing sinks via constructor injection, rather than duplicating formatting logic inside every sink class that needs it.\r
\r
### Q11. How do you unit test that log level filtering and sampling behave correctly without needing a real sink?\r
\r
Use a simple in-memory \`ILogSink\` test double (a \`RecordingSink\` that just appends every \`LogRecord\` it receives to a list) as the innermost sink in the chain, wrap it in the \`LevelFilter\` or \`SamplingFilter\` under test, call \`Write\` with records at various levels, and assert on the contents of the recording sink's list. Because sinks are just an interface, no real file, console, or network dependency is needed to verify filtering and sampling logic in isolation — this is a direct benefit of the Strategy/decorator design over a monolithic logger class.\r
\r
### Q12. What metrics would you expose to monitor the health of a logging pipeline in production?\r
\r
Queue depth (how many records are waiting to be written, to catch a consumer falling behind), the drop count (records rejected because the queue was full, indicating overload), per-sink write latency and error/success counts (to catch a specific sink degrading), and worker thread liveness (to alert if the background consumer task has unexpectedly died). Queue depth and drop count together are the earliest signal that logging itself is becoming a bottleneck rather than a passive observer of the system.\r
`;export{e as default};
