# SC-500 Exam Practice

Free, open-source practice for Microsoft Exam SC-500 — *Implementing End-to-End Security Controls for Cloud and AI Workloads* (Microsoft Certified: Cloud and AI Security Engineer Associate).

Two modes, one question bank:

- **Learn** — flashcards. Read the scenario, flip the card to reveal the answer and the full explanation, mark cards Known / Unsure, filter by difficulty and topic, shuffle, and review only your weak cards.
- **Evaluate** — exam simulator. Choose a domain and a question count (10 / 20 / 40 / 100 / 200 / 500 / 1020), answer one question at a time with a timer, flag questions for review, then submit for a score, a pass / fail at 70% (the 700 proxy — see below), a breakdown by topic, and a full review of every answer.

## Live site

Once published: https://utkarsh121.github.io/sc-500-quiz/

## Run locally

No build step, no backend, no dependencies.

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

You can also open `index.html` directly from disk (`file://`) — the question bank is loaded from `data/questions.js` (a generated bundle of the per-topic files) for exactly that reason. The per-topic files remain the single source of truth.

## The question bank

Per-topic files under `data/topics/` (23 topics, listed in `data/bank.json`) are the only source of truth. Both modes read them, so Learn and Evaluate can never drift apart.

Current bank: **version 2026.11.2 — 1020 questions, all difficulty "hard"**, across all four SC-500 exam domains, all based on Microsoft Learn and Azure's own publications:

- Domain 1 — Manage identity, access, and governance (20–25%): 268 questions (Conditional Access, PIM, apps / managed identities, identity governance, RBAC)
- Domain 2 — Secure storage, databases, and networking (25–30%): 266 questions (Key Vault, Storage, SQL / Cosmos DB, NSG, Azure Firewall, Private Link, DDoS, Bastion, WAF, Virtual WAN, Virtual Network Manager, Entra Private Access)
- Domain 3 — Secure compute (20–25%): 220 questions (VMs, App Service / Functions / Logic Apps, AKS / containers, Azure AI Foundry, Entra Agent ID, Purview DSPM for AI)
- Domain 4 — Manage and monitor security posture (20–25%): 266 questions (Defender for Cloud / CSPM, Sentinel / KQL, Security Copilot, Defender XDR, Purview, Azure Backup security, IaC governance)

131 distinct official source pages are cited — see `data/SOURCES.md` for the full list.

Each question has:

- `id` — stable, e.g. `D1-CA-001`, `D2-KV-001`, `D3-AI-001`, `D4-SEN-001` (see `data/README.md` for the full ID scheme)
- `version`, `status` (`active` / `deprecated` / `superseded`), `domain`, `topic`, `difficulty` (all "hard")
- `question`, `options` (4), `correct_index`, `explanation` (why the right answer is right, and why the others are wrong)
- `source_url`, `source_title`, `source_quote` — the Microsoft Learn / Azure page for that question, with a short quoted rule
- `last_checked`

### Never delete — versioning rule

Questions are **never deleted**. A question that becomes outdated is marked `deprecated` or `superseded`, kept in the bank and in git history, and replaced by a new versioned question. Corrections bump the question version and are recorded in `CHANGELOG.md`. Bank releases are tagged, e.g. `bank-2026.11.0`.

### Quarterly updates

The bank is re-checked against Microsoft Learn every quarter (January / April / July / October): the official SC-500 study guide, the SC-500T00 learning paths, and the key Learn docs for the topics in the bank. New and corrected questions are added as new versions; nothing is removed. See `CHANGELOG.md` for what changed in each release.

### Sources

- Microsoft Learn — Study guide for Exam SC-500: https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-500
- Microsoft Learn — SC-500T00 (12 learning paths, 63 modules): https://learn.microsoft.com/en-us/training/courses/sc-500t00/

Every question cites its Learn source. No course transcripts are used anywhere in this repo, and no question copies a Learn page verbatim.

## Scoring — what the 70% means

The real SC-500 is 120 minutes and the pass mark is 700 (on a 100–900 scaled score). This simulator does **not** produce a real Microsoft scaled score. It shows a percentage and a pass / fail at 70% as a *proxy* for 700. Treat it as a study guide, not a prediction of your exam result.

Timer defaults: 30 minutes for 10 questions, 60 minutes for 20, 120 minutes for 40, 180 minutes for 100, 240 minutes for 200. The timer auto-submits at 0:00. You can turn the timer off in setup.

## Privacy

No login, no tracking, no server, no analytics. Learn marks, wrong-answer lists, and exam history are stored only in your browser (localStorage) and never leave your device. Clearing your browser data clears them.

## Contributing

See `CONTRIBUTING.md`. In short: every question needs a Microsoft Learn / Azure source link with a quoted rule, no exam dumps, no real exam questions.

## Disclaimer

Original exam-style practice questions for study. Not affiliated with Microsoft, not endorsed by Microsoft, and not real exam questions. Microsoft, Entra ID, Azure, and SC-500 are trademarks of Microsoft.

## License

MIT — see `LICENSE`.
