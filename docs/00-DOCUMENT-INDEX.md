# Documentation index and evidence policy
Status: **PROPOSED / NOT IMPLEMENTED**. Revision: 0.1; 2026-10-23.

## Canonical specs
- 01-PRODUCT-REQUIREMENTS.md — personas, use cases, MVP limits.
- 02-ARCHITECTURE.md — components, state and ownership.
- 03-GITHUB-INTEGRATION.md — GitHub sign-in, app installation and repository writes.
- 04-SECURITY.md — trust boundaries and threats.
- 05-WORKERS-AND-TOOLS.md — worker profiles, agent tools, approvals.
- 06-MOBILE-UX.md — phone interaction and offline behavior.
- 07-POCKETCODER-NANO.md — local model experiment.
- 08-ACCEPTANCE-TESTS.md — testable release gates.
- 09-DECISIONS-AND-ASSUMPTIONS.md — decision log and unknowns.
- 10-COSTS-AND-OPERATIONS.md — ₹0 prototype constraints and commercial cost gates.
- 11-IMPLEMENTATION-ROADMAP.md — ordered milestones.
- 12-DATA-CONTRACTS.md — logical entities and API contract requirements.

## Evidence levels
- VERIFIED: linked source or executed check with date and reproduction details.
- PROPOSED: deliberate design, awaiting implementation.
- ASSUMED: estimate without measurement.
- UNKNOWN: unresolved external behavior or fact.

Never silently promote ASSUMED or PROPOSED into VERIFIED.
External SDK methods, GitHub permissions, quotas, pricing, Colab terms and Android compatibility MUST be checked against current official documentation during implementation.
For every milestone, attach executed test output and device/environment details before claiming completion.

## Extended engineering specifications (added 2026-10-23)
These supplement, rather than supersede, canonical numbered docs above. Where contradictions occur, create a decision issue and reconcile rather than assume.
- [Product requirements with FR IDs](PRODUCT_REQUIREMENTS.md)
- [Detailed agent architecture](ARCHITECTURE.md)
- [GitHub integration and Git write safety](GITHUB_INTEGRATION.md)
- [Agent and worker semantics](AGENT_AND_WORKERS.md)
- [Typed tool contracts and errors](TOOL_CONTRACTS.md)
- [Threat, privacy and build isolation](SECURITY_AND_PRIVACY.md)
- [Phone-first user flows](MOBILE_UX.md)
- [PocketCoder Nano experimental protocol](LOCAL_MODEL_RESEARCH.md)
- [Near-zero-cost development and production costs](COST_AND_INFRASTRUCTURE.md)
- [Acceptance tests and phased milestones](MILESTONES_AND_TESTS.md)
- [Decision log](DECISIONS.md)
- [Risk register and unresolved questions](RISKS_AND_OPEN_QUESTIONS.md)
- [Anti-hallucination evidence contract](EVIDENCE_AND_VERIFICATION.md)
- [Development runbook](DEVELOPMENT_RUNBOOK.md)
- [Architecture decision record template](adr/0000-template.md)

## Document maintenance rule
The numbered docs are the original baseline; the extended docs contain additional detailed criteria. Before implementation, reconcile any overlapping requirements in an approved ADR and keep a single verified execution plan. **No implementation, tests or external integrations are implied by these files.**
