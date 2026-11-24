import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Action, TextLink } from "@/components/action";
import { Mark } from "@/components/logo";
import { PageHero } from "@/components/page-hero";
import { PeopleGrid, PersonCard } from "@/components/person-card";
import { ProjectList } from "@/components/project-list";
import { Band, Cells, Closing, Split } from "@/components/section";
import { cohorts, cohortStatuses } from "@/content/cohorts";
import { site } from "@/content/site";
import { cohortMembers, cohortProjects, cohortRole, getCohort } from "@/lib/roster";

export function generateStaticParams() {
  return cohorts.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/cohorts/[slug]">): Promise<Metadata> {
  const cohort = getCohort((await params).slug);
  if (!cohort) return {};
  return {
    title: `${cohort.name} cohort, ${cohort.term}`,
    description: `${cohort.summary} ${site.name}.`,
    alternates: { canonical: `/cohorts/${cohort.slug}` },
  };
}

export default async function CohortPage({ params }: PageProps<"/cohorts/[slug]">) {
  const cohort = getCohort((await params).slug);
  if (!cohort) notFound();

  const members = cohortMembers(cohort.slug);
  const projects = cohortProjects(cohort.slug);
  const stats = [
    { label: "Status", value: cohortStatuses[cohort.status] },
    cohort.teams?.length
      ? { label: "Teams", value: String(cohort.teams.length) }
      : { label: "Focus areas", value: String(cohort.focus.length) },
    { label: "Projects", value: projects.length > 0 ? String(projects.length) : "Coming soon" },
    { label: "Members", value: members.length > 0 ? String(members.length) : "Listing soon" },
  ];

  return (
    <>
      <PageHero
        title={`${cohort.name}, ${cohort.term}.`}
        action={
          projects[0] ? (
            <Action href="#projects">See what they’re building</Action>
          ) : (
            <Action href="/join#apply">Apply to a cohort</Action>
          )
        }
      >
        {cohort.summary}
      </PageHero>

      <section className="pt-16 lg:pt-24">
        <dl className="shell">
          <div className="rule grid grid-cols-2 border-t border-l lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rule border-r border-b p-5 lg:p-8">
                <dt className="font-mono text-xs tracking-wider text-gray-400 uppercase">{s.label}</dt>
                <dd className="wide mt-3 text-cell">{s.value}</dd>
              </div>
            ))}
          </div>
        </dl>
      </section>

      <Split title="Focus">
        <ul className="flex flex-wrap gap-3">
          {cohort.focus.map((f) => (
            <li key={f} className="rule flex items-center gap-3 border px-5 py-3 text-subhead">
              <span aria-hidden="true" className="size-2.5 bg-scarlet" />
              {f}
            </li>
          ))}
        </ul>
        {cohort.activities && (
          <>
            <h3 className="mt-14 mb-4 font-semibold">Activities</h3>
            <ul className="rule border-t">
              {cohort.activities.map((a) => (
                <li key={a} className="rule border-b py-4 text-lead">
                  {a}
                </li>
              ))}
            </ul>
          </>
        )}
      </Split>

      {cohort.teams && cohort.teams.length > 0 && (
        <Band title="Teams">
          <Cells
            columns={cohort.teams.length >= 3 ? 3 : 2}
            items={cohort.teams.map((t) => ({ title: t.name, text: t.focus }))}
          />
        </Band>
      )}

      <Band title="Members" tone="paper">
        {members.length > 0 ? (
          <PeopleGrid>
            {members.map((m) => (
              <PersonCard key={m.id} person={m} role={cohortRole(m, cohort.slug)} />
            ))}
          </PeopleGrid>
        ) : (
          <p className="flex max-w-[56ch] items-center gap-4 text-lead">
            <Mark className="h-6 w-9 shrink-0 text-scarlet" />
            Members are listed here as they confirm how they’d like to be credited.
          </p>
        )}
      </Band>

      {projects.length > 0 && (
        <section id="projects" className="band rule border-t">
          <div className="shell">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-8 lg:mb-16">
              <h2 className="rise wide text-heading">Projects</h2>
              <TextLink href="/projects">All projects</TextLink>
            </div>
            <ProjectList projects={projects} />
          </div>
        </section>
      )}

      {cohort.achievements && cohort.achievements.length > 0 && (
        <Split title="Achievements">
          <ul className="rule border-t">
            {cohort.achievements.map((a) => (
              <li key={a} className="rule flex items-baseline gap-5 border-b py-6 text-subhead">
                <span aria-hidden="true" className="size-2.5 shrink-0 bg-scarlet" />
                {a}
              </li>
            ))}
          </ul>
        </Split>
      )}

      <Closing title="Want in on the next cohort?" href="/join#apply" label="See when applications open" />
    </>
  );
}
