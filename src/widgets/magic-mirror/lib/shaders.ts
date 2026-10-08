export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** 물결치는 은빛 수면 + 소용돌이 안개 + 마우스 물결 */
export const glassFragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uSpeak;
  uniform vec2 uMouse;
  uniform float uMouseAge;
  uniform vec2 uAspect;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uAspect;         // 타원 비율 보정된 좌표
    float r = length(p);
    float t = uTime;

    // 중심에서 퍼지는 동심원 물결 (말할 때 강해짐)
    float amp = mix(0.012, 0.035, uSpeak);
    float ripple = sin(r * 38.0 - t * mix(1.6, 4.0, uSpeak)) * amp / (1.0 + r * 6.0);

    // 마우스가 만든 물결
    vec2 m = (uMouse - 0.5) * uAspect;
    float md = length(p - m);
    float mr = sin(md * 60.0 - uMouseAge * 9.0) * 0.03
             * exp(-md * 7.0) * exp(-uMouseAge * 1.4);

    vec2 dir = r > 0.0001 ? p / r : vec2(0.0);
    vec2 md2 = md > 0.0001 ? (p - m) / md : vec2(0.0);
    vec2 q = p + dir * ripple + md2 * mr;

    // 흐르는 안개
    float swirl = t * 0.07;
    mat2 rot = mat2(cos(swirl), -sin(swirl), sin(swirl), cos(swirl));
    float mist = fbm(rot * q * 2.4 + vec2(t * 0.05, -t * 0.08));
    float mist2 = fbm(q * 4.0 - vec2(t * 0.11, t * 0.04) + mist);

    // 라일락빛 은거울, 말할 때는 장밋빛으로 물듦
    vec3 deep = mix(vec3(0.16, 0.12, 0.24), vec3(0.24, 0.10, 0.20), uSpeak);
    vec3 silver = vec3(0.78, 0.74, 0.86);
    vec3 glow = mix(vec3(0.90, 0.86, 1.0), vec3(1.0, 0.72, 0.86), uSpeak);
    vec3 col = mix(deep, silver * 0.45, smoothstep(0.25, 0.95, mist2));
    col += glow * pow(mist, 3.0) * mix(0.3, 0.6, uSpeak);

    // 물결 마루의 반사광
    float crest = (ripple + mr) * 30.0;
    col += vec3(0.85, 0.84, 0.78) * max(crest, 0.0) * 0.3;

    // 중앙의 은은한 빛 (말할 때 밝아짐)
    float core = exp(-r * mix(3.2, 2.2, uSpeak));
    col += mix(vec3(0.55, 0.5, 0.7), vec3(0.8, 0.45, 0.62), uSpeak) * core * mix(0.25, 0.55, uSpeak);

    // 가장자리 어둡게 + 테두리 반사
    float edge = smoothstep(0.32, 0.5, length((vUv - 0.5)));
    col *= 1.0 - edge * 0.65;
    col += vec3(0.9, 0.88, 0.8) * smoothstep(0.46, 0.5, length(vUv - 0.5)) * 0.18;

    // 사선 반사광 한 줄
    float streak = smoothstep(0.06, 0.0, abs(p.x + p.y * 0.55 + 0.18 - sin(t * 0.2) * 0.03));
    col += streak * 0.06;

    // 오래된 거울의 얼룩(은막이 벗겨진 자국)
    float spots = smoothstep(0.62, 0.78, fbm(vUv * 9.0 + 3.1)) * smoothstep(0.25, 0.5, length(vUv - 0.5));
    col = mix(col, vec3(0.30, 0.24, 0.32), spots * 0.4);

    // 거울 속에서 반짝이는 별빛 (십자 모양)
    vec2 sg = q * 9.0 + vec2(0.0, t * 0.05);
    vec2 cell = floor(sg);
    vec2 f = fract(sg) - 0.5;
    float h = hash(cell);
    if (h > 0.86) {
      vec2 o = (vec2(hash(cell + 3.1), hash(cell + 7.7)) - 0.5) * 0.5;
      vec2 d = abs(f - o);
      float tw = pow(0.5 + 0.5 * sin(t * (1.2 + h * 2.0) + h * 40.0), 6.0);
      float star = (max(0.0, 1.0 - d.x * 40.0) * max(0.0, 1.0 - d.y * 5.0)
                  + max(0.0, 1.0 - d.y * 40.0) * max(0.0, 1.0 - d.x * 5.0));
      star += max(0.0, 1.0 - length(f - o) * 14.0);
      col += vec3(1.0, 0.95, 0.88) * star * tw * mix(0.55, 1.0, uSpeak);
    }

    float alpha = 1.0 - smoothstep(0.495, 0.5, length(vUv - 0.5));
    gl_FragColor = vec4(col, alpha);
  }
`;

/** 거울 아래 드리운 그림자 */
export const shadowFragmentShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vec2 p = (vUv - 0.5) * vec2(1.0, 0.78);
    float d = length(p);
    gl_FragColor = vec4(0.2, 0.13, 0.06, smoothstep(0.38, 0.12, d) * 0.22);
  }
`;
