import type { ReactNode } from "react";

/**
 * One small diagram per area, drawn from the idea itself: a fork in a chain,
 * a constant-product curve, point addition on an elliptic curve. Decorative.
 */

type Point = [number, number];
const round = (v: number) => Math.round(v * 10) / 10;
const path = (points: Point[]) => points.map(([x, y], i) => `${i ? "L" : "M"}${round(x)} ${round(y)}`).join("");
const range = (count: number) => Array.from({ length: count }, (_, i) => i);

const Line = ({ d, faint }: { d: string; faint?: boolean }) => (
  <path d={d} pathLength={1} data-draw="" opacity={faint ? 0.45 : 1} />
);
const Dashed = ({ d }: { d: string }) => <path d={d} strokeDasharray="5 6" opacity={0.6} />;
const Block = ({ at: [x, y], s = 20, solid }: { at: Point; s?: number; solid?: boolean }) => (
  <rect
    data-pop=""
    x={round(x - s / 2)}
    y={round(y - s / 2)}
    width={s}
    height={s}
    stroke="none"
    className={solid ? "fill-scarlet" : "fill-current"}
  />
);

function Fork() {
  return (
    <>
      <Line d="M68 208H98" />
      <Line d="M146 208H176" />
      <Line d="M224 208H254" />
      <Line d="M122 184V120H176" />
      {[44, 122, 200, 278].map((x) => (
        <Line key={x} d={`M${x - 24} 184h48v48h-48z`} />
      ))}
      {[44, 122, 200].map((x) => (
        <Line key={x} faint d={`M${x - 12} 200h24M${x - 12} 208h24M${x - 12} 216h14`} />
      ))}
      <Dashed d="M176 96h48v48h-48zM224 120H300" />
      <Block at={[278, 208]} s={22} solid />
    </>
  );
}

function StateMachine() {
  return (
    <>
      <Line d="M20 160H72" />
      <Line d="M152 160H196" />
      <Line d="M112 120V72H240V132" />
      <Line d="M240 188V244H112V200" />
      <Line d="M112 120 152 160 112 200 72 160z" />
      <Line d="M196 132H284V188H196z" />
      <Line d="M232 122 240 132 248 122M186 152 196 160 186 168M104 210 112 200 120 210" faint />
      <Block at={[240, 160]} s={26} solid />
      <Block at={[20, 160]} s={14} />
    </>
  );
}

function App() {
  const feet: Point[] = [40, 100, 160, 220, 280].map((x) => [x, 270]);
  return (
    <>
      <Line d="M60 40H260V150H60z" />
      <Line d="M60 66H260" />
      <Line d="M84 90H156M84 108H136M84 126H148" faint />
      {feet.map(([x, y]) => (
        <Line key={x} d={`M160 150 ${x} ${y}`} />
      ))}
      <Dashed d={path(feet)} />
      {feet.map((p) => (
        <Block key={p[0]} at={p} s={16} />
      ))}
      <Block at={[216, 109]} s={40} solid />
    </>
  );
}

/** A swap moves along x · y = k. */
function Swap() {
  const at = (x: number): Point => [40 + x, 280 - 9000 / x];
  const [a, b] = [at(60), at(140)];
  return (
    <>
      <Line d="M40 30V280H296" />
      <Line d={path(range(60).map((i) => at(37 + i * 3.6)))} />
      <Dashed d={`M${a[0]} 280V${round(a[1])}H40M${b[0]} 280V${round(b[1])}H40`} />
      <Block at={a} s={14} />
      <Block at={b} s={20} solid />
    </>
  );
}

/** Supply approaches a cap when each period's reward is half the last. */
function Issuance() {
  let supply = 0;
  const points: Point[] = [[30, 280]];
  for (const i of range(7)) {
    supply += 0.5 ** (i + 1);
    points.push([30 + (i + 1) * 37, 280 - supply * 222]);
  }
  return (
    <>
      <Line d="M30 30V280H300" />
      <Dashed d="M30 58H300" />
      <Line d={path(points)} />
      {points.slice(1).map(([x, y]) => (
        <Line key={x} faint d={`M${x} 280V${round(y)}`} />
      ))}
      {points.slice(2).map((p) => (
        <Block key={p[0]} at={p} s={9} />
      ))}
      <Block at={points[1]} s={20} solid />
    </>
  );
}

/** Adding two points on y² = x³ - 2x + 2. */
function Curve() {
  const f = (x: number) => Math.sqrt(Math.max(0, x ** 3 - 2 * x + 2));
  const at = (x: number, y: number): Point => [152 + x * 56, 160 - y * 52];
  const xs = range(70).map((i) => -1.7692 + (i / 69) ** 1.6 * 3.96);
  const [px, py, qx, qy] = [-1.5, -f(-1.5), 0.8, f(0.8)];
  const slope = (qy - py) / (qx - px);
  const rx = slope ** 2 - px - qx;
  const ry = qy + slope * (rx - qx);
  return (
    <>
      <Line faint d="M20 160H300M152 20V300" />
      <Line d={path([...xs.map((x) => at(x, f(x))).reverse(), ...xs.map((x) => at(x, -f(x)))])} />
      <Line d={path([at(px - 0.4, py - slope * 0.4), at(rx + 0.4, ry + slope * 0.4)])} />
      <Dashed d={path([at(rx, ry), at(rx, -ry)])} />
      <Block at={at(px, py)} s={13} />
      <Block at={at(qx, qy)} s={13} />
      <Block at={at(rx, ry)} s={13} />
      <Block at={at(rx, -ry)} s={20} solid />
    </>
  );
}

/** The ring-shaped cave: prove you can open the door without showing how. */
function Cave() {
  const arc = (r: number, from: number, to: number) =>
    path(
      range(41).map((i): Point => {
        const angle = ((from + ((to - from) * i) / 40) * Math.PI) / 180;
        return [160 + r * Math.cos(angle), 148 + r * Math.sin(angle)];
      }),
    );
  return (
    <>
      <Line d={arc(112, 102, 438)} />
      <Line d={arc(70, 0, 360)} />
      <Line d="M137 257V300" />
      <Line d="M183 257V300" />
      <Line d={arc(91, 96, 258)} faint />
      <Dashed d={arc(91, 84, -78)} />
      <Block at={[160, 57]} s={30} solid />
      <Block at={[160, 286]} s={13} />
    </>
  );
}

function Citations() {
  const nodes: Point[] = [
    [44, 70],
    [40, 176],
    [64, 266],
    [132, 40],
    [140, 132],
    [150, 226],
    [226, 84],
    [236, 188],
    [292, 140],
  ];
  const links = [
    [0, 3],
    [0, 4],
    [1, 4],
    [1, 5],
    [2, 5],
    [3, 6],
    [4, 6],
    [4, 7],
    [5, 7],
    [6, 8],
    [7, 8],
  ];
  return (
    <>
      {links.map(([a, b]) => (
        <Line key={`${a}-${b}`} d={path([nodes[a], nodes[b]])} faint={a < 3} />
      ))}
      <Dashed d={path([nodes[2], nodes[4]])} />
      {nodes.slice(0, -1).map((p) => (
        <Block key={p.join()} at={p} s={13} />
      ))}
      <Block at={nodes[8]} s={26} solid />
    </>
  );
}

function Agent() {
  const layers = [
    [70, 130, 190, 250],
    [100, 160, 220],
    [130, 190],
  ].map((ys, l) => ys.map((y): Point => [40 + l * 72, y]));
  return (
    <>
      {layers.slice(1).flatMap((to, l) =>
        layers[l].flatMap((p) => to.map((q) => <Line key={`${p}-${q}`} faint d={path([p, q])} />)),
      )}
      <Line d="M184 130 228 160 184 190" />
      <Line d="M228 120H304V200H228z" />
      {layers.flat().map((p) => (
        <Block key={p.join()} at={p} s={13} />
      ))}
      <Block at={[266, 160]} s={32} solid />
    </>
  );
}

function Steps() {
  return (
    <>
      <Line d="M20 280H300" faint />
      {[1, 2, 3].map((k) => (
        <Line
          key={k}
          d={range(k)
            .map((i) => `M${k * 64 - 32} ${224 - i * 56}h56v56h-56z`)
            .join("")}
        />
      ))}
      <Dashed d="M224 224h56v56h-56zM224 168h56v56h-56zM224 112h56v56h-56z" />
      <Block at={[252, 84]} s={56} solid />
    </>
  );
}

const glyphs: Record<string, () => ReactNode> = {
  "blockchain-development": Fork,
  "smart-contracts": StateMachine,
  "web3-dapps": App,
  defi: Swap,
  "digital-assets": Issuance,
  cryptography: Curve,
  "zero-knowledge": Cave,
  research: Citations,
  "ai-blockchain": Agent,
  entrepreneurship: Steps,
};

export function AreaGlyph({ slug, className = "" }: { slug: string; className?: string }) {
  const Glyph = glyphs[slug];
  if (!Glyph) return null;
  return (
    <svg
      viewBox="0 0 320 320"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={`glyph ${className}`}
      aria-hidden="true"
    >
      <Glyph />
    </svg>
  );
}
