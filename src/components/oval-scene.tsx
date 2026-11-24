"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { broadcast, oval, type Broadcast, type OvalEdge } from "@/lib/oval";
import {
  corners,
  exits,
  ground,
  heights,
  lawn,
  projector,
  rim,
  worldLength,
  type Screen,
} from "@/lib/scene";

/** Half-lengths of the Oval per second that a message travels. */
const SPEED = 0.62;
/** Seconds the network stays lit after the last node hears the message. */
const LINGER = 2.4;
/** Seconds between unprompted broadcasts. */
const IDLE = 7;
const PACKETS = 9;
/** Seconds for the paths to draw on arrival. */
const INTRO = 1.6;
const YAW = -0.34;
const PITCH = 0.5;
/** Minimum gap between the Oval and the hero copy, in pixels. */
const CLEARANCE = 36;

type Wave = { origin: number; path: Broadcast; start: number };
type Packet = { from: number; to: number; t: number };

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);
const ease = (n: number) => 1 - (1 - clamp(n)) ** 4;
const ringTotal = oval.ringEdges.length;

/** Fits the Oval into the space the hero copy leaves free. */
function frameCamera(canvas: HTMLCanvasElement) {
  const box = canvas.getBoundingClientRect();
  const { width: w, height: h } = box;
  const wrapper = canvas.parentElement;
  if (wrapper && getComputedStyle(wrapper).position === "absolute") {
    const copy = document.querySelector("[data-hero-copy]")?.getBoundingClientRect();
    const left = (copy ? copy.right - box.left : 0) + CLEARANCE;
    const scale = Math.min((w * 1.04 - left) / 2, h * 0.98);
    return { w, h, scale, cx: left + scale, cy: h * 0.67 };
  }
  return { w, h, scale: w * 0.56, cx: w * 0.53, cy: h * 0.54 };
}

/**
 * The hero: the Oval at night, with a block wherever two paths cross. Choosing
 * a block broadcasts from it, and the light travels the shortest paths to every
 * other block, the way a transaction moves between peers.
 */
export function OvalScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sendRef = useRef<(origin?: number) => void>(() => {});
  const wakeRef = useRef<() => void>(() => {});
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // The introduction covers the page; the Oval waits and rises as it lifts.
    const covered = () => {
      const { intro } = document.documentElement.dataset;
      return intro !== undefined && intro !== "out";
    };
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let view = frameCamera(canvas);
    let wave: Wave | null = null;
    let hover = -1;
    let visible = true;
    let frame = 0;
    let last = 0;
    let clock = 0;
    let idle = 0;
    let tops: Screen[] = [];
    const look = { x: 0, y: 0, tx: 0, ty: 0 };
    const packets: Packet[] = Array.from({ length: PACKETS }, (_, i) => {
      const from = (i * 7) % oval.nodes.length;
      return { from, to: exits[from][i % exits[from].length], t: (i * 0.37) % 1 };
    });

    const line = (a: Screen, b: Screen) => {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    };

    const face = (points: Screen[], fill: string | CanvasGradient, edge: string) => {
      ctx.beginPath();
      for (const [i, p] of points.entries()) {
        if (i) ctx.lineTo(p.x, p.y);
        else ctx.moveTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = edge;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const draw = () => {
      const { w, h, scale, cx, cy } = view;
      // Next keeps the page mounted but hidden after leaving it, with no size.
      if (w < 1 || h < 1 || scale <= 0) return;
      const intro = still.matches ? 1 : clamp(clock / INTRO);
      const at = projector({
        yaw: YAW + Math.sin(clock * 0.16) * 0.2 + look.x * 0.12,
        pitch: PITCH + look.y * 0.06,
        scale,
        cx,
        cy,
      });
      // Distant things fade into the dark.
      const fog = (p: Screen) => 0.35 + 0.65 * clamp((p.depth + 0.7) / 1.4);

      ctx.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Light pooled on the lawn
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.46);
      const pool = ctx.createRadialGradient(0, 0, 0, 0, 0, scale * 1.35);
      pool.addColorStop(0, `rgba(187,0,0,${0.5 * intro})`);
      pool.addColorStop(0.5, `rgba(139,0,0,${0.26 * intro})`);
      pool.addColorStop(1, "rgba(139,0,0,0)");
      ctx.fillStyle = pool;
      ctx.fillRect(-scale * 1.4, -scale * 1.4, scale * 2.8, scale * 2.8);
      ctx.restore();

      // How far the current broadcast has got
      let alpha = 0;
      let reach = -1;
      if (wave) {
        const elapsed = still.matches ? Infinity : clock - wave.start;
        reach = elapsed * SPEED;
        const over = elapsed - wave.path.duration / SPEED;
        alpha = still.matches ? 1 : over > LINGER ? 0 : over > 0 ? 1 - over / LINGER : 1;
        if (alpha <= 0) wave = null;
      }
      const current = wave;
      const origin = current ? ground[current.origin] : null;

      // Lawn
      for (const p of lawn) {
        if (Math.hypot(p.x, p.z) > intro * 1.4) continue;
        const s = at(p.x, 0, p.z);
        let glow = 0;
        if (origin && !still.matches) {
          const behind = reach - Math.hypot(p.x - origin.x, p.z - origin.z);
          if (behind > 0) glow = Math.exp(-behind * 5) * alpha;
        }
        const size = (1 + glow * 1.6) * s.k;
        const tint = Math.round(255 - glow * 120);
        ctx.fillStyle = `rgba(255,${tint},${tint},${(0.15 + glow * 0.8) * fog(s)})`;
        ctx.fillRect(s.x - size / 2, s.y - size / 2, size, size);
      }

      // Paths and rim at rest
      const base = ground.map((g) => at(g.x, 0, g.z));
      ctx.lineWidth = 1;
      for (const { a, b } of oval.edges) {
        ctx.strokeStyle = `rgba(255,255,255,${0.15 * intro * (fog(base[a]) + fog(base[b]))})`;
        line(base[a], base[b]);
      }
      for (const [spread, strength, width] of [
        [1, 0.62, 1.6],
        [1.07, 0.16, 1],
      ]) {
        const steps = 120;
        const first = rim(0, spread);
        let prev = at(first.x, 0, first.z);
        for (let i = 1; i <= steps * intro; i++) {
          const g = rim((i / steps) * Math.PI * 2, spread);
          const next = at(g.x, 0, g.z);
          ctx.strokeStyle = `rgba(255,255,255,${strength * fog(next)})`;
          ctx.lineWidth = width * next.k;
          line(prev, next);
          prev = next;
        }
      }

      // Broadcast light: wide and scarlet underneath, thin and white on top
      if (current) {
        const { at: arrival } = current.path;
        ctx.globalCompositeOperation = "lighter";
                const light = (from: number, e: OvalEdge, steps: number, point: (t: number) => Screen) => {
          const travelled = reach - arrival[from];
          if (travelled <= 0) return;
          const length = worldLength(e);
          const part = clamp(travelled / length);
          const fresh = still.matches ? 0.35 : Math.exp(-Math.max(0, travelled - length) * 2.2);
          let prev = point(0);
          for (let i = 1; i <= steps; i++) {
            const next = point((i / steps) * part);
            for (const [width, color] of [
              [9, `rgba(187,0,0,${0.22 * alpha})`],
              [3.2, `rgba(220,20,10,${0.75 * alpha})`],
              [1.1, `rgba(255,255,255,${(0.2 + 0.75 * fresh) * alpha})`],
            ] as const) {
              ctx.strokeStyle = color;
              ctx.lineWidth = width * next.k;
              line(prev, next);
            }
            prev = next;
          }
        };
        for (const e of oval.edges) {
          for (const [from, to] of [
            [e.a, e.b],
            [e.b, e.a],
          ]) {
            const [p, q] = [ground[from], ground[to]];
            light(from, e, 1, (t) => at(p.x + (q.x - p.x) * t, 0, p.z + (q.z - p.z) * t));
          }
        }
        for (const [i, e] of oval.ringEdges.entries()) {
          const [start, end] = [(i / ringTotal) * Math.PI * 2, ((i + 1) / ringTotal) * Math.PI * 2];
          const arc = (from: number, to: number) => (t: number) => {
            const g = rim(from + (to - from) * t);
            return at(g.x, 0, g.z);
          };
          light(e.a, e, 5, arc(start, end));
          light(e.b, e, 5, arc(end, start));
        }
        ctx.globalCompositeOperation = "source-over";
      }

      // Packets
      if (!still.matches && intro === 1) {
        ctx.globalCompositeOperation = "lighter";
        for (const { from, to, t } of packets) {
          const [p, q] = [ground[from], ground[to]];
          const point = (n: number) => at(p.x + (q.x - p.x) * n, 0.004, p.z + (q.z - p.z) * n);
          const [head, tail] = [point(t), point(Math.max(0, t - 0.4))];
          const trail = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
          trail.addColorStop(0, "rgba(187,0,0,0)");
          trail.addColorStop(1, "rgba(255,60,45,0.95)");
          ctx.strokeStyle = trail;
          ctx.lineWidth = 2 * head.k;
          line(tail, head);
          ctx.fillStyle = "#fff";
          ctx.fillRect(head.x - 1.5, head.y - 1.5, 3, 3);
        }
        ctx.globalCompositeOperation = "source-over";
      }

      // Blocks, back to front
      const order = base.map((_, i) => i).sort((a, b) => base[a].depth - base[b].depth);
      tops = [];
      for (const i of order) {
        const g = ground[i];
        const { ring } = oval.nodes[i];
        const since = current ? (reach - current.path.at[i]) / SPEED : -1;
        const on = since >= 0 ? alpha : 0;
        const flash = since >= 0 && !still.matches ? Math.exp(-since * 2.6) * alpha : 0;
        const grow = still.matches ? 1 : ease((clock - Math.hypot(g.x, g.z) * 0.7) / 0.9);
        const height = heights[i] * grow + flash * Math.sin(Math.min(since * 9, Math.PI)) * 0.1;
        const half = (ring ? 0.017 : 0.027) + (i === hover ? 0.006 : 0);
        const low = corners.map(([dx, dz]) => at(g.x + dx * half, 0, g.z + dz * half));
        const high = corners.map(([dx, dz]) => at(g.x + dx * half, height, g.z + dz * half));
        const top = at(g.x, height, g.z);
        tops[i] = top;

        if (on > 0) {
          const radius = (16 + flash * 44) * top.k;
          const halo = ctx.createRadialGradient(top.x, top.y, 0, top.x, top.y, radius);
          halo.addColorStop(0, `rgba(255,50,35,${(0.3 + flash * 0.5) * on})`);
          halo.addColorStop(1, "rgba(187,0,0,0)");
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = halo;
          ctx.fillRect(top.x - radius, top.y - radius, radius * 2, radius * 2);
          ctx.globalCompositeOperation = "source-over";
        }

        const shade = fog(top);
        const mix = (gray: number, lit: [number, number, number]) => {
          const g0 = gray * shade;
          return `rgb(${lit.map((n) => Math.round(g0 + (n - g0) * on)).join(",")})`;
        };
        const edge = `rgba(255,255,255,${Math.min(1, (0.2 + 0.4 * on + (i === hover ? 0.6 : 0)) * shade)})`;
        for (let s = 0; s < 4; s++) {
          const t = (s + 1) % 4;
          // Screen winding says whether this side faces the camera.
          const winding =
            (low[t].x - low[s].x) * (high[s].y - low[s].y) - (low[t].y - low[s].y) * (high[s].x - low[s].x);
          if (winding <= 0) continue;
          // Light falls off down each side, so a lit block glows from its top.
          const side = ctx.createLinearGradient(top.x, high[s].y, top.x, low[s].y + 0.01);
          side.addColorStop(0, s % 2 ? mix(38, [150, 0, 0]) : mix(64, [200, 8, 4]));
          side.addColorStop(1, s % 2 ? mix(8, [34, 0, 0]) : mix(14, [58, 0, 0]));
          face([low[s], low[t], high[t], high[s]], side, edge);
        }
        const white = Math.round(flash * 235);
        face(high, mix(ring ? 190 : 92, [Math.min(255, 205 + white), white, white]), edge);
        if (i === hover || (current && i === current.origin)) {
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(top.x - 14, top.y - 14, 28, 28);
        }
      }
    };

    const start = (origin?: number, announce = true) => {
      const from = origin ?? Math.floor(Math.random() * oval.nodes.length);
      const path = broadcast(from, worldLength);
      wave = { origin: from, path, start: clock };
      idle = 0;
      if (announce) setResult(`Reached all ${oval.nodes.length} nodes in ${path.hops} hops`);
      request();
    };

    const step = (dt: number) => {
      clock += dt;
      look.x += (look.tx - look.x) * Math.min(1, dt * 3);
      look.y += (look.ty - look.y) * Math.min(1, dt * 3);
      for (const p of packets) {
        p.t += (dt * 0.2) / Math.max(0.05, worldLength({ a: p.from, b: p.to }));
        if (p.t < 1) continue;
        const onward = exits[p.to].filter((n) => n !== p.from);
        const next = onward[Math.floor(Math.random() * onward.length)] ?? p.from;
        Object.assign(p, { from: p.to, to: next, t: 0 });
      }
      idle += dt;
      if (idle > IDLE && !wave) start(undefined, false);
    };

    function tick(now: number) {
      frame = 0;
      const moving = !still.matches && !pausedRef.current && !covered();
      const dt = last && moving ? Math.min((now - last) / 1000, 0.05) : 0;
      last = moving ? now : 0;
      if (moving) step(dt);
      draw();
      if (visible && moving) request();
      else last = 0;
    }
    function request() {
      if (!frame) frame = requestAnimationFrame(tick);
    }
    wakeRef.current = request;

    sendRef.current = (origin) => {
      if (pausedRef.current) {
        pausedRef.current = false;
        setPaused(false);
      }
      start(origin);
    };

    const nearest = (event: MouseEvent) => {
      const box = canvas.getBoundingClientRect();
      const [x, y] = [event.clientX - box.left, event.clientY - box.top];
      let best = -1;
      let distance = 44;
      for (const [i, p] of tops.entries()) {
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < distance) [best, distance] = [i, d];
      }
      return best;
    };
    const onMove = (event: PointerEvent) => {
      look.tx = (event.clientX / window.innerWidth) * 2 - 1;
      look.ty = (event.clientY / window.innerHeight) * 2 - 1;
      const next = event.target === canvas ? nearest(event) : -1;
      if (next === hover) return;
      hover = next;
      canvas.style.cursor = hover === -1 ? "" : "pointer";
      request();
    };
    const onClick = (event: MouseEvent) => {
      const node = nearest(event);
      if (node !== -1) sendRef.current(node);
    };

    const resize = new ResizeObserver(() => {
      const { width, height } = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      view = frameCamera(canvas);
      draw();
    });
    const watch = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) request();
    });

    const section = canvas.closest("section");
    resize.observe(canvas);
    // The copy changes size once the web font arrives.
    for (const el of document.querySelectorAll("[data-hero-copy]")) resize.observe(el);
    watch.observe(canvas);
    section?.addEventListener("pointermove", onMove);
    canvas.addEventListener("click", onClick);
    still.addEventListener("change", request);
    // One broadcast on arrival shows what the graphic does.
    let intro = 0;
    const arrive = () => {
      request();
      intro = window.setTimeout(() => !still.matches && start(9, false), 1500);
    };
    if (covered()) window.addEventListener("intro:out", arrive, { once: true });
    else arrive();

    return () => {
      window.clearTimeout(intro);
      window.removeEventListener("intro:out", arrive);
      cancelAnimationFrame(frame);
      resize.disconnect();
      watch.disconnect();
      section?.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("click", onClick);
      still.removeEventListener("change", request);
    };
  }, []);

  const toggle = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    if (!pausedRef.current) wakeRef.current();
  };

  return (
    <>
      <div className="relative -mt-6 h-80 sm:h-[30rem] lg:absolute lg:inset-0 lg:mt-0 lg:h-auto">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
      </div>
      <div className="rule relative z-20 border-t bg-black/60 text-sm backdrop-blur-md lg:absolute lg:inset-x-0 lg:bottom-0">
        <div className="shell flex min-h-14 flex-wrap items-center justify-between gap-x-8">
          <p aria-live="polite" className="muted py-2">
            {result ?? "Choose a block to broadcast to its peers"}
          </p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => sendRef.current()}
              className="link min-h-11 cursor-pointer font-semibold"
            >
              Send from a random block
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label={paused ? "Play animation" : "Pause animation"}
              className="-mr-3 grid size-11 cursor-pointer place-items-center motion-reduce:hidden"
            >
              {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
