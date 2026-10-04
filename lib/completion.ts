import { lessons } from "./content";
import type { ProgressValues } from "./progress-policy";
export function completedWeeks(values: ProgressValues) {
  return lessons()
    .filter(
      (w) =>
        w.concepts.length > 0 &&
        w.concepts.every((c) => values[`w${w.week}:${c}`] === true),
    )
    .map((w) => w.week);
}
