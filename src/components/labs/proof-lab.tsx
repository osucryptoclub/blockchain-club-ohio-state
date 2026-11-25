"use client";

import { useState } from "react";
import { cheatRound, G, honestRound, P, publicKey, Q, type Round } from "@/lib/labs";
import { LabButton, Panel, ShareButton, Slider, Stat } from "./parts";

const roll = (n: number) => Math.floor(Math.random() * n);
const bit = () => roll(2) as 0 | 1;

/** Research: convince a verifier, honestly or by guessing. */
export function ProofLab() {
  const [secret, setSecret] = useState(614);
  const [cheating, setCheating] = useState(false);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [record, setRecord] = useState(0);
  const key = publicKey(secret);
  const caught = rounds.some((r) => !r.accepted);
  const passed = rounds.filter((r) => r.accepted).length;
  const doubt = 0.5 ** rounds.length;
  const last = rounds.at(-1);

  function play(times: number) {
    const next = [...rounds];
    for (let i = 0; i < times && next.every((r) => r.accepted); i++) {
      const [nonce, challenge] = [1 + roll(Q - 1), bit()];
      next.push(cheating ? cheatRound(key, nonce, bit(), challenge) : honestRound(secret, nonce, challenge));
    }
    setRounds(next);
    if (cheating) setRecord(Math.max(record, next.filter((r) => r.accepted).length));
  }
  function choose(cheat: boolean) {
    setCheating(cheat);
    setRounds([]);
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Panel title="You, the prover">
        <div role="group" aria-label="Role" className="grid grid-cols-2 border border-white/25">
          {[
            [false, "I know the secret"],
            [true, "I’m bluffing"],
          ].map(([value, name]) => (
            <button
              key={String(value)}
              type="button"
              aria-pressed={cheating === value}
              onClick={() => choose(value as boolean)}
              className={`min-h-12 cursor-pointer px-3 font-semibold transition-colors ${cheating === value ? "bg-white text-black" : "hover:bg-white/10"}`}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="mt-7">
          {cheating ? (
            <p className="text-lead">You have only the public key. Before each round, you guess the question and prepare an answer for it.</p>
          ) : (
            <Slider
              label="Your secret"
              min={2}
              max={Q - 1}
              step={1}
              value={secret}
              onChange={(n) => {
                setSecret(n);
                setRounds([]);
              }}
              format={String}
            />
          )}
        </div>
        <dl className="mt-7 grid grid-cols-2 gap-5">
          <Stat label={`Public key, ${G}ˢ mod ${P}`} value={String(key)} />
          <Stat label="Rounds passed" value={String(passed)} />
        </dl>
        <div className="mt-7 flex flex-wrap gap-3">
          <LabButton onClick={() => play(1)} disabled={caught}>
            One round
          </LabButton>
          <LabButton onClick={() => play(20)} disabled={caught} quiet>
            Twenty rounds
          </LabButton>
          {rounds.length > 0 && (
            <LabButton onClick={() => setRounds([])} quiet>
              Start over
            </LabButton>
          )}
        </div>
      </Panel>

      <Panel title="The verifier, who never sees the secret">
        <ol aria-label="Rounds" className="flex min-h-24 flex-wrap content-start gap-1.5">
          {rounds.slice(-80).map((r, i) => (
            <li key={i} title={r.accepted ? "Accepted" : "Caught"} className={`size-5 ${r.accepted ? "bg-white" : "bg-scarlet"}`}>
              <span className="sr-only">{r.accepted ? "Accepted" : "Caught"}</span>
            </li>
          ))}
        </ol>
        <dl className="mt-4 grid grid-cols-3 gap-4 border-b border-white/20 pb-5 font-mono text-sm">
          {[
            ["Commitment", last?.commitment],
            ["Question", last && (last.challenge ? "r + s" : "r")],
            ["Answer", last?.response],
          ].map(([k, v]) => (
            <div key={k as string}>
              <dt className="font-sans text-gray-400">{k}</dt>
              <dd className="mt-1 text-base tabular-nums">{v ?? "…"}</dd>
            </div>
          ))}
        </dl>
        <p aria-live="polite" className="wide mt-5 min-h-[4.4em] text-subhead">
          {rounds.length === 0
            ? "Waiting for the first round."
            : caught
              ? `Caught in round ${rounds.length}. ${passed > 3 ? "A good run, but guessing runs out." : "Guessing only works half the time."}`
              : `A bluffer would have got this far ${rounds.length < 20 ? `1 time in ${Math.round(1 / doubt).toLocaleString("en-US")}` : "less than once in a million tries"}.`}
        </p>
        <p className="mt-3 text-sm text-gray-400">
          Each question reveals either a random number or that number plus the secret, never both, so the secret stays hidden. This group is tiny so you can read it. Real ones use numbers hundreds of digits long.
        </p>
        {(caught || rounds.length >= 20) && (
          <div className="mt-5">
            <ShareButton
              text={cheating ? `I bluffed a zero-knowledge proof for ${record} ${record === 1 ? "round" : "rounds"} before getting caught.` : "I proved I know a secret without revealing it."}
            />
          </div>
        )}
      </Panel>
    </div>
  );
}
