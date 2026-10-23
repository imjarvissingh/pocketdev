# Mobile-first UX specification
Status: PROPOSED.

## Navigation
Bottom tabs: Projects, Workers, Code, Changes. Inside project: repo picker, branch/revision, worker cards, task timeline, editor, diff review, preview, build results.
Phone-first: one primary panel at a time; persistent context header; keyboard-safe UI; ≥44px intended tap targets; screen reader labels and reduced motion.

## Journey
Sign in -> install selected-repo App -> choose repo -> inspect file tree -> optionally create worker -> request scoped change -> inspect plan -> see cost cap -> view patch -> approve task branch/PR.
Allow manual edits without AI; use explicit statuses PROPOSED, APPLIED_TO_SCRATCH, VERIFIED, COMMITTED, PR_OPENED.

## Offline design
Cache authorized file drafts and metadata locally with expiry; do not claim full GitHub access offline. Never background-push offline edits silently; show base SHA and conflict resolution on reconnection.
On device restart or network change, reconnect to task event cursor and avoid double tool execution.

## Local previews
Isolated origin and no privileged cookies; start with static web. Do not run arbitrary project scripts in app origin. APK installation requires clear Android security explanation.

## Accessibility and constrained devices
Test on real budget Android phone with 4GB RAM or lower if available, 3G/throttled connection, virtual keyboard and 360px viewport. Record RAM, battery, data consumption, editor input latency and crashes.
