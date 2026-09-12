---
title: "Linear Classification"
week: 3
question: "여러 feature를 이용해 어떻게 경계를 만들까?"
concepts: ["Vector","Dot Product","Hyperplane","Perceptron"]
estimated_time: "90–120 min"
---

---

## 3.1 Feature가 여러 개라면

예를 들어 데이터 하나가:

```text
키 = 170
몸무게 = 65
```

라고 하자.

이를 하나로 묶어:

\[
x=
\begin{bmatrix}
170\\
65
\end{bmatrix}
\]

라고 표현한다.

이것이 vector다.

---

## 3.2 Vector

Vector는 여러 숫자를 순서대로 묶은 것이다.

\[
x=
\begin{bmatrix}
x_1\\
x_2\\
\vdots\\
x_d
\end{bmatrix}
\]

여기서 \(d\)는 feature의 개수다.

---

## 3.3 Weighted Sum

각 feature의 중요도를 다르게 주고 싶다고 하자.

\[
z=w_1x_1+w_2x_2+b
\]

이를 vector notation으로:

\[
z=w^Tx+b
\]

라고 쓴다.

---

## 3.4 Dot Product

\[
w^Tx
\]

는:

\[
w_1x_1+w_2x_2+\cdots+w_dx_d
\]

를 의미한다.

즉 여러 feature를 weight와 곱해 더한 값이다.

---

## 3.5 Classification

예를 들어:

\[
z=w^Tx+b
\]

를 계산한 뒤:

\[
z>0 \Rightarrow \text{Class A}
\]

\[
z<0 \Rightarrow \text{Class B}
\]

로 분류할 수 있다.

---

## 3.6 Decision Boundary

두 class가 갈리는 위치는:

\[
w^Tx+b=0
\]

이다.

2차원에서는 직선이다.

3차원에서는 평면이다.

더 높은 차원에서는 hyperplane이라고 부른다.

---

## 3.7 Hyperplane의 의미

중요한 것은 용어가 아니다.

> **Linear classifier는 feature space를 하나의 평평한 경계로 둘로 나눈다.**

이것이 핵심이다.

---

## 3.8 Perceptron

Perceptron은 linear classifier를 학습하는 고전적인 알고리즘이다.

prediction이 틀렸을 때 weight를 수정한다.

직관적으로:

```text
틀린 데이터 발견
   ↓
이 데이터를 맞히는 쪽으로 boundary 이동
```

---

## 3.9 Perceptron Update

label을:

\[
y\in\{-1,+1\}
\]

라고 하자.

잘못 분류한 경우:

\[
w\leftarrow w+\eta yx
\]

\[
b\leftarrow b+\eta y
\]

로 수정한다.

이번 주의 목적은 update rule을 외우는 것이 아니다.

> **오분류된 sample이 boundary의 방향을 바꾸도록 parameter를 수정한다.**

는 직관이 중요하다.

---

## 3.10 GD와 Perceptron은 같은가?

완전히 같은 알고리즘은 아니다.

하지만 큰 그림은 같다.

```text
현재 모델
   ↓
잘못된 정도 확인
   ↓
parameter 수정
   ↓
더 나은 prediction 시도
```

---

## Checkpoint

1. Vector가 왜 필요한가?
2. Dot Product는 무엇을 계산하는가?
3. \(w^Tx+b=0\)은 어떤 의미인가?
4. Hyperplane은 "고차원 공간의 직선 같은 것"이라고 이해해도 되는가?
5. Perceptron은 어떤 경우 weight를 수정하는가?

---

## 선택 과제

### [Check]

\[
w=
\begin{bmatrix}
2\\
-1
\end{bmatrix},
\quad
x=
\begin{bmatrix}
3\\
4
\end{bmatrix},
\quad
b=1
\]

일 때:

\[
w^Tx+b
\]

를 계산하고 class를 결정한다.

---

### [Apply] 2D Perceptron

NumPy를 사용하여 linearly separable한 2D 데이터를 분류한다.

학습 전후 decision boundary를 시각화한다.

---

### [Explore] Weight의 방향

\(w\) vector가 decision boundary와 어떤 기하학적 관계를 가지는지 조사하고 그림으로 설명한다.

---

## 이번 주 한 장 요약

```text
여러 feature
   ↓
Vector x
   ↓
Weighted Sum wᵀx+b
   ↓
Decision Boundary
   ↓
Linear Classification
```

---

## 다음 주 Preview

Linear classifier는 강력하지만 결정적인 한계가 있다.

> **"아무리 선을 잘 그어도 직선 하나로 나눌 수 없는 데이터는 어떻게 할까?"**

---
