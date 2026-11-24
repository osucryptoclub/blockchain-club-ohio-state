import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Sponsor } from "@/content/sponsors";

/**
 * Sponsors as equal tiles in a hairline grid. A logo is shown when one is
 * provided; otherwise the name is set as a wordmark. The last cell invites the
 * next partner, so the grid never looks finished.
 */
export function SponsorGrid({ sponsors, invite = true }: { sponsors: Sponsor[]; invite?: boolean }) {
  return (
    <ul className="rule grid border-t border-l sm:grid-cols-2 lg:grid-cols-3">
      {sponsors.map((s) => (
        <li key={s.name} className="rule border-r border-b">
          <a
            href={s.url}
            rel="noopener sponsored"
            className="group relative flex h-full min-h-64 flex-col justify-between gap-10 p-6 transition-colors duration-300 hover:bg-current/5 lg:p-8"
          >
            <span className="flex min-h-16 items-center">
              {s.logo ? (
                <Image
                  src={s.logo}
                  alt={s.name}
                  width={280}
                  height={96}
                  unoptimized
                  className="h-14 w-auto max-w-full object-contain"
                />
              ) : (
                <span className="wide text-cell">{s.name}</span>
              )}
            </span>
            <span className="flex items-end justify-between gap-6">
              <span className="max-w-[34ch] opacity-75">{s.about}</span>
              <ArrowUpRight
                size={20}
                aria-hidden="true"
                className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
            <span className="sr-only"> (opens {s.name}’s website)</span>
          </a>
        </li>
      ))}
      {invite && (
        <li className="rule border-r border-b">
          <Link
            href="/contact"
            className="group flex h-full min-h-64 flex-col justify-between gap-10 p-6 lg:p-8"
          >
            <span
              aria-hidden="true"
              className="size-3 origin-top-left bg-scarlet transition-transform duration-500 ease-block group-hover:scale-[2.5]"
            />
            <span>
              <span className="wide block text-cell">Your organization</span>
              <span className="mt-2 block opacity-75">Support the next cohort. Start a conversation.</span>
            </span>
          </Link>
        </li>
      )}
    </ul>
  );
}
