import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { CodeBlock } from "./interactive";
import { WeekPlayground } from "./playgrounds";
import { visualizationOptions } from "@/lib/visualizations";
import { parseTextDiagram } from "@/lib/text-diagrams";
import { LessonDiagram } from "./lesson-diagram";
export function WhyBox({ children }: { children: React.ReactNode }) {
  return (
    <aside className="why">
      <span className="eyebrow">왜 배우나요?</span>
      <p>{children}</p>
    </aside>
  );
}
export function LessonMarkdown({ text }: { text: string }) {
  // Only the source's explicit disclosure syntax is accepted. Other raw HTML
  // stays disabled, including event handlers and script tags in admin edits.
  const lines = text.split("\n");
  let fenced = false;
  for (let start = 0; start < lines.length; start++) {
    if (/^\s*```/.test(lines[start])) fenced = !fenced;
    if (fenced || lines[start].trim() !== "<details>") continue;
    const summary = lines[start + 1]
      ?.trim()
      .match(/^<summary>(.*?)<\/summary>$/);
    if (!summary) continue;
    let depth = 1;
    let end = start + 2;
    let codeFence = false;
    for (; end < lines.length; end++) {
      if (/^\s*```/.test(lines[end])) codeFence = !codeFence;
      if (codeFence) continue;
      if (lines[end].trim() === "<details>") depth++;
      if (lines[end].trim() === "</details>" && --depth === 0) break;
    }
    if (depth !== 0) continue;
    return (
      <>
        <LessonMarkdown text={lines.slice(0, start).join("\n")} />
        <details className="math-details">
          <summary>
            <Markdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{ p: ({ children }) => <span>{children}</span> }}
            >
              {summary[1].replace(/\\\(/g, "$ ").replace(/\\\)/g, " $")}
            </Markdown>
          </summary>
          <LessonMarkdown text={lines.slice(start + 2, end).join("\n")} />
        </details>
        <LessonMarkdown text={lines.slice(end + 1).join("\n")} />
      </>
    );
  }
  const pieces = text.split(/^```visualization\s*\n([a-z]+)\s*\n```\s*$/gm);
  if (pieces.length > 1)
    return (
      <>
        {pieces.map((piece, i) => {
          if (i % 2 === 0) return <LessonMarkdown key={i} text={piece} />;
          const option = visualizationOptions.find((o) => o.id === piece);
          return option ? (
            <WeekPlayground key={i} week={option.week} />
          ) : (
            <p key={i}>지원하지 않는 실험: {piece}</p>
          );
        })}
      </>
    );
  const normalized = text
    .replace(/\\\[/g, () => "$$")
    .replace(/\\\]/g, () => "$$")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$");
  return (
    <div className="prose">
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          pre: ({ node, children }) => {
            const code = node?.children.find(
              (child) => child.type === "element" && child.tagName === "code",
            );
            if (code?.type === "element") {
              const classes = code.properties.className;
              if (
                Array.isArray(classes) &&
                classes.includes("language-text") &&
                code.children.every((child) => child.type === "text")
              ) {
                const source = code.children
                  .map((child) => (child.type === "text" ? child.value : ""))
                  .join("");
                const diagram = parseTextDiagram(source, "text");
                if (diagram) return <LessonDiagram diagram={diagram} />;
              }
            }
            return <CodeBlock>{children}</CodeBlock>;
          },
          blockquote: ({ children }) => (
            <blockquote className="key-idea">{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="table-scroll">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {normalized}
      </Markdown>
    </div>
  );
}
