"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { Seal } from "@/components/logo";
import { scenes } from "@/content/photos";
import type { Intro as Player } from "./timeline";

/**
 * The cinematic introduction. It covers the home page on the first visit of a
 * session and is skipped for reduced motion, data saving, deep links, and
 * browsers without WebGL 2. `introScript` makes that choice before first paint.
 */
export function Intro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const openRef = useRef<() => void>(() => {});

  useEffect(() => {
    const page = document.documentElement;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas || !page.dataset.intro) return;

    page.dataset.intro = "on";
    let player: Player | null = null;
    let cancelled = false;
    const others = [...document.body.children].filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== root && el.matches("a, header, main, footer"),
    );
    for (const el of others) el.inert = true;
    root.focus({ preventScroll: true });

    const uncover = () => {
      page.dataset.intro = "out";
      window.dispatchEvent(new Event("intro:out"));
    };
    const finish = () => {
      for (const el of others) el.inert = false;
      delete page.dataset.intro;
      try {
        sessionStorage.setItem("intro", "seen");
      } catch {
        // Private windows may refuse storage; the intro simply plays again.
      }
      if (location.search) history.replaceState(history.state, "", location.pathname);
      player?.destroy();
      player = null;
    };
    const open = () => {
      if (player) return player.open();
      // Still loading: there is nothing to animate yet.
      cancelled = true;
      uncover();
      finish();
    };
    openRef.current = open;

    import("./timeline")
      .then(({ playIntro }) => {
        if (cancelled) return;
        player = playIntro({ root, canvas, onOpen: uncover, onDone: finish });
        if (!player) open();
      })
      .catch(() => {
        if (!cancelled) open();
      });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") open();
    };
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 8) open();
    };
    let touch = 0;
    const onTouchStart = (e: TouchEvent) => {
      touch = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touch - e.touches[0].clientY > 60) open();
    };
    window.addEventListener("keydown", onKey);
    root.addEventListener("wheel", onWheel, { passive: true });
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      cancelled = true;
      player?.destroy();
      for (const el of others) el.inert = false;
      window.removeEventListener("keydown", onKey);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Introduction"
      tabIndex={-1}
      className="intro fixed inset-0 z-[100] overflow-hidden bg-black text-white outline-none"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />

      <div data-ui="" className="pointer-events-none absolute inset-0">
        <div aria-hidden="true" className="intro-scrim absolute inset-x-0 bottom-0 h-[38%]" />

        <div data-title="" className="shell absolute inset-0 flex max-w-none flex-col justify-center">
          <div data-seal="" className="mb-[2vmin] w-fit">
            <Seal className="size-20 lg:size-24" sizes="96px" eager />
          </div>
          <p className="sr-only">Blockchain Club, Ohio State University</p>
          <div aria-hidden="true" className="intro-title">
            <span className="intro-mask">
              <span data-line="">Blockchain</span>
            </span>
            <span className="flex flex-col md:flex-row md:items-center md:gap-[2.4vw]">
              <span className="intro-mask">
                <span data-line="">Club</span>
              </span>
              <span data-bar="" className="intro-bar">
                <span className="block">Ohio State University</span>
              </span>
            </span>
          </div>
        </div>

        {scenes.map(({ word, caption, align }, i) => (
          <div
            key={word}
            data-word=""
            aria-hidden="true"
            className={`shell invisible absolute inset-x-0 max-w-none ${i === scenes.length - 1 ? "bottom-48 md:bottom-44 [@media(height<32rem)]:bottom-24" : "bottom-28 md:bottom-24 [@media(height<32rem)]:bottom-12"} ${align === "right" ? "md:text-right" : ""}`}
          >
            <span className="intro-mask">
              <span data-rise="" className="wide text-[clamp(2.25rem,min(7.4vw,13svh),8rem)] leading-[1.08]">
                {word}
              </span>
            </span>
            {caption && (
              <span className="intro-mask">
                <span data-rise="" className="text-sm font-medium md:text-base">
                  {caption}
                </span>
              </span>
            )}
          </div>
        ))}

        <div data-chain="" aria-hidden="true" className="shell absolute inset-x-0 bottom-9 flex max-w-none items-center opacity-0 [@media(height<32rem)]:justify-end">
          {scenes.map(({ word }, i) => (
            <span key={word} className="flex items-center">
              {i > 0 && <span className="h-px w-5 bg-white/40" />}
              <span className="size-3 border border-white/60">
                <span data-link="" className="block size-full scale-0 bg-scarlet" />
              </span>
            </span>
          ))}
        </div>

        <div className="shell absolute inset-x-0 bottom-20 flex max-w-none [@media(height<32rem)]:bottom-6">
          <button
            type="button"
            data-enter=""
            onClick={() => openRef.current()}
            className="pointer-events-auto invisible relative flex min-h-16 cursor-pointer items-center gap-5 overflow-hidden bg-scarlet px-6 whitespace-nowrap md:px-8 md:text-lg [@media(height<32rem)]:min-h-12 font-semibold uppercase transition-colors hover:bg-white hover:text-black max-md:w-full max-md:justify-between"
          >
            Explore the Club
            <ArrowRight size={20} aria-hidden="true" />
            <span data-timer="" aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-current" />
          </button>
        </div>

        <div className="shell absolute inset-x-0 top-0 flex max-w-none justify-end pt-4">
          <button
            type="button"
            data-skip=""
            onClick={() => openRef.current()}
            className="pointer-events-auto min-h-12 cursor-pointer bg-black/55 px-5 text-sm font-semibold uppercase underline-offset-4 backdrop-blur-md hover:underline"
          >
            Skip intro
          </button>
        </div>
      </div>
    </div>
  );
}
