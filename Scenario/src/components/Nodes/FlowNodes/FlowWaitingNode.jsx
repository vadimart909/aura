import NodeWaitingCard from '../NodeWaitingCard';

/**
 * FlowWaitingNode — нода «Ожидание» для React Flow.
 * Рендерит NodeWaitingCard. Порты отрисовываются внутри карточки
 * компонентом <Ports> (позиционированы на границе блока по дизайну).
 * data: { title, showError, showActions, waitingLabel, state, onClick }
 */
export default function FlowWaitingNode({ data }) {
  return (
    <div className="flow-node flow-node--waiting">
      <NodeWaitingCard
        title={data.title}
        showError={data.showError}
        showActions={data.showActions}
        waitingLabel={data.waitingLabel}
        state={data.state}
        onClick={data.onClick}
      />
    </div>
  );
}
