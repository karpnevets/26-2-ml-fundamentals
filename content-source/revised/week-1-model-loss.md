---
title: "Model, Parameter, Prediction, Loss"
week: 1
question: "모델이 학습한다는 것은 정확히 무엇이 바뀐다는 뜻일까?"
concepts: ["Model", "Parameter", "Feature", "Prediction", "Target", "Loss", "Dataset Loss"]
estimated_time: "120–150 min"
---

# Week 1 — Model, Parameter, Prediction, Loss

## 1.1 이번 주의 목표

이번 주에는 아직 Gradient Descent를 배우지 않는다. 먼저 학습의 대상을 정확히 잡는다.

이 주차를 마치면 다음 문장을 자신의 말로 설명할 수 있어야 한다.

> **모델은 parameter를 가진 함수이고, 학습은 데이터를 기준으로 더 적절한 parameter를 찾는 과정이다.**

여기서 중요한 것은 "더 적절하다"를 감으로 판단하지 않고 **loss라는 숫자**로 표현한다는 점이다.

---

## 1.2 모델을 가장 작은 형태로 시작하기

다음 함수를 생각하자.

\[
\hat y = wx+b
\]

이 식에서:

- \(x\): input
- \(w,b\): parameter
- \(\hat y\): prediction

이다.

예를 들어 \(x=2\), \(w=3\), \(b=1\)이면:

\[
\hat y = 3\cdot2+1=7
\]

이다.

여기서 모델은 특별한 "AI 물체"가 아니다. 현재 단계에서는 단순히:

> **input을 받아 prediction을 계산하는 parameterized function**

이라고 생각하면 된다.

---

## 1.3 Parameter는 무엇인가?

같은 input \(x=2\)를 넣어도 parameter가 다르면 prediction이 달라진다.

\[
\hat y=wx
\]

라고 단순화해보자.

| \(w\) | \(x\) | \(\hat y\) |
|---:|---:|---:|
| 1 | 2 | 2 |
| 2 | 2 | 4 |
| 3 | 2 | 6 |
| 4 | 2 | 8 |

즉 parameter는 모델의 행동을 결정한다.

머신러닝에서 **학습한다**는 말은 대개 이러한 parameter 값을 데이터에 맞게 조정한다는 뜻이다.

---

## 1.4 Feature와 sample

실제 input에는 정보가 하나만 있지 않다.

예를 들어 집값을 예측한다면 한 집은 다음과 같은 정보를 가질 수 있다.

```text
면적 = 84 m²
방 개수 = 3
층수 = 12
역까지 거리 = 0.6 km
```

각각의 입력 정보를 **feature**라고 부른다.

그리고 한 집처럼 하나의 관측 대상을 **sample** 또는 **data point**라고 부른다.

이번 주에는 여러 feature를 수학적으로 묶는 방법까지 들어가지 않는다. Week 2에서 vector를 이용해 다룬다.

---

## 1.5 Prediction과 Target

모델이 만든 값은 prediction이다.

실제로 맞혀야 하는 정답을 target이라고 하자.

\[
\hat y = \text{prediction}, \qquad y = \text{target}
\]

예를 들어:

```text
모델 예측: 4.2
실제 정답: 5.0
```

이라면 prediction과 target 사이에 오차가 있다.

전체 흐름은 다음과 같다.

```text
Input x
   ↓
Model fθ
   ↓
Prediction ŷ

Target y ─────────┐
                  ↓
            둘을 비교
```

여기서 \(\theta\)는 모델의 모든 parameter를 한꺼번에 나타내는 기호로 자주 사용한다.

---

## 1.6 "더 좋은 모델"을 어떻게 숫자로 표현할까?

두 모델이 있다고 하자.

```text
Model A prediction = 4.9
Model B prediction = 2.0
Target             = 5.0
```

직관적으로 Model A가 더 잘 맞혔다.

그러나 학습 알고리즘에게 "A가 더 좋아 보인다"라고 말할 수는 없다. 모델의 prediction이 target과 얼마나 잘 맞는지를 **숫자 하나**로 만들어야 한다.

그 숫자를 loss라고 한다.

---

## 1.7 Squared Error Loss

회귀 문제에서 가장 단순한 예로 squared error를 사용할 수 있다.

\[
\ell(\hat y,y)=(\hat y-y)^2
\]

이 식은 반드시 항상 보이도록 둔다. 이번 과정에서 loss의 역할을 이해하기 위한 핵심 수식이다.

### 왜 제곱할까?

prediction이 target보다 크든 작든 오차의 크기를 양수로 만들 수 있다.

예를 들어 target이 6일 때:

\[
\hat y=4 \Rightarrow (4-6)^2=4
\]

\[
\hat y=8 \Rightarrow (8-6)^2=4
\]

오차의 방향은 다르지만 정답에서 같은 거리만큼 떨어져 있으므로 같은 loss가 나온다.

<details>
<summary>예시: absolute error와 squared error 비교</summary>

absolute error는:

\[
|\hat y-y|
\]

이다.

오차가 2일 때:

```text
absolute error = 2
squared error  = 4
```

오차가 10일 때:

```text
absolute error = 10
squared error  = 100
```

squared error는 큰 오차에 훨씬 큰 값을 준다. 어떤 loss를 선택하느냐는 "어떤 종류의 오류를 얼마나 심하게 평가할 것인가"와 관련된다.

</details>

---

## 1.8 Parameter가 바뀌면 Loss가 바뀐다

아주 단순하게:

\[
\hat y=wx, \qquad x=2, \qquad y=6
\]

라고 하자.

loss는:

\[
L(w)=(wx-y)^2=(2w-6)^2
\]

이다.

| \(w\) | prediction \(\hat y\) | loss |
|---:|---:|---:|
| 0 | 0 | 36 |
| 1 | 2 | 16 |
| 2 | 4 | 4 |
| 3 | 6 | 0 |
| 4 | 8 | 4 |
| 5 | 10 | 16 |

이 표에서 가장 중요한 연결은 다음이다.

\[
\text{parameter} \rightarrow \text{prediction} \rightarrow \text{loss}
\]

즉 학습할 parameter가 바뀌면 prediction이 바뀌고, prediction이 달라지면 loss도 달라진다.

---

## 1.9 Loss를 Parameter의 함수로 보기

위 예시에서는:

\[
L(w)=(2w-6)^2
\]

이므로 loss를 \(w\)의 함수로 볼 수 있다.

```text
Loss
 ^
 | *             *
 |   *         *
 |     *     *
 |       * *
 |        *
 +--------------------> w
          3
```

\(w=3\)에서 loss가 가장 작다.

따라서 학습 목표를 다음처럼 쓸 수 있다.

\[
w^*=\arg\min_w L(w)
\]

여기서 \(\arg\min\)은 **함숫값 자체가 아니라 그 함숫값을 가장 작게 만드는 입력값**을 찾는다는 뜻이다.

- \(\min_w L(w)\): 가장 작은 loss 값
- \(\arg\min_w L(w)\): 그 loss를 만드는 parameter \(w\)

이 구분은 지금 당장 외울 필요는 없지만, 수식을 읽을 때 의미를 알아둘 필요가 있다.

---

## 1.10 실제 데이터는 sample 하나가 아니다

지금까지는 sample 하나만 생각했다.

하지만 실제 dataset에는 여러 sample이 있다.

\[
\{(x_1,y_1),(x_2,y_2),\dots,(x_N,y_N)\}
\]

각 sample의 loss를:

\[
\ell_i=\ell(f_\theta(x_i),y_i)
\]

라고 하면, dataset 전체를 기준으로 한 평균 loss를 다음처럼 둘 수 있다.

\[
J(\theta)=\frac{1}{N}\sum_{i=1}^{N}\ell(f_\theta(x_i),y_i)
\]

이 식도 핵심 수식이므로 접지 않는다.

의미를 한 줄씩 읽으면:

1. \(x_i\)를 모델에 넣어 prediction을 만든다.
2. prediction과 \(y_i\)를 비교해 sample 하나의 loss를 계산한다.
3. 모든 sample의 loss를 더한다.
4. sample 수 \(N\)으로 나눠 평균낸다.

실제 학습에서는 이와 같은 **여러 sample에 대한 평균 loss를 낮추는 parameter**를 찾는다.

---

## 1.11 Loss와 Metric은 같은가?

둘은 역할이 다를 수 있다.

### Loss

parameter를 학습하는 기준으로 사용한다.

### Metric

사람이 모델 성능을 해석하기 위해 보는 평가 지표다.

예를 들어 classification에서는:

```text
loss     : Cross-Entropy
metric   : Accuracy
```

처럼 사용할 수 있다.

이번에는 개념만 구분해 둔다. Cross-Entropy와 Accuracy는 Week 6에서 제대로 다룬다.

---

## 1.12 Loss를 작게 만들면 무조건 좋은 모델인가?

아직은 다음과 같이 생각하자.

> 주어진 데이터에 대해 우리가 원하는 행동을 loss가 잘 표현한다면, loss를 낮추는 방향은 의미가 있다.

하지만 중요한 문제가 남는다.

```text
Training data의 loss가 매우 낮다
        ↓
새로운 data에서도 잘할까?
```

항상 그렇지는 않다.

Week 6에서 **generalization과 overfitting**을 배우며 이 질문을 다시 수정한다.

---

## 1.13 코드로 연결하기

```python
x = 2.0
y = 6.0

w = 2.0
b = 0.0

prediction = w * x + b
loss = (prediction - y) ** 2

print("prediction:", prediction)
print("loss:", loss)
```

이 코드에서 먼저 변수 이름을 수식과 연결한다.

```text
x, y              : data
w, b              : parameter
prediction        : ŷ
loss              : ℓ(ŷ, y)
```

학습 코드를 읽을 때도 항상 이 역할을 먼저 구분해야 한다.

<details>
<summary>예시: 여러 parameter 값을 직접 시험해보기</summary>

```python
x = 2.0
y = 6.0

for w in [0, 1, 2, 3, 4, 5]:
    prediction = w * x
    loss = (prediction - y) ** 2
    print(w, prediction, loss)
```

이 코드는 좋은 parameter를 찾는 효율적인 방법이 아니다. 단지 **parameter가 바뀔 때 loss가 어떻게 변하는지**를 관찰하기 위한 예시다.

</details>

---

## 1.14 이번 주에서 일부러 답하지 않는 질문

지금은 다음을 모른다.

> parameter가 수백만 개라면 loss가 작은 값을 어떻게 찾는가?

이번 주에는 brute-force search나 Gradient Descent를 넣지 않는다.

먼저 Week 2와 Week 3에서 **모델의 입력 표현과 linear model의 한계**를 이해한 뒤, Week 4에서 parameter optimization을 본격적으로 다룬다.

---

# Checkpoint

1. 모델을 "parameter를 가진 함수"라고 말하는 이유를 설명해보자.
2. parameter와 input은 어떻게 다른가?
3. prediction과 target은 어떻게 다른가?
4. loss는 어떤 역할을 하는가?
5. \(\ell(\hat y,y)=(\hat y-y)^2\)에서 prediction이 target과 같으면 loss는 얼마인가?
6. \(J(\theta)=\frac1N\sum_i\ell_i\)가 왜 필요한가?
7. loss를 작게 만드는 것과 "새로운 데이터에서 잘하는 것"은 왜 완전히 같은 말이 아닐 수 있는가?

---

# 선택 과제

## [Check] Parameter와 Data 구분

다음 식에서 각 기호의 역할을 적는다.

\[
\hat y=w_1x_1+w_2x_2+b
\]

- input feature:
- parameter:
- prediction:

## [Check] Loss 계산

\[
y=4
\]

일 때 prediction이 각각 다음이라면 squared error를 계산한다.

```text
ŷ = 3
ŷ = 5
ŷ = 1
```

## [Apply] Dataset 평균 loss

세 sample의 squared error가 각각:

```text
1, 4, 9
```

일 때 평균 loss를 계산한다.

그 다음 왜 "합" 대신 "평균"을 사용하면 dataset 크기가 달라도 값의 규모를 비교하기 쉬운지 설명한다.

## [Apply] Loss curve 그리기

\[
L(w)=(2w-6)^2
\]

를 \(w=-2\)부터 \(w=8\)까지 그려본다.

다음을 표시한다.

- minimum 위치
- \(w=0\)일 때 loss
- \(w=5\)일 때 loss

## [Explore] 다른 loss 설계

prediction과 target 차이를 평가하는 함수를 직접 하나 제안한다.

그 loss가 다음 상황에 어떤 값을 주는지 생각한다.

```text
오차가 아주 작을 때
오차가 아주 클 때
prediction이 target과 정확히 같을 때
```

---

# 이번 주 한 장 요약

```text
Data
  ↓
Model fθ
  ↓
Prediction ŷ
  ↓
Target y와 비교
  ↓
Loss

Parameter θ가 바뀌면
Prediction이 바뀌고
Loss도 바뀐다.

학습의 핵심 문제:
"어떤 θ가 작은 loss를 만드는가?"
```

# 다음 주 Preview

지금까지는 input을 거의 숫자 하나처럼 다뤘다.

실제 데이터는 여러 feature를 갖는다.

> **여러 feature를 하나의 수학적 대상으로 묶고, 그 정보로 데이터를 두 class로 나누려면 어떻게 해야 할까?**
