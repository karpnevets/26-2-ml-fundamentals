import Link from "next/link";
import { redirect } from "next/navigation";
import { currentActor } from "@/lib/auth/actor";
import { query } from "@/lib/query";
import {
  readReviewQueue,
  submissionStorageReady,
} from "@/lib/submission-repository";
import { SubmissionReviews } from "@/components/submission-reviews";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "선택 과제 피드백",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const user = await currentActor();
  if (!user) redirect("/login?next=/admin/submissions");
  if (!user.isAdmin)
    return (
      <div className="page narrow">
        <h1>관리자만 접근할 수 있습니다.</h1>
      </div>
    );
  const ready = await submissionStorageReady(query);
  return (
    <div className="page narrow">
      <Link href="/admin">← 관리자</Link>
      <header className="subpage-header">
        <h1>선택 과제 피드백</h1>
        <p>
          학생이 피드백을 요청한 노트북을 내려받아 확인하고 짧은 답변을
          남기세요.
        </p>
      </header>
      {ready ? (
        <SubmissionReviews items={await readReviewQueue(query)} />
      ) : (
        <p className="panel">
          제출 기능 준비 중입니다. Neon SQL Editor에서
          db/migrations/008_project_submissions.sql을 실행하세요.
        </p>
      )}
    </div>
  );
}
