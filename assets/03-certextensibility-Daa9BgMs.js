const e=`---\r
title: CertExtensibility\r
description: The automated certification backend behind XShield that scans every game submission for unsafe copycat malicious or non compliant content\r
difficulty: Core\r
tags: [xbox, certextensibility, service-bus, ai-moderation]\r
---\r
CertExtensibility is the certification backend behind XShield, Xbox's automated content-certification engine. Every game submission is scanned for unsafe, copycat, malicious or non-compliant content, and what used to take roughly 1.7 hours of manual review per title now takes seconds — across more than 150 titles a day, both before and after launch.\r
\r
## What it is\r
\r
It is an event-driven pipeline that runs automated checks on submissions and routes hard cases to human reviewers, rather than trying to fully automate every decision.\r
\r
### Pre-launch\r
\r
When a publisher submits in Partner Center, Smart Cert triggers XShield. Automated scans run, and decisions flow back as allow, hold, take-down or notify — a synchronous-feeling gate at the point of submission.\r
\r
### Post-launch\r
\r
Live games are re-scanned continuously, on a daily cadence, to catch new threats that didn't exist at submission time: malware discovered after release, copycat titles that launched later, pricing arbitrage, and hidden games.\r
\r
> [!NOTE]\r
> CertExtensibility is triggered by, and reports back into, other systems on this platform — Partner Center submissions and Smart Cert on the way in, XPMC and CMX on the way out. It is the automated judgment layer sitting between "a publisher submitted something" and "the Store allowed, held or took it down."\r
\r
## Architecture\r
\r
\`\`\`mermaid\r
flowchart TB\r
    Pub["Publisher submits"] --> PC["Partner Center"]\r
    PC -->|Smart Cert hook| CE["CertExCore<br/>certification backend"]\r
    CE --> WF["CertExWorkflows<br/>orchestration"]\r
    WF --> Rules["Static rule checks<br/>+ AV scan validation"]\r
    WF --> AI["AI detection<br/>moderation, similarity, GPT classify"]\r
    Rules --> Res[("Cosmos: AutomatedResults")]\r
    AI --> Res\r
    CE -->|hard cases| XCert["XCert<br/>human reviewers"]\r
    CE -->|results JSON| SB["Service Bus to XPMC"]\r
    SB --> Store["Allow / hold / takedown<br/>on the Store"]\r
    classDef r fill:#fce9e8,stroke:#c23934;\r
    class CE,WF r;\r
\`\`\`\r
\r
A submission flows from Smart Cert into CertExCore. Workflows run static rule checks plus AI detection, persist results in Cosmos, escalate hard cases to XCert reviewers, and publish the final decision to XPMC over Service Bus.\r
\r
| Direction | System | Why |\r
|---|---|---|\r
| Trigger | Partner Center + Smart Cert (pre-publish); Job Invoker (post-publish) | Submissions and periodic rescans kick off certification |\r
| Calls | PartnerCenterCore, XPackageRegistryCore, SMGCore, ProductConfiguration | Submission, package and product context |\r
| Escalates to | XCert (reviewer-driven) | Edge cases and handheld verification |\r
| AI services | WatchFor (CommunitySift + Azure Content Safety), Azure OpenAI (Semantic Kernel), Azure AI Search | Text/image moderation; copycat similarity via embeddings |\r
| Publishes to | XPMC via Service Bus topic; CMX post-publish endpoint | Final allow/hold/takedown decisions |\r
| Stores in | Cosmos: \`Certifications\`, \`AutomatedResults\`, workflow \`jobs\`/\`jobhistory\` | Results and audit |\r
\r
| Component | Role |\r
|---|---|\r
| CertExCore | Certification backend, entry point for Smart Cert and Job Invoker |\r
| CertExWorkflows (WorkflowV2) | Four-stage orchestration state machine |\r
| CertExJobs | Job scheduling and periodic rescans |\r
| Service Bus queues | Durable handoff between pipeline stages |\r
| Cosmos DB | Results, audit trail, workflow job state |\r
| WatchFor / Azure OpenAI | Text/image moderation and copycat similarity |\r
| XCert | Human reviewer escalation path |\r
\r
## Data and request flow: the four-stage pipeline\r
\r
The post-publish certification pipeline is built on the WorkflowV2 shared library as a state-machine pipeline: each stage is its own workflow that listens on a dedicated Service Bus queue, processes the job, then enqueues the next stage. A periodic Job Invoker worker seeds new jobs for updated products.\r
\r
| Stage | What it does |\r
|---|---|\r
| 1. Aggregator | Collects incremental product data and metadata from internal and external sources and prepares it for analysis |\r
| 2. Analyzer | Runs the detection rules: text and image moderation, flagged words, title/description/image/product similarity, bad-URL checks |\r
| 3. Evaluator | Maps rule violations to \`PublicPolicy\` / \`InternalPolicy\` categories and sets the final violation status |\r
| 4. Invoker | Consolidates and persists the result summary to Cosmos, and calls CMX's post-publish endpoint for suspicious games |\r
\r
\`\`\`mermaid\r
flowchart LR\r
    JIW["Job Invoker worker<br/>periodic: seeds jobs"] --> Q1\r
    Q1(["certexaggregatornotifier"]) --> AG["Aggregator<br/>gather data"]\r
    AG --> Q2(["certexanalyzernotifier"])\r
    Q2 --> AN["Analyzer<br/>moderation + similarity"]\r
    AN --> Q3(["certexevaluatornotifier"])\r
    Q3 --> EV["Evaluator<br/>policy mapping"]\r
    EV --> Q4(["certexinvokernotifier"])\r
    Q4 --> IN["Invoker<br/>persist + notify"]\r
    IN --> Cos[("Cosmos results")]\r
    IN --> CMX["CMX post-publish endpoint"]\r
    classDef q fill:#fbf3e2,stroke:#b7791f;\r
    class Q1,Q2,Q3,Q4 q;\r
\`\`\`\r
\r
Each stage is triggered by its own Service Bus queue and hands the job to the next queue — a durable, restartable state machine. WorkflowV2 tracks each job's state in Cosmos (\`jobs\` / \`jobhistory\`), which is what makes the pipeline resumable rather than needing to restart a submission from scratch after a failure.\r
\r
The Analyzer stage is where most of the detection intelligence lives: WatchFor text moderation combines CommunitySift and Azure Content Safety with configurable thresholds; image moderation goes through WatchFor with category-based scoring; similarity and copycat detection uses AI embeddings (Azure OpenAI via Semantic Kernel plus Azure AI Search) compared against the top 1,000 existing titles; and rule weights and mappings are configurable per resource type — Title, Description, Image, ImageText, Product — so a false-positive-prone check can be tuned down without redeploying code.\r
\r
| Endpoint | Purpose |\r
|---|---|\r
| \`POST /createJob\` | Create a certification job |\r
| \`GET /{certificationId}/results\` | Fetch automated and manual results |\r
| \`POST /{certificationId}/publishReview\` | Publish a manual reviewer decision |\r
| \`POST /api/v1/XCertResults\` | Ingest XCert reviewer results |\r
\r
## Under the hood\r
\r
Cosmos DB holds the results and the workflow pipeline state: \`XCertResultsData\`, \`Certifications\` (partitioned by \`/entityId\`), \`AutomatedResults\` (\`/certificationId\`), \`ManualReviews\` (\`/certificationId\`), and the WorkflowV2 \`jobs\`/\`jobhistory\` containers. Service Bus carries the four stage queues (\`certexaggregatornotifier\`, \`certexanalyzernotifier\`, \`certexevaluatornotifier\`, \`certexinvokernotifier\`), publishes final decisions to \`xshield-xpmc-topic\`, and polls \`xcerteventnotifier-topic\` for XCert reviewer events flowing back in. Publisher package attachments live in the \`packagecertattachments\` blob container, with a separate blob container for analysis datasets and artifacts, and the service authenticates as a managed identity (\`mui-certextensibility-xbs-prod\`) rather than a static credential.\r
\r
Key business logic worth naming by component: \`CertBusinessLogic\` handles pre-publish validation and the XCert publish path — gating to games in a retail sandbox, creating a pre-publish workflow, running the \`AvScan\` check, computing the overall result, then upserting Cosmos and publishing to Service Bus. \`CertificationBusinessLogic\` creates certification jobs, retrieves metadata and results, publishes manual reviews, and triggers aggregation once all review teams finish. \`CertReportBusinessLogic\` stores XCert report data and issues attachment SAS URLs for upload and download. \`CommitReviewPollerBusinessLogic\` reads commit-review messages, resolves jobs in CertExWorkflows, and merges XCert results back in.\r
\r
## The hard problems\r
\r
**Durability without a central orchestrator.** Because stages communicate through Service Bus queues rather than a synchronous call chain, the pipeline is naturally durable: a crash mid-stage just means the message is re-delivered. Consumers are idempotent, with retry and back-off plus dead-letter queues, and WorkflowV2 records every state transition in Cosmos \`jobs\`/\`jobhistory\` for audit and requeue. This matters because certification jobs can take a variable amount of time — a full copycat similarity scan is not instant — and a design that assumed a single long-lived request would be far more fragile.\r
\r
**Cutting false positives without missing real violations.** Automated detection combines multiple independent signals — rule-based checks, WatchFor moderation scores, and embedding-based similarity — precisely because any single signal alone is either too aggressive or too permissive. Configurable thresholds and per-resource-type rule weights let the team tune the Analyzer's sensitivity based on observed outcomes, which is how false positives came down roughly 12% without a wholesale rewrite of the detection logic.\r
\r
**Knowing when to escalate instead of auto-deciding.** Not every submission can be safely resolved by rules and AI alone. The Evaluator's policy mapping produces a violation status, but hard or ambiguous cases route to XCert for human review rather than forcing an automated allow/take-down decision. This is a deliberate design boundary: automation handles the volume, humans handle the judgment calls, and the pipeline is built to hand off cleanly between the two rather than trying to eliminate human review entirely.\r
\r
**Catching threats that appear after launch, not just at submission.** A game that was clean at submission time can become a problem later — new malware, a copycat that launched afterward, pricing arbitrage, or a hidden game. The post-launch path exists specifically because pre-launch certification is a point-in-time check, and the periodic Job Invoker worker re-runs the same four-stage pipeline against live titles daily so the certification decision doesn't go stale the moment a title ships.\r
\r
> [!KEY]\r
> The reliability story here is entirely about the messaging layer, not the business logic: idempotent, retryable, dead-lettered Service Bus consumers plus a Cosmos-backed audit trail turn "a stage crashed" into "the message gets redelivered and the job resumes," not "the certification is lost."\r
\r
## Scale and reliability\r
\r
| Metric | Value |\r
|---|---|\r
| Manual review time before automation | ~1.7 hours per title |\r
| Manual review time after automation | Seconds |\r
| Daily submission volume | 150+ titles per day |\r
| False positive reduction | ~12% |\r
| Pipeline stages | 4 (Aggregator, Analyzer, Evaluator, Invoker) |\r
| Post-launch rescan cadence | Daily |\r
| Coverage | Every game submission, pre-launch and post-launch |\r
\r
What it catches spans harmful content in titles, images and trailers; malware and vulnerabilities in packages; copycat games via embedding similarity against the top 1,000 titles; and pricing arbitrage or hidden games surfaced by the post-launch rescan.\r
\r
## What I would do differently\r
\r
The four-stage pipeline is deliberately generic — the same Aggregator/Analyzer/Evaluator/Invoker shape handles both pre-launch and post-launch certification — which kept the system simple to reason about but means every new detection capability has to fit inside the Analyzer stage's existing shape. [The author can note a specific extension that was awkward to bolt on — for example, a detection signal that didn't map cleanly to the existing rule-weight model, or a case where the Evaluator's policy mapping needed a new category.] Given how much of the false-positive reduction came from tuning thresholds after observing real outcomes, building a tighter feedback loop from XCert reviewer decisions back into rule weights earlier — rather than as a separate tuning exercise — would likely have compounded the accuracy gains faster.\r
\r
## Cheat sheet\r
\r
- Four-stage WorkflowV2 pipeline: Aggregator → Analyzer → Evaluator → Invoker, each triggered by its own Service Bus queue.\r
- Pre-launch is triggered by Smart Cert at Partner Center submission; post-launch is triggered daily by the Job Invoker worker.\r
- Analyzer is where the AI lives: WatchFor (CommunitySift + Azure Content Safety) for moderation, Azure OpenAI embeddings + Azure AI Search for copycat similarity.\r
- Durability comes from the messaging layer: idempotent consumers, retry/back-off, dead-letter queues, and a Cosmos \`jobs\`/\`jobhistory\` audit trail.\r
- Hard cases escalate to XCert human reviewers rather than being force-decided by automation.\r
- Headline numbers: 1.7 hours to seconds, 150+ titles/day, ~12% fewer false positives.\r
- Final decisions publish to XPMC over Service Bus as allow/hold/take-down/notify.\r
\r
## Common mistakes\r
\r
| Mistake | Why it backfires |\r
|---|---|\r
| Describing this as one monolithic "AI scanner" | It's a four-stage pipeline where AI is only one input to the Analyzer stage, alongside static rules |\r
| Implying automation replaced human review entirely | Hard cases still escalate to XCert; the system's job is to reduce volume, not eliminate judgment calls |\r
| Not knowing why it's queue-based rather than a synchronous call chain | The queue-per-stage design is exactly what makes the pipeline durable and restartable after a crash |\r
| Treating pre-launch and post-launch as separate systems | They're the same four-stage pipeline, triggered differently (Smart Cert vs. a daily Job Invoker) |\r
| Skipping the false-positive number | The ~12% reduction is concrete evidence that threshold tuning, not just adding more checks, is where the gains came from |\r
\r
## Summary\r
\r
CertExtensibility automates the bulk of game-content certification through a four-stage, Service Bus-driven pipeline — Aggregator, Analyzer, Evaluator, Invoker — that is durable by construction because each stage only needs a message to survive a crash, not an in-memory request. The Analyzer stage carries the AI: WatchFor moderation and embedding-based copycat similarity, tuned through configurable rule weights per resource type. Automation handles the volume across 150-plus daily submissions both pre- and post-launch, while hard cases still escalate to XCert reviewers, which is what let manual review time drop from roughly 1.7 hours per title to seconds without sacrificing the judgment calls that still need a human.\r
\r
## Top Interview Questions\r
\r
### Q1. Why build the post-publish pipeline as four separate Service Bus-triggered stages instead of one service that does everything in order?\r
\r
Splitting Aggregator, Analyzer, Evaluator and Invoker into separate stages, each triggered by its own queue, makes the pipeline durable and independently scalable. If a stage crashes mid-processing, the message that triggered it simply gets redelivered — nothing is lost, and the job resumes from that stage rather than restarting the whole certification from scratch. It also means each stage can be scaled and deployed independently: the Analyzer, which runs AI moderation and similarity checks, is far more compute-intensive than the Aggregator, so it benefits from independent scaling. A single monolithic service doing all four steps in one long-lived call would lose all of that resilience and would have to restart entirely on any failure partway through.\r
\r
### Q2. What happens if the Analyzer stage crashes partway through processing a job?\r
\r
Because the Analyzer is triggered by a message on \`certexanalyzernotifier\`, a crash simply means that message isn't acknowledged, and Service Bus redelivers it according to its retry policy. Consumers are built to be idempotent specifically so a redelivered message doesn't double-process or double-charge a job. If the message fails repeatedly, it lands in a dead-letter queue rather than being silently dropped or retried forever, and WorkflowV2's \`jobs\`/\`jobhistory\` records in Cosmos give visibility into exactly which stage a job was in when it failed. [The author can add specifics on dead-letter queue monitoring or alerting they set up for this.]\r
\r
### Q3. How does the Analyzer detect copycat games, and why use embeddings instead of exact matching?\r
\r
Copycat detection compares a submission's title, description and imagery against the top 1,000 existing titles using AI embeddings generated via Azure OpenAI through Semantic Kernel, with Azure AI Search doing the similarity lookup. Embeddings capture semantic and visual similarity rather than requiring an exact string or image match, which is essential because copycats deliberately make small changes — a slightly different name, a recolored icon — specifically to dodge exact-match detection. Exact matching would miss almost every real copycat attempt; embedding-based similarity catches "close enough to be suspicious" and routes it toward a violation rather than requiring pixel- or character-perfect duplication.\r
\r
### Q4. How do you keep false positives down when running multiple independent detection signals?\r
\r
Each detection signal — rule-based checks, WatchFor moderation, embedding similarity — has configurable thresholds, and rule weights are configurable per resource type (Title, Description, Image, ImageText, Product). Rather than any single signal making a binary allow/block decision, the Evaluator stage maps the combination of rule hits into policy violation categories, so a marginal similarity score alongside a clean moderation result doesn't necessarily trigger a hard block. Tuning these thresholds against observed outcomes — false positives XCert reviewers overturned, real violations that got through — is how the team got roughly a 12% reduction in false positives without a rewrite of the underlying detection logic.\r
\r
### Q5. Why does post-launch certification exist if a game already passed pre-launch review?\r
\r
Pre-launch certification is a point-in-time check against the state of the submission at that moment. Threats can appear after launch: new malware discovered in the wild, a copycat title that launches later and now looks suspicious next to an earlier original, pricing arbitrage that only becomes visible once a title's pricing history exists, or a hidden game surfaced through other means. The post-launch path re-runs essentially the same four-stage pipeline on a daily cadence, seeded by the Job Invoker worker, so certification doesn't become stale the moment a title ships — it's a continuous check, not a one-time gate.\r
\r
### Q6. What's the escalation path when the pipeline can't confidently decide on a submission?\r
\r
The Evaluator stage maps rule hits to policy violation categories, but ambiguous or high-stakes cases are routed to XCert for human review rather than the pipeline forcing an automated allow or take-down decision. This is a deliberate boundary: the system is designed to absorb the volume — 150-plus submissions a day — so that human reviewers only spend time on the genuinely hard calls, rather than trying to encode every edge case into rules and thresholds, which would either miss real violations or generate a flood of false positives.\r
\r
### Q7. Why Service Bus for this pipeline instead of, say, a synchronous orchestrator calling each stage in turn?\r
\r
A synchronous orchestrator would need to hold a submission's entire certification job in memory or in a single long-running process, and any crash during a multi-minute similarity scan would mean starting over. Service Bus queues decouple each stage: a stage only needs to successfully process a message and enqueue the next one, and WorkflowV2 persists job state to Cosmos after each transition. That combination — durable messaging plus a persisted state machine — is what makes the pipeline resilient to individual stage failures and lets stages scale independently based on their own load, which an orchestrator model would make much harder.\r
\r
### Q8. What was your specific contribution to CertExtensibility versus the rest of the team?\r
\r
[The author should state their specific scope — for example: "I owned the Analyzer stage's AI detection layer: the WatchFor moderation integration and the embedding-based copycat similarity detection, including the configurable rule-weight model per resource type."] The strongest answer names a concrete component with a metric attached — such as the false-positive reduction — that you personally influenced, rather than claiming ownership of the full four-stage pipeline, since an interviewer is likely to probe into whichever specific piece you claim in more depth.\r
\r
### Q9. How would you extend this pipeline to certify a completely new content type, say user-generated mods?\r
\r
The four-stage shape — Aggregator, Analyzer, Evaluator, Invoker — is generic enough that a new content type would mostly mean adding new detection rules and moderation checks inside the Analyzer, and possibly a new policy category in the Evaluator's mapping, rather than building a new pipeline. [The author can note any specific constraint they hit extending the Analyzer's rule-weight model to a new resource type, since that's the part of the system most likely to need real change for genuinely different content.] The Aggregator and Invoker stages are largely content-agnostic — collect data, persist results and notify — so the bulk of new work concentrates in the middle two stages.\r
\r
### Q10. If daily submission volume tripled overnight, what part of this system would you expect to feel it first?\r
\r
The Analyzer stage would feel it first, since it's the most compute- and API-call-heavy stage — WatchFor moderation calls, embedding generation, and an Azure AI Search similarity lookup against the top 1,000 titles all happen per submission. Because each stage is independently triggered by its own Service Bus queue, the Analyzer can scale out its own consumers without needing the Aggregator or Invoker to scale in lockstep, which is one of the direct benefits of the queue-per-stage design. [The author can add any real throttling or backlog behavior observed under a genuine volume spike, and how the team responded.]\r
`;export{e as default};
