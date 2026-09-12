import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { CodeBlock } from "./interactive";
export function MathDetails({ children }: { children: React.ReactNode }) {
  return (
    <details className="math-details">
      <summary>수식 더 보기</summary>
      {children}
    </details>
  );
}
export function WhyBox({ children }: { children: React.ReactNode }) {
  return (
    <aside className="why">
      <span className="eyebrow">왜 배우나요?</span>
      <p>{children}</p>
    </aside>
  );
}
export function LessonMarkdown({ text }: { text: string }) {
  const normalized = text
    // The source's two rough loss sketches are replaced by an accurate U shape.
    // The original Markdown remains available unchanged in content/.
    .replace(
      /```text\nLoss\n \^[\s\S]*?```/g,
      "```text\nLoss\n ^\n |  *           *\n |    *       *\n |      *   *\n |        *\n +----------------> w\n          3\n```",
    )
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
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          span: ({ node, className, children, ...props }) =>
            className?.includes("katex-display") ? (
              <MathDetails>
                <span className={className} {...props}>
                  {children}
                </span>
              </MathDetails>
            ) : (
              <span className={className} {...props}>
                {children}
              </span>
            ),
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
