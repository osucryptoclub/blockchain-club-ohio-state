import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { cohortGrounds } from "@/components/cohort-cards";
import { Action, TextLink } from "@/components/action";
import { CohortGlyph } from "@/components/cohort-glyph";
import { MonumentViewer } from "@/components/world/monument-viewer";
import { DeadlineBand } from "@/components/deadline-band";
import { campus } from "@/content/campus";
import { getLab } from "@/content/labs";
import { CohortBadge, CohortLogo } from "@/components/cohort-logo";
import { PageHero } from "@/components/page-hero";
import { Rows, Split } from "@/components/section";
import { areas } from "@/content/areas";
import { cohortStatuses } from "@/content/cohorts";
import { site } from "@/content/site";
import { trackNumber, tracks } from "@/content/tracks";
import { cohortMembers, cohortProjects, orderedCohorts } from "@/lib/roster";

export const metadata: Metadata = {
  title: "Cohorts",
  description: `Builders, Investments, Research, and Marketing: the four cohorts of ${site.name}.`,
  alternates: { canonical: "/cohorts" },
};

const format = [
  { title: "Apply", text: "Pick one cohort and apply before the deadline. Any major, any level of experience." },
  { title: "Join a team", text: "Each cohort splits into small teams that own one part of a real project." },
  { title: "Ship", text: "Work is reviewed like production code and published under the club’s GitHub." },
  { title: "Get credit", text: "Members are named on the cohort page with their team, role, and results." },
];

/** A dated cohort's place among the four tracks, for numbering and order. */
const trackIndex = (name: string) => Math.max(0, tracks.findIndex((t) => t.name === name));

export default function Cohorts() {
  return (
    <>
      <PageHero
        title="Four cohorts. One club."
        photo={campus.ovalFog}
        action={
          <>
            <Action href="#apply-deadline">Apply to a cohort</Action>
            <Action href="/find-your-cohort" variant="outline">
              Find your cohort
            </Action>
          </>
        }
      >
        Builders, Investments, Research, and Marketing. Choose the one that matches what you want to do.
      </PageHero>

      <nav aria-label="Cohorts" className="rule border-t">
        <ul className="shell grid grid-cols-2 lg:grid-cols-4">
          {tracks.map(({ slug, name }, i) => (
            <li key={slug}>
              <a href={`#${slug}`} className="group flex items-center gap-3 py-6 font-semibold sm:gap-4 sm:text-subhead">
                <CohortLogo
                  slug={slug}
                  className="size-8 shrink-0 transition-transform duration-300 group-hover:scale-110 sm:size-10"
                />
                <span className="widen">
                  <span className="sr-only">Cohort {trackNumber(i)}: </span>
                  {name}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {tracks.map((cohort, i) => {
        const sessions = orderedCohorts.filter((c) => c.name === cohort.name);
        const related = areas.filter((a) => cohort.areas.includes(a.slug));
        return (
          <section
            key={cohort.slug}
            id={cohort.slug}
            aria-labelledby={`${cohort.slug}-title`}
            className={`cohort group band rule scroll-mt-16 border-t ${cohortGrounds[cohort.slug]}`}
          >
            <div className="shell grid gap-x-16 gap-y-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="flex items-center gap-5 font-semibold">
                  <CohortBadge slug={cohort.slug} className="size-28 lg:size-32" />
                  Cohort {trackNumber(i)}
                </p>
                <h2 id={`${cohort.slug}-title`} className="wide mt-8 text-[clamp(2.5rem,5vw,4.75rem)] leading-none">
                  {cohort.name}
                </h2>
                <p className="mt-5 max-w-[34ch] text-lead font-semibold">{cohort.focus}</p>
                <MonumentViewer slug={cohort.slug} className="mt-10 aspect-square w-full max-w-120 border border-white/15 bg-black">
                  <CohortGlyph slug={cohort.slug} className="w-4/5" />
                </MonumentViewer>
                <p className="mt-3 text-sm text-white/75">Drag to turn it.</p>
              </div>
              <div className="lg:col-span-7">
                <p className="max-w-[58ch] text-lead">{cohort.description}</p>
                <h3 className="mt-12 font-semibold">What members do</h3>
                <ul className="rule mt-4 border-t">
                  {cohort.activities.map((activity) => (
                    <li key={activity} className="rise rule flex items-baseline gap-5 border-b py-5 text-subhead">
                      <span aria-hidden="true" className="size-2.5 shrink-0 bg-white" />
                      {activity}
                    </li>
                  ))}
                </ul>
                <div className="mt-12 grid gap-10 sm:grid-cols-2">
                  <div>
                    <h3 className="font-semibold">Skills you’ll build</h3>
                    <ul className="mt-4 grid gap-3">
                      {cohort.skills.map((s) => (
                        <li key={s} className="flex gap-3">
                          <Check size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">Who it suits</h3>
                    <ul className="mt-4 grid gap-3">
                      {cohort.fit.map((f) => (
                        <li key={f} className="flex gap-3">
                          <span aria-hidden="true" className="mt-2 size-2 shrink-0 bg-white" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-12 border border-white/30 bg-black/35 p-6 lg:p-8">
                  <h3 className="wide text-cell">{getLab(cohort.slug)?.title}</h3>
                  <p className="mt-3 mb-5 max-w-[52ch] text-white/85">{getLab(cohort.slug)?.hook}</p>
                  <TextLink href={`/labs/${cohort.slug}`}>Try the lab</TextLink>
                </div>
                {sessions.length > 0 && (
                  <p className="mt-12 flex flex-wrap gap-3">
                    {sessions.map((c) => (
                      <Action key={c.slug} href={`/cohorts/${c.slug}`} variant="inverse">
                        {c.term}, {cohortStatuses[c.status].toLowerCase()}
                      </Action>
                    ))}
                  </p>
                )}
                {related.length > 0 && (
                  <>
                    <h3 className="mt-12 font-semibold">Areas this cohort works on</h3>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {related.map((a) => (
                        <li key={a.slug}>
                          <Link
                            href={`/what-we-do#${a.slug}`}
                            className="block border border-white/30 bg-black/25 px-4 py-2 font-medium transition-colors hover:bg-white hover:text-black"
                          >
                            {a.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </section>
        );
      })}

      <section id="sessions" className="band rule border-t">
        <div className="shell">
          <h2 className="rise wide mb-12 text-heading lg:mb-16">Every cohort</h2>
          <ul className="border-t-2 border-current">
            {[...orderedCohorts].sort((a, b) => trackIndex(a.name) - trackIndex(b.name)).map((c) => {
              const members = cohortMembers(c.slug).length;
              const projects = cohortProjects(c.slug).length;
              return (
                <li key={c.slug} className="rule border-b">
                  <Link
                    href={`/cohorts/${c.slug}`}
                    className="group grid gap-x-10 gap-y-4 py-10 lg:grid-cols-12 lg:items-center lg:py-14"
                  >
                    <span className="font-mono text-sm text-gray-400 lg:col-span-1">
                      {trackNumber(trackIndex(c.name))}
                    </span>
                    <span className="lg:col-span-5">
                      <span className="widen block text-[clamp(2rem,4.4vw,3.75rem)] leading-none">{c.name}</span>
                      <span className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="text-lead">{c.term}</span>
                        <span className="flex items-center gap-2 border border-current/40 px-2.5 py-0.5 text-sm">
                          <span
                            aria-hidden="true"
                            className={`size-1.5 ${c.status === "active" ? "bg-scarlet" : "bg-gray-400"}`}
                          />
                          {cohortStatuses[c.status]}
                        </span>
                      </span>
                    </span>
                    <span className="muted max-w-[52ch] lg:col-span-5">
                      {c.summary}
                      <span className="mt-3 block font-mono text-sm">
                        {[
                          c.teams?.length && `${c.teams.length} ${c.teams.length === 1 ? "team" : "teams"}`,
                          projects > 0 && `${projects} ${projects === 1 ? "project" : "projects"}`,
                          members > 0 && `${members} members`,
                          ...(c.teams?.length || projects > 0 ? [] : c.focus.slice(0, 3)),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-1.5 lg:col-span-1 lg:justify-self-end"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <Split title="How a cohort works">
        <Rows items={format} ordered />
      </Split>

      <DeadlineBand photo={campus.stadium} />
    </>
  );
}
