import type { Metadata } from "next";
import { Action, TextLink } from "@/components/action";
import { PageHero, Split } from "@/components/page-hero";
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
        action={
          email && (
            <Action href={`mailto:${email}`} variant="inverse">
              {email}
            </Action>
          )
        }
      >
        {email
          ? "Email is the best way to reach club officers."
          : "Our official email address will be posted here once it is confirmed. Until then, use the open channels below."}
      </PageHero>

      <Split title="What to write about">
        <dl className="border-t border-ink">
          {topics.map(({ title, text }) => (
            <div
              key={title}
              className="grid gap-x-8 gap-y-1 border-b border-gray-200 py-6 sm:grid-cols-[14rem_minmax(0,1fr)_auto] sm:items-baseline"
            >
              <dt className="font-bold">{title}</dt>
              <dd className="text-gray-600">{text}</dd>
              {email && (
                <dd>
                  <a href={`mailto:${email}?subject=${encodeURIComponent(title)}`} className="link font-semibold">
                    Email us
                  </a>
                </dd>
              )}
            </div>
          ))}
        </dl>
      </Split>

      <Split title="Elsewhere" className="bg-gray-100">
        <ul className="border-t border-ink">
          <li className="grid gap-x-8 gap-y-1 border-b border-gray-200 py-5 sm:grid-cols-[14rem_minmax(0,1fr)]">
            <h3 className="font-bold">Email</h3>
            {email ? <a href={`mailto:${email}`} className="link">{email}</a> : <p className="text-gray-600">Coming soon</p>}
          </li>
          {site.channels.map((c) => (
            <li
              key={c.id}
              className="grid gap-x-8 gap-y-1 border-b border-gray-200 py-5 sm:grid-cols-[14rem_minmax(0,1fr)]"
            >
              <h3 className="font-bold">{c.label}</h3>
              {c.url ? (
                <p>
                  <TextLink href={c.url}>Open {c.label}</TextLink>
                </p>
              ) : (
                <p className="text-gray-600">Coming soon</p>
              )}
            </li>
          ))}
        </ul>
      </Split>
    </>
  );
}
