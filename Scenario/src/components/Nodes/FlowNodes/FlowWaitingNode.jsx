import { Handle, Position } from '@xyflow/react';

/**
 * FlowWaitingNode — нода «Ожидание» для React Flow.
 * data: { title, waitLabel }
 */
export default function FlowWaitingNode({ data }) {
  return (
    <div className="flow-node flow-node--waiting">
      <div className="flow-node__card flow-node__card--waiting">
        {/* Header */}
        <div className="flow-node__header flow-node__header--orange">
          <span className="flow-node__header-title">{data.title || 'Ожидание'}</span>
        </div>

        {/* Content */}
        <div className="flow-node__body">
          <div className="flow-node__row">
            <span className="flow-node__row-icon flow-node__row-icon--orange">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 2.5V5L6.25 6.25" stroke="#191919" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="5" cy="5" r="3.75" stroke="#191919" strokeWidth="1.2"/>
              </svg>
            </span>
            <span className="flow-node__row-text">{data.waitLabel || 'Время ожидания'}</span>
          </div>
        </div>
      </div>

      {/* Left target handle */}
      <Handle type="target" position={Position.Left} id="left" className="flow-handle" />

      {/* Right source handle */}
      <Handle type="source" position={Position.Right} id="right" className="flow-handle" />
    </div>
  );
}
