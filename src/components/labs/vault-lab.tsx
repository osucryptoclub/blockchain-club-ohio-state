"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { heist, type Heist, type Step } from "@/lib/labs";
import { LabButton, Panel, ShareButton } from "./parts";

const code: Record<Step, { line: string; note: string }> = {
  check: { line: "require(balance[msg.sender] >= 1);", note: "Check the books" },
  send: { line: "msg.sender.call{value: 1}(\"\");", note: "Send the money" },
  update: { line: "balance[msg.sender] = 0;", note: "Update the books" },
};
const broken: Step[] = ["check", "send", "update"];
const verdict: Record<Heist["outcome"], string> = {
  drained: "Robbed. One coin of credit emptied the vault.",
  safe: "Safe. They got the one coin they were owed and nothing more.",
  locked: "Locked. Nobody can rob it, but nobody can withdraw either.",
};

/** Builders: put three lines in the right order, then let the attacker try. */
export function VaultLab() {
  const [order, setOrder] = useState<Step[]>(broken);
  const [run, setRun] = useState<Heist | null>(null);
  const [shown, setShown] = useState(0);
  const [robbed, setRobbed] = useState(false);
  const logRef = useRef<HTMLOListElement>(null);
  const total = run?.events.length ?? 0;
  const done = run !== null && shown >= total;

  // Keep the newest call in view.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [shown]);

  useEffect(() => {
    if (!run || shown >= total) return;
    const quick = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = window.setTimeout(() => setShown(quick ? total : shown + 1), quick ? 0 : Math.max(90, 420 - shown * 18));
    return () => window.clearTimeout(id);
  }, [run, shown, total]);

  function move(i: number, by: -1 | 1) {
    const next = [...order];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    setOrder(next);
    setRun(null);
  }
  function attack() {
    const result = heist(order);
    setRun(result);
    setShown(0);
    if (result.outcome === "drained") setRobbed(true);
  }

  const now = run?.events[Math.min(shown, total) - 1];
  const vault = now?.vault ?? 8;
  const thief = now?.thief ?? 0;

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Panel title="withdraw(): put the lines in order">
        <ol className="grid grid-cols-[minmax(0,1fr)] gap-2">
          {order.map((step, i) => (
            <li key={step} className="flex min-w-0 items-center gap-3 border border-white/20 bg-black/50 p-3">
              <span className="min-w-0 flex-1">
                <code className="block font-mono text-sm break-words">{code[step].line}</code>
                <span className="mt-1 block text-sm text-gray-400">{code[step].note}</span>
              </span>
              <span className="flex shrink-0">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move “${code[step].note}” up`} className="grid size-11 cursor-pointer place-items-center hover:bg-white/10 disabled:opacity-25">
                  <ArrowUp size={18} aria-hidden="true" />
                </button>
                <button type="button" disabled={i === 2} onClick={() => move(i, 1)} aria-label={`Move “${code[step].note}” down`} className="grid size-11 cursor-pointer place-items-center hover:bg-white/10 disabled:opacity-25">
                  <ArrowDown size={18} aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          <LabButton onClick={attack} disabled={run !== null && !done}>
            {run ? "Attack again" : "Run the attack"}
          </LabButton>
          {done && run.outcome === "safe" && <ShareButton text={robbed ? "I robbed a smart contract, then fixed it." : "I wrote a vault an attacker could not rob."} />}
        </div>
        <p className="mt-5 text-sm text-gray-400">
          The attacker’s contract is owed 1 coin. Every time it is paid, it calls withdraw again before the first call has finished.
        </p>
      </Panel>

      <Panel title="What happened">
        <div className="grid grid-cols-2 gap-5">
          {[
            ["Vault", vault, "bg-white"],
            ["Attacker", thief, "bg-scarlet"],
          ].map(([name, count, tone]) => (
            <div key={name as string}>
              <p className="flex justify-between text-sm">
                <span className="text-gray-400">{name}</span>
                <span className="font-semibold tabular-nums">{count}</span>
              </p>
              <p aria-hidden="true" className="mt-2 grid h-24 grid-cols-4 content-end gap-1.5">
                {Array.from({ length: count as number }, (_, i) => (
                  <span key={i} className={`enter h-8 ${tone}`} />
                ))}
              </p>
            </div>
          ))}
        </div>
        <ol ref={logRef} className="mt-6 h-56 overflow-y-auto border-t border-white/20 pt-3 text-sm" tabIndex={0} aria-label="Call log">
          {run?.events.slice(0, shown).map((e, i) => (
            <li key={i} style={{ paddingInlineStart: `${Math.min(e.depth, 8) * 0.8}rem` }} className={`py-1 ${e.kind === "pay" ? "font-semibold text-white" : "text-gray-400"}`}>
              {e.kind === "pay" && <span aria-hidden="true" className="mr-2 inline-block size-2 bg-scarlet" />}
              {e.text}
            </li>
          ))}
          {!run && <li className="text-gray-400">Run the attack to see each call.</li>}
        </ol>
        <p aria-live="polite" className="wide mt-5 min-h-[2.6em] text-subhead">
          {done && verdict[run.outcome]}
        </p>
      </Panel>
    </div>
  );
}
