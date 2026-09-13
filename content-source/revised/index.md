# ML 기초 SIG — Self-Study Roadmap

> 대상: 머신러닝, Python, 선형대수 배경지식이 거의 없는 다양한 전공의 학습자  
> 최종 목표: **ResNet 구조를 보고 각 연산이 왜 존재하는지, tensor가 어떻게 흐르는지, loss에서 parameter까지 학습이 어떻게 연결되는지 설명할 수 있는 수준**

## 학습 철학

이 과정은 수학 용어를 먼저 나열하지 않는다.

각 주차는 가능한 한 다음 순서를 따른다.

```text
문제 상황
  ↓
직관
  ↓
구체적인 숫자/그림
  ↓
필수 수식
  ↓
코드와 shape
  ↓
Checkpoint
  ↓
선택 과제
  ↓
다음 주 질문
```

사이트만 읽어도 독학할 수 있도록 본문 설명을 충분히 제공하고, Colab은 계산과 실험을 직접 해보는 보조 자료로 사용한다.

---

# 전체 로드맵

| 주차 | 핵심 질문 | 주요 개념 |
|---|---|---|
| 0 · 선택 | ML 코드를 읽으려면 Python에서 무엇을 알아야 할까? | Python, Function, List, NumPy, Shape, Indexing |
| 1 | 모델이 학습한다는 것은 무엇이 바뀐다는 뜻일까? | Model, Parameter, Feature, Prediction, Target, Loss |
| 2 | 여러 feature로 어떻게 하나의 경계를 만들까? | Vector, Dot Product, Matrix Multiplication, Linear Classifier, Hyperplane, Perceptron |
| 3 | 직선 하나로 풀 수 없는 문제를 representation으로 바꿀 수 있을까? | Feature Space, Linear Separability, Feature Transformation, Polynomial Feature |
| 4 | parameter를 loss가 작아지는 방향으로 어떻게 바꿀까? | Derivative, Gradient, Gradient Descent, Learning Rate, Chain Rule, Computational Graph |
| 5 | Feature transformation 자체를 모델이 학습할 수 있을까? | Linear Layer, Sigmoid, Tanh, ReLU, MLP, Backpropagation, Autograd |
| 6 | Neural Network를 실제 classification에 어떻게 학습하고 평가할까? | Logit, Softmax, Cross-Entropy, Batch, Epoch, Training Loop, Generalization, Overfitting |
| 7 | 이미지의 공간적 구조를 architecture에 어떻게 반영할까? | CNN, Convolution, Channel, Stride, Padding, Pooling, Receptive Field, Inductive Bias |
| 8 | 깊은 CNN을 어떻게 더 쉽게 optimize할까? | Residual Learning, Skip Connection, Degradation, BatchNorm, Projection Shortcut, ResNet |

---

# 왜 Gradient Descent가 Week 4인가?

Gradient Descent를 Week 1 직후에 넣지 않는다.

먼저:

```text
Week 1: 무엇을 학습하는가?
Week 2: linear model은 어떤 function을 만드는가?
Week 3: representation은 왜 중요한가?
```

를 이해한 뒤:

```text
Week 4: 그 function의 parameter를 어떻게 학습하는가?
Week 5: 여러 layer에서 gradient를 어떻게 전달하는가?
```

로 연결한다.

따라서 Gradient Descent와 Backpropagation이 연속된 주차에서 하나의 흐름으로 학습된다.

---

# 수식 표시 원칙

사이트는 수식을 무조건 접지 않는다.

## 항상 보이는 수식

개념을 이해하는 데 필수적인 정의와 관계식은 본문에 상시 표시한다.

예:

\[
\ell(\hat y,y)=(\hat y-y)^2
\]

\[
w^Tx+b=0
\]

\[
\theta_{t+1}=\theta_t-\eta\nabla_\theta J
\]

\[
y=x+F(x)
\]

## 접을 수 있는 내용

다음만 `<details>` 또는 사이트의 expandable component로 접는다.

- 숫자 대입을 여러 단계 수행하는 예제
- 같은 공식을 다른 값으로 반복 계산한 예제
- 본문 이해에 필수적이지 않은 추가 유도
- 연습용 보충 계산

즉 사용자가 "수식 보기"를 누르지 않으면 핵심 내용을 놓치는 구조를 만들지 않는다.

---

# 선택 과제 구조

각 주차의 과제는 세 단계다.

## Check

본문을 제대로 이해했는지 확인한다.

- 수식의 각 항 설명
- 작은 손계산
- shape 계산
- 한두 문장 설명

## Apply

배운 개념을 직접 적용한다.

- 작은 코드 수정
- 계산 전체 수행
- architecture/shape tracing
- 결과 해석

## Explore

시간과 흥미가 있는 학습자를 위한 선택 과제다.

- 비교 실험
- gradient/curve 시각화
- model variation
- 결과에 대한 짧은 분석

Explore를 완료하지 않아도 다음 주 학습에 문제가 없도록 설계한다.

---

# 학습자가 매주 스스로 확인할 질문

각 주차를 끝냈을 때 다음 네 가지를 확인한다.

1. **왜 이 개념이 필요한가?**
2. **핵심 수식을 말로 읽을 수 있는가?**
3. **input/output shape를 추적할 수 있는가?**
4. **다음 주 질문이 왜 자연스럽게 생기는가?**

이 네 질문에 답하기 어려우면 다음 주로 넘어가기 전에 해당 주차의 Checkpoint를 다시 본다.
