/**
 * Leadership. Add people to a group's `members` as they are confirmed. A group
 * with no members shows as "To be announced".
 *
 * Example member:
 *   {
 *     name: "Full Name",
 *     role: "President",
 *     major: "Optional",
 *     photo: "/team/name.jpg",   // optional; file goes in public/team/, square, 600px or larger
 *     links: [{ label: "LinkedIn", url: "https://..." }],
 *   }
 */

export type Member = {
  name: string;
  role: string;
  major?: string;
  photo?: string;
  links?: { label: string; url: string }[];
};

export type TeamGroup = {
  name: string;
  responsibility: string;
  /** Shown while `members` is empty. Defaults to "To be announced". */
  placeholder?: string;
  members: Member[];
};

export const team: TeamGroup[] = [
  {
    name: "President",
    responsibility: "Sets direction and speaks for the club.",
    members: [],
  },
  {
    name: "Vice President",
    responsibility: "Runs operations and keeps every group moving.",
    members: [],
  },
  {
    name: "Technical Leads",
    responsibility: "Own workshops, code review, and technical standards.",
    members: [],
  },
  {
    name: "Development Team",
    responsibility: "Builds and maintains the club’s software.",
    members: [],
  },
  {
    name: "Marketing and Outreach",
    responsibility: "Handles events, communication, and partner relationships.",
    members: [],
  },
  {
    name: "General Members",
    responsibility: "Everyone who shows up, learns, and contributes.",
    placeholder: "Open to everyone who joins",
    members: [],
  },
];
