const e=`---\r
title: How It All Fits Together\r
description: One journey from a request to the cloud and back, covering Azure building blocks, delivery, autoscaling, observability, and service trust\r
difficulty: Core\r
tags: [xbox, systems, architecture, azure, kubernetes]\r
---\r
\r
One journey from a player's tap to the cloud and back. We'll follow a single request end to end, then peel back each platform layer underneath it: the Azure building blocks, how code ships, how it auto-scales, how it's watched, and how services trust each other. Every one of the ~220 services in this estate is built from the same handful of pieces described below — Azure, AKS and Kubernetes, Flux GitOps, Prometheus and Grafana, and Managed Identity — so this page is worth reading once, carefully, rather than once per system.\r
\r
## 1. Follow a single request\r
\r
Everything below exists to make this one trip fast, safe, and reliable.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    A["Player / Publisher"] -->|HTTPS| B["Istio Gateway(entry point)"]\r
    B --> C["FD servicechecks who you are"]\r
    C -->|S2S token| D["Core servicebusiness logic"]\r
    D --> E[("Cosmos DB")]\r
    D --> F[("Redisfast cache")]\r
    D -->|events| G["Service Bus"]\r
    D --> H["reply"]\r
    H --> A\r
    classDef edge fill:#e6f0fb,stroke:#0a67c2;\r
    classDef core fill:#e8f5e8,stroke:#107c10;\r
    class B,C edge;\r
    class D core;\r
\`\`\`\r
\r
A request enters through the Istio gateway, is authenticated by a Front-Door (FD) service, forwarded with a service-to-service token to a Core service, which reads and writes data and emits events.\r
\r
### Front Door (FD)\r
\r
The public face. Handles **auth** (Entra ID / AAD), routing, feature flags and A/B flighting. Example: \`XGuideFD\`, \`XGuideSelfServeFD\`.\r
\r
### Core\r
\r
The brain. Pure business logic in **Clean Architecture** layers. Trusts callers via **S2S** tokens. Example: \`XEvents\`, \`XSaleCore\`.\r
\r
### Data & messaging\r
\r
**Cosmos DB** for documents, **Redis** for speed, **Service Bus** for async work, **SQL** where relational fits.\r
\r
## 2. Inside a service — Clean Architecture\r
\r
Every one of the ~220 C#/.NET 8 services is built from the same four layers. Learn it once and you understand the shape of all of them.\r
\r
\`\`\`mermaid\r
flowchart TB\r
    Req["HTTP request"] --> Ctl["Controllersthin - inherit BaseController"]\r
    Ctl --> BL["BusinessLogicthe rules (IXxxBusinessLogic)"]\r
    BL --> DD["DomainDataaggregates data from many sources"]\r
    DD --> Repo["Repositoriestalk to Cosmos / SQL"]\r
    Repo --> DB[("Database")]\r
    BL -. uses .-> Val["Validators"]\r
    BL -. uses .-> Map["Mappers (static)"]\r
    BL -. calls .-> Fab["Fabric clients(other services' SDKs)"]\r
\`\`\`\r
\r
Controllers stay thin; business logic holds the rules; domain-data aggregates; repositories touch storage. Supporting cast: validators, static mappers, and "fabric clients" — typed SDKs used to call other services.\r
\r
> [!KEY]\r
> Most systems ship as a pair: a **Core** (backend logic, Service Bus listeners, database) and an **FD** front door (public API, auth, routing). Clients only ever touch the FD; the FD calls the Core. Recognising this pair is the fastest way to orient yourself in an unfamiliar service.\r
\r
## 3. The Azure building blocks\r
\r
What the cloud actually provides, all provisioned with **Terraform** (Infrastructure-as-Code) from the \`Xbox.XPCi.Infrastructure\` repo.\r
\r
| Building block | What it provides |\r
|---|---|\r
| AKS | Azure Kubernetes Service — the Linux container cluster where every service runs |\r
| Cosmos DB | Globally-distributed NoSQL document store — the primary database for most services |\r
| Redis | Azure Cache for Redis — in-memory cache for high-QPS read paths |\r
| Service Bus | Reliable message queues and topics for async, decoupled work |\r
| Key Vault | Secret store — secrets are mounted at runtime via CSI, never in code |\r
| Managed Identity | Passwordless identities so services and pods authenticate to Azure with no keys |\r
| Managed Grafana | Dashboards over Prometheus metrics — the health cockpit |\r
| Storage & SQL | Blob storage (for example client app bundles) and Azure SQL where relational data fits |\r
\r
Reusable Terraform modules live in \`Xbox.XPCi.Infrastructure/terraform/azurerm_modules/\`: \`gitops/\` installs the Flux extension and git config onto AKS (\`azurerm_kubernetes_flux_configuration\`); \`managed-identity/\` provisions an \`azurerm_user_assigned_identity\` per workload; \`keyvault/\`, \`storage-account/\`, and \`role-assignment/\` (RBAC) cover secrets, storage, and access; and \`dashboard-grafana/\` wires up dashboards. Prometheus and alerting rules live separately, in \`terraform/subscriptions/infrastructure/aks-cluster/prometheus.tf\` — data-collection rules plus \`azurerm_monitor_alert_prometheus_rule_group\` definitions.\r
\r
## 4. How code ships — CI/CD + GitOps\r
\r
Two halves: a **pipeline** builds and tests the image, then **GitOps** rolls it onto the clusters.\r
\r
\`\`\`mermaid\r
flowchart LR\r
    Dev["Engineerpushes PR"] --> ADO["Azure DevOps CIbuild - test - scan"]\r
    ADO --> Img["Container image(Docker)"]\r
    Img --> Reg["Container registry"]\r
    ADO --> Cfg["Update GitOps repo(new image tag)"]\r
    Cfg --> Flux["Flux watchesXbox.XPCi.GitOps"]\r
    Flux --> K1["Staging (wus)"]\r
    Flux --> K2["Prod eus / sea / weu / wus2"]\r
    K2 --> Roll{"Health OK?"}\r
    Roll -->|yes| Live["Live traffic"]\r
    Roll -->|no| RB["Auto-rollback"]\r
\`\`\`\r
\r
CI builds and validates; the desired state is written to Git; Flux continuously reconciles the clusters to match Git. Bad deploys auto-rollback.\r
\r
### GitOps means Git is the source of truth\r
\r
The \`Xbox.XPCi.GitOps\` repo **describes** what should run. **Flux**, running inside the cluster, constantly makes reality match the repo. To deploy, you change YAML — not the cluster directly.\r
\r
### Base plus overlays: one config, many regions\r
\r
\`apps/base/<service>\` holds the shared manifest. Per-environment **overlays**, built with **Kustomize**, patch it: \`apps/staging/wus\` and \`apps/prod/{eus,sea,weu,wus2}\`. Same service, region-specific tweaks, no copy-paste.\r
\r
Each service's GitOps folder under \`apps/base/<service>/\` bundles the Kubernetes objects that define it:\r
\r
| Manifest | What it does |\r
|---|---|\r
| \`deployment\` / \`helm/release.yaml\` | Runs the container(s) |\r
| \`service.yaml\` | Stable in-cluster network name |\r
| \`httproute.yaml\` | Gateway API ingress (for example \`weather-staging.xboxservices.com\`) |\r
| \`serviceaccount.yaml\` | Binds the pod to a **workload identity** (\`azure.workload.identity/client-id\`) |\r
| \`authorizationpolicy.yaml\` | Istio rule for who may call this service |\r
| \`horizontalpodautoscaler.yaml\` / \`scaledobject.yaml\` | Auto-scaling, covered next |\r
\r
## 5. Controllers that keep it right-sized\r
\r
Kubernetes "controllers" are little robots that watch a metric and add or remove pods automatically. Two kinds are used here.\r
\r
**HPA — scale on CPU.** The Horizontal Pod Autoscaler adds replicas when CPU is high and removes them when idle, which suits request-driven APIs well. Real example: \`xsearchcore\` targets 70% CPU with 20–30 pods; \`xservicesinsightsfd\` targets 80% CPU with 3–10 pods.\r
\r
**KEDA — scale on queue depth.** Kubernetes Event-Driven Autoscaling scales workers on an *event* signal — how many messages are waiting in a Service Bus queue — which fits background processors perfectly. Real example: \`xpackagemsixvc2workflowworker\`'s \`ScaledObject\` adds pods once a queue passes roughly 5 messages, authenticated through workload identity.\r
\r
**VPA** also plays a part: the Vertical Pod Autoscaler right-sizes each pod's CPU/memory *requests*, and an internal tool called **XPCi Forge** recommends those numbers from historical usage. HPA adds *more* pods; VPA makes each pod the *right size*.\r
\r
## 6. Watching everything — observability\r
\r
Three signals answer "is it healthy?": **metrics** (numbers), **logs** (events), and **traces** (request paths).\r
\r
\`\`\`mermaid\r
flowchart LR\r
    subgraph Cluster["AKS cluster"]\r
      Pods["Service podsexpose /metrics"]\r
    end\r
    Pods -->|scraped| Prom["Azure ManagedPrometheus"]\r
    Pods -->|logs| Gen["Genevalogging"]\r
    Pods -->|traces| OT["OpenTelemetry"]\r
    Prom --> Graf["Managed Grafanadashboards"]\r
    Prom --> Rules["Prometheusalert rules"]\r
    Rules -->|fires| ICM["IcM incident+ on-call page"]\r
    Graf --> Human["Engineer / DRI"]\r
    ICM --> Human\r
\`\`\`\r
\r
Pods expose metrics; Managed Prometheus scrapes them; Grafana visualizes; alert rules fire IcM incidents to on-call. Logs go to Geneva, traces via OpenTelemetry.\r
\r
Every service exposes counters such as \`http_incoming_request_total\`, which Grafana turns into availability, RPS, and latency dashboards. Geneva holds the structured event logs for debugging exactly what happened, without sensitive data. OpenTelemetry follows one request as it hops across services, to find the slow link.\r
\r
> [!TIP]\r
> Alert rules, defined in Terraform and the \`prometheus-monitors\` GitOps add-on, watch the metrics. When a threshold breaks, an **IcM** incident is raised and the on-call **DRI** is paged. Every service ships a **TSG** troubleshooting guide, and an AI **DRI Assistant** summarizes signals to speed up the response.\r
\r
## 7. How services trust each other\r
\r
Two front lines: authenticate *users* at the edge, and authenticate *services* to each other inside.\r
\r
\`\`\`mermaid\r
flowchart TB\r
    User["User"] -->|Entra ID / OAuth 2.0| FD["FD serviceAddFrontDoorAuthentication()"]\r
    FD -->|S2S token| Core["Core serviceAddCoreAuthentication()"]\r
    Core -->|Managed Identity| Azure["Cosmos / Redis / Key Vault"]\r
    Istio["Istio AuthorizationPolicy"] -. default-deny .-> Core\r
    note["Only allowed namespacesmay call the service"] -.-> Istio\r
\`\`\`\r
\r
Users log in with Entra ID (OAuth 2.0) at the FD. Services prove identity to each other with service-to-service (S2S) tokens. Pods reach Azure resources via passwordless Managed Identity. Istio enforces default-deny between services.\r
\r
Five layers of defense stack on top of each other: Entra ID / OAuth 2.0 authenticates users at the front door; S2S tokens (\`AddCoreAuthentication\` versus \`AddFrontDoorAuthentication\`) authenticate service-to-service calls; Managed Identity authenticates services to Azure with no passwords or keys; Istio's \`AuthorizationPolicy\` defaults to deny, so only explicitly listed callers pass; and Key Vault, mounted at runtime via CSI, keeps secrets out of code entirely.\r
\r
Humans get the minimum role, elevated **just-in-time** (JIT) via Azure PIM only when needed — for example, the \`XSI - Dev Tools Users\` group to use internal tools. Production access for AI agents is blocked entirely, on principle.\r
\r
## 8. The whole picture on one screen\r
\r
\`\`\`mermaid\r
flowchart TB\r
    subgraph Clients\r
      PL["Players"]:::c\r
      PB["Publishers (Partner Center + XMT)"]:::c\r
    end\r
    subgraph Edge["Edge"]\r
      GW["Istio Gateway API"]:::e\r
    end\r
    subgraph Apps["AKS - ~220 microservices"]\r
      FDs["FD services (auth/routing)"]:::e\r
      Cores["Core services (logic)"]:::g\r
      Workers["Workers (KEDA-scaled)"]:::a\r
    end\r
    subgraph Data["Data & messaging"]\r
      CDB[("Cosmos DB")]:::d\r
      RDS[("Redis")]:::d\r
      SBUS["Service Bus / Event Hubs"]:::d\r
      SQL[("SQL Server")]:::d\r
    end\r
    subgraph Platform["Platform"]\r
      FLX["Flux GitOps"]:::p\r
      OBS["Prometheus + Grafana + Geneva"]:::p\r
      SEC["Entra ID - Managed Identity - Key Vault"]:::p\r
    end\r
    PL --> GW\r
    PB --> GW\r
    GW --> FDs --> Cores\r
    Cores --> CDB & RDS & SQL\r
    Cores --> SBUS --> Workers\r
    Workers --> CDB\r
    FLX -. deploys .-> Apps\r
    OBS -. watches .-> Apps\r
    SEC -. secures .-> Apps\r
    classDef c fill:#eef1f7,stroke:#93a0b5;\r
    classDef e fill:#e6f0fb,stroke:#0a67c2;\r
    classDef g fill:#e8f5e8,stroke:#107c10;\r
    classDef a fill:#fbf3e2,stroke:#b7791f;\r
    classDef d fill:#fff,stroke:#5b657a;\r
    classDef p fill:#efe9fb,stroke:#6b46c1;\r
\`\`\`\r
\r
The full estate: clients flow through the gateway to FD to Core to data and messaging, workers pick up async fan-out, all of it hosted on AKS, deployed by Flux, watched by Prometheus, Grafana, and Geneva, and secured by Entra ID plus Managed Identity.\r
\r
> [!KEY]\r
> Say this out loud as the one-paragraph version: roughly 220 .NET 8 microservices run as containers on AKS across five regions. Each follows Clean Architecture and ships as a Core-plus-Front-Door pair. They store data in Cosmos, cache in Redis, and talk asynchronously over Service Bus. Azure resources are provisioned with Terraform; deployments are GitOps via Flux from a base-plus-overlays repo, with auto-rollback. HPA and KEDA keep everything right-sized. Prometheus, Grafana, and Geneva provide observability, alerting into IcM. Users authenticate with Entra ID, services with S2S tokens, and pods reach Azure through passwordless Managed Identity behind an Istio default-deny mesh.\r
\r
## Cheat sheet\r
\r
- One request: gateway → FD (auth) → Core (logic, S2S) → Cosmos/Redis/Service Bus → reply.\r
- Every service is four layers: Controllers → BusinessLogic → DomainData → Repositories.\r
- Most systems ship as a Core-plus-FD pair; clients only ever talk to the FD.\r
- Deploy path: PR → Azure DevOps CI → image → GitOps repo update → Flux reconciles → auto-rollback on failed health.\r
- Base manifest plus per-region Kustomize overlays; no copy-paste across regions.\r
- HPA scales on CPU for request-driven APIs; KEDA scales on queue depth for workers; VPA right-sizes each pod.\r
- Five layers of trust: Entra ID at the edge, S2S between services, Managed Identity to Azure, Istio default-deny, Key Vault via CSI.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Describing deployment as "we push to the cluster" | Describe it as Git-first: change YAML, Flux reconciles |\r
| Treating HPA and KEDA as interchangeable | HPA is for CPU-bound APIs; KEDA is for queue-depth-driven workers |\r
| Assuming a service's Core does its own authentication | The FD authenticates users; Cores trust FDs via S2S tokens |\r
| Forgetting that Managed Identity replaces stored secrets | No app secret for Azure resource access — Azure issues and rotates it |\r
| Saying "we have monitoring" without naming the three signals | Distinguish metrics, logs, and traces and what each one answers |\r
| Implying humans or AI agents hold standing production access | Access is JIT via PIM; AI agents are blocked from production entirely |\r
\r
## Summary\r
\r
One mental model carries the whole platform: a request enters through an Istio gateway, is authenticated by a Front-Door service, and reaches a Core service over an S2S-trusted call, where Clean Architecture layers turn it into reads and writes against Cosmos, Redis, and Service Bus. Terraform provisions the Azure building blocks underneath; GitOps, via Flux and a base-plus-overlays repo, is how code actually reaches production, with HPA and KEDA keeping the fleet right-sized. Prometheus, Grafana, and Geneva answer "is it healthy," and a five-layer trust chain — Entra ID, S2S tokens, Managed Identity, Istio default-deny, and Key Vault — answers "can I trust who's calling." Every one of the ~220 services in this estate is a variation on this same journey, which is what makes this page the right one to internalise before any individual system deep-dive.\r
\r
## Top Interview Questions\r
\r
### Q1. Walk me through what happens between a player tapping something and getting a response\r
\r
The request hits an Istio gateway, which routes it to a Front-Door service that authenticates the caller through Entra ID and applies routing or flighting rules. The FD forwards the call with an S2S token to a Core service, which runs the actual business logic in Clean Architecture layers, reads or writes Cosmos DB and Redis, optionally emits an event to Service Bus, and returns the reply back up the same chain.\r
\r
### Q2. Why split services into a Front Door and a Core instead of one monolithic service per feature\r
\r
Splitting means auth, routing, and flighting concerns live in exactly one place — the FD — instead of being duplicated in every Core service that needs to be reachable by a client. It also lets the Core stay focused purely on business logic and trust its caller via a much simpler S2S check, and it means a Core service can be called by multiple FDs without re-implementing client-facing concerns for each one.\r
\r
### Q3. What's the difference between how HPA and KEDA decide to add pods, and why does it matter\r
\r
HPA reacts to resource metrics like CPU or memory, which fits request-driven APIs whose load correlates with compute usage. KEDA reacts to external event signals, most commonly Service Bus queue depth, which fits background workers whose load has nothing to do with CPU until a message actually starts processing. Using HPA on a queue-driven worker would under-react to a growing backlog, and using KEDA on a synchronous API would leave it without a meaningful scaling signal.\r
\r
### Q4. What actually happens when a deployment goes bad — do you have to intervene manually\r
\r
No, by default. Flux checks the health of the new pods as part of reconciliation, and a failed health check triggers an automatic rollback to the last known-good state rather than requiring someone to notice and manually revert. That's part of why the platform can run ~220 services without every deploy needing a human watching a dashboard in real time.\r
\r
### Q5. How would you explain GitOps to someone who's only used a traditional CI/CD push-to-deploy pipeline\r
\r
In a push pipeline, the pipeline itself has credentials to change the cluster directly. In GitOps, the pipeline only ever changes a Git repository describing the desired state, and a separate agent — Flux, running inside the cluster — continuously pulls that repo and reconciles reality to match it. The practical benefit is that Git becomes both the deployment mechanism and the complete audit log, and reverting a bad change is just reverting a commit.\r
\r
### Q6. What stops one compromised service from calling any other service in the platform\r
\r
Istio's \`AuthorizationPolicy\` defaults to deny, so a service can only call another service if it's on an explicit allow-list of permitted callers — being on the same cluster or network isn't enough by itself. Combined with S2S tokens for identity and Managed Identity for reaching Azure resources, a compromised pod has no standing path to anything it wasn't explicitly granted.\r
\r
### Q7. Why use Managed Identity instead of storing a connection string or API key for Cosmos and Redis\r
\r
A stored secret has to be distributed, rotated, and protected from leaking, and every one of those steps is a place it can go wrong. Managed Identity replaces that entire lifecycle with an Azure-issued, automatically rotated identity tied to the workload itself, so there's no credential in code, config, or a pipeline variable that could leak in the first place.\r
\r
### Q8. How do base manifests and overlays avoid configuration drift across five regions\r
\r
The shared manifest in \`apps/base/<service>\` defines everything common to the service, and each region's overlay only patches the handful of settings that actually differ — replica counts, hostnames, or resource limits. Because the base is shared, a change that should apply everywhere is made once in the base rather than copy-pasted into five region-specific files that can quietly drift apart.\r
\r
### Q9. If Prometheus shows elevated error rate but nothing else looks obviously wrong, what's your next step\r
\r
I'd use traces via OpenTelemetry to find which specific downstream hop the failing requests share, then check Geneva logs for that hop to see the actual error detail. Metrics tell you something is wrong and roughly how much; traces tell you where; logs tell you what — using all three in that order is faster than guessing from the metric alone.\r
\r
### Q10. What's the actual difference between what an FD service does and what an API gateway does\r
\r
The Istio Gateway is infrastructure-level routing and TLS termination, shared across every service behind it, and it isn't aware of any single service's business rules. An FD service is a specific application that owns user authentication, feature flighting, and client-shaped request handling for the services behind it — it's closer to a backend-for-frontend than a generic reverse proxy, and it's where you'd add a new auth requirement or client-specific behaviour.\r
`;export{e as default};
