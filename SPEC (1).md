# SPEC.md: Chronos Sudoku

Single `index.html` (vanilla JS + DOM grid), levels loaded from `levels.json`. No build step.

## 1. Start-screen pitch
"Sudoku, but you solve Past, Present and Future at once. Every move echoes through time."

## 2. Echo rules (deterministic, no randomness)
Boards are N x N, indexed (r,c) from 0. Two rules, applied in a chain:
- **E1 (Present to Future):** placing d at (r,c) in Present also places d at (r, (c+k) mod N) in Future. `k` is set per level.
- **E2 (Future to Past):** placing d at (r,c) in Future also places d at (r, N-1-c) in Past (mirror).
- Chain: a Present move triggers E1, which triggers E2. A Future move triggers E2 only. A Past move triggers nothing.
- **Echo hits a filled cell:** same digit already there = fine, nothing changes. Different digit (given or placed) = the whole move is rejected.
- **Link check:** any filled pair linked by E1/E2 must hold the same digit. A direct move that breaks this is rejected.
- **Atomic:** if any step of the chain breaks a rule below, nothing is written.

## 3. Win condition
All three boards completely filled. Because every move is validated, that means all three boards are valid Sudoku (row, column, box) and every E1/E2 link matches. Run a full re-check on completion before showing the win screen.

## 4. Lose / feedback
There are no lives. A move is **rejected, not applied**, and the offending cells flash red for 400 ms (echo targets included) with a one-line reason ("Echo hits a 3 in Future"). A move is rejected if it:
- repeats a digit in a row, column or box on any board it touches,
- collides with a different digit via an echo,
- targets a given or already-filled cell (cells are never overwritten).

There is no erase. Undo is the only way to remove a placed digit, and it removes that move's whole echo chain.

## 5. Controls
- Tap or click a cell on any board to select it (givens and filled cells are locked).
- Number pad buttons 1..N, plus keys 1-9 on keyboard.
- Undo: button or **Z** (full-state snapshot stack, unlimited). Restart: button or **R**.
- Echo preview: when a cell is selected, ghost-outline its echo targets on the other boards.

## 6. Levels (each adds exactly one idea)
| # | Size | Idea | Tier |
|---|------|------|------|
| 1 | 4x4, k=1 | Echo basics: Present to Future to Past | MVP |
| 2 | 4x4, k=1 | Fewer givens: a given on another board blocks your move | MVP |
| 3 | 4x4, k=2 | Different drift distance | MVP |
| 4 | 4x4, k=1 | Givens only on Future and Past: reason backward | MVP |
| 5 | 6x6 (2x3 boxes), k=3 | First 6x6 | Stretch |
| 6 | 6x6, k=1 | Echo wraps across box edges | Stretch |
| 7 | 6x6, k=3 | One board has zero givens | Stretch |
| 8 | 9x9, k=3 | Finale | Stretch (only if time) |

## 7. levels.json schema
Boards are row-major strings of length N*N. `.` is empty. Digits only in `solution`.
```json
{ "levels": [ {
  "id": 1, "name": "First Echo", "size": 4, "box": [2,2],
  "echoes": ["E1","E2"], "shift": 1,
  "givens":   { "past": "..1..4....2.2...", "present": "1..4.4....4.4..1", "future": "4....3....1....2" },
  "solution": { "past": "3214143241232341", "present": "1234341221434321", "future": "4123234132141432" }
} ] }
```
Level 1 above was brute-force checked: exactly one solution.

## 8. Scope
**In:** 4 MVP levels, undo, restart, red-flash feedback, echo preview, level select, touch + keyboard, GitHub Pages deploy.
**Out (binding):** multiplayer, level generator, accounts, backend, leaderboard, hints, pencil marks, erase tool, timer, more than 2 echo rules.

## 9. Riskiest part
The atomic echo chain plus link check (partial writes leaving boards inconsistent). Build one pure function `tryMove(state, board, r, c, d)` that returns the new state or a rejection reason, and have the UI only render its output.
**Fallback:** drop Past (keep E1 only, 2 boards, same rules). For 6x6/9x9, use only box-aligned shifts (k = N/2) so valid Presents always exist.
