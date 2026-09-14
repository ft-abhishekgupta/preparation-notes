const e=`---\r
title: Composition Over Inheritance\r
description: Why deep class hierarchies collapse under real requirements, how to refactor them into composed behaviour, and when inheritance still earns its keep\r
difficulty: Core\r
tags: [oop, composition, inheritance, design, refactoring]\r
---\r
\r
"Prefer composition over inheritance" is the single most quoted design rule in LLD interviews, and also the most shallowly answered. A senior response explains *why* hierarchies break, shows the refactor, and still names the narrow cases where inheritance is correct.\r
\r
## Why deep inheritance hierarchies break\r
\r
Three failure modes show up repeatedly once a hierarchy grows past two levels.\r
\r
- **Fragile base class problem** — a change to a base class (even a seemingly safe one, like adding a call inside an existing method) can silently break every subclass that overrides related behaviour, because subclasses depend on the base's *implementation*, not just its contract.\r
- **Rigid taxonomy** — real-world categories don't stay clean. Modelling \`Penguin : Bird\` works until you need \`Fly()\`, and now every bird either fakes flight or the taxonomy has to be redesigned.\r
- **Combinatorial explosion** — if behaviour varies along two independent axes (say, "can fly" × "can swim"), subclassing needs one class per *combination*: \`FlyingSwimmingBird\`, \`FlyingOnlyBird\`, \`SwimmingOnlyBird\`, \`NeitherBird\`. Add a third axis and the class count multiplies again.\r
\r
> [!KEY]\r
> Inheritance couples a subclass to the base class's *implementation*. Composition couples an object only to a *contract* (an interface). Contracts change far less often than implementations, so composition is structurally more stable over the life of a codebase.\r
\r
## The classic duck/bird example\r
\r
The textbook illustration of the taxonomy problem: modelling flight as an inherited method.\r
\r
\`\`\`csharp\r
// BEFORE — inheritance forces every subclass into one shape\r
class Bird {\r
    public virtual void Fly() => Console.WriteLine("Flying");\r
}\r
class Duck : Bird { }             // fine, ducks fly\r
class Penguin : Bird {\r
    public override void Fly() => throw new NotSupportedException(); // LSP violation\r
}\r
\`\`\`\r
\r
\`Penguin\` is forced to override \`Fly()\` just to break the promise the base class made. Any code that treats a \`List<Bird>\` polymorphically and calls \`Fly()\` on each one can now blow up at runtime for a perfectly valid \`Bird\`.\r
\r
\`\`\`mermaid\r
classDiagram\r
    class Bird {\r
        +Fly()\r
    }\r
    class Duck\r
    class Penguin\r
    Bird <|-- Duck\r
    Bird <|-- Penguin\r
    note for Penguin "Fly() throws — violates LSP"\r
\`\`\`\r
\r
## Refactoring to strategy composition\r
\r
Pull the varying behaviour out into its own interface and *compose* it into the bird, instead of inheriting it.\r
\r
\`\`\`csharp\r
// AFTER — flight behaviour is composed, not inherited\r
interface IFlyBehavior {\r
    void Fly();\r
}\r
class CanFly : IFlyBehavior {\r
    public void Fly() => Console.WriteLine("Flying");\r
}\r
class CannotFly : IFlyBehavior {\r
    public void Fly() => Console.WriteLine("Cannot fly");\r
}\r
\r
class Bird {\r
    private readonly IFlyBehavior _flyBehavior;\r
    public Bird(IFlyBehavior flyBehavior) => _flyBehavior = flyBehavior;\r
    public void PerformFly() => _flyBehavior.Fly();\r
}\r
\r
var duck = new Bird(new CanFly());\r
var penguin = new Bird(new CannotFly());\r
\`\`\`\r
\r
\`\`\`mermaid\r
classDiagram\r
    class IFlyBehavior {\r
        <<interface>>\r
        +Fly()\r
    }\r
    class CanFly {\r
        +Fly()\r
    }\r
    class CannotFly {\r
        +Fly()\r
    }\r
    class Bird {\r
        -IFlyBehavior flyBehavior\r
        +PerformFly()\r
    }\r
    IFlyBehavior <|.. CanFly\r
    IFlyBehavior <|.. CannotFly\r
    Bird --> IFlyBehavior : composed\r
\`\`\`\r
\r
Now \`Penguin\` never exists as a class that lies about its capabilities — it's just a \`Bird\` composed with \`CannotFly\`. Adding a "swims" axis means composing an \`ISwimBehavior\` the same way, with **no** multiplication of classes — this is the Strategy pattern applied to solve exactly the combinatorial-explosion problem.\r
\r
## Delegation\r
\r
Delegation is the mechanism composition uses to reuse behaviour: instead of inheriting a method, an object holds a reference to a collaborator and forwards the call to it.\r
\r
\`\`\`csharp\r
class Car {\r
    private readonly Engine _engine = new();\r
    public void Start() => _engine.Start(); // delegates, doesn't inherit Engine's API\r
}\r
\`\`\`\r
\r
The difference from inheritance: \`Car\` exposes only \`Start()\`, not the entire \`Engine\` surface area, and \`Engine\` can be swapped (electric vs combustion) without touching \`Car\`'s public contract.\r
\r
## Mixins via interfaces plus composition\r
\r
C# has no native mixins, but you get the same effect with default interface methods or composed helper objects, letting a class pick up several independent capabilities without a rigid single-parent hierarchy.\r
\r
\`\`\`csharp\r
interface ILoggable {\r
    void Log(string msg) => Console.WriteLine($"[LOG] {msg}"); // default interface method\r
}\r
interface IAuditable {\r
    void Audit(string action) => Console.WriteLine($"[AUDIT] {action}");\r
}\r
class OrderService : ILoggable, IAuditable {\r
    public void Place() {\r
        Log("Placing order");\r
        Audit("OrderPlaced");\r
    }\r
}\r
\`\`\`\r
\r
\`OrderService\` picks up two independent capabilities without any base class — each capability is a separate axis, exactly like composing \`IFlyBehavior\` and \`ISwimBehavior\`.\r
\r
## Naming every relationship between two classes\r
\r
Before you can decide has-a versus is-a, you need the full vocabulary — inheritance and composition are only two of six relationship types that show up between classes during design, and interviewers notice when a candidate calls everything "it uses it."\r
\r
| Relationship | Meaning | Example |\r
|---|---|---|\r
| Association | A knows/works with B; both are independent | \`Teacher\` works with \`Student\` |\r
| Aggregation | A has B; B can exist independently | \`Department\` has externally-created \`Staff\` |\r
| Composition | A owns B and controls its lifetime | \`Classroom\` creates and owns its \`Desk\`s |\r
| Dependency | A temporarily uses B (a parameter, a return value) | A method receives \`IPayment\` as an argument |\r
| Realization | A implements interface B | \`EmailNotifier\` implements \`INotifier\` |\r
| Inheritance | A is a B | \`GraduateStudent\` derives from \`Student\` |\r
\r
\`\`\`csharp\r
var student = new Student("Ava");\r
Student graduateStudent = new GraduateStudent("Liam"); // inheritance\r
\r
teacher.Teach(student);                                // association\r
department.AddTeacher(teacher);                        // aggregation — teacher outlives the department\r
var classroom = new Classroom(deskCount: 20);           // composition — desks created and owned internally\r
\r
INotifier notifier = new EmailNotifier();               // realization\r
enrollmentService.Enroll(student, notifier);            // dependency — notifier is only a parameter here\r
\`\`\`\r
\r
Finding these relationships during design starts with finding the entities: list the nouns in the requirements, then for each one ask whether it needs its own state and behaviour (a class) or whether it's just an attribute of something else (a field). Only once the entities are settled does it make sense to draw the arrows between them.\r
\r
> [!TIP]\r
> For any has-a pair you find, one question resolves aggregation versus composition immediately: *"if the container is destroyed right now, does the contained object still make sense on its own?"* If yes, it's aggregation; if the part has no independent reason to exist, it's composition.\r
\r
## Has-a vs is-a: the decision table\r
\r
| Question | Answer points to |\r
|---|---|\r
| Does every subclass satisfy 100% of the base contract, always? | is-a → inheritance may be fine |\r
| Does behaviour need to change at runtime? | has-a → composition |\r
| Would you need a new subclass per combination of features? | has-a → composition (Strategy) |\r
| Is the relationship "a kind of" or "makes use of"? | "kind of" → inheritance; "makes use of" → composition |\r
| Do you need to substitute mocks/fakes easily in tests? | has-a → composition (inject an interface) |\r
| Is the base class stable and unlikely to change its implementation? | is-a → inheritance is lower risk |\r
\r
> [!TIP]\r
> Say this in the room: *"I'll ask whether every subtype can honor the full base contract without exceptions or no-ops. If yes and the hierarchy is shallow and stable, inheritance is fine. If behaviour varies independently or needs to change at runtime, I'll compose it instead."*\r
\r
## When inheritance is still the right call\r
\r
Composition-over-inheritance is a default, not an absolute. Inheritance remains the correct tool in a few specific shapes:\r
\r
- **Template Method pattern** — a base class defines a fixed algorithm skeleton and subclasses only override specific steps (e.g. \`DataImporter.Import()\` calls \`ReadSource()\`, \`Validate()\`, \`Save()\` where subclasses implement the hooks). Here the base class's *structure* is exactly what you want to reuse.\r
- **Framework extension points** — ASP.NET's \`ControllerBase\`, WPF's \`UserControl\`. You are extending a framework contract that is deliberately designed to be a stable base for subclassing.\r
- **True substitutability** — closed, well-understood type hierarchies where LSP genuinely holds, e.g. \`Exception\` subclasses, or shape hierarchies where every operation truly applies uniformly.\r
\r
\`\`\`csharp\r
abstract class DataImporter {\r
    public void Import() { // template method — fixed skeleton\r
        var raw = ReadSource();\r
        if (!Validate(raw)) throw new InvalidDataException();\r
        Save(raw);\r
    }\r
    protected abstract string ReadSource();\r
    protected abstract bool Validate(string data);\r
    protected abstract void Save(string data);\r
}\r
\`\`\`\r
\r
> [!WARNING]\r
> Template Method still couples subclasses to the base's algorithm shape — if the skeleton ever needs to change order, every subclass is affected. It's a narrower, more disciplined use of inheritance than a general taxonomy, which is why it survives the "prefer composition" rule.\r
\r
## The rule interviewers want to hear\r
\r
> [!NOTE]\r
> Not "never use inheritance" — that's the naive version and loses points for dogmatism. The senior version: *"Default to composition because it couples on contract, not implementation, and scales better when behaviour varies. Use inheritance only for a genuinely stable is-a relationship where LSP holds — template methods and framework hook points are the common legitimate cases."*\r
\r
## Cheat sheet\r
\r
- Inheritance couples to **implementation**; composition couples to **contract** — contracts change less.\r
- Three inheritance failure modes: fragile base class, rigid taxonomy, combinatorial explosion.\r
- Duck/bird problem: don't inherit a capability that not every subtype can honestly provide — compose it as a \`Strategy\` instead.\r
- Delegation = forwarding a call to a held collaborator; it's the mechanism composition uses for reuse.\r
- Mixins in C#: default interface methods let a class gain independent capabilities without a common base class.\r
- Six class relationships, weakest to strongest: dependency, association, aggregation, composition, realization, inheritance — know which arrow each one is before deciding has-a vs is-a.\r
- Aggregation vs composition test: "does the part still make sense if the whole is destroyed right now?" Yes → aggregation, no → composition.\r
- Decision test: "can every subtype satisfy 100% of the base contract, unconditionally?" If no, compose.\r
- Inheritance is still correct for Template Method, framework extension points, and genuinely closed/stable hierarchies.\r
- The rule to say out loud: favour composition by default, use inheritance only where is-a is true and the contract is stable.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Inheriting to reuse a utility method | Extract the method into a helper/service and compose it in, don't inherit for code reuse alone |\r
| Overriding a method to throw / no-op | That subtype shouldn't be in the hierarchy — model the capability as an optional composed strategy |\r
| Adding a new subclass for every feature combination | Split the varying axes into separate composed interfaces (Strategy) |\r
| Treating "prefer composition" as "inheritance is always wrong" | Recognize Template Method and framework hooks as legitimate inheritance use cases |\r
| Deep hierarchies (4+ levels) for organizational convenience | Flatten to one level of abstraction plus composed behaviour |\r
| Forgetting that composition still needs good interface design | A leaky or overly broad interface reintroduces coupling even without inheritance |\r
| Calling every relationship "association" because it's the simplest line | Ask whether the reference is temporary (dependency), independent (association/aggregation), or owned (composition) before drawing it |\r
| Adding a method to a class because "it might be useful" | Only add a method that serves a requirement already on the table — speculative surface area is still coupling |\r
\r
## Summary\r
\r
Deep inheritance hierarchies break because they couple subclasses to base-class implementation details and force every subtype into one rigid shape, which shows up as fragile base classes, rigid taxonomies, and combinatorial explosion when behaviour varies along more than one axis. The fix is to extract the varying behaviour into an interface and compose it in — the Strategy pattern — which is exactly how the duck/bird problem gets solved cleanly. Inheritance still earns its place for Template Method, framework extension points, and hierarchies where LSP genuinely holds; the interview-winning line is "favour composition by default, use inheritance only for a stable, honest is-a relationship."\r
\r
## Top Interview Questions\r
\r
### Q1. Why do people say "favour composition over inheritance"? What specifically breaks with deep hierarchies?\r
\r
Deep inheritance couples subclasses to the base class's *implementation*, not just its contract, so a change to the base — even one that looks safe — can silently break subclass behaviour (the fragile base class problem). It also forces every subtype into one taxonomy: real-world categories rarely stay clean, so you end up with subclasses that override a method just to throw or no-op (the duck/bird problem). Finally, if behaviour varies along more than one independent axis, subclassing needs one class per *combination* of axes, causing combinatorial class explosion. Composition avoids all three because it couples on a narrow interface that changes far less often than an implementation.\r
\r
### Q2. Walk through the duck/bird example and how you'd refactor it.\r
\r
A naive \`Bird\` base class with a virtual \`Fly()\` method forces \`Penguin : Bird\` to override \`Fly()\` and throw, because penguins can't fly — that's a Liskov Substitution Principle violation, since code that calls \`Fly()\` polymorphically on any \`Bird\` can now crash for a valid bird. The fix is to extract flight into an \`IFlyBehavior\` interface with \`CanFly\`/\`CannotFly\` implementations, and have \`Bird\` hold one via composition (constructor injection), delegating \`PerformFly()\` to it. This is the Strategy pattern: \`Penguin\` is simply \`new Bird(new CannotFly())\`, no subclass or exception needed, and adding a swim axis composes an \`ISwimBehavior\` the same way without multiplying classes.\r
\r
### Q3. What is the fragile base class problem, and how does composition avoid it?\r
\r
It's when a change to a base class breaks subclasses in ways the base class author didn't anticipate — for example, a base method starts calling another virtual method internally, and a subclass that overrode that inner method now gets invoked at an unexpected time, or in an unexpected order, breaking its invariants. This happens because subclasses are bound to the base's *implementation details* across an inheritance boundary that the compiler can't fully protect. Composition avoids it because a composed object only depends on the collaborator's public interface — as long as that interface's contract doesn't change, the internal implementation of the collaborator can change freely without breaking the composing class.\r
\r
### Q4. What is delegation, and how does it differ from inheritance for code reuse?\r
\r
Delegation is when an object reuses another object's behaviour by holding a reference to it and forwarding calls, rather than extending it — \`Car.Start()\` calls \`_engine.Start()\` instead of \`Car\` inheriting from \`Engine\`. The key difference from inheritance: delegation only exposes the methods the composing class chooses to forward, keeping the public surface narrow, whereas inheritance exposes (and commits to) the entire base class API, including protected members and any accidentally-inherited behaviour. Delegation also allows the collaborator to be swapped at runtime (a different \`Engine\` implementation) without changing \`Car\`'s type, which inheritance cannot do since the base type is fixed at compile time.\r
\r
### Q5. Does C# support mixins? How do you approximate them?\r
\r
C# has no first-class mixin construct, but default interface methods (C# 8+) get close: an interface can provide a default implementation, and any class implementing it picks up that behaviour without inheriting from a base class, so a class can compose several independent capabilities (\`ILoggable\`, \`IAuditable\`) side by side. This avoids the single-inheritance limitation — a class can only extend one base class but can implement many interfaces — and keeps each capability as an independent, testable axis. The trade-off: default interface methods can't hold instance state directly, so for stateful cross-cutting behaviour, plain composition (a held collaborator object) is usually cleaner than trying to force a mixin shape.\r
\r
### Q6. Give me a decision rule for choosing has-a versus is-a in a design.\r
\r
Ask: can every subtype satisfy 100% of the base type's contract, unconditionally, forever? If any subtype needs to override a method to throw, no-op, or change semantics, that's a sign the relationship isn't truly is-a — use has-a (composition) instead. Also ask whether the behaviour needs to vary at runtime (composition allows swapping a strategy object; inheritance's type is fixed at construction) and whether you'd need a new subclass per combination of independent features (a strong signal to split into composed strategies). If the hierarchy is shallow, the base is stable, and substitutability genuinely holds in both directions, inheritance is a reasonable, low-risk choice.\r
\r
### Q7. When is inheritance still the correct choice? Give concrete examples.\r
\r
Three legitimate cases: the Template Method pattern, where a base class fixes an algorithm's skeleton and subclasses only override specific steps (a \`DataImporter.Import()\` that calls abstract \`ReadSource\`/\`Validate\`/\`Save\` hooks) — here you deliberately want to reuse the base's *structure*. Framework extension points, like inheriting from ASP.NET's \`ControllerBase\` or WPF's \`UserControl\`, where the framework is explicitly designed as a stable base for extension. And genuinely closed, stable type hierarchies where LSP holds in both directions, such as the built-in \`Exception\` hierarchy. In all three, the base class's implementation is intentionally meant to be depended on, which is the opposite of the fragile-base-class scenario.\r
\r
### Q8. How would you refactor an existing deep inheritance hierarchy in a production codebase without a big-bang rewrite?\r
\r
I'd start by identifying which methods each subclass overrides purely to change behaviour versus which represent genuine structural extension — the former are candidates for extraction into strategy interfaces. I'd introduce the new interface (e.g. \`IFlyBehavior\`) alongside the existing hierarchy, have the base class accept it via constructor injection with a default that preserves current behaviour, and migrate one subclass at a time behind existing tests, verifying behaviour is unchanged after each step. Once every subclass is migrated to compose the strategy instead of overriding, I'd collapse the now-redundant subclasses into simple factory calls that compose the base type with the right strategy, and delete the empty subclasses last.\r
\r
### Q9. What's the risk of using composition badly — can it also create coupling problems?\r
\r
Yes — composition only pays off if the composed interface is well-designed. If the interface is too broad (a "fat" interface exposing implementation-specific methods), the composing class is still tightly coupled to the collaborator's shape, just without the syntax of inheritance. Composition can also hide dependencies if overused without dependency injection — a class that \`new\`s up five collaborators internally is just as hard to test and change as a rigid subclass. The fix is the same discipline as always: keep composed interfaces narrow (Interface Segregation Principle) and inject collaborators rather than constructing them internally, so the composing class depends only on abstractions it actually needs.\r
\r
### Q10. How does composition over inheritance relate to the Open/Closed Principle?\r
\r
They reinforce each other. OCP says a class should be open for extension but closed for modification — you should be able to add new behaviour without editing existing, tested code. With inheritance-heavy designs, adding a new behaviour combination often means editing a base class or adding yet another subclass into an already deep tree, risking the fragile base class problem. With composition, adding new behaviour means writing a new implementation of an existing interface (a new \`IFlyBehavior\`) and wiring it in — the composing class (\`Bird\`) never changes. This is why Strategy, Decorator, and similar composition-based patterns are frequently cited as the practical mechanism for achieving OCP.\r
\r
### Q11. How do you systematically identify the entities and relationships in a design before deciding has-a versus is-a?\r
\r
Start from the requirements as text and pull out the nouns — each noun is a candidate class. For each candidate, ask whether it needs its own state and behaviour (a real entity, like \`Order\`) or whether it's just an attribute of something else (a \`string status\` field, not a class). Once you have your entities, go pair by pair and classify the relationship: is one only passed as a parameter (dependency), does it merely collaborate without ownership (association), does one hold the other but the held object can outlive it (aggregation), does one own and construct the other (composition), does one implement a contract (realization), or is one a specialised version of another (inheritance)? I resolve aggregation versus composition specifically by asking whether the part still makes sense if the whole is deleted right now — that single question removes most of the ambiguity in a live design discussion.\r
`;export{e as default};
