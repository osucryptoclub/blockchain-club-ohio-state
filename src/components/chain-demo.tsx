"use client";

import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import * as m from "motion/react-m";
import { useState } from "react";
import { DIFFICULTY, hashBlock, inspect, reseal, type Block, type BlockState } from "@/lib/chain";

const messages: Record<BlockState, string> = {
  valid: "Valid",
  edited: "Contents no longer match the sealed hash",
  unlinked: "Points to a block that no longer exists",
  downstream: "Built on a broken block",
};

function Hash({ value }: { value: string }) {
  return (
    <>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        {value.slice(0, 10)}…{value.slice(-6)}
      </span>
    </>
  );
}

/**
 * Real blocks, hashed with SHA-256 in the visitor's browser. The starting chain
 * is sealed at build time so the page has no mining to do while it loads.
 */
export function ChainDemo({ start }: { start: Block[] }) {
  const [blocks, setBlocks] = useState(start);
  const [note, setNote] = useState("");
  const states = inspect(blocks);
  const firstBroken = states.findIndex((s) => s !== "valid");
  const changed = blocks.some((b, i) => b.data !== start[i].data);

  function edit(i: number, data: string) {
    setBlocks(blocks.map((b, j) => (j === i ? { ...b, data } : b)));
    setNote("");
  }

  function repair() {
    const next = reseal(blocks, firstBroken);
    const attempts = next[firstBroken].nonce + 1;
    setBlocks(next);
    setNote(
      `Block ${firstBroken + 1} sealed after ${attempts.toLocaleString("en-US")} ${attempts === 1 ? "attempt" : "attempts"}.`,
    );
  }

  function reset() {
    setBlocks(start);
    setNote("");
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 320, damping: 26 }}>
        <ol className="grid gap-9 lg:grid-cols-3 lg:gap-12">
          {blocks.map((block, i) => {
            const ok = states[i] === "valid";
            const linked = states[i] === "valid" || (states[i] === "downstream" && i > 0);
            return (
              <li key={block.index} className="relative min-w-0">
                {i > 0 && (
                  <m.span
                    aria-hidden="true"
                    className="absolute -top-9 left-8 h-9 w-0.75 bg-scarlet lg:top-16 lg:-left-12 lg:h-0.75 lg:w-12"
                    initial={false}
                    animate={{ rotate: linked ? 0 : 24, scale: linked ? 1 : 0.55 }}
                  />
                )}
                <div
                  className={`flex h-full flex-col border bg-white/4 backdrop-blur-md transition-colors duration-300 ${ok ? "border-white/20" : "border-scarlet"}`}
                >
                  <div
                    className={`flex min-h-16 items-center justify-between gap-4 border-b px-5 py-3 transition-colors duration-300 lg:px-6 ${ok ? "border-white/20" : "border-scarlet bg-scarlet"}`}
                  >
                    <h3 className="wide shrink-0 text-subhead">Block {block.index}</h3>
                    <p className="text-right text-sm leading-snug">{messages[states[i]]}</p>
                  </div>
                  <div className="flex flex-1 flex-col gap-7 p-5 lg:p-6">
                    <label className="block">
                      <span className="text-sm text-gray-400">Contents (edit this)</span>
                      <input
                        id={`block-${block.index}`}
                        value={block.data}
                        maxLength={60}
                        autoComplete="off"
                        spellCheck={false}
                        onChange={(e) => edit(i, e.target.value)}
                        className="mt-1 w-full border-b border-white/40 bg-transparent py-2 text-lg font-semibold text-white focus:border-white focus:outline-none"
                      />
                    </label>
                    <dl className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                      <dt className="text-gray-400">Previous hash</dt>
                      <dd className="font-mono">
                        <Hash value={block.parent} />
                      </dd>
                      <dt className="text-gray-400">Nonce</dt>
                      <dd className="font-mono tabular-nums">{block.nonce}</dd>
                      <dt className="text-gray-400">Hash now</dt>
                      <dd className="font-mono">
                        <Hash value={hashBlock(block)} />
                      </dd>
                    </dl>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex min-h-13 flex-wrap items-center gap-x-6 gap-y-3">
          {firstBroken !== -1 && (
            <button
              type="button"
              onClick={repair}
              className="min-h-13 cursor-pointer bg-white px-6 font-semibold text-black transition-colors hover:bg-white/85"
            >
              Re-seal block {firstBroken + 1}
            </button>
          )}
          {(changed || firstBroken !== -1) && (
            <button type="button" onClick={reset} className="link min-h-11 cursor-pointer font-semibold">
              Reset
            </button>
          )}
          <p aria-live="polite" className="text-gray-400">
            {note}{" "}
            {firstBroken === -1
              ? changed
                ? "The chain is valid again, but only because every later block was redone."
                : `Every hash starts with ${DIFFICULTY} and every block names the one before it.`
              : ""}
          </p>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
