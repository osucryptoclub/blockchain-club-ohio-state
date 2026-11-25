import { getLab, labs } from "@/content/labs";
import { socialImage } from "@/lib/social";

export { contentType, size } from "@/lib/social";
export const alt = "A hands-on lab from Blockchain Club at Ohio State";

export function generateStaticParams() {
  return labs.map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const lab = getLab((await params).slug);
  return socialImage(lab?.title ?? "Labs", lab ? `A hands-on lab. About ${lab.minutes} minutes.` : "Hands-on labs.", lab?.slug);
}
