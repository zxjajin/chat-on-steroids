# Phase 1 Execution Plan: 收敛为 ChatGPT Local Code Bridge

## 目标

本阶段不进行大规模删除，不重写执行层。

目标：验证当前 Chat On Steroids 能否稳定作为：

```
ChatGPT
  |
 MCP
  |
 Chat On Steroids Bridge
  |
 Codex Execution Layer
  |
 Workspace
```

## 原则

保留：

- Electron Desktop
- Bridge
- Tunnel
- Connector
- Workspace
- Permission
- src/main/codex

暂不修改：

- codex execution tools
- filesystem
- apply_patch
- process manager

## Agent 层处理

第一阶段不删除：

- agents
- goal
- swarm

仅增加隔离和关闭能力。

目标：

默认路径不再依赖：

- Goal Loop
- Worker Spawn
- Multi Agent

## Phase 1.1 Agent Feature Gate

新增配置：

```
agentMode=false
```

默认关闭自治 Agent 能力。

要求：

- 不影响普通 MCP 工具调用
- 不影响代码读取
- 不影响文件修改
- 不影响执行命令

## Phase 1.2 MCP Tool Surface 收敛

保留核心工具：

- workspace_info
- list_directory
- read_file
- search_code
- apply_patch
- exec

评估隐藏：

- agent tools
- goal tools
- worker tools

## Phase 1.3 验证链路

测试：

1. 读取 Java 项目
2. 搜索代码
3. 查看调用链
4. apply_patch 修改
5. 执行 Maven 测试
6. 返回结果

## 验收标准

成功标准：

```
ChatGPT
 |
 MCP
 |
 Bridge
 |
 Codex Tools
 |
 Java Workspace
```

链路稳定运行。

失败标准：

- 工具权限绕过
- Runtime异常退出
- Workspace越界
- Agent逻辑影响普通代码任务

## 后续

Phase 1 完成后进入：

Phase 2 Agent Layer Cleanup

包括：

- agents调用关系分析
- goal loop移除
- swarm清理
- 无效依赖删除
