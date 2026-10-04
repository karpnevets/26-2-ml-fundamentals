"use client";
import { useId, useRef, useState } from "react";
import {
  MAX_NOTEBOOK_BYTES,
  submissionDate,
  submissionStatus,
  type Submission,
} from "@/lib/submission-policy";
export function NotebookSubmission({
  projectId,
  ownerId,
  initial,
}: {
  projectId: string;
  ownerId: string;
  initial: Submission | null;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [submission, setSubmission] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  async function send(upload: boolean) {
    setMessage("");
    setError(false);
    if (
      upload &&
      (!file || !/\.ipynb$/i.test(file.name) || file.size > MAX_NOTEBOOK_BYTES)
    ) {
      setError(true);
      setMessage("3MB 이하의 .ipynb 파일을 선택하세요.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/assignments/${projectId}/submission`, {
        method: upload ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Submission-Owner": ownerId,
          ...(upload
            ? {
                "X-Notebook-Filename": encodeURIComponent(file!.name),
                "X-Submission-Revision": String(submission?.revision || 0),
              }
            : {}),
        },
        body: upload
          ? file
          : JSON.stringify({ revision: submission?.revision }),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "저장하지 못했습니다.");
      setSubmission(data.submission);
      if (upload) {
        setFile(null);
        if (input.current) input.current.value = "";
      }
      setMessage(
        upload
          ? "업로드했습니다. 검토를 원하면 피드백 요청을 눌러 주세요."
          : "피드백을 요청했습니다. 답변은 이곳에서 확인할 수 있습니다.",
      );
    } catch (e) {
      setError(true);
      setMessage(e instanceof Error ? e.message : "저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="notebook-submission">
      <h3>내 노트북</h3>
      <p>.ipynb 파일을 업로드한 뒤 피드백을 요청하세요. 최대 3MB입니다.</p>
      {submission && (
        <div>
          <p>
            <strong>{submissionStatus[submission.status]}</strong>
            <br />
            <a
              href={`/api/assignments/${projectId}/submission?owner=${ownerId}&revision=${submission.revision}`}
            >
              {submission.filename} 다운로드
            </a>
            <br />
            <small>
              업로드 {submissionDate(submission.uploadedAt)}
              {submission.requestedAt &&
                ` · 요청 ${submissionDate(submission.requestedAt)}`}
            </small>
          </p>
          {submission.status === "reviewed" && (
            <div className="submission-feedback">
              <strong>관리자 피드백</strong>
              <p>{submission.feedback}</p>
              <small>{submissionDate(submission.reviewedAt)}</small>
            </div>
          )}
          <p className="muted">
            새 파일을 업로드하면 기존 파일·요청·피드백이 교체됩니다.
          </p>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(true);
        }}
      >
        <label htmlFor={id}>노트북 파일</label>
        <input
          ref={input}
          id={id}
          type="file"
          accept=".ipynb"
          disabled={busy}
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setMessage("");
          }}
        />
        <div className="submission-actions">
          <button type="submit" className="secondary" disabled={busy || !file}>
            {busy ? "처리 중…" : submission ? "파일 교체" : "업로드"}
          </button>
          <button
            type="button"
            className="primary"
            disabled={
              busy || !!file || !submission || submission.status !== "draft"
            }
            onClick={() => void send(false)}
          >
            피드백 요청
          </button>
        </div>
        {file && (
          <p className="muted">
            선택한 파일을 업로드한 뒤 피드백을 요청할 수 있습니다.
          </p>
        )}
      </form>
      {message && <p role={error ? "alert" : "status"}>{message}</p>}
    </div>
  );
}
