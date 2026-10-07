// Cloudflare Pages Function: POST /api/lead
// Nimmt den Investment-Check entgegen, legt den Lead in monday an und verschickt
// die Benachrichtigung an Kivaro sowie die Bestätigung an den Interessenten (über STRATO).
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
import { clip, esc, json, lastSmtpError, sendMails, type Env } from '../../server/shared';

// monday.com – Board „Leads – Investment-Check“ (Workspace „Kivaro“)
// https://greenjobsgmbh.monday.com/boards/5105369698
const MONDAY_BOARD_ID_DEFAULT = '5105369698';
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

export const onRequestPost = async ({ request, env, waitUntil }: { request: Request; env: Env; waitUntil: (p: Promise<unknown>) => void }) => {
  const raw = await request.text();
  if (raw.length > 10_000) return json(413, { error: 'Anfrage zu groß' });

  let body: LeadBody;
  try {
    body = JSON.parse(raw || '{}');
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
  const ip = request.headers.get('CF-Connecting-IP') || (request.headers.get('X-Forwarded-For') || '').split(',')[0].trim() || 'unbekannt';
  const userAgent = clip(request.headers.get('User-Agent'), 300);
  const attr = body.attribution || {};
  const quelle = clip(attr.utm_source || (attr.referrer ? 'referral' : 'direkt'), 100);
  const kampagne = clip([attr.utm_campaign, attr.utm_content].filter(Boolean).join(' / '), 150);

  // Einwilligungsnachweis (§ 7a UWG: 5 Jahre aufbewahren)
  const consentProof = [
    'Einwilligung erteilt: ja (aktiv angekreuzt, nicht vorausgewählt)',
    `Zeitpunkt: ${now.toISOString()} (${zeitBerlin} Uhr)`,
    `Textversion: ${CONSENT_VERSION}`,
    `Wortlaut: ${CONSENT_TEXT}`,
    `IP-Adresse: ${ip}`,
    `User-Agent: ${userAgent}`,
    `Seite: ${clip(body.pageUrl, 300)}`,
  ].join('\n');

  const answerLines = visibleQuestions(answers).map((q) => ({ frage: q.title, antwort: labelFor(q.id, answers[q.id]) }));

  // ---------------- monday.com ----------------
  let mondayOk = false;
  let mondayInfo = 'kein Token';
  if (env.MONDAY_API_TOKEN) {
    try {
      const c = MONDAY_COLUMNS;
      const intlPhone = phone.startsWith('+') ? phone : phone.startsWith('00') ? phone.replace(/^00/, '+') : phone.replace(/^0/, '+49');
      const values: Record<string, unknown> = {
        [c.status]: { label: 'Neu' },
        [c.einstufung]: { label: score },
        [c.telefon]: { phone: intlPhone, countryShortName: 'DE' },
        [c.email]: { email, text: email },
        [c.ziel]: labelFor('ziel', answers.ziel),
        [c.beruf]: labelFor('beruf', answers.beruf),
        [c.probezeit]: labelFor('probezeit', answers.probezeit),
        [c.einkommen]: labelFor('einkommen', answers.einkommen),
        [c.ersparnisse]: labelFor('ersparnisse', answers.ersparnisse),
        [c.immobilien]: labelFor('immobilien', answers.immobilien),
        [c.alter]: labelFor('alter', answers.alter),
        [c.start]: labelFor('start', answers.start),
        [c.quelle]: quelle,
        [c.kampagne]: kampagne,
        [c.eingang]: { date: now.toISOString().slice(0, 10), time: now.toISOString().slice(11, 19) },
        [c.einwilligung]: { text: consentProof },
      };
      const res = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: env.MONDAY_API_TOKEN, 'API-Version': '2024-10' },
        body: JSON.stringify({
          query: `mutation ($board: ID!, $name: String!, $values: JSON!) {
            create_item(board_id: $board, item_name: $name, column_values: $values, create_labels_if_missing: true) { id }
          }`,
          variables: { board: env.MONDAY_BOARD_ID || MONDAY_BOARD_ID_DEFAULT, name: `${firstName} (${score})`, values: JSON.stringify(values) },
        }),
      });
      const data: any = await res.json().catch(() => ({}));
      if (data?.data?.create_item?.id) {
        mondayOk = true;
        mondayInfo = 'ok';
      } else {
        mondayInfo = `fehler ${res.status}: ${String(data?.errors?.[0]?.message || data?.error_message || '').slice(0, 160)}`;
        console.error('monday error', JSON.stringify(data).slice(0, 500));
      }
    } catch (err) {
      mondayInfo = 'netzwerkfehler';
      console.error('monday request failed', err);
    }
  }

  // ---------------- E-Mails ----------------
  const prio = score === 'A' ? 'A-Lead' : score === 'B' ? 'B-Lead' : 'C-Lead';
  const rows = answerLines
    .map((l) => `<tr><td style="padding:4px 12px 4px 0;color:#71717a">${esc(l.frage)}</td><td style="padding:4px 0"><b>${esc(l.antwort)}</b></td></tr>`)
    .join('');

  const notifyMail = {
    fromName: 'Kivaro Investment-Check',
    to: env.LEAD_NOTIFY_TO || 'kontakt@kivaro-invest.de',
    reply: email,
    subject: `[${prio}] ${firstName} - Investment-Check (Quelle: ${quelle})`,
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
  };

  const confirmMail = {
    fromName: 'Kivaro Invest',
    to: email,
    reply: 'kontakt@kivaro-invest.de',
    subject: 'Dein Investment-Check ist angekommen',
    text: `Hallo ${firstName},

danke für deinen Investment-Check! Wir melden uns in der Regel innerhalb von 24 Stunden bei dir und vereinbaren ein kostenloses Erstgespräch.

Du möchtest doch nicht angerufen werden? Antworte einfach kurz auf diese E-Mail – dann löschen wir deine Anfrage.

Viele Grüße
Dein Team von Kivaro Invest

Kivaro Invest UG (haftungsbeschränkt) · Tölzer Str. 1 · 82031 Grünwald
https://kivaro-invest.de/impressum`,
  };

  if (mondayOk) {
    // Lead ist sicher gespeichert → Mails im Hintergrund, Antwort sofort an den Besucher
    waitUntil(sendMails(env, [notifyMail, confirmMail]));
    return json(200, { success: true, saved: { monday: true, mondayInfo } });
  }

  // Ohne monday ist die Benachrichtigungsmail der einzige Speicherort → abwarten
  const [notifyOk] = await sendMails(env, [notifyMail, confirmMail]);
  if (!notifyOk) {
    console.error('Lead konnte nirgends gespeichert werden', { firstName, score, mondayInfo, lastSmtpError });
    // Diagnose ohne Geheimnisse – zeigt nur, WAS fehlt
    return json(500, {
      error: 'Speichern fehlgeschlagen',
      diagnose: {
        monday: mondayInfo,
        mail: lastSmtpError || 'unbekannt',
        gesetzt: ['MONDAY_API_TOKEN', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_PORT'].filter((k) => Boolean((env as Record<string, unknown>)[k])),
      },
    });
  }
  return json(200, { success: true, saved: { monday: false, mail: true, mondayInfo } });
};

export const onRequest = () => json(405, { error: 'Method Not Allowed' });
