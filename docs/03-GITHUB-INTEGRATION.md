# GitHub integration contract
Status: PROPOSED.

## Identity and authorization
Use OAuth user authentication with server-side session and verified state/PKCE when applicable. Separate this from GitHub App installation on selected repositories. Never request user passwords or ask for a broad personal access token as default.
Store app private keys only server-side in secrets management; use short-lived installation tokens; refresh as needed; encrypt sensitive credentials.
Verify exact current GitHub Docs and app permission rules before implementation.

## Default capabilities
Metadata: read. Contents: read for browsing. Contents: write only if branch commits are enabled. Pull requests: write if PR action enabled. Actions/checks: read for approved results. Workflow modification is out of scope.
Installation repo selection controls maximum access; PocketDev project/worker grants further restrict it.

## Read path
List authorized installations and repositories; validate owner/repo and installation; fetch tree and bounded blobs at a pinned commit; handle file size, binary files, LFS, submodules, truncation, API rate limits, network loss.

## Write path
Read base commit -> stage patch -> validate allowed paths and content -> user reviews diff -> create isolated task branch -> compare remote base SHA -> push commit -> optionally create PR with explicit user approval -> record real API response and URL.
Never force-push or edit main directly. Handle protected branches and conflicts as BLOCKED, not success.

## Revocation and deletion
On GitHub App uninstallation, revoke cached access and stop jobs. Repo permission change invalidates outstanding grants. Disconnect must not delete user's GitHub repository.

## Acceptance
Selected repo access only; private repo isolation; write permission denied without approval; stale base SHA rejects; revocation stops operations; reconnect does not double commit.
