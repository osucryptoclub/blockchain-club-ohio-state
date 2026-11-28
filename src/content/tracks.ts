/**
 * The four tracks every cohort belongs to. A dated cohort in cohorts.ts joins the
 * track with the same name. Order sets the number. Each slug also picks a logo,
 * a diagram, and a lab.
 */

export type Track = {
  slug: "builders" | "investments" | "research" | "marketing";
  name: string;
  focus: string;
  description: string;
  /** Short labels for the card. */
  keywords: string[];
  activities: string[];
  /** Slugs from src/content/areas.ts that this cohort works on. */
  areas: string[];
};

export const tracks: Track[] = [
  {
    slug: "builders",
    name: "Builders",
    focus: "Engineering, development, and technical innovation.",
    description:
      "The Builders cohort is where ideas become reality. Members develop blockchain applications, smart contracts, decentralized applications, infrastructure, and innovative Web3 products.",
    keywords: ["Solidity", "Ethereum", "Full-stack Web3", "Open source"],
    activities: [
      "Smart contract development",
      "Solidity and Ethereum",
      "Full-stack Web3 development",
      "AI and blockchain integration",
      "Hackathons and technical projects",
      "Open-source contributions",
    ],
    areas: ["blockchain-development", "smart-contracts", "web3-dapps", "ai-blockchain"],
  },
  {
    slug: "investments",
    name: "Investments",
    focus: "Digital assets, financial markets, and investment analysis.",
    description:
      "The Investments cohort explores the intersection of blockchain technology and financial markets. Members study digital assets, evaluate investment opportunities, analyze market trends, and develop informed investment strategies.",
    keywords: ["Tokenomics", "Valuation", "DeFi", "Venture capital"],
    activities: [
      "Cryptocurrency market analysis",
      "Tokenomics and valuation",
      "DeFi and decentralized exchanges",
      "Portfolio management",
      "Venture capital and Web3 startups",
      "Trading and risk management",
    ],
    areas: ["digital-assets", "defi", "entrepreneurship"],
  },
  {
    slug: "research",
    name: "Research",
    focus: "Blockchain research, emerging technologies, and industry innovation.",
    description:
      "The Research cohort investigates the technologies, protocols, economics, and emerging ideas shaping the blockchain ecosystem. Members explore complex topics and turn research into actionable insights.",
    keywords: ["Protocols", "Zero-knowledge", "Cryptography", "Layer 1 and 2"],
    activities: [
      "Blockchain protocol research",
      "Zero-knowledge proofs",
      "Cryptography",
      "Layer 1 and Layer 2 ecosystems",
      "DeFi research",
      "AI and blockchain research",
      "Technical publications and reports",
    ],
    areas: ["research", "cryptography", "zero-knowledge", "ai-blockchain"],
  },
  {
    slug: "marketing",
    name: "Marketing",
    focus: "Branding, communications, partnerships, and community growth.",
    description:
      "The Marketing cohort builds the organization’s identity and expands its presence across Ohio State and the broader blockchain ecosystem. Members lead creative campaigns, develop partnerships, and connect the organization with industry professionals.",
    keywords: ["Brand", "Content", "Partnerships", "Events"],
    activities: [
      "Social media and content creation",
      "Brand development",
      "Event promotion",
      "Corporate and industry partnerships",
      "Community management",
      "Sponsorships",
      "Conference and hackathon outreach",
    ],
    areas: [],
  },
];

export const trackNumber = (i: number) => String(i + 1).padStart(2, "0");

/** The track a dated cohort belongs to, matched by name. */
export const trackNamed = (name: string) => tracks.find((t) => t.name.toLowerCase() === name.toLowerCase());
