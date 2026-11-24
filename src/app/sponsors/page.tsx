import type { Metadata } from "next";
import Image from "next/image";
import { Action } from "@/components/action";
import { PageHero } from "@/components/page-hero";
import { Band, Cells, Closing, Split } from "@/components/section";
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

      <Band title="Ways to work together">
        <Cells columns={2} items={partnerships.map(({ title, body }) => ({ title, text: body }))} />
      </Band>

      <Split title="Our sponsors" tone="paper">
        {sponsors.length > 0 ? (
          <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {sponsors.map((s) => (
              <li key={s.name}>
                <a href={s.url} rel="noopener sponsored" className="flex min-h-24 items-center">
                  {s.logo ? (
                    <Image
                      src={s.logo}
                      alt={s.name}
                      width={280}
                      height={96}
                      unoptimized
                      className="h-16 w-auto max-w-full object-contain"
                    />
                  ) : (
                    <span className="wide text-subhead">{s.name}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="max-w-[50ch] text-lead">
            We haven’t announced any sponsors yet. Organizations that support the club will be recognized here.
          </p>
        )}
      </Split>

      <Closing title="Tell us what you’re working on." href="/contact" label="Contact the club" />
    </>
  );
}
