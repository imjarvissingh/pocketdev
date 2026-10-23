# PocketCoder Nano — research protocol
Status: RESEARCH ONLY. No own-trained model or frontier equivalence claimed.

## Goal
Evaluate whether a commercially licensed, quantized small language model can provide useful narrow offline code help on affordable Android phones.
Possible baselines: Qwen3 0.6B and Qwen2.5-Coder 1.5B; verify exact licenses, model files and runtime compatibility on experiment day.
PWA must not be assumed to run GGUF efficiently; likely separate Android-native runtime.

## Experiment
1. Fix 100 held-out tasks: short code explanations, HTML/CSS edits, JS fixes, tool schema requests, small patches.
2. Establish deterministic tests for correctness and schema validation.
3. Benchmark untouched candidate on representative phones before fine-tuning.
4. Test supported quantization/runtime combinations; measure cold start, peak incremental memory, tok/s, thermal throttling, battery, downloaded MB.
5. Fine-tune with parameter-efficient method on Colab ONLY if baseline and data rights justify it.
6. Compare tuned model against base and authorized cloud reference with same held-out tasks.

## Proposed gates, not measured results
≥60% success on narrowly defined tasks; ≥95% valid tool-call structure under constraints; no repeatable out-of-memory on target test phone; useful response time and battery consumption.
No general claim of competing with Claude Code or Codex. Distinguish model ability from full agent-system performance.

## Budget / license
Existing Colab allotment may be used for private experiments, not customer serving or multi-user GPU backend. Document exact base model, weight provenance, dataset license, inference runtime, hardware and benchmark result.
If no reliable device fit: ship PocketDev without on-device model and retain manual editing/cloud opt-in.
