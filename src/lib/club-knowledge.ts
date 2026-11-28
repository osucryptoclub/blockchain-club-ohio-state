/**
 * Everything the club assistant knows, read from the same content files the
 * pages use. Nothing is written here by hand, so updating a content file
 * updates the assistant too. If a fact is not in a content file, the
 * assistant does not know it and says so.
 */

import { applications } from "../content/applications.ts";
import { formatLong, formatTime } from "./applications.ts";
import { cohorts, cohortStatuses } from "../content/cohorts.ts";
import { eligibility, joinSteps, learning, reasons } from "../content/community.ts";
import { events, eventTypes } from "../content/events.ts";
import { labs } from "../content/labs.ts";
import { people } from "../content/people.ts";
import { projects } from "../content/projects.ts";
import { site } from "../content/site.ts";
import { sponsors } from "../content/sponsors.ts";
import { tracks } from "../content/tracks.ts";

export const mission = "Build, learn, research, and connect through blockchain technology.";

export const leaders = people.filter((p) => p.team).map((p) => ({ name: p.name, role: p.team!.role, college: p.major, linkedin: p.links?.find((l) => l.label === "LinkedIn")?.url }));

/** Channels with a working link. */
export const openChannels = site.channels.filter((c): c is typeof c & { url: string } => Boolean(c.url));

/** Events that have not ended yet, soonest first. */
export const upcoming = (now: Date) =>
  events.filter((e) => new Date(e.end) > now).sort((a, b) => a.start.localeCompare(b.start));

export const activeCohorts = cohorts.filter((c) => c.status !== "complete");

export { applications, eligibility, eventTypes, joinSteps, labs, learning, projects, reasons, site, sponsors, tracks };

function applicationText(): string {
  const a = applications;
  if (!a.deadline) return `Application dates for ${a.cohort} have not been announced. The Join page (/join#apply) will show them.`;
  const opens = a.opens ? ` Applications open ${formatLong(a.opens)}.` : "";
  const form = a.applyUrl ? ` Apply at ${a.applyUrl}.` : " The application form link has not been posted yet; the Join page (/join#apply) will have it.";
  return `The application deadline for ${a.cohort} is ${formatLong(a.deadline)}, ${formatTime(a.deadline)}.${opens}${form}`;
}

/** The same facts as plain text, given to the language model as its only source. */
export function knowledgeText(now: Date): string {
  const next = upcoming(now);
  const lines = [
    `# ${site.name}`,
    site.description,
    `Mission: ${mission}`,
    `Status: ${site.registration === "registered" ? "A registered student organization at Ohio State." : "Run by students. Not a publication of Ohio State, and not endorsed by the university."}`,
    "",
    "## Who can join",
    eligibility.who,
    eligibility.detail,
    "",
    "## How joining works",
    ...joinSteps.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`),
    "",
    "## Applications",
    applicationText(),
    "",
    "## The four cohorts",
    ...tracks.flatMap((t) => [`### ${t.name}: ${t.focus}`, t.description, `Activities: ${t.activities.join("; ")}.`, `Skills: ${t.skills.join("; ")}.`]),
    "",
    "## Current cohorts",
    ...cohorts.map((c) => `- ${c.name}, ${c.term} (${cohortStatuses[c.status]}): ${c.summary}${c.teams?.length ? ` Teams: ${c.teams.map((t) => `${t.name} (${t.focus})`).join("; ")}.` : ""} Page: /cohorts/${c.slug}`),
    "",
    "## Projects",
    ...projects.map((p) => `- ${p.title} (${p.status}): ${p.summary} Built with ${p.stack.join(", ")}. ${p.links.map((l) => `${l.label}: ${l.url}`).join(". ")}`),
    "",
    "## Events",
    next.length
      ? next.map((e) => `- ${e.title} (${eventTypes[e.type].singular}), ${e.start}, ${e.location}. ${e.summary}`).join("\n")
      : "No upcoming events are posted on the site yet.",
    `Kinds of events the club runs: ${Object.values(eventTypes).map((t) => `${t.label} (${t.description})`).join("; ")}`,
    "Meeting times and locations are not on the site. They are announced on the club's channels.",
    "",
    "## What members learn",
    ...learning.map((l) => `- ${l}`),
    "",
    "## Labs (interactive demos on the site)",
    ...labs.map((l) => `- ${l.title} (/labs/${l.slug})`),
    "",
    "## Leadership",
    ...leaders.map((l) => `- ${l.name}, ${l.role}${l.college ? `, ${l.college}` : ""}${l.linkedin ? `. LinkedIn: ${l.linkedin}` : ""}`),
    "",
    "## Sponsors",
    ...sponsors.map((s) => `- ${s.name}: ${s.about}`),
    "",
    "## Contact",
    site.email ? `Email: ${site.email}` : "The club's official email address has not been posted yet.",
    ...openChannels.map((c) => `- ${c.label}: ${c.url} (${c.purpose})`),
    "Contact page: /contact. Find-your-cohort assessment: /find-your-cohort.",
  ];
  return lines.join("\n");
}
