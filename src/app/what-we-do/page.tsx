import type { Metadata } from "next";
import { Action } from "@/components/action";
import { PageHero } from "@/components/page-hero";
import { areaGroups, areas } from "@/content/areas";

export const metadata: Metadata = {
  title: "What We Do",
  description:
    "Blockchain development, smart contracts, Web3, digital assets, DeFi, zero-knowledge proofs, research, AI, and startups.",
  alternates: { canonical: "/what-we-do" },
};

export default function WhatWeDo() {
  return (
    <>
      <PageHero title="Nine areas, one community.">
        Pick the question that interests you most. Every area is open to members, and they overlap more
        often than not.
      </PageHero>

      {areaGroups.map((group, g) => (
        <section
          key={group.name}
          aria-labelledby={`group-${group.name}`}
          className={`band ${g % 2 === 1 ? "bg-gray-100" : ""}`}
        >
          <div className="shell grid gap-12 lg:grid-cols-12">
            <div className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
              <h2 id={`group-${group.name}`} className="wide text-[clamp(2.25rem,4vw,3.5rem)] leading-none text-scarlet">
                {group.name}
              </h2>
              <p className="mt-4 max-w-[30ch] text-lead">{group.intro}</p>
            </div>
            <ul className="min-w-0 border-t border-ink lg:col-span-8">
              {areas
                .filter((a) => a.group === group.name)
                .map((area) => (
                  <li key={area.slug} id={area.slug} className="border-b border-gray-200 py-10 lg:py-12">
                    <h3 className="font-semibold text-scarlet">{area.name}</h3>
                    <p className="wide mt-3 max-w-[26ch] text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.1] text-balance">
                      {area.question}
                    </p>
                    <p className="mt-5 max-w-[62ch] text-gray-600">{area.summary}</p>
                    <p className="mt-4 max-w-[62ch] text-sm">
                      <span className="font-semibold">Where to start: </span>
                      {area.topics.join(", ")}
                    </p>
                    {area.code && (
                      <figure className="mt-7 bg-ink text-white">
                        <figcaption className="border-b border-gray-800 px-5 py-3 text-sm text-gray-400">
                          {area.code.caption}
                        </figcaption>
                        <pre
                          tabIndex={0}
                          className="overflow-x-auto p-5 font-mono text-sm leading-relaxed focus-visible:-outline-offset-3"
                        >
                          <code>{area.code.source}</code>
                        </pre>
                      </figure>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        </section>
      ))}

      <section className="bg-scarlet py-20 text-white lg:py-28">
        <div className="shell flex flex-wrap items-end justify-between gap-8">
          <h2 className="wide max-w-[18ch] text-heading">Found your question? Come work on it.</h2>
          <Action href="/join" variant="inverse">
            Join the Club
          </Action>
        </div>
      </section>
    </>
  );
}
