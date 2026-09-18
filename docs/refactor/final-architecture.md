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

## 收敛模块

### Agent Orchestration

当前包含：

- Worker
- Swarm
- Spawn
- Message
- Finish

这些能力属于多 Agent 平台，不属于本项目核心。

处理方式：

- 第一阶段关闭入口
- 第二阶段删除无调用代码

### Goal Loop

Goal 模块当前负责第二模型驱动自动继续。

目标架构中：

ChatGPT 本身负责推理和任务推进。

Goal Loop 不作为默认流程。

## 最终定位

Chat On Steroids = ChatGPT Local Code Bridge

不是：

- Agent 平台
- Multi Agent 框架
- 第二模型调度系统
