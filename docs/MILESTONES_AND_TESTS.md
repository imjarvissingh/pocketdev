# MVP milestones, acceptance and definition of done

**All statuses unstarted unless a real repository inspection and test record demonstrates otherwise.**

## M0 — Evidence baseline
Deliver participant criteria, competitor journey benchmark, inventory of GitHub/AI terms, unknown risk register.
Pass: research protocol written, 20+ genuine phone-only users recruited as a target, not assumed completed.

## M1 — GitHub auth and installation
Sign in, installation selection, selected repo authorization, disconnect and revocation.
Pass: test success, denied permissions, revoked installation, callback tampering, logout and token isolation; no secrets on device.

## M2 — Repository workspace
Browse exact-SHA source, edit local drafts, export, reconcile remote changes.
Pass: text edits on real 4 GB Android phone; conflict produces choice, not overwrite; cached offline draft survives restart.

## M3 — Worker profiles
Create project worker profiles from bounded roles, avatars and tool rules.
Pass: a worker cannot exceed server tool/path permissions; user can disable a worker; accurate event status.

## M4 — Coding loop
Single worker reads scoped files, creates patch on immutable base SHA, produces reviewable diff, user accepts/rejects.
Pass: ≥70% of curated small tasks verified on baseline suite (experimental target); zero unauthorized writes in adversarial tests; max model spend honored.

## M5 — GitHub delivery
User-approved new branch and commit/PR with real receipt.
Pass: no writes to default branch by autonomous agent; SHA drift detected; 403/404/rate limits and replay handled; exact diff approval bound to commit.

## M6 — Nano spike, independent of release
Offline inference benchmark on measured Android hardware.
Pass: publish measured latency, RAM, energy, task success, licenses and reproducibility; absent proof, feature stays experimental.

## M7 — Remote check/APK build, NOT initial MVP
Security-reviewed ephemeral isolation and capped resource/billing.
Pass: independent isolation review; artifact checksums and provenance; malicious repo tests; Android toolchain matrix; signed release APK not in scope.

## Cross-cutting definition of done
Real tests with command/environment/results; threat checks; permissions least privilege; mobile accessibility; data/cost metrics; docs and ADR updated.
Never equate code generation with successful execution. No unchecked claim of 'all tests pass'.

## Release decision
Do not ship managed untrusted execution publicly until security and cost gates pass. Do not promise frontier-model parity.
