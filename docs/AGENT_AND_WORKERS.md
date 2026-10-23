# Custom workers and bounded agent — design v0.1

## Mental model
Workers are named, project-specific role profiles attached to **one orchestration and tool policy engine**. Their avatars and separate message views are UX; do not represent them as autonomous minds running continuously.

## Starter role templates
Team Lead: inspect scope and propose plan; cannot edit or push.
Coder: read permitted files and propose scratch patch; cannot commit without approval.
Reviewer: examine diff and actual test evidence; cannot assert unrun checks passed.
Builder: enqueue approved build recipe if allowed and funded; no shell by default.
User-defined worker: name, avatar, purpose, allowed tools, path scope, model mode and max task budget. A custom name cannot bypass policy.

## Single-executor MVP
No parallel writing workers. Worker -> coordinator -> authorized task -> tool gateway -> evidence ledger.
Delegation is a queued explicit task transition with shared immutable revision; no prompt-only handoff guarantees.
Role instructions are lower-trust than server policy, and user-visible.

## Memory
Durable facts: project structure metadata, decisions, source SHA, pending tasks, approved patches, diagnostics and user instructions scoped to project.
Do not treat full chat history as authoritative. Expire/compact summaries; link facts to provenance.
Worker read scope determines what memory it can see.

## Bounded loop
Request -> deterministic context retrieval -> short plan -> model/tool calls capped -> proposed patch -> optional checks -> review -> approval -> GitHub delivery.
Initial ceiling: no more than 3 AI repair passes per task unless user explicitly authorizes more; cost is hard-capped independently.
If budget or context insufficient, report uncertainty and partial work.

## Truthful worker status
Allowed: draft ready, tests queued, check passed (only with recorded exit 0 and command), PR opened (verified URL).
Forbidden: 'deployed', 'secure', 'build works', or 'all fixed' without matching observed evidence.
Track task outcomes: proposed, applied to scratch, checked, accepted, committed, merged and deployed separately.

## Worker UX test
A/B compare single-agent versus visible worker team with same underlying model/task caps. Measure comprehension, cost, task success, errors and time. Multi-worker UI is retained only if it improves outcomes.
