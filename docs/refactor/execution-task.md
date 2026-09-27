# Chat On Steroids Refactor Execution Task

## Objective

Refactor Chat On Steroids into a stable local coding bridge while preserving existing MCP and Codex capabilities.

Target:

```
ChatGPT
  ↓
MCP Bridge
  ↓
Codex Runtime
  ↓
Workspace
```

Agent features become optional modules.

---

# Phase 1 - Capability Isolation

## Goal

Make coding workflow the default path.

## Tasks

1. Keep existing Agent source code.
2. Ensure multi-agent capability remains disabled by default.
3. Hide Agent tools from default MCP exposure.
4. Hide Agent UI entry points unless enabled.
5. Verify:
   - file read
   - search
   - patch
   - command execution

## Acceptance Criteria

- ChatGPT sees coding tools only by default.
- Existing coding workflow is unchanged.

---

# Phase 2 - MCP Tool Separation

## Goal

Remove the large mixed responsibility core tool module.

## Tasks

Refactor:

```
src/main/mcp/tools-core.ts
```

into:

```
tools-workspace.ts
tools-terminal.ts
tools-session.ts
tools-agent.ts
```

Requirements:

- No behavior change.
- Keep capability checks.
- Add tests for registration.

---

# Phase 3 - Agent Platform Isolation

## Goal

Separate optional Agent platform.

Move behind boundary:

- agents runtime
- goal loop
- swarm
- agent renderer UI

Requirements:

- No dependency from coding path to Agent path.
- Agent can be enabled independently.

---

# Phase 4 - Codex Runtime Enhancement

## Goal

Improve coding execution reliability.

Tasks:

- improve command lifecycle
- improve streaming output
- improve error reporting
- improve workspace isolation
- improve recovery handling

---

# Validation Strategy

After every phase:

Run:

```
pnpm typecheck
pnpm test
pnpm build
```

Manual verification:

1. Connect ChatGPT.
2. Read project files.
3. Search code.
4. Apply patch.
5. Execute build command.
6. Verify MCP reconnect.

---

# Constraints

Do not:

- rewrite MCP server
- replace Codex runtime
- delete Agent code before dependency analysis
- introduce duplicate permission systems
