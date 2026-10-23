#!/usr/bin/env node
// Independent QA solver for the three-board Sudoku Paradox rules.
// Usage: node solver.js [path/to/levels.json]

const fs = require('fs');
const path = require('path');

const BOARD_NAMES = ['past', 'present', 'future'];
const BOARD_INDEX = { past: 0, present: 1, future: 2 };
const MAX_DEPTH = 12;

function fail(message) { throw new Error(message); }

function checkSudoku(board, n, boxRows, boxCols) {
  for (let r = 0; r < n; r++) {
    const row = new Set();
    for (let c = 0; c < n; c++) {
      const d = board[r * n + c];
      if (d && row.has(d)) return false;
      if (d) row.add(d);
    }
  }
  for (let c = 0; c < n; c++) {
    const col = new Set();
    for (let r = 0; r < n; r++) {
      const d = board[r * n + c];
      if (d && col.has(d)) return false;
      if (d) col.add(d);
    }
  }
  for (let br = 0; br < n; br += boxRows) {
    for (let bc = 0; bc < n; bc += boxCols) {
      const box = new Set();
      for (let r = br; r < br + boxRows; r++) {
        for (let c = bc; c < bc + boxCols; c++) {
          const d = board[r * n + c];
          if (d && box.has(d)) return false;
          if (d) box.add(d);
        }
      }
    }
  }
  return true;
}

function validStructure(level) {
  const n = level.size;
  if (!Number.isInteger(n) || n < 1) fail('size must be a positive integer');
  if (!Array.isArray(level.box) || level.box.length !== 2) fail('box must be [rows, cols]');
  const [boxRows, boxCols] = level.box;
  if (!Number.isInteger(boxRows) || !Number.isInteger(boxCols) || boxRows < 1 || boxCols < 1 || n % boxRows || n % boxCols || boxRows * boxCols !== n)
    fail('box dimensions must divide size and have area N');
  if (!Number.isInteger(level.shift) || level.shift < 1 || level.shift >= n) fail('shift must be between 1 and N-1');
  for (const groupName of ['givens', 'solution']) {
    const group = level[groupName];
    if (!group || typeof group !== 'object') fail(`${groupName} is missing`);
    for (const boardName of BOARD_NAMES) {
      const s = group[boardName];
      if (typeof s !== 'string' || s.length !== n * n) fail(`${groupName}.${boardName} must be a string of length ${n * n}`);
      if (groupName === 'givens' && new RegExp(`[^.1-${n}]`).test(s)) fail(`invalid character in givens.${boardName}`);
      if (groupName === 'solution' && new RegExp(`[^1-${n}]`).test(s)) fail(`invalid digit in solution.${boardName}`);
    }
  }
  return { n, boxRows, boxCols };
}

function linkedCells(n, shift, board, index) {
  const r = Math.floor(index / n), c = index % n;
  if (board === 'present') {
    const fi = r * n + ((c + shift) % n);
    return [['present', index], ['future', fi], ['past', r * n + (n - 1 - ((c + shift) % n))]];
  }
  if (board === 'future') {
    return [['future', index], ['past', r * n + (n - 1 - c)], ['present', r * n + ((c - shift + n) % n)]];
  }
  const fc = n - 1 - c;
  return [['past', index], ['future', r * n + fc], ['present', r * n + ((fc - shift + n) % n)]];
}

function validateGivens(level, meta) {
  const { n, boxRows, boxCols } = meta;
  const g = Object.fromEntries(BOARD_NAMES.map(b => [b, [...level.givens[b]].map(ch => ch === '.' ? 0 : Number(ch))]));
  for (const b of BOARD_NAMES) if (!checkSudoku(g[b], n, boxRows, boxCols)) fail(`givens repeat on ${b}`);
  for (let i = 0; i < n * n; i++) {
    for (const board of ['present', 'future']) {
      const cells = linkedCells(n, level.shift, board, i);
      const vals = cells.map(([b, j]) => g[b][j]).filter(Boolean);
      if (vals.some(v => v !== vals[0])) fail(`conflicting linked givens at ${board} cell ${i + 1}`);
    }
  }
  return g;
}

function validateSolution(level, meta, givens) {
  const { n, boxRows, boxCols } = meta;
  const s = Object.fromEntries(BOARD_NAMES.map(b => [b, [...level.solution[b]].map(Number)]));
  for (const b of BOARD_NAMES) {
    if (!checkSudoku(s[b], n, boxRows, boxCols)) fail(`solution is not a valid Sudoku on ${b}`);
    for (let i = 0; i < n * n; i++) if (givens[b][i] && givens[b][i] !== s[b][i]) fail(`solution disagrees with given on ${b} cell ${i + 1}`);
  }
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), c = i % n;
    if (s.future[r * n + ((c + level.shift) % n)] !== s.present[i]) fail(`solution breaks E1 at Present cell ${i + 1}`);
    if (s.past[r * n + (n - 1 - c)] !== s.future[i]) fail(`solution breaks E2 at Future cell ${i + 1}`);
  }
  return s;
}

// Search only Present cells. Each assignment deterministically fills its E1/E2
// partners, so givens and Sudoku constraints on all three boards prune search.
function countSolutions(level, meta, givens) {
  const { n, boxRows, boxCols } = meta;
  const boards = Object.fromEntries(BOARD_NAMES.map(b => [b, Array(n * n).fill(0)]));
  const allowed = Array(n * n).fill(null);
  for (let i = 0; i < n * n; i++) {
    const linked = linkedCells(n, level.shift, 'present', i);
    const req = linked.map(([b, j]) => givens[b][j]).filter(Boolean);
    if (req.some(d => d !== req[0])) return [];
    allowed[i] = req.length ? [req[0]] : Array.from({ length: n }, (_, k) => k + 1);
  }
  const answers = [];
  function assign(i, d) {
    const changed = [];
    for (const [b, j] of linkedCells(n, level.shift, 'present', i)) {
      if (boards[b][j] && boards[b][j] !== d) { for (const [bb, jj] of changed) boards[bb][jj] = 0; return null; }
      if (!boards[b][j]) { boards[b][j] = d; changed.push([b, j]); }
    }
    for (const b of BOARD_NAMES) if (!checkSudoku(boards[b], n, boxRows, boxCols)) {
      for (const [bb, jj] of changed) boards[bb][jj] = 0;
      return null;
    }
    return changed;
  }
  function search(i) {
    if (answers.length >= 2) return;
    if (i === n * n) { answers.push(Object.fromEntries(BOARD_NAMES.map(b => [b, boards[b].join('')]))); return; }
    for (const d of allowed[i]) {
      const changed = assign(i, d);
      if (changed) { search(i + 1); for (const [b, j] of changed) boards[b][j] = 0; }
      if (answers.length >= 2) return;
    }
  }
  search(0);
  return answers;
}

function cloneState(state) { return Object.fromEntries(BOARD_NAMES.map(b => [b, state[b].slice()])); }

// The independently implemented atomic move operation used by replay and QA.
function tryMove(state, board, index, digit, level, meta) {
  const { n, boxRows, boxCols } = meta;
  if (!BOARD_INDEX.hasOwnProperty(board) || state[board][index] !== 0) return null;
  const next = cloneState(state);
  const targets = [[board, index]];
  const r = Math.floor(index / n), c = index % n;
  if (board === 'present') {
    const fc = (c + level.shift) % n;
    targets.push(['future', r * n + fc], ['past', r * n + (n - 1 - fc)]);
  } else if (board === 'future') targets.push(['past', r * n + (n - 1 - c)]);
  for (const [b, j] of targets) if (next[b][j] && next[b][j] !== digit) return null;
  const changed = [];
  for (const [b, j] of targets) if (!next[b][j]) { next[b][j] = digit; changed.push([b, j]); }
  // Section 2 also requires every filled E1/E2-linked pair to agree. This
  // matters for direct Future and Past moves, which do not echo in that direction.
  const linkedValues = linkedCells(n, level.shift, board, index)
    .map(([b, j]) => next[b][j]).filter(Boolean);
  if (linkedValues.some(value => value !== linkedValues[0])) return null;
  for (const b of new Set(targets.map(t => t[0]))) {
    // A move can fill an already-present echo cell; only the touched boards
    // need checking, and same-digit echoes do not create duplicate entries.
    if (!checkSudoku(next[b], n, boxRows, boxCols)) return null;
  }
  return { state: next, changed };
}

function legalActions(state, level, meta) {
  const actions = [];
  for (const b of BOARD_NAMES) for (let i = 0; i < state[b].length; i++) if (!state[b][i]) {
    for (let d = 1; d <= meta.n; d++) {
      const result = tryMove(state, b, i, d, level, meta);
      if (result) actions.push({ board: b, index: i, digit: d, ...result });
    }
  }
  return actions;
}

function countMinMoves(givens, level, n) {
  let count = 0;
  for (let i = 0; i < n * n; i++) {
    const group = linkedCells(n, level.shift, 'present', i);
    if (group.some(([b, j]) => !givens[b][j])) count++;
  }
  return count;
}

function countDeadEndDepth(start, level, meta, solution) {
  const seen = new Set();
  let visited = 0;
  let searchCapped = false;
  function dfs(state, depth) {
    // Bound the diagnostic search as well as its depth, since sparse 6x6
    // levels can have many equivalent solution-respecting move orders.
    if (++visited > 2000) { searchCapped = true; return null; }
    const key = BOARD_NAMES.map(b => state[b].join('')).join('|');
    if (seen.has(key)) return null;
    seen.add(key);
    if (depth >= MAX_DEPTH) return null;
    const empty = BOARD_NAMES.some(b => state[b].some(value => !value));
    if (!empty) return null;
    const correct = legalActions(state, level, meta)
      .filter(a => a.digit === solution[a.board][a.index]);
    if (!correct.length) return depth;
    const nextStates = new Set();
    for (const a of correct) {
      const nextKey = BOARD_NAMES.map(b => a.state[b].join('')).join('|');
      if (nextStates.has(nextKey)) continue;
      nextStates.add(nextKey);
      const found = dfs(a.state, depth + 1);
      // DFS records the first reachable solution-respecting dead end, capped
      // at 12 additional moves. We only need a representative depth per trap.
      if (found !== null) return found;
    }
    return null;
  }
  let depth = dfs(start, 0);
  if (depth === null && searchCapped) {
    // If the DFS state budget is exhausted, follow one legal solution path to
    // still report a concrete reachable dead end when one appears within 12.
    let state = start;
    for (let step = 0; step < MAX_DEPTH; step++) {
      const correct = legalActions(state, level, meta)
        .filter(a => a.digit === solution[a.board][a.index]);
      if (!correct.length) { depth = step; break; }
      state = correct[0].state;
      if (!BOARD_NAMES.some(b => state[b].some(value => !value))) break;
    }
  }
  return { depth, searchCapped: depth === null && searchCapped };
}

function forcedSolve(givens, level, meta, solution) {
  let state = cloneState(givens);
  while (true) {
    let forced = null;
    // A cell is forced when exactly one digit can be legally placed there.
    for (const b of BOARD_NAMES) {
      if (forced) break;
      for (let i = 0; i < state[b].length && !forced; i++) if (!state[b][i]) {
        const legal = [];
        for (let d = 1; d <= meta.n; d++) {
          const result = tryMove(state, b, i, d, level, meta);
          if (result) legal.push({ board: b, index: i, digit: d, ...result });
        }
        if (legal.length === 1) forced = legal[0];
      }
    }
    if (!forced) break;
    state = forced.state;
  }
  const remaining = BOARD_NAMES.reduce((sum, b) => sum + state[b].filter(x => !x).length, 0);
  return { solved: remaining === 0, remaining };
}

function replaySolution(givens, level, meta, solution) {
  const state = cloneState(givens);
  // Move order: empty Present cells, then Future-only, then Past-only.
  const orders = ['present', 'future', 'past'];
  for (const b of orders) {
    for (let i = 0; i < meta.n * meta.n; i++) {
      if (!state[b][i]) {
        const result = tryMove(state, b, i, solution[b][i], level, meta);
        if (!result) return false;
        for (const board of BOARD_NAMES) state[board] = result.state[board];
      }
    }
  }
  return BOARD_NAMES.every(b => state[b].every((d, i) => d === solution[b][i])) &&
    BOARD_NAMES.every(b => checkSudoku(state[b], meta.n, meta.boxRows, meta.boxCols));
}

function runLevel(level) {
  const result = { id: level && level.id, name: level && level.name, status: 'FAIL', warnings: [] };
  try {
    const meta = validStructure(level);
    const givens = validateGivens(level, meta);
    const solution = validateSolution(level, meta, givens);
    const found = countSolutions(level, meta, givens);
    const solutionCount = found.length >= 2 ? 'MULTIPLE' : found.length === 1 ? 'UNIQUE' : 'NONE';
    if (solutionCount === 'NONE') fail('solution count is NONE');
    if (solutionCount === 'UNIQUE' && BOARD_NAMES.some(b => found[0][b] !== solution[b].join(''))) fail('unique search result differs from stored solution');
    const n = meta.n;
    const minMoves = countMinMoves(givens, level, n);
    const legal = legalActions(givens, level, meta);
    const traps = solutionCount === 'UNIQUE' ? legal.filter(a => a.digit !== solution[a.board][a.index]) : [];
    const trapPct = legal.length ? 100 * traps.length / legal.length : 0;
    const trapDepths = traps.slice(0, 5).map(a => countDeadEndDepth(a.state, level, meta, solution));
    const forced = forcedSolve(givens, level, meta, solution);
    const replay = replaySolution(givens, level, meta, solution);
    if (!replay) fail('solution replay was rejected or did not reach a win');
    if (trapPct > 60 && trapDepths.filter(d => d.depth !== null && d.depth >= 4).length >= Math.ceil(trapDepths.length / 2)) result.warnings.push('HARSH');
    if (!forced.solved) result.warnings.push('not-forced-solvable');
    result.status = 'PASS';
    Object.assign(result, {
      n, shift: level.shift,
      givens: Object.fromEntries(BOARD_NAMES.map(b => [b, givens[b].filter(Boolean).length])),
      solutionCount, minMoves, legalFirst: legal.length, traps: traps.length,
      trapPct, trapDepths, forced, replay
    });
  } catch (error) {
    result.error = error.message || String(error);
  }
  return result;
}

function main() {
  const input = process.argv[2] || path.join(process.cwd(), 'levels.json');
  let data;
  try { data = JSON.parse(fs.readFileSync(input, 'utf8')); }
  catch (error) { console.error(`Cannot read ${input}: ${error.message}`); process.exitCode = 1; return; }
  if (!data || !Array.isArray(data.levels)) { console.error('Input must contain a levels array.'); process.exitCode = 1; return; }
  const results = data.levels.map(runLevel);
  for (const r of results) {
    if (r.status === 'FAIL') {
      console.log(`Level ${r.id ?? '?'} ${r.name ?? '(unnamed)'} | FAIL | ${r.error}`);
      continue;
    }
    const counts = `P:${r.givens.past} Pr:${r.givens.present} F:${r.givens.future}`;
    const warn = r.warnings.length ? ` | WARN: ${r.warnings.join(', ')}` : '';
    const depths = r.trapDepths.length ? ` [${r.trapDepths.map(d => d.depth !== null ? d.depth : d.searchCapped ? 'search-cap' : `>${MAX_DEPTH}`).join(', ')}]` : '';
    console.log(`Level ${r.id} ${r.name} | N=${r.n} shift=${r.shift} givens ${counts} | ${r.solutionCount} | min moves=${r.minMoves} | legal first=${r.legalFirst}, traps=${r.traps} (${r.trapPct.toFixed(1)}%)${depths} | forced-solvable=${r.forced.solved ? 'yes' : `no (${r.forced.remaining} cells remain)`} | ${r.status}${warn}`);
  }
  console.log('\nSummary table');
  console.log('ID | Name | N | Shift | Given P/Pr/F | Count | Min | Legal | Traps | Trap % | Forced | Status / Warnings');
  for (const r of results) {
    if (r.status === 'FAIL') console.log(`${r.id ?? '?'} | ${r.name ?? '?'} | — | — | — | — | — | — | — | — | — | FAIL: ${r.error}`);
    else console.log(`${r.id} | ${r.name} | ${r.n} | ${r.shift} | ${r.givens.past}/${r.givens.present}/${r.givens.future} | ${r.solutionCount} | ${r.minMoves} | ${r.legalFirst} | ${r.traps} | ${r.trapPct.toFixed(1)}% | ${r.forced.solved ? 'yes' : `no (${r.forced.remaining})`} | ${r.status}${r.warnings.length ? ` / ${r.warnings.join(', ')}` : ''}`);
  }
  const pass = results.filter(r => r.status === 'PASS').length;
  const failCount = results.length - pass;
  const warnCount = results.filter(r => r.warnings.length).length;
  console.log(`\n${results.length} levels: ${pass} PASS, ${failCount} FAIL, ${warnCount} WARN`);
  if (failCount) process.exitCode = 1;
}

main();
