import type { Metadata } from "next";
import Image from "next/image";
import { Action } from "@/components/action";
import { PageHero, Split } from "@/components/page-hero";
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
        action={
          <Action href="/contact" variant="inverse">
            Start a conversation
          </Action>
        }
      >
        Companies, protocols, and funds can support students who are serious about this technology, and get to
        know their work early.
      </PageHero>

      <Split title="Ways to work together">
        <dl className="border-t border-ink">
          {partnerships.map(({ title, body }) => (
            <div key={title} className="grid gap-x-8 gap-y-2 border-b border-gray-200 py-8 sm:grid-cols-[14rem_minmax(0,1fr)]">
              <dt className="wide text-subhead">{title}</dt>
              <dd className="max-w-[56ch] text-gray-600">{body}</dd>
            </div>
          ))}
        </dl>
      </Split>

      <Split title="Our sponsors" className="bg-gray-100">
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

      <section className="bg-scarlet py-20 text-white lg:py-28">
        <div className="shell flex flex-wrap items-end justify-between gap-8">
          <h2 className="wide max-w-[18ch] text-heading">Tell us what you’re working on.</h2>
          <Action href="/contact" variant="inverse">
            Contact the club
          </Action>
        </div>
      </section>
    </>
  );
}
