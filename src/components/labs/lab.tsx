import type { Lab as LabInfo } from "@/content/labs";
import { PoolLab } from "./pool-lab";
import { ProofLab } from "./proof-lab";
import { SpreadLab } from "./spread-lab";
import { VaultLab } from "./vault-lab";

const byTrack = { builders: VaultLab, investments: PoolLab, research: ProofLab, marketing: SpreadLab };

export function Lab({ slug }: { slug: LabInfo["slug"] }) {
  const Component = byTrack[slug];
  return <Component />;
}
