const e=`---\r
title: Design a Package Locker\r
description: How to model compartments, access tokens and expiry for a self-service package locker, with atomic slot claims and safe concurrent deposits\r
difficulty: Core\r
tags: [package-locker, facade-pattern, oop-design, concurrency]\r
---\r
\r
A package locker is a self-service pickup system: a carrier deposits a parcel into a free compartment, the system mints a one-time access code, and the customer later keys that code in to reclaim it. It looks trivial until you have to reason about expiry, staff overrides and two drivers racing for the last medium slot at the same instant.\r
\r
![alt text](notes/LLD/Problems/AmazonLocker/image.png)\r
\r
## Requirements\r
\r
### Functional\r
\r
- A carrier deposits a package by declaring a size (small, medium, large); the system finds a free compartment of that size, opens it, and returns a single-use access code, or a clear error if none is free.\r
- A customer retrieves a package by presenting the access code; the system validates it, opens the matching compartment, and invalidates the code so it cannot be reused.\r
- Access codes expire after a fixed window (7 days). An expired code must be rejected with a specific, distinct error — not treated the same as an unknown code.\r
- Staff can trigger a sweep that opens every compartment whose code has expired, so they can manually remove and return stale packages to the sender.\r
- Every rejection path — wrong code, already-used code, expired code, no compartment of the requested size — surfaces a distinct, actionable error message.\r
\r
### Non-functional and assumptions\r
\r
- Delivery logistics (how the package physically arrives) and notification delivery (SMS/email of the code to the customer) are out of scope — assume external systems call into this one.\r
- Single locker bank, single process, in-memory state for the interview; nothing in the design should prevent adding more banks later.\r
- Compartments are a scarce physical resource: two carriers depositing at the same instant must never be handed the same compartment.\r
- Repeated-attempt lockout, payment, pricing and a UI layer are explicitly out of scope for this pass.\r
\r
### Clarifying questions to ask\r
\r
> [!TIP]\r
> Ask "can a small package use a larger compartment once small slots are full?" before writing \`GetAvailableCompartment\`. The answer decides whether selection is a single exact-match lookup or a small ranked fallback, and asking it up front reads as senior instinct rather than an afterthought.\r
\r
- Is there a size fallback — can a small item occupy a medium or large slot when its own size is exhausted?\r
- Do compartments ever go out of service (broken door, maintenance), and how should that affect selection?\r
- Does the code expire on a fixed clock from deposit, or does it reset on failed pickup attempts?\r
- Is deposit a single atomic call, or does the driver need a "reserve, then confirm once the door closes" flow?\r
- How many locker banks or stations are in scope — one, or many sharing this same engine?\r
\r
## Core objects\r
\r
| Class | Responsibility | Key fields/methods |\r
|---|---|---|\r
| \`Locker\` | Facade orchestrating deposit, pickup and the staff sweep | \`Compartments\`, \`DepositPackage(size)\`, \`Pickup(code)\`, \`OpenExpiredCompartments()\` |\r
| \`Compartment\` | One physical slot; tracks its own size and occupancy | \`Size\`, \`IsOccupied()\`, \`MarkOccupied()\`, \`MarkFree()\`, \`Open()\` |\r
| \`AccessToken\` | Single-use proof tying a code to a compartment, with expiry | \`Code\`, \`Expiration\`, \`Compartment\`, \`IsExpired()\` |\r
| \`IAccessTokenGenerator\` | Produces the human-facing code | \`NextCode() -> string\` |\r
| \`Size\` | Compartment/package size enum | \`Small\`, \`Medium\`, \`Large\` |\r
\r
## Class design\r
\r
\`\`\`mermaid\r
classDiagram\r
    class Locker {\r
        -Compartment[] compartments\r
        -Dictionary~string, AccessToken~ accessTokens\r
        +DepositPackage(Size size) string\r
        +Pickup(string code) void\r
        +OpenExpiredCompartments() void\r
    }\r
    class Compartment {\r
        -Size size\r
        -bool occupied\r
        +IsOccupied() bool\r
        +MarkOccupied() void\r
        +MarkFree() void\r
        +Open() void\r
    }\r
    class AccessToken {\r
        -string code\r
        -DateTime expiration\r
        -Compartment compartment\r
        +IsExpired() bool\r
    }\r
    class IAccessTokenGenerator {\r
        <<interface>>\r
        +NextCode() string\r
    }\r
    class Size {\r
        <<enumeration>>\r
        Small\r
        Medium\r
        Large\r
    }\r
    Locker "1" --> "*" Compartment\r
    Locker "1" --> "*" AccessToken\r
    Locker --> IAccessTokenGenerator\r
    AccessToken --> Compartment\r
    Compartment --> Size\r
\`\`\`\r
\r
![alt text](notes/LLD/Problems/AmazonLocker/image-1.png)\r
![alt text](notes/LLD/Problems/AmazonLocker/image-2.png)\r
![alt text](notes/LLD/Problems/AmazonLocker/image-3.png)\r
![alt text](notes/LLD/Problems/AmazonLocker/image-4.png)\r
\r
## Key design decisions\r
\r
### 1. Tokens live in one registry, not scattered across compartments\r
\r
\`Locker\` keeps a single \`Dictionary<code, AccessToken>\` as the only place a code is ever looked up. The rejected alternative is storing the code as a field directly on \`Compartment\` and linear-scanning every compartment at pickup time to find a match — that is O(n) on every pickup and gives no clean way to say "this code was already used" without extra bookkeeping.\r
\r
> [!KEY]\r
> One lookup structure, one source of truth: pickup is \`accessTokens.TryGetValue(code)\`, full stop. Removing the entry on successful pickup is what makes a code single-use — you don't need a separate "used" flag to go stale.\r
\r
### 2. \`Locker\` as a Facade, not a bag of public setters\r
\r
Callers never touch \`Compartment.MarkOccupied()\` or mint an \`AccessToken\` themselves — \`Locker.DepositPackage\` and \`Locker.Pickup\` are the only entry points, and they own the sequencing (find compartment → open it → mark occupied → mint token → store it). The rejected alternative pushes that sequencing into the caller or into \`Compartment\` itself, which spreads business rules across classes and makes the staff-only "open all expired" sweep hard to implement consistently.\r
\r
### 3. Expiry is a lazy check, not a scheduled sweep\r
\r
\`AccessToken.IsExpired()\` compares "now" against a stored timestamp on read — there is no background timer proactively flipping tokens to an "EXPIRED" state. The rejected alternative, a job that walks every token every minute, does strictly more work for no benefit: \`OpenExpiredCompartments()\` already exists as an explicit staff-triggered sweep, so a second automatic mechanism would just be redundant polling.\r
\r
### 4. \`AccessToken\` is immutable; \`Compartment\` is the only mutable state\r
\r
Once minted, a token's code, expiry and compartment reference never change — only \`Compartment.occupied\` mutates. The rejected alternative (allowing a token's expiry to be extended, or its compartment reassigned) makes revocation and auditing much harder to reason about: you'd need to ask "which version of this token is live" instead of just "does it still exist in the map".\r
\r
## Implementation\r
\r
\`\`\`csharp\r
public interface IAccessTokenGenerator\r
{\r
    string NextCode();\r
}\r
\r
public class RandomCodeGenerator : IAccessTokenGenerator\r
{\r
    private readonly Random _random = new();\r
    public string NextCode() => _random.Next(0, 1_000_000).ToString("D6");\r
}\r
\r
public enum Size { Small, Medium, Large }\r
\`\`\`\r
\r
\`\`\`csharp\r
public class Compartment\r
{\r
    public Size Size { get; }\r
    private bool _occupied;\r
\r
    public Compartment(Size size) => Size = size;\r
\r
    public bool IsOccupied() => _occupied;\r
    public void MarkOccupied() => _occupied = true;\r
    public void MarkFree() => _occupied = false;\r
    public void Open() { /* hardware unlock */ }\r
}\r
\r
public class AccessToken\r
{\r
    public string Code { get; }\r
    public DateTime Expiration { get; }\r
    public Compartment Compartment { get; }\r
\r
    public AccessToken(string code, DateTime expiration, Compartment compartment)\r
    {\r
        Code = code;\r
        Expiration = expiration;\r
        Compartment = compartment;\r
    }\r
\r
    public bool IsExpired() => DateTime.UtcNow >= Expiration;\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
public class Locker\r
{\r
    private readonly ConcurrentDictionary<string, AccessToken> _tokens = new();\r
    private readonly List<Compartment> _compartments;\r
    private readonly IAccessTokenGenerator _codeGen;\r
\r
    public Locker(List<Compartment> compartments, IAccessTokenGenerator codeGen)\r
    {\r
        _compartments = compartments;\r
        _codeGen = codeGen;\r
    }\r
\r
    public string DepositPackage(Size size)\r
    {\r
        var compartment = _compartments.FirstOrDefault(c => c.Size == size && !c.IsOccupied())\r
            ?? throw new InvalidOperationException($"No available compartment of size {size}");\r
\r
        // Atomic claim: TryAdd fails if the compartment lost the race for this size.\r
        compartment.MarkOccupied();\r
        compartment.Open();\r
\r
        var token = new AccessToken(_codeGen.NextCode(), DateTime.UtcNow.AddDays(7), compartment);\r
        if (!_tokens.TryAdd(token.Code, token))\r
            throw new InvalidOperationException("Code collision, retry deposit");\r
\r
        return token.Code;\r
    }\r
\r
    public void Pickup(string code)\r
    {\r
        if (!_tokens.TryRemove(code, out var token))\r
            throw new InvalidOperationException("Invalid access code");\r
\r
        if (token.IsExpired())\r
            throw new InvalidOperationException("Access code has expired");\r
\r
        token.Compartment.Open();\r
        token.Compartment.MarkFree();\r
    }\r
\r
    public void OpenExpiredCompartments()\r
    {\r
        foreach (var token in _tokens.Values.Where(t => t.IsExpired()))\r
            token.Compartment.Open();\r
    }\r
}\r
\`\`\`\r
\r
## Concurrency and thread safety\r
\r
Two failure modes matter here: two carriers depositing into the same compartment, and a staff sweep running while a customer is mid-pickup.\r
\r
- **Compartment claim.** The naive read-then-write (\`find a free compartment\`, then \`MarkOccupied()\`) has a window where two threads can both pick the same compartment. In production, guard the claim with a per-compartment atomic flag (\`Interlocked.CompareExchange\` on a status int) or wrap the find-and-claim pair in a short lock scoped to that one compartment, then retry against the next candidate on failure — the same shape as the parking-lot spot claim.\r
- **Token map.** \`ConcurrentDictionary<string, AccessToken>\` makes \`TryAdd\`/\`TryRemove\` atomic, so a pickup racing a staff sweep either sees the token or doesn't — never a half-removed state.\r
\r
> [!WARNING]\r
> If pickup checks expiry *before* removing the token from the map, a customer can race the staff sweep: both read "not yet expired," both proceed, and the compartment gets opened twice for the same package. Remove the token first (an atomic claim on the code), then check expiry on the removed copy — exactly what \`TryRemove\` followed by \`IsExpired()\` does above.\r
\r
## Extending the design\r
\r
| New requirement | Where it plugs in | Why the design allows it |\r
|---|---|---|\r
| Size fallback (small item into a larger free slot) | New selection routine tried after the exact-size lookup fails | \`DepositPackage\` already isolates "find a compartment" from "claim and mint a token" |\r
| Out-of-service compartments | \`Compartment\` status enum (\`Available\`, \`Occupied\`, \`OutOfService\`) instead of a boolean | Selection already filters on a single occupancy check; adding a state is a one-line change to that filter |\r
| Two-phase deposit (reserve door, confirm once closed) | \`ReserveCompartment()\` / \`ConfirmDeposit(reservationId)\` replacing the single atomic call | \`Locker\` already owns the full sequencing, so splitting one call into two is additive, not a rewrite |\r
| Multiple locker stations | A \`LockerStation\` aggregate holding many \`Locker\` instances, routed by location | \`Locker\` has no knowledge of "where" it is — it is already a self-contained unit |\r
| SMS/email delivery of the code | An observer notified from \`DepositPackage\` after the token is minted | Token generation is already a single, well-defined point to hook into |\r
\r
## Cheat sheet\r
\r
- One dictionary keyed by access code is the only place validity is decided — never duplicate that state on \`Compartment\`.\r
- Removing a token on pickup makes it single-use for free; you don't need a separate "used" boolean.\r
- Expiry is a computed comparison, not a background job — cheaper and just as correct here.\r
- \`Locker\` is the only class with public mutating methods; \`Compartment\` and \`AccessToken\` are manipulated only through it.\r
- Compartment claims need the same atomic-claim discipline as a parking spot — read-then-write races are the classic bug here.\r
- Model size as an enum with an explicit ordering if you need fallback (\`Small < Medium < Large\`), not string comparison.\r
- Staff-only operations (\`OpenExpiredCompartments\`) are a separate method, not a side effect of a customer-facing call.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Storing the code on \`Compartment\` and scanning for a match at pickup | Keep one \`code -> AccessToken\` map on \`Locker\` |\r
| Checking expiry before removing the token from the map | Remove (claim) first, then inspect the removed copy |\r
| A background job that proactively expires tokens | Compute expiry lazily; keep the staff sweep as the only proactive path |\r
| Treating "invalid code" and "expired code" as the same error | Two distinct errors — customers and support need to tell them apart |\r
| Reusing \`Random\` per call instead of one instance | Seed once, reuse the instance, or use crypto-random if codes must be unguessable |\r
| No plan for compartment claim races | Wrap claim-and-mark in an atomic operation, retry on failure |\r
\r
## Summary\r
\r
A package locker earns its interview slot by hiding two subtle races behind an apparently simple flow: claiming a scarce physical compartment, and invalidating a one-time code exactly once. Keep the access-token map as the single source of truth, make \`Locker\` the only class that mutates anything, and treat expiry as a cheap lazy check rather than a background job. Once that skeleton is solid, size fallback, out-of-service compartments and a two-phase deposit flow are all additive extensions rather than redesigns.\r
\r
## Top Interview Questions\r
\r
### Q1. Why keep access tokens in one dictionary instead of storing the code directly on each compartment?\r
\r
A single \`code -> AccessToken\` map makes both lookups constant time and gives you one obvious place to enforce single-use: removing the entry on pickup means the code is gone, period. Storing the code on \`Compartment\` instead forces a linear scan over every compartment to find a match at pickup, and needs an extra "used" flag to distinguish a fresh compartment from one whose code was already redeemed — two pieces of state that can drift apart. One registry, one truth, is the same lesson as deriving a parking spot's occupancy from the active-ticket map rather than a separate boolean.\r
\r
### Q2. How do you prevent two carriers from being assigned the same compartment at the same time?\r
\r
Read-then-write races are the risk: both threads see the same "free" compartment before either claims it. Guard the claim atomically — a \`CompareExchange\` on a per-compartment status flag, or a short lock scoped to just that compartment — and retry against the next candidate if the claim fails. The important property is that the atomic unit is the single compartment being contended, not the whole locker bank, so unrelated deposits never block each other.\r
\r
### Q3. Why is expiry computed lazily instead of updated by a background job?\r
\r
Because nothing consumes an "EXPIRED" state proactively — the only thing that acts on expired tokens is the staff sweep, \`OpenExpiredCompartments()\`, which is already explicitly triggered. A background job that walks every token every minute to flip a status field would do real work (CPU, lock contention) purely to maintain a flag nobody reads until the sweep runs anyway. Comparing \`DateTime.UtcNow\` against a stored expiry at the moment it's asked is correct, cheap, and needs no extra infrastructure.\r
\r
### Q4. Walk through what happens on a pickup with an expired code.\r
\r
\`Pickup\` first attempts to remove the code from the token map — if it's not present at all, that's "invalid code," a distinct error from expiry. If the removal succeeds, it checks \`IsExpired()\` on the token it just pulled out; if true, it throws "access code has expired" and, importantly, the compartment stays occupied (the token was removed, but nothing reopened the door). The physical package still needs the staff sweep to be recovered — a customer with an expired code cannot self-serve their way back in, which is the intended business rule.\r
\r
### Q5. How would you support a small package using a medium or large compartment when small slots are full?\r
\r
Extend compartment selection into a small ranked fallback: try the exact size first, and if none is free, retry against the next size up, in order. This is naturally a Strategy-shaped extension — the "find a compartment" step is already isolated from "claim it and mint a token" inside \`DepositPackage\`, so swapping in a fallback-aware selector changes nothing about token minting, expiry, or pickup. The one design question worth asking the interviewer: does a fallback assignment still count against that larger size's capacity for someone who actually needs it later?\r
\r
### Q6. How would you model a compartment that's broken or under maintenance?\r
\r
Replace the boolean \`occupied\` flag with a small status enum — \`Available\`, \`Occupied\`, \`OutOfService\` — and update the one place that filters candidate compartments to check for \`Available\` specifically instead of \`!occupied\`. Nothing else in \`Locker\`, \`AccessToken\`, or the pickup flow needs to change, because none of them inspect compartment state directly; they only ever go through the same selection method. This is a good example of a requirement that looks like it touches "everything" but actually touches one filter condition, because state was never duplicated.\r
\r
### Q7. Why remove the token from the map on pickup instead of marking it "used" and leaving it there?\r
\r
Because leaving used tokens around means the map grows forever and every future lookup — including the staff sweep — has to filter out entries that no longer matter. Removing on pickup keeps the map's size proportional to actually-active tokens, and makes "does this code exist" and "is this code still valid" the same question, rather than two separate checks (existence, then a used-flag). It also sidesteps any risk of a stale reference to a compartment being reused by a later deposit.\r
\r
### Q8. How would you turn the single \`DepositPackage\` call into a two-phase reserve-then-confirm flow, and why would you need to?\r
\r
Split it into \`ReserveCompartment(size)\` — which opens the door and marks the compartment \`Reserved\` (not yet \`Occupied\`) — and \`ConfirmDeposit(reservationId)\`, called once the driver has actually closed the door and the system can verify a weight or a door-closed sensor fired. This matters if you want the token to only be minted after the package is genuinely inside, not just after the compartment door was opened; otherwise a driver who opens a compartment and walks away for a different reason leaves a phantom "occupied" slot with no package in it.\r
\r
### Q9. What would you change to run this design across multiple locker stations at different physical locations?\r
\r
Introduce a \`LockerStation\` that owns a \`Locker\` instance (or a \`Locker\` per bank) and routes a deposit or pickup request to the right one by location — \`Locker\` itself needs no change, since it was already self-contained and had no notion of "where" it physically sits. The interesting design question becomes whether access codes need to be globally unique across stations (if a customer might describe just the code without saying which station) or only unique within a station — that decides whether code generation coordinates across instances or stays purely local.\r
\r
### Q10. How would you notify the customer of their access code without coupling that into the deposit flow?\r
\r
Treat notification as an observer of the "token minted" event: \`Locker.DepositPackage\` publishes a lightweight event (code, expiry, maybe a customer contact reference passed in by the caller) after the token is stored, and an \`INotifier\` implementation (SMS, email, push) subscribes independently. This keeps delivery mechanics — which is explicitly out of scope for the core design — from ever touching \`Locker\`'s internals, and lets you add a second notification channel later without redeploying the locker logic itself.\r
`;export{e as default};
