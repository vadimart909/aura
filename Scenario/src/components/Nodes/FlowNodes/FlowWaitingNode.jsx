import NodeWaitingCard from '../NodeWaitingCard';
import { useNodeFieldError } from '../../../context/NodeErrorsContext';

/**
 * FlowWaitingNode — нода «Ожидание» для React Flow.
 * Рендерит NodeWaitingCard. Порты отрисовываются внутри карточки
 * компонентом <Ports> (позиционированы на границе блока по дизайну).
 * data: { title, showError, showActions, waitingLabel, state, onClick }
 */
export default function FlowWaitingNode({ id, data }) {
  const fieldError = useNodeFieldError(id);
  return (
    <div className="flow-node flow-node--waiting">
      <NodeWaitingCard
        title={data.title}
        showError={Boolean(data.showError) || fieldError}
        showActions={data.showActions}
        waitingLabel={data.waitingLabel}
        state={data.state}
        onClick={data.onClick}
        onDelete={data.onDelete}
      />
    </div>
  );
}
