import type { Metadata } from "next";
import { Action, TextLink } from "@/components/action";
import { PageHero, Split } from "@/components/page-hero";
import { channel, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Join the Club",
  description: `How to join ${site.name}. Open to students of any major and experience level.`,
  alternates: { canonical: "/join" },
};

const reasons = [
  { title: "Build with other people", text: "Join a project in progress or find collaborators for yours." },
  { title: "Get past the hype", text: "Learn how the systems work well enough to judge them yourself." },
  { title: "Meet the field", text: "Get to know the engineers, founders, and researchers doing this work." },
];

const learning = [
  "How blocks, hashes, and consensus fit together",
  "How to write, test, and review a smart contract",
  "How to connect a web app to a wallet and a chain",
  "How to read a whitepaper and find its weak points",
  "How DeFi, stablecoins, and token economies behave",
  "What zero-knowledge proofs can and cannot do",
];

const collaborate = [
  { title: "Code", text: "Contribute to club software, hackathon teams, and open-source projects." },
  { title: "Research", text: "Write protocol analyses, gather data, and review each other’s work." },
  { title: "Community", text: "Plan events, design materials, and work with partners." },
];

export default function Join() {
  const discord = channel("discord");
  return (
    <>
      <PageHero
        title="Join the Club."
        action={
          discord.url ? (
            <Action href={discord.url} variant="inverse">
              Join our Discord
            </Action>
          ) : (
            <Action href="#channels" variant="inverse">
              See where to find us
            </Action>
          )
        }
      >
        Learn how decentralized technology works by building it with other Ohio State students.
      </PageHero>

      <section className="band">
        <div className="shell">
          <h2 className="wide text-heading">Why join</h2>
          <dl className="mt-12 grid gap-10 md:grid-cols-3">
            {reasons.map(({ title, text }) => (
              <div key={title} className="border-t-4 border-scarlet pt-5">
                <dt className="wide text-subhead">{title}</dt>
                <dd className="mt-2 max-w-[36ch] text-gray-600">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Split title="Who can join" className="bg-ink text-white">
        <p className="wide text-subhead lg:text-heading">
          Ohio State students of any major, any year, and any level of experience.
        </p>
        <p className="mt-6 max-w-[58ch] text-gray-400">
          You don’t need to know how to code, and you don’t need to own any cryptocurrency. Developers,
          designers, economists, writers, and skeptics all have work to do here.
        </p>
      </Split>

      <Split title="What you’ll learn">
        <ul className="border-t border-ink">
          {learning.map((item) => (
            <li key={item} className="border-b border-gray-200 py-5 text-lead">
              {item}
            </li>
          ))}
        </ul>
      </Split>

      <Split title="Ways to contribute" className="bg-gray-100">
        <dl className="border-t border-ink">
          {collaborate.map(({ title, text }) => (
            <div key={title} className="grid gap-x-8 gap-y-1 border-b border-gray-200 py-6 sm:grid-cols-[14rem_minmax(0,1fr)]">
              <dt className="font-bold">{title}</dt>
              <dd className="text-gray-600">{text}</dd>
            </div>
          ))}
        </dl>
      </Split>

      <section id="channels" className="band bg-scarlet text-white">
        <div className="shell grid gap-8 lg:grid-cols-12">
          <h2 className="wide text-heading lg:col-span-5">Where to find us</h2>
          <ul className="border-t border-white lg:col-span-7">
            {site.channels.map((c) => (
              <li
                key={c.id}
                className="grid gap-x-8 gap-y-1 border-b border-white/40 py-5 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-baseline"
              >
                <h3 className="text-subhead font-bold">{c.label}</h3>
                <p>{c.purpose}</p>
                <p>{c.url ? <TextLink href={c.url}>Open {c.label}</TextLink> : "Link coming soon"}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
