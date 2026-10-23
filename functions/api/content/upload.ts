// POST /api/content/upload – Rohdaten im Body, Dateiname im Header X-Filename.
// Die Datei landet in R2; verknüpft wird sie beim Speichern des Beitrags (mediaIds).
import { clip, json } from '../../../server/shared';
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES, mediaToApi, noDb, type ContentEnv, type MediaRow } from '../../../server/content';

type Ctx = { request: Request; env: ContentEnv };

export const onRequestPost = async ({ request, env }: Ctx) => {
  if (!env.CONTENT_DB) return noDb();
  if (!env.CONTENT_MEDIA) return json(503, { error: 'Medienspeicher CONTENT_MEDIA (R2) ist nicht verbunden.' });

  const type = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
  const ext = ALLOWED_TYPES[type];
  if (!ext) return json(415, { error: 'Erlaubt sind JPEG-Bilder sowie MP4- oder MOV-Videos.' });

  const size = Number(request.headers.get('Content-Length') || 0);
  if (!size) return json(411, { error: 'Dateigröße fehlt.' });
  if (size > MAX_UPLOAD_BYTES) return json(413, { error: 'Datei zu groß (max. 95 MB).' });
  if (!request.body) return json(400, { error: 'Leere Datei.' });

  const id = crypto.randomUUID();
  // Zufälliger, nicht erratbarer Schlüssel – die Datei ist unter /media/<schlüssel> öffentlich abrufbar
  const key = `${id}.${ext}`;
  await env.CONTENT_MEDIA.put(key, request.body, { httpMetadata: { contentType: type } });

  const filename = clip(decodeURIComponent(request.headers.get('X-Filename') || ''), 200);
  const row: MediaRow = { id, post_id: null, r2_key: key, content_type: type, size, filename, position: 0 };
  await env.CONTENT_DB.prepare(
    'INSERT INTO media (id, post_id, r2_key, content_type, size, filename, position, created_at) VALUES (?, NULL, ?, ?, ?, ?, 0, ?)',
  )
    .bind(id, key, type, size, filename, new Date().toISOString())
    .run();
  return json(201, { media: mediaToApi(row) });
};
