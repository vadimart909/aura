import NodeStartCard from '../NodeStartCard';
import { useNodeFieldError } from '../../../context/NodeErrorsContext';

/**
 * FlowStartNode — нода «Старт» для React Flow.
 * Рендерит NodeStartCard. Порт отрисовывается внутри карточки
 * компонентом <Ports> (позиционирован на границе блока по дизайну).
 * data: { title, showTrigger, showSchedule, showScheduleDays, showSegment, showError,
 *         triggerLabel, segmentLabel, scheduleLabel, scheduleOverline, scheduleDescription,
 *         scheduleDaysLabel, scheduleDaysOverline, state, onClick }
 */
export default function FlowStartNode({ id, data }) {
  const fieldError = useNodeFieldError(id);
  return (
    <div className="flow-node flow-node--start">
      <NodeStartCard
        title={data.title}
        showTrigger={data.showTrigger}
        showSchedule={data.showSchedule}
        showScheduleDays={data.showScheduleDays}
        showSegment={data.showSegment}
        showError={Boolean(data.showError) || fieldError}
        triggerLabel={data.triggerLabel}
        segmentLabel={data.segmentLabel}
        scheduleLabel={data.scheduleLabel}
        scheduleOverline={data.scheduleOverline}
        scheduleDescription={data.scheduleDescription}
        scheduleDaysLabel={data.scheduleDaysLabel}
        scheduleDaysOverline={data.scheduleDaysOverline}
        state={data.state}
        onClick={data.onClick}
      />
    </div>
  );
}
