/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CookieBanner from './components/CookieBanner';
import ScrollToTop from './components/ScrollToTop';
import { initAnalytics, initMarketing, onConsentChange } from './services/consentService';

const Home = lazy(() => import('./pages/Home'));
const Downloads = lazy(() => import('./pages/Downloads'));
const Kontakt = lazy(() => import('./pages/Kontakt'));
const Impressum = lazy(() => import('./pages/Impressum'));
const Datenschutz = lazy(() => import('./pages/Datenschutz'));
const Rechner = lazy(() => import('./pages/Rechner'));

export default function App() {
  useEffect(() => {
    // Initial check
    initAnalytics();
    initMarketing();

    // Listen for changes
    const unsubscribe = onConsentChange((prefs) => {
      if (prefs.analytics) initAnalytics();
      if (prefs.marketing) initMarketing();
    });

    return unsubscribe;
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/kontakt" element={<Kontakt />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="/rechner" element={<Rechner />} />
          </Routes>
        </Suspense>
        <CookieBanner />
      </Layout>
    </Router>
  );
}
