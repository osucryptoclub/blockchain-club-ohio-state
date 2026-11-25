import type { Metadata } from "next";
import { CohortCards } from "@/components/cohort-cards";
import { LeaderCards } from "@/components/leader-cards";
import { PageHero } from "@/components/page-hero";
import { Band, Closing } from "@/components/section";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Team",
  description: `The students who lead ${site.name}, and the four cohorts that make it up.`,
  alternates: { canonical: "/team" },
};

export default function Team() {
  return (
    <>
      <PageHero title="Run by students.">
        Student officers lead the club, and its work happens in four cohorts.
      </PageHero>

      <Band title="Leadership">
        <LeaderCards />
      </Band>

      <Band title="Four cohorts">
        <CohortCards />
      </Band>

      <Closing title="Want to help run it?" href="/join" label="Join the Club" />
    </>
  );
}
