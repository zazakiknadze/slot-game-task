import './style.css';
import { evaluatePaylines, PAYLINES_10 } from './game/board/paylines.js';
import { loadSymbolTextures } from './game/slot/symbols.js';
import { createSpinSound } from './game/audio/spinSound.js';
import { primeWinAudio, playWinChime, stopWinChime } from './game/audio/winSound.js';
import { BETS, MIN_BET, REELS, ROWS, REEL_WINDOW } from './game/board/boardConstants.js';
import { formatEur } from './game/ui/formatEur.js';
import { barabanToGrid } from './game/board/baraban.js';
import { mountGameDom } from './game/ui/dom.js';
import { loadSpineData } from './game/loaders/spineLoader.js';
import { waitForTexture } from './game/loaders/textureWait.js';
import { createMultiplierWheel } from './game/slot/multiplierWheel.js';
import { createReelSystem } from './game/slot/reelSystem.js';
import { createWinFx } from './game/slot/winFx.js';

async function main() {
  const appEl = document.querySelector('#app');
  if (!appEl) throw new Error('Missing #app root element');

  const ui = mountGameDom(appEl);

  const PIXI = window.PIXI;
  if (!PIXI) throw new Error('PIXI global not found. Check pixi.js script tag.');

  const getBoard = window.GetBoard;
  if (typeof getBoard !== 'function') {
    throw new Error('GetBoard global not found. Check fake.api.js script tag.');
  }

  let selectedBet = BETS[0];
  let balanceAmount = 0;
  let spinning = false;
  const spinSound = createSpinSound();

  function syncSelectedBetToBalance() {
    const affordable = BETS.filter((b) => b <= balanceAmount);
    if (!affordable.length) {
      selectedBet = BETS[0];
      return;
    }
    if (selectedBet > balanceAmount) {
      selectedBet = affordable[affordable.length - 1];
    }
  }

  function renderBets() {
    ui.bets.innerHTML = BETS.map((b) => {
      const disabled = b > balanceAmount;
      const active = !disabled && b === selectedBet;
      return `<button class="bet ${active ? 'bet--active' : ''}" type="button" data-bet-btn="${b}" ${
        disabled ? 'disabled' : ''
      }>${b}</button>`;
    }).join('');
    ui.bet.textContent = `${selectedBet} EUR`;
  }

  function updatePlayControls() {
    if (spinning) return;
    ui.spin.disabled = balanceAmount < MIN_BET;
  }

  ui.bets.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-bet-btn]');
    if (!btn || spinning || btn.disabled) return;
    selectedBet = Number(btn.getAttribute('data-bet-btn'));
    renderBets();
  });

  const app = new PIXI.Application({
    view: ui.gameCanvas,
    width: 1100,
    height: 650,
    backgroundAlpha: 0,
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
  });

  const reelsLayer = new PIXI.Container();
  app.stage.addChild(reelsLayer);

  const winFxLayer = new PIXI.Container();
  app.stage.addChild(winFxLayer);

  reelsLayer.x = REEL_WINDOW.x;
  reelsLayer.y = REEL_WINDOW.y;

  const reelMask = new PIXI.Graphics();
  reelMask.beginFill(0xffffff, 1);
  reelMask.drawRect(REEL_WINDOW.x, REEL_WINDOW.y, REEL_WINDOW.w, REEL_WINDOW.h);
  reelMask.endFill();
  app.stage.addChild(reelMask);
  reelsLayer.mask = reelMask;

  const symbolTextures = await loadSymbolTextures(PIXI);

  let winsSpineData = null;
  try {
    winsSpineData = await loadSpineData(PIXI, 'winsSpine', './Content/Images/Spines/Win/wins.json');
  } catch (_) {
    winsSpineData = null;
  }

  const { clearWinFx, playWinFx } = createWinFx({
    PIXI,
    app,
    winFxLayer,
    winsSpineData,
    stopWinChime,
  });

  await Promise.all([
    waitForTexture(symbolTextures.x1),
    waitForTexture(symbolTextures.x2),
    waitForTexture(symbolTextures.x3),
    waitForTexture(symbolTextures.x4),
    waitForTexture(symbolTextures.x5),
  ]);

  const { showMultiplierValue, startMultiplierSpinnerPixi } = createMultiplierWheel(
    PIXI,
    ui.multiplierCanvas,
    symbolTextures
  );

  const reelSystem = createReelSystem(PIXI, reelsLayer, symbolTextures, app);

  const initial = await getBoard();
  balanceAmount = Number(initial.Balance);
  syncSelectedBetToBalance();
  ui.balance.textContent = formatEur(initial.Balance);
  ui.win.textContent = formatEur(initial.UserWin);
  showMultiplierValue(initial.Multiplier);
  ui.multiplierWin.textContent = '';
  renderBets();
  updatePlayControls();
  reelSystem.renderGrid(barabanToGrid(initial.Baraban));

  ui.spin.addEventListener('click', async () => {
    if (spinning) return;
    if (selectedBet > balanceAmount || balanceAmount < MIN_BET) return;
    spinning = true;
    ui.spin.disabled = true;
    primeWinAudio();
    let reelSpin = null;
    try {
      clearWinFx();

      void spinSound.start();

      reelSpin = reelSystem.startReelSpinVisual();
      app.ticker.add(reelSpin.tick);

      ui.multiplierWin.textContent = '';
      const stopMultiplier = startMultiplierSpinnerPixi();

      const result = await getBoard(selectedBet);

      stopMultiplier(result.Multiplier);
      ui.multiplierWin.textContent = '';

      const finalGrid = barabanToGrid(result.Baraban);
      for (let reel = 0; reel < REELS; reel++) {
        await new Promise((r) => setTimeout(r, 220));
        reelSpin.stopReel(reel, [finalGrid[0][reel], finalGrid[1][reel], finalGrid[2][reel]]);
      }

      balanceAmount = Number(result.Balance);
      syncSelectedBetToBalance();
      ui.balance.textContent = formatEur(result.Balance);
      ui.win.textContent = formatEur(result.UserWin);
      renderBets();

      if (result.UserWin > 0) {
        const wins = evaluatePaylines(finalGrid, PAYLINES_10, { wild: 0, minMatch: 3 });
        if (wins.length) reelSystem.animateWins(finalGrid, wins);
        playWinFx();
        void playWinChime();
      }
    } finally {
      spinSound.stop();
      if (reelSpin?.tick) app.ticker.remove(reelSpin.tick);
      spinning = false;
      updatePlayControls();
    }
  });
}

main();
