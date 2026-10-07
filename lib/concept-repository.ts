import { randomUUID } from "node:crypto";
import type { Lesson } from "./content";
import type { Query } from "./progress-repository";
import type { Concept, ConceptDraft } from "./concepts";

// Reuse the existing document store; this feature needs no schema migration.
const documentName = (week: number) => `concepts-v1:${week}`;
export async function readConceptLessons(
  query: Query,
  catalog: Lesson[],
): Promise<Lesson[]> {
  const rows = await query(
    "SELECT name,body FROM course_documents WHERE name IN (SELECT jsonb_array_elements_text($1::jsonb))",
    [JSON.stringify(catalog.map((w) => documentName(w.week)))],
  );
  return catalog.map((lesson) => {
    const row = rows.find((r) => r.name === documentName(lesson.week));
    if (!row) return { ...lesson, conceptRevision: 0 };
    const saved = JSON.parse(String(row.body)) as {
      revision: number;
      concepts: Concept[];
    };
    return {
      ...lesson,
      concepts: saved.concepts.map((c) => c.label),
      conceptIds: saved.concepts.map((c) => c.id),
      conceptRevision: saved.revision,
    };
  });
}

export async function saveConcepts(
  query: Query,
  week: number,
  draft: ConceptDraft,
) {
  const concepts = draft.concepts.map((c) => ({
    id: c.id ?? `w${week}:concept:${randomUUID()}`,
    label: c.label,
  }));
  const body = JSON.stringify({ revision: draft.revision + 1, concepts });
  // The document and learning_items update in one statement/transaction. Deleted
  // items stay in learning_items so their historical progress is never erased.
  const write =
    draft.revision === 0
      ? "INSERT INTO course_documents(name,body) SELECT $1,$2 WHERE $3::integer=0 ON CONFLICT DO NOTHING RETURNING body"
      : "UPDATE course_documents SET body=$2,updated_at=now() WHERE name=$1 AND (body::jsonb->>'revision')::integer=$3 RETURNING body";
  const rows = await query(
    `WITH saved AS (${write}), items AS (
       INSERT INTO learning_items(id,week,kind,label)
       SELECT item.id,$4::smallint,'concept',item.label FROM saved,
       jsonb_to_recordset(saved.body::jsonb->'concepts') AS item(id text,label text)
       WHERE true
       ON CONFLICT(id) DO UPDATE SET label=EXCLUDED.label
       WHERE learning_items.week=EXCLUDED.week AND learning_items.kind='concept'
       RETURNING id
     ) SELECT (body::jsonb->>'revision')::integer AS revision,
       body::jsonb->'concepts' AS concepts FROM saved`,
    [documentName(week), body, draft.revision, week],
  );
  return rows.length
    ? {
        revision: Number(rows[0].revision),
        concepts: rows[0].concepts as Concept[],
      }
    : null;
}
