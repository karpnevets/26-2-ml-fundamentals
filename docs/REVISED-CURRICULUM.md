> 현재 버전은 본문/퀴즈를 DB에 저장합니다. 최초 자료 이관은 [비공개 자료 이관 안내](PRIVATE-CONTENT.md)를 먼저 따르세요. 아래의 이전 파일 기반 안내보다 우선합니다.

# 개정 커리큘럼 적용 안내

`ml_sig_revised_content`의 원고를 기준으로 사이트의 0–8주차 본문, 용어 사전, 학습 목표, 소요 시간, 과제, 최종 프로젝트를 교체했습니다. 홈페이지의 디자인은 유지합니다.

## 바뀐 연결

- 2주차: Vectors & Linear Classification (이전 3주차의 실험/노트북)
- 3주차: Feature Space & Nonlinear Problems (이전 4주차의 실험/노트북)
- 4주차: Optimization, Gradient Descent & Chain Rule (이전 2주차의 실험/노트북)
- 5주차: MLP, Activation & Backpropagation
- 6–8주차: Classification Training, CNN, ResNet의 새 원고

퀴즈 초안은 각 회차의 직전 주차를 복습하도록 재배치했습니다. 기존 실습 노트북은 실험 내용에 맞는 새 주차로 이동하고 제목과 돌아가기 링크를 맞췄습니다. 노트북은 본문 전체를 복제한 교재가 아니라 별도 실습입니다. 이미 개인 Drive에 복사한 노트북은 자동 변경되지 않습니다.

## 운영자가 해야 할 작업

1. **운영 사이트의 DATABASE_URL이 가리키는 Neon 프로젝트·브랜치**의 SQL Editor를 엽니다.
2. 이 저장소의 최신 **`db/setup.sql` 전체**를 복사해 실행합니다. 파일을 업로드하는 것이 아니라 SQL 내용을 실행합니다. `BEGIN`부터 `COMMIT`까지 포함하세요. 기존 DB와 빈 DB 모두 지원합니다. 개별 004 파일 대신 setup 전체 실행을 권장합니다.
3. 배포된 사이트의 `/admin/course`를 새로고침합니다.
4. **3·4·5주차 퀴즈**를 열어 설명에 적힌 주차와 암호를 확인하고 다시 공개합니다. 이전 퀴즈가 없었던 주차는 새 초안을 저장하고 공개해야 합니다.
5. 필요하면 이전 관리자 본문/Colab 링크에서 유지할 내용을 백업에서 확인하여 새 본문에 반영합니다.

이번 변경에 새 환경변수는 없습니다. 코드의 커밋·푸시가 Neon에 SQL을 자동 실행하지는 않습니다. SQL 실행 전에는 새 버전의 관리자 수정본과 퀴즈만 조회하므로 이전 원고가 새 강의를 덮어쓰지 않습니다. DB 적용을 마치기 전에는 관리자 저장/퀴즈 기능을 사용하지 마세요.

## 기존 데이터 처리

`004_revised_curriculum.sql`은 setup에 포함되어 있습니다. 이관 완료 표시를 남겨 다시 실행해도 이후 편집 내용이나 기록을 초기화하지 않습니다.

| 데이터 | 이관 동작 |
|---|---|
| 계정 및 이미 열린 주차 | 유지 |
| 개념 완료 기록 | 같은 이름의 개념을 유지하고 이전 2→4, 3→2, 4→3주차로 이동 |
| 새로 추가/이름이 바뀐 개념 | 미완료로 시작 |
| 선택 과제 완료 기록 | 원본 백업 후 새 과제는 미완료로 시작 |
| 관리자 본문 및 맞춤 Colab 링크 | 원본 백업 후 새 원고와 기본 노트북 링크 사용 |
| 퀴즈 | 원본 백업 후 이전 3→5, 4→3, 5→4로 이동. 옮긴 퀴즈만 비공개로 전환. 2·6·7·8주차 공개 상태 유지 |

이전 본문·퀴즈·학습 항목은 `curriculum_content_archive`, 이전 학습 기록은 `curriculum_progress_archive`의 `revised-v2` 백업에 보존됩니다. 사용자 삭제 시 해당 사용자의 백업 학습 기록도 삭제됩니다. 개정 반영 여부는 `curriculum_revisions`에서 확인할 수 있습니다.

기기 기록은 `ml-sig-progress-v1`을 그대로 남겨 두고 `ml-sig-progress-v2`로 한 번 이관합니다. 같은 개념만 새 주차에 연결하며, 과제 기록은 옮기지 않습니다. 계정으로 가져오기와 주차 잠금 규칙은 유지합니다.

## 원고와 표시

- 사용자 원본: `content-source/revised/`
- 실제 사이트 본문: `content/`
- 가져오기: `node scripts/import-revised-content.mjs <원고 폴더>`
- 핵심 수식은 항상 표시합니다. 명시적인 `<details>` 예시만 접습니다.
- 수식의 보이지 않는 form-feed 문자 네 곳을 가져올 때 `\frac`으로 복구합니다. 원본은 수정하지 않습니다.
- Check / Apply / Explore에 여러 문항이 있으면 모두 보여 주고 단계마다 완료 체크 하나를 사용합니다.
- 기존 `scripts/import-content.mjs`는 이전 원고용입니다. 개정 원고에는 사용하지 마세요.

## 검증

`node scripts/check-content.mjs`, `pnpm test`, `pnpm build`와 `node scripts/revised-browser-check.mjs`를 사용합니다. 브라우저 검증은 로컬 서버 3000번 포트가 필요합니다. `python scripts/check-notebooks.py`는 NumPy/Matplotlib/PyTorch 환경에서 실행합니다. 운영 Neon 데이터에 대한 이관 실행은 운영자가 수행합니다.
