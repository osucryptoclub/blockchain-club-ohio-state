import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { buildChain, inspect, reseal } from "../src/lib/chain.ts";
import { broadcast, oval } from "../src/lib/oval.ts";
import { exits, ground, heights, projector } from "../src/lib/scene.ts";
import { sha256 } from "../src/lib/sha256.ts";

test("sha256 matches Node's implementation", () => {
  const samples = ["", "abc", "é✓".repeat(50), ...[55, 56, 63, 64, 65, 1000].map((n) => "x".repeat(n))];
  for (const s of samples) {
    assert.equal(sha256(s), createHash("sha256").update(s).digest("hex"));
  }
});

test("editing a block breaks every block after it", () => {
  const chain = buildChain(["a", "b", "c"]);
  assert.deepEqual(inspect(chain), ["valid", "valid", "valid"]);

  let edited = chain.map((b, i) => (i === 0 ? { ...b, data: "z" } : b));
  assert.deepEqual(inspect(edited), ["edited", "unlinked", "downstream"]);

  edited = reseal(edited, 0);
  assert.deepEqual(inspect(edited), ["valid", "unlinked", "downstream"]);
  edited = reseal(edited, 1);
  assert.deepEqual(inspect(edited), ["valid", "valid", "unlinked"]);
  edited = reseal(edited, 2);
  assert.deepEqual(inspect(edited), ["valid", "valid", "valid"]);
});

test("undoing an edit restores the chain", () => {
  const chain = buildChain(["a", "b", "c"]);
  const undone = chain.map((b) => ({ ...b, data: b.data + "!" })).map((b, i) => ({ ...b, data: chain[i].data }));
  assert.deepEqual(inspect(undone), ["valid", "valid", "valid"]);
});

test("a broadcast from any node reaches the whole network", () => {
  for (const origin of oval.nodes.keys()) {
    const { at, hops } = broadcast(origin, () => 1);
    assert.ok(at.every(Number.isFinite));
    assert.ok(hops > 0);
  }
});

test("every node in the scene has a block and a way out", () => {
  assert.equal(ground.length, oval.nodes.length);
  assert.equal(exits.length, oval.nodes.length);
  assert.ok(heights.every((h) => h > 0));
  assert.ok(exits.every((e) => e.length > 0));
});

test("the camera draws near things lower and larger, and tall things higher", () => {
  const at = projector({ yaw: 0, pitch: 0.5, scale: 100, cx: 0, cy: 0 });
  const [far, near, raised] = [at(0, 0, -0.5), at(0, 0, 0.5), at(0, 0.2, 0)];
  assert.ok(near.y > far.y);
  assert.ok(near.k > far.k);
  assert.ok(raised.y < at(0, 0, 0).y);
});
