import { currentActor } from "@/lib/auth/actor";
import { query } from "@/lib/query";
import { dashboardRows } from "@/lib/progress-repository";
import { learningItems } from "@/lib/learning-items";
import { summarizeLearners, learnersCsv } from "@/lib/admin-summary";
import { json } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await currentActor();
    if (!user) return json({ error: "로그인이 필요합니다." }, 401);
    if (!user.isAdmin) return json({ error: "관리자 권한이 필요합니다." }, 403);
    return new Response(
      learnersCsv(
        summarizeLearners(await dashboardRows(query), learningItems()),
      ),
      {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="ml-sig-progress.csv"',
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch {
    return json({ error: "진행 현황을 내보내지 못했습니다." }, 503);
  }
}
