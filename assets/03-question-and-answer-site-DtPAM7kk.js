const e=`---\r
title: Design a Q and A Site\r
description: Design a Stack Overflow style Q and A platform with questions, answers, voting, reputation and tag search under concurrent access\r
difficulty: Core\r
tags: [qa-platform, observer-pattern, oop-design, concurrency]\r
---\r
\r
A question-and-answer site needs a content model for questions, answers and comments, a fair voting and reputation system, and search over all of it — the real design work is keeping voting, reputation and search each isolated so tightening one rule never risks breaking another.\r
\r
## Requirements\r
\r
### Functional\r
\r
- Users post questions (with tags), post answers to questions, and comment on both questions and answers.\r
- Users vote (upvote/downvote) on questions and answers; a user cannot vote on their own post, and each user gets exactly one active vote per post.\r
- The question's author can mark exactly one answer as accepted.\r
- Users search by keyword (title/body), by tag, or by author.\r
- Reputation is a derived score, updated automatically from vote outcomes and accepted answers — never set directly by a caller.\r
\r
### Non-functional and assumptions\r
\r
- Single process, in-memory storage for the interview; the design should not preclude swapping any one piece (search, storage) later.\r
- Many users vote and post concurrently — the system must never double-count a vote or lose a comment under concurrent writes.\r
- Reputation changes are a side effect of voting/acceptance, not a separate API surface a client calls directly.\r
- Moderation, edit history, spam detection and notification delivery are out of scope for this pass.\r
\r
### Clarifying questions to ask\r
\r
> [!TIP]\r
> Ask "can a user change or retract a vote?" early — it decides whether votes are an append-only log or a keyed, replaceable map, which changes both the data structure and the reputation math (a retraction has to reverse the exact delta it applied).\r
\r
- Can a vote be changed (up to down) or withdrawn, and does that reverse the reputation delta?\r
- Is there a reputation floor (can a heavily downvoted user go negative), or does it clamp at zero?\r
- Can more than one answer ever be marked accepted, or does accepting a new one un-accept the old one?\r
- Is search ranked by relevance/popularity, or is "return all matches" acceptable for this pass?\r
- Does reputation vary by post type (answer upvote worth more than a question upvote), and by how much?\r
\r
## Core objects\r
\r
| Class | Responsibility | Key fields/methods |\r
|---|---|---|\r
| \`Post\` (abstract) | Shared voting/commenting behaviour for questions and answers | \`Votes\`, \`Comments\`, \`AddVote(vote)\`, \`AddComment(comment)\` |\r
| \`Question\` | A post with a title, tags and its answers | \`Title\`, \`Tags\`, \`Answers\`, \`AcceptedAnswer\`, \`AcceptAnswer(answer)\` |\r
| \`Answer\` | A post that responds to a question | \`Question\`, \`IsAccepted\`, \`MarkAccepted()\` |\r
| \`Comment\` | A short remark on a post | \`Author\`, \`Body\`, \`CreatedAt\` |\r
| \`Tag\` | A topic label on a question | \`Name\` |\r
| \`VotingService\` | Enforces vote rules, publishes vote events | \`Vote(user, post, type)\` |\r
| \`AnswerService\` | Adds answers, enforces accept rules | \`AddAnswer(...)\`, \`AcceptAnswer(user, answer)\` |\r
| \`SearchService\` | Indexed lookup by keyword/tag/author | \`SearchByKeyword\`, \`SearchByTag\`, \`SearchByUser\` |\r
| \`PostEventPublisher\` | Fan-out for vote/accept events | \`Subscribe(observer)\`, \`PublishVote(event)\` |\r
| \`ReputationService\` | Observer that turns events into score changes | \`OnVote(event)\`, \`OnAnswerAccepted(answer)\` |\r
\r
## Class design\r
\r
\`\`\`mermaid\r
classDiagram\r
    class User {\r
        -long Id\r
        -string Name\r
        -int Reputation\r
        +UpdateReputation(int amount) void\r
    }\r
    class Post {\r
        <<abstract>>\r
        -long Id\r
        -User Author\r
        -string Body\r
        +AddVote(Vote v) bool\r
        +RemoveVote(long userId) bool\r
        +AddComment(Comment c) void\r
    }\r
    class Question {\r
        -string Title\r
        -List~Tag~ Tags\r
        -List~Answer~ Answers\r
        -Answer AcceptedAnswer\r
        +AddAnswer(Answer a) void\r
        +AcceptAnswer(Answer a) void\r
    }\r
    class Answer {\r
        -Question Question\r
        -bool IsAccepted\r
        +MarkAccepted() void\r
    }\r
    class Comment {\r
        -User Author\r
        -string Body\r
    }\r
    class Tag {\r
        -string Name\r
    }\r
    class Vote {\r
        -User User\r
        -VoteType Type\r
    }\r
    class VoteType {\r
        <<enumeration>>\r
        Upvote\r
        Downvote\r
    }\r
    class IPostEventObserver {\r
        <<interface>>\r
        +OnVote(VoteEvent e) void\r
        +OnAnswerAccepted(Answer a) void\r
    }\r
    class PostEventPublisher {\r
        -List~IPostEventObserver~ Observers\r
        +Subscribe(IPostEventObserver o) void\r
        +PublishVote(VoteEvent e) void\r
    }\r
    class ReputationService {\r
        +OnVote(VoteEvent e) void\r
        +OnAnswerAccepted(Answer a) void\r
    }\r
    class VotingService {\r
        +Vote(User u, Post p, VoteType t) void\r
    }\r
    class AnswerService {\r
        +AddAnswer(User u, Question q, string body) Answer\r
        +AcceptAnswer(User u, Answer a) void\r
    }\r
    class SearchService {\r
        +SearchByKeyword(string kw) List~Question~\r
        +SearchByTag(string tag) List~Question~\r
    }\r
    Post <|-- Question\r
    Post <|-- Answer\r
    Question "1" --> "*" Answer\r
    Post "1" --> "*" Comment\r
    Question "*" --> "*" Tag\r
    Post "1" --> "*" Vote\r
    IPostEventObserver <|.. ReputationService\r
    PostEventPublisher --> IPostEventObserver\r
    VotingService --> PostEventPublisher\r
    AnswerService --> PostEventPublisher\r
    Post --> User\r
\`\`\`\r
\r
## Key design decisions\r
\r
### 1. Reputation reacts to events instead of being called directly\r
\r
\`VotingService\` and \`AnswerService\` never call \`ReputationService\` — they publish a \`VoteEvent\`/accept event through \`PostEventPublisher\`, and \`ReputationService\` subscribes as an \`IPostEventObserver\`. Pattern: **Observer**.\r
\r
> [!KEY]\r
> Rejected alternative: \`VotingService.Vote()\` calling \`user.UpdateReputation()\` inline. It works until a second consumer shows up — notifications, analytics, an activity feed — and each one means another edit to \`VotingService\`. The observer list grows without touching the class that raises the event.\r
\r
### 2. \`Post\` is an abstract base, not two unrelated classes\r
\r
\`Question\` and \`Answer\` both need voting and commenting; putting that behaviour once on an abstract \`Post\` means it's implemented and tested once. The rejected alternative — separate \`Question\` and \`Answer\` classes each re-implementing \`AddVote\`/\`AddComment\` — invites drift the moment one gets a bug fix the other doesn't.\r
\r
### 3. Votes are keyed by voter, not appended to a list\r
\r
\`Post\` stores votes in a \`ConcurrentDictionary<userId, Vote>\`, not a \`List<Vote>\`. This makes "one vote per user" a property of the data structure (\`TryAdd\` simply fails for a second vote) rather than a check-then-append race waiting to happen under concurrent requests.\r
\r
| Approach | One-vote-per-user guarantee | Concurrency safety |\r
|---|---|---|\r
| \`List<Vote>\` + "already voted?" scan before appending | Only if the scan-then-append is atomic | ❌ Race window between check and append |\r
| \`ConcurrentDictionary<userId, Vote>\` | Structural — a second \`TryAdd\` for the same key fails | ✅ Single atomic operation |\r
\r
### 4. Reputation math lives in \`ReputationService\`, not on \`User\`\r
\r
\`User.UpdateReputation(amount)\` only applies a delta; deciding *what* delta a given vote or acceptance is worth lives entirely in \`ReputationService\`. The rejected alternative — \`User.UpvoteQuestion()\`/\`User.UpvoteAnswer()\` methods baked into the entity — means every time the business retunes scoring (say, answer upvotes go from +10 to +8), you're editing the core identity class instead of one policy class.\r
\r
## Implementation\r
\r
\`\`\`csharp\r
public interface IPostEventObserver\r
{\r
    void OnVote(VoteEvent voteEvent);\r
    void OnAnswerAccepted(Answer answer);\r
}\r
\r
public abstract class Post\r
{\r
    public User Author { get; }\r
    private readonly ConcurrentDictionary<long, Vote> _votes = new();\r
    protected readonly object SyncLock = new();\r
\r
    protected Post(User author) => Author = author;\r
\r
    public bool AddVote(Vote vote) => _votes.TryAdd(vote.User.Id, vote);\r
    public bool RemoveVote(long userId) => _votes.TryRemove(userId, out _);\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
public class VotingService\r
{\r
    private readonly PostEventPublisher _publisher;\r
    public VotingService(PostEventPublisher publisher) => _publisher = publisher;\r
\r
    public void Vote(User user, Post post, VoteType type)\r
    {\r
        if (post.Author.Id == user.Id)\r
            throw new InvalidOperationException("Cannot vote on your own post.");\r
\r
        if (!post.AddVote(new Vote(user, type)))\r
            throw new InvalidOperationException("User has already voted.");\r
\r
        _publisher.PublishVote(new VoteEvent(post, user, type));\r
    }\r
}\r
\r
public class ReputationService : IPostEventObserver\r
{\r
    public void OnVote(VoteEvent e)\r
    {\r
        int change = e.Post switch\r
        {\r
            Question => e.VoteType == VoteType.Upvote ? 5 : -2,\r
            Answer => e.VoteType == VoteType.Upvote ? 10 : -2,\r
            _ => 0\r
        };\r
        e.Post.Author.UpdateReputation(change);\r
    }\r
\r
    public void OnAnswerAccepted(Answer answer) => answer.Author.UpdateReputation(15);\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
public class User\r
{\r
    public long Id { get; }\r
    private int _reputation;\r
    public int Reputation => Volatile.Read(ref _reputation);\r
\r
    public void UpdateReputation(int amount) => Interlocked.Add(ref _reputation, amount);\r
}\r
\`\`\`\r
\r
## Concurrency and thread safety\r
\r
Three different primitives are doing three different jobs here, deliberately:\r
\r
- **Votes**: \`ConcurrentDictionary<userId, Vote>\` gives lock-free, atomic "insert if absent" semantics — exactly the one-vote-per-user rule the requirements demand, with no explicit lock.\r
- **Reputation**: a plain \`int\` field mutated only through \`Interlocked.Add\`, read through \`Volatile.Read\` — safe without a lock because it's a single scalar with one operation (add a delta).\r
- **Ordered collections** (a question's list of answers, a post's list of comments): a \`lock\` around mutation and around the read-and-copy, because list order and "don't lose an insert" can't be expressed as a single atomic primitive the way a dictionary or a counter can.\r
\r
> [!WARNING]\r
> Accepting an answer and voting on it can race: a vote event and an accept event might both fire close together and both try to update the same user's reputation. Because reputation updates are \`Interlocked.Add\` deltas rather than read-modify-write assignments, both apply correctly regardless of order — this is exactly why deltas, not absolute values, are the safe shape for concurrently-applied state.\r
\r
## Extending the design\r
\r
| New requirement | Where it plugs in | Why the design allows it |\r
|---|---|---|\r
| Vote retraction / change | \`RemoveVote\` already exists on \`Post\`; add a matching reputation-reversal event | Votes are keyed by user, so "did they already vote" and "what did they vote" are both O(1) |\r
| Reputation floor (never below zero) | Clamp inside \`ReputationService.OnVote\` before calling \`UpdateReputation\` | Scoring policy is isolated in one class, not scattered across vote/accept call sites |\r
| Real search engine (Elasticsearch) | New implementation behind the same \`SearchService\` interface | Callers depend on the interface, not the in-memory index internals |\r
| Notify a user when their answer is accepted | Another \`IPostEventObserver\` subscribing to \`PublishAnswerAccepted\` | Observer list grows without touching \`AnswerService\` |\r
| Only allow voting above a reputation threshold | A guard clause added inside \`VotingService.Vote\` | Voting is already funneled through one method, not scattered call sites |\r
\r
## Cheat sheet\r
\r
- \`Post\` as an abstract base for \`Question\`/\`Answer\` avoids duplicating vote/comment logic.\r
- Vote storage keyed by user id turns "one vote per user" into a structural guarantee, not a runtime check.\r
- Reputation is always a delta applied via \`Interlocked.Add\`/observer, never a value set directly by a caller.\r
- Vote and accept events flow through one publisher — new consumers subscribe, they never touch the publishers.\r
- Search is a separate service behind an interface from day one, so the in-memory index is swappable later.\r
- Only one accepted answer per question — enforce it inside \`Question.AcceptAnswer\`, not in the caller.\r
- Self-voting is rejected inside \`VotingService\`, not left to the UI to prevent.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| \`VotingService\` calling \`ReputationService\` directly | Publish an event; let \`ReputationService\` subscribe as an observer |\r
| \`List<Vote>\` with a manual "already voted" scan | \`ConcurrentDictionary<userId, Vote>\` — atomic by construction |\r
| Reputation stored/set as an absolute value | Always apply as an \`Interlocked.Add\` delta |\r
| Duplicating vote/comment logic in \`Question\` and \`Answer\` separately | Shared abstract \`Post\` base class |\r
| No guard against self-voting | Explicit check inside \`VotingService.Vote\`, not left to callers |\r
| Search coupled directly to the in-memory \`Dictionary\` | \`SearchService\` as its own class behind a stable method signature |\r
\r
## Summary\r
\r
A Q&A platform is a content-modeling exercise wrapped around one real concurrency problem: many users voting and posting at once must never corrupt a vote count or a reputation score. Sharing voting and commenting behaviour through an abstract \`Post\`, keying votes by user id, and routing every score change through an observer rather than a direct call keeps the three concerns — content, scoring, search — genuinely independent. Once that separation holds, retractable votes, a reputation floor, and a real search backend are all additive changes.\r
\r
## Top Interview Questions\r
\r
### Q1. Why should \`Question\` and \`Answer\` share an abstract \`Post\` base class rather than being independent classes?\r
\r
Both need identical voting and commenting behaviour — one vote per user, a list of comments, the same \`AddVote\`/\`AddComment\` contract. Implementing that twice risks the two copies drifting apart the first time either gets a bug fix or a new rule (say, a cooldown before voting again). An abstract base class means the behaviour is written and tested once, and \`Question\` and \`Answer\` each add only what's genuinely different about them — tags and answers for one, an "is accepted" flag for the other.\r
\r
### Q2. How do you guarantee a user can cast at most one vote per post under concurrent requests?\r
\r
Store votes in a \`ConcurrentDictionary<userId, Vote>\` on the post rather than a list. \`TryAdd\` is an atomic "insert only if the key is absent" operation, so if two requests for the same user's vote race, exactly one wins and the other's \`TryAdd\` returns false, which the service surfaces as "already voted." A \`List<Vote>\` with a manual "does a vote already exist for this user?" scan followed by an append has a race window between the check and the append that a keyed structure closes by construction.\r
\r
### Q3. Why publish a vote event instead of having \`VotingService\` update reputation directly?\r
\r
Because reputation is one of potentially several consumers of "a vote happened" — notifications, an activity feed, and analytics are equally plausible listeners, and none of them should require editing \`VotingService\`. Routing the event through a publisher that \`IPostEventObserver\` implementations subscribe to means \`VotingService\`'s only job is enforcing vote rules and announcing the outcome; it has zero knowledge of what happens next. This is the Observer pattern earning its keep: the set of subscribers can grow without the publisher's code changing at all.\r
\r
### Q4. Why is reputation stored and updated as a delta (\`Interlocked.Add\`) rather than a value set directly?\r
\r
Multiple events can affect the same user's reputation concurrently — a vote on one post and an accepted answer on another can land at nearly the same instant. If reputation were set as an absolute value ("set my score to X"), the two updates could race and the loser's effect would be silently lost. Applying each change as \`Interlocked.Add(ref _reputation, delta)\` makes updates commutative and order-independent: regardless of which one runs first, both deltas apply correctly, because addition doesn't need to know the prior value to be correct.\r
\r
### Q5. How would you enforce that a question can have only one accepted answer at a time?\r
\r
Put the check inside \`Question.AcceptAnswer\`, guarded by the same lock that protects the question's answer list: verify the candidate answer actually belongs to this question, verify no answer is already accepted (or, if re-accepting is allowed, un-accept the previous one first), then set \`AcceptedAnswer\` and call \`MarkAccepted()\` on the answer. Keeping this rule inside the aggregate root (\`Question\`) rather than in \`AnswerService\` or a caller means there is exactly one code path that can ever set an accepted answer, so the invariant can't be bypassed by a different caller forgetting the check.\r
\r
### Q6. How would you support retracting or changing a vote?\r
\r
\`Post\` already exposes \`RemoveVote(userId)\`, which is the retraction primitive. Changing a vote from up to down is a remove-then-add of the opposite type; the harder part is reputation — retracting or changing a vote needs to publish a compensating event (the exact negative of the original delta) rather than just "undo whatever the current reputation happens to be," because other events may have landed in between. This is why keeping reputation changes as discrete, independently-applied deltas (rather than derived from current vote state) pays off: reversing one is just applying its inverse.\r
\r
### Q7. Where would you plug in a full-text search engine like Elasticsearch instead of the in-memory index?\r
\r
Behind \`SearchService\`'s existing interface — \`SearchByKeyword\`, \`SearchByTag\`, \`SearchByUser\` — with zero changes to any caller. The in-memory implementation builds an inverted index from a \`Dictionary\`; an Elasticsearch-backed implementation would index documents on write and query the cluster on read, but as long as it implements the same method signatures, \`AnswerService\`, \`VotingService\` and the top-level facade never know the difference. This is the same "hide the volatile part behind an interface" principle used for pricing and matching strategies in other LLD problems.\r
\r
### Q8. How would you prevent a user from voting on their own post, and where does that check belong?\r
\r
Inside \`VotingService.Vote\`, before any mutation happens: compare \`post.Author.Id == user.Id\` and reject immediately if true. It has to live in the service layer, not in \`Post.AddVote\` itself, because \`Post\` doesn't necessarily know who is "currently acting" versus who authored it — the caller identity is a request-scoped concept that belongs to the layer orchestrating the action, not the entity being acted upon. Centralizing it in one method also means there's exactly one place to test and one place that can never be bypassed by a different entry point.\r
\r
### Q9. What happens if two vote requests for the same user on the same post arrive at nearly the same time?\r
\r
Both call \`post.AddVote(new Vote(user, type))\`, which internally does \`_votes.TryAdd(vote.User.Id, vote)\` on a \`ConcurrentDictionary\`. Exactly one \`TryAdd\` succeeds — the dictionary guarantees only one entry can exist per key — and the loser's call returns false, which \`VotingService\` turns into an "already voted" exception for that caller. No lock is needed because the dictionary's own atomicity is sufficient for this single-operation check-and-insert; this is a cheaper and more scalable answer than wrapping the whole method in a coarse lock.\r
\r
### Q10. How would you scale reputation calculation if the scoring rules become significantly more complex (streaks, decay over time, category-specific weighting)?\r
\r
Because scoring already lives entirely inside \`ReputationService.OnVote\`/\`OnAnswerAccepted\` and nowhere else, you can replace the simple \`switch\` expression with a full \`IReputationPolicy\` strategy without touching \`VotingService\`, \`AnswerService\`, or the entities themselves — they only know "an event was published," not how it's scored. This is the payoff of routing scoring through an observer in the first place: the policy is a leaf dependency that can be swapped, versioned, or A/B tested independently of the rest of the system.\r
`;export{e as default};
