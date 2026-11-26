'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// Défilement lissé (Lenis) pour tout le site. À placer une seule fois dans app/layout.tsx.
// Désactivé si l'utilisateur a demandé moins d'animations.
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1.2, smoothWheel: true, autoRaf: true, anchors: true });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    return () => lenis.destroy();
  }, []);
  return null;
}
