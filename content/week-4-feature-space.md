---
title: "Feature Space"
week: 4
question: "직선으로 풀 수 없는 문제는 어떻게 풀까?"
concepts: ["Feature Space","Polynomial Features","Linear Separability"]
estimated_time: "90–120 min"
---

---

## 4.1 Linearly Separable

다음 데이터는 직선 하나로 분리할 수 있다.

```text
○ ○ ○    × × ×
○ ○      × ×
```

이런 데이터를 linearly separable하다고 한다.

---

## 4.2 XOR

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

## 4.3 문제는 모델인가, Representation인가?

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

## 4.4 Feature Transformation

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

## 4.5 원형 데이터

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

## 4.6 Representation의 중요성

이번 주의 가장 중요한 문장:

> **좋은 representation을 찾으면 어려운 문제가 쉬운 문제가 될 수 있다.**

Linear classifier의 성능은 classifier 자체뿐만 아니라 어떤 feature를 넣는지에 크게 좌우된다.

---

## 4.7 사람이 Feature를 만든다면

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

## 4.8 Kernel Trick — 선택 개념

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

## 이번 주 한 장 요약

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

## 다음 주 Preview

지금까지는 사람이 직접 좋은 feature를 만들었다.

하지만 이미지처럼 복잡한 데이터에서는 사람이 모든 feature를 설계하기 어렵다.

> **"Feature 자체를 모델이 학습하게 만들 수 없을까?"**

---
