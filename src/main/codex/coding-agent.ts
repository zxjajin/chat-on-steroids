import {
  renderCodexCodingTask,
  type CodexCodingTaskInput
} from './coding-task.js';

/** User/model-facing handoff contract; the Automation broker only persists the result. */
export const CODING_WORKER_FINISH_DESCRIPTION = 'factual handoff under RESULT / CHANGES / VALIDATION / BLOCKERS.';

export const CODING_WORKER_FINISH_REQUIRED =
  'agents action=finish requires result: the report the prime reads in your place — what you changed, what you verified and what is left. Send it as result and call finish again.';

/**
 * Builds the first message for a Coding Agent worker.
 *
 * The browser bridge transports this message but does not own the Coding Agent protocol. The
 * worker id is routing metadata supplied by the Automation broker; the task text is either the
 * compatibility brief from durable state or a structured Codex coding task.
 */
export function renderCodingWorkerBootstrap(workerId: string, task: CodexCodingTaskInput): string {
  const brief = typeof task === 'string' ? task : renderCodexCodingTask(task);
  return (
    `${brief}\n\n` +
    `(Chat On Steroids: you are ${workerId}, a worker. Report to prime through the agents tool — ` +
    'action=message to="prime" as you go, action=finish once at the end. Workers cannot reach each other. ' +
    'ultrathink)'
  );
}
