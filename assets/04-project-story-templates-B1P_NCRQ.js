const e=`---\r
title: Project Story Templates\r
description: A fill-in workbook with one section per major project on your résumé, worked once as an example and left blank for the rest\r
difficulty: Core\r
tags: [resume, storytelling, behavioural, preparation]\r
---\r
\r
A story bank is only useful if it is written down before the interview, not assembled live under pressure. This page gives you one template — problem, constraints, role, architecture, hardest problem, key trade-off, outcome, what broke, and behavioural mapping — worked fully for one project so the pattern is obvious, then left blank for the rest of your résumé.\r
\r
## Why one story answers many questions\r
\r
A single well-prepared project rarely maps to just one interview question. The same News Feed platform story can answer "tell me about a system you built," "tell me about a disagreement," "tell me about a time you led without authority," and "tell me about a failure" — because a real project has multiple decision points, and which one you foreground depends entirely on which question was asked.\r
\r
\`\`\`mermaid\r
flowchart TD\r
    Story["News Feed platform story"] --> Q1["Tell me about a<br/>system you designed"]\r
    Story --> Q2["Tell me about a<br/>disagreement you had"]\r
    Story --> Q3["Tell me about leading<br/>without direct authority"]\r
    Story --> Q4["Tell me about a<br/>mistake or failure"]\r
    Story --> Q5["Tell me about handling<br/>ambiguous requirements"]\r
    Q1 -.->|foreground| A1["Cosmos + Redis<br/>architecture decisions"]\r
    Q2 -.->|foreground| A2["Pushback on dropping<br/>historical posts at cutover"]\r
    Q3 -.->|foreground| A3["Aligning multiple<br/>partner teams on the HLD"]\r
    Q4 -.->|foreground| A4["Cache-key cardinality<br/>issue found post-launch"]\r
    Q5 -.->|foreground| A5["Investigating 20+ repos<br/>before writing the design"]\r
\`\`\`\r
\r
> [!KEY]\r
> Do not prepare a new story for every possible question. Prepare a small number of rich projects, then practise *re-slicing* the same facts to foreground a different decision point depending on what's asked.\r
\r
## The template\r
\r
Fill this table in for every major project on your résumé. Nine fields, one project per pass — the discipline of writing it down, not just thinking it, is what makes it retrievable under interview pressure.\r
\r
\`\`\`\r
Field                          | Your answer\r
--------------------------------|------------\r
Problem                         |\r
Constraints                     |\r
Your role                       |\r
Architecture in three sentences |\r
Hardest technical problem       |\r
Key trade-off                   |\r
Measurable outcome              |\r
What broke, and what you learned|\r
Maps to behavioural competencies|\r
\`\`\`\r
\r
## Worked example: the News Feed platform\r
\r
This is the résumé's headline achievement, filled in completely so you can see how dense a single project's answer should be.\r
\r
| Field | Answer |\r
|---|---|\r
| Problem | A publisher news feed serving millions of players ran on a service being deprecated, coupled to legacy club membership rather than game identity, and was slow — the platform needed a replacement that unified content from hundreds of publishers |\r
| Constraints | Hard deprecation deadline; zero-downtime cutover required; existing clients could not break mid-migration; team of four engineers |\r
| Your role | Owned the architecture and delivery end to end; led the team of four; made the final call on data model, caching strategy, and migration sequencing |\r
| Architecture in three sentences | Cosmos DB became the source of truth, keyed by game title instead of club membership. A versioned Redis cache sat in front of it so most reads never touched the database. Likes and views were processed asynchronously through an event pipeline so the write-heavy engagement signal never blocked the read path. |\r
| Hardest technical problem | Migrating the read path off the legacy dependency without downtime, while keeping data correct across both the old and new paths during the transition window |\r
| Key trade-off | Chose eventual consistency for engagement counts and bounded cache staleness in exchange for a much faster, more resilient read path at high RPS |\r
| Measurable outcome | Replaced 20+ legacy systems; p99 read latency dropped from ~600ms to ~150ms (4x); gateway load dropped 87%; served ~5,000 RPS across 7M+ players at 99.99% availability |\r
| What broke, and what you learned | Cache-key cardinality was higher than modelled once locale and pagination were included, temporarily hurting hit rate until the key shape was tightened; learned to validate cache-key design against real query variety before rollout, not just in design review |\r
| Maps to behavioural competencies | Ownership, technical leadership, cross-team influence, disagreement handling (the debate over dropping historical posts at cutover), delivering under a hard deadline |\r
\r
> [!TIP]\r
> Notice the "hardest technical problem" and "key trade-off" rows are different things. The hardest problem is what was difficult to solve; the trade-off is what you gave up to solve it. Interviewers ask for both, separately.\r
\r
## Blank templates for your other projects\r
\r
Fill these in using the same discipline. Suggested anchors are given based on the shape of a typical senior backend résumé — replace them with your own specifics.\r
\r
### Project: AI-powered content-processing system\r
\r
| Field | Your answer |\r
|---|---|\r
| Problem | _[what manual or slow process existed before this system]_ |\r
| Constraints | _[time, team size, regulatory or policy limits]_ |\r
| Your role | _[which layer or stage you owned specifically]_ |\r
| Architecture in three sentences | _[event-driven pipeline shape, stages, what triggers it]_ |\r
| Hardest technical problem | _[e.g. reducing false positives while preserving safety]_ |\r
| Key trade-off | _[e.g. buy a moderation vendor vs. build a custom classifier]_ |\r
| Measurable outcome | _[review time reduced, volume processed per day, accuracy change]_ |\r
| What broke, and what you learned | _[fill in]_ |\r
| Maps to behavioural competencies | _[learning agility, mentoring, guardrails around automated decisions]_ |\r
\r
### Project: Developer-productivity platform\r
\r
| Field | Your answer |\r
|---|---|\r
| Problem | _[what fragmented tooling or manual workflow existed before]_ |\r
| Constraints | _[security/RBAC requirements, existing tool sprawl, adoption risk]_ |\r
| Your role | _[creator/owner, or a specific capability you built]_ |\r
| Architecture in three sentences | _[gateway/front-door shape, what it fans out to]_ |\r
| Hardest technical problem | _[e.g. making powerful tools safe for broad, low-friction adoption]_ |\r
| Key trade-off | _[e.g. read-only-by-default in production vs. full capability]_ |\r
| Measurable outcome | _[time saved per task, number of adopters, tools shipped]_ |\r
| What broke, and what you learned | _[fill in]_ |\r
| Maps to behavioural competencies | _[developer empathy, driving adoption without authority, security-mindedness]_ |\r
\r
### Project: React-based commerce or publishing platform\r
\r
| Field | Your answer |\r
|---|---|\r
| Problem | _[what publisher or business workflow was slow or manual]_ |\r
| Constraints | _[deadline, existing legacy portal, cross-team dependencies]_ |\r
| Your role | _[full-stack ownership, or specifically frontend/BFF]_ |\r
| Architecture in three sentences | _[SPA + BFF shape, what it delegates to a backend for]_ |\r
| Hardest technical problem | _[e.g. modelling flexible business rules without a rigid schema]_ |\r
| Key trade-off | _[e.g. stateless BFF delegating logic vs. richer client-side state]_ |\r
| Measurable outcome | _[adoption across N products, revenue association, time saved]_ |\r
| What broke, and what you learned | _[fill in]_ |\r
| Maps to behavioural competencies | _[customer focus, full-stack range, delivering under pressure]_ |\r
\r
### Project: Multi-region reliability and security initiative\r
\r
| Field | Your answer |\r
|---|---|\r
| Problem | _[what secret-management, identity, or availability gap existed]_ |\r
| Constraints | _[compliance deadline, legacy systems that couldn't change quickly]_ |\r
| Your role | _[proved the pattern, built the reusable module, drove adoption]_ |\r
| Architecture in three sentences | _[e.g. Managed Identity replacing shared keys, reusable Terraform module]_ |\r
| Hardest technical problem | _[e.g. migrating a live service without a service interruption]_ |\r
| Key trade-off | _[e.g. per-service onboarding cost vs. removing a whole class of secret risk]_ |\r
| Measurable outcome | _[number of services migrated, alerts closed, incidents prevented]_ |\r
| What broke, and what you learned | _[fill in]_ |\r
| Maps to behavioural competencies | _[security ownership, influence without authority, reusable design thinking]_ |\r
\r
## Mapping projects to interview rounds\r
\r
Not every project is equally strong in every round. Knowing this in advance means you can steer toward your best material instead of waiting to be asked.\r
\r
| Project | System design round | Behavioural round | Leadership / hiring manager round | Coding / LLD round |\r
|---|---|---|---|---|\r
| News Feed platform | ✅ Strongest | ✅ Strong (disagreement story) | ✅ Strong (led team of four) | Medium — good for data modelling questions |\r
| AI content-processing pipeline | ✅ Strong (event-driven design) | Medium | Medium — mentoring angle if applicable | ✅ Strong (idempotency, retries, DLQ) |\r
| Developer-productivity platform | Medium | ✅ Strong (driving adoption) | ✅ Strong (influence without authority) | Medium |\r
| React commerce/publishing platform | Medium | ✅ Strong (customer focus, pressure) | Medium | ✅ Strong (frontend/full-stack depth) |\r
| Multi-region reliability/security | ✅ Strong (topology, failover) | Medium | ✅ Strong (reusable pattern, adoption) | Medium |\r
\r
> [!WARNING]\r
> If every project in your table only has one "strongest" column, your story bank is too narrow — you'll run out of material the moment an interviewer asks a follow-up outside that one round's usual questions. Aim to have at least two projects that are strong in the behavioural round and two that are strong in system design.\r
\r
## A rehearsal schedule\r
\r
Spread preparation across several sessions rather than cramming the night before — retrieval under pressure improves with spaced repetition, not last-minute review.\r
\r
| When | What to do |\r
|---|---|\r
| 7+ days out | Fill in the template for every major project, including the blank ones above |\r
| 5 days out | Rehearse the one-sentence and two-minute versions of each project out loud, timed |\r
| 3 days out | Practise re-slicing your strongest project for five different question types (system design, disagreement, leadership, failure, ambiguity) |\r
| 2 days out | Drill the numbers table from each project — be ready for "how was that measured?" on every metric |\r
| 1 day out | Run one full mock interview covering at least three of your projects, out loud, not just in your head |\r
| Morning of | Re-read your worksheet once, then stop — do not try to memorise anything new |\r
\r
> [!TIP]\r
> The re-slicing drill on day 3 is the highest-leverage single session. Take your strongest project and answer five different question types using only that project's facts — it's the fastest way to discover which decision points you haven't actually thought through yet.\r
\r
## Cheat sheet\r
\r
- Prepare a small number of rich projects, not one story per possible question.\r
- Fill in all nine fields for each project: problem, constraints, role, architecture, hardest problem, trade-off, outcome, what broke, competency map.\r
- The "hardest technical problem" and "key trade-off" are different fields — don't merge them.\r
- Know which interview round each project is strongest in, so you can steer toward it.\r
- Rehearse re-slicing your strongest project for five different question types.\r
- Spread rehearsal across a week; don't cram the numbers and stories the night before.\r
- Always include a genuine "what broke" entry — a project with no rough edges isn't believable.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Preparing a new story for every possible question | Prepare a few rich projects and re-slice them |\r
| Leaving "what broke" blank because nothing comes to mind | Every real project has one — find it before the interview |\r
| Merging "hardest problem" and "key trade-off" into one line | Answer them separately; they test different things |\r
| Only ever leading with the same one project | Know which round each of your projects is strongest in |\r
| Cramming the whole story bank the night before | Spread rehearsal across a week, with re-slicing on day three |\r
| Filling in the template in your head instead of on paper | Write it down — retrieval under pressure needs it written, not just thought |\r
\r
## Summary\r
\r
A project story is not a single fixed narrative — it's a set of facts you can foreground differently depending on the question. Fill in the nine-field template for every major project on your résumé, using the worked News Feed example as the density bar to hit, and know in advance which interview round each project is strongest in so you can steer toward your best material. Spend the highest-leverage rehearsal session re-slicing your strongest project across five different question types, because that is where you'll find the decision points you haven't actually thought through yet.\r
\r
## Top Interview Questions\r
\r
### Q1. Tell me about a project you're proud of, and what made it hard.\r
\r
I'll talk about the News Feed platform, which replaced more than twenty legacy systems and unified content from hundreds of publishers for millions of players. The hardest part wasn't any single component — it was migrating the read path off a legacy, soon-to-be-deprecated dependency without downtime, while keeping data correct across both the old and new paths during the transition. I owned the architecture end to end and led a team of four; we redesigned the data model around Cosmos DB keyed by game title and added a versioned Redis cache in front of it, which cut p99 latency from around 600ms to 150ms and reduced gateway load by 87%.\r
\r
### Q2. That same project — tell me about a disagreement you had during it.\r
\r
During planning, the product team proposed dropping all existing posts at cutover to reduce migration time and cost. I understood the delivery pressure, but disagreed, because popular games had thousands of posts and losing them would visibly hurt the experience for players and publishers. I raised the concern with concrete examples of customer impact, then proposed a dual-feed alternative — continue serving legacy posts while new content flowed through the new platform as publishers onboarded — instead of just blocking the original proposal. I focus disagreements on the trade-off itself rather than on who's right, and once we'd aligned, I committed fully to executing the agreed plan.\r
\r
### Q3. Same project again — tell me about a time you had to lead without direct authority.\r
\r
Making the News Feed replacement work required aligning several partner teams around one architecture, even though I didn't manage any of them. I brought a concrete high-level design covering the dependency map, the migration approach, and the rollout risks into shared reviews, so each team could see both its own responsibility and the end-to-end outcome rather than negotiating from separate partial views. I used specific decision points in those reviews instead of broad status meetings, and shared enough investigation detail that engineers outside my team could move independently on their pieces. The alignment came from evidence and clear interfaces, not from asking people to simply defer to me.\r
\r
### Q4. What's an example of a mistake or failure in that same project, and what did you learn?\r
\r
Once we included locale and pagination parameters in the cache key, key cardinality was higher than I'd modelled in design, and cache hit rate dipped noticeably in the first days after rollout. I traced it to the key generating far more distinct combinations than the actual content variation justified, tightened the key shape to collapse equivalent states, and hit rate recovered. The lesson was to validate a cache-key design against the real distribution of query parameters before rollout — in a design review it's easy to reason about a key abstractly and miss how many effectively-identical variants it will actually produce in production.\r
\r
### Q5. Tell me about a project where you had to deal with a lot of ambiguity.\r
\r
The same News Feed effort started with no single clean specification, because the legacy behavior was spread across services and several different owners. I created clarity in layers: first mapping the current flows and separating must-have behavior from later optimizations, then writing a concrete design document so unresolved decisions were visible rather than buried in conversations, then driving reviews with the specific stakeholders who owned each dependency. Where a full migration was too risky to commit to blindly, I proposed the dual-feed model, which let implementation and validation move forward before every legacy detail was fully retired. The lesson was that ambiguity shrinks fastest when you publish a concrete model early and iterate with the people who actually own each piece.\r
\r
### Q6. Tell me about a different project — one involving AI or automated decision-making.\r
\r
I'll use a content-certification pipeline that scanned game submissions for unsafe or non-compliant content, replacing a slow manual review process. I owned a specific detection layer within an event-driven pipeline, where text and image signals were mapped to policy rules rather than treated as a final automated decision. A key design principle was that AI output was a signal feeding a deterministic policy layer, with thresholds tuned against labeled examples and hard cases escalated to human reviewers, not silently auto-approved or auto-rejected. That reduced what had been roughly an hour and a half of manual review per title down to seconds, across a high daily volume of submissions.\r
\r
### Q7. Describe a project centered on developer productivity rather than an end-user product.\r
\r
I built an internal developer platform aimed at collapsing a fragmented, manual debugging workflow into one governed console — replacing tasks like manually generating service-to-service auth headers, which used to take fifteen to twenty minutes, with a self-serve flow taking seconds. The architecture was a front-door service fanning out to a registry of tools: data explorers, a request-replay gateway, and workflow investigation views, all gated by role-based access with just-in-time elevation rather than standing production privileges. The hardest problem was making genuinely powerful debugging capability safe enough to hand to a broad set of engineers without creating a new class of production risk, which we solved with read-only defaults and explicit, auditable write actions.\r
\r
### Q8. Tell me about a project centered on frontend or full-stack delivery.\r
\r
I built a sales-authoring web application and its backend-for-frontend used by teams to create discount campaigns, deliberately keeping the frontend layer stateless and delegating all business logic and persistence to a dedicated backend service. The frontend owned the user experience, an AI-assisted drafting feature, and analytics, while the backend transformed authored campaign rules into catalog offers evaluated in real time by the pricing engine. The interesting trade-off was resisting the temptation to let business logic creep into the frontend layer for convenience, because keeping it stateless made the authoring experience easy to iterate on independently of the pricing engine's release cycle.\r
\r
### Q9. Tell me about a security- or reliability-focused project.\r
\r
I led a migration from long-lived shared-key authentication to Managed Identity for a caching layer used by several services, removing an entire class of credential-leak and manual-rotation risk. I proved the pattern generically first, packaged it as a reusable Terraform module so other teams wouldn't have to rediscover the approach, then migrated one service end to end as the reference implementation before it spread further. The genuine cost was that this wasn't a configuration flag — every consuming service needed real code changes to authenticate via workload identity instead of a connection string — so adoption required deliberate per-service migration work, which is the honest trade-off I'd name if asked.\r
\r
### Q10. How do you decide which project to bring up first in an open-ended interview question?\r
\r
I lead with whichever project I can defend most completely across problem, architecture, trade-offs, outcome, and failure — for me, that's the News Feed platform, because I can go deep on any of those dimensions without hitting a gap. I also consider the round: for a system-design-heavy conversation I'd lead with that same project's architecture; for a behavioural round I might lead with the developer-productivity platform, since driving adoption without direct authority is its strongest angle. Knowing in advance which of my projects is strongest in which round means I'm steering the conversation toward prepared ground instead of guessing in the moment.\r
\r
### Q11. If two of your projects could answer the same behavioural question, how do you choose between them?\r
\r
I'd pick whichever one lets me go deeper if the interviewer follows up, rather than the one that sounds better as a one-line summary. For "tell me about influencing without authority," both the News Feed cross-team alignment and the developer-productivity platform's adoption story would technically work, but I have more concrete decision points memorised for the News Feed one — specific teams, specific review moments, a specific proposal I made — so I'd lead with that and hold the other in reserve in case the interviewer wants a second example.\r
\r
### Q12. How often should you revisit and update your project story bank?\r
\r
Whenever a project meaningfully changes — a new metric becomes available, a system evolves, or you notice a gap during practice — and at minimum before any interview cycle even if nothing has obviously changed, because rehearsing a story out loud regularly surfaces weak spots that reviewing it silently in your head never does. I specifically revisit the "what broke" and "key trade-off" fields most often, since those are the ones interviewers probe hardest and the ones most likely to go stale or feel rehearsed if you haven't actually said them out loud recently. Treat the template as a living document, not a one-time exercise you complete and never open again.\r
`;export{e as default};
