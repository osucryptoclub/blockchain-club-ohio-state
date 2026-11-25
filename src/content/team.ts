/**
 * Officers. Everything here must be confirmed: leave a field out rather than
 * guess it. Cards adjust to whatever is present.
 *
 * Example:
 *   {
 *     name: "Full Name",
 *     role: "Vice President",
 *     bio: "One or two sentences.",
 *     education: "Degree or college",              // optional
 *     linkedin: "https://www.linkedin.com/in/...", // optional, checked by the person
 *     photo: "/team/name.jpg",                     // optional; square, 900px or larger, in public/team/
 *   }
 */

export type Leader = {
  name: string;
  role: string;
  bio: string;
  education?: string;
  linkedin?: string;
  photo?: string;
};

export const leaders: Leader[] = [
  {
    // Spelling, role, and club match Ohio State's student organization
    // directory; college and link match the public LinkedIn listing. November 2026.
    name: "Jack Korinek",
    role: "President",
    bio: "Sets the club’s direction and speaks for it on campus and beyond.",
    education: "Fisher College of Business, Ohio State",
    linkedin: "https://www.linkedin.com/in/jack-korinek/",
    photo: "/team/jack-korinek.webp",
  },
  {
    name: "Cooper Shalin",
    role: "Vice President",
    bio: "Helps run the club and keeps its four cohorts moving.",
    linkedin: "https://www.linkedin.com/in/cooper-shalin-294a26325/",
    photo: "/team/cooper-shalin.webp",
  },
  {
    name: "Emilio Laracuente",
    role: "Vice President",
    bio: "Helps run the club and keeps its four cohorts moving.",
    linkedin: "https://www.linkedin.com/in/emiliolaracuente/",
    photo: "/team/emilio-laracuente.webp",
  },
];
