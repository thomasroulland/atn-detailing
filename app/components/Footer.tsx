export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      role="contentinfo"
      className="px-6 py-12"
      style={{ background: 'var(--bg)', borderTop: '1px solid rgba(56,189,248,0.08)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <span
          className="text-lg uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-barlow, sans-serif)', fontWeight: 900 }}
        >
          ATN{' '}
          <span style={{ color: 'var(--blue)' }}>DETAILING</span>
        </span>

        <nav aria-label="Liens du pied de page">
          <ul className="flex flex-wrap items-center justify-center gap-6 list-none m-0 p-0">
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs tracking-widest uppercase transition-colors"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-barlow, sans-serif)' }}
                aria-label="Instagram ATN Detailing (nouvel onglet)"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-xs tracking-widest uppercase transition-colors"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-barlow, sans-serif)' }}
              >
                Mentions légales
              </a>
            </li>
          </ul>
        </nav>

        <p
          className="text-xs"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-barlow, sans-serif)' }}
        >
          © {year} ATN Detailing
        </p>
      </div>
    </footer>
  )
}
