import { Handle, Position } from '@xyflow/react';
import NodeStartCard from '../NodeStartCard';

/**
 * FlowStartNode — обёртка NodeStartCard для React Flow.
 * data: { title, triggerLabel, triggerOverline, segmentLabel, segmentOverline, showError }
 */
export default function FlowStartNode({ data }) {
  return (
    <div className="flow-node flow-node--start">
      {/* Custom card */}
      <div className="flow-node__card flow-node__card--start">
        {/* Header */}
        <div className="flow-node__header flow-node__header--green">
          <span className="flow-node__header-title">{data.title || 'Старт'}</span>
        </div>

        {/* Content */}
        <div className="flow-node__body">
          {data.showTrigger !== false && (
            <div className="flow-node__row">
              <span className="flow-node__row-icon flow-node__row-icon--green">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M7.5 1.25L4.375 5H6.875L2.5 8.75" stroke="#191919" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="flow-node__row-content">
                {data.triggerOverline && (
                  <span className="flow-node__row-overline">{data.triggerOverline}</span>
                )}
                <span className="flow-node__row-text">{data.triggerLabel || 'Добавил клиента'}</span>
              </div>
            </div>
          )}

          {data.showSegment !== false && (
            <div className="flow-node__row">
              <span className="flow-node__row-icon flow-node__row-icon--green">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 5.625C6.03553 5.625 6.875 4.78553 6.875 3.75C6.875 2.71447 6.03553 1.875 5 1.875C3.96447 1.875 3.125 2.71447 3.125 3.75C3.125 4.78553 3.96447 5.625 5 5.625Z" stroke="#191919" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.5 8.125C2.5 6.875 3.625 5.625 5 5.625C6.375 5.625 7.5 6.875 7.5 8.125" stroke="#191919" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="flow-node__row-content">
                {data.segmentOverline && (
                  <span className="flow-node__row-overline">{data.segmentOverline}</span>
                )}
                <span className="flow-node__row-text">{data.segmentLabel || 'Самые прибыльные клиенты'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right source handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="flow-handle"
      />
    </div>
  );
}
