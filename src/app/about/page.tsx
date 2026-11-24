import type { Metadata } from "next";
import { Action } from "@/components/action";
import { PageHero, Split } from "@/components/page-hero";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: `Who we are, what we are here to do, and why blockchain is worth studying. ${site.name}.`,
  alternates: { canonical: "/about" },
};

const gains = [
  {
    title: "Working code",
    text: "Projects you can show, with the commits and reviews that went into them.",
  },
  {
    title: "Technical judgment",
    text: "The ability to read a protocol, find its assumptions, and say whether it needs a chain at all.",
  },
  {
    title: "Collaborators",
    text: "Engineers, designers, economists, and writers who are working on the same problems.",
  },
  {
    title: "A way into the field",
    text: "Conversations with people who work in it, and practice explaining what you know.",
  },
];

const commitments = [
  {
    title: "Education",
    text: "Teach from first principles. Nobody should need to trust a claim they could check.",
  },
  {
    title: "Innovation",
    text: "Try things that might not work, and write down what happened either way.",
  },
  {
    title: "Collaboration",
    text: "Share code, credit, and questions across majors and experience levels.",
  },
];

export default function About() {
  return (
    <>
      <PageHero
        title="Students building what comes next."
        action={
          <Action href="/join" variant="inverse">
            Join the Club
          </Action>
        }
      >
        {site.name} brings together students, developers, researchers, and founders who are interested in
        blockchain, Web3, smart contracts, and decentralized systems.
      </PageHero>

      <Split title="Our mission">
        <p className="wide text-subhead lg:text-heading">
          Build, learn, research, and connect through blockchain technology.
        </p>
        <p className="mt-6 max-w-[62ch] text-gray-600">
          There is room here for people who write protocols and contracts, and for people who study markets,
          policy, cryptography, or design. What ties it together is wanting to understand how these systems
          work before deciding what to think of them.
        </p>
      </Split>

      <Split title="Why blockchain matters" className="bg-ink text-white">
        <div className="grid max-w-[62ch] gap-6">
          <p className="text-lead">
            Most shared records depend on one organization keeping them honest. Blockchains let people who
            don’t know or trust each other keep a record together, and let anyone verify it.
          </p>
          <p className="text-gray-400">
            That makes new things possible: money that settles in minutes across borders, software that
            cannot be quietly changed, and proof of a fact without handing over the data behind it.
          </p>
          <p className="text-gray-400">
            It also brings real costs in speed, complexity, security, and misuse. Studying the trade-offs
            honestly is part of the work.
          </p>
        </div>
      </Split>

      <Split title="What you gain">
        <dl className="border-t border-ink">
          {gains.map(({ title, text }) => (
            <div key={title} className="grid gap-x-8 gap-y-1 border-b border-gray-200 py-6 sm:grid-cols-[14rem_minmax(0,1fr)]">
              <dt className="font-bold">{title}</dt>
              <dd className="text-gray-600">{text}</dd>
            </div>
          ))}
        </dl>
      </Split>

      <section className="band bg-gray-100">
        <div className="shell">
          <h2 className="wide text-heading">What we commit to</h2>
          <dl className="mt-12 grid gap-10 md:grid-cols-3">
            {commitments.map(({ title, text }) => (
              <div key={title} className="border-t-4 border-scarlet pt-5">
                <dt className="wide text-subhead">{title}</dt>
                <dd className="mt-2 max-w-[36ch] text-gray-600">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
