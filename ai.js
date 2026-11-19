// The computer player. It lists every distinct position a roll can reach,
// scores each with a hand-written evaluation (pips, points made, primes,
// anchors, and how likely and how costly it is to be hit), and plays the best.
// Weaker levels add random noise to those scores, which is how backgammon
// programs traditionally simulate weaker players; the strongest also looks one
// roll ahead at the opponent's best reply.
import { movesForDie, applyMove, pipCount, posOf, indexOf, countAt } from './game.js';

export const LEVELS = [
  { id: 'beginner', name: 'Beginner', blurb: 'Still learning. Makes plenty of mistakes.', noise: 14 },
  { id: 'casual', name: 'Casual', blurb: 'Knows the basics but misses a lot.', noise: 7 },
  { id: 'intermediate', name: 'Intermediate', blurb: 'Solid play with the odd blunder.', noise: 3 },
  { id: 'advanced', name: 'Advanced', blurb: 'Plays carefully and rarely gives much away.', noise: 0 },
  { id: 'expert', name: 'Expert', blurb: 'Thinks a roll ahead. Bring your best game.', noise: 0, lookahead: true },
];

const key = (b) => `${b.pts.join(',')}|${b.bar}|${b.off}`;

/**
 * Every distinct position the roll can lead to, each with the moves that get
 * there. Applies the rules: use as many dice as possible, and if only one of
 * two different dice can be used, it must be the larger.
 */
export function turns(board, side, dice) {
  // Larger die first, so when two orders reach the same position the kept one
  // uses the larger die (which the rules require when only one die can be played).
  const left = dice[0] === dice[1] ? [dice[0], dice[0], dice[0], dice[0]] : dice.slice().sort((x, y) => y - x);
  const leaves = new Map();
  const seen = new Set();
  let most = 0;
  const walk = (b, rest, path) => {
    const k = `${key(b)}#${rest.join('')}`;
    if (seen.has(k)) return;
    seen.add(k);
    let moved = false;
    const tried = new Set();
    for (let i = 0; i < rest.length; i++) {
      if (tried.has(rest[i])) continue;
      tried.add(rest[i]);
      const others = rest.filter((_, j) => j !== i);
      for (const move of movesForDie(b, side, rest[i])) {
        moved = true;
        walk(applyMove(b, side, move), others, [...path, move]);
      }
    }
    if (moved) return;
    most = Math.max(most, path.length);
    const k2 = key(b);
    const known = leaves.get(k2);
    if (!known || path.length > known.moves.length) leaves.set(k2, { board: b, moves: path });
  };
  walk(board, left, []);
  let out = [...leaves.values()].filter((t) => t.moves.length === most);
  if (most === 1 && left.length === 2 && left[0] !== left[1]) {
    const big = Math.max(...left);
    const withBig = out.filter((t) => t.moves[0].die === big);
    if (withBig.length) out = withBig;
  }
  return out.length ? out : [{ board, moves: [] }];
}

// ── Evaluation ───────────────────────────────────────────────────────────────
// Scores are in rough "pips": positive is good for `side`.

// How much a made point is worth, by its position counted from that side's home.
const POINT_VALUE = [0, 1, 1.5, 2.5, 4, 5.5, 5, 4.5, 3, 2, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 2.5, 4, 4, 2, 1.5, 1.5];
const PRIME_BONUS = [0, 0, 0, 1.5, 4, 8, 14];
const ROLLS = [];
for (let a = 1; a <= 6; a++) for (let b = a; b <= 6; b++) ROLLS.push([a, b, a === b ? 1 / 36 : 2 / 36]);

/** Checker counts for a side, indexed by its own position: 1–24, and 25 for the bar. */
function layout(board, side) {
  const at = new Array(26).fill(0);
  for (let i = 0; i < 24; i++) at[posOf(side, i)] = countAt(board, side, i);
  at[25] = board.bar[side];
  return at;
}

function hasContact(mine, theirs) {
  let myBack = 0;
  let theirBack = 0;
  for (let p = 25; p >= 1; p--) if (mine[p]) { myBack = p; break; }
  for (let p = 25; p >= 1; p--) if (theirs[p]) { theirBack = p; break; }
  return myBack + theirBack > 25;
}

/** One side's structure: points made, primes, anchors, stacking. */
function structure(mine, theirs) {
  // The furthest-back opposing checker, in our coordinates (they move upwards).
  let theirBackInOurs = 26;
  for (let p = 25; p >= 1; p--) if (theirs[p]) { theirBackInOurs = 25 - p; break; }
  let score = 0;
  let run = 0;
  let bestRun = 0;
  for (let p = 1; p <= 24; p++) {
    const n = mine[p];
    if (n >= 2) {
      const blocking = p > theirBackInOurs;
      score += POINT_VALUE[p] * (p <= 18 && !blocking ? 0.3 : 1);
      if (blocking) bestRun = Math.max(bestRun, ++run);
      else run = 0;
    } else {
      run = 0;
    }
    if (n > 3) score -= 0.4 * (n - 3);
    if (n === 1) score -= 0.3;
  }
  score += PRIME_BONUS[Math.min(6, bestRun)];

  // Checkers on the bar against a strong home board.
  let homePoints = 0;
  for (let p = 1; p <= 6; p++) if (mine[p] >= 2) homePoints++;
  score += theirs[25] * 0.5 * homePoints ** 1.5;

  // Our own checkers stuck deep behind their home board.
  let theirWall = 0;
  for (let p = 1; p <= 7; p++) if (theirs[p] >= 2) theirWall++;
  let deep = mine[25];
  for (let p = 19; p <= 24; p++) deep += mine[p];
  score -= deep * theirWall * 0.35;
  return score;
}

/** Expected pips the victim loses to hits on the attacker's next roll. */
function hitRisk(victim, attacker) {
  const blots = [];
  for (let p = 1; p <= 24; p++) if (victim[p] === 1) blots.push(p);
  if (!blots.length) return 0;
  const sources = [];
  if (attacker[25]) sources.push(25);
  else for (let p = 1; p <= 24; p++) if (attacker[p]) sources.push(p);
  // A point the victim holds, in attacker coordinates.
  const blocked = (q) => q >= 1 && q <= 24 && victim[25 - q] >= 2;

  let risk = 0;
  for (const [a, b, weight] of ROLLS) {
    let worst = 0;
    for (const p of blots) {
      const q = 25 - p;                     // the blot in attacker coordinates
      const loss = 25 - p + 4;              // pips sent back, plus the tempo
      if (loss <= worst) continue;
      const hit = sources.some((r) => {
        const d = r - q;
        if (d <= 0) return false;
        if (d === a || d === b) return true;
        if (a === b) {
          for (let k = 2; k <= 4; k++) {
            if (d === a * k) {
              for (let j = 1; j < k; j++) if (blocked(r - a * j)) return false;
              return true;
            }
          }
          return false;
        }
        return d === a + b && (!blocked(r - a) || !blocked(r - b));
      });
      if (hit) worst = loss;
    }
    risk += weight * worst;
  }
  return risk;
}

/** How good the position is for `side`, with `onRoll` about to roll. */
export function evaluate(board, side, onRoll) {
  const other = 1 - side;
  if (board.off[side] === 15) return 1000;
  if (board.off[other] === 15) return -1000;
  const pipsMine = pipCount(board, side);
  const pipsTheirs = pipCount(board, other);
  const mine = layout(board, side);
  const theirs = layout(board, other);

  if (!hasContact(mine, theirs)) {
    // A pure race: pips, plus a little for every checker still to bear off.
    const left = (s) => 15 - board.off[s];
    return pipsTheirs + 2 * left(other) - (pipsMine + 2 * left(side)) + (onRoll === side ? 4 : -4);
  }

  let score = pipsTheirs - pipsMine;
  score += structure(mine, theirs) - structure(theirs, mine);
  if (onRoll === other) score -= hitRisk(mine, theirs);
  else score += 0.8 * hitRisk(theirs, mine);
  return score;
}

// ── Choosing a move ──────────────────────────────────────────────────────────
function gaussian() {
  const u = 1 - Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

/** The opponent's best reply to every roll, averaged: how good `board` is for `side` a roll later. */
function lookahead(board, side) {
  const other = 1 - side;
  let total = 0;
  for (const [a, b, weight] of ROLLS) {
    let best = -Infinity;
    let worstForUs = 0;
    for (const t of turns(board, other, [a, b])) {
      const theirs = evaluate(t.board, other, side);
      if (theirs > best) {
        best = theirs;
        worstForUs = evaluate(t.board, side, side);
      }
    }
    total += weight * worstForUs;
  }
  return total;
}

/** The moves the computer plays at this level, in order. */
export function chooseMoves(board, side, dice, levelId) {
  const level = LEVELS.find((l) => l.id === levelId) ?? LEVELS[3];
  const options = turns(board, side, dice);
  if (options.length === 1) return options[0].moves;
  const other = 1 - side;
  for (const t of options) t.score = evaluate(t.board, side, other) + level.noise * gaussian();
  options.sort((x, y) => y.score - x.score);
  if (level.lookahead) {
    const shortlist = options.slice(0, 6);
    for (const t of shortlist) t.score = lookahead(t.board, side);
    shortlist.sort((x, y) => y.score - x.score);
    return shortlist[0].moves;
  }
  return options[0].moves;
}
