import { cohorts, type Cohort } from "../content/cohorts.ts";
import { people, type Person, type TeamGroupId } from "../content/people.ts";
import { projects, type Project } from "../content/projects.ts";

type Sources = { cohorts: Cohort[]; people: Person[]; projects: Project[] };

/**
 * Check that every cross-reference in the content resolves. Returns one
 * message per problem, so a typo fails the build and names the entry.
 */
export function validate({ cohorts, people, projects }: Sources): string[] {
  const problems: string[] = [];
  const slugs = new Set(cohorts.map((c) => c.slug));
  const dupes = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);

  for (const slug of dupes(cohorts.map((c) => c.slug))) problems.push(`Two cohorts use the slug "${slug}".`);
  for (const id of dupes(people.map((p) => p.id))) problems.push(`Two people use the id "${id}".`);

  for (const person of people) {
    if (!/^[a-z0-9-]+$/.test(person.id)) problems.push(`Person "${person.name}" needs an id of lowercase letters, digits, and dashes.`);
    for (const { cohort, team } of person.cohorts ?? []) {
      const found = cohorts.find((c) => c.slug === cohort);
      if (!found) {
        problems.push(`Person "${person.id}" lists cohort "${cohort}", which is not in cohorts.ts.`);
      } else if (team && !found.teams?.some((t) => t.name === team)) {
        problems.push(`Person "${person.id}" is on team "${team}", which cohort "${cohort}" does not have.`);
      }
    }
  }
  for (const project of projects) {
    if (project.cohort && !slugs.has(project.cohort)) {
      problems.push(`Project "${project.slug}" lists cohort "${project.cohort}", which is not in cohorts.ts.`);
    }
  }
  return problems;
}

const problems = validate({ cohorts, people, projects });
if (problems.length > 0) throw new Error(`Content errors:\n- ${problems.join("\n- ")}`);

const statusOrder = { active: 0, upcoming: 1, complete: 2 } as const;

/** Cohorts in menu order: in session first, then upcoming, then past, keeping file order within each. */
export const orderedCohorts = [...cohorts].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

export const getCohort = (slug: string) => cohorts.find((c) => c.slug === slug);

export const cohortMembers = (slug: string, from: Person[] = people) =>
  from.filter((p) => p.cohorts?.some((c) => c.cohort === slug));

export const cohortProjects = (slug: string, from: Project[] = projects) => from.filter((p) => p.cohort === slug);

export const groupMembers = (group: TeamGroupId, from: Person[] = people) =>
  from.filter((p) => p.team?.group === group);

/** A person's role within one cohort, as one line. */
export function cohortRole(person: Person, slug: string): string | undefined {
  const entry = person.cohorts?.find((c) => c.cohort === slug);
  return [entry?.team, entry?.role].filter(Boolean).join(" · ") || undefined;
}
