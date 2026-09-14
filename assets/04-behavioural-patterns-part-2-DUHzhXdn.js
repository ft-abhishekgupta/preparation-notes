const e=`---\r
title: Behavioural Patterns Part 2\r
description: How State, Template Method, Iterator, Mediator and Memento organise object behaviour, plus a brief look at Visitor and Interpreter\r
difficulty: Core\r
tags: [design-patterns, behavioural-patterns, state, mediator, memento]\r
---\r
\r
Part 1 covered Strategy, Observer, Command and Chain of Responsibility. This page finishes the behavioural family: State (an object that transitions through a lifecycle), Template Method (a fixed algorithm skeleton with pluggable steps), Iterator (uniform traversal), Mediator (centralised coordination between objects), Memento (snapshot and restore), and a brief look at Visitor and Interpreter, which show up far less often but are worth recognising by name.\r
\r
## State Pattern\r
\r
**Problem:** an object's allowed behaviour depends entirely on what phase of its lifecycle it's in — an order can be shipped only if it's paid, a vending machine can dispense only after payment — and that logic is currently a \`switch (status)\` block duplicated across every method that touches the object. Every new status means editing several methods, and it's easy to miss one.\r
\r
State gives each phase its own class implementing a shared interface; the object holds a reference to its *current* state object and delegates behaviour to it. Transitions happen by swapping which state object is currently held — often the state itself decides the next state.\r
\r
\`\`\`mermaid\r
stateDiagram-v2\r
    [*] --> New\r
    New --> Paid: Payment received\r
    Paid --> Shipped: Warehouse dispatches\r
    Shipped --> Delivered: Courier confirms\r
    Paid --> Cancelled: Customer cancels\r
    New --> Cancelled: Customer cancels\r
    Delivered --> [*]\r
    Cancelled --> [*]\r
\`\`\`\r
\r
\`\`\`csharp\r
public interface IOrderState\r
{\r
    void Process(Order order);\r
}\r
\r
public class NewState : IOrderState\r
{\r
    public void Process(Order order)\r
    {\r
        Console.WriteLine("Payment captured");\r
        order.SetState(new PaidState()); // the state decides the next state\r
    }\r
}\r
\r
public class PaidState : IOrderState\r
{\r
    public void Process(Order order)\r
    {\r
        Console.WriteLine("Order shipped");\r
        order.SetState(new ShippedState());\r
    }\r
}\r
\r
public class ShippedState : IOrderState\r
{\r
    public void Process(Order order) => Console.WriteLine("Already shipped, nothing to do");\r
}\r
\r
public class Order\r
{\r
    private IOrderState _state = new NewState();\r
    public void SetState(IOrderState state) => _state = state;\r
    public void Process() => _state.Process(this);\r
}\r
\`\`\`\r
\r
Compare this to the alternative every candidate reaches for first:\r
\r
\`\`\`csharp\r
// Before: every method repeats the same switch, and it's easy to forget a branch\r
public void Process()\r
{\r
    switch (_status)\r
    {\r
        case "New": _status = "Paid"; break;\r
        case "Paid": _status = "Shipped"; break;\r
        case "Shipped": Console.WriteLine("Already shipped"); break;\r
    }\r
}\r
\`\`\`\r
\r
The \`switch\` version puts all lifecycle knowledge in one method that keeps growing; the State version puts each phase's rules in its own class, so adding "Refunded" is a new file, not an edit to \`Process\`, \`Cancel\`, \`Ship\` and every other method that happened to check \`_status\`.\r
\r
> [!KEY]\r
> State removes a giant \`switch\` by giving each branch its own class. The tell in an interview: "the object's behaviour changes as a direct result of what happened to it before" — that's a lifecycle, and lifecycles want State.\r
\r
A useful mental model: State is an object-oriented finite state machine — each state owns the rules for the current phase and the legal transition to the next one.\r
\r
**Real-world usage:** order/shipment lifecycles, vending machines (\`Idle → CoinInserted → Dispensing\`), traffic lights, TCP connection states, media players (\`Playing → Paused → Stopped\`), and workflow/document approval states.\r
\r
### Template Method vs Strategy\r
\r
Template Method fixes the *overall algorithm* in a base class and lets subclasses override specific steps; Strategy lets you swap the *entire algorithm* via composition.\r
\r
\`\`\`mermaid\r
classDiagram\r
    class DataExporter {\r
        <<abstract>>\r
        +Export()\r
        #FetchData()* List~string~\r
        #FormatData(List~string~ data)* string\r
    }\r
    class CsvExporter {\r
        #FetchData() List~string~\r
        #FormatData(List~string~ data) string\r
    }\r
    class JsonExporter {\r
        #FetchData() List~string~\r
        #FormatData(List~string~ data) string\r
    }\r
    DataExporter <|-- CsvExporter\r
    DataExporter <|-- JsonExporter\r
\`\`\`\r
\r
\`\`\`csharp\r
public abstract class DataExporter\r
{\r
    // The skeleton is fixed: fetch, then format, then write. Subclasses fill in the steps.\r
    public void Export()\r
    {\r
        var data = FetchData();\r
        var formatted = FormatData(data);\r
        Console.WriteLine(formatted);\r
    }\r
    protected abstract List<string> FetchData();\r
    protected abstract string FormatData(List<string> data);\r
}\r
\r
public class CsvExporter : DataExporter\r
{\r
    protected override List<string> FetchData() => new() { "a", "b" };\r
    protected override string FormatData(List<string> data) => string.Join(",", data);\r
}\r
\`\`\`\r
\r
| | Template Method | Strategy |\r
|---|---|---|\r
| Mechanism | Inheritance — override protected steps | Composition — inject an interface |\r
| Who controls the overall flow | The base class | The client, via what it injects |\r
| Flexibility | Fixed skeleton, varying steps | Entire algorithm swappable, even at runtime |\r
| Risk | Deep inheritance hierarchies, fragile base class | Extra interface + wiring for a single-use case |\r
| Example | Export pipeline: fetch → format → write | Pricing rule chosen at checkout |\r
\r
> [!TIP]\r
> If asked "why not just use Strategy everywhere", the answer is: Template Method is the right call when most of the algorithm really is shared and only one or two steps vary — inheritance communicates "this is a variant of the same process". Strategy is right when the whole algorithm is genuinely interchangeable and you want to compose it at runtime, possibly changing it per call.\r
\r
## Iterator Pattern\r
\r
**Problem:** code that consumes a collection shouldn't need to know whether it's backed by an array, a linked list, or a tree — and it definitely shouldn't need its own traversal logic duplicated everywhere a collection is consumed.\r
\r
Iterator provides a uniform interface (\`MoveNext()\`/\`Current\`) for walking any collection without exposing its internal structure. In C#, this is built in: \`IEnumerable<T>\`/\`IEnumerator<T>\` and \`foreach\` are the language's native Iterator implementation.\r
\r
\`\`\`csharp\r
public class OrderHistory : IEnumerable<Order>\r
{\r
    private readonly List<Order> _orders = new();\r
    public void Add(Order order) => _orders.Add(order);\r
\r
    // yield return lets the compiler generate the iterator/state machine for you\r
    public IEnumerator<Order> GetEnumerator()\r
    {\r
        foreach (var order in _orders.OrderByDescending(o => o.PlacedAt))\r
            yield return order;\r
    }\r
    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();\r
}\r
\r
// Consumer never knows the internal storage is a List<Order>\r
foreach (var order in orderHistory) Console.WriteLine(order.Id);\r
\`\`\`\r
\r
**Real-world usage:** every \`foreach\` loop in C#, LINQ's deferred-execution pipelines, database cursors, and paginated API clients that hide "fetch next page" behind \`MoveNext()\`.\r
\r
## Mediator Pattern\r
\r
**Problem:** a set of objects need to coordinate — a chat room's participants, a set of UI widgets that enable/disable each other — but wiring every object directly to every other object creates an \`O(n²)\` web of references that's impossible to change safely.\r
\r
Mediator introduces a single object that all participants talk to instead of each other; participants only know the mediator, not their peers.\r
\r
\`\`\`mermaid\r
classDiagram\r
    ChatRoom --> IUser\r
    IUser <|.. ChatUser\r
    ChatUser --> ChatRoom\r
    class ChatRoom {\r
        -List~IUser~ users\r
        +Register(IUser user)\r
        +Broadcast(string sender, string message)\r
    }\r
    class IUser {\r
        <<interface>>\r
        +Receive(string sender, string message)\r
    }\r
    class ChatUser {\r
        +Name string\r
        +Send(string message)\r
        +Receive(string sender, string message)\r
    }\r
\`\`\`\r
\r
\`\`\`csharp\r
public class ChatRoom\r
{\r
    private readonly List<ChatUser> _users = new();\r
    public void Register(ChatUser user) => _users.Add(user);\r
\r
    public void Broadcast(string sender, string message)\r
    {\r
        foreach (var user in _users.Where(u => u.Name != sender))\r
            user.Receive(sender, message); // users never reference each other directly\r
    }\r
}\r
\r
public class ChatUser\r
{\r
    public string Name { get; }\r
    private readonly ChatRoom _room;\r
    public ChatUser(string name, ChatRoom room)\r
    {\r
        Name = name;\r
        _room = room;\r
        room.Register(this);\r
    }\r
    public void Send(string message) => _room.Broadcast(Name, message);\r
    public void Receive(string sender, string message) => Console.WriteLine($"{Name} got from {sender}: {message}");\r
}\r
\`\`\`\r
\r
**Real-world usage:** chat rooms and multiplayer game lobbies, UI dialogs where enabling one control needs to disable/update others (a mediator dialog controller instead of controls wired directly to each other), and air traffic control as the textbook analogy — planes talk to the tower, never to each other directly.\r
\r
> [!WARNING]\r
> The mediator itself can become a god object that knows too much about everyone it coordinates. Keep it focused on *coordination logic only* — routing, sequencing, enabling/disabling — and push actual business logic back into the participants.\r
\r
## Memento Pattern\r
\r
**Problem:** you need to save an object's internal state and restore it later (undo, checkpoints, rollback) without breaking encapsulation — the object holding the history shouldn't need access to private fields it has no business touching directly.\r
\r
The object being saved creates an opaque snapshot (the memento) of its own state; a separate caretaker stores mementos but cannot read or modify their contents.\r
\r
\`\`\`csharp\r
public class EditorMemento\r
{\r
    public string Content { get; }\r
    internal EditorMemento(string content) => Content = content; // only Editor can construct it\r
}\r
\r
public class Editor\r
{\r
    public string Content { get; private set; } = "";\r
    public void Type(string text) => Content += text;\r
    public EditorMemento Save() => new(Content);\r
    public void Restore(EditorMemento memento) => Content = memento.Content;\r
}\r
\r
public class History\r
{\r
    private readonly Stack<EditorMemento> _snapshots = new();\r
    public void Push(EditorMemento memento) => _snapshots.Push(memento);\r
    public EditorMemento Pop() => _snapshots.Pop(); // caretaker never inspects the contents\r
}\r
\`\`\`\r
\r
**Real-world usage:** undo stacks in editors (often paired with Command, which triggers the save/restore), game checkpoints/save files, and database/transaction snapshots used for rollback. Memento answers "how do I capture state" while Command answers "how do I capture the action that caused the change" — many undo systems use both together.\r
\r
## Visitor and Interpreter (briefly)\r
\r
**Visitor** lets you add a new *operation* across a family of related classes without modifying those classes — each element accepts a visitor and calls back the visitor method matching its own type (\`Accept(IVisitor v) => v.VisitInvoice(this)\`). It's the go-to answer for "add a new report/export format over an existing class hierarchy without touching those classes", at the cost of having to update every visitor whenever a new element type is added — it inverts the usual extensibility trade-off of Strategy/Decorator.\r
\r
**Interpreter** models a simple grammar as a class hierarchy where each class knows how to evaluate itself — useful for small rule engines, search query parsers, or expression evaluators. It's rarely worth building by hand for anything beyond a toy grammar; in production you'd usually reach for a parser library or a regex/rules engine instead, but naming the pattern shows you recognise "this is basically an AST being walked."\r
\r
## Comparison table\r
\r
| Pattern | Core idea | Structural change | Real .NET example |\r
|---|---|---|---|\r
| State | Behaviour follows internal lifecycle | Object swaps its current state reference | Order/shipment status machine |\r
| Template Method | Fixed skeleton, pluggable steps | Inheritance, override protected methods | \`Stream\` subclasses, ASP.NET \`ControllerBase\` lifecycle |\r
| Iterator | Uniform traversal, hidden internals | Implements \`IEnumerable<T>\`/\`IEnumerator<T>\` | \`foreach\`, LINQ |\r
| Mediator | Centralised coordination | Participants reference only the mediator | Chat room, UI dialog controller |\r
| Memento | Snapshot and restore state | Opaque state object plus a caretaker | Editor undo, DB rollback |\r
| Visitor | Add operations without touching elements | Double dispatch via \`Accept\`/\`Visit\` | AST/expression tree evaluators |\r
\r
## Cheat sheet\r
\r
- State removes a giant \`switch (status)\` by giving each lifecycle phase its own class that can trigger the next transition.\r
- Template Method fixes the algorithm shape in a base class; only the varying steps are overridden — inheritance, not composition.\r
- Template Method vs Strategy: inheritance with a fixed skeleton vs composition with a fully swappable algorithm.\r
- Iterator is built into C# as \`IEnumerable<T>\`/\`foreach\`; you rarely hand-roll it except with \`yield return\`.\r
- Mediator turns an \`O(n²)\` web of direct references into a hub-and-spoke: everyone talks to one coordinator.\r
- Watch for the mediator becoming a god object — keep it to coordination, not business logic.\r
- Memento preserves encapsulation: only the originator can read/construct its own memento; the caretaker just stores it.\r
- Memento (snapshot) and Command (action + undo) are often used together for a full undo system.\r
- Visitor adds new operations without touching element classes, but adding a new element type means touching every visitor.\r
- Interpreter models a grammar as a walkable class tree — recognise it, but reach for a parser library in real production code.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Modelling a lifecycle as a \`switch\` instead of State | Extract each phase into a class implementing a shared interface |\r
| Confusing Template Method with Strategy | Ask "is this inheritance with fixed structure, or composition with a swappable whole" |\r
| Letting a Mediator absorb business logic from every participant | Keep the mediator to routing/coordination only |\r
| Caretaker reading or mutating a Memento's internal fields | Make the memento's state accessible only to its originator (internal/private constructor) |\r
| Reaching for Visitor when elements change often but operations don't | Prefer polymorphism/Strategy instead — Visitor inverts that trade-off |\r
| Hand-writing an Interpreter for anything beyond a tiny grammar | Use an existing parser/rules engine library |\r
\r
## Summary\r
\r
State, Template Method, Iterator, Mediator and Memento each remove a different kind of tangled logic: State replaces a lifecycle \`switch\`, Template Method shares an algorithm's shape while varying its steps, Iterator hides collection internals behind a uniform walk, Mediator replaces an \`O(n²)\` web of references with a single coordinator, and Memento captures and restores state without breaking encapsulation. Visitor and Interpreter are rarer but worth naming when a hierarchy needs new operations or a small grammar needs evaluating. Together with Part 1's four patterns, this covers essentially every behavioural pattern an interviewer will expect you to recognise on sight.\r
\r
## Top Interview Questions\r
\r
### Q1. What problem does the State pattern solve, and what's the tell that you need it?\r
\r
State solves the problem of an object's behaviour depending entirely on its current lifecycle phase, where that logic would otherwise live as a \`switch\` on a status field duplicated across many methods. The tell is a class where several methods each start with "if status is X, do this; if Y, do that" and adding a new status means touching every one of those methods, with high risk of missing a spot. The fix is giving each status its own class implementing a shared interface, held by the context as its "current state", with transitions performed by swapping which state object the context is delegating to — often the state class itself decides and sets the next state after acting.\r
\r
### Q2. How does the State pattern remove a large switch statement, concretely?\r
\r
Instead of one method with a \`switch (status)\` block that both checks the current status and encodes what happens next, each status becomes a class implementing a common interface, e.g. \`IOrderState.Process(Order order)\`. The context (\`Order\`) holds a reference to its current \`IOrderState\` and simply calls \`_state.Process(this)\`, delegating entirely. Each state class contains only the logic relevant to that one phase, including calling \`order.SetState(new NextState())\` to transition. Adding a new status is now a new class, with zero changes to existing state classes or the context's dispatch code — compare that to adding a new \`case\` to a switch that already spans several unrelated methods.\r
\r
### Q3. What's the difference between Template Method and Strategy?\r
\r
Both let you vary part of an algorithm, but the mechanism and flexibility differ. Template Method uses **inheritance**: a base class defines a fixed algorithm skeleton (e.g. fetch, then format, then write) and marks specific steps as abstract or virtual for subclasses to override; the overall sequence is locked in the base class. Strategy uses **composition**: the entire algorithm is behind one interface, injected into the context, and can be swapped completely, even at runtime, without any inheritance relationship. Use Template Method when most of the process is genuinely shared and only a couple of steps vary; use Strategy when the whole algorithm needs to be interchangeable.\r
\r
### Q4. Why is Iterator mostly invisible in modern C# code?\r
\r
Because the language builds it in: \`IEnumerable<T>\` and \`IEnumerator<T>\` are the Iterator pattern, and \`foreach\` is syntactic sugar over calling \`GetEnumerator()\`, then \`MoveNext()\`/\`Current\` in a loop. The \`yield return\` keyword lets the compiler generate an entire iterator/state-machine class for you, so you rarely hand-write an \`IEnumerator\` implementation. LINQ is layered on top of this: its deferred-execution operators (\`Where\`, \`Select\`) return iterators that don't do any work until enumerated. Recognising this in an interview is valuable — it shows you know the pattern isn't just academic, it's the reason \`foreach\` works on arrays, lists, dictionaries and custom collections identically.\r
\r
### Q5. What is the Mediator pattern, and why is it useful for something like a chat room?\r
\r
Mediator introduces a single coordinating object that all participants communicate through, instead of participants referencing each other directly. In a chat room, if every user held a direct reference to every other user to send messages, adding or removing a user would require updating every other user's reference list — an \`O(n²)\` web that gets unmanageable fast. With a \`ChatRoom\` mediator, each \`ChatUser\` only knows the room; sending a message calls \`room.Broadcast(...)\`, and the room decides who receives it. Users can join or leave by registering/unregistering with the room alone, and the room can add features like message history or moderation without touching any user class.\r
\r
### Q6. What's a risk of the Mediator pattern, and how do you avoid it?\r
\r
The mediator can absorb more and more responsibility over time until it becomes a god object that knows the business logic of everything it coordinates — validation rules, formatting, side effects — leaving participants as thin, anemic shells. This defeats the point, since you've just moved the tangle from an \`O(n²)\` web into one enormous class. The fix is discipline about scope: the mediator should own *coordination* — who talks to whom, in what order, whether an action is currently allowed — while the actual business behaviour stays in the participant classes. If the mediator's method bodies start reading like domain logic rather than routing logic, that's the signal to push it back out.\r
\r
### Q7. Explain the Memento pattern and how it preserves encapsulation.\r
\r
Memento lets an object save a snapshot of its own internal state and restore it later, without exposing that state to whoever is storing the snapshots. The object being saved (the originator) creates the memento itself, so only it knows the memento's internal shape; a separate caretaker (e.g. a history stack) stores mementos opaquely — it can push and pop them but cannot read or modify their contents, typically enforced with an \`internal\` or private constructor so only the originator's assembly/class can construct or unpack one. This is different from just exposing a public getter/setter for all fields, which would let any caller inspect or corrupt internal state directly.\r
\r
### Q8. How do Memento and Command work together to implement undo?\r
\r
Command captures *what action was performed* — an object with an \`Execute()\` (and often \`Undo()\`) method — which works well when the action's effect can be reversed by an inverse operation (e.g. "add text" undone by "remove the same length of text"). Memento captures *what the state was* before or after an action, as an opaque snapshot, which works well when the state is complex enough that computing an inverse operation is impractical (e.g. a whole document). A common real design uses Command to know *when* to save/restore and *what triggered* the change, while Memento provides the actual before/after snapshot that gets restored — giving you both a clean undo history and full-fidelity state recovery.\r
\r
### Q9. When would you reach for the Visitor pattern, and what's its trade-off?\r
\r
Visitor is for adding a **new operation** across a family of related classes (an object structure like an AST, a document model, or a set of shape types) without modifying those classes — each element implements \`Accept(IVisitor visitor)\`, which calls back the matching \`Visit\` method on the visitor for that element's concrete type (double dispatch). This is the right call when the set of element types is stable but you keep needing new operations (export to PDF, export to HTML, compute totals). The trade-off is the reverse of Strategy: adding a *new element type* means updating every existing visitor implementation, whereas adding a new *operation* means writing one new visitor class and touching nothing else.\r
\r
### Q10. Your team keeps writing switch statements for "if the shipment is Pending do X, if InTransit do Y, if Delivered do Z" across five different service classes. How would you fix this, and how would you verify the fix actually helped?\r
\r
I'd introduce an \`IShipmentState\` interface with the operations that vary by status (e.g. \`Advance(Shipment shipment)\`, \`CanCancel()\`), implement one class per status, and have \`Shipment\` hold its current state object, delegating to it instead of branching internally. I'd verify the fix by checking that adding a new status (say, "ReturnedToSender") requires writing exactly one new class and zero edits to the five existing service classes or the existing state classes — if it still requires touching old code, the extraction missed a branch. I'd also add unit tests per state class in isolation, which is now possible without spinning up the whole shipment object and every other status's logic.\r
\r
### Q11. How would you design an undo/redo feature for a drawing application with many shape types (circles, rectangles, lines)?\r
\r
I'd combine Command and Memento: every user action (draw, move, resize, delete a shape) is wrapped in a \`ICommand\` with \`Execute()\`/\`Undo()\`, pushed onto a history stack when executed, giving me undo/redo ordering and the ability to log or replay actions. For actions where computing a clean inverse is hard — a freehand drag that changes many properties at once — the command's \`Undo()\` restores a \`ShapeMemento\` snapshot taken before the action rather than trying to compute an inverse transform. If I later need to add a "flip horizontally" operation across all shape types without touching each shape class, I'd add it via Visitor rather than adding a new virtual method to every shape class.\r
\r
### Q12. A UI dialog has 15 controls that need to enable/disable each other based on selections (classic "wizard" screen). What pattern would you apply and why not just wire the controls to each other directly?\r
\r
I'd apply Mediator: introduce a \`DialogController\` that all 15 controls report changes to and take enable/disable instructions from, instead of each control holding references to the others it affects. Wiring controls directly to each other creates up to 15×14 potential relationships, and any change to one control's behaviour risks breaking assumptions in several others that reference it — a maintenance and testing nightmare, and nearly impossible to unit test one control's rule in isolation. With a mediator, each control only needs to know the controller; the controller centralises "if X is selected, enable Y and disable Z", which is both readable in one place and independently testable without instantiating the whole UI.\r
`;export{e as default};
