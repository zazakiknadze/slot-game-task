import { REELS, ROWS } from './boardConstants.js';

export function barabanToGrid(baraban) {
  const grid = Array.from({ length: ROWS }, () => Array(REELS).fill(0));
  for (let reel = 0; reel < REELS; reel++) {
    for (let row = 0; row < ROWS; row++) {
      grid[row][reel] = baraban[reel * ROWS + row];
    }
  }
  return grid;
}
