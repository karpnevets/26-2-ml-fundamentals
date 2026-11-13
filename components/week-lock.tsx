"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { WeekAccessRule } from "@/lib/course-policy";
export function WeekLock({
  week,
  canUnlock = false,
  rule,
}: {
  week: number;
  canUnlock?: boolean;
  rule?: WeekAccessRule;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  const needsQuiz = rule?.quizRequired ?? true;
  const prerequisite = rule?.prerequisite ?? week - 1;
  return (
    <>
      <button
        className="roadmap-card locked-week"
        onClick={() => {
          setError("");
          setPassword("");
          dialog.current?.showModal();
        }}
        aria-label={`${week}주차 잠금 해제`}
      >
        <span className="eyebrow">WEEK {String(week).padStart(2, "0")}</span>
        <svg
          width="42"
          height="48"
          viewBox="0 0 42 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <rect x="5" y="21" width="32" height="24" rx="5" />
          <path d="M12 21V13a9 9 0 0 1 18 0v8" />
          <circle cx="21" cy="32" r="2" />
          <path d="M21 34v5" />
        </svg>
        <strong>잠긴 주차</strong>
        <span>
          {!needsQuiz
            ? `${prerequisite}주차 학습을 완료하면 자동으로 열립니다`
            : canUnlock
              ? "암호를 맞추면 열립니다"
              : `${prerequisite}주차 학습 완료 후 열 수 있습니다`}
        </span>
      </button>
      <dialog
        ref={dialog}
        className="unlock-dialog"
        aria-labelledby={`unlock-title-${week}`}
        onClick={(e) => {
          if (e.target === dialog.current && !busy) dialog.current.close();
        }}
      >
        <button
          className="dialog-close"
          aria-label="닫기"
          onClick={() => dialog.current?.close()}
        >
          ×
        </button>
        <h2 id={`unlock-title-${week}`}>{week}주차 잠금 해제</h2>
        <p>
          {!needsQuiz
            ? `학교 계정으로 로그인하고 ${prerequisite}주차의 개념 체크를 모두 완료하면 자동으로 열립니다.`
            : canUnlock
              ? "직전 주차의 퀴즈를 풀어 암호를 완성하세요."
              : `Week ${prerequisite}의 개념 체크를 모두 완료하면 암호를 입력할 수 있습니다.`}
        </p>
        {(!needsQuiz || !canUnlock) && (
          <Link
            className="primary"
            href={`/week/${prerequisite}`}
            onClick={() => dialog.current?.close()}
          >
            {prerequisite}주차 학습하기 →
          </Link>
        )}
        {needsQuiz && canUnlock && (
          <>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError("");
                try {
                  const res = await fetch(`/api/weeks/${week}/unlock`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw Error(data.error);
                  dialog.current?.close();
                  router.push(`/week/${week}`);
                  router.refresh();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "잠금 해제 실패");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label>
                암호
                <input
                  autoFocus
                  type="text"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={password}
                  maxLength={200}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <button className="primary" disabled={busy}>
                {busy ? "확인 중…" : "열기"}
              </button>
            </form>
            {error && (
              <p role="alert" className="auth-error">
                {error}
              </p>
            )}
            <Link
              className="secondary"
              href={`/quiz/${week}`}
              onClick={() => dialog.current?.close()}
            >
              힌트 · 퀴즈 보기 →
            </Link>
          </>
        )}
        <Link href={`/login?next=/week/${week}`}>학교 계정 로그인</Link>
      </dialog>
    </>
  );
}
