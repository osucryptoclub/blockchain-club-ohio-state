import type { Metadata } from "next";
import { Action } from "@/components/action";
import { PageHero } from "@/components/page-hero";
import { ScrollWords } from "@/components/scroll-words";
import { Band, Cells, Closing, Rows, Split } from "@/components/section";
import { campus } from "@/content/campus";
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
        photo={campus.universityHall}
        action={<Action href="/join">Join the Club</Action>}
      >
        {site.name} brings together students, developers, researchers, and founders who are interested in
        blockchain, Web3, smart contracts, and decentralized systems.
      </PageHero>

      <Split title="Our mission">
        <ScrollWords
          className="wide text-heading"
          text="Build, learn, research, and connect through blockchain technology."
        />
        <p className="muted mt-8 max-w-[62ch] text-lead">
          There is room here for people who write protocols and contracts, and for people who study markets,
          policy, cryptography, or design. What ties it together is wanting to understand how these systems
          work before deciding what to think of them.
        </p>
      </Split>

      <Split title="Why blockchain matters" tone="scarlet">
        <div className="grid max-w-[62ch] gap-6">
          <p className="text-lead">
            Most shared records depend on one organization keeping them honest. Blockchains let people who
            don’t know or trust each other keep a record together, and let anyone verify it.
          </p>
          <p>
            That makes new things possible: money that settles in minutes across borders, software that
            cannot be quietly changed, and proof of a fact without handing over the data behind it.
          </p>
          <p>
            It also brings real costs in speed, complexity, security, and misuse. Studying the trade-offs
            honestly is part of the work.
          </p>
        </div>
      </Split>

      <Split title="What you gain">
        <Rows items={gains} />
      </Split>

      <Band title="What we commit to">
        <Cells items={commitments} />
      </Band>

      <Closing title="Come see how it works." href="/join" label="Join the Club" />
    </>
  );
}
