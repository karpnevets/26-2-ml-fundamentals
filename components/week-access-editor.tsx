"use client";

import { useState, type FormEvent } from "react";
import type { WeekAccessRule } from "@/lib/course-policy";

export function WeekAccessEditor({
  week,
  initial,
  onDirty,
  onBusy,
  onSave,
}: {
  week: number;
  initial: WeekAccessRule;
  onDirty: (dirty: boolean) => void;
  onBusy: (busy: boolean) => void;
  onSave: (rule: WeekAccessRule) => void;
}) {
  const [rule, setRule] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [message, setMessage] = useState("");
  const dirty =
    rule.quizRequired !== saved.quizRequired ||
    rule.prerequisite !== saved.prerequisite;

  function update(next: WeekAccessRule) {
    setRule(next);
    setMessage("");
    onDirty(
      next.quizRequired !== saved.quizRequired ||
        next.prerequisite !== saved.prerequisite,
    );
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty) return;
    onBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/course/${week}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "access", ...rule }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const next = { ...rule, revision: result.revision };
      setRule(next);
      setSaved(next);
      onDirty(false);
      onSave(next);
      setMessage("해금 설정을 저장했습니다.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "저장하지 못했습니다.",
      );
    } finally {
      onBusy(false);
    }
  }

  return (
    <form className="panel" onSubmit={save}>
      <label className="editor-field">
        해금 방식
        <select
          value={rule.quizRequired ? "quiz" : "automatic"}
          onChange={(event) => {
            const quizRequired = event.target.value === "quiz";
            update({
              ...rule,
              quizRequired,
              prerequisite: quizRequired ? week - 1 : saved.prerequisite,
            });
          }}
        >
          <option value="quiz">퀴즈 필요</option>
          <option value="automatic">개념 체크 완료 시 자동 해금</option>
        </select>
      </label>
      {rule.quizRequired ? (
        <p>{week - 1}주차 개념 체크를 완료한 뒤 퀴즈 암호를 입력합니다.</p>
      ) : (
        <label className="editor-field">
          완료해야 할 주차
          <select
            value={rule.prerequisite}
            onChange={(event) =>
              update({ ...rule, prerequisite: Number(event.target.value) })
            }
          >
            {Array.from({ length: week - 1 }, (_, index) => index + 1).map(
              (prerequisite) => (
                <option key={prerequisite} value={prerequisite}>
                  {prerequisite}주차
                </option>
              ),
            )}
          </select>
        </label>
      )}
      <button className="primary" disabled={!dirty}>
        해금 설정 저장
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
