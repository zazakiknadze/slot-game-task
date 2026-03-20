export function loadSpineData(PIXI, key, url) {
  return new Promise((resolve, reject) => {
    const loader = PIXI.Loader.shared;
    if (loader.resources[key]?.spineData) {
      resolve(loader.resources[key].spineData);
      return;
    }
    loader.add(key, url);
    loader.load((_, resources) => {
      const res = resources[key];
      if (!res) {
        reject(new Error(`Failed to load spine resource: ${key}`));
        return;
      }
      resolve(res.spineData ?? res.data ?? res);
    });
    loader.onError.once((err) => reject(err));
  });
}
