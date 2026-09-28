# Shell-layout transcript capture

## Finding

The supplied local log confirms that browser Send was claimed and acknowledged, and the
web record contains the assistant response. The later `page-model helper is empty` diagnostic
matches `extension/fiber.js` explicitly excluding ChatGPT shell turns from `turnsOf()`. The
conversation binding was not the failing boundary.

The same log also contains transient tunnel poll timeouts and a timed-out 2.1.15 update
download. Those explain connection/update delays, but do not explain the missing transcript:
the provider response exists in the web record while the app's shell page-model scan returns
no readable turns. The existing app-input path already recognizes the newer shell's escaped
first user message; the regression fixed here is assistant/user transcript extraction.

## Change

- Read the shell's mounted `entry.turn.items` for exact user/assistant message IDs.
- Join each item only to its exact turn key, item index and role-specific DOM slot.
- Publish only bounded authored text read from that slot; do not serialize other Fiber item
  properties. Duplicate IDs, conflicting user IDs and mismatched slots fail closed.
- Include shell `data-turn-key` and its mounted conversation identity in the descriptor so the
  existing transcript owner can correlate the browser message with the local session.
- Keep shell turn completion unset unless its exact rendered assistant item is marked
  `completed`/`final_answer` and the native turn status is `complete`. DOM idleness alone
  is not completion proof.

## Follow-up: v2.1.16 compatibility port

The upstream [v2.1.16 release](https://github.com/totec448-spec/chat-on-steroids/releases/tag/v2.1.16)
adds support for ChatGPT's `data-chatgpt-search-unit-key` layout. This port retains the
local shell slot reader above, adds typed search-unit messages, exact call identities and
final-turn evidence, and accepts an early request-id-only stream correlation with a
deterministic non-provider message key. It does not copy unrelated updater, plugin,
worker or compaction changes from that release.

The desktop composer now defaults an ordinary text follow-up in an active injectable
turn to After this turn. Explicit Inject now and image injection remain available.

The inspected project catalog and session metadata associated the affected project chat
with its intended local project. Missing request attribution, not a catalog rebind, is
the first demonstrated wrong workspace boundary. A separate failed follow-up explicitly
selected tool injection and ended before an eligible call; that message had no browser
send receipt and must not be described as a web send that disappeared.

At the time the shell-layout follow-up was first recorded, only `node --check` on the
two edited extension files and `git diff --check` had been run. The bootstrap port and
its current validation are recorded in the section below.

## Bootstrap reliability port from upstream 2.1.16

Compared against the immutable upstream `v2.1.16` tag. Adapted the focused fixes from
[@k-spit](https://github.com/k-spit)'s upstream work (including bootstrap composer reacquisition
and exact fresh-worker correlation; see `0333a5b` and `80ad4d7`). The contributor is already
credited in `CONTRIBUTORS.md` with the corresponding upstream PRs.

- After a requested model/reasoning selection, wait for ChatGPT's replacement composer under
  the same command, route and document-epoch fence before inserting bootstrap text.
- Replace the fixed 500 ms polling loop with the existing mutation-driven `waitPageView` and
  require the exact submitted user message before ACKing a fresh worker/resume binding. A URL
  change alone is no longer treated as proof of delivery.
- Updated the old bootstrap test fixture to model ChatGPT assigning a conversation and mounting
  the exact user row. Added a regression for React replacing the composer during model selection.
- The local search-unit/Fiber and stream-correlation changes were already present as uncommitted
  work before this port; they were preserved and exercised, not overwritten.

Validation for this port:

- `test/content-script.test.ts` — 658 passed.
- `test/fiber.test.ts`, `test/chatgpt-dom-input.test.ts`, `test/bridge.test.ts` — 830 passed.
- Focused renderer timeline checks — the follow-up/Stop cases pass; one image-attachment routing
  case still fails (`attachmentDelivery` expected `tool`, received `undefined`).
- Full `verify:ci`, build/package, install and live signed-in browser retest were not run.

The earlier validation below applies only to the shell-capture change; the focused bootstrap
validation above is the current evidence for this port.

## Lost authorized-send receipt port from upstream 2.1.16

Compared the local outbox owner with upstream commit [`42efab4`](https://github.com/totec448-spec/chat-on-steroids/commit/42efab43527508435d1afa8f272232ff1514b35d), merged as [PR #408](https://github.com/totec448-spec/chat-on-steroids/pull/408). The defect is narrower than a generic send failure: after the app authorizes native Send, a lost browser receipt leaves an unsendable durable row owning the session, so subsequent messages are rejected indefinitely.

Adapted the 15-minute retirement into `session/input.ts`. Ordinary authored rows become visibly cancelled as “may already have been sent; will not be resent,” preserving at-most-once delivery; recovery, new-chat openings and combined inputs retain their existing custody. Added an integration regression proving the blocker survives restart before the deadline, expires at the boundary, is not offered again, and allows the next message to be claimed.

This complements the bootstrap-composer reacquisition already present in the working-tree changes above. That existing local patch covers model selection replacing the first-chat composer; it is not duplicated here. The upstream release separately mentions longer load budgets for Compact & Resume on large ChatGPT Project conversations, which is not the same as local project-folder chats and was not copied without a matching reproduction.

Validation for the lost-receipt port:

- `npm exec -- vitest run test/input-delivery-integration.test.ts` — 1 file, 216 passed.
- Focused existing bootstrap composer-remount regression — 1 passed, 657 skipped by name filter.
- `npm run typecheck` and `git diff --check` — passed.
- `npm run verify:ci` — privacy/notices checks and typecheck passed; Vitest finished with 208 files passed, 3 failed, 4 skipped (5,236 passed, 13 failed, 44 skipped). Failures are in the pre-existing tunnel lifecycle, extension DOM-adapter fixtures and renderer image-attachment routing suites. Because the main Vitest command failed, the separate `mcp-shutdown` suite was not reached.

No build, package, installation, commit or push was performed. The installed app therefore has not been updated by this source change.

Packaging warning: the source version is still 2.1.14, while `src/main/update.ts`
points at the original author's release repository. A verified newer upstream installer
staged by this app can replace a locally packaged fork at ordinary quit. Update-channel
ownership is a separate release decision and was not changed in this source fix.

## Validation

- `npm run typecheck` — passed.
- `node --check extension/fiber.js` and `git diff --check` — passed.
- Focused regression suite: `test/fiber.test.ts`, `test/chatgpt-dom-input.test.ts`, and
  `test/content-script.test.ts` — 3 files, 843 tests passed.
- `npm run verify:ci` — static checks, privacy/notices checks and typecheck passed; test suite
  ended with 210 files passed, 1 failed, 4 skipped; 5 failures are in the unrelated
  `test/tunnel-lifecycle.test.ts` process-restart cases.
- Windows x64 installer built at `release/Chat-On-Steroids-Setup-x64.exe` (package version
  2.1.14). The packaged extension `fiber.js` SHA-256 matches the source. Existing
  `THIRD-PARTY-NOTICES.txt` changes were restored after packaging.
- Installed-app/ChatGPT live retest remains outstanding. After installing and launching the
  package, reload the unpacked extension in `chrome://extensions` and refresh ChatGPT tabs so
  Chrome activates the newly materialized extension files.

## v2.1.16 successive-send compatibility

Compared the current browser input path with upstream [PR #321](https://github.com/totec448-spec/chat-on-steroids/pull/321), which fixes exact-prompt receipt mismatches in ChatGPT's Markdown composer. Adapted only the native editor compatibility: when the mounted editor is the current `data-composer-markdown` composer, inserted text is wrapped in ChatGPT's `data-prompt-literal-paste` marker. Classic composer insertion remains unchanged. The already-current Stop-control-only busy check was retained; no historical-generation watcher was added.

Validation:

- `npm exec -- vitest run test/chatgpt-dom-input.test.ts test/content-script.test.ts test/fiber.test.ts` — 3 files, 848 tests passed.
- `npm run typecheck` — passed.
- `git diff --check` — passed.
- Installed-app/provider live retest, commit and push were not performed.

## Local Windows x64 rebuild

Built the current working tree into the separate `release-fixed-20260928/` output directory so the prior `release/` installer remains intact. The packaging pipeline regenerated canonical third-party notices for the build, then restored the pre-existing working-tree `THIRD-PARTY-NOTICES.txt` byte-for-byte (verified SHA-256).

- `electron-vite build` — passed; emitted only the existing dynamic-import chunk warnings.
- Windows x64 tunnel, ripgrep and native dependencies — checksum/package-lock checks passed.
- `electron-builder --win --x64 --publish never` — passed; unsigned local NSIS installer created.
- Installer: `release-fixed-20260928/Chat-On-Steroids-Setup-x64.exe`, version 2.1.14, SHA-256 `1062C8FE878FE048AE231A020D494A4FD0001EBA6C1F93BD5CD54DE2BFA99ED9`.
- Packaged `resources/extension/chatgpt-dom.js` contains `data-prompt-literal-paste`.
- The installer was not launched or installed; live ChatGPT verification remains outstanding.

## Fork update-channel isolation

The installed 2.1.14 fork still had `src/main/update.ts` pointing at the original author's
`totec448-spec/chat-on-steroids` release feed and checking immediately plus every six hours.
The user's configured `origin` is `zxjajin/chat-on-steroids`; its latest-release endpoint had
previously returned 404, so there is no fork release channel to auto-apply yet. The tray app had
also staged the upstream 2.1.16 Windows installer under `%APPDATA%\chat-on-steroids\updates`;
ordinary quit could hand that verified upstream binary to NSIS and overwrite the local fork.

Changed the app updater's repository and release-page link to the user's fork and removed
background update checks. Any future updater lookup is scoped to the fork feed; the browser
extension download remains a separate upstream artifact/version path. The updater regression
test now verifies startup makes no network request and creates no timer. The staged upstream
installer must be moved out of its expected path before quitting the old installed process, then
the rebuilt local installer can safely replace it for testing.

Validation and packaging:

- `npm exec -- vitest run test/update.test.ts` — 1 file, 26 tests passed.
- `npm run typecheck` — passed.
- `npm run build` — passed (existing Vite mixed static/dynamic import warnings only).
- Windows x64 tunnel-client, ripgrep and native package preparation — passed.
- `electron-builder --win --x64 --publish never --config.directories.output=release-local-20260928`
  — passed; unsigned local installer created at
  `release-local-20260928/Chat-On-Steroids-Setup-x64.exe` (164,265,050 bytes), SHA-256
  `5187812F6458F06F35321DE766BA83268DE59AA207D4226CA243730AD0F6FAFE`.
- `git diff --check` — passed. `THIRD-PARTY-NOTICES.txt` was restored byte-for-byte after
  the packaging script generated build notices.
- The staged upstream installer was recoverably renamed to
  `%APPDATA%\chat-on-steroids\updates\2.1.16\Chat-On-Steroids-Setup-x64.exe.upstream-quarantined`
  (164,640,393 bytes); it was not deleted.
- Installation completed after the existing app processes exited. The installed executable
  SHA-256 matches the package's `win-unpacked/Chat On Steroids.exe` exactly
  (`9C2F7E605ECE0392A1EF843D8D8CC2E34F60EC4A4DD6EDDC7CC6354B1EF9B39D`); installed
  `resources/app.asar` also matches the packaged ASAR
  (`5639300FBE5DDB0D4CCF2F5561E2BEEDE25921B5F392E0E539934EA741364466`).
- The installed app launched and restored the local projects/chats. It currently reports
  **未连接**. The Chat On Steroids Desktop browser-tools endpoint returns
  `Tunnel-client has not been seen for 300 seconds`, and no `tunnel-client`/`cloudflared`
  process is running. App logs show its bridge starts, but no tunnel connection is established.
- No live ChatGPT message-flow verification has started yet; the tunnel/connection needs to be
  connected first. The Windows screenshot capture timed out twice, and accessibility click
  reported `coordinate input geometry is unavailable`, so the Connect button could not be
  safely activated by automation.
