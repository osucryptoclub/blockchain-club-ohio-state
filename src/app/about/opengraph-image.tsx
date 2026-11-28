import { socialImage } from "@/lib/social";

export { contentType, size } from "@/lib/social";
export const alt = "Students building what comes next. Who we are and what we are here to do.";

export default function Image() {
  return socialImage("Students building what comes next.", "Who we are and what we are here to do.");
}
