const e=`---\r
title: Back of the Envelope Estimation\r
description: How to turn a vague scale question into a few rounded numbers that justify your architecture, done out loud in under three minutes\r
difficulty: Foundational\r
tags: [estimation, capacity-planning, scalability, numbers]\r
---\r
\r
Estimation is not a maths exam — it is a tool you use mid-design to decide whether a component is even necessary. A design that fits on one database with replicas should not be sharded just because the problem sounds big; the arithmetic is what proves it.\r
\r
## Why this skill matters\r
\r
Every non-functional requirement eventually needs a number behind it. "Highly available" and "handles a lot of traffic" are not answers; "8.76 hours of downtime a year is acceptable, and we need to sustain roughly 5,000 requests per second at peak" is. Estimation converts a fuzzy requirement into a number you can compare against known hardware and service limits, which is what actually justifies "I need a cache here" or "one Postgres instance is enough."\r
\r
> [!KEY]\r
> The point of estimation is to **decide**, not to be precise. Round aggressively, say the rounding out loud, and move on the moment the number tells you what to do.\r
\r
## Powers of two and ten, memorised once\r
\r
You will convert between bytes and requests constantly. Keep these anchors in your head so you never do long division live.\r
\r
| Power of 2 | Value | Power of 10 | Value |\r
|---|---|---|---|\r
| 2¹⁰ | ~1 thousand (KB) | 10³ | 1,000 |\r
| 2²⁰ | ~1 million (MB) | 10⁶ | 1,000,000 |\r
| 2³⁰ | ~1 billion (GB) | 10⁹ | 1,000,000,000 |\r
| 2⁴⁰ | ~1 trillion (TB) | 10¹² | 1,000,000,000,000 |\r
| 2⁵⁰ | ~1 quadrillion (PB) | 10¹⁵ | 1,000,000,000,000,000 |\r
\r
\`2¹⁰ ≈ 10³\` is the single fact that makes every other conversion easy — treat "kilo, mega, giga, tera, peta" as roughly interchangeable between the binary and decimal worlds for interview purposes.\r
\r
## Latency numbers every engineer should know\r
\r
These numbers are the reference table you compare every design decision against. You do not need exact figures — you need the right **order of magnitude**.\r
\r
| Operation | Approximate latency | Why it matters |\r
|---|---|---|\r
| L1/L2 CPU cache reference | ~1 ns | Irrelevant at system-design level, but explains why in-process caches are fast |\r
| Main memory (RAM) reference | ~100 ns | Redis / in-process cache hits land here |\r
| SSD random read | ~0.1 ms | ~100,000 IOPS per device |\r
| Network round trip, same data center | ~0.5 ms | Cost of one extra service hop |\r
| HDD seek | ~10 ms | Rarely used for hot paths anymore |\r
| Network round trip, cross-region (US ↔ Europe) | ~80–150 ms | Why you replicate data close to users |\r
| TLS handshake | ~1–2 extra round trips | Terminate at the edge (CDN/LB), not per service hop |\r
\r
> [!TIP]\r
> Say it as a comparison, not a number: *"A cache hit is roughly 100,000x faster than a cross-region network call — that's why we cache close to the user, not just close to the database."*\r
\r
## From DAU to requests per second\r
\r
The standard chain is: daily active users → actions per user per day → total actions per day → divide by seconds in a day.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    D["Daily active users"] --> A["x actions per user per day"]\r
    A --> T["Total actions per day"]\r
    T --> S["÷ 86,400 seconds"]\r
    S --> R["Average RPS"]\r
    R --> P["x peak multiplier 2-10x"]\r
    P --> PK["Peak RPS"]\r
\`\`\`\r
\r
There are **86,400 seconds in a day** — memorise that one number, everything else follows.\r
\r
\`\`\`text\r
1,000,000 DAU x 10 actions/day = 10,000,000 actions/day\r
10,000,000 / 86,400 ≈ 116 average requests/second\r
\`\`\`\r
\r
### Read:write ratio\r
\r
Most consumer systems are read-heavy — a social feed might be read 100 times for every write (100:1), while a chat app is closer to 1:1, and a metrics ingestion pipeline is nearly all writes. State the assumed ratio explicitly, because it decides whether you need read replicas, a cache, or neither.\r
\r
| System type | Typical read:write | What it implies |\r
|---|---|---|\r
| Social feed / content platform | 100:1 to 1000:1 | Cache aggressively, read replicas, denormalize for reads |\r
| E-commerce catalog | 10:1 to 100:1 | CDN + cache for product pages, DB mainly for writes/checkout |\r
| Chat / messaging | ~1:1 | Optimize the write path as much as the read path |\r
| Metrics / logging ingestion | 1:1000+ (write-heavy) | Buffered writes, batching, a log-structured store |\r
\r
## Peak vs average traffic\r
\r
Average RPS tells you the steady-state cost; peak RPS tells you what you must actually provision for. A safe default multiplier is **2x for steady consumer traffic and up to 10x for bursty or event-driven traffic** (flash sales, live sports, breaking news).\r
\r
> [!WARNING]\r
> Never provision for average load. A system sized for 116 RPS average that actually sees 800 RPS at 8 p.m. every night will fall over exactly when it matters most. Always ask "how bursty is this?" before picking a multiplier.\r
\r
## Storage per record\r
\r
\`total storage = number of rows x bytes per row x replication factor\`, then optionally multiply by a retention window if data expires.\r
\r
\`\`\`text\r
1 billion rows x 500 bytes/row = 500 GB\r
x 3 replicas = 1.5 TB total\r
\`\`\`\r
\r
That comfortably fits on modern SSD-backed database instances — the arithmetic itself is the argument against premature sharding. Round every field size aggressively: a "tweet" is not 280 UTF-8 bytes plus metadata computed precisely, it is "call it 1 KB with metadata, done."\r
\r
## Bandwidth\r
\r
\`bandwidth = requests per second x average payload size\`. Do this for both directions — response bandwidth is usually the bigger number.\r
\r
\`\`\`text\r
10,000 requests/second x 100 KB average response = 1,000,000 KB/s = ~1 GB/s\r
\`\`\`\r
\r
Compare that number against a single server's NIC (often 10–25 Gbps ≈ 1.25–3 GB/s) to decide whether one machine, a small fleet, or a CDN offload is the right answer.\r
\r
## Memory for cache sizing\r
\r
Cache sizing follows the same recipe as storage, but you only size the **hot subset**, not the whole dataset — that is usually the entire point of caching.\r
\r
\`\`\`text\r
Working set = daily active items x average item size\r
1,000,000 hot products x 2 KB = 2 GB → fits in a single Redis instance easily\r
\`\`\`\r
\r
| Cache scenario | Hot set size | Fits in? |\r
|---|---|---|\r
| Session tokens for 10M DAU, 200 bytes each | ~2 GB | Single Redis node |\r
| Product cache, 5M SKUs, 2 KB each | ~10 GB | Single Redis node, or small cluster |\r
| Full news feed cache, 100M users, 5 KB feed each | ~500 GB | Sharded Redis cluster |\r
\r
## Worked example: Twitter-like feed\r
\r
- 200M DAU, each opens the feed 5 times/day → 1B feed reads/day → ~11,600 RPS average, say 30,000 RPS peak.\r
- Each user posts 0.5 times/day → 100M writes/day → ~1,150 writes/second average.\r
- Average follower fan-out of 200 → 100M writes x 200 = 20B feed insertions/day for a naive fan-out-on-write design — the number itself argues for a hybrid fan-out (skip precompute for celebrity accounts).\r
- Storage: 100M tweets/day x 1 KB x 3 replicas x 365 days ≈ 110 TB/year — large, but shardable by user or time, not a reason to panic.\r
\r
## Worked example: URL shortener\r
\r
- 1B new URLs, 500 bytes each (short code + long URL + metadata) → 500 GB total, x 3 replicas ≈ 1.5 TB. **One database with replicas is enough — no sharding needed.**\r
- Read:write ratio is redirect-heavy, often 100:1 — cache the hottest short codes and let the rest hit the database directly.\r
- Write RPS: 1B URLs / (365 x 86,400) ≈ 32 writes/second average — trivially low; the design problem here is almost entirely about read latency and ID collisions, not write throughput.\r
\r
## Worked example: video platform\r
\r
- 1M uploads/day, average 100 MB each → 100 TB/day raw ingest before transcoding — this number alone justifies an async transcoding pipeline instead of synchronous processing.\r
- Each video transcoded into 5 renditions roughly doubles total stored bytes (compression offsets multiple renditions) → budget object storage in the multi-hundred-TB/day range, tiered to cold storage after a retention window.\r
- Playback bandwidth dominates: 50M daily viewers x 10 minutes x 5 Mbps average bitrate ≈ multiple Tbps at peak — the number that justifies a CDN outright, because no origin fleet serves that alone.\r
\r
## Where the numbers land\r
\r
Every estimate above is only useful once it is pinned onto an actual architecture — the whole point of computing "500 GB, one database is fine" or "30,000 RPS peak, we need a cache" is to justify a specific box on the diagram you are about to draw. The reference design below is the kind of high-level shape these numbers typically feed into: a load balancer fanning out to stateless services, a cache sitting in front of the primary data store, and async workers peeling off anything that does not need to block the caller — each of those components should trace back to one of the estimates above, not appear because it "sounds like good architecture."\r
\r
![alt text](notes/HLD/image.png)\r
\r
## Cheat sheet\r
\r
- \`2¹⁰ ≈ 10³\` — the one fact that makes every unit conversion fast.\r
- **86,400 seconds/day** — memorise it, you'll use it every time.\r
- RAM ~100 ns, SSD ~0.1 ms, cross-region network ~100 ms — three numbers cover most latency comparisons.\r
- \`RPS = DAU x actions/day ÷ 86,400\`, then multiply by a peak factor of 2x–10x.\r
- \`storage = rows x bytes/row x replication factor\`, optionally x retention window.\r
- \`bandwidth = RPS x payload size\` — check both request and response direction.\r
- State the read:write ratio explicitly; it decides caching and replica strategy.\r
- Round every number to one significant figure and say the rounding out loud.\r
- The goal is a decision ("cache it", "one DB is fine", "we need a CDN"), not a precise figure.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Computing to three decimal places | Round to one significant figure — precision here is theatre |\r
| Doing estimation before requirements are scoped | Estimate after you know what to count |\r
| Silently doing the math in your head | Say every step out loud — the interviewer is scoring the reasoning, not the digit |\r
| Forgetting the peak multiplier | Average load numbers understate what you must provision for |\r
| Sizing the cache for the whole dataset | Size it for the hot working set only |\r
| Ignoring replication factor in storage math | Multiply by replica count (usually 3) before calling a number final |\r
| Treating the estimate as the final answer | Use it to justify the next design decision, then move on |\r
\r
## Summary\r
\r
Back-of-the-envelope estimation is a fast, rounded conversion from a business number (DAU, uploads/day) into an engineering number (RPS, GB, Gbps) that you compare against a small set of memorised latency and capacity figures. Done well it takes under three minutes, is always spoken aloud with visible rounding, and its only job is to justify the very next design decision — whether that is "we don't need a cache yet" or "this needs a CDN, full stop."\r
\r
## Top Interview Questions\r
\r
### Q1. How would you estimate the QPS for a system given only daily active users?\r
\r
Multiply DAU by average actions per user per day to get total daily actions, then divide by 86,400 seconds to get average requests per second. For example, 1M DAU doing 10 actions/day gives 10M actions/day, divided by 86,400 is roughly 116 RPS average. I'd then apply a peak multiplier — 2x for a steady consumer app, up to 10x for something bursty like a ticket sale — to get the number I actually design and provision for, since average load is not what causes outages.\r
\r
### Q2. Why do you multiply average RPS by a peak factor, and how do you choose the multiplier?\r
\r
Systems rarely see uniform traffic across the day; there are daily cycles (evening peaks), weekly cycles (weekends), and event-driven spikes (a product launch, breaking news, a flash sale). Designing only for the average means the system fails exactly when it matters most — at the peak. I pick the multiplier based on how "spiky" the domain is: a steady B2B SaaS tool might only see 2x between average and peak, while a ticket-sale or sports-streaming app can see 10x or more in a short window, which usually also pushes the design toward queueing and load shedding rather than just raw capacity.\r
\r
### Q3. How do you estimate storage requirements for a new feature, and what do people usually forget?\r
\r
I estimate \`number of records x average bytes per record\`, then multiply by the replication factor (commonly 3) and, if relevant, by a retention window. For example, 1 billion posts at 500 bytes each is 500 GB, which becomes 1.5 TB replicated. People commonly forget the replication multiplier, forget that indexes and metadata add meaningful overhead beyond the raw payload, and forget to ask whether data is retained forever or expires — a TTL or archival policy can shrink the real number by an order of magnitude.\r
\r
### Q4. Walk me through estimating bandwidth for an API and what decision it drives.\r
\r
Bandwidth is \`requests per second x average payload size\`, computed separately for request and response since responses are usually larger. For 10,000 RPS with a 100 KB average response, that is roughly 1 GB/second. I'd compare that against a single server's network interface capacity (commonly 10–25 Gbps, so roughly 1.25–3 GB/s) to decide whether one machine can serve it, whether I need a small fleet behind a load balancer, or whether the payload is large/static enough that a CDN should absorb most of that bandwidth instead of my origin servers.\r
\r
### Q5. A candidate says "we'll need to shard the database" for a system storing 500 GB of data. How do you respond?\r
\r
I'd push back with the numbers: modern managed database offerings comfortably handle multiple terabytes on a single primary with read replicas, so 500 GB alone is not a sharding trigger. I'd ask what specific limit is actually being hit — is it write throughput (a single instance tops out around 10,000-20,000 writes/second), connection count, or something else? Sharding adds significant operational complexity (routing, rebalancing, cross-shard queries), so it should only be introduced once the arithmetic shows a specific ceiling is being approached, not because the total data size sounds large.\r
\r
### Q6. How would you size a cache for a product catalog with 5 million SKUs?\r
\r
I would not cache all 5 million SKUs by default — I'd estimate the hot working set, typically the top 10-20% of items that generate the majority of traffic under a Pareto-style access pattern. If each item is roughly 2 KB serialized and I decide to cache the top 20%, that's 1 million items x 2 KB = 2 GB, which fits comfortably in a single Redis instance with headroom. I would size for the working set, monitor the actual hit ratio in production, and grow the cache or add eviction tuning if the hit ratio falls below a target like 80-90%.\r
\r
### Q7. Why is 86,400 seconds per day a number worth memorising, and what other numbers do you keep on hand?\r
\r
It is the divisor in almost every "DAU to RPS" calculation, and doing that division live wastes time and invites arithmetic errors under pressure. Alongside it I keep: \`2^10 ≈ 10^3\` for unit conversions, RAM access at roughly 100 nanoseconds, SSD access at roughly 0.1 milliseconds, and a cross-region network round trip at roughly 100 milliseconds. These handful of anchors let me reason about almost any capacity or latency question by comparison rather than by recalling a fact I never memorised.\r
\r
### Q8. How precise should your estimation math be in an interview, and why?\r
\r
Deliberately imprecise — round every number to one significant figure and say so out loud, for example "call it 100 million users, 10 requests each, so roughly a billion requests a day." The interviewer is scoring whether you know which numbers matter and whether you can reach a decision quickly, not whether you can do long division on a whiteboard. Over-precision is actually a mild red flag: it suggests you don't understand that the estimate exists to justify a decision, not to be the deliverable itself.\r
\r
### Q9. How do you estimate for a write-heavy system like a metrics ingestion pipeline differently from a read-heavy one?\r
\r
For a write-heavy system, the read:write ratio flips — I'd state something like 1:1000 (mostly writes) and focus the estimation on sustained write throughput and storage growth rate rather than cache hit ratios. I'd estimate ingestion rate (events per second across all sources), the average event size, and from those derive required broker throughput and daily storage growth, which usually points toward a log-structured or time-series store and a buffering/batching layer at the edge rather than a traditional cache-in-front-of-database pattern used for read-heavy systems.\r
\r
### Q10. If you estimate 30,000 peak RPS for a service, how do you translate that into "how many servers do I need"?\r
\r
I'd estimate the capacity of a single instance for this specific workload — for example, if a typical stateless app server instance handles roughly 1,000-2,000 requests/second comfortably before CPU saturation, then 30,000 peak RPS needs roughly 15-30 instances, and I'd round up and add headroom (say, target 60-70% utilization per instance) for safety margin and to survive one instance failing. I'd say explicitly that this per-instance number is itself an estimate that should be validated with a load test, not treated as exact.\r
\r
### Q11. How does estimation change your answer to "should this be a cache-aside pattern or a CDN?"\r
\r
I'd compare the payload's cacheability and audience size. If the estimate shows content is largely static, requested by a geographically distributed audience, and bandwidth-heavy (like the video platform example — multiple Tbps at peak), a CDN is the right layer because no origin fleet is cost-effective at that bandwidth. If instead the estimate shows a smaller, frequently-changing, per-user dataset (like a personalized feed) with a working set that fits in gigabytes, an application-level cache like Redis close to the origin makes more sense. The estimated scale and volatility of the data drives which caching layer is worth the complexity.\r
\r
### Q12. What would you do if, mid-interview, your rough estimate turns out to be wrong once you dig into a deep dive?\r
\r
I'd say so immediately and recompute rather than defend the original number: *"Actually, given the fan-out ratio we just discussed, my write estimate was too low — let me redo that."* Estimation is meant to be revisited as new information about the system emerges during the design; treating an early rough number as sacred once better information is available is a worse signal than openly correcting it. The willingness to update the estimate live is itself part of what is being evaluated.\r
`;export{e as default};
