# Architecture decisions and decision log

Each entry is a current planning decision, NOT proof of implementation. To revise, create ADR with context, options, consequences, date and approver.

| ID | Status | Decision | Why |
|---|---|---|---|
| D-001 | Accepted for planning | Phone-first, Android target | No-laptop developer audience |
| D-002 | Accepted for planning | GitHub App, selected repositories | Least-privilege authorization |
| D-003 | Accepted for planning | Scratch patches; approve exact GitHub writes | User control and reversible history |
| D-004 | Accepted for planning | One orchestration engine, role-based workers | Avoid multiplied inference and conflicting edits |
| D-005 | Accepted for planning | Local manual editing works without AI | Cost access and resilience |
| D-006 | Accepted for planning | PocketCoder Nano independent experiment | Local frontier parity unproven |
| D-007 | Accepted for planning | Remote arbitrary execution postponed | Isolation, cost and abuse risk |
| D-008 | Proposed | PWA + TS backend + PostgreSQL | Needs prototype and provider evaluation |
| D-009 | Proposed | Official cloud model gateway and BYOK | Requires model licensing/pricing/consent audit |
| D-010 | Accepted for planning | Spec documents precede implementation | Prevent invented capabilities |

## Change procedure
For material decisions, create docs/adr/NNNN-title.md including status, context, options, outcome, security/cost impact, rollback, validation, and affected spec links.
No agent should silently convert a proposal into an implementation mandate. Verify docs with actual repository state.
