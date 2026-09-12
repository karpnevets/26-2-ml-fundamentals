import { lessons } from "./content";
export type LearningItem = {
  id: string;
  week: number;
  kind: "concept" | "assignment";
  label: string;
};
export function learningItems(): LearningItem[] {
  return lessons().flatMap((w) => [
    ...w.concepts.map((label) => ({
      id: `w${w.week}:${label}`,
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
