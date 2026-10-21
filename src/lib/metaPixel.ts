// Meta Pixel – wird ausschließlich nach Einwilligung geladen (siehe CookieBanner).
export const META_PIXEL_ID = '1314697794095371';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

let loaded = false;

export function loadMetaPixel() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  if (window.fbq) return;
  const n: any = (window.fbq = function (...args: unknown[]) {
    n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
  });
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
  n('init', META_PIXEL_ID);
  n('track', 'PageView');
}

export function trackPageView() {
  window.fbq?.('track', 'PageView');
}

// eventId muss identisch an die Conversions API gehen, damit Meta nicht doppelt zählt
export function trackLead(eventId: string) {
  window.fbq?.('track', 'Lead', {}, { eventID: eventId });
}

function cookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : undefined;
}

// _fbp/_fbc für die Conversions API (Zuordnung Anzeige → Lead). Nur bei Einwilligung verwenden.
export function getFbIdentifiers(fbclid?: string) {
  const fbp = cookie('_fbp');
  let fbc = cookie('_fbc');
  if (!fbc && fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
  return { fbp, fbc };
}
