# Logical entities and API contracts
Status: PROPOSED — schema definitions are not deployed.

## Entities
User(id, github_user_id, created_at)
GitHubInstallation(id, owner_id, installation_id, selected_repo_state, revoked_at)
Project(id, owner_id, installation_id, repo_owner, repo_name, base_sha, status)
Worker(id, project_id, role, display_name, avatar_ref, tool_policy_id, config_version)
Task(id, project_id, worker_id, base_sha, state, budget_cap, idempotency_key)
TaskEvent(id, task_id, seq, event_type, payload_ref, occurred_at)
Patch(id, task_id, base_sha, staging_ref, diff_ref, approval_state)
Approval(id, user_id, task_id, action, scope_digest, expires_at, consumed_at)
ModelUsage(id, task_id, provider, model, token_in, token_out, quoted_cost, actual_cost)
ExecutionJob(id, task_id, recipe, sandbox_ref, state, billed_time, artifact_id)
Artifact(id, owner_id, task_id, sha256, type, size, expires_at)

## Invariants
Tenant authorization on each read/write; GitHub user id never equated to app installation id; versioned patch base; immutable audit events; opaque artifact refs; sensitive credentials never stored inside Worker or TaskEvent payload.
Approval references exact action+revision+cost scope; stale approval cannot authorize newer changes.
Use transactional compare-and-swap on remote mutation and task transition; preserve UNKNOWN_OUTCOME on ambiguous responses.

## API candidates (not implemented)
POST /auth/github/start, GET /auth/github/callback
GET /installations, GET /projects, POST /projects
GET /projects/:id/tree?sha=..., GET /projects/:id/files/:path
POST /projects/:id/workers, POST /projects/:id/tasks
GET /tasks/:id/events?after=..., POST /tasks/:id/approve
POST /tasks/:id/commit, POST /tasks/:id/pull-request
Every route needs schema validation, auth, idempotency decision and rate limits.

## Validation
Contracts evolve with tests; never auto-generate a deployed API solely from illustrative path names.
