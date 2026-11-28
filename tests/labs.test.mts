import assert from "node:assert/strict";
import { test } from "node:test";
import { labs } from "../src/content/labs.ts";
import { questions } from "../src/content/quiz.ts";
import { tracks } from "../src/content/tracks.ts";
import { bestSeeds, buy, cheatRound, heist, honestRound, network, P, power, publicKey, Q, reached, sell, spread, trade, type Step } from "../src/lib/labs.ts";
import { leaning, score } from "../src/lib/quiz.ts";
import { cameraAt, CHAPTERS, monument, MONUMENTS, presence, project, viewProjection } from "../src/lib/world.ts";

test("only updating the books between checking and sending is safe", () => {
  const outcome = (order: Step[]) => heist(order).outcome;
  assert.equal(outcome(["check", "send", "update"]), "drained");
  assert.equal(outcome(["send", "check", "update"]), "drained");
  assert.equal(outcome(["send", "update", "check"]), "drained");
  assert.equal(outcome(["check", "update", "send"]), "safe");
  assert.equal(outcome(["update", "check", "send"]), "locked");
  const h = heist(["check", "send", "update"]);
  assert.equal(h.vault, 0);
  assert.equal(h.thief, 8);
});

test("the pool never loses value to a trade, and round trips cost money", () => {
  const pool = { cash: 100_000, coins: 1_000 };
  for (const cash of [1, 500, 20_000, 400_000]) {
    const b = buy(pool, cash);
    assert.ok(b.pool.cash * b.pool.coins >= pool.cash * pool.coins);
    assert.ok(b.out < pool.coins);
    assert.ok(sell(b.pool, b.out).out < cash);
  }
});

test("a sandwich hurts the trader and pays the bot, unless the limit stops it", () => {
  const pool = { cash: 100_000, coins: 1_000 };
  const alone = trade(pool, 10_000, 0, 1);
  const hit = trade(pool, 10_000, 15_000, 1);
  assert.ok(hit.coins < alone.coins);
  assert.ok(hit.bot > 0);
  const guarded = trade(pool, 10_000, 15_000, 0.12);
  assert.ok(guarded.rejected);
  assert.equal(guarded.coins, 0);
  assert.ok(guarded.bot < 0);
});

test("the proof group is what the page says it is", () => {
  const prime = (n: number) => {
    for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
    return true;
  };
  assert.ok(prime(P) && prime(Q) && P === 2 * Q + 1);
  assert.equal(power(4, Q), 1);
});

test("an honest prover always passes, and a cheat passes exactly when the guess is right", () => {
  for (const secret of [1, 7, 512, 1018]) {
    const key = publicKey(secret);
    for (const nonce of [3, 400, 1000]) {
      for (const c of [0, 1] as const) {
        assert.ok(honestRound(secret, nonce, c).accepted);
        for (const guess of [0, 1] as const) {
          assert.equal(cheatRound(key, nonce, guess, c).accepted, guess === c);
        }
      }
    }
  }
});

test("the network is connected, repeatable, and has a best answer worth finding", () => {
  const a = network(7);
  assert.deepEqual(a, network(7));
  assert.ok(a.points.length >= 55);
  assert.ok(spread(a.links, [0]).every(Number.isFinite));
  const best = bestSeeds(a.links, 3, 3);
  const top = reached(a.links, best, 3);
  const busiest = [...a.links.keys()].sort((x, y) => a.links[y].length - a.links[x].length).slice(0, 3);
  assert.ok(top >= reached(a.links, busiest, 3));
  assert.ok(top < a.points.length, "perfect coverage would make the lab trivial");
});

test("every track has a lab, and the quiz can lead to every track", () => {
  assert.deepEqual(labs.map((l) => l.slug).sort(), tracks.map((t) => t.slug).sort());
  for (const t of tracks) {
    // Answer every question with the answer that gives this track the most.
    const picks = questions.map((q) => {
      const best = Math.max(...q.answers.map((a) => a.points[t.slug] ?? 0));
      return [q.answers.findIndex((a) => (a.points[t.slug] ?? 0) === best)];
    });
    const { ranked, hash } = score(questions, picks);
    assert.equal(ranked[0].slug, t.slug);
    assert.equal(hash.length, 64);
    assert.ok(ranked.every((r) => r.fit >= 0 && r.fit <= 1));
  }
  assert.equal(leaning({ research: 1, builders: 2 }), "builders");
});

test("the camera rests on each chapter and every monument is in front of it", () => {
  for (let i = 0; i < CHAPTERS; i++) {
    assert.deepEqual(cameraAt(i), cameraAt(Math.min(i + 0.05, CHAPTERS - 1)));
    assert.equal(presence(i, i), 1);
    assert.equal(presence(i, i + 1), 0);
  }
  for (const [i, t] of tracks.entries()) {
    const { eye, look } = cameraAt(i + 1);
    const at = MONUMENTS[t.slug].at;
    const p = project(viewProjection(eye, look, 1.6, 1.75, [0, 0]), [at[0], 0.15, at[2]]);
    assert.ok(p.w > 0.3 && Math.abs(p.x) < 0.5 && Math.abs(p.y) < 0.5, `${t.slug} is off screen`);
    assert.ok(monument(t.slug, 1).length > 1);
  }
});
