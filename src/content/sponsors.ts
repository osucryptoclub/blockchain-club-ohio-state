/**
 * Confirmed sponsors and partners only. Never add a name or logo without
 * written permission. Put logos in public/sponsors/ as SVG or PNG; until a
 * logo is added, the name is set as a wordmark.
 *
 * Example:
 *   {
 *     name: "Company",
 *     url: "https://company.com",
 *     logo: "/sponsors/company.svg",       // optional
 *     about: "What the organization does, in one sentence.",
 *   }
 */

export type Sponsor = { name: string; url: string; logo?: string; about: string };

export const sponsors: Sponsor[] = [
  {
    name: "Stand With Crypto",
    url: "https://www.standwithcrypto.org",
    about: "A nonprofit advocacy organization for clear, sensible crypto policy in the United States.",
  },
  {
    name: "Tangem",
    url: "https://tangem.com",
    about: "Self-custody hardware wallets in a card format, for keeping keys offline.",
  },
];

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
