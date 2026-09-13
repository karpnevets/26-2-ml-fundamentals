import { document } from "@/lib/content";
import { LessonMarkdown } from "@/components/markdown";
import { ResNetRecap } from "@/components/resnet-recap";
export const metadata = { title: "최종 프로젝트" };
import { courseAccess } from "@/lib/course";
import { WeekLock } from "@/components/week-lock";
export const dynamic = "force-dynamic";
export default async function Page() {
  const { weeks } = await courseAccess();
  if (!weeks.includes(8))
    return (
      <div className="page narrow">
        <h1>최종 프로젝트</h1>
        <p>8주차 잠금을 해제한 뒤 볼 수 있습니다.</p>
        <WeekLock week={8} />
      </div>
    );
  return (
    <div className="page narrow">
      <header className="subpage-header">
        <span className="eyebrow accent">BEYOND WEEK 8 · OPTIONAL</span>
        <h1>배운 것을 하나로 연결하기</h1>
        <p>
          높은 정확도보다, 모델의 차이가 왜 다른 결과를 만드는지 설명하는 데
          집중하세요.
        </p>
      </header>
      <LessonMarkdown text={document("final-project").replace(/^# .+\n/, "")} />
      <ResNetRecap />
    </div>
  );
}
