# Sprint 2: browser-local source drafts and patch export

Status: IMPLEMENTED LOCALLY on branch `feat/sprint-2-local-drafts`. Not deployed, pushed or connected to an authenticated GitHub user.

## What works
- Public GitHub read-only snapshot and pinned blob preview inherited from Sprint 1.
- Edit decoded UTF-8 text in an accessible textarea without writing back to the source repository.
- Explicit **Save local draft**, **Discard draft**, and **Export .patch** controls.
- Draft keys include owner, repository, pinned commit, relative path and blob SHA; stale snapshots never overwrite the storage entry of a different revision.
- Drafts live in this browser's localStorage, with a 100,000-byte input limit. The UI distinguishes saved drafts from unsaved modifications.
- Whole-file unified patch export for supported small text files. The patch is **not applied, tested, reviewed, committed or pushed**.
- Unsupported or failed fetches cannot be edited as successful source reads.

## Security boundaries
No user password, GitHub token, OAuth login, GitHub App installation, GitHub write request, backend service, execution sandbox, paid API or deployment. Browser localStorage is not suitable for private or confidential repositories. Clearing browser data deletes unsynced drafts. The editor intentionally accepts only public repository snapshots. Do not expand this to private repos by pasting a PAT into the UI.

## Validation evidence (Mac M1, 2026-10-28)
- `npm run typecheck`: PASS.
- `npm test`: PASS, 15/15 tests (including five draft/patch tests).
- `npm run build`: PASS, Vite 7.3.7.
- Real mobile device, authenticated repository access, patch application against a checkout, user acceptance: NOT RUN.
- Browser end-to-end testing: NOT RUN.

## Product risks and next steps
- Whole-file patch hunks are intentionally simple and potentially large; replace with precise and context-aware hunks before production.
- No conflict resolution beyond commit-pinned draft namespacing. An authenticated backend must compare base revision and permissions before any external write.
- Add real Android viewport test, accessibility check, and browser E2E coverage.
- Create server-side GitHub App auth separately after validating current API and security requirements.
- Keep no-Claude policy; Codex/Gemini only when operating with authorized access.
