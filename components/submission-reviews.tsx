"use client";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { submissionDate, type ReviewSubmission } from "@/lib/submission-policy";
export function SubmissionReviews({ items }: { items: ReviewSubmission[] }) {
  const [filter, setFilter] = useState("requested");
  const router = useRouter();
  const visible = items.filter((s) => filter === "all" || s.status === filter);
  return (
    <>
      <div className="submission-actions">
        <label>
          요청 상태{" "}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="requested">
              대기 중 ({items.filter((s) => s.status === "requested").length})
            </option>
            <option value="reviewed">
              답변 완료 ({items.filter((s) => s.status === "reviewed").length})
            </option>
            <option value="all">전체</option>
          </select>
        </label>
        <button onClick={() => router.refresh()}>새로고침</button>
      </div>
      {!visible.length && (
        <p className="panel">해당하는 피드백 요청이 없습니다.</p>
      )}
      {visible.map((s) => (
        <ReviewCard
          key={`${s.projectId}:${s.userId}:${s.revision}`}
          initial={s}
        />
      ))}
    </>
  );
}
function ReviewCard({ initial }: { initial: ReviewSubmission }) {
  const id = useId();
  const [item, setItem] = useState(initial);
  const [feedback, setFeedback] = useState(initial.feedback);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();
  return (
    <section className="panel submission-review">
      <span className="eyebrow">
        WEEK {item.week} ·{" "}
        {item.status === "requested" ? "피드백 대기" : "답변 완료"}
      </span>
      <h2>{item.title}</h2>
      <p>
        {item.name} · {item.email}
        <br />
        <small>요청 {submissionDate(item.requestedAt)}</small>
      </p>
      <p>
        <a
          className="secondary"
          href={`/api/assignments/${item.projectId}/submission?owner=${item.userId}&revision=${item.revision}`}
        >
          {item.filename} 다운로드
        </a>
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(false);
          setMessage("");
          try {
            const response = await fetch(
              `/api/admin/assignments/${item.projectId}/feedback`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: item.userId,
                  revision: item.revision,
                  feedback,
                }),
              },
            );
            const data = await response.json();
            if (!response.ok) throw Error(data.error || "저장하지 못했습니다.");
            setItem((old) => ({ ...old, ...data.submission }));
            setMessage("피드백을 저장했습니다. 학생의 과제 화면에 표시됩니다.");
            router.refresh();
          } catch (e) {
            setError(true);
            setMessage(e instanceof Error ? e.message : "저장하지 못했습니다.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label htmlFor={id}>간단한 피드백</label>
        <textarea
          id={id}
          rows={4}
          maxLength={5000}
          required
          value={feedback}
          disabled={busy}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <button className="primary" disabled={busy || !feedback.trim()}>
          {busy ? "저장 중…" : "피드백 저장"}
        </button>
      </form>
      {message && <p role={error ? "alert" : "status"}>{message}</p>}
    </section>
  );
}
