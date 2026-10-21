import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getConsent, setConsent, type ConsentState } from '../lib/consent';
import { loadMetaPixel, trackPageView } from '../lib/metaPixel';

// Cookie-Hinweis + Steuerung des Meta Pixels. Beide Buttons sind bewusst gleich gestaltet.
export default function CookieBanner() {
  const [consent, setState] = useState<ConsentState>(() => getConsent());
  const [open, setOpen] = useState<boolean>(() => getConsent() === null);
  const location = useLocation();
  const firstRoute = useRef(true);

  useEffect(() => {
    if (consent === 'granted') loadMetaPixel();
  }, [consent]);

  // Seitenwechsel innerhalb der App zählt als PageView (der erste wird beim Laden des Pixels gesendet)
  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    if (consent === 'granted') trackPageView();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const reopen = () => setOpen(true);
    window.addEventListener('kivaro-open-consent', reopen);
    return () => window.removeEventListener('kivaro-open-consent', reopen);
  }, []);

  const choose = (value: 'granted' | 'denied') => {
    setConsent(value);
    setState(value);
    setOpen(false);
  };

  if (!open) return null;

  const btn =
    'flex-1 sm:flex-none sm:min-w-[140px] rounded-md bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors';

  return (
    <div role="dialog" aria-label="Cookie-Einstellungen" className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl">
        <p className="text-sm leading-relaxed text-zinc-700">
          <strong className="text-zinc-900">Cookies und Werbemessung.</strong> Mit deiner Zustimmung nutzen wir den Meta Pixel
          (Meta Platforms Ireland Ltd.), um zu messen, ob unsere Anzeigen auf Instagram und Facebook wirken. Dabei werden Cookies
          gesetzt und Daten an Meta übertragen. Lehnst du ab, passiert das nicht und die Seite funktioniert genauso. Du kannst deine
          Entscheidung jederzeit im Footer unter „Cookie-Einstellungen“ ändern. Mehr dazu in der{' '}
          <Link to="/datenschutz" className="underline underline-offset-2" onClick={() => setOpen(false)}>
            Datenschutzerklärung
          </Link>
          .
        </p>
        <div className="mt-4 flex gap-3 sm:justify-end">
          <button type="button" className={btn} onClick={() => choose('denied')}>
            Ablehnen
          </button>
          <button type="button" className={btn} onClick={() => choose('granted')}>
            Akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
