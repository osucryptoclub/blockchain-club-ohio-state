import { socialImage } from "@/lib/social";

export { contentType, size } from "@/lib/social";
export const alt = "Find your cohort. Ten questions, one block, one cohort.";

export default function Image() {
  return socialImage("Find your cohort.", "Ten questions, one block, one cohort.");
}
