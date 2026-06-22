# Answer Re-verification Job (Ukrainian sources only)

Canonical playbook for re-checking every quiz answer against **Ukrainian-language
sources**, correcting wrong answers, and marking each question `isReverified`.

This file is tracked in git so it is available both to the local `/reverify-questions`
skill and to the scheduled cloud routine. The deterministic mutation lives in
[`apply-reverification.mjs`](./apply-reverification.mjs).

## Non-negotiable rule: Ukrainian sources only

Many answers were wrong because they were checked against Russian sources. When
calling `WebSearch` you **must** restrict results to the Ukrainian whitelist and
write the query in Ukrainian:

```
WebSearch(
  query: "<питання або ключові факти українською>",
  allowed_domains: [
    "zakon.rada.gov.ua",   // офіційне законодавство — еталон для Конституції
    "uk.wikipedia.org",
    "osvita.ua",
    "zno.osvita.ua",       // підготовка до ЗНО/НМТ
    "mon.gov.ua",
    "history.org.ua",      // Інститут історії України НАН
    "uk.wikisource.org"
  ],
  blocked_domains: ["ru.wikipedia.org", "rt.com"]
)
```

Never rely on `ru.wikipedia.org` or any `*.ru`, `*.su`, `*.by` source. Using
`allowed_domains` is a hard whitelist — that is the primary guard. For
**Constitution** questions, prefer the exact article text on `zakon.rada.gov.ua`.

## Topics and files

| Topic        | Data file                       |
|--------------|---------------------------------|
| history      | `data/historyQuestions.ts`      |
| constitution | `data/constitutionQuestions.ts` |

A question is "done" when it has `isReverified: true`. Unverified ones have
`isReverified: false`.

## Find remaining work

```
node scripts/apply-reverification.mjs --status
```

Prints `verified X/N, R remaining` per topic.

## Per-run loop

Process in **batches of ~15** questions. Within a single run, keep doing batches
until either no `isReverified: false` questions remain, **or** you are approaching
the run's token/time limit — then stop cleanly. The next scheduled run resumes
automatically because progress is persisted to disk after every batch.

For each batch:

1. Pick the next ~15 questions with `isReverified: false` (lowest `id` first).
   Finish one topic before moving to the next; order between topics doesn't matter.
2. For each question:
   - Decide the correct option (а/б/в/г) from your knowledge of Ukrainian history /
     constitutional law.
   - **Verify with WebSearch** using the Ukrainian whitelist above. For Constitution
     questions, confirm against the cited article on `zakon.rada.gov.ua`.
   - If the verified option **differs** from the current `answer`, also write a new
     `explanation` (Ukrainian, 1–3 sentences, citing the article/fact) so the
     rationale matches the corrected answer.
3. Write the batch to `reverify-batch.json` at the repo root — an array of:
   ```json
   [
     { "topic": "history", "id": 12, "answer": "в" },
     { "topic": "constitution", "id": 5, "answer": "а",
       "explanation": "Стаття 10 Конституції України: ..." }
   ]
   ```
   Include `explanation` **only** when the answer was corrected. Always include
   `answer` (the verified option) even when unchanged.
4. Apply the batch (this sets `isReverified: true` and saves immediately):
   ```
   node scripts/apply-reverification.mjs reverify-batch.json
   ```
   Confirm the report shows `updated 15` with no `NOT FOUND` ids.

Repeat until `--status` shows `0 remaining` for both topics.

## Wrap-up (every run)

1. `node scripts/apply-reverification.mjs --status` and report counts + how many
   answers were corrected this run.
2. `npx tsc --noEmit` to confirm the data files still type-check.
3. Delete the scratch `reverify-batch.json`.
4. Commit the changes so a cloud run persists them (e.g.
   `git add data/*.ts && git commit -m "Re-verify answers batch"`).

## Notes

- `reverify-batch.json` is git-ignored scratch — never commit it.
- The mutation is keyed on `id`, so it is safe to re-run; an already-verified
  question simply stays verified.
- Do **not** reformat existing entries — the script edits only `answer`,
  `isReverified`, and (when corrected) `explanation`.
