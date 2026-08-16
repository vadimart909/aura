import NodeCommunicationCard from '../NodeCommunicationCard';

/**
 * FlowCommunicationNode — нода «Коммуникация» для React Flow.
 * Рендерит NodeCommunicationCard. Порты отрисовываются внутри карточки
 * компонентом <Ports> (позиционированы на границе блока по дизайну).
 * data: { title, showError, showActions, state, onClick }
 */
export default function FlowCommunicationNode({ data }) {
  return (
    <div className="flow-node flow-node--communication">
      <NodeCommunicationCard
        title={data.title}
        showError={data.showError}
        showActions={data.showActions}
        templateTitle={data.templateTitle}
        templateDescription={data.templateDescription}
        state={data.state}
        onClick={data.onClick}
      />
    </div>
  );
}
