/* The finish bell (design/sound/sound.md). One sound, one meaning: a chat finished and it's your turn.
   Synthesized live with Web Audio, so there's no asset to load or licence to track. */

let ctx = null, lastRung = 0;

/** Call from a user gesture (first click) so the browser lets the bell play later. */
export function unlockBell() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
  } catch (e) { /* no audio here: the visual signals still show */ }
}

/** Rings once. Several finishes within 1.5 s ring once. Returns false if it couldn't play. */
export function ringBell({ force = false } = {}) {
  if (!ctx) unlockBell();
  if (!ctx || ctx.state !== "running") return false;
  const now = performance.now();
  if (!force && now - lastRung < 1500) return true;
  lastRung = now;
  const t = ctx.currentTime + 0.01, out = ctx.createGain(), lp = ctx.createBiquadFilter();
  out.gain.value = 0.14; lp.type = "lowpass"; lp.frequency.value = 4200; lp.connect(out).connect(ctx.destination);
  // fundamental C6 + inharmonic partials; the upper ones decay first
  [[1, 1, 1.4], [2, 0.42, 0.9], [2.76, 0.28, 0.6], [5.4, 0.12, 0.35], [8.93, 0.05, 0.2]].forEach(([r, g, d]) => {
    const o = ctx.createOscillator(), v = ctx.createGain();
    o.frequency.value = 1046.5 * r;
    v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + 0.004); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(v).connect(lp); o.start(t); o.stop(t + d + 0.05);
  });
  return true;
}
