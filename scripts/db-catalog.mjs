import fs from "node:fs";
export function catalog() {
  return JSON.parse(fs.readFileSync("lib/course-catalog.json", "utf8")).flatMap(
    (data) => [
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
    ],
  );
}
export const schema = () =>
  fs
    .readdirSync("db/migrations")
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => fs.readFileSync("db/migrations/" + f, "utf8"))
    .join("\n");
export const seedSql = `INSERT INTO learning_items(id,week,kind,label) SELECT id,week,kind,label FROM jsonb_to_recordset($1::jsonb) AS item(id text,week smallint,kind text,label text) ON CONFLICT(id) DO UPDATE SET week=EXCLUDED.week,kind=EXCLUDED.kind,label=EXCLUDED.label`;
