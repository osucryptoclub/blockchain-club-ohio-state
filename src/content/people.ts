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
  photo?: string;
  /** A leadership or operations role. Omit for members who hold none. */
  team?: { group: TeamGroupId; role: string };
  /** `cohort` is a slug from src/content/cohorts.ts. */
  cohorts?: { cohort: string; team?: string; role?: string }[];
  achievements?: string[];
  links?: { label: string; url: string }[];
};

export const people: Person[] = [];
