# Development runbook (planning-stage)

## Current verified state
Public repository created by project owner and engineering documentation populated. No functioning app, model, backend, OAuth integration or build pipeline is implied by files here.

## Tool allocation (suggested)
Claude Code: architectural changes and integration review.
Codex CLI: scoped implementation, tests, adversarial path review.
Gemini development tooling: phone-first UI and accessibility review.
GitHub: branches, issues, PRs, code review, eligible CI.
Colab: local-model research and reproducible quantization experiments, never production serving.
These subscriptions are developer aids, not legal capacity to resell model access.

## Developer sequence
1. Fetch repository and inspect actual files. Read AGENTS.md, docs/DECISIONS.md, docs/EVIDENCE_AND_VERIFICATION.md.
2. Pick one milestone and open an issue linked to FR requirements and threat tests.
3. Draft a narrow ADR for any undecided stack/API choice.
4. Create feature branch from known SHA.
5. Implement minimal incremental slice behind flags; add tests.
6. Run exact commands that actually exist; never invent npm scripts or CI workflows.
7. Open PR with checklist: requirement, diff summary, real tests, screenshots on Android, security and cost impact.
8. Have separate tool/reviewer inspect evidence. Merge only after human approval.

## Bootstrap order
M1 authentication+installation -> M2 code browsing/offline drafts -> M3 worker roles -> M4 agent scratch patch -> M5 approved GitHub PR.
Nano research can occur in parallel; remote build waits for security and operating economics.

## Secrets
Never commit .env, GitHub App private key, webhook secret, session secret, model keys or user repository contents.
Public docs should use fictitious IDs and example paths.
No unapproved vendor billing enrollment.

## Definition of ready for initial coding
Owners approve API architecture, provider choices and first test device; then implementation issues can be created. Until then, this repository is documentation-only.
