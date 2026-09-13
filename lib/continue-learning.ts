export function nextLearning(
  weeks: { week: number; concepts: string[] }[],
  values: Record<string, boolean>,
) {
  for (let week = 1; week <= 8; week++) {
    const lesson = weeks.find((w) => w.week === week);
    if (!lesson) return { href: `/week/${week}`, label: `${week}주차 열기` };
    const done = lesson.concepts.filter((c) => values[`w${week}:${c}`]).length;
    if (done < lesson.concepts.length)
      return {
        href: `/week/${week}`,
        label: done ? `${week}주차 이어서 학습` : `${week}주차 시작하기`,
      };
  }
  return { href: "/final-project", label: "최종 프로젝트 시작하기" };
}
