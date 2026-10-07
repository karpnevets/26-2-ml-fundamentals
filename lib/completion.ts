import { lessons } from "./content";
import type { ProgressValues } from "./progress-policy";
import { conceptEntries, type ConceptWeek } from "./concepts";
export function completedWeeks(
  values: ProgressValues,
  catalog: ConceptWeek[] = lessons(),
) {
  return catalog
    .filter(
      (w) =>
        w.concepts.length > 0 &&
        conceptEntries(w).every((c) => values[c.id] === true),
    )
    .map((w) => w.week);
}
