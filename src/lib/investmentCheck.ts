// Gemeinsame Definition des Investment-Checks – wird von der Seite UND der Cloudflare-Funktion (functions/api/lead.ts) genutzt.
// Fragen hier ändern, dann passt sich beides an.

export type Option = { value: string; label: string };

export type Question = {
  id: QuestionId;
  title: string;
  hint?: string;
  options: Option[];
  /** Frage nur anzeigen, wenn diese Bedingung erfüllt ist */
  showIf?: (answers: Answers) => boolean;
};

export type QuestionId =
  | 'ziel'
  | 'beruf'
  | 'probezeit'
  | 'einkommen'
  | 'ersparnisse'
  | 'immobilien'
  | 'alter'
  | 'start';

export type Answers = Partial<Record<QuestionId, string>>;

export const QUESTIONS: Question[] = [
  {
    id: 'ziel',
    title: 'Was ist dein wichtigstes Ziel?',
    options: [
      { value: 'steuern', label: 'Steuern sparen' },
      { value: 'vermoegen', label: 'Vermögen aufbauen' },
      { value: 'altersvorsorge', label: 'Fürs Alter vorsorgen' },
      { value: 'passiv', label: 'Passives Einkommen' },
    ],
  },
  {
    id: 'beruf',
    title: 'Was machst du beruflich?',
    options: [
      { value: 'angestellt', label: 'Angestellt' },
      { value: 'selbststaendig', label: 'Selbstständig' },
      { value: 'ohne', label: 'Arbeitssuchend / im Ruhestand' },
    ],
  },
  {
    id: 'probezeit',
    title: 'Bist du noch in der Probezeit?',
    options: [
      { value: 'nein', label: 'Nein' },
      { value: 'ja', label: 'Ja' },
    ],
    showIf: (a) => a.beruf === 'angestellt',
  },
  {
    id: 'einkommen',
    title: 'Wie hoch ist dein Brutto-Jahreseinkommen?',
    hint: 'Eine grobe Einordnung reicht.',
    options: [
      { value: 'u45', label: 'Unter 45.000 €' },
      { value: '45-60', label: '45.000 – 60.000 €' },
      { value: '60-80', label: '60.000 – 80.000 €' },
      { value: 'ue80', label: 'Über 80.000 €' },
    ],
  },
  {
    id: 'ersparnisse',
    title: 'Hast du Ersparnisse, die du für deinen Vermögensaufbau einsetzen möchtest?',
    options: [
      { value: 'keine', label: 'Noch keine' },
      { value: 'u15', label: 'Ja, unter 15.000 €' },
      { value: 'ue15', label: 'Ja, 15.000 € oder mehr' },
    ],
  },
  {
    id: 'immobilien',
    title: 'Besitzt du schon Immobilien?',
    options: [
      { value: 'keine', label: 'Noch keine' },
      { value: '1-3', label: '1 – 3 Immobilien' },
      { value: '4+', label: '4 oder mehr' },
    ],
  },
  {
    id: 'alter',
    title: 'Wie alt bist du?',
    options: [
      { value: 'u40', label: 'Unter 40' },
      { value: '40-60', label: '40 – 60' },
      { value: 'ue60', label: 'Über 60' },
    ],
  },
  {
    id: 'start',
    title: 'Wann möchtest du starten?',
    options: [
      { value: 'sofort', label: 'Am liebsten sofort' },
      { value: '3-6', label: 'In 3 – 6 Monaten' },
      { value: 'info', label: 'Erstmal informieren' },
    ],
  },
];

export function visibleQuestions(answers: Answers): Question[] {
  return QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
}

export function labelFor(id: QuestionId, value: string | undefined): string {
  if (!value) return '–';
  const q = QUESTIONS.find((x) => x.id === id);
  return q?.options.find((o) => o.value === value)?.label ?? value;
}

/** Prüft, ob alle sichtbaren Fragen eine gültige Antwort haben. */
export function answersAreValid(answers: Answers): boolean {
  return visibleQuestions(answers).every((q) =>
    q.options.some((o) => o.value === answers[q.id]),
  );
}

/**
 * Einstufung für die Telefon-Priorität.
 * A = sofort anrufen, B = normal, C = später / Info-Follow-up.
 */
export function scoreLead(a: Answers): 'A' | 'B' | 'C' {
  if (a.beruf === 'ohne' || a.start === 'info') return 'C';
  const festAngestellt = a.beruf === 'angestellt' && a.probezeit === 'nein';
  const stabil = festAngestellt || a.beruf === 'selbststaendig';
  const gutesEinkommen = a.einkommen === '60-80' || a.einkommen === 'ue80';
  if (stabil && gutesEinkommen) return 'A';
  return 'B';
}

// Einwilligungstext – bei jeder Änderung die Version hochzählen.
// Die Version wird mit jedem Lead gespeichert (Nachweispflicht § 7a UWG).
export const CONSENT_VERSION = '2026-10-02-v1';
export const CONSENT_TEXT =
  'Ich willige ein, dass mich die Kivaro Invest UG (haftungsbeschränkt) zu meinem Investment-Check und zu Immobilien als Kapitalanlage telefonisch und per E-Mail kontaktiert. Diese Einwilligung kann ich jederzeit mit Wirkung für die Zukunft widerrufen, z. B. per E-Mail an kontakt@kivaro-invest.de.';

// Einwilligung im Kontaktformular (eigene Version, gleiche Nachweispflicht)
export const CONTACT_CONSENT_VERSION = '2026-10-07-k1';
export const CONTACT_CONSENT_TEXT =
  'Ich willige ein, dass mich die Kivaro Invest UG (haftungsbeschränkt) zu meiner Anfrage und zu Immobilien als Kapitalanlage telefonisch und per E-Mail kontaktiert. Diese Einwilligung kann ich jederzeit mit Wirkung für die Zukunft widerrufen, z. B. per E-Mail an kontakt@kivaro-invest.de.';
