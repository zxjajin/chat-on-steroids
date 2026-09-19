import {
  renderCodexCodingTask,
  type CodexCodingTaskInput
} from './codex/coding-task.js';

/** User/model-facing handoff contract owned by COS Automation, not the Codex execution layer. */
export const WORKER_FINISH_DESCRIPTION = 'factual handoff under RESULT / CHANGES / VALIDATION / BLOCKERS.';

export const WORKER_FINISH_REQUIRED =
  'agents action=finish requires result: the report the prime reads in your place — what you changed, what you verified and what is left. Send it as result and call finish again.';

/** Builds the first message for a ChatGPT worker opened by COS Automation. */
export function renderWorkerBootstrap(workerId: string, task: CodexCodingTaskInput): string {
  const brief = typeof task === 'string' ? task : renderCodexCodingTask(task);
  return (
    `${brief}\n\n` +
    `(Chat On Steroids: you are ${workerId}, a worker. Report to prime through the agents tool — ` +
    'action=message to="prime" as you go, action=finish once at the end. Workers cannot reach each other. ' +
    'ultrathink)'
  );
}

/** Protocol suffix for a later assignment delivered to an existing worker chat. */
export function renderWorkerRevival(workerId: string, body: string): string {
  return (
    `${body}\n\n(Chat On Steroids: you are still ${workerId} in the same run, and this is the prime agent talking to ` +
    'you again in the chat you already know. Pick up from what you did here before rather than starting over. ' +
    'Report with agents action=message to="prime" as you go and action=finish when this piece is done.)'
  );
}
