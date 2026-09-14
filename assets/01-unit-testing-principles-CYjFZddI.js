const e=`---\r
title: Unit Testing Principles\r
description: The rules that make unit tests fast, trustworthy and cheap to maintain, with C# and xUnit examples of each principle in practice\r
difficulty: Foundational\r
tags: [unit-testing, xunit, csharp, test-design]\r
---\r
\r
Anyone can write a test that passes today. The interview question underneath "do you write unit tests" is really "do you write unit tests that stay useful in six months, survive a refactor, and fail with a message that tells you exactly what broke".\r
\r
## What a "unit" actually is\r
\r
A unit is **a piece of behaviour**, not a class or a method. A single public method can require several tests to describe its behaviour fully, and a single test can legitimately span several private methods reached through one public entry point. The line is drawn at the *public contract* you're willing to keep stable — not at "one class equals one test class" mechanically.\r
\r
> [!KEY]\r
> Test the behaviour visible through the public API. If you can rename or restructure private methods without changing what the caller observes, your tests should not need to change either.\r
\r
\`\`\`mermaid\r
flowchart TD\r
    T["Unit test"] --> P["Public contract<br/>(methods, thrown exceptions, return values)"]\r
    P -.->|"never reach in directly"| H1["Private helper A"]\r
    P -.->|"never reach in directly"| H2["Private helper B"]\r
    H1 --> R["Observable result"]\r
    H2 --> R\r
    R --> T\r
\`\`\`\r
\r
## Arrange-Act-Assert\r
\r
\`\`\`mermaid\r
flowchart LR\r
    A["Arrange<br/>set up inputs and doubles"] --> B["Act<br/>call the behaviour once"]\r
    B --> C["Assert<br/>verify one logical outcome"]\r
    C --> D{"Test fails"}\r
    D -->|"Clear message"| E["Bug located in seconds"]\r
    D -->|"Vague message"| F["Rewrite the assertion"]\r
\`\`\`\r
\r
The near-universal structure for a unit test's body. It separates setup, the action under test, and the check, so a reader can scan a test in seconds.\r
\r
\`\`\`csharp\r
[Fact]\r
public void ApplyDiscount_ReducesTotalByTenPercent_WhenOrderExceedsThreshold()\r
{\r
    // Arrange\r
    var order = new Order(total: 200m);\r
    var calculator = new DiscountCalculator(threshold: 100m, rate: 0.10m);\r
\r
    // Act\r
    var discounted = calculator.Apply(order);\r
\r
    // Assert\r
    Assert.Equal(180m, discounted.Total);\r
}\r
\`\`\`\r
\r
Keep the sections visually separated (blank line or comment) even in a three-line test — it's a habit that pays off the moment the test grows.\r
\r
## One logical assertion per test\r
\r
"One assertion" doesn't mean literally one \`Assert.*\` call — it means one **reason to fail**. Asserting several properties of the *same resulting object* is fine; asserting unrelated behaviours in one test is not.\r
\r
\`\`\`csharp\r
// Fine — all assertions describe one outcome: the created order\r
[Fact]\r
public void CreateOrder_SetsExpectedDefaults()\r
{\r
    var order = Order.Create(customerId: 42);\r
\r
    Assert.Equal(42, order.CustomerId);\r
    Assert.Equal(OrderStatus.Pending, order.Status);\r
    Assert.Empty(order.Lines);\r
}\r
\r
// Not fine — two unrelated behaviours bundled together\r
[Fact]\r
public void CreateOrder_And_ApplyDiscount_Work()\r
{\r
    var order = Order.Create(customerId: 42);\r
    Assert.Equal(OrderStatus.Pending, order.Status);\r
\r
    var discounted = new DiscountCalculator(100m, 0.1m).Apply(order);\r
    Assert.Equal(0m, discounted.Total); // unrelated concern, buried in the same test\r
}\r
\`\`\`\r
\r
If the bundled test fails, the name and the failure line don't tell you which behaviour broke without reading the whole body.\r
\r
## Naming as a specification\r
\r
A good test name should let someone read a failure report and know what broke **without opening the test file**. A common convention: \`MethodOrBehaviour_ExpectedResult_WhenCondition\`.\r
\r
| Weak name | Better name |\r
|---|---|\r
| \`Test1\` | \`Withdraw_ThrowsInsufficientFunds_WhenAmountExceedsBalance\` |\r
| \`ApplyDiscountTest\` | \`ApplyDiscount_ReturnsOriginalTotal_WhenBelowThreshold\` |\r
| \`TestNullUser\` | \`Register_ThrowsArgumentNullException_WhenEmailIsNull\` |\r
\r
> [!TIP]\r
> Read the test name out loud as a sentence. If it reads like a spec ("withdraw throws insufficient funds when amount exceeds balance"), you've named it well. If it reads like an implementation note, rename it.\r
\r
## Independence and shared state\r
\r
Tests must be runnable **in any order, in isolation, and in parallel** without affecting each other's outcome. The most common violation is a shared mutable fixture.\r
\r
\`\`\`csharp\r
// Dangerous: static/shared state leaks between tests\r
public class OrderServiceTests\r
{\r
    private static readonly List<Order> _sharedOrders = new(); // shared across tests!\r
\r
    [Fact]\r
    public void Test_A() { _sharedOrders.Add(new Order()); Assert.Single(_sharedOrders); }\r
\r
    [Fact]\r
    public void Test_B() { Assert.Empty(_sharedOrders); } // fails if Test_A ran first\r
}\r
\`\`\`\r
\r
xUnit creates a **new instance of the test class per test**, so instance fields are safe by default — the bug above only bites with \`static\` fields or genuinely shared external resources (a database, a file, a singleton). Use \`IClassFixture<T>\` for expensive shared setup and reset mutable state in constructor/\`Dispose\`, not by hoping test order stays stable.\r
\r
> [!DANGER]\r
> A test suite that only passes when run in a specific order (or only in isolation, never in parallel) is already broken — it's hiding a shared-state bug that will eventually cause a flaky CI run.\r
\r
## Determinism: time, randomness, culture, environment\r
\r
A unit test must produce the same result every time, on every machine. The usual sources of non-determinism all have the same fix: **inject them instead of calling them directly**.\r
\r
| Source | Problem | Fix |\r
|---|---|---|\r
| \`DateTime.Now\` / \`DateTime.UtcNow\` | Result depends on when the test runs | Inject \`TimeProvider\` (or \`IClock\`/\`ISystemClock\`) |\r
| \`new Random()\` | Different sequence every run | Inject \`Random\` with a fixed seed, or an \`IRandomProvider\` |\r
| \`Thread.CurrentThread.CurrentCulture\` | \`1,000.5\` vs \`1.000,5\` parsing differs by locale | Force \`InvariantCulture\` in the code, or set it explicitly in the test |\r
| File system / environment variables | Test behaves differently per machine/CI | Wrap behind an interface (\`IFileSystem\`), inject a fake |\r
| Network calls | Slow, flaky, not a unit test anymore | Replace with a test double (see Test Doubles) |\r
\r
\`\`\`csharp\r
public class InvoiceService\r
{\r
    private readonly TimeProvider _clock;\r
    public InvoiceService(TimeProvider clock) => _clock = clock;\r
\r
    public Invoice Issue(decimal amount) =>\r
        new Invoice(amount, issuedAt: _clock.GetUtcNow());\r
}\r
\r
[Fact]\r
public void Issue_StampsInvoice_WithProvidedTime()\r
{\r
    var fixedTime = new DateTimeOffset(2024, 1, 1, 0, 0, 0, TimeSpan.Zero);\r
    var clock = new FakeTimeProvider(fixedTime); // test double, not the real clock\r
\r
    var invoice = new InvoiceService(clock).Issue(100m);\r
\r
    Assert.Equal(fixedTime, invoice.IssuedAt);\r
}\r
\`\`\`\r
\r
## Parameterised tests\r
\r
xUnit's \`Theory\` avoids near-duplicate tests that differ only by input, and makes edge cases explicit and easy to scan.\r
\r
\`\`\`csharp\r
[Theory]\r
[InlineData(0, false)]\r
[InlineData(-1, false)]\r
[InlineData(1, true)]\r
[InlineData(int.MaxValue, true)]\r
public void IsPositive_ReturnsExpected(int value, bool expected)\r
{\r
    Assert.Equal(expected, NumberUtils.IsPositive(value));\r
}\r
\r
// For complex or non-literal data, use MemberData\r
public static IEnumerable<object[]> DiscountCases =>\r
    new List<object[]>\r
    {\r
        new object[] { 50m, 0m },\r
        new object[] { 150m, 15m },\r
        new object[] { 1000m, 100m },\r
    };\r
\r
[Theory]\r
[MemberData(nameof(DiscountCases))]\r
public void CalculateDiscount_ReturnsExpected(decimal total, decimal expectedDiscount)\r
{\r
    Assert.Equal(expectedDiscount, DiscountCalculator.Calculate(total));\r
}\r
\`\`\`\r
\r
\`InlineData\` needs compile-time constants; use \`MemberData\` or \`ClassData\` when cases involve objects, or are shared across test classes.\r
\r
## Testing exceptions and async code\r
\r
\`\`\`csharp\r
[Fact]\r
public void Withdraw_ThrowsInsufficientFunds_WhenAmountExceedsBalance()\r
{\r
    var account = new Account(balance: 50m);\r
\r
    var ex = Assert.Throws<InsufficientFundsException>(() => account.Withdraw(100m));\r
\r
    Assert.Equal(50m, ex.AvailableBalance); // assert on exception data, not just the type\r
}\r
\r
[Fact]\r
public async Task GetOrderAsync_ReturnsOrder_WhenItExists()\r
{\r
    var repo = new FakeOrderRepository(seed: new Order(id: 1));\r
    var service = new OrderService(repo);\r
\r
    var order = await service.GetOrderAsync(1);\r
\r
    Assert.NotNull(order);\r
    Assert.Equal(1, order!.Id);\r
}\r
\r
[Fact]\r
public async Task GetOrderAsync_ThrowsNotFound_WhenMissing()\r
{\r
    var service = new OrderService(new FakeOrderRepository());\r
\r
    await Assert.ThrowsAsync<OrderNotFoundException>(() => service.GetOrderAsync(999));\r
}\r
\`\`\`\r
\r
> [!WARNING]\r
> Never use \`.Result\` or \`.Wait()\` on an async call inside a test to "make it synchronous" — it can deadlock under a synchronization context and hides real async bugs. Make the test method \`async Task\` and \`await\` it.\r
\r
## The FIRST principles\r
\r
| Letter | Principle | Meaning |\r
|---|---|---|\r
| F | Fast | Milliseconds, not seconds — you'll run these hundreds of times a day |\r
| I | Independent | No test depends on another test's side effects or run order |\r
| R | Repeatable | Same result on any machine, any environment, any number of times |\r
| S | Self-validating | Pass/fail is automatic (an assertion), not "read the console output" |\r
| T | Timely | Written close to the production code, ideally just before or just after |\r
\r
## Testing behaviour, not implementation\r
\r
A test coupled to *how* code works instead of *what* it does breaks on every safe refactor — the opposite of what a test suite should give you.\r
\r
\`\`\`csharp\r
// Before: coupled to implementation — breaks if you rename the private helper\r
// or change from a List to a HashSet internally\r
[Fact]\r
public void Bad_ChecksInternalListDirectly()\r
{\r
    var cart = new ShoppingCart();\r
    cart.AddItem("apple");\r
    Assert.Equal(1, cart.GetInternalItemsForTesting().Count); // exposes internals just for the test\r
}\r
\r
// After: coupled to observable behaviour — survives any internal refactor\r
[Fact]\r
public void ShoppingCart_ContainsItem_AfterAdding()\r
{\r
    var cart = new ShoppingCart();\r
    cart.AddItem("apple");\r
    Assert.True(cart.Contains("apple"));\r
    Assert.Equal(1, cart.ItemCount);\r
}\r
\`\`\`\r
\r
A strong signal you've drifted into implementation testing: you had to add a method or property *only* so the test could see it, or the test breaks when you rename a private field but the feature still works correctly.\r
\r
## Cheat sheet\r
\r
- A unit is a behaviour reachable through a public contract, not a mechanical one-class-one-test rule.\r
- Arrange-Act-Assert, always, even for a three-line test.\r
- One reason to fail per test; bundle assertions only if they describe the same outcome.\r
- Name tests as specifications: \`Method_ExpectedResult_WhenCondition\`.\r
- Inject time, randomness, culture and I/O — never call them directly from code you unit test.\r
- Use \`Theory\`/\`InlineData\`/\`MemberData\` to cover edge cases without duplicating tests.\r
- \`Assert.Throws\`/\`ThrowsAsync\` for exceptions; \`async Task\` + \`await\` for async tests, never \`.Result\`/\`.Wait()\`.\r
- FIRST: Fast, Independent, Repeatable, Self-validating, Timely.\r
- If a test needs a method that exists only for the test to call, you're testing implementation, not behaviour.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Test name like \`Test1\` or \`ApplyDiscountTest\` | Name it as a spec: method, expected result, condition |\r
| Static/shared mutable fields across tests | Use instance fields (xUnit default) or \`IClassFixture\` with reset logic |\r
| Calling \`DateTime.Now\` inside code under test | Inject \`TimeProvider\` and control it from the test |\r
| \`.Result\` / \`.Wait()\` on async calls in tests | Make the test \`async Task\` and \`await\` |\r
| Exposing internals with a \`ForTesting\` method | Assert on observable outputs/behaviour instead |\r
| One giant test asserting five unrelated behaviours | Split into focused tests, one reason to fail each |\r
| Copy-pasted near-identical tests for each input | Use \`[Theory]\` with \`InlineData\`/\`MemberData\` |\r
\r
## Summary\r
\r
Good unit tests describe behaviour through a public contract, follow Arrange-Act-Assert, fail for exactly one reason, and read like a specification when they fail. Determinism is non-negotiable — time, randomness, culture and I/O must be injected so the same test gives the same answer everywhere. FIRST is the checklist to run a suite against when it starts feeling slow or flaky. The single biggest tell of a maturing test suite is that refactors internal to a class don't break its tests — only changes to its actual behaviour do.\r
\r
## Top Interview Questions\r
\r
### Q1. What exactly is a "unit" in unit testing?\r
\r
A unit is a piece of observable behaviour reachable through a public contract — not necessarily one class or one method. A single public method might need five tests to describe its behaviour under different inputs, and a single test might legitimately exercise several private methods invoked through one public entry point. The boundary is drawn at what you're willing to keep stable: if you can restructure the private implementation without changing what a caller observes, the tests shouldn't need to change. This distinction matters because teams that define "unit" as "one test class per class" end up with brittle, implementation-coupled tests that break on every safe refactor.\r
\r
### Q2. Why is Arrange-Act-Assert useful, and what goes wrong without it?\r
\r
AAA separates a test into setup, the action under test, and the verification, making each test scannable in seconds even months later. Without the structure, tests tend to interleave setup and assertions ("assert, arrange some more, act, arrange again, assert"), which makes it hard to tell what's actually being tested versus what's incidental setup. It also encourages one clear "Act" step — if you find yourself needing two distinct Act steps, that's often a sign the test is covering two behaviours and should be split. The convention costs nothing and pays off the first time you have to debug a failing test you didn't write.\r
\r
### Q3. What does "one assertion per test" really mean, and is it ever okay to have multiple Assert calls in one test?\r
\r
It doesn't mean literally one \`Assert.*\` line — it means one **reason to fail**. Multiple assertions that all describe the same outcome (e.g., checking three properties of the object just created) are fine and often clearer than three near-duplicate tests. What's not fine is asserting on two logically unrelated behaviours in the same test, because when it fails, you can't tell from the test name and failure line which behaviour broke without reading the full body. The practical rule: if splitting the test into two would give each half a meaningfully different, specific name, split it.\r
\r
### Q4. How do you make a unit test involving \`DateTime.Now\` deterministic?\r
\r
Never call \`DateTime.Now\`/\`DateTime.UtcNow\` directly inside code you want to unit test. Inject a time abstraction — .NET 8+ has \`TimeProvider\` built in, or you can use a custom \`IClock\` interface — and pass a fake/fixed implementation in tests. This lets you assert exact timestamps, test boundary conditions (midnight rollover, daylight saving transitions, "exactly 30 days ago") deterministically, and run the test at 11:59pm on New Year's Eve without it flaking. The same pattern — injecting the non-deterministic dependency rather than calling it globally — applies to randomness, culture-sensitive parsing, and file system or environment access.\r
\r
### Q5. Your test passes locally but fails in CI. What are the likely causes and how do you debug it?\r
\r
Common causes: (1) culture/locale differences — CI runners often default to a different culture than a developer machine, breaking number/date parsing or formatting if the code doesn't force \`InvariantCulture\`; (2) timing assumptions — a test using real \`Task.Delay\` or relying on wall-clock ordering under CI's different CPU contention; (3) shared/static state leaking between tests when CI runs them in a different order or in parallel while local runs were serial; (4) environment differences — missing environment variables, different time zone, different file system case-sensitivity on Linux CI vs Windows dev machine. Debugging approach: reproduce with the same culture/timezone/parallelism settings locally, check for any direct calls to \`DateTime.Now\`, \`Random\`, \`Thread.CurrentCulture\`, or static fields, and grep for \`.Result\`/\`.Wait()\` on async code which can behave differently under CI's synchronization context.\r
\r
### Q6. What's wrong with a test that calls a method named \`GetInternalStateForTesting()\`?\r
\r
It's a sign the test is coupled to implementation rather than behaviour. Any method that exists purely so a test can peek at internal state means the test will break the moment you refactor that internal representation — even if the externally observable behaviour hasn't changed at all. This defeats the purpose of having tests, which is to give you confidence to refactor safely. The fix is to assert only on what's reachable through the class's real public contract: return values, thrown exceptions, or effects visible through other public methods. If the behaviour genuinely isn't observable any other way, that's often a sign the class's public API is incomplete, not that you need a testing-only escape hatch.\r
\r
### Q7. How do \`InlineData\` and \`MemberData\` differ in xUnit, and when do you use each?\r
\r
\`[InlineData]\` supplies test case values as compile-time constants directly in the attribute — ints, strings, bools, enums — and is the simplest option for a handful of small cases. \`[MemberData]\` (or \`[ClassData]\`) points to a static property/method that returns \`IEnumerable<object[]>\`, which is required when test data involves non-constant types (objects, collections, computed values) or when the same data set needs to be reused across multiple test classes. A good rule: start with \`InlineData\` for simple primitive cases; move to \`MemberData\` once the case list grows long, needs comments explaining each case, or needs non-primitive data.\r
\r
### Q8. Why shouldn't you use \`.Result\` or \`.Wait()\` to test async methods?\r
\r
Both block the calling thread waiting for the async operation to complete, which can deadlock if the async method needs to resume on a captured synchronization context that's blocked by that same wait (a classic ASP.NET classic/UI-thread deadlock, though less common with \`ConfigureAwait(false)\` and modern ASP.NET Core's lack of a synchronization context). Even where it doesn't deadlock, it silently swallows and wraps exceptions inside an \`AggregateException\`, making failures harder to diagnose. The correct approach is to declare the test method itself as \`async Task\` and \`await\` the call under test — xUnit, NUnit and MSTest all support async test methods natively, so there's no reason to fall back to blocking calls.\r
\r
### Q9. What does FIRST stand for and why does "Fast" matter enough to be first?\r
\r
Fast, Independent, Repeatable, Self-validating, Timely. Fast is listed first because speed is what determines whether tests actually get run — a suite that takes 45 minutes will get skipped locally and only checked in CI, at which point feedback arrives long after the relevant code was fresh in your mind, which defeats much of the value of having unit tests at all. A unit suite should run in seconds; anything doing real I/O (database, network, file system, sleeps) has drifted out of "unit" territory and either needs a test double or belongs in the integration layer instead.\r
\r
### Q10. Describe a case where two tests interfered with each other because of shared state, and how you'd fix it.\r
\r
A common real example: a test class holds a \`static readonly List<T>\` used as an in-memory "repository" fake, and one test adds an item to it while another test asserts the list is empty — the outcome then depends entirely on execution order, which is invisible until CI parallelises test execution or reorders tests and the suite starts failing intermittently. The fix is to never use \`static\` mutable fields for per-test state; xUnit already creates a fresh instance of the test class per test, so instance fields are naturally isolated. For genuinely expensive shared setup (e.g., a Testcontainers database), use \`IClassFixture<T>\`/\`ICollectionFixture<T>\` but explicitly reset mutable state between tests rather than relying on order.\r
\r
### Q11. How do you decide whether a piece of logic deserves its own unit test versus being covered incidentally by a higher-level test?\r
\r
Ask whether the logic has a distinct failure mode that needs a precise, fast-to-debug signal — branching conditions, boundary values, error handling, calculations. If yes, it deserves a direct unit test with the specific input/output pinned down, because a failure at the integration or e2e level would only tell you "something is wrong" with a much slower feedback loop. If the logic is trivial (a pass-through property, a one-line delegation with no branching) it's reasonable to let it be covered incidentally, since a dedicated test would just restate the implementation with no real risk being mitigated.\r
\r
### Q12. A colleague argues you should test private methods directly to get full coverage. How do you respond?\r
\r
Testing private methods directly means changing their access modifier or using reflection to reach them, both of which couple the test suite to implementation details a caller never sees. Private methods exist to serve the public behaviour — if a private method's logic is important enough to warrant its own focused test, that's usually a signal it should be extracted into its own class with a public API, not that the current class's private method should be exposed. Instead, test the private method's effects through the public methods that call it, covering enough input combinations to exercise the branches inside — this keeps the test suite refactor-safe, since you're free to change the private implementation as long as the public behaviour is unchanged.\r
`;export{e as default};
