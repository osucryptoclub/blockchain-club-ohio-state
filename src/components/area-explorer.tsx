"use client";

import Link from "next/link";
import { useState } from "react";
import { AreaGlyph } from "@/components/area-glyph";
import { areas } from "@/content/areas";

/** Index of areas. Pointing at one draws its diagram beside the list. */
export function AreaExplorer() {
  const [active, setActive] = useState(0);
  const area = areas[active];

  return (
    <div className="grid gap-x-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <ul className="rule border-t">
        {areas.map(({ slug, name, question }, i) => (
          <li key={slug} className="rule border-b">
            <Link
              href={`/what-we-do#${slug}`}
              data-active={i === active}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className="group grid grid-cols-[minmax(0,1fr)_4.5rem] items-center gap-x-5 py-5 lg:grid-cols-[0.75rem_minmax(0,1fr)] lg:py-[1.35rem]"
            >
              <span
                aria-hidden="true"
                className="hidden size-3 scale-0 bg-scarlet transition-transform duration-300 group-data-[active=true]:scale-100 lg:block"
              />
              <span className="min-w-0">
                <span className="widen block text-[clamp(1.375rem,2.4vw,2.25rem)] leading-tight xl:whitespace-nowrap lg:text-white/60 lg:group-data-[active=true]:text-white">
                  {name}
                </span>
                <span className="muted mt-1 block lg:sr-only">{question}</span>
              </span>
              <AreaGlyph slug={slug} className="size-18 lg:hidden" />
            </Link>
          </li>
        ))}
      </ul>

      <div aria-hidden="true" className="hidden lg:block">
        <div className="rule sticky top-28 border bg-coal p-8">
          <AreaGlyph key={area.slug} slug={area.slug} className="mx-auto aspect-square w-full max-w-96" />
          <p className="wide mt-6 min-h-[3.6em] text-subhead">{area.question}</p>
          <p className="muted mt-4 min-h-[3.2em] text-[0.9375rem]">{area.topics.join(", ")}</p>
        </div>
      </div>
    </div>
  );
}
