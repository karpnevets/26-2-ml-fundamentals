import Link from "next/link";
import { redirect } from "next/navigation";
import { currentActor } from "@/lib/auth/actor";
import { query } from "@/lib/query";
import { readProjects } from "@/lib/project-repository";
import { ProjectEditor } from "@/components/project-editor";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "선택 과제 관리",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const user = await currentActor();
  if (!user) redirect("/login?next=/admin/assignments");
  if (!user.isAdmin)
    return (
      <div className="page">
        <h1>관리자만 접근할 수 있습니다.</h1>
      </div>
    );
  const projects = await readProjects(query, [], true);
  return (
    <div className="page narrow">
      <Link href="/admin">← 관리자</Link>
      <header className="subpage-header">
        <h1>선택 과제 관리</h1>
        <p>
          초안을 편집하고 검토한 뒤 공개하세요. 공개한 과제도 지정한 주차의 개념
          체크를 모두 완료해야 열람할 수 있습니다.
        </p>
      </header>
      {projects.length ? (
        projects.map((project) => (
          <ProjectEditor key={project.id} initial={project} />
        ))
      ) : (
        <p className="panel">등록된 선택 과제가 없습니다.</p>
      )}
    </div>
  );
}
