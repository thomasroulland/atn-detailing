'use client'

import { useEffect, useState } from 'react'

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="flex flex-col justify-center gap-[5px] w-5 h-5" aria-hidden>
      <span
        className="block h-px bg-current transition-transform origin-center"
        style={{ transform: open ? 'translateY(6px) rotate(45deg)' : 'none' }}
      />
      <span
        className="block h-px bg-current transition-opacity"
        style={{ opacity: open ? 0 : 1 }}
      />
      <span
        className="block h-px bg-current transition-transform origin-center"
        style={{ transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none' }}
      />
    </span>
  )
}

const links = [
  { label: 'Services', href: '#services' },
  { label: 'Réalisations', href: '#realisations' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const handleNavClick = () => setOpen(false)

  return (
    <>
      <header
        role="banner"
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(8,9,13,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(56,189,248,0.08)' : '1px solid transparent',
        }}
      >
        <nav
          aria-label="Navigation principale"
          className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between"
        >
          <a
            href="#"
            className="text-xl tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-barlow, sans-serif)', fontWeight: 900 }}
            aria-label="ATN Detailing — retour en haut"
          >
            ATN{' '}
            <span style={{ color: 'var(--blue)' }}>DETAILING</span>
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            {links.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className="text-xs tracking-widest uppercase transition-colors"
                  style={{
                    fontFamily: 'var(--font-barlow, sans-serif)',
                    fontWeight: 600,
                    color: 'var(--muted)',
                  }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--text)')}
                  onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--muted)')}
                >
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a href="#contact" className="btn-primary text-xs py-2 px-5">
                Devis gratuit
              </a>
            </li>
          </ul>

          {/* Mobile burger */}
          <button
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            aria-controls="mobile-drawer"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded"
            onClick={() => setOpen(v => !v)}
          >
            <MenuIcon open={open} />
          </button>
        </nav>
      </header>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        id="mobile-drawer"
        inert={!open}
        role="dialog"
        aria-label="Menu mobile"
        aria-modal="true"
        className="fixed top-0 right-0 bottom-0 z-50 w-72 md:hidden flex flex-col pt-20 px-8 gap-6"
        style={{
          background: 'var(--bg2)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          borderLeft: '1px solid rgba(56,189,248,0.1)',
        }}
      >
        {links.map(({ label, href }) => (
          <a
            key={href}
            href={href}
            onClick={handleNavClick}
            className="text-2xl uppercase"
            style={{
              fontFamily: 'var(--font-barlow, sans-serif)',
              fontWeight: 700,
              color: 'var(--text)',
              letterSpacing: '3px',
            }}
          >
            {label}
          </a>
        ))}
        <a
          href="#contact"
          onClick={handleNavClick}
          className="btn-primary mt-4 text-center"
        >
          Devis gratuit
        </a>
      </div>
    </>
  )
}
