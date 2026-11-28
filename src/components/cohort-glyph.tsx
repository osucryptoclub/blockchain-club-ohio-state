import type { CSSProperties, ReactNode } from "react";
import type { Track } from "@/content/tracks";

/**
 * One diagram per cohort. Each rests in a finished state and moves when its
 * card is hovered or focused; the motion lives in globals.css. Decorative.
 */

const order = (i: number) => ({ "--i": i }) as CSSProperties;
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** A city of blocks, assembled on an isometric grid. */
function Builders() {
  const heights = [34, 78, 48, 92, 150, 70, 40, 104, 58];
  const [w, d] = [58, 29];
  return range(9).map((i) => {
    const [col, row] = [i % 3, Math.floor(i / 3)];
    const x = 200 + (col - row) * (w + 4);
    const y = 168 + (col + row) * (d + 2);
    const h = heights[i];
    const top = y - h;
    const lit = i === 4;
    return (
      <g key={i} className="lift" style={order(col + row)}>
        <polygon
          points={`${x - w},${top} ${x},${top + d} ${x},${y + d} ${x - w},${y}`}
          className={lit ? "fill-gray-400" : "fill-[#4a0000]"}
        />
        <polygon
          points={`${x + w},${top} ${x},${top + d} ${x},${y + d} ${x + w},${y}`}
          className={lit ? "fill-[#5b6368]" : "fill-[#1f0000]"}
        />
        <polygon
          points={`${x},${top - d} ${x + w},${top} ${x},${top + d} ${x - w},${top}`}
          className={lit ? "fill-white" : "fill-scarlet"}
        />
      </g>
    );
  });
}

/** Candles climbing through a drawdown, with their running mean. */
function Investments() {
  const closes = [0.22, 0.3, 0.26, 0.4, 0.5, 0.44, 0.36, 0.48, 0.62, 0.58, 0.74, 0.88];
  const px = (v: number) => 350 - v * 300;
  const x = (i: number) => 26 + i * 31.5;
  const mean = closes.map((_, i) => {
    const window = closes.slice(Math.max(0, i - 3), i + 1);
    return window.reduce((a, b) => a + b, 0) / window.length;
  });
  return (
    <>
      {closes.map((close, i) => {
        const open = i ? closes[i - 1] : 0.15;
        const up = close >= open;
        return (
          <g key={i} className="candle" style={order(i)}>
            <path d={`M${x(i)} ${px(Math.max(open, close) + 0.06)}V${px(Math.min(open, close) - 0.05)}`} stroke="currentColor" strokeWidth="2" />
            <rect
              x={x(i) - 9}
              y={px(Math.max(open, close))}
              width="18"
              height={Math.max(6, Math.abs(close - open) * 300)}
              className={up ? "fill-white" : "fill-scarlet"}
            />
          </g>
        );
      })}
      <path
        className="trace"
        pathLength={1}
        d={mean.map((m, i) => `${i ? "L" : "M"}${x(i)} ${Math.round(px(m - 0.14))}`).join("")}
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
    </>
  );
}

/** A Merkle tree with one leaf's proof picked out. */
function Research() {
  const levels = range(4).map((l) => range(2 ** l).map((i) => [((i + 0.5) / 2 ** l) * 380 + 10, 46 + l * 100]));
  const proof = [0, 1, 2, 5];
  return (
    <>
      {levels.slice(1).flatMap((nodes, l) =>
        nodes.map(([x, y], i) => {
          const [px, py] = levels[l][i >> 1];
          return <path key={`${l}-${i}`} d={`M${px} ${py}V${py + 50}H${x}V${y}`} stroke="currentColor" strokeWidth="1.75" fill="none" opacity="0.4" />;
        }),
      )}
      <path
        className="trace stroke-scarlet"
        pathLength={1}
        strokeWidth="6"
        fill="none"
        d={proof
          .map((n, l) => {
            const [x, y] = levels[l][n];
            return l ? `V${y - 50}H${x}V${y}` : `M${x} ${y}`;
          })
          .join("")}
      />
      {levels.flatMap((nodes, l) =>
        nodes.map(([x, y], i) => {
          const s = l === 3 ? 22 : 30;
          const on = proof[l] === i;
          return (
            <rect
              key={`${l}-${i}`}
              className={`node ${on ? "fill-scarlet" : "fill-panel"}`}
              style={order(l)}
              x={x - s / 2}
              y={y - s / 2}
              width={s}
              height={s}
              stroke="currentColor"
              strokeWidth="2"
            />
          );
        }),
      )}
    </>
  );
}

/** A signal leaving one block and reaching others. */
function Marketing() {
  const reached: [number, number, number][] = [
    [88, -38, 1],
    [88, 168, 1],
    [134, 64, 2],
    [134, 214, 2],
    [134, -100, 2],
    [180, 20, 3],
    [180, 122, 3],
    [180, 250, 3],
    [180, -62, 3],
  ];
  return (
    <>
      {[46, 88, 134, 180].map((r, i) => (
        <circle key={r} className="ring" style={order(i)} cx="200" cy="200" r={r} stroke="currentColor" strokeWidth="2" fill="none" opacity={0.75 - i * 0.16} />
      ))}
      {reached.map(([r, deg, i]) => {
        const a = (deg * Math.PI) / 180;
        const [x, y] = [Math.round(200 + r * Math.cos(a)), Math.round(200 + r * Math.sin(a))];
        return <rect key={`${r}-${deg}`} className="node fill-white" style={order(i)} x={x - 9} y={y - 9} width="18" height="18" />;
      })}
      <rect x="178" y="178" width="44" height="44" className="fill-scarlet" />
    </>
  );
}

const glyphs: Record<Track["slug"], () => ReactNode> = {
  builders: Builders,
  investments: Investments,
  research: Research,
  marketing: Marketing,
};

export function CohortGlyph({ slug, className = "" }: { slug: Track["slug"]; className?: string }) {
  const Glyph = glyphs[slug];
  return (
    <svg viewBox="0 0 400 400" fill="none" className={`cohort-glyph ${className}`} aria-hidden="true">
      <Glyph />
    </svg>
  );
}
