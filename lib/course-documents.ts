import "server-only";
import { query } from "./query";
import type { Term } from "./glossary";

export async function originalLesson(week: number): Promise<string> {
  const [row] = await query("SELECT body FROM course_originals WHERE week=$1", [
    week,
  ]);
  if (!row) throw new Error("Missing DB course original");
  return String(row.body);
}
export async function courseDocument(name: string): Promise<string> {
  const [row] = await query("SELECT body FROM course_documents WHERE name=$1", [
    name,
  ]);
  if (!row) throw new Error("Missing DB course document");
  return String(row.body);
}
export async function glossaryForWeeks(weeks: number[]): Promise<Term[]> {
  const terms = JSON.parse(await courseDocument("glossary")) as Term[];
  return terms.filter((term) => weeks.includes(term.week));
}
export async function lessonContextForWeek(
  week: number,
): Promise<{ why: string; previous: string; prerequisite: string }> {
  const contexts = JSON.parse(await courseDocument("lesson-context"));
  return contexts[week];
}
