import type { ApplyPatchExecution } from './apply-patch/index.js';
import { executeApplyPatch } from './apply-patch/index.js';
import { unifiedExecManager } from './manager.js';
import { listDirectoryLevel, readTextFile, statInfo, walkFiles } from './read-backend.js';
import { search, searchOneFile } from '../search.js';
import { viewImage } from './view-image.js';
import type { ExecCommandRequest, ExecCommandToolOutput, WriteStdinRequest } from './unified-exec.js';

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

/** Explicit renderer/project proof for Project Files; it is not a guessed MCP conversation. */
export interface CodexProjectTaskContract {
  kind: 'project-files';
  requestId: null;
  sessionId: null;
  conversationId: null;
  projectId: string;
  workspace: { real: string; virtual: string };
}

export type CodexExecutionTask = CodexTaskContract | CodexProjectTaskContract;

export class CodexRuntimeError extends Error {
  constructor(readonly operation: string, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'CodexRuntimeError';
  }
}

export interface CodexRuntimePorts {
  readTextFile: typeof readTextFile;
  statInfo: typeof statInfo;
  listDirectoryLevel: typeof listDirectoryLevel;
  walkFiles: typeof walkFiles;
  viewImage: typeof viewImage;
  search: typeof search;
  searchOneFile: typeof searchOneFile;
  applyPatch(input: Parameters<typeof executeApplyPatch>[0]): Promise<ApplyPatchExecution>;
  allocateProcessId(): number;
  execCommand(input: ExecCommandRequest): Promise<ExecCommandToolOutput>;
  writeStdin(input: WriteStdinRequest): Promise<ExecCommandToolOutput>;
}

export interface CodexRuntimeAdapter {
  readTextFile(task: CodexExecutionTask, ...input: Parameters<typeof readTextFile>): ReturnType<typeof readTextFile>;
  statInfo(task: CodexExecutionTask, ...input: Parameters<typeof statInfo>): ReturnType<typeof statInfo>;
  listDirectoryLevel(task: CodexExecutionTask, ...input: Parameters<typeof listDirectoryLevel>): ReturnType<typeof listDirectoryLevel>;
  walkFiles(task: CodexExecutionTask, ...input: Parameters<typeof walkFiles>): ReturnType<typeof walkFiles>;
  viewImage(task: CodexExecutionTask, ...input: Parameters<typeof viewImage>): ReturnType<typeof viewImage>;
  search(task: CodexExecutionTask, ...input: Parameters<typeof search>): ReturnType<typeof search>;
  searchOneFile(task: CodexExecutionTask, ...input: Parameters<typeof searchOneFile>): ReturnType<typeof searchOneFile>;
  applyPatch(task: CodexExecutionTask, input: Parameters<typeof executeApplyPatch>[0]): Promise<ApplyPatchExecution>;
  allocateProcessId(task: CodexExecutionTask): number;
  execCommand(task: CodexExecutionTask, input: ExecCommandRequest): Promise<ExecCommandToolOutput>;
  writeStdin(task: CodexExecutionTask, input: WriteStdinRequest): Promise<ExecCommandToolOutput>;
}

/** Normalize only non-Error foreign values; preserve typed runtime errors for existing callers. */
function normalizeFailure(operation: string, error: unknown): Error {
  return error instanceof Error ? error : new CodexRuntimeError(operation, String(error));
}

const defaultPorts: CodexRuntimePorts = {
  readTextFile: (realPath, options) => readTextFile(realPath, options),
  statInfo: (realPath, virtualPath, options) => statInfo(realPath, virtualPath, options),
  listDirectoryLevel: (realDir, virtualDir, maxEntries, includeFileSizes) =>
    listDirectoryLevel(realDir, virtualDir, maxEntries, includeFileSizes),
  walkFiles: (realDir, virtualDir, options) => walkFiles(realDir, virtualDir, options),
  viewImage: (path, detail, options, modelVisiblePath, maxBytes) => viewImage(path, detail, options, modelVisiblePath, maxBytes),
  search: (input) => search(input),
  searchOneFile: (realPath, virtualPath, input) => searchOneFile(realPath, virtualPath, input),
  applyPatch: (input) => executeApplyPatch(input),
  allocateProcessId: () => unifiedExecManager.allocateProcessId(),
  execCommand: (input) => unifiedExecManager.execCommand(input),
  writeStdin: (input) => unifiedExecManager.writeStdin(input)
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
    async statInfo(task, ...input) {
      void task;
      try {
        return await ports.statInfo(...input);
      } catch (error) {
        throw normalizeFailure('stat_info', error);
      }
    },
    async listDirectoryLevel(task, ...input) {
      void task;
      try {
        return await ports.listDirectoryLevel(...input);
      } catch (error) {
        throw normalizeFailure('list_directory', error);
      }
    },
    async walkFiles(task, ...input) {
      void task;
      try {
        return await ports.walkFiles(...input);
      } catch (error) {
        throw normalizeFailure('walk_files', error);
      }
    },
    async viewImage(task, ...input) {
      void task;
      try {
        return await ports.viewImage(...input);
      } catch (error) {
        throw normalizeFailure('view_image', error);
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
    allocateProcessId(_task) {
      return ports.allocateProcessId();
    },
    async execCommand(_task, input) {
      try {
        return await ports.execCommand(input);
      } catch (error) {
        throw normalizeFailure('exec_command', error);
      }
    },
    async writeStdin(_task, input) {
      try {
        return await ports.writeStdin(input);
      } catch (error) {
        throw normalizeFailure('write_stdin', error);
      }
    }
  };
}

export const codexRuntime = createCodexRuntimeAdapter();
