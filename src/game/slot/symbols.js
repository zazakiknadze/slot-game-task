export async function loadSymbolTextures(PIXI) {
  const paths = {
    wild: '/Content/Images/Spines/Additional/wild.png',
    cow: '/Content/Images/Spines/Additional/cow.png',
    hen: '/Content/Images/Spines/Additional/hen.png',
    sheep: '/Content/Images/Spines/Additional/sheep.png',
    scatter1: '/Content/Images/Spines/Additional/scatter1.png',
    scatter2: '/Content/Images/Spines/Additional/scatter2.png',
    A: '/Content/Images/Spines/Additional/A.png',
    K: '/Content/Images/Spines/Additional/K.png',
    Q: '/Content/Images/Spines/Additional/Q.png',
    J: '/Content/Images/Spines/Additional/J.png',
    seven: '/Content/Images/Spines/Additional/7.png',
    x1: '/Content/Images/Spines/Additional/x1.png',
    x2: '/Content/Images/Spines/Additional/x2.png',
    x3: '/Content/Images/Spines/Additional/x3.png',
    x4: '/Content/Images/Spines/Additional/x4.png',
    x5: '/Content/Images/Spines/Additional/x5.png',
  };

  const out = {};
  for (const [k, url] of Object.entries(paths)) {
    out[k] = PIXI.Texture.from(url);
  }
  return out;
}

export function symbolIdToTextureKey(symbolId) {
  if (symbolId === 0) return 'wild';
  if (symbolId === 9) return 'scatter1';
  if (symbolId === 10) return 'scatter2';

  const pool = ['cow', 'hen', 'sheep', 'A', 'K', 'Q', 'J', 'seven', 'x1', 'x2', 'x3', 'x4', 'x5'];
  return pool[(symbolId - 1) % pool.length];
}

export function createSymbolView(PIXI, textures, symbolId, size) {
  const root = new PIXI.Container();

  const sprite = new PIXI.Sprite();
  sprite.anchor.set(0.5);
  sprite.x = size.w / 2;
  sprite.y = size.h / 2;
  root.addChild(sprite);

  function fitToCell() {
    const tx = sprite.texture;
    const w = tx?.width || 1;
    const h = tx?.height || 1;
    const sx = (size.w * 0.99) / w;
    const sy = (size.h * 0.99) / h;
    const s = Math.min(sx, sy);
    sprite.scale.set(s);
  }

  function setValue(nextId) {
    const key = symbolIdToTextureKey(nextId);
    sprite.texture = textures[key] ?? PIXI.Texture.WHITE;
    fitToCell();
  }

  setValue(symbolId);

  return { root, setValue };
}
