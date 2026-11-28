/**
 * Leadership groups. People are assigned to a group in src/content/people.ts
 * with `team: { group: "<id>", role: "..." }`. A group with nobody assigned
 * shows its placeholder, or "Names posted once confirmed."
 */

import type { TeamGroupId } from "./people.ts";

export type TeamGroup = {
  id: TeamGroupId;
  name: string;
  responsibility: string;
  placeholder?: string;
};

export const team: TeamGroup[] = [
  { id: "president", name: "President", responsibility: "Sets direction and speaks for the club." },
  { id: "vice-president", name: "Vice President", responsibility: "Runs operations and keeps every group moving." },
  { id: "technical", name: "Technical Leads", responsibility: "Own workshops, code review, and technical standards." },
  { id: "development", name: "Development Team", responsibility: "Builds and maintains the club’s software." },
  {
    id: "outreach",
    name: "Marketing and Outreach",
    responsibility: "Handles events, communication, and partner relationships.",
  },
];
