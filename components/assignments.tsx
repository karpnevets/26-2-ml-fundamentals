import { LessonMarkdown } from "./markdown";
import { ProgressCheck } from "./progress";
export function Assignments({
  body,
  week,
  collapsible = false,
}: {
  body: string;
  week: number;
  collapsible?: boolean;
}) {
  const parts = body.split(/(?=^### \[(?:Check|Apply|Explore)\])/m);
  const intro = parts
    .filter((part) => !/^### \[(Check|Apply|Explore)\]/.test(part))
    .join("\n");
  return (
    <>
      <LessonMarkdown text={intro} />
      {(["Check", "Apply", "Explore"] as const).map((level) => {
        const tasks = parts.filter((part) => part.startsWith(`### [${level}]`));
        if (!tasks.length) return null;
        const contents = (
          <>
            {tasks.map((part, i) => (
              <LessonMarkdown
                key={i}
                text={part.replace(`### [${level}]`, "###")}
              />
            ))}
            <ProgressCheck
              id={`w${week}:assignment:${level}`}
              label="이 단계의 과제를 모두 완료했어요"
            />
          </>
        );
        return collapsible ? (
          <details
            className={`assignment level-${level.toLowerCase()}`}
            key={level}
          >
            <summary>
              {level.toUpperCase()} · {tasks.length}개 문항
            </summary>
            {contents}
          </details>
        ) : (
          <div
            className={`assignment level-${level.toLowerCase()}`}
            key={level}
          >
            <span className="badge">
              {level.toUpperCase()} · {tasks.length}개 문항
            </span>
            {contents}
          </div>
        );
      })}
    </>
  );
}
