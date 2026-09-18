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
