---
title: "MLP & Representation"
week: 5
question: "Feature를 모델이 직접 학습할 수 있을까?"
concepts: ["MLP","Activation","ReLU","Backpropagation"]
estimated_time: "90–120 min"
---

---

## 5.1 지난주의 한계

지난주에는:

\[
x\rightarrow\phi(x)
\]

를 사람이 직접 만들었다.

이번에는:

\[
x\rightarrow h
\]

라는 새로운 representation을 모델이 학습하도록 만든다.

---

## 5.2 Linear Layer

먼저:

\[
z=Wx+b
\]

를 생각한다.

이는 여러 input feature를 새로운 feature로 변환한다.

---

## 5.3 Linear Layer를 여러 개 쌓으면?

\[
z_1=W_1x
\]

\[
z_2=W_2z_1
\]

그러면:

\[
z_2=W_2W_1x
\]

이다.

즉 결국 하나의 큰 linear transformation과 같다.

따라서 linear layer만 계속 쌓아서는 nonlinear problem을 해결하는 능력이 늘지 않는다.

---

## 5.4 Nonlinearity

그래서 중간에 nonlinear function을 넣는다.

\[
h=\sigma(Wx+b)
\]

여기서 \(\sigma\)가 activation function이다.

---

## 5.5 ReLU

가장 대표적인 activation 중 하나:

\[
\operatorname{ReLU}(x)=\max(0,x)
\]

그래프:

```text
y
^
|      /
|     /
|    /
|___/________> x
```

음수는 0, 양수는 그대로 통과시킨다.

---

## 5.6 MLP

가장 간단한 MLP:

\[
h=\operatorname{ReLU}(W_1x+b_1)
\]

\[
\hat y=W_2h+b_2
\]

구조:

```text
Input
 ↓
Linear
 ↓
ReLU
 ↓
Linear
 ↓
Output
```

---

## 5.7 Hidden Representation

중간값 \(h\)는 사람이 직접 설계한 feature가 아니다.

모델이 학습 과정에서 스스로 만들어낸 representation이다.

즉:

```text
Raw Input
   ↓
Learned Feature
   ↓
Prediction
```

---

## 5.8 Universal Approximation Theorem — 언급만

충분한 크기의 neural network는 매우 다양한 함수를 근사할 수 있다는 이론이 있다.

하지만 중요한 점:

> **표현할 수 있다는 것과 실제로 잘 학습할 수 있다는 것은 다른 문제다.**

이후 CNN과 ResNet이 필요한 이유와 연결된다.

---

## 5.9 Backpropagation

MLP에는 여러 parameter가 있다.

\[
W_1,b_1,W_2,b_2
\]

Loss:

\[
L
\]

를 줄이려면 각 parameter에 대한 gradient가 필요하다.

Week 2의 chain rule을 계산 graph에 반복 적용한다.

```text
Loss
 ↑
Output
 ↑
Linear
 ↑
ReLU
 ↑
Linear
 ↑
Input
```

Loss에서 시작하여 gradient를 뒤로 전달한다.

이를 Backpropagation이라고 한다.

---

## 5.10 PyTorch Autograd

PyTorch에서는:

```python
loss.backward()
```

를 호출하면 계산 graph를 따라 gradient를 자동으로 계산한다.

각 parameter에는:

```python
parameter.grad
```

형태로 gradient가 저장된다.

---

## 5.11 매우 작은 PyTorch 모델

```python
import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(2, 8),
    nn.ReLU(),
    nn.Linear(8, 2)
)
```

이 코드를 외우는 것이 목적이 아니다.

각 줄이 어떤 수학적 block에 대응하는지 이해한다.

---

## Checkpoint

1. Linear layer를 여러 번 쌓아도 왜 여전히 linear한가?
2. Activation function이 필요한 이유는?
3. Hidden representation은 누가 만드는가?
4. Backpropagation은 무엇을 계산하는 과정인가?
5. `.backward()`는 무엇을 자동화하는가?

---

## 선택 과제

### [Check]

다음 모델에서 각 부분의 역할을 설명한다.

```python
nn.Linear(2, 8)
nn.ReLU()
nn.Linear(8, 2)
```

---

### [Apply] XOR MLP

Week 4의 XOR 데이터를 MLP로 분류한다.

사람이 polynomial feature를 추가하지 않아도 학습 가능한지 확인한다.

---

### [Explore] Activation 비교

같은 MLP에서 다음을 바꿔본다.

- ReLU
- Sigmoid
- Tanh

학습 속도와 loss curve를 비교한다.

---

## 이번 주 한 장 요약

```text
사람이 feature 설계
        ↓
Neural Network
        ↓
모델이 feature 학습

Linear
→ Nonlinearity
→ Linear
→ Prediction
```

---

## 다음 주 Preview

지금까지는 Neural Network의 구조를 만들었다.

하지만 실제 classification을 하려면 아직 여러 질문이 남아 있다.

> "여러 class 중 하나를 어떻게 출력하지?"  
> "학습 데이터를 어떻게 반복해서 보여주지?"  
> "학습 데이터만 외우면 어떻게 하지?"

---
