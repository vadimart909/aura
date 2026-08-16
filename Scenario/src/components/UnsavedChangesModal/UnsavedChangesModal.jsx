import { Modal, ModalHeader } from '@ds/components/Modal';
import './UnsavedChangesModal.css';

/* ---- Exit icon (Stroked 2px / Exit) ---- */
function ExitIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17L21 12L16 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Modal: "Данные не сохранятся. Выйти?"
 *
 * @param {Object}   props
 * @param {Function} props.onExit   — callback when user confirms exit
 * @param {Function} props.onCancel — callback when user cancels (stays on page)
 */
export default function UnsavedChangesModal({ onExit, onCancel }) {
  return (
    <Modal
      isOpen
      onClose={onCancel}
      header={<ModalHeader variant="empty" />}
      className="unsaved-modal"
    >
      {/* Message */}
      <div className="unsaved-dialog__text-wrapper">
        <span className="unsaved-dialog__message ts-400-m">
          Данные не сохранятся. Выйти?
        </span>
      </div>

      {/* Exit button */}
      <div className="unsaved-dialog__content">
        <button
          type="button"
          className="unsaved-dialog__exit-btn"
          onClick={onExit}
        >
          <span className="unsaved-dialog__exit-icon">
            <ExitIcon />
          </span>
          <span className="unsaved-dialog__exit-label ts-500-m">Выйти без сохранения</span>
        </button>
      </div>

      {/* Divider */}
      <div className="unsaved-dialog__divider" />

      {/* Cancel button */}
      <div className="unsaved-dialog__footer">
        <button
          type="button"
          className="unsaved-dialog__cancel-btn"
          onClick={onCancel}
        >
          <span className="unsaved-dialog__cancel-label ts-500-m">Отмена</span>
        </button>
      </div>
    </Modal>
  );
}
