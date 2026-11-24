import type { Metadata } from "next";
import { TextLink } from "@/components/action";
import { Mark } from "@/components/logo";
import { PageHero } from "@/components/page-hero";
import { PeopleGrid, PersonCard } from "@/components/person-card";
import { Closing } from "@/components/section";
import { site } from "@/content/site";
import { team } from "@/content/team";
import { groupMembers, orderedCohorts } from "@/lib/roster";

export const metadata: Metadata = {
  title: "Team",
  description: `The students who lead ${site.name}.`,
  alternates: { canonical: "/team" },
};

export default function Team() {
  const groups = team.map((group) => ({ group, members: groupMembers(group.id) }));
  const announced = groups.some((g) => g.members.length > 0);
  return (
    <>
      <PageHero title="Run by students.">
        The club is led and organized by its members.
        {!announced && " Names will be added here once this year’s roles are confirmed."}
      </PageHero>

      <section className="band rule border-t">
        <div className="shell">
          <h2 className="sr-only">Leadership and teams</h2>
          <ul className="rule grid border-t border-l md:grid-cols-2">
            {groups.map(({ group, members }) => (
              <li
                key={group.id}
                className={`rule flex flex-col justify-between gap-8 border-r border-b p-6 md:min-h-64 lg:p-8 ${members.length > 0 ? "md:col-span-2" : ""}`}
              >
                <div>
                  <h3 className="wide text-cell">{group.name}</h3>
                  <p className="muted mt-3 max-w-[40ch]">{group.responsibility}</p>
                </div>
                {members.length > 0 ? (
                  <PeopleGrid>
                    {members.map((m) => (
                      <PersonCard key={m.id} person={m} role={m.team?.role} />
                    ))}
                  </PeopleGrid>
                ) : (
                  <p className="flex items-center gap-4">
                    <Mark className="h-6 w-9 text-scarlet" />
                    {group.placeholder ?? "To be announced"}
                  </p>
                )}
              </li>
            ))}
            <li className="rule flex flex-col justify-between gap-8 border-r border-b p-6 md:col-span-2 md:min-h-48 lg:p-8">
              <div>
                <h3 className="wide text-cell">Cohort members</h3>
                <p className="muted mt-3 max-w-[56ch]">
                  Everyone building in a cohort is recognized on that cohort’s page, with their team and their work.
                </p>
              </div>
              <p className="flex flex-wrap gap-x-8 gap-y-3">
                {orderedCohorts.map((c) => (
                  <TextLink key={c.slug} href={`/cohorts/${c.slug}`}>
                    {c.name}, {c.term}
                  </TextLink>
                ))}
              </p>
            </li>
          </ul>
        </div>
      </section>

      <Closing title="Want to help run it?" href="/join" label="Join the Club" />
    </>
  );
}
