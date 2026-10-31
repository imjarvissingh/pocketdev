# Sprint 4 Engineering Report

Date: 2026-10-31

Repository: `imjarvissingh/pocketdev`

Execution environment: Apple Silicon M1, 8 GB RAM, macOS; Node.js `v24.16.0`, npm `11.13.0`.

## 1. Executive summary

**PASS — local scope delivered.** Sprint 4 adds a pull-request CI workflow, standardizes local and CI Node.js on 24, introduces pure server-side GitHub authorization contracts with deny-by-default tests, strengthens unified patches for CRLF and final-newline differences, and extends mobile browser regression coverage. All changes are committed on `feat/sprint-4-ci-security-foundation`.

**NOT RUN — hosted CI.** Workflow syntax and equivalent project checks ran locally. No branch was pushed, so no GitHub-hosted run exists. No live OAuth, GitHub App, private-repository access, backend, remote write, deployment, or physical Android validation was performed.

Source checksum validation proves only that fetched bytes match a pinned Git object. Patch applicability, code test results, authorization, user approval, and remote commit are separate facts. The local test suite does not prove a patch is safe to merge.

## 2. Architecture and dependency graph

The local flow has these dependency edges:

```text
React workspace UI
  ├─ project and explicitly simulated worker state → browser storage
  ├─ public GitHub REST adapter → pinned repository revision and file bytes
  └─ draft/editor state → local draft persistence → context-aware patch generator
                                                    └→ disposable Git fixture → git apply --check

server/github-security.ts (pure policy/contracts; currently not connected to the UI)
  ├─ user/session + OAuth-state validation
  ├─ selected installation/repository/project/path authorization
  ├─ pinned revision and regular-file evidence checks
  ├─ explicit write approval, expiry/replay and idempotency contracts
  └─ typed sanitized provider errors + injected adapter/store interfaces
```

Existing runtime boundaries remain intentionally narrow: the client reads public GitHub content and stores drafts locally; patch tests use temporary local fixtures. The new `server/` module is an unconnected policy foundation. Its TypeScript interfaces cannot provide persistence, atomicity, or security by themselves; a future server must implement authoritative stores and atomic claims.

## 3. Files changed

- `.nvmrc`, `package.json`, `package-lock.json` — Node 24 selection and engine range `>=24 <25`.
- `.github/workflows/ci.yml` — read-only PR and development-branch verification workflow.
- `server/github-security.ts`, `server/github-security.test.ts` — GitHub access and write-approval contracts with deny-by-default policy tests.
- `tsconfig.json`, `vite.config.ts` — include server contracts in typecheck and Vitest discovery.
- `src/drafts.ts`, `src/drafts.test.ts`, `src/patch.integration.test.ts` — newline-aware context patch generation and local Git integration regressions.
- `e2e/workspace.spec.ts` — project-switch unsaved-edit protection and basic mobile keyboard/reduced-motion assertions.
- `README.md`, `docs/00-DOCUMENT-INDEX.md`, `docs/09-DECISIONS-AND-ASSUMPTIONS.md`, `docs/DEVELOPMENT_RUNBOOK.md`, this report — current status, decision, and evidence.

## 4. CI workflow design

`.github/workflows/ci.yml` runs for all pull requests and pushes to `main` or `feat/**`. It uses Ubuntu 24.04, a 20-minute job limit, cancellation for superseded runs, and only `contents: read` token permission. Checkout disables persisted credentials. Checkout, setup-node, and failure-only artifact upload are pinned to immutable commit SHAs. It selects Node from `.nvmrc`, uses `npm ci`, runs `npm audit --audit-level=high`, typecheck, Vitest, production build, and Playwright Chromium E2E; failure artifacts are limited to `test-results/` and three days. There is no deployment, release, publish, or auto-merge job.

Dependency caching is intentionally omitted: there is no hosted timing baseline to demonstrate measurable benefit. Local warm-cache timing would not establish hosted savings.

Action references: [checkout releases](https://github.com/actions/checkout/releases), [setup-node releases](https://github.com/actions/setup-node/releases), [upload-artifact releases](https://github.com/actions/upload-artifact/releases).

## 5. Security controls added

- OAuth state validation uses a session binding, constant-time comparison, expiry, and single-use evidence.
- Session expiry/revocation and selected user/project/installation/repository grants are explicit authorization inputs.
- Owner, repository, and path inputs are canonicalized and constrained; traversal and invalid path forms are rejected.
- Authorization requires pinned commit and server-owned tree evidence; non-regular file modes, symlink path components, and submodules are denied.
- Read and write authorization are distinct. Remote writes require an exact approval scope including actor, project, repository, path, base SHA, idempotency key, and expiry; replay is rejected.
- Typed upstream errors avoid returning raw provider messages as trusted user-facing contract data; audit metadata and adapter/store interfaces are explicit.
- Tests cover invalid OAuth state, expired session, unauthorized and cross-project repository grants, revoked/uninstalled grants, missing permissions, invalid paths and traversal, symlink/submodule boundaries, stale base SHA, replayed approval, and unapproved write.
- CI grants only read access to the default token and checkout does not persist credentials.

These are locally tested pure functions/contracts, not a deployed security boundary. A real service still needs authenticated identity, CSRF/session protections, secure secret storage, authoritative grants, atomic one-time claims, rate limits, logging/privacy review, and independent security review.

## 6. Vulnerabilities and defects found

- **Fixed:** Patch generation could not represent line-ending-only/final-newline differences reliably. Generation now preserves CRLF line content and distinguishes a missing final newline; context is included around edits.
- **Fixed:** The repository did not declare a supported Node runtime despite the local shell resolving Node 21. `.nvmrc`, the package engine range, and CI now consistently select Node 24.
- **Addressed:** Authenticated GitHub access had no explicit locally testable authorization contract. Deny-by-default policy helpers and negative-path tests now define a boundary for a future backend, without activating credentials or remote writes.
- **No dependency vulnerability found by the executed npm audit:** the current lockfile reported zero vulnerabilities at the configured high threshold. This is not a complete security audit and does not establish absence of vulnerabilities outside npm's advisory database or checks.

## 7. Tests and actual outcomes

Final validation ran after the implementation changes on Node `v24.16.0`:

| Check | Result | Evidence |
| --- | --- | --- |
| `npm ci` | **PASS** | Installed lockfile dependencies; npm reported 0 vulnerabilities. |
| `npm run typecheck` | **PASS** | `tsc --noEmit`, including `server/`. |
| `npm test` | **PASS** | 32 tests across 6 files, including eight GitHub policy tests and real Git patch fixture tests. |
| `npm run test:e2e` | **PASS** | 6 Playwright Chromium tests; mocked GitHub API; 360 px and 390 px viewport assertions; project-switch guard, keyboard focus, and reduced-motion coverage. |
| `npm run build` | **PASS** | Vite production build completed (35 modules); no Node 21 compatibility warning. |
| `npm audit --audit-level=high` | **PASS** | 0 vulnerabilities reported. |
| `actionlint .github/workflows/ci.yml` | **PASS** | Local workflow syntax/lint validation returned no findings. |
| `git diff --check` | **PASS** | No whitespace errors in final diff. |
| GitHub-hosted Actions run | **NOT RUN** | No push was authorized or made. |
| Android hardware, Safari/WebKit, Firefox, screen reader | **NOT RUN** | Not available in this execution. |

The Git patch integration tests use temporary disposable repositories and actual `git apply --check`; they do not execute repository source code. They cover Unicode/CRLF behavior and verify rejected/applicability checks do not mutate the checked-out fixture. The Playwright network is mocked; live GitHub behavior was not exercised.

## 8. Build, lint, and audit results

**PASS:** TypeScript, production build, `actionlint`, and npm audit as reported above. Browser coverage ran only in Chromium. No separate ESLint or hosted workflow run was configured or executed. Audit threshold was `high`; report does not imply all security defects are ruled out.

## 9. Branch and commit hashes

- Branch: `feat/sprint-4-ci-security-foundation`
- Base branch: `feat/overnight-mobile-workspace` at `14e5344`
- `d3fc0c318752c04fcd48b769d55839e6f893fd7a` — `ci: standardize Node 24 and add read-only verification workflow`
- `c486062df45ebfc45c95bed31fc1df174d611f40` — `feat: add deny-by-default GitHub authorization contracts`
- `d47c21e3f4e9247a865c69ad60ddbbe5c445a33d` — `fix: harden context patches for Unicode and CRLF`
- `f57455b6cdb8afcebd933828950df93acf71716f` — `test: cover mobile project guards and reduced motion`
- Final HEAD: `f57455b6cdb8afcebd933828950df93acf71716f`
- `main`: `b2c8489da5040c372892dc19d7a3ed33c37b0c06` (unchanged)
- No push, PR, merge, or deployment was performed.

## 10. Known risks and blockers

- **BLOCKED pending future backend/security decisions:** no chosen server framework or persistent session, authorization, or idempotency store; contract interfaces alone are not an operational authorization service.
- **NOT RUN:** GitHub-hosted CI, because the branch was not pushed.
- **NOT RUN:** live GitHub App/OAuth, private repo access, installation token, external writes, production backend, or deployment; these are outside the authorized scope.
- **NOT RUN:** physical Android and assistive-technology testing; mobile dimensions are emulated in Chromium only.
- Context-aware patch output currently uses one hunk, so distant edits can produce a larger patch than split hunks. Binary files and arbitrary repository path/apply cases still need explicit regression coverage before broadening claims.
- Browser drafts remain subject to browser storage quotas/clearing and are not appropriate for confidential source.

## 11. Features deferred

Live OAuth callbacks and GitHub App activation; server persistence and revocation; authenticated/private repository access; GitHub write API; idempotent write executor; remote branch/base conflict handling; AI workers; deployment; browser compatibility beyond Chromium; real Android memory/performance profiling; automated full accessibility audit; generalized patch splitting and broader path/binary cases.

## 12. Recommended Sprint 5 milestones

1. **Threat model and server contract review:** select the smallest backend runtime and define authenticated session, CSRF, installation/repository grant source, revocation, secure secret handling, and atomic approval/idempotency storage. Add adversarial integration tests before OAuth or write credentials exist.
2. **Patch correctness:** split distant edits into bounded unified hunks; test empty/identical/binary/oversized files, LF/CRLF/final-newline combinations, path normalization, stale blob hashes, and no-mutation rejection behavior in temporary Git fixtures.
3. **Real-device UX and reliability:** validate Android storage/touch/memory and assistive technology; add durable user-visible storage quota/error recovery and preserve edits through all navigation transitions.

## Exact local commands

```sh
cd /Users/jarvis/Development/pocketdev
source /Users/jarvis/.nvm/nvm.sh
nvm use 24
npm ci
npm run dev
```

For local verification:

```sh
npm run typecheck
npm test
npx playwright install chromium  # once per machine, if Chromium is not installed
npm run test:e2e
npm run build
npm audit --audit-level=high
actionlint .github/workflows/ci.yml
```

## Summary

**Works now:** Node 24 local setup, locally validated read-only CI definition, tested deny-by-default GitHub contracts, Unicode/CRLF-aware local patches, mobile browser regression coverage, and the existing public pinned-revision draft/export flow.

**Does not work yet:** hosted CI evidence, a real backend/OAuth or authenticated repository access, GitHub writes, AI workers, physical Android validation, and broad arbitrary-repository patch verification.

**Build next:** review and implement the persistent server-side GitHub App authorization boundary, then expand patch edge-case coverage and verify on a physical Android device.
