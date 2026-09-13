---
title: "Classification Training & Generalization"
week: 6
question: "Neural Network를 실제 classification 문제에 어떻게 학습시키고 평가할까?"
concepts: ["Logit", "Softmax", "Cross-Entropy", "Mini-batch", "Epoch", "Optimizer", "Train/Validation/Test", "Generalization", "Overfitting"]
estimated_time: "150–180 min"
---

# Week 6 — Classification Training & Generalization

## 6.1 이번 주의 목표

Week 5까지는 neural network가 어떻게 prediction을 만들고, backpropagation으로 gradient를 계산하는지 배웠다.

이번 주에는 이를 실제 classification training으로 완성한다.

이 주차를 마치면 다음을 할 수 있어야 한다.

- logit이 무엇인지 설명할 수 있다.
- softmax가 logit을 어떻게 확률 형태로 바꾸는지 설명할 수 있다.
- cross-entropy가 정답 class의 probability와 어떤 관계인지 설명할 수 있다.
- batch, epoch, iteration의 차이를 설명할 수 있다.
- `zero_grad → forward → loss → backward → step` 순서를 설명할 수 있다.
- training/validation/test split의 역할을 구분할 수 있다.
- overfitting과 generalization을 설명할 수 있다.
- training loss가 낮다는 것과 좋은 모델이라는 것이 왜 완전히 같은 말이 아닌지 설명할 수 있다.

---

# 1. 여러 class 중 하나를 고르기

## 6.2 Multi-class classification

예를 들어 이미지를 다음 세 class 중 하나로 분류한다고 하자.

```text
cat
 dog
bird
```

MLP의 마지막 Linear layer가 3개의 숫자를 출력할 수 있다.

\[
z=
\begin{bmatrix}
z_1\\
z_2\\
z_3
\end{bmatrix}
\]

이 숫자들을 logit이라고 부른다.

예:

\[
z=
\begin{bmatrix}
2.1\\
-0.4\\
1.2
\end{bmatrix}
\]

logit은 아직 probability가 아니다.

- 음수일 수도 있고
- 합이 1일 필요도 없고
- 값의 범위 제한도 없다.

보통 prediction class는 가장 큰 logit의 index로 정할 수 있다.

\[
\hat y=\arg\max_i z_i
\]

---

## 6.3 왜 probability 형태가 유용한가?

다음 두 output을 비교해보자.

```text
A = [10, 9, 8]
B = [10, 0, -5]
```

둘 다 첫 번째 class의 logit이 가장 크다.

하지만 B가 첫 class를 훨씬 강하게 선호하는 것처럼 보인다.

이 상대적인 차이를 \(0\sim1\) 범위의 class probability처럼 표현하면 loss를 설계하기 편해진다.

---

# 2. Softmax

## 6.4 Softmax 정의

class \(i\)의 softmax probability는:

\[
p_i=rac{e^{z_i}}{\sum_{j=1}^{K}e^{z_j}}
\]

이다.

여기서 \(K\)는 class 수다.

softmax의 중요한 성질은:

\[
0<p_i<1
\]

그리고:

\[
\sum_{i=1}^{K}p_i=1
\]

이다.

따라서 \(p_i\)를 class probability처럼 해석할 수 있다.

---

## 6.5 왜 exponential을 사용할까?

\(e^{z_i}\)는 항상 양수다.

또 logit 차이를 강조한다.

예를 들어:

```text
z = [2, 1]
```

에서 exponential을 적용하면:

```text
[e², e¹]
```

가 되고 큰 logit이 상대적으로 더 큰 weight를 갖는다.

그 뒤 전체 합으로 나누어 합이 1이 되게 한다.

<details>
<summary>숫자 예시: [2, 1, 0]에 softmax 적용</summary>

대략:

\[
e^2\approx7.39,\quad e^1\approx2.72,\quad e^0=1
\]

합은:

\[
7.39+2.72+1=11.11
\]

따라서:

\[
p\approx[0.665,0.245,0.090]
\]

가 된다.

</details>

---

## 6.6 Softmax는 logit의 순서를 바꾸지 않는다

exponential은 단조 증가 함수이므로:

\[
z_a>z_b \Rightarrow e^{z_a}>e^{z_b}
\]

이다.

따라서 가장 큰 logit의 class와 가장 큰 softmax probability의 class는 같다.

prediction class를 얻기 위해 softmax를 반드시 계산해야 하는 것은 아니다.

---

# 3. Cross-Entropy

## 6.7 정답 class probability를 높이고 싶다

정답 class가 \(y\)라고 하자.

우리는 \(p_y\)가 1에 가까워지길 원한다.

가장 기본적인 multi-class cross-entropy loss는:

\[
L=-\log p_y
\]

이다.

이 식은 핵심 수식이므로 항상 보이게 둔다.

---

## 6.8 Cross-Entropy 값 읽기

정답 probability가 높으면:

\[
p_y\to1
\]

이고:

\[
-\log p_y\to0
\]

이다.

반대로 정답 probability가 매우 작으면:

\[
p_y\to0
\]

이고:

\[
-\log p_y\to\infty
\]

이다.

즉 정답 class에 낮은 probability를 준 confident mistake를 강하게 벌한다.

<details>
<summary>숫자 예시</summary>

정답 probability가:

```text
0.9 → loss ≈ 0.105
0.5 → loss ≈ 0.693
0.1 → loss ≈ 2.303
0.01 → loss ≈ 4.605
```

처럼 변한다.

</details>

---

## 6.9 One-hot 표현과 일반식

정답을 one-hot vector \(y\)로 쓰면:

\[
y=[0,1,0]
\]

처럼 나타낼 수 있다.

일반적인 cross-entropy는:

\[
L=-\sum_{i=1}^{K}y_i\log p_i
\]

이다.

one-hot에서는 정답 class만 \(y_i=1\)이므로 결국:

\[
L=-\log p_y
\]

와 같다.

---

## 6.10 Softmax + Cross-Entropy의 gradient

이 조합은 미분 결과가 깔끔하다.

logit \(z_i\)에 대해:

\[
\frac{\partial L}{\partial z_i}=p_i-y_i
\]

이다.

이 식은 classification training의 핵심 직관을 잘 보여준다.

- 정답 class: \(y_i=1\)이므로 \(p_i-1<0\), 해당 logit을 올리는 방향
- 오답 class: \(y_i=0\)이므로 \(p_i>0\), 해당 logit을 낮추는 방향

즉 gradient가 자연스럽게 **정답 score는 높이고 오답 score는 낮추는 방향**을 만든다.

<details>
<summary>왜 이 derivative가 나오는가?</summary>

softmax와 log를 직접 미분하면 얻을 수 있다. 전체 유도는 행렬 표기가 길어지므로 필수 학습 목표로 두지 않는다.

핵심은 결과:

\[
\nabla_z L=p-y
\]

를 해석할 수 있는 것이다.

</details>

---

# 4. PyTorch에서는 softmax를 직접 넣지 않는 경우

## 6.11 `CrossEntropyLoss`는 logits를 받는다

PyTorch의:

```python
criterion = nn.CrossEntropyLoss()
```

은 모델의 **raw logits**를 입력으로 받는다.

```python
logits = model(x)
loss = criterion(logits, y)
```

일반적인 multi-class classification에서는 loss를 계산하기 전에 직접:

```python
prob = torch.softmax(logits, dim=1)
```

을 넣지 않는다.

`CrossEntropyLoss` 내부에서 log-softmax와 negative log-likelihood에 해당하는 계산을 안정적인 방식으로 수행하기 때문이다.

prediction을 사람이 확인하고 싶을 때는 softmax를 별도로 계산할 수 있다.

---

# 5. Dataset, Batch, Epoch

## 6.12 Dataset 전체를 한 번에 쓰기 어려운 이유

데이터가 수백만 개라면 전체를 한 번에 GPU memory에 올리기 어렵다.

또 parameter update를 위해 매번 전체 dataset gradient를 계산하면 한 step의 비용이 매우 크다.

그래서 dataset을 작은 묶음으로 나누어 처리한다.

---

## 6.13 Mini-batch

한 번의 forward/backward에서 함께 처리하는 sample 묶음을 mini-batch라고 한다.

예:

```text
dataset size = 10,000
batch size   = 100
```

이면 한 epoch에 대략 100개의 batch를 처리한다.

입력 shape 예:

```text
X batch: (100, d)
y batch: (100,)
```

이미지에서는 이후:

```text
(N, C, H, W)
```

형태를 사용한다.

---

## 6.14 Batch loss

batch size가 \(B\)라면 보통 batch의 평균 loss를 사용한다.

\[
L_{batch}=\frac1B\sum_{i=1}^{B}\ell_i
\]

그리고:

\[
\nabla_\theta L_{batch}
\]

를 계산해 parameter를 update한다.

이는 전체 dataset gradient의 근사라고 볼 수 있다.

---

## 6.15 Epoch와 iteration

### Iteration / Step

mini-batch 하나로 한 번 parameter update를 수행하는 단위다.

### Epoch

training dataset 전체를 한 번 사용한 상태다.

예:

```text
training samples = 1000
batch size = 100
```

이면 한 epoch에 약 10개의 iteration이 있다.

---

# 6. 실제 training loop

## 6.16 전체 순서

PyTorch의 대표적인 training loop는 다음과 같다.

```python
for x, y in dataloader:
    optimizer.zero_grad()

    logits = model(x)
    loss = criterion(logits, y)

    loss.backward()
    optimizer.step()
```

이 코드는 지금까지 배운 개념을 모두 합친 것이다.

---

## 6.17 `optimizer.zero_grad()`

PyTorch는 기본적으로 gradient를 parameter의 `.grad`에 **누적**한다.

따라서 이전 batch의 gradient를 지우지 않으면 다음 batch gradient가 더해진다.

일반적인 training에서는 각 batch 전에:

```python
optimizer.zero_grad()
```

로 gradient buffer를 초기화한다.

---

## 6.18 `logits = model(x)`

forward pass다.

```text
input batch
 ↓
MLP / CNN
 ↓
logits
```

Week 5의 모델 계산이 그대로 들어간다.

---

## 6.19 `loss = criterion(logits, y)`

prediction과 target을 비교해 scalar loss를 만든다.

multi-class classification에서는 보통 cross-entropy를 사용한다.

---

## 6.20 `loss.backward()`

Backpropagation을 실행해 각 parameter의 gradient를 계산한다.

```text
loss
 ↑
output layer
 ↑
hidden layers
 ↑
parameters
```

---

## 6.21 `optimizer.step()`

계산된 gradient를 이용해 parameter를 update한다.

가장 단순한 SGD라면 개념적으로:

\[
\theta\leftarrow\theta-\eta\nabla_\theta L
\]

이다.

PyTorch optimizer는 이 update 로직을 담당한다.

---

## 6.22 한 training step을 문장으로 설명하기

다음 다섯 문장을 자연스럽게 말할 수 있어야 한다.

1. 이전 gradient를 초기화한다.
2. 현재 parameter로 prediction을 만든다.
3. prediction과 target으로 loss를 계산한다.
4. backpropagation으로 gradient를 계산한다.
5. optimizer가 parameter를 update한다.

---

# 7. SGD라는 이름

## 6.23 Full-batch Gradient Descent

전체 dataset을 사용해 gradient를 계산한다.

\[
\nabla J(\theta)
=
\frac1N\sum_{i=1}^{N}\nabla\ell_i
\]

## 6.24 Stochastic / Mini-batch Gradient Descent

작은 batch를 사용해 전체 gradient를 근사한다.

\[
\nabla L_B(\theta)
=
\frac1B\sum_{i\in B}\nabla\ell_i
\]

batch마다 sample 구성이 달라지므로 gradient에 noise가 생긴다.

실제 deep learning에서는 mini-batch training이 매우 일반적이다.

---

# 8. Training loss만 보면 안 되는 이유

## 6.25 우리는 무엇을 원하는가?

진짜 목표는:

> training dataset을 외우는 것

이 아니라:

> **처음 보는 데이터에서도 잘 작동하는 것**

이다.

이를 generalization이라고 한다.

---

## 6.26 Train / Validation / Test

데이터를 역할에 따라 나눈다.

### Training set

parameter를 update하는 데 사용한다.

### Validation set

model architecture, learning rate, epoch 수 같은 선택을 평가하는 데 사용한다.

### Test set

최종 선택이 끝난 뒤 generalization 성능을 평가한다.

핵심 원칙:

> test set을 반복적으로 보며 모델을 조정하면 test set도 사실상 model selection 과정에 사용된 것이 된다.

따라서 test set은 마지막 평가용으로 남겨두는 것이 기본 원칙이다.

---

## 6.27 Parameter와 Hyperparameter

### Parameter

training 과정에서 gradient로 학습된다.

예:

- Linear layer weight
- bias
- convolution kernel weight

### Hyperparameter

학습 절차나 모델 구조를 사람이 정한다.

예:

- learning rate
- batch size
- hidden dimension
- layer 수
- epoch 수

validation set은 이런 선택을 비교하는 데 사용한다.

---

# 9. Overfitting

## 6.28 전형적인 pattern

training이 진행되면서:

```text
Train Loss       ↓ ↓ ↓ ↓ ↓
Validation Loss  ↓ ↓ ↘ ↑ ↑
```

같은 상황이 생길 수 있다.

초반에는 일반적인 pattern을 배우지만, 이후 training data의 세부적인 noise나 우연한 특징까지 맞추면서 validation 성능이 나빠질 수 있다.

이를 overfitting이라고 한다.

---

## 6.29 Underfitting

반대로 training data조차 충분히 잘 맞히지 못하면 underfitting이라고 한다.

가능한 원인:

- model capacity가 너무 작음
- 충분히 학습하지 않음
- optimization이 잘 되지 않음
- feature가 부족함

따라서 단순히 validation 성능만 보고 원인을 하나로 단정해서는 안 된다.

---

## 6.30 Training / Validation curve 해석

### 둘 다 나쁨

```text
Train: poor
Val:   poor
```

underfitting 또는 optimization 문제 가능성.

### Train은 좋고 Val은 나쁨

```text
Train: very good
Val:   poor
```

overfitting 가능성.

### 둘 다 좋음

현재 split에서는 좋은 generalization을 보이고 있을 가능성이 높다.

---

# 10. Accuracy와 Loss

## 6.31 같은 accuracy라도 loss는 다를 수 있다

두 모델이 모두 정답 class를 맞혔다고 하자.

```text
Model A: 정답 probability 0.51
Model B: 정답 probability 0.99
```

둘 다 accuracy에서는 correct 1개다.

하지만 cross-entropy loss는 B가 훨씬 작다.

반대로 틀린 prediction에서도 confidence에 따라 loss가 다르다.

따라서 loss와 accuracy는 서로 다른 정보를 제공한다.

---

## 6.32 왜 학습은 accuracy가 아니라 differentiable loss를 사용하는가?

accuracy는 prediction class가 바뀌기 전까지 값이 그대로일 수 있다.

예:

```text
정답 class score가 조금 올라가도 argmax가 같으면 accuracy 변화 없음
```

gradient 기반 optimization에 필요한 매끄러운 신호를 주기 어렵다.

cross-entropy는 logit 변화에 따라 연속적으로 변하고 gradient를 제공한다.

그래서 학습 objective로 적합하다.

---

# 11. Evaluation mode의 기본

## 6.33 `model.train()`과 `model.eval()`

PyTorch에는 training과 evaluation에서 동작이 달라지는 layer가 있다.

대표적으로 BatchNorm과 Dropout이 그렇다.

따라서 일반적으로:

```python
model.train()
```

은 training mode,

```python
model.eval()
```

은 evaluation mode로 전환한다.

validation/test에서는 gradient 계산도 필요 없으므로:

```python
with torch.no_grad():
    ...
```

를 사용하는 경우가 많다.

이 코드는 Week 8의 BatchNorm을 이해할 때 다시 의미가 분명해진다.

---

# 12. Training 전체 흐름

## 6.34 하나의 epoch 구조

```python
for epoch in range(num_epochs):
    model.train()

    for x, y in train_loader:
        optimizer.zero_grad()
        logits = model(x)
        loss = criterion(logits, y)
        loss.backward()
        optimizer.step()

    model.eval()

    with torch.no_grad():
        for x, y in val_loader:
            logits = model(x)
            ...
```

이 코드를 세부 문법보다 큰 구조로 읽는다.

```text
Training phase
  → parameter update 있음

Validation phase
  → parameter update 없음
  → 현재 모델 성능 측정
```

---

# Checkpoint

1. logit과 probability는 어떻게 다른가?
2. softmax가 출력 합을 1로 만드는 방법을 설명할 수 있는가?
3. cross-entropy \(-\log p_y\)는 어떤 prediction을 선호하는가?
4. \(\partial L/\partial z_i=p_i-y_i\)를 정답 class와 오답 class에 대해 해석해보자.
5. PyTorch `CrossEntropyLoss`에 왜 raw logits를 넣는가?
6. batch와 epoch의 차이는?
7. `zero_grad()`가 필요한 이유는?
8. `backward()`와 `step()`은 각각 무엇을 하는가?
9. training/validation/test의 역할은 어떻게 다른가?
10. overfitting을 train/validation curve로 설명할 수 있는가?
11. accuracy 대신 differentiable loss가 필요한 이유는?

---

# 선택 과제

## [Check] Softmax 해석

다음 logit에서 prediction class를 먼저 softmax 없이 구한다.

```text
[1.2, 3.4, -0.5]
```

그 다음 왜 softmax를 적용해도 argmax class가 바뀌지 않는지 설명한다.

## [Check] Cross-Entropy 비교

정답 class probability가 다음일 때 loss 크기 순서를 적는다.

```text
0.95
0.60
0.20
0.01
```

## [Apply] Training loop 설명

다음 네 줄 각각이 어느 주차의 어떤 개념과 연결되는지 적는다.

```python
logits = model(x)
loss = criterion(logits, y)
loss.backward()
optimizer.step()
```

## [Apply] Batch 계산

training sample이 10,000개이고 batch size가 128이다.

한 epoch에 필요한 iteration 수를 계산한다. 마지막 batch 크기도 생각해본다.

## [Apply] Curve 진단

다음 상황을 각각 underfitting/overfitting/잘 학습된 가능성 중 어디에 가깝다고 볼지 설명한다.

```text
A. train acc 55%, val acc 53%
B. train acc 99%, val acc 72%
C. train acc 91%, val acc 89%
```

단, 이 숫자만으로 절대적인 결론을 내릴 수 없는 이유도 적는다.

## [Explore] Confidence와 loss

같은 accuracy를 가진 두 모델을 임의로 만들고 각 sample의 class probability를 다르게 설정한다.

cross-entropy 평균을 비교하여 accuracy가 같아도 loss가 달라질 수 있음을 보여준다.

---

# 이번 주 한 장 요약

```text
Input batch
  ↓
Model
  ↓
Logits
  ↓
Cross-Entropy Loss
  ↓
Backpropagation
  ↓
Gradient
  ↓
Optimizer update

반복:
mini-batch → iteration → epoch

평가:
Train / Validation / Test

목표:
training loss 최소화만이 아니라
새로운 data에 대한 generalization
```

# 다음 주 Preview

MLP는 어떤 숫자 vector든 처리할 수 있다.

그러면 이미지도 펼쳐서 vector로 넣으면 된다.

하지만 그렇게 하면 이미지가 가진 **공간적 구조**를 모델이 처음부터 다시 배워야 한다.

> **이미지에 이미 존재하는 구조를 architecture 자체에 반영하면 더 효율적으로 학습할 수 있지 않을까?**

다음 주에는 CNN과 inductive bias를 배운다.
