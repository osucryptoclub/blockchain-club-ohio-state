import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Action } from "@/components/action";
import { cohortGrounds } from "@/components/cohort-cards";
import { CohortBadge } from "@/components/cohort-logo";
import { PageHero } from "@/components/page-hero";
import { Closing } from "@/components/section";
import { labs } from "@/content/labs";
import { site } from "@/content/site";
import { tracks } from "@/content/tracks";

export const metadata: Metadata = {
  title: "Labs",
  description: `Four hands-on experiments from ${site.name}: rob a vault, move a market, prove a secret, and spread a message.`,
  alternates: { canonical: "/labs" },
};

export default function Labs() {
  return (
    <>
      <PageHero title="Don’t read about it. Break it." action={<Action href={`/labs/${labs[0].slug}`}>Start the first lab</Action>}>
        Four experiments, one from each cohort. They run in your browser, they take a few minutes, and nothing
        here uses real money.
      </PageHero>

      <section className="band rule border-t">
        <ul className="shell grid gap-3 lg:grid-cols-2">
          {labs.map((lab) => {
            const track = tracks.find((t) => t.slug === lab.slug);
            return (
              <li key={lab.slug} className="rise">
                <Link
                  href={`/labs/${lab.slug}`}
                  data-tilt=""
                  className={`group relative isolate flex h-full min-h-96 flex-col justify-between gap-12 overflow-hidden border border-white/12 p-6 hover:border-white/50 focus-visible:border-white/50 lg:p-9 ${cohortGrounds[lab.slug]}`}
                >
                  <span className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-4">
                      <CohortBadge slug={lab.slug} />
                      <span className="text-sm font-semibold">
                        {track?.name}
                        <span className="block font-normal text-white/75">About {lab.minutes} minutes</span>
                      </span>
                    </span>
                    <ArrowRight aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <span className="block">
                    <span className="wide block text-heading">{lab.title}</span>
                    <span className="mt-4 block max-w-[48ch] text-lead text-white/85">{lab.hook}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Closing title="Not sure where you fit?" href="/find-your-cohort" label="Find your cohort" />
    </>
  );
}
