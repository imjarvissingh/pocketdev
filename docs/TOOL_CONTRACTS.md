# Tool API contract v0.1 — design, not implementation

All tools use versioned typed schemas. Authorization is enforced by the server from session and stored policies, **not** by an LLM-supplied actor ID. All tool results include tool_version, task_id, status, evidence_ref and bounded sanitized diagnostics.

## Read-only tools
- repo.list(installation_id, cursor, limit<=50) -> [{repo_id, name, visibility}], next_cursor
- repo.tree(project_id, commit_sha, path, cursor, limit<=100) -> entries, next_cursor
- repo.read(project_id, commit_sha, path, start_line, max_lines<=300) -> content, content_hash, truncated
- repo.search(project_id, commit_sha, query, glob, max_results<=50) -> hits with path/line
- git.diff(project_id, base_sha, target_sha, max_bytes) -> diff and truncation flag

## Scratch write tools
- task.plan(task_id, goals, affected_paths, assumptions) -> proposed plan
- patch.propose(task_id, base_sha, changes[]) -> immutable patch_id, patch_hash, line stats
- patch.validate(patch_id) -> accepted/rejected, diagnostics
- patch.apply_scratch(patch_id, expected_revision) -> new scratch SHA or REVISION_CONFLICT

## Side-effect tools
- check.run(task_id, recipe_id, snapshot_sha, budget_reservation_id) -> job_id (only approved recipe)
- github.commit(approval_id, approved_patch_hash, base_sha, target_branch) -> actual commit SHA or error
- github.pr.create(approval_id, head_branch, base_branch, title) -> verified URL/number or error
- artifact.export(project_id, snapshot_sha, format, approval_id?) -> time-limited artifact reference
- android.assemble_debug(...) **not implemented; later gated design**

## Contract invariants
Idempotency key required for model spending, execution jobs and GitHub mutations.
Every mutation requires immutable expected_revision or approved hash.
Paths normalized, no traversal/absolute paths/symlink escapes; exclude protected files.
Reject oversized payloads, binary changes and unknown mime types until supported.
All model generated tool inputs are parsed and schema validated; unknown fields rejected.
Tool timeout does not imply success; uncertain execution is UNKNOWN until reconciled.
No raw shell tool in v0.1. No arbitrary web fetch by workers.

## Error taxonomy
UNAUTHORIZED, INSTALLATION_REVOKED, REPO_ACCESS_DENIED, UNSUPPORTED_FILE, PATH_FORBIDDEN, PAYLOAD_TOO_LARGE, INVALID_SCHEMA, REVISION_CONFLICT, COST_LIMIT, PROVIDER_UNAVAILABLE, JOB_TIMEOUT, EXECUTION_UNKNOWN, VERIFICATION_FAILED.
Each error maps to a deterministic next step; never ask the model to guess that an external write succeeded.
