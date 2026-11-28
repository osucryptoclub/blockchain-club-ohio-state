"use client";

import { Action } from "@/components/action";
import { CampusBackdrop, PhotoCredit } from "@/components/campus-photo";
import { Countdown, usePhase } from "@/components/countdown";
import { applications } from "@/content/applications";
import type { CampusPhoto } from "@/content/campus";
import { formatLong, formatTime } from "@/lib/applications";

/** Full-width call to apply: a campus photograph, the deadline, and the countdown. */
export function DeadlineBand({ photo, id = "apply-deadline" }: { photo: CampusPhoto; id?: string }) {
  const state = usePhase(applications);
  if (!applications.deadline) return null;
  const closed = state?.state === "closed";
  const date = formatLong(applications.deadline);
  const day = date.replace(/, \d{4}$/, "");

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative isolate overflow-hidden bg-black py-24 text-white lg:py-36">
      <CampusBackdrop photo={photo} />
      <div className="shell grid gap-12 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-5">
          <p className="flex items-center gap-3 font-semibold">
            <span aria-hidden="true" className={`size-2.5 ${closed ? "bg-white/50" : "animate-pulse bg-scarlet"}`} />
            {closed ? "Applications closed" : "Cohort applications"}
          </p>
          <h2 id={`${id}-title`} className="rise metal wide mt-6 max-w-[12ch] text-heading">
            {closed ? "See you next round." : `Apply by ${day}.`}
          </h2>
          <p className="mt-6 max-w-[42ch] text-lead">
            {closed
              ? `Applications closed on ${date}. Meetings and events stay open to everyone.`
              : `Builders, Investments, Research, and Marketing all take applications until ${date}, ${formatTime(applications.deadline)}.`}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            {applications.applyUrl && !closed ? (
              <Action href={applications.applyUrl}>Apply now</Action>
            ) : (
              <Action href="/join#apply">{closed ? "Join the Club" : "How to apply"}</Action>
            )}
            <Action href="/find-your-cohort" variant="outline">
              Find your cohort
            </Action>
          </div>
        </div>
        <div className="lg:col-span-7">
          {!closed && (
            <>
              <p className="mb-4 text-sm tracking-wider uppercase">Time left to apply</p>
              <Countdown variant="display" />
            </>
          )}
        </div>
      </div>
      <PhotoCredit photo={photo} className="shell absolute inset-x-0 bottom-4 sm:text-right" />
    </section>
  );
}
