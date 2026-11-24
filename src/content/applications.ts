/**
 * The next cohort's application window. The Join page counts down to `opens`,
 * shows the apply button while the window is open, and says when it closed.
 *
 * Dates need a UTC offset: -05:00 in winter, -04:00 in summer. Leave `opens`
 * as null until the date is confirmed; the page then says it is coming soon.
 *
 * Example:
 *   cohort: "Builders, Spring 2027",
 *   opens: "2027-01-12T09:00:00-05:00",
 *   closes: "2027-01-26T23:59:00-05:00",
 *   applyUrl: "https://forms.gle/...",
 */

export type Applications = {
  cohort: string;
  opens: string | null;
  closes: string | null;
  /** The application form. The button only appears once this is set. */
  applyUrl: string | null;
};

export const applications: Applications = {
  cohort: "the next Builders cohort",
  opens: null,
  closes: null,
  applyUrl: null,
};
