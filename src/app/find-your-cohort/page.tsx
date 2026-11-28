import type { Metadata } from "next";
import { CohortFinder } from "@/components/cohort-finder";
import { Closing } from "@/components/section";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Find Your Cohort",
  description: `Six questions that point you to Builders, Investments, Research, or Marketing at ${site.name}.`,
  alternates: { canonical: "/find-your-cohort" },
};

export default function FindYourCohort() {
  return (
    <>
      <section className="relative isolate flex min-h-[calc(100svh-4.5rem)] items-center overflow-hidden bg-[radial-gradient(60rem_40rem_at_85%_100%,#5c0000,transparent_72%)] py-16 lg:py-24">
        <div className="shell">
          <h1 className="mb-8 text-subhead font-semibold">Find your cohort</h1>
          <CohortFinder />
        </div>
      </section>
      <Closing title="Ready to apply?" href="/join#apply" label="See when applications open" />
    </>
  );
}
