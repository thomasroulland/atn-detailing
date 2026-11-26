import type { Metadata } from 'next'
import { Barlow_Condensed, Space_Grotesk } from 'next/font/google'
import './globals.css'

const barlow = Barlow_Condensed({
  variable: '--font-barlow',
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  display: 'swap',
})

const space = Space_Grotesk({
  variable: '--font-space',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ATN Detailing — Polissage & Detailing Automobile',
  description:
    "ATN Detailing, expert en polissage et detailing automobile. Restaurez l'éclat de votre véhicule avec des prestations haut de gamme.",
  openGraph: {
    title: 'ATN Detailing — Polissage & Detailing Automobile',
    description:
      "Expert en polissage et detailing automobile. Résultats premium, intervention sur rendez-vous.",
    type: 'website',
    locale: 'fr_FR',
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'ATN Detailing',
  description: 'Polissage et detailing automobile haut de gamme',
  serviceType: [
    'Polissage automobile',
    'Detailing intérieur',
    'Traitement céramique',
    'Paint Correction',
  ],
  priceRange: '€€€',
  url: 'https://atndetailing.fr',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${barlow.variable} ${space.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
