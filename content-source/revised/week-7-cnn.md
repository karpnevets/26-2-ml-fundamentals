---
title: "CNN & Image Inductive Bias"
week: 7
question: "이미지가 가진 공간적 구조를 모델 architecture에 어떻게 반영할까?"
concepts: ["Image Tensor", "Convolution", "Kernel", "Feature Map", "Stride", "Padding", "Channel", "Pooling", "Receptive Field", "Inductive Bias"]
estimated_time: "150–180 min"
---

# Week 7 — CNN & Image Inductive Bias

## 7.1 이번 주의 출발점

Week 5에서 MLP는 vector input을 처리했다.

이미지 역시 숫자의 집합이므로 펼쳐서 vector로 만들 수 있다.

예를 들어 RGB 이미지 하나가:

\[
32\times32\times3
\]

이라면 총 숫자 개수는:

\[
32\cdot32\cdot3=3072
\]

이다.

이를 길이 3072의 vector로 펴서 MLP에 넣는 것은 가능하다.

문제는 **가능하냐**가 아니라 **이미지의 구조를 잘 활용하느냐**다.

---

## 7.2 이미지는 단순한 숫자 목록이 아니다

이미지에는 최소 세 가지 중요한 구조가 있다.

### Locality

가까운 pixel들끼리 함께 edge, corner, texture 같은 local pattern을 만든다.

### Spatial arrangement

같은 pixel 값이라도 어디에 배치되어 있는지가 중요하다.

### Repeated patterns

수직선, 곡선, texture 같은 pattern은 이미지의 여러 위치에서 나타날 수 있다.

이미지를 완전히 flatten하면 숫자 자체는 남지만 이런 구조를 모델 architecture가 직접 활용하지 못한다.

---

# 1. Inductive Bias

## 7.3 Inductive bias란?

모델은 유한한 training data만 보고 새로운 data에 대해 일반화해야 한다.

이때 architecture에 특정 종류의 문제에 잘 맞는 가정을 넣을 수 있다.

이를 inductive bias라고 부른다.

CNN은 이미지에 대해 대략 다음 가정을 구조에 넣는다.

> 가까운 위치의 정보가 중요하고, 같은 local pattern은 이미지의 여러 위치에서 의미가 있을 수 있다.

이를 구현하는 핵심이 **local connectivity**와 **weight sharing**이다.

---

# 2. 이미지 Tensor

## 7.4 Channel, Height, Width

RGB 이미지는 각 위치마다 세 숫자를 가진다.

```text
R channel
G channel
B channel
```

한 이미지의 shape를 개념적으로:

\[
C\times H\times W
\]

로 둘 수 있다.

PyTorch `Conv2d`는 batch까지 포함해 기본적으로:

\[
(N,C,H,W)
\]

shape를 사용한다.

- \(N\): batch size
- \(C\): channel 수
- \(H\): height
- \(W\): width

예:

```text
(32, 3, 224, 224)
```

는:

```text
32 images
3 channels
224×224 pixels
```

을 뜻한다.

이 shape convention은 CNN 코드를 읽을 때 필수다.

---

# 3. Convolution의 핵심 아이디어

## 7.5 작은 영역만 본다

CNN은 한 output을 계산할 때 input 전체를 한 번에 연결하지 않고 작은 local window를 본다.

예를 들어 \(3\times3\) kernel은 현재 위치 주변의 9개 공간 위치를 본다.

```text
Input image

. . . . .
. [x x x] .
. [x x x] .
. [x x x] .
. . . . .
```

이 local window와 kernel weight를 곱해 더한 값이 output의 한 위치가 된다.

---

## 7.6 2D single-channel 계산

single-channel input \(X\)와 kernel \(K\)가 있다고 하자.

output 위치 \((i,j)\)는 개념적으로:

\[
Y_{i,j}
=
\sum_{u=0}^{k_H-1}
\sum_{v=0}^{k_W-1}
K_{u,v}X_{i+u,j+v}
\]

로 계산한다.

deep learning library에서 흔히 `convolution`이라고 부르는 연산은 수학적으로 kernel을 뒤집지 않는 cross-correlation 형태인 경우가 많다. 이 과정에서는 이름보다 **local weighted sum을 같은 kernel로 반복한다**는 구조가 중요하다.

---

## 7.7 작은 숫자 예시

input 일부가:

\[
X=
\begin{bmatrix}
1&2&0\\
0&1&3\\
2&1&0
\end{bmatrix}
\]

kernel이:

\[
K=
\begin{bmatrix}
1&0&-1\\
1&0&-1\\
1&0&-1
\end{bmatrix}
\]

이라면 이 위치의 output은 element-wise product의 합이다.

\[
1\cdot1+2\cdot0+0\cdot(-1)
+0\cdot1+1\cdot0+3\cdot(-1)
+2\cdot1+1\cdot0+0\cdot(-1)
\]

\[
=1-3+2=0
\]

이다.

<details>
<summary>예시: 이 kernel이 무엇을 감지할 수 있는가?</summary>

위 kernel은 왼쪽 값에는 양수, 오른쪽 값에는 음수를 곱한다.

왼쪽과 오른쪽 밝기 차이가 크면 절댓값이 큰 반응을 만들 수 있으므로 수직 방향 edge와 관련된 pattern detector처럼 작동할 수 있다.

실제 CNN에서는 이런 kernel 값을 사람이 고정하지 않고 학습한다.

</details>

---

# 4. Weight sharing

## 7.8 같은 kernel을 모든 위치에서 사용한다

CNN의 중요한 특징은 한 kernel을 한 위치에서만 쓰지 않는다는 것이다.

```text
position 1 → same kernel
position 2 → same kernel
position 3 → same kernel
...
```

즉 이미지 왼쪽에서 수직 edge를 찾는 detector와 오른쪽에서 수직 edge를 찾는 detector에 서로 다른 parameter를 둘 필요가 없다.

이것이 weight sharing이다.

---

## 7.9 parameter 수 비교

예를 들어 \(32\times32\times3\) 이미지를 100개의 hidden unit에 fully connected한다고 하자.

weight 수는:

\[
3072\times100=307200
\]

이다.

반면 \(3\times3\) kernel을 사용해 input channel 3개에서 output channel 100개를 만든다면 convolution weight 수는:

\[
100\times3\times3\times3=2700
\]

이다.

bias까지 고려해도 차이가 매우 크다.

이는 CNN이 "항상 MLP보다 좋다"는 증명이 아니라, **이미지의 local repeated structure를 가정함으로써 훨씬 적은 parameter로 local pattern detector를 공유한다**는 것을 보여준다.

---

# 5. 여러 channel과 여러 filter

## 7.10 한 output channel은 모든 input channel을 본다

input이 RGB라면 kernel도 channel 방향 깊이를 가진다.

하나의 output channel을 만드는 kernel shape는:

\[
(C_{in},k_H,k_W)
\]

이다.

output channel을 \(C_{out}\)개 만들면 전체 weight tensor shape는 PyTorch 기준:

\[
(C_{out},C_{in},k_H,k_W)
\]

이다.

예:

```python
nn.Conv2d(
    in_channels=3,
    out_channels=64,
    kernel_size=3
)
```

이면 weight shape는 개념적으로:

```text
(64, 3, 3, 3)
```

이다.

64개의 서로 다른 learned filter가 64개의 output feature map을 만든다.

---

## 7.11 Feature map

convolution의 output channel 하나를 feature map이라고 부를 수 있다.

초기 layer의 어떤 feature map은 특정 edge나 texture에 강하게 반응할 수 있다.

중요한 점은 실제 learned feature가 사람이 지정한 "edge detector"로 반드시 깔끔하게 대응되는 것은 아니라는 것이다.

CNN은 loss를 줄이는 데 유용한 representation을 학습한다.

---

# 6. Stride와 Padding

## 7.12 Stride

stride는 kernel을 몇 칸씩 이동할지 정한다.

### stride = 1

한 칸씩 이동한다.

### stride = 2

두 칸씩 이동한다.

stride가 커지면 output spatial size가 줄어든다.

---

## 7.13 Padding

kernel을 그대로 적용하면 이미지 가장자리에서 window를 만들 수 없으므로 output 크기가 줄어든다.

input 주변에 값을 추가하는 것을 padding이라고 한다.

zero padding은 바깥을 0으로 채운다.

```text
0 0 0 0 0
0 a b c 0
0 d e f 0
0 g h i 0
0 0 0 0 0
```

padding을 적절히 사용하면 stride 1에서 spatial size를 유지할 수 있다.

---

## 7.14 Output spatial size 공식

1차원 축 하나에 대해 input size \(H\), kernel size \(K\), padding \(P\), stride \(S\)일 때 output size는:

\[
H_{out}
=
\left\lfloor
\frac{H+2P-K}{S}
\right\rfloor+1
\]

width도 같은 방식이다.

이 수식은 Conv layer의 shape를 계산할 때 필수이므로 항상 보이게 둔다.

<details>
<summary>예시: 32×32 image에 3×3 kernel</summary>

### padding 0, stride 1

\[
H_{out}=\frac{32-3}{1}+1=30
\]

따라서 \(30\times30\)이 된다.

### padding 1, stride 1

\[
H_{out}=\frac{32+2-3}{1}+1=32
\]

spatial size가 유지된다.

### padding 1, stride 2

\[
H_{out}
=\left\lfloor\frac{32+2-3}{2}\right\rfloor+1
=16
\]

정도가 되어 해상도가 절반으로 줄어든다.

</details>

---

# 7. Convolution의 inductive bias

## 7.15 Local connectivity

한 output unit은 input 전체가 아니라 작은 local region과 연결된다.

이는 이미지에서 가까운 pixel 관계가 중요하다는 가정이다.

## 7.16 Weight sharing

같은 filter를 모든 위치에서 사용한다.

이는 같은 local pattern이 위치가 달라도 유용할 수 있다는 가정이다.

이 두 구조 덕분에 CNN은 image domain에 강한 inductive bias를 갖는다.

---

## 7.17 Translation equivariance

input pattern이 이동하면 feature map의 반응도 비슷하게 이동하는 성질을 translation equivariance라고 한다.

개념적으로 convolution \(f\)에 대해 이동 연산 \(T\)를 생각하면:

\[
f(Tx)=T(f(x))
\]

같은 관계를 기대할 수 있다.

즉 object가 이미지 안에서 조금 옮겨졌다고 해서 완전히 새로운 filter를 배울 필요가 없다.

이는 translation **invariance**와는 다르다.

- equivariance: input이 이동하면 representation도 대응해서 이동
- invariance: input이 이동해도 최종 output이 거의 변하지 않음

classification network는 pooling, downsampling, global aggregation 등을 통해 최종적으로 위치 변화에 덜 민감한 output을 만들 수 있다.

---

# 8. Pooling

## 7.18 Max pooling

대표적으로 \(2\times2\) max pooling은 각 local window에서 가장 큰 값을 선택한다.

예:

\[
\begin{bmatrix}
1&5\\
3&2
\end{bmatrix}
\rightarrow5
\]

pooling의 역할:

- spatial size 감소
- 이후 layer의 계산량 감소
- local response를 요약

pooling은 학습 parameter가 없는 경우가 많다.

---

## 7.19 Downsampling의 의미

resolution을 줄이면 세밀한 위치 정보는 일부 잃을 수 있다.

대신 더 적은 spatial position에서 더 넓은 영역의 정보를 다룰 수 있다.

CNN architecture는 **어디에서 얼마나 downsampling할지**도 중요한 설계 요소다.

---

# 9. Receptive field

## 7.20 한 unit이 원본 이미지의 어디까지 보는가?

첫 \(3\times3\) convolution의 output unit은 원본의 \(3\times3\) 영역을 본다.

그 다음 또 \(3\times3\) convolution을 적용하면 두 번째 layer의 한 unit은 첫 layer의 여러 unit을 보고, 결과적으로 원본 이미지의 더 넓은 영역에 영향을 받는다.

이 원본 input에서 영향을 미칠 수 있는 범위를 receptive field라고 한다.

stride 1, padding을 적절히 사용한 \(3\times3\) conv를 두 번 쌓으면 receptive field는:

```text
1 layer: 3×3
2 layers: 5×5
3 layers: 7×7
```

처럼 커진다.

깊은 CNN은 작은 local operation을 반복하면서 점점 넓은 context를 결합할 수 있다.

---

# 10. Feature hierarchy

## 7.21 왜 깊은 layer에서 더 복잡한 pattern을 볼 수 있을까?

초기 layer는 작은 receptive field를 가지므로 local pattern을 주로 처리한다.

다음 layer는 이전 layer의 feature들을 조합한다.

개념적으로:

```text
pixel
 ↓
local edge / texture-like response
 ↓
조합된 local pattern
 ↓
더 큰 shape / part-level representation
```

으로 발전할 수 있다.

이것은 사람이 각 layer의 feature 의미를 직접 지정한다는 뜻이 아니다. 각 layer의 filter는 최종 loss를 줄이도록 backpropagation으로 함께 학습된다.

---

# 11. CNN도 결국 Week 5의 학습 가능한 transformation이다

## 7.22 Conv weight도 parameter다

convolution kernel의 값은 학습되는 parameter다.

즉:

```text
Conv
 ↓
ReLU
 ↓
Conv
 ↓
...
 ↓
Classifier
 ↓
Loss
```

에서 loss로부터 backpropagation이 convolution kernel까지 gradient를 계산한다.

\[
W_{conv}
\leftarrow
W_{conv}-\eta\frac{\partial L}{\partial W_{conv}}
\]

이다.

CNN은 "손으로 만든 edge filter 모음"이 아니라 **convolution이라는 구조적 제약 안에서 filter 자체를 데이터로부터 학습하는 neural network**다.

---

# 12. MLP와 CNN 비교

## 7.23 무엇이 다른가?

| 관점 | MLP | CNN |
|---|---|---|
| 입력 구조 | 일반 vector | spatial grid를 적극 활용 |
| 연결 | dense / fully connected | local connectivity |
| weight | 위치별 연결마다 다를 수 있음 | spatial 위치에 공유 |
| parameter 효율 | image에서 커질 수 있음 | local weight sharing으로 감소 |
| inductive bias | 상대적으로 일반적 | locality, repeated pattern에 강함 |

CNN도 Linear/Activation/Backpropagation이라는 Week 5의 원리 위에 있다.

달라진 것은 **어떤 parameter sharing 구조를 architecture에 넣었는가**다.

---

# 13. PyTorch Conv2d 읽기

```python
conv = nn.Conv2d(
    in_channels=3,
    out_channels=16,
    kernel_size=3,
    stride=1,
    padding=1
)
```

입력이:

```text
(N, 3, 32, 32)
```

라면 output은:

```text
(N, 16, 32, 32)
```

이다.

왜냐하면:

- channel: 3 → 16
- padding 1, kernel 3, stride 1 → spatial size 유지

이후:

```python
x = conv(x)
x = torch.relu(x)
```

처럼 사용한다.

---

## 7.24 간단한 CNN shape 추적

```python
model = nn.Sequential(
    nn.Conv2d(3, 16, kernel_size=3, padding=1),
    nn.ReLU(),
    nn.MaxPool2d(2),
    nn.Conv2d(16, 32, kernel_size=3, padding=1),
    nn.ReLU()
)
```

입력이:

```text
(N, 3, 32, 32)
```

이면:

```text
Conv1    → (N, 16, 32, 32)
ReLU     → (N, 16, 32, 32)
MaxPool  → (N, 16, 16, 16)
Conv2    → (N, 32, 16, 16)
ReLU     → (N, 32, 16, 16)
```

이다.

CNN 코드를 읽을 때 매 layer마다 **channel과 spatial size를 따로 추적**한다.

---

# Checkpoint

1. 이미지를 flatten해 MLP에 넣는 것이 가능한데도 CNN을 사용하는 이유는?
2. inductive bias를 자신의 말로 설명해보자.
3. local connectivity와 weight sharing은 각각 어떤 가정을 담고 있는가?
4. PyTorch image tensor의 \((N,C,H,W)\) 각 항은 무엇인가?
5. convolution output 한 위치는 어떻게 계산되는가?
6. `out_channels=64`는 무엇을 의미하는가?
7. stride와 padding은 spatial size에 어떤 영향을 주는가?
8. convolution output size 공식을 사용할 수 있는가?
9. translation equivariance와 invariance는 어떻게 다른가?
10. receptive field는 layer가 깊어질수록 왜 커지는가?
11. CNN filter가 학습되는 과정은 Week 5의 어떤 원리와 연결되는가?

---

# 선택 과제

## [Check] Shape 계산

입력:

```text
(N, 3, 64, 64)
```

layer:

```python
nn.Conv2d(3, 32, kernel_size=5, stride=2, padding=2)
```

output shape를 계산한다.

## [Check] Parameter 수

```python
nn.Conv2d(3, 16, kernel_size=3, bias=True)
```

의 parameter 수를 계산한다.

힌트:

\[
C_{out}C_{in}K_HK_W+C_{out}
\]

## [Apply] Convolution 손계산

작은 \(4\times4\) input과 \(2\times2\) kernel을 직접 정해 stride 1, padding 0의 output 전체를 계산한다.

## [Apply] Shape tracing

CNN architecture 하나를 정하고 각 layer의:

```text
N
C
H
W
```

를 표로 정리한다.

## [Explore] MLP vs CNN parameter 수

같은 \(32\times32\times3\) image input에 대해:

- flatten 후 hidden 512 unit MLP
- Conv2d(3, 64, 3×3)

의 첫 layer parameter 수를 비교한다.

그 차이가 어떤 inductive bias에서 오는지 설명한다.

---

# 이번 주 한 장 요약

```text
Image
= spatial structure를 가진 tensor

CNN의 핵심 bias
1. Local connectivity
2. Weight sharing

Convolution
small local window
+ shared learnable kernel
→ feature map

Layer가 깊어지면
receptive field가 커지고
learned representation이 조합된다.

그리고 모든 Conv weight는
Backpropagation으로 학습된다.
```

# 다음 주 Preview

CNN을 여러 layer 쌓으면 더 복잡한 representation을 만들 수 있다.

그렇다면 단순히 계속 깊게 만들면 항상 더 잘 학습될까?

실제로는 깊은 plain network에서 optimization이 어려워지고, layer를 추가했는데 training error가 오히려 커지는 현상도 나타난다.

> **깊은 network가 기존 representation을 쉽게 보존하면서 필요한 변화만 학습하도록 만들 수 있을까?**

다음 주에는 Residual Learning과 ResNet을 배운다.
