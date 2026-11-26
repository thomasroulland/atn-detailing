'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { fadeInUp, stagger, viewportOptions } from '@/lib/motion'

const services = [
  {
    title: 'Polissage',
    desc: "Élimination des micro-rayures, swirls et oxydations. Peinture restaurée à son état d'origine.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden width="32" height="32">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 24c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="24" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Traitement Céramique',
    desc: "Protection longue durée de la peinture par revêtement céramique. Hydrophobicité maximale.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden width="32" height="32">
        <path d="M24 8v6M24 34v6M8 24h6M34 24h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M18 24c0-3.314 2.686-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Detailing Intérieur',
    desc: "Nettoyage complet de l'habitacle : tissus, cuirs, plastiques et vitres. Résultat showroom.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden width="32" height="32">
        <rect x="8" y="14" width="32" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 22h16M16 28h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="36" cy="22" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Paint Correction',
    desc: "Correction de défauts profonds multi-étapes. Remise à niveau de la peinture avant céramique.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden width="32" height="32">
        <path d="M12 36L20 28l8 4 8-16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="28" r="2" fill="currentColor" />
        <circle cx="36" cy="16" r="2" fill="currentColor" />
      </svg>
    ),
  },
]

export default function Services() {
  const shouldReduce = useReducedMotion()

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="py-28 px-6"
      style={{ background: 'var(--bg)' }}
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
            Nos prestations
          </motion.p>
          <motion.h2
            id="services-heading"
            variants={shouldReduce ? {} : fadeInUp}
            className="section-heading text-[clamp(2.5rem,5vw,4rem)]"
          >
            Services{' '}
            <span style={{ color: 'var(--blue)' }}>Premium</span>
          </motion.h2>
        </motion.div>

        <motion.ul
          variants={shouldReduce ? {} : stagger}
          initial={shouldReduce ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={viewportOptions}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 list-none m-0 p-0"
        >
          {services.map(({ title, desc, icon }) => (
            <motion.li
              key={title}
              variants={shouldReduce ? {} : fadeInUp}
              className="card flex flex-col gap-5 p-8"
            >
              <span style={{ color: 'var(--blue)' }}>{icon}</span>
              <div className="flex flex-col gap-2">
                <h3
                  className="text-xl uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-barlow, sans-serif)', fontWeight: 700 }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--muted)', fontWeight: 300 }}
                >
                  {desc}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
