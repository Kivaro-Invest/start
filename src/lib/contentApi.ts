// Client für den Content-Kalender (/api/content). Nur im Admin-Bereich /content verwendet.

export type Format = 'reel' | 'bild' | 'karussell' | 'story';
export type Status = 'idee' | 'fertig' | 'geplant' | 'gepostet' | 'fehler';

export type Media = { id: string; url: string; contentType: string; size: number; filename: string };
export type Automation = { keywords: string[]; publicReply: string; dmText: string; active: boolean };
export type Post = {
  id: string;
  scheduledAt: string | null;
  format: Format;
  caption: string;
  hashtags: string;
  status: Status;
  igMediaId: string | null;
  permalink: string | null;
  error: string | null;
  publishedAt: string | null;
  media: Media[];
  automation: Automation | null;
};
export type PostInput = {
  scheduledAt: string | null;
  format: Format;
  caption: string;
  hashtags: string;
  status: Status;
  mediaIds: string[];
  automation: Automation | null;
};

export const FORMAT_LABEL: Record<Format, string> = { reel: 'Reel', bild: 'Bild', karussell: 'Karussell', story: 'Story' };
export const STATUS_LABEL: Record<Status, string> = {
  idee: 'Idee',
  fertig: 'Fertig',
  geplant: 'Geplant',
  gepostet: 'Gepostet',
  fehler: 'Fehler',
};
export const STATUS_STYLE: Record<Status, string> = {
  idee: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  fertig: 'bg-amber-50 text-amber-800 border-amber-200',
  geplant: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  gepostet: 'bg-green-50 text-green-800 border-green-200',
  fehler: 'bg-red-50 text-red-700 border-red-200',
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/content${path}`, { credentials: 'same-origin', ...init });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || `Fehler ${res.status}`);
  return data as T;
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const api = {
  session: () => call<{ loggedIn: boolean; configured: boolean }>('/login'),
  login: (password: string) => call<{ loggedIn: boolean }>('/login', jsonInit('POST', { password })),
  logout: () => call<{ loggedIn: boolean }>('/login', { method: 'DELETE' }),
  postsBetween: (from: Date, to: Date) =>
    call<{ posts: Post[] }>(`/posts?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`),
  unscheduled: () => call<{ posts: Post[] }>('/posts?unscheduled=1'),
  create: (input: Partial<PostInput>) => call<{ post: Post }>('/posts', jsonInit('POST', input)),
  update: (id: string, input: Partial<PostInput>) => call<{ post: Post }>(`/posts/${id}`, jsonInit('PUT', input)),
  remove: (id: string) => call<{ deleted: boolean }>(`/posts/${id}`, { method: 'DELETE' }),
  removeMedia: (id: string) => call<{ deleted: boolean }>(`/media/${id}`, { method: 'DELETE' }),

  /** Lädt eine Datei hoch. PNG/WebP/HEIC-fähige Browser-Bilder werden vorher in JPEG umgewandelt (Instagram nimmt nur JPEG). */
  async upload(file: File): Promise<Media> {
    let body: Blob = file;
    let type = file.type;
    if (type.startsWith('image/') && type !== 'image/jpeg') {
      body = await toJpeg(file);
      type = 'image/jpeg';
    }
    const res = await call<{ media: Media }>('/upload', {
      method: 'POST',
      headers: { 'Content-Type': type, 'X-Filename': encodeURIComponent(file.name) },
      body,
    });
    return res.media;
  },
};

async function toJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff'; // transparente Flächen weiß statt schwarz
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Bild konnte nicht umgewandelt werden.'))), 'image/jpeg', 0.92),
  );
}

// ---------------- Datum ----------------

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes());
/** Montag der Woche */
export const startOfWeek = (d: Date) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));
export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Für <input type="datetime-local"> (lokale Zeit) */
export function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
export const fromLocalInput = (v: string): string | null => (v ? new Date(v).toISOString() : null);

export const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
