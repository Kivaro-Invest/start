import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { DragEvent, FormEvent } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Film, Images, Loader2, LogOut, Plus, Zap } from 'lucide-react';
import PostEditor from './PostEditor';
import {
  ApiError,
  FORMAT_LABEL,
  STATUS_LABEL,
  STATUS_STYLE,
  addDays,
  api,
  dayKey,
  sameDay,
  startOfDay,
  startOfWeek,
  timeLabel,
  type Post,
} from '../../lib/contentApi';

type View = 'monat' | 'woche';
type EditorState = { post: Post | null; date?: string | null; files?: File[] } | null;

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const DEFAULT_HOUR = 18; // neue Beiträge standardmäßig um 18:00
const POST_MIME = 'application/x-kivaro-post';

export default function ContentPage() {
  const [auth, setAuth] = useState<'laden' | 'nein' | 'ja' | 'fehlt'>('laden');

  useEffect(() => {
    document.title = 'Content-Kalender – Kivaro';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    api
      .session()
      .then((s) => setAuth(!s.configured ? 'fehlt' : s.loggedIn ? 'ja' : 'nein'))
      .catch(() => setAuth('nein'));
    return () => meta.remove();
  }, []);

  if (auth === 'laden') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }
  if (auth === 'fehlt') {
    return (
      <Centered>
        <p className="text-sm text-zinc-700">
          Der Admin-Bereich ist noch nicht eingerichtet: In Cloudflare fehlt das Secret <code>CONTENT_ADMIN_PASSWORD</code>.
        </p>
      </Centered>
    );
  }
  if (auth === 'nein') return <Login onDone={() => setAuth('ja')} />;
  return <Calendar onLogout={() => setAuth('nein')} />;
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <img src="/logo-kivaro.svg" alt="Kivaro Invest" className="mb-5 h-10 w-auto" />
        {children}
      </div>
    </div>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.login(password);
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Centered>
      <h1 className="mb-4 text-lg font-semibold text-zinc-900">Content-Kalender</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passwort"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy || !password} className="w-full rounded-md bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
          {busy ? 'Anmelden …' : 'Anmelden'}
        </button>
      </form>
    </Centered>
  );
}

function Calendar({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<View>(() => (window.innerWidth < 768 ? 'woche' : 'monat'));
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
  const [posts, setPosts] = useState<Post[]>([]);
  const [ideas, setIdeas] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editor, setEditor] = useState<EditorState>(null);
  const [dropDay, setDropDay] = useState<string | null>(null);

  const days = useMemo(() => {
    if (view === 'woche') {
      const start = startOfWeek(anchor);
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const start = startOfWeek(first);
    const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    const weeks = Math.ceil(((last.getTime() - start.getTime()) / 86_400_000 + 1) / 7);
    return Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i));
  }, [view, anchor]);

  const handleError = useCallback(
    (e: unknown) => {
      if (e instanceof ApiError && e.status === 401) onLogout();
      else setError((e as Error).message);
    },
    [onLogout],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [range, unscheduled] = await Promise.all([api.postsBetween(days[0], addDays(days[days.length - 1], 1)), api.unscheduled()]);
      setPosts(range.posts);
      setIdeas(unscheduled.posts);
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  }, [days, handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  const byDay = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const p of posts) {
      const k = dayKey(new Date(p.scheduledAt!));
      map.set(k, [...(map.get(k) || []), p]);
    }
    return map;
  }, [posts]);

  const shift = (dir: -1 | 1) =>
    setAnchor((a) => (view === 'woche' ? addDays(a, dir * 7) : new Date(a.getFullYear(), a.getMonth() + dir, 1)));

  const title =
    view === 'monat'
      ? anchor.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
      : `${days[0].toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })} – ${days[6].toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const defaultTime = (day: Date) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), DEFAULT_HOUR).toISOString();

  // Beitrag auf einen Tag ziehen = umplanen (Uhrzeit bleibt), auf „Ohne Termin“ ziehen = Termin entfernen
  async function moveTo(id: string, day: Date | null) {
    const post = [...posts, ...ideas].find((p) => p.id === id);
    if (!post || post.status === 'gepostet') return;
    let scheduledAt: string | null = null;
    if (day) {
      const old = post.scheduledAt ? new Date(post.scheduledAt) : null;
      scheduledAt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), old?.getHours() ?? DEFAULT_HOUR, old?.getMinutes() ?? 0).toISOString();
    }
    try {
      await api.update(id, { scheduledAt, ...(day ? {} : post.status === 'geplant' || post.status === 'fehler' ? { status: 'fertig' as const } : {}) });
      await load();
    } catch (e) {
      handleError(e);
    }
  }

  function onDayDrop(e: DragEvent, day: Date | null) {
    e.preventDefault();
    setDropDay(null);
    const id = e.dataTransfer.getData(POST_MIME);
    if (id) return void moveTo(id, day);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) setEditor({ post: null, date: day ? defaultTime(day) : null, files });
  }

  const dropProps = (key: string, day: Date | null) => ({
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      setDropDay(key);
    },
    onDragLeave: () => setDropDay((k) => (k === key ? null : k)),
    onDrop: (e: DragEvent) => onDayDrop(e, day),
  });

  const today = new Date();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3">
          <img src="/logo-kivaro.svg" alt="Kivaro Invest" className="h-8 w-auto" />
          <span className="hidden sm:inline text-sm font-semibold text-zinc-500">Content-Kalender</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex rounded-md border border-zinc-300 p-0.5 text-sm">
              {(['monat', 'woche'] as View[]).map((v) => (
                <button key={v} onClick={() => setView(v)} className={`rounded px-3 py-1 font-medium ${view === v ? 'bg-emerald-600 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}>
                  {v === 'monat' ? 'Monat' : 'Woche'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setEditor({ post: null, date: null })}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Neuer Beitrag</span>
            </button>
            <button
              onClick={() => api.logout().finally(onLogout)}
              className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100"
              aria-label="Abmelden"
              title="Abmelden"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-4 lg:flex-row">
        <main className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-2">
            <button onClick={() => shift(-1)} className="rounded-md border border-zinc-300 bg-white p-1.5 hover:bg-zinc-100" aria-label="Zurück">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => shift(1)} className="rounded-md border border-zinc-300 bg-white p-1.5 hover:bg-zinc-100" aria-label="Weiter">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button onClick={() => setAnchor(startOfDay(new Date()))} className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm hover:bg-zinc-100">
              Heute
            </button>
            <h1 className="ml-2 text-lg font-semibold capitalize">{title}</h1>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />}
          </div>
          {error && <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          {view === 'monat' ? (
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
              <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50 text-center text-xs font-semibold text-zinc-500">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {days.map((day) => {
                  const k = dayKey(day);
                  const inMonth = day.getMonth() === anchor.getMonth();
                  return (
                    <div
                      key={k}
                      {...dropProps(k, day)}
                      onDoubleClick={() => setEditor({ post: null, date: defaultTime(day) })}
                      className={`min-h-28 border-b border-r border-zinc-100 p-1.5 ${inMonth ? '' : 'bg-zinc-50/70'} ${dropDay === k ? 'bg-emerald-50 ring-2 ring-inset ring-emerald-400' : ''}`}
                    >
                      <div className={`mb-1 text-xs font-semibold ${sameDay(day, today) ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white' : inMonth ? 'text-zinc-700' : 'text-zinc-400'}`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {(byDay.get(k) || []).map((p) => (
                          <PostChip key={p.id} post={p} compact onOpen={() => setEditor({ post: p })} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-7">
              {days.map((day) => {
                const k = dayKey(day);
                return (
                  <div
                    key={k}
                    {...dropProps(k, day)}
                    className={`min-h-40 rounded-lg border bg-white p-2 md:min-h-[60vh] ${dropDay === k ? 'border-emerald-400 bg-emerald-50' : 'border-zinc-200'}`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`text-sm font-semibold ${sameDay(day, today) ? 'text-emerald-700' : 'text-zinc-700'}`}>
                        {day.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                      </span>
                      <button onClick={() => setEditor({ post: null, date: defaultTime(day) })} className="rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-emerald-700" aria-label="Beitrag an diesem Tag">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(byDay.get(k) || []).map((p) => (
                        <PostChip key={p.id} post={p} stacked onOpen={() => setEditor({ post: p })} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className="mt-2 text-xs text-zinc-500">
            Tipp: Bilder oder Videos auf einen Tag ziehen legt einen neuen Beitrag an. Beiträge lassen sich auf einen anderen Tag ziehen.
          </p>
        </main>

        <aside
          {...dropProps('ideen', null)}
          className={`w-full shrink-0 rounded-lg border bg-white p-3 lg:w-72 lg:self-start ${dropDay === 'ideen' ? 'border-emerald-400 bg-emerald-50' : 'border-zinc-200'}`}
        >
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700">
            <CalendarDays className="h-4 w-4" /> Ohne Termin ({ideas.length})
          </h2>
          <div className="space-y-2">
            {ideas.map((p) => (
              <PostChip key={p.id} post={p} onOpen={() => setEditor({ post: p })} />
            ))}
            {!ideas.length && <p className="text-xs text-zinc-500">Ideen ohne Datum landen hier. Zum Einplanen auf einen Tag ziehen.</p>}
          </div>
        </aside>
      </div>

      {editor && (
        <PostEditor
          post={editor.post}
          initialDate={editor.date}
          initialFiles={editor.files}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            void load();
          }}
          onDeleted={() => {
            setEditor(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

// key steht mit im Typ, weil das Projekt ohne @types/react typisiert wird
function PostChip({ post, compact, stacked, onOpen }: { key?: string; post: Post; compact?: boolean; stacked?: boolean; onOpen: () => void }) {
  const first = post.media[0];
  const draggable = post.status !== 'gepostet';
  return (
    <button
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData(POST_MIME, post.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={onOpen}
      className={`flex w-full gap-2 rounded-md border text-left text-xs ${stacked ? 'flex-col' : 'items-center'} ${STATUS_STYLE[post.status]} ${compact ? 'px-1.5 py-1' : 'p-1.5'} ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      title={`${FORMAT_LABEL[post.format]} · ${STATUS_LABEL[post.status]}${post.error ? ` · ${post.error}` : ''}`}
    >
      {!compact && (
        <span className={`relative shrink-0 overflow-hidden rounded bg-white/70 ${stacked ? (first ? 'aspect-[4/5] w-full max-w-40 md:max-w-none' : 'hidden') : 'h-12 w-10'}`}>
          {first &&
            (first.contentType.startsWith('video/') ? (
              <video src={`${first.url}#t=0.5`} className="h-full w-full object-cover" muted preload="metadata" />
            ) : (
              <img src={first.url} alt="" className="h-full w-full object-cover" loading="lazy" />
            ))}
        </span>
      )}
      <span className="min-w-0 flex-1 w-full">
        <span className="flex flex-wrap items-center gap-1 font-semibold">
          {post.scheduledAt && <span>{timeLabel(post.scheduledAt)}</span>}
          {post.format === 'reel' || post.format === 'story' ? <Film className="h-3 w-3" /> : post.format === 'karussell' ? <Images className="h-3 w-3" /> : null}
          <span>{FORMAT_LABEL[post.format]}</span>
          {post.automation?.active && <Zap className="h-3 w-3" />}
        </span>
        {!compact && <span className="block truncate opacity-80">{post.caption || STATUS_LABEL[post.status]}</span>}
      </span>
    </button>
  );
}
