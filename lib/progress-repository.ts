export type Query = (
  text: string,
  values?: unknown[],
) => Promise<Record<string, unknown>[]>;
export async function readProgress(query: Query, userId: string) {
  const rows = await query(
    "SELECT item_id,completed FROM learning_progress WHERE user_id=$1::uuid",
    [userId],
  );
  return Object.fromEntries(
    rows.map((r) => [String(r.item_id), r.completed === true]),
  );
}
export async function writeProgress(
  query: Query,
  userId: string,
  id: string,
  completed: boolean,
) {
  await query(
    `INSERT INTO learning_progress(user_id,item_id,completed) VALUES($1::uuid,$2,$3) ON CONFLICT(user_id,item_id) DO UPDATE SET completed=EXCLUDED.completed,updated_at=now()`,
    [userId, id, completed],
  );
}
export async function importProgress(
  query: Query,
  userId: string,
  ids: string[],
) {
  // Existing cloud entries (including explicitly unchecked items) always win.
  const rows = await query(
    `INSERT INTO learning_progress(user_id,item_id,completed) SELECT $1::uuid,item.id,true FROM learning_items item WHERE item.id IN (SELECT jsonb_array_elements_text($2::jsonb)) ON CONFLICT(user_id,item_id) DO NOTHING RETURNING item_id`,
    [userId, JSON.stringify(ids)],
  );
  return rows.length;
}
export async function dashboardRows(query: Query) {
  return query(`
 SELECT u.id,u.email,u.name,u.created_at,u.last_login_at,
 COALESCE(jsonb_object_agg(p.item_id,p.completed) FILTER (WHERE p.item_id IS NOT NULL),'{}'::jsonb) AS progress,
 MAX(p.updated_at) AS last_progress_at
 FROM app_users u LEFT JOIN learning_progress p ON p.user_id=u.id
 WHERE u.disabled_at IS NULL
 GROUP BY u.id ORDER BY u.created_at DESC
`);
}
