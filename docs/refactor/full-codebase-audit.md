# Chat On Steroids Full Codebase Audit

## 1. Project Module Map

```
chat-on-steroids
├── src/main
│   ├── bridge / connection / tunnel
│   │   Local ChatGPT connection layer
│   ├── mcp
│   │   MCP server, surfaces and tools
│   ├── codex
│   │   Coding execution runtime
│   │   - filesystem
│   │   - shell
│   │   - patch
│   │   - command lifecycle
│   ├── workspace
│   ├── session
│   ├── browser / computer
│   └── agents
│       Agent runtime
├── src/shared
│   Shared types and configuration contracts
├── src/renderer
│   Desktop UI
│   └── agent UI components
└── scripts
    Build, verification and dependency scripts
```

## 2. Data Flow

### Coding Flow

```
ChatGPT
  ↓
MCP Surface
  ↓
Core Tools
  ↓
Codex Runtime
  ↓
Workspace
  ↓
File / Shell / Patch
```

### Agent Flow

```
ChatGPT
  ↓
Agent Tools
  ↓
Agent Runtime
  ↓
Worker / Goal / Swarm
  ↓
Session
```

## 3. Lifecycle

```
Electron Start
 ↓
Load Config
 ↓
Initialize Bridge
 ↓
Create MCP Server
 ↓
Build Surface
 ↓
Register Enabled Tools
 ↓
Handle ChatGPT Requests
```

MCP server is dynamically built according to configuration. Capability changes do not require a full restart.

## 4. MCP Chain

Current architecture:

```
Config
 ↓
Capability
 ↓
Surface
 ↓
Tool Registration
 ↓
Runtime Handler
```

Existing design already supports disabling tools without deleting implementation.

## 5. Codex Execution Chain

The repository already contains a Codex execution layer.

Current responsibility:

- filesystem operations
- command execution
- patch application
- terminal lifecycle
- execution ownership

Conclusion:

No separate Codex integration is required. The refactor should strengthen the existing runtime.

## 6. Agent Chain

Agent platform consists of:

Main:

- agents runtime
- goal loop
- worker/swarm logic

Renderer:

- agent panel
- agent plan
- agent communication UI

Agent is a complete optional platform, not a simple MCP tool.

## 7. Deletion Candidates

Do not delete immediately:

- agents runtime
- goal runtime
- swarm logic
- agent UI

Reason:

They have multiple dependencies.

First stage should isolate and disable by capability.

## 8. Keep Modules

Keep as core product:

- MCP bridge
- tunnel
- workspace
- Codex runtime
- filesystem tools
- terminal tools
- session management
- connection lifecycle

## 9. Final Refactor Task

Goal:

Transform Chat On Steroids from an AI Agent Platform into a ChatGPT Local Coding Bridge.

Main principles:

1. Keep existing Codex runtime.
2. Keep MCP architecture.
3. Make Agent platform optional.
4. Separate coding tools from agent tools.
5. Avoid deleting functionality before dependency removal.

## 10. Implementation Plan

### Phase 1: Capability Isolation

- Disable Agent exposure by default.
- Hide Agent UI by default.
- Keep source code.
- Verify coding workflow.

### Phase 2: MCP Tool Split

Split large core tool module:

```
tools-core.ts
 ↓
tools-workspace.ts
tools-terminal.ts
tools-session.ts
tools-agent.ts
```

### Phase 3: Agent Platform Isolation

Move Agent-related modules behind an optional boundary.

### Phase 4: Codex Runtime Improvement

Improve:

- streaming
- lifecycle handling
- error model
- workspace isolation
