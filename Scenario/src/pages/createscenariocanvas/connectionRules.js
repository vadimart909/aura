/* ==========================================================================
   Connection rules for the scenario canvas — the checks that run *while a
   cable is being dragged*, as opposed to the pre-publish checks that live in
   publishValidation.js.

   Pure functions only: isValidConnection is called on every hover over a
   candidate port during a drag, so nothing here may touch state.
   ========================================================================== */

/**
 * True when wiring `source → target` would close a loop.
 *
 * A new edge closes a loop exactly when `target` can *already* reach `source`
 * along existing edges, so this is a plain forward reachability walk from
 * `target`. Cables only ever run output → input (see Port.jsx), so the graph
 * is always directed and `edge.source → edge.target` is the real direction.
 *
 * Handles are ignored on purpose: a Condition's two output ports both lead out
 * of the same block, so only node ids matter for reachability.
 *
 * The `seen` set is not just an optimization — it also keeps the walk from
 * hanging if a loop somehow already exists in the graph (an old scenario saved
 * before this rule landed).
 *
 * `source === target` falls out for free (the walk starts on `target` and hits
 * `source` immediately), but the caller still rejects self-connections up
 * front for its own reason — see the comment on isValidConnection.
 */
export function wouldCreateCycle(edges, source, target) {
  const outgoing = new Map();
  for (const edge of edges) {
    const targets = outgoing.get(edge.source);
    if (targets) targets.push(edge.target);
    else outgoing.set(edge.source, [edge.target]);
  }

  const seen = new Set();
  const stack = [target];
  while (stack.length > 0) {
    const id = stack.pop();
    if (id === source) return true;
    if (seen.has(id)) continue;
    seen.add(id);
    for (const next of outgoing.get(id) ?? []) stack.push(next);
  }

  return false;
}
