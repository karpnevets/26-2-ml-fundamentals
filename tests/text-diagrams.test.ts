import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseTextDiagram } from "../lib/text-diagrams";

test("recognizes the existing XOR text without changing its source", () => {
  const source = readFileSync("content/week-3-feature-space.md", "utf8");
  const block = [...source.matchAll(/```text\r?\n([\s\S]*?)```/g)].find(
    (match) => match[1].includes("● class 1"),
  )![1];
  assert.deepEqual(parseTextDiagram(block, "text"), { kind: "xor" });
  assert.deepEqual(parseTextDiagram(block.replace(/\n/g, "\r\n"), "text"), {
    kind: "xor",
  });
  const changed = parseTextDiagram(
    block.replace("● class 1", "● class 0"),
    "text",
  );
  assert.equal(changed?.kind, "scatter");
  if (changed?.kind === "scatter")
    assert.equal(changed.points[0].label, "class 0");
  assert.equal(parseTextDiagram(block, "python"), null);
});

test("coordinate diagrams recognize labels and preserve relative point placement", () => {
  const source = readFileSync("content/week-3-feature-space.md", "utf8");
  const block = [...source.matchAll(/```text\r?\n([\s\S]*?)```/g)].find((m) =>
    m[1].includes("• student B"),
  )![1];
  for (const language of ["text", "", "plain", "plaintext"]) {
    const diagram = parseTextDiagram(block, language);
    assert.equal(diagram?.kind, "scatter");
    if (diagram?.kind !== "scatter") throw new Error("Missing scatter diagram");
    assert.equal(diagram.xLabel, "x₁");
    assert.equal(diagram.yLabel, "x₂");
    assert.deepEqual(
      diagram.points.map((p) => p.label),
      ["student B", "student A"],
    );
    assert(diagram.points[0].x > diagram.points[1].x);
    assert(diagram.points[0].y > diagram.points[1].y);
  }
  assert.equal(parseTextDiagram(block, "python"), null);
});

test("point grids preserve all symbols and their relative positions", () => {
  const block =
    "  × × × × ×\n×     ○     ×\n×   ○ ○ ○   ×\n×     ○     ×\n  × × × × ×";
  const diagram = parseTextDiagram(block, "text");
  assert.equal(diagram?.kind, "point-cloud");
  if (diagram?.kind !== "point-cloud") throw new Error("Missing point grid");
  assert.equal(diagram.points.filter((p) => p.symbol === "×").length, 16);
  assert.equal(diagram.points.filter((p) => p.symbol === "○").length, 5);
  const center = diagram.points.find(
    (p) => p.symbol === "○" && p.x === 0.5 && p.y === 0.5,
  );
  assert(center);
  assert.equal(parseTextDiagram(block + "\nnot a point", "text"), null);
  assert.equal(parseTextDiagram("○ × ○", "text"), null);
});

test("keeps flow labels, repeated steps and trailing explanations", () => {
  assert.deepEqual(
    parseTextDiagram(
      "Input\n ↓\nLayer\n ↓\nLayer\n ↓\nOutput\n\n추가 설명",
      "text",
    ),
    {
      kind: "flow",
      steps: ["Input", "Layer", "Layer", "Output"],
      note: "추가 설명",
    },
  );
  assert.deepEqual(parseTextDiagram("Conv 3×3\nstride 1\n ↓\nReLU", "text"), {
    kind: "flow",
    steps: ["Conv 3×3\nstride 1", "ReLU"],
  });
});

test("unknown diagrams, branches, code and incomplete arrows remain text", () => {
  for (const source of [
    "(N, 3, 32, 32)",
    "Input → Output",
    "Input\n↓\n",
    "↓\nOutput",
    "Input\n↓\nLayer │ shortcut",
    "x = {1: 2}\n↓\nprint(x)",
  ]) {
    assert.equal(parseTextDiagram(source, "text"), null);
  }
});
