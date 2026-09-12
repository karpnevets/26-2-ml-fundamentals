---
title: "Model & Loss"
week: 1
question: "모델은 무엇을 학습하는가?"
concepts: ["Model","Parameter","Prediction","Target","Loss","Feature"]
estimated_time: "90–120 min"
---

---

## 1.1 이번 주의 목표

다음 문장을 자신의 말로 설명할 수 있으면 성공이다.

> **모델은 parameter를 가진 함수이고, 학습은 prediction이 target에 가까워지도록 parameter를 바꾸는 과정이다.**

이번 주에는 Gradient Descent를 아직 배우지 않는다.

먼저 "무엇을 바꾸는가"와 "좋다는 것을 어떻게 측정하는가"부터 이해한다.

---

## 1.2 가장 단순한 모델

모델 하나를 생각한다.

\[
\hat{y} = wx
\]

여기서:

- \(x\): input
- \(w\): parameter
- \(\hat{y}\): prediction

이라고 한다.

예를 들어:

\[
x = 2
\]

라고 하자.

### \(w=1\)

\[
\hat y = 1\times2 = 2
\]

### \(w=2\)

\[
\hat y = 2\times2 = 4
\]

### \(w=3\)

\[
\hat y = 3\times2 = 6
\]

parameter \(w\)가 바뀌면 prediction이 바뀐다.

---

## 1.3 Target

실제 정답이

\[
y=6
\]

이라고 하자.

이제 모델의 prediction과 실제 target을 비교할 수 있다.

```text
Input x
   ↓
Model f_w
   ↓
Prediction ŷ
   ↓
Target y와 비교
```

---

## 1.4 Loss는 왜 필요한가?

질문:

> \(w=1\)인 모델과 \(w=2\)인 모델 중 무엇이 더 좋은가?

둘 다 틀렸지만 \(w=2\)가 더 정답에 가깝다.

이 "얼마나 틀렸는가"를 숫자로 표현하기 위해 Loss를 정의한다.

가장 간단한 예:

\[
L=(\hat y-y)^2
\]

---

## 1.5 숫자로 확인하기

\[
x=2,\qquad y=6
\]

일 때:

| \(w\) | \(\hat y\) | \(L=(\hat y-y)^2\) |
|---:|---:|---:|
| 0 | 0 | 36 |
| 1 | 2 | 16 |
| 2 | 4 | 4 |
| 3 | 6 | 0 |
| 4 | 8 | 4 |
| 5 | 10 | 16 |

이 표의 핵심:

> parameter가 달라지면 prediction이 달라지고, prediction이 달라지면 loss가 달라진다.

즉:

\[
w
\rightarrow
\hat y
\rightarrow
L
\]

---

## 1.6 Loss Landscape의 가장 단순한 형태

Loss를 \(w\)에 대한 함수로 생각할 수 있다.

\[
L(w)
\]

그래프를 그리면:

```text
Loss
 ^
 |          *
 |      *
 |   *
 | *
 |______________> w
          3
```

실제로 위 예시는 \(w=3\)에서 loss가 가장 작다.

따라서 학습의 목표를 다음처럼 표현할 수 있다.

> **Loss가 작은 parameter를 찾는다.**

수식으로는:

\[
w^* = \arg\min_w L(w)
\]

이 수식은 외우는 것이 목표가 아니다.

의미만 이해하면 된다.

---

## 1.7 Model / Parameter / Prediction / Loss

이번 주의 가장 중요한 그림:

```text
Input x
  │
  ▼
Model fθ
  │
  ▼
Prediction ŷ
  │
  ├──────── Target y
  ▼
Loss L(ŷ, y)
```

그리고 학습:

```text
Parameter θ 변경
      ↓
Prediction 변경
      ↓
Loss 변경
```

---

## 1.8 Feature

input이 항상 숫자 하나일 필요는 없다.

예를 들어 집값 예측이라면:

```text
면적
방 개수
층수
역까지 거리
```

같은 정보가 들어갈 수 있다.

이처럼 모델이 input으로 사용하는 각각의 정보를 **feature**라고 부른다.

이번 주에는 vector로 묶지는 않는다.

다음 주 이후 여러 feature를 다룰 때 자연스럽게 등장시킨다.

---

## 1.9 Loss가 낮으면 항상 좋은 모델인가?

이번 주에는 일단 다음처럼 생각한다.

> 우리가 원하는 행동을 Loss가 잘 표현한다면, Loss를 낮추는 것은 좋은 방향이다.

하지만 나중에 중요한 문제가 생긴다.

- 학습 데이터의 Loss만 낮추면 되는가?
- 새로운 데이터에서도 잘 작동하는가?

이 문제는 Week 6에서 Train/Test와 Overfitting을 배우며 다시 돌아온다.

---

## 1.10 코드로 아주 조금 보기

```python
x = 2
y = 6

w = 2

prediction = w * x
loss = (prediction - y) ** 2

print(prediction)
print(loss)
```

여기서 학생이 이해해야 할 것은 Python 문법보다 흐름이다.

```text
parameter
→ prediction
→ loss
```

---

## Checkpoint

1. 모델의 parameter란 무엇인가?
2. parameter \(w\)가 바뀌면 왜 loss가 달라지는가?
3. Loss는 무엇을 숫자로 나타내려고 하는가?
4. `Loss를 minimize한다`는 표현을 자신의 말로 설명해보자.

---

## 선택 과제

### [Check] Parameter 찾기

\[
\hat y = wx,\qquad x=3,\qquad y=12
\]

다음 \(w\) 각각에 대해 prediction과 squared error loss를 계산한다.

```text
w = 1
w = 2
w = 3
w = 4
w = 5
```

어떤 \(w\)에서 Loss가 최소인가?

---

### [Apply] 직접 Loss Curve 만들기

Python에서:

```python
for w in range(-5, 10):
    ...
```

을 사용하여 각 \(w\)에 대한 loss를 출력한다.

가능하면 matplotlib으로 그래프도 그려본다.

---

### [Explore] Loss를 바꿔보기

다음 두 loss를 비교한다.

\[
L_1 = |\hat y-y|
\]

\[
L_2 = (\hat y-y)^2
\]

큰 오차가 발생했을 때 어떤 차이가 있는지 설명해본다.

---

## 이번 주 한 장 요약

```text
Model = parameter를 가진 함수

Parameter
   ↓
Prediction
   ↓
Target과 비교
   ↓
Loss

Learning의 목표:
Loss가 작은 parameter를 찾기
```

---

## 다음 주 Preview

이번 주에는 좋은 parameter가 어떤 것인지는 알았다.

그러나 실제 Neural Network에는 parameter가 수천만 개 있을 수 있다.

> **"모든 parameter 값을 하나씩 시험해볼 수 없다면 Loss가 작은 곳을 어떻게 찾을까?"**

다음 주에 Gradient Descent를 배운다.

---
