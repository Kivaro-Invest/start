// /api/content/posts – GET: Beiträge im Zeitraum (?from&to) oder ohne Termin (?unscheduled=1) · POST: anlegen
import { json } from '../../../../server/shared';
import { loadPosts, noDb, type ContentEnv, type PostInput } from '../../../../server/content';
import { savePost } from '../../../../server/contentSave';

type Ctx = { request: Request; env: ContentEnv };

export const onRequestGet = async ({ request, env }: Ctx) => {
  if (!env.CONTENT_DB) return noDb();
  const url = new URL(request.url);
  if (url.searchParams.get('unscheduled') === '1') {
    return json(200, { posts: await loadPosts(env.CONTENT_DB, 'WHERE scheduled_at IS NULL ORDER BY updated_at DESC LIMIT 200', []) });
  }
  const from = new Date(url.searchParams.get('from') || '');
  const to = new Date(url.searchParams.get('to') || '');
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return json(400, { error: 'from/to fehlen.' });
  const posts = await loadPosts(env.CONTENT_DB, 'WHERE scheduled_at >= ? AND scheduled_at < ? ORDER BY scheduled_at LIMIT 500', [
    from.toISOString(),
    to.toISOString(),
  ]);
  return json(200, { posts });
};

export const onRequestPost = async ({ request, env }: Ctx) => {
  if (!env.CONTENT_DB) return noDb();
  const input = (await request.json().catch(() => null)) as PostInput | null;
  if (!input) return json(400, { error: 'Ungültige Anfrage' });
  return savePost(env.CONTENT_DB, crypto.randomUUID(), input, null);
};
