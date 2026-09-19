/**
 * Structured coding intent crossing from COS Automation into the Codex execution/runtime side.
 *
 * The durable Agent snapshot still stores the rendered brief for compatibility. This contract
 * exists at the hand-off boundary so the Automation broker does not own the shape of a coding
 * task. Codex remains independent of Agent lifecycle, browser bootstrap and session storage.
 */
export interface CodexCodingTask {
  kind: 'coding';
  objective: string;
  context: string | null;
}

export type CodexCodingTaskInput = string | CodexCodingTask;

export function createCodexCodingTask(objective: string, context: string | null = null): CodexCodingTask {
  return {
    kind: 'coding',
    objective: objective.trim(),
    context: context?.trim() || null
  };
}

/** Keeps direct/internal legacy callers source-compatible while accepting the new contract. */
export function normalizeCodexCodingTask(
  input: CodexCodingTaskInput,
  legacyContext: string | null = null
): CodexCodingTask {
  return typeof input === 'string'
    ? createCodexCodingTask(input, legacyContext)
    : createCodexCodingTask(input.objective, input.context);
}

/** The compatibility representation handed to an existing worker ChatGPT conversation. */
export function renderCodexCodingTask(task: CodexCodingTask): string {
  if (!task.context) return task.objective;
  return `Shared context for every worker in this run:
${task.context}

Your task:
${task.objective}`;
}
