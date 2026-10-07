"use client";
import { useRef, useState } from "react";
import {
  MAX_CONCEPTS,
  MAX_CONCEPT_LABEL,
  validateConceptDraft,
  type Concept,
} from "@/lib/concepts";

type Row = { key: string; id: string | null; label: string };
export function ConceptEditor({
  week,
  initial,
  initialRevision,
  onDirty,
  onBusy,
}: {
  week: number;
  initial: Concept[];
  initialRevision: number;
  onDirty: (dirty: boolean) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [rows, setRows] = useState<Row[]>(
    initial.map((c) => ({ ...c, key: c.id })),
  );
  const [revision, setRevision] = useState(initialRevision);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const nextKey = useRef(0);
  const saving = useRef(false);
  function update(next: Row[]) {
    setRows(next);
    setDirty(true);
    onDirty(true);
    setMessage("");
  }
  function move(index: number, offset: number) {
    const next = [...rows];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    update(next);
  }
  async function save() {
    if (saving.current) return;
    const concepts = rows.map(({ id, label }) => ({ id, label }));
    const existing = rows.flatMap((c) =>
      c.id ? [{ id: c.id, label: c.label }] : [],
    );
    const draft = validateConceptDraft({ revision, concepts }, existing);
    if (!draft) {
      setMessage("개념은 1–60개, 이름은 중복 없이 1–100자로 입력하세요.");
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
        body: JSON.stringify({ kind: "concepts", ...draft }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "개념 목록을 저장하지 못했습니다.");
      setRevision(data.revision);
      setRows((data.concepts as Concept[]).map((c) => ({ ...c, key: c.id })));
      setDirty(false);
      onDirty(false);
      setMessage(
        "개념 목록을 저장했습니다. 학생 페이지를 새로고침하면 반영됩니다.",
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
    <fieldset className="editor-form concept-editor" disabled={busy}>
      <h2>개념 체크 목록</h2>
      <p>
        학생 페이지의 ‘내 말로 설명할 수 있나요?’에 표시할 개념을 편집합니다.
        이름과 순서를 바꿔도 기존 체크 기록은 유지됩니다.
      </p>
      <p>
        추가한 개념은 미완료로 시작하고, 삭제한 개념은 완료 조건에서 제외됩니다.
        저장 후 주차 완료율과 다음 주차 잠금 해제 조건에도 반영됩니다.
      </p>
      <div className="concept-editor-list">
        {rows.map((row, i) => (
          <div className="concept-editor-row" key={row.key}>
            <label className="concept-name">
              <span>개념 {i + 1}</span>
              <input
                value={row.label}
                maxLength={MAX_CONCEPT_LABEL}
                onChange={(e) =>
                  update(
                    rows.map((c, j) =>
                      j === i ? { ...c, label: e.target.value } : c,
                    ),
                  )
                }
              />
            </label>
            <div className="concept-row-actions">
              <button
                type="button"
                aria-label={`개념 ${i + 1} 위로`}
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`개념 ${i + 1} 아래로`}
                disabled={i === rows.length - 1}
                onClick={() => move(i, 1)}
              >
                ↓
              </button>
              <button
                type="button"
                aria-label={`개념 ${i + 1} 삭제`}
                disabled={rows.length === 1}
                onClick={() => update(rows.filter((_, j) => j !== i))}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="editor-toolbar">
        <button
          type="button"
          disabled={rows.length >= MAX_CONCEPTS}
          onClick={() =>
            update([
              ...rows,
              { key: `new-${nextKey.current++}`, id: null, label: "" },
            ])
          }
        >
          개념 추가
        </button>
        <button
          type="button"
          className="primary"
          disabled={!dirty || busy}
          onClick={() => void save()}
        >
          {busy ? "저장 중…" : "개념 목록 저장"}
        </button>
      </div>
      <p className="concept-editor-message" role="status" aria-live="polite">
        {message || (dirty ? "저장하지 않은 개념 변경사항이 있습니다." : "")}
      </p>
    </fieldset>
  );
}
