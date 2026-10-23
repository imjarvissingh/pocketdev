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
