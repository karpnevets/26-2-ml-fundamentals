import fs from "node:fs";
import { neon } from "@neondatabase/serverless";
import { catalog, seedSql } from "./db-catalog.mjs";
if (fs.existsSync(".env.local")) process.loadEnvFile(".env.local");
try {
  if (!process.env.DATABASE_URL) throw Error();
  const drafts = JSON.parse(
    fs.readFileSync(".private-course/optional-projects.json", "utf8"),
  );
  if (
    !Array.isArray(drafts) ||
    drafts.length !== 6 ||
    drafts.some((p) => p.published !== false)
  )
    throw Error();
  const sql = neon(process.env.DATABASE_URL);
  const migration = fs.readFileSync(
    "db/migrations/007_optional_projects.sql",
    "utf8",
  );
  await sql.transaction([
    sql.query(migration),
    sql.query(seedSql, [JSON.stringify(catalog())]),
    sql.query(
      `INSERT INTO optional_projects(id,week,title,summary,body,published)
      SELECT id,week,title,summary,body,false FROM jsonb_to_recordset($1::jsonb)
      AS p(id text,week smallint,title text,summary text,body text)
      ON CONFLICT(id) DO NOTHING`,
      [JSON.stringify(drafts)],
    ),
  ]);
  const rows = await sql.query(
    "SELECT id,published FROM optional_projects WHERE id IN (SELECT jsonb_array_elements_text($1::jsonb))",
    [JSON.stringify(drafts.map((p) => p.id))],
  );
  console.log(
    `선택 과제 ${rows.length}개 확인. 신규 과제는 비공개로 등록했고, 기존 편집·공개 상태는 보존했습니다.`,
  );
} catch {
  console.error(
    "등록 실패: DATABASE_URL, 비공개 초안 파일, DB 연결·권한을 확인하세요. 비밀값은 출력하지 않았습니다.",
  );
  process.exitCode = 1;
}
