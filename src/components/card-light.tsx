"use client";

import { useEffect } from "react";

/**
 * Lights and tilts whichever [data-tilt] card is under a mouse. One listener
 * serves every card; the look is in globals.css.
 */
export function CardLight() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
    let current: HTMLElement | null = null;

    const clear = () => {
      if (!current) return;
      for (const name of ["--rx", "--ry"]) current.style.removeProperty(name);
      current = null;
    };
    const onMove = (event: PointerEvent) => {
      const card = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-tilt]") : null;
      if (card !== current) clear();
      if (!card) return;
      current = card;
      const box = card.getBoundingClientRect();
      const [x, y] = [(event.clientX - box.left) / box.width, (event.clientY - box.top) / box.height];
      card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
      card.style.setProperty("--ry", `${((x - 0.5) * 5).toFixed(2)}deg`);
      card.style.setProperty("--rx", `${((0.5 - y) * 5).toFixed(2)}deg`);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", clear);
    return () => {
      clear();
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", clear);
    };
  }, []);

  return null;
}
