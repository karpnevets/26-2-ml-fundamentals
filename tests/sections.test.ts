import test from "node:test";
import assert from "node:assert/strict";
import { sections } from "../lib/content";

test("lesson navigation accepts numbered main sections at mixed heading levels", () => {
  const result = sections(
    "intro\r\n### 1.1 Goal\r\nbody\r\n#### Detail\r\nkept\r\n#### 1.2 Model\r\nmodel\r\n## Checkpoint",
  );
  assert.deepEqual(
    result.map((s) => s.title),
    ["", "1.1 Goal", "1.2 Model", "Checkpoint"],
  );
  assert(result[1].body.includes("#### Detail\nkept"));
  assert.equal(new Set(result.map((s) => s.id)).size, result.length);
});

test("code and disclosure headings do not split lesson markup", () => {
  const body =
    "## Start\n~~~python\n## code\n### 2.1 code\n~~~\n<details>\n<summary>Math</summary>\n## hidden\n</details>\n### 2.2 Next";
  const result = sections(body);
  assert.deepEqual(
    result.map((s) => s.title),
    ["Start", "2.2 Next"],
  );
  assert(result[0].body.includes("</details>"));
});
