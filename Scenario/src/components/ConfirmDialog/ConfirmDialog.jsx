import { Modal } from '@ds/components/Modal';
import './ConfirmDialog.css';

/**
 * Small 320px dialog: a message, then either one accented action row or a
 * list of named options, and «Отмена».
 *
 * The tone only ever changes the action row's colour — everything else
 * (panel, paddings, divider, cancel row) is shared, which is why this lives
 * in one component instead of being copied per call site.
 *
 * @param {Object}   props
 * @param {string}   props.message      — question shown at the top
 * @param {string}   [props.confirmLabel] — label of the accented action row (single-action mode)
 * @param {React.ReactNode} [props.confirmIcon] — 24px icon for that row
 * @param {'brand'|'error'} [props.tone='brand'] — action row colour
 * @param {Function} [props.onConfirm]  — action row click (single-action mode)
 * @param {Array<{label: string, description?: string, onClick: Function}>} [props.options]
 *   — renders a titled+described row per entry instead of the single action
 *   row, for a "pick one of several ways" dialog. Mutually exclusive with
 *   confirmLabel/confirmIcon/tone/onConfirm.
 * @param {Function} props.onCancel     — «Отмена», Escape and overlay click
 */
export default function ConfirmDialog({
  message,
  confirmLabel,
  confirmIcon,
  tone = 'brand',
  onConfirm,
  options,
  onCancel,
}) {
  return (
    <Modal
      isOpen
      onClose={onCancel}
      /* No header in the design — the dialog opens straight into the message */
      className="confirm-dialog"
    >
      {/* Message */}
      <div className="confirm-dialog__text-wrapper">
        <span className="confirm-dialog__message ts-400-m">{message}</span>
      </div>

      <div className="confirm-dialog__content">
        {options ? (
          options.map((option) => (
            <button
              key={option.label}
              type="button"
              className="confirm-dialog__option-btn"
              onClick={option.onClick}
            >
              <span className="confirm-dialog__option-label ts-500-m">{option.label}</span>
              {option.description && (
                <span className="confirm-dialog__option-description ts-400-s">
                  {option.description}
                </span>
              )}
            </button>
          ))
        ) : (
          <button
            type="button"
            className={`confirm-dialog__action-btn confirm-dialog__action-btn--${tone}`}
            onClick={onConfirm}
          >
            {confirmIcon && (
              <span className="confirm-dialog__action-icon ds-icon ds-icon--m">
                {confirmIcon}
              </span>
            )}
            <span className="confirm-dialog__action-label ts-500-m">{confirmLabel}</span>
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="confirm-dialog__divider" />

      {/* Cancel */}
      <div className="confirm-dialog__footer">
        <button
          type="button"
          className="confirm-dialog__cancel-btn"
          onClick={onCancel}
        >
          <span className="confirm-dialog__cancel-label ts-500-m">Отмена</span>
        </button>
      </div>
    </Modal>
  );
}
