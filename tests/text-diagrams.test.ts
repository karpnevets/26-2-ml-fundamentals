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
  assert.equal(
    parseTextDiagram(block.replace("● class 1", "● class 0"), "text"),
    null,
  );
  assert.equal(parseTextDiagram(block, "python"), null);
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
