# Chat On Steroids Full Codebase Audit

Status: Phase 0 deliverable, current implementation snapshot.

This document is the consolidated Phase 0 evidence index. The detailed source notes remain in
`cos-current-architecture.md`, `codex-runtime-analysis.md`, `integration-plan.md`,
`migration-plan.md` and `removal-plan.md`.

## Module Map

| Boundary | Current owner | Contract to preserve |
| --- | --- | --- |
| Electron shell | `src/main/index.ts`, window/shutdown modules | single instance, startup, bounded shutdown |
| Connection and MCP | `src/main/connection.ts`, `mcp/server.ts`, `mcp/surfaces.ts` | endpoint/tunnel generations and surface exposure |
| Caller and permissions | `src/main/mcp/kernel.ts`, `config.ts`, `sandbox.ts`, `session/correlation.ts` | exact caller proof, live capabilities, approved-root containment |
| Session and timeline | `src/main/session/*`, `src/shared/session.ts` | durable history, chronology, attribution and tool truth |
| ChatGPT input/browser | `src/main/bridge.ts`, `browser.ts`, `extension/*` | native browser actions, receipts, document/conversation identity |
| Automation | `src/main/goal.ts`, `src/main/agents.ts`, `src/main/mcp/tools-agents.ts` | Goal/Loop, worker families, durable inboxes and browser bootstrap |
| Coding execution | `src/main/codex/*`, `runtime-adapter.ts`, `coding-task.ts`, `coding-plan.ts`, `coding-agent.ts` | coding task/plan contracts, worker bootstrap protocol and bounded file/search/patch/image/process execution |
| Renderer projection | `src/renderer/chat.ts`, agent panel and timeline modules | UI projection only; no new authority |

## Data Flow

```text
ChatGPT browser conversation
  -> extension observation and request correlation
  -> MCP surface / kernel live guard
  -> COS caller, permission and workspace proof
  -> CodexTaskContract
  -> Codex runtime adapter
  -> filesystem / patch / process ports
  -> COS recording and MCP result
  -> session timeline and renderer projection
```

Automation follows a separate path after caller proof:

```text
agents MCP tool -> tools-agents.ts -> CodexCodingTask -> agents.ts durable broker
  -> bridge bootstrap/revival -> worker ChatGPT conversation
  -> same MCP proof and Codex execution boundary
```

## Lifecycle

- Startup restores config, sessions, correlations, Goal ledgers, agent families and continuation
  state before browser traffic is admitted.
- A local session is durable identity; its ChatGPT conversation can be replaced by continuation.
- Worker families and Goal/Loop remain reusable Automation state, not disposable coding runtime.
- Shutdown drains accepted work, process/browser/plugin resources, recording and durable state in
  the existing owner order.

## MCP Chain

`mcp/surfaces.ts` publishes the current surface shape. `tools-core.ts` retains the Coding Core
schemas and COS policy. It resolves the approved path, checks permissions and caller identity,
then passes an explicit `CodexTaskContract` to `runtime-adapter.ts`. The adapter delegates to
bounded Codex ports for read/stat/list/walk/image/search/patch/process allocation/exec/stdin.
The adapter does not import renderer, MCP, Goal or Agent orchestration.

## Agent Chain

`tools-agents.ts` owns the MCP registration and request-scoped identity resolution for the
Automation Agent. `agents.ts` owns worker topology, inboxes, durable acceptance, revival and
finish state. `coding-agent.ts` owns the Coding Worker bootstrap/report/handoff protocol; `bridge.ts`
owns browser command publication and receipts. Session History and
Timeline remain shared projections. `multiAgent.enabled` gates the live tool/UI surface; hiding
the renderer does not delete or stop durable Agent state.

## Codex Chain

The current repository contains Codex execution components, not a separately installed complete
Codex model/agent service. `runtime-adapter.ts` is the integration seam. COS supplies
`requestId`, `sessionId`, `conversationId` and proven real/virtual workspace data. COS retains
permission, containment, process ownership, recording and MCP presentation. Codex ports perform
bounded file, search, patch, image and unified-exec work.

The Project Files IPC path in `src/main/project-files.ts` uses an explicit `project-files` task
contract containing the exact project id and contained workspace. Its editor revision snapshot
and image/PDF-specific transformations remain Project Files-owned; they must not be connected
using an empty or guessed MCP conversation identity.

## Duplicate Capability Analysis

- The MCP Core no longer calls the Codex file/search/patch/terminal ports directly; those calls
  cross the adapter.
- Agent/Goal are not duplicate Coding executors by evidence: they still own Automation state,
  browser bootstraps, continuation, inboxes and user-visible history.
- `src/main/swarm` is not present in the current tree, so it is not a deletion candidate.
- `agents.ts` and `goal.ts` have active consumers across bridge, IPC, startup, session and MCP
  modules. No candidate currently satisfies “no callers + replacement + verification”.

## Migration Plan and Evidence Gaps

1. Capability Isolation: complete; renderer MultiAgent projections use the existing config gate.
2. Codex Runtime Integration: implementation boundary complete; compile/test verification is
   pending because this conversation explicitly defers compilation and tests.
3. Agent Runtime Decoupling: Agent tool extraction, `CodexCodingTask`, Coding plan contract and
   worker bootstrap/revival/handoff protocol are separated. ChatGPT worker execution/result
   handoff remains intentional COS Automation ownership; this repository does not add a second
   full Codex Agent lifecycle.
4. Duplicate Runtime Removal: audit complete with no safe deletion candidate; do not delete
   Automation or user data.
5. Cleanup: documentation is aligned; source cleanup waits for Phase 3/4 evidence.

## Evidence Level

This audit is source-level evidence. It does not prove build output, packaged bytes, installed
payloads or live Chrome/provider behavior. Those claims require the corresponding checks when the
user authorizes compilation, tests and live verification.
