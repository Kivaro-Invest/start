import type { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';
import {
  CONSENT_TEXT,
  CONSENT_VERSION,
  QUESTIONS,
  answersAreValid,
  labelFor,
  scoreLead,
  visibleQuestions,
  type Answers,
} from '../../src/lib/investmentCheck';

// ---------------------------------------------------------------------------
// monday.com – Spalten-IDs des Boards „Leads – Investment-Check“
// Board: https://greenjobsgmbh.monday.com/boards/5105369698 (Workspace „Kivaro“)
const MONDAY_BOARD_ID_DEFAULT = '5105369698';
// ---------------------------------------------------------------------------
const MONDAY_COLUMNS = {
  status: 'color_mm7rwbk5',
  einstufung: 'color_mm7r87d2',
  telefon: 'phone_mm7rz8s1',
  email: 'email_mm7rgxm0',
  ziel: 'text_mm7r7y9q',
  beruf: 'text_mm7r47ah',
  probezeit: 'text_mm7r7adj',
  einkommen: 'text_mm7r6tbe',
  ersparnisse: 'text_mm7r5f48',
  immobilien: 'text_mm7rfxjy',
  alter: 'text_mm7rfrsc',
  start: 'text_mm7r3wj5',
  quelle: 'text_mm7rk9e7',
  kampagne: 'text_mm7r8609',
  eingang: 'date_mm7rayea',
  einwilligung: 'long_text_mm7rqb20',
};

type LeadBody = {
  answers?: Answers;
  contact?: { firstName?: string; phone?: string; email?: string };
  consent?: { given?: boolean; version?: string };
  attribution?: Record<string, string | undefined>;
  pageUrl?: string;
  secondsToComplete?: number;
  website?: string; // Honeypot
};

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const clip = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
  if ((event.body?.length ?? 0) > 10_000) return json(413, { error: 'Anfrage zu groß' });

  let body: LeadBody;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Ungültige Anfrage' });
  }

  // Bots: Honeypot ausgefüllt oder unrealistisch schnell → stillschweigend „ok“
  if (body.website || (typeof body.secondsToComplete === 'number' && body.secondsToComplete < 4)) {
    return json(200, { success: true });
  }

  const answers: Answers = {};
  for (const q of QUESTIONS) {
    const v = body.answers?.[q.id];
    if (typeof v === 'string') answers[q.id] = v;
  }
  // nur Antworten auf tatsächlich gezeigte Fragen behalten
  const visible = new Set(visibleQuestions(answers).map((q) => q.id));
  for (const k of Object.keys(answers) as (keyof Answers)[]) if (!visible.has(k)) delete answers[k];

  const firstName = clip(body.contact?.firstName, 60);
  const phone = clip(body.contact?.phone, 25).replace(/[^\d+]/g, '');
  const email = clip(body.contact?.email, 120).toLowerCase();
  const digits = phone.replace(/\D/g, '');

  if (!answersAreValid(answers)) return json(400, { error: 'Bitte beantworte alle Fragen.' });
  if (firstName.length < 2) return json(400, { error: 'Vorname fehlt.' });
  if (digits.length < 8 || digits.length > 15) return json(400, { error: 'Telefonnummer ungültig.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json(400, { error: 'E-Mail ungültig.' });
  if (body.consent?.given !== true || body.consent?.version !== CONSENT_VERSION) {
    return json(400, { error: 'Einwilligung fehlt.' });
  }

  const score = scoreLead(answers);
  const now = new Date();
  const zeitBerlin = now.toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
  const ip =
    event.headers['x-nf-client-connection-ip'] ||
    (event.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    'unbekannt';
  const userAgent = clip(event.headers['user-agent'], 300);
  const attr = body.attribution || {};
  const quelle = clip(attr.utm_source || (attr.referrer ? 'referral' : 'direkt'), 100);
  const kampagne = clip([attr.utm_campaign, attr.utm_content].filter(Boolean).join(' / '), 150);

  // Einwilligungsnachweis (§ 7a UWG: 5 Jahre aufbewahren)
  const consentProof = [
    `Einwilligung erteilt: ja (aktiv angekreuzt, nicht vorausgewählt)`,
    `Zeitpunkt: ${now.toISOString()} (${zeitBerlin} Uhr)`,
    `Textversion: ${CONSENT_VERSION}`,
    `Wortlaut: ${CONSENT_TEXT}`,
    `IP-Adresse: ${ip}`,
    `User-Agent: ${userAgent}`,
    `Seite: ${clip(body.pageUrl, 300)}`,
  ].join('\n');

  const answerLines = visibleQuestions(answers).map((q) => ({ frage: q.title, antwort: labelFor(q.id, answers[q.id]) }));

  const results = { monday: false, mail: false };
  // Kurzer Diagnose-Hinweis ohne Geheimnisse (hilft bei der Fehlersuche, Nutzer sieht ihn nicht)
  let mondayInfo = 'kein Token';

  // ---------------- monday.com ----------------
  const token = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_BOARD_ID || MONDAY_BOARD_ID_DEFAULT;
  if (token && boardId) {
    mondayInfo = 'gestartet';
    try {
      const c = MONDAY_COLUMNS;
      const values: Record<string, unknown> = {};
      const set = (id: string, v: unknown) => { if (id) values[id] = v; };
      set(c.status, { label: 'Neu' });
      set(c.einstufung, { label: score });
      set(c.telefon, { phone: phone.startsWith('+') ? phone : phone.startsWith('00') ? phone.replace(/^00/, '+') : phone.replace(/^0/, '+49'), countryShortName: 'DE' });
      set(c.email, { email, text: email });
      set(c.ziel, labelFor('ziel', answers.ziel));
      set(c.beruf, labelFor('beruf', answers.beruf));
      set(c.probezeit, labelFor('probezeit', answers.probezeit));
      set(c.einkommen, labelFor('einkommen', answers.einkommen));
      set(c.ersparnisse, labelFor('ersparnisse', answers.ersparnisse));
      set(c.immobilien, labelFor('immobilien', answers.immobilien));
      set(c.alter, labelFor('alter', answers.alter));
      set(c.start, labelFor('start', answers.start));
      set(c.quelle, quelle);
      set(c.kampagne, kampagne);
      set(c.eingang, { date: now.toISOString().slice(0, 10), time: now.toISOString().slice(11, 19) });
      set(c.einwilligung, { text: consentProof });

      const query = `mutation ($board: ID!, $name: String!, $values: JSON!) {
        create_item(board_id: $board, item_name: $name, column_values: $values, create_labels_if_missing: true) { id }
      }`;
      const res = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token, 'API-Version': '2024-10' },
        body: JSON.stringify({
          query,
          variables: { board: boardId, name: `${firstName} (${score})`, values: JSON.stringify(values) },
        }),
      });
      const data = await res.json();
      if (data?.data?.create_item?.id) {
        results.monday = true;
        mondayInfo = 'ok';
      } else {
        mondayInfo = `fehler ${res.status}: ${String(data?.errors?.[0]?.message || data?.error_message || data?.error_code || '').slice(0, 160)}`;
        console.error('monday error', JSON.stringify(data).slice(0, 500));
      }
    } catch (err) {
      mondayInfo = 'netzwerkfehler';
      console.error('monday request failed', err);
    }
  }

  // ---------------- E-Mails ----------------
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (host && user && pass) {
    const port = parseInt(process.env.SMTP_PORT || '587');
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465 ? true : process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const notifyTo = process.env.LEAD_NOTIFY_TO || 'kontakt@kivaro-invest.de';
    const prio = score === 'A' ? '🔥 A-Lead' : score === 'B' ? 'B-Lead' : 'C-Lead';
    const rows = answerLines
      .map((l) => `<tr><td style="padding:4px 12px 4px 0;color:#71717a">${esc(l.frage)}</td><td style="padding:4px 0"><b>${esc(l.antwort)}</b></td></tr>`)
      .join('');

    try {
      await transporter.sendMail({
        from: `"Kivaro Investment-Check" <${user}>`,
        to: notifyTo,
        replyTo: email,
        subject: `${prio}: ${firstName} – Investment-Check (Quelle: ${quelle})`,
        text: [
          `Neuer Lead aus dem Investment-Check – Einstufung ${score}`,
          '',
          `Vorname: ${firstName}`,
          `Telefon: ${phone}`,
          `E-Mail: ${email}`,
          '',
          ...answerLines.map((l) => `${l.frage} ${l.antwort}`),
          '',
          `Quelle: ${quelle}${kampagne ? ` (${kampagne})` : ''}`,
          '',
          '--- Einwilligungsnachweis ---',
          consentProof,
        ].join('\n'),
        html: `
<h2 style="font-family:Arial,sans-serif">${esc(prio)}: ${esc(firstName)}</h2>
<p style="font-family:Arial,sans-serif;font-size:16px">
  <b>Telefon:</b> <a href="tel:${esc(phone)}">${esc(phone)}</a><br>
  <b>E-Mail:</b> ${esc(email)}<br>
  <b>Quelle:</b> ${esc(quelle)}${kampagne ? ` (${esc(kampagne)})` : ''}
</p>
<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows}</table>
<h3 style="font-family:Arial,sans-serif;margin-top:24px">Einwilligungsnachweis</h3>
<pre style="font-size:12px;white-space:pre-wrap;background:#f4f4f5;padding:12px;border-radius:8px">${esc(consentProof)}</pre>
<p style="font-family:Arial,sans-serif;font-size:12px;color:#71717a">Diese E-Mail als Nachweis 5 Jahre aufbewahren (§ 7a UWG).</p>`,
      });
      results.mail = true;
    } catch (err) {
      console.error('notify mail failed', err);
    }

    // Bestätigung an den Interessenten (Fehler hier sind nicht kritisch)
    try {
      await transporter.sendMail({
        from: `"Kivaro Invest" <${user}>`,
        to: email,
        replyTo: 'kontakt@kivaro-invest.de',
        subject: 'Dein Investment-Check ist angekommen',
        text: `Hallo ${firstName},

danke für deinen Investment-Check! Wir melden uns in der Regel innerhalb von 24 Stunden telefonisch bei dir unter ${phone} und rechnen mit dir durch, was eine Kapitalanlage-Immobilie für dich bringen kann.

Du möchtest doch nicht angerufen werden? Antworte einfach kurz auf diese E-Mail – dann löschen wir deine Anfrage.

Viele Grüße
Dein Team von Kivaro Invest

Kivaro Invest UG (haftungsbeschränkt) · Tölzer Str. 1 · 82031 Grünwald
https://kivaro-invest.de/impressum`,
      });
    } catch (err) {
      console.error('confirmation mail failed', err);
    }
  }

  if (!results.monday && !results.mail) {
    console.error('Lead konnte nirgends gespeichert werden', { firstName, score });
    return json(500, { error: 'Speichern fehlgeschlagen' });
  }
  return json(200, { success: true, saved: { ...results, mondayInfo } });
};
