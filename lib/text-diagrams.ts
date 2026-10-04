export type TextDiagram =
  { kind: "xor" } | { kind: "flow"; steps: string[]; note?: string };

const xorSource = `x₂
^
|   ● class 1      ○ class 0
|
|   ○ class 0      ● class 1
+----------------------------> x₁`;

function normalize(source: string) {
  return source
    .replace(/\r\n?/g, "\n")
    .trim()
    .split("\n")
    .map((line) => line.trim().replace(/[ \t]+/g, " "))
    .filter(Boolean)
    .join("\n");
}

// Only explicit text fences are eligible; unknown diagrams keep their source.
export function parseTextDiagram(
  source: string,
  language: string,
): TextDiagram | null {
  if (language !== "text") return null;
  if (normalize(source) === normalize(xorSource)) return { kind: "xor" };

  const parts = source
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/^\s*↓\s*$/m);
  if (parts.length < 2 || parts.length > 12) return null;
  const tail = parts
    .pop()!
    .trim()
    .split(/\n[ \t]*\n/);
  parts.push(tail.shift()!);
  const note = tail.join("\n\n").trim() || undefined;
  const steps = parts.map((part) => part.trim());
  if (
    steps.some(
      (step) =>
        !step ||
        step.length > 160 ||
        step.split("\n").length > 3 ||
        /[↓↑→←│┌┐└┘├┤─|{};]/.test(step),
    ) ||
    (note && (note.length > 600 || /[↓↑→←│┌┐└┘├┤─]/.test(note)))
  )
    return null;
  return { kind: "flow", steps, ...(note ? { note } : {}) };
}
