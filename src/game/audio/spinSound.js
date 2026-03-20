import spinSrc from '../../assets/audio/spin.mp3';

export function createSpinSound({ volume = 0.09, startAtSec = 2 } = {}) {
  const audio = new Audio(spinSrc);
  audio.loop = true;
  audio.preload = 'auto';

  const targetVol = () => volume;

  let fadeTimer = null;

  function clearFade() {
    if (fadeTimer != null) {
      clearInterval(fadeTimer);
      fadeTimer = null;
    }
  }

  function stop() {
    clearFade();
    if (!audio.paused) {
      const steps = 6;
      const v0 = audio.volume;
      let step = 0;
      fadeTimer = setInterval(() => {
        step++;
        audio.volume = v0 * (1 - step / steps);
        if (step >= steps) {
          clearFade();
          audio.pause();
          audio.currentTime = startAtSec;
          audio.volume = targetVol();
        }
      }, 16);
    } else {
      audio.currentTime = startAtSec;
      audio.volume = targetVol();
    }
  }

  async function start() {
    clearFade();
    audio.pause();
    audio.volume = targetVol();
    audio.currentTime = startAtSec;
    try {
      await audio.play();
    } catch {}
  }

  return { start, stop };
}
