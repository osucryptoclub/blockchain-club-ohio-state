import { socialImage } from "@/lib/social";

export { contentType, size } from "@/lib/social";
export const alt = "Many questions, one community. The areas our members work on.";

export default function Image() {
  return socialImage("Many questions, one community.", "The areas our members work on.");
}
