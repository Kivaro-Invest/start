// Merkt sich beim ersten Seitenaufruf, woher der Besucher kam (z. B. Flyer-QR-Code).
// Bewusst nur im Arbeitsspeicher – kein Cookie, kein localStorage, daher keine Einwilligung nötig.

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landingPage: string;
  referrer?: string;
};

const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

let captured: Attribution | null = null;

export function captureAttribution(): Attribution {
  if (captured) return captured;
  const params = new URLSearchParams(window.location.search);
  const result: Attribution = { landingPage: window.location.pathname + window.location.search };
  for (const key of KEYS) {
    const value = params.get(key);
    if (value) result[key] = value.slice(0, 100);
  }
  if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
    result.referrer = document.referrer.slice(0, 200);
  }
  captured = result;
  return result;
}

export function getAttribution(): Attribution {
  return captured ?? captureAttribution();
}
