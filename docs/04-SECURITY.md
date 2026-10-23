# Security and threat model
Status: PROPOSED. Not security audited.

## Assets
Private source code, account sessions, installation tokens, worker instructions, task results, financial balance, project files and execution artifacts.

## Threat boundaries
A. Mobile/browser against backend session; B. User data/repo text against model input; C. Model tool suggestions against authorization service; D. Untrusted builds against worker host; E. Artifact download against other tenants; F. Preview code against trusted origin.

## Required controls
- Identity-bound access checks on every project, task, repository, branch, file and artifact.
- Least-privilege GitHub App; secure cookie session, CSRF/state defenses, secure callback and PKCE as appropriate.
- Reject path traversal, symlink escape, hidden secret files, oversized patches and stale revision writes.
- Model output and repository instructions are UNTRUSTED; tool arguments must pass server validation.
- Never expose credentials or cross-user state to models, preview JavaScript or build processes.
- Serve previews from isolated origin, sandbox appropriately, and enforce CSP where useful.
- No arbitrary scripts in API process. Prefer ephemeral VM/microVM-grade isolation for executing untrusted repos; bound CPU, RAM, time, disk, egress, processes and costs.
- Verify artifact ownership, malware risk checks, content integrity, checksum and expiring access; never promise a clean scan proves an APK safe.
- Rate limit accounts and compute allocations; maintain tamper-evident approval and spend events.
- Sensitive logs redact secrets and cap size; deletion and retention policies must be established before production.

## Explicit approvals
External repo writes, PR creation, deployments, dependency installation with network effects, managed compute spending and permission expansion.

## Release blockers
No production untrusted-code execution before isolation review; no public GitHub integration before OAuth/GitHub App security review; no payment before ledger reconciliation; no local-model privacy claim without data-flow verification.
