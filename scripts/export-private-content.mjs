import fs from "node:fs";
import matter from "gray-matter";
import { schema, catalog } from "./db-catalog.mjs";
const dir = process.argv[2] || "content";
const quote = (s) => "'" + String(s).replaceAll("'", "''") + "'";
const files = fs
  .readdirSync(dir)
  .filter((f) => /^week-\d.*\.md$/.test(f))
  .sort();
const lessons = files.map((f) => {
  const { data, content } = matter(fs.readFileSync(dir + "/" + f, "utf8"));
  return { week: data.week, body: content };
});
if (lessons.length !== 9 || new Set(lessons.map((w) => w.week)).size !== 9)
  throw Error("Need all nine private originals");
const pending =
  "NOT EXISTS (SELECT 1 FROM curriculum_revisions WHERE revision='private-content-v1')";
let sql =
  "-- PRIVATE: contains teaching material and quiz drafts. Never commit or upload to GitHub.\nBEGIN;\n" +
  schema();
sql +=
  "\nINSERT INTO learning_items(id,week,kind,label) VALUES\n" +
  catalog()
    .map((i) => `(${quote(i.id)},${i.week},${quote(i.kind)},${quote(i.label)})`)
    .join(",\n") +
  "\nON CONFLICT(id) DO UPDATE SET week=EXCLUDED.week,kind=EXCLUDED.kind,label=EXCLUDED.label;\n";
sql += `INSERT INTO curriculum_content_archive SELECT 'private-content-v1','week-0-before-polish',COALESCE(jsonb_agg(to_jsonb(e)),'[]') FROM lesson_edits e WHERE week=0 HAVING ${pending} ON CONFLICT DO NOTHING;\n`;
for (const w of lessons) {
  sql +=
    `INSERT INTO course_originals(week,body) VALUES(${w.week},${quote(w.body)}) ON CONFLICT(week) ` +
    (w.week === 0
      ? `DO UPDATE SET body=EXCLUDED.body,updated_at=now() WHERE ${pending}`
      : "DO NOTHING") +
    ";\n";
  if (w.week === 0)
    sql += `UPDATE lesson_edits SET body=${quote(w.body)},revision=revision+1,updated_at=now(),content_revision='revised-v2' WHERE week=0 AND ${pending};\n`;
}
for (const file of [
  "glossary.json",
  "lesson-context.json",
  "final-project.md",
]) {
  const name = file.replace(/\.(md|json)$/, "");
  sql += `INSERT INTO course_documents(name,body) VALUES(${quote(name)},${quote(fs.readFileSync(dir + "/" + file, "utf8"))}) ON CONFLICT(name) DO NOTHING;\n`;
}
const draftPath = ".private-course/quiz-drafts.json";
if (fs.existsSync(draftPath))
  for (const q of JSON.parse(fs.readFileSync(draftPath, "utf8")))
    sql += `INSERT INTO week_quizzes(week,questions,instructions,published) VALUES(${q.week},${quote(JSON.stringify(q.questions))}::jsonb,${quote(q.instructions)},false) ON CONFLICT(week) DO NOTHING;\n`;
sql +=
  "INSERT INTO curriculum_revisions(revision) VALUES('private-content-v1') ON CONFLICT DO NOTHING;\nCOMMIT;\n";
fs.mkdirSync(".private-course", { recursive: true });
fs.writeFileSync(".private-course/import-content.sql", sql);
console.log(
  "Created .private-course/import-content.sql (private, do not commit).",
);
