const e=`---\r
title: Architecture Walkthrough Template\r
description: A repeatable structure for whiteboarding a system you actually built, so a design round never turns into an unstructured ramble\r
difficulty: Core\r
tags: [system-design, whiteboarding, architecture, communication]\r
---\r
\r
Given a whiteboard and fifteen minutes, most candidates either freeze or over-draw. The fix is not more architecture knowledge — it is a **fixed narration order** you can run for any system you have genuinely built, so the structure carries you even when nerves would otherwise cost you the thread.\r
\r
## The nine-part structure\r
\r
Use this order every time, out loud, whether or not you're actually at a whiteboard. It works because it mirrors how the interviewer is scoring you: context first, then the shape of the system, then proof you understand the parts, then proof you can defend it.\r
\r
\`\`\`mermaid\r
flowchart TD\r
    A["1 - Context & business problem"] --> B["2 - Constraints you were given"]\r
    B --> C["3 - Before architecture"]\r
    C --> D["4 - After architecture"]\r
    D --> E["5 - Component walkthrough"]\r
    E --> F["6 - Data flow for the main use case"]\r
    F --> G["7 - Three decisions you'd defend"]\r
    G --> H["8 - What you measured"]\r
    H --> I["9 - What broke"]\r
\`\`\`\r
\r
> [!KEY]\r
> Say the section names out loud as you move through them — "so that's the context, now let me show you what changed" — because it signals structure to the interviewer even before you've drawn a single box.\r
\r
## Context, constraints, before and after\r
\r
Start with the **business problem**, not the technology: who was affected, and what was actually broken. Then state the **constraints** you didn't choose — a deprecation deadline, an existing client contract you couldn't break, a team of a fixed size. Constraints matter because they justify every trade-off you make later; skipping them makes your decisions look arbitrary instead of forced.\r
\r
Draw the **before** architecture briefly — a legacy dependency chain, a single-region setup, whatever it actually was — then the **after**. The contrast is what makes the redesign land; nobody appreciates a caching layer in isolation, but everyone understands "p99 latency was 600ms because every read hit a slow legacy service directly."\r
\r
| Section | Target length | What it must contain |\r
|---|---|---|\r
| Context | 20–30 seconds | Who was affected, what was broken, in plain terms |\r
| Constraints | 15–20 seconds | The one or two limits that shaped every later decision |\r
| Before | 20–30 seconds | The old shape, drawn as 3–5 boxes, no more |\r
| After | 30–45 seconds | The new shape, same box count, clearly different |\r
\r
## Component-by-component walkthrough\r
\r
Once both diagrams exist, walk the **after** diagram component by component, stating what each piece does and why it exists — not just its name. "This is Redis" tells the interviewer nothing; "this is a versioned page cache in front of Cosmos, so most reads never touch the database" tells them you understand the purpose, not just the label.\r
\r
> [!TIP]\r
> For each component, be ready to answer one question before it's asked: "what happens if this one is unavailable?" You don't need to say it unprompted every time, but you should never be surprised by it.\r
\r
## The template, filled: a high-scale feed service\r
\r
Below is a worked example modelled on a publisher news-feed platform — the shape of the reader's own News Feed system: a document database as the source of truth, a cache in front of it, and an async pipeline for engagement.\r
\r
**Context.** A game-publisher news feed served millions of players across every storefront, but the underlying service was being deprecated, and the feed itself was slow and coupled to legacy club membership rather than the game title.\r
\r
**Constraints.** The deprecation had a hard deadline; the migration had to be zero-downtime; existing clients could not be broken mid-rollout; the team available to build it was four engineers.\r
\r
**Before.** Reads flowed through a legacy club-membership service on every request, with no caching layer and identity keyed by club, not by game.\r
\r
**After.**\r
\r
\`\`\`mermaid\r
flowchart LR\r
    Pub["Publisher"] --> Editor["Authoring SPA"]\r
    Editor --> Core["Feed Core service"]\r
    Core --> Cos[("Cosmos DB<br/>source of truth")]\r
    Client["Player client"] --> FD["Front door"]\r
    FD --> Core\r
    Core -->|1 - check| Cache[("Redis<br/>versioned page cache")]\r
    Cache -->|miss| Cos\r
    Core -->|async| Hub["Event Hub"]\r
    Hub --> Worker["Worker"]\r
    Worker --> Cos\r
\`\`\`\r
\r
**Component walkthrough.** The front door authenticates and routes; the Core service holds the business rules and is the only thing that talks to storage; Cosmos DB is the durable source of truth, partitioned by game title rather than club; Redis holds a short-TTL, version-keyed page cache so the majority of reads never reach Cosmos; an Event Hub plus worker handle likes and views asynchronously, so a write-heavy engagement signal never blocks the read path.\r
\r
**Data flow for the main use case.** A player opens a game's page: the client calls the front door, which calls the Core service; the Core service checks Redis first using a key built from title, locale, and page; on a hit it returns immediately; on a miss it reads Cosmos, populates the cache, and returns. A "like" action updates a Redis counter optimistically and returns in under 100ms, while an event is queued for a worker to persist durably — eventual consistency, not strict ordering, because engagement counts can tolerate a short delay.\r
\r
**Three decisions I would defend.** (1) Keying by game title instead of club membership, because it matched how clients already identified content and unified variants of the same game. (2) Version-keyed cache invalidation instead of TTL-only, because it made an O(1) key change do the work of a full invalidation. (3) Asynchronous engagement writes instead of synchronous, because the write path needed to stay fast under bursty like/view traffic without risking the read path's latency budget.\r
\r
**What I measured.** p99 read latency, cache hit rate, gateway request volume, Cosmos request-unit consumption, and error rate on both the legacy and new paths during the dual-run window.\r
\r
**What broke.** Cache-key cardinality was higher than expected once locale and pagination were included, which briefly hurt hit rate until the key shape was tightened — a good honest example to have ready.\r
\r
## The interviewer-probe table\r
\r
Prepare specific answers for the probes that follow almost every walkthrough — not because they are tricks, but because they are exactly what a senior interviewer is listening for.\r
\r
| Interviewer probe | Your prepared answer |\r
|---|---|\r
| "Why this database over a relational one?" | Access pattern was high-volume reads by a known key with an evolving schema; relational constraints and multi-row transactions weren't the dominant need |\r
| "What happens when the cache is down?" | Bypass to the source of truth directly; higher latency, but correct, and the product tolerates it briefly |\r
| "How did you choose the partition key?" | Started from the dominant query, not the document shape; validated for skew and hot partitions after rollout |\r
| "What's your consistency model?" | Durable writes to the source of truth; cache and async engagement counts are eventually consistent by design |\r
| "How did you migrate without downtime?" | Populate new path silently, validate parity, shift traffic gradually behind a flag, keep rollback ready |\r
| "What would you change with more time?" | One genuine, bounded answer — never "nothing" |\r
\r
> [!WARNING]\r
> If you cannot answer "what happens when this component is down?" for every box you draw, you have drawn a diagram, not an architecture. Fill that gap before the interview, not during it.\r
\r
## Drawing while talking\r
\r
The mechanics of drawing matter almost as much as the content. Draw left to right or top to bottom in the direction traffic actually flows, and narrate *as* you draw rather than drawing silently and then explaining — silence while drawing reads as uncertainty even when you're simply thinking. Keep boxes to what you can defend: five to eight components is normally enough for a single use case; more than that and you're drawing an org chart, not an architecture.\r
\r
Leave visible room to add detail when a follow-up needs it — a smaller box for "worker" that you can expand into a queue-plus-consumer diagram if asked, rather than redrawing everything. And always finish the initial pass before taking a deep follow-up; a half-drawn diagram with a tangent branching off it loses the interviewer faster than finishing cleanly and then answering.\r
\r
> [!TIP]\r
> If you're on a call with no shared whiteboard, narrate the same structure verbally in the same order — "picture three boxes: client, cache, database" — and it still reads as structured, because the discipline is in the order, not the ink.\r
\r
## Cheat sheet\r
\r
- Fixed order every time: context, constraints, before, after, components, data flow, three decisions, measurements, what broke.\r
- State constraints explicitly — they are what justify every trade-off that follows.\r
- Draw before-and-after, not just after; the contrast is what makes the redesign land.\r
- For every component, be ready for "what happens when this is down?"\r
- Prepare exactly three decisions you would defend, in advance, not on the spot.\r
- Always have one honest, bounded "what broke" story — a perfect rollout is not believable.\r
- Narrate while you draw; silence reads as uncertainty.\r
- Keep to 5–8 boxes for the main flow; go deeper only when asked.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Jumping straight to boxes with no context or constraints | State the business problem and constraints first, out loud |\r
| Drawing only the "after" architecture | Draw "before" too — the contrast is the whole point |\r
| Naming components without explaining their purpose | State what each component does and why it exists |\r
| No answer for "what if this is down?" | Prepare a failure mode for every box before the interview |\r
| Claiming the rollout was flawless | Prepare one honest, bounded "what broke" story |\r
| Drawing silently for a long stretch | Narrate continuously as you draw |\r
| Over-drawing 15+ boxes for one use case | Cap the main flow at 5–8 components |\r
\r
## Summary\r
\r
A whiteboard round rewards structure over artistry. Walking context, constraints, before, after, components, data flow, defended decisions, measurements, and what broke — in that fixed order, every time — turns a stressful blank-page moment into a rehearsed routine you can run for any system you've actually built. Prepare the failure mode of every component and one honest story about what broke, because those are the two things a senior interviewer is listening for underneath the diagram itself.\r
\r
## Top Interview Questions\r
\r
### Q1. Walk me through the architecture of a system you built, from the whiteboard up.\r
\r
I'll use the News Feed platform I owned. The context: a publisher news feed served millions of players but ran on a service scheduled for deprecation and coupled to club membership rather than game identity. The constraint was a hard deprecation deadline with zero downtime allowed. Before, every read hit that legacy service directly with no caching. After, I redesigned it around Cosmos DB as the source of truth, keyed by game title, with a versioned Redis cache in front and an async Event Hub pipeline for engagement. The main flow: a client hits the front door, the front door checks Redis first, falls back to Cosmos on a miss, and likes/views are processed asynchronously by a worker. I can go deeper on any one piece — the partition key, the cache invalidation, or the migration itself.\r
\r
### Q2. Why did you choose that data store over a relational database?\r
\r
The dominant access pattern was high-volume reads scoped to a known key — the game title — with a schema that was still evolving as we added post types and metadata. A document database let me model the aggregate the way it was actually read, distribute load across a well-chosen partition key, and iterate the schema without a migration for every change. A relational database would have been the wrong default here because I didn't need multi-row transactions or rich ad-hoc joins across entities — I needed fast, predictable reads by a known key at high volume, which is exactly what a partitioned document store is built for.\r
\r
### Q3. What happens if your cache goes down in production?\r
\r
The read path falls back directly to the source of truth, so correctness is preserved and the system degrades to higher latency rather than failing outright. That's a deliberate design choice: I treat the cache as a performance optimisation, never as the only copy of correct data, so its unavailability is a latency problem, not a correctness problem. In practice I'd also expect an alert on cache-miss rate spiking and elevated dependency load downstream, since a fully cold cache means every request now pays the Cosmos round-trip, and I'd want to know that's happening before it turns into a capacity problem.\r
\r
### Q4. How did you decide on the partition key, and what would you check after rollout?\r
\r
I started from the dominant query pattern rather than the shape of the document: most traffic reads a feed scoped to one game title, so keying by title co-located the data that needed to be read together and distributed load across the population of titles. I evaluated cardinality, likely skew, and write distribution before committing to it. After rollout, I'd specifically watch request-unit consumption per partition and look for hot partitions, because a key that looks high-cardinality on paper can still concentrate traffic in practice if a small number of titles are disproportionately popular — and I'd have a plan, like a synthetic sub-key, ready if that happened.\r
\r
### Q5. Describe the data flow for your system's most important use case.\r
\r
For a player opening a game's page: the client calls the front door, which authenticates the request and forwards it to the core service. The core service builds a cache key from title, locale, and page parameters, checks Redis first, and on a hit returns immediately with per-user overlays like "has this user liked this post" applied after the cache read so one cached page can serve every user. On a miss, it reads from Cosmos, populates the cache with a short TTL, and returns. A like or view action takes a separate, asynchronous path: it updates a Redis counter optimistically and returns in under 100ms, while an event is queued for a worker to persist the durable count — deliberately eventually consistent, because engagement numbers can tolerate a short delay in exchange for a much faster write path.\r
\r
### Q6. What are the three decisions in this design you would defend most strongly, and why?\r
\r
First, keying everything by game title instead of legacy club membership, because it matched how clients already identified content and let related product variants share the same posts — a simpler identity model with fewer edge cases. Second, version-keyed cache invalidation instead of relying on TTL alone, because publishing a new version becomes a single key change rather than a scan or an in-place mutation of an object that might be mid-read. Third, making engagement writes asynchronous rather than synchronous, because likes and views are high-volume and bursty, and coupling them to the read path's latency budget would have been the wrong trade-off for a feature that can tolerate eventual consistency.\r
\r
### Q7. What did you actually measure to know this design worked, and how would you show it?\r
\r
I tracked p99 and p50 read latency, cache hit rate, Cosmos request-unit consumption and throttling (429s), gateway request volume, and error rate — comparing the legacy and new paths side by side during the dual-run window before fully cutting over. The headline numbers were a drop in p99 latency from roughly 600ms to 150ms and an 87% reduction in gateway load, both measured from before/after dashboards over a comparable traffic window, not from a single spot check. I'd show this as a before/after chart rather than quoting the percentage alone, because the shape of the improvement over time is more convincing than a single number.\r
\r
### Q8. Tell me about something that broke during this project, and how you found out.\r
\r
Once locale and pagination parameters were folded into the cache key, key cardinality was higher than I'd modelled, and cache hit rate dipped below target during the first days of rollout — noticeable because our hit-rate dashboard dropped and downstream Cosmos load ticked up correspondingly. I traced it to the key shape generating far more distinct keys than necessary for the actual variation in content, tightened the key to collapse equivalent pagination states, and hit rate recovered. It's a good example of a design that was directionally right but needed one iteration in production before the numbers matched the design intent.\r
\r
### Q9. If traffic to this system suddenly increased tenfold, what would break first, and what would you do?\r
\r
The first thing to feel it would be Cosmos request-unit throughput on cache misses, since a cold or partially-effective cache under 10x traffic means 10x more requests reaching the database layer per unit time; the second would be connection and thread pool saturation in the core service under sustained load. Immediate mitigation would be leaning harder on the cache — extending TTL slightly and pre-warming hot keys if the traffic spike is predictable, like a launch event — while horizontally scaling the stateless core service via its existing autoscaler. Longer term, I'd look at whether the partition key still distributes evenly at that scale, since a key that behaved well at 1x load can concentrate unevenly once a subset of "hot" titles gets a disproportionate share of a much bigger number.\r
\r
### Q10. How do you decide how many components to put on the whiteboard for a single use case?\r
\r
I cap the main flow diagram at five to eight boxes — enough to show client, front door, core logic, cache, and storage without turning the diagram into an org chart nobody can follow in the time available. Supporting pieces, like a background worker or a secondary consumer, get a smaller placeholder box that I'm prepared to expand into its own mini-diagram if the interviewer asks about it specifically. This keeps the first pass digestible and lets me demonstrate depth on demand rather than trying to show everything at once and losing the thread of the main use case.\r
\r
### Q11. What would you do differently if you were designing this system again from scratch?\r
\r
I'd invest earlier in an automated parity checker comparing results from the legacy and new paths continuously during migration, rather than relying on manual spot-checks in the first weeks, which cost real engineering time and would have caught the cache-key cardinality issue sooner. I would keep the overall shape — document store as source of truth, versioned cache in front, asynchronous engagement pipeline — because it held up well under real production traffic and gave us clean failure modes. The change is specifically about migration tooling and rollout observability, not about the target architecture, and I try to be precise about that distinction rather than implying the whole design needed rethinking.\r
\r
### Q12. How do you handle it when an interviewer disagrees with one of your architecture decisions on the whiteboard?\r
\r
I treat it as a design review, not a challenge to defend at all costs. I'll restate the constraint or access pattern that drove my decision, listen to the alternative they're proposing, and genuinely evaluate it against the same criteria — latency, consistency needs, operational cost, team size. If their alternative is better under the actual constraints, I say so directly rather than digging in; if I still believe my choice was right given the constraints I was working under, I explain why using the same evidence-based framing rather than repeating the original answer more loudly. Either response demonstrates the same underlying skill the interviewer is actually testing: reasoning from constraints, not defending an ego.\r
`;export{e as default};
