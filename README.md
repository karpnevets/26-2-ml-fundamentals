# ML Fundamentals SIG

비전공자를 위한 **선택 0주차 + 본 과정 8주** 머신러닝 학습 사이트입니다. Next.js App Router, TypeScript, Tailwind CSS, Markdown, KaTeX를 사용하며 Google 학교 계정 로그인과 Neon PostgreSQL에 학습 기록을 저장할 수 있습니다. 강의 원본과 퀴즈는 Neon DB에서만 읽습니다. 강의를 로컬에서 확인하려면 개발용 DB 연결이 필요합니다.

## 실행

로컬에서는 `website` 폴더 안에서 명령을 실행합니다. 이 폴더 자체가 Git 저장소 루트이며 원격 저장소는 `git@github.com:karpnevets/26-2-ml-fundamentals.git`입니다. Vercel Root Directory는 기본값 `.`을 사용합니다.

Node.js 22 이상과 pnpm을 사용합니다.

```bash
pnpm install
pnpm dev
```

브라우저에서 http://localhost:3000 을 엽니다.

```bash
pnpm build          # 프로덕션 빌드 + TypeScript 검사
pnpm start          # 프로덕션 서버
pnpm typecheck
pnpm check:content  # 원문 일치, 수식, 과제 검사
```

npm을 사용하는 환경에서는 `npm install`과 `npm run dev`도 가능합니다. 저장소의 재현 가능한 설치 기준은 `pnpm-lock.yaml`입니다.

## 페이지

- `/`: SIG 소개, 연결된 8주 로드맵, 개념 기반 진행도, FAQ
- `/week/0`–`/week/8`: 원문 전체 강의, 목차, 이전/다음 주 이동, 용어 설명, 핵심 수식과 보충 예시 펼치기, 코드 복사, 체크포인트, 선택 과제
- `/glossary`: 용어 검색과 관련 주차 링크
- `/playground`: Loss, Gradient Descent, Hyperplane, Feature Space, Activation, CNN Filter, Residual Learning
- `/assignments`: 48개 선택 문항(27개 단계별 완료 체크)와 강의 페이지에 연동되는 체크박스
- `/final-project`: MNIST/CIFAR-10 선택 프로젝트와 ResNet 복습

## 구조

```text
app/                    # App Router와 다크 테마, 반응형 스타일
components/
  markdown.tsx          # LessonMarkdown, WhyBox
  assignments.tsx       # 공통 Check / Apply / Explore 표시
  interactive.tsx       # CodeBlock, TermChip, GlossarySearch
  progress.tsx          # 진행도 Provider, 체크박스, 주차·전체 진행도
  table-of-contents.tsx # 모바일 접힘 목차
  playgrounds.tsx       # 7종 클라이언트 실험, 공통 Slider/Plot/Stats
  resnet-recap.tsx       # ResNet 구성요소와 이전 주차 연결
lib/course-catalog.json # 공개 커리큘럼 메타데이터
db/migrations/          # 자료를 포함하지 않는 DB 스키마
.private-course/        # 비공개 로컬 이관 SQL (Git 제외)
lib/                    # DB 조회, 접근 권한, 강의 섹션 분리
scripts/                # 원문 분리 및 검증
qa/                     # 브라우저 검증 스크린샷
```

## 콘텐츠 저장

강의 원본·관리자 수정본·퀴즈 Markdown과 정답은 DB에 보관합니다. 저장소에 본문 파일을 포함하거나 런타임에서 파일을 대체 원고로 읽지 않습니다. 용어 정의와 최종 프로젝트도 DB에서 읽습니다. 커리큘럼 제목·개념 체크 항목은 `lib/course-catalog.json`에 남겨 둡니다.

이번 최초 이관에는 로컬의 `.private-course/import-content.sql` 전체를 Neon SQL Editor에서 실행해야 합니다. 공개 `db/setup.sql`만으로는 본문이 등록되지 않습니다. [DB 자료 이관 안내](docs/PRIVATE-CONTENT.md)를 확인하세요.

`content/`, `content-source/`, `.private-course/`는 비공개 로컬 작업용이며 Git/Vercel 업로드에서 제외됩니다. 사용자 선택에 따라 과거 Git 커밋은 정리하지 않았으므로, 과거 자료는 이전 커밋에서 열람할 수 있습니다. 노트북 공개 방식은 유지합니다.

관리자 `/admin/course`에서 본문과 퀴즈를 편집합니다. 본문 원본 복원은 DB에 등록된 원본을 사용합니다. 검토를 마친 0주차는 이번 이관 SQL에 포함되어 있습니다.

## 로그인·배포

주차별 실행 가능한 노트북은 `notebooks/week-0.ipynb`–`week-8.ipynb`입니다. 열린 강의에서 **Colab에서 실습하기**로 접근합니다. 관리자 본문 탭에서 링크를 변경/숨기려면 `db/migrations/003_colab_links.sql`을 한 번 적용하세요. 이번 개정에서는 최신 `db/setup.sql` 전체를 적용하세요. [노트북 사용법](notebooks/README.md)

2–8주차는 계정별 퀴즈 암호로 순차 해제합니다. 관리자 `/admin/course`에서 회차별 퀴즈와 Markdown 본문을 편집하고 인터랙티브 실험을 삽입할 수 있습니다. 기존 DB에는 `db/migrations/002_course_editor.sql`을 적용하세요. [퀴즈·편집 사용법](docs/COURSE-EDITOR.md)을 확인하세요.

직접 해야 할 설정은 [Google·Neon·Vercel 배포 안내](docs/DEPLOYMENT.md)를 따르세요. 구현 구조와 검증은 [인증·DB 문서](docs/AUTH-IMPLEMENTATION.md)에 정리되어 있습니다. 새 관리자 화면은 `/admin`, 로그인은 `/login`, 개인정보 안내는 `/privacy`입니다.

## 진행도

`ml-sig-progress-v2` localStorage 키에 개념 및 과제별 boolean을 저장합니다. 한 주의 모든 개념을 체크하면 이해 완료로 표시됩니다. Week 0 및 선택 과제는 전체 8주 완료 조건에 포함하지 않습니다. localStorage 접근 실패/잘못된 데이터에도 강의는 정상 동작하며, 저장 불가 시 현재 페이지의 메모리에서 체크를 유지합니다. 로그인 전 기록은 기기에만 저장됩니다. 로그인 후에는 Neon에 저장해 기기 간 동기화하며, 기존 기기 기록은 명시적으로 가져올 때만 반영합니다.

## 브라우저 검증

개발 또는 프로덕션 서버를 3000 포트에서 실행한 뒤:

```bash
pnpm check:course-browser
```

설치된 Google Chrome을 headless로 사용합니다. 잠금·제목 숨김·힌트·익명 API 접근 차단 및 관리자 편집 컴포넌트의 문항/저장 충돌/미리보기/모바일 화면을 검사합니다. 관리자 UI 저장 응답은 테스트 브라우저에서만 모의 처리하며 운영 코드에 인증 우회 경로를 추가하지 않습니다. `pnpm test`는 PostgreSQL 테스트 DB에서 순차 해제·시도 제한·회원 분리·마이그레이션을 검사합니다. 스크린샷은 `qa/`에 저장됩니다. 기존 `check:browser`와 `check:auth-browser`는 잠금 도입 전의 전체 공개 과정 시나리오이므로 현재 회귀 검증에는 `check:course-browser`를 사용합니다.

## 범위

요청한 A–G 실험실은 모두 구현했습니다. 실제 Python 실행기, 신경망 학습 서버, 전체 CNN 시뮬레이터, 자동 채점과 실제 외부 배포는 포함하지 않습니다. Google 로그인·Neon 저장·관리자 진행 현황 코드는 구현되어 있으며 실제 서비스 계정 연결은 배포 안내에 따라 설정합니다. Activation의 미분 그래프는 선택 확장으로 남겨 두었습니다. 실험은 가벼운 수치·시각화이며, 과제 코드는 학습자가 Colab 등에서 실행합니다.

## 일반 사용자 요청 보안

CSP, 요청 크기·출처 검사, 계정별 API 호출 제한을 적용합니다. 이번 배포 전에 `db/migrations/006_request_limits.sql`을 Neon에 실행하고, Vercel 입구에서 비로그인 대량 트래픽도 제한하려면 [보안 설정 안내](docs/PUBLIC-SECURITY.md)의 Firewall 규칙을 적용하세요. 코드 푸시만으로 Vercel WAF 설정은 바뀌지 않습니다.
