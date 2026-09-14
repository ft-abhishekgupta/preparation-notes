const e=`---\r
title: Behavioural Patterns Part 1\r
description: How Strategy, Observer, Command and Chain of Responsibility decouple behaviour from objects, with C# code and the memory-leak trap in events\r
difficulty: Core\r
tags: [design-patterns, behavioural-patterns, strategy, observer, command]\r
---\r
\r
Behavioural patterns are about **who does what and when** — they distribute responsibility for a task across objects instead of hard-coding it into one giant method. This page covers the four you will actually write in an interview: Strategy (swap an algorithm), Observer (notify many listeners), Command (turn a request into an object), and Chain of Responsibility (pass a request along a pipeline until someone handles it).\r
\r
## Strategy Pattern\r
\r
**Problem:** a class needs one of several interchangeable algorithms — pricing rules, payment methods, compression formats — and today that logic lives in a growing \`if/else\` or \`switch\` inside the class itself. Every new variant means editing code that already works, which violates the Open/Closed Principle and risks regressions in unrelated branches.\r
\r
Strategy pulls the algorithm out into its own interface. The context class holds a reference to that interface and delegates to it; it never knows which concrete implementation it is running.\r
\r
\`\`\`mermaid\r
classDiagram\r
    IPricingStrategy <|.. RegularPricing\r
    IPricingStrategy <|.. PremiumPricing\r
    IPricingStrategy <|.. ClearancePricing\r
    Checkout --> IPricingStrategy\r
    class IPricingStrategy {\r
        <<interface>>\r
        +Calculate(decimal amount) decimal\r
    }\r
    class RegularPricing {\r
        +Calculate(decimal amount) decimal\r
    }\r
    class PremiumPricing {\r
        +Calculate(decimal amount) decimal\r
    }\r
    class ClearancePricing {\r
        +Calculate(decimal amount) decimal\r
    }\r
    class Checkout {\r
        -IPricingStrategy strategy\r
        +Checkout(IPricingStrategy strategy)\r
        +GetPrice(decimal amount) decimal\r
    }\r
\`\`\`\r
\r
\`\`\`csharp\r
public interface IPricingStrategy\r
{\r
    decimal Calculate(decimal amount);\r
}\r
\r
public class PremiumPricing : IPricingStrategy\r
{\r
    public decimal Calculate(decimal amount) => amount * 0.9m; // 10% loyalty discount\r
}\r
\r
public class Checkout\r
{\r
    private readonly IPricingStrategy _strategy;\r
    public Checkout(IPricingStrategy strategy) => _strategy = strategy;\r
    public decimal GetPrice(decimal amount) => _strategy.Calculate(amount);\r
}\r
\r
// The strategy is injected, so it can be swapped without touching Checkout\r
var checkout = new Checkout(new PremiumPricing());\r
decimal price = checkout.GetPrice(100m); // 90\r
\`\`\`\r
\r
**Real-world usage:** payment gateways (\`CardPayment\`, \`UpiPayment\`, \`WalletPayment\` behind \`IPaymentStrategy\`), file compression (\`ZipStrategy\` vs \`GzipStrategy\`), tax calculators that vary by region, and sorting \`Comparer<T>\` implementations passed into \`List<T>.Sort\`. Anywhere you see "the algorithm varies but the caller shouldn't care which one", reach for Strategy.\r
\r
> [!KEY]\r
> Strategy is **composition over inheritance**: instead of subclassing \`Checkout\` for every pricing rule, you inject the behaviour. The client (or a factory) decides which strategy to use.\r
\r
### Strategy vs State\r
\r
Both patterns look identical in UML — a context holding an interface reference — which is why interviewers ask you to tell them apart.\r
\r
| | Strategy | State |\r
|---|---|---|\r
| Who picks the implementation | The client, explicitly | The object itself, based on its current state |\r
| Does the object change over time | No — one algorithm per call | Yes — transitions between states drive behaviour |\r
| Awareness of alternatives | Client knows all strategies | Context often doesn't know all states exist |\r
| Typical trigger phrase | "Which algorithm should run?" | "Behaviour depends on what happened before" |\r
| Example | Pricing rule chosen at checkout | Order: \`New → Paid → Shipped → Delivered\` |\r
\r
State is covered in depth in Part 2 — the short version is: if the object needs to **transition itself** through a sequence and a giant \`switch (status)\` is spreading across every method, that's State, not Strategy.\r
\r
## Observer Pattern\r
\r
**Problem:** one object's state change needs to trigger side effects in several unrelated places — send an email, update a dashboard, log an audit entry — without that object knowing anything about email, dashboards or logging. Hard-wiring those calls creates a class that keeps growing new dependencies every time a new consumer is added.\r
\r
Observer creates a one-to-many subscription: a subject keeps a list of observers and notifies all of them when something changes, without knowing what any observer actually does.\r
\r
\`\`\`mermaid\r
classDiagram\r
    Order --> IOrderObserver\r
    IOrderObserver <|.. EmailNotifier\r
    IOrderObserver <|.. SmsNotifier\r
    IOrderObserver <|.. AuditLogger\r
    class Order {\r
        -List~IOrderObserver~ observers\r
        +Subscribe(IOrderObserver observer)\r
        +Unsubscribe(IOrderObserver observer)\r
        +SetStatus(string status)\r
    }\r
    class IOrderObserver {\r
        <<interface>>\r
        +Update(string status)\r
    }\r
    class EmailNotifier {\r
        +Update(string status)\r
    }\r
    class SmsNotifier {\r
        +Update(string status)\r
    }\r
    class AuditLogger {\r
        +Update(string status)\r
    }\r
\`\`\`\r
\r
\`\`\`csharp\r
public interface IOrderObserver\r
{\r
    void Update(string status);\r
}\r
\r
public class Order\r
{\r
    private readonly List<IOrderObserver> _observers = new();\r
    public void Subscribe(IOrderObserver observer) => _observers.Add(observer);\r
    public void Unsubscribe(IOrderObserver observer) => _observers.Remove(observer);\r
\r
    public void SetStatus(string status)\r
    {\r
        foreach (var observer in _observers)\r
            observer.Update(status); // subject has no idea what each observer does\r
    }\r
}\r
\`\`\`\r
\r
**Real-world usage:** domain events (\`OrderPlaced\`, \`PaymentFailed\`) fanning out to handlers, \`INotifyPropertyChanged\` in WPF/MVVM binding UI to a view model, C# native \`event\`/\`delegate\`, reactive streams (\`IObservable<T>\`/Rx), and pub-sub message brokers at a larger scale (Kafka topics are Observer distributed across processes).\r
\r
> [!WARNING]\r
> The classic bug: a long-lived subject (say, a static event source or a cache) holds a reference to every subscriber. If a short-lived object (a page, a form, a request-scoped service) subscribes and never unsubscribes, the subject keeps it alive forever — a **memory leak** the GC cannot fix because there is a real, reachable reference. In C#, prefer \`WeakEventManager\`, explicit \`Unsubscribe\` in \`Dispose\`, or \`IDisposable\` subscription tokens (\`IObservable<T>.Subscribe\` returning an \`IDisposable\`) to guarantee cleanup.\r
\r
## Command Pattern\r
\r
**Problem:** you need to treat a request as a first-class object — queue it, log it, retry it, undo it, or hand it to something that has no idea what the request actually does. If the request is just a method call, none of that is possible; you can only invoke it immediately and once.\r
\r
Command wraps a request (receiver + parameters + action) behind a single \`Execute()\` method. The invoker holds and triggers commands without knowing what they do; storing executed commands on a stack gives you undo for free.\r
\r
\`\`\`mermaid\r
classDiagram\r
    Invoker --> ICommand\r
    ICommand <|.. AddTextCommand\r
    AddTextCommand --> TextDocument\r
    class ICommand {\r
        <<interface>>\r
        +Execute()\r
        +Undo()\r
    }\r
    class AddTextCommand {\r
        -TextDocument document\r
        -string text\r
        +Execute()\r
        +Undo()\r
    }\r
    class TextDocument {\r
        +Append(string text)\r
        +RemoveLast(int length)\r
    }\r
    class Invoker {\r
        -Stack~ICommand~ history\r
        +Run(ICommand command)\r
        +UndoLast()\r
    }\r
\`\`\`\r
\r
\`\`\`csharp\r
public interface ICommand\r
{\r
    void Execute();\r
    void Undo();\r
}\r
\r
public class AddTextCommand : ICommand\r
{\r
    private readonly TextDocument _document;\r
    private readonly string _text;\r
    public AddTextCommand(TextDocument document, string text)\r
    {\r
        _document = document;\r
        _text = text;\r
    }\r
    public void Execute() => _document.Append(_text);\r
    public void Undo() => _document.RemoveLast(_text.Length);\r
}\r
\r
public class Invoker\r
{\r
    private readonly Stack<ICommand> _history = new();\r
    public void Run(ICommand command)\r
    {\r
        command.Execute();\r
        _history.Push(command); // remembering commands is what makes undo possible\r
    }\r
    public void UndoLast()\r
    {\r
        if (_history.Count > 0) _history.Pop().Undo();\r
    }\r
}\r
\`\`\`\r
\r
> [!TIP]\r
> Mention this trade-off out loud: Command gives you undo/redo, but only if every command's side effects are **reversible or re-derivable**. For an action like "send email", \`Undo()\` can't literally un-send it — you model it as a compensating action instead. Naming that limitation reads as senior.\r
\r
**Real-world usage:** undo/redo stacks in editors, GUI button click handlers bound to command objects, task/job queues (a \`Command\` serialised onto a message queue and executed by a worker), macro recording (replaying a list of commands), and \`ICommand\` in WPF data binding.\r
\r
## Chain of Responsibility Pattern\r
\r
**Problem:** a request might need to pass through several potential handlers, but the sender shouldn't need to know which one will actually process it, how many there are, or in what order — and that list changes over time (new middleware, new approval tiers).\r
\r
Each handler gets a chance to process the request; if it can't (or after doing partial work), it forwards to the next handler in the chain.\r
\r
\`\`\`mermaid\r
classDiagram\r
    IApprover <|.. Manager\r
    IApprover <|.. Director\r
    IApprover <|.. VicePresident\r
    class IApprover {\r
        <<interface>>\r
        +SetNext(IApprover next)\r
        +Approve(decimal amount)\r
    }\r
    class Manager {\r
        -IApprover next\r
        +Approve(decimal amount)\r
    }\r
    class Director {\r
        -IApprover next\r
        +Approve(decimal amount)\r
    }\r
    class VicePresident {\r
        +Approve(decimal amount)\r
    }\r
\`\`\`\r
\r
\`\`\`csharp\r
public abstract class Approver\r
{\r
    protected Approver? Next;\r
    public void SetNext(Approver next) => Next = next;\r
    public abstract void Approve(decimal amount);\r
}\r
\r
public class Manager : Approver\r
{\r
    public override void Approve(decimal amount)\r
    {\r
        if (amount <= 1000) Console.WriteLine("Manager approved");\r
        else Next?.Approve(amount); // pass along; Next is null-checked, not assumed\r
    }\r
}\r
\r
public class Director : Approver\r
{\r
    public override void Approve(decimal amount)\r
    {\r
        if (amount <= 10_000) Console.WriteLine("Director approved");\r
        else Next?.Approve(amount);\r
    }\r
}\r
\`\`\`\r
\r
> [!DANGER]\r
> If no handler in the chain matches and there is no terminal handler, the request silently falls off the end and nothing happens — a bug that looks like "it just does nothing" in production. Always give the chain a final handler that either handles everything or throws/logs explicitly; never let \`Next\` be \`null\` at the end without a default case.\r
\r
Chain order is part of the behaviour, not an implementation detail — put validation after mutation or authorization after the sensitive action and the same request now means something different.\r
\r
**Real-world usage:** ASP.NET Core's middleware pipeline (\`app.Use(...)\` calling \`next()\`), approval workflows (manager → director → VP), validation pipelines, and logging/exception-handling filters that each decide whether to act or delegate onward.\r
\r
## Choosing among the four\r
\r
| Pattern | Solves | Number of handlers/listeners | Trigger phrase |\r
|---|---|---|---|\r
| Strategy | Swappable algorithm for one call | Exactly one, chosen explicitly | "Which algorithm should run?" |\r
| Observer | Broadcast a change to many | Many, all notified | "Tell everyone when this changes" |\r
| Command | Turn a request into an object | One receiver, decoupled from sender | "Queue it, log it, undo it" |\r
| Chain of Responsibility | Route a request through candidates | One (or a few) out of many, sequentially | "Pass it on until someone handles it" |\r
\r
## Cheat sheet\r
\r
- **Strategy** = client chooses the algorithm; **State** = object transitions itself and behaviour follows.\r
- Strategy follows Open/Closed: add a new strategy class, never edit the context.\r
- Observer decouples subject from observer — the subject never knows what an observer does with the notification.\r
- Always provide an unsubscribe path for Observer; a leaked subscription is a leaked object.\r
- Command turns "do this now" into an object you can queue, log, retry or undo.\r
- Undo via Command requires either a reversible action or a compensating action — say which one applies.\r
- Chain of Responsibility decouples sender from receiver; handlers can be added, removed or reordered without touching the client.\r
- ASP.NET Core middleware is Chain of Responsibility; C# \`event\`/Rx \`IObservable<T>\` is Observer.\r
- All four patterns exist to avoid one thing: a giant \`if/switch\` that keeps growing every time a requirement changes.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Confusing Strategy and State because the UML looks identical | Ask "does the object drive its own transitions?" — if yes, it's State |\r
| Subject holding strong references to observers forever | Provide \`Unsubscribe\`/\`Dispose\`, or use weak references |\r
| Command objects that also need three constructor arguments for context they don't own | Pass only the receiver and parameters the command needs — keep it thin |\r
| Chain of Responsibility with no terminal/default handler | Add an explicit last handler or throw on falling off the chain |\r
| Using Strategy when there is really only ever one implementation | Don't introduce the interface until a second variant is likely |\r
| Observer notifying in a random or unspecified order when order matters | Document ordering, or use a priority list if consumers depend on sequence |\r
\r
## Summary\r
\r
Strategy, Observer, Command and Chain of Responsibility all exist to stop behaviour from being hard-coded into one class's \`if/switch\` statements. Strategy swaps an algorithm the client picks; Observer broadcasts a change to everyone subscribed; Command turns a request into a reusable, undoable, queueable object; and Chain of Responsibility routes a request through a sequence of candidate handlers. Recognise them by their trigger phrase, know the memory-leak risk that comes with Observer, and be ready to name the real .NET or web-framework feature that already implements each one.\r
\r
## Top Interview Questions\r
\r
### Q1. What problem does the Strategy pattern solve, and how do you recognise the need for it?\r
\r
Strategy solves the problem of a class needing one of several interchangeable algorithms without hard-coding all of them into \`if/else\` or \`switch\` branches inside itself. You recognise the need when you see a method that branches on a "type" or "mode" flag to decide *how* to do something — calculate a price, sort a list, compress a file — and that branch keeps growing every time a new variant is added. The fix is to extract each branch into a class implementing a shared interface, and have the context hold a reference to that interface, injected by the caller or a factory. This satisfies the Open/Closed Principle: new algorithms are new classes, not edits to existing ones.\r
\r
### Q2. How do you tell Strategy and State apart when the class diagrams look identical?\r
\r
Both have a context class holding a reference to an interface with multiple implementations, so the static structure is the same. The difference is behavioural: in Strategy, the **client** picks which implementation to use, per call, and the object doesn't change over time. In State, the **object itself** transitions between states as a result of its own operations — a \`NewState\` calls \`order.SetState(new PaidState())\` internally. Ask "does something outside decide which implementation runs, or does the object drive itself through a sequence over time?" If it's the latter, it's State, and you'd expect a state machine diagram, not just a strategy swap, to describe it.\r
\r
### Q3. What is the Observer pattern, and where have you seen it in a real codebase?\r
\r
Observer defines a one-to-many dependency: a subject keeps a list of observers and calls a shared \`Update()\` method on all of them when its state changes, without knowing what any observer does with that notification. I've seen it as C# \`event\`/\`delegate\` (a \`UI\` button click event with multiple handlers), \`INotifyPropertyChanged\` driving WPF/MVVM data binding, domain events like \`OrderPlaced\` fanning out to an email handler and an audit logger, and at a larger scale, a message broker topic where multiple consumers subscribe to the same event stream. The common thread is decoupling: the publisher never references concrete consumer types.\r
\r
### Q4. What is the memory-leak risk with the Observer pattern, and how do you avoid it in C#?\r
\r
If a long-lived subject holds references to observers in a list and an observer subscribes but is never explicitly unsubscribed, the subject keeps that observer reachable forever, even after the code that created it thinks it's done. Garbage collection can't help — the reference is real and reachable. This shows up as pages, forms or scoped services silently piling up in memory. The fix is to always pair \`Subscribe\` with \`Unsubscribe\`, ideally in a \`Dispose()\` method, or use patterns designed for this: C#'s weak event manager, \`IObservable<T>.Subscribe\` which returns an \`IDisposable\` subscription token, or explicit lifetime scoping in a DI container so subscribers are disposed with their scope.\r
\r
### Q5. When would you use the Command pattern instead of just calling a method directly?\r
\r
Use Command when the *request itself* needs to be a first-class object: you need to queue it for later execution, log it for audit, retry it on failure, pass it to something generic that doesn't know what it does, or support undo/redo. A direct method call can only be invoked immediately, once, by a caller who knows exactly what it does. Wrapping the call in a \`Command\` object with an \`Execute()\` (and often \`Undo()\`) method lets an invoker store, replay or reverse it without any knowledge of the receiver. Typical examples: GUI button-to-action bindings, background job queues where a serialised command is picked up by a worker, and text editor undo stacks.\r
\r
### Q6. How does the Command pattern implement undo, and what's a limitation of that approach?\r
\r
Each executed command is pushed onto a history stack as it runs; \`UndoLast()\` pops the most recent command and calls its \`Undo()\` method, which reverses exactly the side effect \`Execute()\` performed — for example, appending text is undone by removing the same number of characters. The limitation is that not every action is reversible: sending an email or charging a card can't be literally undone. For those, \`Undo()\` has to perform a *compensating* action (a refund, a cancellation notice) rather than a true reversal, and you have to design the command to capture enough state upfront (amount charged, message ID) to make that compensation possible.\r
\r
### Q7. What is Chain of Responsibility and how is it different from Observer?\r
\r
Chain of Responsibility passes a request along a sequence of handler objects; each handler decides whether to fully or partially process the request or forward it to the next handler, and the sender doesn't know which handler (if any) will ultimately act. Observer, by contrast, notifies **every** subscribed observer of an event — it's a broadcast, not a routing decision. In Chain of Responsibility, typically one handler (or a small subset) ends up acting, and the chain can short-circuit once a handler fully handles the request; in Observer, all observers run, usually independently of each other's outcome. Approval workflows and middleware pipelines are Chain of Responsibility; event notification fan-out is Observer.\r
\r
### Q8. Where does ASP.NET Core use Chain of Responsibility, and what would you watch out for when building your own chain?\r
\r
The ASP.NET Core middleware pipeline is a textbook Chain of Responsibility: each middleware component receives the request and a \`next\` delegate, and decides whether to short-circuit (write a response and return) or call \`next()\` to forward to the next component. Building your own chain, the main risks are: forgetting a terminal handler, so a request that nothing matches silently does nothing; getting the chain order wrong when handlers have implicit ordering dependencies (auth before authorization, logging around everything); and letting handlers mutate shared state in ways that make behaviour depend on call order in a way that's hard to reason about or test in isolation.\r
\r
### Q9. Your team's pricing logic is a 200-line switch statement on customer tier that's grown unreadable. How would you refactor it, and what would you say to justify Strategy over just splitting the switch into smaller methods?\r
\r
I'd extract each tier's calculation into a class implementing \`IPricingStrategy\` with a single \`Calculate(decimal amount)\` method, and have the checkout class take an \`IPricingStrategy\` via constructor injection, resolved by a small factory or a dictionary keyed on tier. Splitting the switch into smaller private methods only makes the *reading* easier — every new tier still means editing the same file and risking a regression in an unrelated branch, and you can't unit test one tier's pricing rule in isolation without invoking the whole switch. Strategy makes each rule an independently testable, independently deployable unit, and satisfies Open/Closed: adding "enterprise tier" pricing is a new file, not a diff to existing, working code.\r
\r
### Q10. In production, you notice a WPF/MVVM application's memory grows steadily every time the user navigates between screens. How would you investigate and what pattern-related cause would you suspect?\r
\r
I'd take a memory snapshot before and after several navigation cycles and diff retained object counts — if view-model instances from screens the user has "left" are still alive, I'd suspect an Observer leak: a long-lived object (often a singleton service or a static event) that the view model subscribed to via \`+=\` without a matching \`-=\` on disposal. Each navigation creates a new view model that subscribes again, and none of the old ones are ever collected because the singleton still references them through its event's invocation list. The fix is ensuring every subscribing view model implements \`IDisposable\`/unsubscribes in its cleanup path, or switching to a weak-reference-based event mechanism designed for this.\r
\r
### Q11. How would you design a task queue where workers pick up and execute jobs submitted by different parts of the system, and which patterns apply?\r
\r
I'd model each submitted unit of work as a \`Command\` object — \`Execute()\` runs the job, and it carries whatever parameters/receiver reference it needs, serialisable if jobs cross a process boundary onto a real queue (e.g. a message broker). A generic \`Worker\`/invoker dequeues commands and calls \`Execute()\` without knowing what kind of job it is, which is exactly the decoupling Command provides. If jobs need to be validated or routed to different handlers based on type before execution (e.g. "billing jobs go through fraud check then execute"), I'd layer Chain of Responsibility on top of that: each stage decides whether to act, transform, or forward the command onward.\r
\r
### Q12. Can you combine Strategy and Chain of Responsibility in the same design? Give a concrete example.\r
\r
Yes — they solve different problems and often sit together. Take a payment processing pipeline: Chain of Responsibility handles the *sequence of validation and enrichment steps* a transaction passes through (fraud check → currency conversion → fee calculation → settlement), where each handler decides whether to proceed or reject. Inside the fee calculation handler, Strategy picks *which fee algorithm* to apply based on the merchant's plan (\`FlatFeeStrategy\`, \`PercentageFeeStrategy\`, \`TieredFeeStrategy\`). The chain governs "what sequence of steps does this request go through", while the strategy inside one of those steps governs "which algorithm computes this step's result" — they're orthogonal concerns operating at different levels of the same pipeline.\r
`;export{e as default};
