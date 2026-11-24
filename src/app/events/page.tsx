import type { Metadata } from "next";
import { Action } from "@/components/action";
import { EventKinds, EventList } from "@/components/event-list";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { Band } from "@/components/section";
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

      <Band title="Upcoming">
        {upcoming.length > 0 ? (
          <EventList events={upcoming} />
        ) : (
          <div className="rule flex flex-wrap items-end justify-between gap-10 border bg-coal p-6 lg:p-12">
            <p className="wide max-w-[26ch] text-[clamp(1.5rem,2.6vw,2.5rem)] leading-tight">
              Nothing is scheduled yet. New events are posted here first, with confirmed dates and locations.
            </p>
            <Action href="/join">See how to join</Action>
          </div>
        )}
      </Band>

      <Band title="Kinds of events">
        <EventKinds />
      </Band>

      {past.length > 0 && (
        <Band title="Past">
          <EventList events={past} />
        </Band>
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
