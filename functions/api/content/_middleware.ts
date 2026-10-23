// Schützt alles unter /api/content – außer dem Login selbst.
import { json } from '../../../server/shared';
import { sessionValid, type ContentEnv } from '../../../server/content';

type Ctx = { request: Request; env: ContentEnv; next: () => Promise<Response> };

export const onRequest = async ({ request, env, next }: Ctx) => {
  const { pathname } = new URL(request.url);
  if (pathname === '/api/content/login') return next();
  if (!env.CONTENT_ADMIN_PASSWORD) return json(503, { error: 'CONTENT_ADMIN_PASSWORD ist nicht gesetzt.' });
  if (!(await sessionValid(env, request))) return json(401, { error: 'Bitte anmelden.' });

  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set('Cache-Control', 'no-store');
  out.headers.set('X-Robots-Tag', 'noindex');
  return out;
};
