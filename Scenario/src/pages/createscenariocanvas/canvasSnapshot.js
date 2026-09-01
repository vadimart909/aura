/* ==========================================================================
   Canvas persistence — turning the live React Flow graph into something that
   can sit on a scenario object, and back again.

   The snapshot carries *both* the computed `node.data` and the raw drawer
   configs on purpose:

   • ScenarioView needs the ready-made labels — it has no drawers and no sync
     effects to rebuild them from.
   • CreateScenarioCanvas needs the configs — its four sync effects recompute
     `node.data` from them on mount, so restoring data alone would be wiped
     out on the first pass.
   ========================================================================== */

/**
 * Live graph → JSON-safe snapshot.
 *
 * Drops the React-owned callbacks (`onClick`/`onDelete`) and pins every
 * transient bit of UI state to its neutral value, so a snapshot always reads
 * back in the read-only posture the viewer expects: no active highlight, no
 * hover actions, no red "заполни поля" rows.
 */
export function serializeCanvas({ nodes, edges, config }) {
  return {
    nodes: nodes.map(({ id, type, position, data }) => {
      const { onClick: _onClick, onDelete: _onDelete, ...rest } = data ?? {};
      return {
        id,
        type,
        position: { ...position },
        data: { ...rest, state: 'default', showActions: false, showError: false },
      };
    }),
    edges: edges.map(({ id, source, target, sourceHandle, targetHandle }) => ({
      id,
      source,
      target,
      sourceHandle,
      targetHandle,
    })),
    config,
  };
}

/**
 * Snapshot → editor nodes. Restores the drag/delete flags the snapshot throws
 * away, and drops `showActions` so the sync effects — not the frozen snapshot —
 * decide when the delete cross shows up. `state` on the Start node is pre-set
 * to match whether DrawerStart will be open on mount (see the caller's
 * showDrawerStart initializer), so the card doesn't flash the wrong highlight
 * for a frame before the sync effect catches up.
 */
export function hydrateEditorNodes(snapshotNodes, startNodeId, startActive) {
  return snapshotNodes.map(({ id, type, position, data }) => {
    const { showActions: _showActions, state: _state, ...rest } = data ?? {};
    return {
      id,
      type,
      position: { ...position },
      draggable: true,
      // Every publish check assumes an entry point exists.
      deletable: id !== startNodeId,
      data: { ...rest, state: id === startNodeId && startActive ? 'active' : 'default' },
    };
  });
}

/**
 * Highest N among the `dndnode_N` ids in a snapshot. The id counter is a
 * module-level `let` that resets to 0 on a page reload — without this the
 * next dropped block would collide with a restored one.
 */
export function maxDndIndex(snapshotNodes) {
  return snapshotNodes.reduce((max, node) => {
    const match = /^dndnode_(\d+)$/.exec(node.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, -1);
}

/* ==========================================================================
   Shared canvas defaults — kept here (not in the page) so the editor's seed
   and the "nothing has been drawn yet" fingerprint can never drift apart.
   ========================================================================== */

export const START_NODE_ID = 'start_node';

/** The seven drawer configs of an untouched canvas. */
export const EMPTY_CANVAS_CONFIG = {
  startConditionType: 'trigger',
  startTrigger: null,
  startSegment: null,
  startSchedule: null,
  communicationTemplates: {},
  waitingConfigs: {},
  conditionConfigs: {},
};

/** The entry point every fresh canvas starts with. */
export const createStartNode = () => ({
  id: START_NODE_ID,
  type: 'start',
  position: { x: 80, y: 193 },
  draggable: true,
  // Every publish check assumes an entry point exists; without this,
  // Backspace on the selected Start node removes it.
  deletable: false,
  // DrawerStart opens with the editor, so the card is highlighted from frame one.
  data: { showError: false, state: 'active' },
});

/* ==========================================================================
   Dirty detection
   ========================================================================== */

/**
 * Stable ordering for deep comparison: sorted object keys, arrays left alone.
 *
 * The array branch has to come FIRST — `Object.keys` of an array is
 * ['0','1',…,'10'], and sorting that lexicographically would reorder anything
 * past the tenth element. `conditionConfigs[nodeId]` is an ordered list that
 * drives the card's labels, so a >10-condition block would read dirty forever.
 */
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = canonical(value[key]);
        return acc;
      }, {});
  }
  return value;
}

/**
 * Comparable digest of a canvas: the graph shape plus the drawer configs, and
 * deliberately NOT `node.data`.
 *
 * `data` is derived — the four sync effects rebuild it from the configs on
 * every mount — and the derivation is not byte-stable: the mock seed omits the
 * schedule keys the effect writes back as empty strings. Comparing it would
 * report an untouched scenario as dirty. Everything a user can actually change
 * lives in the configs, which are compared in full.
 *
 * Nodes and edges are sorted so React Flow reordering a selected node reads
 * clean, and positions are rounded so sub-pixel drag drift doesn't count.
 */
export function canvasFingerprint(canvas) {
  if (!canvas) return '';
  const nodes = (canvas.nodes ?? [])
    .map((n) => [n.id, n.type, Math.round(n.position?.x ?? 0), Math.round(n.position?.y ?? 0)])
    .sort();
  const edges = (canvas.edges ?? [])
    .map((e) => [e.source, e.sourceHandle ?? '', e.target, e.targetHandle ?? ''])
    .sort();
  return JSON.stringify({ nodes, edges, config: canonical(canvas.config ?? {}) });
}

/**
 * Fingerprint of a canvas nobody has drawn on yet.
 *
 * Needed because `canvasFingerprint(undefined)` is `''`, which a live graph
 * never collapses to — so a baseline with no `canvas` key would read dirty from
 * frame one. A scenario minted on entering the flow genuinely has no `canvas`
 * key until step 1 saves one.
 */
export const PRISTINE_CANVAS_FINGERPRINT = canvasFingerprint({
  nodes: [createStartNode()],
  edges: [],
  config: EMPTY_CANVAS_CONFIG,
});

/** Fingerprint of a baseline's canvas, treating "no canvas yet" as pristine. */
export function baselineCanvasFingerprint(baseline) {
  return baseline?.canvas ? canvasFingerprint(baseline.canvas) : PRISTINE_CANVAS_FINGERPRINT;
}

/**
 * A canvas with one unfilled, view-ready Start block — for scenarios that
 * were saved as a draft without ever reaching the canvas, so they have no
 * `canvas` key at all. Deliberately NOT `createStartNode()`: that shape
 * is editor-oriented (`state: 'active'`, no `show*` flags) and relies on the
 * editor's sync effects to fill in the rest on mount. The view page has no
 * such effect, so it needs every flag set explicitly up front.
 */
export function startCanvas({ trigger = '', segment = '' } = {}) {
  return {
    nodes: [
      {
        id: START_NODE_ID,
        type: 'start',
        position: { x: 80, y: 193 },
        data: {
          showTrigger: true,
          showSchedule: false,
          showScheduleDays: false,
          showSegment: true,
          showError: false,
          showActions: false,
          state: 'default',
          triggerLabel: trigger,
          segmentLabel: segment,
        },
      },
    ],
    edges: [],
    config: {
      startConditionType: 'trigger',
      startTrigger: trigger ? { title: trigger } : null,
      startSegment: segment ? { title: segment } : null,
      startSchedule: null,
      communicationTemplates: {},
      waitingConfigs: {},
      conditionConfigs: {},
    },
  };
}
