import { oval } from "@/lib/oval";
import { ground, heights, rim } from "@/lib/scene";

/**
 * The introduction's renderer: one WebGL 2 canvas that draws the particle
 * field, the Oval in glass and metal, the photographs, and the final handoff
 * to the page. It holds no timing of its own; the timeline sets every value.
 */

export type Look = {
  /** Particles: 0 scattered, 1 assembled into the Oval. */
  form: number;
  /** Speed and length of the light streaks. */
  warp: number;
  /** Distance travelled, so speed changes never jump. */
  travel: number;
  particles: number;
  lines: number;
  rise: number;
  structure: number;
  yaw: number;
  pitch: number;
  distance: number;
  lift: number;
  /** 0 covers the page, 1 has revealed it. */
  exit: number;
  time: number;
};

export type TileDraw = {
  texture: Texture;
  rect: [number, number, number, number];
  focus: [number, number];
  drift: [number, number];
  reveal: number;
  gone: number;
  age: number;
  seed: number;
};

export type Texture = { handle: WebGLTexture; aspect: number };

const CAMERA = `
uniform vec4 uCam; // yaw, pitch, distance, aspect
uniform vec2 uLens; // focal length, vertical offset
vec3 toView(vec3 p) {
  float cy = cos(uCam.x), sy = sin(uCam.x), cp = cos(uCam.y), sp = sin(uCam.y);
  vec3 q = vec3(p.x * cy - p.z * sy, p.y, p.x * sy + p.z * cy);
  return vec3(q.x, q.y * cp - q.z * sp, q.y * sp + q.z * cp);
}
vec4 toClip(vec3 v) {
  float depth = uCam.z - v.z;
  float z = (depth * 12.05 - 1.2) / 11.95;
  vec4 c = vec4(v.x * uLens.x / uCam.w, v.y * uLens.x, z, depth);
  c.y += uLens.y * depth;
  return c;
}
`;

const HASH = `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
`;

const PARTICLES = {
  vertex: `#version 300 es
precision highp float;
in vec3 aTarget;
in vec4 aSeed;
uniform float uForm, uTravel, uSize, uAlpha;
out vec4 vColor;
${CAMERA}
void main() {
  float angle = aSeed.x * 6.2832;
  float radius = 0.35 + aSeed.y * 2.6;
  float z = mod(aSeed.z * 9.0 + uTravel * (0.5 + aSeed.w), 9.0) - 6.0;
  vec3 loose = vec3(cos(angle) * radius * 1.5, sin(angle) * radius, z);
  float e = clamp(uForm * 1.8 - aSeed.w * 0.8, 0.0, 1.0);
  e = e * e * (3.0 - 2.0 * e);
  vec3 v = mix(loose, toView(aTarget), e);
  gl_Position = toClip(v);
  float depth = max(0.1, gl_Position.w);
  gl_PointSize = clamp(uSize * mix(1.5, 1.0, e) / depth, 1.0, uSize * 2.2);
  float near = smoothstep(0.15, 0.9, depth);
  float far = 1.0 - smoothstep(5.0, 8.5, depth);
  vec3 color = mix(vec3(0.86, 0.06, 0.03), vec3(1.0), step(0.74, aSeed.w));
  float a = uAlpha * near * far * mix(0.85, 0.55, e);
  vColor = vec4(color * a, 0.0);
}`,
  fragment: `#version 300 es
precision mediump float;
in vec4 vColor;
out vec4 color;
void main() { color = vColor; }`,
};

const STREAKS = {
  vertex: `#version 300 es
precision highp float;
in vec4 aSeed;
in float aEnd;
uniform float uTravel, uWarp, uAlpha;
out vec4 vColor;
${CAMERA}
void main() {
  float angle = aSeed.x * 6.2832;
  float radius = 0.5 + aSeed.y * 2.4;
  float z = mod(aSeed.z * 9.0 + uTravel * (1.0 + aSeed.w), 9.0) - 6.0;
  z -= aEnd * (0.1 + uWarp * (0.7 + aSeed.w));
  gl_Position = toClip(vec3(cos(angle) * radius * 1.5, sin(angle) * radius, z));
  float depth = gl_Position.w;
  float a = uAlpha * uWarp * (1.0 - aEnd) * smoothstep(0.1, 1.2, depth) * (1.0 - smoothstep(5.0, 8.0, depth));
  vColor = vec4(mix(vec3(0.75, 0.02, 0.0), vec3(1.0, 0.75, 0.7), step(0.85, aSeed.w)) * a, 0.0);
}`,
  fragment: PARTICLES.fragment,
};

const LINES = {
  vertex: `#version 300 es
precision highp float;
in vec3 aPoint;
uniform float uLines, uTime, uAlpha;
out vec4 vColor;
${CAMERA}
void main() {
  gl_Position = toClip(toView(aPoint));
  float d = length(aPoint.xz);
  float shown = smoothstep(0.0, 0.15, uLines * 1.25 - d);
  float pulse = pow(1.0 - fract(uTime * 0.45 - d * 0.8), 6.0);
  vec3 c = mix(vec3(0.34), vec3(1.0, 0.1, 0.06), clamp(pulse * 1.2, 0.0, 1.0)) * (0.7 + pulse);
  vColor = vec4(c * shown * uAlpha, 0.0);
}`,
  fragment: PARTICLES.fragment,
};

const BLOCKS = {
  vertex: `#version 300 es
precision highp float;
in vec3 aCorner;
in vec3 aNormal;
in vec2 aFace;
in vec4 aBlock; // x, z, height, half width
uniform float uRise;
out vec3 vNormal, vView;
out vec2 vFace;
out float vUp, vLit;
${CAMERA}
void main() {
  float d = length(aBlock.xy);
  float e = clamp(uRise * 1.9 - d * 0.9, 0.0, 1.0);
  e = 1.0 - pow(1.0 - e, 4.0);
  vec3 p = vec3(aBlock.x + aCorner.x * aBlock.w, aCorner.y * aBlock.z * e, aBlock.y + aCorner.z * aBlock.w);
  vView = toView(p);
  vNormal = toView(aNormal);
  vFace = aFace;
  vUp = aCorner.y;
  vLit = e;
  gl_Position = toClip(vView);
}`,
  fragment: `#version 300 es
precision highp float;
in vec3 vNormal, vView;
in vec2 vFace;
in float vUp, vLit;
uniform float uAlpha, uTime;
uniform vec4 uCam;
out vec4 color;
void main() {
  vec3 n = normalize(vNormal);
  vec3 eye = normalize(vec3(0.0, 0.0, uCam.z) - vView);
  vec3 light = normalize(vec3(0.5, 0.8, 0.6));
  float facing = max(dot(n, eye), 0.0);
  float rimLight = pow(1.0 - facing, 2.5);
  float shine = pow(max(dot(reflect(-light, n), eye), 0.0), 24.0);
  float sheen = smoothstep(0.45, 0.5, fract(vFace.x * 0.35 + vFace.y * 0.22 - uTime * 0.07)) * 0.05;
  vec2 edge = min(vFace, 1.0 - vFace);
  float line = 1.0 - smoothstep(0.0, 0.07, min(edge.x, edge.y));
  vec3 metal = vec3(0.045, 0.045, 0.05) + vec3(0.17) * max(dot(n, light), 0.0) + sheen;
  vec3 ember = vec3(0.73, 0.0, 0.0) * (0.1 + 0.55 * vUp * vUp);
  vec3 c = metal + ember + rimLight * vec3(0.45, 0.06, 0.04) + shine * vec3(0.9) + line * vec3(0.5, 0.3, 0.3);
  float a = uAlpha * 0.94 * smoothstep(0.0, 0.2, vLit);
  color = vec4(c * a, a);
}`,
};

const QUAD = `#version 300 es
precision highp float;
in vec2 aUnit;
uniform vec4 uRect; // left, top, width, height
out vec2 vUnit;
void main() {
  vUnit = aUnit;
  vec2 p = uRect.xy + aUnit * uRect.zw;
  gl_Position = vec4(p.x * 2.0 - 1.0, 1.0 - p.y * 2.0, 0.0, 1.0);
}`;

const PHOTO = {
  vertex: QUAD,
  fragment: `#version 300 es
precision highp float;
in vec2 vUnit;
uniform sampler2D uPhoto;
uniform vec2 uSize;   // tile size in pixels
uniform vec2 uFocus, uPan;
uniform float uAspect, uZoom, uReveal, uGone, uCell, uSeed, uTime, uFull;
out vec4 color;
${HASH}
void main() {
  vec2 grid = max(vec2(1.0), floor(uSize / uCell + 0.5));
  vec2 cell = floor(vUnit * grid);
  vec2 local = abs(fract(vUnit * grid) - 0.5) * 2.0;
  float noise = hash(cell + uSeed);
  vec2 at = (cell + 0.5) / grid;
  float order = mix(dot(at, vec2(0.62, 0.38)), noise, 0.42);

  // Each block grows from its center as the wave reaches it.
  float p = clamp((uReveal * 1.45 - order) / 0.45, 0.0, 1.0);
  float grown = 1.0 - pow(1.0 - p, 3.0);
  float mask = step(max(local.x, local.y), grown * 1.02) * step(0.001, p);
  float q = clamp((uGone * 1.45 - (1.0 - order)) / 0.45, 0.0, 1.0);
  mask *= 1.0 - step(max(local.x, local.y), q * 1.02) * step(0.001, q);
  if (mask < 0.5) discard;

  // Cover the tile without stretching, keeping the focus in view.
  float tile = uSize.x / uSize.y;
  vec2 span = tile > uAspect ? vec2(1.0, uAspect / tile) : vec2(tile / uAspect, 1.0);
  span /= uZoom;
  vec2 corner = clamp(uFocus - span * 0.5 + uPan * span, vec2(0.0), 1.0 - span);
  vec2 shift = (noise - 0.5) * vec2(0.05, -0.05) * (1.0 - grown);
  vec2 uv = clamp(corner + vUnit * span + shift, 0.0, 1.0);
  vec3 c = texture(uPhoto, uv).rgb;

  // One grade for every photo: deeper blacks, softer color, scarlet shadows.
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(l), c, 0.8);
  c = mix(c, c * c * (3.0 - 2.0 * c), 0.55) * 0.88;
  c += vec3(0.075, 0.0, 0.0) * (1.0 - smoothstep(0.0, 0.45, l));
  vec2 v = vUnit - 0.5;
  c *= 1.0 - dot(v, v) * mix(0.35, 0.95, uFull);
  c += (hash(gl_FragCoord.xy + fract(uTime) * 91.0) - 0.5) * 0.03;

  float heat = 1.0 - smoothstep(0.15, 1.0, p);
  c = mix(c, vec3(0.73, 0.0, 0.0) + noise * 0.12, heat);
  color = vec4(c, 1.0);
}`,
};

const HANDOFF = {
  vertex: QUAD,
  fragment: `#version 300 es
precision highp float;
in vec2 vUnit;
uniform vec2 uSize, uOrigin;
uniform float uExit, uCell, uErase;
out vec4 color;
${HASH}
void main() {
  vec2 grid = max(vec2(1.0), floor(uSize / uCell + 0.5));
  vec2 cell = floor(vUnit * grid);
  vec2 local = abs(fract(vUnit * grid) - 0.5) * 2.0;
  vec2 at = (cell + 0.5) / grid - uOrigin;
  at.x *= uSize.x / uSize.y;
  float far = length(vec2(uSize.x / uSize.y, 1.0));
  float order = mix(length(at) / far, hash(cell), 0.22);
  float p = clamp((uExit * 1.35 - order) / 0.35, 0.0, 1.0);
  float hole = step(max(local.x, local.y), smoothstep(0.35, 1.0, p) * 1.02) * step(0.351, p);
  float lit = smoothstep(0.0, 0.3, p) * (0.35 + 0.65 * hash(cell + 7.0));
  color = uErase > 0.5 ? vec4(hole) : vec4(vec3(0.73, 0.0, 0.0) * lit, lit);
}`,
};

type Program = {
  use: () => void;
  attribute: (name: string) => number;
  set: (name: string, ...values: number[]) => void;
};

export function createStage(canvas: HTMLCanvasElement, small: boolean) {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: !small,
    powerPreference: "high-performance",
  });
  if (!gl) return null;

  const program = ({ vertex, fragment }: { vertex: string; fragment: string }): Program => {
    const p = gl.createProgram();
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertex],
      [gl.FRAGMENT_SHADER, fragment],
    ] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Could not create a shader");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) ?? "Shader failed to compile");
      }
      gl.attachShader(p, shader);
    }
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(p) ?? "Program failed to link");
    }
    const uniforms = new Map<string, WebGLUniformLocation | null>();
    return {
      use: () => gl.useProgram(p),
      attribute: (name) => gl.getAttribLocation(p, name),
      set: (name, ...v) => {
        if (!uniforms.has(name)) uniforms.set(name, gl.getUniformLocation(p, name));
        const at = uniforms.get(name) ?? null;
        if (v.length === 1) gl.uniform1f(at, v[0]);
        else if (v.length === 2) gl.uniform2f(at, v[0], v[1]);
        else gl.uniform4f(at, v[0], v[1], v[2], v[3]);
      },
    };
  };

  /** A vertex array fed from one interleaved buffer. */
  const mesh = (p: Program, data: number[], layout: [name: string, size: number][]) => {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    const stride = layout.reduce((sum, [, size]) => sum + size, 0);
    let offset = 0;
    for (const [name, size] of layout) {
      const at = p.attribute(name);
      if (at !== -1) {
        gl.enableVertexAttribArray(at);
        gl.vertexAttribPointer(at, size, gl.FLOAT, false, stride * 4, offset * 4);
      }
      offset += size;
    }
    return { vao, count: data.length / stride };
  };

  const paths = [
    ...oval.edges.map(({ a, b }) => (t: number) => ({
      x: ground[a].x + (ground[b].x - ground[a].x) * t,
      z: ground[a].z + (ground[b].z - ground[a].z) * t,
    })),
    ...[1, 1, 1.07].map((spread) => (t: number) => rim(t * Math.PI * 2, spread)),
  ];

  const particleProgram = program(PARTICLES);
  const particleData: number[] = [];
  for (let i = 0; i < (small ? 1100 : 3600); i++) {
    let target: [number, number, number];
    if (i % 3 === 0) {
      const n = Math.floor(Math.random() * ground.length);
      const spread = oval.nodes[n].ring ? 0.02 : 0.032;
      const side = () => (Math.random() - 0.5) * 2 * spread;
      target = [ground[n].x + side(), Math.random() * heights[n] * 1.5, ground[n].z + side()];
    } else {
      // Rings are long, so they get more than their share of points.
      const ring = Math.random() < 0.35;
      const g = paths[ring ? paths.length - 1 - Math.floor(Math.random() * 3) : Math.floor(Math.random() * oval.edges.length)](
        Math.random(),
      );
      target = [g.x, Math.random() * 0.012, g.z];
    }
    particleData.push(...target, Math.random(), Math.random(), Math.random(), Math.random());
  }
  const particles = mesh(particleProgram, particleData, [
    ["aTarget", 3],
    ["aSeed", 4],
  ]);

  const streakProgram = program(STREAKS);
  const streakData: number[] = [];
  for (let i = 0; i < (small ? 60 : 170); i++) {
    const seed = [Math.random(), Math.random(), Math.random(), Math.random()];
    streakData.push(...seed, 0, ...seed, 1);
  }
  const streaks = mesh(streakProgram, streakData, [
    ["aSeed", 4],
    ["aEnd", 1],
  ]);

  const lineProgram = program(LINES);
  const lineData: number[] = [];
  for (const [i, point] of paths.entries()) {
    const steps = i < oval.edges.length ? 10 : 140;
    for (let s = 0; s < steps; s++) {
      for (const g of [point(s / steps), point((s + 1) / steps)]) lineData.push(g.x, 0, g.z);
    }
  }
  const lines = mesh(lineProgram, lineData, [["aPoint", 3]]);

  const blockProgram = program(BLOCKS);
  const blockData: number[] = [];
  // Four sides and a top, each as two triangles.
  const faces = [
    { n: [0, 0, 1], at: (u: number, v: number) => [u * 2 - 1, v, 1] },
    { n: [0, 0, -1], at: (u: number, v: number) => [1 - u * 2, v, -1] },
    { n: [1, 0, 0], at: (u: number, v: number) => [1, v, 1 - u * 2] },
    { n: [-1, 0, 0], at: (u: number, v: number) => [-1, v, u * 2 - 1] },
    { n: [0, 1, 0], at: (u: number, v: number) => [u * 2 - 1, 1, 1 - v * 2] },
  ];
  for (const [i, g] of ground.entries()) {
    const { ring } = oval.nodes[i];
    const block = [g.x, g.z, heights[i] * (ring ? 1.4 : 1.7), ring ? 0.02 : 0.034];
    for (const { n, at } of faces) {
      for (const [u, v] of [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 0],
        [1, 1],
        [0, 1],
      ]) {
        blockData.push(...at(u, v), ...n, u, v, ...block);
      }
    }
  }
  const blocks = mesh(blockProgram, blockData, [
    ["aCorner", 3],
    ["aNormal", 3],
    ["aFace", 2],
    ["aBlock", 4],
  ]);

  const photoProgram = program(PHOTO);
  const handoffProgram = program(HANDOFF);
  const unit = [0, 0, 1, 0, 0, 1, 1, 1];
  const photoQuad = mesh(photoProgram, unit, [["aUnit", 2]]);
  const handoffQuad = mesh(handoffProgram, unit, [["aUnit", 2]]);

  let width = 1;
  let height = 1;
  let ratio = 1;

  const resize = () => {
    ratio = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const texture = (image: ImageBitmap): Texture => {
    const handle = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, handle);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return { handle, aspect: image.width / image.height };
  };

  const render = (look: Look, tiles: TileDraw[], pointer: { x: number; y: number }) => {
    const aspect = width / height;
    const cell = small ? 34 : Math.max(44, width / 26);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const camera = (p: Program) => {
      p.use();
      p.set("uCam", look.yaw + pointer.x * 0.06, look.pitch + pointer.y * 0.03, look.distance, aspect);
      p.set("uLens", 1.75 * Math.min(1, aspect * 0.95), look.lift);
    };

    if (look.structure > 0.001) {
      gl.enable(gl.DEPTH_TEST);
      camera(blockProgram);
      blockProgram.set("uRise", look.rise);
      blockProgram.set("uAlpha", look.structure);
      blockProgram.set("uTime", look.time);
      if (look.rise > 0.001) {
        gl.bindVertexArray(blocks.vao);
        gl.drawArrays(gl.TRIANGLES, 0, blocks.count);
      }
      gl.depthMask(false);
      camera(lineProgram);
      lineProgram.set("uLines", look.lines);
      lineProgram.set("uTime", look.time);
      lineProgram.set("uAlpha", look.structure);
      gl.bindVertexArray(lines.vao);
      gl.drawArrays(gl.LINES, 0, lines.count);
      gl.depthMask(true);
      gl.disable(gl.DEPTH_TEST);
    }

    if (look.particles > 0.001) {
      camera(particleProgram);
      particleProgram.set("uForm", look.form);
      particleProgram.set("uTravel", look.travel);
      particleProgram.set("uSize", (small ? 5 : 6.5) * ratio);
      particleProgram.set("uAlpha", look.particles);
      gl.bindVertexArray(particles.vao);
      gl.drawArrays(gl.POINTS, 0, particles.count);

      camera(streakProgram);
      streakProgram.set("uTravel", look.travel);
      streakProgram.set("uWarp", look.warp);
      streakProgram.set("uAlpha", look.particles);
      gl.bindVertexArray(streaks.vao);
      gl.drawArrays(gl.LINES, 0, streaks.count);
    }

    photoProgram.use();
    gl.bindVertexArray(photoQuad.vao);
    for (const tile of tiles) {
      if (tile.reveal <= 0 || tile.gone >= 1) continue;
      const [left, top, w, h] = tile.rect;
      const full = w === 1 && h === 1 ? 1 : 0;
      // Framed photos float at different depths; full ones move inside the frame.
      const depth = full ? 0 : 0.006 + (tile.seed % 3) * 0.005;
      const ease = 1 - Math.exp(-tile.age * 0.9);
      photoProgram.set(
        "uRect",
        left + (full || w === 1 || h === 1 ? 0 : pointer.x * depth + tile.drift[0] * (1 - ease)),
        top + (full || h === 1 ? 0 : pointer.y * depth + tile.drift[1] * (1 - ease)),
        w,
        h,
      );
      photoProgram.set("uSize", w * width, h * height);
      photoProgram.set("uFocus", tile.focus[0], tile.focus[1]);
      photoProgram.set("uPan", tile.drift[0] * ease + pointer.x * 0.008, tile.drift[1] * ease + pointer.y * 0.008);
      photoProgram.set("uAspect", tile.texture.aspect);
      photoProgram.set("uZoom", 1.02 + 0.09 * Math.exp(-tile.age * 0.55));
      photoProgram.set("uReveal", tile.reveal);
      photoProgram.set("uGone", tile.gone);
      photoProgram.set("uCell", full ? cell : cell * 0.75);
      photoProgram.set("uSeed", tile.seed);
      photoProgram.set("uTime", look.time);
      photoProgram.set("uFull", full);
      gl.bindTexture(gl.TEXTURE_2D, tile.texture.handle);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    if (look.exit > 0) {
      handoffProgram.use();
      gl.bindVertexArray(handoffQuad.vao);
      handoffProgram.set("uRect", 0, 0, 1, 1);
      handoffProgram.set("uSize", width, height);
      handoffProgram.set("uOrigin", small ? 0.5 : 0.7, small ? 0.75 : 0.65);
      handoffProgram.set("uExit", look.exit);
      handoffProgram.set("uCell", cell);
      handoffProgram.set("uErase", 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      handoffProgram.set("uErase", 1);
      gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    gl.bindVertexArray(null);
  };

  const destroy = () => gl.getExtension("WEBGL_lose_context")?.loseContext();

  resize();
  return { resize, texture, render, destroy, lost: () => gl.isContextLost() };
}
