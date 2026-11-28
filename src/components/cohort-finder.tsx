"use client";

import { ArrowLeft, ArrowRight, Check, Download, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Action } from "@/components/action";
import { CohortBadge, CohortLogo } from "@/components/cohort-logo";
import { ShareButton } from "@/components/labs/parts";
import { cohorts } from "@/content/cohorts";
import { projects } from "@/content/projects";
import { questions } from "@/content/quiz";
import { tracks, type Track } from "@/content/tracks";
import { cohortMarks, type Tone } from "@/lib/cohort-marks";
import { because, leaning, list, score, type Picks } from "@/lib/quiz";

type Slug = Track["slug"];

/** Each track's slab color: top, left, right. */
const tones: Record<Slug, [string, string, string]> = {
  builders: ["#bb0000", "#8b0000", "#5c0000"],
  investments: ["#ffffff", "#c3cace", "#8d969c"],
  research: ["#5b6368", "#33383b", "#1d2022"],
  marketing: ["#e8443a", "#a3140d", "#6b0b07"],
};

const trackOf = (slug: Slug) => tracks.find((t) => t.slug === slug) as Track;

/** The track a question's answers lean toward together, which colors its slab. */
function slabFor(q: number, chosen: number[]): Slug | undefined {
  if (!chosen.length) return undefined;
  const points: Partial<Record<Slug, number>> = {};
  for (const a of chosen) for (const [s, v] of Object.entries(questions[q].answers[a].points)) points[s as Slug] = (points[s as Slug] ?? 0) + v;
  return leaning(points);
}

/** The block a person has built so far, one slab per question. */
function Slabs({ picks }: { picks: (Slug | undefined)[] }) {
  const step = 300 / questions.length;
  return (
    <svg viewBox="0 0 320 420" className="mx-auto w-full max-w-80" aria-hidden="true">
      {Array.from({ length: questions.length }, (_, i) => {
        const slug = picks[i];
        const y = 320 - i * step;
        const [top, left, right] = slug ? tones[slug] : ["none", "none", "none"];
        return (
          <g key={i} className={slug ? "slab" : ""} stroke={slug ? "none" : "currentColor"} strokeOpacity="0.22" strokeDasharray={slug ? undefined : "4 5"}>
            <polygon points={`30,${y} 160,${y + 65} 160,${y + 90} 30,${y + 25}`} fill={left} />
            <polygon points={`290,${y} 160,${y + 65} 160,${y + 90} 290,${y + 25}`} fill={right} />
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
  const gap = 400 / picks.length;
  for (const [i, slug] of picks.entries()) {
    const y = 890 - i * gap;
    const [top, left, right] = tones[slug];
    poly([[310, y], [540, y + 115], [540, y + 160], [310, y + 45]], left);
    poly([[770, y], [540, y + 115], [540, y + 160], [770, y + 45]], right);
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

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Asks the server for a short personal note. Silent when no model is set up. */
function useNote(picks: Picks, ready: boolean) {
  const [note, setNote] = useState<string | null>(null);
  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    fetch("/api/assistant", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ assessment: picks }),
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { text?: string } | null) => d?.text && setNote(d.text))
      .catch(() => {});
    return () => {
      controller.abort();
      setNote(null);
    };
  }, [picks, ready]);
  return note;
}

function Result({ picks, onRetake, headingRef }: { picks: Picks; onRetake: () => void; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  const result = score(questions, picks);
  const [first, second] = result.ranked;
  const track = trackOf(first.slug);
  const runnerUp = trackOf(second.slug);
  const why = because(questions, result.reasons[first.slug]);
  const whySecond = because(questions, result.reasons[second.slug]).filter((w) => !why.includes(w)).slice(0, 2);
  const cohort = cohorts.find((c) => c.name === track.name && c.status !== "complete");
  const work = projects.filter((p) => cohort && p.cohort === cohort.slug);
  const [grown, setGrown] = useState(false);
  const note = useNote(picks, true);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const slabs = picks.map((p, q) => slabFor(q, p) ?? first.slug);

  function save() {
    drawCard(track, slabs, result.hash).toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `my-cohort-${track.slug}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }

  return (
    <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="min-w-0">
        <p className="enter flex items-center gap-4 font-semibold">
          <CohortBadge slug={track.slug} className="size-20" />
          {result.close ? "Your best fits" : "Your cohort"}
        </p>
        <h2 ref={headingRef} tabIndex={-1} className="metal wide mt-5 text-title outline-none">
          {track.name}
        </h2>
        <p className="rise mt-4 text-lead text-gray-300">
          {result.close ? (
            <>
              Close call: <strong className="text-white">{runnerUp.name}</strong> is right behind it, and either would suit you.
            </>
          ) : (
            <>
              Second fit: <strong className="text-white">{runnerUp.name}</strong>
            </>
          )}
        </p>

        <ul className="mt-8 grid max-w-xl gap-3" aria-label="How well each cohort fits">
          {result.ranked.map(({ slug, fit }, i) => (
            <li key={slug} className="grid grid-cols-[1.5rem_7.5rem_minmax(0,1fr)_3rem] items-center gap-3">
              <CohortLogo slug={slug} className="size-6" />
              <span className={i < 2 ? "font-semibold" : "text-gray-300"}>{trackOf(slug).name}</span>
              <span aria-hidden="true" className="h-2.5 bg-white/15">
                <span
                  className="block h-full transition-[width] duration-1000 ease-out motion-reduce:transition-none"
                  style={{ width: grown ? `${Math.round(fit * 100)}%` : "0%", background: tones[slug][0], transitionDelay: `${i * 120}ms` }}
                />
              </span>
              <span className="text-right tabular-nums">{Math.round(fit * 100)}%</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-gray-400">Each score is how much of a cohort’s possible points your answers earned.</p>

        <div className="rise mt-10 max-w-[60ch] space-y-4 text-lead">
          <p>
            {why.length ? `You ${list(why)}. ` : ""}
            That is the heart of {track.name}: {track.focus.charAt(0).toLowerCase() + track.focus.slice(1)}
          </p>
          {whySecond.length > 0 && (
            <p className="text-gray-300">
              {sentence(runnerUp.name)} came up because you {list(whySecond)}. Members often work across cohorts, so you can try both.
            </p>
          )}
          {note && (
            <p className="border-l-2 border-scarlet pl-4 text-gray-300" aria-live="polite">
              {note}
            </p>
          )}
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <section>
            <h3 className="font-semibold">What you would do</h3>
            <ul className="mt-3 grid gap-2 text-gray-300">
              {track.activities.map((a) => (
                <li key={a} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 size-2 shrink-0" style={{ background: tones[track.slug][0] }} />
                  {a}
                </li>
              ))}
              {work.map((p) => (
                <li key={p.slug} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 size-2 shrink-0" style={{ background: tones[track.slug][0] }} />
                  <span>
                    Current project:{" "}
                    <a href={`/projects#${p.slug}`} className="link text-white">
                      {p.title}
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="font-semibold">Skills you would build</h3>
            <ul className="mt-3 grid gap-2 text-gray-300">
              {track.skills.map((s) => (
                <li key={s} className="flex gap-3">
                  <Check size={16} aria-hidden="true" className="mt-1 shrink-0 text-white" />
                  {s}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-10 border-t border-white/20 pt-6">
          <h3 className="font-semibold">Your next step</h3>
          <p className="mt-2 max-w-[60ch] text-gray-300">
            {cohort ? (
              <>
                The {cohort.name} cohort is {cohort.status === "active" ? "in session" : "coming up"} for {cohort.term}.{" "}
                <a href={`/cohorts/${cohort.slug}`} className="link text-white">
                  See what it is working on
                </a>
                , then come to a meeting and apply before the deadline.
              </>
            ) : (
              <>Come to a meeting, then apply before the deadline.</>
            )}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Action href="/join#apply">Join the {track.name} Cohort</Action>
            <Action href={`/labs/${track.slug}`} variant="outline">
              Try the {track.name} lab
            </Action>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={save} className="lab-button border border-white/40 hover:bg-white hover:text-black">
              <Download size={17} aria-hidden="true" /> Save my block
            </button>
            <ShareButton text={`My cohort is ${track.name}. Find yours.`} label="Share" />
            <button type="button" onClick={onRetake} className="lab-button cursor-pointer hover:bg-white/10">
              <RotateCcw size={17} aria-hidden="true" /> Retake
            </button>
          </div>
        </section>

        <details className="mt-10 border-t border-white/20 pt-6">
          <summary className="min-h-11 cursor-pointer font-semibold">How we scored this</summary>
          <p className="mt-3 max-w-[60ch] text-sm text-gray-400">
            No AI decides your result. Every answer adds fixed points to one or more cohorts. Answers picked together on one question share its points. These answers counted most toward {track.name}:
          </p>
          <ol className="mt-4 grid gap-2 text-sm">
            {result.reasons[first.slug].slice(0, 6).map(({ question, answer, points }) => (
              <li key={`${question}.${answer}`} className="grid grid-cols-[minmax(0,1fr)_3.5rem] gap-3 border-b border-white/10 pb-2">
                <span>
                  <span className="text-gray-400">{questions[question].topic}:</span> {questions[question].answers[answer].text}
                </span>
                <span className="text-right tabular-nums">+{Math.round(points * 10) / 10}</span>
              </li>
            ))}
          </ol>
        </details>
        <p className="mt-6 text-sm text-gray-400">A starting point, not a test. Every cohort is open to every major, and you can change your mind.</p>
      </div>
      <div className="max-lg:hidden lg:sticky lg:top-28">
        <Slabs picks={slabs} />
        <p className="mt-4 text-center font-mono text-sm break-all text-gray-400">block {result.hash.slice(0, 24)}…</p>
      </div>
    </div>
  );
}

/** A welcome, ten questions, and a result with the reasoning shown. */
export function CohortFinder() {
  // -1 is the welcome screen; questions.length is the result.
  const [step, setStep] = useState(-1);
  const [picks, setPicks] = useState<Picks>(() => questions.map(() => []));
  const headingRef = useRef<HTMLHeadingElement>(null);
  const question = questions[step];

  function go(next: number) {
    setStep(next);
    // Move to the new screen so keyboard and screen reader users hear it.
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
    requestAnimationFrame(() => headingRef.current?.scrollIntoView({ block: "nearest" }));
  }
  function answer(i: number) {
    const max = question.pick ?? 1;
    const mine = picks[step];
    const next = max === 1 ? [i] : mine.includes(i) ? mine.filter((x) => x !== i) : mine.length < max ? [...mine, i].sort((a, b) => a - b) : mine;
    setPicks(picks.map((p, q) => (q === step ? next : p)));
    if (max === 1) go(step + 1);
  }
  function retake() {
    setPicks(questions.map(() => []));
    go(-1);
  }

  if (step >= questions.length) return <Result picks={picks} onRetake={retake} headingRef={headingRef} />;

  if (step < 0)
    return (
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="min-w-0">
          <h2 ref={headingRef} tabIndex={-1} className="wide text-title outline-none">
            Which cohort fits you?
          </h2>
          <p className="mt-5 max-w-[52ch] text-lead text-gray-300">
            Ten quick questions about how you think and what you want to build. You’ll get your best fit among Builders, Investments, Research, and Marketing, a runner-up, and the reasons behind both.
          </p>
          <ul className="mt-6 grid gap-2 text-gray-300">
            {["About two minutes", "No coding experience needed", "You see exactly how it was scored"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span aria-hidden="true" className="size-2 bg-scarlet" />
                {t}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => go(0)} className="block-fill mt-9 inline-flex min-h-14 cursor-pointer items-center gap-4 bg-scarlet px-7 py-3 font-semibold text-white transition-colors [--fill:var(--color-white)] hover:text-black focus-visible:text-black">
            Start the assessment <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="max-lg:hidden">
          <Slabs picks={[]} />
        </div>
      </div>
    );

  const max = question.pick ?? 1;
  const mine = picks[step];
  const done = picks.filter((p) => p.length).length;
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-4 text-sm text-gray-400">
          <span>
            Question {step + 1} of {questions.length} <span className="text-gray-500">·</span> {question.topic}
          </span>
          <button type="button" onClick={() => go(step - 1)} className="link inline-flex min-h-11 cursor-pointer items-center gap-2 text-white">
            <ArrowLeft size={16} aria-hidden="true" /> Back
          </button>
        </div>
        <div role="progressbar" aria-label="Progress" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={step} className="mt-2 h-1 bg-white/15">
          <div className="h-full bg-scarlet transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${(step / questions.length) * 100}%` }} />
        </div>
        <h2 ref={headingRef} tabIndex={-1} className="wide mt-8 text-heading outline-none">
          {question.ask}
        </h2>
        {max > 1 && (
          <p className="mt-2 text-sm text-gray-400" aria-live="polite">
            {mine.length} of {max} picked
          </p>
        )}
        <ul key={step} className={`mt-8 grid gap-3 ${question.answers.length > 4 ? "sm:grid-cols-2" : ""}`}>
          {question.answers.map((a, i) => {
            const on = mine.includes(i);
            const full = max > 1 && !on && mine.length >= max;
            return (
              <li key={a.text} className="enter" style={{ animationDelay: `${i * 50}ms` }}>
                <button
                  type="button"
                  onClick={() => answer(i)}
                  disabled={full}
                  aria-pressed={max > 1 ? on : undefined}
                  className={`block-fill group flex min-h-16 w-full cursor-pointer items-center gap-4 border px-5 py-4 text-left text-lead font-semibold transition-colors [--fill:var(--color-white)] hover:text-black focus-visible:text-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-white ${on ? "border-white bg-white/10" : "border-white/25"}`}
                >
                  <span aria-hidden="true" className={`grid size-5 shrink-0 place-items-center ${on ? "bg-scarlet" : max > 1 ? "border border-current" : "size-3! bg-scarlet"}`}>
                    {on && <Check size={14} className="text-white" />}
                  </span>
                  {a.text}
                </button>
              </li>
            );
          })}
        </ul>
        {max > 1 && (
          <button
            type="button"
            onClick={() => go(step + 1)}
            disabled={!mine.length}
            className="block-fill mt-6 inline-flex min-h-14 cursor-pointer items-center gap-4 bg-scarlet px-7 py-3 font-semibold text-white transition-colors [--fill:var(--color-white)] hover:text-black focus-visible:text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="max-lg:hidden">
        <Slabs picks={picks.map((p, q) => slabFor(q, p))} />
        <p className="mt-4 text-center font-mono text-sm text-gray-400">
          {done} of {questions.length} blocks
        </p>
      </div>
    </div>
  );
}
