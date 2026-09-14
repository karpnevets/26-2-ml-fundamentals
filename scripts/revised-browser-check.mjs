import fs from "node:fs";
import { createRequire } from "node:module";
import matter from "gray-matter";
import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve("tsx/package.json"))("esbuild");
const lessons = fs
  .readdirSync("content")
  .filter((f) => /^week-\d/.test(f))
  .sort()
  .map((f) => {
    const { data, content } = matter(fs.readFileSync("content/" + f, "utf8"));
    return {
      ...data,
      body: content,
      assignments:
        content.split(/^## 선택 과제\s*$/m)[1]?.split(/^## /m)[0] || "",
    };
  });
const bundle = await build({
  stdin: {
    contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import {LessonMarkdown} from './components/markdown'; import {Assignments} from './components/assignments'; const lessons=${JSON.stringify(lessons)}; createRoot(document.getElementById('root')).render(<>{lessons.map(w=><article key={w.week} data-week={w.week} className="lesson-content"><h1>{w.title}</h1><LessonMarkdown text={w.body}/><aside data-assignments={w.week}><Assignments body={w.assignments} week={w.week}/></aside></article>)}</>);`,
    resolveDir: process.cwd(),
    loader: "tsx",
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" },
});
const base = "http://127.0.0.1:3000";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  page.on("pageerror", (error) => console.error("BROWSER:", error.message));
  await page.goto(base);
  const css = fs
    .readdirSync(".next/static/css")
    .filter((f) => f.endsWith(".css"))
    .map((f) => `<link rel="stylesheet" href="${base}/_next/static/css/${f}">`)
    .join("");
  await page.setContent(
    `<!doctype html><html lang="ko"><head>${css}</head><body><main class="page narrow"><div id="root"></div></main></body></html>`,
  );
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await expect(page.locator("article")).toHaveCount(9);
  await expect(page.locator(".katex-error")).toHaveCount(0);
  // All formulas, including the derivative formula in the disclosure summary, render.
  for (let week = 0; week <= 8; week++) {
    const article = page.locator(`article[data-week="${week}"]`);
    await expect(article.locator("[data-assignments] .assignment")).toHaveCount(
      3,
    );
    const expected = (lessons[week].body.match(/<details>/g) || []).length;
    await expect(article.locator(":scope > details.math-details")).toHaveCount(
      expected,
    );
  }
  const derivativeSummary = page.locator(
    'article[data-week="5"] details > summary',
  );
  await expect(derivativeSummary.locator(".katex")).toHaveCount(1);
  for (const details of await page.locator("details.math-details").all()) {
    assert.equal(await details.getAttribute("open"), null);
    await details.locator(":scope > summary").click();
    await expect(details).toHaveAttribute("open", "");
  }
  assert((await page.locator(".katex").count()) >= 547);
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `overflow at ${width}`,
    );
  }
  await page.locator('article[data-week="5"] details').scrollIntoViewIfNeeded();
  await page.screenshot({ path: "qa/revised-formula-mobile.png" });
  console.log(
    "PASS: all revised lesson rendering, essential formulas visible, explicit optional disclosures, math in summary, 27 grouped assignment controls and mobile width.",
  );
} finally {
  await browser.close();
}
