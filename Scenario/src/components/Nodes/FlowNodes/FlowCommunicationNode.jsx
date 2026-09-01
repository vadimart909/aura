import NodeCommunicationCard from '../NodeCommunicationCard';
import { useNodeFieldError } from '../../../context/NodeErrorsContext';

/**
 * FlowCommunicationNode — нода «Коммуникация» для React Flow.
 * Рендерит NodeCommunicationCard. Порты отрисовываются внутри карточки
 * компонентом <Ports> (позиционированы на границе блока по дизайну).
 * data: { title, showActions, state, onClick }
 */
export default function FlowCommunicationNode({ id, data }) {
  const fieldError = useNodeFieldError(id);
  return (
    <div className="flow-node flow-node--communication">
      <NodeCommunicationCard
        title={data.title}
        showError={fieldError}
        showActions={data.showActions}
        type={data.communicationType}
        templateTitle={data.templateTitle}
        templateDescription={data.templateDescription}
        state={data.state}
        onClick={data.onClick}
        onDelete={data.onDelete}
      />
    </div>
  );
}
