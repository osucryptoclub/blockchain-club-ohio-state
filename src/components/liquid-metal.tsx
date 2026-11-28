"use client";

import { useEffect, useRef } from "react";

const VERTEX = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

// Repeated warping folds the surface; light catches along the folds.
const FRAGMENT = `
precision highp float;
uniform vec2 uSize, uPointer;
uniform float uTime, uShine;
void main() {
  float unit = max(uSize.x * 0.6, uSize.y * 0.8);
  vec2 p = (gl_FragCoord.xy - 0.5 * uSize) / unit * 2.5;
  vec2 m = (uPointer - 0.5) * uSize / unit * 2.5;
  vec2 away = p - m;
  p += away * 0.45 * exp(-dot(away, away) * 2.4);
  float t = uTime * 0.16;
  for (float i = 1.0; i < 6.0; i += 1.0) {
    p.x += 0.62 / i * sin(i * 1.5 * p.y + t + i * 0.7);
    p.y += 0.62 / i * cos(i * 1.4 * p.x - t * 0.8 + i * 1.1);
  }
  float v = abs(sin(p.x * 1.05 + p.y * 0.85));
  float fold = pow(1.0 - v, 7.0);
  float crease = smoothstep(0.02, 0.22, v) * (1.0 - smoothstep(0.22, 0.62, v));
  float crown = smoothstep(0.86, 1.0, v);
  vec3 c = mix(vec3(0.2 + 0.2 * uShine, 0.0, 0.0), vec3(0.7 + 0.06 * uShine, 0.008, 0.004), smoothstep(0.1, 0.95, v));
  c *= 1.0 - crease * 0.5 * (1.0 - uShine * 0.4);
  c += vec3(0.46, 0.05, 0.035) * fold + vec3(0.03, 0.01, 0.008) * crown;
  c = mix(c, vec3(1.0, 0.9, 0.88), clamp(fold * 0.95 + crown * 0.4, 0.0, 1.0) * uShine);
  gl_FragColor = vec4(c, 1.0);
}`;

/**
 * Scarlet liquid metal that leans away from the pointer. Runs only while on
 * screen, at half resolution. Shows a still frame under reduced motion, and the
 * section's own color where WebGL is missing. `shine` whitens the highlights;
 * keep it at 0 behind text.
 */
export function LiquidMetal({ className = "", shine = 0 }: { className?: string; shine?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { antialias: false, powerPreference: "low-power" });
    if (!canvas || !gl) return;

    const program = gl.createProgram();
    for (const [type, source] of [
      [gl.VERTEX_SHADER, VERTEX],
      [gl.FRAGMENT_SHADER, FRAGMENT],
    ] as const) {
      const shader = gl.createShader(type);
      if (!shader) return;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const at = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(at);
    gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
    const [size, pointer, time, shineAt] = ["uSize", "uPointer", "uTime", "uShine"].map((n) =>
      gl.getUniformLocation(program, n),
    );

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let frame = 0;
    let visible = false;

    const draw = (now: number) => {
      frame = 0;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      gl.uniform2f(size, canvas.width, canvas.height);
      gl.uniform2f(pointer, mouse.x, mouse.y);
      gl.uniform1f(time, still.matches ? 8 : now / 1000);
      gl.uniform1f(shineAt, shine);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.style.opacity = "1";
      if (visible && !still.matches) request();
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const resize = new ResizeObserver(() => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth / 2));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight / 2));
      gl.viewport(0, 0, canvas.width, canvas.height);
      request();
    });
    const watch = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) request();
    });
    const onMove = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      mouse.tx = (event.clientX - box.left) / box.width;
      mouse.ty = 1 - (event.clientY - box.top) / box.height;
    };

    resize.observe(canvas);
    watch.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      watch.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [shine]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 size-full opacity-0 transition-opacity duration-700 ${className}`}
    />
  );
}
