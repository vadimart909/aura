import { Handle, Position } from '@xyflow/react';

/**
 * FlowCommunicationNode — нода «Коммуникация» для React Flow.
 * data: { title, templateLabel }
 */
export default function FlowCommunicationNode({ data }) {
  return (
    <div className="flow-node flow-node--communication">
      <div className="flow-node__card flow-node__card--communication">
        {/* Header */}
        <div className="flow-node__header flow-node__header--purple">
          <span className="flow-node__header-title">{data.title || 'Коммуникация'}</span>
        </div>

        {/* Content */}
        <div className="flow-node__body">
          <div className="flow-node__row">
            <span className="flow-node__row-icon flow-node__row-icon--purple">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M3.125 1.875H6.875C7.1875 1.875 7.5 2.1875 7.5 2.5V7.5C7.5 7.8125 7.1875 8.125 6.875 8.125H3.125C2.8125 8.125 2.5 7.8125 2.5 7.5V2.5C2.5 2.1875 2.8125 1.875 3.125 1.875Z" stroke="#191919" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.375 4.375H5.625" stroke="#191919" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M4.375 5.625H5.625" stroke="#191919" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="flow-node__row-text">{data.templateLabel || 'Шаблон'}</span>
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
