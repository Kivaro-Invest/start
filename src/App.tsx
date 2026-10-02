/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { captureAttribution } from './lib/attribution';

// Herkunft (z. B. Flyer-QR-Code mit utm_source) direkt beim ersten Aufruf merken
captureAttribution();

const Home = lazy(() => import('./pages/Home'));
const Downloads = lazy(() => import('./pages/Downloads'));
const Kontakt = lazy(() => import('./pages/Kontakt'));
const Impressum = lazy(() => import('./pages/Impressum'));
const Datenschutz = lazy(() => import('./pages/Datenschutz'));
const InvestmentCheckPage = lazy(() => import('./pages/InvestmentCheckPage'));

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
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
    </Router>
  );
}
