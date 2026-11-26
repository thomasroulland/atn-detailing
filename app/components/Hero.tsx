'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'
import { fadeInUp, stagger } from '@/lib/motion'

function ScrollIndicator() {
  const [visible, setVisible] = useState(true)
  const shouldReduce = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < window.innerHeight * 0.2)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <motion.div
      aria-hidden
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      animate={shouldReduce ? {} : { y: [0, 8, 0] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span
        className="text-xs tracking-widest uppercase"
        style={{ color: 'var(--muted)', fontFamily: 'var(--font-barlow, sans-serif)', fontSize: '0.6rem' }}
      >
        Défiler
      </span>
      <svg width="16" height="24" viewBox="0 0 16 24" fill="none" aria-hidden>
        <rect x="1" y="1" width="14" height="22" rx="7" stroke="rgba(248,250,252,0.3)" strokeWidth="1.5" />
        <motion.rect
          x="6.5" y="5" width="3" height="6" rx="1.5"
          fill="rgba(56,189,248,0.7)"
          animate={shouldReduce ? {} : { y: [0, 7, 0], opacity: [1, 0, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </motion.div>
  )
}

export default function Hero() {
  const shouldReduce = useReducedMotion()

  return (
    <section
      id="hero"
      aria-label="Présentation ATN Detailing"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Subtle radial glow behind slider */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 70%, rgba(56,189,248,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center gap-12">
        {/* Text block */}
        <motion.div
          variants={stagger}
          initial={shouldReduce ? 'visible' : 'hidden'}
          animate="visible"
          className="flex flex-col items-center text-center gap-6 max-w-3xl"
        >
          <motion.p variants={shouldReduce ? {} : fadeInUp} className="section-eyebrow">
            Polissage &amp; Detailing Automobile
          </motion.p>

          <motion.h1
            variants={shouldReduce ? {} : fadeInUp}
            className="section-heading text-[clamp(3rem,8vw,6rem)]"
          >
            Votre voiture{' '}
            <br className="hidden sm:block" />
            mérite le{' '}
            <span style={{ color: 'var(--blue)' }}>meilleur.</span>
          </motion.h1>

          <motion.p
            variants={shouldReduce ? {} : fadeInUp}
            className="text-base leading-relaxed max-w-md"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body, sans-serif)', fontWeight: 300 }}
          >
            Chaque véhicule est traité avec soin, précision et les meilleures techniques
            de polissage pour un résultat showroom.
          </motion.p>

          <motion.div variants={shouldReduce ? {} : fadeInUp} className="flex flex-wrap gap-4 justify-center">
            <a href="#contact" className="btn-primary">
              Demander un devis
            </a>
            <a href="#realisations" className="btn-ghost">
              Voir les réalisations
            </a>
          </motion.div>
        </motion.div>

        {/* Before / After slider */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-3xl"
          style={{ borderRadius: '4px', overflow: 'hidden' }}
        >
          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            <ReactCompareSlider
              style={{ width: '100%', height: '100%' }}
              itemOne={
                <ReactCompareSliderImage
                  src="/images/hero-before.jpg"
                  alt="Voiture avant polissage"
                  style={{ objectFit: 'cover' }}
                />
              }
              itemTwo={
                <ReactCompareSliderImage
                  src="/images/hero-after.jpg"
                  alt="Voiture après polissage"
                  style={{ objectFit: 'cover' }}
                />
              }
            />
            {/* Labels */}
            <span
              className="absolute top-3 left-3 text-xs tracking-widest uppercase px-2 py-1 rounded"
              style={{
                background: 'rgba(0,0,0,0.6)',
                color: 'var(--muted)',
                fontFamily: 'var(--font-barlow, sans-serif)',
                fontWeight: 600,
                fontSize: '0.6rem',
                letterSpacing: '3px',
              }}
            >
              Avant
            </span>
            <span
              className="absolute top-3 right-3 text-xs tracking-widest uppercase px-2 py-1 rounded"
              style={{
                background: 'rgba(56,189,248,0.15)',
                color: 'var(--blue)',
                fontFamily: 'var(--font-barlow, sans-serif)',
                fontWeight: 600,
                fontSize: '0.6rem',
                letterSpacing: '3px',
              }}
            >
              Après
            </span>
          </div>
        </motion.div>
      </div>

      <ScrollIndicator />
    </section>
  )
}
