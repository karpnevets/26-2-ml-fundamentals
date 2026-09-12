import fs from "node:fs";
import assert from "node:assert/strict";
import matter from "gray-matter";
import katex from "katex";
const source = fs
  .readFileSync("ml_fundamentals_sig_website_content.md", "utf8")
  .replace(/\r\n/g, "\n");
let equations = 0,
  assignments = 0;
const starts = [...source.matchAll(/^# Week (\d) — (.+)$/gm)];
for (let week = 0; week < 9; week++) {
  const file = fs
    .readdirSync("content")
    .find((f) => f.startsWith(`week-${week}-`));
  assert(file);
  const { data, content } = matter(fs.readFileSync(`content/${file}`, "utf8"));
  assert.equal(data.week, week);
  assert(data.question);
  assert(data.concepts.length);
  let original = source.slice(
    starts[week].index,
    starts[week + 1]?.index ?? source.indexOf("# 사이트용 추가 페이지 제안"),
  );
  original = original
    .slice(original.indexOf("\n"))
    .replace(/^> 선택 주차.*\n/m, "")
    .replace(/^> 핵심 질문:.*\n/m, "")
    .trim()
    .replace(/^# (.+)$/gm, "## $1");
  assert.equal(content.trim(), original, "Content altered: " + file);
  assert(content.includes("## Checkpoint"));
  for (const level of ["Check", "Apply", "Explore"]) {
    assert(content.includes(`### [${level}]`));
    assignments++;
  }
  const noCode = content.replace(/```[\s\S]*?```/g, "");
  for (const m of noCode.matchAll(/\\\[([\s\S]*?)\\\]|\\\((.*?)\\\)/g)) {
    katex.renderToString(m[1] ?? m[2], {
      throwOnError: true,
      displayMode: !!m[1],
    });
    equations++;
  }
}
console.log(
  `PASS: 9 complete source lessons, ${assignments} assignments, ${equations} valid equations.`,
);
