import type { Metadata } from "next";
import { Action } from "@/components/action";
import { PageHero } from "@/components/page-hero";
import { Band, Cells, Closing } from "@/components/section";
import { SponsorGrid } from "@/components/sponsor-grid";
import { site } from "@/content/site";
import { partnerships, sponsors } from "@/content/sponsors";

export const metadata: Metadata = {
  title: "Sponsors & Partners",
  description: `Sponsor, speak, recruit, or collaborate with ${site.name}.`,
  alternates: { canonical: "/sponsors" },
};

export default function Sponsors() {
  return (
    <>
      <PageHero
        title="Back the next builders."
        action={<Action href="/contact">Start a conversation</Action>}
      >
        Companies, protocols, and funds can support students who are serious about this technology, and get to
        know their work early.
      </PageHero>

      <section className="band bg-white text-black">
        <div className="shell">
          <div className="mb-12 grid gap-6 lg:mb-16 lg:grid-cols-12 lg:items-end">
            <h2 className="rise wide text-heading lg:col-span-7">Sponsors &amp; partners</h2>
            <p className="muted max-w-[46ch] text-lead lg:col-span-5">
              The organizations that support our students, events, and travel.
            </p>
          </div>
          {sponsors.length > 0 ? (
            <SponsorGrid sponsors={sponsors} />
          ) : (
            <p className="max-w-[50ch] text-lead">
              We haven’t announced any sponsors yet. Organizations that support the club will be recognized here.
            </p>
          )}
        </div>
      </section>

      <Band title="Ways to work together">
        <Cells columns={2} items={partnerships.map(({ title, body }) => ({ title, text: body }))} />
      </Band>

      <Closing title="Tell us what you’re working on." href="/contact" label="Contact the club" />
    </>
  );
}
