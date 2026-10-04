import fs from "node:fs";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { chromium, expect } from "@playwright/test";

const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve("tsx/package.json"))("esbuild");
const lesson = fs.readFileSync("content/week-3-feature-space.md", "utf8");
const xor = [...lesson.matchAll(/```text\r?\n([\s\S]*?)```/g)].find((m) =>
  m[1].includes("● class 1"),
)[1];
const source = [
  "## XOR",
  "```text\n" + xor + "```",
  "## 계산 흐름",
  "```text\nInput\n ↓\nModel\n ↓\nLoss\n\n추가 설명\n```",
  "## 코드",
  "```python\nprint('Input')\n```",
  "```text\n(N, 3, 32, 32)\n```",
  "<details>\n<summary>더보기</summary>\n\n```text\n" +
    xor +
    "```\n\n</details>",
].join("\n\n");
const bundle = await build({
  stdin: {
    contents: `import React from 'react';import{createRoot}from'react-dom/client';import{LessonMarkdown}from'./components/markdown';createRoot(document.getElementById('root')).render(React.createElement(LessonMarkdown,{text:${JSON.stringify(source)}}));`,
    resolveDir: process.cwd(),
    loader: "tsx",
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
});
const css = fs
  .readFileSync("app/globals.css", "utf8")
  .replace('@import "tailwindcss";', "");
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(
    `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${css}</style></head><body><main style="max-width:800px;margin:24px auto;padding:0 20px"><div id="root"></div></main></body></html>`,
  );
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await expect(page.locator(".coordinate-diagram")).toHaveCount(2);
  await expect(page.locator(".coordinate-diagram").first()).toBeVisible();
  await expect(
    page.locator(".coordinate-diagram").first().locator("circle.class-0"),
  ).toHaveCount(2);
  await expect(
    page.locator(".coordinate-diagram").first().locator("circle.class-1"),
  ).toHaveCount(2);
  await expect(page.locator(".flow-diagram .diagram-step")).toHaveText([
    "Input",
    "Model",
    "Loss",
  ]);
  await expect(page.locator(".flow-diagram figcaption")).toHaveText(
    "추가 설명",
  );
  await expect(page.locator(".codeblock")).toHaveCount(2);
  await expect(page.locator(".codeblock").first()).toContainText(
    "print('Input')",
  );
  await expect(page.locator(".codeblock").last()).toContainText(
    "(N, 3, 32, 32)",
  );
  await page.locator("details > summary").click();
  await expect(page.locator("details .coordinate-diagram")).toBeVisible();
  fs.mkdirSync("qa", { recursive: true });
  await page
    .locator(".coordinate-diagram")
    .first()
    .screenshot({ path: "qa/xor-diagram-desktop.png" });
  await page
    .locator(".flow-diagram")
    .screenshot({ path: "qa/flow-diagram-desktop.png" });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await expect(page.locator(".coordinate-diagram").first()).toBeVisible();
  }
  await page
    .locator(".coordinate-diagram")
    .first()
    .screenshot({ path: "qa/xor-diagram-mobile.png" });
  assert.deepEqual(errors, []);
  console.log(
    "Diagram rendering, disclosure, code fallback and mobile checks passed.",
  );
} finally {
  await browser.close();
}
