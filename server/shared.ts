// Gemeinsame Helfer für die Cloudflare-Funktionen (Lead + Kontakt).
// Liegt bewusst außerhalb von /functions, damit daraus keine eigene URL entsteht.
import { WorkerMailer } from 'worker-mailer';

export type Env = {
  MONDAY_API_TOKEN?: string;
  MONDAY_BOARD_ID?: string;
  SMTP_HOST?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_PORT?: string;
  LEAD_NOTIFY_TO?: string;
};

export const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

export const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const clip = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);

export function smtpConfigured(env: Env) {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

export type Mail = {
  fromName: string;
  to: string;
  reply?: string;
  subject: string;
  text: string;
  html?: string;
};

/**
 * Verschickt eine oder mehrere Mails über das STRATO-Postfach (SMTP).
 * Port 465 = direkt verschlüsselt, 587 = STARTTLS. Port 25 ist bei Cloudflare gesperrt.
 * Gibt pro Mail zurück, ob sie rausging.
 */
export let lastSmtpError = '';

/**
 * Betreff RFC-2047-konform kodieren: mehrere kurze Base64-Wörter (max. 75 Zeichen je Wort),
 * gefaltet auf mehrere Zeilen. Die Bibliothek würde sonst ein einziges, überlanges Wort bauen,
 * das manche Mailserver (u. a. Spamfilter) verwerfen.
 */
export function encodeSubject(subject: string): string {
  if (!/[^\x20-\x7E]/.test(subject)) return subject;
  const enc = new TextEncoder();
  const words: string[] = [];
  let chunk = '';
  for (const ch of Array.from(subject)) {
    if (enc.encode(chunk + ch).length > 45) {
      words.push(chunk);
      chunk = ch;
    } else chunk += ch;
  }
  if (chunk) words.push(chunk);
  const b64 = (t: string) => btoa(String.fromCharCode(...enc.encode(t)));
  return words.map((w) => `=?UTF-8?B?${b64(w)}?=`).join('\r\n ');
}

export async function sendMails(env: Env, mails: Mail[]): Promise<boolean[]> {
  lastSmtpError = '';
  if (!smtpConfigured(env)) {
    lastSmtpError = 'SMTP nicht konfiguriert';
    return mails.map(() => false);
  }
  const port = parseInt(env.SMTP_PORT || '465', 10);
  let mailer: WorkerMailer | null = null;
  const results: boolean[] = [];
  try {
    mailer = await WorkerMailer.connect({
      host: env.SMTP_HOST!,
      port,
      secure: port === 465,
      startTls: port !== 465,
      credentials: { username: env.SMTP_USER!, password: env.SMTP_PASS! },
      authType: ['plain', 'login'],
      socketTimeoutMs: 10_000,
      responseTimeoutMs: 10_000,
    });
  } catch (err) {
    console.error('SMTP-Verbindung fehlgeschlagen', err);
    lastSmtpError = `Verbindung: ${String((err as Error)?.message || err).slice(0, 160)}`;
    return mails.map(() => false);
  }
  for (const m of mails) {
    try {
      await mailer.send({
        from: { name: m.fromName, email: env.SMTP_USER! },
        to: m.to,
        reply: m.reply,
        subject: m.subject,
        headers: { Subject: encodeSubject(m.subject) },
        text: m.text,
        html: m.html,
      });
      results.push(true);
    } catch (err) {
      console.error('Mailversand fehlgeschlagen', m.subject, err);
      lastSmtpError = `Versand: ${String((err as Error)?.message || err).slice(0, 160)}`;
      results.push(false);
    }
  }
  try {
    await mailer.close();
  } catch {
    /* egal */
  }
  return results;
}
