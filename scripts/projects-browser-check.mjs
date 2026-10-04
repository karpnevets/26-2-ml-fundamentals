import fs from "node:fs";
import { createRequire } from "node:module";
import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve("tsx/package.json"))("esbuild");
const fixture = {
  id: "test-project",
  week: 3,
  title: "선택 프로젝트 편집",
  summary: "실험 소개",
  body: "## 실험 조건\n\n모델을 직접 구현합니다. $f(x)=wx+b$",
  published: false,
  revision: 1,
};
const result = await build({
  stdin: {
    contents: `import React from 'react';import{createRoot}from'react-dom/client';import{ProjectEditor}from'./components/project-editor';import{WeekLock}from'./components/week-lock';function App(){const[done,setDone]=React.useState(false);return <><button onClick={()=>setDone(!done)}>학습 완료 전환</button><WeekLock week={4} canUnlock={done}/><ProjectEditor initial={${JSON.stringify(fixture)}}/></>}createRoot(document.getElementById('root')).render(<App/>);`,
    resolveDir: process.cwd(),
    loader: "tsx",
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" },
  plugins: [
    {
      name: "test-router",
      setup(b) {
        b.onResolve({ filter: /^next\/navigation$/ }, () => ({
          path: "test-router",
          namespace: "fixture",
        }));
        b.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
          contents:
            "export const useRouter=()=>({push:()=>{},refresh:()=>{}});",
          loader: "js",
        }));
      },
    },
  ],
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
    viewport: { width: 1280, height: 900 },
  });
  const base = "http://127.0.0.1:3000";
  assert.equal(
    (
      await page.request.put(base + "/api/admin/assignments/test-project", {
        headers: { Origin: base },
        data: fixture,
      })
    ).status(),
    401,
  );
  assert.equal(
    (
      await page.request.put(base + "/api/admin/assignments/test-project", {
        headers: { Origin: "https://evil.example" },
        data: fixture,
      })
    ).status(),
    403,
  );
  await page.goto(base + "/admin/assignments");
  await expect(page).toHaveURL(/\/login\?/);
  const errors = [];
  page.on("pageerror", (e) => {
    errors.push(e.message);
    console.error(e.message);
  });
  await page.route("http://127.0.0.1:3000/projects-fixture", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html lang="ko"><head>${css}</head><body><main class="page narrow"><div id="root"></div></main></body></html>`,
    }),
  );
  let revision = 1;
  let conflict = false;
  const saved = [];
  await page.route("**/api/admin/assignments/test-project", async (route) => {
    const data = route.request().postDataJSON();
    saved.push(data);
    await route.fulfill({
      status: conflict ? 409 : 200,
      contentType: "application/json",
      body: JSON.stringify(
        conflict
          ? { error: "다른 창에서 수정되었습니다." }
          : { ok: true, revision: ++revision },
      ),
    });
  });
  await page.goto("http://127.0.0.1:3000/projects-fixture");
  await page.addScriptTag({ content: result.outputFiles[0].text });
  await page
    .getByRole("button", { name: "4주차 잠금 해제", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByLabel("암호", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("dialog")).toContainText(
    "Week 3의 개념 체크를 모두 완료",
  );
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  await page
    .getByRole("button", { name: "학습 완료 전환", exact: true })
    .click();
  await page
    .getByRole("button", { name: "4주차 잠금 해제", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByLabel("암호", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  await page.locator(".project-editor > summary").click();
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  await page.getByLabel("과제 제목", { exact: true }).fill("수정한 초안");
  await page
    .getByLabel("과제 내용 (Markdown)", { exact: true })
    .fill("## 변경 내용\n\n확인용 본문 $x^2$");
  await page.getByText("본문 미리보기", { exact: true }).click();
  await expect(page.locator(".project-editor .katex")).toHaveCount(1);
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("비공개 초안으로 저장");
  assert.equal(saved[0].published, false);
  assert.equal(saved[0].revision, 1);
  assert.equal(saved[0].title, "수정한 초안");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("학습자에게 공개");
  assert.equal(saved[1].revision, 2);
  conflict = true;
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("다른 창");
  await expect(
    page.getByLabel("과제 내용 (Markdown)", { exact: true }),
  ).toHaveValue("## 변경 내용\n\n확인용 본문 $x^2$");
  fs.mkdirSync("qa", { recursive: true });
  await page.screenshot({
    path: "qa/projects-admin-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  await page.screenshot({
    path: "qa/projects-admin-mobile.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "Project editor draft/publish/conflict/preview, mobile layout and prerequisite password UI passed.",
  );
} finally {
  await browser.close();
}
