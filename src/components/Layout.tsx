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
    { name: 'Steuerrechner', path: '/rechner' },
    { name: 'Downloads', path: '/downloads' },
    { name: 'Kontakt', path: '/kontakt' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-zinc-200/50 shadow-sm py-3 lg:py-5' : 'bg-white py-6 lg:py-12'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/black-transparent-2.svg" alt="Kivaro Invest" className={`w-auto group-hover:scale-105 transition-all duration-300 ${isScrolled ? 'h-16 md:h-20 lg:h-24 -my-2 md:-my-4 lg:-my-6' : 'h-24 md:h-32 lg:h-40 -my-4 md:-my-8 lg:-my-12'}`} referrerPolicy="no-referrer" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/kontakt"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Erstgespräch
              <ArrowRight className="w-4 h-4" />
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-zinc-600 hover:text-zinc-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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
                className={`block px-4 py-3 rounded-xl text-base font-medium ${location.pathname === link.path ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 px-4">
              <Link
                to="/kontakt"
                className="flex w-full items-center justify-center gap-2 px-5 py-3 text-base font-medium text-white bg-zinc-900 rounded-xl shadow-md"
              >
                Erstgespräch
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
    <footer className="bg-zinc-950 text-zinc-400 py-16 lg:py-24 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <img src="/white-transparent.svg" alt="Kivaro Invest" className="h-24 md:h-32 lg:h-40 w-auto -mt-4 md:-mt-8 lg:-mt-12 -mb-4 md:-mb-8 lg:-mb-12" referrerPolicy="no-referrer" />
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Intelligent investieren, Steuern sparen und Vermögen aufbauen. Ihr Partner für exklusive Off-Market-Immobilien in Deutschland.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Navigation</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-sm hover:text-white transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Startseite</Link></li>
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
        
        <div className="mt-16 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} Kivaro Invest. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <Header />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
