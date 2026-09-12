"use client";
import { useState } from "react";
const blocks = [
  [
    "Convolution",
    "7",
    "가까운 pixel의 패턴을 같은 filter로 여러 위치에서 찾습니다. Locality와 weight sharing이 핵심입니다.",
  ],
  [
    "ReLU",
    "5",
    "비선형성을 넣어 linear layer만으로 표현할 수 없는 패턴을 학습합니다.",
  ],
  [
    "Residual function F(x)",
    "8",
    "Conv → BN → ReLU → Conv → BN이 필요한 변화량을 학습합니다.",
  ],
  [
    "Skip connection (+)",
    "8",
    "입력 x를 F(x)에 더합니다. 같은 shape일 때 직접 더하며, 크기가 다르면 projection 등으로 맞춥니다.",
  ],
  [
    "Classifier",
    "3",
    "Global average pooling으로 모은 feature에서 class별 logit을 계산합니다.",
  ],
  [
    "Loss",
    "1, 6",
    "Logit과 target으로 cross-entropy를 계산합니다. PyTorch CrossEntropyLoss에는 softmax 전 logit을 넣습니다.",
  ],
  [
    "Backpropagation ←",
    "2, 5",
    "Loss에서 chain rule로 각 parameter의 gradient를 계산합니다. Skip 경로에서도 gradient가 전달됩니다.",
  ],
];
export function ResNetRecap() {
  const [active, A] = useState(0);
  return (
    <section className="recap panel">
      <span className="eyebrow">THE BIG PICTURE</span>
      <h2>이제, ResNet을 읽어 봅시다.</h2>
      <p>
        각 구성요소를 선택해 이전 주차와 연결해 보세요. 이해를 위한 간략한
        구조입니다.
      </p>
      <div className="recap-flow">
        <span>Image →</span>
        {blocks.map((b, i) => (
          <button key={b[0]} aria-pressed={active === i} onClick={() => A(i)}>
            {b[0]}
          </button>
        ))}
      </div>
      <div className="recap-detail" aria-live="polite">
        <span className="eyebrow">WEEK {blocks[active][1]}</span>
        <h3>{blocks[active][0]}</h3>
        <p>{blocks[active][2]}</p>
      </div>
      <p className="muted">
        학습할 때는 loss와 backpropagation을 사용합니다. 추론할 때는 입력에서
        예측까지 계산합니다.
      </p>
    </section>
  );
}
