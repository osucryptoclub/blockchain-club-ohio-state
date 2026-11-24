import type { Metadata } from "next";
import Link from "next/link";
import { Action, TextLink } from "@/components/action";
import { ChainDemo } from "@/components/chain-demo";
import { EventList } from "@/components/event-list";
import { OvalNetwork } from "@/components/oval-network";
import { ProjectList } from "@/components/project-list";
import { areas } from "@/content/areas";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { buildChain } from "@/lib/chain";
import { getEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: { absolute: `${site.name} | Build, learn, research, connect` },
  alternates: { canonical: "/" },
};

const chain = buildChain(["Ada sends Grace 5", "Grace sends Alan 2", "Alan sends Ada 1"]);

const verbs = [
  { verb: "Build", text: "Write contracts, apps, and tools with other students, in the open." },
  { verb: "Learn", text: "Start from zero or go deeper, with people at every level." },
  { verb: "Research", text: "Read the papers, check the claims, and publish what holds up." },
  { verb: "Connect", text: "Meet the engineers, founders, and researchers doing this work." },
];

export default async function Home() {
  const { upcoming } = await getEvents();

  return (
    <>
      <section className="relative overflow-hidden bg-scarlet text-white">
        <div className="shell pointer-events-none relative z-10 flex flex-col pt-12 lg:min-h-[min(56rem,calc(100svh-4.5rem))] lg:pt-20 lg:pb-28">
          <h1 className="wide text-hero *:pointer-events-auto">
            <span data-hero-line className="block w-fit">Building the </span>
            <span data-hero-line className="block w-fit">Future of Blockchain </span>
            <span data-hero-line className="block w-fit">at Ohio State.</span>
          </h1>
          <div
            data-hero-copy
            className="mt-8 max-w-[34rem] *:pointer-events-auto lg:mt-auto lg:w-fit lg:max-w-[25rem] lg:pt-14"
          >
            <p className="text-lead">{site.description}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Action href="/join" variant="inverse">
                Join the Club
              </Action>
              <Action href="#community" variant="outline">
                Explore Our Community
              </Action>
            </div>
          </div>
        </div>
        <OvalNetwork />
      </section>

      <section id="community" className="band">
        <div className="shell">
          <h2 className="wide max-w-[26ch] text-heading">
            A student community for people who want to understand blockchain by working on it.
          </h2>
          <dl className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {verbs.map(({ verb, text }) => (
              <div key={verb}>
                <dt className="wide text-heading text-scarlet">{verb}</dt>
                <dd className="mt-2 max-w-[34ch] text-gray-600">{text}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-12">
            <TextLink href="/about">About the club</TextLink>
          </p>
        </div>
      </section>

      <section className="band bg-ink text-white">
        <div className="shell">
          <div className="mb-12 grid gap-6 lg:mb-16 lg:grid-cols-12">
            <h2 className="wide text-heading lg:col-span-7">Change one word. The chain notices.</h2>
            <p className="max-w-[46ch] text-gray-400 lg:col-span-5 lg:self-end">
              These three blocks are hashed with SHA-256 in your browser. Edit any of them, then try to
              cover your tracks.
            </p>
          </div>
          <ChainDemo start={chain} />
        </div>
      </section>

      <section className="band">
        <div className="shell">
          <h2 className="wide max-w-[16ch] text-heading">Nine areas. Each starts with a question.</h2>
          <ul className="mt-12 border-t border-ink lg:mt-16">
            {areas.map((area) => (
              <li key={area.slug} className="border-b border-gray-200">
                <Link
                  href={`/what-we-do#${area.slug}`}
                  className="group -mx-5 grid gap-x-10 gap-y-1 px-5 py-5 transition-colors hover:bg-scarlet hover:text-white focus-visible:bg-scarlet focus-visible:text-white lg:grid-cols-2 lg:items-baseline lg:py-6"
                >
                  <span className="text-subhead font-bold tracking-tight">{area.name}</span>
                  <span className="text-gray-600 group-hover:text-white group-focus-visible:text-white">
                    {area.question}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band bg-gray-100">
        <div className="shell grid gap-20 lg:gap-28">
          {projects.length > 0 && (
            <div>
              <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
                <h2 className="wide text-heading">Student work</h2>
                <TextLink href="/projects">All projects</TextLink>
              </div>
              <ProjectList projects={projects.slice(0, 3)} />
            </div>
          )}
          <div>
            <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="wide text-heading">Next events</h2>
              <TextLink href="/events">All events</TextLink>
            </div>
            {upcoming.length > 0 ? (
              <EventList events={upcoming.slice(0, 3)} />
            ) : (
              <p className="max-w-[58ch] text-lead">
                Nothing is scheduled yet. Meetings, workshops, and talks will be posted here with their dates
                and locations.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid text-white lg:grid-cols-2">
        <div className="bg-scarlet py-20 pr-[clamp(1.25rem,4vw,4rem)] pl-[calc(max(0px,(100vw-88rem)/2)+clamp(1.25rem,4vw,4rem))] lg:py-28">
          <h2 className="wide max-w-[13ch] text-heading">You don’t need experience to start.</h2>
          <p className="mt-5 mb-9 max-w-[42ch] text-lead">
            Bring curiosity and a willingness to build. Other members will help with the rest.
          </p>
          <Action href="/join" variant="inverse">
            Join the Club
          </Action>
        </div>
        <div className="bg-scarlet-dark px-[clamp(1.25rem,4vw,4rem)] py-20 lg:py-28">
          <h2 className="wide max-w-[13ch] text-heading">Work with Ohio State students.</h2>
          <p className="mt-5 mb-9 max-w-[42ch] text-lead">
            Sponsor an event, give a talk, or bring a problem to a student team.
          </p>
          <Action href="/sponsors" variant="outline">
            Partner with us
          </Action>
        </div>
      </section>
    </>
  );
}
