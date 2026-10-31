# Decision log, unknowns and risk register
Status: maintained ledger. Initial entry 2026-10-23.

## Adopted product decisions
D001 GitHub-first repository workflow and selected-repo access.
D002 Mobile web/PWA initial UI, optional native Android shell for inference.
D003 One orchestration engine with customizable logical worker profiles.
D004 Scratch changes plus explicit approval before GitHub writes.
D005 Local AI is optional research, not MVP release gate.
D006 No production arbitrary code execution before sandbox isolation review.
D007 No assumption of free unlimited inference, CI or storage.
D008 ₹0 additional prototype spend target, not guaranteed operational cost.
D009 User owns source, can edit without AI, and sees real execution evidence.
D010 Keep the browser prototype's GitHub access public and read-only; use deterministic Playwright API mocks for end-to-end tests until a reviewed server-side GitHub App exists.
D011 Treat unsaved editor text as user data: guard file, repository, project, section and page changes, and show original and modified source before export.
D012 Sprint 4 adds server-only, pure GitHub authorization contracts and deny-by-default validators. It does not create an OAuth route, persistent session/grant store, GitHub App adapter implementation, or remote-write path. Any future backend must provide authoritative grant/path data and atomic one-time state/approval/idempotency claims before calling GitHub. Owner: PocketDev; date: 2026-10-31; source: `server/github-security.ts` and its tests; status: contracts locally verified; next test: threat-model review and integration tests against a chosen backend/store before any credentials or live integration.

## Open decisions / unknowns
U001 Exact hosting and auth provider.
U002 Best GitHub App permission grants and callback implementation for selected backend.
U003 Repo checkout vs GitHub Git-data API performance on mobile workflows.
U004 Device support for tiny quantized models; memory, heat, battery.
U005 Consent, retention, privacy policy and geographic data handling.
U006 Which coding tasks genuinely repeat among phone-only users.
U007 Available free tiers and current price/terms on implementation date.
U008 Build/runner vendor, isolation and compute cost.
U009 PWA offline draft data durability and conflict UX.
U010 Licensing and trademark clearance of project name.

## Highest risks
R1: User preference for single agent over worker team; A/B test.
R2: Local model quality inadequate; do not gate product on Nano.
R3: GitHub integration security and revocation; review before external testers.
R4: AI/build cost exceeds willingness to pay; metering and caps.
R5: Tiny target phones struggle with editor; real-device benchmarks.

For any new assumption attach owner, date, source, verification status and next test.
