import { gsap } from "gsap";
import { createStage, type Look, type Texture, type TileDraw } from "@/components/intro/stage";
import { photos, scenes, type PhotoId } from "@/content/photos";

/** Seconds each photograph scene lasts before the next one builds over it. */
const SCENE = 1.6;
/** Seconds the last scene waits before opening the page on its own. */
const WAIT = 3;
/** Seconds to wait for a late photo before moving on without it. */
const PATIENCE = 1;

type Options = {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  /** The page is about to be uncovered. */
  onOpen: () => void;
  /** The introduction is over. */
  onDone: () => void;
};

type Rect = TileDraw["rect"];

export type Intro = { open: () => void; destroy: () => void };

/** Plays the introduction, or returns null where it cannot run. */
export function playIntro({ root, canvas, onOpen, onDone }: Options): Intro | null {
  const tall = window.innerWidth / window.innerHeight < 0.9;
  const small = tall || window.innerWidth < 900;
  const stage = createStage(canvas, small);
  if (!stage) return null;

  const $ = (selector: string) => [...root.querySelectorAll<HTMLElement>(selector)];

  const look: Look = {
    form: 0,
    warp: 0.2,
    travel: 0,
    particles: 0,
    lines: 0,
    rise: 0,
    structure: 1,
    yaw: -0.9,
    pitch: 0.2,
    distance: 3.6,
    lift: -0.3,
    exit: 0,
    time: 0,
  };
  const progress = scenes.map(() => ({ reveal: 0, gone: 0, age: 0 }));
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const textures = new Map<PhotoId, Texture>();
  const tilesOf = (i: number) => (tall ? scenes[i].tall : scenes[i].wide);
  const failed = new Set<PhotoId>();
  const broken = (i: number) => tilesOf(i).some((t) => failed.has(t.photo));
  const ready = (i: number) => tilesOf(i).every((t) => textures.has(t.photo));

  let opened = false;
  let destroyed = false;

  // Photos load while the opening plays, in the order they are needed.
  const wanted = [...new Set(scenes.flatMap((_, i) => tilesOf(i).map((t) => t.photo)))];
  const aborter = new AbortController();
  for (const id of wanted) {
    const { src } = small ? photos[id].small : photos[id].full;
    fetch(src, { signal: aborter.signal })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(r.statusText))))
      .then((blob) => createImageBitmap(blob))
      .then((bitmap) => {
        if (!destroyed) textures.set(id, stage.texture(bitmap));
        bitmap.close();
      })
      // A missing photo only costs its own scene.
      .catch(() => failed.add(id));
  }

  /** On tall screens, narrow a frame that would crop a photo top and bottom. */
  const fit = ([x, y, w, h]: Rect, aspect: number): Rect => {
    if (!tall) return [x, y, w, h];
    const most = (aspect * 1.2 * h * canvas.clientHeight) / canvas.clientWidth;
    return w <= most ? [x, y, w, h] : [x + (w - most) / 2, y, most, h];
  };

  const render = () => {
    const dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 0.1);
    look.time += dt;
    look.travel += dt * (0.25 + look.warp * 2.2);
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3);
    const tiles: TileDraw[] = [];
    for (const [i, p] of progress.entries()) {
      if (p.reveal <= 0 || p.gone >= 1) continue;
      p.age += dt;
      for (const [j, tile] of tilesOf(i).entries()) {
        const texture = textures.get(tile.photo);
        if (!texture) continue;
        tiles.push({
          texture,
          rect: fit(tile.rect, texture.aspect),
          focus: photos[tile.photo].focus,
          drift: tile.drift,
          // The second photo in a pair starts slightly after the first.
          reveal: Math.max(0, p.reveal * 1.25 - j * 0.25),
          gone: p.gone,
          age: p.age,
          seed: i * 5 + j,
        });
      }
    }
    if (!stage.lost()) stage.render(look, tiles, pointer);
  };

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  // Stage 1: dark, then light arriving and assembling
  tl.to(look, { particles: 1, duration: 0.7, ease: "power1.in" }, 0)
    .to(look, { warp: 1.2, duration: 0.8, ease: "power2.in" }, 0)
    .to(look, { warp: 0, duration: 1.1, ease: "power2.out" }, 0.85)
    .to(look, { form: 1, duration: 1.7, ease: "power2.inOut" }, 0.5)
    .to(look, { yaw: -0.34, pitch: 0.5, distance: 1.95, duration: 3.4, ease: "power2.out" }, 0)
    .to(look, { lines: 1, duration: 1.2, ease: "power2.inOut" }, 1)
    .to(look, { rise: 1, duration: 1.5, ease: "power2.out" }, 1.3);

  // Stage 2: identity
  tl.from($("[data-seal]"), { opacity: 0, scale: 0.6, duration: 0.8 }, 1.35)
    .fromTo(
      $("[data-line]"),
      { yPercent: 112, "--stretch": "62%" },
      { yPercent: 0, "--stretch": "116%", duration: 1.15, stagger: 0.12, ease: "power4.out" },
      1.45,
    )
    .fromTo(
      $("[data-bar]"),
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 0% 0 0)", duration: 0.75, ease: "power4.inOut" },
      1.75,
    )
    .from($("[data-bar] > *"), { xPercent: -14, opacity: 0, duration: 0.7 }, 2.2)
    .to(look, { particles: 0.14, duration: 0.9 }, 1.9);

  // Through the Oval and into the photographs
  const first = 3.75;
  tl.to(look, { distance: 0.75, pitch: 0.2, warp: 0.9, duration: 1, ease: "power3.in" }, first - 0.45)
    .to(look, { structure: 0, duration: 0.5, ease: "power1.in" }, first + 0.1)
    .to(look, { particles: 0.75, form: 0, duration: 1.1, ease: "power2.inOut" }, first - 0.2)
    .to($("[data-title]"), { scale: 1.5, opacity: 0, duration: 0.6, ease: "power3.in" }, first - 0.35)
    .to(look, { warp: 0.12, duration: 1.4 }, first + 0.6)
    .set(look, { distance: 2.75, pitch: 0 }, first + 0.7)
    .fromTo($("[data-chain]"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, first);

  // Stage 3: photographs
  const words = $("[data-word]");
  const links = $("[data-link]");
  for (const [i, p] of progress.entries()) {
    const start = first + i * SCENE;
    const end = scenes.length - 1 === i;
    tl.addLabel(`scene-${i}`, start);
    tl.call(() => waitFor(i), undefined, start);
    tl.to(p, { reveal: 1, duration: end ? 1.1 : 0.9, ease: "power2.inOut" }, start + 0.01);
    if (i > 0) tl.to(progress[i - 1], { gone: 1, duration: 0.8, ease: "power2.in" }, start + 0.1);
    tl.fromTo(links[i], { scale: 0 }, { scale: 1, duration: 0.5 }, start + 0.2);
    tl.set(words[i], { visibility: "visible" }, start + 0.3);
    tl.fromTo(
      words[i].querySelectorAll("[data-rise]"),
      { yPercent: 115 },
      { yPercent: 0, duration: 0.7, stagger: 0.08, ease: "power4.out" },
      start + 0.3,
    );
    if (!end) {
      tl.to(
        words[i].querySelectorAll("[data-rise]"),
        { yPercent: -115, duration: 0.35, stagger: 0.04, ease: "power3.in" },
        start + SCENE - 0.05,
      ).set(words[i], { visibility: "hidden" }, start + SCENE + 0.4);
    }
  }

  // Stage 4: the way in
  const last = first + (scenes.length - 1) * SCENE;
  tl.to($("[data-skip]"), { autoAlpha: 0, duration: 0.3 }, last + 0.7)
    .set($("[data-enter]"), { visibility: "visible" }, last + 0.7)
    .fromTo($("[data-enter]"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, last + 0.7)
    .call(moveFocus, undefined, last + 0.75)
    .fromTo($("[data-timer]"), { scaleX: 0 }, { scaleX: 1, duration: WAIT, ease: "none" }, last + 1.2)
    .call(open, undefined, last + 1.2 + WAIT);

  /** Holds briefly for a photo still loading, then skips its scene. */
  function waitFor(i: number) {
    if (ready(i) || opened) return;
    tl.pause();
    const deadline = performance.now() + PATIENCE * 1000;
    const check = () => {
      if (opened || destroyed) return;
      if (ready(i)) {
        tl.play();
      } else if (!broken(i) && performance.now() < deadline) {
        window.setTimeout(check, 60);
      } else if (i === scenes.length - 1) {
        open();
      } else {
        progress[i].gone = 1;
        gsap.set(words[i], { visibility: "hidden" });
        tl.play(`scene-${i + 1}`, false);
      }
    };
    check();
  }

  function moveFocus() {
    // Only follow keyboard users; the skip button they were on is now hidden.
    if (document.activeElement?.hasAttribute("data-skip")) root.querySelector<HTMLElement>("[data-enter]")?.focus();
  }

  function open() {
    if (opened || destroyed) return;
    opened = true;
    tl.pause();
    onOpen();
    root.style.background = "transparent";
    root.style.pointerEvents = "none";
    gsap.to($("[data-ui]"), { opacity: 0, duration: 0.35, ease: "power2.in" });
    gsap.to(look, { exit: 1, duration: 1.35, ease: "power2.inOut", onComplete: onDone });
  }

  const onPointer = (e: PointerEvent) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const onLost = (e: Event) => {
    e.preventDefault();
    if (!destroyed && !opened) {
      opened = true;
      onOpen();
      onDone();
    }
  };
  canvas.addEventListener("webglcontextlost", onLost);
  window.addEventListener("pointermove", onPointer);
  window.addEventListener("resize", stage.resize);
  gsap.ticker.add(render);

  return {
    open,
    destroy() {
      destroyed = true;
      aborter.abort();
      tl.kill();
      gsap.killTweensOf(look);
      gsap.ticker.remove(render);
      canvas.removeEventListener("webglcontextlost", onLost);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", stage.resize);
      // React may run the effect again on this same canvas in development.
      if (opened) stage.destroy();
    },
  };
}
