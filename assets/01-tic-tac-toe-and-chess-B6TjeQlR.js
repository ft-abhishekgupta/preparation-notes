const e=`---\r
title: Design Board Games\r
description: How a generic board abstraction built for Tic-Tac-Toe extends to Chess and Connect Four, covering move validation, check detection and win checks\r
difficulty: Advanced\r
tags: [board-games, chess, tic-tac-toe, connect-four, design-patterns]\r
---\r
\r
Board games are the classic "start simple, then generalize" interview arc: design Tic-Tac-Toe cleanly enough — a generic board, pluggable win/move rules — and the follow-ups "now make it Chess" and "now make it Connect Four" become extension exercises instead of rewrites.\r
\r
## Requirements\r
\r
### Functional\r
\r
- A generic board of configurable dimensions that every game shares.\r
- **Tic-Tac-Toe:** two players alternate placing X/O on a 3×3 grid; detect a win (row, column or diagonal) or a draw after every move, in O(1) per move rather than rescanning the board.\r
- **Chess:** 8×8 board, full piece hierarchy (Pawn, Rook, Knight, Bishop, Queen, King) each with its own movement rule; alternating turns; detect check, checkmate and stalemate; support undoing the last move.\r
- **Connect Four:** 7-column, 6-row grid; players drop discs that fall to the lowest empty row in the chosen column (gravity) instead of placing on any empty cell; detect four in a row (horizontal, vertical or diagonal) or a full-board draw.\r
- Reject illegal moves in every game: occupied cell (or full column, for Connect Four), wrong turn, out-of-bounds, moving after the game is over, or (for Chess) a move that leaves the mover's own king in check.\r
\r
### Non-functional and assumptions\r
\r
- Single local two-player game per instance; no networking or matchmaking in this scope.\r
- Chess legality is computed as "pseudo-legal moves per piece rule, filtered to those that don't leave your own king in check" — full FIDE rules (castling, en passant, threefold repetition) are treated as extensions, not core scope, unless the interviewer says otherwise.\r
- Undo must be efficient — it should not require a full board copy on every single move for a game with a long history.\r
\r
### Clarifying questions to ask\r
\r
- Is board size fixed (3×3 / 8×8 / 7×6) or should the design generalize to arbitrary rows and columns?\r
- For chess, is the full V1 rule set in scope (castling, en passant, promotion), or a simplified subset first?\r
- Do we need an AI opponent, or is this always two human players making moves through the same interface?\r
- Is move history / replay / PGN-style export required?\r
- Do we need to support multiple concurrent games in one process (a server hosting many matches), or just one game at a time?\r
- Is a game clock (timed moves) in scope?\r
\r
## Core objects\r
\r
| Class | Responsibility | Key fields/methods |\r
|---|---|---|\r
| \`Board<TPiece>\` | Generic grid storage, bounds checking | \`Cells\`, \`Get(pos)\`, \`Place(pos, piece)\` |\r
| \`Position\` | A row/column coordinate, value-equal | \`Row\`, \`Col\` |\r
| \`IGame\` | Turn loop and win/draw detection contract | \`MakeMove(move) -> MoveResult\`, \`IsOver\` |\r
| \`TicTacToeGame\` | Concrete game; O(1) win check via line counters | \`LineCounters\`, \`MakeMove(pos, player)\` |\r
| \`ConnectFourGame\` | Concrete game; gravity drop, bounded local win check | \`DropDisc(col, player)\`, \`CheckWinFrom(pos)\` |\r
| \`IPiece\` / piece hierarchy | Chess piece identity and movement rule | \`Color\`, \`GetPseudoLegalMoves(board, pos)\` |\r
| \`IMovementStrategy\` | Movement pattern shared or overridden per piece | \`GetMoves(board, position)\` |\r
| \`ChessGame\` | Concrete game; legality filter, check detection | \`IsInCheck(color)\`, \`MakeMove(move)\` |\r
| \`Move\` (Command) | An executed move, storing what it captured | \`Execute(board)\`, \`Undo(board)\` |\r
| \`GameHistory\` | Stack of executed moves for undo | \`Push(move)\`, \`PopAndUndo()\` |\r
\r
## Class design\r
\r
\`\`\`mermaid\r
classDiagram\r
    class Board~TPiece~ {\r
        -TPiece[,] cells\r
        -int rows\r
        -int cols\r
        +TPiece Get(Position p)\r
        +void Place(Position p, TPiece piece)\r
        +bool InBounds(Position p)\r
    }\r
    class Position {\r
        -int Row\r
        -int Col\r
    }\r
    class IGame {\r
        <<interface>>\r
        +MoveResult MakeMove(Move move)\r
        +bool IsOver\r
    }\r
    class TicTacToeGame {\r
        -int[] rowCounts\r
        -int[] colCounts\r
        -int diagCount\r
        -int antiDiagCount\r
        +MoveResult MakeMove(Position p, Player player)\r
    }\r
    class ChessGame {\r
        -Board~IPiece~ board\r
        -GameHistory history\r
        +bool IsInCheck(Color c)\r
        +MoveResult MakeMove(Move move)\r
    }\r
    class ConnectFourGame {\r
        -int[] colHeights\r
        +MoveResult DropDisc(int col, Player player)\r
    }\r
    IGame <|.. TicTacToeGame\r
    IGame <|.. ChessGame\r
    IGame <|.. ConnectFourGame\r
    class IPiece {\r
        <<interface>>\r
        +Color Color\r
        +List~Move~ GetPseudoLegalMoves(Board board, Position pos)\r
    }\r
    class Pawn\r
    class Rook\r
    class Knight\r
    class Bishop\r
    class Queen\r
    class King\r
    IPiece <|.. Pawn\r
    IPiece <|.. Rook\r
    IPiece <|.. Knight\r
    IPiece <|.. Bishop\r
    IPiece <|.. Queen\r
    IPiece <|.. King\r
    class Move {\r
        -Position From\r
        -Position To\r
        -IPiece Captured\r
        +void Execute(Board board)\r
        +void Undo(Board board)\r
    }\r
    class GameHistory {\r
        -Stack~Move~ moves\r
        +void Push(Move m)\r
        +Move PopAndUndo(Board board)\r
    }\r
    ChessGame --> Board\r
    ChessGame --> GameHistory\r
    ChessGame ..> Move\r
    ConnectFourGame --> Board\r
    Board "1" --> "*" IPiece\r
    GameHistory "1" --> "*" Move\r
\`\`\`\r
\r
## Key design decisions\r
\r
### 1. One generic \`Board<TPiece>\`, not two board implementations\r
\r
\`Board<TPiece>\` handles dimensions, bounds checking and cell storage for both games — Tic-Tac-Toe instantiates it as \`Board<Mark>\`, Chess as \`Board<IPiece>\`. Both games' win/legality logic sits above this shared layer, not duplicated inside it.\r
\r
> [!KEY]\r
> Rejected alternative: a \`TicTacToeBoard\` and a \`ChessBoard\` as unrelated classes. It looks fine until you need Connect Four (another grid with its own win rule) and realize you're copy-pasting bounds-checking code a third time instead of reusing one generic class.\r
\r
### 2. Win detection: O(1) incremental counters, not a full-board rescan\r
\r
| Approach | Cost per move | Notes |\r
|---|---|---|\r
| Rescan the whole board for 3-in-a-row after every move | O(n²) | Simple, but wasteful — most cells didn't just change |\r
| Maintain a counter per row, column, and both diagonals; \`+1\` for X, \`-1\` for O; a counter hitting \`±N\` means a win | O(1) | Only the four counters touched by the new move need updating |\r
\r
For an N×N board, a move at \`(r, c)\` updates \`rowCounts[r]\`, \`colCounts[c]\`, and, only if \`r == c\` or \`r + c == N - 1\`, the corresponding diagonal counter. A counter reaching \`+N\` or \`-N\` is an immediate win — no scanning required.\r
\r
### 3. Chess piece movement as a Strategy per piece type\r
\r
Each piece implements \`IPiece.GetPseudoLegalMoves(board, position)\` according to its own rule — a \`Bishop\` walks diagonals until blocked, a \`Knight\` jumps in an L-shape ignoring blocking pieces along the way. \`ChessGame\` calls this same method regardless of which piece occupies the square.\r
\r
> [!TIP]\r
> Saying "pseudo-legal, then filtered for check" out loud is the phrase that separates a candidate who has actually implemented chess move validation from one who hasn't: movement rules and check-legality are two separate passes, not one combined rule per piece.\r
\r
| Approach | Problem |\r
|---|---|\r
| One \`Board.IsValidMove(from, to)\` method with a switch on piece type | Every new piece type (or variant like Chess960) means editing one growing method |\r
| \`IPiece.GetPseudoLegalMoves\` per piece, \`ChessGame\` filters for check afterward | New piece type = new class; check-filtering logic never duplicated per piece |\r
\r
### 4. Undo via invertible Move commands, not full-board Memento snapshots\r
\r
Each \`Move\` records what it captured (if anything) and any special-move metadata, and knows how to \`Undo(board)\` itself — this is a Command pattern with built-in inverse, pushed onto a \`GameHistory\` stack.\r
\r
| Approach | Trade-off |\r
|---|---|\r
| Memento: snapshot the entire board before every move | Simple to reason about, but O(board size) memory per move — expensive over a long game, and awkward to extend for partial state like "can still castle" |\r
| Command: each \`Move\` stores just what it changed and reverses itself | O(1) space per move; naturally extends to store promotion/castling-rights deltas |\r
\r
> [!WARNING]\r
> A common bug: \`Move.Undo\` restores the moved piece but forgets to restore a captured piece to the destination square, silently "deleting" it from the game on undo. The captured piece must be part of the \`Move\` object, not looked up again after the fact — it may no longer be findable once the move executed.\r
\r
### 5. Connect Four: gravity changes the move, not the win-check philosophy\r
\r
Connect Four reuses \`Board<TPiece>\` unchanged (\`Board<Disc>\`, 7 columns × 6 rows) and keeps the same "no full-board rescan" philosophy as Tic-Tac-Toe — but the O(1) *mechanism* has to change, because Tic-Tac-Toe's trick only works when the win length equals the board dimension.\r
\r
| Game | Win length vs. board size | O(1) technique |\r
|---|---|---|\r
| Tic-Tac-Toe | Win length (3) == board dimension (3) | Global running counter per row/column/diagonal; a counter reaching ±N is an immediate win |\r
| Connect Four | Win length (4) < board dimensions (7×6) | A row/column counter would need to reach ±7 or ±6 to fire — it never will, since a win only needs 4. Instead, walk outward from the just-placed disc in each of the 4 directions (horizontal, vertical, both diagonals), counting matching discs until a mismatch or the edge; the move wins if any direction's total (new disc included) reaches 4 |\r
\r
Both approaches are O(1) per move — the walk is bounded by the fixed win length (at most 3 cells outward in each direction), never by board size — but Connect Four's check is a *local* scan anchored at the last move rather than a *global* running sum.\r
\r
> [!KEY]\r
> Rejected alternative: reusing Tic-Tac-Toe's row/column/diagonal sum counters as-is for Connect Four. They only detect "this entire line is one color," which never fires once a line is longer than the win condition. The generic *shape* of the optimization survives (O(1), no rescan) but the specific counters do not transfer between the two games.\r
\r
The other new mechanic is gravity: a move isn't "place at any empty cell" but "drop into a column, land on the lowest empty row." Tracking \`colHeights[col]\` incrementally makes this O(1) too — the landing row is \`rows - 1 - colHeights[col]\`, and a full column (\`colHeights[col] == rows\`) rejects the move with no per-move scan of the column.\r
\r
Author's original board and win-check sketches for this problem:\r
\r
![alt text](notes/LLD/Problems/ConnectFour/image.png)\r
\r
![alt text](notes/LLD/Problems/ConnectFour/image-1.png)\r
\r
![alt text](notes/LLD/Problems/ConnectFour/image-2.png)\r
\r
![alt text](notes/LLD/Problems/ConnectFour/image-3.png)\r
\r
![alt text](notes/LLD/Problems/ConnectFour/image-4.png)\r
\r
## Implementation\r
\r
\`\`\`csharp\r
public class TicTacToeGame : IGame\r
{\r
    private readonly int[] _rowCounts, _colCounts;\r
    private int _diag, _antiDiag;\r
    private readonly int _n;\r
\r
    public MoveResult MakeMove(Position p, int playerSign) // +1 = X, -1 = O\r
    {\r
        _rowCounts[p.Row] += playerSign;\r
        _colCounts[p.Col] += playerSign;\r
        if (p.Row == p.Col) _diag += playerSign;\r
        if (p.Row + p.Col == _n - 1) _antiDiag += playerSign;\r
\r
        bool won = Math.Abs(_rowCounts[p.Row]) == _n || Math.Abs(_colCounts[p.Col]) == _n\r
                || Math.Abs(_diag) == _n || Math.Abs(_antiDiag) == _n;\r
        return won ? MoveResult.Win : MoveResult.Continue;\r
    }\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
public class ConnectFourGame : IGame\r
{\r
    private const int Rows = 6, Cols = 7, WinLength = 4;\r
    private readonly Disc?[,] _grid = new Disc?[Rows, Cols];\r
    private readonly int[] _colHeights = new int[Cols];\r
    private static readonly (int dr, int dc)[] Directions = { (0, 1), (1, 0), (1, 1), (1, -1) };\r
\r
    public MoveResult DropDisc(int col, Disc color)\r
    {\r
        if (_colHeights[col] >= Rows) return MoveResult.Invalid; // column full\r
\r
        var row = Rows - 1 - _colHeights[col]; // gravity: lowest empty row\r
        _grid[row, col] = color;\r
        _colHeights[col]++;\r
\r
        return CheckWinFrom(row, col, color) ? MoveResult.Win : MoveResult.Continue;\r
    }\r
\r
    private bool CheckWinFrom(int row, int col, Disc color)\r
    {\r
        foreach (var (dr, dc) in Directions)\r
        {\r
            var count = 1 + CountDirection(row, col, dr, dc, color)\r
                           + CountDirection(row, col, -dr, -dc, color);\r
            if (count >= WinLength) return true;\r
        }\r
        return false;\r
    }\r
\r
    private int CountDirection(int row, int col, int dr, int dc, Disc color)\r
    {\r
        var count = 0;\r
        var r = row + dr;\r
        var c = col + dc;\r
        while (r >= 0 && r < Rows && c >= 0 && c < Cols && _grid[r, c] == color)\r
        {\r
            count++;\r
            r += dr;\r
            c += dc;\r
        }\r
        return count;\r
    }\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
public class Bishop : IPiece\r
{\r
    public Color Color { get; }\r
    private static readonly (int dr, int dc)[] Directions = { (1, 1), (1, -1), (-1, 1), (-1, -1) };\r
\r
    public List<Move> GetPseudoLegalMoves(Board<IPiece> board, Position from)\r
    {\r
        var moves = new List<Move>();\r
        foreach (var (dr, dc) in Directions)\r
        {\r
            var pos = new Position(from.Row + dr, from.Col + dc);\r
            while (board.InBounds(pos) && board.Get(pos)?.Color != Color)\r
            {\r
                moves.Add(new Move(from, pos, board.Get(pos)));\r
                if (board.Get(pos) != null) break; // captured a piece, stop this direction\r
                pos = new Position(pos.Row + dr, pos.Col + dc);\r
            }\r
        }\r
        return moves;\r
    }\r
}\r
\`\`\`\r
\r
\`\`\`csharp\r
public bool IsInCheck(Color color, Board<IPiece> board)\r
{\r
    var kingPos = board.FindKing(color);\r
    return board.AllPieces(color.Opposite())\r
        .Any(p => p.Piece.GetPseudoLegalMoves(board, p.Position).Any(m => m.To.Equals(kingPos)));\r
}\r
\`\`\`\r
\r
## Concurrency and thread safety\r
\r
A single local game is inherently sequential — one player moves, then the other — so \`IGame\` implementations need no internal locking for that case. The concurrency question shows up the moment you host many games in one process (an online server): each \`ChessGame\`/\`TicTacToeGame\` instance should own its own lock (or be pinned to a single-threaded actor/queue) so that a move submission and, say, a resignation/timeout event for the *same* game never interleave into a corrupted board.\r
\r
Across games, no shared mutable state exists if each game owns its own \`Board\` and \`GameHistory\` — the only shared thing is typically a game registry (\`Dictionary<GameId, IGame>\`), which needs its own concurrent collection, independent of any single game's internal lock.\r
\r
> [!NOTE]\r
> A subtle race: a player submits move #12 while a timeout handler is simultaneously declaring the game lost on time. Attach a monotonically increasing move/turn sequence number to submissions, and reject any move whose sequence number doesn't match the game's current expected turn — this makes "which happened first" unambiguous instead of relying on lock timing alone.\r
\r
## Extending the design\r
\r
| New requirement | Where it plugs in | Why the design allows it |\r
|---|---|---|\r
| Pop-out / gravity-reversal Connect Four variant | New drop/removal method on \`ConnectFourGame\`, same \`CheckWinFrom\` scan | Win detection is already anchored at whichever cell just changed, not a global rescan |\r
| Chess960 / castling / en passant | Extra fields on \`Move\` (rights deltas) and special-case entries in \`King\`/\`Pawn\`'s \`GetPseudoLegalMoves\` | Movement is already isolated per piece type |\r
| AI opponent | A \`IMoveSelector\` (minimax/alpha-beta) consuming \`GetPseudoLegalMoves\` + \`IsInCheck\`, or exhaustive search over \`DropDisc\` for Connect Four | Move generation and legality are already exposed as reusable methods |\r
| Game clocks / timed moves | A \`Clock\` wrapping \`IGame.MakeMove\`, no change inside the game logic | Turn boundaries are already a single well-defined method call |\r
| Move history / PGN export | \`GameHistory\` already stores every \`Move\` in order | Undo stack doubles as a replay log with no extra bookkeeping |\r
\r
## Cheat sheet\r
\r
- One generic \`Board<TPiece>\` shared by every game; win/legality rules live above it, not inside it.\r
- Tic-Tac-Toe win check: four counters (rows, cols, 2 diagonals), updated in O(1) per move — never rescan.\r
- Connect Four win check: bounded local walk in 4 directions from the just-dropped disc, not a global counter — the counter trick only works when win length equals board dimension.\r
- Chess legality is two passes: pseudo-legal (piece's own rule) then filtered for "does this leave my king in check."\r
- Movement per piece type is a Strategy — one class per piece, no switch statement in the board.\r
- Undo is a Command with a built-in inverse (\`Execute\`/\`Undo\`), not a full board snapshot per move.\r
- A captured piece must be stored on the \`Move\` itself so undo can restore it exactly.\r
- Design the board and move representation first — Tic-Tac-Toe, Chess and Connect Four differ only in the win/legality/placement rules layered on top of it.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Rescanning the whole board for a win after every move | Maintain row/col/diagonal counters, check in O(1) |\r
| Separate, duplicated board classes per game | One generic \`Board<TPiece>\` shared by all games |\r
| Reusing Tic-Tac-Toe's global row/column counters for Connect Four unchanged | Switch to a bounded local walk from the last move — win length is smaller than the board dimension |\r
| A switch statement on piece type inside the board's move validation | \`IPiece.GetPseudoLegalMoves\` per piece class |\r
| Treating "pseudo-legal" and "doesn't leave king in check" as one rule | Two explicit passes — generate, then filter |\r
| Full board snapshot (Memento) for every move's undo | Command-style \`Move\` with \`Execute\`/\`Undo\` and O(1) stored state |\r
| Losing a captured piece on undo | Store the captured piece reference on the \`Move\`, restore it in \`Undo\` |\r
\r
## Summary\r
\r
The interview payoff of this problem is the generalization step: a generic \`Board<TPiece>\` plus an \`IGame\` interface lets Tic-Tac-Toe's O(1) line-counter win check, Connect Four's gravity-drop with a bounded local win scan, and Chess's per-piece movement Strategy all coexist as implementations of the same shape rather than three unrelated systems. Chess adds one genuinely new idea — legality as pseudo-legal-moves-filtered-by-check — and an efficient Command-based undo instead of a heavyweight board snapshot; Connect Four's only new idea is that gravity constrains where a move can land, and that win detection has to be a bounded local scan rather than a global counter once win length is smaller than the board. Once those pieces are in place, Chess960 and an AI opponent are extensions layered on top, not redesigns.\r
\r
## Top Interview Questions\r
\r
### Q1. How do you check for a win in Tic-Tac-Toe in O(1) instead of scanning the board?\r
\r
Maintain four running counters: one per row, one per column, and two for the diagonals. Represent each player's mark as \`+1\` or \`-1\`; when a move is placed at \`(r, c)\`, add the player's value to \`rowCounts[r]\` and \`colCounts[c]\`, and additionally to the main diagonal counter if \`r == c\`, or the anti-diagonal counter if \`r + c == n - 1\`. After updating, check whether any of the (at most four) touched counters has reached magnitude \`n\` — if so, that player just won. This turns win detection into constant-time bookkeeping per move instead of an O(n²) rescan, and generalizes cleanly to any N×N board.\r
\r
### Q2. What is the difference between a "pseudo-legal" move and a "legal" move in chess, and why separate them?\r
\r
A pseudo-legal move follows the movement pattern of the piece alone — a bishop moves diagonally, a knight jumps in an L — without checking whether making that move would leave the mover's own king under attack. A legal move is a pseudo-legal move that additionally passes that check. Separating them keeps each \`IPiece\` implementation simple (it only ever needs to know its own movement geometry) and puts the more expensive, board-wide "would my king be in check afterward" computation in exactly one place (\`ChessGame\`), run once per candidate move rather than duplicated inside every piece class.\r
\r
### Q3. How would you detect checkmate versus stalemate?\r
\r
Both start from the same computation: does the player to move have *any* legal move at all? If \`IsInCheck(currentPlayer)\` is true and no legal move exists, it's checkmate. If \`IsInCheck(currentPlayer)\` is false and no legal move exists, it's stalemate (a draw). Computing "any legal move exists" means generating every piece's pseudo-legal moves for the side to move, filtering each by whether it leaves that side's own king in check, and short-circuiting as soon as one legal move survives the filter — you don't need to enumerate all of them, just confirm at least one exists.\r
\r
### Q4. Why model piece movement as a Strategy (one class per piece type) instead of one method with a switch on piece type?\r
\r
Chess has six distinct movement rules, several with genuine complexity (a pawn's forward move, diagonal capture, double-step from its starting rank, and en passant are all different cases). A single \`GetMoves(pieceType, position)\` method with a switch grows into an unreadable block mixing six unrelated algorithms, and adding a chess variant with a new piece (like Chess960's or fairy-chess pieces) means editing that shared method. One class per piece type, each implementing the same interface, means each piece's logic is independently testable and a new piece type is purely additive.\r
\r
### Q5. How do you implement undo efficiently for a long chess game?\r
\r
Model each executed move as a Command object storing exactly what it needs to reverse itself — the origin and destination squares, any captured piece (so it can be restored, not just left off the board), and any special-move metadata like "this move waived castling rights" or "this was an en passant capture." Push each \`Move\` onto a stack (\`GameHistory\`) as it executes; undo pops the stack and calls \`Move.Undo(board)\`. This is O(1) extra state per move, versus a full board copy (Memento) which costs O(board size) per move and gets awkward once you need to track auxiliary state like castling rights alongside the raw piece positions.\r
\r
### Q6. What's a design mistake candidates commonly make when implementing chess \`Undo\`?\r
\r
Forgetting that a captured piece must be restored, not just re-derived. If \`Undo\` only moves the piece back from \`to\` to \`from\` but doesn't also place the captured piece back on \`to\`, that piece silently vanishes from the game. The fix is that the \`Move\` object itself must carry a reference to whatever piece (if any) it captured, captured *before* the move executes, so \`Undo\` has everything it needs without trying to reconstruct history it no longer has access to.\r
\r
### Q7. Why can't Tic-Tac-Toe's global row/column/diagonal counter trick be reused unchanged for Connect Four?\r
\r
The counter trick relies on a specific coincidence in Tic-Tac-Toe: the win length (3) equals the board dimension (3), so a counter summing an entire row or diagonal naturally reaches its winning magnitude exactly when that line is fully claimed by one player. Connect Four breaks that coincidence — the win length (4) is smaller than the board's rows (6) and columns (7), so a full-row or full-column counter would need to reach ±7 or ±6, which never happens for a 4-in-a-row win. The fix is to replace the global running sum with a bounded local scan anchored at the just-placed disc: walk outward up to 3 cells in each of 4 directions (and their opposites), counting consecutive same-color discs, and declare a win if any direction's total reaches 4. Both techniques are O(1) per move, but one sums whole lines globally and the other inspects a small neighborhood around the last move — recognizing which one a given win condition requires is the actual test here, not memorizing either implementation.\r
\r
### Q8. How would you add an AI opponent to this design?\r
\r
Introduce an \`IMoveSelector\` (or similar) that, given the current \`Board\` and player-to-move, evaluates candidate moves using \`GetPseudoLegalMoves\` (filtered to legal moves via the same \`IsInCheck\` check) and picks one via minimax with alpha-beta pruning (or, for Tic-Tac-Toe, an exhaustive search since the state space is tiny). Neither the board representation nor the move-generation/legality code needs to change at all — the AI is purely a consumer of the same public surface a human player's UI would call, which is a strong signal that the move-generation layer was designed at the right level of abstraction.\r
\r
### Q9. How would you support a game clock (timed moves) without touching the core game logic?\r
\r
Wrap \`IGame.MakeMove\` with a decorator or a thin orchestrating layer that starts a per-player timer when it becomes their turn, stops it when they submit a move, and declares a loss-on-time if the timer expires before a move arrives — none of which requires the \`TicTacToeGame\`/\`ChessGame\` classes to know timers exist. This works because "make a move" is already a single, well-defined entry point; the clock is purely an external policy layered on top of that entry point, following the same "wrap, don't modify" principle used for adding transaction limits to the ATM's Command objects.\r
\r
### Q10. Two players submit conflicting move requests for the same game at nearly the same time (e.g., a stale client resubmits an old move after a timeout). How do you handle it?\r
\r
Attach a monotonically increasing turn/sequence number to the game state, and require every submitted move to include the sequence number it believes is current; reject (as a stale/conflicting request) any submission whose sequence number doesn't match. Combine this with per-game serialization (a lock, or pinning the game to a single-threaded actor/queue) so that "check sequence number, apply move, increment sequence number" happens as one atomic unit — this prevents a delayed retransmission of an old move from being silently replayed against a board state it was never intended for.\r
\r
### Q11. How would you unit test move generation and check detection independent of a full game?\r
\r
Construct a \`Board<IPiece>\` directly with a small, hand-placed set of pieces (no \`ChessGame\` needed), and assert \`piece.GetPseudoLegalMoves(board, position)\` returns exactly the expected set of destination squares for a range of scenarios — blocked paths, edge-of-board positions, available captures. Separately, test \`IsInCheck\` by constructing boards where a king is and isn't attacked by a specific piece, asserting the boolean result directly. Because movement rules and check detection are decoupled from turn management and undo history, both can be tested with minimal, targeted board setups rather than playing out a full game.\r
\r
### Q12. What's the biggest structural risk in this design if requirements later demand full FIDE rules (castling, en passant, threefold repetition, fifty-move rule)?\r
\r
The pieces most at risk are \`Move\`'s stored metadata and \`GameHistory\`: castling rights and en passant eligibility are *history-dependent* state (a rook that has moved can never castle again, even if it later returns to its original square), so \`Move\` needs to record rights-deltas, not just board positions, and \`IsInCheck\`/legality filtering needs to account for "the king can't castle through a square that's under attack." Threefold repetition and the fifty-move rule require comparing board states or move counts across the whole history, which is straightforward once \`GameHistory\` already stores every move in order, but it's a good idea to flag these as known extensions up front rather than let them surface as surprises mid-implementation.\r
`;export{e as default};
