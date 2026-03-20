export const PAYLINES_10 = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 0, 0],
  [2, 2, 1, 2, 2],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 1, 1, 1, 0],
];

export function evaluatePaylines(grid, paylines = PAYLINES_10, opts = {}) {
  const wild = opts.wild ?? 0;
  const minMatch = opts.minMatch ?? 3;
  const wins = [];

  for (let lineIndex = 0; lineIndex < paylines.length; lineIndex++) {
    const line = paylines[lineIndex];

    let target = wild;
    for (let reel = 0; reel < 5; reel++) {
      const row = line[reel];
      const v = grid[row][reel];
      if (v !== wild) {
        target = v;
        break;
      }
    }

    let count = 0;
    let hasWild = false;
    const positions = [];

    for (let reel = 0; reel < 5; reel++) {
      const row = line[reel];
      const v = grid[row][reel];

      const matches =
        target === wild ? v === wild : v === target || v === wild;

      if (!matches) break;

      if (v === wild) hasWild = true;
      count++;
      positions.push({ reel, row });
    }

    if (count >= minMatch) {
      wins.push({ lineIndex, symbol: target, count, positions, hasWild });
    }
  }

  return wins;
}

export function toWinPositionSet(wins) {
  const s = new Set();
  for (const w of wins) {
    for (const p of w.positions) s.add(`${p.reel}:${p.row}`);
  }
  return s;
}

export function reelsWithWinningWild(wins, grid, wildSymbolId = 0) {
  const reels = new Set();
  for (const w of wins) {
    for (const p of w.positions) {
      if (grid[p.row][p.reel] === wildSymbolId) reels.add(p.reel);
    }
  }
  return reels;
}
