export function mountGameDom(appEl) {
  appEl.innerHTML = `
    <div class="game">
      <div class="game__board">
        <div class="canvasWrap game-div">
          <canvas id="gameCanvas"></canvas>
        </div>

        <img
          class="boardFrame"
          src="/Content/Images/Spines/Additional/charcho.png"
          alt=""
          aria-hidden="true"
          draggable="false"
        />

        <img
          class="multiplierArch"
          src="/Content/Images/Spines/Additional/Layer%20685.png"
          alt=""
          aria-hidden="true"
          draggable="false"
        />

        <div class="multiplierHud">
          <canvas class="multiplierHud__canvas" data-multiplier-canvas></canvas>
          <div class="multiplierHud__win" data-multiplier-win></div>
        </div>
      </div>

      <button class="spinBtn" type="button" data-spin>
        <span class="srOnly">Spin</span>
      </button>

      <div class="hud">
        <div class="hud__stats">
          <div class="hudStat">
            <div class="hudStat__label">BALANCE</div>
            <div class="hudStat__value" data-balance>—</div>
          </div>
          <div class="hudStat hudStat--win">
            <div class="hudStat__label">WIN</div>
            <div class="hudStat__value" data-win>—</div>
          </div>
          <div class="hudStat">
            <div class="hudStat__label">BET</div>
            <div class="hudStat__value" data-bet>—</div>
          </div>
        </div>

        <div class="hud__bets" data-bets></div>
      </div>
    </div>
  `;

  return {
    balance: appEl.querySelector('[data-balance]'),
    win: appEl.querySelector('[data-win]'),
    bet: appEl.querySelector('[data-bet]'),
    multiplierCanvas: appEl.querySelector('[data-multiplier-canvas]'),
    multiplierWin: appEl.querySelector('[data-multiplier-win]'),
    bets: appEl.querySelector('[data-bets]'),
    spin: appEl.querySelector('[data-spin]'),
    gameCanvas: appEl.querySelector('#gameCanvas'),
  };
}
