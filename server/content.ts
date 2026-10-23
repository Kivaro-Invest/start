// Gemeinsame Helfer für den Content-Kalender (Admin-API unter /api/content, Medien unter /media).
// Liegt bewusst außerhalb von /functions, damit daraus keine eigene URL entsteht.
import { json } from './shared';

// Nur die Teile von D1/R2, die wir nutzen – die vollen Cloudflare-Typen kollidieren mit den DOM-Typen.
export interface D1Result<T> {
  results: T[];
}
export interface D1Stmt {
  bind(...values: unknown[]): D1Stmt;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<unknown>;
}
export interface D1 {
  prepare(sql: string): D1Stmt;
  batch(stmts: D1Stmt[]): Promise<unknown[]>;
}
export interface R2Obj {
  body: ReadableStream;
  size: number;
  httpEtag: string;
  httpMetadata?: { contentType?: string };
  range?: { offset: number; length?: number };
}
export interface R2 {
  put(key: string, value: ReadableStream | ArrayBuffer, opts?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string, opts?: { range?: { offset: number; length?: number } | { suffix: number } }): Promise<R2Obj | null>;
  head(key: string): Promise<{ size: number } | null>;
  delete(keys: string | string[]): Promise<void>;
}

export type ContentEnv = {
  CONTENT_DB?: D1;
  CONTENT_MEDIA?: R2;
  CONTENT_ADMIN_PASSWORD?: string;
};

export const FORMATS = ['reel', 'bild', 'karussell', 'story'] as const;
export const STATUSES = ['idee', 'fertig', 'geplant', 'gepostet', 'fehler'] as const;
export type Format = (typeof FORMATS)[number];
export type Status = (typeof STATUSES)[number];

// Instagram nimmt nur JPEG-Bilder und MP4/MOV-Videos an. PNG/WebP wandelt der Browser vor dem Hochladen in JPEG um.
export const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
};
export const MAX_UPLOAD_BYTES = 95 * 1024 * 1024; // Pages Functions nehmen max. 100 MB pro Anfrage an

// ---------------- Login ----------------

export const SESSION_COOKIE = 'kivaro_content_session';
const SESSION_DAYS = 14;
const enc = new TextEncoder();

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Vergleich in konstanter Zeit (über die HMACs, damit auch die Länge nichts verrät). */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const k = 'kivaro-compare';
  const [ha, hb] = await Promise.all([hmac(k, a), hmac(k, b)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha.charCodeAt(i) ^ hb.charCodeAt(i);
  return diff === 0;
}

/** Sitzung = Ablaufzeit + HMAC mit dem Admin-Passwort. Passwort ändern meldet alle ab. */
export async function createSession(password: string): Promise<string> {
  const exp = Date.now() + SESSION_DAYS * 86_400_000;
  return `${exp}.${await hmac(password, `content:${exp}`)}`;
}

export async function sessionValid(env: ContentEnv, request: Request): Promise<boolean> {
  if (!env.CONTENT_ADMIN_PASSWORD) return false;
  const cookie = request.headers.get('Cookie') || '';
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  if (!m) return false;
  const [expRaw, sig] = m[1].split('.');
  const exp = Number(expRaw);
  if (!exp || exp < Date.now() || !sig) return false;
  return safeEqual(sig, await hmac(env.CONTENT_ADMIN_PASSWORD, `content:${exp}`));
}

export function sessionCookie(value: string, maxAgeSeconds: number) {
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAgeSeconds}`;
}
export const SESSION_MAX_AGE = SESSION_DAYS * 86_400;

// ---------------- Datenmodell ----------------

export type MediaRow = {
  id: string;
  post_id: string | null;
  r2_key: string;
  content_type: string;
  size: number;
  filename: string;
  position: number;
};

export type PostRow = {
  id: string;
  scheduled_at: string | null;
  format: Format;
  caption: string;
  hashtags: string;
  status: Status;
  ig_media_id: string | null;
  permalink: string | null;
  error: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AutomationRow = {
  post_id: string;
  keywords: string;
  public_reply: string;
  dm_text: string;
  active: number;
};

export const mediaUrl = (key: string) => `/media/${key}`;

export function mediaToApi(m: MediaRow) {
  return { id: m.id, url: mediaUrl(m.r2_key), contentType: m.content_type, size: m.size, filename: m.filename };
}

export async function loadPosts(db: D1, where: string, binds: unknown[]) {
  const posts = (await db.prepare(`SELECT * FROM posts ${where}`).bind(...binds).all<PostRow>()).results;
  if (!posts.length) return [];
  const ids = posts.map((p) => p.id);
  const ph = ids.map(() => '?').join(',');
  const [media, autos] = await Promise.all([
    db.prepare(`SELECT * FROM media WHERE post_id IN (${ph}) ORDER BY position`).bind(...ids).all<MediaRow>(),
    db.prepare(`SELECT * FROM automations WHERE post_id IN (${ph})`).bind(...ids).all<AutomationRow>(),
  ]);
  return posts.map((p) => {
    const a = autos.results.find((x) => x.post_id === p.id);
    return {
      id: p.id,
      scheduledAt: p.scheduled_at,
      format: p.format,
      caption: p.caption,
      hashtags: p.hashtags,
      status: p.status,
      igMediaId: p.ig_media_id,
      permalink: p.permalink,
      error: p.error,
      publishedAt: p.published_at,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      media: media.results.filter((m) => m.post_id === p.id).map(mediaToApi),
      automation: a
        ? { keywords: JSON.parse(a.keywords) as string[], publicReply: a.public_reply, dmText: a.dm_text, active: a.active === 1 }
        : null,
    };
  });
}

export type PostInput = {
  scheduledAt?: string | null;
  format?: string;
  caption?: string;
  hashtags?: string;
  status?: string;
  mediaIds?: string[];
  automation?: { keywords?: unknown; publicReply?: unknown; dmText?: unknown; active?: unknown } | null;
};

const isVideo = (t: string) => t.startsWith('video/');

/**
 * Prüft, ob ein Beitrag so bei Instagram veröffentlicht werden kann. Gibt eine Fehlermeldung zurück oder null.
 * Wird nur für „geplant“ erzwungen – Ideen und Entwürfe dürfen unvollständig sein.
 */
export function publishProblem(p: { format: Format; scheduledAt: string | null; caption: string; hashtags: string }, media: { content_type: string }[]): string | null {
  if (!p.scheduledAt) return 'Für „geplant“ braucht der Beitrag Datum und Uhrzeit.';
  if (!media.length) return 'Für „geplant“ braucht der Beitrag mindestens ein Bild oder Video.';
  if ((p.caption + '\n' + p.hashtags).length > 2200) return 'Caption und Hashtags zusammen dürfen höchstens 2.200 Zeichen haben.';
  if ((p.hashtags.match(/#/g) || []).length > 30) return 'Instagram erlaubt höchstens 30 Hashtags.';
  switch (p.format) {
    case 'reel':
      if (media.length !== 1 || !isVideo(media[0].content_type)) return 'Ein Reel braucht genau ein Video.';
      break;
    case 'bild':
      if (media.length !== 1 || isVideo(media[0].content_type)) return 'Ein Bild-Beitrag braucht genau ein Bild.';
      break;
    case 'karussell':
      if (media.length < 2 || media.length > 10) return 'Ein Karussell braucht 2 bis 10 Bilder oder Videos.';
      break;
    case 'story':
      if (media.length !== 1) return 'Eine Story braucht genau ein Bild oder Video.';
      break;
  }
  return null;
}

export function normalizeKeywords(v: unknown): string[] {
  const list = Array.isArray(v) ? v : String(v ?? '').split(',');
  return [...new Set(list.map((k) => String(k).trim().toUpperCase()).filter((k) => k && k.length <= 40))].slice(0, 10);
}

export function noDb() {
  return json(503, { error: 'Datenbank CONTENT_DB ist nicht verbunden.' });
}
