# Evidence standard and anti-hallucination engineering protocol

## Evidence labels
- OBSERVED: direct tool output, tested behavior or inspected source, with timestamp and reproducible reference.
- VERIFIED: observed plus independent check against stated acceptance criterion.
- DECIDED: approved product/architecture commitment; does not imply code exists.
- PROPOSED: candidate design.
- ASSUMED: modeling input, explicitly marked.
- UNKNOWN: no adequate evidence. Never replace with a plausible guess.

## Before any coding task
1. Inspect actual repository tree, branch, working state and existing tests.
2. Link requested change to PRD requirement ID and milestone.
3. Read relevant specs, permissions and current ADR.
4. Produce narrow design, paths to change, risks, cost limits and verification plan.
5. Obtain approval for irreversible/public/paid/external actions.

## During implementation
Make focused changes on a new branch, never fabricate paths. Preserve existing edits. Every external action result must be checked. Keep token/model/infra cost bounded. Do not grant model instructions elevated authority.

## Reporting template
- What was requested and permitted
- Observed repository state (commit, paths)
- Files actually modified, exact branch/commit
- Tests run, command, environment, exit code and logs
- Untested conditions and blockers
- Security/privacy/billing effects
- Next smallest verified step
Use 'NOT RUN' plainly when a test was not executed.

## Stop conditions
Unknown access, failed auth, model provider license uncertainty, cost cap breach, unreviewed secret exposure, execution isolation gaps, conflicted base commit, missing required test environment, unsupported device claims.

## Anti-hallucination invariants
Docs describe intended features, never runtime completion.
A passing formatter is not a passing app.
AI self-critique is not a test.
A GitHub API response is not a merged PR unless independently verified.
Model benchmark scores must link dataset, version, decoding configuration and artifacts.
Citations/URLs to vendor docs must be checked at implementation time, not assumed current forever.

## Docs drift audit
On each milestone, compare README, PRD, ADRs and acceptance tests with actual code. Reclassify stale proposals as UNKNOWN rather than copy inaccurate docs.
