import catalog from "./course-catalog.json";
export type Lesson = {
  week: number;
  title: string;
  question: string;
  concepts: string[];
  conceptIds?: string[];
  conceptRevision?: number;
  estimated_time: string;
  body: string;
};
export function lessons(): Lesson[] {
  return catalog.map((w) => ({ ...w, body: "" }));
}
export function sections(body: string) {
  const result = [{ id: "intro", title: "", body: "" }];
  let fence = "",
    fenceLength = 0,
    disclosureDepth = 0;
  for (const line of body.replace(/\r\n/g, "\n").split("\n")) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (marker) {
      if (!fence) {
        fence = marker[1][0];
        fenceLength = marker[1].length;
      } else if (
        marker[1][0] === fence &&
        marker[1].length >= fenceLength &&
        !marker[2].trim()
      )
        fence = "";
      result.at(-1)!.body += line + "\n";
      continue;
    }
    if (!fence && line.trim() === "<details>") disclosureDepth++;
    const heading =
      !fence &&
      !disclosureDepth &&
      line.match(/^ {0,3}(#{2,6})\s+(.+?)\s*#*\s*$/);
    if (
      heading &&
      (heading[1].length === 2 || /^\d+\.\d+\s/.test(heading[2]))
    ) {
      result.push({
        id: `section-${result.length}`,
        title: heading[2],
        body: "",
      });
    } else result.at(-1)!.body += line + "\n";
    if (!fence && line.trim() === "</details>")
      disclosureDepth = Math.max(0, disclosureDepth - 1);
  }
  return result.filter((s) => s.title || s.body.replace(/---/g, "").trim());
}
