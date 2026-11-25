import { socialImage } from "@/lib/social";

export { contentType, size } from "@/lib/social";
export const alt = "Don’t read about it. Break it. Four experiments you can run in your browser.";

export default function Image() {
  return socialImage("Don’t read about it. Break it.", "Four experiments you can run in your browser.");
}
