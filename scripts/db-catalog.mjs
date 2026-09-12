import fs from "node:fs";
import matter from "gray-matter";
export function catalog() {
  return fs
    .readdirSync("content")
    .filter((f) => /^week-\d/.test(f))
    .sort()
    .flatMap((f) => {
      const { data } = matter(fs.readFileSync("content/" + f, "utf8"));
      return [
        ...data.concepts.map((label) => ({
          id: `w${data.week}:${label}`,
          week: data.week,
          kind: "concept",
          label,
        })),
        ...["Check", "Apply", "Explore"].map((label) => ({
          id: `w${data.week}:assignment:${label}`,
          week: data.week,
          kind: "assignment",
          label,
        })),
      ];
    });
}
export const schema = () =>
  fs.readFileSync("db/migrations/001_initial.sql", "utf8");
export const seedSql = `INSERT INTO learning_items(id,week,kind,label) SELECT id,week,kind,label FROM jsonb_to_recordset($1::jsonb) AS item(id text,week smallint,kind text,label text) ON CONFLICT(id) DO UPDATE SET week=EXCLUDED.week,kind=EXCLUDED.kind,label=EXCLUDED.label`;
