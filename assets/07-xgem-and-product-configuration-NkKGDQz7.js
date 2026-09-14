const e=`---\r
title: XGeM and Product Configuration\r
description: The metadata and product properties backbone of publishing that feeds the Xbox store product page and the wider catalog\r
difficulty: Core\r
tags: [xbox, xgem, cosmos-db, service-bus]\r
---\r
XGeM and ProductConfiguration are the metadata and product-properties backbone of publishing. XGeM is the source of truth for Gaming Metadata; ProductConfiguration manages the product properties, listings and pricing modules. Together they shape what appears on a game's Store page and feed the wider catalog, powering more than 150 game publishes a day.\r
\r
## What they are\r
\r
### XGeM — Gaming Metadata\r
\r
The source of truth for gaming metadata: tags like accessibility, languages, and gameplay features. On commit, it publishes committed-instance updates to XPMC and XProduct so the store reflects changes as soon as a publisher finalizes them.\r
\r
### ProductConfiguration — Properties\r
\r
Manages GamingProperties modules — genre, modes, tech specs, Xbox services — in draft state, with callbacks for Jaguar and Submission. It stores listings, properties and pricing in Cosmos, and uses Service Bus for async events.\r
\r
## Architecture\r
\r
\`\`\`mermaid\r
flowchart TB\r
    Pub["Publisher"] -->|author in Partner Center| PC["PartnerCenterCore"]\r
    UI["Packages / Properties apps<br/>(client repo)"] --> PCFD["ProductConfigurationFD"]\r
    PCFD --> PCC["ProductConfigurationCore<br/>properties, listings, pricing"]\r
    PC --> XG["XGeMCore<br/>gaming metadata SoT"]\r
    XG --> Cos[("Cosmos DB")]\r
    PCC --> Cos2[("Cosmos DB")]\r
    XG -->|committed instance| SB["Service Bus<br/>xgem-topic"]\r
    SB --> XPMC["XPMC / XProduct"]\r
    XPMC --> Store["Store PDP / catalog"]\r
    PCC -. callbacks .-> Jag["Jaguar + Submission"]\r
    classDef p fill:#efe9fb,stroke:#6b46c1;\r
    class XG,PCC p;\r
\`\`\`\r
\r
Publishers author properties and metadata in Partner Center. ProductConfigurationCore manages property modules; XGeMCore owns metadata and publishes committed changes on \`xgem-topic\` to XPMC/XProduct, which surface on the Store PDP.\r
\r
| Direction | System | Why |\r
|---|---|---|\r
| Authoring UI | Partner Center client apps (packages, properties, metadata) | Publisher input |\r
| Callers | PartnerCenterCore, SubmissionServiceClient, CMSFabricClient | Submission and content context |\r
| Publishes to | XPMC / XProduct via \`xgem-topic\` Service Bus | Propagate committed metadata to catalog |\r
| Callbacks | Jaguar + Submission (ProductConfiguration) | Publishing flow integration |\r
| Stores in | Cosmos DB (\`IXGemCoreCosmosDBClient\`; listings/properties/pricing) | Draft and committed state |\r
| Downstream | XProduct → store PDP, DimTitle, Game Pass, DCat | Semantic catalog for all Xbox experiences |\r
\r
| Component | Role |\r
|---|---|\r
| XGeMCore | Owns gaming metadata; commits and publishes to \`xgem-topic\` |\r
| XGeMPartnerCenterFD | Partner Center-facing front door for metadata |\r
| ProductConfigurationCore | Owns properties, listings, pricing modules |\r
| ProductConfigurationFD | Front door for properties/listings/pricing apps |\r
| Cosmos DB | Draft and committed storage for both services |\r
| Service Bus (\`xgem-topic\`) | Propagates committed metadata to the catalog |\r
\r
Controllers include \`MetaDataController\` (V2), \`ProductsController\`, \`LayoutController\` and \`BackfillController\`.\r
\r
## Under the hood\r
\r
XGeM's Cosmos DB account (\`cosmos-xgem-xbs-prod-eastus\`) holds a single \`GenericMetadata\` database with a \`Metadata\` container as the source of truth for every tag and property value it owns, and its Service Bus namespace (\`sb-xbs-xproduct-prod-eus\`) carries the \`xgem-topic\` that fans committed instances out to XPMC and XProduct. ProductConfiguration keeps a wider set of Cosmos containers — \`Properties\`, \`StoreListings\`, \`StoreListingsSummary\`, \`PricingInstances\`, \`AssetStoreListingInstances\` and \`Surveys\` — reflecting how many distinct module types (listings, pricing, assets, surveys) it manages compared to XGeM's single metadata concern, plus a Redis L2 cache (\`redis-xpackagecache-xbs-prod-eus\`) in front of the property read path. Both services authenticate via managed identity and Key Vault-backed AAD certificates (\`xbs-xgem-app-aad\`, \`xbs-productconfiguration-app-aad\`) rather than shared secrets.\r
\r
On the business-logic side, \`ProductsBusinessLogic\` in XGeM owns the draft/lock/validate/instance flows and the \`SendCommitedInstanceMessageAsync\` call that actually publishes a commit; \`MetaDataBusinessLogic\`/\`V2\` handle reading and writing gaming metadata, with V2 extending V1 rather than replacing it outright, and \`BackfillBusinessLogic\` implements the last-published-instance recovery path. In ProductConfiguration, the generic \`ProductConfigurationBusinessLogic<T>\` handles CRUD and lazy-import across module entity types, while \`JaguarPropertiesBusinessLogic\` and \`StoreListingBusinessLogic\` handle Jaguar draft instances and store-listing modules specifically.\r
\r
## Data and request flow\r
\r
**Metadata commit.** A publisher edits gaming metadata in Partner Center; the request flows through \`XGeMPartnerCenterFD\` into \`XGeMCore\`'s \`ProductsBusinessLogic\`, which handles draft, lock, validate and instance flows. On commit, \`SendCommitedInstanceMessageAsync\` publishes the committed metadata onto \`xgem-topic\`, which XPMC and XProduct consume to update the store PDP and the broader catalog. Because this is push-based rather than XProduct polling for changes, the store reflects a metadata commit essentially as soon as it happens, without a batch job in between.\r
\r
**Property configuration.** Separately, properties, listings and pricing are authored through the Packages/Properties client apps into \`ProductConfigurationFD\`, which routes into \`ProductConfigurationCore\`. \`ProductConfigurationBusinessLogic<T>\` provides generic CRUD and lazy-import for module entities, while \`PropertiesBusinessLogic\` and \`PricingBusinessLogic\` load, save and lock the properties and pricing modules specifically — locking matters here because two people editing the same module concurrently would otherwise silently overwrite each other's changes. Draft state lives here until it's ready to flow into the Jaguar and Submission publishing pipeline via callbacks.\r
\r
**Read path.** XProduct is the downstream semantic layer that around 20 different Xbox capabilities depend on — DimTitle, Game Pass, DCat and the store PDP among them — so a metadata or property change's real destination is XProduct, not just the PDP directly. \`MetaDataController(V2)\` and \`ProductsController\` expose the read/write surface; \`BackfillController\` supports last-published-instance backfill operations for recovering or replaying committed state.\r
\r
## The hard problems\r
\r
**Splitting source-of-truth across two services instead of one.** XGeM owns metadata; ProductConfiguration owns properties, listings and pricing. Keeping these separate rather than merging them into one "everything about a product" service means each can evolve its own data model and publishing cadence — metadata commits push immediately to \`xgem-topic\`, while properties flow through a slower, callback-driven Jaguar/Submission publishing pipeline appropriate to how those modules actually get reviewed and released.\r
\r
**Making 150+ daily publishes consistent without a single monolith.** A pluggable processor model is what lets this scale to 150-plus game publishes a day across every Xbox storefront: new metadata fields or property module types can be added as new processors rather than requiring changes to a shared, ever-growing core. This is also what kept the read side simple — XProduct consumes a stable committed-instance contract regardless of how many processor types feed into it upstream.\r
\r
**Recovering from a bad or missed publish.** Because metadata commits are pushed asynchronously to \`xgem-topic\`, a consumer-side failure or a missed message needs a recovery path that doesn't require the publisher to redo their edit. \`BackfillController\`'s last-published-instance backfill exists specifically for this: it can replay the most recent committed state for a product rather than leaving the catalog silently out of sync until someone notices.\r
\r
**Keeping the metadata read path fast despite Cosmos being the source of truth.** A \`CacheRefreshWorkerService\` keeps the XGeM cache warm continuously rather than every metadata read going straight to Cosmos, which matters because XProduct and its 20-plus downstream consumers read metadata far more often than publishers write it.\r
\r
**Managing a wider surface of property module types than metadata has to.** ProductConfiguration's six Cosmos containers — properties, listings, listings summary, pricing, asset instances, surveys — reflect that it manages several distinct kinds of draft content, each with its own load/save/lock lifecycle, compared to XGeM's single metadata concern. \`JaguarPropertiesBusinessLogic\` and \`StoreListingBusinessLogic\` exist as separate business-logic classes specifically so a change to how store listings are validated doesn't risk breaking pricing or asset handling, which share the same Cosmos account but not the same code path.\r
\r
> [!TIP]\r
> A useful way to frame this system in an interview: XGeM answers "what is true about this game," ProductConfiguration answers "how is this game configured for sale," and XProduct is where both answers get merged into what a player, or any of 20-plus internal consumers, actually sees.\r
\r
> [!WARNING]\r
> Splitting metadata and properties into two systems means a client building "everything about this product" has to call both XGeM and ProductConfiguration and reconcile the result — a cost this design accepts in exchange for each system being simpler and independently scalable.\r
\r
## Scale and reliability\r
\r
| Metric | Value |\r
|---|---|\r
| Daily game publishes | 150+ |\r
| Downstream capabilities fed by XProduct | 20+ (DimTitle, Game Pass, DCat, store PDP, and more) |\r
| Metadata propagation | Push-based via \`xgem-topic\`, not polled |\r
| Recovery mechanism | Backfill of last-published instance |\r
| Read-path optimization | \`CacheRefreshWorkerService\` keeps the XGeM cache warm |\r
| Ownership split | XGeM (metadata) and ProductConfiguration (properties/listings/pricing) as separate source-of-truth systems |\r
\r
## What I would do differently\r
\r
Splitting metadata and properties across two systems keeps each one simpler, but it pushes the burden of reconciling "everything about a product" onto every downstream consumer that needs both — and XProduct, with 20-plus dependents, is exactly the kind of place where that reconciliation logic could otherwise be duplicated. [The author can note whether a unified read API sitting above both XGeM and ProductConfiguration was considered, versus leaving that composition to XProduct and each individual consumer.] Given how much operational value the pluggable processor model already delivers for the write side, extending a similar generic composition pattern to the read side — rather than leaving it to XProduct alone — would likely reduce duplicated "fetch both, merge, handle partial failure" logic across the 20-plus downstream capabilities.\r
\r
## Cheat sheet\r
\r
- Two separate source-of-truth systems: XGeM (gaming metadata) and ProductConfiguration (properties, listings, pricing) — not one monolith.\r
- XGeM pushes committed metadata to XPMC/XProduct over \`xgem-topic\` on every commit, not on a poll or batch cadence.\r
- ProductConfiguration's properties/pricing modules use explicit load/save/lock semantics to prevent concurrent-edit overwrites.\r
- A pluggable processor model is what lets the platform absorb 150+ daily publishes without core-service changes per new field or module type.\r
- \`BackfillController\` can replay the last published instance — the recovery path for a missed or failed commit.\r
- \`CacheRefreshWorkerService\` keeps the XGeM read cache warm, since XProduct and 20+ downstream consumers read far more than publishers write.\r
- XProduct is the actual downstream semantic layer everything feeds — DimTitle, Game Pass, DCat, the store PDP.\r
\r
## Common mistakes\r
\r
| Mistake | Why it backfires |\r
|---|---|\r
| Treating XGeM and ProductConfiguration as one system | They're deliberately separate source-of-truth services with different data models and publishing cadences |\r
| Saying metadata updates on a polling/batch cycle | Commits push immediately to \`xgem-topic\` — that immediacy is a specific design choice worth naming |\r
| Forgetting the pluggable processor model | It's the actual reason 150+ daily publishes don't require core-service changes for new fields/modules |\r
| Not mentioning XProduct as the real downstream consumer | The store PDP is one of 20+ things XProduct feeds — naming only the PDP undersells the platform's reach |\r
| Skipping the backfill/recovery story | \`BackfillController\`'s last-published-instance replay is the concrete answer to "what if a commit is missed" |\r
\r
## Summary\r
\r
XGeM and ProductConfiguration split the metadata-and-properties problem into two source-of-truth systems rather than one: XGeM owns gaming metadata and pushes committed changes immediately over Service Bus, while ProductConfiguration owns properties, listings and pricing with explicit lock semantics and a slower, callback-driven publishing pipeline through Jaguar and Submission. A pluggable processor model is what lets both absorb 150-plus daily publishes without core-service rewrites, a cache-warming worker keeps metadata reads fast despite Cosmos being the source of truth, and a backfill controller gives the platform a way to recover a missed commit without redoing the publisher's work.\r
\r
## Top Interview Questions\r
\r
### Q1. Why are XGeM and ProductConfiguration two separate services instead of one "product data" service?\r
\r
Metadata (XGeM) and properties/listings/pricing (ProductConfiguration) have different data models, different publishing cadences, and different consumers. Metadata commits push immediately to the catalog over \`xgem-topic\`; property modules go through explicit draft/lock/save semantics and a slower, callback-driven publishing pipeline through Jaguar and Submission because that's how those modules are actually reviewed and released. Keeping them as separate services means each can evolve its schema and publishing logic independently, and a bug or slowdown in one doesn't directly threaten the other's availability. The cost is that any consumer needing "everything about a product" has to call both and reconcile the result, which is the trade-off this design accepts.\r
\r
### Q2. Walk through what happens when a publisher commits a metadata change in XGeM.\r
\r
The change flows through \`XGeMPartnerCenterFD\` into \`XGeMCore\`'s \`ProductsBusinessLogic\`, which manages draft, lock, validate and instance flows for that metadata. On commit, \`SendCommitedInstanceMessageAsync\` publishes a committed-instance message onto the \`xgem-topic\` Service Bus topic. XPMC and XProduct consume that message and update accordingly, which is what surfaces the change on the store PDP and across the roughly 20 other capabilities XProduct feeds — DimTitle, Game Pass, DCat among them. This is a push model, not a poll: the moment a publisher commits, downstream systems are notified, rather than XProduct periodically checking for changes.\r
\r
### Q3. Why is metadata propagation event-driven (Service Bus) rather than a synchronous call to XProduct on commit?\r
\r
A synchronous call would make the commit's success depend on XProduct (and every other subscriber) being available and fast at that exact moment, which couples XGeM's write availability to every downstream consumer's health. Publishing to \`xgem-topic\` decouples them: XGeM only needs Service Bus to accept the message, and each subscriber processes it independently, at its own pace, with its own retry semantics. It also means adding a new downstream consumer of metadata changes — a new capability that needs to react to commits — doesn't require any change to XGeM's commit logic, just a new subscription to the existing topic.\r
\r
### Q4. What happens if a committed metadata message never reaches XProduct — how does the platform recover?\r
\r
\`BackfillController\` supports last-published-instance backfill operations, which can replay the most recently committed state for a product rather than requiring the publisher to redo their edit or someone to notice and manually intervene. [The author can add specifics on how backfill is actually triggered in practice — for example, whether it's run on-demand by an engineer investigating a sync issue, or on a scheduled reconciliation pass.] This recovery path exists specifically because an asynchronous, push-based propagation model needs an answer for "what if the message was lost or the consumer failed to process it," which a purely synchronous design wouldn't need in the same way, but which comes with its own added complexity.\r
\r
### Q5. Why does the properties module use explicit lock semantics instead of last-write-wins?\r
\r
Properties, listings and pricing modules are edited by publisher teams, and it's entirely plausible for two people to open the same product's properties module around the same time. Last-write-wins would mean one editor's changes silently disappear with no indication anything was overwritten. \`PropertiesBusinessLogic\` and \`PricingBusinessLogic\` load, save and lock these modules explicitly, so a second editor is blocked or warned rather than unknowingly clobbering the first editor's in-progress changes — a small amount of added friction in exchange for not losing publisher work silently.\r
\r
### Q6. What is the "pluggable processor model" and why does it matter for scaling to 150+ daily publishes?\r
\r
Rather than a single, ever-growing service that hardcodes every metadata field or property module type, new fields and module types are added as new processors that plug into the existing commit and publish pipeline. This means the core services — \`XGeMCore\`, \`ProductConfigurationCore\` — don't need to be modified every time a new kind of metadata or property is introduced; only a new processor needs to be written and registered. At 150-plus daily publishes across every Xbox storefront, this is what keeps the platform's core logic stable while the set of things publishers can configure keeps growing.\r
\r
### Q7. Why does XGeM need its own read cache (CacheRefreshWorkerService) if Cosmos DB is already the source of truth?\r
\r
Cosmos is durable and correct, but XProduct and the roughly 20 downstream capabilities that depend on it read metadata far more often than publishers write it — a classic read-heavy access pattern. Going straight to Cosmos on every read would work, but it adds latency and load that a warm cache avoids. \`CacheRefreshWorkerService\` keeps that cache populated proactively in the background, so the hot read path resolves from cache rather than round-tripping to Cosmos for data that changes relatively infrequently compared to how often it's read.\r
\r
### Q8. If XProduct is the actual downstream consumer for 20+ capabilities, why does the store PDP get all the attention when describing this system?\r
\r
The PDP is the most visible, player-facing consequence of a metadata or property change, which is why it's the natural example to reach for — but it understates the platform's actual reach. XProduct is the semantic layer that DimTitle, Game Pass, DCat and roughly 17 other capabilities also depend on, meaning a single metadata commit's blast radius is much wider than "does the store page look right." When describing this system in an interview, naming XProduct explicitly as the downstream consumer, with the PDP as one example among 20-plus, gives a much more accurate picture of the platform's scope.\r
\r
### Q9. What was your specific contribution to XGeM/ProductConfiguration versus the team's?\r
\r
[The author should state their specific ownership — for example: "I owned the metadata ingestion platform end to end, from the React authoring UI down to the .NET backend, including the pluggable processor model that lets it absorb 150+ daily publishes."] The strongest answer picks a concrete slice — the processor model, the backfill/recovery path, a specific business-logic component — that you can defend under detailed follow-up, rather than claiming ownership of both XGeM and ProductConfiguration end to end, since they're explicitly separate systems that plausibly had different owners or contributors.\r
\r
### Q10. How would you extend this platform to support a brand-new metadata field that only some client surfaces need to read?\r
\r
Given the pluggable processor model, a new metadata field would be added as a new processor within XGeM rather than a change to the core commit/publish pipeline, and it would flow through the same \`xgem-topic\` commit path to XPMC/XProduct as every other field. Whether a specific client surface reads it or not is then a consumption-side decision at the XProduct layer or below, not something XGeM itself needs to gate — XGeM's job is to make the field part of the committed instance correctly and consistently, and downstream consumers choose what they read from that instance.\r
`;export{e as default};
