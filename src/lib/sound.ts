/**
 * Sound for the Oval, made in the browser and off until asked for: a low hum,
 * and a soft note as a broadcast reaches each part of the network.
 */

const SCALE = [0, 3, 5, 7, 10, 12, 15, 17];

export function createSound() {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.2);

  const hum = [55, 82.5, 110.4].map((frequency, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = frequency;
    g.gain.value = [0.1, 0.045, 0.022][i];
    o.connect(g).connect(master);
    o.start();
    return o;
  });

  return {
    /** Play notes at the given delays, in seconds. */
    ping(delays: number[]) {
      for (const [i, delay] of delays.entries()) {
        const at = ctx.currentTime + delay;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "triangle";
        o.frequency.value = 220 * 2 ** (SCALE[i % SCALE.length] / 12);
        g.gain.setValueAtTime(0, at);
        g.gain.linearRampToValueAtTime(0.09, at + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0008, at + 1.1);
        o.connect(g).connect(master);
        o.start(at);
        o.stop(at + 1.2);
      }
    },
    stop() {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      window.setTimeout(() => {
        for (const o of hum) o.stop();
        void ctx.close();
      }, 500);
    },
  };
}
