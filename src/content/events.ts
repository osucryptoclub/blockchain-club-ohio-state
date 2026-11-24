/**
 * Events. Add one object per event. Upcoming and past lists sort themselves,
 * and an event moves to "Past" on its own after it ends.
 *
 * Example (copy into the array below and replace every value):
 *
 *   {
 *     slug: "intro-to-solidity",
 *     title: "Intro to Solidity",
 *     type: "workshop",
 *     start: "2027-01-20T18:00:00-05:00",   // -05:00 in winter, -04:00 in summer
 *     end: "2027-01-20T19:30:00-05:00",
 *     location: "Building and room",
 *     summary: "One or two sentences on what people will do.",
 *     speaker: "Name, affiliation",         // optional
 *     url: "https://link-to-rsvp",          // optional
 *   },
 */

export const eventTypes = {
  meeting: {
    label: "Weekly meetings",
    singular: "Meeting",
    description: "Regular sessions open to new and returning members.",
  },
  workshop: {
    label: "Technical workshops",
    singular: "Workshop",
    description: "Hands-on sessions. Bring a laptop and leave with working code.",
  },
  speaker: {
    label: "Guest speakers",
    singular: "Guest speaker",
    description: "Talks and Q&A with people working in the field.",
  },
  hackathon: {
    label: "Hackathons",
    singular: "Hackathon",
    description: "Team up, pick a problem, and build under a deadline.",
  },
  networking: {
    label: "Networking events",
    singular: "Networking",
    description: "Meet students, alumni, founders, and engineers.",
  },
  industry: {
    label: "Industry presentations",
    singular: "Industry presentation",
    description: "Companies and protocols show what they are working on.",
  },
} as const;

export type EventType = keyof typeof eventTypes;

export type ClubEvent = {
  slug: string;
  title: string;
  type: EventType;
  /** ISO 8601 with an explicit UTC offset. */
  start: string;
  end: string;
  location: string;
  summary: string;
  speaker?: string;
  url?: string;
};

export const events: ClubEvent[] = [];
