import fs from "node:fs";
const source = fs
  .readFileSync("ml_fundamentals_sig_website_content.md", "utf8")
  .replace(/\r\n/g, "\n");
const names = [
  "python",
  "model-loss",
  "gradient-descent",
  "linear-classification",
  "feature-space",
  "mlp",
  "training",
  "cnn",
  "resnet",
];
const titles = [
  "Python / Colab Survival Kit",
  "Model & Loss",
  "Gradient Descent",
  "Linear Classification",
  "Feature Space",
  "MLP & Representation",
  "Training & Generalization",
  "Convolutional Networks",
  "Residual Learning & ResNet",
];
const concepts = [
  ["Python", "NumPy", "Shape"],
  ["Model", "Parameter", "Prediction", "Target", "Loss", "Feature"],
  ["Derivative", "Gradient", "Learning Rate", "Chain Rule"],
  ["Vector", "Dot Product", "Hyperplane", "Perceptron"],
  ["Feature Space", "Polynomial Features", "Linear Separability"],
  ["MLP", "Activation", "ReLU", "Backpropagation"],
  [
    "Logit",
    "Softmax",
    "Cross-Entropy",
    "Batch",
    "Epoch",
    "Generalization",
    "Overfitting",
  ],
  ["Convolution", "Filter", "Feature Map", "Pooling", "Inductive Bias"],
  ["Residual", "Skip Connection", "Batch Normalization", "ResNet"],
];
const starts = [...source.matchAll(/^# Week (\d) — (.+)$/gm)];
for (let i = 0; i < 9; i++) {
  let raw = source.slice(
    starts[i].index,
    starts[i + 1]?.index ?? source.indexOf("# 사이트용 추가 페이지 제안"),
  );
  const question = raw.match(/핵심 질문: \*\*"(.+?)"\*\*/)?.[1] ?? "";
  raw = raw
    .slice(raw.indexOf("\n"))
    .replace(/^> 선택 주차.*\n/m, "")
    .replace(/^> 핵심 질문:.*\n/m, "")
    .trim();
  // Normalize source heading levels, preserving every lesson paragraph, exercise and equation.
  raw = raw.replace(/^# (.+)$/gm, "## $1");
  fs.writeFileSync(
    `content/week-${i}-${names[i]}.md`,
    "---\n" +
      `title: "${titles[i]}"\nweek: ${i}\nquestion: "${question}"\nconcepts: ${JSON.stringify(concepts[i])}\nestimated_time: "${i === 0 ? "30–60" : "90–120"} min"\n` +
      "---\n\n" +
      raw +
      "\n",
  );
}
fs.writeFileSync("content/index.md", source.slice(0, starts[0].index));
fs.writeFileSync(
  "content/site-guide.md",
  source.slice(source.indexOf("# 사이트용 추가 페이지 제안")),
);
const project = source.slice(
  source.indexOf("# 10. 최종 프로젝트 아이디어"),
  source.indexOf("# 구현을 위한 Markdown Frontmatter 예시"),
);
fs.writeFileSync("content/final-project.md", project.replace(/^# 10\./, "#"));
