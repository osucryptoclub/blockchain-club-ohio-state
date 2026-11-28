import assert from "node:assert/strict";
import test from "node:test";
import { questions } from "../src/content/quiz.ts";
import { tracks } from "../src/content/tracks.ts";
import { because, list, score, slugs } from "../src/lib/quiz.ts";
import { answer, suggestions } from "../src/lib/assistant.ts";
import { knowledgeText } from "../src/lib/club-knowledge.ts";
import { applications } from "../src/content/applications.ts";
import { formatTime } from "../src/lib/applications.ts";

test("the assessment has 8 to 12 well-formed questions", () => {
  assert.ok(questions.length >= 8 && questions.length <= 12);
  assert.ok(questions.some((q) => (q.pick ?? 1) > 1), "at least one multi-select question");
  for (const q of questions) {
    assert.ok(q.answers.length >= 2 && (q.pick ?? 1) < q.answers.length, q.ask);
    for (const a of q.answers) for (const s of Object.keys(a.points)) assert.ok(slugs.includes(s as never), `${a.text}: ${s}`);
  }
  for (const s of slugs) assert.ok(questions.some((q) => q.answers.some((a) => a.points[s])), `${s} can score`);
});

test("scoring is deterministic and its percentages are in range", () => {
  const picks = questions.map((q, i) => [i % q.answers.length]);
  assert.deepEqual(score(questions, picks), score(questions, picks));
  for (const r of score(questions, picks).ranked) assert.ok(r.fit >= 0 && r.fit <= 1);
  assert.notEqual(score(questions, picks).hash, score(questions, questions.map(() => [0])).hash);
});

test("ties break the same way every time, and in a documented order", () => {
  // Nothing picked: every track scores 0, so the fixed order decides.
  const empty = score(questions, questions.map(() => []));
  assert.deepEqual(empty.ranked.map((r) => r.slug), slugs);
  assert.ok(empty.close);
  // "Not sure yet" alone adds nothing.
  const career = questions.findIndex((q) => q.topic === "Career");
  const unsure = questions[career].answers.findIndex((a) => a.text === "Not sure yet");
  const only = questions.map((_, i) => (i === career ? [unsure] : []));
  assert.ok(score(questions, only).ranked.every((r) => r.score === 0));
});

test("mixed answers give a close call with a clear runner-up", () => {
  // Builders and Marketing answers alternate.
  const pick = (slug: string) => (q: (typeof questions)[number]) => q.answers.findIndex((a) => Math.max(...Object.values(a.points)) === a.points[slug as never]);
  const picks = questions.map((q, i) => [Math.max(0, pick(i % 2 ? "marketing" : "builders")(q))]);
  const r = score(questions, picks);
  assert.deepEqual(new Set(r.ranked.slice(0, 2).map((x) => x.slug)), new Set(["builders", "marketing"]));
});

test("multi-select answers share a question's points", () => {
  const q = questions.findIndex((x) => (x.pick ?? 1) === 3);
  const base = questions.map(() => [] as number[]);
  const one = score(questions, base.map((p, i) => (i === q ? [0] : p)));
  const three = score(questions, base.map((p, i) => (i === q ? [0, 2, 4] : p)));
  const b1 = one.ranked.find((r) => r.slug === "builders")!.score;
  const b3 = three.ranked.find((r) => r.slug === "builders")!.score;
  assert.equal(b1, 3);
  assert.equal(b3, 1);
});

test("explanations come from the answers that counted", () => {
  const picks = questions.map((q) => [q.answers.findIndex((a) => a.points.research === Math.max(...q.answers.map((x) => x.points.research ?? 0)))]);
  const r = score(questions, picks);
  assert.equal(r.ranked[0].slug, "research");
  const why = because(questions, r.reasons.research);
  assert.ok(why.length >= 1 && why.length <= 3);
  assert.equal(list(["a", "b", "c"]), "a, b, and c");
  assert.equal(list(["a", "b"]), "a and b");
});

test("every suggested question gets a specific answer", () => {
  assert.equal(suggestions.length, 10);
  const seen = new Set();
  for (const s of suggestions) {
    const r = answer(s);
    assert.ok(r.topic, s);
    assert.ok(r.text.length > 40 && r.links.length > 0, s);
    seen.add(r.topic);
  }
  assert.equal(seen.size, 10, "each suggestion has its own topic");
});

test("typed questions find the right topic", () => {
  const cases: [string, string][] = [
    ["how do i join the club", "join"],
    ["do I have to know how to code?", "coding"],
    ["when are meetings?", "events"],
    ["who is the president", "contact"],
    ["tell me about builders", "builders"],
    ["what does the investments cohort do", "investments"],
    ["who sponsors you", "sponsors"],
    ["I'm a total beginner", "beginners"],
    ["what labs can I try", "labs"],
  ];
  for (const [q, topic] of cases) assert.equal(answer(q).topic, topic, q);
});

test("unknown questions say so and point to real channels", () => {
  for (const q of ["what are the dues?", "asdf", "?", "what is the price of bitcoin tomorrow"]) {
    const r = answer(q);
    if (r.topic) continue;
    assert.match(r.text, /don’t have an answer/);
    assert.ok(r.links.length >= 1 && r.links.every((l) => l.href.startsWith("https://") || l.href.startsWith("/")));
  }
  assert.equal(answer("what are the dues?").topic, null);
  assert.equal(answer("?").topic, null);
});

test("the assistant invents nothing the content files don't say", () => {
  // The configured deadline is a real date and time; any other time would be invented.
  const before = new Date("2026-11-28");
  const text = suggestions
    .map((s) => answer(s, before).text)
    .join("\n")
    .replaceAll(formatTime(applications.deadline!), "");
  assert.doesNotMatch(text, /\b(Mondays?|Tuesdays?|Wednesdays?|Thursdays?|Fridays?|\d{1,2}(:\d\d)? ?(am|pm)|dues|\$\d)/i);
  const kb = knowledgeText(before);
  for (const t of tracks) assert.ok(kb.includes(t.description));
  assert.match(kb, /January 23, 2027/);
  assert.match(answer("How can I become a member?", before).text, /due January 23, 2027/);
  assert.match(answer("How can I become a member?", new Date("2027-02-01")).text, /closed on January 23, 2027/);
});
