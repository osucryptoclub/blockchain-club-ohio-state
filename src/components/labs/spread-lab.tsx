"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { bestSeeds, network, reached, spread } from "@/lib/labs";
import { LabButton, Panel, ShareButton, Stat } from "./parts";

const SEEDS = 3;
const ROUNDS = 3;
const net = network(11);
const sx = (x: number) => 500 + x * 470;
const sy = (y: number) => 320 + y * 470;

/** Marketing: choose three people to tell first. */
export function SpreadLab() {
  const [seeds, setSeeds] = useState<number[]>([]);
  const [round, setRound] = useState(-1);
  const [showBest, setShowBest] = useState(false);
  const best = useMemo(() => bestSeeds(net.links, SEEDS, ROUNDS), []);
  const top = reached(net.links, best, ROUNDS);
  const active = showBest ? best : seeds;
  const at = spread(net.links, active);
  const heard = round < 0 ? active.length : at.filter((d) => d <= round).length;
  const finished = round >= ROUNDS;
  const mine = reached(net.links, seeds, ROUNDS);

  useEffect(() => {
    if (round < 0 || round >= ROUNDS) return;
    const quick = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = window.setTimeout(() => setRound(round + 1), quick ? 0 : 750);
    return () => window.clearTimeout(id);
  }, [round]);

  function toggle(i: number) {
    if (round >= 0) return;
    setSeeds(seeds.includes(i) ? seeds.filter((s) => s !== i) : seeds.length < SEEDS ? [...seeds, i] : seeds);
  }
  // Any tap counts for the closest person, so small screens stay playable.
  function choose(event: MouseEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const [x, y] = [((event.clientX - box.left) / box.width) * 1000, ((event.clientY - box.top) / box.height) * 640];
    const away = net.points.map((p) => Math.hypot(sx(p.x) - x, sy(p.y) - y));
    const near = away.indexOf(Math.min(...away));
    if (away[near] < 75) toggle(near);
  }
  function reset() {
    setSeeds([]);
    setRound(-1);
    setShowBest(false);
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <Panel title="Choose three people to tell first">
        <div className="-mx-5 overflow-x-auto px-5 lg:-mx-7 lg:px-7">
        <svg viewBox="0 0 1000 640" onClick={choose} className="w-full min-w-136 touch-manipulation" role="group" aria-label="Network">
          {net.links.flatMap((list, a) =>
            list
              .filter((b) => b > a)
              .map((b) => {
                const lit = round >= 0 && Math.min(at[a], at[b]) < round && Math.max(at[a], at[b]) <= round;
                return (
                  <line
                    key={`${a}-${b}`}
                    x1={sx(net.points[a].x)}
                    y1={sy(net.points[a].y)}
                    x2={sx(net.points[b].x)}
                    y2={sy(net.points[b].y)}
                    stroke={lit ? "var(--color-scarlet)" : "currentColor"}
                    strokeOpacity={lit ? 1 : 0.28}
                    strokeWidth={lit ? 4 : 2}
                    className="transition-all duration-500"
                  />
                );
              }),
          )}
          {net.points.map((p, i) => {
            const seed = active.includes(i);
            const lit = round >= 0 && at[i] <= round;
            return (
              <g
                key={i}
                role="button"
                tabIndex={round < 0 ? 0 : -1}
                aria-pressed={seed}
                aria-label={`Person ${i + 1}, ${net.links[i].length} connections${lit ? ", heard it" : ""}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(i);
                  }
                }}
                className="cursor-pointer focus-visible:outline-none [&:focus-visible>rect:last-child]:stroke-white [&:hover>rect:last-child]:stroke-white"
              >
                <rect x={sx(p.x) - 24} y={sy(p.y) - 24} width="48" height="48" fill="transparent" />
                <rect
                  x={sx(p.x) - (seed ? 15 : 10)}
                  y={sy(p.y) - (seed ? 15 : 10)}
                  width={seed ? 30 : 20}
                  height={seed ? 30 : 20}
                  strokeWidth="3"
                  className={`transition-all duration-300 ${seed || lit ? "fill-scarlet" : "fill-white"} ${seed ? "stroke-white" : "stroke-transparent"}`}
                />
              </g>
            );
          })}
        </svg>
        </div>
      </Panel>
      <Panel title="Reach after three rounds">
        <dl className="grid grid-cols-2 gap-5 lg:grid-cols-1">
          <Stat label="Messages placed" value={`${seeds.length} of ${SEEDS}`} />
          <Stat label={round < 0 ? "Heard so far" : `Heard by round ${Math.min(round, ROUNDS)}`} value={`${heard} of ${net.points.length}`} loud={finished} />
        </dl>
        <p aria-live="polite" className="wide mt-6 min-h-[5em] text-subhead">
          {!finished
            ? round < 0
              ? seeds.length < SEEDS
                ? "Look for people whose circles do not overlap."
                : "Ready."
              : "Spreading…"
            : showBest
              ? `This is the most anyone can reach: ${top} people.`
              : mine === top
                ? `Perfect. ${mine} people is the most anyone can reach.`
                : `You reached ${mine}. The best three would reach ${top}.`}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {round < 0 ? (
            <LabButton onClick={() => setRound(0)} disabled={seeds.length < SEEDS}>
              Send it
            </LabButton>
          ) : (
            <LabButton onClick={reset} disabled={!finished}>
              Try again
            </LabButton>
          )}
          {finished && !showBest && mine < top && (
            <LabButton
              quiet
              onClick={() => {
                setShowBest(true);
                setRound(0);
              }}
            >
              Show the best
            </LabButton>
          )}
          {finished && !showBest && <ShareButton text={`I reached ${mine} of ${net.points.length} people with three messages. The best possible is ${top}.`} />}
        </div>
      </Panel>
    </div>
  );
}
