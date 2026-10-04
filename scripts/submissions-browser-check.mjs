import fs from "node:fs";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { chromium, expect } from "@playwright/test";
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve("tsx/package.json"))("esbuild");
const base = "http://127.0.0.1:3000";
const owner = "00000000-0000-4000-8000-000000000001";
const notebook = JSON.stringify({
  nbformat: 4,
  nbformat_minor: 5,
  metadata: {},
  cells: [{ cell_type: "markdown", metadata: {}, source: ["결과 확인"] }],
});
const bundle = await build({
  stdin: {
    contents: `import React from 'react';import{createRoot}from'react-dom/client';import{NotebookSubmission}from'./components/notebook-submission';import{SubmissionReviews}from'./components/submission-reviews';const f=window.fixture;createRoot(document.getElementById('root')).render(f.admin?<SubmissionReviews items={f.items}/>:<><h1>선택 과제</h1><section className="panel"><h2>직접 구현하기</h2><NotebookSubmission projectId="demo" ownerId="${owner}" initial={f.submission}/></section><section className="panel"><h2>다른 과제</h2><NotebookSubmission projectId="other" ownerId="${owner}" initial={null}/></section></>);`,
    resolveDir: process.cwd(),
    loader: "tsx",
  },
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" },
  plugins: [
    {
      name: "fixture-router",
      setup(b) {
        b.onResolve({ filter: /^next\/navigation$/ }, () => ({
          path: "router",
          namespace: "fixture",
        }));
        b.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
          contents: "export const useRouter=()=>({refresh:()=>{}})",
          loader: "js",
        }));
      },
    },
  ],
});
const css = fs
  .readdirSync(".next/static/css")
  .filter((f) => f.endsWith(".css"))
  .map((f) => `<link rel="stylesheet" href="${base}/_next/static/css/${f}">`)
  .join("");
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const path of [
    "/api/assignments/demo/submission",
    "/api/admin/assignments/demo/feedback",
  ]) {
    assert.equal(
      (
        await page.request.put(base + path, {
          headers: { Origin: base },
          data: {},
        })
      ).status(),
      401,
    );
    assert.equal(
      (
        await page.request.put(base + path, {
          headers: { Origin: "https://evil.example" },
          data: {},
        })
      ).status(),
      403,
    );
  }
  assert.equal(
    (
      await page.request.get(
        base + "/api/assignments/demo/submission?revision=1",
      )
    ).status(),
    401,
  );
  await page.goto(base + "/admin/submissions");
  await expect(page).toHaveURL(/\/login\?/);
  await page.route(base + "/submissions-fixture", (r) =>
    r.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html lang="ko"><head>${css}</head><body><main class="page narrow"><div id="root"></div></main></body></html>`,
    }),
  );
  let submission = null,
    rejectFeedback = false;
  const now = new Date().toISOString();
  await page.route("**/api/assignments/demo/submission", async (route) => {
    const r = route.request();
    assert.equal(r.headers()["x-submission-owner"], owner);
    if (r.method() === "PUT") {
      assert.equal(
        r.headers()["x-submission-revision"],
        String(submission?.revision || 0),
      );
      assert.equal(r.postDataBuffer().toString("utf8"), notebook);
      submission = {
        projectId: "demo",
        filename: decodeURIComponent(r.headers()["x-notebook-filename"]),
        revision: (submission?.revision || 0) + 1,
        status: "draft",
        feedback: "",
        uploadedAt: now,
        requestedAt: null,
        reviewedAt: null,
      };
    } else {
      assert.equal(r.postDataJSON().revision, submission.revision);
      submission = {
        ...submission,
        revision: submission.revision + 1,
        status: "requested",
        requestedAt: now,
      };
    }
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ submission }),
    });
  });
  await page.route("**/api/admin/assignments/demo/feedback", async (route) => {
    const data = route.request().postDataJSON();
    assert.equal(data.userId, owner);
    if (rejectFeedback) {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          error: "학생이 파일을 교체했습니다. 새로고침해 주세요.",
        }),
      });
      return;
    }
    assert.equal(data.revision, submission.revision);
    submission = {
      ...submission,
      status: "reviewed",
      revision: submission.revision + 1,
      feedback: data.feedback,
      reviewedAt: now,
    };
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ submission }),
    });
  });
  async function mount(admin = false) {
    await page.goto(base + "/submissions-fixture");
    const f = {
      admin,
      submission,
      items: submission
        ? [
            {
              ...submission,
              userId: owner,
              name: "테스트 학생",
              email: "student@snu.ac.kr",
              title: "직접 구현하기",
              week: 3,
            },
          ]
        : [],
    };
    await page.evaluate((f) => {
      window.fixture = f;
    }, f);
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
  }
  await mount();
  const first = page.locator(".notebook-submission").first();
  await expect(
    first.getByRole("button", { name: "피드백 요청", exact: true }),
  ).toBeDisabled();
  await first
    .getByLabel("노트북 파일", { exact: true })
    .setInputFiles({
      name: "bad.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("bad"),
    });
  await first.getByRole("button", { name: "업로드", exact: true }).click();
  await expect(first.getByRole("alert")).toContainText(".ipynb");
  assert.equal(submission, null);
  await first
    .getByLabel("노트북 파일", { exact: true })
    .setInputFiles({
      name: "내 실습.ipynb",
      mimeType: "application/json",
      buffer: Buffer.from(notebook),
    });
  await first.getByRole("button", { name: "업로드", exact: true }).click();
  await expect(first.getByRole("status")).toContainText("업로드했습니다");
  await expect(
    page
      .locator(".notebook-submission")
      .nth(1)
      .getByRole("button", { name: "피드백 요청", exact: true }),
  ).toBeDisabled();
  await first.getByRole("button", { name: "피드백 요청", exact: true }).click();
  await expect(first).toContainText("피드백 대기 중");
  await expect(
    first.getByRole("button", { name: "피드백 요청", exact: true }),
  ).toBeDisabled();
  await mount(true);
  await expect(
    page.getByRole("link", { name: "내 실습.ipynb 다운로드", exact: true }),
  ).toHaveAttribute("href", /revision=2/);
  await page
    .getByLabel("간단한 피드백", { exact: true })
    .fill("gradient 계산을 다시 확인하세요.\n<script>alert(1)</script>");
  rejectFeedback = true;
  await page.getByRole("button", { name: "피드백 저장", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("파일을 교체");
  await expect(page.getByLabel("간단한 피드백", { exact: true })).toHaveValue(
    /gradient/,
  );
  rejectFeedback = false;
  await page.getByRole("button", { name: "피드백 저장", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("피드백을 저장");
  fs.mkdirSync("qa", { recursive: true });
  await page.screenshot({ path: "qa/submissions-admin.png", fullPage: true });
  await mount();
  await expect(page.locator(".submission-feedback")).toContainText(
    "<script>alert(1)</script>",
  );
  assert.equal(await page.locator(".submission-feedback script").count(), 0);
  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  await page.screenshot({
    path: "qa/submissions-student-mobile.png",
    fullPage: true,
  });
  await first
    .getByLabel("노트북 파일", { exact: true })
    .setInputFiles({
      name: "다시.ipynb",
      mimeType: "application/json",
      buffer: Buffer.from(notebook),
    });
  await expect(
    first.getByRole("button", { name: "피드백 요청", exact: true }),
  ).toBeDisabled();
  await first.getByRole("button", { name: "파일 교체", exact: true }).click();
  await expect(first).toContainText("업로드 완료 · 요청 전");
  await expect(first.locator(".submission-feedback")).toHaveCount(0);
  await expect(
    first.getByRole("button", { name: "피드백 요청", exact: true }),
  ).toBeEnabled();
  assert.deepEqual(errors, []);
  console.log(
    "Notebook upload/request/review/replacement, conflict recovery, student isolation, mobile UI and anonymous API checks passed.",
  );
} finally {
  await browser.close();
}
