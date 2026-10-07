import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { CONTACT_CONSENT_TEXT, CONTACT_CONSENT_VERSION } from '../lib/investmentCheck';

export default function Kontakt() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [consent, setConsent] = useState(false);
  const [consentMissing, setConsentMissing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setConsentMissing(true);
      return;
    }
    setFormState('submitting');
    setErrorMessage('');

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      ...Object.fromEntries(formData.entries()),
      consent: { given: consent, version: CONTACT_CONSENT_VERSION },
      pageUrl: window.location.href,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setFormState('success');
        setConsent(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error:', errorData);
        // Show the specific error from the server if available
        const msg = errorData.error || errorData.details || `Server-Fehler (${response.status})`;
        setErrorMessage(msg);
        setFormState('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('Verbindungsfehler zum Server.');
      setFormState('error');
    }
  };

  return (
    <div className="w-full bg-white min-h-screen pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* Contact Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg"
            >
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 mb-6">
                Schreib uns
              </h1>
              <p className="text-lg text-zinc-600 leading-relaxed mb-12">
                Schreib uns einfach über das Formular – wir melden uns schnellstmöglich bei dir. Noch schneller geht's mit dem <Link to="/investment-check" className="text-zinc-900 font-medium underline underline-offset-4 hover:text-emerald-600">Investment-Check</Link>.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-1">Standort</h3>
                    <p className="text-zinc-600 leading-relaxed">Tölzer Str. 1<br />82031 Grünwald</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-1">E-Mail</h3>
                    <a href="mailto:kontakt@kivaro-invest.de" className="text-zinc-600 hover:text-zinc-900 transition-colors">kontakt@kivaro-invest.de</a>
                  </div>
                </div>
              </div>

              <div className="mt-16 p-8 bg-zinc-900 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <CheckCircle2 className="w-32 h-32" />
                </div>
                <h3 className="text-xl font-bold mb-4 relative z-10">Persönlich begleitet – vom Erstgespräch bis zum Notartermin.</h3>
                <p className="text-zinc-400 text-sm leading-relaxed relative z-10">
                  Wir arbeiten direkt mit Bauträgern zusammen. Für dich fällt keine Käuferprovision an.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-50 rounded-[2.5rem] p-8 sm:p-12 border border-zinc-200 shadow-xl"
          >
            {formState === 'success' ? (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-4">Vielen Dank!</h3>
                <p className="text-zinc-600 mb-8">Das Formular wurde erfolgreich übermittelt. Wir melden uns in Kürze bei dir.</p>
                <button 
                  onClick={() => setFormState('idle')}
                  className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
                >
                  Weitere Nachricht senden
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {formState === 'error' && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Fehler beim Absenden.</p>
                      <p className="text-red-600/90">{errorMessage || 'Bitte prüf deine Eingaben und versuch es nochmal.'}</p>
                    </div>
                  </div>
                )}
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-zinc-900">Vorname</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      name="firstName"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                      placeholder="Max"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-zinc-900">Nachname</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      name="lastName"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                      placeholder="Mustermann"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-zinc-900">E-Mail Adresse</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    placeholder="max@beispiel.de"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-zinc-900">Rufnummer</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    placeholder="+49 123 456789"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-zinc-900">Deine Nachricht</label>
                  <textarea 
                    id="message" 
                    name="message"
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all resize-none"
                    placeholder="Wie können wir dir helfen?"
                  ></textarea>
                </div>

                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${consentMissing && !consent ? 'border-red-300 bg-red-50' : 'border-zinc-200 bg-white hover:bg-zinc-100'}`}>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (e.target.checked) setConsentMissing(false);
                    }}
                    className="mt-1 w-5 h-5 shrink-0 rounded accent-emerald-600"
                  />
                  <span className="text-sm text-zinc-600 leading-relaxed">
                    {CONTACT_CONSENT_TEXT} Mehr dazu in der{' '}
                    <Link to="/datenschutz" target="_blank" className="underline hover:text-zinc-900">Datenschutzerklärung</Link>.
                  </span>
                </label>
                {consentMissing && !consent && (
                  <p className="-mt-3 text-sm text-red-600">Bitte bestätige, dass wir dich kontaktieren dürfen – sonst können wir dir nicht antworten.</p>
                )}

                <button 
                  type="submit" 
                  disabled={formState === 'submitting'}
                  className="w-full flex justify-center items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {formState === 'submitting' ? 'Wird gesendet...' : 'Nachricht absenden'}
                  {!formState && <Send className="w-4 h-4" />}
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}
