/**
 * Confirmed sponsors and partners only. Never add a name or logo without
 * written permission. Put logos in public/sponsors/ as SVG or PNG.
 *
 * Example:
 *   { name: "Company", url: "https://company.com", logo: "/sponsors/company.svg" }
 */

export type Sponsor = { name: string; url: string; logo?: string };

export const sponsors: Sponsor[] = [];

export const partnerships = [
  {
    title: "Sponsorship",
    body: "Support workshops, hackathons, and student travel. Confirmed sponsors are recognized on this page and at the events they fund.",
  },
  {
    title: "Industry collaboration",
    body: "Bring a real problem. Student teams can prototype, test, document, or research alongside your engineers.",
  },
  {
    title: "Guest speakers",
    body: "Give a talk, teach a workshop, or run an open Q&A with students who want the technical detail.",
  },
  {
    title: "Recruiting",
    body: "Meet students through the work they have done, and share internships and roles with the membership.",
  },
];
