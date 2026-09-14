-- No lesson text or quiz answers in this schema file.
CREATE TABLE IF NOT EXISTS course_originals (
 week smallint PRIMARY KEY CHECK (week BETWEEN 0 AND 8),
 body text NOT NULL CHECK (length(body)>0),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS course_documents (
 name text PRIMARY KEY,
 body text NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
