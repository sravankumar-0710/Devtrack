/**
 * playAlarm — plays a short attention-getting beep sequence using the
 * Web Audio API. No external audio file needed, so it works offline
 * and doesn't need any asset bundling.
 */
export function playAlarm() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const beep = (start, freq) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.25, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + 0.4);
    };

    beep(0,   880);
    beep(0.4, 880);
    beep(0.8, 1046.5);

    setTimeout(() => ctx.close(), 1500);
  } catch {
    // Audio blocked (e.g. no user interaction yet) — fail silently
  }
}