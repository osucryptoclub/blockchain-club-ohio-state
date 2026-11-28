/**
 * The cohort assessment. Each answer gives points to one or more tracks, and
 * `why` finishes the sentence "You…" in the personal explanation. A question
 * with `pick` set allows that many answers; they share the question's points.
 */

import type { Track } from "./tracks.ts";

type Slug = Track["slug"];
export type Answer = { text: string; points: Partial<Record<Slug, number>>; why?: string };
export type Question = { ask: string; topic: string; answers: Answer[]; pick?: number };

export const questions: Question[] = [
  {
    topic: "Experience",
    ask: "How much code have you written?",
    answers: [
      { text: "None yet, and that’s fine", points: { marketing: 1, investments: 1 } },
      { text: "A class or a few tutorials", points: { builders: 1, research: 1, investments: 1 } },
      { text: "I build things on my own", points: { builders: 3, research: 1 }, why: "already build things on your own" },
      { text: "I ship software regularly", points: { builders: 4 }, why: "ship software regularly" },
    ],
  },
  {
    topic: "Blockchain",
    ask: "Where are you with blockchain?",
    answers: [
      { text: "Brand new, here to learn", points: { marketing: 1, investments: 1 } },
      { text: "I follow the news and the markets", points: { investments: 2, marketing: 1 }, why: "keep up with the markets" },
      { text: "I’ve read how it actually works", points: { research: 2, builders: 1 }, why: "want to know how it actually works" },
      { text: "I’ve written a contract or used a testnet", points: { builders: 3 }, why: "have already worked on-chain" },
    ],
  },
  {
    topic: "Interests",
    ask: "Which topics pull you in? Pick up to three.",
    pick: 3,
    answers: [
      { text: "Smart contracts and apps", points: { builders: 3 }, why: "are drawn to smart contracts and apps" },
      { text: "AI agents", points: { builders: 2, research: 1 }, why: "are curious about AI agents" },
      { text: "Markets and valuation", points: { investments: 3 }, why: "want to understand markets and valuation" },
      { text: "Tokenomics", points: { investments: 2, research: 1 }, why: "like thinking about token incentives" },
      { text: "Cryptography and zero-knowledge", points: { research: 3 }, why: "are drawn to cryptography" },
      { text: "How protocols are designed", points: { research: 2, builders: 1 }, why: "want to know how protocols are designed" },
      { text: "Brand, design, and content", points: { marketing: 3 }, why: "care about brand and content" },
      { text: "Community and events", points: { marketing: 3 }, why: "like bringing people together" },
    ],
  },
  {
    topic: "Instinct",
    ask: "A new protocol launches tonight. What do you do first?",
    answers: [
      { text: "Open the code and look for how it breaks", points: { builders: 2, research: 1 }, why: "go straight to the code" },
      { text: "Work out who holds the tokens and why", points: { investments: 2, research: 1 }, why: "follow the money first" },
      { text: "Read the paper behind it", points: { research: 3 }, why: "start with the paper" },
      { text: "See who is talking about it, and what they miss", points: { marketing: 2, investments: 1 }, why: "watch how people talk about it" },
    ],
  },
  {
    topic: "Working style",
    ask: "How do you like to work?",
    answers: [
      { text: "Heads down, building until it works", points: { builders: 3 }, why: "like building until it works" },
      { text: "With numbers, testing an idea against data", points: { investments: 3 }, why: "test ideas against data" },
      { text: "Reading deeply, then writing it up", points: { research: 3 }, why: "read deeply and write it up" },
      { text: "With people, out in front", points: { marketing: 3 }, why: "do your best work with people" },
    ],
  },
  {
    topic: "Teamwork",
    ask: "Your group project is stuck. You are the one who…",
    answers: [
      { text: "Makes a rough version so there is something to fix", points: { builders: 2, marketing: 1 }, why: "make a first version when a team is stuck" },
      { text: "Asks what it costs and what it is worth", points: { investments: 2 }, why: "ask what things are worth" },
      { text: "Finds the assumption everyone got wrong", points: { research: 2, builders: 1 }, why: "find the assumption everyone missed" },
      { text: "Gets everyone talking again", points: { marketing: 2 }, why: "get a stuck team talking again" },
    ],
  },
  {
    topic: "Tools",
    ask: "Pick the tool you’d reach for.",
    answers: [
      { text: "A terminal", points: { builders: 2 } },
      { text: "A spreadsheet", points: { investments: 2 } },
      { text: "A whiteboard", points: { research: 2 } },
      { text: "A camera", points: { marketing: 2 } },
    ],
  },
  {
    topic: "Curiosity",
    ask: "Which question would keep you up at night?",
    answers: [
      { text: "How would I build that?", points: { builders: 2 } },
      { text: "Is the market wrong about this?", points: { investments: 2 } },
      { text: "Why is that true?", points: { research: 2 } },
      { text: "Why does nobody know about this?", points: { marketing: 2 } },
    ],
  },
  {
    topic: "Career",
    ask: "Where could you see yourself after graduation? Pick up to two.",
    pick: 2,
    answers: [
      { text: "Software or protocol engineering", points: { builders: 3 }, why: "see yourself in engineering" },
      { text: "Starting a company", points: { builders: 1, investments: 1, marketing: 1 }, why: "might start a company" },
      { text: "Venture capital, trading, or finance", points: { investments: 3 }, why: "are aiming at finance or venture capital" },
      { text: "Research, grad school, or policy", points: { research: 3 }, why: "are thinking about research or policy" },
      { text: "Product, growth, or partnerships", points: { marketing: 3 }, why: "are aiming at product, growth, or partnerships" },
      { text: "Not sure yet", points: {} },
    ],
  },
  {
    topic: "Contribution",
    ask: "A year from now, you want to point at…",
    answers: [
      { text: "Something people use", points: { builders: 3 }, why: "want to make something people use" },
      { text: "A call you made, with the reasoning written down", points: { investments: 3, research: 1 }, why: "want to make calls and show your reasoning" },
      { text: "Something you published", points: { research: 3 }, why: "want to publish" },
      { text: "A club twice the size it is today", points: { marketing: 3 }, why: "want to grow the club" },
    ],
  },
];
