import type { QuizQuestion } from "./course-policy";
const items: Record<number, [string, string][]> = {
  2: [
    ["모델이 ŷ=wx이고 x=2, w=3일 때 예측값 ŷ는?", "6"],
    ["예측값이 6, 정답이 4일 때 제곱 오차 (ŷ−y)²는?", "4"],
  ],
  3: [
    ["w=5, 학습률=0.1, gradient=20일 때 경사하강법으로 한 번 갱신한 w는?", "3"],
    ["f(x)=x²의 x=2에서의 미분값은?", "4"],
  ],
  4: [
    ["벡터 [1,2]와 [3,4]의 내적은?", "11"],
    ["점수 z=w·x+b에서 w·x=11, b=−3이면 z는?", "8"],
  ],
  5: [
    ["새 feature를 x²로 정의했을 때 x=3의 새 feature 값은?", "9"],
    ["2차원 입력 (x₁,x₂)에 x₁²+x₂²를 추가하면 총 feature 개수는?", "3"],
  ],
  6: [
    ["ReLU(−3)의 값은?", "0"],
    ["ReLU(4)의 값은?", "4"],
  ],
  7: [
    [
      "학습 데이터 100개를 batch size 20으로 나눌 때 1 epoch의 batch 수는? (나머지 없음)",
      "5",
    ],
    ["위 조건에서 3 epoch 동안 parameter update는 총 몇 번 일어나는가?", "15"],
  ],
  8: [
    [
      "5×5 입력에 3×3 filter, stride 1, padding 0을 적용하면 출력 한 변의 길이는?",
      "3",
    ],
    ["2×2 영역 [1,4;2,3]에 max pooling을 적용한 값은?", "4"],
  ],
};
export function quizTemplate(week: number) {
  return {
    questions: (items[week] || []).map(
      ([description, answer], i): QuizQuestion => ({
        number: i + 1,
        description,
        answer,
        image: "",
      }),
    ),
    instructions:
      "각 문항의 숫자 정답을 문제 번호 순서대로 공백 없이 이어 붙이세요. 예: 1번이 12, 2번이 3이면 암호는 123입니다.",
    published: false,
    revision: 0,
  };
}
