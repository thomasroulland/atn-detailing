'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { fadeInUp, stagger, viewportOptions } from '@/lib/motion'

const testimonials = [
  {
    name: 'Alexandre M.',
    text: "Résultat impressionnant sur ma Porsche. La peinture brille comme neuve, on dirait qu'elle sort de la concession. Travail vraiment sérieux.",
    rating: 5,
  },
  {
    name: 'Sarah L.',
    text: "J'avais des swirls partout sur ma BMW noire. Après le passage d'ATN, la carrosserie est parfaite. Très professionnel et soigneux.",
    rating: 5,
  },
  {
    name: 'Thomas B.',
    text: "Detailing complet intérieur + polissage extérieur. Mon Audi Q5 est méconnaissable. Je recommande sans hésiter.",
    rating: 5,
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1" aria-label={`${count} étoiles sur 5`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path
            d="M7 1l1.545 3.13 3.455.503-2.5 2.437.59 3.44L7 8.886l-3.09 1.624.59-3.44L2 4.633l3.455-.503L7 1z"
            fill="var(--blue)"
          />
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  const shouldReduce = useReducedMotion()

  return (
    <section
      id="avis"
      aria-labelledby="testimonials-heading"
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
            Ce qu&apos;ils en disent
          </motion.p>
          <motion.h2
            id="testimonials-heading"
            variants={shouldReduce ? {} : fadeInUp}
            className="section-heading text-[clamp(2.5rem,5vw,4rem)]"
          >
            Avis{' '}
            <span style={{ color: 'var(--blue)' }}>Clients</span>
          </motion.h2>
        </motion.div>

        <motion.div
          variants={shouldReduce ? {} : stagger}
          initial={shouldReduce ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={viewportOptions}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {testimonials.map(({ name, text, rating }) => (
            <motion.blockquote
              key={name}
              variants={shouldReduce ? {} : fadeInUp}
              className="card flex flex-col gap-5 p-8"
              cite="#"
            >
              <Stars count={rating} />
              <p
                className="text-sm leading-relaxed flex-1"
                style={{ color: 'var(--muted)', fontWeight: 300, fontStyle: 'normal' }}
              >
                «&nbsp;{text}&nbsp;»
              </p>
              <footer>
                <cite
                  className="text-sm not-italic font-semibold"
                  style={{ fontFamily: 'var(--font-barlow, sans-serif)', letterSpacing: '1px' }}
                >
                  — {name}
                </cite>
              </footer>
            </motion.blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
