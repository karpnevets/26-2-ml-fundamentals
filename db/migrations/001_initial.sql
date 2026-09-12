CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_sub text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE CHECK (email ~ '^[^@[:space:]]+@snu[.]ac[.]kr$'),
  name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz NOT NULL DEFAULT now(),
  disabled_at timestamptz
);
CREATE TABLE IF NOT EXISTS learning_items (
  id text PRIMARY KEY,
  week smallint NOT NULL CHECK (week BETWEEN 0 AND 8),
  kind text NOT NULL CHECK (kind IN ('concept','assignment')),
  label text NOT NULL
);
CREATE TABLE IF NOT EXISTS learning_progress (
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  item_id text NOT NULL REFERENCES learning_items(id),
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id,item_id)
);
CREATE INDEX IF NOT EXISTS learning_progress_item_completed ON learning_progress(item_id) WHERE completed;
CREATE INDEX IF NOT EXISTS learning_progress_updated ON learning_progress(updated_at DESC);
-- No public/anonymous database role: every app query is made on the server after session authorization.
