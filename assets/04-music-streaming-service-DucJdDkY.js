const e=`---\r
title: Design a Music Streaming Service\r
description: Design a Spotify style music player with a catalog, playlists, a shuffle and repeat aware queue, and observer driven state updates\r
difficulty: Advanced\r
tags: [music-streaming, strategy-pattern, observer-pattern, state-machine]\r
---\r
\r
A music streaming design is really two smaller problems wearing one trenchcoat: a catalog/playlist content model, and a playback engine whose queue must support shuffle, repeat and "play next" without turning into a wall of conditionals. The state-management version — no actual audio bytes — is what interviewers ask, and the queue/player split is the whole game.\r
\r
## Requirements\r
\r
### Functional\r
\r
- A catalog of songs (title, artist, album, duration); search by title, artist or album, case-insensitive substring match.\r
- Users create playlists: add, remove, and reorder songs.\r
- Player operations: play (a playlist, album, or single song), pause, resume, next, previous, seek, stop.\r
- Shuffle on/off — a new random order each pass, without interrupting the currently playing song.\r
- Repeat modes: \`OFF\` (stop at the end), \`REPEAT_ONE\`, \`REPEAT_ALL\`.\r
- "Play next" inserts a song ahead of the normal queue, consumed before the queue resumes.\r
- Playback state changes (song changed, state changed) notify subscribers — UI, scrobbler, history — without the player knowing who they are.\r
- Track recently played songs per user.\r
\r
### Non-functional and assumptions\r
\r
- This is a state-management design — audio decoding, streaming, and buffering are explicitly out of scope.\r
- One active playback session per user for this pass; multi-device sync is discussed as an extension.\r
- Recommendations, radio, offline downloads and DRM are out of scope.\r
- The catalog can be large; search must not scan every song per keystroke.\r
\r
### Clarifying questions to ask\r
\r
> [!TIP]\r
> Ask "does shuffle reshuffle every loop, or shuffle once and repeat that order?" before writing \`PlayQueue\`. The answer decides whether \`REPEAT_ALL\` re-invokes the shuffle strategy at the wrap-around point or just resets a position counter — a small but easy-to-miss branch that a wrong assumption silently breaks.\r
\r
- Is playback of real audio in scope, or purely state management (queue position, play/pause)?\r
- Can a user queue a song ahead of the current playlist ("play next"), and does it survive a shuffle toggle?\r
- Does shuffle reshuffle on every loop through \`REPEAT_ALL\`, or keep the same shuffled order?\r
- Do we need free-tier restrictions (forced shuffle, ads) in scope, or just discussed as an extension?\r
- Is one active session per user assumed, or must multiple devices stay in sync?\r
\r
## Core objects\r
\r
| Class | Responsibility | Key fields/methods |\r
|---|---|---|\r
| \`Song\` / \`Playlist\` | Catalog value objects; an ordered, mutable list of songs | \`Title\`, \`Artist\`, \`Album\`; \`Add\`, \`Remove\`, \`Move\` |\r
| \`PlayQueue\` | Owns *ordering*: the source list, the shuffled/sequential index order, and the "play next" overrides | \`Load\`, \`Current()\`, \`Next(repeat)\`, \`Previous()\`, \`AddNext(song)\` |\r
| \`Player\` | Owns *state*: playing/paused/stopped, position, repeat/shuffle flags | \`Play\`, \`Pause\`, \`Resume\`, \`Next\`, \`Previous\`, \`Seek\` |\r
| \`IPlayStrategy\` | Builds a play order from a song count and an optional "keep this song first" index | \`BuildOrder(size, startIndex) -> List<int>\` |\r
| \`IPlaybackListener\` | Observer notified of song/state changes | \`OnSongChanged(song)\`, \`OnStateChanged(state)\` |\r
| \`SearchService\` | Inverted-index lookup over the catalog | \`Add(song)\`, \`Search(query)\` |\r
\r
## Class design\r
\r
\`\`\`mermaid\r
classDiagram\r
    class Song {\r
        -string Title\r
        -string Artist\r
        -string Album\r
        -int DurationSec\r
    }\r
    class Playlist {\r
        -List~Song~ Songs\r
        +Add(Song s) void\r
        +Remove(string id) void\r
        +Move(int from, int to) void\r
    }\r
    class PlayQueue {\r
        -List~Song~ songs\r
        -List~int~ order\r
        -int position\r
        -Deque~Song~ upNext\r
        +Load(songs, strategy) void\r
        +Current() Song\r
        +Next(RepeatMode mode) Song\r
        +SetStrategy(strategy) void\r
    }\r
    class Player {\r
        -PlayQueue queue\r
        -PlaybackState state\r
        -RepeatMode repeat\r
        -bool shuffle\r
        +Play(songs) void\r
        +Next() void\r
        +SetShuffle(bool on) void\r
    }\r
    class IPlayStrategy {\r
        <<interface>>\r
        +BuildOrder(int size, int? startIndex) List~int~\r
    }\r
    class SequentialStrategy\r
    class ShuffleStrategy\r
    class RepeatMode {\r
        <<enumeration>>\r
        Off\r
        RepeatOne\r
        RepeatAll\r
    }\r
    class PlaybackState {\r
        <<enumeration>>\r
        Playing\r
        Paused\r
        Stopped\r
    }\r
    class IPlaybackListener {\r
        <<interface>>\r
        +OnSongChanged(Song s) void\r
        +OnStateChanged(PlaybackState s) void\r
    }\r
    class SearchService {\r
        +Add(Song s) void\r
        +Search(string q) List~Song~\r
    }\r
    IPlayStrategy <|.. SequentialStrategy\r
    IPlayStrategy <|.. ShuffleStrategy\r
    Player --> PlayQueue\r
    Player --> IPlayStrategy\r
    Player --> IPlaybackListener\r
    PlayQueue --> Song\r
    Playlist --> Song\r
    SearchService --> Song\r
\`\`\`\r
\r
## Key design decisions\r
\r
### 1. The queue owns ordering; the player owns state\r
\r
\`PlayQueue\` never knows whether it is "playing" — it only answers "what's current, what's next." \`Player\` never sorts or shuffles anything — it only tracks \`PlaybackState\`, position, and delegates every "what song is this" question to the queue.\r
\r
> [!KEY]\r
> Rejected alternative: one \`Player\` class holding the song list, the shuffle flag, and play/pause state together. Toggling shuffle then means reaching into playback state to avoid disrupting the current song — exactly the kind of tangled conditional this split avoids.\r
\r
### 2. Shuffle vs sequential as a Strategy, not a branch\r
\r
\`IPlayStrategy.BuildOrder(size, startIndex)\` is the only thing that changes between shuffle and sequential playback; \`PlayQueue\` calls it the same way regardless of which is active. Pattern: **Strategy**. Rejected alternative: \`if (shuffle) { ...fisher-yates inline... } else { ...identity order... }\` scattered through \`Next()\`/\`Previous()\` — every future ordering mode (smart shuffle, least-recently-played-first) would mean editing the queue's core logic again.\r
\r
### 3. Shuffle reorders an index array, never the song list\r
\r
\`PlayQueue.order\` is a list of indices into the original \`songs\` list, not a physically reshuffled copy. Toggling shuffle off simply switches back to the identity strategy; the playlist itself is never mutated by playback, so two different sessions playing the same playlist never see each other's shuffle state bleed through.\r
\r
| Approach | Toggling shuffle off | Playlist mutation risk |\r
|---|---|---|\r
| Physically shuffle the song list in place | Original order is lost, must be reconstructed | ❌ Playback logic mutates shared data |\r
| Shuffle an index array over an untouched song list | Instant — switch strategies, rebuild order | ✅ Playlist is read-only from the queue's perspective |\r
\r
### 4. State changes are Observer events, not direct calls into consumers\r
\r
\`Player\` calls \`NotifySong\`/\`NotifyState\`, which fan out to every subscribed \`IPlaybackListener\` — history, scrobbling, analytics. Pattern: **Observer**. Rejected alternative: \`Player\` holding direct references to a \`HistoryService\` and a \`ScrobblerService\` and calling them by name — every new consumer (royalty tracking, live "now playing" widgets) would require editing the playback engine itself.\r
\r
## Implementation\r
\r
\`\`\`csharp\r
public interface IPlayStrategy\r
{\r
    List<int> BuildOrder(int size, int? startIndex);\r
}\r
\r
public class ShuffleStrategy : IPlayStrategy\r
{\r
    private readonly Random _random = new();\r
\r
    public List<int> BuildOrder(int size, int? startIndex)\r
    {\r
        var indices = Enumerable.Range(0, size).ToList();\r
        for (var i = size - 1; i > 0; i--)               // Fisher-Yates\r
        {\r
            var j = _random.Next(i + 1);\r
            (indices[i], indices[j]) = (indices[j], indices[i]);\r
        }\r
        if (startIndex.HasValue)\r
        {\r
            var pos = indices.IndexOf(startIndex.Value);\r
            (indices[0], indices[pos]) = (indices[pos], indices[0]);   // keep current song first\r
        }\r
        return indices;\r
    }\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
public class PlayQueue\r
{\r
    private List<Song> _songs = new();\r
    private List<int> _order = new();\r
    private readonly LinkedList<Song> _upNext = new();\r
    private IPlayStrategy _strategy = new SequentialStrategy();\r
    private int _position;\r
\r
    public void Load(IEnumerable<Song> songs, IPlayStrategy strategy)\r
    {\r
        _songs = songs.ToList();\r
        _strategy = strategy;\r
        _order = _strategy.BuildOrder(_songs.Count, null);\r
        _position = 0;\r
    }\r
\r
    public Song Current() => _order.Count == 0 ? null : _songs[_order[_position]];\r
\r
    public Song Next(RepeatMode repeat)\r
    {\r
        if (_upNext.Count > 0) { var s = _upNext.First.Value; _upNext.RemoveFirst(); return s; }\r
        if (repeat == RepeatMode.RepeatOne) return Current();\r
        if (_position + 1 < _order.Count) { _position++; return Current(); }\r
        if (repeat == RepeatMode.RepeatAll) { _order = _strategy.BuildOrder(_songs.Count, null); _position = 0; return Current(); }\r
        return null;\r
    }\r
\r
    public void SetStrategy(IPlayStrategy strategy)\r
    {\r
        var playing = _order.Count == 0 ? (int?)null : _order[_position];\r
        _order = strategy.BuildOrder(_songs.Count, playing);\r
        _position = playing.HasValue ? _order.IndexOf(playing.Value) : 0;\r
        _strategy = strategy;\r
    }\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
public class Player\r
{\r
    private readonly PlayQueue _queue = new();\r
    private readonly List<IPlaybackListener> _listeners = new();\r
    public PlaybackState State { get; private set; } = PlaybackState.Stopped;\r
    public RepeatMode Repeat { get; set; } = RepeatMode.Off;\r
\r
    public void Play(IEnumerable<Song> songs, IPlayStrategy strategy)\r
    {\r
        _queue.Load(songs, strategy);\r
        State = PlaybackState.Playing;\r
        _listeners.ForEach(l => l.OnSongChanged(_queue.Current()));\r
    }\r
\r
    public void Next()\r
    {\r
        var song = _queue.Next(Repeat);\r
        if (song == null) { State = PlaybackState.Stopped; return; }\r
        _listeners.ForEach(l => l.OnSongChanged(song));\r
    }\r
}\r
\`\`\`\r
\r
## Concurrency and thread safety\r
\r
With one active session per user, most playback state (\`Player\`'s position, \`PlayQueue\`'s order/position) needs no locking at all in the base design — a single user's requests are serialized by definition. Two places still need care:\r
\r
- **\`Playlist\` mutation while playing.** A user reordering a playlist that is simultaneously being played needs the edit (\`Add\`/\`Remove\`/\`Move\`) to be visible-or-not atomically to the queue reading \`_songs\` — copy-on-write (edits build a new list and swap a reference) avoids the reader ever seeing a half-updated list without needing a lock on every \`Current()\` call.\r
- **\`SearchService\` index writes vs reads.** Adding songs to the catalog mutates the inverted index while searches read it; a \`ReaderWriterLockSlim\` (many concurrent searches, occasional catalog writes) fits better than a single lock, since reads vastly outnumber writes for a music catalog.\r
\r
> [!WARNING]\r
> The subtlest correctness requirement in this whole design is that \`SetStrategy\` (toggling shuffle) must not interrupt the currently playing song. Skipping the "keep this song first" step in \`BuildOrder\` — even though it looks like an optional nicety — means every shuffle toggle silently jumps to a random song, which is exactly the kind of bug that only shows up in a live demo.\r
\r
## Extending the design\r
\r
| New requirement | Where it plugs in | Why the design allows it |\r
|---|---|---|\r
| Radio mode that never ends | \`PlayQueue\` pulls from an \`ISongSource\` instead of a fixed list once \`order\` nears exhaustion | \`Player\` only calls \`Next()\`; it never assumes the queue is finite |\r
| Free tier: forced shuffle, periodic ads | A \`FreeTierPlayer\` decorator wrapping \`Player\`, rejecting \`SetShuffle(false)\` and injecting ads on \`Next()\` | Entitlement rules stay out of the core playback logic entirely |\r
| Two devices, one account, kept in sync | Move \`Player\` state server-side per user; devices become clients sending commands and receiving \`IPlaybackListener\` events | The listener interface is already the exact shape of a push channel |\r
| Royalty tracking | Another \`IPlaybackListener\` firing a play-counted event past a 30-second threshold | Observers compose; adding one never touches \`Player\` |\r
| Collaborative playlists | \`Playlist\` mutations become versioned operations (add/remove/move + version number) broadcast to collaborators | \`Playlist\` already isolates its mutation methods from playback |\r
\r
## Cheat sheet\r
\r
- Split "what plays next" (\`PlayQueue\`) from "am I playing" (\`Player\`) — this single decision prevents almost every other tangle in this design.\r
- Shuffle is an index permutation over an untouched song list, never a destructive reorder of the playlist itself.\r
- \`SetStrategy\` must preserve the currently playing song — pass its index as \`startIndex\` into \`BuildOrder\`.\r
- \`REPEAT_ONE\` replays \`Current()\` without advancing position; \`REPEAT_ALL\` reshuffles (if shuffling) and resets to position 0 at the wrap-around.\r
- "Play next" is a small deque consumed before the main order resumes, and is unaffected by shuffle toggles.\r
- State broadcasts (\`OnSongChanged\`/\`OnStateChanged\`) go through Observer — the player never names its consumers.\r
- Search is an inverted index (token → song ids) with prefix matching, not a per-keystroke linear scan.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| One \`Player\` class owning both ordering and playback state | Split into \`PlayQueue\` (ordering) and \`Player\` (state) |\r
| Physically shuffling the playlist's song list | Shuffle an index array; leave the playlist untouched |\r
| Losing the current song on a shuffle toggle | Pass the currently playing index as \`startIndex\` into the new strategy's \`BuildOrder\` |\r
| \`if (shuffle) {...} else {...}\` inline in \`Next()\` | Extract \`IPlayStrategy\`; \`Next()\` stays ordering-agnostic |\r
| \`Player\` calling \`HistoryService\`/\`Scrobbler\` directly | Route through \`IPlaybackListener\` subscribers instead |\r
| Reshuffling on every \`Next()\` call instead of once per pass | Only rebuild \`order\` at the \`REPEAT_ALL\` wrap-around |\r
\r
## Summary\r
\r
The music streaming interview question rewards separating "what plays next" from "am I currently playing," because that split is what makes shuffle, repeat and "play next" each a small, local change instead of a knot of conditionals. Ordering lives in \`PlayQueue\` as a permuted index array over an untouched song list; state lives in \`Player\`; the two Strategy implementations swap ordering policy without either class knowing the other exists; and Observer keeps every downstream consumer — history, scrobbling, royalties — decoupled from the playback engine itself. Radio mode, free-tier restrictions and multi-device sync all attach at the seams this design already has.\r
\r
## Top Interview Questions\r
\r
### Q1. Why split the queue (ordering) and the player (state) into two separate classes instead of one \`Player\` class?\r
\r
Because they change for different reasons and at different rates: ordering policy (shuffle vs sequential, and future modes like smart shuffle) is a pure function of a song count and a starting point, while playback state (playing/paused/stopped, current position) is about the live session. Bundling both into one class means every ordering change risks touching state-transition code and vice versa — exactly the coupling that made toggling shuffle without interrupting the current song error-prone in early drafts. Two classes with a narrow contract between them (\`Current()\`, \`Next(repeat)\`) keep each concern independently testable.\r
\r
### Q2. How do you toggle shuffle on without interrupting the currently playing song?\r
\r
Capture the index of the song currently playing (\`order[position]\`) before building the new order, pass it into the strategy as \`startIndex\`, and have the strategy guarantee that index appears first in the new order. Then set \`position = 0\` (or \`order.IndexOf(playingIndex)\` if the strategy doesn't literally put it first) so \`Current()\` still resolves to the same song. Skipping this step is the single most common bug in this design — it looks like an edge case, but it's actually a core requirement disguised as one.\r
\r
### Q3. Walk through what \`REPEAT_ONE\` and \`REPEAT_ALL\` each do at the end of a playlist.\r
\r
\`REPEAT_ONE\` never advances position at all — every call to \`Next()\` returns \`Current()\` unchanged, replaying the same song indefinitely, and shuffle/order don't even come into play. \`REPEAT_ALL\` behaves like normal advancement until \`position + 1\` would exceed the order's length; at that wrap-around point, it calls the active strategy's \`BuildOrder\` again (producing a fresh shuffle if shuffling is on, or the same sequential order if not) and resets \`position\` to 0. \`OFF\` simply returns \`null\` past the end, which the player interprets as "stop playback."\r
\r
### Q4. Why represent shuffle as a list of indices into the song list rather than physically reordering the songs?\r
\r
Physically reordering destroys the original order — you'd need to snapshot it separately to restore sequential playback, and any other reader of the playlist (a "view this playlist" screen) would see the shuffled order too, which is wrong; a playlist's canonical order shouldn't depend on someone else's playback state. An index array is a thin, disposable view: the playlist stays exactly as authored, and switching strategies is just building a new list of integers, an O(n) operation with no risk of corrupting shared data.\r
\r
### Q5. How would "play next" interact with shuffle and repeat?\r
\r
"Play next" is a small deque (\`upNext\`) checked before anything else in \`Next()\` — if it has an entry, that song plays regardless of repeat mode or shuffle state, and it's consumed (removed) so it plays exactly once. This is deliberately orthogonal to the main \`order\` array: a user queuing a song ahead of the playlist shouldn't force a reshuffle or reset the main queue's position, and toggling shuffle afterward shouldn't discard a pending "play next" entry, since it lives in a completely separate structure.\r
\r
### Q6. How would you scale the search index for a catalog with millions of songs?\r
\r
The in-process inverted index (token → set of song ids) works for a moderate catalog but degrades for prefix search at scale — a linear scan over index keys for "starts with" matching is the first thing to replace, ideally with a trie for O(prefix length) lookups instead of O(keys). Beyond a single process, delegate to a dedicated search engine (Elasticsearch/OpenSearch) behind the same \`SearchService\` interface, which also naturally supports ranking by popularity — something a hand-rolled index needs to bolt on separately.\r
\r
### Q7. How would you design a "radio" mode that plays indefinitely once a playlist ends?\r
\r
Give \`PlayQueue\` an optional \`ISongSource\` it can pull from once \`order\` is close to exhausted, rather than assuming every queue is backed by a fixed, finite song list. \`Player.Next()\` doesn't change at all — it just keeps calling \`Current()\`/\`Next(repeat)\` on the queue, unaware that the queue is now infinite. The interesting design question is what the source recommends: similar-genre songs, songs by the same artist, or a collaborative-filtering service — but that's a pluggable detail behind \`ISongSource\`, not a change to the playback engine.\r
\r
### Q8. How would you model a free tier that forces shuffle-only playback and injects periodic ads?\r
\r
Wrap \`Player\` in a decorator — \`FreeTierPlayer\` — that intercepts \`SetShuffle(false)\` (reject or silently ignore it) and counts calls to \`Next()\`, injecting an ad play every N songs. The decorator delegates everything else straight through to the wrapped \`Player\`. This keeps entitlement logic entirely separate from playback mechanics: \`Player\` itself has no concept of "free" or "premium," so a policy change (ads every 4 songs vs every 6) never touches the playback engine's tests.\r
\r
### Q9. How do you keep two devices logged into the same account showing consistent playback state?\r
\r
Move \`Player\`'s state out of each device and into a server-side session keyed by user id; devices become thin clients that send commands (play, pause, next) to that session and receive \`IPlaybackListener\`-shaped events back (song changed, state changed) to render locally. Exactly one device holds an "active" flag at a time, and a transfer command flips which device is authoritative. The existing observer interface is precisely the push channel this needs — no new abstraction, just a different transport (a socket/push service instead of an in-process call).\r
\r
### Q10. Why route playback notifications through an \`IPlaybackListener\` interface instead of calling \`HistoryService\` and \`ScrobblerService\` directly from \`Player\`?\r
\r
Because the list of things that care "a song started playing" grows over the product's life — recently-played history, third-party scrobbling, royalty accounting, live "now playing" widgets — and none of that is \`Player\`'s concern. If \`Player\` called each consumer by name, every new consumer would mean editing and redeploying the playback engine; with Observer, new consumers just implement the interface and subscribe. It also makes \`Player\` trivially testable in isolation: a test double listener can assert exactly which events fired without any of the real consumers being instantiated.\r
\r
### Q11. What would you change to support a "smart shuffle" that avoids repeating an artist back-to-back?\r
\r
Add a new \`IPlayStrategy\` implementation whose \`BuildOrder\` runs the same Fisher-Yates shuffle and then post-processes the result with a constraint-satisfaction pass — swapping adjacent entries where two consecutive songs share an artist, bounded by a few retries to avoid infinite loops on artist-heavy playlists. \`PlayQueue\` needs zero changes: it already treats the strategy as an opaque order-producer. This is exactly the kind of requirement the Strategy split was built to absorb without touching queue or player internals.\r
\r
### Q12. How would you unit test \`PlayQueue.Next()\` behavior across shuffle and repeat combinations without involving real randomness?\r
\r
Inject a fake \`IPlayStrategy\` whose \`BuildOrder\` returns a fixed, known order regardless of input, then assert \`Next()\`'s behavior deterministically: that \`REPEAT_ONE\` never advances position, that \`REPEAT_ALL\` calls \`BuildOrder\` again exactly once per wrap-around, and that \`upNext\` entries are always returned first regardless of repeat mode. Testing \`ShuffleStrategy\` itself separately just needs a statistical check (every index 0..n-1 appears exactly once) rather than asserting a specific order, since true randomness is the point.\r
`;export{e as default};
