import type { ApplyPatchExecution } from './apply-patch/index.js';
import { executeApplyPatch } from './apply-patch/index.js';
import { unifiedExecManager } from './manager.js';
import { readTextFile } from './read-backend.js';
import { search, searchOneFile } from '../search.js';
import type { ExecCommandRequest, ExecCommandToolOutput } from './unified-exec.js';

/**
 * The hand-off from Chat On Steroids to the Codex execution layer.
 *
 * COS owns the caller, permission and workspace proof. Codex owns the bounded file/process
 * operation after that proof has been assembled. Keeping this object explicit prevents a
 * future execution method from reaching back into MCP or agent orchestration for identity.
 */
export interface CodexTaskContract {
  kind: 'coding';
  requestId: string | null;
  sessionId: string | null;
  conversationId: string | null;
  workspace: { real: string; virtual: string } | null;
}

export class CodexRuntimeError extends Error {
  constructor(readonly operation: string, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'CodexRuntimeError';
  }
}

export interface CodexRuntimePorts {
  readTextFile: typeof readTextFile;
  search: typeof search;
  searchOneFile: typeof searchOneFile;
  applyPatch(input: Parameters<typeof executeApplyPatch>[0]): Promise<ApplyPatchExecution>;
  execCommand(input: ExecCommandRequest): Promise<ExecCommandToolOutput>;
}

export interface CodexRuntimeAdapter {
  readTextFile(task: CodexTaskContract, ...input: Parameters<typeof readTextFile>): ReturnType<typeof readTextFile>;
  search(task: CodexTaskContract, ...input: Parameters<typeof search>): ReturnType<typeof search>;
  searchOneFile(task: CodexTaskContract, ...input: Parameters<typeof searchOneFile>): ReturnType<typeof searchOneFile>;
  applyPatch(task: CodexTaskContract, input: Parameters<typeof executeApplyPatch>[0]): Promise<ApplyPatchExecution>;
  execCommand(task: CodexTaskContract, input: ExecCommandRequest): Promise<ExecCommandToolOutput>;
}

/** Normalize only non-Error foreign values; preserve typed runtime errors for existing callers. */
function normalizeFailure(operation: string, error: unknown): Error {
  return error instanceof Error ? error : new CodexRuntimeError(operation, String(error));
}

const defaultPorts: CodexRuntimePorts = {
  readTextFile: (realPath, options) => readTextFile(realPath, options),
  search: (input) => search(input),
  searchOneFile: (realPath, virtualPath, input) => searchOneFile(realPath, virtualPath, input),
  applyPatch: (input) => executeApplyPatch(input),
  execCommand: (input) => unifiedExecManager.execCommand(input)
};

/**
 * Creates the execution boundary. The task is deliberately accepted by every operation even
 * though the current Codex ports do not need to inspect it; this makes ownership explicit at
 * the boundary and leaves the ported runtimes free of COS identity imports.
 */
export function createCodexRuntimeAdapter(ports: CodexRuntimePorts = defaultPorts): CodexRuntimeAdapter {
  return {
    async readTextFile(task, ...input) {
      void task;
      try {
        return await ports.readTextFile(...input);
      } catch (error) {
        throw normalizeFailure('read_file', error);
      }
    },
    async search(task, ...input) {
      void task;
      try {
        return await ports.search(...input);
      } catch (error) {
        throw normalizeFailure('search', error);
      }
    },
    async searchOneFile(task, ...input) {
      void task;
      try {
        return await ports.searchOneFile(...input);
      } catch (error) {
        throw normalizeFailure('search', error);
      }
    },
    async applyPatch(_task, input) {
      try {
        return await ports.applyPatch(input);
      } catch (error) {
        throw normalizeFailure('apply_patch', error);
      }
    },
    async execCommand(_task, input) {
      try {
        return await ports.execCommand(input);
      } catch (error) {
        throw normalizeFailure('exec_command', error);
      }
    }
  };
}

export const codexRuntime = createCodexRuntimeAdapter();
