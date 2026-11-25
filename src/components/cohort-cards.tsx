import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CohortGlyph } from "@/components/cohort-glyph";
import { CohortBadge } from "@/components/cohort-logo";
import { trackNumber, tracks, type Track } from "@/content/tracks";

/** Each cohort keeps the palette and gets its own ground. */
export const cohortGrounds: Record<Track["slug"], string> = {
  builders: "bg-[linear-gradient(135deg,#8b0000,#3a0000_70%)]",
  investments: "bg-[linear-gradient(135deg,#101c33,#070c17_70%)]",
  research: "bg-[linear-gradient(135deg,#1f2023,#0b0b0c_70%)]",
  marketing: "bg-[radial-gradient(circle_at_85%_40%,#5c0000,#10080a_62%)]",
};

/** The four cohorts as linked cards. */
export function CohortCards() {
  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {tracks.map(({ slug, name, description, keywords }, i) => (
        <li key={slug} className="rise">
          <Link
            href={`/cohorts#${slug}`}
            data-tilt=""
            className={`cohort group relative isolate flex h-full min-h-[34rem] flex-col overflow-hidden border border-white/12 p-6 transition-colors duration-300 hover:border-white/50 focus-visible:border-white/50 lg:p-9 ${cohortGrounds[slug]}`}
          >
            <span className="flex items-start justify-between gap-6">
              <span className="flex items-center gap-4">
                <CohortBadge slug={slug} />
                <span className="text-sm font-semibold">Cohort {trackNumber(i)}</span>
              </span>
              <ArrowRight
                aria-hidden="true"
                className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
            <CohortGlyph slug={slug} className="my-6 ml-auto size-56 sm:size-64 xl:size-72" />
            <span className="flex flex-1 flex-col">
              <span className="widen block text-[clamp(2rem,4vw,3.5rem)] leading-none">{name}</span>
              <span className="mt-4 block max-w-[58ch] text-white/85">{description}</span>
              <span className="mt-auto flex flex-wrap gap-2 pt-6 text-sm font-medium">
                {keywords.map((k) => (
                  <span key={k} className="border border-white/30 bg-black/25 px-3 py-1 backdrop-blur-sm">
                    {k}
                  </span>
                ))}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
