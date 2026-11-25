import type { Metadata } from "next";
import Link from "next/link";
import { Action } from "@/components/action";
import { cohortGrounds } from "@/components/cohort-cards";
import { CohortGlyph } from "@/components/cohort-glyph";
import { PageHero } from "@/components/page-hero";
import { Closing } from "@/components/section";
import { areas } from "@/content/areas";
import { cohortNumber, cohorts } from "@/content/cohorts";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Cohorts",
  description: `Builders, Investments, Research, and Marketing: the four cohorts of ${site.name}.`,
  alternates: { canonical: "/cohorts" },
};

export default function Cohorts() {
  return (
    <>
      <PageHero title="Four cohorts. One club." action={<Action href="/join">Join the Club</Action>}>
        Builders, Investments, Research, and Marketing. Choose the one that matches what you want to do.
      </PageHero>

      <nav aria-label="Cohorts" className="rule border-t">
        <ul className="shell grid grid-cols-2 lg:grid-cols-4">
          {cohorts.map(({ slug, name }, i) => (
            <li key={slug}>
              <a href={`#${slug}`} className="group flex items-center gap-4 py-6 text-subhead font-semibold">
                <span
                  aria-hidden="true"
                  className="size-2.5 bg-scarlet transition-transform duration-300 group-hover:scale-150"
                />
                <span className="widen">
                  <span className="sr-only">Cohort {cohortNumber(i)}: </span>
                  {name}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {cohorts.map((cohort, i) => {
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
                <p className="font-semibold">Cohort {cohortNumber(i)}</p>
                <h2 id={`${cohort.slug}-title`} className="wide mt-4 text-[clamp(2.5rem,5vw,4.75rem)] leading-none">
                  {cohort.name}
                </h2>
                <p className="mt-5 max-w-[34ch] text-lead font-semibold">{cohort.focus}</p>
                <CohortGlyph slug={cohort.slug} className="mt-10 w-full max-w-96" />
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

      <Closing title="Found your cohort?" href="/join" label="Join the Club" />
    </>
  );
}
