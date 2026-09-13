import Link from "next/link";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { authConfigured } from "@/lib/auth/config";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "학교 계정 로그인",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const configured = authConfigured();
  const next =
    params.next &&
    /^(\/admin(?:\/course(?:\/[0-8])?)?|\/(?:week|quiz)\/[0-8])$/.test(
      params.next,
    )
      ? params.next
      : "/";
  return (
    <div className="page narrow">
      <section className="login-panel panel">
        <span className="eyebrow accent">SCSC · SCHOOL ACCOUNT</span>
        <h1>학교 계정으로 이어서 학습하기</h1>
        <p>
          서울대학교에서 관리하는 <strong>@snu.ac.kr</strong> Google 계정으로
          로그인하세요. 처음 로그인하면 회원으로 등록됩니다.
        </p>
        {params.error && (
          <p className="auth-error" role="alert">
            {params.error === "AccessDenied"
              ? "학교에서 관리하는 @snu.ac.kr Google 계정만 가입할 수 있습니다. 올바른 계정을 선택해 주세요."
              : "로그인을 완료하지 못했습니다. 다시 시도하거나 운영자에게 문의해 주세요."}
          </p>
        )}
        {configured ? (
          <form
            action={async () => {
              "use server";
              try {
                await signIn("google", { redirectTo: next });
              } catch (error) {
                if (error instanceof AuthError)
                  redirect("/login?error=" + encodeURIComponent(error.type));
                throw error;
              }
            }}
          >
            <button className="primary" type="submit">
              Google로 로그인 <span>↗</span>
            </button>
          </form>
        ) : (
          <div className="why">
            <p>
              로그인 서비스 연결을 준비하고 있습니다. 지금은 강의를 먼저 살펴볼
              수 있습니다.
            </p>
          </div>
        )}
        <p className="muted">
          로그인하면 이름·학교 이메일·학습 완료 기록이 저장됩니다. SIG 운영자는
          학습 지원을 위해 진행 현황을 확인할 수 있습니다. Google Drive나 Gmail
          접근 권한은 요청하지 않습니다.
        </p>
        <Link href="/privacy">개인정보 처리 안내</Link>
        <span aria-hidden> · </span>
        <Link href="/">강의 먼저 살펴보기</Link>
      </section>
    </div>
  );
}
