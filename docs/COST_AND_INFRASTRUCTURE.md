# Near-zero-cost development and operating economics

## Separate budgets
A. Development prototype: additional cash can approach ₹0 by using **existing** subscriptions, local devices, personal GitHub free allowances and Colab research entitlement. Existing subscriptions still have economic cost.
B. Customer production service: inference, sandbox execution, storage, networking, abuse control, support and payment processing are never universally free.

## Resources and allowed roles
Claude Code/Codex/Gemini subscriptions may be used by our developers to write/review project code within their applicable product terms.
Do **not** proxy personal consumer subscriptions as PocketDev's public model backend.
GitHub Actions free allowances belong to eligible user/account, subject to published limits; do not pool or misrepresent them as free production compute.
Google Colab is for internal research/benchmarking, not production inference/build hosting for third parties.

## Cost formula
Variable per task = model input tokens x input rate + output tokens x output rate + attempts + sandbox active CPU/RAM/time + storage/egress + expected retries + provider charges.
Contribution = gross receipts - payment fees - direct model/compute/storage/egress/support attributable to service. Charge caps and prepaid budget reservations apply before execution.

## Default design
Free: local edit, cached reading, export and manual development; optional supported user-supplied authorized model credentials and user-owned GitHub workflows.
Paid if launched: metered model tasks, bounded managed builds. No unlimited free autonomous loops.
Task ledger: budget_limit, reserved, spent, provider, pricing_version, invoice reconciliation, failure refund rules, reconciliation of canceled/in-flight jobs.
API router must never silently change provider for private code; respect consent and budget.

## Initial financial tests
Benchmark 100 tasks: p50/p90/p99 token use, verification success, retries, compute minutes and net cost per successful task.
Stress a 10x bad-case token/task scenario. Detect negative contribution at hypothetical ₹49/₹99 packs after local fees.
Test minimum purchase sizes given payment fees; no price or margin promises until validated.
Research current vendor pricing and terms at integration date; values from past planning notes are NOT verified quotes.

## Cost guardrail
Build phase: no billable infra enrollment without owner approval. If free tiers are exhausted, suspend experiments; no surprise upgrade.
