import type { Metadata } from "next";
import { Action } from "@/components/action";
import { ChannelList } from "@/components/channel-list";
import { PageHero } from "@/components/page-hero";
import { Rows, Split } from "@/components/section";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name}.`,
  alternates: { canonical: "/contact" },
};

const topics = [
  { title: "Membership", text: "Questions about joining, meetings, or getting started." },
  { title: "Sponsorship", text: "Funding events, hackathons, or student projects." },
  { title: "Speaking", text: "Giving a talk or running a workshop." },
  { title: "Press and research", text: "Interviews, data, and academic collaboration." },
];

export default function Contact() {
  const { email } = site;
  return (
    <>
      <PageHero
        title="Get in touch."
        action={email && <Action href={`mailto:${email}`}>{email}</Action>}
      >
        {email
          ? "Email is the best way to reach club officers."
          : "Our official email address will be posted here once it is confirmed. Until then, use the open channels below."}
      </PageHero>

      <Split title="What to write about">
        <Rows items={topics} />
        {email && (
          <p className="mt-10">
            <Action href={`mailto:${email}`}>Email us</Action>
          </p>
        )}
      </Split>

      <Split title="Where to find us" tone="scarlet">
        <ChannelList />
      </Split>
    </>
  );
}
