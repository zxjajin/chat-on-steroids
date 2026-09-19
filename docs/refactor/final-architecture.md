# Chat On Steroids 重构最终架构方案

## 目标

将 Chat On Steroids 从一个包含 Agent 编排能力的平台，收敛为稳定的 ChatGPT 本地代码执行桥。

核心目标：

```
ChatGPT
  |
 MCP
  |
Chat On Steroids Bridge
  |
Codex Execution Layer
  |
Filesystem / Process / Patch
  |
Workspace
```

## 保留模块

### Connection Layer

保留：

- Electron Desktop
- Bridge
- Tunnel
- Connector
- Auth
- Health
- Reconnect
- Session

职责：负责 ChatGPT 与本地环境通信。

### Execution Layer

保留当前 `src/main/codex`。

职责：

- 文件读取
- 文件搜索
- Patch 修改
- Shell 执行
- Process 管理

不引入完整 Codex Agent Runtime。

## Automation Boundary

### Agent Orchestration

当前包含：

- Worker
- Swarm
- Spawn
- Message
- Finish

这些能力属于 Chat On Steroids 的 Automation 层，不属于 Codex Coding Runtime；它们仍负责
worker durable history、消息路由、Goal/Loop 以及 Timeline 投影，不应因为 Coding Runtime
迁移而被删除。

处理方式：

- 第一阶段隔离 renderer 和 MCP registration 入口
- 第二阶段只删除已经由 Codex replacement 覆盖且无调用的重复 Coding executor
- Automation Agent 的用户数据和运行时保持兼容

### Goal Loop

Goal 模块当前负责第二模型驱动自动继续。

目标架构中：

ChatGPT 本身负责推理和任务推进。

Goal Loop 不作为默认流程。

## 最终定位

Chat On Steroids = ChatGPT Productivity Platform + Local Code Bridge

Codex Runtime = Coding Agent Execution Layer

不把 Chat On Steroids 的 Automation 能力误判为重复 Coding Runtime，也不把 Codex Runtime
扩展成第二个 ChatGPT connector。

Chat On Steroids 不是：

- Coding Agent Runtime 的 owner
- Codex Runtime 的替代实现
