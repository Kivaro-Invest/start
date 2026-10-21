import { openConsentSettings } from '../lib/consent';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Menu, X, ArrowRight, ChevronRight, Phone, Mail, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Startseite', path: '/' },
    { name: 'Downloads', path: '/downloads' },
    { name: 'Kontakt', path: '/kontakt' },
  ];

  const goToCheck = (e: { preventDefault: () => void }) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      document.getElementById('investment-check-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${isScrolled ? 'shadow-[0_2px_16px_-6px_rgba(15,23,42,0.18)]' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] lg:h-[88px] items-center justify-between">
          <div className="flex items-center gap-10 xl:gap-14">
            <Link to="/" className="flex items-center shrink-0" aria-label="Kivaro Invest – zur Startseite">
              <img src="/logo-kivaro.svg" alt="Kivaro Invest" width={254} height={164} className="h-11 lg:h-16 w-auto" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8 lg:gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-base font-medium transition-colors ${location.pathname + location.hash === link.path ? 'text-emerald-700' : 'text-zinc-900 hover:text-emerald-700'}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <Link
            to="/#investment-check"
            onClick={goToCheck}
            className="hidden md:inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm"
          >
            Investment-Check
          </Link>

          {/* Mobil: kleiner Check-Button oben (erscheint beim Scrollen) + Menü */}
          <div className="md:hidden flex items-center gap-1">
            <Link
              to="/#investment-check"
              onClick={goToCheck}
              tabIndex={isScrolled ? 0 : -1}
              aria-hidden={!isScrolled}
              className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}`}
            >
              Check starten
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              className="p-2 text-zinc-900"
              aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-white border-b border-zinc-200 shadow-xl md:hidden"
        >
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`block px-4 py-3 rounded-xl text-base font-medium ${location.pathname + location.hash === link.path ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 px-4">
              <Link
                to="/#investment-check"
                onClick={goToCheck}
                className="flex w-full items-center justify-center gap-2 px-5 py-3 text-base font-semibold text-white bg-emerald-600 rounded-xl shadow-md"
              >
                Kostenloser Investment-Check
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 py-16 lg:py-24 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo-kivaro-weiss.svg" alt="Kivaro Invest" width={254} height={164} className="h-16 lg:h-20 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Intelligent investieren, Steuern sparen und Vermögen aufbauen. Dein Partner für Kapitalanlage-Immobilien in Deutschland.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Navigation</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-sm hover:text-white transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Startseite</Link></li>
              <li><Link to="/investment-check" className="text-sm hover:text-white transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Investment-Check</Link></li>
              <li><Link to="/downloads" className="text-sm hover:text-white transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Downloads & Ressourcen</Link></li>
              <li><Link to="/kontakt" className="text-sm hover:text-white transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Kontakt</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-6">Rechtliches</h3>
            <ul className="space-y-4">
              <li><Link to="/impressum" className="text-sm hover:text-white transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Impressum</Link></li>
              <li><Link to="/datenschutz" className="text-sm hover:text-white transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Datenschutzerklärung</Link></li>
              <li><button type="button" onClick={openConsentSettings} className="text-sm hover:text-white transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Cookie-Einstellungen</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-6">Kontakt</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                <span className="text-sm">Tölzer Str. 1<br/>82031 Grünwald</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-zinc-500 shrink-0" />
                <a href="mailto:kontakt@kivaro-invest.de" className="text-sm hover:text-white transition-colors">kontakt@kivaro-invest.de</a>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-400">
            &copy; {new Date().getFullYear()} Kivaro Invest UG (haftungsbeschränkt). Alle Rechte vorbehalten.
          </p>
          <p className="text-sm text-zinc-400">
            Immobilienmakler mit Erlaubnis nach § 34c GewO
          </p>
        </div>
        <p className="mt-6 text-xs text-zinc-400 leading-relaxed max-w-4xl">
          Alle Angaben dienen der allgemeinen Information und sind keine Rechts-, Steuer- oder Anlageberatung. Renditen und Steuervorteile sind Beispielrechnungen ohne Gewähr. Jede Kapitalanlage ist mit Risiken verbunden. Für die steuerliche Beurteilung im Einzelfall wende dich an deinen Steuerberater.
        </p>
      </div>
    </footer>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <Header />
      <main className="flex-grow pt-[72px] lg:pt-[88px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
