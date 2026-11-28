/**
 * Club-wide settings. This is the first file a new officer should read.
 *
 * Any link set to `null` renders as plain "coming soon" text, never as a
 * clickable link. Replace `null` with the real URL to turn it on everywhere.
 */

export type Channel = {
  id: "discord" | "groupme" | "linkedin" | "instagram" | "x" | "github";
  label: string;
  /** What someone gets by following this link. */
  purpose: string;
  url: string | null;
};

type Site = {
  name: string;
  tagline: string;
  description: string;
  email: string | null;
  /**
   * "unconfirmed": the footer says the club is student-run and not endorsed.
   * "registered": the footer shows Ohio State's required disclaimer for
   * registered student organizations. Only switch this once the club's
   * registration under its current name is confirmed and active.
   */
  registration: "unconfirmed" | "registered";
  channels: Channel[];
};

export const site: Site = {
  name: "Blockchain Club at Ohio State",
  tagline: "Building the Future of Decentralized Technology.",
  description:
    "Bringing together builders, researchers, entrepreneurs, and innovators at Ohio State to explore blockchain, Web3, cryptography, and decentralized systems.",
  email: null,
  registration: "unconfirmed",
  channels: [
    {
      id: "discord",
      label: "Discord",
      purpose: "Day-to-day conversation, project channels, and help",
      url: null,
    },
    {
      id: "groupme",
      label: "GroupMe",
      purpose: "Quick announcements and reminders",
      url: null,
    },
    {
      id: "github",
      label: "GitHub",
      purpose: "Code, issues, and open pull requests",
      url: "https://github.com/osucryptoclub",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      purpose: "Professional updates for members and partners",
      url: "https://www.linkedin.com/company/blockchain-club-at-ohio-state/",
    },
    {
      id: "instagram",
      label: "Instagram",
      purpose: "Photos and event announcements",
      url: "https://www.instagram.com/blockchainclub_ohiostate/",
    },
    { id: "x", label: "X", purpose: "News and public posts", url: null },
  ],
};

export function channel(id: Channel["id"]): Channel {
  const found = site.channels.find((c) => c.id === id);
  if (!found) throw new Error(`No channel with id "${id}" in src/content/site.ts`);
  return found;
}

/**
 * The main menu. The entry with `menu: "cohorts"` opens a dropdown listing
 * every cohort in src/content/cohorts.ts, so new cohorts appear on their own.
 */
export const navigation: { href: string; label: string; menu?: "cohorts" }[] = [
  { href: "/about", label: "About" },
  { href: "/what-we-do", label: "What We Do" },
  { href: "/cohorts", label: "Cohorts", menu: "cohorts" },
  { href: "/labs", label: "Labs" },
  { href: "/projects", label: "Projects" },
  { href: "/events", label: "Events" },
  { href: "/team", label: "Team" },
  { href: "/sponsors", label: "Sponsors" },
];

/** Pages linked from the footer but not the main menu. */
export const secondaryNavigation = [
  { href: "/find-your-cohort", label: "Find Your Cohort" },
  { href: "/contact", label: "Contact" },
  { href: "/brand", label: "Brand" },
];

export const disclaimer = {
  registered: `We, ${site.name}, are a registered student organization at The Ohio State University. Registration shall not be construed as Ohio State's approval, endorsement, or sponsorship of our registered student organization's publications, activities, purposes, actions or positions.`,
  unconfirmed: `${site.name} is run by students. This website is not a publication of The Ohio State University, and nothing on it should be read as the university's approval, endorsement, or sponsorship.`,
}[site.registration];
