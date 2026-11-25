"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { cohortStatuses } from "@/content/cohorts";
import { orderedCohorts } from "@/lib/roster";

/** The Cohorts entry in the main menu: a link-styled button that opens every cohort. */
export function CohortsMenu({ label }: { label: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panel = useId();
  const current = pathname.startsWith("/cohorts");

  // Close when the page changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        root.current?.querySelector("button")?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={root}
      className="relative"
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panel}
        onClick={() => setOpen((o) => !o)}
        data-current={current || undefined}
        className="group relative flex cursor-pointer items-center gap-1.5 py-2 text-[0.9375rem] font-medium text-white/80 transition-colors hover:text-white data-current:text-white"
      >
        {label}
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`transition-transform duration-300 ease-block ${open ? "rotate-180" : ""}`}
        />
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-scarlet transition-transform duration-300 ease-block group-hover:scale-x-100 group-data-current:scale-x-100"
        />
      </button>

      {/* The padding bridges the gap so the pointer can travel into the panel. */}
      <div id={panel} hidden={!open} className="absolute top-full left-1/2 w-[25rem] -translate-x-1/2 pt-5">
        <div className="menu-panel border border-white/15 bg-coal/95 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl">
          <p className="border-b border-white/10 px-5 pt-4 pb-3 font-mono text-xs tracking-wider text-gray-400 uppercase">
            Cohorts
          </p>
          <ul>
            {orderedCohorts.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/cohorts/${c.slug}`}
                  aria-current={pathname === `/cohorts/${c.slug}` ? "page" : undefined}
                  className="group/item flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 transition-colors hover:bg-white/5 aria-[current=page]:bg-white/5"
                >
                  <span>
                    <span className="block font-semibold">
                      {c.name} <span className="font-normal text-white/70">· {c.term}</span>
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-sm text-gray-400">
                      <span
                        aria-hidden="true"
                        className={`size-1.5 ${c.status === "active" ? "bg-scarlet" : "bg-gray-400"}`}
                      />
                      {cohortStatuses[c.status]}
                    </span>
                  </span>
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="shrink-0 text-white/50 transition-transform duration-300 group-hover/item:translate-x-1 group-hover/item:text-white"
                  />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/cohorts" className="flex items-center gap-2 px-5 py-4 text-sm font-semibold hover:underline">
            All cohorts and how they work
          </Link>
        </div>
      </div>
    </div>
  );
}
