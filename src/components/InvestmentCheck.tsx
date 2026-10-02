import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Lock, Phone, Clock, ShieldCheck } from 'lucide-react';
import {
  CONSENT_TEXT,
  CONSENT_VERSION,
  visibleQuestions,
  type Answers,
  type QuestionId,
} from '../lib/investmentCheck';
import { getAttribution } from '../lib/attribution';

type Status = 'idle' | 'submitting' | 'finishing' | 'success' | 'error';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const inputClass =
  'w-full px-4 py-3.5 rounded-xl border border-zinc-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all';

function cleanPhone(raw: string) {
  return raw.replace(/[^\d+]/g, '');
}

function phoneLooksValid(raw: string) {
  const digits = raw.replace(/\D/g, '');
  return /^[+\d][\d\s/()-]*$/.test(raw.trim()) && digits.length >= 8 && digits.length <= 15;
}

export default function InvestmentCheck() {
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [contact, setContact] = useState({ firstName: '', phone: '', email: '' });
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(Date.now());

  const questions = useMemo(() => visibleQuestions(answers), [answers]);
  const totalSteps = questions.length + 1; // + Kontakt
  const isContactStep = stepIndex >= questions.length;
  const progress = status === 'success' || status === 'finishing' ? 100 : Math.round(((stepIndex + 1) / (totalSteps + 1)) * 100);

  useEffect(() => {
    // Fokus auf die neue Frage setzen (Screenreader & Tastatur), ohne die Seite springen zu lassen
    if (stepIndex > 0 || status === 'success') {
      headingRef.current?.focus({ preventScroll: true });
      // Auf dem Handy: neue Frage wieder oben ins Bild holen, falls der Nutzer gescrollt hat
      const top = cardRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 70) cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [stepIndex, status]);

  const choose = (id: QuestionId, value: string) => {
    const next: Answers = { ...answers, [id]: value };
    // Probezeit-Antwort verwerfen, wenn jemand nicht (mehr) angestellt ist
    if (id === 'beruf' && value !== 'angestellt') delete next.probezeit;
    setAnswers(next);
    setDirection(1);
    window.setTimeout(() => setStepIndex((i) => Math.min(i + 1, visibleQuestions(next).length)), 220);
  };

  const back = () => {
    setDirection(-1);
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const firstNameOk = contact.firstName.trim().length >= 2;
  const phoneOk = phoneLooksValid(contact.phone);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email.trim());
  const formOk = firstNameOk && phoneOk && emailOk && consent;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!formOk || status === 'submitting' || status === 'finishing') return;
    setStatus('submitting');
    setErrorMessage('');
    try {
      const minDelay = sleep(1600); // Ladeanzeige mindestens kurz zeigen
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          contact: {
            firstName: contact.firstName.trim(),
            phone: cleanPhone(contact.phone),
            email: contact.email.trim(),
          },
          consent: { given: consent, version: CONSENT_VERSION, text: CONSENT_TEXT },
          attribution: getAttribution(),
          pageUrl: window.location.href,
          secondsToComplete: Math.round((Date.now() - startedAt.current) / 1000),
          website: honeypot,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Fehler ${res.status}`);
      }
      await minDelay;
      setStatus('finishing'); // Balken läuft auf 100 %
      await sleep(450);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message || 'Verbindungsfehler');
    }
  };

  const current = questions[stepIndex];

  return (
    <div ref={cardRef} id="investment-check-card" className="scroll-mt-24 bg-white rounded-[2rem] border border-zinc-200 shadow-xl overflow-hidden">
      {/* Fortschritt – während der Übermittlung ausgeblendet */}
      <div className={`px-6 sm:px-10 pt-6 sm:pt-8 ${status === 'submitting' || status === 'finishing' ? 'invisible' : ''}`}>
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
          <span>{status === 'success' ? 'Geschafft' : `Schritt ${Math.min(stepIndex + 1, totalSteps)} von ${totalSteps}`}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden" aria-hidden="true">
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            initial={false}
            animate={{ width: `${Math.max(progress, 4)}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="px-6 sm:px-10 pt-8 pb-8 sm:pb-10 min-h-[420px]">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          {status === 'submitting' || status === 'finishing' ? (
            <motion.div
              key="sending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center py-16"
              role="status"
              aria-live="polite"
            >
              <div className="relative w-16 h-16 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-100" />
                {status === 'finishing' ? (
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 rounded-full bg-emerald-500 text-white flex items-center justify-center"
                  >
                    <Check className="w-8 h-8" />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                )}
              </div>
              <p className="text-xl font-semibold text-zinc-900 mb-6">
                {status === 'finishing' ? 'Übermittelt!' : 'Dein Investment-Check wird übermittelt …'}
              </p>
              <div className="w-full max-w-xs h-2 rounded-full bg-zinc-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  initial={{ width: '0%' }}
                  animate={{ width: status === 'finishing' ? '100%' : '96%' }}
                  transition={status === 'finishing' ? { duration: 0.3, ease: 'easeOut' } : { duration: 1.4, ease: [0.1, 0.7, 0.3, 1] }}
                />
              </div>
              <p className={`mt-4 text-sm text-zinc-500 ${status === 'finishing' ? 'invisible' : ''}`}>Bitte kurz warten und die Seite nicht schließen.</p>
            </motion.div>
          ) : status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 ref={headingRef} tabIndex={-1} className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3 outline-none">
                Danke, {contact.firstName.trim()}!
              </h3>
              <p className="text-zinc-600 text-lg mb-8">
                Dein Investment-Check ist bei uns. Wir rufen dich in der Regel innerhalb von 24 Stunden unter{' '}
                <span className="font-semibold text-zinc-900 whitespace-nowrap">{contact.phone}</span> an.
              </p>
              <div className="text-left bg-zinc-50 border border-zinc-100 rounded-2xl p-6 space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Was dich im Gespräch erwartet</p>
                {[
                  'Wir rechnen mit deinen Zahlen durch, was eine Immobilie steuerlich für dich bedeutet.',
                  'Du siehst konkrete Objekte, die zu deiner Situation passen.',
                  'Kostenlos und unverbindlich – du entscheidest in Ruhe.',
                ].map((t) => (
                  <div key={t} className="flex items-start gap-3 text-zinc-700">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : !isContactStep && current ? (
            <motion.div
              key={current.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.2 }}
            >
              <h3 ref={headingRef} tabIndex={-1} className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight outline-none">
                {current.title}
              </h3>
              {current.hint && <p className="mt-2 text-zinc-500">{current.hint}</p>}
              <div className="mt-8 grid gap-3" role="group" aria-label={current.title}>
                {current.options.map((o) => {
                  const selected = answers[current.id] === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => choose(current.id, o.value)}
                      className={`group flex items-center justify-between w-full text-left px-5 py-4 sm:py-5 rounded-2xl border-2 text-base sm:text-lg font-medium transition-all ${
                        selected
                          ? 'border-emerald-500 bg-emerald-50 text-zinc-900'
                          : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-900 hover:-translate-y-0.5 hover:shadow-md'
                      }`}
                    >
                      <span>{o.label}</span>
                      <span
                        className={`ml-4 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          selected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 group-hover:border-zinc-900'
                        }`}
                      >
                        {selected && <Check className="w-4 h-4" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="kontakt"
              onSubmit={submit}
              noValidate
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.2 }}
            >
              <h3 ref={headingRef} tabIndex={-1} className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight outline-none">
                Fast geschafft! Wohin dürfen wir dein Ergebnis schicken?
              </h3>
              <p className="mt-2 text-zinc-500">Wir besprechen dein Ergebnis kurz am Telefon – kostenlos und unverbindlich.</p>

              <div className="mt-8 space-y-4">
                <div>
                  <label htmlFor="ic-firstName" className="text-sm font-medium text-zinc-900">Vorname</label>
                  <input
                    id="ic-firstName"
                    autoComplete="given-name"
                    className={`${inputClass} mt-1.5`}
                    value={contact.firstName}
                    onChange={(e) => setContact({ ...contact, firstName: e.target.value })}
                    placeholder="Max"
                    aria-invalid={touched && !firstNameOk}
                  />
                  {touched && !firstNameOk && <p className="mt-1 text-sm text-red-600">Bitte gib deinen Vornamen ein.</p>}
                </div>
                <div>
                  <label htmlFor="ic-phone" className="text-sm font-medium text-zinc-900">Handynummer</label>
                  <input
                    id="ic-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    className={`${inputClass} mt-1.5`}
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    placeholder="0151 23456789"
                    aria-invalid={touched && !phoneOk}
                  />
                  {touched && !phoneOk && <p className="mt-1 text-sm text-red-600">Bitte gib eine gültige Telefonnummer ein.</p>}
                </div>
                <div>
                  <label htmlFor="ic-email" className="text-sm font-medium text-zinc-900">E-Mail</label>
                  <input
                    id="ic-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className={`${inputClass} mt-1.5`}
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    placeholder="max@beispiel.de"
                    aria-invalid={touched && !emailOk}
                  />
                  {touched && !emailOk && <p className="mt-1 text-sm text-red-600">Bitte gib eine gültige E-Mail-Adresse ein.</p>}
                </div>

                {/* Honeypot gegen Spam-Bots – für Menschen unsichtbar */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label htmlFor="ic-website">Website</label>
                  <input id="ic-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                </div>

                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${touched && !consent ? 'border-red-300 bg-red-50' : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100'}`}>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 w-5 h-5 shrink-0 rounded accent-emerald-600"
                  />
                  <span className="text-sm text-zinc-600 leading-relaxed">
                    {CONSENT_TEXT} Mehr dazu in der{' '}
                    <Link to="/datenschutz" target="_blank" className="underline hover:text-zinc-900">Datenschutzerklärung</Link>.
                  </span>
                </label>
                {touched && !consent && (
                  <p className="-mt-2 text-sm text-red-600">Ohne dein Okay dürfen wir dich leider nicht anrufen.</p>
                )}

                {status === 'error' && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">
                    <p className="font-semibold">Das hat leider nicht geklappt.</p>
                    <p>Bitte versuch es nochmal oder schreib uns an kontakt@kivaro-invest.de. ({errorMessage})</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full flex justify-center items-center gap-2 px-8 py-4 text-base sm:text-lg font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? 'Wird gesendet …' : 'Investment-Check abschließen'}
                  {status !== 'submitting' && <ArrowRight className="w-5 h-5" />}
                </button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
                  <Lock className="w-3.5 h-3.5" /> Verschlüsselt übertragen. Nur Kivaro Invest meldet sich bei dir.
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {(status === 'idle' || status === 'error') && stepIndex > 0 && (
          <button
            type="button"
            onClick={back}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Zurück
          </button>
        )}
      </div>

      {status !== 'success' && (
        <div className="border-t border-zinc-100 bg-zinc-50 px-6 sm:px-10 py-4 grid grid-cols-3 gap-2 text-[11px] sm:text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 shrink-0" /> 1 Minute</span>
          <span className="flex items-center gap-1.5 justify-center"><ShieldCheck className="w-4 h-4 shrink-0" /> Kostenlos</span>
          <span className="flex items-center gap-1.5 justify-end"><Phone className="w-4 h-4 shrink-0" /> Unverbindlich</span>
        </div>
      )}
    </div>
  );
}
