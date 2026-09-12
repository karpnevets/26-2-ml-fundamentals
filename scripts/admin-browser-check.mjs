import fs from "node:fs";
import { createRequire } from "node:module";
import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve("tsx/package.json"))("esbuild");
const fixture = (id, name, email, done) => ({
  id,
  name,
  email,
  createdAt: "2026-09-12T00:00:00Z",
  lastLoginAt: "2026-09-12T04:00:00Z",
  lastProgressAt: done ? "2026-09-12T04:10:00Z" : null,
  completedConcepts: done,
  conceptTotal: 40,
  percent: Math.round((done / 40) * 100),
  completedWeeks: Math.floor(done / 5),
  weeks: Array.from({ length: 8 }, (_, i) => ({
    week: i + 1,
    done: Math.min(5, Math.max(0, done - i * 5)),
    total: 5,
    complete: done >= (i + 1) * 5,
  })),
  assignments: { Check: done ? 2 : 0, Apply: done ? 1 : 0, Explore: 0 },
});
const learners = [
  fixture("one", "테스트 학습자 A", "test-a@snu.ac.kr", 10),
  fixture("two", "테스트 학습자 B", "test-b@snu.ac.kr", 0),
];
const result = await build({
  stdin: {
    contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {AdminDashboard} from './components/admin-dashboard';createRoot(document.getElementById('root')).render(React.createElement(AdminDashboard,{learners:${JSON.stringify(learners)}}));`,
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
  .readdirSync(".next/static/css")
  .filter((f) => f.endsWith(".css"))
  .map(
    (f) =>
      `<link rel="stylesheet" href="http://127.0.0.1:3000/_next/static/css/${f}">`,
  )
  .join("");
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.setContent(
    `<!doctype html><html lang="ko"><head>${css}</head><body><main class="page admin-page"><header class="subpage-header"><span class="eyebrow accent">SIG · ADMIN · TEST FIXTURE</span><h1>학습 진행 현황</h1></header><div id="root"></div></main></body></html>`,
  );
  await page.addScriptTag({ content: result.outputFiles[0].text });
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await expect(page.locator("tbody tr").first()).toContainText("학습자 B");
  await page.getByRole("searchbox").fill("test-a");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody tr")).toContainText("25%");
  await page.getByRole("searchbox").fill("");
  await page.getByRole("combobox").selectOption("name");
  await expect(page.locator("tbody tr").first()).toContainText("학습자 A");
  await expect(
    page.getByRole("link", { name: "전체 CSV 내려받기" }),
  ).toHaveAttribute("href", "/api/admin/export");
  await expect(page.locator(".admin-metrics")).toHaveCSS("display", "grid");
  await expect(page.locator(".admin-week-grid")).toHaveCSS("display", "grid");
  await page.screenshot({ path: "qa/admin-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({ path: "qa/admin-mobile.png", fullPage: true });
  console.log(
    "PASS: admin dashboard with test-only fixtures: metrics, filtering, sorting, CSV target, desktop and mobile. No fixture route or authentication bypass exists in the app.",
  );
} finally {
  await browser.close();
}
