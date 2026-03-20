import { ROWS, REELS, REEL_WINDOW } from '../board/boardConstants.js';
import { createSymbolView } from './symbols.js';
import { reelsWithWinningWild, toWinPositionSet } from '../board/paylines.js';

export function createReelSystem(PIXI, reelsLayer, symbolTextures, app) {
  const CELL_W = REEL_WINDOW.w / REELS;
  const CELL_H = REEL_WINDOW.h / ROWS;

  const reels = [];
  for (let r = 0; r < REELS; r++) {
    const col = new PIXI.Container();
    col.x = r * CELL_W;
    col.y = 0;
    reelsLayer.addChild(col);

    const symbols = [];
    for (let i = 0; i < ROWS + 1; i++) {
      const sym = createSymbolView(PIXI, symbolTextures, 1, { w: CELL_W - 4, h: CELL_H - 4 });
      sym.root.x = 0;
      sym.root.y = (i - 1) * CELL_H;
      col.addChild(sym.root);
      symbols.push(sym);
    }

    reels.push({ col, symbols, spinning: false });
  }

  function getVisibleSymbol(reel, row) {
    return reels[reel].symbols[row + 1];
  }

  function randomRegularSymbolIdForSpin() {
    return Math.floor(Math.random() * 8) + 1;
  }

  function renderGrid(grid) {
    for (let reel = 0; reel < REELS; reel++) {
      for (let row = 0; row < ROWS; row++) {
        const value = grid[row][reel];
        const sym = getVisibleSymbol(reel, row);
        sym.setValue(value);
        sym.root.scale.set(1);
        sym.root.alpha = 1;
      }
      reels[reel].symbols[0].setValue(randomRegularSymbolIdForSpin());
      reels[reel].col.y = 0;
    }
  }

  function animateWins(grid, wins) {
    const winSet = toWinPositionSet(wins);
    const wildReels = reelsWithWinningWild(wins, grid, 0);

    for (let reel = 0; reel < REELS; reel++) {
      for (let row = 0; row < ROWS; row++) {
        const sym = getVisibleSymbol(reel, row).root;
        const isWinning = winSet.has(`${reel}:${row}`);
        sym.alpha = isWinning ? 1 : 0.55;
      }
    }

    for (const reel of wildReels) {
      for (let row = 0; row < ROWS; row++) {
        const sym = getVisibleSymbol(reel, row).root;
        const isWild = grid[row][reel] === 0;
        sym.alpha = isWild ? 1 : 0;
        sym.scale.set(isWild ? 1.07 : 1);
      }
    }

    const start = performance.now();
    const DURATION = 1100;
    const baseScales = [];
    for (let reel = 0; reel < REELS; reel++) {
      for (let row = 0; row < ROWS; row++) baseScales.push(getVisibleSymbol(reel, row).root.scale.x);
    }
    const tick = () => {
      const t = performance.now() - start;
      const p = Math.min(1, t / DURATION);
      const pulse = 1 + Math.sin((t / 1000) * Math.PI * 6) * 0.08 * (1 - p);
      for (let reel = 0; reel < REELS; reel++) {
        for (let row = 0; row < ROWS; row++) {
          const sym = getVisibleSymbol(reel, row).root;
          const isWinning = winSet.has(`${reel}:${row}`);
          if (isWinning) sym.scale.set(baseScales[reel * ROWS + row] * pulse);
        }
      }
      if (t >= DURATION) {
        app.ticker.remove(tick);
        for (let reel = 0; reel < REELS; reel++) {
          for (let row = 0; row < ROWS; row++) {
            const s = getVisibleSymbol(reel, row).root;
            s.alpha = 1;
            s.scale.set(1);
          }
        }
      }
    };
    app.ticker.add(tick);
  }

  function startReelSpinVisual() {
    for (const r of reels) r.spinning = true;

    const speed = CELL_H * 0.55;

    const tick = (delta) => {
      for (let reel = 0; reel < REELS; reel++) {
        const r = reels[reel];
        if (!r.spinning) continue;

        r.col.y += speed * delta;

        while (r.col.y >= CELL_H) {
          r.col.y -= CELL_H;

          const last = r.symbols.pop();
          last.root.y = -CELL_H;
          last.setValue(randomRegularSymbolIdForSpin());
          r.symbols.unshift(last);

          for (let i = 0; i < r.symbols.length; i++) {
            r.symbols[i].root.y = (i - 1) * CELL_H;
          }
        }
      }
    };

    const stopReel = (reelIndex, finalColValues) => {
      const r = reels[reelIndex];
      r.spinning = false;
      r.col.y = 0;

      for (let row = 0; row < ROWS; row++) {
        r.symbols[row + 1].setValue(finalColValues[row]);
        r.symbols[row + 1].root.y = row * CELL_H;
      }
      r.symbols[0].setValue(randomRegularSymbolIdForSpin());
      r.symbols[0].root.y = -CELL_H;
      r.symbols[3].root.y = 2 * CELL_H;
    };

    return { tick, stopReel };
  }

  return {
    CELL_W,
    CELL_H,
    reels,
    getVisibleSymbol,
    renderGrid,
    animateWins,
    startReelSpinVisual,
  };
}
