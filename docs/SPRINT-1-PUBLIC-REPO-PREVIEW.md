# Public GitHub repository preview — local vertical slice

Status: IMPLEMENTED LOCALLY on `feat/sprint-1-public-repo-browser`; not pushed or deployed.

## Scope and architecture
Read-only browsing of **public** GitHub repositories from a local Vite browser application. Visitors explicitly enter `owner/repo` or a canonical `https://github.com/owner/repo` URL. GitHub REST API metadata resolves the default branch, then a commit SHA pins the Git tree. Individual text files are fetched by immutable Git blob SHA. This is not GitHub sign-in, not a GitHub App, and not access to private repositories.

No token is requested or stored, and requests use `credentials: omit`. Remote GitHub REST responses are rate-limited; the UI reports errors instead of retrying automatically. Lists are capped at 2,000 entries and 150 displayed matches; text file preview caps at 100,000 bytes. Truncated trees are labeled. Binary and unsupported text blobs are refused. File source is rendered as React text, not evaluated as HTML.

## Reconciliation with canonical specs
- `03-GITHUB-INTEGRATION.md` requires a secure backend GitHub App to handle authenticated identities, selected-repository installations and remote writes. **Not implemented**.
- `04-SECURITY.md` forbids sending credentials into client code. This slice uses only unauthenticated public endpoints.
- `06-MOBILE-UX.md` requires a phone-first file tree/editor/diff. This slice provides searchable flat filenames and read-only source preview only; editor, diffs, offline cache, and repo sync still absent.
- Real source browsing is separate from mock worker tasks. Mock tasks still do not read code or contact models.

## Actual validation, 2026-10-28 (Mac M1, Node 24)
- `npm run typecheck`: PASS.
- `npm test`: PASS, 10/10 tests (four mock task tests, six public API/client tests).
- `npm run build`: PASS, Vite 7.3.7; CSS 2.57 kB gzip, JS 74.56 kB gzip.
- `curl https://api.github.com/repos/imjarvissingh/pocketdev` response check: HTTP 200.
- Local browser end-to-end interaction / real Android viewport: NOT RUN.
- Security audit: NOT RUN. Public network read is not equivalent to production-ready OAuth.
- Codex review on previous Sprint 0 branch: BLOCKED by installed graph-index approval. Gemini CLI was not available in inspected shell.
- No GitHub push, deployment, GitHub token handling or paid infrastructure.

## Next product milestone
Introduce server-mediated selected-repository authentication using a reviewed GitHub App architecture, then a real draft editor with explicit SHA conflict handling. Do not extend this public browser with browser-stored PATs or OAuth tokens.
