// Deterministic mutation for the re-verification job.
//
// Usage:
//   node scripts/apply-reverification.mjs <updates.json>   # apply a batch
//   node scripts/apply-reverification.mjs --status         # just print progress
//
// updates.json is an array of objects:
//   [
//     { "topic": "history", "id": 12, "answer": "в" },
//     { "topic": "constitution", "id": 5, "answer": "а",
//       "explanation": "Стаття 10 Конституції ..." }
//   ]
//
// For every entry the script locates the question with the matching `id` in the
// topic's TypeScript file, sets `answer` to the verified option, sets
// `isReverified: true`, and (if `explanation` is provided) replaces the
// explanation text. `explanation` should only be supplied when the answer was
// corrected, so the rationale stays consistent with the new answer.
//
// The script is idempotent and reports, per topic: how many questions were
// touched, how many answers actually changed, and how many remain unverified.
import { readFileSync, writeFileSync } from "node:fs";

const FILES = {
  history: "data/historyQuestions.ts",
  constitution: "data/constitutionQuestions.ts",
};

// Matches a single top-level question object. The closing `\n  },` (exactly two
// leading spaces) only ever terminates a question object — multi-line option
// objects close with six leading spaces, so the lazy body never overruns.
const QUESTION_RE = /(  \{\r?\n    id: (\d+),)([\s\S]*?)(\r?\n  \},)/g;
const VALID = new Set(["а", "б", "в", "г"]); // Cyrillic option ids

function countUnverified(src) {
  return (src.match(/^    isReverified: false,/gm) || []).length;
}

function status() {
  for (const [topic, file] of Object.entries(FILES)) {
    const src = readFileSync(file, "utf8");
    const total = (src.match(/^    isReverified: (true|false),/gm) || []).length;
    const remaining = countUnverified(src);
    console.log(
      `${topic.padEnd(12)} verified ${total - remaining}/${total}, ${remaining} remaining`,
    );
  }
}

function applyForTopic(topic, updates) {
  const file = FILES[topic];
  if (!file) throw new Error(`unknown topic: ${topic}`);

  const byId = new Map();
  for (const u of updates) {
    if (!VALID.has(u.answer)) {
      throw new Error(`update id ${u.id}: invalid answer "${u.answer}"`);
    }
    byId.set(Number(u.id), u);
  }

  let src = readFileSync(file, "utf8");
  const touched = new Set();
  let changedAnswers = 0;

  src = src.replace(QUESTION_RE, (whole, head, idStr, body, tail) => {
    const id = Number(idStr);
    const u = byId.get(id);
    if (!u) return whole;
    touched.add(id);

    let newBody = body;

    // answer
    newBody = newBody.replace(/answer: "[абвг]"/, (m) => {
      if (m !== `answer: "${u.answer}"`) changedAnswers++;
      return `answer: "${u.answer}"`;
    });

    // isReverified flag (false -> true; leave as-is if already true)
    newBody = newBody.replace(/isReverified: false/, "isReverified: true");

    // explanation (optional) — replace the whole double-quoted string value
    if (typeof u.explanation === "string" && u.explanation.length > 0) {
      newBody = newBody.replace(
        /(explanation:\s*)"(?:[^"\\]|\\.)*"/,
        (_m, prefix) => `${prefix}${JSON.stringify(u.explanation)}`,
      );
    }

    return head + newBody + tail;
  });

  writeFileSync(file, src);

  const missing = [...byId.keys()].filter((id) => !touched.has(id));
  return { topic, file, touched: touched.size, changedAnswers, missing };
}

function main() {
  const arg = process.argv[2];
  if (!arg || arg === "--status") {
    status();
    return;
  }

  const updates = JSON.parse(readFileSync(arg, "utf8"));
  if (!Array.isArray(updates)) throw new Error("updates file must be an array");

  const byTopic = new Map();
  for (const u of updates) {
    if (!byTopic.has(u.topic)) byTopic.set(u.topic, []);
    byTopic.get(u.topic).push(u);
  }

  for (const [topic, list] of byTopic) {
    const r = applyForTopic(topic, list);
    console.log(
      `${r.topic}: updated ${r.touched}, answers changed ${r.changedAnswers}` +
        (r.missing.length ? `, NOT FOUND: ${r.missing.join(", ")}` : ""),
    );
    if (r.missing.length) process.exitCode = 1;
  }

  console.log("--- progress ---");
  status();
}

main();
