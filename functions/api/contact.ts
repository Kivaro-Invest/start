// Cloudflare Pages Function: POST /api/contact – Kontaktformular → Mail an kontakt@kivaro-invest.de
import { CONTACT_CONSENT_TEXT, CONTACT_CONSENT_VERSION } from '../../src/lib/investmentCheck';
import { clip, esc, json, sendMails, smtpConfigured, type Env } from '../../server/shared';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const raw = await request.text();
  if (raw.length > 20_000) return json(413, { error: 'Anfrage zu groß' });

  let data: Record<string, any>;
  try {
    data = JSON.parse(raw || '{}');
  } catch {
    return json(400, { error: 'Ungültige Anfrage' });
  }

  const firstName = clip(data.firstName, 60);
  const lastName = clip(data.lastName, 60);
  const email = clip(data.email, 120);
  const phone = clip(data.phone, 30);
  const message = clip(data.message, 5000);

  if (!firstName || !lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !message) {
    return json(400, { error: 'Bitte fülle alle Pflichtfelder aus.' });
  }
  if (data.consent?.given !== true || data.consent?.version !== CONTACT_CONSENT_VERSION) {
    return json(400, { error: 'Bitte bestätige die Einwilligung zur Kontaktaufnahme.' });
  }
  if (!smtpConfigured(env)) return json(500, { error: 'Mailversand ist noch nicht eingerichtet.' });

  // Einwilligungsnachweis (§ 7a UWG: 5 Jahre aufbewahren). Die Seite ohne klickbaren Link,
  // weil der STRATO-Spamfilter Mails mit manchen Links ablehnt.
  const now = new Date();
  const ip = request.headers.get('CF-Connecting-IP') || 'unbekannt';
  const userAgent = clip(request.headers.get('User-Agent'), 300);
  const page = clip(data.pageUrl, 300).replace(/^https?:\/\//i, '').replace(/^([^/?#]+)/, (h) => h.replace(/\./g, '[.]'));
  const consentProof = [
    'Einwilligung erteilt: ja (aktiv angekreuzt, nicht vorausgewählt)',
    `Zeitpunkt: ${now.toISOString()} (${now.toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })} Uhr)`,
    `Textversion: ${CONTACT_CONSENT_VERSION}`,
    `Wortlaut: ${CONTACT_CONSENT_TEXT}`,
    `IP-Adresse: ${ip}`,
    `User-Agent: ${userAgent}`,
    `Seite: ${page}`,
  ].join('\n');

  const [ok] = await sendMails(env, [
    {
      fromName: `${firstName} ${lastName}`,
      to: 'kontakt@kivaro-invest.de',
      reply: email,
      subject: `Neue Kontaktanfrage von ${firstName} ${lastName} (WEBSEITE KIVARO)`,
      text: `Name: ${firstName} ${lastName}\nE-Mail: ${email}\nTelefon: ${phone || 'Nicht angegeben'}\n\nNachricht:\n${message}\n\n--- Einwilligungsnachweis ---\n${consentProof}`,
      html: `<h3>Neue Kontaktanfrage</h3>
<p><strong>Name:</strong> ${esc(firstName)} ${esc(lastName)}</p>
<p><strong>E-Mail:</strong> ${esc(email)}</p>
<p><strong>Telefon:</strong> ${esc(phone || 'Nicht angegeben')}</p>
<p><strong>Nachricht:</strong></p>
<p>${esc(message).replace(/\n/g, '<br>')}</p>
<h3 style="margin-top:24px">Einwilligungsnachweis</h3>
<pre style="font-size:12px;white-space:pre-wrap;background:#f4f4f5;padding:12px;border-radius:8px">${esc(consentProof)}</pre>
<p style="font-size:12px;color:#71717a">Diese E-Mail als Nachweis 5 Jahre aufbewahren (§ 7a UWG).</p>`,
    },
  ]);

  return ok ? json(200, { success: true }) : json(500, { error: 'Senden fehlgeschlagen. Bitte schreib uns direkt an kontakt@kivaro-invest.de.' });
};

export const onRequest = () => json(405, { error: 'Method Not Allowed' });
