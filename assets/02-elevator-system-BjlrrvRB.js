const e=`---\r
title: Design an Elevator System\r
description: How to model hall calls and car calls, pick a scheduling strategy such as SCAN or nearest-car, and dispatch across multiple elevators safely\r
difficulty: Advanced\r
tags: [elevator-system, state-machine, strategy-pattern, scheduling]\r
---\r
\r
An elevator system is a scheduling problem wearing a state-machine costume. Moving one car up and down is trivial; the interview-worthy part is deciding which of several cars answers a hall call, and how a car reorders its stops without starving a request forever.\r
\r
## Requirements\r
\r
### Functional\r
\r
- Accept **external hall calls**: a floor button press with a direction (UP or DOWN), before anyone is inside a car.\r
- Accept **internal car calls**: a destination floor pressed from inside a car, with no direction.\r
- Given multiple elevators, decide which one answers each hall call.\r
- Advance all elevators through discrete time steps (\`Step()\`/\`tick()\`), each servicing its own queue of stops.\r
- Reject invalid floor numbers; treat a call for the current floor as already served.\r
- Support taking a car out of service (maintenance/emergency) and reassigning its pending calls.\r
\r
### Non-functional and assumptions\r
\r
- Floor count and elevator count are configuration, not hardcoded constants.\r
- Door timing, weight limits and sensor hardware are abstracted away — assume the controller is told "car arrived" and "call placed" as discrete events.\r
- No request should starve: a car committed to a direction should not reverse until it has serviced every stop in that direction.\r
- The dispatch algorithm must be swappable without touching how a single elevator manages its own queue.\r
\r
### Clarifying questions to ask\r
\r
- How many floors and elevators, and are they fixed or configurable at runtime?\r
- Are hall calls directional (separate UP/DOWN buttons), or just "an elevator is wanted here"?\r
- Is this a tick-based simulation, or should it react to real asynchronous events?\r
- Is capacity/weight limiting in scope, or can we assume unlimited capacity?\r
- Do we need express elevators, floor restrictions, or VIP priority calls?\r
- What should happen to an elevator's pending requests if it goes out of service mid-trip?\r
\r
## Core objects\r
\r
| Class | Responsibility | Key fields/methods |\r
|---|---|---|\r
| \`Elevator\` | Owns one car's queue and physical state | \`CurrentFloor\`, \`Direction\`, \`Requests\`, \`Step()\`, \`AddRequest(r)\` |\r
| \`Request\` | A hall call or car call, value-equal by floor+type | \`Floor\`, \`Type\` (PickupUp/PickupDown/Destination) |\r
| \`ISchedulingStrategy\` | Chooses which elevator answers a hall call | \`SelectElevator(cars, request) -> Elevator\` |\r
| \`ElevatorController\` | Dispatcher/orchestrator, owns the fleet | \`RequestElevator(floor, dir)\`, \`Step()\` |\r
| \`ElevatorState\` (enum) | Idle / MovingUp / MovingDown / OutOfService | used by both \`Elevator\` and dispatch filtering |\r
\r
## Class design\r
\r
\`\`\`mermaid\r
classDiagram\r
    class ElevatorController {\r
        -List~Elevator~ elevators\r
        -ISchedulingStrategy scheduler\r
        +bool RequestElevator(int floor, Direction dir)\r
        +void Step()\r
    }\r
    class Elevator {\r
        -int CurrentFloor\r
        -Direction Direction\r
        -SortedSet~Request~ Requests\r
        +bool AddRequest(Request r)\r
        +void Step()\r
    }\r
    class Request {\r
        -int Floor\r
        -RequestType Type\r
    }\r
    class ISchedulingStrategy {\r
        <<interface>>\r
        +Elevator SelectElevator(List~Elevator~ cars, Request r)\r
    }\r
    class NearestCarStrategy\r
    class ScanStrategy\r
    ISchedulingStrategy <|.. NearestCarStrategy\r
    ISchedulingStrategy <|.. ScanStrategy\r
    ElevatorController "1" --> "*" Elevator\r
    ElevatorController --> ISchedulingStrategy\r
    Elevator "1" --> "*" Request\r
\`\`\`\r
\r
### Elevator state machine\r
\r
\`\`\`mermaid\r
stateDiagram-v2\r
    [*] --> Idle\r
    Idle --> MovingUp: call above current floor\r
    Idle --> MovingDown: call below current floor\r
    MovingUp --> DoorsOpen: reached a requested stop\r
    MovingDown --> DoorsOpen: reached a requested stop\r
    DoorsOpen --> MovingUp: pending requests above\r
    DoorsOpen --> MovingDown: pending requests below\r
    DoorsOpen --> Idle: no pending requests\r
    Idle --> OutOfService: maintenance signal\r
    OutOfService --> Idle: back in service\r
\`\`\`\r
\r
Earlier whiteboard passes toward this same model:\r
\r
![alt text](notes/LLD/Problems/Elevator/image.png)\r
\r
![alt text](notes/LLD/Problems/Elevator/image-1.png)\r
\r
![alt text](notes/LLD/Problems/Elevator/image-2.png)\r
\r
![alt text](notes/LLD/Problems/Elevator/image-3.png)\r
\r
## Key design decisions\r
\r
### 1. Scheduling as a pluggable Strategy\r
\r
The dispatcher (\`ElevatorController\`) never hardcodes "pick the closest car" — it delegates to \`ISchedulingStrategy\`, because this is the part real systems tune constantly.\r
\r
| Strategy | Behaviour | Trade-off |\r
|---|---|---|\r
| FCFS | Serve hall calls in arrival order, any free car | Simple, but ignores car position — poor average wait |\r
| Nearest-car | Pick the idle/compatible car closest to the call | Good for light traffic, can starve far requests under load |\r
| SCAN / LOOK | A car sweeps in one direction, serving all calls on the way, reverses only when nothing is left ahead | Best throughput and fairness; the industry-standard baseline |\r
\r
> [!KEY]\r
> Rejected alternative: baking "closest idle elevator" logic directly into \`ElevatorController.RequestElevator\`. It ties the dispatcher to one policy — swapping in SCAN later means editing the orchestrator instead of adding a class.\r
\r
> [!WARNING]\r
> "Closest car already moving toward the call" is not, by itself, a correct filter. A car can be moving toward the requested floor right now but already have a stop queued *before* it that will flip its direction early — for example a car at floor 3 heading up with a destination call for floor 4 will turn around at 4 and never reach a hall call at floor 7. The strategy must also confirm the car has a request at or beyond the target floor in its current direction before treating it as "committed" — otherwise you dispatch a car that reverses just short of the passenger.\r
\r
### 2. Elevator movement as an explicit state machine\r
\r
Each \`Elevator\` tracks \`Direction\` (Idle/Up/Down) as real state, not a derived value recomputed ad hoc. This makes the "don't reverse while requests remain ahead" rule a single guard clause instead of scattered conditionals, and makes the system trivially testable one tick at a time.\r
\r
> [!TIP]\r
> Saying "the elevator's direction is state, and I only flip it when there is nothing left to serve ahead of me" is the sentence that proves you understand SCAN, not just that you've heard the word.\r
\r
### 3. Requests are value objects, deduplicated by floor + type\r
\r
A \`Request(floor: 5, type: PickupUp)\` pressed twice should not queue two stops — \`Request\` overrides equality on \`(Floor, Type)\` and is stored in a \`HashSet\`/\`SortedSet\`, so re-pressing a button is a no-op rather than a duplicate stop.\r
\r
| Design | Problem |\r
|---|---|\r
| Requests as a plain list, no equality | Duplicate presses queue duplicate stops |\r
| Requests as value-equal objects in a set | ✅ Idempotent — re-pressing is free |\r
\r
### 4. Dispatcher and car are separate objects with separate responsibilities\r
\r
\`ElevatorController\` only decides *which* car takes a call; \`Elevator\` only decides *when* to stop and *which way* to move next. This split means the SCAN logic inside \`Elevator.Step()\` is unaffected if you rewrite dispatch from nearest-car to a zone-based strategy for 100 elevators — a natural Single Responsibility split.\r
\r
## Implementation\r
\r
\`\`\`csharp\r
public interface ISchedulingStrategy\r
{\r
    Elevator? SelectElevator(IReadOnlyList<Elevator> cars, Request request);\r
}\r
\r
public class NearestCarStrategy : ISchedulingStrategy\r
{\r
    public Elevator? SelectElevator(IReadOnlyList<Elevator> cars, Request request)\r
    {\r
        var inService = cars.Where(c => c.State != ElevatorState.OutOfService).ToList();\r
\r
        // Hall calls only ever carry PickupUp/PickupDown; map to a travel direction.\r
        var callDirection = request.Type == RequestType.PickupUp ? Direction.Up : Direction.Down;\r
\r
        // Tier 1: already moving toward the call, not past it, and committed to a\r
        // stop at or beyond it — so it won't reverse before it gets there.\r
        var committed = inService\r
            .Where(c => c.Direction == callDirection)\r
            .Where(c => callDirection == Direction.Up\r
                ? c.CurrentFloor <= request.Floor\r
                : c.CurrentFloor >= request.Floor)\r
            .Where(c => c.HasRequestAtOrBeyond(request.Floor, callDirection))\r
            .OrderBy(c => Math.Abs(c.CurrentFloor - request.Floor))\r
            .FirstOrDefault();\r
        if (committed != null) return committed;\r
\r
        // Tier 2: nearest idle car.\r
        var idle = inService.Where(c => c.Direction == Direction.Idle)\r
            .OrderBy(c => Math.Abs(c.CurrentFloor - request.Floor)).FirstOrDefault();\r
        if (idle != null) return idle;\r
\r
        // Tier 3: nearest car of any kind, as a last resort.\r
        return inService.OrderBy(c => Math.Abs(c.CurrentFloor - request.Floor)).FirstOrDefault();\r
    }\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
public class Elevator\r
{\r
    public int CurrentFloor { get; private set; }\r
    public Direction Direction { get; private set; } = Direction.Idle;\r
    private readonly SortedSet<Request> _requests = new(new RequestComparer());\r
\r
    public bool AddRequest(Request r)\r
    {\r
        if (r.Floor == CurrentFloor) return true; // already here, no-op\r
        return _requests.Add(r);\r
    }\r
\r
    // Used by the scheduler to confirm this car won't reverse before reaching floor.\r
    public bool HasRequestAtOrBeyond(int floor, Direction dir) =>\r
        dir == Direction.Up\r
            ? _requests.Any(r => r.Floor >= floor)\r
            : _requests.Any(r => r.Floor <= floor);\r
\r
    public void Step()\r
    {\r
        if (_requests.Count == 0) { Direction = Direction.Idle; return; }\r
\r
        if (Direction == Direction.Idle)\r
            Direction = _requests.Min!.Floor > CurrentFloor ? Direction.Up : Direction.Down;\r
\r
        if (_requests.Any(r => r.Floor == CurrentFloor))\r
        {\r
            _requests.RemoveWhere(r => r.Floor == CurrentFloor);\r
            return; // doors open this tick, don't move\r
        }\r
\r
        bool moreAhead = Direction == Direction.Up\r
            ? _requests.Any(r => r.Floor > CurrentFloor)\r
            : _requests.Any(r => r.Floor < CurrentFloor);\r
\r
        if (!moreAhead) { Direction = Direction == Direction.Up ? Direction.Down : Direction.Up; return; }\r
        CurrentFloor += Direction == Direction.Up ? 1 : -1;\r
    }\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
public class ElevatorController\r
{\r
    private readonly List<Elevator> _elevators;\r
    private readonly ISchedulingStrategy _scheduler;\r
\r
    public bool RequestElevator(int floor, RequestType type)\r
    {\r
        var request = new Request(floor, type);\r
        var best = _scheduler.SelectElevator(_elevators, request);\r
        return best?.AddRequest(request) ?? false;\r
    }\r
\r
    public void Step() { foreach (var e in _elevators) e.Step(); }\r
}\r
\`\`\`\r
\r
## Concurrency and thread safety\r
\r
Hall calls arrive from independent floor panels and can hit \`RequestElevator\` at the exact same instant from different threads, while a background loop calls \`Step()\` on a timer. Two safe designs:\r
\r
1. **Lock-free ingestion queue**: \`RequestElevator\` enqueues onto a thread-safe \`ConcurrentQueue<Request>\`; the single-threaded \`Step()\` loop drains the queue at the start of each tick before moving any car. This avoids any lock around the actual scheduling/movement logic, which stays single-threaded and easy to reason about.\r
2. **Coarse lock around the fleet**: a single lock guards both \`RequestElevator\` and \`Step()\`. Simple, correct, but every call submission blocks every other — acceptable for a building, not for a simulation processing thousands of calls a second.\r
\r
> [!WARNING]\r
> If elevators are stepped in parallel (one thread per car) to save CPU, each \`Elevator\` needs its own lock around its \`_requests\` set — but the dispatcher's read of \`CurrentFloor\`/\`Direction\` across cars during \`SelectElevator\` must then tolerate slightly stale data, or you need a lock ordering discipline to avoid deadlock between dispatch and per-car steps.\r
\r
## Extending the design\r
\r
| New requirement | Where it plugs in | Why the design allows it |\r
|---|---|---|\r
| Express elevator serving only floors {0, 20, 40} | New \`Elevator\` subtype/flag checked in \`AddRequest\` | Validation lives at the point requests enter the car, not in the dispatcher |\r
| VIP/priority call | \`Request\` gains a priority field; scheduler sorts by it | Scheduling policy is already isolated behind \`ISchedulingStrategy\` |\r
| Capacity/weight limits | \`Elevator.AddRequest\` rejects boarding above a threshold | Same single entry point already validates requests |\r
| 100 elevators, 1000 floors | Replace \`NearestCarStrategy\` with a zone-based/ETA strategy that pre-filters candidates | Dispatcher only depends on the interface, not the algorithm |\r
| Cancel a floor request | \`_requests.Remove(request)\` | Requests are already a set, not an opaque queue |\r
\r
## Cheat sheet\r
\r
- Two request kinds: hall call (has direction) and car call (destination only) — never conflate them.\r
- Direction is state on the elevator, not a value recomputed from nothing each tick.\r
- SCAN/LOOK beats FCFS and nearest-car on fairness under load — name it and say why.\r
- Dispatcher picks *which* car; the car itself decides *when* to stop and *which way* next — keep those separate.\r
- Requests must be value-equal and deduplicated, or repeated button presses queue duplicate stops.\r
- Never reverse direction while requests remain ahead in the current direction — that's the starvation bug.\r
- Model out-of-service as a state, not a null elevator, so pending requests can be reassigned cleanly.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Hardcoding "nearest idle car" inside the controller | Extract \`ISchedulingStrategy\`, inject the policy |\r
| Recomputing direction from scratch every tick | Store \`Direction\` as elevator state, mutate it explicitly |\r
| Reversing direction as soon as the elevator is momentarily idle at a floor | Only reverse when no requests remain ahead in the current direction |\r
| Treating hall calls and destination calls identically | Hall calls carry direction and affect dispatch; destinations don't |\r
| Storing requests in a plain list | Duplicate button presses queue duplicate stops — use a set with equality |\r
| One global lock around every operation | Prefer a drain-queue-then-single-threaded-step design for throughput |\r
\r
## Summary\r
\r
The elevator problem rewards separating three concerns that are easy to tangle: which car answers a call (dispatch strategy), how a car orders its own stops (SCAN-style state machine), and how calls are safely ingested under concurrency. Keep \`ElevatorController\` and \`Elevator\` responsibilities distinct, make direction real state instead of a derived guess, and dedupe requests by value. Do that, and express elevators, VIP calls, capacity limits and fleets of a hundred cars are all additive changes to the strategy layer, not rewrites of the core.\r
\r
## Top Interview Questions\r
\r
### Q1. What is the difference between a hall call and a car call, and why does it matter for design?\r
\r
A hall call is placed from a floor before boarding and carries a direction (UP or DOWN) — it means "I want to go up/down from here" and is what the dispatcher uses to decide which elevator to send. A car call is placed from inside an elevator after boarding and is just a destination floor with no direction, since the car is already committed to serving that passenger. The distinction matters because only hall calls participate in the fleet-wide dispatch decision; car calls only affect the queue of the elevator the passenger is already in. Conflating them breaks SCAN-style scheduling, because you'd be trying to "dispatch" a request that is already bound to a specific car.\r
\r
### Q2. Explain the SCAN (elevator) algorithm and why it's preferred over FCFS.\r
\r
SCAN has each elevator sweep in one direction, serving every pending stop along the way, and only reverses direction once nothing remains ahead of it in the current direction — much like a disk arm sweeping across cylinders. FCFS serves requests strictly in arrival order regardless of the car's position, which produces wasted travel (going up, then down, then up again for requests that arrived out of physical order) and worse average wait time under load. SCAN's guarantee — no reversal while requests remain ahead — is also what prevents starvation: a request at floor 1 while the car is at floor 9 heading down will always eventually be served on the current sweep, not indefinitely deferred.\r
\r
### Q3. How would you decide which elevator answers a hall call among several?\r
\r
Filter to elevators not out of service, then score candidates: cars already moving toward the call in the matching direction and not yet past it are strong candidates (they can pick it up "for free" on their current sweep); idle cars are next-best, scored by distance; cars moving away are worst-case fallbacks. This is exactly the kind of policy that should live behind an \`ISchedulingStrategy\` interface so it can be swapped for a fleet-aware or ETA-based algorithm without touching how any individual elevator manages its own stops.\r
\r
### Q4. How do you model an elevator's direction, and why does a naive implementation reverse too eagerly?\r
\r
Direction should be persistent state (\`Idle\`/\`Up\`/\`Down\`) on the \`Elevator\`, updated only by an explicit rule: pick a direction when transitioning from idle, and only flip it once there are no remaining requests ahead in the current direction. A naive implementation that recomputes "which way should I go" from scratch every tick based on the *nearest* remaining request will reverse as soon as the nearest pending stop happens to be behind the car — even if there are stops ahead too — causing thrashing and violating the fairness guarantee that SCAN is supposed to provide.\r
\r
### Q5. How would you prevent request starvation in this system?\r
\r
Starvation is prevented structurally by the "don't reverse while requests remain ahead" rule: any request in the car's current direction of travel is guaranteed service before the car turns around, so the worst case for any single request is one full sweep of the building. You can further bound worst-case wait by adding an aging mechanism — if a hall call has waited beyond a threshold, boost its effective priority in the scheduler so an idle-adjacent car is dispatched to it even if a "better" candidate exists elsewhere, trading a small efficiency loss for a hard latency bound.\r
\r
### Q6. How would you extend the design to support an express elevator that only stops at floors 0, 20 and 40?\r
\r
Add a floor-restriction check at the single place requests already enter the car — \`Elevator.AddRequest\` — so a destination or hall call for a non-express floor is rejected by that elevator without touching the rest of the movement logic. On the dispatch side, the \`ISchedulingStrategy\` should also skip express cars for non-express-floor hall calls, or you'll assign a call to a car that will immediately reject it. Because both checks reuse the existing entry points (\`AddRequest\`, \`SelectElevator\`), this is a small, additive change rather than new machinery.\r
\r
### Q7. What data structure would you use to store an elevator's pending requests, and why?\r
\r
A sorted set (e.g., \`SortedSet<Request>\` with a comparer on floor, or two separate sorted structures for up-requests and down-requests) gives you O(log n) insert/remove and O(1) access to the minimum/maximum floor, which is exactly what's needed to find "the next stop in the current direction" quickly. Crucially, \`Request\` must have value equality on \`(floor, type)\` so the set naturally deduplicates repeated button presses — storing requests in a plain list would let the same floor be queued twice and complicate the "have I served this stop" check.\r
\r
### Q8. Two hall calls arrive at the same instant for the same floor from two threads. How do you avoid double-dispatch?\r
\r
Serialize request ingestion through a single-writer path: either a lock around \`RequestElevator\`, or (preferred for throughput) a thread-safe queue that a single-threaded tick loop drains before any dispatch decision is made. Because \`Request\` equality already dedupes identical (floor, type) pairs at the \`Elevator.AddRequest\` level, even if the dispatcher briefly considers the same request twice, the second \`AddRequest\` call is a harmless no-op rather than a duplicate stop — a good example of value-equality doubling as a concurrency safety net.\r
\r
### Q9. How would this design change to support 100 elevators across 1000 floors?\r
\r
The per-elevator state machine (\`Step()\`) doesn't need to change at all — it already operates on one car's own queue. What must change is the dispatch strategy: scanning all 100 elevators for every hall call is wasteful, so you'd partition elevators into zones (by floor range) or maintain a lightweight index of each car's position/direction, and have the scheduler pre-filter to a small candidate set before scoring. This is the same lesson as the parking lot at scale — put scaling concerns in the orchestration/dispatch layer, keep the core unit's behavior unchanged.\r
\r
### Q10. How do you handle an elevator going out of service mid-trip?\r
\r
Transition the elevator to an \`OutOfService\` state (visible in the state machine), stop accepting new requests via \`AddRequest\`, and reassign its currently pending requests to other elevators through the same \`ElevatorController.RequestElevator\` path used for fresh hall calls — car calls from passengers already inside are the harder case, since those passengers need to be notified to disembark at the next reachable floor. This is a good moment to mention that real systems also fire an alert/maintenance ticket, which is outside the core algorithm but worth naming to show production awareness.\r
\r
### Q11. How would you unit test the scheduling strategy independently of the elevator movement logic?\r
\r
Construct a list of \`Elevator\` fakes/stubs with fixed \`CurrentFloor\` and \`Direction\` values (no real \`Step()\` calls needed), feed a \`Request\` into \`ISchedulingStrategy.SelectElevator\`, and assert which elevator comes back for a range of scenarios — an elevator already moving toward the call, all elevators idle, all elevators moving away. Separately, test \`Elevator.Step()\` in isolation by asserting the floor/direction sequence over several ticks given a fixed set of requests, with no controller involved. Because the two responsibilities never share state, they can be tested completely independently, which is the practical payoff of the design split.\r
\r
### Q12. What would you log or monitor in production for this system?\r
\r
Average and p99 wait time per hall call (time from press to elevator arrival), average and p99 travel time per car call, per-elevator utilization (percentage of ticks spent moving vs idle vs out of service), and a starvation alarm — any single request whose wait time exceeds a threshold, which should never happen if the SCAN invariant holds and would indicate a bug in the reversal logic. Logging which strategy selected which elevator for each call also makes it possible to A/B test a new \`ISchedulingStrategy\` against production traffic before fully cutting over.\r
`;export{e as default};
