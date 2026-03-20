import winSrc from '../../assets/audio/win.mp3';

let ctx = null;
let buffer = null;
let decodePromise = null;
let htmlEl = null;

let activeBufferSource = null;
let activeGain = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext({ latencyHint: 'interactive' });
  return ctx;
}

function getHtmlEl() {
  if (!htmlEl) {
    htmlEl = new Audio(winSrc);
    htmlEl.preload = 'auto';
  }
  return htmlEl;
}

export function stopWinChime() {
  if (activeGain) {
    try {
      const t = getCtx().currentTime;
      activeGain.gain.cancelScheduledValues(t);
      activeGain.gain.setValueAtTime(0, t);
    } catch {}
  }
  if (activeBufferSource) {
    try {
      activeBufferSource.stop(0);
    } catch {}
    try {
      activeBufferSource.disconnect();
    } catch {}
    activeBufferSource = null;
  }
  if (activeGain) {
    try {
      activeGain.disconnect();
    } catch {}
    activeGain = null;
  }
  if (htmlEl) {
    htmlEl.pause();
    htmlEl.currentTime = 0;
  }
}

export function primeWinAudio() {
  const c = getCtx();
  void c.resume();

  const h = getHtmlEl();
  h.pause();
  h.currentTime = 0;
  h.muted = true;
  const prime = h.play();
  if (prime !== undefined) {
    prime
      .then(() => {
        h.pause();
        h.currentTime = 0;
        h.muted = false;
      })
      .catch(() => {
        h.muted = false;
      });
  } else {
    h.muted = false;
  }

  if (!decodePromise) {
    decodePromise = fetch(winSrc)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.arrayBuffer();
      })
      .then((raw) => c.decodeAudioData(raw.slice(0)))
      .then((b) => {
        buffer = b;
        return b;
      })
      .catch(() => {
        buffer = null;
        return null;
      });
  }
  return decodePromise;
}

export async function playWinChime({ volume = 0.92 } = {}) {
  stopWinChime();

  const c = getCtx();
  await c.resume();
  if (!decodePromise) primeWinAudio();
  await decodePromise;

  const v = Math.min(1, Math.max(0, volume));

  if (buffer) {
    try {
      const src = c.createBufferSource();
      const g = c.createGain();
      g.gain.setValueAtTime(v, c.currentTime);
      src.buffer = buffer;
      src.connect(g);
      g.connect(c.destination);
      activeBufferSource = src;
      activeGain = g;
      src.onended = () => {
        if (activeBufferSource === src) {
          activeBufferSource = null;
          activeGain = null;
        }
      };
      src.start(0);
      return;
    } catch {
      stopWinChime();
    }
  }

  const h = getHtmlEl();
  h.pause();
  h.currentTime = 0;
  h.muted = false;
  h.volume = v;
  try {
    await h.play();
  } catch {
    await c.resume();
    try {
      await h.play();
    } catch {}
  }
}
