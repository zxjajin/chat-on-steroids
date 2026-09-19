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

## Phase 1 - Capability Isolation

目标：不改变执行能力，只隔离 MultiAgent 的 renderer 入口。

任务：

- `multiAgent.enabled` 成为 Agent Plan、Worker/Swarm UI 和 Agent Panel 的统一可见性开关
- 保留 SwarmState、Session History、Timeline、Goal/Loop、Automation 和现有执行工具
- 不以 renderer 开关停止 Agent runtime 或删除 Agent 数据

验证：

ChatGPT -> MCP -> Tool -> Workspace

链路正常。

## Phase 2 - Codex Runtime Integration

通过 `CodexTaskContract` 将 MCP Core 的文件、搜索、Patch、图片和 Terminal 调用交给
`src/main/codex/runtime-adapter.ts`；权限、caller proof、进程所有权和 Session recording
仍由 Chat On Steroids 负责。

Project Files IPC 预览暂不接入空身份 contract，等待独立的 IPC caller/workspace proof。

## Phase 3 - Agent Runtime Decoupling

拆分 COS Automation Agent 的 MCP 注册/生命周期模块与 Coding Core；Coding Task、plan、
文件/终端执行和 worker 协议 contract 已位于 Codex boundary。保留 Goal/Loop、Agent
durable history 和 ChatGPT worker execution；本项目不引入完整 Codex Agent Runtime。

## Phase 4 - Duplicate Runtime Removal

仅删除同时满足“无调用、有替代、有验证、有迁移文档”的重复 Coding executor/tool/workflow。
不删除 Automation、Session、Timeline、MCP Bridge 或用户数据。

## Phase 5 - Cleanup

统一文档和模块命名，删除已经证实无调用的旧引用。

<!-- 旧的工具分组记录，仅作为历史对照，不是当前删除清单。

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
-->

## 验收标准

支持：

1. 读取 Java 项目
2. 搜索代码调用链
3. 修改文件
4. 执行测试
5. 输出 diff

最终成为稳定的 ChatGPT 本地代码工作桥。
