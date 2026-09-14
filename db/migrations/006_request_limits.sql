-- Bounded storage: four counters per account, no visitor IP addresses stored.
CREATE TABLE IF NOT EXISTS api_rate_limits (
 user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 bucket text NOT NULL CHECK (bucket IN ('read','write','import','unlock')),
 window_start timestamptz NOT NULL DEFAULT now(),
 attempts integer NOT NULL DEFAULT 1 CHECK (attempts > 0),
 PRIMARY KEY(user_id,bucket)
);
