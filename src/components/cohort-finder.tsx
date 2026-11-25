"use client";

import { Download } from "lucide-react";
import { useRef, useState } from "react";
import { Action } from "@/components/action";
import { CohortBadge, CohortLogo } from "@/components/cohort-logo";
import { ShareButton } from "@/components/labs/parts";
import { questions } from "@/content/quiz";
import { tracks, type Track } from "@/content/tracks";
import { cohortMarks, type Tone } from "@/lib/cohort-marks";
import { leaning, score } from "@/lib/quiz";

type Slug = Track["slug"];

/** Each track's slab color: top, left, right. */
const tones: Record<Slug, [string, string, string]> = {
  builders: ["#bb0000", "#8b0000", "#5c0000"],
  investments: ["#ffffff", "#c3cace", "#8d969c"],
  research: ["#5b6368", "#33383b", "#1d2022"],
  marketing: ["#e8443a", "#a3140d", "#6b0b07"],
};

/** The block a person has built so far, one slab per answer. */
function Slabs({ picks }: { picks: Slug[] }) {
  return (
    <svg viewBox="0 0 320 380" className="mx-auto w-full max-w-80" aria-hidden="true">
      {Array.from({ length: questions.length }, (_, i) => {
        const slug = picks[i];
        const y = 270 - i * 38;
        const [top, left, right] = slug ? tones[slug] : ["none", "none", "none"];
        return (
          <g key={i} className={slug ? "slab" : ""} stroke={slug ? "none" : "currentColor"} strokeOpacity="0.22" strokeDasharray={slug ? undefined : "4 5"}>
            <polygon points={`30,${y} 160,${y + 65} 160,${y + 95} 30,${y + 30}`} fill={left} />
            <polygon points={`290,${y} 160,${y + 65} 160,${y + 95} 290,${y + 30}`} fill={right} />
            <polygon points={`160,${y - 65} 290,${y} 160,${y + 65} 30,${y}`} fill={top} />
          </g>
        );
      })}
    </svg>
  );
}

/** Draws the result as an image to keep or post. */
function drawCard(track: Track, picks: Slug[], hash: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  [canvas.width, canvas.height] = [1080, 1350];
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const font = (weight: number, size: number) => `${weight} ${size}px ${getComputedStyle(document.body).fontFamily}`;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 1080, 1350);
  const glow = ctx.createRadialGradient(540, 1350, 0, 540, 1350, 950);
  glow.addColorStop(0, "#8b0000");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, 1350);

  const poly = (points: number[][], fill: string) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    for (const [i, [x, y]] of points.entries()) {
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.fill();
  };
  for (const [i, slug] of picks.entries()) {
    const y = 890 - i * 66;
    const [top, left, right] = tones[slug];
    poly([[310, y], [540, y + 115], [540, y + 168], [310, y + 53]], left);
    poly([[770, y], [540, y + 115], [540, y + 168], [770, y + 53]], right);
    poly([[540, y - 115], [770, y], [540, y + 115], [310, y]], top);
  }

  const colors: Record<Tone, string> = { line: "#ffffff", soft: "rgba(255,255,255,0.5)", accent: "#bb0000", deep: "#8b0000" };
  ctx.save();
  ctx.translate(80, 76);
  ctx.scale(1.15, 1.15);
  for (const shape of cohortMarks[track.slug]) {
    if ("points" in shape) poly(shape.points.split(" ").map((p) => p.split(",").map(Number)), colors[shape.tone]);
    else {
      ctx.strokeStyle = colors[shape.tone];
      ctx.lineWidth = shape.width;
      ctx.stroke(new Path2D(shape.path));
    }
  }
  ctx.restore();
  ctx.fillStyle = "#fff";
  ctx.font = font(600, 34);
  ctx.fillText("My cohort is", 250, 128);
  ctx.font = font(800, 92);
  ctx.fillText(track.name, 246, 212);
  ctx.font = font(700, 40);
  ctx.fillText("Blockchain Club at Ohio State", 80, 1216);
  ctx.font = "400 26px ui-monospace, Consolas, monospace";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText(`block ${hash.slice(0, 32)}`, 80, 1268);
  return canvas;
}

/** Six questions, one block, one cohort. */
export function CohortFinder() {
  const [chosen, setChosen] = useState<number[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const picks = chosen.map((pick, i) => leaning(questions[i].answers[pick].points));
  const question = questions[chosen.length];
  const result = question ? null : score(questions, chosen);
  const track = result && tracks.find((t) => t.slug === result.ranked[0].slug);

  function go(next: number[]) {
    setChosen(next);
    // Move to the new question so keyboard and screen reader users hear it.
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
  }
  function save() {
    if (!track || !result) return;
    drawCard(track, picks, result.hash).toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `my-cohort-${track.slug}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="min-w-0">
        {question ? (
          <>
            <p className="flex items-center gap-4 text-sm text-gray-400">
              Question {chosen.length + 1} of {questions.length}
              {chosen.length > 0 && (
                <button type="button" onClick={() => go(chosen.slice(0, -1))} className="link min-h-11 cursor-pointer text-white">
                  Back
                </button>
              )}
            </p>
            <h2 ref={headingRef} tabIndex={-1} className="wide mt-2 text-heading outline-none">
              {question.ask}
            </h2>
            <ul key={chosen.length} className="mt-8 grid gap-3">
              {question.answers.map((a, i) => (
                <li key={a.text} className="enter" style={{ animationDelay: `${i * 60}ms` }}>
                  <button
                    type="button"
                    onClick={() => go([...chosen, i])}
                    className="block-fill group flex min-h-16 w-full cursor-pointer items-center gap-4 border border-white/25 px-5 py-4 text-left text-lead font-semibold transition-colors [--fill:var(--color-white)] hover:text-black focus-visible:text-black"
                  >
                    <span aria-hidden="true" className="size-3 shrink-0 bg-scarlet" />
                    {a.text}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          track &&
          result && (
            <>
              <p className="flex items-center gap-4 font-semibold">
                <CohortBadge slug={track.slug} className="size-20" />
                Your cohort
              </p>
              <h2 ref={headingRef} tabIndex={-1} className="metal wide mt-5 text-title outline-none">
                {track.name}
              </h2>
              <p className="mt-5 max-w-[52ch] text-lead">{track.description}</p>
              <ul className="mt-8 grid max-w-lg gap-3">
                {result.ranked.map(({ slug, share }) => {
                  const t = tracks.find((x) => x.slug === slug);
                  return (
                    <li key={slug} className="grid grid-cols-[1.5rem_7.5rem_minmax(0,1fr)_3rem] items-center gap-3">
                      <CohortLogo slug={slug} className="size-6" />
                      <span>{t?.name}</span>
                      <span aria-hidden="true" className="h-2.5 bg-white/15">
                        <span className="block h-full bg-scarlet" style={{ width: `${share * 100}%` }} />
                      </span>
                      <span className="text-right tabular-nums">{Math.round(share * 100)}%</span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-9 flex flex-wrap gap-3">
                <Action href={`/labs/${track.slug}`}>Try the {track.name} lab</Action>
                <button type="button" onClick={save} className="lab-button border border-white/40 hover:bg-white hover:text-black">
                  <Download size={17} aria-hidden="true" /> Save my block
                </button>
                <ShareButton text={`My cohort is ${track.name}. Find yours.`} label="Share" />
                <button type="button" onClick={() => go([])} className="link min-h-13 cursor-pointer px-2 font-semibold">
                  Start over
                </button>
              </div>
              <p className="mt-6 text-sm text-gray-400">
                A starting point, not a test. Every cohort is open to every major, and you can change your mind.
              </p>
            </>
          )
        )}
      </div>
      <div className="max-lg:order-first max-lg:hidden">
        <Slabs picks={picks} />
        <p className="mt-4 text-center font-mono text-sm break-all text-gray-400">
          {result ? `block ${result.hash.slice(0, 24)}…` : `${picks.length} of ${questions.length} blocks`}
        </p>
      </div>
    </div>
  );
}
