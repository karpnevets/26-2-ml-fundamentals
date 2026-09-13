"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page narrow">
      <h1>학습 정보를 불러오지 못했습니다.</h1>
      <p>
        잠시 후 다시 시도해 주세요. 운영자는 Neon 연결과 최신 DB migration 적용
        여부를 확인해 주세요.
      </p>
      <button className="primary" onClick={reset}>
        다시 시도
      </button>
    </div>
  );
}
