import { tracks } from "./tracks.ts";

/** Why people join, what they learn, and how they contribute. Used on the home and Join pages. */

export const reasons = [
  { title: "Build with other people", text: "Join a project in progress or find collaborators for yours." },
  { title: "Get past the hype", text: "Learn how the systems work well enough to judge them yourself." },
  { title: "Meet the field", text: "Get to know the engineers, founders, and researchers doing this work." },
];

export const learning = [
  "How blocks, hashes, and consensus fit together",
  "How to write, test, and review a smart contract",
  "How to connect a web app to a wallet and a chain",
  "How to read a whitepaper and find its weak points",
  "How DeFi, stablecoins, and token economies behave",
  "What zero-knowledge proofs can and cannot do",
];

/** Members contribute through one of the four tracks. */
export const collaborate = tracks.map(({ name, focus }) => ({ title: name, text: focus }));

/** How joining works. Shown on the Join page and used by the club assistant. */
export const joinSteps = [
  { title: "Come to a meeting", text: "Meetings and events are open to every student, with no application." },
  { title: "Apply", text: "Choose one of the four cohorts and apply before the deadline." },
  { title: "Build", text: "Cohort members work in small teams on real club software, with review from leads." },
  { title: "Get recognized", text: "Your name, team, and work are listed on the cohort page, if you want them to be." },
];

export const eligibility = {
  who: "Ohio State students of any major, any year, and any level of experience.",
  detail:
    "You don’t need to know how to code, and you don’t need to own any cryptocurrency. Developers, designers, economists, writers, and skeptics all have work to do here.",
};
