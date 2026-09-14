const e=`---\r
title: XServicesInsights\r
description: The internal developer productivity and live site operations platform that lets engineers debug and operate a 600 plus microservice estate\r
difficulty: Core\r
tags: [xbox, xservicesinsights, developer-tools, rbac]\r
---\r
XServicesInsights (internally "coral", reached at \`coral.xboxservices.com\`) is the internal developer-productivity and live-site operations platform for a 600-plus microservice estate. It gives 130-plus engineers across 10-plus services one governed console for a gateway proxy, data explorers, workflow investigation, AKS management and S2S tokens — with RBAC, just-in-time access, and a read-only default — instead of a scattered toolbox of one-off scripts.\r
\r
## What it is\r
\r
A front door, \`XServicesInsightsFD\`, plus a DevTools UI that collapses a scattered toolbox into one governed console.\r
\r
| Tool | What it does |\r
|---|---|\r
| Gateway proxy | Safely calls service APIs — import a cURL, save and replay requests — without hand-crafting S2S auth each time |\r
| Data explorers | Read-only Cosmos and SQL explorers to inspect records live while debugging an incident |\r
| Workflow investigation | Traces long-running jobs (for example XPackage): recursive tree, history, job details, requeue or stop |\r
| AKS management | Cluster diagnostics — overview, list pods, events, describe resources, pod logs, service-mesh traffic |\r
| S2S tokens | Generates service-to-service tokens on demand for authorized debugging |\r
| XPCi Copilot | An embedded natural-language assistant to ask questions over IcM, Prometheus and Kubernetes in plain English |\r
\r
> [!NOTE]\r
> XServicesInsights is not the same thing as Nexus Hub. XServicesInsights is the governed, RBAC-gated platform for inspecting APIs, data stores, workflows and AKS across the whole estate. Nexus Hub is an individual engineer's local, configurable daily dashboard that can surface some of that operational context alongside ADO, IcM and personal notes. See the Nexus Hub page for that distinction in more detail.\r
\r
## Architecture\r
\r
\`\`\`mermaid\r
flowchart TB\r
    Dev["Engineer / DRI"] -->|browser login<br/>x-ms-authorization-aaduser| FD["XServicesInsightsFD<br/>coral(-staging).xboxservices.com"]\r
    JIT["Azure PIM / JIT<br/>XSI - Dev Tools Users"] -. grants role .-> Dev\r
    FD --> GP["Gateway proxy"]\r
    FD --> EX["Cosmos / SQL explorers"]\r
    FD --> WF["Workflow investigator"]\r
    FD --> K8["AKS diagnostics"]\r
    FD --> CP["XPCi Copilot (AI)"]\r
    GP --> Svcs["Any XPCi service API"]\r
    K8 --> Clusters["AKS clusters (per region)"]\r
    CP --> Signals["IcM + Prometheus + K8s (read-only)"]\r
    classDef b fill:#e6f0fb,stroke:#0a67c2;\r
    class FD b;\r
\`\`\`\r
\r
Engineers log in via browser (AAD), with roles elevated just-in-time through PIM. The front door fans out to each tool; the AI Copilot and diagnostics are read-only over IcM, Prometheus and Kubernetes.\r
\r
| Aspect | Detail |\r
|---|---|\r
| Deployed by | GitOps — \`apps/base/xservicesinsightsfd\` (Helm release, HTTPRoute, HPA) |\r
| Autoscaling | HPA at 80% CPU, 3–10 pods |\r
| Talks to | Every service's API (via gateway proxy, by \`serviceName\`), AKS clusters, Cosmos/SQL, IcM, Prometheus |\r
| AI surface | XPCi Copilot plus \`xpci-services-insights\` MCP servers (staging and prod, read-only) |\r
\r
## Data and request flow\r
\r
**A typical debugging session** starts with an engineer opening \`coral.xboxservices.com\` and authenticating with AAD; if their task needs an elevated role — say, \`XSI - XPackage Users\` to investigate a stuck job — they request it through Azure PIM, which grants it just-in-time and lets it expire automatically rather than leaving standing access around. From there, the front door exposes workflow controllers (\`GET /workflows/{jobId}\`, \`/search\`, \`/history\`, \`PUT /workflows/requeue\`, \`/requeue/force\`, \`/stop\`) to investigate long-running XPackage jobs; a gateway proxy React SPA plus API that replays saved requests to any service, injecting the \`x-ms-authorization-aaduser\` header so engineers don't hand-craft S2S auth themselves; and Cosmos, SQL, Kubernetes, Storage, Prometheus and Service Bus explorer controllers for read-only inspection. A background \`OfferRefreshBackgroundService\`, backed by an \`OfferRefreshQueue\`, handles XPrice offer refresh as part of the same platform.\r
\r
Everything an engineer saves — cURL requests, Cosmos queries, SQL queries, generated diagrams — persists in a dedicated Cosmos DB (\`cosmos-xsi-xbs-prod-eastus\`, database \`XServicesInsights\`) across containers for \`SavedCurls\`, \`SavedCosmosQueries\`, \`SavedSqlQueries\`, \`SavedMermaidImages\` and \`UserActions\`, and a SQL explorer maintains connections into several service databases including \`XTargetJobManagement\`, \`XPackage\`, \`XProduct\`, \`DocPCD\`, \`Egress\` and \`XMTCommon\`.\r
\r
## Under the hood\r
\r
Identity runs through a dedicated AAD app (\`XSERVICESINSIGHTSFD-AAD\`) using certificate-based auth rather than a shared secret, layered under the \`XSI.*\` family of JIT/PIM roles described above. Request shadowing is enabled on the front door, meaning production traffic can be mirrored for testing or diagnostics without affecting the live request path — useful when validating a change to a widely used explorer without risking the tool every engineer depends on. On the Kubernetes side, the service runs in its own \`xservicesinsightsfd\` namespace under the standard GitOps model, fronted by the \`coral.xboxservices.com\` host mapping and running under its own managed identity (\`mui-xservicesinsightsfd-xbs-prod\`), with the same 3–10 pod HPA at 80% CPU governing both the staging and production deployments independently.\r
\r
## The hard problems\r
\r
**Making one platform safe to hand to the whole org.** Consolidating 20-plus debugging tools behind a single front door raises the stakes of every credential and every mutation: a gateway proxy that can call any service API, or a workflow tool that can force-stop a job, is powerful in the wrong hands. The answer was access control at two layers — Azure PIM groups (\`XSI - Dev Tools Users\`, \`XSI - XPackage Users\`) that grant roles just-in-time and let them expire, plus an environment split where staging (\`coral-staging.xboxservices.com\`) allows the gateway proxy and mutating tools, while production (\`coral.xboxservices.com\`) keeps diagnostics read-only by default and requires human approval for live mutations.\r
\r
**Not hand-crafting S2S auth for every debugging call.** Before a shared gateway proxy, calling another team's service API to debug an issue meant acquiring and attaching service-to-service auth manually, which is exactly the kind of friction that turns a two-minute check into a 20-minute yak-shave. The gateway proxy solves this once, centrally: it injects the \`x-ms-authorization-aaduser\` header on behalf of the authenticated engineer, and requests can be saved and replayed instead of re-built from scratch each time.\r
\r
**Making the AI Copilot trustworthy enough to embed.** XPCi Copilot answers natural-language questions over IcM, Prometheus and Kubernetes, which only works if engineers can trust its answers don't quietly change anything. Keeping it strictly read-only — same as the diagnostics it sits alongside — is what makes it safe to expose broadly rather than gating it behind extra approval on every query.\r
\r
**Scoping access per service, not just per engineer.** A blanket "developer" role would either be too permissive (any engineer could touch any service's data) or too restrictive (engineers would need a new role for every team they occasionally help debug). Service-scoped PIM groups like \`XSI - XPackage Users\` let access map to the actual boundary that matters — which service's workflows, data and jobs an engineer is authorized to touch right now — rather than a single global elevation that would otherwise become the path of least resistance for every request, regardless of scope.\r
\r
> [!WARNING]\r
> The staging/production split is deliberate, not incidental: staging allows the gateway proxy and mutating tools so engineers can safely rehearse a fix, while production defaults to read-only diagnostics specifically so an ops session can't accidentally become a live-site change.\r
\r
## Scale and reliability\r
\r
| Metric | Value |\r
|---|---|\r
| Developers using it | 130+ across 10+ services |\r
| Tools consolidated | 20+ |\r
| Debug time before | 20–30 minutes per investigation |\r
| Debug time after | Seconds |\r
| Service estate it can inspect | 600+ microservices |\r
| Autoscaling | HPA, 3–10 pods at 80% CPU |\r
| Access model | RBAC plus just-in-time (Azure PIM), read-only by default in production |\r
\r
## What I would do differently\r
\r
The platform is deliberately read-only-first in production, which is the right default for safety but pushes every mutating action (a forced job requeue, a live data fix) into a manual-approval path that can itself become a bottleneck during an active incident. [The author can note whether a faster, still-governed escalation path for mutations during a live incident was ever considered or built — for example, a break-glass role with tighter audit logging instead of a full manual approval.] Given how much debugging time the read-only tools already saved, the next investment would likely be making the small set of genuinely necessary mutating actions just as fast to use safely, rather than leaving them as the slow path by default.\r
\r
A second area worth revisiting is discoverability: with 20-plus tools behind one front door, a new engineer's first challenge is often knowing which explorer or workflow view answers their specific question, not lacking access to it. [The author can note whether any in-product guidance, search, or the XPCi Copilot itself was extended to help engineers find the right tool rather than just answer questions once they've found it.] As the tool count keeps growing, that discovery problem will likely matter as much as raw tool count did in the platform's early days.\r
\r
## Cheat sheet\r
\r
- One front door (\`XServicesInsightsFD\`) in front of 20+ tools: gateway proxy, Cosmos/SQL explorers, workflow investigation, AKS diagnostics, S2S tokens, an AI Copilot.\r
- Access is RBAC plus just-in-time via Azure PIM groups (\`XSI - Dev Tools Users\`, \`XSI - XPackage Users\`); auth uses \`x-ms-authorization-aaduser\`.\r
- Staging (\`coral-staging\`) allows mutating tools; production (\`coral\`) is read-only by default, live mutations need human approval.\r
- Debugging time dropped from 20–30 minutes to seconds for 130+ developers across 10+ services.\r
- The gateway proxy's core value is not hand-crafting S2S auth per call — it injects auth and lets requests be saved/replayed.\r
- XPCi Copilot answers natural-language questions over IcM, Prometheus and Kubernetes, and is read-only like the rest of the diagnostics.\r
- Deployed via GitOps (Helm + HTTPRoute + HPA), autoscaling 3–10 pods at 80% CPU.\r
\r
## Common mistakes\r
\r
| Mistake | Why it backfires |\r
|---|---|\r
| Calling it "just a debugging UI" | It's a governed platform with RBAC, JIT access and an explicit read-only-by-default safety model — that governance is the actual design story |\r
| Not distinguishing it from Nexus Hub | XServicesInsights is the shared, governed ops platform; Nexus Hub is a personal local dashboard — conflating them signals unfamiliarity with your own tooling landscape |\r
| Saying access is open to all engineers | Access is PIM-gated and just-in-time, specifically so elevated roles expire rather than becoming standing access |\r
| Ignoring the staging vs. production split | The read-only default in production is a deliberate safety boundary, not a limitation — mutating tools live in staging |\r
| Forgetting the before/after debug-time numbers | 20–30 minutes to seconds, for 130+ developers, is the concrete evidence of impact |\r
\r
## Summary\r
\r
XServicesInsights consolidates 20-plus scattered debugging tools — a gateway proxy, data explorers, workflow investigation, AKS diagnostics, S2S tokens and an AI Copilot — behind one front door, governed by RBAC and just-in-time Azure PIM access rather than standing permissions. The platform is read-only by default in production and only allows mutating actions in staging or behind explicit human approval, which is what makes it safe to open up to 130-plus developers across 10-plus services. That governance model, more than any individual tool, is the reason routine debugging dropped from 20–30 minutes to seconds without introducing a new blast radius for live-site risk.\r
\r
## Top Interview Questions\r
\r
### Q1. Why put 20-plus different debugging tools behind one front door instead of leaving them as separate scripts and dashboards?\r
\r
A scattered toolbox means every tool reinvents its own auth, its own access control, and its own UI, and engineers waste time re-learning or re-building the same debugging steps across teams. Consolidating behind \`XServicesInsightsFD\` means access control (RBAC plus PIM), authentication (\`x-ms-authorization-aaduser\`), and the safety model (read-only-by-default in production) are enforced once, centrally, instead of inconsistently per tool. It also means a new tool — like the AKS diagnostics or the AI Copilot — inherits that governance automatically rather than needing its own auth story built from scratch, which is a large part of why the platform could grow to 20-plus tools without each one becoming its own security review.\r
\r
### Q2. Explain the just-in-time access model — why not just grant engineers standing access to the roles they need?\r
\r
Standing access means a compromised or careless account has whatever permissions were ever granted, indefinitely. Azure PIM groups like \`XSI - Dev Tools Users\` and \`XSI - XPackage Users\` are requested and granted just-in-time, and expire automatically, so the window where an account actually holds an elevated role is as short as the task requires. This trades a small amount of friction — requesting elevation before a debugging session — for a much smaller standing attack surface and a clear audit trail of who elevated what role and when, which matters a lot more once the platform can reach into 600-plus services.\r
\r
### Q3. Why is production read-only by default while staging allows mutating tools?\r
\r
Production diagnostics — Cosmos/SQL explorers, AKS pod inspection, workflow investigation — are read-only so that an engineer troubleshooting a live incident can't accidentally turn an investigation into a live-site change. Staging is where the gateway proxy and mutating tools are allowed, because rehearsing a fix against non-production data doesn't carry the same blast radius. When a live mutation genuinely is necessary in production — say, force-stopping a stuck workflow — it goes through explicit human approval rather than being just another button in the UI, which keeps the read-only default meaningful instead of becoming a formality that's routinely bypassed.\r
\r
### Q4. What problem does the gateway proxy actually solve, and why was it worth building?\r
\r
Calling another team's service API to debug something used to mean manually acquiring service-to-service auth for that specific service — a real source of the 20–30 minutes debugging used to take. The gateway proxy centralizes that: it's a React SPA plus API that injects the \`x-ms-authorization-aaduser\` header on the engineer's behalf, and it lets requests be imported from a cURL, saved, and replayed later instead of re-built from scratch every time. The net effect is that calling any of 600-plus services to check a data point or reproduce an issue becomes a saved, repeatable action rather than a one-off auth exercise each time.\r
\r
### Q5. How does the workflow investigation tool actually help debug a stuck job, say in XPackage?\r
\r
It exposes a recursive tree view of a long-running job, its history, and job details, plus the ability to requeue or stop it directly (\`GET /workflows/{jobId}\`, \`/search\`, \`/history\`, \`PUT /workflows/requeue\`, \`/requeue/force\`, \`/stop\`). Instead of an engineer manually tracing a job's state across whatever system originally created it, the tool surfaces the job's full execution tree in one place, which is what turns a job investigation that used to take many manual steps into something answerable in seconds. [The author can add a specific example of a stuck-job scenario this tool resolved quickly.]\r
\r
### Q6. What does XPCi Copilot add on top of the existing explorers and diagnostics?\r
\r
It's a natural-language layer over the same signals the platform already exposes — IcM incidents, Prometheus metrics, Kubernetes state — so an engineer can ask a plain-English question instead of knowing the right Prometheus query or IcM filter syntax by heart. It's deliberately read-only, matching the rest of the platform's production safety model, so it can be embedded broadly without needing the same mutation-approval gate that live actions require. This lowers the bar for less-experienced engineers to self-serve debugging questions that previously required knowing exactly which tool and query to reach for.\r
\r
### Q7. If the front door itself (XServicesInsightsFD) went down, what's the operational impact?\r
\r
Every tool behind it — gateway proxy, explorers, workflow investigation, AKS diagnostics, the AI Copilot — becomes unavailable at once, since they're all fronted by the same service. [The author should confirm the specific mitigation here — for example, whether the HPA's 3–10 pod range and multi-region deployment are sized to make a full front-door outage rare, and whether there's a documented fallback for engineers to reach the underlying data stores and clusters directly during such an outage.] Given the platform's own scope — 130+ developers depending on it daily — an outage here mainly costs developer velocity rather than end-user impact, since it's an internal tool, not a customer-facing service.\r
\r
### Q8. How would you extend this platform to support a brand-new service that just onboarded?\r
\r
Because access, auth and the tool shell are centralized, onboarding a new service mostly means registering it so the gateway proxy can address it by \`serviceName\`, and adding any service-specific PIM role if that service needs its own scoped access group (similar to how \`XSI - XPackage Users\` scopes access to XPackage-specific workflow tools). The generic explorers — Cosmos, SQL, Kubernetes, Prometheus — already work against any service using that infrastructure without new code, which is a direct benefit of building the tools generically rather than per-service from the start.\r
\r
### Q9. What was your personal contribution to XServicesInsights versus the team's?\r
\r
[The author should state their specific ownership clearly — for example: "I created and led this platform end to end, building the initial gateway proxy and explorer tools and establishing the RBAC/JIT access model that let it scale to 130+ developers."] The strongest version of this answer picks one or two concrete pieces — a specific tool you built, or the access-control model you designed — that you can defend in depth under follow-up, rather than a broad claim of ownership over the whole platform, especially since this system explicitly spans many tools that likely had different contributors over time.\r
`;export{e as default};
