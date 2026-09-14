const e=`---\r
title: XEvents and XGuide\r
description: The Xbox engagement platform where publishers announce in-game events and players discover them across every console, PC and mobile surface\r
difficulty: Core\r
tags: [xbox, xevents, cosmos-db, redis]\r
---\r
XEvents and XGuide are the two halves of the Xbox engagement platform. Publishers use XEvents to announce season launches, tournaments and limited-time sales; XGuide serves those events back to players across every Xbox surface. The platform now reaches more than 7 million monthly players through 70-plus onboarded publishers, and it is also the foundation a newer initiative — the News Feed System — was built inside of rather than shipped as a separate service.\r
\r
## What it is\r
\r
The platform splits cleanly into a write side for publishers and a read side for players, and both sit on top of the same core service.\r
\r
### Write side — authoring\r
\r
Publishers use the web Events Editor to create, schedule, localize and manage events. It calls \`XGuideSelfServeFD\`, the self-serve front door, which routes into the core business logic. Every action — draft, publish, unpublish, delete — passes through the same self-serve pipeline, so the write path never touches the player-facing front door directly, and a bad publisher request can't degrade reads.\r
\r
### Read side — discovery\r
\r
\`XGuideFD\` serves the read APIs that player surfaces query directly: Featured, Active, Coming Soon, Ending Soon, events filtered by product, and follow/unfollow state. It is backed by Cosmos DB for durable storage and a Redis cache in front of it, which is what makes it possible to serve reads at close to 5,000 requests per second without hammering Cosmos on every call.\r
\r
> [!NOTE]\r
> A separate initiative, the News Feed System, migrates the 600-plus publisher Official Clubs news feed into XEvents as a new News Post content type, with its own Cosmos containers, a versioned Redis cache and an Event Hub engagement pipeline. It reuses this platform's authoring and read front doors rather than standing up new ones — see the dedicated page for that build.\r
\r
## Architecture\r
\r
Everything funnels through one XEvents core service. Publishers write through the self-serve front door, four different player surfaces read through the guide front door, and an async worker keeps cached views and CMS content fresh in the background so neither front door has to do that work inline.\r
\r
\`\`\`mermaid\r
flowchart TB\r
    Pub["Publishers (70+)"] -->|author| ED["Events Editor<br/>web SPA (client repo)"]\r
    ED -->|create / update / delete| SS["XGuideSelfServeFD<br/>self-serve front door"]\r
    SS --> XE["XEvents service<br/>core logic"]\r
    XE --> CMS["CMS / Campsite"]\r
    XE --> Cos[("Cosmos DB")]\r
    XE --> Rd[("Redis cache")]\r
    XE --> W["XEventsWorker<br/>async category refresh + CMS sync"]\r
    W --> Cos\r
    XG["XGuideFD<br/>read front door"] -->|read APIs| XE\r
    XG --> S1["Xbox Events App"]\r
    XG --> S2["Xbox App (PC)"]\r
    XG --> S3["Console Mercury"]\r
    XG --> S4["Console Home"]\r
    classDef g fill:#e8f5e8,stroke:#107c10;\r
    class XE,XG,SS g;\r
\`\`\`\r
\r
Publishers author in the Events Editor, which calls \`XGuideSelfServeFD\` into the XEvents service; XEvents persists to Cosmos, fronts reads with Redis, and hands category refresh and CMS sync to an async worker. \`XGuideFD\` then serves those events read-only to four player surfaces: the Xbox Events App, the Xbox App on PC, and the Mercury and Home experiences on console.\r
\r
| Direction | System | Why |\r
|---|---|---|\r
| Upstream (in) | Events Editor (Partner Center client) | Publisher authoring UI |\r
| Reads from | CMS / Campsite (\`ICMSFabricClient\`) | Merchandiser-driven content and layout |\r
| Hydrates via | ProductDetails, XboxLiveSocial | Enrich events with product and social data |\r
| Stores in | Cosmos DB and Azure Managed Redis | Persistence and high-QPS read cache |\r
| Downstream (out) | Four player surfaces, and now the News Feed | Where players discover events |\r
\r
## Data and request flow\r
\r
**Publish flow.** A publisher edits an event in the Events Editor SPA. The SPA calls \`XGuideSelfServeFD\`, which authenticates the publisher and forwards the request to \`XEventsBusinessLogicV2\` — the save, publish, unpublish and delete flow. That logic decides whether the event still lives on legacy storage or has already migrated to Cosmos, writes the change, and leaves category refresh and CMS synchronization to \`XEventsWorker\` rather than blocking the publisher's request on it.\r
\r
**Read flow.** A player surface calls \`XGuideFD\` for a category — Featured, Active, Coming Soon, Ending Soon, by product, or a follow list. \`XGuideBusinessLogic\` fans that single call out to CMS layout, XEvents and ProductDetails, and \`XEventsCosmosBusinessLogic\` serves the actual event data from a snapshot-backed in-memory cache in front of Cosmos. Only a cache miss falls through to Cosmos itself, which is what keeps p99 latency low even at close to 5,000 requests per second.\r
\r
| Component | Role |\r
|---|---|\r
| XEvents (Core) | Owns event business logic and Cosmos persistence |\r
| XEventsWorker | Async category refresh and CMS sync |\r
| XGuideFD | Read front door for player surfaces |\r
| XGuideSelfServeFD | Write front door for publisher authoring |\r
| Cosmos DB | Durable event and follow storage |\r
| Managed Redis | Read cache in front of Cosmos |\r
| Service Bus | Async messaging between core and worker |\r
| CMS / Campsite | Merchandiser-driven layout content |\r
\r
## Under the hood\r
\r
XEvents' Cosmos database (\`XEvents\`) holds \`EventMetadata\` and \`EventFollows\` as its own core containers, alongside the containers the News Feed System shares on the same account. Publisher media uploads land in the \`xeventseditorv2\` blob container, with table storage and a dedicated Key Vault (\`kv-xe-xbs-prod-eus\`) backing secrets, and the service authenticates via workload identity rather than static credentials. \`PublisherAuthorizationProvider\` resolves Campsite seller membership and product permissions, which is the mechanism that decides which publisher can author which event — the same authorization model the News Feed System reuses for its own title-fence checks.\r
\r
On the read side, \`XGuideBusinessLogic\` is the aggregation entry point: a single guide-read call fans out to CMS layout, XEvents and ProductDetails concurrently rather than serially, and \`XEventsCosmosBusinessLogic\` is specifically the accelerated Cosmos channel/event read path, backed by the snapshot and in-memory cache described above.\r
\r
## The hard problems\r
\r
**Cutting front-door load without a rewrite.** \`XGuideFD\` used to sit directly on a legacy dependency chain that pushed 336K requests per minute through the service and pinned CPU at 117% under peak load — meaning the process was throttling rather than just busy. The fix was not adding more replicas; it was moving the read path onto Cosmos DB with a redesigned partition key, so that the vast majority of category reads resolved from a snapshot cache instead of re-querying the same event data on every call. Load on \`XGuideFD\` fell from 336K to 46K RPM, an 87% cut, purely from serving smarter rather than serving harder.\r
\r
**Keeping writes off the read path.** Publisher writes and player reads share the same underlying event store, but they never share the same front door or the same request path. Writes flow through \`XGuideSelfServeFD\` into the core save/publish/unpublish/delete logic; reads flow through \`XGuideFD\` into a cache-first path. That separation means a spike in publisher activity — a large publisher bulk-scheduling events before a launch — cannot directly slow down the read path millions of players hit every day.\r
\r
**Cutting over with zero downtime.** Moving the read path onto Cosmos plus a redesigned cache while the service kept serving live traffic meant the cutover had to be incremental and reversible. The snapshot refresher (\`XEventsSnapshotRefresher\`) and the async worker exist specifically so that cache population and CMS sync can run continuously in the background, letting the new path warm up and be validated against production traffic before the legacy path was retired.\r
\r
> [!WARNING]\r
> A cache-first read path is only as safe as its invalidation story. Because \`XGuideFD\` serves Featured/Active/Coming Soon views that change on a schedule (an event going live at a specific time), the snapshot refresher has to run frequently enough that "cache hit" doesn't mean "stale by hours" — this is the trade-off behind the async worker's refresh cadence.\r
\r
## Scale and reliability\r
\r
| Metric | Value |\r
|---|---|\r
| Monthly reach | 7M+ unique players |\r
| Publishers onboarded | 70+ |\r
| Events published | 100+ per month |\r
| p99 latency | Cut 4x, from 600ms to 150ms |\r
| XGuideFD load | Cut 87%, from 336K to 46K RPM |\r
| CPU headroom | Improved from 117% (throttling) to 90% |\r
| Availability target | 99.999% |\r
| Average throughput | ~4.9k requests per second |\r
\r
## What I would do differently\r
\r
The biggest lesson from this project was that a caching layer bolted onto a legacy read path only buys headroom temporarily — the real fix was rethinking the partition key and the shape of the cached document so that a single read satisfied a whole category view instead of assembling it from several calls. [The author can note a specific follow-up they'd prioritize now — for example, moving CMS layout resolution off the synchronous read path entirely, or extending the snapshot refresher's invalidation to be event-driven rather than interval-based.] Given how much of the 87% load reduction came from that redesign, doing it earlier — before load became a live-site risk — would have avoided the throttling incident that made the migration urgent in the first place.\r
\r
## Cheat sheet\r
\r
- Two front doors, one core: \`XGuideSelfServeFD\` for publisher writes, \`XGuideFD\` for player reads, both calling into the same XEvents service.\r
- Reads are cache-first: Redis and a Cosmos snapshot cache sit in front of Cosmos DB itself; \`XEventsWorker\` keeps that cache warm asynchronously.\r
- The 87% load cut on \`XGuideFD\` (336K → 46K RPM) came from a Cosmos migration plus a redesigned partition key and cache, not from scaling out.\r
- p99 latency dropped 4x (600ms → 150ms) and CPU headroom went from throttling at 117% to 90% free.\r
- The News Feed System is a separate content type built inside this same platform, not a new service.\r
- Availability target is 99.999%; average throughput is roughly 4.9k RPS.\r
\r
## Common mistakes\r
\r
| Mistake | Why it backfires |\r
|---|---|\r
| Describing this as "just an events CRUD service" | Misses that the read and write paths are deliberately separate systems sharing one data store, which is the actual design decision worth discussing |\r
| Saying "we added caching" without naming what changed | The interesting part is the partition-key redesign; caching alone would not explain an 87% load cut |\r
| Not knowing the before/after numbers | 336K→46K RPM, 600→150ms p99 and 117%→90% CPU headroom are the concrete evidence the redesign worked — have them ready |\r
| Treating the News Feed System as unrelated | It is built inside XEvents specifically to reuse this platform's auth, storage and front doors |\r
| Implying the cutover was a big-bang rewrite | It was incremental and zero-downtime, validated against live traffic before the legacy path was retired |\r
\r
## Summary\r
\r
XEvents and XGuide split cleanly into a publisher write path and a player read path that share one core service, one Cosmos store and one Redis cache. The interesting engineering was not adding the caching layer — it was redesigning the partition key and cache shape so a single read served an entire category view, which cut front-door load 87%, latency 4x, and turned a CPU-throttling service into one with comfortable headroom, all without downtime. That same platform is now the foundation the News Feed System builds on, reusing its authoring tools and front doors instead of standing up a parallel stack.\r
\r
## Top Interview Questions\r
\r
### Q1. Walk me through what happens end to end when a publisher publishes an event.\r
\r
A publisher edits the event in the Events Editor SPA, which calls \`XGuideSelfServeFD\`, the self-serve front door. That front door authenticates the publisher and forwards the request to \`XEventsBusinessLogicV2\`, the save/publish/unpublish/delete flow, which decides whether the event is on legacy storage or Cosmos and writes the change there. The request returns to the publisher immediately after that write; it does not wait for category views or CMS content to refresh. Separately, \`XEventsWorker\` picks up the change asynchronously, recomputing category membership (Featured, Active, Coming Soon) and syncing any CMS-driven layout content, so that the next player read reflects the update without the publisher's request having to pay for that work synchronously.\r
\r
### Q2. Why two separate front doors instead of one gateway handling both reads and writes?\r
\r
Publisher writes and player reads have completely different traffic shapes and different risk profiles. Reads happen at close to 5,000 requests per second from millions of players and must stay fast and cheap; writes are comparatively rare, come from a known, authenticated set of 70-plus publishers, and can tolerate more processing time since a save or publish is not latency-critical. Splitting them into \`XGuideSelfServeFD\` and \`XGuideFD\` means a burst of publisher activity — bulk-scheduling events before a big launch — never competes with player-facing read traffic for capacity, and each front door can scale, cache and be secured independently of the other.\r
\r
### Q3. What was actually wrong with the old read path that pushed XGuideFD to 336K RPM and 117% CPU?\r
\r
\`XGuideFD\` sat on a legacy dependency chain where serving a single category view required repeatedly querying the same underlying event data instead of resolving it from one precomputed shape. That meant load scaled with player traffic almost one-to-one against the backing store, and CPU usage climbed past 100% under peak — the service was throttling, not just busy. [The author can add the specific legacy component or query pattern that was the worst offender here.] The fix was not horizontal scaling; more replicas would have just moved the same inefficient query pattern to more machines. It required rethinking what got cached and how.\r
\r
### Q4. Why Cosmos DB and Redis for this workload rather than a relational store?\r
\r
Event and follow data is read far more often than it's written, and the read shape is almost always "give me a category view for this player surface" rather than an ad hoc relational query — a good fit for a document store where a category's events can be modeled and served as one cohesive document. Cosmos DB gives horizontal scale and predictable latency for that access pattern, and Redis sits in front of it as a cache for the hottest category views so the vast majority of the ~4.9k RPS never touches Cosmos directly. A relational store would have meant either heavier joins on every read or building an equivalent caching layer anyway, without Cosmos's native partitioning for scale-out.\r
\r
### Q5. How did you cut over to the new architecture without downtime?\r
\r
The migration ran the new Cosmos-backed, cache-first read path alongside the legacy path rather than replacing it outright. \`XEventsSnapshotRefresher\` and \`XEventsWorker\` populate and keep the new cache warm continuously, which let the team validate the new path against real production traffic — comparing results and latency — before flipping reads over and retiring the legacy dependency. Because the write path (\`XGuideSelfServeFD\`) was untouched throughout, publishers never saw any disruption; only the internal read path changed underneath \`XGuideFD\`. This incremental, validate-then-cut-over approach is what let a load-bearing production service change its entire read strategy without an outage.\r
\r
### Q6. What does XEventsWorker actually do, and why does it run asynchronously instead of inline?\r
\r
\`XEventsWorker\` handles category refresh and CMS synchronization — recomputing which events belong in Featured, Active, Coming Soon and Ending Soon as event schedules and CMS layout content change over time. Running this inline on every write would mean a publisher's save/publish request has to wait for potentially expensive recomputation across every category and surface that event might appear in, which does not scale as publisher count grows. Running it asynchronously off Service Bus means the write path stays fast and simple, and the worker can batch, retry and pace its own work independently of publisher traffic, at the cost of category views being eventually rather than instantly consistent.\r
\r
### Q7. What happens to XGuideFD if Redis becomes unavailable?\r
\r
Reads fall through to the Cosmos-backed snapshot path instead of the cache, so the service keeps serving correct data, just at higher latency and higher load on Cosmos than the design targets for steady state. [The author should confirm the specific fallback and any circuit-breaking or backpressure behavior configured for this case — for example, whether XGuideFD sheds load, serves a shorter TTL cached response, or simply absorbs the extra Cosmos load within its provisioned throughput.] Given the emphasis the redesign placed on keeping p99 latency low, a prolonged Redis outage would be expected to show up first as latency regression rather than an outright outage, since Cosmos remains the durable source of truth underneath the cache.\r
\r
### Q8. Why was the News Feed System built inside XEvents instead of as its own service?\r
\r
XEvents already had the infrastructure a publisher-facing content feed needs: an authenticated self-serve authoring front door, a player-facing read front door serving multiple surfaces, Cosmos and Redis at scale, and an existing relationship with 70-plus publishers. Standing up a new service would have meant rebuilding all of that — auth, front doors, caching, publisher onboarding — for a feature that is conceptually just another content type alongside events. Building it as a new "News Post" content type inside the existing platform meant it inherited a proven, already-scaled read and write path from day one, which is a large part of why it could target a fast migration off the legacy Xbox Live Clubs feed.\r
\r
### Q9. What was your personal contribution versus the team's on this project?\r
\r
[The author should state their specific scope precisely — for example: "I owned the read path redesign: the Cosmos partition-key strategy, the snapshot cache shape, and the cutover plan that got XGuideFD's load down 87% with zero downtime."] Frame it around a concrete, defensible slice of the system — the piece with a metric attached — rather than claiming the whole platform. Interviewers respond well to a specific technical decision (the partition key, the cache invalidation strategy, the incremental cutover plan) that you can defend under follow-up questions, rather than a broad claim about owning "the events platform."\r
\r
### Q10. If publisher count went from 70 to 700, what would break first?\r
\r
The write path would likely feel it before the read path does, since \`XGuideSelfServeFD\` and the core save/publish logic were not the target of the recent redesign — the read side was. A 10x increase in publishers bulk-scheduling and editing events would increase the volume of work \`XEventsWorker\` has to process for category refresh and CMS sync, and if that queue grows faster than the worker can drain it, category views on the read side would start lagging behind actual publisher intent even though the read path itself stays fast. The next redesign would likely need to focus on worker throughput and queue partitioning rather than the Cosmos/Redis read path, which was built with headroom for player-scale traffic already.\r
`;export{e as default};
