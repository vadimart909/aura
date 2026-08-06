import { Handle, Position } from '@xyflow/react';

/**
 * FlowConditionNode — нода «Условие» для React Flow.
 * data: { title, conditionLabel }
 */
export default function FlowConditionNode({ data }) {
  return (
    <div className="flow-node flow-node--condition">
      <div className="flow-node__card flow-node__card--condition">
        {/* Header */}
        <div className="flow-node__header flow-node__header--blue">
          <span className="flow-node__header-title">{data.title || 'Условие'}</span>
        </div>

        {/* Content */}
        <div className="flow-node__body">
          <div className="flow-node__row">
            <span className="flow-node__row-icon flow-node__row-icon--blue">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M8.125 3.125L4.375 6.875L1.875 4.375" stroke="#191919" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="flow-node__row-text">{data.conditionLabel || 'Условие'}</span>
          </div>
        </div>
      </div>

      {/* Left target handle */}
      <Handle type="target" position={Position.Left} id="left" className="flow-handle" />

      {/* Right source handles — yes (green) / no (red) */}
      <Handle type="source" position={Position.Right} id="right-yes" className="flow-handle flow-handle--yes" style={{ top: '40%' }} />
      <Handle type="source" position={Position.Right} id="right-no" className="flow-handle flow-handle--no" style={{ top: '70%' }} />
    </div>
  );
}
