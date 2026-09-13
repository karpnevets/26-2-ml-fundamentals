"use client";
import { useEffect, useRef, useState } from "react";
import { LessonMarkdown } from "./markdown";
import { visualizationOptions } from "@/lib/visualizations";
import type { QuizQuestion } from "@/lib/course-policy";
type Quiz = {
  questions: QuizQuestion[];
  instructions: string;
  published: boolean;
  revision: number;
};
export function CourseEditor({
  week,
  original,
  initialBody,
  bodyRevision,
  initialQuiz,
  hasPassword,
}: {
  week: number;
  original: string;
  initialBody: string;
  bodyRevision: number;
  initialQuiz: Quiz;
  hasPassword: boolean;
}) {
  const [tab, setTab] = useState<"lesson" | "quiz">(
    week >= 2 ? "quiz" : "lesson",
  );
  const [body, setBody] = useState(initialBody),
    [revision, setRevision] = useState(bodyRevision);
  const [quiz, setQuiz] = useState(initialQuiz),
    [password, setPassword] = useState(""),
    [hasPass, setHasPass] = useState(hasPassword);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [dirtyLesson, setDirtyLesson] = useState(false),
    [dirtyQuiz, setDirtyQuiz] = useState(false),
    [preview, setPreview] = useState(false);
  const dirty = dirtyLesson || dirtyQuiz;
  function setDirty(value: boolean) {
    if (tab === "lesson") setDirtyLesson(value);
    else setDirtyQuiz(value);
  }
  const area = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [dirty]);
  function updateQuiz(next: Quiz) {
    setQuiz(next);
    setDirtyQuiz(true);
    setMessage("");
  }
  function updateQuestion(i: number, patch: Partial<QuizQuestion>) {
    updateQuiz({
      ...quiz,
      questions: quiz.questions.map((q, j) =>
        i === j ? { ...q, ...patch } : q,
      ),
    });
  }
  async function save(kind: "lesson" | "quiz") {
    setBusy(true);
    setMessage("");
    try {
      const payload =
        kind === "lesson"
          ? { kind, body, revision }
          : { kind, ...quiz, password };
      const res = await fetch(`/api/admin/course/${week}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw Error(data.error);
      if (kind === "lesson") setRevision(data.revision);
      else {
        setQuiz((q) => ({ ...q, revision: data.revision }));
        setHasPass(hasPass || !!password);
        setPassword("");
      }
      setMessage(
        kind === "lesson"
          ? "본문을 저장했습니다. 학생 페이지에 바로 반영됩니다."
          : "퀴즈를 저장했습니다.",
      );
      if (kind === "lesson") setDirtyLesson(false);
      else setDirtyQuiz(false);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setBusy(false);
    }
  }
  return (
    <fieldset disabled={busy} className="editor-form">
      <div className="lab-tabs">
        <button
          aria-pressed={tab === "lesson"}
          onClick={() => {
            if (
              !dirty ||
              confirm(
                "저장하지 않은 내용이 있습니다. 탭을 바꿀까요? 내용은 이 화면에 유지됩니다.",
              )
            )
              setTab("lesson");
          }}
        >
          학습 본문
        </button>
        {week >= 2 && (
          <button aria-pressed={tab === "quiz"} onClick={() => setTab("quiz")}>
            잠금 해제 퀴즈
          </button>
        )}
      </div>
      <p role="status" className="editor-message">
        {message || (dirty ? "저장하지 않은 변경사항이 있습니다." : "")}
      </p>
      {tab === "lesson" ? (
        <>
          <p>
            Markdown 본문을 편집합니다. 제목·개념 체크 항목은 기존 값을
            유지합니다. 수식, 이미지 링크, 코드 블록과 아래 실험 삽입을
            지원합니다.
          </p>
          <div className="editor-toolbar">
            <label>
              실험 삽입
              <select
                defaultValue=""
                onChange={(e) => {
                  const id = e.target.value;
                  if (!id) return;
                  const token = "\n\n```visualization\n" + id + "\n```\n\n";
                  const pos = area.current?.selectionStart ?? body.length;
                  setBody(body.slice(0, pos) + token + body.slice(pos));
                  setDirty(true);
                  e.target.value = "";
                }}
              >
                <option value="">실험 선택…</option>
                {visualizationOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={() => setPreview(!preview)}>
              {preview ? "미리보기 닫기" : "미리보기"}
            </button>
            <button
              onClick={() => {
                if (
                  confirm(
                    "편집 내용을 원본으로 교체할까요? 저장을 눌러야 적용됩니다.",
                  )
                ) {
                  setBody(original);
                  setDirty(true);
                }
              }}
            >
              원본 불러오기
            </button>
          </div>
          <textarea
            ref={area}
            aria-label="학습 본문 Markdown"
            className="body-editor"
            value={body}
            maxLength={150000}
            onChange={(e) => {
              setBody(e.target.value);
              setDirty(true);
            }}
          />
          <button
            className="primary"
            disabled={busy}
            onClick={() => save("lesson")}
          >
            {busy ? "저장 중…" : "본문 저장"}
          </button>
          {preview && (
            <section className="panel">
              <h2>본문 미리보기</h2>
              <LessonMarkdown text={body} />
            </section>
          )}
        </>
      ) : (
        <>
          <p>
            직전 {week - 1}주차 복습 문제입니다. 정답은 관리자에게만 보입니다.
            학생에게는 문항과 암호 조합 설명만 공개됩니다.
          </p>
          {quiz.questions.map((q, i) => (
            <fieldset className="panel quiz-fields" key={i}>
              <legend>문항 {i + 1}</legend>
              <label>
                문제 번호
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={q.number}
                  onChange={(e) =>
                    updateQuestion(i, { number: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                문항 설명 (Markdown)
                <textarea
                  value={q.description}
                  maxLength={10000}
                  onChange={(e) =>
                    updateQuestion(i, { description: e.target.value })
                  }
                />
              </label>
              <label>
                이미지 URL (선택 · HTTPS)
                <input
                  type="url"
                  placeholder="https://…/image.png"
                  value={q.image}
                  maxLength={2000}
                  onChange={(e) => updateQuestion(i, { image: e.target.value })}
                />
              </label>
              <label>
                정답 (관리자만)
                <input
                  value={q.answer}
                  maxLength={2000}
                  onChange={(e) =>
                    updateQuestion(i, { answer: e.target.value })
                  }
                />
              </label>
              <button
                onClick={() =>
                  updateQuiz({
                    ...quiz,
                    questions: quiz.questions.filter((_, j) => j !== i),
                  })
                }
              >
                문항 삭제
              </button>
            </fieldset>
          ))}
          <button
            disabled={quiz.questions.length >= 30}
            onClick={() =>
              updateQuiz({
                ...quiz,
                questions: [
                  ...quiz.questions,
                  {
                    number:
                      Math.max(0, ...quiz.questions.map((q) => q.number)) + 1,
                    description: "",
                    image: "",
                    answer: "",
                  },
                ],
              })
            }
          >
            + 문항 추가
          </button>
          <label className="editor-field">
            암호 조합 설명 (학생에게 공개)
            <textarea
              value={quiz.instructions}
              maxLength={10000}
              onChange={(e) =>
                updateQuiz({ ...quiz, instructions: e.target.value })
              }
            />
          </label>
          <label className="editor-field">
            실제 잠금 해제 암호
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              maxLength={200}
              placeholder={
                hasPass
                  ? "설정됨 · 비워두면 기존 암호 유지"
                  : "공개 전에 암호를 입력하세요"
              }
              onChange={(e) => {
                setPassword(e.target.value);
                setDirty(true);
              }}
            />
          </label>
          <button
            onClick={() => {
              setPassword(
                [...quiz.questions]
                  .sort((a, b) => a.number - b.number)
                  .map((q) => q.answer.trim())
                  .join(""),
              );
              setDirty(true);
            }}
          >
            정답을 번호순으로 이어 붙여 암호 설정
          </button>
          <p>
            암호는 대소문자와 내부 공백을 구분합니다. 앞뒤 공백은 무시합니다.
            암호 변경·퀴즈 비공개 전환 후에도 이미 해제한 학습자의 기록은
            유지됩니다.
          </p>
          <label className="check">
            <input
              type="checkbox"
              checked={quiz.published}
              onChange={(e) =>
                updateQuiz({ ...quiz, published: e.target.checked })
              }
            />
            학생에게 퀴즈 공개
          </label>
          <div className="editor-toolbar">
            <button
              className="primary"
              disabled={busy}
              onClick={() => save("quiz")}
            >
              {busy ? "저장 중…" : "퀴즈 저장"}
            </button>
            <button onClick={() => setPreview(!preview)}>
              학생 화면 미리보기
            </button>
          </div>
          {preview && (
            <section className="panel">
              <h2>{week}주차 힌트 미리보기</h2>
              {[...quiz.questions]
                .sort((a, b) => a.number - b.number)
                .map((q) => (
                  <div key={q.number}>
                    <h3>문제 {q.number}</h3>
                    <LessonMarkdown text={q.description} />
                    {q.image.startsWith("https://") && (
                      <img
                        className="quiz-image"
                        src={q.image}
                        alt={`문제 ${q.number}`}
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                ))}
              <h3>암호 조합 방법</h3>
              <LessonMarkdown text={quiz.instructions} />
            </section>
          )}
        </>
      )}
    </fieldset>
  );
}
