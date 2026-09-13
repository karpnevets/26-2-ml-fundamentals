import Link from "next/link";
import { lessons } from "@/lib/content";
import { OverallProgress, WeekStatus } from "@/components/progress";
import { courseAccess } from "@/lib/course";
import { WeekLock } from "@/components/week-lock";
export const dynamic = "force-dynamic";
export default async function Home() {
  const { weeks } = await courseAccess();
  const all = lessons();
  return (
    <div className="page home">
      <div className="course-meta">
        <span className="eyebrow">SCSC / MACHINE LEARNING SIG</span>
        <span>선택 0주차 + 본 과정 8주</span>
      </div>
      <section className="hero">
        <div>
          <p className="eyebrow accent">FROM YOUR FIRST MODEL TO RESNET</p>
          <h1>
            머신러닝,
            <br />
            하나의 질문에서
            <br />
            <span>시작합니다.</span>
          </h1>
          <p className="hero-description">
            모델은 무엇을 학습할까? 왜 CNN이 필요할까?
            <br />
            작은 질문을 하나씩 연결하며, ResNet의 구조를
            <br className="desktop" /> 자신의 말로 설명할 수 있을 때까지.
          </p>
          <Link className="primary" href="/week/1">
            1주차 시작하기 <span>↗</span>
          </Link>
          <span className="hero-caption">비전공자 환영 · 기초부터 함께</span>
        </div>
        <div className="hero-aside">
          <div className="journey" aria-label="학습의 흐름">
            <div>
              <span>01 — 질문</span>
              <strong>모델은 무엇을 학습할까?</strong>
            </div>
            <i>↓</i>
            <div>
              <span>02 — 탐구</span>
              <strong>직관 → 실험 → 수식</strong>
            </div>
            <i>↓</i>
            <div>
              <span>03 — 이해</span>
              <strong>이제, ResNet을 읽다.</strong>
            </div>
          </div>
          <OverallProgress
            weeks={all
              .filter((w) => weeks.includes(w.week))
              .map(({ week, concepts }) => ({ week, concepts }))}
          />
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
            <h3>Python / Colab Survival Kit</h3>
            <p>
              코드를 읽는 데 필요한 만큼만. Python이 처음이라면 여기서
              출발하세요.
            </p>
          </div>
          <span>30–60 min ↗</span>
        </Link>
        <div className="roadmap">
          {all.slice(1).map((w, i) =>
            !weeks.includes(w.week) ? (
              <WeekLock key={w.week} week={w.week} />
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
                  <WeekStatus week={w.week} concepts={w.concepts} />
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
            하나로 시작하고, 여러 feature가 필요해지는 3주차에 vector를
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
            Check, Apply, Explore는 모두 선택 과제입니다. 이해한 개념을 체크하면
            주차 진행도가 기록됩니다. Explore를 하지 않아도 다음 주로 넘어갈 수
            있습니다.
          </p>
        </details>
      </section>
    </div>
  );
}
