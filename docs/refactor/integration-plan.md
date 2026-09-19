# Integration Plan

## Goal

Evolve Chat On Steroids into a stable ChatGPT local code bridge.

## Principles

- Do not build a second Agent.
- Keep ChatGPT as the reasoning layer.
- Keep Chat On Steroids as connection and security layer.
- Use Codex components only as execution building blocks.

## Phase 0

Completed by this document set and consolidated in
`docs/refactor/full-codebase-audit.md`:

- current architecture analysis
- Codex runtime analysis
- integration direction

## Phase 1 PoC

Implement minimal adapter capabilities:

- read file
- search code
- apply patch
- execute command

Do not remove existing features.

## Phase 2

Add:

- workspace permission model
- audit information
- normalized errors
- runtime status remains the COS connection/diagnostics responsibility; the adapter does not
  publish synthetic health for an in-process execution port

Implemented in `src/main/codex/runtime-adapter.ts`: the MCP Core handler passes an explicit
`CodexTaskContract` to the existing Codex file, directory, image, search, patch and terminal
ports. Process-id allocation, `exec_command` and `write_stdin` share that same boundary. COS
still owns permission, caller proof, process ownership through `src/main/terminal-ownership.ts`
and recording; the adapter owns only the
execution boundary. Project Files uses a separate explicit `project-files` task contract for
directory, metadata and text reads; editor snapshots and image/PDF transformations remain in
the UI-specific owner.

## Phase 3

Agent boundary extraction is in progress. The Agent MCP registration and worker lifecycle
coordination now live in `src/main/mcp/tools-agents.ts`; `tools-core.ts` keeps the coding tool
surface and calls the Agent registration entry without embedding its implementation. This is a
module-boundary step only. `tools-agents.ts` now creates the Codex-owned `CodexCodingTask`
contract before entering the durable Agent broker. The durable Agent broker, worker bootstrap and
Goal/Loop behavior and ChatGPT worker execution are intentionally retained as COS Automation
ownership; this project does not introduce a second full Codex Agent lifecycle.
`agent-worker-protocol.ts` owns the ChatGPT worker bootstrap/report/revival protocol text as
COS Automation code; the browser bridge only transports the resulting message and its
receipts. The broker still owns inbox selection, worker state, durable acceptance and delivery
timing. `CodexCodingTask` remains the explicit task contract consumed at that boundary.

Remaining validation work:

- compile/typecheck
- focused regression tests
- live integration checks when authorized

## Final Architecture

```
ChatGPT
  |
MCP
  |
Chat On Steroids
  |
Codex Runtime Adapter
  |
Filesystem / Patch / Process
  |
Project Workspace
```
