import Navbar from './components/Navbar'
import Gallery from './components/Gallery'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'
import AtnHero from '@/components/atn-hero/AtnHero'
import { ServicesSection, DevisSection } from '@/components/atn-hero/AtnSections'

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <AtnHero>
          <ServicesSection />
          <DevisSection />
        </AtnHero>
        <Gallery />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
