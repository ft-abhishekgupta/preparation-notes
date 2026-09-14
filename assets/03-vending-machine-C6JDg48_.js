const e=`---\r
title: Design a Vending Machine\r
description: How to model the State pattern for a vending machine session, manage inventory and change calculation, and support refunds and restocking safely\r
difficulty: Core\r
tags: [vending-machine, state-pattern, inventory, payments]\r
---\r
\r
A vending machine is the textbook case for the State pattern: the same button press means something different depending on whether the machine is idle, holding money, or mid-dispense, and a hand-rolled switch statement tracking that combination rots fast.\r
\r
## Requirements\r
\r
### Functional\r
\r
- Let a user select a product, then insert money (coins and notes) toward its price.\r
- Dispense the product and any change once the inserted amount covers the price.\r
- Support cancelling mid-transaction with a full refund of inserted money.\r
- Reject selection of an out-of-stock product and surface that clearly.\r
- Support an admin restock operation that adds inventory without disrupting an active transaction.\r
\r
### Non-functional and assumptions\r
\r
- One physical transaction is active at a time — the machine serializes the whole select→insert→dispense flow.\r
- The machine holds a bank of coins for change and must refuse to dispense if it cannot make correct change.\r
- Restocking can happen concurrently (an admin refilling a live machine) and must not corrupt inventory counts mid-vend.\r
- Payment is coins/notes for this design; card/contactless should be addable without touching the state machine.\r
\r
### Clarifying questions to ask\r
\r
- What payment methods are in scope — coins and notes only, or card too?\r
- Can the user insert money before selecting a product, or only after?\r
- What happens if the machine cannot make exact change for the selected product?\r
- Should cancelling refund exact inserted coins, or just the total value?\r
- Is admin restock part of this design, or assumed to happen offline?\r
- Do we need to support multiple simultaneous machines sharing one inventory backend?\r
\r
## Core objects\r
\r
| Class | Responsibility | Key fields/methods |\r
|---|---|---|\r
| \`Product\` | A vendable item and its price | \`Id\`, \`Name\`, \`Price\` |\r
| \`Inventory\` | Tracks stock per product, atomic decrement | \`IsAvailable(id)\`, \`Decrement(id)\`, \`Restock(id, qty)\` |\r
| \`CashInventory\` | Holds coin/note stock, computes change | \`CalculateChange(amount)\`, \`Add(money)\` |\r
| \`IVendingMachineState\` | One state's behaviour for every action | \`SelectProduct\`, \`InsertMoney\`, \`Dispense\`, \`Cancel\` |\r
| \`IdleState\` / \`HasMoneyState\` / \`DispensingState\` / \`OutOfStockState\` | Concrete states | implement \`IVendingMachineState\` |\r
| \`VendingMachine\` | Context holding current state and transaction data | \`SelectedProduct\`, \`InsertedAmount\`, \`SetState(s)\` |\r
\r
## Class design\r
\r
\`\`\`mermaid\r
classDiagram\r
    class VendingMachine {\r
        -IVendingMachineState state\r
        -Inventory inventory\r
        -CashInventory cash\r
        -Product selectedProduct\r
        -decimal insertedAmount\r
        +SelectProduct(id)\r
        +InsertMoney(amount)\r
        +Dispense()\r
        +Cancel()\r
        +SetState(state)\r
    }\r
    class IVendingMachineState {\r
        <<interface>>\r
        +SelectProduct(machine, id)\r
        +InsertMoney(machine, amount)\r
        +Dispense(machine)\r
        +Cancel(machine)\r
    }\r
    class IdleState\r
    class HasMoneyState\r
    class DispensingState\r
    class OutOfStockState\r
    IVendingMachineState <|.. IdleState\r
    IVendingMachineState <|.. HasMoneyState\r
    IVendingMachineState <|.. DispensingState\r
    IVendingMachineState <|.. OutOfStockState\r
    class Inventory {\r
        -Dictionary~string, int~ quantities\r
        +bool IsAvailable(id)\r
        +void Decrement(id)\r
        +void Restock(id, qty)\r
    }\r
    class CashInventory {\r
        -Dictionary~decimal, int~ coins\r
        +List~decimal~ CalculateChange(amount)\r
    }\r
    VendingMachine --> IVendingMachineState\r
    VendingMachine --> Inventory\r
    VendingMachine --> CashInventory\r
\`\`\`\r
\r
### State machine\r
\r
\`\`\`mermaid\r
stateDiagram-v2\r
    [*] --> Idle\r
    Idle --> HasMoney: select product + insert money\r
    Idle --> OutOfStock: select an empty product\r
    HasMoney --> HasMoney: insert more money, below price\r
    HasMoney --> Dispensing: inserted amount >= price\r
    HasMoney --> Idle: cancel, refund\r
    Dispensing --> Idle: product + change dispensed\r
    OutOfStock --> Idle: restock or select another product\r
\`\`\`\r
\r
## Key design decisions\r
\r
### 1. State pattern instead of a switch statement plus boolean flags\r
\r
The naive first draft tracks \`hasSelectedProduct\`, \`hasEnoughMoney\`, \`isDispensing\` as booleans and gates every method with nested \`if\`s. That combinatorial flag-checking is exactly what the State pattern replaces.\r
\r
| Approach | What goes wrong |\r
|---|---|\r
| Booleans + one big switch per action | Every new state adds a flag and multiplies the \`if\` combinations across every method — \`InsertMoney\` has to know about states it shouldn't care about |\r
| One class per state, common interface | Each state only implements the transitions valid *from itself*; invalid actions (e.g. \`Dispense()\` while \`Idle\`) throw naturally because that state's method says so |\r
\r
> [!KEY]\r
> Rejected alternative: a single \`VendingMachine\` class with a \`TransactionStatus\` enum and a giant switch in every public method. It works for four states; it becomes unreadable the moment you add "card payment pending" or "dispensing jammed" as states, because every existing switch statement needs a new case.\r
\r
### 2. Inventory decrement is atomic, never "check-then-decrement" in two steps\r
\r
\`Inventory.Decrement(id)\` must be the same operation that verifies availability, not a \`IsAvailable()\` check followed by a separate decrement call — otherwise a restock racing with a vend (or two vend attempts in a networked multi-machine setup) can decrement below zero or double-sell the last unit.\r
\r
> [!WARNING]\r
> \`if (inventory.IsAvailable(id)) inventory.Decrement(id)\` is a classic time-of-check-to-time-of-use bug. Make \`Decrement\` itself return \`false\` if it would go negative, and treat that as the source of truth.\r
\r
### 3. Change calculation as a bounded greedy algorithm, not full optimality\r
\r
\`CashInventory.CalculateChange\` greedily takes the largest denomination it has stock of that fits the remaining amount, denomination by denomination. This is not always the minimum-coin-count solution (that would need dynamic programming), but a vending machine's denomination set (quarters, dimes, nickels, ones) makes greedy optimal in practice, and the machine must refuse the sale rather than dispense wrong change if greedy runs out of a denomination.\r
\r
| Approach | Verdict |\r
|---|---|\r
| Greedy, largest-first, fail if it can't zero out the remainder | ✅ Simple, matches real hardware, correct for canonical currency denominations |\r
| DP for guaranteed minimum coin count | ❌ Overkill — no realistic denomination set where greedy and optimal diverge, and it hides the "can't make change" case behind more code |\r
\r
> [!NOTE]\r
> A real coin mechanism can usually only dispense coins, not notes, as change. Model that by tagging each denomination in \`CashInventory\` (coin vs. note) and having \`CalculateChange\` skip note-only denominations when building change — a filter on the existing greedy loop, not a parallel type hierarchy for money.\r
\r
## Implementation\r
\r
\`\`\`csharp\r
public interface IVendingMachineState\r
{\r
    void SelectProduct(VendingMachine m, string productId);\r
    void InsertMoney(VendingMachine m, decimal amount);\r
    void Dispense(VendingMachine m);\r
    void Cancel(VendingMachine m);\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
public class IdleState : IVendingMachineState\r
{\r
    public void SelectProduct(VendingMachine m, string productId)\r
    {\r
        if (!m.Inventory.IsAvailable(productId)) { m.SetState(new OutOfStockState()); return; }\r
        m.SelectedProduct = m.Inventory.GetProduct(productId);\r
        m.SetState(new HasMoneyState());\r
    }\r
    public void InsertMoney(VendingMachine m, decimal a) =>\r
        throw new InvalidOperationException("Select a product first");\r
    public void Dispense(VendingMachine m) =>\r
        throw new InvalidOperationException("Nothing selected");\r
    public void Cancel(VendingMachine m) { }\r
}\r
\r
public class HasMoneyState : IVendingMachineState\r
{\r
    public void SelectProduct(VendingMachine m, string productId) =>\r
        throw new InvalidOperationException("Transaction in progress");\r
    public void InsertMoney(VendingMachine m, decimal amount)\r
    {\r
        m.InsertedAmount += amount;\r
        if (m.InsertedAmount >= m.SelectedProduct.Price) m.SetState(new DispensingState());\r
    }\r
    public void Dispense(VendingMachine m) =>\r
        throw new InvalidOperationException("Insufficient funds");\r
    public void Cancel(VendingMachine m) { m.RefundInserted(); m.SetState(new IdleState()); }\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
public List<decimal> CalculateChange(decimal amount)\r
{\r
    var change = new List<decimal>();\r
    foreach (var denom in _coins.Keys.OrderByDescending(d => d))\r
    {\r
        while (amount >= denom && _coins[denom] > 0)\r
        {\r
            change.Add(denom);\r
            amount -= denom;\r
            _coins[denom]--;\r
        }\r
    }\r
    if (amount > 0) throw new InvalidOperationException("Cannot make exact change");\r
    return change;\r
}\r
\`\`\`\r
\r
Worked example: a Coke costs 35 and the user inserts a 50 note; \`CalculateChange(15)\` walks denominations largest-first — two 5s and a 5 (or a 10 and a 5, depending on stock) — decrementing \`_coins\` as it goes, and only after this succeeds does \`DispensingState\` decrement inventory and hand back both the product and the change.\r
\r
## Concurrency and thread safety\r
\r
A single physical machine has one transaction at a time, so the entry points (\`SelectProduct\`, \`InsertMoney\`, \`Dispense\`, \`Cancel\`) should share one lock inside \`VendingMachine\` — the state transitions themselves are cheap, so coarse locking here costs nothing in practice and avoids two coin insertions interleaving into a corrupted \`InsertedAmount\`.\r
\r
Restocking is the interesting case: an admin can restock while a customer transaction is mid-flight. \`Inventory\` needs its own lock (or a \`ConcurrentDictionary\` with atomic increment/decrement) independent of the transaction lock, so a restock never blocks on — or corrupts — an in-progress vend. \`CashInventory\` needs the same treatment: adding inserted coins to the bank and calculating change from it must not race with a concurrent restock of the coin bank.\r
\r
> [!TIP]\r
> Say out loud: "the transaction state machine and the inventory counters are two different concurrency domains with two different locks" — that's the sentence that shows you're not just going to wrap the whole class in one \`lock(this)\` and call it done.\r
\r
## Extending the design\r
\r
| New requirement | Where it plugs in | Why the design allows it |\r
|---|---|---|\r
| Card/contactless payment | New \`IPaymentMethod\` abstraction behind \`InsertMoney\` | State classes call an abstraction, not "coins" directly |\r
| Multiple slots mapping to one product code | \`Inventory\` keyed by slot, \`Product\` looked up by code | Slot-to-product is already a lookup, not identity |\r
| Low-stock telemetry/alerts | Observer on \`Inventory.Decrement\` | Decrement is already the single choke point for stock changes |\r
| Multi-currency support | \`CashInventory\` parameterized by currency, \`Product.Price\` becomes currency-aware | Change calculation is already isolated in one class |\r
| Promo codes / loyalty discounts | A decorator/strategy applied to \`Product.Price\` before \`HasMoneyState\` compares it | Price comparison is already centralized in one state transition |\r
| Admin cash collection/refill | \`CashInventory.CollectAll()\` drains the coin bank under its own lock | Cash bank is already isolated from the transaction lock, so collection never blocks a live sale |\r
\r
## Cheat sheet\r
\r
- Four core states: Idle, HasMoney, Dispensing, OutOfStock — model each as a class, not a flag combination.\r
- Every state implements the same interface; invalid actions in a state throw from that state's own method.\r
- Inventory decrement must be atomic with the availability check — never split into two calls.\r
- Change calculation is greedy by denomination and must fail loudly if it can't zero out the remainder.\r
- Cancel must fully refund \`InsertedAmount\` and reset to Idle — don't leave partial state behind.\r
- Transaction state and inventory/cash counters are separate concurrency domains — lock them independently.\r
- Restock must work while a transaction is live, without corrupting or blocking either side.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Boolean flags (\`hasSelected\`, \`hasEnoughMoney\`) instead of state classes | Extract one class per state implementing a shared interface |\r
| \`IsAvailable()\` check followed by a separate \`Decrement()\` call | Make decrement itself atomic and return success/failure |\r
| Dispensing without verifying change can be made | Run \`CalculateChange\` before committing to dispense; refuse the sale if it fails |\r
| One lock around the entire machine including inventory | Separate the transaction lock from the inventory/cash locks |\r
| Cancel that doesn't reset \`InsertedAmount\` to zero | Always refund and clear transaction fields on cancel |\r
| Hardcoding coin/note logic inside \`VendingMachine\` | Isolate it in \`CashInventory\` so payment methods can be swapped |\r
\r
## Summary\r
\r
A vending machine's value as an interview problem is almost entirely about the State pattern: four states, one shared interface, and each state only knows the transitions valid from itself, which eliminates the flag-combination mess a naive design produces. Layer atomic inventory decrement and a greedy-with-fallback change calculator on top, keep the transaction lock separate from the inventory lock, and the design extends cleanly to card payments, multi-slot inventory and promotions without touching the state machine itself.\r
\r
## Top Interview Questions\r
\r
### Q1. Why is the State pattern a better fit here than a set of boolean flags?\r
\r
Boolean flags (\`hasSelectedProduct\`, \`hasEnoughMoney\`, \`isDispensing\`) force every method to reason about every combination of flags that could be true at once, and adding a new state means auditing every existing method for a missed case. The State pattern instead gives each state its own class implementing a shared interface, so \`HasMoneyState.SelectProduct()\` can simply throw "transaction in progress" without needing to know anything about \`DispensingState\` or \`OutOfStockState\`. Adding a new state is now an additive change — one new class — instead of an edit to every existing method.\r
\r
### Q2. Walk through what happens, state by state, when a user selects a product, inserts insufficient money, then cancels.\r
\r
Starting in \`Idle\`, \`SelectProduct\` checks \`Inventory.IsAvailable\`, finds stock, sets \`SelectedProduct\`, and transitions to \`HasMoneyState\`. The user calls \`InsertMoney\` with an amount less than the price; \`HasMoneyState.InsertMoney\` adds it to \`InsertedAmount\` but the total is still below \`SelectedProduct.Price\`, so the state remains \`HasMoneyState\`. The user then calls \`Cancel\`; \`HasMoneyState.Cancel\` invokes \`RefundInserted()\` to return the full \`InsertedAmount\`, clears the transaction fields, and transitions back to \`IdleState\`. No inventory was ever decremented, because decrement only happens on a successful dispense.\r
\r
### Q3. How do you prevent selling the last unit of a product to two near-simultaneous requests?\r
\r
Make \`Inventory.Decrement(productId)\` a single atomic operation that both checks and mutates — for example, guarded by a lock or implemented with a \`ConcurrentDictionary\` and a compare-and-swap loop — rather than calling \`IsAvailable()\` and then \`Decrement()\` as two separate steps. If the check and the mutation are separate, two threads can both pass the check before either decrements, resulting in a negative or oversold count. The atomic version returns \`false\` from \`Decrement\` itself if stock would go negative, and the caller treats that as "sold out," even if \`IsAvailable\` said yes a moment earlier.\r
\r
### Q4. How does the change calculation work, and what should happen if exact change isn't possible?\r
\r
\`CashInventory.CalculateChange\` walks denominations from largest to smallest, greedily taking as many of each as it has in stock and as fit into the remaining amount, decrementing the coin bank as it goes. If, after exhausting all denominations, the remaining amount is still above zero, the machine must refuse to dispense — reverting any tentative coin bank changes — rather than shortchange the customer or dispense the product without full change. This should be checked *before* committing to \`DispensingState\`, so a failed change calculation can fall back to a refund instead of a broken transaction.\r
\r
### Q5. Why is greedy sufficient for change-making here, when the general coin-change problem needs dynamic programming?\r
\r
Greedy fails to find the optimal (fewest-coin) solution only for denomination sets that aren't "canonical" — for example, {1, 3, 4} where making 6 greedily gives 4+1+1 (three coins) instead of the optimal 3+3 (two coins). Real currency denominations (quarters, dimes, nickels, pennies; or bills like 20/10/5/1) are canonical, meaning greedy always finds the minimum number of coins. A vending machine only ever deals with real currency, so greedy is both correct and far simpler to reason about and debug than a DP table, and it maps directly onto how a physical coin dispenser mechanism actually works.\r
\r
### Q6. How would you add support for card payments without rewriting the state machine?\r
\r
Introduce an \`IPaymentMethod\` abstraction (e.g., \`CashPayment\`, \`CardPayment\`) that both produce an "amount authorized" signal consumed by the same \`HasMoneyState.InsertMoney\`-equivalent transition. The state machine's job is only to compare \`InsertedAmount\` (or \`AuthorizedAmount\`) against \`SelectedProduct.Price\` and transition accordingly — it never needs to know whether the money came from coins or a card. Card payments add complexity around authorization holds and capture/void semantics, but that complexity lives entirely inside the payment abstraction, not in the state classes.\r
\r
### Q7. What happens to inventory and cash if the machine loses power mid-dispense?\r
\r
This is the machine's equivalent of the ATM's "failure mid-dispense" problem: if \`Inventory.Decrement\` already committed but the physical dispense mechanism jammed, the machine now thinks it sold an item it didn't deliver. The fix is the same pattern used elsewhere — don't treat "decrement inventory" and "physically dispense" as one atomic step; log an intent ("dispensing product X, transaction Y") before actuating the mechanism, and on restart, reconcile: if the intent log shows a dispense started but never confirmed complete, flag that transaction for manual review rather than silently trusting the inventory count.\r
\r
### Q8. How would you unit test the state machine without a real vending machine?\r
\r
Instantiate \`VendingMachine\` with fake \`Inventory\` and \`CashInventory\` implementations (or a real in-memory version pre-seeded with known stock), then drive it through a sequence of calls — \`SelectProduct\`, \`InsertMoney\`, \`Dispense\`/\`Cancel\` — asserting both the resulting state (via a testable \`CurrentStateName\` or by asserting which action would throw next) and side effects (inventory decremented, cash bank updated, correct change returned). Because each state class only implements the interface methods valid for it, you can also unit test each state in isolation by calling its methods directly with a mock \`VendingMachine\`, asserting it throws for invalid actions and transitions correctly for valid ones.\r
\r
### Q9. How would you support an admin restocking a machine while a customer transaction is in progress?\r
\r
Give \`Inventory\` and \`CashInventory\` their own internal locks (or concurrent collections), independent of whatever lock guards the transaction state machine in \`VendingMachine\`. A restock call only needs to safely add to the quantity/coin counts; it never touches \`SelectedProduct\` or \`InsertedAmount\`, which belong to the transaction lock's domain. As long as the two locks never nest in a way that risks deadlock (restock never waits on the transaction lock and vice versa), the two operations can proceed fully in parallel without corrupting either counter.\r
\r
### Q10. What's the difference between "out of stock" as a global machine state versus a per-product condition?\r
\r
Modeling \`OutOfStockState\` as a state the whole \`VendingMachine\` enters is subtly wrong if the machine stocks multiple products — one empty slot shouldn't block purchases of a different, in-stock product. The better design treats "out of stock" as a per-product check inside \`IdleState.SelectProduct\` (reject that specific selection, stay in \`Idle\`) and reserves a machine-wide \`OutOfStockState\` only for the degenerate case where every slot is empty. This is a good example of a state diagram looking clean on a whiteboard but needing a second look once you ask "does this apply to the whole machine or just one row?"\r
\r
### Q11. How would you extend this design to support promotional discounts or loyalty pricing?\r
\r
Wrap \`Product.Price\` behind a pricing step evaluated once, at selection time — a \`IPricingPolicy.GetPrice(product, customerContext)\` call inside (or just before) \`HasMoneyState\`'s comparison — rather than scattering discount \`if\`s across \`InsertMoney\`. This mirrors the Strategy pattern used for parking and elevator pricing/scheduling: the state machine still only ever compares "inserted amount" to "current price," it just no longer assumes price is a static field lookup.\r
\r
### Q12. Why put the change calculation inside \`CashInventory\` rather than inside \`DispensingState\`?\r
\r
\`CashInventory\` owns the coin bank's data (which denominations, how many of each), so the logic that reasons about that data — greedy selection, decrementing counts, detecting an unmakeable amount — belongs with the data it mutates, following encapsulation rather than reaching into another object's internals. \`DispensingState\` should only orchestrate: ask \`CashInventory\` for change, and either proceed to dispense-and-transition-to-Idle on success, or fall back to a refund path on failure. This separation also means \`CashInventory\` can be unit tested purely on coin-counting logic, with zero dependency on the state machine at all.\r
`;export{e as default};
