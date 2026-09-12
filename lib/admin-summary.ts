import type { LearningItem } from "./learning-items";
export type Learner = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLoginAt: string;
  lastProgressAt: string | null;
  completedConcepts: number;
  conceptTotal: number;
  percent: number;
  completedWeeks: number;
  weeks: { week: number; done: number; total: number; complete: boolean }[];
  assignments: { Check: number; Apply: number; Explore: number };
};
export function summarizeLearners(
  rows: Record<string, unknown>[],
  items: LearningItem[],
): Learner[] {
  const concepts = items.filter((i) => i.kind === "concept" && i.week > 0);
  const date = (v: unknown) =>
    v instanceof Date ? v.toISOString() : String(v ?? "");
  return rows.map((r) => {
    const progress = (
      r.progress && typeof r.progress === "object" ? r.progress : {}
    ) as Record<string, unknown>;
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const list = concepts.filter((c) => c.week === i + 1),
        done = list.filter((c) => progress[c.id] === true).length;
      return {
        week: i + 1,
        done,
        total: list.length,
        complete: list.length > 0 && done === list.length,
      };
    });
    const completed = concepts.filter((c) => progress[c.id] === true).length;
    const count = (label: string) =>
      items.filter(
        (i) =>
          i.week > 0 &&
          i.kind === "assignment" &&
          i.label === label &&
          progress[i.id] === true,
      ).length;
    return {
      id: String(r.id),
      email: String(r.email),
      name: String(r.name ?? ""),
      createdAt: date(r.created_at),
      lastLoginAt: date(r.last_login_at),
      lastProgressAt: r.last_progress_at ? date(r.last_progress_at) : null,
      completedConcepts: completed,
      conceptTotal: concepts.length,
      percent: concepts.length
        ? Math.round((completed / concepts.length) * 100)
        : 0,
      completedWeeks: weeks.filter((w) => w.complete).length,
      weeks,
      assignments: {
        Check: count("Check"),
        Apply: count("Apply"),
        Explore: count("Explore"),
      },
    };
  });
}
export function csvCell(value: unknown) {
  let s = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
export function learnersCsv(users: Learner[]) {
  const headers = [
    "이름",
    "이메일",
    "개념 완료율 (%)",
    "완료 개념",
    "전체 개념",
    "완료 주차",
    ...Array.from({ length: 8 }, (_, i) => `Week ${i + 1} 완료 개념`),
    "Check (8)",
    "Apply (8)",
    "Explore (8)",
    "최근 로그인",
    "최근 기록 변경",
  ];
  return (
    "\uFEFF" +
    [
      headers,
      ...users.map((u) => [
        u.name,
        u.email,
        u.percent,
        u.completedConcepts,
        u.conceptTotal,
        u.completedWeeks,
        ...u.weeks.map((w) => `${w.done}/${w.total}`),
        u.assignments.Check,
        u.assignments.Apply,
        u.assignments.Explore,
        u.lastLoginAt,
        u.lastProgressAt ?? "",
      ]),
    ]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n")
  );
}
