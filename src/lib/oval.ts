/**
 * The club's signature graphic: a network shaped like the crossing paths of
 * the Oval. Points sit in a unit circle; renderers stretch it to an ellipse.
 * It is inspired by the Oval and is not a map of it.
 */

export type OvalNode = { x: number; y: number; ring: boolean };
export type OvalEdge = { a: number; b: number };

const RING = 18;
const PATHS: [number, number][] = [
  [0, 9],
  [1, 11],
  [2, 14],
  [3, 10],
  [4, 12],
  [5, 16],
  [6, 13],
  [7, 15],
  [8, 17],
];
const MERGE = 0.07;

function build() {
  const nodes: OvalNode[] = [];
  const edges: OvalEdge[] = [];
  const seen = new Set<string>();

  const connect = (a: number, b: number) => {
    if (a === b) return;
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ a, b });
  };

  // Rounded so the server and browser agree on every coordinate.
  const round = (n: number) => Math.round(n * 1e4) / 1e4;

  for (let i = 0; i < RING; i++) {
    const angle = (i / RING) * Math.PI * 2;
    nodes.push({ x: round(Math.cos(angle)), y: round(Math.sin(angle)), ring: true });
  }

  const nodeAt = (x: number, y: number) => {
    const near = nodes.findIndex((n) => Math.hypot(n.x - x, n.y - y) < MERGE);
    if (near !== -1) return near;
    nodes.push({ x: round(x), y: round(y), ring: false });
    return nodes.length - 1;
  };

  const stops = PATHS.map(([a, b]) => [
    { node: a, t: 0 },
    { node: b, t: 1 },
  ]);

  for (let i = 0; i < PATHS.length; i++) {
    for (let j = i + 1; j < PATHS.length; j++) {
      const [p, q] = PATHS[i].map((n) => nodes[n]);
      const [r, s] = PATHS[j].map((n) => nodes[n]);
      const d = (q.x - p.x) * (s.y - r.y) - (q.y - p.y) * (s.x - r.x);
      if (Math.abs(d) < 1e-9) continue;
      const t = ((r.x - p.x) * (s.y - r.y) - (r.y - p.y) * (s.x - r.x)) / d;
      const u = ((r.x - p.x) * (q.y - p.y) - (r.y - p.y) * (q.x - p.x)) / d;
      if (t <= 0.02 || t >= 0.98 || u <= 0.02 || u >= 0.98) continue;
      const node = nodeAt(p.x + t * (q.x - p.x), p.y + t * (q.y - p.y));
      stops[i].push({ node, t });
      stops[j].push({ node, t: u });
    }
  }

  for (const path of stops) {
    path.sort((a, b) => a.t - b.t);
    for (let i = 1; i < path.length; i++) connect(path[i - 1].node, path[i].node);
  }

  /** Ring segments are kept apart because renderers draw them as one curve. */
  const ringEdges = Array.from({ length: RING }, (_, i) => ({ a: i, b: (i + 1) % RING }));
  return { nodes, edges, ringEdges };
}

export const oval = build();

const allEdges = [...oval.edges, ...oval.ringEdges];

export type Broadcast = { at: number[]; hops: number; duration: number };

/** Shortest-path arrival time of a message sent from `origin` to every node. */
export function broadcast(origin: number, length: (e: OvalEdge) => number): Broadcast {
  const at = oval.nodes.map(() => Infinity);
  const hop = oval.nodes.map(() => Infinity);
  at[origin] = 0;
  hop[origin] = 0;
  const open = new Set(at.keys());
  while (open.size) {
    let u = -1;
    for (const n of open) if (u === -1 || at[n] < at[u]) u = n;
    open.delete(u);
    for (const e of allEdges) {
      const v = e.a === u ? e.b : e.b === u ? e.a : -1;
      if (v === -1) continue;
      const t = at[u] + length(e);
      if (t < at[v]) {
        at[v] = t;
        hop[v] = hop[u] + 1;
      }
    }
  }
  return { at, hops: Math.max(...hop), duration: Math.max(...at) };
}
