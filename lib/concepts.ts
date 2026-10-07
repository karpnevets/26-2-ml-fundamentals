export type Concept = { id: string; label: string };
export type ConceptWeek = {
  week: number;
  concepts: string[];
  conceptIds?: string[];
};
export type ConceptDraft = {
  revision: number;
  concepts: { id: string | null; label: string }[];
};
export const MAX_CONCEPTS = 60;
export const MAX_CONCEPT_LABEL = 100;

// Existing IDs keep their original labels even after the displayed label changes.
export function conceptEntries(lesson: ConceptWeek): Concept[] {
  return lesson.concepts.map((label, i) => ({
    id: lesson.conceptIds?.[i] ?? `w${lesson.week}:${label}`,
    label,
  }));
}

export function validateConceptDraft(
  raw: unknown,
  existing: Concept[],
): ConceptDraft | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const data = raw as Record<string, unknown>;
  if (
    !Number.isSafeInteger(data.revision) ||
    (data.revision as number) < 0 ||
    (data.revision as number) > 2147483646 ||
    !Array.isArray(data.concepts) ||
    data.concepts.length < 1 ||
    data.concepts.length > MAX_CONCEPTS
  )
    return null;
  const known = new Set(existing.map((c) => c.id));
  const ids = new Set<string>();
  const labels = new Set<string>();
  const concepts: ConceptDraft["concepts"] = [];
  for (const item of data.concepts) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    if (Object.keys(item).some((key) => key !== "id" && key !== "label"))
      return null;
    if (typeof item.label !== "string") return null;
    const label = item.label.trim();
    if (
      !label ||
      label.length > MAX_CONCEPT_LABEL ||
      /[\u0000-\u001f\u007f]/u.test(label)
    )
      return null;
    if (labels.has(label.toLocaleLowerCase("en-US"))) return null;
    labels.add(label.toLocaleLowerCase("en-US"));
    if (item.id !== null) {
      if (
        typeof item.id !== "string" ||
        !known.has(item.id) ||
        ids.has(item.id)
      )
        return null;
      ids.add(item.id);
    }
    concepts.push({ id: item.id, label });
  }
  return { revision: data.revision as number, concepts };
}
