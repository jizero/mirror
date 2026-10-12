"use client";

import { useEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { tokens } from "@/shared/ui";
import { MASK_CENTER_Y } from "../config";
import s from "./MirrorMask.module.css";

/** Meshy로 만든 가면 모델 (CC BY 4.0). 법선이 없어서 불러온 뒤 매끈하게 계산합니다 */
const MASK_URL = "/mesh_mask.glb";
/** 모델을 이 높이로 맞춥니다 */
const MASK_HEIGHT = 2.6;

/** 금테 타원 거울 속, 보랏빛 연기 사이에 떠 있는 흰 가면. 말할 때는 천천히 숨 쉽니다 */
type Props = {
  speaking: boolean;
  /** true 면 가면이 스러지고 거울에는 글만 남습니다 */
  faceHidden?: boolean;
  children?: ReactNode;
};

export default function MirrorMask({ speaking, faceHidden = false, children }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const speakingRef = useRef(speaking);
  speakingRef.current = speaking;

  useEffect(() => {
    const mount = mountRef.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    camera.position.z = MASK_HEIGHT / 2 / Math.tan(THREE.MathUtils.degToRad(14)) + 2.8;

    const w = tokens.color.water;
    // 위에서 떨어지는 빛으로 눈두덩과 볼에 그늘을 깊게 드리웁니다
    scene.add(new THREE.HemisphereLight(w.light, w.deep, 1.2));
    const key = new THREE.DirectionalLight("#ffffff", 2.8);
    key.position.set(-0.8, 4, 2.5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(w.light, 1.2);
    rim.position.set(3, 0.5, -2);
    scene.add(rim);

    const mask = new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.42, metalness: 0, side: THREE.DoubleSide }),
    );
    scene.add(mask);
    let disposed = false;
    new GLTFLoader().load(MASK_URL, (gltf) => {
      if (disposed) return;
      const src = (gltf.scene.getObjectByProperty("isMesh", true) as THREE.Mesh).geometry;
      const geo = mergeVertices(src.deleteAttribute("normal") ?? src);
      geo.computeVertexNormals();
      geo.center();
      geo.computeBoundingBox();
      const h = geo.boundingBox!.max.y - geo.boundingBox!.min.y;
      geo.scale(MASK_HEIGHT / h, MASK_HEIGHT / h, MASK_HEIGHT / h);
      mask.geometry.dispose();
      mask.geometry = geo;
      src.dispose();
    });

    const resize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // 포인터 쪽으로 살짝 고개를 돌립니다
    const look = new THREE.Vector2();
    const onMove = (e: PointerEvent) => look.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5);
    window.addEventListener("pointermove", onMove);

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();
    let speak = 0;
    let raf = 0;
    const tick = () => {
      const t = still ? 0 : clock.getElapsedTime();
      speak += ((speakingRef.current ? 1 : 0) - speak) * 0.06;
      mask.position.y = Math.sin(t * 0.6) * 0.04;
      mask.rotation.y += (look.x * 0.3 + Math.sin(t * 0.25) * 0.05 - mask.rotation.y) * 0.03;
      mask.rotation.x += (look.y * 0.2 - 0.06 - mask.rotation.x) * 0.03; // 살짝 내려다봄
      mask.scale.setScalar(1 + speak * 0.02 * (1 + Math.sin(t * 2.2)));
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      mask.geometry.dispose();
      mask.material.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className={s.mirror} style={{ top: `${MASK_CENTER_Y * 100}%` }}>
      <div className={s.smoke} aria-hidden />
      <div ref={mountRef} className={`${s.mask} ${faceHidden ? s.faded : ""}`} aria-hidden />
      <div className={s.mist} aria-hidden />
      {children}
    </div>
  );
}
