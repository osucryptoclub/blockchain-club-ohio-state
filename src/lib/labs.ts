/** The logic behind the four labs. Pure functions, so each claim on the page can be tested. */

/* ---------- Builders: reentrancy ---------- */

export type Step = "check" | "send" | "update";
export type CallEvent = { depth: number; text: string; kind: "call" | "pay" | "stop" | "note"; vault: number; thief: number };
export type Heist = { outcome: "drained" | "locked" | "safe"; events: CallEvent[]; vault: number; thief: number };

/**
 * Runs a vault's withdraw function with its three steps in the given order,
 * called by an attacker who calls it again every time they are paid.
 */
export function heist(order: Step[], vaultStart = 8): Heist {
  let vault = vaultStart;
  let thief = 0;
  let credit = 1;
  const events: CallEvent[] = [];
  const log = (depth: number, kind: CallEvent["kind"], text: string) => events.push({ depth, kind, text, vault, thief });

  const withdraw = (depth: number) => {
    log(depth, "call", depth === 0 ? "Attacker withdraws their 1 coin" : "Attacker withdraws again before the first call ends");
    for (const step of order) {
      if (step === "check") {
        if (credit < 1) return void log(depth, "stop", "Check fails: no balance left. Call rejected");
        log(depth, "note", "Check passes: the books still say they are owed 1");
      } else if (step === "send") {
        if (vault < 1) return void log(depth, "stop", "The vault is empty");
        vault -= 1;
        thief += 1;
        log(depth, "pay", "Vault pays 1 coin");
        if (depth < vaultStart + 2) withdraw(depth + 1);
      } else {
        credit = 0;
        log(depth, "note", "Books updated: they are owed 0");
      }
    }
  };
  withdraw(0);
  return { outcome: thief > 1 ? "drained" : thief === 1 ? "safe" : "locked", events, vault, thief };
}

/* ---------- Investments: constant-product pool ---------- */

export type Pool = { cash: number; coins: number };
export const FEE = 0.003;

/** Spend `cash` on coins. Reserves multiply to at least the same product afterwards. */
export function buy(pool: Pool, cash: number): { out: number; pool: Pool } {
  const taxed = cash * (1 - FEE);
  const out = (pool.coins * taxed) / (pool.cash + taxed);
  return { out, pool: { cash: pool.cash + cash, coins: pool.coins - out } };
}

export function sell(pool: Pool, coins: number): { out: number; pool: Pool } {
  const taxed = coins * (1 - FEE);
  const out = (pool.cash * taxed) / (pool.coins + taxed);
  return { out, pool: { cash: pool.cash - out, coins: pool.coins + coins } };
}

export type Trade = {
  quoted: number;
  coins: number;
  price: number;
  /** How much worse than the quoted price, as a fraction. */
  slip: number;
  /** What the bot made, in cash. */
  bot: number;
  rejected: boolean;
};

/**
 * Buy with `cash`. A bot may buy first and sell straight after. `limit` is the
 * most slippage the trader accepts; past it the trade is rejected and the bot
 * is left paying fees.
 */
export function trade(pool: Pool, cash: number, botCash: number, limit: number): Trade {
  const quoted = pool.cash / pool.coins;
  const front = botCash > 0 ? buy(pool, botCash) : { out: 0, pool };
  const mine = buy(front.pool, cash);
  const price = cash / mine.out;
  const slip = price / quoted - 1;
  const rejected = slip > limit;
  const after = rejected ? front.pool : mine.pool;
  const bot = botCash > 0 ? sell(after, front.out).out - botCash : 0;
  return { quoted, coins: rejected ? 0 : mine.out, price, slip, bot, rejected };
}

/* ---------- Research: proving you know a secret ---------- */

/** A small group: g = 4 has prime order q modulo p. Real systems use numbers hundreds of digits long. */
export const P = 2039;
export const Q = 1019;
export const G = 4;

export function power(base: number, exponent: number): number {
  let result = 1;
  let b = base % P;
  for (let e = exponent; e > 0; e = Math.floor(e / 2)) {
    if (e % 2) result = (result * b) % P;
    b = (b * b) % P;
  }
  return result;
}

export const publicKey = (secret: number) => power(G, secret % Q);

export type Round = { commitment: number; challenge: 0 | 1; response: number; accepted: boolean };

/** The verifier's check. It never sees the secret. */
export const verify = (key: number, { commitment, challenge, response }: Omit<Round, "accepted">) =>
  power(G, response) === (commitment * (challenge ? key : 1)) % P;

/** A prover who knows the secret always passes. */
export function honestRound(secret: number, nonce: number, challenge: 0 | 1): Round {
  const commitment = power(G, nonce % Q);
  const response = (nonce + challenge * secret) % Q;
  return { commitment, challenge, response, accepted: verify(publicKey(secret), { commitment, challenge, response }) };
}

/** A prover who does not know it can only prepare for the challenge they guess. */
export function cheatRound(key: number, nonce: number, guess: 0 | 1, challenge: 0 | 1): Round {
  const response = nonce % Q;
  // Choose the commitment that makes the check pass if the guess is right.
  const inverse = power(key, P - 2);
  const commitment = guess ? (power(G, response) * inverse) % P : power(G, response);
  return { commitment, challenge, response, accepted: verify(key, { commitment, challenge, response }) };
}

/* ---------- Marketing: spreading through a network ---------- */

export type Network = { points: { x: number; y: number }[]; links: number[][] };

/** A repeatable generator, so everyone plays the same network. */
export function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Points spread apart, each linked to its nearest neighbors, in one connected piece. */
export function network(seed: number, size = 64): Network {
  const next = random(seed);
  const points: { x: number; y: number }[] = [];
  for (let tries = 0; points.length < size && tries < 8000; tries++) {
    const angle = next() * Math.PI * 2;
    const r = Math.sqrt(next());
    const p = { x: Math.round(r * Math.cos(angle) * 1000) / 1000, y: Math.round(r * Math.sin(angle) * 620) / 1000 };
    if (points.every((q) => Math.hypot(p.x - q.x, p.y - q.y) > 0.13)) points.push(p);
  }
  const links: number[][] = points.map(() => []);
  const join = (a: number, b: number) => {
    if (a === b || links[a].includes(b)) return;
    links[a].push(b);
    links[b].push(a);
  };
  const apart = (a: number, b: number) => Math.hypot(points[a].x - points[b].x, points[a].y - points[b].y);
  for (const i of points.keys()) {
    const near = [...points.keys()].filter((j) => j !== i).sort((a, b) => apart(i, a) - apart(i, b));
    for (const j of near.slice(0, 2)) join(i, j);
  }
  for (;;) {
    const seen = spread(links, [0]).map((d) => d < Infinity);
    if (seen.every(Boolean)) break;
    let best: [number, number] = [0, 0];
    let least = Infinity;
    for (const a of points.keys()) {
      for (const b of points.keys()) {
        if (seen[a] && !seen[b] && apart(a, b) < least) [best, least] = [[a, b], apart(a, b)];
      }
    }
    join(...best);
  }
  return { points, links };
}

/** Rounds until each node hears a message started at `seeds`. */
export function spread(links: number[][], seeds: number[]): number[] {
  const at = links.map(() => Infinity);
  let edge = [...new Set(seeds)];
  for (const s of edge) at[s] = 0;
  for (let round = 1; edge.length; round++) {
    const following: number[] = [];
    for (const n of edge) {
      for (const m of links[n]) {
        if (at[m] === Infinity) {
          at[m] = round;
          following.push(m);
        }
      }
    }
    edge = following;
  }
  return at;
}

export const reached = (links: number[][], seeds: number[], rounds: number) =>
  spread(links, seeds).filter((d) => d <= rounds).length;

/** The best `count` starting points within `rounds`, found by checking every set. */
export function bestSeeds(links: number[][], count: number, rounds: number): number[] {
  const n = links.length;
  // Who each node reaches, as bits in 32-bit words, so every set can be tried quickly.
  const words = Math.ceil(n / 32);
  const masks = links.map((_, i) => {
    const mask = new Uint32Array(words);
    for (const [j, d] of spread(links, [i]).entries()) if (d <= rounds) mask[j >> 5] |= 1 << (j & 31);
    return mask;
  });
  const count32 = (v: number) => {
    let x = v - ((v >>> 1) & 0x55555555);
    x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
    return Math.imul((x + (x >>> 4)) & 0x0f0f0f0f, 0x01010101) >>> 24;
  };
  let best: number[] = [];
  let most = -1;
  const pick = (from: number, chosen: number[], mask: Uint32Array) => {
    if (chosen.length === count) {
      const c = mask.reduce((sum, w) => sum + count32(w), 0);
      if (c > most) [best, most] = [[...chosen], c];
      return;
    }
    for (let i = from; i < n; i++) pick(i + 1, [...chosen, i], mask.map((w, k) => w | masks[i][k]));
  };
  pick(0, [], new Uint32Array(words));
  return best;
}
