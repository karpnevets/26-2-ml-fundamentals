import Link from "next/link";
import {
  OverallProgress,
  WeekStatus,
  ContinueLearning,
} from "@/components/progress";
import { courseAccess, courseCatalog } from "@/lib/course";
import { WeekLock } from "@/components/week-lock";
export const dynamic = "force-dynamic";
export default async function Home() {
  const { weeks, completed } = await courseAccess();
  const all = await courseCatalog();
  return (
    <div className="page home">
      <div className="course-meta">
        <span className="eyebrow">SCSC / MACHINE LEARNING SIG</span>
        <span>선택 0주차 + 본 과정 8주</span>
      </div>
      <section className="hero">
        <div>
          <p className="eyebrow site-accent">FROM YOUR FIRST MODEL TO RESNET</p>
          <h1>
            ML 기초
            <br />
            <span>커리큘럼</span>
          </h1>
          <p className="hero-description">26-2 SCSC ML Fundamentals</p>
        </div>
        <div className="hero-aside">
          <OverallProgress
            weeks={all
              .filter((w) => weeks.includes(w.week))
              .map(({ week, concepts, conceptIds }) => ({
                week,
                concepts,
                conceptIds,
              }))}
          />
          <ContinueLearning
            weeks={all
              .filter((w) => weeks.includes(w.week))
              .map(({ week, concepts, conceptIds }) => ({
                week,
                concepts,
                conceptIds,
              }))}
          />
          <span className="hero-caption">비전공자 환영 · 기초부터 함께</span>
        </div>
      </section>
      <section className="curriculum" id="curriculum">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE LEARNING PATH</span>
            <h2>8주, 하나로 이어지는 이야기</h2>
          </div>
          <p>매주 하나의 질문. 다음 질문으로 이어지는 이해.</p>
        </div>
        <Link className="optional" href="/week/0">
          <span className="week-number">00</span>
          <div>
            <span className="badge">선택 · 준비 운동</span>
            <h3>{all[0].title}</h3>
            <p>
              코드를 읽는 데 필요한 만큼만. Python이 처음이라면 여기서
              출발하세요.
            </p>
          </div>
          <span>{all[0].estimated_time} ↗</span>
        </Link>
        <div className="roadmap">
          {all.slice(1).map((w, i) =>
            !weeks.includes(w.week) ? (
              <WeekLock
                key={w.week}
                week={w.week}
                canUnlock={completed.includes(w.week - 1)}
              />
            ) : (
              <Link
                className="roadmap-card"
                href={`/week/${w.week}`}
                key={w.week}
              >
                <div className="card-top">
                  <span className="eyebrow">
                    WEEK {String(w.week).padStart(2, "0")}
                  </span>
                  <WeekStatus
                    week={w.week}
                    concepts={w.concepts}
                    conceptIds={w.conceptIds}
                  />
                </div>
                <span className="path-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{w.title}</h3>
                <p>{w.question}</p>
                <div className="concept-labels">
                  {w.concepts.slice(0, 4).map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
                <div className="card-bottom">
                  <span>{w.estimated_time} · 기초부터</span>
                  <span aria-hidden>↗</span>
                </div>
              </Link>
            ),
          )}
        </div>
      </section>
      <section className="faq">
        <h2>시작하기 전에</h2>
        <details>
          <summary>수학이나 선형대수를 몰라도 괜찮나요?</summary>
          <p>
            네. 필요한 수학은 문제가 생기는 순간에 소개합니다. 1주차에는 숫자
            하나로 시작하고, 여러 feature가 필요해지는 2주차에 vector를
            만납니다.
          </p>
        </details>
        <details>
          <summary>Python이 처음인데 따라갈 수 있나요?</summary>
          <p>
            선택 0주차에서 변수, 반복문, 함수, NumPy shape를 먼저 살펴보세요.
            코드의 각 줄이 어떤 개념인지 이해하는 것을 우선합니다.
          </p>
        </details>
        <details>
          <summary>모든 과제를 해야 하나요?</summary>
          <p>
            본문 연습문제와 선택 프로젝트는 필수가 아닙니다. 해당 주차의 개념
            체크를 모두 완료하면 다음 주차의 암호를 입력할 수 있습니다. Week 0은
            선택 준비 과정입니다.
          </p>
        </details>
      </section>
    </div>
  );
}
