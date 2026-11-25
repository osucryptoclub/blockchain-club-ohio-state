"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { broadcast, oval, type Broadcast, type OvalEdge } from "@/lib/oval";
import { ground, worldLength } from "@/lib/scene";
import { createSound } from "@/lib/sound";
import {
  blockHalf,
  blockHeight,
  cameraAt,
  CHAPTERS,
  monument,
  MONUMENTS,
  pathways,
  place,
  presence,
  project,
  RING_PIECES,
  ringPoint,
  strip,
  type Box,
  type TrackSlug,
} from "@/lib/world";
import { OvalStatic } from "@/components/oval-static";
import { createRenderer } from "./renderer";

/** Half-lengths of the Oval per second that a message travels. */
const SPEED = 0.62;
const LINGER = 2.4;
/** Seconds between unprompted broadcasts. */
const IDLE = 6;

type Wave = { origin: number; path: Broadcast; start: number };

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);
const order: TrackSlug[] = ["builders", "investments", "research", "marketing"];

/**
 * The home page's opening: one continuous place. Scrolling moves the camera
 * from above the Oval to the street, past a monument for each track, and up
 * again. Clicking a block broadcasts from it. Without WebGL 2, or with reduced
 * motion, the section is a single still screen and the page lists the tracks
 * as cards instead (see `.journey` in globals.css).
 */
export function OvalWorld({ hero, chapters, finale }: { hero: ReactNode; chapters: ReactNode[]; finale: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sendRef = useRef<(origin?: number) => void>(() => {});
  const wakeRef = useRef<() => void>(() => {});
  const pausedRef = useRef(false);
  const soundRef = useRef<ReturnType<typeof createSound> | null>(null);
  const [loud, setLoud] = useState(false);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const panels = [hero, ...chapters, finale];

  const goTo = (i: number) => {
    const section = sectionRef.current;
    if (!section || section.dataset.live === undefined) return;
    const stage = section.firstElementChild as HTMLElement;
    const top = section.getBoundingClientRect().top + window.scrollY - (window.innerHeight - stage.clientHeight);
    window.scrollTo({ top: top + ((section.clientHeight - stage.clientHeight) * i) / (CHAPTERS - 1) });
  };

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.innerWidth < 820;
    let renderer: ReturnType<typeof createRenderer> = null;
    try {
      renderer = createRenderer(canvas, small);
    } catch {
      renderer = null;
    }
    if (!renderer) return;
    const draw = renderer;
    section.dataset.scene = "";

    const page = document.documentElement;
    const live = !still.matches;
    if (live) {
      section.dataset.live = "";
      page.dataset.world = "";
      // The section just grew, so a link to something below it needs another look.
      if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
    }

    const stage = section.firstElementChild as HTMLElement;
    const layers = [...section.querySelectorAll<HTMLElement>("[data-chapter]")];
    const marks = [...section.querySelectorAll<HTMLElement>("[data-mark]")];
    const covered = () => page.dataset.intro !== undefined && page.dataset.intro !== "out";

    let wave: Wave | null = null;
    let view: Float32Array | null = null;
    let frame = 0;
    let last = 0;
    let clock = live ? 0 : 4;
    let idle = 0;
    let chapter = 0;
    let visible = true;
    let hover = -1;
    const look = { x: 0, y: 0, tx: 0, ty: 0 };

    const target = () => {
      if (!live) return 0;
      const room = section.clientHeight - stage.clientHeight;
      const top = section.getBoundingClientRect().top - (window.innerHeight - stage.clientHeight);
      return clamp(-top / Math.max(1, room)) * (CHAPTERS - 1);
    };

    const boxes = (): Box[] => {
      const out: Box[] = [...pathways];
      let alpha = 0;
      let reach = -1;
      if (wave) {
        const elapsed = live ? clock - wave.start : Infinity;
        reach = elapsed * SPEED;
        const over = elapsed - wave.path.duration / SPEED;
        alpha = !live ? 0.9 : over > LINGER ? 0 : over > 0 ? 1 - over / LINGER : 1;
        if (alpha <= 0) wave = null;
      }
      const current = wave;
      for (const [i, g] of ground.entries()) {
        const rise = 1 - (1 - clamp((clock - Math.hypot(g.x, g.z) * 0.7) / 0.9)) ** 4;
        const since = current ? (reach - current.path.at[i]) / SPEED : -1;
        const flash = since >= 0 && live ? Math.exp(-since * 2.4) : 0;
        const h = blockHeight(i) * rise + flash * alpha * Math.sin(Math.min(since * 9, Math.PI)) * 0.09;
        const half = blockHalf(i) * (i === hover ? 1.25 : 1);
        out.push({
          at: [g.x, h / 2, g.z],
          half: [half, Math.max(0.0005, h / 2), half],
          material: oval.nodes[i].ring ? 2 : 0,
          glow: Math.max(since >= 0 ? (0.55 + flash * 0.45) * alpha : 0, i === hover ? 0.5 : 0),
        });
        if (flash > 0.03) {
          out.push({ at: [g.x, h + 0.35 * flash, g.z], half: [half * 0.22, 0.35 * flash, half * 0.22], material: 4, glow: flash * 0.5, alpha: flash * 0.3 * alpha });
        }
      }
      if (current) {
        const light = (from: number, e: OvalEdge, point: (t: number) => { x: number; z: number }, pieces: number) => {
          const travelled = reach - current.path.at[from];
          if (travelled <= 0) return;
          const length = worldLength(e);
          const part = clamp(travelled / length);
          const fresh = live ? Math.exp(-Math.max(0, travelled - length) * 2.2) : 0.3;
          for (let j = 0; j < pieces; j++) {
            out.push({
              ...strip(point((j / pieces) * part), point(((j + 1) / pieces) * part), 0.0055, 0.003),
              material: 4,
              glow: (0.25 + fresh * 0.6) * alpha,
              alpha,
            });
          }
        };
        for (const e of oval.edges) {
          for (const [a, b] of [
            [e.a, e.b],
            [e.b, e.a],
          ]) {
            const [p, q] = [ground[a], ground[b]];
            light(a, e, (t) => ({ x: p.x + (q.x - p.x) * t, z: p.z + (q.z - p.z) * t }), 1);
          }
        }
        for (const [i, e] of oval.ringEdges.entries()) {
          light(e.a, e, (t) => ringPoint(i, t), RING_PIECES);
          light(e.b, e, (t) => ringPoint(i, 1 - t), RING_PIECES);
        }
      }
      // The monuments rise as the camera leaves the hero.
      const grow = live ? clamp((chapter - 0.12) / 0.4) : 0;
      for (const slug of order) {
        const m = MONUMENTS[slug];
        out.push(...place(monument(slug, clock), m.at, m.yaw + clock * 0.12, 0.9 * grow));
      }
      return out;
    };

    const paint = () => {
      const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
      const tall = aspect < 0.9;
      const { eye, look: at } = cameraAt(chapter);
      const away = clamp(chapter) * clamp(CHAPTERS - 1 - chapter);
      const drift = live ? Math.sin(clock * 0.16) * 0.12 * (1 - away) : 0;
      const sway = look.x * 0.06;
      // Text sits on one side, so the picture slides to the other.
      const side = mixShift(mixShift(0.36, 0.34, chapter), 0, chapter - (CHAPTERS - 2));
      const shift: [number, number] = tall
        ? [0, mixShift(mixShift(-0.5, 0.42, chapter * 2), -0.1, (chapter - (CHAPTERS - 2)) * 2 - 0.5)]
        : [side, mixShift(mixShift(-0.24, -0.02, chapter * 2), -0.3, chapter - (CHAPTERS - 2))];
      view = draw.render({
        boxes: boxes(),
        eye: [eye[0] + drift + sway, eye[1] + look.y * 0.02, eye[2]],
        look: at,
        focal: tall ? 1.15 + 0.35 * away : 1.75,
        shift,
        time: clock,
        wave: wave ? [ground[wave.origin].x, ground[wave.origin].z, live ? (clock - wave.start) * SPEED : 9, live ? 1 : 0] : [0, 0, -1, 0],
        floor: 1,
      });
      for (const [i, el] of layers.entries()) {
        const p = live ? presence(i, chapter) : i === 0 ? 1 : 0;
        el.style.opacity = p.toFixed(3);
        el.style.transform = live ? `translateY(${((i - chapter) * 60).toFixed(1)}px)` : "";
        el.style.pointerEvents = p > 0.6 ? "" : "none";
        el.dataset.on = p > 0.6 ? "true" : "false";
      }
      for (const [i, el] of marks.entries()) el.dataset.on = Math.round(chapter) === i ? "true" : "false";
    };

    const tick = (now: number) => {
      frame = 0;
      const moving = live && !pausedRef.current && !covered();
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      const goal = target();
      chapter += (goal - chapter) * (live ? 1 - Math.exp(-dt * 7) : 1);
      if (moving) {
        clock += dt;
        look.x += (look.tx - look.x) * Math.min(1, dt * 3);
        look.y += (look.ty - look.y) * Math.min(1, dt * 3);
        idle += dt;
        if (idle > IDLE && !wave) start(undefined, false);
      }
      if (!draw.lost()) paint();
      if (visible && (moving || Math.abs(goal - chapter) > 0.001)) request();
      else last = 0;
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    wakeRef.current = request;

    const start = (origin?: number, announce = true) => {
      const from = origin ?? Math.floor(Math.random() * oval.nodes.length);
      const path = broadcast(from, worldLength);
      wave = { origin: from, path, start: clock };
      idle = 0;
      const heard = [...path.at].sort((a, b) => a - b).filter((_, i) => i % 3 === 0);
      soundRef.current?.ping(heard.map((at) => at / SPEED));
      if (announce) setResult(`Reached all ${oval.nodes.length} nodes in ${path.hops} hops`);
      request();
    };
    sendRef.current = (origin) => {
      if (pausedRef.current) {
        pausedRef.current = false;
        setPaused(false);
      }
      start(origin);
    };

    const nearest = (event: MouseEvent) => {
      if (!view) return -1;
      const rect = canvas.getBoundingClientRect();
      let best = -1;
      let distance = 44;
      for (const [i, g] of ground.entries()) {
        const p = project(view, [g.x, blockHeight(i), g.z]);
        if (p.w <= 0) continue;
        const d = Math.hypot(
          ((p.x + 1) / 2) * rect.width - (event.clientX - rect.left),
          ((1 - p.y) / 2) * rect.height - (event.clientY - rect.top),
        );
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
    // Tabbing to a chapter's link brings the camera to it.
    const onFocus = (event: FocusEvent) => {
      const layer = (event.target as Element).closest<HTMLElement>("[data-chapter]");
      if (layer && layer.dataset.on === "false") goTo(Number(layer.dataset.chapter));
    };

    const resize = new ResizeObserver(() => {
      if (canvas.clientWidth < 2) return;
      draw.resize();
      if (!draw.lost()) paint();
    });
    const watch = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) request();
    });
    let intro = 0;
    const arrive = () => {
      request();
      intro = window.setTimeout(() => live && start(9, false), 1500);
    };

    chapter = target();
    resize.observe(canvas);
    watch.observe(stage);
    window.addEventListener("scroll", request, { passive: true });
    section.addEventListener("pointermove", onMove);
    section.addEventListener("focusin", onFocus);
    canvas.addEventListener("click", onClick);
    if (covered()) window.addEventListener("intro:out", arrive, { once: true });
    else arrive();

    return () => {
      window.clearTimeout(intro);
      cancelAnimationFrame(frame);
      resize.disconnect();
      watch.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("intro:out", arrive);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("focusin", onFocus);
      canvas.removeEventListener("click", onClick);
      soundRef.current?.stop();
      soundRef.current = null;
      setLoud(false);
    };
  }, []);

  const toggle = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    if (!pausedRef.current) wakeRef.current();
  };

  const toggleSound = () => {
    if (soundRef.current) soundRef.current.stop();
    soundRef.current = soundRef.current ? null : createSound();
    setLoud(soundRef.current !== null);
  };

  return (
    <section ref={sectionRef} aria-label="Welcome" className="journey relative bg-black text-white">
      <div className="journey-stage">
        <div className="journey-fallback absolute inset-0 bg-[radial-gradient(58rem_25rem_at_80%_100%,#bb0000,#5c0000_42%,transparent_76%)]">
          <OvalStatic className="absolute -right-24 -bottom-[26rem] size-[62rem] text-white/55 max-lg:-right-48 max-lg:-bottom-72 max-lg:size-[40rem]" />
        </div>
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
        <div aria-hidden="true" className="journey-shade pointer-events-none absolute inset-0" />
        {panels.map((panel, i) => (
          <div key={i} data-chapter={i} data-on={i === 0} className={`journey-panel ${i === 0 ? "journey-hero" : i === panels.length - 1 ? "journey-finale" : ""}`}>
            {panel}
          </div>
        ))}

        <ol aria-label="Chapters" className="journey-rail absolute top-1/2 right-3 z-20 -translate-y-1/2 lg:right-6">
          {["Start", ...order.map((s) => s[0].toUpperCase() + s.slice(1)), "Overview"].map((name, i) => (
            <li key={name}>
              <button
                type="button"
                data-mark=""
                data-on={i === 0}
                aria-label={`Go to ${name}`}
                onClick={() => goTo(i)}
                className="group grid size-9 cursor-pointer place-items-center"
              >
                <span className="size-2 border border-white/70 transition-all duration-300 group-hover:bg-white group-data-[on=true]:size-3 group-data-[on=true]:border-scarlet group-data-[on=true]:bg-scarlet" />
              </button>
            </li>
          ))}
        </ol>

        <div className="journey-bar rule absolute inset-x-0 bottom-0 z-20 border-t bg-black/55 text-sm backdrop-blur-md">
          <div className="shell flex min-h-13 flex-wrap items-center justify-between gap-x-8">
            <p aria-live="polite" className="muted py-1">
              {result ?? "Choose a block to broadcast to its peers"}
            </p>
            <div className="flex items-center gap-5">
              <button type="button" onClick={() => sendRef.current()} className="link min-h-11 cursor-pointer font-semibold">
                Send from a random block
              </button>
              <button
                type="button"
                onClick={toggleSound}
                aria-pressed={loud}
                aria-label="Sound"
                className="-mr-4 grid size-11 cursor-pointer place-items-center"
              >
                {loud ? <Volume2 size={17} aria-hidden="true" /> : <VolumeX size={17} aria-hidden="true" />}
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
      </div>
    </section>
  );
}

const mixShift = (a: number, b: number, t: number) => a + (b - a) * clamp(t);
