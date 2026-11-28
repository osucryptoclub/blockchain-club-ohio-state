import { oval } from "./oval.ts";
import { ground, heights, rim } from "./scene.ts";

/**
 * The Oval as a place: everything in it is a box, and the camera follows a path
 * from high above, down to the street, past one monument per track, and back up.
 * Pure geometry, shared by the home page journey and the track pages.
 */

export type Vec = [number, number, number];

/** 0 dark metal, 1 scarlet metal, 2 white, 3 path at rest, 4 light, 5 glass. */
export type Material = 0 | 1 | 2 | 3 | 4 | 5;

export type Box = { at: Vec; half: Vec; yaw?: number; material: Material; glow?: number; alpha?: number };

export type TrackSlug = "builders" | "investments" | "research" | "marketing";

export const MONUMENTS: Record<TrackSlug, { at: Vec; yaw: number }> = {
  builders: { at: [-1.3, 0, 0.5], yaw: 0.5 },
  investments: { at: [-0.95, 0, -0.82], yaw: -0.35 },
  research: { at: [0.95, 0, -0.82], yaw: 0.6 },
  marketing: { at: [1.3, 0, 0.5], yaw: -0.5 },
};

const box = (at: Vec, half: Vec, material: Material, extra: Partial<Box> = {}): Box => ({ at, half, material, ...extra });

/** The twelve edges of a cube, as thin bars. */
function frame(center: Vec, r: number, bar: number, material: Material, glow = 0): Box[] {
  const [x, y, z] = center;
  const out: Box[] = [];
  for (const a of [-1, 1]) {
    for (const b of [-1, 1]) {
      out.push(box([x, y + a * r, z + b * r], [r + bar, bar, bar], material, { glow }));
      out.push(box([x + a * r, y, z + b * r], [bar, r + bar, bar], material, { glow }));
      out.push(box([x + a * r, y + b * r, z], [bar, bar, r + bar], material, { glow }));
    }
  }
  return out;
}

/** A track's logo as boxes, standing on the ground around the origin. `t` is seconds. */
export function monument(slug: TrackSlug, t: number): Box[] {
  switch (slug) {
    case "builders": {
      // The next slab settling onto the block.
      const drop = 0.09 + 0.05 * (0.5 + 0.5 * Math.cos(t * 0.9));
      return [
        box([0, 0.1, 0], [0.17, 0.1, 0.17], 2),
        box([0, 0.2 + drop + 0.035, 0], [0.17, 0.035, 0.17], 1, { glow: 0.35 }),
      ];
    }
    case "investments":
      // A rising chart folded around a corner.
      return [0.1, 0.19, 0.3, 0.42].map((h, i) => {
        const breathe = h * (1 + 0.05 * Math.sin(t * 1.3 + i * 1.1));
        const at: Vec = i < 2 ? [-0.13, breathe / 2, 0.16 - i * 0.14] : [-0.13 + (i - 1) * 0.14, breathe / 2, -0.12];
        return box(at, [0.055, breathe / 2, 0.055], i === 3 ? 1 : i === 2 ? 2 : 0, { glow: i === 3 ? 0.35 : 0 });
      });
    case "research":
      // A block seen inside the block.
      return [
        ...frame([0, 0.21, 0], 0.19, 0.012, 2),
        box([0, 0.21, 0], [0.075, 0.075, 0.075], 1, { yaw: t * 0.5, glow: 0.5 }),
        box([0, 0.21, 0], [0.18, 0.18, 0.18], 5, { alpha: 0.1 }),
      ];
    case "marketing":
      // A block sending its signal outward.
      return [
        box([0, 0.16, 0], [0.085, 0.085, 0.085], 1, { glow: 0.45 }),
        ...[0, 1, 2].flatMap((i) => {
          const phase = (t * 0.28 + i / 3) % 1;
          const fade = Math.sin(phase * Math.PI);
          const r = 0.12 + phase * 0.26;
          const bar = 0.007;
          return [
            box([0, 0.16, r], [r, bar, bar], 4, { glow: fade * 0.8, alpha: fade }),
            box([0, 0.16, -r], [r, bar, bar], 4, { glow: fade * 0.8, alpha: fade }),
            box([r, 0.16, 0], [bar, bar, r], 4, { glow: fade * 0.8, alpha: fade }),
            box([-r, 0.16, 0], [bar, bar, r], 4, { glow: fade * 0.8, alpha: fade }),
          ];
        }),
      ];
  }
}

/** Turn and move boxes as one object. */
export function place(boxes: Box[], at: Vec, yaw: number, scale = 1): Box[] {
  const [c, s] = [Math.cos(yaw), Math.sin(yaw)];
  return boxes.map((b) => ({
    ...b,
    at: [
      at[0] + (b.at[0] * c - b.at[2] * s) * scale,
      at[1] + b.at[1] * scale,
      at[2] + (b.at[0] * s + b.at[2] * c) * scale,
    ],
    half: [b.half[0] * scale, b.half[1] * scale, b.half[2] * scale],
    yaw: (b.yaw ?? 0) + yaw,
  }));
}

/** A flat bar along the ground between two points. */
export function strip(a: { x: number; z: number }, b: { x: number; z: number }, width: number, y: number): Pick<Box, "at" | "half" | "yaw"> {
  const [dx, dz] = [b.x - a.x, b.z - a.z];
  return {
    at: [(a.x + b.x) / 2, y, (a.z + b.z) / 2],
    half: [Math.hypot(dx, dz) / 2, 0.0012, width],
    yaw: Math.atan2(dz, dx),
  };
}

/** Straight pieces that make up one ring segment, from node `i` to the next. */
export const RING_PIECES = 4;
export const ringPoint = (i: number, t: number, spread = 1) =>
  rim(((i + t) / oval.ringEdges.length) * Math.PI * 2, spread);

/** Paths and rims that never change. */
export const pathways: Box[] = [
  ...oval.edges.map(({ a, b }) => ({ ...strip(ground[a], ground[b], 0.0028, 0.0012), material: 3 as const })),
  ...[1, 1.07].flatMap((spread, k) =>
    oval.ringEdges.flatMap((_, i) =>
      Array.from({ length: RING_PIECES }, (_, j) => ({
        ...strip(ringPoint(i, j / RING_PIECES, spread), ringPoint(i, (j + 1) / RING_PIECES, spread), k ? 0.0016 : 0.004, 0.0012),
        material: 3 as const,
        glow: k ? 0 : 0.6,
      })),
    ),
  ),
];

export const blockHeight = (i: number) => heights[i] * (oval.nodes[i].ring ? 1.4 : 1.75);
export const blockHalf = (i: number) => (oval.nodes[i].ring ? 0.019 : 0.031);

/** Where the camera stands for each chapter. `via` bends the way to the next one. */
type Key = { eye: Vec; look: Vec; via: Vec };

const KEYS: Key[] = [
  { eye: [0.42, 0.86, 1.52], look: [0, 0.04, 0.02], via: [-0.9, 0.62, 2.1] },
  { eye: [-1.18, 0.5, 1.36], look: [-1.3, 0.16, 0.48], via: [-2.3, 0.5, 0.5] },
  { eye: [-1.5, 0.48, -0.16], look: [-0.95, 0.18, -0.82], via: [-0.45, 0.2, 0.1] },
  { eye: [0.42, 0.5, -0.2], look: [0.96, 0.18, -0.82], via: [0.75, 0.22, 0.2] },
  { eye: [0.78, 0.56, 1.28], look: [1.3, 0.13, 0.48], via: [1.6, 1, 2.2] },
  { eye: [0, 1.5, 2.15], look: [0, 0, 0], via: [0, 1.5, 2.15] },
];

export const CHAPTERS = KEYS.length;

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(Math.max((t - a) / (b - a), 0), 1);
  return x * x * (3 - 2 * x);
};

/** Camera position for a chapter position from 0 to CHAPTERS - 1. It rests at whole numbers. */
export function cameraAt(chapter: number): { eye: Vec; look: Vec } {
  const c = Math.min(Math.max(chapter, 0), CHAPTERS - 1);
  const i = Math.min(Math.floor(c), CHAPTERS - 2);
  const t = smooth(0.14, 0.86, c - i);
  const [from, to] = [KEYS[i], KEYS[i + 1]];
  const bend = (k: 0 | 1 | 2) => mix(mix(from.eye[k], from.via[k], t), mix(from.via[k], to.eye[k], t), t);
  return {
    eye: [bend(0), bend(1), bend(2)],
    look: [mix(from.look[0], to.look[0], t), mix(from.look[1], to.look[1], t), mix(from.look[2], to.look[2], t)],
  };
}

/** How visible a chapter's text is when the camera is at `chapter`. */
export const presence = (index: number, chapter: number) => 1 - smooth(0.2, 0.42, Math.abs(chapter - index));

const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (a: Vec): Vec => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** View and projection in one column-major matrix. `shift` slides the picture, in half screens. */
export function viewProjection(eye: Vec, look: Vec, aspect: number, focal: number, shift: [number, number]): Float32Array {
  const back = unit(sub(eye, look));
  const right = unit(cross([0, 1, 0], back));
  const up = cross(back, right);
  const [near, far] = [0.02, 14];
  const [fx, fy] = [focal / aspect, focal];
  const [pz, pw] = [-(far + near) / (far - near), (-2 * far * near) / (far - near)];
  const row = (v: Vec) => [v[0], v[1], v[2], -dot(v, eye)];
  const [r, u, b] = [row(right), row(up), row(back)];
  const m = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    m[c * 4] = fx * r[c] - shift[0] * b[c];
    m[c * 4 + 1] = fy * u[c] - shift[1] * b[c];
    m[c * 4 + 2] = pz * b[c] + (c === 3 ? pw : 0);
    m[c * 4 + 3] = -b[c];
  }
  return m;
}

/** Screen position of a point, from -1 to 1, with its distance along the view. */
export function project(m: Float32Array, p: Vec): { x: number; y: number; w: number } {
  const at = (r: number) => m[r] * p[0] + m[4 + r] * p[1] + m[8 + r] * p[2] + m[12 + r];
  const w = at(3);
  return { x: at(0) / w, y: at(1) / w, w };
}
