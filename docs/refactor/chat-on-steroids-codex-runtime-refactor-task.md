# chat-on-steroids Architecture Refactor Task

## Project

Repository:

- zxjajin/chat-on-steroids

Related Repository:

- zxjajin/codex


# 1. Refactor Goal

当前 chat-on-steroids 同时承担：

```
ChatGPT Extension Layer

+
Automation Platform

+
Agent Runtime

+
Coding Agent Runtime
```

导致：

- Runtime 职责重复
- Agent 能力边界不清晰
- Coding Workflow 与 Chat Extension 强耦合

目标：

将职责拆分为：

```
Chat On Steroids

负责：

- ChatGPT UI增强
- Chrome Integration
- Session管理
- Timeline
- MCP Bridge
- Automation


Codex Runtime

负责：

- Coding Agent
- Repository Analysis
- File Editing
- Terminal Execution
- Git Workflow
- Code Task Planning
- Verification
```


# 2. Target Architecture

```
                 ChatGPT

                    |
                    |

          Chat On Steroids

        --------------------
        UI
        Session
        Timeline
        MCP
        Automation
        --------------------

                    |
                    |

              Codex Runtime

        --------------------
        Coding Agent
        Tool Executor
        File System
        Terminal
        Git
        --------------------
```


# 3. Refactor Principles

## Incremental Migration

禁止一次性重写。

执行：

```
Audit
↓
Capability Isolation
↓
Runtime Integration
↓
Migration
↓
Remove Duplicate Runtime
↓
Cleanup
```


## Preserve Compatibility

禁止破坏：

- Session History
- Timeline
- MCP
- Existing User Data
- Automation


## Do Not Delete Before Replacement

任何删除必须满足：

1. 新实现已经存在
2. 调用链已经迁移
3. 测试通过
4. 有迁移文档


# 4. Current Audit Status

已完成：

- 项目模块分析
- Renderer 生命周期分析
- MCP链路分析
- Agent链路分析
- Codex定位分析


# 5. Phase Plan

# Phase 0: Architecture Audit

Status:

DONE

输出：

```
docs/refactor/full-codebase-audit.md
```

当前文件已补齐，并汇总模块、数据流、生命周期、MCP、Agent、Codex、重复能力和迁移证据。


内容：

- Module Map
- Data Flow
- Lifecycle
- MCP Chain
- Agent Chain
- Codex Chain
- Duplicate Capability Analysis
- Migration Plan


# Phase 1: Capability Isolation

Status:

DONE


## Goal

让：

```
multiAgent.enabled
```

成为 MultiAgent UI Surface 唯一开关。


## Scope

修改：

```
src/renderer/chat.ts
```

禁止：

```
src/main/*
src/shared/*
```

除非必要。


## Required Changes

### 1. Add MultiAgent Gate

新增：

```ts
function multiAgentEnabled(): boolean {
    return deps.state()?.config.multiAgent.enabled ?? false;
}
```

要求：

- 使用已有 AppState
- 不新增配置
- 不新增状态管理


## 2. Agent Plan Isolation

定位：

```
renderAgentPlan()
```

当 multiAgent.enabled=false：

- 不渲染 Agent Plan
- 清空 DOM
- 隐藏容器

开启：

恢复。


禁止影响：

- Goal
- Loop
- Automation
- Session Controls


## 3. Worker / Swarm UI Isolation

定位：

```
paintSwarm()
```

关闭 MultiAgent 时隐藏：

- Worker列表
- Worker操作入口
- Agent交互入口

保留：

- SwarmState
- AgentState
- Session Event
- Runtime Update

禁止：

- 删除状态
- 停止 runtime


## 4. Agent Panel Isolation

定位：

```
createAgentPanel()
agentPanel.update()
```

如果属于交互入口：

关闭：

调用：

```
hide()
```

开启：

恢复：

```
show()
update()
```

优先不修改：

```
agent-panel.ts
```


# Phase 1 Acceptance

## Disabled

配置：

```json
{
 "multiAgent":{
   "enabled":false
 }
}
```

正常：

- Chat
- MCP
- Codex
- File Tool
- Terminal
- Goal
- Loop
- Automation
- Session History
- Timeline

隐藏：

- Agent Plan
- Worker UI
- Agent Panel
- Agent Controls


## Enabled

配置：

```json
{
 "multiAgent":{
   "enabled":true
 }
}
```

恢复：

- Agent Plan
- Worker UI
- Agent Panel
- Agent Interaction


## Phase 1 Completion

已完成：

- `multiAgent.enabled` 成为 renderer MultiAgent UI Surface 的统一可见性开关。
- 关闭时清空并隐藏 Agent Plan，隐藏 Swarm 列表、清理入口、Agent Panel、Agent 过滤器和 worker chat 入口。
- 保留 `SwarmState`、worker/session 历史、Timeline 事件和 runtime 更新；Goal、Loop、Automation、MCP、文件和终端路径未改动。
- 开启时沿原有 `chatApply`、`paintSwarm`、`paintSessions` 和 session-control 刷新路径恢复 UI。

变更文件：

- `src/renderer/chat.ts`
- `test/renderer-timeline.test.ts`

验证证据：

- `npm run typecheck`：通过。
- renderer layout 与 MultiAgent/Plan 相关回归用例：通过。

风险与未覆盖：

- 本阶段只隔离 renderer UI，不改变 main/shared runtime、权限、MCP 或 worker 生命周期。
- 已进入 Phase 2；本阶段只隔离 renderer UI，不删除任何重复 runtime。


# Phase 2: Codex Runtime Integration

Status:

IMPLEMENTED (validation pending)

目标：

COS 调用 Codex Runtime。

COS负责：

- User Interaction
- Session
- MCP
- Permission
- UI

Codex负责：

- Coding Task
- Repository
- File Operation
- Terminal
- Git
- Verification


建立：

```
COS

|

Task Contract

|

Codex Runtime
```


## Phase 2 Progress

已建立第一段 Task Contract：

- COS 在 MCP Core handler 中组装 request、session、conversation 和 workspace 证据。
- `src/main/codex/runtime-adapter.ts` 成为 MCP Core 文件读取、目录/元数据、图片、搜索、Patch 和 Terminal 执行的统一入口；Terminal 的进程分配、执行和 `write_stdin` 也使用同一入口。
- Git workflow 与 verification 通过同一 `execCommand`/`writeStdin` terminal contract 和 Patch/diff 结果承载；不再新增一个平行的 Git 或验证 tool runtime。
- Codex execution modules 不反向依赖 MCP、renderer、Goal 或 Agent orchestration。
- 权限、路径 containment、process ownership、session recording 仍由 COS 原有 owner 执行。

当前未完成：

- `src/main/project-files.ts` 的目录、元数据和文本读取已通过 `CodexProjectTaskContract` 接入 adapter；编辑器 revision snapshot、图片/PDF 专用转换仍由 Project Files owner 负责，不能用 MCP conversation identity 替代。
- Agent/Goal runtime 继续由 COS Automation 保留；Phase 3/4 已确认它们不是可安全删除的重复 Codex runtime。
- 本次对话不编译、不运行测试；静态 `git diff --check` 已通过，编译/测试证据留待后续授权。

Phase 2 实现边界已完成，验证状态仍为待补充；未满足验证前不删除任何旧 runtime。


# Phase 3: Agent Runtime Decoupling

Status:

IMPLEMENTED (validation pending)

目标：

拆分 Coding Core 与 COS Automation：

```
COS Agent

+

Coding Execution
```

改为：

```
COS Automation Agent

+

Codex Coding Execution Layer
```


Codex boundary 接管：

- Coding Task contract
- Coding plan contract
- File/search/Patch/Terminal execution
- `CodexCodingTask` consumed by the COS worker protocol


保留：

- Timeline
- History
- Worker/Swarm lifecycle
- Goal/Loop Automation

本阶段不引入完整 Codex Agent Runtime。ChatGPT worker 的模型执行、worker durable
history、消息路由、Goal/Loop 和 Timeline 继续由 COS Automation owner 负责；Codex
Runtime 只接管可复用的 coding execution boundary 和协议 contract。

## Phase 3 Progress

边界实现已完成，以下职责已经分离：

- `src/main/mcp/tools-agents.ts` 独立承载 `agents` MCP tool 的 schema、caller 证据、worker 生命周期、durable acceptance 和消息投递。
- `src/main/codex/coding-task.ts` 定义 `CodexCodingTask`；`agents action=spawn` 在进入 Automation broker 前组装结构化 Coding Task，旧 durable worker brief 仍按原格式渲染保存。
- `src/main/codex/coding-plan.ts` 定义 Coding plan contract 与模型描述；`plan-tool.ts` 只保留 MCP registration、caller proof 和 COS Session projection。
- `src/main/agent-worker-protocol.ts` 集中承载 ChatGPT worker 的首条任务、revival 和 finish handoff 协议文本；这些是 COS Automation 协议，不属于 Codex execution module。
- `bridge.ts` 只负责 browser command transport、claim 和 receipt；`agents.ts` 只保留 inbox 选择、worker 状态转换、durable acceptance 和 revival 投递时机。
- `src/main/mcp/tools-core.ts` 仅保留 Agent tool 的注册调用；Coding Core 不再内嵌 Agent tool 的实现与身份协调依赖。
- 没有改变 `AgentState`、worker 持久化、Timeline、Session History、Goal/Loop 或浏览器 bootstrap 行为。

边界保留项与验证：

- Agent broker 仍是 ChatGPT Automation 的运行时；这是最终架构的保留项，不是待删除的重复 Codex runtime。
- ChatGPT worker 的模型执行/报告/验证生命周期不会在本仓库内替换为第二个 Agent runtime；Codex contract 作为独立执行层边界保留。
- Coding plan contract 已迁移；plan 的 durable session projection 仍由 COS 保持单一 owner。
- Worker bootstrap 的协议文本已迁移；worker 的实际 ChatGPT 执行、结果 durable handoff 和验证仍由现有 Automation 路径负责。
- `test/coding-agent-contract.test.ts` 已补充 Coding Task 与 COS worker protocol 的回归覆盖；按本次对话约束尚未执行。
- 本次对话不编译、不运行测试；仅做静态依赖与补丁检查。


# Phase 4: Duplicate Runtime Removal

Status:

AUDITED (no safe deletion)

删除候选：

- Duplicate Coding Executor
- Duplicate Tool Runtime
- Duplicate Repository Workflow


删除前必须：

- 无调用
- 有替代
- 有测试

当前不删除 Agent broker、Goal/Loop、Session、Timeline、MCP 或 Project Files；它们仍有产品职责或仍存在调用链。

## Phase 4 Audit

静态调用审计结论：

- `src/main/agents.ts` 仍被 Bridge、IPC、startup、MCP kernel、browser tools、continuation、correlation、progress 和新的 `tools-agents.ts` 使用。
- `src/main/goal.ts` 仍被 Bridge、IPC、continuation、finish 和 input 使用。
- `src/main/swarm` 当前不存在；不能把不存在的目录当作可删除实现。
- 当前没有满足“无调用 + 有替代 + 有验证”的重复 Coding executor/tool/workflow 候选，因此本阶段不删除源码。


# Phase 5: Cleanup

Status:

DOCUMENTED (validation pending)

最终：

COS:

```
ChatGPT Productivity Platform
```

Codex:

```
Coding Agent Execution Layer
```


# Execution Rules

每个 Phase：

必须：

1. 小范围修改
2. 保持可运行
3. 提交独立 commit
4. 更新 docs/refactor


输出：

```
Modified Files

Change Summary

Risk

Test Result

Next Step
```


# Current Next Action

后续授权验证：

```
compile / tests / live integration checks
```

Phase 1 已完成；Phase 2/3 实现边界已完成但验证待补；Phase 4 已完成静态删除审计；Phase 5
文档已对齐。当前对话按用户要求不编译、不运行测试。
