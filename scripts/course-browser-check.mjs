import fs from "node:fs";
import { createRequire } from "node:module";
import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve("tsx/package.json"))("esbuild");
const base = "http://127.0.0.1:3000";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  await page.goto(base);
  await expect(
    page.getByRole("button", { name: /주차 잠금 해제/ }),
  ).toHaveCount(7);
  await expect(page.locator(".roadmap")).not.toContainText("Gradient Descent");
  await page
    .getByRole("button", { name: "2주차 잠금 해제", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("dialog")
    .getByLabel("암호", { exact: true })
    .fill("wrong");
  await page.getByRole("button", { name: "열기", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "로그인",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("button", { name: "2주차 잠금 해제", exact: true })
    .click();
  await page.getByRole("link", { name: "힌트 · 퀴즈 보기 →" }).click();
  await expect(page).toHaveURL(base + "/quiz/2");
  await expect(
    page.getByRole("link", { name: "로그인", exact: true }),
  ).toBeVisible();
  await page.goto(base + "/week/2");
  assert(!(await page.content()).includes("좋은 parameter를 효율적으로"));
  await expect(page).toHaveTitle(/잠긴 주차/);
  await page.screenshot({ path: "qa/week-locked.png", fullPage: true });
  await page.goto(base + "/assignments");
  await expect(page.locator("main")).not.toContainText("Linear Classification");
  assert.equal(
    (
      await page.request.put(base + "/api/admin/course/2", {
        headers: { Origin: base },
        data: { kind: "lesson", body: "unauthorized", revision: 0 },
      })
    ).status(),
    401,
  );
  assert.equal(
    (
      await page.request.post(base + "/api/weeks/2/unlock", {
        headers: { Origin: "https://evil.example" },
        data: { password: "64" },
      })
    ).status(),
    403,
  );
  await page.goto(base + "/admin/course/2");
  await expect(page).toHaveURL(/\/login\?/);
  // The real editor is mounted only inside this test browser. No app bypass route.
  const fixture = {
    week: 2,
    original: "# Original",
    initialBody: "## 설명\n테스트 본문",
    bodyRevision: 0,
    hasPassword: false,
    initialQuiz: {
      questions: [
        { number: 1, description: "두 수를 더하세요.", image: "", answer: "4" },
      ],
      instructions: "번호 순으로 이어 붙이세요.",
      published: false,
      revision: 0,
    },
  };
  const bundle = await build({
    stdin: {
      contents: `import React from 'react';import{createRoot}from'react-dom/client';import{CourseEditor}from'./components/course-editor';createRoot(document.getElementById('root')).render(React.createElement(CourseEditor,${JSON.stringify(fixture)}));`,
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
    .map((f) => `<link rel="stylesheet" href="${base}/_next/static/css/${f}">`)
    .join("");
  await page.setContent(
    `<!doctype html><html lang="ko"><head>${css}</head><body><main class="page editor-page"><h1>회차 편집 · 테스트</h1><div id="root"></div></main></body></html>`,
  );
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await page.getByRole("button", { name: "+ 문항 추가", exact: true }).click();
  await page.locator(".quiz-fields textarea").nth(1).fill("세 수를 더하세요.");
  await page.locator(".quiz-fields").nth(1).locator("input").last().fill("8");
  await page
    .getByRole("button", { name: "정답을 번호순으로 이어 붙여 암호 설정" })
    .click();
  await expect(
    page.getByLabel("실제 잠금 해제 암호", { exact: true }),
  ).toHaveValue("48");
  await page.getByLabel("학생에게 퀴즈 공개").check();
  let payload,
    fail = false;
  await page.route("**/api/admin/course/2", async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: fail ? 409 : 200,
      json: fail
        ? { error: "다른 창에서 수정되었습니다." }
        : { ok: true, revision: 1 },
    });
  });
  await page.getByRole("button", { name: "퀴즈 저장", exact: true }).click();
  await expect(page.locator(".editor-message")).toContainText(
    "퀴즈를 저장했습니다",
  );
  assert.equal(payload.password, "48");
  assert.equal(payload.questions.length, 2);
  assert.equal(payload.published, true);
  await expect(
    page.getByLabel("실제 잠금 해제 암호", { exact: true }),
  ).toHaveValue("");
  await page.getByRole("button", { name: "학생 화면 미리보기" }).click();
  await expect(
    page.getByRole("heading", { name: "2주차 힌트 미리보기" }),
  ).toBeVisible();
  await page.screenshot({ path: "qa/quiz-editor.png", fullPage: true });
  await page.getByRole("button", { name: "학습 본문", exact: true }).click();
  await page
    .getByRole("combobox", { name: "실험 삽입" })
    .selectOption("gradient");
  await expect(page.getByLabel("학습 본문 Markdown")).toHaveValue(
    /```visualization\ngradient/,
  );
  await expect(
    page.getByRole("heading", { name: "Gradient Descent", exact: true }),
  ).toBeVisible();
  fail = true;
  await page.getByRole("button", { name: "본문 저장", exact: true }).click();
  await expect(page.locator(".editor-message")).toContainText("다른 창");
  await expect(page.getByLabel("학습 본문 Markdown")).toHaveValue(/gradient/);
  fail = false;
  await page.getByRole("button", { name: "본문 저장", exact: true }).click();
  await expect(page.locator(".editor-message")).toContainText(
    "본문을 저장했습니다",
  );
  assert.equal(payload.kind, "lesson");
  assert(payload.body.includes("gradient"));
  await page.screenshot({ path: "qa/body-editor.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({ path: "qa/body-editor-mobile.png", fullPage: true });
  console.log(
    "PASS: anonymous gates, hidden titles, hint navigation, modal keyboard, API auth/origin, actual editor with browser-only mock saves, conflict retention, visualization and responsive layout.",
  );
} finally {
  await browser.close();
}
