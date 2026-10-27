"use client";
import { useRef, useState } from "react";
import {
  MAX_INTRO_TEXT,
  MAX_INTRO_TERMS,
  MAX_TERM_NAME,
  MAX_TERM_DEFINITION,
  validateLessonIntro,
  type LessonIntro,
} from "@/lib/lesson-intro";
import { LessonIntroPreview } from "./lesson-intro-preview";

export function LessonIntroEditor({
  week,
  initial,
  onDirty,
  onBusy,
}: {
  week: number;
  initial: LessonIntro;
  onDirty: (dirty: boolean) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const saving = useRef(false);
  function update(next: LessonIntro) {
    setDraft(next);
    setDirty(true);
    onDirty(true);
    setMessage("");
  }
  function move(index: number, offset: number) {
    const terms = [...draft.terms];
    [terms[index], terms[index + offset]] = [
      terms[index + offset],
      terms[index],
    ];
    update({ ...draft, terms });
  }
  async function save() {
    if (saving.current) return;
    const valid = validateLessonIntro(draft);
    if (!valid) {
      setMessage(
        "문구와 용어 설명은 각각 5,000자 이하, 용어는 중복 없이 최대 60개·이름은 1–100자로 입력하세요.",
      );
      return;
    }
    saving.current = true;
    setBusy(true);
    onBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/course/${week}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "intro", ...valid }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "저장하지 못했습니다.");
      setDraft({ ...valid, revision: data.revision });
      setDirty(false);
      onDirty(false);
      setMessage(
        "소개 문구와 용어를 저장했습니다. 학생 페이지를 새로고침하면 반영됩니다.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "저장하지 못했습니다. 다시 시도하세요.",
      );
    } finally {
      saving.current = false;
      setBusy(false);
      onBusy(false);
    }
  }
  return (
    <fieldset className="editor-form intro-editor" disabled={busy}>
      <h2>소개 문구·용어</h2>
      <p>
        Week {week} 상단에 표시할 문구와 펼쳐 보는 용어 설명을 편집합니다.
        저장하면 이 주차의 강의와 용어 사전에 반영됩니다.
      </p>
      <p>
        용어 목록은 학습 완료 조건과 별개입니다. 완료 조건은 ‘개념 체크 목록’
        탭에서 편집하세요.
      </p>
      {(
        [
          ["why", "왜 배우나요?"],
          ["previous", "이전 개념과 연결"],
          ["prerequisite", "이번 주에 필요한 것"],
        ] as const
      ).map(([key, label]) => (
        <label className="editor-field" key={key}>
          {label}
          <textarea
            aria-label={label}
            value={draft[key]}
            maxLength={MAX_INTRO_TEXT}
            onChange={(e) => update({ ...draft, [key]: e.target.value })}
          />
        </label>
      ))}
      <h3>용어와 설명</h3>
      {draft.terms.map((term, i) => (
        <fieldset className="panel quiz-fields" key={i}>
          <legend>용어 {i + 1}</legend>
          <label>
            용어 {i + 1} 이름
            <input
              aria-label={`용어 ${i + 1} 이름`}
              value={term.term}
              maxLength={MAX_TERM_NAME}
              onChange={(e) =>
                update({
                  ...draft,
                  terms: draft.terms.map((t, j) =>
                    j === i ? { ...t, term: e.target.value } : t,
                  ),
                })
              }
            />
          </label>
          <label>
            용어 {i + 1} 설명
            <textarea
              aria-label={`용어 ${i + 1} 설명`}
              value={term.definition}
              maxLength={MAX_TERM_DEFINITION}
              placeholder="비워 두면 기본 안내 문구가 표시됩니다."
              onChange={(e) =>
                update({
                  ...draft,
                  terms: draft.terms.map((t, j) =>
                    j === i ? { ...t, definition: e.target.value } : t,
                  ),
                })
              }
            />
          </label>
          <div className="editor-toolbar">
            <button
              type="button"
              aria-label={`용어 ${i + 1} 위로`}
              disabled={i === 0}
              onClick={() => move(i, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              aria-label={`용어 ${i + 1} 아래로`}
              disabled={i === draft.terms.length - 1}
              onClick={() => move(i, 1)}
            >
              ↓
            </button>
            <button
              type="button"
              aria-label={`용어 ${i + 1} 삭제`}
              onClick={() =>
                update({
                  ...draft,
                  terms: draft.terms.filter((_, j) => i !== j),
                })
              }
            >
              삭제
            </button>
          </div>
        </fieldset>
      ))}
      <div className="editor-toolbar">
        <button
          type="button"
          disabled={draft.terms.length >= MAX_INTRO_TERMS}
          onClick={() =>
            update({
              ...draft,
              terms: [...draft.terms, { term: "", definition: "" }],
            })
          }
        >
          용어 추가
        </button>
        <button type="button" onClick={() => setPreview(!preview)}>
          {preview ? "소개 미리보기 닫기" : "소개 미리보기"}
        </button>
        <button
          type="button"
          className="primary"
          disabled={!dirty || busy}
          onClick={() => void save()}
        >
          {busy ? "저장 중…" : "소개 문구·용어 저장"}
        </button>
      </div>
      <p role="status" aria-live="polite">
        {message ||
          (dirty ? "저장하지 않은 소개 문구·용어 변경사항이 있습니다." : "")}
      </p>
      {preview && (
        <section className="panel intro-preview" aria-label="소개 미리보기">
          <LessonIntroPreview intro={draft} />
        </section>
      )}
    </fieldset>
  );
}
