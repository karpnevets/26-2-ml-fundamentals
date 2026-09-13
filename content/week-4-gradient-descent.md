---
title: 'Optimization, Gradient Descent & Chain Rule'
week: 4
question: 모델의 parameter를 loss가 작아지는 방향으로 어떻게 바꿀까?
concepts:
  - Derivative
  - Partial Derivative
  - Gradient
  - Gradient Descent
  - Learning Rate
  - Chain Rule
  - Computational Graph
estimated_time: 150–180 min
---
### 4.1 이번 주의 위치

Week 3의 결론은 분명했다.

> 좋은 representation을 가지면 문제를 쉽게 만들 수 있다.

다음 단계에서는 사람이 feature를 직접 만드는 대신 **모델이 feature transformation 자체를 학습하게** 만들고 싶다.

그러려면 먼저 다음 질문에 답해야 한다.

> **모델 내부의 parameter를 어떤 규칙으로 바꾸면 loss가 줄어드는가?**

이번 주는 Week 5의 MLP와 Backpropagation을 이해하기 위한 바로 직전 단계다.

---

### 4.2 Optimization 문제 다시 보기

Week 1에서 학습 목표를 다음처럼 썼다.

\[
\theta^*=\arg\min_\theta J(\theta)
\]

여기서:

- \(\theta\): 모델의 모든 parameter
- \(J(\theta)\): dataset에 대한 loss
- \(\theta^*\): loss를 작게 만드는 parameter

이다.

문제는 실제 neural network의 parameter가 수천, 수백만, 수십억 개일 수 있다는 점이다.

모든 조합을 직접 시험할 수 없다.

따라서 현재 parameter에서 **어느 방향으로 조금 움직이면 loss가 줄어드는지**를 알아내는 방법이 필요하다.

---

## 1. 미분은 왜 필요한가?

### 4.3 함수의 변화량

간단한 함수를 생각하자.

\[
f(w)=w^2
\]

\(w=2\)에서 \(w=2.1\)로 조금 움직이면:

\[
f(2)=4
\]

\[
f(2.1)=4.41
\]

함숫값이 증가한다.

반대로 \(w=2\)에서 \(w=1.9\)로 움직이면:

\[
f(1.9)=3.61
\]

함숫값이 감소한다.

즉 현재 위치에서 함수가 어느 방향으로 증가하거나 감소하는지 알 수 있다면 loss를 줄이는 데 사용할 수 있다.

---

### 4.4 평균 변화율에서 순간 변화율로

두 점 사이의 평균 기울기는:

\[
\frac{f(w+\Delta w)-f(w)}{\Delta w}
\]

이다.

\(\Delta w\)를 매우 작게 보내면 한 점에서의 순간적인 기울기를 얻는다.

\[
\frac{df}{dw}
=
\lim_{\Delta w\to0}
\frac{f(w+\Delta w)-f(w)}{\Delta w}
\]

이것이 derivative다.

이 정의 자체를 매번 계산에 사용할 필요는 없다. 중요한 의미는:

> **현재 위치에서 input을 조금 바꿨을 때 output이 어느 방향으로 얼마나 빠르게 변하는가**

이다.

---

### 4.5 derivative의 부호 읽기

loss를 \(L(w)\)라고 하자.

#### \(\frac{dL}{dw}>0\)

\(w\)를 증가시키면 loss가 증가하는 방향이다.

따라서 loss를 줄이려면 \(w\)를 감소시키는 쪽으로 가는 것이 자연스럽다.

#### \(\frac{dL}{dw}<0\)

\(w\)를 증가시키면 loss가 감소하는 방향이다.

따라서 \(w\)를 증가시키는 쪽으로 갈 수 있다.

#### \(\frac{dL}{dw}=0\)

현재 위치에서 1차적인 기울기가 0이다.

다만 이것이 반드시 global minimum이라는 뜻은 아니다. local minimum, local maximum, saddle point 등의 가능성이 있다.

---

## 2. Gradient Descent

### 4.6 가장 단순한 예

다음 loss를 생각하자.

\[
L(w)=(w-3)^2
\]

minimum은 \(w=3\)이다.

미분하면:

\[
\frac{dL}{dw}=2(w-3)
\]

현재 \(w=0\)이라면:

\[
\frac{dL}{dw}=2(0-3)=-6
\]

gradient가 음수다. 따라서 \(w\)를 증가시키는 쪽이 loss를 줄이는 방향이다.

---

### 4.7 Gradient Descent update rule

현재 위치에서 gradient의 반대 방향으로 조금 이동한다.

\[
w_{t+1}=w_t-\eta\frac{dL}{dw}(w_t)
\]

이 식은 핵심 수식이므로 항상 보이게 둔다.

각 항의 의미:

- \(w_t\): 현재 parameter
- \(\frac{dL}{dw}(w_t)\): 현재 위치에서의 loss 기울기
- \(\eta\): learning rate
- \(w_{t+1}\): update 후 parameter

`-`가 붙는 이유는 derivative가 **증가 방향**을 나타내므로 그 반대쪽으로 이동하기 위해서다.

---

### 4.8 한 step 직접 계산

\[
L(w)=(w-3)^2
\]

현재:

\[
w_0=0,\qquad \eta=0.1
\]

이면:

\[
\frac{dL}{dw}\bigg|_{w=0}=-6
\]

따라서:

\[
w_1=0-0.1(-6)=0.6
\]

새 위치 \(w=0.6\)의 loss는:

\[
L(0.6)=(-2.4)^2=5.76
\]

원래 loss:

\[
L(0)=9
\]

보다 작아졌다.

<details>
<summary>예시: 몇 step 더 계산해보기</summary>

\[
w_1=0.6
\]

에서 gradient는:

\[
2(0.6-3)=-4.8
\]

따라서:

\[
w_2=0.6-0.1(-4.8)=1.08
\]

같은 방식으로 반복하면 \(w\)는 3에 가까워진다.

</details>

---

### 4.9 Learning rate

\(\eta\)는 한 번에 얼마나 크게 움직일지를 정한다.

#### 너무 작으면

loss를 줄이기는 하지만 매우 느릴 수 있다.

#### 너무 크면

minimum을 지나쳐 반대편으로 크게 이동하고, 심하면 loss가 발산할 수 있다.

#### 적절하면

안정적으로 loss가 작은 영역으로 이동한다.

따라서 learning rate는 모델이 학습해서 정하는 parameter가 아니라 사람이 설정하는 **hyperparameter**다.

<details>
<summary>예시: 이차함수에서 너무 큰 learning rate</summary>

\[
L(w)=w^2
\]

이면:

\[
w_{t+1}=w_t-\eta(2w_t)=(1-2\eta)w_t
\]

\(\eta>1\)이면 \(|1-2\eta|>1\)이 되어 값의 크기가 오히려 커질 수 있다.

이 예시는 "learning rate가 크면 무조건 빨리 학습한다"가 아니라는 것을 보여준다.

</details>

---

## 3. Parameter가 여러 개라면?

### 4.10 Partial derivative

parameter가 \(w,b\) 두 개라면 loss는:

\[
L(w,b)
\]

처럼 두 변수의 함수다.

\(b\)를 고정하고 \(w\)만 조금 바꿨을 때의 변화율을:

\[
\frac{\partial L}{\partial w}
\]

라고 쓴다.

반대로 \(w\)를 고정하고 \(b\)를 바꾼 변화율은:

\[
\frac{\partial L}{\partial b}
\]

이다.

이를 partial derivative라고 한다.

---

### 4.11 Gradient vector

모든 parameter에 대한 partial derivative를 한 vector로 모으면 gradient다.

\[
\nabla_\theta L
=
\begin{bmatrix}
\frac{\partial L}{\partial \theta_1}\\
\frac{\partial L}{\partial \theta_2}\\
\vdots\\
\frac{\partial L}{\partial \theta_m}
\end{bmatrix}
\]

여기서 \(m\)은 parameter 개수다.

다변수 함수에서 gradient는 local하게 함수가 가장 빠르게 증가하는 방향을 가리킨다.

따라서 negative gradient는 가장 빠르게 감소하는 방향이다.

---

### 4.12 Vector 형태의 Gradient Descent

parameter 전체를 \(\theta\)로 묶으면:

\[
\theta_{t+1}
=
\theta_t-\eta\nabla_\theta J(\theta_t)
\]

가 된다.

앞의 1차원 update와 본질은 같다.

```text
1개 parameter:
현재 기울기의 반대 방향으로 이동

여러 parameter:
gradient vector의 반대 방향으로 이동
```

---

## 4. 모델과 loss가 연결되어 있을 때

### 4.13 우리가 실제로 미분하려는 대상

Week 1의 모델을 다시 가져오자.

\[
\hat y=wx+b
\]

loss를 편의를 위해:

\[
L=\frac12(\hat y-y)^2
\]

로 두자.

앞의 \(\frac12\)는 미분할 때 2가 상쇄되어 식이 간단해지도록 넣은 것이다. minimum 위치에는 영향을 주지 않는다.

우리가 원하는 것은:

\[
\frac{\partial L}{\partial w},\qquad
\frac{\partial L}{\partial b}
\]

이다.

하지만 loss는 \(w,b\)를 바로 사용하지 않는다.

```text
w,b
 ↓
ŷ = wx+b
 ↓
L = 1/2(ŷ-y)²
```

중간 계산을 거친다.

이때 chain rule이 필요하다.

---

## 5. Chain Rule

### 4.14 합성함수의 미분

\(z=g(x)\), \(y=f(z)\)라고 하자.

즉:

\[
x\rightarrow z\rightarrow y
\]

이다.

그러면:

\[
\frac{dy}{dx}
=
\frac{dy}{dz}
\frac{dz}{dx}
\]

이다.

이것이 chain rule이다.

해석하면:

> x가 z에 미치는 영향 × z가 y에 미치는 영향 = x가 y에 미치는 전체 영향

이다.

---

### 4.15 Linear model의 gradient를 끝까지 유도하기

다시:

\[
\hat y=wx+b
\]

\[
L=\frac12(\hat y-y)^2
\]

를 사용한다.

먼저 loss를 prediction에 대해 미분한다.

\[
\frac{\partial L}{\partial \hat y}=\hat y-y
\]

prediction을 \(w\)에 대해 미분하면:

\[
\frac{\partial \hat y}{\partial w}=x
\]

따라서 chain rule로:

\[
\frac{\partial L}{\partial w}
=
\frac{\partial L}{\partial \hat y}
\frac{\partial \hat y}{\partial w}
=(\hat y-y)x
\]

bias에 대해서는:

\[
\frac{\partial \hat y}{\partial b}=1
\]

이므로:

\[
\frac{\partial L}{\partial b}
=
\frac{\partial L}{\partial \hat y}
\frac{\partial \hat y}{\partial b}
=\hat y-y
\]

이 네 식은 Week 5의 Backpropagation으로 바로 연결되는 핵심이므로 접지 않는다.

---

### 4.16 실제 update까지 연결

이제 Gradient Descent를 적용하면:

\[
w\leftarrow w-\eta(\hat y-y)x
\]

\[
b\leftarrow b-\eta(\hat y-y)
\]

이다.

즉 하나의 training step은 다음 순서다.

```text
1. 현재 parameter로 prediction 계산
2. loss 계산
3. chain rule로 gradient 계산
4. gradient의 반대 방향으로 parameter update
```

이 구조가 neural network training에서도 그대로 유지된다.

<details>
<summary>숫자 예시: forward → gradient → update 전체 계산</summary>

\[
x=2,\quad y=5,\quad w=1,\quad b=0,\quad \eta=0.1
\]

#### Forward

\[
\hat y=1\cdot2+0=2
\]

\[
L=\frac12(2-5)^2=4.5
\]

#### Gradient

\[
\frac{\partial L}{\partial w}=(2-5)\cdot2=-6
\]

\[
\frac{\partial L}{\partial b}=2-5=-3
\]

#### Update

\[
w\leftarrow1-0.1(-6)=1.6
\]

\[
b\leftarrow0-0.1(-3)=0.3
\]

새 prediction은:

\[
1.6\cdot2+0.3=3.5
\]

으로 target 5에 더 가까워진다.

</details>

---

## 6. Computational graph

### 4.17 계산을 node로 나누어 보기

다음 계산:

\[
\hat y=wx+b
\]

\[
L=\frac12(\hat y-y)^2
\]

를 더 작은 연산으로 나누면:

```text
w ─┐
   × ──> wx ─┐
x ─┘         + ──> ŷ ──> subtract y ──> square ──> L
b ───────────┘
```

이런 구조를 computational graph라고 생각할 수 있다.

forward pass에서는 왼쪽에서 오른쪽으로 값을 계산한다.

gradient를 계산할 때는 오른쪽의 loss에서 시작해 왼쪽 parameter 쪽으로 영향도를 추적한다.

Week 5에서 이 과정을 여러 layer에 반복하면 **Backpropagation**이 된다.

---

### 4.18 Local derivative라는 생각

복잡한 계산 전체를 한 번에 미분하는 대신, 각 작은 연산의 local derivative만 알면 된다.

예:

#### 덧셈

\[
z=a+b
\]

이면:

\[
\frac{\partial z}{\partial a}=1,\qquad
\frac{\partial z}{\partial b}=1
\]

#### 곱셈

\[
z=ab
\]

이면:

\[
\frac{\partial z}{\partial a}=b,\qquad
\frac{\partial z}{\partial b}=a
\]

#### 제곱

\[
z=a^2
\]

이면:

\[
\frac{dz}{da}=2a
\]

Backpropagation은 이런 local derivative를 chain rule로 연결하는 과정이다.

---

## 7. Dataset 전체와 mini-batch

### 4.19 평균 loss의 gradient

Week 1에서:

\[
J(\theta)=\frac1N\sum_{i=1}^{N}\ell_i(\theta)
\]

를 배웠다.

미분은 합에 대해 분배되므로:

\[
\nabla_\theta J(\theta)
=
\frac1N\sum_{i=1}^{N}\nabla_\theta\ell_i(\theta)
\]

이다.

즉 dataset 전체 gradient는 sample별 gradient의 평균으로 볼 수 있다.

실제 training에서는 dataset 전체가 아니라 일부 sample의 mini-batch로 gradient를 근사해 update하는 경우가 많다.

이 부분은 Week 6에서 batch와 training loop를 다룰 때 다시 연결한다.

---

### 4.20 Gradient Descent가 항상 "좋은 모델"을 보장하는가?

아니다.

Gradient Descent가 직접 하는 일은:

> **현재 우리가 정의한 training objective를 local하게 줄이는 방향을 찾는 것**

이다.

다음은 별개의 문제다.

- loss function을 잘 설계했는가?
- optimization이 좋은 minimum에 도달했는가?
- training data에만 과하게 맞추지 않았는가?
- 새로운 data에서도 잘 작동하는가?

따라서 Gradient Descent를 "AI를 똑똑하게 만드는 공식"으로 이해하면 안 된다.

---

## 8. NumPy로 Gradient Descent 읽기

```python
w = 0.0
lr = 0.1

for step in range(20):
    loss = (w - 3) ** 2
    grad = 2 * (w - 3)

    w = w - lr * grad
```

수식과 1:1로 대응한다.

\[
w\leftarrow w-\eta\frac{dL}{dw}
\]

```text
w     ↔ parameter
lr    ↔ η
grad  ↔ dL/dw
```

코드를 외우는 것이 아니라 **수식이 코드에서 어떻게 나타나는지** 읽을 수 있어야 한다.

---

## Checkpoint

1. derivative는 어떤 정보를 주는가?
2. derivative가 양수일 때 왜 parameter를 줄이는 방향이 loss 감소 방향인가?
3. learning rate는 parameter인가 hyperparameter인가?
4. parameter가 여러 개일 때 gradient는 무엇인가?
5. \(\nabla L\)은 local하게 어떤 방향을 가리키는가?
6. chain rule은 왜 필요한가?
7. \(\hat y=wx+b\), \(L=\frac12(\hat y-y)^2\)일 때 \(\frac{\partial L}{\partial w}\)를 설명할 수 있는가?
8. computational graph의 forward와 backward 방향은 어떻게 다른가?
9. Gradient Descent가 test 성능 향상을 직접 보장하지 않는 이유는?

---

## 선택 과제

### [Check] derivative 부호 해석

어떤 지점에서:

\[
\frac{dL}{dw}=5
\]

이다.

loss를 줄이기 위해 \(w\)를 어느 방향으로 바꿔야 하는가?

### [Check] 한 step 계산

\[
L(w)=(w-4)^2,\quad w=1,\quad \eta=0.1
\]

에서 Gradient Descent 한 step을 계산한다.

### [Apply] Linear model gradient

\[
\hat y=wx+b
\]

\[
L=\frac12(\hat y-y)^2
\]

에 대해 \(\frac{\partial L}{\partial w}\), \(\frac{\partial L}{\partial b}\)를 chain rule로 다시 유도한다.

### [Apply] Learning rate 비교

\[
L(w)=w^2
\]

에서 다음 learning rate를 비교한다.

```text
0.01
0.1
0.9
1.1
```

어떤 값에서 느리게 수렴하고, oscillation하거나 발산하는지 관찰한다.

### [Explore] 2D loss surface

\[
L(w_1,w_2)=w_1^2+4w_2^2
\]

에 대해 gradient를 구하고:

\[
\nabla L=
\begin{bmatrix}
2w_1\\
8w_2
\end{bmatrix}
\]

가 각 위치에서 어느 방향을 가리키는지 그림으로 표시해본다.

---

## 이번 주 한 장 요약

```text
Loss J(θ)
   ↓ 미분
Gradient ∇θJ
   ↓ 반대 방향
θ ← θ - η∇θJ

그리고 모델의 계산이 여러 단계라면:

parameter
   ↓
intermediate values
   ↓
prediction
   ↓
loss

Chain Rule로 loss의 영향을
parameter까지 거꾸로 전달한다.
```

## 다음 주 Preview

이제 parameter를 loss가 작아지는 방향으로 움직일 수 있다.

Week 3에서 남긴 질문으로 돌아갈 수 있다.

> **사람이 feature를 직접 만들지 않고, 여러 linear transformation과 nonlinearity의 parameter를 Gradient Descent로 학습시키면 모델이 representation을 스스로 만들 수 있을까?**

다음 주에는 MLP와 Backpropagation을 배운다.
