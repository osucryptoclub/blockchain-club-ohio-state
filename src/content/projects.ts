/**
 * Projects, research, and hackathon work. Only list work that exists and can
 * be checked: every entry needs a public link.
 *
 * Example:
 *
 *   {
 *     slug: "project-name",
 *     title: "Project name",
 *     kind: "software",                     // "software" | "research" | "hackathon"
 *     status: "active",                     // "active" | "complete"
 *     summary: "What it does, in one or two sentences.",
 *     stack: ["Solidity", "Next.js"],
 *     flow: ["Input", "Contract", "App"],   // optional, drawn as a chain
 *     links: [{ label: "Source", url: "https://github.com/..." }],
 *     contributors: ["Name", "Name"],       // optional, with their permission
 *   },
 */

export const projectKinds = {
  software: "Software",
  research: "Research",
  hackathon: "Hackathon",
} as const;

/** What each kind of work means here. Shown on the home and Projects pages. */
export const projectKindList: { title: string; text: string }[] = [
  {
    title: projectKinds.software,
    text: "Contracts, apps, and tools, with source you can read and run.",
  },
  {
    title: projectKinds.research,
    text: "Protocol analyses and data work, with sources others can check.",
  },
  {
    title: projectKinds.hackathon,
    text: "What a team builds under a deadline, with the repository included.",
  },
];

export const projectStatuses = { active: "In progress", complete: "Complete" } as const;

type Link = { label: string; url: string };

export type Project = {
  slug: string;
  title: string;
  kind: keyof typeof projectKinds;
  status: keyof typeof projectStatuses;
  summary: string;
  stack: string[];
  /** Optional. The stages work passes through, drawn as a chain of blocks. */
  flow?: string[];
  links: [Link, ...Link[]];
  contributors?: string[];
};

export const projects: Project[] = [
  {
    // Checked against the public repository and its README, November 2026.
    slug: "research-pipeline",
    title: "Research Pipeline",
    kind: "software",
    status: "active",
    summary:
      "A daily archive of trusted sources for member research. Collectors pull from approved feeds into one database, tagged by topic, with a reader for browsing and search.",
    stack: ["Python", "Supabase", "Next.js", "GitHub Actions"],
    flow: ["Approved feeds", "Collectors", "Tagged database", "Reader"],
    links: [{ label: "View source", url: "https://github.com/osucryptoclub/research-pipeline" }],
  },
];
