const e=`---\r
title: Design a Shopping Cart\r
description: How to model cart line items, compose discount rules with Strategy and Chain of Responsibility, and make checkout idempotent under retries\r
difficulty: Core\r
tags: [shopping-cart, strategy-pattern, chain-of-responsibility, e-commerce]\r
---\r
\r
A shopping cart looks like CRUD on a list until the pricing pipeline shows up: stacking discounts, tax and currency all have to compose predictably, inventory can't be reserved too early or too late, and checkout has to survive a double-click or a network retry without charging twice.\r
\r
## Requirements\r
\r
### Functional\r
\r
- Add, remove and update the quantity of line items in a cart.\r
- Compute a price via a pipeline: subtotal → discounts → tax → total.\r
- Support multiple discount rules with a defined precedence for stacking vs. mutual exclusion.\r
- Reserve inventory at checkout time, not the moment an item is added to the cart.\r
- Merge a guest cart into a logged-in user's cart on login.\r
- Persist the cart with an expiry so abandoned carts are cleaned up.\r
- Make checkout idempotent — a retried checkout request must never double-charge or double-reserve stock.\r
\r
### Non-functional and assumptions\r
\r
- Currency and tax rules vary by region and must be pluggable, not hardcoded.\r
- The same cart may be edited from multiple devices/tabs for one user; concurrent edits should not silently drop an item.\r
- Checkout calls external payment and inventory services that must be treated as untrusted boundaries, exactly like the ATM's account service.\r
- Cart data has a TTL — an abandoned cart is not kept forever.\r
\r
### Clarifying questions to ask\r
\r
- Can discounts stack (e.g., 10% off *and* free shipping), or are some mutually exclusive?\r
- Is inventory reserved when an item is added to the cart, or only at checkout?\r
- Do we need guest-cart support with merge-on-login?\r
- What's the expected TTL / abandoned-cart cleanup behaviour?\r
- Is multi-currency and region-based tax in scope?\r
- What does "idempotent checkout" mean operationally — same request id twice returns the same order, not a second charge?\r
\r
## Core objects\r
\r
| Class | Responsibility | Key fields/methods |\r
|---|---|---|\r
| \`Cart\` | Holds line items for a user or guest session | \`Items\`, \`ExpiresAt\`, \`AddItem\`, \`Merge\` |\r
| \`CartItem\` | One product line in the cart | \`ProductId\`, \`Quantity\`, \`UnitPrice\` |\r
| \`IDiscountRule\` | One composable pricing adjustment | \`Apply(PriceBreakdown current) -> PriceBreakdown\` |\r
| \`PricingPipeline\` | Chains discount rules, then applies tax | \`Price(cart) -> PriceBreakdown\` |\r
| \`ITaxStrategy\` | Region-specific tax calculation | \`CalculateTax(amount, region)\` |\r
| \`PriceBreakdown\` | Running/result totals through the pipeline | \`Subtotal\`, \`DiscountTotal\`, \`Tax\`, \`Total\` |\r
| \`InventoryReservationService\` | Atomic stock reservation at checkout | \`TryReserve(productId, qty, idempotencyKey)\`, \`Release(productId, qty)\` |\r
| \`CheckoutService\` | Orchestrates pricing, reservation, payment | \`Checkout(cart, idempotencyKey) -> OrderResult\` |\r
\r
## Class design\r
\r
\`\`\`mermaid\r
classDiagram\r
    class Cart {\r
        -string UserId\r
        -List~CartItem~ Items\r
        -DateTime ExpiresAt\r
        +AddItem(productId, qty)\r
        +RemoveItem(productId)\r
        +Merge(otherCart)\r
    }\r
    class CartItem {\r
        -string ProductId\r
        -int Quantity\r
        -decimal UnitPrice\r
    }\r
    class IDiscountRule {\r
        <<interface>>\r
        +PriceBreakdown Apply(PriceBreakdown current)\r
    }\r
    class PercentOffRule\r
    class FreeShippingRule\r
    class BulkQuantityRule\r
    IDiscountRule <|.. PercentOffRule\r
    IDiscountRule <|.. FreeShippingRule\r
    IDiscountRule <|.. BulkQuantityRule\r
    class PricingPipeline {\r
        -List~IDiscountRule~ rules\r
        -ITaxStrategy tax\r
        +PriceBreakdown Price(Cart cart)\r
    }\r
    class PriceBreakdown {\r
        -decimal Subtotal\r
        -decimal DiscountTotal\r
        -decimal Tax\r
        -decimal Total\r
    }\r
    class ITaxStrategy {\r
        <<interface>>\r
        +decimal CalculateTax(decimal amount, string region)\r
    }\r
    class InventoryReservationService {\r
        +bool TryReserve(string productId, int qty, string idempotencyKey)\r
        +void Release(string productId, int qty)\r
    }\r
    class CheckoutService {\r
        -PricingPipeline pricing\r
        -InventoryReservationService inventory\r
        +OrderResult Checkout(Cart cart, string idempotencyKey)\r
    }\r
    Cart "1" --> "*" CartItem\r
    PricingPipeline "1" --> "*" IDiscountRule\r
    PricingPipeline --> ITaxStrategy\r
    PricingPipeline --> PriceBreakdown\r
    CheckoutService --> PricingPipeline\r
    CheckoutService --> InventoryReservationService\r
\`\`\`\r
\r
### Pricing pipeline as a chain\r
\r
\`\`\`mermaid\r
flowchart LR\r
    C["Cart subtotal"] --> R1["PercentOffRule"]\r
    R1 --> R2["BulkQuantityRule"]\r
    R2 --> R3["FreeShippingRule"]\r
    R3 --> T["Tax by region"]\r
    T --> TOT["Final total"]\r
\`\`\`\r
\r
A worked example makes the ordering concrete: a $1,000 cart with an item-level 20%-off electronics coupon (capped at $200), a $50 flat cart coupon, free shipping above $500, and 18% tax.\r
\r
| Stage | Amount | Running total |\r
|---|---|---|\r
| Subtotal | — | 1000 |\r
| Item discount (20% off, capped) | -200 | 800 |\r
| Cart discount (flat coupon) | -50 | 750 |\r
| Shipping (free over 500) | +0 | 750 |\r
| Tax (18% of discounted total) | +135 | 885 |\r
\r
Tax is always computed on the post-discount amount, never the original subtotal — taxing the pre-discount amount overcharges the customer and is one of the most common bugs in cart implementations.\r
\r
## Key design decisions\r
\r
### 1. Pricing as Strategy rules composed via Chain of Responsibility\r
\r
Each discount is its own \`IDiscountRule\` implementing \`Apply(PriceBreakdown) -> PriceBreakdown\`; \`PricingPipeline\` runs an ordered list of them, each rule reading and returning an updated running total, then hands the result to \`ITaxStrategy\`.\r
\r
| Approach | What goes wrong |\r
|---|---|\r
| One \`CalculateTotal\` method with nested \`if\`s for every promo combination | Adding a new promotion means editing a method that already has to know about every other promotion — combinatorial complexity |\r
| \`IDiscountRule\` per promotion, chained in a \`PricingPipeline\` | ✅ New promotion = new class appended to (or inserted into) the chain; existing rules are untouched |\r
\r
> [!KEY]\r
> Rejected alternative: a \`switch\` on \`PromotionType\` inside \`Cart.GetTotal()\`. It's the same trap as the vending machine and library policy examples — one growing method instead of independently testable, composable units.\r
\r
### 2. Explicit precedence and stacking rules for the chain\r
\r
Order matters: a percentage-off rule applied before a flat-amount rule gives a different total than the reverse. \`PricingPipeline\` runs rules in a defined, documented order, and each rule can be marked \`Stackable\` or \`ExclusiveGroup\` so mutually-exclusive promotions ("use the better of these two, not both") don't silently combine.\r
\r
| Rule type | Stacking behaviour |\r
|---|---|\r
| Percent-off + free shipping | Stack — independent effects |\r
| Two competing "20% off" vs "$10 off" coupons | Exclusive — pipeline picks the one yielding the lower total for the customer, others are skipped |\r
| Bulk-quantity discount | Stacks with coupons, but is evaluated first so later percentage rules apply to the already-reduced price |\r
\r
### 3. Inventory reservation at checkout, not at add-to-cart\r
\r
Adding an item to a cart never touches inventory — reservation only happens when \`CheckoutService.Checkout\` runs, using the same atomic-claim pattern as the parking lot and movie booking (\`TryReserve\`, succeed or fail per unit, roll back partial reservations on any failure).\r
\r
> [!WARNING]\r
> Reserving stock the moment an item is added to a cart looks safer but isn't: abandoned carts (the majority of carts, in practice) would lock up real inventory indefinitely unless paired with the same short-TTL-hold machinery used for seat booking — and even then, you've just rebuilt the seat-hold problem for every product in the catalogue for no benefit.\r
\r
### 4. Idempotent checkout via a caller-supplied idempotency key\r
\r
\`Checkout(cart, idempotencyKey)\` — the same key resubmitted (due to a client retry or a double-click) returns the original order result rather than creating a second order, charging payment twice, or double-reserving stock.\r
\r
> [!DANGER]\r
> Rejected alternative: relying on the client to "just not click twice." Network retries happen below the user's control (a proxy timeout retrying a POST, a mobile app resubmitting after a dropped connection) — idempotency has to be enforced server-side by deduplicating on a key, not by trusting client behaviour.\r
\r
## Implementation\r
\r
\`\`\`csharp\r
public interface IDiscountRule\r
{\r
    PriceBreakdown Apply(PriceBreakdown current);\r
}\r
\r
public class PercentOffRule : IDiscountRule\r
{\r
    private readonly decimal _percent;\r
    public PercentOffRule(decimal percent) => _percent = percent;\r
\r
    public PriceBreakdown Apply(PriceBreakdown current)\r
    {\r
        var discount = current.Subtotal * (_percent / 100m);\r
        return current with { DiscountTotal = current.DiscountTotal + discount };\r
    }\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
public class PricingPipeline\r
{\r
    private readonly List<IDiscountRule> _rules;\r
    private readonly ITaxStrategy _tax;\r
\r
    public PriceBreakdown Price(Cart cart, string region)\r
    {\r
        var breakdown = new PriceBreakdown { Subtotal = cart.Items.Sum(i => i.UnitPrice * i.Quantity) };\r
        breakdown = _rules.Aggregate(breakdown, (current, rule) => rule.Apply(current));\r
\r
        var taxable = breakdown.Subtotal - breakdown.DiscountTotal;\r
        breakdown = breakdown with { Tax = _tax.CalculateTax(taxable, region) };\r
        return breakdown with { Total = taxable + breakdown.Tax };\r
    }\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
public class CheckoutService\r
{\r
    private readonly ConcurrentDictionary<string, OrderResult> _completedByKey = new();\r
\r
    public OrderResult Checkout(Cart cart, string idempotencyKey, string region)\r
    {\r
        if (_completedByKey.TryGetValue(idempotencyKey, out var existing))\r
            return existing; // replay — do not charge or reserve again\r
\r
        // Reserve every line, rolling back everything reserved so far on the first failure —\r
        // a partial reservation must never survive a failed checkout attempt.\r
        var reserved = new List<CartItem>();\r
        try\r
        {\r
            foreach (var item in cart.Items)\r
            {\r
                if (!_inventory.TryReserve(item.ProductId, item.Quantity, idempotencyKey))\r
                    throw new InvalidOperationException($"Out of stock: {item.ProductId}");\r
                reserved.Add(item);\r
            }\r
\r
            var price = _pricing.Price(cart, region);\r
            var payment = _payments.Charge(price.Total, idempotencyKey);\r
            if (!payment.Success)\r
                throw new InvalidOperationException("Payment failed");\r
\r
            var result = new OrderResult(Guid.NewGuid().ToString(), price, payment.Success);\r
            _completedByKey[idempotencyKey] = result;\r
            cart.Clear();\r
            return result;\r
        }\r
        catch\r
        {\r
            foreach (var item in reserved)\r
                _inventory.Release(item.ProductId, item.Quantity);\r
            throw;\r
        }\r
    }\r
}\r
\`\`\`\r
\r
## Concurrency and thread safety\r
\r
Cart edits from multiple devices for the same user are the everyday case — a user adds an item on mobile, then opens the desktop site. A simple, honest approach is last-write-wins per line item with an optimistic version on the whole cart: each update includes the version it read, and a stale write either merges (increment quantity) or is rejected and retried against the latest version, rather than silently overwriting a concurrent addition.\r
\r
Checkout concurrency is where correctness really matters, and it reuses two patterns already established elsewhere in this series: \`InventoryReservationService.TryReserve\` must be an atomic per-unit claim (never check-then-decrement in two steps), and \`CheckoutService\` must dedupe on the idempotency key *before* doing anything with side effects — reservation and payment both — so a retried request is a pure read of the cached result, not a re-execution.\r
\r
\`TryReserve\` is typically one conditional update at the storage layer rather than a read followed by a write, so two simultaneous checkouts for the last unit can't both succeed:\r
\r
\`\`\`sql\r
UPDATE stock SET qty = qty - :n WHERE product_id = :id AND qty >= :n;\r
-- zero rows affected => out of stock, treat as a reservation failure\r
\`\`\`\r
\r
An optimistic version column on the stock row works just as well and is easier to combine with an audit trail; row-level pessimistic locks are simpler to reason about but reduce throughput on hot SKUs during a flash sale.\r
\r
> [!TIP]\r
> Guest-to-user cart merge has its own race: a user adds items to a guest cart in one tab while logging in (triggering a merge) in another. Make the merge itself a single transactional operation reading both carts' current versions and writing the merged result atomically, so an in-flight guest-cart addition isn't silently lost mid-merge.\r
\r
## Extending the design\r
\r
| New requirement | Where it plugs in | Why the design allows it |\r
|---|---|---|\r
| Multi-currency support | \`ITaxStrategy\` and \`CartItem.UnitPrice\` become currency-aware | Tax and pricing were already isolated behind interfaces |\r
| B2B bulk pricing tiers | New \`IDiscountRule\` keyed on account type | Discounts are already composable, pluggable units |\r
| Saved-for-later list | A second list on \`Cart\` with its own lifecycle, no pricing pipeline changes | Pricing only ever operates on active \`Items\`, not on the cart's full structure |\r
| Bundle pricing (buy A+B, get a bundled price) | A \`BundleDiscountRule\` inspecting multiple line items at once | Rules already receive the whole \`PriceBreakdown\`/cart context, not just one item |\r
| Abandoned-cart email trigger | A listener on cart TTL expiry, independent of pricing/checkout | Cart persistence and expiry are already a separate concern from pricing |\r
\r
## Cheat sheet\r
\r
- Pricing is a pipeline: subtotal → discount rules (Strategy, chained) → tax → total. Never one big method.\r
- Give the chain explicit ordering and stacking rules — "which discounts combine" is a business decision, not an accident of code order.\r
- Reserve inventory at checkout, not at add-to-cart — carts are abandoned far more often than they convert.\r
- Checkout must be idempotent: dedupe on a caller-supplied key before touching payment or inventory, not after.\r
- Cart concurrency: optimistic version per cart, last-write-wins per line item, explicit conflict handling on merge.\r
- Guest-to-user cart merge is itself a concurrency-sensitive operation — treat it as one atomic step, not two.\r
- Tax and currency live behind their own strategy interfaces so region rules don't leak into pricing logic.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| One method with nested \`if\`s for every promotion combination | \`IDiscountRule\` per promotion, chained through \`PricingPipeline\` |\r
| Reserving inventory the moment an item is added to the cart | Reserve only at checkout, using an atomic claim |\r
| Trusting the client not to double-submit checkout | Server-side idempotency key deduplication |\r
| Silent last-write-wins overwriting a concurrent cart edit with no conflict signal | Optimistic versioning with explicit merge/retry on conflict |\r
| Hardcoding tax rate inline in the total calculation | Extract \`ITaxStrategy\` per region |\r
| Computing tax on the pre-discount subtotal | Tax the amount left *after* discounts, always |\r
| Treating guest-cart merge as "just append the lists" | Make merge one atomic, version-checked operation |\r
| Leaving earlier reservations in place when a later line item in the same checkout fails | Track what has been reserved so far and release it all on any failure |\r
\r
## Summary\r
\r
A shopping cart's difficulty is almost entirely about composition and safety, not the cart data structure itself: discounts need to combine predictably (Strategy rules chained through a pipeline, with explicit stacking rules), inventory must not be reserved before a customer is actually committing to buy, and checkout must be safe to retry without financial or stock consequences. Get the pricing pipeline, the reservation timing, and the idempotency key right, and multi-currency, bundle pricing and B2B tiers all slot in as new rules rather than rewrites of the checkout path.\r
\r
## Top Interview Questions\r
\r
### Q1. Why use Strategy plus Chain of Responsibility for pricing instead of one method that computes the final total?\r
\r
Discounts are independently defined business rules that need to combine in a specific, sometimes changing order — a single method with nested conditionals for every combination of active promotions becomes unmaintainable the moment a third or fourth promotion exists, since every new rule has to be reasoned about against every existing one. Modeling each discount as an \`IDiscountRule\` (Strategy) and running them through an ordered \`PricingPipeline\` (Chain of Responsibility) means each rule only implements its own effect on a running total, new rules are purely additive, and the order/stacking policy is an explicit, inspectable list rather than implicit in nested \`if\` branches.\r
\r
### Q2. How do you decide whether two discounts should stack or be mutually exclusive?\r
\r
This is fundamentally a business/product decision, not a technical one, but the pipeline needs a mechanism to express it: tag rules with a stacking category (e.g., \`Stackable\` vs. belonging to an \`ExclusiveGroup\`), and have the pipeline, when evaluating an exclusive group, compute the result of each competing rule independently and keep only the one that benefits the customer most (or whichever the business rule specifies — sometimes it's "first applicable," sometimes "best for the customer"). The key design point is that this policy lives in the pipeline's orchestration logic, not scattered as ad hoc checks inside individual rule implementations, which would make the interaction between any two rules something you'd have to trace through both classes to understand.\r
\r
### Q3. Why should inventory be reserved at checkout rather than when an item is added to the cart?\r
\r
The overwhelming majority of shopping carts are abandoned, not converted — reserving real stock the instant something is added would lock up inventory for potentially unlimited time against sales that never happen, effectively making "add to cart" indistinguishable from "buy," which is not what the feature is for. Reserving only at checkout, backed by an atomic claim, means inventory is only taken out of the sellable pool for the short, bounded duration of an active checkout attempt — the same reasoning that justifies short-TTL seat holds in the movie booking system, just without needing an expiry TTL here since checkout is typically a single, short synchronous flow rather than a multi-minute payment wait.\r
\r
### Q4. How do you guarantee checkout is idempotent under client retries?\r
\r
The client supplies (or the server generates and returns to the client for reuse) an idempotency key unique to one checkout attempt. \`CheckoutService.Checkout\` checks a store of completed results keyed by that value *before* doing anything else — before reserving inventory, before charging payment — and if a match exists, simply returns the previously computed \`OrderResult\` without re-executing any side effect. This must be checked first, atomically, relative to the side-effecting operations, or a race between two near-simultaneous retries could still slip both past the check before either commits its result.\r
\r
### Q5. A user adds an item to their cart on their phone while simultaneously removing a different item on their laptop. How do you avoid losing one of these changes?\r
\r
Treat the cart as a versioned object: each read returns the current version number alongside the items, and each write includes the version it was based on. If both devices read version 5 and both attempt to write version 6, only the first write to arrive succeeds in advancing the version; the second is rejected as a conflict and either automatically retried by re-reading the now-current cart and reapplying its specific line-item change (add X / remove Y are commutative operations that can usually be replayed safely), or surfaced to the client to refresh and reapply. Naive last-write-wins on the whole cart object would silently discard one device's change entirely, which is the bug this versioning avoids.\r
\r
### Q6. How would you merge a guest cart into a user's existing cart on login, and what could go wrong?\r
\r
Merging should be a single atomic operation: read both carts' current versions, compute the merged item list (typically summing quantities for shared products), and write the result while checking that neither source cart changed since it was read — if either did (e.g., the user added something to the guest cart in a race with the login/merge itself), retry the merge with fresh data rather than silently dropping the newly added item. The most common bug is treating merge as "read guest cart, read user cart, write combined list" as three separate, non-transactional steps, which loses any edit that happens to land in between them.\r
\r
### Q7. Why isolate tax calculation behind an \`ITaxStrategy\` instead of computing it inline in the pricing pipeline?\r
\r
Tax rules vary by region, by product category in some jurisdictions, and change independently of promotional pricing logic — baking a specific region's tax formula directly into the pricing pipeline couples unrelated concerns and makes supporting a second region or a tax-exemption rule require editing code that has nothing to do with tax. \`ITaxStrategy.CalculateTax(amount, region)\` keeps that variability behind one seam, so \`PricingPipeline\` only needs to know "apply tax to the post-discount amount," not the specifics of any jurisdiction's rules.\r
\r
### Q8. How would you add a "buy one get one free" or bundle discount to this pipeline?\r
\r
Introduce a \`BundleDiscountRule\` implementing the same \`IDiscountRule\` interface, but unlike a simple percent-off rule, it needs visibility into the cart's individual line items (not just the running subtotal) to detect qualifying combinations — so either \`IDiscountRule.Apply\` is given the cart's items alongside the running \`PriceBreakdown\`, or bundle-style rules are given a slightly richer context object. This is a good moment to note a real design trade-off: if most rules only need the running total but a few need line-item detail, you either widen the interface for everyone or introduce a second, more specific rule interface for line-item-aware discounts — worth discussing both options with an interviewer rather than picking silently.\r
\r
### Q9. What's the risk of computing the checkout total once on the client and trusting it at payment time?\r
\r
Never trust a client-supplied total — prices, discounts and tax must always be recomputed server-side from the authoritative \`PricingPipeline\` at the moment of checkout, using current prices and currently valid promotions, because a client-supplied amount can be tampered with (browser dev tools, a modified mobile app request) to pay less than the real total. The server should treat the client's cart as *which items and quantities*, and always independently derive the price to charge — this is a basic but frequently-missed integrity requirement in e-commerce systems.\r
\r
### Q10. How would you handle an item's price changing while it sits in a customer's cart?\r
\r
Decide and document a policy: either the cart always reflects the current catalogue price at checkout time (simpler, and what most retailers actually do — the price shown in the cart is a preview, not a lock), or the cart "locks in" the price at add-to-cart time for some bounded duration (more customer-friendly, more complex to reconcile with inventory and promotions that may have also changed). Whichever is chosen, \`PricingPipeline.Price\` should make the source of the unit price explicit — either always reading \`Product.CurrentPrice\` fresh, or reading a \`CartItem.LockedPrice\` if one was captured — rather than leaving it ambiguous which one \`CartItem.UnitPrice\` actually represents.\r
\r
### Q11. How would you test the discount pipeline in isolation from checkout and inventory?\r
\r
Construct a \`PricingPipeline\` with a fixed, known list of \`IDiscountRule\` instances (including simple test doubles that apply a fixed, predictable adjustment) and a stub \`ITaxStrategy\`, then call \`Price(cart, region)\` against hand-built carts, asserting the exact \`Subtotal\`, \`DiscountTotal\`, \`Tax\` and \`Total\` values for each scenario — no discount stacking, full stacking, an exclusive-group conflict between two rules, a bulk-quantity threshold boundary. Because the pipeline has no dependency on inventory or payment, every pricing edge case (including negative-total protection, e.g., a discount that would exceed the subtotal) can be tested purely as arithmetic assertions.\r
\r
### Q12. What would you monitor in production for a shopping cart and checkout system?\r
\r
Cart abandonment rate and average time-to-abandon (informs TTL tuning), checkout success rate and the specific failure reason breakdown (payment declined vs. inventory unavailable vs. idempotency replay), average pricing pipeline latency (a chain with too many rules or an expensive tax lookup can slow down every checkout), and a correctness alarm for any detected double-charge or double-reservation for the same idempotency key — the last one should be a page-worthy incident, since it indicates the core idempotency guarantee has failed.\r
`;export{e as default};
