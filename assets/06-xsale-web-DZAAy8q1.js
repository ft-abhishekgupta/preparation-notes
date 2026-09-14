const e=`---\r
title: XSale Web\r
description: The stateless React sales authoring portal and backend for frontend that helps marketing teams create discount campaigns for Xbox commerce\r
difficulty: Core\r
tags: [xbox, xsale, react, bff]\r
---\r
XSale Web is the sales-authoring web portal for Xbox commerce: a React SPA plus a Backend-for-Frontend, used by marketing and business teams to create discount campaigns. The portal itself is deliberately stateless — it owns the UX, an AI draft assistant, CSV upload and analytics, but delegates all business logic and persistence to the separate XSale (XSaleCore) backend, which turns sales into offers that XPrice evaluates in real time.\r
\r
## What it is — three layers\r
\r
Authoring happens in the portal, the backend defines and publishes offers, and XPrice enforces them at the moment a player sees a price.\r
\r
### 1. XSale Web — portal and BFF\r
\r
A React 18 SPA (TypeScript, Partner Center UI) with a thin Backend-for-Frontend that handles the UX, an AI draft assistant, CSV upload, and analytics dashboards. It is stateless: it calls the XSaleCore backend for everything and keeps no database of its own.\r
\r
### 2. XSale (XSaleCore) — backend\r
\r
The core service that owns the sale business logic, SQL and Cosmos persistence, and transforms sales into offers (via XOfferCore), tracking publish state over Service Bus.\r
\r
### 3. XPrice — evaluation\r
\r
Evaluates the price a specific user sees, in roughly 50ms, across discovery, the product page, cart and purchase — using eligibility signals sourced from XTarget.\r
\r
> [!NOTE]\r
> "XSale Web" is the portal and BFF, not the backend. It has no database of its own; all sale logic, validation and persistence live in the separate XSale/XSaleCore backend it calls. The rest of this page covers the portal first, then the backend it orchestrates.\r
\r
## Architecture\r
\r
\`\`\`mermaid\r
flowchart TB\r
    Team["Marketing / business teams"] --> SPA["XSale Web SPA<br/>React 18 + TS"]\r
    SPA --> BFF["XSale Web BFF<br/>presentation logic, Polly, AAD"]\r
    BFF -->|AI chat / draft| AOAI["Azure OpenAI (GPT-4o)<br/>Semantic Kernel + AdxPlugin"]\r
    BFF -->|analytics| ADX["Kusto / ADX"]\r
    BFF -->|all sale ops| XS["XSaleCore<br/>backend: logic + persistence"]\r
    XS --> SQL[("SQL Server<br/>XSaleDbContext")]\r
    XS -->|transform to offers| XO["XOfferCore"]\r
    XS <-->|offer-status topic| SB["Service Bus"]\r
    XO --> XP["XPriceCore<br/>real-time evaluation"]\r
    XP -->|price / offer| SF["Storefronts"]\r
    XP -. eligibility .-> XT["XTarget"]\r
    classDef a fill:#fbf3e2,stroke:#b7791f;\r
    classDef g fill:#e8f5e8,stroke:#107c10;\r
    class SPA,BFF a;\r
    class XS g;\r
\`\`\`\r
\r
Teams author in the XSale Web SPA; its BFF handles presentation, the AI draft assistant (Semantic Kernel plus GPT-4o) and Kusto analytics, and forwards every sale operation to the XSaleCore backend, which persists to SQL, transforms sales into offers (XOfferCore) and tracks status over Service Bus. XPrice then evaluates the live price.\r
\r
| Direction | System | Why |\r
|---|---|---|\r
| Users | Marketing / business teams (AAD sign-in) | Author and manage campaigns in the SPA |\r
| Delegates to | XSale / XSaleCore (backend) | All sale business logic and persistence |\r
| Also calls | XOfferCore, ProductDetails, CMSAuthoring, Groups, TokenIdentity | Offers, product suggest, content, auth/groups |\r
| AI and analytics | Azure OpenAI (GPT-4o via Semantic Kernel), Kusto/ADX | Draft assistant plus sales analytics dashboards |\r
| Resilience | Polly (HTTP to backend), API versioning v1.0–v1.2 | Robust backend calls |\r
\r
| Component (portal) | Role |\r
|---|---|\r
| XSaleWeb (React 18 + TS) | Author-facing SPA, Partner Center UI |\r
| Web Core | Shared BFF hosting layer |\r
| Semantic Kernel + GPT-4o | AI draft assistant and chat |\r
| Kusto / ADX | Sales analytics dashboards |\r
| Redis | Session cache |\r
| Blob | Sale image storage |\r
| Polly | Resilient calls to the XSaleCore backend |\r
\r
## Data and request flow\r
\r
**Authoring a sale.** A marketer builds a campaign in the SPA — percentage-off, a bundle, a targeted offer, or a subscription discount. The BFF handles presentation-layer concerns (AAD auth, request shaping) and forwards the operation to XSaleCore, which validates and persists it. Nothing about sale rules, eligibility logic or persistence lives in the portal itself; the BFF's job stops at shaping the request and rendering the response.\r
\r
**AI draft assistant.** The assistant runs on Semantic Kernel over Azure OpenAI GPT-4o, with function-calling into an \`AdxPlugin\` that runs live Kusto queries and a \`WikiPlugin\` for reference lookups. This grounds the assistant's suggestions in the portal's own analytics data rather than having it draft sale terms from the model's general knowledge alone, which matters because a plausible-sounding but ungrounded discount suggestion is exactly the kind of mistake that erodes trust in an AI-assisted authoring tool.\r
\r
**Publishing and offer creation.** Once a sale is approved, XSaleCore's business logic (for example \`PercentageOffSaleBusinessLogic\` or \`FlexibleSaleBusinessLogic\`) maps the sale to an offer payload and hands it to XOfferCore. Publish state is tracked asynchronously over an \`offer-status\` Service Bus topic rather than the portal polling synchronously, so a slow or delayed offer-publish step doesn't block the authoring UI. XPrice then evaluates the resulting offer against the requesting user's eligibility (sourced from XTarget) at the moment a price is requested, across discovery, the product page, cart and purchase, in roughly 50ms.\r
\r
| Endpoint | Purpose |\r
|---|---|\r
| \`POST /Sales/...\` | Create/manage sales (proxied to XSaleCore) |\r
| \`POST /SaleDraftAssistant/turn\` | AI-assisted sale authoring (GPT-4o) |\r
| \`POST /Chat\` | AI chat over sales data (Semantic Kernel + AdxPlugin) |\r
| \`POST /Cohorts/...\` · \`/Predicates/...\` | Audience estimation and targeting predicates |\r
\r
## The hard problems\r
\r
**Keeping the portal genuinely stateless.** It would have been easier, in the short term, to cache sale state or partial drafts in the portal's own store. Instead, XSaleWeb has no SQL, no Cosmos, no queues of its own — every sale operation round-trips to XSaleCore. This keeps the portal simple to reason about and means the backend's validation and persistence rules are never duplicated or drift out of sync with what the UI assumes.\r
\r
**Grounding an AI assistant in real data instead of letting it guess.** A draft assistant that invents plausible-looking discount terms is worse than no assistant at all, because a marketer might publish what it suggests. Giving the assistant function-calling access to a Kusto plugin means it can pull actual historical sales performance to inform a draft rather than hallucinating numbers, and a \`WikiPlugin\` gives it grounded reference material for policy questions.\r
\r
**Not letting backend calls take down the authoring experience.** Every sale operation depends on a call to XSaleCore succeeding. Polly wraps those HTTP calls with retry and resilience policies, and the API is versioned (v1.0–v1.2) so the backend can evolve without breaking whichever client version a given deployment of the portal is running — a real concern when the portal and backend can, in practice, deploy on different cadences.\r
\r
> [!WARNING]\r
> Because XSaleWeb holds no state of its own, any partial-failure handling — what the UI shows if a sale is created but the offer-publish step is still pending — has to be inferred from XSaleCore's status responses. There is no local draft to fall back on if a request is lost mid-flight.\r
\r
## Under the hood: the XSaleCore backend\r
\r
Business logic owned by XSaleCore includes \`PercentageOffSaleBusinessLogic\` (create/get/update/publish percent-off sales; maps sale-to-offer payloads), \`FlexibleSaleBusinessLogic\` (validates flexible-sale rules like Buy X Get Y and bundles, publishes flexible offers), \`SubscriptionDiscountSaleBusinessLogic\` (validates subscription SKU/discount rules, publishes subscription differential offers), \`SalesBusinessLogic\` (generic sale CRUD, search, delete, cohort checks, offer-status handling), and \`CohortEstimationBusinessLogic\` (triggers Synapse cohort-size jobs for audience targeting).\r
\r
The backend's SQL Server store (\`XSaleDbContext\`) holds \`Sales\`, \`TargetingConditions\`, \`PcdSummary\`, \`EstimationJob\` and \`SaleUsers\`. Alongside that, a Cosmos DB account (\`XPriceData\`, shared with XPrice) holds \`UserData\`, \`UserPurchaseData\` and \`UserEventsData\`, and Service Bus carries the \`xofferstatustopic\` and \`xoffersoperationtopic\` that keep offer publish state and lifecycle events flowing between XSaleCore, XOfferCore and XPrice.\r
\r
## Scale and reliability\r
\r
| Metric | Value |\r
|---|---|\r
| Discounted revenue driven across the platform | $1B+ |\r
| Quarterly revenue increase attributed to XSale Web | $8M |\r
| Sale types authored | Percentage-off, flexible/bundle, targeted, subscription/recurring |\r
| Portal state | Fully stateless — no SQL, Cosmos, or queues in the portal itself |\r
| Price evaluation latency (XPrice) | ~50ms |\r
| API versioning | v1.0–v1.2, backend and portal evolve independently |\r
| Resilience | Polly retry/resilience policies on every backend call |\r
\r
## What I would do differently\r
\r
The stateless-portal design is the right call for keeping business logic in one place, but it also means the portal has no local memory of an in-flight authoring session if a request to XSaleCore is lost or delayed — a marketer's browser refresh mid-flow relies entirely on the backend already having persisted whatever was submitted. [The author can note whether optimistic local draft persistence in the browser (not the server) was considered as a lightweight safety net for long authoring sessions, without violating the "no portal database" principle.] Given how central the AI draft assistant has become to authoring, investing earlier in grounding it against more of the backend's validation rules — not just Kusto analytics — might have caught more invalid drafts before they ever reached XSaleCore's validation step.\r
\r
## Cheat sheet\r
\r
- Three layers: XSale Web (stateless portal/BFF) → XSaleCore (logic + persistence) → XPrice (real-time evaluation, ~50ms).\r
- The portal has no database of its own — no SQL, no Cosmos, no queues; everything delegates to XSaleCore.\r
- AI draft assistant runs on Semantic Kernel + GPT-4o with function-calling into an \`AdxPlugin\` (Kusto) so drafts are grounded in real analytics, not invented.\r
- XSaleCore's SQL store (\`XSaleDbContext\`) holds Sales, TargetingConditions, PcdSummary, EstimationJob, SaleUsers.\r
- Offer publish status flows asynchronously over Service Bus (\`offer-status\` topic), not synchronous polling from the portal.\r
- Polly wraps backend calls for resilience; the API is versioned v1.0–v1.2 so portal and backend can evolve independently.\r
- Headline numbers: $1B+ platform-wide discounted revenue, an $8M quarterly revenue increase attributed to XSale Web specifically.\r
\r
## Common mistakes\r
\r
| Mistake | Why it backfires |\r
|---|---|\r
| Saying XSale Web "stores" or "validates" sales | It delegates all of that to XSaleCore — the portal is a stateless BFF, and conflating the two loses the actual architecture |\r
| Describing the AI assistant as free-form generation | It's grounded via Semantic Kernel function-calling into a Kusto plugin — that grounding is the interesting design choice |\r
| Not knowing where XOfferCore and XPrice fit | XSaleCore transforms sales into offers (XOfferCore); XPrice evaluates the live price per user — three distinct responsibilities |\r
| Conflating the $1B+ platform number with XSale Web's own impact | The $8M quarterly figure is what's attributed to this specific portal; keep the two numbers straight |\r
| Ignoring API versioning | v1.0–v1.2 exists specifically so the backend can evolve without breaking an already-deployed portal version |\r
\r
## Summary\r
\r
XSale Web is a deliberately stateless React portal and BFF: it owns the authoring UX, an AI draft assistant grounded in real Kusto analytics, and CSV/analytics tooling, but every sale rule, validation and persisted record lives in the separate XSaleCore backend. XSaleCore transforms authored sales into offers via XOfferCore and tracks their publish lifecycle over Service Bus, and XPrice evaluates the resulting price per user in about 50ms across every storefront surface. That three-layer split — author, transform, evaluate — is what let the portal stay simple while the backend absorbed the complexity of sale types, targeting and persistence.\r
\r
## Top Interview Questions\r
\r
### Q1. Why is XSale Web stateless, with no database of its own?\r
\r
Keeping all sale business logic and persistence inside XSaleCore means there's exactly one place where validation rules, offer-mapping logic and sale state live — the portal never has its own copy of "what a valid sale looks like" that could drift out of sync with the backend's rules. It also means the portal is simple to reason about and redeploy: it's a UI and a thin BFF, with no data migrations or storage concerns of its own. The cost is that the portal has no local memory of an in-flight authoring session — if a request to XSaleCore fails or is delayed, there's no local draft to fall back on, since nothing is held client- or portal-side beyond the current UI state.\r
\r
### Q2. How does the AI draft assistant avoid hallucinating discount terms?\r
\r
It runs on Semantic Kernel over Azure OpenAI GPT-4o with function-calling into an \`AdxPlugin\`, which lets the model issue live Kusto queries against real sales and analytics data rather than drafting purely from its own training. A \`WikiPlugin\` provides similar grounding for policy or reference questions. This matters specifically because a draft assistant's whole value is speeding up authoring — if it invented plausible-but-wrong numbers, a marketer could publish an incorrect discount, which is a much worse outcome than the assistant being slightly slower because it had to run a real query first.\r
\r
### Q3. Walk through what happens between a marketer publishing a sale and a player seeing the discounted price.\r
\r
The marketer's publish action goes through the BFF to XSaleCore, whose relevant business logic (for example \`PercentageOffSaleBusinessLogic\`) validates the sale and maps it into an offer payload for XOfferCore. Offer creation and publish status are tracked asynchronously over a Service Bus \`offer-status\` topic rather than the portal blocking on the offer becoming fully live. Once the offer exists, XPrice is the system that actually decides what a specific player sees: at request time (browsing, on the product page, in cart, or at purchase) it evaluates eligibility signals from XTarget against the offer and returns a price in roughly 50ms — the portal and XSaleCore are not in that real-time path at all.\r
\r
### Q4. Why track offer publish status over Service Bus instead of having the portal poll synchronously?\r
\r
Offer creation and propagation through XOfferCore isn't instantaneous, and blocking the authoring UI on that would make publishing a sale feel slow and unpredictable to the marketer, especially since publish latency can vary. Tracking status asynchronously over the \`offer-status\` Service Bus topic means the portal can show a sale as "publishing" and update to "live" once the status arrives, without holding a request open or polling in a tight loop. It also decouples XSaleCore's publish logic from the portal entirely — the topic can have other consumers (analytics, alerting) without the portal needing to know about them.\r
\r
### Q5. Why does the portal use Polly and API versioning specifically for calls to the backend?\r
\r
Every sale operation in the portal depends on a successful call to XSaleCore, so a transient failure there — a brief network blip, a backend redeploy — would otherwise surface directly as a broken authoring experience. Polly wraps those calls with retry and resilience policies so transient failures are absorbed rather than immediately shown to the user. API versioning (v1.0–v1.2) exists because the portal and the XSaleCore backend don't necessarily deploy in lockstep; versioning lets the backend introduce new capabilities or fix behavior without forcing every deployed instance of the portal to update simultaneously.\r
\r
### Q6. What's the difference between XSaleCore and XOfferCore, and why are they separate services?\r
\r
XSaleCore owns the sale as the marketer authored it — the business rules for a percentage-off sale, a flexible bundle, or a subscription discount, plus SQL persistence of that sale record. XOfferCore is the catalog-facing offer representation that XPrice actually evaluates against a user in real time. Separating them means the "authoring and rules" concern (XSaleCore) and the "real-time catalog offer" concern (XOfferCore) can evolve and scale independently — XOfferCore's read path needs to be fast enough for live price evaluation across every storefront, which is a very different performance profile from XSaleCore's authoring and validation workload.\r
\r
### Q7. What was your specific contribution to XSale Web versus the team's?\r
\r
[The author should state their specific ownership — for example: "I built and owned both the React SPA and its Backend-for-Frontend, including the AI draft assistant integration with Semantic Kernel and the Kusto-grounded chat experience, which contributed to an $8M quarterly revenue increase."] The strongest version names a concrete piece — the AI assistant, the resilience layer, a specific sale-type's authoring flow — you can defend under follow-up, rather than claiming ownership of the entire three-layer platform, since XSaleCore and XPrice are explicitly separate backends likely owned by other engineers or teams.\r
\r
### Q8. How would XSale Web behave if the XSaleCore backend were temporarily unavailable?\r
\r
Because the portal is stateless and delegates everything to XSaleCore, an outage there means authoring actions — creating, editing, or publishing a sale — would fail at the point Polly's retry policy is exhausted, surfacing an error to the marketer rather than silently losing data, since nothing was ever held only in the portal. [The author should confirm the actual user-facing behavior configured here — for example, whether the BFF shows a specific retry-later message, and whether any read-only views like analytics dashboards can still render from cached Kusto data during a backend outage.] Given the portal's explicit lack of local persistence, there is no draft to recover from client-side; the dependency on XSaleCore being available is a direct, accepted consequence of the stateless design.\r
\r
### Q9. Why run the AI assistant with function-calling (tool use) rather than just prompting GPT-4o directly with sales context?\r
\r
Function-calling lets the model decide, per conversation turn, whether it needs to run a live Kusto query or look something up via the wiki plugin, rather than requiring every possible piece of context to be stuffed into the prompt upfront. This keeps prompts smaller and, more importantly, keeps the model's answers grounded in current data rather than a snapshot that might be stale by the time a marketer uses the assistant. It also scopes what the model can access explicitly through the plugin's own permissions, rather than the model having implicit access to arbitrary sales data through a static context dump.\r
\r
### Q10. If a new sale type needed to be added — say a "flash sale" with a countdown — where would that change land across these three layers?\r
\r
The portal (XSale Web) would need new UI to author the flash-sale-specific fields, and its BFF would forward that shape to XSaleCore; that's a UI and request-shaping change, not a business-logic change. The actual rules — how a flash sale validates, how it maps to an offer payload, what happens when its countdown expires — would be new business logic in XSaleCore, likely a new class alongside \`PercentageOffSaleBusinessLogic\` and \`FlexibleSaleBusinessLogic\` following the same sale-type pattern. XPrice and XOfferCore would only need to understand the resulting offer shape, not the sale-authoring concept of a flash sale itself, which is exactly the separation of concerns the three-layer design is meant to provide.\r
`;export{e as default};
