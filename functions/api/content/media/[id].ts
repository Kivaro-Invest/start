// DELETE /api/content/media/:id – Datei aus R2 und Datenbank entfernen
import { json } from '../../../../server/shared';
import { noDb, type ContentEnv, type MediaRow } from '../../../../server/content';

type Ctx = { env: ContentEnv; params: { id: string } };

export const onRequestDelete = async ({ env, params }: Ctx) => {
  if (!env.CONTENT_DB) return noDb();
  const m = await env.CONTENT_DB.prepare('SELECT * FROM media WHERE id = ?').bind(params.id).first<MediaRow>();
  if (!m) return json(404, { error: 'Nicht gefunden' });
  if (m.post_id) {
    const post = await env.CONTENT_DB.prepare('SELECT status FROM posts WHERE id = ?').bind(m.post_id).first<{ status: string }>();
    if (post?.status === 'gepostet') return json(409, { error: 'Der Beitrag ist schon veröffentlicht.' });
  }
  await env.CONTENT_DB.prepare('DELETE FROM media WHERE id = ?').bind(m.id).run();
  await env.CONTENT_MEDIA?.delete(m.r2_key);
  return json(200, { deleted: true });
};
