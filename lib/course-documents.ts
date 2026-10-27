import "server-only";
import { query } from "./query";
import type { Term } from "./glossary";
import { lessons } from "./content";
import type { LessonIntro } from "./lesson-intro";
import {
  defaultIntro,
  mergeIntroGlossary,
  readIntroOverrides,
} from "./lesson-intro-repository";

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
  const [body, overrides] = await Promise.all([
    courseDocument("glossary"),
    readIntroOverrides(query, weeks),
  ]);
  return mergeIntroGlossary(JSON.parse(body) as Term[], overrides, weeks);
}
export async function lessonContextForWeek(
  week: number,
  concepts = lessons().find((w) => w.week === week)?.concepts ?? [],
): Promise<LessonIntro> {
  const saved = (await readIntroOverrides(query, [week])).get(week);
  if (saved) return saved;
  const [contexts, glossary] = await Promise.all([
    courseDocument("lesson-context"),
    courseDocument("glossary"),
  ]);
  return defaultIntro(
    week,
    JSON.parse(contexts)[week],
    concepts,
    JSON.parse(glossary),
  );
}
