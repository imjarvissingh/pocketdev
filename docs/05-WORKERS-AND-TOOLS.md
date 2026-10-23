# Workers, orchestration and tool contracts
Status: PROPOSED.

## Model
Workers are project-scoped role profiles, not necessarily different models or processes. Each worker has id, name, avatar, role, instructions, allowed tool IDs, paths, max tokens/credits and task status.
Templates: Team Lead (plan), Coder (patch), Reviewer (diagnostics), Builder (explicit approved build).

## Runtime
Only one writer at a time initially. Worker passes structured work item to task queue, not an unconstrained conversation. Shared context: repo SHA, decisions, references, checks and evidence; avoid unlimited chat transcript memory.

## Tool schema principles
All calls: schema version, authenticated user-context (server-supplied), task id, pinned revision, idempotency key, bounded args, structured errors.
Read: repo.list, repo.tree, repo.read, repo.search, diagnostics.read.
Write scratch: patch.propose, patch.validate, patch.apply_scratch.
Execution: checks.run_approved_recipe; checks.status (later).
External mutation: git.create_branch, git.commit, git.open_pr (explicit approval).
Build: android.assemble_debug (later, approved compute only).

## Error taxonomy
UNAUTHORIZED, SCOPE_DENIED, NOT_FOUND, BASE_SHA_CHANGED, PATCH_CONFLICT, SCHEMA_INVALID, QUOTA_EXCEEDED, EXTERNAL_RATE_LIMIT, TOOL_TIMEOUT, UNKNOWN_OUTCOME, UNSUPPORTED_PROJECT.

## Agent task flow
validate -> load bounded context -> plan -> budget check -> typed tool proposal -> authorize -> execute in scratch -> verify -> present diff -> user approval -> external write -> readback.
Max 3 model repair rounds by default; hard budget can stop earlier. Never assert verification without real test evidence.

## Custom worker policy
User instructions cannot override security policy, gain permissions through prompt text, or authorize GitHub write/compute spending. Models never receive app secret keys.
