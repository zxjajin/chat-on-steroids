# Agent 层裁剪计划

## 原则

不直接删除功能。

先关闭入口，再确认无依赖，最后删除代码。

## 第一阶段：禁用

目标模块：

```
src/main/agents
src/main/goal
src/main/swarm
```

处理：

- 保留代码
- 增加 feature flag
- 默认关闭 Agent 调度

## 第二阶段：MCP 收敛

减少暴露工具：

保留：

- read_file
- search_code
- apply_patch
- exec
- workspace_info

逐步移除：

- agents.spawn
- agents.message
- agents.finish
- goal continuation

## 第三阶段：代码清理

确认无调用后删除：

- Worker 生命周期
- Multi Agent 状态机
- Goal Loop 驱动
- 第二模型调用链

## 不删除

保留：

- Session
- Durable Store
- Workspace
- Permission
- Codex Tools
- Bridge

这些属于本地执行桥核心能力。
