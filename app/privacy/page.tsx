import Link from "next/link";
export const metadata = { title: "개인정보 처리 안내" };
export default function Page() {
  return (
    <div className="page narrow">
      <header className="subpage-header">
        <span className="eyebrow">ML FUNDAMENTALS SIG</span>
        <h1>개인정보 처리 안내</h1>
      </header>
      <div className="prose">
        <h2>학습을 이어가기 위한 기록</h2>
        <p>
          학교 Google 계정으로 로그인하면 Google 계정 식별자, 이름, 학교 이메일,
          가입·최근 로그인 시각을 저장합니다. 개념과 과제의 완료 여부 및 변경
          시각은 여러 기기에서 학습을 이어가고 SIG 운영자가 학습을 지원하기 위해
          저장합니다.
        </p>
        <h2>누가 볼 수 있나요?</h2>
        <p>
          학습자는 본인의 기록을 확인·수정합니다. 운영자가 지정한 관리자만 전체
          학습자의 이름, 이메일과 완료 현황을 확인하고 CSV로 내려받을 수
          있습니다.
        </p>
        <h2>저장과 로그인</h2>
        <p>
          사이트는 Vercel에서 제공되며 회원·진행도는 Neon PostgreSQL에
          저장됩니다. 로그인 인증에는 Google과 Auth.js를 사용합니다. 세션 쿠키로
          로그인을 유지하며, 이 사이트는 Google 비밀번호를 받거나 저장하지
          않습니다. 로그인 세션의 최대 유지 기간은 7일입니다.
        </p>
        <h2>기기 기록과 가져오기</h2>
        <p>
          로그인 전의 학습 기록은 브라우저 localStorage에만 남습니다. 로그인 후
          가져오기를 선택하면 완료 표시를 계정에 추가합니다. 계정에 이미 저장된
          값은 유지하며, 가져오기에 성공하면 기기 기록을 삭제합니다.
        </p>
        <h2>기록 삭제 요청</h2>
        <p>
          회원·학습 기록의 삭제를 원하면 SIG 운영자에게 학교 이메일로 요청해
          주세요. 운영자는 요청을 확인한 뒤 회원과 연결된 학습 기록을 삭제할 수
          있습니다. 브라우저의 기기 기록은 사이트 데이터 삭제로 직접 지울 수
          있습니다.
        </p>
        <p>
          <Link href="/">커리큘럼으로 돌아가기 →</Link>
        </p>
      </div>
    </div>
  );
}
