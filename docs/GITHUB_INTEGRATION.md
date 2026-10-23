# GitHub integration — design and threat controls

## Identity versus repository authorization
User identity: GitHub web authorization with secure state/PKCE where supported and server-owned session.
Repository access: GitHub App installation selected per user/org; default selected repositories, not all.
Do not ask users for raw personal access tokens as standard onboarding.
No GitHub credentials are embedded in prompts, code editor, browser local storage or logs.

## Proposed permissions (confirm against live GitHub App API at implementation)
Metadata read (mandatory); Contents read for repository browsing; Contents write for approved commits; Pull requests write for PRs; Actions/checks read only if needed. Workflow modification and admin privileges are excluded from MVP.
Installation tokens remain short-lived server-side; private keys in managed secret storage and rotated. Verify GitHub webhook signatures; handle revocations and installation changes.

## Read flow
1. User chooses installation, repo and branch.
2. Server checks user/install authorization and reads exact commit SHA.
3. File tree returns bounded pagination; read only selected text paths.
4. Redact or deny protected/large/binary/secret-like files by policy.
5. All agent context records source commit and path; never invent unseen files.

## Write flow
1. Agent produces patch against immutable base SHA in isolated scratch area.
2. Validator checks authorization, changed path allowlist, symlink traversal, file sizes and patch syntax.
3. User sees the **exact proposed diff** and intended branch, with approval bound to patch hash and base SHA.
4. Backend rechecks current refs and protection status; conflict -> stop and ask for reconciliation.
5. Create task branch (never force push), commit approved content, optionally create PR. Return actual GitHub URLs only after API success.
6. Record commit SHA, actor, task ID and resulting PR status.

## Failure handling
Revoked token -> REAUTH_REQUIRED; branch drift -> CONFLICT; 403 -> permission review; 404 -> distinguish inaccessible from deleted without leaking names; rate limit -> bounded retry; webhook duplicate -> idempotent processing.
No destructive branch resets, deletion or force pushes in initial product.

## Testing
Mock permission revocation, private repo authorization, org restrictions, race between approval and push, malicious symlink/path, large repo pagination, webhook replay, conflict handling and slow network reconnection.
Official docs to verify when implementation begins: docs.github.com/en/apps and docs.github.com/en/rest.
