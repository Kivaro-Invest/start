import { useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Film, Loader2, Trash2, Upload, X, Zap } from 'lucide-react';
import {
  FORMAT_LABEL,
  STATUS_LABEL,
  api,
  fromLocalInput,
  toLocalInput,
  type Automation,
  type Format,
  type Media,
  type Post,
  type Status,
} from '../../lib/contentApi';

const DEFAULT_AUTOMATION: Automation = {
  keywords: ['CHECK'],
  publicReply: 'Danke dir! Schau in deine DMs 📩',
  dmText:
    'Hi! Hier ist dein Link zum kostenlosen Investment-Check: https://kivaro-invest.de/investment-check?utm_source=instagram&utm_medium=dm&utm_campaign=auto-reply',
  active: true,
};

type Props = {
  post: Post | null; // null = neuer Beitrag
  initialDate?: string | null; // ISO, für neue Beiträge
  initialFiles?: File[];
  onClose: () => void;
  onSaved: (post: Post) => void;
  onDeleted: (id: string) => void;
};

type Uploading = { name: string; error?: string };

export default function PostEditor({ post, initialDate, initialFiles, onClose, onSaved, onDeleted }: Props) {
  const posted = post?.status === 'gepostet';
  const [scheduledAt, setScheduledAt] = useState(toLocalInput(post?.scheduledAt ?? initialDate ?? null));
  const [format, setFormat] = useState<Format>(post?.format ?? 'bild');
  const [status, setStatus] = useState<Status>(post?.status ?? 'idee');
  const [caption, setCaption] = useState(post?.caption ?? '');
  const [hashtags, setHashtags] = useState(post?.hashtags ?? '');
  const [media, setMedia] = useState<Media[]>(post?.media ?? []);
  const [uploading, setUploading] = useState<Uploading[]>([]);
  const [autoOn, setAutoOn] = useState(Boolean(post?.automation));
  const [auto, setAuto] = useState<Automation>(post?.automation ?? DEFAULT_AUTOMATION);
  const [keywordText, setKeywordText] = useState((post?.automation ?? DEFAULT_AUTOMATION).keywords.join(', '));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  // Hier hochgeladene, noch nicht gespeicherte Dateien – beim Abbrechen wieder löschen
  const fresh = useRef(new Set<string>());

  useEffect(() => {
    if (initialFiles?.length) void addFiles(initialFiles);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  async function addFiles(files: File[]) {
    const list = files.filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'));
    if (!list.length) return;
    // Format passend vorschlagen, solange noch nichts drin ist
    if (!media.length && !post) {
      if (list.length > 1) setFormat('karussell');
      else if (list[0].type.startsWith('video/')) setFormat('reel');
    }
    for (const file of list) {
      setUploading((u) => [...u, { name: file.name }]);
      try {
        const m = await api.upload(file);
        fresh.current.add(m.id);
        setMedia((cur) => [...cur, m]);
        setUploading((u) => u.filter((x) => x.name !== file.name));
      } catch (e) {
        setUploading((u) => u.map((x) => (x.name === file.name ? { ...x, error: (e as Error).message } : x)));
      }
    }
  }

  function move(i: number, dir: -1 | 1) {
    setMedia((cur) => {
      const next = [...cur];
      const j = i + dir;
      if (j < 0 || j >= next.length) return cur;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function removeMedia(m: Media) {
    setMedia((cur) => cur.filter((x) => x.id !== m.id));
    // Noch nicht gespeicherte Dateien gleich löschen; gespeicherte erst beim Speichern lösen
    if (fresh.current.has(m.id)) {
      fresh.current.delete(m.id);
      await api.removeMedia(m.id).catch(() => undefined);
    }
  }

  function cancel() {
    for (const id of fresh.current) void api.removeMedia(id).catch(() => undefined);
    onClose();
  }

  async function save(nextStatus = status) {
    setSaving(true);
    setError('');
    const automation = autoOn
      ? { ...auto, keywords: keywordText.split(',').map((k) => k.trim()).filter(Boolean) }
      : null;
    const input = {
      scheduledAt: fromLocalInput(scheduledAt),
      format,
      caption,
      hashtags,
      status: nextStatus,
      mediaIds: media.map((m) => m.id),
      automation,
    };
    try {
      const res = post ? await api.update(post.id, input) : await api.create(input);
      // Vom Beitrag gelöste, früher gespeicherte Dateien endgültig entfernen
      for (const old of post?.media ?? []) if (!media.some((m) => m.id === old.id)) void api.removeMedia(old.id).catch(() => undefined);
      fresh.current.clear();
      onSaved(res.post);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!post) return cancel();
    const msg = posted
      ? 'Eintrag aus dem Kalender löschen? Der Beitrag bleibt auf Instagram stehen.'
      : 'Beitrag samt Dateien löschen?';
    if (!window.confirm(msg)) return;
    await api.remove(post.id);
    onDeleted(post.id);
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!posted) void addFiles(Array.from(e.dataTransfer.files));
  };

  const captionLength = caption.length + (hashtags ? hashtags.length + 1 : 0);
  const hashtagCount = (hashtags.match(/#/g) || []).length;
  const input = 'w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-zinc-50 disabled:text-zinc-500';
  const label = 'block text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && cancel()}>
      <div className="flex max-h-[100dvh] sm:max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-xl sm:rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
          <h2 className="text-lg font-semibold text-zinc-900">{post ? 'Beitrag bearbeiten' : 'Neuer Beitrag'}</h2>
          <button onClick={cancel} className="rounded p-1 text-zinc-500 hover:bg-zinc-100" aria-label="Schließen">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {post?.status === 'fehler' && post.error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <b>Posten fehlgeschlagen:</b> {post.error}
            </div>
          )}
          {posted && (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
              Veröffentlicht{post?.publishedAt ? ` am ${new Date(post.publishedAt).toLocaleString('de-DE')}` : ''}. Nur die Automation lässt sich noch ändern.
              {post?.permalink && (
                <a href={post.permalink} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-1 font-semibold underline">
                  Auf Instagram ansehen <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={label}>Datum & Uhrzeit</label>
              <input type="datetime-local" className={input} value={scheduledAt} disabled={posted} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
            <div>
              <label className={label}>Format</label>
              <select className={input} value={format} disabled={posted} onChange={(e) => setFormat(e.target.value as Format)}>
                {(Object.keys(FORMAT_LABEL) as Format[]).map((f) => (
                  <option key={f} value={f}>{FORMAT_LABEL[f]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Status</label>
              <select className={input} value={status} disabled={posted} onChange={(e) => setStatus(e.target.value as Status)}>
                {(['idee', 'fertig', 'geplant'] as Status[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
                {(status === 'fehler' || posted) && <option value={status}>{STATUS_LABEL[status]}</option>}
              </select>
            </div>
          </div>

          <div>
            <label className={label}>Medien {format === 'karussell' ? '(2–10, Reihenfolge = Reihenfolge im Karussell)' : ''}</label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`rounded-lg border-2 border-dashed p-3 transition-colors ${dragOver ? 'border-emerald-500 bg-emerald-50' : 'border-zinc-300'}`}
            >
              <div className="flex flex-wrap gap-3">
                {media.map((m, i) => (
                  <div key={m.id} className="group relative h-28 w-24 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
                    {m.contentType.startsWith('video/') ? (
                      <>
                        <video src={m.url} className="h-full w-full object-cover" muted preload="metadata" />
                        <Film className="absolute left-1 top-1 h-4 w-4 text-white drop-shadow" />
                      </>
                    ) : (
                      <img src={m.url} alt={m.filename} className="h-full w-full object-cover" />
                    )}
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 text-xs font-semibold text-white">{i + 1}</span>
                    {!posted && (
                      <div className="absolute inset-x-0 top-0 flex justify-end gap-0.5 p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                        <button onClick={() => move(i, -1)} className="rounded bg-white/90 p-0.5" aria-label="Nach vorne"><ArrowLeft className="h-3.5 w-3.5" /></button>
                        <button onClick={() => move(i, 1)} className="rounded bg-white/90 p-0.5" aria-label="Nach hinten"><ArrowRight className="h-3.5 w-3.5" /></button>
                        <button onClick={() => removeMedia(m)} className="rounded bg-white/90 p-0.5 text-red-600" aria-label="Entfernen"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    )}
                  </div>
                ))}
                {uploading.map((u) => (
                  <div key={u.name} className="flex h-28 w-24 flex-col items-center justify-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 p-1 text-center text-[11px] text-zinc-500">
                    {u.error ? <span className="text-red-600">{u.error}</span> : <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />}
                    <span className="line-clamp-2 break-all">{u.name}</span>
                  </div>
                ))}
                {!posted && (
                  <button
                    onClick={() => fileInput.current?.click()}
                    className="flex h-28 w-24 flex-col items-center justify-center gap-1 rounded-md border border-zinc-200 text-xs text-zinc-500 hover:border-emerald-400 hover:text-emerald-700"
                  >
                    <Upload className="h-5 w-5" />
                    Hinzufügen
                  </button>
                )}
              </div>
              {!posted && <p className="mt-2 text-xs text-zinc-500">Dateien hierher ziehen. Bilder werden als JPEG gespeichert, Videos als MP4/MOV (max. 95 MB).</p>}
              <input
                ref={fileInput}
                type="file"
                multiple
                accept="image/*,video/mp4,video/quicktime"
                className="hidden"
                onChange={(e) => {
                  void addFiles(Array.from(e.target.files || []));
                  e.target.value = '';
                }}
              />
            </div>
          </div>

          {format !== 'story' && (
            <>
              <div>
                <label className={label}>Caption</label>
                <textarea className={`${input} min-h-32`} value={caption} disabled={posted} onChange={(e) => setCaption(e.target.value)} placeholder="Text zum Beitrag …" />
              </div>
              <div>
                <label className={label}>Hashtags</label>
                <input className={input} value={hashtags} disabled={posted} onChange={(e) => setHashtags(e.target.value)} placeholder="#kapitalanlage #immobilien" />
                <p className={`mt-1 text-xs ${captionLength > 2200 || hashtagCount > 30 ? 'text-red-600' : 'text-zinc-500'}`}>
                  {captionLength} / 2.200 Zeichen · {hashtagCount} / 30 Hashtags
                </p>
              </div>
            </>
          )}

          <div className="rounded-lg border border-zinc-200">
            <label className="flex cursor-pointer items-center gap-3 px-4 py-3">
              <input type="checkbox" checked={autoOn} onChange={(e) => setAutoOn(e.target.checked)} className="h-4 w-4 accent-emerald-600" />
              <Zap className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-zinc-900">Auto-Reply auf Schlüsselwort</span>
            </label>
            {autoOn && (
              <div className="space-y-3 border-t border-zinc-200 px-4 py-3">
                <div>
                  <label className={label}>Schlüsselwörter (mit Komma getrennt)</label>
                  <input className={input} value={keywordText} onChange={(e) => setKeywordText(e.target.value)} placeholder="CHECK" />
                </div>
                <div>
                  <label className={label}>Öffentliche Antwort unter dem Kommentar</label>
                  <input className={input} value={auto.publicReply} onChange={(e) => setAuto({ ...auto, publicReply: e.target.value })} />
                </div>
                <div>
                  <label className={label}>DM-Text</label>
                  <textarea className={`${input} min-h-20`} value={auto.dmText} onChange={(e) => setAuto({ ...auto, dmText: e.target.value })} />
                </div>
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input type="checkbox" checked={auto.active} onChange={(e) => setAuto({ ...auto, active: e.target.checked })} className="h-4 w-4 accent-emerald-600" />
                  aktiv
                </label>
                <p className="text-xs text-zinc-500">Instagram erlaubt eine DM pro Kommentar, innerhalb von 7 Tagen. Läuft erst, wenn der Webhook eingerichtet ist.</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-200 px-5 py-3">
          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={remove} className="mr-auto inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" /> {post ? 'Löschen' : 'Verwerfen'}
            </button>
            <button onClick={cancel} className="rounded-md px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100">Abbrechen</button>
            {!posted && status !== 'geplant' && (
              <button
                onClick={() => save('geplant')}
                disabled={saving || uploading.some((u) => !u.error)}
                className="rounded-md border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
              >
                Einplanen
              </button>
            )}
            <button
              onClick={() => save()}
              disabled={saving || uploading.some((u) => !u.error)}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
