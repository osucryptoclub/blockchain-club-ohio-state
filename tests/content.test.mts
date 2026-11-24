import assert from "node:assert/strict";
import { test } from "node:test";
import { applications } from "../src/content/applications.ts";
import { phase, parts } from "../src/lib/applications.ts";
import { cohortMembers, cohortRole, validate } from "../src/lib/roster.ts";
import type { Cohort } from "../src/content/cohorts.ts";
import type { Person } from "../src/content/people.ts";

const cohort: Cohort = {
  slug: "c1",
  name: "Builders",
  term: "Fall",
  status: "active",
  summary: "",
  focus: [],
  teams: [{ name: "Collectors", focus: "" }],
};
const ada: Person = { id: "ada", name: "Ada", cohorts: [{ cohort: "c1", team: "Collectors", role: "Lead" }] };

test("the shipped content has no broken references", async () => {
  const [{ cohorts }, { people }, { projects }] = await Promise.all([
    import("../src/content/cohorts.ts"),
    import("../src/content/people.ts"),
    import("../src/content/projects.ts"),
  ]);
  assert.deepEqual(validate({ cohorts, people, projects }), []);
});

test("validation names unknown cohorts, teams, and duplicate ids", () => {
  const problems = validate({
    cohorts: [cohort],
    people: [
      ada,
      { id: "ada", name: "Ada again" },
      { id: "bob", name: "Bob", cohorts: [{ cohort: "nope" }] },
      { id: "cy", name: "Cy", cohorts: [{ cohort: "c1", team: "Nope" }] },
    ],
    projects: [],
  });
  assert.equal(problems.length, 3);
  assert.match(problems.join(), /"ada"/);
  assert.match(problems.join(), /"nope"/);
  assert.match(problems.join(), /"Nope"/);
});

test("cohort members and roles resolve", () => {
  assert.deepEqual(cohortMembers("c1", [ada, { id: "b", name: "B" }]), [ada]);
  assert.equal(cohortRole(ada, "c1"), "Collectors · Lead");
});

test("the application window moves through its phases", () => {
  const apps = { cohort: "x", opens: "2027-01-12T09:00:00-05:00", closes: "2027-01-26T23:59:00-05:00", applyUrl: null };
  const opens = Date.parse(apps.opens);
  assert.equal(phase({ ...apps, opens: null }, 0).state, "unannounced");
  assert.equal(phase(apps, opens - 1).state, "upcoming");
  assert.equal(phase(apps, opens).state, "open");
  assert.equal(phase(apps, Date.parse(apps.closes)).state, "closed");
  assert.equal(phase({ ...apps, closes: null }, opens + 1e12).state, "open");
  assert.throws(() => phase({ ...apps, opens: "2027-01-12" }, 0), /offset/);
  assert.doesNotThrow(() => phase(applications, Date.now()));
});

test("countdown parts add up", () => {
  assert.deepEqual(parts(((2 * 24 + 3) * 60 + 4) * 60_000 + 5_000), { days: 2, hours: 3, minutes: 4, seconds: 5 });
  assert.deepEqual(parts(-5), { days: 0, hours: 0, minutes: 0, seconds: 0 });
});
