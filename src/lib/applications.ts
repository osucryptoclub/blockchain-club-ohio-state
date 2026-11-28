import type { Applications } from "../content/applications.ts";

export type Phase =
  | { state: "unannounced" }
  | { state: "upcoming"; opens: number; remaining: number }
  | { state: "open"; deadline: number | null; remaining: number | null }
  | { state: "closed"; deadline: number };

function parse(value: string, field: string): number {
  const ms = Date.parse(value);
  if (Number.isNaN(ms) || !/(Z|[+-]\d{2}:\d{2})$/.test(value)) {
    throw new Error(
      `applications.${field} is "${value}". Use a full date with an offset, like 2027-01-23T23:59:59-05:00.`,
    );
  }
  return ms;
}

/** Where applications stand at `now`. */
export function phase(apps: Applications, now: number): Phase {
  const deadline = apps.deadline ? parse(apps.deadline, "deadline") : null;
  const opens = apps.opens ? parse(apps.opens, "opens") : null;
  if (deadline === null && opens === null) return { state: "unannounced" };
  if (opens !== null && deadline !== null && deadline <= opens) {
    throw new Error("applications.deadline must be after applications.opens.");
  }
  if (opens !== null && now < opens) return { state: "upcoming", opens, remaining: opens - now };
  if (deadline === null) return { state: "open", deadline: null, remaining: null };
  if (now < deadline) return { state: "open", deadline, remaining: deadline - now };
  return { state: "closed", deadline };
}

/** Split a duration into whole days, hours, minutes, and seconds. */
export function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

const longDate = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "long", day: "numeric", year: "numeric" });
const shortDate = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" });

/** "January 23, 2027", in Columbus time. */
export const formatLong = (iso: string) => longDate.format(Date.parse(iso));
/** "Jan 23". */
export const formatShort = (iso: string) => shortDate.format(Date.parse(iso));

const time = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
/** "11:59 PM EST". */
export const formatTime = (iso: string) => time.format(Date.parse(iso));
