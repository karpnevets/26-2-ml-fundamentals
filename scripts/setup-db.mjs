import fs from "node:fs";
import { neon } from "@neondatabase/serverless";
import { catalog, schema, seedSql } from "./db-catalog.mjs";
if (fs.existsSync(".env.local")) process.loadEnvFile(".env.local");
if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL이 없습니다. .env.local 또는 환경변수에 Neon 연결 문자열을 넣으세요.",
  );
  process.exit(1);
}
try {
  const sql = neon(process.env.DATABASE_URL);
  const statements = schema()
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.replace(/--[^\n]*/g, "").trim());
  await sql.transaction([
    ...statements.map((s) => sql.query(s)),
    sql.query(seedSql, [JSON.stringify(catalog())]),
  ]);
  console.log(
    `DB 준비 완료: 회원/진행도 테이블 및 ${catalog().length}개 학습 항목. 회원·잠금은 유지되며 개정 이전 기록과 수정본은 백업 후 이관됩니다.`,
  );
} catch {
  console.error(
    "DB 초기화 실패. Neon 연결 문자열, 네트워크, 쓰기 권한을 확인하세요. 비밀값은 출력하지 않았습니다.",
  );
  process.exit(1);
}
