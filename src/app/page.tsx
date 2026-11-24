import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Action, TextLink } from "@/components/action";
import { AreaExplorer } from "@/components/area-explorer";
import { ChainDemo } from "@/components/chain-demo";
import { ChannelList } from "@/components/channel-list";
import { EventKinds, EventList } from "@/components/event-list";
import { OvalScene } from "@/components/oval-scene";
import { OvalStatic } from "@/components/oval-static";
import { ProjectList } from "@/components/project-list";
import { ScrollWords } from "@/components/scroll-words";
import { Cells, Rows } from "@/components/section";
import { collaborate } from "@/content/community";
import { projectKindList, projects } from "@/content/projects";
import { site } from "@/content/site";
import { buildChain } from "@/lib/chain";
import { getEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: { absolute: `${site.name} | Build, learn, research, connect` },
  alternates: { canonical: "/" },
};

const chain = buildChain(["Ada sends Grace 5", "Grace sends Alan 2", "Alan sends Ada 1"]);

const verbs = [
  { title: "Build", text: "Write contracts, apps, and tools with other students, in the open." },
  { title: "Learn", text: "Start from zero or go deeper, with people at every level." },
  { title: "Research", text: "Read the papers, check the claims, and publish what holds up." },
  { title: "Connect", text: "Meet the engineers, founders, and researchers doing this work." },
];

const headline = ["Building the Future of ", "Decentralized ", "Technology."];
const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export default async function Home() {
  const { upcoming } = await getEvents();

  return (
    <>
      <section className="relative overflow-hidden bg-black text-white">
        <div className="shell pointer-events-none relative z-10 flex flex-col pt-10 lg:min-h-[min(60rem,calc(100svh-4.5rem))] lg:pt-10 lg:pb-24">
          <p className="enter flex items-center gap-3 font-semibold tracking-tight lg:text-subhead">
            <span aria-hidden="true" className="size-3 shrink-0 bg-scarlet" />
            {site.name}
          </p>
          <h1 className="wide mt-6 text-hero md:text-hero-wide lg:mt-8">
            {headline.map((line, i) => (
              <span key={line} className="hero-line block md:whitespace-nowrap" style={delay(80 + i * 110)}>
                {line}
              </span>
            ))}
          </h1>
          <div
            data-hero-copy
            className="pointer-events-auto mt-8 max-w-[34rem] lg:mt-auto lg:w-fit lg:max-w-[29rem] lg:pt-8"
          >
            <p className="enter text-lead" style={delay(480)}>
              {site.description}
            </p>
            <div className="enter mt-8 flex flex-wrap gap-3" style={delay(600)}>
              <Action href="/join">Join the Club</Action>
              <Action href="#what-we-do" variant="outline">
                Explore What We Do
              </Action>
            </div>
          </div>
        </div>
        <OvalScene />
      </section>

      <section id="about" aria-labelledby="about-title" className="band">
        <div className="shell">
          <h2 id="about-title" className="sr-only">
            About the club
          </h2>
          <ScrollWords
            className="wide max-w-[24ch] text-[clamp(1.875rem,4.9vw,4.75rem)] leading-[1.04]"
            text="A student community for people who want to understand blockchain by working on it."
          />
          <div className="mt-12 flex flex-wrap items-end justify-between gap-8">
            <p className="muted max-w-[52ch] text-lead">
              Our mission is to build, learn, research, and connect through blockchain technology. There is
              room for people who write protocols, and for people who study markets, policy, or design.
            </p>
            <TextLink href="/about">About the club</TextLink>
          </div>
          <div className="mt-16 lg:mt-24">
            <Cells items={verbs} columns={4} />
          </div>
        </div>
      </section>

      <section id="what-we-do" className="band rule border-t">
        <div className="shell">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-8 lg:mb-20">
            <h2 className="rise wide max-w-[14ch] text-heading">Every area starts with a question.</h2>
            <TextLink href="/what-we-do">What we do</TextLink>
          </div>
          <AreaExplorer />
        </div>
      </section>

      <section className="band rule relative isolate overflow-hidden border-t">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(70rem_36rem_at_50%_110%,#8b0000,transparent_70%)]"
        />
        <div className="shell">
          <div className="mb-14 grid gap-6 lg:mb-20 lg:grid-cols-12">
            <h2 className="rise wide text-heading lg:col-span-7">Change one word. The chain notices.</h2>
            <p className="max-w-[46ch] text-lead lg:col-span-5 lg:self-end">
              These three blocks are hashed with SHA-256 in your browser. Edit any of them, then try to
              cover your tracks.
            </p>
          </div>
          <ChainDemo start={chain} />
        </div>
      </section>

      <section id="projects" className="band bg-white text-black">
        <div className="shell">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-8 lg:mb-16">
            <h2 className="rise wide max-w-[14ch] text-heading">Work you can check.</h2>
            <TextLink href="/projects">All projects</TextLink>
          </div>
          {projects.length > 0 && <ProjectList projects={projects.slice(0, 3)} />}
          <ul className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-3">
            {projectKindList.map(({ title, text }) => (
              <li key={title}>
                <h3 className="text-subhead font-semibold tracking-tight">{title}</h3>
                <p className="muted mt-1 max-w-[36ch]">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="events" className="band">
        <div className="shell">
          <div className="mb-14 grid gap-6 lg:mb-20 lg:grid-cols-12 lg:items-end">
            <h2 className="rise wide text-heading lg:col-span-7">Show up. Build something.</h2>
            <div className="lg:col-span-5">
              {upcoming.length === 0 && (
                <p className="mb-4 max-w-[46ch] text-lead">
                  Nothing is scheduled yet. New events are posted here first, with confirmed dates and
                  locations.
                </p>
              )}
              <TextLink href="/events">All events</TextLink>
            </div>
          </div>
          {upcoming.length > 0 ? <EventList events={upcoming.slice(0, 3)} /> : <EventKinds />}
        </div>
      </section>

      <section id="community" className="band relative isolate overflow-hidden bg-scarlet text-white">
        <OvalStatic className="absolute -top-[25rem] -right-72 -z-10 size-[56rem] text-white/35 max-lg:hidden" />
        <div className="shell">
          <h2 className="rise wide max-w-[13ch] text-title">Nobody builds a network alone.</h2>
          <div className="mt-16 grid gap-x-16 gap-y-14 lg:mt-28 lg:grid-cols-2">
            <div>
              <h3 className="mb-5 font-semibold">Ways to contribute</h3>
              <Rows items={collaborate} heading="h4" />
              <div className="mt-10">
                <Action href="/join" variant="inverse">
                  Join the Club
                </Action>
              </div>
            </div>
            <div>
              <h3 className="mb-5 font-semibold">Where to find us</h3>
              <ChannelList />
            </div>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2">
        <div className="bg-white py-24 text-black pr-[clamp(1.25rem,4vw,4rem)] pl-[calc(max(0px,(100vw-92rem)/2)+clamp(1.25rem,4vw,4rem))] lg:py-36">
          <h2 className="rise wide max-w-[13ch] text-heading">You don’t need experience to start.</h2>
          <p className="muted mt-6 mb-10 max-w-[42ch] text-lead">
            Bring curiosity and a willingness to build. Other members will help with the rest.
          </p>
          <Action href="/join">Join the Club</Action>
        </div>
        <div className="bg-black px-[clamp(1.25rem,4vw,4rem)] py-24 text-white lg:py-36">
          <h2 className="rise wide max-w-[13ch] text-heading">Work with Ohio State students.</h2>
          <p className="muted mt-6 mb-10 max-w-[42ch] text-lead">
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
