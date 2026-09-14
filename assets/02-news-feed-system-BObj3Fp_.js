const e=`---\r
title: News Feed System\r
description: How the 600 plus publisher Official Clubs news feed was rebuilt inside XEvents as a title-keyed content type across Cosmos and Redis\r
difficulty: Core\r
tags: [xbox, xevents, news-feed, event-driven]\r
---\r
The Xbox Live Clubs service that powers today's publisher news feed is being deprecated, so rather than build a new service, the feed is being migrated into XEvents by adding a News Post content type alongside the existing Events. It is a content channel where 600-plus game publishers push news — announcements, patch notes, images, links — onto Product Detail Pages across every Xbox surface, unifying Events and News Posts on one platform instead of running two.\r
\r
## What it is\r
\r
The feed is the "Official Clubs News Feed" reborn on XEvents, keyed by game titleId instead of club membership.\r
\r
### Write side — publishers\r
\r
Publishers author Image and External Link posts in the Events Editor SPA — with pinning, scheduling, inline locale descriptions, and multi-title association. Authoring moves off the legacy XBLC tool entirely, so publishers get one authoring surface for both events and news.\r
\r
### Read side — players\r
\r
Players see a scrollable feed, pinned post on top, on a game's Product Detail Page, plus post details, likes and view counts. Club branding is replaced by product name and box art; comments, shares and follow are deliberately dropped from the MVP scope.\r
\r
> [!NOTE]\r
> This system is built inside the parent XEvents service rather than as its own deployment — it reuses XEvents' front doors, Cosmos account, Redis cache and worker infrastructure. See the XEvents and XGuide page for the platform this sits on top of.\r
\r
## Architecture\r
\r
Everything reduces to three flows: publisher authoring, player feed reads, and an async engagement pipeline for likes and views.\r
\r
\`\`\`mermaid\r
flowchart TB\r
    subgraph A["1 - Publisher authoring"]\r
      direction TB\r
      ED["Events Editor SPA"] -->|upload media| Blob[("Blob Storage + CDN")]\r
      ED --> SS["XGuideSelfServeFD"] --> XC["XEvents Core"]\r
      XC --> Cos[("Cosmos DB")]\r
      XC -.title map, moderation.-> CMS["CMS / ProductDetails / Moderation"]\r
    end\r
    subgraph B["2 - Player feed read"]\r
      direction TB\r
      CL["Client (Console/PC/Mobile/Shell)"] --> FD["Surface FD"] --> XC2["XEvents Core"]\r
      XC2 -->|1 check| Rd[("Redis cache")]\r
      XC2 -->|2 on miss| Cos2[("Cosmos DB")]\r
      XC2 -->|+ per-user overlay| Resp["posts + hasLiked + counts"]\r
    end\r
    subgraph C["3 - Engagement pipeline"]\r
      direction TB\r
      Like["Like / View"] --> XC3["XEvents Core"]\r
      XC3 -->|optimistic| Rd2[("Redis counter")]\r
      XC3 -->|event, pk=postId| EH["Event Hub: NewsFeedEvents"]\r
      EH -->|batch| W["XEventsWorker"] --> Cos3[("Cosmos: persist")]\r
    end\r
    classDef g fill:#e8f5e8,stroke:#107c10;\r
    class XC,XC2,XC3 g;\r
\`\`\`\r
\r
(1) A publisher authors in the Events Editor, which calls \`XGuideSelfServeFD\` into XEvents Core, which persists to Cosmos. (2) A player read hits Redis first, falls back to Cosmos on a miss, then overlays per-user engagement state. (3) Likes and views update a Redis counter immediately and fire an Event Hub event that a worker batches into Cosmos.\r
\r
| Cosmos container | Holds | Key |\r
|---|---|---|\r
| \`PostItems\` | Full post documents — the source of truth | by post |\r
| \`PostTitleMap\` | Denormalized per-title index rows for fast list, feed and count queries | by titleId |\r
| \`PinnedPosts\` | One pinned post per title | \`id == titleId\`, PK \`/titleId\` |\r
| \`UserEngagement\` | Per-user like state | \`id == postId\`, PK \`/userId\` |\r
\r
| Store | Configuration | Purpose |\r
|---|---|---|\r
| Cosmos DB | Autoscale 400–4000 RU/s across 4 containers; 1 write region (West US 2) plus 4 read regions, auto-failover under 30s | Durable post, index, pin and engagement data |\r
| Redis | Premium P2 (13 GB), clustered per region | User-agnostic feed page cache with short TTL and version-based invalidation |\r
| Event Hub | \`NewsFeedEvents\`, 8 partitions, partition key is \`postId\` | Async likes and views pipeline |\r
| Blob + CDN | Publisher media uploaded via SAS, served over CDN, reuses existing Events storage | Image/video hosting for posts |\r
\r
## Data and request flow\r
\r
**Feed cache.** The feed page is cached user-agnostic with a short TTL of roughly 5 minutes. Invalidation is version-based, so a publish or unpublish is an O(1) key change rather than a scan across cached pages. The per-user \`hasLiked\` overlay is applied after the cache read, which is what lets one cached page serve every player instead of maintaining a separate cache entry per user. The key shape is \`newsfeed:v2:{titleId}:{locale}:{pageSize}:{pin}:{cursor}\`.\r
\r
**Async engagement.** A like or view updates the Redis counter optimistically and returns immediately, targeting P95 under 100ms, while an \`EngagementEvent\` (protobuf) is sent to Event Hub keyed by \`postId\`. \`XEventsWorker\` batch-reads per partition, de-duplicates, and persists to Cosmos, with periodic reconciliation correcting any drift between the optimistic counter and the durable record. This trades strict consistency for speed: engagement needs eventual consistency without strict ordering, which is exactly what an Event Hub plus a batching worker is good at, and it keeps the write API instant while shielding Cosmos from a per-click write storm.\r
\r
The post lifecycle has five stored statuses; scheduling and expiry are display states computed at runtime rather than stored.\r
\r
\`\`\`mermaid\r
stateDiagram-v2\r
    [*] --> Draft\r
    Draft --> ReviewPending: submit (post-MVP moderation)\r
    ReviewPending --> ReviewFailed: rejected\r
    ReviewPending --> Published: approved\r
    ReviewFailed --> Draft: edit & resubmit\r
    Draft --> Published: publish (MVP - trusted)\r
    Published --> Deleted: soft-delete\r
    Draft --> Deleted: soft-delete\r
    Deleted --> [*]\r
    note right of Published\r
      Runtime display states:\r
      Scheduled - future date\r
      Live - active\r
      Ended - past expiry\r
    end note\r
\`\`\`\r
\r
Stored statuses are Draft, ReviewPending, ReviewFailed, Published and Deleted (soft-delete for audit and recovery). Scheduled, Live and Ended are derived at read time from schedule and expiry dates rather than written anywhere. In the MVP, moderation is deferred, so trusted publishers go straight from Draft to Published.\r
\r
| Surface | Endpoints |\r
|---|---|\r
| Player (\`PostsController\`) | \`GET /Posts/{titleId}\` · \`GET /Posts\` · \`POST /Posts/{postId}/like\` · \`DELETE /Posts/{postId}/like\` · \`POST /Posts/{postId}/view\` |\r
| Publisher (\`SelfServePostsController\`) | \`POST /SelfServe/posts\` · \`PUT\`/\`DELETE /SelfServe/posts/{postId}\` · \`.../publish\` · \`.../unpublish\` · \`.../pin\` · \`.../authorizedProducts\` |\r
| Worker | \`DELETE /Worker/cleanup\` |\r
\r
## The hard problems\r
\r
**Why key everything by titleId instead of club membership.** The legacy feed was scoped to club membership, which meant a separate identity model from the rest of the store. Keying posts and the feed by game titleId instead is a simpler identity model: associated product variants reuse the same posts, and every client already carries a titleId for the product it's showing, so no new identifier had to be threaded through the client surfaces.\r
\r
**Why standard Xbox Live auth instead of a club-specific token.** Reusing the tokens clients already hold for Xbox Live avoids a special "ClubHub" token acquisition flow, which means less client complexity and no extra login friction for a feature that is supposed to feel like part of the product page, not a separate destination.\r
\r
**Why a single continuation token for pagination.** The feed uses one opaque Cosmos continuation token — the standard pattern — replacing legacy polling. Clients pass it back to get the next page, and it composes cleanly with the versioned cache without the feed service needing to track per-client offsets.\r
\r
**Why latest-only sort, no ranking.** The feed sorts by publish date, newest first. A "Hot" or "Trending" ranking would need its own scoring pipeline, and current usage did not justify building and maintaining one for the MVP — a deliberate scope cut rather than an oversight.\r
\r
**Migrating without breaking either side.** Clients run hybrid during cutover: legacy posts are shown for publishers not yet onboarded, XEvents posts for those who are. A cached (30 minute) "is-onboarded?" API plus a per-title rollback toggle drive a safe, flighted rollout, and no historical posts are migrated — publishers start fresh on the new system rather than the migration having to reconcile old and new post history.\r
\r
> [!WARNING]\r
> Because engagement is asynchronous, a like can briefly show a stale count if the reconciliation pass hasn't run yet. This is an accepted trade-off, not a bug — the alternative is a synchronous write to Cosmos on every like, which does not survive a viral post's write volume.\r
\r
## Scale and reliability\r
\r
| Metric | Target |\r
|---|---|\r
| Feed read latency | P95 under 500ms on a cache hit, under 1000ms on a miss |\r
| Like / view latency | P95 under 100ms (async persistence) |\r
| Feed read throughput | 10,000 reads/sec target |\r
| Engagement throughput | 5,000 events/sec target |\r
| Availability | 99.9%, treated as non-critical so it degrades gracefully rather than failing hard |\r
| Autoscaling | AKS HPA, CPU-based, 3–20 replicas per region |\r
| Publisher scale | 600+ Official Club publishers migrating onto titleId-keyed posts |\r
| Storage footprint | 4 Cosmos containers: source-of-truth posts, per-title index, pins, per-user engagement |\r
\r
**Graceful degradation** is built into every dependency: if the API is down, the client simply hides the news section rather than showing an error. If Redis is down, reads bypass to Cosmos at higher latency instead of failing. If moderation is down, a post just stays in Draft rather than blocking authoring. If a Cosmos region fails, automatic failover completes in under 30 seconds. None of these failure modes take the rest of the product page down with them.\r
\r
## What I would do differently\r
\r
The MVP intentionally deferred moderation, video posts, and a multi-title feed to ship the core titleId-keyed migration quickly, and the fast-follow list reflects what was cut rather than what was missed: video posts, content moderation through XCMS/XMMS, automated SellerId-to-TitleId mapping, richer read/admin RBAC, a multi-title feed for the Shell community app, and Xbox.com integration. [The author can note which of these turned out to matter most once the migration reached general availability — for example, whether moderation demand arrived faster than the deferred-to-post-MVP plan assumed.] Given that dual-feed migration already carries real complexity — two data sources, an onboarding check, a rollback toggle — building automated SellerId-to-TitleId mapping earlier would likely have removed a manual step from every publisher onboarding rather than leaving it as a fast-follow.\r
\r
## Cheat sheet\r
\r
- Posts are keyed by game titleId, not club membership — simpler identity, reuses existing client auth.\r
- Four Cosmos containers: \`PostItems\` (source of truth), \`PostTitleMap\` (per-title index), \`PinnedPosts\` (one per title), \`UserEngagement\` (per-user like state).\r
- Feed pages are cached user-agnostic in Redis with version-based invalidation; the per-user \`hasLiked\` overlay is applied after the cache read.\r
- Likes and views are async: Redis counter updates optimistically and returns in under 100ms P95, while an Event Hub event (partition key = postId) is batched into Cosmos by a worker.\r
- Five stored statuses (Draft, ReviewPending, ReviewFailed, Published, Deleted); Scheduled/Live/Ended are computed at read time, not stored.\r
- Targets: P95 under 500ms feed reads on cache hit, 10K reads/sec and 5K engagement events/sec.\r
- Migration runs dual-feed, per-title flighted, with no historical post migration.\r
\r
## Common mistakes\r
\r
| Mistake | Why it backfires |\r
|---|---|\r
| Saying the feed is keyed by club or user | It's keyed by titleId — that's the specific design decision worth explaining, and why it simplified identity |\r
| Describing likes/views as synchronous writes | They're optimistic Redis updates plus an async Event Hub-to-Cosmos pipeline; conflating the two loses the whole eventual-consistency trade-off |\r
| Forgetting the per-user overlay happens after the cache read | This is exactly what makes a single cached page servable to every user — a common follow-up question |\r
| Treating the four Cosmos containers as redundant | Each has a distinct access pattern: source-of-truth, index, pin, and per-user state — collapsing them would slow down at least one query path |\r
| Not having a migration story ready | The dual-feed, per-title flighted rollout with a 30-minute cached onboarding check is a concrete answer to "how do you migrate 600+ publishers safely" |\r
\r
## Summary\r
\r
The News Feed System takes a deprecating, club-scoped Xbox Live Clubs feed and rebuilds it as a titleId-keyed News Post content type inside XEvents, reusing that platform's front doors, Cosmos account and Redis cache rather than standing up new infrastructure. The design decisions worth defending are the identity model (titleId over club membership), the four-container Cosmos layout that separates source-of-truth from index from pin from per-user state, the version-based Redis cache with a post-read per-user overlay, and the deliberately asynchronous engagement pipeline that trades strict consistency for a write API that stays fast under load. A dual-feed, per-title flighted migration lets 600-plus publishers move over without a historical data migration or a hard cutover.\r
\r
## Top Interview Questions\r
\r
### Q1. Why key posts and the feed by titleId instead of club membership like the legacy system?\r
\r
The legacy Official Clubs feed was scoped to club membership, which meant maintaining a separate identity and membership model just for this feature. Keying by game titleId instead piggybacks on an identifier every client surface already carries for the product page it's rendering, so no new identity concept had to be introduced to clients. It also naturally supports associated product variants reusing the same posts, since those variants already share a titleId relationship in the catalog. The trade-off is that anything club-specific — membership-gated content, for instance — isn't representable this way, but that wasn't a requirement for the news feed use case, so the simpler model won.\r
\r
### Q2. Walk through why likes and views are asynchronous rather than a direct write to Cosmos.\r
\r
A synchronous write to Cosmos on every like or view would mean the client-facing API's latency is bound by Cosmos write latency, and a viral post could produce a write storm directly against the durable store. Instead, the write path updates a Redis counter optimistically and returns immediately, targeting P95 under 100ms, while an \`EngagementEvent\` is published to Event Hub keyed by \`postId\`. \`XEventsWorker\` batches and de-duplicates those events per partition before persisting to Cosmos, with periodic reconciliation to correct drift. This is a deliberate choice: engagement data needs eventual consistency without strict ordering, which is precisely what Event Hub plus a batching consumer is designed for, and it keeps the hot write path cheap.\r
\r
### Q3. Explain the four Cosmos containers — why not just one "posts" container?\r
\r
\`PostItems\` holds the full post document and is the source of truth. \`PostTitleMap\` is a denormalized index keyed by titleId so list, feed and count queries don't have to scan or cross-partition query the full post documents. \`PinnedPosts\` holds exactly one pinned post per title, partitioned by titleId, because pin lookups are a distinct, frequent access pattern. \`UserEngagement\` holds per-user like state, partitioned by userId, because that access pattern — "has this user liked this post" — is keyed completely differently from everything else. Collapsing these into one container would force at least one of those access patterns into a slower cross-partition query.\r
\r
### Q4. How does the Redis feed cache stay correct when posts are user-agnostic but likes are per-user?\r
\r
The cached feed page itself never contains per-user state — it's the same cached page for every player viewing that title's feed, keyed by \`newsfeed:v2:{titleId}:{locale}:{pageSize}:{pin}:{cursor}\` with a short TTL. The per-user \`hasLiked\` overlay is applied after the cache is read, merging in that specific user's engagement state from the \`UserEngagement\` container. This separation is what lets one cached page serve every user instead of needing a cache entry per user per title, which would multiply cache size by the player count and destroy the cache hit rate.\r
\r
### Q5. How is cache invalidation handled when a post is published, unpublished or pinned?\r
\r
Invalidation is version-based rather than a scan-and-delete: publishing, unpublishing or pinning a post bumps a version component of the cache key, so the next read simply misses the old version and populates a new cache entry, an O(1) operation regardless of how many cached page variants (locale, page size, cursor) existed for that title. This avoids having to enumerate and evict every cached page combination for a title on every write, which would get expensive as the number of locale and pagination permutations grows.\r
\r
### Q6. What happens to the feed if Redis is unavailable?\r
\r
Reads fall back directly to Cosmos, at higher latency (the P95 target relaxes from under 500ms to under 1000ms) but without failing. This is one of several graceful-degradation paths built into the system: API down hides the news section on the client, Redis down bypasses to Cosmos, moderation down leaves a post in Draft rather than blocking it, and a Cosmos region failure triggers automatic failover in under 30 seconds. The system treats the feed as non-critical to the overall product page (99.9% availability target) specifically so these degraded paths are acceptable rather than treated as incidents.\r
\r
### Q7. How does the dual-feed migration actually work for the 600-plus existing publishers?\r
\r
Clients run both feed sources simultaneously during the migration window: legacy posts are shown for publishers who haven't been onboarded yet, and XEvents News Posts are shown for publishers who have. A cached "is-onboarded?" check, refreshed every 30 minutes, decides which source a given client shows, and a per-title rollback toggle lets the team pull a specific publisher back to the legacy feed if something goes wrong post-cutover. Deliberately, no historical posts are migrated — publishers start fresh on the new system, which avoids a data-migration and reconciliation problem entirely in exchange for publishers losing their old post history on the new feed.\r
\r
### Q8. Why did you choose latest-only sorting instead of a ranked or "trending" feed?\r
\r
The feed sorts strictly by publish date, newest first. A ranking or trending model would require its own scoring pipeline — engagement signals, decay functions, probably a separate service — and the usage data at the time didn't justify that investment for an MVP whose main goal was migrating off a deprecating legacy service. It's explicitly a scope decision rather than a limitation of the architecture: the \`PostTitleMap\` index and continuation-token pagination would support a ranked query if a scoring pipeline were added later, but nothing in the current design computes one.\r
\r
### Q9. What's the failure mode if the engagement worker falls behind or Event Hub backs up?\r
\r
The Redis counter already reflects the optimistic increment, so users see their own like or view register immediately regardless of worker lag; what lags is the durable Cosmos record and any cross-device or cross-session consistency that depends on it. [The author should confirm the specific backpressure behavior here — for example, whether Event Hub partitions are sized to absorb bursts, and how long reconciliation typically takes to catch up after a backlog.] Because the design already assumes eventual consistency without strict ordering, a worker falling behind temporarily is treated as a performance issue, not a correctness one — periodic reconciliation is the safety net that corrects any drift once the worker catches up.\r
\r
### Q10. What was your specific role in designing this system versus the team's?\r
\r
[The author should state their specific ownership — for example: "I authored the HLD for migrating the Official Clubs news feed into XEvents, including the titleId-keyed data model across four Cosmos containers, the versioned Redis cache design, and the async engagement pipeline."] The strongest version of this answer names one or two decisions you can defend in depth under follow-up — for instance, why the cache key is shaped the way it is, or why the continuation-token pagination replaced legacy polling — rather than claiming ownership of the entire platform, which makes it easy for an interviewer to probe past your actual depth.\r
\r
### Q11. If a publisher wanted 10x more posts per day than any current publisher, what would you look at first?\r
\r
The per-title index (\`PostTitleMap\`) and the feed cache are built around the assumption that a title's post volume is modest enough that a full-page, short-TTL cache refresh is cheap; a publisher posting far more frequently would increase both cache churn (more version bumps invalidating the page faster) and the write volume into \`PostItems\` and \`PostTitleMap\` together. The pinning model (one pinned post per title) and latest-only sort would still work correctly at higher volume, but I'd want to check whether the autoscale Cosmos throughput (400–4000 RU/s across the four containers) has headroom for the increased write rate, and whether the 5-minute cache TTL needs to shrink to keep the feed feeling current for that title specifically.\r
`;export{e as default};
