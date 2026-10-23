// Anlegen und Ändern von Beiträgen im Content-Kalender (gemeinsam für POST /posts und PUT /posts/:id).
import { clip, json } from './shared';
import {
  FORMATS,
  STATUSES,
  loadPosts,
  normalizeKeywords,
  publishProblem,
  type D1,
  type D1Stmt,
  type Format,
  type MediaRow,
  type PostInput,
  type PostRow,
  type Status,
} from './content';

export async function savePost(db: D1, id: string, input: PostInput, existing: PostRow | null): Promise<Response> {
  const now = new Date().toISOString();

  if (existing?.status === 'gepostet') {
    // Schon veröffentlicht: nur die Automation darf sich noch ändern
    const stmts = automationStmts(db, id, input, now);
    if (stmts.length) await db.batch(stmts);
    return json(200, { post: (await loadPosts(db, 'WHERE id = ?', [id]))[0] });
  }

  let scheduledAt = existing?.scheduled_at ?? null;
  if (input.scheduledAt !== undefined) {
    if (input.scheduledAt === null || input.scheduledAt === '') scheduledAt = null;
    else {
      const d = new Date(input.scheduledAt);
      if (Number.isNaN(d.getTime())) return json(400, { error: 'Ungültiges Datum.' });
      scheduledAt = d.toISOString();
    }
  }

  const format = (input.format ?? existing?.format ?? 'bild') as Format;
  if (!FORMATS.includes(format)) return json(400, { error: 'Ungültiges Format.' });

  const status = (input.status ?? existing?.status ?? 'idee') as Status;
  if (!STATUSES.includes(status)) return json(400, { error: 'Ungültiger Status.' });
  if (status === 'gepostet') return json(400, { error: '„gepostet“ setzt das System nach dem Veröffentlichen.' });

  const caption = input.caption !== undefined ? clip(input.caption, 2200) : existing?.caption ?? '';
  const hashtags = input.hashtags !== undefined ? clip(input.hashtags, 1000) : existing?.hashtags ?? '';

  // Medien: Reihenfolge = Reihenfolge der IDs. Nur freie oder bereits zugehörige Medien dürfen verknüpft werden.
  let media: MediaRow[];
  const mediaStmts: D1Stmt[] = [];
  if (Array.isArray(input.mediaIds)) {
    const ids = [...new Set(input.mediaIds.map(String))].slice(0, 10);
    const found = ids.length
      ? (await db.prepare(`SELECT * FROM media WHERE id IN (${ids.map(() => '?').join(',')})`).bind(...ids).all<MediaRow>()).results
      : [];
    if (found.length !== ids.length || found.some((m) => m.post_id && m.post_id !== id)) {
      return json(400, { error: 'Unbekannte oder fremde Mediendatei.' });
    }
    media = ids.map((mid) => found.find((m) => m.id === mid)!);
    mediaStmts.push(db.prepare('UPDATE media SET post_id = NULL WHERE post_id = ?').bind(id));
    media.forEach((m, i) => mediaStmts.push(db.prepare('UPDATE media SET post_id = ?, position = ? WHERE id = ?').bind(id, i, m.id)));
  } else {
    media = (await db.prepare('SELECT * FROM media WHERE post_id = ? ORDER BY position').bind(id).all<MediaRow>()).results;
  }

  if (status === 'geplant') {
    const problem = publishProblem({ format, scheduledAt, caption, hashtags }, media);
    if (problem) return json(400, { error: problem });
  }

  // Erneut planen nach einem Fehler setzt Fehlertext und Versuche zurück
  const resetError = status !== 'fehler';
  const postStmt = existing
    ? db
        .prepare(
          `UPDATE posts SET scheduled_at = ?, format = ?, caption = ?, hashtags = ?, status = ?,
             error = CASE WHEN ? THEN NULL ELSE error END,
             attempts = CASE WHEN ? THEN 0 ELSE attempts END,
             ig_container_id = CASE WHEN ? THEN NULL ELSE ig_container_id END,
             updated_at = ? WHERE id = ?`,
        )
        .bind(scheduledAt, format, caption, hashtags, status, resetError ? 1 : 0, resetError ? 1 : 0, resetError ? 1 : 0, now, id)
    : db
        .prepare(
          `INSERT INTO posts (id, scheduled_at, format, caption, hashtags, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(id, scheduledAt, format, caption, hashtags, status, now, now);

  await db.batch([postStmt, ...mediaStmts, ...automationStmts(db, id, input, now)]);
  return json(existing ? 200 : 201, { post: (await loadPosts(db, 'WHERE id = ?', [id]))[0] });
}

function automationStmts(db: D1, id: string, input: PostInput, now: string): D1Stmt[] {
  if (input.automation === undefined) return [];
  const a = input.automation;
  const keywords = a ? normalizeKeywords(a.keywords) : [];
  if (!a || !keywords.length) return [db.prepare('DELETE FROM automations WHERE post_id = ?').bind(id)];
  return [
    db
      .prepare(
        `INSERT INTO automations (post_id, keywords, public_reply, dm_text, active, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT (post_id) DO UPDATE SET keywords = excluded.keywords, public_reply = excluded.public_reply,
           dm_text = excluded.dm_text, active = excluded.active, updated_at = excluded.updated_at`,
      )
      .bind(id, JSON.stringify(keywords), clip(a.publicReply, 300), clip(a.dmText, 1000), a.active === false ? 0 : 1, now),
  ];
}
