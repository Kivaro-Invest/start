// /api/content/login – GET: angemeldet? · POST: anmelden · DELETE: abmelden
import { json } from '../../../server/shared';
import {
  SESSION_MAX_AGE,
  createSession,
  safeEqual,
  sessionCookie,
  sessionValid,
  type ContentEnv,
} from '../../../server/content';

type Ctx = { request: Request; env: ContentEnv };

export const onRequestGet = async ({ request, env }: Ctx) =>
  json(200, { loggedIn: await sessionValid(env, request), configured: Boolean(env.CONTENT_ADMIN_PASSWORD) });

export const onRequestPost = async ({ request, env }: Ctx) => {
  if (!env.CONTENT_ADMIN_PASSWORD) return json(503, { error: 'CONTENT_ADMIN_PASSWORD ist nicht gesetzt.' });
  const body = (await request.json().catch(() => ({}))) as { password?: string };
  // Kleine Bremse gegen Durchprobieren
  await new Promise((r) => setTimeout(r, 400));
  if (!(await safeEqual(String(body.password ?? ''), env.CONTENT_ADMIN_PASSWORD))) {
    return json(401, { error: 'Passwort falsch.' });
  }
  const res = json(200, { loggedIn: true });
  res.headers.set('Set-Cookie', sessionCookie(await createSession(env.CONTENT_ADMIN_PASSWORD), SESSION_MAX_AGE));
  return res;
};

export const onRequestDelete = async () => {
  const res = json(200, { loggedIn: false });
  res.headers.set('Set-Cookie', sessionCookie('', 0));
  return res;
};
