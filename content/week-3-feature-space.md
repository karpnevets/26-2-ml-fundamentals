---
title: Feature Space & Nonlinear Problems
week: 3
question: 직선 하나로 풀 수 없는 문제를 representation을 바꾸어 풀 수 있을까?
concepts:
  - Feature Space
  - Linear Separability
  - Feature Transformation
  - Polynomial Feature
  - XOR
estimated_time: 120–150 min
---
### 3.1 이번 주의 목표

Week 2에서는 linear classifier가:

\[
w^Tx+b=0
\]

이라는 하나의 hyperplane으로 feature space를 나눈다는 것을 배웠다.

이번 주에는 이 모델의 한계를 직접 만나고, **모델을 복잡하게 만들기 전에 데이터의 representation을 바꾸는 방법**을 배운다.

이 주차를 마치면 다음을 할 수 있어야 한다.

- feature space를 좌표 공간으로 설명할 수 있다.
- linear separability를 그림과 식으로 설명할 수 있다.
- XOR가 왜 원래 feature space에서 linearly separable하지 않은지 설명할 수 있다.
- feature transformation \(\phi(x)\)의 의미를 설명할 수 있다.
- polynomial feature가 decision boundary를 어떻게 바꾸는지 설명할 수 있다.
- "좋은 representation"이 왜 중요한지 설명할 수 있다.

---

### 3.2 Feature space란 무엇인가?

feature가 두 개라면 한 sample을:

\[
x=(x_1,x_2)
\]

라는 좌표로 볼 수 있다.

예를 들어:

```text
x₁ = 공부 시간
x₂ = 수면 시간
```

이면 학생 한 명은 2차원 평면의 한 점이 된다.

```text
x₂
^
|        • student B
|
|  • student A
|
+-----------------> x₁
```

이처럼 **feature를 좌표축으로 삼아 데이터를 놓은 공간**을 feature space라고 한다.

feature가 \(d\)개라면 feature space는 \(d\)차원이다.

---

### 3.3 Linear separability

두 class가 하나의 hyperplane으로 완전히 분리될 수 있다면 linearly separable하다고 한다.

2차원에서는 "직선 하나로 두 class를 나눌 수 있다"는 뜻이다.

```text
○ ○ ○       × × ×
○ ○         × ×
```

이런 데이터는 적절한:

\[
w^Tx+b=0
\]

를 찾으면 분리할 수 있다.

반대로 어떤 직선을 그어도 두 class가 섞인다면 linearly separable하지 않다.

---

## XOR 문제

### 3.4 XOR 데이터

다음 데이터가 있다고 하자.

| \(x_1\) | \(x_2\) | class |
|---:|---:|---:|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

평면에 놓으면:

```text
x₂
^
|   ● class 1      ○ class 0
|
|   ○ class 0      ● class 1
+----------------------------> x₁
```

같은 class가 대각선 방향으로 놓인다.

직선 하나로 두 ●와 두 ○를 완전히 분리할 수 없다.

중요한 점은 **perceptron을 더 오래 학습시키면 해결되는 문제가 아니라는 것**이다.

모델이 만들 수 있는 경계 자체가 직선 하나이기 때문이다.

---

### 3.5 문제를 보는 방식을 바꾸기

현재 feature는:

\[
(x_1,x_2)
\]

뿐이다.

새로운 feature를 추가해보자.

\[
x_3=x_1x_2
\]

그러면 각 sample은:

| \(x_1\) | \(x_2\) | \(x_3=x_1x_2\) | class |
|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 |
| 1 | 1 | 1 | 0 |

이 된다.

원래는 2차원 점이었지만 이제:

\[
(x_1,x_2,x_1x_2)
\]

라는 3차원 representation을 갖는다.

새 공간에서는 적절한 평면으로 두 class를 분리할 수 있다.

<details>
<summary>예시: 실제로 XOR를 분리하는 linear score 하나 찾기</summary>

다음 score를 생각하자.

\[
z=x_1+x_2-2x_1x_2-0.5
\]

각 점에서 계산하면:

```text
(0,0): z = -0.5
(0,1): z =  0.5
(1,0): z =  0.5
(1,1): z = -0.5
```

따라서 \(z>0\)을 class 1, \(z<0\)을 class 0으로 두면 XOR를 정확히 분류할 수 있다.

원래 공간에서는 nonlinear했던 구분이 새로운 feature space에서는 linear classifier 하나로 가능해졌다.

</details>

---

### 3.6 Feature transformation

일반적으로 원래 input \(x\)를 새로운 representation으로 바꾸는 함수를:

\[
\phi(x)
\]

라고 쓰자.

\[
x\longrightarrow\phi(x)
\]

이때 classifier는 원래 input이 아니라 transformed feature를 사용한다.

\[
z=w^T\phi(x)+b
\]

이 식은 이번 주의 핵심 수식이다.

중요한 해석:

> **linear classifier가 선형인 대상은 \(\phi(x)\)가 놓인 feature space다.**

원래 input space에서 보이는 decision boundary는 곡선일 수도 있다.

---

## 원형 데이터

### 3.7 원 안과 밖을 구분하기

다음 문제를 생각하자.

```text
× × × × × ×
×     ○     ×
×   ○ ○ ○   ×
×     ○     ×
× × × × × ×
```

중심에서 가까운 점은 ○, 먼 점은 ×라고 하자.

원래 좌표 \((x_1,x_2)\)에서 직선 하나로 원의 안과 밖을 완전히 나누기는 어렵다.

하지만 중심으로부터 거리와 관련된 feature를 만들 수 있다.

\[
r^2=x_1^2+x_2^2
\]

새 feature를:

\[
x_3=x_1^2+x_2^2
\]

라고 하자.

그러면 분류는 사실상:

\[
x_3<c
\]

인지 확인하는 문제로 바뀐다.

즉 새 feature space에서는 단순한 threshold 하나로 해결할 수 있다.

---

### 3.8 원래 공간의 nonlinear boundary

새 feature에서 linear score를:

\[
z=w_3x_3+b
\]

라고 하자.

\(x_3=x_1^2+x_2^2\)를 다시 대입하면:

\[
z=w_3(x_1^2+x_2^2)+b
\]

이고 boundary는:

\[
w_3(x_1^2+x_2^2)+b=0
\]

이다.

정리하면:

\[
x_1^2+x_2^2=-\frac{b}{w_3}
\]

이므로 원래 2차원 공간에서는 원 모양의 nonlinear boundary가 된다.

즉 feature transformation은 단순히 숫자를 늘리는 일이 아니라 **어떤 종류의 경계를 쉽게 만들 수 있는지 자체를 바꾼다.**

---

### 3.9 Polynomial features

원래 feature가 \(x_1,x_2\)일 때 다음과 같은 항을 추가할 수 있다.

\[
1,\quad x_1,\quad x_2,\quad x_1^2,\quad x_1x_2,\quad x_2^2
\]

2차 polynomial feature mapping의 한 예는:

\[
\phi(x_1,x_2)=
\begin{bmatrix}
1\\
x_1\\
x_2\\
x_1^2\\
x_1x_2\\
x_2^2
\end{bmatrix}
\]

이다.

이 representation 위에서 linear classifier를 사용하면 원래 공간에서는 2차 곡선 형태의 boundary를 만들 수 있다.

---

### 3.10 왜 아무 polynomial이나 계속 추가하지 않는가?

feature를 많이 추가하면 더 복잡한 pattern을 표현할 수 있다.

하지만 대가가 있다.

#### Dimension 증가

원래 feature 수보다 훨씬 많은 feature가 생긴다.

#### 계산량 증가

저장하고 계산해야 할 값이 늘어난다.

#### 사람이 설계해야 함

어떤 feature가 유용한지 사람이 미리 알아야 할 수 있다.

#### 너무 복잡한 representation

학습 데이터의 우연한 pattern까지 맞추기 쉬워질 수 있다.

이 마지막 문제는 Week 6의 overfitting과 연결된다.

---

### 3.11 Representation이라는 관점

같은 현실의 sample도 어떤 feature로 표현하느냐에 따라 학습 난이도가 달라진다.

예를 들어 이미지 한 장을 생각하자.

#### Representation A

```text
raw pixel values
```

#### Representation B

```text
edge
corner
texture
shape
```

어떤 representation에서는 classification이 매우 어려울 수 있고, 다른 representation에서는 단순한 classifier로도 쉬울 수 있다.

따라서 이번 주의 핵심 문장은 다음이다.

> **좋은 representation은 어려운 문제를 더 단순한 decision boundary로 바꿀 수 있다.**

---

### 3.12 사람이 feature를 설계하는 방식의 한계

원형 데이터에서는 우리가:

\[
x_1^2+x_2^2
\]

가 유용하다는 것을 쉽게 발견했다.

하지만 실제 이미지, 음성, 텍스트에서는 어떤 feature를 만들어야 하는지 훨씬 어렵다.

예를 들어 고양이 이미지를 분류한다고 해서 사람이 모든 경우에 통하는 "고양이 feature 공식"을 직접 쓰기는 어렵다.

이 문제 때문에 다음 질문이 생긴다.

> **feature transformation 자체를 모델이 데이터로부터 학습할 수는 없을까?**

이 질문이 Week 5의 MLP로 이어진다.

하지만 그 전에 하나가 더 필요하다.

모델이 feature를 스스로 학습하려면 parameter를 자동으로 조정하는 방법이 필요하다.

그 방법을 Week 4에서 배운다.

---

### 3.13 NumPy로 feature를 만드는 방식

예를 들어 sample들이:

```python
X = np.array([
    [0.0, 0.0],
    [0.0, 1.0],
    [1.0, 0.0],
    [1.0, 1.0]
])
```

라고 하자.

새 feature \(x_1x_2\)는:

```python
x1 = X[:, 0]
x2 = X[:, 1]

x3 = x1 * x2
```

로 만들 수 있다.

그리고 column으로 붙이면:

```python
X_new = np.column_stack([x1, x2, x3])
```

shape는:

```text
원래 X     : (4, 2)
변환 X_new : (4, 3)
```

이다.

이 코드는 feature transformation이 실제 데이터 배열의 shape를 바꾼다는 점을 보여준다.

---

## Checkpoint

1. feature space는 무엇인가?
2. linearly separable하다는 것은 무슨 뜻인가?
3. XOR가 원래 \((x_1,x_2)\) 공간에서 linear classifier로 풀리지 않는 이유는?
4. \(x\to\phi(x)\)는 무엇을 의미하는가?
5. transformed space에서 linear한 경계가 원래 공간에서는 nonlinear할 수 있는 이유는?
6. \(x_1^2+x_2^2\)가 원형 데이터에 적합한 feature인 이유는?
7. polynomial feature를 계속 늘리는 데에는 어떤 비용이 있는가?
8. 좋은 representation이 중요한 이유를 한 문장으로 설명해보자.

---

## 선택 과제

### [Check] XOR 표 완성

각 sample에 대해:

\[
x_3=x_1x_2
\]

를 계산해 새 표를 완성한다.

### [Check] 원형 boundary 유도

\[
z=2(x_1^2+x_2^2)-8
\]

에서 \(z=0\)인 boundary가 어떤 원인지 구한다.

### [Apply] Polynomial feature 설계

다음 중 하나의 pattern을 선택한다.

- 원 안/밖
- 포물선 위/아래
- XOR

어떤 polynomial feature를 추가하면 linear classifier로 쉽게 분리할 수 있을지 제안한다.

### [Apply] Shape 추적

\(N=100\)개의 sample과 feature 2개가 있다.

\[
\phi(x_1,x_2)=
(1,x_1,x_2,x_1^2,x_1x_2,x_2^2)
\]

로 바꾸면 transformed data matrix의 shape는 무엇인가?

### [Explore] Representation 비교

같은 dataset을 두 가지 서로 다른 feature representation으로 표현하고, 어떤 representation에서 decision boundary가 더 단순해지는지 그림과 함께 설명한다.

---

## 이번 주 한 장 요약

```text
원래 feature space
      ↓
linear classifier로 어려움
      ↓
Feature transformation φ(x)
      ↓
새로운 representation
      ↓
단순한 linear boundary로 해결 가능

핵심:
"문제의 난이도는 representation에 따라 달라진다."
```

## 다음 주 Preview

사람이 좋은 feature를 직접 만들 수 있다면 문제를 쉽게 만들 수 있다.

하지만 실제 문제에서는 어떤 feature가 좋은지 모르는 경우가 많다.

feature를 모델이 스스로 학습하게 하려면 parameter를 데이터에 맞춰 자동으로 조정해야 한다.

> **loss가 작아지는 방향으로 parameter를 움직이는 방법은 무엇일까?**
