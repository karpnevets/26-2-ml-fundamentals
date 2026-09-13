import Link from "next/link";
import { redirect } from "next/navigation";
import { currentActor } from "@/lib/auth/actor";
import { lessons } from "@/lib/content";
import { query } from "@/lib/query";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "퀴즈 · 본문 관리",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const user = await currentActor();
  if (!user) redirect("/login?next=/admin/course");
  if (!user.isAdmin)
    return (
      <div className="page">
        <h1>관리자만 접근할 수 있습니다.</h1>
      </div>
    );
  const quizzes = await query("SELECT week,published FROM week_quizzes");
  const edits = await query("SELECT week,updated_at FROM lesson_edits");
  return (
    <div className="page narrow">
      <Link href="/admin">← 학습 현황</Link>
      <header className="subpage-header">
        <h1>회차별 퀴즈 · 본문 관리</h1>
        <p>
          2–8주차는 직전 주차 복습 퀴즈로 엽니다. 퀴즈 초안을 검토하고 실제
          암호를 설정한 뒤 공개하세요.
        </p>
      </header>
      {lessons().map((w) => (
        <section className="panel" key={w.week}>
          <h2>
            Week {w.week} · {w.title}
          </h2>
          <p>
            {w.week < 2
              ? "잠금 없음"
              : quizzes.find((q) => Number(q.week) === w.week)?.published
                ? "퀴즈 공개 중"
                : "퀴즈 비공개 · 학생 잠금 유지"}{" "}
            ·{" "}
            {edits.some((e) => Number(e.week) === w.week)
              ? "편집한 본문 사용"
              : "원본 본문 사용"}
          </p>
          <Link className="primary" href={`/admin/course/${w.week}`}>
            편집 →
          </Link>
        </section>
      ))}
    </div>
  );
}
