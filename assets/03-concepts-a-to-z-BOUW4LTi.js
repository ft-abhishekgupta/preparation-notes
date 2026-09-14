const e=`---\r
title: Concepts A to Z\r
description: A plain-English glossary of every technology and acronym used across this guide organised into eight categories with a concrete example\r
difficulty: Core\r
tags: [xbox, systems, glossary, azure, kubernetes]\r
---\r
\r
Every technology and acronym used anywhere in this guide — **96+ concepts across eight categories** — with a plain-English meaning and a concrete in-practice example. This is the fallback page whenever an unfamiliar term surfaces mid-conversation in one of the system deep-dives.\r
\r
## The concept map\r
\r
The eight categories are not separate lists — they form one operating system for taking a client request, doing useful work, and keeping that work safe and reliable.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    Client["Clientsplayers, publishers, tools"] --> API["API & resilienceFD / BFF, REST, retries"]\r
    API --> Security["Identity & network trustOAuth, S2S, mTLS, RBAC"]\r
    Security --> Runtime["Runtime platformcontainers, AKS, Istio"]\r
    Runtime --> Data["StateCosmos, Redis, SQL, Blob"]\r
    Runtime --> Messaging["Async workService Bus, Event Hubs"]\r
    Data --> Result["Player / publisher outcome"]\r
    Messaging --> Result\r
    Delivery["Delivery & scalingCI/CD, Flux, HPA, KEDA"] -. changes .-> Runtime\r
    Observability["Observabilitymetrics, logs, traces, IcM"] -. watches .-> API\r
    Observability -. watches .-> Runtime\r
    AI["AI & developer tooling MCP, RAG, tool calling"] -. helps operate .-> Delivery\r
    AI -. helps investigate .-> Observability\r
    classDef entry fill:#e6f0fb,stroke:#0a67c2;\r
    classDef secure fill:#fce9e8,stroke:#c23934;\r
    classDef run fill:#e8f5e8,stroke:#107c10;\r
    classDef state fill:#fbf3e2,stroke:#b7791f;\r
    classDef ops fill:#efe9fb,stroke:#6b46c1;\r
    class Client,API entry;\r
    class Security secure;\r
    class Runtime,Result run;\r
    class Data,Messaging state;\r
    class Delivery,Observability,AI ops;\r
\`\`\`\r
\r
Solid arrows show the request and data path; dotted arrows show the platform systems that deploy, scale, observe, and increasingly help operate that path.\r
\r
> [!KEY]\r
> Every term below belongs to exactly one of these eight categories, chained in the order above — client, security, runtime, state and messaging, watched by observability, changed by delivery, assisted by AI tooling.\r
\r
## Data & storage\r
\r
A typical read uses Redis for speed and Cosmos for durable state; writes use concurrency checks and can fan out through the change feed.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    API["Service read"] --> Cache{"Redis hit?"}\r
    Cache -->|yes| Fast["Return cached value"]\r
    Cache -->|no| Cosmos[("Cosmos DB")]\r
    Cosmos --> Partition["Partition keyroutes the request"]\r
    Partition --> RU["RU/s pays forthe operation"]\r
    RU --> Consistency["Consistency levelcontrols freshness"]\r
    Consistency --> CacheWrite["Store in Rediswith TTL"]\r
    CacheWrite --> Fast\r
    Write["Service write"] --> ETag{"ETag still current?"}\r
    ETag -->|yes| Cosmos\r
    ETag -->|no| Retry["Re-read and retry"]\r
    Cosmos --> Feed["Change feed"]\r
    Feed --> Worker["Downstream worker"]\r
    classDef cache fill:#fce9e8,stroke:#c23934;\r
    classDef db fill:#e8f5e8,stroke:#107c10;\r
    classDef concept fill:#e6f0fb,stroke:#0a67c2;\r
    class Cache,CacheWrite,Fast cache;\r
    class Cosmos,Feed db;\r
    class Partition,RU,Consistency,ETag,Retry concept;\r
\`\`\`\r
\r
Cache-aside connects Redis and Cosmos; partitioning and RU/s govern scale; ETags protect writes; the change feed drives reactions.\r
\r
| Term | Meaning, in practice |\r
|---|---|\r
| Cosmos DB | Globally-distributed NoSQL document store, replicated across regions — primary store for XEvents, XGeM, XProduct |\r
| Redis | In-memory key-value store, microsecond lookups — XEvents caches feed pages in Azure Managed Redis via Managed Identity |\r
| SQL Server | Relational tables, joins, strong transactions — XSale keeps sales records in Azure SQL via EF Core |\r
| Partition key | Field deciding which physical chunk stores a record; a bad key creates a hot partition — redesign cut p99 4x (600→150ms) |\r
| Blob Storage | Cheap unlimited store for large files, served over HTTP — client app bundles deploy here |\r
| Key Vault | Hardened secret store read at runtime — services reference \`@Microsoft.KeyVault(...)\` instead of hardcoding |\r
| Change feed | Live ordered stream of every Cosmos insert/update — workers react to catalog writes instead of polling |\r
| Request Units (RU/s) | Cosmos's per-operation cost budget; exceeding it throttles (429) — hot partitions are a classic throttling cause |\r
| ETag / optimistic concurrency | Version tag rejecting a write if the record changed first — lets two people edit a record safely |\r
| TTL (time-to-live) | Expiry timer that auto-deletes a record — Redis cache entries expire so reads eventually refresh from Cosmos |\r
| Consistency levels | Strong (always latest, slower) vs eventual (may lag, faster) — discovery paths favour eventual for scale |\r
| Cache-aside | Check Redis first, on miss read the database and populate Redis — the core of the XEvents 4x latency win |\r
| CDN | Edge-cached static content near users worldwide — app bundles and catalog data serve CDN-backed globally |\r
\r
## Messaging & events\r
\r
These patterns make async work durable, scalable, and safe when messages are delayed, duplicated, or invalid.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    Producer["Producer"] --> Tx["Business write + outboxone transaction"]\r
    Tx --> Publisher["Outbox publisher"]\r
    Publisher --> Topic["Service Bus topic"]\r
    Topic --> S1["Subscription A"]\r
    Topic --> S2["Subscription B"]\r
    S1 --> Queue["Queue / session"]\r
    Queue --> KEDA["KEDA watchesqueue depth"]\r
    KEDA --> Workers["Competing consumers"]\r
    Workers --> Guard{"Processed before?"}\r
    Guard -->|no| Work["Apply idempotent work"]\r
    Guard -->|yes| Skip["Ignore duplicate"]\r
    Work -->|transient failure| Retry["Retry + back-off"]\r
    Retry --> Workers\r
    Work -->|repeated failure| DLQ["Dead-letter queue"]\r
    Pressure["Backpressureconcurrency + prefetch"] -. limits .-> Workers\r
    Stream["Event Hubs"] --> Analytics["Replayable, high-volumestream consumers"]\r
    classDef source fill:#e6f0fb,stroke:#0a67c2;\r
    classDef broker fill:#fbf3e2,stroke:#b7791f;\r
    classDef worker fill:#e8f5e8,stroke:#107c10;\r
    classDef failure fill:#fce9e8,stroke:#c23934;\r
    class Producer,Tx,Publisher source;\r
    class Topic,S1,S2,Queue,Stream broker;\r
    class KEDA,Workers,Guard,Work,Skip,Analytics worker;\r
    class Retry,DLQ,Pressure failure;\r
\`\`\`\r
\r
Service Bus handles durable work items; Event Hubs handles replayable streams. Idempotency makes at-least-once delivery safe; retries, DLQs, and backpressure control failure.\r
\r
| Term | Meaning, in practice |\r
|---|---|\r
| Azure Service Bus | Reliable broker — a service drops a message on a queue/topic, another picks it up later — XSale publishes to \`offer-status\` |\r
| Event Hubs | High-volume, replayable event stream for millions of events/sec — powers publisher telemetry ingestion |\r
| Topics & subscriptions | Publish once, every subscription gets a copy — \`xgem-topic\` fans out to XProduct, caches, and workers |\r
| Dead-letter queue (DLQ) | Side-queue for repeatedly-failed messages so one poison message can't jam the pipeline |\r
| Idempotency | Doing an operation twice has the same effect as once — Service Bus consumers are written idempotent |\r
| Event-driven architecture | Services emit and react to events instead of calling and waiting — certification is a four-stage event pipeline |\r
| Competing consumers | Many workers share one queue, each message goes to exactly one — workers scale out on queue depth |\r
| Sessions & ordering | Groups related messages so one consumer processes them strictly in order — used for per-entity updates |\r
| Outbox pattern | Write the data change and outgoing message in one transaction, publish separately and reliably |\r
| At-least-once delivery | Duplicates are expected by design — consumers are made idempotent to absorb them safely |\r
| Backpressure | Concurrency and prefetch limits slow intake so a service degrades instead of exhausting memory |\r
\r
## Runtime & platform\r
\r
CI produces the image; GitOps describes deployment; Flux applies it; Kubernetes controllers continuously adjust health and capacity.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    Code["Code change"] --> CI["Azure DevOps CIbuild, test, scan"]\r
    CI --> Image["Container image"]\r
    Image --> ACR["Container registry"]\r
    CI --> Config["GitOps configHelm + Kustomize"]\r
    Config --> Flux["Flux reconciliation"]\r
    Flux --> Deploy["Kubernetes Deployment"]\r
    ACR --> Deploy\r
    Deploy --> RS["ReplicaSet"]\r
    RS --> Pods["Pods"]\r
    Gateway["Istio Gateway+ HTTPRoute"] --> Service["Kubernetes Service"]\r
    Service --> Pods\r
    HPA["HPACPU / memory"] -. changes replicas .-> Deploy\r
    KEDA["KEDAevent backlog"] -. changes replicas .-> Deploy\r
    VPA["VPApod requests"] -. changes pod size .-> Pods\r
    Probes["Readiness / liveness"] -. route or restart .-> Pods\r
    classDef build fill:#e6f0fb,stroke:#0a67c2;\r
    classDef desired fill:#efe9fb,stroke:#6b46c1;\r
    classDef runtime fill:#e8f5e8,stroke:#107c10;\r
    classDef control fill:#fbf3e2,stroke:#b7791f;\r
    class Code,CI,Image,ACR build;\r
    class Config,Flux desired;\r
    class Deploy,RS,Pods,Gateway,Service runtime;\r
    class HPA,KEDA,VPA,Probes control;\r
\`\`\`\r
\r
| Term | Meaning, in practice |\r
|---|---|\r
| Docker / containers | An app plus every library it needs, bundled into one portable image — every service builds a multi-stage .NET 8 image |\r
| Kubernetes & AKS | Schedules, restarts, scales, and networks containers; AKS is Azure's managed control plane — ~220 services run as pods |\r
| Helm | Package manager for Kubernetes; a chart templates all a service's YAML — \`xservicesinsightsfd\` deploys via a Helm release |\r
| Terraform | Infrastructure as Code, reproducible and PR-reviewable — provisions Cosmos, Key Vault, Grafana, identities |\r
| Flux (GitOps) | In-cluster agent reconciling the cluster to match a Git repo — \`Xbox.XPCi.GitOps\` is the source of truth |\r
| Kustomize | One base config plus environment overlays, no copy-paste — \`apps/base/<service>\` plus per-region overlays |\r
| HPA | Horizontal Pod Autoscaler; adds/removes replicas on CPU or memory — \`xsearchcore\`: 70% CPU, 20–30 pods |\r
| KEDA | Scales workers on an event signal like queue depth — a worker adds pods past ~5 pending messages |\r
| VPA | Vertical Pod Autoscaler; right-sizes each pod's CPU/memory requests — XPCi Forge recommends values from usage |\r
| Istio & Gateway API | Service mesh for traffic between services via sidecars; \`HTTPRoute\` defines ingress — public hostnames enter this way |\r
| Azure DevOps CI/CD | Builds, tests, and scans on every change, then hands off to GitOps to deploy |\r
| Pod / Deployment / ReplicaSet | A pod is one instance; a Deployment declares desired replicas a ReplicaSet maintains |\r
| Namespace | Logical folder isolating a service's resources and forming a security boundary — XSI runs in its own namespace |\r
| Liveness & readiness probes | Failed liveness restarts a pod; failed readiness pulls it from traffic until it recovers |\r
| Rolling update | Replaces pods a few at a time, zero downtime — every GitOps deploy can auto-rollback on failure |\r
| Canary & blue-green | Canary ramps a small % of traffic first; blue-green flips two full environments instantly |\r
| ConfigMap & Secret | Inject settings into pods without rebuilding the image; Secret is Key-Vault-backed |\r
| Sidecar | Helper container in the same pod handling cross-cutting concerns — Istio injects a proxy sidecar for the mesh |\r
| Container registry (ACR) | Versioned store for built images, pulled by tag — CI pushes, Flux/AKS pull to deploy |\r
| Reverse proxy & load balancer | Spreads requests across identical pods behind one stable address — the Istio gateway plus Service does this |\r
| Feature flags & flighting | Server-side on/off or partial-rollout switches with no redeploy — FD services gate experiments this way |\r
\r
## Observability\r
\r
Metrics tell you something is wrong, traces show where, logs explain what happened, and reliability targets decide urgency.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    Service["Service request"] --> Metrics["Prometheus metricsrate, errors, duration"]\r
    Service --> Logs["Geneva logsevents + context"]\r
    Service --> Traces["OpenTelemetry tracescross-service spans"]\r
    Metrics --> Grafana["Grafana dashboards"]\r
    Metrics --> SLI["SLI calculation"]\r
    SLI --> SLO{"SLO / error budgetat risk?"}\r
    SLO -->|yes| Alert["Alert rule"]\r
    Alert --> ICM["IcM incident"]\r
    ICM --> DRI["On-call DRI"]\r
    Grafana --> DRI\r
    Logs --> DRI\r
    Traces --> DRI\r
    TSG["TSG / runbook"] -. guides .-> DRI\r
    DRI --> Fix["Mitigate and verify"]\r
    classDef signal fill:#e6f0fb,stroke:#0a67c2;\r
    classDef view fill:#efe9fb,stroke:#6b46c1;\r
    classDef response fill:#fbf3e2,stroke:#b7791f;\r
    class Service,Metrics,Logs,Traces signal;\r
    class Grafana,SLI,SLO view;\r
    class Alert,ICM,DRI,TSG,Fix response;\r
\`\`\`\r
\r
| Term | Meaning, in practice |\r
|---|---|\r
| Prometheus | Scrapes counters from every service into queryable time-series — availability = non-5xx / total from \`http_incoming_request_total\` |\r
| Grafana | Turns Prometheus metrics into dashboards — access gated by "Grafana Viewers/Editors" AAD groups |\r
| Geneva | Structured event logs with no sensitive data — the DRI Assistant auto-analyses Geneva logs on an incident |\r
| OpenTelemetry | Distributed tracing stitching one request across services into spans — a platform-wide onboarding initiative |\r
| IcM & DRI | Incident-management system paging the on-call Directly Responsible Individual — alert → TSG mitigation → escalate |\r
| TSG, SLO & SLA | Troubleshooting guide, internal reliability target, and customer-facing promise — target is ~99.99% availability |\r
| SLI & error budget | Measured signal versus the target; the gap is how much failure you're allowed to spend |\r
| Percentiles (p50 / p99) | p50 is typical; p99 is the slowest 1% users actually notice — the news-feed win was framed as p99, not average |\r
| Cardinality | Unique label combinations a metric produces; high cardinality explodes storage — labels stay coarse, never per-user |\r
| Health check / heartbeat | Periodic "I'm alive" signal — silence triggers an alert before a user even complains |\r
| RED method | Monitor Rate, Errors, Duration to catch most problems — every service dashboard shows these three |\r
\r
## Security & identity\r
\r
Each hop proves a different identity and receives only the permissions needed for that hop.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    User["User"] -->|OAuth 2.0| Entra["Entra ID"]\r
    Entra -->|signed JWTclaims + scopes| FD["Front-door service"]\r
    FD -->|S2S token| Core["Core service"]\r
    Mesh["Istio zero-trust policy+ mTLS"] -. permits and encrypts .-> Core\r
    Core -->|workload identity| MI["Managed Identity"]\r
    MI --> RBAC{"Azure RBAC"}\r
    RBAC -->|data role| Cosmos[("Cosmos / Redis")]\r
    RBAC -->|secret access| KV["Key Vault"]\r
    KV -->|CSI runtime mount| Pod["Service pod"]\r
    PIM["JIT / PIM"] -. temporary human access .-> RBAC\r
    TLS["TLS + encryption at rest"] -. protects bytes .-> Cosmos\r
    classDef identity fill:#e6f0fb,stroke:#0a67c2;\r
    classDef policy fill:#fce9e8,stroke:#c23934;\r
    classDef resource fill:#e8f5e8,stroke:#107c10;\r
    class User,Entra,FD,Core,MI identity;\r
    class Mesh,RBAC,PIM,TLS policy;\r
    class Cosmos,KV,Pod resource;\r
\`\`\`\r
\r
| Term | Meaning, in practice |\r
|---|---|\r
| OAuth 2.0 / Entra ID | Entra ID is the identity provider; OAuth 2.0 issues short-lived tokens — FDs call \`AddFrontDoorAuthentication()\` |\r
| Service-to-service (S2S) | Signed tokens or certs prove one service's identity to another — Cores use \`AddCoreAuthentication()\` |\r
| Managed Identity | Passwordless identity for Azure access, no secret to leak — bound via a pod's workload identity |\r
| RBAC | Minimum role for the job, not broad admin — Prometheus access is \`Monitoring Reader\` |\r
| JIT access (PIM) | Elevated role only when needed, via Azure PIM — internal-tool groups are activated just-in-time |\r
| CVE & Component Governance | Catalogued vulnerabilities plus dependency scanning and remediation tracking — ongoing platform hygiene |\r
| mTLS | Both ends present certificates — encrypted and mutually verified — Istio does this between pods transparently |\r
| Zero trust | Never trust based on network location alone — a service only accepts explicitly allow-listed callers |\r
| JWT (claims & scopes) | Signed token carrying who-you-are and what-you-may-do, verified locally by the receiver |\r
| Encryption at rest & in transit | Data scrambled both stored and moving — Cosmos/Storage at rest, mTLS/TLS in transit |\r
| CSI Secret Store | Kubernetes driver mounting Key Vault secrets into a pod at runtime, never baked into images |\r
| CORS | Browser rule set for which origins may call an API — FD APIs allow only legitimate Partner Center origins |\r
\r
## AI & developer tooling\r
\r
The LLM supplies reasoning, retrieval supplies evidence, MCP supplies capabilities, and human approval controls side effects.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    Question["Engineer question"] --> Prompt["Prompt + context window"]\r
    Prompt --> Retrieve["RAG retrieval"]\r
    Docs["Docs, code, incidents,metrics"] --> Embed["Embeddings / index"]\r
    Embed --> Retrieve\r
    Retrieve --> LLM["LLM reasons overgrounded context"]\r
    LLM --> Plan{"Need live dataor an action?"}\r
    Plan -->|no| Answer["Grounded answer"]\r
    Plan -->|yes| MCP["MCP tool contract"]\r
    MCP --> Tool["ADO / IcM / Kubernetes /Prometheus tool"]\r
    Tool --> Evidence["Tool result"]\r
    Evidence --> LLM\r
    LLM --> Guard["Guardrailsscope + validation"]\r
    Guard --> Approval{"Write action?"}\r
    Approval -->|no| Answer\r
    Approval -->|yes| Human["Human approval"]\r
    Human --> Action["Execute action"]\r
    classDef input fill:#e6f0fb,stroke:#0a67c2;\r
    classDef ai fill:#efe9fb,stroke:#6b46c1;\r
    classDef tool fill:#e8f5e8,stroke:#107c10;\r
    classDef safety fill:#fbf3e2,stroke:#b7791f;\r
    class Question,Prompt,Docs,Embed,Retrieve input;\r
    class LLM,Plan ai;\r
    class MCP,Tool,Evidence,Answer,Action tool;\r
    class Guard,Approval,Human safety;\r
\`\`\`\r
\r
| Term | Meaning, in practice |\r
|---|---|\r
| MCP (Model Context Protocol) | Standard letting AI agents call tools and data sources uniformly — XPCi ships MCP servers for ADO, IcM, WorkIQ |\r
| Embeddings / RAG / Vector search | Vectors put similar things near each other; RAG grounds an answer in retrieved matches — copycat detection compares title embeddings |\r
| Fabric client | Typed SDK one service uses to call another — XEvents hydrates data via \`ICMSFabricClient\` |\r
| Microservices & monorepo | Many small independent services in one shared repository for tooling and standards — \`Xbox.Xbet.Service\` holds ~220 |\r
| LLM | A model predicting text to answer, summarise, or classify — GPT flags misclassified game genres in certification |\r
| Prompt & context window | Instruction plus data given to a model, bounded by how much it can hold at once |\r
| Tool calling | Lets an LLM invoke real functions instead of only producing text — XPCi Copilot queries live tools this way |\r
| Human-in-the-loop | AI recommends, a human approves and acts — production writes always need sign-off |\r
| Hallucination & guardrails | Confidently wrong output, mitigated by grounding, scoped access, and Responsible AI review before rollout |\r
| Cognitive Services | Azure's ready-made vision/language/moderation APIs — CertExtensibility moderates content through these |\r
\r
## Architecture & scaling patterns\r
\r
Statelessness lets any pod serve any request; sharding and replication scale and protect the data beneath it.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    Load["User load"] --> LB["Load balancer"]\r
    LB --> P1["Stateless pod"]\r
    LB --> P2["Stateless pod"]\r
    LB --> PN["More pods..."]\r
    HPA["HPA: horizontal scaling"] -. adds/removes .-> PN\r
    VPA["VPA: vertical scaling"] -. resizes .-> P1\r
    P1 & P2 & PN --> Cache[("Shared Redis cache")]\r
    P1 & P2 & PN --> Shards["Partitioned / sharded data"]\r
    Shards --> R1["Region A replica"]\r
    Shards --> R2["Region B replica"]\r
    R1 <--> Rep["Replication"]\r
    Rep <--> R2\r
    R1 --> HA["Active-active routing+ regional failover"]\r
    R2 --> HA\r
    CAP["CAP / consistency choice"] -. controls availabilityand freshness .-> Shards\r
    Test["Load testing"] -. validates latency,throughput and limits .-> Load\r
    classDef compute fill:#e6f0fb,stroke:#0a67c2;\r
    classDef data fill:#e8f5e8,stroke:#107c10;\r
    classDef scale fill:#fbf3e2,stroke:#b7791f;\r
    class Load,LB,P1,P2,PN compute;\r
    class Cache,Shards,R1,R2,Rep,HA data;\r
    class HPA,VPA,CAP,Test scale;\r
\`\`\`\r
\r
| Term | Meaning, in practice |\r
|---|---|\r
| Horizontal vs vertical scaling | Add more instances vs make each bigger; cloud prefers horizontal — HPA scales out, VPA scales each pod's size |\r
| Stateless services | No per-user memory between requests — session state lives in Redis/Cosmos instead of the pod |\r
| Eventual consistency | Replicas catch up shortly after a write, trading instant uniformity for speed — multi-region Cosmos converges quickly |\r
| CAP theorem | Can't keep perfect consistency and full availability across a network split — most read paths choose availability |\r
| Sharding | Splits a dataset across machines by a key — certification results shard by \`/certificationId\` |\r
| Replication | Synchronised copies across zones/regions so a failure never loses data — Cosmos replicates across five regions |\r
| High availability (HA) | No single point of failure via redundant pods, zones, and regions — services target ~99.99%+ |\r
| Multi-region / active-active | Several regions serving live traffic at once, absorbing each other's failover |\r
| Latency vs throughput | How fast one request finishes vs how many finish per second — Redis cuts latency, more workers raise throughput |\r
| Load testing | Synthetic traffic finds limits before real users do — weekly sales are load-tested before rollout |\r
\r
## Resilience & API design\r
\r
Protection starts at the edge, isolates each dependency, and falls back gracefully when the live path can't succeed.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    Client["Client"] --> BFF["FD / BFFREST API"]\r
    BFF --> Limit{"Rate limit"}\r
    Limit -->|allowed| Timeout["Timeout"]\r
    Limit -->|exceeded| Reject["429 response"]\r
    Timeout --> Bulkhead["Bulkheadisolated capacity"]\r
    Bulkhead --> Breaker{"Circuit breaker"}\r
    Breaker -->|closed| Call["REST / gRPCdependency call"]\r
    Call -->|transient failure| Retry["Bounded retrywith back-off"]\r
    Retry --> Call\r
    Call -->|success| Result["Full response"]\r
    Breaker -->|open| Fallback["Cached / partial fallback"]\r
    Timeout -->|expired| Fallback\r
    Retry -->|exhausted| Fallback\r
    Fallback --> Degraded["Gracefully degraded response"]\r
    Flags["Feature flag / kill switch"] -. disables risky path .-> BFF\r
    classDef edge fill:#e6f0fb,stroke:#0a67c2;\r
    classDef protection fill:#fbf3e2,stroke:#b7791f;\r
    classDef failure fill:#fce9e8,stroke:#c23934;\r
    classDef success fill:#e8f5e8,stroke:#107c10;\r
    class Client,BFF,Call edge;\r
    class Limit,Timeout,Bulkhead,Breaker,Retry,Flags protection;\r
    class Reject,Fallback failure;\r
    class Result,Degraded success;\r
\`\`\`\r
\r
| Term | Meaning, in practice |\r
|---|---|\r
| Circuit breaker | Trips when a dependency keeps failing, so calls fail fast instead of piling up |\r
| Retry, timeout & bulkhead | Retry with back-off, bound waiting with timeouts, isolate resources so one failure can't sink everything |\r
| Rate limiting / throttling | Caps requests per caller per window — gateways throttle noisy callers to keep the platform stable |\r
| REST API | Resources addressed by URL, acted on with HTTP verbs — 15+ REST APIs power the news-feed read path |\r
| gRPC & Protocol Buffers | Fast binary calls over a strict shared schema, used where internal performance matters most |\r
| BFF (Backend for Frontend) | A backend dedicated to one client, aggregating services into the shape that UI needs |\r
| Graceful degradation | Return a cached or partial fallback instead of an error when a dependency fails |\r
| Smart services, simple clients | Services decide layout and behaviour; clients just render — new behaviour ships server-side instantly |\r
\r
## Cheat sheet\r
\r
- Eight categories, one chain: client → API & resilience → identity & trust → runtime → state & messaging → watched by observability → changed by delivery → assisted by AI tooling.\r
- Cache-aside plus a versioned key is the default caching pattern; partition key choice is the highest-impact data decision.\r
- Idempotency plus retry plus DLQ is the default answer to "messages can be duplicated or fail."\r
- HPA scales pod count on CPU; KEDA scales pod count on queue depth; VPA resizes each pod.\r
- RED (rate, errors, duration) is the default answer to "what do you monitor."\r
- Zero trust plus S2S plus Managed Identity plus Key Vault answers "how do services trust each other."\r
- MCP plus RAG plus human-in-the-loop is the default shape of every AI tool in this guide.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Using a term without its concrete example | Pair every term with what it's for — partition key, RU/s, consistency level |\r
| Confusing Service Bus and Event Hubs | Service Bus is discrete work items; Event Hubs is a replayable high-volume stream |\r
| Treating HPA, KEDA, and VPA as interchangeable | HPA/KEDA change pod count on different signals; VPA changes pod size, not count |\r
| Calling every access-control mechanism "RBAC" | Distinguish RBAC (standing minimum role) from JIT/PIM (temporary elevation) |\r
| Assuming eventual consistency means "unreliable" | It means bounded, brief staleness traded deliberately for speed and availability |\r
| Describing AI tooling as unconstrained automation | Every write action here sits behind guardrails and human-in-the-loop approval |\r
\r
## Summary\r
\r
Ninety-six concepts collapse into eight categories that chain in one direction: a request passes through resilience and identity checks, runs on a shared container runtime, reads and writes shared state and messaging, gets watched by observability, gets changed by delivery tooling, and is increasingly assisted by AI tooling wrapped in guardrails. Most individual terms are variations on a handful of recurring ideas — cache-aside for reads, idempotency plus DLQ for async work, RED for monitoring, zero trust plus Managed Identity for trust — so the fastest way to retain this glossary is to notice which idea each new term is restating, rather than memorising all 96 in isolation.\r
\r
## Top Interview Questions\r
\r
### Q1. What's the difference between Azure Service Bus and Event Hubs, and how do you decide which to use\r
\r
Service Bus is built for discrete work items you want processed exactly once by one consumer — queues and topic subscriptions with per-message state like dead-lettering and sessions. Event Hubs is built for a high-volume, replayable stream that many independent consumers can read at their own pace. I'd choose Service Bus for a workflow step that must complete reliably, and Event Hubs for telemetry or analytics where volume is high and multiple readers need the same firehose.\r
\r
### Q2. Explain cache-aside and what happens when the cache and the database disagree\r
\r
Cache-aside checks Redis first; on a miss it reads Cosmos and writes the result back into Redis for next time. Disagreement is normally prevented by short TTLs and version-based cache keys — a data change bumps the version, which is effectively a new cache key, so stale entries simply age out rather than needing an explicit invalidation sweep. If Redis is unavailable entirely, the read path falls back to Cosmos directly at higher latency rather than failing.\r
\r
### Q3. Why does a bad partition key choice matter so much in Cosmos DB\r
\r
A partition key decides which physical partition stores and serves a given document, so a key with low cardinality or skewed access concentrates load onto one "hot" partition that throttles under RU pressure while the rest of the database sits idle. A well-chosen key spreads reads and writes evenly across the population, which is exactly the kind of redesign that turned a 600ms p99 into 150ms on the game-events read path.\r
\r
### Q4. How do idempotency, retries, and dead-letter queues work together in a messaging pipeline\r
\r
Messaging systems guarantee at-least-once delivery, so duplicates are expected, not exceptional — idempotent consumers make processing the same message twice harmless. Retries with back-off handle transient failures by trying again rather than giving up immediately. When a message keeps failing regardless, the DLQ pulls it out of the main flow so one poison message can't block everything behind it, and it can be inspected and replayed later.\r
\r
### Q5. What's the actual difference between HPA, KEDA, and VPA\r
\r
HPA and KEDA both change the number of pod replicas, but react to different signals — HPA to CPU/memory, KEDA to external event signals like Service Bus queue depth. VPA doesn't change replica count at all; it resizes each pod's CPU/memory requests based on historical usage. A CPU-bound API typically uses HPA, a queue-driven worker typically uses KEDA, and either can be paired with VPA for pod sizing, though combining HPA and VPA on the identical signal can make them fight each other.\r
\r
### Q6. How does zero trust actually get enforced between services here, beyond just a firewall rule\r
\r
Istio's \`AuthorizationPolicy\` defaults to deny, so a service must be explicitly allow-listed to call another service — being on the same network isn't sufficient. Layered on top, S2S tokens prove service identity, mTLS encrypts and authenticates the connection itself, and Managed Identity handles the separate hop from a service to Azure resources. No single layer is trusted alone; each hop re-proves identity.\r
\r
### Q7. What's the difference between an SLO, an SLI, and an error budget, and why do they matter together\r
\r
An SLI is the actual measured signal, like the percentage of non-5xx responses. An SLO is the target you commit to for that SLI, such as 99.99% availability. The error budget is the gap between 100% and the SLO — the amount of failure you're allowed to spend before you're expected to slow down risky changes and focus on stability. Together they turn "is it healthy" from a vague feeling into a number with a policy attached.\r
\r
### Q8. Why do you care about p99 latency specifically, rather than average latency\r
\r
Averages hide exactly the pain users notice — a handful of very slow requests can sit inside a perfectly good average while still being what a meaningful fraction of real users actually experience. p99 exposes the tail: the slowest 1% of requests. That's why the headline win on the news-feed read path was framed as p99 600ms to 150ms rather than an average latency number.\r
\r
### Q9. How does MCP change what an AI agent can actually do compared to a plain chatbot\r
\r
A plain chatbot only produces text from whatever was in its training or prompt. MCP gives an agent a standard way to call real tools and data sources — querying Prometheus, reading an incident in IcM, inspecting a Kubernetes resource — so its answers can be grounded in live, current evidence and it can take real actions rather than only describing what it thinks might be true.\r
\r
### Q10. What guardrails would you expect around an AI agent that has access to production tooling\r
\r
Read-only access by default, with any write action gated behind explicit human approval rather than autonomous execution. Retrieval-augmented grounding to reduce hallucination, scoped and validated tool contracts so the agent can't call anything outside its intended surface, and a Responsible AI review before anything reaches production. The pattern throughout this platform is "AI recommends, human approves and acts," not full autonomy.\r
\r
### Q11. Why choose eventual consistency for a read path instead of always reading the strongly consistent value\r
\r
Because strong consistency requires every read to confirm it has the absolute latest write, which costs latency and availability, especially across regions. For workloads like a news feed, a read being a few hundred milliseconds behind the latest write is invisible to the user, so trading a small, bounded staleness window for lower latency and higher availability is the right call — CAP theorem forces exactly this choice once a network partition is possible.\r
\r
### Q12. What's the practical difference between a circuit breaker and a simple retry policy\r
\r
A retry policy assumes the next attempt might succeed and tries again, usually with back-off, which is appropriate for genuinely transient failures. A circuit breaker assumes the dependency is currently broken in a sustained way and stops sending traffic to it entirely for a cooldown period, failing fast instead of piling up retries against something that isn't going to recover in the next few seconds. They're often used together: bounded retries for brief blips, a circuit breaker for sustained outages.\r
`;export{e as default};
