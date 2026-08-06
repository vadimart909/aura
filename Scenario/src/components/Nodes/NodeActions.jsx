import './NodeActions.css';

import iconTrash from './icons/icon-trash.svg';

/**
 * NodeActions — панель действий над нодой (удалить).
 * Показывается при ховере на карточке (управляется CSS родителя).
 *
 * @param {object}   props
 * @param {function} [props.onDelete]    — callback при клике «Удалить»
 * @param {string}   [props.className]
 */
export default function NodeActions({
  onDelete,
  className = '',
}) {
  return (
    <div className={`node-actions ${className}`.trim()}>
      <button
        type="button"
        className="node-actions__btn"
        onClick={onDelete}
        aria-label="Удалить"
      >
        <img src={iconTrash} alt="" width="16" height="16" />
      </button>
    </div>
  );
}
