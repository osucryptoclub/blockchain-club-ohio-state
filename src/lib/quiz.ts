import type { Question } from "../content/quiz.ts";
import type { Track } from "../content/tracks.ts";
import { sha256 } from "./sha256.ts";

type Slug = Track["slug"];
const slugs: Slug[] = ["builders", "investments", "research", "marketing"];

/** The track an answer leans toward most, which colors its block. */
export const leaning = (points: Partial<Record<Slug, number>>): Slug =>
  slugs.reduce((best, s) => ((points[s] ?? 0) > (points[best] ?? 0) ? s : best), slugs.find((s) => points[s]) ?? slugs[0]);

/** Scores for each track, best first. Ties keep the order of the earliest answer that favored one. */
export function score(questions: Question[], chosen: number[]) {
  const totals: Record<Slug, number> = { builders: 0, investments: 0, research: 0, marketing: 0 };
  const firstSeen: Partial<Record<Slug, number>> = {};
  for (const [i, pick] of chosen.entries()) {
    const points = questions[i]?.answers[pick]?.points ?? {};
    for (const s of slugs) {
      if (!points[s]) continue;
      totals[s] += points[s];
      if (s === leaning(points)) firstSeen[s] ??= i;
    }
  }
  const sum = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
  const ranked = slugs
    .map((slug) => ({ slug, share: totals[slug] / sum }))
    .sort((a, b) => b.share - a.share || (firstSeen[a.slug] ?? 99) - (firstSeen[b.slug] ?? 99));
  return { ranked, hash: sha256(`blockchain-club:${chosen.join("")}`) };
}
