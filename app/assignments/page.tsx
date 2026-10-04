import Link from "next/link";
import { LessonMarkdown } from "@/components/markdown";
import { courseAccess } from "@/lib/course";
import { readProjects } from "@/lib/project-repository";
import { query } from "@/lib/query";
import { NotebookSubmission } from "@/components/notebook-submission";
import {
  readOwnSubmissions,
  submissionStorageReady,
} from "@/lib/submission-repository";
export const metadata = { title: "선택 과제" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const { user, completed } = await courseAccess();
  const projects = await readProjects(query, completed, user?.isAdmin);
  const ready = user ? await submissionStorageReady(query) : false;
  const submissions =
    user && ready ? await readOwnSubmissions(query, user.id) : [];
  return (
    <div className="page narrow">
      <header className="subpage-header">
        <span className="eyebrow site-accent">
          BUILD · COMPARE · EXPERIMENT
        </span>
        <h1>선택 과제</h1>
        <p>
          배운 코드를 확장하고, 직접 실험하며 결과를 비교하는 프로젝트입니다.
          해당 주차의 개념 체크를 모두 완료하면 과제 내용을 볼 수 있습니다. 선택
          과제는 다음 주차의 잠금 해제 조건에 포함되지 않습니다.
        </p>
        {user?.isAdmin && (
          <Link className="primary" href="/admin/assignments">
            선택 과제 편집 →
          </Link>
        )}
      </header>
      {!projects.length && (
        <p className="panel">아직 공개된 선택 과제가 없습니다.</p>
      )}
      {projects.map((p) => (
        <section className="panel" key={p.id}>
          <span className="eyebrow">
            WEEK {p.week} 완료 후 ·{" "}
            {p.published ? "선택 프로젝트" : "비공개 초안 · 관리자 미리보기"}
          </span>
          <h2>{p.title}</h2>
          {completed.includes(p.week) ? (
            <>
              <p>{p.summary}</p>
              <details>
                <summary>과제 내용</summary>
                <LessonMarkdown text={p.body} />
              </details>
              {user &&
                p.published &&
                (ready ? (
                  <NotebookSubmission
                    projectId={p.id}
                    ownerId={user.id}
                    initial={
                      submissions.find((s) => s.projectId === p.id) || null
                    }
                  />
                ) : (
                  <p>노트북 제출 기능을 준비 중입니다.</p>
                ))}
            </>
          ) : (
            <p>
              {user ? (
                <Link href={`/week/${p.week}`}>
                  Week {p.week} 학습을 완료하면 열립니다 →
                </Link>
              ) : (
                <Link href="/login?next=/assignments">
                  로그인하여 학습 완료 기록을 확인하세요 →
                </Link>
              )}
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
