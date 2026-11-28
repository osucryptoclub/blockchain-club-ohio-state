/**
 * The four cohort logos, as flat shapes on a 120 by 120 grid. They are one
 * family: each is cut from the same isometric block, whose outline is a hexagon.
 * Tones are named so a mark can be recolored for any ground.
 */

export type Tone = "line" | "soft" | "accent" | "deep";
export type Shape = { points: string; tone: Tone } | { path: string; tone: Tone; width: number };

const join = (points: number[][]) => points.map((p) => p.map((n) => Math.round(n * 10) / 10).join(",")).join(" ");
const face = (tone: Tone, ...points: number[][]): Shape => ({ tone, points: join(points) });
const line = (tone: Tone, width: number, ...points: number[][]): Shape => ({
  tone,
  width,
  path: `M${join(points).replaceAll(" ", "L")}`,
});

/** Corners of the block's outline, clockwise from the top. */
const hex = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = ((i * 60 - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });

/** A solid block: top, left, and right faces. */
const block = (cx: number, cy: number, r: number, [top, left, right]: [Tone, Tone, Tone]): Shape[] => {
  const [n, ne, se, s, sw, nw] = hex(cx, cy, r);
  const c = [cx, cy];
  return [face(top, n, ne, c, nw), face(left, nw, c, s, sw), face(right, ne, c, s, se)];
};

/** Builders: the next slab being set on the block. */
const builders: Shape[] = [
  face("line", [15, 60], [60, 86], [60, 112], [15, 86]),
  face("soft", [105, 60], [60, 86], [60, 112], [105, 86]),
  face("accent", [60, 8], [105, 34], [60, 60], [15, 34]),
  face("deep", [15, 34], [60, 60], [60, 74], [15, 48]),
  face("deep", [105, 34], [60, 60], [60, 74], [105, 48]),
];

/** Investments: a rising chart folded around the corner of the block. */
const investments: Shape[] = (() => {
  const floor = (x: number) => (x <= 60 ? 86 + ((x - 15) * 26) / 45 : 112 - ((x - 60) * 26) / 45);
  return (
    [
      [15, 34, 20, "soft"],
      [38, 57, 40, "soft"],
      [63, 82, 62, "line"],
      [86, 105, 78, "accent"],
    ] as const
  ).map(([a, b, h, tone]) => face(tone, [a, floor(a) - h], [b, floor(b) - h], [b, floor(b)], [a, floor(a)]));
})();

/** Research: a block seen inside the block. */
const research: Shape[] = (() => {
  const [outer, inner] = [hex(60, 60, 48), hex(60, 60, 23)];
  return [
    ...outer.map((p, i) => line("soft", 4, inner[i], p)),
    line("line", 8, ...outer, outer[0], outer[1]),
    ...block(60, 60, 23, ["line", "accent", "deep"]),
  ];
})();

/** Marketing: a block sending its signal outward. */
const marketing: Shape[] = [
  ...[53, 36].map((r, i) => {
    const [n, ne, se, s] = hex(42, 60, r - 4);
    return line(i ? "line" : "soft", 9, n, ne, se, s);
  }),
  ...block(42, 60, 20, ["accent", "accent", "deep"]),
];

export const cohortMarks = { builders, investments, research, marketing };
