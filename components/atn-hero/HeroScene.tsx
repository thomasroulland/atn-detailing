'use client';

import { Suspense, useEffect, useMemo, useRef, type MutableRefObject, type RefObject } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF } from '@react-three/drei';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import type { Pose } from './choreography';
import { createPolishPaint } from './paint';
import { buildProceduralCar } from './proceduralCar';

RectAreaLightUniformsLib.init();

/* ------------------------------------------------------------------ */
/*  RÉGLAGES DU MODÈLE — à adapter quand tu poses ton propre .glb     */
/* ------------------------------------------------------------------ */
// Décodeur Draco servi en local (copie node_modules/three/examples/jsm/libs/draco/gltf/ → public/draco/)
const DRACO_PATH = '/draco/';
// Rotation à appliquer pour que l'AVANT du modèle pointe vers +X
// (0 pour car.glb fourni : il est déjà normalisé — avant en +X, 4,5 m, posé au sol)
const MODEL_ROTATION_Y = 0;
// Les meshes dont le nom de matériau correspond reçoivent la peinture animée (car.glb : "paint")
const PAINT_MATCH = /paint/i;
// HDRI de studio optionnel (ex. un studio CC0 de Poly Haven en 1k) — laisse null pour les softbox seules
const HDRI_URL: string | null = null; // '/hdri/studio_1k.hdr'
// Intensité du reflet au sol (0 = aucun, 1 = miroir parfait)
const REFLECTION = 0.07;

export type HeroSceneProps = {
  poseRef: MutableRefObject<Pose>; // pose cible, calculée depuis le scroll par AtnHero
  pointerRef: MutableRefObject<{ x: number; y: number }>;
  sweepRef: RefObject<HTMLDivElement | null>;
  mobile: boolean;
  active: boolean;
  modelUrl: string | null; // null → voiture procédurale provisoire
  onReady: () => void;
};

type CarApi = { root: THREE.Object3D; setSweep: (v: number) => void; sync: () => void };

export default function HeroScene(props: HeroSceneProps) {
  const { mobile, active } = props;
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, mobile ? 1.5 : 2]}
      gl={{
        antialias: !mobile,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.3,
      }}
      camera={{ fov: mobile ? 34 : 24, position: [0, 0.5, 9.2], near: 0.1, far: 100 }}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <StudioEnvironment />
        <Rig {...props} />
        <ReadySignal onReady={props.onReady} />
      </Suspense>
    </Canvas>
  );
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => onReady(), [onReady]);
  return null;
}

/* ---------------------------- Éclairage ---------------------------- */
function StudioEnvironment() {
  return (
    <>
      <Environment resolution={256} {...(HDRI_URL ? { files: HDRI_URL } : {})}>
        <color attach="background" args={['#040507']} />
        <Lightformer form="rect" intensity={6} scale={[18, 5, 1]} position={[0, 12.5, 0]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer form="rect" intensity={4.5} scale={[2, 10, 1]} position={[-12, 5, 2]} rotation={[0, Math.PI / 2, 0]} />
        <Lightformer form="rect" intensity={4.5} scale={[2, 10, 1]} position={[12, 5, -2]} rotation={[0, -Math.PI / 2, 0]} />
        <Lightformer form="rect" intensity={2.2} scale={[18, 2.2, 1]} position={[0, 6, 14]} rotation={[0, Math.PI, 0]} />
        <Lightformer form="rect" intensity={1.6} scale={[14, 1.2, 1]} position={[0, 3.5, -14]} />
        {/* filet Ice Blue, seulement dans les reflets */}
        <Lightformer form="rect" color="#38bdf8" intensity={2.2} scale={[0.5, 7, 1]} position={[-10, 4, 9]} rotation={[0, Math.PI * 0.75, 0]} />
      </Environment>
      {/* deux lumières rectangulaires pour les reflets carrosserie */}
      <rectAreaLight position={[0, 4.2, 3.2]} width={7} height={0.9} intensity={8} onUpdate={(l) => l.lookAt(0, 0.6, 0)} />
      <rectAreaLight position={[-5.5, 2.2, 2]} width={0.6} height={4} intensity={5} color="#e6f4ff" onUpdate={(l) => l.lookAt(0, 0.6, 0)} />
    </>
  );
}

/* ------------------------- Rig + animation ------------------------- */
function Rig({ poseRef, pointerRef, sweepRef, mobile, modelUrl }: HeroSceneProps) {
  const slide = useRef<THREE.Group>(null!);
  const tilt = useRef<THREE.Group>(null!);
  const yaw = useRef<THREE.Group>(null!);
  const sweep = useRef<THREE.RectAreaLight>(null!);
  const car = useRef<CarApi | null>(null);
  const smooth = useRef({ tx: 0, ty: 0 });
  const f = useRef<Pose | null>(null);
  const { camera, size } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const s = smooth.current;
    const a = 1 - Math.exp(-dt * 10); // interpolation : pas d'à-coups même avec un scroll saccadé
    const target = poseRef.current;
    if (!f.current) f.current = { ...target };
    const cur = f.current;
    (Object.keys(target) as (keyof Pose)[]).forEach((k) => (cur[k] += (target[k] - cur[k]) * a));
    if (!mobile) {
      const b = 1 - Math.exp(-dt * 4);
      s.tx += (pointerRef.current.x - s.tx) * b;
      s.ty += (pointerRef.current.y - s.ty) * b;
    }
    const D2R = Math.PI / 180;
    yaw.current.rotation.y = cur.yaw * D2R;
    slide.current.position.x = cur.slideX;
    tilt.current.rotation.set(s.ty * 3 * D2R, s.tx * 3 * D2R, -s.tx * 1.5 * D2R);
    camera.position.set(0, cur.camY, cur.camDist);
    camera.lookAt(0, cur.targetY, 0);

    const c = car.current;
    if (!c) return;
    c.root.updateWorldMatrix(true, false);
    c.sync();
    c.setSweep(cur.sweepLocal);

    // la bande lumineuse suit la position du balayage sur la carrosserie
    v.set(cur.sweepLocal, 0.6, 0);
    c.root.localToWorld(v);
    sweep.current.position.set(v.x, 2.6, 2.6);
    sweep.current.lookAt(v.x, 0.7, 0);
    sweep.current.intensity = 26 * cur.sweepBell;

    const el = sweepRef.current;
    if (el) {
      v.project(camera);
      el.style.transform = `translate3d(${((v.x + 1) / 2) * size.width - el.offsetWidth / 2}px,0,0)`;
      el.style.opacity = String(cur.sweepBell);
    }
  });

  return (
    <>
      <rectAreaLight ref={sweep} width={0.45} height={5} intensity={0} />
      <group ref={slide}>
        <Floor />
        <group ref={tilt}>
          <group ref={yaw}>
            {modelUrl ? <GltfCar url={modelUrl} apiRef={car} /> : <ProceduralCar lite={mobile} apiRef={car} />}
            <ContactShadow />
          </group>
        </group>
      </group>
    </>
  );
}

/* ------------------------------ Voitures ---------------------------- */
function GltfCar({ url, apiRef }: { url: string; apiRef: MutableRefObject<CarApi | null> }) {
  const { scene } = useGLTF(url, DRACO_PATH);
  const { root, mirror, api } = useMemo(() => {
    const model = scene.clone(true);
    const { material, uniforms } = createPolishPaint();
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      if (Array.isArray(m.material)) return;
      const mat = m.material as THREE.MeshPhysicalMaterial;
      if (PAINT_MATCH.test(mat.name)) {
        m.material = material;
        return;
      }
      // vitres : la transmission coûte une passe de rendu en plus → simple transparence
      if (mat.transmission) {
        mat.transmission = 0;
        mat.transparent = true;
        mat.opacity = Math.max(0.35, mat.opacity);
      }
      if ('envMapIntensity' in mat) mat.envMapIntensity = 1.3;
    });
    // normalisation : 4,5 m de long, centré, posé au sol, avant vers +X
    model.rotation.y = MODEL_ROTATION_Y;
    const box = new THREE.Box3().setFromObject(model, true); // précis : sommets réels, pas les boîtes approximatives
    const dims = box.getSize(new THREE.Vector3());
    model.scale.setScalar(4.5 / Math.max(dims.x, dims.z));
    box.setFromObject(model, true);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -box.min.y, -center.z);
    const root = new THREE.Group();
    root.add(model);
    const mirror = root.clone(true);
    mirror.scale.y = -1;
    dimMirror(mirror, REFLECTION);
    const api: CarApi = {
      root,
      setSweep: (x) => (uniforms.uSweep.value = x),
      sync: () => uniforms.uCarInv.value.copy(root.matrixWorld).invert(),
    };
    return { root, mirror, api };
  }, [scene]);
  useEffect(() => {
    apiRef.current = api;
    return () => void (apiRef.current = null);
  }, [api, apiRef]);
  return (
    <>
      <primitive object={root} />
      <primitive object={mirror} />
    </>
  );
}

function ProceduralCar({ lite, apiRef }: { lite: boolean; apiRef: MutableRefObject<CarApi | null> }) {
  const { root, mirror, api } = useMemo(() => {
    const built = buildProceduralCar(THREE, { lite });
    const root = built.group as THREE.Group;
    const mirror = root.clone(true);
    mirror.scale.y = -1;
    dimMirror(mirror, REFLECTION);
    const api: CarApi = { root, setSweep: (x) => (built.uSweep.value = x), sync: () => {} };
    return { root, mirror, api };
  }, [lite]);
  useEffect(() => {
    apiRef.current = api;
    return () => void (apiRef.current = null);
  }, [api, apiRef]);
  return (
    <>
      <primitive object={root} />
      <primitive object={mirror} />
    </>
  );
}

/* --------------------------- Sol + ombre ---------------------------- */
// Le reflet = la voiture retournée, avec des copies transparentes de ses matériaux
function dimMirror(obj: THREE.Object3D, k: number) {
  const cache = new Map<THREE.Material, THREE.Material>();
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || Array.isArray(m.material)) return;
    const src = m.material;
    if (!cache.has(src)) {
      const c = src.clone();
      c.onBeforeCompile = src.onBeforeCompile;
      c.customProgramCacheKey = src.customProgramCacheKey;
      c.transparent = true;
      c.opacity = src.opacity * k;
      c.depthWrite = true;
      cache.set(src, c);
    }
    m.material = cache.get(src)!;
  });
}

function radialTexture(inner: number) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(128, 128, inner * 128, 128, 128, 128);
  gr.addColorStop(0, '#fff');
  gr.addColorStop(1, '#000');
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

// Sol compact au bord très doux : aucune ligne d'horizon visible quand la caméra descend
function Floor() {
  const alpha = useMemo(() => radialTexture(0.3), []);
  return (
    <mesh rotation-x={-Math.PI / 2} renderOrder={1}>
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial color="#08090d" transparent opacity={0.5} alphaMap={alpha} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

function ContactShadow() {
  const alpha = useMemo(() => radialTexture(0.05), []);
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.003} renderOrder={2}>
      <planeGeometry args={[6.2, 3]} />
      <meshBasicMaterial color="#000" transparent opacity={0.85} alphaMap={alpha} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}
