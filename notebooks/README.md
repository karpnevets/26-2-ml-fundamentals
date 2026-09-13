# ML Fundamentals SIG · Colab 실습

각 주차의 사이트 본문에서 **Colab에서 실습하기**를 누릅니다. Colab에서 **파일 → Drive에 사본 저장**을 선택한 뒤 자신의 사본을 편집하세요. 원본 GitHub 노트북은 수정되지 않습니다. 기존 Drive 사본에는 원본 업데이트가 자동 반영되지 않습니다.

| 주차 | 실습 |
|---|---|
| 0 | Python 함수·반복문·NumPy shape |
| 1 | 예측과 MSE·parameter별 loss 곡선 |
| 2 | gradient update·학습률·수치 미분 |
| 3 | 내적·선형 분류 경계 |
| 4 | 원형 데이터와 feature transformation |
| 5 | PyTorch autograd·ReLU·XOR MLP |
| 6 | batch·epoch·CrossEntropyLoss·학습/검증 분리 |
| 7 | 작은 합성 이미지 CNN·filter·feature map·pooling |
| 8 | skip connection의 gradient 경로·plain/residual 비교 |

각 노트북은 **예상 → 실행 → Apply → Explore → 해석**으로 구성되어 있습니다. 기본 셀은 위에서 아래로 그대로 실행할 수 있습니다. 값을 바꾼 뒤에는 parameter 셀과 실행 셀을 함께 다시 실행하세요. CPU로 동작하며 GPU/데이터 다운로드/API 키가 필요 없습니다. 그래프의 축은 기본 환경의 한글 폰트 설치 없이도 읽을 수 있도록 영어를 사용합니다.

Colab 기본 NumPy/Matplotlib와 5–8주차의 PyTorch를 사용합니다. 로컬 실행 검증 환경은 Python 3.12, NumPy 2.x, Matplotlib 3.11, PyTorch 2.14 CPU입니다. 기본 패키지 import가 실패하면 새 Colab 기본 런타임을 연결하세요. Colab 자체의 자원/학교 계정 정책에 따라 이용 가능 여부가 다를 수 있습니다.

사이트의 로그인·잠금·완료 체크와 Colab 실행은 별개입니다. 실행 결과는 자신의 Drive 사본에 저장되며 사이트에 자동 전송되지 않습니다. 공개 GitHub 원본은 사이트 잠금과 무관하게 접근할 수 있습니다. 원본까지 순차 공개해야 한다면 해당 주차 노트북의 공개 시점을 별도로 관리해야 합니다.

운영자는 `/admin/course/회차`의 본문 탭에서 Colab 링크를 수정할 수 있습니다. `db/migrations/003_colab_links.sql`을 적용한 뒤 저장하세요. 비워서 저장하면 해당 주차의 실습 버튼이 숨겨집니다. migration 전에는 기본 링크가 표시됩니다.

노트북 원본 생성 스크립트는 `scripts/generate-notebooks.mjs`입니다. 원본 내용을 변경하려면 이 스크립트를 수정하고 `node scripts/generate-notebooks.mjs`를 실행합니다. 생성은 기존 노트북을 덮어쓰므로 직접 변경한 셀은 먼저 반영하세요. 실행 검증은 NumPy/Matplotlib/PyTorch 환경에서 `python scripts/check-notebooks.py`입니다. 검증은 각 노트북을 독립 프로세스에서 실행하며 결과를 저장소에 기록하지 않습니다.
