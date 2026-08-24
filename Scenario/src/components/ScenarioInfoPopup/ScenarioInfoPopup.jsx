import { Modal } from '@ds/components/Modal';
import { Tag } from '@ds/components/Tag';
import { Button } from '@ds/components/Button';
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
/*  ScenarioInfoPopup — Figma «Popup» (22116:353003)                   */
/*                                                                     */
/*  Header and footer are local markup rather than DS ModalHeader /    */
/*  ModalFooter: the design uses the "Title Left" header variant — one */
/*  56px row, left-aligned 18/22 title, badge pushed right, no close   */
/*  cross — while the DS components implement a different variant      */
/*  (two rows, a 24/30 centred title and a cross). The DS Modal shell  */
/*  still provides the overlay, Escape/overlay close and animation.    */
/* ------------------------------------------------------------------ */
export default function ScenarioInfoPopup({ name, description, status, statusLabel, onClose }) {
  const tagClass = popupTagClassMap[status] || popupTagClassMap.draft;

  return (
    <Modal
      isOpen
      onClose={onClose}
      className="scenario-info"
      header={
        <div className="scenario-info__header">
          <h2 className="scenario-info__title ts-600-l">О сценарии</h2>
          <Tag size="m" className={tagClass}>{statusLabel}</Tag>
        </div>
      }
      footer={
        <div className="scenario-info__footer">
          <Button variant="primary" onClick={onClose}>Закрыть</Button>
        </div>
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
