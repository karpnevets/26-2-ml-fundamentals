# 일반 사용자·비로그인 방문자 요청 방어

## 코드에 적용된 방어

- 웹 요청 SQL은 매개변수로 전달합니다. 계정·관리자·주차 권한 검사는 서버에서 유지합니다.
- 각 HTML 응답마다 다른 nonce를 발급하는 CSP를 적용합니다. 임의 inline script/이벤트 핸들러, iframe 삽입, object/embed, base 태그 변경을 제한합니다. Next.js 자체 스크립트는 nonce로 허용합니다. KaTeX와 실험실의 inline style은 필요하므로 허용합니다.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: same-origin`, 불필요한 카메라/마이크/위치/결제 권한 제한을 적용합니다.
- 변경 요청의 Origin을 검사하고, 다른 사이트에서 보낸 일반 API 요청을 Fetch Metadata로도 차단합니다. Google OAuth의 GET 콜백 이동은 허용합니다.
- 지나치게 긴 URL과 선언된 요청 크기를 초기에 거부합니다. JSON API는 Content-Length가 없어도 실제 스트림 크기를 검사합니다.
- 아래의 계정별 호출 횟수는 DB에서 원자적으로 계산합니다. 서버 인스턴스가 달라도 공유되며, 초과 시 HTTP 429와 Retry-After를 반환합니다.

| 범위 | 계정별 1분 제한 |
|---|---:|
| 계정 상태 및 진행도 조회 합계 | 120회 |
| 진행도 변경 | 60회 |
| 기기 기록 가져오기 | 6회 |
| 모든 주차 잠금 해제 요청 합계 | 30회 |

기존 **계정·주차별 암호 검증 15분 10회** 제한도 유지합니다. 호출 제한 저장 공간은 계정당 최대 네 행이며 계정 삭제 시 함께 삭제됩니다. IP 주소는 이 테이블에 저장하지 않습니다. DB 제한은 데이터 변경과 고비용 처리를 줄이는 보조 수단입니다. 제한 조회 자체와 인증에는 서버/DB 작업이 필요하므로 대량 트래픽을 입구에서 걸러내는 WAF를 대체하지 않습니다.

운영 의존성의 PostCSS는 8.5.23으로 고정했습니다. 2026-09-15의 `pnpm audit --prod` 결과 알려진 취약점 경고는 0건입니다. 이후 공지는 계속 확인해야 합니다.

## 1. Neon SQL 실행

이미 운영 중인 DB의 SQL Editor에서 **`db/migrations/006_request_limits.sql` 전체**를 실행하세요. 자료나 완료 기록을 변경하지 않고 제한 카운터 테이블만 추가합니다. 재실행할 수 있습니다.

```sql
CREATE TABLE IF NOT EXISTS api_rate_limits (
 user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 bucket text NOT NULL CHECK (bucket IN ('read','write','import','unlock')),
 window_start timestamptz NOT NULL DEFAULT now(),
 attempts integer NOT NULL DEFAULT 1 CHECK (attempts > 0),
 PRIMARY KEY(user_id,bucket)
);
```

코드 배포 전에 실행하는 것이 좋습니다. 테이블이 없으면 보호 대상 API는 제한을 무시하지 않고 503을 반환합니다. 이미 본문 이전을 마쳤다면 이전 private import SQL을 다시 실행할 필요는 없습니다. 신규 DB 전체 설치에는 최신 setup 및 private import 절차를 사용합니다.

Vercel 환경변수 `AUTH_URL`은 `https://ml-fundamentals-karpnet.vercel.app`처럼 실제 사용하는 고정 origin으로 설정하세요. 새 환경변수는 추가되지 않았습니다.

## 2. Vercel Firewall 설정 (아직 미적용)

코드 변경만으로 WAF 규칙이 생성되지는 않습니다. 이 작업에서는 Vercel 프로젝트 설정을 수정하지 않았습니다.

Vercel 프로젝트 → **Firewall → 새 Custom Rule / Rate Limiting**에서 다음 규칙을 적용하세요. 기존 rate-limit 규칙이 있다면 중복 생성 대신 수정합니다.

- 이름: `Public requests`
- 조건: Request Path가 `/_next/static/`로 시작하지 않음 **AND** Request Path가 `/favicon.ico`가 아님
- 집계 키: **IP Address** (임의 요청 헤더나 경로별 키를 추가하지 않음)
- 기간/횟수: **60초에 600회**를 초기값으로 사용
- 초과 동작: **Deny**
- 저장 후 Publish/적용

로그인 페이지·OAuth API·공개 강의·일반 API 요청을 함께 집계하고 정적 JS/CSS/폰트 파일은 제외합니다. 조건에는 `Route`보다 **Request Path**를 사용해야 미들웨어 실행 전 단계에서 판단할 수 있습니다. 학교/동아리의 공유 Wi-Fi에서는 여러 사용자가 하나의 IP를 사용할 수 있으므로 Firewall 로그에서 정상 학생이 차단되는지 보고 임계값을 조정하세요. 600은 무조건 안전한 값이 아니라 초기 운영값입니다.

Hobby에는 프로젝트당 rate-limit 규칙 한 개가 제공됩니다. UI/한도는 공식 문서를 확인하세요: [Vercel WAF Rate Limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting), [규칙 조건](https://vercel.com/docs/vercel-firewall/vercel-waf/rule-configuration).

분산된 여러 IP의 공격은 IP별 제한만으로 모두 막을 수 없습니다. 비정상 급증 때는 Vercel Firewall 관측과 Attack Mode 등의 플랫폼 대응이 추가로 필요합니다. 이 문서는 침해 흔적을 발견했다는 뜻은 아닙니다.

## 검증과 한계

`pnpm test`는 SQL-looking 입력의 리터럴 처리, 권한 검사, JSON 크기 제한, DB 동시 호출 한도·계정 분리·시간 경과·저장 크기 상한을 검사합니다. 로컬 production 서버를 3000번 포트에서 실행하고 `node scripts/security-browser-check.mjs`로 CSP와 악성 Markdown/스크립트, 요청 위조, 정상 페이지 동작을 검사합니다. 실제 운영 계정의 OAuth 로그인 및 Vercel WAF 한도 도달 시험은 실행하지 않았습니다. 운영 사이트에 공격 트래픽을 보내지 않았습니다.

CSP는 [Next.js 15 nonce 방식](https://nextjs.org/docs/15/app/guides/content-security-policy)을 따릅니다. 응답별 nonce가 필요하여 페이지는 동적으로 렌더링합니다. 본 사이트는 기존에도 대부분의 페이지가 계정 상태에 따라 동적으로 렌더링됐습니다.
