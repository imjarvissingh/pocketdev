# Product requirements — PocketDev MVP
Status: PROPOSED.

## Problem
A phone-only developer cannot conveniently edit, review, test and deliver software from a GitHub repository, especially with limited data, RAM and money.

## Intended users
P0: Android-phone-only learners and developers with GitHub accounts and constrained budgets.
Non-target: teams needing production enterprise cloud IDEs, iOS native compilation, AAA games.

## Primary journeys
J1: GitHub login -> install GitHub App on selected repo -> open project -> inspect files.
J2: Create project and choose a new/existing authorized repository.
J3: Create worker profile -> assign task -> review scoped plan -> inspect patch -> approve or reject.
J4: Edit source manually -> save local draft -> reconcile commit revision -> export.
J5: Approve branch commit and PR -> view real GitHub result, never synthetic success.
J6 (research): Download suitable local model -> offline limited code help on compatible phones.

## Functional MVP
P0: authorization; selected repo; file tree; CodeMirror-style editing; Git diff; patch approval; project-scoped worker profiles; single executing agent; commit/PR workflow; resilient task state.
P1: project export, local preview for safe static web projects, offline drafts, model provider opt-in.
Later: native inference shell, remote tests, APK builds, multi-agent parallelism.

## Nonfunctional
Usable on low-cost Android phones; no mandatory AI for manual edits; reasonable cellular-data footprint; accessible touch targets; no claims of low RAM or offline inference without device tests.
Users own their code. Workers cannot silently publish, spend or access extra repositories.

## Non-goals
Frontier model training; guaranteed free inference; unsandboxed terminal; automatic merging to main; default APK release signing; unrestricted code execution.

## MVP success hypotheses
≥80% of test participants can access and edit selected repos on phone; ≥70% complete a scoped patch-review task; 0 unauthorized remote writes; ≥40% week-two repeat use. These are proposed gates, not findings.
