import type { Query } from "./progress-repository";
import type { LessonIntro } from "./lesson-intro";
import type { Term } from "./glossary";

const documentName = (week: number) => `lesson-intro-v1:${week}`;

export async function readIntroOverrides(query: Query, weeks: number[]) {
  const rows = await query(
    "SELECT name,body FROM course_documents WHERE name IN (SELECT jsonb_array_elements_text($1::jsonb))",
    [JSON.stringify(weeks.map(documentName))],
  );
  return new Map(
    rows.map((row) => [
      Number(String(row.name).split(":")[1]),
      JSON.parse(String(row.body)) as LessonIntro,
    ]),
  );
}

export function defaultIntro(
  week: number,
  context: Pick<LessonIntro, "why" | "previous" | "prerequisite">,
  concepts: string[],
  glossary: Term[],
): LessonIntro {
  return {
    ...context,
    revision: 0,
    terms: concepts.map((term) => ({
      term,
      definition:
        (
          glossary.find(
            (t) =>
              t.week === week && t.term.toLowerCase() === term.toLowerCase(),
          ) ??
          glossary.find(
            (t) =>
              t.week <= week && t.term.toLowerCase() === term.toLowerCase(),
          )
        )?.definition ?? "",
    })),
  };
}

export function mergeIntroGlossary(
  terms: Term[],
  overrides: Map<number, LessonIntro>,
  weeks: number[],
) {
  return weeks.flatMap((week) => {
    const intro = overrides.get(week);
    return intro
      ? intro.terms.map((term) => ({ ...term, week }))
      : terms.filter((t) => t.week === week);
  });
}

export async function saveLessonIntro(
  query: Query,
  week: number,
  draft: LessonIntro,
) {
  const revision = draft.revision + 1;
  const body = JSON.stringify({ ...draft, revision });
  const rows =
    draft.revision === 0
      ? await query(
          "INSERT INTO course_documents(name,body) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING body",
          [documentName(week), body],
        )
      : await query(
          "UPDATE course_documents SET body=$2,updated_at=now() WHERE name=$1 AND (body::jsonb->>'revision')::integer=$3 RETURNING body",
          [documentName(week), body, draft.revision],
        );
  return rows.length ? revision : null;
}
