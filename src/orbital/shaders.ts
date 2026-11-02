// One position attribute per orbital. uMorph runs 0..4 and the vertex shader
// blends between whichever two states it's sitting between.

export const vertex = /* glsl */ `
uniform float uMorph;
uniform float uTime;
uniform float uJitter;
uniform float uCollapse;
uniform vec3 uCollapseAt;
uniform vec2 uMouse;
uniform float uMouseForce;
uniform float uSize;
uniform float uPixelRatio;

attribute vec3 p0;
attribute vec3 p1;
attribute vec3 p2;
attribute vec3 p3;
attribute vec3 p4;
attribute vec4 ph;
attribute float ph4;
attribute float seed;

varying float vPhase;
varying float vGlow;

// 1 at k, 0 one step away. Neighbouring hats always sum to 1.
float hat(float m, float k) {
  float d = abs(m - k);
  return d >= 1.0 ? 0.0 : 1.0 - smoothstep(0.0, 1.0, d);
}

vec3 rotY(vec3 p, float a) {
  float c = cos(a), s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

void main() {
  float w0 = hat(uMorph, 0.0);
  float w1 = hat(uMorph, 1.0);
  float w2 = hat(uMorph, 2.0);
  float w3 = hat(uMorph, 3.0);
  float w4 = hat(uMorph, 4.0);

  vec3 pos = p0 * w0 + p1 * w1 + p2 * w2 + p3 * w3 + p4 * w4;
  vPhase = ph.x * w0 + ph.y * w1 + ph.z * w2 + ph.w * w3 + ph4 * w4;

  // 0 when settled on one orbital, 0.5 halfway between two
  float between = 1.0 - max(max(max(w0, w1), max(w2, w3)), w4);
  // twist while in transit, each particle a bit differently, so the morph swirls
  pos = rotY(pos, between * (1.6 + 2.2 * seed));

  // a little zero-point wobble so it never sits perfectly still
  pos += uJitter * 0.012 * vec3(
    sin(uTime * 1.7 + seed * 91.0),
    sin(uTime * 1.3 + seed * 47.0),
    cos(uTime * 1.9 + seed * 13.0)
  );

  // measurement: everything rushes to one point, outer particles a touch late
  float c = clamp(uCollapse * 1.35 - seed * 0.35, 0.0, 1.0);
  c = c * c * (3.0 - 2.0 * c);
  pos = mix(pos, uCollapseAt, c);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);

  // the cursor parts the cloud, measured in screen space so it feels the same at any depth
  vec2 d = mv.xy / -mv.z - uMouse;
  float push = uMouseForce * smoothstep(0.24, 0.0, length(d));
  mv.xy += normalize(d + 1e-5) * push * 0.16 * -mv.z;

  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (0.55 + 0.9 * fract(seed * 7.31)) / -mv.z;
  vGlow = c;
}
`;

export const fragment = /* glsl */ `
uniform vec3 uPos;
uniform vec3 uNeg;
uniform float uOpacity;

varying float vPhase;
varying float vGlow;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.05, d);
  vec3 col = mix(uNeg, uPos, vPhase * 0.5 + 0.5);
  col = mix(col, vec3(1.0), vGlow * 0.35);
  gl_FragColor = vec4(col, a * uOpacity);
}
`;
