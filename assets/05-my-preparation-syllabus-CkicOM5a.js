const e=`---\r
title: My Preparation Syllabus\r
description: A topic-by-topic study plan with depth targets and ordering, built breadth-first around a backend and distributed-systems specialization\r
difficulty: Core\r
tags: [resume, preparation, planning, system-design]\r
---\r
\r
A résumé like the one on My Resume can be tested from roughly twenty different technical and behavioural angles, and no candidate has time to prepare all twenty to the same depth. This page is the study plan that resolves that tension: a breadth-first sweep across the areas any senior backend interview loop might touch, with deliberate extra depth on the areas this particular résumé actually earns — distributed systems, Azure, and technical leadership — rather than an even coat of preparation everywhere.\r
\r
> [!KEY]\r
> The strongest interview narrative here is six-plus years at Microsoft Xbox, moving from full-stack delivery into backend-focused distributed systems, Azure platform engineering, technical leadership, and now AI engineering. Every topic below is prioritized against how well it supports that specific narrative — not against some universal ranking of "important" computer-science topics.\r
\r
## The prioritization principle\r
\r
Don't try to get equally deep in everything. With around twenty plausible topic areas and a finite number of preparation hours, the only sustainable strategy is breadth-first coverage — enough working knowledge everywhere that nothing is a total blank — layered with deep, defensible expertise in the handful of areas where this résumé's actual claims live. An interviewer can spend thirty to forty-five minutes on a single bullet like the 5K RPS/99.99% availability system, the Cosmos/Redis redesign, the event-driven AI platform, or the security work, so those areas need textbook-plus-implementation depth, not textbook depth alone.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    A["DSA"] --> B["Backend / APIs"]\r
    B --> C["Distributed systems"]\r
    C --> D["Azure"]\r
    D --> E["HLD"]\r
    E --> F["LLD"]\r
    F --> G["C# / .NET"]\r
    G --> H["Messaging"]\r
    H --> I["Databases"]\r
    I --> J["Resume deep dive"]\r
    J --> K["Leadership"]\r
    K --> L["AI / GenAI"]\r
\`\`\`\r
\r
> [!TIP]\r
> Read the chain above as a preparation *order*, not a strict dependency graph — DSA comes first because it is the most time-boxed and mechanical to drill, and the resume deep dive sits late because it is most effective once every other topic underneath it has already been refreshed.\r
\r
## The syllabus at a glance\r
\r
Sixteen topic areas cover essentially everything a senior backend or technical-lead loop can test, without ballooning into an endless checklist. Depth is relative: "deep" means you can design, defend trade-offs, and handle a live follow-up; "medium" means you can hold a competent conversation but aren't expected to lead the design.\r
\r
| Topic area | Target depth | Why it's on the list | Anchor subtopics |\r
|---|---|---|---|\r
| DSA & problem solving | Deep, ~100–150 problems | Still the entry gate for most loops | Arrays/hashmaps, two pointers, graphs, DP, complexity analysis |\r
| C# / .NET | Deep | Resume explicitly claims C#, .NET Core, ASP.NET Core | Async/await, generics, LINQ, GC, concurrency primitives |\r
| ASP.NET Core / backend APIs | Deep | The daily craft behind every claimed system | REST design, middleware, DI lifetimes, resilience patterns |\r
| System design / HLD | Very deep | The résumé's strongest evidence — 5K RPS, 7M+ players, 99.99% | Building blocks, CAP, replication, 10–15 practice designs |\r
| Azure | Deep | Every system on the résumé runs on Azure | Cosmos DB deep dive, Service Bus, Redis, identity |\r
| Databases | Deep | Cosmos, SQL, and Redis all appear in real projects | Partitioning, indexing, isolation levels, cache patterns |\r
| Messaging & event-driven | Very deep | The AI certification platform is a Service Bus deep-dive waiting to happen | DLQ, idempotency, outbox, ordering, backpressure |\r
| LLD / OOD | Deep | Expected at senior and staff-adjacent loops | SOLID, design patterns, 10–15 practice LLD problems |\r
| AI / GenAI engineering | High | Explicitly on the résumé — agents, MCP, RAG, embeddings | Tool calling, retrieval, agent loops, guardrails |\r
| Frontend (React/TypeScript) | Medium | Supports the "full-stack" framing, not the headline | Hooks, rendering, SPA architecture, XSS/CSRF |\r
| Security | Medium | OAuth, RBAC, JIT and CVE remediation are real experience | Managed Identity, least privilege, web security basics |\r
| Kubernetes / DevOps | Medium | Every service on the résumé runs on AKS | Pods, HPA/KEDA, CI/CD, Terraform basics |\r
| Observability & reliability | Deep in narrative, medium in tooling | On-call and SLO experience is real and citable | SLI/SLO/error budgets, incident response, RED method |\r
| Testing | Medium | Expected competence, rarely the headline | Unit vs integration, mocking, test pyramid |\r
| Software engineering fundamentals | Medium | Baseline hygiene interviewers assume | SOLID, versioning, migration strategy, profiling |\r
| Resume deep dive & behavioural | Critical, ongoing | Almost every résumé line is a question in disguise | Six-layer drill, STAR stories, leadership-principle mapping |\r
\r
## Critical-priority areas: go deep here first\r
\r
Six areas are marked critical, and they share one property: an interviewer can stay on any single one of them for the length of an entire round. **Resume deep dive** comes first in practice time even though it isn't a "topic" — treat every project bullet as five implicit questions (problem, architecture, your contribution, trade-offs, scale, failure modes) before touching anything else, because it is the fastest way to discover which technical areas actually need refreshing. **HLD and distributed systems** is the résumé's best evidence: master the CAP trade-offs, replication and partitioning strategies, and ten to fifteen practice designs (news feed, rate limiter, notification system, chat, ticket booking, and similar) to the point of defending a whiteboard for thirty minutes unaided.\r
\r
**DSA** stays critical because it remains the entry gate at most companies regardless of seniority — the efficient target is roughly 100–150 carefully chosen problems across core patterns (two pointers, sliding window, graphs, DP variants) rather than grinding hundreds at random. **C#/.NET** and **Azure** are critical because the résumé is explicit about them: expect deep questions on async internals, garbage collection, and concurrency primitives on the language side, and on Cosmos DB partitioning, RU/s, consistency levels, and Service Bus semantics on the platform side — Cosmos DB in particular deserves its own dedicated pass given how central it is to the biggest achievement story. **Backend/API design** rounds out the critical set because it's the connective tissue between all the others: REST conventions, idempotency, rate limiting, and the resilience patterns (retry, circuit breaker, bulkhead) show up in almost every design conversation.\r
\r
## High-priority areas: strong supporting depth\r
\r
**LLD/OOD**, **databases**, **messaging and event-driven architecture**, **behavioural/leadership**, and **AI/LLM/RAG/agents** sit one notch below critical — expect them to come up, expect real depth to be rewarded, but they rarely anchor an entire loop by themselves. Messaging deserves particular attention because the AI certification platform is explicitly a Service Bus consumer story with retries, dead-letter queues, and idempotency, which makes it a natural deep-dive target once an interviewer notices it. Leadership questions deserve STAR-format stories, not just adjectives — "I led a team of four" needs a specific decision, a specific disagreement, and a specific outcome behind it, not just the claim itself.\r
\r
> [!WARNING]\r
> Don't let "high priority" quietly become "equal to critical." The moment LLD or databases prep starts eating into HLD or resume-deep-dive time, the balance has tipped in the wrong direction — protect the critical six first.\r
\r
## Medium-priority areas: enough to not lose points\r
\r
Security, Kubernetes/Docker, DevOps/Terraform, React/TypeScript, testing, and general computer-science fundamentals round out the syllabus. These are "don't lose points" topics rather than "win points" topics: a competent, grounded answer is enough, and the résumé's real security and Kubernetes experience (OAuth 2.0, RBAC, JIT access, Managed Identity, CVE remediation, AKS) means you likely already clear the bar without dedicated grinding — a light refresh of the vocabulary and one or two war stories is usually sufficient.\r
\r
## Practice system designs to master\r
\r
Depth on ten to fifteen designs beats shallow familiarity with fifty. The list below is deliberately close to what this résumé's real projects resemble, so each practice design doubles as rehearsal for a real project story.\r
\r
| Practice design | Real-project analogue |\r
|---|---|\r
| News feed | The actual News Feed platform replacement |\r
| Rate limiter, notification system | Backend/API resilience patterns |\r
| Chat system, video streaming | Real-time and high-throughput read paths |\r
| Ticket booking, ride sharing, e-commerce | Consistency and transaction trade-offs |\r
| Distributed job scheduler | KEDA-style event-driven workers |\r
| Content moderation pipeline | The AI certification platform |\r
| Distributed cache | The Redis cache-aside redesign |\r
\r
## Company-specific prep, every single time\r
\r
Before each interview loop, spend one to two hours mapping the résumé onto the specific company: their products, business model, recent launches, and engineering culture; the exact job description and its required technologies and seniority bar; and the interview format itself (coding, HLD, LLD, behavioural, managerial, domain-specific). This step is cheap and is the difference between a generically strong candidate and one who sounds like they actually want this job.\r
\r
## Cheat sheet\r
\r
- Depth order: resume deep dive and HLD first, then DSA, C#/.NET, Azure, and backend/API design — these six are critical and can each anchor a full round.\r
- High priority, not critical: LLD/OOD, databases, messaging, behavioural/leadership, AI/RAG/agents.\r
- Medium priority: security, Kubernetes/DevOps, React/TypeScript, testing, general CS fundamentals — competent, not exhaustive.\r
- DSA target is ~100–150 well-chosen problems, not hundreds solved at random.\r
- Master 10–15 system designs deeply rather than sketching fifty shallowly.\r
- Spend one to two hours per company mapping résumé to job description before every loop.\r
- Revisit the priority matrix whenever prep time is scarce — it tells you what to cut first.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Spreading equal effort across all sixteen topic areas | Protect the six critical areas first; let medium-priority topics stay light |\r
| Solving hundreds of random DSA problems for volume | Target ~100–150 problems chosen by pattern coverage |\r
| Sketching many system designs shallowly | Go deep on 10–15 designs that resemble your real projects |\r
| Treating the résumé deep dive as a one-time read-through | Run the six-layer drill on every bullet before every loop |\r
| Skipping company research because the technical prep feels more urgent | Block 1–2 hours per company; it changes how every answer lands |\r
| Letting "high priority" topics quietly crowd out "critical" ones | Re-check the priority matrix before adding new prep material |\r
| Preparing leadership claims as adjectives instead of stories | Attach a specific STAR story to every leadership claim |\r
\r
## Summary\r
\r
This syllabus turns an unmanageable list of "everything a senior interview could test" into roughly sixteen topic areas with an explicit order, depth target, and rationale for each. The résumé deep dive and system design sit at the top because they carry the most evidence and the most follow-up risk; DSA, C#/.NET, Azure, and backend API design follow close behind because the résumé makes them explicit claims; everything else is calibrated to "don't lose points" rather than "win points." The priority matrix is the single reference to return to whenever preparation time runs short — when in doubt, spend it on the critical six, not on spreading thinner across all sixteen.\r
\r
## Top Interview Questions\r
\r
### Q1. How did you decide what to prioritize in your interview preparation\r
\r
I mapped my résumé's actual claims against the topics a senior backend loop is likely to test, then prioritized breadth-first coverage everywhere with deliberate extra depth on the areas my résumé provides the strongest evidence for — distributed systems, Azure, and technical leadership — rather than spreading equal effort across every possible computer-science topic.\r
\r
### Q2. Why put the resume deep dive at the top of your prep plan instead of a technical topic\r
\r
Because almost every technical question in my loops traces back to a résumé bullet — running the six-layer drill (problem, architecture, contribution, trade-offs, scale, failure modes) on each one tells me exactly which technical areas actually need refreshing, so it's the highest-leverage thing to do first, not a separate box to check afterward.\r
\r
### Q3. How many DSA problems do you think is enough, and why that number\r
\r
Around 100 to 150, chosen for pattern coverage rather than volume — arrays, two pointers, sliding window, graphs, and the main DP variants. Past that point, additional problems mostly repeat patterns I already know, so the marginal value drops sharply compared to spending that time on system design or my own project depth.\r
\r
### Q4. How do you decide how deep to go on a given topic\r
\r
I look at how directly my résumé claims it and how likely a single question is to turn into thirty minutes of follow-up. Cosmos DB and distributed systems get very deep treatment because they're the backbone of my biggest achievement; something like Kubernetes gets a lighter refresh because my real experience there is genuine but not the headline of any story.\r
\r
### Q5. What would you cut first if you only had two days to prepare\r
\r
Everything at medium priority — security trivia, Kubernetes internals, frontend deep dives, general CS fundamentals — in favor of re-running the resume deep dive and rehearsing my two or three strongest system design stories out loud. Two days is enough to sharpen what I already know well, not to build new depth from scratch.\r
\r
### Q6. Why does messaging and event-driven architecture get "very deep" priority instead of just "high"\r
\r
Because the AI certification platform is a genuine Service Bus deep-dive waiting to happen — idempotent consumers, retries, dead-letter queues, and an event-driven pipeline are real things I built, not textbook knowledge. Any interviewer who pulls on that thread will get real depth back, so it earns the extra preparation time.\r
\r
### Q7. How do you avoid over-preparing on topics that feel comfortable and under-preparing on weaker ones\r
\r
I use the priority matrix as an external check rather than my own comfort level — if I notice I'm spending time on a medium-priority topic because it's enjoyable while a critical one is stale, that's a signal to redirect, not a sign the plan needs to change.\r
\r
### Q8. What's the risk of preparing sixteen topic areas instead of just the two or three your résumé is strongest in\r
\r
Interview loops are rarely predictable enough to bet everything on two topics — a behavioural round, a security question, or an LLD problem can show up even in a role framed around distributed systems. The sixteen-area breadth sweep exists so nothing is a total blank, while the depth investment still concentrates on the handful of areas that carry the real evidence.\r
\r
### Q9. How do you use company-specific research inside a broader syllabus like this\r
\r
I treat it as the final one to two hours before each loop, not a parallel preparation track — I take the same sixteen-area syllabus and re-weight it against the specific job description and interview format, so the generic depth I've already built gets pointed at the right targets for that company.\r
\r
### Q10. How do you know when a topic has reached "interview depth" rather than "textbook depth"\r
\r
When I can take a real follow-up question — "why that database, not X," "what happens if that cache goes down," "how did you measure that number" — and answer it with a specific decision or number rather than a general principle. Textbook depth explains what a circuit breaker is; interview depth explains why I did or didn't use one on a specific system.\r
\r
### Q11. How would you structure a study plan for someone with only three weeks before their first loop\r
\r
Week one on the résumé deep dive and the highest-priority system designs, because they compound into everything else. Week two on DSA pattern coverage and the C#/.NET and Azure specifics the résumé claims. Week three on rehearsal — practice designs out loud, STAR stories timed to ninety seconds, and company-specific mapping for the first scheduled loop, rather than cramming new topics that late.\r
\r
### Q12. Isn't a sixteen-area syllabus still just an endless checklist in disguise\r
\r
No, because every area has an explicit depth target and a stated reason tied back to the résumé, instead of an open-ended "learn everything" list. The priority matrix is what keeps it a plan rather than a checklist: it tells me exactly where to stop going deeper and move on, which is the part most unstructured preparation gets wrong.\r
`;export{e as default};
