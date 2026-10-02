import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BadgeCheck, Landmark, Handshake, BadgeEuro, ArrowRight, CheckCircle2, XCircle, TrendingUp, ShieldCheck, Clock, Building, Users, FileText, ChevronDown, ChevronLeft, ChevronRight, Star, MapPin, Plus, X } from 'lucide-react';
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
  },
  {
    question: "Welche Risiken gibt es?",
    answer: "Mietausfall, Leerstand, Instandhaltung und Zinsänderungen nach Ablauf der Zinsbindung. Eine Immobilie ist langfristig gebunden und nicht kurzfristig verkäuflich. Wir sprechen diese Punkte im Erstgespräch offen mit dir an."
  }
];

function FAQItem({ question, answer, isOpen, onClick }: { key?: number, question: string, answer: string, isOpen: boolean, onClick: () => void }) {
  return (
    <div className="border-b border-zinc-200 last:border-0">
      <button
        className="flex w-full items-center justify-between py-6 text-left focus:outline-none group"
        onClick={onClick}
      >
        <span className="text-lg font-semibold text-zinc-900 group-hover:text-emerald-600 transition-colors pr-8">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-zinc-400 group-hover:text-emerald-500 transition-colors"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
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
            <p className="pb-6 text-zinc-600 leading-relaxed pr-12">
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
    lage: 'Theresienstraße · Zentrum',
    titel: 'Modernisierter Altbau im Zentrum',
    bilder: [
      { src: '/objekte/schweinfurt-fassade.webp', alt: 'Fassade des Objekts in Schweinfurt' },
      { src: '/objekte/schweinfurt-wohnraum.webp', alt: 'Wohnraum nach Modernisierung' },
      { src: '/objekte/schweinfurt-bad.webp', alt: 'Modernisiertes Bad' },
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
    lage: 'Straubinger Straße · Landkreis Deggendorf',
    titel: 'Charmanter Altbau in zentraler Lage',
    bilder: [
      { src: '/objekte/plattling-fassade.webp', alt: 'Fassade des Objekts in Plattling' },
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
    <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
      <div className="relative">
        <img src={p.bilder[0].src} alt={p.bilder[0].alt} className="w-full aspect-[3/2] object-cover" loading="lazy" />
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-900 shadow">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {p.ort}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1 bg-white">
        {p.bilder.slice(1).map((b) => (
          <img key={b.src} src={b.src} alt={b.alt} className="w-full aspect-[4/3] object-cover" loading="lazy" />
        ))}
      </div>
      <div className="p-6 sm:p-8 flex flex-col flex-1">
        <p className="text-sm text-zinc-500">{p.lage}</p>
        <h4 className="mt-1 text-2xl font-bold text-zinc-900">{p.titel}</h4>
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
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-4 font-semibold text-white hover:bg-zinc-800 transition-colors"
        >
          Interesse? Investment-Check starten <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function scrollToCheck() {
  document.getElementById('investment-check-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function MobileStickyCta({ heroCtaRef, checkRef }: { heroCtaRef: RefObject<HTMLDivElement | null>; checkRef: RefObject<HTMLElement | null> }) {
  const [heroVisible, setHeroVisible] = useState(true);
  const [checkVisible, setCheckVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === heroCtaRef.current) setHeroVisible(e.isIntersecting);
        if (e.target === checkRef.current) setCheckVisible(e.isIntersecting);
      }
    }, { threshold: 0.05 });
    if (heroCtaRef.current) obs.observe(heroCtaRef.current);
    if (checkRef.current) obs.observe(checkRef.current);
    return () => obs.disconnect();
  }, [heroCtaRef, checkRef]);

  const show = !heroVisible && !checkVisible;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-40 md:hidden border-t border-zinc-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <button
            type="button"
            onClick={scrollToCheck}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-4 text-base font-semibold text-white shadow-lg"
          >
            Kostenlosen Investment-Check starten <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLElement>(null);
  const teamWithPhotos = team.filter((m) => m.photo);

  return (
    <div className="w-full">
      {/* Hero mit Erklärvideo */}
      <section className="relative pt-10 pb-16 lg:pt-20 lg:pb-24 overflow-hidden bg-zinc-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-zinc-200 shadow-sm mb-6"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Kapitalanlage-Immobilien</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.1] mb-5"
            >
              Dein Mieter zahlt.<br />
              <span className="text-zinc-400">Du baust Vermögen auf.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg lg:text-xl text-zinc-600 leading-relaxed mb-8 lg:mb-10"
            >
              Schau dir in 60 Sekunden an, wie du mit dem Geld der Bank eine Wohnung kaufst, die dein Mieter mit abbezahlt und die am Ende dir gehört. Steuervorteile inklusive.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ExplainerVideo onCta={scrollToCheck} />
          </motion.div>

          <div ref={heroCtaRef} className="mt-8 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={scrollToCheck}
              className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-8 py-4 text-base sm:text-lg font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Kostenlosen Investment-Check starten
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-zinc-500">1 Minute · kostenlos · unverbindlich</p>
          </div>

          {/* Vertrauensleiste */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: <BadgeCheck className="w-6 h-6" />, title: 'Zugelassen nach § 34c GewO', text: 'Offizielle Erlaubnis als Immobilienmakler' },
              { icon: <Landmark className="w-6 h-6" />, title: 'Passende Finanzierung', text: 'Über zugelassene Finanzierungsexperten' },
              { icon: <BadgeEuro className="w-6 h-6" />, title: '0 € Käuferprovision', text: 'Wir arbeiten direkt mit Bauträgern' },
              { icon: <Handshake className="w-6 h-6" />, title: 'Persönliche Begleitung', text: 'Vom Erstgespräch bis zum Notartermin' },
            ].map((t) => (
              <div key={t.title} className="flex flex-col sm:flex-row items-start gap-3 rounded-2xl bg-white border border-zinc-200 p-4 sm:p-5">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">{t.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 leading-snug">{t.title}</p>
                  <p className="text-xs text-zinc-500 leading-snug mt-0.5">{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment-Check */}
      <section id="investment-check" ref={checkRef} className="scroll-mt-24 py-10 sm:py-16 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-6 lg:gap-16 items-start">
            <div className="lg:col-span-2 lg:sticky lg:top-32">
              <h2 className="text-sm font-semibold text-emerald-600 tracking-wider uppercase mb-3">Investment-Check</h2>
              <h3 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-zinc-900 tracking-tight mb-4 lg:mb-6">Finde heraus, was mit Immobilien für dich möglich ist.</h3>
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

      {/* Aktuelle Projekte */}
      <section className="py-24 lg:py-32 bg-zinc-50 border-y border-zinc-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
            <h2 className="text-sm font-semibold text-emerald-600 tracking-wider uppercase mb-3">Aktuelle Projekte</h2>
            <h3 className="text-3xl lg:text-5xl font-bold text-zinc-900 tracking-tight">Wohnungen aus der Region</h3>
            <p className="mt-6 text-lg text-zinc-600">Saniert, vermietbar und mit Hausverwaltung – so sehen Objekte aus, die wir vermitteln.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {projekte.map((p) => <ProjektKarte key={p.ort} p={p} />)}
          </div>
          <p className="mt-8 text-center text-xs text-zinc-500">Angaben laut Bauträger, ohne Gewähr. Bilder teilweise Beispielwohnungen. Verfügbarkeit auf Anfrage.</p>
        </div>
      </section>

      {/* Team – erscheint automatisch, sobald Fotos hinterlegt sind (src/lib/team.ts) */}
      {teamWithPhotos.length > 0 && (
        <section className="py-24 lg:py-32 bg-zinc-50 border-y border-zinc-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-sm font-semibold text-emerald-600 tracking-wider uppercase mb-3">Wer hinter Kivaro steht</h2>
              <h3 className="text-3xl lg:text-5xl font-bold text-zinc-900 tracking-tight">Persönlich statt anonym.</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {teamWithPhotos.map((m) => (
                <div key={m.name} className="bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-sm">
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

      {/* Comparison Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
            <h2 className="text-sm font-semibold text-emerald-600 tracking-wider uppercase mb-3">Der smarte Vergleich</h2>
            <h3 className="text-3xl lg:text-5xl font-bold text-zinc-900 tracking-tight">Allein kaufen oder begleitet kaufen?</h3>
            <p className="mt-6 text-lg text-zinc-600">Ein Kauf in Eigenregie ist oft mühsam und fehleranfällig. Mit Kivaro Invest hast du einen Ansprechpartner, der dich vom ersten Gespräch bis zum Notartermin begleitet.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <div className="bg-zinc-50 rounded-3xl p-8 lg:p-12 border border-zinc-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <XCircle className="w-32 h-32" />
              </div>
              <h4 className="text-2xl font-bold text-zinc-400 mb-8 flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-400" />
                Ohne Kivaro
              </h4>
              <ul className="space-y-6 relative z-10">
                {[
                  "Käuferprovision von oft rund 3,5 Prozent",
                  "Suche auf Portalen, viele Mitbewerber je Objekt",
                  "Mühsame Suche nach einer passenden Bank",
                  "Steuerliche Vorteile bleiben oft ungenutzt",
                  "Sanierungsrisiken, Handwerker schwer zu finden",
                  "Viel Zeitaufwand für die Mietersuche"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-zinc-500">
                    <XCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-zinc-900 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <CheckCircle2 className="w-32 h-32" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                Mit Kivaro
              </h4>
              <ul className="space-y-6 relative z-10">
                {[
                  "0 € Käuferprovision",
                  "Hausverwaltung über den Bauträger inklusive",
                  "Kontakt zu zugelassenen Finanzierungsexperten",
                  "Sanierung vor Übergabe durch den Bauträger",
                  "Je nach Objekt mit Mietgarantie des Bauträgers",
                  "Inklusive Unterlagen für den Steuerberater"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-zinc-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed text-white font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-12 pt-8 border-t border-zinc-800 relative z-10">
                <button type="button" onClick={scrollToCheck} className="inline-flex w-full justify-center items-center gap-2 px-6 py-4 text-sm font-semibold text-zinc-900 bg-white hover:bg-zinc-100 rounded-xl transition-colors">
                  Investment-Check starten
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 lg:py-32 bg-zinc-50 border-y border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
            <h2 className="text-sm font-semibold text-emerald-600 tracking-wider uppercase mb-3">Der Ablauf</h2>
            <h3 className="text-3xl lg:text-5xl font-bold text-zinc-900 tracking-tight">Auf Augenhöhe zur eigenen Immobilie.</h3>
            <p className="mt-6 text-lg text-zinc-600">Nicht nur kaufen, sondern verstehen: Kivaro Invest begleitet dich transparent und persönlich durch jeden Schritt.</p>
          </div>

          <div className="relative mb-16 lg:mb-24 overflow-hidden rounded-3xl shadow-xl">
            <img src="/objekte/region-stadt.webp" alt="Marktplatz in Schweinfurt" className="w-full aspect-[16/9] sm:aspect-[21/9] object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-zinc-950/10 to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8 text-white text-lg sm:text-2xl font-semibold">Wohnungen in starken Städten der Region – saniert, vermietbar, verwaltet.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-200"></div>

            {[
              {
                step: "01",
                title: "Investment-Check & Gespräch",
                desc: "Du machst den Check, wir melden uns bei dir und lernen dich und deine Ziele in einem kostenlosen Erstgespräch kennen.",
                icon: <Users className="w-6 h-6" />
              },
              {
                step: "02",
                title: "Finanzierung",
                desc: "Wir bringen dich mit zugelassenen Finanzierungsexperten zusammen, die mit dir die passende Finanzierung erarbeiten.",
                icon: <FileText className="w-6 h-6" />
              },
              {
                step: "03",
                title: "Deine Immobilie",
                desc: "Du bekommst Zugang zu passenden Objekten und wir begleiten dich bis zum Notartermin und darüber hinaus.",
                icon: <TrendingUp className="w-6 h-6" />
              }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-zinc-50 shadow-xl flex items-center justify-center mb-8 relative">
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center shadow-md">{item.step}</span>
                  <div className="text-zinc-400">{item.icon}</div>
                </div>
                <h4 className="text-xl font-bold text-zinc-900 mb-4">{item.title}</h4>
                <p className="text-zinc-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-sm font-semibold text-emerald-600 tracking-wider uppercase mb-3">FAQ</h2>
            <h3 className="text-3xl lg:text-5xl font-bold text-zinc-900 tracking-tight">Häufig gestellte Fragen</h3>
          </div>
          <div className="border-y border-zinc-200">
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

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-zinc-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-zinc-900 rounded-[2.5rem] p-8 sm:p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl">
            <img src="/objekte/plattling-isar.webp" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-zinc-950/75"></div>
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight mb-6">
                Bereit für dein erstes Investment?
              </h2>
              <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto">
                Mach den kostenlosen Investment-Check und finde heraus, was eine Kapitalanlage-Immobilie für dich bringt.
              </p>
              <button type="button" onClick={scrollToCheck} className="inline-flex justify-center items-center gap-2 px-8 py-4 text-base font-semibold text-zinc-900 bg-white hover:bg-zinc-100 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                Investment-Check starten
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <MobileStickyCta heroCtaRef={heroCtaRef} checkRef={checkRef} />
    </div>
  );
}
