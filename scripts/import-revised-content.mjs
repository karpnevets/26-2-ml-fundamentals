import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export function normalizeLesson(source) {
  const { data, content } = matter(source.replace(/\u000crac/g, "\\frac"));
  let fenced = false;
  const body = content
    .split(/\r?\n/)
    .flatMap((line) => {
      if (/^```/.test(line)) fenced = !fenced;
      if (!fenced && /^# Week \d+ [—–-]/.test(line)) return [];
      return [!fenced ? line.replace(/^(#{1,5}) /, "#$1 ") : line];
    })
    .join("\n");
  return matter.stringify(body.trim() + "\n", data);
}

if (process.argv[2]) {
  const source = path.resolve(process.argv[2]);
  const files = fs.readdirSync(source);
  for (let week = 0; week <= 8; week++) {
    if (
      files.filter((f) => f.startsWith(`week-${week}-`) && f.endsWith(".md"))
        .length !== 1
    )
      throw new Error(`Expected one source for week ${week}`);
  }
  fs.mkdirSync("content-source/revised", { recursive: true });
  for (const file of fs
    .readdirSync("content")
    .filter((f) => /^week-\d/.test(f)))
    fs.unlinkSync(path.join("content", file));
  for (const file of files.filter((f) => /\.(md|json)$/.test(f))) {
    const raw = fs.readFileSync(path.join(source, file), "utf8");
    fs.writeFileSync(path.join("content-source/revised", file), raw);
    fs.writeFileSync(
      path.join("content", file),
      /^week-\d/.test(file) ? normalizeLesson(raw) : raw,
    );
  }
  console.log("Imported revised curriculum (original sources retained).");
}
