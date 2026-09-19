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
- runtime status

Implemented in `src/main/codex/runtime-adapter.ts`: the MCP Core handler passes an explicit
`CodexTaskContract` to the existing Codex file, directory, image, search, patch and terminal
ports. Process-id allocation, `exec_command` and `write_stdin` share that same boundary. COS
still owns permission, caller proof, process ownership and recording; the adapter owns only the
execution boundary. The Project Files IPC preview path remains separate until it has its own
proven caller/workspace contract.

## Phase 3

Agent boundary extraction is in progress. The Agent MCP registration and worker lifecycle
coordination now live in `src/main/mcp/tools-agents.ts`; `tools-core.ts` keeps the coding tool
surface and calls the Agent registration entry without embedding its implementation. This is a
module-boundary step only: the durable Agent broker, worker bootstrap and Goal/Loop behavior are
intentionally retained until a complete replacement contract exists.

Next lifecycle work:

- runtime startup
- health check
- recovery
- shutdown

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
