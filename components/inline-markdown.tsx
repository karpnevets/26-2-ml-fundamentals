import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export function InlineMarkdown({ text }: { text: string }) {
  const normalized = text.replace(/\\\(/g, "$").replace(/\\\)/g, "$");
  return (
    <Markdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{ p: ({ children }) => <span>{children}</span> }}
    >
      {normalized}
    </Markdown>
  );
}
