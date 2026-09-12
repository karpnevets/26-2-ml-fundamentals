import { GlossarySearch } from "@/components/interactive";
export const metadata = { title: "용어 사전" };
export default function Page() {
  return (
    <div className="page">
      <header className="subpage-header">
        <span className="eyebrow accent">A SHARED VOCABULARY</span>
        <h1>용어 사전</h1>
        <p>
          낯선 단어를, 익숙한 말로. 강의 안에서는 개념 이름을 눌러 뜻을
          확인하세요.
        </p>
      </header>
      <GlossarySearch />
    </div>
  );
}
