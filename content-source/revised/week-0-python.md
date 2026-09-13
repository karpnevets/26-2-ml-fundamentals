---
title: "Python / Colab Foundations"
week: 0
question: "머신러닝 코드를 스스로 읽고 수정하려면 Python에서 무엇을 알아야 할까?"
concepts: ["Colab", "Python", "Function", "List", "NumPy", "Shape", "Indexing", "Vectorized Operation"]
estimated_time: "120–180 min"
optional: true
---

# Week 0 — Python / Colab Foundations

> 이 주차는 선택 주차다. 이미 Python의 변수, 조건문, 반복문, 함수, 리스트, NumPy 배열과 `shape`를 편하게 읽을 수 있다면 Week 1부터 시작해도 된다.

## 0.1 이번 주의 목표

이 과정에서 Python 자체를 깊게 배우지는 않는다. 대신 이후 주차의 코드를 **혼자 읽고, 숫자를 바꾸고, 오류 위치를 찾고, 배열의 모양을 확인할 수 있는 수준**을 만든다.

이 주차를 마치면 다음을 할 수 있어야 한다.

- Colab 셀을 실행하고 실행 순서가 왜 중요한지 설명할 수 있다.
- 변수와 기본 자료형을 구분할 수 있다.
- `if`, `for`, 함수를 읽고 간단히 수정할 수 있다.
- list의 indexing과 slicing을 사용할 수 있다.
- NumPy array가 list와 왜 다른지 설명할 수 있다.
- `shape`, `ndim`, `dtype`을 확인할 수 있다.
- 여러 sample이 들어 있는 2차원 배열을 읽을 수 있다.
- element-wise operation과 dot product를 구분할 수 있다.
- 에러가 났을 때 traceback의 마지막 줄부터 확인할 수 있다.

---

## 0.2 Colab은 무엇인가?

Colab은 브라우저에서 Python 코드를 실행할 수 있는 notebook 환경이다. 한 파일 안에 **설명용 Markdown 셀**과 **실행 가능한 Code 셀**을 함께 둘 수 있다.

가장 중요한 특징은 Code 셀이 서로 독립된 문서 조각이 아니라 **같은 Python 실행 상태를 공유한다**는 점이다.

```python
x = 10
```

위 셀을 먼저 실행했다면 아래 셀에서 `x`를 사용할 수 있다.

```python
print(x + 5)
```

하지만 첫 셀을 실행하지 않은 채 두 번째 셀만 실행하면 `x`가 정의되지 않았다는 오류가 난다.

### 꼭 기억할 것

- 셀 왼쪽의 실행 버튼 또는 `Shift + Enter`로 실행한다.
- 위에서 아래로 실행했다고 가정하지 말고, **실제로 어떤 셀을 실행했는지**가 중요하다.
- 코드가 이상하게 동작하면 `Runtime → Restart session` 후 처음부터 순서대로 실행하는 것이 도움이 된다.

---

## 0.3 변수와 대입

```python
x = 3
name = "cat"
learning_rate = 0.1
```

`=`는 수학의 등호라기보다 **오른쪽 값을 계산해서 왼쪽 이름에 저장한다**는 뜻이다.

```python
x = 3
x = x + 1
```

두 번째 줄은 모순이 아니다. 기존 `x`의 값 3에 1을 더한 4를 다시 `x`에 저장한다.

머신러닝 코드에서는 parameter update를 읽을 때 이 감각이 중요하다.

```python
w = w - learning_rate * gradient
```

이는 기존 `w`를 이용해 새로운 값을 계산하고 다시 `w`에 저장한다는 뜻이다.

---

## 0.4 기본 자료형

자주 보게 될 자료형은 다음 정도다.

```python
count = 3          # int
loss = 0.42        # float
name = "resnet"    # str
is_train = True    # bool
```

타입은 `type()`으로 확인할 수 있다.

```python
print(type(loss))
```

### 숫자 연산

```python
3 + 2
3 - 2
3 * 2
3 / 2
3 ** 2
```

`**`는 거듭제곱이다.

```python
error = prediction - target
loss = error ** 2
```

Week 1에서 바로 사용한다.

---

## 0.5 비교 연산과 Boolean

```python
x > 0
x < 0
x >= 3
x == 3
x != 3
```

주의: `=`와 `==`는 다르다.

- `=`: 값을 저장한다.
- `==`: 두 값이 같은지 비교한다.

비교 결과는 `True` 또는 `False`다.

---

## 0.6 조건문

```python
score = 2.4

if score > 0:
    prediction = 1
else:
    prediction = 0
```

Python에서는 중괄호 대신 **들여쓰기**가 코드 블록을 결정한다.

```python
if score > 0:
print("positive")  # 잘못된 들여쓰기
```

위 코드는 오류가 난다.

Week 2의 linear classifier와 perceptron에서 `if`가 자주 등장한다.

---

## 0.7 List

여러 값을 묶을 수 있다.

```python
scores = [0.2, 1.3, -0.7]
```

### Indexing

Python은 0부터 센다.

```python
scores[0]   # 0.2
scores[1]   # 1.3
scores[-1]  # -0.7
```

### Slicing

```python
x = [10, 20, 30, 40, 50]

x[1:4]  # [20, 30, 40]
x[:3]   # [10, 20, 30]
x[2:]   # [30, 40, 50]
```

`start:end`에서 `end` 위치는 포함하지 않는다.

---

## 0.8 반복문

```python
for i in range(5):
    print(i)
```

출력:

```text
0
1
2
3
4
```

데이터를 하나씩 처리하는 경우:

```python
values = [1, 2, 3]

for value in values:
    print(value * 2)
```

머신러닝 학습 코드는 결국 다음처럼 반복 구조를 가진다.

```python
for epoch in range(num_epochs):
    for x, y in dataloader:
        ...
```

지금은 내부 내용을 이해하지 않아도 된다. **같은 학습 절차를 여러 데이터와 여러 epoch에 반복한다**는 구조만 읽을 수 있으면 된다.

---

## 0.9 함수

```python
def square(x):
    return x * x
```

호출:

```python
y = square(4)
```

함수는 다음 구조로 읽는다.

```text
input
 ↓
function
 ↓
output
```

이 관점은 Week 1에서 모델을 이해할 때 그대로 사용한다.

### 인자가 여러 개일 수도 있다

```python
def linear(x, w, b):
    return w * x + b
```

```python
prediction = linear(x=2, w=3, b=1)
```

---

## 0.10 Library와 import

Python은 다른 사람이 만든 기능을 불러와 사용할 수 있다.

```python
import numpy as np
```

이후 `numpy`를 `np`라는 짧은 이름으로 사용한다.

```python
x = np.array([1, 2, 3])
```

자주 보게 될 형태:

```python
import numpy as np
import matplotlib.pyplot as plt
import torch
import torch.nn as nn
```

각 library의 모든 기능을 암기할 필요는 없다. **이름 앞의 `np.`, `plt.`, `torch.`가 어떤 library의 기능을 호출하는지 나타낸다**는 것만 확실히 이해한다.

---

# NumPy 기초

## 0.11 Python list와 NumPy array는 왜 다른가?

Python list는 범용적인 자료구조다.

```python
x = [1, 2, 3]
```

NumPy array는 수치 계산을 위해 설계되었다.

```python
x = np.array([1, 2, 3])
```

차이를 직접 보자.

```python
[1, 2, 3] * 2
```

결과:

```text
[1, 2, 3, 1, 2, 3]
```

반면:

```python
np.array([1, 2, 3]) * 2
```

결과:

```text
[2 4 6]
```

NumPy에서는 수학적인 배열 연산을 자연스럽게 표현할 수 있다.

---

## 0.12 Shape: 앞으로 계속 확인해야 할 정보

```python
x = np.array([1, 2, 3])
print(x.shape)
```

결과:

```text
(3,)
```

숫자 3개를 가진 1차원 배열이다.

```python
X = np.array([
    [1, 2, 3],
    [4, 5, 6]
])

print(X.shape)
```

결과:

```text
(2, 3)
```

이를 앞으로 다음처럼 읽는다.

```text
2개의 sample
각 sample마다 3개의 feature
```

즉 머신러닝에서 자주:

\[
X\in\mathbb{R}^{N\times d}
\]

라고 쓰면:

- \(N\): sample 개수
- \(d\): feature 개수

라는 뜻이다.

이 수식은 이후에도 계속 사용하므로 **접지 않고 항상 보이는 핵심 수식**으로 취급한다.

---

## 0.13 ndim과 dtype

```python
print(X.ndim)
print(X.dtype)
```

- `ndim`: 축의 개수
- `dtype`: 저장된 숫자의 종류

예를 들어 neural network에서는 `float32`를 자주 사용한다.

```python
X = X.astype(np.float32)
```

---

## 0.14 2차원 배열 Indexing

```python
X = np.array([
    [10, 20, 30],
    [40, 50, 60]
])
```

```python
X[0, 0]  # 10
X[1, 2]  # 60
X[0]     # 첫 번째 행
X[:, 1]  # 두 번째 열
```

`:`는 해당 축의 모든 값을 선택한다.

이후 dataset과 tensor를 다룰 때 매우 자주 사용한다.

---

## 0.15 Element-wise 연산

```python
x = np.array([1, 2, 3])
y = np.array([10, 20, 30])
```

```python
x + y
x * y
x ** 2
```

각 위치의 원소끼리 계산한다.

특히:

```python
x * y
```

는 **dot product가 아니다.**

---

## 0.16 Dot Product 맛보기

```python
x = np.array([1, 2, 3])
w = np.array([4, 5, 6])

score = np.dot(w, x)
```

또는:

```python
score = w @ x
```

이는:

\[
w^Tx = 4\cdot1 + 5\cdot2 + 6\cdot3
\]

을 계산한다.

Dot product의 의미는 Week 2에서 제대로 배운다. 여기서는 `*`와 `@`가 다르다는 것만 기억한다.

---

## 0.17 Broadcasting은 무엇인가?

다음 연산은 가능하다.

```python
X = np.array([
    [1, 2, 3],
    [4, 5, 6]
])

b = np.array([10, 20, 30])

X + b
```

NumPy가 `b`를 각 행에 반복해서 더해 준다.

결과:

```text
[[11, 22, 33],
 [14, 25, 36]]
```

이런 규칙을 broadcasting이라고 한다.

이후 linear layer의 bias를 이해할 때 다시 등장한다.

---

## 0.18 함수 적용과 평균

```python
x = np.array([1.0, 2.0, 3.0])

np.sum(x)
np.mean(x)
np.max(x)
```

Loss를 여러 sample에 대해 평균낼 때 `mean`이 자주 등장한다.

---

# 그래프 그리기

## 0.19 Matplotlib 최소 사용법

```python
import matplotlib.pyplot as plt

x = np.array([-2, -1, 0, 1, 2])
y = x ** 2

plt.plot(x, y)
plt.xlabel("x")
plt.ylabel("y")
plt.show()
```

산점도:

```python
plt.scatter(x1, x2)
plt.show()
```

이후 loss curve, decision boundary, training curve를 시각화할 때 사용한다.

---

# 오류 읽기

## 0.20 Traceback을 두려워하지 않기

오류가 나면 긴 메시지가 보일 수 있다.

가장 먼저 **마지막 줄**을 읽는다.

예:

```text
NameError: name 'prediciton' is not defined
```

이는 `prediciton`이라는 이름이 정의되지 않았다는 뜻이다. 오타인지 확인한다.

또 자주 만나는 오류:

### `SyntaxError`
Python 문법 자체가 잘못되었다.

### `NameError`
변수나 함수 이름이 정의되지 않았다.

### `TypeError`
해당 타입에 허용되지 않는 연산을 했다.

### `IndexError`
존재하지 않는 위치를 indexing했다.

### `ValueError`
값의 형태나 크기가 함수의 기대와 맞지 않는다. 머신러닝에서는 shape 문제로 자주 만난다.

---

# Python에서 ML 코드 읽는 법

## 0.21 한 줄씩 "값의 모양"을 추적한다

예를 들어:

```python
X = np.array([
    [1.0, 2.0],
    [3.0, 4.0],
    [5.0, 6.0]
])

w = np.array([0.5, -1.0])
b = 0.2

scores = X @ w + b
```

각 shape:

```text
X       : (3, 2)
w       : (2,)
X @ w   : (3,)
scores  : (3,)
```

앞으로 코드를 읽을 때 숫자의 의미만큼 **shape를 따라가는 습관**이 중요하다.

---

## 0.22 객체의 점(`.`)은 무엇인가?

다음 코드:

```python
x.shape
model.parameters()
optimizer.step()
```

`A.B`는 대체로 **A라는 객체가 가진 정보 또는 기능 B**라고 읽으면 된다.

- `x.shape`: 배열 `x`가 가진 shape 정보
- `optimizer.step()`: optimizer 객체의 `step` 기능 실행

객체지향 프로그래밍을 미리 깊게 배울 필요는 없다. 이 정도만 알아도 PyTorch 코드를 읽을 수 있다.

---

# Checkpoint

1. `=`와 `==`는 어떻게 다른가?
2. `x = x + 1`이 가능한 이유를 설명해보자.
3. `range(4)`는 어떤 숫자를 만든는가?
4. `return`은 함수에서 어떤 역할을 하는가?
5. Python list와 NumPy array에 `* 2`를 했을 때 왜 결과가 다른가?
6. `X.shape == (32, 10)`이면 머신러닝 맥락에서 어떻게 해석할 수 있는가?
7. `X * w`와 `X @ w`는 왜 구분해야 하는가?
8. traceback이 길 때 어디부터 읽는 것이 좋은가?

---

# 선택 과제

## [Check] 코드 결과 예측

```python
x = 2

for i in range(3):
    x = x * 2

print(x)
```

실행하지 않고 먼저 결과를 예상한다.

## [Check] Shape 읽기

다음 배열의 shape를 직접 적는다.

```python
X = np.array([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8]
])
```

그리고 "sample 수"와 "feature 수"로 해석한다.

## [Apply] Linear function 작성

다음 함수를 직접 작성한다.

```python
def linear(x, w, b):
    # y = wx + b
    ...
```

## [Apply] NumPy score 계산

3개의 sample, 2개의 feature를 가진 `X`와 weight `w`를 만들고:

```python
scores = X @ w + b
```

의 결과 shape를 확인한다.

## [Explore] Broadcasting 확인

`X.shape == (4, 3)`이고 `b.shape == (3,)`일 때 `X + b`가 왜 가능한지 각 행에 어떤 계산이 일어나는지 적어본다.

---

# 이번 주 한 장 요약

```text
Python 코드를 읽을 때

값(value)
  +
흐름(if / for / function)
  +
배열의 shape

를 동시에 추적한다.

ML 코드에서는 특히
"지금 이 변수의 shape가 무엇인가?"
를 계속 확인한다.
```

# 다음 주 Preview

이제 간단한 Python 코드를 읽을 수 있다.

다음 질문은 코드가 아니라 머신러닝 자체에 관한 것이다.

> **모델이 '학습한다'고 할 때 실제로 무엇이 바뀌며, 그 변화가 더 좋아졌다는 것은 어떻게 판단할까?**
