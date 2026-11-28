import type { Track } from "@/content/tracks";
import { cohortMarks, type Tone } from "@/lib/cohort-marks";

const colors: Record<Tone, { color: string; opacity?: number }> = {
  line: { color: "currentColor" },
  soft: { color: "currentColor", opacity: 0.5 },
  accent: { color: "var(--color-scarlet)" },
  deep: { color: "var(--color-scarlet-dark)" },
};

/** A cohort's logo. Line work takes the text color. Files for print are in public/brand/cohorts/. */
export function CohortLogo({ slug, className = "" }: { slug: Track["slug"]; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      {cohortMarks[slug].map((shape, i) => {
        const { color, opacity } = colors[shape.tone];
        return "points" in shape ? (
          <polygon key={i} points={shape.points} fill={color} fillOpacity={opacity} />
        ) : (
          <path key={i} d={shape.path} stroke={color} strokeOpacity={opacity} strokeWidth={shape.width} />
        );
      })}
    </svg>
  );
}

/** The logo on its own black tile, so it reads the same on every ground. */
export function CohortBadge({ slug, className = "size-20" }: { slug: Track["slug"]; className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center border border-white/20 bg-black text-white ${className}`}>
      <CohortLogo slug={slug} className="size-[72%] transition-transform duration-500 ease-block group-hover:scale-110" />
    </span>
  );
}
