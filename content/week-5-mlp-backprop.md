---
title: 'MLP, Activation & Backpropagation'
week: 5
question: 모델이 feature transformation 자체를 학습하게 만들 수 있을까?
concepts:
  - Linear Layer
  - MLP
  - Activation
  - Sigmoid
  - Tanh
  - ReLU
  - Backpropagation
  - Autograd
estimated_time: 150–180 min
---
### 5.1 이번 주의 위치

Week 3에서는 사람이:

\[
x\rightarrow\phi(x)
\]

라는 feature transformation을 직접 설계했다.

Week 4에서는 parameter를 loss가 작아지는 방향으로 바꾸기 위해 Gradient Descent와 Chain Rule을 배웠다.

이제 두 흐름을 합친다.

> **여러 parameterized transformation을 연결하고 그 parameter를 Gradient Descent로 학습하면, 모델이 필요한 representation을 스스로 만들 수 있다.**

이것이 neural network의 가장 중요한 출발점이다.

---

## 1. Linear layer

### 5.2 하나의 neuron부터 시작하기

Week 2의 linear score는:

\[
z=w^Tx+b
\]

였다.

feature가 여러 개이고 output도 여러 개라면 weight vector 하나가 아니라 weight matrix를 사용한다.

\[
z=Wx+b
\]

이것을 linear layer 또는 affine transformation이라고 부른다.

엄밀히는 bias가 포함되므로 affine transformation이지만, deep learning에서는 보통 `Linear layer`라는 이름을 사용한다.

---

### 5.3 Shape로 Linear layer 읽기

input feature 수가 \(d_{in}\), output feature 수가 \(d_{out}\)이라면 한 가지 convention으로:

\[
x\in\mathbb{R}^{d_{in}}
\]

\[
W\in\mathbb{R}^{d_{out}\times d_{in}}
\]

\[
b\in\mathbb{R}^{d_{out}}
\]

이고:

\[
z=Wx+b\in\mathbb{R}^{d_{out}}
\]

이다.

예를 들어:

```text
input feature  : 2개
output feature : 4개
```

라면:

```text
x : (2,)
W : (4, 2)
b : (4,)
z : (4,)
```

이다.

PyTorch의 `nn.Linear(2, 4)`가 바로 이 역할을 한다.

---

### 5.4 Batch에서는 어떻게 보일까?

PyTorch에서는 sample을 row로 쌓아:

```text
X : (N, d_in)
```

형태로 다룬다.

`nn.Linear(d_in, d_out)`을 통과하면:

```text
output : (N, d_out)
```

이 된다.

즉 Linear layer는 **마지막 feature dimension을 다른 dimension으로 바꾸는 연산**이라고 생각할 수 있다.

---

## 2. Linear layer를 여러 번 쌓으면 충분할까?

### 5.5 두 Linear layer의 합성

bias를 잠시 생략하자.

\[
h=W_1x
\]

\[
y=W_2h
\]

이면:

\[
y=W_2W_1x
\]

이다.

여기서:

\[
W'=W_2W_1
\]

라고 두면:

\[
y=W'x
\]

가 된다.

즉 Linear layer를 여러 개 쌓아도 중간에 다른 종류의 연산이 없다면 **전체는 여전히 하나의 linear transformation**과 같다.

bias까지 포함해도 affine transformation 여러 개의 합성은 다시 affine transformation이다.

따라서 Week 3의 XOR 같은 nonlinear problem을 해결하려면 중간에 nonlinearity가 필요하다.

---

## 3. Activation function

### 5.6 Activation이 하는 일

Linear layer 뒤에 nonlinear function \(\sigma\)를 적용한다.

\[
h=\sigma(Wx+b)
\]

그러면 여러 layer를 쌓았을 때 전체 모델을 단순한 하나의 matrix multiplication으로 합칠 수 없게 된다.

이 nonlinearity 덕분에 neural network는 복잡한 nonlinear function을 표현할 수 있다.

---

### 5.7 Sigmoid

sigmoid는:

\[
\sigma(x)=\frac{1}{1+e^{-x}}
\]

이다.

출력 범위는:

\[
0<\sigma(x)<1
\]

이다.

큰 양수는 1에 가까워지고, 큰 음수는 0에 가까워진다.

미분은:

\[
\sigma'(x)=\sigma(x)(1-\sigma(x))
\]

이다.

sigmoid는 probability 형태의 output이 필요할 때 특정 상황에서 유용하지만, hidden layer activation으로는 큰 \(|x|\) 영역에서 gradient가 매우 작아지는 saturation 문제가 있다.

예를 들어 \(x\gg0\)이면 \(\sigma(x)\approx1\)이고:

\[
\sigma'(x)\approx0
\]

이 된다.

---

### 5.8 Tanh

\[
\tanh(x)=\frac{e^x-e^{-x}}{e^x+e^{-x}}
\]

출력 범위는:

\[
-1<\tanh(x)<1
\]

이다.

미분은:

\[
\frac{d}{dx}\tanh(x)=1-\tanh^2(x)
\]

이다.

sigmoid와 달리 0을 중심으로 대칭이지만, 큰 양수/음수 영역에서 derivative가 0에 가까워지는 saturation은 여전히 존재한다.

---

### 5.9 ReLU

ReLU는:

\[
\operatorname{ReLU}(x)=\max(0,x)
\]

이다.

즉:

\[
\operatorname{ReLU}(x)=
\begin{cases}
0,&x<0\\
x,&x\ge0
\end{cases}
\]

이다.

미분은 \(x\neq0\)에서:

\[
\operatorname{ReLU}'(x)=
\begin{cases}
0,&x<0\\
1,&x>0
\end{cases}
\]

이다.

\(x=0\)에서는 수학적으로 미분 가능하지 않지만 실제 구현에서는 특정 convention을 정해 처리한다.

#### ReLU의 장점

양수 영역에서는 derivative가 1이므로 sigmoid/tanh처럼 양수 값이 커졌다고 derivative가 자동으로 0에 가까워지지는 않는다.

계산도 단순하다.

#### ReLU의 한계

입력이 계속 음수인 unit은 gradient가 0이 되어 update가 어려워질 수 있다. 이를 흔히 dead ReLU 문제라고 부른다.

---

### 5.10 세 activation 비교

| Activation | 출력 범위 | 장점 | 주의점 |
|---|---|---|---|
| Sigmoid | \((0,1)\) | 확률형 output에 자연스러움 | saturation, hidden layer에서 gradient 약화 가능 |
| Tanh | \((-1,1)\) | 0 중심 출력 | saturation |
| ReLU | \([0,\infty)\) | 단순하고 양수 영역 gradient가 1 | 음수 영역 gradient 0 |

이번 과정의 MLP에서는 ReLU를 기본 activation으로 사용한다.

---

## 4. MLP

### 5.11 한 hidden layer MLP

가장 단순한 MLP를 다음처럼 쓸 수 있다.

\[
z_1=W_1x+b_1
\]

\[
h=\operatorname{ReLU}(z_1)
\]

\[
z_2=W_2h+b_2
\]

여기서:

- \(x\): input representation
- \(z_1\): 첫 Linear layer의 pre-activation
- \(h\): hidden representation
- \(z_2\): output score

이다.

구조는:

```text
Input x
  ↓
Linear (W₁,b₁)
  ↓
z₁
  ↓
ReLU
  ↓
h
  ↓
Linear (W₂,b₂)
  ↓
Output z₂
```

이다.

---

### 5.12 Hidden representation은 무엇인가?

Week 3에서는 사람이 \(\phi(x)\)를 정했다.

MLP에서는:

\[
h=\operatorname{ReLU}(W_1x+b_1)
\]

의 \(W_1,b_1\)가 학습된다.

따라서 hidden representation \(h\)를 만드는 방식 자체가 데이터와 loss에 맞게 바뀐다.

이 점이 핵심이다.

```text
Week 3
x ──[사람이 만든 φ]──> φ(x)

Week 5
x ──[학습되는 W,b + activation]──> h
```

즉 neural network는 **representation learning**을 수행한다고 볼 수 있다.

---

### 5.13 Layer를 여러 개 쌓으면

예를 들어:

\[
h_1=\operatorname{ReLU}(W_1x+b_1)
\]

\[
h_2=\operatorname{ReLU}(W_2h_1+b_2)
\]

\[
z=W_3h_2+b_3
\]

처럼 구성할 수 있다.

각 layer의 output이 다음 layer의 input representation이 된다.

중요한 점은 단순히 "깊으면 좋다"가 아니다. layer가 깊어질수록 optimization과 gradient 전달 문제가 생길 수 있다. 이 문제는 Week 8의 ResNet으로 이어진다.

---

## 5. Forward pass

### 5.14 Forward pass란?

현재 parameter가 정해져 있을 때 input에서 output과 loss까지 값을 계산하는 과정을 forward pass라고 한다.

예:

\[
z_1=W_1x+b_1
\]

\[
h=\operatorname{ReLU}(z_1)
\]

\[
\hat y=W_2h+b_2
\]

\[
L=\ell(\hat y,y)
\]

즉:

```text
input
 ↓
layer 1
 ↓
activation
 ↓
layer 2
 ↓
prediction
 ↓
loss
```

이다.

이때 아직 parameter를 바꾸지 않는다. 먼저 현재 parameter에서 어떤 prediction과 loss가 나오는지 계산한다.

---

## 6. Backpropagation

### 5.15 Backpropagation은 무엇을 계산하는가?

Gradient Descent를 하려면 모든 parameter에 대해:

\[
\frac{\partial L}{\partial W_1},
\frac{\partial L}{\partial b_1},
\frac{\partial L}{\partial W_2},
\frac{\partial L}{\partial b_2}
\]

가 필요하다.

Backpropagation은 **loss에서 시작하여 computational graph를 거꾸로 따라가며 chain rule을 효율적으로 적용해 이 gradient들을 계산하는 알고리즘**이다.

중요:

> Backpropagation 자체가 parameter를 update하는 것은 아니다.

역할을 구분하면:

```text
Forward pass      : prediction과 loss 계산
Backpropagation   : gradient 계산
Optimizer step    : gradient를 사용해 parameter update
```

이다.

---

### 5.16 Scalar MLP로 Backpropagation 전체 보기

matrix 미분 전에 scalar version으로 구조를 이해하자.

\[
z_1=w_1x+b_1
\]

\[
h=\operatorname{ReLU}(z_1)
\]

\[
\hat y=w_2h+b_2
\]

\[
L=\frac12(\hat y-y)^2
\]

목표는 \(w_1,b_1,w_2,b_2\)에 대한 gradient를 구하는 것이다.

#### Step 1. Loss → prediction

\[
\frac{\partial L}{\partial \hat y}=\hat y-y
\]

#### Step 2. prediction → second layer

\[
\frac{\partial \hat y}{\partial w_2}=h
\]

따라서:

\[
\frac{\partial L}{\partial w_2}
=
(\hat y-y)h
\]

bias는:

\[
\frac{\partial \hat y}{\partial b_2}=1
\]

이므로:

\[
\frac{\partial L}{\partial b_2}=\hat y-y
\]

#### Step 3. prediction → hidden representation

\[
\frac{\partial \hat y}{\partial h}=w_2
\]

따라서:

\[
\frac{\partial L}{\partial h}
=
(\hat y-y)w_2
\]

#### Step 4. ReLU를 통과하기

\[
h=\operatorname{ReLU}(z_1)
\]

이므로:

\[
\frac{\partial L}{\partial z_1}
=
\frac{\partial L}{\partial h}
\operatorname{ReLU}'(z_1)
\]

즉:

\[
\frac{\partial L}{\partial z_1}
=
(\hat y-y)w_2\operatorname{ReLU}'(z_1)
\]

#### Step 5. first layer parameter까지 전달

\[
\frac{\partial z_1}{\partial w_1}=x
\]

이므로:

\[
\frac{\partial L}{\partial w_1}
=
(\hat y-y)w_2\operatorname{ReLU}'(z_1)x
\]

그리고:

\[
\frac{\partial L}{\partial b_1}
=
(\hat y-y)w_2\operatorname{ReLU}'(z_1)
\]

이다.

이 과정이 바로 **loss에서 뒤로 한 단계씩 local derivative를 곱해 나가는 것**이다.

---

### 5.17 "gradient가 흐른다"는 표현의 의미

다음 graph를 생각하자.

```text
x
 ↓
Linear 1
 ↓
z₁
 ↓
ReLU
 ↓
h
 ↓
Linear 2
 ↓
ŷ
 ↓
Loss
```

forward에서는 위에서 아래로 값을 계산한다.

backward에서는 loss의 변화가 각 중간 변수와 parameter에 얼마나 영향을 받는지 거꾸로 계산한다.

```text
Loss
 ↑
∂L/∂ŷ
 ↑
∂L/∂h
 ↑
∂L/∂z₁
 ↑
∂L/∂W₁, ∂L/∂b₁
```

"gradient가 흐른다"는 말은 실제 물질이 흐르는 것이 아니라 **chain rule에 의해 derivative 정보가 computational graph를 따라 전달된다**는 뜻이다.

---

### 5.18 ReLU가 gradient를 막는 경우

\(z_1<0\)이면:

\[
\operatorname{ReLU}'(z_1)=0
\]

이다.

그러면:

\[
\frac{\partial L}{\partial z_1}=0
\]

이고 해당 경로를 통해 앞쪽 parameter로 전달되는 gradient도 0이 된다.

반면 \(z_1>0\)이면:

\[
\operatorname{ReLU}'(z_1)=1
\]

이다.

따라서 activation의 derivative는 단순한 수학 부록이 아니라 **backpropagation에서 gradient가 어떻게 전달되는지 직접 결정하는 요소**다.

---

## 7. Vanishing / Exploding Gradient의 기본 직관

### 5.19 Chain rule의 곱이 길어지면

깊은 network에서는 gradient에 여러 derivative가 곱해진다.

개념적으로:

\[
\frac{\partial L}{\partial h_1}
=
\frac{\partial L}{\partial h_L}
\prod_{k=2}^{L}
\frac{\partial h_k}{\partial h_{k-1}}
\]

처럼 생각할 수 있다.

#### 작은 값이 반복해서 곱해지면

예:

\[
0.5^{10}\approx0.00098
\]

gradient가 매우 작아질 수 있다.

이를 vanishing gradient라고 한다.

#### 큰 값이 반복해서 곱해지면

예:

\[
2^{10}=1024
\]

gradient가 매우 커질 수 있다.

이를 exploding gradient라고 한다.

실제 neural network는 단순한 scalar 곱보다 복잡하지만, chain rule의 반복이 gradient 규모에 큰 영향을 준다는 직관은 중요하다.

이 문제는 Week 8에서 deep network와 ResNet을 이해할 때 다시 사용한다.

---

## 8. Matrix 형태의 Backpropagation은 어떻게 생각할까?

### 5.20 원리는 scalar와 동일하다

실제 MLP에서는:

\[
z=Wx+b
\]

처럼 vector와 matrix를 사용한다.

미분 결과도 matrix와 vector가 된다.

예를 들어 한 layer에서 upstream gradient를:

\[
g_z=\frac{\partial L}{\partial z}
\]

라고 하면, single sample에 대해:

\[
\frac{\partial L}{\partial W}=g_zx^T
\]

\[
\frac{\partial L}{\partial b}=g_z
\]

\[
\frac{\partial L}{\partial x}=W^Tg_z
\]

형태가 된다.

이 세 식은 Linear layer backward의 핵심이다.

의미:

- \(\partial L/\partial W\): weight를 어떻게 바꿔야 하는가
- \(\partial L/\partial b\): bias를 어떻게 바꿔야 하는가
- \(\partial L/\partial x\): 이전 layer로 gradient를 어떻게 전달하는가

<details>
<summary>왜 \(\partial L/\partial W=g_zx^T\) 꼴이 되는가?</summary>

각 output component는:

\[
z_i=\sum_jW_{ij}x_j+b_i
\]

이다.

따라서:

\[
\frac{\partial z_i}{\partial W_{ij}}=x_j
\]

이고 chain rule로:

\[
\frac{\partial L}{\partial W_{ij}}
=
\frac{\partial L}{\partial z_i}x_j
\]

이다.

모든 \(i,j\)에 대해 모으면 outer product:

\[
g_zx^T
\]

가 된다.

</details>

---

## 9. PyTorch Autograd

### 5.21 왜 자동 미분이 필요한가?

실제 network의 parameter가 수백만 개라면 모든 derivative를 사람이 직접 전개할 수 없다.

PyTorch는 forward 계산을 추적하고 computational graph를 만든 뒤 자동으로 gradient를 계산한다.

예:

```python
import torch

w = torch.tensor(1.0, requires_grad=True)
x = torch.tensor(2.0)
y = torch.tensor(5.0)

prediction = w * x
loss = 0.5 * (prediction - y) ** 2

loss.backward()

print(w.grad)
```

`requires_grad=True`는 이 tensor에 대한 gradient를 추적하겠다는 뜻이다.

`loss.backward()`를 호출하면:

\[
\frac{\partial L}{\partial w}
\]

가 계산되어 `w.grad`에 저장된다.

---

### 5.22 `backward()`는 update가 아니다

다시 강조한다.

```python
loss.backward()
```

는 gradient를 **계산**한다.

parameter update는 optimizer가 한다.

```python
optimizer.step()
```

전체 역할:

```text
model(x)          → forward
loss_fn(...)      → loss
loss.backward()   → gradient 계산
optimizer.step()  → parameter update
```

Week 6에서 이 네 단계를 실제 training loop로 묶는다.

---

## 10. PyTorch에서 MLP 읽기

### 5.23 `nn.Sequential`

```python
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(2, 8),
    nn.ReLU(),
    nn.Linear(8, 3)
)
```

shape를 따라가면:

```text
input     : (N, 2)
Linear    : (N, 8)
ReLU      : (N, 8)
Linear    : (N, 3)
output    : (N, 3)
```

마지막 3개 값은 예를 들어 3개의 class score가 될 수 있다.

Week 6에서 이를 logit이라고 부른다.

---

### 5.24 `nn.Module` 형태 읽기

조금 더 일반적인 PyTorch 모델은 다음처럼 보인다.

```python
class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(2, 8)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(8, 3)

    def forward(self, x):
        x = self.fc1(x)
        x = self.relu(x)
        x = self.fc2(x)
        return x
```

처음 보는 문법이 많아 보여도 ML 관점에서는 다음만 읽으면 된다.

```text
__init__  : 어떤 layer를 가지고 있는가?
forward   : 그 layer를 어떤 순서로 적용하는가?
```

즉 architecture를 읽을 때 Python 객체지향 문법보다 **data flow**를 먼저 본다.

---

## 11. MLP가 XOR를 해결하는 직관

### 5.25 사람이 feature를 만들지 않아도 되는 이유

Week 3에서는 XOR를 위해 직접:

\[
x_1x_2
\]

같은 feature를 만들었다.

MLP는 hidden layer에서:

\[
h=\operatorname{ReLU}(W_1x+b_1)
\]

라는 learned transformation을 만든다.

여러 hidden unit은 input space를 서로 다른 방향의 linear boundary로 나누고 ReLU를 통해 조각별 nonlinear representation을 만든다.

그 representation 위에서 마지막 Linear layer가 class를 구분한다.

즉:

```text
원래 공간에서 직선 하나로 불가능
        ↓
hidden layer가 representation 변환
        ↓
새 representation에서 마지막 linear layer가 분류
```

라는 구조다.

---

## Checkpoint

1. \(z=Wx+b\)에서 각 항의 shape를 설명할 수 있는가?
2. Linear layer만 여러 개 쌓아도 전체가 linear인 이유는?
3. activation function이 필요한 이유는?
4. sigmoid와 tanh에서 saturation이 무엇을 의미하는가?
5. ReLU의 derivative는 gradient 전달에 어떤 영향을 주는가?
6. hidden representation은 누가 결정하는가?
7. forward pass와 backpropagation의 역할은 어떻게 다른가?
8. backpropagation과 Gradient Descent는 같은 과정인가?
9. scalar MLP에서 \(\partial L/\partial w_1\)까지 gradient가 전달되는 경로를 말로 설명할 수 있는가?
10. vanishing gradient가 chain rule의 반복과 연결되는 이유는?
11. PyTorch에서 `loss.backward()`와 `optimizer.step()`의 역할은 어떻게 다른가?

---

## 선택 과제

### [Check] Shape 추적

```python
model = nn.Sequential(
    nn.Linear(5, 12),
    nn.ReLU(),
    nn.Linear(12, 4)
)
```

batch size가 32일 때 각 layer output shape를 적는다.

### [Check] Activation derivative

다음 입력에서 ReLU output과 derivative를 적는다.

```text
x = -2
x = 0.5
x = 3
```

### [Apply] Backprop 손계산

다음 scalar network를 사용한다.

\[
z_1=w_1x+b_1
\]

\[
h=\operatorname{ReLU}(z_1)
\]

\[
\hat y=w_2h+b_2
\]

\[
L=\frac12(\hat y-y)^2
\]

값을:

```text
x=2, y=1
w₁=1, b₁=0
w₂=2, b₂=0
```

로 두고 forward 값과 네 parameter gradient를 계산한다.

### [Apply] PyTorch gradient 확인

같은 scalar example을 PyTorch로 작성하고 손으로 계산한 gradient와 `parameter.grad`가 일치하는지 확인한다.

### [Explore] Activation 비교

같은 작은 MLP에서:

- sigmoid
- tanh
- ReLU

를 바꿔 학습하고 다음을 관찰한다.

- loss curve
- 초기 layer의 gradient norm
- 학습 속도

단순히 어느 것이 "최고"라고 결론내지 말고, activation의 derivative와 관찰 결과를 연결해 설명한다.

---

## 이번 주 한 장 요약

```text
Week 3:
사람이 feature transformation φ(x)를 설계

Week 5:
Linear + Activation의 parameter를 학습해
모델이 hidden representation h를 생성

Forward:
x → z₁ → h → z₂ → loss

Backward:
loss에서 시작해 Chain Rule로
각 parameter의 gradient 계산

Gradient Descent:
계산된 gradient를 사용해 parameter update
```

## 다음 주 Preview

이제 MLP의 구조와 gradient 계산 방법을 알고 있다.

하지만 실제 classification을 학습하려면 여전히 다음이 필요하다.

- 여러 class에 대한 output을 어떻게 해석할 것인가?
- 어떤 loss를 사용할 것인가?
- 데이터를 batch로 어떻게 반복할 것인가?
- training data를 잘 맞히는 것과 새로운 data에서 잘하는 것은 어떻게 다른가?

다음 주에는 **실제 neural network training 전체 흐름**을 연결한다.
