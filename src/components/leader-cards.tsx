import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";
import { leaders } from "@/content/team";
import { sha256 } from "@/lib/sha256";

/** The SHA-256 of a name as 64 blocks, one per digit. Stands in for a portrait. */
function Hashprint({ name }: { name: string }) {
  const step = 100 / 8;
  return (
    <svg viewBox="-4 -4 108 108" className="hashprint size-full" aria-hidden="true">
      {[...sha256(name)].map((digit, i) => {
        const value = parseInt(digit, 16);
        const size = Math.round((2 + (value / 15) * 8.5) * 100) / 100;
        const x = (i % 8) * step + step / 2 - size / 2;
        const y = Math.floor(i / 8) * step + step / 2 - size / 2;
        return (
          <rect
            key={i}
            x={Math.round(x * 100) / 100}
            y={Math.round(y * 100) / 100}
            width={size}
            height={size}
            className={value >= 13 ? "fill-scarlet" : "fill-white"}
            fillOpacity={value >= 13 ? 1 : 0.25 + (value / 15) * 0.7}
            style={{ "--i": (i % 8) + Math.floor(i / 8) } as CSSProperties}
          />
        );
      })}
    </svg>
  );
}

/** Officers. Details appear only where they have been verified. */
export function LeaderCards({ heading: Heading = "h3" }: { heading?: "h3" | "h4" }) {
  return (
    <ul className="grid gap-3 md:grid-cols-3">
      {leaders.map(({ name, role, bio, education, linkedin, photo }) => (
        <li key={name} className="rise">
          <div
            data-tilt=""
            className="group relative flex h-full flex-col border border-white/12 bg-coal hover:border-white/50"
          >
            <div className="relative aspect-square overflow-hidden border-b border-white/12 bg-[radial-gradient(circle_at_30%_20%,#3a0000,#0b0b0c_70%)]">
              {photo ? (
                <Image
                  src={photo}
                  alt={`Portrait of ${name}`}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-block group-hover:scale-[1.03]"
                />
              ) : (
                <div className="absolute inset-[14%]">
                  <Hashprint name={name} />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-6 lg:p-8">
              <p className="flex items-center gap-3 font-semibold">
                <span aria-hidden="true" className="size-2.5 shrink-0 bg-scarlet" />
                {role}
              </p>
              <Heading className="wide mt-3 text-cell">
                {linkedin ? (
                  <a href={linkedin} rel="noopener" className="hover:underline hover:underline-offset-4">
                    {name}
                  </a>
                ) : (
                  name
                )}
              </Heading>
              <p className="muted mt-4">{bio}</p>
              {education && <p className="mt-4">{education}</p>}
              {linkedin && (
                <p className="mt-auto pt-6">
                  <a
                    href={linkedin}
                    rel="noopener"
                    aria-label={`${name} on LinkedIn`}
                    className="link inline-flex items-center gap-1.5 font-semibold"
                  >
                    LinkedIn <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
