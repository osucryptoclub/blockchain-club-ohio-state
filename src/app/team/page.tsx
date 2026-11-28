import type { Metadata } from "next";
import { TextLink } from "@/components/action";
import { CohortCards } from "@/components/cohort-cards";
import { LeaderCards } from "@/components/leader-cards";
import { Mark } from "@/components/logo";
import { PageHero } from "@/components/page-hero";
import { PeopleGrid, PersonCard } from "@/components/person-card";
import { Band, Closing } from "@/components/section";
import { site } from "@/content/site";
import { team } from "@/content/team";
import { groupMembers, orderedCohorts } from "@/lib/roster";

export const metadata: Metadata = {
  title: "Team",
  description: `The students who lead ${site.name}, and the cohorts that make it up.`,
  alternates: { canonical: "/team" },
};

/** The president and vice presidents have their own cards above. */
const officers = new Set(["president", "vice-president"]);

export default function Team() {
  const groups = team.filter((g) => !officers.has(g.id)).map((group) => ({ group, members: groupMembers(group.id) }));
  return (
    <>
      <PageHero title="Run by students.">
        Student officers lead the club, and its work happens in four cohorts.
      </PageHero>

      <Band title="Leadership">
        <LeaderCards />
      </Band>

      <Band title="Teams">
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
                <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <Mark className="h-6 w-9 text-scarlet" />
                  <span className="muted">{group.placeholder ?? "Names posted once confirmed."}</span>
                  <TextLink href="/contact">Want this role? Get in touch</TextLink>
                </p>
              )}
            </li>
          ))}
          <li className="rule flex flex-col justify-between gap-8 border-r border-b p-6 md:min-h-64 lg:p-8">
            <div>
              <h3 className="wide text-cell">Cohort members</h3>
              <p className="muted mt-3 max-w-[40ch]">
                Recognized on their cohort’s page, with their team and their work.
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
      </Band>

      <Band title="Four cohorts">
        <CohortCards />
      </Band>

      <Closing title="Want to help run it?" href="/join" label="Join the Club" />
    </>
  );
}
