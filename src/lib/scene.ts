import { oval, type OvalEdge } from "./oval.ts";

/** The Oval network as a small 3D scene: ground plan, block heights, camera. */

/** Depth of the Oval relative to its length. */
const DEPTH = 0.64;
/** Distance from the camera to the middle of the scene, in half-lengths. */
const DISTANCE = 3.1;

export type Camera = { yaw: number; pitch: number; scale: number; cx: number; cy: number };
export type Screen = { x: number; y: number; depth: number; k: number };

export const ground = oval.nodes.map((n) => ({ x: n.x, z: n.y * DEPTH }));

/** Resting block heights: low around the ring, taller toward the middle. */
export const heights = oval.nodes.map((n, i) => {
  if (n.ring) return 0.035;
  const r2 = n.x * n.x + n.y * n.y;
  const vary = ((i * 2654435761) % 1000) / 1000;
  return 0.05 + 0.2 * (1 - r2) * (0.35 + 0.65 * vary);
});

export const worldLength = ({ a, b }: OvalEdge) =>
  Math.hypot(ground[a].x - ground[b].x, ground[a].z - ground[b].z);

/** A grid of lawn points inside the Oval. */
export const lawn = (() => {
  const points: { x: number; z: number }[] = [];
  const step = 0.062;
  for (let x = -1; x <= 1; x += step) {
    for (let z = -DEPTH; z <= DEPTH; z += step) {
      if (x * x + (z / DEPTH) ** 2 < 0.95) points.push({ x, z });
    }
  }
  return points;
})();

export const rim = (angle: number, spread = 1) => ({
  x: Math.cos(angle) * spread,
  z: Math.sin(angle) * DEPTH * spread,
});

export function projector({ yaw, pitch, scale, cx, cy }: Camera) {
  const [cosY, sinY, cosP, sinP] = [Math.cos(yaw), Math.sin(yaw), Math.cos(pitch), Math.sin(pitch)];
  return (x: number, y: number, z: number): Screen => {
    const rx = x * cosY - z * sinY;
    const rz = x * sinY + z * cosY;
    const depth = rz * cosP + y * sinP;
    const k = DISTANCE / (DISTANCE - depth);
    return { x: cx + rx * scale * k, y: cy - (y * cosP - rz * sinP) * scale * k, depth, k };
  };
}

/** Corner offsets of a block's base, in drawing order. */
export const corners = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
] as const;

/** Every way out of a node, for packets wandering the paths. */
export const exits = oval.nodes.map((_, i) =>
  [...oval.edges, ...oval.ringEdges].flatMap(({ a, b }) => (a === i ? [b] : b === i ? [a] : [])),
);
