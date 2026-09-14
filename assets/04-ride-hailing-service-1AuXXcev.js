const e=`---\r
title: Design a Ride Hailing Service\r
description: Design an Uber style ride hailing system with driver matching, a ride lifecycle state machine and ride type based fare pricing\r
difficulty: Advanced\r
tags: [ride-hailing, state-machine, strategy-pattern, geo-matching]\r
---\r
\r
A ride-hailing system chains three orderly problems: match a rider to a nearby available driver, walk that ride through a strict lifecycle, and price it. The same "find the nearest available resource, hand it a payload, track it to completion" machinery underneath generalizes well past rides — the local-delivery variant at the end of this page reuses it almost unchanged.\r
\r
## Requirements\r
\r
### Functional\r
\r
- A rider requests a ride with \`(riderId, pickup, drop, rideType)\`; the system matches the nearest **available** driver of that ride type within a max radius.\r
- If no driver is found within radius, the request fails with a clear, specific reason.\r
- Ride lifecycle: \`REQUESTED -> ASSIGNED -> ARRIVED -> IN_PROGRESS -> COMPLETED\`; any pre-start state can move to \`CANCELLED\`.\r
- Invalid transitions are rejected outright — you cannot complete a ride that never started, or re-assign a completed one.\r
- Fare = \`base + perKm * distance + perMinute * duration\`, floored at a minimum fare, then multiplied by a surge factor; each ride type has its own pricing configuration.\r
- A driver becomes available again the instant a ride completes or is cancelled.\r
\r
### Non-functional and assumptions\r
\r
- Single process, in-memory design for the interview; straight-line distance is an acceptable stand-in for real routing/ETA.\r
- Payment gateway integration, driver ratings, and a real pooling algorithm are explicitly out of scope — fare calculation only.\r
- Assume single-threaded matching as a starting point, then be ready to defend it under concurrent load.\r
- Persistence and distributed matching across regions are named as future work, not built here.\r
\r
### Clarifying questions to ask\r
\r
> [!TIP]\r
> Ask "how do we find nearby drivers — a real geo index or simple distance?" early. Answering "simple straight-line distance for now" is the correct scope-setting move for an interview — it lets you build a clean \`IDriverMatcher\` abstraction first and discuss the geo-index swap as a named follow-up, rather than over-engineering from the start.\r
\r
- Is this single-city and in-memory, or does it need to reason about distributed matching across regions?\r
- How many ride types exist, and does each need a genuinely different pricing formula, or just different constants?\r
- Who can cancel, and up to which state — only before the ride starts, or any time before completion?\r
- Does an external service push driver location updates, or does this system simulate movement itself?\r
- Do we need to handle two riders matching to the same driver concurrently, or is that explicitly out of scope for a first pass?\r
\r
## Core objects\r
\r
| Class | Responsibility | Key fields/methods |\r
|---|---|---|\r
| \`RideService\` | Orchestrator — the only API surface callers touch | \`RequestRide\`, \`DriverArrived\`, \`StartRide\`, \`CompleteRide\`, \`CancelRide\` |\r
| \`Ride\` | Aggregate root; owns lifecycle state and its validity | \`Status\`, \`Driver\`, \`Fare\`, \`TransitionTo(status)\` |\r
| \`Driver\` | An actor with location and availability | \`Location\`, \`Type\`, \`Status\` (Available/OnTrip/Offline) |\r
| \`Location\` | Value object; distance between two points | \`Lat\`, \`Lng\`, \`DistanceTo(other)\` |\r
| \`IDriverMatcher\` | Strategy — how a driver is selected | \`FindDriver(pickup, type, drivers) -> Driver\` |\r
| \`IPricingStrategy\` | Strategy — how a ride type is priced | \`Calculate(distanceKm, durationMin, surge) -> FareBreakdown\` |\r
| \`FareBreakdown\` | Result object of a pricing calculation | \`BaseFare\`, \`DistanceFare\`, \`TimeFare\`, \`Total\` |\r
\r
## Class design\r
\r
\`\`\`mermaid\r
classDiagram\r
    class RideService {\r
        -Dictionary~string, Ride~ rides\r
        -Dictionary~string, Driver~ drivers\r
        -IDriverMatcher matcher\r
        -Dictionary~RideType, IPricingStrategy~ pricing\r
        +RequestRide(riderId, pickup, drop, type) Ride\r
        +CompleteRide(rideId, distanceKm, durationMin) FareBreakdown\r
        +CancelRide(rideId) void\r
    }\r
    class Ride {\r
        -string Id\r
        -Driver Driver\r
        -RideStatus Status\r
        -FareBreakdown Fare\r
        +Assign(Driver d) void\r
        +TransitionTo(RideStatus next) void\r
    }\r
    class RideStatus {\r
        <<enumeration>>\r
        Requested\r
        Assigned\r
        Arrived\r
        InProgress\r
        Completed\r
        Cancelled\r
    }\r
    class Driver {\r
        -Location Location\r
        -RideType Type\r
        -DriverStatus Status\r
        +UpdateLocation(Location l) void\r
    }\r
    class Location {\r
        -double Lat\r
        -double Lng\r
        +DistanceTo(Location other) double\r
    }\r
    class IDriverMatcher {\r
        <<interface>>\r
        +FindDriver(Location p, RideType t, drivers) Driver\r
    }\r
    class NearestDriverMatcher {\r
        -double maxRadiusKm\r
    }\r
    class IPricingStrategy {\r
        <<interface>>\r
        +Calculate(double km, double min, double surge) FareBreakdown\r
    }\r
    class StandardPricingStrategy {\r
        -double baseFare\r
        -double perKm\r
        -double perMinute\r
        -double minimumFare\r
    }\r
    class FareBreakdown {\r
        -double BaseFare\r
        -double DistanceFare\r
        -double TimeFare\r
        -double Total\r
    }\r
    IDriverMatcher <|.. NearestDriverMatcher\r
    IPricingStrategy <|.. StandardPricingStrategy\r
    RideService "1" --> "*" Ride\r
    RideService --> IDriverMatcher\r
    RideService --> IPricingStrategy\r
    Ride --> Driver\r
    Ride --> RideStatus\r
    Ride --> FareBreakdown\r
    Driver --> Location\r
\`\`\`\r
\r
**State transition table**\r
\r
| From | Allowed to |\r
|---|---|\r
| \`REQUESTED\` | \`ASSIGNED\`, \`CANCELLED\` |\r
| \`ASSIGNED\` | \`ARRIVED\`, \`CANCELLED\` |\r
| \`ARRIVED\` | \`IN_PROGRESS\`, \`CANCELLED\` |\r
| \`IN_PROGRESS\` | \`COMPLETED\` |\r
| \`COMPLETED\` | — |\r
| \`CANCELLED\` | — |\r
\r
## Key design decisions\r
\r
### 1. The ride lifecycle is an explicit state machine, not scattered flags\r
\r
\`Ride.TransitionTo(next)\` checks a single \`Allowed[status]\` lookup table before mutating \`Status\` — there is exactly one place a transition can be accepted or rejected.\r
\r
> [!KEY]\r
> Rejected alternative: independent booleans (\`isAssigned\`, \`hasArrived\`, \`isStarted\`, \`isCompleted\`) checked ad hoc wherever a status question comes up. Booleans like these can represent impossible combinations (\`isCompleted && !isStarted\`) that a transition table structurally forbids.\r
\r
### 2. Fare formula behind a Strategy, keyed by ride type\r
\r
\`IPricingStrategy.Calculate(distanceKm, durationMin, surge)\` isolates money math entirely from ride orchestration; \`RideService\` just looks up the strategy for \`ride.Type\` in a dictionary. Pattern: **Strategy**. Rejected alternative: an \`if/else\` or \`switch\` on ride type inline inside \`CompleteRide\` — every new ride type or pricing tweak means editing the orchestrator, and a bug in one ride type's formula risks a merge conflict with another's.\r
\r
### 3. Driver selection behind a Strategy, not a hardcoded scan\r
\r
\`IDriverMatcher.FindDriver\` is the only thing \`RideService.RequestRide\` calls to pick a driver — today a linear nearest-in-radius scan, tomorrow a geo-indexed lookup. Rejected alternative: the scan logic written directly inside \`RequestRide\`; swapping in a geo index later would mean touching the orchestrator instead of adding one new class.\r
\r
| Concern | Pattern | Why |\r
|---|---|---|\r
| Fare per ride type | Strategy | New ride type = new class, zero edits elsewhere |\r
| Driver selection | Strategy | Nearest scan today, geo-indexed lookup tomorrow, same interface |\r
| Ride lifecycle | State machine | Transitions are rule-heavy; a table beats a \`switch\` |\r
| Status notifications | Observer | Rider/driver notified without \`RideService\` naming its consumers |\r
\r
### 4. Status changes are announced, not hand-delivered\r
\r
\`Ride\` (or \`RideService\`) raises a status-changed event on every transition; push notifications, SMS, and analytics each subscribe independently. Rejected alternative: \`RideService\` calling a \`NotificationService\` by name inside every lifecycle method — that couples the orchestrator to every current and future notification channel.\r
\r
## Implementation\r
\r
\`\`\`csharp\r
public interface IDriverMatcher\r
{\r
    Driver FindDriver(Location pickup, RideType type, IEnumerable<Driver> drivers);\r
}\r
\r
public interface IPricingStrategy\r
{\r
    FareBreakdown Calculate(double distanceKm, double durationMin, double surge);\r
}\r
\r
public enum RideStatus { Requested, Assigned, Arrived, InProgress, Completed, Cancelled }\r
\`\`\`\r
\r
\`\`\`csharp\r
public class Ride\r
{\r
    private static readonly Dictionary<RideStatus, RideStatus[]> Allowed = new()\r
    {\r
        [RideStatus.Requested]  = new[] { RideStatus.Assigned, RideStatus.Cancelled },\r
        [RideStatus.Assigned]   = new[] { RideStatus.Arrived, RideStatus.Cancelled },\r
        [RideStatus.Arrived]    = new[] { RideStatus.InProgress, RideStatus.Cancelled },\r
        [RideStatus.InProgress] = new[] { RideStatus.Completed },\r
        [RideStatus.Completed]  = Array.Empty<RideStatus>(),\r
        [RideStatus.Cancelled]  = Array.Empty<RideStatus>()\r
    };\r
\r
    public Driver Driver { get; private set; }\r
    public RideStatus Status { get; private set; } = RideStatus.Requested;\r
    public FareBreakdown Fare { get; private set; }\r
\r
    public void Assign(Driver driver) { TransitionTo(RideStatus.Assigned); Driver = driver; }\r
    public void SetFare(FareBreakdown fare) => Fare = fare;\r
\r
    public void TransitionTo(RideStatus next)\r
    {\r
        if (Array.IndexOf(Allowed[Status], next) < 0)\r
            throw new InvalidOperationException($"Cannot move ride from {Status} to {next}");\r
        Status = next;\r
    }\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
public class RideService\r
{\r
    private readonly Dictionary<string, Ride> _rides = new();\r
    private readonly IDriverMatcher _matcher;\r
    private readonly Dictionary<RideType, IPricingStrategy> _pricing;\r
\r
    public Ride RequestRide(string riderId, Location pickup, Location drop, RideType type, IEnumerable<Driver> drivers)\r
    {\r
        var driver = _matcher.FindDriver(pickup, type, drivers)\r
            ?? throw new InvalidOperationException("No driver available nearby");\r
\r
        var ride = new Ride();\r
        ride.Assign(driver);\r
        driver.Status = DriverStatus.OnTrip;\r
        _rides[riderId] = ride;\r
        return ride;\r
    }\r
\r
    public FareBreakdown CompleteRide(string rideId, double distanceKm, double durationMin, double surge)\r
    {\r
        var ride = _rides[rideId];\r
        ride.TransitionTo(RideStatus.Completed);\r
        var fare = _pricing[RideType.UberGo].Calculate(distanceKm, durationMin, surge);\r
        ride.SetFare(fare);\r
        ride.Driver.Status = DriverStatus.Available;\r
        return fare;\r
    }\r
}\r
\`\`\`\r
\r
## Concurrency and thread safety\r
\r
The interview's real question is: two riders request at nearly the same moment, both matching to the same nearest driver — how do you avoid double-assigning them?\r
\r
1. **Coarse lock around match-and-flip.** Wrap "find driver" and "set driver to \`OnTrip\`" in a single lock inside \`RideService\`. Simple, correct, but every request in the system serializes on one lock.\r
2. **Per-driver atomic claim.** Scan for candidates without a lock, then claim the winner with \`Interlocked.CompareExchange\` on that driver's status field (or a \`ConcurrentDictionary\`-backed reservation). If the claim fails, another request won — retry against the next-nearest candidate.\r
3. **Geo-cell partitioning.** Partition drivers by geohash cell and lock only the cell being searched, so requests in different parts of the city never contend at all.\r
\r
> [!WARNING]\r
> Find-and-reserve must be a single atomic step. If you read "driver is available," return control to the caller, and only *then* flip the status, two concurrent requests can both observe "available" and both proceed — the classic check-then-act race. The claim itself, not just the search, has to be atomic.\r
\r
A linear scan across all drivers also stops scaling well past a few thousand drivers; the fix is entirely inside \`IDriverMatcher\` — swap the scan for a geohash/QuadTree/S2-cell index that only examines drivers in nearby cells. \`RideService\` and everything else is untouched, because it only ever calls the interface.\r
\r
## Extending the design\r
\r
| New requirement | Where it plugs in | Why the design allows it |\r
|---|---|---|\r
| A new ride type (e.g. UberBlack) | Register another \`IPricingStrategy\` implementation, keyed by the new enum value | \`RideService\` never branches on ride type itself |\r
| Real surge pricing | Promote a \`Func<Location, double>\` to an \`ISurgeProvider\` interface, snapshotted onto the ride at request time | Pricing already takes a surge multiplier as an input, not a hardcoded constant |\r
| Driver never arrives | A per-state timeout keyed by ride id; on expiry, auto-cancel with a specific reason and re-run matching excluding that driver | Cancellation and re-matching are already first-class, independently callable operations |\r
| Millions of drivers | Replace the linear scan inside \`NearestDriverMatcher\` with a geohash/QuadTree index | Matching is already isolated behind \`IDriverMatcher\` |\r
| Notify rider/driver on every status change | \`Ride\` raises a status-changed event; push/SMS/analytics subscribe independently | Status transitions already funnel through one method (\`TransitionTo\`) |\r
| Dispatch a payload other than a person (see below) | Reuse \`IDriverMatcher\`/lifecycle shape with a different aggregate and payload | The matching-and-lifecycle skeleton doesn't know it's moving a rider specifically |\r
\r
### Same dispatch machinery, different payload: a local delivery service\r
\r
A Gopuff-style local delivery service — rapid delivery of convenience-store goods from 500+ micro distribution centers (DCs) — solves the identical shape of problem with a different payload: instead of matching a rider to a driver, you match an **order** to the nearest **distribution center that has the item in stock**, then dispatch a courier to deliver it.\r
\r
![alt text](notes/LLD/Problems/LocalDeliveryService/image.png)\r
\r
The API surface mirrors \`RideService\` one-for-one: query availability, then place an order.\r
\r
![alt text](notes/LLD/Problems/LocalDeliveryService/image-1.png)\r
\r
**Querying availability** replaces \`IDriverMatcher.FindDriver\` with a matcher over DCs and their \`Inventory\`, rather than drivers and their location:\r
\r
![alt text](notes/LLD/Problems/LocalDeliveryService/image-2.png)\r
\r
**Placing an order** needs the same "claim atomically" discipline this page already covers for driver matching — reserving inventory across two data stores with a distributed lock is the tempting-but-risky answer (it can deadlock or drift inconsistent); a single DB transaction covering the inventory decrement and the order insert is the safer one:\r
\r
![alt text](notes/LLD/Problems/LocalDeliveryService/image-3.png)\r
\r
**Making the match traffic-aware** is the delivery-specific deep dive: naive straight-line distance (as used for ride matching) ignores real drive time, and estimating travel time across *every* DC doesn't scale — the workable middle ground is travel-time estimation scoped to only the nearby candidate DCs, the same "don't scan everything, scan the relevant subset" principle behind swapping a linear driver scan for a geo index:\r
\r
![alt text](notes/LLD/Problems/LocalDeliveryService/image-4.png)\r
\r
**Scaling the lookup** follows the same playbook as scaling driver matching: push inventory counts into Redis for fast reads instead of hitting the primary DB per query, and partition/replicate the underlying database once a single instance can't keep up with write volume:\r
\r
![alt text](notes/LLD/Problems/LocalDeliveryService/image-5.png)\r
![alt text](notes/LLD/Problems/LocalDeliveryService/image-6.png)\r
\r
> [!NOTE]\r
> The reusable insight: \`IDriverMatcher\` and \`Ride\`'s lifecycle state machine don't actually know anything about people. Anywhere you need "find the nearest available resource that satisfies a constraint, reserve it atomically, and track a request through a fixed lifecycle to completion," this same skeleton applies — only the resource type (driver vs. DC), the constraint (ride type vs. item availability), and the payload (a person vs. an order) change.\r
\r
## Cheat sheet\r
\r
- Model the ride lifecycle as a state machine with an explicit allowed-transitions table — never independent booleans.\r
- Fare formula and driver selection are the two axes of change; both become Strategy interfaces.\r
- Find-and-reserve for a driver must be one atomic step, not a check followed by a separate write.\r
- A linear driver scan is fine to start with — say so, and name the geo-index swap as the scaling answer.\r
- Snapshot the surge multiplier onto the ride at request time so the rider is charged what they were quoted.\r
- Status notifications are Observer, not direct calls from the orchestrator into notification code.\r
- The same matcher-plus-lifecycle skeleton generalizes to non-ride dispatch problems (delivery, freight, field service).\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Independent booleans for ride state instead of an enum + transition table | Single \`RideStatus\` enum, single \`Allowed\` lookup |\r
| Pricing formula branching inline on ride type inside the orchestrator | Extract \`IPricingStrategy\`, key by ride type |\r
| Driver search-and-claim as two separate steps | Make the claim atomic (CAS or a locked scope around both) |\r
| Treating "no driver found" as an exception thrown deep in matching logic | Surface a clear, specific failure from \`RequestRide\` itself |\r
| Charging the surge multiplier at completion time, not request time | Snapshot surge onto the ride when it's requested |\r
| Assuming a linear driver scan is "the design" rather than "the starting point" | Name the geo-index swap explicitly as the scaling story |\r
\r
## Summary\r
\r
Ride hailing rewards treating driver selection and fare calculation as two independent Strategy interfaces, and the ride's lifecycle as an explicit state machine rather than a pile of booleans — those three decisions are what keep \`RideService\` thin and let new ride types, real surge pricing, and a geo-indexed matcher all become additive changes. The concurrency question — atomically claiming a driver so two riders never win the same match — is the one interviewers push hardest on, and the honest answer is a claim, not a lock around everything. The payoff of keeping matching and lifecycle generic is that the exact same skeleton dispatches a delivery order to a distribution center instead of a rider to a driver, with only the payload changing.\r
\r
## Top Interview Questions\r
\r
### Q1. Why model the ride lifecycle as an explicit state machine instead of a set of boolean flags?\r
\r
Boolean flags like \`isAssigned\`, \`hasArrived\`, and \`isCompleted\` can independently be set into combinations that make no physical sense — \`isCompleted == true\` while \`isStarted == false\`, for instance — and nothing stops a caller from creating that state by setting the wrong flag at the wrong time. A single \`RideStatus\` enum plus an explicit \`Allowed[status]\` transition table makes illegal transitions a one-line check (\`Array.IndexOf(Allowed[Status], next) < 0\`) instead of a set of conditions that have to be kept consistent by convention across every call site that touches ride state.\r
\r
### Q2. How do you prevent two riders from being matched to the same driver at the same time?\r
\r
The search for a candidate driver can run without a lock — it's a read. The moment you select a winner, claiming that driver (flipping their status to \`OnTrip\`) has to be a single atomic operation: a compare-and-swap on the driver's status field, or a \`ConcurrentDictionary\`-based reservation keyed by driver id. If the claim fails because another request already won, retry against the next-nearest candidate rather than failing the whole request outright. The bug to avoid is treating "check available" and "mark unavailable" as two separate steps with a window in between.\r
\r
### Q3. Why should fare calculation and driver matching each be a Strategy interface instead of methods on \`RideService\`?\r
\r
Because they vary independently, for different business reasons — pricing changes when finance adjusts rates or launches a new ride tier, matching changes when the platform adopts a better geo-index or ranking model. If both lived as branching logic inside \`RideService\`, every pricing tweak would risk touching matching code and vice versa, and every new ride type would mean editing and redeploying the orchestrator. With two interfaces, \`RideService\` only depends on the abstractions, and each strategy can be unit tested — and swapped — completely independently.\r
\r
### Q4. How would you extend this design to support surge pricing correctly?\r
\r
Introduce an \`ISurgeProvider\` with something like \`GetMultiplier(location, time)\`, backed by a formula like active-requests-over-available-drivers per geo-cell, capped to avoid runaway multipliers. The subtle requirement is *when* you read it: snapshot the multiplier onto the ride at request time and store it there, rather than reading a live multiplier again at completion — otherwise a rider could be quoted one surge level and charged a different one if demand shifted mid-ride, which is both a bad experience and, in some jurisdictions, a compliance problem.\r
\r
### Q5. What happens if a driver never arrives after being assigned?\r
\r
This needs an explicit timeout mechanism, not silence: schedule a per-ride timer keyed by ride id when a ride enters \`ASSIGNED\`. If \`ARRIVED\` hasn't been reached by the deadline, auto-cancel the ride with a specific reason (\`DRIVER_TIMEOUT\`), release the driver back to \`Available\`, and re-run matching for the rider excluding that driver from candidates. Both cancellation and re-matching already exist as independent operations in this design, so the timeout handler is just composing existing pieces rather than inventing new state-transition logic.\r
\r
### Q6. Why is "no driver found" surfaced as a specific failure from \`RequestRide\`, rather than a generic exception?\r
\r
Because the caller (a mobile app, ultimately a human waiting for a ride) needs to distinguish "there is genuinely no supply near you right now" from a system error, and each deserves different UX — one suggests waiting or widening the radius, the other suggests retrying or an apology. Baking this into the matcher's contract (\`FindDriver\` returns \`null\` on no match, and \`RequestRide\` translates that into a specific, named exception/result) keeps the failure mode explicit and testable, rather than being an incidental side effect of however the search happened to fail.\r
\r
### Q7. How would a linear driver scan break down at scale, and what replaces it?\r
\r
A linear scan over every driver, checking distance and availability for each, is O(n) per match request; at a few thousand drivers per city this is fine, but at tens of thousands with requests arriving every second, it becomes the dominant cost. The fix is a spatial index — geohash buckets, a QuadTree, or S2 cells — so a match only examines drivers in the geographic cells actually near the pickup point, turning an O(n) scan into something closer to O(candidates in nearby cells). Critically, this change is entirely internal to \`NearestDriverMatcher\` (or its replacement); \`RideService\` and every other class are untouched because they only ever call \`IDriverMatcher.FindDriver\`.\r
\r
### Q8. How would you notify the rider and driver of every ride status change without coupling \`RideService\` to a specific notification channel?\r
\r
Have \`Ride\` (or the transition method itself) raise a status-changed event — \`RideStatusChanged(rideId, from, to)\` — through a publisher that any number of \`IRideStatusObserver\` implementations can subscribe to: push notifications, SMS, analytics, a live map update. \`RideService\` and \`Ride\` never need to know these consumers exist. This is the same Observer principle used across many of these designs precisely because "who needs to react to this event" is a business decision that changes far more often than "how does the event get raised."\r
\r
### Q9. How does this design generalize to a local delivery service that dispatches orders instead of rides?\r
\r
The shape of the problem is identical: find the nearest available resource that satisfies a constraint (a driver with the right ride type vs. a distribution center with the item in stock), reserve it atomically, and track a request through a fixed lifecycle to completion. \`IDriverMatcher\` becomes a matcher over distribution centers and their inventory; \`Ride\`'s state machine becomes an order's placed-to-delivered lifecycle. The genuinely new problem in the delivery variant is making the match traffic-aware — estimating real drive time to nearby candidates rather than assuming straight-line distance — which is a refinement of the matcher, not a redesign of the dispatch skeleton.\r
\r
### Q10. Why is reserving inventory across two data stores with a distributed lock the wrong answer, and what's better?\r
\r
Coordinating a write across two independent data stores with a distributed lock is exposed to partial failure: if the process crashes or the lock expires between the two writes, you can end up with inventory decremented but no order recorded (or the reverse), and recovering from that inconsistently is exactly the kind of bug that surfaces as "sold" items that don't exist. A single database transaction covering both the inventory decrement and the order insert gives you atomicity for free from the database engine, without needing a custom distributed-lock protocol to reason about — simpler and strictly safer for this access pattern.\r
\r
### Q11. How would you support ride cancellation fees or minimum charges for very short trips?\r
\r
Extend \`IPricingStrategy\` (or add a sibling \`ICancellationPolicy\`) that inspects how far the ride progressed before cancellation — nothing charged for a cancellation in \`REQUESTED\`, a small fee once a driver is \`ASSIGNED\` and has started traveling, a larger one if they've already \`ARRIVED\`. This slots in cleanly because cancellation is already a distinct, explicit transition (\`CancelRide\`) rather than being folded into \`CompleteRide\` — you can attach fee logic at the exact transition point where the business rule differs, without touching the completion-fare code path at all.\r
\r
### Q12. What would you change about this design to make ride matching and fare calculation independently testable?\r
\r
Both are already isolated behind interfaces (\`IDriverMatcher\`, \`IPricingStrategy\`), so unit tests can exercise each directly: feed \`NearestDriverMatcher\` a hand-built list of drivers and assert which one comes back for a given pickup and radius, with no \`RideService\` involved; feed \`StandardPricingStrategy\` fixed \`(distanceKm, durationMin, surge)\` tuples and assert the resulting \`FareBreakdown\`, including boundary cases like exactly-at-minimum-fare. A smaller set of integration tests then exercises \`RideService\` end to end with fake strategies, to confirm the orchestration itself — not the policies — is correct.\r
`;export{e as default};
