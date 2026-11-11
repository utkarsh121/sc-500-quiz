# Changelog

All notable changes to the question bank and the app. Questions are never deleted — corrections and retirements are recorded here, and the old question stays in its per-topic file under `data/topics/` with status `deprecated` or `superseded`.

## v2026.11.2 — 2026-11-11

Bank grown to 1020 hard questions, in per-topic files.

### Question bank

- 1020 questions total, all difficulty "hard", all `active`, version 1, across all four exam domains: D1 268, D2 266, D3 220, D4 266. 23 topic files under `data/topics/` (40–52 questions each), listed in `data/bank.json`. The single `data/questions.json` file was replaced by these per-topic files; `data/questions.js` is now a generated bundle of them.
- All 200 original questions re-verified against Microsoft Learn / Azure docs, upgraded to hard scenario style, and given `source_url`, `source_title` and `source_quote`. 10 off-domain questions in the original Domain 1 set were replaced with verified Domain 1 questions (their Defender / Key Vault / Purview topics are covered in Domains 2 and 4).
- 131 distinct official source pages cited — full list in `data/SOURCES.md`. For topics with no dedicated Learn page, Azure's own publications were used (Azure docs, Architecture Center, Microsoft Security pages).
- Gaps from v2026.11.1 now covered: Azure Backup security, IaC governance (Bicep / Deployment Stacks, Azure Policy as Code), Virtual Network Manager, Virtual WAN, Entra Private Access, Logic Apps, Container Instances / Container Apps.
- Caveats: D3-AI-039 (AI Gateway tier/tenant rule) is only partly supported by its cited Learn page; a few Entra Agent ID quotes were verified from search excerpts of the cited Learn pages rather than full page opens; D4-BKP-044 Blueprints retirement dates come from Microsoft's published retirement timeline via secondary reporting, with migration targets confirmed in the Deployment Stacks docs.

### App

- UI polish: one shared card/button system, muted Microsoft-blue accent, sticky Evaluate navigator, clear timer, per-domain and per-topic counts computed live from the bank, clean "Source: <title>" links with the quoted rule on Learn cards and review items, mobile single-column layout, accessible focus states and text-labelled correct/incorrect states.
- Evaluate now offers up to the full 1020-question bank. Learn and Evaluate load the per-topic files via `data/bank.json`, falling back to the generated `data/questions.js` bundle when opened from disk.

## v2026.11.1 — 2026-11-11

Full syllabus, Learn-only.

### Question bank

- 200 questions total (100 standard, 100 hard), all `active`, version 1, across all four exam domains.
- All references to the external video course removed from the bank, site and docs — source attributions now cite Microsoft Learn only. No question content changed except source fields (and one wording fix in S05-V15's explanation to remove the last such reference).
- Added 160 new original scenario questions, 40 per domain (20 standard + 20 hard each):
  - D1 (Domain 1, governance): access reviews, entitlement management, lifecycle workflows, Terms of Use, Azure Policy, Defender for Cloud governance, Purview sensitivity labels / DLP.
  - D2 (Domain 2, storage / databases / networking): Key Vault, Storage security, SQL / Cosmos DB, NSG, Azure Firewall, Private Link, DDoS, Bastion, WAF.
  - D3 (Domain 3, secure compute): VMs, App Service / Functions, AKS / containers, Azure AI Foundry, Entra Agent ID, Purview DSPM for AI.
  - D4 (Domain 4, posture): Defender for Cloud / CSPM, Sentinel / KQL, Security Copilot, Defender XDR.
- Known gaps (no questions written rather than guessed): Azure Backup security features and infrastructure-as-code governance (D1); Virtual Network Manager, Virtual WAN and Entra Private Access (D2); Logic Apps and Container Instances / Container Apps (D3). D3-H14 (Entra Agent ID Conditional Access) is sourced to the official SC-500T00 supplemental lab site, not a learn.microsoft.com page.

### App

- Learn and Evaluate now filter by domain as well as difficulty and topic. Evaluate offers 10 / 20 / 40 / 100 / 200 questions, with timers of 30 / 60 / 120 / 180 / 240 minutes.
- Home page and README now describe the full four-domain syllabus.

## v2026.11.0 — 2026-11-10

Initial release.

### Question bank

- 40 questions, all Section 5 — Identity and Access Management, all `active`, version 1:
  - 20 standard (`S05-V01` to `S05-V20`): identities and RBAC, authentication vs authorisation, MFA factors, passwordless / FIDO2 / Windows Hello, Entra P1 vs P2, guest (B2B) users, Directory Reader, User Administrator, eligible vs active PIM, authentication methods targeting, SSPR, Conditional Access signals and policy building, Azure RBAC vs Entra RBAC, Azure Reader, PIM in Entra and in Azure, app registrations vs enterprise applications.
  - 20 hard (`S05-H01` to `S05-H20`): built from Microsoft Learn SC-500T00 Path 1 — authentication strengths vs Require MFA, Temporary Access Pass and strengths, report-only / What If rollout order, break-glass accounts, session controls vs grant controls, token protection, sign-in risk vs user risk, service principals and PIM eligibility, per-role PIM settings, PIM for Groups restrictions, system- vs user-assigned managed identities, managed identity authentication vs authorisation, OAuth consent (user consent, admin consent workflow, assignment-required), custom role scopes, overprivileged RBAC right-sizing, Authentication methods policy migration, legacy authentication bypass, and the combined Entra vs Azure RBAC trap.
- Sources: Microsoft Learn SC-500 study guide and SC-500T00 Path 1. Standard questions cross-checked against the same Learn sources.

### App

- Static site, no build step, no backend, no tracking: `index.html`, `app.js`, `styles.css`.
- Learn mode (flashcards with Known / Unsure marks in localStorage, difficulty and topic filters, shuffle, review-wrong-only) and Evaluate mode (exam simulator with timer, flag for review, question navigator, scoring with 70% = 700 proxy, topic breakdown, full answer review, retake with a new random set).
- GitHub Pages deployment via `.github/workflows/pages.yml`.
