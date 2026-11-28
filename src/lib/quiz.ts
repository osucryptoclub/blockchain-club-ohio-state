import type { Question } from "../content/quiz.ts";
import type { Track } from "../content/tracks.ts";
import { sha256 } from "./sha256.ts";

type Slug = Track["slug"];
export const slugs: Slug[] = ["builders", "investments", "research", "marketing"];

/** The track an answer leans toward most, which colors its block. */
export const leaning = (points: Partial<Record<Slug, number>>): Slug =>
  slugs.reduce((best, s) => ((points[s] ?? 0) > (points[best] ?? 0) ? s : best), slugs.find((s) => points[s]) ?? slugs[0]);

/** Indexes of the answers picked for each question; empty until answered. */
export type Picks = number[][];

export type Contribution = { question: number; answer: number; points: number };

export type Result = {
  /** Every track, best fit first. `fit` is 0 to 1: how much of the most this track could have scored, it did. */
  ranked: { slug: Slug; fit: number; score: number }[];
  /** True when the top two are within a few points of each other. */
  close: boolean;
  /** The answers that counted most toward each track, strongest first. */
  reasons: Record<Slug, Contribution[]>;
  hash: string;
};

const CLOSE = 0.06;

/**
 * Scores an assessment. Every answer adds its points to its tracks; answers
 * picked together on one question share its points. Ties go to the track more
 * answers leaned toward, then to the earlier signal, then to the fixed order.
 */
export function score(questions: Question[], picks: Picks): Result {
  const totals = Object.fromEntries(slugs.map((s) => [s, 0])) as Record<Slug, number>;
  const most = Object.fromEntries(slugs.map((s) => [s, 0])) as Record<Slug, number>;
  const leanings = Object.fromEntries(slugs.map((s) => [s, 0])) as Record<Slug, number>;
  const first: Partial<Record<Slug, number>> = {};
  const reasons = Object.fromEntries(slugs.map((s) => [s, [] as Contribution[]])) as Result["reasons"];

  for (const [q, question] of questions.entries()) {
    for (const s of slugs) most[s] += Math.max(0, ...question.answers.map((a) => a.points[s] ?? 0));
    const chosen = picks[q] ?? [];
    for (const a of chosen) {
      const answer = question.answers[a];
      if (!answer) continue;
      const lean = leaning(answer.points);
      if (answer.points[lean]) {
        leanings[lean] += 1;
        first[lean] ??= q;
      }
      for (const s of slugs) {
        const points = (answer.points[s] ?? 0) / chosen.length;
        if (!points) continue;
        totals[s] += points;
        reasons[s].push({ question: q, answer: a, points });
      }
    }
  }

  const ranked = slugs
    .map((slug) => ({ slug, score: totals[slug], fit: most[slug] ? totals[slug] / most[slug] : 0 }))
    .sort(
      (a, b) =>
        b.fit - a.fit ||
        leanings[b.slug] - leanings[a.slug] ||
        (first[a.slug] ?? 99) - (first[b.slug] ?? 99) ||
        slugs.indexOf(a.slug) - slugs.indexOf(b.slug),
    );
  for (const s of slugs) reasons[s].sort((a, b) => b.points - a.points || a.question - b.question);
  const flat = picks.map((p) => p.join(".")).join("|");
  return { ranked, close: ranked[0].fit - ranked[1].fit < CLOSE, reasons, hash: sha256(`blockchain-club:${flat}`) };
}

/** Up to three "You…" phrases from the answers that counted most toward a track. */
export function because(questions: Question[], reasons: Contribution[]): string[] {
  const out: string[] = [];
  for (const { question, answer } of reasons) {
    const why = questions[question].answers[answer].why;
    if (why && !out.includes(why)) out.push(why);
    if (out.length === 3) break;
  }
  return out;
}

/** "a", "a and b", "a, b, and c". */
export const list = (items: string[]) =>
  items.length < 3 ? items.join(" and ") : `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
