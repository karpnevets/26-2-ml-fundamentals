# ML 기초 SIG 웹사이트 콘텐츠 설계안

> 대상: 머신러닝/파이썬/선형대수 배경지식이 거의 없는 다양한 전공의 학습자  
> 최종 목표: **ResNet 구조를 보고 각 구성요소가 왜 필요한지 설명할 수 있는 수준**  
> 진행 철학: 수학을 먼저 쌓고 모델로 가는 방식보다, **문제 → 필요성 → 개념 → 수식 → 실습** 순서로 이해를 만든다.  
> 권장 구성: **선택 0주차 + 본 과정 8주**

---

# 0. 사이트 전체 구성 아이디어

## 0.1 사이트의 핵심 경험

사이트는 단순한 강의노트 모음이 아니라, 각 주차마다 다음 흐름이 반복되는 학습 경로를 제공하는 것이 좋다.

1. **이번 주의 질문**
2. **왜 이 질문이 필요한가**
3. **핵심 개념**
4. **그림/직관**
5. **최소 수식**
6. **짧은 확인 문제**
7. **선택 과제**
8. **다음 주로 이어지는 질문**

학습자가 "새로운 용어를 외운다"기보다, 매주 하나의 문제를 해결하면서 자연스럽게 다음 개념으로 이동하게 하는 것이 목표다.

---

## 0.2 추천 정보 구조

```text
/
├─ home
│  ├─ SIG 소개
│  ├─ 전체 로드맵
│  └─ 시작하기
│
├─ week-0
├─ week-1
├─ week-2
├─ week-3
├─ week-4
├─ week-5
├─ week-6
├─ week-7
├─ week-8
│
├─ glossary
├─ playground
├─ assignments
└─ references
```

### Home

첫 화면에는 아래 정도만 보여준다.

- SIG의 목표
- 8주 로드맵
- 각 주차의 핵심 질문
- "수학을 몰라도 되는가?", "Python을 몰라도 되는가?" FAQ
- Week 0 선택 여부

### 각 Week 페이지

권장 페이지 구조:

```text
[이번 주 핵심 질문]

1. 지난주 복습
2. 문제 상황
3. 핵심 개념 A
4. 핵심 개념 B
5. 수식으로 정리
6. 코드/시각화
7. Checkpoint Quiz
8. 선택 과제
9. 이번 주 한 장 요약
10. 다음 주 Preview
```

---

## 0.3 선택 과제의 난이도 체계

모든 과제를 필수로 만들지 않는다.

각 주차마다 세 단계로 나누는 것을 추천한다.

### Level 1 — Check
개념을 제대로 이해했는지 확인한다.

- 짧은 서술형
- 그림 해석
- 수식의 각 항 설명
- 코드 빈칸 채우기

### Level 2 — Apply
배운 개념을 직접 사용한다.

- 작은 계산
- 간단한 코드 수정
- parameter 변경 실험
- 결과 비교

### Level 3 — Explore
흥미 있는 학습자를 위한 선택 과제다.

- 모델 변형
- 추가 실험
- 짧은 조사
- 결과 해석
- 심화 개념 연결

사이트에서는 다음처럼 태그를 붙여도 좋다.

```text
[Check]   약 10분
[Apply]   약 20~40분
[Explore] 약 30~90분
```

---

## 0.4 진행도 UI 아이디어

각 주차 페이지 상단:

```text
Week 3 / 8
████████░░░░░░░░
```

또는 개념별 체크박스:

```text
☑ Vector
☑ Dot Product
☐ Hyperplane
☐ Perceptron
```

선택 과제는 강제 완료 조건으로 두지 않고, 완료 상태만 기록할 수 있게 한다.

---

## 0.5 수식과 코드의 표시 원칙

### 수식
수식은 항상 다음 순서로 소개한다.

1. 말로 의미 설명
2. 그림
3. 간단한 숫자 예시
4. 마지막에 일반 수식

### 코드
코드 역시 완성본보다 먼저 구조를 보여준다.

```python
prediction = model(x)
loss = ...
gradient = ...
parameter = ...
```

그 뒤 실제 구현을 보여준다.

---

# Week 0 — Python / Colab Survival Kit

> 선택 주차  
> 핵심 질문: **"앞으로 나올 코드를 겁먹지 않고 읽으려면 무엇만 알면 될까?"**

---

## 0.1 학습 목표

이 주차를 끝내면 다음을 할 수 있으면 충분하다.

- 변수에 값을 저장할 수 있다.
- list와 numpy array의 차이를 대략 안다.
- `for` 문을 읽을 수 있다.
- 간단한 함수를 읽고 호출할 수 있다.
- `numpy` 배열의 `shape`를 확인할 수 있다.
- Colab에서 셀을 실행할 수 있다.

Python을 완전히 배우는 것이 목적이 아니다.

---

## 0.2 변수

```python
x = 3
name = "cat"
```

변수는 값을 붙여놓는 이름이라고 생각한다.

수학의 변수와 완전히 동일하지는 않지만, 초반에는 비슷한 직관으로 충분하다.

---

## 0.3 리스트

```python
x = [1, 2, 3]
```

여러 값을 한 번에 저장한다.

인덱스:

```python
x[0]
```

첫 번째 값이 `1`이라는 점을 확인한다.

---

## 0.4 반복문

```python
for i in range(5):
    print(i)
```

ML에서는 데이터를 반복해서 처리하거나 training step을 여러 번 수행할 때 자주 사용한다.

---

## 0.5 함수

```python
def square(x):
    return x * x
```

함수는 input을 받아 output을 만드는 블록이라고 생각한다.

이 개념은 이후 "model도 함수"라는 설명과 연결된다.

---

## 0.6 NumPy Array

```python
import numpy as np

x = np.array([1, 2, 3])
```

NumPy array는 숫자 계산을 위한 배열이다.

```python
x.shape
```

를 반드시 익숙하게 만든다.

---

## 0.7 Shape

```python
x = np.array([[1, 2, 3],
              [4, 5, 6]])

x.shape
```

결과:

```text
(2, 3)
```

"2개의 행, 3개의 열" 정도로 이해하면 된다.

---

## Checkpoint

1. `x = [3, 5, 7]`에서 `x[1]`은 무엇인가?
2. `for` 문은 왜 필요한가?
3. `shape = (32, 10)`이라는 표현을 보면 어떤 느낌으로 이해하면 되는가?

---

## 선택 과제

### [Check]
다음 코드의 출력 결과를 예상한다.

```python
x = 1

for i in range(3):
    x = x + 2

print(x)
```

### [Apply]
NumPy로 `(3, 4)` shape의 배열을 만들어 본다.

### [Explore]
Python list와 NumPy array에 `* 2`를 했을 때 결과가 어떻게 다른지 관찰한다.

---

## 다음 주 Preview

다음 주에는 Python 코드보다 먼저 다음 질문을 다룬다.

> **"Machine Learning 모델이 학습한다는 것은 대체 무엇이 바뀐다는 뜻일까?"**

---

# Week 1 — 모델이 학습한다는 것은 무엇인가?

> 핵심 질문: **"모델은 무엇을 학습하는가?"**

---

## 1.1 이번 주의 목표

다음 문장을 자신의 말로 설명할 수 있으면 성공이다.

> **모델은 parameter를 가진 함수이고, 학습은 prediction이 target에 가까워지도록 parameter를 바꾸는 과정이다.**

이번 주에는 Gradient Descent를 아직 배우지 않는다.

먼저 "무엇을 바꾸는가"와 "좋다는 것을 어떻게 측정하는가"부터 이해한다.

---

# 1.2 가장 단순한 모델

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

# 1.3 Target

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

# 1.4 Loss는 왜 필요한가?

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

# 1.6 Loss Landscape의 가장 단순한 형태

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

# 1.7 Model / Parameter / Prediction / Loss

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

# 1.8 Feature

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

# 1.9 Loss가 낮으면 항상 좋은 모델인가?

이번 주에는 일단 다음처럼 생각한다.

> 우리가 원하는 행동을 Loss가 잘 표현한다면, Loss를 낮추는 것은 좋은 방향이다.

하지만 나중에 중요한 문제가 생긴다.

- 학습 데이터의 Loss만 낮추면 되는가?
- 새로운 데이터에서도 잘 작동하는가?

이 문제는 Week 6에서 Train/Test와 Overfitting을 배우며 다시 돌아온다.

---

# 1.10 코드로 아주 조금 보기

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

# 이번 주 한 장 요약

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

# 다음 주 Preview

이번 주에는 좋은 parameter가 어떤 것인지는 알았다.

그러나 실제 Neural Network에는 parameter가 수천만 개 있을 수 있다.

> **"모든 parameter 값을 하나씩 시험해볼 수 없다면 Loss가 작은 곳을 어떻게 찾을까?"**

다음 주에 Gradient Descent를 배운다.

---

# Week 2 — Loss를 어떻게 줄일까?

> 핵심 질문: **"좋은 parameter를 효율적으로 어떻게 찾을까?"**

---

## 2.1 지난주에서 남은 문제

지난주에는 parameter를 여러 값으로 바꿔보았다.

하지만 parameter가 1억 개라면 가능한가?

아니다.

모든 경우를 시도하는 대신:

> **현재 위치에서 Loss가 어느 방향으로 내려가는지만 알면 되지 않을까?**

라는 아이디어를 사용한다.

---

# 2.2 함수와 그래프

예:

\[
L(w)=(w-3)^2
\]

Loss의 그래프:

```text
Loss
 ^
 |       /\
 |      /  \
 |     /    \
 |____/______\____> w
        3
```

정확한 그림은 U자 형태다.

현재 \(w=0\)이라면 오른쪽으로 이동해야 한다.

현재 \(w=5\)라면 왼쪽으로 이동해야 한다.

---

# 2.3 기울기

그래프 위 한 점에서의 slope를 생각한다.

- slope > 0: 오른쪽으로 갈수록 증가
- slope < 0: 오른쪽으로 갈수록 감소
- slope = 0: 평평한 지점

미분은 바로 이 **현재 위치에서의 순간적인 기울기**를 알려준다.

\[
\frac{dL}{dw}
\]

---

# 2.4 Gradient Descent

Loss를 줄이고 싶으므로 slope와 반대 방향으로 이동한다.

\[
w \leftarrow w - \eta \frac{dL}{dw}
\]

각 항의 의미:

- \(w\): 현재 parameter
- \(\frac{dL}{dw}\): 현재 위치의 slope
- \(\eta\): learning rate
- `-`: 올라가는 방향의 반대로 이동

---

# 2.5 실제 계산

\[
L(w)=(w-3)^2
\]

미분:

\[
\frac{dL}{dw}=2(w-3)
\]

현재:

\[
w=0
\]

이면:

\[
\frac{dL}{dw}=-6
\]

learning rate:

\[
\eta=0.1
\]

이면:

\[
w_{\text{new}}
=
0-0.1(-6)
=
0.6
\]

즉 0에서 3 방향으로 이동한다.

---

# 2.6 Learning Rate

### 너무 작으면

```text
0 → 0.1 → 0.2 → 0.3 → ...
```

안정적이지만 느리다.

### 적당하면

```text
0 → 1.2 → 2.1 → 2.7 → ...
```

빠르게 minimum으로 간다.

### 너무 크면

```text
0 → 8 → -4 → 12 → ...
```

minimum을 계속 넘어갈 수 있다.

---

# 2.7 여러 parameter가 있다면?

parameter가:

\[
w_1,w_2
\]

두 개라고 하자.

각 parameter가 Loss에 미치는 영향을 각각 계산한다.

\[
\frac{\partial L}{\partial w_1},
\qquad
\frac{\partial L}{\partial w_2}
\]

이를 하나로 묶은 것이 gradient다.

\[
\nabla L
=
\begin{bmatrix}
\frac{\partial L}{\partial w_1}\\
\frac{\partial L}{\partial w_2}
\end{bmatrix}
\]

따라서:

\[
\theta
\leftarrow
\theta-\eta\nabla_\theta L
\]

---

# 2.8 Chain Rule은 왜 필요한가?

모델은 보통 여러 계산을 연결한다.

\[
w
\rightarrow
\hat y
\rightarrow
L
\]

우리가 알고 싶은 것은:

\[
\frac{dL}{dw}
\]

이다.

그러나 Loss는 \(w\)를 직접 사용하지 않고 prediction \(\hat y\)를 통해 결정된다.

그래서:

\[
\frac{dL}{dw}
=
\frac{dL}{d\hat y}
\frac{d\hat y}{dw}
\]

이것이 chain rule이다.

---

# 2.9 Backpropagation의 예고

Neural Network에서는:

```text
w
↓
Linear
↓
Activation
↓
Linear
↓
Prediction
↓
Loss
```

처럼 계산이 길어진다.

하지만 핵심은 동일하다.

> **최종 Loss에서 시작하여 chain rule을 통해 parameter까지 영향도를 거꾸로 계산한다.**

Week 5에서 이를 Backpropagation이라는 이름으로 다시 만난다.

---

## Checkpoint

1. Gradient Descent가 왜 gradient의 반대 방향으로 이동하는가?
2. Learning Rate가 너무 크면 어떤 문제가 생길 수 있는가?
3. Chain Rule은 왜 필요한가?
4. `gradient = 0`이면 반드시 가장 좋은 parameter인가? 생각해보자.

---

## 선택 과제

### [Check]

\[
L(w)=(w-4)^2
\]

일 때:

\[
w=1,\qquad \eta=0.1
\]

한 번 Gradient Descent update를 수행한다.

---

### [Apply] GD 직접 구현

```python
w = -5
lr = 0.1

for step in range(20):
    loss = ...
    grad = ...
    w = ...
```

각 step의 \(w\)와 loss를 출력한다.

---

### [Explore] Learning Rate 비교

다음을 각각 실험한다.

```text
lr = 0.001
lr = 0.1
lr = 0.9
lr = 1.1
```

어떤 일이 일어나는지 그래프로 비교한다.

---

# 이번 주 한 장 요약

```text
현재 parameter
    ↓
Loss의 slope 계산
    ↓
slope 반대 방향으로 이동
    ↓
Loss 감소 시도

w ← w - η dL/dw
```

---

# 다음 주 Preview

지금까지는 input이 숫자 하나였다.

하지만 실제 데이터에는 여러 feature가 있다.

> **"여러 feature를 사용해서 데이터를 두 종류로 나누려면 어떻게 해야 할까?"**

---

# Week 3 — Linear Classification

> 핵심 질문: **"여러 feature를 이용해 어떻게 경계를 만들까?"**

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

# 3.2 Vector

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

# 3.3 Weighted Sum

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

# 3.4 Dot Product

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

# 3.5 Classification

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

# 3.6 Decision Boundary

두 class가 갈리는 위치는:

\[
w^Tx+b=0
\]

이다.

2차원에서는 직선이다.

3차원에서는 평면이다.

더 높은 차원에서는 hyperplane이라고 부른다.

---

# 3.7 Hyperplane의 의미

중요한 것은 용어가 아니다.

> **Linear classifier는 feature space를 하나의 평평한 경계로 둘로 나눈다.**

이것이 핵심이다.

---

# 3.8 Perceptron

Perceptron은 linear classifier를 학습하는 고전적인 알고리즘이다.

prediction이 틀렸을 때 weight를 수정한다.

직관적으로:

```text
틀린 데이터 발견
   ↓
이 데이터를 맞히는 쪽으로 boundary 이동
```

---

# 3.9 Perceptron Update

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

# 3.10 GD와 Perceptron은 같은가?

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

# 이번 주 한 장 요약

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

# 다음 주 Preview

Linear classifier는 강력하지만 결정적인 한계가 있다.

> **"아무리 선을 잘 그어도 직선 하나로 나눌 수 없는 데이터는 어떻게 할까?"**

---

# Week 4 — Feature Space와 Nonlinear Problem

> 핵심 질문: **"직선으로 풀 수 없는 문제는 어떻게 풀까?"**

---

## 4.1 Linearly Separable

다음 데이터는 직선 하나로 분리할 수 있다.

```text
○ ○ ○    × × ×
○ ○      × ×
```

이런 데이터를 linearly separable하다고 한다.

---

# 4.2 XOR

XOR 데이터:

| \(x_1\) | \(x_2\) | label |
|---:|---:|---:|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

공간에서 보면 대각선 방향으로 같은 class가 있다.

직선 하나로는 분리할 수 없다.

---

# 4.3 문제는 모델인가, Representation인가?

현재 feature:

\[
(x_1,x_2)
\]

만 가지고는 어렵다.

하지만 새로운 feature를 추가하면 어떨까?

\[
x_3=x_1x_2
\]

그러면 새로운 공간:

\[
(x_1,x_2,x_1x_2)
\]

에서 문제를 다시 볼 수 있다.

---

# 4.4 Feature Transformation

일반적으로:

\[
x
\rightarrow
\phi(x)
\]

처럼 input을 새로운 feature space로 변환할 수 있다.

예:

\[
\phi(x_1,x_2)
=
(x_1,x_2,x_1x_2)
\]

---

# 4.5 원형 데이터

예를 들어:

```text
× × × × ×
×   ○ ○ ×
×   ○ ○ ×
× × × × ×
```

처럼 중심과 바깥을 분리한다고 하자.

원래 \((x_1,x_2)\) 공간에서는 직선 하나로 분리하기 어렵다.

새로운 feature:

\[
x_3=x_1^2+x_2^2
\]

를 추가하면:

\[
x_3 < r^2
\]

인지 여부로 쉽게 분류할 수 있다.

---

# 4.6 Representation의 중요성

이번 주의 가장 중요한 문장:

> **좋은 representation을 찾으면 어려운 문제가 쉬운 문제가 될 수 있다.**

Linear classifier의 성능은 classifier 자체뿐만 아니라 어떤 feature를 넣는지에 크게 좌우된다.

---

# 4.7 사람이 Feature를 만든다면

전통적인 ML에서는 domain knowledge를 이용해 사람이 좋은 feature를 직접 설계하는 경우가 많았다.

예:

이미지:

```text
raw pixel
→ edge
→ corner
→ texture
```

텍스트:

```text
sentence
→ word count
→ keyword frequency
```

---

# 4.8 Kernel Trick — 선택 개념

Feature transformation:

\[
\phi(x)
\]

를 명시적으로 계산하지 않고도:

\[
K(x,z)=\phi(x)^T\phi(z)
\]

를 직접 계산할 수 있는 경우가 있다.

이를 kernel trick이라고 한다.

이번 과정에서는 깊게 다루지 않는다.

핵심 메시지는:

> **Linear model의 한계를 feature space를 바꾸어 극복할 수 있다.**

이다.

---

## Checkpoint

1. Linearly separable하다는 것은 무슨 뜻인가?
2. XOR가 linear classifier로 어려운 이유는?
3. Feature transformation은 무엇을 바꾸는가?
4. 원형 데이터를 \(x_1^2+x_2^2\)라는 feature로 표현하면 왜 쉬워지는가?

---

## 선택 과제

### [Check] XOR Feature

XOR 데이터에 대해:

\[
x_3=x_1x_2
\]

를 추가한 표를 직접 작성한다.

---

### [Apply] 원형 데이터 분류

`make_circles` 또는 직접 생성한 원형 데이터를 사용한다.

1. 원래 \((x_1,x_2)\)로 perceptron 학습
2. \(x_1^2+x_2^2\) 추가
3. 다시 학습
4. 결과 비교

---

### [Explore] 직접 Feature 만들기

다음 데이터 패턴 중 하나를 만들고 사람이 feature를 설계해본다.

- 두 개의 원
- 포물선
- checkerboard
- 두 개의 moon

어떤 feature를 추가하면 분리가 쉬워지는지 설명한다.

---

# 이번 주 한 장 요약

```text
Linear classifier의 한계
     ↓
Feature Transformation
     ↓
더 좋은 Representation
     ↓
새 공간에서 Linear Classification
```

---

# 다음 주 Preview

지금까지는 사람이 직접 좋은 feature를 만들었다.

하지만 이미지처럼 복잡한 데이터에서는 사람이 모든 feature를 설계하기 어렵다.

> **"Feature 자체를 모델이 학습하게 만들 수 없을까?"**

---

# Week 5 — MLP와 Representation Learning

> 핵심 질문: **"Feature를 모델이 직접 학습할 수 있을까?"**

---

## 5.1 지난주의 한계

지난주에는:

\[
x\rightarrow\phi(x)
\]

를 사람이 직접 만들었다.

이번에는:

\[
x\rightarrow h
\]

라는 새로운 representation을 모델이 학습하도록 만든다.

---

# 5.2 Linear Layer

먼저:

\[
z=Wx+b
\]

를 생각한다.

이는 여러 input feature를 새로운 feature로 변환한다.

---

# 5.3 Linear Layer를 여러 개 쌓으면?

\[
z_1=W_1x
\]

\[
z_2=W_2z_1
\]

그러면:

\[
z_2=W_2W_1x
\]

이다.

즉 결국 하나의 큰 linear transformation과 같다.

따라서 linear layer만 계속 쌓아서는 nonlinear problem을 해결하는 능력이 늘지 않는다.

---

# 5.4 Nonlinearity

그래서 중간에 nonlinear function을 넣는다.

\[
h=\sigma(Wx+b)
\]

여기서 \(\sigma\)가 activation function이다.

---

# 5.5 ReLU

가장 대표적인 activation 중 하나:

\[
\operatorname{ReLU}(x)=\max(0,x)
\]

그래프:

```text
y
^
|      /
|     /
|    /
|___/________> x
```

음수는 0, 양수는 그대로 통과시킨다.

---

# 5.6 MLP

가장 간단한 MLP:

\[
h=\operatorname{ReLU}(W_1x+b_1)
\]

\[
\hat y=W_2h+b_2
\]

구조:

```text
Input
 ↓
Linear
 ↓
ReLU
 ↓
Linear
 ↓
Output
```

---

# 5.7 Hidden Representation

중간값 \(h\)는 사람이 직접 설계한 feature가 아니다.

모델이 학습 과정에서 스스로 만들어낸 representation이다.

즉:

```text
Raw Input
   ↓
Learned Feature
   ↓
Prediction
```

---

# 5.8 Universal Approximation Theorem — 언급만

충분한 크기의 neural network는 매우 다양한 함수를 근사할 수 있다는 이론이 있다.

하지만 중요한 점:

> **표현할 수 있다는 것과 실제로 잘 학습할 수 있다는 것은 다른 문제다.**

이후 CNN과 ResNet이 필요한 이유와 연결된다.

---

# 5.9 Backpropagation

MLP에는 여러 parameter가 있다.

\[
W_1,b_1,W_2,b_2
\]

Loss:

\[
L
\]

를 줄이려면 각 parameter에 대한 gradient가 필요하다.

Week 2의 chain rule을 계산 graph에 반복 적용한다.

```text
Loss
 ↑
Output
 ↑
Linear
 ↑
ReLU
 ↑
Linear
 ↑
Input
```

Loss에서 시작하여 gradient를 뒤로 전달한다.

이를 Backpropagation이라고 한다.

---

# 5.10 PyTorch Autograd

PyTorch에서는:

```python
loss.backward()
```

를 호출하면 계산 graph를 따라 gradient를 자동으로 계산한다.

각 parameter에는:

```python
parameter.grad
```

형태로 gradient가 저장된다.

---

# 5.11 매우 작은 PyTorch 모델

```python
import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(2, 8),
    nn.ReLU(),
    nn.Linear(8, 2)
)
```

이 코드를 외우는 것이 목적이 아니다.

각 줄이 어떤 수학적 block에 대응하는지 이해한다.

---

## Checkpoint

1. Linear layer를 여러 번 쌓아도 왜 여전히 linear한가?
2. Activation function이 필요한 이유는?
3. Hidden representation은 누가 만드는가?
4. Backpropagation은 무엇을 계산하는 과정인가?
5. `.backward()`는 무엇을 자동화하는가?

---

## 선택 과제

### [Check]

다음 모델에서 각 부분의 역할을 설명한다.

```python
nn.Linear(2, 8)
nn.ReLU()
nn.Linear(8, 2)
```

---

### [Apply] XOR MLP

Week 4의 XOR 데이터를 MLP로 분류한다.

사람이 polynomial feature를 추가하지 않아도 학습 가능한지 확인한다.

---

### [Explore] Activation 비교

같은 MLP에서 다음을 바꿔본다.

- ReLU
- Sigmoid
- Tanh

학습 속도와 loss curve를 비교한다.

---

# 이번 주 한 장 요약

```text
사람이 feature 설계
        ↓
Neural Network
        ↓
모델이 feature 학습

Linear
→ Nonlinearity
→ Linear
→ Prediction
```

---

# 다음 주 Preview

지금까지는 Neural Network의 구조를 만들었다.

하지만 실제 classification을 하려면 아직 여러 질문이 남아 있다.

> "여러 class 중 하나를 어떻게 출력하지?"  
> "학습 데이터를 어떻게 반복해서 보여주지?"  
> "학습 데이터만 외우면 어떻게 하지?"

---

# Week 6 — Neural Network Training

> 핵심 질문: **"Neural Network를 실제로 어떻게 학습할까?"**

---

## 6.1 Multi-Class Classification

예:

```text
cat
dog
bird
```

세 class 중 하나를 선택해야 한다.

모델은 다음처럼 score를 출력할 수 있다.

\[
z=
\begin{bmatrix}
2.1\\
-0.4\\
1.2
\end{bmatrix}
\]

이 값을 **logit**이라고 부른다.

---

# 6.2 Softmax

logit을 class별 probability처럼 해석할 수 있는 값으로 바꾼다.

\[
p_i
=
\frac{e^{z_i}}
{\sum_j e^{z_j}}
\]

결과는:

\[
0<p_i<1
\]

이며:

\[
\sum_i p_i=1
\]

이다.

---

# 6.3 Cross-Entropy

정답 class의 probability가 높아지도록 만들고 싶다.

정답 class가 \(y\)일 때:

\[
L=-\log p_y
\]

정답 probability가 높으면 Loss가 작다.

정답 probability가 낮으면 Loss가 크다.

---

# 6.4 실제 Training Loop

```python
for x, y in dataloader:
    prediction = model(x)
    loss = criterion(prediction, y)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
```

---

## 각 줄을 지금까지 배운 내용과 연결

### `prediction = model(x)`

Week 1:

```text
input → model → prediction
```

### `loss = criterion(...)`

Week 1:

```text
prediction vs target → loss
```

### `loss.backward()`

Week 2, 5:

```text
chain rule → gradient
```

### `optimizer.step()`

Week 2:

```text
gradient descent
```

이것이 전체 training이다.

---

# 6.5 Epoch

전체 training dataset을 한 번 다 사용하면 1 epoch이다.

예:

```text
Dataset 1000 samples

1 epoch
= 1000 samples를 모두 한 번 사용
```

---

# 6.6 Batch

1000개 sample을 한꺼번에 넣지 않고 나눈다.

예:

```text
batch size = 32
```

이면 32개씩 처리한다.

---

# 6.7 Train / Validation / Test

데이터를 세 부분으로 나눌 수 있다.

### Train
parameter를 학습하는 데 사용한다.

### Validation
hyperparameter 선택과 학습 상태 확인에 사용한다.

### Test
최종 모델의 generalization을 평가한다.

---

# 6.8 Generalization

우리가 원하는 것은:

> training data를 잘 맞히는 모델

이 아니라:

> **처음 보는 데이터에도 잘 작동하는 모델**

이다.

이를 generalization이라고 한다.

---

# 6.9 Overfitting

Training performance는 좋아지는데 validation/test performance가 나빠질 수 있다.

```text
Train Accuracy      ↑ ↑ ↑ ↑
Validation Accuracy ↑ ↑ ↓ ↓
```

모델이 training data의 세부적인 패턴을 지나치게 외운 상태를 overfitting이라고 한다.

---

# 6.10 Week 1의 질문으로 돌아가기

Week 1에서는:

> Loss가 낮으면 좋은 모델이라고 생각하자.

라고 했다.

이제 더 정확하게:

> **Training Loss가 낮다는 것만으로 좋은 모델이라고 할 수 없다. 새로운 데이터에서 잘 작동해야 한다.**

라고 수정한다.

---

## Checkpoint

1. Logit과 probability는 같은가?
2. Softmax는 어떤 역할을 하는가?
3. Cross-Entropy는 어떤 prediction을 좋아하는가?
4. Batch와 Epoch의 차이는?
5. Training loss가 낮아도 Test 성능이 나쁠 수 있는 이유는?

---

## 선택 과제

### [Check]

다음 예측 중 정답이 class 0일 때 어느 쪽의 Cross-Entropy loss가 더 작을지 설명한다.

```text
A: [0.9, 0.05, 0.05]
B: [0.4, 0.3, 0.3]
```

---

### [Apply] Training Loop 완성

빈칸을 채운다.

```python
for x, y in dataloader:
    pred = ______
    loss = ______

    optimizer.________
    loss.________
    optimizer.________
```

---

### [Explore] Overfitting 관찰

작은 training set으로 비교적 큰 MLP를 학습한다.

매 epoch마다:

```text
train loss
validation loss
```

를 기록하고 그래프로 그린다.

---

# 이번 주 한 장 요약

```text
Input
 ↓
Model
 ↓
Logits
 ↓
Cross-Entropy Loss
 ↓
Backpropagation
 ↓
Gradient Descent
 ↓
Parameter Update

그리고:
Train 성능 ≠ Generalization
```

---

# 다음 주 Preview

MLP는 이미지도 처리할 수 있다.

이미지를 긴 vector로 펼쳐서 넣으면 된다.

그런데:

> **"이미지라는 데이터가 가진 구조를 완전히 무시해도 괜찮을까?"**

---

# Week 7 — CNN과 Inductive Bias

> 핵심 질문: **"이미지에는 어떤 구조가 있으며, 모델은 그것을 어떻게 이용할까?"**

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

# 7.2 이미지의 구조

이미지에는 다음과 같은 특징이 있다.

### Locality
서로 가까운 pixel끼리 관계가 강하다.

### Repeated Pattern
edge나 texture는 이미지의 여러 위치에 등장할 수 있다.

### Spatial Structure
pixel의 위치 관계 자체가 중요하다.

---

# 7.3 Inductive Bias

모델 구조에 특정 종류의 데이터에 대한 가정을 넣는 것을 inductive bias라고 볼 수 있다.

CNN의 경우:

> **가까운 영역에서 반복되는 local pattern이 중요하다.**

라는 bias를 구조에 넣는다.

---

# 7.4 Convolution

작은 filter를 이미지 위에서 이동시킨다.

예:

\[
3\times3
\]

filter.

각 위치에서 local region과 filter의 weighted sum을 계산한다.

---

# 7.5 Filter

예를 들어 특정 filter는 edge에 강하게 반응할 수 있다.

```text
Input Image
   ↓
Filter
   ↓
Feature Map
```

---

# 7.6 Weight Sharing

같은 filter를 이미지 전체 위치에서 사용한다.

즉 같은 pattern detector를 여러 위치에서 재사용한다.

이것이 parameter 수를 크게 줄이고 spatial structure를 활용하게 한다.

---

# 7.7 Channel

RGB 이미지는:

```text
R
G
B
```

3개의 channel을 가진다.

CNN을 지나면 channel은 단순한 색이 아니라 다양한 learned feature map을 의미하게 된다.

---

# 7.8 Feature Hierarchy

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

# 7.9 Pooling

Pooling은 feature map의 spatial size를 줄이는 대표적인 방법이다.

예:

```text
2×2 Max Pooling
```

가장 큰 값을 선택한다.

현대 CNN에서는 pooling 대신 stride convolution 등도 사용한다.

이번 과정에서는 개념적 역할만 이해한다.

---

# 7.10 Receptive Field

한 neuron이 input image의 어느 범위를 보고 있는지를 receptive field라고 한다.

layer가 깊어질수록 더 넓은 영역의 정보를 사용할 수 있다.

---

# 7.11 CNN vs MLP

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

# 이번 주 한 장 요약

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

# 다음 주 Preview

CNN이 좋다면 더 많은 layer를 쌓으면 계속 좋아질까?

> **"깊은 CNN은 왜 학습하기 어려우며, ResNet은 무엇을 바꾸었을까?"**

---

# Week 8 — ResNet

> 핵심 질문: **"깊은 CNN을 어떻게 안정적으로 학습할까?"**

---

## 8.1 Deep Network

CNN을 깊게 만들면 더 복잡한 representation을 만들 수 있다.

그러나 단순히 layer를 계속 추가한다고 항상 성능이 좋아지는 것은 아니다.

학습 자체가 어려워질 수 있다.

---

# 8.2 Gradient가 긴 경로를 지나갈 때

Deep network:

```text
Input
 ↓
Layer
 ↓
Layer
 ↓
Layer
 ↓
...
 ↓
Loss
```

gradient는 반대 방향으로 긴 계산 graph를 지나가야 한다.

---

# 8.3 Vanishing Gradient

여러 작은 값이 계속 곱해지면 gradient가 매우 작아질 수 있다.

앞쪽 layer가 거의 update되지 않는 문제가 생길 수 있다.

---

# 8.4 Explosion

반대로 큰 값이 반복해서 곱해지면 gradient가 매우 커질 수 있다.

학습이 불안정해질 수 있다.

---

# 8.5 Degradation Problem

중요한 점:

> Deep network의 문제를 모두 vanishing gradient 하나로 설명하면 안 된다.

Normalization과 좋은 initialization을 사용해도 더 깊은 plain network가 오히려 training error가 증가하는 degradation 문제가 관찰되었다.

ResNet은 이 optimization 문제를 완화하는 구조를 제안했다.

---

# 8.6 Residual Learning

기존 block:

\[
y=F(x)
\]

Residual block:

\[
y=x+F(x)
\]

여기서 \(F(x)\)는 input 전체를 새로 만드는 대신:

> **input에서 얼마나 바뀌어야 하는가**

를 학습한다고 해석할 수 있다.

---

# 8.7 Skip Connection

구조:

```text
x ──────────────────┐
│                   │
└→ Conv → ReLU → Conv → (+) → y
```

입력 \(x\)가 block의 transformation을 건너뛰어 output에 직접 더해진다.

이를 skip connection 또는 shortcut connection이라고 한다.

---

# 8.8 왜 도움이 되는가?

Residual connection에는 여러 관점이 있다.

### Identity Mapping이 쉬워짐

필요하다면:

\[
F(x)\approx0
\]

으로 만들면:

\[
y\approx x
\]

가 된다.

깊은 block이 기존 representation을 망가뜨리지 않고 유지하기 쉬워진다.

### Gradient Path

skip connection을 통해 gradient가 더 직접적인 경로로 흐를 수 있다.

---

# 8.9 CNN과 결합

Residual function \(F(x)\) 안에 convolution을 넣는다.

예:

```text
Input
  │
  ├────────────────────┐
  │                    │
Conv                    │
  ↓                     │
BN                      │
  ↓                     │
ReLU                    │
  ↓                     │
Conv                    │
  ↓                     │
BN                      │
  └────────── (+) ◄─────┘
              ↓
             ReLU
```

---

# 8.10 Batch Normalization — 최소 설명

ResNet block에서 자주 등장한다.

BatchNorm은 activation의 scale을 안정화하여 학습을 쉽게 하는 데 도움을 준다.

이번 SIG에서는 BatchNorm의 상세 통계적 유도보다:

> **deep network optimization을 안정화하는 대표적인 normalization 기법**

정도로 이해한다.

---

# 8.11 ResNet 전체

전체 구조를 단순화하면:

```text
Image
 ↓
Initial Conv
 ↓
Residual Blocks
 ↓
Residual Blocks
 ↓
Residual Blocks
 ↓
Global Average Pooling
 ↓
Linear Classifier
 ↓
Class Prediction
```

---

# 8.12 이제 각 요소를 다시 해석해보자

### Conv
Week 7에서 배운 image inductive bias를 사용한다.

### ReLU
Week 5에서 배운 nonlinearity다.

### Linear Classifier
Week 3에서 배운 classification의 확장이다.

### Loss
Week 1에서 배운 prediction 평가 기준이다.

### Backpropagation
Week 2, 5에서 배운 gradient 계산 과정이다.

### Residual Connection
deep network를 더 잘 optimize하기 위한 shortcut이다.

즉 ResNet은 완전히 새로운 개념들의 집합이 아니라:

> **지금까지 배운 요소들이 하나의 modern architecture 안에서 결합된 결과**

이다.

---

# 8.13 최종 목표

학생이 ResNet diagram을 보고 다음 질문에 답할 수 있으면 과정의 목표를 달성한 것이다.

1. Conv는 왜 사용하는가?
2. ReLU가 왜 필요한가?
3. 왜 여러 layer를 쌓는가?
4. Skip connection은 무엇을 하는가?
5. 최종 classifier는 무엇을 출력하는가?
6. Loss는 어디에서 계산되는가?
7. Gradient는 어떻게 각 parameter까지 전달되는가?
8. Training loss와 test performance는 왜 다른 문제인가?

---

## Checkpoint

1. Residual block의 기본 식은?
2. \(F(x)=0\)이라면 output은 어떻게 되는가?
3. Skip connection이 optimization에 도움이 되는 이유를 하나 설명하라.
4. ResNet이 단순히 "vanishing gradient 해결 모델"이라고만 설명하면 부족한 이유는?
5. ResNet 안에서 Week 1~7 개념을 최소 4개 찾아 연결해보자.

---

## 선택 과제

### [Check] Block 해석

다음 구조의 각 줄이 어떤 역할인지 설명한다.

```python
Conv2d
BatchNorm2d
ReLU
Conv2d
BatchNorm2d
Skip Add
ReLU
```

---

### [Apply] Tiny ResNet 구현

간단한 residual block을 직접 작성한다.

```python
class ResidualBlock(nn.Module):
    def __init__(self, ...):
        ...

    def forward(self, x):
        residual = x
        out = ...
        out = out + residual
        return ...
```

---

### [Explore] Plain CNN vs ResNet

비슷한 parameter 수를 가진:

- plain deep CNN
- residual CNN

을 비교한다.

가능한 비교:

```text
training loss
validation accuracy
gradient norm
convergence speed
```

실험 결과를 해석한다.

---

# 최종 한 장 요약

```text
Week 1
Model / Parameter / Loss
        ↓
Week 2
Gradient Descent
        ↓
Week 3
Linear Classification
        ↓
Week 4
Feature Space
        ↓
Week 5
MLP / Learned Representation
        ↓
Week 6
Training / Generalization
        ↓
Week 7
CNN / Image Inductive Bias
        ↓
Week 8
Residual Learning / ResNet
```

---

# 사이트용 추가 페이지 제안

## 1. Glossary

용어 사전을 별도 페이지로 둔다.

예:

### Parameter
모델이 학습 과정에서 조정하는 값.

### Hyperparameter
학습 전에 사람이 정하는 설정값.

예:

- learning rate
- batch size
- hidden dimension

### Feature
모델이 input으로 사용하는 개별 정보.

### Gradient
parameter를 조금 바꿨을 때 loss가 어느 방향으로 얼마나 변하는지를 나타내는 값.

각 주차 페이지에서 용어를 클릭하면 glossary가 작은 popup으로 뜨게 하면 좋다.

---

# 2. Playground

가능하다면 다음 interactive demo를 별도 모아두는 것이 좋다.

## Loss Playground

slider:

```text
w = [----●------]
```

바꾸면:

```text
Prediction
Loss
Loss Curve의 현재 위치
```

가 동시에 업데이트된다.

Week 1~2에 매우 효과적이다.

---

## Hyperplane Playground

2D point를 직접 찍고:

```text
w1
w2
b
```

를 slider로 움직인다.

decision boundary가 실시간으로 움직인다.

Week 3에 사용.

---

## Feature Space Playground

원형 데이터에:

```text
x₁² + x₂²
```

feature를 추가하기 전/후를 나란히 보여준다.

Week 4에 사용.

---

## Activation Playground

ReLU / Sigmoid / Tanh를 선택하면:

- function graph
- derivative graph

를 보여준다.

Week 5에 사용.

---

## CNN Filter Playground

작은 grayscale image와 \(3\times3\) filter를 보여주고 convolution 결과를 직접 계산할 수 있게 한다.

Week 7에 사용.

---

## Residual Playground

두 모델 비교:

```text
F(x)
```

vs

```text
x + F(x)
```

를 간단한 function fitting 문제에서 시각화한다.

Week 8에 활용.

---

# 3. 각 주차 Summary Card

홈 화면 또는 주차 마지막에 카드 형태로 보여준다.

예:

```text
┌──────────────────────────┐
│ Week 4                   │
│ Feature Space            │
│                          │
│ 핵심 질문                │
│ 직선으로 풀 수 없다면?   │
│                          │
│ 핵심 문장                │
│ Representation을 바꾸면 │
│ 문제가 쉬워질 수 있다.  │
└──────────────────────────┘
```

---

# 4. "왜 배우나요?" 박스

초보자에게 특히 중요하다.

각 개념 위에:

> **왜 배우나요?**

박스를 둘 수 있다.

예:

### Dot Product

> 여러 feature의 weighted sum을 한 번에 표현하기 위해 사용한다.

### ReLU

> Linear layer만 여러 번 쌓으면 전체 모델도 linear하므로 nonlinearity가 필요하다.

### Convolution

> 이미지의 local structure와 repeated pattern을 효율적으로 이용하기 위해 사용한다.

### Skip Connection

> 깊은 network가 기존 representation을 유지하면서 필요한 변화만 학습하기 쉽게 한다.

---

# 5. 수학 난이도 Toggle

사이트에서 수학 설명을 두 단계로 나누는 것도 좋다.

```text
[직관] [수식 보기]
```

기본은 직관 설명.

원하는 학생만 수식을 펼친다.

예:

### Gradient Descent

기본:

> 경사가 올라가는 방향이라면 반대로 움직인다.

"수식 보기":

\[
\theta_{t+1}
=
\theta_t-\eta\nabla_\theta L
\]

이런 식이다.

---

# 6. 코드 난이도 Toggle

```text
[개념만 보기]
[코드 보기]
[직접 구현]
```

Python 초보자가 수업을 따라가기 위해 코드 때문에 페이지를 포기하지 않게 한다.

---

# 7. Prerequisite 표시

각 주차 페이지 상단:

```text
이번 주에 필요한 것

✓ Week 1: Model / Loss
✓ Week 2: Gradient
○ Python: numpy shape 정도
```

이렇게 표시한다.

---

# 8. 선택 과제 Progress

예:

```text
Week 4

Check   ✅
Apply   ✅
Explore ⬜
```

Explore를 하지 않아도 다음 주로 넘어갈 수 있게 한다.

---

# 9. 추천 과제 제출 형태

가능하면 정답 한 줄 제출보다 짧은 설명을 요구한다.

예:

> "Learning rate가 너무 크면 왜 문제가 생기는지 한 문장으로 설명하세요."

> "CNN이 MLP보다 image data에 적합한 이유를 locality라는 단어를 사용해 설명하세요."

개념을 자신의 언어로 표현하는 능력이 중요하다.

---

# 10. 최종 프로젝트 아이디어

8주차 이후 선택 프로젝트를 둘 수 있다.

## Project A — MNIST

다음 세 모델을 비교한다.

- Linear Classifier
- MLP
- CNN

질문:

1. 각 모델의 inductive bias는 무엇인가?
2. parameter 수는?
3. validation 성능은?
4. 왜 결과가 다를까?

---

## Project B — CIFAR-10

- Small CNN
- Small ResNet

을 비교한다.

목표는 높은 accuracy 자체가 아니라:

> **왜 architecture가 달라졌을 때 optimization과 generalization이 달라지는가**

를 설명하는 것이다.

---

# 구현을 위한 Markdown Frontmatter 예시

Codex에서 static site generator를 사용할 경우 각 주차를 별도 Markdown 파일로 나눌 수 있다.

예:

```yaml
---
title: "Week 3 — Linear Classification"
week: 3
question: "여러 feature를 이용해 어떻게 경계를 만들까?"
prerequisites:
  - "Week 1: Model / Loss"
  - "Week 2: Gradient Descent"
concepts:
  - Vector
  - Dot Product
  - Hyperplane
  - Perceptron
estimated_time: "90–120 min"
---
```

---

# 파일 분리 예시

```text
content/
├─ index.md
├─ week-0-python.md
├─ week-1-model-loss.md
├─ week-2-gradient-descent.md
├─ week-3-linear-classification.md
├─ week-4-feature-space.md
├─ week-5-mlp.md
├─ week-6-training.md
├─ week-7-cnn.md
├─ week-8-resnet.md
├─ glossary.md
├─ playground.md
└─ final-project.md
```

---

# 디자인 방향

## 메인 화면

과도하게 AI스럽거나 화려한 디자인보다 학습 플랫폼에 가까운 구성을 추천한다.

```text
ML Fundamentals SIG

[Week 1] Model & Loss
   ↓
[Week 2] Gradient Descent
   ↓
[Week 3] Linear Classification
   ↓
...
[Week 8] ResNet
```

각 주차를 node처럼 연결하면 전체 학습 경로가 시각적으로 드러난다.

---

## 색상보다 구조

학습 내용은 다음 시각 요소 정도면 충분하다.

- 본문
- 핵심 문장 강조
- 수식 박스
- "왜?" 박스
- Checkpoint
- 선택 과제
- 다음 주 Preview

장식적 UI보다 정보 계층이 명확한 것이 중요하다.

---

# 강의 운영 원칙

## 1. 먼저 질문한다

```text
왜 Loss가 필요한가?
왜 activation이 필요한가?
왜 CNN이 필요한가?
왜 ResNet이 필요한가?
```

항상 필요성을 먼저 제시한다.

---

## 2. 수식은 마지막에 붙인다

```text
현상
→ 그림
→ 숫자 예시
→ 언어
→ 수식
```

순서를 지킨다.

---

## 3. 이전 개념을 반복해서 재사용한다

예:

Week 6의 training loop에서:

- Week 1 Loss
- Week 2 Gradient Descent
- Week 5 Backprop

을 다시 호출한다.

---

## 4. 새 용어의 수를 제한한다

한 섹션에서 새로운 핵심 용어는 가능하면 2~3개 이하로 제한한다.

---

## 5. 구현보다 해석을 우선한다

초보자의 목표는 처음부터 완전한 모델을 작성하는 것이 아니다.

먼저:

> **코드를 읽고 각 줄이 어떤 ML 개념인지 설명할 수 있게 한다.**

그 다음 직접 구현한다.

---

# 최종 학습 성과

전체 과정을 마친 학습자는 최소한 다음을 자신의 말로 설명할 수 있어야 한다.

1. Model과 parameter는 무엇인가?
2. Loss는 왜 필요한가?
3. Gradient Descent는 왜 loss를 줄일 수 있는가?
4. Vector와 dot product가 linear model에 왜 등장하는가?
5. Hyperplane은 무엇인가?
6. Linear classifier가 풀 수 없는 문제는 왜 생기는가?
7. Feature transformation은 무엇인가?
8. MLP는 feature를 어떻게 학습하는가?
9. Activation은 왜 필요한가?
10. Backpropagation은 무엇을 계산하는가?
11. Softmax와 Cross-Entropy는 어디에 쓰이는가?
12. Training과 Test는 왜 분리하는가?
13. Overfitting은 무엇인가?
14. CNN이 image에 적합한 이유는 무엇인가?
15. Inductive Bias란 무엇인가?
16. Convolution의 locality와 weight sharing은 무엇인가?
17. Deep network가 왜 어려울 수 있는가?
18. Residual connection은 무엇인가?
19. ResNet에서 이전 1~7주차 개념들이 어떻게 결합되는가?

이 19개 질문에 답할 수 있다면, 이후 Transformer, GNN, Representation Learning 등의 중급 과정으로 넘어갈 수 있는 충분한 기반을 갖춘 것으로 본다.
