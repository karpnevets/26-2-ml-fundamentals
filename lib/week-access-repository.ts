import type { Query } from "./progress-repository";
import {
  validateWeekAccessRule,
  type WeekAccessRule,
  type WeekAccessRules,
} from "./course-policy";

const prefix = "week-access-v1:";

export async function readWeekAccessRules(
  query: Query,
): Promise<WeekAccessRules> {
  const rows = await query(
    "SELECT name,body FROM course_documents WHERE name LIKE $1",
    [prefix + "%"],
  );
  const rules: WeekAccessRules = {};
  for (const { name, body } of rows) {
    const week = Number(String(name).slice(prefix.length));
    const rule = validateWeekAccessRule(week, JSON.parse(String(body)));
    if (!rule) throw new Error("Invalid week access rule");
    rules[week] = rule;
  }
  return rules;
}

export async function saveWeekAccessRule(
  query: Query,
  week: number,
  rule: WeekAccessRule,
) {
  const name = prefix + week;
  const revision = rule.revision + 1;
  const body = JSON.stringify({ ...rule, revision });
  const rows =
    rule.revision === 0
      ? await query(
          "INSERT INTO course_documents(name,body) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING name",
          [name, body],
        )
      : await query(
          "UPDATE course_documents SET body=$2,updated_at=now() WHERE name=$1 AND (body::jsonb->>'revision')::integer=$3 RETURNING name",
          [name, body, rule.revision],
        );
  return rows.length ? revision : null;
}
