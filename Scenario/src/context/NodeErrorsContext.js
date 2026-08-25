import { createContext, useContext } from 'react';

/* ==========================================================================
   Per-node validation errors for the canvas.

   Read at render time by the FlowNodes wrappers instead of being written into
   `node.data`: the set is derived on the canvas page, and the four sync effects
   there already rewrite `data` via setNodes — feeding this through them would
   loop.

   The page hands over the finished set of ids that must render the red row, not
   the raw ingredients. Deciding *who* is in it belongs next to the state it
   depends on (which blocks the last publish attempt flagged, and which of them
   are still empty) — see CreateScenarioCanvas.
   ========================================================================== */

export const EMPTY_SET = new Set();

/** Default keeps the FlowNodes wrappers usable outside the canvas page. */
const DEFAULT_VALUE = { fieldErrorNodeIds: EMPTY_SET };

export const NodeErrorsContext = createContext(DEFAULT_VALUE);

/** True when this node must render the red «Заполни поля» row. */
export function useNodeFieldError(nodeId) {
  return useContext(NodeErrorsContext).fieldErrorNodeIds.has(nodeId);
}
