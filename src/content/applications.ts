/**
 * Cohort applications. THE APPLICATION DEADLINE LIVES HERE, AND ONLY HERE.
 * Every countdown, deadline message, and "apply by" line on the site reads
 * `deadline` from this file, so changing it updates the whole site.
 *
 * Dates need a UTC offset: -05:00 in winter (EST), -04:00 in summer (EDT).
 *
 * - `deadline`: when applications close. The countdowns count down to it,
 *   then say applications have closed. null hides every countdown.
 * - `opens`: optional. Set it only if applications open later than today;
 *   until then the countdown counts to the opening instead.
 * - `applyUrl`: the application form. While it is null, the site sends people
 *   to the Join page and says the form link is coming. Set it and an
 *   "Apply now" button appears everywhere.
 */

export type Applications = {
  /** Who is applying, finishing the sentence "Applications for …". */
  cohort: string;
  deadline: string | null;
  opens: string | null;
  applyUrl: string | null;
};

export const applications: Applications = {
  cohort: "all four cohorts",
  // January 23, 2027, end of the day in Columbus.
  deadline: "2027-01-23T23:59:59-05:00",
  opens: null,
  applyUrl: null,
};
