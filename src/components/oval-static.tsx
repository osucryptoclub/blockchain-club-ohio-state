import { oval } from "@/lib/oval";

/** Server-rendered drawing of the Oval network, used on inner page openers. */
export function OvalStatic({ className }: { className?: string }) {
  const rx = 600;
  const ry = 340;
  return (
    <svg viewBox="-620 -360 1240 720" className={className} fill="none" stroke="currentColor" aria-hidden="true">
      <ellipse rx={rx} ry={ry} strokeWidth="2.5" />
      <path
        strokeWidth="1.5"
        d={oval.edges
          .map(({ a, b }) => {
            const [p, q] = [oval.nodes[a], oval.nodes[b]];
            return `M${Math.round(p.x * rx)} ${Math.round(p.y * ry)}L${Math.round(q.x * rx)} ${Math.round(q.y * ry)}`;
          })
          .join("")}
      />
      <path
        fill="currentColor"
        stroke="none"
        d={oval.nodes
          .map((n) => `M${Math.round(n.x * rx) - 6} ${Math.round(n.y * ry) - 6}h12v12h-12z`)
          .join("")}
      />
    </svg>
  );
}
