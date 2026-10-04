import type { DiagramPoint, TextDiagram } from "@/lib/text-diagrams";

type ClassPoint = { x: number; y: number; label: string };

function PointSymbol({
  point,
  x,
  y,
}: {
  point: DiagramPoint;
  x: number;
  y: number;
}) {
  const title = point.label || point.symbol;
  return point.symbol === "×" ? (
    <path
      className="diagram-point point-cross"
      d={`M${x - 6} ${y - 6}l12 12m-12 0l12-12`}
    >
      <title>{title}</title>
    </path>
  ) : (
    <circle
      className={`diagram-point ${point.symbol === "○" ? "point-hollow" : "point-filled"}`}
      cx={x}
      cy={y}
      r="7"
    >
      <title>{title}</title>
    </circle>
  );
}

function PointDiagram({
  diagram,
}: {
  diagram: Extract<TextDiagram, { kind: "scatter" | "point-cloud" }>;
}) {
  const axes = diagram.kind === "scatter";
  const symbols = [...new Set(diagram.points.map((point) => point.symbol))];
  return (
    <figure
      className={`lesson-diagram coordinate-diagram ${axes ? "scatter-diagram" : "point-cloud-diagram"}`}
    >
      <svg
        viewBox="0 0 640 360"
        role="img"
        aria-label={
          axes
            ? `${diagram.xLabel}·${diagram.yLabel} 좌표 도식. ${diagram.points.map((p) => p.label || p.symbol).join(", ")}. 점의 위치는 원본의 상대적 배치를 나타냅니다.`
            : "점 배치 도식. 점의 종류와 상대적 배치는 원본과 같습니다."
        }
      >
        {axes && (
          <>
            <g className="diagram-axis">
              <path d="M58 290H588M78 310V38" />
              <path d="m581 285 7 5-7 5M73 45l5-7 5 7" />
            </g>
            <g className="diagram-axis-label">
              <text x="600" y="331" textAnchor="end">
                {diagram.xLabel}
              </text>
              <text x="78" y="25">
                {diagram.yLabel}
              </text>
            </g>
          </>
        )}
        {diagram.points.map((point, i) => {
          const x = (axes ? 78 : 90) + point.x * (axes ? 470 : 460);
          const y = (axes ? 290 : 300) - point.y * (axes ? 244 : 240);
          const end = point.x > 0.6;
          const labelLines = point.label?.match(/.{1,22}/gu) ?? [];
          return (
            <g key={i}>
              <PointSymbol point={point} x={x} y={y} />
              {point.label && (
                <text
                  className="diagram-point-label"
                  x={x + (end ? -14 : 14)}
                  y={y - 13 - (labelLines.length - 1) * 19}
                  textAnchor={end ? "end" : "start"}
                >
                  {labelLines.map((line, j) => (
                    <tspan key={j} x={x + (end ? -14 : 14)} dy={j ? 19 : 0}>
                      {line}
                    </tspan>
                  ))}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {!axes && (
        <div className="diagram-legend">
          {symbols.map((symbol) => (
            <span
              key={symbol}
              className={`diagram-symbol symbol-${symbol === "×" ? "cross" : symbol === "○" ? "hollow" : "filled"}`}
            >
              {symbol}
            </span>
          ))}
        </div>
      )}
    </figure>
  );
}

function CoordinateDiagram({
  title,
  description,
  points,
}: {
  title: string;
  description: string;
  points: ClassPoint[];
}) {
  return (
    <figure className="lesson-diagram coordinate-diagram">
      <figcaption>{title}</figcaption>
      <svg viewBox="0 0 480 300" role="img" aria-label={description}>
        <g className="diagram-grid">
          <path d="M340 240V72H96" />
        </g>
        <g className="diagram-axis">
          <path d="M64 240H426M96 272V30" />
          <path d="m419 235 7 5-7 5M91 37l5-7 5 7" />
          <path d="M340 235v10M91 72h10" />
        </g>
        <g className="diagram-axis-label">
          <text x="443" y="246">
            x₁
          </text>
          <text x="96" y="19" textAnchor="middle">
            x₂
          </text>
          <text x="80" y="262" textAnchor="middle">
            0
          </text>
          <text x="340" y="266" textAnchor="middle">
            1
          </text>
          <text x="71" y="78" textAnchor="middle">
            1
          </text>
        </g>
        {points.map((point) => (
          <circle
            key={`${point.x},${point.y}`}
            cx={96 + point.x * 244}
            cy={240 - point.y * 168}
            r="10"
            className={`diagram-point class-${point.label}`}
          >
            <title>{`(${point.x}, ${point.y}) · class ${point.label}`}</title>
          </circle>
        ))}
      </svg>
      <div className="diagram-legend">
        <span>
          <i className="legend-point class-0" aria-hidden="true" />
          Class 0
        </span>
        <span>
          <i className="legend-point class-1" aria-hidden="true" />
          Class 1
        </span>
      </div>
    </figure>
  );
}

export function LessonDiagram({ diagram }: { diagram: TextDiagram }) {
  if (diagram.kind === "scatter" || diagram.kind === "point-cloud")
    return <PointDiagram diagram={diagram} />;
  if (diagram.kind === "xor")
    return (
      <CoordinateDiagram
        title="XOR"
        description="XOR 좌표 그림. (0, 0)과 (1, 1)은 class 0, (0, 1)과 (1, 0)은 class 1입니다."
        points={[
          { x: 0, y: 0, label: "0" },
          { x: 0, y: 1, label: "1" },
          { x: 1, y: 0, label: "1" },
          { x: 1, y: 1, label: "0" },
        ]}
      />
    );
  return (
    <figure className="lesson-diagram flow-diagram" aria-label="계산 흐름">
      <ol>
        {diagram.steps.map((step, i) => (
          <li key={i}>
            <div className="diagram-step">{step}</div>
            {i < diagram.steps.length - 1 && (
              <span className="diagram-arrow" aria-hidden="true">
                ↓
              </span>
            )}
          </li>
        ))}
      </ol>
      {diagram.note && <figcaption>{diagram.note}</figcaption>}
    </figure>
  );
}
