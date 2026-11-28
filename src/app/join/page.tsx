import type { Metadata } from "next";
import { Action } from "@/components/action";
import { ChannelList } from "@/components/channel-list";
import { Countdown } from "@/components/countdown";
import { PageHero } from "@/components/page-hero";
import { ScrollWords } from "@/components/scroll-words";
import { Band, Cells, Rows, Split } from "@/components/section";
import { applications } from "@/content/applications";
import { campus } from "@/content/campus";
import { collaborate, eligibility, joinSteps as steps, learning, reasons } from "@/content/community";
import { channel, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Join the Club",
  description: `How to join ${site.name}. Open to students of any major and experience level.`,
  alternates: { canonical: "/join" },
};

export default function Join() {
  const discord = channel("discord");
  return (
    <>
      <PageHero
        title="Join the Club."
        photo={campus.rotunda}
        action={
          <>
            <Action href="#apply">Apply to a cohort</Action>
            <Action href="/find-your-cohort" variant="outline">
              Find your cohort
            </Action>
            {discord.url ? (
              <Action href={discord.url} variant="outline">
                Join our Discord
              </Action>
            ) : (
              <Action href="#channels" variant="outline">
                See where to find us
              </Action>
            )}
          </>
        }
      >
        Learn how decentralized technology works by building it with other Ohio State students.
      </PageHero>

      <Split id="apply" title="Apply to a cohort" tone="scarlet">
        <Countdown apps={applications} />
      </Split>

      <Split title="How it works">
        <Rows items={steps} ordered />
      </Split>

      <Band title="Why join">
        <Cells items={reasons} />
      </Band>

      <Split title="Who can join" tone="paper">
        <ScrollWords
          className="wide text-heading"
          text={eligibility.who}
        />
        <p className="muted mt-8 max-w-[58ch] text-lead">
          {eligibility.detail}
        </p>
      </Split>

      <Split title="What you’ll learn">
        <ul className="rule border-t">
          {learning.map((item) => (
            <li key={item} className="rise rule flex items-baseline gap-5 border-b py-6 text-subhead">
              <span aria-hidden="true" className="size-2.5 shrink-0 bg-scarlet" />
              {item}
            </li>
          ))}
        </ul>
      </Split>

      <Split title="Ways to contribute">
        <Rows items={collaborate} />
      </Split>

      <Split id="channels" title="Where to find us" tone="paper">
        <ChannelList />
      </Split>
    </>
  );
}
