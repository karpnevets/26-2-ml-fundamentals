---
title: "Convolutional Networks"
week: 7
question: "이미지에는 어떤 구조가 있으며, 모델은 그것을 어떻게 이용할까?"
concepts: ["Convolution","Filter","Feature Map","Pooling","Inductive Bias"]
estimated_time: "90–120 min"
---

---

## 7.1 이미지를 MLP에 넣으면?

이미지:

\[
32\times32\times3
\]

을 vector로 펼치면:

\[
3072
\]

개의 숫자가 된다.

MLP에 넣는 것은 가능하다.

하지만 이미지의 중요한 구조를 잃는다.

---

## 7.2 이미지의 구조

이미지에는 다음과 같은 특징이 있다.

### Locality
서로 가까운 pixel끼리 관계가 강하다.

### Repeated Pattern
edge나 texture는 이미지의 여러 위치에 등장할 수 있다.

### Spatial Structure
pixel의 위치 관계 자체가 중요하다.

---

## 7.3 Inductive Bias

모델 구조에 특정 종류의 데이터에 대한 가정을 넣는 것을 inductive bias라고 볼 수 있다.

CNN의 경우:

> **가까운 영역에서 반복되는 local pattern이 중요하다.**

라는 bias를 구조에 넣는다.

---

## 7.4 Convolution

작은 filter를 이미지 위에서 이동시킨다.

예:

\[
3\times3
\]

filter.

각 위치에서 local region과 filter의 weighted sum을 계산한다.

---

## 7.5 Filter

예를 들어 특정 filter는 edge에 강하게 반응할 수 있다.

```text
Input Image
   ↓
Filter
   ↓
Feature Map
```

---

## 7.6 Weight Sharing

같은 filter를 이미지 전체 위치에서 사용한다.

즉 같은 pattern detector를 여러 위치에서 재사용한다.

이것이 parameter 수를 크게 줄이고 spatial structure를 활용하게 한다.

---

## 7.7 Channel

RGB 이미지는:

```text
R
G
B
```

3개의 channel을 가진다.

CNN을 지나면 channel은 단순한 색이 아니라 다양한 learned feature map을 의미하게 된다.

---

## 7.8 Feature Hierarchy

초기 layer:

```text
edge
corner
simple texture
```

중간 layer:

```text
texture
shape fragment
```

깊은 layer:

```text
object part
complex pattern
```

처럼 점점 추상적인 feature를 학습할 수 있다.

---

## 7.9 Pooling

Pooling은 feature map의 spatial size를 줄이는 대표적인 방법이다.

예:

```text
2×2 Max Pooling
```

가장 큰 값을 선택한다.

현대 CNN에서는 pooling 대신 stride convolution 등도 사용한다.

이번 과정에서는 개념적 역할만 이해한다.

---

## 7.10 Receptive Field

한 neuron이 input image의 어느 범위를 보고 있는지를 receptive field라고 한다.

layer가 깊어질수록 더 넓은 영역의 정보를 사용할 수 있다.

---

## 7.11 CNN vs MLP

| MLP | CNN |
|---|---|
| 모든 input을 일반적인 vector로 처리 | spatial structure 활용 |
| Fully Connected | Local Connectivity |
| 위치마다 다른 weight | Weight Sharing |
| 이미지 구조에 대한 가정 적음 | 강한 image inductive bias |

---

## Checkpoint

1. 이미지를 vector로 펼치면 어떤 정보가 약해질 수 있는가?
2. CNN에서 locality란 무엇인가?
3. Weight Sharing은 왜 유용한가?
4. Filter와 feature map의 관계는?
5. Inductive Bias를 자신의 말로 설명해보자.

---

## 선택 과제

### [Check]

다음 중 CNN의 inductive bias와 가장 관련이 큰 것을 고른다.

```text
A. 모든 pixel 위치를 완전히 독립적으로 처리
B. 가까운 pixel의 local pattern을 중요하게 사용
C. 모든 데이터를 1차원 sequence로 변환
D. parameter를 전혀 사용하지 않음
```

---

### [Apply] CNN 실습

간단한 image dataset에서:

```python
Conv2d
ReLU
MaxPool
Conv2d
ReLU
Linear
```

구조를 학습한다.

각 layer마다 tensor shape을 출력한다.

---

### [Explore] MLP vs CNN

같은 image classification dataset에 대해:

- MLP
- CNN

을 학습한다.

다음을 비교한다.

- parameter 수
- train accuracy
- validation accuracy
- 학습 시간

---

## 이번 주 한 장 요약

```text
Image는 그냥 vector가 아니다.

Spatial Structure
   ↓
Local Connectivity
Weight Sharing
   ↓
Convolution
   ↓
Learned Feature Maps
```

---

## 다음 주 Preview

CNN이 좋다면 더 많은 layer를 쌓으면 계속 좋아질까?

> **"깊은 CNN은 왜 학습하기 어려우며, ResNet은 무엇을 바꾸었을까?"**

---
