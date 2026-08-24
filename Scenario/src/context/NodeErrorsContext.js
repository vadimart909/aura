import { createContext, useContext } from 'react';

/* ==========================================================================
   Per-node validation errors for the canvas.

   Read at render time by the FlowNodes wrappers instead of being written into
   `node.data`: the invalid set is derived from `nodes`, and the four effects
   on the canvas page already rewrite `data` via setNodes — feeding this
   through them would both loop and clobber their own `showError` writes.
   ========================================================================== */

const EMPTY_SET = new Set();

/** Default keeps the FlowNodes wrappers usable outside the canvas page. */
const DEFAULT_VALUE = { showFieldErrors: false, unfilledNodeIds: EMPTY_SET };

export const NodeErrorsContext = createContext(DEFAULT_VALUE);

/** True when this node must render the red «Заполни поля» row. */
export function useNodeFieldError(nodeId) {
  const { showFieldErrors, unfilledNodeIds } = useContext(NodeErrorsContext);
  return showFieldErrors && unfilledNodeIds.has(nodeId);
}
