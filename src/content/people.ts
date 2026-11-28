/**
 * Everyone the site recognizes, in one list. A person appears on the Team page
 * when they have a `team` role, and on a cohort page for each entry in
 * `cohorts`. Remove a person by deleting their entry; every page updates.
 *
 * Only add people who have agreed to be listed, with the details they chose.
 * Photos go in public/team/ (square, 600px or larger).
 *
 * Example (copy into the array below and replace every value):
 *
 *   {
 *     id: "jane-doe",                        // unique, lowercase, no spaces
 *     name: "Jane Doe",
 *     major: "Computer Science and Engineering",
 *     photo: "/team/jane-doe.jpg",
 *     team: { group: "technical", role: "Technical Lead" },
 *     cohorts: [{ cohort: "builders-fall-2026", team: "Collectors", role: "Contributor" }],
 *     achievements: ["Shipped the feed collector for the Research Pipeline"],
 *     links: [
 *       { label: "LinkedIn", url: "https://www.linkedin.com/in/..." },
 *       { label: "GitHub", url: "https://github.com/..." },
 *     ],
 *   },
 */

export type TeamGroupId = "president" | "vice-president" | "technical" | "development" | "outreach";

export type Person = {
  id: string;
  name: string;
  major?: string;
  /** One or two sentences, shown on leadership cards. */
  bio?: string;
  photo?: string;
  /** A leadership or operations role. Omit for members who hold none. */
  team?: { group: TeamGroupId; role: string };
  /** `cohort` is a slug from src/content/cohorts.ts. */
  cohorts?: { cohort: string; team?: string; role?: string }[];
  achievements?: string[];
  links?: { label: string; url: string }[];
};

export const people: Person[] = [
  {
    // Spelling and role match Ohio State's student organization directory. The
    // club confirmed every officer's college, photo, and LinkedIn. November 2026.
    id: "jack-korinek",
    name: "Jack Korinek",
    major: "Fisher College of Business, Ohio State",
    bio: "Sets the club’s direction and speaks for it on campus and beyond.",
    photo: "/team/jack-korinek.webp",
    team: { group: "president", role: "President" },
    links: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/jack-korinek/" }],
  },
  {
    id: "cooper-shalin",
    name: "Cooper Shalin",
    major: "Fisher College of Business, Ohio State",
    bio: "Helps run the club and keeps its four cohorts moving.",
    photo: "/team/cooper-shalin.webp",
    team: { group: "vice-president", role: "Vice President" },
    links: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/cooper-shalin-294a26325/" }],
  },
  {
    id: "emilio-laracuente",
    name: "Emilio Laracuente",
    major: "Fisher College of Business, Ohio State",
    bio: "Helps run the club and keeps its four cohorts moving.",
    photo: "/team/emilio-laracuente.webp",
    team: { group: "vice-president", role: "Vice President" },
    links: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/emiliolaracuente/" }],
  },
];
