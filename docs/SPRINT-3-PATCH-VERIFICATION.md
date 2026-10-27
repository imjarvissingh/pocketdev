# Sprint 3 — pinned-source patch consistency and local Git application tests

Status: implemented on `feat/sprint-3-patch-verification`; no repository writes from PocketDev.

## Scope
- Recompute SHA-1 of the exact downloaded public Git blob using Git's `blob <length>\0<bytes>` representation in WebCrypto.
- Refuse patch export when source text does not match the pinned blob ID.
- On successful consistency check, allow download of a local whole-file unified patch. UI explicitly limits its claims: checksum match is **not** patch application, merge validation, a successful build, a code review or approval.
- Test actual `git apply --check` and `git apply` in disposable temporary fixture directories on the Mac. Verify matching base applies, diverged base is rejected without mutation, and missing-final-newline content survives.
- No untrusted repository scripts are executed. No API access tokens, paid compute, server execution or remote GitHub writes.

## Validation — 2026-10-28, Apple M1 (8 GB)
- `npm run typecheck`: PASS.
- `npm test`: PASS, 22/22 tests across five files. Seven new tests include four Git blob integrity cases and three real local Git patch application cases.
- `npm run build`: PASS, Vite 7.3.7; JS ~76.32 kB gzip.
- Android device / real browser interactive E2E: NOT RUN.
- Against arbitrary real public repositories: NOT RUN; only controlled fixtures and public API connectivity verified previously.
- Independent code review / security assessment: NOT RUN.

## Security and product limitations
- Git SHA-1 matches immutable Git object addressing for common SHA-1 repositories; it is not proof of secure origin or trustworthy code. Git SHA-256 repositories are not supported.
- A browser cannot run `git apply --check` against a remote checkout. The browser performs a source checksum check only; integration tests show the patch format works with local Git fixtures.
- Before enabling actual PR creation or remote writes, implement a backend with authorization, pinned repository revision, canonical path constraints, reviewed patches, permission checks, conflict detection and explicit approval.
- Browser-local drafts remain unsynced and are not suitable for confidential code.

## Release gate
Keep parent draft PR #1 unmerged. Review this improvement as a stacked draft PR, then address browser E2E and GitHub App authentication separately.
