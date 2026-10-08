"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useMirrorView } from "@/entities/mirror";
import { color } from "@/shared/ui/tokens";
import { GLASS_RX, GLASS_RY } from "../config";
import { buildBack, buildFrame } from "../lib/buildMirror";
import { glassFragmentShader, shadowFragmentShader, vertexShader } from "../lib/shaders";

/**
 * Three.js 마법 거울.
 * - 유리: 물결 셰이더 (말할 때 커짐, 마우스로 물결)
 * - 드래그로 360도 회전, 놓으면 관성 → 잠시 뒤 정면으로 복귀
 * - 화면 크기에 따라 배치하고 유리 위치를 store에 알려 HTML 글씨를 겹침
 */
export default function MirrorScene({ speaking }: { speaking: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const speakingRef = useRef(speaking);
  speakingRef.current = speaking;

  useEffect(() => {
    const mount = mountRef.current!;
    const { setGlass, setFacing } = useMirrorView.getState();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    scene.add(new THREE.AmbientLight(0xfff0f6, 0.5));
    const key = new THREE.PointLight(color.warmLight, 18, 20);
    key.position.set(2.5, 3, 3);
    scene.add(key);
    const rim = new THREE.PointLight(0xe8c8ff, 7, 20); // 라일락 역광
    rim.position.set(-3, -1, 2);
    scene.add(rim);
    const backLight = new THREE.PointLight(0xffe8c8, 8, 20);
    backLight.position.set(0, 1, -4);
    scene.add(backLight);
    // 금테 위를 천천히 지나가는 반짝임
    const gleam = new THREE.PointLight(0xfff6e8, 6, 4, 1.5);
    scene.add(gleam);

    // mirror: 화면 위치 / spinner: 드래그로 회전
    const mirror = new THREE.Group();
    const spinner = new THREE.Group();
    mirror.add(spinner);
    scene.add(mirror);

    const glassUniforms = {
      uTime: { value: 0 },
      uSpeak: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseAge: { value: 10 },
      uAspect: { value: new THREE.Vector2(1, GLASS_RY / GLASS_RX) },
    };
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(GLASS_RX * 2, GLASS_RY * 2, 1, 1),
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: glassFragmentShader,
        uniforms: glassUniforms,
        transparent: true,
      }),
    );
    spinner.add(glass);

    const { group: frame, gems } = buildFrame();
    spinner.add(frame);
    spinner.add(buildBack());
    // 위치를 살짝 내려 왕관까지 포함한 전체가 가운데 오도록
    spinner.position.y = -0.09;

    // 바닥(벽)에 드리운 그림자 — 회전하지 않음
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        vertexShader,
        fragmentShader: shadowFragmentShader,
      }),
    );
    shadow.position.set(0.12, -0.28, -0.8);
    mirror.add(shadow);

    // 화면 크기에 맞춰 배치. PC(가로 화면)는 거울을 왼쪽에 크게, 모바일은 위쪽에.
    const fov = THREE.MathUtils.degToRad(35);
    const tanHalf = Math.tan(fov / 2);
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      const wide = w >= 900 && camera.aspect > 1.15;
      const heightFrac = wide ? 0.86 : 0.74;
      const widthFrac = wide ? 0.6 : 0.9;
      const centerX = wide ? 0.36 : 0.5;
      const centerY = wide ? 0.5 : 0.41;

      const frameH = (GLASS_RY + 0.8) * 2; // 초승달·리본 포함
      const frameW = (GLASS_RX + 0.56) * 2; // 좌우 장식 포함
      const d = Math.max(
        frameH / (2 * tanHalf * heightFrac),
        frameW / (2 * tanHalf * camera.aspect * widthFrac),
      );
      camera.position.set(0, 0, d);
      camera.updateProjectionMatrix();
      const visibleH = 2 * d * tanHalf;
      const visibleW = visibleH * camera.aspect;
      mirror.position.x = (centerX - 0.5) * visibleW;
      mirror.position.y = (0.5 - centerY) * visibleH;

      const px = h / visibleH;
      setGlass(
        {
          width: GLASS_RX * 2 * px,
          height: GLASS_RY * 2 * px,
          centerX: w / 2 + mirror.position.x * px,
          centerY: h / 2 - (mirror.position.y + spinner.position.y) * px,
        },
        wide ? "wide" : "tall",
      );
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // ── 드래그로 360도 회전 ─────────────────────────────
    const canvas = renderer.domElement;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let velY = 0; // 좌우 회전 속도
    let rotY = 0;
    let rotX = 0;
    let idle = 0; // 손을 뗀 뒤 지난 시간
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velY = 0;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      idle = 0;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      canvas.style.cursor = "grab";
    };

    // 마우스 → 유리 위 물결 + 드래그 회전
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hover = new THREE.Vector2(0, 0);
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      hover.set(ndc.x, ndc.y);

      if (dragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        rotY += dx * 0.01;
        rotX = THREE.MathUtils.clamp(rotX + dy * 0.006, -0.6, 0.6);
        velY = dx * 0.01;
        return;
      }

      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObject(glass)[0];
      if (hit?.uv && glassUniforms.uMouseAge.value > 0.35) {
        glassUniforms.uMouse.value.copy(hit.uv);
        glassUniforms.uMouseAge.value = 0;
      }
    };
    canvas.style.cursor = "grab";
    canvas.style.touchAction = "none";
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("pointermove", onMove);

    const clock = new THREE.Clock();
    let raf = 0;
    // 느린 기기에서는 해상도를 자동으로 낮춰 UI가 버벅이지 않게 합니다
    let pixelRatio = renderer.getPixelRatio();
    let slowFrames = 0;
    const tick = () => {
      const rawDt = clock.getDelta();
      slowFrames = rawDt > 0.045 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames > 10 && pixelRatio > 0.35) {
        pixelRatio = Math.max(0.35, pixelRatio * 0.7);
        renderer.setPixelRatio(pixelRatio);
        resize();
        slowFrames = 0;
      }
      const dt = Math.min(rawDt, 0.05);
      const t = clock.elapsedTime;
      const s = glassUniforms.uSpeak.value;
      glassUniforms.uSpeak.value = s + ((speakingRef.current ? 1 : 0) - s) * Math.min(dt * 3, 1);
      glassUniforms.uTime.value = t;
      glassUniforms.uMouseAge.value += dt;

      for (const g of gems) {
        (g.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.15 + glassUniforms.uSpeak.value * 0.5;
      }

      if (!dragging) {
        // 관성으로 계속 돌다가
        rotY += velY;
        velY *= Math.pow(0.04, dt);
        idle += dt;
        // 잠시 뒤 가장 가까운 정면으로 천천히 돌아옴
        if (idle > 1.6 && Math.abs(velY) < 0.002) {
          const front = Math.round(rotY / (Math.PI * 2)) * Math.PI * 2;
          rotY += (front - rotY) * Math.min(dt * 2.2, 1);
          rotX += (0 - rotX) * Math.min(dt * 2.2, 1);
        }
      }
      // 마우스를 따라 살짝 기울고, 천천히 떠다님
      spinner.rotation.y = rotY + (dragging ? 0 : hover.x * 0.1);
      spinner.rotation.x = rotX - (dragging ? 0 : hover.y * 0.06);
      spinner.position.z = Math.sin(t * 0.6) * 0.04;
      const ga = t * 0.35;
      gleam.position.set(
        mirror.position.x + Math.cos(ga) * 1.9,
        mirror.position.y + Math.sin(ga) * 2.3,
        1.1,
      );
      setFacing(Math.max(0, Math.cos(spinner.rotation.y) * Math.cos(spinner.rotation.x)));

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("pointermove", onMove);
      pmrem.dispose();
      renderer.dispose();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
          o.geometry.dispose();
          const m = o.material;
          (Array.isArray(m) ? m : [m]).forEach((x) => x.dispose());
        }
      });
      mount.removeChild(canvas);
    };
  }, []);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0 }} aria-hidden />;
}
