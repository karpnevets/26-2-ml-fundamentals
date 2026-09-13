---
title: Vectors & Linear Classification
week: 2
question: 여러 feature를 이용해 어떻게 하나의 결정 경계를 만들까?
concepts:
  - Vector
  - Dot Product
  - Matrix Multiplication
  - Linear Classifier
  - Hyperplane
  - Perceptron
estimated_time: 120–150 min
---
### 2.1 이번 주의 목표

Week 1에서는 input을 거의 숫자 하나처럼 다뤘다. 실제 데이터는 여러 feature를 갖는다.

이번 주에는 여러 feature를 vector로 묶고, 이 vector를 이용해 **linear classifier가 어떤 방식으로 공간을 나누는지** 이해한다.

이 주차를 마치면 다음을 할 수 있어야 한다.

- vector와 dimension을 설명할 수 있다.
- dot product를 계산하고 weighted sum이라는 의미로 해석할 수 있다.
- matrix multiplication을 여러 dot product의 묶음으로 이해할 수 있다.
- \(w^Tx+b\)가 score를 만드는 식임을 설명할 수 있다.
- \(w^Tx+b=0\)이 decision boundary인 이유를 설명할 수 있다.
- weight vector \(w\)와 hyperplane의 기하학적 관계를 설명할 수 있다.
- perceptron의 update rule이 오분류된 sample을 기준으로 boundary를 어떻게 움직이는지 이해할 수 있다.

---

## 1. 여러 feature를 하나로 묶기

### 2.2 Vector

한 학생을 다음 두 feature로 표현한다고 하자.

```text
x₁ = 공부 시간
x₂ = 수면 시간
```

두 값을 하나로 묶으면:

\[
x=\begin{bmatrix}x_1\\x_2\end{bmatrix}
\]

처럼 쓸 수 있다.

이런 숫자의 순서 있는 묶음을 vector라고 한다.

일반적으로 feature가 \(d\)개라면:

\[
x=\begin{bmatrix}
x_1\\
x_2\\
\vdots\\
x_d
\end{bmatrix}\in\mathbb{R}^d
\]

라고 쓴다.

- \(d\): feature dimension
- \(x_i\): \(i\)번째 feature

---

### 2.3 Weight vector

각 feature가 prediction에 미치는 중요도를 다르게 주고 싶다고 하자.

\[
w=\begin{bmatrix}w_1\\w_2\\\vdots\\w_d\end{bmatrix}
\]

를 두고 다음 값을 계산한다.

\[
w_1x_1+w_2x_2+\cdots+w_dx_d
\]

각 feature를 해당 weight와 곱한 뒤 모두 더한다.

이것을 dot product로 짧게 쓸 수 있다.

\[
w^Tx=\sum_{j=1}^{d}w_jx_j
\]

이 수식은 이후 MLP의 linear layer까지 계속 등장하는 핵심 수식이므로 접지 않는다.

---

### 2.4 Dot Product를 숫자로 보기

예를 들어:

\[
x=\begin{bmatrix}2\\3\end{bmatrix},\qquad
w=\begin{bmatrix}4\\-1\end{bmatrix}
\]

이면:

\[
w^Tx=4\cdot2+(-1)\cdot3=5
\]

이다.

Python/NumPy에서는:

```python
import numpy as np

x = np.array([2.0, 3.0])
w = np.array([4.0, -1.0])

score = w @ x
```

처럼 쓸 수 있다.

---

### 2.5 Bias가 필요한 이유

score를:

\[
z=w^Tx+b
\]

라고 하자.

\(b\)는 bias다.

bias가 없다면 decision boundary는 항상 원점을 지나야 한다. bias를 추가하면 경계를 평행하게 이동시킬 수 있다.

1차원에서:

\[
z=wx+b
\]

이고 경계가 \(z=0\)인 위치는:

\[
x=-\frac{b}{w}
\]

이다.

즉 \(b\)가 변하면 경계 위치가 바뀐다.

---

## 2. Classification을 Score의 부호로 만들기

### 2.6 Linear classifier

binary classification을 생각하자.

모델이 먼저 score를 만든다.

\[
z=w^Tx+b
\]

그리고 score의 부호를 이용한다.

\[
\hat y=\begin{cases}
+1,&z\ge0\\
-1,&z<0
\end{cases}
\]

이 모델을 linear classifier라고 부른다.

왜 "linear"인가? class가 바뀌는 경계가 평평한 hyperplane이기 때문이다.

---

### 2.7 Decision boundary

class가 바뀌는 순간은 score가 0이 되는 곳이다.

\[
w^Tx+b=0
\]

이 식이 decision boundary다.

2차원에서는:

\[
w_1x_1+w_2x_2+b=0
\]

이고, 이는 직선이다.

3차원에서는 평면이며, 더 높은 차원에서는 hyperplane이라고 부른다.

따라서 핵심은:

> **linear classifier는 feature space를 하나의 평평한 경계로 나눈다.**

이다.

---

### 2.8 Weight vector는 경계에 수직이다

다음 경계를 생각하자.

\[
w^Tx+b=0
\]

경계 위의 두 점 \(x_a,x_b\)는 모두:

\[
w^Tx_a+b=0
\]

\[
w^Tx_b+b=0
\]

을 만족한다.

두 식을 빼면:

\[
w^T(x_a-x_b)=0
\]

이다.

즉 경계 위를 따라 움직이는 방향 \((x_a-x_b)\)과 \(w\)의 dot product가 0이다.

따라서 \(w\)는 decision boundary에 수직인 방향을 가리킨다.

이 사실은 hyperplane을 이해하는 데 매우 중요하므로 숨기지 않는다.

<details>
<summary>숫자 예시: 경계의 기울기 구하기</summary>

\[
2x_1-x_2+3=0
\]

이면:

\[
x_2=2x_1+3
\]

이다.

weight vector는:

\[
w=\begin{bmatrix}2\\-1\end{bmatrix}
\]

이다. 이 vector는 직선의 진행 방향이 아니라 직선에 수직인 normal vector다.

</details>

---

### 2.9 Score의 크기는 무엇을 뜻할까?

\[
z=w^Tx+b
\]

에서:

- \(z>0\): 한쪽 class
- \(z<0\): 반대 class
- \(z=0\): boundary 위

이다.

weight의 크기가 고정되어 있다는 조건 아래에서는 \(|z|\)가 클수록 boundary에서 더 멀리 있는 방향으로 해석할 수 있다.

정확한 signed distance는:

\[
\frac{w^Tx+b}{\|w\|}
\]

이다.

이 식 자체를 외울 필요는 없지만, **score의 부호는 어느 쪽에 있는지, 정규화된 score의 크기는 boundary와의 거리와 연결된다**는 직관을 갖는다.

---

## 3. 여러 sample을 한 번에 계산하기

### 2.10 Data matrix

sample이 여러 개라면 각 sample을 행으로 쌓을 수 있다.

\[
X=
\begin{bmatrix}
- & x_1^T & -\\
- & x_2^T & -\\
&\vdots&\\
- & x_N^T & -
\end{bmatrix}
\in\mathbb{R}^{N\times d}
\]

- \(N\): sample 수
- \(d\): feature 수

weight는:

\[
w\in\mathbb{R}^{d}
\]

이다.

모든 sample의 score를 한 번에 계산하면:

\[
z=Xw+b
\]

이다.

shape를 확인하면:

```text
X : (N, d)
w : (d,)
z : (N,)
```

이다.

---

### 2.11 Matrix multiplication을 "dot product 여러 개"로 이해하기

\[
Xw
\]

는 각 row \(x_i\)와 \(w\)의 dot product를 한 번에 계산한다.

\[
Xw=
\begin{bmatrix}
x_1^Tw\\
x_2^Tw\\
\vdots\\
x_N^Tw
\end{bmatrix}
\]

따라서 matrix multiplication을 처음부터 복잡한 규칙으로 외우기보다:

> **여러 dot product를 구조적으로 한 번에 계산하는 연산**

으로 이해한다.

<details>
<summary>예시: 작은 matrix multiplication 직접 계산</summary>

\[
X=
\begin{bmatrix}
1&2\\
3&4\\
5&6
\end{bmatrix},\qquad
w=
\begin{bmatrix}
2\\
-1
\end{bmatrix}
\]

이면:

\[
Xw=
\begin{bmatrix}
1\cdot2+2\cdot(-1)\\
3\cdot2+4\cdot(-1)\\
5\cdot2+6\cdot(-1)
\end{bmatrix}
=
\begin{bmatrix}
0\\2\\4
\end{bmatrix}
\]

이다.

</details>

---

## 4. Perceptron

### 2.12 왜 perceptron을 배우는가?

지금까지는 "이런 \(w,b\)가 있다면 분류할 수 있다"만 말했다.

이제 데이터로부터 \(w,b\)를 실제로 조정하는 가장 단순한 고전적 알고리즘을 하나 본다.

perceptron은 label을:

\[
y_i\in\{-1,+1\}
\]

로 둔다.

prediction이 맞으려면:

\[
y_i(w^Tx_i+b)>0
\]

이어야 한다.

왜냐하면:

- \(y_i=+1\)이면 score가 양수여야 하고
- \(y_i=-1\)이면 score가 음수여야 하기 때문이다.

---

### 2.13 Perceptron update

sample \((x_i,y_i)\)를 잘못 분류했다면:

\[
w\leftarrow w+\eta y_i x_i
\]

\[
b\leftarrow b+\eta y_i
\]

로 update한다.

여기서 \(\eta>0\)는 update 크기다.

#### \(y_i=+1\)인데 잘못 분류했다면

\[
w\leftarrow w+\eta x_i
\]

이므로 해당 sample의 방향을 score가 더 커지는 쪽으로 반영한다.

#### \(y_i=-1\)인데 잘못 분류했다면

\[
w\leftarrow w-\eta x_i
\]

이므로 해당 sample의 score를 더 작게 만드는 쪽으로 움직인다.

이 알고리즘은 **perceptron 자체의 규칙**으로 이해한다. 이 주차에서는 Gradient Descent와 억지로 연결하지 않는다.

---

### 2.14 Perceptron이 해결할 수 없는 경우

perceptron은 linear classifier다.

따라서 어떤 \(w,b\)를 선택해도 하나의 hyperplane으로만 공간을 나눈다.

데이터 자체가 하나의 hyperplane으로 분리될 수 없다면 perceptron update를 오래 반복한다고 해서 문제가 해결되지 않는다.

이 한계가 Week 3의 출발점이다.

---

### 2.15 NumPy 코드에서 shape 읽기

```python
import numpy as np

X = np.array([
    [2.0, 1.0],
    [1.0, 3.0],
    [-2.0, -1.0]
])

w = np.array([0.5, -1.0])
b = 0.2

scores = X @ w + b
pred = np.where(scores >= 0, 1, -1)
```

shape:

```text
X       : (3, 2)
w       : (2,)
scores  : (3,)
pred    : (3,)
```

이후 MLP에서도 **input dimension과 output dimension을 shape로 추적하는 습관**을 그대로 사용한다.

---

## Checkpoint

1. vector는 왜 필요한가?
2. \(w^Tx\)를 weighted sum이라고 부를 수 있는 이유는?
3. bias \(b\)가 없으면 decision boundary에 어떤 제약이 생기는가?
4. \(w^Tx+b=0\)이 왜 class가 바뀌는 경계인가?
5. weight vector \(w\)는 hyperplane과 어떤 방향 관계를 가지는가?
6. \(X\in\mathbb{R}^{N\times d}\)에서 \(N,d\)는 각각 무엇인가?
7. \(Xw\)를 여러 dot product로 설명해보자.
8. perceptron은 언제 parameter를 update하는가?
9. linearly separable하지 않은 데이터에서 perceptron을 계속 돌리면 왜 근본 문제가 남는가?

---

## 선택 과제

### [Check] Dot Product 계산

\[
w=\begin{bmatrix}2\\-1\\3\end{bmatrix},\qquad
x=\begin{bmatrix}4\\5\\-2\end{bmatrix}
\]

에 대해 \(w^Tx\)를 계산한다.

### [Check] Decision boundary 해석

\[
2x_1+x_2-4=0
\]

에 대해:

1. weight vector를 적는다.
2. bias를 적는다.
3. 점 \((0,0)\)의 score 부호를 구한다.
4. 점 \((2,1)\)의 score 부호를 구한다.

### [Apply] Matrix multiplication shape

다음 shape에서 결과 shape를 적는다.

```text
X: (100, 5)
w: (5,)
X @ w: ?
```

그리고 각 결과 원소가 무엇을 의미하는지 설명한다.

### [Apply] Perceptron 한 step

현재:

\[
w=\begin{bmatrix}0\\0\end{bmatrix},\quad b=0,\quad \eta=1
\]

이고 sample이:

\[
x=\begin{bmatrix}2\\1\end{bmatrix},\quad y=+1
\]

인데 오분류되었다고 하자.

update 후 \(w,b\)를 계산한다.

### [Explore] Weight와 boundary 시각화

2차원에서 여러 \(w,b\)를 직접 바꿔가며:

- \(w\) 방향
- decision boundary
- score가 양수인 영역

의 관계를 그림으로 정리한다.

---

## 이번 주 한 장 요약

```text
여러 feature
   ↓
Vector x
   ↓
Dot product wᵀx
   ↓
Score wᵀx+b
   ↓
Decision boundary wᵀx+b=0
   ↓
Linear Classification

여러 sample은 X라는 matrix로 쌓아
Xw로 한 번에 계산할 수 있다.
```

## 다음 주 Preview

linear classifier는 하나의 평평한 경계만 만들 수 있다.

그렇다면 다음 문제가 남는다.

> **아무리 boundary를 잘 움직여도 직선 하나로 나눌 수 없는 데이터는 어떻게 해야 할까?**
