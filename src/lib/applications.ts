import type { Applications } from "../content/applications.ts";

export type Phase =
  | { state: "unannounced" }
  | { state: "upcoming"; opens: number; remaining: number }
  | { state: "open"; closes: number | null }
  | { state: "closed" };

function parse(value: string, field: string): number {
  const ms = Date.parse(value);
  if (Number.isNaN(ms) || !/(Z|[+-]\d{2}:\d{2})$/.test(value)) {
    throw new Error(
      `applications.${field} is "${value}". Use a full date with an offset, like 2027-01-12T09:00:00-05:00.`,
    );
  }
  return ms;
}

/** Where the application window stands at `now`. */
export function phase(apps: Applications, now: number): Phase {
  if (!apps.opens) return { state: "unannounced" };
  const opens = parse(apps.opens, "opens");
  const closes = apps.closes ? parse(apps.closes, "closes") : null;
  if (closes !== null && closes <= opens) throw new Error("applications.closes must be after applications.opens.");
  if (now < opens) return { state: "upcoming", opens, remaining: opens - now };
  if (closes === null || now < closes) return { state: "open", closes };
  return { state: "closed" };
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
