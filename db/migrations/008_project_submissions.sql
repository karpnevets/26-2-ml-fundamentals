-- Run this file once in the existing site's Neon SQL Editor. Safe to rerun.
CREATE TABLE IF NOT EXISTS optional_project_submissions (
  project_id text NOT NULL REFERENCES optional_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  filename text NOT NULL CHECK (length(filename) BETWEEN 7 AND 150),
  notebook_text text NOT NULL CHECK (octet_length(notebook_text) <= 3145728),
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','requested','reviewed')),
  feedback text NOT NULL DEFAULT '' CHECK (length(feedback) <= 5000),
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  requested_at timestamptz,
  reviewed_at timestamptz,
  reviewer_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  PRIMARY KEY (project_id,user_id)
);
CREATE INDEX IF NOT EXISTS optional_submissions_requested
  ON optional_project_submissions(status,requested_at);
