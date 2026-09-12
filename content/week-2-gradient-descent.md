---
title: "Gradient Descent"
week: 2
question: "좋은 parameter를 효율적으로 어떻게 찾을까?"
concepts: ["Derivative","Gradient","Learning Rate","Chain Rule"]
estimated_time: "90–120 min"
---

---

## 2.1 지난주에서 남은 문제

지난주에는 parameter를 여러 값으로 바꿔보았다.

하지만 parameter가 1억 개라면 가능한가?

아니다.

모든 경우를 시도하는 대신:

> **현재 위치에서 Loss가 어느 방향으로 내려가는지만 알면 되지 않을까?**

라는 아이디어를 사용한다.

---

## 2.2 함수와 그래프

예:

\[
L(w)=(w-3)^2
\]

Loss의 그래프:

```text
Loss
 ^
 |       /\
 |      /  \
 |     /    \
 |____/______\____> w
        3
```

정확한 그림은 U자 형태다.

현재 \(w=0\)이라면 오른쪽으로 이동해야 한다.

현재 \(w=5\)라면 왼쪽으로 이동해야 한다.

---

## 2.3 기울기

그래프 위 한 점에서의 slope를 생각한다.

- slope > 0: 오른쪽으로 갈수록 증가
- slope < 0: 오른쪽으로 갈수록 감소
- slope = 0: 평평한 지점

미분은 바로 이 **현재 위치에서의 순간적인 기울기**를 알려준다.

\[
\frac{dL}{dw}
\]

---

## 2.4 Gradient Descent

Loss를 줄이고 싶으므로 slope와 반대 방향으로 이동한다.

\[
w \leftarrow w - \eta \frac{dL}{dw}
\]

각 항의 의미:

- \(w\): 현재 parameter
- \(\frac{dL}{dw}\): 현재 위치의 slope
- \(\eta\): learning rate
- `-`: 올라가는 방향의 반대로 이동

---

## 2.5 실제 계산

\[
L(w)=(w-3)^2
\]

미분:

\[
\frac{dL}{dw}=2(w-3)
\]

현재:

\[
w=0
\]

이면:

\[
\frac{dL}{dw}=-6
\]

learning rate:

\[
\eta=0.1
\]

이면:

\[
w_{\text{new}}
=
0-0.1(-6)
=
0.6
\]

즉 0에서 3 방향으로 이동한다.

---

## 2.6 Learning Rate

### 너무 작으면

```text
0 → 0.1 → 0.2 → 0.3 → ...
```

안정적이지만 느리다.

### 적당하면

```text
0 → 1.2 → 2.1 → 2.7 → ...
```

빠르게 minimum으로 간다.

### 너무 크면

```text
0 → 8 → -4 → 12 → ...
```

minimum을 계속 넘어갈 수 있다.

---

## 2.7 여러 parameter가 있다면?

parameter가:

\[
w_1,w_2
\]

두 개라고 하자.

각 parameter가 Loss에 미치는 영향을 각각 계산한다.

\[
\frac{\partial L}{\partial w_1},
\qquad
\frac{\partial L}{\partial w_2}
\]

이를 하나로 묶은 것이 gradient다.

\[
\nabla L
=
\begin{bmatrix}
\frac{\partial L}{\partial w_1}\\
\frac{\partial L}{\partial w_2}
\end{bmatrix}
\]

따라서:

\[
\theta
\leftarrow
\theta-\eta\nabla_\theta L
\]

---

## 2.8 Chain Rule은 왜 필요한가?

모델은 보통 여러 계산을 연결한다.

\[
w
\rightarrow
\hat y
\rightarrow
L
\]

우리가 알고 싶은 것은:

\[
\frac{dL}{dw}
\]

이다.

그러나 Loss는 \(w\)를 직접 사용하지 않고 prediction \(\hat y\)를 통해 결정된다.

그래서:

\[
\frac{dL}{dw}
=
\frac{dL}{d\hat y}
\frac{d\hat y}{dw}
\]

이것이 chain rule이다.

---

## 2.9 Backpropagation의 예고

Neural Network에서는:

```text
w
↓
Linear
↓
Activation
↓
Linear
↓
Prediction
↓
Loss
```

처럼 계산이 길어진다.

하지만 핵심은 동일하다.

> **최종 Loss에서 시작하여 chain rule을 통해 parameter까지 영향도를 거꾸로 계산한다.**

Week 5에서 이를 Backpropagation이라는 이름으로 다시 만난다.

---

## Checkpoint

1. Gradient Descent가 왜 gradient의 반대 방향으로 이동하는가?
2. Learning Rate가 너무 크면 어떤 문제가 생길 수 있는가?
3. Chain Rule은 왜 필요한가?
4. `gradient = 0`이면 반드시 가장 좋은 parameter인가? 생각해보자.

---

## 선택 과제

### [Check]

\[
L(w)=(w-4)^2
\]

일 때:

\[
w=1,\qquad \eta=0.1
\]

한 번 Gradient Descent update를 수행한다.

---

### [Apply] GD 직접 구현

```python
w = -5
lr = 0.1

for step in range(20):
    loss = ...
    grad = ...
    w = ...
```

각 step의 \(w\)와 loss를 출력한다.

---

### [Explore] Learning Rate 비교

다음을 각각 실험한다.

```text
lr = 0.001
lr = 0.1
lr = 0.9
lr = 1.1
```

어떤 일이 일어나는지 그래프로 비교한다.

---

## 이번 주 한 장 요약

```text
현재 parameter
    ↓
Loss의 slope 계산
    ↓
slope 반대 방향으로 이동
    ↓
Loss 감소 시도

w ← w - η dL/dw
```

---

## 다음 주 Preview

지금까지는 input이 숫자 하나였다.

하지만 실제 데이터에는 여러 feature가 있다.

> **"여러 feature를 사용해서 데이터를 두 종류로 나누려면 어떻게 해야 할까?"**

---
