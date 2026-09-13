"use client";
import { useRef, useState, type ReactNode } from "react";
import { glossary } from "@/lib/glossary";
export function CodeBlock({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLPreElement>(null);
  const [status, setStatus] = useState("복사");
  return (
    <div className="codeblock">
      <div className="codebar">
        <span>CODE / EXAMPLE</span>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(ref.current?.innerText || "");
              setStatus("복사됨");
            } catch {
              setStatus("코드를 선택해 복사하세요");
            }
          }}
        >
          {status}
        </button>
      </div>
      <pre ref={ref}>{children}</pre>
    </div>
  );
}
export function TermChip({ term }: { term: string }) {
  const entry = glossary.find(
    (t) => t.term.toLowerCase() === term.toLowerCase(),
  );
  return (
    <details className="term">
      <summary>{term}</summary>
      <div>{entry?.definition || "이번 주 본문에서 차근차근 살펴봅니다."}</div>
    </details>
  );
}
export function GlossarySearch({
  allowedWeeks = [0, 1, 2, 3, 4, 5, 6, 7, 8],
}: {
  allowedWeeks?: number[];
}) {
  const [query, setQuery] = useState("");
  const list = glossary.filter(
    (t) =>
      allowedWeeks.includes(t.week) &&
      (t.term + " " + t.definition).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <label className="search">
        용어 찾기
        <input
          placeholder="예: gradient, 기울기, 학습…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <p className="muted">{list.length}개 용어</p>
      <div className="glossary-grid">
        {list.map((t) => (
          <article
            className="panel"
            id={t.term.toLowerCase().replaceAll(" ", "-")}
            key={t.term}
          >
            <span className="eyebrow">WEEK {t.week}</span>
            <h2>{t.term}</h2>
            <p>{t.definition}</p>
            <a href={`/week/${t.week}`}>강의에서 살펴보기 ↗</a>
          </article>
        ))}
      </div>
      {!list.length && (
        <p>일치하는 용어가 없습니다. 다른 단어나 영어 이름을 검색해 보세요.</p>
      )}
    </>
  );
}
