# Logical architecture
Status: PROPOSED. No deployed components exist by implication.

## Boundaries
Phone client (PWA) ⇄ authenticated API/control plane ⇄ GitHub App integration.
API ⇄ durable task database; API ⇄ model gateway; API ⇄ isolated execution adapter; artifact service separately authorized.
Optional **native Android shell** ⇄ local model runtime; PWA alone cannot assume native GGUF execution.

## Components
1. Client: projects, worker roster, source editor, task approvals, diff, events, offline drafts.
2. Auth: GitHub login session separate from GitHub App installation and token scope.
3. Repository adapter: immutable revision reads, compare-and-swap remote writes, branch/PR operations.
4. Agent: durable single-worker state machine and scoped tool router.
5. Model gateway: provider selection, consent, token caps, retries and usage accounting.
6. Execution: no general process execution in API; sandbox or user-owned CI after security review.
7. Storage: project metadata, task events, checkpoints, approvals, artifacts; no secret plaintext in logs.

## Task states
RECEIVED -> SCOPED -> PLANNED -> AWAITING_APPROVAL (when needed) -> EXECUTING -> VERIFYING -> READY_FOR_REVIEW -> COMPLETED.
Alternate states: FAILED, BLOCKED, CANCELLED, EXPIRED, BUDGET_EXHAUSTED, INTERRUPTED, UNKNOWN_OUTCOME.
A task's completion does not imply patch acceptance, commit or deployment.

## Invariants
Idempotent task and payment/compute requests; exact base SHA for patches; one active writer per project revision; persistent event cursors for reconnect; no auto-retry of uncertain non-idempotent writes.
Store source snapshots or references with explicit retention limits; no unbounded project context copied to LLMs.

## Stack candidates — not binding
React/TypeScript PWA; CodeMirror; relational database; job queue; object storage; separate Android native model runtime. Verify choices with experiments.
