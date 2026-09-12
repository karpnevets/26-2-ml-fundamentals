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
  return (
    <>
      {body.split(/(?=^### \[(?:Check|Apply|Explore)\])/m).map((part, i) => {
        const m = part.match(/^### \[(Check|Apply|Explore)\](.*)\n/);
        if (!m) return <LessonMarkdown key={i} text={part} />;
        const level = m[1];
        const time =
          level === "Check" ? "5–15" : level === "Apply" ? "20–40" : "30–90+";
        const contents = (
          <>
            <LessonMarkdown text={part.slice(m[0].length)} />
            <ProgressCheck
              id={`w${week}:assignment:${level}`}
              label="이 과제를 완료했어요"
            />
          </>
        );
        return collapsible ? (
          <details
            className={`assignment level-${level.toLowerCase()}`}
            key={i}
          >
            <summary>
              {level.toUpperCase()} · {time} min {m[2]}
            </summary>
            {contents}
          </details>
        ) : (
          <div className={`assignment level-${level.toLowerCase()}`} key={i}>
            <span className="badge">
              {level.toUpperCase()} · {time} min
            </span>
            {m[2].trim() && <h3>{m[2]}</h3>}
            {contents}
          </div>
        );
      })}
    </>
  );
}
