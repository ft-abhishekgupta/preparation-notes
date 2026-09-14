const e=`---\r
title: XSale Self-Serve\r
description: Lets publishers create their own discounts through a self serve dashboard with scheduling targeting and an Xbox reviewer approval queue\r
difficulty: Core\r
tags: [xbox, xsale, sql-server, service-bus]\r
---\r
XSale Self-Serve lets publishers create their own discounts instead of emailing Xbox and waiting weeks for approval. It is a self-serve dashboard to build, schedule, target and track sales on the Xbox Store, backed by an Xbox reviewer queue, and it is the first app in the XMT family. Discounts built through it now drive more than $1 billion in discounted third-party revenue.\r
\r
## What it is\r
\r
The self-serve front of the pricing platform: publishers author, Xbox reviews, and approved sales become offers that XPrice evaluates.\r
\r
### For publishers\r
\r
Create percentage-off, edition-upgrade and flexible bundle sales. Target audiences using five predicates — ownership, play history, Game Pass, and wishlist among them. Schedule up to 12 months out, and bulk-upload campaigns via Excel.\r
\r
### For Xbox reviewers\r
\r
A dedicated review queue with filters, bulk approvals, product-level review and a full validation and audit trail. A publisher submits, Xbox decides, and both sides track live status from the same underlying record.\r
\r
> [!NOTE]\r
> XSale Web and XSale Self-Serve share the same pricing platform but have different authors. XSale Web is used by internal marketing and business teams to author campaigns. XSale Self-Serve is used by publishers to author their own discounts, gated by an Xbox review step and rule-engine validation. Both ultimately produce offers evaluated by XPrice.\r
\r
## Architecture\r
\r
\`\`\`mermaid\r
flowchart TB\r
    Pub["Publisher"] -->|Self-Serve Sales app| XMT["XMT front door<br/>(auth, entitlements, RBAC)"]\r
    XMT --> SS["XSaleSelfServeCore<br/>authoring + validation"]\r
    SS --> RE["Rule engine<br/>(IRuleEngineService)"]\r
    SS --> Db[("SQL Server<br/>XSaleSelfServeDbContext")]\r
    SS -->|create offers| XO["XOfferCore"]\r
    SS --> XI["XIngestion<br/>(product selection)"]\r
    SS <-->|offer-status / sale-status| SB["Service Bus"]\r
    Rev["Xbox reviewer"] -->|review queue| SS\r
    XO --> XP["XPrice → storefronts"]\r
    SS -. targeting .-> XT["XTarget"]\r
    classDef g fill:#e8f5e8,stroke:#107c10;\r
    class SS g;\r
\`\`\`\r
\r
Publishers author in the Self-Serve Sales app behind the XMT front door, with RBAC enforced on every call. \`XSaleSelfServeCore\` validates via a rule engine, persists to SQL, and on approval creates offers (XOfferCore) that XPrice evaluates. Background consumers track offer and sale status over Service Bus.\r
\r
| Direction | System | Why |\r
|---|---|---|\r
| Authoring UI | Self-Serve Sales app (XMT / Partner Center client) | Publisher and reviewer views |\r
| Front door | XGuideSelfServeFD (self-serve APIs) | Auth, entitlements, routing |\r
| Calls | XSaleCore, XOfferCore, XIngestion, XProductAggregator/Core, ProductUpdate, ProductDetails, XTargetJobManagement, XTraceCore | Transform, enroll products, target, telemetry |\r
| Messaging | Service Bus consumers: \`OfferStatusConsumer\`, \`SaleStatusConsumer\` | Track lifecycle: Draft → Under Review → Live → Completed |\r
| Stores in | SQL Server (EF Core) | Sales and review state |\r
\r
| Component | Role |\r
|---|---|\r
| XSaleSelfServeCore | Owns publisher authoring, validation and review workflow |\r
| XGuideSelfServeFD | Self-serve front door: auth, entitlements, RBAC |\r
| SQL Server (EF Core) | Sales and review state persistence |\r
| Rule engine | Validator selection by sale type, severity and scope |\r
| Service Bus | Async offer/sale status tracking |\r
| XMT shared UI | Publisher and reviewer surfaces |\r
| XPrice / XOffer | Downstream evaluation and offer creation |\r
\r
## Data and request flow\r
\r
**Publisher flow.** A publisher builds a sale in the Self-Serve Sales app, which calls \`XGuideSelfServeFD\`. \`SalesBusinessLogic\` handles creating and editing the sale, calling the rule engine to validate it, integrating with target-job estimation for audience sizing, and tracing every step through \`XTraceCore\`. A sale starts in Draft; once submitted it moves to Under Review, where it waits on a human decision rather than auto-publishing.\r
\r
**Review flow.** \`ReviewBusinessLogic\` lists sales awaiting review, lets a reviewer view details, and supports approve, reject, publish and retry-publish actions. Approving a sale is what triggers \`SalesBusinessLogic\` to hand it to \`XOfferCore\` for offer creation; a rejected sale returns to the publisher rather than silently disappearing, preserving the audit trail the reviewer flow depends on.\r
\r
**Lifecycle tracking.** Sales move through Draft, Under Review, Approved, Live and Completed. \`OfferStatusConsumer\` consumes the \`offer-status\` topic (XOffer callbacks) and updates sale status accordingly; \`SaleStatusConsumer\` consumes \`xsaleselfserve-sale-status\` and routes curated-sale versus regular-sale status updates. A scheduled cron job (\`salestatusupdatejob\`) periodically triggers \`POST /api/saledata/sale-status-update\` as a belt-and-suspenders backstop, so a missed or delayed Service Bus message doesn't leave a sale stuck in a stale status indefinitely.\r
\r
| Stage | Meaning |\r
|---|---|\r
| Draft | Publisher is still editing, not yet submitted |\r
| Under Review | Submitted, awaiting an Xbox reviewer decision |\r
| Approved | Reviewer approved; offer creation triggered |\r
| Live | Offer is active on the storefront |\r
| Completed | Sale window has ended |\r
\r
## The hard problems\r
\r
**Validating many different sale types with one engine.** Percentage-off, edition upgrades, flexible bundles and curated programs (like Deals with Game Pass) all need different validation rules. \`RuleEngineService\` picks validators dynamically by \`SaleType\`, severity (All vs. HardOnly) and scope, rather than hardcoding a validation function per sale type. That means a new sale type mainly needs new validators registered with the engine, not a change to the core authoring or review flow.\r
\r
**SQL-first persistence in a platform that otherwise leans on Cosmos.** Unlike XPrice or XSale Web, which lean on Cosmos for their data, XSaleSelfServeCore is deliberately SQL-first (\`XSaleSelfServeDbContext\`), because sales, sellers, curated-sales history, eligibility criteria and review state are inherently relational — a sale has a seller, a review record, and eligibility criteria that reference each other, which maps naturally onto foreign keys and joins rather than a document per entity.\r
\r
**Trusting publishers while keeping Xbox as the final gate.** Letting publishers self-serve is the whole point of the product, but a discount that's wrong — too deep, targeting a restricted region, conflicting with another active sale — has real revenue and compliance consequences. The review queue, with filters, bulk approvals and product-level review, exists specifically so publisher velocity (build a sale in minutes) doesn't come at the cost of removing human judgment from the loop entirely.\r
\r
**Keeping status in sync across three different update paths.** Offer status changes can arrive from \`OfferStatusConsumer\`, sale status changes from \`SaleStatusConsumer\`, and a scheduled cron job can also trigger a status update. Having three paths that can all update the same sale's status is a deliberate redundancy: Service Bus consumers handle the common case quickly, while the cron job is a safety net against a missed or lost message, at the cost of needing all three paths to agree on what "the current status" means.\r
\r
> [!WARNING]\r
> Because status can be updated by two different Service Bus consumers and a cron job, any change to what a status value means has to be coordinated across all three paths — a common source of subtle bugs in systems with more than one writer to the same piece of state.\r
\r
## Under the hood\r
\r
Business logic includes \`SalesBusinessLogic\` (the publisher flow: create/edit sales, publish to XOffer, manage status transitions, call validation, trace, auto-approval, and target-job integration), \`ReviewBusinessLogic\` (the reviewer workflow: list, view, approve/reject, publish, retry publish), \`CuratedSalesBusinessLogic\` (curated programs like Deals with Game Pass — create/list/update/cancel/generate), \`OfferStatusBusinessLogic\` (maps XOffer status callbacks back onto sale/product rows, writing history, metrics and trace), \`CohortsBusinessLogic\` (submits and polls audience-size jobs via XTarget job management), and \`RuleEngineService\` (picks validators by sale type, severity and scope).\r
\r
The SQL Server store (\`XSaleSelfServeDbContext\`, in production \`sqldb-xbs-XSaleSelfServe-prod-wus2\` with a failover group) holds \`Sales\`, \`Sellers\`, \`CuratedSales\`, \`History\`, \`EligibilityCriteria\`, \`PublisherEligibility\` and \`Review*\` tables. Service Bus (namespace \`sb-xbs-xsalecore-prod-wus2\`) carries \`xsaleselfserve-sale-status\` (with a subscription) and consumes \`offer-status\`. Identity and secrets are handled through Managed Identity and Key Vault (\`GatewayProxy-ClientSecret\`).\r
\r
## Scale and reliability\r
\r
| Metric | Value |\r
|---|---|\r
| Markets covered | 87 |\r
| Discounted 3P revenue driven | $1B+ (FY25) |\r
| Private-preview revenue | $1.8M with just 4 publishers |\r
| Time to build a sale | Minutes, down from a multi-week email approval chain |\r
| Scheduling horizon | Up to 12 months ahead |\r
| Bulk authoring | Excel bulk-upload |\r
| Targeting predicates | 5 (ownership, play history, Game Pass, wishlist, and more) |\r
| Persistence model | SQL-first (EF Core), unlike the Cosmos-leaning XPrice/XSale Web |\r
\r
## What I would do differently\r
\r
Having three independent paths update the same sale's status — two Service Bus consumers and a scheduled cron job — is a robust design against any single path failing, but it also means the definition of "current status" has to stay consistent across all three, which is exactly the kind of implicit coupling that's easy to get subtly wrong as the system evolves. [The author can note whether a single status-reconciliation service that all three paths write through, rather than each updating the sale record directly, was considered as a way to centralize that logic.] Given how central the review queue is to trust in the self-serve model, investing further in reviewer-side tooling — bulk approval rules, smarter default filters — earlier would likely have compounded the "minutes not weeks" win even further as publisher adoption grew.\r
\r
## Cheat sheet\r
\r
- Self-serve publisher authoring plus an Xbox reviewer queue — publisher submits, Xbox decides, both track the same lifecycle.\r
- Lifecycle: Draft → Under Review → Approved → Live → Completed.\r
- \`RuleEngineService\` selects validators dynamically by sale type, severity and scope — not hardcoded per sale type.\r
- SQL-first persistence (\`XSaleSelfServeDbContext\`), unlike the Cosmos-leaning XPrice/XSale Web — sales, sellers and review state are inherently relational.\r
- Status updates arrive from two Service Bus consumers (\`OfferStatusConsumer\`, \`SaleStatusConsumer\`) plus a cron-job backstop (\`salestatusupdatejob\`).\r
- Headline numbers: 87 markets, $1B+ in discounted 3P revenue, $1.8M in private-preview revenue from just 4 publishers.\r
- XSale Self-Serve is the publisher-facing sibling of XSale Web — same pricing platform, different author and a review gate in between.\r
\r
## Common mistakes\r
\r
| Mistake | Why it backfires |\r
|---|---|\r
| Confusing this with XSale Web | XSale Web is for internal marketing teams; Self-Serve is for publishers, gated by an Xbox review step |\r
| Saying every submitted sale auto-publishes | Sales sit in Under Review until an Xbox reviewer approves them — the review gate is the point |\r
| Not knowing why it's SQL rather than Cosmos | Sales, sellers and review state are relational by nature — a deliberate, workload-driven choice unlike XPrice/XSale Web |\r
| Describing status tracking as one mechanism | It's three: two Service Bus consumers plus a scheduled cron-job backstop — worth naming all three |\r
| Skipping the rule engine's dynamic validator selection | It's what lets new sale types be added without changing the core authoring/review flow |\r
\r
## Summary\r
\r
XSale Self-Serve replaces manual, email-driven discounting with a dashboard where publishers independently create, schedule and track campaigns across 87 markets, gated by an Xbox reviewer queue rather than open publishing. \`XSaleSelfServeCore\` runs a dynamically selected rule engine for validation, persists to SQL Server because sales and review state are inherently relational, and drives a review workflow with a full audit trail. Approved sales flow into XOfferCore and XPrice, and three independent mechanisms — two Service Bus consumers and a scheduled cron job — keep offer and sale status in sync through the Draft-to-Completed lifecycle. Discounts built here are a cornerstone of the store, driving over $1 billion in FY25 third-party revenue.\r
\r
## Top Interview Questions\r
\r
### Q1. Why does this system need a rule engine instead of hardcoding validation per sale type?\r
\r
Percentage-off sales, edition upgrades, flexible bundles and curated programs each have different validity rules — different fields, different constraints, different severity of violation. \`RuleEngineService\` selects validators dynamically by \`SaleType\`, severity (All vs. HardOnly) and scope, so validation logic is composed rather than duplicated per sale type inside the authoring flow. This means adding a new sale type is primarily a matter of writing and registering new validators, not modifying \`SalesBusinessLogic\` itself, which keeps the core authoring and review pipeline stable as the set of sale types has grown.\r
\r
### Q2. Why is this specific service SQL-first when XPrice and XSale Web lean on Cosmos?\r
\r
Sales, sellers, curated-sales history, eligibility criteria and review records have naturally relational relationships — a sale references a seller, has associated eligibility criteria, and produces review history entries that reference the sale. That's a good fit for a relational schema with foreign keys and joins, which is why \`XSaleSelfServeDbContext\` is built on SQL Server rather than Cosmos. XPrice and XSale Web's Cosmos usage fits their own access patterns — high-throughput, per-user reads for XPrice, and shared data with XPrice for XSale Web — but this service's workload is closer to traditional transactional and reporting queries, which SQL Server serves well.\r
\r
### Q3. Walk through what happens between a publisher submitting a sale and it going live.\r
\r
The publisher builds the sale in the Self-Serve Sales app, which calls \`XGuideSelfServeFD\`; \`SalesBusinessLogic\` validates it through the rule engine and moves it from Draft to Under Review. An Xbox reviewer sees it in the review queue, where \`ReviewBusinessLogic\` supports viewing details, approving, rejecting, publishing or retrying a publish. On approval, the sale is handed to \`XOfferCore\` to create the actual offer. From there, \`OfferStatusConsumer\` picks up XOffer's status callbacks over the \`offer-status\` topic and updates the sale's status through Approved to Live, while a scheduled cron job provides a backstop in case that message is ever missed or delayed.\r
\r
### Q4. Why have three separate mechanisms (two Service Bus consumers and a cron job) updating sale status instead of one?\r
\r
\`OfferStatusConsumer\` and \`SaleStatusConsumer\` handle the common, fast case: status changes arriving from XOffer callbacks and from the self-serve sale-status topic respectively, keeping status current within the normal latency of a Service Bus message. The \`salestatusupdatejob\` cron job exists as a scheduled backstop specifically because message-based systems can occasionally drop or delay a message, and a sale silently stuck in "Under Review" or "Approved" with no path to eventually reconcile would be a worse outcome than a small amount of redundant polling. The trade-off is that all three paths have to agree on what each status value means, since more than one thing can write it.\r
\r
### Q5. How does the review workflow prevent a bad discount from reaching the storefront while still being fast for publishers?\r
\r
Publishers can build a sale in minutes, but nothing goes live without passing through Under Review first — the rule engine's validation catches structurally invalid sales automatically, and the review queue gives a human reviewer the final say on judgment calls a rule engine can't fully encode, like whether a discount is appropriate for a given title or market. Reviewers get filters, bulk approvals and product-level review to keep their own throughput high, so the human gate doesn't become the new bottleneck that email-based approval used to be. The combination — automated validation plus a fast, tooled human review step — is what let the platform go from multi-week approval chains to minutes without removing oversight entirely.\r
\r
### Q6. What's the difference between XSaleSelfServeCore and XSaleCore (the backend behind XSale Web)?\r
\r
They're separate backends serving different authors on the same underlying pricing platform. \`XSaleCore\` serves XSale Web, used by internal marketing and business teams, and doesn't have a reviewer-gate concept in the same way. \`XSaleSelfServeCore\` serves publishers directly and is built around a mandatory review workflow, rule-engine validation, and its own SQL persistence layer, because publisher-authored sales need a trust and audit boundary that internal-team-authored sales don't require in the same form. Both eventually produce offers that XOfferCore and XPrice evaluate, but the authoring, validation and approval paths leading up to that point are distinct.\r
\r
### Q7. How would this system behave if the Service Bus topics carrying status updates became unavailable for an extended period?\r
\r
Sale and offer status would stop updating in near-real-time through \`OfferStatusConsumer\` and \`SaleStatusConsumer\`, but the scheduled \`salestatusupdatejob\` cron job would still periodically call \`POST /api/saledata/sale-status-update\`, providing a degraded but non-zero path to eventually reconcile status. [The author should confirm the actual cron job interval and how stale status could get in the worst case during an extended Service Bus outage.] This is exactly the scenario the cron-job backstop was designed for — a fully message-driven system with no fallback would leave every sale's status frozen until the messaging layer recovered.\r
\r
### Q8. What was your specific contribution to XSale Self-Serve versus the team's?\r
\r
[The author should state their specific ownership — for example: "I built the rule engine's dynamic validator-selection logic and the review workflow, including the audit trail and bulk-approval tooling for reviewers."] The strongest version of this answer names one or two components with a concrete, defensible detail — the rule engine's selection logic, the SQL schema design, the three-path status reconciliation — rather than a broad claim over the whole platform, since a system spanning publisher authoring, reviewer tooling, offer integration and background consumers plausibly had multiple contributors across its lifecycle.\r
\r
### Q9. If publisher adoption grew 10x, what part of this system would you expect to need rework first?\r
\r
The review queue is the most likely bottleneck, since it's the one deliberately human-gated step in an otherwise automated pipeline — 10x more publishers submitting sales means 10x more items landing in Under Review, and reviewer throughput doesn't scale the same way infrastructure does. The existing tooling (filters, bulk approvals, product-level review) was built to keep reviewers fast, but a 10x volume increase would likely push toward more automation in the rule engine to auto-approve clearly low-risk sales, reserving human review for genuinely ambiguous cases, rather than reviewers manually processing every single submission regardless of risk.\r
\r
### Q10. Why cap targeting to five predicates rather than a fully general audience-targeting query language?\r
\r
A small, fixed set of predicates — ownership, play history, Game Pass membership, wishlist status, and similar signals — covers the overwhelming majority of realistic publisher targeting needs while keeping both the authoring UI and the validation/estimation pipeline simple and fast. [The author can add whether a more general targeting query language was considered and what specifically made the fixed predicate set the better trade-off — likely simpler cohort-size estimation via XTarget, and a much easier UI for publishers who are not necessarily technical.] A fully general query language would be more flexible but would also make audience-size estimation, validation and the reviewer's ability to sanity-check a target audience considerably harder to build and to reason about.\r
`;export{e as default};
