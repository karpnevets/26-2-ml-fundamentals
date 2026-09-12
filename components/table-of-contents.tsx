"use client";
import { useEffect, useState } from "react";
export function TableOfContents({
  sections,
}: {
  sections: { id: string; title: string }[];
}) {
  const [open, O] = useState(true);
  useEffect(() => {
    O(!window.matchMedia("(max-width: 700px)").matches);
  }, []);
  return (
    <aside className="toc">
      <details open={open} onToggle={(e) => O(e.currentTarget.open)}>
        <summary>이번 주의 순서</summary>
        <nav aria-label="강의 목차">
          <a href="#why">시작하는 질문</a>
          <a href="#experiment">직접 움직여 보기</a>
          {sections.map((s) => (
            <a href={`#${s.id}`} key={s.id}>
              {s.title.replace(/\*|`/g, "")}
            </a>
          ))}
          <a href="#progress">이해한 개념 체크</a>
        </nav>
      </details>
    </aside>
  );
}
