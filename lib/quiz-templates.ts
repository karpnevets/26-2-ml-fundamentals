import type { QuizQuestion } from "./course-policy";
// New drafts start empty. Question Markdown, answers and password hashes live in DB.
export function quizTemplate(_week: number) {
  return {
    questions: [] as QuizQuestion[],
    instructions: "",
    published: false,
    revision: 0,
  };
}
