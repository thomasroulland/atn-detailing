'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'
import { fadeInUp, stagger, viewportOptions } from '@/lib/motion'

interface GalleryItem {
  id: number
  label: string
  before: string
  after: string
}

const items: GalleryItem[] = [
  { id: 1, label: 'BMW Série 5 — Paint Correction', before: '/images/gallery/car1-before.jpg', after: '/images/gallery/car1-after.jpg' },
  { id: 2, label: 'Porsche 911 — Céramique', before: '/images/gallery/car2-before.jpg', after: '/images/gallery/car2-after.jpg' },
  { id: 3, label: 'Mercedes GLE — Detailing complet', before: '/images/gallery/car3-before.jpg', after: '/images/gallery/car3-after.jpg' },
]

function Modal({ item, onClose, onPrev, onNext }: { item: GalleryItem; onClose: () => void; onPrev: () => void; onNext: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onPrev, onNext])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.label}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-4xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute -top-10 right-0 flex items-center gap-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-70"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-barlow, sans-serif)' }}
        >
          Fermer ✕
        </button>

        <div style={{ borderRadius: 4, overflow: 'hidden' }}>
          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            <ReactCompareSlider
              style={{ width: '100%', height: '100%' }}
              itemOne={<ReactCompareSliderImage src={item.before} alt={`Avant — ${item.label}`} style={{ objectFit: 'cover' }} />}
              itemTwo={<ReactCompareSliderImage src={item.after} alt={`Après — ${item.label}`} style={{ objectFit: 'cover' }} />}
            />
          </div>
        </div>

        <p
          className="mt-4 text-center text-sm tracking-widest uppercase"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-barlow, sans-serif)', fontSize: '0.7rem' }}
        >
          {item.label}
        </p>

        {/* Navigation */}
        <div className="flex justify-between mt-4">
          <button
            onClick={onPrev}
            aria-label="Réalisation précédente"
            className="btn-ghost py-2 px-4 text-xs"
          >
            ← Précédent
          </button>
          <button
            onClick={onNext}
            aria-label="Réalisation suivante"
            className="btn-ghost py-2 px-4 text-xs"
          >
            Suivant →
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Gallery() {
  const [selected, setSelected] = useState<number | null>(null)
  const shouldReduce = useReducedMotion()

  const selectedItem = selected !== null ? items[selected] : null

  const handlePrev = useCallback(() => {
    setSelected(i => (i !== null ? (i - 1 + items.length) % items.length : 0))
  }, [])

  const handleNext = useCallback(() => {
    setSelected(i => (i !== null ? (i + 1) % items.length : 0))
  }, [])

  return (
    <section
      id="realisations"
      aria-labelledby="gallery-heading"
      className="py-28 px-6"
      style={{ background: 'var(--bg2)' }}
    >
      <hr className="section-divider mb-20" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={shouldReduce ? {} : stagger}
          initial={shouldReduce ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={viewportOptions}
          className="flex flex-col items-center text-center gap-4 mb-16"
        >
          <motion.p variants={shouldReduce ? {} : fadeInUp} className="section-eyebrow">
            Portfolio
          </motion.p>
          <motion.h2
            id="gallery-heading"
            variants={shouldReduce ? {} : fadeInUp}
            className="section-heading text-[clamp(2.5rem,5vw,4rem)]"
          >
            Réalisations{' '}
            <span style={{ color: 'var(--blue)' }}>Récentes</span>
          </motion.h2>
          <motion.p
            variants={shouldReduce ? {} : fadeInUp}
            className="text-sm max-w-sm"
            style={{ color: 'var(--muted)', fontWeight: 300 }}
          >
            Cliquez sur une photo pour voir le slider avant / après.
          </motion.p>
        </motion.div>

        <motion.div
          variants={shouldReduce ? {} : stagger}
          initial={shouldReduce ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={viewportOptions}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {items.map((item, i) => (
            <motion.button
              key={item.id}
              variants={shouldReduce ? {} : fadeInUp}
              onClick={() => setSelected(i)}
              aria-label={`Voir : ${item.label}`}
              className="group relative block w-full text-left rounded overflow-hidden focus-visible:outline-2"
              style={{
                aspectRatio: '4/3',
                background: 'var(--bg)',
                border: '1px solid rgba(56,189,248,0.08)',
                outline: 'none',
              }}
            >
              <Image
                src={item.after}
                alt={item.label}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(to top, rgba(8,9,13,0.9) 0%, transparent 60%)' }}
              >
                <span
                  className="text-xs uppercase tracking-widest"
                  style={{ color: 'var(--blue)', fontFamily: 'var(--font-barlow, sans-serif)', fontWeight: 600, fontSize: '0.6rem' }}
                >
                  Avant / Après
                </span>
                <span
                  className="text-sm mt-1"
                  style={{ fontFamily: 'var(--font-barlow, sans-serif)', fontWeight: 700 }}
                >
                  {item.label}
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <Modal
            item={selectedItem}
            onClose={() => setSelected(null)}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
