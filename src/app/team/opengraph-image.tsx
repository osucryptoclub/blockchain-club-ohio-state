import { socialImage } from "@/lib/social";

export { contentType, size } from "@/lib/social";
export const alt = "Run by students. Meet the people who lead the club.";

export default function Image() {
  return socialImage("Run by students.", "Meet the people who lead the club.");
}
