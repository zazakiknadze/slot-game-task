export function createMultiplierWheel(PIXI, multiplierCanvasEl, symbolTextures) {
  const multiplierApp = new PIXI.Application({
    view: multiplierCanvasEl,
    width: 750,
    height: 750,
    backgroundAlpha: 0,
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
  });

  multiplierApp.ticker.start();

  const multiplierLayer = new PIXI.Container();
  multiplierApp.stage.addChild(multiplierLayer);

  const MULT_VALUES = [1, 2, 3, 4, 5];

  const wheelRoot = new PIXI.Container();
  multiplierLayer.addChild(wheelRoot);

  const wheelBg = new PIXI.Graphics();
  wheelRoot.addChild(wheelBg);

  const multipliersMask = new PIXI.Graphics();
  multipliersMask.alpha = 0.001;
  multiplierLayer.addChild(multipliersMask);

  const multipliersLayer = new PIXI.Container();
  multiplierLayer.addChild(multipliersLayer);
  multipliersLayer.mask = multipliersMask;

  const multLeft = new PIXI.Sprite(symbolTextures.x1);
  const multCenter = new PIXI.Sprite(symbolTextures.x2);
  const multRight = new PIXI.Sprite(symbolTextures.x3);
  for (const s of [multLeft, multCenter, multRight]) {
    s.anchor.set(0.5);
    multipliersLayer.addChild(s);
  }

  const TWO_PI = Math.PI * 2;
  const STEP_5 = TWO_PI / 5;
  const MULT_ROT_DIR = -1;

  function setMultSprite(sprite, v) {
    sprite.texture = symbolTextures[`x${v}`] ?? symbolTextures.x1;
  }

  function layoutMultiplierWindows() {
    const cx = multiplierApp.screen.width / 2;
    const cy = multiplierApp.screen.height / 2;
    const r = Math.min(multiplierApp.screen.width, multiplierApp.screen.height) * 0.48;

    multipliersMask.clear();
    multipliersMask.beginFill(0xffffff, 1);
    const winW = multiplierApp.screen.width * 0.2;
    const winH = multiplierApp.screen.height * 0.8;
    const gap = multiplierApp.screen.width * 0.01;
    const topY = cy - r * 0.75;
    const rr = 18;
    multipliersMask.drawRoundedRect(cx - winW / 2 - (winW + gap), topY - winH / 2, winW, winH, rr);
    multipliersMask.drawRoundedRect(cx - winW / 2, topY - winH / 2, winW, winH, rr);
    multipliersMask.drawRoundedRect(cx - winW / 2 + (winW + gap), topY - winH / 2, winW, winH, rr);
    multipliersMask.endFill();

    const y = topY;
    const xL = cx - (winW + gap);
    const xC = cx;
    const xR = cx + (winW + gap);
    multLeft.position.set(xL, y);
    multCenter.position.set(xC, y);
    multRight.position.set(xR, y);

    const targetW = winW * 0.62;
    const targetH = winH * 0.62;
    for (const s of [multLeft, multCenter, multRight]) {
      const w = s.texture.width || 1;
      const h = s.texture.height || 1;
      s.scale.set(Math.min(targetW / w, targetH / h));
      s.rotation = 0;
      s.alpha = 1;
    }

    multLeft.scale.set(multLeft.scale.x * 0.70, multLeft.scale.y * 0.70);
    multRight.scale.set(multRight.scale.x * 0.70, multRight.scale.y * 0.70);
    multLeft.rotation = (-20 * Math.PI) / 180;
    multRight.rotation = (20 * Math.PI) / 180;
    multLeft.y += winH * 0.05;
    multRight.y += winH * 0.05;
    multLeft.alpha = 0.55;
    multRight.alpha = 0.55;
  }

  function layoutWheelDecor() {
    const cx = multiplierApp.screen.width / 2;
    const cy = multiplierApp.screen.height / 2;
    const r = Math.min(multiplierApp.screen.width, multiplierApp.screen.height) * 0.48;

    wheelRoot.pivot.set(0, 0);
    wheelRoot.position.set(cx, cy);

    wheelBg.clear();
    wheelBg.drawCircle(0, 0, r);
    wheelBg.endFill();
  }

  function getCenterIndexFromRotation(rot) {
    const a = ((-(rot * MULT_ROT_DIR) % TWO_PI) + TWO_PI) % TWO_PI;
    return Math.round(a / STEP_5) % 5;
  }

  function sync3MultipliersToRotation() {
    const idx = getCenterIndexFromRotation(wheelRoot.rotation);
    const c = MULT_VALUES[idx];
    const l = MULT_VALUES[(idx + 4) % 5];
    const r = MULT_VALUES[(idx + 1) % 5];
    setMultSprite(multCenter, c);
    setMultSprite(multLeft, l);
    setMultSprite(multRight, r);
  }

  function showMultiplierValue(v) {
    const value = Math.max(1, Math.min(5, Number(v) || 1));
    const idx = MULT_VALUES.indexOf(value);
    wheelRoot.rotation = (-idx * STEP_5) / MULT_ROT_DIR;
    sync3MultipliersToRotation();
  }

  function resizeMultiplierRendererToCanvas() {
    const w = Math.max(1, Math.round(multiplierCanvasEl.clientWidth || 240));
    const h = Math.max(1, Math.round(multiplierCanvasEl.clientHeight || 140));
    multiplierApp.renderer.resize(w, h);
    layoutWheelDecor();
    layoutMultiplierWindows();
    sync3MultipliersToRotation();
  }

  layoutWheelDecor();
  layoutMultiplierWindows();
  sync3MultipliersToRotation();
  resizeMultiplierRendererToCanvas();
  window.addEventListener('resize', resizeMultiplierRendererToCanvas);

  function startMultiplierSpinnerPixi() {
    let running = true;
    let stopRequested = false;

    const speed = 0.22;
    const STOP_DURATION_MS = 1000;
    let stopStartMs = 0;
    let stopFromRot = 0;
    let stopToRot = 0;

    const tick = (delta) => {
      if (!running) return;

      if (stopRequested) {
        const t = Math.min(1, (performance.now() - stopStartMs) / STOP_DURATION_MS);
        const p = 1 - Math.pow(1 - t, 3);
        wheelRoot.rotation = stopFromRot + (stopToRot - stopFromRot) * p;
        sync3MultipliersToRotation();
        if (t >= 1) {
          multiplierApp.ticker.remove(tick);
          running = false;
        }
      } else {
        wheelRoot.rotation += MULT_ROT_DIR * speed * delta;
        sync3MultipliersToRotation();
      }
    };

    multiplierApp.ticker.add(tick);

    return (finalValue) => {
      const stopValue = Math.max(1, Math.min(5, Number(finalValue) || 1));
      stopFromRot = wheelRoot.rotation;
      const current = stopFromRot;
      const idx = MULT_VALUES.indexOf(stopValue);
      const targetBase = (-idx * STEP_5) / MULT_ROT_DIR;

      const normalized = ((current % TWO_PI) + TWO_PI) % TWO_PI;
      const targetNorm = ((targetBase % TWO_PI) + TWO_PI) % TWO_PI;

      if (MULT_ROT_DIR === 1) {
        let deltaToTarget = targetNorm - normalized;
        if (deltaToTarget < 0) deltaToTarget += TWO_PI;
        deltaToTarget += TWO_PI;
        stopToRot = current + deltaToTarget;
      } else {
        let deltaToTarget = normalized - targetNorm;
        if (deltaToTarget < 0) deltaToTarget += TWO_PI;
        deltaToTarget += TWO_PI;
        stopToRot = current - deltaToTarget;
      }
      stopStartMs = performance.now();
      stopRequested = true;
    };
  }

  return {
    showMultiplierValue,
    startMultiplierSpinnerPixi,
    resizeMultiplierRendererToCanvas,
    dispose() {
      window.removeEventListener('resize', resizeMultiplierRendererToCanvas);
    },
  };
}
