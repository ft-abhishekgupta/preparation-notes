const e=`---\r
title: Creational Patterns\r
description: Factory Method, Abstract Factory, Builder, Prototype and Singleton with C# implementations, thread-safety details and when each pattern is the wrong choice\r
difficulty: Core\r
tags: [design-patterns, creational, singleton, factory, builder]\r
---\r
\r
Creational patterns exist to answer one question: "how does this object get built, and does the caller need to know?" Interviewers use them to check whether you reach for the *right* amount of ceremony — a simple factory when that's enough, a builder when a constructor would be unreadable, and a healthy suspicion of singleton.\r
\r
## Factory Method\r
\r
**Problem:** a class needs to create an object, but the exact type to create should be decided by a subclass or a configuration value, not hardcoded.\r
\r
\`\`\`mermaid\r
classDiagram\r
    class IPayment {\r
        <<interface>>\r
        +Pay(decimal)\r
    }\r
    class UpiPayment {\r
        +Pay(decimal)\r
    }\r
    class CardPayment {\r
        +Pay(decimal)\r
    }\r
    class PaymentFactory {\r
        +Create(string type) IPayment\r
    }\r
    IPayment <|.. UpiPayment\r
    IPayment <|.. CardPayment\r
    PaymentFactory --> IPayment\r
\`\`\`\r
\r
\`\`\`csharp\r
interface IPayment {\r
    void Pay(decimal amount);\r
}\r
class UpiPayment : IPayment {\r
    public void Pay(decimal amount) => Console.WriteLine($"UPI paid {amount}");\r
}\r
class CardPayment : IPayment {\r
    public void Pay(decimal amount) => Console.WriteLine($"Card paid {amount}");\r
}\r
static class PaymentFactory {\r
    public static IPayment Create(string type) => type switch {\r
        "UPI" => new UpiPayment(),\r
        "CARD" => new CardPayment(),\r
        _ => throw new ArgumentException($"Unknown payment type: {type}")\r
    };\r
}\r
\`\`\`\r
\r
**Real-world use:** \`HttpMessageHandlerFactory\`-style code, ORM connection creation based on a config-driven provider name, notification channel selection. **When not to use it:** if there's only ever one concrete type and no plausible second one on the roadmap — a factory around a single implementation is needless indirection.\r
\r
## Abstract Factory\r
\r
**Problem:** you need to create **families of related objects** that must stay consistent with each other — e.g. a UI toolkit where buttons and checkboxes must all match one visual theme.\r
\r
\`\`\`mermaid\r
classDiagram\r
    class IUIFactory {\r
        <<interface>>\r
        +CreateButton() IButton\r
        +CreateCheckbox() ICheckbox\r
    }\r
    class DarkUIFactory {\r
        +CreateButton() IButton\r
        +CreateCheckbox() ICheckbox\r
    }\r
    class LightUIFactory {\r
        +CreateButton() IButton\r
        +CreateCheckbox() ICheckbox\r
    }\r
    IUIFactory <|.. DarkUIFactory\r
    IUIFactory <|.. LightUIFactory\r
\`\`\`\r
\r
\`\`\`csharp\r
interface IButton { void Render(); }\r
interface ICheckbox { void Render(); }\r
\r
interface IUIFactory {\r
    IButton CreateButton();\r
    ICheckbox CreateCheckbox();\r
}\r
class DarkButton : IButton { public void Render() => Console.WriteLine("Dark button"); }\r
class DarkCheckbox : ICheckbox { public void Render() => Console.WriteLine("Dark checkbox"); }\r
class DarkUIFactory : IUIFactory {\r
    public IButton CreateButton() => new DarkButton();\r
    public ICheckbox CreateCheckbox() => new DarkCheckbox();\r
}\r
// LightUIFactory mirrors this, producing LightButton/LightCheckbox — never mixed\r
\`\`\`\r
\r
**Real-world use:** cross-platform UI toolkits, database-provider abstraction layers that must produce a matched \`Connection\`/\`Command\`/\`Transaction\` set. **When not to use it:** when there's only one product to create (that's just Factory Method) or the "families" never actually need to vary together — added complexity for a guarantee nobody needs.\r
\r
> [!KEY]\r
> **Factory Method vs Abstract Factory vs a simple factory, clarified:** a *simple factory* is one static method with a switch — not a GoF pattern, just a convenience. *Factory Method* defines a virtual creation method that subclasses override to decide **one** product's type. *Abstract Factory* is a factory of factories — an interface that creates **multiple related products** that must be consistent with each other. If you only ever need one object, use Factory Method (or a simple factory); reach for Abstract Factory only when object *families* must be swapped together.\r
\r
## Builder\r
\r
**Problem:** an object has many optional parameters, and a telescoping constructor (\`new User(name, email, null, null, true, false, null, ...)\`) becomes unreadable and error-prone.\r
\r
\`\`\`mermaid\r
classDiagram\r
    class User {\r
        +string Name\r
        +string Email\r
        +int? Age\r
        +string Address\r
    }\r
    class UserBuilder {\r
        -User user\r
        +WithName(string) UserBuilder\r
        +WithEmail(string) UserBuilder\r
        +WithAge(int) UserBuilder\r
        +Build() User\r
    }\r
    UserBuilder --> User : builds\r
\`\`\`\r
\r
\`\`\`csharp\r
class User {\r
    public string Name { get; set; }\r
    public string Email { get; set; }\r
    public int? Age { get; set; }\r
}\r
class UserBuilder {\r
    private readonly User _user = new();\r
    public UserBuilder WithName(string name) { _user.Name = name; return this; }\r
    public UserBuilder WithEmail(string email) { _user.Email = email; return this; }\r
    public UserBuilder WithAge(int age) { _user.Age = age; return this; }\r
    public User Build() => _user;\r
}\r
// Usage — reads like configuration, not a parameter-position guessing game\r
var user = new UserBuilder().WithName("Asha").WithEmail("a@x.com").WithAge(29).Build();\r
\`\`\`\r
\r
**Real-world use:** \`HttpRequestMessageBuilder\`-style HTTP client configuration, SQL query builders, test object mothers/fixtures with many optional fields. **When not to use it:** an object with two or three required fields and no optional ones — a normal constructor is clearer and a builder is ceremony without payoff.\r
\r
## Prototype\r
\r
**Problem:** creating a new object is expensive (a deep object graph, an expensive computed state) but you already have a similar object you could clone and tweak instead.\r
\r
\`\`\`csharp\r
interface IPrototype<T> {\r
    T Clone();\r
}\r
class ReportTemplate : IPrototype<ReportTemplate> {\r
    public string Header { get; set; }\r
    public List<string> Sections { get; set; } = new();\r
\r
    public ReportTemplate Clone() => new ReportTemplate {\r
        Header = Header,\r
        Sections = new List<string>(Sections) // deep copy the mutable list\r
    };\r
}\r
// Usage\r
var baseTemplate = new ReportTemplate { Header = "Q1 Report", Sections = { "Summary", "Details" } };\r
var q2Template = baseTemplate.Clone();\r
q2Template.Header = "Q2 Report"; // starts from a pre-populated copy, not from scratch\r
\`\`\`\r
\r
**Real-world use:** cloning a fully-configured object graph (a game entity with attached components, a pre-built document template) instead of re-running expensive setup logic. **When not to use it:** when construction is cheap — cloning adds the risk of shallow-copy bugs (forgetting to deep-copy a mutable field) for no real performance win.\r
\r
> [!WARNING]\r
> The most common Prototype bug is a **shallow copy** of a mutable reference field — cloning \`ReportTemplate\` without copying the \`Sections\` list means both the original and the clone share the same underlying \`List<string>\`, so mutating one mutates the other. Always deep-copy mutable collections and nested objects explicitly.\r
\r
## Singleton\r
\r
**Problem:** exactly one instance of a class must exist and be globally reachable — a configuration store, a logging sink, a connection pool.\r
\r
\`\`\`mermaid\r
classDiagram\r
    class Logger {\r
        -Logger instance$\r
        -Logger()\r
        +Instance Logger$\r
        +Log(string)\r
    }\r
    Logger --> Logger : returns shared instance\r
\`\`\`\r
\r
Three ways to implement it thread-safely in C#, in increasing order of control:\r
\r
\`\`\`csharp\r
// 1. Lazy<T> — simplest, thread-safe by default, lazy-initialised\r
class Logger {\r
    private static readonly Lazy<Logger> _instance = new(() => new Logger());\r
    public static Logger Instance => _instance.Value;\r
    private Logger() { }\r
    public void Log(string msg) => Console.WriteLine(msg);\r
}\r
\r
// 2. Static initialiser — thread-safe via the CLR's type initialisation guarantee, eager\r
class ConfigStore {\r
    public static readonly ConfigStore Instance = new ConfigStore();\r
    private ConfigStore() { }\r
}\r
\r
// 3. Double-checked locking — manual control, useful pre-.NET-4 or with extra init logic\r
class ConnectionPool {\r
    private static volatile ConnectionPool _instance;\r
    private static readonly object _lock = new();\r
    public static ConnectionPool Instance {\r
        get {\r
            if (_instance == null) {\r
                lock (_lock) {\r
                    if (_instance == null) _instance = new ConnectionPool();\r
                }\r
            }\r
            return _instance;\r
        }\r
    }\r
    private ConnectionPool() { }\r
}\r
\`\`\`\r
\r
| Approach | Laziness | Thread safety mechanism | When to use |\r
|---|---|---|---|\r
| \`Lazy<T>\` | Lazy | Built-in, handled by \`Lazy<T>\` | Default choice — simplest correct option |\r
| Static readonly field | Eager (at type load) | CLR guarantees type initialisers run once | Cheap-to-construct singleton, fine to build eagerly |\r
| Double-checked locking | Lazy | Manual \`lock\` + \`volatile\` | Legacy codebases, or extra control needed over initialisation timing |\r
\r
> [!DANGER]\r
> **Singleton is often an anti-pattern in testable code.** It introduces hidden global state — any class that reaches for \`Logger.Instance\` has an invisible dependency that doesn't show up in its constructor signature, making it impossible to substitute a fake in a unit test without resorting to static-state hacks. The modern fix: register the "singleton" behaviour with an **IoC container as a singleton-scoped service** and inject it via an interface (\`ILogger\`), so callers depend on an abstraction they can mock, while the container still guarantees exactly one instance.\r
\r
**Real-world use:** a \`Lazy<T>\`-backed configuration cache, a metrics registry. **When not to use it:** any time testability matters and the "one instance" requirement can instead be satisfied by registering a service as singleton-scoped in a DI container.\r
\r
## Factory Method vs Builder\r
\r
Both show up around "construction", but they answer different questions: Factory Method decides **which concrete implementation** should exist, while Builder decides **how one complex object** should be assembled clearly.\r
\r
| | Factory Method | Builder |\r
|---|---|---|\r
| Main question | "Which product do I create?" | "How do I construct this product?" |\r
| Output | One implementation behind an abstraction | One object assembled in readable steps |\r
| Typical trigger | Runtime input, config, or subclass decides the type | Many optional fields, staged validation, or a telescoping constructor |\r
\r
## When to reach for each\r
\r
| Pattern | Reach for it when | Don't use it when |\r
|---|---|---|\r
| Factory Method | One product type, decided by input/config | Only one implementation will ever exist |\r
| Abstract Factory | Families of related objects must stay consistent | Only one product family, or products never vary together |\r
| Builder | Many optional parameters, or step-by-step assembly | Object has 2–3 required fields, a constructor is clear |\r
| Prototype | Cloning is cheaper than reconstruction, deep object graphs | Construction is already cheap and simple |\r
| Singleton | Genuinely one shared, stateless-ish resource, testability handled via DI | You'd otherwise reach for a global and skip DI entirely |\r
\r
## Cheat sheet\r
\r
- Factory Method = one product, decided dynamically. Abstract Factory = a **family** of products that must match.\r
- A "simple factory" (one static method with a switch) isn't a GoF pattern — it's a convenience, and that's fine to say out loud.\r
- Builder wins over a telescoping constructor once you have 4+ optional parameters or need fluent, readable construction.\r
- Prototype's classic bug is a shallow copy — always deep-copy mutable fields in \`Clone()\`.\r
- Thread-safe singleton, easiest to hardest: \`Lazy<T>\` → static readonly field → double-checked locking.\r
- Singleton's real danger isn't concurrency bugs, it's **hidden global state that breaks unit testing** — prefer DI-container-scoped singletons behind an interface.\r
- Ask "does this need to vary independently, or is it a family that must move together?" to pick between Factory Method and Abstract Factory.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Calling any static factory method "the Factory pattern" | Distinguish simple factory (convenience) from Factory Method (virtual, overridable) from Abstract Factory (families) |\r
| Using a public mutable static field as a "singleton" | Use \`Lazy<T>\` or a static readonly field with a private constructor |\r
| Forgetting \`volatile\` in double-checked locking | Without it, a partially-constructed instance can be observed by another thread due to reordering |\r
| Shallow-copying in \`Clone()\` | Deep-copy every mutable reference field explicitly |\r
| Building a fluent \`Builder\` for a 2-field DTO | Use a normal constructor or object initialiser — builder adds no value there |\r
| Injecting \`Singleton.Instance\` directly into business logic | Depend on an interface, register the concrete type as singleton-scoped in the DI container |\r
\r
## Summary\r
\r
Creational patterns are about controlling *how* and *when* objects come into being so that callers don't have to know construction details. Factory Method and Abstract Factory move that decision behind an interface — one product versus a matched family. Builder tames constructors that have grown too many optional parameters. Prototype trades construction cost for a clone, at the risk of shallow-copy bugs. Singleton guarantees one instance but, done as a raw static accessor, quietly breaks testability — the senior move is to get the "one instance" guarantee from your DI container instead of a hand-rolled static field.\r
\r
## Top Interview Questions\r
\r
### Q1. What's the difference between a simple factory, Factory Method, and Abstract Factory?\r
\r
A simple factory is just a static method with a switch statement that returns different concrete types — convenient, but not a formal GoF pattern since there's no polymorphism in the creation logic itself. Factory Method is a proper pattern: a class declares a method (often virtual/abstract) whose job is to create **one** product, and subclasses override it to decide which concrete type gets created — the creation logic itself is polymorphic. Abstract Factory goes a level further: it's an interface for creating **families of related products** that must remain consistent with each other, like a \`DarkUIFactory\` producing a matched dark button and dark checkbox together, so you never accidentally mix a light button with a dark checkbox.\r
\r
### Q2. When would you use Builder instead of a constructor with optional parameters or named arguments?\r
\r
C#'s optional parameters and object initializers handle a handful of optional fields fine, but they break down once you need multi-step construction, validation that spans several steps, or immutability with many combinations of parameters — a constructor with eight optional parameters is unreadable and error-prone at the call site (easy to swap two same-typed arguments by position). Builder fixes this with a fluent, self-documenting call chain (\`.WithName(...).WithEmail(...).Build()\`), and can enforce invariants at \`Build()\` time (e.g. throwing if a required field was never set) that a constructor alone can't express as cleanly across many optional combinations. I'd reach for it once a type has 4 or more optional parameters or the construction genuinely happens in logical steps.\r
\r
### Q3. Give three thread-safe ways to implement Singleton in C#, and explain the trade-offs.\r
\r
\`Lazy<T>\` is the simplest and safest — \`Lazy<T>\` handles thread-safety internally and only constructs the instance on first access, so it's my default. A static readonly field (\`public static readonly Config Instance = new Config();\`) relies on the CLR's guarantee that a type's static initialisers run exactly once, thread-safely, before first use — it's simpler than \`Lazy<T>\` but eager, so it's only appropriate if construction is cheap or you're fine paying the cost at type load. Double-checked locking is the manual, historically-common approach: check for null, lock, check again inside the lock before constructing — it needs the field marked \`volatile\` to prevent instruction reordering from exposing a partially-constructed object to another thread; it's more error-prone to write correctly and mostly superseded by \`Lazy<T>\` today.\r
\r
### Q4. Why do many people consider Singleton an anti-pattern, especially in testable code?\r
\r
The core problem isn't concurrency — it's that a singleton introduces **invisible global state**: any class that calls \`Logger.Instance\` internally has a hidden dependency that doesn't appear in its constructor, so you can't see what it depends on just by reading its signature, and you can't substitute a test double for it without hacks like reflection or static-state resets between tests. It also silently couples unrelated parts of a system through shared mutable state, and makes parallel test execution risky if the singleton holds mutable state that leaks between tests. The fix isn't to abandon "one shared instance" as a requirement — it's to get that guarantee from a DI container by registering the type with singleton lifetime behind an interface, so consumers depend on an injectable abstraction instead of a static accessor.\r
\r
### Q5. What's the classic bug in a naive Prototype implementation, and how do you avoid it?\r
\r
The classic bug is a **shallow copy**: if \`Clone()\` is implemented with a default member-wise copy (or by copying reference fields directly without cloning them), any mutable reference field — a \`List<T>\`, a nested object, a dictionary — ends up shared between the original and the clone. Mutating the clone's list then silently mutates the original's list too, since they point at the same underlying object, producing bugs that are hard to trace because the two "independent" objects are secretly entangled. The fix is to explicitly deep-copy every mutable field inside \`Clone()\` — construct a new \`List<T>\` from the old one's contents, recursively clone nested objects that are themselves mutable — and to write a test that mutates a clone and asserts the original is unaffected.\r
\r
### Q6. When would Abstract Factory be overkill, and what would you use instead?\r
\r
Abstract Factory is overkill when there's only one "family" of products in practice — for example, if your application only ever targets one UI theme or one database provider and there's no near-term plan to support a second, the extra layer of an \`IUIFactory\` interface plus per-family concrete factories adds indirection with no real flexibility payoff. In that case a plain Factory Method (or even direct construction via dependency injection of the concrete types) is simpler and equally correct. The signal to actually reach for Abstract Factory is when you can name at least two families today (dark/light theme, SQL Server/Postgres) and the products within each family genuinely need to stay consistent with each other — if there's no consistency constraint across products, you likely just need several independent Factory Methods, not one Abstract Factory.\r
\r
### Q7. How would you refactor a codebase that uses a public static mutable singleton for configuration, in a way that's safe for a large team to adopt incrementally?\r
\r
I'd first introduce an interface (\`IAppConfig\`) matching the singleton's public surface, and make the existing static class implement it internally while keeping the static accessor working, so nothing breaks immediately. Next I'd register that implementation with the DI container as a singleton-scoped service and start injecting \`IAppConfig\` into new and refactored classes via their constructors, while legacy code still reaches \`ConfigStore.Instance\` directly during the transition. Once call sites are migrated, I'd delete the static accessor entirely, leaving only the DI-registered singleton — at that point every consumer is unit-testable via a mock \`IAppConfig\`, and the "exactly one instance" guarantee is enforced by the container's lifetime management instead of a hand-rolled static field, which also makes it trivial to have per-test-isolated instances in test runs.\r
\r
### Q8. What real .NET or framework examples map to each creational pattern?\r
\r
\`Activator.CreateInstance\` combined with a provider-name-driven switch in ORMs like Entity Framework's database provider selection is a Factory Method in spirit. \`DbProviderFactory\` in \`System.Data.Common\` is a textbook Abstract Factory — it creates a matched family of \`DbConnection\`, \`DbCommand\`, and \`DbParameter\` objects for a given provider (SQL Server vs. SQLite), guaranteeing they're compatible with each other. \`StringBuilder\` and \`HttpRequestMessage\`'s fluent extension helpers, along with LINQ's \`IQueryable\` expression building, echo the Builder pattern's step-by-step, chained construction. \`MemberwiseClone()\` in the base \`object\` class is the raw mechanism behind Prototype (though it's shallow by default, so custom \`Clone()\` overrides are still needed for deep copies). And \`IServiceCollection.AddSingleton<T>()\` in \`Microsoft.Extensions.DependencyInjection\` is the modern, testable replacement for a hand-rolled Singleton.\r
\r
### Q9. A junior engineer asks why not just use \`new SomeClass()\` everywhere instead of a Factory. What do you tell them?\r
\r
I'd say: for a class with exactly one implementation and no expected variation, they're right — a Factory would be needless indirection, and \`new\` is perfectly fine. The moment that changes is when the *caller* shouldn't need to know or care which concrete type gets created — because it depends on runtime configuration, user input, or an interface with multiple implementations — that's when a Factory pays for itself, because the calling code depends only on the abstraction (\`IPayment\`) and stays unchanged when a new concrete type (\`WalletPayment\`) is added later. I'd frame it as "don't introduce a Factory speculatively; introduce it the moment you have — or can clearly foresee — more than one concrete type behind the same contract," which keeps the codebase simple until complexity is actually needed (YAGNI applied correctly).\r
\r
### Q10. How would you decide, in a design interview, whether a requirement calls for Builder versus Abstract Factory versus Prototype?\r
\r
I'd map the requirement to the shape of the problem: if the pain point is "this object has too many optional parameters and construction is confusing", that's Builder — it's about *assembling one object* step-by-step. If the pain point is "I need to create several related objects that must be consistent with each other, and that consistency requirement changes by context (theme, provider, region)", that's Abstract Factory — it's about *creating families*. If the pain point is "constructing this object from scratch is expensive, but I frequently need near-copies of an existing one with minor tweaks", that's Prototype — it's about *cloning versus rebuilding*. In an interview I'd say this classification out loud before writing code, since naming the actual pain point the pattern solves is what proves you're choosing it deliberately rather than pattern-matching keywords.\r
`;export{e as default};
