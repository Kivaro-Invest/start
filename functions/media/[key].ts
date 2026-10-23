// GET /media/:key – liefert hochgeladene Bilder/Videos aus R2 aus (öffentlich, damit Instagram sie abrufen kann).
// Unterstützt Range-Anfragen, damit Videos abspielbar und für Instagram ladbar sind.
import type { ContentEnv } from '../../server/content';

type Ctx = { request: Request; env: ContentEnv; params: { key: string } };

const KEY_RE = /^[0-9a-f-]{36}\.(jpg|mp4|mov)$/;

export const onRequestGet = async ({ request, env, params }: Ctx) => {
  if (!env.CONTENT_MEDIA || !KEY_RE.test(params.key)) return new Response('Not found', { status: 404 });

  const range = parseRange(request.headers.get('Range'));
  const obj = await env.CONTENT_MEDIA.get(params.key, range ? { range } : undefined);
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers({
    'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Accept-Ranges': 'bytes',
    ETag: obj.httpEtag,
    'X-Robots-Tag': 'noindex',
  });
  if (range && obj.range) {
    const start = 'suffix' in range ? obj.size - range.suffix : range.offset;
    const length = 'suffix' in range ? range.suffix : (range.length ?? obj.size - range.offset);
    headers.set('Content-Range', `bytes ${start}-${start + length - 1}/${obj.size}`);
    headers.set('Content-Length', String(length));
    return new Response(obj.body, { status: 206, headers });
  }
  headers.set('Content-Length', String(obj.size));
  return new Response(obj.body, { headers });
};

export const onRequestHead = onRequestGet;

function parseRange(h: string | null): { offset: number; length?: number } | { suffix: number } | undefined {
  const m = h?.match(/^bytes=(\d*)-(\d*)$/);
  if (!m || (!m[1] && !m[2])) return undefined;
  if (!m[1]) return { suffix: Number(m[2]) };
  const offset = Number(m[1]);
  return m[2] ? { offset, length: Number(m[2]) - offset + 1 } : { offset };
}
