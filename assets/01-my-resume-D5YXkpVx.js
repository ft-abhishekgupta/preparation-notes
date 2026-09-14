const e=`---\r
title: My Resume\r
description: The verbatim record of the author's own resume answers, the factual source every other page in this track drills into and defends\r
difficulty: Core\r
tags: [resume, storytelling, preparation]\r
---\r
\r
Every other page in this track exists to defend, expand, or rehearse something written here. This page is the source of record: the actual "About Yourself," career-path, strengths, and behavioural answers the author prepared, kept exactly as written rather than paraphrased. Read it first, because the six-layer drill, the architecture-walkthrough template, and the numbers-defence pages all assume you already know which claims are on the table.\r
\r
> [!KEY]\r
> Nothing on this page is aspirational copy — it is the literal script. If a later page asks you to defend "the 87% number" or "the disagreement story," this is where that number and that story originally came from.\r
\r
## Headline claims at a glance\r
\r
Every number below shows up more than once across this track. Know where it lives here, and which page is built to help you defend it under follow-up questioning.\r
\r
| Claim | Comes from | Drilled into by |\r
|---|---|---|\r
| 7M+ players, 600+ publishers reached | About Yourself, Biggest Achievement | News Feed System |\r
| ~5,000 requests per second sustained | About Yourself, Biggest Achievement | Resume Deep Dive Framework |\r
| 99.99% availability target | About Yourself | Defending Your Numbers |\r
| p99 latency cut from 600ms to 150ms | Biggest Achievement, Biggest Challenge | Architecture Walkthrough Template |\r
| 87% reduction in gateway load | Biggest Achievement, Biggest Challenge | Trade-off Justification Bank |\r
| 20+ legacy systems replaced by one platform | Biggest Achievement | News Feed System |\r
| Led a team of four engineers | About Yourself, Disagreement story | Leadership and Mentoring |\r
| Zero-downtime, dual-feed migration | Disagreement story, Biggest Challenge | Failure Scenario Drills |\r
\r
## Career arc\r
\r
The shape of the career matters as much as any single project: six years of steady widening scope, from UI feature work to end-to-end platform ownership, without a single dramatic pivot to explain away.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    A["B.Tech, IET Lucknow<br/>GATE to IIT Kanpur"] --> B["Joined Xbox<br/>React commerce UIs"]\r
    B --> C["Frontend architecture<br/>Azure hosting, accessibility"]\r
    C --> D["Game Certification System<br/>backend, event workflows"]\r
    D --> E["Promoted SE II<br/>distributed systems, security"]\r
    E --> F["Technical lead<br/>team of four"]\r
    F --> G["News Feed platform<br/>replaced 20+ legacy systems"]\r
\`\`\`\r
\r
## About yourself\r
\r
I'm a backend software engineer and technical lead with more than six years of experience at Microsoft Xbox. I specialize in building scalable distributed systems with C#, .NET, and Azure, and I own services end to end, from architecture and design through production operations.\r
\r
I've built backend platforms that serve more than 7 million players and thousands of game publishers, handling around 5,000 requests per second with 99.99% availability. My work has involved Cosmos DB, Redis, Azure Service Bus, and event-driven architectures. In my current role, I lead a team of four engineers and own the architecture and delivery of the Xbox News Feed system.\r
\r
I've also worked on AI-powered content-processing systems and developer-productivity platforms, while contributing to frontend development when needed. I'm now looking for a backend role where I can solve challenging distributed-systems problems at scale, own products end to end, and continue growing as a technical leader.\r
\r
## Career path\r
\r
I did my B.Tech in Computer Science from IET Lucknow and qualified GATE to pursue my master's at IIT Kanpur. After developing an interest in web and application development through college projects, I joined Microsoft Xbox. I began with React-based platforms for pricing, sales, and game publishing, then expanded into frontend architecture, Azure hosting, accessibility, and API operations.\r
\r
I deliberately moved into backend and platform engineering through the Game Certification System, building services, infrastructure, and event-driven workflows while mentoring junior engineers. After my promotion to Software Engineer II, I took on larger distributed systems, cross-team initiatives, and multi-region reliability and security work.\r
\r
Most recently, I led the replacement of the legacy Xbox Engagement Events and News Feed services with a new system built from the ground up. Overall, my career has progressed from feature delivery to end-to-end system ownership and cross-team technical leadership, while remaining hands-on.\r
\r
## Why the switch\r
\r
I've had strong opportunities at Microsoft Xbox, and I'm proud of the scale and impact of my work there. After more than six years, I was ready to explore new domains and challenges with broader technical ownership. Although I was affected by the recent layoffs, I had already begun considering my next step. I'm now looking for an environment where I can apply my experience in high-scale services, platform engineering, and technical leadership to create even greater impact.\r
\r
> [!TIP]\r
> Close this answer with a line specific to the company and role you're actually in front of — a generic ending is the single easiest way to make a strong answer sound rehearsed.\r
\r
## Why this company, why this role\r
\r
The honest structure here is two connected halves, not one generic paragraph: first connect the response to the company (its products, scale, or engineering culture), then connect it to the specific role (the technologies, seniority, or team charter in the job description). Prepare both halves fresh for every loop — see Questions to Ask and Company Prep for the research that feeds this answer.\r
\r
## Strengths\r
\r
**Technical ownership.** I take end-to-end ownership, from clarifying requirements and designing the architecture to implementation, production rollout, and operational support.\r
\r
**Problem solving.** I break ambiguous problems into manageable pieces, evaluate alternatives, and use prototypes to validate ideas early. This approach has helped me align teams and drive decisions on complex cross-team projects.\r
\r
**Team player.** I build strong working relationships, communicate risks and challenges early, and help teammates get unblocked. I focus on shared outcomes, knowledge sharing, and creating an environment where the team can succeed together.\r
\r
## What motivates you\r
\r
- Solving ambiguous, technically challenging problems through structured thinking.\r
- Continuously learning and expanding my technical capabilities.\r
- Working in a healthy, collaborative environment where people openly share ideas and support one another.\r
- Creating meaningful impact and receiving constructive feedback that helps me improve.\r
\r
## Weakness / area you are working on\r
\r
I'm working on balancing depth with speed. I naturally seek an end-to-end understanding of systems and explore edge cases and failure scenarios. While this is valuable for production systems, it can slow lower-risk decisions. I now prioritize critical risks, make the simplest sound decision, and go deeper only when the scale or impact justifies it.\r
\r
## Disagreement with team or manager\r
\r
During planning for the News Feed replacement, the product team proposed dropping all existing posts at cutover to reduce migration time and cost. I understood the delivery pressure but disagreed because popular games had thousands of posts, and losing them could damage the experience for both players and publishers.\r
\r
I raised the concern with engineering leadership and the product team, using concrete examples to explain the customer impact. I proposed validating the decision with key publishers and offered a dual-feed alternative: continue serving legacy posts while publishers onboarded and began publishing through the new platform.\r
\r
When I disagree, I focus on the problem and trade-offs rather than on who is right. I seek to understand the other perspective, present evidence and practical alternatives, and then commit to the final decision so the team can move forward. See Conflict and Disagreement for the general version of this pattern.\r
\r
## Biggest achievement\r
\r
One of my biggest achievements was leading the development of Xbox's unified News Feed platform. I led the team and owned the system end to end, from architecture and implementation to migration and production rollout.\r
\r
The platform replaced more than 20 legacy systems and unified content from hundreds of publishers for millions of players across Xbox storefronts, handling around 5,000 requests per second.\r
\r
I also redesigned the data-access and caching strategy using Cosmos DB and Redis. This reduced p99 read latency from approximately 600 milliseconds to 150 milliseconds and lowered gateway load by 87%.\r
\r
This achievement is particularly meaningful because it combined large-scale modernization, measurable performance gains, and hands-on technical leadership throughout the product lifecycle.\r
\r
## Biggest challenge\r
\r
One of my biggest challenges was migrating a critical production service away from complex legacy dependencies without disrupting live traffic. The existing system had limited documentation and no clear owners, while also contributing significantly to latency and gateway load. I used AI-assisted analysis to accelerate my understanding of the system before designing its replacement.\r
\r
I led a phased, zero-downtime migration. We redesigned the data model and partitioning strategy, introduced a new Cosmos DB path with Redis caching, and gradually shifted traffic using feature flags and configuration controls. Throughout the rollout, we monitored both paths closely to protect correctness and reliability.\r
\r
The migration reduced p99 read latency from approximately 600 milliseconds to 150 milliseconds and lowered gateway load by 87%. My key learning was that, for critical distributed systems, a safe migration strategy is just as important as the target architecture.\r
\r
> [!NOTE]\r
> "Failure faced" and "complex production issue" are deliberately left open here rather than padded out — walk through Failure and Learning to build one specific, honest incident story for each before an interview, instead of reusing the migration story a third time.\r
\r
## Where you see yourself in five years\r
\r
Over the next three to five years, I want to grow into a stronger senior or staff-level technical leader while remaining hands-on. I aim to own increasingly complex distributed systems, make sound architectural decisions, and influence outcomes across teams. I also want to help other engineers grow through mentoring and technical guidance, combining deep engineering work with broader organizational impact.\r
\r
## Questions for them\r
\r
- "What are the most challenging technical problems the team is currently working on?"\r
- "How are architecture and technical decisions typically made within the team?"\r
- "What would success look like for someone in this role in the first six months?"\r
- "What are the biggest scalability or reliability challenges the team expects to tackle over the next year?"\r
\r
## Project story framework\r
\r
Every project answer follows the same chain: Problem → Requirements → Architecture → Your contribution → Key design decisions → Trade-offs → Scale → Failure handling → Performance → Monitoring → Biggest challenge → Result. Project Story Templates works this exact chain in full for one project and leaves it blank for the rest.\r
\r
## Cheat sheet\r
\r
- This page is the factual record — every number and story elsewhere in this track traces back to a line above.\r
- 7M+ players, 600+ publishers, ~5,000 RPS, 99.99% availability, 600ms→150ms p99, −87% gateway load, 20+ legacy systems replaced, team of four.\r
- "I" for decisions you made alone; "we" for team execution — and know exactly which is which for every bullet here.\r
- The disagreement story, the achievement story, and the challenge story all point at the same News Feed platform — practise telling each from a different angle.\r
- Customize "why this company," "why this role," and the closing question list for every loop; never deliver them generically.\r
- Two answers are intentionally blank here — prepare a real failure story and a real incident story before you need them.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Reading the resume answer aloud verbatim in the interview | Use it as ground truth, then tell it as a spoken story |\r
| Giving a generic "why this company" answer | Research the specific company and role every time |\r
| Reusing the same migration story for achievement, challenge, and disagreement without variation | Foreground a different layer (leadership, trade-off, technical depth) each time |\r
| Claiming the "we" outcomes as solely "I" | State the boundary of your personal contribution explicitly |\r
| Offering a rehearsed, harmless "weakness" | Use the real depth-versus-speed pattern and its concrete fix |\r
| Leaving "failure faced" blank in the actual interview | Prepare one specific, honest incident before you need it |\r
| Treating "why are you leaving" as a complaint session | Frame it as growth toward broader ownership, not escape |\r
\r
## Summary\r
\r
This page is the unedited record: the actual claims, numbers, and stories the rest of this track is built to defend. The News Feed platform carries the heaviest weight — it is simultaneously the achievement story, the biggest-challenge story, and the disagreement story, so practise telling it from three different angles rather than treating it as three different projects. Two answers were left open by design; fill them in with real, specific incidents before an interview, because an interviewer will notice a rehearsed non-answer faster than an honest one. Everything else in this track — the six-layer drill, the numbers defence, the trade-off bank — exists only to make the claims on this page hold up under thirty minutes of follow-up questions.\r
\r
## Top Interview Questions\r
\r
### Q1. Walk me through your resume\r
\r
Six-plus years at Microsoft Xbox, moving from React-based commerce and publishing UIs into frontend architecture, then deliberately into backend and platform engineering through the Game Certification System. After promotion to SE II I took on larger distributed systems and cross-team work, and most recently led the replacement of the legacy Engagement Events and News Feed services — architecture, implementation, migration, and production rollout for a platform serving 7M+ players at roughly 5,000 requests per second with 99.99% availability.\r
\r
### Q2. How do you know the platform actually serves 7 million players at 5,000 requests per second\r
\r
The 7M+ figure is the reachable player base across the storefronts the News Feed platform serves; the ~5,000 RPS is sustained read load measured at the front-door layer during normal traffic, not a peak burst. The two numbers are consistent with each other once you account for daily-active fraction, session read counts, and peak-to-average ratio — I can walk through that derivation live rather than just reciting both figures.\r
\r
### Q3. What exactly did you redesign to get p99 latency from 600ms to 150ms\r
\r
I redesigned the data-access and caching strategy: introduced Cosmos DB as the durable source of truth with a partition key aligned to the actual read pattern, and put a versioned Redis cache in front of it so most reads never touch the database. The 4x improvement came from removing an expensive legacy dependency chain from the hot path, not from a single tuning change, which is also why gateway load dropped 87% in the same effort.\r
\r
### Q4. Tell me about the disagreement over dropping posts at cutover\r
\r
The product team wanted to drop all existing posts at cutover to save migration time and cost. I disagreed because popular games had thousands of posts and losing them would hurt both players and publishers. I brought concrete examples of the impact, proposed validating with key publishers first, and offered a dual-feed alternative — legacy and new content served together during onboarding — which the team adopted instead of the original plan.\r
\r
### Q5. What was the hardest part of the News Feed migration\r
\r
Migrating a critical production service off undocumented legacy dependencies without disrupting live traffic. I used AI-assisted analysis to accelerate understanding the existing system, then led a phased, zero-downtime migration: new partitioning and data model, a new Cosmos DB path with Redis caching, and a gradual, feature-flagged traffic shift while both paths were monitored side by side for correctness.\r
\r
### Q6. What is your greatest strength, and can you prove it\r
\r
End-to-end technical ownership — clarifying ambiguous requirements myself, designing the architecture, building it, and staying accountable through production rollout and operations. The News Feed platform is the clearest proof: I owned it from initial design through the caching redesign to the final migration, not just one stage of it.\r
\r
### Q7. What's a weakness you're actively working on\r
\r
I default to wanting full end-to-end understanding of a system, including edge cases and failure modes, which is valuable for production reliability but can slow down lower-risk decisions. My fix has been to explicitly separate critical risks from minor ones, make the simplest sound call on the minor ones, and reserve deep investigation for where the scale or impact actually justifies it.\r
\r
### Q8. Why are you looking to leave Microsoft\r
\r
I've had strong opportunities and real impact at Xbox over six-plus years, and I'm proud of that work. After this long I want broader technical ownership and new domains to apply high-scale platform and leadership experience to — it's a move toward something, driven by growth, not away from a negative experience, layoffs notwithstanding.\r
\r
### Q9. Where do you see yourself in five years\r
\r
Growing into a stronger senior or staff-level technical leader while staying hands-on: owning increasingly complex distributed systems, making the architectural calls, and helping other engineers grow through mentoring, so the impact compounds beyond just my own output.\r
\r
### Q10. What motivates you day to day\r
\r
Solving ambiguous, technically hard problems through structured thinking, continuously growing my technical range, working somewhere people share ideas openly, and getting feedback specific enough to actually improve from.\r
\r
### Q11. What would you ask us if the roles were reversed\r
\r
I'd ask about the hardest technical problems the team is solving right now, how architecture decisions actually get made, what success looks like for this role at six months, and what scalability or reliability challenges are coming over the next year — all questions aimed at whether this is a place I can own hard problems, not just fill a seat.\r
\r
### Q12. Why did you move from frontend work into backend and platform engineering\r
\r
It was a deliberate choice, not an accident of assignment. After building React-based commerce and publishing UIs and expanding into frontend architecture and Azure hosting, I actively moved into the Game Certification System to build backend services and event-driven workflows, because that's where I wanted to specialize — and the subsequent promotion and the News Feed platform ownership are the direct result of that choice paying off.\r
`;export{e as default};
