import { describe, expect, it } from 'vitest';
import {
  createCodexCodingTask,
  normalizeCodexCodingTask,
  renderCodexCodingTask
} from '../src/main/codex/coding-task.js';
import {
  CODING_WORKER_FINISH_DESCRIPTION,
  renderCodingWorkerBootstrap
} from '../src/main/codex/coding-agent.js';

describe('Codex coding-agent contract', () => {
  it('renders structured coding intent as the legacy worker brief', () => {
    const task = createCodexCodingTask('Update the parser', 'Use the repository conventions.');

    expect(renderCodexCodingTask(task)).toBe(
      'Shared context for every worker in this run:\nUse the repository conventions.\n\nYour task:\nUpdate the parser'
    );
    expect(renderCodingWorkerBootstrap('worker-1', task)).toContain('you are worker-1, a worker');
    expect(renderCodingWorkerBootstrap('worker-1', task)).toContain('Update the parser');
  });

  it('keeps direct legacy task strings compatible', () => {
    const task = normalizeCodexCodingTask('Inspect the bridge');

    expect(task).toEqual({ kind: 'coding', objective: 'Inspect the bridge', context: null });
    expect(renderCodingWorkerBootstrap('worker-2', 'Inspect the bridge')).toContain('Inspect the bridge');
  });

  it('keeps the handoff contract visible at the Codex boundary', () => {
    expect(CODING_WORKER_FINISH_DESCRIPTION).toContain('VALIDATION');
  });
});
