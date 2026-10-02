import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, X, Cookie, Settings2, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('kivaro_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    } else {
      setHasInteracted(true);
      setPreferences(JSON.parse(consent));
    }
  }, []);

  const saveConsent = (prefs: typeof preferences) => {
    localStorage.setItem('kivaro_cookie_consent', JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);
    setShowSettings(false);
    setHasInteracted(true);
    
    // Trigger custom event for other components to react to consent changes
    window.dispatchEvent(new CustomEvent('cookie_consent_updated', { detail: prefs }));
  };

  const handleAcceptAll = () => {
    saveConsent({ necessary: true, analytics: true, marketing: true });
  };

  const handleRejectAll = () => {
    saveConsent({ necessary: true, analytics: false, marketing: false });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  return (
    <>
      {/* Permanent Settings Trigger Icon */}
      {hasInteracted && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsVisible(true)}
          className="fixed bottom-6 left-6 z-[60] w-12 h-12 bg-white border border-zinc-200 rounded-full shadow-lg flex items-center justify-center text-zinc-600 hover:text-emerald-600 transition-colors group"
          title="Cookie-Einstellungen"
        >
          <Cookie className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            Privatsphäre-Einstellungen
          </div>
        </motion.button>
      )}

      <AnimatePresence>
        {isVisible && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[70]"
              onClick={() => hasInteracted && setIsVisible(false)}
            />

            {/* Banner Container */}
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.95 }}
              className="fixed bottom-0 left-0 right-0 z-[80] p-4 sm:p-6 md:p-8 flex justify-center pointer-events-none"
            >
              <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl border border-zinc-200 overflow-y-auto max-h-[calc(100vh-2rem)] pointer-events-auto custom-scrollbar">
                {!showSettings ? (
                  <div className="p-8 md:p-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-zinc-900">Ihre Privatsphäre ist uns wichtig</h3>
                        <p className="text-sm text-zinc-500">Kivaro Invest Cookie-Einstellungen</p>
                      </div>
                    </div>

                    <p className="text-zinc-600 leading-relaxed mb-8">
                      Wir nutzen Cookies und ähnliche Technologien, um die Nutzererfahrung auf unserer Website zu verbessern, unseren Datenverkehr zu analysieren und personalisierte Inhalte bereitzustellen. 
                      Weitere Informationen finden Sie in unserer <Link to="/datenschutz" className="text-zinc-900 font-medium underline underline-offset-4 hover:text-emerald-600 transition-colors">Datenschutzerklärung</Link>.
                    </p>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <button
                        onClick={handleAcceptAll}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 text-white rounded-2xl font-semibold hover:bg-zinc-800 transition-all shadow-md active:scale-[0.98]"
                      >
                        <Check className="w-4 h-4" />
                        Alle akzeptieren
                      </button>
                      <button
                        onClick={handleRejectAll}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-zinc-900 border border-zinc-200 rounded-2xl font-semibold hover:bg-zinc-50 transition-all shadow-sm active:scale-[0.98]"
                      >
                        Alle ablehnen
                      </button>
                      <button
                        onClick={() => setShowSettings(true)}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-semibold hover:bg-zinc-200 transition-all sm:col-span-2 lg:col-span-1"
                      >
                        <Settings2 className="w-4 h-4" />
                        Einstellungen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 md:p-10">
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-3">
                        <Settings2 className="w-5 h-5 text-zinc-900" />
                        <h3 className="text-xl font-bold text-zinc-900">Individuelle Einstellungen</h3>
                      </div>
                      <button 
                        onClick={() => setShowSettings(false)} 
                        className="p-2 text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-100 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-4 mb-10">
                      {/* Necessary */}
                      <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-200">
                        <div className="flex items-start justify-between">
                          <div className="pr-4">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-zinc-900">Notwendig</h4>
                              <span className="px-2 py-0.5 bg-zinc-200 text-[10px] font-bold uppercase tracking-wider rounded text-zinc-600">Immer aktiv</span>
                            </div>
                            <p className="text-sm text-zinc-500 leading-relaxed">Diese Cookies sind für den technischen Betrieb der Website zwingend erforderlich und können nicht deaktiviert werden.</p>
                          </div>
                          <div className="relative inline-flex items-center h-6 w-11 shrink-0 cursor-not-allowed opacity-50">
                            <div className="h-6 w-11 rounded-full bg-emerald-500"></div>
                            <div className="absolute left-6 h-4 w-4 rounded-full bg-white"></div>
                          </div>
                        </div>
                      </div>

                      {/* Analytics */}
                      <div className="p-5 bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="pr-4">
                            <h4 className="font-bold text-zinc-900 mb-1">Statistik & Analyse</h4>
                            <p className="text-sm text-zinc-500 leading-relaxed">Helfen uns zu verstehen, wie Besucher mit der Website interagieren (z.B. welche Seiten am beliebtesten sind).</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer h-6 w-11 shrink-0">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={preferences.analytics}
                              onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                            />
                            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                          </label>
                        </div>
                      </div>

                      {/* Marketing */}
                      <div className="p-5 bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="pr-4">
                            <h4 className="font-bold text-zinc-900 mb-1">Marketing</h4>
                            <p className="text-sm text-zinc-500 leading-relaxed">Ermöglichen es uns, Ihnen relevante Inhalte und Werbung anzuzeigen, die auf Ihren Interessen basieren.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer h-6 w-11 shrink-0">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={preferences.marketing}
                              onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                            />
                            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <Link to="/datenschutz" className="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1">
                        Datenschutzerklärung <ExternalLink className="w-3 h-3" />
                      </Link>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => setShowSettings(false)}
                          className="flex-1 sm:flex-none px-6 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                        >
                          Zurück
                        </button>
                        <button
                          onClick={handleSavePreferences}
                          className="flex-1 sm:flex-none px-8 py-3 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all shadow-md"
                        >
                          Auswahl speichern
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

