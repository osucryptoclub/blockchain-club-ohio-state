"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { monument, place, type TrackSlug } from "@/lib/world";
import { createRenderer } from "./renderer";

/**
 * A track's logo in three dimensions. It turns by itself and can be dragged.
 * `children` is shown until the scene is running, and instead of it where
 * WebGL 2 is missing.
 */
export function MonumentViewer({ slug, className = "", children }: { slug: TrackSlug; className?: string; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let renderer: ReturnType<typeof createRenderer> = null;
    let failed = false;
    let visible = false;
    let frame = 0;
    let last = 0;
    let clock = 2;
    let spin = 0.7;
    let tilt = 0.5;
    let speed = 0.25;
    let drag: { x: number; y: number } | null = null;

    const paint = () => {
      if (!renderer || renderer.lost() || canvas.clientWidth < 2) return;
      const r = 1.12;
      renderer.render({
        boxes: place(monument(slug, clock), [0, 0, 0], spin),
        eye: [0, r * Math.sin(tilt) + 0.16, r * Math.cos(tilt)],
        look: [0, 0.17, 0],
        focal: 1.75 * Math.min(1, canvas.clientWidth / canvas.clientHeight),
        shift: [0, 0],
        time: clock,
        wave: [0, 0, -1, 0],
        floor: 1,
      });
    };
    const tick = (now: number) => {
      frame = 0;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      clock += dt;
      if (!drag) {
        speed += (0.25 - speed) * Math.min(1, dt * 1.5);
        spin += speed * dt;
      }
      paint();
      if (visible && !still.matches) request();
      else last = 0;
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const watch = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) return;
        // Made on first sight: a page may hold several of these.
        if (!renderer && !failed) {
          try {
            renderer = createRenderer(canvas, true);
          } catch {
            renderer = null;
          }
          failed = !renderer;
          if (renderer) root.dataset.live = "";
        }
        if (renderer) request();
      },
      { rootMargin: "120px" },
    );
    const resize = new ResizeObserver(() => {
      renderer?.resize();
      paint();
    });

    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      spin += dx * 0.01;
      speed = dx * 0.35;
      tilt = Math.min(Math.max(tilt + (e.clientY - drag.y) * 0.006, 0.1), 1.2);
      drag = { x: e.clientX, y: e.clientY };
      request();
    };
    const up = () => {
      drag = null;
    };

    watch.observe(root);
    resize.observe(canvas);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(frame);
      watch.disconnect();
      resize.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [slug]);

  return (
    <div ref={rootRef} className={`viewer group/viewer relative isolate overflow-hidden ${className}`}>
      <div className="grid size-full place-items-center group-data-live/viewer:invisible">{children}</div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 size-full cursor-grab touch-pan-y opacity-0 transition-opacity duration-700 group-data-live/viewer:opacity-100 active:cursor-grabbing"
      />
    </div>
  );
}
