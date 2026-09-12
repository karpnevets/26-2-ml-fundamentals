import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
export type Lesson = {
  week: number;
  title: string;
  question: string;
  concepts: string[];
  estimated_time: string;
  body: string;
};
export function lessons(): Lesson[] {
  return fs
    .readdirSync(path.join(process.cwd(), "content"))
    .filter((f) => /^week-\d/.test(f))
    .sort()
    .map((f) => {
      const { data, content } = matter(
        fs.readFileSync(path.join(process.cwd(), "content", f), "utf8"),
      );
      return { ...data, body: content } as Lesson;
    });
}
export function sections(body: string) {
  return body
    .split(/^## /m)
    .map((text, i) => {
      const end = text.indexOf("\n");
      return i === 0
        ? { id: "intro", title: "", body: text }
        : {
            id: `section-${i}`,
            title: text.slice(0, end),
            body: text.slice(end + 1),
          };
    })
    .filter((s) => s.title || s.body.replace(/---/g, "").trim());
}
export function document(name: string) {
  return fs.readFileSync(
    path.join(process.cwd(), "content", name + ".md"),
    "utf8",
  );
}
