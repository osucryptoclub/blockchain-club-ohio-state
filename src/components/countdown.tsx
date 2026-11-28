"use client";

import { useSyncExternalStore } from "react";
import { Action } from "@/components/action";
import { applications as configured, type Applications } from "@/content/applications";
import { formatLong, formatTime, parts, phase, type Phase } from "@/lib/applications";

// One shared clock, ticking once a second while anything is listening.
let now = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
const read = () => (now ||= Date.now());
function subscribe(listener: () => void) {
  listeners.add(listener);
  timer ??= setInterval(() => {
    now = Date.now();
    listeners.forEach((l) => l());
  }, 1000);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/** Where applications stand, or null before the page has a clock (server render). */
export function usePhase(apps: Applications): Phase | null {
  const time = useSyncExternalStore(subscribe, read, () => null);
  return time === null ? null : phase(apps, time);
}

const units = ["days", "hours", "minutes", "seconds"] as const;
const labels = { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" };
const short = { days: "Days", hours: "Hrs", minutes: "Min", seconds: "Sec" };

function remainingOf(state: Phase | null) {
  if (state?.state === "upcoming") return parts(state.remaining);
  if (state?.state === "open" && state.remaining !== null) return parts(state.remaining);
  return undefined;
}

/** Four cells: days, hours, minutes, seconds. */
function Cells({ values, size = "md" }: { values?: ReturnType<typeof parts>; size?: "md" | "lg" }) {
  const digits = size === "lg" ? "text-[clamp(2.25rem,8vw,6.5rem)]" : "text-[clamp(2rem,6.5vw,5rem)]";
  return (
    <ol className="grid grid-cols-4 border-t border-l border-white/25" aria-hidden="true">
      {units.map((u) => (
        <li key={u} className="border-r border-b border-white/25 bg-black/30 px-3 py-5 backdrop-blur-[2px] sm:px-6 sm:py-7">
          <span
            key={values?.[u]}
            className={`block font-mono leading-none tabular-nums ${digits} ${values ? "tick" : "text-white/40"}`}
          >
            {values ? String(values[u]).padStart(2, "0") : "––"}
          </span>
          <span className="mt-3 block text-xs tracking-wider text-white uppercase sm:text-sm">
            <span className="sm:hidden">{short[u]}</span>
            <span className="max-sm:hidden">{labels[u]}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function Spoken({ values, what }: { values?: ReturnType<typeof parts>; what: string }) {
  if (!values) return null;
  // Read once, not every second.
  return (
    <p className="sr-only">
      {values.days} days, {values.hours} hours, and {values.minutes} minutes until {what}.
    </p>
  );
}

function Status({ dot, children }: { dot: string; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-semibold">
      <span aria-hidden="true" className={`size-2.5 ${dot}`} />
      {children}
    </p>
  );
}

/**
 * The application countdown.
 * - `panel`: status, deadline, the four cells, and how to apply. For the Join page.
 * - `display`: large cells only, for a section that sets its own heading.
 * - `line`: one sentence, for closing calls to action.
 */
export function Countdown({ apps = configured, variant = "panel" }: { apps?: Applications; variant?: "panel" | "display" | "line" }) {
  const state = usePhase(apps);
  const values = remainingOf(state);
  const deadline = apps.deadline ? formatLong(apps.deadline) : null;
  const closed = state?.state === "closed";
  const upcoming = state?.state === "upcoming";
  const what = upcoming ? "applications open" : "the application deadline";

  if (variant === "line") {
    if (!deadline && !apps.opens) return null;
    return (
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold">
        <span aria-hidden="true" className={`size-2.5 ${closed ? "bg-white/50" : "animate-pulse bg-white"}`} />
        {closed ? (
          <>Applications closed {deadline}.</>
        ) : upcoming ? (
          <>Applications open {apps.opens && formatLong(apps.opens)}.</>
        ) : (
          <>
            Applications close {deadline}
            {values && (
              <span className="font-mono font-normal tabular-nums opacity-90">
                · {values.days}d {String(values.hours).padStart(2, "0")}h {String(values.minutes).padStart(2, "0")}m{" "}
                {String(values.seconds).padStart(2, "0")}s
              </span>
            )}
          </>
        )}
      </p>
    );
  }

  if (variant === "display") {
    if (closed)
      return (
        <p className="wide max-w-[24ch] text-heading">
          Applications closed on {deadline}. The next window will be announced here.
        </p>
      );
    return (
      <div>
        <Cells values={values} size="lg" />
        <Spoken values={values} what={what} />
      </div>
    );
  }

  if (!deadline && !apps.opens) {
    return (
      <div>
        <Status dot="bg-white">Date to be announced</Status>
        <p className="mt-4 mb-10 max-w-[52ch] text-lead">
          Applications for {apps.cohort} open soon. The date is posted here first, with a countdown to the minute.
        </p>
        <Cells />
      </div>
    );
  }

  if (closed) {
    return (
      <div>
        <Status dot="bg-white/50">Applications have closed</Status>
        <p className="mt-4 max-w-[52ch] text-lead">
          Applications for {apps.cohort} closed on {deadline}. You can still come to meetings and events, and the next
          window will be announced here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {upcoming ? (
        <Status dot="bg-white">Applications open {apps.opens && formatLong(apps.opens)}</Status>
      ) : (
        <Status dot="animate-pulse bg-white">Applications are open</Status>
      )}
      <p className="mt-4 mb-10 max-w-[52ch] text-lead">
        {deadline ? (
          <>
            Apply to {apps.cohort} by <strong className="font-semibold">{deadline}</strong>, {apps.deadline && formatTime(apps.deadline)}.
          </>
        ) : (
          <>Apply to {apps.cohort}.</>
        )}
      </p>
      <Cells values={values} />
      <Spoken values={values} what={what} />
      <div className="mt-10">
        {apps.applyUrl && !upcoming ? (
          <Action href={apps.applyUrl} variant="inverse">
            Start your application
          </Action>
        ) : (
          <p className="max-w-[52ch]">The application form link will be posted right here. Until then, come to a meeting and choose your cohort.</p>
        )}
      </div>
    </div>
  );
}
