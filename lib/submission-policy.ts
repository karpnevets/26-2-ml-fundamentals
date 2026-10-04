export const MAX_NOTEBOOK_BYTES = 3 * 1024 * 1024;
export type Submission = {
  projectId: string;
  filename: string;
  revision: number;
  status: "draft" | "requested" | "reviewed";
  feedback: string;
  uploadedAt: string;
  requestedAt: string | null;
  reviewedAt: string | null;
};
export type ReviewSubmission = Submission & {
  userId: string;
  name: string;
  email: string;
  title: string;
  week: number;
};
export const submissionStatus = {
  draft: "업로드 완료 · 요청 전",
  requested: "피드백 대기 중",
  reviewed: "피드백 도착",
};
export function validRevision(
  value: unknown,
  allowZero = false,
): value is number {
  return Number.isSafeInteger(value) && Number(value) >= (allowZero ? 0 : 1);
}
export function validUserId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}
export function validNotebook(filename: string, text: string) {
  if (
    !/\.ipynb$/i.test(filename) ||
    filename.length > 150 ||
    filename.length < 7 ||
    /[\x00-\x1f\x7f/\\]/.test(filename)
  )
    return false;
  if (new TextEncoder().encode(text).byteLength > MAX_NOTEBOOK_BYTES)
    return false;
  try {
    const n = JSON.parse(text);
    const object = (x: unknown) =>
      !!x && typeof x === "object" && !Array.isArray(x);
    return (
      object(n) &&
      n.nbformat === 4 &&
      Number.isInteger(n.nbformat_minor) &&
      n.nbformat_minor >= 0 &&
      object(n.metadata) &&
      Array.isArray(n.cells) &&
      n.cells.every(
        (c: Record<string, unknown>) =>
          object(c) &&
          ["code", "markdown", "raw"].includes(String(c.cell_type)) &&
          object(c.metadata) &&
          (typeof c.source === "string" ||
            (Array.isArray(c.source) &&
              c.source.every((s) => typeof s === "string"))) &&
          (c.cell_type !== "code" ||
            (Array.isArray(c.outputs) &&
              (c.execution_count === null ||
                Number.isInteger(c.execution_count)))),
      )
    );
  } catch {
    return false;
  }
}
export function submissionDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "";
}
