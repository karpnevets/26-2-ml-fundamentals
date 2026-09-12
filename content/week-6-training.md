---
title: "Training & Generalization"
week: 6
question: "Neural Network를 실제로 어떻게 학습할까?"
concepts: ["Logit","Softmax","Cross-Entropy","Batch","Epoch","Generalization","Overfitting"]
estimated_time: "90–120 min"
---

---

## 6.1 Multi-Class Classification

예:

```text
cat
dog
bird
```

세 class 중 하나를 선택해야 한다.

모델은 다음처럼 score를 출력할 수 있다.

\[
z=
\begin{bmatrix}
2.1\\
-0.4\\
1.2
\end{bmatrix}
\]

이 값을 **logit**이라고 부른다.

---

## 6.2 Softmax

logit을 class별 probability처럼 해석할 수 있는 값으로 바꾼다.

\[
p_i
=
\frac{e^{z_i}}
{\sum_j e^{z_j}}
\]

결과는:

\[
0<p_i<1
\]

이며:

\[
\sum_i p_i=1
\]

이다.

---

## 6.3 Cross-Entropy

정답 class의 probability가 높아지도록 만들고 싶다.

정답 class가 \(y\)일 때:

\[
L=-\log p_y
\]

정답 probability가 높으면 Loss가 작다.

정답 probability가 낮으면 Loss가 크다.

---

## 6.4 실제 Training Loop

```python
for x, y in dataloader:
    prediction = model(x)
    loss = criterion(prediction, y)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
```

---

## 각 줄을 지금까지 배운 내용과 연결

### `prediction = model(x)`

Week 1:

```text
input → model → prediction
```

### `loss = criterion(...)`

Week 1:

```text
prediction vs target → loss
```

### `loss.backward()`

Week 2, 5:

```text
chain rule → gradient
```

### `optimizer.step()`

Week 2:

```text
gradient descent
```

이것이 전체 training이다.

---

## 6.5 Epoch

전체 training dataset을 한 번 다 사용하면 1 epoch이다.

예:

```text
Dataset 1000 samples

1 epoch
= 1000 samples를 모두 한 번 사용
```

---

## 6.6 Batch

1000개 sample을 한꺼번에 넣지 않고 나눈다.

예:

```text
batch size = 32
```

이면 32개씩 처리한다.

---

## 6.7 Train / Validation / Test

데이터를 세 부분으로 나눌 수 있다.

### Train
parameter를 학습하는 데 사용한다.

### Validation
hyperparameter 선택과 학습 상태 확인에 사용한다.

### Test
최종 모델의 generalization을 평가한다.

---

## 6.8 Generalization

우리가 원하는 것은:

> training data를 잘 맞히는 모델

이 아니라:

> **처음 보는 데이터에도 잘 작동하는 모델**

이다.

이를 generalization이라고 한다.

---

## 6.9 Overfitting

Training performance는 좋아지는데 validation/test performance가 나빠질 수 있다.

```text
Train Accuracy      ↑ ↑ ↑ ↑
Validation Accuracy ↑ ↑ ↓ ↓
```

모델이 training data의 세부적인 패턴을 지나치게 외운 상태를 overfitting이라고 한다.

---

## 6.10 Week 1의 질문으로 돌아가기

Week 1에서는:

> Loss가 낮으면 좋은 모델이라고 생각하자.

라고 했다.

이제 더 정확하게:

> **Training Loss가 낮다는 것만으로 좋은 모델이라고 할 수 없다. 새로운 데이터에서 잘 작동해야 한다.**

라고 수정한다.

---

## Checkpoint

1. Logit과 probability는 같은가?
2. Softmax는 어떤 역할을 하는가?
3. Cross-Entropy는 어떤 prediction을 좋아하는가?
4. Batch와 Epoch의 차이는?
5. Training loss가 낮아도 Test 성능이 나쁠 수 있는 이유는?

---

## 선택 과제

### [Check]

다음 예측 중 정답이 class 0일 때 어느 쪽의 Cross-Entropy loss가 더 작을지 설명한다.

```text
A: [0.9, 0.05, 0.05]
B: [0.4, 0.3, 0.3]
```

---

### [Apply] Training Loop 완성

빈칸을 채운다.

```python
for x, y in dataloader:
    pred = ______
    loss = ______

    optimizer.________
    loss.________
    optimizer.________
```

---

### [Explore] Overfitting 관찰

작은 training set으로 비교적 큰 MLP를 학습한다.

매 epoch마다:

```text
train loss
validation loss
```

를 기록하고 그래프로 그린다.

---

## 이번 주 한 장 요약

```text
Input
 ↓
Model
 ↓
Logits
 ↓
Cross-Entropy Loss
 ↓
Backpropagation
 ↓
Gradient Descent
 ↓
Parameter Update

그리고:
Train 성능 ≠ Generalization
```

---

## 다음 주 Preview

MLP는 이미지도 처리할 수 있다.

이미지를 긴 vector로 펼쳐서 넣으면 된다.

그런데:

> **"이미지라는 데이터가 가진 구조를 완전히 무시해도 괜찮을까?"**

---
