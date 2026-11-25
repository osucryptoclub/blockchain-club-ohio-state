"use client";

import { useSyncExternalStore } from "react";
import { Action } from "@/components/action";
import type { Applications } from "@/content/applications";
import { parts, phase } from "@/lib/applications";

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

const dateFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

const units = ["days", "hours", "minutes", "seconds"] as const;
const unitLabels = { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" };

function Cells({ values }: { values?: ReturnType<typeof parts> }) {
  return (
    <ol className="grid grid-cols-4 border-t border-l border-white/20" aria-hidden="true">
      {units.map((u) => (
        <li key={u} className="border-r border-b border-white/20 px-3 py-5 sm:px-6 sm:py-8">
          <span
            key={values?.[u]}
            className={`block font-mono text-[clamp(2rem,6.5vw,5rem)] leading-none tabular-nums ${values ? "tick" : "text-white/30"}`}
          >
            {values ? String(values[u]).padStart(2, "0") : "––"}
          </span>
          <span className="mt-3 block text-xs tracking-wider text-white/70 uppercase sm:text-sm">{unitLabels[u]}</span>
        </li>
      ))}
    </ol>
  );
}

/** Counts down to the application window, then shows the form while it is open. */
export function Countdown({ apps }: { apps: Applications }) {
  const time = useSyncExternalStore(subscribe, read, () => null);
  const state = time === null ? null : phase(apps, time);
  const opens = apps.opens ? dateFormat.format(Date.parse(apps.opens)) : null;
  const closes = apps.closes ? dateFormat.format(Date.parse(apps.closes)) : null;

  if (!apps.opens) {
    return (
      <div>
        <p className="flex items-center gap-3 font-semibold">
          <span aria-hidden="true" className="size-2.5 bg-white" />
          Date to be announced
        </p>
        <p className="mt-4 mb-10 max-w-[52ch] text-lead">
          Applications for {apps.cohort} open soon. The date is posted here first, with a countdown to the minute.
        </p>
        <Cells />
      </div>
    );
  }

  if (state?.state === "open") {
    return (
      <div>
        <p className="flex items-center gap-3 font-semibold">
          <span aria-hidden="true" className="size-2.5 animate-pulse bg-white" />
          Applications are open
        </p>
        <p className="mt-4 mb-10 max-w-[52ch] text-lead">
          Apply to {apps.cohort}
          {closes ? ` by ${closes}.` : "."}
        </p>
        {apps.applyUrl ? (
          <Action href={apps.applyUrl} variant="inverse">
            Start your application
          </Action>
        ) : (
          <p className="max-w-[52ch]">The application form link will be posted here shortly.</p>
        )}
      </div>
    );
  }

  if (state?.state === "closed") {
    return (
      <div>
        <p className="flex items-center gap-3 font-semibold">
          <span aria-hidden="true" className="size-2.5 bg-white/50" />
          Applications have closed
        </p>
        <p className="mt-4 max-w-[52ch] text-lead">
          Applications for {apps.cohort} closed{closes ? ` on ${closes}` : ""}. You can still come to meetings and
          events, and the next window will be announced here.
        </p>
      </div>
    );
  }

  const remaining = state?.state === "upcoming" ? parts(state.remaining) : undefined;
  return (
    <div>
      <p className="flex items-center gap-3 font-semibold">
        <span aria-hidden="true" className="size-2.5 bg-white" />
        Applications open {opens}
      </p>
      <p className="mt-4 mb-10 max-w-[52ch] text-lead">
        For {apps.cohort}
        {closes ? `, through ${closes}` : ""}.
      </p>
      <Cells values={remaining} />
      {remaining && (
        <p className="sr-only" aria-live="off">
          {remaining.days} days, {remaining.hours} hours, and {remaining.minutes} minutes until applications open.
        </p>
      )}
    </div>
  );
}
