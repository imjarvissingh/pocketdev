# MVP verification and go/no-go
Status: proposed tests. No tests executed.

## M1: Identity/installation
Valid callback and sessions; selected repo only; unauthorized private repo denied; installation revoke honored; no GitHub password intake.
## M2: Repo editor
Tree/list/read work at pinned SHA; file edit saved to local draft; binary/oversize files handled; offline conflicts surfaced; no accidental remote writes.
## M3: Worker profiles
Create/edit/delete project-scoped worker; test tool allow/deny; no crossing project or repository boundaries.
## M4: Agent
Typed calls validated; wrong path denied; patch reviewable; no unapproved main writes; hard token budget and repair cap respected; outcome evidence linked.
## M5: GitHub delivery
Task branch then approved commit/PR; stale SHA conflict handled; API error reported honestly; repeated request no duplicate PR/commit.
## M6: Nano research
Report real device list, peak RSS/total app RAM, tok/s, battery, thermal state, per-task scores, licenses; no release dependency.

## Security tests
IDOR/cross-tenant; token logging; prompt injection via README; path traversal; symlink; repo revocation mid-run; oversized context; preview origin separation; worker isolation before code execution; spending stop; artifact download authorization.

## Metrics — research targets
Phone-only onboarding completion ≥80%; scoped edit+review completion ≥70%; week-2 return ≥40%; zero unauthorized remote writes. Thresholds require observed testing, not code assertions.

## Evidence format
Test ID, commit SHA, setup, device/browser, command/action, expected, actual, timestamp, logs/link, PASS/FAIL/NOT_RUN. Never mark NOT_RUN as PASS.
