# Security, privacy and misuse policy v0.1

## Assets at risk
Private repository content, GitHub authorization, worker/prompt injections, user-owned source code, model API credentials, project snapshots, paid compute budget and generated executable artifacts.

## Boundaries
- GitHub App minimal permissions, selected-repo installation, short-lived server-side installation tokens.
- HTTPS, session expiration, CSRF/state/PKCE as applicable, signed/validated webhook callbacks.
- No client-side storage of app private keys, installation tokens or private provider secrets.
- Log redaction; never persist entire private source in telemetry by default.
- Treat repository files, README instructions, issue text, model output and build logs as adversarial data.
- Separate trusted PocketDev origin from untrusted web previews, with explicit CSP/sandbox and no privileged cookies.
- Task budgets and rate limiting enforceable server-side; fraud/abuse prevention for execution.
- A model's permission request is not approval: bind approval to user, exact action/hash and expiry.

## Execution
Never execute arbitrary repositories in an API/backend process.
Use audited ephemeral VM-grade isolation or vendor-equivalent, resource ceilings (CPU/RAM/time/disk/pids), restricted egress, no privileged mounts or cloud metadata access, no host secrets.
Pause execution if strong isolation is unavailable; do not fall back to unsafe Docker-on-host public execution.
Artifact downloads are access-controlled, time limited, hash logged and retained briefly; malware scan is not a proof of safety.
Android APK signing keys are excluded initially.

## Privacy
User must consent before private files go to any external model provider. Display provider, scope, retention policy reference and whether code may be used for training per provider terms.
Allow disconnection, export and project-copy deletion requests with explicit lifecycle and documented exceptions.
No selling private source data. No automatic publishing. Never ingest unauthorized third-party repositories.

## Threat tests before pilot
Cross-tenant access, prompt-injection attempts, path escapes, leaked credentials in output, webhook replay, revoked install, mistaken owner access, runaway spend, malicious npm/Gradle scripts, preview origin breakout, queued-job cancellation race, token/log leakage.

## Important unknowns
Actual provider isolation guarantee, regional data retention, legal compliance, audit scope and production deployment topology must be determined before public launch. This document is a design intent, not security certification.
