/**
 * Compatibility entry point for callers that used the old Codex path.
 *
 * Process custody is a Chat On Steroids authorization concern, so its implementation lives in
 * `main/terminal-ownership.ts`; this facade keeps existing internal/test imports source-compatible
 * while preventing a second ownership registry from appearing under the Codex execution layer.
 */
export * from '../terminal-ownership.js';
