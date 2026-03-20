export function createWinFx({ PIXI, app, winFxLayer, winsSpineData, stopWinChime }) {
  function clearWinFx() {
    stopWinChime();
    winFxLayer.removeChildren();
  }

  function playWinFx() {
    if (!winsSpineData || !PIXI?.spine?.Spine) return;

    clearWinFx();

    const spine = new PIXI.spine.Spine(winsSpineData);
    spine.x = app.screen.width / 4;
    spine.y = app.screen.height / 3;

    const b = spine.getLocalBounds();
    const targetW = app.screen.width * 0.4;
    const s = targetW / (b.width || 1);
    spine.scale.set(s);

    const anims = spine.spineData?.animations?.map((a) => a.name) ?? [];
    const anim = anims[0];
    if (anim) spine.state.setAnimation(0, anim, false);

    winFxLayer.addChild(spine);

    let cleared = false;
    const clear = () => {
      if (cleared) return;
      cleared = true;
      clearWinFx();
      spine.destroy({ children: true });
    };

    spine.state.addListener({ complete: clear });
    window.setTimeout(clear, 1800);
  }

  return { clearWinFx, playWinFx };
}
