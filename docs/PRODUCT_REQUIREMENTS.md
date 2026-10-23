# Product requirements — PRD v0.1

## Problem and audience
Primary users are people with Android smartphones and no reliable laptop, limited budget, intermittent internet and a desire to develop actual software while retaining their source code. This is a hypothesis pending interviews, not proven PMF.

## Product promise
Sign in with GitHub; connect authorized repositories; inspect/edit project files from a phone; create named workers with distinct roles and permissions; propose code changes on a scratch revision; review diffs; approve commits and PRs; export project. Remote builds and local models are later milestones.

## MVP in scope
- GitHub user sign-in and selected-repository app installation.
- Repository list, branch/revision selection, file tree, read and manual edit for supported text files.
- Device-friendly worker cards, creation, bounded role templates and a single executing task at a time.
- One coding worker: request -> scoped context -> plan -> proposed patch -> review/approval -> revision.
- User-approved GitHub branch/commit/PR delivery, with real API status.
- Audit timeline, cancellation, recoverable network reconnection, cost visibility.
- Source export; read-only operation when free model quota is unavailable.

## Explicit exclusions
No general chat assistant, full VS Code clone, arbitrary terminal, multi-worker concurrent edits, self-hosted frontier model, unmanaged CI compute, emulator, release signing, iOS apps, unbounded free inference or automatic deployments. Android APK builds are phase 2+ and require separate security approval.

## Functional requirements
FR-01: GitHub identity is verified server-side; revoked installations cause access to stop.
FR-02: User selects explicit installation/repository; no default access to all repos.
FR-03: Every task records repository ID, base commit SHA, actor, scope and max cost.
FR-04: User can review complete diff and reject/undo pending patch.
FR-05: No direct writes to default branch by agent.
FR-06: GitHub write requires a separate, explicit user approval tied to exact diff/revision.
FR-07: File edits remain possible with no AI or cloud access (subject to local cache).
FR-08: Task state survives client disconnect; reconnect does not repeat paid work.
FR-09: Worker status reflects verified events, not invented chat roleplay.
FR-10: Model/cloud inference is opt-in and disclosed, especially for private code.
FR-11: Export user-owned code without forcing vendor lock-in.
FR-12: User can disconnect GitHub and request deletion of stored project copies.

## Non-functional targets — hypotheses
- Test on actual 4 GB Android phones; no minimum device support claim before benchmarks.
- Goal: create first repo-connected patch within 10 minutes for novice testers.
- Prevent repeated billable calls on reconnect through idempotency.
- Fail closed on missing auth or budget. All states accessible on narrow screens.
- Keep transfer payloads bounded; measure data usage, memory, battery and latency.

## Success gates
20–30 genuine phone-only participants; compare against Replit, Acode/Termux and GitHub mobile/web; >=80% complete a simple supported task with guidance level measured; >=40% week-two repeat use as an experiment threshold, not forecast. Capture price sensitivity by real behavior.
