"use client";
import { useState } from "react";
import type { Learner } from "@/lib/admin-summary";
function date(value: string | null) {
  if (!value) return "아직 기록 없음";
  return new Date(value).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "short",
    timeStyle: "short",
  });
}
export function AdminDashboard({ learners }: { learners: Learner[] }) {
  const [search, S] = useState(""),
    [sort, O] = useState("progress");
  const list = learners
    .filter((u) =>
      (u.name + " " + u.email).toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "progress"
        ? a.percent - b.percent
        : sort === "recent"
          ? b.lastLoginAt.localeCompare(a.lastLoginAt)
          : a.name.localeCompare(b.name, "ko"),
    );
  const avg = learners.length
    ? Math.round(learners.reduce((n, u) => n + u.percent, 0) / learners.length)
    : 0;
  return (
    <>
      <div className="admin-metrics">
        <div className="panel">
          <span>전체 학습자</span>
          <strong>{learners.length}명</strong>
        </div>
        <div className="panel">
          <span>평균 개념 완료율</span>
          <strong>{avg}%</strong>
        </div>
        <div className="panel">
          <span>8주 모두 이해 완료</span>
          <strong>
            {learners.filter((u) => u.completedWeeks === 8).length}명
          </strong>
        </div>
      </div>
      <p className="muted">
        완료율은 학습자가 직접 체크한 개념 수를 기준으로 합니다. Week 0과 선택
        과제는 제외하며, 시험 점수나 실제 학습 시간을 뜻하지 않습니다.
      </p>
      <section className="admin-weeks">
        <h2>주차별 이해 완료</h2>
        <div className="admin-week-grid">
          {Array.from({ length: 8 }, (_, i) => {
            const count = learners.filter((u) => u.weeks[i].complete).length;
            return (
              <div className="panel" key={i}>
                <span className="eyebrow">WEEK {i + 1}</span>
                <strong>
                  {count}
                  <small> / {learners.length}명</small>
                </strong>
                <progress
                  aria-label={`Week ${i + 1} 완료 인원`}
                  value={count}
                  max={learners.length || 1}
                />
              </div>
            );
          })}
        </div>
      </section>
      <div className="admin-toolbar">
        <label className="search">
          학습자 검색
          <input
            type="search"
            placeholder="이름 또는 학교 이메일"
            value={search}
            onChange={(e) => S(e.target.value)}
          />
        </label>
        <label>
          정렬
          <select value={sort} onChange={(e) => O(e.target.value)}>
            <option value="progress">완료율 낮은 순</option>
            <option value="recent">최근 로그인 순</option>
            <option value="name">이름순</option>
          </select>
        </label>
        <a className="secondary-button" href="/api/admin/export">
          전체 CSV 내려받기
        </a>
        <a className="secondary-button" href="/admin">
          새로고침
        </a>
      </div>
      <p className="muted">
        {list.length}명 표시 · 과제는 각 단계당 8개 · 시간은 한국 시간
      </p>
      {list.length ? (
        <div className="table-scroll admin-table">
          <table>
            <thead>
              <tr>
                <th>학습자</th>
                <th>개념 완료율</th>
                <th>완료 주차</th>
                {Array.from({ length: 8 }, (_, i) => (
                  <th key={i}>W{i + 1}</th>
                ))}
                <th>Check</th>
                <th>Apply</th>
                <th>Explore</th>
                <th>최근 로그인</th>
                <th>최근 기록 변경</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id}>
                  <th scope="row">
                    {u.name || "이름 없음"}
                    <small>{u.email}</small>
                  </th>
                  <td>
                    <strong>{u.percent}%</strong>
                    <small>
                      {u.completedConcepts}/{u.conceptTotal} 개념
                    </small>
                  </td>
                  <td>{u.completedWeeks}/8</td>
                  {u.weeks.map((w) => (
                    <td
                      key={w.week}
                      className={w.complete ? "completed-cell" : ""}
                    >
                      {w.done}/{w.total}
                      {w.complete ? " ✓" : ""}
                    </td>
                  ))}
                  <td>{u.assignments.Check}/8</td>
                  <td>{u.assignments.Apply}/8</td>
                  <td>{u.assignments.Explore}/8</td>
                  <td>{date(u.lastLoginAt)}</td>
                  <td>{date(u.lastProgressAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="panel">
          <h2>
            {learners.length
              ? "검색 결과가 없습니다."
              : "아직 가입한 학습자가 없습니다."}
          </h2>
          <p>
            {learners.length
              ? "다른 이름이나 이메일로 검색해 보세요."
              : "학교 계정으로 처음 로그인하면 이곳에 나타납니다. 주차 페이지에서 개념을 체크하면 진행 현황이 갱신됩니다."}
          </p>
        </div>
      )}
    </>
  );
}
