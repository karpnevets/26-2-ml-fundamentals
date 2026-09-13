import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { currentActor } from "@/lib/auth/actor";
import { lessons } from "@/lib/content";
import { query } from "@/lib/query";
import { quizTemplate } from "@/lib/quiz-templates";
import { CourseEditor } from "@/components/course-editor";
import type { QuizQuestion } from "@/lib/course-policy";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "회차 편집",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const user = await currentActor();
  if (!user) redirect(`/login?next=/admin/course/${id}`);
  if (!user.isAdmin)
    return (
      <div className="page">
        <h1>관리자만 접근할 수 있습니다.</h1>
      </div>
    );
  const lesson = lessons().find((w) => String(w.week) === id);
  if (!lesson) notFound();
  const [edit] = await query(
    "SELECT body,revision FROM lesson_edits WHERE week=$1",
    [lesson.week],
  );
  const [quiz] = await query(
    "SELECT questions,instructions,published,revision,password_hash <> $2 AS has_password FROM week_quizzes WHERE week=$1",
    [lesson.week, ""],
  );
  const initialQuiz = quiz
    ? {
        questions: quiz.questions as QuizQuestion[],
        instructions: String(quiz.instructions),
        published: Boolean(quiz.published),
        revision: Number(quiz.revision),
      }
    : quizTemplate(lesson.week);
  return (
    <div className="page editor-page">
      <Link href="/admin/course">← 회차 관리</Link>
      <h1>
        Week {lesson.week} · {lesson.title}
      </h1>
      <CourseEditor
        week={lesson.week}
        original={lesson.body}
        initialBody={String(edit?.body ?? lesson.body)}
        bodyRevision={Number(edit?.revision ?? 0)}
        initialQuiz={initialQuiz}
        hasPassword={Boolean(quiz?.has_password)}
      />
    </div>
  );
}
