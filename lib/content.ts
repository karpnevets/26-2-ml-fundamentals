import catalog from "./course-catalog.json";
export type Lesson = {
  week: number;
  title: string;
  question: string;
  concepts: string[];
  estimated_time: string;
  body: string;
};
export function lessons(): Lesson[] {
  return catalog.map((w) => ({ ...w, body: "" }));
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
