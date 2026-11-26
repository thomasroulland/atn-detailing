'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { animate, createTimeline, stagger, utils, type Timeline } from 'animejs';
import { POSES, blendPose, easeInOutCubic, heroPose, type Pose } from './choreography';
import styles from './AtnHero.module.css';

// Tout ce qui est WebGL est chargé côté client uniquement
const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false, loading: () => null });
const ShaderBackdrop = dynamic(() => import('./ShaderBackdrop'), { ssr: false, loading: () => null });

type AtnHeroProps = {
  /** Les sections qui suivent le hero. Ajoute data-car-pose="right" | "left" | "bottom" sur une section
   *  pour que la voiture vienne s'y placer quand elle arrive à l'écran. */
  children?: ReactNode;
  /** Modèle .glb compressé Draco. null → voiture procédurale de secours. */
  modelUrl?: string | null;
  /** Version allégée pour mobile. */
  mobileModelUrl?: string | null;
  /** Image affichée si prefers-reduced-motion est activé. */
  staticImageUrl?: string;
  ctaHref?: string;
};

function useMediaQuery(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return match;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

const split = (word: string) =>
  word.split('').map((c, i) => (
    <span key={i} className={styles.char}>
      {c}
    </span>
  ));

export default function AtnHero({
  children,
  modelUrl = '/models/car.glb',
  mobileModelUrl = '/models/car-mobile.glb',
  staticImageUrl = '/images/atn-hero-static.webp',
  ctaHref = '#contact',
}: AtnHeroProps) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const mobile = useMediaQuery('(max-width: 768px)');

  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const poseRef = useRef<Pose>(heroPose(0, false));
  const pointerRef = useRef({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const onReady = useCallback(() => setReady(true), []);

  // Le rendu 3D s'arrête quand toute l'expérience est hors écran
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Scroll (lissé par Lenis) → pose de la voiture + timeline anime.js du hero
  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    const hero = heroRef.current;
    if (!root || !hero) return;
    const tl: Timeline = createTimeline({ autoplay: false })
      // 0 → 30 % : parallaxe du titre à 0.3x (45vh de scroll → 13.5vh)
      .add(titleRef.current!, { y: ['0vh', '-13.5vh'], duration: 300, ease: 'linear' }, 0)
      .add(hintRef.current!, { opacity: [1, 0], duration: 30, ease: 'linear' }, 0)
      // 80 → 92 % : l'accroche s'efface avant l'arrivée des sections
      .add(copyRef.current!, { opacity: [1, 0], duration: 120, ease: 'linear' }, 800);

    let raf = 0;
    const tick = () => {
      const vh = window.innerHeight;
      const r = hero.getBoundingClientRect();
      const p = clamp01(-r.top / (r.height - vh)); // 150vh de défilement épinglé
      let pose = heroPose(p, mobile);
      let first = -1;
      // chaque section marquée data-car-pose attire la voiture quand elle entre à l'écran
      root.querySelectorAll<HTMLElement>('[data-car-pose]').forEach((sec) => {
        const preset = POSES[sec.dataset.carPose ?? ''];
        if (!preset) return;
        const k = easeInOutCubic(clamp01(1 - sec.getBoundingClientRect().top / vh));
        if (first < 0) first = k;
        pose = blendPose(pose, mobile ? preset.mobile : preset.desktop, k);
      });
      poseRef.current = pose;
      tl.seek(p * 1000);
      if (titleRef.current) titleRef.current.style.opacity = String(1 - clamp01(Math.max(0, first) * 2.5));
      if (copyRef.current) copyRef.current.style.pointerEvents = p > 0.9 ? 'none' : 'auto';
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      tl.revert();
    };
  }, [reduced, mobile]);

  // Entrée : le titre arrive lettre par lettre, puis le texte (anime.js)
  useEffect(() => {
    if (reduced || !ready || !titleRef.current || !copyRef.current) return;
    const chars = titleRef.current.querySelectorAll(`.${styles.char}`);
    utils.set(chars, { y: '110%' });
    const a = animate(chars, { y: ['110%', '0%'], duration: 1200, delay: stagger(45), ease: 'outExpo' });
    const b = animate(copyRef.current.children, {
      y: [24, 0],
      opacity: [0, 1],
      duration: 900,
      delay: stagger(110, { start: 450 }),
      ease: 'outQuart',
    });
    return () => {
      a.revert();
      b.revert();
    };
  }, [ready, reduced]);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (mobile || e.pointerType !== 'mouse') return;
    pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointerRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const onPointerLeave = () => (pointerRef.current = { x: 0, y: 0 });

  // CTA magnétique (anime.js), desktop uniquement
  const onCtaMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduced || mobile || !ctaRef.current) return;
    const r = ctaRef.current.getBoundingClientRect();
    animate(ctaRef.current, {
      x: (e.clientX - r.left - r.width / 2) * 0.22,
      y: (e.clientY - r.top - r.height / 2) * 0.3,
      duration: 400,
      ease: 'outQuad',
    });
  };
  const onCtaLeave = () => {
    if (ctaRef.current) animate(ctaRef.current, { x: 0, y: 0, duration: 900, ease: 'outElastic(1, .5)' });
  };

  const title = (
    <div ref={titleRef} className={styles.title} aria-hidden>
      <span className={`${styles.line} ${styles.titleFill}`}>{split('ATN')}</span>
      <span className={`${styles.line} ${styles.titleOutline}`}>{split('Detailing')}</span>
    </div>
  );

  const copy = (
    <div ref={copyRef} className={styles.copy}>
      <p className={styles.eyebrow}>Polissage &amp; detailing automobile</p>
      <p className={styles.tagline}>Chaque surface reprise à la main, jusqu&apos;à ce que la peinture redevienne un miroir.</p>
      <a ref={ctaRef} className={styles.cta} href={ctaHref} onMouseMove={onCtaMove} onMouseLeave={onCtaLeave}>
        Demander un devis
        <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </a>
    </div>
  );

  // prefers-reduced-motion : image fixe, ni épinglage, ni 3D, ni dégradé animé
  if (reduced) {
    return (
      <div className={styles.experience}>
        <section className={styles.heroStatic} aria-label="ATN Detailing">
          <h1 className={styles.srOnly}>ATN Detailing</h1>
          <div className={styles.glow} aria-hidden />
          {title}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.staticCar} src={staticImageUrl} alt="Voiture de sport noire en studio" />
          {copy}
        </section>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={styles.experience}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {/* calque fixe derrière toute la page : fond, titre, voiture */}
      <div className={styles.layer} aria-hidden>
        {mobile ? <div className={styles.glow} /> : <ShaderBackdrop />}
        {title}
        <HeroScene
          poseRef={poseRef}
          pointerRef={pointerRef}
          sweepRef={sweepRef}
          mobile={mobile}
          active={active}
          modelUrl={mobile ? mobileModelUrl ?? modelUrl : modelUrl}
          onReady={onReady}
        />
        <div ref={sweepRef} className={styles.sweep} />
      </div>

      <section ref={heroRef} className={styles.hero} aria-label="ATN Detailing">
        <h1 className={styles.srOnly}>ATN Detailing</h1>
        <div className={styles.stage}>
          {copy}
          <div ref={hintRef} className={styles.hint} aria-hidden>
            <span className={styles.hintLine}>
              <span className={styles.hintDot} />
            </span>
            <span className={styles.hintLabel}>Scroll</span>
          </div>
        </div>
      </section>

      {children}

      <div className={`${styles.loader} ${ready ? styles.loaderDone : ''}`} aria-hidden>
        <span className={styles.loaderMark}>ATN</span>
        <span className={styles.loaderTrack}>
          <span className={styles.loaderBar} />
        </span>
      </div>
    </div>
  );
}
