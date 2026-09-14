const e=`---\r
title: Structural Patterns\r
description: Adapter, Decorator, Facade, Proxy, Composite, Bridge and Flyweight explained with C# code, real .NET examples, and the Decorator versus Proxy distinction interviewers love to probe\r
difficulty: Core\r
tags: [design-patterns, structural, decorator, proxy, adapter]\r
---\r
\r
Structural patterns are about composing classes and objects into larger structures without making that structure fragile. Adapter, Decorator and Proxy look nearly identical on paper — same shape, one wrapped object behind one interface — so the interview test is whether you can state the *intent* difference, not just draw the diagram.\r
\r
## Adapter\r
\r
**Problem:** you have an existing class with an incompatible interface (often third-party or legacy) and need it to work where a different interface is expected, without modifying its source.\r
\r
\`\`\`mermaid\r
classDiagram\r
    class IPayment {\r
        <<interface>>\r
        +Pay(decimal)\r
    }\r
    class RazorPayAdapter {\r
        +Pay(decimal)\r
    }\r
    class RazorPayApi {\r
        +MakePayment(double)\r
    }\r
    IPayment <|.. RazorPayAdapter\r
    RazorPayAdapter --> RazorPayApi\r
\`\`\`\r
\r
\`\`\`csharp\r
interface IPayment {\r
    void Pay(decimal amount);\r
}\r
class RazorPayApi { // third-party, cannot change its signature\r
    public void MakePayment(double amount) => Console.WriteLine($"Paid {amount}");\r
}\r
class RazorPayAdapter : IPayment {\r
    private readonly RazorPayApi _api;\r
    public RazorPayAdapter(RazorPayApi api) => _api = api;\r
    public void Pay(decimal amount) => _api.MakePayment((double)amount); // translates the call\r
}\r
\`\`\`\r
\r
**Real-world example:** wrapping a legacy SOAP client or an older SDK behind your application's modern \`IPayment\`/\`INotificationSender\` interface so the rest of the codebase never sees the legacy shape. **.NET example:** \`System.IO.StreamReader\` adapting a raw \`Stream\` (byte-oriented) into a text-oriented reading API.\r
\r
## Decorator\r
\r
**Problem:** you need to add optional, combinable behaviour to an object at runtime without subclassing for every combination of features.\r
\r
\`\`\`mermaid\r
classDiagram\r
    class ICoffee {\r
        <<interface>>\r
        +GetCost() decimal\r
    }\r
    class SimpleCoffee {\r
        +GetCost() decimal\r
    }\r
    class CoffeeDecorator {\r
        <<abstract>>\r
        #ICoffee coffee\r
    }\r
    class MilkDecorator {\r
        +GetCost() decimal\r
    }\r
    ICoffee <|.. SimpleCoffee\r
    ICoffee <|.. CoffeeDecorator\r
    CoffeeDecorator <|-- MilkDecorator\r
    CoffeeDecorator --> ICoffee\r
\`\`\`\r
\r
\`\`\`csharp\r
interface ICoffee { decimal GetCost(); }\r
class SimpleCoffee : ICoffee { public decimal GetCost() => 100; }\r
abstract class CoffeeDecorator : ICoffee {\r
    protected readonly ICoffee _coffee;\r
    protected CoffeeDecorator(ICoffee coffee) => _coffee = coffee;\r
    public abstract decimal GetCost();\r
}\r
class MilkDecorator : CoffeeDecorator {\r
    public MilkDecorator(ICoffee coffee) : base(coffee) { }\r
    public override decimal GetCost() => _coffee.GetCost() + 20; // adds behaviour, same interface\r
}\r
// ICoffee coffee = new MilkDecorator(new SugarDecorator(new SimpleCoffee()));\r
\`\`\`\r
\r
**Real-world example:** ASP.NET Core \`DelegatingHandler\` chains on \`HttpClient\` — each handler wraps the next, adding retry, logging, or auth headers before forwarding the request, all implementing the same handler contract. **.NET example:** \`System.IO.Stream\` wrapping — \`GZipStream\` wraps a \`FileStream\`, which could itself be wrapped in a \`BufferedStream\`, each adding behaviour while remaining a \`Stream\`.\r
\r
## Facade\r
\r
**Problem:** a subsystem has many interacting classes with a complex protocol between them, and most callers only need a simple, high-level operation.\r
\r
\`\`\`mermaid\r
classDiagram\r
    class CheckoutFacade {\r
        +Checkout(cart)\r
    }\r
    class Inventory {\r
        +Reserve(items)\r
    }\r
    class PaymentGateway {\r
        +Charge(amount)\r
    }\r
    class ShippingService {\r
        +Schedule(order)\r
    }\r
    CheckoutFacade --> Inventory\r
    CheckoutFacade --> PaymentGateway\r
    CheckoutFacade --> ShippingService\r
\`\`\`\r
\r
\`\`\`csharp\r
class CheckoutFacade {\r
    private readonly Inventory _inventory = new();\r
    private readonly PaymentGateway _payment = new();\r
    private readonly ShippingService _shipping = new();\r
\r
    public void Checkout(Cart cart) { // one call replaces coordinating three subsystems\r
        _inventory.Reserve(cart.Items);\r
        _payment.Charge(cart.Total);\r
        _shipping.Schedule(cart);\r
    }\r
}\r
\`\`\`\r
\r
**Real-world example:** a \`CheckoutFacade\` in an e-commerce backend that hides inventory reservation, payment charging, and shipping scheduling behind one \`Checkout()\` call. **.NET example:** \`HttpClient\` itself is a facade over the much lower-level \`HttpMessageHandler\`/socket/DNS machinery most callers never touch.\r
\r
## Proxy\r
\r
**Problem:** you need to control access to an object — adding lazy loading, caching, access control, or logging — without the client knowing it isn't talking to the real thing directly.\r
\r
\`\`\`mermaid\r
classDiagram\r
    class IFileService {\r
        <<interface>>\r
        +Read(string) string\r
    }\r
    class RealFileService {\r
        +Read(string) string\r
    }\r
    class CachingFileServiceProxy {\r
        -IFileService real\r
        -Dictionary cache\r
        +Read(string) string\r
    }\r
    IFileService <|.. RealFileService\r
    IFileService <|.. CachingFileServiceProxy\r
    CachingFileServiceProxy --> RealFileService\r
\`\`\`\r
\r
\`\`\`csharp\r
interface IFileService { string Read(string path); }\r
class RealFileService : IFileService {\r
    public string Read(string path) => File.ReadAllText(path); // expensive disk I/O\r
}\r
class CachingFileServiceProxy : IFileService {\r
    private readonly IFileService _real;\r
    private readonly Dictionary<string, string> _cache = new();\r
    public CachingFileServiceProxy(IFileService real) => _real = real;\r
    public string Read(string path) {\r
        if (!_cache.TryGetValue(path, out var content)) {\r
            content = _real.Read(path);\r
            _cache[path] = content;\r
        }\r
        return content; // caller never knows caching happened\r
    }\r
}\r
\`\`\`\r
\r
**Real-world example:** a caching proxy in front of a slow file or network read, an authorization proxy that checks permissions before delegating to the real service, or Entity Framework's lazy-loading proxies that defer fetching a navigation property until it's first accessed. **.NET example:** EF Core's dynamically generated lazy-loading proxy classes are a textbook runtime Proxy.\r
\r
## Composite\r
\r
**Problem:** you need to treat a single object and a group of objects **uniformly** — typically for a tree structure where a leaf and a branch should support the same operations.\r
\r
\`\`\`mermaid\r
classDiagram\r
    class IFileSystemItem {\r
        <<interface>>\r
        +GetSize() long\r
    }\r
    class File {\r
        +GetSize() long\r
    }\r
    class Folder {\r
        -List~IFileSystemItem~ children\r
        +GetSize() long\r
        +Add(IFileSystemItem)\r
    }\r
    IFileSystemItem <|.. File\r
    IFileSystemItem <|.. Folder\r
    Folder --> IFileSystemItem : contains many\r
\`\`\`\r
\r
\`\`\`csharp\r
interface IFileSystemItem { long GetSize(); }\r
class File : IFileSystemItem {\r
    private readonly long _size;\r
    public File(long size) => _size = size;\r
    public long GetSize() => _size;\r
}\r
class Folder : IFileSystemItem {\r
    private readonly List<IFileSystemItem> _children = new();\r
    public void Add(IFileSystemItem item) => _children.Add(item);\r
    public long GetSize() => _children.Sum(c => c.GetSize()); // recurses uniformly over leaves and branches\r
}\r
\`\`\`\r
\r
**Real-world example:** file systems (files and folders), and UI component trees (a \`Panel\` containing \`Button\`s and nested \`Panel\`s), where the caller calls \`Render()\`/\`GetSize()\` without caring whether it's a leaf or a container. **.NET example:** \`System.Windows.Controls\` (WPF) visual tree — a \`Panel\` is itself a \`UIElement\` containing more \`UIElement\`s.\r
\r
## Bridge\r
\r
**Problem:** an abstraction and its implementation are both likely to vary independently, and inheritance alone would force a combinatorial explosion of subclasses (as seen with the duck/bird problem).\r
\r
\`\`\`csharp\r
interface IRenderer { // the "implementation" side\r
    void RenderCircle(double radius);\r
}\r
class VectorRenderer : IRenderer {\r
    public void RenderCircle(double radius) => Console.WriteLine($"Vector circle r={radius}");\r
}\r
class RasterRenderer : IRenderer {\r
    public void RenderCircle(double radius) => Console.WriteLine($"Raster circle r={radius}");\r
}\r
abstract class Shape { // the "abstraction" side\r
    protected readonly IRenderer _renderer;\r
    protected Shape(IRenderer renderer) => _renderer = renderer;\r
    public abstract void Draw();\r
}\r
class Circle : Shape {\r
    private readonly double _radius;\r
    public Circle(IRenderer renderer, double radius) : base(renderer) => _radius = radius;\r
    public override void Draw() => _renderer.RenderCircle(_radius); // shape delegates to renderer\r
}\r
\`\`\`\r
\r
**Real-world example:** decoupling a \`Shape\` hierarchy (\`Circle\`, \`Square\`) from a \`Renderer\` hierarchy (\`VectorRenderer\`, \`RasterRenderer\`) so either can be extended independently — 2 shapes × 2 renderers stays 4 classes total, not 4 combined subclasses. Bridge is Strategy's structural cousin: both compose an interface instead of inheriting, but Bridge is framed around splitting an abstraction from its implementation hierarchy up front, while Strategy is framed around swapping one algorithm at a time.\r
\r
## Flyweight\r
\r
**Problem:** you need to create a very large number of similar objects, and the memory cost of storing duplicate data in each one is too high.\r
\r
\`\`\`csharp\r
class CharacterStyle { // the shared, immutable "intrinsic" state\r
    public string Font { get; }\r
    public int Size { get; }\r
    public CharacterStyle(string font, int size) { Font = font; Size = size; }\r
}\r
class CharacterStyleFactory {\r
    private readonly Dictionary<string, CharacterStyle> _styles = new();\r
    public CharacterStyle Get(string font, int size) {\r
        var key = $"{font}-{size}";\r
        if (!_styles.TryGetValue(key, out var style)) {\r
            style = new CharacterStyle(font, size);\r
            _styles[key] = style; // reused across every character with the same font+size\r
        }\r
        return style;\r
    }\r
}\r
// Each on-screen character stores only its position + a shared CharacterStyle reference,\r
// instead of duplicating font/size data per character.\r
\`\`\`\r
\r
**Real-world example:** a text editor or document renderer storing millions of characters, where font/size/color is shared (interned) across characters rather than duplicated per character. **.NET example:** the CLR's string interning pool is a built-in Flyweight — identical string literals share one underlying object instead of allocating duplicates.\r
\r
## Adapter vs Decorator vs Proxy\r
\r
These three share the exact same structural shape — a class implementing an interface while wrapping another object that implements the same or a related interface — which is precisely why interviewers ask you to tell them apart. The difference is entirely about **intent**.\r
\r
| | Adapter | Decorator | Proxy |\r
|---|---|---|---|\r
| Changes the interface? | Yes — converts one interface to another the client expects | No — implements the exact same interface as what it wraps | No — implements the exact same interface as the real subject |\r
| Adds behaviour? | No — only translates calls | Yes — adds new behaviour before/after delegating | Sometimes — but for **access control**, not new features |\r
| Client awareness | Client knows it's adapting a different, incompatible type | Client doesn't need to know decoration happened | Client typically doesn't know it isn't talking to the real object |\r
| Typical use | Legacy/third-party integration | Stacking optional features (logging, compression, retry) | Lazy loading, caching, authorization, remote proxies |\r
| Cardinality | Usually wraps exactly one incompatible object | Designed to be **stacked** — many decorators, one object | Usually a 1:1 stand-in for one real subject |\r
\r
> [!KEY]\r
> Say it this way in the room: *"Adapter changes the interface to make two incompatible things talk. Decorator keeps the interface identical and adds behaviour, and is meant to be stacked. Proxy also keeps the interface identical, but its purpose is controlling access to the real object — caching, lazy-loading, or permission checks — not adding new functionality."*\r
\r
> [!TIP]\r
> A quick gut-check question to ask yourself mid-interview: "does the wrapped call arrive at the real object completely unmodified, just gated?" — if yes, it's a Proxy. "Is the point that the caller can layer several of these on top of each other?" — if yes, it's a Decorator. "Is the whole reason this class exists that the two interfaces don't match?" — if yes, it's an Adapter.\r
\r
### Decorator vs inheritance\r
\r
Inheritance is fine when the variation is small and fixed, but it breaks down once features must be combined independently or turned on and off at runtime.\r
\r
| | Decorator | Inheritance |\r
|---|---|---|\r
| When behaviour is chosen | Runtime | Usually compile time |\r
| Composition style | Wraps another object | Extends a base class |\r
| Feature combinations | Easy to stack (\`Logging\` + \`Retry\` + \`Caching\`) | Subclass count grows combinatorially |\r
| Good fit | Optional cross-cutting behaviour | Small, stable variation with few combinations |\r
\r
## Cheat sheet\r
\r
- Adapter: **converts** an incompatible interface to the one the client expects; one wrapper, no new behaviour.\r
- Decorator: **adds behaviour**, same interface, designed to be **stacked** (many decorators around one component).\r
- Facade: **simplifies** a complex subsystem behind one high-level entry point; doesn't hide behind the subsystem's own interface, it's a new, simpler one.\r
- Proxy: **controls access** (lazy load, cache, authorize) behind the *same* interface as the real object; the client shouldn't need to know.\r
- Composite: treat a **leaf and a branch uniformly** through one shared interface — the classic tree-structure pattern.\r
- Bridge: split an **abstraction and its implementation** into two independent hierarchies to avoid combinatorial subclass explosion.\r
- Flyweight: **share immutable intrinsic state** across many objects to cut memory use; only extrinsic (per-instance) state stays unique.\r
- \`HttpClient\` handlers = Decorator. EF Core lazy proxies = Proxy. \`StreamReader\` = Adapter. \`HttpClient\` itself = Facade. String interning = Flyweight.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Calling any wrapper class "a Decorator" | Check intent — if it changes the interface, it's Adapter; if it's about access control, it's Proxy |\r
| Using Facade to mean "hide everything, forever" | Facade simplifies the common path; the subsystem's full API should still be reachable when needed |\r
| Building a Composite without a shared interface for leaf and branch | Both \`File\` and \`Folder\` must implement the same \`IFileSystemItem\` contract |\r
| Reaching for Bridge when Strategy would do | Use Bridge when *two* hierarchies vary independently; Strategy is enough for one varying algorithm |\r
| Ignoring extrinsic vs intrinsic state in Flyweight | Only intrinsic (shared, immutable) state belongs in the flyweight object; per-instance state stays outside it |\r
| Adding caching logic directly inside the real service class | Extract it into a Proxy so the real class stays focused on its one job (SRP) |\r
\r
## Summary\r
\r
Structural patterns compose objects into larger, more flexible shapes without hard-wiring the composition into inheritance. Adapter translates an incompatible interface, Decorator stacks optional behaviour on an unchanged interface, Facade flattens a complex subsystem into a simple entry point, and Proxy stands in for a real object to control access. Composite unifies leaf-and-branch tree structures, Bridge decouples two hierarchies that vary independently, and Flyweight shares immutable state to cut memory. The interview-winning move is naming *intent*, not shape — Adapter/Decorator/Proxy are structurally identical, and only the reason you're wrapping the object tells you which one you're actually looking at.\r
\r
## Top Interview Questions\r
\r
### Q1. Adapter, Decorator and Proxy all wrap another object behind an interface. How do you tell them apart?\r
\r
They differ by **intent**, not structure. Adapter exists because two interfaces don't match — its whole job is translation, converting calls from the interface the client expects to the interface the wrapped object actually has, with no new behaviour added. Decorator keeps the interface identical to what it wraps and exists to **add behaviour** — logging, compression, retries — and is explicitly designed so you can stack several of them on one object. Proxy also keeps the interface identical, but its purpose is **controlling access** to the real object — lazy loading it, caching its results, or checking permissions — the client typically shouldn't even know it isn't talking to the real thing. In an interview, I'd ask myself: does this change the interface (Adapter)? Is it meant to be stacked for extra features (Decorator)? Or is it gatekeeping access to the real object (Proxy)?\r
\r
### Q2. How does ASP.NET Core's \`HttpClient\` handler pipeline map to the Decorator pattern?\r
\r
Each \`DelegatingHandler\` in the pipeline implements the same abstract \`SendAsync\` contract and wraps an \`InnerHandler\` of the same type, adding behaviour (auth header injection, retry logic, logging) before or after calling \`base.SendAsync\` to forward to the next handler in the chain — that's exactly the Decorator shape: same interface, stacked wrappers, each adding one concern. This is powerful because handlers can be composed in any order and reused across different \`HttpClient\` instances via \`IHttpClientFactory\`, without ever subclassing \`HttpClient\` itself for each combination of concerns — which is precisely the combinatorial-explosion problem Decorator is meant to solve.\r
\r
### Q3. What's the difference between Facade and Adapter — don't they both "wrap" something?\r
\r
They solve different problems. Adapter's job is **interface translation** for **one** object whose interface doesn't match what the client expects — it doesn't reduce complexity, it just makes an incompatible shape fit. Facade's job is **simplification** — it sits in front of **multiple** classes/subsystems with a complex internal protocol between them, and exposes one easy high-level method that coordinates all of them internally. A useful test: if you removed the wrapper, would the client still be able to call the underlying object directly with a bit more code (that's Facade — the subsystem's classes are still usable on their own), or would the client be completely unable to use the underlying object because the interface genuinely doesn't match (that's Adapter)?\r
\r
### Q4. Give a concrete example of when you'd use a Proxy for lazy loading, and how it stays transparent to the caller.\r
\r
Entity Framework Core's lazy-loading proxies are the standard example: when a \`Blog\` entity has a \`Posts\` navigation property and lazy loading is enabled, EF Core generates a dynamic proxy subclass of \`Blog\` at runtime that intercepts access to \`Posts\` and triggers a database query the first time it's touched, then caches the result. The caller writes \`blog.Posts\` exactly as if it were a plain in-memory collection — there's no \`if (proxy)\` branching, no special API — because the proxy implements/extends the exact same public surface as the real entity. This transparency is the point of Proxy: the client's code doesn't change at all whether it's handed the real object or a proxy standing in for it.\r
\r
### Q5. How does Composite let you treat a single object and a collection of objects the same way? Walk through a file system example.\r
\r
Both \`File\` and \`Folder\` implement the same interface, say \`IFileSystemItem\` with a \`GetSize()\` method. \`File.GetSize()\` returns its own stored size directly — the leaf case. \`Folder.GetSize()\` holds a list of child \`IFileSystemItem\`s (which can themselves be files or more folders) and implements \`GetSize()\` by summing \`GetSize()\` recursively over all its children. Because both classes share the same interface, calling code never needs to check "is this a file or a folder" — it just calls \`GetSize()\` polymorphically on the root and the whole tree's total size falls out of the recursion, regardless of how deeply nested the folder structure is. This uniform treatment of leaves and composites is exactly what makes tree-shaped domains (file systems, UI component trees, org charts) a natural fit for Composite.\r
\r
### Q6. When would you use Bridge instead of just adding more subclasses?\r
\r
Bridge is the right call when you have **two dimensions of variation** that would otherwise multiply into a combinatorial explosion of subclasses — for example, shapes (\`Circle\`, \`Square\`) that each need to support multiple rendering strategies (\`VectorRenderer\`, \`RasterRenderer\`). Modelling this with pure inheritance would need one subclass per combination (\`VectorCircle\`, \`RasterCircle\`, \`VectorSquare\`, \`RasterSquare\` — 4 classes for 2×2, growing multiplicatively as either dimension grows). Bridge splits it into two independent hierarchies — \`Shape\` holds a reference to an \`IRenderer\` it delegates rendering to — so adding a third shape or a third renderer only adds one class, not a new row and column of combinations. It's structurally similar to Strategy; the distinguishing framing is that Bridge is specifically about decoupling an **abstraction hierarchy** from an **implementation hierarchy** that both need to grow independently.\r
\r
### Q7. What problem does Flyweight solve, and what's the difference between intrinsic and extrinsic state?\r
\r
Flyweight solves a memory problem: when you need to instantiate a very large number of similar objects, storing duplicate copies of shared data in every instance wastes significant memory — millions of on-screen text characters each storing their own copy of font/size/color data, for example. Intrinsic state is the data that's shared and immutable across many objects (the font/size/color definition), and it lives inside the single shared flyweight object, created once and reused via a factory that caches instances by their intrinsic-state key. Extrinsic state is the data unique to each individual usage (a character's position on screen, or the specific character glyph) — it's passed in from outside at the point of use rather than stored in the flyweight, keeping the shared object immutable and safe to reuse across contexts.\r
\r
### Q8. A teammate wants to add a caching layer directly inside a \`FileService\` class. Why might a Proxy be a better design choice?\r
\r
Adding caching logic directly inside \`FileService\` violates the Single Responsibility Principle — the class now has two reasons to change (how files are read, and how caching works), and every test of file-reading logic now also has to account for caching behaviour, making the class harder to test in isolation. A \`CachingFileServiceProxy : IFileService\` that wraps the real \`FileService\` keeps both concerns separate and independently testable: you can unit test \`RealFileService\` without any caching concerns, and separately test the proxy's caching logic with a fake \`IFileService\`. It's also more flexible in production — you can compose or remove the caching proxy at the DI registration level without touching \`RealFileService\`'s code at all, and you could layer a second proxy (say, an authorization check) on top without either proxy knowing about the other.\r
\r
### Q9. How would you use Decorator to add cross-cutting concerns like logging and retry to a service, and what's the risk of overusing it?\r
\r
I'd define the retry and logging decorators against the same interface as the underlying service (\`IPaymentGateway\`), each holding a reference to the next \`IPaymentGateway\` in the chain and adding its concern before/after delegating — \`new LoggingPaymentGateway(new RetryPaymentGateway(new RealPaymentGateway()))\` — so any combination and ordering of these concerns can be composed at the registration point without modifying the real service or each other. The risk of overusing Decorator is losing track of behaviour: with five or six stacked decorators, it becomes hard to reason about the exact order of operations and to debug where in the chain something failed, especially if the decorators aren't named clearly or their order matters in a non-obvious way. In practice, I'd keep decorator chains short (2–4), name them by concern, and consider a small pipeline/middleware abstraction with explicit ordering once the chain grows past that.\r
\r
### Q10. Name a real .NET/BCL type for each of Adapter, Decorator, Facade and Proxy, and justify the classification.\r
\r
\`StreamReader\` is an Adapter — it wraps a byte-oriented \`Stream\` and exposes a text-oriented \`ReadLine()\`/\`ReadToEnd()\` API, translating one interface shape into a fundamentally different one the caller wants. \`GZipStream\` wrapping a \`FileStream\` is a Decorator — both are \`Stream\`s, and \`GZipStream\` adds compression behaviour transparently while preserving the exact same \`Stream\` contract, and can itself be wrapped by another \`Stream\` decorator like \`BufferedStream\`. \`HttpClient\` is a Facade — it hides the far more complex machinery of \`HttpMessageHandler\` chains, socket pooling, and DNS resolution behind a simple \`GetAsync\`/\`PostAsync\` surface most callers never need to look past. Entity Framework Core's dynamically generated lazy-loading proxy subclasses of your entity types are a Proxy — they intercept navigation property access to defer a database query, transparently standing in for the real entity object.\r
`;export{e as default};
