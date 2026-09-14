const e=`---\r
title: Design a Parking Lot\r
description: How to model vehicles, spots, tickets and pricing for a parking lot, with a pluggable allocation strategy and safe concurrent spot assignment\r
difficulty: Core\r
tags: [parking-lot, strategy-pattern, oop-design, concurrency]\r
---\r
\r
A parking lot is the classic low-level design warm-up: it looks trivial but hides a real type hierarchy, a pluggable pricing engine, and a genuine race condition the moment two cars go for the last free spot at once.\r
\r
## Requirements\r
\r
### Functional\r
\r
- Support multiple vehicle types (motorcycle, car, truck/bus) and matching spot types.\r
- On entry, automatically find and assign a compatible spot and issue a ticket recording spot, vehicle type and entry time.\r
- On exit, validate the ticket, compute the fee from time parked, free the spot, and invalidate the ticket.\r
- Reject entry when no compatible spot is free; reject exit on an unknown, expired or already-used ticket.\r
- Support multiple floors, and a display board showing free-spot counts per type per floor.\r
\r
### Non-functional and assumptions\r
\r
- Payment processing and physical gate hardware are out of scope — assume they call into this system as a black box.\r
- Peak load means many simultaneous entries at multiple gates; spot assignment must not double-book a spot.\r
- Pricing must be configurable per vehicle type and, later, per time-of-day, without touching the core allocation logic.\r
- Single-process, in-memory design for the interview; the strategy boundaries should make sharding across processes later a config change, not a rewrite.\r
\r
### Clarifying questions to ask\r
\r
- Which vehicle types and spot types do we need — is a car allowed to occupy a truck spot?\r
- Is pricing flat, hourly, or does it vary by vehicle type or duration?\r
- Do we need multi-floor support and a live display board in scope?\r
- What happens on a lost ticket — is there a manual override/admin flow?\r
- Is payment part of this design, or do we just return a fee amount?\r
- How many entry/exit gates operate concurrently, and do they share one in-memory instance?\r
\r
## Core objects\r
\r
| Class | Responsibility | Key fields/methods |\r
|---|---|---|\r
| \`Vehicle\` | Represents the car/bike/truck requesting a spot | \`LicensePlate\`, \`Type\` |\r
| \`ParkingSpot\` | A single physical spot | \`Id\`, \`SpotType\`, \`FloorId\` |\r
| \`ParkingFloor\` | Groups spots, tracks per-type free counts | \`Spots\`, \`GetFreeCount(type)\` |\r
| \`Ticket\` | Proof of parking, links vehicle to spot | \`Id\`, \`SpotId\`, \`VehicleType\`, \`EntryTime\` |\r
| \`ISpotAllocationStrategy\` | Picks a spot for a vehicle | \`TryAllocate(vehicleType) -> ParkingSpot\` |\r
| \`IPricingStrategy\` | Computes the fee for a ticket | \`CalculateFee(ticket, exitTime) -> decimal\` |\r
| \`ParkingLot\` | Facade orchestrating entry/exit | \`Enter(vehicleType)\`, \`Exit(ticketId)\` |\r
| \`DisplayBoard\` | Read-only view of availability | \`Refresh()\`, \`GetAvailability()\` |\r
\r
## Class design\r
\r
The entities and how they relate — a vehicle enters, claims a spot, and receives a ticket that is the single source of truth until it exits:\r
\r
![alt text](notes/LLD/Problems/ParkingSystem/image.png)\r
\r
\`\`\`mermaid\r
classDiagram\r
    class ParkingLot {\r
        -List~ParkingFloor~ floors\r
        -ISpotAllocationStrategy allocationStrategy\r
        -IPricingStrategy pricingStrategy\r
        -Dictionary~string, Ticket~ activeTickets\r
        +Ticket Enter(VehicleType type)\r
        +decimal Exit(string ticketId)\r
    }\r
    class ParkingFloor {\r
        -int FloorNumber\r
        -List~ParkingSpot~ Spots\r
        +int GetFreeCount(SpotType type)\r
    }\r
    class ParkingSpot {\r
        -string Id\r
        -SpotType Type\r
        -bool Reserved\r
    }\r
    class Ticket {\r
        -string Id\r
        -string SpotId\r
        -VehicleType VehicleType\r
        -DateTime EntryTime\r
    }\r
    class ISpotAllocationStrategy {\r
        <<interface>>\r
        +TryAllocate(VehicleType type) ParkingSpot\r
    }\r
    class IPricingStrategy {\r
        <<interface>>\r
        +CalculateFee(Ticket t, DateTime exitTime) decimal\r
    }\r
    class NearestSpotStrategy\r
    class HourlyPricingStrategy\r
    ISpotAllocationStrategy <|.. NearestSpotStrategy\r
    IPricingStrategy <|.. HourlyPricingStrategy\r
    ParkingLot "1" --> "*" ParkingFloor\r
    ParkingFloor "1" --> "*" ParkingSpot\r
    ParkingLot --> ISpotAllocationStrategy\r
    ParkingLot --> IPricingStrategy\r
    ParkingLot "1" --> "*" Ticket\r
    Ticket --> ParkingSpot\r
\`\`\`\r
\r
An earlier whiteboard pass at the same model, before the strategy interfaces were pulled out:\r
\r
![alt text](notes/LLD/Problems/ParkingSystem/image-1.png)\r
\r
## Key design decisions\r
\r
### 1. Spot allocation as a Strategy, not an \`if/else\` chain\r
\r
\`ParkingLot\` never scans spots itself; it delegates to \`ISpotAllocationStrategy\`. This is the single decision interviewers probe hardest, because the naive answer hardcodes "loop through spots, return first match" inside the lot class.\r
\r
| Strategy | Behaviour | When you'd pick it |\r
|---|---|---|\r
| \`NearestSpotStrategy\` | First free spot on the nearest floor to the entrance | Small lots, simple UX |\r
| \`MostFreeFloorStrategy\` | Balances occupancy across floors | Large garages, load spreading |\r
| \`PreferredZoneStrategy\` | EV/accessible spots first, by vehicle attribute | Regulatory or accessibility requirements |\r
\r
> [!KEY]\r
> Rejected alternative: hardcoding the search loop inside \`ParkingLot.Enter\`. It works for one lot but forces a code change — and a redeploy — every time the business wants a different allocation policy.\r
\r
### 2. Pricing as a Strategy, not a fee formula in the lot class\r
\r
\`IPricingStrategy.CalculateFee(ticket, exitTime)\` isolates money math from spot bookkeeping. \`HourlyPricingStrategy\` rounds up to the hour; a later \`VehicleTypePricingStrategy\` or \`SurgePricingStrategy\` can plug in without touching \`Enter\`/\`Exit\`.\r
\r
> [!TIP]\r
> Naming both "Strategy" out loud, and stating that they share the shape "pure function of (state) -> value with no side effects," signals you understand *why* the pattern applies, not just that it exists.\r
\r
### 3. Occupancy is derived, never duplicated\r
\r
A tempting first draft puts an \`IsOccupied\` boolean directly on \`ParkingSpot\` **and** tracks active tickets in a map. That is two sources of truth that can drift apart under a crash between the two writes.\r
\r
| Approach | Risk | Fix |\r
|---|---|---|\r
| Boolean flag on spot + separate ticket map | Can desync if one write fails | ❌ Rejected |\r
| Spot occupancy derived from \`activeTickets\` (one map, keyed by spot id) | Single source of truth | ✅ Used here |\r
\r
![alt text](notes/LLD/Problems/ParkingSystem/image-2.png)\r
\r
![alt text](notes/LLD/Problems/ParkingSystem/image-3.png)\r
\r
![alt text](notes/LLD/Problems/ParkingSystem/image-4.png)\r
\r
## Implementation\r
\r
The flow through \`Exit\`, sketched before it was turned into the version below:\r
\r
![alt text](notes/LLD/Problems/ParkingSystem/image-5.png)\r
\r
\`\`\`csharp\r
public interface ISpotAllocationStrategy\r
{\r
    ParkingSpot? TryAllocate(IEnumerable<ParkingSpot> spots, VehicleType type);\r
}\r
\r
public interface IPricingStrategy\r
{\r
    decimal CalculateFee(Ticket ticket, DateTime exitTime);\r
}\r
\r
public class HourlyPricingStrategy : IPricingStrategy\r
{\r
    private readonly decimal _rate;\r
    public HourlyPricingStrategy(decimal hourlyRate) => _rate = hourlyRate;\r
\r
    public decimal CalculateFee(Ticket ticket, DateTime exitTime)\r
    {\r
        var hours = Math.Ceiling((exitTime - ticket.EntryTime).TotalHours);\r
        return (decimal)Math.Max(hours, 1) * _rate;\r
    }\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
public class ParkingLot\r
{\r
    private readonly ConcurrentDictionary<string, ParkingSpot> _occupiedBySpotId = new();\r
    private readonly ConcurrentDictionary<string, Ticket> _activeTickets = new();\r
    private readonly List<ParkingSpot> _allSpots;\r
    private readonly ISpotAllocationStrategy _allocation;\r
    private readonly IPricingStrategy _pricing;\r
\r
    public Ticket Enter(VehicleType type)\r
    {\r
        var free = _allSpots.Where(s => !_occupiedBySpotId.ContainsKey(s.Id));\r
        var spot = _allocation.TryAllocate(free, type)\r
            ?? throw new InvalidOperationException("Lot full for this vehicle type");\r
\r
        // Atomic claim: fails if another thread grabbed it first.\r
        if (!_occupiedBySpotId.TryAdd(spot.Id, spot))\r
            return Enter(type); // retry — spot lost the race\r
\r
        var ticket = new Ticket(Guid.NewGuid().ToString(), spot.Id, type, DateTime.UtcNow);\r
        _activeTickets[ticket.Id] = ticket;\r
        return ticket;\r
    }\r
\r
    public decimal Exit(string ticketId)\r
    {\r
        if (!_activeTickets.TryRemove(ticketId, out var ticket))\r
            throw new InvalidOperationException("Invalid or already-used ticket");\r
\r
        var fee = _pricing.CalculateFee(ticket, DateTime.UtcNow);\r
        _occupiedBySpotId.TryRemove(ticket.SpotId, out _);\r
        return fee;\r
    }\r
}\r
\`\`\`\r
\r
Worked example: a car enters at 10:00 and is assigned spot \`B\`, receiving ticket \`T123\`. It exits at 12:30 — 2.5 hours parked, rounded up to 3 billable hours; at 500 cents/hour that's a 1,500-cent fee, spot \`B\` is removed from \`_occupiedBySpotId\`, and \`T123\` is removed from \`_activeTickets\` so the same ticket can never be replayed for a second refund or a second exit.\r
\r
## Concurrency and thread safety\r
\r
The real interview test is what happens when two gates call \`Enter(CAR)\` in the same millisecond for the last free car spot:\r
\r
![alt text](notes/LLD/Problems/ParkingSystem/image-6.png)\r
\r
Three viable designs, in increasing order of scalability:\r
\r
1. **Single lock around \`Enter\`/\`Exit\`.** Simple and correct, but every gate serializes on one lock — fine for a small lot, a bottleneck for a stadium garage.\r
2. **\`ConcurrentDictionary.TryAdd\` as an atomic claim** (used above): read the candidate spot list without a lock, then atomically claim it; on failure, retry with the next candidate. No coarse lock, contention only on the actual spot.\r
3. **Per-floor \`ReaderWriterLockSlim\`**: many concurrent readers scanning for a free spot, a short write lock only to flip occupancy. Best when reads (searching) vastly outnumber writes (claiming):\r
\r
\`\`\`csharp\r
private readonly ReaderWriterLockSlim _rwLock = new();\r
\r
private ParkingSpot? FindAvailableSpot(VehicleType type)\r
{\r
    _rwLock.EnterReadLock();\r
    try { return _allSpots.FirstOrDefault(s => s.Type == type && !_occupiedBySpotId.ContainsKey(s.Id)); }\r
    finally { _rwLock.ExitReadLock(); }\r
}\r
\r
public Ticket Enter(VehicleType type)\r
{\r
    while (true)\r
    {\r
        var spot = FindAvailableSpot(type) ?? throw new InvalidOperationException("No available spots");\r
        _rwLock.EnterWriteLock();\r
        try\r
        {\r
            if (_occupiedBySpotId.TryAdd(spot.Id, spot))\r
                return IssueTicket(spot, type); // succeeded under the write lock\r
        }\r
        finally { _rwLock.ExitWriteLock(); }\r
        // Someone else claimed it between the read and the write lock — retry.\r
    }\r
}\r
\`\`\`\r
\r
> [!WARNING]\r
> \`TryAdd\`-and-retry only works if the retry re-reads the free list — if you cache "the chosen spot" before the atomic claim and never re-check, you'll throw a false "lot full" error under contention instead of finding the next candidate.\r
\r
## Extending the design\r
\r
| New requirement | Where it plugs in | Why the design allows it |\r
|---|---|---|\r
| Reservations / pre-booking | New \`ReservationService\` calling \`ParkingSpot.Reserve()\` before \`Enter\` | Spot state is already abstracted behind the allocation strategy |\r
| Multi-floor garage | \`ParkingFloor\` composite already groups spots | \`ParkingLot\` iterates floors via the same strategy interface |\r
| Surge/dynamic pricing | New \`IPricingStrategy\` implementation | \`Exit\` never knows which strategy is injected |\r
| Motorcycle overflow into car spots | New \`OverflowAllocationStrategy\` wrapping the default | Strategy composition, no change to \`ParkingLot\` |\r
| Live display board | \`DisplayBoard\` reads \`ParkingFloor.GetFreeCount\` | Read path is already separated from the write (claim) path |\r
| Lost ticket recovery | An admin \`ReissueTicket(spotId)\` endpoint that looks up the active ticket by spot id and prints a duplicate | Occupancy is already keyed by spot id, so the original ticket's data is still recoverable without touching allocation or pricing |\r
\r
## Cheat sheet\r
\r
- Model vehicle and spot types as parallel enums or hierarchies — don't conflate them.\r
- Allocation and pricing are the two axes of change → both become Strategy interfaces.\r
- Never store occupancy in two places; derive it from the active-ticket map.\r
- Round pricing up to the next unit unless told otherwise, and say so out loud.\r
- The concurrency question is always coming — have an atomic-claim answer ready before you're asked.\r
- A ticket ID should be single-use: remove it from the active map on exit, don't just flag it "used".\r
- Multi-floor is composition (\`ParkingLot\` has \`ParkingFloor\`s has \`ParkingSpot\`s), not a bigger flat list.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Hardcoding the spot search loop inside \`ParkingLot\` | Extract \`ISpotAllocationStrategy\` from the first draft |\r
| Boolean \`IsOccupied\` flag plus a separate ticket map | Derive occupancy from one map, keyed by spot id |\r
| Locking the whole lot for every entry | Use atomic per-spot claims or per-floor read/write locks |\r
| Forgetting to invalidate the ticket on exit | Remove (not just flag) the ticket from the active map |\r
| Pricing logic embedded in \`Exit\` | Extract \`IPricingStrategy\`, inject it |\r
| Ignoring the "lot full" and "invalid ticket" error paths | Call them out explicitly as functional requirements |\r
\r
## Summary\r
\r
A parking lot design earns its interview slot because it forces two independent axes of change — how a spot is chosen, and how a fee is computed — into two Strategy interfaces, keeping \`ParkingLot\` itself thin. The one true trap is treating spot occupancy as two mutable flags instead of one derived source of truth, which is exactly what breaks under concurrent entry. Get the strategies and the atomic claim right, and multi-floor, reservations and dynamic pricing all become additive changes rather than rewrites.\r
\r
## Top Interview Questions\r
\r
### Q1. Why use the Strategy pattern for both spot allocation and pricing instead of one configurable \`ParkingLot\` class?\r
\r
Because they vary independently and for different reasons — allocation policy changes based on garage layout and traffic patterns, pricing changes based on business rules and time. Bundling both into \`ParkingLot\` with flags or switches violates the Open/Closed Principle: every new policy means editing and redeploying the core class. With two interfaces, \`ParkingLot\` depends only on the abstractions, new policies are new classes, and you can unit test allocation and pricing in complete isolation from each other and from the concurrency logic.\r
\r
### Q2. How do you prevent two vehicles from being assigned the same spot under concurrent entry?\r
\r
Read the candidate spot list without a lock (cheap, happens constantly), then perform a single atomic operation — \`ConcurrentDictionary.TryAdd(spotId, ...)\` or a compare-and-swap — to claim it. If the claim fails, another thread won the race for that spot, so retry with the next candidate rather than failing outright. This avoids a lot-wide lock while still guaranteeing exactly one ticket per spot; the atomicity lives at the level of the individual resource being contended, not the whole system.\r
\r
### Q3. Why should occupancy be derived from active tickets rather than stored as a flag on \`ParkingSpot\`?\r
\r
Two independent pieces of mutable state that must always agree are a bug waiting for a crash at the wrong moment — if you set the flag but fail to record the ticket (or vice versa), the system silently corrupts itself. Deriving occupancy from "does an active ticket reference this spot id" means there is exactly one place that can be wrong, and it fails safe: a missing ticket means the spot reads as free, which is the safer default to debug.\r
\r
### Q4. How would you support a motorcycle parking in a car spot when all motorcycle spots are full?\r
\r
Add an \`OverflowAllocationStrategy\` that wraps the default one: try the exact-match strategy first, and if it returns null, retry against the next-larger spot type. This is decorator-style composition over the existing \`ISpotAllocationStrategy\` interface — \`ParkingLot\` calls the same method signature and never learns that overflow logic exists, which is the point of hiding policy behind an interface.\r
\r
### Q5. How do you calculate the parking fee, and what edge cases matter?\r
\r
Take \`exitTime - entryTime\`, convert to hours, and round up (a car parked for 61 minutes owes two hours, not 1.0166). Edge cases: a ticket presented twice (must be single-use — remove it from the active map on first exit), a negative duration from clock skew across gate machines (clamp to a minimum, log it, and prefer a monotonic or server-side clock over each gate's local clock), and free grace periods (e.g., under 5 minutes) if the business specifies one.\r
\r
### Q6. How would you extend this design to a multi-floor garage with a live availability display?\r
\r
Introduce \`ParkingFloor\` as a composite that owns a list of spots and can report free counts per type; \`ParkingLot\` becomes a list of floors instead of a flat spot list, and the allocation strategy iterates floors using the same interface (nearest floor first, or most-free floor, are just different strategy implementations). The \`DisplayBoard\` only needs read access to \`ParkingFloor.GetFreeCount\`, which is naturally decoupled from the write path (claiming a spot), so refreshing the board never contends with entry/exit traffic.\r
\r
### Q7. What happens if the process crashes between claiming a spot and issuing the ticket?\r
\r
In the in-memory design shown, both happen inside \`Enter\` before returning, so a crash mid-call loses the whole request — the caller gets no ticket, and a supervising process should treat that spot claim as provisional until a heartbeat or reconciliation job confirms a ticket exists for it. In a persistent design, you'd wrap the claim and ticket insert in a single transaction (or use an outbox pattern) so the two either both commit or neither does — this is worth naming even if it is out of scope for the toy version, because it shows you think past the happy path.\r
\r
### Q8. Why prefer a per-spot atomic claim over a single lock around the whole \`Enter\` method?\r
\r
A single lock serializes every entry attempt across the entire lot, even when they target completely unrelated spots — throughput collapses under load from many simultaneous gates. A per-spot atomic claim only creates contention when two threads genuinely want the *same* spot, which is rare once the free-spot list is reasonably large. The trade-off is code complexity: you need a retry loop and must reason carefully about the read-then-claim window, whereas a single lock is trivially easy to reason about. For an interview, name both and justify picking the finer-grained one under expected load.\r
\r
### Q9. How is this parking lot design similar to (or different from) a database connection pool?\r
\r
Both are "acquire one resource from a fixed pool, use it, release it" problems, and both need the acquire step to be atomic to avoid double-allocation. The difference is lifecycle: a parking ticket is tied to a specific spot for the whole session and released explicitly by an external event (the driver exiting), whereas a pooled connection is typically returned automatically (via \`using\`/dispose) as soon as the caller is done. Drawing this parallel out loud is a good way to show you recognize the underlying resource-pool pattern rather than treating parking as a one-off problem.\r
\r
### Q10. How would you unit test the allocation and pricing strategies in isolation?\r
\r
Test each \`ISpotAllocationStrategy\` implementation directly against a hand-built list of \`ParkingSpot\` objects, asserting which spot id comes back for a given vehicle type and occupancy pattern — no \`ParkingLot\` involved. Test each \`IPricingStrategy\` against a fixed \`(entryTime, exitTime)\` pair, asserting the fee, including boundary cases like exactly on the hour versus one minute over. Then a smaller set of integration tests exercises \`ParkingLot.Enter\`/\`Exit\` end to end with a fake/no-op strategy to confirm the orchestration (ticket issuance, occupancy bookkeeping, error paths) is correct independent of which real strategy is plugged in.\r
\r
### Q11. What's the difference between rejecting an entry and blocking until a spot frees up?\r
\r
Rejecting is a synchronous, stateless decision — "no spot available, return an error now" — and is what a physical gate needs, since a car can't be told to wait indefinitely in a queue that blocks other traffic. Blocking would require a request queue and a notification mechanism (e.g., a semaphore per spot type, or a message when a spot frees), which is a legitimate extension for a valet or reservation system but adds real complexity: you need timeouts, cancellation, and fairness between waiting requests. State clearly which one the requirements call for before building it — this is a good clarifying question in itself.\r
\r
### Q12. How would this design change if you needed to run it across multiple servers instead of a single process?\r
\r
The atomic claim (\`ConcurrentDictionary.TryAdd\`) has to move from in-memory to something that gives the same atomicity across processes — a database row with a unique constraint on spot id plus a status column, or a distributed lock/compare-and-swap in Redis. The Strategy interfaces don't need to change at all; only the storage behind \`ParkingSpot\`/\`Ticket\` state does. This is exactly why keeping allocation and pricing behind interfaces instead of baking them into \`ParkingLot\` pays off — the scaling change is localized to the persistence layer.\r
`;export{e as default};
