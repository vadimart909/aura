import { Handle, Position } from '@xyflow/react';

/**
 * FlowEndNode — нода «Конец» для React Flow.
 * data: { label }
 */
export default function FlowEndNode({ data }) {
  return (
    <div className="flow-node flow-node--end">
      <div className="flow-node__end-circle">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="3" y="3" width="10" height="10" rx="2" style={{ fill: 'var(--primitive-primary)' }} />
        </svg>
      </div>
      {data.label && <span className="flow-node__end-label">{data.label}</span>}

      {/* Left target handle */}
      <Handle type="target" position={Position.Left} id="left" className="flow-handle" />
    </div>
  );
}
