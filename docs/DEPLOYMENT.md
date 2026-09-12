# 직접 설정할 일: Google OAuth + Neon + Vercel

코드는 준비되어 있지만 실제 로그인·온라인 저장은 아래 계정 설정 후 동작합니다. 비밀값을 채팅이나 GitHub에 붙여 넣지 말고 `.env.local`과 Vercel 환경변수에 직접 입력하세요.

## 1. 코드 저장소와 배포 주소 준비

1. GitHub 저장소는 `karpnevets/26-2-ml-fundamentals`를 사용합니다.
2. 로컬의 `website` 폴더가 독립된 저장소 루트입니다. 아래 명령은 모두 이 폴더 안에서 실행합니다. 상위 폴더의 기획안·이미지·별도 강의자료는 포함하지 않습니다.
3. Vercel에서 해당 저장소를 Import합니다. Framework는 Next.js, Root Directory는 기본값 `.`(비워 두기), Node.js는 22 이상, Install은 `pnpm install --frozen-lockfile`, Build는 `pnpm build`입니다. 로컬 폴더명이 website여도 저장소에 그 내부를 올리므로 Root Directory에 website를 입력하지 않습니다.
4. 첫 배포로 고정된 `https://프로젝트명.vercel.app` 주소를 얻습니다. 설정 전에는 로그인 안내 화면만 표시되며 가입·DB 쓰기를 허용하지 않습니다.

GitHub 저장소가 비어 있을 때 최초 업로드 명령입니다. SSH 키가 GitHub 계정에 등록되어 있어야 합니다.

```bash
git init
git branch -M main
git remote add origin git@github.com:karpnevets/26-2-ml-fundamentals.git
git add .
git status
git commit -m "Add ML SIG site with Google login and Neon progress"
git push -u origin main
```

`node_modules/`, `.next/`, `.env.local`, `qa/`는 .gitignore로 제외됩니다. SSH 주소의 `git@` 사이에 역슬래시를 넣지 않습니다. 원격에 README 등 기존 커밋이 있어 push가 거절되면 강제 push하지 말고 기존 이력을 먼저 확인합니다.

## 2. Neon Free 프로젝트 생성

1. [Neon Console](https://console.neon.tech/)에서 Free 프로젝트를 생성하거나 Vercel Marketplace의 Neon integration을 사용합니다.
2. 가능하면 Vercel 함수와 DB의 리전을 가깝게 선택합니다. Free에서 선택 가능한 리전 중 고릅니다.
3. Connect에서 애플리케이션용 PostgreSQL connection string을 복사합니다. DB 사용자는 이 애플리케이션 DB에 접근할 수 있어야 합니다. 연결 문자열 전체가 비밀값입니다.
4. **Neon SQL Editor에서 `db/setup.sql` 전체를 실행**합니다. 테이블 3개와 학습 항목이 생성됩니다. 이 파일은 기존 회원·진행도를 삭제하지 않으며 다시 실행해도 됩니다.

SQL Editor 대신 로컬에서 실행하려면:

```bash
# .env.example을 .env.local로 복사한 뒤 DATABASE_URL 입력
pnpm db:setup
```

이 스크립트는 `.env.local`을 읽습니다. 배포 시 매 빌드마다 DB migration을 자동 실행하지 않습니다. 대상 DB를 직접 확인한 뒤 한 번 실행하세요.

강의 개념 이름이나 과제가 바뀌면 `pnpm db:sql`로 SQL을 다시 생성하고 `pnpm db:setup`을 실행합니다. 항목 ID가 바뀌는 수정은 이전 진행도와 연결되지 않으므로 별도 데이터 이관이 필요합니다.

## 3. Google OAuth 만들기

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트를 생성합니다.
2. Google Auth Platform → Branding에서 앱 이름, 지원 이메일, 사이트 주소, 개인정보 처리 안내 주소를 등록합니다.
   - 홈페이지: `https://프로젝트명.vercel.app`
   - 개인정보 처리 안내: `https://프로젝트명.vercel.app/privacy`
   - 도메인 소유 확인 등을 요청받으면 콘솔 안내를 따릅니다. 본인이 소유하지 않은 `snu.ac.kr`를 사이트 Authorized domain으로 등록하는 방식이 아닙니다.
3. Audience는 보통 **External**로 설정합니다. 학교 Google Cloud 조직을 직접 관리하는 경우에만 Internal 사용 가능 여부를 검토합니다. 학교 계정 제한은 서버에서도 별도로 강제합니다.
4. Clients → Create client → **Web application**을 선택합니다.
5. Authorized redirect URIs에 아래 두 주소를 정확히 등록합니다.

```text
http://localhost:3000/api/auth/callback/google
https://프로젝트명.vercel.app/api/auth/callback/google
```

6. JavaScript origins 항목이 필요하면 각각 `http://localhost:3000`, `https://프로젝트명.vercel.app`를 넣습니다. 경로는 포함하지 않습니다.
7. Client ID와 Client secret을 발급받습니다.
8. 요청 권한은 `openid`, `email`, `profile`뿐입니다. Gmail/Drive API를 켜거나 추가 권한을 요청할 필요가 없습니다.
9. 테스트를 마친 후 콘솔의 앱 게시 상태를 실제 운영에 맞게 설정합니다. 기본 로그인 scope에는 Google의 Testing 제한 예외가 있으므로 테스트 사용자 목록을 학교 도메인 제한 수단으로 사용하지 마세요.

Google 계정 선택창의 `hd=snu.ac.kr`는 힌트일 뿐입니다. 코드가 Google 인증 후 **email의 정확한 도메인, email_verified=true, hd=snu.ac.kr, provider=google**을 모두 확인합니다. 개인 Gmail에 학교 주소를 별칭으로 붙인 계정은 허용하지 않습니다. 실제 학교 계정으로 한 번 로그인해 검증하세요.

학교가 외부 OAuth 앱을 차단한 경우 Google Workspace 관리자에게 앱 허용을 요청해야 할 수 있습니다. 이 경우 도메인 검증을 느슨하게 바꾸지 마세요.

## 4. 환경변수 입력

Vercel Project → Settings → Environment Variables에 아래 값을 **Production** 범위로 넣습니다. 로컬은 `.env.local`에 같은 이름으로 넣습니다.

| 이름                 | 입력할 값                                                                  |
| -------------------- | -------------------------------------------------------------------------- |
| `DATABASE_URL`       | Neon connection string 전체                                                |
| `AUTH_GOOGLE_ID`     | Google OAuth Client ID                                                     |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client secret                                                 |
| `AUTH_SECRET`        | 아래 명령으로 생성한 랜덤 문자열                                           |
| `AUTH_URL`           | Production: `https://프로젝트명.vercel.app`, 로컬: `http://localhost:3000` |
| `ADMIN_EMAILS`       | 진행 현황을 볼 본인의 학교 이메일. 여러 명이면 쉼표로 구분                 |

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

`ADMIN_EMAILS`는 정확한 이메일 allowlist입니다. 첫 가입자를 자동 관리자로 만들지 않습니다. 일반 사용자가 요청 본문이나 화면에서 관리자 권한을 지정할 수 없습니다. 비밀값에 `NEXT_PUBLIC_` 접두사를 붙이지 마세요.

Vercel Marketplace가 다른 이름의 DB 환경변수를 만들었다면 코드가 읽는 `DATABASE_URL`에 올바른 값을 지정하세요. 환경변수 변경 후 **Redeploy**합니다.

Preview deployment의 매번 바뀌는 주소는 Google redirect URI와 다릅니다. 우선 고정 Production 주소로 OAuth를 검증하세요. Preview 로그인까지 필요하면 별도 고정 테스트 도메인·Google OAuth 클라이언트·Neon 브랜치를 마련하고 Preview 환경변수를 따로 설정합니다. Preview에 Production DB를 무심코 공유하지 마세요.

## 5. 첫 운영 확인

- 학교 관리 Google 계정으로 회원가입·로그인됩니다.
- 개인 Gmail은 거절됩니다.
- 학교 계정이어도 ADMIN_EMAILS에 없으면 `/admin` 데이터와 CSV에 접근할 수 없습니다.
- 본인의 관리자 계정으로 `/admin`에 들어가면 가입한 학습자와 완료 현황이 보입니다.
- 개념을 체크하고 새로고침하거나 다른 기기에서 로그인해 기록이 유지되는지 확인합니다.
- 로그인 전 기기 기록은 `기기 기록 가져오기`를 누를 때만 계정에 반영됩니다. 기존 계정 값은 덮어쓰지 않습니다. 공용 PC에서는 본인 기록인지 먼저 확인합니다.
- CSV를 내려받아 한국어와 완료율이 정상적으로 보이는지 확인합니다.

현재 설계에서 **강의는 공개**, **계정 기록은 본인만**, **전체 현황은 지정 관리자만** 접근합니다. 비회원의 기기 기록은 관리자 통계에 포함되지 않습니다.

## 6. 관리자 화면에서 읽는 지표

- 개념 완료율 = Week 1–8에서 체크한 개념 / 전체 핵심 개념
- 완료 주차 = 해당 주차의 모든 핵심 개념을 체크한 주차 수
- 주차별 완료 인원 = 해당 주차의 모든 핵심 개념을 체크한 학습자 수
- Check / Apply / Explore = Week 1–8의 해당 선택 과제 완료 수 (각각 8개)
- Week 0은 선택 준비 주차이므로 위 지표에서 제외
- 실제 학습시간이나 성취도 시험 점수는 측정하지 않음
- 최근 기록 변경 시각에는 체크 해제도 포함

CSV는 필터와 관계없이 전체 활성 회원을 포함합니다. 화면에서 이름·이메일로 검색하고 완료율·최근 로그인·이름순으로 정렬할 수 있습니다. 현황은 페이지를 새로 불러올 때 갱신합니다. 자동 polling을 하지 않아 DB 사용량을 줄입니다.

## 7. 운영 및 데이터 관리

Neon SQL Editor에서 회원을 일시 차단하려면:

```sql
UPDATE app_users SET disabled_at = now() WHERE email = '차단할주소@snu.ac.kr';
```

접근을 복구하려면:

```sql
UPDATE app_users SET disabled_at = NULL WHERE email = '복구할주소@snu.ac.kr';
```

차단은 기존 세션의 API 요청에도 반영됩니다. 삭제 요청을 처리할 때는 대상 이메일을 확인한 뒤:

```sql
DELETE FROM app_users WHERE email = '삭제요청주소@snu.ac.kr';
```

연결된 학습 기록도 함께 삭제됩니다. 회원 삭제만으로 재가입을 차단하지는 않습니다. 재가입을 막아야 한다면 삭제 대신 차단 정책을 사용하세요.

운영 전에 실제 운영자 연락 방법과 보유·삭제 방침을 `/privacy`에 맞게 보완하세요. 코드의 현재 안내는 사용 목적·수집 항목·관리자 열람·삭제 요청 방법을 설명합니다. 학기 종료 후 기록을 얼마나 유지할지는 운영자가 정해야 합니다.

강의는 Markdown으로 유지하고 DB에는 회원·체크 기록만 저장합니다. 파일 업로드, 실험실 슬라이더 로그, 매초 자동 저장은 없습니다. Neon 사용량에서 storage/compute를 주기적으로 확인하고 중요한 기록은 별도 백업하세요. 관리자 CSV는 현황 내보내기이며 전체 DB 복원용 백업은 아닙니다.

## 참고한 공식 문서

- [Auth.js Google](https://authjs.dev/getting-started/providers/google)
- [Google OpenID Connect 및 hd 검증](https://developers.google.com/identity/openid-connect/openid-connect)
- [Google OAuth Audience](https://support.google.com/cloud/answer/15549945?hl=en)
- [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver)
- [Vercel PostgreSQL 연결](https://vercel.com/docs/postgres)
