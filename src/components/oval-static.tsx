import { oval } from "@/lib/oval";

/** Server-rendered Oval network, laid flat and turning slowly. Decorative. */
export function OvalStatic({ className = "" }: { className?: string }) {
  const r = 600;
  const px = (n: number) => Math.round(n * r);
  return (
    <div className={`tilt pointer-events-none ${className}`} aria-hidden="true">
      <svg viewBox="-640 -640 1280 1280" fill="none" stroke="currentColor" className="size-full">
        <circle r={r} strokeWidth="2.5" />
        <circle r={r + 34} strokeWidth="1" opacity="0.4" />
        <path
          strokeWidth="1.5"
          opacity="0.6"
          d={oval.edges
            .map(({ a, b }) => {
              const [p, q] = [oval.nodes[a], oval.nodes[b]];
              return `M${px(p.x)} ${px(p.y)}L${px(q.x)} ${px(q.y)}`;
            })
            .join("")}
        />
        <path
          fill="currentColor"
          stroke="none"
          d={oval.nodes.map((n) => `M${px(n.x) - 8} ${px(n.y) - 8}h16v16h-16z`).join("")}
        />
      </svg>
    </div>
  );
}
