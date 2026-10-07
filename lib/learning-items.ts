import { lessons, type Lesson } from "./content";
import { conceptEntries } from "./concepts";
export type LearningItem = {
  id: string;
  week: number;
  kind: "concept" | "assignment";
  label: string;
};
export function learningItems(catalog: Lesson[] = lessons()): LearningItem[] {
  return catalog.flatMap((w) => [
    ...conceptEntries(w).map(({ id, label }) => ({
      id,
      week: w.week,
      kind: "concept" as const,
      label,
    })),
    ...["Check", "Apply", "Explore"].map((label) => ({
      id: `w${w.week}:assignment:${label}`,
      week: w.week,
      kind: "assignment" as const,
      label,
    })),
  ]);
}
