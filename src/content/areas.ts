/**
 * The areas the club works in. Edit copy here; pages update themselves. Each
 * slug also picks a diagram in src/components/area-glyph.tsx.
 */

export type AreaGroup = "Build" | "Understand" | "Apply";

export type Area = {
  slug: string;
  name: string;
  group: AreaGroup;
  /** The question this area exists to answer. */
  question: string;
  summary: string;
  topics: string[];
  code?: { caption: string; source: string };
};

export const areaGroups: { name: AreaGroup; intro: string }[] = [
  { name: "Build", intro: "Write software that runs on networks nobody owns." },
  { name: "Understand", intro: "Study how these systems behave, and where they fail." },
  { name: "Apply", intro: "Take the technology somewhere useful." },
];

export const areas: Area[] = [
  {
    slug: "blockchain-development",
    name: "Blockchain Development",
    group: "Build",
    question: "How do strangers’ computers agree on one history?",
    summary:
      "The protocol layer: how nodes find each other, pass messages, check blocks, and settle on a single order of events without a coordinator.",
    topics: ["Consensus protocols", "Peer-to-peer networking", "Merkle trees", "Clients and nodes"],
    code: {
      caption: "A block header, simplified",
      source: `struct Header {
    parent_hash: [u8; 32],
    state_root:  [u8; 32],
    txs_root:    [u8; 32],
    number:      u64,
    timestamp:   u64,
}`,
    },
  },
  {
    slug: "smart-contracts",
    name: "Smart Contracts",
    group: "Build",
    question: "What changes when nobody can edit the code that holds the money?",
    summary:
      "Programs that run exactly as deployed. We care about writing them clearly, testing them hard, and learning from the ones that broke.",
    topics: ["Solidity and Rust", "Testing and fuzzing", "Security review", "Upgrade patterns"],
    code: {
      caption: "Update state before sending funds",
      source: `function withdraw(uint256 amount) external {
    if (balance[msg.sender] < amount)
        revert Insufficient();
    balance[msg.sender] -= amount;

    (bool ok, ) = msg.sender.call{value: amount}("");
    if (!ok) revert TransferFailed();
}`,
    },
  },
  {
    slug: "web3-dapps",
    name: "Decentralized Applications",
    group: "Build",
    question: "Can an app keep working after its company shuts down?",
    summary:
      "Interfaces people can actually use, connected to contracts instead of a private database. Wallets, signatures, storage, and good product design.",
    topics: ["Wallet connection", "Signing and accounts", "Indexing chain data", "Decentralized storage"],
    code: {
      caption: "Read a token balance from a web app",
      source: `const balance = await client.readContract({
  address: token,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [account],
});`,
    },
  },
  {
    slug: "digital-assets",
    name: "Cryptocurrency Research",
    group: "Understand",
    question: "What gives a digital asset value, and who decides?",
    summary:
      "Monetary design, custody, market structure, and regulation. The aim is literacy: understanding what an asset is before forming a view on it.",
    topics: ["Issuance and supply", "Custody and keys", "Stablecoins", "Policy and regulation"],
  },
  {
    slug: "defi",
    name: "Web3 & DeFi",
    group: "Understand",
    question: "How can a formula replace an order book?",
    summary:
      "Exchange, lending, and derivatives built as open protocols, along with the risks that come with them.",
    topics: ["Automated market makers", "Lending and collateral", "Oracles", "Protocol risk"],
    code: {
      caption: "A constant-product swap, without fees",
      source: `# x * y stays constant across the trade
def amount_out(x, y, dx):
    return y * dx / (x + dx)`,
    },
  },
  {
    slug: "cryptography",
    name: "Cryptography",
    group: "Understand",
    question: "How can you prove a message is yours without sharing your key?",
    summary:
      "The math everything else here rests on: hashing, signatures, and the hard problems that make them safe, along with what happens when those problems stop being hard.",
    topics: ["Hash functions", "Digital signatures", "Elliptic curves", "Post-quantum schemes"],
  },
  {
    slug: "zero-knowledge",
    name: "Zero-Knowledge Proofs",
    group: "Understand",
    question: "How do you prove you are a student without showing your ID?",
    summary:
      "Cryptography that convinces someone a statement is true and reveals nothing else. The math is demanding, and the applications are still opening up.",
    topics: ["SNARKs and STARKs", "Circuit design", "Private identity", "Rollups"],
  },
  {
    slug: "research",
    name: "Blockchain Research",
    group: "Understand",
    question: "Which limits of decentralization are real, and which are choices?",
    summary:
      "Reading papers closely, following primary sources, and writing up what we find so others can check it.",
    topics: ["Paper reading", "Protocol analysis", "On-chain data", "Mechanism design"],
  },
  {
    slug: "ai-blockchain",
    name: "AI & Blockchain",
    group: "Apply",
    question: "How should a software agent hold and spend money?",
    summary:
      "Where the two fields meet: agents that transact, verifiable computation, and records of where data and models came from.",
    topics: ["Agent payments", "Verifiable inference", "Data provenance", "Compute markets"],
  },
  {
    slug: "entrepreneurship",
    name: "Entrepreneurship & Startups",
    group: "Apply",
    question: "Which problems actually need a blockchain?",
    summary:
      "Many don’t. The work is finding the ones that do, testing the idea early, and getting from a demo to something people use.",
    topics: ["Finding problems", "Token and business models", "Grants and funding", "Legal basics"],
  },
];
