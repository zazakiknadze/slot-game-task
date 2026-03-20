export async function waitForTexture(tex) {
  const base = tex?.baseTexture;
  if (!base) return;
  if (base.valid) return;
  await new Promise((resolve) => {
    const done = () => resolve();
    base.once('loaded', done);
    base.once('error', done);
  });
}
