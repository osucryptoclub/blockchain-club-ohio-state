"use client";

import { useEffect, useRef, useState } from "react";
import { broadcast, oval, type Broadcast, type OvalEdge } from "@/lib/oval";

type Layout = {
  w: number;
  h: number;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  tilt: number;
  points: { x: number; y: number }[];
};

/** Pixels per second that a message travels. */
const SPEED = 520;
/** Seconds the network stays lit after the last node hears the message. */
const LINGER = 2.2;
const NODE = 4;

const TILT = -0.1;
/** Minimum gap between the ellipse and any hero text, in pixels. */
const CLEARANCE = 28;

/**
 * Sizes the ellipse so it never runs behind text. On narrow screens the canvas
 * has its own block and the ellipse fills it. On wide screens the canvas sits
 * behind the hero, so the ellipse starts to the right of the intro copy, drops
 * below the headline, and bleeds off the right and bottom edges.
 */
function place(canvas: HTMLCanvasElement): Layout {
  const box = canvas.getBoundingClientRect();
  const [w, h] = [box.width, box.height];
  const tilt = TILT;
  const [cos, sin] = [Math.cos(tilt), Math.sin(tilt)];
  let [cx, cy, rx, ry] = [w * 0.56, h * 0.5, w * 0.6, h * 0.4];

  const wrapper = canvas.parentElement;
  if (wrapper && getComputedStyle(wrapper).position === "absolute") {
    const edges = (selector: string) =>
      [...document.querySelectorAll(selector)].map((el) => {
        const r = el.getBoundingClientRect();
        return { right: r.right - box.left, bottom: r.bottom - box.top };
      });
    const left = Math.max(0, ...edges("[data-hero-copy]").map((e) => e.right)) + CLEARANCE;
    rx = (w * 1.1 - left) / 2;
    ry = rx * 0.54;
    cx = left + rx;
    cy = ry;
    for (const { right, bottom } of edges("[data-hero-line]")) {
      // Lower the ellipse until its top edge clears this line of the headline.
      for (let x = left; x <= Math.min(right + CLEARANCE, w); x += 8) {
        const dx = x - cx;
        const a = (sin * sin) / (rx * rx) + (cos * cos) / (ry * ry);
        const b = 2 * dx * sin * cos * (1 / (rx * rx) - 1 / (ry * ry));
        const c = dx * dx * ((cos * cos) / (rx * rx) + (sin * sin) / (ry * ry)) - 1;
        const d = b * b - 4 * a * c;
        if (d < 0) continue;
        const top = (-b - Math.sqrt(d)) / (2 * a);
        cy = Math.max(cy, bottom + CLEARANCE - top);
      }
    }
  }

  const points = oval.nodes.map((n) => ({
    x: cx + n.x * rx * cos - n.y * ry * sin,
    y: cy + n.x * rx * sin + n.y * ry * cos,
  }));
  return { w, h, cx, cy, rx, ry, tilt, points };
}

/**
 * The hero graphic. Visitors click any node to broadcast a message and watch
 * it spread hop by hop, the way blocks and transactions move between peers.
 */
export function OvalNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sendRef = useRef<(origin?: number) => void>(() => {});
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let layout = place(canvas);
    let wave: { origin: number; path: Broadcast; start: number } | null = null;
    let hover = -1;
    let visible = true;
    let frame = 0;

    const length = ({ a, b }: OvalEdge) =>
      Math.hypot(layout.points[a].x - layout.points[b].x, layout.points[a].y - layout.points[b].y);

    const ringAngle = (i: number) => (i / oval.ringEdges.length) * Math.PI * 2;

    const draw = (now: number) => {
      const { w, h, cx, cy, rx, ry, tilt, points } = layout;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "butt";

      // Resting state
      ctx.strokeStyle = "rgba(255,255,255,0.36)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const { a, b } of oval.edges) {
        ctx.moveTo(points[a].x, points[a].y);
        ctx.lineTo(points[b].x, points[b].y);
      }
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, tilt, 0, Math.PI * 2);
      ctx.stroke();

      // Broadcast in progress
      let alpha = 0;
      let reach = -1;
      if (wave) {
        const elapsed = still.matches ? Infinity : (now - wave.start) / 1000;
        reach = elapsed * SPEED;
        const over = elapsed - wave.path.duration / SPEED;
        alpha = still.matches ? 0.9 : over > LINGER ? 0 : over > 0 ? 1 - over / LINGER : 1;
        if (alpha <= 0) wave = null;
      }
      if (wave) {
        const { at } = wave.path;
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 2.5;
        for (const e of oval.edges) {
          const len = length(e);
          for (const [from, to] of [
            [e.a, e.b],
            [e.b, e.a],
          ]) {
            const part = Math.min(Math.max((reach - at[from]) / len, 0), 1);
            if (part === 0) continue;
            const [p, q] = [points[from], points[to]];
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + (q.x - p.x) * part, p.y + (q.y - p.y) * part);
            ctx.stroke();
          }
        }
        for (const [i, e] of oval.ringEdges.entries()) {
          const len = length(e);
          const [start, end] = [ringAngle(i), ringAngle(i + 1)];
          const forward = Math.min(Math.max((reach - at[e.a]) / len, 0), 1);
          const back = Math.min(Math.max((reach - at[e.b]) / len, 0), 1);
          for (const [s, t] of [
            [start, start + (end - start) * forward],
            [end - (end - start) * back, end],
          ]) {
            if (t - s < 1e-4) continue;
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, ry, tilt, s, t);
            ctx.stroke();
          }
        }
      }

      for (const [i, p] of points.entries()) {
        const lit = wave !== null && wave.path.at[i] <= reach;
        const size = lit ? NODE + 2.5 * alpha : oval.nodes[i].ring ? NODE : NODE - 1;
        ctx.fillStyle = "#fff";
        ctx.fillRect(p.x - size, p.y - size, size * 2, size * 2);
        if (i === hover || (wave && i === wave.origin)) {
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(p.x - 13, p.y - 13, 26, 26);
        }
      }
    };

    const tick = (now: number) => {
      frame = 0;
      draw(now);
      if (wave && visible && !still.matches) frame = requestAnimationFrame(tick);
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const send = (origin?: number, announce = true) => {
      const from = origin ?? Math.floor(Math.random() * oval.nodes.length);
      const path = broadcast(from, length);
      wave = { origin: from, path, start: performance.now() };
      if (announce) {
        setResult(`Reached all ${oval.nodes.length} nodes in ${path.hops} hops`);
      }
      request();
    };
    sendRef.current = send;

    const nearest = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      const [x, y] = [event.clientX - box.left, event.clientY - box.top];
      let best = -1;
      let distance = 60;
      for (const [i, p] of layout.points.entries()) {
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < distance) [best, distance] = [i, d];
      }
      return best;
    };
    const onMove = (event: PointerEvent) => {
      const next = nearest(event);
      if (next === hover) return;
      hover = next;
      canvas.style.cursor = hover === -1 ? "" : "pointer";
      request();
    };
    const onLeave = () => {
      hover = -1;
      request();
    };
    const onClick = (event: MouseEvent) => {
      const node = nearest(event as PointerEvent);
      if (node !== -1) send(node);
    };

    const resize = new ResizeObserver(() => {
      const { width, height } = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      layout = place(canvas);
      if (wave) wave = null;
      draw(performance.now());
    });
    const watch = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) request();
    });

    resize.observe(canvas);
    // The headline changes size once the web font arrives.
    for (const el of document.querySelectorAll("[data-hero-line], [data-hero-copy]")) resize.observe(el);
    watch.observe(canvas);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);
    // One broadcast on arrival shows what the graphic does.
    const intro = window.setTimeout(() => !still.matches && send(9, false), 900);

    return () => {
      window.clearTimeout(intro);
      cancelAnimationFrame(frame);
      resize.disconnect();
      watch.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <>
      <div className="relative h-72 sm:h-96 lg:absolute lg:inset-x-0 lg:top-0 lg:bottom-14 lg:h-auto">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
      </div>
      <div className="relative z-20 border-t border-white/25 bg-scarlet text-sm lg:absolute lg:inset-x-0 lg:bottom-0">
        <div className="shell flex min-h-14 flex-wrap items-center justify-between gap-x-6">
          <p aria-live="polite">{result ?? "Choose a node to broadcast to its peers"}</p>
          <button
            type="button"
            onClick={() => sendRef.current()}
            className="link min-h-11 cursor-pointer font-semibold"
          >
            Send from a random node
          </button>
        </div>
      </div>
    </>
  );
}
