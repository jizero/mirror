import { MAX_RIPPLES } from "../config";

export const waterVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * 화면 전체를 채우는 잔잔한 분홍빛 물.
 * - 느린 너울 + 잔잔한 결 (fbm)
 * - 누른 자리에서 퍼지는 물결 (uRipples: x, y, 시작 시각)
 * - 말하는 동안 글 주변에서 이는 잔물결 (uSpeak)
 * 높이값에서 법선을 구해 빛 반사와 물속 빛무늬(커스틱)를 그립니다.
 */
export const waterFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uSpeak;
  uniform float uAspect;
  uniform vec2 uCenter;
  uniform vec3 uRipples[${MAX_RIPPLES}];
  uniform vec3 uBase;
  uniform vec3 uDeep;
  uniform vec3 uLight;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
    return v;
  }

  float height(vec2 p) {
    float t = uTime;
    // 잔잔한 너울
    float h = 0.0035 * sin(p.x * 5.0 + t * 0.55) + 0.0025 * sin(p.y * 7.0 - t * 0.45 + p.x * 1.7);
    h += 0.006 * (fbm(p * 3.2 + vec2(t * 0.04, -t * 0.03)) - 0.5);

    // 누른 자리의 물결: 바깥으로 퍼지는 고리 다발
    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      vec3 r = uRipples[i];
      float age = t - r.z;
      if (r.z <= 0.0 || age < 0.0 || age > 7.0) continue;
      float d = length(p - r.xy);
      float x = d - age * 0.32;
      float packet = exp(-x * x * 90.0);
      h += sin(x * 70.0) * packet * 0.026 * exp(-age * 0.5) / (1.0 + d * 3.0);
    }

    // 말하는 동안 글 주변 잔물결
    float ds = length(p - uCenter);
    h += uSpeak * 0.0045 * sin(ds * 45.0 - t * 3.2) * exp(-ds * 2.2);
    return h;
  }

  void main() {
    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    float e = 0.0015;
    float h = height(p);
    float hx = height(p + vec2(e, 0.0)) - h;
    float hy = height(p + vec2(0.0, e)) - h;
    vec3 n = normalize(vec3(-hx / e * 0.9, -hy / e * 0.9, 1.0));

    vec3 l = normalize(vec3(-0.35, 0.55, 0.75));
    float diff = clamp(dot(n, l), 0.0, 1.0);
    // 평평한 수면(diff≈0.75)이 기본색이 되도록
    vec3 col = mix(uDeep, uBase, smoothstep(0.62, 0.76, diff));
    col = mix(col, uLight, smoothstep(0.78, 0.95, diff) * 0.5);

    // 물속 빛무늬: 법선만큼 굴절된 좌표로
    vec2 q = p + n.xy * 0.08;
    float c = fbm(q * 3.5 + vec2(uTime * 0.03, uTime * 0.02));
    float c2 = fbm(q * 3.5 - vec2(uTime * 0.025, -uTime * 0.02) + 4.3);
    float caustic = smoothstep(0.02, 0.0, abs(c - c2));
    col = mix(col, uLight, caustic * 0.18);

    // 물결 마루의 반짝임
    vec3 v = vec3(0.0, 0.0, 1.0);
    float spec = pow(max(dot(reflect(-l, n), v), 0.0), 80.0);
    col += vec3(1.0) * spec * 0.4;

    // 수면 위 별빛 반짝임
    vec2 sg = p * 14.0;
    vec2 cell = floor(sg);
    vec2 f = fract(sg) - 0.5;
    float hs = hash(cell);
    if (hs > 0.93) {
      vec2 o = (vec2(hash(cell + 3.1), hash(cell + 7.7)) - 0.5) * 0.5;
      vec2 d = abs(f - o);
      float tw = pow(0.5 + 0.5 * sin(uTime * (0.8 + hs * 1.5) + hs * 40.0), 8.0);
      float star = max(0.0, 1.0 - d.x * 30.0) * max(0.0, 1.0 - d.y * 5.0)
                 + max(0.0, 1.0 - d.y * 30.0) * max(0.0, 1.0 - d.x * 5.0);
      col += vec3(1.0) * star * tw * 0.7;
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;
