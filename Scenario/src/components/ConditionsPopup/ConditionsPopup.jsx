import { Modal } from '@ds/components/Modal';
import { Cross } from '@ds/icons';
import './ConditionsPopup.css';

/* ------------------------------------------------------------------ */
/*  ConditionsPopup — Figma «Условия» (23868:132286)                   */
/*                                                                     */
/*  Every condition of a «Условие» block, opened from «Показать все»   */
/*  on the read-only scenario view.                                    */
/*                                                                     */
/*  Header is local markup rather than the DS ModalHeader: the design   */
/*  uses one 56px row with a centred 18/22 title, a close cross and a   */
/*  divider, while the DS component implements a different variant (a   */
/*  64px navigation row plus a separate 24/30 title block). Same reason */
/*  ScenarioInfoPopup hand-rolls its header. The DS Modal shell still   */
/*  gives the 480px panel, the overlay, Escape/overlay close and the    */
/*  animation.                                                          */
/* ------------------------------------------------------------------ */
export default function ConditionsPopup({ items = [], onClose }) {
  return (
    <Modal
      isOpen
      onClose={onClose}
      className="conditions-popup"
      header={
        <div className="conditions-popup__header">
          <h2 className="conditions-popup__title ts-600-l">Все условия</h2>
          <button
            type="button"
            className="conditions-popup__close hoverOpacity"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <span className="ds-icon ds-icon--24">
              <Cross />
            </span>
          </button>
        </div>
      }
    >
      {items.map((item, i) => (
        // Conditions have no stable id by the time they reach the view — the
        // snapshot keeps them as parallel label/overline arrays — so the index
        // is the key. The list is read-only and never reorders.
        <div key={i} className="conditions-popup__cell">
          {item.overline && (
            <span className="conditions-popup__overline ts-400-s">{item.overline}</span>
          )}
          <span className="conditions-popup__value ts-500-l">{item.label}</span>
        </div>
      ))}
    </Modal>
  );
}
