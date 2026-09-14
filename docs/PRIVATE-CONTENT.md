# DB에 강의 자료 저장하기

현재 강의 원본은 `course_originals.body`, 관리자 수정본은 `lesson_edits.body`에서 읽습니다. 퀴즈의 문항 설명 Markdown·정답·암호 조합 설명은 `week_quizzes.questions` / `instructions`에 저장하고, 실제 암호는 기존과 같이 scrypt 해시만 저장합니다. 용어 사전·주차 설명·최종 프로젝트는 `course_documents`에 있습니다.

저장소에는 실행 코드와 커리큘럼 메타데이터(주차·제목·개념 체크 항목)만 남깁니다. 실험실 구현 코드와 공개 Colab 노트북은 유지합니다. 학생에게는 서버에서 잠금 권한을 확인한 주차의 자료만 보내며 퀴즈 정답 필드는 제외합니다. 관리자 편집 화면의 원본 복원도 DB 원본을 사용합니다. DB 연결/원본이 없으면 파일 원고로 대체하지 않고 오류를 표시합니다.

## 이번에 실행할 SQL

운영 사이트의 DATABASE_URL이 가리키는 Neon 프로젝트·브랜치의 SQL Editor에서 **로컬 `.private-course/import-content.sql` 내용 전체를 복사하여 실행**하세요. `BEGIN;`부터 `COMMIT;`까지 한 번에 실행합니다. 업로드할 필요는 없습니다.

이 파일에는 필요한 스키마 변경과 실제 자료가 함께 들어 있으므로 별도로 `db/setup.sql`을 먼저 실행할 필요는 없습니다. 반대로 공개된 `db/setup.sql`만 실행하면 스키마만 만들어지고 본문은 들어가지 않습니다.

- 검토를 마친 0주차를 새 DB 원본으로 등록합니다.
- 기존 0주차 관리자 수정본은 백업 후 새 본문으로 바꾸고, 설정한 Colab 링크는 유지합니다.
- 1–8주차 기존 관리자 수정본은 유지하며, 파일에 있던 원본을 DB 기본 본문으로 넣습니다.
- 기존 퀴즈의 문항·정답·암호 해시·공개 상태는 유지합니다. DB에 없는 퀴즈만 이전 초안을 비공개로 넣습니다.
- 계정·학습 기록·주차 잠금은 유지합니다. 단, 이전 개정 SQL(004)을 아직 적용하지 않은 DB에서는 먼저 그 개정 이관도 실행됩니다. 그 경우 이전 3·4·5주차 퀴즈의 재공개가 필요합니다.
- 실행 완료 여부는 아래 쿼리로 확인합니다.

```sql
SELECT revision, applied_at
FROM curriculum_revisions
WHERE revision = 'private-content-v1';

SELECT week, length(body) AS characters
FROM course_originals
ORDER BY week;
```

첫 조회가 1행, 두 번째가 0–8주차 총 9행이면 등록된 것입니다. 사이트에서 `/week/0`과 `/admin/course/0`을 새로고침하세요. 새 환경변수는 없습니다. 코드 배포가 SQL을 자동 실행하지 않습니다. 운영 DB의 실제 실행은 운영자가 해야 합니다.

다시 실행해도 이후 관리자 편집을 덮어쓰지 않습니다. 이전 0주차는 `curriculum_content_archive`의 revision=`private-content-v1`, kind=`week-0-before-polish`에 보존됩니다.

## 로컬 파일과 GitHub 공개 범위

`content/`, `content-source/`, `.private-course/`, 이전 합본 Markdown은 로컬에 남기되 Git 추적에서 제거했고 `.gitignore` / `.vercelignore`에 등록했습니다. private SQL에는 원문과 퀴즈 초안이 있으므로 GitHub에 수동 업로드하거나 `git add -f`로 추가하지 마세요. 파일 사본은 별도 비공개 저장 공간에 보관하세요.

사용자의 선택에 따라 **Git 과거 기록은 수정하지 않았습니다. 이전 커밋의 학습 자료·퀴즈 예시는 여전히 열람 가능합니다.** 따라서 이번 변경이 이미 공개된 자료의 회수나 과거 암호 예시의 비밀화를 보장하지는 않습니다. 기존 공개 예시와 같은 실제 암호를 사용했다면 관리자 화면에서 새 암호로 변경할 수 있습니다. 노트북 공개 방식은 그대로입니다.

다른 컴퓨터에서 새로 clone하면 원고/SQL이 없는 것이 정상입니다. 운영자 DB에서 자료를 읽으므로 배포 빌드에는 로컬 원고가 필요하지 않습니다. 로컬 강의 확인에는 개발용 Neon DB와 DATABASE_URL이 필요합니다.

## 이후 원고 반영

### 2026-09-15: 1–8주차 LaTeX v2 원본 교체

운영 Neon SQL Editor에서 로컬 **`.private-course/replace-week-1-8-latex-v2.sql` 전체**를 실행합니다. 최초 이관을 마친 DB용이며, 코드 배포만으로 본문이 바뀌지는 않습니다.

- 지정된 `week-md/ml_sig_latex_v2/ml_sig_latex_v2`의 8개 원고를 사용합니다. 원문은 `content-source/revised`에 보관하고 사이트용 제목 계층만 정리한 본문을 DB에 넣습니다.
- 1–8주차 기존 원본과 관리자 수정본은 `curriculum_content_archive`의 revision=`week-1-8-latex-v2`에 백업합니다. 기존 수정본의 본문도 새 원고로 바꾸되 Colab 링크는 유지합니다.
- 0주차, 퀴즈, 암호, 잠금 해제 기록과 기존 학습 기록은 유지합니다. 새 개념 체크 항목은 미완료 상태로 추가되므로 표시되는 진도율은 달라질 수 있습니다. 기존 항목과 기록은 삭제하지 않습니다.
- 같은 SQL을 다시 실행해도 이후 관리자 편집을 덮어쓰지 않습니다. SQL과 원고는 Git에서 제외됩니다. 노트북 파일은 갱신하지 않습니다.

확인 쿼리:

```sql
SELECT revision, applied_at FROM curriculum_revisions
WHERE revision = 'week-1-8-latex-v2';
SELECT week, length(body) AS characters FROM course_originals ORDER BY week;
```

이 교체 SQL은 `node scripts/replace-week-originals.mjs SOURCE_DIRECTORY`로 생성합니다. 다른 버전의 원고 교체에는 새 revision을 사용해야 합니다.

관리자 페이지에서 본문/퀴즈를 편집하면 DB에 저장됩니다. `.private-course/import-content.sql`은 이번 최초 이관용이며, 나중에 파일을 수정한 뒤 재실행해도 기존 DB 원본을 갱신하지 않습니다. 이후 새 원본 교체에는 별도의 버전 이관을 만들어야 합니다.

`node scripts/export-private-content.mjs`는 로컬 비공개 원고에서 이번 이관용 SQL을 재생성합니다. 기존 공개 저장소의 퀴즈 초안은 `.private-course/quiz-drafts.json`으로 옮겼습니다. 공개 스키마 재생성은 `node scripts/export-db-sql.mjs`입니다.
