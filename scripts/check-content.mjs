import fs from "node:fs";
import assert from "node:assert/strict";
import matter from "gray-matter";
import katex from "katex";
import { normalizeLesson } from "./import-revised-content.mjs";
let equations = 0,
  assignments = 0,
  disclosures = 0;
const files = fs.readdirSync("content").filter((f) => /^week-\d/.test(f));
assert.equal(files.length, 9);
for (let week = 0; week < 9; week++) {
  const file = files.find((f) => f.startsWith(`week-${week}-`));
  assert(file);
  const raw = fs.readFileSync(`content/${file}`, "utf8");
  assert.equal(
    raw.replace(/\r\n/g, "\n"),
    normalizeLesson(fs.readFileSync(`content-source/revised/${file}`, "utf8")),
  );
  const { data, content } = matter(raw);
  assert.equal(data.week, week);
  assert(data.question && data.concepts.length);
  assert(content.includes("## Checkpoint"));
  for (const level of ["Check", "Apply", "Explore"]) {
    const tasks = [
      ...content.matchAll(new RegExp(`^### \\[${level}\\]`, "gm")),
    ];
    assert(tasks.length > 0);
    assignments += tasks.length;
  }
  const noCode = content.replace(/```[\s\S]*?```/g, "");
  const opens = (noCode.match(/<details>/g) || []).length;
  assert.equal(opens, (noCode.match(/<\/details>/g) || []).length);
  disclosures += opens;
  for (const m of noCode.matchAll(/\\\[([\s\S]*?)\\\]|\\\((.*?)\\\)/g)) {
    katex.renderToString(m[1] ?? m[2], {
      throwOnError: true,
      displayMode: !!m[1],
    });
    equations++;
  }
}
for (const file of [
  "glossary.json",
  "lesson-context.json",
  "index.md",
  "site-guide.md",
  "final-project.md",
])
  assert.equal(
    fs.readFileSync(`content/${file}`, "utf8"),
    fs.readFileSync(`content-source/revised/${file}`, "utf8"),
  );
console.log(
  `PASS: 9 revised lessons, ${assignments} tasks, ${equations} valid formulas, ${disclosures} explicit disclosures; original prose preserved.`,
);
