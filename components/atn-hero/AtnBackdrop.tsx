'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import type { Pose } from './choreography';

// Fond animé ATN — exactement celui de la maquette.
// Plein écran, un seul quad, shader GLSL : bruit simplex "domain-warped" très lent,
// noir #08090d → graphite bleuté #101c28, une pointe d'Ice Blue #38bdf8, lueur sous la voiture,
// vignette et léger grain. S'éclaire un peu pendant le balayage de polissage (pose.sweepBell).

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime; uniform float uBoost; uniform vec2 uRes;
uniform vec3 uBase; uniform vec3 uMid; uniform vec3 uIce;
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;} vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
 vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx); vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
 vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod289(i);
 vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
 vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0); m=m*m; m=m*m;
 vec3 x=2.0*fract(p*C.www)-1.0; vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
 m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
 vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw; return 130.0*dot(m,g);}
void main(){
  vec2 uv = vUv; vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float t = uTime * 0.035;
  vec2 q = vec2(snoise(p * 1.1 + vec2(t, -t)), snoise(p * 1.1 + vec2(-t * 0.7, t * 1.3) + 4.0));
  float n = snoise(p * 0.9 + q * 0.9 + vec2(t * 0.5, 0.0));
  float band = smoothstep(-0.2, 0.9, n);
  float floorGlow = exp(-pow((uv.y - 0.28) * 3.2, 2.0)) * exp(-pow((uv.x - 0.5) * 1.6, 2.0));
  float vig = smoothstep(1.15, 0.25, length((uv - vec2(0.5, 0.45)) * vec2(1.0, 1.25)));
  vec3 col = mix(uBase, uMid, band * 0.55 * vig);
  col += uIce * (0.018 + 0.03 * uBoost) * pow(band, 3.0) * vig;
  col += vec3(0.62, 0.74, 0.84) * floorGlow * (0.035 + 0.03 * uBoost);
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uTime) * 43758.5453);
  col += (grain - 0.5) * 0.012;
  gl_FragColor = vec4(col, 1.0);
}`;

// Les couleurs sont passées telles quelles (valeurs sRGB brutes) : le shader écrit directement la couleur finale.
const raw = (hex: string) => new THREE.Color().setStyle(hex, THREE.LinearSRGBColorSpace);

export default function AtnBackdrop({ poseRef, active = true }: { poseRef?: MutableRefObject<Pose>; active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(1); // un dégradé flou n'a pas besoin de plus : le GPU reste pour la voiture
    const uniforms = {
      uTime: { value: 8 },
      uBoost: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uBase: { value: raw('#08090d') },
      uMid: { value: raw('#101c28') },
      uIce: { value: raw('#38bdf8') },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      depthTest: false,
      depthWrite: false,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: FRAG,
    });
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    const resize = () => {
      const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w, h);
      renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      if (activeRef.current) {
        uniforms.uTime.value = (now - t0) / 1000 + 8;
        uniforms.uBoost.value = poseRef?.current.sweepBell ?? 0;
        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(loop);
    };
    if (!reduced) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [poseRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        // repli si WebGL indisponible : même ambiance en CSS
        background: 'radial-gradient(ellipse 46% 26% at 50% 70%, rgba(148,197,230,0.07), rgba(8,9,13,0) 70%), #08090d',
      }}
    />
  );
}
