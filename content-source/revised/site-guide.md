# ML 기초 SIG 사이트 콘텐츠 / 렌더링 가이드

## 1. 사이트의 역할

사이트는 강의 슬라이드 요약본이 아니라 **독학 가능한 본문 교재**다.

Colab은 실험과 계산을 직접 실행하는 보조 자료이고, 개념 설명 자체를 Colab에 의존하지 않는다.

각 lesson page는 다음 구조를 기본으로 한다.

```text
Week title / 핵심 질문
↓
이번 주 위치와 prerequisite
↓
문제 상황
↓
핵심 개념
↓
필수 수식 + 말로 해석
↓
shape / 코드 연결
↓
Checkpoint
↓
Check / Apply / Explore
↓
한 장 요약
↓
다음 주 Preview
```

---

## 2. Markdown의 접기 규칙

표준 Markdown 자체에는 보편적인 "접기" 문법이 없다.

이 프로젝트가 MDX 또는 raw HTML을 허용하는 Markdown renderer를 사용한다면 다음 HTML을 사용한다.

```html
<details>
<summary>예시: 숫자를 넣어 계산해보기</summary>

...보충 예시...

</details>
```

### 절대 접지 않는 내용

- 새로운 개념의 정의
- 핵심 수식
- 다음 개념으로 넘어가기 위해 필요한 유도
- shape convention
- training flow
- checkpoint가 직접 묻는 내용

### 접어도 되는 내용

- 같은 식의 반복적인 숫자 예시
- 추가 손계산
- 본문에서 이미 설명한 내용을 다른 값으로 검증하는 예시
- 선택적인 추가 유도

핵심 원칙:

> **페이지를 펼치지 않고 읽어도 해당 주차의 필수 학습 목표를 100% 달성할 수 있어야 한다.**

---

## 3. 필수 수식의 UI

필수 수식은 일반 본문보다 잘 보이게 렌더링하되, 과도한 카드 UI로 본문 흐름을 끊지 않는다.

권장:

- display math
- 위/아래 충분한 여백
- 바로 아래에 한 문장 해석

예:

\[
\theta_{t+1}=\theta_t-\eta\nabla_\theta J(\theta_t)
\]

> 현재 parameter에서 loss가 증가하는 gradient의 반대 방향으로 learning rate만큼 이동한다.

---

## 4. 용어 popup

본문의 glossary term은 클릭 또는 hover 시 짧은 정의를 보여줄 수 있다.

하지만 popup 정의가 본문 설명을 대체하면 안 된다.

예:

- Parameter
- Loss
- Gradient
- Hyperplane
- Logit
- Receptive Field

---

## 5. 코드 표시 원칙

코드는 세 목적 중 하나를 가져야 한다.

1. 수식을 Python으로 옮기는 법
2. tensor/array shape를 추적하는 법
3. 실제 training architecture의 구조를 읽는 법

큰 완성 코드를 갑자기 제시하지 않는다.

먼저 작은 block을 보여준 뒤 전체 training loop나 model class로 확장한다.

---

## 6. Shape 표시

ML 초보자에게 shape는 숨은 prerequisite가 되기 쉽다.

따라서 Week 0 이후 shape가 변하는 코드에서는 가능한 한 다음처럼 명시한다.

```text
input  : (N, 2)
Linear : (N, 8)
ReLU   : (N, 8)
output : (N, 3)
```

CNN에서는:

```text
(N, C, H, W)
```

네 축을 항상 구분한다.

---

## 7. Why Box

새 개념이 등장하기 직전에는 가능하면 "왜 필요한가"를 한 문단으로 설명한다.

예:

### ReLU를 왜 넣는가?

Linear layer만 반복하면 전체 function을 하나의 linear transformation으로 합칠 수 있기 때문이다.

### Padding을 왜 쓰는가?

kernel을 적용하면 spatial size가 줄고 가장자리 정보를 다루기 어렵기 때문이다.

### Skip connection을 왜 쓰는가?

깊은 block이 기존 representation을 쉽게 보존하고 residual update만 학습할 수 있게 하기 위해서다.

---

## 8. 과제 UI

세 등급을 유지한다.

```text
[CHECK]   본문 이해 확인
[APPLY]   직접 적용
[EXPLORE] 비교/심화 실험
```

완료 상태는 localStorage에 저장해도 되지만 Explore는 필수 완료 조건에 포함하지 않는다.

---

## 9. 페이지 간 연결

각 주차는 이전 주차를 실제 수식/개념으로 다시 호출해야 한다.

예:

```text
Week 4 Chain Rule
      ↓
Week 5 Backpropagation

Week 5 MLP representation
      ↓
Week 7 CNN의 structured representation learning

Week 5 gradient path
      ↓
Week 8 residual gradient path
```

"지난주에는 이것을 배웠다" 수준보다 **어떤 수식/개념이 재사용되는지**를 보여준다.

---

## 10. 디자인

목표는 "modern university course notes"다.

- dark-first
- 높은 텍스트 대비
- 긴 본문에 적합한 reading width
- 과도한 glass / neon / gradient 금지
- 수식과 코드 가독성 우선
- desktop에서는 sticky TOC 권장
- mobile에서는 TOC collapse

---

## 11. 구현 체크리스트

- KaTeX/MathJax가 모든 display math를 안정적으로 렌더링하는가?
- `<details>` 내부의 Markdown/LaTeX가 정상 렌더링되는가?
- renderer가 raw HTML을 막는다면 동일 기능의 MDX component를 제공하는가?
- 핵심 수식이 접힌 영역에만 존재하지 않는가?
- 모든 lesson에서 이전/다음 navigation이 맞는가?
- Week 4와 Week 5가 연속되는가?
- glossary의 week 번호가 최신 curriculum과 일치하는가?
- mobile에서 긴 수식이 overflow될 때 horizontal scroll 또는 적절한 처리 방식이 있는가?
