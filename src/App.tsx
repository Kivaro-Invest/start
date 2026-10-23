/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import CookieBanner from './components/CookieBanner';
import { captureAttribution } from './lib/attribution';

// Herkunft (z. B. Flyer-QR-Code mit utm_source) direkt beim ersten Aufruf merken
captureAttribution();

const Home = lazy(() => import('./pages/Home'));
const Downloads = lazy(() => import('./pages/Downloads'));
const Kontakt = lazy(() => import('./pages/Kontakt'));
const Impressum = lazy(() => import('./pages/Impressum'));
const Datenschutz = lazy(() => import('./pages/Datenschutz'));
const InvestmentCheckPage = lazy(() => import('./pages/InvestmentCheckPage'));
const ContentPage = lazy(() => import('./pages/content/ContentPage'));

const spinner = <div className="min-h-screen bg-zinc-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Interner Content-Kalender: eigenes Layout, kein Cookie-Banner, nicht indexiert */}
        <Route path="/content/*" element={<Suspense fallback={spinner}><ContentPage /></Suspense>} />
        <Route path="*" element={<PublicSite />} />
      </Routes>
    </Router>
  );
}

function PublicSite() {
  return (
    <>
      <CookieBanner />
      <Layout>
        <Suspense fallback={spinner}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/investment-check" element={<InvestmentCheckPage />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/kontakt" element={<Kontakt />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            {/* Alter Rechner-Link leitet auf den Check um */}
            <Route path="/rechner" element={<Navigate to="/investment-check" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </>
  );
}
