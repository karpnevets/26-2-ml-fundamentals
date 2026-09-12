---
title: "Residual Learning & ResNet"
week: 8
question: "깊은 CNN을 어떻게 안정적으로 학습할까?"
concepts: ["Residual","Skip Connection","Batch Normalization","ResNet"]
estimated_time: "90–120 min"
---

---

## 8.1 Deep Network

CNN을 깊게 만들면 더 복잡한 representation을 만들 수 있다.

그러나 단순히 layer를 계속 추가한다고 항상 성능이 좋아지는 것은 아니다.

학습 자체가 어려워질 수 있다.

---

## 8.2 Gradient가 긴 경로를 지나갈 때

Deep network:

```text
Input
 ↓
Layer
 ↓
Layer
 ↓
Layer
 ↓
...
 ↓
Loss
```

gradient는 반대 방향으로 긴 계산 graph를 지나가야 한다.

---

## 8.3 Vanishing Gradient

여러 작은 값이 계속 곱해지면 gradient가 매우 작아질 수 있다.

앞쪽 layer가 거의 update되지 않는 문제가 생길 수 있다.

---

## 8.4 Explosion

반대로 큰 값이 반복해서 곱해지면 gradient가 매우 커질 수 있다.

학습이 불안정해질 수 있다.

---

## 8.5 Degradation Problem

중요한 점:

> Deep network의 문제를 모두 vanishing gradient 하나로 설명하면 안 된다.

Normalization과 좋은 initialization을 사용해도 더 깊은 plain network가 오히려 training error가 증가하는 degradation 문제가 관찰되었다.

ResNet은 이 optimization 문제를 완화하는 구조를 제안했다.

---

## 8.6 Residual Learning

기존 block:

\[
y=F(x)
\]

Residual block:

\[
y=x+F(x)
\]

여기서 \(F(x)\)는 input 전체를 새로 만드는 대신:

> **input에서 얼마나 바뀌어야 하는가**

를 학습한다고 해석할 수 있다.

---

## 8.7 Skip Connection

구조:

```text
x ──────────────────┐
│                   │
└→ Conv → ReLU → Conv → (+) → y
```

입력 \(x\)가 block의 transformation을 건너뛰어 output에 직접 더해진다.

이를 skip connection 또는 shortcut connection이라고 한다.

---

## 8.8 왜 도움이 되는가?

Residual connection에는 여러 관점이 있다.

### Identity Mapping이 쉬워짐

필요하다면:

\[
F(x)\approx0
\]

으로 만들면:

\[
y\approx x
\]

가 된다.

깊은 block이 기존 representation을 망가뜨리지 않고 유지하기 쉬워진다.

### Gradient Path

skip connection을 통해 gradient가 더 직접적인 경로로 흐를 수 있다.

---

## 8.9 CNN과 결합

Residual function \(F(x)\) 안에 convolution을 넣는다.

예:

```text
Input
  │
  ├────────────────────┐
  │                    │
Conv                    │
  ↓                     │
BN                      │
  ↓                     │
ReLU                    │
  ↓                     │
Conv                    │
  ↓                     │
BN                      │
  └────────── (+) ◄─────┘
              ↓
             ReLU
```

---

## 8.10 Batch Normalization — 최소 설명

ResNet block에서 자주 등장한다.

BatchNorm은 activation의 scale을 안정화하여 학습을 쉽게 하는 데 도움을 준다.

이번 SIG에서는 BatchNorm의 상세 통계적 유도보다:

> **deep network optimization을 안정화하는 대표적인 normalization 기법**

정도로 이해한다.

---

## 8.11 ResNet 전체

전체 구조를 단순화하면:

```text
Image
 ↓
Initial Conv
 ↓
Residual Blocks
 ↓
Residual Blocks
 ↓
Residual Blocks
 ↓
Global Average Pooling
 ↓
Linear Classifier
 ↓
Class Prediction
```

---

## 8.12 이제 각 요소를 다시 해석해보자

### Conv
Week 7에서 배운 image inductive bias를 사용한다.

### ReLU
Week 5에서 배운 nonlinearity다.

### Linear Classifier
Week 3에서 배운 classification의 확장이다.

### Loss
Week 1에서 배운 prediction 평가 기준이다.

### Backpropagation
Week 2, 5에서 배운 gradient 계산 과정이다.

### Residual Connection
deep network를 더 잘 optimize하기 위한 shortcut이다.

즉 ResNet은 완전히 새로운 개념들의 집합이 아니라:

> **지금까지 배운 요소들이 하나의 modern architecture 안에서 결합된 결과**

이다.

---

## 8.13 최종 목표

학생이 ResNet diagram을 보고 다음 질문에 답할 수 있으면 과정의 목표를 달성한 것이다.

1. Conv는 왜 사용하는가?
2. ReLU가 왜 필요한가?
3. 왜 여러 layer를 쌓는가?
4. Skip connection은 무엇을 하는가?
5. 최종 classifier는 무엇을 출력하는가?
6. Loss는 어디에서 계산되는가?
7. Gradient는 어떻게 각 parameter까지 전달되는가?
8. Training loss와 test performance는 왜 다른 문제인가?

---

## Checkpoint

1. Residual block의 기본 식은?
2. \(F(x)=0\)이라면 output은 어떻게 되는가?
3. Skip connection이 optimization에 도움이 되는 이유를 하나 설명하라.
4. ResNet이 단순히 "vanishing gradient 해결 모델"이라고만 설명하면 부족한 이유는?
5. ResNet 안에서 Week 1~7 개념을 최소 4개 찾아 연결해보자.

---

## 선택 과제

### [Check] Block 해석

다음 구조의 각 줄이 어떤 역할인지 설명한다.

```python
Conv2d
BatchNorm2d
ReLU
Conv2d
BatchNorm2d
Skip Add
ReLU
```

---

### [Apply] Tiny ResNet 구현

간단한 residual block을 직접 작성한다.

```python
class ResidualBlock(nn.Module):
    def __init__(self, ...):
        ...

    def forward(self, x):
        residual = x
        out = ...
        out = out + residual
        return ...
```

---

### [Explore] Plain CNN vs ResNet

비슷한 parameter 수를 가진:

- plain deep CNN
- residual CNN

을 비교한다.

가능한 비교:

```text
training loss
validation accuracy
gradient norm
convergence speed
```

실험 결과를 해석한다.

---

## 최종 한 장 요약

```text
Week 1
Model / Parameter / Loss
        ↓
Week 2
Gradient Descent
        ↓
Week 3
Linear Classification
        ↓
Week 4
Feature Space
        ↓
Week 5
MLP / Learned Representation
        ↓
Week 6
Training / Generalization
        ↓
Week 7
CNN / Image Inductive Bias
        ↓
Week 8
Residual Learning / ResNet
```

---
