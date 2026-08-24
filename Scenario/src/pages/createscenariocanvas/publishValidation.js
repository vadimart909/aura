/* ==========================================================================
   Pre-publish validation for the scenario canvas.

   Pure functions only — the canvas page derives the invalid-node set from
   these on every render and reuses the very same value both for the alert
   text and for the red rows on the cards, so the two can never disagree.
   ========================================================================== */

export const PUBLISH_ALERTS = {
  fields: 'Заполни обязательные поля в блоках',
  connect: 'Соедини блоки',
  communication: 'Добавь и заполни блок «Коммуникация»',
};

/* --------------------------------------------------------------------------
   Russian pluralization helper
   -------------------------------------------------------------------------- */
function pluralize(n, one, few, many) {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} ${few}`;
  return `${n} ${many}`;
}

/**
 * Waiting-node label. Doubles as the node's fill predicate: an empty string
 * means the unit or the amount is missing/invalid. `amount` arrives from the
 * drawer as a string, so '' / '0' / NaN all have to fall through to ''.
 */
export function formatWaitingLabel(unit, amount) {
  const num = Number(amount);
  if (!unit || !amount || Number.isNaN(num) || num <= 0) return '';
  if (unit === 'days') return pluralize(num, 'день', 'дня', 'дней');
  if (unit === 'hours') return pluralize(num, 'час', 'часа', 'часов');
  return '';
}

/* --------------------------------------------------------------------------
   Per-type fill predicates
   -------------------------------------------------------------------------- */

/**
 * The whole *active tab* of DrawerStart must be filled in. The Сегмент
 * section renders on both tabs, so it is required either way — only the
 * tab-specific half switches on the condition type.
 */
function isStartFilled({ startConditionType, startTrigger, startSegment, startSchedule }) {
  if (!startSegment) return false;

  if (startConditionType === 'schedule') {
    if (!startSchedule?.time) return false;
    if (startSchedule.frequency === 'specificDays') {
      // DrawerStart writes `repeat: selectedRepeat?.key || null`, so null is real
      if (!startSchedule.days?.length) return false;
      if (!startSchedule.repeat) return false;
    }
    return true;
  }

  return Boolean(startTrigger);
}

const isCommunicationFilled = (saved) =>
  Boolean(saved?.template) && (saved.channels?.length ?? 0) > 0;

const isWaitingFilled = (saved) => formatWaitingLabel(saved?.unit, saved?.amount) !== '';

const isConditionFilled = (saved) => (saved?.length ?? 0) > 0;

/**
 * Ids of every node whose required fields are not filled in.
 * Iterates `nodes` (not the config maps) so orphaned config left behind by a
 * deleted node is never read.
 */
export function getUnfilledNodeIds(nodes, config) {
  const ids = [];

  for (const node of nodes) {
    let filled;
    switch (node.type) {
      case 'start':
        filled = isStartFilled(config);
        break;
      case 'communication':
        filled = isCommunicationFilled(config.communicationTemplates[node.id]);
        break;
      case 'waiting':
        filled = isWaitingFilled(config.waitingConfigs[node.id]);
        break;
      case 'condition':
        filled = isConditionFilled(config.conditionConfigs[node.id]);
        break;
      default:
        filled = true;
    }
    if (!filled) ids.push(node.id);
  }

  return ids;
}

/**
 * A block is "disconnected" when it has neither an incoming nor an outgoing
 * edge. Terminal blocks are fine, and a Condition only needs one of its two
 * source handles wired — both fall out of "appears in any edge" for free.
 *
 * Skipped below two nodes: with a lone Start there is nothing to connect to,
 * and the design for that case shows the communication alert instead.
 */
export function hasDisconnectedNodes(nodes, edges) {
  if (nodes.length < 2) return false;

  const connected = new Set();
  for (const edge of edges) {
    if (edge.source === edge.target) continue; // a self-loop is not a connection
    connected.add(edge.source);
    connected.add(edge.target);
  }

  return nodes.some((node) => !connected.has(node.id));
}

/**
 * The three checks in order. Returns the alert text of the first failure, or
 * null when the scenario may be published.
 *
 * `unfilledNodeIds` is injected rather than recomputed so that the alert and
 * the red rows on the cards are always derived from one single value.
 */
export function getPublishBlocker({ nodes, edges, unfilledNodeIds }) {
  if (unfilledNodeIds.length > 0) return PUBLISH_ALERTS.fields;
  if (hasDisconnectedNodes(nodes, edges)) return PUBLISH_ALERTS.connect;
  if (!nodes.some((node) => node.type === 'communication')) return PUBLISH_ALERTS.communication;
  return null;
}
