# Integration Plan

## Goal

Evolve Chat On Steroids into a stable ChatGPT local code bridge.

## Principles

- Do not build a second Agent.
- Keep ChatGPT as the reasoning layer.
- Keep Chat On Steroids as connection and security layer.
- Use Codex components only as execution building blocks.

## Phase 0

Completed by this document set:

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

Improve lifecycle handling:

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
