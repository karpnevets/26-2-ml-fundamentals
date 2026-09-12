# 인증·DB 구현 및 검증

## 구조

- `auth.ts`: Auth.js Google OAuth, 학교 관리 계정 검증, 암호화된 JWT 세션(최대 7일), 최초 로그인 시 Neon 회원 upsert
- `lib/auth/policy.ts`: 정확한 학교 이메일·hd·email_verified 검사, 관리자 allowlist, 같은 origin 요청 검사
- `lib/auth/actor.ts`: 매 요청에서 세션과 활성 회원 재확인. `ADMIN_EMAILS`는 서버에서만 해석
- `lib/db.ts`, `lib/query.ts`: Neon HTTP SQL. DB 비밀값은 서버 전용
- `lib/progress-repository.ts`: 사용자별 읽기·upsert·충돌 없는 가져오기·운영자 집계 SQL
- `db/setup.sql`: 원문 frontmatter로부터 생성한 PostgreSQL 스키마와 학습 항목
- `/api/me`: 본인 계정 상태만 반환
- `/api/progress`: 본인의 기록 조회·단일 항목 변경
- `/api/progress/import`: 사용자가 요청한 기기 기록 가져오기
- `/admin`, `/api/admin/export`: 관리자 화면과 CSV. 서버에서 별도 관리자 권한 검사

회원 식별자는 Google의 고정 `sub`에 대응하는 내부 UUID입니다. 이메일은 관리자 지정과 표시용이며 계정 자동 연결에 사용하지 않습니다. OAuth access/refresh token을 DB에 저장하지 않습니다. 이 앱에는 별도의 OAuth adapter/session 테이블이 필요하지 않습니다. 세션은 Auth.js가 관리하고 앱 데이터는 Neon HTTP 드라이버로 저장합니다. 설치된 Auth.js v5는 현재 공식 설치 가이드가 안내하는 beta 채널이며 정확한 설치 버전은 lockfile에 고정되어 있습니다.

## 데이터 경계

API는 요청자가 보낸 userId로 데이터를 선택하지 않습니다. 세션에서 검증한 사용자 ID만 쿼리에 사용합니다. 쓰기 요청은 Origin, 계정 변경 방지용 소유자 precondition, 요청 크기, JSON 형태, catalog ID, boolean을 검증합니다. 데이터는 SQL parameter로 전달됩니다. 인증·진행도·관리자 응답은 캐시하지 않습니다.

클라이언트는 서버 저장 성공 후에만 체크를 갱신합니다. 실패하면 원래 값을 유지하고 오류를 표시합니다. 동시에 여러 요청을 보내지 않도록 저장 중에는 체크를 잠급니다. 회원 기록을 공용 localStorage 키에 복사하지 않습니다. 기기 기록 가져오기는 기존 클라우드 false 값까지 보존합니다. 계정이 다른 탭에서 변경되면 소유자 precondition으로 잘못된 계정의 기록 변경을 거절합니다.

서로 다른 기기가 같은 항목을 수정할 때는 마지막으로 서버에 저장된 값이 적용됩니다. 재접속/새로고침하면 최신 값을 읽습니다. 동작 기록 전체를 저장하는 감사 로그나 실시간 공동 편집은 구현하지 않았습니다.

## 검증 명령

```bash
pnpm test
pnpm typecheck
pnpm check:content
pnpm build
pnpm start
# 다른 터미널에서
pnpm check:browser
pnpm check:auth-browser
pnpm check:admin-browser
```

`pnpm test`는 정책 테스트와 PGlite(실제 PostgreSQL 엔진)의 SQL 테스트를 포함합니다. 실제 Neon에 접속하지 않고 schema 생성, 반복 migration, 계정 데이터 분리, upsert, catalog 외 항목 거절, 기존 기록 보존, 완료율 계산, CSV 수식 삽입 방지, 회원 삭제 cascade를 검증합니다.

브라우저 테스트는 설치된 Chrome을 사용합니다. 인증 UI 테스트의 account 응답은 브라우저에서만 모의 응답하며 애플리케이션에는 테스트 로그인, 우회 세션, 샘플 회원, 공개 관리자 경로가 없습니다. 미설정 상태의 실제 API에 대한 비로그인 거절도 확인합니다.

실제 Google OAuth 리디렉션·학교 도메인 반환·Neon 네트워크 연결·Vercel 운영 환경은 사용자가 계정과 환경변수를 설정한 뒤 별도로 실검증해야 합니다.

관리자 UI 검증은 실제 AdminDashboard 컴포넌트를 브라우저 안에서 테스트 전용 데이터로 렌더링합니다. 필터·정렬·CSV 링크·데스크톱/모바일 스타일을 확인하며, 테스트 데이터와 인증 우회 경로를 배포 앱에 추가하지 않습니다.
