export type QuizQuestion = {
  number: number;
  description: string;
  image: string;
  answer: string;
};
export type QuizDraft = {
  questions: QuizQuestion[];
  instructions: string;
  password: string;
  published: boolean;
  revision: number;
};
export const validWeek = (n: number, min = 0) =>
  Number.isInteger(n) && n >= min && n <= 8;
export function normalizePassword(value: string) {
  return value.normalize("NFKC").trim();
}
export function safeImage(value: string) {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
}
export function validateQuiz(value: unknown): QuizDraft | null {
  if (!value || typeof value !== "object") return null;
  const v = value as QuizDraft;
  if (
    !Array.isArray(v.questions) ||
    v.questions.length > 30 ||
    typeof v.instructions !== "string" ||
    v.instructions.length > 10000 ||
    typeof v.password !== "string" ||
    v.password.length > 200 ||
    typeof v.published !== "boolean" ||
    !Number.isInteger(v.revision) ||
    v.revision < 0
  )
    return null;
  const seen = new Set<number>();
  for (const q of v.questions) {
    if (
      !q ||
      !Number.isInteger(q.number) ||
      q.number < 1 ||
      q.number > 999 ||
      seen.has(q.number) ||
      typeof q.description !== "string" ||
      !q.description.trim() ||
      q.description.length > 10000 ||
      typeof q.answer !== "string" ||
      q.answer.length > 2000 ||
      typeof q.image !== "string" ||
      q.image.length > 2000 ||
      !safeImage(q.image)
    )
      return null;
    seen.add(q.number);
  }
  if (
    v.published &&
    (!v.questions.length ||
      !v.instructions.trim() ||
      v.questions.some((q) => !q.answer.trim()))
  )
    return null;
  return {
    questions: v.questions.map((q) => ({
      number: q.number,
      description: q.description,
      image: q.image,
      answer: q.answer,
    })),
    instructions: v.instructions,
    password: normalizePassword(v.password),
    published: v.published,
    revision: v.revision,
  };
}
export function accessibleWeeks(unlocked: number[], admin = false) {
  const result = [0, 1];
  for (let week = 2; week <= 8; week++) {
    if (!admin && !unlocked.includes(week)) break;
    result.push(week);
  }
  return result;
}
export function publicQuestions(questions: QuizQuestion[]) {
  return questions.map(({ number, description, image }) => ({
    number,
    description,
    image,
  }));
}
