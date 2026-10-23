-- Content-Kalender: Beiträge, Medien, Automationen und Protokoll der Auto-Replies

CREATE TABLE posts (
  id              TEXT PRIMARY KEY,
  scheduled_at    TEXT,                       -- ISO-Zeitpunkt in UTC, NULL = noch kein Termin
  format          TEXT NOT NULL DEFAULT 'bild'
                  CHECK (format IN ('reel', 'bild', 'karussell', 'story')),
  caption         TEXT NOT NULL DEFAULT '',
  hashtags        TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'idee'
                  CHECK (status IN ('idee', 'fertig', 'geplant', 'gepostet', 'fehler')),
  ig_container_id TEXT,                       -- Instagram-Container während des Postens
  ig_media_id     TEXT,                       -- veröffentlichter Beitrag
  permalink       TEXT,
  error           TEXT,
  attempts        INTEGER NOT NULL DEFAULT 0,
  published_at    TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);
CREATE INDEX posts_scheduled ON posts (scheduled_at);
CREATE INDEX posts_due ON posts (status, scheduled_at);
CREATE INDEX posts_ig_media ON posts (ig_media_id);

CREATE TABLE media (
  id           TEXT PRIMARY KEY,
  post_id      TEXT REFERENCES posts (id) ON DELETE SET NULL,
  r2_key       TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  size         INTEGER NOT NULL,
  filename     TEXT NOT NULL DEFAULT '',
  position     INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL
);
CREATE INDEX media_post ON media (post_id, position);

CREATE TABLE automations (
  post_id      TEXT PRIMARY KEY REFERENCES posts (id) ON DELETE CASCADE,
  keywords     TEXT NOT NULL DEFAULT '[]',    -- JSON-Array, z. B. ["CHECK"]
  public_reply TEXT NOT NULL DEFAULT '',
  dm_text      TEXT NOT NULL DEFAULT '',
  active       INTEGER NOT NULL DEFAULT 1,
  updated_at   TEXT NOT NULL
);

CREATE TABLE automation_log (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id         TEXT,
  ig_media_id     TEXT,
  comment_id      TEXT NOT NULL UNIQUE,       -- Meta erlaubt nur eine private Antwort je Kommentar
  username        TEXT,
  comment_text    TEXT,
  keyword         TEXT,
  public_reply_ok INTEGER,
  dm_ok           INTEGER,
  error           TEXT,
  created_at      TEXT NOT NULL
);
CREATE INDEX automation_log_post ON automation_log (post_id, created_at);
