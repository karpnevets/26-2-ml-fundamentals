export type IntroTerm = { term: string; definition: string };
export type LessonIntro = {
  why: string;
  previous: string;
  prerequisite: string;
  terms: IntroTerm[];
  revision: number;
};
export const MAX_INTRO_TEXT = 5000;
export const MAX_INTRO_TERMS = 60;
export const MAX_TERM_NAME = 100;
export const MAX_TERM_DEFINITION = 5000;

export function validateLessonIntro(value: unknown): LessonIntro | null {
  if (!value || typeof value !== "object") return null;
  const v = value as LessonIntro;
  if (!Number.isSafeInteger(v.revision) || v.revision < 0) return null;
  for (const key of ["why", "previous", "prerequisite"] as const) {
    if (typeof v[key] !== "string" || v[key].length > MAX_INTRO_TEXT)
      return null;
  }
  if (!Array.isArray(v.terms) || v.terms.length > MAX_INTRO_TERMS) return null;
  const seen = new Set<string>();
  const terms: IntroTerm[] = [];
  for (const item of v.terms) {
    if (
      !item ||
      typeof item.term !== "string" ||
      !item.term.trim() ||
      item.term.length > MAX_TERM_NAME ||
      typeof item.definition !== "string" ||
      item.definition.length > MAX_TERM_DEFINITION
    )
      return null;
    const term = item.term.trim();
    const key = term.toLowerCase();
    if (seen.has(key)) return null;
    seen.add(key);
    terms.push({ term, definition: item.definition });
  }
  return {
    why: v.why,
    previous: v.previous,
    prerequisite: v.prerequisite,
    terms,
    revision: v.revision,
  };
}
