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

Implementation started in `src/main/codex/runtime-adapter.ts`: the MCP Core handler now passes
an explicit `CodexTaskContract` to the existing Codex file/search/patch/terminal ports. COS still
owns permission and caller proof; the adapter owns only the execution boundary. Remaining Core
execution call sites and the later Agent cleanup stay in their planned phases.

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
