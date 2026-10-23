# Architecture specification v0.1 — proposed, not implemented

## Logical components
1. Android-first PWA: auth callback handoff, cached file tree, editor, worker views, patch review, preview, event timeline. Native shell later for local inference.
2. API/control plane: session authorization, GitHub installations, project membership, permission checks, workflow state, budget ledger.
3. Repository adapter: GitHub App installation token acquired server-side, pinned revision read, scratch revision, commit/PR bridge.
4. Agent coordinator: durable state machine, scope resolution, context selection, single writer arbitration, tool dispatcher, checkpoints.
5. Model gateway: official permitted provider adapters, explicit user consent, routing by capability/budget and logged token usage.
6. Execution gateway: approved isolated workers for builds/tests; **not part of initial public MVP**.
7. Data: relational metadata, encrypted token material if persisted, object storage for scratch revisions and bounded artifacts; client local cache.

## Workflow
AUTHENTICATED -> REPO_SELECTED -> TASK_CREATED -> SCOPED -> PLANNED -> PATCH_PROPOSED -> REVIEW_REQUIRED -> APPROVED -> COMMITTED/PR_CREATED -> COMPLETED.
Branches: FAILED, CANCELED, EXPIRED, BUDGET_EXCEEDED, CONFLICT, WAITING_FOR_NETWORK, REAUTH_REQUIRED. State transitions are durable and idempotent.

## Ownership and consistency
- Remote Git commit SHA is source-of-truth for approved versioned code.
- Task scratch snapshot and phone offline draft are distinct objects.
- Base SHA is mandatory for patch application; conflicting writes cannot auto-merge silently.
- One active writer per project revision; worker identities do not grant concurrency.
- Reconnecting uses event cursor and job id; never re-submits a paid call without idempotency key.

## Suggested entities
User(id, github_subject); Installation(id, github_installation_id, status);
Project(id, repo_id, selected_branch, base_sha);
Worker(id, project_id, role, display_name, tool_policy);
Task(id, project_id, base_sha, scope, state, budget_cap, idempotency_key);
TaskEvent(task_id, seq, type, timestamp, evidence_ref);
Patch(id, base_sha, target_sha, files, hash, approval_state);
Approval(id, actor, action, patch_hash, expiry);
ExecutionJob(id, recipe, snapshot_sha, quota, state, result_ref);
ModelUsage(task_id, provider, model, input_tokens, output_tokens, cost_estimate);
Artifact(id, sha256, mime, project_id, expiry).

## Trust boundaries
Mobile client cannot access app private key, installation tokens or model-provider secrets.
Model output cannot directly invoke privileged APIs; tool gateway validates actor, project, scopes and budget.
Untrusted preview must be a separate origin without access to PocketDev sessions.
Hosted execution uses isolated tenant runtime with egress caps and disposable filesystem.

## Technology decisions not final
React/TypeScript + CodeMirror 6 PWA, TS API, PostgreSQL and object storage are candidates. Do not add providers, frameworks or migrations before ADR approval and measured feasibility.
