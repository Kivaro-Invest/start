// Speichert die Cookie-Entscheidung des Besuchers (nur diese Entscheidung, sonst nichts).
// Ohne „granted“ wird der Meta Pixel nicht geladen und keine Conversions-API-Daten werden gesendet.

const KEY = 'kivaro_consent_marketing_v1';

export type ConsentState = 'granted' | 'denied' | null;

export function getConsent(): ConsentState {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

function deleteMetaCookies() {
  const host = window.location.hostname;
  for (const name of ['_fbp', '_fbc']) {
    for (const domain of ['', `; domain=${host}`, `; domain=.${host.replace(/^www\./, '')}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
  }
}

export function setConsent(value: 'granted' | 'denied') {
  const before = getConsent();
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    /* Speicher gesperrt: Entscheidung gilt nur für diesen Seitenaufruf */
  }
  window.dispatchEvent(new CustomEvent('kivaro-consent-change', { detail: value }));
  if (value === 'denied' && before === 'granted') {
    // Widerruf: Cookies löschen und Seite neu laden, damit der bereits geladene Pixel verschwindet
    deleteMetaCookies();
    window.location.reload();
  }
}

export function openConsentSettings() {
  window.dispatchEvent(new Event('kivaro-open-consent'));
}
