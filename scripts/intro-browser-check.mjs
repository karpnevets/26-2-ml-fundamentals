import fs from "node:fs";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { chromium, expect } from "@playwright/test";

const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve("tsx/package.json"))("esbuild");
const initial = {
  why: "기울기를 배웁니다.",
  previous: "이전 내용",
  prerequisite: "필요한 내용",
  revision: 0,
  terms: [
    { term: "Gradient", definition: "기울기 설명" },
    { term: "Loss", definition: "손실 설명" },
  ],
};
const bundle = await build({
  stdin: {
    contents: `import React from 'react';import{createRoot}from'react-dom/client';import{CourseEditor}from'./components/course-editor';import{LessonIntroPreview}from'./components/lesson-intro-preview';function App(){const[intro,setIntro]=React.useState(${JSON.stringify(initial)});return <><CourseEditor week={4} original="Original body" initialBody="Original body" bodyRevision={0} initialQuiz={{questions:[],instructions:'',published:false,revision:0}} hasPassword={false} initialIntro={${JSON.stringify(initial)}}/><section id="student"><button onClick={async()=>setIntro(await(await fetch('/fixture-intro')).json())}>학생 소개 새로고침</button><LessonIntroPreview intro={intro}/></section></>}createRoot(document.getElementById('root')).render(<App/>);`,
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
const css = fs
  .readFileSync("app/globals.css", "utf8")
  .replace('@import "tailwindcss";', "");
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("dialog", (dialog) => dialog.accept());
  let saved = initial;
  let fail = false;
  let saves = 0;
  await page.route("https://sig.example/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/")
      return route.fulfill({
        contentType: "text/html",
        body: `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${css}</style></head><body><main class="page editor-page"><div id="root"></div></main></body></html>`,
      });
    if (url.pathname === "/fixture-intro")
      return route.fulfill({ json: saved });
    if (url.pathname === "/api/admin/course/4") {
      const payload = route.request().postDataJSON();
      assert.equal(payload.kind, "intro");
      assert.equal(payload.revision, saved.revision);
      if (fail)
        return route.fulfill({
          status: 409,
          json: { error: "다른 창에서 소개 문구·용어를 수정했습니다." },
        });
      saved = { ...payload, revision: saved.revision + 1 };
      saves++;
      return route.fulfill({ json: { ok: true, revision: saved.revision } });
    }
    return route.fulfill({ status: 404, body: "" });
  });
  const load = async () => {
    await page.goto("https://sig.example/");
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
  };
  await load();
  await page
    .getByRole("button", { name: "소개 문구·용어", exact: true })
    .click();
  const editor = page.locator(".intro-editor");
  await editor
    .getByLabel("왜 배우나요?", { exact: true })
    .fill("학습 방향을 찾습니다.");
  await editor
    .getByLabel("이전 개념과 연결", { exact: true })
    .fill("앞 주차의 손실과 연결합니다.");
  await editor
    .getByLabel("이번 주에 필요한 것", { exact: true })
    .fill("함수와 손실");
  await editor.getByLabel("용어 1 이름").fill("기울기");
  await editor.getByLabel("용어 1 설명").fill("손실의 변화 방향입니다.");
  await editor.getByRole("button", { name: "용어 추가", exact: true }).click();
  await editor.getByLabel("용어 3 이름").fill("Chain Rule");
  await editor.getByLabel("용어 3 설명").fill("합성함수의 미분");
  await editor
    .getByRole("button", { name: "용어 3 위로", exact: true })
    .click();
  await editor
    .getByRole("button", { name: "용어 3 삭제", exact: true })
    .click();
  await editor
    .getByRole("button", { name: "소개 미리보기", exact: true })
    .click();
  const preview = editor.locator(".intro-preview");
  await expect(preview).toContainText("학습 방향을 찾습니다.");
  await preview.locator("summary").filter({ hasText: "기울기" }).click();
  await expect(preview).toContainText("손실의 변화 방향입니다.");
  await page.getByRole("button", { name: "학습 본문", exact: true }).click();
  await page
    .getByRole("button", { name: "소개 문구·용어", exact: true })
    .click();
  await expect(editor.getByLabel("용어 2 이름")).toHaveValue("Chain Rule");
  fail = true;
  await editor
    .getByRole("button", { name: "소개 문구·용어 저장", exact: true })
    .click();
  await expect(editor.getByRole("status")).toContainText("다른 창");
  await expect(editor.getByLabel("왜 배우나요?", { exact: true })).toHaveValue(
    "학습 방향을 찾습니다.",
  );
  fail = false;
  await editor
    .getByRole("button", { name: "소개 문구·용어 저장", exact: true })
    .click();
  await expect(editor.getByRole("status")).toContainText("저장했습니다");
  assert.deepEqual(
    saved.terms.map((t) => t.term),
    ["기울기", "Chain Rule"],
  );
  await page.getByRole("button", { name: "학생 소개 새로고침" }).click();
  await expect(page.locator("#student")).toContainText("학습 방향을 찾습니다.");
  await expect(page.locator("#student summary")).toHaveText([
    "기울기",
    "Chain Rule",
  ]);
  await editor.getByLabel("용어 2 이름").fill("기울기");
  await editor
    .getByRole("button", { name: "소개 문구·용어 저장", exact: true })
    .click();
  await expect(editor.getByRole("status")).toContainText("중복 없이");
  assert.equal(saves, 1);
  await editor.getByLabel("용어 2 이름").fill("Chain Rule");
  fs.mkdirSync("qa", { recursive: true });
  await page.screenshot({
    path: "qa/intro-editor-desktop.png",
    fullPage: true,
  });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await expect(
      editor.getByLabel("왜 배우나요?", { exact: true }),
    ).toBeVisible();
  }
  await page.screenshot({ path: "qa/intro-editor-mobile.png", fullPage: true });
  await editor
    .getByRole("button", { name: "용어 2 삭제", exact: true })
    .click();
  await editor
    .getByRole("button", { name: "용어 1 삭제", exact: true })
    .click();
  await editor
    .getByRole("button", { name: "소개 문구·용어 저장", exact: true })
    .click();
  await expect(editor.getByRole("status")).toContainText("저장했습니다");
  assert.deepEqual(saved.terms, []);
  assert.equal(saved.revision, 2);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: intro edit/add/delete/reorder, tab retention, preview, conflict recovery, duplicate validation, student refresh and desktop/mobile layout.",
  );
} finally {
  await browser.close();
}
