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
