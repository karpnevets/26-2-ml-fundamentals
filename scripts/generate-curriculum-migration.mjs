import fs from 'node:fs';
import { catalog } from './db-catalog.mjs';
const rows = JSON.stringify(catalog()).replaceAll("'", "''");
const pending = "NOT EXISTS (SELECT 1 FROM curriculum_revisions WHERE revision='revised-v2')";
const sql = `-- Revised curriculum v2. Run inside db/setup.sql's transaction.
-- Keeps users and unlocked weeks. Backs up edits, quizzes and progress first.
CREATE TABLE IF NOT EXISTS curriculum_revisions (revision text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS curriculum_content_archive (revision text NOT NULL, kind text NOT NULL, data jsonb NOT NULL, PRIMARY KEY(revision,kind));
CREATE TABLE IF NOT EXISTS curriculum_progress_archive (
 revision text NOT NULL, user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 item_id text NOT NULL, completed boolean NOT NULL, updated_at timestamptz NOT NULL,
 PRIMARY KEY(revision,user_id,item_id)
);
INSERT INTO curriculum_content_archive SELECT 'revised-v2','lessons',COALESCE(jsonb_agg(to_jsonb(e)),'[]') FROM lesson_edits e HAVING ${pending} ON CONFLICT DO NOTHING;
INSERT INTO curriculum_content_archive SELECT 'revised-v2','quizzes',COALESCE(jsonb_agg(to_jsonb(q)),'[]') FROM week_quizzes q HAVING ${pending} ON CONFLICT DO NOTHING;
INSERT INTO curriculum_content_archive SELECT 'revised-v2','items',COALESCE(jsonb_agg(to_jsonb(i)),'[]') FROM learning_items i HAVING ${pending} ON CONFLICT DO NOTHING;
INSERT INTO curriculum_progress_archive SELECT 'revised-v2',user_id,item_id,completed,updated_at FROM learning_progress WHERE ${pending} ON CONFLICT DO NOTHING;
DELETE FROM learning_progress WHERE ${pending};
DELETE FROM learning_items WHERE ${pending};
INSERT INTO learning_items(id,week,kind,label)
SELECT id,week,kind,label FROM jsonb_to_recordset('${rows}'::jsonb) AS i(id text,week smallint,kind text,label text)
WHERE ${pending} ON CONFLICT(id) DO NOTHING;
-- Match concept labels, moving old weeks 2->4, 3->2, 4->3. New assignments start unchecked.
INSERT INTO learning_progress(user_id,item_id,completed,updated_at)
SELECT p.user_id,n.id,p.completed,p.updated_at
FROM curriculum_progress_archive p
JOIN curriculum_content_archive a ON a.revision=p.revision AND a.kind='items'
CROSS JOIN LATERAL jsonb_to_recordset(a.data) AS old(id text,week smallint,kind text,label text)
JOIN learning_items n ON n.kind='concept' AND n.label=old.label AND n.week=CASE old.week WHEN 2 THEN 4 WHEN 3 THEN 2 WHEN 4 THEN 3 ELSE old.week END
WHERE p.revision='revised-v2' AND p.item_id=old.id AND old.kind='concept' AND ${pending}
ON CONFLICT(user_id,item_id) DO NOTHING;
-- Old custom bodies/Colab links remain in the archive. The new source becomes the default.
DELETE FROM lesson_edits WHERE ${pending};
DELETE FROM week_quizzes WHERE ${pending};
INSERT INTO week_quizzes(week,questions,instructions,password_hash,published,revision,updated_at)
SELECT CASE q.week WHEN 3 THEN 5 WHEN 4 THEN 3 WHEN 5 THEN 4 ELSE q.week END,
q.questions,q.instructions,q.password_hash,
CASE WHEN q.week BETWEEN 3 AND 5 THEN false ELSE q.published END,q.revision+1,now()
FROM curriculum_content_archive a
CROSS JOIN LATERAL jsonb_to_recordset(a.data) AS q(week smallint,questions jsonb,instructions text,password_hash text,published boolean,revision integer)
WHERE a.revision='revised-v2' AND a.kind='quizzes' AND ${pending};
DELETE FROM quiz_attempts WHERE week BETWEEN 3 AND 5 AND ${pending};
ALTER TABLE lesson_edits ADD COLUMN IF NOT EXISTS content_revision text NOT NULL DEFAULT 'revised-v2';
ALTER TABLE week_quizzes ADD COLUMN IF NOT EXISTS content_revision text NOT NULL DEFAULT 'revised-v2';
INSERT INTO curriculum_revisions(revision) VALUES('revised-v2') ON CONFLICT DO NOTHING;
`;
fs.writeFileSync('db/migrations/004_revised_curriculum.sql',sql);
console.log('Generated idempotent revised curriculum migration.');

fs.writeFileSync('lib/revised-concepts.json', JSON.stringify(catalog().filter(i=>i.kind==='concept').map(i=>i.id), null, 2)+'\n');
