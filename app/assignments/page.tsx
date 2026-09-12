import { Assignments } from "@/components/assignments";
import Link from "next/link";
import { lessons, sections } from "@/lib/content";
import { LessonMarkdown } from "@/components/markdown";
import { ProgressCheck } from "@/components/progress";
export const metadata = { title: "선택 과제" };
export default function Page() {
  return (
    <div className="page narrow">
      <header className="subpage-header">
        <span className="eyebrow accent">MAKE IT YOUR OWN</span>
        <h1>선택 과제</h1>
        <p>
          Check로 확인하고, Apply로 써 보고, Explore로 더 깊이.
          <br />
          모든 과제는 선택입니다. 정답뿐 아니라 이유를 자신의 말로 적어 보세요.
        </p>
      </header>
      {lessons().map((w) => {
        const s = sections(w.body).find((s) => s.title === "선택 과제");
        return (
          <section className="assignment-week" key={w.week}>
            <h2>
              <Link href={`/week/${w.week}`}>
                Week {w.week} · {w.title} ↗
              </Link>
            </h2>
            {s && <Assignments body={s.body} week={w.week} collapsible />}
          </section>
        );
      })}
    </div>
  );
}
