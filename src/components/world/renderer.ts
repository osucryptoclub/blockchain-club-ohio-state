import { viewProjection, type Box, type Vec } from "@/lib/world";

/**
 * Draws boxes as glass and metal over a wet, dark lawn, with bloom. One
 * instanced draw call per pass, so a few hundred boxes cost very little.
 */

export type Frame = {
  boxes: Box[];
  eye: Vec;
  look: Vec;
  focal: number;
  shift: [number, number];
  time: number;
  /** Light on the lawn spreading from a block: x, z, distance reached, strength. */
  wave: [number, number, number, number];
  /** 0 hides the lawn, 1 shows it. */
  floor: number;
};

const SCENE = {
  vertex: `#version 300 es
precision highp float;
layout(location=0) in vec3 aCorner;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec3 iAt;
layout(location=3) in vec3 iHalf;
layout(location=4) in vec4 iLook; // yaw, material, glow, alpha
uniform mat4 uView;
uniform float uMirror;
out vec3 vNormal, vWorld, vLocal, vHalf, vFace;
flat out vec4 vLook;
void main() {
  float c = cos(iLook.x), s = sin(iLook.x);
  vec3 p = aCorner * iHalf;
  vec3 w = vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c) + iAt;
  w.y *= uMirror;
  vNormal = vec3(aNormal.x * c - aNormal.z * s, aNormal.y * uMirror, aNormal.x * s + aNormal.z * c);
  vWorld = w; vLocal = aCorner; vHalf = iHalf; vFace = aNormal; vLook = iLook;
  gl_Position = uView * vec4(w, 1.0);
}`,
  fragment: `#version 300 es
precision highp float;
in vec3 vNormal, vWorld, vLocal, vHalf, vFace;
flat in vec4 vLook;
uniform vec3 uEye;
uniform float uTime, uMirror, uFade;
out vec4 color;
void main() {
  float material = vLook.y, glow = vLook.z, alpha = vLook.w;
  vec3 n = normalize(vNormal);
  vec3 toEye = uEye - vWorld;
  float dist = length(toEye);
  vec3 eye = toEye / dist;
  float facing = max(dot(n, eye), 0.0);
  vec3 sun = normalize(vec3(0.45, 0.85, 0.4));
  float lit = max(dot(n, sun), 0.0);
  float rim = pow(1.0 - facing, 3.0);
  float shine = pow(max(dot(reflect(-sun, n), eye), 0.0), 40.0);
  float up = vLocal.y * 0.5 + 0.5;

  // Distance to the nearest edge of this face, in world units
  vec3 d = (1.0 - abs(vLocal)) * vHalf + abs(vFace) * 9.0;
  float edge = min(d.x, min(d.y, d.z));
  float line = 1.0 - smoothstep(0.0, 0.0016 * dist + 0.0006, edge);

  vec3 scarlet = vec3(0.73, 0.0, 0.0);
  vec3 c;
  if (material < 0.5) {
    float sheen = smoothstep(0.46, 0.5, fract(vWorld.x * 2.1 + vWorld.y * 3.0 + uTime * 0.05)) * 0.03;
    c = vec3(0.05, 0.05, 0.056) + vec3(0.2) * lit + sheen + scarlet * 0.22 * (1.0 - up);
    c += rim * vec3(0.4, 0.06, 0.04) + shine * vec3(0.8) + line * vec3(0.5, 0.34, 0.34);
  } else if (material < 1.5) {
    c = scarlet * (0.28 + 0.75 * lit) + rim * vec3(0.35, 0.03, 0.02) + shine * vec3(0.7) + line * vec3(0.5, 0.12, 0.1);
  } else if (material < 2.5) {
    c = vec3(0.16) + vec3(0.52) * lit + scarlet * 0.2 * (1.0 - up) + shine * 0.4 + rim * 0.15 + line * 0.3;
  } else if (material < 3.5) {
    c = mix(vec3(0.13), vec3(0.5), glow);
  } else if (material < 4.5) {
    c = mix(vec3(0.75, 0.02, 0.01), vec3(1.0, 0.8, 0.76), smoothstep(0.55, 1.0, glow)) * (0.4 + glow * 1.5);
  } else {
    c = vec3(0.3, 0.04, 0.04) * (0.4 + rim * 2.0) + line * 0.4;
  }
  if (material < 3.0) {
    vec3 ember = mix(vec3(0.34, 0.0, 0.0), vec3(1.0, 0.1, 0.06), up * up) * (0.55 + 0.5 * lit) + line * vec3(0.7, 0.3, 0.25);
    float flash = smoothstep(0.72, 1.0, glow);
    c = mix(c, ember, min(glow * 1.2, 1.0)) + flash * vec3(0.9, 0.6, 0.55) * up;
  }
  float fog = exp(-max(0.0, dist - 1.1) * 0.3);
  float depth = uMirror < 0.0 ? exp(vWorld.y * 7.0) * 0.5 : 1.0;
  float a = alpha * uFade;
  color = vec4(c * fog * depth * a, a);
}`,
};

const FLOOR = {
  vertex: `#version 300 es
precision highp float;
layout(location=0) in vec2 aPoint;
uniform mat4 uView;
out vec2 vAt;
void main() { vAt = aPoint * 7.0; gl_Position = uView * vec4(vAt.x, 0.0, vAt.y, 1.0); }`,
  fragment: `#version 300 es
precision highp float;
in vec2 vAt;
uniform vec3 uEye;
uniform vec4 uWave;
uniform float uFade;
out vec4 color;
void main() {
  float dist = length(uEye - vec3(vAt.x, 0.0, vAt.y));
  float r = length(vAt / vec2(1.0, 0.64));
  vec2 cell = vAt / 0.0625;
  vec2 f = abs(fract(cell) - 0.5);
  float px = fwidth(cell.x) + fwidth(cell.y);
  float dotted = (1.0 - smoothstep(0.03 + px * 0.2, 0.06 + px * 0.5, max(f.x, f.y))) * smoothstep(1.6, 0.4, px);
  float inside = 1.0 - smoothstep(0.96, 0.99, r);
  float pool = exp(-r * r * 0.9);
  float behind = uWave.z - length(vAt - uWave.xy);
  float wave = behind > 0.0 ? exp(-behind * 6.0) * uWave.w : 0.0;
  vec3 c = vec3(0.17, 0.0, 0.0) * pool + vec3(0.025, 0.0, 0.0) * exp(-r * 0.6);
  c += dotted * (vec3(0.2) * inside + vec3(0.045) * (1.0 - inside));
  c += (dotted * vec3(1.2, 0.5, 0.45) + vec3(0.22, 0.01, 0.0)) * wave;
  float fog = exp(-max(0.0, dist - 1.1) * 0.42);
  float a = 0.8 * uFade;
  color = vec4(c * fog * uFade, mix(uFade, a, fog));
}`,
};

const DUST = {
  vertex: `#version 300 es
precision highp float;
layout(location=0) in vec4 aSeed;
uniform mat4 uView;
uniform vec3 uEye;
uniform float uTime, uSize;
out float vAlpha;
void main() {
  vec3 p = vec3((aSeed.x - 0.5) * 5.0, fract(aSeed.y + uTime * 0.012 * (0.4 + aSeed.w)) * 1.3, (aSeed.z - 0.5) * 4.0);
  p.x += sin(uTime * 0.2 + aSeed.w * 20.0) * 0.06;
  gl_Position = uView * vec4(p, 1.0);
  float d = length(uEye - p);
  gl_PointSize = clamp(uSize * (0.5 + aSeed.w) / d, 1.0, uSize * 2.5);
  vAlpha = smoothstep(0.1, 0.5, d) * exp(-d * 0.5) * 0.7;
}`,
  fragment: `#version 300 es
precision mediump float;
in float vAlpha;
out vec4 color;
void main() { color = vec4(vec3(0.95, 0.25, 0.2) * vAlpha, 0.0); }`,
};

const SCREEN = `#version 300 es
precision highp float;
layout(location=0) in vec2 aPoint;
out vec2 vUv;
void main() { vUv = aPoint * 0.5 + 0.5; gl_Position = vec4(aPoint, 0.0, 1.0); }`;

const BLUR = {
  vertex: SCREEN,
  fragment: `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uImage;
uniform vec2 uStep;
uniform float uCut;
out vec4 color;
vec3 pick(vec2 uv) { vec3 c = texture(uImage, uv).rgb; return c * smoothstep(uCut, uCut + 0.4, max(c.r, max(c.g, c.b)) + (uCut <= 0.0 ? 1.0 : 0.0)); }
void main() {
  vec3 c = pick(vUv) * 0.227;
  for (int i = 1; i < 5; i++) {
    float w = i == 1 ? 0.1945 : i == 2 ? 0.1216 : i == 3 ? 0.054 : 0.0162;
    c += (pick(vUv + uStep * float(i) * 1.4) + pick(vUv - uStep * float(i) * 1.4)) * w;
  }
  color = vec4(c, 1.0);
}`,
};

const FINISH = {
  vertex: SCREEN,
  fragment: `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uImage, uBloom, uWide;
uniform float uTime;
out vec4 color;
void main() {
  vec3 c = texture(uImage, vUv).rgb + texture(uBloom, vUv).rgb * 0.75 + texture(uWide, vUv).rgb * 0.9;
  vec2 v = vUv - 0.5;
  c *= 1.0 - dot(v, v) * 0.55;
  c = c / (1.0 + max(max(c.r, c.g), c.b) * 0.18) * 1.12;
  c += (fract(sin(dot(gl_FragCoord.xy + fract(uTime) * 61.0, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.022;
  color = vec4(c, 1.0);
}`,
};

const FLOATS = 10;
const MAX = 700;

export function createRenderer(canvas: HTMLCanvasElement, small: boolean) {
  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "high-performance" });
  if (!gl) return null;

  const program = ({ vertex, fragment }: { vertex: string; fragment: string }) => {
    const p = gl.createProgram();
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertex],
      [gl.FRAGMENT_SHADER, fragment],
    ] as const) {
      const s = gl.createShader(type);
      if (!s) throw new Error("Could not create a shader");
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "Shader failed");
      gl.attachShader(p, s);
    }
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "Link failed");
    const cache = new Map<string, WebGLUniformLocation | null>();
    const at = (name: string) => {
      if (!cache.has(name)) cache.set(name, gl.getUniformLocation(p, name));
      return cache.get(name) ?? null;
    };
    return { use: () => gl.useProgram(p), at };
  };

  const scene = program(SCENE);
  const floor = program(FLOOR);
  const dust = program(DUST);
  const blur = program(BLUR);
  const finish = program(FINISH);

  // A unit cube, then one buffer of instances that is refilled every frame
  const cube: number[] = [];
  for (const axis of [0, 1, 2]) {
    for (const sign of [-1, 1]) {
      const [u, v] = [(axis + 1) % 3, (axis + 2) % 3];
      for (const [a, b] of [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, -1],
        [1, 1],
        [-1, 1],
      ]) {
        const p = [0, 0, 0];
        p[axis] = sign;
        p[u] = a;
        p[v] = b;
        const n = [0, 0, 0];
        n[axis] = sign;
        cube.push(...p, ...n);
      }
    }
  }
  const boxVao = gl.createVertexArray();
  gl.bindVertexArray(boxVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube), gl.STATIC_DRAW);
  for (const [loc, offset] of [
    [0, 0],
    [1, 12],
  ]) {
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 24, offset);
  }
  const instances = new Float32Array(MAX * FLOATS);
  const instanceBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, instances.byteLength, gl.DYNAMIC_DRAW);
  for (const [loc, size, offset] of [
    [2, 3, 0],
    [3, 3, 12],
    [4, 4, 24],
  ]) {
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, FLOATS * 4, offset);
    gl.vertexAttribDivisor(loc, 1);
  }

  const flat = (data: number[], size: number) => {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, size, gl.FLOAT, false, 0, 0);
    return vao;
  };
  const quad = flat([-1, -1, 1, -1, -1, 1, 1, 1], 2);
  const specks = small ? 140 : 420;
  const dustVao = flat(
    Array.from({ length: specks * 4 }, () => Math.random()),
    4,
  );

  // Render targets: the scene with antialiasing, then two sizes of bloom
  const samples = Math.min(4, gl.getParameter(gl.MAX_SAMPLES) as number);
  const multisampled = gl.createFramebuffer();
  const colorBuffer = gl.createRenderbuffer();
  const depthBuffer = gl.createRenderbuffer();
  const target = () => {
    const texture = gl.createTexture();
    const frame = gl.createFramebuffer();
    return { texture, frame, w: 1, h: 1 };
  };
  const image = target();
  const near = [target(), target()];
  const wide = [target(), target()];

  const size = (t: ReturnType<typeof target>, w: number, h: number) => {
    [t.w, t.h] = [w, h];
    gl.bindTexture(gl.TEXTURE_2D, t.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    for (const p of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR);
    for (const p of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, t.frame);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.texture, 0);
  };

  let ratio = 1;
  const resize = () => {
    ratio = Math.min(window.devicePixelRatio || 1, small ? 1.4 : 1.5);
    const w = Math.max(2, Math.round(canvas.clientWidth * ratio));
    const h = Math.max(2, Math.round(canvas.clientHeight * ratio));
    if (canvas.width === w && canvas.height === h && image.w === w) return;
    [canvas.width, canvas.height] = [w, h];
    size(image, w, h);
    const half = (n: number, by: number) => Math.max(1, Math.round(n / by));
    for (const t of near) size(t, half(w, 4), half(h, 4));
    for (const t of wide) size(t, half(w, 14), half(h, 14));
    gl.bindRenderbuffer(gl.RENDERBUFFER, colorBuffer);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.RGBA8, w, h);
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.DEPTH_COMPONENT24, w, h);
    gl.bindFramebuffer(gl.FRAMEBUFFER, multisampled);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, colorBuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
  };

  const pass = (from: WebGLTexture, to: ReturnType<typeof target>, dx: number, dy: number, cut: number) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, to.frame);
    gl.viewport(0, 0, to.w, to.h);
    blur.use();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, from);
    gl.uniform1i(blur.at("uImage"), 0);
    gl.uniform2f(blur.at("uStep"), dx / to.w, dy / to.h);
    gl.uniform1f(blur.at("uCut"), cut);
    gl.bindVertexArray(quad);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const render = (f: Frame) => {
    const aspect = canvas.width / canvas.height;
    const view = viewProjection(f.eye, f.look, aspect, f.focal, f.shift);

    // Opaque boxes first, so glass and light blend over them
    const sorted = f.boxes.length > MAX ? f.boxes.slice(0, MAX) : [...f.boxes];
    sorted.sort((a, b) => Number((a.alpha ?? 1) < 1) - Number((b.alpha ?? 1) < 1));
    for (const [i, b] of sorted.entries()) {
      instances.set([...b.at, ...b.half, b.yaw ?? 0, b.material, b.glow ?? 0, b.alpha ?? 1], i * FLOATS);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, instances, 0, sorted.length * FLOATS);

    gl.bindFramebuffer(gl.FRAMEBUFFER, multisampled);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const boxes = (mirror: number) => {
      scene.use();
      gl.uniformMatrix4fv(scene.at("uView"), false, view);
      gl.uniform3f(scene.at("uEye"), ...f.eye);
      gl.uniform1f(scene.at("uTime"), f.time);
      gl.uniform1f(scene.at("uMirror"), mirror);
      gl.uniform1f(scene.at("uFade"), 1);
      gl.bindVertexArray(boxVao);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, cube.length / 6, sorted.length);
    };

    if (f.floor > 0) {
      boxes(-1);
      gl.depthMask(false);
      floor.use();
      gl.uniformMatrix4fv(floor.at("uView"), false, view);
      gl.uniform3f(floor.at("uEye"), ...f.eye);
      gl.uniform4f(floor.at("uWave"), ...f.wave);
      gl.uniform1f(floor.at("uFade"), f.floor);
      gl.bindVertexArray(quad);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.depthMask(true);
    }
    boxes(1);
    gl.depthMask(false);
    dust.use();
    gl.uniformMatrix4fv(dust.at("uView"), false, view);
    gl.uniform3f(dust.at("uEye"), ...f.eye);
    gl.uniform1f(dust.at("uTime"), f.time);
    gl.uniform1f(dust.at("uSize"), 2.4 * ratio);
    gl.bindVertexArray(dustVao);
    gl.drawArrays(gl.POINTS, 0, specks);
    gl.depthMask(true);

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, multisampled);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, image.frame);
    const { width: w, height: h } = canvas;
    gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.COLOR_BUFFER_BIT, gl.NEAREST);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    pass(image.texture, near[0], 1, 0, 0.42);
    pass(near[0].texture, near[1], 0, 1, 0);
    pass(near[1].texture, wide[0], 1, 0, 0);
    pass(wide[0].texture, wide[1], 0, 1, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, w, h);
    finish.use();
    for (const [i, [name, t]] of [
      ["uImage", image],
      ["uBloom", near[1]],
      ["uWide", wide[1]],
    ].entries() as unknown as [number, [string, ReturnType<typeof target>]][]) {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, t.texture);
      gl.uniform1i(finish.at(name), i);
    }
    gl.uniform1f(finish.at("uTime"), f.time);
    gl.bindVertexArray(quad);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return view;
  };

  resize();
  return { resize, render, lost: () => gl.isContextLost() };
}
