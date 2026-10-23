# Cost, development resources and operations
Status: assumptions, not pricing commitments.

## Existing toolchain
Claude Code, Codex CLI and Gemini development access can assist repository engineering within their current limits. Subscriptions are not customer-facing model APIs.
Google Colab may be used for bounded internal model experiments, never third-party hosted inference.
GitHub free allocations belong to the authorized user's account and must not be pooled/circumvented.

## Target spend
Private prototype: strive for ₹0 *additional* by local development, free allowances and no managed compute. Cloud auth/database and public beta may require expenses.
Commercial serving: inference, execution, logs, storage, data transfer, fraud/security and payment fees are unavoidable at scale.

## Guardrails
No managed task without quota and a reserved cap; segregate model spending from CPU/build spending. Reconcile provider invoices. Limit total retry cost and task wall time. No unlimited free builds.
Metrics: cost per verified task, failure/retry distribution, model latency, infra per active user, conversion and support burden.
Future paid experiments: prepaid credits with transparent units; do not promise task counts before workload measurement.

## Ops before beta
Incident response, access revocation, secret rotation, deletion/retention policies, backups, abuse handling, rate limits, security tests and monitoring. Define an escalation owner.
