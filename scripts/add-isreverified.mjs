// One-off migration: add `isReverified: false` to every question object.
// Anchors on the unique `answer: "<optionId>",` line in each question (4-space
// indent). Preserves the file's existing line-ending style and is idempotent
// (skips a file that already contains the field).
import { readFileSync, writeFileSync } from "node:fs";

const files = [
  "data/historyQuestions.ts",
  "data/constitutionQuestions.ts",
];

for (const file of files) {
  let src = readFileSync(file, "utf8");
  const answers = (src.match(/^    answer: "[абвг]",/gm) || []).length;

  if (src.includes("isReverified")) {
    console.log(`${file}: already migrated (${answers} answers) — skipped`);
    continue;
  }

  src = src.replace(
    /^(    answer: "[абвг]",)(\r?\n)/gm,
    (_m, line, eol) => `${line}${eol}    isReverified: false,${eol}`,
  );

  writeFileSync(file, src);
  const added = (src.match(/^    isReverified: false,/gm) || []).length;
  console.log(`${file}: ${answers} answers, ${added} isReverified fields added`);
}
