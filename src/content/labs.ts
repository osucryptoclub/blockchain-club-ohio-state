/** The four labs, one per track. Each slug matches a track in tracks.ts. */

export type Lab = {
  slug: "builders" | "investments" | "research" | "marketing";
  title: string;
  hook: string;
  /** What someone should understand afterwards. */
  lesson: string;
  minutes: number;
};

export const labs: Lab[] = [
  {
    slug: "builders",
    title: "Rob the vault. Then fix it.",
    hook: "Three lines of code guard eight coins. In the wrong order, one coin of credit is enough to take them all.",
    lesson:
      "This is reentrancy: paying someone before recording the payment. The 2016 attack on The DAO worked the same way. Update your own records first, then send.",
    minutes: 3,
  },
  {
    slug: "investments",
    title: "Move the market.",
    hook: "There is no order book here, only a formula. Trade against it, then meet the bot that trades ahead of you.",
    lesson:
      "Large trades move their own price, and a public trade can be traded against. A slippage limit is the trader’s defense. This is a simulation for learning, not financial advice.",
    minutes: 4,
  },
  {
    slug: "research",
    title: "Prove it without saying it.",
    hook: "Convince a verifier you know a secret number, and reveal nothing about it. Then try to cheat.",
    lesson:
      "A liar survives each round half the time, so twenty rounds leave about one chance in a million. This is the idea behind zero-knowledge proofs.",
    minutes: 4,
  },
  {
    slug: "marketing",
    title: "Start something that spreads.",
    hook: "Sixty-odd people, three messages, three rounds. Choose who hears it first and reach as many as you can.",
    lesson:
      "The best starting points are rarely the most connected three. They are the ones whose neighborhoods overlap least. Networks, campaigns, and block propagation all share this problem.",
    minutes: 3,
  },
];

export const getLab = (slug: string) => labs.find((l) => l.slug === slug);
