'use client'

import { useState, type FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { fadeInUp, stagger, viewportOptions } from '@/lib/motion'

interface FormState {
  name: string
  email: string
  phone: string
  vehicle: string
  message: string
}

const INITIAL: FormState = { name: '', email: '', phone: '', vehicle: '', message: '' }

export default function Contact() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const shouldReduce = useReducedMotion()

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setForm(INITIAL)
    } catch {
      setStatus('error')
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg)',
    border: '1px solid rgba(248,250,252,0.1)',
    borderRadius: 2,
    color: 'var(--text)',
    fontFamily: 'var(--font-body, sans-serif)',
    fontSize: '0.875rem',
    padding: '0.75rem 1rem',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.65rem',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    fontFamily: 'var(--font-barlow, sans-serif)',
    marginBottom: '0.5rem',
  }

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="py-28 px-6"
      style={{ background: 'var(--bg2)' }}
    >
      <hr className="section-divider mb-20" />

      <div className="max-w-2xl mx-auto">
        <motion.div
          variants={shouldReduce ? {} : stagger}
          initial={shouldReduce ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={viewportOptions}
          className="flex flex-col items-center text-center gap-4 mb-12"
        >
          <motion.p variants={shouldReduce ? {} : fadeInUp} className="section-eyebrow">
            Contactez-nous
          </motion.p>
          <motion.h2
            id="contact-heading"
            variants={shouldReduce ? {} : fadeInUp}
            className="section-heading text-[clamp(2.5rem,5vw,4rem)]"
          >
            Demander un{' '}
            <span style={{ color: 'var(--blue)' }}>Devis</span>
          </motion.h2>
          <motion.p
            variants={shouldReduce ? {} : fadeInUp}
            className="text-sm"
            style={{ color: 'var(--muted)', fontWeight: 300 }}
          >
            Formulaire rapide · Réponse sous 24h · Déplacement possible
          </motion.p>
        </motion.div>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center p-12 flex flex-col gap-4"
          >
            <span style={{ fontSize: '2.5rem' }}>✓</span>
            <p
              className="section-heading text-2xl"
              style={{ color: 'var(--blue)' }}
            >
              Message envoyé !
            </p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Nous reviendrons vers vous sous 24h.
            </p>
          </motion.div>
        ) : (
          <motion.form
            variants={shouldReduce ? {} : stagger}
            initial={shouldReduce ? 'visible' : 'hidden'}
            whileInView="visible"
            viewport={viewportOptions}
            onSubmit={handleSubmit}
            noValidate
            aria-label="Formulaire de demande de devis"
            className="flex flex-col gap-5"
          >
            <motion.div variants={shouldReduce ? {} : fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" style={labelStyle}>Prénom / Nom *</label>
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={set('name')}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(56,189,248,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(248,250,252,0.1)')}
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <label htmlFor="email" style={labelStyle}>Email *</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={set('email')}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(56,189,248,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(248,250,252,0.1)')}
                  placeholder="jean@exemple.fr"
                />
              </div>
            </motion.div>

            <motion.div variants={shouldReduce ? {} : fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="phone" style={labelStyle}>Téléphone</label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(56,189,248,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(248,250,252,0.1)')}
                  placeholder="06 00 00 00 00"
                />
              </div>
              <div>
                <label htmlFor="vehicle" style={labelStyle}>Modèle du véhicule</label>
                <input
                  id="vehicle"
                  type="text"
                  value={form.vehicle}
                  onChange={set('vehicle')}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(56,189,248,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(248,250,252,0.1)')}
                  placeholder="BMW Série 5, Porsche 911…"
                />
              </div>
            </motion.div>

            <motion.div variants={shouldReduce ? {} : fadeInUp}>
              <label htmlFor="message" style={labelStyle}>Message *</label>
              <textarea
                id="message"
                required
                rows={5}
                value={form.message}
                onChange={set('message')}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(56,189,248,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(248,250,252,0.1)')}
                placeholder="Décrivez votre projet : état de la peinture, prestations souhaitées, disponibilités…"
              />
            </motion.div>

            {status === 'error' && (
              <p className="text-sm text-center" style={{ color: '#f87171' }} role="alert">
                Une erreur est survenue. Réessayez ou contactez-nous directement.
              </p>
            )}

            <motion.button
              variants={shouldReduce ? {} : fadeInUp}
              type="submit"
              disabled={status === 'sending'}
              className="btn-primary self-center"
              style={{ opacity: status === 'sending' ? 0.6 : 1, cursor: status === 'sending' ? 'wait' : 'pointer' }}
            >
              {status === 'sending' ? 'Envoi en cours…' : 'Envoyer la demande'}
            </motion.button>
          </motion.form>
        )}
      </div>
    </section>
  )
}
