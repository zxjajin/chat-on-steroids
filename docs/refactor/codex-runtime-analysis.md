# Codex Runtime Analysis

## Objective

Evaluate reusable Codex components without introducing a second Agent system.

## Reusable Components

Recommended investigation targets:

- codex-exec-server
- codex-apply-patch
- codex-file-system

## Not Included

The first phase should not depend on:

- codex-core
- codex-app-server
- codex-thread-store
- codex-rollout
- codex-goal-extension

Reason:

Those components belong to the complete Codex Agent runtime and would introduce another agent lifecycle.

## Target Model

```
ChatGPT
  |
MCP
  |
Chat On Steroids Bridge
  |
Codex Runtime Adapter
  |
Execution Components
  |
Workspace
```

## Expected Adapter Responsibilities

- process execution
- patch application
- filesystem operations
- error normalization

The adapter should expose stable capabilities without exposing Codex Agent internals.
