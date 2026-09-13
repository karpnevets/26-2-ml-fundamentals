"use client";
import { useState, useId } from "react";
type Point = { x: number; y: number };
export function Slider({
  label,
  value,
  onChange,
  min = -5,
  max = 5,
  step = 0.1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="slider">
      <span>
        {label}
        <output>{Number(value.toFixed(3))}</output>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
function Plot({
  fn,
  points = [],
  xmin = -5,
  xmax = 7,
  ymin = 0,
  ymax = 100,
  label,
}: {
  fn?: (x: number) => number;
  points?: Point[];
  xmin?: number;
  xmax?: number;
  ymin?: number;
  ymax?: number;
  label: string;
}) {
  const clipId = useId();
  const sx = (x: number) => 40 + ((x - xmin) / (xmax - xmin)) * 490,
    sy = (y: number) => 250 - ((y - ymin) / (ymax - ymin)) * 220;
  const samples = Array.from({ length: 161 }, (_, i) => {
    const x = xmin + ((xmax - xmin) * i) / 160;
    return `${sx(x)},${sy(fn ? fn(x) : 0)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 560 290" role="img" aria-label={label} className="plot">
      <defs>
        <clipPath id={clipId}>
          <rect x="40" y="25" width="490" height="225" />
        </clipPath>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line
            x1="40"
            x2="530"
            y1={250 - t * 220}
            y2={250 - t * 220}
            stroke="#303538"
          />
          <text x="34" y={254 - t * 220} textAnchor="end">
            {(ymin + t * (ymax - ymin)).toFixed(1)}
          </text>
          <text x={40 + t * 490} y="276" textAnchor="middle">
            {(xmin + t * (xmax - xmin)).toFixed(1)}
          </text>
        </g>
      ))}
      <g clipPath={`url(#${clipId})`}>
        {fn && (
          <polyline
            points={samples}
            fill="none"
            stroke="#b5e69a"
            strokeWidth="2.5"
          />
        )}
        {points.length > 1 && (
          <polyline
            points={points.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" ")}
            fill="none"
            stroke="#dba878"
            strokeWidth="1.5"
          />
        )}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={i === points.length - 1 ? 6 : 3}
            fill={i === points.length - 1 ? "#fff" : "#dba878"}
          />
        ))}
      </g>
    </svg>
  );
}
function Stats({ items }: { items: [string, string][] }) {
  return (
    <div className="stats">
      {items.map(([label, v]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{v}</strong>
        </div>
      ))}
    </div>
  );
}
const fmt = (n: number) =>
  Math.abs(n) > 1e5 ? n.toExponential(2) : n.toFixed(3);
export function LossPlayground() {
  const [x, X] = useState(2),
    [y, Y] = useState(6),
    [w, W] = useState(2);
  const loss = (a: number) => (a * x - y) ** 2;
  return (
    <>
      <p>
        정답에 가까운 예측일수록 오차가 작아집니다. w를 바꾸며 흰 점이 곡선
        위에서 어떻게 움직이는지 보세요.
      </p>
      <div className="experiment">
        <div>
          <Slider label="입력 x" value={x} onChange={X} />
          <Slider label="정답 y" value={y} onChange={Y} min={-10} max={10} />
          <Slider label="Parameter w" value={w} onChange={W} />
        </div>
        <Plot
          fn={loss}
          points={[{ x: w, y: loss(w) }]}
          xmin={-5}
          xmax={5}
          ymax={Math.max(loss(-5), loss(5), 1)}
          label="Loss curve"
        />
      </div>
      <Stats
        items={[
          ["Prediction = wx", fmt(w * x)],
          ["Loss = (wx − y)²", fmt(loss(w))],
        ]}
      />
      {x === 0 && (
        <p>
          입력이 0이면 w를 바꿔도 예측은 0입니다. Loss curve가 평평해집니다.
        </p>
      )}
    </>
  );
}
export function GradientPlayground() {
  const [start, S] = useState(0),
    [lr, R] = useState(0.1),
    [steps, N] = useState(5);
  const path = [start];
  for (let i = 0; i < steps; i++)
    path.push(path.at(-1)! - lr * 2 * (path.at(-1)! - 3));
  const w = path.at(-1)!;
  return (
    <>
      <p>
        기울기의 반대 방향으로 한 걸음. L(w) = (w − 3)²에서 보폭을 바꾸어
        보세요.
      </p>
      <div className="preset-row">
        {[0.001, 0.1, 1.1].map((n, i) => (
          <button key={n} aria-pressed={lr === n} onClick={() => R(n)}>
            {["아주 작은 보폭", "적당한 보폭", "너무 큰 보폭"][i]} · {n}
          </button>
        ))}
      </div>
      <div className="experiment">
        <div>
          <Slider label="시작 w" value={start} onChange={S} />
          <Slider
            label="Learning rate η"
            value={lr}
            onChange={R}
            min={0.001}
            max={1.2}
            step={0.001}
          />
          <Slider
            label="업데이트 횟수"
            value={steps}
            onChange={N}
            min={0}
            max={30}
            step={1}
          />
        </div>
        <Plot
          fn={(x) => (x - 3) ** 2}
          points={path.map((x) => ({ x, y: (x - 3) ** 2 }))}
          xmin={Math.min(-2, ...path)}
          xmax={Math.max(7, ...path)}
          ymax={Math.max(25, ...path.map((x) => (x - 3) ** 2))}
          label="Gradient descent path"
        />
      </div>
      <Stats
        items={[
          ["현재 w", fmt(w)],
          ["Gradient = 2(w − 3)", fmt(2 * (w - 3))],
          ["다음 w = w − η · gradient", fmt(w - lr * 2 * (w - 3))],
        ]}
      />
      <p className="muted">
        {lr >= 1
          ? "이 함수에서 η ≥ 1이면 일반적으로 수렴하지 않습니다. 최솟값을 지나쳐 진동하거나 발산합니다."
          : "이 함수의 최솟값은 w = 3입니다. 작은 보폭일수록 천천히 접근합니다."}
      </p>
      <details>
        <summary>각 step의 숫자로 확인하기</summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Step</th>
                <th>w</th>
                <th>Loss</th>
              </tr>
            </thead>
            <tbody>
              {path.map((v, i) => (
                <tr key={i}>
                  <td>{i}</td>
                  <td>{fmt(v)}</td>
                  <td>{fmt((v - 3) ** 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
const dots = Array.from({ length: 32 }, (_, i) => ({
  x: Math.cos(i * 2.4) * (i % 2 ? 2.6 : 0.9),
  y: Math.sin(i * 2.4) * (i % 2 ? 2.6 : 0.9),
  outer: i % 2 === 1,
}));
export function HyperplanePlayground() {
  const [w1, A] = useState(1),
    [w2, B] = useState(1),
    [b, C] = useState(0);
  const data = Array.from({ length: 24 }, (_, i) => ({
    x: ((i * 17) % 23) / 3 - 3.5,
    y: ((i * 11) % 23) / 3 - 3.5,
  }));
  return (
    <>
      <p>
        w₁x₁ + w₂x₂ + b = 0이 두 영역을 나눕니다. +는 양수 점수, −는 음수
        점수입니다.
      </p>
      <div className="experiment">
        <div>
          <Slider label="w₁" value={w1} onChange={A} />
          <Slider label="w₂" value={w2} onChange={B} />
          <Slider label="b" value={b} onChange={C} />
          <p>
            현재 경계: {w1.toFixed(1)}x₁ + {w2.toFixed(1)}x₂ + {b.toFixed(1)} =
            0
          </p>
        </div>
        <svg
          viewBox="0 0 360 360"
          className="plot"
          role="img"
          aria-label="Linear decision boundary"
        >
          <defs>
            <clipPath id="boundary">
              <rect width="360" height="360" />
            </clipPath>
          </defs>
          <g clipPath="url(#boundary)">
            <line x1="0" y1="180" x2="360" y2="180" stroke="#45494a" />
            <line x1="180" y1="0" x2="180" y2="360" stroke="#45494a" />
            {w2 !== 0 ? (
              <line
                x1="0"
                y1={180 + ((-4.5 * w1 + b) / w2) * 40}
                x2="360"
                y2={180 + ((4.5 * w1 + b) / w2) * 40}
                stroke="#fff"
                strokeWidth="2"
              />
            ) : w1 !== 0 ? (
              <line
                x1={180 - (b / w1) * 40}
                x2={180 - (b / w1) * 40}
                y1="0"
                y2="360"
                stroke="#fff"
                strokeWidth="2"
              />
            ) : null}
            {data.map((p, i) => (
              <text
                key={i}
                x={180 + p.x * 40}
                y={185 - p.y * 40}
                fill={w1 * p.x + w2 * p.y + b >= 0 ? "#b5e69a" : "#dba878"}
                style={{
                  fontSize: 23,
                  fill: w1 * p.x + w2 * p.y + b >= 0 ? "#b5e69a" : "#dba878",
                }}
              >
                {w1 * p.x + w2 * p.y + b >= 0 ? "+" : "−"}
              </text>
            ))}
          </g>
        </svg>
      </div>
      {w1 === 0 && w2 === 0 && (
        <p>
          두 weight가 0이면 입력과 무관한 상수 점수 {b}입니다. 고유한 결정
          직선이 없습니다.
        </p>
      )}
      <p>
        양수 또는 0: {data.filter((p) => w1 * p.x + w2 * p.y + b >= 0).length}개
        · 음수: {data.filter((p) => w1 * p.x + w2 * p.y + b < 0).length}개. 점수
        0은 경계 위이며 여기서는 +로 표시합니다.
      </p>
    </>
  );
}
export function FeaturePlayground() {
  const [threshold, T] = useState(3);
  return (
    <>
      <p>
        같은 데이터를 다른 좌표로 봅니다. 원 안과 밖은 직선 하나로 나누기
        어렵지만, 중심까지의 거리 제곱을 쓰면 문턱 하나면 됩니다.
      </p>
      <Slider
        label="분리 기준 r²"
        value={threshold}
        onChange={T}
        min={0}
        max={9}
      />
      <div className="feature-pair">
        <figure>
          <figcaption>원래 공간 · (x₁, x₂)</figcaption>
          <svg
            viewBox="0 0 340 300"
            className="plot"
            role="img"
            aria-label="Original circular dataset"
          >
            <line x1="20" y1="150" x2="320" y2="150" stroke="#45494a" />
            <line x1="170" y1="10" x2="170" y2="290" stroke="#45494a" />
            <circle
              cx="170"
              cy="150"
              r={Math.sqrt(threshold) * 42}
              fill="none"
              stroke="#fff"
              strokeDasharray="5 5"
            />
            {dots.map((p, i) => (
              <circle
                key={i}
                cx={170 + p.x * 42}
                cy={150 - p.y * 42}
                r={p.outer ? 5 : 4}
                fill={p.outer ? "#dba878" : "#b5e69a"}
              />
            ))}
          </svg>
        </figure>
        <figure>
          <figcaption>바꾼 공간 · x₁² + x₂²</figcaption>
          <svg
            viewBox="0 0 340 300"
            className="plot"
            role="img"
            aria-label="Transformed radial feature"
          >
            <line x1="25" y1="220" x2="325" y2="220" stroke="#45494a" />
            <line
              x1={25 + threshold * 32}
              x2={25 + threshold * 32}
              y1="30"
              y2="220"
              stroke="#fff"
              strokeDasharray="5 5"
            />
            {dots.map((p, i) => (
              <circle
                key={i}
                cx={25 + (p.x * p.x + p.y * p.y) * 32}
                cy={65 + (i % 8) * 17}
                r="5"
                fill={p.outer ? "#dba878" : "#b5e69a"}
              />
            ))}
            {[0, 3, 6, 9].map((x) => (
              <text key={x} x={25 + x * 32} y="245">
                {x}
              </text>
            ))}
          </svg>
        </figure>
      </div>
      <p>
        초록: 안쪽 원 (거리² = 0.81) · 주황: 바깥 원 (거리² = 6.76). 현재
        기준으로{" "}
        {
          dots.filter((p) => p.x * p.x + p.y * p.y < threshold === !p.outer)
            .length
        }
        /32개를 올바르게 분류합니다.
      </p>
    </>
  );
}
export function ActivationPlayground() {
  const [kind, K] = useState("ReLU");
  const f = (x: number) =>
    kind === "ReLU"
      ? Math.max(0, x)
      : kind === "Sigmoid"
        ? 1 / (1 + Math.exp(-x))
        : Math.tanh(x);
  return (
    <>
      <div className="preset-row">
        {["ReLU", "Sigmoid", "Tanh"].map((k) => (
          <button aria-pressed={kind === k} onClick={() => K(k)} key={k}>
            {k}
          </button>
        ))}
      </div>
      <Plot
        fn={f}
        xmin={-5}
        xmax={5}
        ymin={-1.2}
        ymax={kind === "ReLU" ? 5 : 1.2}
        label="Activation function"
      />
      <p>
        {kind === "ReLU"
          ? "음수는 0으로, 양수는 그대로 통과합니다."
          : kind === "Sigmoid"
            ? "출력은 0과 1 사이입니다."
            : "출력은 −1과 1 사이입니다."}{" "}
        Linear layer 사이에 비선형 함수를 넣어 모델의 표현력을 늘립니다.
      </p>
      <Stats items={[-2, 0, 2].map((x) => [`f(${x})`, fmt(f(x))])} />
    </>
  );
}
export function CNNPlayground() {
  const [pos, P] = useState(0),
    [filter, F] = useState("edge");
  const input = Array.from({ length: 25 }, (_, i) => (i % 5 >= 2 ? 1 : 0));
  const kernel =
    filter === "edge" ? [-1, 0, 1, -1, 0, 1, -1, 0, 1] : Array(9).fill(1 / 9);
  const outputs = Array.from({ length: 9 }, (_, p) =>
    kernel.reduce(
      (s, v, k) =>
        s +
        v *
          input[
            (Math.floor(p / 3) + Math.floor(k / 3)) * 5 + (p % 3) + (k % 3)
          ],
      0,
    ),
  );
  return (
    <>
      <p>
        5×5 이미지 위에서 같은 3×3 filter를 재사용합니다. Padding 없이 stride
        1로 이동하면 3×3 feature map이 됩니다.
      </p>
      <div className="preset-row">
        <button aria-pressed={filter === "edge"} onClick={() => F("edge")}>
          세로 경계 filter
        </button>
        <button aria-pressed={filter === "mean"} onClick={() => F("mean")}>
          평균 filter
        </button>
        <button onClick={() => P((pos + 1) % 9)}>다음 위치 →</button>
      </div>
      <Slider
        label="Filter 위치 (0–8)"
        value={pos}
        onChange={P}
        min={0}
        max={8}
        step={1}
      />
      <div className="grids">
        {[
          { name: "Input · 5×5", values: input, n: 5 },
          { name: "Filter · 3×3", values: kernel, n: 3 },
          { name: "Feature map · 3×3", values: outputs, n: 3 },
        ].map((g, j) => (
          <figure key={g.name}>
            <figcaption>{g.name}</figcaption>
            <div
              className="number-grid"
              style={{ gridTemplateColumns: `repeat(${g.n},1fr)` }}
            >
              {g.values.map((v, i) => (
                <span
                  key={i}
                  className={
                    (j === 2 && i === pos) ||
                    (j === 0 &&
                      Math.floor(i / 5) >= Math.floor(pos / 3) &&
                      Math.floor(i / 5) < Math.floor(pos / 3) + 3 &&
                      i % 5 >= pos % 3 &&
                      i % 5 < (pos % 3) + 3)
                      ? "selected"
                      : ""
                  }
                >
                  {Number(v.toFixed(2))}
                </span>
              ))}
            </div>
          </figure>
        ))}
      </div>
      <p>
        선택한 영역과 filter의 대응하는 숫자를 곱해 더하면{" "}
        <strong>{fmt(outputs[pos])}</strong>입니다. 출력값 하나가 feature map의
        한 칸에 저장됩니다.
      </p>
      <details>
        <summary>아홉 번의 곱셈 확인하기</summary>
        <p>
          {kernel
            .map(
              (v, k) =>
                `${input[(Math.floor(pos / 3) + Math.floor(k / 3)) * 5 + (pos % 3) + (k % 3)]} × ${fmt(v)}`,
            )
            .join(" + ")}{" "}
          = {fmt(outputs[pos])}
        </p>
      </details>
    </>
  );
}
export function ResidualPlayground() {
  const [x, X] = useState(2),
    [f, F] = useState(0);
  return (
    <>
      <p>
        입력을 유지하고 작은 변화만 학습한다면? F(x)를 0으로 놓고 두 경로를
        비교하세요.
      </p>
      <Slider label="입력 x" value={x} onChange={X} />
      <Slider label="학습한 변화 F(x)" value={f} onChange={F} />
      <div className="residual-compare">
        <div>
          <span>Plain block</span>
          <p>x → F → y</p>
          <strong>y = F(x) = {fmt(f)}</strong>
        </div>
        <div>
          <span>Residual block</span>
          <p>
            x ───────────┐
            <br />└ → F(x) → (+) → y
          </p>
          <strong>y = x + F(x) = {fmt(x + f)}</strong>
        </div>
      </div>
      <p>
        F(x) = 0이면 residual block은 입력을 그대로 유지합니다. 이 구조는 깊어진
        plain network의 training error가 증가하는 degradation 문제를 완화하며,
        gradient가 전달되는 직접적인 경로도 제공합니다.
      </p>
    </>
  );
}
export const playgrounds = [
  { title: "Loss Playground", week: 1, Component: LossPlayground },
  { title: "Gradient Descent", week: 4, Component: GradientPlayground },
  { title: "Hyperplane", week: 2, Component: HyperplanePlayground },
  { title: "Feature Space", week: 3, Component: FeaturePlayground },
  { title: "Activation", week: 5, Component: ActivationPlayground },
  { title: "CNN Filter", week: 7, Component: CNNPlayground },
  { title: "Residual Learning", week: 8, Component: ResidualPlayground },
];
export function WeekPlayground({ week }: { week: number }) {
  const p = playgrounds.find((p) => p.week === week);
  return p ? (
    <section className="lab panel">
      <span className="eyebrow">직관으로 보기 · INTERACTIVE</span>
      <h2>{p.title}</h2>
      <p.Component />
    </section>
  ) : null;
}
export function PlaygroundPage({
  allowedWeeks = [0, 1, 2, 3, 4, 5, 6, 7, 8],
}: {
  allowedWeeks?: number[];
}) {
  const [active, A] = useState(0);
  const available = playgrounds
    .filter((p) => allowedWeeks.includes(p.week))
    .sort((a, b) => a.week - b.week);
  const p = available[active] || available[0];
  return (
    <>
      <div className="lab-tabs" role="group" aria-label="실험 선택">
        {available.map((p, i) => (
          <button key={p.week} aria-pressed={active === i} onClick={() => A(i)}>
            {String(i + 1).padStart(2, "0")} {p.title}
          </button>
        ))}
      </div>
      <section className="lab panel">
        <span className="eyebrow">WEEK {p.week}</span>
        <h2>{p.title}</h2>
        <p.Component />
        <a href={`/week/${p.week}`}>관련 강의로 이동 ↗</a>
      </section>
    </>
  );
}
