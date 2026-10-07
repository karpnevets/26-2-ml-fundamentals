import fs from "node:fs";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { chromium, expect } from "@playwright/test";

const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve("tsx/package.json"))("esbuild");
const initial = [
  { id: "w3:Feature Space", label: "Feature Space" },
  { id: "w3:XOR", label: "XOR" },
];
const bundle = await build({
  stdin: {
    contents: `import React from 'react';import{createRoot}from'react-dom/client';import{CourseEditor}from'./components/course-editor';import{ProgressProvider,ProgressCheck,ProgressNotice,WeekStatus}from'./components/progress';function App(){const[items,setItems]=React.useState(${JSON.stringify(initial)});return <><CourseEditor week={3} original="Original body" initialBody="Original body" bodyRevision={0} initialQuiz={{questions:[],instructions:'',published:false,revision:0}} hasPassword={false} initialConcepts={${JSON.stringify(initial)}} conceptRevision={0}/><section id="student"><h2>학생 목록</h2><button onClick={async()=>setItems(await(await fetch('/fixture-concepts')).json())}>학생 목록 새로고침</button><ProgressProvider><ProgressNotice/><WeekStatus week={3} concepts={items.map(c=>c.label)} conceptIds={items.map(c=>c.id)}/>{items.map(c=><ProgressCheck key={c.id} id={c.id} label={c.label}/>)}</ProgressProvider></section></>}createRoot(document.getElementById('root')).render(<App/>);`,
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
          contents: "export const useRouter=()=>({refresh:()=>{}});",
          loader: "js",
        }));
      },
    },
  ],
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
  await page.addInitScript(() =>
    localStorage.setItem(
      "ml-sig-progress-v2",
      JSON.stringify({ "w3:Feature Space": true, "w3:XOR": true }),
    ),
  );
  let saved = initial;
  let revision = 0;
  let fail = false;
  let payload;
  let account = false;
  let importedIds;
  await page.route("https://sig.example/**", async (route) => {
    const url = new URL(route.request().url());
    let data;
    if (url.pathname === "/api/me")
      data = account
        ? {
            mode: "account",
            user: {
              id: "fixture-user",
              email: "test@snu.ac.kr",
              name: "Test",
              isAdmin: false,
            },
          }
        : { mode: "guest" };
    else if (url.pathname === "/api/progress")
      data = {
        ownerId: "fixture-user",
        values: {},
        itemIds: saved.map((c) => c.id),
      };
    else if (url.pathname === "/api/progress/import") {
      importedIds = route.request().postDataJSON().ids;
      data = {
        imported: importedIds.length,
        values: Object.fromEntries(importedIds.map((id) => [id, true])),
      };
    } else if (url.pathname === "/fixture-concepts") data = saved;
    else if (url.pathname === "/api/admin/course/3") {
      payload = route.request().postDataJSON();
      if (fail)
        return route.fulfill({
          status: 409,
          json: { error: "다른 창에서 개념 목록을 수정했습니다." },
        });
      assert.equal(payload.kind, "concepts");
      assert.equal(payload.revision, revision);
      saved = payload.concepts.map((c, i) => ({
        ...c,
        id: c.id ?? `w3:concept:fixture-${i}`,
      }));
      data = { ok: true, revision: ++revision, concepts: saved };
    } else if (url.pathname === "/") {
      return route.fulfill({
        contentType: "text/html",
        body: `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${css}</style></head><body><main class="page editor-page"><div id="root"></div></main></body></html>`,
      });
    } else return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ json: data });
  });
  await page.goto("https://sig.example/");
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await page
    .getByRole("button", { name: "개념 체크 목록", exact: true })
    .click();
  const editor = page.locator(".concept-editor");
  await expect(editor.getByLabel("개념 1", { exact: true })).toHaveValue(
    "Feature Space",
  );
  await expect(
    page.locator("#student").getByRole("checkbox", { name: "Feature Space" }),
  ).toBeChecked();
  await editor.getByLabel("개념 1", { exact: true }).fill("특징 공간");
  await editor.getByRole("button", { name: "개념 추가", exact: true }).click();
  await editor.getByLabel("개념 3", { exact: true }).fill("Kernel");
  await editor
    .getByRole("button", { name: "개념 3 위로", exact: true })
    .click();
  await editor
    .getByRole("button", { name: "개념 3 삭제", exact: true })
    .click();
  await page.getByRole("button", { name: "학습 본문", exact: true }).click();
  await page
    .getByRole("button", { name: "개념 체크 목록", exact: true })
    .click();
  await expect(editor.getByLabel("개념 1", { exact: true })).toHaveValue(
    "특징 공간",
  );
  fail = true;
  await editor
    .getByRole("button", { name: "개념 목록 저장", exact: true })
    .click();
  await expect(editor.getByRole("status")).toContainText("다른 창");
  await expect(editor.getByLabel("개념 2", { exact: true })).toHaveValue(
    "Kernel",
  );
  fail = false;
  await editor
    .getByRole("button", { name: "개념 목록 저장", exact: true })
    .click();
  await expect(editor.getByRole("status")).toContainText("저장했습니다");
  assert.equal(payload.concepts[0].id, "w3:Feature Space");
  assert.equal(payload.concepts[1].id, null);
  await page
    .getByRole("button", { name: "학생 목록 새로고침", exact: true })
    .click();
  const student = page.locator("#student");
  await expect(
    student.getByRole("checkbox", { name: "특징 공간" }),
  ).toBeChecked();
  await expect(
    student.getByRole("checkbox", { name: "Kernel" }),
  ).not.toBeChecked();
  await expect(student.getByRole("checkbox", { name: "XOR" })).toHaveCount(0);
  await expect(student.locator(".status")).toHaveText("1 / 2 개념");
  await student.getByRole("checkbox", { name: "Kernel" }).check();
  await expect(student.locator(".status")).toHaveText("이해 완료");
  const previousRevision = revision;
  await editor.getByLabel("개념 2", { exact: true }).fill("특징 공간");
  await editor
    .getByRole("button", { name: "개념 목록 저장", exact: true })
    .click();
  await expect(editor.getByRole("status")).toContainText("중복 없이");
  assert.equal(revision, previousRevision);
  await editor.getByLabel("개념 2", { exact: true }).fill("Kernel");
  fs.mkdirSync("qa", { recursive: true });
  await page.screenshot({
    path: "qa/concept-editor-desktop.png",
    fullPage: true,
  });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await expect(editor.getByLabel("개념 1", { exact: true })).toBeVisible();
  }
  await page.screenshot({
    path: "qa/concept-editor-mobile.png",
    fullPage: true,
  });
  await editor
    .getByRole("button", { name: "개념 2 삭제", exact: true })
    .click();
  await expect(
    editor.getByRole("button", { name: "개념 1 삭제", exact: true }),
  ).toBeDisabled();
  account = true;
  await page.reload();
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await expect(page.locator("#student")).toContainText("완료 기록 1개");
  await page
    .getByRole("button", { name: "기기 기록 가져오기", exact: true })
    .click();
  await expect(page.locator("#student")).toContainText(
    "1개 기록을 가져왔습니다",
  );
  assert.deepEqual(importedIds, ["w3:Feature Space"]);
  assert.equal(
    await page.evaluate(() => localStorage.getItem("ml-sig-progress-v2")),
    null,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: concept edit/add/delete/reorder, tab retention, conflict recovery, validation, stable local progress and desktop/mobile layout.",
  );
} finally {
  await browser.close();
}
