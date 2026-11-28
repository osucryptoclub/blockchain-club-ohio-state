import { socialImage } from "@/lib/social";

export { contentType, size } from "@/lib/social";
export const alt = "Four cohorts. One club. Builders, Investments, Research, and Marketing.";

export default function Image() {
  return socialImage("Four cohorts. One club.", "Builders, Investments, Research, and Marketing.");
}
