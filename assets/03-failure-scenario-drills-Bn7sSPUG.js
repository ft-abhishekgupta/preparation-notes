const e=`---\r
title: Failure Scenario Drills\r
description: The what if X breaks drill applied to your own systems, with blast radius, detection, mitigation and the permanent fix for every scenario\r
difficulty: Advanced\r
tags: [reliability, failure-modes, distributed-systems, incident-response]\r
---\r
\r
"What happens if X breaks?" is asked in almost every senior backend round, and it is the question most candidates prepare for least, because it requires imagining failure in a system you're used to describing as a success story. This page drills that question against the reader's own systems — a high-scale feed platform, an event-driven certification pipeline, and a multi-region service estate — so the answer is rehearsed, not improvised.\r
\r
## Why this question separates levels\r
\r
A mid-level engineer describes what a system does. A senior engineer describes what it does **when something goes wrong**, because production systems spend a meaningful fraction of their life in a degraded state, and the difference between a graceful degradation and an outage is almost always a decision someone made in advance.\r
\r
> [!KEY]\r
> The best answer to "what if X breaks?" is one you clearly thought about *before* it happened, not one you're constructing live. If your answer starts with "hmm, I guess we'd..." you have already lost the thread.\r
\r
## The scenario table\r
\r
Use this as a drill sheet. For each row, be ready to state the blast radius, how you'd detect it, what you'd do in the first five minutes, and what you'd build afterward so it doesn't happen again.\r
\r
| Scenario | Blast radius | Detection signal | Immediate mitigation | Permanent fix |\r
|---|---|---|---|---|\r
| Database (Cosmos) goes down | All reads and writes in the affected region | Elevated error rate, timeouts, region health check failing | Automatic regional failover to a healthy read region | Multi-region write topology, tested failover runbook, chaos-test the failover path |\r
| Distributed cache goes down | Latency spikes, not correctness — reads bypass to source of truth | Cache-miss rate near 100%, rising DB load | Bypass to database directly; scale DB read capacity | Cache redundancy (clustered/replicated), circuit breaker to shed load if DB saturates |\r
| Cache is cold after a restart | Thundering herd of misses hits the database simultaneously | Sudden DB load spike right after a deploy or restart | Rate-limit or queue the warm-up reads; short-lived request coalescing | Pre-warm cache on startup for known-hot keys; staggered rollout instead of full restart |\r
| Messages are duplicated | Depends on the consumer — data corruption if not idempotent | Duplicate operation IDs in logs, unexpected duplicate side effects | Consumer checks a stable operation ID before applying the side effect | Idempotent upserts everywhere; dedupe keys with a short TTL store |\r
| A consumer crashes mid-processing | The in-flight job stalls; message is redelivered after lock timeout | Job stuck in "processing" past expected duration | Message becomes visible again automatically; let it retry | State machine with per-stage status in durable storage (job/job-history table) |\r
| A message is poisoned | One bad message can block a partition/queue if not isolated | Retry count climbing for one message, queue depth rising behind it | Move to dead-letter queue after bounded retries; don't block the rest of the queue | Fix the producer/schema bug; replay from DLQ once corrected |\r
| Traffic increases 10x | Compute and dependency saturation, cascading into cache and DB | RPS graphs jumping, autoscaler triggering rapidly, error rate rising | Autoscale (HPA/KEDA), shed non-critical load, lean harder on cache | Load-test to your real ceiling beforehand; pre-provision for known events |\r
| One region goes down | All traffic served from that region fails until rerouted | Regional health checks failing, latency spike from one region only | Reroute traffic to healthy regions; automatic failover if configured | Multi-region active topology with tested, automated failover under 30s |\r
| A dependency becomes slow, not failing | Threads/connections pile up waiting; can cascade upstream | p99 latency climbing while error rate stays flat | Bounded timeouts, circuit breaker to fail fast instead of waiting | Set explicit timeout budgets per hop; bulkhead the dependency's resource pool |\r
| A bad deploy ships | Whatever the new code touches; could be everything | Error rate or latency regression right after a deploy marker | Automatic rollback on failed health checks | Progressive rollout (canary/staged), stronger pre-prod parity testing |\r
| A hot partition emerges | Throttling/latency for that one key's traffic only | 429s or high RU consumption concentrated on one partition | Add a synthetic sub-key to spread the hot key's load | Re-evaluate partition key design if the hot key is now a permanent pattern |\r
| A downstream service rate-limits you | Your calls to it start failing or queuing | 429/503 responses from that dependency climbing | Exponential back-off with jitter; queue and drain within their limit | Negotiate quota, or reduce call volume via caching/batching upstream |\r
| A schema change breaks a consumer | Anything reading the changed field/contract | Deserialization errors or unexpected nulls downstream | Roll back the producer change or add a compatibility shim | Versioned contracts; additive-only changes enforced by contract tests |\r
| A secret or certificate expires | Every caller relying on that credential, often across services | Auth failures spiking at a specific, predictable time | Emergency rotation; temporarily widen the affected calls if safe | Automated rotation with alerting well before expiry; move to Managed Identity to remove the secret entirely |\r
\r
## Four expanded walkthroughs\r
\r
### Cache down, and cache cold after a restart\r
\r
These are two different failure modes that get conflated. A cache that is simply **down** should degrade latency, not correctness — every read falls through to the database directly, and the fix is capacity: can the database absorb 100% of read traffic for the outage window? A cache that is **cold** after a restart is a different, sharper problem: every key misses at once, and if traffic is high, that's a thundering herd hitting the database in the same instant a normal steady-state cache would have absorbed almost entirely.\r
\r
\`\`\`mermaid\r
flowchart TD\r
    Restart["Cache restarted, empty"] --> Wave["First wave of requests<br/>all miss simultaneously"]\r
    Wave --> Risk{"Is DB capacity<br/>sized for 100% miss rate?"}\r
    Risk -->|no| Overload["DB saturates,<br/>latency spikes for everyone"]\r
    Risk -->|yes| Absorb["DB absorbs it,<br/>cache refills naturally"]\r
    Overload --> Fix["Pre-warm hot keys on startup,<br/>or stagger the restart"]\r
\`\`\`\r
\r
The mitigation in the moment is request coalescing — if ten requests miss on the same key within milliseconds, only one should actually hit the database while the others wait on that result — and the permanent fix is pre-warming known-hot keys before a planned restart, or staggering restarts across cache nodes so the whole cache is never empty at once.\r
\r
### Duplicate and poisoned messages in an event-driven pipeline\r
\r
Service Bus and similar brokers guarantee **at-least-once** delivery, which means duplicates are not a bug, they are the contract — the system must be designed assuming any message can arrive more than once. The fix is an idempotent consumer: before applying a side effect, check whether that operation, keyed by a stable ID, was already completed, and if so, skip or return the prior result instead of reapplying it.\r
\r
\`\`\`mermaid\r
sequenceDiagram\r
    participant Broker\r
    participant Consumer\r
    participant Store\r
    Broker->>Consumer: deliver message (op-id: 42)\r
    Consumer->>Store: has op-id 42 completed?\r
    Store-->>Consumer: no\r
    Consumer->>Store: apply effect, mark op-id 42 done\r
    Consumer->>Broker: complete message\r
    Broker->>Consumer: redeliver message (op-id: 42, duplicate)\r
    Consumer->>Store: has op-id 42 completed?\r
    Store-->>Consumer: yes - skip\r
    Consumer->>Broker: complete message\r
\`\`\`\r
\r
A **poisoned** message — one that will never process successfully, whether due to a data bug or an unsupported case — needs a different answer: bounded retries with exponential back-off for transient failures, and a hard cutoff after which the message moves to a dead-letter queue rather than being retried forever and blocking everything behind it in the same partition. The permanent fix pairs DLQ monitoring (depth and age, not just existence) with a safe, idempotent replay path once the underlying bug is fixed.\r
\r
### A certificate or secret expires in production\r
\r
This is one of the sharpest failure modes because it is entirely predictable and yet still causes real incidents — an expired certificate or secret doesn't degrade gracefully, it fails hard and simultaneously for every caller depending on it. A real version of this: an incorrect certificate update brought down a set of production applications; the immediate response was completing an emergency certificate rotation and redeploying the affected apps, restoring service. The retrospective lesson was that the failure mode should have been caught by a pre-expiry alert and a documented rotation playbook well before the certificate actually lapsed, not discovered by an outage.\r
\r
> [!DANGER]\r
> Secret and certificate expiry is one of the few failure modes that is entirely avoidable with monitoring alone — there is no "sudden" about it, the expiry date was always known. If your system has no alert firing weeks before expiry, that is the gap to close, not a forecasting problem.\r
\r
### One region goes down\r
\r
For a multi-region service, a single region failing should be a **latency and capacity** event for everyone else, not a correctness event. The mitigation is automatic: health checks detect the region is unhealthy, traffic reroutes to the remaining healthy regions, and a write region failover — if that region held the primary write role — promotes a healthy replica. The part worth stating explicitly in an interview is what happens *during* the failover window, typically tens of seconds: some in-flight requests may see elevated latency or a retryable error, which is why clients need sane retry logic, not just the backend needing a fast failover.\r
\r
## Structuring the answer: impact, mitigate, then diagnose\r
\r
When asked to talk through an incident, resist the instinct to start with root cause — that is the last thing to explain, not the first.\r
\r
\`\`\`\r
1. Impact first: who was affected, how badly, for how long.\r
2. Mitigate before you fully understand: the fastest safe action to stop the bleeding\r
   (rollback, failover, traffic shift, feature flag off) — before deep root-cause work.\r
3. Diagnose: what the metrics/logs/traces showed once things were stable.\r
4. Systemic fix: the change that prevents this *class* of incident, not just this instance.\r
\`\`\`\r
\r
> [!TIP]\r
> Interviewers specifically listen for whether you mitigate *before* you fully diagnose. Rolling back a bad deploy before you know exactly why it's bad is usually the right call — the fastest safe reversible action beats a slower, more certain one.\r
\r
## Biggest-incident story template\r
\r
Fill this in for your own worst incident before the interview — the shape below is worked from a real certificate-expiry outage; use it as the model, then build your own.\r
\r
| Field | Worked example | Your incident |\r
|---|---|---|\r
| What broke | A certificate update was applied incorrectly, breaking production applications that depended on it | _[fill in]_ |\r
| Blast radius | All traffic to the affected applications, full outage, not degraded | _[fill in]_ |\r
| How it was detected | Failures surfaced immediately across dependent apps once the cert was live | _[fill in]_ |\r
| Immediate mitigation | Completed an emergency certificate rotation and redeployed the affected apps | _[fill in]_ |\r
| Time to mitigate | _[fill in exact duration]_ | _[fill in]_ |\r
| Root cause | A certificate change was applied without the validation and rollout safeguards that would normally catch it | _[fill in]_ |\r
| Systemic fix | Established a rotation playbook and pre-expiry alerting so this class of failure is caught before it reaches production | _[fill in]_ |\r
| What you'd still improve | The playbook and alerting should have existed before the incident, not been created because of it | _[fill in]_ |\r
\r
## Cheat sheet\r
\r
- Prepare blast radius, detection signal, immediate mitigation, and permanent fix for every dependency you own — before the interview, not during it.\r
- Cache down should degrade latency, never correctness — bypass to the source of truth.\r
- A cold cache after a restart is a thundering-herd risk; pre-warm or coalesce, don't just "let it refill."\r
- At-least-once delivery means duplicates are the contract, not a bug — idempotent consumers are mandatory.\r
- Poisoned messages need bounded retries and a dead-letter queue, never infinite retry blocking the queue.\r
- Secret and certificate expiry is entirely predictable — the fix is alerting before expiry, not faster response after.\r
- Structure incident answers as impact, mitigate, diagnose, systemic fix — in that order, every time.\r
- Always have one real, specific biggest-incident story ready, with an honest "what I'd still improve."\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Starting an incident answer with root cause | Lead with impact and blast radius first |\r
| Treating "cache down" and "cache cold" as the same problem | Distinguish degraded latency from a thundering herd |\r
| Assuming a message broker prevents duplicates | Design every consumer to be idempotent by default |\r
| Retrying a poisoned message forever | Bound retries, then dead-letter it, then investigate |\r
| No answer for "what if this dependency is slow, not down" | Prepare timeouts and circuit breakers as a separate case from a hard failure |\r
| Having no real "biggest incident" story ready | Fill in the template above before the interview, honestly |\r
\r
## Summary\r
\r
"What if X breaks?" is answered well only by people who have already imagined the failure before being asked. Drill the scenario table against your own systems — blast radius, detection, immediate mitigation, permanent fix — and keep at least one real incident story ready in the impact-mitigate-diagnose-systemic-fix shape. The two failure modes candidates most often get wrong are treating "slow" the same as "down," and treating a cache outage as a correctness problem instead of a latency one — get those two distinctions right and most of this question becomes a rehearsed answer instead of an improvisation.\r
\r
## Top Interview Questions\r
\r
### Q1. What happens if your primary database goes down in production?\r
\r
For a multi-region setup, a single-region database outage should trigger automatic failover to a healthy read region within seconds, detected by regional health checks rather than a human noticing. The immediate blast radius is elevated latency and possibly a short window of errors during the failover itself, not a full outage, assuming the failover path has actually been tested rather than just configured. If the affected region held the primary write role, a promotion of a healthy replica needs to happen too, which is the part I'd want tested via regular failover drills rather than assumed to work the first time it's needed for real — an untested failover path is a common source of incidents that "should have" been non-events.\r
\r
### Q2. Walk me through what happens when your cache is completely unavailable.\r
\r
The read path bypasses the cache entirely and goes straight to the database, so the system stays correct but gets slower — every request now pays full database latency instead of a fast cache hit. The immediate risk is that 100% of read traffic suddenly lands on the database at once, so I'd want to know the database's capacity is sized to absorb that, or that there's a circuit breaker and load-shedding mechanism to protect it if it starts to saturate. I'd also expect an alert to fire on the cache-miss rate spiking, because that's the earliest signal something is wrong, well before user-facing latency complaints would surface.\r
\r
### Q3. What's different about a cache being cold after a restart versus a cache being down?\r
\r
A cache being down degrades gracefully — traffic bypasses it and the database absorbs the load, ideally within its capacity. A cache that's cold after a restart is sharper: every key misses simultaneously in a short window, which can create a thundering herd that spikes database load far more suddenly than a gradual cache-down scenario would. The fix for the cold-start case is different too — request coalescing so concurrent misses on the same key only trigger one database read, and pre-warming known-hot keys before a planned restart, or staggering restarts across cache nodes so the whole cache is never empty simultaneously.\r
\r
### Q4. How do you design a consumer to handle duplicate messages safely?\r
\r
I assume any message can be delivered more than once, since that's the actual contract of at-least-once delivery, not an edge case. Before applying a side effect, the consumer checks whether that operation — keyed by a stable ID tied to the business action, not the message's own delivery ID — has already been completed, using either a lookup against durable state or an upsert that's naturally safe to reapply. Only after the durable write succeeds does the consumer acknowledge the message. This is stronger than relying on broker-level deduplication settings alone, because duplicates can still slip through around retries, lock expiry, or a crash between processing and acknowledgment.\r
\r
### Q5. What do you do when a single message can't be processed no matter how many times you retry it?\r
\r
I separate transient failures from deterministic ones. A network timeout or a temporary downstream throttle deserves exponential back-off with jitter and a bounded number of retries. A message that fails because of a genuine data or schema problem should not consume that same retry budget pointlessly — after a defined threshold, it moves to a dead-letter queue with enough context to diagnose it, rather than blocking everything queued behind it in the same partition. The permanent fix pairs monitoring DLQ depth and message age — not just its existence — with a safe, idempotent replay path once the underlying producer or schema issue is actually fixed.\r
\r
### Q6. Your traffic just increased tenfold overnight. Walk me through what happens and what you'd do.\r
\r
The first things to feel it are compute for stateless services and request-unit throughput on the database, especially if the cache hit rate doesn't scale linearly with the new traffic mix. Autoscalers should add pods for the API tier automatically, and I'd lean harder on the cache — extending TTL slightly if the product tolerates it, and pre-warming known-hot keys if the spike is predictable, like a launch. If load keeps climbing past provisioned capacity, I'd shed non-critical traffic first — background jobs, less critical read paths — before degrading the core user-facing path. Afterward, the systemic fix is load-testing to the real ceiling ahead of time rather than discovering it live.\r
\r
### Q7. What happens if a downstream dependency becomes slow instead of failing outright?\r
\r
This is often more dangerous than a hard failure, because a slow dependency doesn't trip an obvious "it's down" signal — it just quietly holds connections and threads open, which can cascade upward and exhaust resources in the calling service too. The fix is a bounded timeout on every call to that dependency, paired with a circuit breaker that fails fast once a threshold of slow or failed calls is crossed, rather than letting every caller wait out the same slow dependency simultaneously. I'd monitor p99 latency to that specific dependency separately from its error rate, because a dependency can look "healthy" on error rate alone while still being dangerously slow.\r
\r
### Q8. Describe an incident where a secret or certificate expiring caused an outage, and what you'd do differently.\r
\r
An incorrect certificate update once brought down a set of production applications that depended on it, which is a particularly sharp failure mode because it's entirely predictable and yet still surprises people — the expiry date was always known in advance. The immediate response was completing an emergency certificate rotation and redeploying the affected applications to restore service. The retrospective lesson was that a pre-expiry alert and a documented rotation runbook should have existed before the incident, not been created because of it — which is exactly the kind of systemic fix that turns "we responded quickly" into "this can't happen again," and it's also part of why I've pushed toward Managed Identity elsewhere, since it removes the secret-expiry failure mode entirely.\r
\r
### Q9. How do you structure your answer when asked to walk through an incident you handled?\r
\r
I lead with impact — who was affected, how severely, for how long — before touching root cause at all, because that's what an incident commander or interviewer actually needs first. Then I describe the immediate mitigation: the fastest safe, often reversible action, like a rollback, a traffic shift, or disabling a feature flag, taken before I fully understood the root cause, because stopping the bleeding shouldn't wait on complete diagnosis. Only after that do I explain what the metrics, logs, or traces showed once things stabilized, and I close with the systemic fix — the change that prevents the whole class of incident, not just a patch for this specific instance.\r
\r
### Q10. What's a hot partition, how would you detect it, and what would you do about it?\r
\r
A hot partition is when a disproportionate share of traffic concentrates on one partition key's data, even if the key was chosen for good average-case distribution — a single unusually popular item can still create this. I'd detect it through elevated 429 throttling responses or request-unit consumption concentrated on one logical partition rather than spread evenly. The immediate mitigation is adding a synthetic sub-key to spread that specific hot key's traffic across several physical partitions. If the pattern is persistent rather than a one-off spike, that's a signal to revisit the partition key strategy itself, since a design that needs constant hot-key patches is telling you the original key assumption no longer holds.\r
\r
### Q11. A downstream service starts rate-limiting your calls. What do you do immediately, and what's the long-term fix?\r
\r
Immediately, I'd back off with exponential delay and jitter rather than hammering the dependency harder, and queue or shed the excess calls so the rate limit doesn't cascade into failures across my own service. I'd also check whether the calls could be batched or deduplicated in the moment — often a rate limit is hit because of redundant calls rather than genuinely necessary volume. Long-term, the fix is either negotiating a higher quota with the owning team if the traffic growth is legitimate, or reducing call volume structurally through caching or batching upstream so I'm not dependent on quota renegotiation every time traffic grows.\r
\r
### Q12. How do you prevent a schema change from breaking a downstream consumer?\r
\r
I treat contract changes as additive by default — new optional fields are safe, but renaming, removing, or changing the type of an existing field is a breaking change that needs a version bump or a coordinated migration, not a silent deploy. Contract tests between the producer and its known consumers catch this before it reaches production, and a consumer that unexpectedly hits a null or a deserialization error on a field it depends on is exactly the signal that this discipline slipped somewhere. If a breaking change genuinely is required, my default is to support both the old and new shape for a defined transition window rather than forcing every consumer to update in lockstep with the producer's release.\r
`;export{e as default};
