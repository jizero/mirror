import * as THREE from "three";
import { color } from "@/shared/ui/tokens";
import { GLASS_RX, GLASS_RY } from "../config";

/**
 * 거울 지오메트리
 * - 테두리: 액자 몰딩 단면을 타원을 따라 스윕 (오목한 곳은 vertex color로 그늘)
 * - 장식: 가늘어지는 C자 소용돌이 + 조개 문양 + 깎인 석류석
 * - 유리 가장자리 진주 / 뒷면 벨벳 + 금 메달리온
 */

/** 몰딩 바깥 끝까지의 두께 (유리 가장자리 기준) */
export const FRAME_WIDTH = 0.38;

// ── 재질 ─────────────────────────────────────────────
function makeMaterials() {
  const gilt = new THREE.MeshPhysicalMaterial({
    color: color.gilt,
    metalness: 1,
    roughness: 0.32,
    clearcoat: 0.4,
    clearcoatRoughness: 0.25,
    vertexColors: true,
  });
  const giltPlain = new THREE.MeshPhysicalMaterial({
    color: color.gilt,
    metalness: 1,
    roughness: 0.38,
    clearcoat: 0.15,
    clearcoatRoughness: 0.4,
    envMapIntensity: 0.75,
  });
  const pearl = new THREE.MeshPhysicalMaterial({
    color: color.pearl,
    metalness: 0,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    sheen: 1,
    sheenColor: new THREE.Color("#e8d8ff"),
    sheenRoughness: 0.35,
    iridescence: 0.6,
    iridescenceIOR: 1.6,
  });
  const garnet = new THREE.MeshPhysicalMaterial({
    color: color.garnet,
    emissive: color.garnetGlow,
    emissiveIntensity: 0.15,
    metalness: 0,
    roughness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0,
    ior: 1.8,
    specularIntensity: 1,
    flatShading: true,
  });
  const velvet = new THREE.MeshPhysicalMaterial({
    color: color.velvet,
    roughness: 0.95,
    sheen: 1,
    sheenColor: new THREE.Color(color.velvetSheen),
    sheenRoughness: 0.45,
    side: THREE.DoubleSide,
  });
  const satin = new THREE.MeshPhysicalMaterial({
    color: color.ribbon,
    roughness: 0.45,
    sheen: 1,
    sheenColor: new THREE.Color("#fff0f6"),
    sheenRoughness: 0.3,
    clearcoat: 0.25,
    side: THREE.DoubleSide,
  });
  return { gilt, giltPlain, pearl, garnet, velvet, satin };
}

// ── 몰딩 ─────────────────────────────────────────────
/** 단면 (r: 유리 가장자리에서 바깥쪽 거리, z: 앞쪽 높이). 안쪽 → 바깥쪽 → 뒷면 순 */
const PROFILE: [number, number][] = [
  [0.0, -0.02],
  [0.0, 0.035], // 유리를 물고 있는 안쪽 턱
  [0.012, 0.055],
  [0.03, 0.06],
  [0.045, 0.05], // 작은 홈
  [0.06, 0.06],
  [0.075, 0.085], // 진주 받침
  [0.095, 0.09],
  [0.115, 0.075],
  [0.13, 0.07], // 홈
  [0.15, 0.09],
  [0.18, 0.135], // 큰 볼록 띠
  [0.215, 0.15],
  [0.25, 0.135],
  [0.275, 0.105],
  [0.29, 0.1], // 홈
  [0.31, 0.115], // 바깥 비드
  [0.335, 0.11],
  [0.355, 0.085],
  [FRAME_WIDTH, 0.04],
  [FRAME_WIDTH, -0.04],
  [FRAME_WIDTH - 0.02, -0.06],
  [0.02, -0.06],
];

function moldingGeometry(rx: number, ry: number, steps = 1440) {
  // 단면을 부드럽게
  const spline = new THREE.SplineCurve(PROFILE.map(([r, z]) => new THREE.Vector2(r, z)));
  const prof = spline.getSpacedPoints(110);
  const P = prof.length;

  // 오목한 곳(이웃보다 낮은 곳)은 어둡게 → 금박 몰딩 특유의 깊이감
  const shade = prof.map((p, i) => {
    const a = prof[Math.max(0, i - 3)];
    const b = prof[Math.min(P - 1, i + 3)];
    const concave = (a.y + b.y) / 2 - p.y; // > 0 이면 오목
    const back = p.y < 0 ? 0.55 : 1;
    return THREE.MathUtils.clamp(1 - concave * 34, 0.3, 1.1) * back;
  });

  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const ex = Math.cos(t) * rx;
    const ey = Math.sin(t) * ry;
    // 타원의 바깥 방향 법선
    const n = new THREE.Vector2(Math.cos(t) * ry, Math.sin(t) * rx).normalize();
    for (let j = 0; j < P; j++) {
      const { x: r, y: z0 } = prof[j];
      // 높낮이를 키워 입체감을 살리고, 큰 볼록 띠에는 세로 홈(가드룬) 무늬
      let z = z0 > 0 ? z0 * 1.7 : z0;
      let s = shade[j];
      const band = THREE.MathUtils.smoothstep(r, 0.16, 0.19) * (1 - THREE.MathUtils.smoothstep(r, 0.24, 0.27));
      if (band > 0) {
        const flute = Math.pow(0.5 + 0.5 * Math.cos(t * 150), 0.6);
        z += band * flute * 0.018;
        s *= 1 - band * (1 - flute) * 0.45;
      }
      pos.push(ex + n.x * r, ey + n.y * r, z);
      col.push(s, s, s);
    }
  }
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < P - 1; j++) {
      const a = i * P + j;
      const b = (i + 1) * P + j;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ── 소용돌이 장식 ─────────────────────────────────────
/** 굵기가 r0 → r1 로 가늘어지는 튜브 */
function taperedTube(curve: THREE.Curve<THREE.Vector3>, r0: number, r1: number, segs = 64, radial = 12) {
  const frames = curve.computeFrenetFrames(segs, false);
  const pos: number[] = [];
  const idx: number[] = [];
  const v = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    const p = curve.getPointAt(u);
    // 뿌리는 통통하게, 끝은 가늘게
    const r = THREE.MathUtils.lerp(r0, r1, Math.pow(u, 0.8)) * (0.85 + 0.15 * Math.sin(Math.PI * Math.min(u * 1.6, 1)));
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      v.copy(frames.normals[i]).multiplyScalar(Math.cos(a) * r).addScaledVector(frames.binormals[i], Math.sin(a) * r);
      pos.push(p.x + v.x, p.y + v.y, p.z + v.z);
    }
  }
  for (let i = 0; i < segs; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/**
 * C자 소용돌이 (로그 나선). 원점에서 시작해 바깥으로 뻗었다가 안으로 말려듭니다.
 * dir = 1 이면 시계 반대, -1 이면 시계 방향(좌우 대칭용)
 */
function scrollCurve(size: number, dir: 1 | -1, turns = 1.15) {
  const pts: THREE.Vector3[] = [];
  const N = 60;
  const total = turns * Math.PI * 2;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const th = u * total;
    const R = size * Math.exp(-1.15 * th / Math.PI) ;
    // 시작점이 원점이 되도록 이동
    const cx = size * (1 - 0.0);
    const x = (Math.cos(th) * R - cx) * -1;
    const y = Math.sin(th) * R * dir;
    const z = 0.035 * Math.sin(Math.PI * u) + 0.01;
    pts.push(new THREE.Vector3(x * dir, y, z));
  }
  return new THREE.CatmullRomCurve3(pts);
}

function addScroll(
  parent: THREE.Object3D,
  mat: THREE.Material,
  opts: { x: number; y: number; rot: number; size: number; dir: 1 | -1; thick: number },
) {
  const g = new THREE.Group();
  const curve = scrollCurve(opts.size, opts.dir);
  g.add(new THREE.Mesh(taperedTube(curve, opts.thick, opts.thick * 0.3), mat));
  // 말린 끝의 작은 구슬
  const tip = new THREE.Mesh(new THREE.SphereGeometry(opts.thick * 0.75, 16, 12), mat);
  tip.position.copy(curve.getPointAt(1));
  g.add(tip);
  g.position.set(opts.x, opts.y, 0.06);
  g.rotation.z = opts.rot;
  parent.add(g);
}

/** 대칭 소용돌이 한 쌍 */
function scrollPair(parent: THREE.Object3D, mat: THREE.Material, size: number, thick: number, spread: number, lift = 0) {
  addScroll(parent, mat, { x: spread, y: lift, rot: 0.35, size, dir: 1, thick });
  addScroll(parent, mat, { x: -spread, y: lift, rot: -0.35, size, dir: -1, thick });
}

/** 금 받침에 박힌 깎인 석류석 */
function jewel(mats: ReturnType<typeof makeMaterials>, size: number) {
  const g = new THREE.Group();
  const stone = new THREE.Mesh(new THREE.OctahedronGeometry(size, 1), mats.garnet);
  stone.scale.set(1, 1.25, 0.55);
  stone.position.z = size * 0.45;
  g.add(stone);
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(size * 1.02, size * 0.2, 12, 40), mats.giltPlain);
  bezel.scale.set(1, 1.25, 1);
  bezel.position.z = size * 0.3;
  g.add(bezel);
  // 받침 발톱
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const prong = new THREE.Mesh(new THREE.SphereGeometry(size * 0.16, 10, 8), mats.giltPlain);
    prong.position.set(Math.cos(a) * size * 1.02, Math.sin(a) * size * 1.27, size * 0.55);
    g.add(prong);
  }
  return { group: g, stone };
}

function pearlString(mat: THREE.Material, rx: number, ry: number, z: number, radius: number) {
  const curve = new THREE.EllipseCurve(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
  const circumference = curve.getLength();
  const count = Math.floor(circumference / (radius * 2.15));
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(radius, 16, 12), mat, count);
  const m = new THREE.Matrix4();
  for (let i = 0; i < count; i++) {
    const p = curve.getPointAt(i / count);
    m.makeTranslation(p.x, p.y, z);
    mesh.setMatrixAt(i, m);
  }
  return mesh;
}

/** 두께 있는 금 장식 (Shape → 둥근 모서리 Extrude) */
function goldShape(shape: THREE.Shape, mat: THREE.Material, depth = 0.025, bevel = 0.012) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 48,
  });
  g.center();
  return new THREE.Mesh(g, mat);
}

/** 뿔이 위를 향한 초승달 (보석을 받치는 요람) */
function crescent(mat: THREE.Material, r: number) {
  const d = 0.45 * r; // 안쪽 원의 중심 높이
  const R = 0.8 * r; // 안쪽 원의 반지름
  const y = (r * r - R * R + d * d) / (2 * d); // 두 원이 만나는 높이
  const x = Math.sqrt(r * r - y * y);
  const s = new THREE.Shape();
  // 바깥 호: 오른쪽 뿔 → 아래 → 왼쪽 뿔
  s.absarc(0, 0, r, Math.atan2(y, x), Math.atan2(y, -x) - Math.PI * 2, true);
  // 안쪽 호: 왼쪽 뿔 → 아래 → 오른쪽 뿔
  s.absarc(0, d, R, Math.atan2(y - d, -x), Math.atan2(y - d, x) + Math.PI * 2, false);
  return goldShape(s, mat, 0.03, 0.014);
}

/** 다섯 꼭지 별 */
function star(mat: THREE.Material, r: number) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return goldShape(s, mat, 0.012, 0.008);
}

/** 새틴 리본 매듭 */
function ribbonBow(mat: THREE.Material, size: number) {
  const g = new THREE.Group();
  // 고리 두 개
  for (const side of [1, -1]) {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(size * 0.55, size * 0.16, 16, 48), mat);
    loop.scale.set(1, 0.62, 0.45);
    loop.position.set(side * size * 0.55, 0, 0);
    loop.rotation.z = side * 0.22;
    g.add(loop);
  }
  // 늘어진 꼬리 두 개
  for (const side of [1, -1]) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0.02),
      new THREE.Vector3(side * size * 0.3, -size * 0.6, 0.05),
      new THREE.Vector3(side * size * 0.2, -size * 1.2, 0.02),
      new THREE.Vector3(side * size * 0.45, -size * 1.7, 0.04),
    ]);
    const tail = new THREE.Mesh(taperedTube(curve, size * 0.13, size * 0.18, 40, 10), mat);
    tail.scale.z = 0.4;
    g.add(tail);
  }
  const knot = new THREE.Mesh(new THREE.SphereGeometry(size * 0.2, 20, 14), mat);
  knot.scale.set(1, 1.1, 0.7);
  g.add(knot);
  return g;
}

// ── 앞면 ─────────────────────────────────────────────
export function buildFrame() {
  const mats = makeMaterials();
  const group = new THREE.Group();

  group.add(new THREE.Mesh(moldingGeometry(GLASS_RX, GLASS_RY), mats.gilt));
  // 진주 받침 위치(단면 r≈0.085)에 진주
  group.add(pearlString(mats.pearl, GLASS_RX + 0.085, GLASS_RY + 0.085, 0.16, 0.018));
  // 바깥 비드 줄의 금구슬
  group.add(pearlString(mats.giltPlain, GLASS_RX + 0.322, GLASS_RY + 0.322, 0.2, 0.012));

  const outerY = GLASS_RY + FRAME_WIDTH;
  const outerX = GLASS_RX + FRAME_WIDTH;
  const gems: THREE.Mesh[] = [];

  // 꼭대기 장식: 조개 + 소용돌이 + 큰 보석
  const crest = new THREE.Group();
  // 위로 열린 초승달이 보석을 받치고, 위에 별 셋
  const moon = crescent(mats.giltPlain, 0.2);
  moon.position.set(0, 0.17, 0.05);
  crest.add(moon);
  for (const [x, y, r] of [
    [0, 0.47, 0.065],
    [-0.15, 0.4, 0.04],
    [0.15, 0.4, 0.04],
  ]) {
    const st = star(mats.giltPlain, r);
    st.position.set(x, y, 0.06);
    crest.add(st);
  }
  scrollPair(crest, mats.giltPlain, 0.2, 0.034, 0.1, 0.02);
  const crestJewel = jewel(mats, 0.07);
  crestJewel.group.position.set(0, 0.2, 0.06);
  crest.add(crestJewel.group);
  gems.push(crestJewel.stone);
  crest.scale.setScalar(1.3);
  crest.position.set(0, outerY - 0.1, 0.08);
  group.add(crest);

  // 아래 장식: 작은 소용돌이 + 늘어진 진주
  const foot = new THREE.Group();
  const bow = ribbonBow(mats.satin, 0.2);
  bow.position.z = 0.1;
  foot.add(bow);
  const footJewel = jewel(mats, 0.045);
  footJewel.group.position.z = 0.15;
  foot.add(footJewel.group);
  gems.push(footJewel.stone);
  foot.scale.setScalar(1.15);
  foot.position.set(0, -outerY + 0.06, 0.08);
  group.add(foot);

  // 좌우 장식
  for (const side of [1, -1] as const) {
    const g = new THREE.Group();
    scrollPair(g, mats.giltPlain, 0.16, 0.03, 0.06);
    const j = jewel(mats, 0.05);
    j.group.position.z = 0.07;
    g.add(j.group);
    gems.push(j.stone);
    g.rotation.z = (-side * Math.PI) / 2;
    g.position.set(side * (outerX - 0.05), 0, 0.1);
    group.add(g);
  }

  // 대각선 네 곳의 작은 진주 장식
  for (const [sx, sy] of [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ]) {
    const t = Math.atan2(sy * GLASS_RX, sx * GLASS_RY);
    const n = new THREE.Vector2(Math.cos(t) * GLASS_RY, Math.sin(t) * GLASS_RX).normalize();
    const p = new THREE.Vector2(Math.cos(t) * GLASS_RX, Math.sin(t) * GLASS_RY).addScaledVector(n, 0.215);
    const pe = new THREE.Mesh(new THREE.SphereGeometry(0.03, 20, 14), mats.pearl);
    pe.position.set(p.x, p.y, 0.29);
    group.add(pe);
  }

  return { group, gems: gems as unknown as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[] };
}

// ── 뒷면 ─────────────────────────────────────────────
export function buildBack() {
  const mats = makeMaterials();
  const group = new THREE.Group();

  const shape = new THREE.Shape();
  shape.absellipse(0, 0, GLASS_RX + 0.02, GLASS_RY + 0.02, 0, Math.PI * 2, false, 0);
  const velvet = new THREE.Mesh(new THREE.ShapeGeometry(shape, 128), mats.velvet);
  velvet.position.z = -0.05;
  group.add(velvet);

  // 금 메달리온 (단면을 돌려 만든 원반)
  const medalProfile = [
    [0, 0],
    [0.16, 0],
    [0.2, 0.02],
    [0.21, 0.045],
    [0.19, 0.06],
    [0.15, 0.05],
    [0.1, 0.06],
    [0.05, 0.075],
    [0, 0.08],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const medal = new THREE.Mesh(new THREE.LatheGeometry(medalProfile, 64), mats.giltPlain);
  medal.rotation.x = -Math.PI / 2;
  medal.position.z = -0.05;
  group.add(medal);

  // 메달리온을 두른 진주 고리
  const ring = pearlString(mats.pearl, 0.27, 0.27, -0.06, 0.016);
  group.add(ring);

  // 가는 금줄 타원
  const line = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(
        new THREE.EllipseCurve(0, 0, GLASS_RX * 0.78, GLASS_RY * 0.78, 0, Math.PI * 2, false, 0)
          .getPoints(160)
          .map((p) => new THREE.Vector3(p.x, p.y, -0.055)),
        true,
      ),
      200,
      0.008,
      8,
      true,
    ),
    mats.giltPlain,
  );
  group.add(line);
  return group;
}
