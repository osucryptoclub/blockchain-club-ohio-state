import { cohorts } from "@/content/cohorts";
import { trackNamed } from "@/content/tracks";
import { getCohort } from "@/lib/roster";
import { socialImage } from "@/lib/social";

export { contentType, size } from "@/lib/social";
export const alt = "A cohort of Blockchain Club at Ohio State";

export function generateStaticParams() {
  return cohorts.map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const cohort = getCohort((await params).slug);
  const track = cohort && trackNamed(cohort.name);
  return socialImage(cohort?.name ?? "Cohorts", cohort?.term ?? "", track?.slug);
}
