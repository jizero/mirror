"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useSpeech } from "@/entities/mirror";
import { tokens } from "@/shared/ui";
import { MAX_RIPPLES, SPEECH_CENTER_Y } from "../config";
import { waterFragment, waterVertex } from "../lib/waterShader";

/**
 * 화면 전체를 채우는 Three.js 물.
 * 누르면 그 자리에서 물결이 퍼지고, 누른 채 끌면 물결이 따라옵니다.
 * 거울이 글자를 쓸 때와 방문자가 자판을 칠 때도 물방울이 떨어집니다.
 */
export default function WaterScene({ speaking }: { speaking: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const speakingRef = useRef(speaking);
  speakingRef.current = speaking;

  useEffect(() => {
    const mount = mountRef.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    mount.appendChild(renderer.domElement);
    const canvas = renderer.domElement;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const w = tokens.color.water;
    // 셰이더가 그대로 화면에 내보내므로, 토큰의 sRGB 값을 변환 없이 그대로 넘깁니다
    const srgb = (hex: string) => new THREE.Color(hex).convertLinearToSRGB();
    const uniforms = {
      uTime: { value: 0 },
      uSpeak: { value: 0 },
      uAspect: { value: 1 },
      uCenter: { value: new THREE.Vector2(0.5, 1 - SPEECH_CENTER_Y) },
      uRipples: { value: Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector3(0, 0, -1)) },
      uBase: { value: srgb(w.base) },
      uDeep: { value: srgb(w.deep) },
      uLight: { value: srgb(w.light) },
    };
    scene.add(
      new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({ vertexShader: waterVertex, fragmentShader: waterFragment, uniforms }),
      ),
    );

    // 글이 떠 있는 자리 (가로 모드에서는 거울 옆으로 옮겨가므로 실제 위치를 잽니다)
    const speechCenter = () => {
      const r = canvas.getBoundingClientRect();
      const e = document.querySelector("[data-speech]")?.getBoundingClientRect();
      return e
        ? { x: e.left + e.width / 2, y: e.top + e.height / 2, w: e.width, h: e.height }
        : { x: r.left + r.width / 2, y: r.top + r.height * SPEECH_CENTER_Y, w: Math.min(r.width, 620), h: r.height * 0.18 };
    };
    const syncCenter = () => {
      const r = canvas.getBoundingClientRect();
      const c = speechCenter();
      uniforms.uCenter.value.set(((c.x - r.left) / r.width) * uniforms.uAspect.value, 1 - (c.y - r.top) / r.height);
    };

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height);
      uniforms.uAspect.value = width / height;
      syncCenter();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // ── 물결 ─────────────────────────────────────────
    const clock = new THREE.Clock();
    let next = 0;
    let lastDrop = 0;
    let pressed = false;
    const dropAt = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect();
      const x = ((clientX - r.left) / r.width) * uniforms.uAspect.value;
      const y = 1 - (clientY - r.top) / r.height;
      uniforms.uRipples.value[next].set(x, y, clock.elapsedTime);
      next = (next + 1) % MAX_RIPPLES;
      lastDrop = clock.elapsedTime;
    };
    const drop = (e: PointerEvent) => dropAt(e.clientX, e.clientY);
    // 글자마다 떨어뜨리면 물결이 너무 빽빽해서 간격을 둡니다
    let lastType = 0;
    const typeDrop = (cx: number, cy: number, spreadX: number, spreadY: number) => {
      if (clock.elapsedTime - lastType < 0.11) return;
      lastType = clock.elapsedTime;
      dropAt(cx + (Math.random() - 0.5) * spreadX, cy + (Math.random() - 0.5) * spreadY);
    };
    // 거울이 글자를 쓸 때: 글 둘레에
    const unsubSpeech = useSpeech.subscribe((st, prev) => {
      if (st.shown.length <= prev.shown.length || !st.shown.trim()) return;
      syncCenter();
      const c = speechCenter();
      typeDrop(c.x, c.y, c.w * 0.8, Math.max(c.h, 40));
    });
    // 방문자가 입력창에 칠 때: 입력창 둘레에 (한글 조합 중에도 오도록 keydown 대신 input)
    const onKey = (e: Event) => {
      const el = e.target as HTMLElement;
      if (!el.matches?.("input, textarea")) return;
      const r = el.getBoundingClientRect();
      typeDrop(r.left + r.width / 2, r.top + r.height / 2, r.width, r.height * 2);
    };
    window.addEventListener("input", onKey);
    const onDown = (e: PointerEvent) => {
      pressed = true;
      drop(e);
    };
    const onMove = (e: PointerEvent) => {
      if (pressed && clock.elapsedTime - lastDrop > 0.12) drop(e);
    };
    const onUp = () => (pressed = false);
    canvas.style.touchAction = "none";
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    // ── 렌더 루프 ─────────────────────────────────────
    let raf = 0;
    let pixelRatio = renderer.getPixelRatio();
    let slowFrames = 0;
    const tick = () => {
      const rawDt = clock.getDelta();
      // 느린 기기에서는 해상도를 자동으로 낮춤
      slowFrames = rawDt > 0.045 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames > 10 && pixelRatio > 0.35) {
        pixelRatio = Math.max(0.35, pixelRatio * 0.7);
        renderer.setPixelRatio(pixelRatio);
        resize();
        slowFrames = 0;
      }
      const dt = Math.min(rawDt, 0.05);
      uniforms.uTime.value = clock.elapsedTime;
      const s = uniforms.uSpeak.value;
      uniforms.uSpeak.value = s + ((speakingRef.current ? 1 : 0) - s) * Math.min(dt * 2.5, 1);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      unsubSpeech();
      window.removeEventListener("input", onKey);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (o.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      mount.removeChild(canvas);
    };
  }, []);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0 }} aria-hidden />;
}
