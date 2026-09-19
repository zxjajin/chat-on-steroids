import {
  renderCodexCodingTask,
  type CodexCodingTaskInput
} from './coding-task.js';

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
