# PocketDev agent instructions
Read README.md and docs/00-DOCUMENT-INDEX.md before editing.
This repository is planning-first; do not implement code unless explicitly requested.
Treat unverified stack choices, model benchmarks, external prices, quotas and API behavior as UNKNOWN.
Never fabricate test runs, links, commits, security audits, usage results or deployment success.
Source of truth: actual repository state > validated test output > versioned docs > model conjecture.
Check docs/02-ARCHITECTURE.md, docs/03-GITHUB-INTEGRATION.md, docs/04-SECURITY.md, and docs/08-ACCEPTANCE-TESTS.md before changes.
For each task: inspect repository -> state assumptions -> propose small plan -> implement only approved scope -> run real checks -> report evidence.
Keep edits small, reversible, and tied to an exact base revision. No force pushes, destructive migrations or rewriting main.
Never echo secrets or upload private project content to an unapproved model provider.
Never use browser-stored GitHub tokens, OAuth tokens or AI subscription sessions as unauthorized model APIs.
Do not run third-party project code outside an approved isolation boundary.
Use least-privilege GitHub App permissions and selected repositories.
Worker names and chat messages are not verification evidence; only logs, tests and artifact records are.
Ask before charging money, changing infrastructure/security policy, installing new tools, creating public releases or deployments.
Keep PWA, native Android runtime and backend responsibilities distinct.
Do not claim small phone models equal Claude Code or Codex; benchmark task success and real peak RAM.
When blocked, stop and label BLOCKED, listing exact missing capability. Do not invent a workaround.
Record significant decisions in docs/09-DECISIONS-AND-ASSUMPTIONS.md.
