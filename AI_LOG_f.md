# AI_LOG.md — Sudoku Paradox

> Pixathon hackathon · Topic: **Puzzle with a Twist** (take a classic puzzle, break one rule)
> Game: **Sudoku Paradox** (working title during design: *Chronos Sudoku*)
> Pitch: Solve three linked Sudoku boards (Past, Present, Future) at once. Every move echoes through time.

---

## 1. Tools Used

| Tool | What we used it for |
|------|---------------------|
| **Claude** | Phase planning, SPEC.md, level design (`levels.json`), independent solver (`solver.js`), final polish/juice pass |
| **Copilot** | Early ideation: brainstorming new rules to add to classic Sudoku |
| **PixelLab** | Pixel-art game background, title screen, in-game screen with Hint/Restart buttons |
| **Antigravity** | _TODO: fill in what it was used for (e.g. running the agentic coding steps)_ |
| **Codex** | _TODO: fill in what it was used for_ |
| **Stitch** | _TODO: fill in, or remove if not used_ |
| **Suno** | _TODO: music.mp3 (89 s loop), or remove if not used_ |
| **ElevenLabs** | _TODO: sound effects (place, echo, blocked, stone, win), or remove if not used_ |

---

## 2. Key Prompts

Format: **[tool] – [prompt] – [what we got] – [kept / changed]**

### 2.1 Claude — Hackathon game-engineer workflow (topic selection and phases)

- **Prompt (summary):** Acted as "Lead Game Engineer and Puzzle Master" for a 2-hour build, aimed at the 100-point rubric (Smart use of AI 40, Creativity 20, Usability 15, Feel & Design 10, Fun 10, Pitch 5). Work in strict phases: (1) 10 lateral mechanical twists on the problem statement, (2) single-file `index.html` core loop with win state, move counter and Undo (Z), (3) 5 JSON levels plus a BFS solver that flags impossible or under-3-move levels, (4) draft this `AI_LOG.md`. The attached problem statement was inserted where the prompt had its placeholder.
- **What we got:** A phased plan and a list of twist ideas to choose from.
- **Kept / changed:** **Kept** the phased approach. The final design changed shape (see 2.3).

<details>
<summary>Full prompt</summary>

```
Act as my Lead Game Engineer and Puzzle Master for the Pixathon hackathon. We
have exactly 2 hours to build and ship a playable web-based puzzle game.
Here is the newly revealed problem statement:
[INSERT EXACT PROBLEM STATEMENT HERE]
Our goal is to max out the 100-point judging rubric: Smart use of AI (40), Creativity (20),
Usability (15), Feel & Design (10), Fun Factor (10), and Pitch (5).
We will execute this in strict phases. Do not move to the next phase until I give you the
command.
PHASE 1: THE TWIST (Target: 20 pts Creativity & Originality)
Generate 10 highly lateral, fresh mechanical twists on this problem statement. They must
trigger an "aha!" moment for the player, but remain simple enough to code in HTML/JS/CSS
within 30 minutes. Present the list concisely.
PHASE 2: CORE LOOP (Target: 15 pts Usability + 10 pts Fun)
Once I select the twist, generate a single-file index.html prototype.
- It must be playable instantly with no setup.
- Include a clear win state, keyboard/mouse controls, a move counter, and an 'Undo'
  function (Z key).
- Structure the code cleanly so I can easily swap in UI CSS from Stitch and sprite assets
  from PixelLab later.
PHASE 3: LEVELS & SOLVER (Target: 40 pts Smart Use of AI)
Generate 5 distinct levels of increasing difficulty formatted in JSON.
Then, write a lightweight solver algorithm (e.g., BFS) to playtest the levels. The solver must
output the minimum move count for each level and explicitly flag any level that is physically
impossible to solve or can be beaten in under 3 moves.
PHASE 4: EVIDENCE LOG
Draft the foundation for our AI_LOG.md repository file. Include the AI tools we are using
(Antigravity, Stitch, PixelLab, Suno, ElevenLabs), summarize the key prompts we just used, and
leave a specific placeholder titled "When AI got it wrong" that I can fill in with a screenshot of a
broken level.
```
</details>

### 2.2 Copilot — Ideation on the twist

- **Prompt:** Attached the problem statement, then: *"So we are thinking of adding some new rules to the existing sudoku puzzle, maybe a new rule to add numbers in sudoku which would make it more difficult and add more constraints to add numbers, give an idea."*
- **What we got:** Ideas for extra Sudoku constraints.
- **Kept / changed:** **Changed.** We took the "extra constraint on placing numbers" direction and developed it into the three-linked-boards (Past / Present / Future) echo mechanic.

### 2.3 Claude — SPEC.md for "Chronos Sudoku"

- **Prompt (summary):** Acted as puzzle game designer and technical lead. Concept: classic Sudoku, but the player solves three linked boards (Past, Present, Future) at once, and a move on one board creates a deterministic "echo" on the others. Asked for a one-page `SPEC.md` for a single `index.html` (vanilla JS, DOM/canvas) loading `levels.json`, covering: start-screen pitch (under 20 words); at most 2 exact, deterministic echo rules with defined behaviour when an echo hits a filled/fixed cell; win condition; lose/feedback behaviour; controls (click/tap, number pad, Undo `Z`, Restart `R`); 8 level ideas (4x4 first, 6x6 later, 9x9 only if time allows) with MVP vs stretch; `levels.json` schema; in/out of scope; riskiest part with a fallback; and a testing checklist for a Node solver.
- **What we got:** `SPEC.md` defining the echo rules **E1** (Present -> Future, column shift) and **E2** (Future -> Past, mirrored column), the level table, and the schema.
- **Kept / changed:** **Kept.**

<details>
<summary>Full prompt</summary>

```
You are a puzzle game designer and technical lead. Concept: "Chronos Sudoku", a
Sudoku variant for the hackathon topic "Puzzle with a Twist" (take a classic
puzzle, break one rule). We have 2 hours to build, so scope must be tiny.
Base puzzle: standard Sudoku (each digit once per row, column, and box).
Twist: the player solves three linked boards (Past, Present, Future) at once.
A move on one board creates a deterministic "echo" on the others.
Write SPEC.md, under one page, assuming a single index.html with vanilla JS
and canvas/DOM, loading levels from levels.json. Include:
1. One-line start-screen pitch: base puzzle + twist, under 20 words.
2. Echo rules: define EXACT, deterministic rules (e.g. "placing digit d at
   (r,c) in Present also places d at (r,(c+2) mod N) in Future"). No
   randomness, no "might". Keep to at most 2 echo rules total, each easy to
   explain in one sentence. Specify what happens when an echo hits an
   already-filled or fixed cell (block the move or flash red).
3. Win condition: all three boards are valid Sudoku and no echo conflicts.
4. Lose/feedback: conflicting moves flash red and the move is rejected or
   must be undone. Say which.
5. Controls: click/tap cell, number pad, undo (Z), restart (R), keyboard and
   touch.
6. Level progression: 8 level ideas, each introducing exactly one new idea.
   Levels 1-3 use 4x4 boards, later levels 6x6, and 9x9 only if time allows.
   Mark which are MVP (first 3-4) and which are stretch.
7. levels.json schema: board size, fixed givens for each of the 3 boards, echo
   rule IDs enabled, and a "solution" field so a solver can verify it.
8. In scope / explicitly out of scope (no multiplayer, no generator, no
   accounts, no backend).
9. Riskiest part to build, and the simplest fallback if it fails (e.g. drop to
   2 boards).
Then give a testing checklist: how a Node solver (solver.js) would confirm each
level has a valid solution and exactly one solution, and how we would
hand-verify Level 1 in under a minute.
```
</details>

### 2.4 Claude — Level design for `levels.json`

- **Prompt (summary):** Acted as puzzle level designer and QA engineer. Given `SPEC.md`, design `levels.json` using the exact schema plus extra `tier` (MVP/stretch) and `note` fields. Supplied the structural facts: E1 and E2 are bijections within a row, so the whole solution is determined by one Present grid P (Future = shift_k(P), Past = mirror(Future)); mirroring preserves Sudoku validity; if k is a multiple of the box width any valid Present gives a valid Future, otherwise P must be searched for. Required a design procedure (pick P, derive boards, verify, choose givens, check consistency, prove uniqueness), difficulty rules (one new idea per level, 5-8 givens per board in Level 1 dropping to 3-5 by Level 4), a flag for dead-end traps (no erase, only undo), and honesty rules (mark "UNVERIFIED" rather than guess, say "skipped" for 9x9). Output: JSON block, verification table, list of low-confidence levels.
- **What we got:** A `levels.json` with multiple levels plus a verification table.
- **Kept / changed:** **Kept, then verified independently** by `solver.js` (see 2.5) rather than trusting the model's uniqueness claims.

<details>
<summary>Full prompt</summary>

```
You are a puzzle level designer and QA engineer. Below is SPEC.md for
"Chronos Sudoku". Design the levels for levels.json using the exact schema in
section 7, plus two extra fields per level: "tier" ("MVP" or "stretch") and
"note" (one line: the intended first deduction and the idea this level teaches).
The game ignores extra fields.
given SPEC.md
STRUCTURAL FACTS TO USE (derived from the spec):
- E1 maps each Present row to a column-shifted Future row, and E2 mirrors each
  Future row into Past. Both are bijections within a row, so a complete
  solution is determined by ONE Present grid P. Future = shift_k(P) and
  Past = mirror(Future).
- Mirroring a valid Sudoku always gives a valid Sudoku, so Past is automatically
  valid whenever Future is.
- If k is a multiple of the box width (4x4 k=2, 6x6 k=3, 9x9 k=3), any valid
  Present gives a valid Future. If not (k=1), P must be specially chosen so that
  shift_k(P) is also valid. Search for such a P first, then build the level
  around it.
- Design procedure for every level: (1) pick P, (2) compute Future and Past,
  (3) verify all three boards are valid Sudoku, (4) choose givens spread across
  the boards as the level idea requires, (5) check givens are consistent with
  E1/E2 (no two linked givens may hold different digits), (6) confirm the
  solution is UNIQUE by reasoning through every cell or by a systematic
  elimination argument.
LEVEL PLAN (follow the spec table):
- Level 1: reuse the spec's Level 1 exactly (already brute-force checked).
- Levels 2-4 (MVP, 4x4): follow the spec's idea for each. Levels 2 and 4 must
  teach their idea through the givens' placement, not through extra rules.
- Levels 5-7 (stretch, 6x6, boxes 2 rows x 3 cols): design them only if you
  can verify uniqueness. Otherwise mark them "UNVERIFIED" instead of guessing.
- Level 8 (9x9): skip unless every step above is fully verified. Say "skipped".
DIFFICULTY RULES:
- Level 1 must be solvable in one pass with almost no thought: the first
  Present move should visibly echo into Future and Past.
- Each level adds exactly one idea and removes some hand-holding. Never add two
  new things at once.
- 4x4 levels: roughly 5-8 givens per board in Level 1, dropping to about 3-5 by
  Level 4. A level with a single obvious deduction path is too easy; a level
  needing trial and error is too hard for a 30-second pitch.
- Because there is no erase (undo only), flag any level where a plausible wrong
  first move leads to a dead end that is only discovered several moves later.
OUTPUT, in this order:
1. A single valid JSON code block containing {"levels": [...]}. Strings are
   row-major, "." for empty, length N*N, solution digits only. No comments.
2. A verification table, one row per level: id, givens count per board
   (past/present/future), k, the first 3 forced moves a player should find,
   and why the solution is unique.
3. A short list of levels you are NOT fully confident about and why.
Do not invent rules beyond the spec. If a spec idea is impossible to realize
with unique solutions (for example Level 4's givens-only-on-Future-and-Past
turns out to have multiple solutions), say so and propose the smallest change.
```
</details>

### 2.5 Claude — Independent solver / QA (`solver.js`)

- **Prompt (summary):** Acted as QA engineer. Write a dependency-free Node script that verifies every level in `levels.json` by re-implementing the SPEC rules **independently** of `index.html` (so a game bug cannot hide a solver bug). Checks per level: structure, givens consistency, solution validity, solution count (stop at 2: UNIQUE / MULTIPLE / NONE), minimum moves, **trap moves** (legal first moves that differ from the unique solution, with depth-limited dead-end search, flag "HARSH"), single-step "forced move" solvability, and a full replay of the stored solution. Each level PASS/FAIL, with HARSH and not-forced-solvable as warnings; exit code 1 on any FAIL. Also asked to self-test by deleting one given (expect MULTIPLE) and changing one given to a conflicting digit (expect FAIL).
- **What we got:** `solver.js`, committed as *"Add independent level solver and QA Checks"*.
- **Kept / changed:** **Kept.** This is our main "smart use of AI" evidence: AI generated the levels, and a second AI-written implementation checked them.

<details>
<summary>Full prompt</summary>

```
You are a QA engineer for a puzzle game. Read SPEC.md and levels.json in this
repo. Write solver.js, a single dependency-free Node script (run with
node solver.js) that verifies every level in levels.json. Do not modify
SPEC.md, levels.json, or index.html.
IMPLEMENT THE RULES INDEPENDENTLY. Do not copy code from index.html. The
solver is a second, separate implementation of SPEC.md section 2, so that a
bug in the game cannot hide a bug in the solver.
Rules recap (SPEC.md is authoritative if this differs):
- Three boards (past, present, future), each N x N, row-major strings, "." is
  empty. Box size is level.box = [rows, cols], so boxes are rows tall and
  cols wide.
- E1: digit d at (r,c) in Present also appears at (r, (c+shift) mod N) in
  Future.
- E2: digit d at (r,c) in Future also appears at (r, N-1-c) in Past.
- A Present move triggers E1 then E2. A Future move triggers E2 only. A Past
  move triggers nothing.
- A move is rejected if the target is filled, if any echo lands on a cell
  holding a DIFFERENT digit, or if the digit repeats in a row, column or box
  on any board it touches. An echo landing on the same digit is allowed.
  Moves are atomic.
CHECKS PER LEVEL (print one line per level plus a summary table):
1. STRUCTURE: strings have length N*N, "." only in givens, digits 1..N only in
   solution, box dimensions divide N, shift is between 1 and N-1.
2. GIVENS CONSISTENT: no two linked cells (by E1/E2) hold different givens, and
   no board's givens repeat a digit in a row, column or box.
3. SOLUTION VALID: each solution board is a valid Sudoku, every E1/E2 link
   matches, and every given equals the solution at that cell.
4. SOLUTION COUNT: count all complete solutions by backtracking, stopping at 2.
   Hint: the Present board determines Future and Past through E1 and E2, so
   search over Present cells only and derive the other two boards. Report
   UNIQUE, MULTIPLE (print both solutions), or NONE. If UNIQUE, confirm it
   equals the "solution" field.
5. MINIMUM MOVES: count the linked cell groups (one cell per board, joined by
   E1/E2) that contain at least one empty cell. Each needs one move. Report it.
   Expected: 16 on 4x4 levels and 36 on 6x6 levels.
6. TRAP MOVES (most important): from the starting position, enumerate every
   LEGAL first move (board, r, c, digit) using the rules above. A legal move
   whose digit differs from the unique solution is a trap, because there is no
   erase and the player must undo it. For each level report:
   - number of legal first moves, number of traps, and trap percentage,
   - for up to 5 traps, the number of further legal moves a player can make
     before reaching a dead end (a position with empty cells but no legal
     move that agrees with the solution). Use depth-limited DFS, cap at 12.
   Flag a level "HARSH" if more than 60% of legal first moves are traps and
   the typical dead end is discovered 4 or more moves later.
7. SINGLE-STEP SOLVABILITY: simulate a human who only plays "forced" moves
   (a cell with exactly one legal digit under the rules). Report whether the
   level is fully solved this way. If yes, the level is "forced-solvable".
   If not, report how many cells remain, which means it needs guessing.
8. REPLAY: apply the stored solution move by move (Present cells first, then
   Future-only leftovers, then Past-only leftovers) through your own move
   function and confirm every move is accepted and the final state is a win.
OUTPUT:
- Per level: id, name, N, shift, givens count per board (past/present/future),
  UNIQUE/MULTIPLE/NONE, min moves, legal first moves, traps, trap %, and
  forced-solvable yes/no.
- Mark each level PASS or FAIL. FAIL means checks 1 to 4 or 8 failed.
  HARSH and not-forced-solvable are WARNINGS, not failures.
- End with a summary line, e.g. "7 levels: 7 PASS, 1 WARN", and exit with
  code 1 if any level FAILs, otherwise 0.
- Keep the code commented and readable. Wrap each level in try/catch so one
  malformed level does not stop the run.
HOW TO TEST YOUR SOLVER BEFORE FINISHING:
- Run node solver.js and paste the output.
- Make a temporary copy of levels.json, delete one given from Level 1, and
  confirm the solver reports MULTIPLE for it. Then change one given to a
  conflicting digit and confirm it reports FAIL. Do not commit the temp file.
- Commit solver.js with the message "Add independent level solver and QA
  Checks".
```
</details>

### 2.6 PixelLab — Game screen background

- **Prompt:** *"I am making a game of sudoku with a twist. I will have 3 sudoku grids namely past, present and future. My entry of a number in the present sudoku grid will affect my game in past and future. I want you to make a background with the following things to be followed. **The Past (Board 1, far left):** sepia tones, warm amber, or faded bronze. It should look old, stable, and rigid. **The Present (Board 2, middle):** clean electric blue, crisp white, and sharp cyan. This is the active workspace. **The Future (Board 3, far right):** neon green, holographic teal, or cyberpunk pink/magenta. It should look slightly unstable or glowing. This is the theme and background of the game."*
- **What we got:** A three-zone themed background.
- **Kept / changed:** **Kept** as the visual theme. The final board colours became `#ecd9a8` (Past), `#5aa0ff` (Present) and `#19ff9d` (Future).

### 2.7 PixelLab — Title screen

- **Prompt:** *"This is the final decided layout of our game. I want you to generate the first page to enter the game. I want the page to contain a 'PLAY' button in the middle, a 'SETTINGS' button in the bottom left corner, a 'HOW TO PLAY' button in the bottom right corner. Keep the play button larger than the other two buttons. I want the name of the game 'SUDOKU PARADOX' above the play button in another font which will pop the name. I want the background according to the image sent. I want the theme, background and elements of this page according to the image sent."*
- **What we got:** A steampunk title frame with the logo and PLAY button (`assets/ui/title-frame.png`).
- **Kept / changed:** **Changed.** The final asset is a compact framed title card with a baked-in PLAY button. The SETTINGS / HOW TO PLAY corner buttons were replaced by on-page how-to text and a gear decoration.

### 2.8 PixelLab — In-game screen with Hint and Restart

- **Prompt:** *"Here's reference of previous image, please update it by adding a hint button on the bottom left corner and a restart button on the right. Use the image above and keep the theme same, blending in the buttons and not popping them too much."*
- **What we got:** `btn-hint.png` and `btn-restart.png`, plus a game mockup.
- **Kept / changed:** **Kept.** Used as pixel-art image buttons.

### 2.9 Claude — "End: juice" polish pass (art, sound, juice)

- **Prompt (summary):** Acted as a front-end polish engineer. Add art, sound and juice **without changing the rules or touching the engine**: do not edit anything between `ENGINE-START` and `ENGINE-END` in `index.html` (the solver test loads that block), keep a single `index.html`, keep element ids and the `.btn` class, keep 60 fps, touch and keyboard support, honour `prefers-reduced-motion`, and keep it working over `file://`. Work in four steps, each ending in a playable build and a commit:
  1. **Title screen** (*"Add steampunk title screen"*): `title-frame.png` with a transparent clickable PLAY hotspot, glow/active states, rotating gear.
  2. **Image buttons** (*"Use pixel-art Hint and Restart buttons"*): `.imgbtn` styling, a HINT button giving a one-line rule reminder per level (never a move or solution), key `H`, a dock layout that fits a 375px phone, brass-styled UNDO.
  3. **Audio** (*"Wire in music and sound effects"*): audio manager with overlapping SFX, looping music started on PLAY, an exact event-to-sound mapping, mute toggle (`M`) saved in `localStorage`, music paused when the tab is hidden.
  4. **Juice** (*"Add juice: particles, transitions, hover states"*): win particle burst on one canvas, fade level transitions, red border glow on rejected moves, echo pulse delayed per hop, hover/pressed states, CSS-only steampunk rivets on the Past board.
- **What we got:** A styled, animated, audio-enabled build with the engine untouched.
- **Kept / changed:** _TODO: note anything you reverted or tweaked after testing._

<details>
<summary>Full prompt</summary>

```
You are a front-end polish engineer. Read index.html, SPEC.md and the files in
assets/. Add art, sound and juice WITHOUT changing the rules or touching the
engine.
HARD CONSTRAINTS
- Do NOT edit anything between the comments "ENGINE-START" and "ENGINE-END" in
  index.html. The solver test loads that block. Only the UI section and the
  CSS/HTML may change.
- Keep it one index.html (inline CSS and JS). Assets load from assets/.
- Keep the existing element ids and the class "btn" on every button: the click
  handler uses event delegation on ".btn", ids undobtn, restartbtn, replaybtn,
  nextbtn, playbtn, and data-d on number buttons.
- Keep 60 fps, touch + keyboard working, and respect prefers-reduced-motion.
- Make sure the page still works when opened via file:// (levels.json already
  falls back to an embedded copy; audio and images must not need fetch()).
- No new rules, no timer, no erase. Boards must stay DOM grids so cells remain
  tappable. Do not replace boards with images.
- Work in the numbered steps below. After EACH step: open the game in the
  browser, confirm Level 1 can still be completed, then commit with the message
  shown. Never go more than one step without a playable build. If a step
  breaks the game, revert it and move on.
ASSETS (already in the repo)
- assets/ui/title-frame.png (216x207, transparent): steampunk frame with the
  "SUDOKU PARADOX" logo and a baked-in PLAY button in its lower half.
- assets/ui/gear.png (22x22), assets/ui/btn-hint.png (63x42, text baked in),
  assets/ui/btn-restart.png (77x42, text baked in). All are pixel art, so use
  image-rendering: pixelated and scale by WHOLE numbers (1x on screens under
  520px wide, 2x above).
- assets/ui/reference/title-screen.png and game-mockup.png: visual references
  only. Match their look, do not ship them.
- Audio: music.mp3 (89 s loop), sfx-place.mp3, sfx-echo.mp3, sfx-blocked.mp3,
  sfx-stone.mp3 (about 1 s each), sfx-win.mp3 (2 s).
STEP 1: Title screen (commit "Add steampunk title screen")
- In #start, show title-frame.png as the main visual instead of the text h1
  (keep an sr-only h1 for accessibility). Keep the one-line pitch and the 3
  how-to lines BELOW the image: the pitch must stay visible, it is a topic
  must-have.
- Make the baked-in PLAY button clickable: overlay a transparent <button
  class="btn" id="playbtn" aria-label="Play"> positioned in percentages over
  the PLAY area. It is roughly x 38% to 92%, y 53% to 73% of the image. Verify
  with a screenshot and adjust until the hotspot covers exactly the drawn
  button. Add a hover and focus-visible glow around it (CSS filter or
  box-shadow on the wrapper) and a :active press (translateY 2px).
- Enter and Space must still start the game.
- Place gear.png as a slowly rotating decoration (20 s per turn, none under
  reduced motion) in the top-right corner of the title card, and one small one
  beside the in-game "SUDOKU PARADOX" heading.
STEP 2: Image buttons (commit "Use pixel-art Hint and Restart buttons")
- Replace the DOM RESTART button with btn-restart.png inside
  <button class="btn imgbtn" id="restartbtn" aria-label="Restart">. Add a HINT
  button the same way using btn-hint.png with id="hintbtn".
- .imgbtn: no background, border or box-shadow, padding 0, pixelated. Hover:
  filter brightness(1.25). Active: translate(2px,2px). Keyboard focus-visible:
  a visible outline.
- Add "hintbtn" to the click handler. HINT shows a ONE-LINE RULE REMINDER in
  #msg (tone ""), never a move or a solution, and has no cost or limit. Use
  this table, keyed by level id (store it in a const HINTS object in the UI
  section, do NOT edit levels.json):
  1: "Place a number in the Present and watch where it lands in the Future and Past."
  2: "A given on another board can block your move. Check the dashed outline first."
  3: "The drift is +2 now: the echo jumps half the board."
  4: "The Present is empty. Work backward from the Future and Past givens."
  5: "Boxes are 2 tall by 3 wide here. Drift +3 jumps half the board."
  6: "Drift is +1: the Present's last column wraps to the Future's first."
  7: "The Future has no givens. Use the Present and Past together."
  Add key H as a shortcut. Update the dock layout so UNDO, the number pad,
  HINT and RESTART all fit on one row on desktop and wrap cleanly on a 375px
  phone, keeping the dock tappable.
- Leave UNDO as a DOM button but restyle it with a brass border (#c28f4a) and
  dark background so it matches the new art.
STEP 3: Audio (commit "Wire in music and sound effects")
- Create a small audio manager in the UI section:
  const SFX = { place, echo, blocked, stone, win } built with new Audio(path).
  To allow overlapping plays use sfx.cloneNode(true).play(). Wrap every play()
  in try/catch plus .catch(() => {}) so a missing file or autoplay block never
  throws. Preload with preload="auto".
- Music: create the music Audio with loop = true and volume 0.3, and start it
  inside the PLAY handler (browsers block autoplay before a user gesture).
- Event mapping (this exact mapping):
  successful move in place(): sfx-place, then sfx-echo about 120 ms later,
                              ONLY if the move wrote echo cells (once per
                              move, never once per echoed cell)
  rejected move:              sfx-blocked
  undo() and restart():       sfx-echo at playbackRate 1.4, volume 0.5
  PLAY pressed and loadLevel() via NEXT LEVEL: sfx-stone
  win():                      sfx-win; duck music volume to 0.12 while the
                              win overlay is visible, restore to 0.3 when
                              it closes
- Add a small mute toggle (a DOM .btn with id="mutebtn", showing "SND" or
  "MUTE", key M) that mutes music and all sfx. Remember the setting in
  localStorage inside try/catch and default to unmuted.
- Pause the music when the tab is hidden (visibilitychange) and resume after.
STEP 4: Juice (commit "Add juice: particles, transitions, hover states")
Keep every effect cheap (CSS or one small canvas), and honor reduced motion.
- Particle burst on level complete: a single full-screen <canvas> with
  pointer-events:none, about 60 square pixel particles in the three board
  colors (#ecd9a8, #5aa0ff, #19ff9d), gravity, fade over about 1.2 s, then the
  canvas clears and stops its requestAnimationFrame loop. Trigger it in win().
- Smooth level transitions: when NEXT LEVEL or REPLAY is pressed, fade the
  .stage out (150 ms), call loadLevel(), then fade it in (200 ms). Do not
  touch the engine.
- Board shake on a rejected move already exists: keep it, and also add a short
  red glow on the offending board's border for 300 ms.
- Echo flight cue: when a move writes echo cells, the existing "pulse" class
  already plays. Delay it by 100 ms per hop (Future first, then Past) so the
  echo visibly travels through time.
- Hover states: .cell:hover gets a subtle brighten on devices with
  (hover:hover), .btn:hover a brass or glow border, and the number pad keys
  show a pressed state.
- Past board frame: add steampunk details with CSS only (brass rivets in the
  four corners via radial-gradient
```
</details>

---

## 3. When AI Got It Wrong

> **TODO — fill this in with real examples from your build.** Suggested structure for each incident: *what failed -> how we caught it -> what we did.*

### Incident 1: Broken / non-unique level
- **What failed:** _e.g. Claude's level N had multiple solutions (or a given that conflicted with an echo link) despite the verification table claiming it was unique._
- **How we caught it:** `node solver.js` reported `MULTIPLE` / `FAIL` on that level.
- **What we did:** _e.g. added/changed a given, re-ran the solver until PASS._
- **Screenshot:**

  ![Broken level](docs/screenshots/broken-level.png)

### Incident 2: _(optional)_
- **What failed:**
- **How we caught it:**
- **What we did:**

### Incident 3: _(optional — e.g. PLAY hotspot misaligned over the baked-in button, art not matching the layout, audio not playing before a user gesture)_
- **What failed:**
- **How we caught it:**
- **What we did:**

---

## 4. How AI Shaped the Design

AI shaped the core idea: a Copilot brainstorm about extra placement constraints became the Past/Present/Future echo mechanic, which Claude then turned into a precise, deterministic spec (E1 and E2). Claude designed the levels, and a separately written solver (`solver.js`) checked them for uniqueness, trap moves and forced-solvability, so AI output was tested rather than trusted. PixelLab produced the steampunk-meets-future visual identity and Claude wired in the art, sound and juice without touching the verified game engine.

---

## 5. Repo Notes

- `SPEC.md` — game specification (echo rules, levels, schema)
- `levels.json` — level data
- `solver.js` — independent QA solver (`node solver.js`)
- `index.html` — game (engine block marked `ENGINE-START` / `ENGINE-END`)
- `assets/` — pixel-art UI and audio
