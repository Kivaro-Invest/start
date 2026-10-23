# Content-Kalender (`/content`)

Interner Bereich zum Planen von Instagram-Beiträgen. Schritt 1: Kalender, Medien-Upload, Automationen speichern.
Automatisches Posten (Cron-Worker) und Auto-Reply (Webhook) folgen in eigenen PRs.

## Aufbau

| Teil | Wo |
|---|---|
| Oberfläche | `src/pages/content/` (Route `/content`, ohne Website-Layout und Cookie-Banner, `noindex`) |
| Admin-API | `functions/api/content/*` – geschützt durch `_middleware.ts` |
| Medien öffentlich | `functions/media/[key].ts` → `/media/<uuid>.jpg|mp4|mov` (Instagram lädt die Dateien von dort) |
| Datenbank | D1 `kivaro-content`, Binding `CONTENT_DB`, Schema in `migrations/` |
| Dateien | R2 `kivaro-content-media`, Binding `CONTENT_MEDIA` |

Status eines Beitrags: `idee` → `fertig` → `geplant` → `gepostet` / `fehler`.
„geplant“ wird nur gespeichert, wenn der Beitrag postbar ist (Datum, passende Medien je Format, ≤ 2.200 Zeichen, ≤ 30 Hashtags).
Bilder wandelt der Browser vor dem Hochladen in JPEG um, weil Instagram nur JPEG annimmt.

## Einrichtung (einmalig)

1. **R2 aktivieren:** Cloudflare-Dashboard → R2 Object Storage → aktivieren (kostenloses Kontingent: 10 GB).
   Danach den Bucket anlegen:
   ```bash
   npx wrangler r2 bucket create kivaro-content-media
   ```
2. **Datenbank:** ist angelegt, Schema ist eingespielt. Neue Migrationen:
   ```bash
   npx wrangler d1 migrations apply kivaro-content --remote
   ```
3. **Passwort** für den Admin-Bereich als Secret im Pages-Projekt setzen:
   ```bash
   npx wrangler pages secret put CONTENT_ADMIN_PASSWORD --project-name kivaro-invest
   ```
   Passwort ändern meldet alle Sitzungen ab.

## Lokal testen

```bash
npx wrangler d1 migrations apply kivaro-content --local
echo CONTENT_ADMIN_PASSWORD=lokal-test > .dev.vars
npm run cf:dev
```
Dann `http://127.0.0.1:8788/content` öffnen.
