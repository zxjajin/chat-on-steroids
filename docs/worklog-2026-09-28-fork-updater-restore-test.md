# Fork updater and local package verification — 2026-09-28

## Scope

Confirm that this fork does not automatically download the upstream author's executable, then
build and verify a local Windows x64 package from the current working tree. The working tree
already contained the updater change in `src/main/update.ts` and its regression in
`test/update.test.ts`; this pass did not overwrite or roll back those shared edits.

## Evidence

- The checked updater points release lookups at `zxjajin/chat-on-steroids` and
  `startUpdateChecks()` performs no request or timer scheduling.
- The installed app's historical log contains 2.1.16 update/download/handoff entries from the
  prior updater run. No later updater entry appeared after that handoff.
- The installed `D:\apps\Chat On Steroids\resources\app.asar` SHA-256 equals the newly built
  `release-test-20260928\win-unpacked\resources\app.asar` SHA-256:
  `5639300FBE5DDB0D4CCF2F5561E2BEEDE25921B5F392E0E539934EA741364466`.
- The generated Windows installer is
  `release-test-20260928\Chat-On-Steroids-Setup-x64.exe` (2.1.14; 164,264,951 bytes).
- Existing `release`, `release-fixed-20260928` and `release-local-20260928` outputs were left
  untouched.

## Validation

- `npm test -- --run test/update.test.ts` — 26 tests passed.
- `npm run typecheck` — passed.
- `npm run build` — passed; Vite emitted only existing dynamic/static import chunk warnings.
- `node node_modules/electron-builder/out/cli/cli.js --win --x64 --publish never --config.directories.output=release-test-20260928` — passed.
- `node scripts/smoke-packaged-runtime.mjs --platform win32 --arch x64 --root release-test-20260928/win-unpacked` — passed.

The remaining live interaction checks were not attempted after the desktop input API returned
`FOCUS_FAILED` because the Codex window owned the foreground. No app input was dispatched by
that failed action; the app still has an unsent test draft and its reasoning effort remains at
the test value until the UI can be focused safely.
