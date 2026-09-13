import Link from "next/link";
import { notFound } from "next/navigation";
import { courseAccess } from "@/lib/course";
import { query } from "@/lib/query";
import {
  validWeek,
  publicQuestions,
  type QuizQuestion,
} from "@/lib/course-policy";
import { WeekLock } from "@/components/week-lock";
import { LessonMarkdown } from "@/components/markdown";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "잠금 해제 퀴즈",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const week = Number((await params).id);
  if (!validWeek(week, 2)) notFound();
  const { user, weeks } = await courseAccess();
  if (!user)
    return (
      <div className="page narrow">
        <h1>{week}주차 힌트</h1>
        <p>
          학교 계정으로 로그인하면 퀴즈를 풀고 해제 기록을 저장할 수 있습니다.
        </p>
        <Link className="primary" href={`/login?next=/quiz/${week}`}>
          로그인
        </Link>
      </div>
    );
  if (!weeks.includes(week - 1))
    return (
      <div className="page narrow">
        <h1>직전 주차를 먼저 열어 주세요.</h1>
        <Link href={`/week/${week - 1}`}>{week - 1}주차로 이동</Link>
      </div>
    );
  const [quiz] = await query(
    "SELECT questions,instructions FROM week_quizzes WHERE to_jsonb(week_quizzes)->>'content_revision'='revised-v2' AND week=$1 AND published=true",
    [week],
  );
  return (
    <div className="page narrow">
      <header className="subpage-header">
        <span className="eyebrow">WEEK {week - 1} REVIEW</span>
        <h1>{week}주차를 여는 퀴즈</h1>
        <p>{week - 1}주차 내용을 바탕으로 암호를 찾아보세요.</p>
        <Link href={`/week/${week - 1}`}>직전 주차 복습 →</Link>
      </header>
      {!quiz ? (
        <p className="panel">퀴즈를 준비 중입니다. 운영자에게 문의하세요.</p>
      ) : (
        <>
          {publicQuestions(quiz.questions as QuizQuestion[])
            .sort((a, b) => a.number - b.number)
            .map((q) => (
              <section className="panel quiz-question" key={q.number}>
                <h2>문제 {q.number}</h2>
                <LessonMarkdown text={q.description} />
                {q.image && (
                  <img
                    src={q.image}
                    alt={`문제 ${q.number} 참고 이미지`}
                    referrerPolicy="no-referrer"
                    className="quiz-image"
                  />
                )}
              </section>
            ))}
          <section className="panel">
            <h2>암호 조합 방법</h2>
            <LessonMarkdown text={String(quiz.instructions)} />
          </section>
          {weeks.includes(week) ? (
            <Link className="primary" href={`/week/${week}`}>
              열린 주차로 이동 →
            </Link>
          ) : (
            <WeekLock week={week} />
          )}
        </>
      )}
    </div>
  );
}
