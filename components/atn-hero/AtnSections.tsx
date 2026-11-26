// Exemple de sections qui suivent le hero, comme dans la maquette.
// La voiture vient se placer grâce à data-car-pose : "right" (à droite), "left" (à gauche), "bottom" (en bas).
import styles from './AtnSections.module.css';

const SERVICES = [
  { n: '01', title: 'Polissage', text: "Micro-rayures, swirls et oxydation éliminés : la peinture retrouve son éclat d'origine." },
  { n: '02', title: 'Paint correction', text: 'Correction multi-étapes des défauts profonds, la base idéale avant une protection céramique.' },
  { n: '03', title: 'Protection céramique', text: 'Un revêtement longue durée qui protège la peinture et fait perler l’eau.' },
  { n: '04', title: 'Detailing intérieur', text: 'Tissus, cuirs, plastiques et vitres nettoyés en profondeur, pour un habitacle comme neuf.' },
];

export function ServicesSection() {
  return (
    <section id="services" className={styles.services} data-car-pose="right">
      <div className={styles.col}>
        <p className={styles.eyebrow}>Ce que nous faisons</p>
        <h2 className={styles.h2}>Services</h2>
        <p className={styles.muted}>Chaque prestation est réalisée à la main, avec des produits professionnels et le temps qu&apos;il faut.</p>
        <ul className={styles.list}>
          {SERVICES.map((s) => (
            <li key={s.n} className={styles.item}>
              <span className={styles.num}>{s.n}</span>
              <div>
                <h3 className={styles.h3}>{s.title}</h3>
                <p className={styles.muted}>{s.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function DevisSection({ ctaHref = '#contact' }: { ctaHref?: string }) {
  return (
    <section id="devis" className={styles.devis} data-car-pose="bottom">
      <p className={styles.eyebrow}>Prochaine étape</p>
      <h2 className={styles.h2Devis}>
        Votre voiture, <span className={styles.outline}>comme neuve</span>
      </h2>
      <p className={styles.muted}>Devis gratuit · Réponse sous 24h · Déplacement possible</p>
      <a className={styles.cta} href={ctaHref}>
        Demander un devis
        <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </a>
    </section>
  );
}
