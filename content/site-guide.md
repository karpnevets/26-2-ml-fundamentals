# 사이트용 추가 페이지 제안

## 1. Glossary

용어 사전을 별도 페이지로 둔다.

예:

### Parameter
모델이 학습 과정에서 조정하는 값.

### Hyperparameter
학습 전에 사람이 정하는 설정값.

예:

- learning rate
- batch size
- hidden dimension

### Feature
모델이 input으로 사용하는 개별 정보.

### Gradient
parameter를 조금 바꿨을 때 loss가 어느 방향으로 얼마나 변하는지를 나타내는 값.

각 주차 페이지에서 용어를 클릭하면 glossary가 작은 popup으로 뜨게 하면 좋다.

---

# 2. Playground

가능하다면 다음 interactive demo를 별도 모아두는 것이 좋다.

## Loss Playground

slider:

```text
w = [----●------]
```

바꾸면:

```text
Prediction
Loss
Loss Curve의 현재 위치
```

가 동시에 업데이트된다.

Week 1~2에 매우 효과적이다.

---

## Hyperplane Playground

2D point를 직접 찍고:

```text
w1
w2
b
```

를 slider로 움직인다.

decision boundary가 실시간으로 움직인다.

Week 3에 사용.

---

## Feature Space Playground

원형 데이터에:

```text
x₁² + x₂²
```

feature를 추가하기 전/후를 나란히 보여준다.

Week 4에 사용.

---

## Activation Playground

ReLU / Sigmoid / Tanh를 선택하면:

- function graph
- derivative graph

를 보여준다.

Week 5에 사용.

---

## CNN Filter Playground

작은 grayscale image와 \(3\times3\) filter를 보여주고 convolution 결과를 직접 계산할 수 있게 한다.

Week 7에 사용.

---

## Residual Playground

두 모델 비교:

```text
F(x)
```

vs

```text
x + F(x)
```

를 간단한 function fitting 문제에서 시각화한다.

Week 8에 활용.

---

# 3. 각 주차 Summary Card

홈 화면 또는 주차 마지막에 카드 형태로 보여준다.

예:

```text
┌──────────────────────────┐
│ Week 4                   │
│ Feature Space            │
│                          │
│ 핵심 질문                │
│ 직선으로 풀 수 없다면?   │
│                          │
│ 핵심 문장                │
│ Representation을 바꾸면 │
│ 문제가 쉬워질 수 있다.  │
└──────────────────────────┘
```

---

# 4. "왜 배우나요?" 박스

초보자에게 특히 중요하다.

각 개념 위에:

> **왜 배우나요?**

박스를 둘 수 있다.

예:

### Dot Product

> 여러 feature의 weighted sum을 한 번에 표현하기 위해 사용한다.

### ReLU

> Linear layer만 여러 번 쌓으면 전체 모델도 linear하므로 nonlinearity가 필요하다.

### Convolution

> 이미지의 local structure와 repeated pattern을 효율적으로 이용하기 위해 사용한다.

### Skip Connection

> 깊은 network가 기존 representation을 유지하면서 필요한 변화만 학습하기 쉽게 한다.

---

# 5. 수학 난이도 Toggle

사이트에서 수학 설명을 두 단계로 나누는 것도 좋다.

```text
[직관] [수식 보기]
```

기본은 직관 설명.

원하는 학생만 수식을 펼친다.

예:

### Gradient Descent

기본:

> 경사가 올라가는 방향이라면 반대로 움직인다.

"수식 보기":

\[
\theta_{t+1}
=
\theta_t-\eta\nabla_\theta L
\]

이런 식이다.

---

# 6. 코드 난이도 Toggle

```text
[개념만 보기]
[코드 보기]
[직접 구현]
```

Python 초보자가 수업을 따라가기 위해 코드 때문에 페이지를 포기하지 않게 한다.

---

# 7. Prerequisite 표시

각 주차 페이지 상단:

```text
이번 주에 필요한 것

✓ Week 1: Model / Loss
✓ Week 2: Gradient
○ Python: numpy shape 정도
```

이렇게 표시한다.

---

# 8. 선택 과제 Progress

예:

```text
Week 4

Check   ✅
Apply   ✅
Explore ⬜
```

Explore를 하지 않아도 다음 주로 넘어갈 수 있게 한다.

---

# 9. 추천 과제 제출 형태

가능하면 정답 한 줄 제출보다 짧은 설명을 요구한다.

예:

> "Learning rate가 너무 크면 왜 문제가 생기는지 한 문장으로 설명하세요."

> "CNN이 MLP보다 image data에 적합한 이유를 locality라는 단어를 사용해 설명하세요."

개념을 자신의 언어로 표현하는 능력이 중요하다.

---

# 10. 최종 프로젝트 아이디어

8주차 이후 선택 프로젝트를 둘 수 있다.

## Project A — MNIST

다음 세 모델을 비교한다.

- Linear Classifier
- MLP
- CNN

질문:

1. 각 모델의 inductive bias는 무엇인가?
2. parameter 수는?
3. validation 성능은?
4. 왜 결과가 다를까?

---

## Project B — CIFAR-10

- Small CNN
- Small ResNet

을 비교한다.

목표는 높은 accuracy 자체가 아니라:

> **왜 architecture가 달라졌을 때 optimization과 generalization이 달라지는가**

를 설명하는 것이다.

---

# 구현을 위한 Markdown Frontmatter 예시

Codex에서 static site generator를 사용할 경우 각 주차를 별도 Markdown 파일로 나눌 수 있다.

예:

```yaml
---
title: "Week 3 — Linear Classification"
week: 3
question: "여러 feature를 이용해 어떻게 경계를 만들까?"
prerequisites:
  - "Week 1: Model / Loss"
  - "Week 2: Gradient Descent"
concepts:
  - Vector
  - Dot Product
  - Hyperplane
  - Perceptron
estimated_time: "90–120 min"
---
```

---

# 파일 분리 예시

```text
content/
├─ index.md
├─ week-0-python.md
├─ week-1-model-loss.md
├─ week-2-gradient-descent.md
├─ week-3-linear-classification.md
├─ week-4-feature-space.md
├─ week-5-mlp.md
├─ week-6-training.md
├─ week-7-cnn.md
├─ week-8-resnet.md
├─ glossary.md
├─ playground.md
└─ final-project.md
```

---

# 디자인 방향

## 메인 화면

과도하게 AI스럽거나 화려한 디자인보다 학습 플랫폼에 가까운 구성을 추천한다.

```text
ML Fundamentals SIG

[Week 1] Model & Loss
   ↓
[Week 2] Gradient Descent
   ↓
[Week 3] Linear Classification
   ↓
...
[Week 8] ResNet
```

각 주차를 node처럼 연결하면 전체 학습 경로가 시각적으로 드러난다.

---

## 색상보다 구조

학습 내용은 다음 시각 요소 정도면 충분하다.

- 본문
- 핵심 문장 강조
- 수식 박스
- "왜?" 박스
- Checkpoint
- 선택 과제
- 다음 주 Preview

장식적 UI보다 정보 계층이 명확한 것이 중요하다.

---

# 강의 운영 원칙

## 1. 먼저 질문한다

```text
왜 Loss가 필요한가?
왜 activation이 필요한가?
왜 CNN이 필요한가?
왜 ResNet이 필요한가?
```

항상 필요성을 먼저 제시한다.

---

## 2. 수식은 마지막에 붙인다

```text
현상
→ 그림
→ 숫자 예시
→ 언어
→ 수식
```

순서를 지킨다.

---

## 3. 이전 개념을 반복해서 재사용한다

예:

Week 6의 training loop에서:

- Week 1 Loss
- Week 2 Gradient Descent
- Week 5 Backprop

을 다시 호출한다.

---

## 4. 새 용어의 수를 제한한다

한 섹션에서 새로운 핵심 용어는 가능하면 2~3개 이하로 제한한다.

---

## 5. 구현보다 해석을 우선한다

초보자의 목표는 처음부터 완전한 모델을 작성하는 것이 아니다.

먼저:

> **코드를 읽고 각 줄이 어떤 ML 개념인지 설명할 수 있게 한다.**

그 다음 직접 구현한다.

---

# 최종 학습 성과

전체 과정을 마친 학습자는 최소한 다음을 자신의 말로 설명할 수 있어야 한다.

1. Model과 parameter는 무엇인가?
2. Loss는 왜 필요한가?
3. Gradient Descent는 왜 loss를 줄일 수 있는가?
4. Vector와 dot product가 linear model에 왜 등장하는가?
5. Hyperplane은 무엇인가?
6. Linear classifier가 풀 수 없는 문제는 왜 생기는가?
7. Feature transformation은 무엇인가?
8. MLP는 feature를 어떻게 학습하는가?
9. Activation은 왜 필요한가?
10. Backpropagation은 무엇을 계산하는가?
11. Softmax와 Cross-Entropy는 어디에 쓰이는가?
12. Training과 Test는 왜 분리하는가?
13. Overfitting은 무엇인가?
14. CNN이 image에 적합한 이유는 무엇인가?
15. Inductive Bias란 무엇인가?
16. Convolution의 locality와 weight sharing은 무엇인가?
17. Deep network가 왜 어려울 수 있는가?
18. Residual connection은 무엇인가?
19. ResNet에서 이전 1~7주차 개념들이 어떻게 결합되는가?

이 19개 질문에 답할 수 있다면, 이후 Transformer, GNN, Representation Learning 등의 중급 과정으로 넘어갈 수 있는 충분한 기반을 갖춘 것으로 본다.
