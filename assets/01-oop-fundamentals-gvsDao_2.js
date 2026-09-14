const e=`---\r
title: OOP Fundamentals\r
description: A refresher on the four pillars of OOP, polymorphism nuances, coupling versus cohesion, and the class relationships interviewers expect you to model correctly\r
difficulty: Foundational\r
tags: [oop, encapsulation, polymorphism, inheritance, design]\r
---\r
\r
Every LLD round starts by probing whether you actually understand objects or just know the vocabulary. The four pillars are table stakes — what separates a senior answer is naming the trade-off, spotting the Liskov trap, and knowing exactly when composition beats inheritance.\r
\r
## Classes and objects\r
\r
A **class** is a blueprint — it defines the attributes and methods that every instance built from it will share, but it occupies no memory on its own. An **object** is a concrete instance of that blueprint, created at runtime with the \`new\` keyword, holding its own independent state in memory. Many objects can come from one class, each with a different state but identical behaviour.\r
\r
![alt text](notes/LLD/OOPs/image.png)\r
\r
\`\`\`mermaid\r
classDiagram\r
    class Car {\r
        +string Make\r
        +string Model\r
        +int Year\r
        +Start()\r
    }\r
    Car <|-- myCar : instance\r
    Car <|-- yourCar : instance\r
\`\`\`\r
\r
> [!KEY]\r
> Think **classes → objects → applications**: you design the blueprint once, instantiate it as many times as the runtime needs, and build the system out of how those instances collaborate. A constructor's only job is initializing that per-instance state — it runs exactly once, at creation, and (aside from static members) every other member operates on the state it set up.\r
\r
## Encapsulation\r
\r
Encapsulation bundles data and the behaviour that operates on it into one unit, and restricts direct access to that data from outside. The interview definition: *"hiding internal state and forcing all interaction through a controlled interface."* It is achieved with access modifiers, not just getters and setters — a public getter that returns a mutable list is not encapsulated at all.\r
\r
\`\`\`csharp\r
class BankAccount {\r
    private decimal _balance;\r
    public decimal Balance => _balance;\r
\r
    public void Deposit(decimal amount) {\r
        if (amount <= 0) throw new ArgumentException("Deposit must be positive");\r
        _balance += amount;\r
    }\r
}\r
\`\`\`\r
\r
> [!WARNING]\r
> Returning a private \`List<T>\` field directly from a getter leaks a mutable reference — the caller can mutate internal state without going through your validation. Return a copy, a read-only wrapper, or \`IReadOnlyList<T>\`.\r
\r
## Abstraction\r
\r
Abstraction hides *implementation* detail and exposes only the essential *behaviour* a caller needs — it answers "what can I do with this?" not "how does it do it?". In C# this is modelled with \`interface\` and \`abstract class\`.\r
\r
\`\`\`csharp\r
interface IPaymentGateway {\r
    Task<bool> Charge(decimal amount, string customerId);\r
}\r
// Caller depends only on this contract, never on Stripe/Razorpay specifics.\r
\`\`\`\r
\r
The interview definition to say out loud: *"abstraction is a design-time decision about what to expose; it lets callers program against a contract instead of a concrete class."*\r
\r
## Inheritance\r
\r
Inheritance models an **is-a** relationship: a derived class reuses and extends a base class's members.\r
\r
\`\`\`csharp\r
class Vehicle {\r
    public int Year { get; init; }\r
    public virtual void Start() => Console.WriteLine("Vehicle starting");\r
}\r
class Car : Vehicle {\r
    public override void Start() => Console.WriteLine("Car engine starting");\r
}\r
\`\`\`\r
\r
Inheritance is the **tightest** coupling relationship in OOP — the derived class depends on the base class's implementation details, not just its contract, and changes to the base ripple into every subclass (the "fragile base class" problem). Use it only when the relationship is a genuine is-a **and** every subclass can honestly satisfy every promise the base class makes.\r
\r
## Polymorphism\r
\r
Polymorphism means the same call site produces different behaviour depending on the actual object involved. There are two flavours, and interviewers expect you to name both immediately.\r
\r
| Aspect | Overloading (compile-time) | Overriding (runtime) | Hiding (\`new\`) |\r
|---|---|---|---|\r
| Binding | Resolved at compile time by signature | Resolved at runtime by actual object type | Resolved at compile time by static type |\r
| Requires | Same name, different parameters | \`virtual\` base + \`override\` derived | \`new\` keyword on derived member |\r
| Polymorphic? | No — it's just name reuse | Yes — true dynamic dispatch | No — breaks polymorphism silently |\r
| Common bug | None significant | Forgetting \`virtual\` on base | Calling via base reference gives base behaviour unexpectedly |\r
\r
\`\`\`csharp\r
class Animal {\r
    public virtual void Speak() => Console.WriteLine("...");\r
}\r
class Dog : Animal {\r
    public override void Speak() => Console.WriteLine("Woof"); // runtime dispatch\r
}\r
class Cat : Animal {\r
    public new void Speak() => Console.WriteLine("Meow"); // hides, not overrides\r
}\r
\r
Animal a = new Cat();\r
a.Speak(); // prints "..." — hiding is resolved by the compile-time type, a classic trap\r
\`\`\`\r
\r
> [!KEY]\r
> Overloading is resolved by the **compiler** using parameter types; overriding is resolved by the **CLR** using the object's actual runtime type via a virtual method table. If you can't explain *why* method hiding prints the base implementation, you don't yet understand dynamic dispatch.\r
\r
## Abstraction vs Encapsulation — the classic mix-up\r
\r
These two get confused constantly because both involve "hiding" something. The distinction interviewers listen for is **what** is hidden and **why**.\r
\r
| | Abstraction | Encapsulation |\r
|---|---|---|\r
| Hides | Implementation complexity | Internal state / data |\r
| Operates at | Design level (what to expose) | Code level (access control) |\r
| Mechanism | Interfaces, abstract classes | \`private\`/\`protected\`, properties |\r
| Goal | Reduce cognitive load for the caller | Prevent invalid state / accidental mutation |\r
| Analogy | A car's steering wheel hides engine mechanics | The engine bay being locked/sealed |\r
\r
> [!TIP]\r
> A senior answer: *"Abstraction is about the interface you design; encapsulation is about the access you enforce. You can have encapsulation without abstraction — a class with private fields and no interface — but you can't have good abstraction without some encapsulation behind it."*\r
\r
## Association, Aggregation, Composition\r
\r
These three describe how objects relate to each other, in increasing order of ownership strength.\r
\r
\`\`\`mermaid\r
classDiagram\r
    Driver --> Car : association (drives)\r
    Library o-- Book : aggregation (has-a, independent lifetime)\r
    Car *-- Engine : composition (has-a, owned lifetime)\r
\`\`\`\r
\r
| Relationship | Strength | Lifetime | UML notation | Example |\r
|---|---|---|---|---|\r
| Association | Weakest — "uses" | Independent objects, no ownership | Plain line | \`Driver\` drives a \`Car\` |\r
| Aggregation | Has-a, whole-part | Part can outlive the whole | Hollow diamond | \`Library\` has \`Book\`s that survive if the library closes |\r
| Composition | Has-a, strong ownership | Part dies with the whole | Filled diamond | \`Car\` owns its \`Engine\`; delete the car, the engine goes too |\r
\r
\`\`\`csharp\r
class Engine { }\r
class Car {\r
    private readonly Engine _engine = new(); // composition: Car creates and owns Engine's lifetime\r
}\r
class Library {\r
    private List<Book> _books; // aggregation: books passed in, outlive the library\r
    public Library(List<Book> books) => _books = books;\r
}\r
\`\`\`\r
\r
## Coupling and Cohesion\r
\r
**Coupling** measures how much one module knows about / depends on another. **Cohesion** measures how focused a single module's responsibilities are. The interview goal is always **low coupling, high cohesion** — modules that do one thing well and interact through narrow, stable contracts.\r
\r
| | Low (bad) | High (good) |\r
|---|---|---|\r
| Cohesion | A \`UserManager\` that also sends emails, logs, and formats reports | A \`UserRepository\` that only persists users |\r
| Coupling | Class \`A\` reaches into \`B\`'s internals or concrete type | Class \`A\` depends only on an interface \`IB\` |\r
\r
High cohesion tends to *reduce* coupling naturally — small, focused classes have fewer reasons to reach into each other.\r
\r
## The Square-Rectangle Problem (LSP)\r
\r
The textbook example of inheritance modelling a *mathematical* is-a relationship that breaks a *behavioural* one.\r
\r
\`\`\`mermaid\r
classDiagram\r
    class Rectangle {\r
        +int Width\r
        +int Height\r
        +int Area()\r
    }\r
    class Square {\r
        +int Width\r
        +int Height\r
        +int Area()\r
    }\r
    Rectangle <|-- Square\r
\`\`\`\r
\r
\`\`\`csharp\r
class Rectangle {\r
    public virtual int Width { get; set; }\r
    public virtual int Height { get; set; }\r
    public int Area() => Width * Height;\r
}\r
class Square : Rectangle {\r
    public override int Width { get => base.Width; set { base.Width = base.Height = value; } }\r
    public override int Height { get => base.Height; set { base.Width = base.Height = value; } }\r
}\r
\r
void Resize(Rectangle r) {\r
    r.Width = 5;\r
    r.Height = 10;\r
    Debug.Assert(r.Area() == 50); // fails for Square — silently sets both to 10\r
}\r
\`\`\`\r
\r
> [!DANGER]\r
> A \`Square\` is a \`Rectangle\` mathematically, but setting \`Width\` independently of \`Height\` is a promise the base class makes that \`Square\` cannot keep. This is a real Liskov Substitution Principle violation, not a contrived one — it's the go-to example because it shows is-a in language doesn't guarantee is-a in behaviour.\r
\r
## Law of Demeter\r
\r
Also called the "principle of least knowledge": a method should only talk to its immediate collaborators, not reach through them to grab objects several hops away.\r
\r
\`\`\`csharp\r
// Violates Demeter — reaches through three objects\r
var zip = order.GetCustomer().GetAddress().GetZipCode();\r
\r
// Respects Demeter — Order exposes the one thing callers need\r
var zip = order.GetCustomerZipCode();\r
\`\`\`\r
\r
Method chains on the *same* fluent object (\`query.Where(...).OrderBy(...)\`) are fine — Demeter is about crossing object boundaries, not chaining calls on one API.\r
\r
## Cheat sheet\r
\r
- **Encapsulation** hides state; **abstraction** hides implementation complexity behind a contract.\r
- **Overloading** = compile-time, same class, different signature. **Overriding** = runtime, \`virtual\`/\`override\`, needs inheritance. **Hiding** (\`new\`) breaks polymorphism silently.\r
- Association = uses, Aggregation = has-a (independent lifetime), Composition = has-a (owned lifetime).\r
- Prefer **high cohesion, low coupling** — it is the single sentence that unifies SRP, the LSP, and composition-over-inheritance.\r
- The square/rectangle example proves is-a in English ≠ is-a in behaviour.\r
- Law of Demeter: talk to friends, not friends-of-friends.\r
- Inheritance couples on implementation; interfaces couple on contract only — prefer the latter unless the hierarchy is genuinely stable.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Calling getters/setters "encapsulation" by itself | Encapsulation is the access control + invariant protection, not the existence of properties |\r
| Using \`new\` (hiding) instead of \`override\` and not noticing | Always mark base methods \`virtual\`/\`abstract\` and derived ones \`override\` |\r
| Modelling every has-a relationship as inheritance | Ask "is it truly substitutable?" before inheriting; default to composition |\r
| Confusing aggregation and composition in a diagram | Ask "does the part's lifetime depend on the whole?" — if yes, composition |\r
| Returning mutable internal collections from a getter | Return \`IReadOnlyList<T>\` or a defensive copy |\r
| Treating LSP as "subclass must not throw" | It's about preserving preconditions/postconditions and invariants, throwing is one symptom |\r
\r
## Summary\r
\r
The four pillars are the vocabulary, not the whole test — interviewers want to see you apply them to catch real problems: a hiding bug from a missing \`virtual\`, a broken invariant from a square extending a rectangle, or a bloated class with low cohesion. Ground every answer in "what changes together" and "what needs to be substitutable", and prefer narrow contracts (interfaces, composition) over deep hierarchies unless the is-a relationship is truly stable and behavioural.\r
\r
## Top Interview Questions\r
\r
### Q1. What are the four pillars of OOP and why do they matter?\r
\r
Encapsulation (bundling data with behaviour and restricting access), abstraction (exposing essential behaviour via a contract, hiding implementation), inheritance (reusing and extending behaviour through an is-a relationship), and polymorphism (one call site, many behaviours). They matter because together they let you build systems where callers depend on stable contracts instead of concrete details, so a change in one implementation doesn't ripple through the whole codebase. In interviews, naming them is the easy part — the signal is explaining how they interact, e.g. how abstraction enables polymorphism, and where inheritance overreaches into fragile coupling.\r
\r
### Q2. What is the difference between compile-time and runtime polymorphism?\r
\r
Compile-time polymorphism (method overloading) is resolved by the compiler purely from the method signature — name plus parameter types/count — before the program ever runs. Runtime polymorphism (method overriding) is resolved by the CLR at call time using the object's actual type via a virtual method table (vtable), which is why it requires \`virtual\` on the base and \`override\` on the derived method. The practical consequence: overloading gives you readability and convenience; overriding gives you true dynamic dispatch, which is what makes patterns like Strategy and Template Method possible.\r
\r
### Q3. What's the difference between method overriding and method hiding in C#?\r
\r
Overriding (\`override\` on a \`virtual\`/\`abstract\` base member) participates in dynamic dispatch — calling through a base reference still invokes the derived implementation. Hiding (\`new\` on a member with the same signature but no \`virtual\` relationship) breaks that: calling through a base-typed reference invokes the *base* implementation, while calling through a derived-typed reference invokes the derived one. This is a classic bug source — a \`List<Animal>\` containing a \`Cat\` hidden with \`new Speak()\` will call \`Animal.Speak()\` when iterated as \`Animal\`, silently producing wrong behaviour with no compiler warning beyond a hint.\r
\r
### Q4. Explain the difference between abstraction and encapsulation with an example.\r
\r
Abstraction is a design-level decision about *what* to expose — an \`IPaymentGateway\` interface hides whether charging goes through Stripe or Razorpay, so callers only see \`Charge(amount)\`. Encapsulation is a code-level mechanism for *access control* — a \`BankAccount\` class makes \`_balance\` private and only lets it change through \`Deposit\`/\`Withdraw\`, protecting invariants like "balance never goes negative". You can encapsulate without abstracting (a sealed class with private fields and no interface), but strong abstraction is hard to achieve without encapsulation behind it, because a leaky implementation defeats the purpose of hiding it.\r
\r
### Q5. What is the difference between association, aggregation, and composition?\r
\r
All three describe one class referencing another, differing in ownership strength. Association is the weakest — two objects interact but neither owns the other's lifetime (a \`Driver\` and a \`Car\`). Aggregation is a has-a relationship where the part can exist independently of the whole (a \`Library\` has \`Book\`s, but the books exist before and after the library does). Composition is strong ownership — the part's lifetime is bound to the whole (a \`Car\` owns its \`Engine\`; destroy the car, the engine goes with it). In UML, these are drawn as a plain line, a hollow diamond, and a filled diamond respectively, and the question almost always leads to "which one would you use for X" as a follow-up.\r
\r
### Q6. What is the Liskov Substitution Principle, and why does square-extends-rectangle violate it?\r
\r
LSP says subtypes must be substitutable for their base type without altering the correctness of the program — a caller using the base type's contract shouldn't be able to detect it's actually holding a subtype. Concretely, subtypes must not strengthen preconditions or weaken postconditions/invariants the base guarantees. \`Square : Rectangle\` violates this because \`Rectangle\` implicitly promises that setting \`Width\` and \`Height\` are independent operations; \`Square\` breaks that invariant by forcing them to stay equal, so code that sets \`Width = 5; Height = 10;\` and asserts \`Area() == 50\` silently fails for a \`Square\`. The fix is to not model it as inheritance at all — use a common \`Shape\` abstraction with independent \`Rectangle\` and \`Square\` implementations, or make both immutable.\r
\r
### Q7. What is coupling and cohesion, and how do you identify a class with low cohesion?\r
\r
Coupling is the degree of interdependency between modules; cohesion is how focused a single module's responsibilities are. Low cohesion shows up as a class with unrelated methods that don't share the same data or purpose — e.g. a \`UserManager\` that validates users, sends welcome emails, and generates PDF reports. The tell in code review: methods that use disjoint subsets of the class's fields, a class name that needs "and" to describe it, or a change request that only touches a third of the class's methods every time. The fix is usually to split by responsibility (often mirroring SRP) and let the split classes collaborate through narrow interfaces, which also reduces coupling as a side effect.\r
\r
### Q8. When is inheritance the right choice, and when should you reach for composition instead?\r
\r
Inheritance is appropriate when there's a genuine, stable is-a relationship where every subclass can honestly fulfill the base class's full contract — think \`Shape\` with a fixed \`Area()\` contract, or a framework's template method pattern where you extend one abstract hook. Composition is preferable whenever behaviour varies independently of "type" (a \`Duck\` that can \`Fly\` or not depending on configuration, not species), when you need to change behaviour at runtime, or when the hierarchy would need multiple inheritance to express reality (a \`FlyingSwimmingRobot\`). The rule of thumb interviewers want to hear: "favour composition by default; reach for inheritance only when the relationship is truly is-a and the base class contract is stable."\r
\r
### Q9. What is the Law of Demeter and why does violating it matter in practice?\r
\r
The Law of Demeter (principle of least knowledge) says a method should only invoke methods on itself, its parameters, objects it creates, or its direct fields — not on objects returned by those, i.e. avoid chains like \`a.GetB().GetC().GetD()\`. Violating it tightly couples the calling code to the entire object graph's shape: if \`Customer\` ever restructures how it stores \`Address\`, every caller that wrote \`order.GetCustomer().GetAddress().GetZipCode()\` breaks. The fix is to add a small delegating method (\`order.GetCustomerZipCode()\`) on the object that already has direct access, which also usually improves encapsulation since the intermediate objects' internals stop leaking outward.\r
\r
### Q10. In a production codebase, how would you refactor a \`God class\` that violates several OOP principles at once?\r
\r
I'd start by cataloguing responsibilities — list every distinct reason the class changes, which usually reveals an SRP violation. I'd extract each responsibility into its own class behind an interface (e.g. pull \`SendEmail\` into an \`INotificationSender\`), wiring the original class to depend on the abstraction via constructor injection rather than instantiating concretes directly — that's DIP in action and makes the class testable in isolation. Where I see deep inheritance used to share code rather than model true is-a relationships, I'd flatten it and use composition with strategy objects instead. I'd do this incrementally behind the existing public API/tests so behaviour never breaks mid-refactor, and I'd validate each extraction with unit tests before touching the next responsibility.\r
`;export{e as default};
