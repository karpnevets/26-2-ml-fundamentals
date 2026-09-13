CREATE TABLE IF NOT EXISTS week_quizzes (
 week smallint PRIMARY KEY CHECK (week BETWEEN 2 AND 8),
 questions jsonb NOT NULL DEFAULT '[]',
 instructions text NOT NULL DEFAULT '',
 password_hash text NOT NULL DEFAULT '',
 published boolean NOT NULL DEFAULT false,
 revision integer NOT NULL DEFAULT 1,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS week_unlocks (
 user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 week smallint NOT NULL CHECK (week BETWEEN 2 AND 8),
 unlocked_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,week)
);
CREATE TABLE IF NOT EXISTS quiz_attempts (
 user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 week smallint NOT NULL CHECK (week BETWEEN 2 AND 8),
 window_start timestamptz NOT NULL DEFAULT now(),
 attempts integer NOT NULL DEFAULT 1,
 PRIMARY KEY(user_id,week)
);
CREATE TABLE IF NOT EXISTS lesson_edits (
 week smallint PRIMARY KEY CHECK (week BETWEEN 0 AND 8),
 body text NOT NULL,
 revision integer NOT NULL DEFAULT 1,
 updated_at timestamptz NOT NULL DEFAULT now()
);
