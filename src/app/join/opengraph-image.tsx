import { socialImage } from "@/lib/social";

export { contentType, size } from "@/lib/social";
export const alt = "Join the Club. Open to any major and any level of experience.";

export default function Image() {
  return socialImage("Join the Club.", "Open to any major and any level of experience.");
}
