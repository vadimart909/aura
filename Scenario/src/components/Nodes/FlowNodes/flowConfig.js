/* ==========================================================================
   Shared React Flow wiring for the scenario canvas.

   The editor (CreateScenarioCanvas) and the read-only viewer (ScenarioView)
   must render the very same graph, so the node registry and the edge styling
   live here instead of being duplicated per page.
   ========================================================================== */

import FlowStartNode from './FlowStartNode';
import FlowCommunicationNode from './FlowCommunicationNode';
import FlowWaitingNode from './FlowWaitingNode';
import FlowConditionNode from './FlowConditionNode';
import FlowEdge from './FlowEdge';

/** Node type registry — a stable module-level object, never re-created. */
export const nodeTypes = {
  start: FlowStartNode,
  communication: FlowCommunicationNode,
  waiting: FlowWaitingNode,
  condition: FlowConditionNode,
};

/* No edge in this app sets an explicit `type`, so 'default' is what every
   one of them resolves to — registering it here is enough to cover all of
   them without touching where edges get created or loaded. Only the editor
   needs this (selection/deletion are meaningless on the read-only viewer,
   which never imports it), but it's centralized here with the rest of the
   shared React Flow wiring. */
export const edgeTypes = {
  default: FlowEdge,
};

/* Dashed cable, matching the Figma connection spec. */
export const defaultEdgeOptions = {
  style: { stroke: 'var(--primitive-neutral-4)', strokeWidth: 2, strokeDasharray: '5 5' },
};

export const connectionLineStyle = { stroke: 'var(--primitive-neutral-4)', strokeWidth: 2, strokeDasharray: '5 5' };

/**
 * Кабели «текут», пока сценарий live — как анимированные рёбра на reactflow.dev.
 *
 * `animated` — штатный флаг React Flow: EdgeWrapper вешает по нему класс
 * `animated` на <g> ребра, а бегущий пунктир даёт правило в global.css.
 * Считается на рендере и НЕ пишется в снапшот — serializeCanvas всё равно
 * оставляет от ребра только id/source/target/handles.
 *
 * Сверяемся по ключу `status`, а не по `statusLabel`: лейбл — свободный текст,
 * который проставляется руками в каждом месте смены статуса и может разъехаться.
 */
export function runningEdges(edges, status) {
  return status === 'started' ? edges.map((edge) => ({ ...edge, animated: true })) : edges;
}
