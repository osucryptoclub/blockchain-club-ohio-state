import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Action, TextLink } from "@/components/action";
import { CohortBadge } from "@/components/cohort-logo";
import { Lab } from "@/components/labs/lab";
import { PageHero } from "@/components/page-hero";
import { Closing, Split } from "@/components/section";
import { getLab, labs } from "@/content/labs";
import { site } from "@/content/site";
import { tracks } from "@/content/tracks";

export function generateStaticParams() {
  return labs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/labs/[slug]">): Promise<Metadata> {
  const lab = getLab((await params).slug);
  if (!lab) return {};
  return {
    title: lab.title.replace(/\.$/, ""),
    description: `${lab.hook} A hands-on lab from ${site.name}.`,
    alternates: { canonical: `/labs/${lab.slug}` },
  };
}

export default async function LabPage({ params }: PageProps<"/labs/[slug]">) {
  const lab = getLab((await params).slug);
  if (!lab) notFound();
  const track = tracks.find((t) => t.slug === lab.slug);
  const next = labs[(labs.indexOf(lab) + 1) % labs.length];

  return (
    <>
      <PageHero title={lab.title} action={<Action href="#lab">Start</Action>}>
        {lab.hook}
      </PageHero>

      <section id="lab" aria-labelledby="lab-title" className="band rule scroll-mt-16 border-t bg-[radial-gradient(70rem_40rem_at_50%_120%,#5c0000,transparent_70%)]">
        <div className="shell">
          <h2 id="lab-title" className="mb-8 flex items-center gap-5">
            <CohortBadge slug={lab.slug} className="size-16" />
            <span className="text-subhead font-semibold">{track?.name} lab</span>
          </h2>
          <Lab slug={lab.slug} />
        </div>
      </section>

      <Split title="What you just saw" tone="paper">
        <p className="wide max-w-[30ch] text-[clamp(1.5rem,2.6vw,2.375rem)] leading-tight">{lab.lesson}</p>
        <p className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          <TextLink href={`/cohorts#${lab.slug}`}>{`The ${track?.name} cohort`}</TextLink>
          <TextLink href="/labs">All labs</TextLink>
        </p>
      </Split>

      <Closing title={next.title} href={`/labs/${next.slug}`} label="Next lab" />
    </>
  );
}
