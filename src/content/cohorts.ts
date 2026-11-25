/**
 * Cohorts. Each entry gets its own page at /cohorts/<slug> and a place in the
 * Cohorts menu, newest first. Members join a cohort from src/content/people.ts,
 * and projects from src/content/projects.ts (set `cohort` to this slug), so a
 * new cohort needs nothing but an entry here.
 *
 * Example (copy into the array below and replace every value):
 *
 *   {
 *     slug: "builders-spring-2027",
 *     name: "Builders",
 *     term: "Spring 2027",
 *     status: "upcoming",                  // "upcoming" | "active" | "complete"
 *     summary: "One or two sentences on what this cohort is for.",
 *     focus: ["Smart contracts", "Data"],
 *     teams: [{ name: "Team name", focus: "What this team owns." }],
 *     activities: ["Weekly build session"],
 *     achievements: ["Only results that can be checked"],
 *   },
 */

export const cohortStatuses = {
  upcoming: "Upcoming",
  active: "In session",
  complete: "Complete",
} as const;

export type Cohort = {
  slug: string;
  name: string;
  term: string;
  status: keyof typeof cohortStatuses;
  summary: string;
  focus: string[];
  teams?: { name: string; focus: string }[];
  activities?: string[];
  achievements?: string[];
};

export const cohorts: Cohort[] = [
  {
    // Confirm the term with leadership before announcing it widely.
    slug: "builders-fall-2026",
    name: "Builders",
    term: "Fall 2026",
    status: "active",
    summary:
      "Members build real club infrastructure in small teams, starting with the Research Pipeline: a shared, searchable archive of trusted sources for member research.",
    focus: ["Data engineering", "Python", "Next.js", "Automation"],
    teams: [
      {
        name: "Collectors",
        focus: "Pull articles from approved feeds into the shared database, tagged by topic.",
      },
    ],
    activities: ["Team build sessions", "Code review on every pull request"],
  },
  {
    slug: "investments-fall-2026",
    name: "Investments",
    term: "Fall 2026",
    status: "active",
    summary:
      "Members learn how digital-asset markets work and practice disciplined analysis: write the thesis down, show the evidence, and let others try to break it. Research and education, not financial advice.",
    focus: ["Market structure", "Token research", "Risk", "Portfolio theory"],
  },
  {
    slug: "marketing-fall-2026",
    name: "Marketing",
    term: "Fall 2026",
    status: "active",
    summary:
      "Members tell the club’s story and grow its reach: social media, design, events, and the relationships with partners and sponsors.",
    focus: ["Brand and design", "Social media", "Events", "Partnerships"],
  },
  {
    slug: "research-fall-2026",
    name: "Research",
    term: "Fall 2026",
    status: "active",
    summary:
      "Members read papers closely, analyze protocols, and write up what they find so others can check it.",
    focus: ["Protocol analysis", "Paper reading", "On-chain data", "Writing"],
  },
];
