import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Action } from "@/components/action";
import { PageHero } from "@/components/page-hero";
import { Closing, Rows, Split } from "@/components/section";
import { cohortStatuses } from "@/content/cohorts";
import { site } from "@/content/site";
import { cohortMembers, cohortProjects, orderedCohorts } from "@/lib/roster";

export const metadata: Metadata = {
  title: "Cohorts",
  description: `Semester-long build cohorts at ${site.name}: who is in them, what they work on, and what they ship.`,
  alternates: { canonical: "/cohorts" },
};

const format = [
  { title: "Apply", text: "Applications open before each semester. Any major, any level of experience." },
  { title: "Join a team", text: "Each cohort splits into small teams that own one part of a real project." },
  { title: "Ship", text: "Work is reviewed like production code and published under the club’s GitHub." },
  { title: "Get credit", text: "Members are named on the cohort page with their team, role, and results." },
];

export default function Cohorts() {
  return (
    <>
      <PageHero title="Cohorts." action={<Action href="/join#apply">Apply to the next cohort</Action>}>
        Each semester, a cohort of members builds something real together, in small teams, in the open.
      </PageHero>

      <section className="band rule border-t">
        <div className="shell">
          <h2 className="rise wide mb-12 text-heading lg:mb-16">Every cohort</h2>
          <ul className="border-t-2 border-current">
            {orderedCohorts.map((c, i) => {
              const members = cohortMembers(c.slug).length;
              const projects = cohortProjects(c.slug).length;
              return (
                <li key={c.slug} className="rule border-b">
                  <Link
                    href={`/cohorts/${c.slug}`}
                    className="group grid gap-x-10 gap-y-4 py-10 lg:grid-cols-12 lg:items-center lg:py-14"
                  >
                    <span className="font-mono text-sm text-gray-400 lg:col-span-1">
                      {String(orderedCohorts.length - i).padStart(2, "0")}
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

      <Closing title="Be in the next one." href="/join#apply" label="See when applications open" />
    </>
  );
}
