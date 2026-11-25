import { socialImage } from "@/lib/social";

export { contentType, size } from "@/lib/social";
export const alt = "Back the next builders. Sponsor, speak, recruit, or collaborate.";

export default function Image() {
  return socialImage("Back the next builders.", "Sponsor, speak, recruit, or collaborate.");
}
