# 重构迁移计划

## Phase 0 - Investigation

已完成：

- 当前架构分析
- Codex Runtime 分析
- 模块边界确认

输出：

- final-architecture.md
- removal-plan.md
- migration-plan.md

## Phase 1 - 收敛入口

目标：不改变执行能力，只减少 Agent 自动化。

任务：

- 增加 Agent 功能开关
- 默认关闭 Worker/Goal
- 保留现有执行工具

验证：

ChatGPT -> MCP -> Tool -> Workspace

链路正常。

## Phase 2 - MCP Tool 收敛

统一工具模型：

Workspace

- workspace_info
- list_directory
- read_file
- search_code

Modification

- apply_patch
- write_file

Process

- exec
- exec_start
- exec_read
- exec_kill

## Phase 3 - 清理

删除无调用 Agent 代码：

- worker orchestration
- goal driver
- swarm manager

## 验收标准

支持：

1. 读取 Java 项目
2. 搜索代码调用链
3. 修改文件
4. 执行测试
5. 输出 diff

最终成为稳定的 ChatGPT 本地代码工作桥。
