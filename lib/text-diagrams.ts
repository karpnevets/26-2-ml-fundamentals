export type DiagramPoint = {
  x: number;
  y: number;
  symbol: string;
  label?: string;
};

export type TextDiagram =
  | { kind: "xor" }
  | { kind: "scatter"; xLabel: string; yLabel: string; points: DiagramPoint[] }
  | { kind: "point-cloud"; points: DiagramPoint[] }
  | { kind: "flow"; steps: string[]; note?: string };

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

function parseScatter(source: string): TextDiagram | null {
  const lines = source.replace(/\t/g, "    ").trimEnd().split("\n");
  const bottom = lines.findIndex((line) => /^\s*\+[-─]+[>→]\s*\S/.test(line));
  const top = lines.findIndex((line) => /^\s*[\^↑]\s*$/.test(line));
  if (top < 1 || bottom <= top + 1 || bottom !== lines.length - 1) return null;
  const header = lines
    .slice(0, top)
    .map((line) => line.trim())
    .filter(Boolean);
  const axis = lines[bottom].match(/^(\s*)\+([-─]+)[>→]\s*(.+)$/)!;
  if (header.length !== 1 || header[0].length > 40 || axis[3].length > 40)
    return null;
  const origin = axis[1].length;
  const width = axis[2].length + 1;
  const points: DiagramPoint[] = [];
  for (let row = top + 1; row < bottom; row++) {
    if (!lines[row].trim()) continue;
    if (lines[row][origin] !== "|" || lines[row].slice(0, origin).trim())
      return null;
    const content = lines[row].slice(origin + 1);
    const markers = [...content.matchAll(/[•●○×]/g)];
    if (!markers.length) {
      if (content.trim()) return null;
      continue;
    }
    if (content.slice(0, markers[0].index).trim()) return null;
    for (let i = 0; i < markers.length; i++) {
      const marker = markers[i];
      const column = marker.index! + 1;
      const label = content
        .slice(marker.index! + 1, markers[i + 1]?.index)
        .trim();
      if (column > width || label.length > 80 || /[|{};↓↑→←]/.test(label))
        return null;
      points.push({
        x: column / width,
        y: (bottom - row) / (bottom - top),
        symbol: marker[0],
        ...(label ? { label } : {}),
      });
    }
  }
  if (!points.length || points.length > 40) return null;
  return { kind: "scatter", xLabel: axis[3].trim(), yLabel: header[0], points };
}

function parsePointCloud(source: string): TextDiagram | null {
  const lines = source.replace(/\t/g, "    ").trimEnd().split("\n");
  if (
    lines.filter((line) => line.trim()).length < 2 ||
    lines.length > 24 ||
    lines.some((line) => !/^[\s•●○×]*$/.test(line))
  )
    return null;
  const raw = lines.flatMap((line, row) =>
    [...line.matchAll(/[•●○×]/g)].map((m) => ({
      x: m.index!,
      y: row,
      symbol: m[0],
    })),
  );
  if (raw.length < 2 || raw.length > 100) return null;
  const xmin = Math.min(...raw.map((p) => p.x)),
    xmax = Math.max(...raw.map((p) => p.x));
  const ymin = Math.min(...raw.map((p) => p.y)),
    ymax = Math.max(...raw.map((p) => p.y));
  return {
    kind: "point-cloud",
    points: raw.map((p) => ({
      x: xmax === xmin ? 0.5 : (p.x - xmin) / (xmax - xmin),
      y: ymax === ymin ? 0.5 : 1 - (p.y - ymin) / (ymax - ymin),
      symbol: p.symbol,
    })),
  };
}

// Coordinate layouts and point grids preserve relative positions, not numeric data.
export function parseTextDiagram(
  source: string,
  language: string,
): TextDiagram | null {
  if (!["", "text", "plain", "plaintext"].includes(language)) return null;
  source = source.replace(/\r\n?/g, "\n");
  if (normalize(source) === normalize(xorSource)) return { kind: "xor" };
  const scatter = parseScatter(source);
  if (scatter) return scatter;
  const cloud = parsePointCloud(source);
  if (cloud) return cloud;

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
