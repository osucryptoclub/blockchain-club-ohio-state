import { sha256 } from "./sha256.ts";

/** A sealed block's hash must start with this. About 4,096 attempts on average. */
export const DIFFICULTY = "000";
const GENESIS_PARENT = "0".repeat(64);

export type Block = {
  index: number;
  data: string;
  parent: string;
  nonce: number;
  /** The hash recorded when the block was last sealed. */
  sealed: string;
};

export type BlockState = "valid" | "edited" | "unlinked" | "downstream";

export function hashBlock(b: Pick<Block, "index" | "data" | "parent" | "nonce">): string {
  return sha256(`${b.index}|${b.data}|${b.parent}|${b.nonce}`);
}

export function seal(index: number, data: string, parent: string): Block {
  for (let nonce = 0; ; nonce++) {
    const sealed = hashBlock({ index, data, parent, nonce });
    if (sealed.startsWith(DIFFICULTY)) return { index, data, parent, nonce, sealed };
  }
}

export function buildChain(entries: string[]): Block[] {
  const blocks: Block[] = [];
  for (const [i, data] of entries.entries()) {
    blocks.push(seal(i + 1, data, blocks[i - 1]?.sealed ?? GENESIS_PARENT));
  }
  return blocks;
}

export function inspect(blocks: Block[]): BlockState[] {
  let broken = false;
  return blocks.map((block, i) => {
    let state: BlockState = "valid";
    if (hashBlock(block) !== block.sealed) state = "edited";
    else if (i > 0 && block.parent !== hashBlock(blocks[i - 1])) state = "unlinked";
    else if (broken) state = "downstream";
    if (state !== "valid") broken = true;
    return state;
  });
}

/** Re-seal one block against the current hash of the block before it. */
export function reseal(blocks: Block[], i: number): Block[] {
  const parent = i === 0 ? GENESIS_PARENT : hashBlock(blocks[i - 1]);
  return blocks.map((b, j) => (j === i ? seal(b.index, b.data, parent) : b));
}
