# Question bank — per-topic files

Bank version 2026.11.2 — 1020 questions, all difficulty "hard", all original
scenario questions based on Microsoft Learn and Azure's own publications.

## Layout

- `bank.json` — manifest: version, totals, counts per domain/topic/difficulty,
  and the list of topic files. The site loads this manifest, then fetches each
  topic file listed in it.
- `topics/*.json` — one file per topic (23 topics, 40–52 questions each).
  Each file: `{"topic", "topic_slug", "domain", "source_pages": [...], "questions": [...]}`.
- `questions.js` — generated bundle of the whole bank, for file:// use.
  Do not edit by hand; regenerate from the topic files.
- `SOURCES.md` — every official source page cited, with URL and topics supported.

## Question schema

`id, version, status, domain, topic, difficulty, question, options[4],
correct_index, explanation, source_url, source_title, source_quote,
last_checked`.

## ID scheme

`D<domain>-<TOPIC>-<NNN>`: D1 = identity/access/governance, D2 = storage/
databases/networking, D3 = secure compute (incl. AI), D4 = posture/monitoring.
X- = cross-cutting (governance, data protection, incident response).
Topic codes: CA, PIM, APP, GOV, RBAC, KV, STOR, DB, NET, EDGE, VM, APP,
CON, AI, AGENT, DEF, SEN, COP, PUR, BKP, GOV, DLP, INC.
Original Section 5 questions keep their S05- IDs where retained; most were
re-numbered into per-topic IDs during the v2026.11.2 re-verification.

## Rules

- Sources must be Microsoft Learn (`learn.microsoft.com`) or Azure's own
  publications (`azure.microsoft.com`, `microsoft.com/en-us/security`).
  Every question carries a source_url, source_title and a short quoted
  source_quote from that page.
- Questions are never deleted. Outdated questions are marked `deprecated` or
  `superseded`, kept in the bank and in git history, and replaced by a new
  versioned question.
- No real exam questions, no exam dumps, no third-party course material.
