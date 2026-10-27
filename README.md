# PocketDev

**Status: Local browser prototype through Sprint 3; not deployed or production-ready.**

PocketDev is a mobile-first, GitHub-connected development workspace for developers who only have a smartphone. Projects can have customizable role-based AI workers, scoped coding tasks, reviewable changes, and controlled GitHub branch/PR delivery. Optional PocketCoder Nano on-device inference is a separate experiment.

## Start here
- [AGENTS.md](AGENTS.md) — binding rules for coding assistants
- [CLAUDE.md](CLAUDE.md) — Claude Code entrypoint
- [Documentation index](docs/00-DOCUMENT-INDEX.md)
- [Product requirements](docs/01-PRODUCT-REQUIREMENTS.md)
- [GitHub integration contract](docs/03-GITHUB-INTEGRATION.md)
- [Security and trust model](docs/04-SECURITY.md)
- [Acceptance and go/no-go tests](docs/08-ACCEPTANCE-TESTS.md)

## Non-negotiable rules
No silent writes to main; no model-issued permission grants; never claim tests passed unless executed; no assumption small local models equal frontier models; no unrestricted remote code execution; no unlimited free AI or compute; no subscription logins or Colab used as production inference backends.

## Contributing later
All future implementation requires explicitly approved milestone scope. Every milestone must contain real test evidence, current API/SDK verification, and updated decision records.
