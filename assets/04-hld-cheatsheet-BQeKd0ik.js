const e=`---\r
title: HLD Cheatsheet\r
description: One dense revision sheet spanning the interview framework, the pattern catalogue, the toolbox, and worked problem playbooks\r
difficulty: Core\r
tags: [system-design, cheatsheet, interview-strategy, patterns]\r
---\r
\r
This is a single-sheet revision document, not a tutorial — every topic below has its own full explanation elsewhere on this site, and the point here is density: the framework script, the pattern catalogue, the toolbox tables, and the problem playbooks you want available in your head with nothing left to derive live. There is no single right answer in a system design interview; you're graded on problem navigation, solution design, technical excellence, and communication, not on matching a reference diagram.\r
\r
> [!KEY]\r
> Say the generic concept first, then the product name: *"I need a partitioned, durable, ordered log — Kafka, or Event Hubs on Azure."* This reads as understanding the concept independent of any one vendor's API.\r
\r
## The 60-minute script\r
\r
\`\`\`mermaid\r
flowchart LR\r
    R["1. Requirements<br/>5 min"] --> E["2. Entities<br/>2 min"]\r
    E --> A["3. API<br/>5 min"]\r
    A --> D["4. Data Flow<br/>5 min"]\r
    D --> H["5. High-Level Design<br/>10-15 min"]\r
    H --> P["6. Deep Dives<br/>10 min"]\r
\`\`\`\r
\r
| Interview type | Flow |\r
|---|---|\r
| **Product design** (Uber, WhatsApp, Twitter, Netflix) | Requirements → Entities → API → HLD → Deep dives |\r
| **Infra design** (rate limiter, message queue, LB) | Requirements → **system interface** (in/out) → **data flow** → HLD → Deep dives |\r
\r
## Requirements and non-functional trade-offs\r
\r
Functional requirements are verbs — ask targeted questions as if talking to a product owner, pick the top three, and explicitly park the rest as out of scope. Non-functional requirements must be **quantified**; walk the mnemonic **SCALE For Cloud DesignS** to make sure you covered the ground:\r
\r
| Letter | Dimension | Ask yourself |\r
|---|---|---|\r
| **S** | Scalability | Read or write heavy? Bursty? DAU? |\r
| **C** | Consistency | CAP — pick C or A (P is a given) |\r
| **A** | Availability | Uptime target? Degraded mode acceptable? |\r
| **L** | Latency | p99 budget? (<100ms = "low latency") |\r
| **E** | Environment | Mobile, low bandwidth, region |\r
| **F** | Fault tolerance | What can die? Any SPOF? |\r
| **C** | Compliance | GDPR, PCI-DSS, HIPAA, residency |\r
| **D** | Durability | Can we ever lose a write? RPO/RTO? |\r
| **S** | Security | AuthN/AuthZ, encryption, abuse |\r
\r
> [!NOTE]\r
> CAP forces consistency-or-availability only during a network partition; day to day, PACELC's latency-vs-consistency trade-off is the one you're actually making. The consistency spectrum, quorum reads/writes, and the nines table all have their own full page in this curriculum — here they're one line each: **strong** (linearizable) → **bounded staleness** → **session/read-your-writes** → **eventual**. The same system can mix levels per field.\r
\r
## Numbers to know\r
\r
| Storage | Latency | Throughput |\r
|---|---|---|\r
| RAM / in-process | ~100 ns | millions reads/s |\r
| SSD | ~0.1 ms | ~100,000 IOPS |\r
| HDD | ~10 ms | 100-200 IOPS |\r
| Network, same DC | ~0.5 ms | — |\r
| Network, cross-region | ~80-150 ms | — |\r
\r
| Component | Single-instance capacity | Scale when… |\r
|---|---|---|\r
| **Cache** (Redis) | ~1ms, 100k+ ops/s, up to 1TB | hit rate <80%, latency >1ms, memory >80% |\r
| **Database** | up to 50k TPS, 10-20k writes/s, <5ms cached read | writes >10k TPS, uncached read >5ms |\r
| **App server** | 100k+ conns, 8-64 cores, 64-512GB RAM | CPU >70%, latency > SLA |\r
| **Message broker** | ~1M msgs/s/broker, <5ms, 50TB | ~800k msgs/s, growing consumer lag |\r
\r
**Back-of-envelope recipe** — do this *during* the design, not before:\r
\r
| Step | Formula |\r
|---|---|\r
| RPS | \`DAU × actions/day ÷ 86,400\` |\r
| Peak | \`avg × 2 (steady) to 10 (bursty)\` |\r
| Storage | \`rows × bytes/row × replication factor\` |\r
| Bandwidth | \`RPS × payload size\` |\r
\r
> [!TIP]\r
> \`2¹⁰ ≈ 10³\` makes every unit conversion fast. And: **1B rows × 500B = 500GB → fits on one machine with replicas.** Don't shard because the problem sounds big — do the math and let the number decide.\r
\r
## Core entities and API design\r
\r
Entities are the nouns pulled straight from the functional requirements (\`User\`, \`Tweet\`, \`Follow\`). API design turns each requirement into an endpoint:\r
\r
| Paradigm | Use when | Cost |\r
|---|---|---|\r
| **REST** *(default)* | CRUD over resources | over/under-fetching |\r
| **GraphQL** | diverse clients, data-rich UIs | POST-only, N+1, hard to cache |\r
| **gRPC** | internal service-to-service, streaming | needs HTTP/2, not human-readable |\r
| **WebSocket / SSE** | real-time features | stateful, needs infra support |\r
\r
**Design rules:** resources are plural nouns, no verbs (\`POST /users/{id}/activate\` for actions); path = identity, query = filter/sort/page, body = payload; never put \`userId\` in the path or body — take it from the auth token; paginate offset by default, cursor for real-time/high-volume feeds; version in the URL; return structured, actionable errors.\r
\r
| Method | Idempotent | Safe | Body |\r
|---|---|---|---|\r
| GET | ✅ | ✅ | ❌ |\r
| POST | ❌ | ❌ | ✅ |\r
| PUT | ✅ | ❌ | ✅ |\r
| PATCH | ❌* | ❌ | ✅ |\r
| DELETE | ✅ | ❌ | ❌ |\r
\r
Status codes worth naming: \`200/201/202/204 · 301/304 · 400/401/403/404/409/412/422/429 · 500/502/503/504\`. Caching headers: \`Cache-Control\`, \`ETag\` + \`If-None-Match\` → \`304\`, and **\`If-Match\` + ETag = optimistic concurrency over HTTP**.\r
\r
| Need | Use |\r
|---|---|\r
| User-facing web/mobile | **JWT** (stateless) or session + Redis (revocable) |\r
| Service-to-service | mTLS, API key + request signing, or managed identity |\r
| Delegated login | **OAuth 2.0** (+ OIDC for identity) |\r
| Permissions | **RBAC** (default) · ABAC (flexible) · ACL (doesn't scale) |\r
\r
Pattern: short-lived access token (~15 min) + long-lived rotating refresh token. JWT is \`header.payload.signature\` — Base64, not encryption, so never put secrets in the payload.\r
\r
## High-level design and building-block vocabulary\r
\r
Start simple, satisfy one API at a time, and add a component only when a requirement forces it.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    CL["Clients"] --> CDN["CDN / Edge"]\r
    CL --> LB["Load Balancer"] --> GW["API Gateway"]\r
    GW --> RSVC["Read Service"]\r
    GW --> WSVC["Write Service"]\r
    RSVC --> CA[("Cache")]\r
    RSVC --> RR[("Read Replicas")]\r
    WSVC --> DB[("Primary DB")]\r
    WSVC --> Q[["Queue"]] --> WK["Workers"]\r
    WK --> OS[("Object Store")]\r
    DB -->|"replication"| RR\r
\`\`\`\r
\r
One database can serve several microservices — simpler, still fault tolerant via replication. Split read and write services only when their scaling profiles genuinely differ. Add an API gateway once you have more than one service.\r
\r
| Block | What it does |\r
|---|---|\r
| **Load balancer** | Distributes traffic + health checks — round-robin, least-connections, IP hash, weighted, consistent hashing, geo |\r
| **L4 vs L7** | L4 = TCP/UDP, fast, WebSockets; L7 = HTTP-aware routing on URL/header/cookie |\r
| **API gateway** | Routing, authN, rate limiting, aggregation, versioning |\r
| **Service mesh** | Sidecar proxies: mTLS, retries, circuit breaking, tracing |\r
| **Object storage** | Blob/S3/GCS — flat namespace, immutable, durable. Never store files in the DB |\r
| **Scheduler** | Cron/delayed work — Quartz, K8s CronJob, Durable Functions timers |\r
\r
## The eight core patterns\r
\r
Pick the pattern that matches the bottleneck, then walk its escalation ladder — cheapest fix first, and stop at the rung the requirements actually demand.\r
\r
\`\`\`mermaid\r
flowchart TD\r
    S{"What's the hard part?"}\r
    S -->|"Read latency"| P1["Scaling reads"]\r
    S -->|"Write throughput"| P2["Scaling writes"]\r
    S -->|"Push to clients"| P3["Real-time updates"]\r
    S -->|"Shared resource"| P4["Contention"]\r
    S -->|"Multi-service flow"| P5["Multi-step workflow"]\r
    S -->|"Big files"| P6["Large blobs"]\r
    S -->|"Slow job"| P7["Long-running task"]\r
    S -->|"Find nearby"| P8["Proximity + search"]\r
\`\`\`\r
\r
### Pattern 1 — Scaling reads\r
\r
\`Index/denormalize/vertical → read replicas/sharding → cache\`. Skewed access → cache; uniform access → replicas. Cache stampede → request coalescing + jittered TTL. Hot key → shard the key + in-process fallback. Stale cache → delete-on-write + cache versioning.\r
\r
| Strategy | Write path | Best for |\r
|---|---|---|\r
| **Cache-aside** *(default)* | write DB, invalidate cache | general |\r
| Write-through | cache + DB together | read-heavy, frequently updated |\r
| Write-back | cache now, DB async | write-heavy (risk: loss) |\r
\r
### Pattern 2 — Scaling writes\r
\r
\`Vertical + right DB → shard/partition → queue + shed load → batch/aggregate\`. Write-heavy → Cassandra-style LSM (append-only, reads suffer); Postgres rewrites a B-tree per insert.\r
\r
| Strategy | Idea | Watch out |\r
|---|---|---|\r
| **Consistent hashing** *(default)* | ring + virtual nodes | needs a good hash fn |\r
| Range | key ranges per shard | hot shards (timestamps) |\r
| Directory | lookup service → shard | extra hop, SPOF |\r
\r
Good shard keys: high cardinality, evenly distributed, matches the query (\`userId\`, \`orderId\`). Bad: timestamp, low-cardinality status.\r
\r
### Pattern 3 — Real-time updates\r
\r
Two independent decisions: **client transport** and **server-to-server propagation**.\r
\r
| Transport | Use when |\r
|---|---|\r
| Polling *(default)* | seconds of latency acceptable |\r
| SSE | server → client only: dashboards, notifications, token streaming |\r
| WebSocket | full duplex: chat, collab editing — needs L4 LB, heartbeats |\r
| WebRTC | peer-to-peer: video/audio, gaming |\r
\r
| Propagation | Use when |\r
|---|---|\r
| Consistent hashing + coordinator | persistent connections that must scale |\r
| **Pub/Sub** *(default)* | many clients want the same update |\r
\r
Redis Pub/Sub = simple, no durability. Kafka = complex, durable, replayable. Celebrity fan-out → batching + hierarchical distribution. Ordering across servers → funnel through one stamping point, or vector clocks.\r
\r
### Pattern 4 — Contention and race conditions\r
\r
\`\`\`mermaid\r
flowchart TD\r
    A["1. Conditional write"] --> B["2. Optimistic concurrency"]\r
    B --> C["3. Pessimistic lock"]\r
    C --> D["4. Distributed lock"]\r
    D --> E["5. Serialize via queue"]\r
\`\`\`\r
\r
Conditional write: put the check in the \`WHERE\` clause so compare-and-set is one statement. Optimistic: version/ETag + retry — beware the **ABA problem**, use a monotonic version. Pessimistic: \`SELECT ... FOR UPDATE\` — beware deadlocks, grab locks in deterministic order. Distributed lock (Redis \`SET NX\` / Blob lease / Zookeeper) once the lock must outlive a transaction — beware TTL expiring mid-work, fix with **fencing tokens**. Write skew (reads/writes on different rows conflicting) → \`SERIALIZABLE\` isolation, or better, collapse to one row.\r
\r
### Pattern 5 — Multi-step workflows\r
\r
| Approach | How | Cost |\r
|---|---|---|\r
| **Saga + compensation** | sequential local txns, compensate in reverse on failure | compensations can fail too |\r
| **Choreography** | durable log (Kafka), workers react | hard to see the whole flow |\r
| **Orchestration** | Temporal/Step Functions — workflow + idempotent activities | extra infra |\r
| **2PC** | coordinator prepares then commits all | blocking, coordinator SPOF |\r
\r
Exactly-once step → idempotency key + state check before replay. Unbounded history → keep payloads small, continue-as-new. Dual write to DB + queue → **outbox pattern**, never write to two systems without it.\r
\r
### Pattern 6 — Large blobs\r
\r
Never proxy big files through app servers.\r
\r
\`\`\`mermaid\r
sequenceDiagram\r
    participant C as Client\r
    participant S as Metadata Service\r
    participant B as Object Store\r
    C->>S: request upload\r
    S-->>C: presigned URL, TTL + limits\r
    C->>B: PUT chunks directly\r
    B-->>S: event notification\r
    C->>B: download via CDN\r
\`\`\`\r
\r
Presigned URL/SAS = temporary, scoped direct upload/download. Resumable uploads = client chunking + session id, track via checksum, stitch on complete. State-sync problem (file in blob, metadata in DB) → storage event notifications + periodic reconciliation. Skip this pattern under ~10MB or when synchronous inspection is required.\r
\r
### Pattern 7 — Long-running tasks\r
\r
Split the request: return a job id (\`202 Accepted\`), process async.\r
\r
| Queue | Notes |\r
|---|---|\r
| **Kafka** *(default at scale)* | append-only log, replay, fan-out |\r
| RabbitMQ | smart broker, routing, DLQ |\r
| SQS | managed, 1MB msgs, visibility timeout |\r
\r
Worker crash → redelivery via heartbeat/visibility timeout. Repeated failure → **DLQ**. Duplicate work → idempotency keys. Mixed workloads → separate queues/pools by task size.\r
\r
### Pattern 8 — Proximity and search\r
\r
| Need | Index |\r
|---|---|\r
| Nearby places | Geohash (prefix-matched string), Quadtree, **R-tree** *(production default)* |\r
| Real-time location | Redis GEO |\r
| Full-text search | Inverted index (Elasticsearch/AI Search) |\r
\r
Plain lat/long B-tree indexes fail — one dimension returns a thin strip across the globe. At modest scale, Postgres + PostGIS + pg_trgm beats standing up a search cluster.\r
\r
## Data modeling and indexes\r
\r
| Model | Use when |\r
|---|---|\r
| **Relational** *(default)* | structured, ACID, joins |\r
| **Document** | nested/evolving schema |\r
| **Key-value** | cache, sessions, flags |\r
| **Wide-column** | massive writes, time series |\r
| **Search** | full text, facets, geo |\r
\r
Enforce constraints as close to the persistence layer as possible (\`UNIQUE(user_id, business_id)\`), not in application code. Normalize by default, denormalize in the cache.\r
\r
| Index | Good at |\r
|---|---|\r
| **B-tree** *(default)* | equality + range + sort |\r
| Hash | exact match only |\r
| LSM tree | write-heavy, time series |\r
| Composite | multi-column filter+sort — column order matters (leftmost prefix) |\r
| Covering | query served entirely from the index |\r
\r
Indexes speed reads, slow writes, cost storage — check the query plan before adding one.\r
\r
## Rate limiting\r
\r
| Algorithm | Trade-off |\r
|---|---|\r
| Fixed window | simplest, 2x burst at the boundary |\r
| Sliding window counter | good accuracy, cheap — great default |\r
| **Token bucket** *(most common)* | allows controlled bursts (Stripe/AWS) |\r
| Leaky bucket | smooths to constant outflow, adds latency |\r
\r
Enforce at the gateway/middleware. Respond \`429\` + \`Retry-After\`. Distributed: one central Redis is exact but a hotspot; per-node local limits are fast but approximate.\r
\r
## Unique ID generation\r
\r
| Method | Sortable | Notes |\r
|---|---|---|\r
| UUID v4 | ❌ | random, poor B-tree locality |\r
| **UUID v7 / ULID** | ✅ | timestamp prefix + random — modern default |\r
| **Snowflake** | ✅ | \`timestamp + node + sequence\`; needs clock sync |\r
| Ticket/range server | ✅ | each node reserves a block, hands out locally |\r
\r
Don't leak sequential business IDs publicly — expose an opaque id.\r
\r
## Probabilistic data structures\r
\r
| Structure | Answers | Use case |\r
|---|---|---|\r
| **Bloom filter** | "definitely not in the set?" (no false negatives) | crawler dedupe, cache-miss avoidance |\r
| **HyperLogLog** | unique count, ~0.8% error in ~12KB | unique visitors |\r
| **Count-Min Sketch** | approximate frequency | trending topics, heavy hitters |\r
| Redis ZSET | exact top-N, ranges | leaderboards |\r
\r
## Distributed coordination\r
\r
| Concept | Meaning |\r
|---|---|\r
| **Quorum** | \`W + R > N\` ⇒ strong consistency |\r
| **Consensus** | Raft/Paxos — leader + replicated log, needs a majority |\r
| **Coordination service** | Zookeeper (ZAB), etcd (Raft) — config, registry, locks |\r
| **Split brain** | two leaders at once → fencing tokens + quorum promotion |\r
| **Clocks** | Lamport timestamps (causal order) or vector clocks (detect concurrency) |\r
\r
> [!WARNING]\r
> Avoid rolling your own consensus. Lean on etcd/ZooKeeper or a managed service, and keep the coordination surface as small as possible.\r
\r
## Event-driven patterns\r
\r
| Pattern | Solves |\r
|---|---|\r
| **Outbox** | dual-write problem — write business row + outbox row in one txn, relay publishes |\r
| **Inbox/dedupe** | duplicate consumption — record processed message ids |\r
| **CDC** | keep search/cache in sync without dual writes |\r
| **CQRS** | reads and writes need different models/scale |\r
| **Event sourcing** | audit/time-travel — event log is the source of truth, add snapshots |\r
\r
## Networking essentials\r
\r
| Topic | Know |\r
|---|---|\r
| DNS | name → IP, TTL controls caching, GeoDNS/anycast for routing |\r
| TCP vs UDP | TCP reliable/ordered; UDP fire-and-forget (video, WebRTC, QUIC) |\r
| HTTP/2 vs HTTP/3 | HTTP/2 multiplexes over TCP; HTTP/3 runs over QUIC/UDP, no head-of-line blocking |\r
| TLS | terminate at the edge; mTLS for service identity |\r
\r
## Reliability and operations\r
\r
| Concern | Answer |\r
|---|---|\r
| Network failures | timeouts + exponential backoff **with jitter**, idempotent APIs, circuit breakers |\r
| Circuit breaker | Closed → Open (threshold) → Half-open (test) → Closed |\r
| Bulkhead | isolate resource pools per dependency so one hot path can't starve the rest |\r
| SPOF | redundancy, replication, health checks + failover, multi-AZ |\r
| Observability | Logs + Metrics (RED/USE) + Traces, correlated by a request id |\r
| Deployment | rolling · **blue-green** (instant rollback) · **canary** (staged, metric-gated) |\r
| Regionalization/DR | active-active (conflict handling) vs active-passive; define RPO and RTO |\r
\r
## Azure technology map\r
\r
Say the generic concept first, then the product.\r
\r
| Need | Azure | OSS |\r
|---|---|---|\r
| Global L7 LB + CDN | **Front Door** | Nginx + Varnish |\r
| API gateway | **API Management** | Kong, Envoy |\r
| Relational DB | **Azure SQL DB** | PostgreSQL |\r
| NoSQL / multi-model | **Cosmos DB** | MongoDB, Cassandra |\r
| Cache | **Azure Cache for Redis** | Redis |\r
| Object storage | **Blob Storage** | MinIO |\r
| Search | **Azure AI Search** | Elasticsearch |\r
| **Message broker (queue/topic)** | **Service Bus** | RabbitMQ |\r
| **Event stream (log)** | **Event Hubs** | Kafka |\r
| **Event routing** | **Event Grid** | CloudEvents |\r
| Workflow orchestration | **Durable Functions** | Temporal, Airflow |\r
| Real-time push | **SignalR Service** | Socket.IO |\r
| Distributed lock | **Blob lease**, Redis \`SET NX\` | ZooKeeper, etcd |\r
\r
\`\`\`mermaid\r
flowchart TD\r
    Q{"What are you moving?"}\r
    Q -->|"A command, once"| SB["Service Bus"]\r
    Q -->|"A high-volume stream"| EH["Event Hubs"]\r
    Q -->|"A notification"| EG["Event Grid"]\r
\`\`\`\r
\r
**Service Bus** = RabbitMQ/SQS analogue: sessions, DLQ, duplicate detection, scheduled messages. **Event Hubs** = Kafka analogue: partitions, consumer groups, offsets, replay, Capture-to-Blob. **Event Grid** = EventBridge analogue: filters, push routing, retry up to 24h, dead-letter to Blob.\r
\r
**Cosmos DB in one box:** globally distributed, multi-model, partitioned NoSQL. Throughput in **RU/s** (a 1KB point read ≈ 1 RU). Partition key must be high-cardinality, evenly distributed, and present in the hot query. Consistency is a tunable 5-level dial (Strong → Bounded Staleness → **Session***(default)* → Consistent Prefix → Eventual). **Change feed** drives materialized views and the outbox pattern. \`ETag\` + \`If-Match\` gives optimistic concurrency built in. \`429\` means RU throttling — back off and retry.\r
\r
## Problem playbooks\r
\r
| Problem | Core pattern | Key moves |\r
|---|---|---|\r
| **URL shortener** | Scaling reads | Base62 global counter (not a hash), 302 redirect, cache + CDN, 1B×500B = 500GB fits one DB + replicas |\r
| **File sync (Dropbox)** | Large blobs | Presigned URL, client chunking, resume via saved state, sync via \`GET /changes?since=\` |\r
| **Video platform** | Blobs + long tasks | Upload → queue → transcoding workers → adaptive bitrate + manifest, CDN, view counts in Redis |\r
| **Ticketing** | Contention | Redis distributed lock + TTL to reserve seats, virtual queue over SSE, heavy read caching for event pages |\r
| **Auction** | Contention + real-time | Optimistic locking on the bid row, Kafka for durability/ordering, SSE for the live high bid |\r
| **News feed** | Scaling reads/writes | Fan-out on write, hybrid skip for celebrities, sharded + replicated post cache |\r
| **Chat (WhatsApp)** | Real-time | WebSocket + Redis Pub/Sub, inbox DB for offline messages, sequence numbers to detect gaps |\r
| **Live comments** | Real-time | SSE, consistent hashing to co-locate viewers, CDN snapshots for mega-streams |\r
| **Ride sharing (Uber)** | Proximity + contention | Redis geospatial for driver locations, distributed lock per ride request, geo-sharding |\r
| **Local search (Yelp)** | Proximity + search | Elasticsearch (inverted + geo) synced via CDC, or Postgres + PostGIS at modest scale |\r
| **Ad click aggregator** | Scaling writes / streaming | Kafka → stream processor windowed aggregation → OLAP, signed impression id against fraud |\r
| **Metrics monitoring** | Scaling writes / time series | Agent buffering + batching → stream → time-series DB, rollups + cache for dashboards |\r
| **Web crawler** | Long-running tasks | Frontier queue → fetcher → separate parser stage, visibility timeout + DLQ, dedupe via bloom filter |\r
| **Notification system** | Multi-step + isolation | Fan out bulk campaigns into single notifications, bulkhead isolates OTPs from bulk traffic |\r
| **Payment system** | Multi-step + integrity | PaymentIntent + transactions, request signing, event sourcing for audit, reconciliation worker |\r
\r
## Communication rules and closing checklist\r
\r
**Do:** drive the conversation, always justify a choice ("stateless reads, so horizontal scaling is trivial"), frame every choice as **BAD → GOOD → GREAT**, do the math before calling something a bottleneck, name the generic concept then the product, surface edge cases proactively.\r
\r
**Don't:** make vague claims ("we'll just add a cache"), quote scale numbers with no context, jump to Kafka/microservices/sharding before the simple design is shown to break, silently redesign without narrating.\r
\r
| Dimension | Did I cover it? |\r
|---|---|\r
| Availability | replicas, multi-AZ/region, health checks, no SPOF |\r
| Latency | cache, CDN, index, connection reuse, right region |\r
| Consistency | which parts are strong, which are eventual, and why |\r
| Durability | replication, WAL, backups, RPO/RTO |\r
| Scalability | stateless services, shard key, autoscale triggers |\r
| Failure modes | retries + backoff + jitter, circuit breaker, DLQ, idempotency |\r
| Security | authN/authZ, encryption, rate limiting, secrets |\r
| Observability | logs, metrics, traces, alerts on SLO burn |\r
\r
## Cheat sheet\r
\r
- No single right answer — you're graded on problem navigation, solution design, technical excellence, communication.\r
- SCALE For Cloud DesignS covers the non-functional ground; quantify every one you name.\r
- \`2¹⁰ ≈ 10³\`, 86,400 seconds/day, RAM ~100ns, SSD ~0.1ms, cross-region ~100ms — the numbers that justify every other decision.\r
- Never put \`userId\` in the path or body; take it from the auth token.\r
- Pick the pattern that matches the bottleneck, then walk its ladder — stop at the rung the requirements demand.\r
- Outbox pattern any time you write to a database and a queue in the same operation.\r
- Idempotency keys make retries safe; fencing tokens make expiring locks safe.\r
- Say the generic concept, then the specific product — on Azure, Service Bus is commands, Event Hubs is streams, Event Grid is notifications.\r
- Close every answer with a trade-off named out loud, not a silent diagram.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Naming every building block before a requirement forces it | Start simple, add components only when justified |\r
| Treating CAP as a permanent global choice | It only forces a decision during a partition; day-to-day it's PACELC's latency/consistency trade-off |\r
| Reaching for a distributed lock by default | Try a conditional write first |\r
| Choosing choreography for a long branching workflow | Switch to orchestration once you can't see the whole flow |\r
| Writing to a DB and a queue without an outbox | Always wrap both in one transaction plus a relay |\r
| Indexing lat/long with a plain B-tree | Use a geohash/S2/H3 key or a 2D-aware tree |\r
| Quoting scale numbers with no comparison point | Always compare against the capacity table |\r
\r
## Summary\r
\r
This sheet compresses the whole interview into five layers: the 60-minute script that sequences the interview itself, the requirements checklist that quantifies what "good" means, the eight-pattern catalogue that covers almost every deep dive, the toolbox of indexes/rate-limiting/IDs/coordination/events/networking/reliability primitives that the patterns are built from, and the problem playbooks that show how real prompts combine them. Use it to jog memory mid-interview and to sanity-check that you're reaching for the tool the requirements actually justify, not the first one that comes to mind.\r
\r
## Top Interview Questions\r
\r
### Q1. How do you decide between REST, GraphQL, and gRPC for a new API?\r
\r
REST is the default for straightforward CRUD over resources with a single client shape. GraphQL earns its complexity when multiple diverse clients need different shapes of the same underlying data and over/under-fetching with REST would be genuinely painful — at the cost of cache-ability and a harder N+1 problem. gRPC is for internal service-to-service calls where performance and strong typing matter more than human readability, and where you control both ends of the call so the lack of native browser support isn't a blocker.\r
\r
### Q2. What's the difference between optimistic and pessimistic locking, and how do you choose?\r
\r
Pessimistic locking holds a row lock for the duration of the transaction, blocking anyone else from touching it — the right choice when collisions are frequent, because failing fast on a lock wait is cheaper than repeatedly retrying a doomed write. Optimistic concurrency reads a version, writes conditionally on that version being unchanged, and retries on conflict — the right choice when conflicts are rare, since it avoids holding a lock at all in the common case. The trap with optimistic concurrency is the ABA problem — a value that changed and changed back — fixed by using a strictly monotonic version rather than any reusable value.\r
\r
### Q3. Explain the outbox pattern and why a service can't just write to its database and publish to a queue directly.\r
\r
Writing to a database and publishing to a queue are two separate systems with no shared transaction — if the database commit succeeds and the publish fails (or the reverse), the two systems disagree about what happened, and there's no way to roll one back without the other. The outbox pattern writes the business row and an outbox row describing the event in one local database transaction, then a separate relay process (or CDC reading the database log) publishes the outbox row and marks it sent — this is atomic because both writes are guaranteed by the same transaction, at the cost of the relay delivering at-least-once, so consumers must be idempotent.\r
\r
### Q4. When would you reach for Kafka/Event Hubs instead of a traditional message broker like RabbitMQ/Service Bus?\r
\r
Kafka-style logs are the right choice when you need very high throughput, replay capability, or many independent consumer groups reading the same stream at their own pace — think clickstream ingestion, IoT telemetry, or an event source multiple downstream systems each need to consume independently. A traditional broker like RabbitMQ or Service Bus is the better fit for task-queue-shaped work — commands that should be processed once, need per-message dead-lettering, or benefit from smart routing — because the broker actively tracks delivery and retry state per message rather than leaving that to the consumer.\r
\r
### Q5. What's a fencing token and what specific problem does it solve that a plain TTL-based lock doesn't?\r
\r
A TTL-based distributed lock can expire while the holder is still working — a long garbage-collection pause or network hiccup can make the holder believe it still owns the lock after another process has already acquired it, leading to two processes both thinking they safely own the critical section. A fencing token is a monotonically increasing number issued alongside the lock; the protected resource itself checks that incoming writes carry a token at least as large as the last one it accepted, rejecting a "zombie" write from a process that lost the lock without knowing it, even if that process is still convinced it holds it.\r
\r
### Q6. How would you estimate whether a design needs sharding, using the back-of-envelope recipe?\r
\r
I'd multiply rows by average bytes per row by replication factor — a billion rows at 500 bytes each is 500GB, times three replicas is 1.5TB, which comfortably fits on one modern managed database instance with room to spare. I'd only consider sharding once a specific number in the capacity table is actually being approached — write throughput past roughly 10k TPS for a single instance, for example — rather than sharding because the raw data size sounds large. The estimate's whole job is to turn "this feels big" into a number I can compare against a known ceiling.\r
\r
### Q7. What's the practical difference between the Service Bus, Event Hubs, and Event Grid triad on Azure, mapped to their open-source equivalents?\r
\r
Service Bus is the RabbitMQ/SQS-shaped option: a smart broker handling a discrete command that should be processed once, with sessions, dead-lettering, and duplicate detection built in. Event Hubs is the Kafka-shaped option: a partitioned, durable, replayable log for high-volume streams where the consumer tracks its own offset. Event Grid is the EventBridge-shaped option: lightweight, filtered routing of discrete notification events out to handlers, with retry and dead-lettering but no replay. Picking between them is really picking between "a command," "a stream," and "a notification."\r
\r
### Q8. A candidate reaches for a circuit breaker to fix a slow downstream dependency. Is that the right tool, and what else might be needed?\r
\r
A circuit breaker is the right tool for preventing cascading failure — once a dependency is failing past a threshold, it stops sending requests immediately rather than letting them queue up and time out slowly, giving the dependency room to recover. But it doesn't fix the slowness itself, and it doesn't protect your own system's resources from being exhausted by requests to *other* dependencies while this one is degraded — that's what a bulkhead does, by isolating resource pools per dependency so one bad dependency can't starve calls to a healthy one. The two are usually paired, not substitutes for each other.\r
\r
### Q9. Why does the cheat sheet recommend geohash, S2, or H3 over a plain database index for proximity search, and how do you choose among the three?\r
\r
A plain B-tree index handles one dimension well, but latitude and longitude together are two-dimensional — indexing them naively returns thin, physically meaningless slices rather than a genuine radius. Geohash, S2, and H3 all solve this by encoding two dimensions into one sortable key, but they differ in shape assumptions: geohash is simplest and works well for general point lookups (used inside Redis), S2 specifically corrects for the earth's curvature near the poles (used by MongoDB), and H3's hexagonal cells give uniform neighbour distance, which matters for ride-sharing-style "nearest N drivers" queries (used by Uber).\r
\r
### Q10. How do RPO and RTO differ, and how do they drive a disaster recovery design?\r
\r
RPO (recovery point objective) is how much data you can afford to lose, measured in time — an RPO of five minutes means you must replicate or back up frequently enough that at most five minutes of writes are ever at risk. RTO (recovery time objective) is how long you can afford to be down before service is restored. A low RPO drives synchronous or near-synchronous replication despite the latency cost; a low RTO drives active-active or hot-standby architectures over cold backups, since restoring from a cold backup is measured in hours, not seconds. Naming both numbers, not just "we have backups," is what makes a DR answer credible.\r
\r
### Q11. What's the danger of applying every reliability pattern — retries, circuit breakers, bulkheads, timeouts — to every single call in a system?\r
\r
Layering every pattern everywhere adds real operational and cognitive cost without proportional benefit: a retry on a non-idempotent call risks duplicate side effects, a circuit breaker on a call that's never actually the bottleneck adds complexity for no gain, and stacking all four patterns on every dependency makes failure behaviour hard to reason about and debug when something does go wrong. The stronger answer is to apply each pattern deliberately to the specific dependency and failure mode it addresses — retries for idempotent, transient-failure-prone calls, circuit breakers for dependencies that can cascade, bulkheads for resource pools genuinely at risk of being starved by one bad neighbour.\r
\r
### Q12. If you could only remember five things from this entire cheat sheet walking into an interview, what would they be?\r
\r
The 60-minute script's five phases, so you always have a next move. SCALE For Cloud DesignS, so you never state a non-functional requirement without a number attached. The eight-pattern selector — read scaling, write scaling, real-time, contention, workflows, blobs, long-running tasks, proximity — so any deep dive maps to a known escalation ladder. The back-of-envelope recipe, so "is this actually a bottleneck" is always a calculation, not a guess. And the outbox pattern, because "write to a database and a queue" shows up constantly and getting it wrong is one of the most common silent correctness bugs in a design.\r
`;export{e as default};
