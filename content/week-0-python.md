---
title: "Python / Colab Survival Kit"
week: 0
question: "앞으로 나올 코드를 겁먹지 않고 읽으려면 무엇만 알면 될까?"
concepts: ["Python","NumPy","Shape"]
estimated_time: "30–60 min"
---

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
