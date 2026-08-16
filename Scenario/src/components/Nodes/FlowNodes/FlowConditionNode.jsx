import NodeConditionCard from '../NodeConditionCard';

/**
 * FlowConditionNode — нода «Условие» для React Flow.
 * Рендерит NodeConditionCard. Порты отрисовываются внутри карточки
 * компонентом <Ports> (позиционированы на границе блока по дизайну).
 * data: { title, conditions, conditionLabels, conditionOverlines, showShowAll, showError, showActions, state, onClick }
 */
export default function FlowConditionNode({ data }) {
  return (
    <div className="flow-node flow-node--condition">
      <NodeConditionCard
        title={data.title}
        conditions={data.conditions}
        conditionLabels={data.conditionLabels}
        conditionOverlines={data.conditionOverlines}
        showShowAll={data.showShowAll}
        showError={data.showError}
        showActions={data.showActions}
        state={data.state}
        onClick={data.onClick}
      />
    </div>
  );
}
