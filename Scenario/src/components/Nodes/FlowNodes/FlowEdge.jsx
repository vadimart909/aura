import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from '@xyflow/react';
import CableDeleteIcon from '../../icons/CableDeleteIcon';
import './FlowEdge.css';

/**
 * Default edge renderer for the canvas — the same bezier curve React Flow
 * draws out of the box, but widens to 3px and grows a delete button at its
 * midpoint once selected, per the Figma cable spec. Needs its own component
 * rather than CSS because `defaultEdgeOptions.style` lands as an inline
 * style attribute, which no stylesheet rule can override, and a clickable
 * button can't be a child of an SVG `<path>` in the first place.
 */
export default function FlowEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  style,
  markerEnd,
  selected,
}) {
  const { deleteElements } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, strokeWidth: selected ? 3 : style?.strokeWidth }}
      />
      {selected && (
        <EdgeLabelRenderer>
          <button
            type="button"
            className="flow-edge__delete-btn"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            onClick={(event) => {
              event.stopPropagation();
              deleteElements({ edges: [{ id }] });
            }}
            aria-label="Удалить связь"
          >
            <CableDeleteIcon />
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
