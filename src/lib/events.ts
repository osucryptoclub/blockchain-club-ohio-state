import { cacheLife } from "next/cache";
import { events, type ClubEvent } from "@/content/events";

const ZONE = "America/New_York";

function time(event: ClubEvent, field: "start" | "end"): number {
  const value = event[field];
  const ms = Date.parse(value);
  if (Number.isNaN(ms) || !/(Z|[+-]\d{2}:\d{2})$/.test(value)) {
    throw new Error(
      `Event "${event.slug}" has an invalid ${field}: "${value}". Use a full date with an offset, like 2027-01-20T18:00:00-05:00.`,
    );
  }
  return ms;
}

/** Split events into upcoming and past. Refreshed hourly without a redeploy. */
export async function getEvents() {
  "use cache";
  cacheLife("hours");
  const now = Date.now();
  return {
    upcoming: events
      .filter((e) => time(e, "end") >= now)
      .sort((a, b) => time(a, "start") - time(b, "start")),
    past: events
      .filter((e) => time(e, "end") < now)
      .sort((a, b) => time(b, "start") - time(a, "start")),
  };
}

const format = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: ZONE, ...options });

export const eventMonth = (e: ClubEvent) => format({ month: "short" }).format(time(e, "start"));

export const eventDay = (e: ClubEvent) => format({ day: "numeric" }).format(time(e, "start"));

export function eventWhen(e: ClubEvent) {
  const [start, end] = [time(e, "start"), time(e, "end")];
  const date = format({ weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const clock = format({ hour: "numeric", minute: "2-digit" });
  // Events that run past midnight, such as hackathons, show both dates.
  return date.format(start) === date.format(end)
    ? `${date.format(start)}, ${clock.formatRange(start, end)}`
    : `${date.format(start)}, ${clock.format(start)} to ${date.format(end)}, ${clock.format(end)}`;
}
