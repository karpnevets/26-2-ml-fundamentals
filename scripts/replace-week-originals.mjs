import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { normalizeLesson } from "./import-revised-content.mjs";

const source = process.argv[2];
if (!source)
  throw Error(
    "Usage: node scripts/replace-week-originals.mjs SOURCE_DIRECTORY",
  );
const revision = "week-1-8-latex-v2";
const quote = (value) => "'" + String(value).replaceAll("'", "''") + "'";
const files = fs.readdirSync(source);
const lessons = Array.from({ length: 8 }, (_, i) => {
  const week = i + 1;
  const matches = files.filter(
    (f) => f.startsWith(`week-${week}-`) && f.endsWith(".md"),
  );
  if (matches.length !== 1)
    throw Error(`Expected one Markdown for week ${week}`);
  const file = matches[0];
  const raw = fs.readFileSync(path.join(source, file), "utf8");
  const normalized = normalizeLesson(raw);
  const { data, content } = matter(normalized);
  if (
    data.week !== week ||
    !data.title ||
    !data.question ||
    !Array.isArray(data.concepts) ||
    !content.trim()
  )
    throw Error(`Invalid lesson ${file}`);
  return { week, file, raw, normalized, data, body: content };
});
const catalog = JSON.parse(fs.readFileSync("lib/course-catalog.json", "utf8"));
fs.mkdirSync("content-source/revised", { recursive: true });
fs.mkdirSync("content", { recursive: true });
fs.mkdirSync(".private-course", { recursive: true });
for (const lesson of lessons) {
  fs.writeFileSync(`content-source/revised/${lesson.file}`, lesson.raw);
  fs.writeFileSync(`content/${lesson.file}`, lesson.normalized);
  catalog[catalog.findIndex((entry) => entry.week === lesson.week)] =
    lesson.data;
}
fs.writeFileSync(
  "lib/course-catalog.json",
  JSON.stringify(catalog, null, 2) + "\n",
);
const pending = `NOT EXISTS (SELECT 1 FROM curriculum_revisions WHERE revision=${quote(revision)})`;
let sql =
  "-- PRIVATE teaching material. Never commit this file.\nBEGIN;\nSET LOCAL standard_conforming_strings = on;\nSELECT pg_advisory_xact_lock(261508);\n";
for (const [table, kind] of [
  ["course_originals", "originals"],
  ["lesson_edits", "edits"],
]) {
  sql += `INSERT INTO curriculum_content_archive SELECT ${quote(revision)},${quote(kind)},COALESCE(jsonb_agg(to_jsonb(t)),'[]') FROM ${table} t WHERE week BETWEEN 1 AND 8 HAVING ${pending} ON CONFLICT DO NOTHING;\n`;
}
for (const lesson of lessons) {
  sql += `INSERT INTO course_originals(week,body) SELECT ${lesson.week},${quote(lesson.body)} WHERE ${pending} ON CONFLICT(week) DO UPDATE SET body=EXCLUDED.body,updated_at=now();\n`;
  sql += `UPDATE lesson_edits SET body=${quote(lesson.body)},revision=revision+1,updated_at=now(),content_revision='revised-v2' WHERE week=${lesson.week} AND ${pending};\n`;
  for (const [kind, labels] of [
    ["concept", lesson.data.concepts],
    ["assignment", ["Check", "Apply", "Explore"]],
  ]) {
    for (const label of labels) {
      const id = `w${lesson.week}:${kind === "assignment" ? "assignment:" : ""}${label}`;
      sql += `INSERT INTO learning_items(id,week,kind,label) SELECT ${quote(id)},${lesson.week},${quote(kind)},${quote(label)} WHERE ${pending} ON CONFLICT(id) DO NOTHING;\n`;
    }
  }
}
sql += `INSERT INTO curriculum_revisions(revision) VALUES(${quote(revision)}) ON CONFLICT DO NOTHING;\nCOMMIT;\n`;
fs.writeFileSync(".private-course/replace-week-1-8-latex-v2.sql", sql);
console.log(
  "Replaced private week 1–8 originals and public metadata; generated private replacement SQL.",
);
