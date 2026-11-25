/** The cohort finder. Each answer adds one block and points toward one or two tracks. */

import type { Track } from "./tracks.ts";

type Slug = Track["slug"];
export type Answer = { text: string; points: Partial<Record<Slug, number>> };
export type Question = { ask: string; answers: Answer[] };

export const questions: Question[] = [
  {
    ask: "A new protocol launches tonight. What do you do first?",
    answers: [
      { text: "Open the code and look for how it breaks", points: { builders: 2, research: 1 } },
      { text: "Work out who holds the tokens and why", points: { investments: 2, research: 1 } },
      { text: "Read the paper behind it", points: { research: 2 } },
      { text: "See who is talking about it, and what they miss", points: { marketing: 2, investments: 1 } },
    ],
  },
  {
    ask: "You have a free Saturday. Which sounds best?",
    answers: [
      { text: "Building something that works by dinner", points: { builders: 2 } },
      { text: "Testing a theory against a year of data", points: { investments: 2 } },
      { text: "Understanding one hard idea completely", points: { research: 2 } },
      { text: "Getting forty people into one room", points: { marketing: 2 } },
    ],
  },
  {
    ask: "Your group project is stuck. You are the one who…",
    answers: [
      { text: "Makes a rough version so there is something to fix", points: { builders: 2, marketing: 1 } },
      { text: "Asks what it costs and what it is worth", points: { investments: 2 } },
      { text: "Finds the assumption everyone got wrong", points: { research: 2, builders: 1 } },
      { text: "Gets everyone talking again", points: { marketing: 2 } },
    ],
  },
  {
    ask: "Which question would keep you up at night?",
    answers: [
      { text: "How would I build that?", points: { builders: 2 } },
      { text: "Is the market wrong about this?", points: { investments: 2 } },
      { text: "Why is that true?", points: { research: 2 } },
      { text: "Why does nobody know about this?", points: { marketing: 2 } },
    ],
  },
  {
    ask: "Pick a tool.",
    answers: [
      { text: "A terminal", points: { builders: 2 } },
      { text: "A spreadsheet", points: { investments: 2 } },
      { text: "A whiteboard", points: { research: 2 } },
      { text: "A camera", points: { marketing: 2 } },
    ],
  },
  {
    ask: "A year from now, you want to point at…",
    answers: [
      { text: "Something people use", points: { builders: 2 } },
      { text: "A call you made, with the reasoning written down", points: { investments: 2, research: 1 } },
      { text: "Something you published", points: { research: 2 } },
      { text: "A club twice the size it is today", points: { marketing: 2 } },
    ],
  },
];
