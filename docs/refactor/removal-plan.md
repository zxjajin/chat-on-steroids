# Agent 层裁剪计划

## 原则

不直接删除功能。

先关闭入口，再确认无依赖，最后删除代码。

## 第一阶段：隔离

目标模块：

```
src/main/agents
src/main/goal
src/main/swarm
```

处理：

- 保留代码和 durable state
- `multiAgent.enabled` 只控制 UI/工具暴露的当前 live gate
- 不把 UI 隐藏误当作停止 runtime，也不改变 Goal/Loop/Automation 的保存语义

## 第二阶段：MCP 收敛

减少暴露工具：

保留：

- read_file
- search_code
- apply_patch
- exec
- workspace_info

后续只有在有替代和验证后才评估：

- 重复的 Coding executor/tool/workflow
- 已迁移且无调用的旧入口

## 第三阶段：代码清理

确认无调用、已有替代、验证通过并完成迁移文档后才删除：

- 重复的 Coding Worker executor
- 重复的 Coding tool runtime
- 重复的 Repository workflow

## 不删除

必须保留：

- Session
- Durable Store
- Workspace
- Permission
- Codex Tools
- Bridge
- Automation / Goal / Loop
- Agent durable history（除非用户明确要求产品下线）

这些属于本地执行桥核心能力。
