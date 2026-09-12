export type ProgressValues = Record<string, boolean>;
export function validProgressChange(
  body: unknown,
  allowed: Set<string>,
): { id: string; completed: boolean } | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;
  if (Object.keys(b).some((k) => k !== "id" && k !== "completed")) return null;
  return typeof b.id === "string" &&
    allowed.has(b.id) &&
    typeof b.completed === "boolean"
    ? { id: b.id, completed: b.completed }
    : null;
}
export function validImport(
  body: unknown,
  allowed: Set<string>,
): string[] | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;
  if (
    Object.keys(b).length !== 1 ||
    !Array.isArray(b.ids) ||
    b.ids.length > allowed.size
  )
    return null;
  return b.ids.every((id) => typeof id === "string" && allowed.has(id))
    ? ([...new Set(b.ids)] as string[])
    : null;
}
export function localProgress(raw: unknown): ProgressValues {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return Object.fromEntries(
    Object.entries(raw).filter(
      ([id, v]) => /^w[0-8]:/.test(id) && typeof v === "boolean",
    ),
  );
}
