# Contributing

Contributions are welcome — new questions, corrections, and app improvements.

## Questions

1. **Every question needs a Microsoft Learn source.** Add the Learn URL or Learn module name in the `source` field. A question without a verifiable Learn source will not be accepted.
2. **Original practice only.** Write your own scenario. Do not submit real exam questions, exam dumps, or anything copied from a dump site. Do not copy any course's transcript text verbatim.
3. **One correct answer, three plausible distractors.** Each distractor should fail for a specific, explainable reason. The `explanation` must say why the correct answer is right *and* why each other option is wrong.
4. **Edit `data/questions.json` only** — never `data/questions.js` by hand. After editing the JSON, regenerate the JS copy:
   ```bash
   python3 -c "import json; d=json.load(open('data/questions.json')); open('data/questions.js','w').write('/* Generated from data/questions.json — do not edit by hand. Edit the JSON and regenerate. */\nwindow.SC500_BANK = ' + json.dumps(d, indent=2) + ';\n')"
   ```
   Then validate: `python3 -m json.tool data/questions.json > /dev/null` and `node --check app.js`.
5. **Never delete a question.** If a question is wrong or outdated:
   - Set its `status` to `deprecated` (wrong) or `superseded` (replaced), keep it in the file, and note it in `CHANGELOG.md`.
   - Add the corrected question as a new entry with a new `id` (or the same `id` with a bumped `version` — prefer a new `id` if the stem changed materially, and link the old one in the changelog).
6. **IDs:** `S<nn>-<V|H><nn>` — section number, V for standard, H for hard, e.g. `S05-H21` is the next hard Section 5 question. New sections use their own section number.
7. **Keep the bank total in sync:** update `total_questions` and the `changelog` in `data/questions.json`, and add a `CHANGELOG.md` entry under a new bank version.

## App changes

- Static only: no build step, no dependencies, no backend, no tracking, no login. Keep it that way.
- Use relative paths (`data/questions.json`, `styles.css`) — never absolute `/` paths — so the site works from GitHub Pages subpaths and from `file://`.
- Test locally before submitting: `python3 -m http.server`, open the site, and try both modes end to end (Learn flip + marks, Evaluate with timer on and off, submit, review, retake).

## Quarterly updates

Every quarter (January / April / July / October) the bank is re-checked against the official SC-500 study guide, SC-500T00, and the key Learn docs for the bank's topics. Corrections follow the never-delete rule above and are released as a new bank version with a git tag, e.g. `bank-2027.01.0`.
