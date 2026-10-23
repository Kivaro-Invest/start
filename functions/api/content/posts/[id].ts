// /api/content/posts/:id – GET · PUT (ändern) · DELETE (samt Medien)
import { json } from '../../../../server/shared';
import { loadPosts, noDb, type ContentEnv, type MediaRow, type PostInput, type PostRow } from '../../../../server/content';
import { savePost } from '../../../../server/contentSave';

type Ctx = { request: Request; env: ContentEnv; params: { id: string } };

export const onRequestGet = async ({ env, params }: Ctx) => {
  if (!env.CONTENT_DB) return noDb();
  const [post] = await loadPosts(env.CONTENT_DB, 'WHERE id = ?', [params.id]);
  return post ? json(200, { post }) : json(404, { error: 'Nicht gefunden' });
};

export const onRequestPut = async ({ request, env, params }: Ctx) => {
  if (!env.CONTENT_DB) return noDb();
  const existing = await env.CONTENT_DB.prepare('SELECT * FROM posts WHERE id = ?').bind(params.id).first<PostRow>();
  if (!existing) return json(404, { error: 'Nicht gefunden' });
  const input = (await request.json().catch(() => null)) as PostInput | null;
  if (!input) return json(400, { error: 'Ungültige Anfrage' });
  return savePost(env.CONTENT_DB, params.id, input, existing);
};

export const onRequestDelete = async ({ env, params }: Ctx) => {
  if (!env.CONTENT_DB) return noDb();
  const db = env.CONTENT_DB;
  const media = (await db.prepare('SELECT * FROM media WHERE post_id = ?').bind(params.id).all<MediaRow>()).results;
  // Veröffentlichte Beiträge bleiben auf Instagram stehen – hier wird nur der Kalendereintrag gelöscht.
  await db.batch([
    db.prepare('DELETE FROM media WHERE post_id = ?').bind(params.id),
    db.prepare('DELETE FROM posts WHERE id = ?').bind(params.id),
  ]);
  if (media.length && env.CONTENT_MEDIA) await env.CONTENT_MEDIA.delete(media.map((m) => m.r2_key));
  return json(200, { deleted: true });
};
