import type { Metadata } from "next";
import { Action } from "@/components/action";
import { EventList } from "@/components/event-list";
import { JsonLd } from "@/components/json-ld";
import { PageHero, Split } from "@/components/page-hero";
import { eventTypes } from "@/content/events";
import { site } from "@/content/site";
import { getEvents } from "@/lib/events";
import { siteUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "Events",
  description: `Meetings, workshops, talks, hackathons, and networking with ${site.name}.`,
  alternates: { canonical: "/events" },
};

export default async function Events() {
  const { upcoming, past } = await getEvents();

  return (
    <>
      <PageHero title={"Show up. Build\u00a0something."}>
        Meetings, workshops, talks, and hackathons. Each listing has the date, the place, and what to expect.
      </PageHero>

      <Split title="Upcoming">
        {upcoming.length > 0 ? (
          <EventList events={upcoming} />
        ) : (
          <>
            <p className="max-w-[50ch] text-lead">
              Nothing is scheduled yet. New events are posted here first, with confirmed dates and locations.
            </p>
            <div className="mt-8">
              <Action href="/join">See how to join</Action>
            </div>
          </>
        )}
      </Split>

      <Split title="Kinds of events" className="bg-gray-100">
        <dl className="border-t border-ink">
          {Object.entries(eventTypes).map(([key, { label, description }]) => (
            <div key={key} className="grid gap-x-8 gap-y-1 border-b border-gray-200 py-6 sm:grid-cols-[14rem_minmax(0,1fr)]">
              <dt className="font-bold">{label}</dt>
              <dd className="text-gray-600">{description}</dd>
            </div>
          ))}
        </dl>
      </Split>

      {past.length > 0 && (
        <Split title="Past">
          <EventList events={past} />
        </Split>
      )}

      {upcoming.map((e) => (
        <JsonLd
          key={e.slug}
          data={{
            "@context": "https://schema.org",
            "@type": "Event",
            name: e.title,
            startDate: e.start,
            endDate: e.end,
            description: e.summary,
            location: { "@type": "Place", name: e.location },
            organizer: { "@type": "Organization", name: site.name, url: siteUrl },
            url: e.url ?? `${siteUrl}/events#${e.slug}`,
          }}
        />
      ))}
    </>
  );
}
