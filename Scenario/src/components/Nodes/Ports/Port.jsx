import { Handle, Position, useNodeId, useNodeConnections } from '@xyflow/react';
import './Port.css';

/**
 * Port — единичный порт-хендл (эллипс 10×10), реальный @xyflow/react Handle.
 *
 * @param {object}  props
 * @param {'left'|'right'} [props.side='right']       — сторона размещения (left=target, right=source)
 * @param {string}  props.id                            — уникальный в рамках ноды id хендла
 * @param {'default'|'active'} [props.state]            — явный override визуального состояния (для dev-превью)
 * @param {'default'|'green'|'red'} [props.color]        — цветовой вариант
 * @param {string}  [props.ariaLabel='Порт']
 * @param {string}  [props.className]
 * @param {boolean} [props.isConnectable=true]
 */
export default function Port({
  side = 'right',
  id,
  state,
  color,
  ariaLabel = 'Порт',
  className = '',
  isConnectable = true,
}) {
  const type = side === 'left' ? 'target' : 'source';
  const position = side === 'left' ? Position.Left : Position.Right;

  // useNodeConnections throws if it can't resolve a node id from context —
  // which happens when Port is rendered standalone (e.g. the /nodes dev
  // preview gallery), outside an actual registered ReactFlow node. Fall
  // back to a placeholder id in that case and ignore the (meaningless)
  // lookup result rather than crash.
  const contextNodeId = useNodeId();
  const connections = useNodeConnections({
    id: contextNodeId ?? '__standalone_port__',
    handleType: type,
    handleId: id,
  });
  const isOccupied = Boolean(contextNodeId) && connections.length > 0;
  const resolvedState = state ?? (isOccupied ? 'active' : 'default');

  // A port carries exactly one cable: once it has an edge it stops being
  // connectable, so a second one can neither be dragged out of it nor dropped
  // onto it. Applies to inputs too — branches can't converge on one port.
  // isConnectable alone would NOT block this: xyflow gates starting/ending a
  // connection on isConnectableStart/isConnectableEnd and only uses
  // isConnectable to drop the .connectionindicator class (which is what its
  // base stylesheet hangs pointer-events on) — so all three have to be set.
  const canConnect = isConnectable && !isOccupied;

  const stateClass = resolvedState === 'active' ? 'port--active' : 'port--default';
  const colorClass = color && color !== 'default' ? `port--${color}` : '';
  const classes = `port ${stateClass} ${colorClass} ${className}`.trim();

  // Standalone render (the /nodes preview gallery) — a Handle outside a
  // registered node has nothing to attach to and warns once per instance, 32×
  // on that page. There is no connecting to do there either, so draw the
  // ellipse as a plain element; Port.css styles both shapes.
  if (!contextNodeId) {
    return <div className={classes} aria-label={ariaLabel} />;
  }

  return (
    <Handle
      type={type}
      position={position}
      id={id}
      isConnectable={canConnect}
      /* Cables only ever run output → input: a drag can start on a right
         (source) port and can only end on a left (target) one. Dragging
         backwards out of an input never begins, so there is no way to wire a
         left port into another block's right port. */
      isConnectableStart={canConnect && type === 'source'}
      isConnectableEnd={canConnect && type === 'target'}
      className={classes}
      aria-label={ariaLabel}
    />
  );
}
