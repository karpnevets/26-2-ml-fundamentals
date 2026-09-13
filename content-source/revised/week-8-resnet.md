---
title: "Residual Learning & ResNet"
week: 8
question: "깊은 CNN이 기존 정보를 잃지 않으면서 더 쉽게 학습되도록 만들 수 있을까?"
concepts: ["Deep Network", "Degradation", "Residual Function", "Skip Connection", "Identity Mapping", "Gradient Path", "Batch Normalization", "ResNet BasicBlock"]
estimated_time: "150–180 min"
---

# Week 8 — Residual Learning & ResNet

## 8.1 마지막 주의 목표

지금까지 배운 흐름을 다시 보자.

```text
Week 1  Model / Loss
Week 2  Linear Classification
Week 3  Feature Representation
Week 4  Gradient Descent / Chain Rule
Week 5  MLP / Backpropagation
Week 6  Training / Generalization
Week 7  CNN / Image Inductive Bias
```

이제 마지막 질문을 다룬다.

> CNN이 좋다면 layer를 계속 더 쌓으면 항상 더 잘 학습될까?

그렇지 않다.

이번 주의 목표는 ResNet을 단순히 "skip connection이 있는 CNN"으로 외우는 것이 아니라, **왜 깊은 plain network의 optimization이 어려운지, residual formulation이 무엇을 바꾸는지, 실제 ResNet block이 어떻게 구성되는지** 이해하는 것이다.

---

# 1. 왜 network를 깊게 만들까?

## 8.2 깊이는 representation의 composition을 늘린다

Week 7에서 CNN layer가 local pattern을 조합해 더 넓은 receptive field와 더 복잡한 representation을 만들 수 있다고 배웠다.

개념적으로:

```text
pixel
 ↓
local pattern
 ↓
pattern combination
 ↓
higher-level representation
```

처럼 여러 transformation을 연속해서 적용할 수 있다.

그래서 더 깊은 network는 더 복잡한 function을 표현할 잠재력이 있다.

하지만 **표현할 수 있다는 것과 실제 optimization으로 그 function을 찾을 수 있다는 것은 다른 문제**다.

---

# 2. 깊은 network에서 gradient는 어떻게 전달되는가?

## 8.3 Chain rule이 길어진다

여러 layer를:

\[
h_{l+1}=f_l(h_l)
\]

이라고 하자.

loss \(L\)의 gradient를 앞쪽 layer까지 보내려면 chain rule에 의해 여러 Jacobian이 곱해진다.

개념적으로:

\[
\frac{\partial L}{\partial h_l}
=
\frac{\partial L}{\partial h_L}
\frac{\partial h_L}{\partial h_{L-1}}
\cdots
\frac{\partial h_{l+1}}{\partial h_l}
\]

이다.

scalar 직관으로 보면 작은 derivative가 반복해서 곱해질 때 gradient가 매우 작아질 수 있고, 큰 값이 반복되면 매우 커질 수 있다.

이것이 Week 5에서 본 vanishing / exploding gradient의 기본 배경이다.

---

## 8.4 그러나 ResNet을 vanishing gradient 하나로만 설명하면 부족하다

깊은 network의 optimization 문제를 "gradient가 사라져서"라고만 설명하면 중요한 부분을 놓친다.

ResNet 논문에서 강조된 관찰 중 하나는 **degradation problem**이다.

더 깊은 plain network가 더 얕은 network보다 표현 능력이 부족해서가 아니라, 오히려 training error 자체가 더 높아지는 현상이 관찰되었다.

중요한 논리:

- 더 깊은 network는 적어도 여분 layer를 identity mapping으로 만들 수 있다면 얕은 network가 하던 function을 그대로 표현할 수 있어야 한다.
- 그런데 실제 optimization에서는 그 쉬워 보이는 해를 잘 찾지 못할 수 있다.

즉 문제는 단순한 model capacity 부족이 아니다.

> **깊어진 network를 실제 optimization으로 잘 학습시키는 것이 어렵다.**

이 문제를 구조적으로 완화하려는 아이디어가 residual learning이다.

---

# 3. Residual Learning

## 8.5 직접 mapping을 학습하는 방식

기존 block이 input \(x\)를 desired output \(H(x)\)로 바꾸어야 한다고 하자.

plain block은 직접:

\[
H(x)
\]

를 학습한다고 생각할 수 있다.

---

## 8.6 Residual function

ResNet은 다음 residual을 정의한다.

\[
F(x)=H(x)-x
\]

따라서:

\[
H(x)=F(x)+x
\]

가 된다.

block output은:

\[
y=x+F(x)
\]

로 쓴다.

이 식은 ResNet의 핵심 수식이므로 항상 보이게 둔다.

해석:

> block이 output 전체를 처음부터 새로 만드는 대신, input에서 **얼마나 바뀌어야 하는지**를 residual function \(F(x)\)로 학습한다.

---

## 8.7 Identity mapping이 쉬워진다

만약 어떤 block에서 input을 거의 그대로 통과시키는 것이 최선이라면 desired mapping은:

\[
H(x)=x
\]

이다.

Residual formulation에서는:

\[
F(x)=H(x)-x=0
\]

이면 된다.

따라서:

\[
y=x+0=x
\]

가 된다.

즉 추가 layer가 필요 없는 경우, residual branch가 0에 가까워지면 identity mapping을 만들 수 있다.

이것이 깊은 model이 기존 representation을 보존하기 쉽게 만드는 중요한 관점이다.

---

# 4. Skip connection

## 8.8 두 경로

Residual block은 두 경로를 가진다.

```text
                ┌──────────── identity / skip ────────────┐
                │                                         │
x ──────────────┼─> Conv → BN → ReLU → Conv → BN ──> (+) ──> y
                │                                         ↑
                └─────────────────────────────────────────┘
```

한 경로는 convolution 등의 transformation을 거친 \(F(x)\)다.

다른 경로는 input \(x\)를 직접 전달한다.

둘을 더한다.

\[
y=F(x)+x
\]

input이 intermediate transformation을 건너뛰어 직접 이동하는 연결을 skip connection 또는 shortcut connection이라고 한다.

---

# 5. Gradient 관점

## 8.9 residual block의 derivative

\[
y=x+F(x)
\]

를 \(x\)에 대해 미분하면:

\[
\frac{\partial y}{\partial x}
=
I+rac{\partial F}{\partial x}
\]

이다.

loss gradient는:

\[
\frac{\partial L}{\partial x}
=
\frac{\partial L}{\partial y}
\left(
I+rac{\partial F}{\partial x}
\right)
\]

로 생각할 수 있다.

이 식에서 중요한 것은 \(I\) 항이다.

residual branch의 derivative만 통과해야 하는 것이 아니라 identity 경로가 추가된다.

즉 gradient가 앞쪽으로 전달될 수 있는 더 직접적인 경로가 생긴다.

이 때문에 residual connection은 deep network의 optimization을 쉽게 만드는 데 도움이 된다.

주의:

> "skip connection이 있으면 gradient가 절대 vanish하지 않는다"는 식으로 이해하면 과도하다.

실제 network의 optimization은 activation, normalization, initialization, architecture 등 여러 요소의 영향을 함께 받는다.

---

## 8.10 여러 residual block을 연속해서 보면

단순화하여:

\[
x_{l+1}=x_l+F_l(x_l)
\]

라고 하자.

여러 block을 지나면 input representation 위에 residual update들이 누적된다.

개념적으로:

\[
x_L=x_0+\sum_{l=0}^{L-1}F_l(x_l)
\]

형태로 생각할 수 있다.

정확히 각 \(F_l\)의 input은 서로 다르지만, 이 표현은 **깊은 network가 representation을 매 block마다 완전히 교체하기보다 점진적으로 수정한다**는 직관을 준다.

---

# 6. 실제 BasicBlock

## 8.11 ResNet BasicBlock 구조

ResNet-18/34 계열의 기본적인 block을 단순화하면:

```text
x
│
├──────────────────────────────┐
│                              │
Conv 3×3                       │
↓                              │
BatchNorm                      │
↓                              │
ReLU                           │
↓                              │
Conv 3×3                       │
↓                              │
BatchNorm                      │
│                              │
└───────────────────────> Add <┘
                         ↓
                       ReLU
```

block 내부의 convolution weight와 BatchNorm parameter는 학습된다.

---

## 8.12 Shape가 같아야 더할 수 있다

\[
y=F(x)+x
\]

에서 element-wise addition을 하려면 두 tensor의 shape가 같아야 한다.

예:

```text
F(x): (N, 64, 56, 56)
x   : (N, 64, 56, 56)
```

이면 바로 더할 수 있다.

하지만 stage가 바뀌면서:

```text
channel 64 → 128
spatial 56×56 → 28×28
```

처럼 shape가 변할 수 있다.

이때 identity branch도 shape를 맞춰야 한다.

---

## 8.13 Projection shortcut

shape가 다르면 skip path에 \(1\times1\) convolution을 사용할 수 있다.

\[
y=F(x)+W_sx
\]

여기서 \(W_s\)는 shape를 맞추는 learnable projection이다.

예:

```text
main branch:
(N, 64, 56, 56)
→ stride 2 conv
→ (N, 128, 28, 28)

skip branch:
(N, 64, 56, 56)
→ 1×1 conv, stride 2
→ (N, 128, 28, 28)
```

이제 두 branch를 더할 수 있다.

즉 skip connection이 항상 "아무 연산 없이 그대로"인 것은 아니다. shape가 같으면 identity shortcut을 사용할 수 있고, 다르면 projection이 필요할 수 있다.

---

# 7. 왜 1×1 convolution이 channel을 바꿀 수 있는가?

## 8.14 spatial window는 1×1이지만 channel은 모두 본다

\(1\times1\) convolution은 공간적으로는 한 pixel 위치만 본다.

하지만 input channel 전체를 조합한다.

input channel 수가 \(C_{in}\), output channel 수가 \(C_{out}\)이면 각 spatial 위치에서:

\[
y_{:,i,j}=Wx_{:,i,j}
\]

와 비슷한 channel-wise linear transformation을 수행한다.

따라서 spatial size를 유지하면서 channel dimension을 바꿀 수 있다.

stride 2를 사용하면 spatial size도 줄일 수 있다.

projection shortcut에 적합한 이유다.

---

# 8. Batch Normalization

## 8.15 왜 ResNet block에 BatchNorm이 보이는가?

ResNet architecture를 읽으려면 BatchNorm을 "deep network를 안정화하는 뭔가" 정도로만 넘기면 부족하다.

BatchNorm은 mini-batch에서 activation의 통계를 이용해 feature를 정규화하고, 이후 다시 learnable scale과 shift를 적용한다.

한 feature channel에 대해 mini-batch 통계로:

\[
\mu_B=\frac1m\sum_{i=1}^{m}x_i
\]

\[
\sigma_B^2=\frac1m\sum_{i=1}^{m}(x_i-\mu_B)^2
\]

를 계산한다.

그 다음:

\[
\hat x_i=rac{x_i-\mu_B}{\sqrt{\sigma_B^2+\epsilon}}
\]

로 정규화한다.

마지막으로:

\[
y_i=\gamma\hat x_i+\beta
\]

를 적용한다.

- \(\gamma\): learnable scale
- \(\beta\): learnable shift
- \(\epsilon\): 수치 안정성을 위한 작은 값

이다.

---

## 8.16 BatchNorm은 정보를 완전히 고정하지 않는다

정규화 후 \(\gamma,\beta\)를 학습하므로 network가 필요한 scale과 shift를 다시 표현할 수 있다.

즉 "항상 평균 0, 분산 1로 강제해 정보 표현을 제한하는 layer"라고 이해하면 잘못이다.

---

## 8.17 Training과 evaluation에서 동작이 다르다

training 중에는 현재 batch의 통계를 사용하면서 running mean/variance를 갱신한다.

evaluation에서는 보통 training 중 누적한 running statistics를 사용한다.

그래서 Week 6에서 본:

```python
model.train()
model.eval()
```

구분이 중요하다.

`model.eval()`을 하지 않으면 validation/test에서 BatchNorm의 동작이 의도와 달라질 수 있다.

---

# 9. Residual block을 PyTorch 코드로 읽기

## 8.18 간단한 BasicBlock

```python
class BasicBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, 3, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, 3, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(channels)
        self.relu = nn.ReLU()

    def forward(self, x):
        identity = x

        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu(out)

        out = self.conv2(out)
        out = self.bn2(out)

        out = out + identity
        out = self.relu(out)
        return out
```

코드를 읽을 때 핵심은:

```text
identity = x
...
out = F(x)
out = out + identity
```

다.

즉 수식:

\[
y=F(x)+x
\]

가 코드로 그대로 표현되어 있다.

---

## 8.19 downsample이 있는 block

shape가 변할 때는:

```python
identity = self.downsample(x)
```

같은 path를 둘 수 있다.

이 경우 block은:

\[
y=F(x)+W_sx
\]

에 해당한다.

architecture를 읽을 때는 반드시:

```text
main branch output shape
skip branch output shape
```

가 같은지 확인한다.

---

# 10. ResNet 전체 구조 읽기

## 8.20 큰 흐름

ResNet image classifier는 대략 다음 구조를 갖는다.

```text
Image
 ↓
Stem convolution
 ↓
Residual Stage 1
 ↓
Residual Stage 2
 ↓
Residual Stage 3
 ↓
Residual Stage 4
 ↓
Global Average Pooling
 ↓
Linear Classifier
 ↓
Logits
```

각 stage에는 여러 residual block이 있다.

stage가 바뀌면서 보통:

```text
spatial resolution ↓
channel count      ↑
```

한다.

---

## 8.21 Global Average Pooling

마지막 convolution feature tensor가:

\[
(N,C,H,W)
\]

라고 하자.

각 channel에 대해 spatial dimension의 평균을 내면:

\[
(N,C)
\]

vector가 된다.

수식으로 channel \(c\)에 대해:

\[
g_c=\frac{1}{HW}\sum_{i=1}^{H}\sum_{j=1}^{W}x_{c,i,j}
\]

이다.

이후 Linear layer가 class logits를 만든다.

즉 CNN의 spatial feature map을 classification용 vector representation으로 요약한다.

---

# 11. 지금까지의 개념을 ResNet 안에서 다시 찾기

## 8.22 Week 1 — Model / Parameter / Loss

ResNet 전체가 parameterized function이다.

\[
\hat y=f_\theta(x)
\]

loss가 training objective를 제공한다.

---

## 8.23 Week 2 — Linear transformation

convolution과 마지막 classifier 모두 weighted sum을 기반으로 한다.

마지막 Linear layer는 class logit을 만든다.

---

## 8.24 Week 3 — Representation

Residual stage가 input image를 점점 다른 learned representation으로 바꾼다.

---

## 8.25 Week 4 — Gradient Descent / Chain Rule

모든 parameter는 loss gradient를 이용해 update된다.

---

## 8.26 Week 5 — Activation / Backpropagation

ReLU가 nonlinearity를 제공하고, backpropagation이 deep computational graph의 gradient를 계산한다.

---

## 8.27 Week 6 — Training / Generalization

Cross-Entropy로 logits를 학습하고 validation/test로 generalization을 평가한다.

---

## 8.28 Week 7 — Convolution / Inductive Bias

Residual function \(F\)의 주요 연산은 convolution이다.

locality와 weight sharing을 그대로 활용한다.

---

# 12. ResNet을 한 문장으로 설명하기

좋은 설명:

> **ResNet은 convolutional block이 input 전체 mapping을 새로 만들기보다 residual update \(F(x)\)를 학습하고, skip connection을 통해 input을 직접 더함으로써 깊은 CNN의 optimization을 쉽게 만든 architecture다.**

부족한 설명:

> "ResNet은 vanishing gradient를 해결하는 모델이다."

왜 부족한가?

- ResNet의 motivation에는 degradation/optimization 문제가 포함된다.
- residual formulation은 identity mapping을 쉽게 만든다.
- skip path는 gradient에 더 직접적인 경로를 제공한다.
- 실제 deep training 안정성은 normalization, initialization 등 다른 요소에도 영향을 받는다.

---

# 13. 최종 architecture 해석 훈련

## 8.29 다음 block을 보면 무엇을 물어야 하는가?

```text
Conv 3×3
BN
ReLU
Conv 3×3
BN
+
ReLU
```

다음을 순서대로 확인한다.

1. input shape는 무엇인가?
2. 첫 Conv가 channel/spatial size를 어떻게 바꾸는가?
3. BatchNorm은 어느 channel 통계를 다루는가?
4. ReLU는 어디에서 nonlinearity를 넣는가?
5. main branch의 최종 shape는?
6. skip branch의 shape는?
7. 바로 identity를 더할 수 있는가, projection이 필요한가?
8. addition 뒤 output shape는?
9. 이 block parameter까지 gradient가 어떤 경로로 전달되는가?

이 질문에 답할 수 있다면 ResNet 구조를 단순 암기가 아니라 **연산 그래프와 tensor shape 관점**에서 읽고 있는 것이다.

---

# Checkpoint

1. 깊은 network가 더 큰 capacity를 가져도 training이 어려울 수 있는 이유는?
2. degradation problem은 단순한 overfitting과 어떻게 다른가?
3. residual function \(F(x)\)는 어떻게 정의되는가?
4. \(y=x+F(x)\)에서 identity mapping을 만드는 것이 왜 쉬운가?
5. residual block derivative에 \(I\) 항이 생기는 이유는?
6. skip connection이 gradient 전달에 어떤 경로를 추가하는가?
7. \(F(x)\)와 \(x\)의 shape가 다르면 왜 바로 더할 수 없는가?
8. projection shortcut은 무엇을 하는가?
9. 1×1 convolution으로 channel 수를 바꿀 수 있는 이유는?
10. BatchNorm의 \(\gamma,\beta\)는 왜 필요한가?
11. `model.train()`과 `model.eval()`이 BatchNorm 때문에 왜 중요할 수 있는가?
12. Global Average Pooling은 \((N,C,H,W)\)를 어떤 shape로 바꾸는가?
13. ResNet 안에서 Week 1~7의 개념을 최소 다섯 개 연결해 설명해보자.

---

# 선택 과제

## [Check] Residual 식 해석

\[
y=x+F(x)
\]

에서:

1. \(F(x)=0\)이면?
2. \(F(x)=-x\)이면?
3. \(F(x)\)가 작다는 것은 어떤 mapping을 의미하는가?

## [Check] Shape 확인

```text
x    : (32, 64, 56, 56)
F(x) : (32, 128, 28, 28)
```

를 바로 더할 수 없는 이유를 설명하고 skip branch에 필요한 transformation을 제안한다.

## [Apply] BasicBlock shape tracing

다음 block을 따라 shape를 적는다.

```text
input: (N, 64, 56, 56)
Conv 3×3, 64→128, stride 2, padding 1
BN
ReLU
Conv 3×3, 128→128, stride 1, padding 1
BN
```

main path output과 skip path의 projection output shape가 어떻게 같아져야 하는지 적는다.

## [Apply] Gradient 식 해석

\[
\frac{\partial L}{\partial x}
=
\frac{\partial L}{\partial y}
\left(I+\frac{\partial F}{\partial x}\right)
\]

에서 identity 항이 없을 때와 있을 때 gradient path 관점의 차이를 설명한다.

## [Apply] BatchNorm 계산

간단한 scalar batch:

```text
[1, 2, 3, 4]
```

의 mean과 variance를 계산하고, \(\epsilon\)은 무시한 상태에서 normalized value를 구해본다.

## [Explore] Plain CNN vs Residual CNN

비슷한 깊이의 두 모델을 비교한다.

관찰할 것:

- training loss
- validation accuracy
- early layer gradient norm
- epoch별 convergence

결과를 보고 "skip connection 때문에 항상 성능이 높다"가 아니라 **optimization curve와 gradient behavior가 어떻게 달랐는지** 설명한다.

---

# 최종 한 장 요약

```text
깊은 CNN
  ↓
표현력은 늘 수 있지만 optimization이 어려워짐
  ↓
Residual Learning

H(x) = x + F(x)

main path : F(x)
skip path : x

효과:
- identity mapping을 쉽게 표현
- 기존 representation 보존이 쉬움
- gradient에 직접적인 경로 추가

ResNet은 결국
Conv + BN + ReLU + Backprop + Classifier
위에 residual structure를 더한 것
```

# 과정의 최종 목표

이제 ResNet diagram을 보며 다음을 자신의 말로 설명할 수 있어야 한다.

- input tensor의 shape
- convolution이 왜 필요한가
- channel과 feature map은 무엇인가
- ReLU가 왜 필요한가
- loss는 어디에서 만들어지는가
- backpropagation은 무엇을 계산하는가
- skip connection은 무엇을 더하는가
- residual function은 무엇을 학습하는가
- shape가 다를 때 projection이 왜 필요한가
- BatchNorm은 training/evaluation에서 어떻게 동작하는가
- training loss와 generalization이 왜 다른 문제인가

이 설명이 가능하다면 이 기초 과정의 목표를 달성한 것이다.
