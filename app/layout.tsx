import type { Metadata } from "next";
import Link from "next/link";
import {
  ProgressProvider,
  AccountControls,
  ProgressNotice,
} from "@/components/progress";
import "./globals.css";
import "katex/dist/katex.min.css";
export const metadata: Metadata = {
  title: {
    default: "ML Fundamentals · SCSC",
    template: "%s · ML Fundamentals",
  },
  description:
    "모델과 Loss에서 ResNet까지. 비전공자를 위한 8주 머신러닝 학습 노트.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ProgressProvider>
          <a className="skip-link" href="#main">
            본문으로 이동
          </a>
          <header className="header">
            <Link href="/" className="brand">
              <span className="brand-mark">
                M<span>↗</span>
              </span>
              <span>
                ML Fundamentals<small>SCSC · STUDY NOTES</small>
              </span>
            </Link>
            <nav aria-label="주 메뉴">
              <Link href="/">커리큘럼</Link>
              <Link href="/playground">
                실험실 <span>↗</span>
              </Link>
              <Link href="/glossary">용어 사전</Link>
              <Link href="/assignments">선택 과제</Link>
            </nav>
            <AccountControls />
          </header>
          <ProgressNotice />
          <main id="main">{children}</main>
          <footer>
            <Link href="/">SCSC · ML Fundamentals SIG</Link>
            <span>문제에서 출발해, 이해로 연결하는 8주.</span>
            <Link href="/final-project">최종 프로젝트 ↗</Link>
            <Link href="/privacy">개인정보 처리 안내</Link>
          </footer>
        </ProgressProvider>
      </body>
    </html>
  );
}
