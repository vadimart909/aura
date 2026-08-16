import { Modal, ModalFooter, ModalHeader } from '@ds/components/Modal';
import { Tag } from '@ds/components/Tag';
import './ScenarioInfoPopup.css';

/* ------------------------------------------------------------------ */
/*  Status → tag CSS-class mapping                                     */
/* ------------------------------------------------------------------ */
const popupTagClassMap = {
  draft: 'tag--status-grey',
  published: 'tag--status-purple',
  started: 'tag--status-yellow',
  stopped: 'tag--status-red',
  finishing: 'tag--status-red',
};

/* ------------------------------------------------------------------ */
/*  ScenarioInfoPopup                                                  */
/* ------------------------------------------------------------------ */
export default function ScenarioInfoPopup({ name, description, status, statusLabel, onClose }) {
  const tagClass = popupTagClassMap[status] || popupTagClassMap.draft;

  return (
    <Modal
      isOpen
      onClose={onClose}
      header={
        <ModalHeader
          title={
            <span className="scenario-info__header-row">
              <span className="ts-500-m">О сценарии</span>
              <Tag size="s" className={tagClass}>{statusLabel}</Tag>
            </span>
          }
          onClose={onClose}
        />
      }
      footer={
        <ModalFooter
          layout="1-button"
          primaryAction={{ label: 'Закрыть', isSelected: true, onClick: onClose }}
        />
      }
    >
      <div className="scenario-info__cell">
        <span className="scenario-info__name ts-500-l">{name}</span>
        {description && (
          <span className="scenario-info__description ts-400-s">{description}</span>
        )}
      </div>
    </Modal>
  );
}
