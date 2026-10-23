# PocketCoder Nano research plan — not a release commitment

## Reality check
A tiny phone model cannot be assumed competitive with frontier Claude/Codex across broad repository reasoning. Goal: selected offline coding tasks with acceptable accuracy and peak memory; cloud escalation is optional and permissioned.
Using an existing open-weight model with proper license notices is distinct from training a new foundation model. Do not claim original model architecture or frontier equivalence unless independently demonstrated.

## Baselines to investigate
Qwen3 0.6B and Qwen2.5-Coder 1.5B Instruct are candidates, not approved dependencies; verify exact artifact license, model provenance, runtime format and redistribution conditions at selection time. Compare other genuinely mobile-oriented permissive models based on reproducible metrics.
Quantization: 4-bit candidate first, but evaluate output quality, cache pressure, context window and complete memory budget.
Runtime candidates: llama.cpp GGUF Android native, LiteRT-LM supported path. Native shell may be required; PWA alone must not promise offline inference.

## Experimental protocol
100 held-out tasks in 5 categories: explanation, autocomplete, HTML/CSS edits, JS function fixes, structured tool-call/patch generation.
Compare local model with identical deterministic tools and an authorized cloud coding baseline; record prompt, test, exact model version, quantization, hardware and decoding config.
Record exact-match/tool schema validity, patch acceptance, execution success, median time to first token, tokens/sec, peak RAM, thermal throttling, battery change, download bytes, crash/OOM.
No cherry-picked demos as benchmark evidence; publish failures and dataset leakage checks.

## Phone matrix
Entry device 4 GB RAM; middle 6 GB; higher 8 GB. All must document available RAM, SoC, OS, OS background pressure and loaded app memory. Do not promise 1.5B works on every 4 GB device.

## Colab use
Research-only: downloading licensed weights, converting, quantizing where supported, benchmarking and small PEFT experiments if runtime allows. Never serve third-party customers through Colab or share prohibited compute access.
Retain benchmark notebooks, manifests, random seeds, training data license audit and artifact hashes. No private user repository in training data without explicit lawful rights/consent.

## Go/no-go
Proposed narrow metric: >=60% verified success on simple benchmark and >=95% parseable constrained tool outputs, without repeatable OOM on target device and with acceptable speed. If these fail, ship manual editing/cloud AI first.
