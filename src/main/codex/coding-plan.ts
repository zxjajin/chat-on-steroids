import { agentPlanUpdateSchema, type AgentPlanUpdate } from '../../shared/agent-plan.js';

/** The model-facing coding-plan contract; COS stores its projection under the proven session. */
export const codexCodingPlanUpdateSchema = agentPlanUpdateSchema;
export type CodexCodingPlanUpdate = AgentPlanUpdate;

export const CODING_PLAN_DESCRIPTION =
  'Updates your coding task plan in the user’s app. Use for work with several meaningful steps; skip simple tasks. Send the complete plan with short step headlines, useful details and current statuses. Keep at most one step in_progress. Update after completing a step or changing approach. This only displays a plan; it does not execute steps or advance queued stages.';
