# Mobile UX and accessibility specification

## User journeys
1. First launch: explain GitHub requirement, privacy, phone constraints; sign in.
2. Install GitHub App to selected repositories; show accessible repo list.
3. Open repo: branch + commit SHA, file browser, editable supported text files, diagnostics.
4. Create worker: select role template, name/avatar, read/write scope, maximum spend.
5. Task: enter goal, see plan, relevant files, proposed diff, expense limit, approve/reject.
6. GitHub delivery: choose new task branch, confirm exact diff, commit/create PR, see actual URL/status.
7. Disconnected: manual edits to cached files, pending sync banner, resolution on reconnect.
8. Export: download source snapshot without AI subscription.

## Navigation
Projects | Workers | Code | Changes; task activity drawer. Bottom navigation suited to one-handed operation. Worker chats display linked real task events rather than only narrative.
Text editor uses mobile keyboard-friendly shortcuts, indentation control and search. Diff viewer compares per file and supports line navigation without horizontal overflow.

## Offline states
Offline project editing is possible only for already cached content. Login, remote repo fetch, cloud AI, remote execution and pushes require network.
Persist locally scoped drafts and base SHA. On reconnect show changed remote SHA and offer explicit conflict resolution; never silently overwrite remote.
No automatic retry of paid requests simply because network reconnects.

## Device/bandwidth testing
Test 360–430 px wide viewports and genuine entry-level 4 GB Android phones; track JS heap, peak memory, typing latency, network bytes, resume behavior, battery and thermal load.
Accessibility: focus handling, labels, touch target size, screen reader flow, reduced motion, color contrast, text resizing.
Try network throttling and Android background process termination.
No claim of specific device support until tested.

## UI language policy
Labels distinguish Proposed / Saved locally / Applied to scratch / Tests passed / Approved / Committed / PR opened / Merged / Deployed.
No fake progress percentage, invented completion timestamps or simulated worker success.
