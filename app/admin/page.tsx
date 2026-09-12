import Link from "next/link";
import { redirect } from "next/navigation";
import { currentActor } from "@/lib/auth/actor";
import { authConfigured } from "@/lib/auth/config";
import { query } from "@/lib/query";
import { learningItems } from "@/lib/learning-items";
import { dashboardRows } from "@/lib/progress-repository";
import { summarizeLearners } from "@/lib/admin-summary";
import { AdminDashboard } from "@/components/admin-dashboard";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "학습 진행 현황",
  robots: { index: false, follow: false },
};
export default async function Page() {
  if (!authConfigured())
    return (
      <div className="page narrow subpage-header">
        <h1>진행 현황 연결 준비</h1>
        <p>
          Google 로그인과 Neon 연결을 설정한 뒤, 관리자 학교 이메일을
          ADMIN_EMAILS에 등록하세요.
        </p>
        <p>설정 순서는 프로젝트의 docs/DEPLOYMENT.md에 정리되어 있습니다.</p>
        <Link href="/">강의로 돌아가기</Link>
      </div>
    );
  let user;
  try {
    user = await currentActor();
  } catch {
    return <Unavailable />;
  }
  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin)
    return (
      <div className="page narrow subpage-header">
        <h1>관리자만 볼 수 있는 페이지입니다.</h1>
        <p>다른 학습자의 기록은 운영자에게만 공개됩니다.</p>
        <Link href="/">내 학습으로 돌아가기</Link>
      </div>
    );
  try {
    const learners = summarizeLearners(
      await dashboardRows(query),
      learningItems(),
    );
    return (
      <div className="page admin-page">
        <header className="subpage-header">
          <span className="eyebrow accent">SIG · ADMIN</span>
          <h1>학습 진행 현황</h1>
          <p>어디까지 이해했는지, 어느 주차에서 도움이 필요한지 살펴보세요.</p>
        </header>
        <AdminDashboard learners={learners} />
      </div>
    );
  } catch {
    return <Unavailable />;
  }
}
function Unavailable() {
  return (
    <div className="page narrow subpage-header">
      <h1>진행 현황을 불러오지 못했습니다.</h1>
      <p>
        잠시 후 다시 시도해 주세요. 처음 연결했다면 Neon의 테이블 생성 여부를
        확인하세요.
      </p>
      <a className="primary" href="/admin">
        다시 불러오기
      </a>
    </div>
  );
}
