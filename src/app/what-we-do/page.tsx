import type { Metadata } from "next";
import { AreaGlyph } from "@/components/area-glyph";
import { PageHero } from "@/components/page-hero";
import { Closing } from "@/components/section";
import { areaGroups, areas } from "@/content/areas";

export const metadata: Metadata = {
  title: "What We Do",
  description:
    "Blockchain development, smart contracts, decentralized apps, Web3 and DeFi, cryptocurrency research, cryptography, zero-knowledge proofs, AI, and startups.",
  alternates: { canonical: "/what-we-do" },
};

export default function WhatWeDo() {
  return (
    <>
      <PageHero title="Many questions, one community.">
        Pick the question that interests you most. Every area is open to members, and they overlap more
        often than not.
      </PageHero>

      {areaGroups.map((group, g) => (
        <section
          key={group.name}
          aria-labelledby={`group-${group.name}`}
          className={`band rule border-t ${g % 2 === 1 ? "bg-coal" : ""}`}
        >
          <div className="shell grid gap-12 lg:grid-cols-12">
            <div className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
              <h2 id={`group-${group.name}`} className="wide text-[clamp(2.375rem,4.6vw,4.5rem)] leading-none">
                {group.name}
              </h2>
              <p className="muted mt-5 max-w-[28ch] text-lead">{group.intro}</p>
            </div>
            <ul className="rule min-w-0 border-t lg:col-span-8">
              {areas
                .filter((a) => a.group === group.name)
                .map((area) => (
                  <li key={area.slug} id={area.slug} className="rule border-b py-10 lg:py-14">
                    <div className="grid gap-x-10 gap-y-6 sm:grid-cols-[minmax(0,1fr)_11rem] xl:grid-cols-[minmax(0,1fr)_14rem]">
                      <div>
                        <h3 className="flex items-center gap-3 font-semibold">
                          <span aria-hidden="true" className="size-2.5 bg-scarlet" />
                          {area.name}
                        </h3>
                        <p className="wide mt-4 max-w-[26ch] text-[clamp(1.5rem,2.6vw,2.375rem)] leading-[1.1] text-balance">
                          {area.question}
                        </p>
                        <p className="muted mt-5 max-w-[62ch]">{area.summary}</p>
                        <p className="mt-4 max-w-[62ch] text-sm">
                          <span className="font-semibold">Where to start: </span>
                          {area.topics.join(", ")}
                        </p>
                      </div>
                      <AreaGlyph
                        slug={area.slug}
                        className="order-first aspect-square w-36 sm:order-none sm:w-full"
                      />
                    </div>
                    {area.code && (
                      <figure className="rule mt-8 border bg-panel">
                        <figcaption className="rule border-b px-5 py-3 text-sm text-gray-400">
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

      <Closing title="Found your question? Come work on it." href="/join" label="Join the Club" />
    </>
  );
}
