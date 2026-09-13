import lessonContext from "@/content/lesson-context.json";
import { Assignments } from "@/components/assignments";
import { TableOfContents } from "@/components/table-of-contents";
import Link from "next/link";
import { notFound } from "next/navigation";
import { lessons, sections } from "@/lib/content";
import { LessonMarkdown, WhyBox } from "@/components/markdown";
import { TermChip } from "@/components/interactive";
import { ProgressCheck, WeekStatus } from "@/components/progress";
import { WeekPlayground } from "@/components/playgrounds";
import { ResNetRecap } from "@/components/resnet-recap";
import { courseAccess, editedLessons } from "@/lib/course";
import { WeekLock } from "@/components/week-lock";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { weeks } = await courseAccess();
  return {
    title:
      (weeks.includes(Number(id))
        ? lessons().find((w) => String(w.week) === id)?.title
        : `Week ${id} · 잠긴 주차`) || "강의를 찾을 수 없습니다",
  };
}
export default async function Week({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { weeks } = await courseAccess();
  if (!lessons().some((w) => String(w.week) === id)) notFound();
  if (!weeks.includes(Number(id)))
    return (
      <div className="page narrow">
        <h1>Week {id}</h1>
        <p>직전 주차의 퀴즈로 암호를 찾아 잠금을 해제하세요.</p>
        <WeekLock week={Number(id)} />
      </div>
    );
  const all = await editedLessons();
  const w = all.find((w) => String(w.week) === id);
  if (!w) notFound();
  const parts = sections(w.body).filter(
    (s) => weeks.includes(w.week + 1) || !s.title.includes("Preview"),
  );
  return (
    <div className="page">
      <div className="breadcrumbs">
        <Link href="/">커리큘럼</Link>
        <span>/</span>
        <span>Week {w.week}</span>
      </div>
      <header className="lesson-header">
        <span className="eyebrow site-accent">
          WEEK {String(w.week).padStart(2, "0")}{" "}
          {w.week === 0 ? "· OPTIONAL" : "/ 08"}
        </span>
        <h1>{w.title}</h1>
        <p className="main-question">{w.question}</p>
        <div className="lesson-meta">
          <span>{w.estimated_time}</span>
          <WeekStatus week={w.week} concepts={w.concepts} />
        </div>
      </header>
      <div className="lesson-layout">
        <TableOfContents
          sections={parts
            .filter((s) => s.title)
            .map(({ id, title }) => ({ id, title }))}
        />
        <article className="lesson-content">
          <section id="why">
            <WhyBox>{lessonContext[w.week].why}</WhyBox>
            <p className="connection">
              <strong>이전 개념과 연결 · </strong>
              {lessonContext[w.week].previous}
            </p>
            <p className="connection">
              <strong>이번 주에 필요한 것 · </strong>
              {lessonContext[w.week].prerequisite}
            </p>
            <div className="term-row">
              {w.concepts.map((c) => (
                <TermChip key={c} term={c} />
              ))}
            </div>
          </section>
          <div id="experiment">
            {!w.body.includes("```visualization") && (
              <WeekPlayground week={w.week} />
            )}
            {(w.week === 0 || w.week === 6) && (
              <p className="muted">
                아래의 짧은 코드 예제부터 읽어 보세요. 각 줄을 자신의 말로
                설명하는 것이 목표입니다.
              </p>
            )}
          </div>
          {parts.map((s) => (
            <section
              className={
                "lesson-section " +
                (s.title.includes("Checkpoint")
                  ? "checkpoint"
                  : s.title.includes("요약")
                    ? "summary-section"
                    : s.title.includes("Preview")
                      ? "next-week"
                      : "")
              }
              id={s.id}
              key={s.id}
            >
              {s.title && <h2>{s.title}</h2>}
              {s.title.includes("선택 과제") ? (
                <Assignments body={s.body} week={w.week} />
              ) : s.title.includes("선택 개념") ||
                s.title.includes("언급만") ? (
                <details>
                  <summary>선택 심화 읽기</summary>
                  <LessonMarkdown text={s.body} />
                </details>
              ) : (
                <LessonMarkdown text={s.body} />
              )}
            </section>
          ))}
          {w.week === 8 && <ResNetRecap />}
          <section className="panel" id="progress">
            <span className="eyebrow">MY UNDERSTANDING</span>
            <h2>내 말로 설명할 수 있나요?</h2>
            <p>
              이해한 개념을 체크하세요. 선택 과제는 주차 완료 조건이 아닙니다.
            </p>
            <div className="checks">
              {w.concepts.map((c) => (
                <ProgressCheck id={`w${w.week}:${c}`} label={c} key={c} />
              ))}
            </div>
          </section>
          <div className="week-navigation">
            {w.week > 0 ? (
              <Link href={`/week/${w.week - 1}`}>
                ← Week {w.week - 1}
                <strong>{all[w.week - 1].title}</strong>
              </Link>
            ) : (
              <Link href="/">← 전체 커리큘럼</Link>
            )}
            {w.week < 8 ? (
              <Link href={`/week/${w.week + 1}`}>
                Week {w.week + 1} →
                <strong>
                  {weeks.includes(w.week + 1)
                    ? all[w.week + 1].title
                    : "🔒 잠긴 주차"}
                </strong>
              </Link>
            ) : (
              <Link href="/final-project">
                다음 도전 →<strong>선택 최종 프로젝트</strong>
              </Link>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
