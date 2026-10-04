"use client";
import { useState } from "react";
import type { Project } from "@/lib/project-policy";
import { LessonMarkdown } from "./markdown";
export function ProjectEditor({ initial }: { initial: Project }) {
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [savedPublished, setSavedPublished] = useState(initial.published);
  const [savedTitle, setSavedTitle] = useState(initial.title);
  return (
    <details className="panel project-editor">
      <summary>
        {savedTitle} · {savedPublished ? "공개" : "비공개 초안"}
      </summary>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setMessage("");
          setError(false);
          try {
            const response = await fetch(
              `/api/admin/assignments/${initial.id}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(draft),
              },
            );
            const data = await response.json();
            if (!response.ok) throw Error(data.error || "저장하지 못했습니다.");
            setDraft((old) => ({ ...old, revision: data.revision }));
            setSavedPublished(draft.published);
            setSavedTitle(draft.title);
            setMessage(
              draft.published
                ? "저장했습니다. 해당 주차를 완료한 학습자에게 공개됩니다."
                : "비공개 초안으로 저장했습니다.",
            );
          } catch (e) {
            setError(true);
            setMessage(e instanceof Error ? e.message : "저장하지 못했습니다.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <fieldset disabled={busy}>
          <label>
            과제 제목
            <input
              value={draft.title}
              maxLength={200}
              required
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </label>
          <label>
            열람에 필요한 완료 주차
            <select
              value={draft.week}
              onChange={(e) =>
                setDraft({ ...draft, week: Number(e.target.value) })
              }
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i} value={i + 1}>
                  Week {i + 1}
                </option>
              ))}
            </select>
          </label>
          <label>
            짧은 소개
            <textarea
              aria-label="짧은 소개"
              rows={2}
              value={draft.summary}
              maxLength={1000}
              onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
            />
          </label>
          <label>
            과제 내용 (Markdown)
            <textarea
              aria-label="과제 내용 (Markdown)"
              rows={22}
              value={draft.body}
              maxLength={100000}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            />
          </label>
          <label className="project-publish">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) =>
                setDraft({ ...draft, published: e.target.checked })
              }
            />
            공개 — 해당 주차 학습 완료자만 열람
          </label>
          <button className="primary" type="submit">
            {busy ? "저장 중…" : "저장"}
          </button>
        </fieldset>
        {message && <p role={error ? "alert" : "status"}>{message}</p>}
      </form>
      <details>
        <summary>본문 미리보기</summary>
        <LessonMarkdown text={draft.body} />
      </details>
    </details>
  );
}
