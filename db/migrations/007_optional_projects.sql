CREATE TABLE IF NOT EXISTS optional_projects (
  id text PRIMARY KEY CHECK (id ~ '^[a-z0-9-]{1,80}$'),
  week smallint NOT NULL CHECK (week BETWEEN 1 AND 8),
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT false,
  revision integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
