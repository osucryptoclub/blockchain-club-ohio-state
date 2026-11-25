import { socialImage } from "@/lib/social";

export { contentType, size } from "@/lib/social";
export const alt = "Show up. Build something. Meetings, workshops, talks, and hackathons.";

export default function Image() {
  return socialImage("Show up. Build something.", "Meetings, workshops, talks, and hackathons.");
}
