import Link from "next/link";
export default function NotFound() {
  return (
    <div className="page subpage-header">
      <span className="eyebrow">404</span>
      <h1>이 강의는 아직 경로에 없어요.</h1>
      <p>0주차부터 8주차까지의 커리큘럼에서 다시 시작해 보세요.</p>
      <Link className="primary" href="/">
        커리큘럼으로 돌아가기 →
      </Link>
    </div>
  );
}
