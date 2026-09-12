import { PlaygroundPage } from "@/components/playgrounds";
export const metadata = { title: "실험실" };
export default function Page() {
  return (
    <div className="page">
      <header className="subpage-header">
        <span className="eyebrow accent">LEARN BY CHANGING</span>
        <h1>직접 움직여 보는 머신러닝</h1>
        <p>숫자 하나를 바꿔 보세요. 예측, 경계, 그리고 이해가 달라집니다.</p>
      </header>
      <PlaygroundPage />
    </div>
  );
}
