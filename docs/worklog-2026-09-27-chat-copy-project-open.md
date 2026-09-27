# Chat copy, project folder opening and clipboard files

## Change

- Project sidebar context menu opens the validated project root in the OS file manager through the existing project-file IPC. The Files panel's root Reveal action now does the same.
- User and assistant messages expose copy actions; assistant messages offer rendered text and Markdown source. Rendered code blocks have their own copy action.
- Chat sidebar context menu copies the recorded user/assistant conversation as Markdown, including desktop-only sessions. Main pages the canonical history and refuses missing full text or exports above the clipboard limit; tool payloads are excluded.
- Clipboard file pastes use the same attachment staging as drops and picker uploads. The main process reads Electron's OS file-reference clipboard format first and falls back to renderer-provided file objects; ordinary text and non-file URI pastes remain native.

## Scope and validation

- The existing project id, approved-root resolution, clipboard IPC and attachment staging remain the authority for these actions.
- `npm run build` and `npm run typecheck` passed.
- Focused renderer validation passed: 3 files, 231 tests. Full `npm test`: 211 files passed, 4 skipped; 1 file failed with 5 failures in `test/tunnel-lifecycle.test.ts`. No other tests failed in the final full run.
- `npm run dist:x64` generated `release/Chat-On-Steroids-Setup-x64.exe`. Windows signing is not configured. The working-tree `THIRD-PARTY-NOTICES.txt` was restored after packaging so its pre-existing edits remain intact.
- `git diff --check` passed for the changed feature/test files. The packaged app was not installed or opened; Windows Explorer clipboard behavior and installed-app rendering remain unverified.
