/** Synchronous SHA-256 of a UTF-8 string, returned as lowercase hex. */

const K = new Uint32Array(64);
const H0 = new Uint32Array(8);

// Constants are the fractional bits of the square and cube roots of the primes.
(function init() {
  const frac = (n: number) => Math.floor((n - Math.floor(n)) * 0x100000000);
  let found = 0;
  for (let n = 2; found < 64; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (!prime) continue;
    if (found < 8) H0[found] = frac(Math.sqrt(n));
    K[found] = frac(Math.cbrt(n));
    found++;
  }
})();

const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

export function sha256(message: string): string {
  const input = new TextEncoder().encode(message);
  const length = (((input.length + 8) >> 6) + 1) << 6;
  const padded = new Uint8Array(length);
  padded.set(input);
  padded[input.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(length - 8, Math.floor(input.length / 0x20000000));
  view.setUint32(length - 4, (input.length << 3) >>> 0);

  const state = new Uint32Array(H0);
  const w = new Uint32Array(64);

  for (let offset = 0; offset < length; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4);
    for (let i = 16; i < 64; i++) {
      const p = w[i - 15];
      const q = w[i - 2];
      const s0 = rotr(p, 7) ^ rotr(p, 18) ^ (p >>> 3);
      const s1 = rotr(q, 17) ^ rotr(q, 19) ^ (q >>> 10);
      w[i] = w[i - 16] + s0 + w[i - 7] + s1;
    }

    let [a, b, c, d, e, f, g, h] = state;
    for (let i = 0; i < 64; i++) {
      const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const t1 = (h + s1 + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
      const s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const t2 = (s0 + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }
    [a, b, c, d, e, f, g, h].forEach((value, i) => {
      state[i] += value;
    });
  }

  return Array.from(state, (x) => x.toString(16).padStart(8, "0")).join("");
}
