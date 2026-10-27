import type { LessonIntro } from "@/lib/lesson-intro";
import { WhyBox } from "./markdown";
import { TermChip } from "./interactive";

export function LessonIntroPreview({ intro }: { intro: LessonIntro }) {
  return (
    <>
      <WhyBox>{intro.why}</WhyBox>
      <p className="connection">
        <strong>이전 개념과 연결 · </strong>
        {intro.previous}
      </p>
      <p className="connection">
        <strong>이번 주에 필요한 것 · </strong>
        {intro.prerequisite}
      </p>
      <div className="term-row">
        {intro.terms.map((term, i) => (
          <TermChip key={i} {...term} />
        ))}
      </div>
    </>
  );
}
