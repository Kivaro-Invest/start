import { useEffect, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, KeyRound, BadgeCheck, Landmark, Handshake, BadgeEuro, ArrowRight, CheckCircle2, MinusCircle, TrendingUp, ShieldCheck, Building, Users, FileText, MapPin, Plus, Wallet, Percent, PiggyBank } from 'lucide-react';
import { Link } from 'react-router-dom';
import ExplainerVideo from '../components/ExplainerVideo';
import InvestmentCheck from '../components/InvestmentCheck';
import { team } from '../lib/team';

const faqs = [
  {
    question: "Warum zahle ich bei Kivaro Invest keine Provision?",
    answer: "Wir arbeiten direkt mit dem Bauträger zusammen und werden von der Verkäuferseite vergütet. Für dich als Käufer fällt keine Käuferprovision an."
  },
  {
    question: "Brauche ich Eigenkapital?",
    answer: "Nicht zwingend. Je nach Bonität ist eine Finanzierung auch ohne Eigenkapital möglich. Eigenkapital kann deine monatliche Rate senken. Was in deinem Fall sinnvoll ist, klären unsere Finanzierungsexperten mit dir."
  },
  {
    question: "Wie wirkt sich eine vermietete Wohnung auf meine Steuer aus?",
    answer: "Zinsen, die Abschreibung des Gebäudes (AfA) und laufende Kosten sind Werbungskosten. Übersteigen sie die Mieteinnahmen, mindert der Verlust dein zu versteuerndes Einkommen und damit deine Lohn- und Einkommensteuer. Wie viel das bei dir ausmacht, rechnen wir im weiteren Verlauf mit deinen Zahlen durch. Die steuerliche Beurteilung im Einzelfall übernimmt dein Steuerberater; wir stellen ihm die Unterlagen zusammen."
  },
  {
    question: "Wer kümmert sich um Mieter und Reparaturen?",
    answer: "Zu unseren Objekten bietet der Bauträger eine professionelle Hausverwaltung an. Sie kümmert sich um Mieterangelegenheiten, Nebenkostenabrechnungen und Reparaturen – du musst dich um den Alltag nicht selbst kümmern."
  },
  {
    question: "Was passiert, wenn die Wohnung mal leer steht?",
    answer: "Bei vielen Objekten gibt der Bauträger eine Mietgarantie: Steht die Wohnung leer, bekommst du trotzdem die vereinbarte Miete. Umfang und Laufzeit hängen vom jeweiligen Objekt ab – die Garantie ist zeitlich begrenzt, und wir legen dir die Bedingungen vorab schriftlich vor."
  },
  {
    question: "Muss ich mich um die Sanierung kümmern?",
    answer: "Nein. Bei unseren Objekten wird die Sanierung in der Regel bereits vor der Übergabe durch den Bauträger abgeschlossen – ohne versteckte Zusatzkosten für dich. Du übernimmst eine schlüsselfertige, vermietbare Immobilie."
  }
];

// ---------- Gestaltung (angelehnt an vermietermacher.de, in Kivaro-Farben) ----------
const darkGradient = 'bg-[linear-gradient(90deg,#062a4f_0%,#0a3c6e_50%,#062a4f_100%)]';
const lightGradient = 'bg-[linear-gradient(180deg,#f1f5f9_0%,#ffffff_100%)]';
const card = 'bg-white rounded-2xl shadow-[0_10px_35px_-15px_rgba(15,23,42,0.22)] ring-1 ring-zinc-900/5';

function SectionHeading({ eyebrow, title, text, dark = false }: { eyebrow?: string; title: ReactNode; text?: ReactNode; dark?: boolean }) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
      {eyebrow && <p className={`text-sm font-semibold tracking-wider uppercase mb-3 ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>{eyebrow}</p>}
      <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance ${dark ? 'text-white' : 'text-zinc-900'}`}>{title}</h2>
      {text && <p className={`mt-5 text-lg leading-relaxed ${dark ? 'text-zinc-300' : 'text-zinc-600'}`}>{text}</p>}
    </div>
  );
}

function Hl({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <span className={dark ? 'text-emerald-400' : 'text-emerald-600'}>{children}</span>;
}

function CtaButton({ dark = false, note = true, short = false, className = '' }: { dark?: boolean; note?: boolean; short?: boolean; className?: string }) {
  return (
    <div data-cta className={`flex flex-col items-center gap-2.5 ${className}`}>
      <button
        type="button"
        onClick={scrollToCheck}
        className={`inline-flex w-full sm:w-auto justify-center items-center gap-2 sm:whitespace-nowrap px-5 sm:px-7 py-4 text-base sm:text-lg font-semibold rounded-xl transition-all hover:-translate-y-0.5 ${
          dark
            ? 'text-white bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-black/25'
            : 'text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-700/25'
        }`}
      >
        <span className="sm:hidden">{short ? 'Investment-Check starten' : 'Jetzt Investment-Check starten'}</span>
        <span className="hidden sm:inline">Kostenlosen Investment-Check starten</span>
        <ArrowRight className="w-5 h-5" />
      </button>
      {note && <p className={`text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>1 Minute · kostenlos · unverbindlich</p>}
    </div>
  );
}

function FAQItem({ question, answer, isOpen, onClick }: { key?: number, question: string, answer: string, isOpen: boolean, onClick: () => void }) {
  return (
    <div className={`${card} overflow-hidden`}>
      <button
        className="flex w-full items-center justify-between gap-6 px-6 sm:px-8 py-5 sm:py-6 text-left focus:outline-none group"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span className="text-base sm:text-lg font-semibold text-zinc-900 group-hover:text-emerald-700 transition-colors">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${isOpen ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'}`}
        >
          <Plus className="w-5 h-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-6 sm:px-8 pb-6 text-zinc-600 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type Projekt = {
  ort: string;
  lage: string;
  titel: string;
  bilder: { src: string; alt: string }[];
  fakten: { label: string; wert: string }[];
  highlights: string[];
};

const projekte: Projekt[] = [
  {
    ort: 'Schweinfurt',
    lage: 'Zentrale Lage',
    titel: 'Modernisierter Altbau im Zentrum',
    bilder: [
      { src: '/objekte/schweinfurt-wohnraum-2.webp', alt: 'Heller Wohnraum mit zwei Fenstern' },
      { src: '/objekte/schweinfurt-zimmer-2.webp', alt: 'Zimmer mit neuem Boden' },
      { src: '/objekte/schweinfurt-bad-2.webp', alt: 'Modernisiertes Bad mit Dusche' },
    ],
    fakten: [
      { label: 'Kaufpreis', wert: '205.000 – 264.000 €' },
      { label: 'Wohnfläche', wert: '57 – 70 m²' },
      { label: 'Beispiel-Rendite', wert: '4,0 %' },
      { label: 'Zustand', wert: '2025 modernisiert' },
    ],
    highlights: ['Zentrale Lage, Bahnhof & Innenstadt schnell erreichbar', 'Garagen & Stellplätze', 'Starke Arbeitgeber wie Schaeffler & ZF'],
  },
  {
    ort: 'Plattling',
    lage: 'Landkreis Deggendorf',
    titel: 'Charmanter Altbau in zentraler Lage',
    bilder: [
      { src: '/objekte/plattling-wohnraum.webp', alt: 'Wohnraum' },
      { src: '/objekte/plattling-bad.webp', alt: 'Bad' },
    ],
    fakten: [
      { label: 'Kaufpreis', wert: '250.000 – 450.000 €' },
      { label: 'Wohnfläche', wert: '63 – 112 m²' },
      { label: 'Sanierung', wert: '2026' },
      { label: 'Lage', wert: 'Zentrum, 10 Min. zu Fuß' },
    ],
    highlights: ['ICE-Bahnhof & A92/A3 in der Nähe', 'Nähe BMW Dingolfing & TH Deggendorf', 'Garagen & Stellplätze'],
  },
];

function ProjektKarte({ p }: { key?: string; p: Projekt }) {
  return (
    <div className={`${card} overflow-hidden flex flex-col`}>
      <div className={`relative grid aspect-[3/2] gap-1 bg-white ${p.bilder.length === 3 ? 'grid-cols-3 grid-rows-2' : 'grid-cols-2'}`}>
        {p.bilder.map((b, i) => (
          <img
            key={b.src}
            src={b.src}
            alt={b.alt}
            className={`h-full w-full object-cover ${p.bilder.length === 3 && i === 0 ? 'col-span-2 row-span-2' : ''}`}
            loading="lazy"
          />
        ))}
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-900 shadow">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {p.ort}
        </span>
      </div>
      <div className="p-6 sm:p-8 flex flex-col flex-1">
        <p className="text-sm text-zinc-500">{p.lage}</p>
        <h3 className="mt-1 text-2xl font-bold text-zinc-900">{p.titel}</h3>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-zinc-200 py-6">
          {p.fakten.map((f) => (
            <div key={f.label}>
              <dt className="text-xs text-zinc-500">{f.label}</dt>
              <dd className="text-lg font-bold text-zinc-900">{f.wert}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-6 space-y-2 flex-1">
          {p.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2 text-zinc-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> {h}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={scrollToCheck}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 px-6 py-3.5 font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
        >
          <span className="sm:hidden">Investment-Check starten</span>
          <span className="hidden sm:inline">Interesse? Investment-Check starten</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function HeroPhoto() {
  return (
    <figure className="relative">
      <div aria-hidden="true" className="absolute -inset-3 sm:-inset-4 rounded-[2rem] bg-gradient-to-br from-emerald-400/25 via-emerald-400/5 to-transparent blur-xl" />
      <img
        src="/team/geschaeftsfuehrer-v2-1500.webp"
        srcSet="/team/geschaeftsfuehrer-v2-900.webp 900w, /team/geschaeftsfuehrer-v2-1500.webp 1500w"
        sizes="(min-width: 1024px) 720px, 100vw"
        width={1500}
        height={1043}
        alt="Die Geschäftsführer von Kivaro Invest"
        fetchPriority="high"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        className="relative w-full h-auto rounded-2xl lg:rounded-3xl shadow-2xl ring-1 ring-white/10 select-none pointer-events-none [-webkit-touch-callout:none]"
      />
      {/* unsichtbare Schicht über dem Foto: kein Rechtsklick, kein langes Drücken zum Speichern, kein Ziehen */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl lg:rounded-3xl select-none [-webkit-touch-callout:none] [touch-action:pan-y]"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
      <figcaption className="absolute left-3 bottom-3 lg:left-5 lg:bottom-5 rounded-lg bg-zinc-950/70 backdrop-blur px-3 py-1.5 lg:px-4 lg:py-2 text-xs sm:text-sm font-medium text-white">
        Die Geschäftsführer von Kivaro Invest
      </figcaption>
    </figure>
  );
}

const vorteile = [
  { icon: <BadgeCheck className="w-4 h-4 lg:w-5 lg:h-5" />, text: 'Zugelassen nach § 34c GewO' },
  { icon: <BadgeEuro className="w-4 h-4 lg:w-5 lg:h-5" />, text: '0 € Käuferprovision' },
  { icon: <Handshake className="w-4 h-4 lg:w-5 lg:h-5" />, text: 'Direkte Anbindung an Bauträger' },
  { icon: <Landmark className="w-4 h-4 lg:w-5 lg:h-5" />, text: 'Finanzierung über zugelassene Experten' },
  { icon: <KeyRound className="w-4 h-4 lg:w-5 lg:h-5" />, text: 'Ohne Eigenkapital möglich – je nach Bonität' },
  { icon: <Building className="w-4 h-4 lg:w-5 lg:h-5" />, text: 'Hausverwaltung über den Bauträger' },
  { icon: <Users className="w-4 h-4 lg:w-5 lg:h-5" />, text: 'Persönliche Begleitung' },
];

// Laufband unter dem Foto: läuft automatisch, pausiert beim Drüberfahren, steht still bei „Bewegung reduzieren“
function HeroMarquee({ className = '' }: { className?: string }) {
  const gruppe = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center gap-3 pr-3" aria-hidden={hidden || undefined}>
      {vorteile.map((v) => (
        <li key={v.text} className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white/[0.07] ring-1 ring-white/10 px-4 py-2 text-sm lg:text-base font-medium text-zinc-100">
          <span className="text-emerald-400">{v.icon}</span>
          {v.text}
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] ${className}`}>
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {gruppe(false)}
        {gruppe(true)}
      </div>
    </div>
  );
}

function scrollToCheck() {
  document.getElementById('investment-check-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const gruende = [
  { icon: <Wallet className="w-6 h-6" />, title: 'Mieteinnahmen', text: 'Dein Mieter zahlt jeden Monat Miete. Sie fließt direkt in die Finanzierung deiner Wohnung.' },
  { icon: <Percent className="w-6 h-6" />, title: 'Steuervorteile', text: 'Zinsen, Abschreibung (AfA) und laufende Kosten setzt du als Werbungskosten ab. Das kann deine Lohn- und Einkommensteuer senken.', dark: true },
  { icon: <Landmark className="w-6 h-6" />, title: 'Hebel durch die Bank', text: 'Du kaufst mit dem Geld der Bank und baust Vermögen auf, ohne dafür jahrelang sparen zu müssen.' },
  { icon: <PiggyBank className="w-6 h-6" />, title: 'Vorsorge fürs Alter', text: 'Ist die Wohnung abbezahlt, bleibt dir die Miete als zusätzliches Einkommen – neben deiner Rente.' },
  { icon: <ShieldCheck className="w-6 h-6" />, title: 'Sachwert statt Sparbuch', text: 'Eine Wohnung ist ein echter Sachwert. Mieten und Preise können langfristig mit der Inflation steigen.' },
  { icon: <Building className="w-6 h-6" />, title: 'Kein Aufwand im Alltag', text: 'Die Hausverwaltung kümmert sich um Mieter, Nebenkosten und Reparaturen.' },
];

export default function Home() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const checkRef = useRef<HTMLElement>(null);
  const teamWithPhotos = team.filter((m) => m.photo);

  return (
    <div className="w-full">
      {/* Einstieg: Geschäftsführer + Investment-Check */}
      <section className={`relative overflow-hidden text-white ${darkGradient}`}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(23,131,193,0.28),transparent_55%)]" />
        <div className="relative max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-20 lg:pb-24">
          <div className="grid lg:grid-cols-[1fr_1.12fr] gap-8 lg:gap-16 xl:gap-20 items-center">
            <div className="min-w-0 flex flex-col items-start">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 border border-white/10 px-3 py-1.5 lg:px-4 lg:py-2 text-xs sm:text-sm lg:text-base font-medium text-zinc-100 mb-5 lg:mb-7"
              >
                <KeyRound className="w-4 h-4 text-emerald-400" />
                Start auch ohne Eigenkapital – je nach Bonität
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-[2.15rem] sm:text-5xl lg:text-[3.6rem] xl:text-[4rem] font-bold tracking-tight leading-[1.06] text-balance mb-6 lg:mb-9"
              >
                Dein Mieter zahlt.<br />
                <span className="text-emerald-400">Du baust Vermögen auf.</span>
              </motion.h1>

              <motion.ul
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-8 lg:mb-11 space-y-3 lg:space-y-4"
              >
                {[
                  'Vermögensaufbau mit dem Geld der Bank',
                  'Dein Mieter zahlt die Rate mit',
                  'Steuervorteile durch Vermietung nutzen',
                  '0 € Käuferprovision',
                  'Persönliche Begleitung',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-base sm:text-lg lg:text-xl font-medium text-zinc-100">
                    <Check className="w-5 h-5 lg:w-6 lg:h-6 shrink-0 text-emerald-400" strokeWidth={3} />
                    {t}
                  </li>
                ))}
              </motion.ul>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-full"
              >
                <CtaButton dark className="sm:items-start" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="min-w-0 mt-2 lg:mt-0"
            >
              <HeroPhoto />
              <HeroMarquee className="mt-5 lg:mt-7" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Erklärvideo + Vertrauensleiste */}
      <section className={`pt-16 pb-10 lg:pt-28 lg:pb-16 ${lightGradient}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="So funktioniert's"
            title={<>In 90 Sekunden <Hl>erklärt</Hl></>}
            text="So kaufst du mit dem Geld der Bank eine Wohnung, die dein Mieter mit abbezahlt."
          />
          <ExplainerVideo onCta={scrollToCheck} />
          <CtaButton className="mt-10" />

          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: <BadgeCheck className="w-6 h-6" />, title: 'Zugelassen nach § 34c GewO', text: 'Offizielle Erlaubnis als Immobilienmakler' },
              { icon: <Landmark className="w-6 h-6" />, title: 'Passende Finanzierung', text: 'Über zugelassene Finanzierungsexperten' },
              { icon: <BadgeEuro className="w-6 h-6" />, title: '0 € Käuferprovision', text: 'Dank direkter Anbindung an Bauträger' },
              { icon: <Handshake className="w-6 h-6" />, title: 'Persönliche Begleitung', text: 'Vom ersten Gespräch an an deiner Seite' },
            ].map((t) => (
              <div key={t.title} className={`${card} flex flex-col sm:flex-row items-start gap-3 p-4 sm:p-5`}>
                <div className="w-11 h-11 shrink-0 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">{t.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 leading-snug">{t.title}</p>
                  <p className="text-[0.8125rem] sm:text-xs text-zinc-500 leading-snug mt-0.5">{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment-Check */}
      <section id="investment-check" ref={checkRef} className="scroll-mt-24 pt-8 pb-14 sm:py-16 lg:pt-16 lg:pb-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-6 lg:gap-16 items-start">
            <div className="lg:col-span-2 lg:sticky lg:top-32">
              <p className="text-sm font-semibold text-emerald-600 tracking-wider uppercase mb-3">Investment-Check</p>
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-zinc-900 tracking-tight text-balance mb-4 lg:mb-6">Finde heraus, was mit <Hl>Immobilien</Hl> für dich möglich ist.</h2>
              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed lg:mb-8">
                Beantworte ein paar kurze Fragen. Danach melden wir uns bei dir und zeigen dir in einem kostenlosen Erstgespräch, wie der Weg zu deiner eigenen Kapitalanlage aussieht.
              </p>
              <ul className="hidden lg:block space-y-4">
                {[
                  'Start auch ohne Eigenkapital – je nach Bonität',
                  'Mieteinnahmen und Steuervorteile zahlen deine Rate mit',
                  'Kein Aufwand: Die Hausverwaltung kümmert sich um Mieter und Reparaturen',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-zinc-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-3">
              <InvestmentCheck />
            </div>
          </div>
        </div>
      </section>

      {/* Warum Immobilien */}
      <section className={`py-16 lg:py-28 ${lightGradient}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title={<>Warum <Hl>Immobilien</Hl> als Kapitalanlage?</>}
            text="Eine vermietete Wohnung arbeitet für dich – mit dem Geld der Bank, der Miete deines Mieters und den Vorteilen beim Finanzamt."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {gruende.map((g) => (
              <div
                key={g.title}
                className={`flex sm:block items-start gap-4 p-5 sm:p-7 lg:p-8 ${g.dark
                  ? `rounded-2xl text-white shadow-xl ${darkGradient}`
                  : card}`}
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center sm:mb-5 ${g.dark ? 'bg-emerald-400/15 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>{g.icon}</div>
                <div>
                  <h3 className={`text-lg sm:text-xl font-bold mb-1 sm:mb-2 ${g.dark ? 'text-white' : 'text-zinc-900'}`}>{g.title}</h3>
                  <p className={`leading-relaxed ${g.dark ? 'text-zinc-300' : 'text-zinc-600'}`}>{g.text}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-zinc-500">Mieteinnahmen, Wertentwicklung und steuerliche Vorteile sind nicht garantiert und hängen von deiner persönlichen Situation ab.</p>
        </div>
      </section>

      {/* Aktuelle Projekte */}
      <section className="py-16 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Aktuelle Projekte"
            title={<>Wohnungen aus der <Hl>Region</Hl></>}
            text="Saniert, vermietbar und mit Hausverwaltung – so sehen Objekte aus, die wir vermitteln."
          />
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {projekte.map((p) => <ProjektKarte key={p.ort} p={p} />)}
          </div>
          <p className="mt-8 text-center text-xs text-zinc-500">Angaben laut Bauträger, ohne Gewähr. Bilder teilweise Beispielwohnungen. Verfügbarkeit auf Anfrage.</p>
        </div>
      </section>

      {/* Team – erscheint automatisch, sobald Fotos hinterlegt sind (src/lib/team.ts) */}
      {teamWithPhotos.length > 0 && (
        <section className={`py-16 lg:py-28 ${lightGradient}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Wer hinter Kivaro steht" title={<>Persönlich statt <Hl>anonym</Hl>.</>} />
            <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {teamWithPhotos.map((m) => (
                <div key={m.name} className={`${card} overflow-hidden`}>
                  <img src={m.photo} alt={m.name} className="w-full aspect-square object-cover" loading="lazy" />
                  <div className="p-6">
                    <p className="text-xl font-bold text-zinc-900">{m.name}</p>
                    <p className="text-zinc-500">{m.role}</p>
                    {m.quote && <p className="mt-4 text-zinc-600 italic">„{m.quote}“</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vergleich */}
      <section className={`py-16 lg:py-28 ${lightGradient}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Der smarte Vergleich"
            title={<>Allein kaufen oder <Hl>begleitet</Hl> kaufen?</>}
            text="Ein Kauf in Eigenregie ist mühsam und fehleranfällig. Mit Kivaro Invest hast du einen Ansprechpartner, der dich persönlich begleitet – vom ersten Gespräch an."
          />

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            <div className={`${card} p-6 sm:p-8 lg:p-10`}>
              <h3 className="text-2xl font-bold text-zinc-900 mb-8 text-center">Allein</h3>
              <ul className="space-y-5">
                {[
                  "Käuferprovision, in Bayern üblich 3,57 % des Kaufpreises",
                  "Suche auf Portalen, viele Mitbewerber je Objekt",
                  "Mühsame Suche nach einer passenden Bank",
                  "Steuerliche Vorteile kennst du nur, wenn du dich selbst einarbeitest",
                  "Sanierungsrisiken, Handwerker schwer zu finden",
                  "Viel Zeitaufwand für die Mietersuche"
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-zinc-600">
                    <MinusCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`rounded-2xl p-6 sm:p-8 lg:p-10 text-white shadow-2xl ${darkGradient}`}>
              <h3 className="mb-8 flex items-center justify-center gap-3 text-2xl font-bold">
                Mit
                <img src="/logo-kivaro-weiss.svg" alt="Kivaro Invest" className="h-10 w-auto" />
              </h3>
              <ul className="space-y-5">
                {[
                  "0 € Käuferprovision",
                  "Hausverwaltung über den Bauträger inklusive",
                  "Kontakt zu zugelassenen Finanzierungsexperten",
                  "Sanierung vor Übergabe durch den Bauträger",
                  "Je nach Objekt mit Mietgarantie des Bauträgers",
                  "Inklusive Unterlagen für den Steuerberater"
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 pt-8 border-t border-white/10">
                <CtaButton dark note={false} short />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ablauf */}
      <section className={`py-16 lg:py-28 text-white ${darkGradient}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            dark
            eyebrow="Der Ablauf"
            title={<><Hl dark>Dein Weg</Hl> zur eigenen Immobilie</>}
            text="Nicht nur kaufen, sondern verstehen: Kivaro Invest begleitet dich transparent und persönlich durch jeden Schritt."
          />
          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {[
              { title: 'Investment-Check & Gespräch', desc: 'Du machst den Check, wir melden uns bei dir und lernen dich und deine Ziele in einem kostenlosen Erstgespräch kennen.', icon: <Users className="w-6 h-6" /> },
              { title: 'Finanzierung', desc: 'Wir bringen dich mit zugelassenen Finanzierungsexperten zusammen, die mit dir die passende Finanzierung erarbeiten.', icon: <FileText className="w-6 h-6" /> },
              { title: 'Deine Immobilie', desc: 'Du bekommst Zugang zu passenden Objekten. Wir begleiten dich beim Kauf – und sind auch danach für dich da.', icon: <TrendingUp className="w-6 h-6" /> },
            ].map((item, i) => (
              <div key={item.title} className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 p-7 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-5xl font-bold text-emerald-400 leading-none">{i + 1}.</span>
                  <span className="w-12 h-12 rounded-full bg-emerald-400/15 text-emerald-300 flex items-center justify-center">{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-zinc-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={`py-16 lg:py-28 ${lightGradient}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="FAQ" title={<>Häufig gestellte <Hl>Fragen</Hl></>} />
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaqIndex === index}
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Abschluss */}
      <section className={`relative overflow-hidden text-white ${darkGradient}`}>
        <img src="/objekte/plattling-isar.webp" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-20" loading="lazy" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-balance mb-6">
            Bereit für dein <Hl dark>erstes Investment</Hl>?
          </h2>
          <p className="text-lg text-zinc-300 mb-10 max-w-2xl mx-auto">
            Mach den kostenlosen Investment-Check und finde heraus, was eine Kapitalanlage-Immobilie für dich bringt.
          </p>
          <CtaButton dark />
        </div>
      </section>

    </div>
  );
}
