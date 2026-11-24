import { TextLink } from "@/components/action";
import { eventTypes, type ClubEvent } from "@/content/events";
import { eventDay, eventMonth, eventWhen } from "@/lib/events";

export function EventList({ events }: { events: ClubEvent[] }) {
  return (
    <ul className="border-t border-ink">
      {events.map((event) => (
        <li
          key={event.slug}
          id={event.slug}
          className="grid gap-x-10 gap-y-4 border-b border-gray-200 py-8 sm:grid-cols-[6rem_minmax(0,1fr)]"
        >
          <p aria-hidden="true" className="flex items-baseline gap-2 text-scarlet sm:block">
            <span className="font-semibold">{eventMonth(event)}</span>
            <span className="wide block text-5xl leading-none">{eventDay(event)}</span>
          </p>
          <div>
            <p className="text-sm text-gray-600">{eventTypes[event.type].singular}</p>
            <h3 className="mt-1 text-subhead font-bold">{event.title}</h3>
            <p className="mt-2 font-medium">
              <time dateTime={event.start}>{eventWhen(event)}</time>
              <span className="block">{event.location}</span>
              {event.speaker && <span className="block">{event.speaker}</span>}
            </p>
            <p className="mt-3 max-w-[62ch] text-gray-600">{event.summary}</p>
            {event.url && (
              <p className="mt-4">
                <TextLink href={event.url}>Event details</TextLink>
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
