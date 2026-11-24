import { TextLink } from "@/components/action";
import { Cells } from "@/components/section";
import { eventTypes, type ClubEvent } from "@/content/events";
import { eventDay, eventMonth, eventWhen } from "@/lib/events";

export function EventList({ events }: { events: ClubEvent[] }) {
  return (
    <ul className="rule grid border-t border-l md:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <li
          key={event.slug}
          id={event.slug}
          className="rule flex flex-col border-r border-b p-6 transition-colors duration-300 hover:bg-current/5 lg:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <p aria-hidden="true">
              <span className="wide block text-6xl leading-none">{eventDay(event)}</span>
              <span className="mt-2 block font-semibold">{eventMonth(event)}</span>
            </p>
            <p className="border border-current/40 px-2.5 py-1 text-sm font-medium">
              {eventTypes[event.type].singular}
            </p>
          </div>
          <h3 className="wide mt-12 text-cell">{event.title}</h3>
          <p className="mt-3 font-medium">
            <time dateTime={event.start}>{eventWhen(event)}</time>
            <span className="block">{event.location}</span>
            {event.speaker && <span className="block">{event.speaker}</span>}
          </p>
          <p className="muted mt-3 mb-6">{event.summary}</p>
          {event.url && (
            <p className="mt-auto">
              <TextLink href={event.url}>Event details</TextLink>
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

/** What each kind of event is. Stands in for the calendar while it is empty. */
export function EventKinds() {
  return (
    <Cells
      items={Object.values(eventTypes).map(({ label, description }) => ({ title: label, text: description }))}
    />
  );
}
