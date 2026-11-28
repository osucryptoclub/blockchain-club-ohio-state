import { socialImage } from "@/lib/social";

export { contentType, size } from "@/lib/social";
export const alt = "Work you can check. Student software, research, and hackathon projects.";

export default function Image() {
  return socialImage("Work you can check.", "Student software, research, and hackathon projects.");
}
