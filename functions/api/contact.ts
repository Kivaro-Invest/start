// Cloudflare Pages Function: POST /api/contact – Kontaktformular → Mail an kontakt@kivaro-invest.de
import { clip, esc, json, sendMails, smtpConfigured, type Env } from '../../server/shared';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const raw = await request.text();
  if (raw.length > 20_000) return json(413, { error: 'Anfrage zu groß' });

  let data: Record<string, unknown>;
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
  if (!smtpConfigured(env)) return json(500, { error: 'Mailversand ist noch nicht eingerichtet.' });

  const [ok] = await sendMails(env, [
    {
      fromName: `${firstName} ${lastName}`,
      to: 'kontakt@kivaro-invest.de',
      reply: email,
      subject: `Neue Kontaktanfrage von ${firstName} ${lastName} (WEBSEITE KIVARO)`,
      text: `Name: ${firstName} ${lastName}\nE-Mail: ${email}\nTelefon: ${phone || 'Nicht angegeben'}\n\nNachricht:\n${message}`,
      html: `<h3>Neue Kontaktanfrage</h3>
<p><strong>Name:</strong> ${esc(firstName)} ${esc(lastName)}</p>
<p><strong>E-Mail:</strong> ${esc(email)}</p>
<p><strong>Telefon:</strong> ${esc(phone || 'Nicht angegeben')}</p>
<p><strong>Nachricht:</strong></p>
<p>${esc(message).replace(/\n/g, '<br>')}</p>`,
    },
  ]);

  return ok ? json(200, { success: true }) : json(500, { error: 'Senden fehlgeschlagen. Bitte schreib uns direkt an kontakt@kivaro-invest.de.' });
};

export const onRequest = () => json(405, { error: 'Method Not Allowed' });
