import type { TextDiagram } from "@/lib/text-diagrams";

type ClassPoint = { x: number; y: number; label: string };

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
