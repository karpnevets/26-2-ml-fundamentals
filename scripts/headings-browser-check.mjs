import fs from "node:fs";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { chromium, expect } from "@playwright/test";

const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve("tsx/package.json"))("esbuild");
const body = [
  String.raw`### 2.4 차원과 $\mathbb{R}^d$`,
  "본문 내용.",
  String.raw`### 2.8 전치 기호 $\top$`,
  "본문 내용.",
  "### 2.20 데이터 행렬 $X$",
  "본문 내용.",
  String.raw`### 2.30 점수 \(w^\top x+b\)`,
  "본문 내용.",
  "### 2.31 **가중치**와 `bias`",
  "본문 내용.",
  "### 2.32 두 가중치 $w_1*w_2$",
  "본문 내용.",
  "## 선택 과제",
  "연습 문제.",
].join("\n\n");
const lesson = {
  week: 2,
  title: "Vectors & Linear Classification",
  question: "벡터로 데이터를 어떻게 분류할까요?",
  concepts: [],
  estimated_time: "60분",
  body,
};
const stubs = {
  "next/link":
    "export default function Link({children,...props}) { return <a {...props}>{children}</a>; }",
  "next/navigation":
    "export function notFound() { throw new Error('unexpected notFound'); }",
  "@/lib/course": `export async function courseAccess(){return {weeks:[0,1,2],completed:[0,1]};} export async function editedLessons(){return [${JSON.stringify(lesson)},${JSON.stringify(lesson)},${JSON.stringify(lesson)}];}`,
  "@/lib/course-documents":
    "export async function lessonContextForWeek(){return {why:'질문',previous:'이전 개념',prerequisite:'필요한 개념'};} export async function glossaryForWeeks(){return [];}",
  "@/lib/concepts": "export function conceptEntries(){return [];}",
  "@/components/assignments": "export function Assignments(){return null;}",
  "@/components/interactive":
    "export function TermChip(){return null;} export function CodeBlock({children}){return <pre>{children}</pre>;}",
  "./interactive":
    "export function TermChip(){return null;} export function CodeBlock({children}){return <pre>{children}</pre>;}",
  "@/components/progress":
    "export function ProgressCheck(){return null;} export function WeekStatus(){return null;}",
  "@/components/playgrounds": "export function WeekPlayground(){return null;}",
  "./playgrounds": "export function WeekPlayground(){return null;}",
  "@/components/resnet-recap": "export function ResNetRecap(){return null;}",
  "@/components/week-lock": "export function WeekLock(){return null;}",
};
const bundle = await build({
  stdin: {
    contents: `import {createRoot} from 'react-dom/client'; import Week from './app/week/[id]/page'; Week({params:Promise.resolve({id:'2'})}).then(page=>createRoot(document.getElementById('root')).render(page));`,
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
      name: "lesson-fixture",
      setup(builder) {
        builder.onResolve({ filter: /.*/ }, (args) =>
          stubs[args.path]
            ? { path: args.path, namespace: "fixture" }
            : undefined,
        );
        builder.onLoad({ filter: /.*/, namespace: "fixture" }, (args) => ({
          contents: stubs[args.path],
          loader: "tsx",
          resolveDir: process.cwd(),
        }));
      },
    },
  ],
});
const css = fs
  .readFileSync("app/globals.css", "utf8")
  .replace('@import "tailwindcss";', "");
const katexCss = fs
  .readFileSync(require.resolve("katex/dist/katex.min.css"), "utf8")
  .replace(/url\(fonts\/([^)]*)\)/g, (_, filename) => {
    const data = fs.readFileSync(
      require.resolve(`katex/dist/fonts/${filename}`),
    );
    const type = filename.endsWith("woff2")
      ? "woff2"
      : filename.endsWith("woff")
        ? "woff"
        : "ttf";
    return `url(data:font/${type};base64,${data.toString("base64")})`;
  });
fs.mkdirSync("qa", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(
    `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${css}\n${katexCss}</style></head><body><main><div id="root"></div></main></body></html>`,
  );
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await expect(page.locator(".lesson-section > h2")).toHaveCount(7);
  await expect(page.locator(".lesson-section > h2 .katex")).toHaveCount(5);
  await expect(page.locator(".toc .katex")).toHaveCount(5);
  await expect(page.locator(".katex-error")).toHaveCount(0);
  await expect(page.locator(".lesson-section > h2 p, .toc a p")).toHaveCount(0);
  await expect(page.locator(".lesson-section > h2 strong")).toHaveText(
    "가중치",
  );
  await expect(page.locator(".toc code")).toHaveText("bias");
  await expect(page.locator(".lesson-section > h2").last()).toHaveText(
    "연습문제",
  );
  const sectionTitles = await page
    .locator(".lesson-section > h2 .katex-html")
    .allTextContents();
  assert(
    sectionTitles.some((title) => title.includes("∗")),
    "math multiplication must survive title rendering",
  );
  const link = page.locator('.toc a[href="#section-2"]');
  await link.click();
  await expect(page.locator("#section-2")).toBeInViewport();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "qa/heading-math-desktop.png",
    fullPage: true,
  });
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator(".toc details").evaluate((details) => {
      details.open = true;
    });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `overflow at ${width}`,
    );
  }
  await page.screenshot({ path: "qa/heading-math-mobile.png", fullPage: true });
  assert.deepEqual(errors, []);
  console.log(
    "PASS actual lesson page: math in section headings and TOC, both delimiters, formatting, anchors, desktop/mobile layout",
  );
} finally {
  await browser.close();
}
