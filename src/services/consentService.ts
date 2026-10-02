type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export const getConsent = (): CookiePreferences => {
  const consent = localStorage.getItem('kivaro_cookie_consent');
  if (!consent) {
    return { necessary: true, analytics: false, marketing: false };
  }
  try {
    return JSON.parse(consent);
  } catch {
    return { necessary: true, analytics: false, marketing: false };
  }
};

export const onConsentChange = (callback: (prefs: CookiePreferences) => void) => {
  const handler = (event: any) => {
    callback(event.detail);
  };
  window.addEventListener('cookie_consent_updated', handler);
  return () => window.removeEventListener('cookie_consent_updated', handler);
};

// Example usage for analytics
export const initAnalytics = () => {
  const prefs = getConsent();
  if (prefs.analytics) {
    console.log('Initializing Analytics...');
    // Add your GA4 / GTM code here
  }
};

export const initMarketing = () => {
  const prefs = getConsent();
  if (prefs.marketing) {
    console.log('Initializing Marketing scripts...');
    // Add your Facebook Pixel / Ads code here
  }
};
