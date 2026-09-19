# Chat On Steroids Current Architecture Analysis

## Repository

Repository: zxjajin/chat-on-steroids

## Current Positioning

Chat On Steroids is a cross-platform local MCP capability layer for ChatGPT. The repository description highlights Chrome integration, Goal, Compact & Resume, and durable multi-agent workflows.

## Phase 0 Scope

This document records the current architecture investigation only. No production code changes are included.

## Main Layers

```
ChatGPT
  |
MCP / Connector
  |
Chat On Steroids Desktop Core
  |
Local capabilities
  |
Workspace / Browser / Runtime tools
```

## Architecture Areas To Preserve

- Electron desktop lifecycle
- MCP connection handling
- Connector and authentication flow
- Tunnel lifecycle
- Workspace security boundary
- Diagnostics and recovery behavior

## Refactor Direction

The future direction is to keep Chat On Steroids as the local bridge layer and avoid embedding another full coding agent runtime.

The bridge should focus on:

- connection
- permission
- workspace isolation
- tool routing
- runtime lifecycle
