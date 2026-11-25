import { socialImage } from "@/lib/social";

export { contentType, size } from "@/lib/social";
export const alt = "Find your cohort. Six questions, one block, one cohort.";

export default function Image() {
  return socialImage("Find your cohort.", "Six questions, one block, one cohort.");
}
